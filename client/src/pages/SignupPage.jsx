import { useState } from 'react'
import LogoMark from '../components/LogoMark'
import SelectField from '../components/SelectField'
import { initialUserForm, userFormOptions } from '../data/userForm'
import { createUser } from '../services/userService'

const agreementItems = [
  {
    name: 'terms',
    title: '이용약관 동의',
    required: true,
    summary: '서비스 이용 기준과 회원의 권리·의무에 동의합니다.',
    detail:
      '회원은 정확한 정보를 제공하고 서비스를 정상적인 목적으로 이용해야 합니다. 학원은 안정적인 서비스 제공을 위해 필요한 경우 내용을 변경하거나 운영을 일시 중단할 수 있습니다.',
  },
  {
    name: 'privacy',
    title: '개인정보 제공 동의',
    required: true,
    summary: '회원 관리와 훈련 상담을 위한 개인정보 수집에 동의합니다.',
    detail:
      '이름, 이메일, 성별, 등록 유형, 목표 등의 정보를 회원 관리와 맞춤 상담 목적으로 수집합니다. 정보는 회원 탈퇴 시 파기하며, 관계 법령에 따라 보관이 필요한 경우 해당 기간 동안 보관합니다.',
  },
  {
    name: 'marketing',
    title: '마케팅 정보 수신 동의',
    required: false,
    summary: '이벤트와 신규 프로그램 안내를 받아봅니다.',
    detail:
      '이벤트, 교육 프로그램 및 혜택 정보를 이메일 등으로 안내할 수 있습니다. 동의하지 않아도 회원가입과 서비스 이용에는 제한이 없으며 언제든 철회할 수 있습니다.',
  },
]

