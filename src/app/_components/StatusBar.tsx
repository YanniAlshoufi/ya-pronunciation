"use client";

import { Slider } from "@/components/ui/slider";

export default function StatusBar(props: {
  wordsSkipped: number;
  wordsCorrect: number;
  secondsPassed: number;
  minutesPassed: number;
  hoursPassed: number;
  amountOfMinutes: number;
  setAmountOfMinutes: (minutes: number) => void;
}) {
  return (
    <div className="flex w-full items-center justify-evenly pb-2">
      <p className="inline-block">
        {props.wordsCorrect}/{props.wordsSkipped + props.wordsCorrect}
      </p>
      <div className="flex items-center gap-2">
        <p>
          {props.hoursPassed > 0 ? `${props.hoursPassed} h ` : ""}
          {props.minutesPassed > 0 ? `${props.minutesPassed} m ` : ""}
          {props.secondsPassed} s
        </p>
        <label className="flex items-center gap-1">
          <Slider
            className="w-20"
            defaultValue={[5]}
            min={1}
            max={10}
            step={1}
            value={[props.amountOfMinutes]}
            onValueChange={(newValue) => props.setAmountOfMinutes(newValue[0]!)}
          />
          {props.amountOfMinutes} min
        </label>
      </div>
    </div>
  );
}
