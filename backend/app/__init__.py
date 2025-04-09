import os
from flask import Flask, jsonify
from flask_cors import CORS
import logging

def create_app(config_name='development'):
    """Create and configure the Flask app."""
    app = Flask(__name__)
    
    # Configure logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    logger = logging.getLogger(__name__)
    
    # Enable CORS for all routes
    CORS(app)
    
    # Register blueprints
    from .routes import main
    app.register_blueprint(main)
    
    # Register error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        logger.error(f"404 error: {error}")
        return jsonify({"error": "Resource not found"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"500 error: {error}")
        return jsonify({"error": "Internal server error"}), 500
    
    @app.errorhandler(429)
    def rate_limit_error(error):
        logger.error(f"429 error: {error}")
        return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
    
    logger.info(f"Application created with config: {config_name}")
    return app
