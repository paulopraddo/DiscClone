import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ServerPage from './pages/ServerPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/servers/:serverId" element={<ServerPage />} />
    </Routes>
  )
}

export default App
