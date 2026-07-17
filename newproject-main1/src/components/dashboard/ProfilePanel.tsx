import { useState } from 'react'
import { User, MapPin, Globe, Link, AtSign, Phone, Save, Check } from 'lucide-react'

interface Profile {
  name: string
  role: string
  address: string
  phone: string
  instagram: string
  linkedin: string
  twitter: string
  avatar: string
}

interface ProfilePanelProps {
  profile: Profile
  setProfile: React.Dispatch<React.SetStateAction<Profile>>
}

const avatars = [
  { id: 'boy1', path: '/owner_avatar.png', label: 'Classic Boy' },
  { id: 'boy2', path: '/boy_avatar_2.png', label: 'Tech Engineer' },
  { id: 'boy3', path: '/boy_avatar_3.png', label: 'Creative Designer' }
]

export default function ProfilePanel({ profile, setProfile }: ProfilePanelProps) {
  const [formData, setFormData] = useState({ ...profile })
  const [saved, setSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setProfile(formData)
    localStorage.setItem('businessos_owner_profile', JSON.stringify(formData))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
          Profile Settings
        </h1>
        <p className="text-sm text-slate-400">
          Manage your owner credentials, address records, and social handles.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Card 1: Avatar Chooser */}
        <div className="glass-card rounded-2xl p-5 flex flex-col items-center text-center">
          <div className="relative">
            <img 
              src={formData.avatar} 
              className="h-28 w-28 rounded-full border-2 border-violet-500/50 object-cover shadow-xl shadow-violet-500/10" 
              alt={formData.name} 
            />
            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 border border-black animate-pulse" />
          </div>
          
          <h3 className="text-sm font-bold text-white mt-3.5">{formData.name}</h3>
          <p className="text-[10px] text-violet-400 font-mono uppercase tracking-wider mt-1">{formData.role}</p>
          <p className="text-[10px] text-slate-500 mt-0.5 max-w-[200px] truncate">{formData.address}</p>

          <div className="border-t border-white/5 w-full mt-5 pt-5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-3 text-left">Choose Boy Avatar</span>
            <div className="grid grid-cols-3 gap-2">
              {avatars.map((av) => {
                const isSelected = formData.avatar === av.path
                return (
                  <button
                    key={av.id}
                    onClick={() => setFormData(prev => ({ ...prev, avatar: av.path }))}
                    className={`relative rounded-xl border p-1 transition-all hover:scale-105 cursor-pointer ${
                      isSelected 
                        ? 'border-violet-500 bg-violet-500/10' 
                        : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                    }`}
                  >
                    <img src={av.path} className="h-12 w-12 rounded-lg object-cover mx-auto" alt={av.label} />
                    <span className="text-[8px] text-slate-400 block mt-1 leading-none">{av.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Details Form */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-[11px] h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-black/30 text-white rounded-xl pl-10 pr-4 py-2 text-xs border border-white/5 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Owner Role Title</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full bg-black/30 text-white rounded-xl px-4 py-2 text-xs border border-white/5 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">HQ Hub Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-[11px] h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full bg-black/30 text-white rounded-xl pl-10 pr-4 py-2 text-xs border border-white/5 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-[11px] h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-black/30 text-white rounded-xl pl-10 pr-4 py-2 text-xs border border-white/5 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Instagram Handle */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Instagram ID</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-[11px] h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                    className="w-full bg-black/30 text-white rounded-xl pl-10 pr-4 py-2 text-xs border border-white/5 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* LinkedIn Handle */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">LinkedIn Profile</label>
                <div className="relative">
                  <Link className="absolute left-3.5 top-[11px] h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="w-full bg-black/30 text-white rounded-xl pl-10 pr-4 py-2 text-xs border border-white/5 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Twitter/X Handle */}
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Twitter / X Handle</label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-[11px] h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                    className="w-full bg-black/30 text-white rounded-xl pl-10 pr-4 py-2 text-xs border border-white/5 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-900/20 hover:scale-[1.02] transition-transform cursor-pointer"
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4 text-green-300" /> Saved Successfully!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Profile Details
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
