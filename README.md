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
| **Deployment** | Vercel (Serverless Functions + Static Hosting) |
| **AI Models** | BERT (`mrm8488/bert-tiny`), RoBERTa (`hamzab/roberta-fake-news`), OpenAI GPT-4o |
| **Database** | SQLite (Local) / External SQL (Recommended for Production) |
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

### 2. Installation
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the root:
```env
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=your_super_secret_jwt_key
SERPER_API_KEY=your_serper_api_key_here
```

### 4. Run the Project Locally
```bash
# Terminal 1: Backend
uvicorn api.index:app --reload

# Terminal 2: Frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🚀

---

## 📁 Project Structure

```
truthlens-ai/
├── api/                  # FastAPI Backend (Vercel Functions)
│   ├── index.py          # Entry point
│   ├── ai_service.py     # Ensemble logic
│   ├── reality_engine.py # Fact-check engine
│   └── ...
├── src/                  # React Frontend
│   ├── components/
│   ├── pages/
│   └── context/
├── public/               # Static assets
├── vercel.json           # Vercel deployment config
├── package.json          # Node dependencies
├── requirements.txt      # Python dependencies
└── README.md
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register` | Create new user |
| `POST` | `/api/token` | Login, get JWT token |
| `POST` | `/api/analyze` | Analyze article (Ensemble) |
| `POST` | `/api/analyze/reality` | Deep Fact-Check |
| `GET` | `/api/news` | Live news feed |
| `GET` | `/api/history` | User's analysis history |

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

Made with ❤️ by [dmp36](https://github.com/dmp36)
