
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

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
  refreshUser: () => void;
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

  // Function to refresh user data from Supabase
  const refreshUser = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          const updatedUser: User = {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            balance: parseFloat(data.balance),
            totalInvested: parseFloat(data.total_invested),
            totalEarned: parseFloat(data.total_earned),
            referralCode: data.referral_code,
            referredBy: data.referred_by,
            referralCount: data.referral_count,
            isActive: data.is_active,
            createdAt: data.created_at,
          };
          setUser(updatedUser);
          localStorage.setItem('investx_user', JSON.stringify(updatedUser));
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('investx_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);

    // Set up real-time subscription for user balance updates
    let subscription: any = null;
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      subscription = supabase
        .channel('user-balance-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${userData.id}`
          },
          (payload) => {
            const updatedData = payload.new;
            const updatedUser: User = {
              id: updatedData.id,
              name: updatedData.name,
              email: updatedData.email,
              phone: updatedData.phone,
              balance: parseFloat(updatedData.balance),
              totalInvested: parseFloat(updatedData.total_invested),
              totalEarned: parseFloat(updatedData.total_earned),
              referralCode: updatedData.referral_code,
              referredBy: updatedData.referred_by,
              referralCount: updatedData.referral_count,
              isActive: updatedData.is_active,
              createdAt: updatedData.created_at,
            };
            setUser(updatedUser);
            localStorage.setItem('investx_user', JSON.stringify(updatedUser));
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
        return false;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, data.password_hash);
      if (!isPasswordValid) {
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
        return false;
      }

      const userSession: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        balance: parseFloat(data.balance),
        totalInvested: parseFloat(data.total_invested),
        totalEarned: parseFloat(data.total_earned),
        referralCode: data.referral_code,
        referredBy: data.referred_by,
        referralCount: data.referral_count,
        isActive: data.is_active,
        createdAt: data.created_at,
      };

      setUser(userSession);
      localStorage.setItem('investx_user', JSON.stringify(userSession));
      
      toast({
        title: "Login Successful",
        description: "Welcome back to InvestX!",
      });
      return true;
    } catch (error) {
      console.error('Login error:', error);
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
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .or(`email.eq.${userData.email},phone.eq.${userData.phone}`)
        .single();

      if (existingUser) {
        toast({
          title: "Registration Failed",
          description: "User with this email or phone already exists.",
          variant: "destructive",
        });
        return false;
      }

      // Generate referral code
      const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 10);

      const { data, error } = await supabase
        .from('users')
        .insert({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password_hash: passwordHash,
          referral_code: referralCode,
          referred_by: userData.referredBy || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update referrer's count if applicable
      if (userData.referredBy) {
        await supabase
          .from('users')
          .update({ referral_count: supabase.sql`referral_count + 1` })
          .eq('referral_code', userData.referredBy);
      }

      toast({
        title: "Registration Successful",
        description: "Welcome to InvestX! Please make your initial payment to activate your account.",
      });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
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

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      try {
        const updateData: any = {};
        if (userData.balance !== undefined) updateData.balance = userData.balance;
        if (userData.totalInvested !== undefined) updateData.total_invested = userData.totalInvested;
        if (userData.totalEarned !== undefined) updateData.total_earned = userData.totalEarned;
        if (userData.isActive !== undefined) updateData.is_active = userData.isActive;

        const { error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', user.id);

        if (error) throw error;

        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('investx_user', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Error updating user:', error);
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
      refreshUser,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
