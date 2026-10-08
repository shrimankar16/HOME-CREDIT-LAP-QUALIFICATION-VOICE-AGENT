/**
 * Conversation Stage Handlers
 * Implements greeting, identification, offer presentation, and eligibility questions
 */

import { CALL_STAGES, CHECKLIST_ORDER, CHECKLIST_ITEMS } from '../config/constants.js';
import { LanguageGenerator } from '../language/LanguageGenerator.js';

export class StageHandlers {
  /**
   * STAGE A: Greeting and Identification
   */
  static handleGreeting(state) {
    const greeting = LanguageGenerator.generateGreeting(
      state.agentName,
      state.companyName,
      state.customerName,
      state.currentTime,
      state.language,
      state.agentGender
    );
    
    state.currentStage = CALL_STAGES.IDENTIFICATION;
    return greeting;
  }
  
  /**
   * Handle identification response
   */
  static handleIdentificationResponse(state, customerResponse) {
    const text = customerResponse.toLowerCase();
    
    // Positive confirmation
    const positiveKeywords = ['yes', 'yeah', 'yep', 'speaking', 'this is', 'haan', 'ji', 'boliye', 'बोलिए', 'हाँ'];
    if (positiveKeywords.some(keyword => text.includes(keyword))) {
      state.identityVerified = true;
      return {
        verified: true,
        nextStage: CALL_STAGES.OFFER_PRESENTATION,
        response: null, // Will generate offer presentation
      };
    }
    
    // Asks who is calling / why
    if (text.includes('who') || text.includes('why') || text.includes('what') || 
        text.includes('kaun') || text.includes('kyon') || text.includes('कौन') || text.includes('क्यों')) {
      return {
        verified: false,
        nextStage: CALL_STAGES.IDENTIFICATION,
        response: LanguageGenerator.generateIdentityReintroduction(
          state.agentName,
          state.companyName,
          state.customerName,
          state.language,
          state.agentGender
        ),
      };
    }
    
    // Wrong number
    if (text.includes('wrong number') || text.includes('galat') || text.includes('गलत')) {
      return {
        verified: false,
        nextStage: CALL_STAGES.CLOSING,
        response: LanguageGenerator.generateWrongNumberApology(state.language, state.agentGender),
        shouldEndCall: true,
      };
    }
    
    // Someone else answers
    if (text.includes('not available') || text.includes('not here') || 
        text.includes('nahi hai') || text.includes('नहीं है')) {
      return {
        verified: false,
        nextStage: CALL_STAGES.CLOSING,
        response: LanguageGenerator.generateUnavailableCallback(
          state.customerName,
          state.language,
          state.agentGender
        ),
        shouldEndCall: false, // May ask for callback time
      };
    }
    
    // Unclear - try again
    return {
      verified: false,
      nextStage: CALL_STAGES.IDENTIFICATION,
      response: LanguageGenerator.generateClarificationRequest(
        state.customerName,
        state.language,
        state.agentGender
      ),
    };
  }
  
  /**
   * STAGE B: Offer Presentation
   */
  static handleOfferPresentation(state) {
    const offer = LanguageGenerator.generateOfferPresentation(
      state.customerName,
      state.language,
      state.agentGender
    );
    
    state.offerPresented = true;
    state.currentStage = CALL_STAGES.ELIGIBILITY_CHECK;
    return offer;
  }
  
  /**
   * Handle consent to questions
   */
  static handleConsentResponse(state, customerResponse) {
    const text = customerResponse.toLowerCase();
    
    // Positive consent
    const positiveKeywords = ['yes', 'sure', 'go ahead', 'okay', 'ok', 'fine', 'haan', 'theek', 'ठीक'];
    if (positiveKeywords.some(keyword => text.includes(keyword))) {
      state.customerConsentedToQuestions = true;
      return {
        consented: true,
        response: null, // Will ask first question
      };
    }
    
    // Asks more questions
    if (text.includes('?') || text.includes('what') || text.includes('how') || 
        text.includes('kya') || text.includes('kaise') || text.includes('क्या') || text.includes('कैसे')) {
      return {
        consented: false,
        needsAnswer: true,
        response: null, // Will be handled by question handler
      };
    }
    
    // Hesitant
    if (text.includes('scam') || text.includes('fraud') || text.includes('dhokha') || text.includes('धोखा')) {
      return {
        consented: false,
        response: LanguageGenerator.generateReassurance(
          state.companyName,
          state.language,
          state.agentGender
        ),
      };
    }
    
    // Default: assume hesitant, ask again
    return {
      consented: false,
      response: LanguageGenerator.generateConsentReask(state.language, state.agentGender),
    };
  }
  
  /**
   * STAGE C: Eligibility Checklist Questions
   * Get the next unanswered question
   */
  static getNextQuestion(state) {
    // Find first unanswered item in order
    for (const itemName of CHECKLIST_ORDER) {
      const item = state.checklist[itemName];
      
      if (!item.answered) {
        return {
          itemName,
          question: this.generateQuestionForItem(itemName, state.language, state.agentGender),
        };
      }
    }
    
    // All questions answered
    return null;
  }
  
  /**
   * Generate question text for a specific checklist item
   */
  static generateQuestionForItem(itemName, language, agentGender) {
    switch (itemName) {
      case CHECKLIST_ITEMS.PROPERTY_TYPE:
        return LanguageGenerator.generatePropertyTypeQuestion(language, agentGender);
      
      case CHECKLIST_ITEMS.OWNERSHIP:
        return LanguageGenerator.generateOwnershipQuestion(language, agentGender);
      
      case CHECKLIST_ITEMS.ORIGINAL_DOCS:
        return LanguageGenerator.generateDocumentsQuestion(language, agentGender);
      
      case CHECKLIST_ITEMS.LOAN_AMOUNT:
        return LanguageGenerator.generateLoanAmountQuestion(language, agentGender);
      
      case CHECKLIST_ITEMS.OCCUPATION:
        // Check if we have partial answer
        return LanguageGenerator.generateOccupationQuestion(language, agentGender);
      
      case CHECKLIST_ITEMS.MARKET_VALUE:
        return LanguageGenerator.generateMarketValueQuestion(language, agentGender);
      
      case CHECKLIST_ITEMS.TENURE_YEARS:
        return LanguageGenerator.generateTenureQuestion(language, agentGender);
      
      default:
        return null;
    }
  }
  
  /**
   * Generate a short acknowledgment before asking next question
   */
  static generateAcknowledgment(language) {
    const acknowledgments = {
      english: ['Got it', 'Okay', 'Thank you', 'Alright', 'I see', 'Sure', 'Understood'],
      hindi: ['ठीक है', 'समझ गया', 'धन्यवाद', 'अच्छा', 'जी हाँ', 'बढ़िया']
    };
    
    const list = acknowledgments[language] || acknowledgments.english;
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }
  
  /**
   * Build a complete response with acknowledgment + next question
   */
  static buildQuestionResponse(acknowledgment, question) {
    if (acknowledgment) {
      return `${acknowledgment}. ${question}`;
    }
    return question;
  }
  
  /**
   * Handle partial occupation answer
   * Returns follow-up question if only one part is answered
   */
  static handlePartialOccupationAnswer(state) {
    const occupation = state.checklist.occupation;
    
    if (occupation.occupation_type && !occupation.income_mode) {
      return LanguageGenerator.generateIncomeModeQuestion(state.language, state.agentGender);
    }
    
    if (!occupation.occupation_type && occupation.income_mode) {
      return LanguageGenerator.generateOccupationTypeQuestion(state.language, state.agentGender);
    }
    
    return null;
  }
}

export default StageHandlers;
