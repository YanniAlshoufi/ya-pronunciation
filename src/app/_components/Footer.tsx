/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import type { Word } from "../page";

export default function Footer(props: {
  word: Word | undefined;
  onCorrect: () => void;
  isPlayingAudio: boolean;
  canRecord: boolean;
}) {
  const {
    transcript,
    listening: recording,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [shouldRecord, setShouldRecord] = useState(false);
  const [wasRecordingBeforePlayingAudio, setWasRecordingBeforePlayingAudio] =
    useState(false);

  useEffect(() => {
    if (!props.canRecord) {
      setShouldRecord(false);
    }
  }, [props.canRecord]);

  useEffect(() => {
    if (props.isPlayingAudio && shouldRecord) {
      setShouldRecord(false);
      setWasRecordingBeforePlayingAudio(true);
    }
    if (!props.isPlayingAudio && wasRecordingBeforePlayingAudio) {
      setShouldRecord(true);
      setWasRecordingBeforePlayingAudio(false);
    }
  }, [props.isPlayingAudio, shouldRecord, wasRecordingBeforePlayingAudio]);

  useEffect(() => {
    if (recording && !shouldRecord) {
      SpeechRecognition.stopListening();
    }
    if (!recording && shouldRecord && props.word !== undefined) {
      SpeechRecognition.startListening({ language: "de-AT" });
    }
  }, [recording, shouldRecord, props.word]);

  useEffect(() => {
    if (
      props.word !== undefined &&
      transcript.toLowerCase().endsWith(props.word.word.toLowerCase() ?? "")
    ) {
      SpeechRecognition.stopListening().then(() => {
        props.onCorrect();
      });
    }
  }, [props, transcript]);

  return (
    <footer className="w-full">
      {browserSupportsSpeechRecognition ? (
        <Button
          className="min-h-30 w-full"
          onClick={
            shouldRecord
              ? () => setShouldRecord(false)
              : () => setShouldRecord(true)
          }
          disabled={props.isPlayingAudio || !props.canRecord}
        >
          <span className="scale-200">
            {recording ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="scale-150"
              >
                <g fill="none">
                  <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                  <path
                    fill="currentColor"
                    d="M4.93 12.01a1 1 0 0 1 1.13.848a6 6 0 0 0 7.832 4.838l.293-.107l1.509 1.509a8 8 0 0 1-2.336.787l-.358.053V21a1 1 0 0 1-1.993.117L11 21v-1.062a8.005 8.005 0 0 1-6.919-6.796a1 1 0 0 1 .848-1.132ZM12 2a5 5 0 0 1 4.995 4.783L17 7v5a5 5 0 0 1-.691 2.538l-.137.22l.719.719c.542-.76.91-1.652 1.048-2.619a1 1 0 0 1 1.98.284a7.96 7.96 0 0 1-1.412 3.513l-.187.25l2.165 2.166a1 1 0 0 1-1.32 1.497l-.094-.083L3.515 4.93a1 1 0 0 1 1.32-1.497l.094.083l2.23 2.23A5 5 0 0 1 12 2m-5 8.404l6.398 6.398A5 5 0 0 1 7 12z"
                  />
                </g>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g fill="none">
                  <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                  <path
                    fill="currentColor"
                    d="M19.07 12.01a1 1 0 0 1 .85 1.132A8.004 8.004 0 0 1 13 19.938V21a1 1 0 1 1-2 0v-1.062a8.005 8.005 0 0 1-6.919-6.796a1 1 0 0 1 1.98-.284a6.001 6.001 0 0 0 11.878 0a1 1 0 0 1 1.132-.848ZM12 2a5 5 0 0 1 5 5v5a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5"
                  />
                </g>
              </svg>
            )}
          </span>
        </Button>
      ) : (
        <p>Dein Browser wird nicht unterstützt.</p>
      )}
    </footer>
  );
}
