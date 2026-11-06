import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';

// admin auth
const AdminLogin = Loadable(lazy(() => import('admin/auth/Login')));

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: 'admin/login',
      element: <AdminLogin />
    }
  ]
};

export default LoginRoutes;
