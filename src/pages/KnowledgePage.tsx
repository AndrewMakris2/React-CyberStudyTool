import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import {
  getKnowledgeItems,
  saveKnowledgeItem,
  updateKnowledgeItem,
  deleteKnowledgeItem,
} from '../db'
import type { KnowledgeItem, CertId } from '../types'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import { Alert } from '../components/ui/Alert'
import KnowledgeItemCard from '../components/knowledge/KnowledgeItemCard'
import KnowledgeSearch from '../components/knowledge/KnowledgeSearch'
import KnowledgeEditor from '../components/knowledge/KnowledgeEditor'

export default function KnowledgePage() {
  const activeCertId = useAppStore(s => s.activeCertId)
  const showToast = useAppStore(s => s.showToast)

  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loadItems = async () => {
    const data = await getKnowledgeItems(activeCertId)
    const sorted = data.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    setItems(sorted)
    setFilteredItems(sorted)
  }

  useEffect(() => { loadItems() }, [activeCertId])

  useEffect(() => {
    if (!typeFilter) {
      setFilteredItems(items)
    } else {
      setFilteredItems(items.filter(i => i.type === typeFilter))
    }
  }, [typeFilter, items])

  const handleSave = async (itemData: Omit<KnowledgeItem, 'id'>) => {
    try {
      if (editingItem?.id) {
        await updateKnowledgeItem(editingItem.id, itemData)
        showToast('Knowledge item updated', 'success')
      } else {
        await saveKnowledgeItem(itemData)
        showToast('Knowledge item saved', 'success')
      }
      setShowEditor(false)
      setEditingItem(null)
      await loadItems()
    } catch (err) {
      setError('Failed to save item')
    }
  }

  const handleDelete = async (id: number) => {
    await deleteKnowledgeItem(id)
    showToast('Item deleted', 'info')
    await loadItems()
  }

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item)
    setShowEditor(true)
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
          <p className="text-gray-400 text-sm mt-1">
            Your personal reference library. Items here are used to augment AI responses.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => { setEditingItem(null); setShowEditor(true) }}
          leftIcon={<Plus size={14} />}
        >
          Add Item
        </Button>
      </div>

      {error && <Alert variant="danger" onClose={() => setError(null)}>{error}</Alert>}

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <KnowledgeSearch items={items} onResults={setFilteredItems} />
        </div>
        <div className="w-48">
          <Select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            options={[
              { value: '', label: 'All Types' },
              { value: 'definition', label: 'Definitions' },
              { value: 'procedure', label: 'Procedures' },
              { value: 'command', label: 'Commands' },
              { value: 'cheatsheet', label: 'Cheat Sheets' },
              { value: 'reference', label: 'References' },
            ]}
          />
        </div>
      </div>

      {/* Stats */}
      {items.length > 0 && (
        <div className="flex gap-4 text-sm text-gray-400">
          <span>{items.length} total items</span>
          <span>·</span>
          <span>{filteredItems.length} shown</span>
        </div>
      )}

      {/* Items grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-5xl mb-4">📚</div>
          <p className="font-medium">
            {items.length === 0 ? 'No knowledge items yet' : 'No items match your search'}
          </p>
          <p className="text-sm mt-1">
            {items.length === 0
              ? 'Add definitions, procedures, commands, and reference material'
              : 'Try a different search or filter'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <KnowledgeItemCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Editor modal */}
      <Modal
        open={showEditor}
        onClose={() => { setShowEditor(false); setEditingItem(null) }}
        size="lg"
      >
        <KnowledgeEditor
          certId={activeCertId as CertId}
          initialItem={editingItem ?? undefined}
          onSave={handleSave}
          onCancel={() => { setShowEditor(false); setEditingItem(null) }}
        />
      </Modal>
    </div>
  )
}