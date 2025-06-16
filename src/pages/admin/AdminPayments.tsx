
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Check, X, Clock, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: string;
  transactionId: string;
  requestDate: string;
  processedDate?: string;
  notes?: string;
}

const AdminPayments = () => {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [manualPayment, setManualPayment] = useState({
    userId: '',
    amount: '',
    notes: ''
  });
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const savedPayments = localStorage.getItem('investx_payments');
    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }

    const savedUsers = localStorage.getItem('investx_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const savePayments = (newPayments: PaymentRequest[]) => {
    setPayments(newPayments);
    localStorage.setItem('investx_payments', JSON.stringify(newPayments));
  };

  const handleApproval = (id: string, action: 'approved' | 'rejected') => {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;

    const updatedPayments = payments.map(p => {
      if (p.id === id) {
        return {
          ...p,
          status: action,
          processedDate: new Date().toISOString()
        };
      }
      return p;
    });

    savePayments(updatedPayments);

    // If approved, update user balance and activate account
    if (action === 'approved') {
      const updatedUsers = users.map(user => {
        if (user.id === payment.userId) {
          return {
            ...user,
            balance: (user.balance || 0) + payment.amount,
            isActive: true
          };
        }
        return user;
      });
      
      localStorage.setItem('investx_users', JSON.stringify(updatedUsers));
      
      // Update current user session if it's the same user
      const currentUser = localStorage.getItem('investx_user');
      if (currentUser) {
        const parsedCurrentUser = JSON.parse(currentUser);
        if (parsedCurrentUser.id === payment.userId) {
          const updatedCurrentUser = {
            ...parsedCurrentUser,
            balance: (parsedCurrentUser.balance || 0) + payment.amount,
            isActive: true
          };
          localStorage.setItem('investx_user', JSON.stringify(updatedCurrentUser));
        }
      }
    }

    toast({
      title: `Payment ${action === 'approved' ? 'Approved' : 'Rejected'}`,
      description: `The payment has been ${action}${action === 'approved' ? ' and user account activated' : ''}.`,
    });
  };

  const handleManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = users.find(u => u.id === manualPayment.userId);
    if (!user) {
      toast({
        title: "Error",
        description: "User not found.",
        variant: "destructive",
      });
      return;
    }

    // Update user balance directly
    const updatedUsers = users.map(u => {
      if (u.id === manualPayment.userId) {
        return {
          ...u,
          balance: (u.balance || 0) + Number(manualPayment.amount),
          isActive: true
        };
      }
      return u;
    });
    
    localStorage.setItem('investx_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Update current user session if it's the same user
    const currentUser = localStorage.getItem('investx_user');
    if (currentUser) {
      const parsedCurrentUser = JSON.parse(currentUser);
      if (parsedCurrentUser.id === manualPayment.userId) {
        const updatedCurrentUser = {
          ...parsedCurrentUser,
          balance: (parsedCurrentUser.balance || 0) + Number(manualPayment.amount),
          isActive: true
        };
        localStorage.setItem('investx_user', JSON.stringify(updatedCurrentUser));
      }
    }

    // Create payment record
    const newPayment: PaymentRequest = {
      id: Date.now().toString(),
      userId: manualPayment.userId,
      userName: user.name,
      userEmail: user.email,
      amount: Number(manualPayment.amount),
      status: 'approved',
      paymentMethod: 'Manual Credit',
      transactionId: `MAN-${Date.now()}`,
      requestDate: new Date().toISOString(),
      processedDate: new Date().toISOString(),
      notes: manualPayment.notes
    };

    savePayments([...payments, newPayment]);

    toast({
      title: "Manual Payment Added",
      description: `${manualPayment.amount} RWF has been credited to ${user.name}'s account.`,
    });

    setIsDialogOpen(false);
    setManualPayment({ userId: '', amount: '', notes: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const processedPayments = payments.filter(p => p.status !== 'pending');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Payment Management</h2>
            <p className="text-gray-600">Manage user payments and account credits</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Manual Credit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Manual Payment Credit</DialogTitle>
                <DialogDescription>
                  Credit a user's account manually
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleManualPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">Select User</Label>
                  <select
                    id="userId"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={manualPayment.userId}
                    onChange={(e) => setManualPayment({...manualPayment, userId: e.target.value})}
                    required
                  >
                    <option value="">Select a user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (RWF)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={manualPayment.amount}
                    onChange={(e) => setManualPayment({...manualPayment, amount: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Input
                    id="notes"
                    value={manualPayment.notes}
                    onChange={(e) => setManualPayment({...manualPayment, notes: e.target.value})}
                    placeholder="Reason for credit..."
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  Credit Account
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingPayments.length}</div>
              <p className="text-xs text-muted-foreground">
                {pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} RWF total
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
                {payments.filter(p => p.status === 'approved').length}
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
                {payments.filter(p => p.status === 'rejected').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payments */}
        {pendingPayments.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Pending Payments</h3>
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <Card key={payment.id} className="border-yellow-200">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                          {payment.userName}
                        </CardTitle>
                        <CardDescription>{payment.userEmail}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-semibold">{payment.amount.toLocaleString()} RWF</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Method</p>
                        <p className="font-semibold">{payment.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Transaction ID</p>
                        <p className="font-semibold">{payment.transactionId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Request Date</p>
                        <p className="font-semibold">{new Date(payment.requestDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {payment.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="text-sm bg-gray-50 p-2 rounded">{payment.notes}</p>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleApproval(payment.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleApproval(payment.id, 'rejected')}
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

        {/* Processed Payments */}
        {processedPayments.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Payment History</h3>
            <div className="space-y-4">
              {processedPayments.slice(0, 10).map((payment) => (
                <Card key={payment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                          {payment.userName}
                        </CardTitle>
                        <CardDescription>{payment.userEmail}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-semibold">{payment.amount.toLocaleString()} RWF</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Method</p>
                        <p className="font-semibold">{payment.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Transaction ID</p>
                        <p className="font-semibold">{payment.transactionId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Request Date</p>
                        <p className="font-semibold">{new Date(payment.requestDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Processed</p>
                        <p className="font-semibold">
                          {payment.processedDate ? new Date(payment.processedDate).toLocaleDateString() : '-'}
                        </p>
                      </div>
                    </div>
                    {payment.notes && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">Notes: {payment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {payments.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payment records found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
