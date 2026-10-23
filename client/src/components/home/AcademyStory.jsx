const METHOD_STEPS = [
  {
    number: '01',
    title: '성종을 먼저 읽습니다',
    description:
      '성대의 길이와 두께, 무게 그리고 지금 사용하고 있는 성구 패턴을 관찰합니다.',
  },
  {
    number: '02',
    title: '브릿지를 찾습니다',
    description:
      '소리가 풀리거나 막히는 전환 지점을 찾아 흉성·중성·두성 사이의 연결을 확인합니다.',
  },
  {
    number: '03',
    title: '내 목소리로 연결합니다',
    description:
      '무작정 힘으로 올리지 않고 중간 피치와 다양한 접촉값을 훈련해 자연스러운 음색을 만듭니다.',
  },
]

function AcademyStory() {
  return (
    <section
      className="academy-story"
      id="method"
      aria-labelledby="academy-story-title"
    >
      <div className="academy-story__glow" aria-hidden="true" />
      <header className="academy-story__heading" data-scroll-reveal>
        <p>02 / WHY J HANS</p>
        <h2 id="academy-story-title">
          고음이 아니라,
          <span>연결을 배웁니다.</span>
        </h2>
        <div>
          <strong>노래가 힘든 이유는 의지가 부족해서가 아닙니다.</strong>
          <p>
            음역마다 성대가 사용하는 모양은 달라집니다. 흉성에서 중성,
            두성으로 넘어가는 브릿지에서 소리가 막히거나 풀리고 음색이
            갑자기 달라진다면, 더 세게 미는 대신 전환 방식을 다시 배워야
            합니다.
          </p>
        </div>
      </header>

      <div className="academy-story__bridge" data-scroll-reveal>
        <div className="academy-story__bridge-copy">
          <p>THE VOCAL BRIDGE</p>
          <h3>서로 다른 성구를 하나의 목소리로</h3>
          <span>
            제이한스는 브릿지의 위치와 음색 차이를 진단하고, 개인에게 맞는
            중간 피치와 성대 접촉값을 단계적으로 만들어 갑니다.
          </span>
        </div>
        <div className="vocal-bridge" aria-label="흉성에서 두성으로 이어지는 성구 전환">
          <div className="vocal-bridge__line">
            <span className="vocal-bridge__pulse" />
          </div>
          <div className="vocal-bridge__point">
            <span>CHEST</span>
            <strong>흉성</strong>
          </div>
          <div className="vocal-bridge__point vocal-bridge__point--active">
            <span>BRIDGE</span>
            <strong>중성 · 파사지오</strong>
          </div>
          <div className="vocal-bridge__point">
            <span>HEAD</span>
            <strong>두성</strong>
          </div>
        </div>
      </div>

      <div className="academy-story__methods">
        {METHOD_STEPS.map((step, index) => (
          <article
            key={step.number}
            data-scroll-reveal
            style={{ '--reveal-delay': `${index * 120}ms` }}
          >
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </article>
        ))}
      </div>

      <div className="academy-story__note" data-scroll-reveal>
        <p>
          “한 곡을 두 사람이 부르는 것처럼 들리는 음색 차이도,
          <span> 브릿지가 부드럽게 이어지면 하나의 목소리가 됩니다.</span>”
        </p>
        <a
          href="https://blog.naver.com/gnsdlrl/223295346465"
          target="_blank"
          rel="noreferrer"
        >
          제이한스 발성 노트 읽기 <span aria-hidden="true">↗</span>
        </a>
      </div>

      <div className="academy-story__marquee" aria-hidden="true">
        <div>
          <span>VOICE TYPE</span>
          <i>·</i>
          <span>VOCAL BRIDGE</span>
          <i>·</i>
          <span>PASSAGGIO</span>
          <i>·</i>
          <span>TRUE VOICE</span>
          <i>·</i>
          <span>VOICE TYPE</span>
          <i>·</i>
          <span>VOCAL BRIDGE</span>
          <i>·</i>
          <span>PASSAGGIO</span>
          <i>·</i>
          <span>TRUE VOICE</span>
        </div>
      </div>
    </section>
  )
}

export default AcademyStory
