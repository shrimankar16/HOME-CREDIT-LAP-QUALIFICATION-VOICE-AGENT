/**
 * Agent Orchestrator
 * Implements the per-turn loop (Section 6) from the prompt
 * Coordinates all conversation components
 */

import { CALL_STAGES, CALL_OUTCOMES, CHECKLIST_ORDER } from '../config/constants.js';
import { StageHandlers } from '../conversation/StageHandlers.js';
import { SpecialFlows } from '../conversation/SpecialFlows.js';
import { QuestionHandler } from '../conversation/QuestionHandler.js';
import { InputParser } from '../rules/InputParser.js';
import { EligibilityRules } from '../rules/EligibilityRules.js';

export class AgentOrchestrator {
  /**
   * Process a customer turn
   * This is the main per-turn loop from Section 6
   */
  static processTurn(state, customerUtterance, ragContext = null) {
    // STEP 1: READ conversation history + customer utterance
    // Rebuild state (in production, would parse history for state consistency)
    state.addConversationTurn('customer', customerUtterance);
    
    if (ragContext) {
      state.additionalContext = ragContext;
    }
    
    // STEP 2: SAFETY / EXIT CHECKS (in priority order)
    
    // 2a: Abusive or "do not call again"
    const isAbusive = this.detectAbusiveBehavior(customerUtterance);
    if (isAbusive) {
      const result = SpecialFlows.handleAbusiveFlow(state, state.language, state.agentGender);
      state.addConversationTurn('agent', result.response);
      return { response: result.response, shouldEndCall: true };
    }
    
    // 2b: Busy / call later
    const isBusy = InputParser.detectBusyRequest(customerUtterance);
    if (isBusy) {
      const result = SpecialFlows.handleBusyFlow(state, state.language, state.agentGender);
      state.addConversationTurn('agent', result.response);
      return { response: result.response, shouldEndCall: false, needsCallbackTime: true };
    }
    
    // 2c: Not interested
    const notInterested = InputParser.detectNotInterested(customerUtterance);
    if (notInterested) {
      const result = SpecialFlows.handleNotInterestedFlow(state, state.language, state.agentGender);
      state.addConversationTurn('agent', result.response);
      return { response: result.response, shouldEndCall: true };
    }
    
    // 2d: EXISTING LOAN / EMI REDUCTION (takes priority over disqualification)
    const hasExistingLoan = InputParser.detectExistingLoan(customerUtterance);
    if (hasExistingLoan) {
      const result = SpecialFlows.handleTransferFlow(state, state.language, state.agentGender);
      state.addConversationTurn('agent', result.response);
      return { response: result.response, shouldEndCall: true };
    }
    
    // STEP 3: EXTRACT checklist facts from utterance
    const extractedItems = InputParser.extractAllItems(customerUtterance);
    
    // Update state with extracted items
    this.updateStateWithExtractedItems(state, extractedItems);
    
    // STEP 4: EVALUATE newly captured/corrected items
    
    // Check for disqualification
    const eligibilityCheck = EligibilityRules.areAllAnsweredItemsEligible(state.checklist);
    if (!eligibilityCheck.eligible) {
      const result = SpecialFlows.handleDisqualificationFlow(
        state, 
        eligibilityCheck.reason, 
        state.language, 
        state.agentGender
      );
      state.addConversationTurn('agent', result.response);
      return { response: result.response, shouldEndCall: true };
    }
    
    // Check for loan amount above limit
    if (state.checklist.loan_amount.answered && 
        state.checklist.loan_amount.value > 7500000) {
      const result = SpecialFlows.handleLoanLimitFlow(
        state.checklist.loan_amount.value,
        state.language,
        state.agentGender
      );
      state.addConversationTurn('agent', result.response);
      return { 
        response: result.response, 
        shouldEndCall: false,
        needsLoanLimitDecision: true 
      };
    }
    
    // STEP 5: ANSWER any customer question
    let answerToQuestion = null;
    if (QuestionHandler.detectQuestion(customerUtterance)) {
      answerToQuestion = QuestionHandler.answerQuestion(
        customerUtterance,
        state.additionalContext,
        state.language,
        state.agentGender
      );
    }
    
    // STEP 6: FIND THE FIRST MISSING ITEM and ask it
    const response = this.buildResponse(state, answerToQuestion);
    
    state.addConversationTurn('agent', response);
    
    // STEP 7: SELF-CHECK (implemented in buildResponse)
    return { 
      response, 
      shouldEndCall: state.callOutcome !== CALL_OUTCOMES.ONGOING,
      state 
    };
  }
  
