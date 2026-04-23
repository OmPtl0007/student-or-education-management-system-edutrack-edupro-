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
                cursor.execute(
                    "SELECT * FROM leave_requests WHERE student_id = %s ORDER BY priority DESC, date DESC",
                    (student_id,)
                )
            else:
                cursor.execute("SELECT * FROM leave_requests ORDER BY priority DESC, date DESC")

            leaves = cursor.fetchall()
            result = []
            for row in leaves:
                result.append({
                    'id': int(row['id']),
                    'studentId': row['student_id'],
                    'reason': row['reason'],
                    'leaveType': row['leave_type'],
                    'priority': int(row['priority']),
                    'status': row['status'],
                    'date': str(row['date'])
                })
            response = make_response(jsonify(result))

        elif method == 'POST':
            data = req.get_json()
            student_id = data.get('studentId', '')
            reason = data.get('reason', '')
            leave_type = data.get('leaveType', 'casual')
            leave_date = data.get('date', date.today().isoformat())
            status = 'Pending'

            # Priority: medical=3, academic=2, casual=1
            priority_map = {'medical': 3, 'academic': 2, 'casual': 1}
            priority = priority_map.get(leave_type, 1)

            cursor.execute(
                "INSERT INTO leave_requests (student_id, reason, leave_type, priority, status, date) VALUES (%s, %s, %s, %s, %s, %s)",
                (student_id, reason, leave_type, priority, status, leave_date)
            )
            conn.commit()

            response = make_response(jsonify({
                "success": True,
                "id": cursor.lastrowid,
                "studentId": student_id,
                "reason": reason,
                "leaveType": leave_type,
                "priority": priority,
                "status": status,
                "date": leave_date
            }))

        elif method == 'PUT':
            data = req.get_json()
            leave_id = data.get('id')
            status = data.get('status')

            if not leave_id or not status:
                return error_response("Missing id or status", 400)

            cursor.execute("UPDATE leave_requests SET status = %s WHERE id = %s", (status, leave_id))
            conn.commit()
            response = make_response(jsonify({"success": True}))

        elif method == 'DELETE':
            leave_id = req.args.get('id')
            if not leave_id:
                return error_response("Missing id", 400)

            cursor.execute("DELETE FROM leave_requests WHERE id = %s", (leave_id,))
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
