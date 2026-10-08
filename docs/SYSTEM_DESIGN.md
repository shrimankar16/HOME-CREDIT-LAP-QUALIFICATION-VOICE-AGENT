# System Design Document

## Overview

The Home Credit LAP Qualification Voice Agent is a stateful conversation system that conducts preliminary loan eligibility checks through natural voice/text interactions. It implements a rule-based approach with natural language understanding for fact extraction.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Voice/Chat     │
│  Integration    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   REST API      │
│  (Express.js)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Agent       │
│  Orchestrator   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐  ┌────────┐
│ State  │  │ Rules  │
│Manager │  │Engine  │
└────────┘  └────────┘
```

### Component Architecture

```
┌──────────────────────────────────────────┐
│           Agent Orchestrator              │
│  (Per-turn loop, safety checks, flow)    │
└──────────────────┬───────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│   Stage      │      │   Special    │
│  Handlers    │      │    Flows     │
└──────────────┘      └──────────────┘
        │                     │
        └──────────┬──────────┘
                   ▼
        ┌────────────────────┐
        │  Language Generator │
        │  Question Handler   │
        └────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│   Input      │      │ Eligibility  │
│   Parser     │      │    Rules     │
└──────────────┘      └──────────────┘
        │                     │
        └──────────┬──────────┘
                   ▼
        ┌────────────────────┐
        │   Agent State      │
        │  State Manager     │
        └────────────────────┘
```

## Core Components

### 1. Agent Orchestrator

**Purpose**: Main coordinator implementing the per-turn loop

**Responsibilities**:
- Execute safety checks in priority order
- Extract facts from customer utterances
- Validate eligibility in real-time
- Route to appropriate flows
- Build responses
- Maintain conversation coherence

**Key Methods**:
- `processTurn()`: Main per-turn loop
- `buildResponse()`: Constructs agent responses
- `updateStateWithExtractedItems()`: Updates state from parsed facts

### 2. State Management

#### AgentState Class

**Purpose**: Represents a single conversation session

**State Components**:
```javascript
{
  // Session metadata
  sessionId, customerName, agentName, agentGender, language,
  
  // Timestamps
  callStartTime, currentDate, currentDay, currentTime,
  
  // Call state
  identityVerified, offerPresented, customerConsentedToQuestions,
  existingLoanFlag, callbackTime, callOutcome, currentStage,
  
  // The 7 checklist items
  checklist: {
    property_type: { value, answered },
    ownership: { value, answered },
    original_docs: { value, answered },
    loan_amount: { value, answered },
    occupation: { occupation_type, income_mode, answered },
    market_value: { value, answered },
    tenure_years: { value, answered }
  },
  
  // History
  conversationHistory: [{ speaker, message, timestamp }],
  additionalContext, disqualificationReason
}
```

#### StateManager Class

**Purpose**: Manages multiple concurrent sessions

**Features**:
- Session creation and retrieval
- Session lifecycle management
- Session cleanup (optional)
- Multi-session support

### 3. Conversation Handlers

#### Stage Handlers

**Purpose**: Manages conversation stages

**Stages**:
1. **Greeting & Identification**: Verify speaking with correct person
2. **Offer Presentation**: Present LAP offer, get consent
3. **Eligibility Check**: Ask 7 questions in order

#### Special Flows

**Purpose**: Handles non-standard conversation paths

**Flows**:
1. **Busy Flow**: Schedule callback when customer is busy
2. **Transfer Flow**: Route to specialist for existing loans
3. **Disqualification Flow**: Polite closure when ineligible
4. **Loan Limit Flow**: Negotiate when amount > ₹75L
5. **Handoff Flow**: Transfer to loan expert when qualified

#### Question Handler

**Purpose**: Answers customer questions

**Approach**:
- Detect question type
- Provide brief (1-2 sentence) answer
- Redirect back to checklist
- Never reveal information agent shouldn't have

### 4. Rules Engine

#### EligibilityRules

**Purpose**: Validates checklist items against criteria

**Validation Rules**:
```javascript
validatePropertyType(type)
  ✓ residential, commercial, industrial
  ✗ agricultural, other

validateOwnership(ownership)
  ✓ sole, joint
  ✗ not an owner

validateOriginalDocuments(status)
  ✓ available
  ✗ not available

validateLoanAmount(amount)
  ✓ ≤ ₹75,00,000
  ⚠ > ₹75,00,000 (special flow)

