import { useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  HABIT_PRESET_CATEGORY_COLORS,
  HABIT_PRESET_CATEGORY_LABELS,
  useHabitStore,
  type Habit,
  type HabitTemplate,
} from "@/entities/habit";
import { ClubTrackerImportButton } from "@/features/clubTrackerImport";
import { Button } from "@/shared/ui/shadCNComponents/ui/button";
import { Checkbox } from "@/shared/ui/shadCNComponents/ui/checkbox";
import { cn } from "@/shared/ui/lib/utils";
import { addRecommendedHabits } from "../lib/addRecommendedHabits";
import { downloadOrShareQuizResult } from "../lib/downloadQuizResult";
import {
  recommendTemplates,
  replaceRecommendedTemplate,
} from "../lib/recommendTemplates";
import {
  scoreQuiz,
  type QuizAnswerIndex,
  type SphereScore,
} from "../lib/scoreQuiz";
import { shuffleArray } from "../lib/shuffle";
import {
  LIFE_BALANCE_QUESTION_COUNT,
  LIFE_BALANCE_QUESTIONS,
  type LifeBalanceQuestion,
} from "../model/questions";
import { useQuizOnboardingStore } from "../slice/quizOnboardingStore";
import { SphereAttentionDonut } from "./SphereAttentionDonut";

type QuizStep = "intro" | "questions" | "results";

interface LifeBalanceQuizFlowProps {
  /** Если true — показывать «Пропустить» на intro (первый запуск). */
  allowSkip?: boolean;
}

