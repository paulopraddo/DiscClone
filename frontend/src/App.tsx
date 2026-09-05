import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import ChannelPage from './pages/ChannelPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import HomePage from './pages/HomePage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ServerPage from './pages/ServerPage'
import VerifyEmailPage from './pages/VerifyEmailPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/app" element={<HomePage />} />
          <Route path="/servers/:serverId" element={<ServerPage />} />
          <Route path="/servers/:serverId/channels/:channelId" element={<ChannelPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
