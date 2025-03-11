import requests
from bs4 import BeautifulSoup
import json
import os
import time
import random
from tqdm import tqdm

def scrape_maharashtra_colleges():
    """
    Scrape information about colleges in Maharashtra from multiple sources
    and compile them into a comprehensive database.
    """
    colleges = []
    
    # Sources to scrape
    sources = [
        {
            "name": "Shiksha",
            "url": "https://www.shiksha.com/b-tech/colleges/b-tech-colleges-maharashtra",
            "parser": parse_shiksha
        },
        {
            "name": "College Dunia",
            "url": "https://collegedunia.com/btech/maharashtra-colleges",
            "parser": parse_collegedunia
        },
        {
            "name": "GetMyUni",
            "url": "https://www.getmyuni.com/engineering-colleges-in-maharashtra",
            "parser": parse_getmyuni
        }
    ]
    
    # Scrape each source
    for source in sources:
        print(f"Scraping from {source['name']}...")
        try:
            source_colleges = source["parser"](source["url"])
            colleges.extend(source_colleges)
            print(f"Found {len(source_colleges)} colleges from {source['name']}")
        except Exception as e:
            print(f"Error scraping {source['name']}: {str(e)}")
        
        # Add delay to avoid overloading servers
        time.sleep(random.uniform(2, 5))
    
    # Fetch data from collegeAPI
    print("Fetching data from collegeAPI...")
    api_colleges = fetch_from_college_api()
    colleges.extend(api_colleges)
    print(f"Found {len(api_colleges)} colleges from collegeAPI")
    
    # Fetch data from data.gov.in (template for future integration)
    data_gov_colleges = fetch_from_data_gov_in()
    if data_gov_colleges:
        colleges.extend(data_gov_colleges)
        print(f"Found {len(data_gov_colleges)} colleges from data.gov.in")
    
    # Fetch data from API Setu (template for future integration)
    api_setu_colleges = fetch_from_api_setu()
    if api_setu_colleges:
        colleges.extend(api_setu_colleges)
        print(f"Found {len(api_setu_colleges)} colleges from API Setu")
    
    # Remove duplicates based on college name
    unique_colleges = []
    college_names = set()
    
    for college in colleges:
        if college["name"] not in college_names:
            college_names.add(college["name"])
            unique_colleges.append(college)
        else:
            # If college already exists, merge additional information
            for existing_college in unique_colleges:
                if existing_college["name"] == college["name"]:
                    # Merge missing information
                    for key, value in college.items():
                        if key not in existing_college or not existing_college[key]:
                            existing_college[key] = value
                    break
    
    print(f"Total unique colleges found: {len(unique_colleges)}")
    
    # Save to JSON file
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    
    output_file = os.path.join(data_dir, 'maharashtra_colleges.json')
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(unique_colleges, f, indent=2, ensure_ascii=False)
    
    print(f"College data saved to {output_file}")
    return unique_colleges

def parse_shiksha(url):
    """Parse college data from Shiksha website"""
    colleges = []
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find college listings
    college_cards = soup.select('.tuple-clg-card')
    
    for card in college_cards:
        try:
            name_elem = card.select_one('.tuple-clg-heading a')
            location_elem = card.select_one('.loc-icn')
            fees_elem = card.select_one('.fee-col p')
            rating_elem = card.select_one('.rating-col .rating-val')
            
            if name_elem:
                name = name_elem.text.strip()
                url = "https://www.shiksha.com" + name_elem['href'] if name_elem.has_attr('href') else ""
                location = location_elem.text.strip() if location_elem else "Maharashtra"
                fees = fees_elem.text.strip() if fees_elem else "Contact college for fee details"
                rating = rating_elem.text.strip() if rating_elem else "Not rated"
                
                college = {
                    "name": name,
                    "location": location,
                    "website": url,
                    "fees": fees,
                    "rating": rating,
                    "courses": ["B.Tech", "Engineering"],
                    "admission_process": "Entrance exam based (JEE/MHT-CET)",
                    "source": "Shiksha"
                }
                
                colleges.append(college)
        except Exception as e:
            print(f"Error parsing college card: {str(e)}")
    
    return colleges

