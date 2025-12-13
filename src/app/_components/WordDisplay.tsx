"use client";

import type { Word } from "../page";

export default function WordDisplay(props: { word: Word }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <p className="text-3xl">{props.word.word}</p>
      <p className="text-xl text-gray-400">{props.word.hyphenation}</p>
    </div>
  );
}
