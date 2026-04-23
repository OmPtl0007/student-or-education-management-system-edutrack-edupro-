from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from db import add_cors_headers, error_response, success_response
import students
import attendance
import scores
import leaves
import documents
import logs

app = Flask(__name__)
CORS(app)

@app.route('/students', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def students_endpoint():
    return students.handle_request(request)

@app.route('/attendance', methods=['GET', 'POST', 'DELETE', 'OPTIONS'])
def attendance_endpoint():
    return attendance.handle_request(request)

@app.route('/scores', methods=['GET', 'POST', 'DELETE', 'OPTIONS'])
def scores_endpoint():
    return scores.handle_request(request)

@app.route('/leaves', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def leaves_endpoint():
    return leaves.handle_request(request)

@app.route('/documents', methods=['GET', 'POST', 'DELETE', 'OPTIONS'])
def documents_endpoint():
    return documents.handle_request(request)

@app.route('/logs', methods=['GET', 'POST', 'DELETE', 'OPTIONS'])
def logs_endpoint():
    return logs.handle_request(request)

@app.route('/', methods=['GET', 'OPTIONS'])
def index():
    response = make_response(jsonify({"message": "EduTrack API is running"}))
    return add_cors_headers(response)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
