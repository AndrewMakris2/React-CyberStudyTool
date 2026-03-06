import { Edit2, Trash2, Tag } from 'lucide-react'
import type { KnowledgeItem } from '../../types'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface KnowledgeItemCardProps {
  item: KnowledgeItem
  onEdit: (item: KnowledgeItem) => void
  onDelete: (id: number) => void
}

const TYPE_COLORS = {
  definition: 'info',
  procedure: 'purple',
  command: 'warning',
  cheatsheet: 'success',
  reference: 'default',
} as const

export default function KnowledgeItemCard({ item, onEdit, onDelete }: KnowledgeItemCardProps) {
  return (
    <Card variant="elevated" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant={TYPE_COLORS[item.type]} size="sm">{item.type}</Badge>
            <h3 className="font-semibold text-white text-sm">{item.title}</h3>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
            <Edit2 size={14} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(item.id!)}
            className="hover:text-red-400">
            <Trash2 size={14} />
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed line-clamp-4 whitespace-pre-wrap">
        {item.content}
      </p>

      {item.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Tag size={12} className="text-gray-500" />
          {item.tags.map(tag => (
            <Badge key={tag} size="sm">{tag}</Badge>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-600">
        Updated {new Date(item.updatedAt).toLocaleDateString()}
      </p>
    </Card>
  )
}