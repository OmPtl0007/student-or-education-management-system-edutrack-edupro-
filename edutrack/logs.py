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
            # Limit how many logs to return (default 20, max 100)
            count = min(int(req.args.get('count', 20)), 100)

            cursor.execute(
                "SELECT * FROM system_logs ORDER BY timestamp DESC LIMIT %s",
                (count,)
            )
            logs = cursor.fetchall()

            result = []
            for row in logs:
                result.append({
                    'id': int(row['id']),
                    'timestamp': str(row['timestamp']),
                    'action': row['action'],
                    'user': row['user']
                })
            response = make_response(jsonify(result))

        elif method == 'POST':
            data = req.get_json()
            action = data.get('action', '')
            user = data.get('user')

            if not action:
                return error_response("Missing required field: action", 400)

            cursor.execute(
                "INSERT INTO system_logs (action, user) VALUES (%s, %s)",
                (action, user)
            )
            conn.commit()
            response = make_response(jsonify({"success": True, "id": cursor.lastrowid}))

        elif method == 'DELETE':
            # Clear all logs
            cursor.execute("TRUNCATE TABLE system_logs")
            conn.commit()
            response = make_response(jsonify({"success": True, "message": "All logs cleared"}))

        else:
            response = error_response("Method not allowed", 405)

        return add_cors_headers(response)

    except Exception as e:
        return error_response(str(e))

    finally:
        cursor.close()
        conn.close()
