"use client";

import { useState } from 'react';
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
  { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800', icon: '🔴' }
];

const wordCountRanges = [
  { id: '250', label: '250 words', description: 'Short content' },
  { id: '500', label: '500 words', description: 'Medium content' },
  { id: '1000', label: '1,000 words', description: 'Long content' },
  { id: '1500', label: '1,500 words', description: 'Extended content' },
  { id: '2000', label: '2,000+ words', description: 'Comprehensive content' },
  { id: 'custom', label: 'Custom', description: 'Specify exact count' }
];

export function AddTaskModal({ open, onClose, onSave, agentName }: AddTaskModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskType: '',
    priority: 'medium',
    deadline: '',
    wordCount: 500,
    instructions: '',
    targetAudience: '',
    tone: '',
    keywords: [] as string[],
    references: [] as string[]
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [referenceInput, setReferenceInput] = useState('');

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
    onSave({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      deadline: formData.deadline,
      taskType: formData.taskType,
      wordCount: formData.wordCount,
      instructions: formData.instructions
    });
    onClose();
    setFormData({
      title: '',
      description: '',
      taskType: '',
      priority: 'medium',
      deadline: '',
      wordCount: 500,
      instructions: '',
      targetAudience: '',
      tone: '',
      keywords: [],
      references: []
    });
    setCurrentStep(1);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Requirements & Settings</h3>
        <p className="text-gray-600">Set priority, deadline, and content specifications</p>
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
            {wordCountRanges.map((range) => (
              <Button
                key={range.id}
                type="button"
                variant={formData.wordCount.toString() === range.id ? "default" : "outline"}
                className={`w-full justify-start h-10 text-left ${
                  formData.wordCount.toString() === range.id 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (range.id === 'custom') {
                    // Handle custom input
                  } else {
                    setFormData(prev => ({ ...prev, wordCount: parseInt(range.id) }));
                  }
                }}
              >
                <div>
                  <div className="font-medium">{range.label}</div>
                  <div className="text-xs opacity-75">{range.description}</div>
                </div>
              </Button>
            ))}
          </div>
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
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
          Target Audience
        </Label>
        <Input
          value={formData.targetAudience}
          onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
          placeholder="e.g., Tech professionals, Small business owners, Students"
          className="h-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Additional Instructions</h3>
        <p className="text-gray-600">Add keywords, references, and special instructions</p>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
          Keywords to Focus On
        </Label>
        <div className="flex gap-2 mb-3">
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Add keyword..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
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
          Reference Links/URLs
        </Label>
        <div className="flex gap-2 mb-3">
          <Input
            value={referenceInput}
            onChange={(e) => setReferenceInput(e.target.value)}
            placeholder="Add reference URL..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddReference())}
            className="flex-1 border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
          <Button 
            type="button" 
            onClick={handleAddReference}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Link className="h-4 w-4" />
          </Button>
        </div>
        {formData.references.length > 0 && (
          <div className="space-y-2 mb-4">
            {formData.references.map((reference, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <Link className="h-4 w-4 text-gray-500" />
                <span className="flex-1 text-sm text-gray-700 truncate">{reference}</span>
                <X 
                  className="h-4 w-4 cursor-pointer text-gray-400 hover:text-red-600" 
                  onClick={() => handleRemoveReference(reference)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
          Special Instructions
        </Label>
        <Textarea
          value={formData.instructions}
          onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
          placeholder="Any additional instructions, style preferences, or specific requirements..."
          rows={3}
          className="border-gray-200 focus:border-green-500 focus:ring-green-500"
        />
      </div>
      
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
          Reference Materials (Optional)
        </Label>
        <div className="grid grid-cols-4 gap-3">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-green-400 transition-colors cursor-pointer group">
            <FileText className="h-5 w-5 text-gray-400 group-hover:text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Documents</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-green-400 transition-colors cursor-pointer group">
            <Image className="h-5 w-5 text-gray-400 group-hover:text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Images</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-green-400 transition-colors cursor-pointer group">
            <Video className="h-5 w-5 text-gray-400 group-hover:text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Videos</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-green-400 transition-colors cursor-pointer group">
            <Upload className="h-5 w-5 text-gray-400 group-hover:text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Upload</p>
          </div>
        </div>
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
              <p className="text-gray-600 mt-1">Step {currentStep} of 3</p>
            </div>
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
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
              animate={{ width: `${(currentStep / 3) * 100}%` }}
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
              {currentStep === 3 && renderStep3()}
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
              
              {currentStep < 3 ? (
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
                  disabled={!formData.title || !formData.description || !formData.taskType}
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