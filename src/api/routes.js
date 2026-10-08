/**
 * API Routes
 * REST endpoints for voice/chat integration
 */

import express from 'express';
import { stateManager } from '../state/StateManager.js';
import { AgentOrchestrator } from '../agent/AgentOrchestrator.js';
import { config } from '../config/config.js';

const router = express.Router();

/**
 * POST /api/sessions/start
 * Start a new conversation session
 * 
 * Body:
 * {
 *   "customerName": "John Doe",
 *   "agentName": "Priya" (optional),
 *   "agentGender": "female" (optional),
 *   "language": "english" (optional, default: "english")
 * }
 */
router.post('/sessions/start', (req, res) => {
  try {
    const {
      customerName,
      agentName = config.company.defaultAgentName,
      agentGender = config.company.defaultAgentGender,
      language = 'english'
    } = req.body;
    
    if (!customerName) {
      return res.status(400).json({
        error: 'customerName is required'
      });
    }
    
    // Generate session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create session
    const state = stateManager.createSession(
      sessionId,
      customerName,
      agentName,
      agentGender,
      config.company.name,
      language
    );
    
    // Start call and get greeting
    const result = AgentOrchestrator.startCall(state);
    
    res.json({
      sessionId,
      response: result.response,
      shouldEndCall: result.shouldEndCall,
      state: {
        stage: state.currentStage,
        identityVerified: state.identityVerified,
        offerPresented: state.offerPresented,
      }
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      error: 'Failed to start session',
      message: error.message
    });
  }
});

/**
 * POST /api/sessions/:sessionId/message
 * Send a customer message and get agent response
 * 
 * Body:
 * {
 *   "message": "Customer's utterance",
 *   "ragContext": "Additional context from RAG" (optional)
 * }
 */
router.post('/sessions/:sessionId/message', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, ragContext = null } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'message is required'
      });
    }
    
    // Get session
    if (!stateManager.hasSession(sessionId)) {
      return res.status(404).json({
        error: 'Session not found',
        message: `Session ${sessionId} does not exist`
      });
    }
    
    const state = stateManager.getSession(sessionId);
    
    // Check if call has already ended
    if (state.callOutcome !== 'ongoing') {
      return res.status(400).json({
        error: 'Call has ended',
        callOutcome: state.callOutcome
      });
    }
    
    // Handle different contexts
    let result;
    
    // Identification stage
    if (state.currentStage === 'identification' && !state.identityVerified) {
      result = AgentOrchestrator.handleIdentificationTurn(state, message);
    }
    // Consent stage
    else if (state.offerPresented && !state.customerConsentedToQuestions) {
      result = AgentOrchestrator.handleConsentTurn(state, message);
    }
    // Process normal turn
    else {
      result = AgentOrchestrator.processTurn(state, message, ragContext);
    }
    
    res.json({
      sessionId,
      response: result.response,
      shouldEndCall: result.shouldEndCall,
      needsCallbackTime: result.needsCallbackTime || false,
      needsLoanLimitDecision: result.needsLoanLimitDecision || false,
      state: {
        stage: state.currentStage,
        callOutcome: state.callOutcome,
        identityVerified: state.identityVerified,
        offerPresented: state.offerPresented,
        customerConsentedToQuestions: state.customerConsentedToQuestions,
        checklistProgress: {
          completed: state.getAnsweredItems().length,
          total: 7
        }
      }
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      error: 'Failed to process message',
      message: error.message
    });
  }
});

/**
 * POST /api/sessions/:sessionId/callback-time
 * Provide callback time when customer is busy
 * 
 * Body:
 * {
 *   "callbackTime": "tomorrow evening at 6pm"
 * }
 */
router.post('/sessions/:sessionId/callback-time', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { callbackTime } = req.body;
    
    if (!stateManager.hasSession(sessionId)) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }
    
    const state = stateManager.getSession(sessionId);
    const result = AgentOrchestrator.handleCallbackTimeTurn(state, callbackTime || 'anytime');
    
    res.json({
      sessionId,
      response: result.response,
      shouldEndCall: true,
      callbackTime: state.callbackTime
    });
  } catch (error) {
    console.error('Error setting callback time:', error);
    res.status(500).json({
      error: 'Failed to set callback time',
      message: error.message
    });
  }
});

/**
 * POST /api/sessions/:sessionId/loan-limit-decision
 * Handle loan limit decision
 * 
 * Body:
 * {
 *   "decision": "yes" or "no"
 * }
 */
router.post('/sessions/:sessionId/loan-limit-decision', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { decision } = req.body;
    
    if (!stateManager.hasSession(sessionId)) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }
    
    const state = stateManager.getSession(sessionId);
    const result = AgentOrchestrator.handleLoanLimitDecisionTurn(state, decision);
    
    res.json({
      sessionId,
      response: result.response,
      shouldEndCall: result.shouldEndCall || false,
      loanAmountAccepted: result.accepted
    });
  } catch (error) {
    console.error('Error handling loan limit decision:', error);
    res.status(500).json({
      error: 'Failed to handle loan limit decision',
      message: error.message
    });
  }
});

/**
 * GET /api/sessions/:sessionId
 * Get session state
 */
router.get('/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!stateManager.hasSession(sessionId)) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }
    
    const state = stateManager.getSession(sessionId);
    
    res.json({
      sessionId,
      state: state.toJSON(),
      summary: AgentOrchestrator.getSessionSummary(state)
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({
      error: 'Failed to get session',
      message: error.message
    });
  }
});

/**
 * GET /api/sessions/:sessionId/conversation
 * Get conversation history
 */
router.get('/sessions/:sessionId/conversation', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!stateManager.hasSession(sessionId)) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }
    
    const state = stateManager.getSession(sessionId);
    
    res.json({
      sessionId,
      conversation: state.conversationHistory,
      formatted: state.getFormattedHistory()
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({
      error: 'Failed to get conversation',
      message: error.message
    });
  }
});

/**
 * DELETE /api/sessions/:sessionId
 * End and delete a session
 */
router.delete('/sessions/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!stateManager.hasSession(sessionId)) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }
    
    const state = stateManager.getSession(sessionId);
    const summary = AgentOrchestrator.getSessionSummary(state);
    
    stateManager.deleteSession(sessionId);
    
    res.json({
      message: 'Session ended',
      sessionId,
      summary
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      error: 'Failed to delete session',
      message: error.message
    });
  }
});

/**
 * GET /api/sessions
 * Get all active sessions
 */
router.get('/sessions', (req, res) => {
  try {
    const sessions = stateManager.getAllSessions();
    
    res.json({
      count: sessions.length,
      sessions: sessions.map(state => ({
        sessionId: state.sessionId,
        customerName: state.customerName,
        callOutcome: state.callOutcome,
        stage: state.currentStage,
        startTime: state.callStartTime,
        checklistProgress: {
          completed: state.getAnsweredItems().length,
          total: 7
        }
      }))
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({
      error: 'Failed to get sessions',
      message: error.message
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activeSessions: stateManager.getSessionCount(),
    uptime: process.uptime()
  });
});

export default router;
