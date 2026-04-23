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
                cursor.execute("SELECT * FROM documents WHERE student_id = %s ORDER BY date DESC", (student_id,))
            else:
                cursor.execute("SELECT * FROM documents ORDER BY date DESC")

            docs = cursor.fetchall()
            result = []
            for row in docs:
                result.append({
                    'id': int(row['id']),
                    'studentId': row['student_id'],
                    'name': row['name'],
                    'type': row['type'],
                    'date': str(row['date'])
                })
            response = make_response(jsonify(result))

        elif method == 'POST':
            data = req.get_json()
            student_id = data.get('studentId', '')
            name = data.get('name', '')
            doc_type = data.get('type', '')
            doc_date = data.get('date', date.today().isoformat())

            if not student_id or not name or not doc_type:
                return error_response("Missing required fields: studentId, name, type", 400)

            cursor.execute(
                "INSERT INTO documents (student_id, name, type, date) VALUES (%s, %s, %s, %s)",
                (student_id, name, doc_type, doc_date)
            )
            conn.commit()

            response = make_response(jsonify({
                "success": True,
                "id": cursor.lastrowid,
                "studentId": student_id,
                "name": name,
                "type": doc_type,
                "date": doc_date
            }))

        elif method == 'DELETE':
            doc_id = req.args.get('id')
            if not doc_id:
                return error_response("Missing id", 400)

            cursor.execute("DELETE FROM documents WHERE id = %s", (doc_id,))
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
