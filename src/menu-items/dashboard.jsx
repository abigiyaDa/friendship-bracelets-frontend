// assets
import {
  AppstoreOutlined,
  BgColorsOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined
} from '@ant-design/icons';

// icons
const icons = {
  AppstoreOutlined,
  BgColorsOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

export const dashboard = {
  id: 'group-dashboard',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/admin',
      icon: icons.DashboardOutlined,
      breadcrumbs: false,
      end: true
    }
  ]
};

export const sales = {
  id: 'group-sales',
  title: 'Sales',
  type: 'group',
  children: [
    {
      id: 'orders',
      title: 'Orders',
      type: 'item',
      url: '/admin/orders',
      icon: icons.ShoppingCartOutlined
    },
    {
      id: 'payments',
      title: 'Payments',
      type: 'item',
      url: '/admin/payments',
      icon: icons.CreditCardOutlined
    },
    {
      id: 'customers',
      title: 'Customers',
      type: 'item',
      url: '/admin/customers',
      icon: icons.TeamOutlined
    }
  ]
};

export const catalog = {
  id: 'group-catalog',
  title: 'Catalog',
  type: 'group',
  children: [
    {
      id: 'products',
      title: 'Products',
      type: 'item',
      url: '/admin/products',
      icon: icons.ShoppingOutlined
    },
    {
      id: 'categories',
      title: 'Categories',
      type: 'item',
      url: '/admin/categories',
      icon: icons.AppstoreOutlined
    },
    {
      id: 'colors',
      title: 'Colors',
      type: 'item',
      url: '/admin/colors',
      icon: icons.BgColorsOutlined
    },
    {
      id: 'pickup-locations',
      title: 'Pickup locations',
      type: 'item',
      url: '/admin/pickup-locations',
      icon: icons.EnvironmentOutlined
    }
  ]
};
