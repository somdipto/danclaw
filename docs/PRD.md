# DanClaw - Product Requirements Document (PRD)

## 1. Executive Summary

### Vision
DanClaw is a mobile-first AI agent deployment platform. Users deploy AI agents in 60 seconds with zero DevOps.

### Problem
Current AI agent deployment requires:
- CLI knowledge
- SSH access
- Docker experience
- Configuration files

### Solution
One-click deployment to GCP Cloud Run containers with SwarmClaw + Paperclip.

## 2. Target Users

| Persona | Description | Use Case |
|---------|-------------|----------|
| Non-technical | Want AI, can't deploy | Personal assistant |
| Freelancers | Need AI for work | Automation |
| Small teams | 2-5 people | Shared AI |
| Developers | Want quick setup | Dev assistant |

## 3. Features

### 3.1 Core Features

#### Deploy (60 seconds)
- One-click deployment
- Google/Apple auth
- Automatic provisioning
- Health monitoring

#### Chat
- Real-time WebSocket
- Multi-turn conversations
- File uploads
- Voice input (future)

#### Dashboard
- Deployment status
- Resource usage
- Recent activity
- Cost tracking

#### Settings
- Model selection
- API key management
- Tier management
- Notifications

### 3.2 Future Features
- Multi-agent orchestration (SwarmClaw)
- Company management (Paperclip)
- Custom domains
- Team sharing
- ESP32 glasses integration

## 4. Tiers

| Feature | Free | Pro | Elite |
|---------|------|-----|-------|
| Price | $0 | $29.99/mo | $99.99/mo |
| RAM | 512MB | 4GB | 16GB |
| vCPU | 0.25 | 2 | 4 |
| Storage | 10GB | 100GB | 500GB |
| Uptime | 12hrs/day | 24/7 | 24/7 |
| Models | 50 | 500+ | All + Custom |
| Agents | 1 | 5 | 20 |
| Team | 1 | 3 | 10 |

## 5. User Flows

### 5.1 Deploy Flow
```
1. Open app
2. Tap "Deploy My Agent"
3. Sign in with Google/Apple
4. Wait 60 seconds
5. Agent ready
6. Start chatting
```

### 5.2 Chat Flow
```
1. Open chat
2. Type message
3. Send
4. Receive response
5. Continue conversation
```

### 5.3 Settings Flow
```
1. Open settings
2. Select model
3. Enter API key (optional)
4. Save
5. Agent uses new config
```

## 6. Technical Requirements

### Performance
- Deploy time: <60 seconds
- Chat latency: <500ms
- App load time: <3 seconds
- WebSocket reconnection: <5 seconds

### Reliability
- Uptime: 99.9% (Pro/Elite)
- Container auto-restart
- Error recovery
- Data backup

### Security
- OAuth authentication
- Container isolation
- Data encryption
- Rate limiting

### Scalability
- Horizontal scaling
- Auto-scaling containers
- Load balancing
- Database sharding (future)

## 7. Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| MVP | 4 weeks | Deploy + Chat |
| Billing | 2 weeks | RevenueCat |
| Polish | 2 weeks | UI/UX |
| Launch | 1 week | App Store |

## 8. Success Metrics

| Metric | Target (Month 1) | Target (Month 6) |
|--------|------------------|------------------|
| Users | 100 | 1000 |
| Pro conversion | 5% | 10% |
| Deploy success | 95% | 99% |
| NPS | 50 | 70 |