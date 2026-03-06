import { useEffect, useState } from 'react'
import { Plus, FileText, Trash2, Wand2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useSettingsStore } from '../store/useSettingsStore'
import {
  getNotes, saveNote, updateNote, deleteNote,
  saveSummary, createDeck, addFlashcards, getDecks,
} from '../db'
import { groqChat } from '../llm/groqClient'
import { buildFlashcardSystemPrompt, buildFlashcardUserPrompt } from '../prompts/flashcard'
import { createCardDefaults } from '../utils/spacedRepetition'
import { CERTS_DATA } from '../data/objectives'
import type { Note, GeneratedSummary, Flashcard, CertId } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import NoteEditor from '../components/notes/NoteEditor'
import GeneratedArtifacts from '../components/notes/GeneratedArtifacts'

export default function NotesPage() {
  const activeCertId = useAppStore(s => s.activeCertId)
  const showToast = useAppStore(s => s.showToast)
  const groqApiKey = useSettingsStore(s => s.groqApiKey)

  const [notes, setNotes] = useState<Note[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [summaryData, setSummaryData] = useState<GeneratedSummary | null>(null)
  const [pendingFlashcards, setPendingFlashcards] = useState<Omit<Flashcard, 'id'>[]>([])
  const [showArtifacts, setShowArtifacts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadNotes = async () => {
    const n = await getNotes(activeCertId)
    setNotes(n.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
  }

  useEffect(() => { loadNotes() }, [activeCertId])

  const handleSaveNote = async (noteData: Omit<Note, 'id'>) => {
    if (editingNote?.id) {
      await updateNote(editingNote.id, noteData)
      showToast('Note updated', 'success')
    } else {
      await saveNote(noteData)
      showToast('Note saved', 'success')
    }
    setShowEditor(false)
    setEditingNote(null)
    await loadNotes()
  }

  const handleDeleteNote = async (id: number) => {
    await deleteNote(id)
    if (selectedNote?.id === id) setSelectedNote(null)
    showToast('Note deleted', 'info')
    await loadNotes()
  }

  const handleGenerateSummary = async (note: Note) => {
    if (!groqApiKey) { setError('Add your Groq API key in Settings to use AI features.'); return }
    setGeneratingSummary(true)
    setError(null)
    try {
      const cert = CERTS_DATA.find(c => c.id === note.certId)
      const domain = cert?.domains.find(d => d.id === note.domainId)
      const response = await groqChat({
        messages: [
          { role: 'system', content: buildFlashcardSystemPrompt() },
          { role: 'user', content: buildFlashcardUserPrompt(note.content, note.certId, domain?.name ?? 'General', true) },
        ],
        maxTokens: 3000,
        temperature: 0.5,
      })
      const jsonMatch = response.content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Invalid response format from AI')
      const parsed = JSON.parse(jsonMatch[0])
      const summary: GeneratedSummary = {
        noteId: note.id!,
        summary: parsed.summary ?? '',
        keyTerms: parsed.keyTerms ?? [],
        createdAt: new Date(),
      }
      await saveSummary(summary)
      setSummaryData(summary)
      const defaults = createCardDefaults()
      const allCards = [...(parsed.flashcards ?? []), ...(parsed.clozeCards ?? [])].map((c: any) => ({
        deckId: 0, certId: note.certId, domainId: note.domainId,
        front: c.front, back: c.back, type: c.type ?? 'basic', tags: c.tags ?? [], ...defaults,
      }))
      setPendingFlashcards(allCards)
      setShowArtifacts(true)
      showToast('Summary and flashcards generated!', 'success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary')
    } finally {
      setGeneratingSummary(false)
    }
  }

  const handleSaveFlashcards = async () => {
    if (!selectedNote || pendingFlashcards.length === 0) return
    try {
      const existingDecks = await getDecks(activeCertId)
      const deckName = `${selectedNote.title} Flashcards`
      let deckId: number
      const existing = existingDecks.find(d => d.name === deckName)
      if (existing?.id) {
        deckId = existing.id
      } else {
        deckId = await createDeck({
          name: deckName, certId: activeCertId as CertId,
          domainId: selectedNote.domainId, tags: selectedNote.tags,
          createdAt: new Date(), updatedAt: new Date(),
        })
      }
      await addFlashcards(pendingFlashcards.map(c => ({ ...c, deckId })))
      showToast(`${pendingFlashcards.length} flashcards saved to deck!`, 'success')
      setShowArtifacts(false)
    } catch {
      showToast('Failed to save flashcards', 'error')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-2xl font-bold text-white">Notes</h1>
          <p className="text-sm text-muted mt-2">
            Paste or upload notes, then generate summaries and flashcards with AI.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => { setEditingNote(null); setShowEditor(true) }}
          leftIcon={<Plus size={14} />}
        >
          New Note
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)}>{error}</Alert>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>

        {/* ── Note list ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.2, color: '#fff', display: 'block' }} />
              <p style={{ color: '#555', fontSize: '14px' }}>No notes yet</p>
              <p style={{ color: '#3a3a3a', fontSize: '12px', marginTop: '4px' }}>Create your first note to get started</p>
            </div>
          ) : (
            notes.map(note => (
              <button
                key={note.id}
                onClick={() => setSelectedNote(note)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '14px',
                  borderRadius: '12px',
                  border: `1px solid ${selectedNote?.id === note.id ? 'rgba(147,51,234,0.5)' : '#242424'}`,
                  background: selectedNote?.id === note.id ? 'rgba(126,34,206,0.12)' : '#171717',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: '#fff', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {note.title}
                    </p>
                    <p style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: '11px', color: '#444', marginTop: '5px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {note.content.slice(0, 100)}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleDeleteNote(note.id!) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', flexShrink: 0, padding: '2px', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#444')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {note.tags.slice(0, 3).map(t => (
                      <Badge key={t} size="sm">{t}</Badge>
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>

        {/* ── Note content ── */}
        <div>
          {selectedNote ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{selectedNote.title}</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditingNote(selectedNote); setShowEditor(true) }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleGenerateSummary(selectedNote)}
                    loading={generatingSummary}
                    disabled={!groqApiKey}
                    leftIcon={<Wand2 size={14} />}
                  >
                    Generate Summary + Flashcards
                  </Button>
                </div>
              </div>

              <div style={{
                background: '#171717',
                border: '1px solid #242424',
                borderRadius: '12px',
                padding: '20px',
              }}>
                <pre style={{
                  fontSize: '13px',
                  color: '#ccc',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  lineHeight: '1.7',
                  margin: 0,
                }}>
                  {selectedNote.content}
                </pre>
              </div>

              {showArtifacts && summaryData && (
                <GeneratedArtifacts
                  summary={summaryData}
                  pendingFlashcards={pendingFlashcards}
                  onSaveFlashcards={handleSaveFlashcards}
                  certId={activeCertId as CertId}
                />
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
              background: '#171717',
              border: '1px solid #242424',
              borderRadius: '14px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.15, color: '#fff', display: 'block' }} />
                <p style={{ color: '#444', fontSize: '14px' }}>Select a note to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showEditor}
        onClose={() => { setShowEditor(false); setEditingNote(null) }}
        size="lg"
      >
        <NoteEditor
          certId={activeCertId as CertId}
          initialNote={editingNote ?? undefined}
          onSave={handleSaveNote}
          onCancel={() => { setShowEditor(false); setEditingNote(null) }}
        />
      </Modal>
    </div>
  )
}