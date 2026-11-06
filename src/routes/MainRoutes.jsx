import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import ProtectedRoute from 'admin/auth/ProtectedRoute';

// render - dashboard placeholder
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - admin categories
const Categories = Loadable(lazy(() => import('admin/pages/Categories')));

// render - admin colors
const AdminColors = Loadable(lazy(() => import('admin/pages/Colors')));

// render - admin pickup locations
const PickupLocations = Loadable(lazy(() => import('admin/pages/PickupLocations')));

// render - admin products
const Products = Loadable(lazy(() => import('admin/pages/Products')));
const ProductForm = Loadable(lazy(() => import('admin/pages/ProductForm')));

// render - admin customers
const Customers = Loadable(lazy(() => import('admin/pages/Customers')));
const CustomerDetail = Loadable(lazy(() => import('admin/pages/CustomerDetail')));

// render - admin payments
const Payments = Loadable(lazy(() => import('admin/pages/Payments')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/admin',
  element: <ProtectedRoute />,
  children: [
    {
      element: <DashboardLayout />,
      children: [
        {
          index: true,
          element: <DashboardDefault />
        },
        {
          path: 'categories',
          element: <Categories />
        },
        {
          path: 'colors',
          element: <AdminColors />
        },
        {
          path: 'pickup-locations',
          element: <PickupLocations />
        },
        {
          path: 'products',
          element: <Products />
        },
        {
          path: 'products/new',
          element: <ProductForm />
        },
        {
          path: 'products/:id/edit',
          element: <ProductForm />
        },
        {
          path: 'customers',
          element: <Customers />
        },
        {
          path: 'customers/:id',
          element: <CustomerDetail />
        },
        {
          path: 'payments',
          element: <Payments />
        }
      ]
    }
  ]
};

export default MainRoutes;
