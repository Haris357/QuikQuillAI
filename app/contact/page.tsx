"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Send,
  Clock,
  Headphones,
  FileQuestion,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to an API
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      description: "Our team will respond within 24 hours",
      action: "support@quikquill.com",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      action: "Start Chat",
      color: "from-green-500 to-green-600"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      description: "Mon-Fri, 9am-6pm EST",
      action: "+1 (555) 123-4567",
      color: "from-purple-500 to-purple-600"
    }
  ];

  const supportResources = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "Documentation",
      description: "Comprehensive guides and tutorials"
    },
    {
      icon: <FileQuestion className="h-5 w-5" />,
      title: "FAQ",
      description: "Answers to common questions"
    },
    {
      icon: <Headphones className="h-5 w-5" />,
      title: "24/7 Support",
      description: "We're always here to help"
    }
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
            <MessageSquare className="h-3 w-3 mr-1" />
            Get in Touch
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            We're Here to Help
            <span className="block text-green-600">Let's Talk</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions about QuikQuill? Want to learn more about our AI writing platform? Our team is ready to assist you.
          </p>
        </motion.div>

        {/* Contact Methods */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20"
        >
          {contactMethods.map((method, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className={`w-14 h-14 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white`}>
                  {method.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{method.description}</p>
                <div className="text-green-600 font-semibold">{method.action}</div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h2>
                <p className="text-gray-600 mb-6">Fill out the form below and we'll get back to you as soon as possible.</p>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-green-900 mb-2">Message Sent!</h3>
                    <p className="text-green-700">We'll get back to you within 24 hours.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="How can we help you?"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us more about your inquiry..."
                        rows={6}
                        className="w-full"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-6"
          >
            {/* Office Info */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Our Office</h3>
                    <p className="text-gray-600">
                      123 AI Innovation Street<br />
                      San Francisco, CA 94102<br />
                      United States
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                      Saturday - Sunday: Closed<br />
                      <span className="text-green-600 font-semibold">24/7 Email Support</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Resources */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Support Resources</h3>
                <div className="space-y-4">
                  {supportResources.map((resource, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 text-green-600">
                        {resource.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{resource.title}</h4>
                        <p className="text-sm text-gray-600">{resource.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Help */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-600 to-blue-600">
              <CardContent className="p-8 text-white text-center">
                <Headphones className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Need Immediate Help?</h3>
                <p className="text-green-100 mb-6">
                  Check out our comprehensive FAQ section for instant answers to common questions.
                </p>
                <Button variant="secondary" className="w-full">
                  Visit FAQ
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Join Thousands of Happy Users
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Content creators, marketers, and businesses worldwide trust QuikQuill for their AI writing needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline" className="px-8">
                    View Pricing
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
