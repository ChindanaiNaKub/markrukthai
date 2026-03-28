import type { ReactNode } from 'react';

interface GameScreenLayoutProps {
  boardColumn: ReactNode;
  sidePanel: ReactNode;
  boardColumnClassName?: string;
  sidePanelClassName?: string;
}

const DEFAULT_BOARD_COLUMN_CLASS =
  'flex flex-col items-center gap-2 w-full lg:flex-1 lg:max-w-[calc(100vh-180px)] max-w-[720px]';
const DEFAULT_SIDE_PANEL_CLASS = 'flex flex-col gap-3 lg:w-72 w-full max-w-[720px]';

export default function GameScreenLayout({
  boardColumn,
  sidePanel,
  boardColumnClassName = DEFAULT_BOARD_COLUMN_CLASS,
  sidePanelClassName = DEFAULT_SIDE_PANEL_CLASS,
}: GameScreenLayoutProps) {
  return (
    <main id="main-content" className="flex-1 flex items-center justify-center p-4 sm:p-6 py-4">
      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 w-full max-w-[1100px]">
        <div className={boardColumnClassName}>
          {boardColumn}
        </div>
        <div className={sidePanelClassName}>
          {sidePanel}
        </div>
      </div>
    </main>
  );
}
