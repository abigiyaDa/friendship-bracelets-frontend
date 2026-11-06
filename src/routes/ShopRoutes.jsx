import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import ShopLayout from 'layout/Shop';

// render - storefront (public, no login)
const Home = Loadable(lazy(() => import('shop/pages/Home')));
const Shop = Loadable(lazy(() => import('shop/pages/Shop')));
const ProductDetail = Loadable(lazy(() => import('shop/pages/ProductDetail')));
const Cart = Loadable(lazy(() => import('shop/pages/Cart')));
const Checkout = Loadable(lazy(() => import('shop/pages/Checkout')));
const Track = Loadable(lazy(() => import('shop/pages/Track')));
const OrderStatus = Loadable(lazy(() => import('shop/pages/OrderStatus')));

// ==============================|| SHOP ROUTING (PUBLIC) ||============================== //

const ShopRoutes = {
  path: '/',
  element: <ShopLayout />,
  children: [
    {
      index: true,
      element: <Home />
    },
    {
      path: 'shop',
      element: <Shop />
    },
    {
      path: 'shop/:slug',
      element: <ProductDetail />
    },
    {
      path: 'cart',
      element: <Cart />
    },
    {
      path: 'checkout',
      element: <Checkout />
    },
    {
      path: 'track',
      element: <Track />
    },
    {
      path: 'track/:orderNumber',
      element: <OrderStatus />
    }
  ]
};

export default ShopRoutes;
