"use client";

import { useState, useMemo, useCallback } from "react";
import katex from "katex";

function sanitizeLatex(s: string) {
  return s.replace(/\t/g, "\\t").replace(/\r/g, "\\r");
}

function CopyIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function LatexText({ text }: { text: string }) {
  const parts = useMemo(() => {
    const result: { type: "text" | "math"; content: string }[] = [];
    const sanitized = sanitizeLatex(text);
    const segments = sanitized.split(/(\$[^$]+\$)/g);
    for (const seg of segments) {
      if (seg.startsWith("$") && seg.endsWith("$")) {
        const math = seg.slice(1, -1);
        try {
          const html = katex.renderToString(math, { throwOnError: false });
          result.push({ type: "math", content: html });
        } catch {
          result.push({ type: "text", content: seg });
        }
      } else if (seg) {
        result.push({ type: "text", content: seg });
      }
    }
    return result;
  }, [text]);

  return (
    <>
      {parts.map((part, i) =>
        part.type === "math" ? (
          <span key={i} dangerouslySetInnerHTML={{ __html: part.content }} />
        ) : (
          <span key={i}>{part.content}</span>
        )
      )}
    </>
  );
}

function OptionsList({ options }: { options: string[] }) {
  const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  return (
    <div className="bg-[#111111] rounded-lg p-6 border border-[#222222] shadow-[0px_1px_1px_#00000020,0px_2px_2px_#00000030]">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs uppercase tracking-wide text-[#555555]">
          Options
        </span>
      </div>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <OptionRow key={i} label={labels[i] || `${i + 1}`} value={opt} />
        ))}
      </div>
    </div>
  );
}

