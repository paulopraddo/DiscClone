import { motion } from 'framer-motion'
import './HowItWorksSection.css'

const steps = [
  {
    number: '01',
    title: 'Crie sua conta',
    description: 'Cadastro rápido, sem enrolação.',
  },
  {
    number: '02',
    title: 'Crie ou entre num servidor',
    description: 'Monte sua comunidade ou aceite um convite.',
  },
  {
    number: '03',
    title: 'Comece a conversar',
    description: 'Texto, voz ou vídeo — do jeito que preferir.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

function HowItWorksSection() {
  return (
    <section className="how-it-works">
      <motion.div
        className="how-it-works-header"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <span className="how-it-works-eyebrow">Como funciona</span>
        <h2 className="how-it-works-title">Do zero ao primeiro papo em minutos</h2>
      </motion.div>

      <div className="how-it-works-steps">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            className="how-it-works-step"
            custom={i}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <span className="how-it-works-number">{step.number}</span>
            <h3 className="how-it-works-step-title">{step.title}</h3>
            <p className="how-it-works-step-description">{step.description}</p>
            {i < steps.length - 1 && <span className="how-it-works-connector" aria-hidden="true" />}
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default HowItWorksSection
