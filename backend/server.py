from flask import Flask, request, jsonify, render_template_string, send_file
import requests
import io
# from PIL import Image
import base64
import json

from google import genai
import cv2
import base64
import os
from dotenv import load_dotenv

app = Flask(__name__)

latest_image = None

@app.route('/', methods=["GET"])
def test():
    return "hello world"

@app.route('/upload', methods=['POST'])
def upload_frame():
    global latest_image
    # Get the image data from the POST request
    if not request.is_json:
        return jsonify({"message": "Request must be JSON", "status": "error"}), 400

    data = request.get_json()
    # print(f"Received data: {data}")

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

    return render_template_string('''
        <html>
        <head><title>Uploaded Image</title></head>
        <body>
            <h1>Uploaded Image</h1>
            <img src="data:image/jpeg;base64,{{ image_data }}" />
        </body>
        </html>
    ''', image_data=image_data)

    # Convert bytes to image for processing (optional step)
    # image = Image.open(io.BytesIO(image_bytes))

    # Send the image to Google Gemini VLM for labeling
    # response = send_to_gemini(image_bytes)

    # if response.status_code == 200:
    #     return jsonify({"message": "Frame processed successfully", "status": "success"}), 200
    # else:
    #     return jsonify({"message": "Failed to process frame", "status": "error"}), 500


@app.route('/stream', methods=['GET'])
def stream_image():
    global latest_image

    if latest_image is None:
        return jsonify({"message": "No image available", "status": "error"}), 404

    # Convert the image bytes back to a file-like object using io.BytesIO
    image_io = io.BytesIO(latest_image)
    image_io.seek(0)

    # Return the image as a response
    return send_file(image_io, mimetype='image/jpeg')



if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("No API key found. Please set GEMINI_API_KEY environment variable.")

client = genai.Client(api_key=api_key)

def resize_image(image, max_width=1024):
    height, width = image.shape[:2]
    if width > max_width:
        new_height = int((max_width / width) * height)
        return cv2.resize(image, (max_width, new_height))
    return image

def compress_image(image, quality=85):
    _, buffer = cv2.imencode('.jpg', image, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    return cv2.imdecode(buffer, cv2.IMREAD_COLOR)

def analyze_frame(frame):
    # Resize and compress first
    frame = resize_image(frame, max_width=1024)
    frame = compress_image(frame, quality=85)
    # Convert frame to base64
    _, buffer = cv2.imencode('.jpg', frame)
    base64_image = base64.b64encode(buffer).decode('utf-8')

    prompt = """Analyze this image for potential falls or household injuries with high sensitivity. 
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

    OUTPUT FORMAT (strict JSON):
    {
    "emergency_status": {
        "fall_detected": bool,
        "unconscious_possible": bool,
        "visible_injury": bool,
        "position": str  # ("upright", "on_ground", "on_furniture", "mid_fall")
    },
    "confidence": float (0.0-1.0),
    "context": str  # Brief explanation of observations
    }"""
    
    # Call Gemini
    try: 
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp", contents=[prompt, base64_image]
        )
        return response.text
    except Exception as e:
        return {"error": str(e)}
    
# Add at the bottom of your file:
if __name__ == "__main__":
    # Load an image file
    test_image = cv2.imread("images/stream-1.jpg")  # Replace with your image path
    
    if test_image is not None:
        result = analyze_frame(test_image)
        print(result)
    else:
        print("Error: Could not load image file")