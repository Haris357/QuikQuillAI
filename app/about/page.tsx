"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Target,
  Users,
  Zap,
  Heart,
  Award,
  Sparkles,
  TrendingUp,
  Shield,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const values = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Mission-Driven",
      description: "We are on a mission to democratize AI-powered content creation for everyone"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "User-Centric",
      description: "Every feature we build starts with understanding our users needs"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Innovation First",
      description: "We constantly push boundaries to bring you the latest in AI technology"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Quality Obsessed",
      description: "We are committed to delivering exceptional quality in everything we do"
    }
  ];

  const milestones = [
    { year: "2024", title: "QuikQuill Launched", description: "Introduced multi-agent AI writing platform" },
    { year: "2024", title: "AI Integration", description: "Advanced AI capabilities for content generation" },
    { year: "2024", title: "Growing Community", description: "Serving content creators worldwide" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <Button variant="ghost" className="hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">
            <Sparkles className="h-3 w-3 mr-1" />
            About QuikQuill
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Empowering Content Creators
            <span className="block text-green-600">With AI Innovation</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            QuikQuill is the world's first multi-agent AI writing platform. We are revolutionizing how content is created by giving you the power to build your own team of specialized AI writers.
          </p>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  QuikQuill was born from a simple observation: content creators need more than just generic AI tools. They need specialized writers that understand different contexts, audiences, and styles.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  That is why we built the first multi-agent AI writing platform. Instead of one-size-fits-all solutions, QuikQuill lets you create unlimited AI agents, each with its own personality, expertise, and writing style.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Today, thousands of content creators, marketers, and businesses use QuikQuill to produce high-quality content faster than ever before. We are just getting started.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-600">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Milestones */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Journey</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-100">
                  <div className="text-4xl font-bold text-green-600 mb-2">{milestone.year}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-20"
        >
          <Card className="border-0 shadow-xl bg-gradient-to-br from-green-600 to-blue-600">
            <CardContent className="p-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                <div>
                  <div className="text-4xl font-bold mb-2">99.9%</div>
                  <div className="text-green-100">Uptime</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">2s</div>
                  <div className="text-green-100">Response Time</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">24/7</div>
                  <div className="text-green-100">Support</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">∞</div>
                  <div className="text-green-100">Possibilities</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center"
        >
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Join Us on This Journey
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Be part of the content creation revolution. Start using QuikQuill today and experience the future of AI-powered writing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="px-8">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
