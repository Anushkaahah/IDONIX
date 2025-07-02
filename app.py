from flask import Flask, request, jsonify, session
from flask_cors import CORS
from pymongo import MongoClient
import requests
import re
import time
import random
import logging
import sys
from bson import ObjectId
from datetime import datetime, timezone
from dotenv import load_dotenv
import os

# Debug logging setup
# logging.basicConfig(stream=sys.stderr, level=logging.DEBUG)

logging.getLogger("pymongo").setLevel(logging.ERROR)
logging.getLogger("mongo").setLevel(logging.ERROR)
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
app.secret_key = "team_neonpulse_will_win"

# MongoDB connection
client = MongoClient("mongodb+srv://new-user:Hackronyx123@cluster0.odvrgud.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client['aiprojects_db']
generated_projects_collection = db['generated_projects']
saved_projects_collection = db['saved_projects']
users_collection = db['users']
concepts_collection = db['concepts']
history_collection = db['history'] 
timestamp = datetime.now(timezone.utc)
history_collection.create_index(
    [("timestamp", 1)],
    expireAfterSeconds=86400
)
# -------------------- Auth --------------------

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    password = data.get('password')

    if not email or not first_name or not last_name or not password:
        return jsonify({"success": False, "message": "All fields are required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"success": False, "message": "Email already registered"}), 409

    users_collection.insert_one({
        "first_name": first_name,
        "last_name": last_name,
        "username": first_name + last_name,
        "email": email,
        "password": password
    })

    return jsonify({
        "success": True,
        "message": "Signup successful",
        "user": {
            "first_name": first_name,
            "last_name": last_name,
            "email": email
        }
    })



@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = users_collection.find_one({"email": email, "password": password})
    if user:
        session['email'] = email
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "first_name": user.get("first_name", ""),
                "email": user.get("email", "")
            }
        })
    return jsonify({"success": False, "message": "Invalid credentials"}), 401



@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"success": True, "message": "Logged out"})


@app.route('/check-auth', methods=['GET'])
def check_auth():
    email = session.get('email')
    if email:
        return jsonify({"loggedIn": True, "email": email})
    return jsonify({"loggedIn": False})


@app.route('/user/session', methods=['GET'])
def get_user_by_session():
    email = session.get('email')
    if not email:
        return jsonify({"success": False, "message": "User not logged in"}), 401

    user = users_collection.find_one({"email": email})
    if user:
        return jsonify({
            "success": True,
            "user": {
                "username": user.get("username", ""),
                "email": user.get("email", ""),
                "profession": user.get("profession", ""),
                "skill_level": user.get("skill_level", ""),
                "skills": user.get("skills", "")
                
            }
        })
    return jsonify({"success": False, "message": "User not found"}), 404


@app.route('/user/<email>', methods=['GET'])
def get_user(email):
    user = users_collection.find_one({"email": email})
    if user:
        return jsonify({
            "success": True,
            "user": {
                "username": user.get("username", ""),
                "email": user.get("email", "")
            }
        })
    return jsonify({"success": False, "message": "User not found"}), 404

# -------------------- Utility --------------------

def extract_projects(text):
    project_blocks = re.findall(
    r"\d+\.\s*Title:\s*(.*?)\n\s*Description:\s*(.*?)\n\s*Template:\s*(.*?)\n\s*Hint:\s*(.*?)\n\s*Challenge Factor:\s*(.*?)(?=\n\d+\. Title:|\Z)",
    text,
    re.DOTALL
)

    projects = []
    for block in project_blocks:
        title, desc, template, hint, challenge = block
        projects.append({
            "title": title.strip(),
            "description": desc.strip(),
            "template": template.strip(),
            "hint": hint.strip(),
            "challenge": challenge.strip()
        })

    return projects

@app.route('/get-concepts', methods=['GET'])
def get_concepts():
    email = session.get('email')
    print(f"📩 [GET /get-concepts] Session email: {email}")

    if not email:
        return jsonify({'success': False, 'message': 'User not logged in'}), 401

    try:
        concepts = list(concepts_collection.find({"email": email}, {"_id": 0, "concept": 1}))
        concept_list = [c["concept"] for c in concepts]
        print(f"✅ Retrieved concepts from DB for {email}: {concept_list}")
        return jsonify({'success': True, 'concepts': concept_list})
    except Exception as e:
        print(f"❌ Error fetching concepts: {e}")
        return jsonify({'success': False, 'message': 'Error fetching concepts', 'error': str(e)}), 500


# -------------------- Project Generation --------------------

