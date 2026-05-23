"""
Module 2: AI Risk Prediction Model
Uses GradientBoosting classifier trained on synthetic/Kaggle data.
Labels: 0 = Low Risk, 1 = Medium Risk, 2 = High Risk
"""
import os
import logging
import numpy as np
import joblib
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "ml", "risk_model.pkl")
risk_pipeline = None


def load_risk_model():
    """Load the pre-trained risk model, or create a default one."""
    global risk_pipeline
    try:
        if os.path.exists(MODEL_PATH):
            risk_pipeline = joblib.load(MODEL_PATH)
            logger.info(f"✅ Risk model loaded from {MODEL_PATH}")
        else:
            logger.warning("⚠️  No pre-trained risk model found — creating default model")
            risk_pipeline = _create_default_model()
            os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
            joblib.dump(risk_pipeline, MODEL_PATH)
            logger.info(f"✅ Default risk model saved to {MODEL_PATH}")
    except Exception as e:
        logger.error(f"❌ Failed to load risk model: {e}")
        risk_pipeline = _create_default_model()


def _create_default_model():
    """Create and train a default risk model on synthetic data."""
    np.random.seed(42)
    n_samples = 500

    # Synthetic features: submission_rate, avg_days_late, mentor_feedback_score,
    # login_frequency_7d, evaluation_score_avg, group_size, topic_approval_delay_days
    X = np.column_stack([
        np.random.uniform(0, 1, n_samples),        # submission_rate
        np.random.uniform(0, 14, n_samples),        # avg_days_late
        np.random.uniform(1, 10, n_samples),        # mentor_feedback_score
        np.random.randint(0, 30, n_samples),         # login_frequency_7d
        np.random.uniform(0, 100, n_samples),       # evaluation_score_avg
        np.random.randint(2, 6, n_samples),          # group_size
        np.random.uniform(0, 30, n_samples),        # topic_approval_delay_days
    ])

    # Generate labels based on heuristic rules
    risk_score = (
        (1 - X[:, 0]) * 30 +       # Low submission = high risk
        X[:, 1] * 5 +               # Late submissions
        (10 - X[:, 2]) * 3 +        # Low feedback score
        (30 - X[:, 3]) * 0.5 +      # Low login freq
        (100 - X[:, 4]) * 0.3 +     # Low eval score
        X[:, 6] * 1                  # Approval delay
    )
    y = np.digitize(risk_score, bins=[40, 70]) # 0=low, 1=medium, 2=high

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", GradientBoostingClassifier(
            n_estimators=100, max_depth=4, learning_rate=0.1, random_state=42
        )),
    ])
    pipeline.fit(X, y)
    return pipeline


FEATURE_NAMES = [
    "submission_rate", "avg_days_late", "mentor_feedback_score",
    "login_frequency_7d", "evaluation_score_avg", "group_size",
    "topic_approval_delay_days"
]

LABEL_MAP = {0: "low", 1: "medium", 2: "high"}


def predict_risk(group_id: str, features: dict) -> dict:
    """Predict risk level for a group based on features."""
    global risk_pipeline
    if risk_pipeline is None:
        load_risk_model()

    # Extract features in order, with defaults
    feature_values = [
        features.get("submission_rate", 0.5),
        features.get("avg_days_late", 3),
        features.get("mentor_feedback_score", 5),
        features.get("login_frequency_7d", 10),
        features.get("evaluation_score_avg", 50),
        features.get("group_size", 4),
        features.get("topic_approval_delay_days", 5),
    ]

    X = np.array([feature_values])
    prediction = risk_pipeline.predict(X)[0]
    probabilities = risk_pipeline.predict_proba(X)[0]

    # Feature importances
    classifier = risk_pipeline.named_steps["classifier"]
    importances = dict(zip(FEATURE_NAMES, [round(float(v), 4) for v in classifier.feature_importances_]))

    return {
        "risk_label": LABEL_MAP.get(int(prediction), "unknown"),
        "probability": round(float(max(probabilities)), 4),
        "feature_importances": importances,
        "model_version": "1.0-gradient-boosting",
    }
