import type { LabType, Difficulty, CertId } from '../types';

export function buildLabSystemPrompt(): string {
  return `
You are an expert cybersecurity educator running interactive text-based lab simulations for certification exam preparation.

Labs are purely educational and defensive in nature. You simulate realistic scenarios to help students develop analytical and decision-making skills relevant to their certification exams.

SAFETY: All lab content must be defensive, educational, and exam-oriented. Do not provide actual exploitation techniques, working attack code, or instructions that could enable real harm. Frame all scenarios from an analyst, defender, or assessor perspective.

When generating labs:
- Make scenarios realistic but clearly fictional
- Include enough detail to make analysis meaningful
- Provide rubrics that assess analytical thinking, not memorization
- Use real-world relevant frameworks (NIST, MITRE ATT&CK, OWASP, etc.) at a conceptual level
`.trim();
}

export function buildLabGenPrompt(
  labType: LabType,
  difficulty: Difficulty,
  certId: CertId,
  domainName: string
): string {
  const certLabel = certId.replace(/-/g, ' ').toUpperCase();

  const labTypeDescriptions: Record<LabType, string> = {
    'log-analysis': 'Present realistic sample log entries (firewall, IDS, syslog, web server, Windows Event logs) and ask the student to identify indicators of malicious activity, classify severity, and propose an initial response.',
    'network-troubleshooting': 'Describe a network topology and symptoms. Ask the student to propose a systematic troubleshooting approach, identify likely root causes, and recommend solutions.',
    'incident-response': 'Present a security incident timeline with evidence. Ask the student to identify the incident type, execute IR phases (contain, eradicate, recover), and produce a post-incident summary.',
    'threat-modeling': 'Describe an application or system. Ask the student to apply STRIDE (or similar) threat modeling, identify threats, rate risk, and propose mitigations.',
    'vulnerability-triage': 'Present a list of vulnerabilities (with CVSS scores and context). Ask the student to prioritize remediation, justify decisions, and propose compensating controls where immediate patching is not possible.',
  };

  return `
Generate a ${difficulty} difficulty ${labType.replace(/-/g, ' ')} lab for ${certLabel} - Domain: ${domainName}.

LAB TYPE DESCRIPTION: ${labTypeDescriptions[labType]}

OUTPUT FORMAT (strict JSON):
{
  "title": "Lab title",
  "scenario": "Detailed scenario description with all necessary context, data, logs, topology, or vulnerability list. Make it realistic and detailed enough for meaningful analysis. For log analysis, include 10-20 actual log line examples. For network troubleshooting, describe the topology and symptoms clearly.",
  "prompt": "The specific task/question(s) the student must answer. Be explicit about what deliverables are expected.",
  "hints": [
    "Hint 1 (most gentle, directional)",
    "Hint 2 (more specific)",
    "Hint 3 (near-answer level)"
  ],
  "rubric": {
    "maxScore": 100,
    "criteria": [
      {
        "id": "c1",
        "label": "Criterion name",
        "description": "What this criterion assesses",
        "points": 25
      }
    ]
  },
  "modelAnswer": "A comprehensive model answer covering all rubric criteria. This is shown when student reveals the rubric/answer."
}

DIFFICULTY GUIDELINES:
- easy: clear indicators, straightforward analysis, single root cause
- medium: multiple indicators, some ambiguity, requires synthesis
- hard: complex multi-stage scenario, subtle indicators, requires deep analysis and creativity

Return ONLY valid JSON, no extra text.
`.trim();
}

export function buildLabGraderPrompt(
  labTitle: string,
  scenario: string,
  taskPrompt: string,
  userResponse: string,
  rubric: string,
  modelAnswer: string
): string {
  return `
You are grading a cybersecurity lab exercise response.

LAB: ${labTitle}
SCENARIO: ${scenario}
TASK: ${taskPrompt}
RUBRIC: ${rubric}
MODEL ANSWER: ${modelAnswer}

STUDENT RESPONSE:
${userResponse}

Grade the student's response against the rubric. Be fair, educational, and specific.

OUTPUT FORMAT (strict JSON):
{
  "overallScore": 75,
  "maxScore": 100,
  "criteriaResults": [
    {
      "criterionId": "c1",
      "label": "Criterion name",
      "earned": 20,
      "max": 25,
      "feedback": "Specific feedback on this criterion"
    }
  ],
  "strengths": ["What the student did well"],
  "improvements": ["What needs improvement"],
  "actionableNext": ["Specific study recommendations based on gaps"]
}

Be encouraging but honest. Return ONLY valid JSON.
`.trim();
}