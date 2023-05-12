import { AvatarUploader } from '@shared/avatarUploader';
import { Image } from '@shared/image';

import { DEFAULT_AVATAR } from '@stores/constants';
import { onboardingAtom } from '@stores/onboarding';

import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { navigate } from 'vite-plugin-ssr/client/router';

export function Page() {
  const [image, setImage] = useState(DEFAULT_AVATAR);
  const [loading, setLoading] = useState(false);
  const [onboarding, setOnboarding] = useAtom(onboardingAtom);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isDirty, isValid },
  } = useForm({
    defaultValues: async () => {
      if (onboarding.metadata) {
        return onboarding.metadata;
      } else {
        return null;
      }
    },
  });

  const onSubmit = (data: any) => {
    setLoading(true);
    setOnboarding((prev) => ({ ...prev, metadata: data }));
    navigate('/auth/create/step-3');
  };

  useEffect(() => {
    setValue('picture', image);
  }, [setValue, image]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-zinc-200">Create your profile</h1>
        </div>
        <div className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <input
              type={'hidden'}
              {...register('picture')}
              value={image}
              className="relative h-10 w-full rounded-lg border border-black/5 px-3 py-2 shadow-input shadow-black/5 !outline-none placeholder:text-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:shadow-black/10 dark:placeholder:text-zinc-500"
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Avatar</label>
              <div className="relative inline-flex h-36 w-full items-center justify-center overflow-hidden rounded-lg border border-zinc-900 bg-zinc-950">
                <Image src={image} alt="avatar" className="relative z-10 h-11 w-11 rounded-md" />
                <div className="absolute bottom-3 right-3 z-10">
                  <AvatarUploader valueState={setImage} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Display Name *</label>
              <div className="relative w-full shrink-0 overflow-hidden before:pointer-events-none before:absolute before:-inset-1 before:rounded-[11px] before:border before:border-fuchsia-500 before:opacity-0 before:ring-2 before:ring-fuchsia-500/20 before:transition after:pointer-events-none after:absolute after:inset-px after:rounded-[7px] after:shadow-highlight after:shadow-white/5 after:transition focus-within:before:opacity-100 focus-within:after:shadow-fuchsia-500/100 dark:focus-within:after:shadow-fuchsia-500/20">
                <input
                  type={'text'}
                  {...register('display_name', { required: true, minLength: 4 })}
                  spellCheck={false}
                  className="relative h-10 w-full rounded-lg border border-black/5 px-3 py-2 shadow-input shadow-black/5 !outline-none placeholder:text-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:shadow-black/10 dark:placeholder:text-zinc-500"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">About</label>
              <div className="relative h-20 w-full shrink-0 overflow-hidden before:pointer-events-none before:absolute before:-inset-1 before:rounded-[11px] before:border before:border-fuchsia-500 before:opacity-0 before:ring-2 before:ring-fuchsia-500/20 before:transition after:pointer-events-none after:absolute after:inset-px after:rounded-[7px] after:shadow-highlight after:shadow-white/5 after:transition focus-within:before:opacity-100 focus-within:after:shadow-fuchsia-500/100 dark:focus-within:after:shadow-fuchsia-500/20">
                <textarea
                  {...register('about')}
                  spellCheck={false}
                  className="relative h-20 w-full resize-none rounded-lg border border-black/5 px-3 py-2 shadow-input shadow-black/5 !outline-none placeholder:text-zinc-400 dark:bg-zinc-800 dark:text-zinc-200 dark:shadow-black/10 dark:placeholder:text-zinc-500"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={!isDirty || !isValid}
                className="w-full transform rounded-lg bg-fuchsia-500 px-3.5 py-2.5 font-medium text-white shadow-button hover:bg-fuchsia-600 active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <svg
                    className="h-4 w-4 animate-spin text-black dark:text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <span>Continue →</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}