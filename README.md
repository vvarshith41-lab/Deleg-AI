# AI TASK DELEGATOR — Adaptive Team Task Assignment System

An intelligent, lightweight task assignment platform designed for small business owners to delegate tasks based on employee strengths. The system analyzes raw task requirements, identifies required skills, provides explainable employee recommendations, and continuously updates employee skill and performance scores from real feedback without retraining any machine learning models.

---

## 🚀 Project Overview & Purpose

Small business managers often face bottlenecks when delegating operational tasks:
1. Identifying what specific skills are actually needed for a task.
2. Knowing who on the team is best suited and currently available.
3. Updating employee capability profiles over time as their skills evolve.

**AI Task Delegator** solves this with:
- **AI Task Decomposition**: Transforms unstructured task descriptions into structured skill requirements, categories, and difficulty metrics.
- **Explainable Recommendation Engine**: Matches tasks using a transparent, weighted formula (60% Skill Match + 25% Past Performance + 15% Availability).
- **Online Continual Learning**: Incrementally adapts skill and performance scores using an exponential moving average (`new_score = old_score * 0.8 + feedback * 0.2`) directly from feedback, bypassing expensive model retraining.

---

## 🏗️ Architecture & High-Level Design

```
+-------------------------------------------------------------+
|                      React Frontend (Vite)                  |
|     Dashboard • Team Directory • Create Task • Feedback     |
+------------------------------+------------------------------+
                               | REST API (JSON / HTTP)
+------------------------------v------------------------------+
|                     FastAPI Backend (app)                   |
|   /employees   /tasks   /analyze-task   /recommend   /feedback   |
+--------------+---------------+--------------+---------------+
               |               |              |
+--------------v---+  +--------v-------+  +---v---------------+
| AI Task Analyzer |  | Recommendation |  | Continual Learning |
| (LLM / Heuristic)|  |    Matcher     |  | (Incremental EMA) |
+------------------+  +----------------+  +-------------------+
                               |
               +---------------v--------------+
               |  JSON File Database (data/)  |
               | (Ready to swap with SQLite)  |
               +------------------------------+
```

---

## 📁 Folder Structure

```
AI-TASK-DELEGATOR/
│
├── frontend/                     # Person 1: React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/           # UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── EmployeeCard.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── RecommendationCard.jsx
│   │   │   └── FeedbackForm.jsx
│   │   ├── pages/                # Application views
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Team.jsx
│   │   │   ├── CreateTask.jsx
│   │   │   ├── Recommendation.jsx
│   │   │   └── Feedback.jsx
│   │   ├── services/
│   │   │   └── api.js            # API client with offline demo fallbacks
│   │   ├── App.jsx               # Main container & state
│   │   ├── main.jsx              # DOM entrypoint
│   │   └── index.css             # Tailwind style imports
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                      # Person 4: FastAPI & Continual Learning
│   └── app/
│       ├── main.py               # FastAPI entrypoint & CORS config
│       ├── routes/
│       │   ├── tasks.py          # GET/POST /tasks, POST /assign
│       │   ├── employees.py      # GET/POST /employees
│       │   ├── recommendations.py# POST /analyze-task, POST /recommend
│       │   └── feedback.py       # POST /feedback, GET /analytics
│       ├── database/
│       │   ├── database.py       # Modular JSON database layer (SQLite ready)
│       │   └── seed.py           # Database reset & seed utility
│       ├── models/
│       │   ├── employee.py       # Pydantic employee schemas
│       │   ├── task.py           # Pydantic task schemas
│       │   └── performance.py    # Pydantic feedback schemas
│       └── learning/
│           └── continual_learning.py # Incremental skill adaptation
│
├── ai/                           # Person 2: AI Task Analyzer
│   ├── task_analyzer.py          # Task decomposition (LLM + demo fallback)
│   ├── prompts.py                # System & user prompt templates
│   └── schemas.py                # Task analysis data structures
│
├── recommendation/               # Person 3: Recommendation Engine
│   ├── matcher.py                # Candidate ranking & top recommendation
│   └── scoring.py                # 60/25/15 scoring formula & explainable reasons
│
├── data/                         # Sample JSON Database Records
│   ├── employees.json            # 5+ seeded employee profiles
│   ├── tasks.json                # Seeded business tasks
│   └── feedback.json             # Historical task reviews
│
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git exclusions
├── requirements.txt              # Backend dependencies
└── README.md                     # Documentation
```

---

## 👥 Team Responsibilities (Parallel Development)

| Person | Role | Focus Areas | Key Files |
| :--- | :--- | :--- | :--- |
| **Person 1** | **Frontend** | React UI, Navigation, Responsive Dashboards, State | `frontend/src/**/*` |
| **Person 2** | **AI Task Analyzer** | Prompt Engineering, Skill Extraction, LLM Integration | `ai/**/*` |
| **Person 3** | **Recommendation** | Explainable Scoring, Matching Algorithm, Ranking | `recommendation/**/*` |
| **Person 4** | **Backend & Continual Learning** | FastAPI Endpoints, Online Skill Updates, Database | `backend/**/*`, `data/*` |

---

## ⚙️ Installation & Running

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend Setup

```bash
# Navigate to project root
cd AI-TASK-DELEGATOR

# (Optional) Create and activate virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt

# Run FastAPI backend server
python -m uvicorn backend.app.main:app --reload
```
- API Health Check: `http://localhost:8000/health`
- Interactive API Docs (Swagger): `http://localhost:8000/docs`

### 2. Frontend Setup

In a new terminal window:

```bash
# Navigate to frontend folder
cd AI-TASK-DELEGATOR/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
- Frontend application runs at: `http://localhost:5173`

---

## 🧠 Continual Learning Mechanism

Instead of executing slow and resource-heavy model fine-tuning runs whenever an employee completes a task, the platform uses an **Online Incremental Bayesian-Style Update**:

$$\text{new\_score} = (\text{old\_score} \times 0.8) + (\text{feedback\_score} \times 0.2)$$

### Example:
- Prior Skill Rating: `80`
- New Task Review Rating: `100`
- Updated Skill Rating: `(80 * 0.8) + (100 * 0.2) = 84`

### Future Continual Learning Improvements
1. **Confidence-Weighted Updates**: Scale the update learning rate based on task difficulty and sample count (decaying step sizes).
2. **Multi-Skill Attribution**: Distribute overall task feedback across individual sub-skills according to the employee's contribution.
3. **Decay over Time**: Apply gentle exponential forgetting to skills that have not been practiced recently.
