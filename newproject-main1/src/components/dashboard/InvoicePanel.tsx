import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Download, Mail, Printer, Trash2, RefreshCw,
  Search, Eye, CheckCircle, XCircle, Clock,
  ChevronDown, X,
  Calendar, Phone, User, IndianRupee,
  Loader2, Settings, Shield, Zap,
  Send, ShoppingBag
} from 'lucide-react'
import toast from 'react-hot-toast'
import { API_BASE } from '../../config'

interface InvoiceProduct {
  productName: string
  quantity: number
  price: number
}

interface Invoice {
  _id: string
  invoiceNumber: string
  customerName: string
  email: string
  phone?: string
  orderId: string
  products: InvoiceProduct[]
  subtotal: number
  gst: number
  discount: number
  total: number
  paymentMethod: string
  paymentStatus: 'Paid' | 'Unpaid' | 'Pending'
  emailStatus: 'Success' | 'Failed' | 'Pending'
  pdfPath?: string
  createdAt: string
  updatedAt: string
}

const DATE_FILTERS = [
  { label: 'All Time', value: '' },
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
]

const statusBadge = (status: string) => {
  if (status === 'Success' || status === 'Paid') {
    return 'bg-green-500/10 text-green-400 border-green-500/20'
  }
  if (status === 'Failed' || status === 'Unpaid') {
    return 'bg-red-500/10 text-red-400 border-red-500/20'
  }
  return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
}

const statusIcon = (status: string) => {
  if (status === 'Success' || status === 'Paid') return <CheckCircle className="h-3 w-3" />
  if (status === 'Failed' || status === 'Unpaid') return <XCircle className="h-3 w-3" />
  return <Clock className="h-3 w-3" />
}

