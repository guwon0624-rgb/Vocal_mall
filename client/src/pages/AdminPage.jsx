import { useEffect, useState } from 'react'
import AdminSidebar from '../components/admin/AdminSidebar'
import CatalogManager from '../components/admin/CatalogManager'
import OrderManager from '../components/admin/OrderManager'
import UserManager from '../components/admin/UserManager'
import LogoMark from '../components/LogoMark'
import { getCurrentUser } from '../services/userService'

const getInitialTab = () => {
  const tab = new URLSearchParams(window.location.search).get('tab')

  return ['students', 'coaches', 'courses', 'products', 'orders'].includes(tab)
    ? tab
    : 'students'
}

function AdminPage({ onNavigate }) {
  const [access, setAccess] = useState(() => ({
    status: sessionStorage.getItem('accessToken') ? 'loading' : 'denied',
    user: null,
  }))
  const [activeTab, setActiveTab] = useState(getInitialTab)

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')

    if (!token) {
      return undefined
    }

    let ignore = false

    getCurrentUser(token)
      .then((user) => {
        if (!ignore) {
          setAccess({
            status: user.role === '어드민' ? 'ready' : 'denied',
            user,
          })
        }
      })
      .catch(() => {
        if (!ignore) {
          setAccess({ status: 'denied', user: null })
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  if (access.status !== 'ready') {
    return (
      <main className="admin-access-page">
        <button
          className="brand"
          type="button"
          onClick={() => onNavigate('home')}
          aria-label="메인 페이지로 이동"
        >
          <LogoMark className="brand__mark" />
        </button>

        <section className="admin-access-card">
          <p className="section-kicker">ADMIN ACCESS</p>
          {access.status === 'loading' ? (
            <h1>권한을 확인하고 있습니다.</h1>
          ) : (
            <>
              <h1>접근 권한이 없습니다.</h1>
              <p>어드민 권한이 있는 계정만 이용할 수 있습니다.</p>
            </>
          )}
          <button
            className="admin-back"
            type="button"
            onClick={() => onNavigate('home')}
          >
            메인으로 돌아가기
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="admin-page">
      <AdminSidebar
        activeTab={activeTab}
        adminName={access.user.name}
        onNavigate={onNavigate}
        onSelect={setActiveTab}
      />
      <div className="admin-main">
        <div className="admin-topbar">
          <p>
            VOCAL MALL <span>/ MANAGEMENT SYSTEM</span>
          </p>
          <button type="button" onClick={() => onNavigate('home')}>
            쇼핑 페이지 보기 <span aria-hidden="true">↗</span>
          </button>
        </div>

        {activeTab === 'students' ? (
          <UserManager key="students" role="학생" />
        ) : activeTab === 'coaches' ? (
          <UserManager key="coaches" role="코치" />
        ) : activeTab === 'courses' ? (
          <CatalogManager
            key="courses"
            kind="course"
            onNavigate={onNavigate}
          />
        ) : activeTab === 'products' ? (
          <CatalogManager
            key="products"
            kind="product"
            onNavigate={onNavigate}
          />
        ) : (
          <OrderManager key="orders" />
        )}
      </div>
    </main>
  )
}

export default AdminPage
