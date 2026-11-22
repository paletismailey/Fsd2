const rules = [
  { pattern: /\b(you have won|winner|claim your prize|lottery)\b/i, points: 22, label: "Prize or lottery language" },
  { pattern: /\b(urgent|act now|immediately|limited time|expires today)\b/i, points: 12, label: "Urgency or pressure language" },
  { pattern: /\b(verify your account|confirm your password|account suspended|login to restore)\b/i, points: 24, label: "Credential or account-verification request" },
  { pattern: /\b(wire transfer|gift card|send money|payment required)\b/i, points: 15, label: "Unusual payment request" },
  { pattern: /\b(free money|guaranteed income|risk[- ]free|earn \$?\d+)\b/i, points: 18, label: "Unrealistic money claim" },
  { pattern: /\b(click here|open attachment|download now)\b/i, points: 8, label: "Action-oriented link or attachment wording" },
  { pattern: /https?:\/\/[^\s]+/i, points: 7, label: "Contains a URL" },
  { pattern: /\b(password|bank details|social security|one[- ]time password|OTP)\b/i, points: 10, label: "Sensitive information mentioned" },
  { pattern: /(?:!{3,}|\${2,}|[A-Z]{12,})/, points: 7, label: "Excessive punctuation, symbols, or uppercase text" },
];

export function classifyEmail(subject = "", body = "") {
  const text = `${subject}\n${body}`.trim();
  const signals = [];
  let score = 0;

  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      score += rule.points;
      signals.push(rule.label);
    }
  }

  const urlCount = (text.match(/https?:\/\/[^\s]+/gi) || []).length;
  if (urlCount >= 3) {
    score += 10;
    signals.push("Multiple URLs detected");
  }
  if (text.length < 25) {
    signals.push("Very short message; classification may be less reliable");
  }
  score = Math.min(100, score);
  const classification = score >= 45 ? "Spam" : score >= 20 ? "Suspicious" : "Likely Safe";

  if (signals.length === 0) signals.push("No common spam indicators matched");
  return { score, classification, signals };
}
