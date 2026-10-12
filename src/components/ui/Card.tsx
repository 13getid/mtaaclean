/**
 * components/ui/Card.tsx
 *
 * Brutalist card — 2px border, no border-radius, configurable padding.
 * Optional hover shadow (for clickable/interactive cards).
 */

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  as?: 'div' | 'article' | 'section' | 'li'
}

export function Card({
  children,
  className = '',
  hoverable = false,
  as: Tag = 'div',
}: CardProps) {
  return (
    <Tag
      className={[
        'card-brutal',
        hoverable
          ? 'transition-shadow duration-150 hover:shadow-brutal cursor-pointer'
          : '',
        className,
      ].join(' ')}
    >
      {children}
    </Tag>
  )
}
