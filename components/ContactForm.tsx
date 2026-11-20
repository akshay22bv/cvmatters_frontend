"use client";

import { useState, type FormEvent } from "react";
import { sendContactMessage } from "@/lib/api";

const TOPICS = [
  "Product & editor",
  "Billing & subscriptions",
  "Privacy & account",
  "Feedback & partnerships",
] as const;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await sendContactMessage({ name: name.trim(), email: email.trim(), topic, message: message.trim(), website });
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not send your message. Please email us directly.");
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <div className="board-contact-form is-sent" role="status">
        <h3>Message received</h3>
        <p>Thanks for reaching out. We&apos;ll reply to your email within 1–2 business days.</p>
        <button type="button" className="board-pill board-pill-outline board-pill-compact" onClick={() => setSent(false)}>
          <span className="board-pill-label">Send another message</span>
        </button>
      </div>
    );
  }

  return (
    <form className="board-contact-form" onSubmit={onSubmit} noValidate>
      <div className="board-contact-form-row">
        <label className="board-contact-field">
          <span>Your name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Alex Rivera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
          />
        </label>
        <label className="board-contact-field">
          <span>Email *</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={160}
          />
        </label>
      </div>

      <label className="board-contact-field">
        <span>Topic</span>
        <select name="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
          {TOPICS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="board-contact-field">
        <span>Message *</span>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="Tell us what you need help with — include your sign-in email or order ID if it's about billing."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={4000}
        />
      </label>

      <label className="board-contact-hp" aria-hidden="true">
        <span>Website</span>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </label>

      {error ? <p className="form-alert">{error}</p> : null}

      <button type="submit" className="board-pill board-pill-primary" disabled={busy}>
        <span className="board-pill-label">{busy ? "Sending…" : "Send message"}</span>
      </button>
    </form>
  );
}
