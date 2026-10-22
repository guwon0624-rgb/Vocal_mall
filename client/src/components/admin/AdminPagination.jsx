import { useId } from 'react'

const pageSizeOptions = [5, 10, 15, 20, 25, 30]

const getPageItems = (currentPage, totalPages) => {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const visiblePages = [
    1,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    totalPages,
  ]
    .filter((page) => page >= 1 && page <= totalPages)
    .filter((page, index, pages) => pages.indexOf(page) === index)
    .sort((first, second) => first - second)

  return visiblePages.reduce((items, page, index) => {
    const previousPage = visiblePages[index - 1]

    if (previousPage && page - previousPage > 1) {
      items.push(`ellipsis-${previousPage}`)
    }

    items.push(page)
    return items
  }, [])
}

function AdminPagination({
  currentPage,
  onPageChange,
  onPageSizeChange,
  pageSize,
  totalItems,
}) {
  const selectId = useId()

  if (!totalItems) {
    return null
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const firstItem = (safePage - 1) * pageSize + 1
  const lastItem = Math.min(safePage * pageSize, totalItems)
  const pageItems = getPageItems(safePage, totalPages)

  return (
    <nav className="admin-pagination" aria-label="목록 페이지 이동">
      <label className="admin-pagination__size" htmlFor={selectId}>
        <span>한 페이지</span>
        <select
          id={selectId}
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {pageSizeOptions.map((option) => (
            <option value={option} key={option}>
              {option}개
            </option>
          ))}
        </select>
      </label>

      <p>
        <strong>
          {firstItem}–{lastItem}
        </strong>
        <span>/ {totalItems}</span>
      </p>

      <div className="admin-pagination__pages">
        <button
          type="button"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage === 1}
          aria-label="이전 페이지"
        >
          ‹
        </button>

        {pageItems.map((item) =>
          typeof item === 'number' ? (
            <button
              className={item === safePage ? 'is-active' : ''}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === safePage ? 'page' : undefined}
              key={item}
            >
              {item}
            </button>
          ) : (
            <span aria-hidden="true" key={item}>
              ···
            </span>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage === totalPages}
          aria-label="다음 페이지"
        >
          ›
        </button>
      </div>
    </nav>
  )
}

export default AdminPagination
