# Home Credit LAP Qualification Voice Agent

A sophisticated AI voice assistant system for conducting preliminary Loan Against Property (LAP) eligibility checks. The agent handles customer conversations in English or Hindi, collects 7 key data points, validates eligibility in real-time, and seamlessly hands off qualified leads to human loan experts.

## 🎯 Features

- **Bilingual Support**: Seamless English and Hindi conversations with proper gender grammar
- **Intelligent Conversation Flow**: Greeting → Identification → Offer Presentation → Eligibility Check → Handoff
- **Real-time Eligibility Validation**: 7-point checklist with instant disqualification when criteria fail
- **Special Flow Handling**: 
  - Busy/Callback scheduling
  - Existing loan transfer routing
  - Loan amount limit negotiation
  - Professional disqualification messaging
- **Natural Language Understanding**: Extracts facts from conversational utterances (out-of-order, interruptions, corrections)
- **Question Handling**: Answers customer questions about rates, fees, documents, etc. while staying on track
- **Session Management**: Multiple concurrent conversations with state persistence
- **REST API**: Easy integration with voice platforms, chat interfaces, or telephony systems

## 📋 System Requirements

- **Node.js**: v18+ (for ES modules support)
- **npm**: v9+
- **Memory**: 512MB minimum
- **OS**: Windows, macOS, or Linux

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Start the Server

```bash
npm start
```

You'll see:
```
========================================
HOME CREDIT LAP VOICE AGENT
========================================
Server running on port 3000
```

### 3. Open the Web Interface

**Open your browser and go to: http://localhost:3000**

You'll see an interactive web interface where you can:
- ✅ Test conversations in English or Hindi
- ✅ See real-time agent responses
- ✅ Track progress through the 7 questions
- ✅ Test all special flows (disqualification, transfer, etc.)

**No coding required to test!** Just type your responses and see the agent in action.

### 4. Configuration (Optional)

Edit `.env` file if you want to customize:

```env
PORT=3000
NODE_ENV=development
COMPANY_NAME="Home Credit India"
DEFAULT_AGENT_NAME="Priya"
DEFAULT_AGENT_GENDER="female"
LOG_LEVEL=info
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Start New Session

**POST** `/sessions/start`

Start a new conversation with a customer.

**Request Body:**
```json
{
  "customerName": "Rajesh Kumar",
  "agentName": "Priya",
  "agentGender": "female",
  "language": "english"
}
```

**Response:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "response": "Hello, good morning. This is Priya calling from Home Credit India. Am I speaking with Rajesh Kumar?",
  "shouldEndCall": false,
  "state": {
    "stage": "identification",
    "identityVerified": false,
    "offerPresented": false
  }
}
```

#### 2. Send Message

**POST** `/sessions/:sessionId/message`

Send a customer's utterance and receive the agent's response.

**Request Body:**
```json
{
  "message": "Yes, speaking",
  "ragContext": "Optional additional context from RAG system"
}
```

**Response:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "response": "Thank you, Rajesh Kumar. We are calling because, as one of our valued customers, you have a special Loan Against Property offer of up to seventy-five lakh rupees. I would just like to ask a few quick questions to check if this offer suits you. Is that alright?",
  "shouldEndCall": false,
  "needsCallbackTime": false,
  "needsLoanLimitDecision": false,
  "state": {
    "stage": "offer_presentation",
    "callOutcome": "ongoing",
    "identityVerified": true,
    "offerPresented": true,
    "customerConsentedToQuestions": false,
    "checklistProgress": {
      "completed": 0,
      "total": 7
    }
  }
}
```

#### 3. Get Session State

**GET** `/sessions/:sessionId`

Retrieve complete session state and summary.

**Response:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "state": {
    "sessionId": "session_1234567890_abc123",
    "customerName": "Rajesh Kumar",
    "agentName": "Priya",
    "callOutcome": "ongoing",
    "checklist": { ... },
    "conversationHistory": [ ... ]
  },
  "summary": {
    "callOutcome": "ongoing",
    "callDuration": 45000,
    "answeredItems": 3,
    "totalItems": 7,
    "checklistComplete": false
  }
}
```

