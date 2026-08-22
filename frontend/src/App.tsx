import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import RequireAuth from './components/RequireAuth'
import ChannelPage from './pages/ChannelPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ServerPage from './pages/ServerPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/servers/:serverId" element={<ServerPage />} />
          <Route path="/servers/:serverId/channels/:channelId" element={<ChannelPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