validateOccupationAndIncome(occupation, income)
  ✓ (salaried OR self-employed) AND bank
  ✗ cash income, unemployed

validateMarketValue(value)
  ✓ any estimate

validateTenure(years)
  ✓ 3 to 15 years inclusive
  ✗ < 3 or > 15 years
```

#### InputParser

**Purpose**: Extracts structured facts from natural language

**Approach**:
- Keyword-based pattern matching
- Multi-lingual (English + Hindi)
- Handles fillers, corrections, out-of-order answers
- Extracts multiple facts from single utterance

**Methods**:
```javascript
parsePropertyType(utterance)
parseOwnership(utterance)
parseDocumentStatus(utterance)
parseLoanAmount(utterance)
parseOccupationType(utterance)
parseIncomeMode(utterance)
parseMarketValue(utterance)
parseTenure(utterance)
extractAllItems(utterance)  // Extract all at once
```

### 5. Language Generation

#### LanguageGenerator

**Purpose**: Generates responses in English or Hindi

**Features**:
- Gender-specific grammar (male/female verb forms)
- Natural spoken style
- Short sentences for voice
- Varied acknowledgments

**Key Patterns**:

**English**:
```
"What kind of property is it?"
"Thank you. Is the property in your name?"
```

**Hindi (Female)**:
```
"आपकी प्रॉपर्टी किस तरह की है?"
"धन्यवाद। क्या प्रॉपर्टी सिर्फ़ आपके नाम पर है?"
(Uses: बोल रही हूँ, समझती हूँ, पूछ सकती हूँ)
```

**Hindi (Male)**:
```
(Uses: बोल रहा हूँ, समझता हूँ, पूछ सकता हूँ)
```

## The Per-Turn Loop

Based on Section 6 of the system prompt:

```
FOR EACH CUSTOMER UTTERANCE:

STEP 1: READ
  ├─ conversation_history + customer_utterance
  └─ Rebuild state

STEP 2: SAFETY / EXIT CHECKS (in order)
  ├─ Abusive / do not call? → End
  ├─ Busy? → Busy Flow
  ├─ Not interested? → End
  └─ Existing loan mentioned? → Transfer Flow

STEP 3: EXTRACT
  └─ Pull ALL checklist facts from utterance

STEP 4: EVALUATE
  ├─ Any item fails? → Disqualification Flow
  ├─ Loan amount > 75L? → Loan Limit Flow
  └─ Item ambiguous? → Ask clarification

STEP 5: ANSWER QUESTION
  └─ If customer asked question → Brief answer

STEP 6: FIND FIRST MISSING ITEM
  ├─ Any item missing? → Ask it
  └─ All answered & pass? → Handoff Flow

STEP 7: SELF-CHECK
  └─ Validate before speaking
```

## Data Flow

### Conversation Flow

```
User Message
     ↓
REST API Endpoint
     ↓
AgentOrchestrator.processTurn()
     ↓
┌─────────────────────┐
│  Safety Checks      │
│  (abusive, busy,    │
│   not interested,   │
│   existing loan)    │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  InputParser        │
│  Extract all facts  │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Update State       │
│  with extracted     │
│  items              │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  EligibilityRules   │
│  Validate each      │
│  answered item      │
└──────────┬──────────┘
           ↓
   ┌───────┴────────┐
   │ Disqualified?  │
   └───────┬────────┘
     No    │    Yes
           ↓         ↓
    ┌─────────┐  ┌──────────────┐
    │Continue │  │Disqualification│
    └────┬────┘  │     Flow      │
         ↓       └───────────────┘
┌─────────────────────┐
│  Question Handler   │
│  Answer if customer │
│  asked something    │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│  Find Next Missing  │
│  Checklist Item     │
└──────────┬──────────┘
           ↓
   ┌───────┴────────┐
   │ All answered?  │
   └───────┬────────┘
     No    │    Yes
           ↓         ↓
    ┌─────────┐  ┌──────────┐
    │Ask next │  │ Handoff  │
    │question │  │   Flow   │
    └────┬────┘  └──────────┘
         ↓
  Generate Response
         ↓
  Update conversation history
         ↓
  Return to API
```

## State Transitions

```
START
  ↓
GREETING
  ↓
IDENTIFICATION → [Wrong person] → END
  ↓ [Verified]   [Busy] → BUSY_CALLBACK → END
