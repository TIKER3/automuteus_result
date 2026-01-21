import { HashRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { PlayerDetail } from './pages/PlayerDetail'
import { Analysis } from './pages/Analysis'
import { Ranking } from './pages/Ranking'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/player/:userId" element={<PlayerDetail />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/ranking" element={<Ranking />} />
          </Routes>
        </Layout>
      </HashRouter>
    </QueryClientProvider>
  )
}

export default App
