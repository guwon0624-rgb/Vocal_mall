import { useState } from 'react'
import LogoMark from '../components/LogoMark'
import { loginUser } from '../services/userService'

const voiceScoreHeights = [18, 28, 22, 46, 34, 62, 40, 78, 52, 70, 44, 58, 32, 48, 26]

function LoginPage({ onNavigate }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [submitState, setSubmitState] = useState('idle')
  const [message, setMessage] = useState('')
  const [userName, setUserName] = useState('')

  const handleChange = ({ target }) => {
    setForm((current) => ({
      ...current,
      [target.name]: target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setSubmitState('submitting')

    try {
      const { user, token } = await loginUser(form)

      sessionStorage.setItem('accessToken', token)
      sessionStorage.setItem(
        'user',
        JSON.stringify({
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }),
      )
      setUserName(user.name)
      setSubmitState('success')
    } catch (error) {
      setSubmitState('error')
      setMessage(
        error.message === 'Failed to fetch'
          ? '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'
          : error.message,
      )
    }
  }

  return (
    <div className="login-page">
      <aside className="login-stage">
        <div className="login-stage__glow" aria-hidden="true" />
        <button
          className="brand"
          type="button"
          onClick={() => onNavigate('home')}
          aria-label="메인 페이지로 이동"
        >
          <LogoMark className="brand__mark" />
        </button>

        <div className="voice-score" aria-hidden="true">
          <div className="voice-score__staff">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
          <svg className="voice-score__wave" viewBox="0 0 640 220" fill="none">
            <path
              className="voice-score__path"
              d="M8 132 C 54 132, 72 86, 108 86 S 162 164, 204 132 S 268 48, 312 92 S 372 178, 420 128 S 492 64, 536 104 S 592 146, 632 118"
            />
          </svg>
          <div className="voice-score__bars">
            {voiceScoreHeights.map((height, index) => (
              <span
                key={`${height}-${index}`}
                style={{
                  '--bar-height': `${height}%`,
                  '--bar-delay': `${index * 0.12}s`,
                }}
              />
            ))}
          </div>
          <LogoMark className="voice-score__mark" wave />
        </div>
      </aside>

      <main className="login-main">
        <div className="signup-topbar">
          <button
            className="back-button"
            type="button"
            onClick={() => onNavigate('home')}
          >
            <span aria-hidden="true">←</span> 메인으로
          </button>
          <span className="step-label">Session · 02</span>
        </div>

        <div className="form-shell login-shell">
          {submitState === 'success' ? (
            <div className="success-card" role="status">
              <div className="success-card__symbol" aria-hidden="true">
                ✓
              </div>
              <p className="section-kicker login-greeting">{userName}님</p>
              <h1>
                오늘도
                <span>발전합니다</span>
              </h1>
              <button
                className="submit-button"
                type="button"
                onClick={() => onNavigate('home')}
              >
                입장하기 <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <p className="section-kicker">Continue the work</p>
                <h1>로그인</h1>
                <p>이메일과 비밀번호로 훈련을 이어가세요.</p>
              </div>

              <form className="login-form" onSubmit={handleSubmit}>
                <label className="field" htmlFor="email">
                  <span className="field__label">이메일</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="field" htmlFor="password">
                  <span className="field__label">비밀번호</span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="비밀번호를 입력해 주세요"
                    autoComplete="current-password"
                    required
                  />
                </label>

                {message && (
                  <p className="form-message" role="alert">
                    {message}
                  </p>
                )}

                <button
                  className="submit-button"
                  type="submit"
                  disabled={submitState === 'submitting'}
                >
                  {submitState === 'submitting' ? '확인 중...' : '로그인하기'}
                  <span aria-hidden="true">→</span>
                </button>
              </form>

              <p className="login-switch">
                아직 계정이 없다면
                <button type="button" onClick={() => onNavigate('signup')}>
                  회원가입
                </button>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default LoginPage
