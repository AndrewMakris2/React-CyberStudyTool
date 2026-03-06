import { useState } from 'react'
import type { PracticeQuestion } from '../../types'
import { TextArea } from '../ui/TextArea'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Badge } from '../ui/Badge'

interface PBQRendererProps {
  question: PracticeQuestion
  onSubmit: (response: string) => void
  disabled?: boolean
}

export default function PBQRenderer({ question, onSubmit, disabled }: PBQRendererProps) {
  const [response, setResponse] = useState('')

  return (
    <div className="flex flex-col gap-4">
      <Alert variant="info" title="Performance-Based Question">
        Read the scenario carefully. Provide a structured response addressing all parts of the task.
      </Alert>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <Badge variant="purple" size="sm" className="mb-3">Scenario</Badge>
        <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-sm">{question.stem}</p>
      </div>

      <TextArea
        label="Your Response"
        value={response}
        onChange={e => setResponse(e.target.value)}
        placeholder="Provide your structured response here. Be thorough and address all parts of the scenario..."
        className="min-h-[200px]"
        disabled={disabled}
      />

      <Button
        variant="primary"
        onClick={() => onSubmit(response)}
        disabled={!response.trim() || disabled}
      >
        Submit Response
      </Button>
    </div>
  )
}