import os
from openai import OpenAI
from typing import List, Dict
import json
from models import AnalysisResult, AnalysisHighlight
from dotenv import load_dotenv
from transformers import pipeline
import torch

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Initialize Models
try:
    print("Loading BERT Fake News Classifier...")
    bert_classifier = pipeline("text-classification", model="mrm8488/bert-tiny-finetuned-fake-news-detection")
    
    print("Loading RoBERTa Fake News Classifier...")
    # Using a specialized RoBERTa model for fake news
    roberta_classifier = pipeline("text-classification", model="hamzab/roberta-fake-news-classification")
    
    print("All ML Models Loaded.")
except Exception as e:
    print(f"Error loading ML models: {e}")
    bert_classifier = None
    roberta_classifier = None

async def analyze_news(text: str) -> AnalysisResult:
    # 1. Gather ML Votes
    votes = []
    ml_confidences = []
    
    truncated_text = text[:1000] # Truncate for transformer limits

    # BERT Vote
    bert_label = "UNKNOWN"
    if bert_classifier:
        try:
            res = bert_classifier(truncated_text)[0]
            # Mapping for mrm8488: LABEL_0 -> FAKE, LABEL_1 -> REAL
            label = "FAKE" if res['label'] == "LABEL_0" else "REAL"
            votes.append(label)
            ml_confidences.append(res['score'])
            bert_label = f"{label} ({res['score']*100:.1f}%)"
        except: pass

    # RoBERTa Vote
    roberta_label = "UNKNOWN"
    if roberta_classifier:
        try:
            res = roberta_classifier(truncated_text)[0]
            # Mapping for hamzab/roberta: Often 'Fake' or 'Real' directly or LABEL_0/1
            # We'll normalize to REAL/FAKE
            label = res['label'].upper()
            if "LABEL_0" in label: label = "FAKE"
            if "LABEL_1" in label: label = "REAL"
            
            votes.append(label)
            ml_confidences.append(res['score'])
            roberta_label = f"{label} ({res['score']*100:.1f}%)"
        except: pass

    # 2. LLM Reasoning with ML context
    prompt = f"""
    Analyze this news text for authenticity. 
    We have performed Multi-Model Voting using BERT and RoBERTa.
    
    ML Results:
    - BERT: {bert_label}
    - RoBERTa: {roberta_label}
    
    Text: {text[:4000]}
    
    Return a JSON object:
    {{
        "status": "REAL | FAKE | MISLEADING",
        "confidence_score": 85.5,
        "reasoning": "Explain the final verdict. Mention if the ML models disagreed and why you chose the final status.",
        "highlights": [
            {{"text": "phrase", "reason": "why", "severity": "high/medium/low"}}
        ]
    }}
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are the 'Supreme Judge' in an AI Ensemble. You receive votes from smaller ML models and must make the final call based on their results and your own reasoning."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        result_json = json.loads(response.choices[0].message.content)
        
        # If GPT is very uncertain but ML models are unanimous, we might nudge the score
        if len(set(votes)) == 1 and len(votes) >= 2:
            # Unanimous ML agreement
            if result_json['status'] == votes[0]:
                result_json['confidence_score'] = max(result_json['confidence_score'], 92.0)

        return AnalysisResult(**result_json)
    except Exception as e:
        print(f"GPT Analysis Failed: {e}")
        # Fallback to Majority Vote
        if votes:
            from collections import Counter
            majority = Counter(votes).most_common(1)[0][0]
            avg_conf = (sum(ml_confidences) / len(ml_confidences)) * 100
            
            return AnalysisResult(
                status=majority,
                confidence_score=avg_conf,
                reasoning=f"[ENSEMBLE FALLBACK] Majority vote between BERT and RoBERTa. GPT reasoning unavailable. Models consensus: {majority}.",
                highlights=[]
            )
        
        return AnalysisResult(status="MISLEADING", confidence_score=50.0, reasoning="All analysis models failed.", highlights=[])


