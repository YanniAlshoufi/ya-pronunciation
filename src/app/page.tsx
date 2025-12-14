/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import Header from "./_components/Header";
import Footer from "./_components/Footer";
import WordDisplay from "./_components/WordDisplay";
import { useCallback, useEffect, useRef, useState } from "react";
import StatusBar from "./_components/StatusBar";
import { useTimer } from "react-timer-hook";
import { api } from "@/trpc/react";
import type { PossibleLevel } from "@/server/api/routers/words";
import { InformationDialog } from "./_components/InformationDialog";

function useWordsQueue(
  selectedLevel: PossibleLevel | undefined,
  queueSize: number,
) {
  const [currentWord, setCurrentWord] = useState<Word | undefined>(undefined);
  const apiUtils = api.useUtils();
  const queueRef = useRef<Word[]>([]);
  const isFetchingRef = useRef(false);
  const levelRef = useRef(selectedLevel);
  const currentWordRef = useRef<Word | undefined>(undefined);
  const historyRef = useRef<string[]>([]);
  const retryCountRef = useRef(0);
  const MAX_HISTORY = 50;

  // Update level ref
  useEffect(() => {
    levelRef.current = selectedLevel;
  }, [selectedLevel]);

  // Update currentWord ref
  useEffect(() => {
    currentWordRef.current = currentWord;
  }, [currentWord]);

  // Function to check and refill queue
  const checkAndRefill = useCallback(() => {
    const currentLength = queueRef.current.length;
    const needsRefill = currentLength < queueSize;
    const canFetch = levelRef.current !== undefined && !isFetchingRef.current;

    if (!needsRefill || !canFetch) {
      return;
    }

    // Fetch a bit more than needed to handle duplicates and build buffer
    const amountNeeded = queueSize - currentLength;
    const amountToFetch = Math.max(amountNeeded, 15);

    isFetchingRef.current = true;

    apiUtils.words.getRandomWords
      .fetch({
        level: levelRef.current!,
        amount: amountToFetch,
      })
      .then((words) => {
        if (words && words.length > 0) {
          const uniqueNewWords: Word[] = [];
          const historyDuplicates: Word[] = [];

          const activeWordsSet = new Set<string>();
          // Add current queue and current word to active set to avoid immediate duplicates in UI
          queueRef.current.forEach((w) => activeWordsSet.add(w.word));
          if (currentWordRef.current) {
            activeWordsSet.add(currentWordRef.current.word);
          }

          const historySet = new Set<string>(historyRef.current);
          const newBatchSet = new Set<string>();

          (words as Word[]).forEach((word) => {
            // 1. Hard Constraint: Must not be currently active (queue or current)
            if (activeWordsSet.has(word.word)) return;

            // 2. Batch Uniqueness: Must not be already added in this batch
            if (newBatchSet.has(word.word)) return;
            newBatchSet.add(word.word);

            // 3. Soft Constraint: History
            if (historySet.has(word.word)) {
              historyDuplicates.push(word);
            } else {
              uniqueNewWords.push(word);
            }
          });

          // Logic to handle retries and fallbacks
          if (uniqueNewWords.length > 0) {
            // We found new words! Reset retry count.
            retryCountRef.current = 0;
          } else if (historyDuplicates.length > 0) {
            // All words were in history. Increment retry count.
            retryCountRef.current += 1;

            // Only relax constraint after multiple failed attempts
            if (retryCountRef.current >= 5) {
              // Take just a few to break the cycle, not all
              uniqueNewWords.push(...historyDuplicates.slice(0, 3));
              retryCountRef.current = 0;
            }
          }

          if (uniqueNewWords.length > 0) {
            // Update history with new words
            const newHistory = [
              ...historyRef.current,
              ...uniqueNewWords.map((w) => w.word),
            ];
            if (newHistory.length > MAX_HISTORY) {
              historyRef.current = newHistory.slice(
                newHistory.length - MAX_HISTORY,
              );
            } else {
              historyRef.current = newHistory;
            }

            queueRef.current = [...queueRef.current, ...uniqueNewWords];
          }
        }
      })
      .catch((error) => {
        console.error("Error refilling queue:", error);
      })
      .finally(() => {
        isFetchingRef.current = false;
        // Check again in case we need more (e.g. if all were duplicates)
        checkAndRefill();
      });
  }, [apiUtils, queueSize]);

  // Initialize queue when level changes
  useEffect(() => {
    if (selectedLevel === undefined) return;

    const initQueue = async () => {
      try {
        const words: "empty" | Word[] =
          (await apiUtils.words.getRandomWords.fetch({
            level: selectedLevel,
            amount: queueSize + 1,
          })) as unknown as "empty" | Word[];

        if (words === "empty") {
          alert("No data in the DB!");
          return;
        }

        if (words && words.length > 0) {
          const [firstWord, ...rest] = words;
          setCurrentWord(firstWord);
          queueRef.current = rest;

          // Initialize history
          historyRef.current = words.map((w) => w.word);
        }
      } catch (error) {
        console.error("Error initializing queue:", error);
      }
    };

    // Clear and reinitialize
    queueRef.current = [];
    historyRef.current = [];
    setCurrentWord(undefined);
    isFetchingRef.current = false;
    void initQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel]);

  const nextWord = () => {
    const currentLength = queueRef.current.length;

    if (currentLength === 0) {
      // Try to refetch if queue is empty
      checkAndRefill();
      return;
    }

    const [word, ...rest] = queueRef.current;

    if (!word) {
      return;
    }

    setCurrentWord(word);
    queueRef.current = rest;

    // Trigger refill check after moving to next word
    checkAndRefill();
  };

  return { nextWord, currentWord };
}

export default function Home() {
  const [selectedLevel, setSelectedLevel] = useState<PossibleLevel | undefined>(
    undefined,
  );

  const { data: possibleLevels, error: possibleLevelsError } =
    api.words.getNonemptyLevels.useQuery();

  const { currentWord: randomWord, nextWord } = useWordsQueue(
    selectedLevel,
    10,
  );

  const [wordsSkipped, setWordsSkipped] = useState(0);
  const [wordsCorrect, setWordsCorrect] = useState(0);

  useEffect(() => {
    if (possibleLevelsError) {
      console.error(possibleLevelsError);
    }
  }, [possibleLevelsError]);

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

  const restart = () => {
    restartTimer(new Date(Date.now() + 1000 * 60 * amountOfMinutes));
    setWordsCorrect(0);
    setWordsSkipped(0);
  };

  const handleSkip = useCallback(() => {
    setWordsSkipped((prev) => prev + 1);
    nextWord();
  }, [nextWord]);

  const handleCorrect = useCallback(() => {
    setWordsCorrect((prev) => prev + 1);
    nextWord();
  }, [nextWord]);

  return (
    <>
      <main className="flex h-screen flex-col items-center justify-center bg-gray-950 text-white">
        <Header
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          possibleLevels={possibleLevels}
          word={randomWord}
          onSkip={handleSkip}
          restart={restart}
          setIsPlayingAudio={setIsPlayingAudio}
        />
        <WordDisplay word={randomWord} />
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
          word={randomWord}
          onCorrect={handleCorrect}
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
