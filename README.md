# CapstoneX

> AI-Powered Academic Project Governance & Intelligence Platform

![Stack](https://img.shields.io/badge/Frontend-Next.js%2014-black)
![Stack](https://img.shields.io/badge/Backend-Express.js-green)
![Stack](https://img.shields.io/badge/AI-FastAPI-009688)
![Stack](https://img.shields.io/badge/DB-PostgreSQL-4169E1)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CapstoneX Platform                            │
├────────────────┬──────────────────┬──────────────────┬──────────────┤
│   Frontend     │    Backend API   │   AI Service     │   Database   │
│   Next.js 14   │   Express.js     │   FastAPI        │  PostgreSQL  │
│   :3000        │   :5000          │   :8000          │  :5432       │
├────────────────┼──────────────────┼──────────────────┼──────────────┤
│ • App Router   │ • REST API       │ • Recommend      │ • 13 Tables  │
│ • Tailwind CSS │ • JWT + Firebase │ • Risk Predict   │ • UUID PKs   │
│ • Zustand      │ • Sequelize ORM  │ • AI Feedback    │ • JSONB      │
│ • React Query  │ • RBAC (6 roles) │ • Team Formation │ • Indexes    │
│ • Recharts     │ • Rate Limiting  │ • GradientBoost  │ • Migrations │
│ • Framer Motion│ • Audit Logging  │ • TF-IDF + KMeans│ • Seeds      │
└────────────────┴──────────────────┴──────────────────┴──────────────┘
```

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+

### Using Docker Compose (Recommended)

```bash
# 1. Clone and configure
cp .env.example .env
# Edit .env with your credentials

# 2. Start all services
docker-compose up --build

# 3. Run migrations & seed
docker exec capstonex-backend npm run db:reset

# 4. Access
# Frontend: http://localhost:3000
# Backend:  http://localhost:5000/api/health
# AI Docs:  http://localhost:8000/docs
# PgAdmin:  http://localhost:5050
```

### Manual Setup

```bash
# Backend
cd backend
npm install
cp ../.env.example .env
npm run migrate
npm run seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# AI Service
cd ai-service
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m app.main
```

## User Roles

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@capstonex.com | CapstoneX@2024 |
| HOD | hod@capstonex.com | CapstoneX@2024 |
| Mentor | mentor1@capstonex.com | CapstoneX@2024 |
| Coordinator | coord1@capstonex.com | CapstoneX@2024 |
| Student | student1@capstonex.com | CapstoneX@2024 |

## AI Modules

1. **Project Recommendation** — TF-IDF + cosine similarity on domain knowledge base
2. **Risk Prediction** — GradientBoosting 3-class classifier (Low/Medium/High)
3. **Feedback Generation** — Template-based with optional flan-t5 transformer
4. **Team Formation** — K-Means clustering with diversity balancing

## Environment Variables

See `.env.example` for all required configuration.

## Testing

```bash
# Backend
cd backend && npm test

# AI Service
cd ai-service && pytest tests/ -v

# Frontend
cd frontend && npm test
```

## CI/CD

- **ci.yml** — Lint + test on PR
- **deploy.yml** — Auto-deploy on main merge
- **retrain.yml** — Weekly ML model retraining (Sunday 2am UTC)

## License

MIT
