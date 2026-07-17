import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sparkles, X, CreditCard, QrCode, Lock, ShieldCheck } from 'lucide-react'
import { useApp } from '../context/AppContext'

const plans = [
  {
    name: 'Starter',
    price: '₹3,999',
    period: '/mo',
    desc: 'For small businesses getting started with AI',
    features: ['1 AI employee', '3 AI agents', '1,000 AI actions/mo', 'Basic analytics', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Growth',
    price: '₹11,999',
    period: '/mo',
    desc: 'For scaling businesses that need more power',
    features: ['3 AI employees', 'All 8 AI agents', '10,000 AI actions/mo', 'Advanced analytics & predictions', 'Voice AI assistant', 'Priority support', 'Custom workflows'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For large teams with custom needs',
    features: ['Unlimited AI employees', 'Unlimited AI actions', 'Custom AI model training', 'Dedicated infrastructure', 'SSO & advanced security', '24/7 dedicated support', 'On-premise option'],
    highlighted: false,
  },
]

export default function Pricing() {
  const { setView, setPurchasedPlan } = useApp()
  const [annual, setAnnual] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card')
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
  const [expiry, setExpiry] = useState('12/28')
  const [cvv, setCvv] = useState('123')
  const [cardName, setCardName] = useState('Store Owner')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    
    const steps = [
      'Establishing TLS encrypted session...',
      'Verifying payment provider endpoints...',
      'Requesting authorization from bank gateway...',
      'Creating Smart Contract ledger transaction entry...',
      'Payment verified! Provisioning AI Employees...',
    ]

    for (const step of steps) {
      setProcessingStep(step)
      await new Promise((res) => setTimeout(res, 600))
    }

    setPurchasedPlan(selectedPlan.name)
    setIsProcessing(false)
    setSelectedPlan(null)
    setView('auth') // Route to login/decryption portal
  }

  return (
    <section id="pricing" className="relative z-10 px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-block rounded-full glass px-4 py-1.5 text-xs font-medium text-cyan-bright">
            Pricing
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Choose your <span className="text-gradient">AI workforce</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Start free. Scale as you grow. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full glass p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                !annual ? 'bg-gradient-to-r from-electric to-neon text-white' : 'text-slate-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                annual ? 'bg-gradient-to-r from-electric to-neon text-white' : 'text-slate-400'
              }`}
            >
              Annual <span className="text-cyan-bright">-20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative ${plan.highlighted ? 'md:-translate-y-4' : ''}`}
            >
              <div
                className={`relative h-full overflow-hidden rounded-3xl p-8 ${
                  plan.highlighted
                    ? 'glass-strong animated-border glow-blue'
                    : 'glass-card'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-gradient-to-r from-electric to-neon px-3 py-1 text-xs font-semibold text-white">
                    <Sparkles className="h-3 w-3" /> Popular
                  </div>
                )}

                <h3 className="font-display text-lg font-semibold text-white">{plan.name}</h3>
                {plan.price !== 'Custom' && (
                  <span className="mt-1.5 inline-block rounded-full bg-cyan/10 border border-cyan/30 px-2 py-0.5 text-[10px] font-bold text-cyan-bright animate-pulse-glow">
                    🎁 Offer: 1 Month Free
                  </span>
                )}
                <p className="mt-2 text-sm text-slate-400">{plan.desc}</p>

                <div className="mt-6 flex items-end gap-1">
                  <span className="font-display text-4xl font-bold text-white font-mono">
                    {annual && plan.price.startsWith('₹')
                      ? `₹${Math.round(parseInt(plan.price.slice(1).replace(/,/g, '')) * 0.8).toLocaleString('en-IN')}`
                      : plan.price}
                  </span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>

                <button
                  onClick={() => {
                    if (plan.price === 'Custom') {
                      window.open('mailto:sales@businessos.ai?subject=Enterprise Package Enquiry')
                    } else {
                      setSelectedPlan(plan)
                    }
                  }}
                  className={`w-full mt-6 block rounded-xl py-3.5 text-center text-sm font-semibold transition-all cursor-pointer ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-electric to-neon text-white shadow-lg shadow-electric/30 hover:scale-[1.02]'
                      : 'glass-strong text-white hover:bg-white/10'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Buy AI Employee'}
                </button>

                <div className="mt-7 space-y-3">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-electric/20">
                        <Check className="h-3 w-3 text-electric-bright" />
                      </div>
                      <span className="text-sm text-slate-300">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CHECKOUT MODAL OVERLAY */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="glass-strong relative w-full max-w-lg overflow-hidden rounded-3xl p-6 shadow-2xl glow-blue md:p-8"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => !isProcessing && setSelectedPlan(null)}
                className="absolute right-5 top-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                disabled={isProcessing}
              >
                <X className="h-5 w-5" />
              </button>

              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
                    <div className="absolute inset-0 rounded-full border-4 border-electric border-t-transparent animate-spin" />
                    <ShieldCheck className="h-7 w-7 text-cyan-bright animate-pulse-glow" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white">Security Clearing</h3>
                  <div className="mt-4 h-14 w-full overflow-hidden rounded-xl bg-base p-3 text-left border border-white/5">
                    <motion.p
                      key={processingStep}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-mono text-xs text-green-400"
                    >
                      {processingStep}
                    </motion.p>
                  </div>
                  <p className="mt-4 text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <Lock className="h-3 w-3 text-slate-400" /> 256-bit AES End-to-End Encryption
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                  <div>
                    <span className="rounded-full bg-electric/10 border border-electric/30 px-2.5 py-1 text-[10px] font-bold text-electric-bright uppercase tracking-wider">
                      Workforce Ingestion Checkout
                    </span>
                    <h3 className="font-display text-2xl font-bold text-white mt-3">
                      Hire {selectedPlan.name} Fleet
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Billing Summary: <strong className="text-white font-mono">{annual ? `₹${Math.round(parseInt(selectedPlan.price.slice(1).replace(/,/g, '')) * 0.8).toLocaleString('en-IN')}` : selectedPlan.price}</strong> {selectedPlan.period}
                    </p>
                  </div>

                  {/* Payment tabs */}
                  <div className="flex gap-2 rounded-xl bg-white/5 p-1">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
                        paymentMethod === 'card' ? 'bg-gradient-to-r from-electric to-neon text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Credit/Debit Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
                        paymentMethod === 'upi' ? 'bg-gradient-to-r from-electric to-neon text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="h-3.5 w-3.5" /> UPI Scan
                    </button>
                  </div>

                  {paymentMethod === 'card' ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Name on Card</label>
                        <input
                          type="text"
                          required
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full rounded-xl glass px-4 py-2.5 text-xs text-white focus:border-electric focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Card Number</label>
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full rounded-xl glass px-4 py-2.5 text-xs text-white font-mono focus:border-electric focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Expiry Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="w-full rounded-xl glass px-4 py-2.5 text-xs text-white font-mono focus:border-electric focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">CVV</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            className="w-full rounded-xl glass px-4 py-2.5 text-xs text-white font-mono focus:border-electric focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-center">
                      <div className="bg-white p-2.5 rounded-xl mb-3 shadow-inner">
                        {/* Interactive simple mock QR Code */}
                        <div className="w-32 h-32 bg-slate-900 flex flex-col items-center justify-center p-2 rounded border border-slate-700">
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">SCAN WITH UPI</span>
                          <div className="w-20 h-20 border border-cyan-500/50 flex flex-wrap p-0.5 justify-around items-center opacity-80 animate-pulse">
                            <div className="w-5 h-5 bg-electric"></div>
                            <div className="w-5 h-5 bg-transparent"></div>
                            <div className="w-5 h-5 bg-neon"></div>
                            <div className="w-5 h-5 bg-transparent"></div>
                            <div className="w-5 h-5 bg-electric"></div>
                            <div className="w-5 h-5 bg-transparent"></div>
                            <div className="w-5 h-5 bg-neon"></div>
                            <div className="w-5 h-5 bg-transparent"></div>
                            <div className="w-5 h-5 bg-electric"></div>
                          </div>
                          <span className="text-[8px] text-cyan-bright font-bold mt-2 font-mono">BUSINESSOS@UPI</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300">UPI ID: <strong className="text-white">businessos@payment</strong></p>
                      <p className="text-[10px] text-slate-500 mt-1">Scan QR code using Google Pay, PhonePe, Paytm, or BHIM.</p>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-electric to-neon py-3.5 text-center text-xs font-semibold text-white shadow-xl shadow-electric/25 cursor-pointer hover:scale-[1.01] transition-transform"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Complete Secure Order & Activate Employees <Lock className="h-4 w-4" />
                      </span>
                    </button>
                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5 text-cyan-bright" /> Secured by PCI-DSS Compliant Security Tunnel
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
