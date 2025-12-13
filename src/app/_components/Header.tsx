"use client";

import { Button } from "@/components/ui/button";
import type { Word } from "../page";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import type { PossibleLevel } from "@/server/api/routers/words";
import { useEffect } from "react";

export default function Header(props: {
  word: Word | undefined;
  onSkip: () => void;
  restart: () => void;
  possibleLevels: PossibleLevel[] | undefined;
  selectedLevel: PossibleLevel | undefined;
  setSelectedLevel: (level: PossibleLevel | undefined) => void;
  setIsPlayingAudio: (isPlaying: boolean) => void;
}) {
  let audio: HTMLAudioElement | undefined = undefined;
  if (typeof Audio !== undefined && props.word !== undefined) {
    audio = new Audio(props.word.audioLink);
  }

  useEffect(() => {
    if (
      props.selectedLevel === undefined &&
      props.possibleLevels !== undefined &&
      props.possibleLevels.length > 0
    ) {
      props.setSelectedLevel(props.possibleLevels[0]);
    }
  }, [props]);

  return (
    <header className="flex h-30 w-full justify-center max-sm:pt-2">
      <div className="flex h-full w-4/5 items-center justify-between max-sm:flex-col max-sm:gap-2 max-sm:*:w-full">
        <Button
          onClick={async () => {
            if (audio !== undefined) {
              props.setIsPlayingAudio(true);
              audio.onended = () => {
                props.setIsPlayingAudio(false);
              };
              await audio.play();
            }
          }}
        >
          {audio === undefined ? <Spinner /> : "anhören"}
        </Button>
        <Select
          value={props.selectedLevel}
          onValueChange={(newVal) =>
            props.setSelectedLevel(newVal as PossibleLevel)
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            {props.possibleLevels !== undefined ? (
              props.possibleLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))
            ) : (
              <></>
            )}
          </SelectContent>
        </Select>
        <div className="flex max-sm:justify-between max-sm:gap-2 max-sm:*:flex-1 sm:gap-10">
          <Button onClick={props.restart}>neu beginnen</Button>
          <Button onClick={props.onSkip}>überspringen</Button>
        </div>
      </div>
    </header>
  );
}
