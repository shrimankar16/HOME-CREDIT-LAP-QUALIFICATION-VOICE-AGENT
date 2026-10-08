/**
 * Application configuration
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  company: {
    name: process.env.COMPANY_NAME || 'Home Credit India',
    defaultAgentName: process.env.DEFAULT_AGENT_NAME || 'Priya',
    defaultAgentGender: process.env.DEFAULT_AGENT_GENDER || 'female',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
