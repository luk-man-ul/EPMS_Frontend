import { Outlet } from 'react-router-dom'
import AppSidebar from '../components/sidebar/AppSidebar'
import AppHeader from '../components/header/AppHeader'

const AppLayout = () => {
  return (
    <div className="layout">
      <AppSidebar />

      <div className="main">
        <AppHeader />
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AppLayout
