
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('investx_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('investx_users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userSession = { ...foundUser };
        delete userSession.password; // Remove password from session
        setUser(userSession);
        localStorage.setItem('investx_user', JSON.stringify(userSession));
        toast({
          title: "Login Successful",
          description: "Welcome back to InvestX!",
        });
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login.",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('investx_users') || '[]');
      
      // Check if user already exists
      if (users.find((u: any) => u.email === userData.email || u.phone === userData.phone)) {
        toast({
          title: "Registration Failed",
          description: "User with this email or phone already exists.",
          variant: "destructive",
        });
        return false;
      }

      // Generate referral code
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        balance: 0, // Start with 0 balance
        totalInvested: 0,
        totalEarned: 0,
        referralCode,
        referredBy: userData.referredBy || '',
        referralCount: 0,
        isActive: false, // Account needs admin activation
        createdAt: new Date().toISOString(),
      };

      const newUserWithPassword = { ...newUser, password: userData.password };
      users.push(newUserWithPassword);
      localStorage.setItem('investx_users', JSON.stringify(users));

      // Update referrer's count if applicable
      if (userData.referredBy) {
        const referrerIndex = users.findIndex((u: any) => u.referralCode === userData.referredBy);
        if (referrerIndex !== -1) {
          users[referrerIndex].referralCount += 1;
          localStorage.setItem('investx_users', JSON.stringify(users));
        }
      }

      toast({
        title: "Registration Successful",
        description: "Welcome to InvestX! Please make your initial payment to activate your account.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "An error occurred during registration.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('investx_user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('investx_user', JSON.stringify(updatedUser));
      
      // Update in users array
      const users = JSON.parse(localStorage.getItem('investx_users') || '[]');
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...userData };
        localStorage.setItem('investx_users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
