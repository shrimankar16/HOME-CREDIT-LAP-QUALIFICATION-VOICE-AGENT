/**
 * Example: Hindi Language Conversation
 * Demonstrates Hindi language support with proper gender grammar
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function exampleHindiConversation() {
  console.log('=== Home Credit LAP Voice Agent - Hindi Example ===\n');
  
  try {
    // Start session in Hindi
    console.log('Starting Hindi session...');
    const startResponse = await fetch(`${BASE_URL}/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'राजेश कुमार',
        agentName: 'Priya',
        agentGender: 'female',
        language: 'hindi'
      })
    });
    
    const startData = await startResponse.json();
    const sessionId = startData.sessionId;
    console.log(`Session ID: ${sessionId}`);
    console.log(`Agent: ${startData.response}\n`);
    
    // Helper function
    async function sendMessage(message) {
      console.log(`Customer: ${message}`);
      const response = await fetch(`${BASE_URL}/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await response.json();
      console.log(`Agent: ${data.response}\n`);
      return data;
    }
    
    // Conversation in Hindi/Hinglish
    await sendMessage('हाँ, बोलिए');
    await sendMessage('ठीक है, पूछिए');
    await sendMessage('घर है, फ्लैट');
    await sendMessage('सिर्फ़ मेरे नाम पर है');
    await sendMessage('हाँ, ओरिजिनल डॉक्यूमेंट्स हैं');
    await sendMessage('पचास लाख रुपये चाहिए');
    await sendMessage('मैं नौकरी करता हूँ और सैलरी बैंक में आती है');
    await sendMessage('प्रॉपर्टी की वैल्यू एक करोड़ के आसपास होगी');
    await sendMessage('दस साल में चुकाना चाहूँगा');
    
    console.log('Hindi conversation completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

exampleHindiConversation();
