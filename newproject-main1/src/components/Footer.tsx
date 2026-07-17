import { motion } from 'framer-motion'
import { Sparkles, AtSign, Globe, MessageCircle, ArrowUp } from 'lucide-react'

const cols = [
  { title: 'Product', links: ['Features', 'Dashboard', 'Pricing', 'Integrations', 'Changelog'] },
  { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Contact'] },
  { title: 'Resources', links: ['Documentation', 'API Reference', 'Community', 'Tutorials', 'Status'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'SOC 2', 'GDPR'] },
]

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 px-6 pt-20 pb-10">
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-electric/40 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          className="relative mb-20 overflow-hidden rounded-3xl glass-strong p-12 text-center sm:p-16"
        >
          <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-electric/20 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-neon/20 blur-[100px]" />
          <h2 className="font-display relative text-3xl font-bold text-white sm:text-5xl">
            Deploy your AI employee today.
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-slate-400">
            Join 100+ businesses running on BusinessOS AI. Start free in minutes.
          </p>
          <a
            href="#"
            className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-8 py-4 text-base font-semibold text-white shadow-xl shadow-electric/30 transition-transform hover:scale-105"
          >
            Get Started Free
          </a>
        </motion.div>

        {/* Footer grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          <div className="col-span-2">
            <a href="#" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-electric to-neon">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold text-white">
                BusinessOS<span className="text-gradient"> AI</span>
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm text-slate-500">
              The AI Employee Every Business Deserves. Run your entire operation
              with one intelligent platform.
            </p>
            <div className="mt-5 flex gap-3">
              {[AtSign, Globe, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg glass transition-colors hover:bg-white/10"
                >
                  <Icon className="h-4 w-4 text-slate-400" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-display mb-4 text-sm font-semibold text-white">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-slate-500 transition-colors hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-sm text-slate-600">
            © 2026 BusinessOS AI. All rights reserved.
          </p>
          <a
            href="#"
            className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
          >
            Back to top <ArrowUp className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
