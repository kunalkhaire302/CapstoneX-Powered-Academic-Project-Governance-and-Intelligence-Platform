"""
LLM Service for AI Suggestion Generation.
Configurable provider: OpenAI GPT (default) or template-based fallback.

Generates structured suggestions including:
- Strengths & Weaknesses
- Missing/Unique Features
- Technology Recommendations
- Business Model Suggestions
- Risk Analysis
- Improvement Suggestions
"""
import os
import json
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "fallback")  # "openai" or "fallback"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


async def generate_ai_suggestions(
    title: str,
    problem_statement: str,
    description: str,
    domain: str,
    tech_stack: List[str],
    target_audience: str,
    expected_impact: str,
    scores: Dict[str, int],
    similar_projects: List[Dict],
) -> Dict:
    """
    Generate comprehensive AI suggestions for a problem statement.

    Returns dict with all suggestion categories.
    """
    if LLM_PROVIDER == "openai" and OPENAI_API_KEY:
        return await _generate_openai(
            title, problem_statement, description, domain,
            tech_stack, target_audience, expected_impact, scores, similar_projects
        )
    else:
        return _generate_fallback(
            title, problem_statement, description, domain,
            tech_stack, target_audience, expected_impact, scores, similar_projects
        )


async def _generate_openai(
    title: str, problem_statement: str, description: str, domain: str,
    tech_stack: List[str], target_audience: str, expected_impact: str,
    scores: Dict[str, int], similar_projects: List[Dict],
) -> Dict:
    """Generate suggestions using OpenAI GPT API."""
    try:
        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=OPENAI_API_KEY)

        prompt = f"""You are an expert hackathon mentor and project advisor. Analyze this project idea and provide detailed, actionable feedback.

PROJECT:
- Title: {title}
- Problem Statement: {problem_statement}
- Description: {description}
- Domain: {domain}
- Tech Stack: {', '.join(tech_stack)}
- Target Audience: {target_audience}
- Expected Impact: {expected_impact}

CURRENT SCORES (0-100):
{json.dumps(scores, indent=2)}

SIMILAR EXISTING PROJECTS:
{json.dumps(similar_projects[:5], indent=2)}

Respond in this exact JSON format (no markdown, no code blocks):
{{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "missing_features": ["feature 1", "feature 2", "feature 3"],
  "unique_features": ["feature 1", "feature 2"],
  "future_scope": ["scope 1", "scope 2", "scope 3"],
  "tech_recommendations": ["tech 1", "tech 2", "tech 3"],
  "business_model_suggestions": ["model 1", "model 2"],
  "potential_users": ["user segment 1", "user segment 2", "user segment 3"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "improvement_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "recommended_apis": ["api 1", "api 2"],
  "recommended_frameworks": ["framework 1", "framework 2"],
  "recommended_datasets": ["dataset 1", "dataset 2"]
}}"""

        response = await client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a hackathon project advisor. Always respond with valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=2000,
        )

        content = response.choices[0].message.content.strip()
        # Clean potential markdown formatting
        if content.startswith("```"):
            content = content.split("\n", 1)[1].rsplit("```", 1)[0]

        return json.loads(content)

    except Exception as e:
        logger.error(f"OpenAI API error: {e}")
        logger.info("Falling back to template-based suggestions")
        return _generate_fallback(
            title, problem_statement, description, domain,
            tech_stack, target_audience, expected_impact, scores, similar_projects
        )


