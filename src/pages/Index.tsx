
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Shield, Award, DollarSign, Clock, Star, CheckCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                InvestX
              </h1>
            </div>
            <div className="flex space-x-3">
              <Link to="/login">
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Grow Your Wealth
              </span>
              <br />
              <span className="text-gray-800">with InvestX</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Start your investment journey with as little as <strong className="text-blue-600">5,000 RWF</strong>. 
              Professional investment management with guaranteed returns, referral bonuses, and 24/7 support.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg">
                  Start Investing Today
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
                  Learn How It Works
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-16 text-sm text-gray-600">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-600 mr-2" />
                <span>Secure Platform</span>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                <span>5-Star Rated</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                <span>10,000+ Investors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Packages Preview */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Investment Packages</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Choose from our carefully designed investment packages to match your financial goals</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Starter', min: '10,000', max: '50,000', return: '15%', days: '7' },
              { name: 'Premium', min: '50,000', max: '200,000', return: '25%', days: '14' },
              { name: 'VIP', min: '200,000', max: '1,000,000', return: '40%', days: '30' },
              { name: 'Enterprise', min: '1,000,000', max: '10,000,000', return: '60%', days: '60' }
            ].map((pkg, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{pkg.name} Package</CardTitle>
                  <div className="text-2xl font-bold text-green-600">{pkg.return}</div>
                  <div className="text-sm text-gray-600">Return in {pkg.days} days</div>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-2 text-sm">
                    <p><strong>Min:</strong> {pkg.min} RWF</p>
                    <p><strong>Max:</strong> {pkg.max} RWF</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="mb-16">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-green-50 to-blue-50 border-green-200 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl text-green-800 mb-2">Quick Start Guide</CardTitle>
              <CardDescription className="text-green-600 text-lg">Get started in 3 simple steps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-green-200 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">📲 Send Payment</h3>
                  <p className="text-gray-700 text-sm">Send 5,000 RWF via MTN Mobile Money to: <strong>+250 736 563 999</strong></p>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-green-200 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">📸 Share Screenshot</h3>
                  <p className="text-gray-700 text-sm">Send payment screenshot via WhatsApp to the same number</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-green-200 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-green-800 mb-2">✅ Start Investing</h3>
                  <p className="text-gray-700 text-sm">Your account will be activated within 24 hours</p>
                </div>
              </div>
              
              <div className="text-center pt-6">
                <a 
                  href="https://wa.me/250736563999?text=Hello%2C%20I%20sent%20the%205000%20RWF%20payment%2C%20here%20is%20my%20screenshot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg">
                    📱 Contact on WhatsApp
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose InvestX?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We provide a comprehensive investment platform designed for your success</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">High Returns</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Guaranteed returns up to 60% with professional investment management and proven strategies.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Referral Bonuses</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Earn extra income by referring friends and family to our platform with competitive bonus rates.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Secure Platform</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Your investments are protected with bank-level security and continuous monitoring.</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Expert Team</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">Professional investment managers with years of market experience and proven track record.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-16">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl">
            <CardContent className="py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Trusted by Thousands</h2>
                <p className="text-blue-100 text-lg">Join our growing community of successful investors</p>
              </div>
              
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">10,000+</div>
                  <div className="text-blue-100">Active Investors</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">50M+</div>
                  <div className="text-blue-100">RWF Invested</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">15M+</div>
                  <div className="text-blue-100">RWF Paid Out</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">99.8%</div>
                  <div className="text-blue-100">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-16">
          <Card className="max-w-4xl mx-auto bg-gradient-to-r from-gray-50 to-blue-50 border-0 shadow-xl">
            <CardContent className="py-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Start Your Investment Journey?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Join thousands of investors who trust InvestX with their financial future. Start with as little as 5,000 RWF today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg">
                    Create Your Account Now
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mr-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">InvestX</span>
            </div>
            <p className="text-gray-400 mb-6">Your trusted partner in building wealth through smart investments.</p>
            <div className="flex justify-center space-x-8 mb-6">
              <Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link>
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="text-gray-400 hover:text-white transition-colors">Register</Link>
            </div>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-gray-500">© 2024 InvestX. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
