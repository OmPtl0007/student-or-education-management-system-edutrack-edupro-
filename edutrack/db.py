import mysql.connector
from flask import jsonify, make_response

def get_db_connection():
    """Create and return a database connection."""
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="edutrack_new"
    )
    return conn

def add_cors_headers(response):
    """Add CORS headers to response."""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

def error_response(message, status_code=500):
    """Create an error JSON response."""
    response = make_response(jsonify({"error": message}), status_code)
    return add_cors_headers(response)

def success_response(data, status_code=200):
    """Create a success JSON response."""
    response = make_response(jsonify(data), status_code)
    return add_cors_headers(response)
