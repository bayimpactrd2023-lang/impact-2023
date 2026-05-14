# Custom React Hooks

This directory contains production-ready custom React hooks for security and user experience features.

## Security Hooks

### `useLoginThrottle`

**Purpose:** Prevents brute force attacks by throttling login attempts.

**Features:**
- Tracks failed login attempts
- Locks account after 5 failed attempts
- 5-minute cooldown period with real-time countdown
- Persists state in localStorage (survives page refreshes)
- Automatic cleanup of expired locks

**Usage:**
```tsx
import { useLoginThrottle } from '@/app/hooks/useLoginThrottle';

function LoginPage() {
  const {
    isLocked,
    remainingAttempts,
    remainingTime,
    formatRemainingTime,
    recordFailedAttempt,
    resetAttempts,
    currentAttempts,
  } = useLoginThrottle();

  const handleLogin = async () => {
    const result = await login(username, password);
    
    if (!result.success) {
      recordFailedAttempt();
    } else {
      resetAttempts();
    }
  };

  return (
    <div>
      {isLocked && (
        <p>Account locked. Try again in {formatRemainingTime()}</p>
      )}
      <button disabled={isLocked} onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}
```

**API:**
- `isLocked: boolean` - Whether the account is currently locked
- `remainingAttempts: number` - Number of attempts left before lockout
- `remainingTime: number` - Seconds remaining in lockout period
- `formatRemainingTime: () => string` - Formats remaining time as "MM:SS"
- `recordFailedAttempt: () => void` - Records a failed login attempt
- `resetAttempts: () => void` - Resets all attempts (call on successful login)
- `currentAttempts: number` - Current number of failed attempts

### `useInactivityLogout`

**Purpose:** Automatically logs out users after a period of inactivity.

**Features:**
- Monitors user activity (mouse, keyboard, touch, scroll)
- 5-minute inactivity timeout
- Optional warning before logout (30 seconds)
- Activity event throttling to optimize performance
- Can be enabled/disabled dynamically

**Usage:**
```tsx
import { useInactivityLogout } from '@/app/hooks/useInactivityLogout';

function AdminDashboard() {
  const { logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);

  useInactivityLogout({
    onLogout: () => {
      logout();
      navigate('/login');
    },
    onWarning: () => {
      setShowWarning(true);
    },
    enabled: true,
  });

  return (
    <div>
      {showWarning && <InactivityWarningDialog />}
      {/* Dashboard content */}
    </div>
  );
}
```

**API:**
- `onLogout: () => void` - Required callback when inactivity timeout is reached
- `onWarning?: () => void` - Optional callback 30 seconds before logout
- `enabled?: boolean` - Enable/disable the hook (default: true)
- Returns: `{ resetTimer: () => void }` - Manually reset the inactivity timer

**Activity Events Monitored:**
- `mousedown`, `mousemove` - Mouse activity
- `keypress` - Keyboard activity
- `scroll` - Page scrolling
- `touchstart` - Touch device interaction
- `click` - Click events

**Performance:**
Event listeners are throttled to once per second to prevent excessive timer resets and optimize performance.

## Best Practices

1. **Security First:** Always use `useLoginThrottle` on login pages to prevent brute force attacks.

2. **User Experience:** Use `useInactivityLogout` with a warning dialog to give users a chance to extend their session.

3. **Cleanup:** Both hooks handle their own cleanup automatically - no manual cleanup required.

4. **Testing:** 
   - Test login throttling by intentionally failing login attempts
   - Test inactivity logout by waiting for the timeout period
   - Verify localStorage persistence by refreshing the page during lockout

5. **Production Considerations:**
   - Adjust `MAX_ATTEMPTS` and `LOCKOUT_DURATION` in `useLoginThrottle` based on your security requirements
   - Adjust `INACTIVITY_TIMEOUT` in `useInactivityLogout` based on your application's security policies
   - Consider logging lockout events for security monitoring

## Browser Compatibility

Both hooks are compatible with all modern browsers that support:
- localStorage API
- ES6+ features
- React 16.8+ (Hooks)

## License

These hooks are part of the IMPACT R&D website and are subject to the project's license.
