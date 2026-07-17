import React, { createContext, useContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import {
  loadDBState,
  saveDBState,
  addLog,
  getProductImage,
  DEFAULT_PRODUCTS,
} from '../services/db'
import type { AppDBState, Product } from '../services/db'
import { API_BASE, API_URL } from '../config'

export type ViewType = 'landing' | 'role_select' | 'auth' | 'dashboard'
export type TabType =
  | 'overview'
  | 'finance'
  | 'inventory'
  | 'sales'
  | 'billing'
  | 'orders'
  | 'marketing'
  | 'employees'
  | 'customers'
  | 'reports'
  | 'requests'
  | 'profile'
  | 'invoice'

export type UserRole = 'owner' | 'manager' | 'cashier' | 'admin'

export interface AppNotification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  timestamp: string
  read: boolean
}

interface AppContextProps {
  view: ViewType
  setView: (v: ViewType) => void
  activeTab: TabType
  setActiveTab: (t: TabType) => void
  role: UserRole
  setRole: (r: UserRole) => void
  isAuthenticated: boolean
  login: (role: UserRole) => Promise<boolean>
  logout: () => void
  portal: 'owner' | 'customer' | null
  setPortal: (p: 'owner' | 'customer' | null) => void
  customerName: string
  setCustomerName: (name: string) => void
  customerEmail: string
  setCustomerEmail: (email: string) => void
  customerPhone: string
  setCustomerPhone: (phone: string) => void
  customerAddress: string
  setCustomerAddress: (address: string) => void
  theme: 'dark' | 'light'
  toggleTheme: () => void
  dbState: AppDBState
  updateDbState: (updater: (prev: AppDBState) => AppDBState) => void
  notifications: AppNotification[]
  addNotification: (title: string, message: string, type: AppNotification['type']) => void
  dismissNotification: (id: string) => void
  clearAllNotifications: () => void
  triggerLog: (msg: string) => void
  web3FormsKey: string
  setWeb3FormsKey: (key: string) => void
  purchasedPlan: 'Starter' | 'Growth' | 'Enterprise' | null
  setPurchasedPlan: (plan: 'Starter' | 'Growth' | 'Enterprise' | null) => void
  isInventoryInitialized: boolean
  setInventoryInitialized: (initialized: boolean) => void
  smsList: { id: string; phone: string; body: string; timestamp: string }[]
  sendSMS: (phone: string, body: string) => void
  activeSMS: { phone: string; body: string } | null
  setActiveSMS: (sms: { phone: string; body: string } | null) => void
  refreshDatabase: () => Promise<void>
  customerCart: { product: Product; quantity: number }[]
  setCustomerCart: React.Dispatch<React.SetStateAction<{ product: Product; quantity: number }[]>>
}