function TagsField({ tags }: { tags: Record<string, string[]> }) {
  return (
    <div className="bg-[#111111] rounded-lg p-6 border border-[#222222] shadow-[0px_1px_1px_#00000020,0px_2px_2px_#00000030]">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs uppercase tracking-wide text-[#555555]">
          Tags
        </span>
      </div>
      <div className="space-y-3">
        {Object.entries(tags).map(([category, values]) => (
          <div key={category}>
            <span className="text-xs text-[#555555] font-mono uppercase tracking-wide mb-2 block">
              {category.replace(/_/g, " ")}
            </span>
            <div className="flex flex-wrap gap-2">
              {values.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono bg-[#1a1a1a] text-[#888888] border border-[#222222]"
                >
                  {v}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptionRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(sanitizeLatex(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <div className="flex items-center gap-3 group">
      <span className="w-7 h-7 flex-shrink-0 rounded-md bg-[#1a1a1a] border border-[#222222] flex items-center justify-center text-xs font-mono text-[#555555]">
        {label}
      </span>
      <span className="flex-1 text-sm text-[#ededed] leading-relaxed truncate">
        <LatexText text={value} />
      </span>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 text-xs font-medium text-[#555555] hover:text-[#ededed] px-2 py-1 rounded-md hover:bg-[#1a1a1a]"
      >
        {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(sanitizeLatex(value));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <div className="bg-[#111111] rounded-lg p-6 border border-[#222222] shadow-[0px_1px_1px_#00000020,0px_2px_2px_#00000030]">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-xs uppercase tracking-wide text-[#555555]">
          {label}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#555555] hover:text-[#ededed] transition-colors px-2 py-1 rounded-md hover:bg-[#1a1a1a]"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="font-sans text-sm text-[#ededed] leading-relaxed whitespace-pre-wrap">
        <LatexText text={value} />
      </div>
    </div>
  );
}

export default function Page() {
  const [jsonText, setJsonText] = useState("");
  const [data, setData] = useState<any>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseJson = () => {
    setError(null);
    try {
      const parsed = JSON.parse(jsonText);
      setData(parsed);
    } catch {
      setError("Invalid JSON — please check your input and try again.");
    }
  };

  const clearAll = () => {
    setJsonText("");
    setData(null);
    setError(null);
  };

  const copyAll = () => {
    const raw = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(sanitizeLatex(raw));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#000000]">
      <header className="sticky top-0 z-50 bg-[#000000]/80 backdrop-blur-md border-b border-[#222222]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[#ededed] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </div>
            <span className="font-semibold text-sm text-[#ededed] tracking-tight">
              Question Extractor
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#555555] font-mono">
              v1.0
            </span>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#000000] border-b border-[#222222]">
        <div className="absolute inset-0 opacity-[0.12]">
          <svg className="w-full h-full" viewBox="0 0 1440 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#007cf0" />
                <stop offset="33%" stopColor="#7928ca" />
                <stop offset="66%" stopColor="#ff0080" />
                <stop offset="100%" stopColor="#f9cb28" />
              </linearGradient>
              <linearGradient id="g2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#50e3c2" />
                <stop offset="50%" stopColor="#007cf0" />
                <stop offset="100%" stopColor="#ff0080" />
              </linearGradient>
              <linearGradient id="g3" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#f9cb28" />
                <stop offset="50%" stopColor="#ff4d4d" />
                <stop offset="100%" stopColor="#7928ca" />
              </linearGradient>
              <filter id="blur">
                <feGaussianBlur stdDeviation="60" />
              </filter>
            </defs>
            <g filter="url(#blur)" className="animate-mesh">
              <ellipse cx="360" cy="200" rx="400" ry="250" fill="url(#g1)" opacity="0.6" />
              <ellipse cx="720" cy="150" rx="350" ry="200" fill="url(#g2)" opacity="0.5" />
              <ellipse cx="1080" cy="180" rx="380" ry="220" fill="url(#g3)" opacity="0.4" />
            </g>
          </svg>
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1a1a] text-[#555555] text-xs font-mono mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#50e3c2]" />
            JSON parsing tool
          </div>
          <h1 className="text-[40px] sm:text-5xl font-semibold text-[#ededed] leading-[1.05] tracking-[-2.4px] mb-4">
            Parse and extract <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007cf0] via-[#7928ca] to-[#ff0080]">
              question data
            </span>
            .
          </h1>
          <p className="text-lg text-[#888888] max-w-xl mx-auto leading-relaxed">
            Paste your JSON, extract structured fields, and copy individual values — all in one place.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-6 -mt-8 pb-24">
        <div className="bg-[#111111] rounded-xl border border-[#222222] shadow-[0px_2px_2px_#00000040,0px_8px_16px_-4px_#00000060] p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-medium text-[#555555] tracking-wide uppercase font-mono">
              Input JSON
            </label>
            {jsonText && (
              <button
                onClick={clearAll}
                className="text-xs text-[#555555] hover:text-[#ededed] transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <textarea
            className="w-full bg-[#1a1a1a] border border-[#222222] rounded-lg px-4 py-3.5 text-sm text-[#ededed] placeholder:text-[#555555] font-mono leading-relaxed resize-y min-h-[200px] focus:outline-none focus:ring-2 focus:ring-[#0070f3]/40 focus:border-[#0070f3] transition-all"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder="Paste your JSON here..."
          />

          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-[#ee0000] bg-[#2d1517] rounded-lg px-4 py-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={parseJson}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#ededed] text-[#000000] text-sm font-medium rounded-full hover:bg-[#d4d4d4] transition-colors shadow-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
              Parse JSON
            </button>
          </div>
        </div>

        {data && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#ededed] tracking-tight">
                Extracted Fields
              </h2>
              <button
                onClick={copyAll}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#ededed] text-[#000000] text-xs font-medium rounded-full hover:bg-[#d4d4d4] transition-colors"
              >
                {copiedAll ? <CheckIcon /> : <CopyIcon />}
                {copiedAll ? "Copied!" : "Copy All"}
              </button>
            </div>

            <div className="grid gap-4">
              <Field
                label="Subject"
                value={data.classification.subject}
              />
              <Field
                label="Chapter Group"
                value={data.classification.chapter_group}
              />
              <Field
                label="Chapter"
                value={data.classification.chapter}
              />
              <Field
                label="Topic"
                value={data.classification.topic}
              />
              <TagsField tags={data.classification.tags} />
              <Field
                label="Assessment Type"
                value={data.question_details.assessment_type}
              />
              <Field
                label="Difficulty Level"
                value={data.question_details.difficulty_level}
              />
              <Field
                label="Question"
                value={data.content.question_text}
              />
              <OptionsList options={data.content.options} />
              <Field
                label="Answer"
                value={data.content.correct_answer}
              />
              <Field
                label="Hint"
                value={data.content.quick_hint}
              />
              <Field
                label="Solution"
                value={data.content.detailed_solution}
              />
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[#222222] bg-[#000000]">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <span className="text-xs text-[#555555]">
            Question Extractor
          </span>
          <span className="text-xs text-[#555555] font-mono">
            built with precision
          </span>
        </div>
      </footer>
    </div>
  );
}
