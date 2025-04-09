import React from 'react';
import { Link } from 'react-router-dom';

const CoinCard = ({ coin, loading = false }) => {
  // Handle loading state
  if (loading) {
    return (
      <div className="coin-card animate-pulse">
        <div className="flex items-center">
          <div className="w-10 h-10 mr-3 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div>
                <div className="h-5 bg-gray-300 rounded w-24 mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-12"></div>
              </div>
              <div className="text-right">
                <div className="h-5 bg-gray-300 rounded w-20 mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
            <div className="mt-2 flex justify-between">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle missing data gracefully
  if (!coin || typeof coin !== 'object') {
    return (
      <div className="coin-card border border-red-200 bg-red-50">
        <div className="p-4 text-center text-red-500">
          <p>Error loading coin data</p>
        </div>
      </div>
    );
  }

  // Calculate price change color
  const priceChangeColor = 
    !coin.price_change_percentage_24h ? 'text-gray-500' :
    coin.price_change_percentage_24h >= 0 ? 'text-success-color' : 'text-danger-color';
  
  // Format market cap
  const formatMarketCap = (marketCap) => {
    if (!marketCap && marketCap !== 0) return 'N/A';
    
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
  };

  // Format price with fallback
  const formatPrice = (price) => {
    if (!price && price !== 0) return 'N/A';
    return `$${price.toLocaleString()}`;
  };

  // Format price change with fallback
  const formatPriceChange = (change) => {
    if (!change && change !== 0) return 'N/A';
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  // Format volume with fallback
  const formatVolume = (volume) => {
    if (!volume && volume !== 0) return 'N/A';
    return `$${(volume / 1e6).toFixed(2)}M`;
  };

  return (
    <div className="coin-card overflow-hidden rounded-xl bg-white/90 dark:bg-dark-100/90 shadow-xl border border-light-300/50 dark:border-dark-300/50 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 hover:bg-white dark:hover:bg-dark-100">
      <Link to={`/coin/${coin.id}`} className="block p-6 transition-all duration-300">
        <div className="flex items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100/30 to-primary-300/30 dark:from-primary-700/20 dark:to-primary-900/20 rounded-full blur-md"></div>
            <img src={coin.image} alt={coin.name} className="relative w-14 h-14 mr-5 rounded-full p-1.5 bg-light-200/80 dark:bg-dark-200/80 border border-light-300/70 dark:border-dark-300/70 shadow-md" />
            <span className="absolute -bottom-1 -right-1 text-xs font-bold bg-secondary-100/90 dark:bg-dark-300/90 text-secondary-800 dark:text-secondary-300 rounded-full px-2 py-0.5 border border-light-300/70 dark:border-dark-300/70 shadow-sm">#{coin.market_cap_rank || 'N/A'}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">{coin.name}</h3>
                <span className="text-sm font-medium text-secondary-500 dark:text-secondary-400 bg-secondary-100/50 dark:bg-dark-300/50 px-2 py-0.5 rounded-md">{coin.symbol.toUpperCase()}</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-secondary-900 dark:text-white">{formatPrice(coin.current_price)}</div>
                <div className={`text-sm font-medium flex items-center justify-end ${priceChangeColor} bg-opacity-20 rounded-full px-2 py-0.5 ${coin.price_change_percentage_24h >= 0 ? 'bg-success/10' : 'bg-danger/10'}`}>
                  {coin.price_change_percentage_24h >= 0 ? (
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                  {formatPriceChange(coin.price_change_percentage_24h)}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-light-300/50 dark:border-dark-300/50 flex justify-between text-sm text-secondary-500 dark:text-secondary-400">
              <span className="flex items-center bg-light-200/50 dark:bg-dark-200/50 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4 mr-2 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {formatMarketCap(coin.market_cap)}
              </span>
              <span className="flex items-center bg-light-200/50 dark:bg-dark-200/50 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4 mr-2 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 9H6V19H2V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 5H14V19H10V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 13H22V19H18V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {formatVolume(coin.total_volume)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CoinCard;
