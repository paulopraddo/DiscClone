import { motion } from 'framer-motion'
import { Hash, Mic, Users, Video } from 'lucide-react'
import './FeaturesSection.css'

const features = [
  {
    icon: Hash,
    title: 'Canais de texto',
    description: 'Organize conversas por assunto em canais dedicados, com histórico completo e busca.',
    className: 'features-card-lg',
  },
  {
    icon: Mic,
    title: 'Canais de voz',
    description: 'Entre em uma sala de voz com um clique, sem configurar nada.',
    className: '',
  },
  {
    icon: Video,
    title: 'Chamadas em vídeo',
    description: 'Compartilhe tela e vídeo direto do navegador.',
    className: '',
  },
  {
    icon: Users,
    title: 'Servidores e comunidades',
    description: 'Crie seu servidor, convide pessoas e gerencie tudo com controle total.',
    className: 'features-card-lg',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

function FeaturesSection() {
  return (
    <section className="features">
      <motion.div
        className="features-header"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className="features-eyebrow">Recursos</span>
        <h2 className="features-title">Tudo que sua comunidade precisa</h2>
      </motion.div>

      <div className="features-grid">
        {features.map(({ icon: Icon, title, description, className }, i) => (
          <motion.div
            key={title}
            className={`features-card ${className}`}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <div className="features-card-icon">
              <Icon size={20} strokeWidth={2} />
            </div>
            <h3 className="features-card-title">{title}</h3>
            <p className="features-card-description">{description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default FeaturesSection
