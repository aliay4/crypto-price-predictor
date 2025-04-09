# Cryptocurrency Price Predictor - Setup Instructions

This document provides instructions for setting up and running the Cryptocurrency Price Predictor application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.10 or higher
- Node.js 14 or higher
- npm (comes with Node.js)

## Backend Setup

1. Navigate to the backend directory:
```
cd crypto-price-predictor/backend
```

2. Create a virtual environment:
```
python -m venv venv
```

3. Activate the virtual environment:
   - On Windows:
   ```
   venv\Scripts\activate
   ```
   - On macOS/Linux:
   ```
   source venv/bin/activate
   ```

4. Install the required packages:
```
pip install -r requirements.txt
```

5. Start the backend server:
```
python run.py
```

The backend server will start on http://localhost:5000

## Frontend Setup

1. Navigate to the frontend directory:
```
cd crypto-price-predictor/frontend
```

2. Install the required packages:
```
npm install
```

3. Start the frontend development server:
```
npm start
```

The frontend application will start on http://localhost:3000

## Features

- Real-time cryptocurrency price data from CoinGecko API
- Interactive price charts and visualizations
- Technical indicators (RSI, MACD, Moving Averages, etc.)
- Price predictions using LSTM neural networks
- Responsive design that works on both desktop and mobile devices

## Project Structure

- `backend/`: Contains the Flask backend application
  - `app/`: Main application package
  - `models/`: Price prediction models
  - `utils/`: Utility functions and technical indicators
  - `tests/`: Unit tests

- `frontend/`: Contains the React frontend application
  - `src/`: Source code
    - `components/`: Reusable UI components
    - `pages/`: Page components
    - `services/`: API service functions

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are installed correctly
2. Check that the backend server is running on port 5000
3. Make sure the frontend is configured to connect to the correct backend URL
4. Check the browser console for any JavaScript errors
5. Check the terminal running the backend for any Python errors

## License

This project is provided for educational and demonstration purposes.
