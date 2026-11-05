// assets
import { BarcodeOutlined, BgColorsOutlined } from '@ant-design/icons';

// icons
const icons = {
  BgColorsOutlined,
  BarcodeOutlined
};

// ==============================|| MENU ITEMS - UTILITIES ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Utilities',
  type: 'group',
  children: [
    {
      id: 'util-color',
      title: 'Color',
      type: 'item',
      url: '/admin/color',
      icon: icons.BgColorsOutlined
    },
    {
      id: 'util-shadow',
      title: 'Shadow',
      type: 'item',
      url: '/admin/shadow',
      icon: icons.BarcodeOutlined
    }
  ]
};

export default utilities;
