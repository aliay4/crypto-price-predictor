import React, { useState } from 'react';

const Header = ({ darkMode, toggleDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className={`sticky top-0 z-50 ${darkMode ? 'bg-dark-100/95 border-dark-300/70' : 'bg-white/95 border-light-300/70'} border-b backdrop-blur-md shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/30 to-primary-600/30 dark:from-primary-400/20 dark:to-primary-600/20 rounded-full blur-md"></div>
                <svg className="h-10 w-10 text-primary-600 dark:text-primary-400 relative" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.5 12.5L10.5 15.5L16.5 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold">
                <span className="text-primary-600 dark:text-primary-400 font-extrabold">Crypto</span>
                <span className="text-secondary-600 dark:text-secondary-400 font-semibold">Predictor</span>
              </h1>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-2">
            <a href="/" className="px-4 py-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 font-medium">
              Anasayfa
            </a>
            <a href="#about" className="px-4 py-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 font-medium">
              Hakkında
            </a>
            <a href="#predictions" className="px-4 py-2 rounded-lg text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 font-medium">
              Tahminler
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-full ${darkMode ? 'bg-dark-200 text-yellow-300 hover:bg-dark-300 ring-1 ring-yellow-500/20' : 'bg-light-200 text-primary-600 hover:bg-light-300 ring-1 ring-primary-500/20'} transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            
            <div className="md:hidden">
              <button 
                onClick={toggleMobileMenu}
                className={`p-2 rounded-lg ${darkMode ? 'bg-dark-200 hover:bg-dark-300' : 'bg-light-200 hover:bg-light-300'} transition-all duration-200 focus:outline-none`}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-3 px-2 space-y-1 ${darkMode ? 'bg-dark-100' : 'bg-white'} rounded-lg shadow-lg mb-4`}>
            <a href="/" className="block px-3 py-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-medium">
              Dashboard
            </a>
            <a href="#about" className="block px-3 py-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-medium">
              About
            </a>
            <a href="#predictions" className="block px-3 py-2 rounded-lg text-secondary-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-medium">
              Predictions
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
