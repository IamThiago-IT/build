"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { generateIdea, formatIdea, type Idea } from "./data";

type StoredState = {
  history: Idea[];
  favorites: Idea[];
  count: number;
};

const STORAGE_KEY = "br.state";

const defaultState: StoredState = { history: [], favorites: [], count: 0 };

let cachedState: StoredState | null = null;
const listeners = new Set<() => void>();

const readState = (): StoredState => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      history: Array.isArray(parsed.history) ? (parsed.history as Idea[]) : [],
      favorites: Array.isArray(parsed.favorites)
        ? (parsed.favorites as Idea[])
        : [],
      count: typeof parsed.count === "number" ? parsed.count : 0,
    };
  } catch {
    return defaultState;
  }
};

const getSnapshot = (): StoredState => (cachedState ??= readState());

const getServerSnapshot = (): StoredState => defaultState;

const subscribe = (onStoreChange: () => void): (() => void) => {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
};

const notify = () => listeners.forEach((l) => l());

const writeState = (next: StoredState) => {
  cachedState = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  notify();
};

const updateStored = (updater: (prev: StoredState) => StoredState) =>
  writeState(updater(getSnapshot()));

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      cachedState = null;
      notify();
    }
  });
}

const pill =
  "rounded-full border border-white/15 px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-zinc-400 transition-colors duration-200 hover:border-accent/50 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.97]";

const chip =
  "rounded-full border border-white/10 px-3 py-1.5 text-[10px] tracking-wide text-zinc-500 transition-colors duration-200 hover:border-accent/50 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.97]";

export default function Roulette({ initialIdea }: { initialIdea: Idea }) {
  const [idea, setIdea] = useState<Idea>(initialIdea);
  const [spin, setSpin] = useState(0);
  const [auto, setAuto] = useState(false);
  const [copied, setCopied] = useState(false);
  const ideaRef = useRef<Idea>(initialIdea);
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const applyIdea = useCallback((next: Idea, opts?: { count?: boolean }) => {
    ideaRef.current = next;
    setIdea(next);
    setSpin((s) => s + 1);
    updateStored((s) => ({
      ...s,
      count: opts?.count === false ? s.count : s.count + 1,
      history: [next, ...s.history.filter((i) => i.id !== next.id)].slice(0, 10),
    }));
  }, []);

  const spinIdea = useCallback(
    () => applyIdea(generateIdea(ideaRef.current)),
    [applyIdea],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const el = event.target as HTMLElement | null;
      if (
        event.code === "Space" &&
        el?.tagName !== "INPUT" &&
        el?.tagName !== "TEXTAREA" &&
        !el?.isContentEditable
      ) {
        event.preventDefault();
        spinIdea();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [spinIdea]);

  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(spinIdea, 2200);
    return () => window.clearInterval(id);
  }, [auto, spinIdea]);

  const copyIdea = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formatIdea(ideaRef.current));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }, []);

  const shareIdea = useCallback(async () => {
    const text = formatIdea(ideaRef.current);
    if ("share" in navigator) {
      try {
        await navigator.share({ title: "Build Roulette", text });
        return;
      } catch {
        /* user cancelled or share unavailable - fall through to copy */
      }
    }
    await copyIdea();
  }, [copyIdea]);

  const toggleFavorite = useCallback((i: Idea) => {
    updateStored((s) => {
      const exists = s.favorites.some((x) => x.id === i.id);
      return {
        ...s,
        favorites: exists
          ? s.favorites.filter((x) => x.id !== i.id)
          : [i, ...s.favorites],
      };
    });
  }, []);

  const isSaved = stored.favorites.some((f) => f.id === idea.id);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background font-mono text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[38%] h-[420px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/[0.055] blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-7 text-[11px] uppercase tracking-[0.25em]">
        <div className="flex items-center gap-3">
          <span aria-hidden className="text-accent">
            ◆
          </span>
          <span className="text-zinc-200">build roulette</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-zinc-600 sm:inline">ideas spun</span>
          <span className="text-accent">
            #{stored.count.toString().padStart(4, "0")}
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-12">
        <div
          key={spin}
          aria-live="polite"
          className="idea-enter flex max-w-3xl flex-col items-center text-center"
        >
          <p className="text-[clamp(2.4rem,7.2vw,5rem)] font-medium leading-[1.12] tracking-tight">
            <span className="text-zinc-500">build a</span>
            <br />
            <span className="highlight">{idea.product}</span>
            <br />
            <span className="text-zinc-500">for</span>
            <br />
            <span className="highlight">{idea.niche}</span>
          </p>
          {idea.differentiator && (
            <p className="mt-6 text-[clamp(0.95rem,1.8vw,1.15rem)] text-zinc-400">
              <span aria-hidden className="mr-2 text-accent">
                *
              </span>
              <em className="not-italic">{idea.differentiator}</em>
            </p>
          )}
        </div>

        <div className="mt-14 flex flex-col items-center gap-6">
          <button
            type="button"
            onClick={spinIdea}
            className="group flex items-center gap-3 rounded-full border border-accent/60 bg-accent/10 px-10 py-4 text-[13px] font-semibold uppercase tracking-[0.22em] text-accent transition-all duration-300 hover:bg-accent hover:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent active:scale-[0.98]"
          >
            <span
              aria-hidden
              className="text-base transition-transform duration-300 group-hover:rotate-180"
            >
              ⟳
            </span>
            Generate idea
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button type="button" onClick={copyIdea} className={pill}>
              {copied ? "Copied!" : "Copy idea"}
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(idea)}
              className={`${pill} ${
                isSaved ? "border-accent/60 text-accent" : ""
              }`}
            >
              {isSaved ? "Saved ✦" : "Save"}
            </button>
            <button type="button" onClick={shareIdea} className={pill}>
              Share
            </button>
            <button
              type="button"
              onClick={() => setAuto((a) => !a)}
              aria-pressed={auto}
              className={`${pill} ${auto ? "border-accent/60 text-accent" : ""}`}
            >
              <span
                aria-hidden
                className={`mr-2 text-[8px] ${
                  auto ? "auto-dot text-accent" : "text-zinc-600"
                }`}
              >
                ●
              </span>
              {auto ? "Auto on" : "Auto"}
            </button>
          </div>

          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-600">
            press{" "}
            <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-[9px] text-zinc-400">
              space
            </kbd>{" "}
            to spin
          </p>
        </div>
      </main>

      <footer className="relative z-10 mx-auto w-full max-w-5xl px-6 pb-10">
        {stored.favorites.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-zinc-600">
              saved ✦
            </p>
            <div className="flex flex-wrap gap-2">
              {stored.favorites.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => applyIdea(f, { count: false })}
                  className={`${chip} ${
                    f.id === idea.id ? "border-accent/60 text-accent" : ""
                  }`}
                >
                  Build a {f.product} for {f.niche}
                </button>
              ))}
            </div>
          </div>
        )}

        {stored.history.length > 0 && (
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-zinc-600">
              recent
            </p>
            <div className="flex flex-wrap gap-2">
              {stored.history.slice(0, 10).map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => applyIdea(h, { count: false })}
                  className={`${chip} ${
                    h.id === idea.id ? "border-accent/60 text-accent" : ""
                  }`}
                >
                  Build a {h.product} for {h.niche}
                </button>
              ))}
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}