import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import Loadable from 'components/Loadable';

// admin auth
const AdminLogin = Loadable(lazy(() => import('admin/auth/Login')));

// template demo login / register (kept for later use)
// const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));
// const RegisterPage = Loadable(lazy(() => import('pages/auth/Register')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      index: true,
      element: <Navigate to="/admin" replace />
    },
    {
      path: 'admin/login',
      element: <AdminLogin />
    }

    // registration disabled for now, re-enable later
    // {
    //   path: 'login',
    //   element: <LoginPage />
    // },
    // {
    //   path: 'register',
    //   element: <RegisterPage />
    // }

    // customer-facing routes will live here under /
  ]
};

export default LoginRoutes;
