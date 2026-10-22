import { useEffect, useRef, useState } from 'react'
import LogoMark from '../components/LogoMark'
import {
  createCatalogItem,
  getAdminCatalogItems,
  updateCatalogItem,
} from '../services/catalogService'
import { createCloudinaryUploadWidget } from '../services/cloudinaryWidget'
import { getCurrentUser } from '../services/userService'

const createEmptyForm = (kind) => ({
  kind,
  sku: '',
  title: '',
  description: '',
  price: '',
  imageUrl: '',
  imagePublicId: '',
  category: '',
  badge: '',
  instructor: '',
  duration: '',
  level: '',
  brand: '',
  stock: '',
  featured: false,
  isPublished: true,
  displayOrder: 0,
})

const formCopy = {
  course: {
    eyebrow: 'CLASS EDITOR',
    title: '강의 등록',
    description: '수강 정보와 가격, 소개 이미지를 입력해 강의를 등록합니다.',
    listTab: 'courses',
  },
  product: {
    eyebrow: 'PRODUCT EDITOR',
    title: '상품 등록',
    description: 'SKU와 가격, Cloudinary 이미지를 입력해 상품을 등록합니다.',
    listTab: 'products',
  },
}

function AdminCatalogFormPage({ kind, itemId, onNavigate }) {
  const [status, setStatus] = useState(() =>
    sessionStorage.getItem('accessToken') ? 'loading' : 'denied',
  )
  const [message, setMessage] = useState('')
  const [imageStatus, setImageStatus] = useState('idle')
  const [form, setForm] = useState(() => createEmptyForm(kind))
  const widgetRef = useRef(null)
  const copy = formCopy[kind]
  const isEditing = Boolean(itemId)

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')

    if (!token) {
      return undefined
    }

    let ignore = false

    Promise.all([
      getCurrentUser(token),
      itemId ? getAdminCatalogItems(token) : Promise.resolve([]),
    ])
      .then(([user, items]) => {
        if (ignore) {
          return
        }

        if (user.role !== '어드민') {
          setStatus('denied')
          return
        }

        if (itemId) {
          const item = items.find(
            (catalogItem) =>
              catalogItem._id === itemId && catalogItem.kind === kind,
          )

          if (!item) {
            setMessage('수정할 항목을 찾을 수 없습니다.')
            setStatus('error')
            return
          }

          setForm({
            ...createEmptyForm(kind),
            ...item,
            price: item.price.toString(),
            stock: item.stock?.toString() || '',
          })
        }

        setStatus('ready')
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
  }, [itemId, kind])

  useEffect(
    () => () => {
      widgetRef.current?.destroy?.()
      widgetRef.current = null
    },
    [],
  )

  const handleChange = ({ target }) => {
    const value =
      target.type === 'checkbox' ? target.checked : target.value

    setForm((current) => ({
      ...current,
      [target.name]: value,
    }))
  }

  const handleOpenImageWidget = async () => {
    setImageStatus('opening')
    setMessage('')

    try {
      if (!widgetRef.current) {
        widgetRef.current = await createCloudinaryUploadWidget(
          (error, result) => {
            if (error) {
              setImageStatus('error')
              setMessage('Cloudinary 이미지 업로드에 실패했습니다.')
              return
            }

            if (result.event === 'success') {
              setForm((current) => ({
                ...current,
                imageUrl: result.info.secure_url,
                imagePublicId: result.info.public_id,
              }))
              setImageStatus('ready')
              setMessage('이미지가 업로드되었습니다.')
              widgetRef.current?.close()
            }

            if (result.event === 'close') {
              setImageStatus((current) =>
                current === 'ready' ? current : 'idle',
              )
            }
          },
        )
      }

      widgetRef.current.open()
      setImageStatus('selecting')
    } catch (error) {
      setImageStatus('error')
      setMessage(error.message)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.imageUrl) {
      setMessage('이미지를 먼저 업로드해 주세요.')
      return
    }

    const token = sessionStorage.getItem('accessToken')
    const payload = {
      ...form,
      price: Number(form.price),
      stock: form.stock ? Number(form.stock) : 0,
      displayOrder: Number(form.displayOrder) || 0,
    }

    setStatus('saving')
    setMessage('')

    try {
      if (isEditing) {
        await updateCatalogItem(token, itemId, payload)
      } else {
        await createCatalogItem(token, payload)
      }

      onNavigate('admin', copy.listTab)
    } catch (error) {
      setMessage(error.message)
      setStatus('ready')
    }
  }

  if (status === 'loading') {
    return (
      <main className="admin-form-state">
        <p>어드민 권한과 데이터를 확인하고 있습니다.</p>
      </main>
    )
  }

  if (status === 'denied' || status === 'error') {
    return (
      <main className="admin-form-state">
        <p className="section-kicker">ADMIN</p>
        <h1>
          {status === 'denied'
            ? '접근 권한이 없습니다.'
            : message}
        </h1>
        <button type="button" onClick={() => onNavigate('home')}>
          메인으로 돌아가기
        </button>
      </main>
    )
  }

  return (
    <main className="admin-catalog-form-page">
      <header className="admin-form-nav">
        <button
          className="admin-form-nav__brand"
          type="button"
          onClick={() => onNavigate('home')}
          aria-label="메인 페이지로 이동"
        >
          <LogoMark className="brand__mark" />
          <span>ADMIN STUDIO</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('admin', copy.listTab)}
        >
          목록으로 돌아가기 <span aria-hidden="true">↙</span>
        </button>
      </header>

      <div className="admin-catalog-form-layout">
        <aside className="admin-form-preview">
          <div>
            <p>{copy.eyebrow}</p>
            <h1>
              {isEditing ? `${copy.title} 수정` : copy.title}
            </h1>
            <span>{copy.description}</span>
          </div>
          <div className="admin-form-preview__image">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="등록 이미지 미리보기" />
            ) : (
              <>
                <strong>IMAGE</strong>
                <span>Cloudinary 이미지가 여기에 표시됩니다.</span>
              </>
            )}
          </div>
          <dl>
            <div>
              <dt>NAME</dt>
              <dd>{form.title || '이름을 입력하세요'}</dd>
            </div>
            <div>
              <dt>PRICE</dt>
              <dd>
                {form.price
                  ? `${new Intl.NumberFormat('ko-KR').format(form.price)}원`
                  : '0원'}
              </dd>
            </div>
          </dl>
        </aside>

        <section className="admin-form-content">
          <form onSubmit={handleSubmit}>
            <div className="admin-form-section-heading">
              <span>01</span>
              <div>
                <h2>기본 정보</h2>
                <p>쇼핑 페이지에 표시될 기본 내용을 입력합니다.</p>
              </div>
            </div>

            {kind === 'product' ? (
              <label>
                SKU
                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  placeholder="VM-MIC-001"
                  required
                />
              </label>
            ) : null}
            <label>
              {kind === 'course' ? '강의 이름' : '상품 이름'}
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              설명 {kind === 'product' ? '(선택)' : ''}
              <textarea
                name="description"
                rows="5"
                value={form.description}
                onChange={handleChange}
                required={kind === 'course'}
              />
            </label>
            <div className="admin-form-row">
              <label>
                가격
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                카테고리
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <div className="admin-form-section-heading">
              <span>02</span>
              <div>
                <h2>이미지와 표시 정보</h2>
                <p>이미지는 Cloudinary에 안전하게 저장됩니다.</p>
              </div>
            </div>
            <div className="admin-image-upload">
              <strong>이미지 · Cloudinary Upload Widget</strong>
              <button
                className="admin-cloudinary-button"
                type="button"
                onClick={handleOpenImageWidget}
                disabled={
                  imageStatus === 'opening' ||
                  imageStatus === 'selecting'
                }
              >
                <span aria-hidden="true">+</span>
                {form.imageUrl ? '이미지 변경하기' : '이미지 추가하기'}
              </button>
              <span>
                {imageStatus === 'opening'
                  ? 'Cloudinary 위젯을 불러오는 중...'
                  : imageStatus === 'selecting'
                    ? '위젯에서 이미지를 선택해 주세요.'
                  : form.imageUrl
                    ? '이미지 등록 완료 · 다른 파일을 선택하면 교체됩니다.'
                    : 'JPG, PNG, WEBP · 최대 5MB'}
              </span>
              {form.imageUrl ? (
                <div className="admin-upload-preview">
                  <img src={form.imageUrl} alt="업로드 이미지 미리보기" />
                  <div>
                    <strong>미리보기</strong>
                    <small>{form.imagePublicId}</small>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="admin-form-row">
              <label>
                배지
                <input
                  name="badge"
                  placeholder="BEST, NEW"
                  value={form.badge}
                  onChange={handleChange}
                />
              </label>
              <label>
                노출 순서
                <input
                  name="displayOrder"
                  type="number"
                  value={form.displayOrder}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="admin-form-section-heading">
              <span>03</span>
              <div>
                <h2>상세 정보</h2>
                <p>
                  {kind === 'course'
                    ? '수강에 필요한 정보를 입력합니다.'
                    : '판매와 재고에 필요한 정보를 입력합니다.'}
                </p>
              </div>
            </div>
            {kind === 'course' ? (
              <>
                <label>
                  강사
                  <input
                    name="instructor"
                    value={form.instructor}
                    onChange={handleChange}
                  />
                </label>
                <div className="admin-form-row">
                  <label>
                    수강 기간
                    <input
                      name="duration"
                      placeholder="8주 · 16회"
                      value={form.duration}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    난이도
                    <input
                      name="level"
                      placeholder="입문"
                      value={form.level}
                      onChange={handleChange}
                    />
                  </label>
                </div>
              </>
            ) : (
              <div className="admin-form-row">
                <label>
                  브랜드
                  <input
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                  />
                </label>
                <label>
                  재고
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={handleChange}
                  />
                </label>
              </div>
            )}

            <div className="admin-toggle-row">
              <label>
                <input
                  name="isPublished"
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={handleChange}
                />
                쇼핑 페이지에 공개
              </label>
              <label>
                <input
                  name="featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={handleChange}
                />
                추천 항목
              </label>
            </div>

            {message ? <p className="admin-message">{message}</p> : null}

            <div className="admin-form-actions">
              <button
                type="button"
                onClick={() => onNavigate('admin', copy.listTab)}
              >
                취소
              </button>
              <button type="submit" disabled={status === 'saving'}>
                {status === 'saving'
                  ? '저장 중...'
                  : isEditing
                    ? '변경사항 저장'
                    : '등록하기'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

export default AdminCatalogFormPage
