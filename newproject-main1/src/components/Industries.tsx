import { motion } from 'framer-motion'
import {
  ShoppingBag,
  UtensilsCrossed,
  HeartPulse,
  Factory,
  GraduationCap,
  Scissors,
  Warehouse,
} from 'lucide-react'

const industries = [
  { icon: ShoppingBag, name: 'Retail', desc: 'Inventory, POS, and customer loyalty' },
  { icon: UtensilsCrossed, name: 'Restaurant', desc: 'Orders, menus, and reservations' },
  { icon: HeartPulse, name: 'Hospital', desc: 'Scheduling, billing, and patient flow' },
  { icon: Factory, name: 'Manufacturing', desc: 'Supply chain, production, and QC' },
  { icon: GraduationCap, name: 'Education', desc: 'Enrollment, courses, and grading' },
  { icon: Scissors, name: 'Salon', desc: 'Bookings, staff, and client history' },
  { icon: Warehouse, name: 'Warehouse', desc: 'Stock, logistics, and fulfillment' },
]

export default function Industries() {
  return (
    <section className="relative z-10 px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <span className="mb-4 inline-block rounded-full glass px-4 py-1.5 text-xs font-medium text-neon-bright">
            Industries
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Built for <span className="text-gradient">every business</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-400">
            From retail to healthcare, BusinessOS AI adapts to your industry.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.name}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group relative w-[160px] rounded-2xl"
            >
              <div className="glass-card flex h-full flex-col items-center rounded-2xl p-6 text-center transition-all duration-300 group-hover:border-electric/30">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-base-100 to-base-200 ring-1 ring-white/10 transition-all group-hover:ring-electric/50">
                  <ind.icon className="h-6 w-6 text-electric-bright transition-colors group-hover:text-cyan-bright" />
                </div>
                <h3 className="font-display text-sm font-semibold text-white">{ind.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{ind.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
