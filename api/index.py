from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from models import NewsInput, AnalysisResult, RealityScoreResult, HistoryEntry, HistoryResult, UserCreate, Token
from scraper import scrape_article
from ai_service import analyze_news
from reality_engine import reality_engine
from typing import List, Optional
import os
from datetime import datetime, timedelta
import httpx
from database import init_db, get_db, UserDB, HistoryDB
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session
import logging
import json

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Auth configuration
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext

app = FastAPI(title="TruthLens AI API")

# Initialize DB
init_db()

@app.middleware("http")
async def strip_api_prefix(request, call_next):
    if request.scope["path"].startswith("/api/"):
        request.scope["path"] = request.scope["path"][4:]
    elif request.scope["path"] == "/api":
        request.scope["path"] = "/"
    return await call_next(request)

# Production CORS - Allow specific origins from ENV
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "TruthLens AI API",
        "version": "1.0.0",
        "database": "connected"
    }

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

@app.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    username = user.username.strip()
    email = user.email.strip().lower()

    if not username or not email or not user.password:
        raise HTTPException(status_code=400, detail="Username, email, and password are required")

    existing_username = db.query(UserDB).filter(UserDB.username == username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already registered")

    existing_email = db.query(UserDB).filter(UserDB.email == email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = get_password_hash(user.password)
    new_user = UserDB(username=username, email=email, hashed_password=hashed)
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already registered")
    except SQLAlchemyError as exc:
        db.rollback()
        logger.exception("Registration database error: %s", exc)
        raise HTTPException(status_code=503, detail="Registration database is not available. Check DATABASE_URL in Vercel.")
    return {"message": "User created successfully"}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = jwt.encode({"sub": user.username}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(UserDB).filter(UserDB.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user.username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/analyze", response_model=AnalysisResult)
async def analyze(input_data: NewsInput, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    if not input_data.url and not input_data.text:
        raise HTTPException(status_code=400, detail="Please provide either a URL or text to analyze.")
    
    text_to_analyze = ""
    title = "Unknown Article"
    
    if input_data.url:
        target_url = input_data.url
        if not target_url.startswith(('http://', 'https://')):
            target_url = 'https://' + target_url
            
        scraped = scrape_article(target_url)
        if not scraped:
            raise HTTPException(status_code=400, detail="Failed to scrape URL")
        text_to_analyze = scraped['text']
        title = scraped['title']
    else:
        text_to_analyze = input_data.text

    result = await analyze_news(text_to_analyze, title=title)
    result.title = title
    
    # Simple trust score simulation
    if input_data.url:
        url_str = str(input_data.url).lower()
        if any(d in url_str for d in ["bbc.com", "reuters.com", "nytimes.com", "apnews.com"]):
            result.trust_score = 95.0
        elif any(d in url_str for d in ["cnn.com", "foxnews.com", "theguardian.com"]):
            result.trust_score = 80.0
        else:
            result.trust_score = 45.0
    
    # Save to SQLite History
    history_item = HistoryDB(
        username=current_user,
        input_type="url" if input_data.url else "text",
        input_content=str(input_data.url) if input_data.url else input_data.text[:100],
        status=result.status,
        confidence_score=result.confidence_score,
        reasoning=result.reasoning,
        title=result.title,
        trust_score=result.trust_score,
        search_references=json.dumps(result.search_references) if result.search_references else None
    )
    db.add(history_item)
    db.commit()
    return result

@app.post("/analyze/reality", response_model=RealityScoreResult)
async def analyze_reality(input_data: NewsInput, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    if not input_data.url and not input_data.text:
        raise HTTPException(status_code=400, detail="Please provide either a URL or text to analyze.")
    
    text_to_analyze = ""
    title = "Deep Fact-Check"
    if input_data.url:
        target_url = input_data.url
        if not target_url.startswith(('http://', 'https://')):
            target_url = 'https://' + target_url
            
        scraped = scrape_article(target_url)
        if not scraped:
            raise HTTPException(status_code=400, detail="Failed to scrape URL")
        text_to_analyze = scraped['text']
        title = scraped.get('title', 'Deep Fact-Check')
    else:
        text_to_analyze = input_data.text

    result = await reality_engine.analyze(text_to_analyze)

    # Save to history — map risk level to status
    status_map = {"Low": "REAL", "Medium": "MISLEADING", "High": "FAKE"}
    history_item = HistoryDB(
        username=current_user,
        input_type="url" if input_data.url else "text",
        input_content=str(input_data.url) if input_data.url else input_data.text[:100],
        status=status_map.get(result.risk_level, "MISLEADING"),
        confidence_score=float(result.truth_score),
        reasoning=result.summary,
        title=title,
        trust_score=None
    )
    db.add(history_item)
    db.commit()

    return result

@app.get("/history", response_model=List[HistoryEntry])
async def get_history(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(HistoryDB).filter(HistoryDB.username == current_user).order_by(HistoryDB.timestamp.desc()).all()
    
    # Map DB models to Pydantic models
    response = []
    for item in items:
        response.append({
            "id": item.id,
            "user": item.username,
            "input_type": item.input_type,
            "input_content": item.input_content,
            "result": {
                "status": item.status,
                "confidence_score": item.confidence_score,
                "reasoning": item.reasoning,
                "title": item.title,
                "trust_score": item.trust_score,
                "search_references": json.loads(item.search_references) if item.search_references else None
            },
            "timestamp": item.timestamp
        })
    return response

@app.delete("/history/{item_id}")
async def delete_history_item(item_id: str, current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(HistoryDB).filter(HistoryDB.id == item_id, HistoryDB.username == current_user).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}

@app.delete("/history")
async def clear_history(current_user: str = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(HistoryDB).filter(HistoryDB.username == current_user).delete()
    db.commit()
    return {"message": "History cleared"}

@app.get("/trending")
async def get_trending():
    return [
        {"title": "NASA discovers life on Mars", "status": "MISLEADING", "summary": "Old footage circulating as new discovery.", "source": "MarsToday.net"},
        {"title": "Free $500 Amazon Gift Cards", "status": "FAKE", "summary": "Phishing scam spreading via social media.", "source": "ViralDeals.com"},
        {"title": "New coffee driving law in Oregon", "status": "MISLEADING", "summary": "Misinterpretation of distracted driving law.", "source": "TrafficAlert.org"}
    ]

# Production-Ready News Feed with Caching
news_cache = {
    "data": [],
    "last_updated": None,
    "category": "technology"
}

@app.get("/news")
async def get_real_news(category: str = "technology"):
    
    # Simple Caching Logic (15 minutes)
    now = datetime.now()
    if (news_cache["last_updated"] and 
        news_cache["category"] == category and 
        now - news_cache["last_updated"] < timedelta(minutes=15)):
        return news_cache["data"]

    try:
        async with httpx.AsyncClient() as client:
            # Using saurav.tech mirror as a stable free alternative to NewsAPI
            url = f"https://saurav.tech/NewsAPI/top-headlines/category/{category}/us.json"
            response = await client.get(url, timeout=10.0)
            data = response.json()
            articles = data.get("articles", [])[:15]
            
            # Clean up articles and add a 'trust_hint' for the UI
            refined_articles = []
            for art in articles:
                if not art.get('title') or not art.get('url'): continue
                
                # Add a simulated 'trust_score' based on source reputation
                source_name = art.get('source', {}).get('name', '').lower()
                trust_hint = 90 if any(s in source_name for s in ["reuters", "bbc", "ap", "nytimes", "techcrunch"]) else 75
                
                refined_articles.append({
                    "title": art['title'],
                    "description": art.get('description', ''),
                    "url": art['url'],
                    "urlToImage": art.get('urlToImage'),
                    "source": art['source'],
                    "publishedAt": art.get('publishedAt'),
                    "trust_hint": trust_hint
                })

            # Update Cache
            news_cache["data"] = refined_articles
            news_cache["last_updated"] = now
            news_cache["category"] = category
            
            return refined_articles

    except Exception as e:
        logger.error(f"Error fetching news: {e}")
        # Robust Fallback Data
        return [
            {
                "title": "AI Regulation Bill Passes Key Vote in Senate",
                "description": "New legislation aims to balance innovation with safety and transparency in AI development.",
                "url": "https://example.com/ai-regulation",
                "urlToImage": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
                "source": {"name": "TechWatch"},
                "trust_hint": 85
            },
            {
                "title": "Quantum Computing Breakthrough: 1000 Qubit Milestone Reached",
                "description": "Researchers announce a significant step towards error-corrected quantum computers.",
                "url": "https://example.com/quantum",
                "urlToImage": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
                "source": {"name": "ScienceDaily"},
                "trust_hint": 92
            }
        ]


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
