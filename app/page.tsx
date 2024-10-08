"use client";
import { useState } from "react";
import RangeInput from "@/components/ui/RangeInput";
import SelectInput from "@/components/ui/SelectInput";
import flexboxOptions from "@/utils/tailwindFlexboxOptions";

type FlexboxOptionKey = keyof typeof flexboxOptions;
const defaultFlexboxSettings = {
  "flex-direction": "",
  "flex-wrap": "",
  "justify-content": "",
  "align-items": "",
  "align-content": "",
  gap: "",
  "place-content": "",
  "place-items": "",
};
export default function FlexboxConfigurator() {
  const [boxCount, setBoxCount] = useState(3);
  const [containerHeight, setContainerHeight] = useState(500);
  const [boxWidth, setBoxWidth] = useState("");
  const [flexboxSettings, setFlexboxSettings] = useState(
    defaultFlexboxSettings,
  );

  // Convert flexboxSettings to corresponding CSS properties
  const cssStyles: Record<string, string> = Object.entries(
    flexboxSettings,
  ).reduce(
    (acc, [key, value]) => {
      const cssValue =
        (flexboxOptions[key as FlexboxOptionKey] as Record<string, string>)[
          value
        ] || "";
      acc[key] = cssValue;
      return acc;
    },
    {} as Record<string, string>,
  );

  const handleFlexboxSettingChange = (
    attribute: FlexboxOptionKey,
    value: string,
  ) => {
    setFlexboxSettings((prevSettings) => ({
      ...prevSettings,
      [attribute]: value,
    }));
  };

  const resetSettings = () => {
    setFlexboxSettings(defaultFlexboxSettings);
    setBoxWidth("");
    setBoxCount(3);
    setContainerHeight(500);
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
            label="Box Width"
            id="boxWidth"
            options={["w-10", "w-20", "w-40", "w-60", "w-80", "w-full"]}
            value={boxWidth}
            onChange={(value) => setBoxWidth(value)}
          />
          <button type="button" onClick={resetSettings}>
            Reset
          </button>
          <div
            className={`flex border-2 border-red-500 p-1`}
            style={{
              ...cssStyles,
              height: `${containerHeight}px`,
              display: "flex",
            }}
          >
            {[...Array(boxCount)].map((_, index) => (
              <div
                key={index}
                className={`border-2 border-red-500 bg-red-100 p-2 ${boxWidth} rounded`}
              >
                {index}
              </div>
            ))}
          </div>
          <div>
            {Object.keys(flexboxOptions).map((attribute) => (
              <SelectInput
                key={attribute}
                label={attribute}
                id={attribute}
                options={Object.keys(
                  flexboxOptions[attribute as FlexboxOptionKey],
                )}
                value={flexboxSettings[attribute as FlexboxOptionKey]}
                onChange={(value) =>
                  handleFlexboxSettingChange(
                    attribute as FlexboxOptionKey,
                    value,
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
