import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, Battery, MessageSquareText } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function SMSSimulator() {
  const { activeSMS, setActiveSMS } = useApp()

  // Auto-hide incoming SMS widget after 8 seconds
  useEffect(() => {
    if (activeSMS) {
      const timer = setTimeout(() => {
        setActiveSMS(null)
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [activeSMS, setActiveSMS])

  return (
    <AnimatePresence>
      {activeSMS && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-6 right-6 z-50 w-72 h-[155px] rounded-3xl bg-black border-4 border-slate-700 shadow-2xl overflow-hidden shadow-cyan/20 flex flex-col justify-between text-slate-200 select-none text-left"
        >
          {/* Mock Smartphone Status Bar */}
          <div className="bg-black/60 px-3 py-1 flex justify-between items-center text-[9px] font-mono text-slate-500 shrink-0">
            <span>12:00</span>
            <div className="w-10 h-3 rounded-full bg-slate-800 absolute left-1/2 -translate-x-1/2 top-0.5" />
            <div className="flex items-center gap-1">
              <Wifi className="h-2.5 w-2.5" />
              <Battery className="h-3 w-3" />
            </div>
          </div>

          {/* SMS Notification Banner Body */}
          <div className="flex-1 p-3 flex flex-col justify-between">
            <div className="flex gap-2">
              <div className="h-7 w-7 rounded-full bg-cyan/15 border border-cyan/35 flex items-center justify-center text-cyan-bright shrink-0 mt-0.5 animate-pulse">
                <MessageSquareText className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-black text-white truncate">QUANTUM-STORES</span>
                  <span className="text-[7px] text-slate-500 font-mono">Just now</span>
                </div>
                <p className="text-[9px] leading-relaxed text-slate-300 font-medium select-text line-clamp-4 mt-1 bg-white/[0.02] border border-white/5 p-1.5 rounded-xl font-mono">
                  {activeSMS.body}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom phone swipe bar */}
          <div className="bg-black/20 pb-1.5 pt-0.5 flex justify-center shrink-0">
            <button
              onClick={() => setActiveSMS(null)}
              className="w-16 h-1 rounded-full bg-slate-600 hover:bg-slate-400 transition-colors cursor-pointer"
              title="Swipe up to dismiss"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