@app.route('/generate-project', methods=['POST'])
def generate_project():
    try:
        email = session.get('email')
        data = request.get_json()

        concept = data.get('concept')
        domain = data.get('domain')
        level = data.get('skill_level')
        transcript = data.get('transcript')
        previous_concepts = data.get('previousConcepts')
        goal = data.get('goal')

        if not concept or not domain or not level:
            return jsonify({"error": "Missing required input fields"}), 400

        previous_concepts_cursor = concepts_collection.find({
            "email": email,
            "concept": {"$ne": concept}
        }, {"_id": 0, "concept": 1})

        previous_concepts_list = [c["concept"] for c in previous_concepts_cursor]
        previous_concepts_str = ", ".join(previous_concepts_list)

        # ✅ Save the current concept to DB
        if email and concept:
            concepts_collection.insert_one({
                "email": email,
                "concept": concept,
                "timestamp": int(time.time())
            })

        # ✅ Load API key and headers here
        api_key = os.getenv("API_KEY")
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }

        random_seed = random.randint(1, 1000000)
        timestamp = int(time.time())
        suffix = random.choice([
            "Make them fun and practical.",
            "Ensure they're challenging but doable.",
            "Focus on unique real-world applications.",
            "Add some surprising twist to at least one idea.",
        ])

        prompt_text = f""" You Are a DIY project generator who generates 3 project Ideas by taking a concept, domain, and skill level as input from a user and sometimes video transcript also. You can generate project of any ideas of any domain hardware, software, research topic etc.
I recently learned about {concept} under the domain of {domain}. I'm at {level} level. {"Here are my previously learned concepts:" + previous_concepts_str +" You should consider the extra knowledge I have and use it where applicable. Important : also tell me in description what concepts you added from my previous concepts list" if previous_concepts else ""}.
{"I also have this video transcript: " + transcript if transcript else ""}
{"My goal is to " + goal + ". This should influence the style of project." if goal else ""}
To ensure variety and randomness in your response, use the following random seed and timestamp to generate fresh ideas each time:
- Random seed: {random_seed}
- Timestamp: {timestamp}

Suggest 3 unique project ideas in this exact format (no introduction or conclusion):

1. Title: [Project Name]
   Description: [Give details about the idea and why it matters to user(what skill or benefit user will get by doing this project) and in general(means to benefits to society, business, environment, community etc).]
   Template: [GitHub Repo, Research Paper, or Reference Link. Template in the sense so the user can take it and learn from it and edit it.]
   Hint: [How to start, basic workflow or toolset. This should be in detail. You should also give a YouTube video link that is explaining the suggested project idea if it is present. Add tech stack for the project and also add dataset ideas required for project]
   Challenge Factor: [Other than the project main idea give a challenge factor to me. A task which is related to project and it will test me. The challenge is for me to challenge myself and improve.]

2. Title: ...
   Description: ...
   Template: ...
   Hint: ...
   Challenge Factor: ...

3. Title: ...
   Description: ...
   Template: ...
   Hint: ...
   Challenge Factor: ...

Additional creative instruction: {suffix}
"""

        payload = {
            "model": "compound-beta",
            "messages": [{"role": "user", "content": prompt_text}],
            "temperature": 1.0,
            "top_p": 1.0,
            "presence_penalty": 0.6,
            "frequency_penalty": 0.5
        }

        logging.debug("Prompt: %s", prompt_text)

        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        result = response.json()

        logging.debug("Groq Response: %s", result)

        if 'choices' not in result or not result['choices'][0].get('message'):
            return jsonify({"projects": [], "error": "No project ideas generated."}), 200

        raw_text = result['choices'][0]['message']['content']
        projects = extract_projects(raw_text)

        if email:
            for proj in projects:
                proj.update({
                    "email": email,
                    "input_concept": concept,
                    "input_domain": domain,
                    "input_level": level,
                    "timestamp": timestamp
                })
                generated_projects_collection.insert_one(proj)

            history_entry = {
                "email": email,
                "projects": projects,
                "input_concept": concept,
                "input_domain": domain,
                "input_level": level,
                "timestamp": timestamp
            }
            history_collection.insert_one(history_entry)
            print("✅ History saved to MongoDB for:", email)

        def sanitize_project(project):
            return {k: str(v) if isinstance(v, ObjectId) else v for k, v in project.items()}

        sanitized_projects = [sanitize_project(p) for p in projects]
        return jsonify({"projects": sanitized_projects}), 200

    except Exception as e:
        logging.exception("Exception in /generate-project:")
        return jsonify({"error": "Server error", "details": str(e)}), 500

