/**
 * Special Flows
 * Implements busy, transfer, disqualification, loan limit, and handoff flows
 */

import { CALL_OUTCOMES, LANGUAGES, GENDERS, LOAN_CONSTANTS } from '../config/constants.js';

export class SpecialFlows {
  /**
   * Flow 9.1: BUSY FLOW
   * Customer is busy or asks to call later
   */
  static handleBusyFlow(state, language, agentGender) {
    const response = this.generateBusyResponse(language, agentGender);
    
    state.setCallOutcome(CALL_OUTCOMES.BUSY_CALLBACK);
    
    return {
      response,
      shouldEndCall: false, // Will end after getting callback time or customer says "anytime"
      needsCallbackTime: true,
    };
  }
  
  static generateBusyResponse(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'समझती हूँ' : 'समझता हूँ';
      return `ज़रूर, मैं ${verb}। आपको किस समय दोबारा कॉल करना ठीक रहेगा?`;
    }
    
    return `Certainly, I understand. What would be a convenient time for us to call you back?`;
  }
  
  static handleCallbackTimeResponse(state, callbackTime, language, agentGender) {
    if (!callbackTime || callbackTime.toLowerCase().includes('anytime')) {
      // No specific time given
      if (language === LANGUAGES.HINDI) {
        return `कोई बात नहीं, हम जल्द ही दोबारा कॉल करेंगे। आपके समय के लिए धन्यवाद।`;
      }
      return `No problem, we will call you again soon. Thank you for your time.`;
    }
    
    // Specific time given
    state.callbackTime = callbackTime;
    
    if (language === LANGUAGES.HINDI) {
      return `ठीक है, मैं ${callbackTime} पर दोबारा कॉल का इंतज़ाम करती हूँ। आपके समय के लिए धन्यवाद।`;
    }
    
    return `Sure, I will arrange a call back ${callbackTime}. Thank you for your time.`;
  }
  
  /**
   * Flow 9.2: TRANSFER FLOW
   * Existing loan on property or wants to reduce EMI
   */
  static handleTransferFlow(state, language, agentGender) {
    const response = this.generateTransferResponse(language, agentGender);
    
    state.setCallOutcome(CALL_OUTCOMES.TRANSFER);
    state.existingLoanFlag = true;
    
    return {
      response,
      shouldEndCall: true,
    };
  }
  
  static generateTransferResponse(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `बताने के लिए धन्यवाद। चूँकि आपकी प्रॉपर्टी पर पहले से लोन चल रहा है, इसके लिए हमारे लोन ट्रांसफर स्पेशलिस्ट जल्द ही आपसे संपर्क करेंगे। आपके समय के लिए धन्यवाद।`;
    }
    
    return `Thank you for sharing that. Since you already have an existing loan on the property, this will be handled by our loan transfer specialist. A specialist will contact you shortly. Thank you for your time.`;
  }
  
  static generateTransferResponseEMI(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `बताने के लिए धन्यवाद। चूँकि आप अपनी EMI कम करना चाहते हैं, इसके लिए हमारे लोन ट्रांसफर स्पेशलिस्ट जल्द ही आपसे संपर्क करेंगे। आपके समय के लिए धन्यवाद।`;
    }
    
    return `Thank you for sharing that. Since you would like to reduce your current EMI, this will be handled by our loan transfer specialist. A specialist will contact you shortly. Thank you for your time.`;
  }
  
  /**
   * Flow 9.3: DISQUALIFICATION FLOW
   * Customer does not meet criteria
   */
  static handleDisqualificationFlow(state, reason, language, agentGender) {
    const response = this.generateDisqualificationResponse(reason, language, agentGender);
    
    state.setCallOutcome(CALL_OUTCOMES.DISQUALIFIED, reason);
    
    return {
      response,
      shouldEndCall: true,
    };
  }
  
  static generateDisqualificationResponse(reason, language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const reasonText = this.translateReasonToHindi(reason);
      return `माफ़ कीजिए, ${reasonText}, अभी की जानकारी के हिसाब से आप इस ख़ास ऑफ़र के क्राइटेरिया में नहीं आते। आपके समय के लिए बहुत धन्यवाद, आपका दिन शुभ हो।`;
    }
    
    return `I am sorry, ${reason}, you do not meet the criteria for this specific offer at this time. Thank you so much for your time, and have a good day.`;
  }
  
  static translateReasonToHindi(reason) {
    const translations = {
      'the property is agricultural': 'चूँकि प्रॉपर्टी खेती की ज़मीन है',
      'the property type does not meet the criteria': 'चूँकि प्रॉपर्टी का प्रकार क्राइटेरिया में नहीं आता',
      'you are not an owner of the property': 'चूँकि आप प्रॉपर्टी के मालिक नहीं हैं',
      'the original documents are not available': 'चूँकि ओरिजिनल डॉक्यूमेंट्स उपलब्ध नहीं हैं',
      'your income is received in cash': 'चूँकि आपकी इनकम कैश में आती है',
      'you do not have a salaried job or run a business': 'चूँकि आपके पास नौकरी या बिज़नेस नहीं है',
      'the repayment period needs to be between three and fifteen years': 'चूँकि लोन की अवधि तीन से पंद्रह साल के बीच होनी चाहिए',
    };
    
    return translations[reason] || 'चूँकि जानकारी क्राइटेरिया में नहीं आती';
  }
  
  /**
   * Flow 9.4: LOAN LIMIT FLOW
   * Requested amount above ₹75 lakh
   */
  static handleLoanLimitFlow(requestedAmount, language, agentGender) {
    const response = this.generateLoanLimitResponse(language, agentGender);
    
    return {
      response,
      shouldEndCall: false, // Wait for customer decision
      needsDecision: true,
      maxAmount: LOAN_CONSTANTS.MAX_LOAN_AMOUNT,
    };
  }
  
  static generateLoanLimitResponse(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'समझती हूँ' : 'समझता हूँ';
      return `मैं ${verb}। इस ऑफ़र में हम अधिकतम पचहत्तर लाख रुपये तक का ही लोन दे सकते हैं। क्या आप पचहत्तर लाख रुपये के साथ आगे बढ़ना चाहेंगे?`;
    }
    
    return `I understand. For this offer, the maximum loan amount we can offer is seventy-five lakh rupees. Would you like to proceed with seventy-five lakh?`;
  }
  
  static handleLoanLimitDecision(customerResponse, state, language, agentGender) {
    const text = customerResponse.toLowerCase();
    
    // Positive response
    const positiveKeywords = ['yes', 'yeah', 'okay', 'ok', 'fine', 'proceed', 'haan', 'theek', 'ठीक', 'हाँ'];
    if (positiveKeywords.some(keyword => text.includes(keyword))) {
      // Accept max amount
      state.updateChecklistItem('loan_amount', LOAN_CONSTANTS.MAX_LOAN_AMOUNT);
      
      if (language === LANGUAGES.HINDI) {
        return { accepted: true, response: 'बढ़िया।' };
      }
      return { accepted: true, response: 'Great.' };
    }
    
    // Negative response or insists on higher
    const negativeKeywords = ['no', 'not', 'higher', 'more', 'nahi', 'नहीं', 'ज़्यादा'];
    if (negativeKeywords.some(keyword => text.includes(keyword))) {
      const response = this.generateLoanLimitRejection(language, agentGender);
      state.setCallOutcome(CALL_OUTCOMES.DISQUALIFIED, 'loan amount above offer limit');
      return { accepted: false, response, shouldEndCall: true };
    }
    
    // Unsure - ask again
    if (language === LANGUAGES.HINDI) {
      return { 
        accepted: null, 
        response: 'क्या मैं अभी के लिए पचहत्तर लाख रुपये नोट कर लूँ?',
        needsDecision: true 
      };
    }
    
    return { 
      accepted: null, 
      response: 'Should I note it as seventy-five lakh for now?',
      needsDecision: true 
    };
  }
  
  static generateLoanLimitRejection(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'समझती हूँ' : 'समझता हूँ';
      return `मैं ${verb}। चूँकि ज़रूरत इस ऑफ़र की सीमा से ज़्यादा है, मैं इसे आगे नहीं बढ़ा सकती। आपके समय के लिए धन्यवाद, आपका दिन शुभ हो।`;
    }
    
    return `I understand. Since the requirement is above the limit of this offer, I cannot take it forward. Thank you for your time, and have a good day.`;
  }
  
  /**
   * Flow 9.5: FINAL HANDOFF
   * All 7 items captured and eligible
   */
  static handleHandoffFlow(state, language, agentGender) {
    const response = this.generateHandoffResponse(state.customerName, language, agentGender);
    
    state.setCallOutcome(CALL_OUTCOMES.HANDOFF);
    
    return {
      response,
      shouldEndCall: true,
    };
  }
  
  static generateHandoffResponse(customerName, language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `सारी जानकारी देने के लिए धन्यवाद ${customerName} जी। आपकी शुरुआती जाँच पूरी हो गई है। हमारे सीनियर लोन एक्सपर्ट जल्द ही आपको कॉल करेंगे और सटीक ब्याज दर बताएँगे। आपके समय के लिए धन्यवाद, आपका दिन शुभ हो।`;
    }
    
    return `Thank you for sharing all the details, ${customerName}. Your preliminary check is complete. A senior loan expert will call you back shortly to share the exact interest rates and take it forward. Thank you for your time, and have a good day.`;
  }
  
  /**
   * NOT INTERESTED FLOW
   */
  static handleNotInterestedFlow(state, language, agentGender) {
    const response = this.generateNotInterestedResponse(language, agentGender);
    
    state.setCallOutcome(CALL_OUTCOMES.NOT_INTERESTED);
    
    return {
      response,
      shouldEndCall: true,
    };
  }
  
  static generateNotInterestedResponse(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `कोई बात नहीं। आपके समय के लिए धन्यवाद, आपका दिन शुभ हो।`;
    }
    
    return `No problem. Thank you for your time, and have a good day.`;
  }
  
  /**
   * ABUSIVE / DO NOT CALL FLOW
   */
  static handleAbusiveFlow(state, language, agentGender) {
    const response = this.generateAbusiveResponse(language, agentGender);
    
    state.setCallOutcome(CALL_OUTCOMES.NOT_INTERESTED, 'customer requested no further calls');
    
    return {
      response,
      shouldEndCall: true,
    };
  }
  
  static generateAbusiveResponse(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `माफ़ कीजिए। मैं पक्का करूँगी कि हम दोबारा कॉल नहीं करेंगे। आपका दिन शुभ हो।`;
    }
    
    return `I apologize. I will make sure we do not call again. Have a good day.`;
  }
  
  /**
   * NO RESPONSE / SILENCE FLOW
   */
  static handleNoResponseFlow(state, language, agentGender) {
    const response = this.generateNoResponseCheck(language, agentGender);
    
    return {
      response,
      isCheckingConnection: true,
    };
  }
  
  static generateNoResponseCheck(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `क्या आप वहाँ हैं?`;
    }
    
    return `Are you still there?`;
  }
  
  static handleContinuedSilence(state, language, agentGender) {
    const response = this.generateSilenceEndCall(language, agentGender);
    
    state.setCallOutcome(CALL_OUTCOMES.NO_RESPONSE);
    
    return {
      response,
      shouldEndCall: true,
    };
  }
  
  static generateSilenceEndCall(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `मैं बाद में दोबारा कॉल करती हूँ। धन्यवाद।`;
    }
    
    return `I will call back later. Thank you.`;
  }
}

export default SpecialFlows;
