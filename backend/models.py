from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional
from datetime import datetime

class NewsInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

class AnalysisHighlight(BaseModel):
    text: str
    reason: str
    severity: str  # 'low', 'medium', 'high'

class AnalysisResult(BaseModel):
    status: str  # 'REAL', 'FAKE', 'MISLEADING'
    confidence_score: float
    reasoning: str
    highlights: List[AnalysisHighlight]
    title: Optional[str] = None
    author: Optional[str] = None
    source: Optional[str] = None
    trust_score: Optional[float] = None

class DetailedAnalysis(BaseModel):
    truth_reason: str
    bias_reason: str
    clickbait_reason: str

class RealityScoreResult(BaseModel):
    truth_score: int
    bias_score: int
    clickbait_score: int
    risk_level: str  # 'Low' | 'Medium' | 'High'
    summary: str
    detailed_analysis: DetailedAnalysis

class User(BaseModel):
    username: str
    email: str
    hashed_password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class HistoryResult(BaseModel):
    """Lightweight result model used in history — no highlights required."""
    status: str
    confidence_score: float
    reasoning: Optional[str] = None
    title: Optional[str] = None
    trust_score: Optional[float] = None

class HistoryEntry(BaseModel):
    id: str
    user: str
    input_type: str
    input_content: str
    result: HistoryResult
    timestamp: datetime
