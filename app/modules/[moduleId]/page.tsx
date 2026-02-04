"use client";

import React from "react"

import { useState, use } from "react";
import Link from "next/link";
import { Sidebar, MobileHeader } from "@/components/training/sidebar";
import { modules, mockUserProgress } from "@/lib/training-data";
import type { Lesson, QuizQuestion, ScenarioOption } from "@/lib/training-data";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Play,
  FileText,
  HelpCircle,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ContentStep = "content" | "scenario" | "quiz" | "complete";

export default function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = use(params);
  const module = modules.find((m) => m.id === moduleId);

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [contentStep, setContentStep] = useState<ContentStep>("content");
  const [selectedScenarioOption, setSelectedScenarioOption] =
    useState<ScenarioOption | null>(null);
  const [showScenarioFeedback, setShowScenarioFeedback] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(
      mockUserProgress
        .filter((p) => p.moduleId === moduleId && p.completed)
        .map((p) => p.lessonId)
    )
  );

  if (!module) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold text-foreground">
              Module not found
            </h1>
            <Link href="/modules">
              <Button className="mt-4">Back to Modules</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentLesson = module.lessons[currentLessonIndex];
  const progress =
    ((currentLessonIndex + (contentStep === "complete" ? 1 : 0)) /
      module.lessons.length) *
    100;

  const handleScenarioSelect = (option: ScenarioOption) => {
    setSelectedScenarioOption(option);
    setShowScenarioFeedback(true);
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleNextStep = () => {
    if (contentStep === "content") {
      if (currentLesson.scenario) {
        setContentStep("scenario");
      } else if (currentLesson.quiz.length > 0) {
        setContentStep("quiz");
      } else {
        completeLesson();
      }
    } else if (contentStep === "scenario") {
      if (currentLesson.quiz.length > 0) {
        setContentStep("quiz");
        setSelectedScenarioOption(null);
        setShowScenarioFeedback(false);
      } else {
        completeLesson();
      }
    } else if (contentStep === "quiz") {
      setShowQuizResults(true);
    }
  };

  const completeLesson = () => {
    setCompletedLessons((prev) => new Set([...prev, currentLesson.id]));
    setContentStep("complete");
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < module.lessons.length - 1) {
      setCurrentLessonIndex((prev) => prev + 1);
      setContentStep("content");
      setSelectedScenarioOption(null);
      setShowScenarioFeedback(false);
      setQuizAnswers({});
      setShowQuizResults(false);
    }
  };

  const handleLessonSelect = (index: number) => {
    setCurrentLessonIndex(index);
    setContentStep("content");
    setSelectedScenarioOption(null);
    setShowScenarioFeedback(false);
    setQuizAnswers({});
    setShowQuizResults(false);
  };

  const getQuizScore = () => {
    const correct = currentLesson.quiz.filter(
      (q) => quizAnswers[q.id] === q.correctAnswer
    ).length;
    return Math.round((correct / currentLesson.quiz.length) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />
      <Sidebar />

      <main id="main-content" className="pt-14 lg:pt-0 lg:pl-64">
        <div className="px-4 py-6 lg:px-8 lg:py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/modules"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:translate-x-[-4px] transition-all mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Modules
            </Link>

            {/* Visual header banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 p-6 mb-6">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }} />
              
              {/* Animated orb */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-3 bg-primary/20 text-primary border-primary/30">
                      {module.category}
                    </Badge>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                      {module.title}
                    </h1>
                    <p className="text-muted-foreground max-w-2xl leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-secondary/50 border border-border/50">
                      <Clock className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">{module.duration}</span>
                      <span className="text-xs text-muted-foreground">Duration</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 p-3 rounded-lg bg-secondary/50 border border-border/50">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-foreground">{module.lessons.length}</span>
                      <span className="text-xs text-muted-foreground">Lessons</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground font-medium">Module Progress</span>
                <span className="font-bold text-primary tabular-nums">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {completedLessons.size} of {module.lessons.length} lessons completed
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Lesson Sidebar */}
            <div className="lg:col-span-1">
              <Card className="border-border bg-card sticky top-8">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-card-foreground">
                    Lessons
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {module.lessons.map((lesson, index) => {
                    const isCompleted = completedLessons.has(lesson.id);
                    const isCurrent = index === currentLessonIndex;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonSelect(index)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors",
                          isCurrent
                            ? "bg-primary/10 border border-primary/20"
                            : "hover:bg-secondary"
                        )}
                      >
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : isCurrent
                                ? "bg-primary/20 text-primary"
                                : "bg-secondary text-muted-foreground"
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm font-medium truncate",
                              isCurrent
                                ? "text-primary"
                                : "text-card-foreground"
                            )}
                          >
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {lesson.scenario && (
                              <Badge
                                variant="outline"
                                className="text-xs py-0 h-5"
                              >
                                Scenario
                              </Badge>
                            )}
                            {lesson.quiz.length > 0 && (
                              <Badge
                                variant="outline"
                                className="text-xs py-0 h-5"
                              >
                                Quiz
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <Card className="border-border bg-card">
                <CardContent className="p-8">
                  {/* Content Step Indicator */}
                  <div className="flex items-center gap-4 mb-8 pb-6 border-b border-border">
                    <StepIndicator
                      icon={FileText}
                      label="Learn"
                      isActive={contentStep === "content"}
                      isCompleted={
                        contentStep !== "content" ||
                        completedLessons.has(currentLesson.id)
                      }
                    />
                    {currentLesson.scenario && (
                      <StepIndicator
                        icon={Play}
                        label="Scenario"
                        isActive={contentStep === "scenario"}
                        isCompleted={
                          contentStep === "quiz" || contentStep === "complete"
                        }
                      />
                    )}
                    {currentLesson.quiz.length > 0 && (
                      <StepIndicator
                        icon={HelpCircle}
                        label="Quiz"
                        isActive={contentStep === "quiz"}
                        isCompleted={contentStep === "complete"}
                      />
                    )}
                    <StepIndicator
                      icon={CheckCircle2}
                      label="Complete"
                      isActive={contentStep === "complete"}
                      isCompleted={false}
                    />
                  </div>

                  {/* Content */}
                  {contentStep === "content" && (
                    <LessonContent
                      lesson={currentLesson}
                      onNext={handleNextStep}
                    />
                  )}

                  {contentStep === "scenario" && currentLesson.scenario && (
                    <ScenarioSection
                      scenario={currentLesson.scenario}
                      selectedOption={selectedScenarioOption}
                      showFeedback={showScenarioFeedback}
                      onSelect={handleScenarioSelect}
                      onNext={handleNextStep}
                    />
                  )}

                  {contentStep === "quiz" && (
                    <QuizSection
                      questions={currentLesson.quiz}
                      answers={quizAnswers}
                      showResults={showQuizResults}
                      onAnswer={handleQuizAnswer}
                      onSubmit={handleNextStep}
                      onComplete={() => completeLesson()}
                      score={getQuizScore()}
                    />
                  )}

                  {contentStep === "complete" && (
                    <CompletionSection
                      lesson={currentLesson}
                      isLastLesson={
                        currentLessonIndex === module.lessons.length - 1
                      }
                      onNextLesson={handleNextLesson}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StepIndicator({
  icon: Icon,
  label,
  isActive,
  isCompleted,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : isCompleted
              ? "bg-primary/20 text-primary"
              : "bg-secondary text-muted-foreground"
        )}
      >
        {isCompleted && !isActive ? (
          <Check className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </div>
      <span
        className={cn(
          "text-sm font-medium",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground ml-2 last:hidden" />
    </div>
  );
}

function LessonContent({
  lesson,
  onNext,
}: {
  lesson: Lesson;
  onNext: () => void;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Lesson title with icon */}
      <div className="flex items-start gap-4 mb-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {lesson.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Read through the content below, then continue to the next step.</p>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        {lesson.content.split("\n\n").map((paragraph, index) => {
          if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
            return (
              <div key={index} className="flex items-center gap-3 mt-8 mb-4">
                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-primary to-emerald-400" />
                <h3 className="text-lg font-semibold text-foreground">
                  {paragraph.replace(/\*\*/g, "")}
                </h3>
              </div>
            );
          }
          if (paragraph.startsWith("- ") || paragraph.startsWith("1. ")) {
            const isOrdered = paragraph.startsWith("1. ");
            const items = paragraph.split("\n").map((item) =>
              item.replace(/^[-\d.]\s*/, "").replace(/\*\*/g, "")
            );
            const ListTag = isOrdered ? "ol" : "ul";
            return (
              <div key={index} className="my-4 rounded-lg bg-secondary/30 border border-border/50 p-4">
                <ListTag
                  className={cn(
                    "space-y-3",
                    isOrdered ? "list-decimal" : "list-none",
                    "pl-4"
                  )}
                >
                  {items.map((item, i) => (
                    <li key={i} className="text-muted-foreground flex items-start gap-2">
                      {!isOrdered && (
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      <span>{item}</span>
                    </li>
                  ))}
                </ListTag>
              </div>
            );
          }
          return (
            <p key={index} className="text-muted-foreground leading-relaxed my-4">
              {paragraph.split("**").map((part, i) =>
                i % 2 === 1 ? (
                  <strong key={i} className="text-primary font-semibold">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        })}
      </div>

      {/* Continue button */}
      <div className="mt-10 pt-6 border-t border-border flex justify-end">
        <Button onClick={onNext} size="lg" className="bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-lg shadow-primary/20">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ScenarioSection({
  scenario,
  selectedOption,
  showFeedback,
  onSelect,
  onNext,
}: {
  scenario: Lesson["scenario"];
  selectedOption: ScenarioOption | null;
  showFeedback: boolean;
  onSelect: (option: ScenarioOption) => void;
  onNext: () => void;
}) {
  if (!scenario) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start gap-4 mb-8">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20">
          <Play className="h-6 w-6 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Interactive Scenario
          </h2>
          <p className="text-sm text-muted-foreground">
            Apply what you've learned to a real-world situation
          </p>
        </div>
      </div>

      {/* Scenario description with visual treatment */}
      <Card className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-amber-400" />
            <span className="text-sm font-medium text-amber-400">Situation</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-3">
            {scenario.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{scenario.description}</p>
        </CardContent>
      </Card>

      <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-primary" />
        What would you do?
      </h4>

      <div className="space-y-3">
        {scenario.options.map((option, index) => {
          const isSelected = selectedOption?.id === option.id;
          const showResult = showFeedback && isSelected;
          const isCorrectAnswer = showFeedback && option.isCorrect;

          return (
            <button
              key={option.id}
              onClick={() => !showFeedback && onSelect(option)}
              disabled={showFeedback}
              className={cn(
                "w-full text-left rounded-xl border p-5 transition-all duration-300",
                isSelected
                  ? option.isCorrect
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-destructive bg-destructive/10 shadow-lg shadow-destructive/10"
                  : showFeedback && isCorrectAnswer
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-card hover:border-primary/50 hover:bg-secondary/30 hover:translate-x-1",
                showFeedback && !isSelected && !isCorrectAnswer && "opacity-40"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-all duration-300",
                    isSelected
                      ? option.isCorrect
                        ? "bg-primary text-primary-foreground scale-110"
                        : "bg-destructive text-destructive-foreground scale-110"
                      : showFeedback && isCorrectAnswer
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {showResult || (showFeedback && isCorrectAnswer) ? (
                    option.isCorrect ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )
                  ) : (
                    option.id.toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-card-foreground leading-relaxed">
                    {option.text}
                  </p>
                  {(showResult || (showFeedback && isCorrectAnswer)) && (
                    <div
                      className={cn(
                        "mt-3 p-3 rounded-lg text-sm animate-in fade-in slide-in-from-top-2 duration-300",
                        option.isCorrect
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {option.isCorrect ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span className="font-semibold">
                          {option.isCorrect ? "Correct!" : "Not quite right"}
                        </span>
                      </div>
                      <p>{option.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className="mt-10 pt-6 border-t border-border flex justify-end">
          <Button onClick={onNext} size="lg" className="bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90 shadow-lg shadow-primary/20">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

function QuizSection({
  questions,
  answers,
  showResults,
  onAnswer,
  onSubmit,
  onComplete,
  score,
}: {
  questions: QuizQuestion[];
  answers: Record<string, number>;
  showResults: boolean;
  onAnswer: (questionId: string, answerIndex: number) => void;
  onSubmit: () => void;
  onComplete: () => void;
  score: number;
}) {
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <HelpCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Knowledge Check
          </h2>
          <p className="text-sm text-muted-foreground">
            Test your understanding
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((question, qIndex) => {
          const selectedAnswer = answers[question.id];
          const isCorrect = selectedAnswer === question.correctAnswer;

          return (
            <div key={question.id} className="space-y-4">
              <h3 className="font-medium text-foreground">
                <span className="text-primary mr-2">{qIndex + 1}.</span>
                {question.question}
              </h3>

              <div className="space-y-2">
                {question.options.map((option, oIndex) => {
                  const isSelected = selectedAnswer === oIndex;
                  const isCorrectAnswer =
                    showResults && oIndex === question.correctAnswer;

                  return (
                    <button
                      key={oIndex}
                      onClick={() => !showResults && onAnswer(question.id, oIndex)}
                      disabled={showResults}
                      className={cn(
                        "w-full text-left rounded-lg border p-3 transition-all",
                        showResults
                          ? isCorrectAnswer
                            ? "border-primary bg-primary/10"
                            : isSelected && !isCorrect
                              ? "border-destructive bg-destructive/10"
                              : "border-border bg-card opacity-50"
                          : isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                            showResults
                              ? isCorrectAnswer
                                ? "border-primary bg-primary"
                                : isSelected
                                  ? "border-destructive bg-destructive"
                                  : "border-border"
                              : isSelected
                                ? "border-primary bg-primary"
                                : "border-border"
                          )}
                        >
                          {(isSelected || isCorrectAnswer) && showResults && (
                            isCorrectAnswer ? (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            ) : (
                              <X className="h-3 w-3 text-destructive-foreground" />
                            )
                          )}
                          {isSelected && !showResults && (
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                          )}
                        </div>
                        <span className="text-sm text-card-foreground">
                          {option}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {showResults && (
                <div
                  className={cn(
                    "flex items-start gap-2 rounded-lg p-3",
                    isCorrect ? "bg-primary/10" : "bg-secondary"
                  )}
                >
                  <AlertCircle
                    className={cn(
                      "h-4 w-4 mt-0.5",
                      isCorrect ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        {showResults ? (
          <>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold",
                  score >= 70
                    ? "bg-primary/20 text-primary"
                    : "bg-destructive/20 text-destructive"
                )}
              >
                {score}%
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {score >= 70 ? "Great job!" : "Keep learning!"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {score >= 70
                    ? "You've demonstrated strong understanding."
                    : "Review the material and try again."}
                </p>
              </div>
            </div>
            <Button onClick={onComplete} size="lg">
              Complete Lesson
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {allAnswered
                ? "All questions answered"
                : `${Object.keys(answers).length}/${questions.length} answered`}
            </p>
            <Button onClick={onSubmit} size="lg" disabled={!allAnswered}>
              Submit Answers
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function CompletionSection({
  lesson,
  isLastLesson,
  onNextLesson,
}: {
  lesson: Lesson;
  isLastLesson: boolean;
  onNextLesson: () => void;
}) {
  return (
    <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Success animation container */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-32 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
        </div>
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-400 mx-auto mb-6 shadow-lg shadow-primary/30">
          <CheckCircle2 className="h-10 w-10 text-primary-foreground animate-in zoom-in duration-300" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-2 animate-in slide-in-from-bottom duration-500 delay-100">
        {isLastLesson ? "Module Complete!" : "Lesson Complete!"}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto animate-in slide-in-from-bottom duration-500 delay-200">
        {"You've successfully completed"} "{lesson.title}". {isLastLesson 
          ? "Congratulations on finishing this module!" 
          : "Keep up the great work protecting your organization!"}
      </p>

      {isLastLesson && (
        <div className="flex items-center justify-center gap-6 mb-8 animate-in slide-in-from-bottom duration-500 delay-300">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">100%</p>
            <p className="text-sm text-muted-foreground">Progress</p>
          </div>
          <div className="h-10 w-px bg-border" />
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">A+</p>
            <p className="text-sm text-muted-foreground">Grade</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 animate-in slide-in-from-bottom duration-500 delay-300">
        {isLastLesson ? (
          <>
            <Link href="/certificates">
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                View Certificate
              </Button>
            </Link>
            <Link href="/modules">
              <Button size="lg" className="bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90">
                Back to Modules
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </>
        ) : (
          <Button onClick={onNextLesson} size="lg" className="bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90">
            Next Lesson
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
