import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'
import { Clock, IndianRupee, TrendingUp, Layers, Percent } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Sale } from '../../services/db'

// Heatmap mock density: Hour slots (9AM to 9PM) x Day slots (Mon to Sun)
const hours = ['9AM', '11AM', '1PM', '3PM', '5PM', '7PM', '9PM']
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// mock sales matrix intensity 0-10
const heatMatrix = [
  [3, 4, 6, 8, 5, 2, 1], // Mon
  [2, 3, 5, 7, 6, 3, 2], // Tue
  [4, 5, 7, 9, 8, 4, 3], // Wed
  [3, 4, 6, 8, 7, 5, 2], // Thu
  [5, 6, 8, 9, 10, 7, 4], // Fri
  [6, 8, 10, 10, 9, 8, 6], // Sat
  [4, 6, 8, 7, 5, 4, 3], // Sun
]

const demData = [
  { name: 'Gen Z', value: 34, color: '#3b82f6' },
  { name: 'Millennials', value: 45, color: '#8b5cf6' },
  { name: 'Gen X', value: 16, color: '#22d3ee' },
  { name: 'Boomers', value: 5, color: '#e2e8f0' },
]

export default function SalesPanel() {
  const { dbState, updateDbState, triggerLog } = useApp()
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: string; val: number } | null>({
    day: 'Mon',
    hour: '1PM',
    val: 6,
  })

  // POS checkout simulator was removed

  // Simulation: add order every 15 seconds (using logs and context updates)
  useEffect(() => {
    const interval = setInterval(() => {
      // Pick random product
      const product = dbState.products[Math.floor(Math.random() * dbState.products.length)]
      const qty = Math.floor(Math.random() * 3) + 1
      const total = product.price * qty

      const customers = ['Jessica Carter', 'Ethan Hunt', 'Logan Roy', 'Walter White', 'Bruce Wayne']
      const name = customers[Math.floor(Math.random() * customers.length)]

      const newSale: Sale = {
        id: `s-${Date.now()}`,
        timestamp: new Date().toISOString(),
        productName: product.name,
        quantity: qty,
        total: total,
        customerName: name,
        products: [{ productName: product.name, quantity: qty, price: product.price }]
      }



      updateDbState((prev) => {
        const updatedSales = [newSale, ...prev.sales].slice(0, 50)
        // update product sales count
        const updatedProducts = prev.products.map((p) => {
          if (p.name === product.name) {
            return { ...p, salesCount: p.salesCount + qty, stock: Math.max(0, p.stock - qty) }
          }
          return p
        })
        return { ...prev, sales: updatedSales, products: updatedProducts }
      })

      triggerLog(`[MongoDB] Live transaction ingested: ₹${total.toLocaleString('en-IN')} from ${name}.`)
    }, 12000)

    return () => clearInterval(interval)
  }, [dbState.products, triggerLog, updateDbState])

  // Calculate dynamic sales statistics
  const salesStats = useMemo(() => {
    const sales = dbState.sales
    const products = dbState.products

    const totalOrders = sales.length + 1842 // total including mock archives
    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0) + 121215.5
    
    // Profit margin estimated around 54% average based on buying/selling cost
    const totalProfit = totalRevenue * 0.54
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
    
    // Best & Worst selling
    const sortedProducts = [...products].sort((a, b) => b.salesCount - a.salesCount)
    const bestSelling = sortedProducts.slice(0, 3)
    const worstSelling = sortedProducts.slice().reverse().slice(0, 3)

    // Today/Weekly/Monthly Sales estimates
    const todaySales = sales.reduce((sum, s) => sum + s.total, 0)
    const weeklySales = todaySales * 5 + 4800
    const monthlySales = totalRevenue * 0.25

    return {
      todaySales,
      weeklySales,
      monthlySales,
      totalOrders,
      totalRevenue,
      totalProfit,
      avgOrderValue,
      bestSelling,
      worstSelling
    }
  }, [dbState.sales, dbState.products])

  // Get color intensity for heatmap cell
  const getCellColor = (intensity: number) => {
    if (intensity <= 2) return 'bg-base-200 border-white/5'
    if (intensity <= 4) return 'bg-electric/20 border-electric/30 text-electric-bright'
    if (intensity <= 6) return 'bg-electric/40 border-electric/50 text-white'
    if (intensity <= 8) return 'bg-neon/60 border-neon/70 text-white'
    return 'bg-cyan/80 border-cyan text-base font-bold'
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
          AI Sales Analyzer
        </h1>
        <p className="text-sm text-slate-400">
          Live POS tracking, purchase demographics patterns, and peak operations forecasting.
        </p>
      </div>

      {/* KPI Sales Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all">
          <div className="flex justify-between items-center">
            <div className="h-9 w-9 bg-green-500/10 text-green-400 rounded-xl flex items-center justify-center">
              <IndianRupee className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-green-400 font-bold uppercase">Today</span>
          </div>
          <p className="text-xl font-bold text-white font-mono mt-3">₹{salesStats.todaySales.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">Real-time POS revenue</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all">
          <div className="flex justify-between items-center">
            <div className="h-9 w-9 bg-electric/10 text-electric-bright rounded-xl flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-electric-bright font-bold uppercase">Weekly</span>
          </div>
          <p className="text-xl font-bold text-white font-mono mt-3">₹{salesStats.weeklySales.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">Last 7 rolling days sales</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all">
          <div className="flex justify-between items-center">
            <div className="h-9 w-9 bg-neon/10 text-neon-bright rounded-xl flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-neon-bright font-bold uppercase">Monthly</span>
          </div>
          <p className="text-xl font-bold text-white font-mono mt-3">₹{salesStats.monthlySales.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">Calendar month projection</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all">
          <div className="flex justify-between items-center">
            <div className="h-9 w-9 bg-cyan/10 text-cyan-bright rounded-xl flex items-center justify-center">
              <Percent className="h-5 w-5" />
            </div>
            <span className="text-[10px] text-cyan-bright font-bold uppercase">Order Value</span>
          </div>
          <p className="text-xl font-bold text-white font-mono mt-3">₹{salesStats.avgOrderValue.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-slate-400 mt-1">Average ticket amount</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Heatmap Grid */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-8">
          <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-electric-bright" /> Hourly Customer Density Heatmap
            </h3>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              Peak Hours: 2PM - 4PM
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[480px]">
              {/* Header Hours */}
              <div className="grid grid-cols-8 gap-1 mb-2 font-mono text-[9px] text-slate-500 text-center">
                <div></div>
                {hours.map((h) => (
                  <div key={h}>{h}</div>
                ))}
              </div>

              {/* Rows */}
              <div className="space-y-1.5">
                {days.map((d, dIdx) => (
                  <div key={d} className="grid grid-cols-8 gap-1 items-center">
                    <div className="font-mono text-[10px] text-slate-400 font-semibold">{d}</div>
                    {heatMatrix[dIdx].map((val, hIdx) => {
                      const isHovered = hoveredCell && hoveredCell.day === d && hoveredCell.hour === hours[hIdx]
                      return (
                        <div
                          key={`${d}-${hIdx}`}
                          onMouseEnter={() => setHoveredCell({ day: d, hour: hours[hIdx], val })}
                          title={`Sales score: ${val}`}
                          className={`h-7 rounded flex items-center justify-center text-[10px] border ${getCellColor(
                            val
                          )} transition-all duration-300 hover:scale-105 cursor-pointer ${
                            isHovered ? 'ring-2 ring-cyan-bright scale-105 shadow-md shadow-cyan-bright/25' : ''
                          }`}
                        >
                          {val}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Telemetry panel for hovered cell */}
          <div className="mt-5 border-t border-white/5 pt-4">
            {hoveredCell ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden"
              >
                {/* Glowing neon ambient aura inside panel */}
                <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-cyan/5 blur-xl pointer-events-none" />

                <div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">Selected Slot</span>
                  <span className="text-xs font-bold text-white mt-1 block">{hoveredCell.day}s at {hoveredCell.hour}</span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">Traffic Density</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-bright" style={{ width: `${hoveredCell.val * 10}%` }} />
                    </div>
                    <span className="text-[9px] font-bold text-cyan-bright font-mono">{hoveredCell.val}/10</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">Projected Revenue</span>
                  <span className="text-xs font-bold text-white mt-1 block font-mono">₹{(hoveredCell.val * 2450).toLocaleString('en-IN')}</span>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 font-mono uppercase block">AI Staffing Suggestion</span>
                  <span className={`text-[9px] font-bold mt-1 block uppercase tracking-wider ${
                    hoveredCell.val >= 8 
                      ? 'text-red-400' 
                      : hoveredCell.val >= 5 
                      ? 'text-cyan-bright' 
                      : 'text-slate-400'
                  }`}>
                    {hoveredCell.val >= 8 
                      ? '⚡ Peak Shift: Auto-assign Drones' 
                      : hoveredCell.val >= 5 
                      ? '🤖 Standard: Idle AI chat support' 
                      : '💤 Off-peak: Queue discount campaign'}
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="p-4 rounded-xl bg-white/[0.01] border border-dashed border-white/5 text-center text-[10px] text-slate-500 font-mono">
                Hover over any day-hour slot above to view telemetry projection analysis.
              </div>
            )}
          </div>
        </div>

        {/* Demographics Buying Habits */}
        <div className="glass-card flex flex-col justify-between rounded-2xl p-5 lg:col-span-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Purchase Demographics</h3>
            <p className="text-xs text-slate-500 mt-0.5">Analysis by social profile age segments</p>
          </div>

          <div className="my-auto h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={demData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {demData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0a1020', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            {demData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px]">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-400 truncate">{d.name} ({d.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Rankings List */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Best Selling List */}
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
            🏆 Best Selling Products
          </h3>
          <div className="space-y-3">
            {salesStats.bestSelling.map((p, idx) => (
              <div key={p.id} className="flex justify-between items-center text-xs bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-500 font-mono">#{idx+1}</span>
                  <span className="h-6 w-6 rounded flex items-center justify-center bg-white/5 border border-white/5 overflow-hidden text-base shrink-0">
                    {p.image && p.image.startsWith('http') ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      p.image
                    )}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-green-400 font-bold">{p.salesCount} sold</p>
                  <p className="text-[10px] text-slate-500">Valuation: ₹{(p.salesCount * p.price).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Selling List */}
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-1.5">
            🧊 Slow Moving Products (Worst Selling)
          </h3>
          <div className="space-y-3">
            {salesStats.worstSelling.map((p, idx) => (
              <div key={p.id} className="flex justify-between items-center text-xs bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-slate-500 font-mono">#{idx+1}</span>
                  <span className="h-6 w-6 rounded flex items-center justify-center bg-white/5 border border-white/5 overflow-hidden text-base shrink-0">
                    {p.image && p.image.startsWith('http') ? (
                      <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      p.image
                    )}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-yellow-400">{p.salesCount} sold</p>
                  <p className="text-[10px] text-slate-500">In Stock: {p.stock} units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
