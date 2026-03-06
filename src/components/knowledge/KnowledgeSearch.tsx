import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import type { KnowledgeItem } from '../../types'
import { searchKnowledgeItems } from '../../utils/search'
import { Input } from '../ui/Input'

interface KnowledgeSearchProps {
  items: KnowledgeItem[]
  onResults: (results: KnowledgeItem[]) => void
}

export default function KnowledgeSearch({ items, onResults }: KnowledgeSearchProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!query.trim()) {
      onResults(items)
      return
    }
    const results = searchKnowledgeItems(items, query, 50)
    onResults(results)
  }, [query, items])

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search knowledge base..."
        leftIcon={<Search size={14} />}
        rightIcon={query ? (
          <button onClick={() => setQuery('')} className="hover:text-white transition-colors">
            <X size={14} />
          </button>
        ) : undefined}
      />
    </div>
  )
}