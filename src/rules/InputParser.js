/**
 * Input Parser
 * Extracts checklist facts from customer utterances
 * Handles natural language understanding for property types, amounts, etc.
 */

import {
  PROPERTY_TYPES,
  OWNERSHIP_TYPES,
  DOCUMENT_STATUS,
  OCCUPATION_TYPES,
  INCOME_MODES,
} from '../config/constants.js';

export class InputParser {
  /**
   * Parse property type from utterance
   * Handles: house, flat, apartment, shop, office, factory, farm, etc.
   */
  static parsePropertyType(utterance) {
    const text = utterance.toLowerCase();
    
    // Residential keywords
    const residentialKeywords = [
      'house', 'flat', 'apartment', 'home', 'villa', 'bungalow',
      'floor', 'residential', 'reside', 'living', 'duplex', 'penthouse',
      'ghar', 'makaan', 'मकान', 'घर', 'फ्लैट'
    ];
    
    // Commercial keywords
    const commercialKeywords = [
      'shop', 'office', 'commercial', 'showroom', 'mall', 'store',
      'business premises', 'workspace', 'retail', 'dukan', 'दुकान',
      'ऑफिस', 'व्यापार'
    ];
    
    // Industrial keywords
    const industrialKeywords = [
      'factory', 'industrial', 'manufacturing', 'warehouse', 'plant',
      'shed', 'godown', 'फैक्टरी', 'कारख़ाना'
    ];
    
    // Agricultural keywords (NOT ELIGIBLE)
    const agriculturalKeywords = [
      'farm', 'agricultural', 'agriculture', 'farmland', 'field',
      'खेत', 'खेती', 'कृषि', 'ज़मीन'
    ];
    
    // Check for agricultural (disqualifying)
    if (agriculturalKeywords.some(keyword => text.includes(keyword))) {
      return PROPERTY_TYPES.AGRICULTURAL;
    }
    
    // Check for residential
    if (residentialKeywords.some(keyword => text.includes(keyword))) {
      return PROPERTY_TYPES.RESIDENTIAL;
    }
    
    // Check for commercial
    if (commercialKeywords.some(keyword => text.includes(keyword))) {
      return PROPERTY_TYPES.COMMERCIAL;
    }
    
    // Check for industrial
    if (industrialKeywords.some(keyword => text.includes(keyword))) {
      return PROPERTY_TYPES.INDUSTRIAL;
    }
    
    return null;
  }
  
  /**
   * Parse ownership from utterance
   * Handles: sole, joint, with wife, family property, etc.
   */
  static parseOwnership(utterance) {
    const text = utterance.toLowerCase();
    
    // Joint ownership keywords
    const jointKeywords = [
      'joint', 'jointly', 'with', 'family', 'co-own', 'shared',
      'wife', 'husband', 'father', 'mother', 'brother', 'sister',
      'partner', 'ancestral', 'साथ', 'संयुक्त', 'परिवार'
    ];
    
    // Sole ownership keywords
    const soleKeywords = [
      'my own', 'only my name', 'sole', 'mine', 'myself',
      'अकेले', 'सिर्फ़ मेरे नाम'
    ];
    
    // Check for joint
    if (jointKeywords.some(keyword => text.includes(keyword))) {
      return OWNERSHIP_TYPES.JOINT;
    }
    
    // Check for sole
    if (soleKeywords.some(keyword => text.includes(keyword))) {
      return OWNERSHIP_TYPES.SOLE;
    }
    
    // Default positive responses to sole
    if (/^(yes|yeah|haan|ji|correct|right)$/i.test(text.trim())) {
      // Context dependent - needs previous question
      return null;
    }
    
    return null;
  }
  
  /**
   * Parse document availability from utterance
   */
  static parseDocumentStatus(utterance) {
    const text = utterance.toLowerCase();
    
    // Available keywords
    const availableKeywords = [
      'yes', 'available', 'have', 'with me', 'at home', 'locker',
      'can arrange', 'got them', 'हाँ', 'उपलब्ध', 'मौजूद'
    ];
    
    // Not available keywords
    const notAvailableKeywords = [
      'no', 'not available', 'don\'t have', 'lost', 'photocopy',
      'photocopies', 'copy', 'नहीं', 'खो गए'
    ];
    
    // Check for not available
    if (notAvailableKeywords.some(keyword => text.includes(keyword))) {
      return DOCUMENT_STATUS.NOT_AVAILABLE;
    }
    
    // Check for available
    if (availableKeywords.some(keyword => text.includes(keyword))) {
      return DOCUMENT_STATUS.AVAILABLE;
    }
    
    return null;
  }
  
  /**
   * Parse loan amount from utterance
   * Handles: "50 lakh", "1 crore", "7500000", etc.
   */
  static parseLoanAmount(utterance) {
    const text = utterance.toLowerCase();
    
    // Remove common prefixes
    let cleaned = text.replace(/around|about|approximately|roughly|लगभग/gi, '').trim();
    
    // Pattern for numbers with units
    const lakhPattern = /(\d+(?:\.\d+)?)\s*(?:lakh|lac|लाख)/i;
    const crorePattern = /(\d+(?:\.\d+)?)\s*(?:crore|cr|करोड़)/i;
    const plainNumberPattern = /(\d{4,})/;
    
    // Check for crore
    const croreMatch = cleaned.match(crorePattern);
    if (croreMatch) {
      return parseFloat(croreMatch[1]) * 10000000;
    }
    
    // Check for lakh
    const lakhMatch = cleaned.match(lakhPattern);
    if (lakhMatch) {
      return parseFloat(lakhMatch[1]) * 100000;
    }
    
    // Check for plain number
    const plainMatch = cleaned.match(plainNumberPattern);
    if (plainMatch) {
      return parseInt(plainMatch[1]);
    }
    
    return null;
  }
  
