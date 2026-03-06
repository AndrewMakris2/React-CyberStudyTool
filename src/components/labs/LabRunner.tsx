import { useState } from 'react'
import { Eye, EyeOff, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import type { Lab } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../ui/Button'
import { TextArea } from '../ui/TextArea'
import { Alert } from '../ui/Alert'
import { Badge } from '../ui/Badge'

interface LabRunnerProps {
  lab: Lab
  onSubmit: (response: string) => void
  loading?: boolean
}

export default function LabRunner({ lab, onSubmit, loading }: LabRunnerProps) {
  const [response, setResponse] = useState('')
  const [scenarioExpanded, setScenarioExpanded] = useState(true)
  const labHintsRevealed = useAppStore(s => s.labHintsRevealed)
  const revealNextHint = useAppStore(s => s.revealNextHint)
  const labRubricRevealed = useAppStore(s => s.labRubricRevealed)
  const setLabRubricRevealed = useAppStore(s => s.setLabRubricRevealed)

  const difficultyVariant = {
    easy: 'success', medium: 'warning', hard: 'danger',
  } as const

  return (
    <div className="flex flex-col gap-5">
      {/* Lab header */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-white">{lab.title}</h2>
        <Badge variant={difficultyVariant[lab.difficulty]}>{lab.difficulty}</Badge>
        <Badge variant="info">{lab.type.replace(/-/g, ' ')}</Badge>
      </div>

      <Alert variant="info" title="Lab Instructions">
        Read the scenario carefully. Provide a thorough, structured response. 
        Use hints if stuck. Your response will be graded against the rubric.
      </Alert>

      {/* Scenario */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-750 transition-colors"
          onClick={() => setScenarioExpanded(e => !e)}
        >
          <span className="font-semibold text-white">Scenario</span>
          {scenarioExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {scenarioExpanded && (
          <div className="px-5 pb-5 border-t border-gray-700">
            <pre className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans mt-4">
              {lab.scenario}
            </pre>
          </div>
        )}
      </div>

      {/* Task prompt */}
      <div className="bg-gray-800 border border-cyan-700/40 rounded-xl p-5">
        <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-2">Your Task</p>
        <p className="text-gray-200 leading-relaxed">{lab.prompt}</p>
      </div>

      {/* Hints */}
      {lab.hints.length > 0 && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: labHintsRevealed }).map((_, i) => (
            <div key={i} className="flex gap-3 bg-yellow-900/20 border border-yellow-800/50 rounded-xl p-4">
              <Lightbulb size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-300">{lab.hints[i]}</p>
            </div>
          ))}
          {labHintsRevealed < lab.hints.length && (
            <Button
              variant="outline"
              size="sm"
              onClick={revealNextHint}
              leftIcon={<Lightbulb size={14} />}
              className="self-start border-yellow-700 text-yellow-400 hover:bg-yellow-900/20"
            >
              Reveal Hint {labHintsRevealed + 1} of {lab.hints.length}
            </Button>
          )}
        </div>
      )}

      {/* Rubric reveal */}
      <div>
        <button
          onClick={() => setLabRubricRevealed(!labRubricRevealed)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          {labRubricRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
          {labRubricRevealed ? 'Hide' : 'Show'} Rubric ({lab.rubric.maxScore} pts)
        </button>

        {labRubricRevealed && (
          <div className="mt-3 bg-gray-800 border border-gray-700 rounded-xl p-4">
            <p className="text-sm font-semibold text-white mb-3">Grading Rubric</p>
            <div className="flex flex-col gap-2">
              {lab.rubric.criteria.map(c => (
                <div key={c.id} className="flex items-start gap-3 text-sm">
                  <Badge variant="info" size="sm" className="flex-shrink-0 mt-0.5">{c.points}pts</Badge>
                  <div>
                    <span className="font-medium text-gray-200">{c.label}: </span>
                    <span className="text-gray-400">{c.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Response */}
      <TextArea
        label="Your Response"
        value={response}
        onChange={e => setResponse(e.target.value)}
        placeholder="Provide your structured response here. Address all parts of the task prompt. Use clear headings and bullet points where appropriate..."
        className="min-h-[250px]"
      />

      <Button
        variant="primary"
        onClick={() => onSubmit(response)}
        disabled={!response.trim() || loading}
        loading={loading}
        className="self-start"
      >
        Submit for Grading
      </Button>
    </div>
  )
}