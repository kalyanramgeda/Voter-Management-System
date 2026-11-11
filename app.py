
from flask import Flask, render_template, request, jsonify
from database import voters
from pymongo.errors import DuplicateKeyError
from bson import ObjectId

app = Flask(__name__)


# HOME: Display dashboard
@app.route("/")
def home():
    return render_template("index.html")


# CREATE: Add voter
@app.route("/api/voters", methods=["POST"])
def add_voter():
    data = request.get_json(silent=True) or {}

    required_fields = [
        "voter_id", "name", "age",
        "gender", "state", "constituency"
    ]

    for field in required_fields:
        if field not in data or data[field] in (None, ""):
            return jsonify({"error": f"{field} is required"}), 400

    try:
        age = int(data["age"])
        if age < 18:
            return jsonify({"error": "Age must be at least 18"}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Age must be a valid number"}), 400

    voter = {
        "voter_id": str(data["voter_id"]).strip(),
        "name": str(data["name"]).strip(),
        "age": age,
        "gender": str(data["gender"]).strip(),
        "state": str(data["state"]).strip(),
        "constituency": str(data["constituency"]).strip(),
        "phone": str(data.get("phone", "")).strip(),
        "email": str(data.get("email", "")).strip()
    }

    try:
        result = voters.insert_one(voter)

        return jsonify({
            "message": "Voter added successfully",
            "inserted_id": str(result.inserted_id)
        }), 201

    except DuplicateKeyError:
        return jsonify({"error": "Voter ID already exists"}), 409


# READ: Get all voters
@app.route("/api/voters", methods=["GET"])
def get_voters():
    search = request.args.get("search", "").strip()

    query = {}

    if search:
        query = {
            "$or": [
                {"voter_id": {"$regex": search, "$options": "i"}},
                {"name": {"$regex": search, "$options": "i"}}
            ]
        }

    voter_list = list(
        voters.find(query).sort("name", 1)
    )

    for voter in voter_list:
        voter["_id"] = str(voter["_id"])

    return jsonify({
        "total": len(voter_list),
        "voters": voter_list
    })


# UPDATE: Update voter
@app.route("/api/voters/<voter_id>", methods=["PUT"])
def update_voter(voter_id):
    data = request.get_json(silent=True) or {}

    allowed_fields = [
        "name", "age", "gender",
        "state", "constituency", "phone", "email"
    ]

    update_data = {
        key: value
        for key, value in data.items()
        if key in allowed_fields
    }

    if not update_data:
        return jsonify({"error": "No valid fields provided"}), 400

    if "age" in update_data:
        try:
            update_data["age"] = int(update_data["age"])
            if update_data["age"] < 18:
                return jsonify({"error": "Age must be at least 18"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid age"}), 400

    for key, value in update_data.items():
        if isinstance(value, str):
            update_data[key] = value.strip()

    result = voters.update_one(
        {"voter_id": voter_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        return jsonify({"error": "Voter not found"}), 404

    return jsonify({
        "message": "Voter updated successfully",
        "modified_count": result.modified_count
    })


# DELETE: Delete voter
@app.route("/api/voters/<voter_id>", methods=["DELETE"])
def delete_voter(voter_id):
    result = voters.delete_one({"voter_id": voter_id})

    if result.deleted_count == 0:
        return jsonify({"error": "Voter not found"}), 404

    return jsonify({
        "message": "Voter deleted successfully",
        "deleted_count": result.deleted_count
    })


# DASHBOARD: Get statistics
@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    total = voters.count_documents({})
    male = voters.count_documents({"gender": "Male"})
    female = voters.count_documents({"gender": "Female"})

    state_stats = list(voters.aggregate([
        {
            "$group": {
                "_id": "$state",
                "total": {"$sum": 1}
            }
        },
        {"$sort": {"total": -1}}
    ]))

    return jsonify({
        "total_voters": total,
        "male_voters": male,
        "female_voters": female,
        "state_statistics": state_stats
    })


if __name__ == "__main__":
    app.run(debug=True)
