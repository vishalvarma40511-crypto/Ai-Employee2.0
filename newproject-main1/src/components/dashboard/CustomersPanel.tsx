import { useState, useMemo } from 'react'
import {
  Star,
  Search,
  MessageSquare,
  Heart
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

// Custom word cloud weights for review themes
const feedbackWords = [
  { word: 'crystal clear', weight: 'text-base font-bold text-green-300 animate-pulse-glow' },
  { word: 'lightning delivery', weight: 'text-xs text-cyan-400 font-semibold' },
  { word: 'sleek finish', weight: 'text-sm font-semibold text-green-400' },
  { word: 'premium pack', weight: 'text-xs text-yellow-400' },
  { word: 'comfy fit', weight: 'text-sm text-cyan-400' },
  { word: 'high fidelity', weight: 'text-base font-semibold text-cyan-bright' },
  { word: 'sturdy', weight: 'text-xs text-slate-500' }
]

export default function CustomersPanel() {
  const { dbState } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All')

  // Extract customer product reviews from sales database
  const reviews = useMemo(() => {
    return dbState.sales
      .filter((sale) => sale.rating !== undefined && sale.review !== undefined)
      .map((sale) => ({
        id: sale.id,
        customerName: sale.customerName,
        productName: sale.productName,
        rating: sale.rating || 5,
        review: sale.review || '',
        date: sale.timestamp.split('T')[0]
      }))
  }, [dbState.sales])

  // Filter reviews based on selection and search
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const matchesSearch = 
        r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.review.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesRating = ratingFilter === 'All' || r.rating === ratingFilter
      return matchesSearch && matchesRating
    })
  }, [reviews, searchQuery, ratingFilter])

  // Calculate statistics
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, total: 0, breakdown: [0,0,0,0,0] }
    const total = reviews.length
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    const avg = sum / total

    const breakdown = [0, 0, 0, 0, 0] // index 0 for 1 star, index 4 for 5 star
    reviews.forEach((r) => {
      const index = Math.min(Math.max(r.rating - 1, 0), 4)
      breakdown[index]++
    })

    return {
      avg: Number(avg.toFixed(1)),
      total,
      breakdown: breakdown.reverse() // returns order [5-stars count, 4-stars count, ..., 1-star count]
    }
  }, [reviews])

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-0.5 text-yellow-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-slate-600'}`}
          />
        ))}
      </div>
    )
  }

  // Get letter initial for customer avatar
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-2">
          Customer Product Reviews <Heart className="h-6 w-6 text-red-500 fill-red-500 animate-pulse" />
        </h1>
        <p className="text-sm text-slate-400">
          Track customer reviews, star ratings, and product feedback summaries straight from real POS checkouts.
        </p>
      </div>

      {/* Aggregate Statistics Overview */}
      <div className="grid gap-6 sm:grid-cols-12">
        {/* Rating Breakdown circle */}
        <div className="glass-card rounded-2xl p-5 sm:col-span-4 flex flex-col items-center justify-center text-center border border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Average Score</span>
          <div className="relative flex items-center justify-center h-24 w-24 rounded-full border-4 border-electric/30 mt-3 shadow-lg glow-blue">
            <span className="text-3xl font-extrabold text-white font-mono">{stats.avg}</span>
          </div>
          <div className="mt-3.5 space-y-1">
            {renderStars(Math.round(stats.avg))}
            <p className="text-[10px] text-slate-400">Calculated from {stats.total} live purchase reviews</p>
          </div>
        </div>

        {/* Breakdown bar graph */}
        <div className="glass-card rounded-2xl p-5 sm:col-span-5 flex flex-col justify-between border border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Score Distribution</span>
          <div className="space-y-2">
            {stats.breakdown.map((count, idx) => {
              const stars = 5 - idx
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <span className="w-10 font-mono text-slate-400 text-right">{stars} Star</span>
                  <div className="flex-1 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-yellow-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-6 font-mono text-slate-300 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Keywords theme box */}
        <div className="glass-card rounded-2xl p-5 sm:col-span-3 flex flex-col justify-between border border-white/5">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Popular Themes</span>
            <p className="text-[9px] text-slate-500">Highlighted in product remarks</p>
          </div>
          <div className="my-2 flex flex-wrap gap-2.5 justify-center">
            {feedbackWords.map((item, idx) => (
              <span key={idx} className={`px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 ${item.weight}`}>
                {item.word}
              </span>
            ))}
          </div>
          <span className="text-[9px] text-slate-400 text-center font-mono">Feedback health: EXCELLENT</span>
        </div>
      </div>

      {/* Directory & Filters */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4">
          <h3 className="text-sm font-semibold text-white">Reviews Log Ledger</h3>

          {/* Filtering selectors */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, buyers..."
                className="bg-slate-900 rounded-xl border border-white/5 text-xs text-white pl-8 pr-3 py-1.5 focus:outline-none focus:border-electric w-[180px] sm:w-[220px]"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            </div>

            {/* Rating Dropdown */}
            <select
              value={ratingFilter}
              onChange={(e: any) => setRatingFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              className="bg-slate-900 rounded-xl border border-white/5 text-xs text-slate-200 px-3 py-1.5 focus:outline-none focus:border-electric cursor-pointer"
            >
              <option value="All">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((rev) => (
              <div 
                key={rev.id} 
                className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between hover:border-white/10 transition-all hover:bg-white/[0.01]"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3 border-b border-white/[0.03] pb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-electric/20 border border-electric/30 flex items-center justify-center font-bold text-xs text-electric-bright select-none">
                        {getInitials(rev.customerName)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white leading-tight">{rev.customerName}</h4>
                        <span className="text-[9px] text-slate-500 font-mono">Date: {rev.date}</span>
                      </div>
                    </div>
                    {renderStars(rev.rating)}
                  </div>

                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{rev.review}"
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 mt-4 pt-3.5 border-t border-white/5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 text-cyan-bright" /> {rev.productName}
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                    rev.rating >= 4 
                      ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                      : rev.rating === 3 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400 animate-pulse'
                  }`}>
                    {rev.rating >= 4 ? 'Positive' : rev.rating === 3 ? 'Neutral' : 'Negative'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-2xl bg-white/[0.01] border border-dashed border-white/5 py-12 text-center text-xs italic text-slate-500">
              No matching reviews discovered for "{searchQuery}". Try selecting alternative filters.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
