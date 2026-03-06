import { useState, useRef } from 'react'
import { Upload, Save, X } from 'lucide-react'
import type { Note, CertId } from '../../types'
import { CERTS_DATA } from '../../data/objectives'
import { Input } from '../ui/Input'
import { TextArea } from '../ui/TextArea'
import { Button } from '../ui/Button'
import { Select } from '../ui/Select'

interface NoteEditorProps {
  certId: CertId
  initialNote?: Partial<Note>
  onSave: (note: Omit<Note, 'id'>) => void
  onCancel: () => void
}

export default function NoteEditor({ certId, initialNote, onSave, onCancel }: NoteEditorProps) {
  const [title, setTitle] = useState(initialNote?.title ?? '')
  const [content, setContent] = useState(initialNote?.content ?? '')
  const [domainId, setDomainId] = useState(initialNote?.domainId ?? '')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(initialNote?.tags ?? [])
  const fileRef = useRef<HTMLInputElement>(null)

  const cert = CERTS_DATA.find(c => c.id === certId)
  const domainOptions = cert?.domains.map(d => ({ value: d.id, label: d.name })) ?? []

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      setContent(text)
      if (!title) setTitle(file.name.replace(/\.(txt|md)$/, ''))
    }
    reader.readAsText(file)
  }

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
      certId,
      domainId: domainId || undefined,
      tags,
      createdAt: initialNote?.createdAt ?? new Date(),
      updatedAt: new Date(),
    })
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">{initialNote ? 'Edit Note' : 'New Note'}</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}><X size={16} /></Button>
      </div>

      <Input
        label="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Note title..."
      />

      <Select
        label="Domain (optional)"
        value={domainId}
        onChange={e => setDomainId(e.target.value)}
        options={domainOptions}
        placeholder="Select domain..."
      />

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Content</label>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Upload size={12} /> Upload .txt / .md
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".txt,.md" className="hidden" onChange={handleFile} />
        <TextArea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste your notes here or upload a file..."
          className="min-h-[200px]"
        />
      </div>

      {/* Tags */}
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
          Save Note
        </Button>
      </div>
    </div>
  )
}