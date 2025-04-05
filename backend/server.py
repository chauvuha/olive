from flask import Flask, request, jsonify, render_template_string, send_file
import requests
import io
# from PIL import Image
import base64
import json

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