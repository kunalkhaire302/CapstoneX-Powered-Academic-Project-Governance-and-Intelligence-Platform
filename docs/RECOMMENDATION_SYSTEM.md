# CapstoneX AI Recommendation System

## Overview
The CapstoneX AI Recommendation System evaluates student project and hackathon problem statements. It acts as a primary filter to guide students in selecting impactful, unique, and feasible problem statements before final submission.

This system is integrated into CapstoneX as a native feature with a hybrid architecture consisting of:
1. **Frontend**: Next.js React Dashboard (`app/(dashboard)/student/recommendations`)
2. **Backend**: Express.js REST API proxy (`backend/src/controllers/recommendationController.js`)
3. **AI Service**: FastAPI Python Service for embeddings, semantic search, and LLM suggestions (`ai-service/app/`)
4. **Database**: PostgreSQL (relational metadata via Sequelize) + FAISS (local vector store)

---

## 12-Step Hybrid Pipeline
When a user submits a problem statement for analysis, the AI Service executes the following 12-step pipeline inside `problem_analyzer_service.py`:

1. **Input Validation**: Clean and extract the problem statement payload.
2. **Semantic Embedding**: Use `all-MiniLM-L6-v2` (Sentence-Transformers) to generate a dense 384D vector embedding of the combined text (Title + Problem + Impact).
3. **Vector Search (FAISS)**: Perform a similarity search against the historical projects corpus to find the top $K=5$ nearest neighbors.
4. **Similarity Scoring (Cosine)**: Calculate percentage similarity for found projects. Flag projects with >90% similarity as potential duplicates.
5. **Keyword & Topic Extraction**: Use TF-IDF/heuristic rules (or LLM) to extract core skills and tech stack from the text.
6. **Domain Mapping**: Compare the user's defined domain vs the extracted tech stack.
7. **Heuristic Rule Engine**: Apply formula-based scoring:
   - **Domain Match**: High if expected skills match stated department.
   - **Feasibility**: High if tech stack is well-defined and team members are present.
   - **Commercial Potential**: High if expected users and target audience are specific.
8. **SDG Alignment (Optional)**: Match the impact description to UN Sustainable Development Goals using keyword triggers.
9. **LLM Generation**: Prompt OpenAI (`gpt-4o-mini`) to generate specific AI suggestions (Strengths, Weaknesses, Missing Features, Future Scope).
10. **LLM Scoring Adjustments**: Allow the LLM to provide its own qualitative scores (Uniqueness, Innovation, Impact).
11. **Final Weighted Scoring**: Merge the Heuristic scores with the LLM scores using a weighted formula in `scoring_engine.py`:
    - Overall = (Domain * 0.15) + (Uniqueness * 0.20) + (Innovation * 0.15) + (Impact * 0.20) + (Feasibility * 0.15) + (Skill * 0.10) + (Commercial * 0.05)
12. **Report Assembly**: Aggregate the scores, similar projects, warnings, and AI suggestions into a comprehensive JSON response.

---

## Key Components

### 1. Vector Store (`vector_store.py`)
- **Technology**: FAISS (Facebook AI Similarity Search) CPU version.
- **Persistence**: Embeddings are saved to disk at `data/faiss_index/` along with `project_metadata.json` mapping FAISS IDs to project metadata.
- **Rebuilding**: A startup event in FastAPI seeds the FAISS index with `seed_projects.json` if it doesn't exist.

### 2. Embeddings (`embedding_service.py`)
- **Technology**: `sentence-transformers` library running `all-MiniLM-L6-v2`.
- **Reasoning**: It provides an excellent balance of speed and semantic capability without incurring external API costs.

### 3. LLM Suggestions (`llm_service.py`)
- **Technology**: OpenAI API (`gpt-4o-mini`).
- **Resilience**: Features an automatic fallback to rule-based templating if the `OPENAI_API_KEY` is not provided or the API times out.

### 4. Database Models (`backend/src/models`)
- `ProblemStatement`: Master record of the student's submission.
- `Recommendation`: Stores the resulting JSON blobs from the AI service.
- `RecommendationHistory`: Audit trail for every time a problem statement is scored/rescored.
- `PreviousProject`: (Optional) PostgreSQL representation of historical projects used to hydrate the FAISS index during production syncs.

---

## UI Components
- **RecommendationRadar**: A Recharts-based radar chart displaying all 7 scoring dimensions.
- **OverallScoreGauge**: A custom SVG circular progress bar for the final score (0-100).
- **ScoreCard**: Reusable cards with dynamic color coding (Red/Amber/Emerald) for individual metrics.
- **SimilarProjectsPanel**: Highlights past projects and clearly warns the student if their idea is highly duplicated.
- **AISuggestionsPanel**: An interactive 13-category accordion rendering the LLM's actionable advice.

## Local Setup
Ensure you set the `OPENAI_API_KEY` in your `.env` file. If running via Docker Compose, the `ai-service` container will read this and use it to enhance recommendations. The FAISS database is persisted in the `data/` volume.
