"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileText, Image, Video, Link, Plus, Target, Clock, Zap, X, Calendar, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (task: {
    title: string;
    description: string;
    attachments?: string[];
    priority?: string;
    deadline?: string;
    taskType?: string;
    wordCount?: number;
    instructions?: string;
    targetAudience?: string;
    tone?: string;
    keywords?: string[];
    references?: string[];
  }) => void;
  agentName: string;
}

const taskTypes = [
  { id: 'blog-post', label: 'Blog Post', icon: '📝', description: 'Engaging blog content' },
  { id: 'article', label: 'Article', icon: '📰', description: 'In-depth article writing' },
  { id: 'social-media', label: 'Social Media', icon: '📱', description: 'Social media posts' },
  { id: 'email', label: 'Email', icon: '✉️', description: 'Email campaigns' },
  { id: 'product-description', label: 'Product Description', icon: '🛍️', description: 'E-commerce content' },
  { id: 'press-release', label: 'Press Release', icon: '📢', description: 'News announcements' },
  { id: 'case-study', label: 'Case Study', icon: '📊', description: 'Success stories' },
  { id: 'white-paper', label: 'White Paper', icon: '📄', description: 'Technical documents' },
  { id: 'landing-page', label: 'Landing Page', icon: '🎯', description: 'Conversion-focused copy' },
  { id: 'newsletter', label: 'Newsletter', icon: '📬', description: 'Regular updates' },
  { id: 'script', label: 'Script', icon: '🎬', description: 'Video/audio scripts' },
  { id: 'other', label: 'Other', icon: '📋', description: 'Custom content type' }
];

