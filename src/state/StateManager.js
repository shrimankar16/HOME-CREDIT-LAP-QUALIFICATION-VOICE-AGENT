/**
 * State Manager
 * Manages multiple agent states (sessions) in memory
 */

import AgentState from './AgentState.js';

export class StateManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> AgentState
  }
  
  /**
   * Create a new session
   */
  createSession(sessionId, customerName, agentName, agentGender, companyName, language = 'english') {
    if (this.sessions.has(sessionId)) {
      throw new Error(`Session ${sessionId} already exists`);
    }
    
    const state = new AgentState(
      sessionId,
      customerName,
      agentName,
      agentGender,
      companyName,
      language
    );
    
    this.sessions.set(sessionId, state);
    return state;
  }
  
  /**
   * Get a session by ID
   */
  getSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return session;
  }
  
  /**
   * Check if a session exists
   */
  hasSession(sessionId) {
    return this.sessions.has(sessionId);
  }
  
  /**
   * Delete a session
   */
  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
  }
  
  /**
   * Get all active sessions
   */
  getAllSessions() {
    return Array.from(this.sessions.values());
  }
  
  /**
   * Get session count
   */
  getSessionCount() {
    return this.sessions.size;
  }
  
  /**
   * Clean up old sessions (optional - for production use)
   */
  cleanupOldSessions(maxAgeMinutes = 60) {
    const now = new Date();
    const deletedSessions = [];
    
    for (const [sessionId, state] of this.sessions.entries()) {
      const ageMinutes = (now - state.callStartTime) / (1000 * 60);
      if (ageMinutes > maxAgeMinutes) {
        this.sessions.delete(sessionId);
        deletedSessions.push(sessionId);
      }
    }
    
    return deletedSessions;
  }
  
  /**
   * Export all sessions to JSON
   */
  exportAllSessions() {
    const sessions = {};
    for (const [sessionId, state] of this.sessions.entries()) {
      sessions[sessionId] = state.toJSON();
    }
    return sessions;
  }
  
  /**
   * Import sessions from JSON
   */
  importSessions(sessionsJSON) {
    for (const [sessionId, stateJSON] of Object.entries(sessionsJSON)) {
      const state = AgentState.fromJSON(stateJSON);
      this.sessions.set(sessionId, state);
    }
  }
}

// Singleton instance
export const stateManager = new StateManager();

export default stateManager;
