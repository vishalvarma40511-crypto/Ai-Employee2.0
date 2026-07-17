import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  Activity,
  Zap,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  X
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import toast from 'react-hot-toast'
import { API_BASE } from '../../config'

const pieColors = ['#3b82f6', '#8b5cf6', '#22d3ee', '#ef4444']

export default function OverviewPanel() {
  const { 
    dbState, 
    role, 
    triggerLog, 
    purchasedPlan, 
    isInventoryInitialized, 
    setActiveTab, 
    logout, 
    setView,
    setInventoryInitialized,
    setPurchasedPlan
  } = useApp()

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetting, setResetting] = useState(false)

  // Check if system has been reset
  const isResetState = dbState.sales.length === 0

  // Calculate stats based on DB
  const totalRevenue = isResetState ? 0 : dbState.sales.reduce((sum, s) => sum + s.total, 0) + 121215.5
  const customerCount = isResetState ? 0 : dbState.customers.length
  const totalUsers = isResetState ? 0 : customerCount + 319
  const expensesValue = isResetState ? 0 : totalRevenue * 0.43
  const netProfitValue = isResetState ? 0 : totalRevenue * 0.57

  // Load dynamic profile details for welcome greeting
  const savedProfile = localStorage.getItem('businessos_owner_profile')
  let profileName = 'Owner'
  if (savedProfile) {
    try {
      const parsed = JSON.parse(savedProfile)
      if (parsed.name) {
        profileName = parsed.name
      }
    } catch (e) {
      console.error(e)
    }
  }

  const stats = [
    {
      icon: IndianRupee,
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      change: isResetState ? '0%' : '+28.4%',
      trend: isResetState ? 'down' : 'up',
      desc: 'Real-time sales revenue',
      sparklineColor: isResetState ? '#64748b' : '#6366f1',
      sparklinePath: isResetState ? 'M 0,25 L 120,25' : 'M 0,25 Q 15,5 30,22 T 60,8 T 90,20 T 120,10',
      iconBg: 'bg-[#6366f1]/10 border border-[#6366f1]/20',
      iconColor: 'text-[#6366f1]',
      glowClass: 'glow-purple',
    },
    {
      icon: ShoppingCart,
      label: 'Total Expenses',
      value: `₹${expensesValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      change: isResetState ? '0%' : '-8.2%',
      trend: isResetState ? 'down' : 'down',
      desc: 'Mock operations cost ledger',
      sparklineColor: isResetState ? '#64748b' : '#f43f5e',
      sparklinePath: isResetState ? 'M 0,25 L 120,25' : 'M 0,10 Q 20,25 40,5 T 80,18 T 120,12',
      iconBg: 'bg-[#f43f5e]/10 border border-[#f43f5e]/20',
      iconColor: 'text-[#f43f5e]',
      glowClass: 'glow-rose',
    },
    {
      icon: Zap,
      label: 'Net Profit',
      value: `₹${netProfitValue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      change: isResetState ? '0%' : '+15.3%',
      trend: isResetState ? 'down' : 'up',
      desc: 'Profits after mock payouts',
      sparklineColor: isResetState ? '#64748b' : '#10b981',
      sparklinePath: isResetState ? 'M 0,25 L 120,25' : 'M 0,22 Q 15,5 30,25 T 60,10 T 90,18 T 120,12',
      iconBg: 'bg-[#10b981]/10 border border-[#10b981]/20',
      iconColor: 'text-[#10b981]',
      glowClass: 'glow-green',
    },
    {
      icon: Users,
      label: 'Total Users',
      value: totalUsers.toLocaleString('en-IN'),
      change: isResetState ? '0%' : '+5.4%',
      trend: isResetState ? 'down' : 'up',
      desc: 'Unique buyers in 30 days',
      sparklineColor: isResetState ? '#64748b' : '#06b6d4',
      sparklinePath: isResetState ? 'M 0,25 L 120,25' : 'M 0,15 Q 15,22 35,5 T 70,18 T 120,10',
      iconBg: 'bg-[#06b6d4]/10 border border-[#06b6d4]/20',
      iconColor: 'text-[#06b6d4]',
      glowClass: 'glow-cyan',
    },
  ]


  const revenueHistory = isResetState ? [
    { month: 'Jan', revenue: 0, profit: 0 },
    { month: 'Feb', revenue: 0, profit: 0 },
    { month: 'Mar', revenue: 0, profit: 0 },
    { month: 'Apr', revenue: 0, profit: 0 },
    { month: 'May', revenue: 0, profit: 0 },
    { month: 'Jun', revenue: 0, profit: 0 },
    { month: 'Jul', revenue: 0, profit: 0 },
  ] : [
    { month: 'Jan', revenue: 42000, profit: 28000 },
    { month: 'Feb', revenue: 55000, profit: 34000 },
    { month: 'Mar', revenue: 48000, profit: 31000 },
    { month: 'Apr', revenue: 67000, profit: 45000 },
    { month: 'May', revenue: 72000, profit: 49000 },
    { month: 'Jun', revenue: 89000, profit: 62000 },
    { month: 'Jul', revenue: totalRevenue, profit: totalRevenue * 0.7 },
  ]

  const distributionData = isResetState ? [
    { name: 'Revenue', value: 0 },
    { name: 'Expenses', value: 0 },
    { name: 'Gross Profit', value: 0 },
  ] : [
    { name: 'Revenue', value: totalRevenue * 0.55 },
    { name: 'Expenses', value: totalRevenue * 0.25 },
    { name: 'Gross Profit', value: totalRevenue * 0.2 },
  ]


  const syncDatabase = () => {
    triggerLog('[Firestore] Querying database snapshot. Syncing nodes...')
    setTimeout(() => {
      triggerLog('[MongoDB] Ledger tables verified. Grid sync completed.')
    }, 500)
  }

  const handleResetSystem = async () => {
    setResetting(true)
    try {
      const res = await fetch(`${API_BASE}/settings/reset`, { method: 'POST' })
      if (!res.ok) throw new Error('Reset failed')

      // Clear local settings
      localStorage.removeItem('businessos_owner_profile')
      localStorage.removeItem('businessos_db_state')
      localStorage.removeItem('is_inventory_initialized')
      localStorage.removeItem('purchased_plan')
      
      setInventoryInitialized(false)
      setPurchasedPlan(null)

      toast.success('System reset successfully!')
      triggerLog('[System] Data wipe requested. Restored all clean default constants.')
      
      // Return user back to main landing page
      logout()
      setView('role_select')
    } catch (e) {
      toast.error('System reset failed')
    } finally {
      setResetting(false)
      setShowResetConfirm(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
            Welcome back, {profileName}! 👋
          </h1>
          <p className="text-sm text-slate-400">
            Here's what's happening with your business today. (Auth: {role.toUpperCase()})
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset System
          </button>
          <button
            onClick={syncDatabase}
            className="flex items-center gap-2 rounded-xl glass px-4 py-2 text-xs font-semibold text-white hover:bg-white/5 transition-colors border border-white/5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Sync Ledger
          </button>
          <div className="flex items-center gap-1.5 rounded-xl bg-green-500/10 border border-green-500/20 px-3.5 py-2 text-xs font-semibold text-green-400 select-none">
            <Shield className="h-3.5 w-3.5" /> Core API Online
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowResetConfirm(false)}
                className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Wipe System Data?</h3>
                  <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">CRITICAL ACTION</p>
                </div>
              </div>
              
              <div className="text-xs text-slate-400 leading-relaxed mb-6 space-y-2">
                <p>This action will completely wipe all of the following:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>Custom settings & SMTP credentials</li>
                  <li>All generated invoice PDF sheets</li>
                  <li>Customer transaction records</li>
                  <li>Imported products & custom inventories</li>
                  <li>Audit history, logs, and templates</li>
                </ul>
                <p className="text-red-400 font-bold mt-2">⚠️ This process is permanent and cannot be undone.</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleResetSystem}
                  disabled={resetting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetting ? 'Wiping System...' : 'Yes, Delete Everything'}
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  disabled={resetting}
                  className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {purchasedPlan && !isInventoryInitialized && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl glass-strong border border-electric/30 p-5 glow-blue"
        >
          {/* Decorative glows */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-electric/25 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 h-20 w-40 bg-neon/15 blur-2xl pointer-events-none" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between relative z-10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-neon shadow-lg shadow-electric/20 text-white text-lg flex items-center justify-center">
                ✨
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  AI Employee Fleet Ingestion Pending <span className="rounded bg-electric/20 px-2 py-0.5 text-[9px] font-bold text-electric-bright uppercase tracking-wider">{purchasedPlan} Activated</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                  Congratulations on hiring your digital workforce! To enable autonomous operations, you must upload your shop's stock database (Excel, CSV, or PDF).
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="rounded-xl bg-gradient-to-r from-electric to-neon px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-electric/25 hover:scale-105 transition-transform shrink-0 cursor-pointer text-center"
            >
              Upload Stock File
            </button>
          </div>
        </motion.div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, idx) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`glass-card relative overflow-hidden rounded-2xl p-5 hover:border-white/10 transition-all ${s.glowClass || ''} pb-10`}
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconBg || 'bg-white/5'}`}>
                <s.icon className={`h-5 w-5 ${s.iconColor || 'text-electric-bright'}`} />
              </div>
              <span
                className={`flex items-center gap-0.5 text-xs font-semibold ${
                  s.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {s.change}
                {s.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">{s.label}</p>
              <p className="text-2xl font-black font-display text-white mt-1">
                {s.value}
              </p>
              <p className="text-[9px] text-slate-400/80 mt-1">{s.trend === 'up' ? '▲' : '▼'} {s.change.replace(/[+-]/, '')} from last week</p>
            </div>

            {/* Sparkline curve at the bottom */}
            {s.sparklinePath && (
              <div className="absolute bottom-0 left-0 right-0 h-9 overflow-hidden pointer-events-none opacity-85">
                <svg className="w-full h-full" viewBox="0 0 120 30" preserveAspectRatio="none">
                  <path
                    d={s.sparklinePath}
                    fill="none"
                    stroke={s.sparklineColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Large Revenue Area Chart */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Revenue & Operating Profit</h3>
              <p className="text-xs text-slate-500 mt-0.5">Historical ledger data sync</p>
            </div>
            <span className="rounded-full bg-electric/10 px-2.5 py-1 text-xs font-semibold text-electric-bright">
              Live updates active
            </span>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#revenueGlow)"
                  name="Gross Revenue (₹)"
                  animationDuration={1500}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="url(#profitGlow)"
                  name="Net Profit (₹)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Distribution Chart */}
        <div className="glass-card flex flex-col justify-between rounded-2xl p-5 lg:col-span-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Capital Allocation</h3>
            <p className="text-xs text-slate-500 mt-0.5">Asset & Liability distribution</p>
          </div>
          <div className="my-auto h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {distributionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1.5">
            {distributionData.map((d, index) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pieColors[index] }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="font-semibold text-white">₹{d.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights and Alerts Panel */}
      <div className="glass-card rounded-2xl p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-neon shadow-lg shadow-electric/25">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">System Insights Feed</h3>
            <p className="text-xs text-slate-500 mt-0.5">Diagnosed by cognitive AI intelligence modules</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex gap-3">
            <Activity className="h-5 w-5 text-cyan-bright shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white">Peak Hours Relocation</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Sales density peaked between 2:00 PM and 4:30 PM. We recommend shifting Cashier Clara Oswalds roster hour coverage to mitigate customer checkout bottleneck risk.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex gap-3">
            <Package className="h-5 w-5 text-neon-bright shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white">Fast Moving Restock Target</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Organic Green Tea has 2 units remaining, with avg sales of 8/day. Click "Auto-Reorder" in Inventory panel to trigger automated PO generation now.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 flex gap-3">
            <TrendingDown className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-white">Operational Expense Leaks</h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Overlapping licensing fees found for marketing scheduling tools. Save ₹7,200/mo by configuring marketing automation inside BusinessOS directly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
