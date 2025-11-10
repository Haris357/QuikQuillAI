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
    icon: <Sparkles className="h-12 w-12 text-green-600" />,
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
    icon: <Users className="h-12 w-12 text-green-600" />,
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
    icon: <Edit className="h-12 w-12 text-green-600" />,
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
    icon: <Lightbulb className="h-12 w-12 text-green-600" />,
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
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-6">
          {/* Header with Skip Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </span>
                <span className="text-sm font-bold text-green-600">
                  {Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                <motion.div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full shadow-sm"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="h-4 w-4 mr-1" />
              Skip
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card className="border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
                <CardContent className="p-8">
                  {/* Icon and Title - Centered */}
                  <div className="text-center mb-8">
                    <motion.div
                      className="mb-5 flex justify-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center shadow-md">
                        {step.icon}
                      </div>
                    </motion.div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h2>
                    <p className="text-lg text-green-600 font-semibold">
                      {step.description}
                    </p>
                  </div>

                  {/* Content - Left Aligned */}
                  <div className="text-left space-y-5">
                    <p className="text-gray-700 text-base leading-relaxed">
                      {step.content}
                    </p>

                    {/* Bullet Points */}
                    {step.bullets && step.bullets.length > 0 && (
                      <ul className="space-y-3 ml-1">
                        {step.bullets.map((bullet, index) => (
                          <motion.li
                            key={index}
                            className="flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                          >
                            <span className="text-green-600 mr-3 mt-1 flex-shrink-0 font-bold text-lg">•</span>
                            <span className="text-gray-700 leading-relaxed">{bullet}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}

                    {/* Example */}
                    {step.example && (
                      <motion.div
                        className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 }}
                      >
                        <div className="flex items-start">
                          <span className="text-2xl mr-2 flex-shrink-0">💡</span>
                          <p className="text-sm text-green-900 font-medium">
                            {step.example}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Tip */}
                    {step.tip && (
                      <motion.div
                        className="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 }}
                      >
                        <div className="flex items-start">
                          <Lightbulb className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-green-900 mb-1">Pro Tip</p>
                            <p className="text-sm text-green-800 leading-relaxed">{step.tip}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-gray-100">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="min-w-[110px] border-gray-300 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <div className="flex gap-2">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8 h-3 bg-green-600 shadow-md'
                      : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white min-w-[110px] shadow-md hover:shadow-lg transition-all duration-300"
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  Get Started
                  <Sparkles className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}