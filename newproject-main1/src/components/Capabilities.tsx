import { motion } from 'framer-motion'
import {
  Mic,
  Boxes,
  LineChart,
  Banknote,
  Megaphone,
  MessageSquare,
  Workflow,
  Brain,
} from 'lucide-react'

const caps = [
  { icon: Mic, title: 'Voice AI', desc: 'Natural voice commands and responses. Talk to your business like a colleague.', tag: 'Speech' },
  { icon: Boxes, title: 'Inventory AI', desc: 'Real-time stock tracking with predictive reordering and demand forecasting.', tag: 'Operations' },
  { icon: LineChart, title: 'Analytics AI', desc: 'Deep insights, anomaly detection, and predictive trends across all metrics.', tag: 'Intelligence' },
  { icon: Banknote, title: 'Finance AI', desc: 'Automated invoicing, expense tracking, and cash flow optimization.', tag: 'Money' },
  { icon: Megaphone, title: 'Marketing AI', desc: 'Generate campaigns, social posts, and ad creative that converts.', tag: 'Growth' },
  { icon: MessageSquare, title: 'Support AI', desc: '24/7 customer agent resolving tickets across every channel.', tag: 'CX' },
  { icon: Workflow, title: 'Workflow AI', desc: 'Build multi-step automations that chain AI agents together.', tag: 'Automation' },
  { icon: Brain, title: 'Strategy AI', desc: 'Get AI-powered business recommendations and growth roadmaps.', tag: 'Planning' },
]

export default function Capabilities() {
  return (
    <section id="capabilities" className="relative z-10 px-6 py-32">
      {/* Aurora backdrop */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon/10 blur-[150px]" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-block rounded-full glass px-4 py-1.5 text-xs font-medium text-electric-bright">
            AI Capabilities
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Eight AI agents. <span className="text-gradient">One platform.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            Each capability is a specialized AI agent that can work independently or
            collaborate with the others.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {caps.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-2xl"
            >
              <div className="glass-card relative h-full rounded-2xl p-6 transition-all duration-300 group-hover:border-electric/30">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-base-100 to-base-200 ring-1 ring-white/10 transition-all group-hover:ring-electric/40">
                    <cap.icon className="h-5 w-5 text-electric-bright transition-colors group-hover:text-cyan-bright" />
                  </div>
                  <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                    {cap.tag}
                  </span>
                </div>
                <h3 className="font-display mb-1.5 text-base font-semibold text-white">
                  {cap.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">{cap.desc}</p>
                {/* Hover glow line */}
                <div className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-electric to-transparent transition-all duration-500 group-hover:w-full" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
