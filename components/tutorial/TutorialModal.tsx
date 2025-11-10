"use client";

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Sparkles, Users, FileText, Edit, Check, Lightbulb, Keyboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TutorialModalProps {
  open: boolean;
  onClose: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  icon: JSX.Element;
  content: string;
  bullets?: string[];
  tip?: string;
  example?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to QuikQuill!",
    description: "Your AI-powered writing assistant with specialized agents",
    icon: <Sparkles className="h-12 w-12 text-blue-600" />,
    content: "QuikQuill transforms how you write by creating multiple AI agents, each with unique personalities and expertise. Perfect for blogs, marketing, technical docs, and more!",
    bullets: [
      "Create unlimited AI writer agents",
      "Each agent has its own style and tone",
      "Perfect for different content types",
      "Collaborate with AI, not just use it"
    ],
    tip: "Think of agents as your personal writing team - each member specializes in different types of content!"
  },
  {
    title: "Step 1: Create Your First Agent",
    description: "Build specialized AI writers in seconds",
    icon: <Users className="h-12 w-12 text-purple-600" />,
    content: "Agents are the foundation of QuikQuill. Each one can be tailored to your specific needs.",
    bullets: [
      "Give your agent a name (e.g., 'Blog Writer', 'Email Expert')",
      "Define their role and expertise area",
      "Set writing style: professional, casual, technical, creative",
      "Choose tone: friendly, authoritative, informative, persuasive",
      "Add custom keywords to prioritize"
    ],
    tip: "Start with 2-3 agents for different purposes. For example: one for blog posts, one for social media, and one for emails.",
    example: "Example: Create a 'Tech Blogger' agent with a casual, informative tone and keywords like 'AI', 'productivity', 'innovation'."
  },
  {
    title: "Step 2: Add Writing Tasks",
    description: "Give your agents assignments and watch the magic happen",
    icon: <FileText className="h-12 w-12 text-green-600" />,
    content: "Tasks are where your agents create content. Be specific to get the best results!",
    bullets: [
      "Describe what you need: topic, length, key points",
      "Attach reference files (PDFs, docs, links) for context",
      "Select which agent should handle the task",
      "Your agent generates high-quality first drafts instantly",
      "View all tasks organized by agent"
    ],
    tip: "The more specific your task description, the better the output. Include target audience, desired length, and key points to cover.",
    example: "Example: 'Write a 500-word blog post about AI writing tools for small business owners, focusing on time-saving benefits'."
  },
  {
    title: "Step 3: Edit and Refine",
    description: "Polish your content with AI-powered editing tools",
    icon: <Edit className="h-12 w-12 text-orange-600" />,
    content: "Our smart editor makes revisions effortless with powerful AI assistance built right in.",
    bullets: [
      "Highlight any text to instantly rephrase it",
      "Use custom prompts: 'make this more concise', 'add statistics'",
      "Track all revisions with branching history",
      "Compare different versions side-by-side",
      "Undo/redo with full version control"
    ],
    tip: "Don't like a change? Use the revision history to restore any previous version. Every edit creates a new branch you can explore!",
    example: "Pro tip: Select text and try prompts like 'make this sound more professional' or 'simplify for beginners'."
  },
  {
    title: "Quick Tips & Shortcuts",
    description: "Master QuikQuill like a pro",
    icon: <Lightbulb className="h-12 w-12 text-yellow-600" />,
    content: "Here are some pro tips to supercharge your workflow:",
    bullets: [
      "Create agents for different audiences (B2B, B2C, technical)",
      "Use reference materials to maintain brand voice consistency",
      "Start with short tasks to test agent output quality",
      "Experiment with different tones and styles",
      "Save successful prompts for future use"
    ],
    tip: "Keyboard shortcuts coming soon! Stay tuned for even faster workflows."
  },
  {
    title: "You're All Set!",
    description: "Time to start creating amazing content",
    icon: <Check className="h-12 w-12 text-green-600" />,
    content: "You now know everything to get started with QuikQuill. Ready to transform your writing workflow?",
    bullets: [
      "Click 'Create Agent' to build your first AI writer",
      "Start with a simple task to test it out",
      "Explore the editor to see AI editing in action",
      "Need help? Check documentation or contact support"
    ],
    tip: "Remember: Your first drafts don't need to be perfect. That's what the AI editor is for!"
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

  const step = tutorialSteps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          {/* Header with Skip Button */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Skip
            </Button>
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
                <CardContent className="p-0">
                  {/* Icon and Title - Centered */}
                  <div className="text-center mb-6">
                    <div className="mb-4 flex justify-center">
                      {step.icon}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h2>
                    <p className="text-lg text-blue-600 font-medium">
                      {step.description}
                    </p>
                  </div>

                  {/* Content - Left Aligned */}
                  <div className="text-left space-y-4">
                    <p className="text-gray-700 leading-relaxed">
                      {step.content}
                    </p>

                    {/* Bullet Points */}
                    {step.bullets && step.bullets.length > 0 && (
                      <ul className="space-y-2 ml-1">
                        {step.bullets.map((bullet, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2 mt-1 flex-shrink-0">•</span>
                            <span className="text-gray-700">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Example */}
                    {step.example && (
                      <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r">
                        <p className="text-sm text-purple-900 font-medium mb-1">
                          💡 {step.example}
                        </p>
                      </div>
                    )}

                    {/* Tip */}
                    {step.tip && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r">
                        <div className="flex items-start">
                          <Lightbulb className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-blue-900 mb-1">Pro Tip</p>
                            <p className="text-sm text-blue-800">{step.tip}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="min-w-[100px]"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-blue-600 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white min-w-[100px]"
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