# -------------------- Save & Fetch Projects --------------------

@app.route('/save-project', methods=['POST'])
def save_project():
    email = session.get('email')
    data = request.get_json()
    if not email:
        email = data.get('email')

    if not email:
        return jsonify({'success': False, "message": "User not logged in"}), 401
    if not data:
        return jsonify({'success': False, "message": "No project data provided"}), 400

    data["email"] = email

    try:
        existing = saved_projects_collection.find_one({
            "email": email,
            "title": data.get("title")
        })

        if existing:
            return jsonify({'success': False, "message": "Project already saved"}), 200

        saved_projects_collection.insert_one(data)
        return jsonify({'success': True, "message": "Project saved successfully"})
    
    except Exception as e:
        logging.exception("Error saving project:")
        return jsonify({"success": False, "message": "Failed to save project", "error": str(e)}), 500

@app.route('/unsave-project', methods=['POST'])
def unsave_project():
    data = request.get_json()
    email = data.get('email')
    title = data.get('title')

    if not email or not title:
        return jsonify({'success': False, 'message': 'Missing email or title'}), 400

    result = saved_projects_collection.delete_one({'email': email, 'title': title})
    if result.deleted_count > 0:
        return jsonify({'success': True, 'message': 'Project removed'})
    else:
        return jsonify({'success': False, 'message': 'Project not found'}), 404


@app.route('/saved-projects/session', methods=['GET'])
def get_saved_projects_session():
    try:
        email = session.get('email')
        print("🧠 Session email:", email)
        if not email:
            return jsonify({"success": False, "message": "User not logged in"}), 401
        projects = list(saved_projects_collection.find({"email": email}, {"_id": 0}))
        return jsonify({"success": True, "projects": projects})
    except Exception as e:
        logging.exception("Error fetching saved projects:")
        return jsonify({"success": False, "message": "Failed to fetch saved projects", "error": str(e)}), 500

@app.route('/history-projects/session', methods=['GET'])
def get_history_projects_session():
    try:
        email = session.get('email')
        if not email:
            return jsonify({"success": False, "message": "User not logged in"}), 401
        history = list(generated_projects_collection.find({"email": email}, {"_id": 0}))
        return jsonify({"success": True, "history": [{"projects": history}]})
    except Exception as e:
        logging.exception("Error fetching history:")
        return jsonify({"success": False, "message": "Failed to fetch history", "error": str(e)}), 500

@app.route('/save-concept', methods=['POST'])
def save_concept():
    data = request.get_json()
    email = data.get('email')
    concept = data.get('concept')
    if not email or not concept:
        return jsonify({'success': False, 'message': 'Email and concept are required'}), 400

    concepts_collection = db["concepts"]

    existing = concepts_collection.find_one({
        "email": email,
        "concept": concept
    })

    if existing:
        return jsonify({"success": False, "message": "Concept already exists for this user."}), 200
    else:
        concepts_collection.insert_one({
            "email": email,
            "concept": concept
        })

    print(f"Saving concept for {email}: {concept}")


    return jsonify({'success': True, 'message': 'Concept saved'})



@app.route('/user-history/<email>', methods=['GET'])
def get_user_history(email):
    try:
        email_normalized = email.strip().lower()
        history = list(history_collection.find({"email": email_normalized}, {"_id": 0}))

        # 🔧 Remove any nested ObjectId fields (like inside "projects")
        for entry in history:
            if "projects" in entry:
                for proj in entry["projects"]:
                    proj.pop("_id", None)

        return jsonify({"success": True, "projects": history})
    except Exception as e:
        logging.exception("Error fetching user history:")
        return jsonify({
            "success": False,
            "message": "Failed to fetch history",
            "error": str(e)
        }), 500
    
@app.route('/update-profile', methods=['POST'])
def update_profile():
    email = session.get('email')
    if not email:
        return jsonify({"success": False, "message": "User not logged in"}), 401

    data = request.get_json()
    profession = data.get('profession')
    skill_level = data.get('skill_level')
    skills = data.get('skills')

    update_fields = {}
    if profession: update_fields['profession'] = profession
    if skill_level: update_fields['skill_level'] = skill_level
    if skills: update_fields['skills'] = skills

    if update_fields:
        users_collection.update_one(
            {"email": email},
            {"$set": update_fields}
        )
        return jsonify({"success": True, "message": "Profile updated"})

    return jsonify({"success": False, "message": "No data to update"}), 400

# --------------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)