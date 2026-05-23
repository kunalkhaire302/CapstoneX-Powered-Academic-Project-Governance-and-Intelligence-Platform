<div align="center">

# ⚡ CapstoneX

### AI-Powered Academic Project Governance & Intelligence Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/Express.js-Node.js-green?style=for-the-badge&logo=nodedotjs" />
  <img src="https://img.shields.io/badge/FastAPI-Python-009688?style=for-the-badge&logo=fastapi" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker" />
  <img src="https://img.shields.io/badge/TypeScript-53%25-3178C6?style=for-the-badge&logo=typescript" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/CI/CD-GitHub%20Actions-2088FF?style=flat-square&logo=githubactions" />
  <img src="https://img.shields.io/badge/AI-GradientBoosting%20%7C%20TF--IDF%20%7C%20K--Means-FF6F00?style=flat-square&logo=scikit-learn" />
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%20Firebase-FFCA28?style=flat-square&logo=firebase" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" />
</p>

> A full-stack, production-grade platform that uses **machine learning** to help universities manage capstone projects — from smart team formation and AI-driven feedback, to real-time risk prediction and role-based governance for every stakeholder.

</div>

---

## 📌 Table of Contents

- [What Is CapstoneX?](#-what-is-capstonex)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [AI Intelligence Modules](#-ai-intelligence-modules)
- [Folder Structure](#-folder-structure)
- [Quick Start](#-quick-start)
- [User Roles & Access Control](#-user-roles--access-control)
- [API Overview](#-api-overview)
- [Database Design](#-database-design)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Monitoring & Observability](#-monitoring--observability)
- [Environment Variables](#-environment-variables)
- [Testing](#-testing)
- [Roadmap](#-roadmap)

---

## 🎯 What Is CapstoneX?

Managing capstone projects in a university is painful. Students struggle to find the right project topics. Mentors waste time writing repetitive feedback. Coordinators have no early warning system for at-risk teams. HODs have no visibility across departments.

**CapstoneX solves all of this in one platform.**

It is a **multi-service web application** with a dedicated **Python AI/ML microservice** that does four smart things:

| Problem | CapstoneX Solution |
|---|---|
| Students don't know what project to pick | AI recommends projects using TF-IDF + Cosine Similarity |
| No way to detect struggling teams early | ML model predicts project risk as Low / Medium / High |
| Mentors spend hours writing feedback | AI generates structured feedback automatically |
| Random team groupings lead to poor outcomes | K-Means clustering forms balanced, diverse teams |

---

## 🏗️ System Architecture

CapstoneX is a **microservices-based** platform with four independently running services that communicate over HTTP.

```mermaid
graph TB
    subgraph Client["🖥️ Client (Browser)"]
        FE["Next.js 14 Frontend<br/>Port :3000<br/>TypeScript · Tailwind · Zustand"]
    end

    subgraph BackendAPI["⚙️ Backend API Service"]
        BE["Express.js REST API<br/>Port :5000<br/>JWT + Firebase Auth · RBAC · Sequelize ORM"]
    end

    subgraph AIService["🤖 AI/ML Microservice"]
        AI["FastAPI Service<br/>Port :8000<br/>Python · scikit-learn · flan-t5"]
        M1["📌 Project Recommender<br/>TF-IDF + Cosine Similarity"]
        M2["⚠️ Risk Predictor<br/>GradientBoosting Classifier"]
        M3["💬 Feedback Generator<br/>Template + flan-t5 Transformer"]
        M4["👥 Team Formation<br/>K-Means + Diversity Balancing"]
        AI --> M1
        AI --> M2
        AI --> M3
        AI --> M4
    end

    subgraph DataLayer["🗄️ Data Layer"]
        DB["PostgreSQL 15<br/>Port :5432<br/>13 Tables · UUID PKs · JSONB"]
        PGA["pgAdmin 4<br/>Port :5050"]
    end

    subgraph DevOps["🔧 DevOps / Infrastructure"]
        DC["Docker Compose"]
        GHA["GitHub Actions CI/CD"]
        PROM["Prometheus :9090"]
        GRAF["Grafana :3001"]
    end

    FE -->|REST API calls| BE
    BE -->|ML requests| AI
    BE -->|Sequelize ORM| DB
    PGA -->|Admin UI| DB
    DC -->|Orchestrates| FE
    DC -->|Orchestrates| BE
    DC -->|Orchestrates| AI
    DC -->|Orchestrates| DB
    BE -->|Metrics export| PROM
    PROM --> GRAF
```

### Data Flow Explained

```
Browser → Next.js (SSR/CSR) → Express REST API → PostgreSQL
                                      ↓
                              FastAPI AI Service
                         (Recommendation / Risk / Feedback / Teams)
```

1. The **frontend** (Next.js 14 App Router) handles all UI, state management (Zustand), and server-side rendering.
2. The **backend** (Express.js) is the central hub — handles authentication, authorization (RBAC with 6 roles), all business logic, and routes AI-related requests to the AI service.
3. The **AI service** (FastAPI) is completely independent — it exposes REST endpoints, runs ML models, and returns predictions to the backend. It has its own Swagger docs at `/docs`.
4. **PostgreSQL** is the single source of truth — 13 tables with UUID primary keys, JSONB columns for flexible metadata, and proper indexing for fast queries.

---

## 🛠️ Tech Stack

### Frontend — `Next.js 14 + TypeScript`

| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | Full-stack React framework with SSR, SSG, and API routes |
| **TypeScript** | Type-safe code — 53% of the codebase |
| **Tailwind CSS** | Utility-first styling with responsive design |
| **Zustand** | Lightweight global state management |
| **React Query (TanStack)** | Server state, caching, and background refetching |
| **Recharts** | Data visualization (progress charts, analytics dashboards) |
| **Framer Motion** | Smooth page and component animations |

### Backend — `Express.js + Node.js`

| Technology | Purpose |
|---|---|
| **Express.js** | REST API server — handles all business logic |
| **JWT + Firebase Auth** | Dual-layer authentication — stateless tokens + Firebase identity |
| **Sequelize ORM** | Type-safe database access with migrations and seeders |
| **RBAC (6 Roles)** | Role-Based Access Control with middleware-level enforcement |
| **Rate Limiting** | Protects API endpoints from abuse and brute-force attacks |
| **Audit Logging** | Tracks every sensitive action for compliance and debugging |

### AI Service — `FastAPI + Python`

| Technology | Purpose |
|---|---|
| **FastAPI** | High-performance async Python REST API with auto Swagger docs |
| **scikit-learn** | ML models — GradientBoosting, TF-IDF, K-Means |
| **flan-t5 (optional)** | Transformer model for natural language feedback generation |
| **pytest** | Automated testing for all ML endpoints |

### Database & DevOps

| Technology | Purpose |
|---|---|
| **PostgreSQL 15** | Primary relational database |
| **Docker Compose** | One-command local setup for all 4 services |
| **GitHub Actions** | CI/CD — lint, test, deploy, and weekly ML retraining |
| **Prometheus + Grafana** | API metrics collection and real-time dashboards |
| **k6** | Load testing to verify API performance under stress |
| **Firebase Analytics** | Frontend event tracking and crash reporting |

---

## 🤖 AI Intelligence Modules

This is the most technically interesting part of the project — a separate FastAPI microservice with four ML-powered endpoints.

### 1. 📌 Project Recommendation Engine

**How it works:**
- Uses **TF-IDF (Term Frequency-Inverse Document Frequency)** to convert project descriptions into numerical vectors.
- Calculates **cosine similarity** between a student's interest profile and the project knowledge base.
- Returns a ranked list of the most relevant projects for that student.

```python
# Simplified flow
tfidf_matrix = TfidfVectorizer().fit_transform(project_descriptions)
student_vector = tfidf.transform([student_interests])
similarities = cosine_similarity(student_vector, tfidf_matrix)
top_projects = similarities.argsort()[-5:][::-1]  # Top 5 matches
```

**Why TF-IDF?** It is simple, fast, interpretable, and works very well for short domain-specific text like project titles and descriptions — without needing a GPU.

---

### 2. ⚠️ Project Risk Prediction

**How it works:**
- A **GradientBoosting Classifier** (ensemble of decision trees) is trained on historical project data.
- Input features include: submission frequency, mentor interaction count, milestone completion rate, logbook entries, and team activity scores.
- Output: 3-class label — **Low / Medium / High** risk.

```python
# Feature set used for prediction
features = [
  'logbook_entries_count',
  'days_since_last_submission',
  'milestone_completion_rate',
  'mentor_feedback_count',
  'team_activity_score'
]
model = GradientBoostingClassifier(n_estimators=100, max_depth=4)
risk_label = model.predict([student_features])  # → 'Low', 'Medium', or 'High'
```

**Why GradientBoosting?** It outperforms single decision trees and logistic regression on tabular academic data. It handles non-linear relationships between features and is resistant to overfitting with proper hyperparameter tuning.

---

### 3. 💬 AI Feedback Generator

**How it works:**
- A **template-based engine** generates structured, context-aware feedback from logbook entries and milestone data.
- Optionally integrates **flan-t5** (Google's instruction-tuned transformer) for more natural, sentence-level feedback generation.
- The backend triggers this at each mentor review cycle.

---

### 4. 👥 Smart Team Formation

**How it works:**
- **K-Means clustering** groups students based on skill vectors (programming languages known, domain interests, past grades, availability).
- A **diversity balancing** post-processing step ensures no cluster is dominated by a single skill type.
- Produces balanced teams where each member brings a different strength.

```python
# Skill-based clustering
student_skill_matrix = vectorize_skills(all_students)
kmeans = KMeans(n_clusters=num_teams, random_state=42)
cluster_labels = kmeans.fit_predict(student_skill_matrix)
balanced_teams = apply_diversity_balance(cluster_labels, students)
```

---

### 🔄 Weekly ML Retraining (CI/CD)

The `retrain.yml` GitHub Actions workflow runs every **Sunday at 2:00 AM UTC** to retrain all models on the latest project data. This keeps predictions accurate as more student data accumulates over time.

---

## 📁 Folder Structure

```
CapstoneX/
│
├── frontend/                   # Next.js 14 application
│   ├── app/                    # App Router pages & layouts
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Utilities, API clients, firebase.ts
│   ├── store/                  # Zustand global state
│   └── hooks/                  # Custom React Query hooks
│
├── backend/                    # Express.js REST API
│   ├── src/
│   │   ├── controllers/        # Route handler logic
│   │   ├── middleware/         # Auth, RBAC, rate-limit, audit
│   │   ├── models/             # Sequelize models (13 tables)
│   │   ├── routes/             # API route definitions
│   │   └── services/           # Business logic layer
│   ├── migrations/             # Database migrations
│   └── seeders/                # Test data seeds
│
├── ai-service/                 # FastAPI Python ML service
│   ├── app/
│   │   ├── routers/            # Endpoint definitions
│   │   ├── models/             # ML model loading & inference
│   │   └── schemas/            # Pydantic request/response schemas
│   └── tests/                  # pytest test suite
│
├── docs/                       # Architecture and API documentation
├── .github/workflows/          # CI/CD pipeline (ci, deploy, retrain)
├── docker-compose.yml          # Full local environment setup
├── k6-load-test.js             # API load testing scripts
├── architecture_extensions.md  # Monitoring & i18n extension plans
└── .env.example                # Required environment variable template
```

---

## 🚀 Quick Start

### Prerequisites

Make sure you have these installed:

- **Node.js 20+** — `node --version`
- **Python 3.11+** — `python --version`
- **Docker & Docker Compose** — `docker --version`
- **PostgreSQL 15+** — only needed for manual setup

---

### ✅ Option 1 — Docker Compose (Recommended)

One command starts all 4 services automatically.

```bash
# 1. Clone the repository
git clone https://github.com/kunalkhaire302/CapstoneX_AI-Powered-Academic-Project-Governance-and-Intelligence-Platform.git
cd CapstoneX_AI-Powered-Academic-Project-Governance-and-Intelligence-Platform

# 2. Copy and fill in environment variables
cp .env.example .env
# Open .env and add your PostgreSQL password, JWT secret, Firebase config, etc.

# 3. Build and start all services
docker-compose up --build

# 4. Run database migrations and seed demo data (in a new terminal)
docker exec capstonex-backend npm run db:reset

# 5. Services are now running:
# Frontend  → http://localhost:3000
# Backend   → http://localhost:5000/api/health
# AI Docs   → http://localhost:8000/docs   (Swagger UI)
# pgAdmin   → http://localhost:5050
```

---

### 🛠️ Option 2 — Manual Setup (Service by Service)

**Backend (Express.js)**
```bash
cd backend
npm install
cp ../.env.example .env          # fill in your values
npm run migrate                  # creates all 13 tables
npm run seed                     # loads demo users and projects
npm run dev                      # starts on http://localhost:5000
```

**Frontend (Next.js)**
```bash
cd frontend
npm install
npm run dev                      # starts on http://localhost:3000
```

**AI Service (FastAPI)**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate         # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.main               # starts on http://localhost:8000
```

---

## 👥 User Roles & Access Control

CapstoneX implements **6-role RBAC** enforced at the API middleware layer. Every route checks the user's role before allowing access.

| Role | Email | Password | Key Permissions |
|---|---|---|---|
| **Admin** | admin@capstonex.com | CapstoneX@2024 | Full system access, user management, configuration |
| **HOD** | hod@capstonex.com | CapstoneX@2024 | Department-level oversight, reports, approvals |
| **Mentor** | mentor1@capstonex.com | CapstoneX@2024 | Review logbooks, write feedback, track team progress |
| **Coordinator** | coord1@capstonex.com | CapstoneX@2024 | Assign mentors, manage project allocations |
| **Student** | student1@capstonex.com | CapstoneX@2024 | Submit logbooks, view projects, team collaboration |
| **Examiner** | — | — | Evaluate final submissions, assign grades |

> 💡 All demo accounts use the same password: `CapstoneX@2024`

---

## 🔌 API Overview

The backend runs on `http://localhost:5000/api`. The AI service has full Swagger docs at `http://localhost:8000/docs`.

### Backend REST Endpoints

```
Auth
  POST   /api/auth/login              →  Login, returns JWT
  POST   /api/auth/register           →  Register new user
  POST   /api/auth/refresh            →  Refresh expired JWT

Projects
  GET    /api/projects                →  List all projects (paginated, filtered)
  POST   /api/projects                →  Create new project (Coordinator/Admin)
  GET    /api/projects/:id            →  Get single project details
  PUT    /api/projects/:id            →  Update project metadata
  DELETE /api/projects/:id            →  Remove project (Admin only)

Logbooks
  POST   /api/logbooks                →  Submit weekly logbook entry
  GET    /api/logbooks/:projectId     →  View all entries for a project
  PUT    /api/logbooks/:id/feedback   →  Mentor adds feedback to entry

Teams
  POST   /api/teams/auto-form         →  Trigger AI team formation
  GET    /api/teams/:id               →  Get team members and activity
  PATCH  /api/teams/:id/members       →  Manually adjust team composition

AI Proxy (calls AI service internally)
  POST   /api/ai/recommend            →  Get project recommendations for student
  POST   /api/ai/risk                 →  Predict project risk level
  GET    /api/ai/feedback/:logbookId  →  Generate AI feedback for a logbook
```

### AI Service Endpoints (FastAPI — Port 8000)

```
POST  /recommend     →  { student_id, interests } → ranked project list
POST  /predict-risk  →  { project_features }      → "Low" | "Medium" | "High"
POST  /feedback      →  { logbook_text, context } → generated feedback string
POST  /form-teams    →  { students[], n_teams }   → list of balanced teams
GET   /health        →  service health check
GET   /docs          →  interactive Swagger UI
```

---

## 🗄️ Database Design

PostgreSQL 15 with **13 tables**, designed for performance and flexibility.

```
Key Design Decisions:
  • UUID primary keys         → distributed-safe, non-enumerable IDs
  • JSONB columns             → flexible metadata storage without schema changes
  • Proper foreign key indexes → fast JOIN queries across tables
  • Sequelize migrations       → version-controlled, reproducible schema
  • Seed files                 → instant demo environment setup

Core Tables:
  users            → all platform users with role field
  projects         → capstone project records
  teams            → student group assignments
  team_members     → many-to-many: teams ↔ users
  logbooks         → weekly student progress entries
  feedback         → mentor + AI feedback records
  milestones       → project timeline and deadlines
  risk_assessments → ML prediction history per project
  audit_logs       → full action trail for compliance
  notifications    → in-app notification queue
  ...and 3 more
```

---

## ⚙️ CI/CD Pipeline

Three GitHub Actions workflows automate the entire delivery process.

```
.github/workflows/
│
├── ci.yml          → Runs on every Pull Request
│                     • Lint frontend (ESLint) and backend
│                     • Run backend unit tests (Jest)
│                     • Run AI service tests (pytest)
│                     • Block merge if any check fails
│
├── deploy.yml      → Runs on merge to main branch
│                     • Builds Docker images
│                     • Pushes to container registry
│                     • Deploys updated containers to server
│
└── retrain.yml     → Runs every Sunday at 2:00 AM UTC (cron)
                      • Pulls latest project data from production DB
                      • Retrains all 4 ML models (recommender, risk, feedback, teams)
                      • Saves updated model artifacts
                      • Validates model accuracy before swapping in production
```

---

## 📊 Monitoring & Observability

### Prometheus + Grafana (Metrics)

The backend uses `express-prometheus-bundle` to expose real-time metrics:

- HTTP request rate and latency per route
- Error rates by endpoint
- Database query times

```bash
# Start monitoring stack alongside main services
docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up

# Access dashboards:
# Prometheus  → http://localhost:9090
# Grafana     → http://localhost:3001
```

### Firebase Analytics (Frontend)

Tracks user behavior events for product improvement:

```typescript
// Example: tracks when a student submits a logbook
logEvent(analytics, 'logbook_submitted', { project_id, student_id });
```

### Accessibility — WCAG 2.1 AA

- `eslint-plugin-jsx-a11y` runs in CI to catch missing ARIA labels and contrast issues.
- Google Lighthouse CI runs on every PR to score accessibility automatically.
- All interactive UI components use `focus:ring` Tailwind classes for keyboard navigation.

### Load Testing — k6

```bash
# Run load test against the backend API
k6 run k6-load-test.js
```

The `k6-load-test.js` script simulates concurrent users hitting the most critical API endpoints to verify the system holds up under real university-scale traffic.

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in the following:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/capstonex
DB_HOST=localhost
DB_PORT=5432
DB_NAME=capstonex
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_service_account_email
NEXT_PUBLIC_FIREBASE_API_KEY=your_public_api_key

# AI Service
AI_SERVICE_URL=http://localhost:8000

# pgAdmin
PGADMIN_EMAIL=admin@capstonex.com
PGADMIN_PASSWORD=admin
```

---

## 🧪 Testing

```bash
# Backend unit + integration tests (Jest)
cd backend && npm test

# Backend with coverage report
cd backend && npm run test:coverage

# AI service tests (pytest)
cd ai-service && pytest tests/ -v

# Frontend component tests
cd frontend && npm test

# Load test (requires k6 installed)
k6 run k6-load-test.js
```

---

## 🗺️ Roadmap

- [x] Core RBAC with 6 roles
- [x] TF-IDF project recommendation
- [x] GradientBoosting risk prediction
- [x] K-Means team formation
- [x] AI feedback generation with flan-t5
- [x] Docker Compose full-stack setup
- [x] GitHub Actions CI/CD + weekly ML retraining
- [x] Prometheus + Grafana metrics scaffold
- [ ] Real-time notifications (WebSockets)
- [ ] Internationalization (Hindi, Marathi via `next-intl`)
- [ ] Mobile app (React Native)
- [ ] LLM upgrade (Llama 3 / GPT-4o for feedback)
- [ ] Plagiarism detection module

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request — CI checks will run automatically

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by [Kunal Khaire](https://github.com/kunalkhaire302) and contributors

**⭐ If you find this project useful, give it a star!**

</div>
