"use client";

import { useState } from "react";
import { Sidebar } from "@/components/training/sidebar";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Key,
  Smartphone,
  Mail,
  Save,
  CheckCircle2,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@company.com",
    department: "Finance",
    role: "Analyst",
    phone: "+1 (555) 123-4567",
  });

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    trainingDeadlines: true,
    newModules: true,
    weeklyDigest: false,
    securityAlerts: true,
    pushNotifications: false,
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: true,
    sessionTimeout: "30",
    loginAlerts: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="pl-64">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger value="profile" className="data-[state=active]:bg-card">
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-card">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="security" className="data-[state=active]:bg-card">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-card">
                <Palette className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
                      JD
                    </div>
                    <div>
                      <Button variant="outline" className="border-border bg-transparent">
                        Change Photo
                      </Button>
                      <p className="mt-2 text-sm text-muted-foreground">
                        JPG, PNG or GIF. Max size 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) =>
                          setProfile({ ...profile, firstName: e.target.value })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) =>
                          setProfile({ ...profile, lastName: e.target.value })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) =>
                          setProfile({ ...profile, phone: e.target.value })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={profile.department}>
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="HR">Human Resources</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Job Role</Label>
                      <Input
                        id="role"
                        value={profile.role}
                        onChange={(e) =>
                          setProfile({ ...profile, role: e.target.value })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                  {saved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Email Notifications</CardTitle>
                  <CardDescription>
                    Choose what email notifications you want to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-card-foreground">Training Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive reminders about incomplete training modules.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.emailReminders}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailReminders: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-card-foreground">Deadline Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when training deadlines are approaching.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.trainingDeadlines}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, trainingDeadlines: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-card-foreground">New Module Announcements</Label>
                      <p className="text-sm text-muted-foreground">
                        Be the first to know when new training content is available.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newModules}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, newModules: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-card-foreground">Weekly Progress Digest</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a weekly summary of your training progress.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyDigest}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, weeklyDigest: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label className="text-card-foreground">Security Alerts</Label>
                        <Badge variant="secondary" className="text-xs">Recommended</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Important security notifications and threat updates.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.securityAlerts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, securityAlerts: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Push Notifications</CardTitle>
                  <CardDescription>
                    Manage browser and mobile push notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-card-foreground">Enable Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive instant notifications in your browser.
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, pushNotifications: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                  {saved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Password</CardTitle>
                  <CardDescription>
                    Change your password to keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      className="bg-input border-border max-w-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      className="bg-input border-border max-w-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="bg-input border-border max-w-md"
                    />
                  </div>
                  <Button variant="outline" className="border-border mt-2 bg-transparent">
                    <Key className="h-4 w-4 mr-2" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Smartphone className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">Authenticator App</p>
                        <p className="text-sm text-muted-foreground">
                          Use an authenticator app to generate verification codes.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {security.twoFactorEnabled ? (
                        <Badge className="bg-primary/10 text-primary border-0">Enabled</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                      <Switch
                        checked={security.twoFactorEnabled}
                        onCheckedChange={(checked) =>
                          setSecurity({ ...security, twoFactorEnabled: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                        <Mail className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-card-foreground">Email Verification</p>
                        <p className="text-sm text-muted-foreground">
                          Receive a verification code via email.
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" className="border-border bg-transparent">
                      Configure
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Session Settings</CardTitle>
                  <CardDescription>
                    Manage your session and login preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-card-foreground">Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically log out after a period of inactivity.
                      </p>
                    </div>
                    <Select
                      value={security.sessionTimeout}
                      onValueChange={(value) =>
                        setSecurity({ ...security, sessionTimeout: value })
                      }
                    >
                      <SelectTrigger className="w-[140px] bg-input border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="space-y-0.5">
                      <Label className="text-card-foreground">Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when your account is accessed from a new device.
                      </p>
                    </div>
                    <Switch
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) =>
                        setSecurity({ ...security, loginAlerts: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/50 bg-card">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible account actions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-card-foreground">Sign Out All Devices</p>
                      <p className="text-sm text-muted-foreground">
                        Sign out from all devices except this one.
                      </p>
                    </div>
                    <Button variant="destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Appearance</CardTitle>
                  <CardDescription>
                    Customize how the application looks and feels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-card-foreground">Theme</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <button className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-primary bg-card">
                        <div className="w-full h-12 rounded bg-[#1a1f2e] border border-border" />
                        <span className="text-sm font-medium text-card-foreground">Dark</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:border-muted-foreground/50 transition-colors">
                        <div className="w-full h-12 rounded bg-white border border-gray-200" />
                        <span className="text-sm font-medium text-card-foreground">Light</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card hover:border-muted-foreground/50 transition-colors">
                        <div className="w-full h-12 rounded bg-gradient-to-r from-[#1a1f2e] to-white border border-border" />
                        <span className="text-sm font-medium text-card-foreground">System</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Language & Region</CardTitle>
                  <CardDescription>
                    Set your language and regional preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="language">Language</Label>
                      <Select defaultValue="en">
                        <SelectTrigger className="bg-input border-border">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English (US)</SelectItem>
                          <SelectItem value="en-gb">English (UK)</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="est">
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                          <SelectItem value="mst">Mountain Time (MT)</SelectItem>
                          <SelectItem value="cst">Central Time (CT)</SelectItem>
                          <SelectItem value="est">Eastern Time (ET)</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Training Preferences</CardTitle>
                  <CardDescription>
                    Customize your learning experience.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-card-foreground">Auto-play Videos</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically play training videos when opening modules.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="space-y-0.5">
                      <Label className="text-card-foreground">Show Hints</Label>
                      <p className="text-sm text-muted-foreground">
                        Display helpful hints during quizzes and scenarios.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="space-y-0.5">
                      <Label className="text-card-foreground">Accessibility Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable screen reader support and keyboard navigation.
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                  {saved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
