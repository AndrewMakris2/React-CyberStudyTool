import type { CertId } from '../types';

export function buildFlashcardSystemPrompt(): string {
  return `
You are an expert cybersecurity educator creating study flashcards for certification exams.
Your flashcards must be:
- Accurate and technically precise
- Concise on the front (question/term), thorough but focused on the back (answer/definition)
- Exam-relevant: tied to what actually appears on certification tests
- Free of ambiguity

SAFETY: Only create educational content. Do not create cards that teach exploitation techniques, malware creation, or illegal activities.
`.trim();
}

export function buildFlashcardUserPrompt(
  notes: string,
  certId: CertId,
  domainName: string,
  includeClze: boolean
): string {
  const certLabel = certId.replace(/-/g, ' ').toUpperCase();

  return `
Generate flashcards from the following notes for ${certLabel} - Domain: ${domainName}.

NOTES:
${notes}

OUTPUT FORMAT (strict JSON, no markdown wrapper):
{
  "summary": "2-4 sentence concise summary of the notes",
  "keyTerms": [
    { "term": "string", "definition": "string" }
  ],
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition",
      "type": "basic",
      "tags": ["tag1", "tag2"]
    }
  ]${includeClze ? `,
  "clozeCards": [
    {
      "front": "Sentence with {{blank}} for the missing term",
      "back": "The complete sentence / the missing term is: X",
      "type": "cloze",
      "tags": ["tag1"]
    }
  ]` : ''}
}

RULES:
- Generate 8-15 basic flashcards minimum
- ${includeClze ? 'Generate 3-5 cloze deletion cards' : 'No cloze cards needed'}
- Tags should include relevant topics, acronyms, and the domain name
- Key terms list: 5-10 most important terms from the notes
- Summary: capture the essence of the material in 2-4 sentences
- Return ONLY valid JSON, no extra text
`.trim();
}