const priorities = [
  { id: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800', icon: '🔵' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
  { id: 'high', label: 'High', color: 'bg-red-100 text-red-800', icon: '🔴' }
];

const wordCountRanges = [
  { id: '250', label: '250 words', description: 'Short content' },
  { id: '500', label: '500 words', description: 'Medium content' },
  { id: '1000', label: '1,000 words', description: 'Long content' },
  { id: '1500', label: '1,500 words', description: 'Extended content' },
  { id: '2000', label: '2,000 words', description: 'Comprehensive content' },
  { id: 'custom', label: 'Custom', description: 'Specify exact count' }
];

const toneOptions = [
  { id: 'professional', label: 'Professional', icon: '💼', description: 'Formal and business-like' },
  { id: 'casual', label: 'Casual', icon: '😊', description: 'Friendly and conversational' },
  { id: 'friendly', label: 'Friendly', icon: '🤝', description: 'Warm and approachable' },
  { id: 'formal', label: 'Formal', icon: '🎓', description: 'Academic and authoritative' },
  { id: 'enthusiastic', label: 'Enthusiastic', icon: '🎉', description: 'Energetic and excited' },
  { id: 'informative', label: 'Informative', icon: '📚', description: 'Educational and clear' },
  { id: 'persuasive', label: 'Persuasive', icon: '🎯', description: 'Convincing and compelling' },
  { id: 'humorous', label: 'Humorous', icon: '😄', description: 'Light and entertaining' }
];

const targetAudienceOptions = [
  { id: 'general', label: 'General Public', icon: '👥' },
  { id: 'professionals', label: 'Professionals', icon: '👔' },
  { id: 'students', label: 'Students', icon: '🎓' },
  { id: 'entrepreneurs', label: 'Entrepreneurs', icon: '💼' },
  { id: 'developers', label: 'Developers', icon: '💻' },
  { id: 'marketers', label: 'Marketers', icon: '📊' },
  { id: 'business-owners', label: 'Business Owners', icon: '🏢' },
  { id: 'creatives', label: 'Creatives', icon: '🎨' },
  { id: 'tech-savvy', label: 'Tech Enthusiasts', icon: '🚀' },
  { id: 'beginners', label: 'Beginners', icon: '🌱' }
];

export function AddTaskModal({ open, onClose, onSave, agentName }: AddTaskModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [canSubmit, setCanSubmit] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: '',
    priority: 'medium',
    deadline: '',
    wordCount: 500,
    instructions: '',
    targetAudience: '',
    tone: 'professional',
    keywords: [] as string[],
    references: [] as string[]
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [referenceInput, setReferenceInput] = useState('');
  const [showCustomWordCount, setShowCustomWordCount] = useState(false);
  const [customWordCount, setCustomWordCount] = useState('');

  // Reset modal state when modal opens
  useEffect(() => {
    if (open) {
      console.log('Task modal opened, setting to step 1');
      setCurrentStep(1);
      setCanSubmit(false);
    }
  }, [open]);

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleAddReference = () => {
    if (referenceInput.trim() && !formData.references.includes(referenceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        references: [...prev.references, referenceInput.trim()]
      }));
      setReferenceInput('');
    }
  };

  const handleRemoveReference = (reference: string) => {
    setFormData(prev => ({
      ...prev,
      references: prev.references.filter(r => r !== reference)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    console.log('Task handleSubmit called, currentStep:', currentStep, 'canSubmit:', canSubmit);

    // Only submit if we're on step 2
    if (currentStep !== 2) {
      console.log('Blocked task submission - not on step 2');
      return;
    }

    // Prevent accidental submission right after step change
    if (!canSubmit) {
      console.log('Blocked task submission - canSubmit is false');
      return;
    }

    onSave({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      deadline: formData.deadline,
      taskType: formData.taskType,
      wordCount: formData.wordCount,
      instructions: formData.instructions,
      targetAudience: formData.targetAudience,
      tone: formData.tone,
      keywords: formData.keywords,
      references: formData.references
    });
    onClose();
    // Reset form
    setFormData({
      title: '',
      description: '',
      taskType: '',
      priority: 'medium',
      deadline: '',
      wordCount: 500,
      instructions: '',
      targetAudience: '',
      tone: 'professional',
      keywords: [],
      references: []
    });
    setCurrentStep(1);
    setCanSubmit(false);
    setShowCustomWordCount(false);
    setCustomWordCount('');
    setKeywordInput('');
    setReferenceInput('');
  };

  const nextStep = () => {
    console.log('Task nextStep called, current:', currentStep);
    setCanSubmit(false); // Disable submission when changing steps
    setCurrentStep(prev => {
      const next = Math.min(prev + 1, 2);
      console.log('Moving to task step:', next);

      // Enable submission after a brief delay if moving to step 2
      if (next === 2) {
        setTimeout(() => {
          console.log('Enabling submit for task step 2');
          setCanSubmit(true);
        }, 300);
      }

      return next;
    });
  };

  const prevStep = () => {
    console.log('Task prevStep called, current:', currentStep);
    setCanSubmit(false);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Details</h3>
        <p className="text-gray-600">Define what you want {agentName} to create</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-semibold text-gray-700 mb-2 block">
            Task Title *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Write a blog post about AI trends in 2024"
            required
            className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
        
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-3 block">
            Content Type *
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {taskTypes.map((type) => (
              <Card 
                key={type.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  formData.taskType === type.id 
                    ? 'ring-2 ring-green-500 bg-green-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, taskType: type.id }))}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <h4 className="font-medium text-gray-900 text-sm mb-1">{type.label}</h4>
                  <p className="text-xs text-gray-600">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-2 block">
            Task Description *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Provide detailed instructions for the AI writer. Be specific about what you want, the style, key points to cover, etc."
            required
            rows={4}
            className="border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Flag className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Task Configuration</h3>
        <p className="text-gray-600">Set requirements, specifications, and instructions</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-3 block">
            Priority Level
          </Label>
          <div className="space-y-2">
            {priorities.map((priority) => (
              <Button
                key={priority.id}
                type="button"
                variant={formData.priority === priority.id ? "default" : "outline"}
                className={`w-full justify-start h-10 ${
                  formData.priority === priority.id 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, priority: priority.id }))}
              >
                <span className="mr-2">{priority.icon}</span>
                {priority.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-3 block">
            Word Count Target
          </Label>
          <div className="space-y-2">
            {wordCountRanges.slice(0, -1).map((range) => (
              <Button
                key={range.id}
                type="button"
                variant={formData.wordCount.toString() === range.id && !showCustomWordCount ? "default" : "outline"}
                className={`w-full justify-start h-10 text-left ${
                  formData.wordCount.toString() === range.id && !showCustomWordCount
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setShowCustomWordCount(false);
                  setFormData(prev => ({ ...prev, wordCount: parseInt(range.id) }));
                }}
              >
                <div>
                  <div className="font-medium">{range.label}</div>
                  <div className="text-xs opacity-75">{range.description}</div>
                </div>
              </Button>
            ))}
            <Button
              type="button"
              variant={showCustomWordCount ? "default" : "outline"}
              className={`w-full justify-start h-10 text-left ${
                showCustomWordCount
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setShowCustomWordCount(true)}
            >
              <div>
                <div className="font-medium">Custom</div>
                <div className="text-xs opacity-75">Specify exact count</div>
              </div>
            </Button>
            {showCustomWordCount && (
              <Input
                type="number"
                min="50"
                max="10000"
                value={customWordCount}
                onChange={(e) => {
                  setCustomWordCount(e.target.value);
                  const count = parseInt(e.target.value);
                  if (!isNaN(count) && count > 0) {
                    setFormData(prev => ({ ...prev, wordCount: count }));
                  }
                }}
                placeholder="Enter word count (e.g., 750)"
                className="h-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
            )}
          </div>
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
          Content Tone
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {toneOptions.map((tone) => (
            <Card
              key={tone.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                formData.tone === tone.id
                  ? 'ring-2 ring-green-500 bg-green-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, tone: tone.id }))}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{tone.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm">{tone.label}</h4>
                    <p className="text-xs text-gray-600 truncate">{tone.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="deadline" className="text-sm font-semibold text-gray-700 mb-2 block">
          Deadline (Optional)
        </Label>
        <Input
          id="deadline"
          type="datetime-local"
          value={formData.deadline}
          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
          className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
        />
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
          Target Audience
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {targetAudienceOptions.map((audience) => (
            <Button
              key={audience.id}
              type="button"
              variant={formData.targetAudience === audience.label ? "default" : "outline"}
              className={`h-auto p-3 flex flex-col items-center gap-1 text-center ${
                formData.targetAudience === audience.label
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, targetAudience: audience.label }))}
            >
              <span className="text-lg">{audience.icon}</span>
              <span className="text-xs font-medium leading-tight">{audience.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
          Keywords to Focus On (Optional)
        </Label>
        <div className="flex gap-2 mb-3">
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Add keyword..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddKeyword();
              }
            }}
            className="flex-1 border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
          <Button
            type="button"
            onClick={handleAddKeyword}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {formData.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800">
                {keyword}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-600"
                  onClick={() => handleRemoveKeyword(keyword)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
          Special Instructions (Optional)
        </Label>
        <Textarea
          value={formData.instructions}
          onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
          placeholder="Any additional instructions, style preferences, or specific requirements..."
          rows={3}
          className="border-gray-200 focus:border-green-500 focus:ring-green-500"
        />
      </div>
    </div>
  );


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Add Task for <span className="text-green-600">{agentName}</span>
              </DialogTitle>
              <p className="text-gray-600 mt-1">Step {currentStep} of 2</p>
            </div>
            <div className="flex items-center space-x-2">
              {[1, 2].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep
                      ? 'bg-green-600 text-white'
                      : step < currentStep
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step < currentStep ? '✓' : step}
                </div>
              ))}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <motion.div
              className="bg-gradient-to-r from-green-600 to-green-700 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 2) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </DialogHeader>
        
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-gray-200 hover:bg-gray-50"
            >
              Previous
            </Button>
            
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="border-gray-200 hover:bg-gray-50">
                Cancel
              </Button>
              
              {currentStep < 2 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && (!formData.title || !formData.description || !formData.taskType))
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Next Step
                  <Clock className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!formData.title || !formData.description || !formData.taskType || !canSubmit}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                >
                  Create Task
                  <Zap className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}