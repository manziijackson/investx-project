
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Check, X, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  userName: string;
  userEmail: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  request_date: string;
  processed_date?: string;
}

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          users (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedWithdrawals = data.map((withdrawal: any) => ({
        id: withdrawal.id,
        user_id: withdrawal.user_id,
        userName: withdrawal.users.name,
        userEmail: withdrawal.users.email,
        amount: parseFloat(withdrawal.amount),
        fee: parseFloat(withdrawal.fee),
        net_amount: parseFloat(withdrawal.net_amount),
        status: withdrawal.status,
        request_date: withdrawal.request_date,
        processed_date: withdrawal.processed_date,
      }));

      setWithdrawals(formattedWithdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch withdrawal requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();

    // Set up real-time subscription for withdrawal updates
    const subscription = supabase
      .channel('withdrawal-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'withdrawal_requests'
        },
        () => {
          fetchWithdrawals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleApproval = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: action,
          processed_by: 'admin',
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: `Withdrawal ${action === 'approved' ? 'Approved' : 'Rejected'}`,
        description: `The withdrawal request has been ${action}.${action === 'rejected' ? ' Amount returned to user balance.' : ''}`,
      });

      fetchWithdrawals();
    } catch (error) {
      console.error('Error updating withdrawal:', error);
      toast({
        title: "Error",
        description: "Failed to update withdrawal request.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading withdrawal requests...</div>
        </div>
      </AdminLayout>
    );
  }

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const processedWithdrawals = withdrawals.filter(w => w.status !== 'pending');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Withdrawal Requests</h2>
          <p className="text-gray-600">Manage user withdrawal requests</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingWithdrawals.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0).toLocaleString()} RWF total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {withdrawals.filter(w => w.status === 'approved').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <X className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {withdrawals.filter(w => w.status === 'rejected').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Withdrawals */}
        {pendingWithdrawals.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Pending Requests</h3>
            <div className="space-y-4">
              {pendingWithdrawals.map((withdrawal) => (
                <Card key={withdrawal.id} className="border-yellow-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Wallet className="h-5 w-5 mr-2 text-blue-600" />
                          {withdrawal.userName}
                        </CardTitle>
                        <CardDescription>{withdrawal.userEmail}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(withdrawal.status)}>
                        {withdrawal.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Requested Amount</p>
                        <p className="font-semibold">{withdrawal.amount.toLocaleString()} RWF</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fee (10%)</p>
                        <p className="font-semibold">{withdrawal.fee.toLocaleString()} RWF</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Net Amount</p>
                        <p className="font-semibold text-green-600">{withdrawal.net_amount.toLocaleString()} RWF</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Request Date</p>
                        <p className="font-semibold">{new Date(withdrawal.request_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleApproval(withdrawal.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleApproval(withdrawal.id, 'rejected')}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Processed Withdrawals */}
        {processedWithdrawals.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Processed Requests</h3>
            <div className="space-y-4">
              {processedWithdrawals.map((withdrawal) => (
                <Card key={withdrawal.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <Wallet className="h-5 w-5 mr-2 text-blue-600" />
                          {withdrawal.userName}
                        </CardTitle>
                        <CardDescription>{withdrawal.userEmail}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(withdrawal.status)}>
                        {withdrawal.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-semibold">{withdrawal.amount.toLocaleString()} RWF</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fee</p>
                        <p className="font-semibold">{withdrawal.fee.toLocaleString()} RWF</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Net Amount</p>
                        <p className="font-semibold">{withdrawal.net_amount.toLocaleString()} RWF</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Requested</p>
                        <p className="font-semibold">{new Date(withdrawal.request_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Processed</p>
                        <p className="font-semibold">
                          {withdrawal.processed_date ? new Date(withdrawal.processed_date).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {withdrawals.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No withdrawal requests found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
