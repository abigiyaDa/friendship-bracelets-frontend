// assets
import { AppstoreOutlined, BgColorsOutlined, DashboardOutlined, EnvironmentOutlined } from '@ant-design/icons';

// icons
const icons = {
  AppstoreOutlined,
  BgColorsOutlined,
  DashboardOutlined,
  EnvironmentOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/admin',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
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

export default dashboard;
