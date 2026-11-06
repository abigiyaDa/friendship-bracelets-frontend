import { createBrowserRouter } from 'react-router-dom';

// project imports
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import ShopRoutes from './ShopRoutes';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([ShopRoutes, MainRoutes, LoginRoutes], { basename: import.meta.env.VITE_APP_BASE_NAME || '/' });

export default router;
