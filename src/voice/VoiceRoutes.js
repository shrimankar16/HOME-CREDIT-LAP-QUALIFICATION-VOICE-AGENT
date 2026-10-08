/**
 * Voice Call Routes
 * Handles Twilio webhook callbacks for voice calls
 */

import express from 'express';
import { TwilioIntegration } from './TwilioIntegration.js';
import { stateManager } from '../state/StateManager.js';
import { AgentOrchestrator } from '../agent/AgentOrchestrator.js';
import { config } from '../config/config.js';

const router = express.Router();

// Initialize Twilio (will be set from env vars)
let twilioClient = null;

// Store call SID to session ID mapping
const callToSessionMap = new Map();

/**
 * Initialize Twilio client
 */
function initializeTwilio(accountSid, authToken, fromNumber) {
  twilioClient = new TwilioIntegration(accountSid, authToken, fromNumber);
  console.log('Twilio initialized successfully');
}

/**
 * POST /voice/make-call
 * Initiate an outbound call to a customer
 */
router.post('/make-call', async (req, res) => {
  try {
    const {
      phoneNumber,
      customerName,
      language = 'english',
      agentName,
      agentGender,
    } = req.body;
    
    if (!phoneNumber || !customerName) {
      return res.status(400).json({
        error: 'phoneNumber and customerName are required',
      });
    }
    
    if (!twilioClient) {
      return res.status(500).json({
        error: 'Twilio not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env',
      });
    }
    
    // Get webhook base URL from request or env
    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || `${req.protocol}://${req.get('host')}/api`;
    
    // Make the call
    const result = await twilioClient.makeCall(
      phoneNumber,
      customerName,
      webhookBaseUrl
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Call initiated',
        callSid: result.callSid,
        phoneNumber,
        customerName,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({
      error: 'Failed to initiate call',
      message: error.message,
    });
  }
});

/**
 * POST /voice/start
 * Called by Twilio when call is answered (webhook)
 */
router.post('/start', async (req, res) => {
  try {
    const { CallSid, customerName } = req.query;
    const language = req.query.language || 'english';
    
    console.log(`Call started: ${CallSid} for ${customerName}`);
    
    // Create a new session for this call
    const sessionId = `call_${CallSid}`;
    const state = stateManager.createSession(
      sessionId,
      customerName || 'Customer',
      config.company.defaultAgentName,
      config.company.defaultAgentGender,
      config.company.name,
      language
    );
    
    // Map call SID to session ID
    callToSessionMap.set(CallSid, sessionId);
    
    // Start the call and get greeting
    const result = AgentOrchestrator.startCall(state);
    
    // Generate TwiML with greeting
    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || `${req.protocol}://${req.get('host')}/api`;
    const gatherUrl = `${webhookBaseUrl}/voice/gather?CallSid=${CallSid}`;
    
    const twiml = language === 'hindi' 
      ? twilioClient.generateHindiTwiML(result.response, gatherUrl, false)
      : twilioClient.generateStartTwiML(result.response, gatherUrl);
    
    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error in voice start:', error);
    res.status(500).send('Error starting call');
  }
});

/**
 * POST /voice/gather
 * Called by Twilio with customer's speech (webhook)
 */
router.post('/gather', async (req, res) => {
  try {
    const { CallSid, SpeechResult, Confidence } = req.body;
    
    console.log(`Speech received from ${CallSid}: "${SpeechResult}" (confidence: ${Confidence})`);
    
    // Get session from call SID
    const sessionId = callToSessionMap.get(CallSid);
    
    if (!sessionId || !stateManager.hasSession(sessionId)) {
      console.error(`No session found for call ${CallSid}`);
      const twiml = twilioClient.generateContinueTwiML(
        'Sorry, there was an error. Please call back.',
        '',
        true
      );
      res.type('text/xml');
      return res.send(twiml);
    }
    
    const state = stateManager.getSession(sessionId);
    
    // Check confidence level
    if (parseFloat(Confidence) < 0.5) {
      console.log(`Low confidence speech: ${Confidence}`);
      // Ask to repeat
      const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || `${req.protocol}://${req.get('host')}/api`;
      const gatherUrl = `${webhookBaseUrl}/voice/gather?CallSid=${CallSid}`;
      
      const twiml = state.language === 'hindi'
        ? twilioClient.generateHindiTwiML('माफ़ कीजिए, मैं सुन नहीं पाई। कृपया दोहराएँ।', gatherUrl, false)
        : twilioClient.generateContinueTwiML('Sorry, I could not hear you clearly. Could you please repeat?', gatherUrl, false);
      
      res.type('text/xml');
      return res.send(twiml);
    }
    
    // Process the customer's speech
    let result;
    
    // Handle different conversation stages
    if (state.currentStage === 'identification' && !state.identityVerified) {
      result = AgentOrchestrator.handleIdentificationTurn(state, SpeechResult);
    } else if (state.offerPresented && !state.customerConsentedToQuestions) {
      result = AgentOrchestrator.handleConsentTurn(state, SpeechResult);
    } else {
      result = AgentOrchestrator.processTurn(state, SpeechResult);
    }
    
    // Generate TwiML response
    const webhookBaseUrl = process.env.WEBHOOK_BASE_URL || `${req.protocol}://${req.get('host')}/api`;
    const gatherUrl = `${webhookBaseUrl}/voice/gather?CallSid=${CallSid}`;
    
    const twiml = state.language === 'hindi'
      ? twilioClient.generateHindiTwiML(result.response, gatherUrl, result.shouldEndCall)
      : twilioClient.generateContinueTwiML(result.response, gatherUrl, result.shouldEndCall);
    
    // Clean up if call is ending
    if (result.shouldEndCall) {
      callToSessionMap.delete(CallSid);
      
      // Send SMS summary if needed
      if (state.callOutcome === 'handoff') {
        const phoneNumber = req.body.To; // Customer's phone number
        await twilioClient.sendSMS(
          phoneNumber,
          'Thank you for your interest in our Loan Against Property offer. Our senior loan expert will call you shortly. - Home Credit India'
        );
      }
    }
    
    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('Error in voice gather:', error);
    const twiml = twilioClient.generateContinueTwiML(
      'Sorry, there was an error. Goodbye.',
      '',
      true
    );
    res.type('text/xml');
    res.send(twiml);
  }
});

/**
 * POST /voice/status
 * Called by Twilio with call status updates
 */
router.post('/status', (req, res) => {
  const { CallSid, CallStatus, CallDuration } = req.body;
  
  console.log(`Call ${CallSid} status: ${CallStatus}`);
  
  if (CallStatus === 'completed') {
    console.log(`Call completed. Duration: ${CallDuration} seconds`);
    
    // Clean up session if still exists
    const sessionId = callToSessionMap.get(CallSid);
    if (sessionId && stateManager.hasSession(sessionId)) {
      const state = stateManager.getSession(sessionId);
      console.log(`Call outcome: ${state.callOutcome}`);
      
      // Could store in database here
    }
    
    callToSessionMap.delete(CallSid);
  }
  
  res.sendStatus(200);
});

/**
 * POST /voice/recording-status
 * Called by Twilio when recording is ready
 */
router.post('/recording-status', (req, res) => {
  const { CallSid, RecordingUrl, RecordingDuration } = req.body;
  
  console.log(`Recording available for call ${CallSid}`);
  console.log(`Recording URL: ${RecordingUrl}`);
  console.log(`Duration: ${RecordingDuration} seconds`);
  
  // Could download and store recording here
  
  res.sendStatus(200);
});

export { router as voiceRoutes, initializeTwilio };
export default router;
