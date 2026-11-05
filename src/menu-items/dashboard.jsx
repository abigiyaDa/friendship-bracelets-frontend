// assets
import { AppstoreOutlined, BgColorsOutlined, DashboardOutlined } from '@ant-design/icons';

// icons
const icons = {
  AppstoreOutlined,
  BgColorsOutlined,
  DashboardOutlined
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
    }
  ]
};

export default dashboard;
