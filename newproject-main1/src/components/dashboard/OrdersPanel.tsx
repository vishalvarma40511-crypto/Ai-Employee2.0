import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Printer,
  ShoppingBag,
  Laptop,
  Store,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Sale } from '../../services/db'
import { API_BASE } from '../../config'

export default function OrdersPanel() {
  const { dbState, addNotification, refreshDatabase } = useApp()

  // State parameters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'online' | 'offline'>('all')
  const [selectedOrder, setSelectedOrder] = useState<Sale | null>(null)

  // Memoized lists of sales with categorized source tags
  const ordersList = useMemo(() => {
    return dbState.sales.map((sale) => {
      const isOnline = !sale.id.startsWith('INV-') && !sale.id.startsWith('s-local-')
      let displayStatus = 'Completed'
      if (isOnline) {
        const rawStatus = sale.shippingStatus || 'placed'
        displayStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).replace(/_/g, ' ')
      }
      return {
        ...sale,
        channel: isOnline ? 'Online' : 'Offline (POS)',
        status: displayStatus
      }
    })
  }, [dbState.sales])

  // Stats summaries
  const stats = useMemo(() => {
    const online = ordersList.filter(o => o.channel === 'Online')
    const offline = ordersList.filter(o => o.channel === 'Offline (POS)')
    const totalRev = ordersList.reduce((sum, o) => sum + o.total, 0)
    
    return {
      total: ordersList.length,
      onlineCount: online.length,
      offlineCount: offline.length,
      revenue: totalRev
    }
  }, [ordersList])

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return ordersList.filter((o) => {
      const matchesChannel = 
        selectedChannel === 'all' ||
        (selectedChannel === 'online' && o.channel === 'Online') ||
        (selectedChannel === 'offline' && o.channel === 'Offline (POS)')

      const matchesSearch =
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesChannel && matchesSearch
    })
  }, [ordersList, selectedChannel, searchQuery])

  // Audio effect beep
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      gain.gain.setValueAtTime(0.05, ctx.currentTime)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch(e) {}
  }

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
          Order Manager Desk
        </h1>
        <p className="text-sm text-slate-400">
          Monitor unified transaction ledgers for online web checkouts and local physical POS walk-in purchases.
        </p>
      </div>

      {/* Grid Summaries */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Sales Invoices</p>
          <p className="text-2xl font-bold text-white font-mono mt-2">{stats.total}</p>
          <p className="text-[10px] text-slate-400 mt-1">Combined transaction volume</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Online Channel Orders</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold text-cyan-bright font-mono">{stats.onlineCount}</p>
            <span className="text-[10px] text-cyan-bright bg-cyan/10 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
              <Laptop className="h-3 w-3" /> Storefront
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">E-Commerce website checkouts</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Offline POS Invoices</p>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-2xl font-bold text-electric-bright font-mono">{stats.offlineCount}</p>
            <span className="text-[10px] text-electric-bright bg-electric/15 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
              <Store className="h-3 w-3" /> POS Counter
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Walk-in physical register cash sales</p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Accumulated Gross Revenue</p>
          <p className="text-2xl font-bold text-green-400 font-mono mt-2">₹{stats.revenue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">Gross sales turnover</p>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col">
        
        {/* Filters and search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center border-b border-white/5 pb-4 mb-4">
          <div className="flex items-center gap-2 flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="Search by customer, invoice ID, product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl glass border border-white/5 px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:border-electric"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2 text-slate-400 hover:text-white text-xs">✕</button>
            )}
          </div>

          {/* Source filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedChannel('all')}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                selectedChannel === 'all'
                  ? 'bg-electric border-electric text-white'
                  : 'glass text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              All Invoices
            </button>
            <button
              onClick={() => setSelectedChannel('online')}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                selectedChannel === 'online'
                  ? 'bg-cyan border-cyan text-white'
                  : 'glass text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              Online Web
            </button>
            <button
              onClick={() => setSelectedChannel('offline')}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                selectedChannel === 'offline'
                  ? 'bg-electric border-electric text-white'
                  : 'glass text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              Offline POS
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center text-slate-500 text-xs">
              <ShoppingBag className="h-8 w-8 text-slate-700 mb-2.5" />
              <p>No transactions match search guidelines.</p>
              <button onClick={() => { setSelectedChannel('all'); setSearchQuery(''); }} className="mt-2 text-electric-bright hover:underline cursor-pointer">Clear filters</button>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
                  <th className="pb-3">Invoice ID</th>
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3 text-right">Qty</th>
                  <th className="pb-3 text-right">Invoice Total</th>
                  <th className="pb-3">Sales Channel</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((o) => {
                  const isOnline = o.channel === 'Online'
                  
                  return (
                    <tr key={o.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="py-3 font-mono text-[10px] text-slate-400 font-semibold truncate max-w-[80px]">
                        {o.id.toUpperCase().replace('SALE-', 'INV-')}
                      </td>
                      <td className="py-3 text-slate-500 text-[10px]">
                        {new Date(o.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 font-bold text-white max-w-[100px] truncate">{o.customerName}</td>
                      <td className="py-3 text-slate-400 font-medium max-w-[130px] truncate" title={o.productName}>
                        {o.productName}
                      </td>
                      <td className="py-3 text-right font-mono font-semibold">{o.quantity}</td>
                      <td className="py-3 text-right font-mono font-black text-cyan-bright">
                        ₹{o.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold rounded-lg px-2 py-0.5 border ${
                          isOnline
                            ? 'bg-cyan/10 border-cyan/20 text-cyan-bright'
                            : 'bg-electric/15 border-electric/30 text-electric-bright'
                        }`}>
                          {isOnline ? <Laptop className="h-2.5 w-2.5" /> : <Store className="h-2.5 w-2.5" />}
                          {o.channel}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold rounded-lg px-2 py-0.5 ${
                          o.status === 'Completed'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-yellow-500/10 text-yellow-400 animate-pulse'
                        }`}>
                          {o.status === 'Completed' ? <CheckCircle2 className="h-2.5 w-2.5" /> : <AlertCircle className="h-2.5 w-2.5" />}
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => {
                            playBeep()
                            setSelectedOrder(o)
                          }}
                          className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-white/5 border border-white/0 hover:border-white/5 text-slate-500 hover:text-white cursor-pointer transition-all m-auto"
                          title="Generate Receipt Invoice"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Invoice modal */}
      <AnimatePresence>
        {selectedOrder && (
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
                  <p className="text-[8px] text-slate-600 mt-1">Invoice ID: {selectedOrder.id.toUpperCase().replace('SALE-', 'INV-')}</p>
                  <p className="text-[8px] text-slate-600">Date: {new Date(selectedOrder.timestamp).toLocaleString()}</p>
                </div>

                <div className="space-y-1 mb-3 text-slate-400">
                  <p>Customer: <strong className="text-white">{selectedOrder.customerName}</strong></p>
                  <p>Source Channel: <strong className="text-white">{selectedOrder.id.startsWith('sale-') ? 'E-Commerce storefront' : 'POS Cash Register (Offline)'}</strong></p>
                  <p>Transaction ID: <strong className="text-white">{selectedOrder.id}</strong></p>
                </div>

                {/* Items */}
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
                    {selectedOrder.products && selectedOrder.products.length > 0 ? (
                      selectedOrder.products.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-1.5 max-w-[100px] truncate">{item.productName}</td>
                          <td className="py-1.5 text-center">{item.quantity}</td>
                          <td className="py-1.5 text-right">₹{item.price.toFixed(0)}</td>
                          <td className="py-1.5 text-right font-bold text-white">₹{(item.price * item.quantity).toFixed(0)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-1.5 max-w-[100px] truncate">{selectedOrder.productName}</td>
                        <td className="py-1.5 text-center">{selectedOrder.quantity}</td>
                        <td className="py-1.5 text-right">₹{(selectedOrder.total / selectedOrder.quantity).toFixed(0)}</td>
                        <td className="py-1.5 text-right font-bold text-white">₹{selectedOrder.total.toFixed(0)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Totals */}
                <div className="space-y-1 text-slate-400 border-b border-white/10 pb-2 mb-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{(selectedOrder.total * 0.82).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST/SGST (18%):</span>
                    <span>₹{(selectedOrder.total * 0.18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="flex justify-between text-white font-bold text-sm">
                  <span>Grand Total:</span>
                  <span className="text-cyan-bright">₹{selectedOrder.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Real-time Shipping Status Manager */}
                {(!selectedOrder.id.startsWith('INV-') && !selectedOrder.id.startsWith('s-local-')) && (
                  <div className="mt-4 border-t border-white/10 pt-3 text-xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">Update Shipping Progress</span>
                    <div className="flex gap-2">
                      <select
                        value={selectedOrder.shippingStatus || 'placed'}
                        onChange={(e) => {
                          const newStatus = e.target.value as any
                          setSelectedOrder(prev => prev ? { ...prev, shippingStatus: newStatus } : null)
                        }}
                        className="flex-1 bg-black/45 rounded-xl border border-white/5 px-2 py-1.5 text-xs text-white focus:outline-none font-mono"
                      >
                        <option value="placed">🛒 Placed</option>
                        <option value="confirmed">👍 Confirmed</option>
                        <option value="packed">📦 Packed</option>
                        <option value="ready_for_dispatch">🛫 Ready for Dispatch</option>
                        <option value="shipped">🚚 Shipped (Blue Dart)</option>
                        <option value="reached_hub">🏢 Reached Local Hub</option>
                        <option value="out_for_delivery">🚲 Out for Delivery</option>
                        <option value="delivered">✅ Delivered successfully</option>
                      </select>
                      <button
                        onClick={() => {
                          const statusToSave = selectedOrder.shippingStatus || 'placed'
                          fetch(`${API_BASE}/orders/${selectedOrder._id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ shippingStatus: statusToSave })
                          })
                            .then(res => {
                              if (res.ok) {
                                addNotification('Status Updated', `Order status set to ${statusToSave.toUpperCase().replace(/_/g, ' ')}. SMS notification triggered!`, 'success')
                                if (refreshDatabase) refreshDatabase()
                              } else {
                                addNotification('Update Failed', 'Failed to save status on backend API.', 'error')
                              }
                            })
                            .catch(err => {
                              console.error(err)
                              addNotification('Connection Error', 'Backend server offline.', 'error')
                            })
                        }}
                        className="bg-cyan hover:bg-cyan/85 px-3 py-1.5 rounded-xl font-bold text-white transition-colors cursor-pointer"
                      >
                        Save Status
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-center mt-4 border-t border-white/10 pt-3 text-[9px] text-slate-500 leading-normal">
                  <p className="text-green-400 font-bold tracking-wider">ORDER SECURED</p>
                  <p className="mt-1">Backoffice backup sync completed.<br />Thank you for your business!</p>
                </div>
              </div>

              {/* Overlay Action footer buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                <button
                  onClick={() => {
                    playBeep()
                    window.print()
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 hover:bg-white/5 py-2.5 px-3 text-xs font-semibold text-slate-400 transition-colors cursor-pointer w-full"
                >
                  <Printer className="h-4 w-4" /> Print Invoice
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-xl bg-gradient-to-r from-electric to-cyan py-2.5 text-center text-xs font-bold text-white shadow-lg cursor-pointer px-6"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
