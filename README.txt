===============================================================================
HOME CREDIT LAP VOICE AGENT
===============================================================================

A professional voice agent built with Retell AI to handle preliminary 
qualification calls for Home Credit's Loan Against Property (LAP) product.

===============================================================================
TRY IT NOW
===============================================================================

🎙️ PUBLIC DEMO LINK:
https://agent.retellai.com/orb/agent_1cd6d1d0c3693d8b4b8d3cdf7d?token=dfd704750d4b7c94e96e79a662ead283

Click the link above to test the live agent directly in your browser!
No installation or setup required.

===============================================================================
OVERVIEW
===============================================================================

This voice agent conducts preliminary qualification assessments for customers 
interested in Home Credit's Loan Against Property offer (up to ₹75 lakh). 

It collects essential information, handles edge cases, and determines 
preliminary eligibility before handing off to senior loan experts.

===============================================================================
KEY FEATURES
===============================================================================

CORE CAPABILITIES
-----------------
✅ Professional, warm conversation style in English
✅ Collects 8 required data points for LAP qualification
✅ Handles loan amounts up to ₹75 lakh
✅ Validates and confirms all collected information
✅ Provides preliminary qualification assessment

ADVANCED HANDLING
-----------------
✅ Unclear Answers: Clarifies ambiguous responses without making assumptions
✅ Interruptions: Gracefully handles customer interruptions and maintains context
✅ Out-of-Order Replies: Accepts information in any sequence while tracking completeness
✅ Busy Customers: Offers callback scheduling when customers have time constraints
✅ Callback Requests: Confirms callback details and expectations
✅ Existing Loans: Handles balance transfer cases and calculates available top-up amounts
✅ Amount Over Limit: Clearly explains ₹75 lakh limit and offers alternatives
✅ Immediate Disqualification: Politely disqualifies when criteria aren't met
✅ Missing Information: Schedules follow-up when customers lack required details

COMPLIANCE & SAFETY
-------------------
❌ Never promises final loan approval
❌ Never quotes specific interest rates
❌ Never guarantees disbursement timelines
❌ Never processes incomplete applications
❌ Never makes assumptions about unclear answers
✅ Always sets clear expectations about next steps
✅ Always hands off to senior experts after preliminary qualification

===============================================================================
INFORMATION COLLECTED
===============================================================================

The agent collects these 8 required data points:

1. Property Type - Residential or Commercial
2. Property Ownership - Self-owned or Co-owned
3. Original Documents - Availability of title/sale deed (DISQUALIFIER if unavailable)
4. Requested Loan Amount - Amount customer needs (up to ₹75 lakh)
5. Occupation - Salaried, Self-employed, or Business owner
6. Income Receipt Method - Bank transfer, Cash, Cheque, or Mixed
7. Approximate Market Value - Current property valuation estimate
8. Preferred Repayment Tenure - Desired loan duration (1-15 years)

===============================================================================
PROJECT STRUCTURE
===============================================================================

HOME-CREDIT-LAP-QUALIFICATION-VOICE-AGENT/
│
├── README.txt                           ← You are here
├── QUICK-START.txt                      ← 15-minute deployment guide
├── .gitignore                           ← Git ignore rules
│
├── config/                              ← Configuration files
│   ├── agent-prompt.txt                 ← Main AI prompt (copy to Retell)
│   ├── retell-config.json               ← Complete Retell configuration
│   └── retell-export-v0.json            ← Exported agent configuration
│
└── docs/                                ← Documentation
    └── test-scenarios.txt               ← 25 test scenarios

===============================================================================
QUICK START
===============================================================================

OPTION 1: TRY THE DEMO (Fastest - 2 minutes)
---------------------------------------------
1. Open this link in your browser:
   https://agent.retellai.com/orb/agent_1cd6d1d0c3693d8b4b8d3cdf7d?token=dfd704750d4b7c94e96e79a662ead283

2. Click "Start Call" and allow microphone access

3. Have a conversation with the agent

4. Try different scenarios from docs/test-scenarios.txt


OPTION 2: DEPLOY YOUR OWN (15 minutes)
---------------------------------------
See QUICK-START.txt for step-by-step deployment instructions.

Summary:
1. Sign up at https://www.retellai.com/
2. Create new agent in dashboard
3. Copy content from config/agent-prompt.txt
4. Paste into System Prompt field
5. Configure voice settings
6. Test and deploy

===============================================================================
TESTING
===============================================================================

The agent has been tested with 25 different scenarios including:

✅ Standard qualification (happy path)
✅ Customer requests more than ₹75 lakh
✅ Customer missing original documents
✅ Busy customer requests callback
✅ Existing loan / balance transfer cases
✅ Unclear or ambiguous answers
✅ Out-of-order information
✅ Interruptions during conversation
✅ Questions about interest rates
✅ Questions about processing time
✅ Requests for guaranteed approval

See docs/test-scenarios.txt for complete test cases.

===============================================================================
DISQUALIFICATION CRITERIA
===============================================================================

The agent will politely disqualify and offer alternatives when:

