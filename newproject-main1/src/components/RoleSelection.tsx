import { useState } from 'react'
import { motion } from 'framer-motion'
import { Store, ShoppingBag, ShieldCheck, UserCheck, ArrowLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function RoleSelection() {
  const { 
    setPortal, 
    setView, 
    setCustomerName,
    setCustomerEmail,
    setCustomerPhone,
    setCustomerAddress
  } = useApp()
  const [hoveredCard, setHoveredCard] = useState<'owner' | 'customer' | null>(null)
  
  const [customerNameInput, setCustomerNameInput] = useState('')
  const [customerEmailInput, setCustomerEmailInput] = useState('')
  const [customerPhoneInput, setCustomerPhoneInput] = useState('')
  const [customerAddressInput, setCustomerAddressInput] = useState('')
  const [showNameModal, setShowNameModal] = useState(false)

  const handleSelectOwner = () => {
    setPortal('owner')
    setView('auth') // goes to Login/Signup page
  }

  const handleSelectCustomer = () => {
    setPortal('customer')
    setView('dashboard')
  }

  const confirmCustomerAccess = () => {
    const finalName = customerNameInput.trim() || 'Guest Buyer'
    const finalEmail = customerEmailInput.trim() || 'buyer@gmail.com'
    const finalPhone = customerPhoneInput.trim() || '+91 99999 88888'
    const finalAddress = customerAddressInput.trim() || 'Sector 62, Noida, India'

    setCustomerName(finalName)
    setCustomerEmail(finalEmail)
    setCustomerPhone(finalPhone)
    setCustomerAddress(finalAddress)
    setPortal('customer')
    setView('dashboard') // goes directly to Customer Chatbot Portal
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-6 aurora-bg noise">
      {/* Background patterns */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-electric/15 blur-[120px] animate-float-slow" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-neon/15 blur-[120px] animate-float" />

      <div className="relative z-10 w-full max-w-4xl text-center">
        {/* Back Button */}
        <div className="absolute -top-12 left-0 md:left-4">
          <button
            onClick={() => setView('landing')}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Choose Your <span className="text-gradient">Interface</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-slate-400">
            Select your operational role to initialize the decentralized quantum business environment.
          </p>
        </motion.div>

        {/* Roles Grid */}
        <div className="grid gap-8 md:grid-cols-2 px-4 md:px-12">
          {/* OWNER CARD */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            onMouseEnter={() => setHoveredCard('owner')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={handleSelectOwner}
            className={`glass-strong group relative flex flex-col items-center justify-between rounded-3xl p-8 text-center cursor-pointer transition-all duration-500 border ${
              hoveredCard === 'owner'
                ? 'border-electric shadow-2xl glow-blue scale-[1.03]'
                : 'border-white/5 hover:border-white/10'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-electric/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-blue-600 shadow-xl shadow-electric/20 mb-6 group-hover:scale-110 transition-transform duration-500">
              <Store className="h-10 w-10 text-white" />
            </div>

            <div className="relative z-10">
              <h3 className="font-display text-2xl font-bold text-white mb-3">🏪 Store Owner</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Decrypt secure inventory registers, manage employee schedules, audit quarterly financial spreadsheets, and run AI demand forecasting models.
              </p>
            </div>

            <div className="relative z-10 w-full">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-electric/10 px-3.5 py-1.5 text-xs font-semibold text-electric-bright border border-electric/25">
                <ShieldCheck className="h-3.5 w-3.5" /> Owner Portal Access
              </span>
            </div>
          </motion.div>

          {/* CUSTOMER CARD */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onMouseEnter={() => setHoveredCard('customer')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={handleSelectCustomer}
            className={`glass-strong group relative flex flex-col items-center justify-between rounded-3xl p-8 text-center cursor-pointer transition-all duration-500 border ${
              hoveredCard === 'customer'
                ? 'border-neon shadow-2xl glow-purple scale-[1.03]'
                : 'border-white/5 hover:border-white/10'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-neon/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-neon to-purple-600 shadow-xl shadow-neon/20 mb-6 group-hover:scale-110 transition-transform duration-500">
              <ShoppingBag className="h-10 w-10 text-white" />
            </div>

            <div className="relative z-10">
              <h3 className="font-display text-2xl font-bold text-white mb-3">🛍 Customer Portal</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Query store inventory prices, receive smart AI shopping recommendations, place secure orders, and initiate live communications with the store owner.
              </p>
            </div>

            <div className="relative z-10 w-full">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neon/10 px-3.5 py-1.5 text-xs font-semibold text-neon-bright border border-neon/25">
                <UserCheck className="h-3.5 w-3.5" /> Customer AI Chatbot
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Guest Name Modal Overlay */}
      {showNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-strong max-w-md w-full rounded-3xl p-6 text-center shadow-2xl glow-cyan"
          >
            <h3 className="font-display text-xl font-bold text-white">Initialize Customer Profile</h3>
            <p className="text-xs text-slate-400 mt-2">
              Please initialize your delivery coordinates and info to browse our drone-synced shop.
            </p>
            
            <div className="my-5 text-left space-y-3.5">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Your Name</label>
                <input
                  type="text"
                  value={customerNameInput}
                  onChange={(e) => setCustomerNameInput(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full rounded-xl glass px-4 py-2.5 text-xs text-white focus:border-cyan focus:outline-none mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Gmail Address</label>
                <input
                  type="email"
                  value={customerEmailInput}
                  onChange={(e) => setCustomerEmailInput(e.target.value)}
                  placeholder="e.g. alex@gmail.com"
                  className="w-full rounded-xl glass px-4 py-2.5 text-xs text-white focus:border-cyan focus:outline-none mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Location / Contact Number</label>
                <input
                  type="text"
                  value={customerPhoneInput}
                  onChange={(e) => setCustomerPhoneInput(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl glass px-4 py-2.5 text-xs text-white focus:border-cyan focus:outline-none mt-1"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Delivery Address</label>
                <input
                  type="text"
                  value={customerAddressInput}
                  onChange={(e) => setCustomerAddressInput(e.target.value)}
                  placeholder="e.g. 100 Feet Road, Indiranagar, Bengaluru, India"
                  className="w-full rounded-xl glass px-4 py-2.5 text-xs text-white focus:border-cyan focus:outline-none mt-1"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowNameModal(false)}
                className="flex-1 rounded-xl border border-white/5 hover:bg-white/5 py-3 text-xs font-semibold text-slate-400 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmCustomerAccess}
                className="flex-1 rounded-xl bg-gradient-to-r from-electric to-cyan py-3 text-xs font-semibold text-white shadow-lg shadow-electric/25 hover:scale-[1.02] transition-transform cursor-pointer"
              >
                Enter Store
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
