"use client";

import { useState } from "react";

export default function ApiKeyGate({
  onSave,
  onClose,
  hasExistingKey,
}: {
  onSave: (key: string) => void;
  onClose?: () => void;
  hasExistingKey: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) onSave(trimmed);
  };

  return (
    <div className="gate" role="dialog" aria-modal="true" aria-label="Enter your OpenAI API key">
      <div className="gate-card">
        <div className="gate-head">
          <span className="gate-stamp">Members&apos; Desk</span>
          <div className="gate-title">Sign the Register</div>
        </div>
        <div className="gate-body">
          <p>
            The Mindful Digest is powered by your own OpenAI account. Enter your
            API key below to open the correspondence. It is stored only in this
            browser and sent straight to OpenAI — never to our presses.
          </p>
          <label htmlFor="api-key">OpenAI API Key</label>
          <input
            id="api-key"
            type="password"
            placeholder="sk-..."
            value={value}
            autoComplete="off"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
          <div className="gate-actions">
            <button className="btn" onClick={submit} disabled={!value.trim()}>
              Begin the Correspondence
            </button>
            {hasExistingKey && onClose && (
              <button className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
            )}
          </div>
          <p className="gate-fine">
            Your key lives in this device&apos;s local storage and is used only
            to reach OpenAI&apos;s GPT-5.4. Clear it anytime from the column
            footer.
          </p>
        </div>
      </div>
    </div>
  );
}