  /**
   * Parse occupation type from utterance
   */
  static parseOccupationType(utterance) {
    const text = utterance.toLowerCase();
    
    // Salaried keywords
    const salariedKeywords = [
      'salaried', 'job', 'employed', 'employee', 'work for', 'company',
      'salary', 'नौकरी', 'वेतन'
    ];
    
    // Self-employed keywords
    const selfEmployedKeywords = [
      'business', 'self-employed', 'own business', 'entrepreneur',
      'shop', 'practice', 'freelance', 'व्यापार', 'बिज़नेस', 'ख़ुद का'
    ];
    
    // Check for self-employed
    if (selfEmployedKeywords.some(keyword => text.includes(keyword))) {
      return OCCUPATION_TYPES.SELF_EMPLOYED;
    }
    
    // Check for salaried
    if (salariedKeywords.some(keyword => text.includes(keyword))) {
      return OCCUPATION_TYPES.SALARIED;
    }
    
    return null;
  }
  
  /**
   * Parse income mode from utterance
   */
  static parseIncomeMode(utterance) {
    const text = utterance.toLowerCase();
    
    // Bank keywords
    const bankKeywords = [
      'bank', 'account', 'transfer', 'cheque', 'check', 'neft', 'upi',
      'credited', 'बैंक', 'खाते'
    ];
    
    // Cash keywords
    const cashKeywords = [
      'cash', 'नकद', 'नक़द'
    ];
    
    // Check for cash (disqualifying)
    if (cashKeywords.some(keyword => text.includes(keyword))) {
      return INCOME_MODES.CASH;
    }
    
    // Check for bank
    if (bankKeywords.some(keyword => text.includes(keyword))) {
      return INCOME_MODES.BANK;
    }
    
    return null;
  }
  
  /**
   * Parse market value from utterance
   */
  static parseMarketValue(utterance) {
    const text = utterance.toLowerCase();
    
    // Use same logic as loan amount
    const amount = this.parseLoanAmount(utterance);
    
    if (amount) {
      return amount;
    }
    
    // Check for "don't know" or "unsure"
    if (text.includes('don\'t know') || text.includes('not sure') || 
        text.includes('unsure') || text.includes('नहीं पता')) {
      return 'customer unsure';
    }
    
    return null;
  }
  
  /**
   * Parse tenure from utterance
   * Handles: "10 years", "120 months", "fifteen years"
   */
  static parseTenure(utterance) {
    const text = utterance.toLowerCase();
    
    // Pattern for years
    const yearsPattern = /(\d+)\s*(?:years?|yrs?|साल)/i;
    const monthsPattern = /(\d+)\s*(?:months?|महीने)/i;
    
    // Check for years
    const yearsMatch = text.match(yearsPattern);
    if (yearsMatch) {
      return parseInt(yearsMatch[1]);
    }
    
    // Check for months and convert to years
    const monthsMatch = text.match(monthsPattern);
    if (monthsMatch) {
      return parseInt(monthsMatch[1]) / 12;
    }
    
    // Try to extract just a number if followed by context
    const numberMatch = text.match(/\b(\d+)\b/);
    if (numberMatch) {
      return parseInt(numberMatch[1]);
    }
    
    return null;
  }
  
  /**
   * Extract all checklist items from a single utterance
   * Returns an object with all found items
   */
  static extractAllItems(utterance) {
    return {
      property_type: this.parsePropertyType(utterance),
      ownership: this.parseOwnership(utterance),
      original_docs: this.parseDocumentStatus(utterance),
      loan_amount: this.parseLoanAmount(utterance),
      occupation_type: this.parseOccupationType(utterance),
      income_mode: this.parseIncomeMode(utterance),
      market_value: this.parseMarketValue(utterance),
      tenure_years: this.parseTenure(utterance),
    };
  }
  
  /**
   * Detect if customer is busy or requesting callback
   */
  static detectBusyRequest(utterance) {
    const text = utterance.toLowerCase();
    const busyKeywords = [
      'busy', 'call later', 'call back', 'not a good time', 'driving',
      'meeting', 'व्यस्त', 'बाद में'
    ];
    
    return busyKeywords.some(keyword => text.includes(keyword));
  }
  
  /**
   * Detect if customer is not interested
   */
  static detectNotInterested(utterance) {
    const text = utterance.toLowerCase();
    const notInterestedKeywords = [
      'not interested', 'no thanks', 'not needed', 'don\'t want',
      'don\'t need', 'रुचि नहीं', 'ज़रूरत नहीं'
    ];
    
    return notInterestedKeywords.some(keyword => text.includes(keyword));
  }
  
  /**
   * Detect existing loan mention
   */
  static detectExistingLoan(utterance) {
    const text = utterance.toLowerCase();
    const existingLoanKeywords = [
      'existing loan', 'already have a loan', 'current loan', 'mortgaged',
      'reduce emi', 'lower emi', 'balance transfer', 'transfer loan',
      'पहले से लोन', 'मौजूदा लोन'
    ];
    
    return existingLoanKeywords.some(keyword => text.includes(keyword));
  }
}

export default InputParser;
