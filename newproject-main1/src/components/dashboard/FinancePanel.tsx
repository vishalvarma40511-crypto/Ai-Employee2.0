import { useState, useMemo } from 'react'
import {
  Wallet,
  Calculator,
  Percent,
  Coins,
  BrainCircuit,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

export default function FinancePanel() {
  const { role, triggerLog } = useApp()

  // Calculator inputs
  const [projectedRevenue, setProjectedRevenue] = useState(150000)
  const [cogs, setCogs] = useState(60000)
  const [marketing, setMarketing] = useState(15000)
  const [salaries, setSalaries] = useState(35000)
  const [rent, setRent] = useState(12000)

  // Tax inputs
  const [businessType, setBusinessType] = useState<'Retail' | 'Restaurant' | 'Medical' | 'Services'>('Retail')
  const [gstRate, setGstRate] = useState(18) // GST percentage

  // Memoized financial formulas
  const calculations = useMemo(() => {
    const grossProfit = projectedRevenue - cogs
    const operatingExpenses = marketing + salaries + rent
    const netProfit = grossProfit - operatingExpenses
    const margin = projectedRevenue > 0 ? (netProfit / projectedRevenue) * 100 : 0

    // Tax calculation
    const estimatedGst = projectedRevenue * (gstRate / 100)
    // Assume 20% flat corporate tax rate on positive net profit
    const incomeTaxRate = 0.20
    const estimatedIncomeTax = netProfit > 0 ? netProfit * incomeTaxRate : 0
    const postTaxProfit = netProfit - estimatedIncomeTax

    // Health score formula (from 0 to 100)
    let healthScore = 50
    if (margin > 0) healthScore += margin * 1.5
    if (netProfit > 50000) healthScore += 15
    if (operatingExpenses < grossProfit * 0.5) healthScore += 10
    healthScore = Math.min(Math.max(Math.round(healthScore), 10), 100)

    return {
      grossProfit,
      operatingExpenses,
      netProfit,
      margin,
      estimatedGst,
      estimatedIncomeTax,
      postTaxProfit,
      healthScore,
    }
  }, [projectedRevenue, cogs, marketing, salaries, rent, gstRate])

  // Dynamic AI advice
  const aiFinancialAdvice = useMemo(() => {
    const { margin, netProfit, healthScore } = calculations
    if (netProfit <= 0) {
      return {
        title: 'ALERT: Deficit Risk Warning',
        text: 'Your simulated business is operating at a net loss. We recommend a 25% reduction in marketing budgets and auditing warehouse storage overstock to free up liquid cash immediately.',
        type: 'critical',
      }
    }
    if (margin < 15) {
      return {
        title: 'WARNING: Thin Margins Diagnosed',
        text: 'Your current profit margin is low. Consider consolidating item suppliers for Groceries/Apparel categories to lower COGS, or increase retail price offsets by 5-10% to establish safer cash buffers.',
        type: 'warning',
      }
    }
    if (healthScore > 85) {
      return {
        title: 'STRATEGY: Capital Expansion Blueprint',
        text: 'Excellent fiscal health score. Cash flow parameters indicate strong reinvestment capabilities. We recommend allocating ₹10,000 into Automated Customer Campaigns (Instagram/WhatsApp) to capture Q3 demand peaks.',
        type: 'success',
      }
    }
    return {
      title: 'STABLE: Growth Phase Identified',
      text: 'Business maintains stable net profit margins. Continue monitor shift roster optimization to reduce salary leakage. Cash flow remains positive and GST payments are fully structured.',
      type: 'stable',
    }
  }, [calculations])

  const handleAuditTax = () => {
    triggerLog(
      `[Firestore] Saved tax ledger for ${businessType} business type. GST: ₹${calculations.estimatedGst.toFixed(
        2
      )}. Income Tax: ₹${calculations.estimatedIncomeTax.toFixed(2)}`
    )
  }

  const handleDownloadReport = () => {
    const reportText = `==================================================
QUANTUM BUSINESSOS - MONTHLY FINANCIAL REPORT
==================================================
Month: June 2026
Generated: ${new Date().toLocaleDateString()}
Status: Complete & Audited

FINANCIAL SIMULATION METRICS:
----------------------------------
PROJECTED SALES REVENUE : ₹${projectedRevenue.toLocaleString('en-IN')}
COST OF GOODS SOLD (COGS) : ₹${cogs.toLocaleString('en-IN')}
GROSS PROFIT            : ₹${calculations.grossProfit.toLocaleString('en-IN')}
OPERATING EXPENSES      : ₹${calculations.operatingExpenses.toLocaleString('en-IN')}
  - MARKETING BUDGET    : ₹${marketing.toLocaleString('en-IN')}
  - SALARIES            : ₹${salaries.toLocaleString('en-IN')}
  - RENT & UTILITIES    : ₹${rent.toLocaleString('en-IN')}

NET PROFITABILITY:
----------------------------------
ESTIMATED NET PROFIT    : ₹${calculations.netProfit.toLocaleString('en-IN')}
PROFIT MARGIN           : ${calculations.margin.toFixed(1)}%
BUSINESS HEALTH SCORE   : ${calculations.healthScore}/100

TAXATION ESTIMATION (GST Rate: ${gstRate}%):
----------------------------------
ESTIMATED GST OUTPUT    : ₹${calculations.estimatedGst.toLocaleString('en-IN')}
ESTIMATED INCOME TAX    : ₹${calculations.estimatedIncomeTax.toLocaleString('en-IN')}
POST-TAX PROFIT         : ₹${calculations.postTaxProfit.toLocaleString('en-IN')}

AI FINANCIAL ADVISORY DIRECTIVE:
----------------------------------
Title: ${aiFinancialAdvice.title}
Directive: ${aiFinancialAdvice.text}
==================================================
Report verified by Autonomous Ledger Engines.
==================================================`

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'monthly_financial_report_june_2026.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    triggerLog('[System] Monthly Financial Report downloaded.')
  }

  const isReadOnly = role === 'cashier'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
          AI Finance Manager
        </h1>
        <p className="text-sm text-slate-400">
          Automate accounting, audit tax sheets, and analyze profit projections in real-time.
        </p>
      </div>

      {/* Stats Summary row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 border border-green-500/20">
            <Coins className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-white">
              ₹{calculations.netProfit.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-400 mt-1">Projected Net Profit</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric/10 border border-electric/20">
            <Percent className="h-6 w-6 text-electric-bright" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-white">
              {calculations.margin.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Profit Margin</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon/10 border border-neon/20">
            <Wallet className="h-6 w-6 text-neon-bright" />
          </div>
          <div>
            <p className="text-2xl font-bold font-display text-white">
              {calculations.healthScore}/100
            </p>
            <p className="text-xs text-slate-400 mt-1">Business Health Score</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Profit Loss Interactive Calculator */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-6">
          <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Calculator className="h-4 w-4 text-electric-bright" />
              Profit & Loss Simulator
            </h3>
            {isReadOnly && (
              <span className="text-[10px] text-yellow-400 border border-yellow-400/20 bg-yellow-400/5 px-2 py-0.5 rounded">
                Read Only (Cashier)
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Projected Sales Revenue</span>
                <span className="text-white">₹{projectedRevenue.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="500000"
                step="5000"
                disabled={isReadOnly}
                value={projectedRevenue}
                onChange={(e) => setProjectedRevenue(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-electric"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Cost of Goods Sold (COGS)</span>
                <span className="text-white">₹{cogs.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="2500"
                disabled={isReadOnly}
                value={cogs}
                onChange={(e) => setCogs(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-electric"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Marketing & Advertising Budget</span>
                <span className="text-white">₹{marketing.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="0"
                max="80000"
                step="1000"
                disabled={isReadOnly}
                value={marketing}
                onChange={(e) => setMarketing(Number(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-electric"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Employee Salaries</label>
                <input
                  type="number"
                  disabled={isReadOnly}
                  value={salaries}
                  onChange={(e) => setSalaries(Number(e.target.value))}
                  className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase">Rent & Utilities</label>
                <input
                  type="number"
                  disabled={isReadOnly}
                  value={rent}
                  onChange={(e) => setRent(Number(e.target.value))}
                  className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tax Estimation Widget */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-6">
          <h3 className="text-sm font-semibold text-white mb-4 border-b border-white/5 pb-3">
            Tax Matrix & GST Estimator
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Business Category</label>
              <select
                value={businessType}
                onChange={(e: any) => setBusinessType(e.target.value)}
                className="w-full bg-base rounded-xl glass py-2.5 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1"
              >
                <option value="Retail">Retail Store (18% GST)</option>
                <option value="Restaurant">Restaurant (5% GST)</option>
                <option value="Medical">Pharmacy / Medical (12% GST)</option>
                <option value="Services">Consulting / Software (18% GST)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Custom GST Rate (%)</label>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1"
              />
            </div>
          </div>

          <div className="mt-5 space-y-2 border-t border-white/5 pt-4">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Estimated GST Output (on Sales)</span>
              <span className="font-semibold text-white">₹{calculations.estimatedGst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Corporate Income Tax (20% of net profit)</span>
              <span className="font-semibold text-white">₹{calculations.estimatedIncomeTax.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-white/5 pt-2 font-bold">
              <span className="text-cyan-bright">Post-Tax Profit Projection</span>
              <span className="text-cyan-bright">₹{calculations.postTaxProfit.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handleAuditTax}
            className="w-full rounded-xl bg-white/5 border border-white/10 py-2.5 text-center text-xs font-semibold text-white hover:bg-white/10 transition-all mt-6"
          >
            Audit GST & Sync Ledger
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Dynamic AI Financial Advice Card */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-electric to-neon shadow-lg shadow-electric/25">
              <BrainCircuit className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-white">AI Financial Advisory</h3>
          </div>

          <div className="flex-1">
            <h4
              className={`text-xs font-bold ${
                aiFinancialAdvice.type === 'critical'
                  ? 'text-red-400'
                  : aiFinancialAdvice.type === 'warning'
                  ? 'text-yellow-400'
                  : 'text-green-400'
              }`}
            >
              {aiFinancialAdvice.title}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
              {aiFinancialAdvice.text}
            </p>
            
            {/* AI conversational explainer */}
            <div className="mt-4 border-t border-white/5 pt-3">
              <span className="text-[10px] font-bold text-cyan-bright uppercase tracking-wider block">AI Simple Language Explainer</span>
              <p className="text-xs text-slate-300 italic mt-1.5 leading-relaxed">
                "Your profit increased by 18.2% this month because snack sales improved and automated WhatsApp marketing campaigns targeted inactive buyers."
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white/[0.01] border border-white/5 p-3 text-[10px] text-slate-500 mt-4 leading-normal">
            <strong>Disclaimer:</strong> Financial advice is automatically compiled from simulated projection models and should be evaluated against local jurisdictional tax laws.
          </div>
        </div>

        {/* Daily Summary & Pending Payments */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
            <h3 className="text-sm font-semibold text-white">Daily Summary & Pending Payments</h3>
            <span className="text-[10px] text-yellow-400 font-mono font-semibold">2 Payments Pending</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Daily Summary */}
            <div className="rounded-xl bg-white/[0.01] border border-white/5 p-3 text-xs">
              <p className="font-semibold text-white mb-2">Today's Financial Summary</p>
              <div className="space-y-1 text-slate-400">
                <div className="flex justify-between">
                  <span>Gross Income:</span>
                  <span className="font-mono text-white">₹3,284.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Operating Cost:</span>
                  <span className="font-mono text-white">₹650.00</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-1 mt-1 font-bold">
                  <span className="text-green-400">Net Flow:</span>
                  <span className="font-mono text-green-400">+₹2,634.00</span>
                </div>
              </div>
            </div>

            {/* Pending Payments */}
            <div className="rounded-xl bg-white/[0.01] border border-white/5 p-3 text-xs">
              <p className="font-semibold text-white mb-2">Pending Supplier Payments</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <div>
                    <p className="text-white font-medium truncate max-w-[80px]">Silicon Ingest</p>
                    <p className="text-[9px] text-slate-500">Due in 5 days</p>
                  </div>
                  <span className="font-mono font-bold text-yellow-400">₹1,250.00</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <div>
                    <p className="text-white font-medium truncate max-w-[80px]">Universal Foods</p>
                    <p className="text-[9px] text-slate-500">Due in 12 days</p>
                  </div>
                  <span className="font-mono font-bold text-yellow-400">₹4,800.00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Report Link */}
          <div className="rounded-xl bg-gradient-to-r from-electric/15 to-neon/15 border border-electric/25 p-3 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white">Monthly Financial Report</p>
              <p className="text-[10px] text-slate-400 mt-0.5">June 2026 accounting ledger compilation is complete.</p>
            </div>
            <button 
              onClick={handleDownloadReport}
              className="rounded bg-electric px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-electric-bright transition-colors cursor-pointer"
            >
              Download PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
