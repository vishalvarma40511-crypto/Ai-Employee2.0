import { Suspense, lazy, useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ChevronDown, Play, Pause, X, Volume2, VolumeX } from 'lucide-react'
import { Canvas } from '@react-three/fiber'
import MagneticButton from './MagneticButton'
import { useApp } from '../context/AppContext'

const HeroScene = lazy(() => import('../three/HeroScene'))

const logos = ['TESLA', 'STRIPE', 'LINEAR', 'VERCEL', 'OPENAI', 'ARC', 'NOTHING', 'FIGMA']

const subItems = [
  'Manage inventory.',
  'Generate invoices.',
  'Talk to customers.',
  'Predict sales.',
  'Create marketing.',
  'Automate workflows.',
]

interface DemoSlide {
  title: string
  desc: string
  visual: 'bots' | 'owner' | 'customer' | 'automation' | 'collab'
}

const DEMO_SLIDES: Record<'en' | 'hi' | 'te', DemoSlide[]> = {
  en: [
    {
      title: "1. Meet the AI Bot Fleet! 🤖",
      desc: "BusinessOS gives you a team of 8 smart AI robot helpers. There is a Store Manager, a Finance bot, an Inventory checker, a Sales optimizer, a Marketing writer, an HR scheduler, an Analyst, and Customer Support! Each has its own skills.",
      visual: 'bots'
    },
    {
      title: "2. Owner Command Center! 📊",
      desc: "As the store owner, you get a cool dashboard. You can watch sales charts, check employee shifts and check-in attendance logs, see marketing clicks, and look at live business profit ledgers!",
      visual: 'owner'
    },
    {
      title: "3. Customer Shop & Showrooms! 🛍️",
      desc: "Your customers get a beautiful storefront portal! They can filter items using category tabs, buy products instantly, choose nearest physical experience store showrooms in Gurgaon, Bengaluru, or Mumbai, and get answers from Customer Support.",
      visual: 'customer'
    },
    {
      title: "4. Automated Bill & Restock! 📦",
      desc: "When a customer buys an item, BusinessOS automatically deducts warehouse stock, generates Indian GST invoices, schedules local drone delivery, and logs the profit instantly into your files!",
      visual: 'automation'
    },
    {
      title: "5. Cross-Agent Collaboration! 🤝",
      desc: "Best of all, your AI agents cooperate like a real office! They share stock warnings, generate marketing discount codes for slow items, and suggest replenishment orders to make you more money. It's fully automated!",
      visual: 'collab'
    }
  ],
  hi: [
    {
      title: "1. अपने रोबोट सहायकों से मिलें! 🤖",
      desc: "बिजनेस ओएस आपको 8 स्मार्ट रोबोट सहायकों की एक टीम देता है। इसमें स्टोर मैनेजर, फाइनेंस बॉट, इन्वेंटरी चेकर, सेल्स ऑप्टिमाइज़र, मार्केटिंग राइटर, एचआर शेड्यूलर, एनालिस्ट और कस्टमर सपोर्ट शामिल हैं! हर एक के पास अपनी खास कला है।",
      visual: 'bots'
    },
    {
      title: "2. मालिक का कमांड सेंटर! 📊",
      desc: "स्टोर के मालिक के रूप में, आपको एक शानदार डैशबोर्ड मिलता है। आप सेल्स चार्ट देख सकते हैं, कर्मचारियों की शिफ्ट और उपस्थिति लॉग चेक कर सकते हैं, विज्ञापन क्लिक देख सकते हैं, और मुनाफ़े का लाइव हिसाब रख सकते हैं!",
      visual: 'owner'
    },
    {
      title: "3. कस्टमर शॉप और शोरूम! 🛍️",
      desc: "आपके ग्राहकों को एक सुंदर स्टोरफ्रंट पोर्टल मिलता है! वे कैटेगरी चुनकर सामान फ़िल्टर कर सकते हैं, तुरंत खरीद सकते हैं, गुरुग्राम, बेंगलुरु या मुंबई में पास के शोरूम देख सकते हैं, और ग्राहक सहायता से बात कर सकते हैं।",
      visual: 'customer'
    },
    {
      title: "4. स्वचालित बिल और रीस्टॉक! 📦",
      desc: "जब कोई ग्राहक सामान खरीदता है, तो बिजनेस ओएस अपने आप स्टॉक कम कर देता है, भारतीय जीएसटी बिल बनाता है, ड्रोन डिलीवरी शेड्यूल करता है, और मुनाफे को आपके खातों में तुरंत दर्ज कर लेता है!",
      visual: 'automation'
    },
    {
      title: "5. आपस में तालमेल! 🤝",
      desc: "सबसे अच्छी बात यह है कि आपके एआई एजेंट एक असली ऑफिस की तरह मिलकर काम करते हैं! वे स्टॉक कम होने की सूचना साझा करते हैं, कम बिकने वाले सामान के लिए डिस्काउंट कोड बनाते हैं, और आपका मुनाफा बढ़ाने के सुझाव देते हैं!",
      visual: 'collab'
    }
  ],
  te: [
    {
      title: "1. మీ రోబోట్ సహాయకులను కలవండి! 🤖",
      desc: "బిజినెస్ ఓఎస్ మీకు 8 స్మార్ట్ రోబోట్ సహాయకుల బృందాన్ని ఇస్తుంది. ఇందులో స్టోర్ మేనేజర్, ఫైనాన్స్ బాట్, ఇన్వెంటరీ చెకర్, సేల్స్ ఆప్టిమైజర్, మార్కెటింగ్ రైటర్, హెచ్ఆర్ షెడ్యూలర్, అనలిస్ట్ మరియు కస్టమర్ సపోర్ట్ ఉన్నారు! ప్రతి ఒక్కరికి ప్రత్యేక నైపుణ్యాలు ఉన్నాయి.",
      visual: 'bots'
    },
    {
      title: "2. యజమాని కమాండ్ సెంటర్! 📊",
      desc: "షాప్ యజమానిగా, మీరు ఒక అద్భుతమైన డాష్‌బోర్డ్‌ను పొందుతారు. మీరు సేల్స్ చార్ట్‌లను చూడవచ్చు, ఉద్యోగుల షిఫ్ట్‌లు మరియు హాజరు లాగ్‌లను చెక్ చేయవచ్చు, యాడ్ క్లిక్‌లను చూడవచ్చు మరియు లైవ్ లాభాలను పర్యవేక్షించవచ్చు!",
      visual: 'owner'
    },
    {
      title: "3. కస్టమర్ షాప్ & షోరూమ్‌లు! 🛍️",
      desc: "మీ కస్టమర్లకు ఒక అందమైన ఆన్‌లైన్ స్టోర్ లభిస్తుంది! వారు కేటగిరీల వారీగా వస్తువులను ఫిల్టర్ చేయవచ్చు, వెంటనే కొనుగోలు చేయవచ్చు, గుర్గావ్, బెంగళూరు లేదా ముంబైలోని సమీప షోరూమ్‌లను చూడవచ్చు మరియు కస్టమర్ సపోర్ట్‌తో మాట్లాడవచ్చు.",
      visual: 'customer'
    },
    {
      title: "4. ఆటోమేటెడ్ బిల్ & రీస్టాక్! 📦",
      desc: "కస్టమర్ ఏదైనా వస్తువును కొనుగోలు చేసినప్పుడు, బిజినెస్ ఓఎస్ స్వయంచాలకంగా స్టాక్‌ను తగ్గిస్తుంది, భారతీయ జీఎస్టీ బిల్లులను సృష్టిస్తుంది, డ్రోన్ డెలివరీని షెడ్యూల్ చేస్తుంది మరియు లాభాలను వెంటనే నమోదు చేస్తుంది!",
      visual: 'automation'
    },
    {
      title: "5. రోబోల పరస్పర సహకారం! 🤝",
      desc: "అన్నింటికంటే ఉత్తమమైనది, మీ రోబోలు ఒకరితో ఒకరు మాట్లాడుకుని పని చేస్తాయి! స్టాక్ అలర్ట్‌లను పంచుకుంటాయి, తక్కువగా అమ్ముడయ్యే వస్తువులకు డిస్కౌంట్ కోడ్‌లను సృష్టిస్తాయి మరియు మీ లాభాలను పెంచడానికి కొనుగోలు ఆర్డర్లను సూచిస్తాయి!",
      visual: 'collab'
    }
  ]
}

