"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/training/sidebar";
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

function ModuleContent({ moduleId }: { moduleId: string }) {
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
      <Sidebar />

      <main className="pl-64">
        <div className="px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/modules"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Modules
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {module.category}
                </Badge>
                <h1 className="text-3xl font-bold text-foreground">
                  {module.title}
                </h1>
                <p className="mt-2 text-muted-foreground max-w-2xl">
                  {module.description}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {module.duration}
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  {module.lessons.length} lessons
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Module Progress</span>
                <span className="font-medium text-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
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
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        {lesson.title}
      </h2>
      <div className="prose prose-invert max-w-none">
        {lesson.content.split("\n\n").map((paragraph, index) => {
          if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
            return (
              <h3 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3">
                {paragraph.replace(/\*\*/g, "")}
              </h3>
            );
          }
          if (paragraph.startsWith("- ") || paragraph.startsWith("1. ")) {
            const isOrdered = paragraph.startsWith("1. ");
            const items = paragraph.split("\n").map((item) =>
              item.replace(/^[-\d.]\s*/, "").replace(/\*\*/g, "")
            );
            const ListTag = isOrdered ? "ol" : "ul";
            return (
              <ListTag
                key={index}
                className={cn(
                  "space-y-2 my-4",
                  isOrdered ? "list-decimal" : "list-disc",
                  "pl-6"
                )}
              >
                {items.map((item, i) => (
                  <li key={i} className="text-muted-foreground">
                    {item}
                  </li>
                ))}
              </ListTag>
            );
          }
          return (
            <p key={index} className="text-muted-foreground leading-relaxed my-4">
              {paragraph.split("**").map((part, i) =>
                i % 2 === 1 ? (
                  <strong key={i} className="text-foreground font-semibold">
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
      <div className="mt-8 flex justify-end">
        <Button onClick={onNext} size="lg">
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
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Play className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Interactive Scenario
          </h2>
          <p className="text-sm text-muted-foreground">
            Apply what you've learned
          </p>
        </div>
      </div>

      <Card className="border-primary/20 bg-primary/5 mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {scenario.title}
          </h3>
          <p className="text-muted-foreground">{scenario.description}</p>
        </CardContent>
      </Card>

      <h4 className="text-sm font-medium text-foreground mb-4">
        What would you do?
      </h4>

      <div className="space-y-3">
        {scenario.options.map((option) => {
          const isSelected = selectedOption?.id === option.id;
          const showResult = showFeedback && isSelected;

          return (
            <button
              key={option.id}
              onClick={() => !showFeedback && onSelect(option)}
              disabled={showFeedback}
              className={cn(
                "w-full text-left rounded-lg border p-4 transition-all",
                isSelected
                  ? option.isCorrect
                    ? "border-primary bg-primary/10"
                    : "border-destructive bg-destructive/10"
                  : "border-border bg-card hover:border-primary/50",
                showFeedback && !isSelected && "opacity-50"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                    isSelected
                      ? option.isCorrect
                        ? "bg-primary text-primary-foreground"
                        : "bg-destructive text-destructive-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {showResult ? (
                    option.isCorrect ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <X className="h-3 w-3" />
                    )
                  ) : (
                    option.id.toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">
                    {option.text}
                  </p>
                  {showResult && (
                    <p
                      className={cn(
                        "mt-2 text-sm",
                        option.isCorrect
                          ? "text-primary"
                          : "text-destructive"
                      )}
                    >
                      {option.feedback}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {showFeedback && (
        <div className="mt-8 flex justify-end">
          <Button onClick={onNext} size="lg">
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
    <div className="text-center py-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 mx-auto mb-6">
        <CheckCircle2 className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">
        Lesson Complete!
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        You've successfully completed "{lesson.title}". Keep up the great work
        protecting your organization!
      </p>

      <div className="flex items-center justify-center gap-4">
        {isLastLesson ? (
          <Link href="/modules">
            <Button size="lg">
              Back to Modules
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button onClick={onNextLesson} size="lg">
            Next Lesson
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = use(params);
  return <ModuleContent moduleId={moduleId} />;
}
