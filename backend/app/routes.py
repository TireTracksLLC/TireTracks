"This file contains API endpoints"
from flask import Blueprint, jsonify

main = Blueprint("main", __name__)

@main.route("/health")
def health():
    return jsonify({"message": "TireTracks API is running!"})

#Temporary mock data for BACKEND (seperate mock of the databases mock data)
customers = [
    {"id": 1, "name": "John Doe", "phone": "123-456-7890"},
    {"id": 2, "name": "Jane Smith", "phone": "555-111-2222"}
]


#Get Customers endpoint
@main.route("/customers")
def get_customers():
    return jsonify(customers)
