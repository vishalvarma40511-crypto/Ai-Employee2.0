import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Send,
  Mic,
  Paperclip,
  Sparkles,
  Bot,
  LogOut,
  Sun,
  Moon,
  Clock,
  CheckCheck,
  Image as ImageIcon,
  FileText,
  Play,
  Trash2,
  Square,
  ShoppingBag,
  ShoppingCart,
  Plus,
  Minus,
  Globe,
  ChevronDown
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getProductImage } from '../services/db'
import type { ChatMessage, Product } from '../services/db'
import { getBotResponse } from '../services/ai'
import type { AIMessage } from '../services/ai'
import MagneticButton from './MagneticButton'
import { VoiceListener, speakText, stopSpeaking } from '../services/voice'
import { API_BASE } from '../config'

export default function CustomerPortal() {
  const {
    dbState,
    updateDbState,
    addNotification,
    triggerLog,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,
    customerAddress,
    setCustomerAddress,
    web3FormsKey,
    logout,
    theme,
    toggleTheme,
    refreshDatabase,
    customerCart,
    setCustomerCart,
  } = useApp()

  // Multi-language translation setup
  const [currentLang, setCurrentLang] = useState<string>('en')
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)

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

  const businessLocation = localStorage.getItem('business_location') || 'vijayawada'
  const activeLocationConfig = locationLanguages[businessLocation] || locationLanguages.vijayawada

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

    // Set up Google Translate element and script if not present
    const initTranslate = () => {
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

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,te,hi,mr,ur,kn',
          layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      };

      if (!document.getElementById('google-translate-script')) {
        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }

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

    try {
      const selectEl = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectEl) {
        selectEl.value = langCode === 'en' ? 'en' : langCode;
        selectEl.dispatchEvent(new Event('change'));
      } else {
        window.location.reload();
      }
    } catch {
      window.location.reload();
    }
  };

  const [chatMode, setChatMode] = useState<'ai' | 'live'>('ai')
  const [input, setInput] = useState('')
  const [voiceListening, setVoiceListening] = useState(false)
  const voiceListenerRef = useRef<VoiceListener | null>(null)

  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedLocIdx, setSelectedLocIdx] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const categoriesList = ['All', 'Electronics', 'Apparel', 'Groceries', 'Medical', 'Food']
  const locations = [
    { name: 'DLF CyberCity, Gurgaon', address: 'Building 10, Tower B, Phase 3, Gurgaon, Haryana, India', distance: '1.2 km', phone: '+91 124 456 7890' },
    { name: 'Indiranagar, Bengaluru', address: '100 Feet Road, HAL 2nd Stage, Bengaluru, Karnataka, India', distance: '3.5 km', phone: '+91 80 4567 8901' },
    { name: 'BKC, Mumbai', address: 'G Block, Bandra East, Mumbai, Maharashtra, India', distance: '6.8 km', phone: '+91 22 4567 8902' }
  ]
  const activeLocation = locations[selectedLocIdx]

  useEffect(() => {
    voiceListenerRef.current = new VoiceListener()
  }, [])

  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string; products?: Product[] }[]>([
    {
      role: 'ai',
      text: `Hello ${customerName}! Welcome to my store. I am the owner here! How can I assist you today? Feel free to ask me about product availability, prices, return/delivery policies, or place an order.`,
    },
  ])

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'wallet' | 'whatsapp'>('cod')
  const [storePhone, setStorePhone] = useState('916281823557')
  const [storeName, setStoreName] = useState('Alfa Store')

  useEffect(() => {
    fetch(`${API_BASE}/settings/email`)
      .then(r => r.json())
      .then(data => {
        if (data.storePhone) {
          let clean = data.storePhone.replace(/[^0-9]/g, '');
          if (clean.length === 10) {
            clean = '91' + clean;
          }
          setStorePhone(clean);
        }
        if (data.storeName) {
          setStoreName(data.storeName);
        }
      })
      .catch(() => {});
  }, []);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)

  // flying animation states
  interface FlyingItem {
    id: string
    startX: number
    startY: number
    image: string
  }
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([])
  const [addedProductIds, setAddedProductIds] = useState<Record<string, boolean>>({})
  const [cartBounce, setCartBounce] = useState(false)
  const [cartGlow, setCartGlow] = useState(false)
  const [cartRipple, setCartRipple] = useState(false)
  
  interface CartParticle {
    id: string
    angle: number
    distance: number
    color: string
  }
  const [cartParticles, setCartParticles] = useState<CartParticle[]>([])
  const [isMuted, setIsMuted] = useState(false)

  interface CompletedOrder {
    orderNumber: string
    products: { name: string; quantity: number; price: number }[]
    total: number
    paymentMethod: string
  }
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false)
  const [lastCompletedOrder, setLastCompletedOrder] = useState<CompletedOrder | null>(null)
  
  type TruckAnimationStage = 'idle' | 'enter' | 'loading' | 'loaded' | 'dispatch' | 'success' | 'failed'
  const [truckStage, setTruckStage] = useState<TruckAnimationStage>('idle')
  const [loadingItemIndex, setLoadingItemIndex] = useState(-1)
  const [apiResult, setApiResult] = useState<{ success: boolean; orderNumber?: string; error?: string } | null>(null)
  
  const [truckBounceCount, setTruckBounceCount] = useState(0)
  useEffect(() => {
    if (truckStage === 'loading' && loadingItemIndex > -1) {
      setTruckBounceCount(prev => prev + 1)
    }
  }, [loadingItemIndex, truckStage])

  useEffect(() => {
    if (truckStage !== 'success') return
    const timer = setTimeout(() => {
      setCustomerTab('tracking')
      setTruckStage('idle')
      setLoadingItemIndex(-1)
      setApiResult(null)
      setIsProcessingCheckout(false)
    }, 4500)
    return () => clearTimeout(timer)
  }, [truckStage])

  interface StoreToast {
    id: string
    message: string
    type: 'success' | 'error'
  }
  const [toasts, setToasts] = useState<StoreToast[]>([])

  const addStoreToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const playSuccessChime = () => {
    if (isMuted) return
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const audioCtx = new AudioContextClass()
      const playNode = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start)
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + start + duration)
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.start(audioCtx.currentTime + start)
        osc.stop(audioCtx.currentTime + start + duration)
      }
      playNode(523.25, 0, 0.25) // C5
      playNode(659.25, 0.08, 0.25) // E5
      playNode(783.99, 0.16, 0.35) // G5
      playNode(1046.50, 0.24, 0.5) // C6
    } catch (e) {
      console.error('Audio chime error:', e)
    }
  }

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [checkoutStatusText, setCheckoutStatusText] = useState('Securing handshakes...')

  // Synchronized Truck Animation Lifecycle
  useEffect(() => {
    if (truckStage === 'idle') return

    if (truckStage === 'enter') {
      setCheckoutStatusText('Dispatching automated delivery truck...')
      const timer = setTimeout(() => {
        setTruckStage('loading')
        setLoadingItemIndex(0)
      }, 1600)
      return () => clearTimeout(timer)
    }

    if (truckStage === 'loading') {
      if (customerCart.length === 0) {
        setTruckStage('loaded')
        return
      }
      setCheckoutStatusText(`Loading product ${loadingItemIndex + 1} of ${customerCart.length} into truck cargo...`)
      if (loadingItemIndex >= 0 && loadingItemIndex < customerCart.length - 1) {
        const timer = setTimeout(() => {
          setLoadingItemIndex(prev => prev + 1)
        }, 850)
        return () => clearTimeout(timer)
      } else if (loadingItemIndex === customerCart.length - 1) {
        // Last item loaded, wait for landing and check API result
        const timer = setTimeout(() => {
          if (apiResult) {
            if (apiResult.success) {
              setTruckStage('loaded')
            } else {
              setTruckStage('failed')
            }
          }
          // If apiResult is still null, we stay in 'loading' showing a wait message
        }, 1000)
        return () => clearTimeout(timer)
      }
    }

    if (truckStage === 'loaded') {
      setCheckoutStatusText('Cargo secured. Dispatched for coordinates!')
      const timer = setTimeout(() => {
        setTruckStage('dispatch')
      }, 1800)
      return () => clearTimeout(timer)
    }

    if (truckStage === 'dispatch') {
      setCheckoutStatusText('Accelerating... Vector tracking activated.')
      const timer = setTimeout(() => {
        setTruckStage('success')
        setCustomerCart([])
        setShowCartModal(false)
      }, 2600)
      return () => clearTimeout(timer)
    }

    if (truckStage === 'failed') {
      setCheckoutStatusText('Checkout failed. Rolling back cargo payload...')
      const timer = setTimeout(() => {
        // Reset states
        setTruckStage('idle')
        setLoadingItemIndex(-1)
        setApiResult(null)
        setIsProcessingCheckout(false)
      }, 3500)
      return () => clearTimeout(timer)
    }
  }, [truckStage, loadingItemIndex, apiResult, customerCart.length, setCustomerCart])

  // Watch for late API responses if loading finishes first
  useEffect(() => {
    if (truckStage === 'loading' && loadingItemIndex === customerCart.length - 1 && apiResult) {
      if (apiResult.success) {
        setTruckStage('loaded')
      } else {
        setTruckStage('failed')
      }
    }
  }, [apiResult, truckStage, loadingItemIndex, customerCart.length])
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', listener)
    return () => mediaQuery.removeEventListener('change', listener)
  }, [])

  const [failedProductIds, setFailedProductIds] = useState<Record<string, boolean>>({})

  // Authenticated states
  const [isAuthenticatedCustomer, setIsAuthenticatedCustomer] = useState(false)
  const [customerAuthForm, setCustomerAuthForm] = useState<'login' | 'register'>('register')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authName, setAuthName] = useState('')
  const [authPhone, setAuthPhone] = useState('')
  const [authAddress, setAuthAddress] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Tracking and rating states
  const [customerTab, setCustomerTab] = useState<'catalog' | 'tracking'>('catalog')
  const [activeRatings, setActiveRatings] = useState<Record<string, number>>({})

  const myOrders = useMemo(() => {
    return dbState.sales.filter(s => s.customerName === customerName)
  }, [dbState.sales, customerName])

  const handleSubmitRating = (orderId: string, rating: number, comment: string) => {
    updateDbState((prev) => {
      const nextSales = prev.sales.map((sale) => {
        if (sale.id === orderId) {
          return { ...sale, rating, review: comment }
        }
        return sale
      })

      const sale = prev.sales.find(s => s.id === orderId)
      let nextProducts = prev.products
      if (sale) {
        nextProducts = prev.products.map((p) => {
          if (p.name === sale.productName) {
            const oldRating = p.rating || 4.5
            const nextRating = parseFloat(((oldRating * 4 + rating) / 5).toFixed(1))
            return { ...p, rating: nextRating }
          }
          return p
        })
      }

      return {
        ...prev,
        sales: nextSales,
        products: nextProducts
      }
    })

    const order = dbState.sales.find(s => s.id === orderId)
    if (order) {
      triggerLog(`[Customer Feedback] User "${customerName}" rated "${order.productName}" ${rating} stars: "${comment || 'No comment written'}"`)
      addNotification('Review Submitted', `Thank you for rating ${order.productName}!`, 'success')
    }
  }

  const handleCancelOrder = (orderId: string) => {
    updateDbState((prev) => {
      const nextSales = prev.sales.map((sale) => {
        if (sale.id === orderId) {
          return { ...sale, shippingStatus: 'cancelled' as const }
        }
        return sale
      })
      return { ...prev, sales: nextSales }
    })

    fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shippingStatus: 'cancelled' })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to cancel order on server.')
        return res.json()
      })
      .then(() => {
        addStoreToast('❌ Order cancelled successfully.', 'success')
        triggerLog(`[Storefront API] Order ${orderId} status set to cancelled.`)
        if (refreshDatabase) {
          refreshDatabase()
        }
      })
      .catch(err => {
        console.error(err)
        addStoreToast('Failed to cancel order.', 'error')
      })
  }

  // Local edit states
  const [editName, setEditName] = useState(customerName)
  const [editEmail, setEditEmail] = useState(customerEmail)
  const [editPhone, setEditPhone] = useState(customerPhone)
  const [editAddress, setEditAddress] = useState(customerAddress)

  // Initialize edit fields when modal opens
  useEffect(() => {
    if (showEditProfileModal) {
      setEditName(customerName)
      setEditEmail(customerEmail)
      setEditPhone(customerPhone)
      setEditAddress(customerAddress)
    }
  }, [showEditProfileModal, customerName, customerEmail, customerPhone, customerAddress])

  const handleSaveProfile = () => {
    setCustomerName(editName.trim() || 'Guest Buyer')
    setCustomerEmail(editEmail.trim() || 'buyer@gmail.com')
    setCustomerPhone(editPhone.trim() || '+91 99999 88888')
    setCustomerAddress(editAddress.trim() || 'Sector 62, Noida, India')

    addNotification('Profile Updated', 'Customer coordinates successfully synchronized.', 'success')
    triggerLog(`[System] Customer profile updated: "${editName}" | Gmail: ${editEmail} | Address: ${editAddress}`)
    setShowEditProfileModal(false)
  }

  const handleFlightComplete = (item: FlyingItem) => {
    // Remove flying item
    setFlyingItems(prev => prev.filter(f => f.id !== item.id))

    // Trigger cart feedback effects
    setCartBounce(true)
    setTimeout(() => setCartBounce(false), 450)

    setCartGlow(true)
    setTimeout(() => setCartGlow(false), 600)

    setCartRipple(true)
    setTimeout(() => setCartRipple(false), 500)

    // Play chime sound
    playSuccessChime()

    // Confetti particles burst
    const newParticles = Array.from({ length: 14 }).map((_, i) => ({
      id: `part-${Date.now()}-${i}-${Math.random()}`,
      angle: (i * 360 / 14) + (Math.random() * 10),
      distance: 35 + Math.random() * 35,
      color: ['#22d3ee', '#3b82f6', '#8b5cf6', '#a855f7', '#22c55e', '#facc15'][i % 6]
    }))
    setCartParticles(prev => [...prev, ...newParticles])
    setTimeout(() => {
      setCartParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)))
    }, 1000)
  }

  const addToCustomerCart = (product: Product, qty = 1, e?: React.MouseEvent) => {
    const existingIdx = customerCart.findIndex((item) => item.product.id === product.id)
    const currentQtyInCart = existingIdx > -1 ? customerCart[existingIdx].quantity : 0

    if (product.stock <= 0 || (currentQtyInCart + qty > product.stock)) {
      // Trigger failed shake animation state on card button
      setFailedProductIds(prev => ({ ...prev, [product.id]: true }))
      setTimeout(() => {
        setFailedProductIds(prev => ({ ...prev, [product.id]: false }))
      }, 1000)

      const errMsg = product.stock <= 0 
        ? `❌ Failed to add ${product.name}. Product is out of stock.`
        : `❌ Failed to add ${product.name}. Exceeds available stock limits.`
      addStoreToast(errMsg, 'error')
      return
    }

    // Set button morph to green "Added ✓" for 1.5s
    setAddedProductIds(prev => ({ ...prev, [product.id]: true }))
    setTimeout(() => {
      setAddedProductIds(prev => ({ ...prev, [product.id]: false }))
    }, 1500)

    // Add to flying items if event is provided and user has not requested reduced motion
    if (e && !prefersReducedMotion) {
      const startX = e.clientX
      const startY = e.clientY
      const animationId = `fly-${Date.now()}-${Math.random()}`
      setFlyingItems(prev => [...prev, { id: animationId, startX, startY, image: product.image }])
    } else {
      // Direct visual landing feedback if no event or reduced-motion is active
      setCartBounce(true)
      setTimeout(() => setCartBounce(false), 450)
      setCartGlow(true)
      setTimeout(() => setCartGlow(false), 600)
      playSuccessChime()
    }

    const updatedCart = [...customerCart]
    if (existingIdx > -1) {
      updatedCart[existingIdx].quantity += qty
      setCustomerCart(updatedCart)
    } else {
      setCustomerCart([...customerCart, { product, quantity: qty }])
    }
    
    addStoreToast(`✅ ${product.name} added to cart successfully`, 'success')
    triggerLog(`[Storefront] Added "${product.name}" (Qty: ${qty}) to customer cart.`)
  }

  const updateCustomerCartQty = (productId: string, delta: number) => {
    const idx = customerCart.findIndex((item) => item.product.id === productId)
    if (idx === -1) return
    const item = customerCart[idx]
    const nextQty = item.quantity + delta
    if (nextQty <= 0) {
      removeFromCustomerCart(productId)
      return
    }
    if (nextQty > item.product.stock) {
      addNotification('Limit Exceeded', `Only ${item.product.stock} units available in stock.`, 'error')
      return
    }
    const updatedCart = [...customerCart]
    updatedCart[idx].quantity = nextQty
    setCustomerCart(updatedCart)
  }

  const removeFromCustomerCart = (productId: string) => {
    setCustomerCart(customerCart.filter((item) => item.product.id !== productId))
  }

  const handleBuyNow = (product: Product) => {
    const existingIdx = customerCart.findIndex(item => item.product.id === product.id)
    if (existingIdx === -1) {
      if (product.stock <= 0) {
        addNotification('Out of Stock', `${product.name} is currently out of stock.`, 'error')
        return
      }
      setCustomerCart(prev => [...prev, { product, quantity: 1 }])
      triggerLog(`[Storefront] Added "${product.name}" (Qty: 1) to customer cart via Buy Now.`)
    }
    setShowCartModal(true)
  }

  const confirmCheckout = () => {
    if (customerCart.length === 0) return

    setApiResult(null)
    setLoadingItemIndex(-1)
    setTruckStage('enter')
    setIsProcessingCheckout(true)

    const cleanPhone = customerPhone || '+91 99999 88888'
    const paymentLabel = paymentMethod === 'cod' 
      ? 'Cash on Delivery (COD)' 
      : paymentMethod === 'wallet' 
        ? 'Wallet Payment' 
        : 'WhatsApp Order'
    const totalAmount = customerCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

    const orderPayload = {
      customerName,
      phone: cleanPhone,
      email: customerEmail,
      address: customerAddress || 'Sector 62, Noida, India',
      products: customerCart.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      total: totalAmount,
      paymentMethod: paymentLabel
    }

    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Transaction ledger handshake failed.')
        return res.json()
      })
      .then((data) => {
        addNotification('Order Placed Successfully', 'Confirmation SMS dispatched to your phone!', 'success')
        triggerLog(`[Storefront API] Online order recorded as ${data.orderNumber} for customer ${customerName}.`)
        
        if (paymentMethod === 'whatsapp') {
          addNotification('Order Placed Successfully', 'Redirecting to WhatsApp to send your order...', 'success')
          const itemsList = customerCart.map(item => `• ${item.quantity}x ${item.product.name} (₹${item.product.price.toLocaleString('en-IN')})`).join('\n')
          const totalAmountStr = totalAmount.toLocaleString('en-IN')
          const whatsappMessage = `Hello! I would like to place an order at ${storeName}:\nOrder ID: ${data.orderNumber}\nName: ${customerName}\nPhone: ${cleanPhone}\nAddress: ${customerAddress || 'Sector 62, Noida, India'}\n\n📦 Order Summary:\n${itemsList}\n\n💰 Total: ₹${totalAmountStr}\n💳 Payment Method: WhatsApp Order\n\nPlease confirm my order and share delivery updates. Thank you!`
          const waLink = `https://wa.me/${storePhone}?text=${encodeURIComponent(whatsappMessage)}`
          window.open(waLink, '_blank')
        }
        
        const itemsSummary = customerCart.map(item => `- ${item.quantity}x ${item.product.name} (₹${item.product.price.toLocaleString('en-IN')})`).join('\n')
        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            text: `Order Confirmed! 🧾 A digital invoice and delivery updates have been successfully dispatched. Invoice Number: **${data.orderNumber}**.\n\n📦 **Order Summary**:\n${itemsSummary}\n- Total: ₹${totalAmount.toLocaleString('en-IN')}\n- Payment: **${paymentLabel}**\n\nLive tracking details are active. Courier service has scheduled dispatch!`
          }
        ])

        // Web3Forms backup email
        if (web3FormsKey) {
          const itemsEmailSummary = customerCart.map(item => `- ${item.quantity}x ${item.product.name}`).join('\n')
          fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: web3FormsKey,
              subject: `BusinessOS AI Order Confirmation - ${customerCart.length} items`,
              from_name: 'Store Owner AI',
              name: customerName,
              email: customerEmail,
              message: `Dear ${customerName},

Your order has been confirmed successfully!

📦 Order Summary:
${itemsEmailSummary}
- Total Price: ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
- Payment Method: ${paymentLabel}

🚚 Delivery Coordinate Details:
- Recipient Name: ${customerName}
- Gmail Recipient: ${customerEmail}
- Contact Phone: ${customerPhone}
- Delivery Address: ${customerAddress}
- Delivery Duration: Under 24 hours via Express Dispatch Courier.

Thank you for shopping with us!`
            })
          })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                triggerLog(`[Email Service] Web3Forms API automatically dispatched real invoice email to Gmail: ${customerEmail}`)
              } else {
                triggerLog(`[Email Service] Web3Forms API dispatch error: ${data.message}`)
              }
            })
            .catch(err => {
              triggerLog(`[Email Service] Web3Forms API request error: ${err.message}`)
            })
        }

        // Store details for success receipt presentation
        setLastCompletedOrder({
          orderNumber: data.orderNumber,
          products: customerCart.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price
          })),
          total: totalAmount,
          paymentMethod: paymentLabel
        })

        if (refreshDatabase) {
          refreshDatabase()
        }

        setApiResult({ success: true, orderNumber: data.orderNumber })
      })
      .catch(err => {
        console.error(err)
        setApiResult({ success: false, error: err.message || 'Error placing order.' })
        addStoreToast(`❌ Failed to place order: ${err.message || 'Network error'}`, 'error')
      })
  }

  const [isTyping, setIsTyping] = useState(false)
  const [outOfStockProduct, setOutOfStockProduct] = useState<Product | null>(null)

  // Simulated voice note recording state for Live Chat
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const recordIntervalRef = useRef<any>(null)

  // Live Chat owner typing simulation
  const [liveTyping, setLiveTyping] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Get active live chat messages from DB state
  const liveMessages = dbState.chatMessages

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, liveMessages, isTyping, liveTyping, chatMode])

  // Process AI chatbot responses
  const getAIResponse = (query: string, history: AIMessage[]): { text: string; products?: Product[] } => {
    const clean = query.toLowerCase().trim()

    // 1. Order products
    if (clean.startsWith('order ') || clean.includes('buy ') || clean.includes('purchase ')) {
      const prodName = clean.replace('order ', '').replace('buy ', '').replace('purchase ', '').trim()
      const found = dbState.products.find(p => p.name.toLowerCase().includes(prodName))

      if (found) {
        if (found.stock > 0) {
          // Open the checkout modal
          setTimeout(() => {
            handleBuyNow(found)
          }, 100)
          return {
            text: `Opening secure checkout window to purchase ${found.image} ${found.name}. Please select your payment method (Cash on Delivery or Wallet Payment) and verify your delivery details.`
          }
        } else {
          setOutOfStockProduct(found)
          return {
            text: `I'm sorry, but ${found.image} ${found.name} is currently out of stock. Would you like me to notify the store owner to restock it?`
          }
        }
      }
      return {
        text: `I couldn't locate a product matching "${prodName}". Feel free to browse our categories in the sidebar.`
      }
    }

    // 2. Centralized query resolver with security boundary and context-memory
    const textResponse = getBotResponse(query, 'support', dbState, history)

    // Find any catalog products mentioned in the RAG response to display as interactive cards
    const matchedProducts = dbState.products.filter(p => 
      textResponse.toLowerCase().includes(p.name.toLowerCase())
    )

    return {
      text: textResponse,
      products: matchedProducts.length > 0 ? matchedProducts.slice(0, 5) : undefined
    }
  }

  const processAIChatMessage = (userMsg: string) => {
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setIsTyping(true)

    const history: AIMessage[] = messages.map(m => ({ role: m.role, text: m.text }))

    // Simulate AI thinking
    setTimeout(() => {
      const response = getAIResponse(userMsg, history)
      setIsTyping(false)
      setMessages(prev => [...prev, { role: 'ai', text: response.text, products: response.products }])

      // Tell/speak back the response to the customer
      speakText(response.text)
    }, 1000)
  }

  const handleAskAIAboutProduct = (productName: string) => {
    setChatMode('ai')
    processAIChatMessage(`Tell me details about the ${productName} (price, stock, and returns)`)
  }

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
        processAIChatMessage(text)
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

  // Handle Send Live Message
  const handleSendLiveMsg = (text: string, type: ChatMessage['type'] = 'text', mediaUrl?: string) => {
    if (!text.trim() && !mediaUrl) return

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      text: text,
      timestamp: new Date().toISOString(),
      type: type,
      mediaUrl: mediaUrl,
      seen: false
    }

    updateDbState(prev => {
      const nextMessages = [...prev.chatMessages, newMsg]
      return { ...prev, chatMessages: nextMessages }
    })

    // Simulated Owner Automatic Response (after 3 seconds)
    setLiveTyping(true)
    setTimeout(() => {
      setLiveTyping(false)
      const autoOwnerMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'owner',
        text: `Thanks for the input. I have received your message: "${text || 'media attachment'}" and will get back to you shortly!`,
        timestamp: new Date().toISOString(),
        type: 'text',
        seen: false
      }

      updateDbState(prev => {
        return { ...prev, chatMessages: [...prev.chatMessages, autoOwnerMsg] }
      })
      triggerLog(`[Live Chat] Automatically compiled store owner reply sequence.`)
    }, 3000)
  }

  // Submit out-of-stock notification request
  const handleNotifyOwner = () => {
    if (!outOfStockProduct) return

    const newRequest = {
      id: `req-${Date.now()}`,
      customerName: customerName,
      requestText: `Customer requested restock of out-of-stock product "${outOfStockProduct.name}".`,
      productRequested: outOfStockProduct.name,
      timestamp: new Date().toISOString(),
      priority: 'High' as const,
      status: 'Pending' as const
    }

    updateDbState(prev => {
      return {
        ...prev,
        customerRequests: [...prev.customerRequests, newRequest]
      }
    })

    triggerLog(`[Request Center] Created restock request ticket for ${outOfStockProduct.name}.`)
    addNotification('Request Submitted', `Store owner has been notified to restock ${outOfStockProduct.name}.`, 'info')

    setMessages(prev => [
      ...prev,
      { role: 'ai', text: `Restock request logged! I have notified the owner about ${outOfStockProduct.name}. We will alert you once stock returns.` }
    ])
    setOutOfStockProduct(null)
  }

  // Simulate Image sharing in live chat
  const simulateSendImage = () => {
    handleSendLiveMsg('Shared a screenshot of order receipt', 'image', 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=400&q=80')
    addNotification('Image Shared', 'Simulated screenshot shared to live chat feed.', 'info')
  }

  // Simulate Invoice PDF sharing in live chat
  const simulateSendFile = () => {
    handleSendLiveMsg('invoice_ledger_copy.pdf', 'file')
    addNotification('File Attached', 'Simulated PDF invoice shared successfully.', 'info')
  }

  // Start voice recorder note simulation
  const startVoiceRecording = () => {
    setIsRecording(true)
    setRecordTime(0)
    recordIntervalRef.current = setInterval(() => {
      setRecordTime(prev => prev + 1)
    }, 1000)
  }

  const stopVoiceRecording = () => {
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current)
    setIsRecording(false)
    handleSendLiveMsg('Simulated Voice Note (0:08)', 'voice')
    addNotification('Voice Note Sent', 'Simulated audio clip forwarded to chat feed.', 'info')
  }

  const renderInputForm = () => {
    if (isRecording) {
      return (
        <div className="flex items-center justify-between rounded-2xl glass p-3 border border-red-500/20">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs text-red-400 font-semibold font-mono">
              Recording Audio: {recordTime}s
            </span>
            <div className="flex gap-0.5 items-center h-4">
              {[1, 2, 3, 2, 1, 2, 3, 4, 3, 2, 1, 2, 3, 2].map((_, i) => (
                <span key={i} className="h-3 w-0.5 bg-red-400 rounded animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (recordIntervalRef.current) clearInterval(recordIntervalRef.current)
                setIsRecording(false)
              }}
              className="p-1 text-slate-500 hover:text-slate-200 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={stopVoiceRecording}
              className="px-4 py-1.5 rounded-xl bg-red-500 text-white text-xs font-semibold cursor-pointer"
            >
              Stop & Send
            </button>
          </div>
        </div>
      )
    }

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (chatMode === 'ai') {
            if (input.trim()) processAIChatMessage(input.trim())
            setInput('')
          } else {
            handleSendLiveMsg(input)
            setInput('')
          }
        }}
        className="flex items-start gap-2 rounded-2xl glass p-2.5 border border-white/5 transition-all focus-within:border-cyan/50"
      >
        {chatMode === 'live' && (
          <div className="flex items-center self-center">
            <button
              type="button"
              onClick={simulateSendImage}
              title="Simulate Image sharing"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <ImageIcon className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={simulateSendFile}
              title="Simulate File invoice sharing"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              <Paperclip className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        <textarea
          rows={Math.min(5, Math.max(1, input.split('\n').length))}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (chatMode === 'ai') {
                if (input.trim()) processAIChatMessage(input.trim())
                setInput('')
              } else {
                handleSendLiveMsg(input)
                setInput('')
              }
            }
          }}
          placeholder={
            chatMode === 'ai'
              ? 'Search products, buy items, ask for recommendations...'
              : 'Send real-time message to owner...'
          }
          className="flex-1 bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none px-3 resize-none py-1.5 custom-scrollbar leading-relaxed"
        />

        {chatMode === 'ai' && (
          <div className="flex gap-1 items-center self-center shrink-0">
            <button
              type="button"
              onClick={triggerVoiceInput}
              title="Speak voice command"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer ${voiceListening
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                  : 'text-slate-400 hover:text-cyan-bright hover:bg-white/5'
                }`}
            >
              <Mic className="h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              onClick={stopSpeaking}
              title="Stop AI voice speaking"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:text-red-400 hover:bg-white/5 transition-all cursor-pointer"
            >
              <Square className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        {chatMode === 'live' && (
          <button
            type="button"
            onClick={startVoiceRecording}
            title="Hold/click to record voice note"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:text-cyan-bright hover:bg-white/5 transition-all self-center cursor-pointer"
          >
            <Mic className="h-4.5 w-4.5" />
          </button>
        )}

        <MagneticButton className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-neon text-white cursor-pointer hover:scale-105 transition-transform self-center">
          <Send className="h-4 w-4" />
        </MagneticButton>
      </form>
    )
  }

  const filteredProducts = dbState.products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (!isAuthenticatedCustomer) {
    return (
      <div className="relative min-h-screen bg-base-50 text-slate-200 flex items-center justify-center p-4">
        {/* Top Right Language Switcher on Auth Screen */}
        <div className="absolute top-4 right-4 z-50">
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 hover:text-white cursor-pointer text-[10px] font-bold select-none"
              title="Select language"
            >
              <Globe className="h-3.5 w-3.5 text-cyan-bright animate-pulse" />
              <span>
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
                  className="absolute right-0 mt-1 w-40 glass-strong border border-white/5 rounded-xl p-1.5 shadow-2xl z-40"
                >
                  {activeLocationConfig.languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code as any)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
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
        </div>

        <div className="pointer-events-none absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-electric/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-neon/5 blur-[80px]" />

        <div className="max-w-md w-full glass-strong rounded-3xl p-6.5 border border-white/10 shadow-2xl relative text-left">
          <div className="text-center mb-6">
            <span className="text-[9px] font-bold text-cyan-bright uppercase tracking-widest bg-cyan/10 px-3 py-1 rounded-full">Secure Storefront Access</span>
            <h2 className="font-display text-xl font-bold text-white mt-3">Customer Portal Authentication</h2>
            <p className="text-[11px] text-slate-400 mt-1">Sign in or register to track cargo shipments and manage orders.</p>
          </div>

          {customerAuthForm === 'login' ? (
            <div className="space-y-4">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Coordinates</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded-xl glass border border-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:border-electric bg-black/20"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Verification Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full rounded-xl glass border border-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:border-electric bg-black/20"
                />
              </div>

              {authError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[11px] text-red-400 font-medium">
                  {authError}
                </div>
              )}

              <button
                disabled={authLoading}
                onClick={async () => {
                  if (!authEmail || !authPassword) {
                    setAuthError('Please enter your email and password.')
                    return
                  }
                  setAuthError('')
                  setAuthLoading(true)
                  try {
                    const res = await fetch(`${API_BASE}/auth/login`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: authEmail, password: authPassword })
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || 'Invalid email or password. Please try again.')
                    setCustomerName(data.customer.name)
                    setCustomerEmail(data.customer.email)
                    setCustomerPhone(data.customer.phone || '')
                    setCustomerAddress(data.customer.address || '')
                    setIsAuthenticatedCustomer(true)
                    triggerLog(`[Auth] Customer "${data.customer.name}" authenticated session successfully via JWT.`)
                  } catch (err: any) {
                    setAuthError(err.message || 'Login failed. Please check your credentials.')
                  } finally {
                    setAuthLoading(false)
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-electric to-cyan text-xs font-bold text-white shadow-lg cursor-pointer hover:scale-[1.01] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {authLoading ? 'Verifying...' : 'Login to Portal'}
              </button>

              <div className="text-center pt-2">
                <button
                  onClick={() => { setCustomerAuthForm('register'); setAuthError('') }}
                  className="text-[10px] text-slate-500 hover:text-cyan-bright transition-colors cursor-pointer"
                >
                  Don't have an account? <span className="font-bold underline">Create Account</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl glass border border-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:border-electric bg-black/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Email Coordinate</label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="john@domain.com"
                    className="w-full rounded-xl glass border border-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:border-electric bg-black/20"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="+91 99999 88888"
                    className="w-full rounded-xl glass border border-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:border-electric bg-black/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl glass border border-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:border-electric bg-black/20"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Shipping Address</label>
                <input
                  type="text"
                  value={authAddress}
                  onChange={(e) => setAuthAddress(e.target.value)}
                  placeholder="Sector 62, Noida, UP"
                  className="w-full rounded-xl glass border border-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:border-electric bg-black/20"
                />
              </div>

              {authError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-[11px] text-red-400 font-medium">
                  {authError}
                  {authError.toLowerCase().includes('already') && (
                    <span
                      className="ml-1 underline cursor-pointer font-bold"
                      onClick={() => { setCustomerAuthForm('login'); setAuthError('') }}
                    >
                      Login instead
                    </span>
                  )}
                </div>
              )}

              <button
                disabled={authLoading}
                onClick={async () => {
                  if (!authName || !authEmail || !authPassword) {
                    setAuthError('Please fill in your name, email and password.')
                    return
                  }
                  setAuthError('')
                  setAuthLoading(true)
                  try {
                    const res = await fetch(`${API_BASE}/auth/register`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        name: authName,
                        email: authEmail,
                        password: authPassword,
                        phone: authPhone,
                        address: authAddress
                      })
                    })
                    const data = await res.json()
                    if (!res.ok) throw new Error(data.error || 'Registration failed. Try a different email.')
                    setCustomerName(data.customer.name)
                    setCustomerEmail(data.customer.email)
                    setCustomerPhone(data.customer.phone || '')
                    setCustomerAddress(data.customer.address || '')
                    setIsAuthenticatedCustomer(true)
                    triggerLog(`[Auth] Registered customer "${data.customer.name}" and issued JWT auth token.`)
                  } catch (err: any) {
                    setAuthError(err.message || 'Registration failed. Try a different email.')
                  } finally {
                    setAuthLoading(false)
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-electric to-cyan text-xs font-bold text-white shadow-lg cursor-pointer hover:scale-[1.01] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
              >
                {authLoading ? 'Creating Account...' : 'Create Account & Access Portal'}
              </button>

              <div className="text-center pt-2">
                <button
                  onClick={() => { setCustomerAuthForm('login'); setAuthError('') }}
                  className="text-[10px] text-slate-500 hover:text-cyan-bright transition-colors cursor-pointer"
                >
                  Already have an account? <span className="font-bold underline">Login</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-base-50 text-slate-200">
      {/* Glow effects */}
      <div className="pointer-events-none absolute top-0 left-1/4 h-[400px] w-[400px] rounded-full bg-electric/10 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-neon/5 blur-[80px]" />

      {/* Header bar */}
      <header className="glass border-b border-white/5 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-neon">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-sm font-bold tracking-tight text-white hidden sm:inline">
            Customer Storefront Portal
          </span>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 bg-black/35 rounded-xl border border-white/5 p-1">
          <button
            onClick={() => setCustomerTab('catalog')}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              customerTab === 'catalog'
                ? 'bg-electric text-white shadow shadow-electric/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Storefront Catalog
          </button>
          <button
            onClick={() => setCustomerTab('tracking')}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              customerTab === 'tracking'
                ? 'bg-electric text-white shadow shadow-electric/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Track Active Orders
            {dbState.sales.filter(s => s.customerName === customerName && s.shippingStatus && s.shippingStatus !== 'delivered').length > 0 && (
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-bright animate-ping" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 hover:text-white cursor-pointer text-[10px] font-bold select-none"
              title="Select language"
            >
              <Globe className="h-3.5 w-3.5 text-cyan-bright animate-pulse" />
              <span className="max-w-[60px] truncate">
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
                  className="absolute right-0 mt-1 w-40 glass-strong border border-white/5 rounded-xl p-1.5 shadow-2xl z-40"
                >
                  {activeLocationConfig.languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code as any)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
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

          <span className="text-[11px] text-slate-400 font-medium">
            Active: <strong className="text-white">{customerName}</strong>
          </span>

          {/* Cart Button */}
          <motion.button
            id="customer-cart-btn"
            onClick={() => setShowCartModal(true)}
            animate={cartBounce ? { scale: [1, 1.25, 0.9, 1.1, 1], rotate: [0, -8, 8, -4, 0] } : {}}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className={`relative flex h-8 items-center gap-1.5 rounded-lg bg-cyan/10 border transition-all px-3 text-[10px] font-bold text-cyan-bright cursor-pointer select-none ${
              cartGlow ? 'border-cyan-bright glow-cyan bg-cyan/20 shadow-lg shadow-cyan/20' : 'border-cyan/25 hover:bg-cyan/25'
            }`}
            title="View Active Shopping Cart"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Cart</span>
            
            {/* Ripple rings */}
            <AnimatePresence>
              {cartRipple && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 border-2 border-cyan-bright rounded-lg pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Particles burst overlay */}
            {cartParticles.map(p => (
              <motion.span
                key={p.id}
                initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [1, 1, 0],
                  x: Math.cos(p.angle * Math.PI / 180) * p.distance,
                  y: Math.sin(p.angle * Math.PI / 180) * p.distance
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 h-1.5 w-1.5 rounded-full pointer-events-none"
                style={{ backgroundColor: p.color, marginLeft: '-3px', marginTop: '-3px' }}
              />
            ))}

            {/* Cart badge with custom number transition */}
            {customerCart.length > 0 && (
              <div className="absolute -top-1.5 -right-1.5 h-4 overflow-hidden rounded-full bg-cyan-bright font-mono text-[8px] font-bold text-base-100 shadow shadow-cyan/40 px-1 flex items-center justify-center min-w-[16px] pointer-events-none">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={customerCart.reduce((sum, item) => sum + item.quantity, 0)}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                    className="inline-block"
                  >
                    {customerCart.reduce((sum, item) => sum + item.quantity, 0)}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
          </motion.button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={() => setIsMuted(prev => !prev)}
            className="flex h-8 w-8 items-center justify-center rounded-lg glass text-slate-400 hover:text-white border border-white/5 hover:border-white/10 cursor-pointer transition-colors"
            title={isMuted ? "Unmute add-to-cart chime" : "Mute add-to-cart chime"}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <button
            onClick={() => setShowEditProfileModal(true)}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-electric/10 border border-electric/25 hover:bg-electric/25 transition-all px-3 text-[10px] font-bold text-electric-bright cursor-pointer"
            title="Edit Customer Profile Coordinates"
          >
            Edit Profile
          </button>

          {/* Theme toggler */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg glass text-slate-300 border border-white/5 hover:border-white/10 hover:text-white cursor-pointer transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={logout}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all px-3 text-[10px] font-bold text-red-400 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Leave Store</span>
          </button>
        </div>
      </header>

      {/* Workspace container */}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid gap-6 grid-cols-12 h-[calc(100vh-140px)] items-stretch">

          {/* MAIN CATALOG PANEL: E-Commerce Catalog Grid */}
          {customerTab === 'catalog' ? (
            <main className="col-span-12 lg:col-span-8 glass-card rounded-2xl p-5 border border-white/5 flex flex-col overflow-hidden max-h-full">
            <div className="border-b border-white/5 pb-3 mb-4 flex flex-col sm:flex-row gap-3 justify-between sm:items-center shrink-0">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Store Catalog Grid</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Premium E-Commerce storefront with real-time stock sync</p>
              </div>
              <div className="flex gap-2 items-center">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl glass border border-white/5 px-3 py-1.5 pl-8 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan/50 w-44"
                  />
                  <svg className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2 top-2 text-slate-400 hover:text-white text-xs">✕</button>
                  )}
                </div>
                <span className="rounded-full bg-cyan/10 border border-cyan/20 px-2 py-1 text-[9px] font-bold text-cyan-bright shrink-0">
                  {filteredProducts.length} Items
                </span>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none shrink-0">
              {categoriesList.map(cat => {
                const isSelected = selectedCategory === cat
                const icon = cat === 'All' ? '🌐' : cat === 'Electronics' ? '🎧' : cat === 'Apparel' ? '🧥' : cat === 'Groceries' ? '🍵' : cat === 'Medical' ? '💊' : '🍔'
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-2 text-[10px] font-semibold transition-all cursor-pointer ${isSelected
                        ? 'bg-gradient-to-r from-electric to-neon text-white shadow shadow-electric/25'
                        : 'glass text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <span>{icon}</span>
                    <span>{cat}</span>
                  </button>
                )
              })}
            </div>

            {/* Grid of E-Commerce Product Cards */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 text-xs">
                  <p>No products found matching your search filters.</p>
                  <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="mt-3 text-cyan-bright hover:underline cursor-pointer">Clear filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-4">
                  {filteredProducts.map(p => {
                    const isAdded = !!addedProductIds[p.id]
                    const isFailed = !!failedProductIds[p.id]
                    return (
                      <motion.div
                        key={p.id}
                        whileHover={{ y: -5, scale: 1.012, boxShadow: "0 15px 30px -5px rgba(6, 182, 212, 0.15)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="glass-card rounded-2xl p-4 flex flex-col justify-between hover:border-cyan/30 transition-all duration-300 relative group h-[255px]"
                      >
                        {/* Product E-Commerce Banner Asset */}
                        <div className="relative h-28 w-full bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-center text-4xl group-hover:scale-[1.01] transition-transform overflow-hidden duration-300">
                          {/* Interactive gradient backdrop */}
                          <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-electric via-transparent to-neon group-hover:opacity-20 transition-opacity" />
                          
                          {p.image && p.image.startsWith('http') ? (
                            <img 
                              src={p.image.includes('unsplash.com/featured') || p.image.includes('source.unsplash.com') ? getProductImage(p.name, p.category) : p.image} 
                              alt={p.name} 
                              className="h-full w-full object-cover relative z-10" 
                            />
                          ) : (
                            <span className="relative z-10 filter drop-shadow-md">{p.image}</span>
                          )}
                          
                          {/* Tiny pulse animation around product image when added */}
                          {isAdded && (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0.8 }}
                              animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0, 0.8] }}
                              transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut" }}
                              className="absolute inset-0 border-2 border-green-500 rounded-xl pointer-events-none z-20"
                            />
                          )}

                          <span className="absolute top-2 right-2 rounded-lg bg-black/40 border border-white/5 px-2 py-0.5 text-[8px] font-bold text-slate-300 uppercase tracking-wider z-20">
                            {p.category}
                          </span>
                        </div>

                        <div className="mt-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-bright transition-colors" title={p.name}>
                              {p.name}
                            </h4>
                            <p className="text-[9px] text-slate-500 font-mono mt-0.5">SKU: {p.sku}</p>
                          </div>

                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs font-bold text-cyan-bright">₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                            {p.stock > 0 ? (
                              <span className="text-[9px] text-green-400 font-bold flex items-center gap-1">
                                ● <span className="text-slate-400 font-medium">Stock: {p.stock}</span>
                              </span>
                            ) : (
                              <span className="text-[9px] text-red-400 font-bold">Out of Stock</span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons footer */}
                        <div className="flex gap-1.5 mt-3 pt-3 border-t border-white/5 shrink-0">
                          {p.stock > 0 ? (
                            <>
                              <motion.button
                                type="button"
                                layout
                                onClick={(e) => addToCustomerCart(p, 1, e)}
                                whileTap={{ scale: 0.94 }}
                                animate={
                                  isFailed
                                    ? { x: [-4, 4, -4, 4, 0], borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }
                                    : isAdded
                                    ? { backgroundColor: "rgba(34, 197, 94, 0.15)", borderColor: "#22c55e", color: "#22c55e", scale: 1 }
                                    : { x: 0, scale: 1 }
                                }
                                whileHover={{
                                  backgroundPosition: '100% 50%',
                                  boxShadow: isAdded ? 'none' : '0 0 12px rgba(6, 182, 212, 0.25)',
                                  borderColor: isAdded ? '#22c55e' : 'rgba(6, 182, 212, 0.5)'
                                }}
                                transition={{
                                  x: { type: "spring", stiffness: 400, damping: 10 },
                                  scale: { type: "spring", stiffness: 300, damping: 15 },
                                  backgroundPosition: { duration: 0.6, ease: "linear" }
                                }}
                                style={{
                                  backgroundImage: isAdded
                                    ? 'none'
                                    : 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(6,182,212,0.15) 50%, rgba(255,255,255,0.05) 100%)',
                                  backgroundSize: '200% auto',
                                  backgroundPosition: '0% 50%'
                                }}
                                className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold cursor-pointer border flex items-center justify-center gap-1 min-w-[74px] shrink-0 select-none ${
                                  isFailed
                                    ? 'text-red-400 border-red-500'
                                    : isAdded
                                    ? 'text-green-400 border-green-500'
                                    : 'text-white border-white/10 hover:text-cyan-bright'
                                }`}
                              >
                                {isFailed ? (
                                  <motion.span
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-0.5"
                                  >
                                    Error ❌
                                  </motion.span>
                                ) : isAdded ? (
                                  <motion.span
                                    initial={{ scale: 0.6, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex items-center gap-0.5"
                                  >
                                    Added ✓
                                  </motion.span>
                                ) : (
                                  "Add Cart"
                                )}
                              </motion.button>
                              <button
                                type="button"
                                onClick={() => handleBuyNow(p)}
                                className="flex-1 rounded-lg bg-gradient-to-r from-electric to-neon py-1.5 text-[10px] font-bold text-white cursor-pointer text-center hover:opacity-90 transition-opacity"
                              >
                                Buy Now
                              </button>
                            </>
                          ) : (
                          <button
                            onClick={() => setOutOfStockProduct(p)}
                            className="flex-1 rounded-lg bg-red-500/10 border border-red-500/20 py-1.5 text-[10px] font-semibold text-red-400 cursor-pointer text-center hover:bg-red-500/20 transition-colors"
                          >
                            Restock Notify
                          </button>
                        )}
                        <button
                          onClick={() => handleAskAIAboutProduct(p.name)}
                          title="Ask AI Companion about this product"
                          className="px-2.5 rounded-lg border border-cyan/20 hover:border-cyan/50 bg-cyan/5 hover:bg-cyan/10 text-cyan-bright cursor-pointer flex items-center justify-center transition-colors"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  )})}
                </div>
              )}
            </div>

            {/* Nearest Showroom quick locator at bottom of storefront catalog */}
            <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 mt-4 shrink-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-bright" />
                <div className="text-left">
                  <p className="text-[10px] font-bold text-white">Nearest Store: {activeLocation.name}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">📍 {activeLocation.address.slice(0, 42)}... ({activeLocation.distance} away)</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                {locations.map((loc, idx) => (
                  <button
                    key={loc.name}
                    onClick={() => setSelectedLocIdx(idx)}
                    className={`text-[8px] font-semibold rounded px-1.5 py-0.5 cursor-pointer border ${selectedLocIdx === idx ? 'bg-cyan/15 border-cyan text-cyan-bright' : 'glass border-transparent text-slate-500'
                      }`}
                  >
                    {loc.name.split(',')[0].split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </main>
        ) : (
          <main className="col-span-12 lg:col-span-8 glass-card rounded-2xl p-5 border border-white/5 flex flex-col overflow-hidden max-h-full">
            {/* Interactive My Orders & Tracking view! */}
            <div className="border-b border-white/5 pb-3 mb-4 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">My Orders & Live Tracking</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Track your shipments and rate delivered items in real-time</p>
              </div>
              <span className="rounded-full bg-cyan/10 border border-cyan/20 px-2 py-1 text-[9px] font-bold text-cyan-bright">
                {myOrders.length} Orders
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {myOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center text-slate-500 text-xs">
                  <ShoppingBag className="h-8 w-8 text-slate-700 mb-2.5" />
                  <p>You haven't placed any orders yet.</p>
                  <button onClick={() => setCustomerTab('catalog')} className="mt-2 text-cyan-bright hover:underline cursor-pointer">Shop Storefront Catalog</button>
                </div>
              ) : (
                myOrders.map((order) => {
                  const status = order.shippingStatus || 'confirmed'
                  const steps = [
                    { label: 'Confirmed', key: 'confirmed' },
                    { label: 'Shipped', key: 'shipped' },
                    { label: 'Out for Delivery', key: 'out_for_delivery' },
                    { label: 'Delivered', key: 'delivered' }
                  ]
                  const currentStepIdx = steps.findIndex(s => s.key === status)
                  
                  return (
                    <div key={order.id} className="glass p-4 rounded-xl border border-white/5 space-y-4">
                      {/* Order Header */}
                      <div className="flex justify-between items-start border-b border-white/5 pb-2.5">
                        <div>
                          <span className="text-[8px] font-mono text-slate-500 uppercase">Order ID: {order.id.slice(-6).toUpperCase()}</span>
                          <h4 className="text-xs font-bold text-white mt-0.5">{order.productName}</h4>
                          <p className="text-[9px] text-slate-400 mt-0.5">Quantity: {order.quantity} · Price: ₹{order.total.toLocaleString('en-IN')}</p>
                        </div>
                        <span className={`text-[9px] font-bold rounded-lg px-2.5 py-0.5 ${
                          status === 'delivered'
                            ? 'bg-green-500/10 text-green-400'
                            : status === 'cancelled'
                            ? 'bg-red-500/10 text-red-400'
                            : 'bg-cyan/10 text-cyan-bright animate-pulse'
                        }`}>
                          {status.toUpperCase().replace(/_/g, ' ')}
                        </span>
                      </div>



                      {/* Tracker Progress Bar - Hide if Cancelled */}
                      {status !== 'cancelled' && (
                        <div className="relative pt-4 pb-2">
                          <div className="absolute left-4 right-4 top-[26px] h-0.5 bg-white/5 z-0" />
                          <div
                            className="absolute left-4 top-[26px] h-0.5 bg-gradient-to-r from-electric to-cyan z-0 transition-all duration-500"
                            style={{
                              width: `${(currentStepIdx / (steps.length - 1)) * 90}%`
                            }}
                          />
                          <div className="relative z-10 flex justify-between">
                            {steps.map((step, idx) => {
                              const isCompleted = idx <= currentStepIdx
                              const isActive = idx === currentStepIdx
                              return (
                                <div key={step.key} className="flex flex-col items-center">
                                  <div className={`h-6.5 w-6.5 rounded-full flex items-center justify-center border font-bold text-[10px] transition-all duration-300 ${
                                    isCompleted
                                      ? 'bg-gradient-to-r from-electric to-cyan border-transparent text-white scale-110 shadow-lg shadow-electric/20'
                                      : 'bg-black border-white/10 text-slate-500'
                                  }`}>
                                    {isCompleted ? '✓' : idx + 1}
                                  </div>
                                  <span className={`text-[8px] font-bold mt-1.5 transition-colors ${
                                    isActive
                                      ? 'text-cyan-bright'
                                      : isCompleted
                                      ? 'text-slate-300'
                                      : 'text-slate-500'
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Cancel Order Action button (active orders in transit) */}
                      {status !== 'delivered' && status !== 'cancelled' && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order.id)}
                            className="rounded-xl border border-red-500/20 hover:border-red-500/60 bg-red-500/5 hover:bg-red-500/10 px-3 py-1.5 text-[9px] font-mono font-bold text-red-400 cursor-pointer transition-colors duration-200"
                          >
                            Cancel Order ✕
                          </button>
                        </div>
                      )}

                      {/* Rating block (only visible if delivered) */}
                      {status === 'delivered' && (
                        <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5 mt-2">
                          {order.rating ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-bold text-green-400">✓ Rated:</span>
                              <div className="flex gap-0.5 text-xs text-yellow-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i}>{i < order.rating! ? '★' : '☆'}</span>
                                ))}
                              </div>
                              {order.review && (
                                <p className="text-[10px] text-slate-400 italic">"{order.review}"</p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              <span className="text-[10px] font-black text-white uppercase tracking-wider block">How was your product? Rate it:</span>
                              <div className="flex items-center gap-1.5">
                                {Array.from({ length: 5 }).map((_, i) => {
                                  const starVal = i + 1
                                  const isSelected = starVal <= (activeRatings[order.id] || 0)
                                  return (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => setActiveRatings(prev => ({ ...prev, [order.id]: starVal }))}
                                      className={`text-lg transition-transform hover:scale-125 cursor-pointer ${
                                        isSelected ? 'text-yellow-400' : 'text-slate-600'
                                      }`}
                                    >
                                      ★
                                    </button>
                                  )
                                })}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Write a quick feedback comment..."
                                  id={`review-input-${order.id}`}
                                  className="flex-1 rounded-xl glass border border-white/5 px-3 py-1.5 text-[10px] text-white focus:outline-none focus:border-cyan/50"
                                />
                                <button
                                  onClick={() => {
                                    const inputEl = document.getElementById(`review-input-${order.id}`) as HTMLInputElement
                                    const comment = inputEl ? inputEl.value.trim() : ''
                                    const stars = activeRatings[order.id] || 5
                                    handleSubmitRating(order.id, stars, comment)
                                  }}
                                  className="rounded-xl bg-cyan hover:bg-cyan/85 px-3 py-1.5 text-[10px] font-bold text-white transition-colors cursor-pointer"
                                >
                                  Submit Review
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </main>
        )}

          {/* DOCKED SIDEBAR PANEL: AI Companion Chat & Live Support */}
          <aside className="col-span-12 lg:col-span-4 flex flex-col h-full overflow-hidden bg-base-50 rounded-2xl border border-white/5 max-h-full">
            {/* Mode Toggles */}
            <div className="glass border-b border-white/5 p-2 flex justify-center gap-1 shrink-0">
              <button
                onClick={() => setChatMode('ai')}
                className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold border transition-all cursor-pointer text-center ${chatMode === 'ai'
                    ? 'bg-electric/15 border-electric text-white shadow shadow-electric/25'
                    : 'glass text-slate-400 hover:text-white border-white/5'
                  }`}
              >
                <Bot className="h-3 w-3 inline mr-1" /> AI Agent
              </button>
              <button
                onClick={() => setChatMode('live')}
                className={`flex-1 rounded-lg py-1.5 text-[10px] font-bold border transition-all cursor-pointer text-center ${chatMode === 'live'
                    ? 'bg-neon/15 border-neon text-white shadow shadow-neon/25'
                    : 'glass text-slate-400 hover:text-white border-white/5'
                  }`}
              >
                <MessageSquare className="h-3 w-3 inline mr-1" /> Live Chat
              </button>
            </div>

            {/* Message Area inside Docked Sidebar */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4.5 custom-scrollbar bg-base-50">
              {chatMode === 'ai' ? (
                <>
                  {messages.map((m, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex gap-2 max-w-[90%] items-start">
                        {m.role === 'ai' && (
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gradient-to-br from-cyan-500 to-blue-600 text-xs">
                            👨‍💼
                          </div>
                        )}
                        <div>
                          <div
                            className={`rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed ${m.role === 'user'
                                ? 'bg-gradient-to-br from-electric to-neon text-white font-semibold shadow'
                                : 'glass-card text-slate-200 border border-white/5'
                              }`}
                          >
                            {m.text}
                          </div>

                          {/* Dynamic inline product cards */}
                          {m.products && m.products.length > 0 && (
                            <div className="grid gap-2 grid-cols-1 mt-2.5">
                              {m.products.map(p => (
                                <div key={p.id} className="glass p-2 rounded-xl border border-white/5 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="h-6 w-6 rounded flex items-center justify-center bg-white/5 border border-white/5 overflow-hidden text-lg shrink-0">
                                      {p.image && p.image.startsWith('http') ? (
                                        <img 
                                          src={p.image.includes('unsplash.com/featured') || p.image.includes('source.unsplash.com') ? getProductImage(p.name, p.category) : p.image} 
                                          alt={p.name} 
                                          className="h-full w-full object-cover" 
                                        />
                                      ) : (
                                        p.image
                                      )}
                                    </span>
                                    <div>
                                      <p className="text-[9px] font-bold text-white leading-tight">{p.name}</p>
                                      <p className="text-[8px] text-cyan-bright font-semibold">₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                    </div>
                                  </div>
                                  {p.stock > 0 ? (
                                    <button
                                      type="button"
                                      onClick={() => handleBuyNow(p)}
                                      className="rounded bg-electric px-1.5 py-0.5 text-[8px] font-bold text-white cursor-pointer"
                                    >
                                      Buy
                                    </button>
                                  ) : (
                                    <span className="text-[8px] text-red-400 font-semibold">Empty</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 max-w-[90%] items-start">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gradient-to-br from-neon to-purple-600 text-xs">
                          🤖
                        </div>
                        <div className="glass-card rounded-2xl px-3.5 py-2.5">
                          <div className="flex gap-1.5 py-0.5">
                            {[0, 1, 2].map((d) => (
                              <motion.span
                                key={d}
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                                className="h-1 w-1 rounded-full bg-slate-400"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Out of Stock request dialog */}
                  {outOfStockProduct && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="glass p-3 rounded-xl border border-red-500/20 max-w-xs mt-2 flex items-center justify-between"
                    >
                      <div className="text-[10px]">
                        <p className="font-bold text-white">Notify Restock?</p>
                        <p className="text-slate-400 text-[9px] mt-0.5">Request restock of {outOfStockProduct.name}.</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => setOutOfStockProduct(null)}
                          className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[9px] text-slate-400 font-semibold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleNotifyOwner}
                          className="px-2 py-1 rounded bg-gradient-to-r from-electric to-cyan text-[9px] text-white font-semibold cursor-pointer"
                        >
                          Notify
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                <>
                  {liveMessages.map((m) => {
                    const isSelf = m.sender === 'customer'
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex gap-2 max-w-[90%] items-start">
                          {!isSelf && (
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gradient-to-br from-electric to-blue-600 text-xs">
                              👨‍💼
                            </div>
                          )}
                          <div>
                            <div
                              className={`rounded-2xl px-3.5 py-2.5 text-[11px] leading-relaxed ${isSelf
                                  ? 'bg-gradient-to-br from-neon to-purple-600 text-white font-semibold shadow'
                                  : 'glass-card text-slate-200 border border-white/5'
                                }`}
                            >
                              {m.type === 'text' && m.text}

                              {m.type === 'image' && (
                                <div className="space-y-1">
                                  <img src={m.mediaUrl} alt="uploaded" className="rounded-xl max-h-36 max-w-full object-cover border border-white/10" />
                                  <p className="italic text-[9px] text-slate-300">{m.text}</p>
                                </div>
                              )}

                              {m.type === 'file' && (
                                <div className="flex items-center gap-2 bg-black/25 p-1.5 rounded-lg border border-white/5">
                                  <FileText className="h-4.5 w-4.5 text-cyan-bright" />
                                  <div className="text-left font-mono">
                                    <p className="text-[9px] font-bold text-white truncate max-w-[90px]">{m.text}</p>
                                    <p className="text-[7px] text-slate-500">2.4 MB · PDF</p>
                                  </div>
                                </div>
                              )}

                              {m.type === 'voice' && (
                                <div className="flex items-center gap-2">
                                  <button className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer">
                                    <Play className="h-2.5 w-2.5 fill-white text-white ml-0.5" />
                                  </button>
                                  <div className="w-16 h-5 flex items-center gap-0.5">
                                    {[2, 4, 3, 5, 3, 4, 3, 4, 3, 2, 3, 4].map((h, i) => (
                                      <span key={i} className="bg-cyan-bright opacity-60 w-0.5 rounded" style={{ height: `${h * 2}px` }} />
                                    ))}
                                  </div>
                                  <span className="text-[8px] font-mono text-slate-400">0:08</span>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end items-center gap-1 mt-1 text-[8px] text-slate-500">
                              <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isSelf && (
                                <span>
                                  {m.seen ? (
                                    <CheckCheck className="h-2.5 w-2.5 text-cyan-bright" />
                                  ) : (
                                    <CheckCheck className="h-2.5 w-2.5 text-slate-500" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}

                  {liveTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-2 max-w-[90%] items-start">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gradient-to-br from-electric to-blue-600 text-xs">
                          👨‍💼
                        </div>
                        <div className="glass-card rounded-2xl px-3.5 py-2.5">
                          <div className="flex gap-1.5 py-0.5">
                            {[0, 1, 2].map((d) => (
                              <motion.span
                                key={d}
                                animate={{ y: [0, -3, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
                                className="h-1 w-1 rounded-full bg-slate-400"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Panel at the BOTTOM */}
            <div className="border-t border-white/5 p-4 bg-base shrink-0">
              {renderInputForm()}
            </div>
          </aside>
        </div>
      </div>
      {/* Checkout Modal Overlay */}
      {showCartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-strong max-w-xl w-full rounded-3xl p-6 text-left shadow-2xl glow-cyan text-slate-200 flex flex-col max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-3.5 mb-4 shrink-0">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                🛒 Shopping Cart & Secure Checkout
              </h3>
              <button
                onClick={() => setShowCartModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {customerCart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 text-xs">
                  <ShoppingCart className="h-10 w-10 text-slate-700 mb-2" />
                  <p>Your cart is empty.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Select items in the store catalog to proceed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Cart Items List */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Items in Cart</span>
                    {customerCart.map((item) => (
                      <div key={item.product.id} className="glass p-3.5 rounded-2xl border border-white/5 flex items-center justify-between transition-all">
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <span className="text-3xl bg-white/5 h-12 w-12 flex items-center justify-center rounded-xl overflow-hidden shrink-0 border border-white/5">
                            {item.product.image && item.product.image.startsWith('http') ? (
                              <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                            ) : (
                              item.product.image
                            )}
                          </span>
                          <div className="text-left min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-black text-white truncate pr-1" title={item.product.name}>
                              {item.product.name}
                            </p>
                            <p className="text-xs text-cyan-bright font-bold mt-1">₹{item.product.price.toLocaleString('en-IN')}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <div className="flex items-center bg-black/45 rounded-xl border border-white/5 p-1">
                            <button
                              type="button"
                              onClick={() => updateCustomerCartQty(item.product.id, -1)}
                              className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-xs font-extrabold text-white font-mono">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateCustomerCartQty(item.product.id, 1)}
                              className="h-6 w-6 rounded-lg flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCustomerCart(item.product.id)}
                            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove product"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/5 pt-4" />

                  {/* Delivery & Coordinates */}
                  <div className="space-y-3.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Delivery & Payment details</span>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Customer Name</label>
                        <input
                          type="text"
                          value={customerName}
                          disabled
                          className="w-full rounded-xl bg-white/[0.02] border border-white/5 px-3 py-1.5 text-xs text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Gmail Address</label>
                        <input
                          type="email"
                          value={customerEmail}
                          disabled
                          className="w-full rounded-xl bg-white/[0.02] border border-white/5 px-3 py-1.5 text-xs text-slate-400 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Contact Phone</label>
                        <input
                          type="text"
                          value={customerPhone}
                          disabled
                          className="w-full rounded-xl bg-white/[0.02] border border-white/5 px-3 py-1.5 text-xs text-slate-400 cursor-not-allowed font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Delivery Address</label>
                        <input
                          type="text"
                          value={customerAddress}
                          disabled
                          className="w-full rounded-xl bg-white/[0.02] border border-white/5 px-3 py-1.5 text-xs text-slate-400 cursor-not-allowed truncate"
                        />
                      </div>
                    </div>

                    {/* Payment Mode */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Payment Method</span>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('cod')}
                          className={`flex items-center justify-center gap-2 rounded-xl p-2.5 border text-[11px] font-bold transition-all cursor-pointer ${paymentMethod === 'cod'
                              ? 'bg-electric/15 border-electric text-white shadow-lg glow-blue'
                              : 'glass border-white/5 text-slate-400 hover:text-white'
                            }`}
                        >
                          💵 COD
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('wallet')}
                          className={`flex items-center justify-center gap-2 rounded-xl p-2.5 border text-[11px] font-bold transition-all cursor-pointer ${paymentMethod === 'wallet'
                              ? 'bg-neon/15 border-neon text-white shadow-lg glow-purple'
                              : 'glass border-white/5 text-slate-400 hover:text-white'
                            }`}
                        >
                          💳 Wallet
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('whatsapp')}
                          className={`flex items-center justify-center gap-2 rounded-xl p-2.5 border text-[11px] font-bold transition-all cursor-pointer ${paymentMethod === 'whatsapp'
                              ? 'bg-green-500/15 border-green-500 text-white shadow-lg glow-green'
                              : 'glass border-white/5 text-slate-400 hover:text-white'
                            }`}
                        >
                          💬 WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary bill calculation */}
                  <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex justify-between items-center mt-4">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Total Cart Bill</span>
                      <p className="text-base font-bold text-white font-mono mt-0.5">₹{customerCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <span className="text-[9px] font-bold bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      dispatch ready
                    </span>
                  </div>

                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 mt-5 pt-3.5 border-t border-white/5 shrink-0">
              <button
                type="button"
                onClick={() => setShowCartModal(false)}
                className="flex-1 rounded-xl border border-white/5 hover:bg-white/5 py-2.5 text-xs font-semibold text-slate-400 transition-colors cursor-pointer text-center"
              >
                Continue Shopping
              </button>
              <motion.button
                type="button"
                onClick={confirmCheckout}
                disabled={customerCart.length === 0 || isProcessingCheckout}
                whileTap={{ scale: 0.95 }}
                className="flex-1 rounded-xl bg-gradient-to-r from-electric to-cyan py-2.5 text-xs font-semibold text-white shadow-lg shadow-electric/25 hover:scale-[1.01] transition-transform disabled:opacity-40 disabled:hover:scale-100 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                {isProcessingCheckout ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Transmitting Coordinates...</span>
                  </>
                ) : (
                  <span>{paymentMethod === 'whatsapp' ? 'Order & Send via WhatsApp 💬' : 'Place Bill & Order'}</span>
                )}
              </motion.button>
            </div>

          </motion.div>
        </div>
      )}

      {/* Edit Profile Modal Overlay */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-strong max-w-md w-full rounded-3xl p-6 text-left shadow-2xl glow-cyan text-slate-200"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3.5 mb-4">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                👤 Edit Customer Profile
              </h3>
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl glass px-4 py-2.5 text-xs text-white focus:border-cyan focus:outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Gmail Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl glass px-4 py-2.5 text-xs text-white focus:border-cyan focus:outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Location / Contact Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl glass px-4 py-2.5 text-xs text-white focus:border-cyan focus:outline-none mt-1"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Delivery Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full rounded-xl glass px-4 py-2.5 text-xs text-white focus:border-cyan focus:outline-none mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-white/5">
              <button
                onClick={() => setShowEditProfileModal(false)}
                className="flex-1 rounded-xl border border-white/5 hover:bg-white/5 py-3 text-xs font-semibold text-slate-400 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="flex-1 rounded-xl bg-gradient-to-r from-electric to-cyan py-3 text-xs font-semibold text-white shadow-lg shadow-electric/25 hover:scale-[1.02] transition-transform cursor-pointer text-center"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ x: 150, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 150, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="pointer-events-auto relative rounded-2xl glass-strong border border-white/10 p-4 shadow-2xl flex items-center justify-between gap-3 overflow-hidden text-slate-200"
            >
              {/* Background gradient indicator */}
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${t.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />

              <div className="flex items-center gap-2.5 text-xs font-bold leading-tight pl-2">
                <span>{t.type === 'success' ? '✅' : '❌'}</span>
                <span>{t.message}</span>
              </div>

              <button
                type="button"
                onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
                className="text-slate-400 hover:text-white text-xs cursor-pointer select-none pl-2 transition-colors"
              >
                ✕
              </button>

              {/* Toast timer progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-1 ${t.type === 'success' ? 'bg-green-500/50' : 'bg-red-500/50'}`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Cinematic Delivery Truck & Loading Overlay */}
      <AnimatePresence>
        {truckStage !== 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/92 backdrop-blur-2xl p-4 text-center select-none"
          >
            {truckStage !== 'success' && (
              <>
                {/* 1. Highway road with perspective lines traveling forward-right */}
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none z-0">
                  <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 800 600" preserveAspectRatio="none">
                    {/* Left road shoulder */}
                    <path d="M 0,380 L 800,560" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="3" />
                    {/* Center lane divider in perspective */}
                    <motion.path
                      d="M -100,325 L 900,575"
                      stroke="rgba(6, 182, 212, 0.35)"
                      strokeWidth="5"
                      strokeDasharray="25, 35"
                      animate={(truckStage === 'enter' || truckStage === 'dispatch') ? { strokeDashoffset: [0, -120] } : {}}
                      transition={{ repeat: Infinity, ease: 'linear', duration: truckStage === 'dispatch' ? 0.25 : 0.7 }}
                    />
                    {/* Right road shoulder */}
                    <path d="M 0,440 L 800,600" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="3" />
                  </svg>
                </div>

                {/* 2. Dust trails when accelerating (drift back-left along road path) */}
                {truckStage === 'dispatch' && Array.from({ length: 15 }).map((_, idx) => (
                  <motion.span
                    key={`dust-${idx}`}
                    initial={{
                      position: 'absolute',
                      left: '42%',
                      top: '59%',
                      scale: 0.2,
                      opacity: 0.8
                    }}
                    animate={{
                      x: -160 - Math.random() * 120,
                      y: -25 - Math.random() * 20,
                      scale: 4 + Math.random() * 3,
                      opacity: 0
                    }}
                    transition={{
                      duration: 0.6 + idx * 0.08,
                      ease: 'easeOut',
                      delay: idx * 0.05
                    }}
                    className="h-2.5 w-2.5 rounded-full bg-slate-600 pointer-events-none filter blur-sm"
                  />
                ))}

                {/* 3. Delivery Truck Frame */}
                <motion.div
                  key={truckBounceCount}
                  initial={
                    truckStage === 'enter'
                      ? { x: -350, y: -100, scale: 0.4 }
                      : false
                  }
                  animate={
                    truckStage === 'enter'
                      ? { x: 0, y: 0, scale: 1 }
                      : truckStage === 'loading'
                      ? { y: [0, 6, -3, 0] }
                      : truckStage === 'dispatch'
                      ? { x: [0, 150, 650], y: [0, 80, 320], scale: [1, 1.25, 2.8] }
                      : truckStage === 'failed'
                      ? { x: [0, -120, -500], y: [0, -60, -250], scale: [1, 0.8, 0.3] }
                      : { x: 0, y: 0, scale: 1 }
                  }
                  transition={
                    truckStage === 'dispatch'
                      ? { duration: 2.2, ease: [0.45, 0, 0.55, 1] }
                      : truckStage === 'enter'
                      ? { type: 'spring', stiffness: 120, damping: 18 }
                      : { type: 'spring', stiffness: 200, damping: 15 }
                  }
                  className="relative z-10 w-72 h-44 flex items-center justify-center pointer-events-none"
                >
                  <img
                    src="/delivery_truck.png"
                    alt="Futuristic Delivery Truck"
                    className="w-full h-full object-contain drop-shadow-[0_20px_45px_rgba(6,182,212,0.35)]"
                  />

                  {/* Laser scanning check indicator over cargo hold when packed */}
                  {truckStage === 'loaded' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                      className="absolute top-[32%] left-[45%] flex h-9 w-9 items-center justify-center rounded-full bg-green-500/90 shadow-lg shadow-green-500/30 z-20 border border-white/20"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}

                  {/* Laser cross indicator if failed */}
                  {truckStage === 'failed' && (
                    <div className="absolute top-[32%] left-[45%] flex h-9 w-9 items-center justify-center rounded-full bg-red-500/90 shadow-lg shadow-red-500/30 z-20 border border-white/20">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </motion.div>

                {/* 4. Active product flyer loader element */}
                {truckStage === 'loading' && loadingItemIndex >= 0 && loadingItemIndex < customerCart.length && (
                  <>
                    {/* Sparkle particle trail for the item */}
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <motion.span
                        key={`loader-sparkle-${idx}`}
                        initial={{
                          position: 'fixed',
                          left: '50%',
                          top: '75%',
                          x: 0,
                          y: 0,
                          scale: 0.5,
                          opacity: 0.9
                        }}
                        animate={{
                          x: [-20, -100, -65],
                          y: [0, -180, -110],
                          scale: [0, 1.2, 0],
                          opacity: [0.9, 0.6, 0]
                        }}
                        transition={{
                          duration: 0.7,
                          delay: idx * 0.05
                        }}
                        className="absolute h-1.5 w-1.5 rounded-full bg-cyan-bright pointer-events-none shadow"
                      />
                    ))}

                    {/* Flying Product Thumbnail Image Clone */}
                    <motion.div
                      initial={{
                        position: 'fixed',
                        left: '50%',
                        top: '75%',
                        x: -20,
                        y: 0,
                        scale: 0.3,
                        opacity: 0,
                        filter: 'blur(0px)'
                      }}
                      animate={{
                        x: [-20, -100, -65], // Arcs left and enters truck trailer
                        y: [0, -180, -110],   // Arcs up and falls into the truck cargo hold
                        scale: [0.3, 1.2, 0.45],
                        opacity: [0, 1, 1, 0],
                        filter: ['blur(0px)', 'blur(1.2px)', 'blur(0px)']
                      }}
                      transition={{
                        duration: 0.8,
                        ease: 'easeInOut'
                      }}
                      className="h-10 w-10 bg-white/5 rounded-xl border border-white/10 shadow-2xl flex items-center justify-center text-2xl overflow-hidden glass z-20 pointer-events-none"
                    >
                      {customerCart[loadingItemIndex]?.product.image && customerCart[loadingItemIndex].product.image.startsWith('http') ? (
                        <img src={customerCart[loadingItemIndex].product.image} alt="Flying Item" className="h-full w-full object-cover" />
                      ) : (
                        customerCart[loadingItemIndex]?.product.image
                      )}
                    </motion.div>
                  </>
                )}

                {/* 5. Status Text and Cycler */}
                <div className="mt-8 space-y-2 z-10">
                  <h3 className="font-display text-sm font-black text-white tracking-widest uppercase glow-cyan-text">
                    {truckStage === 'failed' ? 'Transaction Interrupted' : 'Secure Air Coordination'}
                  </h3>
                  
                  {/* Status update description */}
                  <motion.p
                    key={checkoutStatusText}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-[10px] text-slate-400 font-mono h-4 min-w-[280px]"
                  >
                    {checkoutStatusText}
                  </motion.p>

                  <div className="mx-auto w-32 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                      className={`h-full w-1/2 rounded-full ${truckStage === 'failed' ? 'bg-red-500' : 'bg-gradient-to-r from-electric to-cyan'}`}
                    />
                  </div>
                  
                  {(truckStage === 'enter' || truckStage === 'loading' || truckStage === 'loaded') && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={() => {
                        setTruckStage('failed')
                        setApiResult({ success: false, error: 'Order cancelled by customer.' })
                        addStoreToast('❌ Order cancelled by customer.', 'error')
                      }}
                      whileHover={{ scale: 1.03, backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444' }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-6 px-4 py-2 border border-white/10 bg-white/[0.02] hover:border-red-500/50 rounded-xl text-[10px] font-mono font-bold text-slate-400 hover:text-red-400 cursor-pointer transition-colors duration-200"
                    >
                      Cancel Order
                    </motion.button>
                  )}
                </div>
              </>
            )}

            {/* 6. Success Confirmation Screen */}
            {truckStage === 'success' && (
              <div className="relative flex flex-col items-center justify-center p-6 text-center max-w-sm w-full z-10">
                {/* Confetti Explosion sparks */}
                {Array.from({ length: 40 }).map((_, idx) => {
                  const angle = Math.random() * 360
                  const distance = 80 + Math.random() * 150
                  const colors = ['#22d3ee', '#8b5cf6', '#a855f7', '#facc15', '#10b981', '#ffffff']
                  return (
                    <motion.span
                      key={`confetti-${idx}`}
                      initial={{
                        position: 'absolute',
                        left: '50%',
                        top: '15%',
                        x: 0,
                        y: 0,
                        scale: 0.5 + Math.random() * 0.5,
                        opacity: 1
                      }}
                      animate={{
                        x: Math.cos(angle * Math.PI / 180) * distance,
                        y: Math.sin(angle * Math.PI / 180) * distance + 60,
                        opacity: [1, 1, 0]
                      }}
                      transition={{
                        duration: 1.8 + Math.random() * 1.2,
                        ease: 'easeOut'
                      }}
                      className="h-1.5 w-1.5 rounded-full pointer-events-none"
                      style={{ backgroundColor: colors[idx % colors.length] }}
                    />
                  )
                })}

                {/* 3D Sphere Checkmark Ring */}
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 220, damping: 15 }}
                  className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-2xl border-2 border-white/20 mb-5 shadow-green-500/30"
                >
                  <svg className="w-12 h-12 text-white drop-shadow" viewBox="0 0 52 52" fill="none">
                    <motion.path
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 27l7.5 7.5L38 18"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    />
                  </svg>
                </motion.div>

                <h3 className="font-display text-2xl font-black text-white uppercase tracking-wider glow-cyan-text">
                  Order Dispatched!
                </h3>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed font-mono">
                  Your package has loaded and rolled out!
                </p>

                {/* Printout receipt slide-in summary */}
                {lastCompletedOrder && (
                  <motion.div
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 180, damping: 18 }}
                    className="mt-5 w-full rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left text-xs relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-repeat-x" style={{ backgroundImage: 'radial-gradient(circle, #334155 1px, transparent 1px)', backgroundSize: '6px 100%' }} />
                    <div className="pt-2 flex justify-between items-center text-slate-400 font-mono text-[9px]">
                      <span>INVOICE DATA</span>
                      <span>#{lastCompletedOrder.orderNumber}</span>
                    </div>
                    <div className="border-b border-white/5 pb-2 mb-2 mt-1" />
                    <div className="max-h-20 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar font-mono text-[10px]">
                      {lastCompletedOrder.products.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-slate-200">
                          <span className="truncate max-w-[170px]">{item.quantity}x {item.name}</span>
                          <span className="text-cyan-bright">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-b border-dashed border-white/10 my-2" />
                    <div className="flex justify-between items-center text-white font-black font-mono">
                      <span>Total Price</span>
                      <span className="text-cyan-bright">₹{lastCompletedOrder.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </motion.div>
                )}

                {/* Redirecting coordinates button */}
                <div className="mt-6 flex flex-col gap-2 w-full">
                  <motion.button
                    onClick={() => {
                      setCustomerTab('tracking')
                      setTruckStage('idle')
                      setLoadingItemIndex(-1)
                      setApiResult(null)
                      setIsProcessingCheckout(false)
                    }}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-xl bg-gradient-to-r from-electric to-cyan py-2.5 text-xs font-semibold text-white cursor-pointer shadow-lg tracking-wider"
                  >
                    Track Order Now 🚛
                  </motion.button>
                  <p className="text-[9px] text-slate-500 font-mono">
                    Auto-redirecting to live radar tracking in 3s...
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Absolute overlay for flying items */}
      <AnimatePresence>
        {flyingItems.map((item) => {
          // Calculate dynamic target cart coordinates
          const cartEl = document.getElementById('customer-cart-btn')
          const cartRect = cartEl?.getBoundingClientRect()
          const endX = cartRect ? cartRect.left + cartRect.width / 2 : window.innerWidth - 80
          const endY = cartRect ? cartRect.top + cartRect.height / 2 : 40

          // Calculate Bezier midpoint path (curved Bezier path)
          const midX = (item.startX + endX) / 2
          const midY = Math.min(item.startY, endY) - 180

          return (
            <div key={item.id}>
              {/* Sparkle trailing particles */}
              {Array.from({ length: 6 }).map((_, idx) => {
                const angle = (idx * 360 / 6) + (Math.random() * 20)
                const offsetDistance = 15 + Math.random() * 20
                return (
                  <motion.span
                    key={`sparkle-${item.id}-${idx}`}
                    initial={{
                      position: 'fixed',
                      left: 0,
                      top: 0,
                      x: item.startX - 6,
                      y: item.startY - 6,
                      scale: 0,
                      opacity: 0.9,
                      zIndex: 9998,
                      pointerEvents: 'none'
                    }}
                    animate={{
                      x: [
                        item.startX - 6,
                        midX + Math.cos(angle * Math.PI / 180) * offsetDistance,
                        endX
                      ],
                      y: [
                        item.startY - 6,
                        midY + Math.sin(angle * Math.PI / 180) * offsetDistance,
                        endY
                      ],
                      scale: [0, 1.2, 0],
                      opacity: [0.9, 0.7, 0]
                    }}
                    transition={{
                      duration: 0.65 + (idx * 0.05),
                      ease: 'easeOut',
                      delay: idx * 0.04
                    }}
                    className="absolute h-1.5 w-1.5 rounded-full pointer-events-none"
                    style={{
                      backgroundColor: ['#22d3ee', '#8b5cf6', '#a855f7', '#facc15', '#ffffff'][idx % 5],
                      boxShadow: '0 0 8px currentColor'
                    }}
                  />
                )
              })}

              {/* Main Flying Product Thumbnail */}
              <motion.div
                initial={{
                  position: 'fixed',
                  left: 0,
                  top: 0,
                  x: item.startX - 20,
                  y: item.startY - 20,
                  scale: 1,
                  rotate: 0,
                  opacity: 1,
                  filter: 'blur(0px)',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  zIndex: 9999,
                  pointerEvents: 'none'
                }}
                animate={{
                  x: [item.startX - 20, midX - 12, endX - 10],
                  y: [item.startY - 20, midY - 12, endY - 10],
                  scale: [1, 1.15, 0.5, 0.15],
                  rotate: [0, 15, -12],
                  opacity: [1, 0.95, 0.8, 0],
                  filter: ['blur(0px)', 'blur(1.2px)', 'blur(0px)'],
                  boxShadow: [
                    '0 4px 6px rgba(0,0,0,0.1)',
                    '0 15px 30px rgba(6,182,212,0.4), 0 0 15px rgba(6,182,212,0.25)',
                    '0 2px 4px rgba(0,0,0,0.1)'
                  ]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.78,
                  ease: [0.25, 0.1, 0.25, 1.35] // magnetic snap cubic bezier ease
                }}
                onAnimationComplete={() => handleFlightComplete(item)}
                className="h-10 w-10 bg-white/5 rounded-xl border border-white/10 shadow-2xl flex items-center justify-center text-2xl overflow-hidden glass"
              >
                {item.image && item.image.startsWith('http') ? (
                  <img src={item.image} alt="Flying Item" className="h-full w-full object-cover" />
                ) : (
                  item.image
                )}
              </motion.div>
            </div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