  /**
   * Build the agent's response based on current state and context
   */
  static buildResponse(state, answerToQuestion = null) {
    let parts = [];
    
    // Handle different stages
    switch (state.currentStage) {
      case CALL_STAGES.GREETING:
      case CALL_STAGES.IDENTIFICATION:
        return StageHandlers.handleGreeting(state);
      
      case CALL_STAGES.OFFER_PRESENTATION:
        if (!state.offerPresented) {
          return StageHandlers.handleOfferPresentation(state);
        }
        break;
      
      case CALL_STAGES.ELIGIBILITY_CHECK:
        // If there's a question answer, add it
        if (answerToQuestion) {
          parts.push(answerToQuestion);
        }
        
        // If not consented yet, don't ask questions
        if (!state.customerConsentedToQuestions) {
          // Waiting for consent is handled by previous turn
          return answerToQuestion || '';
        }
        
        // Check if all items are answered
        if (state.isChecklistComplete()) {
          // All done - handoff
          const handoff = SpecialFlows.handleHandoffFlow(state, state.language, state.agentGender);
          return handoff.response;
        }
        
        // Find next question
        const nextQ = StageHandlers.getNextQuestion(state);
        
        if (!nextQ) {
          // Shouldn't happen, but safety check
          const handoff = SpecialFlows.handleHandoffFlow(state, state.language, state.agentGender);
          return handoff.response;
        }
        
        // Build: [acknowledgment] + question
        const ack = answerToQuestion ? null : StageHandlers.generateAcknowledgment(state.language);
        
        if (ack) {
          parts.push(ack);
        }
        
        parts.push(nextQ.question);
        
        return parts.join('. ');
      
      default:
        return answerToQuestion || '';
    }
    
    return answerToQuestion || '';
  }
  
  /**
   * Update state with extracted items from parser
   */
  static updateStateWithExtractedItems(state, extractedItems) {
    // Property type
    if (extractedItems.property_type && !state.checklist.property_type.answered) {
      state.updateChecklistItem('property_type', extractedItems.property_type);
    }
    
    // Ownership
    if (extractedItems.ownership && !state.checklist.ownership.answered) {
      state.updateChecklistItem('ownership', extractedItems.ownership);
    }
    
    // Original documents
    if (extractedItems.original_docs && !state.checklist.original_docs.answered) {
      state.updateChecklistItem('original_docs', extractedItems.original_docs);
    }
    
    // Loan amount (allow updates for corrections)
    if (extractedItems.loan_amount !== null) {
      state.updateChecklistItem('loan_amount', extractedItems.loan_amount);
    }
    
    // Occupation type
    if (extractedItems.occupation_type) {
      state.updateChecklistItem('occupation', extractedItems.occupation_type, 'occupation_type');
    }
    
    // Income mode
    if (extractedItems.income_mode) {
      state.updateChecklistItem('occupation', extractedItems.income_mode, 'income_mode');
    }
    
    // Market value (allow updates)
    if (extractedItems.market_value !== null) {
      state.updateChecklistItem('market_value', extractedItems.market_value);
    }
    
    // Tenure (allow updates for corrections)
    if (extractedItems.tenure_years !== null) {
      state.updateChecklistItem('tenure_years', extractedItems.tenure_years);
    }
  }
  
