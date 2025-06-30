import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateAIResponse = async (userMessage, context = {}) => {
  try {
    const systemPrompt = buildSystemPrompt(context);
    const userPrompt = buildUserPrompt(userMessage, context);

    const stream = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      stream: true,
      max_tokens: 1000,
      temperature: 0.7
    });

    return stream;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI response');
  }
};

const buildSystemPrompt = (context) => {
  return `You are the Tortoise, a wise AI learning companion for LifelongLearners platform. Your motto is "Life is teaching, never stop learning."

Your personality:
- Wise, patient, and encouraging like a tortoise
- Passionate about lifelong learning
- Supportive and motivational
- Practical and actionable in advice
- Culturally aware (support both English and Amharic learners)

Your capabilities:
- Recommend books from our curated library
- Suggest learning challenges
- Create personalized learning plans
- Provide motivation and wisdom
- Support multiple languages (especially English and Amharic)

Guidelines:
- Always be encouraging and positive
- Provide specific, actionable advice
- Reference the platform's resources when relevant
- Keep responses concise but helpful
- End responses with motivational elements
- Use the tortoise wisdom: slow and steady wins the race

Context about the user:
${context.userPreferences ? `User preferences: ${JSON.stringify(context.userPreferences)}` : 'No user preferences available'}
${context.userInterests ? `User interests: ${context.userInterests.join(', ')}` : 'No user interests available'}
${context.searchResults ? `Available resources found: ${JSON.stringify(context.searchResults)}` : 'No specific resources found'}`;
};

const buildUserPrompt = (userMessage, context) => {
  let prompt = `User message: "${userMessage}"`;

  if (context.intent) {
    prompt += `\nDetected intent: ${context.intent}`;
  }

  if (context.searchResults) {
    if (context.searchResults.books && context.searchResults.books.length > 0) {
      prompt += `\n\nRelevant books found:`;
      context.searchResults.books.forEach((book, index) => {
        prompt += `\n${index + 1}. "${book.title}" by ${book.author} (${book.language}, ${book.format})`;
        prompt += `\n   Description: ${book.description}`;
        prompt += `\n   Tags: ${book.tags.join(', ')}`;
      });
    }

    if (context.searchResults.challenges && context.searchResults.challenges.length > 0) {
      prompt += `\n\nRelevant challenges found:`;
      context.searchResults.challenges.forEach((challenge, index) => {
        prompt += `\n${index + 1}. "${challenge.title}" (${challenge.type})`;
        prompt += `\n   Description: ${challenge.description}`;
        prompt += `\n   Tags: ${challenge.tags.join(', ')}`;
      });
    }
  }

  if (context.userPreferences) {
    prompt += `\n\nUser context:`;
    if (context.userPreferences.language_preference) {
      prompt += `\nPreferred language: ${context.userPreferences.language_preference}`;
    }
    if (context.userPreferences.difficulty_level) {
      prompt += `\nPreferred difficulty: ${context.userPreferences.difficulty_level}`;
    }
  }

  prompt += `\n\nPlease provide a helpful response as the Tortoise. If you found relevant resources above, incorporate them naturally into your response. Always end with encouragement and remind them that "life is teaching, never stop learning."`;

  return prompt;
};

export const generateLearningPlan = async (userGoals, userLevel, timeCommitment) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are the Tortoise, creating personalized learning plans. Create a structured, practical learning plan that follows the "slow and steady wins the race" philosophy.`
        },
        {
          role: "user",
          content: `Create a learning plan for:
          Goals: ${userGoals}
          Current level: ${userLevel}
          Time commitment: ${timeCommitment}
          
          Format as a structured plan with weeks/phases, daily activities, and milestones.`
        }
      ],
      max_tokens: 800,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Learning plan generation error:', error);
    throw new Error('Failed to generate learning plan');
  }
};