
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Clock, DollarSign, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface InvestmentPackage {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  durationDays: number;
  profitPercentage: number;
  isActive: boolean;
}

interface UserInvestment {
  id: string;
  packageName: string;
  amount: number;
  expectedReturn: number;
  status: string;
  startDate: string;
  endDate: string;
}

const Investment = () => {
  const { user, updateUser } = useAuth();
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<InvestmentPackage | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [isInvesting, setIsInvesting] = useState(false);

  useEffect(() => {
    fetchPackages();
    fetchUserInvestments();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_packages')
        .select('*')
        .eq('is_active', true)
        .order('min_amount', { ascending: true });

      if (error) throw error;

      const formattedPackages = data.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        minAmount: parseFloat(pkg.min_amount.toString()),
        maxAmount: parseFloat(pkg.max_amount.toString()),
        durationDays: pkg.duration_days,
        profitPercentage: parseFloat(pkg.profit_percentage.toString()),
        isActive: pkg.is_active,
      }));

      setPackages(formattedPackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to load investment packages.",
        variant: "destructive",
      });
    }
  };

  const fetchUserInvestments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_investments')
        .select(`
          *,
          investment_packages(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedInvestments = data.map(inv => ({
        id: inv.id,
        packageName: inv.investment_packages.name,
        amount: parseFloat(inv.amount.toString()),
        expectedReturn: parseFloat(inv.expected_return.toString()),
        status: inv.status,
        startDate: inv.start_date,
        endDate: inv.end_date,
      }));

      setUserInvestments(formattedInvestments);
    } catch (error) {
      console.error('Error fetching user investments:', error);
    }
  };

  const handleInvest = async () => {
    if (!selectedPackage || !investmentAmount || !user) return;

    const amount = parseFloat(investmentAmount);

    // Validation
    if (amount < selectedPackage.minAmount || amount > selectedPackage.maxAmount) {
      toast({
        title: "Invalid Amount",
        description: `Investment amount must be between ${selectedPackage.minAmount.toLocaleString()} and ${selectedPackage.maxAmount.toLocaleString()} RWF.`,
        variant: "destructive",
      });
      return;
    }

    if (amount > user.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this investment.",
        variant: "destructive",
      });
      return;
    }

    setIsInvesting(true);

    try {
      // Calculate expected return
      const expectedReturn = amount + (amount * selectedPackage.profitPercentage / 100);
      
      // Calculate end date
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + selectedPackage.durationDays);

      // Create investment record
      const { error: investmentError } = await supabase
        .from('user_investments')
        .insert({
          user_id: user.id,
          package_id: selectedPackage.id,
          amount: amount,
          expected_return: expectedReturn,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        });

      if (investmentError) throw investmentError;

      // Update user balance and total invested
      const newBalance = user.balance - amount;
      const newTotalInvested = user.totalInvested + amount;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          balance: newBalance,
          total_invested: newTotalInvested,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update local user state
      updateUser({
        balance: newBalance,
        totalInvested: newTotalInvested,
      });

      toast({
        title: "Investment Successful",
        description: `Successfully invested ${amount.toLocaleString()} RWF in ${selectedPackage.name}.`,
      });

      // Reset form
      setSelectedPackage(null);
      setInvestmentAmount('');
      
      // Refresh investments
      fetchUserInvestments();

    } catch (error) {
      console.error('Investment error:', error);
      toast({
        title: "Investment Failed",
        description: "An error occurred while processing your investment.",
        variant: "destructive",
      });
    } finally {
      setIsInvesting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Investment Packages</h2>
          <p className="text-gray-600">Choose from our available investment packages</p>
        </div>

        {/* Current Balance */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">{user?.balance.toLocaleString()} RWF</p>
              </div>
              <DollarSign className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        {/* Investment Packages */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedPackage?.id === pkg.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`} onClick={() => setSelectedPackage(pkg)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                      {pkg.name}
                    </CardTitle>
                    <CardDescription>
                      Investment range: {pkg.minAmount.toLocaleString()} - {pkg.maxAmount.toLocaleString()} RWF
                    </CardDescription>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {pkg.profitPercentage}% profit
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Duration: {pkg.durationDays} days
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Target className="h-4 w-4 mr-2" />
                    Expected return for 100,000 RWF: {(100000 + (100000 * pkg.profitPercentage / 100)).toLocaleString()} RWF
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Investment Form */}
        {selectedPackage && (
          <Card>
            <CardHeader>
              <CardTitle>Invest in {selectedPackage.name}</CardTitle>
              <CardDescription>
                Enter the amount you want to invest (Min: {selectedPackage.minAmount.toLocaleString()} RWF, Max: {selectedPackage.maxAmount.toLocaleString()} RWF)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Investment Amount (RWF)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  min={selectedPackage.minAmount}
                  max={Math.min(selectedPackage.maxAmount, user?.balance || 0)}
                />
              </div>
              
              {investmentAmount && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Investment Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p>Investment Amount: {parseFloat(investmentAmount || '0').toLocaleString()} RWF</p>
                    <p>Duration: {selectedPackage.durationDays} days</p>
                    <p>Expected Return: {(parseFloat(investmentAmount || '0') + (parseFloat(investmentAmount || '0') * selectedPackage.profitPercentage / 100)).toLocaleString()} RWF</p>
                    <p className="font-semibold text-green-600">
                      Profit: {(parseFloat(investmentAmount || '0') * selectedPackage.profitPercentage / 100).toLocaleString()} RWF
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button onClick={handleInvest} disabled={isInvesting || !investmentAmount}>
                  {isInvesting ? 'Processing...' : 'Invest Now'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setSelectedPackage(null);
                  setInvestmentAmount('');
                }}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* User Investments */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Your Investments</h3>
          {userInvestments.length > 0 ? (
            <div className="space-y-4">
              {userInvestments.map((investment) => (
                <Card key={investment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{investment.packageName}</h4>
                        <p className="text-sm text-gray-600">
                          Invested: {investment.amount.toLocaleString()} RWF
                        </p>
                        <p className="text-sm text-gray-600">
                          Expected Return: {investment.expectedReturn.toLocaleString()} RWF
                        </p>
                        <p className="text-sm text-gray-600">
                          End Date: {new Date(investment.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={investment.status === 'active' ? 'default' : 'secondary'}>
                        {investment.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No investments yet. Choose a package above to start investing!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Investment;
