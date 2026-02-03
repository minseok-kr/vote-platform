"use client";

const VISITOR_ID_KEY = "vote_visitor_id";

// Generate a simple visitor ID (for anonymous voting)
function generateVisitorId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

// Get or create visitor ID
export function getVisitorId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let visitorId = localStorage.getItem(VISITOR_ID_KEY);

  if (!visitorId) {
    visitorId = generateVisitorId();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }

  return visitorId;
}

// Clear visitor ID (for testing purposes)
export function clearVisitorId(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(VISITOR_ID_KEY);
}
