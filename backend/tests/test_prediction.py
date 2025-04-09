import unittest
import sys
import os
from unittest.mock import patch, MagicMock

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.price_prediction import PricePredictionModel

class TestPricePredictionModel(unittest.TestCase):
    """Test cases for the PricePredictionModel class"""
    
    def setUp(self):
        """Set up test data"""
        import pandas as pd
        import numpy as np
        
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
        
        # Create DataFrame
        self.df = pd.DataFrame({
            'price': prices
        }, index=dates)
        
        # Create temporary directory for test data
        self.test_data_dir = '/tmp/crypto_test_data'
        os.makedirs(self.test_data_dir, exist_ok=True)
        
        # Create PricePredictionModel instance
        self.model = PricePredictionModel('bitcoin', data_dir=self.test_data_dir)
    
    def tearDown(self):
        """Clean up after tests"""
        # Remove test data directory
        import shutil
        if os.path.exists(self.test_data_dir):
            shutil.rmtree(self.test_data_dir)
    
    def test_prepare_data(self):
        """Test data preparation for LSTM model"""
        sequence_length = 30
        test_size = 0.2
        
        X_train, y_train, X_test, y_test = self.model.prepare_data(self.df, sequence_length, test_size)
        
        # Check shapes
        expected_samples = len(self.df) - sequence_length
        expected_train_samples = int(expected_samples * (1 - test_size))
        expected_test_samples = expected_samples - expected_train_samples
        
        self.assertEqual(X_train.shape[0], expected_train_samples)
        self.assertEqual(X_train.shape[1], sequence_length)
        self.assertEqual(X_train.shape[2], 1)  # 1 feature (price)
        
        self.assertEqual(y_train.shape[0], expected_train_samples)
        
        self.assertEqual(X_test.shape[0], expected_test_samples)
        self.assertEqual(X_test.shape[1], sequence_length)
        self.assertEqual(X_test.shape[2], 1)  # 1 feature (price)
        
        self.assertEqual(y_test.shape[0], expected_test_samples)
    
    def test_build_model(self):
        """Test building LSTM model"""
        sequence_length = 30
        
        # Build model
        self.model.build_model(sequence_length)
        
        # Check if model is created
        self.assertIsNotNone(self.model.model)
        
        # Check input shape
        self.assertEqual(self.model.model.input_shape, (None, sequence_length, 1))
        
        # Check output shape
        self.assertEqual(self.model.model.output_shape, (None, 1))
    
    @patch('tensorflow.keras.models.Sequential.fit')
    def test_train(self, mock_fit):
        """Test training LSTM model"""
        # Mock data
        import numpy as np
        X_train = np.random.random((100, 30, 1))
        y_train = np.random.random(100)
        
        # Mock fit method
        mock_history = MagicMock()
        mock_fit.return_value = mock_history
        
        # Build model
        self.model.build_model(30)
        
        # Train model
        history = self.model.train(X_train, y_train, epochs=10, batch_size=32)
        
        # Check if fit was called with correct parameters
        mock_fit.assert_called_once()
        call_args = mock_fit.call_args[0]
        self.assertTrue(np.array_equal(call_args[0], X_train))
        self.assertTrue(np.array_equal(call_args[1], y_train))
        
        call_kwargs = mock_fit.call_args[1]
        self.assertEqual(call_kwargs['epochs'], 10)
        self.assertEqual(call_kwargs['batch_size'], 32)
        self.assertEqual(call_kwargs['validation_split'], 0.1)
    
    @patch('tensorflow.keras.models.Sequential.predict')
    def test_predict_future(self, mock_predict):
        """Test predicting future prices"""
        # Mock data
        import numpy as np
        import pandas as pd
        
        # Create sample DataFrame
        dates = pd.date_range(start='2023-01-01', periods=100, freq='D')
        prices = np.linspace(100, 200, 100)
        df = pd.DataFrame({'price': prices}, index=dates)
        
        # Mock predict method to return increasing values
        sequence_length = 60
        days = 7
        last_price = prices[-1]
        
        def predict_side_effect(X):
            return np.array([[last_price * 1.01], [last_price * 1.02], [last_price * 1.03], 
                            [last_price * 1.04], [last_price * 1.05], [last_price * 1.06], [last_price * 1.07]])
        
        mock_predict.side_effect = predict_side_effect
        
        # Build model
        self.model.build_model(sequence_length)
        
        # Predict future prices
        predictions = self.model.predict_future(df, days=days, sequence_length=sequence_length)
        
        # Check if predict was called
        self.assertEqual(mock_predict.call_count, days)
        
        # Check predictions shape
        self.assertEqual(predictions.shape, (days, 1))
        
        # Check if predictions are increasing
        for i in range(1, days):
            self.assertGreater(predictions[i], predictions[i-1])
    
    @patch('tensorflow.keras.models.save_model')
    def test_save_model(self, mock_save):
        """Test saving model"""
        # Build model
        self.model.build_model(30)
        
        # Save model
        filename = 'test_model.h5'
        self.model.save_model(filename)
        
        # Check if save_model was called with correct parameters
        mock_save.assert_called_once()
        call_args = mock_save.call_args[0]
        self.assertEqual(call_args[0], self.model.model)
        self.assertEqual(call_args[1], os.path.join(self.test_data_dir, filename))
    
    @patch('tensorflow.keras.models.load_model')
    def test_load_model(self, mock_load):
        """Test loading model"""
        # Mock load_model
        mock_model = MagicMock()
        mock_load.return_value = mock_model
        
        # Load model
        filename = 'test_model.h5'
        self.model.load_model(filename)
        
        # Check if load_model was called with correct parameters
        mock_load.assert_called_once_with(os.path.join(self.test_data_dir, filename))
        
        # Check if model was set
        self.assertEqual(self.model.model, mock_model)


if __name__ == '__main__':
    unittest.main()
