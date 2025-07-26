import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

// Import your components
import App from './App';
import HostSignUp from './HostSignUp';
import HostSignIn from './HostSignIn';
import HostDashboard from './HostDashboard';
import CreateEvent from './CreateEvent';
import AuthRedirectHandler from './components/AuthRedirectHandler';
import AuthCallback from './components/AuthCallback';

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
  },
  {
    path: '/host-dashboard',
    element: <HostDashboard />,
  },
  {
    path: '/events/new',
    element: <CreateEvent />,
  },
  {
    path: '/auth-redirect',
    element: <AuthRedirectHandler />,
  },
  {
    path: '/auth-callback',
    element: <AuthCallback />,
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)