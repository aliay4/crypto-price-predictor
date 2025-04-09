import React from 'react';

const MarketOverview = ({ data }) => {
  const { totalMarketCap, volume24h, btcDominance, marketCapChange } = data;
  
  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1e12) {
      return `$${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)}M`;
    } else {
      return `$${num.toFixed(2)}`;
    }
  };

  // Icons for each card
  const MarketCapIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const VolumeIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 9H6V19H2V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 5H14V19H10V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 13H22V19H18V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const BTCIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.5 2V4M9.5 20V22M13.5 2V4M13.5 20V22M5.5 4H17.5C18.6046 4 19.5 4.89543 19.5 6V18C19.5 19.1046 18.6046 20 17.5 20H5.5C4.39543 20 3.5 19.1046 3.5 18V6C3.5 4.89543 4.39543 4 5.5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.5 10.5H13C13.8284 10.5 14.5 9.82843 14.5 9C14.5 8.17157 13.8284 7.5 13 7.5H9.5V13.5H13.5C14.3284 13.5 15 14.1716 15 15C15 15.8284 14.3284 16.5 13.5 16.5H9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const CryptoIcon = () => (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 8C17 10.7614 14.7614 13 12 13C9.23858 13 7 10.7614 7 8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 21C3 16.0294 7.02944 12 12 12C16.9706 12 21 16.0294 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-50/80 to-primary-100/80 dark:from-primary-900/20 dark:to-primary-800/20 shadow-xl border border-primary-200/50 dark:border-primary-700/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
        <div className="absolute top-0 right-0 w-24 h-24 -mt-10 -mr-10 rounded-full bg-primary-500/30 dark:bg-primary-400/20 blur-xl group-hover:bg-primary-500/40 transition-all duration-500"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 -mb-6 -ml-6 rounded-full bg-primary-400/20 dark:bg-primary-500/10 blur-md"></div>
        <div className="p-6 relative z-10">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-xl bg-primary-100/80 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mr-4 shadow-md">
              <MarketCapIcon />
            </div>
            <h3 className="text-secondary-700 dark:text-secondary-200 font-semibold">Toplam Piyasa Değeri</h3>
          </div>
          <p className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">{formatNumber(totalMarketCap)}</p>
          <div className={`flex items-center text-sm font-medium ${marketCapChange >= 0 ? 'text-success dark:text-success/90' : 'text-danger dark:text-danger/90'}`}>
            {marketCapChange >= 0 ? (
              <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            <span className="text-base">{marketCapChange >= 0 ? '+' : ''}{marketCapChange.toFixed(2)}%</span>
          </div>
        </div>
      </div>
      
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-900/20 dark:to-blue-800/20 shadow-xl border border-blue-200/50 dark:border-blue-700/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
        <div className="absolute top-0 right-0 w-24 h-24 -mt-10 -mr-10 rounded-full bg-blue-500/30 dark:bg-blue-400/20 blur-xl group-hover:bg-blue-500/40 transition-all duration-500"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 -mb-6 -ml-6 rounded-full bg-blue-400/20 dark:bg-blue-500/10 blur-md"></div>
        <div className="p-6 relative z-10">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-xl bg-blue-100/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mr-4 shadow-md">
              <VolumeIcon />
            </div>
            <h3 className="text-secondary-700 dark:text-secondary-200 font-semibold">24s İşlem Hacmi</h3>
          </div>
          <p className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">{formatNumber(volume24h)}</p>
          <div className="text-sm text-secondary-500 dark:text-secondary-400 mt-1 font-medium">
            Global işlem aktivitesi
          </div>
        </div>
      </div>
      
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50/80 to-amber-100/80 dark:from-amber-900/20 dark:to-amber-800/20 shadow-xl border border-amber-200/50 dark:border-amber-700/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
        <div className="absolute top-0 right-0 w-24 h-24 -mt-10 -mr-10 rounded-full bg-amber-500/30 dark:bg-amber-400/20 blur-xl group-hover:bg-amber-500/40 transition-all duration-500"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 -mb-6 -ml-6 rounded-full bg-amber-400/20 dark:bg-amber-500/10 blur-md"></div>
        <div className="p-6 relative z-10">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-xl bg-amber-100/80 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mr-4 shadow-md">
              <BTCIcon />
            </div>
            <h3 className="text-secondary-700 dark:text-secondary-200 font-semibold">BTC Dominansı</h3>
          </div>
          <p className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">{btcDominance.toFixed(2)}%</p>
          <div className="text-sm text-secondary-500 dark:text-secondary-400 mt-1 font-medium">
            Bitcoin piyasa payı
          </div>
        </div>
      </div>
      
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 dark:from-emerald-900/20 dark:to-emerald-800/20 shadow-xl border border-emerald-200/50 dark:border-emerald-700/30 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group">
        <div className="absolute top-0 right-0 w-24 h-24 -mt-10 -mr-10 rounded-full bg-emerald-500/30 dark:bg-emerald-400/20 blur-xl group-hover:bg-emerald-500/40 transition-all duration-500"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 -mb-6 -ml-6 rounded-full bg-emerald-400/20 dark:bg-emerald-500/10 blur-md"></div>
        <div className="p-6 relative z-10">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mr-4 shadow-md">
              <CryptoIcon />
            </div>
            <h3 className="text-secondary-700 dark:text-secondary-200 font-semibold">Aktif Kripto Paralar</h3>
          </div>
          <p className="text-3xl font-bold text-secondary-900 dark:text-white mb-2">10,000+</p>
          <div className="text-sm text-secondary-500 dark:text-secondary-400 mt-1 font-medium">
            Takip edilen varlıklar
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;
