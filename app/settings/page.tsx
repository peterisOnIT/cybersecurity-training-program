"use client";

import { useState } from "react";
import { Sidebar } from "@/components/training/sidebar";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Key,
  Smartphone,
  Moon,
  Sun,
  Monitor,
  Save,
  Camera,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const settingsSections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("en");
  const [twoFactor, setTwoFactor] = useState(false);

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

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Settings Navigation */}
            <Card className="border-border bg-card h-fit lg:col-span-1">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        activeSection === section.id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <section.icon className="h-5 w-5" />
                      {section.label}
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>

            {/* Settings Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Section */}
              {activeSection === "profile" && (
                <>
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Profile Information</CardTitle>
                      <CardDescription>Update your personal information and profile picture.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Avatar */}
                      <div className="flex items-center gap-6">
                        <div className="relative">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-semibold text-primary">
                            JD
                          </div>
                          <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors">
                            <Camera className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">Profile Photo</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, GIF or PNG. Max size 2MB.
                          </p>
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-card-foreground">First Name</label>
                          <Input defaultValue="Jane" className="bg-input" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-card-foreground">Last Name</label>
                          <Input defaultValue="Doe" className="bg-input" />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <label className="text-sm font-medium text-card-foreground">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input defaultValue="jane.doe@company.com" className="bg-input pl-10" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-card-foreground">Department</label>
                          <Select defaultValue="finance">
                            <SelectTrigger className="bg-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="finance">Finance</SelectItem>
                              <SelectItem value="engineering">Engineering</SelectItem>
                              <SelectItem value="hr">Human Resources</SelectItem>
                              <SelectItem value="marketing">Marketing</SelectItem>
                              <SelectItem value="executive">Executive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-card-foreground">Role</label>
                          <Input defaultValue="Financial Analyst" className="bg-input" />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button className="gap-2">
                          <Save className="h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Notifications Section */}
              {activeSection === "notifications" && (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Notification Preferences</CardTitle>
                    <CardDescription>Choose how you want to be notified about training updates.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      {/* Email Notifications */}
                      <div className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Mail className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Receive training reminders and updates via email
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setEmailNotifications(!emailNotifications)}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            emailNotifications ? "bg-primary" : "bg-secondary"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                              emailNotifications ? "left-[22px]" : "left-0.5"
                            )}
                          />
                        </button>
                      </div>

                      {/* Push Notifications */}
                      <div className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Smartphone className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">Push Notifications</p>
                            <p className="text-sm text-muted-foreground">
                              Get notified about new modules and deadlines
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setPushNotifications(!pushNotifications)}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            pushNotifications ? "bg-primary" : "bg-secondary"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                              pushNotifications ? "left-[22px]" : "left-0.5"
                            )}
                          />
                        </button>
                      </div>

                      {/* Weekly Digest */}
                      <div className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Bell className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-card-foreground">Weekly Digest</p>
                            <p className="text-sm text-muted-foreground">
                              Receive a weekly summary of your training progress
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setWeeklyDigest(!weeklyDigest)}
                          className={cn(
                            "relative h-6 w-11 rounded-full transition-colors",
                            weeklyDigest ? "bg-primary" : "bg-secondary"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
                              weeklyDigest ? "left-[22px]" : "left-0.5"
                            )}
                          />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Section */}
              {activeSection === "security" && (
                <>
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Password</CardTitle>
                      <CardDescription>Update your password to keep your account secure.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">Current Password</label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input type="password" placeholder="Enter current password" className="bg-input pl-10" />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-card-foreground">New Password</label>
                          <Input type="password" placeholder="Enter new password" className="bg-input" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-card-foreground">Confirm Password</label>
                          <Input type="password" placeholder="Confirm new password" className="bg-input" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button>Update Password</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-card-foreground">Two-Factor Authentication</CardTitle>
                      <CardDescription>Add an extra layer of security to your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-card-foreground">Authenticator App</p>
                              {twoFactor && (
                                <Badge className="bg-primary/20 text-primary hover:bg-primary/30">Enabled</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Use an authenticator app to generate verification codes
                            </p>
                          </div>
                        </div>
                        <Button
                          variant={twoFactor ? "outline" : "default"}
                          onClick={() => setTwoFactor(!twoFactor)}
                        >
                          {twoFactor ? "Disable" : "Enable"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Appearance Section */}
              {activeSection === "appearance" && (
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Appearance</CardTitle>
                    <CardDescription>Customize how the platform looks for you.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Theme Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-card-foreground">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "light", label: "Light", icon: Sun },
                          { id: "dark", label: "Dark", icon: Moon },
                          { id: "system", label: "System", icon: Monitor },
                        ].map((option) => (
                          <button
                            key={option.id}
                            onClick={() => setTheme(option.id)}
                            className={cn(
                              "flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
                              theme === option.id
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <option.icon
                              className={cn(
                                "h-6 w-6",
                                theme === option.id ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                            <span
                              className={cn(
                                "text-sm font-medium",
                                theme === option.id ? "text-primary" : "text-muted-foreground"
                              )}
                            >
                              {option.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Language Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-card-foreground">Language</label>
                      <div className="relative max-w-xs">
                        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="bg-input pl-10">
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
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
