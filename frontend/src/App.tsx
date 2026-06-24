import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Portfolio from './pages/Portfolio'
import ProjectOverview from './pages/ProjectOverview'
import Plan from './pages/Plan'
import Resources from './pages/Resources'
import Management from './pages/Management'
import ShareView from './pages/ShareView'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/share/:token" element={<ShareView />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Portfolio />} />
          <Route path="/projects/:id" element={<ProjectOverview />} />
          <Route path="/projects/:id/plan" element={<Plan />} />
          <Route path="/projects/:id/resources" element={<Resources />} />
          <Route path="/projects/:id/management" element={<Management />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
