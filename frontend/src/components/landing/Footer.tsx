import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="landing-footer">
      <span className="landing-footer-logo">DiscClone</span>
      <Link to="/login" className="landing-footer-link">
        Entrar
      </Link>
      <span className="landing-footer-note">Projeto pessoal — DiscClone © {new Date().getFullYear()}</span>
    </footer>
  )
}

export default Footer
