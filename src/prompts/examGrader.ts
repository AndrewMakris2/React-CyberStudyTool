export function buildSummaryPrompt(certLabel: string, domainScores: string): string {
  return `
You are a cybersecurity exam coach reviewing a student's practice exam results.

RESULTS: ${domainScores}

Provide a brief (3-5 bullet points) actionable study plan based on the weakest domains. 
Be specific about WHAT to study, not just that they should study more.
Format as a plain bulleted list.
`.trim();
}