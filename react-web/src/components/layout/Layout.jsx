import { useApp } from '../../context/AppContext'
import FooterNav from './FooterNav'
import Loading from './Loading'
import './Layout.scss'

const Layout = ({ children }) => {
  const { state } = useApp()
  const { loading } = state

  return (
    <div className={loading ? 'h-screen overflow-hidden' : ''}>
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
