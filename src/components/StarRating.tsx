'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  value: number
  onChange: (value: number) => void
  label: string
}

export function StarRating({ value, onChange, label }: Props) {
  const [hovered, setHovered] = useState(0)

  return (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none"
            aria-label={`${star} estrella${star !== 1 ? 's' : ''}`}
          >
            <Star
              className={cn(
                'h-7 w-7 transition-colors',
                (hovered || value) >= star
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
