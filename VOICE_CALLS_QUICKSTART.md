# 🚀 Quick Start: Real Phone Calls in 10 Minutes

Follow these steps to make your first AI voice call!

---

## Step 1: Install Dependencies (2 min)

```powershell
npm install
```

---

## Step 2: Get Twilio (FREE) (3 min)

1. Go to **https://www.twilio.com/try-twilio**
2. Sign up (email + password)
3. Verify your phone number
4. You get **$15 FREE credit!**

---

## Step 3: Get Your Credentials (1 min)

In Twilio Dashboard:

1. **Account SID**: Copy it (starts with `AC...`)
2. **Auth Token**: Click "View" and copy
3. **Phone Number**: Click "Get a Trial Number" → Copy it

---

## Step 4: Update .env File (1 min)

Open `.env` in your project folder and add:

```env
TWILIO_ACCOUNT_SID=AC your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+15551234567
```

Paste your actual values!

---

## Step 5: Set Up ngrok (2 min)

Download from **https://ngrok.com/**

```powershell
# Extract ngrok.exe to your folder
# Run it:
.\ngrok.exe http 3001
```

Copy the `https://xxxxx.ngrok.io` URL

Add to `.env`:
```env
WEBHOOK_BASE_URL=https://xxxxx.ngrok.io/api
```

---

## Step 6: Start Server (10 seconds)

```powershell
npm start
```

Look for:
```
✓ Twilio voice calling enabled
```

---

## Step 7: Make Your First Call! (1 min)

### Option A: Web Interface

1. Open **http://localhost:3001/call.html**
2. Enter:
   - Phone: Your phone number with `+91` (India)
   - Name: Your name
   - Language: English
3. Click **"Make Call"**

### Option B: Command Line

```powershell
curl -X POST http://localhost:3001/api/voice/make-call `
  -H "Content-Type: application/json" `
  -d '{
    "phoneNumber": "+919876543210",
    "customerName": "Test User",
    "language": "english"
  }'
```

---

## ✅ Your Phone Will Ring!

The AI agent will:
1. 📞 Call your phone
2. 🗣️ Greet you professionally
3. ❓ Ask the 7 qualification questions
4. ✅ Process your answers in real-time
5. 👋 End with appropriate message

---

## 💡 Important Notes

### Free Trial Limitations

- **Verified Numbers Only**: Add your test number in Twilio → Verified Caller IDs
- **Trial Message**: Calls start with "You have a trial account" message
- **$15 Credit**: Enough for ~300 minutes of calls

### Verify Your Test Number

1. Twilio Console → Phone Numbers → Verified Caller IDs
2. Click "+" to add number
3. Enter your phone number
4. Verify with SMS code

---

## 🎙️ During the Call

**Speak naturally!**

Agent: "Am I speaking with Test User?"
You: "Yes, speaking"

Agent: "What kind of property?"
You: "Residential flat"

And so on... The AI understands natural conversation!

---

## 🐛 Troubleshooting

### "Twilio not configured"
→ Check `.env` has correct credentials
→ Restart server

### "Call not connecting"
→ Phone number format: `+919876543210`
→ Verify number in Twilio console

### ngrok not working
→ Make sure it's running: `.\ngrok.exe http 3001`
→ Update `WEBHOOK_BASE_URL` in `.env`

---

## 🎯 What You Get

✅ **Real phone calls** to any number  
✅ **Speech recognition** (customer talks, AI understands)  
✅ **Natural voice** (AI speaks back)  
✅ **Bilingual** (English & Hindi)  
✅ **Automatic qualification** (7 questions + eligibility rules)  
✅ **Call recording** (stored in Twilio)  
✅ **SMS notifications** (optional)  

---

## 📈 Ready for Production?

When ready for real business use:

1. **Upgrade Twilio account** (add payment)
2. **Deploy to cloud** (AWS, Azure, etc.)
3. **Use production domain** (not ngrok)
4. **Get local numbers** (Indian numbers for better trust)

See **PHONE_CALL_SETUP.md** for full production guide.

---

**That's it! You now have a fully functional AI voice agent making real phone calls!** 🎉

Test it out and see the magic happen! 📞
