"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, type Question, type SubmittedAnswer } from "@/lib/api";

interface QuizFormProps {
  enrollmentId: string;
  sessionId: string;
  questions: Question[];
}

export default function QuizForm({ enrollmentId, sessionId, questions }: QuizFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function setAnswer(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const unanswered = questions.filter((q) => !answers[q._id]);
    if (unanswered.length > 0) {
      setError("Please answer all questions before submitting.");
      return;
    }

    const payload: { questionId: string; answer: string }[] = questions.map((q) => ({
      questionId: q._id,
      answer: answers[q._id] ?? "",
    }));

    setSubmitting(true);
    try {
      const res = await api.post(
        `/enrollments/${enrollmentId}/sessions/${sessionId}/quiz/submit`,
        { answers: payload }
      );
      if (res.success) {
        router.refresh();
      } else {
        setError(res.message || "Submission failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {questions.map((q, i) => (
        <div key={q._id} className="border border-[#1e1e2e] p-5">
          {/* Question header */}
          <div className="flex items-start gap-3 mb-4">
            <span className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#6b6b80] shrink-0 mt-0.5">
              Q{i + 1}
            </span>
            <p className="font-[family-name:var(--font-ibm-plex-mono)] text-xs text-[#e8e8f0] leading-5">
              {q.text}
            </p>
          </div>

          {q.type === "mc" && q.options ? (
            <div className="flex flex-col gap-2 pl-6">
              {q.options.map((opt, oi) => {
                const selected = answers[q._id] === opt;
                return (
                  <label
                    key={oi}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <span
                      className="w-4 h-4 border shrink-0 flex items-center justify-center transition-colors duration-150"
                      style={{
                        borderColor: selected ? "#1d4ed8" : "#1e1e2e",
                        background: selected ? "rgba(29,78,216,0.12)" : "transparent",
                      }}
                    >
                      {selected && (
                        <span className="w-1.5 h-1.5 bg-[#1d4ed8]" />
                      )}
                    </span>
                    <input
                      type="radio"
                      name={q._id}
                      value={opt}
                      checked={selected}
                      onChange={() => setAnswer(q._id, opt)}
                      className="sr-only"
                    />
                    <span
                      className="font-[family-name:var(--font-ibm-plex-mono)] text-[10px] transition-colors duration-150"
                      style={{ color: selected ? "#e8e8f0" : "#6b6b80" }}
                    >
                      {opt}
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="pl-6">
              <textarea
                value={answers[q._id] ?? ""}
                onChange={(e) => setAnswer(q._id, e.target.value)}
                rows={3}
                placeholder="Write your answer here…"
                className="w-full bg-transparent border border-[#1e1e2e] px-3 py-2 font-[family-name:var(--font-ibm-plex-mono)] text-[10px] text-[#e8e8f0] placeholder-[#3a3a50] outline-none resize-none focus:border-[#4f8ef7] transition-colors duration-150"
              />
            </div>
          )}
        </div>
      ))}

      {error && (
        <div
          className="font-[family-name:var(--font-ibm-plex-mono)] text-xs px-3 py-2"
          style={{
            color: "#dc2626",
            background: "rgba(220,38,38,0.07)",
            borderLeft: "2px solid #dc2626",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="self-start font-[family-name:var(--font-ibm-plex-mono)] text-[10px] tracking-[0.2em] uppercase px-6 py-3 bg-[#4f8ef7] text-[#0a0a0f] hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting…" : "Submit Quiz →"}
      </button>
    </form>
  );
}
