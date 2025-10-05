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
import { Agent } from '@/types';
import { X, Upload, FileText, Image, Video, Plus, Sparkles, User, Briefcase, Palette, MessageSquare, Hash, FileUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateAgentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (agent: Omit<Agent, 'id' | 'createdAt' | 'userId'>) => void;
  editingAgent?: Agent | null;
}

const writingStyles = [
  { id: 'academic', label: 'Academic', description: 'Formal, research-based writing' },
  { id: 'blog', label: 'Blog Post', description: 'Engaging, conversational content' },
  { id: 'creative', label: 'Creative', description: 'Imaginative, storytelling approach' },
  { id: 'technical', label: 'Technical', description: 'Precise, detailed documentation' },
  { id: 'marketing', label: 'Marketing', description: 'Persuasive, conversion-focused' },
  { id: 'news', label: 'News Article', description: 'Factual, journalistic style' },
  { id: 'email', label: 'Email', description: 'Professional communication' },
  { id: 'social', label: 'Social Media', description: 'Short, engaging posts' },
  { id: 'professional', label: 'Professional', description: 'Business-appropriate tone' },
  { id: 'casual', label: 'Casual', description: 'Relaxed, friendly approach' }
];

const tones = [
  { id: 'professional', label: 'Professional', icon: '💼' },
  { id: 'friendly', label: 'Friendly', icon: '😊' },
  { id: 'formal', label: 'Formal', icon: '🎩' },
  { id: 'conversational', label: 'Conversational', icon: '💬' },
  { id: 'persuasive', label: 'Persuasive', icon: '🎯' },
  { id: 'informative', label: 'Informative', icon: '📚' },
  { id: 'enthusiastic', label: 'Enthusiastic', icon: '🚀' },
  { id: 'authoritative', label: 'Authoritative', icon: '👑' },
  { id: 'empathetic', label: 'Empathetic', icon: '❤️' },
  { id: 'witty', label: 'Witty', icon: '😄' }
];

const predefinedKeywords = [
  'SEO Optimization', 'Content Marketing', 'Social Media', 'Email Marketing',
  'Brand Awareness', 'Lead Generation', 'Customer Engagement', 'Digital Strategy',
  'Analytics', 'Conversion Rate', 'User Experience', 'Mobile Optimization',
  'E-commerce', 'B2B Marketing', 'B2C Marketing', 'Influencer Marketing',
  'Video Content', 'Podcast', 'Webinar', 'Case Study', 'White Paper',
  'Product Launch', 'Press Release', 'Newsletter', 'Blog Strategy'
];

const jobRoles = [
  'Content Marketing Specialist', 'Copywriter', 'Technical Writer', 'Blog Writer',
  'Social Media Manager', 'Email Marketing Specialist', 'SEO Content Writer',
  'Creative Writer', 'Journalist', 'Academic Writer', 'Grant Writer',
  'Proposal Writer', 'Marketing Manager', 'Brand Strategist', 'Communications Manager'
];

