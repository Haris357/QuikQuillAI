"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  List, 
  Palette, 
  Wand2, 
  Send, 
  Save,
  History,
  FileText,
  X,
  Clock,
  User,
  Bot,
  Edit3,
  Sparkles,
  ChevronRight,
  RotateCcw,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Underline,
  Quote,
  Plus,
  Minus,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, Revision } from '@/types';
import { toast } from 'sonner';

interface RichTextEditorProps {
  task: Task;
  onSave: (content: string) => void;
  onRephrase: (selectedText: string) => Promise<string>;
  onPromptSubmit: (prompt: string) => Promise<string>;
  className?: string;
}

export function RichTextEditor({ 
  task, 
  onSave, 
  onRephrase, 
  onPromptSubmit,
  className = "" 
}: RichTextEditorProps) {
  const [content, setContent] = useState(task.content || '');
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [revisions, setRevisions] = useState<Revision[]>(task.revisions || []);
  const [currentRevisionIndex, setCurrentRevisionIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<Revision | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-save functionality
  const autoSave = useCallback((newContent: string) => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (newContent !== (task.content || '')) {
        // Create new revision
        const newRevision: Revision = {
          id: Date.now().toString(),
          content: newContent,
          timestamp: new Date().toISOString(),
          type: 'user-edit',
          changes: []
        };
        
        const updatedRevisions = [...revisions, newRevision];
        setRevisions(updatedRevisions);
        setCurrentRevisionIndex(updatedRevisions.length - 1);
        setHasUnsavedChanges(false);
        onSave(newContent);
        toast.success('Auto-saved successfully!');
      }
    }, 2000);
  }, [task.content, revisions, onSave]);

  useEffect(() => {
    const formattedContent = formatAIResponse(task.content || '');
    setContent(formattedContent);
    setRevisions(task.revisions || []);
    setCurrentRevisionIndex((task.revisions || []).length - 1);
    
    // Update editor content without losing cursor position
    if (editorRef.current && editorRef.current.innerHTML !== formattedContent) {
      editorRef.current.innerHTML = formattedContent;
    }
  }, [task.content, task.revisions]);

  // Format AI response to proper HTML
  const formatAIResponse = (text: string): string => {
    if (!text || typeof text !== 'string') return '';
    
    let formatted = text.trim();
    
    // Convert markdown headers to HTML headers
    formatted = formatted.replace(/^### (.*$)/gm, '<h3 style="font-size: 1.25rem; font-weight: 600; margin: 1.5rem 0 0.5rem 0; color: #1f2937;">$1</h3>');
    formatted = formatted.replace(/^## (.*$)/gm, '<h2 style="font-size: 1.5rem; font-weight: 600; margin: 1.5rem 0 0.5rem 0; color: #1f2937;">$1</h2>');
    formatted = formatted.replace(/^# (.*$)/gm, '<h1 style="font-size: 1.875rem; font-weight: 600; margin: 1.5rem 0 0.5rem 0; color: #1f2937;">$1</h1>');
    
    // Convert bold and italic text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
    
    // Convert inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code style="background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875rem;">$1</code>');
    
    // Convert bullet points to list items
    formatted = formatted.replace(/^[\s]*[-*+]\s+(.+)$/gm, '<li style="margin: 0.25rem 0;">$1</li>');
    formatted = formatted.replace(/^[\s]*\d+\.\s+(.+)$/gm, '<li style="margin: 0.25rem 0;">$1</li>');
    
    // Wrap consecutive list items in ul tags
    formatted = formatted.replace(/(<li[^>]*>.*?<\/li>[\s\n]*)+/gs, (match) => {
      const listItems = match.trim();
      return `<ul style="margin: 1rem 0; padding-left: 1.5rem; list-style-type: disc;">${listItems}</ul>`;
    });
    
    // Convert blockquotes
    formatted = formatted.replace(/^>\s+(.+)$/gm, '<blockquote style="border-left: 4px solid #10b981; padding-left: 1rem; font-style: italic; color: #6b7280; margin: 1rem 0;">$1</blockquote>');
    
    // Split content into blocks and wrap paragraphs
    const blocks = formatted.split(/\n\s*\n/).filter(block => block.trim());
    
    const processedBlocks = blocks.map(block => {
      block = block.trim();
      
      // Skip if already HTML element
      if (block.match(/^<(h[1-6]|ul|ol|blockquote|div|section)/i)) {
        return block;
      }
      
      // If it contains list items but no ul wrapper, wrap it
      if (block.includes('<li>') && !block.includes('<ul>')) {
        return `<ul style="margin: 1rem 0; padding-left: 1.5rem; list-style-type: disc;">${block}</ul>`;
      }
      
      // Wrap regular text in paragraph tags
      if (!block.includes('<')) {
        return `<p style="margin-bottom: 1rem; line-height: 1.7;">${block}</p>`;
      }
      
      return block;
    });
    
    return processedBlocks.join('\n\n');
  };

  // Save current selection
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setSelectionRange(range.cloneRange());
      return range;
    }
    return null;
  };

  // Restore selection
  const restoreSelection = (range: Range) => {
    const selection = window.getSelection();
    if (selection && range) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const selectedText = selection.toString().trim();
      setSelectedText(selectedText);
      saveSelection();
    } else {
      setSelectedText('');
      setSelectionRange(null);
    }
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const newContent = target.innerHTML;
    
    // Save cursor position before updating state
    const savedRange = saveSelection();
    
    setContent(newContent);
    setHasUnsavedChanges(true);
    
    // Restore cursor position after state update
    setTimeout(() => {
      if (savedRange) {
        try {
          restoreSelection(savedRange);
        } catch (error) {
          // Ignore errors if range is no longer valid
        }
      }
    }, 0);
    
    autoSave(newContent);
  };

  const handleRephrase = async () => {
    if (!selectedText || !selectionRange) return;
    
    setIsRephrasing(true);
    try {
      const rephrasedText = await onRephrase(selectedText);
      const formattedText = formatAIResponse(rephrasedText);
      
      // Replace selected text with rephrased text
      if (selectionRange) {
        selectionRange.deleteContents();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = formattedText;
        const fragment = document.createDocumentFragment();
        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }
        selectionRange.insertNode(fragment);
        
        // Update content
        const newContent = editorRef.current?.innerHTML || '';
        setContent(newContent);
        
        // Create revision for rephrase
        const newRevision: Revision = {
          id: Date.now().toString(),
          content: newContent,
          timestamp: new Date().toISOString(),
          type: 'rephrased',
          changes: []
        };
        
        const updatedRevisions = [...revisions, newRevision];
        setRevisions(updatedRevisions);
        setCurrentRevisionIndex(updatedRevisions.length - 1);
        
        onSave(newContent);
        toast.success('Text rephrased successfully!');
      }
      
      setSelectedText('');
      setSelectionRange(null);
    } catch (error) {
      console.error('Error rephrasing:', error);
      toast.error('Failed to rephrase text');
    } finally {
      setIsRephrasing(false);
    }
  };

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessingPrompt(true);
    try {
      const aiResponse = await onPromptSubmit(prompt);
      const formattedResponse = formatAIResponse(aiResponse);
      
      // Replace entire content
      const newContent = formattedResponse;
      setContent(newContent);
      
      // Update editor content
      if (editorRef.current) {
        editorRef.current.innerHTML = formattedResponse;
        editorRef.current.scrollTop = 0;
      }
      
      // Create revision for AI generation
      const newRevision: Revision = {
        id: Date.now().toString(),
        content: newContent,
        timestamp: new Date().toISOString(),
        type: 'ai-generated',
        changes: []
      };
      
      const updatedRevisions = [...revisions, newRevision];
      setRevisions(updatedRevisions);
      setCurrentRevisionIndex(updatedRevisions.length - 1);
      
      setPrompt('');
      onSave(newContent);
      
      toast.success('AI content generated successfully!');
    } catch (error) {
      console.error('Error processing prompt:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsProcessingPrompt(false);
    }
  };

  const formatText = (command: string) => {
    document.execCommand(command, false);
    const newContent = editorRef.current?.innerHTML || '';
    setContent(newContent);
    setHasUnsavedChanges(true);
    autoSave(newContent);
  };

  const restoreRevision = (revision: Revision, index: number) => {
    const formattedContent = formatAIResponse(revision.content);
    setContent(formattedContent);
    setCurrentRevisionIndex(index);
    setShowHistory(false);
    setSelectedRevision(null);
    onSave(revision.content);
    
    // Update editor content
    if (editorRef.current) {
      editorRef.current.innerHTML = formattedContent;
      editorRef.current.scrollTop = 0;
    }
    
    toast.success('Revision restored successfully!');
  };

  const viewRevision = (revision: Revision, index: number) => {
    setSelectedRevision(revision);
    setCurrentRevisionIndex(index);
    
    // Scroll to the revision in history
    if (historyRef.current) {
      const revisionElement = historyRef.current.querySelector(`[data-revision-index="${index}"]`);
      if (revisionElement) {
        revisionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const getRevisionIcon = (type: string) => {
    switch (type) {
      case 'ai-generated':
        return <Bot className="h-4 w-4 text-blue-600" />;
      case 'user-edit':
        return <User className="h-4 w-4 text-green-600" />;
      case 'rephrased':
        return <Wand2 className="h-4 w-4 text-purple-600" />;
      default:
        return <Edit3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRevisionColor = (type: string) => {
    switch (type) {
      case 'ai-generated':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'user-edit':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'rephrased':
        return 'bg-purple-50 border-purple-200 text-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getDiffHighlight = (current: string, previous: string) => {
    if (current.length > previous.length) {
      return 'border-l-4 border-green-500 bg-green-50';
    } else if (current.length < previous.length) {
      return 'border-l-4 border-red-500 bg-red-50';
    }
    return 'border-l-4 border-blue-500 bg-blue-50';
  };

  // Get plain text for word/character count
  const getPlainText = (html: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const plainTextContent = getPlainText(content);
  const wordCount = plainTextContent.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = plainTextContent.length;

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{task.title}</h2>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">
                  {charCount} characters, {wordCount} words
                </p>
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Unsaved changes
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDiff(!showDiff)}
            className="border-gray-200 hover:bg-gray-50"
          >
            {showDiff ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showDiff ? 'Hide' : 'Show'} Changes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="border-gray-200 hover:bg-gray-50"
          >
            <History className="h-4 w-4 mr-2" />
            History ({revisions.length})
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-1 mr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('bold')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('italic')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('underline')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <div className="flex items-center space-x-1 mr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('justifyLeft')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('justifyCenter')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('justifyRight')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('insertUnorderedList')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => formatText('formatBlock')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <AnimatePresence>
          {selectedText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center space-x-2"
            >
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 max-w-xs">
                <Type className="h-3 w-3 mr-1 flex-shrink-0" />
                <span className="truncate">
                  "{selectedText.substring(0, 30)}{selectedText.length > 30 ? '...' : ''}"
                </span>
                <span className="ml-1 text-xs">({selectedText.length} chars)</span>
              </Badge>
              <Button
                onClick={handleRephrase}
                disabled={isRephrasing}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                <Wand2 className="h-4 w-4 mr-1" />
                {isRephrasing ? 'Rephrasing...' : 'Rephrase'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col relative">
          <div
            ref={editorRef}
            contentEditable
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            onInput={handleContentChange}
            suppressContentEditableWarning={true}
            className="flex-1 p-6 focus:outline-none overflow-y-auto editor-content"
            style={{ 
              minHeight: '400px',
              maxHeight: 'calc(100vh - 300px)',
              lineHeight: '1.7',
              fontSize: '16px'
            }}
            dangerouslySetInnerHTML={{ __html: content }}
          />
          
          {/* AI Prompt Input */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask AI to rewrite, improve, or create new content..."
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePromptSubmit())}
                className="flex-1 border-gray-200 focus:border-green-500 focus:ring-green-500"
                disabled={isProcessingPrompt}
              />
              <Button
                onClick={handlePromptSubmit}
                disabled={isProcessingPrompt || !prompt.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                {isProcessingPrompt ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Generate
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: AI will replace the entire content with your request. Use "Rephrase" for selected text only.
            </p>
          </div>
        </div>
        
        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 400, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-l border-gray-200 bg-gray-50 overflow-hidden flex flex-col relative z-10"
            >
              <div className="h-full flex flex-col min-h-0">
                <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0 relative z-20">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <History className="h-4 w-4 mr-2 text-green-600" />
                      Revision History
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {revisions.length} revision{revisions.length !== 1 ? 's' : ''} • Auto-saved
                  </p>
                </div>
                
                <div 
                  ref={historyRef} 
                  className="flex-1 overflow-y-auto p-4 min-h-0 history-scroll bg-gray-50" 
                  style={{ maxHeight: 'calc(100vh - 200px)' }}
                >
                  {revisions.length > 0 ? (
                    <div className="space-y-3">
                      {revisions.slice().reverse().map((revision, reverseIndex) => {
                        const index = revisions.length - 1 - reverseIndex;
                        return (
                          <motion.div
                            key={revision.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: reverseIndex * 0.05 }}
                            data-revision-index={index}
                          >
                            <Card className={`hover:shadow-md transition-all duration-200 cursor-pointer group ${
                              index === currentRevisionIndex ? 'ring-2 ring-green-500 bg-green-50' : ''
                            } ${index > 0 ? getDiffHighlight(revision.content, revisions[index - 1].content) : ''}`}>
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    {getRevisionIcon(revision.type)}
                                    <Badge className={`text-xs ${getRevisionColor(revision.type)}`}>
                                      {revision.type.replace('-', ' ')}
                                    </Badge>
                                    {index === currentRevisionIndex && (
                                      <Badge className="text-xs bg-green-100 text-green-800">
                                        Current
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500">
                                      {new Date(revision.timestamp).toLocaleString()}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        restoreRevision(revision, index);
                                      }}
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                      title="Restore this revision"
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div 
                                  className="bg-white rounded-lg p-3 border border-gray-200 cursor-pointer hover:bg-gray-50"
                                  onClick={() => viewRevision(revision, index)}
                                >
                                  <div className="text-sm text-gray-700 line-clamp-3">
                                    {getPlainText(revision.content).substring(0, 150)}
                                    {getPlainText(revision.content).length > 150 ? '...' : ''}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-3">
                                  <span className="text-xs text-gray-500">
                                    {getPlainText(revision.content).length} characters
                                  </span>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        viewRevision(revision, index);
                                      }}
                                      className="text-xs h-6 px-2 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      View
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        restoreRevision(revision, index);
                                      }}
                                      className="text-xs h-6 px-2 border-gray-200 hover:bg-green-600 hover:text-white hover:border-green-600"
                                      disabled={index === currentRevisionIndex}
                                    >
                                      <RotateCcw className="h-3 w-3 mr-1" />
                                      {index === currentRevisionIndex ? 'Current' : 'Restore'}
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">No Revisions Yet</h4>
                      <p className="text-gray-600 text-sm">
                        Start editing to create auto-saved revision history
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Revision Detail Modal */}
      <AnimatePresence>
        {selectedRevision && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
            onClick={() => setSelectedRevision(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getRevisionIcon(selectedRevision.type)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Revision Details
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedRevision.timestamp).toLocaleString()} • {selectedRevision.type.replace('-', ' ')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRevision(null)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh] bg-white">
                <div 
                  className="prose prose-lg max-w-none formatted-content bg-white"
                  dangerouslySetInnerHTML={{ __html: formatAIResponse(selectedRevision.content) }}
                />
              </div>
              <div className="p-6 border-t border-gray-200 bg-white flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedRevision(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const index = revisions.findIndex(r => r.id === selectedRevision.id);
                    if (index !== -1) {
                      restoreRevision(selectedRevision, index);
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore This Revision
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}