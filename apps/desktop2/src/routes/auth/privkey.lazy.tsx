import { LoaderIcon } from "@lume/icons";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createLazyFileRoute("/auth/privkey")({
  component: Screen,
});

function Screen() {
  const { ark } = Route.useRouteContext();
  const navigate = useNavigate();

  const [key, setKey] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!key.startsWith("nsec1"))
      return toast.warning(
        "You need to enter a valid private key starts with nsec or ncryptsec",
      );
    if (key.length < 30)
      return toast.warning("You need to enter a valid private key");

    setLoading(true);

    try {
      const npub = await ark.save_account(key, password);
      navigate({
        to: "/auth/settings",
        search: { account: npub, new: false },
        replace: true,
      });
    } catch (e) {
      toast.error(e);
    }

    setLoading(false);
  };

  return (
    <div className="mx-auto flex h-full w-full flex-col items-center justify-center gap-6 px-5 xl:max-w-xl">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Continue with Private Key</h3>
      </div>
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="key"
            className="font-medium text-neutral-900 dark:text-neutral-100"
          >
            Private Key
          </label>
          <input
            name="key"
            type="text"
            placeholder="nsec or ncryptsec..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="h-11 rounded-lg border-transparent bg-neutral-100 px-3 placeholder:text-neutral-500 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-neutral-950 dark:placeholder:text-neutral-400 dark:focus:ring-blue-800"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="font-medium text-neutral-900 dark:text-neutral-100"
          >
            Password (Optional)
          </label>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-lg border-transparent bg-neutral-100 px-3 placeholder:text-neutral-500 focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-neutral-950 dark:placeholder:text-neutral-400 dark:focus:ring-blue-800"
          />
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="mt-3 inline-flex h-11 w-full shrink-0  items-center justify-center rounded-lg bg-blue-500 font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? <LoaderIcon className="size-4 animate-spin" /> : "Login"}
        </button>
      </div>
    </div>
  );
}