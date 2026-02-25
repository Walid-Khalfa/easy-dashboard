# Token Management

Easy-Dashboard uses JWT (JSON Web Tokens) with a dual-token strategy for secure authentication.

## Token Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Token Lifecycle                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐ │
│  │   Login      │────▶│   Access      │────▶│   API        │ │
│  │   Request    │     │   Token       │     │   Request    │ │
│  └──────────────┘     │ (15 min)      │     └──────────────┘ │
│                       └──────┬───────┘            │            │
│                              │                    │            │
│                       ┌──────▼───────┐            │            │
│                       │   Refresh    │            ▼            │
│                       │   Token      │     ┌──────────────┐   │
│                       │  (7 days)    │────▶│   401        │   │
│                       └──────────────┘     │   (expired)  │   │
│                              │              └──────────────┘   │
│                       ┌──────▼───────┐            │            │
│                       │   Refresh    │◀───────────┘            │
│                       │   Endpoint   │                          │
│                       └──────────────┘                          │
│                              │                                  │
│                       ┌──────▼───────┐                          │
│                       │   New        │                          │
│                       │   Access     │                          │
│                       │   Token      │                          │
│                       └──────────────┘                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Token Configuration

### Access Token

```typescript
// controllers/authController.ts:8-13
const generateAccessToken = (adminId: string) => {
  return jwt.sign(
    { id: adminId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // 15 minutes
  );
};
```

| Property  | Value             | Purpose                                |
| --------- | ----------------- | -------------------------------------- |
| Expiry    | 15 minutes        | Short window limits token theft damage |
| Payload   | `{ id: adminId }` | Minimal data, no sensitive info        |
| Algorithm | HS256             | Symmetric signing                      |

### Refresh Token

```typescript
// controllers/authController.ts:27-29
const generateRefreshToken = (adminId: string) => {
  return jwt.sign(
    { id: adminId },
    getRefreshSecret(),
    { expiresIn: '7d' } // 7 days
  );
};
```

| Property  | Value             | Purpose                            |
| --------- | ----------------- | ---------------------------------- |
| Expiry    | 7 days            | Long-lived for persistent sessions |
| Payload   | `{ id: adminId }` | Same as access token               |
| Algorithm | HS256             | Consistent with access token       |

## Token Payload Structure

### Access Token

```json
{
  "id": "65f2a1b3c9e4d0001a2b3c4d",
  "iat": 1706200000,
  "exp": 1706200900
}
```

### Refresh Token

```json
{
  "id": "65f2a1b3c9e4d0001a2b3c4d",
  "iat": 1706200000,
  "exp": 1706800000
}
```

**Note**: Tokens do NOT contain:

- Password hash
- Role (fetched from database when needed)
- Email (not needed for authorization)

## Token Validation

### On Each Request

```typescript
// middleware/auth.ts
const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // Attach to request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Access token expired',
      });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};
```

## Token Blocklist (Logout)

### Implementation

```typescript
// utils/tokenBlocklist.ts
export const addToBlocklist = async (token: string, expiry: number) => {
  if (redisClient) {
    // Production: Redis blocklist
    await redisClient.setEx(`blocklist:${token}`, expiry, 'blocked');
  } else {
    // Development: In-memory blocklist
    blocklist.set(token, Date.now() + expiry);
  }
};

export const isTokenBlocked = async (token: string): Promise<boolean> => {
  if (redisClient) {
    return await redisClient.exists(`blocklist:${token}`);
  }
  return blocklist.has(token);
};
```

### Logout Flow

```typescript
// controllers/authController.ts:logout
export const logout = async (req, res) => {
  const token = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  // Add tokens to blocklist
  if (token) {
    const decoded = jwt.decode(token);
    const expiry = decoded.exp - Date.now() / 1000;
    await addToBlocklist(token, expiry);
  }

  if (refreshToken) {
    const decoded = jwt.decode(refreshToken);
    const expiry = decoded.exp - Date.now() / 1000;
    await addToBlocklist(refreshToken, expiry);
  }

  // Clear cookies
  res.clearCookie('token');
  res.clearCookie('refreshToken');

  res.json({ success: true, message: 'Logged out successfully' });
};
```

## Environment Variables

```env
# Required for production
JWT_SECRET=your-min-32-char-secret-key
JWT_REFRESH_SECRET=your-min-32-char-refresh-secret

# Token timing (optional, defaults shown)
JWT_TOKEN_EXPIRATION=18000000  # 15 minutes in ms
```

## Security Considerations

### Why Short Access Token?

1. **Limited exposure time**: If stolen, only valid for 15 minutes
2. **Forces frequent validation**: Role changes take effect quickly
3. **Reduces JWT size**: Smaller payloads = faster requests

### Why Long Refresh Token?

1. **User experience**: Don't force re-login every 15 minutes
2. **Refresh is validated**: Each refresh checks database for account status
3. **Revokable**: Can be invalidated via blocklist

### Token Storage Comparison

| Storage         | Access Token | Refresh Token | Security          |
| --------------- | ------------ | ------------- | ----------------- |
| localStorage    | ✅           | ❌            | ❌ XSS vulnerable |
| sessionStorage  | ✅           | ❌            | ❌ XSS vulnerable |
| httpOnly Cookie | ✅           | ✅            | ✅ XSS safe       |
| Memory (Redux)  | ✅           | ❌            | ⚠️ XSS vulnerable |

**Easy-Dashboard uses**: httpOnly cookies for both, Redux for in-memory token state

## Related Documentation

- [Cookie Configuration](./cookies.md)
- [Account Lockout](./account-lockout.md)
