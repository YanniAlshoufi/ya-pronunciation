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
import type { PossibleLevel } from "@/server/api/routers/words";
import { useEffect, useRef } from "react";

export default function Header(props: {
  word: Word | undefined;
  onSkip: () => void;
  restart: () => void;
  possibleLevels: PossibleLevel[] | undefined;
  selectedLevel: PossibleLevel | undefined;
  setSelectedLevel: (level: PossibleLevel | undefined) => void;
  setIsPlayingAudio: (isPlaying: boolean) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
    }
  }, []);

  useEffect(() => {
    if (props.word?.audioLink !== undefined && audioRef.current !== null) {
      audioRef.current.src = props.word.audioLink;
    }
  }, [props.word]);

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
            if (audioRef.current !== null) {
              props.setIsPlayingAudio(true);
              audioRef.current.onended = () => {
                props.setIsPlayingAudio(false);
              };
              await audioRef.current.play();
            }
          }}
        >
          anhören
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
