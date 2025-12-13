"use client";

export default function StatusBar(props: {
  wordsSkipped: number;
  wordsCorrect: number;
  secondsPassed: number;
  minutesPassed: number;
  hoursPassed: number;
}) {
  return (
    <div className="flex w-full justify-evenly">
      <p>
        {props.wordsCorrect}/{props.wordsSkipped + props.wordsCorrect}
      </p>
      <p>
        {props.hoursPassed > 0 ? `${props.hoursPassed} h ` : ""}
        {props.minutesPassed > 0 ? `${props.minutesPassed} m ` : ""}
        {props.secondsPassed} s
      </p>
    </div>
  );
}
