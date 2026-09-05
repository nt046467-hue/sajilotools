"use client";

export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("sajilo_open_cookie_consent"));
        }
      }}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
    >
      Cookie Preferences
    </button>
  );
}
