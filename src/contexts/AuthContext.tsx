
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  balance: number;
  totalInvested: number;
  totalEarned: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  referralsRequiredForWithdrawal: number;
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate referral code
  const generateReferralCode = (): string => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('investx_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('investx_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        return false;
      }

      const isValidPassword = await bcrypt.compare(password, data.password_hash);
      if (!isValidPassword) {
        return false;
      }

      const userData: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        balance: parseFloat(data.balance?.toString() || '0'),
        totalInvested: parseFloat(data.total_invested?.toString() || '0'),
        totalEarned: parseFloat(data.total_earned?.toString() || '0'),
        referralCode: data.referral_code,
        referredBy: data.referred_by,
        referralCount: data.referral_count || 0,
        referralsRequiredForWithdrawal: data.referrals_required_for_withdrawal || 2,
        isActive: data.is_active || false,
        createdAt: data.created_at,
      };

      setUser(userData);
      localStorage.setItem('investx_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const referralCode = generateReferralCode();

      const insertData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password_hash: hashedPassword,
        referral_code: referralCode,
        referred_by: userData.referralCode || null,
        balance: 0,
        total_invested: 0,
        total_earned: 0,
        referral_count: 0,
        referrals_required_for_withdrawal: 2,
        is_active: false,
      };

      const { data, error } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        return false;
      }

      // If user was referred, increment referrer's count
      if (userData.referralCode) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ referral_count: supabase.raw('referral_count + 1') })
          .eq('referral_code', userData.referralCode);

        if (updateError) {
          console.error('Error updating referrer count:', updateError);
        }
      }

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('investx_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('investx_user', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
