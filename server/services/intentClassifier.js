import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const classifyIntent = async (message) => {
  try {
    // First, try keyword-based classification for speed
    const keywordIntent = classifyByKeywords(message);
    if (keywordIntent.confidence > 0.8) {
      return keywordIntent;
    }

    // If keyword classification is uncertain, use OpenAI
    const aiIntent = await classifyWithOpenAI(message);
    return aiIntent;
  } catch (error) {
    console.error('Intent classification error:', error);
    // Fallback to keyword classification
    return classifyByKeywords(message);
  }
};

const classifyByKeywords = (message) => {
  const lowerMessage = message.toLowerCase();
  
  const patterns = {
    book_request: {
      keywords: ['book', 'read', 'reading', 'recommend', 'suggestion', 'literature', 'author', 'novel'],
      weight: 1
    },
    challenge_request: {
      keywords: ['challenge', 'practice', 'exercise', 'learn', 'skill', 'improve', 'training', 'bootcamp'],
      weight: 1
    },
    plan_request: {
      keywords: ['plan', 'roadmap', 'path', 'journey', 'guide', 'how to', 'steps', 'strategy'],
      weight: 1
    },
    motivation_request: {
      keywords: ['motivation', 'inspire', 'encourage', 'quote', 'wisdom', 'advice', 'support'],
      weight: 1
    }
  };

  let bestMatch = { intent: 'general', confidence: 0 };

  for (const [intent, pattern] of Object.entries(patterns)) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (lowerMessage.includes(keyword)) {
        score += pattern.weight;
      }
    }
    
    const confidence = Math.min(score / pattern.keywords.length, 1);
    if (confidence > bestMatch.confidence) {
      bestMatch = { intent, confidence };
    }
  }

  return bestMatch;
};

const classifyWithOpenAI = async (message) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an intent classifier for a learning platform. Classify the user's message into one of these categories:
          - book_request: User wants book recommendations
          - challenge_request: User wants learning challenges or practice exercises
          - plan_request: User wants a learning plan, roadmap, or guidance
          - motivation_request: User wants motivation, quotes, or encouragement
          - general: General conversation or unclear intent
          
          Respond with only the category name and confidence (0-1) in JSON format: {"intent": "category", "confidence": 0.95}`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      intent: result.intent,
      confidence: result.confidence || 0.5
    };
  } catch (error) {
    console.error('OpenAI classification error:', error);
    return { intent: 'general', confidence: 0.3 };
  }
};

export const extractKeywords = (message) => {
  const words = message.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'what', 'when', 'with'];
  
  return words.filter(word => !stopWords.includes(word));
};