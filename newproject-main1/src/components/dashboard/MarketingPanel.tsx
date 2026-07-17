import { useState, useEffect } from 'react'
import {
  Sparkles,
  Calendar,
  MessageSquare,
  Mail,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  UploadCloud,
  Check
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { MarketingCampaign } from '../../services/db'

const InstagramIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)

const FacebookIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
)

const TwitterIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </svg>
)

const platforms = [
  { name: 'Instagram', icon: InstagramIcon, color: 'from-pink-500 to-purple-600' },
  { name: 'Facebook', icon: FacebookIcon, color: 'from-blue-600 to-indigo-700' },
  { name: 'WhatsApp', icon: MessageSquare, color: 'from-green-500 to-emerald-600' },
  { name: 'X / Twitter', icon: TwitterIcon, color: 'from-gray-800 to-black' },
  { name: 'Email', icon: Mail, color: 'from-blue-500 to-sky-600' },
  { name: 'SMS', icon: MessageSquare, color: 'from-orange-500 to-red-600' },
]

export default function MarketingPanel() {
  const { dbState, updateDbState, triggerLog, addNotification } = useApp()
  const [selectedPlatform, setSelectedPlatform] = useState('Instagram')
  const [prompt, setPrompt] = useState('Summer Clearance Sale 20% Off')
  const [holiday, setHoliday] = useState('Summer Peak')
  const [generating, setGenerating] = useState(false)
  const [mediaFormat, setMediaFormat] = useState<'poster' | 'video'>('poster')

  // Direct Auto-Upload API Statuses
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [uploadComplete, setUploadComplete] = useState(false)

  // Mock Video Player State
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)

  // Store Brand Config states
  const [instagramLink, setInstagramLink] = useState('https://instagram.com/quantumstore')
  const [whatsAppNumber, setWhatsAppNumber] = useState('+919876543210')
  const [facebookLink, setFacebookLink] = useState('https://facebook.com/quantumstore')
  const [twitterLink, setTwitterLink] = useState('https://twitter.com/quantumstore')

  // AI Generated output state
  const [generatedOutput, setGeneratedOutput] = useState<{
    title: string
    copy: string
    hashtags: string
    reelsIdea: string
    imagePrompt: string
  } | null>({
    title: 'Summer Tech Splash',
    copy: 'Upgrade your audio game! Grab the Wireless Earbuds X1 today and enjoy 20% off. Use code: TECHSUMMER.\n\n👉 Click the link in my bio to buy: https://instagram.com/quantumstore',
    hashtags: '#audiophile #techlife #summerstyle #deals',
    reelsIdea: 'Reel/TikTok Hook: Drop the earbuds in front of a slow-mo neon water splash. Transition immediately to details showing 20% discount code overlay.',
    imagePrompt: 'Futuristic wireless earbuds floating in neon blue splash background, cinematic lighting',
  })

  // Simulated Video Player Timeline increment loop
  useEffect(() => {
    let interval: any
    if (isPlaying) {
      interval = setInterval(() => {
        setVideoProgress((prev) => (prev >= 100 ? 0 : prev + 2))
      }, 150)
    } else {
      clearInterval(interval)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  // Map Holiday to background image templates
  const getEventBackground = (themeName: string) => {
    switch (themeName) {
      case 'Summer Peak':
        return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400&h=600'
      case 'Black Friday':
        return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=400&h=600'
      case 'New Year Special':
        return 'https://images.unsplash.com/photo-1531685250084-75a72287bb3c?auto=format&fit=crop&q=80&w=400&h=600'
      case 'Spring Fresh':
        return 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=400&h=600'
      case 'Regular Alert':
      default:
        return 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=400&h=600'
    }
  }

  const themeBg = getEventBackground(holiday)

  // Trigger campaign generation
  const handleGenerate = () => {
    setGenerating(false)
    setGenerating(true)
    setUploadComplete(false)
    triggerLog(`[AI Creative] Starting content synthesis for ${selectedPlatform} Prompt: "${prompt}"...`)

    setTimeout(() => {
      const isCustom = prompt.trim().length > 0
      const subject = isCustom ? prompt : 'Festival Clearance'

      let generatedCopy = ''
      if (selectedPlatform === 'Instagram') {
        generatedCopy = `🔥 EXCLUSIVE DEAL: We are launching our ${holiday} Campaign! Save big on fast-moving inventories. Code: BUSINESSOS${holiday.toUpperCase().replace(/\s/g, '').substring(0, 6)}.\n\n👉 Click the link in my bio to buy: ${instagramLink}`
      } else if (selectedPlatform === 'WhatsApp') {
        generatedCopy = `📲 CUSTOMER BULLETIN: ${holiday} offers are live! Connect with me on WhatsApp directly to place your order: https://wa.me/${whatsAppNumber.replace(/\s+/g, '')}. Promo Code: OS${holiday.toUpperCase().substring(0,4)}.`
      } else if (selectedPlatform === 'Facebook') {
        generatedCopy = `⚡️ Special announcement! Our ${holiday} items are going fast. Visit our page: ${facebookLink} to explore the full catalog. Use code: DEAL20.`
      } else if (selectedPlatform === 'X / Twitter') {
        generatedCopy = `The ${holiday} is here! Check out the updates and buy direct at ${twitterLink} 🚀 #shoplocal`
      } else {
        generatedCopy = `🔥 EXCLUSIVE DEALS: We are launching our ${holiday} Campaign! Save big on fast-moving inventories. Code: BUSINESSOS${holiday.toUpperCase().replace(/\s/g, '').substring(0, 6)}.\n\nLinks: Instagram (${instagramLink}), WhatsApp (${whatsAppNumber}).`
      }

      setGeneratedOutput({
        title: `${holiday || 'Global'} Promo - ${subject.slice(0, 15)}`,
        copy: generatedCopy,
        hashtags: `#business #marketing #growth #sales #${selectedPlatform.toLowerCase().replace(/\s/g, '')} #offers`,
        reelsIdea: `Visual Idea: Set up a camera panning from slow-moving warehouse items to best-selling products. Overlay a bold text header: "POV: You finally configured BusinessOS AI to run your shop. Everything sells out."`,
        imagePrompt: `Cinematic retail shop, neon lighting, sleek glowing glass counter displaying products, ultra-detailed raytracing.`,
      })

      triggerLog(`[AI Creative] Successfully compiled caption and imagery blueprints. Status: COMPLETE.`)
      setGenerating(false)
      addNotification('Campaign Generated', 'AI successfully generated marketing assets.', 'success')
    }, 1500)
  }

  // Schedule campaign
  const handleSchedule = () => {
    if (!generatedOutput) return

    const newCampaign: MarketingCampaign = {
      id: `c-${Date.now()}`,
      platform: selectedPlatform,
      title: generatedOutput.title,
      status: 'Scheduled',
      date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days from now
      clicks: 0,
      conversion: 0,
      copy: generatedOutput.copy,
      hashtags: generatedOutput.hashtags,
      imagePrompt: generatedOutput.imagePrompt,
    }

    updateDbState((prev) => ({
      ...prev,
      campaigns: [newCampaign, ...prev.campaigns],
    }))

    triggerLog(`[Firestore] Registered campaign: "${newCampaign.title}" scheduled for launch.`)
    addNotification('Campaign Scheduled', `Your ${selectedPlatform} post has been scheduled with 1-click.`, 'info')
  }

  // Direct Auto-Upload API Pipeline Handler
  const handleDirectUpload = () => {
    if (!generatedOutput) return
    setUploading(true)
    setUploadComplete(false)

    // Stage 1: Stitching frames
    setUploadProgress(`[1/4] Generating & stitching media asset (${mediaFormat.toUpperCase()})...`)
    triggerLog(`[AI Creative] Initializing rendering pipeline for direct upload. Platform: ${selectedPlatform}.`)

    // Stage 2: Connect Graph API
    setTimeout(() => {
      setUploadProgress(`[2/4] Authenticating tokens with ${selectedPlatform} API cluster...`)
    }, 800)

    // Stage 3: Transfer Payload
    setTimeout(() => {
      setUploadProgress(`[3/4] Dispatching video/poster payload binary to platform endpoints...`)
    }, 1600)

    // Stage 4: Success callback
    setTimeout(() => {
      const liveId = `${selectedPlatform.toLowerCase().substring(0, 3)}_${Date.now()}`
      setUploadProgress(`[4/4] Successfully published live! Post Transaction ID: ${liveId}`)
      
      const newCampaign: MarketingCampaign = {
        id: `c-${Date.now()}`,
        platform: selectedPlatform,
        title: `${holiday} Live ${mediaFormat === 'poster' ? 'Poster' : 'Video'}`,
        status: 'Active',
        date: new Date().toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 240) + 40,
        conversion: Number((Math.random() * 7 + 4).toFixed(1)),
        copy: generatedOutput.copy,
        hashtags: generatedOutput.hashtags,
        imagePrompt: generatedOutput.imagePrompt,
      }

      updateDbState((prev) => ({
        ...prev,
        campaigns: [newCampaign, ...prev.campaigns],
      }))

      triggerLog(`[AI Marketing] Uploaded & published ${holiday} campaign directly to ${selectedPlatform} Graph Nodes.`)
      addNotification(
        'Upload Succeeded',
        `Campaign published live on ${selectedPlatform} immediately.`,
        'success'
      )
      setUploading(false)
      setUploadComplete(true)
    }, 2800)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
          AI Marketing Manager
        </h1>
        <p className="text-sm text-slate-400">
          Create, schedule, and execute social asset copy across multiple platforms in seconds.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Creation parameters */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-5 flex flex-col justify-between border border-white/5">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white border-b border-white/5 pb-3 flex items-center gap-1.5">
              <Calendar className="h-4.5 w-4.5 text-electric-bright" /> Campaign Parameters
            </h3>

            {/* Platform select */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Target Platform</label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {platforms.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setSelectedPlatform(p.name)}
                    className={`flex flex-col items-center justify-center rounded-xl p-2.5 transition-all text-center border cursor-pointer ${
                      selectedPlatform === p.name
                        ? 'bg-electric/15 border-electric shadow-lg glow-blue text-white'
                        : 'glass text-slate-400 hover:text-white border-white/5'
                    }`}
                  >
                    <p.icon className="h-4 w-4 mb-1" />
                    <span className="text-[9px] font-bold">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt input */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">AI Prompt Brief</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your promotion goals (e.g. promote vitamins stock expiration, holiday hoodie deals...)"
                rows={3}
                className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1.5 resize-none"
              />
            </div>

            {/* Festival / Holiday */}
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase">Campaign Event Theme</label>
              <select
                value={holiday}
                onChange={(e) => setHoliday(e.target.value)}
                className="w-full bg-base rounded-xl glass py-2.5 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1.5 cursor-pointer"
              >
                <option value="Summer Peak">Summer Sale</option>
                <option value="Black Friday">Black Friday / Cyber Monday</option>
                <option value="New Year Special">New Year Clearance</option>
                <option value="Spring Fresh">Spring Collection Launch</option>
                <option value="Regular Alert">Daily Restock Announcement</option>
              </select>
            </div>

            {/* Brand Config Section */}
            <div className="border-t border-white/5 pt-4 mt-2 space-y-3">
              <span className="text-[10px] font-bold text-cyan-bright uppercase tracking-widest flex items-center gap-1.5">
                🌐 Store Social Channels
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-semibold text-slate-500 uppercase">Instagram Link</label>
                  <input
                    type="text"
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    placeholder="Instagram URL"
                    className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-semibold text-slate-500 uppercase">WhatsApp Number</label>
                  <input
                    type="text"
                    value={whatsAppNumber}
                    onChange={(e) => setWhatsAppNumber(e.target.value)}
                    placeholder="WhatsApp Number"
                    className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-semibold text-slate-500 uppercase">Facebook Link</label>
                  <input
                    type="text"
                    value={facebookLink}
                    onChange={(e) => setFacebookLink(e.target.value)}
                    placeholder="Facebook URL"
                    className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-semibold text-slate-500 uppercase">X / Twitter Link</label>
                  <input
                    type="text"
                    value={twitterLink}
                    onChange={(e) => setTwitterLink(e.target.value)}
                    placeholder="X / Twitter URL"
                    className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full rounded-xl bg-gradient-to-r from-electric to-neon py-3 text-center text-xs font-semibold text-white shadow-lg shadow-electric/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-1.5 mt-6 cursor-pointer font-bold"
          >
            {generating ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Synthesizing Content...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" /> Generate Campaign Content
              </>
            )}
          </button>
        </div>

        {/* AI Output Generation Preview */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-7 flex flex-col justify-between border border-white/5">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-white">AI Asset Preview Canvas</h3>
              
              <div className="flex gap-1 bg-black/40 rounded-lg p-0.5 border border-white/5">
                <button
                  onClick={() => setMediaFormat('poster')}
                  className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    mediaFormat === 'poster'
                      ? 'bg-electric/25 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🖼️ Poster
                </button>
                <button
                  onClick={() => setMediaFormat('video')}
                  className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all cursor-pointer ${
                    mediaFormat === 'video'
                      ? 'bg-electric/25 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🎬 Video
                </button>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 border-b border-white/5 pb-3">
              Target: {selectedPlatform} | Event: {holiday}
            </p>
          </div>

          {/* Canvas Render Frame */}
          <div className="my-4 relative">
            {mediaFormat === 'poster' ? (
              /* Poster Canvas Layout */
              <div 
                className="relative rounded-2xl overflow-hidden h-[240px] border border-white/10 flex flex-col justify-end p-5 select-none bg-cover bg-center transition-all duration-500" 
                style={{ backgroundImage: `url(${themeBg})` }}
              >
                {/* Visual Glass Tonal Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />
                
                <div className="relative z-10 space-y-1.5 text-left">
                  <span className="inline-block rounded bg-gradient-to-r from-neon to-electric px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-white tracking-widest">
                    {holiday.toUpperCase()} SPECIAL
                  </span>
                  <h4 className="text-lg font-black text-white uppercase tracking-tight leading-tight max-w-[90%]">
                    {prompt || "Exclusive Launch Offer"}
                  </h4>
                  <p className="text-[10px] text-slate-300 line-clamp-2 max-w-[85%] leading-relaxed">
                    {generatedOutput?.copy || "Ready to compile. Adjust variables and prompt specifications to synthesize."}
                  </p>
                  
                  {/* Synced Promo Code Block */}
                  <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-white/10">
                    <div>
                      <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Coupon Code</p>
                      <span className="font-mono text-cyan-bright font-black text-xs tracking-wider">
                        BUSINESSOS{holiday.toUpperCase().replace(/\s/g, '').substring(0, 6)}
                      </span>
                    </div>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      Live synced on {selectedPlatform}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Video reels preview layout with player mockup */
              <div 
                className="relative rounded-2xl overflow-hidden h-[240px] border border-white/10 flex flex-col justify-between p-4 bg-cover bg-center transition-all duration-500"
                style={{ backgroundImage: `url(${themeBg})` }}
              >
                {/* Blurred backdrop and gradient dark screen */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/85 pointer-events-none" />

                {/* Top sound controls / format info */}
                <div className="relative z-10 flex justify-between items-center">
                  <span className="rounded bg-black/40 border border-white/10 px-2 py-0.5 text-[8px] text-slate-300 font-mono flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-bright animate-ping" />
                    HD Vertical Video
                  </span>
                  <Volume2 className="h-4.5 w-4.5 text-slate-300" />
                </div>

                {/* Central Play Overlay Button */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-12 w-12 rounded-full bg-black/60 border border-white/20 hover:border-white/30 text-white flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white ml-0.5" />}
                  </button>
                </div>

                {/* Subtitles & Timeline controls */}
                <div className="relative z-10 space-y-2">
                  {/* Scrolling video subtitle overlay */}
                  <div className="bg-black/50 border border-white/5 rounded-xl p-2.5 max-w-[90%] mx-auto">
                    <p className="text-[10px] text-white leading-normal font-medium text-center">
                      {isPlaying 
                        ? `${generatedOutput?.reelsIdea || 'Generating storytelling narrative...'}` 
                        : "Video sequence ready. Press Play to review timeline hooks."}
                    </p>
                  </div>

                  {/* Player timeline bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                      <div 
                        className="bg-electric h-full rounded-full transition-all duration-150" 
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-400 font-mono">
                      <span>00:{Math.floor((videoProgress * 15) / 100).toString().padStart(2, '0')}</span>
                      <span>00:15</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons and uploading state */}
          <div className="space-y-3 mt-2">
            {uploading && (
              <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-xs space-y-2">
                <p className="font-semibold text-white flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-electric-bright" />
                  Direct Social Dispatch Engine Active...
                </p>
                <p className="text-[10px] font-mono text-slate-400">{uploadProgress}</p>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-cyan-bright h-full rounded-full transition-all duration-300"
                    style={{ width: uploadProgress.includes('[4/4]') ? '100%' : uploadProgress.includes('[3/4]') ? '75%' : uploadProgress.includes('[2/4]') ? '50%' : '25%' }}
                  />
                </div>
              </div>
            )}

            {uploadComplete && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-3.5 flex gap-2.5 text-xs text-green-400">
                <Check className="h-5 w-5 shrink-0" />
                <div>
                  <strong>Successfully Uploaded!</strong> Video/Poster asset has been posted to our vertical queue inside {selectedPlatform}. Check live metrics below.
                </div>
              </div>
            )}

            {generatedOutput && !uploading && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSchedule}
                  className="rounded-xl bg-white/5 border border-white/10 py-2.5 text-center text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                >
                  <Calendar className="h-3.5 w-3.5 text-slate-400" /> Schedule Post
                </button>
                <button
                  onClick={handleDirectUpload}
                  className="rounded-xl bg-gradient-to-r from-cyan-bright to-blue-600 py-2.5 text-center text-xs font-bold text-white shadow-md shadow-cyan/25 hover:scale-102 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="h-4 w-4" /> Publish & Upload Live
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedulers Calendar list */}
      <div className="glass-card rounded-2xl p-5 border border-white/5">
        <h3 className="text-sm font-semibold text-white mb-4 border-b border-white/5 pb-3">
          Active Scheduled & Published Marketing Campaigns
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {dbState.campaigns.map((c) => (
            <div key={c.id} className="rounded-xl bg-white/[0.01] border border-white/5 p-4 flex flex-col justify-between transition-all hover:border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="rounded bg-white/5 px-2 py-0.5 text-[9px] font-bold text-white flex items-center gap-1 border border-white/10">
                  {c.platform}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-[9px] font-bold border ${
                    c.status === 'Active'
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : c.status === 'Scheduled'
                      ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {c.status === 'Active' ? 'Published' : c.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white truncate">{c.title}</h4>
              <p className="text-[10px] text-slate-500 mt-1">
                {c.status === 'Active' ? 'Published Date' : 'Target Launch'}: {c.date}
              </p>
              
              <div className="flex gap-4 border-t border-white/[0.03] mt-3 pt-2 text-[10px] text-slate-400">
                <span>Clicks: <strong className="text-white">{c.clicks || 0}</strong></span>
                <span>Conversion: <strong className="text-cyan-bright">{c.conversion || 0}%</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
