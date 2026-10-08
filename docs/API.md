# API Reference

Complete API documentation for the Home Credit LAP Voice Agent.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required. For production use, implement proper authentication.

## Response Format

All endpoints return JSON with the following structure:

**Success Response:**
```json
{
  "sessionId": "string",
  "response": "string",
  "shouldEndCall": boolean,
  "state": { ... }
}
```

**Error Response:**
```json
{
  "error": "string",
  "message": "string"
}
```

## Endpoints

### 1. Start Session

Create a new conversation session.

**Endpoint:** `POST /sessions/start`

**Request Body:**
```json
{
  "customerName": "string (required)",
  "agentName": "string (optional, default: from config)",
  "agentGender": "male|female (optional, default: from config)",
  "language": "english|hindi (optional, default: english)"
}
```

**Success Response (200):**
```json
{
  "sessionId": "session_1234567890_abc123",
  "response": "Hello, good morning. This is Priya calling from Home Credit India...",
  "shouldEndCall": false,
  "state": {
    "stage": "identification",
    "identityVerified": false,
    "offerPresented": false
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing customerName
- `500 Internal Server Error`: Server error

---

### 2. Send Message

Send a customer utterance and receive agent response.

**Endpoint:** `POST /sessions/:sessionId/message`

**URL Parameters:**
- `sessionId` (string, required): The session identifier

**Request Body:**
```json
{
  "message": "string (required)",
  "ragContext": "string (optional)"
}
```

**Success Response (200):**
```json
{
  "sessionId": "session_1234567890_abc123",
  "response": "Thank you. What kind of property is it?",
  "shouldEndCall": false,
  "needsCallbackTime": false,
  "needsLoanLimitDecision": false,
  "state": {
    "stage": "eligibility_check",
    "callOutcome": "ongoing",
    "identityVerified": true,
    "offerPresented": true,
    "customerConsentedToQuestions": true,
    "checklistProgress": {
      "completed": 2,
      "total": 7
    }
  }
}
```

**Special Response Flags:**

- `shouldEndCall`: `true` when conversation should end
- `needsCallbackTime`: `true` when customer is busy (use callback-time endpoint)
- `needsLoanLimitDecision`: `true` when loan amount is above limit (use loan-limit-decision endpoint)

**Error Responses:**
- `400 Bad Request`: Missing message or call already ended
- `404 Not Found`: Session not found
- `500 Internal Server Error`: Server error

---

### 3. Provide Callback Time

Set callback time when customer is busy.

**Endpoint:** `POST /sessions/:sessionId/callback-time`

**URL Parameters:**
- `sessionId` (string, required)

**Request Body:**
```json
{
  "callbackTime": "string (optional, default: anytime)"
}
```

**Example:**
```json
{
  "callbackTime": "tomorrow evening at 6pm"
}
```

**Success Response (200):**
```json
{
  "sessionId": "session_1234567890_abc123",
  "response": "Sure, I will arrange a call back tomorrow evening at 6pm. Thank you for your time.",
  "shouldEndCall": true,
  "callbackTime": "tomorrow evening at 6pm"
}
```

---

### 4. Handle Loan Limit Decision

Handle customer decision when loan amount exceeds ₹75 lakh.

**Endpoint:** `POST /sessions/:sessionId/loan-limit-decision`

**URL Parameters:**
- `sessionId` (string, required)

**Request Body:**
```json
{
  "decision": "string (required)"
}
```

**Examples:**
```json
{ "decision": "yes" }
{ "decision": "yes, 75 lakh is fine" }
{ "decision": "no, I need more" }
```

**Success Response (200) - Accepted:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "response": "Great. Are you salaried, or do you run your own business?",
  "shouldEndCall": false,
  "loanAmountAccepted": true
}
```

**Success Response (200) - Rejected:**
```json
{
  "sessionId": "session_1234567890_abc123",
  "response": "I understand. Since the requirement is above the limit...",
  "shouldEndCall": true,
  "loanAmountAccepted": false
}
```

---

### 5. Get Session State

Retrieve complete session state and summary.

**Endpoint:** `GET /sessions/:sessionId`

**URL Parameters:**
- `sessionId` (string, required)