- Customer doesn't have original property documents
- Requested amount exceeds ₹75 lakh and customer declines to proceed
- Property type is ineligible (agricultural land, undeveloped plot)

Disqualified customers are offered callbacks and senior expert consultations.

===============================================================================
FILES REFERENCE
===============================================================================

README.txt (this file)
    Overview, features, and quick navigation

QUICK-START.txt
    Step-by-step guide to deploy your own agent in 15 minutes

config/agent-prompt.txt
    Complete AI prompt - copy this to Retell dashboard
    Contains all conversation flows, edge cases, and rules

config/retell-config.json
    Technical configuration for Retell API
    Voice settings, analytics, and advanced options

config/retell-export-v0.json
    Exported agent configuration from Retell
    Can be imported directly into Retell dashboard

docs/test-scenarios.txt
    25 comprehensive test scenarios
    Covers all edge cases and special situations

.gitignore
    Protects API keys and sensitive data

===============================================================================
CUSTOMIZATION
===============================================================================

MODIFYING THE PROMPT
--------------------
Edit config/agent-prompt.txt to:
- Adjust tone and personality
- Add/remove qualification criteria
- Modify loan amount limits
- Change disqualification rules
- Add new edge cases

ADJUSTING VOICE SETTINGS
-------------------------
Edit config/retell-config.json to:
- Change voice provider or voice ID
- Adjust speaking speed and temperature
- Modify interruption sensitivity
- Add/remove backchannel words
- Configure expressive mode settings

ADDING CUSTOM FIELDS
---------------------
Add fields to "post_call_analysis_data" in config/retell-config.json to track:
- Additional customer information
- Internal tags or categories
- Lead quality scores
- Routing preferences

===============================================================================
BEST PRACTICES
===============================================================================

FOR OPTIMAL PERFORMANCE
-----------------------
1. Keep prompts concise - Retell works best with clear, direct instructions
2. Test thoroughly - Try edge cases before production deployment
3. Monitor call quality - Review call recordings and transcripts regularly
4. Update prompt iteratively - Refine based on real-world performance
5. Set proper expectations - Always clarify what the agent can and cannot do

FOR BETTER CUSTOMER EXPERIENCE
-------------------------------
1. Use natural language - Avoid robotic or overly formal phrasing
2. Show empathy - Acknowledge customer concerns and constraints
3. Be transparent - Clearly state preliminary nature of qualification
4. Confirm information - Always validate collected data with customer
5. Offer alternatives - Provide options when disqualifying

===============================================================================
TROUBLESHOOTING
===============================================================================

AGENT NOT UNDERSTANDING INDIAN TERMS
-------------------------------------
Solution: Add terms to boosted keywords (lakh, crore, rupees)
         Set vocab specialization to "finance"

CALL ENDING TOO QUICKLY
-----------------------
Solution: Increase "end_call_after_silence_ms" to 300000 (5 minutes)
         Adjust reminder trigger timing

AGENT TOO SENSITIVE TO INTERRUPTIONS
-------------------------------------
Solution: Lower "interruption_sensitivity" to 0.7-0.8

VOICE SOUNDS UNNATURAL
----------------------
Solution: Try different voice providers (Eleven Labs, Cartesia, Minimax)
         Adjust "voice_temperature" and "voice_speed"
         Enable "Natural Filler Words" in Agent Handbook

INCOMPLETE DATA EXTRACTION
--------------------------
Solution: Review post-call analysis configuration
         Ensure all required fields are marked in prompt

===============================================================================
COST ESTIMATE
===============================================================================

Retell Credits: ~7-12 cents per minute
Phone Number: $2/month (optional)
Free Trial: $10 credit (~100 minutes)

A typical 5-minute qualification call costs approximately $0.35-0.60

===============================================================================
SUPPORT AND RESOURCES
===============================================================================

Retell Documentation: https://docs.retellai.com/
Retell Dashboard: https://dashboard.retellai.com/
Retell Support: support@retellai.com

Public Demo: https://agent.retellai.com/orb/agent_1cd6d1d0c3693d8b4b8d3cdf7d?token=dfd704750d4b7c94e96e79a662ead283

===============================================================================
COMPLIANCE NOTES
===============================================================================

This agent is designed for PRELIMINARY QUALIFICATION ONLY.

It:
✅ DOES set proper expectations about the approval process
✅ DOES hand off to human experts for final decisions
✅ DOES collect accurate information for qualification
✅ DOES provide excellent customer experience

It does NOT:
❌ Provide final loan approval
❌ Quote binding interest rates
❌ Guarantee disbursement amounts or timelines
❌ Make lending decisions

===============================================================================
VERSION HISTORY
===============================================================================

v1.0 (Current) - Initial release
- 8 required data points collection
- Edge case handling for busy customers, amount limits, existing loans
- Professional tone with compliance guardrails
- Post-call analytics and data extraction
- 25 comprehensive test scenarios

===============================================================================
LICENSE
===============================================================================

This configuration is provided as-is for use with Home Credit LAP 
qualification. Modify as needed for your specific requirements.

===============================================================================
