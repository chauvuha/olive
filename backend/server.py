from flask import Flask, request, jsonify, render_template_string, send_file
from flask_socketio import SocketIO, send, emit
from flask_cors import CORS
import requests
import io
from PIL import Image
import base64
import json
from google import genai
import cv2
import base64
import os
from dotenv import load_dotenv
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from bson import ObjectId
from pydantic import BaseModel
import time
import threading


class Emergency(BaseModel):
    fall_detected: bool
    unconscious_possible: bool
    visible_injury: bool
    position: str
    confidence: float
    context: str


app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

lock = threading.Lock()

load_dotenv()

user_socket_map = {}

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("No API key found. Please set GEMINI_API_KEY environment variable.")

client = genai.Client(api_key=api_key)

latest_image = None

# MongoDB URI from environment
MONGO_URI = os.getenv('MONGO_URI')

# Create a new client and connect to the server
mongodb_client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

# Get the database and collections
db = mongodb_client.get_database('users_db')
users_collection = db['users']
support_network_collection = db['support_network']

# Helper function to convert MongoDB ObjectId to string
def serialize_user(user):
    user['_id'] = str(user['_id'])  # Convert ObjectId to string
    return user

def get_support_network(user):
    print(f"Getting support network for user: {user}, type: {type(user)}")
    
    # Now find support network members
    support_network = list(support_network_collection.find({'userId': user}))
    # print(f"Support network query for userId={user}, found: {support_network}")
    print(f"got support network for userId={user}")

    # Convert to list of serialized users
    result = [serialize_user(member) for member in support_network]
    print(f"Returning serialized result: {result}")
    
    return result

# @app.route('/send_support_email/<user_id>', methods=['POST'])
def send_support_email(user, message):
    support_network = get_support_network(user)
    print("SENDING EMAILS")

    emails = [member.get('email') for member in support_network if member.get('email')]

    if not emails:
        return jsonify({"error": "No emails found in support network."}), 404

    email_data = {
        "from": "Olive <onboarding@resend.dev>", 
        "to": emails,
        "subject": "Alert from O-live",
        "html": f"<strong>Hi {user},</strong><p>{message}</p><p>Check the O-live app to reach out to the rest of {user}'s support network.</p>"
    }

    response = requests.post(
        'https://api.resend.com/emails',
        json=email_data,
        headers={
            'Authorization': f'Bearer {os.getenv("RESEND_API_KEY")}',  # or just paste it directly for now
            'Content-Type': 'application/json'
        }
    )

    if response.status_code == 200:
        print("emails sent")
        return jsonify({"message": "Emails sent", "response": response.json()})
    else:
        print("errors sending email")
        return jsonify({"error": response.json()}), response.status_code


