import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { getSession } from '../../lib/auth';
import { toast } from 'sonner@2.0.3';
import { User, Lock, Settings as SettingsIcon, Percent, Calendar } from 'lucide-react';

export function Settings() {
  const session = getSession();
  
  const [profile, setProfile] = useState({
    name: session?.name || '',
    email: session?.email || '',
    phone: '',
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [loanConfig, setLoanConfig] = useState({
    minAmount: 10000,
    maxAmount: 500000,
    interestRate: 12,
    minTerm: 12,
    maxTerm: 60,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    loanApprovals: true,
    memberRegistrations: true,
    monthlyReports: false,
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    toast.success('Password changed successfully!');
    setPassword({ current: '', new: '', confirm: '' });
  };

  const handleLoanConfigUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Loan configuration updated!');
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      <div>
        <h1 className="text-2xl md:text-3xl text-[#2D5016]">Settings</h1>
        <p className="text-sm md:text-base text-gray-600">Manage your account and system configuration</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full gap-1">
          <TabsTrigger value="profile" className="text-xs md:text-sm">
            <User className="mr-1 md:mr-2" size={14} />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs md:text-sm">
            <Lock className="mr-1 md:mr-2" size={14} />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          {(session?.role === 'chairman' || session?.role === 'treasurer') && (
            <TabsTrigger value="loan" className="text-xs md:text-sm">
              <SettingsIcon className="mr-1 md:mr-2" size={14} />
              <span className="hidden sm:inline">Loan</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications" className="text-xs md:text-sm">
            <SettingsIcon className="mr-1 md:mr-2" size={14} />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-xs md:text-sm">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="text-sm md:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="text-sm md:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-xs md:text-sm">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="text-sm md:text-base"
                  />
                </div>

                <div className="pt-2">
                  <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs md:text-sm text-gray-600 mb-2">
                      <strong>Role:</strong> <span className="capitalize">{session?.role}</span>
                    </p>
                    <p className="text-xs md:text-sm text-gray-600 break-words">
                      <strong>User ID:</strong> {session?.userId}
                    </p>
                  </div>
                </div>

                <Button type="submit" className="bg-[#2D5016] hover:bg-[#4A7C2C] w-full md:w-auto">
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="current" className="text-xs md:text-sm">Current Password</Label>
                  <Input
                    id="current"
                    type="password"
                    value={password.current}
                    onChange={(e) => setPassword({ ...password, current: e.target.value })}
                    required
                    className="text-sm md:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="new" className="text-xs md:text-sm">New Password</Label>
                  <Input
                    id="new"
                    type="password"
                    value={password.new}
                    onChange={(e) => setPassword({ ...password, new: e.target.value })}
                    required
                    className="text-sm md:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="confirm" className="text-xs md:text-sm">Confirm New Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={password.confirm}
                    onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                    required
                    className="text-sm md:text-base"
                  />
                </div>

                <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs md:text-sm text-blue-800">
                    Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.
                  </p>
                </div>

                <Button type="submit" className="bg-[#2D5016] hover:bg-[#4A7C2C] w-full md:w-auto">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Two-Factor Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <p className="font-medium text-sm md:text-base">Enable 2FA (Optional)</p>
                  <p className="text-xs md:text-sm text-gray-600">Add an extra layer of security to your account</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {(session?.role === 'chairman' || session?.role === 'treasurer') && (
          <TabsContent value="loan">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#2D5016] text-base md:text-lg">Loan Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoanConfigUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minAmount" className="text-xs md:text-sm">
                        <Percent className="inline mr-2" size={14} />
                        Minimum Loan Amount (KES)
                      </Label>
                      <Input
                        id="minAmount"
                        type="number"
                        value={loanConfig.minAmount}
                        onChange={(e) => setLoanConfig({ ...loanConfig, minAmount: parseInt(e.target.value) })}
                        className="text-sm md:text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxAmount" className="text-xs md:text-sm">
                        <Percent className="inline mr-2" size={14} />
                        Maximum Loan Amount (KES)
                      </Label>
                      <Input
                        id="maxAmount"
                        type="number"
                        value={loanConfig.maxAmount}
                        onChange={(e) => setLoanConfig({ ...loanConfig, maxAmount: parseInt(e.target.value) })}
                        className="text-sm md:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="interestRate" className="text-xs md:text-sm">
                      <Percent className="inline mr-2" size={14} />
                      Interest Rate (% per annum)
                    </Label>
                    <Input
                      id="interestRate"
                      type="number"
                      step="0.1"
                      value={loanConfig.interestRate}
                      onChange={(e) => setLoanConfig({ ...loanConfig, interestRate: parseFloat(e.target.value) })}
                      className="text-sm md:text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minTerm" className="text-xs md:text-sm">
                        <Calendar className="inline mr-2" size={14} />
                        Minimum Term (months)
                      </Label>
                      <Input
                        id="minTerm"
                        type="number"
                        value={loanConfig.minTerm}
                        onChange={(e) => setLoanConfig({ ...loanConfig, minTerm: parseInt(e.target.value) })}
                        className="text-sm md:text-base"
                      />
                    </div>

                    <div>
                      <Label htmlFor="maxTerm" className="text-xs md:text-sm">
                        <Calendar className="inline mr-2" size={14} />
                        Maximum Term (months)
                      </Label>
                      <Input
                        id="maxTerm"
                        type="number"
                        value={loanConfig.maxTerm}
                        onChange={(e) => setLoanConfig({ ...loanConfig, maxTerm: parseInt(e.target.value) })}
                        className="text-sm md:text-base"
                      />
                    </div>
                  </div>

                  <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs md:text-sm text-yellow-800">
                      <strong>Note:</strong> Changes to loan configuration will apply to new loan applications only.
                    </p>
                  </div>

                  <Button type="submit" className="bg-[#2D5016] hover:bg-[#4A7C2C] w-full md:w-auto">
                    Save Configuration
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#2D5016] text-base md:text-lg">Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm md:text-base">Email Notifications</p>
                  <p className="text-xs md:text-sm text-gray-600">Receive email alerts for important updates</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, emailNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm md:text-base">Loan Approvals</p>
                  <p className="text-xs md:text-sm text-gray-600">Get notified when loans require your approval</p>
                </div>
                <Switch
                  checked={notifications.loanApprovals}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, loanApprovals: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm md:text-base">Member Registrations</p>
                  <p className="text-xs md:text-sm text-gray-600">Receive alerts for new member registrations</p>
                </div>
                <Switch
                  checked={notifications.memberRegistrations}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, memberRegistrations: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm md:text-base">Monthly Reports</p>
                  <p className="text-xs md:text-sm text-gray-600">Receive monthly performance reports via email</p>
                </div>
                <Switch
                  checked={notifications.monthlyReports}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, monthlyReports: checked })
                  }
                />
              </div>

              <Button
                onClick={() => toast.success('Notification preferences saved!')}
                className="bg-[#2D5016] hover:bg-[#4A7C2C] w-full md:w-auto"
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}