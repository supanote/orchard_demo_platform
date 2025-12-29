import { Outlet } from 'react-router-dom'

const RootLayout = () => {
  return (
    <div className="app-shell">
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout

