import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib.pyplot as plt
from ..utils.technical_indicators import TechnicalIndicators

class MarketAnalysis:
    """
    A class for analyzing cryptocurrency market data and generating insights.
    """
    
    def __init__(self):
        self.indicators = TechnicalIndicators()
    
    def analyze_market_trend(self, df, window=14):
        """
        Analyze the market trend based on price data.
        
        Args:
            df (DataFrame): DataFrame with price data
            window (int): Window size for trend analysis
            
        Returns:
            dict: Market trend analysis results
        """
        # Calculate price changes
        df['price_change'] = df['price'].pct_change()
        df['price_change_abs'] = df['price_change'].abs()
        
        # Calculate volatility
        volatility = df['price_change'].rolling(window=window).std() * np.sqrt(window)
        
        # Calculate trend strength
        sma_short = self.indicators.calculate_sma(df['price'], window=window)
        sma_long = self.indicators.calculate_sma(df['price'], window=window*2)
        trend_strength = (sma_short - sma_long) / sma_long
        
        # Determine market trend
        if trend_strength.iloc[-1] > 0.05:
            trend = "Strong Uptrend"
        elif trend_strength.iloc[-1] > 0.01:
            trend = "Uptrend"
        elif trend_strength.iloc[-1] < -0.05:
            trend = "Strong Downtrend"
        elif trend_strength.iloc[-1] < -0.01:
            trend = "Downtrend"
        else:
            trend = "Sideways"
        
        # Calculate momentum
        momentum = df['price'].diff(window)
        
        # Calculate average volume (if available)
        if 'volume' in df.columns:
            avg_volume = df['volume'].rolling(window=window).mean()
            volume_change = df['volume'].pct_change(window)
        else:
            avg_volume = None
            volume_change = None
        
        # Calculate RSI
        rsi = self.indicators.calculate_rsi(df['price'], window)
        
        # Determine if market is overbought or oversold
        if rsi.iloc[-1] > 70:
            market_condition = "Overbought"
        elif rsi.iloc[-1] < 30:
            market_condition = "Oversold"
        else:
            market_condition = "Neutral"
        
        return {
            'trend': trend,
            'trend_strength': trend_strength.iloc[-1],
            'volatility': volatility.iloc[-1],
            'momentum': momentum.iloc[-1],
            'rsi': rsi.iloc[-1],
            'market_condition': market_condition,
            'avg_volume': None if avg_volume is None else avg_volume.iloc[-1],
            'volume_change': None if volume_change is None else volume_change.iloc[-1]
        }
    
    def generate_trading_signals(self, df):
        """
        Generate trading signals based on technical indicators.
        
        Args:
            df (DataFrame): DataFrame with OHLCV data
            
        Returns:
            DataFrame: DataFrame with trading signals
        """
        # Calculate technical indicators
        result = self.indicators.calculate_all_indicators(df)
        
        # Generate signals
        signals = pd.DataFrame(index=result.index)
        
        # Moving Average Crossover Signal
        signals['sma_crossover'] = np.where(result['sma_50'] > result['sma_200'], 1, -1)
        
        # RSI Signal
        signals['rsi_signal'] = np.where(result['rsi_14'] < 30, 1, np.where(result['rsi_14'] > 70, -1, 0))
        
        # MACD Signal
        signals['macd_signal'] = np.where(result['macd_line'] > result['macd_signal'], 1, -1)
        
        # Bollinger Bands Signal
        signals['bb_signal'] = np.where(result['close'] < result['bb_lower'], 1, 
                                np.where(result['close'] > result['bb_upper'], -1, 0))
        
        # Stochastic Oscillator Signal
        signals['stoch_signal'] = np.where((result['stoch_k'] < 20) & (result['stoch_k'] > result['stoch_d']), 1,
                                  np.where((result['stoch_k'] > 80) & (result['stoch_k'] < result['stoch_d']), -1, 0))
        
        # Combined Signal
        signals['combined_signal'] = signals.mean(axis=1)
        
        # Signal Strength
        signals['signal_strength'] = abs(signals['combined_signal'])
        
        # Buy/Sell/Hold Recommendation
        signals['recommendation'] = np.where(signals['combined_signal'] > 0.5, 'Strong Buy',
                                    np.where(signals['combined_signal'] > 0.2, 'Buy',
                                    np.where(signals['combined_signal'] < -0.5, 'Strong Sell',
                                    np.where(signals['combined_signal'] < -0.2, 'Sell', 'Hold'))))
        
        return signals
    
    def evaluate_prediction_model(self, y_true, y_pred):
        """
        Evaluate the performance of a prediction model.
        
        Args:
            y_true (array): Actual values
            y_pred (array): Predicted values
            
        Returns:
            dict: Evaluation metrics
        """
        # Calculate error metrics
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_true, y_pred)
        r2 = r2_score(y_true, y_pred)
        
        # Calculate directional accuracy
        direction_true = np.sign(np.diff(np.append([y_true[0]], y_true)))
        direction_pred = np.sign(np.diff(np.append([y_pred[0]], y_pred)))
        directional_accuracy = np.mean(direction_true == direction_pred)
        
        # Calculate MAPE
        mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100
        
        return {
            'mse': mse,
            'rmse': rmse,
            'mae': mae,
            'r2': r2,
            'mape': mape,
            'directional_accuracy': directional_accuracy
        }
    
    def analyze_market_sentiment(self, news_data):
        """
        Analyze market sentiment based on news data.
        
        Args:
            news_data (list): List of news articles with sentiment scores
            
        Returns:
            dict: Sentiment analysis results
        """
        if not news_data:
            return {
                'overall_sentiment': 'Neutral',
                'sentiment_score': 0,
                'positive_ratio': 0,
                'negative_ratio': 0,
                'neutral_ratio': 0
            }
        
        # Calculate sentiment statistics
        sentiment_scores = [article['sentiment_score'] for article in news_data]
        avg_sentiment = np.mean(sentiment_scores)
        
        # Count positive, negative, and neutral articles
        positive_count = sum(1 for score in sentiment_scores if score > 0.2)
        negative_count = sum(1 for score in sentiment_scores if score < -0.2)
        neutral_count = len(sentiment_scores) - positive_count - negative_count
        
        # Calculate ratios
        total_count = len(sentiment_scores)
        positive_ratio = positive_count / total_count
        negative_ratio = negative_count / total_count
        neutral_ratio = neutral_count / total_count
        
        # Determine overall sentiment
        if avg_sentiment > 0.2:
            overall_sentiment = "Positive"
        elif avg_sentiment < -0.2:
            overall_sentiment = "Negative"
        else:
            overall_sentiment = "Neutral"
        
        return {
            'overall_sentiment': overall_sentiment,
            'sentiment_score': avg_sentiment,
            'positive_ratio': positive_ratio,
            'negative_ratio': negative_ratio,
            'neutral_ratio': neutral_ratio
        }
    
    def generate_price_forecast(self, df, prediction_model, days=7):
        """
        Generate price forecast using the prediction model.
        
        Args:
            df (DataFrame): Historical price data
            prediction_model: Trained prediction model
            days (int): Number of days to forecast
            
        Returns:
            dict: Price forecast results
        """
        # Get the last known price
        last_price = df['price'].iloc[-1]
        
        # Generate predictions
        predictions = prediction_model.predict_future(df, days=days)
        
        # Calculate prediction statistics
        predicted_prices = predictions.flatten()
        price_changes = [(price - last_price) / last_price * 100 for price in predicted_prices]
        
        # Determine forecast trend
        if predicted_prices[-1] > last_price * 1.1:
            trend = "Strong Bullish"
        elif predicted_prices[-1] > last_price * 1.02:
            trend = "Bullish"
        elif predicted_prices[-1] < last_price * 0.9:
            trend = "Strong Bearish"
        elif predicted_prices[-1] < last_price * 0.98:
            trend = "Bearish"
        else:
            trend = "Neutral"
        
        # Generate forecast dates
        from datetime import datetime, timedelta
        today = datetime.now()
        forecast_dates = [(today + timedelta(days=i+1)).strftime('%Y-%m-%d') for i in range(days)]
        
        # Create forecast data
        forecast_data = [
            {
                'date': date,
                'price': price,
                'change_percent': change
            }
            for date, price, change in zip(forecast_dates, predicted_prices, price_changes)
        ]
        
        return {
            'last_price': last_price,
            'forecast_trend': trend,
            'max_price': max(predicted_prices),
            'min_price': min(predicted_prices),
            'avg_price': np.mean(predicted_prices),
            'forecast_data': forecast_data
        }
    
    def plot_technical_analysis(self, df, save_path=None):
        """
        Create a technical analysis plot.
        
        Args:
            df (DataFrame): DataFrame with OHLCV data
            save_path (str): Path to save the plot
            
        Returns:
            str: Path to the saved plot
        """
        # Calculate indicators
        result = self.indicators.calculate_all_indicators(df)
        
        # Create figure with subplots
        fig, axs = plt.subplots(3, 1, figsize=(12, 10), gridspec_kw={'height_ratios': [3, 1, 1]})
        
        # Plot price and moving averages
        axs[0].plot(result.index, result['close'], label='Close Price')
        axs[0].plot(result.index, result['sma_20'], label='SMA 20')
        axs[0].plot(result.index, result['sma_50'], label='SMA 50')
        axs[0].plot(result.index, result['bb_upper'], 'k--', label='Upper BB')
        axs[0].plot(result.index, result['bb_middle'], 'k-', alpha=0.2)
        axs[0].plot(result.index, result['bb_lower'], 'k--', label='Lower BB')
        axs[0].set_title('Price and Moving Averages')
        axs[0].set_ylabel('Price')
        axs[0].legend()
        axs[0].grid(True)
        
        # Plot MACD
        axs[1].plot(result.index, result['macd_line'], label='MACD')
        axs[1].plot(result.index, result['macd_signal'], label='Signal')
        axs[1].bar(result.index, result['macd_histogram'], label='Histogram', alpha=0.5)
        axs[1].set_title('MACD')
        axs[1].set_ylabel('Value')
        axs[1].legend()
        axs[1].grid(True)
        
        # Plot RSI
        axs[2].plot(result.index, result['rsi_14'], label='RSI')
        axs[2].axhline(y=70, color='r', linestyle='--', alpha=0.5)
        axs[2].axhline(y=30, color='g', linestyle='--', alpha=0.5)
        axs[2].set_title('RSI')
        axs[2].set_ylabel('Value')
        axs[2].set_ylim(0, 100)
        axs[2].legend()
        axs[2].grid(True)
        
        # Format x-axis
        for ax in axs:
            ax.set_xlabel('Date')
        
        plt.tight_layout()
        
        # Save plot if path is provided
        if save_path:
            plt.savefig(save_path)
            plt.close()
            return save_path
        
        return None
