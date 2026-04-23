from db import get_db_connection, add_cors_headers, error_response, success_response
from flask import request, jsonify, make_response
from datetime import date

def handle_request(req):
    method = req.method

    if method == 'OPTIONS':
        response = make_response('', 200)
        return add_cors_headers(response)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        if method == 'GET':
            student_id = req.args.get('student_id')
            if student_id:
                cursor.execute("SELECT * FROM attendance WHERE student_id = %s ORDER BY date DESC", (student_id,))
            else:
                cursor.execute("SELECT * FROM attendance ORDER BY date DESC")

            records = cursor.fetchall()
            # Convert to camelCase for frontend
            result = []
            for row in records:
                result.append({
                    'id': row['id'],
                    'studentId': row['student_id'],
                    'date': str(row['date']),
                    'status': row['status'],
                    'subject': row['subject']
                })
            response = make_response(jsonify(result))

        elif method == 'POST':
            data = req.get_json()
            student_id = data.get('studentId', '')
            attendance_date = data.get('date', date.today().isoformat())
            status = data.get('status', 'Present')
            subject = data.get('subject', '')

            cursor.execute(
                "INSERT INTO attendance (student_id, date, status, subject) VALUES (%s, %s, %s, %s)",
                (student_id, attendance_date, status, subject)
            )
            conn.commit()
            response = make_response(jsonify({"success": True, "id": cursor.lastrowid}))

        elif method == 'DELETE':
            record_id = req.args.get('id')
            if not record_id:
                return error_response("Missing id", 400)

            cursor.execute("DELETE FROM attendance WHERE id = %s", (record_id,))
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
