import { motion } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Activity,
  Zap,
  Bell,
} from 'lucide-react'

const revenueData = [
  { m: 'Jan', v: 42 }, { m: 'Feb', v: 55 }, { m: 'Mar', v: 48 },
  { m: 'Apr', v: 67 }, { m: 'May', v: 72 }, { m: 'Jun', v: 89 },
  { m: 'Jul', v: 95 }, { m: 'Aug', v: 110 }, { m: 'Sep', v: 124 },
]

const ordersData = [
  { d: 'M', v: 32 }, { d: 'T', v: 45 }, { d: 'W', v: 38 },
  { d: 'T', v: 52 }, { d: 'F', v: 68 }, { d: 'S', v: 74 }, { d: 'S', v: 59 },
]

const pieData = [
  { name: 'Revenue', value: 45, color: '#3b82f6' },
  { name: 'Expenses', value: 25, color: '#8b5cf6' },
  { name: 'Profit', value: 30, color: '#22d3ee' },
]

const insights = [
  { icon: TrendingUp, text: 'Revenue up 28% this month — driven by repeat customers', color: '#22d3ee' },
  { icon: Zap, text: 'Restock electronics in 3 days — predicted shortage', color: '#3b82f6' },
  { icon: Activity, text: 'Peak hours shifting to 2–4 PM, adjust staffing', color: '#8b5cf6' },
]

const stats = [
  { icon: DollarSign, label: 'Revenue', value: '$124.5K', change: '+28%' },
  { icon: ShoppingCart, label: 'Orders', value: '1,847', change: '+12%' },
  { icon: Package, label: 'Inventory', value: '3,209', change: '-3%' },
  { icon: Users, label: 'Employees', value: '24', change: '+2' },
]

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg glass-strong px-3 py-2 text-xs text-white">
      {payload[0].value}
    </div>
  )
}

export default function DashboardPreview() {
  return (
    <section id="dashboard" className="relative z-10 px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-block rounded-full glass px-4 py-1.5 text-xs font-medium text-cyan-bright">
            Dashboard Preview
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Your entire business, <span className="text-gradient">in one view</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Real-time analytics, AI predictions, and live insights — all in a
            futuristic command center.
          </p>
        </motion.div>

        {/* Floating dashboard panel */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: 1200 }}
          className="relative"
        >
          <div className="glass-strong relative overflow-hidden rounded-3xl p-6 shadow-2xl glow-blue sm:p-8">
            {/* Top bar */}
            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-red-400/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                  <span className="h-3 w-3 rounded-full bg-green-400/70" />
                </div>
                <span className="ml-2 text-sm font-medium text-slate-400">
                  businessos.ai / dashboard
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="h-4 w-4 text-slate-400" />
                  <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-cyan-bright animate-pulse-glow" />
                </div>
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-electric to-neon" />
              </div>
            </div>

            {/* Stat cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
                      <s.icon className="h-4 w-4 text-electric-bright" />
                    </div>
                    <span className="text-xs font-medium text-green-400">{s.change}</span>
                  </div>
                  <p className="font-display text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Revenue area chart */}
              <div className="glass-card rounded-xl p-5 lg:col-span-2">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">Revenue & Cash Flow</h4>
                  <span className="rounded-full bg-electric/10 px-2.5 py-1 text-xs text-electric-bright">
                    +28% MoM
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="m" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="v"
                      stroke="#60a5fa"
                      strokeWidth={2}
                      fill="url(#rev)"
                      animationDuration={1800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* 3D-feel pie chart */}
              <div className="glass-card rounded-xl p-5">
                <h4 className="mb-4 text-sm font-semibold text-white">Cash Distribution</h4>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 flex justify-center gap-3">
                  {pieData.map((p) => (
                    <div key={p.name} className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                      <span className="text-xs text-slate-400">{p.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orders bar chart */}
              <div className="glass-card rounded-xl p-5">
                <h4 className="mb-4 text-sm font-semibold text-white">Weekly Orders</h4>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={ordersData}>
                    <defs>
                      <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="d" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="v" fill="url(#bar)" radius={[4, 4, 0, 0]} animationDuration={1500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Insights */}
              <div className="glass-card rounded-xl p-5 lg:col-span-2">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-electric to-neon">
                    <Zap className="h-3.5 w-3.5 text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">AI Insights & Predictions</h4>
                </div>
                <div className="space-y-3">
                  {insights.map((ins, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.12 }}
                      className="flex items-start gap-3 rounded-lg bg-white/[0.02] p-3"
                    >
                      <ins.icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ins.color }} />
                      <p className="text-sm text-slate-300">{ins.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating accent cards */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-6 -top-6 hidden glass-strong rounded-2xl p-4 glow-cyan lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan/20">
                <TrendingUp className="h-5 w-5 text-cyan-bright" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-white">98%</p>
                <p className="text-xs text-slate-400">Automation</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-6 -left-6 hidden glass-strong rounded-2xl p-4 glow-purple lg:block"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon/20">
                <Zap className="h-5 w-5 text-neon-bright" />
              </div>
              <div>
                <p className="font-display text-lg font-bold text-white">24/7</p>
                <p className="text-xs text-slate-400">AI Active</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
