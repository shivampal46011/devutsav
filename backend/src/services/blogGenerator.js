import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.AWS_SQS_USER,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SQS_SECRET,
  },
});

const generateBlogContent = async (prompt) => {
  try {
    const fullPrompt = `You are an expert spiritual and astrological blog writer for a site called DevUtsav. Write a blog post based on the following prompt. Format the entire response in Markdown, suitable for a blog post. Include an engaging title as a # header.\n\nPrompt: ${prompt}`;

    const command = new ConverseCommand({
      modelId: process.env.BEDROCK_MODEL_ID || "deepseek.v3-v1:0",
      messages: [
        {
          role: "user",
          content: [{ text: fullPrompt }]
        }
      ],
      inferenceConfig: {
        maxTokens: 2000,
        temperature: 0.7
      }
    });

    const response = await bedrock.send(command);
    return response.output.message.content[0].text;
  } catch (error) {
    console.error('Error generating blog content with Bedrock:', error);
    throw error;
  }
};

export default generateBlogContent;
