'use client';

import { usePlayer } from "@/lib/PlayerContext";
import Player from "./Player";

export default function GlobalPlayer() {
  const { state, close, playNext, playPrev } = usePlayer();

  if (!state.audioUrl) return null;

  return (
    <Player
      audioUrl={state.audioUrl}
      title={state.title}
      cover={state.cover}
      onClose={close}
      onNext={playNext}
      onPrev={playPrev}
      hasNext={state.chapterIndex < state.chapters.length - 1}
      hasPrev={state.chapterIndex > 0}
    />
  );
}
