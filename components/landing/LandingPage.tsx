"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  CheckCircle,
  Users,
  FileText,
  Zap,
  Sparkles,
  Menu,
  X,
  Edit,
  Brain,
  Rocket,
  TrendingUp,
  BookOpen,
  Code,
  MessageSquare,
  ChevronDown,
  Shield,
  Clock,
  Globe,
  Star,
  Check,
  Play,
  Award,
  Target,
  BarChart3,
  Layers,
  Infinity,
  Lock,
  Headphones,
  Mail,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LandingPageProps {
  onSignIn: () => void;
}

export function LandingPage({ onSignIn }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multi-Agent System",
      description: "Create specialized AI writers for different projects and content types"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Smart Task Management",
      description: "Organize writing tasks and let AI agents handle content generation"
    },
    {
      icon: <Edit className="h-6 w-6" />,
      title: "Powerful Editor",
      description: "Real-time editing with AI suggestions and revision history"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Customizable Agents",
      description: "Set unique writing styles, tones, and expertise for each agent"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Lightning Fast",
      description: "Powered by Google's Gemini AI for instant content generation"
    },
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "Easy to Use",
      description: "Simple interface designed for writers, marketers, and content creators"
    }
  ];

  const useCases = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Content Marketers",
      description: "Generate blog posts, social media content, and marketing copy at scale",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Writers & Authors",
      description: "Overcome writer's block with AI-powered brainstorming and drafting",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Technical Writers",
      description: "Create documentation, tutorials, and technical guides efficiently",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Social Media Managers",
      description: "Craft engaging posts and responses across multiple platforms",
      color: "from-pink-500 to-pink-600"
    }
  ];

  const stats = [
    { value: "10K+", label: "Content Pieces Generated" },
    { value: "99.9%", label: "Uptime Guarantee" },
    { value: "5 Min", label: "Average Setup Time" },
    { value: "24/7", label: "AI Availability" }
  ];

  const faqs = [
    {
      question: "What is QuikQuill?",
      answer: "QuikQuill is an AI-powered writing platform that lets you create specialized AI writer agents. Each agent can have its own unique writing style, tone, and expertise to help you generate high-quality content faster."
    },
    {
      question: "How does the multi-agent system work?",
      answer: "You can create multiple AI agents, each configured for different purposes. For example, one agent for blog posts, another for social media, and another for technical documentation. Each agent maintains its own style and context."
    },
    {
      question: "What AI model powers QuikQuill?",
      answer: "QuikQuill is powered by Google's Gemini AI, one of the most advanced large language models available. This ensures high-quality, contextually relevant content generation."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use industry-standard encryption and security practices. Your data is stored securely in Firebase, and we never share your content with third parties."
    },
    {
      question: "Can I customize the AI's writing style?",
      answer: "Yes! Each agent can be customized with specific writing styles, tones, expertise levels, and focus areas. This allows you to create agents that match your exact needs."
    },
    {
      question: "Is there a free plan?",
      answer: "Yes, QuikQuill is free to use with Google authentication. You get access to all core features including agent creation, task management, and our powerful editor."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">QuikQuill</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Features</a>
              <a href="#use-cases" className="text-gray-600 hover:text-green-600 transition-colors font-medium">Use Cases</a>
              <a href="#faq" className="text-gray-600 hover:text-green-600 transition-colors font-medium">FAQ</a>
              <Button onClick={onSignIn} className="bg-green-600 hover:bg-green-700 text-white">
                Get Started Free
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#features" className="block text-gray-600 hover:text-green-600 transition-colors font-medium">Features</a>
                <a href="#use-cases" className="block text-gray-600 hover:text-green-600 transition-colors font-medium">Use Cases</a>
                <a href="#faq" className="block text-gray-600 hover:text-green-600 transition-colors font-medium">FAQ</a>
                <Button onClick={onSignIn} className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Get Started Free
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-50" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-green-100 text-green-800 border-green-200">
                🚀 AI-Powered Writing Assistant
              </Badge>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                AI Writer Agents That
                <span className="block text-green-600">Work Like Your Team</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Create specialized AI writers with unique styles and tones.
                Generate content, edit with AI assistance, and manage everything in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  onClick={onSignIn}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  Free to use
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  Powered by Gemini AI
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Content Creation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features to help you create better content with AI assistance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-upwork-hover transition-all duration-300 border-0 shadow-upwork">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple 3-Step Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started with QuikQuill in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create AI Agents</h3>
              <p className="text-gray-600">Set up specialized writers with unique styles and expertise</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Tasks</h3>
              <p className="text-gray-600">Describe what you need and let AI generate content instantly</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-green-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Edit & Refine</h3>
              <p className="text-gray-600">Use the AI-powered editor to polish and perfect your content</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
                Perfect For Every Creator
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Built for Modern Content Creators
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Whether you're a marketer, writer, or developer, QuikQuill adapts to your workflow
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${useCase.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                      {useCase.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{useCase.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{useCase.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about QuikQuill
              </p>
            </motion.div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="border-2 hover:border-green-200 transition-all duration-300">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                      className="w-full text-left p-6 flex items-center justify-between"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-8">
                        {faq.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: faqOpen === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="h-5 w-5 text-green-600 flex-shrink-0" />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {faqOpen === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Content Creation?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Start using AI-powered writer agents to create better content faster
            </p>
            <Button
              size="lg"
              onClick={onSignIn}
              className="bg-white text-green-600 hover:bg-gray-50 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">QuikQuill</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md mb-6">
                AI-powered writing platform for modern content creators. Create specialized AI writer agents and generate high-quality content faster.
              </p>
              <div className="flex items-center space-x-4">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-sm text-gray-400">Secure & Private</span>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-green-500 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#use-cases" className="text-gray-400 hover:text-green-500 transition-colors">
                    Use Cases
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-400 hover:text-green-500 transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-green-500 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-green-500 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} QuikQuill. All rights reserved.
              </p>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Globe className="h-4 w-4" />
                  <span>Powered by Gemini AI</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>24/7 Availability</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
