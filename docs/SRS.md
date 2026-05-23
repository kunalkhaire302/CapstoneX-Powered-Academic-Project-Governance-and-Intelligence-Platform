# CapstoneX — Software Requirements Specification

## 1. Introduction

### 1.1 Purpose
CapstoneX is an AI-powered academic capstone project governance and intelligence platform designed to streamline the entire capstone project lifecycle — from team formation and topic approval to logbook tracking, evaluation, and risk prediction.

### 1.2 Scope
The platform serves 6 user roles across academic institutions:
- **Students** — submit logbooks, track progress, receive AI recommendations
- **Mentors** — review logbooks, evaluate rubrics, use AI feedback
- **Coordinators** — approve topics, manage departments, view analytics
- **HODs** — department oversight, reporting
- **Admins** — system management, user CRUD, audit logs
- **Accreditation Teams** — read-only access to reports and analytics

### 1.3 Definitions
| Term | Definition |
|------|-----------|
| Logbook | Weekly progress report submitted by students |
| Rubric | Evaluation criteria with weighted scores |
| Risk Score | AI-predicted probability of project delay |
| Join Code | 6-character alphanumeric code to join a group |

---

## 2. Overall Description

### 2.1 Product Perspective
CapstoneX is a web-based SaaS platform deployed as three microservices:
1. **Frontend** — Next.js 14 (App Router) with Tailwind CSS
2. **Backend API** — Express.js with PostgreSQL
3. **AI Service** — FastAPI with scikit-learn and HuggingFace

### 2.2 User Classes and Characteristics

| Role | Access Level | Key Capabilities |
|------|-------------|-----------------|
| Student | Basic | Group management, logbook submission, AI recommendations |
| Mentor | Elevated | Logbook review, evaluations, AI feedback, meetings |
| Coordinator | Department | Topic approval, Kanban board, department analytics, exports |
| HOD | Department+ | All coordinator features + workload balancing |
| Admin | System | User management, audit logs, system analytics, broadcasts |
| Accreditation | Read-only | Reports, analytics dashboards, export access |

---

## 3. Functional Requirements

### FR-01: Authentication & Authorization
- FR-01.1: Users can register with email/password or Google OAuth
- FR-01.2: System enforces RBAC across all routes (6 roles)
- FR-01.3: JWT access tokens expire in 15 minutes with 7-day refresh tokens
- FR-01.4: Password reset via email link

### FR-02: Student Portal
- FR-02.1: Students can create groups and generate join codes
- FR-02.2: Students can join existing groups via join code
- FR-02.3: Students can submit topics with domain tags and file uploads
- FR-02.4: Students can create and submit weekly logbook entries
- FR-02.5: Students can view evaluation scores and mentor feedback
- FR-02.6: Students can receive AI-powered project recommendations

### FR-03: Mentor Portal
- FR-03.1: Mentors can view all assigned groups with activity feeds
- FR-03.2: Mentors can review logbooks with inline comments
- FR-03.3: Mentors can submit rubric-based evaluations
- FR-03.4: Mentors can generate AI feedback for evaluations
- FR-03.5: Mentors can schedule meetings with groups

### FR-04: Coordinator/HOD Portal
- FR-04.1: Coordinators can approve, reject, or request revision on topics
- FR-04.2: Coordinators can view Kanban-style group status board
- FR-04.3: Coordinators can export reports as PDF and Excel
- FR-04.4: Coordinators can view department-level analytics

### FR-05: Admin Panel
- FR-05.1: Admins can perform CRUD on all users
- FR-05.2: Admins can bulk import users via CSV
- FR-05.3: Admins can view searchable, filterable audit logs
- FR-05.4: Admins can broadcast notifications to all or filtered users
- FR-05.5: Admins can view system-wide analytics

### FR-06: AI/ML Features
- FR-06.1: Project recommendation engine (TF-IDF + cosine similarity)
- FR-06.2: Risk prediction model (GradientBoosting, 3-class classification)
- FR-06.3: AI evaluation feedback generation (template + optional transformer)
- FR-06.4: AI team formation (K-Means clustering)

### FR-07: Notifications
- FR-07.1: Real-time notification bell with unread count
- FR-07.2: Notification types: submission, feedback, approval, alert, system
- FR-07.3: Mark individual or all notifications as read
- FR-07.4: Email notifications for critical events

---

## 4. Non-Functional Requirements

### NFR-01: Performance
- API responses < 200ms (non-AI endpoints)
- AI endpoints < 3 seconds
- Frontend Lighthouse score ≥ 90

### NFR-02: Security
- HTTPS enforced in production
- Input sanitization on all endpoints
- Rate limiting: 100 req/15min auth, 500 req/15min general
- SQL injection prevention via parameterized queries

### NFR-03: Scalability
- Stateless backend (horizontal scaling ready)
- Database connection pooling (max 20 connections)
- Docker containerization for all services

### NFR-04: Reliability
- Health check endpoints on all services
- Centralized error handling with Winston logging
- Audit trail for all state-changing actions

### NFR-05: Maintainability
- Automated CI/CD pipeline
- Weekly ML model retraining
- Comprehensive test coverage (≥ 80%)
