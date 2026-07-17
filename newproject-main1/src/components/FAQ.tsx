import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

const faqs = [
  {
    q: 'What exactly is an "AI Employee"?',
    a: 'An AI Employee is a dedicated AI agent that learns your business operations and handles tasks across inventory, finance, customer support, marketing, and analytics — working 24/7 alongside your team.',
  },
  {
    q: 'How long does it take to set up?',
    a: 'Most businesses are up and running in under 15 minutes. Connect your existing tools, and your AI employee starts learning immediately. No technical knowledge required.',
  },
  {
    q: 'Is my business data secure?',
    a: 'Yes. We use end-to-end encryption, are SOC 2 compliant, and you retain full ownership of your data. We never train shared models on your private business data.',
  },
  {
    q: 'Can the AI really replace human employees?',
    a: 'It augments your team by automating repetitive tasks — invoicing, support tickets, inventory tracking, reporting. This frees your people to focus on strategy and growth. Most customers automate 90%+ of routine work.',
  },
  {
    q: 'What tools does it integrate with?',
    a: 'BusinessOS AI connects with 200+ tools including Shopify, Stripe, QuickBooks, Slack, Gmail, HubSpot, and more. Custom integrations are available on Enterprise plans.',
  },
  {
    q: 'What if I need more AI actions?',
    a: 'You can upgrade your plan anytime, or purchase additional action packs. Enterprise plans include unlimited AI actions with dedicated infrastructure.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="relative z-10 px-6 py-32">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-block rounded-full glass px-4 py-1.5 text-xs font-medium text-electric-bright">
            FAQ
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Questions, <span className="text-gradient">answered</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="overflow-hidden rounded-2xl glass-card"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left"
              >
                <span className="font-display text-base font-medium text-white">{faq.q}</span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5"
                >
                  <Plus className="h-4 w-4 text-electric-bright" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
