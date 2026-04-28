# 🛡️ TruthLens AI — Fake News Detector

A production-ready, full-stack AI-powered fake news detection platform using a **Multi-Model Voting Ensemble** (BERT + RoBERTa + GPT-4o).

![TruthLens AI](https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

- 🗳️ **Multi-Model Voting** — BERT, RoBERTa, and GPT-4o vote together for maximum accuracy
- 📰 **Live News Feed** — Real-time headlines across 5 categories (Tech, Science, Business, Health, Entertainment)
- 🔍 **Deep Fact-Check Engine** — Reality Score with Truth, Bias, and Clickbait metrics
- 🕒 **Analysis History** — Full per-user history with delete support
- 🔐 **JWT Authentication** — Secure login/register with bcrypt password hashing
- 📱 **Responsive Design** — Mobile-first glassmorphism UI
- ⚡ **News Caching** — 15-minute intelligent caching to reduce API calls
- 🏷️ **Source Trust Scores** — Reputation-based trust badges on each article

---

## 🧠 AI Architecture

```
User Input (URL or Text)
        │
        ▼
┌───────────────────┐
│  BERT Classifier  │ ──── Vote: REAL / FAKE
└───────────────────┘
        │
┌───────────────────┐
│ RoBERTa Classifier│ ──── Vote: REAL / FAKE
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  GPT-4o (Judge)   │ ──── Final Verdict + Reasoning
└───────────────────┘
        │
        ▼
   Result + Confidence Score
```

If GPT-4o is unavailable, the system **auto-falls back** to majority vote between BERT and RoBERTa.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, Framer Motion |
| **Backend** | FastAPI, Python 3.11+ |
| **AI Models** | BERT (`mrm8488/bert-tiny`), RoBERTa (`hamzab/roberta-fake-news`), OpenAI GPT-4o |
| **Database** | SQLite via SQLAlchemy |
| **Auth** | JWT (python-jose), bcrypt (passlib) |
| **Scraping** | httpx, BeautifulSoup4, newspaper3k |

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API Key

### 1. Clone the Repository
```bash
git clone https://github.com/dmp36/fake-news-detector.git
cd fake-news-detector
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create `backend/.env`:
```env
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_super_secret_jwt_key
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:8000
```

### 4. Run the Project

**Backend:**
```bash
cd backend
venv\Scripts\activate
python main.py
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🚀

---

## 📁 Project Structure

```
fake-news-detector/
├── backend/
│   ├── main.py           # FastAPI app, all routes
│   ├── ai_service.py     # Multi-Model Voting Ensemble
│   ├── reality_engine.py # Deep Fact-Check Engine
│   ├── models.py         # Pydantic schemas
│   ├── database.py       # SQLAlchemy models + SQLite
│   ├── scraper.py        # Article scraper
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx
│       │   ├── History.tsx
│       │   ├── Login.tsx
│       │   └── Register.tsx
│       ├── components/
│       │   ├── Analyzer.tsx    # Main analysis UI
│       │   ├── NewsFeed.tsx    # Live news with categories
│       │   ├── Navbar.tsx      # Global navigation
│       │   ├── Trending.tsx    # Trending fake news
│       │   └── ErrorBoundary.tsx
│       └── context/
│           └── AuthContext.tsx
│
└── README.md
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Create new user |
| `POST` | `/token` | Login, get JWT token |
| `POST` | `/analyze` | Analyze article (Ensemble) |
| `POST` | `/analyze/reality` | Deep Fact-Check |
| `GET` | `/news?category=technology` | Live news feed |
| `GET` | `/history` | User's analysis history |
| `DELETE` | `/history/{id}` | Delete history item |
| `GET` | `/trending` | Trending fake news |
| `GET` | `/docs` | Interactive API docs (Swagger) |

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

Made with ❤️ by [dmp36](https://github.com/dmp36)
