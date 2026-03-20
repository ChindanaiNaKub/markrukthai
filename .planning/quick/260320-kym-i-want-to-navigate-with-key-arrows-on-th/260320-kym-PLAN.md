---
phase: quick
plan: 260320-kym
type: execute
wave: 1
depends_on: []
files_modified:
  - client/src/components/LocalGame.tsx
  - client/src/components/BotGame.tsx
autonomous: true
requirements:
  - QUICK-001: Enable keyboard arrow navigation during gameplay
must_haves:
  truths:
    - "User can press arrow keys (Left/Right/Up/Down) during gameplay to navigate move history"
    - "User can press Home key to jump to initial position during gameplay"
    - "User can press End key to jump to latest position during gameplay"
    - "Board displays the position at the selected move index"
    - "Moves are locked (board disabled) while viewing history, not just after game over"
    - "User can return to live game by navigating to the latest move"
  artifacts:
    - path: "client/src/components/LocalGame.tsx"
      provides: "Local game with keyboard navigation during play"
      exports: ["LocalGame"]
    - path: "client/src/components/BotGame.tsx"
      provides: "Bot game with keyboard navigation during play"
      exports: ["BotGame"]
  key_links:
    - from: "LocalGame.tsx keyboard handler"
      to: "viewMoveIndex state"
      via: "setViewMoveIndex on arrow keys"
      pattern: "handleKeyDown.*ArrowLeft.*ArrowRight"
    - from: "MoveHistory onMoveClick"
      to: "viewMoveIndex state"
      via: "click handler during gameplay"
      pattern: "onMoveClick.*gameState.gameOver"
---

<objective>
Enable keyboard arrow navigation during gameplay to view previous positions

Purpose: Users want to review moves and navigate move history with arrow keys DURING gameplay, not only after the game ends. Currently, navigation is locked until game over.

Output: LocalGame and BotGame components with full keyboard navigation (Left/Right/Up/Down/Home/End) during active gameplay
</objective>

<execution_context>
@/home/prab/.claude/get-shit-done/workflows/execute-plan.md
@/home/prab/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@client/src/components/LocalGame.tsx
@client/src/components/BotGame.tsx
@client/src/components/AnalysisPage.tsx
@client/src/components/MoveHistory.tsx

## Current Issue

Both LocalGame and BotGame have keyboard navigation handlers with this condition:
```tsx
if (!gameState.gameOver || gameState.moveHistory.length === 0) return;
```

This prevents arrow key navigation during gameplay. The MoveHistory component also only enables `onMoveClick` when `gameState.gameOver` is true:
```tsx
onMoveClick={gameState.gameOver ? handleMoveClick : undefined}
```

## Reference Implementation

AnalysisPage.tsx shows the working pattern (lines 116-138):
```tsx
useEffect(() => {
  if (!gameData) return;
  const moveCount = gameData.moves.length;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setViewMoveIndex(prev => Math.max(-1, prev - 1));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setViewMoveIndex(prev => Math.min(moveCount - 1, prev + 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setViewMoveIndex(-1);
    } else if (e.key === 'End') {
      e.preventDefault();
      setViewMoveIndex(moveCount - 1);
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [gameData]);
```

Note: No check for `gameOver` - navigation always available.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Enable keyboard navigation during gameplay in LocalGame</name>
  <files>client/src/components/LocalGame.tsx</files>
  <action>
    Modify the keyboard navigation useEffect (currently lines 27-51):

    1. Change the condition from:
       ```tsx
       if (!gameState.gameOver || gameState.moveHistory.length === 0) return;
       ```
       To:
       ```tsx
       if (gameState.moveHistory.length === 0) return;
       ```

    2. Remove `gameState.gameOver` check from MoveHistory `onMoveClick` prop (line 248):
       Change from:
       ```tsx
       onMoveClick={gameState.gameOver ? handleMoveClick : undefined}
       ```
       To:
       ```tsx
       onMoveClick={handleMoveClick}
       ```

    This allows keyboard and click navigation during gameplay. The board is already properly disabled when viewing history via `isViewingHistory` state (line 194: `legalMoves={isViewingHistory ? [] : legalMoves}` and line 201: `disabled={gameState.gameOver || isViewingHistory}`).

    Also update the hint text (line 252) to remove the "gameOver &&" condition:
       Change from:
       ```tsx
       {gameState.gameOver && gameState.moveHistory.length > 0 && (
       ```
       To:
       ```tsx
       {gameState.moveHistory.length > 0 && (
       ```
       And update the text from "Use arrow keys to navigate moves" to indicate navigation is available during play.
  </action>
  <verify>
    <automated>npm run build -- --mode development 2>&1 | grep -i "error\|warning" | head -20 || echo "Build successful"</automated>
  </verify>
  <done>Keyboard navigation (ArrowLeft/Right/Up/Down/Home/End) works during active gameplay in LocalGame</done>
</task>

<task type="auto">
  <name>Task 2: Enable keyboard navigation during gameplay in BotGame</name>
  <files>client/src/components/BotGame.tsx</files>
  <action>
    Apply the same changes as Task 1 to BotGame.tsx:

    1. Modify the keyboard navigation useEffect (currently lines 113-137):
       Change the condition from:
       ```tsx
       if (!gameState.gameOver || gameState.moveHistory.length === 0) return;
       ```
       To:
       ```tsx
       if (gameState.moveHistory.length === 0) return;
       ```

    2. Remove `gameState.gameOver` check from MoveHistory `onMoveClick` prop (line 503):
       Change from:
       ```tsx
       onMoveClick={gameState.gameOver ? handleMoveClick : undefined}
       ```
       To:
       ```tsx
       onMoveClick={handleMoveClick}
       ```

    3. Update the hint text (line 506):
       Change from:
       ```tsx
       {gameState.gameOver && gameState.moveHistory.length > 0 && (
       ```
       To:
       ```tsx
       {gameState.moveHistory.length > 0 && (
       ```
       And update the text to indicate navigation is available during play.

    Note: BotGame has premove functionality. When viewing history, the board should remain disabled for moves (already handled by `isViewingHistory` on line 438).
  </action>
  <verify>
    <automated>npm run build -- --mode development 2>&1 | grep -i "error\|warning" | head -20 || echo "Build successful"</automated>
  </verify>
  <done>Keyboard navigation (ArrowLeft/Right/Up/Down/Home/End) works during active gameplay in BotGame</done>
</task>

</tasks>

<verification>
1. Start a local game and make several moves
2. Press ArrowLeft/Up to navigate to previous moves during gameplay
3. Press ArrowRight/Down to navigate forward through moves
4. Press Home to jump to initial position
5. Press End to return to latest position
6. Verify board is disabled while viewing history (cannot make moves)
7. Verify clicking moves in MoveHistory works during gameplay
8. Repeat for bot game
</verification>

<success_criteria>
- Arrow keys (Left/Right/Up/Down) navigate move history during active gameplay
- Home/End keys jump to start/end of move history during gameplay
- Board interaction is disabled while viewing history (moves locked)
- User can return to live game by navigating to latest move
- No TypeScript errors after changes
- Build completes successfully
</success_criteria>

<output>
After completion, create `.planning/quick/260320-kym-i-want-to-navigate-with-key-arrows-on-th/260320-kym-SUMMARY.md`
</output>
