"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Check, 
  Zap, 
  Users, 
  FileText, 
  BarChart3, 
  Shield, 
  Headphones,
  Crown,
  Sparkles,
  ArrowRight,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '1 AI Writer Agent',
      '10 tasks per month',
      'Basic templates',
      'Email support',
      '1GB storage'
    ],
    limitations: [
      'Limited AI generations',
      'Basic support only',
      'No collaboration features'
    ],
    current: true
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '$10',
    period: '/month',
    description: 'Ideal for professionals and small teams',
    features: [
      'Unlimited AI Writer Agents',
      'Unlimited tasks',
      'Advanced templates',
      'Priority support',
      'Collaboration tools',
      'Revision history',
      'File attachments',
      'Custom branding',
      '10GB storage',
      'Advanced analytics'
    ],
    popular: true,
    savings: 'Save $24/year'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with specific needs',
    features: [
      'Everything in Professional',
      'Custom AI training',
      'API access',
      'Dedicated support',
      'Custom integrations',
      'Advanced analytics',
      'SSO authentication',
      'Unlimited storage',
      'White-label solution',
      'SLA guarantee'
    ],
    enterprise: true
  }
];

const benefits = [
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Unlimited AI Agents',
    description: 'Create specialized writers for every project and content type'
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Advanced Collaboration',
    description: 'Real-time editing, comments, and team workflows'
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Detailed Analytics',
    description: 'Track performance, productivity, and content quality metrics'
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Enterprise Security',
    description: 'Advanced security features and compliance standards'
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: 'Priority Support',
    description: '24/7 dedicated support with faster response times'
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Advanced AI Features',
    description: 'Latest AI models, custom training, and enhanced capabilities'
  }
];

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Upgrade successful! Welcome to Pro!');
      onClose();
    } catch (error) {
      toast.error('Upgrade failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContactSales = () => {
    toast.info('Redirecting to sales team...');
    // Redirect to sales contact
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
            Upgrade to QuikQuill Pro
          </DialogTitle>
          <p className="text-gray-600 text-lg mt-2">
            Unlock the full power of AI-driven content creation
          </p>
        </DialogHeader>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <Button
              variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingCycle('monthly')}
              className={billingCycle === 'monthly' ? 'bg-green-600 text-white' : ''}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === 'yearly' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBillingCycle('yearly')}
              className={billingCycle === 'yearly' ? 'bg-green-600 text-white' : ''}
            >
              Yearly
              <Badge className="ml-2 bg-yellow-500 text-white text-xs">Save 20%</Badge>
            </Button>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card 
                className={`relative h-full cursor-pointer transition-all duration-200 ${
                  plan.popular 
                    ? 'ring-2 ring-green-500 shadow-lg scale-105' 
                    : selectedPlan === plan.id
                    ? 'ring-2 ring-green-300 shadow-md'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-4 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gray-600 text-white px-4 py-1">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-600">{plan.period}</span>}
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{plan.description}</p>
                  {plan.savings && (
                    <Badge variant="outline" className="mt-2 text-green-600 border-green-200">
                      {plan.savings}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations && (
                    <div className="mb-6">
                      <p className="text-xs text-gray-500 mb-2">Current limitations:</p>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="flex items-start">
                            <span className="text-gray-400 mr-2">•</span>
                            <span className="text-gray-500 text-xs">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    className={`w-full ${
                      plan.current
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : plan.enterprise
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'border-green-200 text-green-700 hover:bg-green-50'
                    }`}
                    variant={plan.popular ? 'default' : plan.enterprise ? 'default' : 'outline'}
                    disabled={plan.current}
                    onClick={plan.enterprise ? handleContactSales : handleUpgrade}
                  >
                    {plan.current 
                      ? 'Current Plan' 
                      : plan.enterprise 
                      ? 'Contact Sales' 
                      : 'Upgrade Now'
                    }
                    {!plan.current && !plan.enterprise && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
            Why upgrade to Professional?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-start space-x-4"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-6 text-center border border-green-200">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-green-900 mb-2">
            Ready to supercharge your content creation?
          </h3>
          <p className="text-green-700 mb-6">
            Join thousands of professionals who trust QuikQuill for their content needs
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleUpgrade}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Upgrade to Pro - $10/month
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} className="border-green-200 text-green-700 hover:bg-green-50">
              Maybe Later
            </Button>
          </div>
          <p className="text-xs text-green-600 mt-4">
            30-day money-back guarantee • Cancel anytime • No setup fees
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}