// Invoice detail modal
function InvoiceModal({ invoice, onClose, onResend, onDownload, onPrint, resending }: {
  invoice: Invoice
  onClose: () => void
  onResend: (id: string) => void
  onDownload: (id: string, num: string) => void
  onPrint: (invoice: Invoice) => void
  resending: string | null
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d1117] z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center">
              <FileText className="h-4 w-4 text-cyan-bright" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Invoice Detail</p>
              <h3 className="text-sm font-bold text-white font-mono">{invoice.invoiceNumber}</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status Row */}
          <div className="flex flex-wrap gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusBadge(invoice.paymentStatus)}`}>
              {statusIcon(invoice.paymentStatus)} Payment: {invoice.paymentStatus}
            </span>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusBadge(invoice.emailStatus)}`}>
              {statusIcon(invoice.emailStatus)} Email: {invoice.emailStatus}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10 text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3 w-3" /> {new Date(invoice.createdAt).toLocaleString()}
            </span>
          </div>

          {/* Customer Info */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Customer Details</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3.5 w-3.5 text-cyan-bright shrink-0" />
                <span className="text-white">{invoice.customerName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="h-3.5 w-3.5 text-cyan-bright shrink-0" />
                <span className="text-slate-300 truncate">{invoice.email}</span>
              </div>
              {invoice.phone && (
                <div className="flex items-center gap-2 text-xs">
                  <Phone className="h-3.5 w-3.5 text-cyan-bright shrink-0" />
                  <span className="text-slate-300">{invoice.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs">
                <ShoppingBag className="h-3.5 w-3.5 text-cyan-bright shrink-0" />
                <span className="text-slate-400">Order: {invoice.orderId?.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-white/5">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Order Items</p>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-3 text-left text-slate-500 font-semibold">Product</th>
                  <th className="p-3 text-center text-slate-500 font-semibold">Qty</th>
                  <th className="p-3 text-right text-slate-500 font-semibold">Rate</th>
                  <th className="p-3 text-right text-slate-500 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.products.map((item, idx) => (
                  <tr key={idx} className="border-b border-white/5 last:border-0">
                    <td className="p-3 text-white">{item.productName}</td>
                    <td className="p-3 text-center text-slate-400">{item.quantity}</td>
                    <td className="p-3 text-right text-slate-400">₹{item.price.toFixed(2)}</td>
                    <td className="p-3 text-right text-cyan-bright font-bold">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Discount</span>
              <span className="text-red-400">-₹{(invoice.discount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>GST (18%)</span>
              <span>₹{(invoice.gst || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm border-t border-white/5 pt-2 mt-2">
              <span className="text-white">Grand Total</span>
              <span className="text-cyan-bright font-mono">₹{invoice.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Payment Method</span>
              <span className="text-slate-300">{invoice.paymentMethod}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onDownload(invoice._id, invoice.invoiceNumber)}
              className="flex-1 flex items-center justify-center gap-2 bg-cyan/10 border border-cyan/20 text-cyan-bright text-xs font-semibold rounded-xl py-2.5 cursor-pointer hover:bg-cyan/20 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onResend(invoice._id)}
              disabled={resending === invoice._id}
              className="flex-1 flex items-center justify-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold rounded-xl py-2.5 cursor-pointer hover:bg-violet-500/20 transition-colors disabled:opacity-50"
            >
              {resending === invoice._id
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Sending...</>
                : <><Send className="h-3.5 w-3.5" /> Resend Email</>
              }
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onPrint(invoice)}
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-300 text-xs font-semibold rounded-xl px-4 py-2.5 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Create Manual Invoice Modal
function CreateInvoiceModal({ onClose, onCreated }: {
  onClose: () => void
  onCreated: () => void
}) {
  const [customerName, setCustomerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [discount, setDiscount] = useState(0)
  const [gstRate, setGstRate] = useState(18)
  const [products, setProducts] = useState([{ productName: '', quantity: 1, price: 0 }])
  const [loading, setLoading] = useState(false)

  const addProduct = () => setProducts(p => [...p, { productName: '', quantity: 1, price: 0 }])
  const removeProduct = (idx: number) => setProducts(p => p.filter((_, i) => i !== idx))
  const updateProduct = (idx: number, field: string, value: string | number) =>
    setProducts(p => p.map((prod, i) => i === idx ? { ...prod, [field]: value } : prod))

  const subtotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  const gstAmount = subtotal * (gstRate / 100)
  const total = subtotal + gstAmount - discount

  const handleSubmit = async () => {
    if (!customerName.trim() || !email.trim()) {
      toast.error('Customer name and email are required')
      return
    }
    if (!products.some(p => p.productName.trim())) {
      toast.error('Add at least one product')
      return
    }
    setLoading(true)
    try {
      const payload = {
        customerName,
        email,
        phone,
        products: products.filter(p => p.productName.trim()),
        total,
        paymentMethod,
        discount,
        gst: gstAmount,
        shippingStatus: 'delivered',
        source: 'manual_invoice'
      }
      const res = await fetch(`${API_BASE}/billing/pos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Failed to create invoice')
      toast.success('Invoice created & email sent!')
      onCreated()
      onClose()
    } catch {
      toast.error('Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-white/5 sticky top-0 bg-[#0d1117] z-10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <FileText className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">New Invoice</p>
              <h3 className="text-sm font-bold text-white">Create Manual Invoice</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Customer Name *</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50 transition-colors"
                placeholder="John Smith"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Email *</label>
              <input
                type="email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50 transition-colors"
                placeholder="john@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Phone</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50 transition-colors"
                placeholder="+91 99999 00000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Products</label>
              <button onClick={addProduct} className="text-[10px] text-cyan-bright cursor-pointer hover:underline">+ Add Row</button>
            </div>
            <div className="space-y-2">
              {products.map((prod, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className="col-span-5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
                    placeholder="Product name"
                    value={prod.productName}
                    onChange={e => updateProduct(idx, 'productName', e.target.value)}
                  />
                  <input
                    type="number"
                    className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
                    placeholder="Qty"
                    value={prod.quantity}
                    onChange={e => updateProduct(idx, 'quantity', parseInt(e.target.value) || 1)}
                    min={1}
                  />
                  <input
                    type="number"
                    className="col-span-4 bg-white/5 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
                    placeholder="Price ₹"
                    value={prod.price || ''}
                    onChange={e => updateProduct(idx, 'price', parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                  {products.length > 1 && (
                    <button onClick={() => removeProduct(idx)} className="col-span-1 text-red-500 hover:text-red-400 cursor-pointer flex items-center justify-center">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Financial Settings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Discount ₹</label>
              <input
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
                placeholder="0"
                value={discount || ''}
                onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">GST %</label>
              <input
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
                value={gstRate}
                onChange={e => setGstRate(parseFloat(e.target.value) || 0)}
                min={0}
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Payment Mode</label>
              <select
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan/50 cursor-pointer"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Credit">Credit</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Discount</span><span className="text-red-400">-₹{discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST ({gstRate}%)</span><span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold border-t border-white/5 pt-2 mt-1 text-sm">
              <span className="text-white">Grand Total</span>
              <span className="text-cyan-bright font-mono">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-sm rounded-xl py-3 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating Invoice...</>
              : <><FileText className="h-4 w-4" /> Generate Invoice & Send Email</>
            }
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Email Settings Panel Component ─────────────────────────────────────────
function EmailSettingsPanel() {
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerEmailPass, setOwnerEmailPass] = useState('')
  const [storeName, setStoreName] = useState('')
  const [storePhone, setStorePhone] = useState('')
  const [storeAddress, setStoreAddress] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [emailConfigured, setEmailConfigured] = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/settings/email`)
      .then(r => r.json())
      .then(data => {
        setOwnerEmail(data.ownerEmail || '')
        setStoreName(data.storeName || '')
        setStorePhone(data.storePhone || '')
        setStoreAddress(data.storeAddress || '')
        setWebsiteUrl(data.websiteUrl || '')
        setEmailConfigured(data.emailConfigured || false)
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    if (!ownerEmail.trim()) { toast.error('Please enter your Gmail address'); return }
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/settings/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerEmail, ownerEmailPass, storeName, storePhone, storeAddress, websiteUrl })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Email settings saved! Invoices will now be sent from ' + ownerEmail)
      setEmailConfigured(!!(ownerEmail && ownerEmailPass))
      setOwnerEmailPass('') // Clear password field after save
    } catch (e: any) {
      toast.error(e.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    try {
      const res = await fetch(`${API_BASE}/settings/email/test`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(data.message)
    } catch (e: any) {
      toast.error(e.message || 'Test email failed')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Status Banner */}
      <div className={`rounded-2xl p-4 border flex items-center gap-3 ${
        emailConfigured
          ? 'bg-green-500/5 border-green-500/20'
          : 'bg-yellow-500/5 border-yellow-500/20'
      }`}>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          emailConfigured ? 'bg-green-500/10' : 'bg-yellow-500/10'
        }`}>
          {emailConfigured
            ? <CheckCircle className="h-5 w-5 text-green-400" />
            : <Shield className="h-5 w-5 text-yellow-400" />
          }
        </div>
        <div>
          <p className={`text-xs font-bold ${emailConfigured ? 'text-green-400' : 'text-yellow-400'}`}>
            {emailConfigured ? '✅ Email System Active' : '⚠️ Email Not Configured'}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {emailConfigured
              ? `Invoices are automatically sent to customers from ${ownerEmail || 'your Gmail'}`
              : 'Enter your Gmail and App Password below to enable automatic invoice emails'
            }
          </p>
        </div>
      </div>

      {/* Gmail Credentials */}
      <div className="glass-card border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="h-4 w-4 text-cyan-bright" />
          <p className="text-xs font-bold text-white">Gmail Credentials</p>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Owner Gmail Address *</label>
          <input
            type="email"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50 transition-colors"
            placeholder="vishalvarma40511@gmail.com"
            value={ownerEmail}
            onChange={e => setOwnerEmail(e.target.value)}
          />
          <p className="text-[10px] text-slate-600 mt-1">This email will send invoices to customers and receive CC copies.</p>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Gmail App Password *</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50 pr-20 transition-colors"
              placeholder={emailConfigured ? '••••••••••••••••• (saved)' : 'xxxx xxxx xxxx xxxx'}
              value={ownerEmailPass}
              onChange={e => setOwnerEmailPass(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPass(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-cyan-bright cursor-pointer hover:underline"
            >
              {showPass ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="text-[10px] text-slate-600 mt-1">
            Get from: <span className="text-cyan-bright">Google Account → Security → 2-Step Verification → App Passwords</span>
          </p>
        </div>
      </div>

      {/* Store Info */}
      <div className="glass-card border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-4 w-4 text-cyan-bright" />
          <p className="text-xs font-bold text-white">Store Information</p>
        </div>
        <p className="text-[10px] text-slate-500 -mt-2">This info appears in every invoice email and PDF.</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Store Name</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
              placeholder="Alfa Store"
              value={storeName}
              onChange={e => setStoreName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Phone</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
              placeholder="6281823557"
              value={storePhone}
              onChange={e => setStorePhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Website</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
              placeholder="https://aiemployee.com"
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Store Address</label>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
              placeholder="Near Vijayawada, Andhra Pradesh"
              value={storeAddress}
              onChange={e => setStoreAddress(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-sm rounded-xl py-3 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            : <><CheckCircle className="h-4 w-4" /> Save Settings</>
          }
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleTest}
          disabled={testing || !emailConfigured}
          className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold rounded-xl px-5 py-3 cursor-pointer hover:bg-white/10 transition-colors disabled:opacity-50"
          title={!emailConfigured ? 'Save your credentials first' : 'Send test email'}
        >
          {testing
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Testing...</>
            : <><Zap className="h-4 w-4 text-yellow-400" /> Test Email</>
          }
        </motion.button>
      </div>

      {/* How-to guide */}
      <div className="glass-card border border-white/5 rounded-2xl p-5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">📋 How to get your Gmail App Password</p>
        <ol className="space-y-2 text-[11px] text-slate-500 list-decimal list-inside">
          <li>Go to <span className="text-cyan-bright">myaccount.google.com</span></li>
          <li>Click <strong className="text-slate-300">Security</strong> in the left menu</li>
          <li>Enable <strong className="text-slate-300">2-Step Verification</strong> if not already enabled</li>
          <li>Search for <strong className="text-slate-300">"App Passwords"</strong> in the search bar</li>
          <li>Click <strong className="text-slate-300">App Passwords</strong> → Select <strong className="text-slate-300">Mail</strong> and <strong className="text-slate-300">Windows Computer</strong></li>
          <li>Copy the 16-character password and paste it above</li>
          <li>Click <strong className="text-slate-300">Save Settings</strong>, then <strong className="text-slate-300">Test Email</strong></li>
        </ol>
        <div className="mt-3 bg-green-500/5 border border-green-500/10 rounded-xl p-3 text-[10px] text-green-400">
          ✅ Once saved, every customer payment will automatically trigger an invoice email to their inbox.
        </div>
      </div>
    </div>
  )
}

export default function InvoicePanel() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'invoices' | 'settings'>('invoices')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [resending, setResending] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (dateFilter) params.set('dateRange', dateFilter)
      if (paymentFilter) params.set('paymentStatus', paymentFilter)
      if (emailFilter) params.set('emailStatus', emailFilter)

      const res = await fetch(`${API_BASE}/invoice?${params.toString()}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setInvoices(data)
    } catch {
      toast.error('Failed to fetch invoices')
    } finally {
      setLoading(false)
    }
  }, [search, dateFilter, paymentFilter, emailFilter])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const handleDownload = async (id: string, num: string) => {
    setDownloading(id)
    try {
      const res = await fetch(`${API_BASE}/invoice/download/${id}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${num}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Invoice downloaded!')
    } catch {
      toast.error('Download failed')
    } finally {
      setDownloading(null)
    }
  }

  const handleResend = async (id: string) => {
    setResending(id)
    try {
      const res = await fetch(`${API_BASE}/invoice/resend/${id}`, { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.emailStatus === 'Success') {
        toast.success('Invoice email resent successfully!')
      } else {
        toast.error('Email delivery failed. Will retry later.')
      }
      fetchInvoices()
      if (selectedInvoice?._id === id) {
        const updated = invoices.find(inv => inv._id === id)
        if (updated) setSelectedInvoice({ ...updated, emailStatus: data.emailStatus })
      }
    } catch {
      toast.error('Resend failed')
    } finally {
      setResending(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const res = await fetch(`${API_BASE}/invoice/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Invoice deleted')
      setInvoices(prev => prev.filter(inv => inv._id !== id))
      if (selectedInvoice?._id === id) setSelectedInvoice(null)
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const handlePrint = (invoice: Invoice) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${invoice.invoiceNumber}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1a1a1a; padding: 30px; font-size: 12px; }
          .header { border-bottom: 3px solid #06b6d4; padding-bottom: 15px; margin-bottom: 20px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .label { color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; }
          .value { color: #111; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f3f4f6; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; color: #555; }
          td { padding: 8px 10px; border-bottom: 1px solid #eee; }
          .total-section { text-align: right; margin-top: 10px; }
          .grand-total { font-size: 18px; color: #06b6d4; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; color: #888; font-size: 10px; }
          .badge { display: inline-block; background: #d1fae5; color: #065f46; border-radius: 99px; padding: 2px 8px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ALFA STORE</h1>
          <p style="color:#666; font-size:10px; margin-top:5px;">INVOICE RECEIPT</p>
        </div>
        <div class="meta">
          <div>
            <div class="label">Invoice Number</div>
            <div class="value" style="color:#06b6d4;">${invoice.invoiceNumber}</div>
            <div class="label" style="margin-top:10px;">Date</div>
            <div class="value">${new Date(invoice.createdAt).toLocaleString()}</div>
            <div class="label" style="margin-top:10px;">Payment Mode</div>
            <div class="value">${invoice.paymentMethod}</div>
            <div class="label" style="margin-top:10px;">Status</div>
            <div class="value"><span class="badge">${invoice.paymentStatus}</span></div>
          </div>
          <div>
            <div class="label">Billed To</div>
            <div class="value">${invoice.customerName}</div>
            <div style="color:#555; margin-top:4px;">${invoice.email}</div>
            ${invoice.phone ? `<div style="color:#555;">${invoice.phone}</div>` : ''}
          </div>
        </div>
        <table>
          <thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead>
          <tbody>
            ${invoice.products.map(p => `
              <tr>
                <td>${p.productName}</td>
                <td>${p.quantity}</td>
                <td>₹${p.price.toFixed(2)}</td>
                <td>₹${(p.price * p.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total-section">
          <p>Subtotal: ₹${invoice.subtotal.toFixed(2)}</p>
          <p>Discount: -₹${(invoice.discount || 0).toFixed(2)}</p>
          <p>GST (18%): ₹${(invoice.gst || 0).toFixed(2)}</p>
          <p class="grand-total">Grand Total: ₹${invoice.total.toFixed(2)}</p>
        </div>
        <div class="footer">
          <p>Thank you for your business! • Store: ${invoice.email}</p>
          <p style="margin-top:5px;">Terms: All sales final. Keep this receipt for warranty claims.</p>
        </div>
      </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => { printWindow.print() }, 300)
    }
    toast.success('Print dialog opened!')
  }

  // Summary stats
  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.paymentStatus === 'Paid').length,
    emailSuccess: invoices.filter(i => i.emailStatus === 'Success').length,
    emailFailed: invoices.filter(i => i.emailStatus === 'Failed').length,
    revenue: invoices.filter(i => i.paymentStatus === 'Paid').reduce((s, i) => s + i.total, 0)
  }

  return (
    <div className="flex flex-col h-full gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-bright" />
            Invoice Management
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5">Auto-generated invoices with PDF & email dispatch</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xs font-bold rounded-xl px-4 py-2.5 cursor-pointer hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
        >
          <FileText className="h-3.5 w-3.5" /> New Invoice
        </motion.button>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-xl shrink-0 w-fit">
        {([['invoices', FileText, 'Invoices'], ['settings', Settings, 'Email Setup']] as const).map(([tab, Icon, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-cyan/15 text-cyan-bright border border-cyan/20'
                : 'text-slate-500 hover:text-white'
            }`}
          >
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <EmailSettingsPanel />
        </div>
      )}

      {/* Invoices Tab content below (hidden when settings active) */}
      {activeTab === 'invoices' && (<>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        {[
          { label: 'Total Invoices', value: stats.total, icon: FileText, color: 'text-cyan-bright', bg: 'bg-cyan/5 border-cyan/10' },
          { label: 'Paid Invoices', value: stats.paid, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/5 border-green-500/10' },
          { label: 'Email Delivered', value: stats.emailSuccess, icon: Mail, color: 'text-violet-400', bg: 'bg-violet-500/5 border-violet-500/10' },
          { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`, icon: IndianRupee, color: 'text-yellow-400', bg: 'bg-yellow-500/5 border-yellow-500/10' },
        ].map(stat => (
          <div key={stat.label} className={`glass-card rounded-xl p-3.5 border ${stat.bg} flex items-center gap-3`}>
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex gap-2 shrink-0 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan/50"
            placeholder="Search invoice, customer, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan/50 cursor-pointer appearance-none pr-7"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          >
            {DATE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
        </div>

        {/* Payment Status Filter */}
        <div className="relative">
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan/50 cursor-pointer appearance-none pr-7"
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
          >
            <option value="">All Payment</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Pending">Pending</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
        </div>

        {/* Email Status Filter */}
        <div className="relative">
          <select
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan/50 cursor-pointer appearance-none pr-7"
            value={emailFilter}
            onChange={e => setEmailFilter(e.target.value)}
          >
            <option value="">All Email</option>
            <option value="Success">Email Sent</option>
            <option value="Failed">Email Failed</option>
            <option value="Pending">Pending</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={fetchInvoices}
          className="glass border border-white/10 rounded-xl px-3 py-2.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Refresh"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-cyan-bright' : ''}`} />
        </motion.button>
      </div>

      {/* Invoice Table */}
      <div className="flex-1 overflow-hidden glass-card border border-white/5 rounded-2xl">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-cyan-bright mx-auto mb-3" />
              <p className="text-slate-500 text-xs">Loading invoices...</p>
            </div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-slate-700 mb-4" />
            <p className="text-slate-400 text-sm font-medium mb-1">No Invoices Found</p>
            <p className="text-slate-600 text-xs">Invoices are auto-generated when orders are placed</p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-xs text-cyan-bright cursor-pointer hover:underline"
            >
              + Create your first invoice
            </motion.button>
          </div>
        ) : (
          <div className="overflow-auto h-full">
            <table className="w-full min-w-[700px]">
              <thead className="sticky top-0 bg-[#0a0f18] z-10">
                <tr className="border-b border-white/5">
                  {['Invoice No.', 'Customer', 'Date', 'Amount', 'Payment', 'Email', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {invoices.map((invoice, idx) => (
                    <motion.tr
                      key={invoice._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-white/5 hover:bg-white/[0.015] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="text-cyan-bright font-mono text-xs font-bold hover:underline cursor-pointer"
                        >
                          {invoice.invoiceNumber}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white text-xs font-medium">{invoice.customerName}</p>
                        <p className="text-slate-500 text-[10px] truncate max-w-[140px]">{invoice.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white text-xs font-bold font-mono">₹{invoice.total.toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${statusBadge(invoice.paymentStatus)}`}>
                          {statusIcon(invoice.paymentStatus)} {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${statusBadge(invoice.emailStatus)}`}>
                          {statusIcon(invoice.emailStatus)} {invoice.emailStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedInvoice(invoice)}
                            title="View"
                            className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-cyan-bright hover:border-cyan/30 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Eye className="h-3 w-3" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDownload(invoice._id, invoice.invoiceNumber)}
                            title="Download PDF"
                            disabled={downloading === invoice._id}
                            className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-green-400 hover:border-green-500/30 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {downloading === invoice._id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Download className="h-3 w-3" />
                            }
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleResend(invoice._id)}
                            title="Resend Email"
                            disabled={resending === invoice._id}
                            className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-violet-400 hover:border-violet-500/30 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {resending === invoice._id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Send className="h-3 w-3" />
                            }
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handlePrint(invoice)}
                            title="Print"
                            className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 flex items-center justify-center cursor-pointer transition-colors"
                          >
                            <Printer className="h-3 w-3" />
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(invoice._id)}
                            title="Delete"
                            disabled={deleting === invoice._id}
                            className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/30 flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                          >
                            {deleting === invoice._id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : <Trash2 className="h-3 w-3" />
                            }
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedInvoice && (
          <InvoiceModal
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onResend={handleResend}
            onDownload={handleDownload}
            onPrint={handlePrint}
            resending={resending}
          />
        )}
        {showCreateModal && (
          <CreateInvoiceModal
            onClose={() => setShowCreateModal(false)}
            onCreated={fetchInvoices}
          />
        )}
      </AnimatePresence>
      </>)}
    </div>
  )
}
