# DanClaw - Security Model (InsForge.dev)

## Overview

DanClaw uses InsForge.dev for everything - Auth, Database, Storage, Functions, and Deployment. One platform, one security model.

## Authentication

### OAuth Flow (InsForge Auth)
```
1. User taps "Sign in with Google"
2. Google OAuth popup
3. User grants permission
4. Google returns token
5. InsForge Auth verifies token
6. InsForge Auth creates JWT
7. App stores JWT in secure storage
8. All API requests include JWT
```

### Token Management
- JWT expires after 24 hours
- Refresh token expires after 30 days
- Tokens stored in device secure storage
- Never in plaintext

## Authorization

### Row Level Security (RLS) - InsForge PostgreSQL
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can only manage own deployments
CREATE POLICY "Users can manage own deployments"
  ON deployments FOR ALL
  USING (auth.uid() = user_id);
```

### API Key Management
- OpenRouter API keys stored in InsForge Secrets
- Keys injected as environment variables to containers
- Keys never sent to mobile app
- Keys rotated every 90 days

## Data Protection

### Encryption at Rest
- InsForge PostgreSQL: AES-256 encryption
- InsForge Storage: Encrypted by default
- InsForge Secrets: Encrypted

### Encryption in Transit
- HTTPS everywhere
- WSS for WebSocket connections
- TLS 1.3 minimum

### Container Isolation
- Each user gets isolated container
- No shared resources between users
- Network isolation
- File system isolation

## Rate Limiting

### By Tier
| Tier | API Requests/min | Chat Messages/min |
|------|-----------------|-------------------|
| Free | 100 | 10 |
| Pro | 1000 | 100 |
| Elite | 5000 | 500 |

### Abuse Prevention
- IP-based rate limiting
- User-based rate limiting
- Automatic blocking for violations
- Manual review for patterns

## Monitoring

### Security Events (InsForge)
- Failed login attempts
- API key usage
- Container access logs
- Unusual patterns

### Alerts
- Multiple failed logins (>5 in 5min)
- API key exposed in logs
- Container accessed from unusual IP
- Rate limit exceeded

## Compliance

### GDPR
- Data deletion on request
- Data export on request
- Privacy by design
- Consent management

### SOC 2 (Future)
- Audit logs
- Access controls
- Encryption standards
- Incident response

## Incident Response

### Detection
- Automated monitoring (InsForge)
- User reports
- Security audits

### Response
1. Identify incident
2. Contain damage
3. Notify affected users
4. Fix vulnerability
5. Update documentation

### Recovery
- Restore from backups
- Rotate compromised keys
- Patch vulnerabilities
- Monitor for recurrence