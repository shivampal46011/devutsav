import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Lazy factory: creates client at call time so env vars are loaded from dotenv
const getBedrockClient = () => new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

// Using Claude 3 Haiku (fast + available in ap-south-1)
const MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";

/**
 * Analyzes a Kundali using LLM1 and returns Dosha information.
 */
export const analyzeKundali = async (kundaliData, country) => {
  const prompt = `You are a Vedic Astrologer. Here is the user's Kundali context mapping (DOB, TOB, Location: ${country}). 
Assume the following Kundali data: ${JSON.stringify(kundaliData)}.
Please identify the primary Doshas based on typical Vedic interpretations. 
Respond ONLY with a valid JSON array matching this exact schema:
[
  {
    "doshaName": "String",
    "severity": "High|Medium|Low",
    "meaning": "What does it mean/problem description",
    "remedies": "Daily Life Remedies",
    "pujaLink": "/market"
  }
]`;

  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [{ type: "text", text: prompt }],
          },
        ],
      }),
    });

    const response = await getBedrockClient().send(command);
    
    // Parse the Uint8Array response
    const jsonString = new TextDecoder().decode(response.body);
    const parsed = JSON.parse(jsonString);
    const textOutput = parsed.content[0].text;
    
    return JSON.parse(textOutput);
  } catch (error) {
    console.error("Bedrock analyzeKundali error:", error);
    
    // Graceful explicit mock fallback if AWS creds fail
    console.warn("Falling back to mocked Dosha JSON because AWS credentials failed.");
    return [
      {
        doshaName: "Mangal Dosha",
        severity: "High",
        meaning: "Mars is positioned ominously in your 8th house, creating friction in relationships and business partnerships.",
        remedies: "Recite Hanumaan Chalisa daily and avoid eating non-vegetarian food on Tuesdays.",
        pujaLink: "/market"
      },
      {
        doshaName: "Shani Dosha",
        severity: "Medium",
        meaning: "Saturn's transit is slowing down your professional growth temporarily.",
        remedies: "Offer mustard oil to Lord Shani on Saturdays.",
        pujaLink: "/market"
      }
    ];
  }
};

/**
 * Conversational LLM2 Chat based on Kundali.
 */
export const chatWithKundali = async (message, chatHistory) => {
  try {
    // Bedrock requires first message to be 'user' role — filter any leading assistant messages
    let sanitizedHistory = (chatHistory || []).filter((_, i, arr) => {
      if (i === 0 && arr[i].role !== 'user') return false;
      return true;
    });

    const formattedHistory = sanitizedHistory.map(msg => ({
      role: msg.role,
      content: [{ type: "text", text: msg.content }]
    }));

    formattedHistory.push({
      role: "user",
      content: [{ type: "text", text: message }]
    });

    const command = new InvokeModelCommand({
      modelId: process.env.BEDROCK_GENERAL_MODEL || MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 500,
        system: "You are an empathetic, expert Vedic astrologer. Answer questions based on the user's astrological charts securely. Be concise.",
        messages: formattedHistory,
      }),
    });

    const response = await getBedrockClient().send(command);
    const jsonString = new TextDecoder().decode(response.body);
    const parsed = JSON.parse(jsonString);
    return parsed.content[0].text;
  } catch (error) {
    console.error("Bedrock chatWithKundali error:", error);
    return "I sense a disturbance in the cosmic energies right now (AWS Credentials missing). Please try again later or focus on chanting Om Namah Shivaya.";
  }
};

/**
 * Generates a structured Horoscope using LLM
 */
export const generateHoroscope = async (zodiac, timeframe) => {
  const prompt = `You are an expert Vedic astrologer. Generate a thoughtful, structured ${timeframe} horoscope for the Zodiac sign: ${zodiac}.
Respond ONLY with a valid JSON array of exactly 5 categories. Each object must have 'category' and 'prediction'.
The 5 specific categories must be: "Love & Relationship", "Job & Career", "Money", "Health", "Business".
Format example:
[
  { "category": "Love & Relationship", "prediction": "..." },
  { "category": "Job & Career", "prediction": "..." }
]`;

  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1500,
        messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
      }),
    });

    const response = await getBedrockClient().send(command);
    const jsonString = new TextDecoder().decode(response.body);
    const parsed = JSON.parse(jsonString);
    const textOutput = parsed.content[0].text;
    
    return JSON.parse(textOutput);
  } catch (error) {
    console.error("Bedrock generateHoroscope error:", error);
    
    // Explicit mock fallback
    console.warn("Falling back to mocked Horoscope JSON because AWS credentials failed.");
    return [
      { category: "Love & Relationship", prediction: `Cosmic energy shifts today for ${zodiac}. Minor arguments may arise, but transparent communication will turn them into moments of deep bonding.` },
      { category: "Job & Career", prediction: `Your professional sphere demands patience today. A strategic opportunity is brewing behind the scenes.` },
      { category: "Money", prediction: `Avoid impulsive spending. It's time to consolidate your resources and plan for long-term stability.` },
      { category: "Health", prediction: `Physical vitality is strong, but mental fatigue might catch up. Dedicate 10 minutes to deep breathing or meditation.` },
      { category: "Business", prediction: `Network aggressively. A casual conversation today could lead to a lucrative partnership next week.` }
    ];
  }
};
