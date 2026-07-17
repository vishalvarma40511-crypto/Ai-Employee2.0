import { useState } from 'react'
import {
  Inbox,
  Sparkles
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { CustomerRequest } from '../../services/db'

export default function RequestCenterPanel() {
  const { dbState, updateDbState, triggerLog, addNotification } = useApp()
  const [replyInput, setReplyInput] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Completed' | 'Rejected'>('All')

  // Filter requests
  const filteredRequests = dbState.customerRequests.filter(r => {
    if (activeTab === 'All') return true
    if (activeTab === 'Pending') return r.status === 'Pending' || r.status === 'Approved'
    return r.status.toLowerCase() === activeTab.toLowerCase()
  })

  // Action: Approve
  const handleApprove = (reqId: string) => {
    const request = dbState.customerRequests.find(r => r.id === reqId)
    if (!request) return

    updateDbState(prev => {
      const nextRequests = prev.customerRequests.map(r => {
        if (r.id === reqId) {
          return { ...r, status: 'Approved' as const }
        }
        return r
      })
      return { ...prev, customerRequests: nextRequests }
    })

    triggerLog(`[Request Center] Approved stock request from ${request.customerName} for: "${request.productRequested}".`)
    addNotification('Request Approved', `Direct order approval sent for ${request.productRequested}.`, 'success')
  }

  // Action: Reject
  const handleReject = (reqId: string) => {
    const request = dbState.customerRequests.find(r => r.id === reqId)
    if (!request) return

    updateDbState(prev => {
      const nextRequests = prev.customerRequests.map(r => {
        if (r.id === reqId) {
          return { ...r, status: 'Rejected' as const }
        }
        return r
      })
      return { ...prev, customerRequests: nextRequests }
    })

    triggerLog(`[Request Center] Rejected stock request from ${request.customerName} for: "${request.productRequested}".`)
    addNotification('Request Rejected', `Direct request marked rejected for ${request.productRequested}.`, 'warning')
  }

  // Action: Submit Reply
  const handleSendReply = (reqId: string) => {
    const replyText = replyInput[reqId]
    if (!replyText || !replyText.trim()) return

    const request = dbState.customerRequests.find(r => r.id === reqId)
    if (!request) return

    updateDbState(prev => {
      const nextRequests = prev.customerRequests.map(r => {
        if (r.id === reqId) {
          return { ...r, replyText: replyText, status: 'Completed' as const }
        }
        return r
      })
      
      // Also send a live chat message from the owner to simulate direct contact
      const newChatMsg = {
        id: `msg-${Date.now()}`,
        sender: 'owner' as const,
        text: `Reply to your request for "${request.productRequested}": ${replyText}`,
        timestamp: new Date().toISOString(),
        type: 'text' as const,
        seen: false
      }

      return {
        ...prev,
        customerRequests: nextRequests,
        chatMessages: [...prev.chatMessages, newChatMsg]
      }
    })

    triggerLog(`[Request Center] Replied to ${request.customerName}: "${replyText}"`)
    addNotification('Reply Sent', `Your response was forwarded to ${request.customerName}'s chat portal.`, 'info')
    
    setReplyInput(prev => {
      const copy = { ...prev }
      delete copy[reqId]
      return copy
    })
  }

  // Action: Mark Completed
  const handleMarkCompleted = (reqId: string) => {
    const request = dbState.customerRequests.find(r => r.id === reqId)
    if (!request) return

    updateDbState(prev => {
      const nextRequests = prev.customerRequests.map(r => {
        if (r.id === reqId) {
          return { ...r, status: 'Completed' as const }
        }
        return r
      })
      return { ...prev, customerRequests: nextRequests }
    })

    triggerLog(`[Request Center] Request ID ${reqId} marked COMPLETED.`)
    addNotification('Task Completed', `Stock request for ${request.productRequested} archived successfully.`, 'success')
  }

  // Helper styles
  const getPriorityStyle = (priority: CustomerRequest['priority']) => {
    if (priority === 'High') return 'bg-red-500/10 text-red-400 border border-red-500/20'
    if (priority === 'Medium') return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
    return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  }

  const getStatusStyle = (status: CustomerRequest['status']) => {
    if (status === 'Completed') return 'bg-green-500/10 text-green-400 border border-green-500/20'
    if (status === 'Approved') return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
    if (status === 'Rejected') return 'bg-red-500/10 text-red-400 border border-red-500/20'
    return 'bg-slate-800 text-slate-400 border border-slate-700'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
          Customer Request Center
        </h1>
        <p className="text-sm text-slate-400">
          Monitor real-time product suggestions, out-of-stock notification alerts, and reply to customers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-white/5 pb-4">
        {(['All', 'Pending', 'Completed', 'Rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold border transition-all ${
              activeTab === tab
                ? 'bg-electric/15 border-electric text-white shadow-lg glow-blue'
                : 'glass text-slate-400 hover:text-white border-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Requests table / Grid */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Inbox className="h-4.5 w-4.5 text-cyan-bright" /> Ingested Customer Directives
        </h3>

        {filteredRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-semibold">
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Product Requested</th>
                  <th className="pb-3">Request Message</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Received Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 font-semibold text-white">{req.customerName}</td>
                    <td className="py-4 font-mono text-cyan-bright font-medium">{req.productRequested}</td>
                    <td className="py-4 max-w-xs truncate" title={req.requestText}>
                      {req.requestText}
                      {req.replyText && (
                        <p className="text-[10px] text-green-400 italic mt-1">Reply: "{req.replyText}"</p>
                      )}
                    </td>
                    <td className="py-4">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${getPriorityStyle(req.priority)}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 text-[10px] font-mono">
                      {new Date(req.timestamp).toLocaleString([], { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4">
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getStatusStyle(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {req.status === 'Pending' || req.status === 'Approved' ? (
                        <div className="space-y-2">
                          <div className="flex justify-end gap-1.5">
                            {req.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 text-[10px] text-cyan-bright hover:bg-cyan-500/20 cursor-pointer"
                                  title="Approve request"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  className="rounded bg-red-500/10 border border-red-500/30 px-2 py-1 text-[10px] text-red-400 hover:bg-red-500/20 cursor-pointer"
                                  title="Reject request"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleMarkCompleted(req.id)}
                              className="rounded bg-green-500/10 border border-green-500/30 px-2 py-1 text-[10px] text-green-400 hover:bg-green-500/20 cursor-pointer"
                              title="Mark Completed"
                            >
                              Complete
                            </button>
                          </div>

                          {/* Quick conversational reply box */}
                          <div className="flex gap-1.5 max-w-[200px] ml-auto">
                            <input
                              type="text"
                              value={replyInput[req.id] || ''}
                              onChange={(e) => setReplyInput(prev => ({ ...prev, [req.id]: e.target.value }))}
                              placeholder="Type response..."
                              className="rounded-lg bg-black/25 px-2 py-1 text-[10px] text-white border border-white/5 focus:outline-none focus:border-cyan w-full"
                            />
                            <button
                              onClick={() => handleSendReply(req.id)}
                              className="rounded bg-gradient-to-r from-electric to-neon px-2 text-[10px] text-white font-semibold flex items-center justify-center shrink-0 cursor-pointer"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center">
            <Inbox className="h-10 w-10 text-slate-600 mb-3 animate-pulse" />
            <p className="text-sm font-semibold">No direct requests active.</p>
            <p className="text-xs text-slate-600 mt-1">Pending customer chatbot requests will appear in this ledger.</p>
          </div>
        )}
      </div>

      {/* AI Assistance insight summary card */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 bg-gradient-to-r from-electric/5 to-cyan/5 flex items-start gap-4">
        <div className="h-10 w-10 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-cyan-bright" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Demand Aggregation Insights</h4>
          <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
            AI has detected <strong className="text-cyan-bright">2 pending requests</strong>. We suggest bulk orders of <strong>Premium Swiss Chocolates</strong> since customer segment analysis predicts strong conversion margins for the upcoming weekend.
          </p>
        </div>
      </div>
    </div>
  )
}
