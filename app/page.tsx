"use client";
import { useState } from "react";
import RangeInput from "@/components/ui/RangeInput";
import SelectInput from "@/components/ui/SelectInput";
import flexboxOptions from "@/utils/tailwindFlexboxOptions";

type FlexboxOptionKey = keyof typeof flexboxOptions;

export default function FlexboxConfigurator() {
  const [boxCount, setBoxCount] = useState(3);
  const [containerHeight, setContainerHeight] = useState(300);
  const [boxWidth, setBoxWidth] = useState("");
  const [flexboxSettings, setFlexboxSettings] = useState<
    Record<FlexboxOptionKey, string>
  >({
    flexDirection: "",
    flexWrap: "",
    justifyContent: "",
    alignItems: "",
    alignContent: "",
    gap: "",
    placeContent: "",
    placeItems: "",
  });

  const handleFlexboxSettingChange = (
    attribute: FlexboxOptionKey,
    value: string
  ) => {
    setFlexboxSettings((prevSettings) => ({
      ...prevSettings,
      [attribute]: value,
    }));
  };
  return (
    <>
      <div>
        <form>
          <RangeInput
            id="boxCount"
            label="Number of Boxes"
            min={1}
            max={10}
            value={boxCount}
            onChange={(value) => setBoxCount(value)}
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
          <SelectInput
            label="boxWidth"
            id="boxWidth"
            options={["w-10", "w-20", "w-40", "w-60", "w-80", "w-full"]}
            value={boxWidth}
            onChange={(value) => setBoxWidth(value)}
          />
          <button>Reset</button>
          <div>
            {Object.keys(flexboxOptions).map((attribute) => (
              <SelectInput
                key={attribute}
                label={attribute}
                id={attribute}
                options={flexboxOptions[attribute as FlexboxOptionKey]}
                value={flexboxSettings[attribute as FlexboxOptionKey]}
                onChange={(value) =>
                  handleFlexboxSettingChange(
                    attribute as FlexboxOptionKey,
                    value
                  )
                }
              />
            ))}
          </div>
        </form>
      </div>
    </>
  );
}
