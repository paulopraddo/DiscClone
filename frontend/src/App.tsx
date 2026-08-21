import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ChannelPage from './pages/ChannelPage'
import HomePage from './pages/HomePage'
import ServerPage from './pages/ServerPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/servers/:serverId" element={<ServerPage />} />
        <Route path="/servers/:serverId/channels/:channelId" element={<ChannelPage />} />
      </Route>
    </Routes>
  )
}

export default App
