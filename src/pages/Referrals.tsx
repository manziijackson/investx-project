
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Users, Copy, Share, Gift } from 'lucide-react';

const Referrals = () => {
  const { user } = useAuth();
  const [referralLink, setReferralLink] = useState('');
  const [referredUsers, setReferredUsers] = useState([]);

  useEffect(() => {
    if (user) {
      const baseUrl = window.location.origin;
      setReferralLink(`${baseUrl}/register?ref=${user.referralCode}`);
      
      // Load referred users
      const allUsers = JSON.parse(localStorage.getItem('investx_users') || '[]');
      const referred = allUsers.filter((u: any) => u.referredBy === user.referralCode);
      setReferredUsers(referred);
    }
  }, [user]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Link Copied",
      description: "Referral link copied to clipboard",
    });
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join InvestX',
        text: 'Start your investment journey with InvestX!',
        url: referralLink,
      });
    } else {
      copyReferralLink();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referral Program</h1>
          <p className="text-gray-600">Earn bonuses by referring friends to InvestX</p>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{user?.referralCount || 0}</div>
              <p className="text-xs text-muted-foreground">Friends you've referred</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {referredUsers.filter((u: any) => u.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">Active referred users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Referral Bonus</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {(referredUsers.filter((u: any) => u.isActive).length * 500).toLocaleString()} RWF
              </div>
              <p className="text-xs text-muted-foreground">Earned from referrals</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link with friends to earn referral bonuses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={referralLink}
                readOnly
                className="flex-1"
              />
              <Button onClick={copyReferralLink} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={shareReferralLink}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">How It Works</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Share your referral link with friends</li>
                <li>• When they register and activate their account, you earn a bonus</li>
                <li>• Earn 500 RWF for each active referral</li>
                <li>• Your referral bonus is added to your account balance</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Referral Code */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>Friends can also use this code during registration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <code className="text-lg font-bold">{user?.referralCode}</code>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(user?.referralCode || '');
                  toast({
                    title: "Code Copied",
                    description: "Referral code copied to clipboard",
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referred Users */}
        {referredUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Referrals</CardTitle>
              <CardDescription>Users who joined through your referral</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referredUsers.map((referredUser: any) => (
                  <div key={referredUser.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{referredUser.name}</h3>
                      <p className="text-sm text-gray-600">
                        Joined: {new Date(referredUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        referredUser.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {referredUser.isActive ? 'Active' : 'Pending'}
                      </div>
                      {referredUser.isActive && (
                        <p className="text-sm text-green-600 mt-1">+500 RWF bonus</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* How to Earn More */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Maximize Your Earnings</CardTitle>
            <CardDescription className="text-blue-600">Tips to get more referrals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <p className="text-blue-800">Share your referral link on social media platforms</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <p className="text-blue-800">Tell friends and family about InvestX investment opportunities</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <p className="text-blue-800">Explain the benefits of starting with just 5,000 RWF</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Referrals;
