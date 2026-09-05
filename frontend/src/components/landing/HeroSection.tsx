import { motion } from 'framer-motion'
import { ArrowRight, Hash, MessageSquare, Mic, Play, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import Logo from '../Logo'
import './HeroSection.css'

const titleLine1 = 'Seu lugar para'.split(' ')
const titleLine2 = 'conversar de verdade'.split(' ')

const wordVariants = {
  hidden: { y: '110%' },
  visible: (i: number) => ({
    y: '0%',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const, delay: 0.15 + i * 0.06 },
  }),
}

function HeroSection() {
  return (
    <div className="hero">
      <div className="hero-glow hero-glow-a" aria-hidden="true" />
      <div className="hero-glow hero-glow-b" aria-hidden="true" />
      <div className="hero-grid-overlay" aria-hidden="true" />

      <div className="hero-navbar-fixed">
        <motion.nav
          className="hero-navbar"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="hero-logo-group">
            <Logo size={22} />
            <span className="hero-logo">DiscClone</span>
          </span>
          <Link to="/login" className="hero-navbar-cta">
            Entrar
          </Link>
        </motion.nav>
      </div>

      <main className="hero-content">
        <motion.span
          className="hero-badge"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          Feito para comunidades que não param
        </motion.span>

        <h1 className="hero-title">
          <span className="hero-title-line">
            {titleLine1.map((word, i) => (
              <span className="hero-word-mask" key={word}>
                <motion.span
                  className="hero-word"
                  custom={i}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
          <span className="hero-title-line hero-title-accent">
            {titleLine2.map((word, i) => (
              <span className="hero-word-mask" key={word}>
                <motion.span
                  className="hero-word"
                  custom={titleLine1.length + i}
                  variants={wordVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: 'easeOut' }}
        >
          Servidores, canais de texto e voz, e chamadas em vídeo — tudo em um só lugar,
          rápido e sem fricção. Crie o seu em segundos.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: 'easeOut' }}
        >
          <Link to="/register" className="hero-btn hero-btn-primary">
            <span>Criar minha conta</span>
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
          <Link to="/login" className="hero-btn hero-btn-ghost">
            <Play size={16} strokeWidth={2.5} />
            <span>Já tenho conta</span>
          </Link>
        </motion.div>
      </main>

      <motion.div
        className="hero-mockup-wrap"
        initial={{ opacity: 0, y: 60, scale: 0.94 }}
        animate={{
          opacity: 1,
          y: [0, -14, 0],
          scale: 1,
        }}
        transition={{
          opacity: { duration: 0.9, delay: 0.5 },
          scale: { duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] },
          y: { duration: 5, delay: 1.4, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <div className="hero-mockup">
          <div className="hero-mockup-chrome">
            <span className="hero-mockup-dot hero-mockup-dot-red" />
            <span className="hero-mockup-dot hero-mockup-dot-yellow" />
            <span className="hero-mockup-dot hero-mockup-dot-green" />
          </div>

          <div className="hero-mockup-body">
            <aside className="hero-mockup-rail">
              <div className="hero-mockup-rail-icon hero-mockup-rail-icon-active" />
              <div className="hero-mockup-rail-icon" />
              <div className="hero-mockup-rail-icon" />
              <div className="hero-mockup-rail-icon" />
            </aside>

            <div className="hero-mockup-channels">
              <div className="hero-mockup-channel">
                <Hash size={14} />
                <span>geral</span>
              </div>
              <div className="hero-mockup-channel hero-mockup-channel-active">
                <Hash size={14} />
                <span>projetos</span>
              </div>
              <div className="hero-mockup-channel">
                <Hash size={14} />
                <span>random</span>
              </div>
              <div className="hero-mockup-channel">
                <Mic size={14} />
                <span>Sala de voz</span>
              </div>
            </div>

            <div className="hero-mockup-chat">
              <div className="hero-mockup-message">
                <div className="hero-mockup-avatar" />
                <div className="hero-mockup-bubble">
                  <div className="hero-mockup-bubble-line hero-mockup-bubble-line-lg" />
                  <div className="hero-mockup-bubble-line hero-mockup-bubble-line-sm" />
                </div>
              </div>
              <div className="hero-mockup-message hero-mockup-message-alt">
                <div className="hero-mockup-avatar hero-mockup-avatar-accent" />
                <div className="hero-mockup-bubble">
                  <div className="hero-mockup-bubble-line hero-mockup-bubble-line-md" />
                </div>
              </div>
              <div className="hero-mockup-typing">
                <MessageSquare size={13} />
                <span>alguém está digitando…</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-mockup-float-card hero-mockup-float-card-a">
          <Users size={16} />
          <span>128 online</span>
        </div>
        <div className="hero-mockup-float-card hero-mockup-float-card-b">
          <Mic size={16} />
          <span>Chamada em andamento</span>
        </div>
      </motion.div>
    </div>
  )
}

export default HeroSection
