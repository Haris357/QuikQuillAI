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
  Check,
  AlignJustify,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Hash,
  Zap
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
  const [isFormattingContent, setIsFormattingContent] = useState(false);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);

  useEffect(() => {
    setContent(task.content || '');
    setRevisions(task.revisions || []);
    setCurrentRevisionIndex((task.revisions || []).length - 1);
    // Don't auto-generate suggestions anymore
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
      const { applySuggestionToContent } = await import('@/lib/gemini');

      // Apply only this specific suggestion
      const improvedContent = await applySuggestionToContent(content, suggestion.title, suggestion.description);

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

      toast.success(`Applied: ${suggestion.title}`);
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
    // Don't auto-generate suggestions on content change
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
    setHasUnsavedChanges(false);
    // Don't create a new revision when restoring - just update the current content
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

  const handleFormatContent = async () => {
    if (!content || content.trim().length < 10) {
      toast.error('Not enough content to format');
      return;
    }

    setIsFormattingContent(true);
    try {
      const { formatContent } = await import('@/lib/gemini');

      const formattedContent = await formatContent(content);

      // Update content
      setContent(formattedContent);

      // Generate name for this revision
      const revisionName = await generateRevisionName(formattedContent, 'ai-generated');

      // Create revision for formatted content
      const newRevision: Revision = {
        id: Date.now().toString(),
        content: formattedContent,
        timestamp: new Date().toISOString(),
        type: 'ai-generated',
        changes: [],
        name: revisionName
      };

      const updatedRevisions = [...revisions, newRevision];
      setRevisions(updatedRevisions);
      setCurrentRevisionIndex(updatedRevisions.length - 1);

      onSave(formattedContent);

      toast.success('Content formatted successfully!');
    } catch (error) {
      console.error('Error formatting content:', error);
      toast.error('Failed to format content');
    } finally {
      setIsFormattingContent(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!content || content.trim().length < 50) {
      toast.error('Need more content to generate suggestions');
      return;
    }
    await generateAISuggestions(content);
  };

  const handleGenerateSocialStory = async (platform: string) => {
    if (!content || content.trim().length < 20) {
      toast.error('Need some content to create a social media story');
      return;
    }

    setIsGeneratingSocial(true);
    try {
      const { generateSocialMediaStory } = await import('@/lib/gemini');

      // Extract topic from content
      const plainText = content.replace(/<[^>]*>/g, '').trim();
      const topic = plainText.substring(0, 200);

      const socialContent = await generateSocialMediaStory(topic, platform, agentStyle, agentTone);

      // Update content
      setContent(socialContent);

      // Generate name for this revision
      const revisionName = `${platform} Story`;

      // Create revision
      const newRevision: Revision = {
        id: Date.now().toString(),
        content: socialContent,
        timestamp: new Date().toISOString(),
        type: 'ai-generated',
        changes: [],
        name: revisionName
      };

      const updatedRevisions = [...revisions, newRevision];
      setRevisions(updatedRevisions);
      setCurrentRevisionIndex(updatedRevisions.length - 1);

      onSave(socialContent);

      toast.success(`${platform} story created!`);
    } catch (error) {
      console.error('Error generating social story:', error);
      toast.error('Failed to generate story');
    } finally {
      setIsGeneratingSocial(false);
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
          <div className={`${showHistory ? 'w-1/3' : 'w-0'} border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white transition-all duration-300 overflow-hidden flex-shrink-0`}>
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col w-full"
                >
                  <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 flex-shrink-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900 flex items-center text-lg">
                        <History className="h-5 w-5 mr-2 text-green-600" />
                        History
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(false)}
                        className="h-8 w-8 p-0 hover:bg-white/50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-white px-3 py-1 rounded-full border border-gray-200">
                        <p className="text-sm font-semibold text-gray-700">
                          {revisions.length} {revisions.length === 1 ? 'Revision' : 'Revisions'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-h-0">
                    <div className="h-full overflow-y-auto p-4">
                      <div className="space-y-3 pb-4">
                        {revisions.slice().reverse().map((revision, reverseIndex) => {
                          const index = revisions.length - 1 - reverseIndex;
                          const isEditing = editingRevisionId === revision.id;
                          const isCurrent = index === currentRevisionIndex;

                          return (
                            <motion.div
                              key={revision.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: reverseIndex * 0.03 }}
                            >
                              <Card
                                className={`group cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                                  isCurrent
                                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md'
                                    : 'border-gray-200 hover:border-green-300 bg-white'
                                }`}
                                onClick={() => !isEditing && restoreRevision(revision, index)}
                              >
                                <CardContent className="p-4">
                                  {/* Header */}
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <div className={`p-1.5 rounded-lg ${
                                        revision.type === 'ai-generated' ? 'bg-blue-100' :
                                        revision.type === 'user-edit' ? 'bg-green-100' :
                                        revision.type === 'rephrased' ? 'bg-purple-100' : 'bg-gray-100'
                                      }`}>
                                        {getRevisionIcon(revision.type)}
                                      </div>
                                      <div>
                                        <Badge variant="outline" className={`text-xs font-medium ${getRevisionColor(revision.type)}`}>
                                          {revision.type.replace('-', ' ').toUpperCase()}
                                        </Badge>
                                      </div>
                                      {isCurrent && (
                                        <Badge className="text-xs bg-green-600 text-white border-0 shadow-sm">
                                          ✓ Active
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  {/* Revision Name */}
                                  <div className="mb-2">
                                    {isEditing ? (
                                      <div className="flex items-center gap-1">
                                        <Input
                                          value={editingRevisionName}
                                          onChange={(e) => setEditingRevisionName(e.target.value)}
                                          className="h-7 text-sm font-medium"
                                          maxLength={25}
                                          onClick={(e) => e.stopPropagation()}
                                          autoFocus
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            saveRevisionName(revision.id);
                                          }}
                                          className="h-7 w-7 p-0 bg-green-100 hover:bg-green-200"
                                        >
                                          <Check className="h-3.5 w-3.5 text-green-700" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            cancelEditingRevisionName();
                                          }}
                                          className="h-7 w-7 p-0 hover:bg-gray-100"
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <h4 className={`font-semibold text-sm ${isCurrent ? 'text-green-900' : 'text-gray-900'}`}>
                                        {revision.name || 'Untitled Revision'}
                                      </h4>
                                    )}
                                  </div>

                                  {/* Timestamp */}
                                  <div className="flex items-center gap-1 mb-3">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      {new Date(revision.timestamp).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>

                                  {/* Preview */}
                                  <div className="text-xs text-gray-600 line-clamp-3 mb-3 leading-relaxed bg-white/50 p-2 rounded border border-gray-100">
                                    {revision.content.replace(/<[^>]*>/g, '').substring(0, 120)}...
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1 pt-2 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditingRevisionName(revision);
                                      }}
                                      className="h-7 px-2 text-xs hover:bg-blue-50 hover:text-blue-700"
                                      title="Rename"
                                    >
                                      <Pencil className="h-3 w-3 mr-1" />
                                      Rename
                                    </Button>
                                    {!isCurrent && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          restoreRevision(revision, index);
                                        }}
                                        className="h-7 px-2 text-xs hover:bg-green-50 hover:text-green-700"
                                        title="Restore"
                                      >
                                        <RotateCcw className="h-3 w-3 mr-1" />
                                        Restore
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteRevision(index);
                                      }}
                                      className="h-7 px-2 text-xs hover:bg-red-50 hover:text-red-700 ml-auto"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
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
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(!showHistory)}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    <History className="h-4 w-4 mr-2" />
                    {showHistory ? 'Hide' : 'Show'} History
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFormatContent}
                    disabled={isFormattingContent || !content || content.trim().length < 10}
                    className="border-green-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300 font-medium"
                  >
                    {isFormattingContent ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent mr-2"></div>
                        Formatting...
                      </>
                    ) : (
                      <>
                        <AlignJustify className="h-4 w-4 mr-2" />
                        Fix Formatting
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    <span className="font-semibold text-gray-700">{agentStyle}</span>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                    <span className="font-semibold text-gray-700">{agentTone}</span>
                  </div>
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

          {/* Right Sidebar - AI Tools */}
          <div className="w-1/3 border-l border-gray-200 bg-gradient-to-b from-slate-50 via-white to-slate-50 flex flex-col flex-shrink-0 min-h-0">
            {/* Header */}
            <div className="p-4 border-b-2 border-gray-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-xl">
                  AI Tools
                </h3>
              </div>
              <p className="text-xs text-gray-600 ml-12">
                Enhance your content with powerful AI features
              </p>
            </div>

            {/* AI Feature Buttons */}
            <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleGenerateSuggestions}
                  disabled={isLoadingSuggestions}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md h-auto py-3 flex-col items-start"
                >
                  <Lightbulb className="h-4 w-4 mb-1" />
                  <span className="text-xs font-semibold">Get Suggestions</span>
                </Button>

                <Button
                  onClick={() => handleGenerateSocialStory('Instagram')}
                  disabled={isGeneratingSocial}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-md h-auto py-3 flex-col items-start"
                >
                  <Instagram className="h-4 w-4 mb-1" />
                  <span className="text-xs font-semibold">IG Story</span>
                </Button>

                <Button
                  onClick={() => handleGenerateSocialStory('Twitter')}
                  disabled={isGeneratingSocial}
                  className="bg-gradient-to-r from-sky-500 to-blue-500 hover:from-sky-600 hover:to-blue-600 text-white shadow-md h-auto py-3 flex-col items-start"
                >
                  <Twitter className="h-4 w-4 mb-1" />
                  <span className="text-xs font-semibold">Tweet</span>
                </Button>

                <Button
                  onClick={() => handleGenerateSocialStory('LinkedIn')}
                  disabled={isGeneratingSocial}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md h-auto py-3 flex-col items-start"
                >
                  <Linkedin className="h-4 w-4 mb-1" />
                  <span className="text-xs font-semibold">LinkedIn</span>
                </Button>

                <Button
                  onClick={() => handleGenerateSocialStory('Facebook')}
                  disabled={isGeneratingSocial}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-md h-auto py-3 flex-col items-start"
                >
                  <Facebook className="h-4 w-4 mb-1" />
                  <span className="text-xs font-semibold">FB Post</span>
                </Button>

                <Button
                  onClick={() => handleGenerateSocialStory('TikTok')}
                  disabled={isGeneratingSocial}
                  className="bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black text-white shadow-md h-auto py-3 flex-col items-start"
                >
                  <Hash className="h-4 w-4 mb-1" />
                  <span className="text-xs font-semibold">TikTok</span>
                </Button>
              </div>
            </div>

            {/* AI Suggestions List */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-100 flex-shrink-0">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="h-3.5 w-3.5 text-yellow-600" />
                  AI Suggestions
                  {aiSuggestions.length > 0 && (
                    <Badge className="ml-auto bg-yellow-500 text-white text-xs">
                      {aiSuggestions.length}
                    </Badge>
                  )}
                </h4>
              </div>
              
              <div className="flex-1 min-h-0">
                <div className="h-full overflow-y-auto p-4">
                  {isLoadingSuggestions ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-yellow-500"></div>
                        <Lightbulb className="absolute inset-0 m-auto h-6 w-6 text-yellow-500" />
                      </div>
                      <span className="mt-4 text-sm font-medium text-gray-700">Analyzing your content...</span>
                      <span className="text-xs text-gray-500">Generating smart suggestions</span>
                    </div>
                  ) : (
                    <div className="space-y-3 pb-4">
                      {aiSuggestions.length > 0 ? (
                        aiSuggestions.map((suggestion, index) => (
                          <motion.div
                            key={suggestion.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                          >
                            <Card className="group hover:shadow-lg transition-all duration-200 border-2 border-gray-200 hover:border-blue-300 bg-white overflow-hidden">
                              <CardContent className="p-4">
                                {/* Type Badge */}
                                <div className="flex items-start justify-between mb-3">
                                  <Badge className={`text-xs font-semibold border-0 shadow-sm ${
                                    suggestion.type === 'improvement' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' :
                                    suggestion.type === 'grammar' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                                    suggestion.type === 'style' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' :
                                    'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                  }`}>
                                    {suggestion.type.toUpperCase()}
                                  </Badge>
                                  <div className={`p-1.5 rounded-lg ${
                                    suggestion.type === 'improvement' ? 'bg-blue-100' :
                                    suggestion.type === 'grammar' ? 'bg-red-100' :
                                    suggestion.type === 'style' ? 'bg-purple-100' : 'bg-green-100'
                                  }`}>
                                    <Sparkles className={`h-3.5 w-3.5 ${
                                      suggestion.type === 'improvement' ? 'text-blue-600' :
                                      suggestion.type === 'grammar' ? 'text-red-600' :
                                      suggestion.type === 'style' ? 'text-purple-600' : 'text-green-600'
                                    }`} />
                                  </div>
                                </div>

                                {/* Title */}
                                <h4 className="font-bold text-gray-900 text-sm mb-2 leading-tight">
                                  {suggestion.title}
                                </h4>

                                {/* Description */}
                                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                                  {suggestion.description}
                                </p>

                                {/* Action Button */}
                                <Button
                                  size="sm"
                                  className={`w-full text-xs font-semibold shadow-sm transition-all ${
                                    suggestion.type === 'improvement' ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' :
                                    suggestion.type === 'grammar' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' :
                                    suggestion.type === 'style' ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' :
                                    'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                  } text-white border-0`}
                                  onClick={() => applySuggestion(suggestion)}
                                  disabled={isProcessingPrompt}
                                >
                                  {isProcessingPrompt ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></div>
                                      Applying...
                                    </>
                                  ) : (
                                    <>
                                      <Wand2 className="h-3 w-3 mr-1.5" />
                                      {suggestion.action}
                                    </>
                                  )}
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 px-4">
                          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                            <div className="bg-white rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center shadow-sm">
                              <Lightbulb className="h-8 w-8 text-yellow-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1 text-sm">No Suggestions</h4>
                            <p className="text-xs text-gray-600 mb-3">Click "Get Suggestions" to analyze your content</p>
                            <Button
                              size="sm"
                              onClick={handleGenerateSuggestions}
                              disabled={isLoadingSuggestions || !content || content.trim().length < 50}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-xs"
                            >
                              <Lightbulb className="h-3 w-3 mr-1" />
                              Generate Now
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

            {/* AI Writer - Custom Prompt */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex-shrink-0 border-t-2 border-indigo-100">
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2 mb-1">
                  <Wand2 className="h-3.5 w-3.5 text-purple-600" />
                  Custom AI Prompt
                </h4>
                <p className="text-xs text-gray-600">
                  Tell AI exactly what you want to change
                </p>
              </div>

              <div className="relative">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="E.g., 'Make it more engaging'..."
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handlePromptSubmit())}
                      className="pl-3 pr-3 py-5 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg bg-white shadow-sm text-sm"
                      disabled={isProcessingPrompt}
                    />
                  </div>
                  <Button
                    onClick={handlePromptSubmit}
                    disabled={isProcessingPrompt || !prompt.trim()}
                    size="sm"
                    className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all px-4 py-5 rounded-lg font-semibold"
                  >
                    {isProcessingPrompt ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Quick Prompts */}
                {!isProcessingPrompt && !prompt && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <button
                      onClick={() => setPrompt('Make this more engaging and compelling')}
                      className="px-2 py-1 text-[10px] font-medium bg-white border border-indigo-200 rounded-md hover:bg-indigo-50 hover:border-indigo-400 transition-colors"
                    >
                      ✨ Engaging
                    </button>
                    <button
                      onClick={() => setPrompt('Simplify and clarify the language')}
                      className="px-2 py-1 text-[10px] font-medium bg-white border border-purple-200 rounded-md hover:bg-purple-50 hover:border-purple-400 transition-colors"
                    >
                      📝 Simplify
                    </button>
                    <button
                      onClick={() => setPrompt('Add relevant examples')}
                      className="px-2 py-1 text-[10px] font-medium bg-white border border-pink-200 rounded-md hover:bg-pink-50 hover:border-pink-400 transition-colors"
                    >
                      💡 Examples
                    </button>
                    <button
                      onClick={() => setPrompt('Make it more professional')}
                      className="px-2 py-1 text-[10px] font-medium bg-white border border-blue-200 rounded-md hover:bg-blue-50 hover:border-blue-400 transition-colors"
                    >
                      💼 Professional
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}