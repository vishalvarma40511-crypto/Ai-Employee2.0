import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'

const links = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Navbar() {
  const { setView } = useApp()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2"
    >
      <div
        className={`flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-500 ${
          scrolled ? 'glass-strong glow-blue' : 'glass'
        }`}
      >
        <a href="#" className="flex items-center gap-2.5">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-neon">
            <Sparkles className="h-5 w-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-electric to-neon blur-md opacity-50" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-white">
            BusinessOS<span className="text-gradient"> AI</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <button
            onClick={() => setView('role_select')}
            className="text-sm font-medium text-slate-300 cursor-pointer transition-colors hover:text-white"
          >
            Sign In
          </button>
          <button
            onClick={() => setView('role_select')}
            className="rounded-xl bg-gradient-to-r from-electric to-neon px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-electric/30 cursor-pointer transition-transform hover:scale-105"
          >
            Start Free
          </button>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg glass md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 flex flex-col gap-1 rounded-2xl glass-strong p-4 md:hidden"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setOpen(false)
                setView('role_select')
              }}
              className="mt-2 rounded-xl bg-gradient-to-r from-electric to-neon px-5 py-3 text-center text-sm font-semibold text-white cursor-pointer"
            >
              Start Free
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
