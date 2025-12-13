"use client";

import { Button } from "@/components/ui/button";
import type { Word } from "../page";

export default function Header(props: {
  word: Word;
  onSkip: () => void;
  restart: () => void;
}) {
  const audio = new Audio(props.word.audioLink);

  return (
    <header className="flex h-30 w-full justify-center">
      <div className="flex h-full w-4/5 items-center justify-between">
        <Button onClick={() => audio.play()}>anhören</Button>
        <div className="flex gap-10">
          <Button onClick={props.restart}>neu beginnen</Button>
          <Button onClick={props.onSkip}>überspringen</Button>
        </div>
      </div>
    </header>
  );
}
