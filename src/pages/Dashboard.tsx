
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Wallet, Users, AlertCircle, ExternalLink } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Calculate expected returns from active investments
  const expectedReturns = user.totalInvested * 0.2; // Assuming 20% return

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Account Status Alert */}
        {!user.isActive && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="h-6 w-6 text-orange-600 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-800">Account Activation Required</h3>
                  <p className="text-orange-700 mt-1">
                    Your account is pending activation. Please complete your payment to start investing.
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-orange-600">
                      <strong>📲 Send 5,000 RWF to:</strong> +250 736 563 999 (MTN Mobile Money)
                    </p>
                    <p className="text-sm text-orange-600">
                      <strong>📸 Send screenshot via WhatsApp to activate your account</strong>
                    </p>
                    <a 
                      href="https://wa.me/250736563999?text=Hello%2C%20I%20sent%20the%205000%20RWF%20payment%2C%20here%20is%20my%20screenshot" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block mt-2"
                    >
                      <Button className="bg-green-600 hover:bg-green-700">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Send Payment Screenshot
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {user.balance.toLocaleString()} RWF
              </div>
              <p className="text-xs text-muted-foreground">Available for withdrawal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {user.totalInvested.toLocaleString()} RWF
              </div>
              <p className="text-xs text-muted-foreground">Active investments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {expectedReturns.toLocaleString()} RWF
              </div>
              <p className="text-xs text-muted-foreground">From active investments</p>
            </CardContent>
          </Card>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>Your investment account summary</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Account Status</span>
                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                  {user.isActive ? 'Active' : 'Pending Activation'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Earned</span>
                <span className="font-semibold">{user.totalEarned.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Referral Code</span>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{user.referralCode}</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Referrals</span>
                <span className="font-semibold">{user.referralCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Member Since</span>
                <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your investments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/investment">
                <Button className="w-full" disabled={!user.isActive}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Investment Packages
                </Button>
              </Link>
              <Link to="/referrals">
                <Button variant="outline" className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Share Referral Link
                </Button>
              </Link>
              <Link to="/withdraw">
                <Button variant="outline" className="w-full" disabled={user.balance === 0}>
                  <Wallet className="h-4 w-4 mr-2" />
                  Request Withdrawal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information for Inactive Users */}
        {!user.isActive && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Getting Started with InvestX</CardTitle>
              <CardDescription className="text-blue-600">Complete these steps to activate your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span className="text-blue-800">Register your account ✓</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span className="text-orange-700">Send 5,000 RWF payment via MTN Mobile Money</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span className="text-gray-600">Wait for account activation (within 24 hours)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <span className="text-gray-600">Start investing and earning returns</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
