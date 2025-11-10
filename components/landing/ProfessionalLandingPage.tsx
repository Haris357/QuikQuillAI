"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  Linkedin,
  Quote,
  ChevronRight,
  Workflow,
  Cpu,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfessionalLandingPageProps {
  onSignIn: () => void;
}

export function ProfessionalLandingPage({ onSignIn }: ProfessionalLandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const navigationItems = [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multi-Agent System",
      description: "Create unlimited AI writers, each with unique personalities, writing styles, and expertise areas.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "Advanced AI Technology",
      description: "Leverage the most advanced AI models for high-quality, contextually accurate content generation.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: <Edit className="h-6 w-6" />,
      title: "Advanced Editor",
      description: "Rich text editor with AI suggestions, real-time collaboration, and revision history tracking.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Workflow className="h-6 w-6" />,
      title: "Task Management",
      description: "Organize writing projects, set priorities, track progress, and manage deadlines efficiently.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Customizable Personas",
      description: "Define tone, style, expertise, target audience, and content types for each AI agent.",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Secure Cloud Storage",
      description: "All your data is encrypted and stored securely in Firebase with automatic backups.",
      color: "from-teal-500 to-teal-600"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime", sublabel: "Guaranteed availability" },
    { value: "< 2s", label: "Response Time", sublabel: "Lightning fast generation" },
    { value: "1M+", label: "Tokens/Month", sublabel: "Pro plan includes" },
    { value: "24/7", label: "Support", sublabel: "We're always here" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Content Marketing Manager",
      company: "TechCorp",
      content: "QuikQuill has transformed how our team creates content. The multi-agent system allows us to maintain consistent brand voices across all our channels while dramatically increasing output.",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Michael Chen",
      role: "Freelance Writer",
      company: "Independent",
      content: "As a freelancer juggling multiple clients, QuikQuill's ability to switch between different writing styles and tones is invaluable. It's like having a team of specialized writers at my fingertips.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Director",
      company: "StartupXYZ",
      content: "The ROI on QuikQuill is incredible. We've cut our content production time by 60% while maintaining quality. The token-based pricing is fair and transparent.",
      rating: 5,
      avatar: "ER"
    }
  ];

  const useCases = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Content Marketing",
      description: "Generate blog posts, social media content, email campaigns, and landing pages",
      benefits: ["SEO-optimized content", "Consistent brand voice", "High-volume production"]
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Technical Writing",
      description: "Create documentation, tutorials, guides, and technical specifications",
      benefits: ["Clear explanations", "Accurate terminology", "Structured formats"]
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Social Media",
      description: "Craft engaging posts, responses, and campaigns across all platforms",
      benefits: ["Platform-specific", "Engagement-focused", "Trend-aware"]
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Business Content",
      description: "Write proposals, reports, presentations, and professional communications",
      benefits: ["Professional tone", "Data-driven", "Persuasive copy"]
    }
  ];

  const integrations = [
    { name: "Google Workspace", logo: "🔷" },
    { name: "Microsoft 365", logo: "📘" },
    { name: "Slack", logo: "💬" },
    { name: "Notion", logo: "📝" },
    { name: "WordPress", logo: "🌐" },
    { name: "Medium", logo: "📰" }
  ];

  const faqs = [
    {
      question: "How does QuikQuill's AI work?",
      answer: "QuikQuill uses Google's Gemini AI, one of the most advanced language models available. Our multi-agent system allows you to create specialized writers with unique characteristics, ensuring consistent quality and style across all your content."
    },
    {
      question: "What are tokens and how do they work?",
      answer: "Tokens are units that measure AI usage. On average, 1 token equals about 0.75 words. Our Pro plan includes 1M tokens per month, enough for approximately 750,000 words of content. Unused tokens don't roll over, but you can upgrade anytime for more capacity."
    },
    {
      question: "Can I try QuikQuill before paying?",
      answer: "Absolutely! All new users get a 3-day free trial with 50,000 tokens. You can create up to 3 AI agents and 10 tasks to explore all features. When you upgrade to Pro, you get another 3-day trial before being charged."
    },
    {
      question: "Is my data secure?",
      answer: "Yes. We use enterprise-grade security with end-to-end encryption. All data is stored in Firebase with automatic backups. We're GDPR compliant and never share your content with third parties. Your privacy is our top priority."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel anytime from your account settings. If you cancel, you'll continue to have access until the end of your current billing period. No long-term contracts or commitments required."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes. If you're not satisfied within the first 14 days of your subscription, contact us for a full refund. We want you to be completely happy with QuikQuill."
    },
    {
      question: "How is QuikQuill different from other AI writing tools?",
      answer: "QuikQuill's unique multi-agent system sets us apart. Instead of one generic AI, you can create multiple specialized writers with distinct personalities. This ensures consistency across projects and allows for greater customization than single-agent tools."
    },
    {
      question: "What kind of support do you offer?",
      answer: "Free users get community support through our help center. Pro users receive priority email support with typical response times under 4 hours. We also offer live chat during business hours for urgent issues."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">QuikQuill</span>
                <div className="text-xs text-gray-500 -mt-1">AI Writing Platform</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  prefetch={true}
                  className="text-gray-700 hover:text-green-600 font-medium transition-all duration-200"
                  scroll={item.href.startsWith('#')}
                >
                  {item.label}
                </Link>
              ))}
              <Button onClick={onSignIn} className="bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-200">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
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
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={true}
                    className="block text-gray-700 hover:text-green-600 font-medium transition-all duration-200 py-2"
                    onClick={() => setMobileMenuOpen(false)}
                    scroll={item.href.startsWith('#')}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button onClick={onSignIn} className="w-full bg-green-600 hover:bg-green-700 text-white transition-all duration-200">
                  Start Free Trial
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section - Premium Design */}
      <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />

        {/* Animated background elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-green-100 text-green-800 border-green-200 px-4 py-1.5">
                <Zap className="h-3 w-3 mr-2" />
                AI-Powered Content Creation
              </Badge>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Your AI Writing
                <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Team of Experts
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                Create specialized AI writer agents with unique voices. Generate high-quality content 10x faster with the power of multi-agent intelligence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  onClick={onSignIn}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Free Trial - 3 Days
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-6 text-lg rounded-xl border-2 border-gray-300 hover:border-green-600"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Cancel anytime
                </div>
              </div>
            </motion.div>

            {/* Right Column - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Live Demo
                </div>

                {/* Mock UI */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 h-24 bg-green-100 rounded-lg"></div>
                    <div className="flex-1 h-24 bg-blue-100 rounded-lg"></div>
                  </div>
                </div>
              </div>

              {/* Floating stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">1M+</div>
                    <div className="text-xs text-gray-500">Tokens/Month</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">
                  {stat.sublabel}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Detailed */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
                Powerful Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Everything You Need to Create
                <span className="block text-green-600">Amazing Content</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built for content creators, marketers, and businesses who demand quality and efficiency
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group"
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
                Use Cases
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Built for Every Content Need
              </h2>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-2 border-gray-100 hover:border-green-300 transition-all duration-300 hover:shadow-xl">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                        {useCase.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                        <p className="text-gray-600 mb-4">{useCase.description}</p>
                        <ul className="space-y-2">
                          {useCase.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-center text-sm text-gray-700">
                              <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-purple-100 text-purple-800 border-purple-200">
                Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Loved by Content Creators
              </h2>
              <p className="text-xl text-gray-600">
                See what our users have to say about QuikQuill
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <Quote className="h-8 w-8 text-green-600 mb-4 opacity-50" />
                    <p className="text-gray-700 mb-6 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <Avatar className="h-12 w-12 mr-3">
                        <AvatarFallback className="bg-green-600 text-white font-semibold">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                        <div className="text-xs text-gray-500">{testimonial.company}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Enterprise-Grade Security & Compliance
            </h3>
            <p className="text-gray-600">Your data is safe with us</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: <Shield />, label: "SSL Encrypted" },
              { icon: <Lock />, label: "GDPR Compliant" },
              { icon: <Database />, label: "Auto Backups" },
              { icon: <Headphones />, label: "24/7 Support" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 text-green-600">
                  {item.icon}
                </div>
                <div className="text-sm font-semibold text-gray-900">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
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
                transition={{ duration: 0.5, delay: index * 0.05 }}
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

      {/* Final CTA Section */}
      <section className="py-24 bg-gradient-to-br from-green-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Ready to Transform Your
              <span className="block">Content Creation?</span>
            </h2>
            <p className="text-xl md:text-2xl text-green-100 mb-10 max-w-3xl mx-auto">
              Join thousands of content creators using AI to work smarter, not harder
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={onSignIn}
                className="bg-white text-green-600 hover:bg-gray-100 px-10 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => window.location.href = '/pricing'}
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-10 py-6 text-lg rounded-xl font-semibold"
              >
                View Pricing
              </Button>
            </div>
            <p className="text-green-100 mt-6">
              No credit card required • 3-day free trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">QuikQuill</span>
                  <div className="text-xs text-gray-400">AI Writing Platform</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md mb-6">
                The most powerful AI writing platform for content creators. Create specialized AI writers and generate high-quality content 10x faster.
              </p>
              <div className="flex items-center space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Use Cases
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
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
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Global Content Creation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Enterprise Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
