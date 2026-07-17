import { useState } from 'react'
import {
  Calendar,
  Plus,
  Phone,
  Mail,
  Briefcase,
  Clock,
  TrendingUp,
  Award,
  UserX,
  Plane,
  UserPlus,
  X
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import type { Employee } from '../../services/db'

// Preset headshots for easy onboarding
const avatarPresets = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150', // Male 1
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150', // Female 1
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150', // Male 2
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150', // Female 2
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150', // Male 3
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150', // Female 3
]

export default function EmployeesPanel() {
  const { dbState, updateDbState, role, triggerLog, addNotification } = useApp()
  const [taskText, setTaskText] = useState('')
  const [selectedEmpId, setSelectedEmpId] = useState('e1')

  // Onboarding Form States
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState<'Manager' | 'Cashier' | 'Admin' | 'Sales Associate'>('Sales Associate')
  const [newSalary, setNewSalary] = useState(25000)
  const [newAvatar, setNewAvatar] = useState(avatarPresets[0])
  const [newPhone, setNewPhone] = useState('+91 98765 ')
  const [newEmail, setNewEmail] = useState('')
  const [newShifts, setNewShifts] = useState('Mon 9-5, Wed 9-5, Fri 9-5')

  const selectedEmployee = dbState.employees.find(emp => emp.id === selectedEmpId) || dbState.employees[0]

  const handleDisbursePayroll = () => {
    triggerLog('[MongoDB] Initialized payroll payout loop for employees...')
    const totalSalaries = dbState.employees.reduce((sum, e) => sum + e.salary, 0)

    setTimeout(() => {
      triggerLog(`[Firestore] Disbursed monthly payroll totaling ₹${totalSalaries.toLocaleString('en-IN')}.`)
      addNotification(
        'Payroll Disbursed',
        `Salaries disbursed for all ${dbState.employees.length} active employees via bank API gateway.`,
        'success'
      )
    }, 600)
  }

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskText.trim() || !selectedEmployee) return

    updateDbState((prev) => {
      const updatedEmployees = prev.employees.map((emp) => {
        if (emp.id === selectedEmployee.id) {
          return { ...emp, tasksAssigned: [...emp.tasksAssigned, taskText] }
        }
        return emp
      })
      return { ...prev, employees: updatedEmployees }
    })

    triggerLog(`[Firestore] Assigned task "${taskText}" to ${selectedEmployee.name}.`)
    addNotification('Task Assigned', `Task delegated to ${selectedEmployee.name} shelf priority roster.`, 'info')
    setTaskText('')
  }

  const handleRemoveTask = (taskIndex: number) => {
    if (!selectedEmployee) return

    updateDbState((prev) => {
      const updatedEmployees = prev.employees.map((emp) => {
        if (emp.id === selectedEmployee.id) {
          const tasks = [...emp.tasksAssigned]
          tasks.splice(taskIndex, 1)
          return { ...emp, tasksAssigned: tasks }
        }
        return emp
      })
      return { ...prev, employees: updatedEmployees }
    })

    triggerLog(`[Firestore] Removed task index ${taskIndex} for ${selectedEmployee.name}.`)
    addNotification('Task Completed', `Task resolved for ${selectedEmployee.name}.`, 'success')
  }

  const handleToggleAttendance = (empId: string, status: Employee['attendance']) => {
    const employee = dbState.employees.find((emp) => emp.id === empId)
    if (!employee) return

    updateDbState((prev) => {
      const updatedEmployees = prev.employees.map((emp) => {
        if (emp.id === empId) {
          return { ...emp, attendance: status }
        }
        return emp
      })
      return { ...prev, employees: updatedEmployees }
    })

    triggerLog(`[Firestore] Updated ${employee.name} attendance to: ${status.toUpperCase()}.`)
  }

  // Handle new employee onboarding
  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const newEmp: Employee = {
      id: `e-${Date.now()}`,
      name: newName,
      role: newRole,
      salary: Number(newSalary),
      attendance: 'Present',
      productivityScore: 90,
      tasksAssigned: [],
      shifts: newShifts.split(',').map(s => s.trim()).filter(Boolean),
      avatar: newAvatar,
      phone: newPhone || '+91 98765 00000',
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@businessos.in`,
      joiningDate: new Date().toISOString().split('T')[0]
    }

    updateDbState(prev => ({
      ...prev,
      employees: [...prev.employees, newEmp]
    }))

    setSelectedEmpId(newEmp.id)
    setShowAddModal(false)
    
    // Reset Form
    setNewName('')
    setNewRole('Sales Associate')
    setNewSalary(25000)
    setNewAvatar(avatarPresets[0])
    setNewPhone('+91 98765 ')
    setNewEmail('')
    setNewShifts('Mon 9-5, Wed 9-5, Fri 9-5')

    triggerLog(`[Firestore] Created new employee profile: ${newEmp.name} as ${newEmp.role}.`)
    addNotification('Employee Onboarded', `${newEmp.name} has been added to the active staff.`, 'success')
  }

  const isReadOnly = role === 'cashier'

  const getAttendanceStyle = (status: Employee['attendance']) => {
    switch (status) {
      case 'Present':
        return 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
      case 'Late':
        return 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
      case 'Absent':
        return 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
      case 'Leave':
        return 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
      default:
        return 'bg-slate-500/10 border border-slate-500/20 text-slate-400'
    }
  }

  const getAttendanceIcon = (status: Employee['attendance']) => {
    switch (status) {
      case 'Present':
        return <Award className="h-3.5 w-3.5" />
      case 'Late':
        return <Clock className="h-3.5 w-3.5" />
      case 'Absent':
        return <UserX className="h-3.5 w-3.5" />
      case 'Leave':
        return <Plane className="h-3.5 w-3.5" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
            Employee Hub
          </h1>
          <p className="text-sm text-slate-400">
            Monitor real-time shift check-ins, manage salary registers, delegate priority instructions, and audit active staff.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isReadOnly && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-all cursor-pointer font-bold"
            >
              <UserPlus className="h-4 w-4" /> Add New Staff
            </button>
          )}

          <button
            onClick={handleDisbursePayroll}
            disabled={isReadOnly}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-electric/25 hover:scale-105 transition-transform cursor-pointer font-bold"
          >
            ₹ Disburse Monthly Payroll
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Profile cards Grid */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-semibold text-white">Operational Staff Profiles</h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {dbState.employees.map((emp) => {
              const isSelected = selectedEmpId === emp.id
              return (
                <div
                  key={emp.id}
                  onClick={() => setSelectedEmpId(emp.id)}
                  className={`glass-card rounded-2xl p-5 cursor-pointer transition-all duration-300 relative border flex flex-col justify-between ${
                    isSelected
                      ? 'border-electric-bright/50 bg-electric/5 shadow-md shadow-electric/5'
                      : 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                  }`}
                >
                  {/* Top card metadata */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={emp.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'}
                        alt={emp.name}
                        className="h-14 w-14 rounded-2xl object-cover border border-white/10"
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 border border-white/10 text-[9px]">
                        🎯
                      </span>
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-bold text-white text-sm truncate">{emp.name}</h4>
                        <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">
                          ID: {emp.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Briefcase className="h-3 w-3 text-electric-bright" />
                        {emp.role}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Joined: {emp.joiningDate || '2024-01-01'}
                      </p>
                    </div>
                  </div>

                  {/* Core detail specs */}
                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Salary</p>
                      <p className="font-semibold text-white font-mono mt-0.5">₹{emp.salary.toLocaleString('en-IN')}/mo</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase text-slate-500 tracking-wider">Productivity</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono font-bold text-cyan-bright">{emp.productivityScore}%</span>
                        <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div
                            className="bg-cyan-bright h-full rounded-full"
                            style={{ width: `${emp.productivityScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance badge selection */}
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                      {getAttendanceIcon(emp.attendance)}
                      Attendance
                    </span>
                    {isReadOnly ? (
                      <span className={`rounded-xl px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${getAttendanceStyle(emp.attendance)}`}>
                        {emp.attendance}
                      </span>
                    ) : (
                      <select
                        value={emp.attendance}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e: any) => handleToggleAttendance(emp.id, e.target.value)}
                        className={`rounded-xl px-2.5 py-1 text-[10px] font-bold bg-slate-900 border border-white/5 focus:outline-none focus:border-electric text-slate-200 cursor-pointer`}
                      >
                        <option value="Present">Present</option>
                        <option value="Late">Late</option>
                        <option value="Absent">Absent</option>
                        <option value="Leave">On Leave</option>
                      </select>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detailed Inspector Card */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-sm font-semibold text-white">Employee Inspector</h3>

          {selectedEmployee ? (
            <div className="glass-card rounded-3xl p-5 space-y-5 border border-electric-bright/15 relative overflow-hidden flex flex-col justify-between">
              
              {/* Profile layout summary */}
              <div className="text-center space-y-3 relative z-10">
                <div className="inline-block relative">
                  <img
                    src={selectedEmployee.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150'}
                    alt={selectedEmployee.name}
                    className="h-20 w-20 rounded-full mx-auto object-cover border border-white/10 shadow-lg shadow-black/20"
                  />
                  <span className={`absolute bottom-0 right-1 px-2 py-0.5 text-[9px] font-extrabold rounded-full ${getAttendanceStyle(selectedEmployee.attendance)}`}>
                    {selectedEmployee.attendance}
                  </span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-white text-base leading-tight">{selectedEmployee.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{selectedEmployee.role}</p>
                </div>
              </div>

              {/* Extra details */}
              <div className="space-y-2.5 bg-black/10 rounded-2xl p-4 border border-white/5 text-xs relative z-10">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-electric-bright" /> Email Address
                  </span>
                  <span className="text-slate-300 font-mono select-all truncate max-w-[180px]">{selectedEmployee.email || 'n/a'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-white/5">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-electric-bright" /> Phone Number
                  </span>
                  <span className="text-slate-300 font-mono select-all">{selectedEmployee.phone || 'n/a'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-white/5">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-electric-bright" /> Joined Date
                  </span>
                  <span className="text-slate-300 font-mono">{selectedEmployee.joiningDate || 'n/a'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-white/5">
                  <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-cyan-bright" /> Performance Score
                  </span>
                  <span className="text-cyan-bright font-bold font-mono">{selectedEmployee.productivityScore}%</span>
                </div>
              </div>

              {/* Shifts schedule block */}
              <div className="space-y-2 relative z-10">
                <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-neon-bright" /> Assigned Shifts
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEmployee.shifts && selectedEmployee.shifts.length > 0 ? (
                    selectedEmployee.shifts.map((s, idx) => (
                      <span key={idx} className="rounded-lg bg-white/5 border border-white/5 px-2 py-1 text-[10px] text-slate-300">
                        {s}
                      </span>
                    ))
                  ) : (
                    <p className="text-[10px] italic text-slate-500">No shifts scheduled.</p>
                  )}
                </div>
              </div>

              {/* Tasks and Assignments */}
              <div className="space-y-3 relative z-10 border-t border-white/5 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Directives ({selectedEmployee.tasksAssigned ? selectedEmployee.tasksAssigned.length : 0})
                  </span>
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {selectedEmployee.tasksAssigned && selectedEmployee.tasksAssigned.length > 0 ? (
                    selectedEmployee.tasksAssigned.map((task, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-2 text-xs text-slate-300 bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                        <div className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-bright mt-1.5 shrink-0" />
                          <span className="leading-tight">{task}</span>
                        </div>
                        {!isReadOnly && (
                          <button
                            onClick={() => handleRemoveTask(idx)}
                            className="text-slate-500 hover:text-green-400 transition-colors text-[10px] p-0.5 cursor-pointer"
                            title="Mark as completed"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] italic text-slate-500 py-1">No active instructions delegated.</p>
                  )}
                </div>

                {/* Task assignment form */}
                {!isReadOnly && (
                  <form onSubmit={handleAssignTask} className="flex gap-1.5 mt-2">
                    <input
                      type="text"
                      required
                      value={taskText}
                      onChange={(e) => setTaskText(e.target.value)}
                      placeholder="Delegate task instruction..."
                      className="w-full bg-black/25 rounded-xl px-3 py-1.5 text-xs text-white border border-white/5 focus:outline-none focus:border-electric"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-gradient-to-br from-electric to-neon p-2 text-white flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-card rounded-3xl p-5 text-center text-xs italic text-slate-500">
              Select an employee to inspect their profile.
            </div>
          )}
        </div>
      </div>

      {/* CREATE EMPLOYEE MODAL DIALOG */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-strong border border-white/10 max-w-lg w-full rounded-3xl p-6 text-left shadow-2xl glow-cyan text-slate-200 relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <UserPlus className="h-4.5 w-4.5 text-cyan-bright" /> Onboard New Employee
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Register staff credentials and shift scheduling rosters</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. John Miller"
                    className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Login Role</label>
                  <select
                    value={newRole}
                    onChange={(e: any) => setNewRole(e.target.value)}
                    className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1.5 cursor-pointer"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Sales Associate">Sales Associate</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    required
                    value={newSalary}
                    onChange={(e) => setNewSalary(Number(e.target.value))}
                    placeholder="28000"
                    className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+91 98765 12345"
                    className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1.5"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Email Address (Optional)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. john@businessos.in"
                  className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1.5"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Weekly Shift Roster (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={newShifts}
                  onChange={(e) => setNewShifts(e.target.value)}
                  placeholder="Mon 9-5, Wed 9-5, Fri 9-5"
                  className="w-full bg-base rounded-xl glass py-2 px-3 text-xs text-white focus:outline-none focus:border-electric mt-1.5"
                />
              </div>

              {/* Avatar presets selection */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 uppercase">Select Avatar Portrait</label>
                <div className="flex gap-2.5 mt-2 overflow-x-auto py-1">
                  {avatarPresets.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`preset-${idx}`}
                      onClick={() => setNewAvatar(url)}
                      className={`h-11 w-11 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        newAvatar === url 
                          ? 'border-cyan-bright scale-105 shadow-md shadow-cyan-bright/25' 
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-6 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-white/10 hover:bg-white/5 py-2.5 text-center text-xs font-bold text-slate-400 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-bright to-blue-600 py-2.5 text-center text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Save Employee Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
