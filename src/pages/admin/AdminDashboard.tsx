
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Package, Wallet, TrendingUp, DollarSign, UserCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalInvestments: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    totalPackages: 0,
  });

  useEffect(() => {
    // Load data from localStorage
    const users = JSON.parse(localStorage.getItem('investx_users') || '[]');
    const packages = JSON.parse(localStorage.getItem('investx_packages') || '[]');
    const withdrawals = JSON.parse(localStorage.getItem('investx_withdrawals') || '[]');

    const activeUsers = users.filter((user: any) => user.isActive);
    const pendingUsers = users.filter((user: any) => !user.isActive);
    const totalInvestments = users.reduce((sum: number, user: any) => sum + (user.totalInvested || 0), 0);
    const totalWithdrawals = withdrawals.reduce((sum: number, withdrawal: any) => sum + (withdrawal.amount || 0), 0);
    const pendingWithdrawals = withdrawals.filter((w: any) => w.status === 'pending').length;

    setStats({
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      pendingUsers: pendingUsers.length,
      totalInvestments,
      totalWithdrawals,
      pendingWithdrawals,
      totalPackages: packages.length,
    });
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of your InvestX platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeUsers} active, {stats.pendingUsers} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Users with activated accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalInvestments.toLocaleString()} RWF</div>
              <p className="text-xs text-muted-foreground">
                Total invested by all users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Withdrawals</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingWithdrawals}</div>
              <p className="text-xs text-muted-foreground">
                Withdrawal requests to review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentUsers />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Platform health overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Investment Packages</span>
                <Badge variant="default">{stats.totalPackages} Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">User Registration</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Withdrawals</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Platform Status</span>
                <Badge variant="default">Online</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <h3 className="font-semibold">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage user accounts</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Package className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-semibold">Investment Packages</h3>
                <p className="text-sm text-gray-600">Create and edit packages</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-semibold">Process Payments</h3>
                <p className="text-sm text-gray-600">Approve user payments</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Wallet className="h-8 w-8 text-orange-600 mb-2" />
                <h3 className="font-semibold">Withdrawals</h3>
                <p className="text-sm text-gray-600">Review withdrawal requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

const RecentUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem('investx_users') || '[]');
    const recentUsers = allUsers
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    setUsers(recentUsers);
  }, []);

  return (
    <div className="space-y-4">
      {users.length === 0 ? (
        <p className="text-gray-500 text-sm">No users registered yet</p>
      ) : (
        users.map((user: any) => (
          <div key={user.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <Badge variant={user.isActive ? 'default' : 'secondary'}>
              {user.isActive ? 'Active' : 'Pending'}
            </Badge>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminDashboard;