export default function Hero() {
  const { setView } = useApp()
  const [showDemoModal, setShowDemoModal] = useState(false)
  const [demoLang, setDemoLang] = useState<'en' | 'hi' | 'te'>('en')
  const [activeSlide, setActiveSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceGender, setVoiceGender] = useState<'boy' | 'girl'>('girl')

  const timerRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    const updateVoices = () => {
      setVoices(window.speechSynthesis.getVoices())
    }
    updateVoices()
    window.speechSynthesis.onvoiceschanged = updateVoices
  }, [])

  const isTeluguVoiceInstalled = voices.some(v => v.lang.toLowerCase().startsWith('te'))

  const slides = DEMO_SLIDES[demoLang]

  // Clear/Pause all audio sources instantly
  const cancelAllAudio = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel()
      } catch { }
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause()
      } catch { }
    }
  }, [])

  // Play online TTS when native support is missing
  const playOnlineTTS = useCallback((text: string, languageCode: string) => {
    cancelAllAudio()
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${languageCode}&client=tw-ob&q=${encodeURIComponent(text)}`
    const audio = new Audio(url)
    audioRef.current = audio
    if (!isMuted) {
      audio.play().catch(e => {
        console.warn('Online TTS failed:', e)
      })
    }
  }, [cancelAllAudio, isMuted])

  // Speak narration text aloud using Web Speech Synthesis with API audio fallback
  const speakText = useCallback((text: string, lang: 'en' | 'hi' | 'te') => {
    cancelAllAudio()
    if (isMuted) return

    // If language is Telugu, and there is no native Telugu voice in the browser, fallback to bulletproof Google TTS API!
    const localVoices = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.getVoices() : []
    const hasLocalVoice = localVoices.some(v => v.lang.toLowerCase().startsWith(lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en'))

    if (lang === 'te' && !hasLocalVoice) {
      playOnlineTTS(text, 'te')
      return
    }

    try {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        playOnlineTTS(text, lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en')
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      const langPrefix = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en'
      const matched = localVoices.filter(v => v.lang.toLowerCase().startsWith(langPrefix))

      const maleKeywords = ['male', 'david', 'ravi', 'karan', 'hari', 'prabhat', 'madhur', 'guy', 'microsoft david', 'microsoft ravi', 'microsoft hemant', 'zoira']

      let selectedVoice: SpeechSynthesisVoice | null = null
      if (matched.length > 0) {
        if (voiceGender === 'boy') {
          selectedVoice = matched.find(v => maleKeywords.some(kw => v.name.toLowerCase().includes(kw))) || matched[0]
        } else {
          selectedVoice = matched.find(v => !maleKeywords.some(kw => v.name.toLowerCase().includes(kw))) || matched[0]
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice
      } else {
        if (lang === 'hi') {
          utterance.lang = 'hi-IN'
        } else if (lang === 'te') {
          utterance.lang = 'te-IN'
        } else {
          utterance.lang = 'en-US'
        }
      }

      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn('Speech synthesis failed, falling back to online TTS:', e)
      playOnlineTTS(text, lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en')
    }
  }, [cancelAllAudio, isMuted, playOnlineTTS, voiceGender])

  // Handle Play/Pause logic
  useEffect(() => {
    if (isPlaying && showDemoModal) {
      speakText(slides[activeSlide].desc, demoLang)

      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setActiveSlide((curr) => {
              const next = (curr + 1) % 5
              speakText(slides[next].desc, demoLang)
              return next
            })
            return 0
          }
          return prev + 1.25 // takes about 8 seconds per slide
        })
      }, 100)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      cancelAllAudio()
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, activeSlide, demoLang, showDemoModal, isMuted, voiceGender, slides, speakText, cancelAllAudio])

  // Stop synthesis when closed
  useEffect(() => {
    return () => {
      cancelAllAudio()
    }
  }, [cancelAllAudio])

  // Reset progress and play voice when slide index or language is manually selected
  const handleSelectSlide = (idx: number) => {
    setActiveSlide(idx)
    setProgress(0)
    if (isPlaying) {
      speakText(slides[idx].desc, demoLang)
    }
  }

  const handleSelectLang = (lang: 'en' | 'hi' | 'te') => {
    setDemoLang(lang)
    setProgress(0)
    if (isPlaying) {
      speakText(DEMO_SLIDES[lang][activeSlide].desc, lang)
    }
  }

  // Stop synthesis when closed
  const handleCloseModal = () => {
    setShowDemoModal(false)
    setIsPlaying(false)
    setProgress(0)
    setActiveSlide(0)
    cancelAllAudio()
  }

  // @ts-ignore
  const _handleOpenModal = () => {
    setShowDemoModal(true)
    setIsPlaying(true)
    setProgress(0)
    setActiveSlide(0)

    // Unlock browser audio context for HTML5 Audio & Speech Synthesis
    try {
      const audio = new Audio()
      audio.play().catch(() => { })
    } catch { }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        const u = new SpeechSynthesisUtterance('')
        window.speechSynthesis.speak(u)
      } catch { }
    }
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden aurora-bg noise">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-40" />
      {/* Gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-base z-[2]" />

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-[1]">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}>
          <Suspense fallback={null}>
            <HeroScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Aurora blobs */}
      <div className="pointer-events-none absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-electric/20 blur-[120px] animate-float-slow" />
      <div className="pointer-events-none absolute -right-40 top-40 h-[400px] w-[400px] rounded-full bg-neon/20 blur-[120px] animate-float" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-cyan/10 blur-[100px]" />

      {/* Content */}
      <div className="relative z-[3] flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-7 flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium text-cyan-bright"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-bright" />
          </span>
          Now powered by Gemini Pro · Live AI agents
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="font-display max-w-5xl text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-[5.5rem]"
        >
          Run Your Entire Business
          <br />
          With One{' '}
          <span className="text-gradient aurora-animate bg-[length:200%_auto]">
            AI Employee
          </span>
        </motion.h1>

        {/* Rotating sub-features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-base text-slate-400 sm:text-lg"
        >
          {subItems.map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.08 }}
              className="rounded-full glass px-3 py-1 text-sm"
            >
              {item}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-4 text-base text-slate-500 sm:text-lg"
        >
          Everything powered by AI.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.25, duration: 0.8 }}
          className="mt-9 flex flex-col items-center gap-4 sm:flex-row"
        >
          <MagneticButton
            onClick={() => setView('role_select')}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-electric to-neon px-8 py-4 text-base font-semibold text-white shadow-xl shadow-electric/30 cursor-pointer"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="absolute inset-0 shimmer opacity-30" />
          </MagneticButton>
        </motion.div>

        {/* Company logos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 1 }}
          className="mt-20 w-full max-w-4xl"
        >
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-slate-600">
            Trusted by forward-thinking teams
          </p>
          <div className="relative overflow-hidden">
            <div className="flex w-max animate-marquee gap-12">
              {[...logos, ...logos].map((logo, i) => (
                <span
                  key={i}
                  className="font-display text-xl font-bold tracking-wider text-slate-600/70 transition-colors hover:text-slate-400"
                >
                  {logo}
                </span>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-base to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-base to-transparent" />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 z-[3] flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-xs text-slate-500">Scroll to explore</span>
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-slate-600 p-1">
          <motion.div
            animate={{ y: [0, 14, 0], opacity: [1, 0, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-cyan-bright"
          />
        </div>
        <ChevronDown className="h-4 w-4 text-slate-600" />
      </motion.div>

      {/* Interactive Project Demo Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-strong w-full max-w-3xl rounded-3xl overflow-hidden border border-white/10 flex flex-col relative aspect-video shadow-2xl shadow-blue-500/10"
            >
              {/* Top bar control */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 shrink-0 bg-base-100/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white tracking-wide flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-bright" />
                    </span>
                    Interactive Demo Walkthrough
                  </span>
                </div>

                {/* Controls: Language & Voice selectors */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Language selectors */}
                  <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/5">
                    <button
                      onClick={() => handleSelectLang('en')}
                      className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${demoLang === 'en'
                        ? 'bg-electric text-white shadow shadow-electric/20'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      🇺🇸 En
                    </button>
                    <button
                      onClick={() => handleSelectLang('hi')}
                      className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${demoLang === 'hi'
                        ? 'bg-electric text-white shadow shadow-electric/20'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      🇮🇳 हि
                    </button>
                    <button
                      onClick={() => handleSelectLang('te')}
                      className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer ${demoLang === 'te'
                        ? 'bg-electric text-white shadow shadow-electric/20'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      🇮🇳 తె
                    </button>
                  </div>

                  {/* Voice Gender Switcher */}
                  <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5 border border-white/5">
                    <button
                      onClick={() => {
                        setVoiceGender('girl')
                        if (isPlaying) speakText(DEMO_SLIDES[demoLang][activeSlide].desc, demoLang)
                      }}
                      className={`rounded px-2 py-1 text-[9px] font-bold transition-all cursor-pointer ${voiceGender === 'girl'
                        ? 'bg-electric text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      👧 Girl
                    </button>
                    <button
                      onClick={() => {
                        setVoiceGender('boy')
                        if (isPlaying) speakText(DEMO_SLIDES[demoLang][activeSlide].desc, demoLang)
                      }}
                      className={`rounded px-2 py-1 text-[9px] font-bold transition-all cursor-pointer ${voiceGender === 'boy'
                        ? 'bg-electric text-white'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      👦 Boy
                    </button>
                  </div>

                  <button
                    onClick={handleCloseModal}
                    className="rounded-lg bg-white/5 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Simulation Screen Viewport */}
              <div className="flex-1 bg-black/40 relative flex items-center justify-center p-6 overflow-hidden">

                {/* Screen Content based on current slide */}
                <AnimatePresence mode="wait">
                  {activeSlide === 0 && (
                    <motion.div
                      key="visual-bots"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {/* Orbital Central Core */}
                      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-electric/30 to-neon/30 border border-electric/40 shadow-lg glow-blue animate-pulse">
                        <span className="text-center font-display text-[10px] font-bold text-white tracking-wider">BusinessOS<br />Core</span>
                      </div>

                      {/* Orbital Bot circles */}
                      {[
                        { emoji: '🏪', angle: 0 },
                        { emoji: '💰', angle: 45 },
                        { emoji: '📦', angle: 90 },
                        { emoji: '📈', angle: 135 },
                        { emoji: '📣', angle: 180 },
                        { emoji: '💬', angle: 225 },
                        { emoji: '📊', angle: 270 },
                        { emoji: '👥', angle: 315 }
                      ].map((item, idx) => {
                        const rad = (item.angle * Math.PI) / 180
                        const x = Math.cos(rad) * 110
                        const y = Math.sin(rad) * 110
                        return (
                          <motion.div
                            key={idx}
                            animate={{
                              y: [y, y - 8, y],
                              x: [x, x + 5, x]
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              delay: idx * 0.3
                            }}
                            style={{ x, y }}
                            className="absolute flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow text-xl"
                          >
                            {item.emoji}
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  )}

                  {activeSlide === 1 && (
                    <motion.div
                      key="visual-owner"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      className="absolute inset-0 flex flex-col justify-center p-6 space-y-4 max-w-md mx-auto"
                    >
                      <div className="glass p-4 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">📈 Owner Dashboard controls</span>
                          <span className="text-[9px] text-cyan-bright font-bold">Active</span>
                        </div>

                        {/* simulated charts */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-[8px] text-slate-400">
                            <span>Today's Profit Ledger</span>
                            <span className="font-mono text-cyan-bright">₹18,450.00 (Lakhs layout)</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-bright w-3/4 rounded-full" />
                          </div>
                        </div>

                        {/* attendee checkin roster */}
                        <div className="grid grid-cols-3 gap-2 pt-1.5">
                          <div className="bg-black/20 p-2 rounded-xl text-center border border-white/[0.02]">
                            <p className="text-[7px] text-slate-500">Marcus (Manager)</p>
                            <p className="text-[9px] font-bold text-emerald-400 mt-0.5">Present ✅</p>
                          </div>
                          <div className="bg-black/20 p-2 rounded-xl text-center border border-white/[0.02]">
                            <p className="text-[7px] text-slate-500">Clara (Cashier)</p>
                            <p className="text-[9px] font-bold text-amber-400 mt-0.5">Late ⏳</p>
                          </div>
                          <div className="bg-black/20 p-2 rounded-xl text-center border border-white/[0.02]">
                            <p className="text-[7px] text-slate-500">Elena (Admin)</p>
                            <p className="text-[9px] font-bold text-emerald-400 mt-0.5">Present ✅</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeSlide === 2 && (
                    <motion.div
                      key="visual-customer"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="absolute inset-0 flex flex-col justify-center p-6 space-y-3 max-w-sm mx-auto"
                    >
                      <div className="glass p-4 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider">🛍️ Storefront catalog</span>
                          <span className="text-[8px] bg-cyan/10 text-cyan-bright px-1.5 py-0.5 rounded-full font-bold">14 items</span>
                        </div>

                        {/* Category filter tabs */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          <span className="text-[8px] font-bold rounded-lg bg-electric text-white px-2 py-0.5 shrink-0">🌐 All</span>
                          <span className="text-[8px] font-medium rounded-lg glass text-slate-400 px-2 py-0.5 shrink-0">🎧 Electronics</span>
                          <span className="text-[8px] font-medium rounded-lg glass text-slate-400 px-2 py-0.5 shrink-0">🧥 Apparel</span>
                        </div>

                        {/* Showroom info */}
                        <div className="rounded-xl bg-black/25 p-2.5 border border-white/[0.02]">
                          <p className="text-[9px] font-semibold text-white">📍 DLF CyberCity, Gurgaon</p>
                          <p className="text-[8px] text-slate-400 mt-0.5">Building 10, Tower B, Phase 3 · <strong>1.2 km away</strong></p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeSlide === 3 && (
                    <motion.div
                      key="visual-automation"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 flex flex-col justify-center items-center p-6"
                    >
                      {/* Step flow chart */}
                      <div className="flex items-center gap-3 w-full max-w-md">
                        {[
                          { title: 'Checkout 🛒', activeRange: [0, 25] },
                          { title: 'Stock Deduct 📦', activeRange: [25, 50] },
                          { title: 'GST Bill 📄', activeRange: [50, 75] },
                          { title: 'Drone Deliver 🛸', activeRange: [75, 101] }
                        ].map((step, idx) => {
                          const isActive = progress >= step.activeRange[0] && progress < step.activeRange[1]
                          return (
                            <div key={idx} className="flex-1 flex items-center gap-2">
                              <motion.div
                                animate={{
                                  scale: isActive ? 1.05 : 1,
                                  borderColor: isActive ? '#3b82f6' : 'rgba(255,255,255,0.05)'
                                }}
                                className={`flex-1 p-2 rounded-xl text-center text-[8px] font-bold border transition-colors ${isActive ? 'bg-electric/15 text-white glow-blue' : 'glass text-slate-500'
                                  }`}
                              >
                                {step.title}
                              </motion.div>
                              {idx < 3 && <span className="text-slate-700 text-xs">→</span>}
                            </div>
                          )
                        })}
                      </div>

                      {/* GST simulation card */}
                      <motion.div
                        animate={{ opacity: progress >= 50 ? 1 : 0.2 }}
                        className="mt-6 glass p-3.5 rounded-2xl border border-white/5 w-64 text-left"
                      >
                        <p className="text-[9px] font-bold text-white uppercase tracking-wider">POS Digital Invoice</p>
                        <div className="border-t border-white/5 pt-2 mt-1.5 text-[8px] font-mono text-slate-400 space-y-1">
                          <div className="flex justify-between"><span>Base Amount:</span><span className="text-white">₹3,999.00</span></div>
                          <div className="flex justify-between"><span>CGST (9%):</span><span className="text-white">₹359.91</span></div>
                          <div className="flex justify-between"><span>SGST (9%):</span><span className="text-white">₹359.91</span></div>
                          <div className="flex justify-between border-t border-white/5 pt-1 text-white font-bold"><span>Total Paid:</span><span className="text-cyan-bright">₹4,718.82</span></div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}

                  {activeSlide === 4 && (
                    <motion.div
                      key="visual-collab"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="absolute inset-0 flex flex-col justify-end p-6 space-y-2.5 max-w-md mx-auto"
                    >
                      {/* Message 1 */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex gap-2.5 items-start bg-white/[0.02] border border-white/5 p-2.5 rounded-2xl self-start"
                      >
                        <span className="text-xl">🏪</span>
                        <div>
                          <p className="text-[8px] font-bold text-white leading-none">Store Manager AI</p>
                          <p className="text-[9px] text-slate-300 mt-1">"Hey team, how are our profits looking today?"</p>
                        </div>
                      </motion.div>

                      {/* Message 2 */}
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2.2 }}
                        className="flex gap-2.5 items-start bg-white/[0.02] border border-electric/25 p-2.5 rounded-2xl self-end text-right flex-row-reverse"
                      >
                        <span className="text-xl">💰</span>
                        <div>
                          <p className="text-[8px] font-bold text-white leading-none">Financial AI</p>
                          <p className="text-[9px] text-slate-300 mt-1">"Revenues are at ₹38k, net profits are ₹18k! Taxes resolved."</p>
                        </div>
                      </motion.div>

                      {/* Message 3 */}
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 4.2 }}
                        className="flex gap-2.5 items-start bg-white/[0.02] border border-white/5 p-2.5 rounded-2xl self-start"
                      >
                        <span className="text-xl">📦</span>
                        <div>
                          <p className="text-[8px] font-bold text-white leading-none">Inventory AI</p>
                          <p className="text-[9px] text-slate-300 mt-1">"Low stocks on green tea reordered. Procurement logs submitted!"</p>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Subtitles & Narration Box */}
              <div className="px-6 py-4 bg-base-200/40 border-t border-white/5 flex flex-col shrink-0">
                <div className="text-center min-h-[64px] flex flex-col items-center justify-center">
                  <h4 className="text-sm font-bold text-white mb-1.5">{slides[activeSlide].title}</h4>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">{slides[activeSlide].desc}</p>
                  {demoLang === 'te' && !isTeluguVoiceInstalled && (
                    <p className="text-[9px] text-amber-400 mt-1 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg inline-block">
                      ⚠️ Note: Telugu voice pack not detected in your browser. Audio falls back to default.
                    </p>
                  )}
                </div>

                {/* Video controls */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="rounded-full bg-electric hover:bg-electric-bright p-2 text-white transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="h-4.5 w-4.5 fill-white" /> : <Play className="h-4.5 w-4.5 fill-white ml-0.5" />}
                    </button>

                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="rounded-lg bg-white/5 hover:bg-white/10 p-2 text-slate-300 transition-colors cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
                    </button>
                  </div>

                  {/* Visual Timeline Indicators */}
                  <div className="flex gap-2 items-center">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectSlide(i)}
                        className={`h-2.5 rounded-full transition-all cursor-pointer ${activeSlide === i ? 'bg-electric w-6' : 'bg-white/10 w-2.5 hover:bg-white/20'
                          }`}
                      />
                    ))}
                  </div>

                  <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                    Scene {activeSlide + 1} / 5
                  </span>
                </div>

                {/* Progress bar timeline */}
                <div className="h-1 bg-white/10 relative rounded-full overflow-hidden mt-3.5">
                  <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-electric to-neon transition-all duration-100" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
