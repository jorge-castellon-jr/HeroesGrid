import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { initializeDatabase } from '../../database/seed'
import FooterNav from './FooterNav'
import './Layout.scss'

const Layout = ({ children }) => {
  const { state } = useApp()
  const { loading } = state
  const location = useLocation()
  
  // Initialize database on mount
  useEffect(() => {
    initializeDatabase();
  }, [])
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname])
  
  // Ensure body is scrollable (remove any overflow-hidden on mount)
  useEffect(() => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }, [])

  return (
    <div>
      <div className="px-4 mb-40 md:ml-32">
        {children}
      </div>
      <FooterNav />
      {/* {loading && ( */}
      {/*   <div className={`loading-transition ${loading ? 'loading-transition--enter' : 'loading-transition--leave'}`}> */}
      {/*     <Loading /> */}
      {/*   </div> */}
      {/* )} */}
    </div>
  )
}

export default Layout
