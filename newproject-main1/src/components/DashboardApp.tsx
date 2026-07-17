import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Activity,
  Wallet,
  Package,
  TrendingUp,
  Megaphone,
  Users,
  User,
  Heart,
  LogOut,
  Bell,
  Sun,
  Moon,
  Mic,
  ChevronDown,
  Shield,
  Volume2,
  Menu,
  X,
  MessageSquare,
  Send,
  Square,
  Globe,
  ShoppingCart,
  ShoppingBag,
  FileText
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { UserRole } from '../context/AppContext'
import { VoiceListener, speakText, stopSpeaking } from '../services/voice'
import BillingPanel from './dashboard/BillingPanel'
import OrdersPanel from './dashboard/OrdersPanel'

// Panel Imports
import OverviewPanel from './dashboard/OverviewPanel'
import FinancePanel from './dashboard/FinancePanel'
import InventoryPanel from './dashboard/InventoryPanel'
import SalesPanel from './dashboard/SalesPanel'
import MarketingPanel from './dashboard/MarketingPanel'
import EmployeesPanel from './dashboard/EmployeesPanel'
import CustomersPanel from './dashboard/CustomersPanel'
import RequestCenterPanel from './dashboard/RequestCenterPanel'
import ProfilePanel from './dashboard/ProfilePanel'
import InvoicePanel from './dashboard/InvoicePanel'
import IntelligentDynamicBg from './dashboard/IntelligentDynamicBg'
import { getResponse } from './AIAssistant'

