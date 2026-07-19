import asyncio
import os
import sys

# Set up paths so we can import from app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Set environment variables for testing
os.environ["LLM_PROVIDER"] = "fallback"
os.environ["SHAP_ENABLED"] = "false"  # Disable SHAP to avoid heavy overhead during basic test
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"

from app.services.student_profiler import build_student_profile_dict, compute_difficulty_match
from app.services.recommendation_service import get_recommendations
from app.services.risk_service import predict_risk
from app.services.team_service import form_teams
from app.services.plagiarism_service import quick_check
from app.services.problem_service import analyze_problem_statement
from app.services.feedback_service import analyze_feedback
from app.ml.train_risk import train_model

async def test_all():
    print("="*50)
    print("Testing CapstoneX AI Services")
    print("="*50)

    # 1. Test Feature Engineering & Profiler
    print("\n1. Testing Student Profiler...")
    profile = build_student_profile_dict(
        student_id="123",
        skills=["Python", "React", "SQL"],
        interests=["AI", "Web Dev"],
        technologies=["FastAPI", "Next.js"],
        department="Computer Science"
    )
    diff = compute_difficulty_match(project_tech_count=4, project_complexity_keywords=2, student_skill_count=3, student_cgpa=8.5)
    print(f"Profile built successfully. Difficulty Match Score: {diff:.2f}")

    # 2. Test Recommendation Service
    print("\n2. Testing Recommendation Service (with empty FAISS index)...")
    recs = await get_recommendations(
        student_id="123",
        skills=["Python", "ML"],
        interests=["Data Science"],
        technologies=["TensorFlow", "Pandas"],
    )
    print(f"Recommendations returned: {len(recs.get('recommendations', []))}. Message: {recs.get('explanation')}")

    # 3. Test Risk Training & Prediction
    print("\n3. Testing Risk Model Training Pipeline...")
    train_result = train_model()
    print(f"Training complete. Best Model: {train_result.get('best_model')} | AUC: {train_result.get('auc', 0):.4f}")

    print("\n3. Testing Risk Prediction (with heuristic/ML)...")
    features = {
        "submission_rate": 0.4,
        "mentor_meeting_frequency": 0.2,
        "task_completion_rate": 0.3,
    }
    risk = await predict_risk("group_1", features)
    print(f"Risk Prediction: {risk.get('risk_label').upper()} ({risk.get('probability')})")

    # 4. Test Team Formation
    print("\n4. Testing Team Formation...")
    students = [
        {"id": "1", "skills": ["React"], "cgpa": 8.0, "leadership_score": 7},
        {"id": "2", "skills": ["Python"], "cgpa": 8.5, "leadership_score": 5},
        {"id": "3", "skills": ["SQL"], "cgpa": 7.0, "leadership_score": 6},
        {"id": "4", "skills": ["Docker", "AWS"], "cgpa": 7.5, "leadership_score": 8},
        {"id": "5", "skills": ["UI/UX"], "cgpa": 9.0, "leadership_score": 4},
    ]
    teams = await form_teams(students, team_size=3)
    print(f"Formed {teams.get('num_teams')} teams. Overall Compatibility: {teams.get('overall_compatibility')}%")

    # 5. Test Plagiarism Detection
    print("\n5. Testing Plagiarism Detection (Quick Check)...")
    plag = await quick_check("We will build an AI powered smart capstone project management platform using React and Node.js.")
    print(f"Plagiarism Risk: {plag.get('risk_level')} (Sim: {plag.get('similarity')}%)")

    # 6. Test NLP Problem Analyzer
    print("\n6. Testing Problem Statement Analyzer (Heuristic Fallback)...")
    prob = await analyze_problem_statement(
        title="Smart AI Platform",
        description="We are building an AI platform that predicts things and uses blockchain for security. It will be very cool.",
        tech_stack=["Python", "AI", "Blockchain", "React"],
    )
    print(f"Scores: Feasibility {prob['scores'].get('feasibility')}/10, Innovation {prob['scores'].get('innovation')}/10")

    # 7. Test Feedback Analyzer
    print("\n7. Testing Feedback Analyzer (Heuristic Fallback)...")
    feedback = await analyze_feedback("The progress is very good, but you need to fix the database schema issue by next week.")
    print(f"Sentiment: {feedback.get('sentiment')} | Action Items: {len(feedback.get('action_items', []))}")

    print("\nAll AI modules tested successfully without fatal errors.")


if __name__ == "__main__":
    asyncio.run(test_all())
