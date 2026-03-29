import { useNavigate } from 'react-router-dom';
import type { PublicLiveGameSummary } from '@shared/types';
import { spectatorGameRoute } from '../lib/routes';
import { useTranslation } from '../lib/i18n';

interface LiveGamesPanelProps {
  games: PublicLiveGameSummary[];
  loading?: boolean;
  title: string;
  description: string;
  emptyTitle: string;
  emptyDesc: string;
  compact?: boolean;
  showViewAll?: boolean;
  viewAllLabel?: string;
  onViewAll?: () => void;
}

function formatTimeControl(initial: number, increment: number) {
  const minutes = initial / 60;
  const base = Number.isInteger(minutes) ? minutes.toString() : (Math.round(minutes * 10) / 10).toString();
  return `${base}+${increment}`;
}

function formatUpdatedLabel(lastMoveAt: number, t: ReturnType<typeof useTranslation>['t']) {
  const minutes = Math.floor((Date.now() - lastMoveAt) / 60000);
  return minutes <= 0 ? t('live.just_now') : t('live.updated', { n: minutes });
}

function formatModeLabel(game: PublicLiveGameSummary, t: ReturnType<typeof useTranslation>['t']) {
  if (game.gameMode !== 'quick_play') return t('live.mode_quick_play');
  return game.rated ? t('live.mode_rated') : t('live.mode_casual');
}

function formatPlayerLabel(name: string | null, rating: number | null, fallback: string) {
  const displayName = name?.trim() || fallback;
  return typeof rating === 'number' ? `${displayName} (${rating})` : displayName;
}

export default function LiveGamesPanel({
  games,
  loading = false,
  title,
  description,
  emptyTitle,
  emptyDesc,
  compact = false,
  showViewAll = false,
  viewAllLabel,
  onViewAll,
}: LiveGamesPanelProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="rounded-2xl border border-surface-hover bg-surface-alt/85 p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{title}</p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-dim">{description}</p>
        </div>
        {showViewAll && onViewAll && viewAllLabel && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center justify-center rounded-lg border border-surface-hover bg-surface px-4 py-2 text-sm font-semibold text-text-bright transition-colors hover:bg-surface-hover"
          >
            {viewAllLabel}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : games.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-surface-hover bg-surface/55 px-5 py-8 text-center">
          <div className="text-lg font-semibold text-text-bright">{emptyTitle}</div>
          <div className="mt-2 text-sm text-text-dim">{emptyDesc}</div>
        </div>
      ) : (
        <div className={`mt-5 grid gap-3 ${compact ? 'md:grid-cols-2' : 'lg:grid-cols-2 xl:grid-cols-3'}`}>
          {games.map((game) => (
            <article
              key={game.id}
              className="rounded-2xl border border-surface-hover bg-surface/55 p-4 shadow-[0_14px_30px_rgba(0,0,0,0.14)] transition-colors hover:bg-surface-hover/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-text-bright">
                    {formatPlayerLabel(game.whitePlayerName, game.whiteRating, t('common.white'))}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-text-bright">
                    {formatPlayerLabel(game.blackPlayerName, game.blackRating, t('common.black'))}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                  game.status === 'playing'
                    ? 'border border-danger/25 bg-danger/10 text-danger'
                    : 'border border-surface-hover bg-surface text-text-dim'
                }`}>
                  {game.status === 'playing' ? t('live.card_live') : t('live.card_finished')}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em] text-text-dim">
                <span className="rounded-full border border-surface-hover bg-surface px-2.5 py-1">
                  {formatModeLabel(game, t)}
                </span>
                <span className="rounded-full border border-surface-hover bg-surface px-2.5 py-1">
                  {formatTimeControl(game.timeControl.initial, game.timeControl.increment)}
                </span>
                <span className="rounded-full border border-surface-hover bg-surface px-2.5 py-1">
                  {t('live.moves', { count: game.moveCount })}
                </span>
                <span className="rounded-full border border-surface-hover bg-surface px-2.5 py-1">
                  {t('live.watchers', { count: game.spectatorCount })}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-xs text-text-dim">
                  {formatUpdatedLabel(game.lastMoveAt, t)}
                </div>
                <button
                  type="button"
                  onClick={() => navigate(spectatorGameRoute(game.id))}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
                >
                  {compact ? t('live.watch') : t('live.view_spectator')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
