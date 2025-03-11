import os
import requests
from dotenv import load_dotenv

load_dotenv('.env.production')

def google_search(query):
    try:
        api_key = os.getenv('GOOGLE_API_KEY')
        cse_id = os.getenv('CSE_ID')
        url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={api_key}&cx={cse_id}"
        
        response = requests.get(url)
        response.raise_for_status()
        
        items = response.json().get('items', [])
        return {
            'success': True,
            'results': [{
                'title': item.get('title'),
                'link': item.get('link'),
                'snippet': item.get('snippet')
            } for item in items]
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == "__main__":
    # Test the search function
    results = google_search("sample test query")
    print(results)
