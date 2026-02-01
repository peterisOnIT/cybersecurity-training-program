"use client";

import { Sidebar } from "@/components/training/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Mail,
  MessageSquare,
  FileText,
  Search,
  ExternalLink,
  Phone,
  Clock,
} from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How do I reset my training progress?",
    answer:
      "You can reset your training progress by going to Settings > Training Preferences > Reset Progress. Please note that this action cannot be undone and will clear all your completed modules and scores.",
  },
  {
    question: "What happens if I fail a quiz?",
    answer:
      "If you score below 70% on a quiz, you can retake it immediately. There's no limit to the number of retakes. Your highest score will be recorded for reporting purposes.",
  },
  {
    question: "How often is the training content updated?",
    answer:
      "Our training content is reviewed and updated quarterly to reflect the latest cybersecurity threats and best practices. You'll be notified when new content is available.",
  },
  {
    question: "Can I access training on my mobile device?",
    answer:
      "Yes! CyberShield is fully responsive and works on all devices. You can access your training from any web browser on your phone, tablet, or computer.",
  },
  {
    question: "How do I get a certificate of completion?",
    answer:
      "Once you complete all required modules for your role, a certificate will be automatically generated. You can download it from the Progress page or request it from your administrator.",
  },
  {
    question: "Who can see my training progress?",
    answer:
      "Your direct manager and IT security administrators can view your training progress. Individual quiz scores are kept confidential unless you choose to share them.",
  },
];

const resources = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics of navigating the training platform",
    icon: FileText,
    href: "#",
  },
  {
    title: "Video Tutorials",
    description: "Step-by-step video walkthroughs",
    icon: MessageSquare,
    href: "#",
  },
  {
    title: "Security Best Practices",
    description: "Download our comprehensive security handbook",
    icon: FileText,
    href: "#",
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="pl-64">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Help & Support
            </h1>
            <p className="mt-2 text-muted-foreground">
              Find answers to common questions or get in touch with our support
              team.
            </p>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* FAQ Section */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Frequently Asked Questions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem
                        key={index}
                        value={`item-${index}`}
                        className="border-border"
                      >
                        <AccordionTrigger className="text-left text-card-foreground hover:text-primary">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  {filteredFaqs.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No results found for &quot;{searchQuery}&quot;
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Contact Form */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-card-foreground">
                    <Mail className="h-5 w-5 text-primary" />
                    Contact Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-card-foreground mb-2"
                      >
                        Subject
                      </label>
                      <Input
                        id="subject"
                        placeholder="What do you need help with?"
                        value={contactForm.subject}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            subject: e.target.value,
                          })
                        }
                        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-card-foreground mb-2"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Describe your issue or question in detail..."
                        rows={5}
                        value={contactForm.message}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            message: e.target.value,
                          })
                        }
                        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground resize-none"
                      />
                    </div>
                    <Button className="w-full sm:w-auto">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Links */}
              <Card className="border-border bg-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-card-foreground">
                    Quick Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.href}
                      className="flex items-start gap-3 rounded-lg p-3 bg-secondary/50 hover:bg-secondary transition-colors group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <resource.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors">
                          {resource.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {resource.description}
                        </p>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-semibold text-card-foreground">
                    Need Immediate Help?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          IT Helpdesk
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ext. 4357
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          Email Support
                        </p>
                        <p className="text-sm text-muted-foreground">
                          security@company.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">
                          Support Hours
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Mon-Fri, 8am-6pm EST
                        </p>
                      </div>
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
