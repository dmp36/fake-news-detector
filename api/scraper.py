from newspaper import Article, Config
import nltk
import httpx
import logging

logger = logging.getLogger(__name__)

# Ensure necessary NLTK data is downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

def scrape_article(url: str):
    try:
        config = Config()
        config.browser_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        config.request_timeout = 15
        
        # Try primary scraping method (newspaper's internal downloader)
        article = Article(url, config=config)
        try:
            article.download()
            article.parse()
            if not article.text or len(article.text) < 100:
                raise Exception("Insufficient text extracted via newspaper download")
        except Exception as primary_error:
            logger.warning(f"Primary scraping failed for {url}: {primary_error}. Trying fallback...")
            
            # Fallback: Download HTML manually using httpx and pass to newspaper
            with httpx.Client(follow_redirects=True, timeout=20.0, headers={"User-Agent": config.browser_user_agent}) as client:
                response = client.get(url)
                response.raise_for_status()
                html = response.text
                
                article = Article(url, config=config)
                article.set_html(html)
                article.parse()
        
        article.nlp()
        
        if not article.text:
            return None

        return {
            "title": article.title,
            "text": article.text,
            "authors": article.authors,
            "summary": article.summary,
            "publish_date": str(article.publish_date) if article.publish_date else None,
            "top_image": article.top_image
        }
    except Exception as e:
        logger.error(f"Error scraping article {url}: {e}")
        return None