def _generate_fallback(
    title: str, problem_statement: str, description: str, domain: str,
    tech_stack: List[str], target_audience: str, expected_impact: str,
    scores: Dict[str, int], similar_projects: List[Dict],
) -> Dict:
    """
    Template-based suggestion generator.
    Works without any API key — uses rule-based analysis.
    """
    combined = f"{title} {problem_statement} {description}".lower()
    domain_lower = (domain or "").lower()

    # ──────────────────────────────────────────
    # Strengths
    # ──────────────────────────────────────────
    strengths = []
    if scores.get("uniqueness", 0) > 60:
        strengths.append("The project idea shows good originality and is differentiated from existing solutions")
    if scores.get("impact", 0) > 60:
        strengths.append("Strong potential for real-world impact with a clear target audience")
    if scores.get("feasibility", 0) > 60:
        strengths.append("The technical scope appears achievable within the given constraints")
    if scores.get("skill_match", 0) > 60:
        strengths.append("Good alignment between team skills and project requirements")
    if tech_stack and len(tech_stack) >= 2:
        strengths.append(f"Well-defined technology stack including {', '.join(tech_stack[:3])}")
    if problem_statement and len(problem_statement) > 50:
        strengths.append("Clear and detailed problem statement that identifies a specific need")
    if not strengths:
        strengths.append("The project addresses an identifiable problem space")

    # ──────────────────────────────────────────
    # Weaknesses
    # ──────────────────────────────────────────
    weaknesses = []
    if scores.get("uniqueness", 100) < 40:
        weaknesses.append("The idea has high similarity to existing projects — consider adding a unique angle")
    if scores.get("feasibility", 100) < 50:
        weaknesses.append("The scope may be too ambitious for the available time and team size")
    if scores.get("skill_match", 100) < 50:
        weaknesses.append("There may be skill gaps in the team for the chosen technology stack")
    if not target_audience or len(target_audience) < 10:
        weaknesses.append("Target audience is not well-defined — specify who will use this product")
    if not expected_impact or len(expected_impact) < 20:
        weaknesses.append("Expected impact needs more detail — quantify the value proposition")
    if scores.get("commercial_potential", 100) < 40:
        weaknesses.append("Commercial viability is unclear — consider the sustainability model")
    if not weaknesses:
        weaknesses.append("Consider adding more detail to the project description for stronger evaluation")

    # ──────────────────────────────────────────
    # Missing Features
    # ──────────────────────────────────────────
    missing_features = []
    if "auth" not in combined and "login" not in combined:
        missing_features.append("User authentication and authorization system")
    if "dashboard" not in combined and "analytics" not in combined:
        missing_features.append("Analytics dashboard for tracking usage and performance metrics")
    if "api" not in combined:
        missing_features.append("RESTful API for third-party integrations")
    if "notification" not in combined and "alert" not in combined:
        missing_features.append("Notification system for user engagement")
    if "test" not in combined:
        missing_features.append("Automated testing and quality assurance pipeline")
    missing_features = missing_features[:4]

    # ──────────────────────────────────────────
    # Unique Features
    # ──────────────────────────────────────────
    unique_features = []
    if "ai" in combined or "ml" in combined:
        unique_features.append("AI/ML-powered intelligent features for predictive insights")
    if "real-time" in combined or "realtime" in combined:
        unique_features.append("Real-time data processing and instant feedback")
    if "gamif" in combined:
        unique_features.append("Gamification elements to drive user engagement")
    if "blockchain" in combined:
        unique_features.append("Blockchain-based transparency and trust mechanisms")
    if not unique_features:
        unique_features.append("Consider adding AI-powered features to differentiate from competitors")

    # ──────────────────────────────────────────
    # Technology Recommendations
    # ──────────────────────────────────────────
    tech_recs = _recommend_technologies(domain_lower, tech_stack, combined)

    # ──────────────────────────────────────────
    # Business Model
    # ──────────────────────────────────────────
    business_models = []
    if "saas" in combined or "platform" in combined or "web" in combined:
        business_models.append("Freemium SaaS model with premium features for power users")
    if "b2b" in combined or "enterprise" in combined or "business" in combined:
        business_models.append("B2B licensing model with per-seat or usage-based pricing")
    if "education" in combined or "student" in combined:
        business_models.append("Institutional licensing for schools and universities")
    if "health" in combined or "medical" in combined:
        business_models.append("Healthcare provider partnerships with compliance-focused pricing")
    if not business_models:
        business_models.extend([
            "Freemium model with basic free tier and premium subscription",
            "Consider open-source core with commercial support and enterprise features"
        ])

    # ──────────────────────────────────────────
    # Risks
    # ──────────────────────────────────────────
    risks = []
    if scores.get("feasibility", 100) < 50:
        risks.append("Scope creep — the project may expand beyond manageable bounds")
    risks.append("Data privacy and security considerations need thorough planning")
    if "api" in combined or "third-party" in combined:
        risks.append("Dependency on third-party APIs and services — plan for rate limits and outages")
    if scores.get("skill_match", 100) < 60:
        risks.append("Team may need to learn new technologies during development — plan for learning time")
    risks.append("User adoption and retention strategy needs to be defined early")

    # ──────────────────────────────────────────
    # Improvement Suggestions
    # ──────────────────────────────────────────
    improvements = _generate_improvements(scores, combined, similar_projects)

    # ──────────────────────────────────────────
    # APIs, Frameworks, Datasets
    # ──────────────────────────────────────────
    apis = _recommend_apis(domain_lower, combined)
    frameworks = _recommend_frameworks(tech_stack, domain_lower)
    datasets = _recommend_datasets(domain_lower, combined)

    # ──────────────────────────────────────────
    # Future Scope
    # ──────────────────────────────────────────
    future_scope = [
        "Mobile application support for wider reach",
        "Multi-language and internationalization support",
        "AI-powered analytics and reporting dashboard",
        "Integration with popular third-party platforms",
        "Progressive Web App (PWA) for offline access",
    ]

    # ──────────────────────────────────────────
    # Potential Users
    # ──────────────────────────────────────────
    users = _identify_potential_users(target_audience, domain_lower, combined)

    return {
        "strengths": strengths[:5],
        "weaknesses": weaknesses[:5],
        "missing_features": missing_features[:5],
        "unique_features": unique_features[:4],
        "future_scope": future_scope[:5],
        "tech_recommendations": tech_recs[:5],
        "business_model_suggestions": business_models[:3],
        "potential_users": users[:5],
        "risks": risks[:5],
        "improvement_suggestions": improvements[:5],
        "recommended_apis": apis[:4],
        "recommended_frameworks": frameworks[:4],
        "recommended_datasets": datasets[:4],
    }


