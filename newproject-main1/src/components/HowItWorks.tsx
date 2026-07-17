import { motion } from 'framer-motion'
import { Rocket, BrainCircuit, Settings2, BarChart3 } from 'lucide-react'

const steps = [
  {
    icon: Rocket,
    num: '01',
    title: 'Connect Your Business',
    desc: 'Link your store, inventory, finance, and customer channels in minutes. No code required.',
    color: '#3b82f6',
  },
  {
    icon: BrainCircuit,
    num: '02',
    title: 'AI Learns Your Operations',
    desc: 'Your AI employee studies your data, workflows, and patterns to understand how you work.',
    color: '#8b5cf6',
  },
  {
    icon: Settings2,
    num: '03',
    title: 'Automate Everything',
    desc: 'Deploy AI agents for inventory, invoicing, support, marketing, and predictive analytics.',
    color: '#22d3ee',
  },
  {
    icon: BarChart3,
    num: '04',
    title: 'Scale With Insights',
    desc: 'Watch your business grow with real-time AI recommendations and predictive forecasting.',
    color: '#a78bfa',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="relative z-10 px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mb-20 text-center"
        >
          <span className="mb-4 inline-block rounded-full glass px-4 py-1.5 text-xs font-medium text-neon-bright">
            How It Works
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            From setup to scale in <span className="text-gradient">four steps</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 h-full w-px bg-gradient-to-b from-electric via-neon to-cyan opacity-30 md:left-1/2" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className={`relative mb-14 flex items-start gap-6 md:mb-20 ${
                i % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Node */}
              <div className="relative z-10 flex shrink-0 items-center justify-center md:absolute md:left-1/2 md:-translate-x-1/2">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl glass-strong"
                  style={{ boxShadow: `0 0 30px ${step.color}40` }}
                >
                  <step.icon className="h-7 w-7" style={{ color: step.color }} />
                </div>
              </div>

              {/* Content */}
              <div
                className={`flex-1 md:w-[calc(50%-3rem)] ${
                  i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'
                }`}
              >
                <div className="glass-card rounded-2xl p-6">
                  <span
                    className="font-display text-3xl font-bold opacity-20"
                    style={{ color: step.color }}
                  >
                    {step.num}
                  </span>
                  <h3 className="font-display mt-1 text-xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.desc}</p>
                </div>
              </div>

              {/* Spacer for opposite side on desktop */}
              <div className="hidden md:block md:w-[calc(50%-3rem)]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