#### 4. Get Conversation History

**GET** `/sessions/:sessionId/conversation`

Get full conversation transcript.

#### 5. End Session

**DELETE** `/sessions/:sessionId`

End and clean up a session.

#### 6. List All Sessions

**GET** `/sessions`

Get all active sessions.

#### 7. Health Check

**GET** `/health`

Check API health status.

## 💡 Usage Examples

### Example 1: Complete Successful Flow (English)

```bash
# 1. Start session
curl -X POST http://localhost:3000/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Amit Sharma",
    "language": "english"
  }'

# Response: "Hello, good afternoon. This is Priya calling from Home Credit India. Am I speaking with Amit Sharma?"

# 2. Confirm identity
curl -X POST http://localhost:3000/api/sessions/session_xxx/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Yes, speaking"
  }'

# Response: Offer presentation about 75 lakh LAP

# 3. Consent to questions
curl -X POST http://localhost:3000/api/sessions/session_xxx/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Sure, go ahead"
  }'

# Response: "What kind of property is it? Residential, commercial, or industrial?"

# 4. Answer property type
curl -X POST http://localhost:3000/api/sessions/session_xxx/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "It is a residential flat"
  }'

# Response: "Got it. Is the property only in your name, or jointly owned?"

# 5. Continue answering all 7 questions...
# - Ownership: "Only in my name"
# - Documents: "Yes, I have the originals"
# - Loan amount: "I need 50 lakh"
# - Occupation: "I am salaried and income comes to my bank account"
# - Market value: "Property is worth around 1 crore"
# - Tenure: "10 years"

# Final response: Handoff to senior loan expert
```

### Example 2: Hindi Conversation

```javascript
// Start Hindi session
const response = await fetch('http://localhost:3000/api/sessions/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customerName: 'राजेश कुमार',
    language: 'hindi',
    agentGender: 'female'
  })
});

// Agent responds in Hindi with proper gender grammar:
// "नमस्ते, मैं Home Credit India से Priya बोल रही हूँ। क्या मेरी बात राजेश कुमार जी से हो रही है?"
```

### Example 3: Disqualification Flow

```javascript
// Customer has cash income (not eligible)
await fetch(`http://localhost:3000/api/sessions/${sessionId}/message`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "I run a small shop and most earnings are in cash"
  })
});

// Agent immediately disqualifies:
// "I am sorry, since your income is received in cash, you do not meet 
// the criteria for this specific offer at this time. Thank you so much 
// for your time, and have a good day."
// shouldEndCall: true
```

### Example 4: Existing Loan Transfer

```javascript
// Customer mentions existing loan
await fetch(`http://localhost:3000/api/sessions/${sessionId}/message`, {
  method: 'POST',
  headers: { 'Content-Type': application/json' },
  body: JSON.stringify({
    message: "I already have a home loan on this property"
  })
});

// Agent transfers to specialist:
// "Thank you for sharing that. Since you already have an existing loan 
// on the property, this will be handled by our loan transfer specialist. 
// A specialist will contact you shortly."
// shouldEndCall: true
```

## 🏗️ Architecture

```
src/
├── agent/
│   └── AgentOrchestrator.js     # Main per-turn loop orchestrator
├── api/
│   └── routes.js                # Express REST API routes
├── config/
│   ├── config.js                # Environment configuration
│   └── constants.js             # System constants and enums
├── conversation/
│   ├── StageHandlers.js         # Greeting, identification, offer, questions
│   ├── SpecialFlows.js          # Busy, transfer, disqualification, handoff
│   └── QuestionHandler.js       # Customer question answering
├── language/
│   └── LanguageGenerator.js     # Bilingual response generation
├── rules/
│   ├── EligibilityRules.js      # 7-point validation rules
│   └── InputParser.js           # NLU for extracting facts
├── state/
│   ├── AgentState.js            # Session state class
│   └── StateManager.js          # Multi-session management
└── index.js                     # Server entry point
```

## 🔍 Eligibility Rules

### The 7 Checklist Items

1. **Property Type**
   - ✅ Eligible: Residential, Commercial, Industrial
   - ❌ Not Eligible: Agricultural

2. **Ownership**
   - ✅ Eligible: Sole, Joint
   - ❌ Not Eligible: Not an owner

3. **Original Documents**
   - ✅ Eligible: Available
   - ❌ Not Eligible: Not available (lost, photocopies only)

4. **Loan Amount**
   - ✅ Eligible: ≤ ₹75,00,000
   - ⚠️ Special Flow: Above limit (negotiation)

5. **Occupation & Income Mode**
   - ✅ Eligible: (Salaried OR Self-employed) AND Bank income
   - ❌ Not Eligible: Cash income, or unemployed

6. **Market Value**
   - ✅ Eligible: Any estimate (no minimum)

7. **Tenure**
   - ✅ Eligible: 3-15 years inclusive
   - ❌ Not Eligible: < 3 or > 15 years

## 🎬 Conversation Flow

```
START
  ↓
GREETING & IDENTIFICATION
  ↓
[Identity Verified?] → No → [Busy?] → Schedule Callback → END
  ↓ Yes
OFFER PRESENTATION
  ↓
[Customer Consents?] → No → [Not Interested?] → END
  ↓ Yes
ELIGIBILITY CHECKLIST (7 Questions)
  ↓
[Each Answer] → Validate Immediately
  ↓
[Disqualified?] → Yes → Polite Closure → END
  ↓ No
[Existing Loan?] → Yes → Transfer to Specialist → END
  ↓ No
[All 7 Answered & Eligible?] → Yes → HANDOFF to Loan Expert → END
```

## 🛠️ Development

### Project Structure

- **State Management**: Session-based with in-memory storage
- **Conversation Logic**: Rule-based with NLU for fact extraction
- **Language Support**: Template-based generation with gender agreement
- **API Design**: RESTful with clear separation of concerns

### Key Design Principles

1. **One Question Per Turn**: Voice-optimized short responses
2. **Never Re-ask**: Captures facts from any part of conversation
3. **Immediate Validation**: Disqualifies as soon as criteria fail
4. **Transparent AI**: Honestly identifies as AI when asked
5. **Privacy First**: Never asks for sensitive data (PAN, Aadhaar, OTP, passwords)

## 🧪 Testing

### Manual Testing with cURL

```bash
# Start a test session
SESSION_ID=$(curl -s -X POST http://localhost:3000/api/sessions/start \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test User"}' | jq -r '.sessionId')

echo "Session ID: $SESSION_ID"

# Send a message
curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Yes, speaking"}' | jq '.'
```

### Testing Special Flows

```bash
# Test disqualification (agricultural property)
curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"It is agricultural land"}' | jq '.response'

# Test existing loan transfer
curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"I have an existing loan on this property"}' | jq '.response'

# Test busy flow
curl -X POST http://localhost:3000/api/sessions/$SESSION_ID/message \
  -d '{"message":"I am busy right now, call me later"}' | jq '.response'
```

## 🔐 Security Considerations

- No sensitive data collection (PAN, Aadhaar, OTP, passwords)
- Session IDs are randomly generated
- CORS enabled for web client integration
- Input validation on all endpoints
- Graceful error handling

## 📊 Monitoring

The system provides several monitoring endpoints:

- **Health Check**: `GET /api/health` - Server status and uptime
- **Active Sessions**: `GET /api/sessions` - List all ongoing conversations
- **Session Details**: `GET /api/sessions/:sessionId` - Detailed state inspection

## 🚧 Limitations & Future Enhancements

### Current Limitations

- In-memory state storage (sessions lost on restart)
- No authentication/authorization
- Basic NLU (keyword-based extraction)
- No voice synthesis/recognition (text-only API)

### Potential Enhancements

- Database persistence (PostgreSQL, MongoDB)
- Advanced NLU with ML models
- Voice API integration (Twilio, Plivo)
- Analytics dashboard
- Multi-tenancy support
- Rate limiting and security hardening
- Automated testing suite

## 📝 License

MIT

## 👥 Support

For questions or issues, please contact the development team.