def _recommend_technologies(domain: str, existing_tech: List[str], combined: str) -> List[str]:
    """Recommend technologies based on domain and existing stack."""
    existing_lower = set(t.lower() for t in (existing_tech or []))
    recs = []

    domain_tech = {
        "machine learning": ["TensorFlow/PyTorch for model training", "MLflow for experiment tracking", "Streamlit for model demos"],
        "web": ["Next.js for server-side rendering", "Prisma/Sequelize for ORM", "Redis for caching"],
        "mobile": ["Firebase for backend services", "Realm for local storage", "Push notification services"],
        "data": ["Apache Spark for big data processing", "Grafana for dashboards", "dbt for data transformations"],
        "security": ["OWASP ZAP for vulnerability scanning", "HashiCorp Vault for secrets", "JWT for authentication"],
        "cloud": ["Terraform for infrastructure as code", "Prometheus for monitoring", "GitHub Actions for CI/CD"],
        "iot": ["MQTT broker (Mosquitto)", "InfluxDB for time-series data", "Grafana for IoT dashboards"],
        "blockchain": ["Hardhat for smart contract development", "IPFS for decentralized storage", "Ethers.js for Web3"],
        "nlp": ["Hugging Face Transformers", "spaCy for NLP pipeline", "LangChain for LLM applications"],
    }

    for key, techs in domain_tech.items():
        if key in domain:
            for t in techs:
                if not any(t.lower().split()[0] in e for e in existing_lower):
                    recs.append(t)

    # Universal recommendations
    universal = ["Docker for containerized deployment", "GitHub Actions for CI/CD pipeline", "Swagger/OpenAPI for API documentation"]
    for u in universal:
        if not any(u.split()[0].lower() in e for e in existing_lower):
            recs.append(u)

    return recs[:5] if recs else ["Consider adding automated testing with Jest/Pytest", "Add Docker for reproducible environments"]


def _recommend_apis(domain: str, combined: str) -> List[str]:
    """Recommend relevant APIs."""
    apis = []
    if "nlp" in domain or "text" in combined or "chatbot" in combined:
        apis.extend(["OpenAI GPT API", "Google Cloud Natural Language API"])
    if "vision" in domain or "image" in combined:
        apis.extend(["Google Cloud Vision API", "Clarifai Image Recognition API"])
    if "map" in combined or "location" in combined or "geo" in combined:
        apis.extend(["Google Maps API", "Mapbox API"])
    if "payment" in combined or "commerce" in combined:
        apis.extend(["Stripe Payment API", "Razorpay API"])
    if "social" in combined or "auth" in combined:
        apis.extend(["OAuth 2.0 providers (Google, GitHub)", "Firebase Authentication"])
    if "weather" in combined:
        apis.append("OpenWeatherMap API")
    if "email" in combined or "notification" in combined:
        apis.extend(["SendGrid Email API", "Twilio SMS API"])
    if not apis:
        apis.extend(["Firebase Backend Services", "Cloudinary for media management"])
    return apis[:4]


