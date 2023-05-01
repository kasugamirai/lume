import CancelIcon from '@lume/shared/icons/cancel';
import MuteIcon from '@lume/shared/icons/mute';
import { RelayContext } from '@lume/shared/relayProvider';
import Tooltip from '@lume/shared/tooltip';
import { channelMessagesAtom } from '@lume/stores/channel';
import { WRITEONLY_RELAYS } from '@lume/stores/constants';
import { dateToUnix } from '@lume/utils/getDate';
import { useActiveAccount } from '@lume/utils/hooks/useActiveAccount';

import { Dialog, Transition } from '@headlessui/react';
import { useAtom } from 'jotai';
import { getEventHash, signEvent } from 'nostr-tools';
import { Fragment, useContext, useState } from 'react';

export default function MessageMuteButton({ pubkey }: { pubkey: string }) {
  const pool: any = useContext(RelayContext);
  const { account, isError, isLoading } = useActiveAccount();

  const [messages, setMessages] = useAtom(channelMessagesAtom);
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const muteUser = () => {
    if (!isError && !isLoading && account) {
      const event: any = {
        content: '',
        created_at: dateToUnix(),
        kind: 44,
        pubkey: account.pubkey,
        tags: [['p', pubkey]],
      };
      event.id = getEventHash(event);
      event.sig = signEvent(event, account.privkey);

      // publish note
      pool.publish(event, WRITEONLY_RELAYS);
      // update local state
      const cloneMessages = [...messages];
      const finalMessages = cloneMessages.filter((message) => message.pubkey !== pubkey);
      setMessages(finalMessages);
      // close modal
      closeModal();
    } else {
      console.log('error');
    }
  };

  return (
    <>
      <Tooltip message="Mute this user">
        <button
          onClick={() => openModal()}
          className="inline-flex h-7 w-7 items-center justify-center rounded hover:bg-zinc-800"
        >
          <MuteIcon width={16} height={16} className="text-zinc-200" />
        </button>
      </Tooltip>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-md data-[state=open]:animate-overlayShow" />
          </Transition.Child>
          <div className="fixed inset-0 z-50 flex min-h-full items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative flex h-min w-full max-w-lg flex-col rounded-lg border border-zinc-800 bg-zinc-900">
                <div className="h-min w-full shrink-0 border-b border-zinc-800 px-5 py-6">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <Dialog.Title
                        as="h3"
                        className="bg-gradient-to-br from-zinc-200 to-zinc-400 bg-clip-text text-2xl font-semibold leading-none text-transparent"
                      >
                        Are you sure!
                      </Dialog.Title>
                      <button
                        type="button"
                        onClick={closeModal}
                        autoFocus={false}
                        className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-zinc-900"
                      >
                        <CancelIcon width={20} height={20} className="text-zinc-300" />
                      </button>
                    </div>
                    <Dialog.Description className="leading-tight text-zinc-400">
                      You will no longer see messages from this user.
                    </Dialog.Description>
                  </div>
                </div>
                <div className="flex h-full w-full flex-col items-end justify-center overflow-y-auto px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex h-9 items-center justify-center rounded-md px-2 text-sm font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => muteUser()}
                      className="inline-flex h-9 items-center justify-center rounded-md bg-red-500 px-2 text-sm font-medium text-zinc-100 hover:bg-red-600"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}