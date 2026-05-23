"""
Module 4: AI Team Formation
Uses K-Means clustering on skill vectors to form balanced teams.
"""
import logging
import numpy as np
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from typing import List
from collections import Counter

logger = logging.getLogger(__name__)


def form_teams(students: List[dict], team_size: int) -> dict:
    """Form balanced teams using K-Means clustering on student skill embeddings."""
    if len(students) < 2:
        return {"teams": [[s.get("id", str(i)) for i, s in enumerate(students)]], "diversity_scores": [1.0]}

    n_teams = max(1, len(students) // team_size)

    # Build skill text for each student
    skill_texts = []
    student_ids = []
    for s in students:
        skills = s.get("skills", [])
        interests = s.get("interests", [])
        text = " ".join(skills + interests) if (skills or interests) else "general"
        skill_texts.append(text)
        student_ids.append(s.get("id", str(len(student_ids))))

    # TF-IDF vectorization of skills
    vectorizer = TfidfVectorizer(stop_words="english")
    X = vectorizer.fit_transform(skill_texts)

    # K-Means clustering
    if n_teams >= len(students):
        # Each student is their own team
        teams = [[sid] for sid in student_ids]
    else:
        kmeans = KMeans(n_clusters=n_teams, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)

        # Group students by cluster
        cluster_teams = {i: [] for i in range(n_teams)}
        for sid, label in zip(student_ids, labels):
            cluster_teams[label].append(sid)

        # Balance teams — redistribute from oversized to undersized
        teams_list = list(cluster_teams.values())
        teams_list.sort(key=len, reverse=True)

        # Rebalance pass
        for _ in range(3):  # Up to 3 rebalance passes
            max_team = max(teams_list, key=len)
            min_team = min(teams_list, key=len)
            if len(max_team) - len(min_team) > 1:
                member = max_team.pop()
                min_team.append(member)

        teams = [t for t in teams_list if t]  # Remove empty

    # Calculate diversity score per team (ratio of unique skills to total)
    diversity_scores = []
    for team in teams:
        team_skills = []
        for sid in team:
            idx = student_ids.index(sid) if sid in student_ids else -1
            if idx >= 0:
                s = students[idx]
                team_skills.extend(s.get("skills", []))
        unique = len(set(team_skills))
        total = max(len(team_skills), 1)
        diversity_scores.append(round(unique / total, 2))

    return {"teams": teams, "diversity_scores": diversity_scores}
