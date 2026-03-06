import type { KnowledgeItem, Note, SearchResult } from '../types';

// ─── TF-IDF Search Implementation ────────────────────────────────────────────

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
  'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy',
  'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use', 'that', 'with',
  'this', 'from', 'they', 'have', 'been', 'more', 'when', 'will', 'each',
  'than', 'then', 'into', 'some', 'what', 'there',
]);

function termFrequency(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  for (const token of tokens) {
    if (!STOP_WORDS.has(token)) {
      tf[token] = (tf[token] ?? 0) + 1;
    }
  }
  // Normalize
  const total = tokens.length || 1;
  for (const key in tf) {
    tf[key] = tf[key] / total;
  }
  return tf;
}

function computeIDF(docs: string[][]): Record<string, number> {
  const idf: Record<string, number> = {};
  const N = docs.length;

  for (const tokens of docs) {
    const unique = new Set(tokens.filter((t) => !STOP_WORDS.has(t)));
    for (const term of unique) {
      idf[term] = (idf[term] ?? 0) + 1;
    }
  }

  for (const term in idf) {
    idf[term] = Math.log(N / (idf[term] + 1)) + 1;
  }

  return idf;
}

function tfidfScore(tf: Record<string, number>, idf: Record<string, number>, queryTokens: string[]): number {
  let score = 0;
  for (const token of queryTokens) {
    if (!STOP_WORDS.has(token) && tf[token] && idf[token]) {
      score += tf[token] * idf[token];
    }
  }
  return score;
}

// ─── Knowledge Item Search ────────────────────────────────────────────────────

export function searchKnowledgeItems(
  items: KnowledgeItem[],
  query: string,
  topK = 5
): KnowledgeItem[] {
  if (!query.trim()) return items.slice(0, topK);

  const queryTokens = tokenize(query);
  const docs = items.map((item) => tokenize(`${item.title} ${item.content} ${item.tags.join(' ')}`));
  const idf = computeIDF(docs);

  const scored = items.map((item, i) => {
    const tf = termFrequency(docs[i]);
    const score = tfidfScore(tf, idf, queryTokens);
    return { item, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.item);
}

// ─── Global Search (multi-type) ───────────────────────────────────────────────

export function globalSearch(
  query: string,
  knowledgeItems: KnowledgeItem[],
  notes: Note[],
  topK = 10
): SearchResult[] {
  if (!query.trim()) return [];

  const queryTokens = tokenize(query);

  const allDocs: { type: SearchResult['type']; id: number; title: string; text: string }[] = [
    ...knowledgeItems
      .filter((i) => i.id !== undefined)
      .map((i) => ({
        type: 'knowledge' as const,
        id: i.id!,
        title: i.title,
        text: `${i.title} ${i.content} ${i.tags.join(' ')}`,
      })),
    ...notes
      .filter((n) => n.id !== undefined)
      .map((n) => ({
        type: 'note' as const,
        id: n.id!,
        title: n.title,
        text: `${n.title} ${n.content} ${n.tags.join(' ')}`,
      })),
  ];

  const docs = allDocs.map((d) => tokenize(d.text));
  const idf = computeIDF(docs);

  const results: SearchResult[] = allDocs.map((doc, i) => {
    const tf = termFrequency(docs[i]);
    const score = tfidfScore(tf, idf, queryTokens);
    const excerpt = doc.text.slice(0, 120).trim() + '...';

    return {
      id: doc.id,
      type: doc.type,
      title: doc.title,
      excerpt,
      score,
    };
  });

  return results
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ─── Context retrieval for RAG ────────────────────────────────────────────────

export function retrieveRelevantContext(
  query: string,
  knowledgeItems: KnowledgeItem[],
  maxItems = 3,
  maxChars = 1500
): string {
  const relevant = searchKnowledgeItems(knowledgeItems, query, maxItems);
  if (!relevant.length) return '';

  const parts = relevant.map(
    (item) => `[${item.type.toUpperCase()}] ${item.title}:\n${item.content.slice(0, 500)}`
  );

  const combined = parts.join('\n\n---\n\n');
  return combined.slice(0, maxChars);
}