# 🎉 HOME CREDIT LAP VOICE AGENT - START HERE

## What You Have

A complete **AI Voice Agent** that makes **real phone calls** to customers and qualifies them for Loan Against Property (LAP) offers.

---

## 🎯 Two Ways to Use This

### 1️⃣ **Text Testing** (Start Now - 2 Minutes)

Test the conversation logic with text (no phone calls yet):

```powershell
npm install
npm start
```

Open: **http://localhost:3001**

Type messages and see AI responses instantly!

---

### 2️⃣ **Real Phone Calls** (Setup - 10 Minutes)

Make actual voice calls where AI calls customers:

**Read:** `VOICE_CALLS_QUICKSTART.md`

**Steps:**
1. Sign up for Twilio (FREE $15 credit)
2. Add credentials to `.env`
3. Setup ngrok (make server public)
4. Make calls!

---

## 📚 Documentation

| File | What It's For |
|------|---------------|
| **START_HERE.md** | ← You are here! Quick overview |
| **VOICE_CALLS_QUICKSTART.md** | 10-minute guide to make phone calls |
| **PHONE_CALL_SETUP.md** | Detailed phone call setup |
| **README.md** | Full system documentation |
| **HOW_TO_START.md** | Web interface testing guide |
| **docs/API.md** | Complete API reference |
| **docs/SYSTEM_DESIGN.md** | How it all works internally |

---

## 🚀 Quick Commands

```powershell
# Install
npm install

# Start server
npm start

# Run examples
node examples/example-conversation.js
node examples/example-hindi.js
node examples/example-special-flows.js
```

---

## 🎯 What It Does

✅ **Makes phone calls** to customers  
✅ **Speaks in voice** (English & Hindi)  
✅ **Asks 7 questions** to check eligibility  
✅ **Validates answers** in real-time  
✅ **Disqualifies** when criteria fail  
✅ **Hands off** qualified leads to experts  
✅ **Records calls** for quality  

---

## 🔥 Try It Now!

### Fastest Way (No Setup):

```powershell
npm install
npm start
```

Open **http://localhost:3001** and test with text!

### For Real Calls:

Follow **VOICE_CALLS_QUICKSTART.md** (10 minutes)

---

## 💡 Choose Your Path

**Just Testing?**  
→ Use web interface (text mode)  
→ No setup needed!  

**Need Real Calls?**  
→ Follow VOICE_CALLS_QUICKSTART.md  
→ Get Twilio account (FREE trial)  
→ Make actual phone calls!  

---

## 🆘 Need Help?

- **For text testing:** Read `HOW_TO_START.md`
- **For phone calls:** Read `VOICE_CALLS_QUICKSTART.md`
- **For APIs:** Read `docs/API.md`
- **For architecture:** Read `docs/SYSTEM_DESIGN.md`

---

## 📞 What Happens in a Call?

1. AI **calls customer's phone**
2. Customer **answers**
3. AI **introduces itself**: "Hello, this is Priya from Home Credit..."
4. AI **presents offer**: "75 lakh LAP offer..."
5. AI **asks 7 questions**:
   - Property type
   - Ownership
   - Documents
   - Loan amount
   - Occupation & income
   - Market value
   - Tenure
6. AI **validates each answer** immediately
7. AI **ends call** with:
   - ✅ Handoff (qualified)
   - ❌ Disqualification (not eligible)
   - 🔄 Transfer (existing loan)
   - 📅 Callback (busy)

---

**Ready? Pick your mode and get started!** 🚀

Text Mode: `npm start` → http://localhost:3001  
Phone Mode: Read `VOICE_CALLS_QUICKSTART.md`
