"use client";
import { useState } from "react";
import RangeInput from "@/components/ui/RangeInput";
import SelectInput from "@/components/ui/SelectInput";
import tailwindFlexboxParentAttributes from "@/utils/tailwindFlexboxAttributes";

export default function Home() {
  const [boxesValue, setBoxesValue] = useState(3);
  const [containerHeight, setContainerHeight] = useState(300);
  const [flexboxAttributes, setFlexboxAttributes] = useState({
    flexDirection: "",
    flexWrap: "",
    justifyContent: "",
    alignItems: "",
    alignContent: "",
    gap: "",
    placeContent: "",
    placeItems: "",
  });

  const handleChange = (key: string, value: string) => {
    setFlexboxAttributes((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
  return (
    <>
      <div>
        <form>
          <RangeInput
            id="boxes"
            label="Boxes"
            min={1}
            max={10}
            value={boxesValue}
            onChange={(value) => setBoxesValue(value)}
          />
          <RangeInput
            label="Container Height"
            id="containerHeight"
            min={300}
            max={2000}
            step={50}
            value={containerHeight}
            onChange={(value) => setContainerHeight(value)}
          />
          {Object.keys(tailwindFlexboxParentAttributes).map((key) => (
            <SelectInput
              key={key}
              label={key}
              id={key}
              options={tailwindFlexboxParentAttributes[key]}
              value={flexboxAttributes[key]}
              onChange={(value) => handleChange(key, value)}
            />
          ))}
        </form>
      </div>
    </>
  );
}
