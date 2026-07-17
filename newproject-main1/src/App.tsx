import useSmoothScroll from './hooks/useSmoothScroll'
import { Toaster } from 'react-hot-toast'
import Loader from './components/Loader'
import MouseGlow from './components/MouseGlow'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Capabilities from './components/Capabilities'
import DashboardPreview from './components/DashboardPreview'
import Industries from './components/Industries'
import Stats from './components/Stats'
import Pricing from './components/Pricing'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import AIAssistant from './components/AIAssistant'
import AuthGateway from './components/AuthGateway'
import DashboardApp from './components/DashboardApp'
import RoleSelection from './components/RoleSelection'
import CustomerPortal from './components/CustomerPortal'
import SMSSimulator from './components/SMSSimulator'
import { AppContextProvider, useApp } from './context/AppContext'

function AppContent() {
  const { view, portal } = useApp()
  useSmoothScroll(view === 'landing')

  if (view === 'role_select') {
    return (
      <>
        <RoleSelection />
        <SMSSimulator />
      </>
    )
  }

  if (view === 'auth') {
    return (
      <>
        <AuthGateway />
        <SMSSimulator />
      </>
    )
  }

  if (view === 'dashboard') {
    if (portal === 'customer') {
      return (
        <>
          <CustomerPortal />
          <SMSSimulator />
        </>
      )
    }
    return (
      <>
        <DashboardApp />
        <AIAssistant />
        <SMSSimulator />
      </>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-base text-slate-200">
      <Loader />
      <MouseGlow />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Capabilities />
        <DashboardPreview />
        <Industries />
        <Stats />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
      <AIAssistant />
      <SMSSimulator />
    </div>
  )
}

export default function App() {
  return (
    <AppContextProvider>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0d1117',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '12px',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
          },
          success: { iconTheme: { primary: '#22d3ee', secondary: '#0d1117' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#0d1117' } }
        }}
      />
    </AppContextProvider>
  )
}
