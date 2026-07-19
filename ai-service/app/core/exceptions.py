"""
Custom Exception Hierarchy for CapstoneX AI Service.
Provides structured error handling for ML pipelines and API endpoints.
"""


class CapstoneXAIError(Exception):
    """Base exception for all AI service errors."""

    def __init__(self, message: str, details: dict = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class ModelNotReadyError(CapstoneXAIError):
    """Raised when a model is not loaded or not trained yet."""

    def __init__(self, model_name: str):
        super().__init__(
            f"Model '{model_name}' is not ready. It may not be trained yet or failed to load.",
            {"model_name": model_name},
        )


class InsufficientDataError(CapstoneXAIError):
    """Raised when there isn't enough data to train or make predictions."""

    def __init__(self, model_name: str, required: int, available: int):
        super().__init__(
            f"Insufficient data for '{model_name}': need {required}, have {available}. "
            f"Using heuristic fallback.",
            {"model_name": model_name, "required": required, "available": available},
        )


class FeatureExtractionError(CapstoneXAIError):
    """Raised when feature extraction fails for a prediction."""

    def __init__(self, entity_type: str, entity_id: str, reason: str):
        super().__init__(
            f"Feature extraction failed for {entity_type} '{entity_id}': {reason}",
            {"entity_type": entity_type, "entity_id": entity_id},
        )


class ModelTrainingError(CapstoneXAIError):
    """Raised when model training fails."""

    def __init__(self, model_name: str, reason: str):
        super().__init__(
            f"Training failed for model '{model_name}': {reason}",
            {"model_name": model_name},
        )


class PlagiarismCheckError(CapstoneXAIError):
    """Raised when plagiarism check fails."""

    def __init__(self, reason: str):
        super().__init__(f"Plagiarism check failed: {reason}")


class LLMServiceError(CapstoneXAIError):
    """Raised when LLM API call fails."""

    def __init__(self, provider: str, reason: str):
        super().__init__(
            f"LLM service error ({provider}): {reason}",
            {"provider": provider},
        )


class VectorStoreError(CapstoneXAIError):
    """Raised when vector store operations fail."""

    def __init__(self, operation: str, reason: str):
        super().__init__(
            f"Vector store {operation} failed: {reason}",
            {"operation": operation},
        )
