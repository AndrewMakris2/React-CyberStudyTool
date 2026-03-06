import { useState } from 'react'
import { Copy, Download, Plus } from 'lucide-react'
import type { GeneratedSummary, Flashcard, CertId } from '../../types'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Tabs, TabList, TabTrigger, TabContent } from '../ui/Tabs'

interface GeneratedArtifactsProps {
  summary: GeneratedSummary
  pendingFlashcards: Omit<Flashcard, 'id'>[]
  onSaveFlashcards: () => void
  certId: CertId
}

export default function GeneratedArtifacts({
  summary, pendingFlashcards, onSaveFlashcards, certId
}: GeneratedArtifactsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary.summary)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultTab="summary">
        <TabList>
          <TabTrigger value="summary">Summary</TabTrigger>
          <TabTrigger value="terms">Key Terms ({summary.keyTerms.length})</TabTrigger>
          <TabTrigger value="flashcards">Flashcards ({pendingFlashcards.length})</TabTrigger>
        </TabList>

        <TabContent value="summary">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCopySummary}>
                <Copy size={14} /> {copied ? 'Copied!' : 'Copy'}
              </Button>
            </CardHeader>
            <p className="text-gray-300 text-sm leading-relaxed">{summary.summary}</p>
          </Card>
        </TabContent>

        <TabContent value="terms">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Key Terms</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-3">
              {summary.keyTerms.map((term, i) => (
                <div key={i} className="border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                  <p className="text-sm font-semibold text-cyan-400">{term.term}</p>
                  <p className="text-sm text-gray-300 mt-0.5">{term.definition}</p>
                </div>
              ))}
            </div>
          </Card>
        </TabContent>

        <TabContent value="flashcards">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{pendingFlashcards.length} cards ready to save</p>
              <Button
                variant="primary"
                size="sm"
                onClick={onSaveFlashcards}
                leftIcon={<Plus size={14} />}
              >
                Save to Deck
              </Button>
            </div>
            {pendingFlashcards.map((card, i) => (
              <Card key={i} variant="default" padding="sm">
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="text-xs text-cyan-400 font-medium">Q: </span>
                    <span className="text-sm text-gray-200">{card.front}</span>
                  </div>
                  <div>
                    <span className="text-xs text-green-400 font-medium">A: </span>
                    <span className="text-sm text-gray-300">{card.back}</span>
                  </div>
                  {card.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {card.tags.map(tag => (
                        <Badge key={tag} size="sm">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabContent>
      </Tabs>
    </div>
  )
}