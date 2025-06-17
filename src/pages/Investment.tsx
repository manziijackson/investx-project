
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Investment = () => {
  const { user, updateUser } = useAuth();
  const [packages, setPackages] = useState([]);
  const [userInvestments, setUserInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch investment packages
      const { data: packagesData, error: packagesError } = await supabase
        .from('investment_packages')
        .select('*')
        .eq('is_active', true)
        .order('min_amount');

      if (packagesError) throw packagesError;

      const formattedPackages = packagesData.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.name,
        amount: parseFloat(pkg.min_amount),
        returnAmount: parseFloat(pkg.min_amount) * (1 + parseFloat(pkg.profit_percentage) / 100),
        duration: pkg.duration_days,
        maxUses: 3, // Default max uses per package
        isActive: pkg.is_active,
        description: `${pkg.profit_percentage}% profit in ${pkg.duration_days} days`,
      }));

      setPackages(formattedPackages);

      // Fetch user investments if user is logged in
      if (user) {
        const { data: investmentsData, error: investmentsError } = await supabase
          .from('user_investments')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (investmentsError) throw investmentsError;

        const formattedInvestments = investmentsData.map((inv: any) => ({
          id: inv.id,
          packageId: inv.package_id,
          packageName: formattedPackages.find((pkg: any) => pkg.id === inv.package_id)?.name || 'Unknown Package',
          amount: parseFloat(inv.amount),
          returnAmount: parseFloat(inv.expected_return),
          createdAt: inv.start_date,
          maturityDate: inv.end_date || new Date(new Date(inv.start_date).getTime() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
          status: inv.status,
        }));

        setUserInvestments(formattedInvestments);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load investment data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleInvestment = async (packageId: string) => {
    if (!user?.isActive) {
      toast({
        title: "Account Not Active",
        description: "Please activate your account by making the initial payment.",
        variant: "destructive",
      });
      return;
    }

    const selectedPackage = packages.find((pkg: any) => pkg.id === packageId);
    if (!selectedPackage) return;

    // Check if user has sufficient balance
    if (user.balance < selectedPackage.amount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this investment.",
        variant: "destructive",
      });
      return;
    }

    // Check how many times user has used this package
    const packageUsage = userInvestments.filter((inv: any) => inv.packageId === packageId).length;
    if (packageUsage >= selectedPackage.maxUses) {
      toast({
        title: "Package Limit Reached",
        description: `You have already used this package ${selectedPackage.maxUses} times.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Create new investment
      const { error: investmentError } = await supabase
        .from('user_investments')
        .insert({
          user_id: user.id,
          package_id: packageId,
          amount: selectedPackage.amount,
          expected_return: selectedPackage.returnAmount,
          status: 'active',
        });

      if (investmentError) throw investmentError;

      // Update user balance and total invested
      const newBalance = user.balance - selectedPackage.amount;
      const newTotalInvested = user.totalInvested + selectedPackage.amount;
      
      await updateUser({
        balance: newBalance,
        totalInvested: newTotalInvested,
      });

      toast({
        title: "Investment Successful",
        description: `You have successfully invested in ${selectedPackage.name}`,
      });

      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Investment error:', error);
      toast({
        title: "Investment Failed",
        description: "Failed to process your investment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading investment packages...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Investment Packages</h1>
          <p className="text-gray-600">Choose from our available investment packages</p>
        </div>

        {/* Account Status Check */}
        {!user?.isActive && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                <div>
                  <h3 className="font-semibold text-orange-800">Account Activation Required</h3>
                  <p className="text-orange-700">Please activate your account to start investing.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg: any) => {
            const packageUsage = userInvestments.filter((inv: any) => inv.packageId === pkg.id).length;
            const canInvest = user?.isActive && user.balance >= pkg.amount && packageUsage < pkg.maxUses;
            
            return (
              <Card key={pkg.id} className="relative">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <Badge variant="outline">
                      {packageUsage}/{pkg.maxUses} used
                    </Badge>
                  </div>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Investment Amount</span>
                      <span className="font-semibold">{pkg.amount.toLocaleString()} RWF</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Return Amount</span>
                      <span className="font-semibold text-green-600">{pkg.returnAmount.toLocaleString()} RWF</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Duration</span>
                      <span className="font-semibold">{pkg.duration} days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Profit</span>
                      <span className="font-sem ibold text-blue-600">
                        {(pkg.returnAmount - pkg.amount).toLocaleString()} RWF
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    disabled={!canInvest}
                    onClick={() => handleInvestment(pkg.id)}
                  >
                    {!user?.isActive ? 'Activate Account First' : 
                     user.balance < pkg.amount ? 'Insufficient Balance' :
                     packageUsage >= pkg.maxUses ? 'Package Limit Reached' :
                     'Invest Now'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* User's Active Investments */}
        {userInvestments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Active Investments</CardTitle>
              <CardDescription>Track your current investments and returns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userInvestments.map((investment: any) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <TrendingUp className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">{investment.packageName}</h3>
                        <p className="text-sm text-gray-600">
                          Invested: {investment.amount.toLocaleString()} RWF
                        </p>
                        <p className="text-sm text-gray-600">
                          Expected Return: {investment.returnAmount.toLocaleString()} RWF
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">
                        <Clock className="h-4 w-4 mr-1" />
                        Active
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Matures: {new Date(investment.maturityDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Investment;
