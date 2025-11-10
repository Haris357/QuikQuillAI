"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, FileText, AlertCircle, CheckCircle, XCircle, Scale, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 hover:bg-gray-100">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Terms & Conditions</h1>
            </div>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          {/* Introduction */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Welcome to QuikQuill! These Terms and Conditions ("Terms") govern your use of the QuikQuill platform and services. By accessing or using QuikQuill, you agree to be bound by these Terms. If you do not agree with any part of these Terms, you may not use our service.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Acceptance of Terms */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  By creating an account and using QuikQuill, you acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You have read and understood these Terms</li>
                  <li>You are at least 13 years of age</li>
                  <li>You have the authority to enter into this agreement</li>
                  <li>You will comply with all applicable laws and regulations</li>
                  <li>The information you provide is accurate and complete</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Service Description</h2>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  QuikQuill is an AI-powered writing platform that allows users to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Create and manage multiple AI writer agents</li>
                  <li>Generate content using Google's Gemini AI</li>
                  <li>Edit and refine AI-generated content</li>
                  <li>Organize and manage writing tasks</li>
                  <li>Customize agent personalities and writing styles</li>
                </ul>
                <p className="mt-4">
                  We reserve the right to modify, suspend, or discontinue any aspect of the service at any time without prior notice.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">User Accounts</h2>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <h3 className="text-lg font-semibold text-gray-900">Account Creation</h3>
                <p>
                  You must authenticate using a valid Google account to use QuikQuill. You are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintaining the security of your Google account</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of any unauthorized access</li>
                  <li>Ensuring your account information is accurate and up-to-date</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Account Termination</h3>
                <p>
                  We reserve the right to suspend or terminate your account if you violate these Terms or engage in any activity that we deem harmful to our service or other users.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Acceptable Use</h2>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>You agree to use QuikQuill only for lawful purposes. You may:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-green-700">
                  <li>Create content for personal or commercial use</li>
                  <li>Generate marketing copy, blog posts, and articles</li>
                  <li>Use AI assistance for creative writing projects</li>
                  <li>Create documentation and technical content</li>
                  <li>Share content generated on our platform</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card className="border-0 shadow-lg border-2 border-red-200">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Prohibited Activities</h2>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="font-semibold text-red-700">You may NOT use QuikQuill to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-red-700">
                  <li>Generate harmful, abusive, or illegal content</li>
                  <li>Create content that violates intellectual property rights</li>
                  <li>Distribute spam, phishing, or malicious content</li>
                  <li>Impersonate others or misrepresent your identity</li>
                  <li>Engage in automated abuse or excessive API usage</li>
                  <li>Reverse engineer or attempt to extract our algorithms</li>
                  <li>Generate content that promotes violence or hate speech</li>
                  <li>Create misleading or fraudulent content</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
                <p className="mt-4 font-semibold text-red-700">
                  Violation of these prohibitions may result in immediate account suspension or termination.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Scale className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Intellectual Property</h2>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <h3 className="text-lg font-semibold text-gray-900">Your Content</h3>
                <p>
                  You retain all intellectual property rights to the content you create using QuikQuill. By using our service, you grant us a limited license to process, store, and display your content solely for the purpose of providing the service.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">Our Platform</h3>
                <p>
                  QuikQuill, including its design, features, code, and branding, is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">AI-Generated Content</h3>
                <p>
                  Content generated by our AI agents is provided to you for your use. However, you acknowledge that AI-generated content may not be entirely original and should be reviewed before publication or commercial use.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment and Subscriptions */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment and Subscriptions</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  QuikQuill is currently free to use with Google authentication. If we introduce paid features or subscriptions in the future:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You will be notified in advance of any pricing changes</li>
                  <li>All payments will be processed securely through Stripe</li>
                  <li>Subscriptions may be subject to recurring billing</li>
                  <li>Refund policies will be clearly stated at the time of purchase</li>
                  <li>You can cancel your subscription at any time</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* API Usage and Limits */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">API Usage and Limits</h2>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  To ensure fair usage and service quality:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We may impose rate limits on API requests</li>
                  <li>Excessive usage may result in temporary throttling</li>
                  <li>Token limits may apply to free accounts</li>
                  <li>We reserve the right to adjust limits based on service capacity</li>
                  <li>Automated or bot-driven usage must be approved in advance</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer of Warranties */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclaimer of Warranties</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  QuikQuill is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, express or implied, regarding:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>The accuracy, reliability, or quality of AI-generated content</li>
                  <li>Uninterrupted or error-free service operation</li>
                  <li>The security of data transmission over the internet</li>
                  <li>Compatibility with all devices or browsers</li>
                  <li>The suitability of content for any particular purpose</li>
                </ul>
                <p className="mt-4 font-semibold">
                  You are solely responsible for reviewing and verifying all AI-generated content before use.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  To the maximum extent permitted by law, QuikQuill and its affiliates shall not be liable for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Any indirect, incidental, special, or consequential damages</li>
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Damages resulting from AI-generated content</li>
                  <li>Service interruptions or data loss</li>
                  <li>Third-party actions or content</li>
                </ul>
                <p className="mt-4">
                  Our total liability shall not exceed the amount you paid for the service in the past 12 months, or $100, whichever is greater.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Indemnification */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Indemnification</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  You agree to indemnify and hold harmless QuikQuill, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your use of the service</li>
                  <li>Content you create or publish</li>
                  <li>Violation of these Terms</li>
                  <li>Infringement of third-party rights</li>
                  <li>Your negligence or willful misconduct</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Modifications to Terms */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Modifications to Terms</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  We reserve the right to modify these Terms at any time. When we make changes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We will update the "Last updated" date at the top of this page</li>
                  <li>We may notify you via email or in-app notification</li>
                  <li>Continued use of the service constitutes acceptance of the new Terms</li>
                  <li>You should review these Terms periodically</li>
                </ul>
                <p className="mt-4">
                  If you do not agree to the modified Terms, you must stop using QuikQuill.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law and Disputes</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which QuikQuill operates, without regard to its conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these Terms or your use of QuikQuill shall be resolved through binding arbitration, except where prohibited by law. You waive your right to participate in class action lawsuits or class-wide arbitration.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Severability */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Severability</h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
              </p>
            </CardContent>
          </Card>

          {/* Entire Agreement */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Entire Agreement</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and QuikQuill regarding the use of our service and supersede all prior agreements and understandings.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-0 shadow-lg bg-blue-50 border-2 border-blue-200">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@quikquill.com</p>
                <p><strong>Support:</strong> support@quikquill.com</p>
                <p><strong>Website:</strong> www.quikquill.com</p>
              </div>
            </CardContent>
          </Card>

          {/* Acknowledgment */}
          <Card className="border-0 shadow-lg bg-green-50 border-2 border-green-200">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <p className="text-lg font-semibold text-gray-900">
                  By using QuikQuill, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
