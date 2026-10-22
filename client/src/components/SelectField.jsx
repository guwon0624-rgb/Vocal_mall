function SelectField({
  id,
  label,
  value,
  values,
  onChange,
  required = false,
  hint = '',
  className = '',
}) {
  return (
    <label className={`field ${className}`} htmlFor={id}>
      <span className="field__meta">
        <span className="field__label">{label}</span>
        {(hint || !required) && (
          <small className="field__hint">{hint || '선택사항'}</small>
        )}
      </span>
      <span className="select-wrap">
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          required={required}
        >
          <option value="" disabled>
            선택해 주세요
          </option>
          {values.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </span>
    </label>
  )
}

export default SelectField
