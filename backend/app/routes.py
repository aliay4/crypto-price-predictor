from flask import Blueprint, jsonify, request
import logging

from .coingecko_api import CoinGeckoAPI

# Configure logging
logger = logging.getLogger(__name__)

main = Blueprint('main', __name__)
api = CoinGeckoAPI()

@main.route('/api/coins', methods=['GET'])
def get_coins():
    """Get list of top coins by market cap"""
    try:
        limit = request.args.get('limit', default=10, type=int)
        logger.info(f"Getting top {limit} coins")
        
        coins = api.get_top_coins(limit)
        
        if not coins:
            logger.error("Failed to fetch coins list")
            return jsonify({"error": "Failed to fetch coins list"}), 500
            
        return jsonify(coins)
    except Exception as e:
        logger.exception(f"Error in get_coins: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@main.route('/api/coins/<coin_id>', methods=['GET'])
def get_coin_data(coin_id):
    """Get current data for a specific coin"""
    try:
        logger.info(f"Getting data for coin: {coin_id}")
        
        if not coin_id:
            return jsonify({"error": "Coin ID is required"}), 400
            
        data = api.get_coin_data(coin_id)
        
        if not data:
            logger.error(f"Failed to fetch data for coin: {coin_id}")
            return jsonify({"error": f"Failed to fetch data for coin: {coin_id}"}), 404
            
        return jsonify(data)
    except Exception as e:
        logger.exception(f"Error in get_coin_data: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@main.route('/api/coins/<coin_id>/history', methods=['GET'])
def get_coin_history(coin_id):
    """Get historical data for a specific coin"""
    try:
        logger.info(f"Getting historical data for coin: {coin_id}")
        
        # Validate and parse query parameters
        vs_currency = request.args.get('vs_currency', default='usd', type=str)
        days = request.args.get('days', default='30', type=str)
        
        # Validate days parameter
        valid_days = ['1', '7', '14', '30', '90', '180', '365', 'max']
        if days not in valid_days and not days.isdigit():
            logger.warning(f"Invalid days parameter: {days}, defaulting to '30'")
            days = '30'
        
        # Process historical data into a DataFrame
        df = api.process_historical_data(coin_id, vs_currency, days)
        
        if df is None:
            logger.error(f"Failed to fetch historical data for {coin_id}")
            return jsonify({"error": f"Failed to fetch historical data for {coin_id}"}), 404
        
        if df.empty:
            logger.warning(f"Empty historical data for {coin_id}")
            return jsonify({"warning": "No historical data available", "data": []}), 200
        
        # Convert DataFrame to JSON
        result = {
            "coin_id": coin_id,
            "vs_currency": vs_currency,
            "days": days,
            "data": df.reset_index().to_dict(orient='records')
        }
        
        return jsonify(result)
    except Exception as e:
        logger.exception(f"Error in get_coin_history: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@main.route('/api/coins/<coin_id>/ohlc', methods=['GET'])
def get_coin_ohlc(coin_id):
    """Get OHLC data for a specific coin"""
    try:
        logger.info(f"Getting OHLC data for coin: {coin_id}")
        
        vs_currency = request.args.get('vs_currency', default='usd', type=str)
        days = request.args.get('days', default=1, type=int)
        
        # Validate days parameter
        valid_days = [1, 7, 14, 30, 90, 180, 365]
        if days not in valid_days:
            logger.warning(f"Invalid days parameter: {days}, defaulting to 1")
            days = 1
        
        data = api.get_coin_ohlc(coin_id, vs_currency, days)
        
        if data is None:
            logger.error(f"Failed to fetch OHLC data for {coin_id}")
            return jsonify({"error": f"Failed to fetch OHLC data for {coin_id}"}), 404
        
        # Format OHLC data
        formatted_data = []
        for item in data:
            formatted_data.append({
                "timestamp": item[0],
                "open": item[1],
                "high": item[2],
                "low": item[3],
                "close": item[4]
            })
        
        result = {
            "coin_id": coin_id,
            "vs_currency": vs_currency,
            "days": days,
            "data": formatted_data
        }
        
        return jsonify(result)
    except Exception as e:
        logger.exception(f"Error in get_coin_ohlc: {str(e)}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@main.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "version": "1.0.1"})
