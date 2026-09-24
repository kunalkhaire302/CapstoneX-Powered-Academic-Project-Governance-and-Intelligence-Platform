# Frontend Route Inventory

| Route | Role | Primary source/API | Current state |
|---|---|---|---|
| `/` | Public | client redirect | Implemented |
| `/login` | Public | `POST /auth/login`, optional Firebase | Implemented; Quick Access Demo supported |
| `/register` | Public | `POST /auth/register` | Implemented; must remain Student-only |
| `/forgot-password` | Public | `POST /auth/forgot-password` | Implemented |
| `/reset-password` | Public | `POST /auth/reset-password` | Implemented; token checked on submit |
| `/student` | Student | dashboard composition | Implemented; fallback/static review required |
| `/student/groups` | Student | `/groups`, create/join | Implemented |
| `/student/topics` | Student | `/groups`, `/topics` | Implemented |
| `/student/recommendations` | Student | AI/recommendation proxy | Implemented; AI degraded state required |
| `/student/ai-team` | Student | `/agent-team/*` | Shared governed workspace |
| `/student/logbook` | Student | `/logbooks`, `/groups` | Implemented |
| `/student/marks` | Student | `/evaluations` | Implemented; displays server-backed evaluations only |
| `/student/notifications` | Student | `/notifications` | Implemented |
| `/mentor` | Mentor | overview composition | Implemented; thin |
| `/mentor/groups` | Mentor | `/groups` | Implemented |
| `/mentor/logbook-review` | Mentor | logbook APIs | Implemented; thin |
| `/mentor/evaluations` | Mentor | `/groups`, `/evaluations` | Implemented |
| `/mentor/schedule` | Mentor | repository has no verified scheduling API | UI exists; must use honest unavailable/empty state |
| `/mentor/risk` | Mentor | risk APIs | UI exists; thin |
| `/mentor/reports` | Mentor | export APIs | UI exists; thin |
| `/mentor/ai-team` | Mentor | `/agent-team/*` | Shared governed workspace |
| `/mentor/notifications` | Mentor | `/notifications` | Implemented through shared inbox |
| `/admin` | Admin | analytics/audit summaries | Implemented |
| `/admin/users` | Admin | `/users`, import | Implemented |
| `/admin/audit` | Admin | `/audit-logs` | Implemented |
| `/admin/topics` | Admin | topic APIs | Implemented; thin |
| `/admin/risk` | Admin | risk APIs | Implemented |
| `/admin/teams` | Admin | users/groups/team formation | Implemented; service failures remain explicit and do not generate fallback teams |
| `/admin/analytics` | Admin | analytics/export APIs | Aggregate metrics implemented; unavailable trend/model metrics use honest empty states |
| `/admin/ai-team` | Admin | `/agent-team/*` | Shared governed workspace |
| `/admin/models` | Admin | model APIs | Implemented; explicit degraded state needed |
| `/admin/notifications` | Admin | notifications/broadcast APIs | Implemented |

All dashboard routes are client-guarded through `DashboardLayout`, which verifies `/auth/profile`; the Express API remains the authorization boundary.
