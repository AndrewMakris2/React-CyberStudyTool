import { useSettingsStore } from '../store/useSettingsStore'

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface GroqRequestOptions {
  messages: GroqMessage[]
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface GroqResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class GroqError extends Error {
  statusCode?: number
  retryable?: boolean

  constructor(message: string, statusCode?: number, retryable?: boolean) {
    super(message)
    this.name = 'GroqError'
    this.statusCode = statusCode
    this.retryable = retryable
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error = new Error('Unknown error')
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err as Error
      if (err instanceof GroqError && !err.retryable) throw err
      if (attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, baseDelay * Math.pow(2, attempt)))
      }
    }
  }
  throw lastError
}

export async function groqChat(options: GroqRequestOptions): Promise<GroqResponse> {
  const settings = useSettingsStore.getState()
  const apiKey = settings.groqApiKey
  const model = options.model ?? settings.groqModel

  if (!apiKey) {
    throw new GroqError(
      'No API key configured. Please add your Groq API key in Settings.',
      401,
      false
    )
  }

  return withRetry(async () => {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as Record<string, any>
      const msg = errorBody?.error?.message ?? `HTTP ${response.status}`
      if (response.status === 401) throw new GroqError(`Invalid API key: ${msg}`, 401, false)
      if (response.status === 429) throw new GroqError(`Rate limited: ${msg}`, 429, true)
      if (response.status >= 500) throw new GroqError(`Groq server error: ${msg}`, response.status, true)
      throw new GroqError(`API error: ${msg}`, response.status, false)
    }

    const data = await response.json() as Record<string, any>
    return {
      content: data?.choices?.[0]?.message?.content ?? '',
      usage: data?.usage,
    }
  })
}

export async function groqChatStream(
  options: GroqRequestOptions,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): Promise<void> {
  const settings = useSettingsStore.getState()
  const apiKey = settings.groqApiKey
  const model = options.model ?? settings.groqModel

  if (!apiKey) {
    onError(new GroqError('No API key configured.', 401, false))
    return
  }

  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({})) as Record<string, any>
      const msg = errorBody?.error?.message ?? `HTTP ${response.status}`
      if (response.status === 401) throw new GroqError(`Invalid API key: ${msg}`, 401, false)
      if (response.status === 429) throw new GroqError(`Rate limited. Please wait and retry.`, 429, true)
      throw new GroqError(`API error: ${msg}`, response.status, false)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new GroqError('No response body', 500, false)

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue
        try {
          const json = JSON.parse(trimmed.slice(6)) as Record<string, any>
          const delta = json?.choices?.[0]?.delta?.content
          if (delta) onChunk(delta)
        } catch {
          // ignore malformed SSE lines
        }
      }
    }
    onDone()
  } catch (err) {
    onError(err instanceof Error ? err : new Error(String(err)))
  }
}

export async function testGroqKey(
  apiKey: string,
  model: string
): Promise<{ ok: boolean; message: string }> {
  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 10,
        stream: false,
      }),
    })
    if (response.ok) return { ok: true, message: 'API key is valid and working.' }
    const errorBody = await response.json().catch(() => ({})) as Record<string, any>
    const msg = errorBody?.error?.message ?? `HTTP ${response.status}`
    if (response.status === 401) return { ok: false, message: `Invalid API key: ${msg}` }
    if (response.status === 429) return { ok: false, message: `Rate limited: ${msg}` }
    return { ok: false, message: `Error: ${msg}` }
  } catch (err) {
    return {
      ok: false,
      message: `Network error: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}