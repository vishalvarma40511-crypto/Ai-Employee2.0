import { motion } from 'framer-motion'
import {
  Bot,
  Boxes,
  TrendingUp,
  Wallet,
  Megaphone,
  Headphones,
  Workflow,
  ShieldCheck,
} from 'lucide-react'
import TiltCard from './TiltCard'

const features = [
  {
    icon: Bot,
    title: 'AI Employee',
    desc: 'A dedicated AI agent that learns your business and handles operations 24/7.',
    color: 'from-electric to-neon',
    glow: 'rgba(59,130,246,0.2)',
  },
  {
    icon: Boxes,
    title: 'Smart Inventory',
    desc: 'Auto-track stock, predict demand, and reorder before you run out.',
    color: 'from-cyan to-electric',
    glow: 'rgba(34,211,238,0.2)',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Analytics',
    desc: 'Forecast sales, spot trends, and get AI insights before they happen.',
    color: 'from-neon to-cyan',
    glow: 'rgba(139,92,246,0.2)',
  },
  {
    icon: Wallet,
    title: 'Finance Automation',
    desc: 'Generate invoices, track cash flow, and automate accounting end-to-end.',
    color: 'from-electric to-cyan',
    glow: 'rgba(59,130,246,0.2)',
  },
  {
    icon: Megaphone,
    title: 'Marketing AI',
    desc: 'Create campaigns, write copy, and design assets in seconds.',
    color: 'from-neon to-electric',
    glow: 'rgba(139,92,246,0.2)',
  },
  {
    icon: Headphones,
    title: 'Customer Support',
    desc: 'AI agents answer questions, resolve tickets, and delight customers.',
    color: 'from-cyan to-neon',
    glow: 'rgba(34,211,238,0.2)',
  },
  {
    icon: Workflow,
    title: 'Workflow Engine',
    desc: 'Chain AI tasks into powerful automations across your entire stack.',
    color: 'from-electric to-neon',
    glow: 'rgba(59,130,246,0.2)',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    desc: 'SOC 2 compliant, end-to-end encryption, and full data ownership.',
    color: 'from-neon to-cyan',
    glow: 'rgba(139,92,246,0.2)',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function Features() {
  return (
    <section id="features" className="relative z-10 px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full glass px-4 py-1.5 text-xs font-medium text-cyan-bright">
            Features
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Everything your business needs,
            <br />
            <span className="text-gradient">powered by AI</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            One platform that replaces a dozen tools. Each capability is an AI agent
            that works alongside your team.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={item}>
              <TiltCard className="group h-full rounded-2xl" glowColor={f.glow}>
                <div className="glass-card relative h-full overflow-hidden rounded-2xl p-6 transition-all duration-300 group-hover:border-white/15">
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} shadow-lg`}
                  >
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display mb-2 text-lg font-semibold text-white">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-cyan-bright opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Learn more
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
