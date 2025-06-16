
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, UserCheck, UserX, Plus, Wallet } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  totalInvested: number;
  totalEarned: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  isActive: boolean;
  createdAt: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNotes, setCreditNotes] = useState('');

  useEffect(() => {
    const savedUsers = localStorage.getItem('investx_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    }
  }, []);

  const saveUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('investx_users', JSON.stringify(newUsers));
  };

  const toggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        return { ...user, isActive: !user.isActive };
      }
      return user;
    });

    saveUsers(updatedUsers);

    // Update current user session if it's the same user
    const currentUser = localStorage.getItem('investx_user');
    if (currentUser) {
      const parsedCurrentUser = JSON.parse(currentUser);
      if (parsedCurrentUser.id === userId) {
        const updatedCurrentUser = updatedUsers.find(u => u.id === userId);
        if (updatedCurrentUser) {
          const userSession = { ...updatedCurrentUser };
          delete (userSession as any).password;
          localStorage.setItem('investx_user', JSON.stringify(userSession));
        }
      }
    }

    const user = users.find(u => u.id === userId);
    toast({
      title: `User ${user?.isActive ? 'Deactivated' : 'Activated'}`,
      description: `${user?.name} has been ${user?.isActive ? 'deactivated' : 'activated'}.`,
    });
  };

  const handleCreditUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser || !creditAmount) {
      toast({
        title: "Error",
        description: "Please select a user and enter an amount.",
        variant: "destructive",
      });
      return;
    }

    const amount = Number(creditAmount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    // Update user balance
    const updatedUsers = users.map(user => {
      if (user.id === selectedUser.id) {
        return {
          ...user,
          balance: user.balance + amount,
          isActive: true
        };
      }
      return user;
    });
    
    saveUsers(updatedUsers);

    // Update current user session if it's the same user
    const currentUser = localStorage.getItem('investx_user');
    if (currentUser) {
      const parsedCurrentUser = JSON.parse(currentUser);
      if (parsedCurrentUser.id === selectedUser.id) {
        const updatedCurrentUser = {
          ...parsedCurrentUser,
          balance: parsedCurrentUser.balance + amount,
          isActive: true
        };
        localStorage.setItem('investx_user', JSON.stringify(updatedCurrentUser));
      }
    }

    // Create payment record
    const payments = JSON.parse(localStorage.getItem('investx_payments') || '[]');
    const newPayment = {
      id: Date.now().toString(),
      userId: selectedUser.id,
      userName: selectedUser.name,
      userEmail: selectedUser.email,
      amount: amount,
      status: 'approved',
      paymentMethod: 'Manual Credit',
      transactionId: `ADM-${Date.now()}`,
      requestDate: new Date().toISOString(),
      processedDate: new Date().toISOString(),
      notes: creditNotes || 'Manual credit by admin'
    };

    payments.push(newPayment);
    localStorage.setItem('investx_payments', JSON.stringify(payments));

    toast({
      title: "User Credited Successfully",
      description: `${amount.toLocaleString()} RWF has been credited to ${selectedUser.name}'s account.`,
    });

    setIsDialogOpen(false);
    setSelectedUser(null);
    setCreditAmount('');
    setCreditNotes('');
  };

  const activeUsers = users.filter(u => u.isActive);
  const inactiveUsers = users.filter(u => !u.isActive);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600">Manage user accounts and balances</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Credit User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Credit User Account</DialogTitle>
                <DialogDescription>
                  Add funds to a user's account
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreditUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userSelect">Select User</Label>
                  <select
                    id="userSelect"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={selectedUser?.id || ''}
                    onChange={(e) => {
                      const user = users.find(u => u.id === e.target.value);
                      setSelectedUser(user || null);
                    }}
                    required
                  >
                    <option value="">Select a user...</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.balance.toLocaleString()} RWF
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditAmount">Amount (RWF)</Label>
                  <Input
                    id="creditAmount"
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="Enter amount to credit"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditNotes">Notes (Optional)</Label>
                  <Input
                    id="creditNotes"
                    value={creditNotes}
                    onChange={(e) => setCreditNotes(e.target.value)}
                    placeholder="Reason for credit..."
                  />
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
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
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveUsers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <div className="space-y-6">
          {users.length > 0 ? (
            users.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2 text-blue-600" />
                        {user.name}
                      </CardTitle>
                      <CardDescription>{user.email} | {user.phone}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        onClick={() => toggleUserStatus(user.id)}
                        variant={user.isActive ? "destructive" : "default"}
                        size="sm"
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Balance</p>
                      <p className="font-semibold text-green-600">{user.balance.toLocaleString()} RWF</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Invested</p>
                      <p className="font-semibold">{user.totalInvested.toLocaleString()} RWF</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Earned</p>
                      <p className="font-semibold">{user.totalEarned.toLocaleString()} RWF</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Referrals</p>
                      <p className="font-semibold">{user.referralCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Referral Code: <span className="font-mono font-semibold">{user.referralCode}</span></p>
                    {user.referredBy && (
                      <p className="text-sm text-gray-600">Referred by: <span className="font-semibold">{user.referredBy}</span></p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
