/**
 * Question Handler
 * Handles customer questions, diversions, and interruptions
 * Section 10 from the prompt
 */

import { LANGUAGES, GENDERS } from '../config/constants.js';

export class QuestionHandler {
  /**
   * Detect if customer utterance contains a question
   */
  static detectQuestion(utterance) {
    const text = utterance.toLowerCase();
    
    // Question marks or question words
    const questionIndicators = [
      '?',
      'what', 'how', 'why', 'when', 'where', 'who', 'which',
      'kya', 'kaise', 'kyon', 'kab', 'kahan', 'kaun', 'konsa',
      'क्या', 'कैसे', 'क्यों', 'कब', 'कहाँ', 'कौन', 'कौनसा'
    ];
    
    return questionIndicators.some(indicator => text.includes(indicator));
  }
  
  /**
   * Answer customer questions based on type
   * Returns brief answer (1-2 sentences)
   */
  static answerQuestion(utterance, ragContext, language, agentGender) {
    const text = utterance.toLowerCase();
    
    // Interest rate question
    if (this.isInterestRateQuestion(text)) {
      return this.answerInterestRate(language, agentGender);
    }
    
    // EMI calculation question
    if (this.isEMIQuestion(text)) {
      return this.answerEMI(language, agentGender);
    }
    
    // Processing fee / charges
    if (this.isFeesQuestion(text)) {
      return this.answerFees(ragContext, language, agentGender);
    }
    
    // What is LAP
    if (this.isLAPExplanationQuestion(text)) {
      return this.explainLAP(language, agentGender);
    }
    
    // How much can I get
    if (this.isMaxAmountQuestion(text)) {
      return this.answerMaxAmount(language, agentGender);
    }
    
    // Is loan approved
    if (this.isApprovalQuestion(text)) {
      return this.answerApproval(language, agentGender);
    }
    
    // Documents needed
    if (this.isDocumentsQuestion(text)) {
      return this.answerDocuments(ragContext, language, agentGender);
    }
    
    // Branch location
    if (this.isBranchQuestion(text)) {
      return this.answerBranch(ragContext, language, agentGender);
    }
    
    // Are you AI / robot
    if (this.isAIQuestion(text)) {
      return this.answerAI(language, agentGender);
    }
    
    // Want to talk to human / manager
    if (this.isHumanRequest(text)) {
      return this.answerHumanRequest(language, agentGender);
    }
    
    // How did you get my number / is this safe
    if (this.isPrivacyQuestion(text)) {
      return this.answerPrivacy(language, agentGender);
    }
    
    // Generic answer with RAG context if available
    if (ragContext && ragContext !== 'none' && ragContext.trim().length > 0) {
      return this.answerFromRAG(ragContext, language, agentGender);
    }
    
    // Default: don't have that detail
    return this.answerDefault(language, agentGender);
  }
  
  // Question detection methods
  static isInterestRateQuestion(text) {
    return text.includes('interest') || text.includes('rate') || 
           text.includes('byaj') || text.includes('ब्याज');
  }
  
  static isEMIQuestion(text) {
    return text.includes('emi') || text.includes('monthly') || 
           text.includes('installment') || text.includes('किस्त');
  }
  
  static isFeesQuestion(text) {
    return text.includes('fee') || text.includes('charge') || text.includes('cost') ||
           text.includes('processing') || text.includes('hidden') || 
           text.includes('shulk') || text.includes('शुल्क');
  }
  
  static isLAPExplanationQuestion(text) {
    return (text.includes('what') && text.includes('loan against property')) ||
           (text.includes('kya') && text.includes('loan')) ||
           text.includes('explain');
  }
  
  static isMaxAmountQuestion(text) {
    return (text.includes('how much') && (text.includes('get') || text.includes('eligible'))) ||
           text.includes('kitna mil');
  }
  
  static isApprovalQuestion(text) {
    return text.includes('approved') || text.includes('approval') || 
           text.includes('guarantee') || text.includes('confirm') ||
           text.includes('pakka') || text.includes('पक्का');
  }
  
