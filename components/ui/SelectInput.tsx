type SelectInputProps = {
  label: string;
  id: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

const SelectInput = ({
  label,
  id,
  options,
  value,
  onChange,
}: SelectInputProps) => {
  return (
    <>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="" className="text-transparent">
          {label}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </>
  );
};

export default SelectInput;
