const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure the API key is loaded from .env
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables.');
}

// Initialize the client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Use a fast and capable model

/**
 * The central function for calling the LLM.
 * All prompts from all tools will go through this function.
 *
 * @param {string} promptText The user's prompt or the system-generated prompt.
 * @returns {Promise<string>} The generated text from the model.
 */
async function generateText(promptText) {
  // --- FUTURE IMPLEMENTATION: Runtime Guard ---
  // Here we will add checks to ensure no raw data rows or PII are sent to the LLM.
  // For now, we'll just log a placeholder message.
  console.log('aiClient: Applying runtime guards (placeholder)...');
  if (promptText.includes('SELECT * FROM')) {
    // This is a simplistic check; real checks will be more robust.
    console.warn('aiClient: Potential raw data leakage detected. Blocking for safety.');
    // In a real scenario, we would throw an error or return a safe response.
    // throw new Error('PII or raw data pattern detected in the prompt.');
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

// Export the functions that tools can use
module.exports = {
  generateText,
};