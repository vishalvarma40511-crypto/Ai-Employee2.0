import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, ArrowLeft, Key, Database, Cpu, Eye, EyeOff } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { UserRole } from '../context/AppContext'
import MagneticButton from './MagneticButton'

export default function AuthGateway() {
  const { view, setView, login, role, setRole } = useApp()
  const [email, setEmail] = useState('owner@businessos.ai')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [securityStep, setSecurityStep] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [selectedLocation, setSelectedLocation] = useState('vijayawada')

  const handleRoleSelect = (selected: UserRole) => {
    setRole(selected)
    setEmail(`${selected}@businessos.ai`)
    setErrorMsg('')
    setView('auth')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (role !== 'owner') {
      setErrorMsg('Access Denied: Only the Shop Owner is authorized to decrypt the dashboard environment. Other operational profiles are restricted.')
      return
    }

    if (password !== 'owner123') {
      setErrorMsg('Authentication Failed: Incorrect security passcode for the Store Owner profile. Access denied.')
      return
    }

    setErrorMsg('')
    setLoading(true)
    
    // Save selected location for dynamic language generation in dashboard
    localStorage.setItem('business_location', selectedLocation)

    const steps = [
      'Establishing handshake with Firebase Auth...',
      'Validating SSL authentication certificates...',
      'Fetching role keys from Firestore db schema...',
      'Opening secure tunnel to StoreMind backend...',
      'Synchronizing MongoDB ledger status...',
      'Verification complete! Granting access tokens...',
    ]

    for (const step of steps) {
      setSecurityStep(step)
      await new Promise((res) => setTimeout(res, 500))
    }

    await login(role)
    setLoading(false)
  }

  const roleConfigs = [
    { id: 'owner', label: 'Owner', desc: 'Full financial audits, payroll approvals, and business scaling configurations.' },
    { id: 'manager', label: 'Manager', desc: 'Roster scheduling, stock ordering approval, and sales target monitoring.' },
    { id: 'cashier', label: 'Cashier', desc: 'POS checkout registry, sales recording, and simple barcode scanning.' },
    { id: 'admin', label: 'System Admin', desc: 'Infrastructure settings, fraud logs audit, and MongoDB sync configurations.' },
  ] as const

  // STEP 1: Role Selection View
  if (view === 'role_select') {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center p-6 aurora-bg noise">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="pointer-events-none absolute left-1/4 top-1/4 h-[350px] w-[350px] rounded-full bg-electric/15 blur-[120px]" />
        <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[350px] w-[350px] rounded-full bg-neon/15 blur-[120px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong relative w-full max-w-2xl overflow-hidden rounded-3xl p-6 shadow-2xl glow-blue md:p-8"
        >
          {/* Back Button */}
          <div className="mb-6 flex justify-start">
            <button
              onClick={() => setView('landing')}
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </button>
          </div>

          <div className="mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-neon shadow-lg shadow-electric/25 mb-4">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
              Select Profile Role
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Choose your operational profile level to start decrypting dashboard databases.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {roleConfigs.map((cfg) => (
              <button
                key={cfg.id}
                type="button"
                onClick={() => handleRoleSelect(cfg.id)}
                className="flex flex-col items-start rounded-2xl p-5 text-left border border-white/5 glass hover:bg-white/5 hover:border-electric/30 transition-all duration-300 group cursor-pointer"
              >
                <span className="text-sm font-bold text-white group-hover:text-electric-bright transition-colors">
                  {cfg.label}
                </span>
                <span className="text-xs leading-normal text-slate-400 mt-2">
                  {cfg.desc}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // STEP 2: Password Authentication View
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-6 aurora-bg noise">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="pointer-events-none absolute left-1/4 top-1/4 h-[350px] w-[350px] rounded-full bg-electric/15 blur-[120px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-[350px] w-[350px] rounded-full bg-neon/15 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong relative w-full max-w-md overflow-hidden rounded-3xl p-6 shadow-2xl glow-blue md:p-8"
      >
        {/* Back Button */}
        <div className="mb-6 flex justify-start">
          <button
            onClick={() => setView('role_select')}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Role Select
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
              <div className="absolute inset-0 rounded-full border-4 border-electric border-t-transparent animate-spin" />
              <Cpu className="h-6 w-6 text-cyan-bright animate-pulse-glow" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Decrypting Environment</h3>
            <div className="mt-4 h-12 w-full overflow-hidden rounded-md bg-base-100 p-2.5 text-left">
              <motion.p
                key={securityStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-mono text-[10px] text-green-400"
              >
                {securityStep}
              </motion.p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 font-mono text-[9px] text-slate-500">
              <Database className="h-3 w-3" /> Syncing Firestore Clusters
            </div>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-neon shadow-lg shadow-electric/25 mb-4">
                <Key className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">
                Enter Decryption Key
              </h2>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                Authenticating profile: <strong className="text-electric-bright">{role}</strong>
              </p>
              <p className="text-[10px] text-slate-500 mt-1.5 italic">
                Hint: Passcode is <strong className="text-slate-400">owner123</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400 font-semibold leading-relaxed">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl glass px-4 py-3 text-xs text-white focus:border-electric focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Select Business Location (State Profile)
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full rounded-xl glass px-4 py-3 text-xs text-white focus:border-electric focus:outline-none bg-[#0a0f1d] border border-white/5"
              >
                <option value="vijayawada">Vijayawada (Telugu, Hindi, English)</option>
                <option value="delhi">Delhi NCR (Hindi, English)</option>
                <option value="hyderabad">Hyderabad (Telugu, Urdu, Hindi, English)</option>
                <option value="mumbai">Mumbai (Marathi, Hindi, English)</option>
                <option value="bengaluru">Bengaluru (Kannada, Telugu, Hindi, English)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Security Passcode
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl glass pl-4 pr-10 py-3 text-xs text-white focus:border-electric focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-transparent text-electric focus:ring-0" />
                Remember credentials
              </label>
              <a href="#" className="hover:underline hover:text-white">Forgot keys?</a>
            </div>

            <MagneticButton className="w-full relative overflow-hidden rounded-xl bg-gradient-to-r from-electric to-neon py-3.5 text-center text-xs font-semibold text-white shadow-xl shadow-electric/25 cursor-pointer">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Secure Authenticate <Shield className="h-4 w-4" />
              </span>
              <span className="absolute inset-0 shimmer opacity-20" />
            </MagneticButton>
          </form>
        )}
      </motion.div>
    </div>
  )
}
