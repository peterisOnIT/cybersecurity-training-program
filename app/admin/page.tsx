"use client";

import { useState } from "react";
import { Sidebar } from "@/components/training/sidebar";
import { mockMetrics } from "@/lib/training-data";
import {
  Users,
  GraduationCap,
  Target,
  AlertTriangle,
  TrendingUp,
  Shield,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Download,
  UserPlus,
  Building2,
  Clock,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Define colors for charts - must be actual color values, not CSS variables
const CHART_COLORS = {
  primary: "#4ade80",
  secondary: "#60a5fa",
  muted: "#6b7280",
  accent: "#f472b6",
  warning: "#fbbf24",
};

// Mock employee data
const employees = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    department: "Finance",
    role: "Analyst",
    progress: 100,
    score: 92,
    status: "completed",
    lastActive: "Today",
  },
  {
    id: 2,
    name: "Michael Park",
    email: "michael.park@company.com",
    department: "Sales",
    role: "Account Executive",
    progress: 75,
    score: 85,
    status: "in-progress",
    lastActive: "Yesterday",
  },
  {
    id: 3,
    name: "Emily Johnson",
    email: "emily.johnson@company.com",
    department: "HR",
    role: "HR Manager",
    progress: 100,
    score: 88,
    status: "completed",
    lastActive: "2 days ago",
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@company.com",
    department: "Operations",
    role: "Operations Lead",
    progress: 40,
    score: 72,
    status: "in-progress",
    lastActive: "Today",
  },
  {
    id: 5,
    name: "Lisa Thompson",
    email: "lisa.thompson@company.com",
    department: "IT",
    role: "System Admin",
    progress: 100,
    score: 95,
    status: "completed",
    lastActive: "Today",
  },
  {
    id: 6,
    name: "James Wilson",
    email: "james.wilson@company.com",
    department: "Sales",
    role: "Sales Manager",
    progress: 20,
    score: 0,
    status: "not-started",
    lastActive: "1 week ago",
  },
  {
    id: 7,
    name: "Amanda Garcia",
    email: "amanda.garcia@company.com",
    department: "Finance",
    role: "Controller",
    progress: 60,
    score: 78,
    status: "in-progress",
    lastActive: "3 days ago",
  },
  {
    id: 8,
    name: "Robert Lee",
    email: "robert.lee@company.com",
    department: "Operations",
    role: "Warehouse Manager",
    progress: 0,
    score: 0,
    status: "not-started",
    lastActive: "2 weeks ago",
  },
];

