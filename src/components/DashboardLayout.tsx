
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Home, DollarSign, Users, Wallet, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Investment', href: '/investment', icon: DollarSign },
    { name: 'Referrals', href: '/referrals', icon: Users },
    { name: 'Withdraw', href: '/withdraw', icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
              <TrendingUp className="h-8 w-8 text-white mr-2" />
              <h1 className="text-2xl font-bold text-white">InvestX</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-white text-white hover:bg-blue-700">
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
            <Card>
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
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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

export default DashboardLayout;
