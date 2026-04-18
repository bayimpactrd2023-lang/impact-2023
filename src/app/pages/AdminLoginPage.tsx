import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/app/context/AuthContext';
import { Lock, AlertCircle, ShieldAlert, Clock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Button } from '@/app/components/ui/button';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useLoginThrottle } from '@/app/hooks/useLoginThrottle';

/**
 * AdminLoginPage Component
 * 
 * Secure login page with the following features:
 * - Login attempt throttling (5 attempts, then 5-minute lockout)
 * - Real-time countdown timer during lockout
 * - Instant loading without lazy imports
 * - Prevents brute force attacks
 */
export const AdminLoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    isLocked,
    remainingAttempts,
    formatRemainingTime,
    recordFailedAttempt,
    resetAttempts,
    currentAttempts,
  } = useLoginThrottle();
  
  const usingSupabaseAuth = isSupabaseConfigured();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission or locked account
    if (isSubmitting || isLocked) return;
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error || 'Invalid credentials. Please check and try again.');
        setPassword('');
        setIsSubmitting(false);
        recordFailedAttempt();
      } else {
        // Reset attempts on successful login
        resetAttempts();
        // Don't set isSubmitting to false on success - let the redirect happen
        // The useEffect will handle navigation after isAuthenticated becomes true
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      setPassword('');
      setIsSubmitting(false);
      recordFailedAttempt();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#1887FC] to-[#0b5ab8] rounded-2xl shadow-lg mx-auto"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold -mt-2">
              <span className="inline-block bg-gradient-to-r from-[#1887FC] to-[#0b5ab8] bg-clip-text text-transparent leading-tight">
                Admin Login
              </span>
            </CardTitle>
            <CardDescription className="text-base">
              {usingSupabaseAuth 
                ? 'Enter your email and password to access the admin panel' 
                : 'Enter your credentials to access the admin panel'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                  {usingSupabaseAuth ? 'Email' : 'Username'}
                </Label>
                <Input
                  id="username"
                  type={usingSupabaseAuth ? 'email' : 'text'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={usingSupabaseAuth ? 'admin@example.com' : 'Enter username'}
                  required
                  className="h-11 border-gray-200 focus:border-[#1887FC] focus:ring-[#1887FC]/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="h-11 border-gray-200 focus:border-[#1887FC] focus:ring-[#1887FC]/20 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Development Mode Help */}
              {!usingSupabaseAuth && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Development Credentials:</p>
                    <p>Username: <code className="bg-white px-1.5 py-0.5 rounded text-gray-800">admin</code></p>
                    <p>Password: <code className="bg-white px-1.5 py-0.5 rounded text-gray-800">impact2024</code></p>
                  </div>
                </motion.div>
              )}
              
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200"
                >
                  {error}
                </motion.p>
              )}
              
              {isLocked && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm bg-red-50 p-4 rounded-lg border border-red-200 flex items-start gap-3"
                >
                  <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-800 mb-1">Account Temporarily Locked</p>
                    <p className="text-red-700 mb-2">Too many failed login attempts.</p>
                    <div className="flex items-center gap-2 text-red-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono font-semibold">{formatRemainingTime()}</span>
                      <span className="text-xs">remaining</span>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {!isLocked && currentAttempts > 0 && currentAttempts < 5 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  <div>
                    <p className="text-amber-800">
                      <span className="font-semibold">{remainingAttempts}</span> attempt{remainingAttempts !== 1 ? 's' : ''} remaining before lockout.
                    </p>
                  </div>
                </motion.div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-[#1887FC] to-[#0b5ab8] hover:from-[#0b5ab8] hover:to-[#1887FC] shadow-md hover:shadow-lg transition-all duration-300 text-white"
                disabled={isSubmitting || isLocked}
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            
            {/* Production Setup Link */}
            {!usingSupabaseAuth && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-center text-gray-600">
                  Ready for production?{' '}
                  <a 
                    href="/QUICK_START_PRODUCTION.md" 
                    target="_blank"
                    className="text-[#1887FC] hover:underline font-medium"
                  >
                    Set up Supabase Auth →
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};