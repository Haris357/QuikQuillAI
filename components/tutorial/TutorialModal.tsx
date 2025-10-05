"use client";

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Sparkles, Users, FileText, Edit, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
}

const tutorialSteps = [
  {
    title: "Welcome to QuikQuill!",
    description: "Your AI-powered writing assistant that creates specialized writer agents for any project.",
    icon: <Sparkles className="h-12 w-12 text-blue-600" />,
    content: "QuikQuill helps you create multiple AI writer agents, each with their own personality, writing style, and expertise. Let's get you started!"
  },
  {
    title: "Create Your First Agent",
    description: "Set up specialized AI writers for different types of content and projects.",
    icon: <Users className="h-12 w-12 text-purple-600" />,
    content: "Each agent can be customized with specific roles, writing styles, tones, and keywords. Think of them as your personal writing team!"
  },
  {
    title: "Add Writing Tasks",
    description: "Give your agents specific writing assignments and watch them create amazing content.",
    icon: <FileText className="h-12 w-12 text-green-600" />,
    content: "Simply describe what you need written, attach reference materials if needed, and your agent will generate high-quality content tailored to your requirements."
  },
  {
    title: "Edit and Refine",
    description: "Use our powerful editor to refine content with AI assistance and track revisions.",
    icon: <Edit className="h-12 w-12 text-orange-600" />,
    content: "Highlight any text to rephrase it instantly, use custom prompts to modify content, and keep track of all revisions with our branching history system."
  },
  {
    title: "You're All Set!",
    description: "Ready to revolutionize your writing workflow with AI assistance.",
    icon: <Check className="h-12 w-12 text-green-600" />,
    content: "Start by creating your first agent and giving it a writing task. Need help? Check out our documentation or contact support."
  }
];

export function TutorialModal({ open, onClose }: TutorialModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-none">
                <CardContent className="p-0 text-center">
                  <div className="mb-6">
                    {tutorialSteps[currentStep].icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {tutorialSteps[currentStep].title}
                  </h2>
                  <p className="text-lg text-blue-600 font-medium mb-4">
                    {tutorialSteps[currentStep].description}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {tutorialSteps[currentStep].content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  Get Started
                  <Sparkles className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}