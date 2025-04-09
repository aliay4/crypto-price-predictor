import React from 'react';
import { Line } from 'react-chartjs-2';

const PredictionHighlight = ({ coin }) => {
  // Mock prediction data - in a real app, this would come from the backend
  const currentPrice = coin.current_price;
  const predictedPrice = currentPrice * (1 + (Math.random() * 0.2 - 0.05)); // Random prediction between -5% and +15%
  const isPredictionPositive = predictedPrice > currentPrice;
  
  // Generate dates for next 7 days
  const generateDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    return dates;
  };
  
  // Generate prediction data points
  const generatePredictionData = () => {
    const data = [currentPrice];
    const step = (predictedPrice - currentPrice) / 6;
    
    for (let i = 1; i < 7; i++) {
      // Add some randomness to the prediction line
      const randomFactor = 1 + (Math.random() * 0.04 - 0.02); // ±2% randomness
      data.push(data[i-1] + step * randomFactor);
    }
    
    return data;
  };
  
  const dates = generateDates();
  const predictionData = generatePredictionData();
  
  const chartData = {
    labels: dates,
    datasets: [
      {
        label: 'Price Prediction',
        data: predictionData,
        fill: false,
        borderColor: isPredictionPositive ? '#16c784' : '#ea3943',
        tension: 0.1,
        pointRadius: 2,
        pointHoverRadius: 5
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
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
  
  const predictionPercentage = ((predictedPrice - currentPrice) / currentPrice * 100).toFixed(2);
  const predictionClass = isPredictionPositive ? 'text-success-color' : 'text-danger-color';

  return (
    <div className="overflow-hidden rounded-xl bg-white/90 dark:bg-dark-100/90 shadow-xl border border-light-300/50 dark:border-dark-300/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl p-6">
      <div className="flex items-center mb-5">
        <div className="relative mr-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 to-primary-300/30 dark:from-primary-700/20 dark:to-primary-900/20 rounded-full blur-md"></div>
          <img src={coin.image} alt={coin.name} className="relative w-12 h-12 rounded-full p-1.5 bg-light-200/80 dark:bg-dark-200/80 border border-light-300/70 dark:border-dark-300/70 shadow-md" />
        </div>
        <h3 className="text-xl font-bold text-secondary-900 dark:text-white">{coin.name} <span className="text-primary-600 dark:text-primary-400">Fiyat Tahmini</span></h3>
      </div>
      
      <div className="mb-6 bg-light-200/50 dark:bg-dark-200/50 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-secondary-500 dark:text-secondary-400 text-sm font-medium mb-1">Mevcut Fiyat</p>
            <p className="text-xl font-bold text-secondary-900 dark:text-white">${currentPrice.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-secondary-500 dark:text-secondary-400 text-sm font-medium mb-1">7-Günlük Tahmin</p>
            <p className="text-xl font-bold text-secondary-900 dark:text-white">${predictedPrice.toLocaleString()}</p>
            <p className={`text-sm font-semibold ${predictionClass} inline-block mt-1 px-2 py-0.5 rounded-full ${isPredictionPositive ? 'bg-success/10' : 'bg-danger/10'}`}>
              {isPredictionPositive ? (
                <svg className="w-4 h-4 mr-1 inline" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1 inline" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {isPredictionPositive ? '+' : ''}{predictionPercentage}%
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-52 bg-light-100/50 dark:bg-dark-300/30 rounded-xl p-4 mb-4">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="mt-4 text-sm text-secondary-500 dark:text-secondary-400 bg-light-200/30 dark:bg-dark-200/30 rounded-lg p-3 border border-light-300/30 dark:border-dark-300/30">
        <p>Tahmin, geçmiş veri analizi ve piyasa trendlerine dayanmaktadır.</p>
        <p className="mt-1 italic">Son güncelleme: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default PredictionHighlight;
