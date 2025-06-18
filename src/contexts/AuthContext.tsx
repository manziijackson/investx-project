
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
        console.log('Restored user from localStorage:', userData.email);
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
      console.log('=== LOGIN ATTEMPT START ===');
      console.log('Email:', email);
      console.log('Password length:', password.length);
      
      // Test database connection first
      console.log('Testing database connection...');
      const { data: testData, error: testError } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Database connection test failed:', testError);
        toast({
          title: "Database Connection Error",
          description: "Unable to connect to database. Please try again later.",
          variant: "destructive",
        });
        return false;
      }
      
      console.log('Database connection successful');
      
      // Query for user
      console.log('Querying for user...');
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .single();

      console.log('Query result:', { data: !!data, error: error?.message });

      if (error) {
        console.error('Database query error:', error);
        
        if (error.code === 'PGRST116') {
          console.log('No user found with this email');
          toast({
            title: "Login Failed",
            description: "No account found with this email address",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: "Database error: " + error.message,
            variant: "destructive",
          });
        }
        return false;
      }

      if (!data) {
        console.log('No data returned from query');
        toast({
          title: "Login Failed",
          description: "No user found with this email",
          variant: "destructive",
        });
        return false;
      }

      console.log('User found:', data.email);
      console.log('Checking password...');
      
      // Check password
      try {
        const isValidPassword = await bcrypt.compare(password, data.password_hash);
        console.log('Password validation result:', isValidPassword);
        
        if (!isValidPassword) {
          console.log('Password validation failed');
          toast({
            title: "Login Failed",
            description: "Incorrect password",
            variant: "destructive",
          });
          return false;
        }
      } catch (bcryptError) {
        console.error('Bcrypt error:', bcryptError);
        toast({
          title: "Login Failed",
          description: "Password verification error",
          variant: "destructive",
        });
        return false;
      }

      console.log('Password validation successful');
      console.log('Creating user object...');

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

      console.log('Setting user state and localStorage...');
      setUser(userData);
      localStorage.setItem('investx_user', JSON.stringify(userData));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.name}!`,
      });
      
      console.log('=== LOGIN SUCCESSFUL ===');
      return true;
    } catch (error) {
      console.error('=== LOGIN ERROR ===', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred: " + (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      console.log('=== REGISTRATION ATTEMPT START ===');
      console.log('Email:', userData.email);
      
      // Check if user already exists
      console.log('Checking for existing user...');
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email.toLowerCase().trim())
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing user:', checkError);
        toast({
          title: "Registration Failed",
          description: "Database error: " + checkError.message,
          variant: "destructive",
        });
        return false;
      }

      if (existingUser) {
        console.log('User already exists');
        toast({
          title: "Registration Failed",
          description: "An account with this email already exists",
          variant: "destructive",
        });
        return false;
      }

      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const referralCode = generateReferralCode();

      const insertData = {
        name: userData.name,
        email: userData.email.toLowerCase().trim(),
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
          description: "Failed to create account: " + error.message,
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
          .maybeSingle();

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
      
      console.log('=== REGISTRATION SUCCESSFUL ===');
      return true;
    } catch (error) {
      console.error('=== REGISTRATION ERROR ===', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred: " + (error as Error).message,
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out user');
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
