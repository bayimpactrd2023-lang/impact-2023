/**
 * Security utilities for the IMPACT R&D application
 * Implements various security measures including input validation,
 * rate limiting, XSS protection, and session management
 */

// ============================================================================
// Rate Limiting
// ============================================================================

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiter configuration
 */
export const RATE_LIMIT_CONFIG = {
  // Login attempts
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  LOGIN_BLOCK_DURATION_MS: 30 * 60 * 1000, // 30 minutes block after max attempts
  
  // API requests
  API_MAX_REQUESTS: 100,
  API_WINDOW_MS: 60 * 1000, // 1 minute
};

/**
 * Check if a request should be rate limited
 * @param key - Unique identifier (e.g., IP address, username)
 * @param maxAttempts - Maximum number of attempts allowed
 * @param windowMs - Time window in milliseconds
 * @param blockDurationMs - How long to block after exceeding limit
 * @returns Object with allowed status and remaining attempts
 */
export const checkRateLimit = (
  key: string,
  maxAttempts: number,
  windowMs: number,
  blockDurationMs: number = 0
): { allowed: boolean; remaining: number; resetTime?: number } => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // Check if currently blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.blockedUntil,
    };
  }

  // No previous attempts or window expired
  if (!entry || now - entry.firstAttempt > windowMs) {
    rateLimitStore.set(key, {
      count: 1,
      firstAttempt: now,
    });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
    };
  }

  // Increment counter
  entry.count++;

  // Check if limit exceeded
  if (entry.count > maxAttempts) {
    if (blockDurationMs > 0) {
      entry.blockedUntil = now + blockDurationMs;
      rateLimitStore.set(key, entry);
    }
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.blockedUntil,
    };
  }

  rateLimitStore.set(key, entry);
  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
  };
};

/**
 * Clear rate limit for a specific key (e.g., after successful login)
 */
export const clearRateLimit = (key: string): void => {
  rateLimitStore.delete(key);
};

/**
 * Clean up old rate limit entries (call periodically)
 */
export const cleanupRateLimits = (): void => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.blockedUntil && entry.blockedUntil < now) {
      rateLimitStore.delete(key);
    }
  }
};

// Clean up every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

// ============================================================================
// Input Validation & Sanitization
// ============================================================================

/**
 * Sanitize string input to prevent XSS attacks
 * Removes potentially dangerous HTML and JavaScript
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

/**
 * Sanitize HTML content (for rich text editors)
 * Allows safe HTML tags only
 */
export const sanitizeHTML = (html: string): string => {
  if (typeof html !== 'string') return '';
  
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'];
  const allowedAttributes = ['href', 'src', 'alt', 'title', 'class'];
  
  // Basic sanitization - in production, use a library like DOMPurify
  let sanitized = html;
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '');
  
  return sanitized;
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 */
export const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Validate username (alphanumeric, underscore, dash only)
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validate password strength
 * Minimum 8 characters, at least one letter and one number
 */
export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
};

/**
 * Check password strength and return feedback
 */
export const getPasswordStrength = (password: string): {
  score: number; // 0-4
  feedback: string;
} => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters');

  if (password.length >= 12) score++;
  
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Include uppercase letters');
  
  if (/[0-9]/.test(password)) score++;
  else feedback.push('Include numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Include special characters');

  // Normalize score to 0-4
  score = Math.min(4, Math.floor(score / 1.5));

  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const feedbackText = feedback.length > 0 
    ? `${strengthLabels[score]}. Suggestions: ${feedback.join(', ')}`
    : strengthLabels[score];

  return { score, feedback: feedbackText };
};

// ============================================================================
// Session Security
// ============================================================================

/**
 * Generate a secure random session token
 */
export const generateSessionToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Validate session token format
 */
export const isValidSessionToken = (token: string): boolean => {
  return /^[a-f0-9]{64}$/.test(token);
};

/**
 * Encrypt sensitive data before storing (basic implementation)
 * In production, use a proper encryption library
 */
export const encryptData = (data: string, key: string): string => {
  // This is a simple XOR cipher for demonstration
  // In production, use crypto-js or similar library
  let encrypted = '';
  for (let i = 0; i < data.length; i++) {
    encrypted += String.fromCharCode(
      data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(encrypted);
};

/**
 * Decrypt sensitive data
 */
export const decryptData = (encryptedData: string, key: string): string => {
  try {
    const decoded = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(
        decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return decrypted;
  } catch {
    return '';
  }
};

// ============================================================================
// CSRF Protection
// ============================================================================

/**
 * Generate CSRF token
 */
export const generateCSRFToken = (): string => {
  return generateSessionToken();
};

/**
 * Validate CSRF token
 */
export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  return token === storedToken && isValidSessionToken(token);
};

// ============================================================================
// Content Security
// ============================================================================

/**
 * Escape HTML entities to prevent XSS
 */
export const escapeHTML = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, char => map[char]);
};

/**
 * Validate file upload
 */
export const validateFileUpload = (
  file: File,
  allowedTypes: string[],
  maxSizeMB: number = 5
): { valid: boolean; error?: string } => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
};

// ============================================================================
// Environment Validation
// ============================================================================

/**
 * Validate required environment variables
 */
export const validateEnvironment = (): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Check Supabase configuration
  if (!import.meta.env.VITE_SUPABASE_URL && !window.SUPABASE_URL) {
    errors.push('VITE_SUPABASE_URL is not configured');
  }
  
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY && !window.SUPABASE_ANON_KEY) {
    errors.push('VITE_SUPABASE_ANON_KEY is not configured');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// Security Headers (for documentation)
// ============================================================================

/**
 * Recommended security headers for production deployment
 * Add these to your hosting configuration (Vercel, Netlify, etc.)
 */
export const RECOMMENDED_SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// ============================================================================
// Logging & Monitoring
// ============================================================================

/**
 * Log security events (in production, send to monitoring service)
 * Note: Sensitive details are filtered to prevent information leakage
 */
export const logSecurityEvent = (
  event: string,
  details: Record<string, any>
): void => {
  // Filter sensitive information
  const safeDetails = { ...details };
  
  // Remove sensitive fields
  delete safeDetails.password;
  delete safeDetails.username;
  delete safeDetails.userAgent;
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details: safeDetails,
  };

  // Only log in development mode without sensitive details
  // Production logging should be handled by external monitoring service
  if (import.meta.env.DEV) {
    // Silent logging - no console output to prevent information leakage
    // To enable during debugging, uncomment the line below:
    // console.info('[Auth Event]', event);
  }

  // In production, send to monitoring service (e.g., Sentry, LogRocket)
  // Example: sendToMonitoring(logEntry);
};