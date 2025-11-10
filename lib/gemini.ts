import { GoogleGenerativeAI } from '@google/generative-ai';
import { markdownToHtml } from './markdown';
import { updateTokenUsage, hasTokensAvailable, getUserSubscription } from './subscription';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

// Track token usage globally (for display purposes)
let totalTokensUsed = 0;

export function getTotalTokensUsed(): number {
  return totalTokensUsed;
}

export function resetTokenUsage(): void {
  totalTokensUsed = 0;
}

export async function generateContent(
  prompt: string,
  userId?: string,
  convertToHtml: boolean = false
): Promise<string> {
  try {
    // Check token availability if userId provided
    if (userId) {
      const subscription = await getUserSubscription(userId);
      const estimatedTokens = Math.ceil(prompt.length / 4); // Rough estimate

      if (!hasTokensAvailable(subscription, estimatedTokens)) {
        throw new Error('Insufficient tokens. Please upgrade your plan or wait for your monthly reset.');
      }
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Track token usage
    const usageMetadata = response.usageMetadata;
    if (usageMetadata) {
      const tokensUsed = usageMetadata.totalTokenCount || 0;
      totalTokensUsed += tokensUsed;

      // Update user's subscription token usage
      if (userId && tokensUsed > 0) {
        await updateTokenUsage(userId, tokensUsed);
      }
    }

    // Convert markdown to HTML if requested
    if (convertToHtml) {
      return markdownToHtml(text);
    }

    return text;
  } catch (error: any) {
    console.error('Error generating content:', error);
    throw error;
  }
}

export async function rephraseText(text: string, tone: string = 'professional', userId?: string): Promise<string> {
  const prompt = `Please rephrase the following text in a ${tone} tone while maintaining the original meaning:

"${text}"

Return only the rephrased text without any additional commentary.`;

  return await generateContent(prompt, userId);
}

export async function continueWriting(context: string, prompt: string, style: string, tone: string, userId?: string): Promise<string> {
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

CRITICAL: Return ONLY the requested content. DO NOT include any introduction like "Here is...", "Of course...", "Certainly...", or explanations. Start directly with the content.`;

  return await generateContent(fullPrompt, userId, true); // Convert to HTML
}

export async function improveContent(content: string, instruction: string, style: string, tone: string, userId?: string): Promise<string> {
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

CRITICAL: Return ONLY the improved content. DO NOT include any introduction like "Here is...", "Of course...", "Certainly...", or explanations. Start directly with the improved content.`;

  return await generateContent(fullPrompt, userId, true); // Convert to HTML
}

export async function generateInitialContent(
  title: string,
  description: string,
  style: string,
  tone: string,
  keywords: string[] = [],
  wordCount?: number,
  targetAudience?: string,
  instructions?: string,
  references?: string[],
  scriptContents?: string[],
  userId?: string
): Promise<string> {
  // Build script context section if scripts are provided
  let scriptContext = '';
  if (scriptContents && scriptContents.length > 0) {
    scriptContext = `\n\nREFERENCE SCRIPTS (for training/context - learn the style, tone, and approach from these):
========================================
${scriptContents.map((script, index) => `
--- Script ${index + 1} ---
${script}
`).join('\n\n')}
========================================

IMPORTANT: Use the above reference scripts to:
- Learn and match the writing style
- Understand the preferred tone and approach
- Follow similar content structure and patterns
- Maintain consistency with the reference examples
`;
  }

  const fullPrompt = `You are a professional ${style} writer with a ${tone} tone.

Task: ${title}
Description: ${description}
${targetAudience ? `Target Audience: ${targetAudience}` : ''}
${wordCount ? `Target Word Count: ${wordCount} words` : ''}
${keywords.length > 0 ? `Keywords to focus on: ${keywords.join(', ')}` : ''}
${references && references.length > 0 ? `Reference materials: ${references.join(', ')}` : ''}
${instructions ? `\nSpecial Instructions: ${instructions}` : ''}
${scriptContext}

Instructions:
- Write complete, well-structured content that fulfills the task requirement
${wordCount ? `- Aim for approximately ${wordCount} words` : ''}
${targetAudience ? `- Tailor the content for ${targetAudience}` : ''}
${scriptContents && scriptContents.length > 0 ? `- CLOSELY FOLLOW the style, tone, and patterns from the reference scripts provided above` : ''}
- Use proper markdown formatting:
  * Use # for main headings, ## for subheadings, ### for sub-subheadings
  * Use **text** for bold emphasis
  * Use *text** for italic emphasis
  * Use - or * for bullet points
  * Use 1. 2. 3. for numbered lists
  * Use > for blockquotes
- Create engaging, professional content with proper structure
- Include relevant headings and subheadings to organize the content
- Use bullet points and lists where appropriate
- Write in ${tone} tone with ${style} style
- Make the content comprehensive and well-organized

CRITICAL: Return ONLY the requested content. DO NOT include any introduction like "Here is...", "Of course...", "Certainly...", or explanations. Start directly with the content.`;

  return await generateContent(fullPrompt, userId, true); // Convert to HTML
}

export async function generateContentSuggestions(content: string, userId?: string): Promise<Array<{
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
    const response = await generateContent(prompt, userId);

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

export async function formatContent(content: string, userId?: string): Promise<string> {
  // Strip HTML tags to get plain text
  const plainText = content.replace(/<[^>]*>/g, '').trim();

  if (!plainText) {
    throw new Error('No content to format');
  }

  const prompt = `You are a professional content formatter. Take the following unformatted or poorly formatted text and restructure it with proper formatting.

Content to format:
"""
${plainText}
"""

Instructions:
1. Analyze the content and identify its structure
2. Add appropriate headings using # for main topics, ## for subtopics, ### for sub-subtopics
3. Convert lists into proper markdown format:
   - Use - or * for bullet points
   - Use 1. 2. 3. for numbered lists
4. Break text into well-structured paragraphs with proper spacing
5. Use **bold** for important terms or emphasis
6. Use *italics* for subtle emphasis
7. Add > for important quotes or callouts if applicable
8. Ensure proper spacing between sections
9. Make the content visually scannable and easy to read
10. Maintain the original meaning and content - only improve the formatting

CRITICAL: Return ONLY the formatted content in markdown. DO NOT add "Here is the formatted content", "Certainly", or ANY introduction/explanation. Start immediately with the formatted content.`;

  return await generateContent(prompt, userId, true); // Convert to HTML
}

export async function applySuggestionToContent(content: string, suggestionTitle: string, suggestionDescription: string, userId?: string): Promise<string> {
  // Strip HTML tags to get plain text
  const plainText = content.replace(/<[^>]*>/g, '').trim();

  if (!plainText) {
    throw new Error('No content to improve');
  }

  const prompt = `You are a professional content editor. Apply this specific improvement to the content WITHOUT rewriting everything.

Current Content:
"""
${plainText}
"""

Improvement to Apply:
${suggestionTitle}: ${suggestionDescription}

Instructions:
1. Apply ONLY the specific improvement mentioned above
2. Keep the rest of the content EXACTLY the same
3. Maintain all existing headings, paragraphs, lists, and structure
4. Only make the minimal changes needed to apply this one improvement
5. Use markdown formatting (# for headings, - for bullets, **bold**, etc.)
6. Do not rewrite the entire content - just apply this one specific enhancement

CRITICAL: Return ONLY the improved content. DO NOT add "Here is...", "I've applied...", "Certainly", or ANY introduction/explanation. Return the content directly.`;

  return await generateContent(prompt, userId, true); // Convert to HTML
}

export async function generateSocialMediaStory(topic: string, platform: string, style: string, tone: string, userId?: string): Promise<string> {
  const prompt = `You are a creative social media content writer. Create an engaging ${platform} story/post.

Topic: ${topic}
Platform: ${platform}
Style: ${style}
Tone: ${tone}

Instructions:
- Create a ${platform}-optimized story/post
- Use appropriate hashtags and emojis
- Keep it engaging and shareable
- Use markdown formatting for structure
- Include a strong hook to grab attention
- Add a clear call-to-action if appropriate

CRITICAL: Return ONLY the ${platform} post/story content. DO NOT add "Here is...", "Certainly...", or ANY introduction. Start directly with the post content.`;

  return await generateContent(prompt, userId, true);
}