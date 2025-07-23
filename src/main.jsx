import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

// Import your components
import App from './App'
import HostSignUp from './HostSignUp' // Assuming you have this component

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
    path: '/host-signin',
    element: <HostSignIn />,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)