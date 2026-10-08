/**
 * Example: Special Flows
 * Demonstrates disqualification, transfer, busy, and loan limit flows
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function sendMessage(sessionId, message) {
  const response = await fetch(`${BASE_URL}/sessions/${sessionId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return await response.json();
}

async function startSession(customerName, language = 'english') {
  const response = await fetch(`${BASE_URL}/sessions/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerName, language })
  });
  return await response.json();
}

// Example 1: Disqualification - Cash Income
async function exampleDisqualificationCashIncome() {
  console.log('\n=== Example: Disqualification (Cash Income) ===\n');
  
  const session = await startSession('Customer 1');
  const sessionId = session.sessionId;
  
  await sendMessage(sessionId, 'Yes, speaking');
  await sendMessage(sessionId, 'Sure, go ahead');
  await sendMessage(sessionId, 'It is a residential house');
  await sendMessage(sessionId, 'Only mine');
  await sendMessage(sessionId, 'Yes, documents are available');
  await sendMessage(sessionId, '40 lakh');
  
  // Cash income - immediate disqualification
  const result = await sendMessage(sessionId, 'I run a shop and most income is in cash');
  
  console.log('Customer: I run a shop and most income is in cash');
  console.log(`Agent: ${result.response}`);
  console.log(`Call Ended: ${result.shouldEndCall}`);
  console.log(`Outcome: ${result.state.callOutcome}`);
}

// Example 2: Disqualification - Agricultural Property
async function exampleDisqualificationAgricultural() {
  console.log('\n=== Example: Disqualification (Agricultural Property) ===\n');
  
  const session = await startSession('Customer 2');
  const sessionId = session.sessionId;
  
  await sendMessage(sessionId, 'Yes');
  await sendMessage(sessionId, 'Okay');
  
  // Agricultural property - immediate disqualification
  const result = await sendMessage(sessionId, 'It is agricultural land');
  
  console.log('Customer: It is agricultural land');
  console.log(`Agent: ${result.response}`);
  console.log(`Call Ended: ${result.shouldEndCall}`);
  console.log(`Outcome: ${result.state.callOutcome}`);
}

// Example 3: Transfer Flow - Existing Loan
async function exampleExistingLoanTransfer() {
  console.log('\n=== Example: Transfer Flow (Existing Loan) ===\n');
  
  const session = await startSession('Customer 3');
  const sessionId = session.sessionId;
  
  await sendMessage(sessionId, 'Yes, this is he');
  await sendMessage(sessionId, 'Tell me more');
  await sendMessage(sessionId, 'Residential flat');
  
  // Mentions existing loan - transfer flow
  const result = await sendMessage(sessionId, 'I already have a home loan on this flat');
  
  console.log('Customer: I already have a home loan on this flat');
  console.log(`Agent: ${result.response}`);
  console.log(`Call Ended: ${result.shouldEndCall}`);
  console.log(`Outcome: ${result.state.callOutcome}`);
}

// Example 4: Busy Flow
async function exampleBusyFlow() {
  console.log('\n=== Example: Busy Flow ===\n');
  
  const session = await startSession('Customer 4');
  const sessionId = session.sessionId;
  
  // Customer is busy
  const result = await sendMessage(sessionId, 'I am in a meeting right now, can you call later?');
  
  console.log('Customer: I am in a meeting right now, can you call later?');
  console.log(`Agent: ${result.response}`);
  console.log(`Needs Callback Time: ${result.needsCallbackTime}`);
  
  // Provide callback time
  if (result.needsCallbackTime) {
    const callbackResponse = await fetch(`${BASE_URL}/sessions/${sessionId}/callback-time`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callbackTime: 'tomorrow evening at 6pm' })
    });
    const callbackData = await callbackResponse.json();
    
    console.log('Customer: Tomorrow evening at 6pm');
    console.log(`Agent: ${callbackData.response}`);
    console.log(`Call Ended: ${callbackData.shouldEndCall}`);
  }
}

// Example 5: Loan Limit Flow
async function exampleLoanLimitFlow() {
  console.log('\n=== Example: Loan Limit Flow (Above 75 Lakh) ===\n');
  
  const session = await startSession('Customer 5');
  const sessionId = session.sessionId;
  
  await sendMessage(sessionId, 'Yes');
  await sendMessage(sessionId, 'Go ahead');
  await sendMessage(sessionId, 'Commercial shop');
  await sendMessage(sessionId, 'Sole ownership');
  await sendMessage(sessionId, 'Yes, originals available');
  
  // Requests above limit
  const result = await sendMessage(sessionId, 'I need 1 crore');
  
  console.log('Customer: I need 1 crore');
  console.log(`Agent: ${result.response}`);
  console.log(`Needs Loan Limit Decision: ${result.needsLoanLimitDecision}`);
  
  // Accept 75 lakh
  if (result.needsLoanLimitDecision) {
    const decisionResponse = await fetch(`${BASE_URL}/sessions/${sessionId}/loan-limit-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'yes, 75 lakh is fine' })
    });
    const decisionData = await decisionResponse.json();
    
    console.log('Customer: Yes, 75 lakh is fine');
    console.log(`Agent: ${decisionData.response}`);
    console.log(`Loan Amount Accepted: ${decisionData.loanAmountAccepted}`);
  }
}

// Example 6: Not Interested Flow
async function exampleNotInterested() {
  console.log('\n=== Example: Not Interested ===\n');
  
  const session = await startSession('Customer 6');
  const sessionId = session.sessionId;
  
  await sendMessage(sessionId, 'Yes');
  
  // Not interested
  const result = await sendMessage(sessionId, 'No thanks, not interested');
  
  console.log('Customer: No thanks, not interested');
  console.log(`Agent: ${result.response}`);
  console.log(`Call Ended: ${result.shouldEndCall}`);
  console.log(`Outcome: ${result.state.callOutcome}`);
}

// Run all examples
async function runAllExamples() {
  console.log('========================================');
  console.log('HOME CREDIT LAP - SPECIAL FLOWS EXAMPLES');
  console.log('========================================');
  
  await exampleDisqualificationCashIncome();
  await exampleDisqualificationAgricultural();
  await exampleExistingLoanTransfer();
  await exampleBusyFlow();
  await exampleLoanLimitFlow();
  await exampleNotInterested();
  
  console.log('\n========================================');
  console.log('All examples completed!');
  console.log('========================================\n');
}

runAllExamples().catch(console.error);
