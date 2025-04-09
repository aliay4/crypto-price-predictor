import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import matplotlib.pyplot as plt
import os

class PricePredictionModel:
    """
    A class for predicting cryptocurrency prices using LSTM neural networks.
    """
    
    def __init__(self, coin_id, data_dir='../data'):
        self.coin_id = coin_id
        self.data_dir = data_dir
        self.model = None
        self.scaler = MinMaxScaler(feature_range=(0, 1))
        
        # Create data directory if it doesn't exist
        os.makedirs(data_dir, exist_ok=True)
    
    def prepare_data(self, df, sequence_length=60, test_size=0.2):
        """
        Prepare data for LSTM model training.
        
        Args:
            df (DataFrame): Historical price data
            sequence_length (int): Number of previous days to use for prediction
            test_size (float): Proportion of data to use for testing
        
        Returns:
            tuple: (X_train, y_train, X_test, y_test, scaler)
        """
        # Extract price data and scale it
        data = df[['price']].values
        scaled_data = self.scaler.fit_transform(data)
        
        # Create sequences
        X, y = [], []
        for i in range(sequence_length, len(scaled_data)):
            X.append(scaled_data[i-sequence_length:i, 0])
            y.append(scaled_data[i, 0])
        
        X, y = np.array(X), np.array(y)
        
        # Reshape X to be [samples, time steps, features]
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))
        
        # Split into train and test sets
        train_size = int(len(X) * (1 - test_size))
        X_train, X_test = X[:train_size], X[train_size:]
        y_train, y_test = y[:train_size], y[train_size:]
        
        return X_train, y_train, X_test, y_test
    
    def build_model(self, sequence_length):
        """
        Build LSTM model for price prediction.
        
        Args:
            sequence_length (int): Number of previous days to use for prediction
        """
        model = Sequential()
        
        # LSTM layers
        model.add(LSTM(units=50, return_sequences=True, input_shape=(sequence_length, 1)))
        model.add(Dropout(0.2))
        model.add(LSTM(units=50, return_sequences=True))
        model.add(Dropout(0.2))
        model.add(LSTM(units=50))
        model.add(Dropout(0.2))
        
        # Output layer
        model.add(Dense(units=1))
        
        # Compile model
        model.compile(optimizer='adam', loss='mean_squared_error')
        
        self.model = model
    
    def train(self, X_train, y_train, epochs=100, batch_size=32, validation_split=0.1):
        """
        Train the LSTM model.
        
        Args:
            X_train (array): Training features
            y_train (array): Training target
            epochs (int): Number of training epochs
            batch_size (int): Batch size for training
            validation_split (float): Proportion of training data to use for validation
        
        Returns:
            History: Training history
        """
        if self.model is None:
            raise ValueError("Model not built. Call build_model() first.")
        
        history = self.model.fit(
            X_train, y_train,
            epochs=epochs,
            batch_size=batch_size,
            validation_split=validation_split,
            verbose=1
        )
        
        return history
    
    def evaluate(self, X_test, y_test):
        """
        Evaluate the model on test data.
        
        Args:
            X_test (array): Test features
            y_test (array): Test target
        
        Returns:
            float: Mean squared error
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Make predictions
        predictions = self.model.predict(X_test)
        
        # Inverse transform predictions and actual values
        predictions = self.scaler.inverse_transform(predictions)
        y_test_actual = self.scaler.inverse_transform(y_test.reshape(-1, 1))
        
        # Calculate RMSE
        rmse = np.sqrt(np.mean(np.square(predictions - y_test_actual)))
        
        return rmse, predictions, y_test_actual
    
    def predict_future(self, df, days=7, sequence_length=60):
        """
        Predict future prices.
        
        Args:
            df (DataFrame): Historical price data
            days (int): Number of days to predict into the future
            sequence_length (int): Number of previous days to use for prediction
        
        Returns:
            array: Predicted prices
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Extract the last 'sequence_length' days of data
        last_sequence = df['price'].values[-sequence_length:]
        
        # Scale the data
        last_sequence_scaled = self.scaler.transform(last_sequence.reshape(-1, 1))
        
        # Initialize the prediction array
        predictions = []
        
        # Create a copy of the last sequence
        current_sequence = last_sequence_scaled.copy()
        
        # Predict 'days' days into the future
        for _ in range(days):
            # Reshape for model input
            X = current_sequence.reshape(1, sequence_length, 1)
            
            # Predict next day
            next_day = self.model.predict(X)
            
            # Append prediction
            predictions.append(next_day[0, 0])
            
            # Update sequence
            current_sequence = np.append(current_sequence[1:], next_day)
        
        # Inverse transform predictions
        predictions = self.scaler.inverse_transform(np.array(predictions).reshape(-1, 1))
        
        return predictions
    
    def save_model(self, filename=None):
        """
        Save the trained model.
        
        Args:
            filename (str): Filename to save model (default: {coin_id}_model.h5)
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        if filename is None:
            filename = f"{self.coin_id}_model.h5"
        
        filepath = os.path.join(self.data_dir, filename)
        self.model.save(filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filename=None):
        """
        Load a trained model.
        
        Args:
            filename (str): Filename to load model from (default: {coin_id}_model.h5)
        """
        from tensorflow.keras.models import load_model
        
        if filename is None:
            filename = f"{self.coin_id}_model.h5"
        
        filepath = os.path.join(self.data_dir, filename)
        self.model = load_model(filepath)
        print(f"Model loaded from {filepath}")
    
    def plot_predictions(self, actual, predictions, title="Price Predictions"):
        """
        Plot actual vs predicted prices.
        
        Args:
            actual (array): Actual prices
            predictions (array): Predicted prices
            title (str): Plot title
        """
        plt.figure(figsize=(12, 6))
        plt.plot(actual, label='Actual Prices')
        plt.plot(predictions, label='Predicted Prices')
        plt.title(title)
        plt.xlabel('Time')
        plt.ylabel('Price (USD)')
        plt.legend()
        
        # Save plot
        plot_path = os.path.join(self.data_dir, f"{self.coin_id}_prediction_plot.png")
        plt.savefig(plot_path)
        plt.close()
        
        return plot_path
