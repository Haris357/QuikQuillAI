"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shield, Lock, Eye, Database, FileText, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
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
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
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
                  At QuikQuill, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered writing platform. Please read this privacy policy carefully.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    When you sign up for QuikQuill using Google authentication, we collect:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Your Google account email address</li>
                    <li>Your name (as provided by your Google account)</li>
                    <li>Your profile picture (if available from your Google account)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Content and Usage Data</h3>
                  <p className="text-gray-700 leading-relaxed mb-3">
                    We collect information related to your use of QuikQuill:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>AI agents you create (name, writing style, tone, expertise)</li>
                    <li>Tasks and content you generate</li>
                    <li>Prompts and instructions you provide to AI agents</li>
                    <li>Content drafts and revisions</li>
                    <li>Usage statistics and API token consumption</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Device information (browser type, operating system)</li>
                    <li>IP address and location data</li>
                    <li>Log data and analytics</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>To provide and maintain the QuikQuill service</li>
                <li>To authenticate your account and ensure secure access</li>
                <li>To generate AI-powered content based on your instructions</li>
                <li>To store and manage your AI agents, tasks, and content</li>
                <li>To monitor and analyze usage patterns to improve our service</li>
                <li>To communicate with you about updates, features, and support</li>
                <li>To detect, prevent, and address technical issues</li>
                <li>To comply with legal obligations and protect our rights</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Storage and Security */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Lock className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Data Storage and Security</h2>
              </div>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  <strong className="font-semibold">Firebase Storage:</strong> Your data is securely stored in Google Firebase, a cloud-based platform that provides enterprise-grade security, encryption, and reliability.
                </p>
                <p>
                  <strong className="font-semibold">Encryption:</strong> All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols.
                </p>
                <p>
                  <strong className="font-semibold">Access Controls:</strong> We implement strict access controls to ensure that only authorized personnel can access user data, and only when necessary for service operations.
                </p>
                <p>
                  <strong className="font-semibold">Data Backup:</strong> We regularly backup your data to prevent loss due to technical failures or unforeseen circumstances.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Third-Party Services */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Third-Party Services</h2>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">
                QuikQuill integrates with the following third-party services:
              </p>
              <ul className="space-y-4">
                <li>
                  <strong className="font-semibold text-gray-900">Google Authentication:</strong>
                  <p className="text-gray-700 mt-1">Used for secure user authentication. Subject to Google's Privacy Policy.</p>
                </li>
                <li>
                  <strong className="font-semibold text-gray-900">Google Gemini AI:</strong>
                  <p className="text-gray-700 mt-1">Powers our AI content generation. Your prompts and generated content are processed by Google's Gemini AI in accordance with their privacy policies.</p>
                </li>
                <li>
                  <strong className="font-semibold text-gray-900">Firebase:</strong>
                  <p className="text-gray-700 mt-1">Used for data storage, authentication, and hosting. Subject to Google Firebase's Privacy Policy.</p>
                </li>
                <li>
                  <strong className="font-semibold text-gray-900">Stripe (if applicable):</strong>
                  <p className="text-gray-700 mt-1">Used for payment processing for premium features. We do not store credit card information.</p>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights and Choices */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your Rights and Choices</h2>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Access:</strong> You can access your personal information through your account settings</li>
                <li><strong>Update:</strong> You can update your profile information at any time</li>
                <li><strong>Delete:</strong> You can request deletion of your account and associated data</li>
                <li><strong>Export:</strong> You can request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> You can opt-out of certain data collection practices</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed to provide you with our services. If you wish to delete your account or request that we no longer use your information, please contact us. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
              </p>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                QuikQuill is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us, and we will take steps to delete such information.
              </p>
            </CardContent>
          </Card>

          {/* Changes to This Policy */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <Card className="border-0 shadow-lg bg-green-50 border-2 border-green-200">
            <CardContent className="p-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> privacy@quikquill.com</p>
                <p><strong>Website:</strong> www.quikquill.com</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
