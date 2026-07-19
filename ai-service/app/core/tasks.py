"""
Background Tasks & Continuous Learning
Manages scheduled tasks for the AI service.
"""
import asyncio
import logging
import os
from datetime import datetime, timedelta
from typing import Optional

logger = logging.getLogger(__name__)

_tasks = []


async def start_background_tasks():
    """Start all background tasks."""
    logger.info("Starting background tasks...")
    
    # Task 1: Vector Store Sync
    sync_task = asyncio.create_task(_sync_vector_store_loop())
    _tasks.append(sync_task)
    
    # Task 2: Model Retraining Check
    retrain_task = asyncio.create_task(_check_retraining_loop())
    _tasks.append(retrain_task)


async def stop_background_tasks():
    """Stop all background tasks."""
    logger.info("Stopping background tasks...")
    for task in _tasks:
        if not task.done():
            task.cancel()
    
    if _tasks:
        await asyncio.gather(*_tasks, return_exceptions=True)
    _tasks.clear()


async def _sync_vector_store_loop():
    """Periodically sync new projects from the database to the FAISS index."""
    sync_interval = int(os.getenv("VECTOR_SYNC_INTERVAL_SECONDS", "3600"))
    
    while True:
        try:
            # Wait first (we assume initial load happens on startup)
            await asyncio.sleep(sync_interval)
            
            logger.info("Starting scheduled vector store sync...")
            from app.services.vector_store import sync_with_database
            
            added, updated, removed = await sync_with_database()
            if added > 0 or updated > 0 or removed > 0:
                logger.info(f"Vector sync complete. Added: {added}, Updated: {updated}, Removed: {removed}")
            else:
                logger.debug("Vector sync complete. No changes.")
                
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in vector sync loop: {e}", exc_info=True)
            await asyncio.sleep(60)  # Retry shortly


async def _check_retraining_loop():
    """Check if ML models (Risk) need retraining based on schedule or performance degradation."""
    check_interval = int(os.getenv("RETRAINING_CHECK_INTERVAL_SECONDS", "86400")) # Daily
    
    while True:
        try:
            await asyncio.sleep(check_interval)
            
            logger.info("Checking if model retraining is needed...")
            # In a full production system, this would query a model monitoring service
            # For now, we simulate the check
            
            from app.ml.train_risk import train_model
            from app.services.risk_service import load_risk_model
            
            # Simple heuristic: retrain if it's Sunday 2AM
            now = datetime.now()
            if now.weekday() == 6 and now.hour == 2:
                logger.info("Triggering scheduled weekly model retraining...")
                
                # Run in a thread to avoid blocking the event loop
                loop = asyncio.get_running_loop()
                result = await loop.run_in_executor(None, train_model)
                
                logger.info(f"Retraining complete. New model AUC: {result.get('auc', 0):.4f}")
                
                # Reload model into memory
                load_risk_model()
                
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Error in retraining check loop: {e}", exc_info=True)
            await asyncio.sleep(3600)
