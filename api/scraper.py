from html.parser import HTMLParser
import logging
import re

import httpx

logger = logging.getLogger(__name__)


class ArticleHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self._current_tag = ""
        self._skip_depth = 0
        self._title_parts = []
        self._paragraphs = []
        self._current_text = []
        self.top_image = None

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag in {"script", "style", "noscript", "svg", "nav", "footer", "header"}:
            self._skip_depth += 1
            return

        self._current_tag = tag
        if tag == "meta":
            prop = attrs_dict.get("property") or attrs_dict.get("name")
            if prop in {"og:title", "twitter:title"} and attrs_dict.get("content"):
                self.title = attrs_dict["content"]
            if prop in {"og:image", "twitter:image"} and attrs_dict.get("content"):
                self.top_image = attrs_dict["content"]

        if tag in {"p", "h1", "h2", "h3"}:
            self._current_text = []

    def handle_endtag(self, tag):
        if tag in {"script", "style", "noscript", "svg", "nav", "footer", "header"} and self._skip_depth:
            self._skip_depth -= 1
            return

        if tag == "title" and not self.title:
            self.title = self._clean(" ".join(self._title_parts))

        if tag in {"p", "h1", "h2", "h3"}:
            text = self._clean(" ".join(self._current_text))
            if len(text) > 40:
                self._paragraphs.append(text)
            self._current_text = []

        if self._current_tag == tag:
            self._current_tag = ""

    def handle_data(self, data):
        if self._skip_depth:
            return

        if self._current_tag == "title":
            self._title_parts.append(data)
        elif self._current_tag in {"p", "h1", "h2", "h3"}:
            self._current_text.append(data)

    @staticmethod
    def _clean(value: str) -> str:
        return re.sub(r"\s+", " ", value).strip()

    @property
    def text(self):
        return "\n\n".join(self._paragraphs)


def scrape_article(url: str):
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            )
        }
        with httpx.Client(follow_redirects=True, timeout=20.0, headers=headers) as client:
            response = client.get(url)
            response.raise_for_status()

        parser = ArticleHTMLParser()
        parser.feed(response.text)

        text = parser.text
        if not text:
            return None

        return {
            "title": parser.title or "Unknown Article",
            "text": text,
            "authors": [],
            "summary": text[:500],
            "publish_date": None,
            "top_image": parser.top_image,
        }
    except Exception as e:
        logger.error(f"Error scraping article {url}: {e}")
        return None
