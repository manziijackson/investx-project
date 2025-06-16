
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, ArrowRight, CheckCircle, Users, Wallet, Shield } from 'lucide-react';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">InvestX</h1>
            </div>
            <div className="flex space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How InvestX Works</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start your investment journey with InvestX in 4 simple steps. Professional investment management with guaranteed returns.
          </p>
        </div>

        {/* Payment Instructions */}
        <Card className="mb-16 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-green-800">Payment Instructions</CardTitle>
            <CardDescription className="text-lg text-green-600">Follow these steps to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
                <h3 className="font-semibold text-green-800 mb-2">📲 Send Payment</h3>
                <p className="text-gray-700">Send 5,000 RWF via MTN Mobile Money to: <strong>+250 736 563 999</strong></p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
                <h3 className="font-semibold text-green-800 mb-2">📸 Send Screenshot</h3>
                <p className="text-gray-700">Send payment screenshot via WhatsApp to the same number</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
                <h3 className="font-semibold text-green-800 mb-2">✅ Account Activation</h3>
                <p className="text-gray-700">Your account will be activated within 24 hours</p>
              </div>
            </div>
            <div className="text-center pt-4">
              <a 
                href="https://wa.me/250736563999?text=Hello%2C%20I%20sent%20the%205000%20RWF%20payment%2C%20here%20is%20my%20screenshot" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  📱 Send Screenshot via WhatsApp
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* How It Works Steps */}
        <div className="space-y-12 mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">1</div>
                <h3 className="text-2xl font-bold text-gray-900">Create Your Account</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Sign up with your basic information and get your unique referral code. Share it with friends to earn extra bonuses.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Quick registration process
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Secure account protection
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Unique referral code
                </li>
              </ul>
            </div>
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Registration Benefits</h4>
                  <p className="text-blue-600 text-sm">Get instant access to your personalized dashboard and referral system.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="p-6 md:order-2">
              <CardContent className="p-0">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Minimum Investment</h4>
                  <p className="text-green-600 text-sm">Start with just 5,000 RWF and grow your wealth systematically.</p>
                </div>
              </CardContent>
            </Card>
            <div className="md:order-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">2</div>
                <h3 className="text-2xl font-bold text-gray-900">Make Your Payment</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Send your initial investment via MTN Mobile Money. Our team will verify and activate your account within 24 hours.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Secure MTN Mobile Money payment
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Quick verification process
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  24-hour activation guarantee
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">3</div>
                <h3 className="text-2xl font-bold text-gray-900">Choose Investment Package</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Select from our range of investment packages. Each package offers different returns and durations to match your financial goals.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Multiple package options
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Guaranteed returns
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Flexible investment terms
                </li>
              </ul>
            </div>
            <Card className="p-6">
              <CardContent className="p-0">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Professional Management</h4>
                  <p className="text-purple-600 text-sm">Your investments are managed by experienced professionals with proven track records.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <Card className="p-6 md:order-2">
              <CardContent className="p-0">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">Withdrawal Terms</h4>
                  <p className="text-orange-600 text-sm">Withdraw your earnings Monday to Friday with a small processing fee.</p>
                </div>
              </CardContent>
            </Card>
            <div className="md:order-1">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mr-4">4</div>
                <h3 className="text-2xl font-bold text-gray-900">Earn & Withdraw</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Watch your investments grow and withdraw your earnings when eligible. Earn additional bonuses through our referral program.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Regular earning updates
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Flexible withdrawal schedule
                </li>
                <li className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  Referral bonus system
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Secure Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Your investments and personal information are protected with bank-level security.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Referral System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Earn extra income by referring friends. Get bonuses for every successful referral.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Wallet className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Easy Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">Request withdrawals Monday to Friday with quick processing times.</p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto bg-blue-600 text-white">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Investing?</h2>
              <p className="text-xl mb-8 text-blue-100">Join InvestX today and take control of your financial future</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" variant="secondary" className="text-blue-600">
                    Create Account Now
                  </Button>
                </Link>
                <Link to="/">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                    Learn More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <TrendingUp className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">InvestX</span>
            </div>
            <p className="text-gray-400">© 2024 InvestX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;
