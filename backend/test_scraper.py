from scraper import scrape_article
import sys

url = "https://www.example.com"
result = scrape_article(url)

if result:
    print("SUCCESS")
    print(f"Title: {result['title']}")
    print(f"Text length: {len(result['text'])}")
else:
    print("FAILED")
