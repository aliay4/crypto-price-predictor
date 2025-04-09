import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-10 px-4 mt-auto border-t border-light-300/50 dark:border-dark-300/50 bg-light-200/70 dark:bg-dark-100/70 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/30 to-primary-600/30 dark:from-primary-400/20 dark:to-primary-600/20 rounded-full blur-md"></div>
                <svg className="h-9 w-9 text-primary-600 dark:text-primary-400 relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.5 12.5L10.5 15.5L16.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="text-2xl font-bold">
                <span className="text-primary-600 dark:text-primary-400 font-extrabold">Crypto</span>
                <span className="text-secondary-600 dark:text-secondary-400 font-semibold">Predictor</span>
              </h2>
            </div>
            <p className="text-secondary-500 dark:text-secondary-400 mb-5 max-w-md leading-relaxed">
              Yapay zeka destekli kripto para fiyat tahmin platformu, gelişmiş makine öğrenimi algoritmaları kullanarak piyasa trendlerini yüksek doğrulukla tahmin eder.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2.5 rounded-full bg-primary-100/80 dark:bg-dark-300/80 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-dark-200 transition-colors shadow-sm hover:shadow-md">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="p-2.5 rounded-full bg-primary-100/80 dark:bg-dark-300/80 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-dark-200 transition-colors shadow-sm hover:shadow-md">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a href="#" className="p-2.5 rounded-full bg-primary-100/80 dark:bg-dark-300/80 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-dark-200 transition-colors shadow-sm hover:shadow-md">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4 border-b border-light-300/30 dark:border-dark-300/30 pb-2">Hızlı Bağlantılar</h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center">
                  <svg className="w-4 h-4 mr-2 opacity-70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 5L15 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Anasayfa
                </a>
              </li>
              <li>
                <a href="#predictions" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Predictions
                </a>
              </li>
              <li>
                <a href="#about" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-secondary-600 dark:text-secondary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Disclaimer
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-light-300 dark:border-dark-300 text-center">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            &copy; {currentYear} CryptoPredictor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