def parse_collegedunia(url):
    """Parse college data from CollegeDunia website"""
    colleges = []
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find college listings
    college_cards = soup.select('.college_listing')
    
    for card in college_cards:
        try:
            name_elem = card.select_one('.college_name a')
            location_elem = card.select_one('.clg-loc-rev span')
            fees_elem = card.select_one('.fee_component')
            rating_elem = card.select_one('.rating_val')
            
            if name_elem:
                name = name_elem.text.strip()
                url = "https://collegedunia.com" + name_elem['href'] if name_elem.has_attr('href') else ""
                location = location_elem.text.strip() if location_elem else "Maharashtra"
                fees = fees_elem.text.strip() if fees_elem else "Contact college for fee details"
                rating = rating_elem.text.strip() if rating_elem else "Not rated"
                
                college = {
                    "name": name,
                    "location": location,
                    "website": url,
                    "fees": fees,
                    "rating": rating,
                    "courses": ["B.Tech", "Engineering"],
                    "admission_process": "Entrance exam based (JEE/MHT-CET)",
                    "source": "CollegeDunia"
                }
                
                colleges.append(college)
        except Exception as e:
            print(f"Error parsing college card: {str(e)}")
    
    return colleges

def parse_getmyuni(url):
    """Parse college data from GetMyUni website"""
    colleges = []
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find college listings
    college_cards = soup.select('.clg-list-card')
    
    for card in college_cards:
        try:
            name_elem = card.select_one('.clg-name a')
            location_elem = card.select_one('.location-name')
            fees_elem = card.select_one('.fees-str')
            rating_elem = card.select_one('.rating')
            
            if name_elem:
                name = name_elem.text.strip()
                url = "https://www.getmyuni.com" + name_elem['href'] if name_elem.has_attr('href') else ""
                location = location_elem.text.strip() if location_elem else "Maharashtra"
                fees = fees_elem.text.strip() if fees_elem else "Contact college for fee details"
                rating = rating_elem.text.strip() if rating_elem else "Not rated"
                
                college = {
                    "name": name,
                    "location": location,
                    "website": url,
                    "fees": fees,
                    "rating": rating,
                    "courses": ["B.Tech", "Engineering"],
                    "admission_process": "Entrance exam based (JEE/MHT-CET)",
                    "source": "GetMyUni"
                }
                
                colleges.append(college)
        except Exception as e:
            print(f"Error parsing college card: {str(e)}")
    
    return colleges

def fetch_from_college_api():
    """
    Fetch college data from the Clueless-Community collegeAPI
    GitHub: https://github.com/Clueless-Community/collegeAPI
    """
    colleges = []
    
    # Base URL for the collegeAPI
    base_url = "https://collegeapi.vercel.app"
    
    # Endpoints to fetch data from
    endpoints = [
        # General engineering colleges in Maharashtra
        f"{base_url}/engineering_colleges/state=Maharashtra",
        # NIRF ranked engineering colleges in Maharashtra
        f"{base_url}/engineering_colleges/nirf",
        # Engineering colleges in specific cities of Maharashtra
        f"{base_url}/engineering_colleges/city=Mumbai",
        f"{base_url}/engineering_colleges/city=Pune",
        f"{base_url}/engineering_colleges/city=Nagpur"
    ]
    
    # Fetch data from each endpoint
    for endpoint in tqdm(endpoints, desc="Fetching from collegeAPI"):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(endpoint, headers=headers)
            
            # Check if request was successful
            if response.status_code == 200:
                data = response.json()
                
                # Process each college in the response
                for college_data in data.get('data', []):
                    # Extract relevant information
                    college = {
                        "name": college_data.get('name', ''),
                        "location": f"{college_data.get('city', '')}, {college_data.get('state', 'Maharashtra')}",
                        "website": college_data.get('website', ''),
                        "fees": college_data.get('fees', 'Contact college for fee details'),
                        "rating": college_data.get('nirf_rank', 'Not rated'),
                        "courses": college_data.get('courses', ["B.Tech", "Engineering"]),
                        "admission_process": college_data.get('admission_process', "Entrance exam based (JEE/MHT-CET)"),
                        "source": "collegeAPI",
                        "established": college_data.get('established', ''),
                        "type": college_data.get('type', ''),
                        "approved_by": college_data.get('approved_by', []),
                        "address": college_data.get('address', '')
                    }
                    
                    colleges.append(college)
                
                print(f"Found {len(data.get('data', []))} colleges from endpoint: {endpoint}")
            else:
                print(f"Failed to fetch data from {endpoint}. Status code: {response.status_code}")
                
            # Add delay to avoid overloading servers
            time.sleep(random.uniform(1, 3))
            
        except Exception as e:
            print(f"Error fetching data from {endpoint}: {str(e)}")
    
    return colleges

