import * as React from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useHeaderTheme } from '@/app/context/HeaderThemeContext';
import { useContent } from '@/app/context/ContentContext';


export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [blogDropdownOpen, setBlogDropdownOpen] = React.useState(false);
  const [mobileBlogDropdownOpen, setMobileBlogDropdownOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, scrollThreshold } = useHeaderTheme();
  const { content, fetchBlogPosts } = useContent();

  // Fetch blogs in the background after mount
  React.useEffect(() => {
    // Check if blogs are already fetching or loaded
    if (!content.blogPosts.length) {
      // Use setImmediate or setTimeout to ensure it doesn't block the main thread
      const timer = setTimeout(() => {
        fetchBlogPosts().catch(err => console.error('[Header] Error fetching blog posts:', err));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

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

    if (theme === 'dark') {
      return 'text-white/90 hover:text-white hover:bg-white/10';
    }

    return 'text-gray-900 hover:text-[#1887FC] hover:bg-blue-50/50';
  };

  // Get header styles based on theme and scroll state
  const getHeaderStyles = () => {
    if (theme === 'dark') {
      return {
        background: 'rgba(38, 38, 38, 0.8)', // Lighter gray for glass effect
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      };
    }
    
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
            {navItems.map((item) => {
              if (item.key === 'blog') {
                return (
                  <div 
                    key={item.key} 
                    className="relative"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setBlogDropdownOpen(!blogDropdownOpen);
                      }}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 flex items-center gap-1 ${getNavButtonClass(item.path)}`}
                    >
                      {item.label}
                      <ChevronDown size={14} className={`transition-transform duration-300 ${blogDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Blog Dropdown */}
                    {blogDropdownOpen && (
                      <>
                        {/* Overlay to close when clicking outside */}
                        <div 
                          className="fixed inset-0 z-[90]" 
                          onClick={() => setBlogDropdownOpen(false)}
                        />
                        
                        <div className="absolute top-[calc(100%+12px)] right-0 w-80 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="relative bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl border border-blue-50/50 py-2 overflow-hidden">
                            <div className="px-4 py-2 border-b border-gray-50 mb-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Posts</span>
                            </div>
                            
                            {content.blogPosts.length > 0 ? (
                              content.blogPosts.slice(0, 4).map((post) => (
                                <button
                                  key={post.id}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleNavigation(`/blog?post=${post.id}`);
                                    setBlogDropdownOpen(false);
                                  }}
                                  className="w-full text-left px-5 py-3 hover:bg-blue-50 group transition-all border-b border-gray-50/50 last:border-0"
                                >
                                  <p className="text-xs font-bold text-gray-800 group-hover:text-[#1887FC] transition-colors line-clamp-2 leading-relaxed mb-1">
                                    {post.title}
                                  </p>
                                  {post.date && (
                                    <p className="text-[10px] text-gray-400 font-medium">
                                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="px-5 py-6 text-center">
                                <p className="text-xs text-gray-400 italic">No blog posts found</p>
                              </div>
                            )}
                            
                            {content.blogPosts.length > 3 && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleNavigation('/blog');
                                  setBlogDropdownOpen(false);
                                }}
                                className="w-full text-center py-3 bg-gray-50/50 hover:bg-blue-50 transition-colors mt-auto border-t border-gray-50/50"
                              >
                                <span className="text-[11px] font-black text-[#1887FC] uppercase tracking-wider">
                                  View All {content.blogPosts.length} Articles
                                </span>
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              }
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.path)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${getNavButtonClass(item.path)}`}
                >
                  {item.label}
                </button>
              );
            })}
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
            className={`md:hidden p-2 rounded-md transition-colors ${
              theme === 'dark' ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-900'
            }`}
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
              
              if (item.key === 'blog') {
                return (
                  <div key={item.key} className="space-y-1">
                    <motion.button
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setMobileBlogDropdownOpen(!mobileBlogDropdownOpen)}
                      className={`flex w-full items-center justify-between px-4 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#1887FC] to-[#3b82f6] text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-blue-50/80 hover:text-[#1887FC]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${mobileBlogDropdownOpen ? 'rotate-180' : ''}`} />
                    </motion.button>
                    
                    {mobileBlogDropdownOpen && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pl-4 space-y-1 overflow-hidden"
                      >
                        {content.blogPosts.length > 0 ? (
                          content.blogPosts.slice(0, 4).map((post) => (
                            <button
                              key={post.id}
                              onClick={() => {
                                handleNavigation(`/blog?post=${post.id}`);
                                setMobileMenuOpen(false);
                                setMobileBlogDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 group transition-all rounded-xl border-l-2 border-transparent hover:border-[#1887FC]"
                            >
                              <p className="text-sm font-bold text-gray-800 group-hover:text-[#1887FC] transition-colors line-clamp-1">
                                {post.title}
                              </p>
                              {post.date && (
                                <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                  {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3">
                            <p className="text-xs text-gray-400 italic">No blog posts found</p>
                          </div>
                        )}
                        {content.blogPosts.length > 3 && (
                          <button
                            onClick={() => {
                              handleNavigation('/blog');
                              setMobileMenuOpen(false);
                              setMobileBlogDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-3 text-[#1887FC] font-bold text-xs uppercase tracking-wider hover:bg-blue-50 rounded-xl mt-1 border-t border-gray-50"
                          >
                            View All {content.blogPosts.length} Articles
                          </button>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              }

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