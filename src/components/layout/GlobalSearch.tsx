import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FileText, BookOpen, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { getNotes, getKnowledgeItems } from '../../db'
import { globalSearch } from '../../utils/search'
import type { SearchResult } from '../../types'

export default function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const setSearchOpen = useAppStore(s => s.setSearchOpen)
  const activeCertId = useAppStore(s => s.activeCertId)
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setSearchOpen])

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const [notes, knowledge] = await Promise.all([
          getNotes(activeCertId),
          getKnowledgeItems(activeCertId),
        ])
        const r = globalSearch(query, knowledge, notes)
        setResults(r)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [query, activeCertId])

  const handleSelect = (result: SearchResult) => {
    setSearchOpen(false)
    if (result.type === 'note') navigate('/notes')
    else if (result.type === 'knowledge') navigate('/knowledge')
    else if (result.type === 'flashcard') navigate('/flashcards')
  }

  const typeIcon = (type: SearchResult['type']) => {
    if (type === 'note') return <FileText size={14} className="text-blue-400" />
    if (type === 'knowledge') return <BookOpen size={14} className="text-green-400" />
    return <Search size={14} className="text-gray-400" />
  }

  const typeLabel = (type: SearchResult['type']) => {
    if (type === 'note') return 'Note'
    if (type === 'knowledge') return 'Knowledge'
    if (type === 'flashcard') return 'Flashcard'
    return 'Objective'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
      <div className="relative w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-700">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notes, knowledge items, objectives..."
            className="flex-1 bg-transparent text-gray-100 placeholder:text-gray-500 focus:outline-none text-sm"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-gray-600 border-t-cyan-500 rounded-full animate-spin" />
          )}
          <button onClick={() => setSearchOpen(false)} className="text-gray-500 hover:text-gray-300">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {results.length === 0 && query.trim() && !loading && (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No results found for "{query}"
            </div>
          )}
          {results.length === 0 && !query.trim() && (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              Start typing to search across your notes and knowledge base
            </div>
          )}
          {results.map((result, i) => (
            <button
              key={`${result.type}-${result.id}-${i}`}
              onClick={() => handleSelect(result)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-700 transition-colors text-left border-b border-gray-700/50 last:border-0"
            >
              <div className="mt-0.5">{typeIcon(result.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white truncate">{result.title}</span>
                  <span className="text-xs text-gray-500 flex-shrink-0">{typeLabel(result.type)}</span>
                </div>
                <p className="text-xs text-gray-400 truncate">{result.excerpt}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="px-4 py-2 border-t border-gray-700 flex items-center gap-4 text-xs text-gray-500">
          <span>↵ to select</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  )
}