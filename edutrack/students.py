from db import get_db_connection, add_cors_headers, error_response, success_response
from flask import request, jsonify, make_response

def handle_request(req):
    method = req.method

    if method == 'OPTIONS':
        response = make_response('', 200)
        return add_cors_headers(response)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        if method == 'GET':
            student_id = req.args.get('id')
            if student_id:
                cursor.execute("SELECT * FROM students WHERE id = %s", (student_id,))
                result = cursor.fetchone()
                response = make_response(jsonify(result if result else {}))
            else:
                cursor.execute("SELECT * FROM students")
                students = cursor.fetchall()
                response = make_response(jsonify(students))

        elif method == 'POST':
            data = req.get_json()
            cursor.execute(
                "INSERT INTO students (id, name, email, phone, gpa, enrollment, year) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (data['id'], data['name'], data['email'], data['phone'], data.get('gpa', 0), data.get('enrollment', ''), data.get('year', ''))
            )
            conn.commit()
            response = make_response(jsonify({"success": True, "id": data['id']}))

        elif method == 'PUT':
            data = req.get_json()
            cursor.execute(
                "UPDATE students SET name=%s, email=%s, phone=%s, gpa=%s, year=%s WHERE id=%s",
                (data['name'], data['email'], data['phone'], data.get('gpa', 0), data.get('year', ''), data['id'])
            )
            conn.commit()
            response = make_response(jsonify({"success": True}))

        elif method == 'DELETE':
            student_id = req.args.get('id')
            cursor.execute("DELETE FROM students WHERE id = %s", (student_id,))
            conn.commit()
            response = make_response(jsonify({"success": True}))

        else:
            response = error_response("Method not allowed", 405)

        return add_cors_headers(response)

    except Exception as e:
        return error_response(str(e))

    finally:
        cursor.close()
        conn.close()
