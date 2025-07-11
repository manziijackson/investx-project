
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Wallet, Clock, CheckCircle, AlertCircle, Calendar, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Withdraw = () => {
  const { user, updateUser } = useAuth();
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [isWeekend, setIsWeekend] = useState(false);

  useEffect(() => {
    // Check if it's weekend
    const today = new Date();
    const dayOfWeek = today.getDay();
    setIsWeekend(dayOfWeek === 0 || dayOfWeek === 6);

    // Load user's withdrawal requests from Supabase
    if (user) {
      fetchWithdrawalRequests();
    }
  }, [user]);

  const fetchWithdrawalRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedRequests = data.map((request: any) => ({
        id: request.id,
        userId: request.user_id,
        amount: parseFloat(request.amount),
        fee: parseFloat(request.fee),
        netAmount: parseFloat(request.net_amount),
        status: request.status,
        createdAt: request.created_at,
        processedDate: request.processed_date,
        userName: user.name,
        userPhone: user.phone,
      }));

      setWithdrawalRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    }
  };

  const handleWithdrawal = async () => {
    if (!user) return;

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      });
      return;
    }

    // Check minimum withdrawal amount (3000)
    if (amount < 3000) {
      toast({
        title: "Minimum Withdrawal",
        description: "Minimum withdrawal amount is 3,000 RWF",
        variant: "destructive",
      });
      return;
    }

    // Check if user has sufficient balance
    if (amount > user.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }

    // Check referrals requirement (minimum 2 referrals)
    const minReferrals = user.referralsRequiredForWithdrawal || 2;
    if (user.referralCount < minReferrals) {
      toast({
        title: "Referrals Required",
        description: `You need at least ${minReferrals} referrals to withdraw. You currently have ${user.referralCount} referrals.`,
        variant: "destructive",
      });
      return;
    }

    // Check if it's weekend
    if (isWeekend) {
      toast({
        title: "Weekend Restriction",
        description: "Withdrawals are only available Monday to Friday",
        variant: "destructive",
      });
      return;
    }

    // Calculate withdrawal fee (10%)
    const fee = amount * 0.1;
    const netAmount = amount - fee;

    try {
      // Create withdrawal request in Supabase
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: amount,
          fee: fee,
          net_amount: netAmount,
          status: 'pending',
          request_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Update user balance in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          balance: user.balance - amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Balance update error:', updateError);
        throw updateError;
      }

      // Update local user state
      updateUser({
        balance: user.balance - amount
      });

      setWithdrawAmount('');
      await fetchWithdrawalRequests();

      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal request for ${amount.toLocaleString()} RWF has been submitted for admin review`,
      });
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const hasEnoughReferrals = user?.referralCount >= (user?.referralsRequiredForWithdrawal || 2);
  const canWithdraw = user?.balance && user.balance >= 3000 && !isWeekend && hasEnoughReferrals;
  const withdrawalFee = withdrawAmount ? parseFloat(withdrawAmount) * 0.1 : 0;
  const netWithdrawal = withdrawAmount ? parseFloat(withdrawAmount) - withdrawalFee : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Withdrawal</h1>
          <p className="text-gray-600">Request withdrawals from your account balance</p>
        </div>

        {/* Withdrawal Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(user?.balance || 0).toLocaleString()} RWF
              </div>
              <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {user?.referralCount || 0}/{user?.referralsRequiredForWithdrawal || 2}
              </div>
              <p className="text-xs text-muted-foreground">Required for withdrawal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Withdrawal Fee</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">10%</div>
              <p className="text-xs text-muted-foreground">Processing fee</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {isWeekend ? 'Closed' : 'Open'}
              </div>
              <p className="text-xs text-muted-foreground">Mon-Fri only</p>
            </CardContent>
          </Card>
        </div>

        {/* Referrals Requirement Notice */}
        {!hasEnoughReferrals && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">Referrals Required</h3>
                  <p className="text-orange-700">
                    You need {(user?.referralsRequiredForWithdrawal || 2) - (user?.referralCount || 0)} more referrals to unlock withdrawals. 
                    Share your referral code to invite friends!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Weekend Notice */}
        {isWeekend && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">Weekend Restriction</h3>
                  <p className="text-orange-700">Withdrawals are only available Monday to Friday</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Withdrawal Form */}
        <Card>
          <CardHeader>
            <CardTitle>Request Withdrawal</CardTitle>
            <CardDescription>Submit a withdrawal request for admin review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount (RWF)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount to withdraw"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="3000"
                max={user?.balance}
              />
              <p className="text-sm text-gray-500">Minimum withdrawal: 3,000 RWF</p>
            </div>

            {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Withdrawal Amount:</span>
                  <span className="text-sm font-medium">{parseFloat(withdrawAmount).toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Processing Fee (10%):</span>
                  <span className="text-sm font-medium text-red-600">-{withdrawalFee.toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Net Amount:</span>
                  <span className="font-medium text-green-600">{netWithdrawal.toLocaleString()} RWF</span>
                </div>
              </div>
            )}

            <Button 
              onClick={handleWithdrawal}
              disabled={!canWithdraw || !withdrawAmount}
              className="w-full"
            >
              {isWeekend ? 'Withdrawals Closed (Weekend)' : 
               !hasEnoughReferrals ? `Need ${(user?.referralsRequiredForWithdrawal || 2) - (user?.referralCount || 0)} More Referrals` :
               !user?.balance || user.balance < 3000 ? 'Insufficient Balance' :
               'Submit Withdrawal Request'}
            </Button>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Withdrawal Requirements</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You must have at least {user?.referralsRequiredForWithdrawal || 2} referrals</li>
                <li>• Withdrawals require admin approval</li>
                <li>• Withdrawals are processed Monday to Friday</li>
                <li>• A 10% processing fee applies to all withdrawals</li>
                <li>• Minimum withdrawal amount is 3,000 RWF</li>
                <li>• Processing time: 1-3 business days after approval</li>
                <li>• You'll receive payment via MTN Mobile Money</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        {withdrawalRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>Track your withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {withdrawalRequests.map((withdrawal: any) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Wallet className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">
                          {withdrawal.amount.toLocaleString()} RWF
                        </h3>
                        <p className="text-sm text-gray-600">
                          Net: {withdrawal.netAmount.toLocaleString()} RWF (Fee: {withdrawal.fee.toLocaleString()} RWF)
                        </p>
                        <p className="text-sm text-gray-600">
                          Requested: {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        withdrawal.status === 'approved' ? 'default' :
                        withdrawal.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }>
                        {withdrawal.status === 'pending' && <Clock className="h-4 w-4 mr-1" />}
                        {withdrawal.status === 'approved' && <CheckCircle className="h-4 w-4 mr-1" />}
                        {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Withdrawal History */}
        {withdrawalRequests.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Withdrawals Yet</h3>
              <p className="text-gray-600">You haven't made any withdrawal requests yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Withdraw;
