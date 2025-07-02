import React, {createContext, useContext, useState} from 'react';

const PlayingMusicBarHeightContext = createContext({
  musicBarHeight: 80,
  setMusicBarHeight: (h: number) => {},
});

export function PlayingMusicBarHeightProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [musicBarHeight, setMusicBarHeight] = useState(80);
  return (
    <PlayingMusicBarHeightContext.Provider
      value={{musicBarHeight, setMusicBarHeight}}>
      {children}
    </PlayingMusicBarHeightContext.Provider>
  );
}

export function usePlayingMusicBarHeight() {
  return useContext(PlayingMusicBarHeightContext);
}
