import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import SignUp from './components/SignUp.jsx';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/signUpStyles.css';
import './styles/dashboardStyles.css';


//import { socketServer } from './socket.js';

const router = createBrowserRouter([
  {
    path: '/',
    element: <SignUp />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