export function CreateAgentModal({ open, onClose, onSave, editingAgent }: CreateAgentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: editingAgent?.name || '',
    role: editingAgent?.role || '',
    writingStyle: editingAgent?.writingStyle || '',
    tone: editingAgent?.tone || '',
    keywords: editingAgent?.keywords || [],
    description: '',
    expertise: '',
    targetAudience: '',
    contentTypes: [] as string[],
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(editingAgent?.keywords || []);

  const handleAddKeyword = (keyword?: string) => {
    const keywordToAdd = keyword || keywordInput.trim();
    if (keywordToAdd && !selectedKeywords.includes(keywordToAdd)) {
      const newKeywords = [...selectedKeywords, keywordToAdd];
      setSelectedKeywords(newKeywords);
      setFormData(prev => ({ ...prev, keywords: newKeywords }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    const newKeywords = selectedKeywords.filter(k => k !== keyword);
    setSelectedKeywords(newKeywords);
    setFormData(prev => ({ ...prev, keywords: newKeywords }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      role: formData.role,
      writingStyle: formData.writingStyle,
      tone: formData.tone,
      keywords: selectedKeywords,
    });
    onClose();
    setFormData({ 
      name: '', 
      role: '', 
      writingStyle: '', 
      tone: '', 
      keywords: [],
      description: '',
      expertise: '',
      targetAudience: '',
      contentTypes: []
    });
    setSelectedKeywords([]);
    setCurrentStep(1);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Basic Information</h3>
        <p className="text-gray-600">Let's start with the basics about your AI writer</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <Label htmlFor="name" className="text-sm font-semibold text-gray-700 mb-2 block">
            Agent Name *
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Blog Writer Pro, Technical Documentation Expert"
            required
            className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
        
        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">
            Job Role *
          </Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
          >
            <SelectTrigger className="h-12 border-gray-200 focus:border-green-500 focus:ring-green-500">
              <SelectValue placeholder="Select a job role or type custom" />
            </SelectTrigger>
            <SelectContent>
              {jobRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={formData.role}
            onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
            placeholder="Or type a custom role..."
            className="mt-2 h-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <Label className="text-sm font-semibold text-gray-700 mb-2 block">
            Agent Description
          </Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this agent specializes in and its unique capabilities..."
            rows={3}
            className="border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Palette className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Writing Style & Tone</h3>
        <p className="text-gray-600">Define how your AI writer should communicate</p>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
          Writing Style *
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {writingStyles.map((style) => (
            <Card 
              key={style.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                formData.writingStyle === style.label 
                  ? 'ring-2 ring-green-500 bg-green-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, writingStyle: style.label }))}
            >
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-900 mb-1">{style.label}</h4>
                <p className="text-xs text-gray-600">{style.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
          Tone *
        </Label>
        <div className="grid grid-cols-5 gap-2">
          {tones.map((tone) => (
            <Button
              key={tone.id}
              type="button"
              variant={formData.tone === tone.label ? "default" : "outline"}
              className={`h-auto p-3 flex flex-col items-center gap-2 ${
                formData.tone === tone.label 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setFormData(prev => ({ ...prev, tone: tone.label }))}
            >
              <span className="text-lg">{tone.icon}</span>
              <span className="text-xs font-medium">{tone.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Hash className="h-8 w-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Keywords & Specialization</h3>
        <p className="text-gray-600">Define focus areas and expertise</p>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-3 block">
          Quick Select Keywords
        </Label>
        <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
          {predefinedKeywords.map((keyword) => (
            <Button
              key={keyword}
              type="button"
              size="sm"
              variant={selectedKeywords.includes(keyword) ? "default" : "outline"}
              className={`text-xs h-7 ${
                selectedKeywords.includes(keyword)
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => {
                if (selectedKeywords.includes(keyword)) {
                  handleRemoveKeyword(keyword);
                } else {
                  handleAddKeyword(keyword);
                }
              }}
            >
              {selectedKeywords.includes(keyword) && <X className="h-3 w-3 mr-1" />}
              {keyword}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-semibold text-gray-700 mb-2 block">
          Custom Keywords
        </Label>
        <div className="flex gap-2 mb-3">
          <Input
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            placeholder="Add custom keyword..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
            className="flex-1 border-gray-200 focus:border-green-500 focus:ring-green-500"
          />
          <Button 
            type="button" 
            onClick={() => handleAddKeyword()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {selectedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedKeywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
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
          Reference Files (Optional)
        </Label>
        <div className="grid grid-cols-3 gap-3">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors cursor-pointer group">
            <FileText className="h-6 w-6 text-gray-400 group-hover:text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Documents</p>
            <p className="text-xs text-gray-500">PDF, DOC, TXT</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors cursor-pointer group">
            <Image className="h-6 w-6 text-gray-400 group-hover:text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Images</p>
            <p className="text-xs text-gray-500">JPG, PNG, GIF</p>
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors cursor-pointer group">
            <Video className="h-6 w-6 text-gray-400 group-hover:text-green-500 mx-auto mb-1" />
            <p className="text-xs text-gray-600">Videos</p>
            <p className="text-xs text-gray-500">MP4, MOV, AVI</p>
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
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                {editingAgent ? 'Edit AI Writer Agent' : 'Create New AI Writer Agent'}
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
                    (currentStep === 1 && (!formData.name || !formData.role)) ||
                    (currentStep === 2 && (!formData.writingStyle || !formData.tone))
                  }
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Next Step
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={!formData.name || !formData.role || !formData.writingStyle || !formData.tone}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                >
                  {editingAgent ? 'Update Agent' : 'Create Agent'}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
}