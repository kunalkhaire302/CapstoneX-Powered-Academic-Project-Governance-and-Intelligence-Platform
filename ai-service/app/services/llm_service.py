"""
LLM Service Wrapper
Handles interactions with LLMs (OpenAI, local models) with fallback logic and structured output support.
"""
import os
import json
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Try to import openai, but don't fail if not installed
try:
    import openai
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("OpenAI SDK not found. LLM service will use fallbacks.")


async def generate_structured_response(prompt: str, schema: Dict[str, Any]) -> Optional[Dict]:
    """
    Generate a structured JSON response from an LLM based on a JSON schema.
    
    Args:
        prompt: The prompt text
        schema: JSON Schema dict defining the expected output structure
        
    Returns:
        Parsed dictionary matching the schema, or None if failed
    """
    provider = os.getenv("LLM_PROVIDER", "fallback").lower()
    api_key = os.getenv("OPENAI_API_KEY", "")
    
    if provider == "openai" and OPENAI_AVAILABLE and api_key:
        return await _generate_openai_structured(prompt, schema, api_key)
    
    # Fallback or unknown provider
    logger.warning(f"LLM Provider '{provider}' not available or configured. Using None.")
    return None


async def _generate_openai_structured(prompt: str, schema: Dict[str, Any], api_key: str) -> Optional[Dict]:
    """Use OpenAI's JSON mode / Function Calling to get structured output."""
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    
    try:
        base_url = os.getenv("OPENAI_BASE_URL")
        client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url if base_url else None
        )
        
        # Inject instruction to return JSON matching the schema
        system_prompt = (
            "You are an AI assistant for a university capstone project management platform. "
            "You must respond ONLY with valid JSON that matches the provided JSON schema. "
            "Do not include markdown blocks, explanations, or any text outside the JSON object.\n\n"
            f"Expected JSON Schema:\n{json.dumps(schema)}"
        )
        
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=1000,
        )
        
        content = response.choices[0].message.content
        return json.loads(content)
        
    except Exception as e:
        logger.error(f"OpenAI API call failed: {e}")
        return None


async def generate_text(prompt: str, system_prompt: str = "You are a helpful assistant.") -> str:
    """Generate standard text response."""
    provider = os.getenv("LLM_PROVIDER", "fallback").lower()
    api_key = os.getenv("OPENAI_API_KEY", "")
    
    if provider == "openai" and OPENAI_AVAILABLE and api_key:
        try:
            base_url = os.getenv("OPENAI_BASE_URL")
            client = AsyncOpenAI(
                api_key=api_key,
                base_url=base_url if base_url else None
            )
            model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
            
            response = await client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=1500,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"OpenAI text generation failed: {e}")
            
    if provider == "local":
        try:
            logger.info("Using local GPT-2 model for text generation...")
            # Lazy import to save memory if not used
            from transformers import pipeline
            # Keep in memory to avoid reloading every time (simple cache)
            if not hasattr(generate_text, "_pipeline"):
                generate_text._pipeline = pipeline("text-generation", model="openai-community/gpt2")
            
            # GPT-2 works better if we combine the system prompt
            full_prompt = f"{system_prompt}\nUser: {prompt}\nAssistant:"
            
            # Generate
            results = generate_text._pipeline(
                full_prompt, 
                max_new_tokens=150, 
                num_return_sequences=1,
                temperature=0.7,
                pad_token_id=50256 # EOS token id for GPT2
            )
            
            generated_text = results[0]["generated_text"]
            # Extract just the assistant's reply
            reply = generated_text.replace(full_prompt, "").strip()
            return reply if reply else "I understand."
            
        except ImportError:
            logger.error("transformers library is required for local text generation.")
        except Exception as e:
            logger.error(f"Local text generation failed: {e}")

    return "AI text generation is currently unavailable."
