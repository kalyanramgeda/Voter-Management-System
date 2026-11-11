
from pymongo import MongoClient

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")

# Verify connection
client.admin.command("ping")

# Database
db = client["voter_management"]

# Collections
voters = db["voters"]
constituencies = db["constituencies"]

# Unique index to prevent duplicate voter IDs
voters.create_index("voter_id", unique=True)

print("MongoDB Connected Successfully!")
