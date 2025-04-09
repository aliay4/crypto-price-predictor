import unittest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.technical_indicators import TechnicalIndicators
from utils.market_analysis import MarketAnalysis

class TestTechnicalIndicators(unittest.TestCase):
    """Test cases for the TechnicalIndicators class"""
    
    def setUp(self):
        """Set up test data"""
        # Create sample price data
        dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
        
        # Create a price series with a known pattern for testing
        prices = np.linspace(100, 200, 50)  # Uptrend
        prices = np.append(prices, np.linspace(200, 150, 30))  # Downtrend
        prices = np.append(prices, np.linspace(150, 180, 20))  # Uptrend again
        
        # Add some noise
        np.random.seed(42)
        noise = np.random.normal(0, 5, 100)
        prices = prices + noise
        
        # Create OHLCV data
        high = prices * 1.02
        low = prices * 0.98
        open_prices = prices * 0.995
        close = prices
        volume = np.random.randint(1000, 10000, 100)
        
        # Create DataFrame
        self.df = pd.DataFrame({
            'open': open_prices,
            'high': high,
            'low': low,
            'close': close,
            'volume': volume
        }, index=dates)
        
        # Create TechnicalIndicators instance
        self.indicators = TechnicalIndicators()
    
    def test_sma(self):
        """Test Simple Moving Average calculation"""
        sma = self.indicators.calculate_sma(self.df['close'], 20)
        
        # Check if SMA is calculated correctly
        self.assertEqual(len(sma), len(self.df))
        self.assertTrue(pd.isna(sma.iloc[0]))  # First values should be NaN
        self.assertTrue(pd.isna(sma.iloc[18]))  # First 19 values should be NaN
        self.assertFalse(pd.isna(sma.iloc[19]))  # 20th value should not be NaN
        
        # Check if SMA is close to the average of the last 20 values
        for i in range(20, len(self.df)):
            expected_sma = self.df['close'].iloc[i-20:i].mean()
            self.assertAlmostEqual(sma.iloc[i], expected_sma, places=10)
    
    def test_ema(self):
        """Test Exponential Moving Average calculation"""
        ema = self.indicators.calculate_ema(self.df['close'], 20)
        
        # Check if EMA is calculated
        self.assertEqual(len(ema), len(self.df))
        self.assertFalse(pd.isna(ema.iloc[0]))  # EMA should have values from the start
    
    def test_rsi(self):
        """Test Relative Strength Index calculation"""
        rsi = self.indicators.calculate_rsi(self.df['close'], 14)
        
        # Check if RSI is calculated correctly
        self.assertEqual(len(rsi), len(self.df))
        self.assertTrue(pd.isna(rsi.iloc[0]))  # First values should be NaN
        
        # Check if RSI is within range [0, 100]
        for i in range(14, len(self.df)):
            self.assertTrue(0 <= rsi.iloc[i] <= 100)
    
    def test_macd(self):
        """Test MACD calculation"""
        macd_line, signal_line, histogram = self.indicators.calculate_macd(self.df['close'])
        
        # Check if MACD components are calculated
        self.assertEqual(len(macd_line), len(self.df))
        self.assertEqual(len(signal_line), len(self.df))
        self.assertEqual(len(histogram), len(self.df))
        
        # Check if histogram is the difference between MACD and signal line
        for i in range(len(self.df)):
            if not pd.isna(histogram.iloc[i]):
                self.assertAlmostEqual(histogram.iloc[i], macd_line.iloc[i] - signal_line.iloc[i], places=10)
    
    def test_bollinger_bands(self):
        """Test Bollinger Bands calculation"""
        middle_band, upper_band, lower_band = self.indicators.calculate_bollinger_bands(self.df['close'], 20, 2)
        
        # Check if bands are calculated
        self.assertEqual(len(middle_band), len(self.df))
        self.assertEqual(len(upper_band), len(self.df))
        self.assertEqual(len(lower_band), len(self.df))
        
        # Check if middle band is the SMA
        sma = self.indicators.calculate_sma(self.df['close'], 20)
        for i in range(len(self.df)):
            if not pd.isna(middle_band.iloc[i]):
                self.assertAlmostEqual(middle_band.iloc[i], sma.iloc[i], places=10)
        
        # Check if upper and lower bands are correct distance from middle band
        for i in range(20, len(self.df)):
            std = self.df['close'].iloc[i-20:i].std()
            self.assertAlmostEqual(upper_band.iloc[i], middle_band.iloc[i] + 2 * std, places=10)
            self.assertAlmostEqual(lower_band.iloc[i], middle_band.iloc[i] - 2 * std, places=10)
    
    def test_fibonacci_retracement(self):
        """Test Fibonacci Retracement calculation"""
        high_price = 200
        low_price = 100
        
        fib_levels = self.indicators.calculate_fibonacci_retracement(high_price, low_price)
        
        # Check if Fibonacci levels are calculated correctly
        self.assertEqual(fib_levels['0.0'], 100)
        self.assertEqual(fib_levels['0.236'], 100 + 0.236 * 100)
        self.assertEqual(fib_levels['0.382'], 100 + 0.382 * 100)
        self.assertEqual(fib_levels['0.5'], 100 + 0.5 * 100)
        self.assertEqual(fib_levels['0.618'], 100 + 0.618 * 100)
        self.assertEqual(fib_levels['0.786'], 100 + 0.786 * 100)
        self.assertEqual(fib_levels['1.0'], 200)
    
    def test_calculate_all_indicators(self):
        """Test calculation of all indicators"""
        result = self.indicators.calculate_all_indicators(self.df)
        
        # Check if all indicators are calculated
        self.assertTrue('sma_20' in result.columns)
        self.assertTrue('sma_50' in result.columns)
        self.assertTrue('sma_200' in result.columns)
        self.assertTrue('ema_12' in result.columns)
        self.assertTrue('ema_26' in result.columns)
        self.assertTrue('rsi_14' in result.columns)
        self.assertTrue('macd_line' in result.columns)
        self.assertTrue('macd_signal' in result.columns)
        self.assertTrue('macd_histogram' in result.columns)
        self.assertTrue('bb_middle' in result.columns)
        self.assertTrue('bb_upper' in result.columns)
        self.assertTrue('bb_lower' in result.columns)
        self.assertTrue('stoch_k' in result.columns)
        self.assertTrue('stoch_d' in result.columns)
        self.assertTrue('atr' in result.columns)
        self.assertTrue('obv' in result.columns)


