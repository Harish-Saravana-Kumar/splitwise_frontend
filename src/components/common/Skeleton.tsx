import './skeleton.css'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  lines?: number
}

const toCssSize = (value: string | number | undefined, fallback: string) => {
  if (value === undefined) {
    return fallback
  }

  return typeof value === 'number' ? `${value}px` : value
}

export default function Skeleton({
  width,
  height,
  borderRadius,
  lines = 1,
}: SkeletonProps) {
  const resolvedHeight = toCssSize(height, '0.9rem')
  const resolvedRadius = toCssSize(borderRadius, '0.25rem')
  const resolvedWidth = toCssSize(width, '100%')

  if (lines <= 1) {
    return (
      <span
        className="skeleton-block"
        style={{
          width: resolvedWidth,
          height: resolvedHeight,
          borderRadius: resolvedRadius,
        }}
      />
    )
  }

  return (
    <span className="skeleton-multiline">
      {Array.from({ length: lines }).map((_, index) => {
        const isLast = index === lines - 1
        return (
          <span
            key={index}
            className="skeleton-block"
            style={{
              width: width === undefined ? (isLast ? '72%' : '100%') : resolvedWidth,
              height: resolvedHeight,
              borderRadius: resolvedRadius,
            }}
          />
        )
      })}
    </span>
  )
}
