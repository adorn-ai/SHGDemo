import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { login } from '../../lib/auth';
import { toast } from 'sonner@2.0.3';
import { Lock, Mail } from 'lucide-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = login(email, password);
    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/admin');
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border-4 border-[#2D5016] bg-white">
        <CardHeader className="text-center border-b-4 border-[#6B9E4D] pb-6">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-[#2D5016] to-[#4A7C2C] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">SG</span>
          </div>
          <CardTitle className="text-2xl text-[#2D5016]">Admin Login</CardTitle>
          <p className="text-gray-600">St Gabriel SHG Management Portal</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-2 focus:border-[#2D5016]"
                  placeholder="admin@stgabriel"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-2 focus:border-[#2D5016]"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-[#2D5016] to-[#4A7C2C] hover:from-[#4A7C2C] hover:to-[#6B9E4D] shadow-lg">
              Sign In
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-[#6B9E4D]/30">
            <p className="text-sm font-semibold text-gray-700 mb-2">Test Credentials:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p><strong>Chairman:</strong> chairman@stgabriel / Chair@2024!</p>
              <p><strong>Secretary:</strong> secretary@stgabriel / Secr@2024!</p>
              <p><strong>Treasurer:</strong> treasurer@stgabriel / Treas@2024!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 text-gray-700 hover:text-[#2D5016] bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
      >
        ← Back to Home
      </button>
    </div>
  );
}