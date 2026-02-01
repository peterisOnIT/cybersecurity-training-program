"use client";

import { useState } from "react";
import { Sidebar } from "@/components/training/sidebar";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  FileText,
  ChevronDown,
  ExternalLink,
  Search,
  BookOpen,
  Shield,
  AlertTriangle,
  Key,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "Getting Started",
    icon: BookOpen,
    questions: [
      {
        q: "How do I start my first training module?",
        a: "Navigate to the Training Modules section from the sidebar. You'll see a list of available modules. Click on any module to start learning. We recommend beginning with the Phishing Awareness module as it covers fundamental security concepts.",
      },
      {
        q: "How long does each module take to complete?",
        a: "Each module typically takes 15-30 minutes to complete. You can see the estimated duration on each module card. You can pause and resume your progress at any time.",
      },
      {
        q: "Can I retake a module if I fail the quiz?",
        a: "Yes! You can retake any module as many times as needed. Your highest score will be recorded. We encourage reviewing the material before retaking to improve your understanding.",
      },
    ],
  },
  {
    category: "Security Topics",
    icon: Shield,
    questions: [
      {
        q: "What should I do if I receive a suspicious email?",
        a: "Do not click any links or download attachments. Report the email using your organization's reporting mechanism (usually a 'Report Phishing' button). If unsure, contact your IT security team directly.",
      },
      {
        q: "How can I create a strong password?",
        a: "Use at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols. Avoid personal information or common words. Consider using a passphrase - a series of random words that's easy to remember but hard to guess.",
      },
      {
        q: "What is multi-factor authentication (MFA)?",
        a: "MFA adds an extra layer of security by requiring two or more verification methods: something you know (password), something you have (phone), or something you are (fingerprint). Always enable MFA when available.",
      },
    ],
  },
  {
    category: "Account & Progress",
    icon: Users,
    questions: [
      {
        q: "How do I track my training progress?",
        a: "Visit the My Progress section from the sidebar to see your completed modules, scores, and achievements. You can also view your overall compliance status and upcoming deadlines.",
      },
      {
        q: "Will my progress be saved if I close the browser?",
        a: "Yes, your progress is automatically saved. You can resume any module from where you left off. Your quiz answers and completion status are stored securely.",
      },
      {
        q: "How do I update my profile information?",
        a: "Go to Settings from the sidebar. Under the Profile tab, you can update your name, email, department, and other personal information.",
      },
    ],
  },
  {
    category: "Reporting Incidents",
    icon: AlertTriangle,
    questions: [
      {
        q: "How do I report a security incident?",
        a: "For urgent security incidents, contact your IT Security team immediately. For non-urgent concerns, use the incident reporting form in your organization's security portal or email security@company.com.",
      },
      {
        q: "What qualifies as a security incident?",
        a: "Security incidents include: suspected phishing attempts, unauthorized access, lost or stolen devices, suspicious software or popups, data breaches, and any unusual system behavior.",
      },
    ],
  },
];

const resources = [
  {
    title: "Security Best Practices Guide",
    description: "Comprehensive guide to staying secure online",
    icon: FileText,
    link: "#",
  },
  {
    title: "Phishing Examples Library",
    description: "Real-world phishing examples to learn from",
    icon: Mail,
    link: "#",
  },
  {
    title: "Password Manager Setup",
    description: "How to set up and use a password manager",
    icon: Key,
    link: "#",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="pl-64">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
            <p className="mt-2 text-muted-foreground">
              Find answers to common questions and get assistance.
            </p>
          </div>

          {/* Search */}
          <Card className="border-border bg-card mb-8">
            <CardContent className="p-6">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-6 text-lg bg-input border-border"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* FAQs */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-semibold text-foreground">Frequently Asked Questions</h2>
              
              {filteredFaqs.length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No results found for "{searchQuery}". Try a different search term.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFaqs.map((category) => (
                  <Card key={category.category} className="border-border bg-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-card-foreground flex items-center gap-2">
                        <category.icon className="h-5 w-5 text-primary" />
                        {category.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((item, index) => (
                          <AccordionItem key={index} value={`${category.category}-${index}`} className="border-border">
                            <AccordionTrigger className="text-card-foreground hover:text-primary text-left">
                              {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Support */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Contact Support</CardTitle>
                  <CardDescription>
                    Need additional help? Reach out to our team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start border-border bg-transparent">
                    <MessageCircle className="h-4 w-4 mr-3 text-primary" />
                    Live Chat
                    <Badge variant="secondary" className="ml-auto">Online</Badge>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-border bg-transparent">
                    <Mail className="h-4 w-4 mr-3 text-primary" />
                    Email Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-border bg-transparent">
                    <Phone className="h-4 w-4 mr-3 text-primary" />
                    Call IT Helpdesk
                  </Button>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-card-foreground">IT Security Hotline</span>
                      <br />
                      For urgent security incidents
                    </p>
                    <p className="mt-2 text-lg font-semibold text-primary">
                      1-800-SEC-HELP
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Resources</CardTitle>
                  <CardDescription>
                    Additional learning materials.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {resources.map((resource) => (
                    <a
                      key={resource.title}
                      href={resource.link}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary transition-colors group"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <resource.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                          {resource.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {resource.description}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </a>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Quick Security Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Never share your password with anyone
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Verify email senders before clicking links
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Lock your computer when stepping away
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      Report suspicious activity immediately
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
