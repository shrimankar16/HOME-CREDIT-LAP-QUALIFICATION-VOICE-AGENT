/**
 * Twilio Voice Integration
 * Enables actual phone calls with voice AI
 */

import twilio from 'twilio';
import { config } from '../config/config.js';

const VoiceResponse = twilio.twiml.VoiceResponse;

export class TwilioIntegration {
  constructor(accountSid, authToken, fromNumber) {
    this.client = twilio(accountSid, authToken);
    this.fromNumber = fromNumber;
  }
  
  /**
   * Make an outbound call to a customer
   */
  async makeCall(toPhoneNumber, customerName, webhookBaseUrl) {
    try {
      const call = await this.client.calls.create({
        to: toPhoneNumber,
        from: this.fromNumber,
        url: `${webhookBaseUrl}/voice/start?customerName=${encodeURIComponent(customerName)}`,
        statusCallback: `${webhookBaseUrl}/voice/status`,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        record: true, // Record call for quality/training
        recordingStatusCallback: `${webhookBaseUrl}/voice/recording-status`,
      });
      
      console.log(`Call initiated: ${call.sid} to ${toPhoneNumber}`);
      return {
        success: true,
        callSid: call.sid,
        status: call.status,
      };
    } catch (error) {
      console.error('Error making call:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * Generate TwiML for call start (greeting)
   */
  generateStartTwiML(greeting, gatherUrl) {
    const twiml = new VoiceResponse();
    
    // Gather user input with speech recognition
    const gather = twiml.gather({
      input: 'speech',
      action: gatherUrl,
      method: 'POST',
      speechTimeout: 'auto',
      language: 'en-IN', // Indian English
      hints: 'yes, no, speaking, hello, go ahead', // Help recognition
    });
    
    // Say the greeting
    gather.say({
      voice: 'Polly.Aditi', // Indian female voice
      language: 'en-IN',
    }, greeting);
    
    // If no input, try again
    twiml.say({
      voice: 'Polly.Aditi',
      language: 'en-IN',
    }, 'Sorry, I did not hear you. Let me call you back later.');
    
    twiml.hangup();
    
    return twiml.toString();
  }
  
  /**
   * Generate TwiML for continuing conversation
   */
  generateContinueTwiML(agentResponse, gatherUrl, shouldEndCall = false) {
    const twiml = new VoiceResponse();
    
    if (shouldEndCall) {
      // Just say goodbye and hang up
      twiml.say({
        voice: 'Polly.Aditi',
        language: 'en-IN',
      }, agentResponse);
      
      twiml.hangup();
    } else {
      // Continue gathering input
      const gather = twiml.gather({
        input: 'speech',
        action: gatherUrl,
        method: 'POST',
        speechTimeout: 'auto',
        language: 'en-IN',
      });
      
      gather.say({
        voice: 'Polly.Aditi',
        language: 'en-IN',
      }, agentResponse);
      
      // Fallback if no input
      twiml.say({
        voice: 'Polly.Aditi',
        language: 'en-IN',
      }, 'Are you still there?');
      
      twiml.redirect(gatherUrl);
    }
    
    return twiml.toString();
  }
  
  /**
   * Generate TwiML for Hindi conversation
   */
  generateHindiTwiML(agentResponse, gatherUrl, shouldEndCall = false) {
    const twiml = new VoiceResponse();
    
    if (shouldEndCall) {
      twiml.say({
        voice: 'Polly.Aditi',
        language: 'hi-IN',
      }, agentResponse);
      
      twiml.hangup();
    } else {
      const gather = twiml.gather({
        input: 'speech',
        action: gatherUrl,
        method: 'POST',
        speechTimeout: 'auto',
        language: 'hi-IN', // Hindi
      });
      
      gather.say({
        voice: 'Polly.Aditi',
        language: 'hi-IN',
      }, agentResponse);
      
      twiml.say({
        voice: 'Polly.Aditi',
        language: 'hi-IN',
      }, 'क्या आप वहाँ हैं?');
      
      twiml.redirect(gatherUrl);
    }
    
    return twiml.toString();
  }
  
  /**
   * Send SMS notification
   */
  async sendSMS(toPhoneNumber, message) {
    try {
      const sms = await this.client.messages.create({
        to: toPhoneNumber,
        from: this.fromNumber,
        body: message,
      });
      
      console.log(`SMS sent: ${sms.sid}`);
      return { success: true, sid: sms.sid };
    } catch (error) {
      console.error('Error sending SMS:', error);
      return { success: false, error: error.message };
    }
  }
}

export default TwilioIntegration;
