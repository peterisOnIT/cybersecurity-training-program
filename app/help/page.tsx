"use client";

import { useState } from "react";
import { Sidebar } from "@/components/training/sidebar";
import {
  HelpCircle,
  MessageSquare,
  Book,
  Mail,
  Phone,
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  Video,
  ExternalLink,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const faqs = [
  {
    id: 1,
    question: "How do I reset my progress for a training module?",
    answer:
      "To reset your progress, go to the specific module page, click on the settings icon, and select 'Reset Progress'. Please note that this action cannot be undone and all quiz scores for that module will be cleared.",
    category: "Training",
  },
  {
    id: 2,
    question: "What happens if I fail a quiz?",
    answer:
      "If you score below the passing threshold (typically 70%), you can retake the quiz after reviewing the lesson content. There's no limit to how many times you can attempt a quiz, but we recommend reviewing the material before each attempt.",
    category: "Quizzes",
  },
  {
    id: 3,
    question: "How do I download my completion certificate?",
    answer:
      "Once you complete all modules in a training track, a certificate will be automatically generated. You can download it from the Progress page by clicking on 'View Certificate' next to the completed track.",
    category: "Certificates",
  },
  {
    id: 4,
    question: "Can I access training on my mobile device?",
    answer:
      "Yes! CyberShield is fully responsive and works on all devices. You can access your training through any modern web browser on your smartphone or tablet.",
    category: "Access",
  },
  {
    id: 5,
    question: "How often is the training content updated?",
    answer:
      "Our security training content is reviewed and updated quarterly to reflect the latest threats and best practices. You'll receive notifications when new content is available or when existing modules are updated.",
    category: "Content",
  },
  {
    id: 6,
    question: "What should I do if I encounter a real security threat?",
    answer:
      "If you suspect a security incident, immediately contact your IT security team using the emergency contact methods provided by your organization. Do not attempt to investigate the threat yourself. Document what you observed and avoid clicking any suspicious links.",
    category: "Security",
  },
];

const resources = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics of navigating the training platform",
    icon: Book,
    type: "Guide",
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step tutorials for common tasks",
    icon: Video,
    type: "Video",
  },
  {
    title: "Security Best Practices",
    description: "Download our comprehensive security handbook",
    icon: FileText,
    type: "PDF",
  },
];

export default function HelpPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => setTicketSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="pl-64">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
            <p className="mt-2 text-muted-foreground">
              Find answers to common questions or get in touch with our support team.
            </p>
          </div>

          {/* Search Bar */}
          <Card className="border-border bg-card mb-8">
            <CardContent className="p-6">
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-input pl-12 py-6 text-base"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Resources */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">Quick Resources</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {resources.map((resource) => (
                    <Card
                      key={resource.title}
                      className="border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group"
                    >
                      <CardContent className="p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                          <resource.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-card-foreground">{resource.title}</h3>
                          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                        <Badge variant="outline" className="mt-3">
                          {resource.type}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* FAQs */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Frequently Asked Questions
                </h2>
                <Card className="border-border bg-card">
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {filteredFaqs.map((faq) => (
                        <div key={faq.id}>
                          <button
                            onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                            className="flex w-full items-center justify-between p-5 text-left hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <HelpCircle className="h-5 w-5 text-primary shrink-0" />
                              <span className="font-medium text-card-foreground">{faq.question}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="hidden sm:inline-flex">
                                {faq.category}
                              </Badge>
                              {expandedFaq === faq.id ? (
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>
                          </button>
                          {expandedFaq === faq.id && (
                            <div className="px-5 pb-5 pl-13">
                              <p className="text-sm text-muted-foreground ml-8">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      {filteredFaqs.length === 0 && (
                        <div className="p-8 text-center">
                          <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">
                            No FAQs match your search. Try a different query or contact support.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Support */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Contact Support
                  </CardTitle>
                  <CardDescription>
                    Can't find what you're looking for? Reach out to us.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Email Support</p>
                      <p className="text-xs text-muted-foreground">support@cybershield.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">Phone Support</p>
                      <p className="text-xs text-muted-foreground">1-800-SECURE (732-873)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Available Mon-Fri, 9AM-6PM EST</span>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Ticket */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Submit a Ticket</CardTitle>
                  <CardDescription>Report an issue or request assistance.</CardDescription>
                </CardHeader>
                <CardContent>
                  {ticketSubmitted ? (
                    <div className="flex flex-col items-center py-6 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-3">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </div>
                      <p className="font-medium text-card-foreground">Ticket Submitted!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        We'll get back to you within 24 hours.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitTicket} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">Subject</label>
                        <Input placeholder="Brief description of your issue" className="bg-input" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">Description</label>
                        <textarea
                          placeholder="Please provide details about your issue or question..."
                          className="min-h-[100px] w-full rounded-md border border-input bg-input px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Submit Ticket
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Security Emergency */}
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10">
                      <HelpCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">Security Emergency?</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        If you suspect an active security threat, contact your IT security team
                        immediately or call the emergency hotline.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10">
                        Emergency: 1-800-ALERT
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
