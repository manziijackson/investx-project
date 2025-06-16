
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Shield, Award } from 'lucide-react';

const Index = () => {
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

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Grow Your Wealth with</span>
            <span className="block text-blue-600">InvestX Platform</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Start your investment journey with as little as 5,000 RWF. Professional investment management with guaranteed returns and referral bonuses.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link to="/register">
                <Button className="w-full flex items-center justify-center px-8 py-3 text-base font-medium">
                  Start Investing Today
                </Button>
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link to="/how-it-works">
                <Button variant="outline" className="w-full flex items-center justify-center px-8 py-3 text-base font-medium">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-800">Quick Payment Instructions</CardTitle>
              <CardDescription className="text-green-600">Get started in 3 simple steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">📲 Step 1: Send Payment</h3>
                <p className="text-gray-700">Send 5,000 RWF via MTN Mobile Money to: <strong>+250 736 563 999</strong></p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">📸 Step 2: Send Screenshot</h3>
                <p className="text-gray-700">Send payment screenshot via WhatsApp to the same number</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">✅ Step 3: Account Activation</h3>
                <p className="text-gray-700">Your account will be activated within 24 hours</p>
              </div>
              <div className="text-center pt-4">
                <a 
                  href="https://wa.me/250736563999?text=Hello%2C%20I%20sent%20the%205000%20RWF%20payment%2C%20here%20is%20my%20screenshot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button className="bg-green-600 hover:bg-green-700">
                    📱 Contact on WhatsApp
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="text-center">
                <TrendingUp className="h-10 w-10 text-blue-600 mx-auto" />
                <CardTitle>High Returns</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Guaranteed returns on your investments with professional management</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-10 w-10 text-green-600 mx-auto" />
                <CardTitle>Referral Bonuses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Earn extra income by referring friends and family to our platform</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="h-10 w-10 text-purple-600 mx-auto" />
                <CardTitle>Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Your investments are safe with our secure and monitored platform</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Award className="h-10 w-10 text-orange-600 mx-auto" />
                <CardTitle>Professional Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center">Expert investment managers with years of market experience</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="max-w-4xl mx-auto bg-blue-600 text-white">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Start Your Investment Journey?</h2>
              <p className="text-xl mb-8 text-blue-100">Join thousands of investors who trust InvestX with their financial future</p>
              <Link to="/register">
                <Button size="lg" variant="secondary" className="text-blue-600">
                  Create Your Account Now
                </Button>
              </Link>
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
            <div className="mt-4 space-x-6">
              <Link to="/how-it-works" className="text-gray-400 hover:text-white">How It Works</Link>
              <Link to="/login" className="text-gray-400 hover:text-white">Login</Link>
              <Link to="/register" className="text-gray-400 hover:text-white">Register</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
