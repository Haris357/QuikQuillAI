import { marked } from 'marked';

// Configure marked options for better formatting
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
  headerIds: true,
  mangle: false,
  headerPrefix: '',
});

/**
 * Convert markdown text to HTML with proper formatting
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  // Clean and normalize the markdown
  let cleanedMarkdown = markdown
    // Ensure headings have proper spacing
    .replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2')
    // Ensure lists have proper spacing
    .replace(/^(\s*[-*+]|\s*\d+\.)\s+/gm, '$1 ')
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .trim();

  // Parse the markdown to HTML
  let html = marked.parse(cleanedMarkdown) as string;

  // Add custom classes for better styling
  html = html
    // Style headings
    .replace(/<h1>/g, '<h1 class="text-3xl font-bold text-gray-900 mb-4 mt-6">')
    .replace(/<h2>/g, '<h2 class="text-2xl font-bold text-gray-900 mb-3 mt-5">')
    .replace(/<h3>/g, '<h3 class="text-xl font-semibold text-gray-900 mb-2 mt-4">')
    .replace(/<h4>/g, '<h4 class="text-lg font-semibold text-gray-800 mb-2 mt-3">')
    .replace(/<h5>/g, '<h5 class="text-base font-semibold text-gray-800 mb-1 mt-2">')
    .replace(/<h6>/g, '<h6 class="text-sm font-semibold text-gray-800 mb-1 mt-2">')
    // Style paragraphs
    .replace(/<p>/g, '<p class="text-gray-700 mb-4 leading-relaxed">')
    // Style lists
    .replace(/<ul>/g, '<ul class="list-disc list-inside mb-4 space-y-2 text-gray-700">')
    .replace(/<ol>/g, '<ol class="list-decimal list-inside mb-4 space-y-2 text-gray-700">')
    .replace(/<li>/g, '<li class="ml-4">')
    // Style blockquotes
    .replace(/<blockquote>/g, '<blockquote class="border-l-4 border-green-500 pl-4 py-2 my-4 italic text-gray-700 bg-gray-50">')
    // Style code blocks
    .replace(/<pre>/g, '<pre class="bg-gray-900 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">')
    .replace(/<code>/g, '<code class="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">')
    // Style links
    .replace(/<a /g, '<a class="text-green-600 hover:text-green-700 underline" ')
    // Style strong/bold
    .replace(/<strong>/g, '<strong class="font-bold text-gray-900">')
    // Style em/italic
    .replace(/<em>/g, '<em class="italic text-gray-800">')
    // Style horizontal rules
    .replace(/<hr>/g, '<hr class="my-6 border-t-2 border-gray-200">');

  return html;
}

/**
 * Strip HTML tags from content (for preview/plain text)
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Convert HTML back to markdown (basic conversion)
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let markdown = html
    // Headings
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    // Bold
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    // Italic
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Lists
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<\/?ul[^>]*>/gi, '\n')
    .replace(/<\/?ol[^>]*>/gi, '\n')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove remaining tags
    .replace(/<[^>]*>/g, '')
    // Clean up extra newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return markdown;
}

/**
 * Format AI generated content - convert markdown to HTML
 */
export function formatAIContent(content: string): string {
  if (!content) return '';

  // If content already contains HTML tags, return as is
  if (content.includes('<h1>') || content.includes('<p>') || content.includes('<div>')) {
    return content;
  }

  // Check if content contains markdown syntax
  const hasMarkdown = /^#{1,6}\s|^\*\*|^\*(?!\*)|^-\s|^\d+\.\s|^>\s/m.test(content);

  if (hasMarkdown) {
    // Convert markdown to HTML
    return markdownToHtml(content);
  }

  // If no markdown detected, wrap plain text in paragraphs
  const paragraphs = content
    .split(/\n\n+/)
    .map(para => para.trim())
    .filter(para => para.length > 0)
    .map(para => `<p class="text-gray-700 mb-4 leading-relaxed">${para.replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  return paragraphs || `<p class="text-gray-700 mb-4 leading-relaxed">${content}</p>`;
}
