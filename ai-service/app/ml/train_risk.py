"""
Risk Model Training Pipeline
Trains a GradientBoosting classifier on student performance data.
Uses CRISP-DM methodology: Data Understanding → Preparation → Modeling → Evaluation
"""
import os
import sys
import numpy as np
import pandas as pd
import joblib
from datetime import datetime
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_DIR = os.path.join(os.path.dirname(__file__))
DATA_DIR = os.path.join(MODEL_DIR, "data")


def load_and_prepare_data():
    """Load data from Kaggle datasets or generate synthetic training data."""
    csv_path = os.path.join(DATA_DIR, "student_performance.csv")

    if os.path.exists(csv_path):
        logger.info(f"Loading data from {csv_path}")
        df = pd.read_csv(csv_path)
        # Feature engineering from real data
        feature_cols = [c for c in df.columns if c != "risk_label"]
        X = df[feature_cols[:7]].values  # Take first 7 features
        y = df["risk_label"].values if "risk_label" in df.columns else np.zeros(len(df))
    else:
        logger.info("No dataset found — generating synthetic training data")
        np.random.seed(42)
        n = 1000

        X = np.column_stack([
            np.random.uniform(0.1, 1.0, n),        # submission_rate
            np.random.exponential(3, n),             # avg_days_late
            np.random.uniform(1, 10, n),             # mentor_feedback_score
            np.random.poisson(12, n),                # login_frequency_7d
            np.random.normal(65, 20, n).clip(0, 100),# evaluation_score_avg
            np.random.choice([2, 3, 4, 5], n),      # group_size
            np.random.exponential(5, n),             # topic_approval_delay_days
        ])

        risk_score = (
            (1 - X[:, 0]) * 35 +
            X[:, 1] * 4 +
            (10 - X[:, 2]) * 3 +
            np.maximum(0, 20 - X[:, 3]) * 1.5 +
            (100 - X[:, 4]) * 0.4 +
            X[:, 6] * 1.2
        )
        noise = np.random.normal(0, 5, n)
        risk_score += noise
        y = np.digitize(risk_score, bins=[35, 65])

    return X, y


def train_model():
    """Train the risk prediction model with hyperparameter tuning."""
    logger.info("=" * 60)
    logger.info("CRISP-DM: Starting Risk Model Training Pipeline")
    logger.info("=" * 60)

    # 1. Data Understanding & Preparation
    X, y = load_and_prepare_data()
    logger.info(f"Dataset: {X.shape[0]} samples, {X.shape[1]} features")
    logger.info(f"Label distribution: {dict(zip(*np.unique(y, return_counts=True)))}")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # 2. Model Development with Cross-Validation
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", GradientBoostingClassifier(random_state=42)),
    ])

    # Hyperparameter tuning
    param_grid = {
        "classifier__n_estimators": [100, 200],
        "classifier__max_depth": [3, 4, 5],
        "classifier__learning_rate": [0.05, 0.1],
    }

    logger.info("Running GridSearchCV with 5-fold cross-validation...")
    grid_search = GridSearchCV(pipeline, param_grid, cv=5, scoring="f1_macro", n_jobs=-1, verbose=0)
    grid_search.fit(X_train, y_train)

    best_pipeline = grid_search.best_estimator_
    logger.info(f"Best parameters: {grid_search.best_params_}")
    logger.info(f"Best CV F1 score: {grid_search.best_score_:.4f}")

    # 3. Evaluation
    y_pred = best_pipeline.predict(X_test)
    report = classification_report(y_test, y_pred, target_names=["Low", "Medium", "High"])
    logger.info(f"\nClassification Report:\n{report}")

    # AUC-ROC (one-vs-rest for multiclass)
    try:
        y_proba = best_pipeline.predict_proba(X_test)
        auc = roc_auc_score(y_test, y_proba, multi_class="ovr", average="macro")
        logger.info(f"AUC-ROC (macro): {auc:.4f}")
    except Exception as e:
        auc = 0.0
        logger.warning(f"AUC computation failed: {e}")

    # 4. Save model with version
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    versioned_path = os.path.join(MODEL_DIR, f"risk_model_v{timestamp}.pkl")
    latest_path = os.path.join(MODEL_DIR, "risk_model.pkl")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(best_pipeline, versioned_path)
    joblib.dump(best_pipeline, latest_path)

    logger.info(f"✅ Model saved: {versioned_path}")
    logger.info(f"✅ Latest symlink: {latest_path}")

    # Accuracy gate
    if auc < 0.75:
        logger.warning(f"⚠️  Model AUC ({auc:.4f}) below threshold (0.75). Review recommended.")
    else:
        logger.info(f"✅ Model passes accuracy gate (AUC={auc:.4f} >= 0.75)")

    return {"auc": auc, "best_params": grid_search.best_params_, "model_path": latest_path}


if __name__ == "__main__":
    result = train_model()
    print(f"\nTraining complete: {result}")
