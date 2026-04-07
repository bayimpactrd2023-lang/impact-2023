import * as React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { useHeaderTheme } from '@/app/context/HeaderThemeContext';


export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, scrollThreshold } = useHeaderTheme();

  // Listen to scroll events
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold]);

  // Helper function to navigate and scroll to top - IMMEDIATE navigation
  const navigateAndScroll = (path: string) => {
    navigate(path);
    // Immediate scroll to top without animation for instant page changes
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  // Helper function to handle navigation - IMMEDIATE, no waiting
  const handleNavigation = (path: string) => {
    // Immediate navigation - no delays
    navigateAndScroll(path);
    setMobileMenuOpen(false);
  };

  // Navigation Button Styles - Simple consistent styling
  const getNavButtonClass = (path: string) => {
    // For home path, only match exact path
    // For other paths, match exact or startsWith
    const isActive = path === '/'
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(path + '/');

    if (isActive) {
      return 'text-white bg-gradient-to-r from-[#1887FC] to-[#3b82f6] shadow-lg';
    }

    return 'text-gray-900 hover:text-[#1887FC] hover:bg-blue-50/50';
  };

  // Get header styles based on theme and scroll state
  const getHeaderStyles = () => {
    if (theme === 'transparent') {
      if (scrolled) {
        // Scrolled state for transparent theme - more solid with gradient
        return {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 50%, rgba(255,255,255,0.98) 100%)',
          borderImage: 'linear-gradient(90deg, rgba(24,135,252,0.2), rgba(59,130,246,0.3), rgba(24,135,252,0.2)) 1',
          boxShadow: '0 8px 32px rgba(24, 135, 252, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)',
        };
      } else {
        // Initial transparent state
        return {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(248,250,252,0.70) 50%, rgba(255,255,255,0.75) 100%)',
          borderImage: 'linear-gradient(90deg, rgba(24,135,252,0.08), rgba(59,130,246,0.12), rgba(24,135,252,0.08)) 1',
          boxShadow: '0 4px 16px rgba(24, 135, 252, 0.08)',
        };
      }
    }
    
    // Default style for other themes
    return {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 50%, rgba(255,255,255,0.98) 100%)',
      borderImage: 'linear-gradient(90deg, rgba(24,135,252,0.1), rgba(59,130,246,0.2), rgba(24,135,252,0.1)) 1',
    };
  };
  
  const navItems = [
    { label: 'Home', path: '/', key: 'home' },
    { label: 'About Us', path: '/about', key: 'about' },
    { label: 'Highlights', path: '/highlights', key: 'highlights' },
    { label: 'Our Work', path: '/our-work', key: 'our-work' },
    { label: 'Blog', path: '/blog', key: 'blog' },
    { label: 'Publications', path: '/publications', key: 'publications' },
  ];

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b"
      style={getHeaderStyles()}
      initial={false}
      animate={{
        y: 0,
      }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer relative" 
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Gradient glow behind logo */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1887FC]/10 to-[#3b82f6]/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src="/images/logos/impact.png" alt="IMPACT R&D Logo" className="h-14 md:h-16 w-auto drop-shadow-lg relative z-10" />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavigation(item.path)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${getNavButtonClass(item.path)}`}
              >
                {item.label}
              </button>
            ))}
            {/* Contact Us Button */}
            <button
              onClick={() => handleNavigation('/contact')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${getNavButtonClass('/contact')}`}
            >
              Contact Us
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-900"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="md:hidden backdrop-blur-xl border-t max-h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide shadow-2xl"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.95) 50%, rgba(255,255,255,0.98) 100%)',
            borderImage: 'linear-gradient(90deg, rgba(24,135,252,0.1), rgba(59,130,246,0.2), rgba(24,135,252,0.1)) 1',
          }}
        >
          <div className="px-3 pt-3 pb-4 space-y-2">
            {navItems.map((item, index) => {
              // For home path, only match exact path; for other paths, match exact or startsWith
              const isActive = item.path === '/'
                ? location.pathname === item.path
                : location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              return (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => { handleNavigation(item.path); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-4 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white shadow-lg' 
                      : 'text-gray-700 hover:bg-blue-50/80 hover:text-[#1887FC]'
                  }`}
                >
                  {item.label}
                </motion.button>
              );
            })}
            {/* Contact Us Button - Mobile */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: navItems.length * 0.05 }}
              onClick={() => handleNavigation('/contact')}
              className={`block w-full text-left px-4 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
                location.pathname === '/contact'
                  ? 'bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-blue-50/80 hover:text-[#1887FC]'
              }`}
            >
              Contact Us
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
};