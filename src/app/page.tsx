"use client";

import Header from "./_components/Header";
import Footer from "./_components/Footer";
import WordDisplay from "./_components/WordDisplay";
import { useEffect, useState } from "react";
import StatusBar from "./_components/StatusBar";
import { useTimer } from "react-timer-hook";

export default function Home() {
  const exampleWord = {
    word: "Anschluss",
    level: "a1",
    hyphenation: "An-schluss",
    audioLink: "https://www.dwds.de/audio/002/der_Anschluss.mp3",
  } as Word;

  const [wordsSkipped, setWordsSkipped] = useState(0);
  const [wordsCorrect, setWordsCorrect] = useState(0);

  const {
    seconds: secondsPassed,
    minutes: minutesPassed,
    hours: hoursPassed,
    restart: restartTimer,
  } = useTimer({
    interval: 20,
    expiryTimestamp: new Date(Date.now() + 1000 * 60 * 5),
  });

  return (
    <main className="flex h-screen flex-col items-center justify-center bg-gray-950 text-white">
      <Header
        word={exampleWord}
        onSkip={() => setWordsSkipped(wordsSkipped + 1)}
        restart={() => {
          restartTimer(new Date(Date.now() + 1000 * 60 * 5));
          setWordsCorrect(0);
          setWordsSkipped(0);
        }}
      />
      <WordDisplay word={exampleWord} />
      <StatusBar
        wordsSkipped={wordsSkipped}
        wordsCorrect={wordsCorrect}
        secondsPassed={secondsPassed}
        minutesPassed={minutesPassed}
        hoursPassed={hoursPassed}
      />
      <Footer
        word={exampleWord}
        onCorrect={() => setWordsCorrect(wordsCorrect + 1)}
      />
    </main>
  );
}

export type Word = {
  word: string;
  level: string;
  hyphenation: string;
  audioLink: string;
};
