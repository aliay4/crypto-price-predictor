import unittest
import sys
import os
import json
from unittest.mock import patch, MagicMock

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.coingecko_api import CoinGeckoAPI

class TestCoinGeckoAPI(unittest.TestCase):
    """Test cases for the CoinGeckoAPI class"""
    
    def setUp(self):
        """Set up test data and mock responses"""
        self.api = CoinGeckoAPI()
        
        # Mock response for coins list
        self.mock_coins_list = [
            {"id": "bitcoin", "symbol": "btc", "name": "Bitcoin"},
            {"id": "ethereum", "symbol": "eth", "name": "Ethereum"},
            {"id": "ripple", "symbol": "xrp", "name": "XRP"}
        ]
        
        # Mock response for coins markets
        self.mock_coins_markets = [
            {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "current_price": 50000,
                "market_cap": 1000000000000,
                "market_cap_rank": 1,
                "total_volume": 30000000000,
                "price_change_percentage_24h": 2.5,
                "market_cap_change_percentage_24h": 2.2,
                "circulating_supply": 19000000
            },
            {
                "id": "ethereum",
                "symbol": "eth",
                "name": "Ethereum",
                "current_price": 3000,
                "market_cap": 400000000000,
                "market_cap_rank": 2,
                "total_volume": 15000000000,
                "price_change_percentage_24h": 3.1,
                "market_cap_change_percentage_24h": 2.8,
                "circulating_supply": 120000000
            }
        ]
        
        # Mock response for coin data
        self.mock_coin_data = {
            "id": "bitcoin",
            "symbol": "btc",
            "name": "Bitcoin",
            "market_data": {
                "current_price": {"usd": 50000},
                "market_cap": {"usd": 1000000000000},
                "total_volume": {"usd": 30000000000},
                "price_change_percentage_24h": 2.5
            }
        }
        
        # Mock response for market chart
        self.mock_market_chart = {
            "prices": [[1617235200000, 50000], [1617321600000, 51000], [1617408000000, 52000]],
            "market_caps": [[1617235200000, 1000000000000], [1617321600000, 1020000000000], [1617408000000, 1040000000000]],
            "total_volumes": [[1617235200000, 30000000000], [1617321600000, 32000000000], [1617408000000, 31000000000]]
        }
        
        # Mock response for OHLC data
        self.mock_ohlc = [
            [1617235200000, 49500, 50500, 49000, 50000],
            [1617321600000, 50000, 51500, 50000, 51000],
            [1617408000000, 51000, 52500, 51000, 52000]
        ]
    
    @patch('requests.Session.get')
    def test_get_coins_list(self, mock_get):
        """Test getting list of coins"""
        # Configure mock
        mock_response = MagicMock()
        mock_response.json.return_value = self.mock_coins_list
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        # Call method
        result = self.api.get_coins_list()
        
        # Verify result
        self.assertEqual(result, self.mock_coins_list)
        mock_get.assert_called_once_with(f"{self.api.BASE_URL}/coins/list", params=None)
    
    @patch('requests.Session.get')
    def test_get_coins_markets(self, mock_get):
        """Test getting coins with market data"""
        # Configure mock
        mock_response = MagicMock()
        mock_response.json.return_value = self.mock_coins_markets
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        # Call method
        result = self.api.get_coins_markets(vs_currency="usd", per_page=2)
        
        # Verify result
        self.assertEqual(result, self.mock_coins_markets)
        mock_get.assert_called_once()
        
        # Check if parameters are correct
        call_args = mock_get.call_args[1]['params']
        self.assertEqual(call_args['vs_currency'], 'usd')
        self.assertEqual(call_args['per_page'], 2)
        self.assertEqual(call_args['sparkline'], 'false')
    
    @patch('requests.Session.get')
    def test_get_coin_data(self, mock_get):
        """Test getting data for a specific coin"""
        # Configure mock
        mock_response = MagicMock()
        mock_response.json.return_value = self.mock_coin_data
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        # Call method
        result = self.api.get_coin_data("bitcoin")
        
        # Verify result
        self.assertEqual(result, self.mock_coin_data)
        mock_get.assert_called_once()
        
        # Check if URL is correct
        call_args = mock_get.call_args
        self.assertIn(f"{self.api.BASE_URL}/coins/bitcoin", call_args[0][0])
    
    @patch('requests.Session.get')
    def test_get_coin_market_chart(self, mock_get):
        """Test getting historical market data"""
        # Configure mock
        mock_response = MagicMock()
        mock_response.json.return_value = self.mock_market_chart
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        # Call method
        result = self.api.get_coin_market_chart("bitcoin", days=3)
        
        # Verify result
        self.assertEqual(result, self.mock_market_chart)
        mock_get.assert_called_once()
        
        # Check if parameters are correct
        call_args = mock_get.call_args[1]['params']
        self.assertEqual(call_args['vs_currency'], 'usd')
        self.assertEqual(call_args['days'], 3)
    
    @patch('requests.Session.get')
    def test_get_coin_ohlc(self, mock_get):
        """Test getting OHLC data"""
        # Configure mock
        mock_response = MagicMock()
        mock_response.json.return_value = self.mock_ohlc
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        # Call method
        result = self.api.get_coin_ohlc("bitcoin", days=1)
        
        # Verify result
        self.assertEqual(result, self.mock_ohlc)
        mock_get.assert_called_once()
        
        # Check if parameters are correct
        call_args = mock_get.call_args[1]['params']
        self.assertEqual(call_args['vs_currency'], 'usd')
        self.assertEqual(call_args['days'], 1)
    
    @patch('requests.Session.get')
    def test_process_historical_data(self, mock_get):
        """Test processing historical data into DataFrame"""
        # Configure mock
        mock_response = MagicMock()
        mock_response.json.return_value = self.mock_market_chart
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        # Call method
        result = self.api.process_historical_data("bitcoin", days=3)
        
        # Verify result
        self.assertIsNotNone(result)
        self.assertEqual(len(result), 3)  # 3 data points
        self.assertTrue('price' in result.columns)
        self.assertTrue('volume' in result.columns)
        self.assertTrue('market_cap' in result.columns)
        
        # Check if values are correct
        self.assertEqual(result['price'].iloc[0], 50000)
        self.assertEqual(result['price'].iloc[1], 51000)
        self.assertEqual(result['price'].iloc[2], 52000)
    
    @patch('requests.Session.get')
    def test_get_top_coins(self, mock_get):
        """Test getting top coins by market cap"""
        # Configure mock
        mock_response = MagicMock()
        mock_response.json.return_value = self.mock_coins_markets
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        # Call method
        result = self.api.get_top_coins(limit=2)
        
        # Verify result
        self.assertEqual(result, self.mock_coins_markets)
        mock_get.assert_called_once()
        
        # Check if parameters are correct
        call_args = mock_get.call_args[1]['params']
        self.assertEqual(call_args['per_page'], 2)
        self.assertEqual(call_args['page'], 1)


if __name__ == '__main__':
    unittest.main()
