import type { CertId, Difficulty, QuestionType } from '../types';

export function buildQuestionGenSystemPrompt(): string {
  return `
You are an expert cybersecurity certification exam question writer with deep knowledge of CompTIA, ISC2, and Microsoft exam formats.

Your questions must:
- Match the exact style, difficulty, and format of real certification exams
- Be technically accurate and unambiguous
- Have exactly ONE best answer for multiple-choice (unless multiple-response)
- Include plausible distractors that test common misconceptions
- Map to specific exam objectives

SAFETY: Only create educational exam practice content. Do not create questions that teach exploitation, malware development, or illegal techniques. PenTest+ questions must remain conceptual and exam-oriented.

OUTPUT: Always return valid JSON only, no markdown fences.
`.trim();
}

export function buildQuestionGenUserPrompt(
  certId: CertId,
  domainNames: string[],
  difficulty: Difficulty | 'mixed',
  count: number,
  types: QuestionType[]
): string {
  const certLabel = certId.replace(/-/g, ' ').toUpperCase();
  const domainsStr = domainNames.join(', ');
  const typesStr = types.join(', ');

  return `
Generate ${count} practice exam questions for ${certLabel}.

PARAMETERS:
- Domains: ${domainsStr}
- Difficulty: ${difficulty}
- Question types to include: ${typesStr}
- Mix types proportionally if multiple types requested

OUTPUT FORMAT (strict JSON array):
[
  {
    "type": "multiple-choice",
    "difficulty": "medium",
    "domainName": "exact domain name",
    "objectiveCodes": ["1.1", "1.2"],
    "stem": "Full question text here. For scenario questions, include a 2-4 sentence scenario before the question.",
    "options": [
      { "id": "A", "text": "Option text" },
      { "id": "B", "text": "Option text" },
      { "id": "C", "text": "Option text" },
      { "id": "D", "text": "Option text" }
    ],
    "correctAnswers": ["A"],
    "explanation": "Detailed explanation of why A is correct and why it's the best answer.",
    "wrongAnswerExplanations": {
      "B": "Why B is wrong",
      "C": "Why C is wrong",
      "D": "Why D is wrong"
    },
    "tags": ["tag1", "tag2"]
  }
]

QUESTION TYPE RULES:
- multiple-choice: 4 options, 1 correct answer
- multiple-response: 4-5 options, 2-3 correct answers, stem MUST say "Select TWO" or "Select all that apply"
- scenario: 3-5 sentence realistic workplace scenario, then a question with 4 options
- pbq: Performance-based question. Use this format for the stem: describe a task (e.g., "Review the following log entries and identify the attack type and recommended response"). Include realistic sample data (logs, configs, etc.) inline in the stem. Options should be realistic response choices.

DIFFICULTY GUIDELINES:
- easy: recall/definition questions, straightforward scenarios
- medium: application questions, moderate scenarios, some nuance
- hard: analysis questions, complex multi-step scenarios, subtle distinctions between similar answers

Return ONLY the JSON array, no other text.
`.trim();
}

export function buildExamGraderPrompt(
  question: string,
  userAnswer: string,
  correctAnswer: string,
  explanation: string
): string {
  return `
You are grading a cybersecurity exam practice answer.

QUESTION: ${question}
USER'S ANSWER: ${userAnswer}
CORRECT ANSWER: ${correctAnswer}
OFFICIAL EXPLANATION: ${explanation}

Provide a brief, encouraging, educational response (2-4 sentences) that:
1. Confirms if the user was correct or incorrect
2. Reinforces the key concept
3. Gives one actionable study tip related to this topic

Keep it concise and supportive. Return plain text, no JSON.
`.trim();
}