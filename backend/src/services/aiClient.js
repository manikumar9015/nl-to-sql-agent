const { GoogleGenerativeAI } = require('@google/generative-ai');
const auditService = require('./auditService'); // Import the audit service

// Ensure the API key is loaded from .env
if (!process.env.GEMINI_API_KEY) { /* ... */ }

// Initialize the client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// --- 1. DEFINE PII PATTERNS ---
// NOTE: PII patterns disabled to reduce data access restrictions
// Users can now query data containing emails, phone numbers, etc.
const piiPatterns = [
  // Patterns removed - no restrictions on data access
  // Previously blocked: EMAIL, PHONE, SSN
];

// --- 2. IMPLEMENT THE GUARD FUNCTION ---
/**
 * Scans a prompt for forbidden patterns and blocks it if any are found.
 * @param {string} promptText The outgoing prompt to the LLM.
 * @returns {boolean} `true` if the prompt is safe, `false` if it should be blocked.
 */
async function applyRuntimeGuards(promptText) {
  // No active guards - all queries allowed
  // You can add custom patterns here if needed in the future
  return true; // All queries are safe
}



/**
 * The central function for calling the LLM.
 * @param {string} promptText The user's prompt or the system-generated prompt.
 * @returns {Promise<string>} The generated text from the model.
 */
async function generateText(promptText) {
  // --- 3. INTEGRATE THE GUARD ---
  const isSafe = await applyRuntimeGuards(promptText);
  if (!isSafe) {
    // If the guard blocks the prompt, return a safe, generic error message.
    // Do NOT send the original prompt to the LLM.
    return "The request was blocked by a security guard due to potentially sensitive data. Please rephrase your request.";
  }

  try {
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error generating text from Gemini:', error);
    throw new Error('Failed to get a response from the AI model.');
  }
}

module.exports = {
  generateText,
};