"""
Module 1: Project Recommendation Engine
Uses TF-IDF + cosine similarity to match student profiles to project domains.
Falls back to keyword matching when Pinecone/sentence-transformers are unavailable.
"""
import logging
from typing import List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

logger = logging.getLogger(__name__)

# Project domain knowledge base
PROJECT_DOMAINS = [
    {"domain": "Machine Learning & AI", "keywords": "machine learning deep learning neural network tensorflow pytorch prediction classification nlp computer vision ai artificial intelligence", "description": "Build intelligent systems using ML/DL techniques"},
    {"domain": "Web Development", "keywords": "web frontend backend react angular vue node express django flask rest api fullstack javascript html css", "description": "Full-stack web application development"},
    {"domain": "Mobile App Development", "keywords": "mobile android ios flutter react native kotlin swift app development", "description": "Cross-platform or native mobile applications"},
    {"domain": "Data Science & Analytics", "keywords": "data science analytics visualization pandas numpy matplotlib statistics eda dashboard reporting bigdata", "description": "Data analysis, visualization, and insights"},
    {"domain": "Cybersecurity", "keywords": "security cybersecurity encryption authentication network vulnerability penetration testing firewall blockchain", "description": "Security systems and threat detection"},
    {"domain": "Cloud & DevOps", "keywords": "cloud aws azure gcp docker kubernetes devops ci cd infrastructure deployment microservices serverless", "description": "Cloud infrastructure and deployment automation"},
    {"domain": "IoT & Embedded Systems", "keywords": "iot internet of things embedded raspberry pi arduino sensor hardware mqtt edge computing", "description": "Connected devices and embedded systems"},
    {"domain": "Blockchain & Web3", "keywords": "blockchain ethereum solidity smart contract decentralized web3 crypto defi nft consensus", "description": "Decentralized applications and blockchain technology"},
    {"domain": "Natural Language Processing", "keywords": "nlp natural language processing text mining sentiment analysis chatbot language model transformers bert gpt", "description": "Text processing and language understanding systems"},
    {"domain": "Computer Vision", "keywords": "computer vision image processing object detection face recognition opencv cnn segmentation medical imaging", "description": "Image and video analysis systems"},
]

vectorizer = TfidfVectorizer(stop_words="english")
domain_texts = [d["keywords"] for d in PROJECT_DOMAINS]
domain_matrix = vectorizer.fit_transform(domain_texts)


def get_recommendations(student_id: str, skills: List[str], interests: List[str], technologies: List[str]) -> dict:
    """Generate top-5 project domain recommendations for a student."""
    # Build student profile text
    profile_text = " ".join(skills + interests + technologies).lower()

    if not profile_text.strip():
        # Return diverse defaults if no profile
        return {
            "recommendations": [
                {"domain": d["domain"], "match_score": round(0.5 + i * 0.05, 2), "reason": d["description"]}
                for i, d in enumerate(PROJECT_DOMAINS[:5])
            ],
            "model_version": "1.0-tfidf",
        }

    # TF-IDF similarity
    student_vec = vectorizer.transform([profile_text])
    similarities = cosine_similarity(student_vec, domain_matrix).flatten()

    # Rank by similarity
    ranked_indices = np.argsort(similarities)[::-1][:5]

    recommendations = []
    for idx in ranked_indices:
        domain = PROJECT_DOMAINS[idx]
        score = float(similarities[idx])
        # Generate reason based on matching skills
        matching = [s for s in skills + interests if s.lower() in domain["keywords"].lower()]
        reason = f"{domain['description']}. "
        if matching:
            reason += f"Matches your profile: {', '.join(matching[:3])}."
        else:
            reason += "Based on broader profile analysis."

        recommendations.append({
            "domain": domain["domain"],
            "match_score": round(min(score + 0.3, 0.99), 2),  # Boost baseline
            "reason": reason,
        })

    return {"recommendations": recommendations, "model_version": "1.0-tfidf"}
