import { useNavigate } from 'react-router-dom';
import Header from './Header';
import LiveGamesPanel from './LiveGamesPanel';
import { useTranslation } from '../lib/i18n';
import { routes } from '../lib/routes';
import { usePublicLiveGames } from '../hooks/usePublicLiveGames';

export default function LiveGamesPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { games, loading } = usePublicLiveGames({ status: 'all', limit: 24 });
  const liveGames = games.filter((game) => game.status === 'playing');
  const finishedGames = games.filter((game) => game.status === 'finished');

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header active="watch" />

      <main id="main-content" className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
          <LiveGamesPanel
            games={liveGames}
            loading={loading}
            title={t('live.title')}
            description={t('live.desc')}
            emptyTitle={t('live.empty_title')}
            emptyDesc={t('live.empty_desc')}
          />

          {(finishedGames.length > 0 || loading) && (
            <LiveGamesPanel
              games={finishedGames}
              loading={loading && liveGames.length === 0}
              title={t('live.recently_finished')}
              description={t('live.recently_finished_desc')}
              emptyTitle={t('live.empty_title')}
              emptyDesc={t('live.empty_desc')}
            />
          )}

          <div className="rounded-2xl border border-surface-hover bg-surface-alt/80 px-5 py-5 text-center">
            <p className="text-sm text-text-dim">{t('home.watch_live_desc')}</p>
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => navigate(routes.quickPlay)}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
              >
                {t('home.find_opponent')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