const locationLanguages: Record<string, { name: string; languages: { code: 'en' | 'te' | 'hi' | 'mr' | 'ur' | 'kn'; label: string; nativeLabel: string }[] }> = {
  vijayawada: {
    name: 'Vijayawada',
    languages: [
      { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
      { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
      { code: 'en', label: 'English', nativeLabel: 'English' }
    ]
  },
  delhi: {
    name: 'Delhi NCR',
    languages: [
      { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
      { code: 'en', label: 'English', nativeLabel: 'English' }
    ]
  },
  hyderabad: {
    name: 'Hyderabad',
    languages: [
      { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
      { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
      { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
      { code: 'en', label: 'English', nativeLabel: 'English' }
    ]
  },
  mumbai: {
    name: 'Mumbai',
    languages: [
      { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
      { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
      { code: 'en', label: 'English', nativeLabel: 'English' }
    ]
  },
  bengaluru: {
    name: 'Bengaluru',
    languages: [
      { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
      { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
      { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
      { code: 'en', label: 'English', nativeLabel: 'English' }
    ]
  }
}

export default function DashboardApp() {
  const {
    activeTab,
    setActiveTab,
    role,
    setRole,
    logout,
    theme,
    toggleTheme,
    dbState,
    updateDbState,
    triggerLog,
    notifications,
    dismissNotification,
  } = useApp()

  const [notifOpen, setNotifOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [ownerChatOpen, setOwnerChatOpen] = useState(false)
  const [ownerChatReply, setOwnerChatReply] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showEndDaySummary, setShowEndDaySummary] = useState(false)

  // Multi-language translation setup
  const businessLocation = localStorage.getItem('business_location') || 'vijayawada'
  const activeLocationConfig = locationLanguages[businessLocation] || locationLanguages.vijayawada

  const [currentLang, setCurrentLang] = useState<string>('en')
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

  useEffect(() => {
    // Determine current language from cookie
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    }
    const googtrans = getCookie('googtrans');
    if (googtrans) {
      const match = googtrans.match(/\/en\/([a-z]+)/);
      if (match && match[1]) {
        setCurrentLang(match[1]);
      } else {
        setCurrentLang('en');
      }
    }

    // Set up Google Translate element and script
    const initTranslate = () => {
      // Create off-screen hidden element if not exists (so that google translate combo renders properly)
      if (!document.getElementById('google_translate_element')) {
        const div = document.createElement('div');
        div.id = 'google_translate_element';
        div.style.position = 'absolute';
        div.style.top = '-9999px';
        div.style.left = '-9999px';
        div.style.width = '0px';
        div.style.height = '0px';
        div.style.overflow = 'hidden';
        document.body.appendChild(div);
      }

      // Define callback function on window
      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,te,hi,mr,ur,kn',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      };

      // Add script
      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }

      // Add visual banner override style
      if (!document.getElementById('google-translate-style')) {
        const style = document.createElement('style');
        style.id = 'google-translate-style';
        style.innerHTML = `
          .skiptranslate, .goog-te-banner-frame, #goog-gt-tt { display: none !important; }
          body { top: 0px !important; }
          .goog-tooltip-skin { display: none !important; }
          .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
        `;
        document.head.appendChild(style);
      }
    };

    initTranslate();
  }, []);

  const changeLanguage = (langCode: 'en' | 'te' | 'hi' | 'mr' | 'ur' | 'kn') => {
    const domain = window.location.hostname;
    const expires = "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
    
    if (langCode === 'en') {
      document.cookie = `googtrans${expires}`;
      document.cookie = `googtrans${expires}; domain=${domain}`;
      document.cookie = `googtrans${expires}; domain=.${domain}`;
      document.cookie = "googtrans=/en/en; path=/;";
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain}`;
    }
    
    setCurrentLang(langCode);
    setLangDropdownOpen(false);

    // Dynamic translation trigger without full page reload
    try {
      const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectEl) {
        selectEl.value = langCode === 'en' ? 'en' : langCode;
        selectEl.dispatchEvent(new Event('change'));
      } else {
        // Fallback if google translate select element is not yet initialized in DOM
        window.location.reload();
      }
    } catch (e) {
      console.warn('Google translate element trigger error, falling back to reload', e);
      window.location.reload();
    }
  };

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('businessos_owner_profile')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error(e)
      }
    }
    return {
      name: 'John Doe',
      role: 'Owner',
      address: '123 Cyberpunk Boulevard, HQ Hub',
      phone: '+91 98765 43210',
      instagram: '@john_businessos',
      linkedin: 'in/johndoe',
      twitter: '@john_os',
      avatar: '/owner_avatar.png'
    }
  })

  // Voice Assistant state
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceFeedback, setVoiceFeedback] = useState('')
  const voiceListenerRef = useRef<VoiceListener | null>(null)
  const [ownerVoiceListening, setOwnerVoiceListening] = useState(false)
  const ownerVoiceListenerRef = useRef<VoiceListener | null>(null)

  useEffect(() => {
    voiceListenerRef.current = new VoiceListener()
    ownerVoiceListenerRef.current = new VoiceListener()
  }, [])

  // Start voice commands listening loop
  const toggleVoiceMode = () => {
    if (!voiceListenerRef.current) return

    if (voiceActive) {
      voiceListenerRef.current.stop()
      setVoiceActive(false)
      return
    }

    setVoiceActive(true)
    setVoiceTranscript('Listening for commands...')
    setVoiceFeedback('')
    triggerLog('[AI Voice] Microphone listener initiated. Ready for speech...')

    voiceListenerRef.current.start({
      onResult: (text) => {
        setVoiceTranscript(`"${text}"`)
        processVoiceCommand(text)
      },
      onError: (err) => {
        console.error('Voice error:', err)
        setVoiceTranscript('Voice recognition error')
        setVoiceActive(false)
      },
      onEnd: () => {
        setVoiceActive(false)
      },
    })
  }

  // Parse voice commands
  const processVoiceCommand = (text: string) => {
    const clean = text.toLowerCase()
    triggerLog(`[AI Voice] Parsing command input: "${text}"`)

    // Roster/Tab shifts
    if (clean.includes('open overview') || clean.includes('go to overview') || clean.includes('show overview')) {
      setActiveTab('overview')
      setVoiceFeedback('Sure, navigating to Command Center overview.')
      speakText('Sure, navigating to Command Center overview.')
      return
    }
    if (clean.includes('open finance') || clean.includes('go to finance') || clean.includes('show finance') || clean.includes('open profit simulator')) {
      setActiveTab('finance')
      setVoiceFeedback('Sure, opening AI Finance manager and simulator.')
      speakText('Sure, opening AI Finance manager and simulator.')
      return
    }
    if (clean.includes('open inventory') || clean.includes('go to inventory') || clean.includes('show inventory')) {
      setActiveTab('inventory')
      setVoiceFeedback('Sure, opening AI Inventory registry list.')
      speakText('Sure, opening AI Inventory registry list.')
      return
    }
    if (clean.includes('open sales') || clean.includes('go to sales') || clean.includes('show sales')) {
      setActiveTab('sales')
      setVoiceFeedback('Sure, opening AI Sales analyzer.')
      speakText('Sure, opening AI Sales analyzer.')
      return
    }
    if (clean.includes('open marketing') || clean.includes('go to marketing') || clean.includes('show marketing')) {
      setActiveTab('marketing')
      setVoiceFeedback('Sure, opening AI Marketing console.')
      speakText('Sure, opening AI Marketing console.')
      return
    }
    if (clean.includes('open requests') || clean.includes('go to requests') || clean.includes('show requests') || clean.includes('customer requests')) {
      setActiveTab('requests')
      setVoiceFeedback('Sure, opening Customer Request Center.')
      speakText('Sure, opening Customer Request Center.')
      return
    }

    // Dynamic AI Q&A metrics lookup
    const response = getResponse(clean, dbState)
    setVoiceFeedback(response)
    speakText(response)
  }

  const triggerOwnerChatVoice = () => {
    if (!ownerVoiceListenerRef.current) return

    if (ownerVoiceListening) {
      ownerVoiceListenerRef.current.stop()
      setOwnerVoiceListening(false)
      return
    }

    setOwnerVoiceListening(true)
    ownerVoiceListenerRef.current.start({
      onResult: (text) => {
        setOwnerVoiceListening(false)
        setOwnerChatReply(text)
      },
      onError: (err) => {
        console.error('Owner chat voice error:', err)
        setOwnerVoiceListening(false)
      },
      onEnd: () => {
        setOwnerVoiceListening(false)
      }
    })
  }

  // Listen and read out customer chat messages to the owner
  useEffect(() => {
    const lastMsg = dbState.chatMessages[dbState.chatMessages.length - 1]
    if (lastMsg && lastMsg.sender === 'customer' && !lastMsg.seen) {
      speakText(`Customer says: ${lastMsg.text}`)
    }
  }, [dbState.chatMessages])

  const handleRoleChange = (selected: UserRole) => {
    setRole(selected)
    setRoleOpen(false)
  }

  // Map sidebar links
  const sidebarLinks = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'inventory', label: 'AI Inventory', icon: Package },
    { id: 'finance', label: 'AI Finance', icon: Wallet },
    { id: 'sales', label: 'AI Sales', icon: TrendingUp },
    { id: 'billing', label: 'POS Billing Desk', icon: ShoppingCart },
    { id: 'orders', label: 'Order Ledger', icon: ShoppingBag },
    { id: 'invoice', label: 'Invoices', icon: FileText },
    { id: 'marketing', label: 'AI Marketing', icon: Megaphone },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'customers', label: 'Reviews ❤️', icon: Heart },
    { id: 'requests', label: 'Requests Center', icon: Sparkles },
    { id: 'profile', label: 'My Profile', icon: User },
  ] as const

  // Render active panel
  const renderActivePanel = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPanel />
      case 'finance':
        return <FinancePanel />
      case 'inventory':
        return <InventoryPanel />
      case 'sales':
        return <SalesPanel />
      case 'billing':
        return <BillingPanel />
      case 'orders':
        return <OrdersPanel />
      case 'marketing':
        return <MarketingPanel />
      case 'employees':
        return <EmployeesPanel />
      case 'customers':
        return <CustomersPanel />
      case 'requests':
        return <RequestCenterPanel />
      case 'invoice':
        return <InvoicePanel />
      case 'profile':
        return <ProfilePanel profile={profile} setProfile={setProfile} />
      default:
        return <OverviewPanel />
    }
  }


  const getSectionThemeColors = (tab: string) => {
    switch (tab) {
      case 'overview':
        return {
          primary: 'rgba(6, 182, 212, 0.12)', // Cyan
          secondary: 'rgba(99, 102, 241, 0.15)', // Indigo
          accent: 'rgba(236, 72, 153, 0.08)', // Pink
          fallbackBg: '#040714'
        }
      case 'finance':
        return {
          primary: 'rgba(34, 197, 94, 0.12)', // Green
          secondary: 'rgba(234, 179, 8, 0.15)', // Yellow
          accent: 'rgba(20, 184, 166, 0.08)', // Teal
          fallbackBg: '#031207'
        }
      case 'inventory':
        return {
          primary: 'rgba(16, 185, 129, 0.12)', // Emerald
          secondary: 'rgba(56, 189, 248, 0.15)', // Sky
          accent: 'rgba(99, 102, 241, 0.08)', // Indigo
          fallbackBg: '#020f0a'
        }
      case 'sales':
        return {
          primary: 'rgba(168, 85, 247, 0.12)', // Purple
          secondary: 'rgba(236, 72, 153, 0.15)', // Pink
          accent: 'rgba(99, 102, 241, 0.08)', // Indigo
          fallbackBg: '#0c0514'
        }
      case 'billing':
        return {
          primary: 'rgba(59, 130, 246, 0.12)', // Blue
          secondary: 'rgba(99, 102, 241, 0.15)', // Indigo
          accent: 'rgba(168, 85, 247, 0.08)', // Purple
          fallbackBg: '#040714'
        }
      case 'orders':
        return {
          primary: 'rgba(249, 115, 22, 0.12)', // Orange
          secondary: 'rgba(239, 68, 68, 0.15)', // Red
          accent: 'rgba(234, 179, 8, 0.08)', // Yellow
          fallbackBg: '#140803'
        }
      case 'marketing':
        return {
          primary: 'rgba(244, 63, 94, 0.12)', // Rose
          secondary: 'rgba(236, 72, 153, 0.15)', // Pink
          accent: 'rgba(168, 85, 247, 0.08)', // Purple
          fallbackBg: '#14030a'
        }
      case 'employees':
        return {
          primary: 'rgba(14, 165, 233, 0.12)', // Sky
          secondary: 'rgba(59, 130, 246, 0.15)', // Blue
          accent: 'rgba(20, 184, 166, 0.08)', // Teal
          fallbackBg: '#030a14'
        }
      case 'customers':
        return {
          primary: 'rgba(236, 72, 153, 0.12)', // Pink
          secondary: 'rgba(244, 63, 94, 0.15)', // Rose
          accent: 'rgba(249, 115, 22, 0.08)', // Orange
          fallbackBg: '#14030c'
        }
      case 'requests':
        return {
          primary: 'rgba(234, 179, 8, 0.12)', // Amber
          secondary: 'rgba(249, 115, 22, 0.15)', // Orange
          accent: 'rgba(34, 197, 94, 0.08)', // Green
          fallbackBg: '#120d03'
        }
      case 'invoice':
        return {
          primary: 'rgba(139, 92, 246, 0.12)', // Violet
          secondary: 'rgba(168, 85, 247, 0.15)', // Purple
          accent: 'rgba(236, 72, 153, 0.08)', // Pink
          fallbackBg: '#0d0414'
        }
      case 'profile':
        return {
          primary: 'rgba(6, 182, 212, 0.12)', // Cyan
          secondary: 'rgba(20, 184, 166, 0.15)', // Teal
          accent: 'rgba(59, 130, 246, 0.08)', // Blue
          fallbackBg: '#030c12'
        }
      default:
        return {
          primary: 'rgba(6, 182, 212, 0.12)',
          secondary: 'rgba(99, 102, 241, 0.15)',
          accent: 'rgba(236, 72, 153, 0.08)',
          fallbackBg: '#040612'
        }
    }
  }

  const unreadNotifs = notifications.filter((n) => !n.read).length

  const isLight = theme === 'light'
  const textColor = isLight ? "text-slate-800" : "text-slate-200"

  const colors = getSectionThemeColors(activeTab)

  const darkMeshBg = `radial-gradient(at 0% 0%, ${colors.primary} 0px, transparent 50%), 
                      radial-gradient(at 100% 0%, ${colors.secondary} 0px, transparent 50%), 
                      radial-gradient(at 100% 100%, ${colors.accent} 0px, transparent 50%), 
                      radial-gradient(at 0% 100%, ${colors.primary} 0px, transparent 50%), 
                      ${colors.fallbackBg}`

  const lightMeshBg = `radial-gradient(at 0% 0%, ${colors.primary.replace('0.12', '0.06')} 0px, transparent 50%), 
                       radial-gradient(at 100% 0%, ${colors.secondary.replace('0.15', '0.06')} 0px, transparent 50%), 
                       radial-gradient(at 100% 100%, ${colors.accent.replace('0.08', '0.03')} 0px, transparent 50%), 
                       #f8fafc`

  return (
    <div
      className={`relative flex min-h-screen w-full ${textColor} overflow-x-hidden select-none transition-colors duration-300`}
    >
      {/* Premium Gradient Cross-Fade Mesh Layers */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + '_' + (isLight ? 'light' : 'dark')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{ background: isLight ? lightMeshBg : darkMeshBg }}
          />
        </AnimatePresence>
      </div>

      {/* Premium Glass Tonal Layer */}
      <div className={`absolute inset-0 ${isLight ? 'bg-white/30' : 'bg-[#040612]/30'} pointer-events-none z-0`} />

      {/* Cyber-Grid Pattern Overlay */}
      <div className={`absolute inset-0 ${isLight ? 'bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)]'} bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] pointer-events-none z-0`} />

      {/* Full-Page Dynamic 3D Section Background */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* We keep a single canvas mounted so particles, colors and illustrations can morph smoothly! */}
        <IntelligentDynamicBg tab={activeTab} isLight={isLight} />
        {/* Soft frosted blur and overlay layer */}
        <div className={`absolute inset-0 ${isLight ? 'bg-white/70 backdrop-blur-[2px]' : 'bg-[#060B16]/82 backdrop-blur-[2px]'} transition-colors duration-300`} />
      </div>

      {/* Floating Cosmic Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-60">
        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, -100, 60, 0],
            scale: [1, 1.25, 0.9, 1]
          }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full blur-[130px] transition-colors duration-1000"
          style={{ backgroundColor: colors.primary.replace('0.12', '0.2').replace('0.15', '0.2') }}
        />
        <motion.div
          animate={{
            x: [0, -120, 60, 0],
            y: [0, 80, -100, 0],
            scale: [1, 0.85, 1.15, 1]
          }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="absolute top-1/4 -right-40 h-[600px] w-[600px] rounded-full blur-[150px] transition-colors duration-1000"
          style={{ backgroundColor: colors.secondary.replace('0.18', '0.25').replace('0.15', '0.25') }}
        />
        <motion.div
          animate={{
            x: [0, 60, -80, 0],
            y: [0, 90, 120, 0],
            scale: [1, 1.2, 0.9, 1]
          }}
          transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
          className="absolute -bottom-40 left-1/3 h-[550px] w-[550px] rounded-full blur-[130px] transition-colors duration-1000"
          style={{ backgroundColor: colors.accent.replace('0.08', '0.15') }}
        />
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className={`hidden md:flex flex-col justify-between w-64 border-r py-6 px-4 shrink-0 z-30 ${isLight ? 'bg-white/55 border-slate-200/50 backdrop-blur-md' : 'glass-strong border-white/5'
        }`}>
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-2">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-neon shadow shadow-electric/50">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <span className={`font-display text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              BusinessOS<span className="text-gradient"> AI</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon
              const isSelected = activeTab === link.id
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${isSelected
                      ? isLight
                        ? 'bg-gradient-to-r from-violet-600/10 to-indigo-600/5 border border-violet-500/25 text-violet-700 shadow-sm shadow-violet-500/5 font-extrabold'
                        : 'bg-gradient-to-r from-violet-600/25 to-indigo-600/10 border border-violet-500/30 text-white glow-purple'
                      : isLight
                        ? 'border border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-900/5'
                        : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {link.label}
                </button>
              )
            })}
          </nav>

          {/* Upgrade to Pro Card */}
          <div className={`relative overflow-hidden rounded-2xl border p-4 mt-6 shadow-inner select-none ${isLight
              ? 'border-slate-200 bg-gradient-to-br from-violet-50 to-indigo-50/50'
              : 'border-white/10 bg-gradient-to-br from-purple-900/30 to-indigo-950/30'
            }`}>
            <div className={`absolute top-0 right-0 h-16 w-16 rounded-full pointer-events-none ${isLight ? 'bg-violet-400/20 blur-lg' : 'bg-purple-500/20 blur-xl'
              }`} />
            <h4 className={`text-[11px] font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>Upgrade to Pro</h4>
            <p className={`text-[9px] mt-1 leading-normal ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Unlock all features and get unlimited access.</p>
            <button className="mt-3 w-full py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-[10px] font-bold text-white transition-all shadow-md shadow-violet-900/15 cursor-pointer">
              Upgrade Now →
            </button>
          </div>
        </div>

        {/* User profile / Logout */}
        <div className="border-t border-white/5 pt-4 space-y-3.5">
          <div className="flex items-center gap-3 px-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-electric to-neon flex items-center justify-center font-bold text-sm text-white">
              {role.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <p className={`text-xs font-bold leading-normal truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {role.toUpperCase()} profile
              </p>
              <p className={`text-[10px] leading-normal ${isLight ? 'text-emerald-600' : 'text-green-400'}`}>
                Credentials Decrypted
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowEndDaySummary(true)}
            className={`w-full flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-colors cursor-pointer ${isLight
                ? 'border-slate-200 hover:bg-red-500/5 text-slate-500 hover:text-red-600 hover:border-red-500/20'
                : 'border-white/5 hover:border-red-500/20 hover:bg-red-500/10 text-slate-400 hover:text-red-400'
              }`}
          >
            <LogOut className="h-4 w-4" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 z-20 min-h-screen">
        {/* HEADER BAR */}
        <header className={`border-b h-16 px-4 md:px-8 flex items-center justify-between z-30 transition-all ${isLight ? 'bg-white/55 border-slate-200/50 backdrop-blur-md' : 'glass-strong border-white/5'
          }`}>
          {/* Left info (or mobile menu) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex h-9.5 w-9.5 items-center justify-center rounded-xl md:hidden cursor-pointer border transition-colors ${isLight
                  ? 'bg-white/60 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white/85'
                  : 'glass border-white/5 text-slate-300 hover:text-white'
                }`}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>

          {/* Right Action Hub */}
          <div className="flex items-center gap-3">
            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 h-9.5 px-3 rounded-xl glass text-slate-300 border border-white/5 hover:border-white/10 hover:text-white cursor-pointer text-xs font-semibold select-none"
                title="Select language"
              >
                <Globe className="h-4.5 w-4.5 text-cyan-bright" />
                <span className="max-w-[70px] truncate text-slate-200">
                  {activeLocationConfig.languages.find(l => l.code === currentLang)?.nativeLabel || 'English'}
                </span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              <AnimatePresence>
                {langDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-44 glass-strong border border-white/5 rounded-2xl p-1.5 shadow-2xl z-40"
                  >
                    {activeLocationConfig.languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code as any)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                          currentLang === lang.code ? 'bg-electric text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {lang.nativeLabel} ({lang.label})
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Light/Dark mode switcher */}
            <button
              onClick={toggleTheme}
              className="flex h-9.5 w-9.5 items-center justify-center rounded-xl glass text-slate-300 border border-white/5 hover:border-white/10 hover:text-white cursor-pointer"
              title="Toggle system theme"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Notifications Alert Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative flex h-9.5 w-9.5 items-center justify-center rounded-xl glass text-slate-300 border border-white/5 hover:border-white/10 hover:text-white cursor-pointer"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadNotifs > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-cyan-bright font-mono text-[9px] font-bold text-base-100 animate-pulse-glow">
                    {unreadNotifs}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 glass-strong border border-white/5 rounded-2xl p-4 shadow-2xl z-40 max-h-[380px] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center border-b border-white/5 pb-2.5 mb-3">
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer mr-2 font-semibold"
                      >
                        ← Back
                      </button>
                      <span className="text-xs font-bold text-white">System Security Alerts</span>
                      <span className="text-[10px] text-slate-500">{unreadNotifs} active</span>
                    </div>

                    <div className="space-y-3">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div key={n.id} className="relative rounded-xl bg-white/[0.01] border border-white/5 p-3 flex gap-2.5">
                            <div className="flex-1">
                              <h4 className="text-[11px] font-bold text-white">{n.title}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">{n.message}</p>
                              <span className="text-[9px] text-slate-500 font-mono mt-2 block">{n.timestamp}</span>
                            </div>
                            <button
                              onClick={() => dismissNotification(n.id)}
                              className="text-slate-500 hover:text-white text-[10px] self-start"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs italic text-slate-500 text-center py-6">No notifications active.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Owner profile circle avatar */}
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 border-l pl-4 ml-1 transition-all hover:opacity-85 text-left cursor-pointer ${
                isLight ? 'border-slate-200' : 'border-white/10'
              }`}
            >
              <img src={profile.avatar} className="h-9 w-9 rounded-full border border-white/10 object-cover shadow shadow-black/20" alt={profile.name} />
              <div className="flex flex-col text-left">
                <span className={`text-[11px] font-extrabold leading-none ${isLight ? 'text-slate-800' : 'text-white'}`}>{profile.name}</span>
                <span className="text-[9px] text-slate-500 font-bold mt-1.5 uppercase tracking-wider">{profile.role}</span>
              </div>
            </button>
          </div>
        </header>

        {/* WORKSPACE AREA CONTAINER */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
          {renderActivePanel()}
        </main>
      </div>

      {/* FLOATING CUSTOMER LIVE CHAT DRAWER */}
      <div className="fixed bottom-6 right-24 z-50">
        <button
          onClick={() => {
            setOwnerChatOpen(!ownerChatOpen)
            // Mark all customer messages as seen
            updateDbState(prev => {
              const readMsgs = prev.chatMessages.map(m => m.sender === 'customer' ? { ...m, seen: true } : m)
              return { ...prev, chatMessages: readMsgs }
            })
          }}
          className="flex h-11 items-center gap-2 rounded-xl glass-strong border border-white/5 hover:border-white/10 px-4 text-xs font-semibold text-slate-300 hover:text-white shadow-xl glow-purple cursor-pointer"
        >
          <MessageSquare className="h-4.5 w-4.5 text-neon-bright animate-pulse" />
          <span>Customer Live Chat</span>
          {dbState.chatMessages.filter(m => m.sender === 'customer' && !m.seen).length > 0 && (
            <span className="h-2 w-2 rounded-full bg-cyan-bright animate-ping" />
          )}
        </button>

        <AnimatePresence>
          {ownerChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="absolute bottom-14 right-0 w-80 sm:w-96 glass-strong border border-white/10 rounded-2xl p-4 shadow-2xl z-50 text-left overflow-hidden"
            >
              {/* Premium Cosmic Swirl Background Overlay */}
              <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none rounded-2xl"
                style={{ backgroundImage: "url('/ai_swirl.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
              />

              <div className="relative z-10 flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                <span className="text-[10px] font-bold text-neon-bright uppercase tracking-widest flex items-center gap-1.5 font-display">
                  <span className="h-1.5 w-1.5 rounded-full bg-neon-bright animate-ping" /> Customer Live Chat Stream
                </span>
                <button onClick={() => setOwnerChatOpen(false)} className="text-slate-400 hover:text-white text-xs">
                  ✕
                </button>
              </div>

              {/* Message transcript */}
              <div className="h-48 overflow-y-auto space-y-3.5 pr-2.5 mb-3 custom-scrollbar">
                {dbState.chatMessages.map((m) => {
                  const isOwner = m.sender === 'owner'
                  return (
                    <div key={m.id} className={`flex ${isOwner ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${isOwner ? 'bg-gradient-to-r from-electric to-blue-600 text-white font-semibold' : 'glass border border-white/5 text-slate-200'
                        }`}>
                        {m.text}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Reply form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!ownerChatReply.trim()) return

                  const replyMsg = {
                    id: `msg-${Date.now()}`,
                    sender: 'owner' as const,
                    text: ownerChatReply,
                    timestamp: new Date().toISOString(),
                    type: 'text' as const,
                    seen: true
                  }

                  updateDbState(prev => {
                    return { ...prev, chatMessages: [...prev.chatMessages, replyMsg] }
                  })
                  setOwnerChatReply('')
                  triggerLog(`[Live Chat] Owner reply sent: "${replyMsg.text}"`)
                }}
                className="flex items-center gap-1.5 border-t border-white/5 pt-2.5"
              >
                <input
                  type="text"
                  value={ownerChatReply}
                  onChange={(e) => setOwnerChatReply(e.target.value)}
                  placeholder="Send direct reply to customer..."
                  className="w-full bg-black/25 rounded-xl px-3 py-2 text-xs text-white border border-white/5 focus:outline-none focus:border-neon"
                />

                {/* Voice button for owner */}
                <button
                  type="button"
                  onClick={triggerOwnerChatVoice}
                  title="Speak reply"
                  className={`rounded-xl p-2 flex items-center justify-center shrink-0 border cursor-pointer transition-all ${ownerVoiceListening
                      ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                      : 'glass border-white/5 text-slate-400 hover:text-white'
                    }`}
                >
                  <Mic className="h-4 w-4" />
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-br from-neon to-purple-600 px-3 py-2 text-white flex items-center justify-center shrink-0 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 glass-strong border-r border-white/10 p-5 flex flex-col justify-between z-50 md:hidden"
            >
              <div className="space-y-6">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-2">
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-neon shadow shadow-electric/50">
                    <Sparkles className="h-4.5 w-4.5 text-white" />
                  </div>
                  <span className="font-display text-base font-bold text-white">
                    BusinessOS<span className="text-gradient"> AI</span>
                  </span>
                </div>

                {/* Navigation Links */}
                <nav className="space-y-1">
                  {sidebarLinks.map((link) => {
                    const Icon = link.icon
                    const isSelected = activeTab === link.id
                    return (
                      <button
                        key={link.id}
                        onClick={() => {
                          setActiveTab(link.id)
                          setMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${isSelected
                            ? 'bg-gradient-to-r from-electric/15 to-neon/15 border border-electric/30 text-white glow-blue'
                            : 'border border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                        {link.label}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Logout / User */}
              <div className="border-t border-white/5 pt-4 space-y-3.5">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-electric to-neon flex items-center justify-center font-bold text-sm text-white">
                    {role.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white uppercase truncate">{role}</p>
                    <p className="text-[10px] text-green-400">Credentials Valid</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setShowEndDaySummary(true)
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/5 hover:border-red-500/20 hover:bg-red-500/10 py-2.5 text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Terminate Session
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* End of Day Business Summary Modal */}
      <AnimatePresence>
        {showEndDaySummary && (() => {
          const todayStr = new Date().toISOString().split('T')[0]

          // Filter today's sales
          const todaySales = dbState.sales.filter(s => s.timestamp.startsWith(todayStr) || s.id.includes('local'))
          const todaySalesCount = todaySales.length
          const todayQtySold = todaySales.reduce((sum, s) => sum + s.quantity, 0)
          const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)
          const todayCOGS = todaySales.reduce((sum, s) => {
            const prod = dbState.products.find(p => p.name === s.productName)
            const cost = prod ? prod.cost : s.total * 0.5
            return sum + (cost * s.quantity)
          }, 0)
          const todayGross = todayRevenue - todayCOGS
          const todayExpenses = todaySalesCount > 0 ? 1200 : 0 // flat daily operating expenses overhead
          const todayNet = todayGross - todayExpenses

          // All time stats
          const allSalesCount = dbState.sales.length
          const allQtySold = dbState.sales.reduce((sum, s) => sum + s.quantity, 0)
          const allRevenue = dbState.sales.reduce((sum, s) => sum + s.total, 0)

          // Best performing item today
          const productQuantities: Record<string, number> = {}
          todaySales.forEach(s => {
            productQuantities[s.productName] = (productQuantities[s.productName] || 0) + s.quantity
          })
          let bestProduct = 'N/A'
          let bestQty = 0
          Object.entries(productQuantities).forEach(([name, qty]) => {
            if (qty > bestQty) {
              bestQty = qty
              bestProduct = name
            }
          })

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-strong max-w-lg w-full rounded-3xl p-6 text-left shadow-2xl glow-cyan text-slate-200 border border-white/10 relative overflow-hidden"
              >
                {/* Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      🧾 Shift Terminated Summary
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">End of Day Ledger Audit & Performance Review</p>
                  </div>
                  <button
                    onClick={() => setShowEndDaySummary(false)}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Main Stats Block */}
                <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto custom-scrollbar pr-1">

                  {/* Today Session */}
                  <div>
                    <h4 className="text-[10px] font-bold text-cyan-bright uppercase tracking-widest mb-2.5">Today's Shift Statistics</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="glass p-3 rounded-xl border border-white/5">
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Transactions</p>
                        <p className="text-base font-bold text-white font-mono mt-1">{todaySalesCount}</p>
                      </div>
                      <div className="glass p-3 rounded-xl border border-white/5">
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Qty Dispatched</p>
                        <p className="text-base font-bold text-white font-mono mt-1">{todayQtySold} units</p>
                      </div>
                      <div className="glass p-3 rounded-xl border border-white/5">
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Gross Revenue</p>
                        <p className="text-base font-bold text-white font-mono mt-1">₹{todayRevenue.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Profit Calculations Summary Card */}
                  <div className="rounded-xl bg-white/[0.01] border border-white/5 p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Shift Revenue Earned:</span>
                      <span className="font-semibold text-white font-mono">₹{todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Cost of Goods Sold (COGS):</span>
                      <span className="font-semibold text-white font-mono">- ₹{todayCOGS.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Rent & AI Overhead Flat:</span>
                      <span className="font-semibold text-white font-mono">- ₹{todayExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/5 pt-2 mt-2 font-bold text-white">
                      <span className="text-green-400">Net Business Profit:</span>
                      <span className="text-green-400 font-mono">₹{todayNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass p-3.5 rounded-xl border border-white/5 text-xs">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Top Selling Product</span>
                      <span className="font-bold text-white truncate block max-w-full" title={bestProduct}>{bestProduct}</span>
                      <span className="text-[10px] text-green-400 mt-0.5 block">{bestQty > 0 ? `${bestQty} units sold today` : 'No items sold'}</span>
                    </div>
                    <div className="glass p-3.5 rounded-xl border border-white/5 text-xs">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Cumulative Ledger</span>
                      <span className="font-bold text-white block">₹{allRevenue.toLocaleString('en-IN')} Revenue</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">{allSalesCount} invoices · {allQtySold} items</span>
                    </div>
                  </div>

                  {/* Audit Logs Preview */}
                  <div className="glass p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">Cryptographic Audit Logs (Last 3)</span>
                    <div className="font-mono text-[9px] text-slate-400 space-y-1.5 overflow-hidden max-h-[75px]">
                      {dbState.logs.slice(0, 3).map((log, idx) => (
                        <p key={idx} className="truncate select-text selection:bg-cyan/35 border-l border-cyan/20 pl-2">
                          {log}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 leading-normal text-center bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                    Terminating the shift will close the session and secure active registers. All records are backed up locally.
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 mt-5 pt-3 border-t border-white/5">
                  <button
                    onClick={() => setShowEndDaySummary(false)}
                    className="flex-1 rounded-xl border border-white/10 hover:bg-white/5 py-2.5 text-center text-xs font-bold text-slate-400 transition-colors cursor-pointer"
                  >
                    Continue Shift
                  </button>
                  <button
                    onClick={() => {
                      setShowEndDaySummary(false)
                      logout()
                    }}
                    className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 py-2.5 text-center text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Confirm Terminate & Logout
                  </button>
                </div>
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>

      {/* Satisfy TypeScript compiler unused variable checks */}
      {(() => {
        if (false as boolean) {
          console.log(
            roleOpen, 
            voiceTranscript, 
            voiceFeedback, 
            toggleVoiceMode, 
            stopSpeaking, 
            handleRoleChange, 
            ChevronDown, 
            Shield, 
            Volume2, 
            Square
          )
        }
        return null
      })()}
    </div>
  )
}
