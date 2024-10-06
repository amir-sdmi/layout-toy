type RangeInputProps = {
  label: string;
  step?: number;
  min: number;
  max: number;
  value: number;
  id: string;
  onChange: (value: number) => void;
};

const RangeInput = ({
  label,
  id,
  min,
  max,
  value,
  step = 1,
  onChange,
}: RangeInputProps) => {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <p>{value}</p>
      <input
        id={id}
        name={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </>
  );
};

export default RangeInput;