export const LifeBalanceQuizFlow = ({
  allowSkip = true,
}: LifeBalanceQuizFlowProps) => {
  const navigate = useNavigate();
  const markQuizDone = useQuizOnboardingStore((s) => s.markQuizDone);
  const habits = useHabitStore((s) => s.habits);

  const [step, setStep] = useState<QuizStep>("intro");
  const [queue, setQueue] = useState<LifeBalanceQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, QuizAnswerIndex>>(
    () => new Map(),
  );
  const [scores, setScores] = useState<SphereScore[]>([]);
  const [recommendations, setRecommendations] = useState<HabitTemplate[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const finishAndGoHome = () => {
    markQuizDone();
    navigate("/", { replace: true });
  };

  const startQuiz = () => {
    setQueue(shuffleArray([...LIFE_BALANCE_QUESTIONS]));
    setIndex(0);
    setAnswers(new Map());
    setStep("questions");
  };

  const goToResults = (finalAnswers: Map<string, QuizAnswerIndex>) => {
    const nextScores = scoreQuiz(LIFE_BALANCE_QUESTIONS, finalAnswers);
    const recs = recommendTemplates(nextScores, habits);
    setScores(nextScores);
    setRecommendations(recs);
    setSelectedIds(new Set(recs.map((r) => r.id)));
    setStep("results");
  };

  const answerCurrent = (optionIndex: QuizAnswerIndex) => {
    const current = queue[index];
    if (!current) return;
    const next = new Map(answers);
    next.set(current.id, optionIndex);
    setAnswers(next);

    if (index + 1 >= queue.length) {
      goToResults(next);
      return;
    }
    setIndex((i) => i + 1);
  };

  const goBack = () => {
    if (index <= 0) {
      setStep("intro");
      return;
    }
    setIndex((i) => i - 1);
  };

  const toggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleAddSelected = () => {
    const toAdd = recommendations.filter((r) => selectedIds.has(r.id));
    if (toAdd.length > 0) addRecommendedHabits(toAdd);
    finishAndGoHome();
  };

  const handleReplaceRecommendation = (templateId: string) => {
    const current = recommendations.find((t) => t.id === templateId);
    if (!current) return;
    const next = replaceRecommendedTemplate(current, recommendations, habits);
    if (!next) return;

    setRecommendations((prev) =>
      prev.map((t) => (t.id === templateId ? next : t)),
    );
    setSelectedIds((prev) => {
      const nextIds = new Set(prev);
      const wasSelected = nextIds.has(templateId);
      nextIds.delete(templateId);
      if (wasSelected) nextIds.add(next.id);
      return nextIds;
    });
  };

  if (step === "intro") {
    if (importNotice) {
      return (
        <QuizShell>
          <div className="flex flex-1 flex-col justify-center gap-6 px-5 py-8">
            <p className="text-center text-sm leading-relaxed text-chart-2" role="status">
              {importNotice}
            </p>
            <Button
              type="button"
              size="lg"
              className="w-full"
              onClick={finishAndGoHome}
            >
              На главный экран
            </Button>
          </div>
        </QuizShell>
      );
    }

    return (
      <QuizShell>
        <div className="flex flex-1 flex-col justify-center gap-6 px-5 py-8">
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Баланс сфер жизни
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Насколько ты уделяешь внимание важным областям жизни?
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {LIFE_BALANCE_QUESTION_COUNT} вопросов по семи сферам (как в
              колесе баланса) — или загрузи таблицу клуба. Квиз потом можно
              пройти в Настройках.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Button type="button" size="lg" className="w-full" onClick={startQuiz}>
              Начать квиз
            </Button>
            {allowSkip ? (
              <>
                <ClubTrackerImportButton
                  variant="outline"
                  size="lg"
                  showStatus={false}
                  skipQuizOnImport
                  onSuccess={(message) => setImportNotice(message)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={finishAndGoHome}
                >
                  Пропустить
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={() => navigate(-1)}
              >
                Назад
              </Button>
            )}
          </div>
        </div>
      </QuizShell>
    );
  }

  if (step === "questions") {
    const current = queue[index];
    const total = queue.length;
    const progress = total > 0 ? ((index + 1) / total) * 100 : 0;
    const existingAnswer = current ? answers.get(current.id) : undefined;

    return (
      <QuizShell>
        <div className="flex shrink-0 flex-col gap-2 border-b border-border px-5 py-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <button
              type="button"
              onClick={goBack}
              className="text-muted-foreground hover:text-foreground"
            >
              Назад
            </button>
            <span>
              {index + 1} / {total}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-6">
          <p className="text-lg font-medium leading-snug text-foreground">
            {current?.text}
          </p>

          <div className="flex flex-col gap-2">
            {(current?.options ?? []).map((option, optionIndex) => {
              const selected = existingAnswer === optionIndex;
              return (
                <button
                  key={`${current?.id ?? "q"}-${optionIndex}`}
                  type="button"
                  onClick={() => answerCurrent(optionIndex)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-foreground hover:bg-accent/50",
                  )}
                >
                  <span className="text-sm leading-snug">{option.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      </QuizShell>
    );
  }

  return (
    <ResultsStep
      scores={scores}
      recommendations={recommendations}
      selectedIds={selectedIds}
      habits={habits}
      onToggle={toggleSelected}
      onReplace={handleReplaceRecommendation}
      onAdd={handleAddSelected}
      onSkip={finishAndGoHome}
    />
  );
};

function QuizShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      {children}
    </div>
  );
}

interface ResultsStepProps {
  scores: SphereScore[];
  recommendations: HabitTemplate[];
  selectedIds: Set<string>;
  habits: readonly Habit[];
  onToggle: (id: string, checked: boolean) => void;
  onReplace: (templateId: string) => void;
  onAdd: () => void;
  onSkip: () => void;
}

function ResultsStep({
  scores,
  recommendations,
  selectedIds,
  habits,
  onToggle,
  onReplace,
  onAdd,
  onSkip,
}: ResultsStepProps) {
  const resultCardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const selectedCount = useMemo(
    () => recommendations.filter((r) => selectedIds.has(r.id)).length,
    [recommendations, selectedIds],
  );

  const canReplaceById = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const template of recommendations) {
      map.set(
        template.id,
        replaceRecommendedTemplate(template, recommendations, habits) != null,
      );
    }
    return map;
  }, [recommendations, habits]);

  const handleDownload = async () => {
    const el = resultCardRef.current;
    if (!el || isDownloading) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      await downloadOrShareQuizResult(el);
    } catch {
      setDownloadError("Не удалось сохранить изображение. Попробуй ещё раз.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <QuizShell>
      <div className="shrink-0 border-b border-border px-5 py-4">
        <h1 className="text-xl font-semibold text-foreground">
          Твоё внимание к сферам
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Чем ниже процент — тем меньше сейчас уделяешь этой области
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-4">
        <div className="space-y-3">
          <SphereAttentionDonut
            ref={resultCardRef}
            scores={scores}
            showDate
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isDownloading}
            onClick={() => void handleDownload()}
          >
            {isDownloading ? "Готовлю файл…" : "Скачать результат"}
          </Button>
          {downloadError ? (
            <p className="text-sm text-destructive" role="status">
              {downloadError}
            </p>
          ) : null}
        </div>

        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Рекомендуемые КОДы
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Для сфер, которым уделяешь меньше внимания
            </p>
          </div>

          {recommendations.length === 0 ? (
            <p className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              Новых рекомендаций нет — подходящие КОДы уже есть в привычках.
            </p>
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
              {recommendations.map((template) => {
                const checked = selectedIds.has(template.id);
                const accent =
                  HABIT_PRESET_CATEGORY_COLORS[template.categoryId];
                const canReplace = canReplaceById.get(template.id) === true;
                return (
                  <li key={template.id} className="px-3.5 py-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) =>
                          onToggle(template.id, value === true)
                        }
                        className="mt-0.5"
                        aria-label={template.name}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {template.name}
                        </p>
                        <p
                          className="mt-0.5 text-xs"
                          style={{ color: accent }}
                        >
                          {HABIT_PRESET_CATEGORY_LABELS[template.categoryId]}
                        </p>
                        {template.desc !== template.name ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {template.desc}
                          </p>
                        ) : null}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-8 px-2 text-xs text-muted-foreground"
                          disabled={!canReplace}
                          onClick={() => onReplace(template.id)}
                        >
                          Заменить привычку
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border px-5 py-4">
        {recommendations.length > 0 ? (
          <>
            <Button
              type="button"
              size="lg"
              className="w-full"
              disabled={selectedCount === 0}
              onClick={onAdd}
            >
              Добавить выбранные
              {selectedCount > 0 ? ` (${selectedCount})` : ""}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={onSkip}
            >
              Пропустить
            </Button>
          </>
        ) : (
          <Button type="button" size="lg" className="w-full" onClick={onSkip}>
            Готово
          </Button>
        )}
      </div>
    </QuizShell>
  );
}