const AppContext = createContext<AppContextProps | undefined>(undefined)

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [view, setViewState] = useState<ViewType>(() => {
    return (localStorage.getItem('businessos_view') as ViewType) || 'landing'
  })
  const [activeTab, setActiveTabState] = useState<TabType>(() => {
    return (localStorage.getItem('businessos_active_tab') as TabType) || 'overview'
  })
  const [role, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('businessos_role') as UserRole) || 'owner'
  })
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('businessos_is_authenticated') === 'true'
  })
  const [portal, setPortalState] = useState<'owner' | 'customer' | null>(() => {
    return (localStorage.getItem('businessos_portal') as 'owner' | 'customer' | null) || null
  })
  const [customerName, setCustomerName] = useState<string>('Guest Buyer')
  const [customerEmail, setCustomerEmail] = useState<string>('buyer@gmail.com')
  const [customerPhone, setCustomerPhone] = useState<string>('')
  const [customerAddress, setCustomerAddress] = useState<string>('')
  const [customerCart, setCustomerCart] = useState<{ product: Product; quantity: number }[]>([])
  const [web3FormsKey, setWeb3FormsKeyState] = useState<string>(() => {
    return localStorage.getItem('web3_forms_key') || ''
  })

  const setWeb3FormsKey = (key: string) => {
    localStorage.setItem('web3_forms_key', key)
    setWeb3FormsKeyState(key)
  }

  const [purchasedPlan, setPurchasedPlanState] = useState<'Starter' | 'Growth' | 'Enterprise' | null>(() => {
    return (localStorage.getItem('purchased_plan') as any) || null
  })

  const [isInventoryInitialized, setInventoryInitializedState] = useState<boolean>(() => {
    return localStorage.getItem('is_inventory_initialized') === 'true'
  })

  const setPurchasedPlan = (plan: 'Starter' | 'Growth' | 'Enterprise' | null) => {
    if (plan) {
      localStorage.setItem('purchased_plan', plan)
    } else {
      localStorage.removeItem('purchased_plan')
    }
    setPurchasedPlanState(plan)
  }

  const setInventoryInitialized = (initialized: boolean) => {
    localStorage.setItem('is_inventory_initialized', String(initialized))
    setInventoryInitializedState(initialized)
  }

  // Session state synchronization effects
  useEffect(() => {
    localStorage.setItem('businessos_view', view)
  }, [view])

  useEffect(() => {
    localStorage.setItem('businessos_active_tab', activeTab)
  }, [activeTab])

  useEffect(() => {
    localStorage.setItem('businessos_role', role)
  }, [role])

  useEffect(() => {
    localStorage.setItem('businessos_is_authenticated', String(isAuthenticated))
  }, [isAuthenticated])

  useEffect(() => {
    if (portal) {
      localStorage.setItem('businessos_portal', portal)
    } else {
      localStorage.removeItem('businessos_portal')
    }
  }, [portal])

  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [dbState, setDbState] = useState<AppDBState>(() => {
    const state = loadDBState()
    let migrated = false
    const defaultProductMap = new Map(DEFAULT_PRODUCTS.map(p => [p.id, p]))
    const migratedProducts = state.products.map(p => {
      // Always sync default products to their latest hardcoded accurate image
      const defaultProd = defaultProductMap.get(p.id)
      if (defaultProd && p.image !== defaultProd.image) {
        migrated = true
        return { ...p, image: defaultProd.image }
      }
      // For custom uploaded products: replace stale/bad URLs
      if (
        !p.image ||
        !p.image.startsWith('http') ||
        p.image.includes('unsplash.com/featured') ||
        p.image.includes('source.unsplash.com') ||
        p.image.includes('loremflickr.com')
      ) {
        migrated = true
        return { ...p, image: getProductImage(p.name, p.category) }
      }
      return p
    })
    if (migrated) {
      const updated = { ...state, products: migratedProducts }
      saveDBState(updated)
      return updated
    }
    return state
  })

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'businessos_db_state' && e.newValue) {
        try {
          setDbState(JSON.parse(e.newValue))
        } catch (err) {
          console.error('Storage state sync error:', err)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'n1',
      title: 'Low Stock Alert',
      message: 'Wireless Earbuds X1 is down to 3 units. Suggested reorder: 25 units.',
      type: 'warning',
      timestamp: '10 mins ago',
      read: false,
    },
    {
      id: 'n2',
      title: 'New Customer Request',
      message: 'Logan Roy requested: "10 boxes of Premium Swiss Chocolates".',
      type: 'info',
      timestamp: '25 mins ago',
      read: false,
    },
    {
      id: 'n3',
      title: 'Sales Milestone',
      message: 'Daily target of ₹2,50,000 revenue exceeded! Total sales at ₹2,68,400.',
      type: 'success',
      timestamp: '2 hours ago',
      read: false,
    },
  ])

  const [smsList, setSmsList] = useState<{ id: string; phone: string; body: string; timestamp: string }[]>([])
  const [activeSMS, setActiveSMS] = useState<{ phone: string; body: string } | null>(null)

  const sendSMS = (phone: string, body: string) => {
    const newSMS = {
      id: `sms-${Date.now()}`,
      phone,
      body,
      timestamp: new Date().toLocaleTimeString()
    }
    setSmsList(prev => [newSMS, ...prev])
    setActiveSMS({ phone, body })
    
    // Clean and format phone number to E.164 compliance for Textbelt
    let formattedPhone = phone.replace(/[^0-9+]/g, '')
    if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone
    }

    // Play double SMS notification beep/vibrate sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const playPulse = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start)
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime + start)
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.start(audioCtx.currentTime + start)
        osc.stop(audioCtx.currentTime + start + duration)
      }
      playPulse(587.33, 0, 0.12)
      playPulse(587.33, 0.16, 0.12)
    } catch(e) {}

    // Dispatch real SMS using free textbelt public endpoint (1 free SMS per day per IP)
    if (formattedPhone.startsWith('+')) {
      fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          number: formattedPhone,
          message: body,
          key: 'textbelt',
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            triggerLog(`[SMS Gateway] Real text successfully sent to ${formattedPhone}! Quota left: ${data.quotaRemaining}`)
          } else {
            triggerLog(`[SMS Gateway] Textbelt route notice: ${data.error || 'Daily public rate limit exceeded'}`)
          }
        })
        .catch(err => {
          triggerLog(`[SMS Gateway] Network connection error: ${err.message}`)
        })
    } else {
      triggerLog(`[SMS Gateway] Phone number ${phone} is not in a valid format for international SMS delivery.`)
    }
  }

  const refreshDatabase = async () => {
    try {
      const resProducts = await fetch(`${API_BASE}/products`)
      const rawProducts = await resProducts.json()
      
      const resOrders = await fetch(`${API_BASE}/orders`)
      const orders = await resOrders.json()
      
      if (Array.isArray(orders) && Array.isArray(rawProducts)) {
        const products = rawProducts.map((p: any) => ({
          ...p,
          id: p.id || p._id
        }))
        const sales = orders.map((o: any) => ({
          id: o.orderNumber,
          _id: o._id,
          timestamp: o.timestamp,
          productName: o.products[0]?.productName || 'Quantum Item',
          quantity: o.products[0]?.quantity || 1,
          total: o.total,
          customerName: o.customerName,
          phone: o.phone,
          shippingStatus: o.shippingStatus,
          rating: o.rating,
          review: o.review,
          products: o.products || []
        }))

        setDbState(prev => ({
          ...prev,
          products,
          sales
        }))
      }
    } catch (err) {
      console.log('Backend sync offline, using local storage state.', err)
    }
  }

  // Socket.IO Synchronizer listeners
  useEffect(() => {
    refreshDatabase()

    const socket = io(API_URL)

    socket.on('db_updated', () => {
      refreshDatabase()
    })

    socket.on('order_created', () => {
      refreshDatabase()
    })

    socket.on('order_status_updated', (updatedOrder: any) => {
      refreshDatabase()
      addNotification(
        'Order Status Changed',
        `Your order ${updatedOrder.orderNumber} status changed to ${updatedOrder.shippingStatus.toUpperCase().replace(/_/g, ' ')}.`,
        'info'
      )
    })

    socket.on('review_added', () => {
      refreshDatabase()
    })

    socket.on('sms_received', (sms: { phone: string; body: string }) => {
      setActiveSMS(sms)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Sync state changes with localStorage
  useEffect(() => {
    saveDBState(dbState)
  }, [dbState])

  // Update light/dark class on body (Force dark mode on landing & role select pages)
  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'light' && view === 'dashboard') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
  }, [theme, view])

  const setView = (v: ViewType) => {
    triggerLog(`[System] Screen transition to: ${v.toUpperCase()}`)
    setViewState(v)
  }

  const setActiveTab = (t: TabType) => {
    triggerLog(`[UI] Switched dashboard view to: ${t.toUpperCase()}`)
    setActiveTabState(t)
  }

  const setRole = (r: UserRole) => {
    triggerLog(`[Firebase Auth] Access permission levels set to: ${r.toUpperCase()}`)
    setRoleState(r)
  }

  const triggerLog = (msg: string) => {
    setDbState((prev) => addLog(prev, msg))
  }

  const setPortal = (p: 'owner' | 'customer' | null) => {
    triggerLog(`[System] Portal mode changed to: ${p ? p.toUpperCase() : 'NONE'}`)
    setPortalState(p)
  }

  const login = async (selectedRole: UserRole) => {
    triggerLog(`[Firebase Auth] Authenticating credentials for role: ${selectedRole.toUpperCase()}...`)
    await new Promise((res) => setTimeout(res, 800)) // loading transition
    setRole(selectedRole)
    setIsAuthenticated(true)
    setView('dashboard')
    triggerLog(`[Firestore] Fetching user records. Security Token verified. Access: GRANTED.`)
    return true
  }

  const logout = () => {
    triggerLog('[Firebase Auth] Revoking active session key...')
    setIsAuthenticated(false)
    setPortalState(null)
    setCustomerName('Guest Buyer')
    setView('landing')
    localStorage.removeItem('businessos_view')
    localStorage.removeItem('businessos_active_tab')
    localStorage.removeItem('businessos_role')
    localStorage.removeItem('businessos_is_authenticated')
    localStorage.removeItem('businessos_portal')
    triggerLog('[System] User logged out. Local cache sync: OK.')
  }

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
    triggerLog(`[UI] Theme changed to: ${theme === 'dark' ? 'LIGHT' : 'DARK'}`)
  }

  const updateDbState = (updater: (prev: AppDBState) => AppDBState) => {
    setDbState((prev) => {
      const next = updater(prev)
      saveDBState(next)
      
      // Auto-sync products to backend server
      fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next.products)
      })
      .then(r => r.json())
      .then(data => {
        console.log('[System Cache] Products persisted on backend server:', data);
      })
      .catch(err => {
        console.error('[System Cache ⚠️] Failed to sync products to backend:', err);
      });

      return next
    })
  }


  const addNotification = (title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: `n-${Date.now()}`,
      title,
      message,
      type,
      timestamp: 'Just now',
      read: false,
    }
    setNotifications((prev) => [newNotif, ...prev])
    triggerLog(`[Notification] ${title}: ${message}`)
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  return (
    <AppContext.Provider
      value={{
        view,
        setView,
        activeTab,
        setActiveTab,
        role,
        setRole,
        isAuthenticated,
        login,
        logout,
        portal,
        setPortal,
        customerName,
        setCustomerName,
        customerEmail,
        setCustomerEmail,
        customerPhone,
        setCustomerPhone,
        customerAddress,
        setCustomerAddress,
        theme,
        toggleTheme,
        dbState,
        updateDbState,
        notifications,
        addNotification,
        dismissNotification,
        clearAllNotifications,
        triggerLog,
        web3FormsKey,
        setWeb3FormsKey,
        purchasedPlan,
        setPurchasedPlan,
        isInventoryInitialized,
        setInventoryInitialized,
        smsList,
        sendSMS,
        activeSMS,
        setActiveSMS,
        refreshDatabase,
        customerCart,
        setCustomerCart,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppContextProvider')
  }
  return context
}
