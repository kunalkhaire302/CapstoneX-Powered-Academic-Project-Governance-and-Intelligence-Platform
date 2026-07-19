"""
Module 1: Project Recommendation Engine
Uses semantic embeddings + cosine similarity to match student profiles to project domains.
"""
import logging
from typing import List
import numpy as np

from app.services.embedding_service import generate_embedding

logger = logging.getLogger(__name__)

# Project domain knowledge base with difficulty and risk estimates
PROJECT_DOMAINS = [
    {"domain": "Machine Learning & AI", "keywords": "machine learning deep learning neural network tensorflow pytorch prediction classification nlp computer vision ai artificial intelligence", "description": "Build intelligent systems using ML/DL techniques", "difficulty": "Hard", "risk": "High (Data dependency)"},
    {"domain": "Web Development", "keywords": "web frontend backend react angular vue node express django flask rest api fullstack javascript html css", "description": "Full-stack web application development", "difficulty": "Medium", "risk": "Low (Well-documented)"},
    {"domain": "Mobile App Development", "keywords": "mobile android ios flutter react native kotlin swift app development", "description": "Cross-platform or native mobile applications", "difficulty": "Medium", "risk": "Medium (Device compatibility)"},
    {"domain": "Data Science & Analytics", "keywords": "data science analytics visualization pandas numpy matplotlib statistics eda dashboard reporting bigdata", "description": "Data analysis, visualization, and insights", "difficulty": "Medium", "risk": "Medium (Data quality)"},
    {"domain": "Cybersecurity", "keywords": "security cybersecurity encryption authentication network vulnerability penetration testing firewall blockchain", "description": "Security systems and threat detection", "difficulty": "Hard", "risk": "High (Setup complexity)"},
    {"domain": "Cloud & DevOps", "keywords": "cloud aws azure gcp docker kubernetes devops ci cd infrastructure deployment microservices serverless", "description": "Cloud infrastructure and deployment automation", "difficulty": "Hard", "risk": "High (Cost and config)"},
    {"domain": "IoT & Embedded Systems", "keywords": "iot internet of things embedded raspberry pi arduino sensor hardware mqtt edge computing", "description": "Connected devices and embedded systems", "difficulty": "Hard", "risk": "High (Hardware dependency)"},
    {"domain": "Blockchain & Web3", "keywords": "blockchain ethereum solidity smart contract decentralized web3 crypto defi nft consensus", "description": "Decentralized applications and blockchain technology", "difficulty": "Hard", "risk": "High (Emerging tech)"},
    {"domain": "Natural Language Processing", "keywords": "nlp natural language processing text mining sentiment analysis chatbot language model transformers bert gpt", "description": "Text processing and language understanding systems", "difficulty": "Medium-Hard", "risk": "Medium (Compute cost)"},
    {"domain": "Computer Vision", "keywords": "computer vision image processing object detection face recognition opencv cnn segmentation medical imaging", "description": "Image and video analysis systems", "difficulty": "Hard", "risk": "High (Performance tuning)"},
]

# Generate domain embeddings lazily
_domain_embeddings = None
_faiss_index = None

def _get_domain_embeddings():
    global _domain_embeddings, _faiss_index
    if _domain_embeddings is None:
        try:
            import faiss
            _domain_embeddings = []
            for d in PROJECT_DOMAINS:
                text = f"{d['domain']}. {d['keywords']}"
                emb = generate_embedding(text)
                _domain_embeddings.append(emb)
            
            emb_matrix = np.array(_domain_embeddings, dtype=np.float32)
            norms = np.linalg.norm(emb_matrix, axis=1, keepdims=True)
            norms[norms == 0] = 1
            emb_matrix = emb_matrix / norms
            
            _faiss_index = faiss.IndexFlatIP(emb_matrix.shape[1])
            _faiss_index.add(emb_matrix)
        except ImportError:
            logger.warning("FAISS not found, falling back to numpy")
            _domain_embeddings = []
            for d in PROJECT_DOMAINS:
                text = f"{d['domain']}. {d['keywords']}"
                emb = generate_embedding(text)
                _domain_embeddings.append(emb)
    return _domain_embeddings

def get_recommendations(student_id: str, skills: List[str], interests: List[str], technologies: List[str]) -> dict:
    """Generate top-10 project domain recommendations for a student."""
    profile_text = " ".join(skills + interests + technologies).lower()

    if not profile_text.strip():
        return {
            "recommendations": [
                {
                    "domain": d["domain"],
                    "match_score": round(0.5 + i * 0.02, 2),
                    "novelty_score": round(np.random.uniform(0.6, 0.9), 2),
                    "reason": d["description"],
                    "difficulty": d["difficulty"],
                    "risk_analysis": d["risk"],
                }
                for i, d in enumerate(PROJECT_DOMAINS[:10])
            ],
            "model_version": "3.0-faiss",
        }

    student_emb = generate_embedding(profile_text)
    student_emb = np.array(student_emb, dtype=np.float32).reshape(1, -1)
    
    norm = np.linalg.norm(student_emb)
    if norm > 0:
        student_emb = student_emb / norm
        
    _get_domain_embeddings()
    
    similarities = []
    ranked_indices = []
    
    if _faiss_index is not None:
        scores, indices = _faiss_index.search(student_emb, 10)
        similarities = scores[0].tolist()
        ranked_indices = indices[0].tolist()
    else:
        # Fallback
        domain_embs = np.array(_domain_embeddings, dtype=np.float32)
        norms = np.linalg.norm(domain_embs, axis=1, keepdims=True)
        norms[norms == 0] = 1
        domain_embs = domain_embs / norms
        sims = (domain_embs @ student_emb.T).flatten()
        ranked_indices = np.argsort(sims)[::-1][:10].tolist()
        similarities = [float(sims[idx]) for idx in ranked_indices]

    recommendations = []
    for rank, (idx, score) in enumerate(zip(ranked_indices, similarities)):
        domain = PROJECT_DOMAINS[idx]
        
        # Novelty score: less popular items or random variation get higher novelty
        base_novelty = 1.0 - (rank * 0.05)
        novelty_score = round(min(max(base_novelty + np.random.uniform(-0.1, 0.1), 0.1), 0.99), 2)
        
        matching = [s for s in skills + interests if s.lower() in domain["keywords"].lower()]
        reason = f"{domain['description']}. "
        if matching:
            reason += f"Strong semantic match with your skills: {', '.join(matching[:3])}."
        else:
            reason += "Aligns with your overall profile semantics."

        recommendations.append({
            "domain": domain["domain"],
            "match_score": round(min(score + 0.2, 0.99), 2),
            "novelty_score": novelty_score,
            "reason": reason,
            "difficulty": domain["difficulty"],
            "risk_analysis": domain["risk"],
        })

    return {"recommendations": recommendations, "model_version": "3.0-faiss"}
