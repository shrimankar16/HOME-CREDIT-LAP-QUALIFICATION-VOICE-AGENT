/**
 * Agent State Management
 * Tracks all conversation state including identity, checklist items, and call outcome
 */

import { CALL_OUTCOMES, CALL_STAGES, CHECKLIST_ITEMS } from '../config/constants.js';

export class AgentState {
  constructor(sessionId, customerName, agentName, agentGender, companyName, language = 'english') {
    // Session metadata
    this.sessionId = sessionId;
    this.customerName = customerName;
    this.agentName = agentName;
    this.agentGender = agentGender;
    this.companyName = companyName;
    this.language = language;
    
    // Timestamps
    this.callStartTime = new Date();
    this.currentDate = this.formatDate(new Date());
    this.currentDay = this.formatDay(new Date());
    this.currentTime = this.formatTime(new Date());
    
    // Identity / Call state
    this.identityVerified = false;
    this.offerPresented = false;
    this.customerConsentedToQuestions = false;
    this.existingLoanFlag = false;
    this.callbackTime = null;
    this.callOutcome = CALL_OUTCOMES.ONGOING;
    this.currentStage = CALL_STAGES.GREETING;
    
    // The 7 Checklist Items
    this.checklist = {
      // Item 1: Property Type
      property_type: {
        value: null, // residential | commercial | industrial | agricultural | other
        answered: false,
      },
      
      // Item 2: Ownership
      ownership: {
        value: null, // sole | joint
        answered: false,
      },
      
      // Item 3: Original Documents
      original_docs: {
        value: null, // available | not_available
        answered: false,
      },
      
      // Item 4: Loan Amount
      loan_amount: {
        value: null, // Number in rupees
        answered: false,
      },
      
      // Item 5: Occupation and Income Mode (both required)
      occupation: {
        occupation_type: null, // salaried | self_employed
        income_mode: null, // bank | cash
        answered: false, // Only true when BOTH are filled
      },
      
      // Item 6: Market Value
      market_value: {
        value: null, // Number or string like "customer unsure"
        answered: false,
      },
      
      // Item 7: Tenure
      tenure_years: {
        value: null, // Number of years
        answered: false,
      },
    };
    
    // Conversation history
    this.conversationHistory = [];
    
    // Additional context from RAG (if any)
    this.additionalContext = null;
    
    // Disqualification reason (if any)
    this.disqualificationReason = null;
  }
  
  /**
   * Update a checklist item
   */
  updateChecklistItem(itemName, value, subfield = null) {
    if (!this.checklist[itemName]) {
      throw new Error(`Invalid checklist item: ${itemName}`);
    }
    
    if (itemName === CHECKLIST_ITEMS.OCCUPATION) {
      // Special handling for occupation (has two subfields)
      if (subfield === 'occupation_type') {
        this.checklist[itemName].occupation_type = value;
      } else if (subfield === 'income_mode') {
        this.checklist[itemName].income_mode = value;
      }
      
      // Mark as answered only if BOTH are filled
      this.checklist[itemName].answered = 
        this.checklist[itemName].occupation_type !== null && 
        this.checklist[itemName].income_mode !== null;
    } else {
      this.checklist[itemName].value = value;
      this.checklist[itemName].answered = true;
    }
  }
  
  /**
   * Get a checklist item value
   */
  getChecklistItem(itemName) {
    return this.checklist[itemName];
  }
  
  /**
   * Check if a checklist item is answered
   */
  isChecklistItemAnswered(itemName) {
    return this.checklist[itemName]?.answered || false;
  }
  
  /**
   * Get all answered items
   */
  getAnsweredItems() {
    return Object.entries(this.checklist)
      .filter(([_, item]) => item.answered)
      .map(([name, item]) => ({ name, ...item }));
  }
  
  /**
   * Get all unanswered items in order
   */
  getUnansweredItems() {
    return Object.entries(this.checklist)
      .filter(([_, item]) => !item.answered)
      .map(([name, item]) => ({ name, ...item }));
  }
  
  /**
   * Check if all checklist items are answered
   */
  isChecklistComplete() {
    return Object.values(this.checklist).every(item => item.answered);
  }
  
  /**
   * Add a conversation turn
   */
  addConversationTurn(speaker, message, timestamp = new Date()) {
    this.conversationHistory.push({
      speaker, // 'agent' | 'customer'
      message,
      timestamp: timestamp.toISOString(),
    });
  }
  
  /**
   * Get formatted conversation history
   */
  getFormattedHistory() {
    return this.conversationHistory
      .map(turn => `${turn.speaker}: ${turn.message}`)
      .join('\n');
  }
  
  /**
   * Set call outcome and stage
   */
  setCallOutcome(outcome, reason = null) {
    this.callOutcome = outcome;
    if (reason) {
      this.disqualificationReason = reason;
    }
    
    if (outcome !== CALL_OUTCOMES.ONGOING) {
      this.currentStage = CALL_STAGES.CLOSING;
    }
  }
  
  /**
   * Rebuild state from conversation history
   * This is called on every turn to ensure state consistency
   */
  rebuildFromHistory() {
    // Implementation note: In a real system, this would parse the conversation
    // history and extract all checklist items. For now, the state is maintained
    // incrementally through updateChecklistItem calls.
    // This method serves as a placeholder for future enhancement.
  }
  
  /**
   * Export state as JSON
   */
  toJSON() {
    return {
      sessionId: this.sessionId,
      customerName: this.customerName,
      agentName: this.agentName,
      agentGender: this.agentGender,
      companyName: this.companyName,
      language: this.language,
      callStartTime: this.callStartTime,
      currentDate: this.currentDate,
      currentDay: this.currentDay,
      currentTime: this.currentTime,
      identityVerified: this.identityVerified,
      offerPresented: this.offerPresented,
      customerConsentedToQuestions: this.customerConsentedToQuestions,
      existingLoanFlag: this.existingLoanFlag,
      callbackTime: this.callbackTime,
      callOutcome: this.callOutcome,
      currentStage: this.currentStage,
      checklist: this.checklist,
      conversationHistory: this.conversationHistory,
      additionalContext: this.additionalContext,
      disqualificationReason: this.disqualificationReason,
    };
  }
  
  /**
   * Create state from JSON
   */
  static fromJSON(json) {
    const state = new AgentState(
      json.sessionId,
      json.customerName,
      json.agentName,
      json.agentGender,
      json.companyName,
      json.language
    );
    
    Object.assign(state, json);
    return state;
  }
  
  // Helper methods for date/time formatting
  formatDate(date) {
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
  
  formatDay(date) {
    return date.toLocaleDateString('en-IN', { weekday: 'long' });
  }
  
  formatTime(date) {
    const hour = date.getHours();
    return hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  }
}

export default AgentState;
