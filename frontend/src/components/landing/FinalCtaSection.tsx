import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import './FinalCtaSection.css'

function FinalCtaSection() {
  return (
    <section className="final-cta">
      <div className="final-cta-glow" aria-hidden="true" />

      <motion.div
        className="final-cta-content"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2 className="final-cta-title">Pronto para começar?</h2>
        <p className="final-cta-subtitle">Crie sua conta agora e comece a conversar em segundos.</p>
        <Link to="/register" className="final-cta-btn">
          <span>Criar minha conta</span>
          <ArrowRight size={18} strokeWidth={2.5} />
        </Link>
      </motion.div>
    </section>
  )
}

export default FinalCtaSection