def _recommend_frameworks(tech_stack: List[str], domain: str) -> List[str]:
    """Recommend frameworks to complement existing stack."""
    existing = set(t.lower() for t in (tech_stack or []))
    frameworks = []
    if "react" not in existing and "vue" not in existing and "angular" not in existing:
        frameworks.append("React.js or Next.js for frontend development")
    if "express" not in existing and "django" not in existing and "flask" not in existing:
        frameworks.append("Express.js or FastAPI for backend API")
    if "tailwind" not in existing and "bootstrap" not in existing:
        frameworks.append("Tailwind CSS for rapid UI development")
    if "jest" not in existing and "pytest" not in existing:
        frameworks.append("Jest (JS) or Pytest (Python) for testing")
    if "ml" in domain or "ai" in domain:
        frameworks.append("Scikit-learn for classical ML pipelines")
    return frameworks[:4] if frameworks else ["Consider adding a state management library (Zustand/Redux)"]


def _recommend_datasets(domain: str, combined: str) -> List[str]:
    """Recommend datasets for AI/ML projects."""
    datasets = []
    if "ml" in domain or "ai" in domain or "data" in domain:
        if "health" in combined or "medical" in combined:
            datasets.extend(["MIMIC-III Clinical Database", "Kaggle Medical Imaging datasets"])
        elif "nlp" in combined or "text" in combined:
            datasets.extend(["IMDB Reviews Dataset", "Common Crawl for NLP training"])
        elif "image" in combined or "vision" in combined:
            datasets.extend(["ImageNet", "COCO Object Detection Dataset"])
        elif "recommend" in combined:
            datasets.extend(["MovieLens Dataset", "Amazon Product Reviews"])
        else:
            datasets.extend(["Kaggle datasets for your domain", "UCI Machine Learning Repository"])
    if "education" in combined:
        datasets.append("Open University Learning Analytics dataset")
    if "finance" in combined:
        datasets.append("Yahoo Finance or Alpha Vantage stock data")
    return datasets[:4] if datasets else ["No specific dataset recommendations — project is not ML/data-focused"]


def _generate_improvements(scores: Dict, combined: str, similar_projects: List[Dict]) -> List[str]:
    """Generate targeted improvement suggestions based on scores."""
    improvements = []

    if scores.get("uniqueness", 100) < 50:
        improvements.append("Add a unique differentiator — consider combining two domains or adding an AI/ML component")
    if scores.get("feasibility", 100) < 50:
        improvements.append("Reduce scope to a focused MVP — prioritize 3-5 core features for the hackathon")
    if scores.get("impact", 100) < 50:
        improvements.append("Strengthen the impact statement with specific metrics (e.g., '30% reduction in time')")
    if scores.get("skill_match", 100) < 50:
        improvements.append("Identify skill gaps and plan for learning sessions or bring in team members with those skills")
    if scores.get("commercial_potential", 100) < 50:
        improvements.append("Define a clear monetization strategy — who would pay for this and why?")
    if scores.get("domain_match", 100) < 50:
        improvements.append("Better align the project with your academic domain to leverage your existing knowledge")
    if scores.get("innovation", 100) < 50:
        improvements.append("Incorporate emerging technologies (AI, blockchain, IoT) to increase innovation score")

    if len(similar_projects) > 0 and similar_projects[0].get("similarity", 0) > 80:
        improvements.append(f"Differentiate from '{similar_projects[0].get('title', 'similar project')}' by focusing on a specific niche or user segment")

    if not improvements:
        improvements.append("Consider adding user feedback mechanisms and iterative improvement plans")

    return improvements[:5]


def _identify_potential_users(target_audience: str, domain: str, combined: str) -> List[str]:
    """Identify potential user segments."""
    users = []
    if target_audience:
        users.append(target_audience)

    domain_users = {
        "health": ["Hospitals and clinics", "Patients and caregivers", "Healthcare administrators"],
        "education": ["Students and teachers", "Educational institutions", "EdTech companies"],
        "finance": ["Individual investors", "Banking institutions", "FinTech startups"],
        "security": ["IT security teams", "Enterprise organizations", "Government agencies"],
        "iot": ["Smart home users", "Industrial manufacturers", "City planners"],
    }

    for key, user_list in domain_users.items():
        if key in domain or key in combined:
            users.extend(user_list)
            break

    if len(users) < 3:
        users.extend(["Small and medium businesses", "Technology enthusiasts", "End consumers"])

    return list(dict.fromkeys(users))[:5]  # Deduplicate preserving order
