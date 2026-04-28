import httpx

url = "https://saurav.tech/NewsAPI/top-headlines/category/technology/us.json"
try:
    with httpx.Client(timeout=10.0) as client:
        response = client.get(url)
        print(f"STATUS: {response.status_code}")
        print(f"COUNT: {len(response.json().get('articles', []))}")
except Exception as e:
    print(f"ERROR: {e}")
