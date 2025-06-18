
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { login, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from, authLoading]);

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render login form if user is already authenticated
  if (user) {
    return null;
  }

  const validateForm = (): boolean => {
    const errors: string[] = [];
    
    if (!email.trim()) {
      errors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!password.trim()) {
      errors.push('Password is required');
    } else if (password.length < 3) {
      errors.push('Password must be at least 3 characters long');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Login form submitted');
    console.log('Form data:', { email: email.trim(), passwordLength: password.length });
    
    // Clear previous validation errors
    setValidationErrors([]);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('Starting login process...');
      const success = await login(email.trim(), password);
      
      if (success) {
        console.log('Login successful, navigating to:', from);
        navigate(from, { replace: true });
      } else {
        console.log('Login failed');
      }
    } catch (error) {
      console.error('Login submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/" className="flex items-center justify-center mb-4 hover:opacity-80 transition-opacity">
            <TrendingUp className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold">InvestX</h1>
          </Link>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your investment account</CardDescription>
        </CardHeader>
        <CardContent>
          {validationErrors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">Please fix the following errors:</span>
              </div>
              <ul className="text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.length > 0) setValidationErrors([]);
                }}
                required
                disabled={isLoading}
                className={validationErrors.some(e => e.includes('Email')) ? 'border-red-300' : ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.length > 0) setValidationErrors([]);
                }}
                required
                disabled={isLoading}
                className={validationErrors.some(e => e.includes('Password')) ? 'border-red-300' : ''}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
          </div>
          
          {/* Debug info for development */}
          <div className="mt-4 p-3 bg-gray-100 rounded-md text-xs text-gray-600">
            <p><strong>Debug Info:</strong></p>
            <p>Check browser console for detailed login logs</p>
            <p>Form validation: {validationErrors.length === 0 ? 'Passed' : 'Failed'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