  static isDocumentsQuestion(text) {
    return text.includes('document') || text.includes('paper') || 
           text.includes('डॉक्यूमेंट') || text.includes('कागज़');
  }
  
  static isBranchQuestion(text) {
    return text.includes('branch') || text.includes('office') || 
           text.includes('location') || text.includes('शाखा');
  }
  
  static isAIQuestion(text) {
    return text.includes('robot') || text.includes('ai') || text.includes('artificial') ||
           text.includes('machine') || text.includes('real person');
  }
  
  static isHumanRequest(text) {
    return text.includes('human') || text.includes('person') || text.includes('manager') ||
           text.includes('senior') || text.includes('insaan') || text.includes('इंसान');
  }
  
  static isPrivacyQuestion(text) {
    return (text.includes('how') && text.includes('number')) || 
           text.includes('safe') || text.includes('secure') || 
           text.includes('privacy') || text.includes('surakshit') || text.includes('सुरक्षित');
  }
  
  // Answer generation methods
  static answerInterestRate(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `सटीक ब्याज दर हमारे सीनियर लोन एक्सपर्ट शुरुआती जाँच के बाद बताएँगे। पहले मैं कुछ बेसिक सवाल पूरे कर लूँ।`;
    }
    
    return `The exact interest rate will be shared by our senior loan expert once the preliminary check is done. Let me just complete a few basic questions first.`;
  }
  
  static answerEMI(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `EMI की जानकारी सीनियर लोन एक्सपर्ट देंगे। पहले मैं ये बेसिक सवाल पूरे कर लूँ।`;
    }
    
    return `The EMI details will be shared by our senior loan expert. Let me just complete these basic questions first.`;
  }
  
  static answerFees(ragContext, language, agentGender) {
    // Check if RAG has specific fee information
    if (ragContext && ragContext.includes('fee')) {
      // Use RAG context if available
      return this.answerFromRAG(ragContext, language, agentGender);
    }
    
    if (language === LANGUAGES.HINDI) {
      return `वह डिटेल्स सीनियर लोन एक्सपर्ट समझाएँगे।`;
    }
    
    return `Those details will be explained by the senior loan expert.`;
  }
  
  static explainLAP(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `यह एक लोन है जिसमें आप अपनी प्रॉपर्टी को सिक्योरिटी के तौर पर रखते हैं, और प्रॉपर्टी का इस्तेमाल आप जारी रख सकते हैं।`;
    }
    
    return `It is a loan where you borrow money by keeping your property as security, and you keep using the property.`;
  }
  
  static answerMaxAmount(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `इस ऑफ़र में पचहत्तर लाख रुपये तक, सीनियर लोन एक्सपर्ट के फ़ाइनल असेसमेंट के अधीन।`;
    }
    
    return `Up to seventy-five lakh rupees under this offer, subject to the senior loan expert's final assessment.`;
  }
  
  static answerApproval(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `यह एक प्री-अप्रूव्ड ऑफ़र है, जो शुरुआती जाँच के अधीन है। सीनियर लोन एक्सपर्ट डिटेल्स फ़ाइनल करेंगे।`;
    }
    
    return `This is a pre-approved offer subject to a quick preliminary check, and the senior loan expert will finalize the details.`;
  }
  
  static answerDocuments(ragContext, language, agentGender) {
    // If RAG has document list, use it briefly
    if (ragContext && (ragContext.includes('document') || ragContext.includes('proof'))) {
      // Provide brief info from RAG
      if (language === LANGUAGES.HINDI) {
        return `बेसिक डॉक्यूमेंट्स चाहिए होंगे। पूरी लिस्ट लोन एक्सपर्ट बताएँगे।`;
      }
      return `Basic documents will be needed. The full list will be shared by the loan expert.`;
    }
    
    if (language === LANGUAGES.HINDI) {
      return `पूरी डॉक्यूमेंट लिस्ट लोन एक्सपर्ट बताएँगे।`;
    }
    
    return `The loan expert will guide you on the full document list.`;
  }
  
  static answerBranch(ragContext, language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'नहीं है' : 'नहीं है';
      return `वह डिटेल मेरे पास अभी ${verb}। सीनियर लोन एक्सपर्ट मदद करेंगे।`;
    }
    
    return `I do not have that detail with me. The senior loan expert will help.`;
  }
  
  static answerAI(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const companyPlaceholder = 'Home Credit India';
      return `जी हाँ, मैं ${companyPlaceholder} की AI वॉइस असिस्टेंट हूँ, जो आपकी पूछताछ के पहले चरण में मदद करने के लिए हूँ।`;
    }
    
    return `Yes, I am an AI voice assistant from Home Credit India, here to help with the first step of your enquiry.`;
  }
  
  static answerHumanRequest(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `ज़रूर। इन कुछ छोटे सवालों के बाद हमारे सीनियर लोन एक्सपर्ट आपको कॉल करेंगे। बस एक मिनट का समय लगेगा।`;
    }
    
    return `Of course. Our senior loan expert will call you after these few quick questions. It will take just a minute.`;
  }
  
  static answerPrivacy(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'बुला रही हूँ' : 'बुला रहा हूँ';
      return `मैं इसलिए ${verb} क्योंकि आप Home Credit India के मौजूदा ग्राहक हैं। हम इस कॉल पर कोई OTP, PIN या password नहीं माँगेंगे।`;
    }
    
    return `I am calling because you are an existing customer of Home Credit India. We will not ask for any OTP, PIN, or password on this call.`;
  }
  
  static answerFromRAG(ragContext, language, agentGender) {
    // In a real implementation, this would intelligently extract
    // relevant info from RAG context and format it briefly
    // For now, return a generic response
    if (language === LANGUAGES.HINDI) {
      return `वह जानकारी सीनियर लोन एक्सपर्ट बताएँगे।`;
    }
    
    return `The senior loan expert will share that information.`;
  }
  
  static answerDefault(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'नहीं है' : 'नहीं है';
      return `वह डिटेल मेरे पास अभी ${verb}। सीनियर लोन एक्सपर्ट मदद करेंगे।`;
    }
    
    return `I do not have that detail with me. The senior loan expert will help.`;
  }
  
  /**
   * Handle customer refusal to answer a question
   */
  static handleRefusalToAnswer(itemName, language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `यह सवाल इसलिए ज़रूरी है ताकि मैं देख सकूँ कि ऑफ़र आपके लिए ठीक है या नहीं।`;
    }
    
    return `This question helps me check if the offer suits you.`;
  }
  
  static handleContinuedRefusal(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'कर सकती' : 'कर सकता';
      return `माफ़ कीजिए, इसके बिना मैं जाँच पूरी नहीं ${verb}। आपके समय के लिए धन्यवाद।`;
    }
    
    return `I am sorry, I cannot complete the check without this information. Thank you for your time.`;
  }
  
  /**
   * Handle off-topic chat or stories
   */
  static handleOffTopic(language, agentGender) {
    // Polite acknowledgment + steering back
    if (language === LANGUAGES.HINDI) {
      return `जी, समझ गई। और प्रॉपर्टी के बारे में एक बात...`;
    }
    
    return `I see. And just one more thing about the property...`;
  }
  
  /**
   * Handle request to repeat
   */
  static handleRepeatRequest(lastQuestion, language, agentGender) {
    // Rephrase in simpler words
    return lastQuestion; // In real implementation, would simplify the question
  }
  
  /**
   * Generate bridging phrase to return to questions after answering
   */
  static generateBridge(language, agentGender) {
    const bridges = {
      english: [
        'Now,',
        'So,',
        'Let me ask,',
        'Just to continue,',
      ],
      hindi: [
        'तो,',
        'अब,',
        'चलिए,',
        'बस एक सवाल,',
      ]
    };
    
    const list = bridges[language] || bridges.english;
    return list[Math.floor(Math.random() * list.length)];
  }
}

export default QuestionHandler;
