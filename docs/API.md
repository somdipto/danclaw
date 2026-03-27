# DanClaw - API Specification

## Overview

DanClaw API is a RESTful API with WebSocket support for real-time communication.

## Base URL

```
Production: https://api.danglasses.ai
Development: http://localhost:3000
```

## Authentication

All API requests require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Token is obtained via OAuth (Google/Apple) through Supabase.

## Endpoints

### Auth

#### POST /api/auth/login
Login with Google OAuth.

```json
Request:
{
  "provider": "google",
  "token": "oauth_token"
}

Response:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "tier": "free"
  },
  "token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

#### POST /api/auth/register
Register new user.

```json
Request:
{
  "email": "user@example.com",
  "provider": "google",
  "token": "oauth_token"
}

Response:
{
  "user": { ... },
  "token": "jwt_token"
}
```

#### POST /api/auth/refresh
Refresh JWT token.

```json
Request:
{
  "refresh_token": "refresh_token"
}

Response:
{
  "token": "new_jwt_token"
}
```

### Deployments

#### POST /api/deployments
Create new deployment.

```json
Request:
{
  "tier": "pro",
  "region": "us-central1",
  "config": {
    "model": "claude-3-sonnet",
    "openrouter_token": "optional"
  }
}

Response:
{
  "id": "uuid",
  "status": "provisioning",
  "service_name": "agent-abc123",
  "created_at": "2026-03-27T12:00:00Z"
}
```

#### GET /api/deployments/:id
Get deployment details.

```json
Response:
{
  "id": "uuid",
  "status": "running",
  "tier": "pro",
  "region": "us-central1",
  "service_name": "agent-abc123",
  "uptime": 3600,
  "memory_usage": 2.1,
  "requests_today": 1247,
  "created_at": "2026-03-27T12:00:00Z"
}
```

#### GET /api/deployments
List user deployments.

```json
Response:
{
  "deployments": [
    {
      "id": "uuid",
      "status": "running",
      "tier": "pro",
      "service_name": "agent-abc123"
    }
  ],
  "total": 1
}
```

#### POST /api/deployments/:id/start
Start deployment.

```json
Response:
{
  "id": "uuid",
  "status": "starting",
  "message": "Container starting..."
}
```

#### POST /api/deployments/:id/stop
Stop deployment.

```json
Response:
{
  "id": "uuid",
  "status": "stopping",
  "message": "Container stopping..."
}
```

#### POST /api/deployments/:id/restart
Restart deployment.

```json
Response:
{
  "id": "uuid",
  "status": "restarting",
  "message": "Container restarting..."
}
```

#### DELETE /api/deployments/:id
Destroy deployment.

```json
Response:
{
  "id": "uuid",
  "status": "destroying",
  "message": "Container destroying..."
}
```

### Chat

#### WebSocket /ws/chat/:deploymentId
Real-time chat connection.

```javascript
// Client connects
const ws = new WebSocket('wss://api.danglasses.ai/ws/chat/abc123');

// Send message
ws.send(JSON.stringify({
  type: 'message',
  content: 'Hello, agent!'
}));

// Receive message
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log(data.content);
};
```

**Message Types:**

```json
// User message
{
  "type": "message",
  "content": "Hello!",
  "timestamp": "2026-03-27T12:00:00Z"
}

// Agent response
{
  "type": "response",
  "content": "Hi! How can I help?",
  "timestamp": "2026-03-27T12:00:01Z"
}

// Status update
{
  "type": "status",
  "status": "thinking",
  "message": "Processing..."
}

// Error
{
  "type": "error",
  "message": "Something went wrong",
  "code": 500
}
```

### User

#### GET /api/user/profile
Get user profile.

```json
Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "tier": "pro",
  "created_at": "2026-03-27T12:00:00Z",
  "usage": {
    "deployments": 3,
    "messages_today": 1247,
    "cost_today": 4.23
  }
}
```

#### GET /api/user/usage
Get usage statistics.

```json
Response:
{
  "current_month": {
    "deployments": 3,
    "messages": 15247,
    "cost": 12.50
  },
  "history": [
    {
      "date": "2026-03-26",
      "messages": 1247,
      "cost": 4.23
    }
  ]
}
```

### Billing

#### POST /api/billing/subscribe
Subscribe to plan.

```json
Request:
{
  "plan": "pro",
  "payment_method": "stripe_payment_method_id"
}

Response:
{
  "subscription_id": "sub_abc123",
  "status": "active",
  "plan": "pro",
  "next_billing": "2026-04-27"
}
```

#### POST /api/billing/cancel
Cancel subscription.

```json
Response:
{
  "subscription_id": "sub_abc123",
  "status": "cancelled",
  "end_date": "2026-04-27"
}
```

#### GET /api/billing/portal
Get billing portal URL.

```json
Response:
{
  "url": "https://billing.stanglasses.ai/portal"
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": 400,
    "message": "Invalid request",
    "details": "Missing required field: tier"
  }
}
```

### Error Codes

| Code | Message |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Rate Limiting

| Tier | Requests/min | Messages/min |
|------|-------------|--------------|
| Free | 100 | 10 |
| Pro | 1000 | 100 |
| Elite | 5000 | 500 |

## Webhooks

### RevenueCat Webhook
```json
POST /api/webhooks/revenuecat

{
  "type": "INITIAL_PURCHASE",
  "app_user_id": "user_uuid",
  "product_id": "pro_monthly"
}
```

### GCP Cloud Run Webhook
```json
POST /api/webhooks/gcp

{
  "type": "CONTAINER_STATUS",
  "deployment_id": "uuid",
  "status": "running"
}
```