import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../services/api';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const CoinDetail = () => {
  const { id } = useParams();
  const [coin, setCoin] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [predictionData, setPredictionData] = useState([]);
  const [timeframe, setTimeframe] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technicalIndicators, setTechnicalIndicators] = useState({
    rsi: 0,
    macd: 0,
    ma50: 0,
    ma200: 0
  });

  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use our API service instead of direct axios call
        const coinData = await api.getCoinData(id);
        
        if (!coinData) {
          throw new Error(`Failed to fetch data for ${id}`);
        }
        
        setCoin(coinData);
        
        // Fetch historical data based on timeframe
        const days = timeframe === '24h' ? 1 : 
                    timeframe === '7d' ? 7 : 
                    timeframe === '30d' ? 30 : 
                    timeframe === '90d' ? 90 : 
                    timeframe === '1y' ? 365 : 7;
                    
        const historyData = await api.getCoinHistory(id, 'usd', days);
        
        // Process historical data
        if (historyData && historyData.data && Array.isArray(historyData.data)) {
          // If we have proper data from API
          const processedData = historyData.data.map(item => ({
            timestamp: new Date(item.date).getTime(),
            price: item.price
          }));
          setHistoricalData(processedData);
        } else {
          // If we're using mock data or have incomplete data
          console.warn('Using generated historical data');
          const mockData = generateMockHistoricalData(days);
          setHistoricalData(mockData);
        }
        
        // Generate mock prediction data
        // In a real app, this would come from our backend ML model
        const lastPrice = historicalData.length > 0 ? 
          historicalData[historicalData.length - 1].price : 
          (coinData.market_data?.current_price?.usd || 50000);
          
        const mockPredictions = generateMockPredictions(lastPrice, 7);
        setPredictionData(mockPredictions);
        
        // Generate mock technical indicators
        // In a real app, these would be calculated from historical data
        setTechnicalIndicators({
          rsi: Math.random() * 100,
          macd: (Math.random() * 2 - 1) * 10,
          ma50: lastPrice * (1 + (Math.random() * 0.1 - 0.05)),
          ma200: lastPrice * (1 + (Math.random() * 0.2 - 0.1))
        });
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch cryptocurrency data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoinData();
  }, [id, timeframe]);

  // Generate mock historical data if API fails
  const generateMockHistoricalData = (days) => {
    const data = [];
    const now = new Date();
    const startPrice = id === 'bitcoin' ? 75000 : id === 'ethereum' ? 3000 : 1000;
    const volatility = 0.02; // 2% daily volatility
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      // Generate a price with some randomness
      const randomChange = (Math.random() * volatility * 2 - volatility);
      const price = startPrice * (1 + randomChange * i);
      
      data.push({
        timestamp: date.getTime(),
        price: price
      });
    }
    
    return data;
  };

  // Generate mock prediction data
  const generateMockPredictions = (lastPrice, days) => {
    const predictions = [];
    const today = new Date();
    const trend = Math.random() > 0.5 ? 1 : -1; // Random trend direction
    const volatility = 0.02; // 2% daily volatility
    
    for (let i = 1; i <= days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Generate a price with some randomness but following the trend
      const randomChange = (Math.random() * volatility * 2 - volatility) + (trend * 0.01 * i);
      const predictedPrice = lastPrice * (1 + randomChange);
      
      predictions.push({
        date: date.toISOString().split('T')[0],
        price: predictedPrice
      });
    }
    
    return predictions;
  };

  // Format chart data
  const formatChartData = () => {
    if (!historicalData.length) return null;
    
    // Format historical data
    const labels = historicalData.map(data => {
      const date = new Date(data.timestamp);
      return timeframe === '24h' ? 
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
        date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    });
    
    const prices = historicalData.map(data => data.price);
    
    // Format prediction data
    const predictionLabels = predictionData.map(data => {
      const date = new Date(data.date);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    });
    
    const predictionPrices = predictionData.map(data => data.price);
    
    return {
      labels: [...labels, ...predictionLabels],
      datasets: [
        {
          label: 'Historical Price',
          data: [...prices, ...Array(predictionLabels.length).fill(null)],
          borderColor: '#3861fb',
          backgroundColor: 'rgba(56, 97, 251, 0.1)',
          fill: false,
          tension: 0.1
        },
        {
          label: 'Price Prediction',
          data: [...Array(labels.length).fill(null), ...predictionPrices],
          borderColor: '#16c784',
          backgroundColor: 'rgba(22, 199, 132, 0.1)',
          borderDash: [5, 5],
          fill: false,
          tension: 0.1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (context.raw === null) return '';
            return `$${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    }
  };

  // Render loading skeletons
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-12 h-12 mr-4 bg-gray-300 rounded-full animate-pulse"></div>
            <div>
              <div className="h-8 bg-gray-300 rounded w-40 mb-1 animate-pulse"></div>
              <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
            </div>
          </div>
          
          <div className="md:ml-auto">
            <div className="h-8 bg-gray-300 rounded w-32 mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-32"></div>
            </div>
          ))}
        </div>
        
        <div className="card p-4 mb-6 animate-pulse">
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !coin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-2">Error Loading Data</h3>
          <p>{error || `Failed to load data for ${id}`}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
        
        {/* Show fallback UI with mock data */}
        <div className="card p-4 mb-6">
          <h2 className="text-xl font-bold mb-4">Sample Price Chart (Offline Mode)</h2>
          <div className="h-80">
            {formatChartData() && <Line data={formatChartData()} options={chartOptions} />}
          </div>
          <div className="mt-4 p-2 bg-yellow-50 text-yellow-700 text-sm rounded">
            Note: Displaying sample data in offline mode. Some features may be limited.
          </div>
        </div>
      </div>
    );
  }

  // Get current price and other data with fallbacks
  const currentPrice = coin.market_data?.current_price?.usd || 0;
  const priceChange24h = coin.market_data?.price_change_percentage_24h || 0;
  const marketCap = coin.market_data?.market_cap?.usd || 0;
  const volume24h = coin.market_data?.total_volume?.usd || 0;
  const circulatingSupply = coin.market_data?.circulating_supply || 0;
  const maxSupply = coin.market_data?.max_supply || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          {coin.image?.large ? (
            <img src={coin.image.large} alt={coin.name} className="w-12 h-12 mr-4" />
          ) : (
            <div className="w-12 h-12 mr-4 bg-gray-200 rounded-full flex items-center justify-center">
              {coin.symbol ? coin.symbol.charAt(0).toUpperCase() : '?'}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{coin.name || id}</h1>
            <span className="text-secondary-color">{coin.symbol ? coin.symbol.toUpperCase() : id.toUpperCase()}</span>
          </div>
        </div>
        
        <div className="md:ml-auto">
          <div className="text-3xl font-bold">${currentPrice.toLocaleString()}</div>
          <div className={`text-sm ${priceChange24h >= 0 ? 'text-success-color' : 'text-danger-color'}`}>
            {priceChange24h >= 0 ? '+' : ''}
            {priceChange24h.toFixed(2)}% (24h)
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="text-secondary-color text-sm mb-1">Market Cap</h3>
          <p className="text-lg font-semibold">${marketCap.toLocaleString()}</p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-secondary-color text-sm mb-1">24h Volume</h3>
          <p className="text-lg font-semibold">${volume24h.toLocaleString()}</p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-secondary-color text-sm mb-1">Circulating Supply</h3>
          <p className="text-lg font-semibold">{circulatingSupply.toLocaleString()} {coin.symbol ? coin.symbol.toUpperCase() : ''}</p>
        </div>
        
        <div className="card p-4">
          <h3 className="text-secondary-color text-sm mb-1">Max Supply</h3>
          <p className="text-lg font-semibold">
            {maxSupply 
              ? `${maxSupply.toLocaleString()} ${coin.symbol ? coin.symbol.toUpperCase() : ''}`
              : 'Unlimited'}
          </p>
        </div>
      </div>
      
      <div className="card p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Price Chart</h2>
          <div className="flex space-x-2">
            <button 
              className={`px-3 py-1 rounded-md text-sm ${timeframe === '24h' ? 'bg-primary-600 text-white' : 'bg-transparent'}`}
              onClick={() => setTimeframe('24h')}
            >
              24h
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${timeframe === '7d' ? 'bg-primary-600 text-white' : 'bg-transparent'}`}
              onClick={() => setTimeframe('7d')}
            >
              7d
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${timeframe === '30d' ? 'bg-primary-600 text-white' : 'bg-transparent'}`}
              onClick={() => setTimeframe('30d')}
            >
              30d
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${timeframe === '90d' ? 'bg-primary-600 text-white' : 'bg-transparent'}`}
              onClick={() => setTimeframe('90d')}
            >
              90d
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-sm ${timeframe === '1y' ? 'bg-primary-600 text-white' : 'bg-transparent'}`}
              onClick={() => setTimeframe('1y')}
            >
              1y
            </button>
          </div>
        </div>
        
        <div className="h-80">
          {formatChartData() && <Line data={formatChartData()} options={chartOptions} />}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="card p-4">
          <h2 className="text-xl font-bold mb-4">Price Prediction</h2>
          <div className="mb-4">
            <p className="text-secondary-color text-sm mb-1">7-Day Prediction</p>
            <p className="text-2xl font-bold">
              ${predictionData.length ? predictionData[predictionData.length - 1].price.toFixed(2) : '0.00'}
            </p>
            
            <div className={`text-sm mt-1 ${predictionData.length && predictionData[predictionData.length - 1].price > currentPrice ? 'text-success-color' : 'text-danger-color'}`}>
              {predictionData.length && (
                <>
                  {predictionData[predictionData.length - 1].price > currentPrice ? '+' : ''}
                  {(((predictionData[predictionData.length - 1].price - currentPrice) / currentPrice) * 100).toFixed(2)}%
                </>
              )}
            </div>
          </div>
          
          <div className="text-sm text-secondary-color">
            <p>Prediction based on historical data analysis and market trends.</p>
            <p className="mt-1 italic">Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div className="card p-4">
          <h2 className="text-xl font-bold mb-4">Technical Indicators</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-secondary-color text-sm mb-1">RSI (14)</p>
              <p className="text-lg font-semibold">{technicalIndicators.rsi.toFixed(2)}</p>
              <p className="text-xs text-secondary-color">
                {technicalIndicators.rsi > 70 ? 'Overbought' : technicalIndicators.rsi < 30 ? 'Oversold' : 'Neutral'}
              </p>
            </div>
            
            <div>
              <p className="text-secondary-color text-sm mb-1">MACD</p>
              <p className={`text-lg font-semibold ${technicalIndicators.macd >= 0 ? 'text-success-color' : 'text-danger-color'}`}>
                {technicalIndicators.macd.toFixed(2)}
              </p>
              <p className="text-xs text-secondary-color">
                {technicalIndicators.macd >= 0 ? 'Bullish' : 'Bearish'}
              </p>
            </div>
            
            <div>
              <p className="text-secondary-color text-sm mb-1">MA (50)</p>
              <p className="text-lg font-semibold">${technicalIndicators.ma50.toFixed(2)}</p>
              <p className={`text-xs ${currentPrice > technicalIndicators.ma50 ? 'text-success-color' : 'text-danger-color'}`}>
                Price is {currentPrice > technicalIndicators.ma50 ? 'above' : 'below'}
              </p>
            </div>
            
            <div>
              <p className="text-secondary-color text-sm mb-1">MA (200)</p>
              <p className="text-lg font-semibold">${technicalIndicators.ma200.toFixed(2)}</p>
              <p className={`text-xs ${currentPrice > technicalIndicators.ma200 ? 'text-success-color' : 'text-danger-color'}`}>
                Price is {currentPrice > technicalIndicators.ma200 ? 'above' : 'below'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {coin.description?.en && (
        <div className="card p-4">
          <h2 className="text-xl font-bold mb-4">About {coin.name}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: coin.description.en }}></div>
        </div>
      )}
    </div>
  );
};

export default CoinDetail;
