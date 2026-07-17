import { useRef, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

export default function MagneticButton({
  children,
  className = '',
  onClick,
  strength = 0.4,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  strength?: number
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const handleMove = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    setPos({
      x: (e.clientX - (rect.left + rect.width / 2)) * strength,
      y: (e.clientY - (rect.top + rect.height / 2)) * strength,
    })
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  )
}
