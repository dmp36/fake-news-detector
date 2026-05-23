import os
import json
import re
from typing import Dict, Any
from openai import OpenAI
from dotenv import load_dotenv
from .models import RealityScoreResult, DetailedAnalysis

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class RealityScoreEngine:
    def __init__(self):
        self.clickbait_keywords = [
            "shocking", "you won't believe", "breaking truth", "miracle", 
            "secret", "exposed", "must see", "game changer", "won't tell you"
        ]

    def _calculate_risk_level(self, truth_score: int, bias_score: int, clickbait_score: int) -> str:
        """
        Logic:
        - If truth_score < 40 → High Risk
        - If bias_score > 70 OR clickbait_score > 70 → Medium to High Risk
        - Otherwise → Low Risk
        """
        if truth_score < 40:
            return "High"
        elif bias_score > 70 or clickbait_score > 70:
            return "High" if (bias_score > 85 or clickbait_score > 85) else "Medium"
        else:
            return "Low"

    def _preprocess_text(self, text: str) -> str:
        # Simple noise removal
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    async def analyze(self, text: str) -> RealityScoreResult:
        processed_text = self._preprocess_text(text)
        
        prompt = f"""
        Analyze the following news content and evaluate its credibility based on three dimensions:
        1. TRUTH SCORE (0-100): Evaluate factual consistency, detect false claims, lack of evidence, or unsupported statements. Higher is more factual.
        2. BIAS SCORE (0-100): Detect political bias, emotional language, or one-sided opinions. Higher is more biased.
        3. CLICKBAIT SCORE (0-100): Detect sensational phrases, emotional triggers, or exaggeration (e.g., "Shocking", "You won't believe"). Higher is more clickbait.

        Content:
        \"\"\"{processed_text[:3000]}\"\"\"

        Return ONLY a JSON object in this format:
        {{
            "truth_score": 0-100,
            "bias_score": 0-100,
            "clickbait_score": 0-100,
            "summary": "short explanation of the findings",
            "detailed_analysis": {{
                "truth_reason": "why this truth score was given",
                "bias_reason": "why this bias score was given",
                "clickbait_reason": "why this clickbait score was given"
            }}
        }}
        """

        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "system", 
                        "content": "You are an expert AI/NLP engineer specializing in news credibility analysis. Provide objective, data-driven scoring."
                    },
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )

            result_data = json.loads(response.choices[0].message.content)
            
            # Calculate Risk Level based on LLM scores
            risk_level = self._calculate_risk_level(
                result_data["truth_score"],
                result_data["bias_score"],
                result_data["clickbait_score"]
            )
            
            result_data["risk_level"] = risk_level
            
            return RealityScoreResult(**result_data)

        except Exception as e:
            print(f"Error in Reality Score Engine (LLM): {e}")
            return self._rule_based_fallback(processed_text)

    def _rule_based_fallback(self, text: str) -> RealityScoreResult:
        """Rule-based scoring fallback when LLM fails."""
        text_lower = text.lower()
        
        # Calculate Clickbait Score
        cb_count = sum(1 for word in self.clickbait_keywords if word in text_lower)
        clickbait_score = min(100, cb_count * 20 + (30 if "!" in text else 0))
        
        # Calculate Bias Score (Simplified)
        bias_keywords = ["unbelievable", "shocking", "must see", "exposed", "truth", "agenda"]
        bias_count = sum(1 for word in bias_keywords if word in text_lower)
        bias_score = min(100, bias_count * 15 + (20 if "?" in text else 0))
        
        # Calculate Truth Score (Heuristic)
        # More words + less clickbait usually = more "effort" at truth
        word_count = len(text.split())
        truth_score = max(0, min(90, (word_count / 10) - (clickbait_score / 2)))
        if word_count < 20: truth_score = 30 # Too short to be reliable
        
        risk_level = self._calculate_risk_level(int(truth_score), int(bias_score), int(clickbait_score))
        
        return RealityScoreResult(
            truth_score=int(truth_score),
            bias_score=int(bias_score),
            clickbait_score=int(clickbait_score),
            risk_level=risk_level,
            summary="[FALLBACK] Analysis performed using rule-based heuristics due to API unavailability.",
            detailed_analysis=DetailedAnalysis(
                truth_reason="Factual consistency estimated based on content depth and structure.",
                bias_reason="Bias detected via emotional sentiment and keyword intensity.",
                clickbait_reason="Clickbait flagged based on sensationalist triggers and punctuation."
            )
        )

# Singleton instance
reality_engine = RealityScoreEngine()