OFFER_PRESENTATION
  ↓ [Consented]  [Not interested] → END
ELIGIBILITY_CHECK
  ↓
[For each answer]
  ├─ Disqualified? → DISQUALIFIED → END
  ├─ Existing loan? → TRANSFER → END
  ├─ Above limit? → LOAN_LIMIT → [Accept] Continue
  │                               [Reject] END
  └─ Continue
  ↓
[All 7 answered & eligible?]
  ↓
HANDOFF → END
```

## Design Decisions

### 1. In-Memory State

**Decision**: Use in-memory Map for session storage

**Rationale**:
- Simplicity for MVP
- Fast access
- No external dependencies

**Trade-offs**:
- Sessions lost on restart
- Not suitable for distributed systems
- Limited by memory

**Future**: Add database persistence (Redis, PostgreSQL)

### 2. Rule-Based NLU

**Decision**: Keyword-based fact extraction

**Rationale**:
- Predictable behavior
- No training data required
- Easy to debug and maintain
- Sufficient for structured conversation

**Trade-offs**:
- Less flexible than ML models
- May miss complex utterances
- Requires manual pattern updates

**Future**: Integrate LLM or NLU service for better understanding

### 3. Synchronous API

**Decision**: Request-response REST API

**Rationale**:
- Simple integration
- Stateless design
- Well-understood

**Trade-offs**:
- Not ideal for real-time voice
- No push notifications

**Future**: Add WebSocket support for real-time

### 4. Single Language Generator

**Decision**: Template-based generation with conditionals

**Rationale**:
- Full control over responses
- Consistent voice and tone
- Easy to review and update

**Trade-offs**:
- More code for each response
- Less dynamic

## Performance Considerations

### Current Performance

- **Response Time**: < 10ms per turn (in-memory)
- **Concurrent Sessions**: Limited by memory (~1000s)
- **Memory per Session**: ~10KB

### Bottlenecks

1. **State Storage**: In-memory limits scalability
2. **Input Parsing**: Sequential pattern matching
3. **No Caching**: Regenerates responses each time

### Optimization Opportunities

1. Add Redis for distributed sessions
2. Cache common responses
3. Batch process for analytics
4. Add CDN for static content

## Security Considerations

### Current Security

✓ No sensitive data collection (no PAN, Aadhaar, OTP, passwords)
✓ Input validation on API endpoints
✓ Graceful error handling
✓ CORS enabled for web clients

### Security Gaps

⚠ No authentication/authorization
⚠ No rate limiting
⚠ No request signing
⚠ No encryption at rest

### Recommended Additions

1. API key authentication
2. Rate limiting per client
3. Input sanitization
4. HTTPS enforcement
5. Audit logging

## Monitoring & Observability

### Current Capabilities

- Health check endpoint
- Session count
- Conversation history per session
- Call outcome tracking

### Recommended Additions

1. **Metrics**:
   - Calls per outcome type
   - Average call duration
   - Disqualification reasons distribution
   - Question-specific drop-off rates

2. **Logging**:
   - Structured logging (JSON)
   - Log levels
   - Request/response logging
   - Error tracking

3. **Alerting**:
   - High error rates
   - Slow response times
   - Memory usage spikes

## Testing Strategy

### Unit Tests

- EligibilityRules validation
- InputParser extraction
- LanguageGenerator output
- State management

### Integration Tests

- Complete conversation flows
- Special flows
- Multi-session handling

### End-to-End Tests

- API endpoint testing
- Full conversation scenarios
- Error handling

## Deployment

### Prerequisites

- Node.js v18+
- 512MB RAM minimum
- Port 3000 available

### Steps

```bash
npm install
cp .env.example .env
npm start
```

### Production Considerations

1. Use process manager (PM2, systemd)
2. Set up reverse proxy (Nginx)
3. Enable HTTPS
4. Configure logging
5. Set up monitoring
6. Database for persistence
7. Load balancing for scale

## Future Enhancements

### Short Term

1. Database persistence (Redis/PostgreSQL)
2. Basic analytics dashboard
3. Webhook notifications
4. Rate limiting

### Medium Term

1. ML-based NLU
2. Voice API integration (Twilio, Plivo)
3. Multi-tenancy support
4. A/B testing framework

### Long Term

1. Advanced conversation AI
2. Multi-language support beyond Hindi/English
3. Voice biometrics
4. Real-time coaching for human agents
