import { NDKEvent } from '@nostr-dev-kit/ndk';
import { useQuery } from '@tanstack/react-query';

import { useNDK } from '@libs/ndk/provider';

import { NoteSkeleton, Reply } from '@shared/notes';

import { LumeEvent } from '@utils/types';

export function RepliesList({ id }: { id: string }) {
  const { relayUrls, fetcher } = useNDK();
  const { status, data } = useQuery(['thread', id], async () => {
    const events = (await fetcher.fetchAllEvents(
      relayUrls,
      { kinds: [1], '#e': [id] },
      { since: 0 }
    )) as unknown as LumeEvent[];
    if (events.length > 0) {
      const replies = new Set();
      events.forEach((event) => {
        const tags = event.tags.filter((el) => el[0] === 'e' && el[1] !== id);
        if (tags.length > 0) {
          tags.forEach((tag) => {
            const rootIndex = events.findIndex((el) => el.id === tag[1]);
            if (rootIndex) {
              const rootEvent = events[rootIndex];
              if (rootEvent.replies) {
                rootEvent.replies.push(event);
              } else {
                rootEvent.replies = [event];
              }
              replies.add(event.id);
            }
          });
        }
      });
      const cleanEvents = events.filter((ev) => !replies.has(ev.id));
      return cleanEvents;
    }
    return events;
  });

  if (status === 'loading') {
    return (
      <div className="mt-3">
        <div className="flex flex-col">
          <div className="rounded-xl border-t border-zinc-800/50 bg-zinc-900 px-3 py-3">
            <NoteSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="mb-2">
        <h5 className="text-lg font-semibold text-zinc-300">{data.length} replies</h5>
      </div>
      <div className="flex flex-col">
        {data?.length === 0 ? (
          <div className="px=3">
            <div className="flex w-full items-center justify-center rounded-xl bg-zinc-900">
              <div className="flex flex-col items-center justify-center gap-2 py-6">
                <h3 className="text-3xl">👋</h3>
                <p className="leading-none text-zinc-400">Share your thought on it...</p>
              </div>
            </div>
          </div>
        ) : (
          data.reverse().map((event: NDKEvent) => <Reply key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}
