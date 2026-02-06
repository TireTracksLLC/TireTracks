"""
Monte Alemu
This file creates and configures the Flask application.
"""
from flask import Flask
from flask_cors import CORS

#Function creates and returns flask app. run.py calls this function to start server
def create_app():
    app = Flask(__name__)
    #CORS needed for react front end communication
    CORS(app)

    #import API endpoints"
    from .routes import main
    app.register_blueprint(main)

    return app  
