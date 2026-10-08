# Quick Start Guide

Get the Home Credit LAP Voice Agent running in 5 minutes!

## 1. Prerequisites Check

```bash
# Check Node.js version (need v18+)
node --version

# Check npm
npm --version
```

Don't have Node.js? Download from [nodejs.org](https://nodejs.org)

## 2. Install Dependencies

```bash
# Install all packages
npm install
```

## 3. Configuration (Optional)

```bash
# Copy environment template
cp .env.example .env

# Edit if needed (defaults work fine)
# notepad .env  (Windows)
```

Default configuration:
- Port: 3000
- Agent Name: Priya
- Agent Gender: Female
- Company: Home Credit India

## 4. Start the Server

```bash
npm start
```

You should see:
```
========================================
HOME CREDIT LAP VOICE AGENT
========================================
Server running on port 3000
Environment: development
Company: Home Credit India
Default Agent: Priya (female)
========================================
```

## 5. Test with cURL

Open a new terminal and try this:

```bash
# Start a conversation
curl -X POST http://localhost:3000/api/sessions/start \
  -H "Content-Type: application/json" \
  -d "{\"customerName\":\"John Doe\"}"
```

You'll get a response like:
```json
{
  "sessionId": "session_1234567890_abc123",
  "response": "Hello, good morning. This is Priya calling from Home Credit India. Am I speaking with John Doe?",
  "shouldEndCall": false
}
```

Save the `sessionId` and continue:

```bash
# Replace SESSION_ID with your actual session ID
curl -X POST http://localhost:3000/api/sessions/SESSION_ID/message \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"Yes, speaking\"}"
```

## 6. Try the Examples

We've included ready-to-run examples:

```bash
# Complete successful conversation
node examples/example-conversation.js

# Hindi conversation
node examples/example-hindi.js

# Special flows (disqualification, transfer, etc.)
node examples/example-special-flows.js
```

## 7. Explore the API

Open your browser:
- API Documentation: http://localhost:3000/
- Health Check: http://localhost:3000/api/health
- View All Sessions: http://localhost:3000/api/sessions

## Common Commands

```bash
# Start server
npm start

# Stop server
Ctrl + C

# View all sessions
curl http://localhost:3000/api/sessions

# Check health
curl http://localhost:3000/api/health
```

## Quick API Reference

### Start Session
```bash
POST /api/sessions/start
Body: { "customerName": "Name", "language": "english" }
```

### Send Message
```bash
POST /api/sessions/:sessionId/message
Body: { "message": "Customer's response" }
```

### Get Session
```bash
GET /api/sessions/:sessionId
```

### End Session
```bash
DELETE /api/sessions/:sessionId
```

## Test Scenarios

### 1. Successful Qualification

```bash
SESSION_ID=$(curl -s -X POST http://localhost:3000/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test User"}' | jq -r '.sessionId')

# Answer all 7 questions with eligible responses
curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"Yes"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"Go ahead"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"Residential flat"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"Only mine"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"Yes, originals available"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"50 lakh"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"Salaried, bank account"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"1 crore"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"10 years"}' | jq '.response'

# Should get handoff message!
```

### 2. Disqualification (Cash Income)

```bash
SESSION_ID=$(curl -s -X POST http://localhost:3000/api/sessions/start \
  -d '{"customerName":"Test"}' -H "Content-Type: application/json" | jq -r '.sessionId')

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"Yes"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"Sure"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"Residential"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"Mine"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"Yes"}' | jq '.response'

curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"40 lakh"}' | jq '.response'

# Cash income - immediate disqualification
curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"Business, cash"}' | jq '.response'
```

## Troubleshooting

### Port Already in Use

```bash
# Find what's using port 3000
# Windows
netstat -ano | findstr :3000

# Change port in .env
PORT=3001
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Can't Connect

```bash
# Check if server is running
curl http://localhost:3000/api/health

# Check firewall settings
```

## Next Steps

1. **Read the Documentation**
   - [README.md](README.md) - Full feature list and setup
   - [docs/API.md](docs/API.md) - Complete API reference
   - [docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md) - Architecture details

2. **Try the Examples**
   - Run all example scripts in `/examples` folder
   - Modify them to test your own scenarios

3. **Integrate with Your System**
   - Use the REST API in your voice platform
   - Connect to your telephony system
   - Build a web chat interface

## Support

Having issues? Check:
1. Node.js version is v18+
2. All dependencies installed (`npm install`)
3. Port 3000 is not in use
4. Server is running (`npm start`)

## What's Next?

Now that you have it running:

✅ Test different conversation flows
✅ Try Hindi conversations
✅ Explore the API endpoints
✅ Read the system design
✅ Integrate with your voice platform

Happy coding! 🚀
