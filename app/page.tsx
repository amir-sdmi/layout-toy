"use client";
import { useState } from "react";
import RangeInput from "@/components/ui/RangeInput";
import SelectInput from "@/components/ui/SelectInput";
const gapOptions = ["1", "2", "3", "4", "5"];

export default function Home() {
  const [boxesValue, setBoxesValue] = useState(3);
  const [containerHeight, setContainerHeight] = useState(300);
  const [gap, setGap] = useState("");
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
          <SelectInput
            label="gap"
            id="gap"
            options={gapOptions}
            value={gap}
            onChange={(value) => setGap(value)}
          />
        </form>
      </div>
    </>
  );
}
