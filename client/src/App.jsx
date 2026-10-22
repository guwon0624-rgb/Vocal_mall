import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import './App.css'

const SignupPage = lazy(() => import('./pages/SignupPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const AdminCatalogFormPage = lazy(
  () => import('./pages/AdminCatalogFormPage'),
)
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const OrderPage = lazy(() => import('./pages/OrderPage'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))

const getCurrentPage = () => {
  if (
    /^\/admin\/(courses|products)\/(new|[^/]+\/edit)$/.test(
      window.location.pathname,
    )
  ) {
    return 'adminCatalogForm'
  }

  if (window.location.pathname.startsWith('/courses/')) {
    return 'course'
  }

  if (window.location.pathname.startsWith('/products/')) {
    return 'product'
  }

  if (window.location.pathname === '/admin') {
    return 'admin'
  }

  if (window.location.pathname === '/signup') {
    return 'signup'
  }

  if (window.location.pathname === '/login') {
    return 'login'
  }

  if (window.location.pathname === '/cart') {
    return 'cart'
  }

  if (/^\/order\/complete\/[^/]+$/.test(window.location.pathname)) {
    return 'orderSuccess'
  }

  if (window.location.pathname === '/order') {
    return 'order'
  }

  if (window.location.pathname === '/orders') {
    return 'orders'
  }

  return 'home'
}

function App() {
  const [page, setPage] = useState(getCurrentPage)

  useEffect(() => {
    const handlePopState = () => setPage(getCurrentPage())
    window.addEventListener('popstate', handlePopState)

    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((nextPage, value) => {
    const path =
      nextPage === 'signup'
        ? '/signup'
        : nextPage === 'login'
          ? '/login'
          : nextPage === 'admin'
            ? `/admin${value ? `?tab=${value}` : ''}`
            : nextPage === 'adminCatalogForm'
              ? `/admin/${value.kind === 'course' ? 'courses' : 'products'}/${
                  value.id ? `${value.id}/edit` : 'new'
                }`
            : nextPage === 'product'
              ? `/products/${value}`
              : nextPage === 'course'
                ? `/courses/${value}`
            : nextPage === 'cart'
              ? '/cart'
            : nextPage === 'order'
              ? '/order'
            : nextPage === 'orderSuccess'
              ? `/order/complete/${value}`
            : nextPage === 'orders'
              ? '/orders'
            : nextPage === 'home' && value
              ? `/#${value}`
            : '/'
    window.history.pushState({}, '', path)
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <Suspense
      fallback={
        <div className="page-loader" role="status">
          페이지를 준비하고 있습니다.
        </div>
      }
    >
      {page === 'signup' ? (
        <SignupPage onNavigate={navigate} />
      ) : page === 'login' ? (
        <LoginPage onNavigate={navigate} />
      ) : page === 'admin' ? (
        <AdminPage onNavigate={navigate} />
      ) : page === 'adminCatalogForm' ? (
        <AdminCatalogFormPage
          kind={
            window.location.pathname.split('/')[2] === 'courses'
              ? 'course'
              : 'product'
          }
          itemId={
            window.location.pathname.endsWith('/new')
              ? ''
              : window.location.pathname.split('/')[3]
          }
          onNavigate={navigate}
        />
      ) : page === 'cart' ? (
        <CartPage onNavigate={navigate} />
      ) : page === 'order' ? (
        <OrderPage onNavigate={navigate} />
      ) : page === 'orderSuccess' ? (
        <OrderSuccessPage
          orderId={window.location.pathname.split('/')[3]}
          onNavigate={navigate}
        />
      ) : page === 'orders' ? (
        <OrdersPage onNavigate={navigate} />
      ) : page === 'product' || page === 'course' ? (
        <ProductDetailPage
          productId={window.location.pathname.split('/')[2]}
          expectedKind={page}
          onNavigate={navigate}
        />
      ) : (
        <HomePage onNavigate={navigate} />
      )}
    </Suspense>
  )
}

export default App
