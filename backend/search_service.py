import os
import httpx
import logging
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

SERPER_API_KEY = os.getenv("SERPER_API_KEY")

async def search_cross_verify(query: str) -> List[Dict]:
    """
    Search for the news claim on the web to find supporting or debunking articles.
    Returns a list of search results.
    """
    if not SERPER_API_KEY:
        logger.warning("SERPER_API_KEY not found. Skipping live search verification.")
        return []

    url = "https://google.serper.dev/search"
    payload = {
        "q": query,
        "num": 5
    }
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            
            results = []
            for result in data.get('organic', []):
                results.append({
                    "title": result.get('title'),
                    "link": result.get('link'),
                    "snippet": result.get('snippet'),
                    "source": result.get('source', 'Unknown')
                })
            return results
    except Exception as e:
        logger.error(f"Search verification failed: {e}")
        return []
