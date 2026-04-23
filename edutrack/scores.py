from db import get_db_connection, add_cors_headers, error_response, success_response
from flask import request, jsonify, make_response

def recalculate_gpa(conn, student_id):
    """Recalculate and update GPA for a student."""
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT AVG(value) as avg_score FROM academic_scores WHERE student_id = %s", (student_id,))
    result = cursor.fetchone()
    avg_score = result['avg_score'] if result and result['avg_score'] else 0
    gpa = (avg_score / 100) * 4 if avg_score else 0

    cursor.execute("UPDATE students SET gpa = %s WHERE id = %s", (round(gpa, 2), student_id))
    conn.commit()
    cursor.close()
    return round(gpa, 2)

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
                cursor.execute("SELECT * FROM academic_scores WHERE student_id = %s", (student_id,))
            else:
                cursor.execute("SELECT * FROM academic_scores")

            scores = cursor.fetchall()
            result = []
            for row in scores:
                result.append({
                    'id': row['id'],
                    'studentId': row['student_id'],
                    'scoreType': row['score_type'],
                    'value': float(row['value'])
                })
            response = make_response(jsonify(result))

        elif method == 'POST':
            data = req.get_json()
            student_id = data.get('studentId', '')
            score_type = data.get('scoreType', '')
            value = data.get('value', 0)

            cursor.execute(
                "INSERT INTO academic_scores (student_id, score_type, value) VALUES (%s, %s, %s)",
                (student_id, score_type, value)
            )
            conn.commit()

            # Recalculate GPA
            updated_gpa = recalculate_gpa(conn, student_id)

            response = make_response(jsonify({
                "success": True,
                "id": cursor.lastrowid,
                "updatedGpa": updated_gpa
            }))

        elif method == 'DELETE':
            record_id = req.args.get('id')
            if not record_id:
                return error_response("Missing id", 400)

            # Get student_id before deleting
            cursor.execute("SELECT student_id FROM academic_scores WHERE id = %s", (record_id,))
            result = cursor.fetchone()
            student_id = result['student_id'] if result else None

            cursor.execute("DELETE FROM academic_scores WHERE id = %s", (record_id,))
            conn.commit()

            if student_id:
                recalculate_gpa(conn, student_id)

            response = make_response(jsonify({"success": True}))

        else:
            response = error_response("Method not allowed", 405)

        return add_cors_headers(response)

    except Exception as e:
        return error_response(str(e))

    finally:
        cursor.close()
        conn.close()
