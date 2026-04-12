import { invokeClaudeText } from './bedrockService.js';

const generateBlogContent = async (prompt) => {
  const fullPrompt = `You are an expert spiritual and astrological blog writer for a site called DevUtsav. Write a blog post based on the following prompt. Format the entire response in Markdown, suitable for a blog post. Include an engaging title as a # header.\n\nPrompt: ${prompt}`;

  try {
    return await invokeClaudeText(fullPrompt, {
      maxTokens: 2000,
      temperature: 0.7,
    });
  } catch (error) {
    console.error('Error generating blog content with Bedrock:', error.name, error.message);
    throw error;
  }
};

export default generateBlogContent;
