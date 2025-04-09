import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import CoinCard from '../components/CoinCard';
import MarketOverview from '../components/MarketOverview';
import PredictionHighlight from '../components/PredictionHighlight';
import api from '../services/api';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [topCoins, setTopCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketTrend, setMarketTrend] = useState({
    totalMarketCap: 0,
    volume24h: 0,
    btcDominance: 0,
    marketCapChange: 0
  });

  useEffect(() => {
    const fetchTopCoins = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use our API service instead of direct axios call
        const data = await api.getTopCoins(10);
        
        if (!data || !Array.isArray(data) || data.length === 0) {
          throw new Error('No data returned from API');
        }
        
        setTopCoins(data);
        
        // Calculate market overview data
        const totalMarketCap = data.reduce((sum, coin) => sum + (coin.market_cap || 0), 0);
        const volume24h = data.reduce((sum, coin) => sum + (coin.total_volume || 0), 0);
        const btcDominance = data[0] && data[0].market_cap ? (data[0].market_cap / totalMarketCap) * 100 : 0;
        
        // Calculate average market cap change, handling missing values
        let validChanges = 0;
        const totalChange = data.reduce((sum, coin) => {
          if (coin.market_cap_change_percentage_24h != null) {
            validChanges++;
            return sum + coin.market_cap_change_percentage_24h;
          }
          return sum;
        }, 0);
        
        const marketCapChange = validChanges > 0 ? totalChange / validChanges : 0;
        
        setMarketTrend({
          totalMarketCap,
          volume24h,
          btcDominance,
          marketCapChange
        });
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch cryptocurrency data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopCoins();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchTopCoins, 300000);
    
    return () => clearInterval(interval);
  }, []);

  // Render loading skeletons
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Market Overview</h2>
          <div className="bg-gray-100 animate-pulse h-24 rounded-lg"></div>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Top Cryptocurrencies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, index) => (
              <CoinCard key={index} loading={true} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center p-6 bg-red-50 border border-red-200 text-red-700 rounded-lg mb-8">
          <h3 className="text-xl font-bold mb-2">Error Loading Data</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
        
        {/* Show mock data even when there's an error */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Sample Data (Offline Mode)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topCoins.length > 0 && topCoins.map(coin => (
              <CoinCard key={coin.id} coin={coin} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-400 dark:to-blue-400 text-transparent bg-clip-text">Kripto Para Piyasası</h1>
        <p className="text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">Gerçek zamanlı kripto para fiyatları, piyasa analizi ve yapay zeka destekli fiyat tahminleri</p>
      </div>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <svg className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 6V18M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Piyasa Genel Bakış
          </h2>
          <span className="text-sm text-secondary-500 dark:text-secondary-400 bg-light-200/70 dark:bg-dark-200/70 px-3 py-1 rounded-full">
            Son güncelleme: {new Date().toLocaleString()}
          </span>
        </div>
        <MarketOverview data={marketTrend} />
      </section>
      
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <svg className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 6L21 6M8 12L21 12M8 18L21 18M3 6H3.01M3 12H3.01M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            En İyi Kripto Paralar
          </h2>
          <div className="flex space-x-2">
            <button className="text-sm bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-3 py-1 rounded-lg font-medium hover:bg-primary-200 dark:hover:bg-primary-800/30 transition-colors">
              Tümünü Gör
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topCoins.map(coin => (
            <CoinCard key={coin.id} coin={coin} />
          ))}
        </div>
      </section>
      
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <svg className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 11L12 6M12 6L17 11M12 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Fiyat Tahminleri
          </h2>
          <span className="text-sm text-secondary-500 dark:text-secondary-400 bg-light-200/70 dark:bg-dark-200/70 px-3 py-1 rounded-full">
            AI destekli tahminler
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topCoins.slice(0, 2).map(coin => (
            <PredictionHighlight key={coin.id} coin={coin} />
          ))}
        </div>
      </section>
      
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <svg className="w-6 h-6 mr-2 text-primary-600 dark:text-primary-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 12L10 15L17 8M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Piyasa Trendi
          </h2>
        </div>
        <div className="overflow-hidden rounded-xl bg-white/90 dark:bg-dark-100/90 shadow-xl border border-light-300/50 dark:border-dark-300/50 backdrop-blur-sm p-6">
          <Line 
            data={{
              labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
              datasets: [
                {
                  label: 'Piyasa Değeri Trendi',
                  data: [65, 59, 80, 81, 56, 55, 40, 45, 60, 70, 75, 80],
                  fill: true,
                  backgroundColor: 'rgba(56, 97, 251, 0.1)',
                  borderColor: '#3861fb',
                  tension: 0.3,
                  pointRadius: 4,
                  pointBackgroundColor: '#ffffff',
                  pointBorderColor: '#3861fb',
                  pointBorderWidth: 2,
                  pointHoverRadius: 6
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    boxWidth: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(17, 25, 40, 0.8)',
                  padding: 12,
                  bodySpacing: 4,
                  bodyFont: {
                    size: 14
                  },
                  usePointStyle: true,
                  boxPadding: 6
                }
              },
              scales: {
                x: {
                  grid: {
                    display: false
                  }
                },
                y: {
                  grid: {
                    borderDash: [4, 4]
                  }
                }
              }
            }}
          />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
