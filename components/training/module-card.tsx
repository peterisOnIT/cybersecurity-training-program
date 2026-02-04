"use client";

import React from "react"

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Module, UserProgress } from "@/lib/training-data";
import {
  Mail,
  AlertTriangle,
  FileText,
  Lock,
  Shield,
  Clock,
  CheckCircle2,
  ChevronRight,
  Wifi,
  Eye,
  Server,
  Smartphone,
  Users,
  Key,
  Globe,
  Database,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail,
  AlertTriangle,
  FileText,
  Lock,
  Shield,
  Wifi,
  Eye,
  Server,
  Smartphone,
  Users,
  Key,
  Globe,
  Database,
};

// Module-specific visual configurations
const moduleVisuals: Record<string, {
  gradient: string;
  pattern: string;
  accent: string;
  illustration: React.ReactNode;
}> = {
  phishing: {
    gradient: "from-red-500/20 via-orange-500/10 to-transparent",
    pattern: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]",
    accent: "text-red-400",
    illustration: (
      <div className="absolute right-4 top-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <Mail className="h-24 w-24 text-red-400/50" />
        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/30 animate-ping" />
      </div>
    ),
  },
  "social-engineering": {
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
    pattern: "bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))]",
    accent: "text-purple-400",
    illustration: (
      <div className="absolute right-4 top-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <Users className="h-20 w-20 text-purple-400/50" />
        <AlertTriangle className="absolute -bottom-2 right-0 h-10 w-10 text-yellow-400/50" />
      </div>
    ),
  },
  "data-handling": {
    gradient: "from-blue-500/20 via-cyan-500/10 to-transparent",
    pattern: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]",
    accent: "text-blue-400",
    illustration: (
      <div className="absolute right-4 top-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <Database className="h-16 w-16 text-blue-400/50" />
        <Lock className="absolute -bottom-1 right-4 h-12 w-12 text-cyan-400/50" />
      </div>
    ),
  },
  "password-security": {
    gradient: "from-emerald-500/20 via-green-500/10 to-transparent",
    pattern: "bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))]",
    accent: "text-emerald-400",
    illustration: (
      <div className="absolute right-4 top-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <Key className="h-20 w-20 text-emerald-400/50 rotate-45" />
        <div className="absolute top-8 right-8 flex gap-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 w-3 rounded-full bg-emerald-400/30 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      </div>
    ),
  },
  "incident-reporting": {
    gradient: "from-amber-500/20 via-yellow-500/10 to-transparent",
    pattern: "bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))]",
    accent: "text-amber-400",
    illustration: (
      <div className="absolute right-4 top-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <AlertTriangle className="h-20 w-20 text-amber-400/50 animate-pulse" />
        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-ping" />
      </div>
    ),
  },
  bec: {
    gradient: "from-rose-500/20 via-red-500/10 to-transparent",
    pattern: "bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))]",
    accent: "text-rose-400",
    illustration: (
      <div className="absolute right-4 top-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <Mail className="h-16 w-16 text-rose-400/50" />
        <Eye className="absolute -bottom-1 right-2 h-14 w-14 text-rose-300/50" />
        <div className="absolute top-0 right-0 h-3 w-3 rounded-full bg-rose-500/50 animate-ping" />
      </div>
    ),
  },
  default: {
    gradient: "from-primary/20 via-primary/5 to-transparent",
    pattern: "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]",
    accent: "text-primary",
    illustration: (
      <div className="absolute right-4 top-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
        <Shield className="h-20 w-20 text-primary/50" />
      </div>
    ),
  },
};

interface ModuleCardProps {
  module: Module;
  progress?: UserProgress[];
  className?: string;
}

export function ModuleCard({ module, progress = [], className }: ModuleCardProps) {
  const Icon = iconMap[module.icon] || Shield;
  const visual = moduleVisuals[module.id] || moduleVisuals.default;
  
  const completedLessons = module.lessons.filter((lesson) =>
    progress.some((p) => p.moduleId === module.id && p.lessonId === lesson.id && p.completed)
  ).length;
  
  const totalLessons = module.lessons.length;
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const isCompleted = completedLessons === totalLessons && totalLessons > 0;
  const isStarted = completedLessons > 0;

  return (
    <Link href={`/modules/${module.id}`}>
      <Card
        className={cn(
          "group relative overflow-hidden border-border bg-card transition-all duration-300 ease-out",
          "hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
          "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20",
          className
        )}
      >
        {/* Visual Banner */}
        <div className={cn(
          "absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100",
          visual.pattern,
          visual.gradient
        )}>
          {visual.illustration}
        </div>

        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }} />
        </div>

        <CardContent className="relative p-6 z-10">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300",
              "bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20",
              "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20"
            )}>
              <Icon className={cn("h-6 w-6 transition-all duration-300 group-hover:scale-110", visual.accent)} />
            </div>
            {isCompleted ? (
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 animate-in fade-in duration-300">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            ) : isStarted ? (
              <Badge variant="secondary" className="animate-pulse">
                <div className="mr-1.5 h-2 w-2 rounded-full bg-amber-400" />
                In Progress
              </Badge>
            ) : (
              <Badge variant="outline" className="border-muted-foreground/30">Not Started</Badge>
            )}
          </div>

          {/* Content */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
              {module.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {module.description}
            </p>
          </div>

          {/* Category Badge */}
          <div className="mt-3">
            <span className={cn(
              "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
              "bg-secondary/50 text-muted-foreground border border-border/50"
            )}>
              {module.category}
            </span>
          </div>

          {/* Meta */}
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{module.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>{totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span className="font-semibold tabular-nums">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary/80 border border-border/30">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  isCompleted 
                    ? "bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%] animate-shimmer"
                    : "bg-gradient-to-r from-primary to-emerald-400"
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {isCompleted ? "Review module" : isStarted ? "Continue learning" : "Start learning"}
            </span>
            <div className="flex items-center gap-1 text-primary opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
              <span className="text-sm font-medium">
                {isCompleted ? "Review" : isStarted ? "Continue" : "Start"}
              </span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
