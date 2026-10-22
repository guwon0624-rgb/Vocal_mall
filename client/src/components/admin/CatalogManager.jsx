import { useEffect, useMemo, useState } from 'react'
import {
  deleteCatalogItem,
  getAdminCatalogItems,
} from '../../services/catalogService'
import AdminPagination from './AdminPagination'

const kindCopy = {
  course: {
    eyebrow: 'CLASS MANAGEMENT',
    title: '강의 관리',
    description: '수강 가능한 강의를 등록하고 노출 상태와 가격을 관리합니다.',
    createLabel: '새 강의 등록하기',
  },
  product: {
    eyebrow: 'PRODUCT MANAGEMENT',
    title: '상품 관리',
    description: '미디어 장비의 이미지, 가격, 재고와 노출 상태를 관리합니다.',
    createLabel: '새 상품 등록하기',
  },
}

const formatPrice = (price) =>
  `${new Intl.NumberFormat('ko-KR').format(price)}원`

function CatalogManager({ kind, onNavigate }) {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const copy = kindCopy[kind]

  const categories = useMemo(
    () =>
      [...new Set(items.map((item) => item.category).filter(Boolean))].sort(
        (first, second) => first.localeCompare(second, 'ko'),
      ),
    [items],
  )

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('ko')

    return items.filter((item) => {
      const matchesName =
        !normalizedQuery ||
        item.title.toLocaleLowerCase('ko').includes(normalizedQuery)
      const matchesCategory =
        !categoryFilter || item.category === categoryFilter

      return matchesName && matchesCategory
    })
  }, [categoryFilter, items, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedItems = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize

    return filteredItems.slice(startIndex, startIndex + pageSize)
  }, [filteredItems, pageSize, safePage])

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')
    let ignore = false

    getAdminCatalogItems(token)
      .then((catalogItems) => {
        if (!ignore) {
          setItems(catalogItems.filter((item) => item.kind === kind))
          setStatus('ready')
        }
      })
      .catch((error) => {
        if (!ignore) {
          setMessage(error.message)
          setStatus('error')
        }
      })

    return () => {
      ignore = true
    }
  }, [kind])

  const handleDelete = async (item) => {
    if (!window.confirm(`${item.title}을 삭제할까요?`)) {
      return
    }

    const token = sessionStorage.getItem('accessToken')
    setMessage('')

    try {
      await deleteCatalogItem(token, item._id)
      setItems((current) =>
        current.filter((catalogItem) => catalogItem._id !== item._id),
      )
      setMessage('삭제되었습니다.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  return (
    <section className="admin-workspace">
      <header className="admin-workspace__header">
        <div>
          <p>{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <span>{copy.description}</span>
        </div>
        <button
          className="admin-create-button"
          type="button"
          onClick={() => onNavigate('adminCatalogForm', { kind })}
        >
          <span>+</span>
          {copy.createLabel}
        </button>
      </header>

      {message ? <p className="admin-message">{message}</p> : null}

      {kind === 'product' ? (
        <div className="admin-catalog-toolbar">
          <label className="admin-catalog-search">
            <span>상품명 검색</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value)
                setCurrentPage(1)
              }}
              placeholder="찾고 싶은 상품명을 입력하세요"
            />
          </label>
          <label className="admin-catalog-category">
            <span>카테고리</span>
            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">전체 카테고리</option>
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <p>
            <strong>{filteredItems.length}</strong>
            <span>/ {items.length} PRODUCTS</span>
          </p>
        </div>
      ) : null}

      <div className="admin-catalog-layout admin-catalog-layout--list">
        <div className="admin-catalog-list">
          {status === 'loading' ? (
            <p className="admin-empty">목록을 불러오고 있습니다.</p>
          ) : filteredItems.length ? (
            paginatedItems.map((item) => (
              <article className="admin-catalog-row" key={item._id}>
                <img src={item.imageUrl} alt="" />
                <div className="admin-catalog-row__copy">
                  <p>
                    {item.sku || item.category}
                    <span>
                      {item.isPublished ? '판매 중' : '비공개'}
                    </span>
                  </p>
                  <h2>{item.title}</h2>
                  <strong>{formatPrice(item.price)}</strong>
                </div>
                <div className="admin-row-actions">
                  <button
                    type="button"
                    onClick={() =>
                      onNavigate('adminCatalogForm', {
                        kind,
                        id: item._id,
                      })
                    }
                  >
                    수정
                  </button>
                  <button
                    className="is-danger"
                    type="button"
                    onClick={() => handleDelete(item)}
                  >
                    삭제
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="admin-empty">
              {items.length
                ? '검색 조건에 맞는 상품이 없습니다.'
                : '등록된 항목이 없습니다.'}
            </p>
          )}
          <AdminPagination
            currentPage={safePage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
            pageSize={pageSize}
            totalItems={filteredItems.length}
          />
        </div>

      </div>
    </section>
  )
}

export default CatalogManager