**Success Response (200):**
```json
{
  "sessionId": "session_1234567890_abc123",
  "state": {
    "sessionId": "session_1234567890_abc123",
    "customerName": "Amit Sharma",
    "agentName": "Priya",
    "agentGender": "female",
    "companyName": "Home Credit India",
    "language": "english",
    "callStartTime": "2024-01-15T10:30:00.000Z",
    "identityVerified": true,
    "offerPresented": true,
    "customerConsentedToQuestions": true,
    "existingLoanFlag": false,
    "callbackTime": null,
    "callOutcome": "ongoing",
    "currentStage": "eligibility_check",
    "checklist": {
      "property_type": {
        "value": "residential",
        "answered": true
      },
      ...
    },
    "conversationHistory": [...]
  },
  "summary": {
    "sessionId": "session_1234567890_abc123",
    "customerName": "Amit Sharma",
    "callOutcome": "ongoing",
    "callDuration": 45000,
    "identityVerified": true,
    "offerPresented": true,
    "checklistComplete": false,
    "answeredItems": 3,
    "totalItems": 7,
    "disqualificationReason": null,
    "existingLoanFlag": false,
    "callbackTime": null
  }
}
```

---

### 6. Get Conversation History

Retrieve complete conversation transcript.

**Endpoint:** `GET /sessions/:sessionId/conversation`

**URL Parameters:**
- `sessionId` (string, required)

**Success Response (200):**
```json
{
  "sessionId": "session_1234567890_abc123",
  "conversation": [
    {
      "speaker": "agent",
      "message": "Hello, good morning...",
      "timestamp": "2024-01-15T10:30:00.000Z"
    },
    {
      "speaker": "customer",
      "message": "Yes, speaking",
      "timestamp": "2024-01-15T10:30:05.000Z"
    }
  ],
  "formatted": "agent: Hello, good morning...\ncustomer: Yes, speaking\n..."
}
```

---

### 7. End Session

End and delete a session.

**Endpoint:** `DELETE /sessions/:sessionId`

**URL Parameters:**
- `sessionId` (string, required)

**Success Response (200):**
```json
{
  "message": "Session ended",
  "sessionId": "session_1234567890_abc123",
  "summary": {
    "callOutcome": "handoff",
    "callDuration": 120000,
    "answeredItems": 7,
    "totalItems": 7,
    "checklistComplete": true
  }
}
```

---

### 8. List All Sessions

Get all active sessions.

**Endpoint:** `GET /sessions`

**Success Response (200):**
```json
{
  "count": 3,
  "sessions": [
    {
      "sessionId": "session_1234567890_abc123",
      "customerName": "Amit Sharma",
      "callOutcome": "ongoing",
      "stage": "eligibility_check",
      "startTime": "2024-01-15T10:30:00.000Z",
      "checklistProgress": {
        "completed": 4,
        "total": 7
      }
    },
    ...
  ]
}
```

---

### 9. Health Check

Check API health and status.

**Endpoint:** `GET /health`

**Success Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:35:00.000Z",
  "activeSessions": 3,
  "uptime": 3600.5
}
```

---

## Call Outcomes

Possible values for `callOutcome`:

- `ongoing`: Conversation in progress
- `handoff`: Successfully qualified, handed off to loan expert
- `disqualified`: Customer does not meet eligibility criteria
- `transfer`: Existing loan, transferred to specialist
- `busy_callback`: Customer busy, callback scheduled
- `not_interested`: Customer not interested
- `wrong_person`: Wrong person contacted
- `no_response`: No response from customer

## Conversation Stages

Possible values for `currentStage`:

- `greeting`: Initial greeting
- `identification`: Identity verification
- `offer_presentation`: Presenting the LAP offer
- `eligibility_check`: Asking eligibility questions
- `special_flow`: In a special flow (busy, transfer, etc.)
- `closing`: Closing the call

## Error Codes

- `400`: Bad Request - Invalid input or session state
- `404`: Not Found - Session does not exist
- `500`: Internal Server Error - Server-side error

## Rate Limiting

Currently no rate limiting is implemented. For production, consider implementing rate limiting to prevent abuse.

## Best Practices

1. **Session Management**: Always delete sessions after completion to free resources
2. **Error Handling**: Handle all error responses gracefully
3. **State Checking**: Check `shouldEndCall` flag after each message
4. **Special Flags**: Handle `needsCallbackTime` and `needsLoanLimitDecision` appropriately
5. **Conversation History**: Use `/conversation` endpoint for debugging and analytics
