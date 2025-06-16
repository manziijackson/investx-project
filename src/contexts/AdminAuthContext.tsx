
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface AdminContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (username: string, password: string) => boolean;
  adminLogout: () => void;
}

const AdminAuthContext = createContext<AdminContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing admin session
    const adminSession = localStorage.getItem('investx_admin_session');
    if (adminSession === 'authenticated') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const adminLogin = (username: string, password: string): boolean => {
    // Simple admin credentials - in production, this should be more secure
    if (username === 'admin' && password === 'InvestX2024!') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('investx_admin_session', 'authenticated');
      toast({
        title: "Admin Login Successful",
        description: "Welcome to InvestX Admin Dashboard",
      });
      return true;
    } else {
      toast({
        title: "Admin Login Failed",
        description: "Invalid admin credentials",
        variant: "destructive",
      });
      return false;
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('investx_admin_session');
    toast({
      title: "Admin Logged Out",
      description: "You have been logged out from admin panel",
    });
  };

  return (
    <AdminAuthContext.Provider value={{
      isAdminAuthenticated,
      adminLogin,
      adminLogout,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
