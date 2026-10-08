/**
 * Eligibility Rules Engine
 * Validates all 7 checklist items according to Home Credit LAP requirements
 */

import {
  LOAN_CONSTANTS,
  PROPERTY_TYPES,
  OWNERSHIP_TYPES,
  DOCUMENT_STATUS,
  OCCUPATION_TYPES,
  INCOME_MODES,
} from '../config/constants.js';

export class EligibilityResult {
  constructor(isEligible, reason = null, needsClarification = false, clarificationQuestion = null) {
    this.isEligible = isEligible;
    this.reason = reason;
    this.needsClarification = needsClarification;
    this.clarificationQuestion = clarificationQuestion;
  }
  
  static eligible() {
    return new EligibilityResult(true);
  }
  
  static ineligible(reason) {
    return new EligibilityResult(false, reason);
  }
  
  static needsClarification(question) {
    return new EligibilityResult(null, null, true, question);
  }
}

export class EligibilityRules {
  /**
   * Rule 8.1: Property Type
   * Eligible: residential, commercial, industrial
   * Not eligible: agricultural, other
   */
  static validatePropertyType(propertyType) {
    if (!propertyType) {
      return EligibilityResult.needsClarification(
        'Is it a residential, commercial, industrial, or agricultural property?'
      );
    }
    
    const type = propertyType.toLowerCase();
    
    // Eligible types
    if (
      type === PROPERTY_TYPES.RESIDENTIAL ||
      type === PROPERTY_TYPES.COMMERCIAL ||
      type === PROPERTY_TYPES.INDUSTRIAL
    ) {
      return EligibilityResult.eligible();
    }
    
    // Agricultural - not eligible
    if (type === PROPERTY_TYPES.AGRICULTURAL) {
      return EligibilityResult.ineligible('the property is agricultural');
    }
    
    // Other - not eligible
    return EligibilityResult.ineligible('the property type does not meet the criteria');
  }
  
  /**
   * Rule 8.2: Ownership
   * Eligible: sole, joint (both fine)
   * Not eligible: not an owner at all
   */
  static validateOwnership(ownership) {
    if (!ownership) {
      return EligibilityResult.needsClarification(
        'Is the property only in your name, or is it jointly owned with family or partners?'
      );
    }
    
    const type = ownership.toLowerCase();
    
    if (type === OWNERSHIP_TYPES.SOLE || type === OWNERSHIP_TYPES.JOINT) {
      return EligibilityResult.eligible();
    }
    
    return EligibilityResult.ineligible('you are not an owner of the property');
  }
  
  /**
   * Rule 8.3: Original Documents
   * Eligible: available
   * Not eligible: not available (photocopies only, lost, none)
   */
  static validateOriginalDocuments(documentStatus) {
    if (!documentStatus) {
      return EligibilityResult.needsClarification(
        'Just to confirm, the original documents are available with you, correct?'
      );
    }
    
    const status = documentStatus.toLowerCase();
    
    if (status === DOCUMENT_STATUS.AVAILABLE) {
      return EligibilityResult.eligible();
    }
    
    if (status === DOCUMENT_STATUS.NOT_AVAILABLE) {
      return EligibilityResult.ineligible('the original documents are not available');
    }
    
    return EligibilityResult.needsClarification(
      'Just to confirm, the original documents are available with you, correct?'
    );
  }
  
  /**
   * Rule 8.4: Loan Amount
   * Eligible: ≤ ₹75,00,000 (75 lakh)
   * Special flow: above limit (not instant rejection)
   */
  static validateLoanAmount(loanAmount) {
    if (!loanAmount && loanAmount !== 0) {
      return EligibilityResult.needsClarification(
        'How much loan amount are you looking for?'
      );
    }
    
    // Convert to number if string
    const amount = typeof loanAmount === 'string' ? 
      this.parseLoanAmount(loanAmount) : loanAmount;
    
    if (isNaN(amount)) {
      return EligibilityResult.needsClarification(
        'Could you please confirm the loan amount in rupees or lakhs?'
      );
    }
    
    if (amount <= LOAN_CONSTANTS.MAX_LOAN_AMOUNT) {
      return EligibilityResult.eligible();
    }
    
    // Above limit triggers special flow (handled separately), not instant disqualification
    return new EligibilityResult(false, 'amount_above_limit', false, null);
  }
  
