import LogoMark from '../LogoMark'

const tabs = [
  ['students', '학생 관리', 'STUDENTS'],
  ['coaches', '코치 관리', 'COACHES'],
  ['courses', '강의 관리', 'CLASSES'],
  ['products', '상품 관리', 'PRODUCTS'],
  ['orders', '주문 관리', 'ORDERS'],
]

function AdminSidebar({ activeTab, adminName, onNavigate, onSelect }) {
  return (
    <aside className="admin-sidebar">
      <button
        className="admin-sidebar__brand"
        type="button"
        onClick={() => onNavigate('home')}
        aria-label="메인 페이지로 이동"
      >
        <LogoMark className="brand__mark" />
        <span>ADMIN STUDIO</span>
      </button>

      <nav className="admin-navigation" aria-label="어드민 메뉴">
        {tabs.map(([id, label, english], index) => (
          <button
            className={activeTab === id ? 'is-active' : ''}
            type="button"
            key={id}
            onClick={() => onSelect(id)}
          >
            <span>{(index + 1).toString().padStart(2, '0')}</span>
            <strong>{label}</strong>
            <small>{english}</small>
          </button>
        ))}
      </nav>

      <div className="admin-sidebar__profile">
        <span>{adminName.slice(0, 1)}</span>
        <div>
          <strong>{adminName}</strong>
          <small>Administrator</small>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar
