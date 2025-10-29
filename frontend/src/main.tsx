import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { HomePage } from './pages/HomePage';
import { DetailsPage } from './pages/DetailsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ResultPage } from './pages/ResultPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { LandingPage } from './pages/LandingPage';

const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/home', element: <HomePage /> },
  { path: '/experience/:id', element: <DetailsPage /> },
  { path: '/checkout', element: <CheckoutPage /> },
  { path: '/result', element: <ResultPage /> }
  ,{ path: '/profile', element: <ProfilePage /> }
  ,{ path: '/login', element: <LoginPage /> }
  ,{ path: '/signup', element: <SignupPage /> }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);