export default function AdminMetricsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const completionRate = Math.round(
    (mockMetrics.completedTraining / mockMetrics.totalEmployees) * 100
  );

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || emp.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" || emp.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-primary/10 text-primary border-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border-0">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-muted-foreground">
            <XCircle className="h-3 w-3 mr-1" />
            Not Started
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="pl-64">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Admin Dashboard
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Organization-wide training analytics and employee management.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="border-border bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
                <Button className="bg-primary text-primary-foreground">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Employees
                    </p>
                    <p className="mt-2 text-3xl font-bold text-card-foreground">
                      {mockMetrics.totalEmployees}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Enrolled in training
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Training Completion
                    </p>
                    <p className="mt-2 text-3xl font-bold text-card-foreground">
                      {completionRate}%
                    </p>
                    <p className="mt-1 text-sm text-primary flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +8% this month
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Average Score
                    </p>
                    <p className="mt-2 text-3xl font-bold text-card-foreground">
                      {mockMetrics.averageScore}%
                    </p>
                    <p className="mt-1 text-sm text-primary flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +3% improvement
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Phishing Test Pass Rate
                    </p>
                    <p className="mt-2 text-3xl font-bold text-card-foreground">
                      {mockMetrics.phishingTestPassRate}%
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {mockMetrics.incidentReports} incidents reported
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-secondary border border-border">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-card"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="employees"
                className="data-[state=active]:bg-card"
              >
                Employees
              </TabsTrigger>
              <TabsTrigger
                value="departments"
                className="data-[state=active]:bg-card"
              >
                Departments
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Charts Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Training Progress Over Time */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">
                      Training Progress Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        completed: {
                          label: "Completed",
                          color: CHART_COLORS.primary,
                        },
                        enrolled: {
                          label: "Enrolled",
                          color: CHART_COLORS.secondary,
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={mockMetrics.monthlyProgress}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                          />
                          <XAxis dataKey="month" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="completed"
                            stroke={CHART_COLORS.primary}
                            strokeWidth={2}
                            dot={{ fill: CHART_COLORS.primary }}
                            name="Completed"
                          />
                          <Line
                            type="monotone"
                            dataKey="enrolled"
                            stroke={CHART_COLORS.secondary}
                            strokeWidth={2}
                            dot={{ fill: CHART_COLORS.secondary }}
                            name="Enrolled"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {/* Department Performance */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">
                      Department Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        score: {
                          label: "Score",
                          color: CHART_COLORS.primary,
                        },
                        completion: {
                          label: "Completion",
                          color: CHART_COLORS.secondary,
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={mockMetrics.departmentScores}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#374151"
                          />
                          <XAxis dataKey="department" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar
                            dataKey="score"
                            fill={CHART_COLORS.primary}
                            name="Avg. Score"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="completion"
                            fill={CHART_COLORS.secondary}
                            name="Completion %"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Threat Detection */}
                <Card className="border-border bg-card lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-card-foreground flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      Threat Detection & Reporting
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockMetrics.threatTypes.map((threat) => {
                        const reportRate = Math.round(
                          (threat.reported / threat.incidents) * 100
                        );
                        return (
                          <div key={threat.type} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-card-foreground">
                                  {threat.type}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {threat.incidents} incidents
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    reportRate >= 80
                                      ? "text-primary"
                                      : reportRate >= 60
                                        ? "text-warning"
                                        : "text-destructive"
                                  )}
                                >
                                  {reportRate}% reported
                                </span>
                                {reportRate >= 80 ? (
                                  <CheckCircle2 className="h-4 w-4 text-primary" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-destructive" />
                                )}
                              </div>
                            </div>
                            <Progress value={reportRate} className="h-2" />
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 rounded-lg bg-primary/5 border border-primary/20 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                          <Shield className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-card-foreground">
                            Security Insight
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Phishing detection improved by 15% after the latest
                            training module rollout. Consider additional BEC
                            training for the Operations team.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Assessment */}
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        value: {
                          label: "Risk Level",
                        },
                      }}
                      className="h-[200px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Low Risk",
                                value: 65,
                                fill: CHART_COLORS.primary,
                              },
                              {
                                name: "Medium Risk",
                                value: 25,
                                fill: CHART_COLORS.warning,
                              },
                              { name: "High Risk", value: 10, fill: "#ef4444" },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {[
                              {
                                name: "Low Risk",
                                value: 65,
                                fill: CHART_COLORS.primary,
                              },
                              {
                                name: "Medium Risk",
                                value: 25,
                                fill: CHART_COLORS.warning,
                              },
                              { name: "High Risk", value: 10, fill: "#ef4444" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS.primary }}
                          />
                          <span className="text-muted-foreground">
                            Low Risk
                          </span>
                        </div>
                        <span className="font-medium text-card-foreground">
                          65%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: CHART_COLORS.warning }}
                          />
                          <span className="text-muted-foreground">
                            Medium Risk
                          </span>
                        </div>
                        <span className="font-medium text-card-foreground">
                          25%
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: "#ef4444" }}
                          />
                          <span className="text-muted-foreground">
                            High Risk
                          </span>
                        </div>
                        <span className="font-medium text-card-foreground">
                          10%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Employees Tab */}
            <TabsContent value="employees" className="space-y-6">
              {/* Search and Filters */}
              <Card className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-input border-border"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Select
                        value={departmentFilter}
                        onValueChange={setDepartmentFilter}
                      >
                        <SelectTrigger className="w-[160px] bg-input border-border">
                          <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger className="w-[150px] bg-input border-border">
                          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="in-progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="not-started">
                            Not Started
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employee List */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-card-foreground">
                      Employee Training Status
                    </CardTitle>
                    <Badge variant="secondary">
                      {filteredEmployees.length} employees
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-3 text-sm font-medium text-muted-foreground">
                            Employee
                          </th>
                          <th className="pb-3 text-sm font-medium text-muted-foreground">
                            Department
                          </th>
                          <th className="pb-3 text-sm font-medium text-muted-foreground">
                            Progress
                          </th>
                          <th className="pb-3 text-sm font-medium text-muted-foreground">
                            Score
                          </th>
                          <th className="pb-3 text-sm font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="pb-3 text-sm font-medium text-muted-foreground">
                            Last Active
                          </th>
                          <th className="pb-3 text-sm font-medium text-muted-foreground sr-only">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredEmployees.map((employee) => (
                          <tr
                            key={employee.id}
                            className="group hover:bg-secondary/50"
                          >
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                  {employee.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <div>
                                  <p className="font-medium text-card-foreground">
                                    {employee.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {employee.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4">
                              <div>
                                <p className="text-card-foreground">
                                  {employee.department}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {employee.role}
                                </p>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="w-32">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-card-foreground">
                                    {employee.progress}%
                                  </span>
                                </div>
                                <Progress
                                  value={employee.progress}
                                  className="h-2"
                                />
                              </div>
                            </td>
                            <td className="py-4">
                              {employee.score > 0 ? (
                                <div className="flex items-center gap-1">
                                  <Award
                                    className={cn(
                                      "h-4 w-4",
                                      employee.score >= 90
                                        ? "text-primary"
                                        : employee.score >= 70
                                          ? "text-blue-400"
                                          : "text-warning"
                                    )}
                                  />
                                  <span className="font-medium text-card-foreground">
                                    {employee.score}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="py-4">
                              {getStatusBadge(employee.status)}
                            </td>
                            <td className="py-4 text-sm text-muted-foreground">
                              {employee.lastActive}
                            </td>
                            <td className="py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">
                                      Employee actions
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    View Profile
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Reminder
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    View Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Reset Training
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Departments Tab */}
            <TabsContent value="departments" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {mockMetrics.departmentScores.map((dept) => (
                  <Card key={dept.department} className="border-border bg-card">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-card-foreground">
                          {dept.department}
                        </CardTitle>
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-secondary p-3">
                          <p className="text-xs text-muted-foreground">
                            Avg. Score
                          </p>
                          <p className="text-2xl font-bold text-card-foreground">
                            {dept.score}%
                          </p>
                        </div>
                        <div className="rounded-lg bg-secondary p-3">
                          <p className="text-xs text-muted-foreground">
                            Completion
                          </p>
                          <p className="text-2xl font-bold text-card-foreground">
                            {dept.completion}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Training Progress
                          </span>
                          <span className="font-medium text-card-foreground">
                            {dept.completion}%
                          </span>
                        </div>
                        <Progress value={dept.completion} className="h-2" />
                      </div>

                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Risk Level
                          </span>
                          <Badge
                            className={cn(
                              "border-0",
                              dept.score >= 85
                                ? "bg-primary/10 text-primary"
                                : dept.score >= 70
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-warning/10 text-warning"
                            )}
                          >
                            {dept.score >= 85
                              ? "Low"
                              : dept.score >= 70
                                ? "Medium"
                                : "High"}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full border-border bg-transparent"
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
