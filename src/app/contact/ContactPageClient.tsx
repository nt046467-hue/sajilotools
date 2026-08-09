"use client";

import { useState } from "react";
import { Mail, MessageSquare, MapPin, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ContactPageClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Hidden spam trap field

  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message, honeypot }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setStatus("sent");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setHoneypot("");
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    }
  }

  return (
    <div className="text-[#18181B] dark:text-[#F4F4F5] px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold font-sora">Contact Us</h1>
          <p className="text-[#71717A] dark:text-[#A1A1AA] text-sm max-w-lg mx-auto">
            Have questions, feedback, or a tool request? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-[#F5A623]">
              <Mail size={20} />
            </div>
            <h3 className="font-bold text-base">Email Us</h3>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
              Send us an email for general inquiries and support.
            </p>
            <a
              href="mailto:sajilotool@gmail.com"
              className="inline-block text-sm font-semibold text-[#F5A623] hover:underline"
            >
              sajilotool@gmail.com
            </a>
          </div>

          <div className="p-6 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <MapPin size={20} />
            </div>
            <h3 className="font-bold text-base">Location</h3>
            <p className="text-xs text-[#71717A] dark:text-[#A1A1AA]">
              Proudly designed and developed in Nepal.
            </p>
            <p className="text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5]">
              Kathmandu, Nepal
            </p>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="p-8 bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center gap-2 text-lg font-bold">
            <MessageSquare size={20} className="text-[#F5A623]" /> Send a Message
          </div>

          {/* Success Banner */}
          {status === "sent" && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-sm">
              <CheckCircle2 size={20} className="shrink-0 text-emerald-500 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Message Sent!</p>
                <p className="text-xs opacity-90">
                  Thank you for reaching out. Your message has been sent to our team and we&apos;ll get back to you shortly. A confirmation has also been sent to your email.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {status === "error" && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle size={20} className="shrink-0 text-red-500" />
              <p className="text-xs font-medium">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot Spam Trap Field (Hidden from human users) */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Leave this empty</label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nabin Thapa"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Tool Request / Feedback"
                className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#71717A] dark:text-[#A1A1AA] mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us how we can help..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-3 bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] font-semibold rounded-xl text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send size={16} /> Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
