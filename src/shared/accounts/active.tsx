import * as Avatar from '@radix-ui/react-avatar';
import { minidenticon } from 'minidenticons';
import { Link } from 'react-router-dom';

import { useArk } from '@libs/ark';

import { AccountMoreActions } from '@shared/accounts/more';
import { NetworkStatusIndicator } from '@shared/networkStatusIndicator';

import { useProfile } from '@utils/hooks/useProfile';

export function ActiveAccount() {
  const { ark } = useArk();
  const { user } = useProfile(ark.account.pubkey);

  const svgURI =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(minidenticon(ark.account.pubkey, 90, 50));

  return (
    <div className="flex flex-col gap-1 rounded-lg bg-neutral-100 p-1 ring-1 ring-transparent hover:bg-neutral-200 hover:ring-blue-500 dark:bg-neutral-900 dark:hover:bg-neutral-800">
      <Link to="/settings/" className="relative inline-block">
        <Avatar.Root>
          <Avatar.Image
            src={user?.picture || user?.image}
            alt={ark.account.pubkey}
            loading="lazy"
            decoding="async"
            style={{ contentVisibility: 'auto' }}
            className="aspect-square h-auto w-full rounded-md object-cover"
          />
          <Avatar.Fallback delayMs={150}>
            <img
              src={svgURI}
              alt={ark.account.pubkey}
              className="aspect-square h-auto w-full rounded-md bg-black dark:bg-white"
            />
          </Avatar.Fallback>
        </Avatar.Root>
        <NetworkStatusIndicator />
      </Link>
      <AccountMoreActions />
    </div>
  );
}
