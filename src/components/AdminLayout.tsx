
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Home, Users, Package, Wallet, CreditCard, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { adminLogout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Packages', href: '/admin/packages', icon: Package },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Withdrawals', href: '/admin/withdrawals', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/admin/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
              <Shield className="h-8 w-8 text-red-400 mr-2" />
              <h1 className="text-2xl font-bold text-white">InvestX Admin</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Admin Panel</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.href;
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-red-600 text-white'
                            : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
