import { useState } from 'react'
import { Save, X } from 'lucide-react'
import type { KnowledgeItem, KnowledgeItemType, CertId } from '../../types'
import { CERTS_DATA } from '../../data/objectives'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import { Select } from '../ui/Select'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface KnowledgeEditorProps {
  certId: CertId
  initialItem?: Partial<KnowledgeItem>
  onSave: (item: Omit<KnowledgeItem, 'id'>) => void
  onCancel: () => void
}

const TYPE_OPTIONS: { value: KnowledgeItemType; label: string }[] = [
  { value: 'definition', label: 'Definition' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'command', label: 'Command / Syntax' },
  { value: 'cheatsheet', label: 'Cheat Sheet' },
  { value: 'reference', label: 'Reference' },
]

export default function KnowledgeEditor({ certId, initialItem, onSave, onCancel }: KnowledgeEditorProps) {
  const [title, setTitle] = useState(initialItem?.title ?? '')
  const [content, setContent] = useState(initialItem?.content ?? '')
  const [type, setType] = useState<KnowledgeItemType>(initialItem?.type ?? 'definition')
  const [domainId, setDomainId] = useState(initialItem?.domainId ?? '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initialItem?.tags ?? [])

  const cert = CERTS_DATA.find(c => c.id === certId)
  const domainOptions = cert?.domains.map(d => ({ value: d.id, label: d.name })) ?? []

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags(prev => [...prev, t])
    setTagInput('')
  }

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return
    onSave({
      title: title.trim(),
      content: content.trim(),
      type,
      certId,
      domainId: domainId || undefined,
      tags,
      createdAt: initialItem?.createdAt ?? new Date(),
      updatedAt: new Date(),
    })
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">
          {initialItem?.id ? 'Edit Item' : 'New Knowledge Item'}
        </h3>
        <Button variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Type"
          value={type}
          onChange={e => setType(e.target.value as KnowledgeItemType)}
          options={TYPE_OPTIONS}
        />
        <Select
          label="Domain (optional)"
          value={domainId}
          onChange={e => setDomainId(e.target.value)}
          options={domainOptions}
          placeholder="Any domain..."
        />
      </div>

      <Input
        label="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Item title..."
      />

      <TextArea
        label="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Enter content, definition, command syntax, or notes..."
        className="min-h-[160px]"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-gray-300">Tags</label>
        <div className="flex flex-wrap gap-1 mb-1">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full cursor-pointer hover:bg-red-900/30 hover:text-red-400 transition-colors"
              onClick={() => setTags(prev => prev.filter(t => t !== tag))}
            >
              {tag} ×
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="Add tag..."
          />
          <Button variant="outline" size="md" onClick={addTag}>Add</Button>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-gray-700">
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={!title.trim() || !content.trim()}
          leftIcon={<Save size={14} />}
          className="flex-1"
        >
          Save Item
        </Button>
      </div>
    </div>
  )
}