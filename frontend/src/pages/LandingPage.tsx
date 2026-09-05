import { Navigate } from 'react-router-dom'
import FeaturesSection from '../components/landing/FeaturesSection'
import FinalCtaSection from '../components/landing/FinalCtaSection'
import Footer from '../components/landing/Footer'
import HeroSection from '../components/landing/HeroSection'
import HowItWorksSection from '../components/landing/HowItWorksSection'
import { useAuth } from '../contexts/AuthContext'

function LandingPage() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/app" replace />
  }

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <FinalCtaSection />
      <Footer />
    </>
  )
}

export default LandingPage
