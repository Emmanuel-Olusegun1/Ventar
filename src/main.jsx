import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

// Import your components
import App from './App'
import HostSignUp from './HostSignUp'
import HostSignIn from './HostSignIn'
import HostDashboard from './HostDashboard'

// Create the router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/host-signup',
    element: <HostSignUp />,
  },
  {
    path: '/host-login',
    element: <HostSignIn />,
  },{
    path: '/host-dashboard',
    element: <HostDashboard />,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)