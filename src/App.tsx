import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { useRouter } from '@/hooks/useRouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Auth from '@/pages/Auth';
import Account from '@/pages/Account';
import OrderSuccess from '@/pages/OrderSuccess';

function AppRoutes() {
  const { route } = useRouter();

  let Page: React.ReactNode;

  switch (route.path) {
    case '/':       Page = <Home />; break;
    case '/products': Page = <Products />; break;
    case '/product': Page = route.productId ? <ProductDetail productId={route.productId} /> : <Products />; break;
    case '/cart':   Page = <Cart />; break;
    case '/checkout': Page = <Checkout />; break;
    case '/auth':   Page = <Auth />; break;
    case '/account': Page = <Account />; break;
    case '/order-success': Page = <OrderSuccess />; break;
    default: Page = <Home />;
  }

  const hideFooter = route.path === '/auth';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{Page}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}
