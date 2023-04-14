import dynamic from 'next/dynamic';

const AppActions = dynamic(() => import('@components/appHeader/actions'), {
  ssr: false,
});

const EventCollector = dynamic(() => import('@components/eventCollector'), {
  ssr: false,
});

export default function AppHeader() {
  return (
    <div data-tauri-drag-region className="flex h-full w-full flex-1 items-center px-2">
      <AppActions />
      <div data-tauri-drag-region className="flex h-full w-full items-center justify-between">
        <div className="flex h-full items-center divide-x divide-zinc-900 px-4 pt-px"></div>
        <div>
          <EventCollector />
        </div>
      </div>
    </div>
  );
}