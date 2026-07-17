import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Mic, Paperclip, Sparkles, Volume2, VolumeX, ArrowLeft, Square } from 'lucide-react'
import { VoiceListener, speakText, stopSpeaking } from '../services/voice'
import { useApp } from '../context/AppContext'
import type { AppDBState } from '../services/db'
import { BOT_PROFILES, getBotResponse } from '../services/ai'
import type { AIMessage } from '../services/ai'

type Msg = { role: 'ai' | 'user'; text: string }

export function getResponse(text: string, dbState: AppDBState): string {
  // Wrapper for backwards compatibility in voice assistant
  return getBotResponse(text, 'manager', dbState, [])
}

export default function AIAssistant() {
  const { dbState } = useApp()
  const [open, setOpen] = useState(false)
  const [activeBotId, setActiveBotId] = useState('manager')
  const [messages, setMessages] = useState<Msg[]>([
    { 
      role: 'ai', 
      text: "Greetings! I am your Store Manager AI. I orchestrate operations, monitor overall metrics, and advise on store optimization. Ask me for a \"business review\" or how we are performing today." 
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [voiceListening, setVoiceListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const voiceListenerRef = useRef<VoiceListener | null>(null)

  useEffect(() => {
    voiceListenerRef.current = new VoiceListener()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, displayedText, typing])

  const activeBot = BOT_PROFILES.find((b) => b.id === activeBotId) || BOT_PROFILES[0]
  const suggestions = activeBot.suggestions

  const triggerVoiceInput = () => {
    if (!voiceListenerRef.current) return

    if (voiceListening) {
      voiceListenerRef.current.stop()
      setVoiceListening(false)
      return
    }

    setVoiceListening(true)
    voiceListenerRef.current.start({
      onResult: (text) => {
        setVoiceListening(false)
        setInput(text)
        send(text)
      },
      onError: (err) => {
        console.error('Voice assistant error:', err)
        setVoiceListening(false)
      },
      onEnd: () => {
        setVoiceListening(false)
      }
    })
  }

  const send = (text: string) => {
    if (!text.trim()) return
    const userMsg: Msg = { role: 'user', text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setTyping(true)
    setDisplayedText('')

    // Map conversation history to AIMessage type
    const history: AIMessage[] = messages.map((m) => ({
      role: m.role,
      text: m.text,
    }))

    const response = getBotResponse(text, activeBotId, dbState, history)
    
    setTimeout(() => {
      setTyping(false)
      let i = 0
      const interval = setInterval(() => {
        if (i <= response.length) {
          setDisplayedText(response.slice(0, i))
          i++
        } else {
          clearInterval(interval)
          setMessages((m) => [...m, { role: 'ai', text: response }])
          setDisplayedText('')
          if (voiceEnabled) {
            speakText(response)
          }
        }
      }, 12)
    }, 500)
  }

  const handleBotSwitch = (botId: string) => {
    const selectedBot = BOT_PROFILES.find((b) => b.id === botId) || BOT_PROFILES[0]
    setActiveBotId(botId)
    setMessages((m) => [
      ...m,
      { role: 'ai', text: `[System]: Switched communication channel to **${selectedBot.name}**.` },
      { role: 'ai', text: selectedBot.greeting }
    ])
  }

  return (
    <>
      {/* Toggle button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring' }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-neon shadow-xl glow-blue cursor-pointer"
        aria-label="Open AI assistant"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6 text-white" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageSquare className="h-6 w-6 text-white" />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-cyan-bright" />
          </span>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            className="fixed bottom-24 right-6 z-[100] flex h-[580px] max-h-[calc(100dvh-8rem)] w-[calc(100vw-3rem)] max-w-md flex-col overflow-hidden rounded-3xl glass-strong shadow-2xl glow-blue sm:h-[580px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                {/* Back button to close assistant */}
                <button
                  onClick={() => setOpen(false)}
                  className="mr-0.5 rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
                  title="Minimize AI Assistant"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${activeBot.color}`}>
                  <span className="text-xl">{activeBot.emoji}</span>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-base bg-green-400" />
                </div>
                <div>
                  <p className="font-display text-xs sm:text-sm font-semibold text-white truncate max-w-[120px] sm:max-w-none">{activeBot.name}</p>
                  <p className="text-[9px] sm:text-[10px] text-green-400">Online · Business Manager</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setVoiceEnabled(!voiceEnabled)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                  title={voiceEnabled ? 'Mute AI read-out' : 'Enable AI voice speaker'}
                >
                  {voiceEnabled ? <Volume2 className="h-4.5 w-4.5 text-cyan-bright" /> : <VolumeX className="h-4.5 w-4.5" />}
                </button>
                <button
                  onClick={stopSpeaking}
                  className="text-slate-400 hover:text-red-400 p-1 cursor-pointer transition-colors"
                  title="Stop AI voice speaking"
                >
                  <Square className="h-4 w-4" />
                </button>
                <Sparkles className="h-4 w-4 text-cyan-bright" />
              </div>
            </div>

            {/* AI Agent Selection scroll list */}
            <div className="flex gap-2 overflow-x-auto px-4 py-2 border-b border-white/5 bg-black/25 scrollbar-none shrink-0">
              {BOT_PROFILES.map((bot) => {
                const isSelected = activeBotId === bot.id
                return (
                  <button
                    key={bot.id}
                    onClick={() => handleBotSwitch(bot.id)}
                    className={`flex items-center gap-1 shrink-0 rounded-xl px-2.5 py-1.5 text-[9px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? `bg-gradient-to-r ${bot.color} text-white shadow-md shadow-black/40 scale-102`
                        : 'glass text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{bot.emoji}</span>
                    <span>{bot.name.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar">
              {messages.map((msg, i) => {
                const isSystem = msg.text.startsWith('[System]:')
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isSystem ? 'justify-center' : msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {isSystem ? (
                      <div className="rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-[9px] text-slate-400 font-semibold font-mono">
                        {msg.text.replace('[System]: ', '')}
                      </div>
                    ) : (
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-electric to-neon text-white font-semibold shadow-md'
                            : 'glass-card text-slate-200 border border-white/5'
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}
                  </motion.div>
                )
              })}

              {/* Typing indicator / streaming response */}
              {(typing || displayedText) && (
                <div className="flex justify-start">
                  <div className="glass-card max-w-[85%] rounded-2xl px-4 py-2.5 text-xs text-slate-200 leading-relaxed border border-white/5">
                    {typing ? (
                      <div className="flex gap-1.5 py-1">
                        {[0, 1, 2].map((d) => (
                          <motion.span
                            key={d}
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                            className="h-1.5 w-1.5 rounded-full bg-slate-400"
                          />
                        ))}
                      </div>
                    ) : (
                      <span>{displayedText}<span className="animate-pulse">▋</span></span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full glass px-2.5 py-1.5 text-[10px] text-slate-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2 rounded-xl glass p-2">
                <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-white">
                  <Paperclip className="h-4 w-4" />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send(input)}
                  placeholder={voiceListening ? 'Listening to voice...' : `Ask ${activeBot.name}...`}
                  className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={triggerVoiceInput}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                    voiceListening ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/30' : 'text-slate-400 hover:text-cyan-bright'
                  }`}
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  onClick={() => send(input)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-neon text-white cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
