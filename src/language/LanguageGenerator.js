/**
 * Language Generator
 * Generates responses in English or Hindi with proper gender agreement
 */

import { LANGUAGES, GENDERS } from '../config/constants.js';

export class LanguageGenerator {
  /**
   * Greeting and Identification
   */
  static generateGreeting(agentName, companyName, customerName, currentTime, language, agentGender) {
    const timeOfDay = this.getGreetingTime(currentTime);
    
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'बोल रही हूँ' : 'बोल रहा हूँ';
      return `नमस्ते, मैं ${companyName} से ${agentName} ${verb}। क्या मेरी बात ${customerName} जी से हो रही है?`;
    }
    
    return `Hello, good ${timeOfDay}. This is ${agentName} calling from ${companyName}. Am I speaking with ${customerName}?`;
  }
  
  static getGreetingTime(currentTime) {
    if (currentTime === 'morning') return 'morning';
    if (currentTime === 'afternoon') return 'afternoon';
    return 'evening';
  }
  
  static generateIdentityReintroduction(agentName, companyName, customerName, language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'बुला रही हूँ' : 'बुला रहा हूँ';
      return `जी, मैं ${companyName} से ${verb}। यह हमारे क़ीमती ग्राहकों के लिए एक ख़ास ऑफ़र के बारे में है। क्या मैं ${customerName} जी से बात कर रहा हूँ?`;
    }
    
    return `I am ${agentName} from ${companyName}. This is regarding a special offer for our valued customers. Am I speaking with ${customerName}?`;
  }
  
  static generateWrongNumberApology(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'लगी' : 'लगा';
      return `माफ़ कीजिए, गलती से कॉल ${verb}। आपका दिन शुभ हो।`;
    }
    
    return `I apologize for the inconvenience. Have a good day.`;
  }
  
  static generateUnavailableCallback(customerName, language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `जी ठीक है। ${customerName} जी को कब फ़ोन करना सही रहेगा?`;
    }
    
    return `I understand. When would be a good time to reach ${customerName}?`;
  }
  
  static generateClarificationRequest(customerName, language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'सुन नहीं पाई' : 'सुन नहीं पाया';
      return `माफ़ कीजिए, मैं सही से ${verb}। क्या मैं ${customerName} जी से बात कर रहा हूँ?`;
    }
    
    return `Sorry, I could not hear you clearly. Am I speaking with ${customerName}?`;
  }
  
  /**
   * Offer Presentation
   */
  static generateOfferPresentation(customerName, language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'पूछ सकती हूँ' : 'पूछ सकता हूँ';
      return `धन्यवाद ${customerName} जी। हमारे बहुत ही क़ीमती ग्राहक होने के नाते, आपके लिए प्रॉपर्टी पर लोन यानी Loan Against Property का एक ख़ास ऑफ़र है, जो पचहत्तर लाख रुपये तक का है। क्या मैं कुछ छोटे सवाल ${verb}, ताकि देख सकूँ कि ये ऑफ़र आपके लिए ठीक रहेगा या नहीं?`;
    }
    
    return `Thank you, ${customerName}. We are calling because, as one of our valued customers, you have a special Loan Against Property offer of up to seventy-five lakh rupees. I would just like to ask a few quick questions to check if this offer suits you. Is that alright?`;
  }
  
  static generateReassurance(companyName, language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'बुला रही हूँ' : 'बुला रहा हूँ';
      return `मैं ${companyName} से ${verb} क्योंकि आप हमारे मौजूदा ग्राहक हैं। यह सिर्फ़ एक शुरुआती जाँच है। हम इस कॉल पर कोई OTP, PIN या password नहीं माँगेंगे। क्या मैं आगे बढ़ सकता हूँ?`;
    }
    
    return `I am calling from ${companyName} because you are an existing customer. This is only a preliminary eligibility check, and a senior loan expert will follow up. We will not ask for any OTP, PIN, or password on this call. May I proceed?`;
  }
  
  static generateConsentReask(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      const verb = agentGender === GENDERS.FEMALE ? 'पूछ सकती हूँ' : 'पूछ सकता हूँ';
      return `यह सिर्फ़ कुछ छोटे सवाल हैं। क्या मैं ${verb}?`;
    }
    
    return `It will just take a moment. May I ask a few quick questions?`;
  }
  
  /**
   * Eligibility Questions (7 items)
   */
  
  // Q1: Property Type
  static generatePropertyTypeQuestion(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `आपकी प्रॉपर्टी किस तरह की है? रेज़िडेंशियल, यानी घर या फ़्लैट, कमर्शियल, यानी दुकान या ऑफ़िस, या इंडस्ट्रियल, यानी फ़ैक्टरी?`;
    }
    
    return `What kind of property is it? Residential, like a house or flat, commercial, like a shop or office, or industrial, like a factory?`;
  }
  
  // Q2: Ownership
  static generateOwnershipQuestion(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `क्या वह प्रॉपर्टी सिर्फ़ आपके नाम पर है, या परिवार या किसी और के साथ जॉइंट है?`;
    }
    
    return `Is the property only in your name, or is it jointly owned with family or partners?`;
  }
  
  // Q3: Original Documents
  static generateDocumentsQuestion(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `क्या प्रॉपर्टी के ओरिजिनल डॉक्यूमेंट्स वेरिफ़िकेशन के लिए आपके पास उपलब्ध हैं?`;
    }
    
    return `Do you have the original property documents available for verification?`;
  }
  
  // Q4: Loan Amount
  static generateLoanAmountQuestion(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `आप लगभग कितने रुपये का लोन लेना चाहते हैं?`;
    }
    
    return `How much loan amount are you looking for?`;
  }
  
  // Q5: Occupation (combined question)
  static generateOccupationQuestion(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `आप नौकरी करते हैं या अपना बिज़नेस चलाते हैं? और आपकी इनकम बैंक अकाउंट में आती है या कैश में?`;
    }
    
    return `Are you salaried, or do you run your own business? And is your income received in your bank account, or in cash?`;
  }
  
  // Q5a: Only Occupation Type
  static generateOccupationTypeQuestion(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `आप नौकरी करते हैं या अपना बिज़नेस चलाते हैं?`;
    }
    
    return `Are you salaried, or do you run your own business?`;
  }
  
  // Q5b: Only Income Mode
  static generateIncomeModeQuestion(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `और आपकी इनकम बैंक अकाउंट में आती है या कैश में?`;
    }
    
    return `And is your income received in your bank account, or in cash?`;
  }
  
  // Q6: Market Value
  static generateMarketValueQuestion(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `आपकी प्रॉपर्टी की आज की अंदाज़न मार्केट वैल्यू कितनी होगी?`;
    }
    
    return `Roughly what is the current market value of the property?`;
  }
  
  // Q7: Tenure
  static generateTenureQuestion(language, agentGender) {
    if (language === LANGUAGES.HINDI) {
      return `आप यह लोन कितने सालों में चुकाना चाहेंगे?`;
    }
    
    return `Over how many years would you like to repay the loan?`;
  }
  
  /**
   * Generate acknowledgments
   */
  static generateAcknowledgment(language) {
    const acknowledgments = {
      english: ['Got it', 'Okay', 'Thank you', 'Alright', 'I see', 'Sure'],
      hindi: ['ठीक है', 'अच्छा', 'धन्यवाद', 'समझ गया', 'बढ़िया', 'जी हाँ']
    };
    
    const list = acknowledgments[language] || acknowledgments.english;
    return list[Math.floor(Math.random() * list.length)];
  }
}

export default LanguageGenerator;
