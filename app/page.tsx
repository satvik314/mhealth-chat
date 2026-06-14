"use client";

import { useEffect, useRef, useState } from "react";
import ApiKeyGate from "./components/ApiKeyGate";

type Message = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "mindful-digest-openai-key";

const ISSUE_DATE = new Date().toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});

export default function Home() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [keyLoaded, setKeyLoaded] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcriptRef = useRef<HTMLDivElement>(null);

  // Restore a previously saved key on mount.
  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) setApiKey(stored);
    else setGateOpen(true);
    setKeyLoaded(true);
  }, []);

  // Keep the latest letter in view.
  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const saveKey = (key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
    setGateOpen(false);
    setError(null);
  };

  const clearKey = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey(null);
    setGateOpen(true);
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    if (!apiKey) {
      setGateOpen(true);
      return;
    }

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setSending(true);

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openai-key": apiKey,
        },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        if (resp.status === 401) {
          setError(data.error ?? "Your API key was rejected. Please re-enter it.");
          setGateOpen(true);
        } else {
          setError(data.error ?? "Something went wrong. Please try again.");
        }
        // Roll the unsent letter back into the composer.
        setMessages(messages);
        setDraft(text);
        return;
      }

      setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setError("We couldn't reach the editor's desk. Check your connection.");
      setMessages(messages);
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  const onComposerKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="page">
      {keyLoaded && gateOpen && (
        <ApiKeyGate
          onSave={saveKey}
          onClose={apiKey ? () => setGateOpen(false) : undefined}
          hasExistingKey={!!apiKey}
        />
      )}

      <main className="sheet">
        <header className="masthead">
          <div className="masthead-top">
            <span>Vol. LII &mdash; No. 6</span>
            <span>{ISSUE_DATE}</span>
            <span>Price: One Quiet Moment</span>
          </div>
          <h1 className="masthead-title">
            The Mindful <span className="amp">&amp;</span> Digest
          </h1>
          <div className="masthead-sub">
            A Companion for the Modern Mind &middot; Est. 1974
          </div>
        </header>

        <section className="column-head">
          <span className="column-kicker">Advice Column</span>
          <span className="column-title">A Letter to The Counsel</span>
        </section>
        <p className="column-note">
          Pour a cup of something warm and tell us what&apos;s on your mind. Our
          resident companion reads every letter and writes back with care.
        </p>

        {error && <div className="error-strip">{error}</div>}

        <div className="transcript" ref={transcriptRef}>
          {messages.length === 0 && !sending && (
            <div className="empty-state">
              <div className="ornament">&#10086;</div>
              No letters yet. Begin below &mdash; whatever weighs on you,
              big or small, is welcome here.
            </div>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={`entry ${
                m.role === "user" ? "entry-from-user" : "entry-from-bot"
              }`}
            >
              <span className="entry-byline">
                {m.role === "user" ? "Your Letter" : "The Counsel Replies"}
              </span>
              <div className="bubble">{m.content}</div>
            </div>
          ))}

          {sending && (
            <div className="entry entry-from-bot">
              <span className="entry-byline">The Counsel Replies</span>
              <div className="bubble">
                <span className="typing">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="composer">
          <div className="composer-row">
            <textarea
              rows={2}
              placeholder="Dear Counsel, lately I've been feeling…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onComposerKey}
              disabled={sending}
            />
            <button
              className="btn"
              onClick={send}
              disabled={sending || !draft.trim()}
            >
              {sending ? "Posting…" : "Post Letter"}
            </button>
          </div>
          <div className="composer-meta">
            <span>Enter to send &middot; Shift+Enter for a new line</span>
            <span>
              {apiKey ? (
                <button className="linklike" onClick={clearKey}>
                  Change API Key
                </button>
              ) : (
                <button className="linklike" onClick={() => setGateOpen(true)}>
                  Enter API Key
                </button>
              )}
            </span>
          </div>
        </div>
      </main>

      <footer className="colophon">
        <div>
          The Mindful Digest is a companion, not a clinician &middot; Always
          consult a qualified professional for medical advice
        </div>
        <div className="crisis">
          In crisis? In the U.S. call or text 988 &middot; If life is in danger,
          call 911
        </div>
      </footer>
    </div>
  );
}
