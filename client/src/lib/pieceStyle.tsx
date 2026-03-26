import { createContext, useContext } from 'react';

export type PieceStyle = 'traditional';

type PieceStyleContextValue = {
  pieceStyle: PieceStyle;
};

const PieceStyleContext = createContext<PieceStyleContextValue | null>(null);

export function PieceStyleProvider({ children }: { children: React.ReactNode }) {
  return (
    <PieceStyleContext.Provider value={{ pieceStyle: 'traditional' }}>
      {children}
    </PieceStyleContext.Provider>
  );
}

export function usePieceStyle() {
  const context = useContext(PieceStyleContext);
  if (!context) {
    throw new Error('usePieceStyle must be used within PieceStyleProvider');
  }
  return context;
}
