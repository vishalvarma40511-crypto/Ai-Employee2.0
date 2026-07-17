import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Search,
  Camera,
  Trash2,
  Plus,
  Minus,
  Printer
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getProductImage } from '../../services/db'
import type { Product } from '../../services/db'
import { API_BASE } from '../../config'

export default function BillingPanel() {
  const {
    dbState,
    triggerLog,
    addNotification,
    refreshDatabase,
    customerCart,
    setCustomerCart,
    customerName,
    customerPhone,
    customerEmail,
  } = useApp()

  // State parameters
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [buyerName, setBuyerName] = useState('Walk-In Guest')
  const [buyerPhone, setBuyerPhone] = useState('+91 99999 88888')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash')
  const [showScanner, setShowScanner] = useState(false)
  const [scannerSku, setScannerSku] = useState(dbState.products[0]?.sku || '')
  
  // Receipts modal parameters
  const [invoice, setInvoice] = useState<{
    id: string
    timestamp: string
    buyerName: string
    items: { name: string; qty: number; price: number; total: number }[]
    subtotal: number
    tax: number
    total: number
    paymentMethod: string
  } | null>(null)

  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const categories = ['All', 'Electronics', 'Apparel', 'Groceries', 'Medical', 'Food']

  // Play audio beep sound using browser Web Audio API
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime) // A5 pitch beep
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start()
      osc.stop(ctx.currentTime + 0.12)
    } catch (e) {
      console.warn('AudioContext blocked or uninitialized:', e)
    }
  }

  // Add item to cart
  const addToCart = (product: Product, qty = 1) => {
    if (product.stock <= 0) {
      addNotification('Out of Stock', `${product.name} is currently out of stock.`, 'error')
      return
    }

    const existingIdx = cart.findIndex((item) => item.product.id === product.id)
    const currentQtyInCart = existingIdx > -1 ? cart[existingIdx].quantity : 0

    if (currentQtyInCart + qty > product.stock) {
      addNotification(
        'Insufficient Stock',
        `Only ${product.stock} units available of ${product.name}.`,
        'warning'
      )
      return
    }

    if (existingIdx > -1) {
      const updatedCart = [...cart]
      updatedCart[existingIdx].quantity += qty
      setCart(updatedCart)
    } else {
      setCart([...cart, { product, quantity: qty }])
    }
    
    addNotification('Added to Cart', `${product.image} ${product.name} added to cart.`, 'success')
  }

  // Update quantity in cart
  const updateCartQty = (productId: string, delta: number) => {
    const idx = cart.findIndex((item) => item.product.id === productId)
    if (idx === -1) return

    const item = cart[idx]
    const nextQty = item.quantity + delta

    if (nextQty <= 0) {
      removeFromCart(productId)
      return
    }

    if (nextQty > item.product.stock) {
      addNotification(
        'Insufficient Stock',
        `Only ${item.product.stock} units available of ${item.product.name}.`,
        'warning'
      )
      return
    }

    const updatedCart = [...cart]
    updatedCart[idx].quantity = nextQty
    setCart(updatedCart)
  }

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  // Simulated scan triggers
  const handleSimulateScan = () => {
    const product = dbState.products.find((p) => p.sku === scannerSku)
    if (!product) {
      addNotification('Invalid SKU', 'Scanned barcode code does not match catalog products.', 'error')
      return
    }
    
    playBeep()
    addToCart(product, 1)
  }

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }, [cart])

  const gstTax = useMemo(() => {
    return subtotal * 0.18 // flat 18% GST estimate
  }, [subtotal])

  const grandTotal = useMemo(() => {
    return subtotal + gstTax
  }, [subtotal, gstTax])

  // Complete offline POS order checkout
  const handlePOSCheckout = () => {
    if (cart.length === 0) {
      addNotification('Empty Cart', 'Add products to cart to complete checkout.', 'error')
      return
    }

    // Double check inventory bounds
    for (const item of cart) {
      if (item.product.stock < item.quantity) {
        addNotification(
          'Out of Stock',
          `Selected stock limits exceeded for ${item.product.name}.`,
          'error'
        )
        return
      }
    }

    // Build local invoice immediately — no waiting for server
    const localOrderNum = `POS-${Date.now().toString(36).toUpperCase()}`
    const localTimestamp = new Date().toISOString()
    const localInvoice = {
      id: localOrderNum,
      timestamp: localTimestamp,
      buyerName: buyerName.trim() || 'Walk-In Guest',
      items: cart.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        price: item.product.price,
        total: item.product.price * item.quantity,
      })),
      subtotal,
      tax: gstTax,
      total: grandTotal,
      paymentMethod: paymentMethod === 'cash' ? 'Cash Register' : paymentMethod === 'card' ? 'Debit/Credit Terminal' : 'UPI QR Digital Code',
    }

    // Dispatch POS checkout request to Node.js backend API
    const checkoutPayload = {
      customerName: buyerName.trim() || 'Walk-In Guest',
      phone: buyerPhone,
      email: buyerEmail || '',
      products: cart.map((item) => ({
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal,
      tax: gstTax,
      total: grandTotal,
      paymentMethod: localInvoice.paymentMethod,
    }

    // Show invoice immediately so cashier isn't blocked
    setInvoice(localInvoice)

    // Reset cashier cart
    setCart([])
    setBuyerName('Walk-In Guest')
    setBuyerPhone('+91 99999 88888')
    setBuyerEmail('')
    setPaymentMethod('cash')

    if (refreshDatabase) refreshDatabase()

    // Try sending to backend for email dispatch (non-blocking)
    const emailTarget = buyerEmail?.trim()
    fetch(`${API_BASE}/billing/pos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutPayload)
    })
      .then(res => res.json())
      .then((data) => {
        // Update invoice ID to match server's order number
        setInvoice(prev => prev ? { ...prev, id: data.orderNumber || prev.id } : prev)
        if (emailTarget) {
          addNotification(
            '📧 Invoice Email Sent!',
            `Bill emailed to ${emailTarget} · Order: ${data.orderNumber || localOrderNum}`,
            'success'
          )
        } else {
          addNotification(
            '✅ Sale Recorded',
            `Order ${data.orderNumber || localOrderNum} saved. Add customer email next time to auto-email the bill.`,
            'success'
          )
        }
        triggerLog(`[POS] Order ${data.orderNumber || localOrderNum} recorded. Email: ${emailTarget || 'none provided'}.`)
      })
      .catch(() => {
        // Backend offline — invoice already shown locally, just notify
        if (emailTarget) {
          addNotification(
            '⚠️ Server Offline – Email Skipped',
            `Invoice ${localOrderNum} generated locally. Email to ${emailTarget} could not be sent — start the backend server to enable auto-email.`,
            'warning'
          )
        } else {
          addNotification(
            '✅ Invoice Generated Locally',
            `Order ${localOrderNum} complete. Enter customer email next time to auto-send the bill.`,
            'success'
          )
        }
        triggerLog(`[POS] Offline mode. Invoice ${localOrderNum} generated locally. Backend unreachable.`)
      })
  }

  // Filter products by category and search queries
  const filteredProducts = dbState.products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
            Offline Billing Counter (POS)
          </h1>
          <p className="text-sm text-slate-400">
            Log walk-in sales, simulate barcode scans, and update local inventory in 1-click.
          </p>
        </div>
        <button
          onClick={() => {
            setShowScanner(!showScanner)
            if (!showScanner) setScannerSku(dbState.products[0]?.sku || '')
          }}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
            showScanner
              ? 'bg-red-500/10 border-red-500/30 text-red-400 font-bold'
              : 'bg-electric/15 border-electric/30 text-electric-bright hover:bg-electric/25'
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>{showScanner ? 'Close Laser Scanner' : 'Open Laser Scanner'}</span>
        </button>
      </div>

      <div className="grid gap-6 grid-cols-12 items-stretch">
        {/* LEFT COLUMN: Catalog and Laser scan view */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 lg:max-h-[calc(100vh-210px)] lg:overflow-hidden">
          
          {/* Laser Scanner Simulation Panel */}
          <AnimatePresence>
            {showScanner && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card rounded-2xl p-5 border border-red-500/20 relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row gap-5 items-center">
                  
                  {/* Camera simulated screen */}
                  <div className="relative h-32 w-52 rounded-xl bg-black border border-white/10 flex flex-col items-center justify-center overflow-hidden shrink-0">
                    <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none z-10">
                      <div className="flex justify-between">
                        <span className="w-2.5 h-2.5 border-t-2 border-l-2 border-red-500" />
                        <span className="w-2.5 h-2.5 border-t-2 border-r-2 border-red-500" />
                      </div>
                      <div className="flex justify-between">
                        <span className="w-2.5 h-2.5 border-b-2 border-l-2 border-red-500" />
                        <span className="w-2.5 h-2.5 border-b-2 border-r-2 border-red-500" />
                      </div>
                    </div>

                    {/* Glowing Red laser beam animation */}
                    <div className="absolute left-0 w-full h-[2.5px] bg-red-500 shadow shadow-red-500/80 top-1/2 -translate-y-1/2 animate-bounce" />
                    
                    <Camera className="h-8 w-8 text-slate-700 animate-pulse" />
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mt-2 animate-pulse">
                      Simulated Camera Active
                    </span>
                  </div>

                  {/* Manual scan simulator controls */}
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Simulated Laser Scanner</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Hold a product code in front of the camera frame to simulate walk-in checkouts.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">Product SKU to Scan</label>
                        <select
                          value={scannerSku}
                          onChange={(e) => setScannerSku(e.target.value)}
                          className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-red-500 mt-1"
                        >
                          {dbState.products.map((p) => (
                            <option key={p.id} value={p.sku}>
                              {p.image} {p.name} · ({p.sku})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={handleSimulateScan}
                        className="rounded-xl bg-red-500 hover:bg-red-600 px-6 py-2 text-xs font-bold text-white transition-all cursor-pointer shrink-0"
                      >
                        ⚡ Simulate Laser Scan (Beep!)
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Catalog Grid Container */}
          <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col flex-1 overflow-hidden">
            
            {/* Search & Category Filter */}
            <div className="flex flex-col md:flex-row gap-3 justify-between md:items-center border-b border-white/5 pb-4 mb-4 shrink-0">
              <div className="flex gap-2 items-center flex-1 max-w-sm relative">
                <input
                  type="text"
                  placeholder="Search item barcode, category, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl glass border border-white/5 px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:border-electric"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs">✕</button>
                )}
              </div>

              {/* Category Chips */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[9px] font-bold rounded-lg px-2.5 py-1.5 transition-colors shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-electric text-white'
                          : 'glass text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Grid display */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 text-xs">
                  <p>No matches found in your inventory shelves.</p>
                  <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="mt-2 text-electric-bright hover:underline cursor-pointer">Clear filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((p) => {
                    const inCartCount = cart.find((item) => item.product.id === p.id)?.quantity || 0
                    const remainingStock = p.stock - inCartCount
                    
                    return (
                      <div
                        key={p.id}
                        onClick={() => remainingStock > 0 && addToCart(p, 1)}
                        className={`glass-card rounded-2xl p-3 flex flex-col justify-between border border-white/5 transition-all relative group cursor-pointer ${
                          remainingStock > 0 
                            ? 'hover:border-electric/30 hover:bg-white/[0.02]' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {/* Top: Image container */}
                        <div className="relative h-28 w-full bg-white/5 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                          {p.image && p.image.startsWith('http') ? (
                            <img 
                              src={p.image.includes('unsplash.com/featured') || p.image.includes('source.unsplash.com') ? getProductImage(p.name, p.category) : p.image} 
                              alt={p.name} 
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                          ) : (
                            <span className="text-3xl select-none">{p.image}</span>
                          )}

                          {/* Absolute Stock Indicator Badge over image */}
                          <div className="absolute top-2 right-2">
                            {p.stock > 0 ? (
                              <span className={`rounded-lg px-2 py-0.5 text-[8px] font-bold border ${
                                remainingStock === 0 
                                  ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                  : remainingStock < p.minStock 
                                  ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' 
                                  : 'bg-green-500/10 border-green-500/20 text-green-400'
                              }`}>
                                {remainingStock === 0 ? 'Limit' : `Qty: ${remainingStock}`}
                              </span>
                            ) : (
                              <span className="rounded-lg bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[8px] text-red-400 font-bold">
                                Out
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Middle: Details */}
                        <div className="mt-2.5 space-y-0.5">
                          <h4 className="text-xs font-bold text-white truncate max-w-full" title={p.name}>
                            {p.name}
                          </h4>
                          <p className="text-[8px] text-slate-500 font-mono">SKU: {p.sku}</p>
                        </div>

                        {/* Bottom: Price and Add button */}
                        <div className="flex items-center justify-between gap-2 mt-3.5 pt-2 border-t border-white/5">
                          <span className="text-xs font-black text-cyan-bright">₹{p.price.toLocaleString('en-IN')}</span>
                          {remainingStock > 0 && (
                            <span className="text-[9px] font-extrabold text-electric-bright bg-electric/15 px-2.5 py-1 rounded-lg border border-electric/35 group-hover:bg-electric/25 transition-all">
                              + Add
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: POS Checkout Order Cart */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6 lg:max-h-[calc(100vh-210px)] lg:overflow-hidden">
          <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col h-full overflow-hidden">
            
            {/* Cart Header */}
            <div className="border-b border-white/5 pb-3 mb-4 flex justify-between items-center shrink-0">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingCart className="h-4.5 w-4.5 text-electric-bright animate-pulse" /> Active Order Cart
              </h3>
              <span className="rounded-full bg-electric/15 border border-electric/30 px-2.5 py-0.5 text-[9px] font-bold text-electric-bright">
                {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
              </span>
            </div>

            {customerCart && customerCart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-cyan/15 border border-cyan/30 rounded-xl p-3 flex items-center justify-between text-xs shrink-0"
              >
                <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                  <span className="font-bold text-white block truncate">Customer Cart Sync</span>
                  <span className="text-[10px] text-slate-400 block truncate">
                    Active buyer <strong>{buyerName !== 'Walk-In Guest' ? buyerName : customerName || 'Store Guest'}</strong> has {customerCart.reduce((sum, item) => sum + item.quantity, 0)} items online.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newCart = [...cart]
                    customerCart.forEach((cItem) => {
                      const existing = newCart.find((item) => item.product.id === cItem.product.id)
                      if (existing) {
                        existing.quantity = Math.min(cItem.product.stock, existing.quantity + cItem.quantity)
                      } else {
                        newCart.push({ ...cItem })
                      }
                    })
                    setCart(newCart)
                    
                    if (customerName) setBuyerName(customerName)
                    if (customerPhone) setBuyerPhone(customerPhone)
                    if (customerEmail) setBuyerEmail(customerEmail)
                    
                    setCustomerCart([])
                    
                    addNotification(
                      'Cart Synced',
                      `Loaded online shopping cart of ${customerName || 'customer'} successfully.`,
                      'success'
                    )
                  }}
                  className="bg-cyan-bright hover:bg-cyan hover:scale-[1.02] text-black font-extrabold text-[10px] rounded-lg px-2.5 py-1.5 cursor-pointer shrink-0 transition-all shadow-md shadow-cyan-bright/20"
                >
                  Import Cart
                </button>
              </motion.div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 text-xs">
                  <p>Cart is currently empty.</p>
                  <p className="text-[10px] text-slate-600 mt-1">Select items on the catalog grid or simulate scans above.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="glass-strong p-4.5 rounded-2xl border border-white/10 flex items-center justify-between transition-all hover:border-white/20">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <span className="text-3xl bg-white/5 h-14 w-14 flex items-center justify-center rounded-xl overflow-hidden shrink-0 border border-white/5">
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
                      <div className="flex items-center bg-black/45 rounded-xl border border-white/5 p-1.5">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, -1)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-2.5 text-sm font-extrabold text-white font-mono">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, 1)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.product.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove product"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Billing Coordinates & Options */}
            <div className="border-t border-white/5 pt-4 mt-4 space-y-3.5 shrink-0">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Walk-In Guest"
                    className="w-full rounded-xl glass border border-white/5 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-electric"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Phone (SMS Alert)</label>
                  <input
                    type="text"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="+91 99999 88888"
                    className="w-full rounded-xl glass border border-white/5 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-electric font-mono"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-cyan-bright uppercase tracking-wider block mb-1">📧 Email — Auto-sends Invoice Bill</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="customer@gmail.com (bill sent here)"
                    className="w-full rounded-xl glass border border-cyan/20 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan/50 placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Payment Type</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full bg-base rounded-xl glass py-1.5 px-3 text-xs text-white focus:outline-none focus:border-electric"
                  >
                    <option value="cash">💵 Cash Checkout</option>
                    <option value="card">💳 Card Terminal</option>
                    <option value="upi">📱 UPI QR scan</option>
                  </select>
                </div>
              </div>

              {/* Price calculations details */}
              <div className="space-y-1.5 rounded-xl bg-white/[0.01] border border-white/5 p-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Amount:</span>
                  <span className="font-semibold text-white font-mono">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>SGST/CGST Taxes (18%):</span>
                  <span className="font-semibold text-white font-mono">₹{gstTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2 mt-2 font-bold text-white text-sm">
                  <span className="text-cyan-bright">Invoice Total:</span>
                  <span className="text-cyan-bright font-mono">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCart([])}
                  disabled={cart.length === 0}
                  className="rounded-xl border border-white/5 hover:bg-white/5 py-2.5 px-3 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={cart.length === 0}
                  className="flex-1 rounded-xl bg-gradient-to-r from-electric to-neon py-2.5 text-center text-xs font-bold text-white shadow-lg shadow-electric/25 hover:scale-[1.01] transition-transform disabled:opacity-40 disabled:hover:scale-100 cursor-pointer text-center"
                >
                  Record Sale & Print Invoice
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Invoice receipt popup overlay */}
      <AnimatePresence>
        {invoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-strong max-w-sm w-full rounded-3xl p-5 text-left shadow-2xl glow-cyan text-slate-200 border border-white/10 relative"
            >
              {/* Receipt template container */}
              <div className="border-2 border-dashed border-white/5 bg-black/40 rounded-2xl p-4 text-xs font-mono">
                <div className="text-center border-b border-white/10 pb-3 mb-3">
                  <h3 className="font-display font-black text-sm text-white tracking-widest uppercase">QUANTUM STORES</h3>
                  <p className="text-[9px] text-slate-500 mt-0.5">DLF CyberCity, Gurgaon, India</p>
                  <p className="text-[8px] text-slate-600 mt-1">Invoice ID: {invoice.id}</p>
                  <p className="text-[8px] text-slate-600">Date: {new Date(invoice.timestamp).toLocaleString()}</p>
                </div>

                <div className="space-y-1 mb-3 text-slate-400">
                  <p>Customer: <strong className="text-white">{invoice.buyerName}</strong></p>
                  <p>Cashier ID: <strong className="text-white">Admin-OS1</strong></p>
                  <p>Type: <strong className="text-white">{invoice.paymentMethod}</strong></p>
                </div>

                {/* Items grid */}
                <table className="w-full text-left text-[10px] text-slate-300 border-b border-white/10 pb-2 mb-2">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 text-[8px] uppercase">
                      <th className="pb-1">Description</th>
                      <th className="pb-1 text-center">Qty</th>
                      <th className="pb-1 text-right">Price</th>
                      <th className="pb-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1.5 max-w-[100px] truncate">{item.name}</td>
                        <td className="py-1.5 text-center">{item.qty}</td>
                        <td className="py-1.5 text-right">₹{item.price.toFixed(0)}</td>
                        <td className="py-1.5 text-right font-bold text-white">₹{item.total.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totals summaries */}
                <div className="space-y-1 text-slate-400 border-b border-white/10 pb-2 mb-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{invoice.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST/SGST (18%):</span>
                    <span>₹{invoice.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="flex justify-between text-white font-bold text-sm">
                  <span>Grand Total:</span>
                  <span className="text-cyan-bright">₹{invoice.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="text-center mt-4 border-t border-white/10 pt-3 text-[9px] text-slate-500 leading-normal">
                  <p className="text-green-400 font-bold tracking-wider">ORDER COMPLETED</p>
                  <p className="mt-1">Automated cargo drone dispatched.<br />Thank you for shopping with us!</p>
                </div>
              </div>

              {/* Overlay Action footer buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                <button
                  onClick={() => {
                    playBeep()
                    window.print()
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 hover:bg-white/5 py-2.5 px-3 text-xs font-semibold text-slate-400 transition-colors cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Print
                </button>
                <button
                  onClick={() => setInvoice(null)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-electric to-cyan py-2.5 text-center text-xs font-bold text-white shadow-lg cursor-pointer"
                >
                  Create New Bill
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirm Checkout Review Modal Overlay */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-strong max-w-md w-full rounded-3xl p-6 text-left shadow-2xl glow-cyan text-slate-200 border border-white/10 relative"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-3.5 mb-4 shrink-0">
                <h3 className="font-display text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  📋 Review POS Cart & Confirm Sale
                </h3>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="text-slate-400 hover:text-white text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 custom-scrollbar">
                
                {/* Customer Details Summary */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Customer Information</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold uppercase">Name</span>
                      <span className="font-semibold text-white">{buyerName.trim() || 'Walk-In Guest'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold uppercase">Phone</span>
                      <span className="font-semibold text-white font-mono">{buyerPhone || 'N/A'}</span>
                    </div>
                    {buyerEmail && (
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">Email</span>
                        <span className="font-semibold text-white">{buyerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Products Review List */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Products Added to Cart</span>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {cart.map((item, idx) => (
                      <div key={item.product.id || idx} className="glass p-3 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-xl bg-white/5 h-10 w-10 flex items-center justify-center rounded-lg overflow-hidden shrink-0 border border-white/5">
                            {item.product.image && item.product.image.startsWith('http') ? (
                              <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                            ) : (
                              item.product.image
                            )}
                          </span>
                          <div className="text-left min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate" title={item.product.name}>
                              {item.product.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">₹{item.product.price.toLocaleString('en-IN')} each</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-white font-mono">Qty: {item.quantity}</p>
                          <p className="text-[10px] text-cyan-bright font-bold font-mono">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Final Calculation Summary */}
                <div className="space-y-1.5 rounded-2xl bg-white/[0.01] border border-white/5 p-4 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-white font-mono">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>CGST/SGST Taxes (18%):</span>
                    <span className="font-semibold text-white font-mono">₹{gstTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payment Method:</span>
                    <span className="font-semibold text-white uppercase tracking-wider text-[10px]">
                      {paymentMethod === 'cash' ? '💵 Cash' : paymentMethod === 'card' ? '💳 Card' : '📱 UPI / QR'}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-2.5 mt-2.5 font-bold text-white text-sm">
                    <span className="text-cyan-bright">Invoice Grand Total:</span>
                    <span className="text-cyan-bright font-mono">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

              </div>

              {/* Action Confirmation Buttons */}
              <div className="flex gap-3 mt-6 pt-3.5 border-t border-white/5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 rounded-xl border border-white/5 hover:bg-white/5 py-2.5 text-xs font-semibold text-slate-400 transition-colors cursor-pointer text-center"
                >
                  Cancel & Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false)
                    handlePOSCheckout()
                  }}
                  className="flex-1 rounded-xl bg-gradient-to-r from-electric to-cyan py-2.5 text-xs font-bold text-white shadow-lg shadow-electric/25 hover:scale-[1.01] transition-transform cursor-pointer text-center"
                >
                  Confirm & Print Bill
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
