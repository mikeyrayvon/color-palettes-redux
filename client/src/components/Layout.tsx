import React from 'react'
import Footer from './Footer'

const Layout: React.FC = ({ children }) => {
  return (
    <div className='overflow-x-hidden flex flex-col min-h-screen' data-testid='layout'>
      <main className='flex-grow'>{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
