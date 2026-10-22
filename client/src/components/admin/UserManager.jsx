import { useEffect, useState } from 'react'
import {
  deleteManagedUser,
  getManagedUsers,
  updateManagedUser,
} from '../../services/adminService'
import AdminPagination from './AdminPagination'

const emptyForm = {
  name: '',
  activityName: '',
  age: '',
  email: '',
  gender: '',
  role: '학생',
  voiceType: '',
  goal: '취미',
  referralSource: '',
}

const roleCopy = {
  학생: {
    eyebrow: 'STUDENT MANAGEMENT',
    title: '학생 관리',
    description: '등록된 학생의 목표와 성종, 기본 정보를 관리합니다.',
  },
  코치: {
    eyebrow: 'COACH MANAGEMENT',
    title: '코치 관리',
    description: '코치 계정과 담당 정보를 확인하고 관리합니다.',
  },
}

function UserManager({ role }) {
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState({ ...emptyForm, role })
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(5)
  const copy = roleCopy[role]
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const paginatedUsers = users.slice(startIndex, startIndex + pageSize)

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken')
    let ignore = false

    getManagedUsers(token, role)
      .then((items) => {
        if (!ignore) {
          setUsers(items)
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
  }, [role])

  const startEditing = (user) => {
    setEditingId(user._id)
    setMessage('')
    setForm({
      name: user.name || '',
      activityName: user.activityName || '',
      age: user.age || '',
      email: user.email || '',
      gender: user.gender || '',
      role: user.role || role,
      voiceType: user.voiceType || '',
      goal: user.goal || '취미',
      referralSource: user.referralSource || '',
    })
  }

  const handleChange = ({ target }) => {
    setForm((current) => ({
      ...current,
      [target.name]: target.value,
    }))
  }

  const handleSave = async (event) => {
    event.preventDefault()
    const token = sessionStorage.getItem('accessToken')

    setStatus('saving')
    setMessage('')

    try {
      const payload = {
        ...form,
        ...(form.age ? { age: Number(form.age) } : {}),
      }

      if (!payload.voiceType) {
        delete payload.voiceType
      }

      if (!payload.referralSource) {
        delete payload.referralSource
      }

      const updatedUser = await updateManagedUser(
        token,
        editingId,
        payload,
      )

      setUsers((current) =>
        updatedUser.role === role
          ? current.map((user) =>
              user._id === updatedUser._id ? updatedUser : user,
            )
          : current.filter((user) => user._id !== updatedUser._id),
      )
      setEditingId('')
      setStatus('ready')
      setMessage('유저 정보가 수정되었습니다.')
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm(`${user.name} 계정을 삭제할까요?`)) {
      return
    }

    const token = sessionStorage.getItem('accessToken')
    setMessage('')

    try {
      await deleteManagedUser(token, user._id)
      setUsers((current) =>
        current.filter((item) => item._id !== user._id),
      )
      setMessage('계정이 삭제되었습니다.')
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
        <strong>{users.length.toString().padStart(2, '0')}</strong>
      </header>

      {message ? <p className="admin-message">{message}</p> : null}

      <div className="admin-user-grid">
        <div className="admin-list-panel">
          <div className="admin-list-panel__heading">
            <span>이름</span>
            <span>목표 / 성종</span>
            <span>가입일</span>
            <span>관리</span>
          </div>
          {status === 'loading' ? (
            <p className="admin-empty">목록을 불러오고 있습니다.</p>
          ) : users.length ? (
            paginatedUsers.map((user) => (
              <article className="admin-user-row" key={user._id}>
                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
                <div>
                  <span>{user.goal}</span>
                  <small>{user.voiceType || '성종 미정'}</small>
                </div>
                <time>
                  {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                </time>
                <div className="admin-row-actions">
                  <button type="button" onClick={() => startEditing(user)}>
                    수정
                  </button>
                  <button
                    className="is-danger"
                    type="button"
                    onClick={() => handleDelete(user)}
                  >
                    삭제
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="admin-empty">등록된 {role} 계정이 없습니다.</p>
          )}
          <AdminPagination
            currentPage={safePage}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size)
              setCurrentPage(1)
            }}
            pageSize={pageSize}
            totalItems={users.length}
          />
        </div>

        <aside className="admin-editor">
          {editingId ? (
            <form onSubmit={handleSave}>
              <div className="admin-editor__heading">
                <div>
                  <p>EDIT PROFILE</p>
                  <h2>정보 수정</h2>
                </div>
                <button type="button" onClick={() => setEditingId('')}>
                  닫기
                </button>
              </div>
              <label>
                이름
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                이메일
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <div className="admin-form-row">
                <label>
                  성별
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                    <option value="기타">기타</option>
                  </select>
                </label>
                <label>
                  나이
                  <input
                    name="age"
                    type="number"
                    min="1"
                    max="120"
                    value={form.age}
                    onChange={handleChange}
                  />
                </label>
              </div>
              <div className="admin-form-row">
                <label>
                  등록 유형
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="학생">학생</option>
                    <option value="코치">코치</option>
                  </select>
                </label>
                <label>
                  목표
                  <select
                    name="goal"
                    value={form.goal}
                    onChange={handleChange}
                  >
                    <option value="취미">취미</option>
                    <option value="입시">입시</option>
                    <option value="가수">가수</option>
                  </select>
                </label>
              </div>
              <label>
                성종
                <select
                  name="voiceType"
                  value={form.voiceType}
                  onChange={handleChange}
                >
                  <option value="">미정</option>
                  <option value="베이스">베이스</option>
                  <option value="바리톤">바리톤</option>
                  <option value="테너">테너</option>
                  <option value="알토">알토</option>
                  <option value="소프라노">소프라노</option>
                </select>
              </label>
              <button
                className="admin-submit"
                type="submit"
                disabled={status === 'saving'}
              >
                {status === 'saving' ? '저장 중...' : '변경사항 저장'}
              </button>
            </form>
          ) : (
            <div className="admin-editor__placeholder">
              <span>+</span>
              <h2>관리할 계정을 선택하세요.</h2>
              <p>왼쪽 목록에서 수정 버튼을 누르면 상세 정보가 표시됩니다.</p>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default UserManager