  /**
   * Rule 8.5: Occupation and Income Mode
   * Eligible: (salaried OR self-employed) AND income in bank
   * Not eligible: income in cash, or neither occupation type
   */
  static validateOccupationAndIncome(occupationType, incomeMode) {
    // Need both to be answered
    if (!occupationType) {
      return EligibilityResult.needsClarification(
        'Are you salaried, or do you run your own business?'
      );
    }
    
    if (!incomeMode) {
      return EligibilityResult.needsClarification(
        'Is your income received in your bank account, or in cash?'
      );
    }
    
    const occupation = occupationType.toLowerCase();
    const income = incomeMode.toLowerCase();
    
    // Check occupation type
    const validOccupation = 
      occupation === OCCUPATION_TYPES.SALARIED || 
      occupation === OCCUPATION_TYPES.SELF_EMPLOYED;
    
    if (!validOccupation) {
      return EligibilityResult.ineligible('you do not have a salaried job or run a business');
    }
    
    // Check income mode
    if (income === INCOME_MODES.CASH) {
      return EligibilityResult.ineligible('your income is received in cash');
    }
    
    if (income === INCOME_MODES.BANK) {
      return EligibilityResult.eligible();
    }
    
    return EligibilityResult.needsClarification(
      'Is most of your income received in your bank account?'
    );
  }
  
  /**
   * Rule 8.6: Market Value
   * Any estimate is accepted. No minimum. No maximum.
   */
  static validateMarketValue(marketValue) {
    if (!marketValue) {
      return EligibilityResult.needsClarification(
        'Roughly what is the current market value of the property?'
      );
    }
    
    // Any value is acceptable, including "customer unsure"
    return EligibilityResult.eligible();
  }
  
  /**
   * Rule 8.7: Tenure
   * Valid: 3 to 15 years inclusive
   * Invalid: below 3 or above 15 years
   */
  static validateTenure(tenureYears) {
    if (!tenureYears && tenureYears !== 0) {
      return EligibilityResult.needsClarification(
        'Over how many years would you like to repay the loan?'
      );
    }
    
    const tenure = typeof tenureYears === 'string' ? 
      parseFloat(tenureYears) : tenureYears;
    
    if (isNaN(tenure)) {
      return EligibilityResult.needsClarification(
        'Could you please confirm the number of years?'
      );
    }
    
    if (tenure >= LOAN_CONSTANTS.MIN_TENURE_YEARS && 
        tenure <= LOAN_CONSTANTS.MAX_TENURE_YEARS) {
      return EligibilityResult.eligible();
    }
    
    return EligibilityResult.ineligible(
      'the repayment period needs to be between three and fifteen years'
    );
  }
  
  /**
   * Validate all checklist items
   * Returns an object with validation results for each item
   */
  static validateAllItems(checklist) {
    const results = {
      property_type: this.validatePropertyType(checklist.property_type?.value),
      ownership: this.validateOwnership(checklist.ownership?.value),
      original_docs: this.validateOriginalDocuments(checklist.original_docs?.value),
      loan_amount: this.validateLoanAmount(checklist.loan_amount?.value),
      occupation: this.validateOccupationAndIncome(
        checklist.occupation?.occupation_type,
        checklist.occupation?.income_mode
      ),
      market_value: this.validateMarketValue(checklist.market_value?.value),
      tenure_years: this.validateTenure(checklist.tenure_years?.value),
    };
    
    return results;
  }
  
  /**
   * Check if all answered items are eligible
   */
  static areAllAnsweredItemsEligible(checklist) {
    const results = this.validateAllItems(checklist);
    
    for (const [itemName, item] of Object.entries(checklist)) {
      if (item.answered) {
        const result = results[itemName];
        if (result && result.isEligible === false && result.reason !== 'amount_above_limit') {
          return { eligible: false, reason: result.reason, item: itemName };
        }
      }
    }
    
    return { eligible: true };
  }
  
  /**
   * Helper: Parse loan amount from various formats
   * Examples: "50 lakh", "1 crore", "7500000", "1.5 crore"
   */
  static parseLoanAmount(amountString) {
    if (typeof amountString === 'number') {
      return amountString;
    }
    
    const str = amountString.toLowerCase().trim();
    
    // Remove commas and rupee symbol
    let cleaned = str.replace(/,/g, '').replace(/₹/g, '').replace(/rs\.?/g, '').trim();
    
    // Handle "lakh" or "lac"
    if (cleaned.includes('lakh') || cleaned.includes('lac')) {
      const number = parseFloat(cleaned);
      return number * 100000;
    }
    
    // Handle "crore" or "cr"
    if (cleaned.includes('crore') || cleaned.includes('cr')) {
      const number = parseFloat(cleaned);
      return number * 10000000;
    }
    
    // Handle "thousand" or "k"
    if (cleaned.includes('thousand') || cleaned.includes('k')) {
      const number = parseFloat(cleaned);
      return number * 1000;
    }
    
    // Plain number
    return parseFloat(cleaned);
  }
  
  /**
   * Helper: Convert tenure in months to years
   */
  static convertMonthsToYears(months) {
    return months / 12;
  }
}

export default EligibilityRules;
