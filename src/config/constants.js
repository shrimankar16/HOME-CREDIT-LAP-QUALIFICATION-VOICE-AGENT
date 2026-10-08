/**
 * System-wide constants for Home Credit LAP Voice Agent
 */

export const LOAN_CONSTANTS = {
  MAX_LOAN_AMOUNT: 7500000, // ₹75,00,000 (75 lakh)
  MIN_TENURE_YEARS: 3,
  MAX_TENURE_YEARS: 15,
};

export const PROPERTY_TYPES = {
  RESIDENTIAL: 'residential',
  COMMERCIAL: 'commercial',
  INDUSTRIAL: 'industrial',
  AGRICULTURAL: 'agricultural', // Not eligible
  OTHER: 'other', // Not eligible
};

export const OWNERSHIP_TYPES = {
  SOLE: 'sole',
  JOINT: 'joint',
};

export const DOCUMENT_STATUS = {
  AVAILABLE: 'available',
  NOT_AVAILABLE: 'not_available',
};

export const OCCUPATION_TYPES = {
  SALARIED: 'salaried',
  SELF_EMPLOYED: 'self_employed',
};

export const INCOME_MODES = {
  BANK: 'bank',
  CASH: 'cash',
};

export const CALL_OUTCOMES = {
  ONGOING: 'ongoing',
  BUSY_CALLBACK: 'busy_callback',
  NOT_INTERESTED: 'not_interested',
  DISQUALIFIED: 'disqualified',
  TRANSFER: 'transfer',
  HANDOFF: 'handoff',
  WRONG_PERSON: 'wrong_person',
  NO_RESPONSE: 'no_response',
};

export const CALL_STAGES = {
  GREETING: 'greeting',
  IDENTIFICATION: 'identification',
  OFFER_PRESENTATION: 'offer_presentation',
  ELIGIBILITY_CHECK: 'eligibility_check',
  SPECIAL_FLOW: 'special_flow',
  CLOSING: 'closing',
};

export const LANGUAGES = {
  ENGLISH: 'english',
  HINDI: 'hindi',
};

export const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
};

// Checklist items in order
export const CHECKLIST_ITEMS = {
  PROPERTY_TYPE: 'property_type',
  OWNERSHIP: 'ownership',
  ORIGINAL_DOCS: 'original_docs',
  LOAN_AMOUNT: 'loan_amount',
  OCCUPATION: 'occupation', // Includes income_mode
  MARKET_VALUE: 'market_value',
  TENURE_YEARS: 'tenure_years',
};

export const CHECKLIST_ORDER = [
  CHECKLIST_ITEMS.PROPERTY_TYPE,
  CHECKLIST_ITEMS.OWNERSHIP,
  CHECKLIST_ITEMS.ORIGINAL_DOCS,
  CHECKLIST_ITEMS.LOAN_AMOUNT,
  CHECKLIST_ITEMS.OCCUPATION,
  CHECKLIST_ITEMS.MARKET_VALUE,
  CHECKLIST_ITEMS.TENURE_YEARS,
];
