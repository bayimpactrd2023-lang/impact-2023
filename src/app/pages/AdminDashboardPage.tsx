import React, { lazy, Suspense, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { PageHeaderTheme } from '@/app/components/PageHeaderTheme';
import { SectionTheme } from '@/app/components/SectionTheme';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
// Production: No skeleton loader - content loads seamlessly
import { useInactivityLogout } from '@/app/hooks/useInactivityLogout';
import { toast } from 'sonner';


// Lazy load the AdminPanel component - only loads after authentication
const AdminPanel = lazy(() => import('@/app/components/AdminPanel').then(module => ({ default: module.AdminPanel })));

/**
 * AdminDashboardPage Component
 * 
 * Protected admin dashboard page with the following features:
 * - Lazy loads the AdminPanel component after authentication
 * - Auto-logout after 5 minutes of inactivity
 * - Warning dialog before automatic logout
 * - Secure session management
 */
export const AdminDashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
    toast.info('You have been logged out');
  }, [logout, navigate]);

  const handleInactivityWarning = useCallback(() => {
    setShowInactivityWarning(true);
  }, []);

  const handleInactivityLogout = useCallback(() => {
    setShowInactivityWarning(false);
    handleLogout();
    toast.warning('You were logged out due to inactivity');
  }, [handleLogout]);

  // Initialize inactivity logout
  const { resetTimer } = useInactivityLogout({
    onLogout: handleInactivityLogout,
    onWarning: handleInactivityWarning,
    enabled: true,
  });

  const handleStayLoggedIn = useCallback(() => {
    setShowInactivityWarning(false);
    resetTimer();
    toast.success('Session extended');
  }, [resetTimer]);

  return (
    <div className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(248,250,252,0.98) 50%, rgba(255,255,255,1) 100%)'
      }}
    >
      <PageHeaderTheme theme="transparent" scrollThreshold={700} />
      
      {/* Hero Section - Modern Instagram-like Style */}
      <SectionTheme theme="transparent">
        <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
          {/* High-Quality Background Image with Overlay */}
          <div className="absolute inset-0">
            {/* Agricultural Research Image */}
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1656488497988-ca149c86dade?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000"
              alt="Agricultural Research"
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Modern White-Dominant Gradient Overlay - Instagram-style */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(248,250,252,0.88) 30%, rgba(255,255,255,0.85) 60%, rgba(24,135,252,0.15) 100%)'
              }}
            />
            
            {/* Soft Blue Accent Gradient */}
            <div 
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 20% 30%, rgba(24,135,252,0.12) 0%, transparent 40%),
                  radial-gradient(circle at 80% 70%, rgba(59,130,246,0.08) 0%, transparent 40%)
                `,
                animation: 'gradientShift 12s ease-in-out infinite alternate'
              }}
            />
            
            {/* Subtle Floating Particles */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(24,135,252,0.4), rgba(59,130,246,0.6))',
                  left: `${Math.random() * 100}%`,
                  bottom: 0,
                }}
                animate={{
                  y: [0, -400],
                  x: [0, (Math.random() - 0.5) * 100],
                  opacity: [0, 0.6, 0.6, 0],
                }}
                transition={{
                  duration: 10 + Math.random() * 6,
                  repeat: Infinity,
                  delay: Math.random() * 4,
                  ease: "linear"
                }}
              />
            ))}
            
            {/* Minimal Grid Overlay */}
            <div 
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(24,135,252,0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(24,135,252,0.3) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />
          </div>

          {/* Top Navigation Bar inside Hero */}
          <div className="absolute top-0 left-0 right-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                {/* Logo - Left Side */}
                <motion.div
                  onClick={() => navigate('/')}
                  className="flex items-center gap-3 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <img src="/images/logos/impact.png" alt="IMPACT R&D Logo" className="h-14 md:h-16 w-auto drop-shadow-lg" />
                </motion.div>

                {/* User Dropdown - Right Side */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#1887FC] to-[#3b82f6] hover:from-[#0b5ab8] hover:to-[#1887FC] shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <User className="w-6 h-6 text-white" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-left"
            >
              <div className="relative">
                {/* Decorative gradient background */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#1887FC]/5 via-blue-50/30 to-[#3b82f6]/5 blur-2xl rounded-full" />
                
                <h1 
                   className="text-left pl-0 sm:pl-2 lg:pl-4 text-4xl sm:text-6xl md:text-7xl font-bold mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #1887FC 0%, #3b82f6 50%, #60a5fa 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.02em',
                    fontFamily: 'Kanit, sans-serif',
                  }}
                >
                  Admin Panel
                </h1>
                <p className="text-left pl-0 sm:pl-2 lg:pl-4 text-lg sm:text-xl md:text-2xl text-gray-600 font-medium">
                  Manage your website content and settings
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </SectionTheme>

      {/* Admin Panel Content - Lazy Loaded */}
      <SectionTheme theme="light">
        <section className="py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <Suspense fallback={<div className="min-h-[400px]" />}>
              <AdminPanel />
            </Suspense>
          </motion.div>
        </section>
      </SectionTheme>

      {/* Inactivity Warning Dialog */}
      <AnimatePresence>
        {showInactivityWarning && (
          <Dialog open={showInactivityWarning} onOpenChange={setShowInactivityWarning}>
            <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl shadow-2xl p-0 border-none overflow-hidden">
              <div className="p-8">
                <DialogHeader className="flex flex-col items-start gap-4 space-y-0">
                  <div className="flex items-center gap-4 w-full">
                    <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                      Session About to Expire
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-base text-gray-500 font-medium leading-relaxed pt-2">
                    Your session will expire in a few seconds due to inactivity. Do you want to stay logged in?
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter className="mt-10 flex flex-row gap-4 sm:justify-center w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleStayLoggedIn}
                    className="flex-1 h-12 rounded-xl border-gray-200 text-[#1887FC] font-bold hover:bg-blue-50/50 hover:text-[#1887FC] text-base border-2"
                  >
                    Stay Logged In
                  </Button>
                  <Button
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 h-12 rounded-xl font-bold text-base shadow-lg transition-all active:scale-95 bg-[#DC1E3C] hover:bg-[#B91932] text-white shadow-red-100"
                  >
                    Logout
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};