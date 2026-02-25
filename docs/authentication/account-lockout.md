# Account Lockout

Easy-Dashboard implements account lockout after failed login attempts to prevent brute-force attacks.

## Lockout Mechanism

```typescript
// models/Admin.ts
interface IAdmin extends Document {
  // ... other fields
  failedAttempts: number; // Count of failed login attempts
  lockUntil: Date | null; // Account lockout expiration
}
```

## Configuration

```typescript
// Security constants
const MAX_FAILED_ATTEMPTS = 5; // Lock after 5 failed attempts
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
```

| Parameter           | Value      | Location                        |
| ------------------- | ---------- | ------------------------------- |
| Max failed attempts | 5          | `controllers/authController.ts` |
| Lockout duration    | 15 minutes | `controllers/authController.ts` |

## Login Flow with Lockout

```
┌─────────────────────────────────────────────────────────────┐
│                    Login Flow                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. POST /api/auth/login                                   │
│         │                                                   │
│         ▼                                                   │
│  2. Valid credentials?                                      │
│         │                                                   │
│     ┌───┴───┐                                               │
│     │       │                                               │
│    YES     NO                                               │
│     │       │                                               │
│     ▼       ▼                                               │
│  3. Reset          4. Check lockUntil                        │
│  failedAttempts      │                                       │
│  to 0           ┌───┴───┐                                    │
│                 │       │                                    │
│             Locked   Not Locked                              │
│                 │       │                                    │
│                 ▼       ▼                                    │
│             5. Increment    6. Check password                │
│             failedAttempts      │                            │
│             + return 401    ┌───┴───┐                        │
│                             │       │                        │
│                        Match    No Match                     │
│                             │       │                        │
│                             ▼       ▼                        │
│                        7. Success  8. Increment + check     │
│                        + reset   failedAttempts             │
│                        failedAttempts                       │
│                                │                            │
│                         ┌──────┴──────┐                      │
│                         │             │                      │
│                    Attempt ≤ 5   Attempt > 5                │
│                         │             │                      │
│                         ▼             ▼                      │
│                    9. Return     10. Set lockUntil         │
│                    success        + return 401               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### Login with Lockout Check

```typescript
// controllers/authController.ts:login function
export const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Find admin
  const admin = await Admin.findOne({ email });

  // 2. Check if account is locked
  if (admin.lockUntil && admin.lockUntil > new Date()) {
    const remaining = Math.ceil((admin.lockUntil.getTime() - Date.now()) / 1000 / 60);
    return res.status(401).json({
      success: false,
      message: `Account is locked. Try again in ${remaining} minutes.`,
    });
  }

  // 3. Verify password
  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    // 4. Increment failed attempts
    admin.failedAttempts += 1;

    // 5. Lock if too many attempts
    if (admin.failedAttempts >= MAX_FAILED_ATTEMPTS) {
      admin.lockUntil = new Date(Date.now() + LOCKOUT_DURATION);
      await admin.save();

      return res.status(401).json({
        success: false,
        message: 'Too many failed attempts. Account locked for 15 minutes.',
      });
    }

    await admin.save();
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  // 6. Success - reset failed attempts
  admin.failedAttempts = 0;
  admin.lockUntil = null;
  await admin.save();

  // 7. Generate tokens...
};
```

### Successful Login Clears Lockout

```typescript
// On successful login
admin.failedAttempts = 0;
admin.lockUntil = null;
await admin.save();
```

## Database Schema

```typescript
// models/Admin.ts
const adminSchema = new Schema({
  // ... other fields
  failedAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
});
```

## Lockout Behavior

### During Lockout

| Request | Response                                             |
| ------- | ---------------------------------------------------- |
| Login   | `401` - "Account is locked. Try again in X minutes." |
| Any API | `401` - "Unauthorized" (token invalid)               |

### After Lockout Expires

- `lockUntil` is checked on next login attempt
- If `lockUntil < now()`, account is automatically unlocked
- `failedAttempts` counter is NOT reset (resets on successful login)

### Manual Unlock (Admin)

Admins can manually unlock accounts:

```typescript
// PATCH /api/admin/update/:id
{
  "failedAttempts": 0,
  "lockUntil": null
}
```

## Monitoring

### Login Response Codes

| Code | Meaning             | Frequency                 |
| ---- | ------------------- | ------------------------- |
| 200  | Success             | Normal                    |
| 401  | Invalid credentials | Expected (wrong password) |
| 401  | Account locked      | Attack detection          |

### Logging

Failed login attempts are logged:

```typescript
// On failed attempt
logger.warn('Login failed', {
  email: email,
  attempts: admin.failedAttempts,
  lockedUntil: admin.lockUntil,
  ip: req.ip,
});
```

## Production Recommendations

### Notify Users

Consider adding email notification on lockout:

```typescript
if (admin.failedAttempts >= MAX_FAILED_ATTEMPTS) {
  // Send lockout email
  await sendEmail({
    to: admin.email,
    subject: 'Account Security Alert',
    body: 'Your account has been locked due to multiple failed login attempts...',
  });
}
```

### IP-Based vs User-Based

Current implementation is user-based:

- One user = 5 attempts max
- Multiple users from same IP = separate limits

For IP-based limiting, combine with rate limiting (see [Rate Limiting](./rate-limiting.md)).

## Related Documentation

- [Authentication Overview](./overview.md)
- [Rate Limiting](./rate-limiting.md)
