"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  MessageSquare, 
  Book, 
  Video, 
  Mail, 
  Phone, 
  Search,
  ChevronRight,
  ExternalLink,
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const faqItems = [
  {
    question: "How do I create my first AI writer agent?",
    answer: "Click the 'Create New Agent' button in your dashboard, fill in the agent details including name, role, writing style, and tone. You can also add keywords and reference files to help the AI understand your requirements better.",
    category: "Getting Started"
  },
  {
    question: "What types of content can AI agents create?",
    answer: "Our AI agents can create blog posts, articles, social media content, emails, product descriptions, press releases, case studies, white papers, landing pages, newsletters, and more. Each agent can be specialized for different content types.",
    category: "AI Capabilities"
  },
  {
    question: "How does the revision history work?",
    answer: "Every edit and AI generation creates a new revision. You can view all previous versions in the history sidebar, compare changes, and restore any previous version. It works like Git for your content.",
    category: "Features"
  },
  {
    question: "Can I collaborate with team members?",
    answer: "Yes! Pro users can invite team members, share agents and tasks, leave comments, and collaborate in real-time. You can also set permissions and manage access levels.",
    category: "Collaboration"
  },
  {
    question: "How accurate is the AI-generated content?",
    answer: "Our AI uses advanced language models and learns from your writing style and preferences. While it produces high-quality content, we recommend reviewing and editing the output to ensure it meets your specific needs.",
    category: "AI Capabilities"
  },
  {
    question: "What file formats can I upload as references?",
    answer: "You can upload PDF, DOC, DOCX, TXT files, images (JPG, PNG, GIF), and videos (MP4, MOV, AVI). The AI can analyze these files to better understand your requirements and style.",
    category: "Features"
  }
];

const tutorials = [
  {
    title: "Getting Started with QuikQuill",
    description: "Learn the basics of creating agents and tasks",
    duration: "5 min",
    type: "video",
    url: "#"
  },
  {
    title: "Advanced Agent Configuration",
    description: "Master agent settings and customization",
    duration: "8 min",
    type: "video",
    url: "#"
  },
  {
    title: "Collaboration Best Practices",
    description: "How to work effectively with your team",
    duration: "6 min",
    type: "article",
    url: "#"
  },
  {
    title: "AI Writing Tips & Tricks",
    description: "Get the most out of your AI writers",
    duration: "10 min",
    type: "video",
    url: "#"
  }
];

const supportChannels = [
  {
    title: "Live Chat",
    description: "Get instant help from our support team",
    availability: "24/7 for Pro users",
    icon: <MessageSquare className="h-6 w-6" />,
    action: "Start Chat",
    primary: true
  },
  {
    title: "Email Support",
    description: "Send us a detailed message",
    availability: "Response within 24 hours",
    icon: <Mail className="h-6 w-6" />,
    action: "Send Email"
  },
  {
    title: "Phone Support",
    description: "Speak directly with our experts",
    availability: "Business hours (Pro only)",
    icon: <Phone className="h-6 w-6" />,
    action: "Schedule Call"
  }
];

export function HelpModal({ open, onClose }: HelpModalProps) {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [supportForm, setSupportForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
    email: ''
  });

  const categories = ['all', ...Array.from(new Set(faqItems.map(item => item.category)))];
  
  const filteredFAQ = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitSupport = () => {
    toast.success('Support ticket submitted! We\'ll get back to you soon.');
    setSupportForm({
      subject: '',
      category: '',
      priority: 'medium',
      message: '',
      email: ''
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-green-600" />
            Help & Support
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <TabsContent value="faq" className="space-y-6">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search frequently asked questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFAQ.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-semibold text-gray-900 pr-4">
                            {item.question}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {filteredFAQ.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or browse all categories</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tutorials" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tutorials.map((tutorial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {tutorial.type === 'video' ? (
                              <Video className="h-8 w-8 text-green-600" />
                            ) : (
                              <Book className="h-8 w-8 text-blue-600" />
                            )}
                            <div>
                              <Badge variant="outline" className="text-xs mb-2">
                                {tutorial.type}
                              </Badge>
                              <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                                {tutorial.title}
                              </h3>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{tutorial.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {tutorial.duration}
                          </div>
                          <Button size="sm" variant="outline" className="text-xs">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="contact" className="space-y-6">
              {/* Support Channels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {supportChannels.map((channel, index) => (
                  <Card key={index} className={`hover:shadow-md transition-shadow ${channel.primary ? 'ring-2 ring-green-500' : ''}`}>
                    <CardContent className="p-6 text-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                        channel.primary ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {channel.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">{channel.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{channel.description}</p>
                      <p className="text-xs text-gray-500 mb-4">{channel.availability}</p>
                      <Button 
                        size="sm" 
                        className={channel.primary ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                        variant={channel.primary ? 'default' : 'outline'}
                      >
                        {channel.action}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        value={supportForm.subject}
                        onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Brief description of your issue"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={supportForm.category} onValueChange={(value) => setSupportForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="account">Account Issue</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Priority</Label>
                      <Select value={supportForm.priority} onValueChange={(value) => setSupportForm(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={supportForm.email}
                        onChange={(e) => setSupportForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={supportForm.message}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Please describe your issue in detail..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button onClick={handleSubmitSupport} className="bg-green-600 hover:bg-green-700 text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="status" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">AI Writing Service</h4>
                          <p className="text-sm text-gray-600">All systems operational</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Database</h4>
                          <p className="text-sm text-gray-600">All systems operational</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">File Upload Service</h4>
                          <p className="text-sm text-gray-600">Experiencing minor delays</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">Authentication</h4>
                          <p className="text-sm text-gray-600">All systems operational</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Operational</Badge>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">Recent Updates</h4>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="font-medium">System Maintenance Complete</span>
                          <span className="text-gray-500">2 hours ago</span>
                        </div>
                        <p className="text-gray-600 ml-4">Scheduled maintenance completed successfully. All services restored.</p>
                      </div>
                      
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">New AI Model Deployed</span>
                          <span className="text-gray-500">1 day ago</span>
                        </div>
                        <p className="text-gray-600 ml-4">Updated to latest AI model for improved content quality.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}