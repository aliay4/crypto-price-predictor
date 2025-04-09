import numpy as np
import pandas as pd

class TechnicalIndicators:
    """
    A class for calculating various technical indicators for cryptocurrency analysis.
    """
    
    @staticmethod
    def calculate_sma(data, window):
        """
        Calculate Simple Moving Average
        
        Args:
            data (pd.Series): Price data
            window (int): Window size for moving average
            
        Returns:
            pd.Series: Simple Moving Average
        """
        return data.rolling(window=window).mean()
    
    @staticmethod
    def calculate_ema(data, window):
        """
        Calculate Exponential Moving Average
        
        Args:
            data (pd.Series): Price data
            window (int): Window size for moving average
            
        Returns:
            pd.Series: Exponential Moving Average
        """
        return data.ewm(span=window, adjust=False).mean()
    
    @staticmethod
    def calculate_rsi(data, window=14):
        """
        Calculate Relative Strength Index
        
        Args:
            data (pd.Series): Price data
            window (int): Window size for RSI calculation
            
        Returns:
            pd.Series: RSI values
        """
        # Calculate price changes
        delta = data.diff()
        
        # Separate gains and losses
        gain = delta.where(delta > 0, 0)
        loss = -delta.where(delta < 0, 0)
        
        # Calculate average gain and loss
        avg_gain = gain.rolling(window=window).mean()
        avg_loss = loss.rolling(window=window).mean()
        
        # Calculate RS
        rs = avg_gain / avg_loss
        
        # Calculate RSI
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    @staticmethod
    def calculate_macd(data, fast_window=12, slow_window=26, signal_window=9):
        """
        Calculate Moving Average Convergence Divergence
        
        Args:
            data (pd.Series): Price data
            fast_window (int): Window size for fast EMA
            slow_window (int): Window size for slow EMA
            signal_window (int): Window size for signal line
            
        Returns:
            tuple: (MACD line, Signal line, Histogram)
        """
        # Calculate fast and slow EMAs
        ema_fast = TechnicalIndicators.calculate_ema(data, fast_window)
        ema_slow = TechnicalIndicators.calculate_ema(data, slow_window)
        
        # Calculate MACD line
        macd_line = ema_fast - ema_slow
        
        # Calculate signal line
        signal_line = TechnicalIndicators.calculate_ema(macd_line, signal_window)
        
        # Calculate histogram
        histogram = macd_line - signal_line
        
        return macd_line, signal_line, histogram
    
    @staticmethod
    def calculate_bollinger_bands(data, window=20, num_std=2):
        """
        Calculate Bollinger Bands
        
        Args:
            data (pd.Series): Price data
            window (int): Window size for moving average
            num_std (int): Number of standard deviations for bands
            
        Returns:
            tuple: (Middle Band, Upper Band, Lower Band)
        """
        # Calculate middle band (SMA)
        middle_band = TechnicalIndicators.calculate_sma(data, window)
        
        # Calculate standard deviation
        std = data.rolling(window=window).std()
        
        # Calculate upper and lower bands
        upper_band = middle_band + (std * num_std)
        lower_band = middle_band - (std * num_std)
        
        return middle_band, upper_band, lower_band
    
    @staticmethod
    def calculate_fibonacci_retracement(high, low):
        """
        Calculate Fibonacci Retracement Levels
        
        Args:
            high (float): Highest price in the range
            low (float): Lowest price in the range
            
        Returns:
            dict: Fibonacci retracement levels
        """
        diff = high - low
        
        return {
            '0.0': low,
            '0.236': low + 0.236 * diff,
            '0.382': low + 0.382 * diff,
            '0.5': low + 0.5 * diff,
            '0.618': low + 0.618 * diff,
            '0.786': low + 0.786 * diff,
            '1.0': high
        }
    
    @staticmethod
    def calculate_stochastic_oscillator(high, low, close, k_window=14, d_window=3):
        """
        Calculate Stochastic Oscillator
        
        Args:
            high (pd.Series): High prices
            low (pd.Series): Low prices
            close (pd.Series): Close prices
            k_window (int): Window size for %K
            d_window (int): Window size for %D
            
        Returns:
            tuple: (%K, %D)
        """
        # Calculate %K
        lowest_low = low.rolling(window=k_window).min()
        highest_high = high.rolling(window=k_window).max()
        k = 100 * ((close - lowest_low) / (highest_high - lowest_low))
        
        # Calculate %D
        d = k.rolling(window=d_window).mean()
        
        return k, d
    
    @staticmethod
    def calculate_atr(high, low, close, window=14):
        """
        Calculate Average True Range
        
        Args:
            high (pd.Series): High prices
            low (pd.Series): Low prices
            close (pd.Series): Close prices
            window (int): Window size for ATR
            
        Returns:
            pd.Series: ATR values
        """
        # Calculate True Range
        tr1 = high - low
        tr2 = abs(high - close.shift())
        tr3 = abs(low - close.shift())
        
        tr = pd.DataFrame({'tr1': tr1, 'tr2': tr2, 'tr3': tr3}).max(axis=1)
        
        # Calculate ATR
        atr = tr.rolling(window=window).mean()
        
        return atr
    
    @staticmethod
    def calculate_obv(close, volume):
        """
        Calculate On-Balance Volume
        
        Args:
            close (pd.Series): Close prices
            volume (pd.Series): Volume data
            
        Returns:
            pd.Series: OBV values
        """
        # Calculate price direction
        direction = np.where(close > close.shift(1), 1, np.where(close < close.shift(1), -1, 0))
        
        # Calculate OBV
        obv = (direction * volume).cumsum()
        
        return pd.Series(obv, index=close.index)
    
    @staticmethod
    def calculate_ichimoku_cloud(high, low, close, conversion_period=9, base_period=26, lagging_span_period=52, displacement=26):
        """
        Calculate Ichimoku Cloud
        
        Args:
            high (pd.Series): High prices
            low (pd.Series): Low prices
            close (pd.Series): Close prices
            conversion_period (int): Period for Conversion Line
            base_period (int): Period for Base Line
            lagging_span_period (int): Period for Lagging Span
            displacement (int): Displacement period
            
        Returns:
            tuple: (Conversion Line, Base Line, Leading Span A, Leading Span B, Lagging Span)
        """
        # Calculate Conversion Line (Tenkan-sen)
        conversion_high = high.rolling(window=conversion_period).max()
        conversion_low = low.rolling(window=conversion_period).min()
        conversion_line = (conversion_high + conversion_low) / 2
        
        # Calculate Base Line (Kijun-sen)
        base_high = high.rolling(window=base_period).max()
        base_low = low.rolling(window=base_period).min()
        base_line = (base_high + base_low) / 2
        
        # Calculate Leading Span A (Senkou Span A)
        leading_span_a = ((conversion_line + base_line) / 2).shift(displacement)
        
        # Calculate Leading Span B (Senkou Span B)
        leading_span_b_high = high.rolling(window=lagging_span_period).max()
        leading_span_b_low = low.rolling(window=lagging_span_period).min()
        leading_span_b = ((leading_span_b_high + leading_span_b_low) / 2).shift(displacement)
        
        # Calculate Lagging Span (Chikou Span)
        lagging_span = close.shift(-displacement)
        
        return conversion_line, base_line, leading_span_a, leading_span_b, lagging_span
    
    @staticmethod
    def calculate_all_indicators(df):
        """
        Calculate all technical indicators for a DataFrame with OHLCV data
        
        Args:
            df (DataFrame): DataFrame with 'open', 'high', 'low', 'close', 'volume' columns
            
        Returns:
            DataFrame: DataFrame with all technical indicators
        """
        result = df.copy()
        
        # Calculate Moving Averages
        result['sma_20'] = TechnicalIndicators.calculate_sma(df['close'], 20)
        result['sma_50'] = TechnicalIndicators.calculate_sma(df['close'], 50)
        result['sma_200'] = TechnicalIndicators.calculate_sma(df['close'], 200)
        result['ema_12'] = TechnicalIndicators.calculate_ema(df['close'], 12)
        result['ema_26'] = TechnicalIndicators.calculate_ema(df['close'], 26)
        
        # Calculate RSI
        result['rsi_14'] = TechnicalIndicators.calculate_rsi(df['close'], 14)
        
        # Calculate MACD
        macd_line, signal_line, histogram = TechnicalIndicators.calculate_macd(df['close'])
        result['macd_line'] = macd_line
        result['macd_signal'] = signal_line
        result['macd_histogram'] = histogram
        
        # Calculate Bollinger Bands
        middle_band, upper_band, lower_band = TechnicalIndicators.calculate_bollinger_bands(df['close'])
        result['bb_middle'] = middle_band
        result['bb_upper'] = upper_band
        result['bb_lower'] = lower_band
        
        # Calculate Stochastic Oscillator
        k, d = TechnicalIndicators.calculate_stochastic_oscillator(df['high'], df['low'], df['close'])
        result['stoch_k'] = k
        result['stoch_d'] = d
        
        # Calculate ATR
        result['atr'] = TechnicalIndicators.calculate_atr(df['high'], df['low'], df['close'])
        
        # Calculate OBV
        if 'volume' in df.columns:
            result['obv'] = TechnicalIndicators.calculate_obv(df['close'], df['volume'])
        
        return result
