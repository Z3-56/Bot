import os
import json
import random
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator
import requests
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv('.env.production')

app = Flask(__name__)
CORS(app)

# Load Indian education data
data_path = os.path.join(os.path.dirname(__file__), 'data', 'indian_education_data.json')
with open(data_path, 'r', encoding='utf-8') as f:
    indian_education_data = json.load(f)

# Load Maharashtra college data if available
maharashtra_colleges_path = os.path.join(os.path.dirname(__file__), 'data', 'maharashtra_colleges.json')
maharashtra_colleges = []
if os.path.exists(maharashtra_colleges_path):
    try:
        with open(maharashtra_colleges_path, 'r', encoding='utf-8') as f:
            maharashtra_colleges = json.load(f)
        print(f"Loaded {len(maharashtra_colleges)} Maharashtra colleges")
    except Exception as e:
        print(f"Error loading Maharashtra colleges: {str(e)}")

# Initialize conversation history
conversation_history = []

# Language codes and names
LANGUAGES = {
    'en': 'English',
    'hi': 'Hindi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'bn': 'Bengali',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi'
}

@app.route('/api/languages', methods=['GET'])
def get_languages():
    return jsonify(LANGUAGES)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        if not request.is_json:
            print("ERROR: Received non-JSON request")
            return jsonify({"error": "Request must be JSON"}), 400
            
        data = request.get_json()
        print(f"Received API request: {data}")
        
        message = data.get('message', '')
        user_lang = data.get('language', 'en')
        
        # Add user message to conversation history
        conversation_history.append({'role': 'user', 'content': message})
        
        # Keep only the last 10 messages for context
        if len(conversation_history) > 10:
            conversation_history.pop(0)
        
        # Detect language if not specified
        if user_lang == 'auto':
            try:
                # deep-translator doesn't have a direct detect method, so we'll default to English
                user_lang = 'en'
            except:
                user_lang = 'en'
        
        # Check for common queries first
        response = check_common_queries(message.lower())
        
        # If not a common query, search for educational information
        if not response:
            # Translate to English for processing if needed
            query = message
            if user_lang != 'en':
                try:
                    translator = GoogleTranslator(source=user_lang, target='en')
                    query = translator.translate(message)
                except:
                    pass
            
            # Process the query to find relevant information
            response = process_educational_query(query)
        
        # Translate response if needed
        if user_lang != 'en':
            try:
                translator = GoogleTranslator(source='en', target=user_lang)
                response = translator.translate(response)
            except:
                pass
        
        # Add assistant response to conversation history
        conversation_history.append({'role': 'assistant', 'content': response})
        
        return jsonify({
            'response': response,
            'language': user_lang
        })
        
    except Exception as e:
        print(f"API CRASH: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

def check_common_queries(message):
    """Check if the message matches any common queries and return a predefined response"""
    # Check greetings
    for greeting, response in indian_education_data['common_queries']['greetings'].items():
        if greeting in message:
            return response
    
    # Check general queries
    for query, response in indian_education_data['common_queries']['general'].items():
        if query in message:
            return response
    
    return None

def process_educational_query(query):
    """Process educational queries related to Indian colleges, exams, etc."""
    # Get current time for greetings
    current_hour = datetime.now().hour
    greeting = "Good morning! " if 5 <= current_hour < 12 else "Good afternoon! " if 12 <= current_hour < 17 else "Good evening! "
    
    # Check for college-related queries
    if any(keyword in query.lower() for keyword in ['college', 'university', 'institute', 'iit', 'nit', 'aiims', 'iim']):
        return process_college_query(query, greeting)
    
    # Check for exam-related queries
    elif any(keyword in query.lower() for keyword in ['exam', 'entrance', 'jee', 'neet', 'cat', 'xat', 'bitsat']):
        return process_exam_query(query, greeting)
    
    # Check for scholarship-related queries
    elif any(keyword in query.lower() for keyword in ['scholarship', 'financial aid', 'funding', 'stipend']):
        return process_scholarship_query(query, greeting)
    
    # Check for admission-related queries
    elif any(keyword in query.lower() for keyword in ['admission', 'apply', 'application', 'form', 'deadline', 'cutoff']):
        return process_admission_query(query, greeting)
    
    # If no specific category is matched, perform a general search
    else:
        return perform_general_search(query, greeting)

def process_college_query(query, greeting):
    """Process queries related to colleges and universities"""
    response = f"{greeting}Here's what I found about Indian colleges and universities related to your query:\n\n"
    
    # Check for Maharashtra specific queries
    if any(keyword in query.lower() for keyword in ['maharashtra', 'mumbai', 'pune', 'nagpur', 'aurangabad']):
        return process_maharashtra_college_query(query, greeting)
    
    # Check for specific fields
    if any(keyword in query.lower() for keyword in ['engineering', 'tech', 'b.tech', 'm.tech']):
        colleges = indian_education_data['top_colleges']['engineering']
        field = "engineering"
    elif any(keyword in query.lower() for keyword in ['medical', 'mbbs', 'doctor', 'medicine']):
        colleges = indian_education_data['top_colleges']['medical']
        field = "medical"
    elif any(keyword in query.lower() for keyword in ['management', 'mba', 'business', 'pgdm']):
        colleges = indian_education_data['top_colleges']['management']
        field = "management"
    elif any(keyword in query.lower() for keyword in ['arts', 'science', 'ba', 'bsc', 'ma', 'msc']):
        colleges = indian_education_data['top_colleges']['arts_and_science']
        field = "arts and science"
    else:
        # If no specific field, combine top colleges from all fields
        colleges = []
        for field_colleges in indian_education_data['top_colleges'].values():
            colleges.extend(field_colleges[:2])  # Take top 2 from each field
        field = "various fields"
    
    response += f"Top colleges for {field} in India:\n\n"
    
    # Add college information
    for i, college in enumerate(colleges[:5], 1):
        response += f"{i}. {college['name']} ({college['location']})\n"
        response += f"   • Ranking: {college['ranking']}\n"
        response += f"   • Admission: {college['admission_process']}\n"
        response += f"   • Fees: {college['fees']}\n"
        response += f"   • Website: {college['website']}\n\n"
    
    response += "Would you like more specific information about any of these colleges or a different field?"
    
    return response

def process_maharashtra_college_query(query, greeting):
    """Process queries specifically about Maharashtra colleges"""
    if not maharashtra_colleges:
        return process_college_query(query, greeting)  # Fallback to general college query
    
    response = f"{greeting}Here's what I found about colleges in Maharashtra related to your query:\n\n"
    
    # Filter colleges based on query keywords
    filtered_colleges = maharashtra_colleges
    
    # Filter by city if mentioned
    cities = ['mumbai', 'pune', 'nagpur', 'aurangabad', 'nashik', 'amravati', 'solapur', 'kolhapur', 'thane', 'navi mumbai']
    for city in cities:
        if city in query.lower():
            filtered_colleges = [college for college in filtered_colleges if city in college.get('location', '').lower()]
            response = f"{greeting}Here's what I found about colleges in {city.title()}, Maharashtra:\n\n"
            break
    
    # Filter by course/field if mentioned
    if any(keyword in query.lower() for keyword in ['engineering', 'tech', 'b.tech', 'm.tech']):
        filtered_colleges = [college for college in filtered_colleges if any(course.lower() in ['b.tech', 'engineering', 'b.e.'] for course in (college.get('courses', []) if isinstance(college.get('courses', []), list) else [college.get('courses', '')]))]
        response = response.replace('colleges in', 'engineering colleges in')
    elif any(keyword in query.lower() for keyword in ['medical', 'mbbs', 'doctor', 'medicine']):
        filtered_colleges = [college for college in filtered_colleges if any(course.lower() in ['mbbs', 'medical', 'medicine'] for course in (college.get('courses', []) if isinstance(college.get('courses', []), list) else [college.get('courses', '')]))]
        response = response.replace('colleges in', 'medical colleges in')
    elif any(keyword in query.lower() for keyword in ['management', 'mba', 'business', 'pgdm']):
        filtered_colleges = [college for college in filtered_colleges if any(course.lower() in ['mba', 'management', 'business', 'pgdm'] for course in (college.get('courses', []) if isinstance(college.get('courses', []), list) else [college.get('courses', '')]))]
        response = response.replace('colleges in', 'management colleges in')
    
    # Filter by type if mentioned
    if 'government' in query.lower() or 'govt' in query.lower():
        filtered_colleges = [college for college in filtered_colleges if college.get('type', '').lower() in ['government', 'govt', 'public']]
        response = response.replace('colleges in', 'government colleges in')
    elif 'private' in query.lower():
        filtered_colleges = [college for college in filtered_colleges if college.get('type', '').lower() == 'private']
        response = response.replace('colleges in', 'private colleges in')
    
    # Filter by fees if mentioned
    if 'affordable' in query.lower() or 'cheap' in query.lower() or 'low fee' in query.lower():
        # Try to extract numeric fee values and filter for lower fees
        def extract_fee(fee_str):
            if not fee_str or not isinstance(fee_str, str):
                return float('inf')
            import re
            # Extract numbers from fee string
            numbers = re.findall(r'(\d+(?:\.\d+)?)', fee_str.replace(',', ''))
            if numbers:
                return float(numbers[0])
            return float('inf')
        
        filtered_colleges = sorted(filtered_colleges, key=lambda college: extract_fee(college.get('fees', '')))
        filtered_colleges = filtered_colleges[:15]  # Take top 15 affordable colleges
        response = response.replace('colleges in', 'affordable colleges in')
    
    # Sort by rating if available
    def get_rating(college):
        try:
            rating = college.get('rating', '0')
            if isinstance(rating, str):
                # Handle NIRF rank (lower is better)
                if 'nirf' in rating.lower():
                    match = re.search(r'(\d+)', rating)
                    if match:
                        return 1000 - float(match.group(1))  # Invert NIRF rank for sorting
                
                # Handle regular ratings (higher is better)
                rating = rating.replace('/5', '').replace('/10', '').strip()
                return float(rating)
            return rating
        except:
            return 0
    
    filtered_colleges = sorted(filtered_colleges, key=get_rating, reverse=True)
    
    # Take top 5 colleges
    top_colleges = filtered_colleges[:5]
    
    if not top_colleges:
        response += "I couldn't find specific colleges matching your query in Maharashtra. Here are some top colleges in Maharashtra instead:\n\n"
        top_colleges = maharashtra_colleges[:5]
    
    # Add college information
    for i, college in enumerate(top_colleges, 1):
        response += f"{i}. {college['name']} ({college.get('location', 'Maharashtra')})\n"
        
        # Add source information
        if 'source' in college:
            response += f"   • Source: {college['source']}\n"
        
        # Add type information
        if 'type' in college and college['type']:
            response += f"   • Type: {college['type']}\n"
        
        # Add established year
        if 'established' in college and college['established']:
            response += f"   • Established: {college['established']}\n"
        
        # Add rating information
        if 'rating' in college and college['rating']:
            if 'nirf' in str(college['rating']).lower():
                response += f"   • NIRF Ranking: {college['rating']}\n"
            else:
                response += f"   • Rating: {college['rating']}\n"
        
        # Add fees information
        if 'fees' in college and college['fees']:
            response += f"   • Fees: {college['fees']}\n"
        
        # Add courses information
        if 'courses' in college and college['courses']:
            if isinstance(college['courses'], list):
                response += f"   • Courses: {', '.join(college['courses'][:3])}\n"
            else:
                response += f"   • Courses: {college['courses']}\n"
        
        # Add admission process information
        if 'admission_process' in college and college['admission_process']:
            response += f"   • Admission: {college['admission_process']}\n"
        
        # Add approval information
        if 'approved_by' in college and college['approved_by']:
            if isinstance(college['approved_by'], list):
                response += f"   • Approved by: {', '.join(college['approved_by'][:3])}\n"
            else:
                response += f"   • Approved by: {college['approved_by']}\n"
        
        # Add address information
        if 'address' in college and college['address']:
            response += f"   • Address: {college['address']}\n"
        
        # Add website information
        if 'website' in college and college['website']:
            response += f"   • Website: {college['website']}\n"
        
        response += "\n"
    
    response += "Would you like more specific information about any of these colleges or a different location in Maharashtra?"
    
    return response

def process_exam_query(query, greeting):
    """Process queries related to entrance exams"""
    response = f"{greeting}Here's information about entrance exams in India related to your query:\n\n"
    
    # Check for specific exam categories
    if any(keyword in query.lower() for keyword in ['engineering', 'jee', 'bitsat']):
        exams = indian_education_data['entrance_exams']['engineering']
        field = "engineering"
    elif any(keyword in query.lower() for keyword in ['medical', 'neet', 'aiims']):
        exams = indian_education_data['entrance_exams']['medical']
        field = "medical"
    elif any(keyword in query.lower() for keyword in ['management', 'cat', 'xat', 'mba']):
        exams = indian_education_data['entrance_exams']['management']
        field = "management"
    else:
        # If no specific field, combine exams from all fields
        exams = []
        for field_exams in indian_education_data['entrance_exams'].values():
            exams.extend(field_exams)
        field = "various fields"
    
    response += f"Important entrance exams for {field} in India:\n\n"
    
    # Add exam information
    for i, exam in enumerate(exams, 1):
        response += f"{i}. {exam['name']} ({exam['full_name']})\n"
        response += f"   • Conducted by: {exam['conducting_body']}\n"
        response += f"   • Eligibility: {exam['eligibility']}\n"
        response += f"   • Application period: {exam['application_period']}\n"
        response += f"   • Exam dates: {exam['exam_dates']}\n"
        response += f"   • Colleges accepting: {exam['colleges']}\n"
        response += f"   • Website: {exam['website']}\n\n"
    
    response += "Do you need more specific details about any of these exams or preparation tips?"
    
    return response

def process_scholarship_query(query, greeting):
    """Process queries related to scholarships"""
    response = f"{greeting}Here's information about scholarships available for Indian students:\n\n"
    
    scholarships = indian_education_data['scholarships']
    
    for i, scholarship in enumerate(scholarships, 1):
        response += f"{i}. {scholarship['name']}\n"
        response += f"   • Provider: {scholarship['provider']}\n"
        response += f"   • Eligibility: {scholarship['eligibility']}\n"
        response += f"   • Amount: {scholarship['amount']}\n"
        response += f"   • Application period: {scholarship['application_period']}\n"
        response += f"   • Website: {scholarship['website']}\n\n"
    
    response += "Would you like information about any specific scholarship or eligibility criteria?"
    
    return response

def process_admission_query(query, greeting):
    """Process queries related to admission processes and deadlines"""
    response = f"{greeting}Here's information about admission processes and timelines in India:\n\n"
    
    # Check for specific fields
    if any(keyword in query.lower() for keyword in ['engineering', 'tech', 'b.tech', 'm.tech']):
        calendar = indian_education_data['admission_calendar']['engineering']
        field = "engineering"
    elif any(keyword in query.lower() for keyword in ['medical', 'mbbs', 'doctor', 'medicine']):
        calendar = indian_education_data['admission_calendar']['medical']
        field = "medical"
    elif any(keyword in query.lower() for keyword in ['management', 'mba', 'business', 'pgdm']):
        calendar = indian_education_data['admission_calendar']['management']
        field = "management"
    else:
        # If no specific field, provide general admission information
        response += "General admission timeline for various fields:\n\n"
        for field, calendar in indian_education_data['admission_calendar'].items():
            response += f"For {field.capitalize()} courses:\n"
            for event, timeline in calendar.items():
                response += f"   • {event}: {timeline}\n"
            response += "\n"
        
        response += "Would you like more specific information about admission processes for a particular field or college?"
        return response
    
    response += f"Admission timeline for {field} courses in India:\n\n"
    
    for event, timeline in calendar.items():
        response += f"• {event}: {timeline}\n"
    
    response += "\nWould you like more specific information about admission processes for a particular college?"
    
    return response

def perform_general_search(query, greeting):
    """Perform a general search for educational information"""
    # For general queries, try to use Google Custom Search API if available
    api_key = os.getenv('GOOGLE_API_KEY')
    search_engine_id = os.getenv('GOOGLE_SEARCH_ENGINE_ID')
    
    if api_key and search_engine_id:
        try:
            # Add India-specific terms to the query
            india_query = f"{query} India education college university"
            
            # Make the API request
            url = f"https://www.googleapis.com/customsearch/v1?key={api_key}&cx={search_engine_id}&q={india_query}"
            response = requests.get(url)
            search_results = response.json()
            
            # Format the response
            return format_search_results(query, search_results, greeting)
        except Exception as e:
            print(f"Error in Google search: {e}")
    
    # Fallback response if API call fails or keys are not available
    return f"{greeting}I don't have specific information about that query. Please ask about Indian colleges, entrance exams, scholarships, or admission processes for more detailed information."

def format_search_results(query, search_results, greeting):
    """Format search results into a structured response"""
    if 'items' not in search_results or not search_results['items']:
        return f"{greeting}I couldn't find specific information about '{query}' in the context of Indian education. Please try asking about specific colleges, exams, or admission processes."
    
    response = f"{greeting}Here's what I found about '{query}' in the Indian education context:\n\n"
    
    # Add search results
    for i, item in enumerate(search_results['items'][:3], 1):
        title = item.get('title', 'No title')
        snippet = item.get('snippet', 'No description available')
        link = item.get('link', '#')
        
        response += f"{i}. {title}\n"
        response += f"   • {snippet}\n"
        response += f"   • {link}\n\n"
    
    # Add follow-up suggestions
    response += "You might also be interested in:\n"
    suggestions = [
        "Top engineering colleges in India",
        "NEET preparation tips",
        "JEE Main important dates",
        "Scholarships for undergraduate students in India",
        "MBA admission process in IIMs"
    ]
    
    # Select 3 random suggestions
    selected_suggestions = random.sample(suggestions, 3)
    for suggestion in selected_suggestions:
        response += f"• {suggestion}\n"
    
    return response

@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': 'No file part'})
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'success': False, 'message': 'No selected file'})
    
    # Create uploads directory if it doesn't exist
    uploads_dir = os.path.join(os.path.dirname(__file__), 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    
    # Save the file
    file_path = os.path.join(uploads_dir, file.filename)
    file.save(file_path)
    
    return jsonify({
        'success': True,
        'message': f'File {file.filename} uploaded successfully',
        'file_path': file_path
    })

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    app.run(debug=True)