@app.route('/users', methods=['GET'])
def get_all_users():
    try:
        print("Fetching all users...")
        users = list(users_collection.find())
        print(f"Found {len(users)} users: {[u['name'] for u in users]}")

        users_list = []
        for user in users:
            print(f"Processing user: {user['name']}, _id: {user['_id']}")
            
            # Make a copy to avoid modifying the original
            serialized_user = serialize_user(user.copy())
            
            # Get support network
            print(f"Fetching support network for {user['name']}")
            support_network = get_support_network(user['_id'])
            print(f"Support network size: {len(support_network)}")
            
            serialized_user['support_network'] = support_network
            users_list.append(serialized_user)

        print(f"Returning {len(users_list)} users, first user support network size: {len(users_list[0]['support_network']) if users_list else 0}")
        return jsonify(users_list), 200
    except Exception as e:
        print(f"Error in get_all_users: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return jsonify({"message": str(e), "status": "error"}), 500
    

latest_image = None
user = None
emergency = None
is_processing = False

@socketio.on('connect')
def handle_connect():
    print('Client connected')
    user = request.args.get('user')  # This gets the 'user' parameter from the query string
    
    if user:
        user_socket_map[user] = request.sid  # Store the socket ID with the user ID
        print(f"User {user} connected with socket ID: {request.sid}")
    else:
        print(f"User with no ID connected with socket ID: {request.sid}")
    # emit('message', {'data': 'Hello from Flask-SocketIO!'})


def send_notification_to_user(user_id, message):
    socket_id = user_socket_map.get(user_id)
    if socket_id:
        # Send the notification only to the specific user
        socketio.emit('notification', {'message': message}, room=socket_id)
        print(f"Sent notification to {user_id}: {message}")
    else:
        print(f"User {user_id} not connected")


@socketio.on('confirm_response')
def handle_user_response(data):
    user = data['user']
    response = data['response']
    emergency = data['emergency']
    print(f"Received response from {user}: {response}")

    if lock.acquire(blocking=False):
        try: 
            if response == 'Yes':
                emit('notification', {'message': f"Glad to hear you're okay, {user}!"}, room=user_socket_map.get(user))
                # is_processing = False
            else:
                emit('notification', {'message': f"We've reached out to your priority contacts so they can make sure you're safe."}, room=user_socket_map.get(user))
                support_network = get_support_network(user=user)
                print(support_network)

                send_support_email(user, emergency)
                # is_processing = False
                return "sent emails"
        finally:
            lock.release()
    else:
        print(f"Lock not acquired for user {user}. Another operation is in progress.")
        emit('notification', {'message': "Please wait, the system is currently handling an emergency."}, room=user)



@app.route('/', methods=["GET"])
def test():
    return "hello world"

@app.route('/upload', methods=['POST'])
def upload_frame():
    global latest_image, user, event_description, is_processing

    # do nothing if already handling an emergency
    if is_processing:
        return jsonify({"message": "Already handling an emergency"})

    # Get the image data from the POST request
    if not request.is_json:
        return jsonify({"message": "Request must be JSON", "status": "error"}), 400

    data = request.get_json()

    # Ensure the 'image' key exists in the JSON
    if 'image' not in data:
        return jsonify({"message": "'image' field is missing in the request", "status": "error"}), 400

    image_data = data['image'] 

    # Ensure correct padding for base64 encoding
    padding_needed = len(image_data) % 4

    if padding_needed != 0:
        image_data += '=' * (4 - padding_needed)
    print(f"Image data length (after padding): {len(image_data)}")

    image_bytes = base64.b64decode(image_data)  # Decode from base64
    latest_image = image_bytes

    image = Image.open(io.BytesIO(image_bytes))
    # image = image.transpose(Image.ROTATE_270)
    # latest_image = image
    
    prompt = """Analyze this image for potential falls or household injuries with high sensitivity and return it as a JSON. 
    Pay special attention to:

    CRITICAL INDICATORS:
    1. Fall Detection:
    - Person lying on the floor in an unnatural position
    - Person not moving for an extended period (contextual)
    - Person at the base of stairs or near elevated surfaces
    - Sudden change from vertical to horizontal position

    2. Loss of Consciousness:
    - Unresponsive facial expression
    - Eyes closed in inappropriate situations
    - Limp body posture
    - Head lolling to one side

    3. Household Injuries:
    - Visible impact with objects
    - Clutching body parts in pain
    - Abnormal body positioning (e.g., twisted limbs)
    - Signs of bleeding or impact marks

    ANALYSIS REQUIREMENTS:
    - Consider the environment (i.e. a stairwell)
    - Look for contextual clues (e.g., nearby overturned objects)
    - Distinguish between intentional lying down vs. accidents

    Use this JSON schema:
    status = {
    "fall_detected": whether or not a fall was detected (bool),
    "unconscious_possible": whether the person looks unconscious (bool),
    "visible_injury": whether the person has a visible injury (bool),
    "position": one of ["upright, "on_ground", "on_furniture", "mid_fall"] (string)
    "confidence": a value between 0.0 and 1.0 (float),
    "context": brief explanation of observations (str)
    }

    Return: status"""

    response_raw = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[prompt, image],
        config = {
            'response_mime_type': 'application/json',
            'response_schema': Emergency,
        },
    )

    response = response_raw.parsed

    emergency = response
    print("emergency")
    print(response.context)

    if response.fall_detected or response.unconscious_possible or response.visible_injury:
        send_support_email("Chau", "We've detected an emergency. Go to http://localhost/")
        send_notification_to_user("Chau", response.context)
        
    return jsonify({"message": "Image processed successfully"})

@app.route('/stream', methods=['GET'])
def stream_image():
    global latest_image, emergency

    # if latest_image is None:
    #     return jsonify({"message": "No image available", "status": "error"}), 404

    # image = Image.open(io.BytesIO(latest_image))
    # image_io = io.BytesIO()
    # image.save(image_io, format='JPEG')  # Save the PIL image as JPEG to the byte stream
    # image_io.seek(0)  # Reset the stream pointer

    # # Encode the byte data to base64
    # image_base64 = base64.b64encode(image_io.getvalue()).decode('utf-8') 


    # # Send the image and description as a JSON response
    # return jsonify({
    #     "description": emergency,
    #     "image": image_base64  # Convert image bytes to string
    # })

    if latest_image is None:
        return jsonify({"message": "No image available", "status": "error"}), 404

    # Convert the image bytes back to a file-like object using io.BytesIO
    image_io = io.BytesIO(latest_image)
    image_io.seek(0)

    # Return the image as a response
    return send_file(image_io, mimetype='image/jpeg')


# def update_image():
#     global latest_image
#     while True:
#         # Simulate image update
#         time.sleep(5)  # Change this to your actual image update logic
#         # latest_image = create_new_image()  # Replace with your logic for getting new images
#         print("Image updated")

#         # Emit the updated image to all connected clients
#         image_io = io.BytesIO()
#         # latest_image.save(image_io, format='JPEG')
#         image_io.seek(0)

#         socketio.emit('image_update', {'image': image_io.getvalue()})  # Emit the image data
#         print("Image sent to clients")

if __name__ == "__main__":
    # app.run(host='0.0.0.0', port=5000, debug=True)
    # threading.Thread(target=update_image, daemon=True).start()
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
