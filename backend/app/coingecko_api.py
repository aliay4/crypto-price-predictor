import requests
import pandas as pd
import time
import logging
from datetime import datetime
from functools import lru_cache

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CoinGeckoAPI:
    """
    A class to interact with the CoinGecko API for cryptocurrency data.
    """
    
    BASE_URL = "https://api.coingecko.com/api/v3"
    API_KEY = "CG-8Amf2LCq6wiLJRxbEYDNdUKb"
    
    def __init__(self):
        self.session = requests.Session()
        
        # Configure retry strategy
        retry_strategy = requests.adapters.Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["GET"]
        )
        adapter = requests.adapters.HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)
        
        # CoinGecko has a rate limit of 10-50 calls per minute for free tier
        self.rate_limit_pause = 6  # seconds between API calls
        self.last_call_time = 0
    
    def _handle_rate_limit(self):
        """Handle rate limiting by pausing between API calls."""
        current_time = time.time()
        time_since_last_call = current_time - self.last_call_time
        
        if time_since_last_call < self.rate_limit_pause:
            sleep_time = self.rate_limit_pause - time_since_last_call
            logger.debug(f"Rate limiting: Sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
            
        self.last_call_time = time.time()
    
    @lru_cache(maxsize=100)
    def _cached_request(self, endpoint, params_str):
        """Make a cached request to the CoinGecko API."""
        url = f"{self.BASE_URL}/{endpoint}"
        params = eval(params_str) if params_str else {}
        
        # Add API key to headers
        headers = {
            "x-cg-api-key": self.API_KEY
        }
        
        self._handle_rate_limit()
        
        try:
            logger.info(f"Making request to {url} with params {params}")
            response = self.session.get(url, params=params, headers=headers)
            response.raise_for_status()
            logger.debug(f"Request successful: {url}")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error making request to {url}: {e}")
            return None
    
    def _make_request(self, endpoint, params=None):
        """Make a request to the CoinGecko API with caching."""
        # Convert params dict to string for cache key
        params_str = str(params) if params else None
        return self._cached_request(endpoint, params_str)
    
    def get_coins_list(self):
        """Get list of all supported coins with id, name, and symbol."""
        logger.info("Getting list of all coins")
        return self._make_request("coins/list")
    
    def get_coins_markets(self, vs_currency="usd", ids=None, category=None, order="market_cap_desc", per_page=100, page=1):
        """
        Get list of coins with market data.
        
        Args:
            vs_currency (str): The target currency (default: "usd")
            ids (list): List of coin IDs to filter by
            category (str): Filter by coin category
            order (str): Sort results by field (default: "market_cap_desc")
            per_page (int): Number of results per page (default: 100, max: 250)
            page (int): Page number (default: 1)
        
        Returns:
            list: List of coins with market data
        """
        logger.info(f"Getting coins markets data: vs_currency={vs_currency}, per_page={per_page}, page={page}")
        params = {
            "vs_currency": vs_currency,
            "order": order,
            "per_page": per_page,
            "page": page,
            "sparkline": "false"
        }
        
        if ids:
            params["ids"] = ",".join(ids)
        
        if category:
            params["category"] = category
        
        return self._make_request("coins/markets", params)
    
    def get_coin_data(self, coin_id):
        """
        Get current data for a coin including price, market cap, volume, etc.
        
        Args:
            coin_id (str): The coin ID (e.g., "bitcoin")
        
        Returns:
            dict: Coin data
        """
        logger.info(f"Getting data for coin: {coin_id}")
        params = {
            "localization": "false",
            "tickers": "false",
            "market_data": "true",
            "community_data": "false",
            "developer_data": "false",
            "sparkline": "false"
        }
        
        return self._make_request(f"coins/{coin_id}", params)
    
    def get_coin_history(self, coin_id, date):
        """
        Get historical data for a coin at a specific date.
        
        Args:
            coin_id (str): The coin ID (e.g., "bitcoin")
            date (str): The date in DD-MM-YYYY format
        
        Returns:
            dict: Historical coin data
        """
        logger.info(f"Getting historical data for coin: {coin_id}, date: {date}")
        params = {
            "date": date,
            "localization": "false"
        }
        
        return self._make_request(f"coins/{coin_id}/history", params)
    
    def get_coin_market_chart(self, coin_id, vs_currency="usd", days="max"):
        """
        Get historical market data including price, market cap, and volume.
        
        Args:
            coin_id (str): The coin ID (e.g., "bitcoin")
            vs_currency (str): The target currency (default: "usd")
            days (str/int): Data up to number of days ago or "max" (default: "max")
        
        Returns:
            dict: Historical market data
        """
        logger.info(f"Getting market chart for coin: {coin_id}, vs_currency: {vs_currency}, days: {days}")
        
        # Validate days parameter
        valid_days = ['1', '7', '14', '30', '90', '180', '365', 'max']
        if isinstance(days, str) and days not in valid_days and not days.isdigit():
            logger.warning(f"Invalid days parameter: {days}, defaulting to '30'")
            days = '30'
        
        params = {
            "vs_currency": vs_currency,
            "days": days
        }
        
        # Set interval based on days
        if days == "max" or (isinstance(days, str) and days.isdigit() and int(days) > 90) or (isinstance(days, int) and days > 90):
            params["interval"] = "daily"
        else:
            params["interval"] = "hourly"
        
        return self._make_request(f"coins/{coin_id}/market_chart", params)
    
    def get_coin_ohlc(self, coin_id, vs_currency="usd", days=1):
        """
        Get OHLC (Open, High, Low, Close) data for a coin.
        
        Args:
            coin_id (str): The coin ID (e.g., "bitcoin")
            vs_currency (str): The target currency (default: "usd")
            days (int): Data up to number of days ago (1/7/14/30/90/180/365)
        
        Returns:
            list: OHLC data
        """
        logger.info(f"Getting OHLC data for coin: {coin_id}, vs_currency: {vs_currency}, days: {days}")
        params = {
            "vs_currency": vs_currency,
            "days": days
        }
        
        return self._make_request(f"coins/{coin_id}/ohlc", params)
    
    def process_historical_data(self, coin_id, vs_currency="usd", days="30"):
        """
        Process historical data into a pandas DataFrame.
        
        Args:
            coin_id (str): The coin ID (e.g., "bitcoin")
            vs_currency (str): The target currency (default: "usd")
            days (str/int): Data up to number of days ago or "max" (default: "30")
        
        Returns:
            DataFrame: Historical price data with dates as index
        """
        logger.info(f"Processing historical data for coin: {coin_id}, vs_currency: {vs_currency}, days: {days}")
        
        try:
            data = self.get_coin_market_chart(coin_id, vs_currency, days)
            
            if not data:
                logger.error(f"No data returned from CoinGecko API for {coin_id}")
                return None
                
            if "prices" not in data:
                logger.error(f"No price data in response for {coin_id}: {data}")
                return None
            
            # Convert price data to DataFrame
            df = pd.DataFrame(data["prices"], columns=["timestamp", "price"])
            
            # Add volume and market cap if available
            if "total_volumes" in data:
                volume_df = pd.DataFrame(data["total_volumes"], columns=["timestamp", "volume"])
                df = pd.merge(df, volume_df, on="timestamp", how="left")
            
            if "market_caps" in data:
                market_cap_df = pd.DataFrame(data["market_caps"], columns=["timestamp", "market_cap"])
                df = pd.merge(df, market_cap_df, on="timestamp", how="left")
            
            # Convert timestamp to datetime
            df["date"] = pd.to_datetime(df["timestamp"], unit="ms")
            df.set_index("date", inplace=True)
            df.drop("timestamp", axis=1, inplace=True)
            
            logger.info(f"Successfully processed historical data for {coin_id}: {len(df)} records")
            return df
            
        except Exception as e:
            logger.exception(f"Error processing historical data for {coin_id}: {str(e)}")
            return None
    
    def get_top_coins(self, limit=10):
        """
        Get the top cryptocurrencies by market cap.
        
        Args:
            limit (int): Number of top coins to return (default: 10)
        
        Returns:
            list: Top coins with market data
        """
        logger.info(f"Getting top {limit} coins by market cap")
        return self.get_coins_markets(per_page=limit, page=1)


# Example usage
if __name__ == "__main__":
    api = CoinGeckoAPI()
    
    # Get top 10 coins
    top_coins = api.get_top_coins(10)
    print(f"Top 10 coins by market cap:")
    for coin in top_coins:
        print(f"{coin['name']} ({coin['symbol'].upper()}) - ${coin['current_price']}")
    
    # Get Bitcoin data
    bitcoin_data = api.get_coin_data("bitcoin")
    print(f"\nBitcoin price: ${bitcoin_data['market_data']['current_price']['usd']}")
    
    # Get historical data for Bitcoin
    btc_df = api.process_historical_data("bitcoin", days=30)
    print(f"\nBitcoin historical data (last 30 days):")
    print(btc_df.tail())
