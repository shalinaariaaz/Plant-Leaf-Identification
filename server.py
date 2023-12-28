import base64
from flask import Flask, request, jsonify, render_template
import os
from Engine import process_file
import cv2
import pickle
from sklearn.preprocessing import StandardScaler
import pandas as pd

app = Flask(__name__, static_url_path='', static_folder='static')

# Load the SVM model
with open('svm_model.pkl', 'rb') as model_file:
    loaded_svm_model = pickle.load(model_file)

sc_X = StandardScaler()
X_train = pd.read_csv("my_dataframe.csv")
X_train = sc_X.fit_transform(X_train)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOADS = 'uploads'
IMG_PATH = 'processed/processed.jpg'
app.config['UPLOAD_FOLDER'] = UPLOADS
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    if file and allowed_file(file.filename):
        filePath = os.path.join(app.config['UPLOAD_FOLDER'], 'temp.jpg')
        file.save(filePath)

        label, accuracy = process_file(filePath, loaded_svm_model, sc_X)

        # Print the types for debugging
        print("Label type:", type(label))
        print("Accuracy type:", type(accuracy))

        # Convert label to a JSON-serializable format (assuming label is a boolean)
        label = str(label)

        try:
            # Try to convert accuracy to a float
            accuracy = float(accuracy)
        except (ValueError, TypeError):
            # Handle the case where accuracy cannot be converted to a float
            accuracy = None

        # Check if accuracy is a valid numeric value before using it
        if accuracy is not None:
            print(label, accuracy)
            return jsonify({'message': 'File processed successfully', 'label': label, 'accuracy': accuracy})
        else:
            return jsonify({'error': 'Invalid accuracy value'})

    return jsonify({'error': 'Invalid file type'})

if __name__ == '__main__':
    app.run(debug=True)
