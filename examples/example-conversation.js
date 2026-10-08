/**
 * Example: Complete Conversation Flow
 * Demonstrates a successful LAP qualification conversation
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function exampleConversation() {
  console.log('=== Home Credit LAP Voice Agent - Example Conversation ===\n');
  
  try {
    // 1. Start a new session
    console.log('1. Starting new session...');
    const startResponse = await fetch(`${BASE_URL}/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Amit Sharma',
        agentName: 'Priya',
        agentGender: 'female',
        language: 'english'
      })
    });
    
    const startData = await startResponse.json();
    const sessionId = startData.sessionId;
    console.log(`Session ID: ${sessionId}`);
    console.log(`Agent: ${startData.response}\n`);
    
    // Helper function to send message
    async function sendMessage(message) {
      console.log(`Customer: ${message}`);
      const response = await fetch(`${BASE_URL}/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      console.log(`Agent: ${data.response}`);
      console.log(`Progress: ${data.state.checklistProgress.completed}/7 items\n`);
      return data;
    }
    
    // 2. Confirm identity
    console.log('2. Identity confirmation...');
    await sendMessage('Yes, speaking');
    
    // 3. Consent to questions
    console.log('3. Consent to questions...');
    await sendMessage('Sure, go ahead');
    
    // 4. Answer Q1: Property Type
    console.log('4. Property Type...');
    await sendMessage('It is a residential flat in Mumbai');
    
    // 5. Answer Q2: Ownership
    console.log('5. Ownership...');
    await sendMessage('Only in my name');
    
    // 6. Answer Q3: Original Documents
    console.log('6. Original Documents...');
    await sendMessage('Yes, I have the original documents at home');
    
    // 7. Answer Q4: Loan Amount
    console.log('7. Loan Amount...');
    await sendMessage('I need around 50 lakh rupees');
    
    // 8. Answer Q5: Occupation and Income
    console.log('8. Occupation and Income...');
    await sendMessage('I am salaried and my income comes to my bank account');
    
    // 9. Answer Q6: Market Value
    console.log('9. Market Value...');
    await sendMessage('The property is worth around 1 crore');
    
    // 10. Answer Q7: Tenure
    console.log('10. Tenure...');
    const finalResponse = await sendMessage('I would like to repay over 10 years');
    
    // Check final outcome
    console.log('\n=== Conversation Complete ===');
    console.log(`Call Outcome: ${finalResponse.state.callOutcome}`);
    console.log(`Should End Call: ${finalResponse.shouldEndCall}`);
    
    // Get session summary
    console.log('\n=== Session Summary ===');
    const summaryResponse = await fetch(`${BASE_URL}/sessions/${sessionId}`);
    const summaryData = await summaryResponse.json();
    console.log(JSON.stringify(summaryData.summary, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
exampleConversation();