function SignupPage({ onNavigate }) {
  const [form, setForm] = useState(initialUserForm)
  const [submitState, setSubmitState] = useState('idle')
  const [message, setMessage] = useState('')

  const handleChange = ({ target }) => {
    setForm((current) => ({
      ...current,
      [target.name]: target.value,
    }))
  }

  const handleAgreementChange = ({ target }) => {
    setForm((current) => ({
      ...current,
      agreements: {
        ...current.agreements,
        [target.name]: target.checked,
      },
    }))
  }

  const handleAllAgreementsChange = ({ target }) => {
    const checked = target.checked

    setForm((current) => ({
      ...current,
      agreements: {
        terms: checked,
        privacy: checked,
        marketing: checked,
      },
    }))
  }

  const allAgreed = Object.values(form.agreements).every(Boolean)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    if (form.password !== form.confirmPassword) {
      setSubmitState('error')
      setMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.')
      return
    }

    setSubmitState('submitting')

    try {
      const user = await createUser(form)

      setSubmitState('success')
      setMessage(`${user.name}님의 등록이 완료되었습니다.`)
      setForm(initialUserForm)
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
    <div className="signup-page">
      <aside className="signup-intro">
        <div className="signup-intro__glow" aria-hidden="true" />
        <button
          className="brand brand--signup"
          type="button"
          onClick={() => onNavigate('home')}
          aria-label="메인 페이지로 이동"
        >
          <LogoMark className="brand__mark" />
        </button>

        <div className="signup-intro__content">
          <p className="section-kicker">Know your instrument</p>
          <h2>
            목소리마다
            <span>시작점은 다릅니다.</span>
          </h2>
          <p>
            다른 사람에게 맞는 방법이 나에게도 맞는 것은 아닙니다. 타고난
            성종을 이해하고, 그에 맞는 훈련으로 진성두성을 만들어 갑니다.
          </p>
        </div>

        <div className="signup-intro__signature">
          <LogoMark className="signup-intro__watermark" />
          <span>시간의 차이는 있어도, 가능성은 닫혀 있지 않습니다.</span>
        </div>
      </aside>

      <main className="signup-main">
        <div className="signup-topbar">
          <button
            className="back-button"
            type="button"
            onClick={() => onNavigate('home')}
          >
            <span aria-hidden="true">←</span> 메인으로
          </button>
          <span className="step-label">Enrollment · 01</span>
        </div>

        <div className="form-shell">
          {submitState === 'success' ? (
            <div className="success-card" role="status">
              <div className="success-card__symbol" aria-hidden="true">
                ✓
              </div>
              <p className="section-kicker">Registration complete</p>
              <h1>내 목소리를 찾는 첫걸음</h1>
              <p>{message}</p>
              <button
                className="submit-button"
                type="button"
                onClick={() => onNavigate('home')}
              >
                메인으로 돌아가기 <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <>
              <div className="form-heading">
                <p className="section-kicker">Find your own method</p>
                <h1>회원가입</h1>
                <p>
                  성종에 맞는 훈련을 설계하기 위한 기본 정보를 입력해 주세요.
                </p>
              </div>

              <form className="signup-form" onSubmit={handleSubmit}>
                <section className="form-section">
                  <div className="form-section__heading">
                    <span>01</span>
                    <div>
                      <strong>기본 정보</strong>
                      <small>본인과 활동에 관한 정보를 알려주세요.</small>
                    </div>
                  </div>

                  <div className="form-grid">
                    <label className="field" htmlFor="name">
                      <span className="field__label">이름</span>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="이름을 입력해 주세요"
                        autoComplete="name"
                        required
                      />
                    </label>

                    <label className="field" htmlFor="activityName">
                      <span className="field__meta">
                        <span className="field__label">활동명</span>
                        <small className="field__hint">선택사항</small>
                      </span>
                      <input
                        id="activityName"
                        name="activityName"
                        type="text"
                        value={form.activityName}
                        onChange={handleChange}
                        placeholder="가수명 또는 활동명"
                        maxLength="30"
                      />
                    </label>

                    <SelectField
                      id="gender"
                      label="성별"
                      value={form.gender}
                      values={userFormOptions.gender}
                      onChange={handleChange}
                      required
                    />

                    <label className="field" htmlFor="age">
                      <span className="field__meta">
                        <span className="field__label">나이</span>
                        <small className="field__hint">선택사항</small>
                      </span>
                      <input
                        id="age"
                        name="age"
                        type="number"
                        value={form.age}
                        onChange={handleChange}
                        placeholder="나이를 입력해 주세요"
                        min="1"
                        max="120"
                        inputMode="numeric"
                      />
                    </label>
                  </div>
                </section>

                <section className="form-section">
                  <div className="form-section__heading">
                    <span>02</span>
                    <div>
                      <strong>계정 정보</strong>
                      <small>로그인에 사용할 정보를 입력해 주세요.</small>
                    </div>
                  </div>

                  <div className="form-grid">
                    <label className="field field--wide" htmlFor="email">
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
                        placeholder="8자 이상 입력해 주세요"
                        autoComplete="new-password"
                        minLength="8"
                        required
                      />
                    </label>

                    <label className="field" htmlFor="confirmPassword">
                      <span className="field__label">비밀번호 확인</span>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="비밀번호를 다시 입력해 주세요"
                        autoComplete="new-password"
                        minLength="8"
                        required
                      />
                    </label>
                  </div>
                </section>

                <section className="form-section">
                  <div className="form-section__heading">
                    <span>03</span>
                    <div>
                      <strong>훈련 정보</strong>
                      <small>목표에 맞는 훈련 설계를 위한 정보입니다.</small>
                    </div>
                  </div>

                  <div className="form-grid">
                    <fieldset className="field role-field">
                      <legend className="field__label">등록 유형</legend>
                      <div className="role-options">
                        {userFormOptions.role.map((role) => (
                          <label key={role} className="role-option">
                            <input
                              type="radio"
                              name="role"
                              value={role}
                              checked={form.role === role}
                              onChange={handleChange}
                              required
                            />
                            <span>
                              <strong>{role}</strong>
                              <small>
                                {role === '학생'
                                  ? '내 성종에 맞는 훈련'
                                  : '성종별 지도법 연구'}
                              </small>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <SelectField
                      id="goal"
                      label="목표"
                      value={form.goal}
                      values={userFormOptions.goal}
                      onChange={handleChange}
                      required
                    />

                    <SelectField
                      id="referralSource"
                      label="가입 경로"
                      value={form.referralSource}
                      values={userFormOptions.referralSource}
                      onChange={handleChange}
                    />

                    <SelectField
                      id="voiceType"
                      label="본인 성종"
                      value={form.voiceType}
                      values={userFormOptions.voiceType}
                      onChange={handleChange}
                      hint="선택사항 · 정확한 성종 진단 후 변경해드립니다."
                      className="field--wide"
                    />
                  </div>
                </section>

                <section className="form-section agreement-section">
                  <div className="form-section__heading">
                    <span>04</span>
                    <div>
                      <strong>약관 동의</strong>
                      <small>필수 약관을 확인하고 동의해 주세요.</small>
                    </div>
                  </div>

                  <div className="agreement-panel">
                    <label className="agreement-all">
                      <input
                        type="checkbox"
                        checked={allAgreed}
                        onChange={handleAllAgreementsChange}
                      />
                      <span>전체 약관에 동의합니다.</span>
                    </label>

                    <div className="agreement-list">
                      {agreementItems.map((agreement) => (
                        <div className="agreement-item" key={agreement.name}>
                          <label className="agreement-item__check">
                            <input
                              type="checkbox"
                              name={agreement.name}
                              checked={form.agreements[agreement.name]}
                              onChange={handleAgreementChange}
                              required={agreement.required}
                            />
                            <span>
                              <strong>{agreement.title}</strong>
                              <em>
                                {agreement.required ? '필수' : '선택'}
                              </em>
                              <small>{agreement.summary}</small>
                            </span>
                          </label>

                          <details className="agreement-detail">
                            <summary>내용 보기</summary>
                            <p>{agreement.detail}</p>
                          </details>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

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
                  {submitState === 'submitting'
                    ? '등록 중...'
                    : '회원가입하기'}
                  <span aria-hidden="true">→</span>
                </button>
              </form>

              <p className="login-switch">
                이미 계정이 있다면
                <button type="button" onClick={() => onNavigate('login')}>
                  로그인
                </button>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default SignupPage