  /**
   * Handle identification response specifically
   */
  static handleIdentificationTurn(state, customerUtterance) {
    const result = StageHandlers.handleIdentificationResponse(state, customerUtterance);
    
    if (result.verified) {
      // Identity verified, move to offer presentation
      const offerResponse = StageHandlers.handleOfferPresentation(state);
      state.addConversationTurn('agent', offerResponse);
      return { response: offerResponse, shouldEndCall: false };
    }
    
    // Not verified yet
    state.addConversationTurn('agent', result.response);
    return { 
      response: result.response, 
      shouldEndCall: result.shouldEndCall || false 
    };
  }
  
  /**
   * Handle consent response specifically
   */
  static handleConsentTurn(state, customerUtterance) {
    const result = StageHandlers.handleConsentResponse(state, customerUtterance);
    
    if (result.consented) {
      // Get first question
      const nextQ = StageHandlers.getNextQuestion(state);
      const response = nextQ ? nextQ.question : 'Thank you.';
      state.addConversationTurn('agent', response);
      return { response, shouldEndCall: false };
    }
    
    if (result.needsAnswer) {
      // Customer asked a question before consenting
      return this.processTurn(state, customerUtterance, state.additionalContext);
    }
    
    // Not consented, need to re-ask or answer
    state.addConversationTurn('agent', result.response);
    return { response: result.response, shouldEndCall: false };
  }
  
  /**
   * Handle loan limit decision
   */
  static handleLoanLimitDecisionTurn(state, customerUtterance) {
    const result = SpecialFlows.handleLoanLimitDecision(
      customerUtterance,
      state,
      state.language,
      state.agentGender
    );
    
    if (result.accepted === true) {
      // Accepted 75 lakh, continue with next question
      const nextQ = StageHandlers.getNextQuestion(state);
      const response = result.response + ' ' + (nextQ ? nextQ.question : '');
      state.addConversationTurn('agent', response);
      return { response, shouldEndCall: false };
    }
    
    if (result.accepted === false) {
      // Rejected, end call
      state.addConversationTurn('agent', result.response);
      return { response: result.response, shouldEndCall: true };
    }
    
    // Still deciding
    state.addConversationTurn('agent', result.response);
    return { response: result.response, shouldEndCall: false, needsLoanLimitDecision: true };
  }
  
  /**
   * Handle callback time response
   */
  static handleCallbackTimeTurn(state, customerUtterance) {
    const response = SpecialFlows.handleCallbackTimeResponse(
      state,
      customerUtterance,
      state.language,
      state.agentGender
    );
    
    state.addConversationTurn('agent', response);
    return { response, shouldEndCall: true };
  }
  
  /**
   * Start a new call
   */
  static startCall(state) {
    const greeting = StageHandlers.handleGreeting(state);
    state.addConversationTurn('agent', greeting);
    return { response: greeting, shouldEndCall: false };
  }
  
  /**
   * Detect abusive behavior
   */
  static detectAbusiveBehavior(utterance) {
    const text = utterance.toLowerCase();
    const abusiveKeywords = [
      'do not call', 'don\'t call', 'remove my number', 'delete my number',
      'call nahi karo', 'बंद करो'
    ];
    
    return abusiveKeywords.some(keyword => text.includes(keyword));
  }
  
  /**
   * Get session summary
   */
  static getSessionSummary(state) {
    return {
      sessionId: state.sessionId,
      customerName: state.customerName,
      callOutcome: state.callOutcome,
      callDuration: new Date() - state.callStartTime,
      identityVerified: state.identityVerified,
      offerPresented: state.offerPresented,
      checklistComplete: state.isChecklistComplete(),
      answeredItems: state.getAnsweredItems().length,
      totalItems: CHECKLIST_ORDER.length,
      disqualificationReason: state.disqualificationReason,
      existingLoanFlag: state.existingLoanFlag,
      callbackTime: state.callbackTime,
    };
  }
}

export default AgentOrchestrator;
