
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';
import { toast } from '@/hooks/use-toast';

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
      console.log('Attempting login for:', email);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Database error during login:', error);
        toast({
          title: "Login Failed",
          description: "User not found or database error",
          variant: "destructive",
        });
        return false;
      }

      if (!data) {
        toast({
          title: "Login Failed",
          description: "No user found with this email",
          variant: "destructive",
        });
        return false;
      }

      console.log('User found, checking password...');
      const isValidPassword = await bcrypt.compare(password, data.password_hash);
      
      if (!isValidPassword) {
        toast({
          title: "Login Failed",
          description: "Invalid password",
          variant: "destructive",
        });
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
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      console.log('Login successful for user:', userData.name);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred during login",
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('Attempting registration for:', userData.email);
      
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        toast({
          title: "Registration Failed",
          description: "An account with this email already exists",
          variant: "destructive",
        });
        return false;
      }

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

      console.log('Inserting new user...');
      const { data, error } = await supabase
        .from('users')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        toast({
          title: "Registration Failed",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
        return false;
      }

      // If user was referred, increment referrer's count
      if (userData.referralCode) {
        console.log('Processing referral for code:', userData.referralCode);
        
        const { data: referrer, error: fetchError } = await supabase
          .from('users')
          .select('referral_count')
          .eq('referral_code', userData.referralCode)
          .single();

        if (!fetchError && referrer) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ referral_count: (referrer.referral_count || 0) + 1 })
            .eq('referral_code', userData.referralCode);

          if (updateError) {
            console.error('Error updating referrer count:', updateError);
          } else {
            console.log('Referral count updated successfully');
          }
        }
      }

      toast({
        title: "Registration Successful",
        description: "Your account has been created. Please proceed with payment to activate your account.",
      });
      
      console.log('Registration successful for:', userData.email);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred during registration",
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
      description: "You have been logged out successfully",
    });
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
