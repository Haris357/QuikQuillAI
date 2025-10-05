"use client";

import { useState, useEffect } from 'react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TipTapEditor } from './TipTapEditor';
import { Task, Revision } from '@/types';
import { 
  X, 
  History, 
  ChevronLeft, 
  ChevronRight,
  Send,
  Sparkles,
  Bot,
  User,
  Edit3,
  Trash2,
  RotateCcw,
  FileText,
  Clock,
  Save,
  Lightbulb,
  MessageSquare,
  Wand2,
  Pencil,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface EditorDrawerProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  onSave: (content: string) => void;
  onRephrase: (selectedText: string) => Promise<string>;
  onPromptSubmit: (prompt: string) => Promise<string>;
  agentStyle: string;
  agentTone: string;
}

interface AISuggestion {
  id: string;
  type: 'improvement' | 'grammar' | 'style' | 'structure';
  title: string;
  description: string;
  action: string;
}

export function EditorDrawer({ 
  open, 
  onClose, 
  task, 
  onSave, 
  onRephrase, 
  onPromptSubmit,
  agentStyle,
  agentTone 
}: EditorDrawerProps) {
  const [content, setContent] = useState(task.content || '');
  const [revisions, setRevisions] = useState<Revision[]>(task.revisions || []);
  const [currentRevisionIndex, setCurrentRevisionIndex] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [editingRevisionId, setEditingRevisionId] = useState<string | null>(null);
  const [editingRevisionName, setEditingRevisionName] = useState('');

  useEffect(() => {
    setContent(task.content || '');
    setRevisions(task.revisions || []);
    setCurrentRevisionIndex((task.revisions || []).length - 1);
    
    // Generate AI suggestions when content changes
    if (task.content && task.content.trim()) {
      generateAISuggestions(task.content);
    }
  }, [task]);

  const generateRevisionName = async (content: string, type: string): Promise<string> => {
    try {
      const { generateContent } = await import('@/lib/gemini');
      
      const prompt = `Generate a short, descriptive name (max 25 characters) for this content revision. Focus on the main topic or key changes.

Content preview: "${content.replace(/<[^>]*>/g, '').substring(0, 200)}..."
Revision type: ${type}

Respond with only the name, no quotes or additional text.`;

      const response = await generateContent(prompt);
      return response.trim().substring(0, 25);
    } catch (error) {
      console.error('Error generating revision name:', error);
      // Fallback naming
      const timestamp = new Date().toLocaleString();
      return `${type === 'ai-generated' ? 'AI' : 'Edit'} ${timestamp.split(',')[1].trim()}`;
    }
  };

  const generateAISuggestions = async (currentContent: string) => {
    if (!currentContent || currentContent.trim().length < 50) return;
    
    setIsLoadingSuggestions(true);
    try {
      const { generateContent } = await import('@/lib/gemini');
      
      const prompt = `Analyze the following content and provide 3-4 specific, actionable suggestions to improve it. Focus on different aspects like structure, style, clarity, and engagement.

Content to analyze:
"${currentContent}"

For each suggestion, provide:
1. A concise title (max 20 chars)
2. A brief description (max 60 chars) 
3. An action phrase (max 25 chars)
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

      const response = await generateContent(prompt);
      
      try {
        // Clean the response to extract just the JSON
        const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
        const suggestions = JSON.parse(cleanResponse);
        
        // Add IDs and validate structure
        const validSuggestions = suggestions
          .filter((s: any) => s.title && s.description && s.action && s.type)
          .slice(0, 4)
          .map((s: any, index: number) => ({
            id: `suggestion-${Date.now()}-${index}`,
            type: s.type,
            title: s.title,
            description: s.description,
            action: s.action
          }));
        
        setAiSuggestions(validSuggestions);
      } catch (parseError) {
        console.error('Error parsing AI suggestions:', parseError);
        // Fallback to default suggestions
        setAiSuggestions([
          {
            id: 'fallback-1',
            type: 'improvement',
            title: 'Enhance Content',
            description: 'Review and improve overall content quality',
            action: 'Improve quality'
          }
        ]);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
      setAiSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const applySuggestion = async (suggestion: AISuggestion) => {
    setIsProcessingPrompt(true);
    try {
      const { improveContent } = await import('@/lib/gemini');
      
      // Modified prompt to preserve formatting
      const improvementPrompt = `${suggestion.action}: ${suggestion.description}

IMPORTANT: Preserve all existing markdown formatting, HTML tags, headings, paragraphs, lists, and structure. Only improve the content while maintaining the exact same formatting and organization.`;
      
      const improvedContent = await improveContent(content, improvementPrompt, agentStyle, agentTone);
      
      // Update content
      setContent(improvedContent);
      
      // Generate name for this revision
      const revisionName = await generateRevisionName(improvedContent, 'ai-generated');
      
      // Create revision for AI suggestion
      const newRevision: Revision = {
        id: Date.now().toString(),
        content: improvedContent,
        timestamp: new Date().toISOString(),
        type: 'ai-generated',
        changes: [],
        name: revisionName
      };
      
      const updatedRevisions = [...revisions, newRevision];
      setRevisions(updatedRevisions);
      setCurrentRevisionIndex(updatedRevisions.length - 1);
      
      onSave(improvedContent);
      
      // Regenerate suggestions for new content
      generateAISuggestions(improvedContent);
      
      toast.success(`Applied suggestion: ${suggestion.title}`);
    } catch (error) {
      console.error('Error applying suggestion:', error);
      toast.error('Failed to apply suggestion');
    } finally {
      setIsProcessingPrompt(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    
    // Regenerate AI suggestions when content changes significantly
    const contentDiff = Math.abs(newContent.length - content.length);
    if (contentDiff > 100) {
      generateAISuggestions(newContent);
    }
    
    // Auto-save after 2 seconds of inactivity
    const timeoutId = setTimeout(() => {
      handleSave(newContent);
    }, 2000);

    return () => clearTimeout(timeoutId);
  };

  const handleSave = async (contentToSave?: string) => {
    const finalContent = contentToSave || content;
    
    // Generate name for this revision
    const revisionName = await generateRevisionName(finalContent, 'user-edit');
    
    // Create new revision
    const newRevision: Revision = {
      id: Date.now().toString(),
      content: finalContent,
      timestamp: new Date().toISOString(),
      type: 'user-edit',
      changes: [],
      name: revisionName
    };
    
    const updatedRevisions = [...revisions, newRevision];
    setRevisions(updatedRevisions);
    setCurrentRevisionIndex(updatedRevisions.length - 1);
    setHasUnsavedChanges(false);
    
    onSave(finalContent);
    toast.success('Content saved successfully!');
  };

  const handlePromptSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsProcessingPrompt(true);
    try {
      // Modified to preserve formatting
      const modifiedPrompt = `${prompt}

IMPORTANT: Preserve all existing markdown formatting, HTML tags, headings, paragraphs, lists, and structure. Only make the requested changes while maintaining the exact same formatting and organization.`;
      
      const aiResponse = await onPromptSubmit(modifiedPrompt);
      
      // Update content
      setContent(aiResponse);
      
      // Generate name for this revision
      const revisionName = await generateRevisionName(aiResponse, 'ai-generated');
      
      // Create revision for AI generation
      const newRevision: Revision = {
        id: Date.now().toString(),
        content: aiResponse,
        timestamp: new Date().toISOString(),
        type: 'ai-generated',
        changes: [],
        name: revisionName
      };
      
      const updatedRevisions = [...revisions, newRevision];
      setRevisions(updatedRevisions);
      setCurrentRevisionIndex(updatedRevisions.length - 1);
      
      setPrompt('');
      onSave(aiResponse);
      
      toast.success('AI content generated successfully!');
    } catch (error) {
      console.error('Error processing prompt:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsProcessingPrompt(false);
    }
  };

  const restoreRevision = (revision: Revision, index: number) => {
    setContent(revision.content);
    setCurrentRevisionIndex(index);
    onSave(revision.content);
    toast.success('Revision restored successfully!');
  };

  const deleteRevision = (index: number) => {
    if (revisions.length <= 1) {
      toast.error('Cannot delete the last revision');
      return;
    }
    
    const updatedRevisions = revisions.filter((_, i) => i !== index);
    setRevisions(updatedRevisions);
    
    if (index === currentRevisionIndex) {
      const newIndex = Math.min(index, updatedRevisions.length - 1);
      setCurrentRevisionIndex(newIndex);
      setContent(updatedRevisions[newIndex].content);
    }
    
    toast.success('Revision deleted');
  };

  const startEditingRevisionName = (revision: Revision) => {
    setEditingRevisionId(revision.id);
    setEditingRevisionName(revision.name || 'Untitled');
  };

  const saveRevisionName = (revisionId: string) => {
    const updatedRevisions = revisions.map(rev => 
      rev.id === revisionId ? { ...rev, name: editingRevisionName } : rev
    );
    setRevisions(updatedRevisions);
    setEditingRevisionId(null);
    setEditingRevisionName('');
    toast.success('Revision name updated');
  };

  const cancelEditingRevisionName = () => {
    setEditingRevisionId(null);
    setEditingRevisionName('');
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

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="h-screen max-h-screen w-screen max-w-none fixed inset-0 rounded-none border-0 m-0 p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{task.title}</h2>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">
                  {content.length} characters
                </p>
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    <Clock className="h-3 w-3 mr-1" />
                    Unsaved
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSave()}
              disabled={!hasUnsavedChanges}
              className="border-gray-200 hover:bg-gray-50"
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Content - Full height with proper scrolling */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left Sidebar - History */}
          <div className={`${showHistory ? 'w-1/3' : 'w-0'} border-r border-gray-200 bg-gray-50 transition-all duration-300 overflow-hidden flex-shrink-0`}>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col w-full"
                >
                  <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
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
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {revisions.length} revision{revisions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  
                  <div className="flex-1 min-h-0">
                    <div className="h-full overflow-y-auto p-4">
                      <div className="space-y-3 pb-4">
                        {revisions.slice().reverse().map((revision, reverseIndex) => {
                          const index = revisions.length - 1 - reverseIndex;
                          const isEditing = editingRevisionId === revision.id;
                          
                          return (
                            <Card 
                              key={revision.id}
                              className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:bg-gray-50 ${
                                index === currentRevisionIndex ? 'ring-2 ring-green-500 bg-green-50' : ''
                              }`}
                              onClick={() => !isEditing && restoreRevision(revision, index)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between mb-2">
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
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditingRevisionName(revision);
                                      }}
                                      className="h-6 w-6 p-0"
                                      title="Rename this revision"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        restoreRevision(revision, index);
                                      }}
                                      className="h-6 w-6 p-0"
                                      title="Restore this revision"
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteRevision(index);
                                      }}
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                      title="Delete this revision"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Revision Name */}
                                <div className="mb-2">
                                  {isEditing ? (
                                    <div className="flex items-center space-x-1">
                                      <Input
                                        value={editingRevisionName}
                                        onChange={(e) => setEditingRevisionName(e.target.value)}
                                        className="h-6 text-xs"
                                        maxLength={25}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          saveRevisionName(revision.id);
                                        }}
                                        className="h-6 w-6 p-0"
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          cancelEditingRevisionName();
                                        }}
                                        className="h-6 w-6 p-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <h4 className="font-medium text-sm text-gray-900">
                                      {revision.name || 'Untitled Revision'}
                                    </h4>
                                  )}
                                </div>
                                
                                <div className="text-xs text-gray-500 mb-2">
                                  {new Date(revision.timestamp).toLocaleString()}
                                </div>
                                
                                <div className="text-sm text-gray-700 line-clamp-2">
                                  {revision.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Center - Editor */}
          <div className={`${showHistory ? 'flex-1' : 'w-2/3'} flex flex-col transition-all duration-300 overflow-hidden min-h-0`}>
            {/* Editor Toolbar */}
            <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <History className="h-4 w-4 mr-2" />
                    {showHistory ? 'Hide' : 'Show'} History
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600">
                  {agentStyle} • {agentTone}
                </div>
              </div>
            </div>
            
            {/* Editor */}
            <div className="flex-1 overflow-hidden min-h-0">
              <TipTapEditor
                content={content}
                onChange={handleContentChange}
                onRephrase={onRephrase}
                placeholder="Start writing your content..."
                className="h-full"
              />
            </div>
          </div>

          {/* Right Sidebar - AI Suggestions & Prompt */}
          <div className="w-1/3 border-l border-gray-200 bg-gray-50 flex flex-col flex-shrink-0 min-h-0">
            {/* AI Suggestions */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Lightbulb className="h-4 w-4 mr-2 text-yellow-600" />
                  AI Suggestions
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Improve your content
                </p>
              </div>
              
              <div className="flex-1 min-h-0">
                <div className="h-full overflow-y-auto p-4">
                  {isLoadingSuggestions ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                      <span className="ml-2 text-sm text-gray-600">Generating suggestions...</span>
                    </div>
                  ) : (
                    <div className="space-y-3 pb-4">
                      {aiSuggestions.length > 0 ? (
                        aiSuggestions.map((suggestion) => (
                          <Card key={suggestion.id} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between mb-2">
                                <Badge className={`text-xs ${
                                  suggestion.type === 'improvement' ? 'bg-blue-100 text-blue-800' :
                                  suggestion.type === 'grammar' ? 'bg-red-100 text-red-800' :
                                  suggestion.type === 'style' ? 'bg-purple-100 text-purple-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {suggestion.type}
                                </Badge>
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm mb-1">
                                {suggestion.title}
                              </h4>
                              <p className="text-xs text-gray-600 mb-2">
                                {suggestion.description}
                              </p>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="w-full text-xs"
                                onClick={() => applySuggestion(suggestion)}
                                disabled={isProcessingPrompt}
                              >
                                {isProcessingPrompt ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></div>
                                ) : null}
                                {suggestion.action}
                              </Button>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-2">No suggestions available</p>
                          <p className="text-xs text-gray-500">Write more content to get AI suggestions</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* AI Prompt Input */}
            <div className="p-4 bg-white flex-shrink-0">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                  AI Writer
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ask AI to improve your content
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask AI to improve content..."
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePromptSubmit())}
                  className="flex-1 border-gray-200 focus:border-green-500 focus:ring-green-500"
                  disabled={isProcessingPrompt}
                />
                <Button
                  onClick={handlePromptSubmit}
                  disabled={isProcessingPrompt || !prompt.trim()}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {isProcessingPrompt ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}