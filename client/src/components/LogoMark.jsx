const logoLetters = [
  'M10 38H330V104H10ZM20 158H244V223H80ZM80 223H157L270 348V104H330V515Z',
  'M348 38H419V158H558V38H632V515H558V224H419V515H348Z',
  'M648 38H967V104H648ZM648 158H960L904 223H648ZM648 252H714V355L826 223H904L648 515Z',
]

function LogoMark({ className = '', wave = false }) {
  return (
    <svg
      className={`${className} ${wave ? 'logo-mark--wave' : ''}`.trim()}
      viewBox="0 0 978 532"
      role="img"
      aria-label="보컬학원 심볼"
    >
      {logoLetters.map((path) => (
        <g className="logo-letter" key={path}>
          <path className="logo-mark__edge" d={path} transform="translate(6 6)" />
          <path className="logo-mark__face" d={path} />
        </g>
      ))}
    </svg>
  )
}

export default LogoMark
