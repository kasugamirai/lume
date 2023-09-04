import { useQuery } from '@tanstack/react-query';

import { NoteSkeleton } from '@shared/notes/skeleton';
import { TitleBar } from '@shared/titleBar';
import { NostrBandUserProfile, type Profile } from '@shared/widgets/nostrBandUserProfile';

import { Widget } from '@utils/types';

interface Response {
  profiles: Array<{ pubkey: string }>;
}

export function TrendingAccountsWidget({ params }: { params: Widget }) {
  const { status, data } = useQuery(
    ['trending-profiles-widget'],
    async () => {
      const res = await fetch('https://api.nostr.band/v0/trending/profiles');
      if (!res.ok) {
        throw new Error('Error');
      }
      const json: Response = await res.json();
      if (!json.profiles) return [];
      return json.profiles;
    },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );

  return (
    <div className="relative shrink-0 grow-0 basis-[400px] bg-white/10 backdrop-blur-xl">
      <TitleBar id={params.id} title="Trending Accounts" />
      <div className="scrollbar-hide h-full max-w-full overflow-y-auto pb-20">
        {status === 'loading' ? (
          <div className="px-3 py-1.5">
            <div className="rounded-xl bg-white/10 px-3 py-3 backdrop-blur-xl">
              <NoteSkeleton />
            </div>
          </div>
        ) : status === 'error' ? (
          <div className="px-3 py-1.5">
            <div className="rounded-xl bg-white/10 px-3 py-3 backdrop-blur-xl">
              <p className="text-center text-sm font-medium text-white">
                Sorry, an unexpected error has occurred.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative flex w-full flex-col gap-3 px-3 pt-1.5">
            {data.map((item: Profile) => (
              <NostrBandUserProfile key={item.pubkey} data={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}