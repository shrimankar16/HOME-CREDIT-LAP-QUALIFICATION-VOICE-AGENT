# 🎙️ How to Start the Voice Agent

## Quick Start (3 Steps)

### Step 1: Install Dependencies

Open PowerShell in this folder and run:

```powershell
npm install
```

### Step 2: Start the Server

```powershell
npm start
```

You'll see:
```
========================================
HOME CREDIT LAP VOICE AGENT
========================================
Server running on port 3000
```

### Step 3: Open the Web Interface

Open your browser and go to:

**http://localhost:3000**

You'll see a beautiful web interface where you can:
- Enter customer name
- Choose language (English/Hindi)
- Start a voice conversation
- Type responses and see agent replies in real-time

## 🖥️ Using the Web Interface

1. **Fill in Details:**
   - Customer Name: "Amit Sharma"
   - Language: English or Hindi
   - Agent Gender: Female (Priya) or Male

2. **Click "Start Call"**

3. **Type Your Responses:**
   - Agent: "Hello, good morning. This is Priya calling from Home Credit India. Am I speaking with Amit Sharma?"
   - You: "Yes, speaking"
   - Continue the conversation!

4. **Watch Progress:**
   - See how many questions (0/7 to 7/7) have been answered
   - Real-time conversation display

## 📱 For Real Phone Calls

To use this with actual phone calls, you need to integrate with a telephony service:

### Option A: Twilio (Recommended)

1. **Sign up at Twilio.com**
2. **Get a phone number**
3. **Install Twilio SDK:**
   ```bash
   npm install twilio
   ```
4. **Configure webhook** to point to your API
5. Twilio will send voice to text → Your API → Text to voice

### Option B: Exotel (India)

1. Sign up at Exotel.com
2. Get Indian phone number
3. Configure API webhooks
4. Similar integration as Twilio

### Option C: Build Your Own Integration

The system provides REST API endpoints. You can:
1. Use speech-to-text service (Google, Azure, AWS)
2. Send text to your API
3. Use text-to-speech for response
4. Play back to caller

## 🧪 Testing Different Scenarios

### Test 1: Successful Qualification
```
You: Yes, speaking
You: Go ahead
You: It's a residential flat
You: Only in my name
You: Yes, originals available
You: I need 50 lakh
You: Salaried, bank account
You: Around 1 crore
You: 10 years
```
Result: ✅ Handoff to loan expert

### Test 2: Disqualification (Cash Income)
```
You: Yes
You: Sure
You: Residential house
You: Mine
You: Yes
You: 40 lakh
You: I have a shop, most income is cash
```
Result: ❌ Immediately disqualified

### Test 3: Existing Loan (Transfer)
```
You: Yes
You: Tell me more
You: Residential flat
You: I already have a home loan on this property
```
Result: 🔄 Transferred to specialist

### Test 4: Busy (Callback)
```
You: I'm in a meeting, call me later
You: Tomorrow at 6pm
```
Result: 📅 Callback scheduled

### Test 5: Hindi Conversation
Select "Hindi" language and try:
```
You: हाँ, बोलिए
You: ठीक है
You: घर है
You: सिर्फ़ मेरे नाम पर
You: हाँ, उपलब्ध हैं
You: पचास लाख
You: नौकरी करता हूँ, बैंक में आती है
You: एक करोड़
You: दस साल
```

## 🔧 Troubleshooting

### "Cannot connect to API server"
- Make sure you ran `npm start`
- Check if you see "Server running on port 3000"
- Try refreshing the browser

### "Port 3000 already in use"
1. Find what's using it:
   ```powershell
   netstat -ano | findstr :3000
   ```
2. Kill that process or change port in `.env`:
   ```
   PORT=3001
   ```

### "Module not found"
Run:
```powershell
npm install
```

## 📊 Monitoring Your Calls

While the server is running, you can check:

**Health Status:**
```
http://localhost:3000/api/health
```

**All Active Sessions:**
```
http://localhost:3000/api/sessions
```

## 🚀 What's Happening Behind the Scenes

1. **You type a message** → Sent to Express API
2. **Agent Orchestrator** → Runs the per-turn loop:
   - Safety checks (busy, not interested, existing loan)
   - Extract facts from your message
   - Validate against eligibility rules
   - Generate appropriate response
3. **Response displayed** → You see agent's reply
4. **State updated** → Progress tracked

## 📞 Architecture

```
You (Web Interface)
    ↓
Express API Server
    ↓
Agent Orchestrator
    ↓
├─ State Management (tracks conversation)
├─ Eligibility Rules (validates answers)
├─ Input Parser (understands your text)
└─ Language Generator (creates responses)
```

## 🎯 Next Steps

1. **Try all test scenarios** above
2. **Test both English and Hindi**
3. **Try asking questions** like "What is the interest rate?"
4. **Test disqualification flows**
5. **Read the full documentation** in README.md

## 💡 Tips

- Type naturally, the parser understands conversational language
- You can answer multiple questions in one message
- Try correcting yourself (it handles corrections)
- Ask questions anytime (it will answer and continue)
- The agent never re-asks what you've already said

Enjoy testing your voice agent! 🎉
