import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function generateContent(prompt: string): Promise<string> {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content');
  }
}

export async function rephraseText(text: string, tone: string = 'professional'): Promise<string> {
  const prompt = `Please rephrase the following text in a ${tone} tone while maintaining the original meaning:

"${text}"

Return only the rephrased text without any additional commentary.`;
  
  return await generateContent(prompt);
}

export async function continueWriting(context: string, prompt: string, style: string, tone: string): Promise<string> {
  const fullPrompt = `You are a professional ${style} writer with a ${tone} tone.

User Request: ${prompt}

${context ? `Previous Context (for reference): ${context}` : ''}

Instructions:
- Write complete, well-structured content that fulfills the user's request
- Use markdown formatting for structure:
  * Use # for main headings, ## for subheadings, ### for sub-subheadings
  * Use **text** for bold emphasis
  * Use *text* for italic emphasis
  * Use - or * for bullet points
  * Use 1. 2. 3. for numbered lists
  * Use > for blockquotes
- Create engaging, professional content with proper structure
- Include relevant headings and subheadings to organize the content
- Use bullet points and lists where appropriate
- Write in ${tone} tone with ${style} style
- Make the content comprehensive and well-organized

Write the content now:`;

  return await generateContent(fullPrompt);
}

export async function improveContent(content: string, instruction: string, style: string, tone: string): Promise<string> {
  const fullPrompt = `You are a professional ${style} writer with a ${tone} tone.

Current Content: 
${content}

Improvement Request: ${instruction}

Instructions:
- Rewrite and improve the entire content based on the user's request
- Use markdown formatting for better structure:
  * Use # for main headings, ## for subheadings, ### for sub-subheadings
  * Use **text** for bold emphasis
  * Use *text* for italic emphasis
  * Use - or * for bullet points
  * Use 1. 2. 3. for numbered lists
  * Use > for important quotes or callouts
- Make the content more engaging and well-structured
- Ensure proper flow and readability
- Maintain ${tone} tone throughout
- Include relevant headings and subheadings
- Use lists and formatting to improve readability

Provide the improved version:`;

  return await generateContent(fullPrompt);
}

export async function generateInitialContent(title: string, description: string, style: string, tone: string, keywords: string[] = []): Promise<string> {
  const fullPrompt = `You are a professional ${style} writer with a ${tone} tone.
        
Task: ${title}
Description: ${description}
Keywords to focus on: ${keywords.join(', ')}

Instructions:
- Write complete, well-structured content that fulfills the task requirement
- Use proper markdown formatting:
  * Use # for main headings, ## for subheadings, ### for sub-subheadings
  * Use **text** for bold emphasis
  * Use *text* for italic emphasis
  * Use - or * for bullet points
  * Use 1. 2. 3. for numbered lists
  * Use > for blockquotes
- Create engaging, professional content with proper structure
- Include relevant headings and subheadings to organize the content
- Use bullet points and lists where appropriate
- Write in ${tone} tone with ${style} style
- Make the content comprehensive and well-organized

Write the content now:`;

  return await generateContent(fullPrompt);
}

export async function generateContentSuggestions(content: string): Promise<Array<{
  type: 'improvement' | 'grammar' | 'style' | 'structure';
  title: string;
  description: string;
  action: string;
}>> {
  if (!content || content.trim().length < 50) {
    return [];
  }

  const prompt = `Analyze the following content and provide 3-4 specific, actionable suggestions to improve it. Focus on different aspects like structure, style, clarity, and engagement.

Content to analyze:
"${content}"

For each suggestion, provide:
1. A concise title (max 20 characters)
2. A brief description (max 60 characters) 
3. An action phrase (max 25 characters)
4. A type from: improvement, grammar, style, structure

Format your response as JSON array like this:
[
  {
    "type": "improvement",
    "title": "Enhance Introduction",
    "description": "Add a compelling hook to grab reader attention",
    "action": "Add hook"
  }
]

Provide only the JSON array, no other text.`;

  try {
    const response = await generateContent(prompt);
    
    // Clean the response to extract just the JSON
    const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
    const suggestions = JSON.parse(cleanResponse);
    
    // Validate and filter suggestions
    return suggestions
      .filter((s: any) => s.title && s.description && s.action && s.type)
      .slice(0, 4)
      .map((s: any) => ({
        type: s.type,
        title: s.title.substring(0, 20),
        description: s.description.substring(0, 60),
        action: s.action.substring(0, 25)
      }));
  } catch (error) {
    console.error('Error generating content suggestions:', error);
    return [];
  }
}