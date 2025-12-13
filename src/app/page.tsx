"use client";

import Header from "./_components/Header";
import Footer from "./_components/Footer";
import WordDisplay from "./_components/WordDisplay";
import { useEffect, useState } from "react";
import StatusBar from "./_components/StatusBar";
import { useTimer } from "react-timer-hook";
import { api } from "@/trpc/react";
import type { PossibleLevel } from "@/server/api/routers/words";
import { InformationDialog } from "./_components/InformationDialog";

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState<PossibleLevel | undefined>(
    undefined,
  );

  const { data: possibleLevels, error: possibleLevelsError } =
    api.words.getNonemptyLevels.useQuery();

  const { data: randomWord, error: randomWordError } =
    api.words.getRandomWord.useQuery(
      {
        level: selectedLevel!,
      },
      {
        enabled: selectedLevel !== undefined,
        experimental_prefetchInRender: true,
      },
    );

  const apiUtils = api.useUtils();

  const [wordsSkipped, setWordsSkipped] = useState(0);
  const [wordsCorrect, setWordsCorrect] = useState(0);

  useEffect(() => {
    if (possibleLevelsError) {
      console.error(possibleLevelsError);
    }
    if (randomWordError) {
      console.error(randomWordError);
    }
  }, [possibleLevelsError, randomWordError]);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [canRecord, setCanRecord] = useState(false);

  const [amountOfMinutes, setAmountOfMinutes] = useState(5);
  const [dateAtTimerBegin, setDateAtTimerBegin] = useState(new Date());

  useEffect(() => {
    if (!isDialogOpen) {
      setCanRecord(true);
    }
  }, [isDialogOpen]);

  const {
    seconds: secondsPassed,
    minutes: minutesPassed,
    hours: hoursPassed,
    restart: restartTimer,
  } = useTimer({
    interval: 20,
    expiryTimestamp: new Date(
      dateAtTimerBegin.getTime() + 1000 * 60 * amountOfMinutes,
    ),
    onExpire: () => {
      setIsDialogOpen(true);
      setIsPlayingAudio(false);
      setCanRecord(false);
      setDateAtTimerBegin(new Date());
    },
  });

  useEffect(() => {
    restartTimer(
      new Date(dateAtTimerBegin.getTime() + 1000 * 60 * amountOfMinutes),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountOfMinutes, restartTimer]);

  const restart = async () => {
    restartTimer(new Date(Date.now() + 1000 * 60 * amountOfMinutes));
    setWordsCorrect(0);
    setWordsSkipped(0);
    await apiUtils.words.getRandomWord.invalidate();
  };

  return (
    <>
      <main className="flex h-screen flex-col items-center justify-center bg-gray-950 text-white">
        <Header
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          possibleLevels={possibleLevels}
          word={randomWord as Word | undefined}
          onSkip={async () => {
            setWordsSkipped(wordsSkipped + 1);
            await apiUtils.words.getRandomWord.invalidate();
          }}
          restart={restart}
          setIsPlayingAudio={setIsPlayingAudio}
        />
        <WordDisplay word={randomWord as Word | undefined} />
        <StatusBar
          wordsSkipped={wordsSkipped}
          wordsCorrect={wordsCorrect}
          secondsPassed={secondsPassed}
          minutesPassed={minutesPassed}
          hoursPassed={hoursPassed}
          amountOfMinutes={amountOfMinutes}
          setAmountOfMinutes={setAmountOfMinutes}
        />
        <Footer
          word={randomWord as Word | undefined}
          onCorrect={async () => {
            setWordsCorrect(wordsCorrect + 1);
            await apiUtils.words.getRandomWord.invalidate();
          }}
          isPlayingAudio={isPlayingAudio}
          canRecord={canRecord}
        />
      </main>
      <InformationDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        wordsCorrect={wordsCorrect}
        wordsSkipped={wordsSkipped}
        amountOfMinutes={amountOfMinutes}
        statsSeen={restart}
      />
    </>
  );
}

export type Word = {
  word: string;
  level: string;
  hyphenation: string;
  audioLink: string;
};