class TestMarketAnalysis(unittest.TestCase):
    """Test cases for the MarketAnalysis class"""
    
    def setUp(self):
        """Set up test data"""
        # Create sample price data
        dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
        
        # Create a price series with a known pattern for testing
        prices = np.linspace(100, 200, 50)  # Uptrend
        prices = np.append(prices, np.linspace(200, 150, 30))  # Downtrend
        prices = np.append(prices, np.linspace(150, 180, 20))  # Uptrend again
        
        # Add some noise
        np.random.seed(42)
        noise = np.random.normal(0, 5, 100)
        prices = prices + noise
        
        # Create OHLCV data
        high = prices * 1.02
        low = prices * 0.98
        open_prices = prices * 0.995
        close = prices
        volume = np.random.randint(1000, 10000, 100)
        
        # Create DataFrame
        self.df = pd.DataFrame({
            'open': open_prices,
            'high': high,
            'low': low,
            'close': close,
            'volume': volume,
            'price': close  # Add price column for market analysis
        }, index=dates)
        
        # Create MarketAnalysis instance
        self.market_analysis = MarketAnalysis()
    
    def test_analyze_market_trend(self):
        """Test market trend analysis"""
        trend_analysis = self.market_analysis.analyze_market_trend(self.df)
        
        # Check if trend analysis returns expected keys
        self.assertTrue('trend' in trend_analysis)
        self.assertTrue('trend_strength' in trend_analysis)
        self.assertTrue('volatility' in trend_analysis)
        self.assertTrue('momentum' in trend_analysis)
        self.assertTrue('rsi' in trend_analysis)
        self.assertTrue('market_condition' in trend_analysis)
        self.assertTrue('avg_volume' in trend_analysis)
        self.assertTrue('volume_change' in trend_analysis)
        
        # Check if trend is one of the expected values
        self.assertIn(trend_analysis['trend'], ["Strong Uptrend", "Uptrend", "Strong Downtrend", "Downtrend", "Sideways"])
        
        # Check if market condition is one of the expected values
        self.assertIn(trend_analysis['market_condition'], ["Overbought", "Oversold", "Neutral"])
    
    def test_generate_trading_signals(self):
        """Test trading signal generation"""
        signals = self.market_analysis.generate_trading_signals(self.df)
        
        # Check if signals DataFrame has expected columns
        self.assertTrue('sma_crossover' in signals.columns)
        self.assertTrue('rsi_signal' in signals.columns)
        self.assertTrue('macd_signal' in signals.columns)
        self.assertTrue('bb_signal' in signals.columns)
        self.assertTrue('stoch_signal' in signals.columns)
        self.assertTrue('combined_signal' in signals.columns)
        self.assertTrue('signal_strength' in signals.columns)
        self.assertTrue('recommendation' in signals.columns)
        
        # Check if recommendation is one of the expected values
        for rec in signals['recommendation'].dropna():
            self.assertIn(rec, ["Strong Buy", "Buy", "Hold", "Sell", "Strong Sell"])
    
    def test_evaluate_prediction_model(self):
        """Test prediction model evaluation"""
        # Create sample actual and predicted values
        y_true = np.array([100, 105, 110, 108, 112, 115, 118])
        y_pred = np.array([102, 107, 109, 110, 113, 116, 117])
        
        evaluation = self.market_analysis.evaluate_prediction_model(y_true, y_pred)
        
        # Check if evaluation returns expected metrics
        self.assertTrue('mse' in evaluation)
        self.assertTrue('rmse' in evaluation)
        self.assertTrue('mae' in evaluation)
        self.assertTrue('r2' in evaluation)
        self.assertTrue('mape' in evaluation)
        self.assertTrue('directional_accuracy' in evaluation)
        
        # Check if metrics are within reasonable ranges
        self.assertTrue(evaluation['mse'] >= 0)
        self.assertTrue(evaluation['rmse'] >= 0)
        self.assertTrue(evaluation['mae'] >= 0)
        self.assertTrue(evaluation['r2'] <= 1)
        self.assertTrue(evaluation['mape'] >= 0)
        self.assertTrue(0 <= evaluation['directional_accuracy'] <= 1)
    
    def test_analyze_market_sentiment(self):
        """Test market sentiment analysis"""
        # Create sample news data
        news_data = [
            {'title': 'Bitcoin surges to new high', 'sentiment_score': 0.8},
            {'title': 'Ethereum upgrade successful', 'sentiment_score': 0.6},
            {'title': 'Crypto market faces regulatory challenges', 'sentiment_score': -0.3},
            {'title': 'New cryptocurrency launched', 'sentiment_score': 0.1}
        ]
        
        sentiment_analysis = self.market_analysis.analyze_market_sentiment(news_data)
        
        # Check if sentiment analysis returns expected keys
        self.assertTrue('overall_sentiment' in sentiment_analysis)
        self.assertTrue('sentiment_score' in sentiment_analysis)
        self.assertTrue('positive_ratio' in sentiment_analysis)
        self.assertTrue('negative_ratio' in sentiment_analysis)
        self.assertTrue('neutral_ratio' in sentiment_analysis)
        
        # Check if overall sentiment is one of the expected values
        self.assertIn(sentiment_analysis['overall_sentiment'], ["Positive", "Negative", "Neutral"])
        
        # Check if ratios sum to 1
        self.assertAlmostEqual(
            sentiment_analysis['positive_ratio'] + 
            sentiment_analysis['negative_ratio'] + 
            sentiment_analysis['neutral_ratio'], 
            1.0, 
            places=10
        )


if __name__ == '__main__':
    unittest.main()