def fetch_from_data_gov_in():
    """
    Fetch college data from data.gov.in using their API
    Source: https://www.data.gov.in/search?sectors=Education%24&type=resources&title=maharashtra&sortby=_score
    """
    colleges = []
    
    try:
        print("Attempting to fetch data from data.gov.in...")
        
        # Data.gov.in requires API key for most endpoints, but some datasets are available through direct URLs
        # Here we're using a sample approach that would work with proper API access
        
        # For demonstration, we'll create a structured approach to handle this data source
        # In a production environment, you would register for an API key and use their API endpoints
        
        # Sample datasets that might be available (these are examples)
        datasets = [
            {
                "name": "Maharashtra Engineering Colleges",
                "url": "https://www.data.gov.in/resources/directory-engineering-colleges-maharashtra",
                "parser": lambda data: parse_engineering_colleges_data(data)
            },
            {
                "name": "Maharashtra University Data",
                "url": "https://www.data.gov.in/resources/university-data-maharashtra",
                "parser": lambda data: parse_university_data(data)
            }
        ]
        
        # Note: Since we can't directly access the data.gov.in API without registration,
        # this function is structured as a template that can be completed when API access is available
        
        print("Note: Full integration with data.gov.in requires API registration.")
        print("This function is prepared as a template for when API access is available.")
        
        # When API access is available, you would:
        # 1. Register for an API key at data.gov.in
        # 2. Use their API endpoints to fetch the data
        # 3. Parse the response and extract college information
        
        # For now, we'll return an empty list, but the structure is in place for future integration
        
    except Exception as e:
        print(f"Error fetching data from data.gov.in: {str(e)}")
    
    return colleges

def fetch_from_api_setu():
    """
    Fetch college data from API Setu government APIs
    Source: https://directory.apisetu.gov.in/search/org-type/state-government
    """
    colleges = []
    
    try:
        print("Attempting to fetch data from API Setu...")
        
        # API Setu requires registration and authentication for most endpoints
        # Here we're creating a structured approach for future integration
        
        # For demonstration, we'll outline how this would work with proper API access
        
        # Sample endpoints that might be available for education data
        endpoints = [
            {
                "name": "Maharashtra Higher Education Department",
                "url": "https://api.maharashtra.gov.in/education/colleges",
                "auth_required": True
            },
            {
                "name": "Maharashtra Technical Education",
                "url": "https://api.maharashtra.gov.in/technical-education/institutes",
                "auth_required": True
            }
        ]
        
        # Note: Since we can't directly access the API Setu endpoints without registration,
        # this function is structured as a template that can be completed when API access is available
        
        print("Note: Full integration with API Setu requires registration and authentication.")
        print("This function is prepared as a template for when API access is available.")
        
        # When API access is available, you would:
        # 1. Register at API Setu and get authentication credentials
        # 2. Use their API endpoints to fetch the data
        # 3. Parse the response and extract college information
        
        # For now, we'll return an empty list, but the structure is in place for future integration
        
    except Exception as e:
        print(f"Error fetching data from API Setu: {str(e)}")
    
    return colleges

def parse_engineering_colleges_data(data):
    """
    Parse engineering colleges data from data.gov.in
    This is a template function that would be implemented when API access is available
    """
    colleges = []
    
    # Implementation would depend on the actual data structure returned by the API
    # This is a placeholder for future implementation
    
    return colleges

def parse_university_data(data):
    """
    Parse university data from data.gov.in
    This is a template function that would be implemented when API access is available
    """
    colleges = []
    
    # Implementation would depend on the actual data structure returned by the API
    # This is a placeholder for future implementation
    
    return colleges

if __name__ == "__main__":
    print("Starting to scrape Maharashtra college data...")
    colleges = scrape_maharashtra_colleges()
    print(f"Scraping completed. Found {len(colleges)} unique colleges.")
