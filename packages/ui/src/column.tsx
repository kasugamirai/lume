import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  LogicalPosition,
  LogicalSize,
  getCurrent,
} from "@tauri-apps/api/window";
import { Webview } from "@tauri-apps/api/webview";
import { LumeColumn } from "@lume/types";
import { useDebouncedCallback } from "use-debounce";
import { type UnlistenFn } from "@tauri-apps/api/event";

export function Column({
  column,
  isScroll,
}: {
  column: LumeColumn;
  isScroll: boolean;
}) {
  const mainWindow = useMemo(() => getCurrent(), []);
  const childWindow = useRef<Webview>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const initialRect = useRef<DOMRect>(null);
  const unlisten = useRef<UnlistenFn>(null);
  const handleResize = useDebouncedCallback(() => {
    const newRect = divRef.current.getBoundingClientRect();
    if (initialRect.current.height !== newRect.height) {
      childWindow.current.setSize(
        new LogicalSize(newRect.width, newRect.height),
      );
    }
  }, 500);

  const trackResize = useCallback(async () => {
    unlisten.current = await mainWindow.onResized(() => {
      handleResize();
    });
  }, []);

  useEffect(() => {
    if (isScroll) {
      const newRect = divRef.current.getBoundingClientRect();
      childWindow.current.setPosition(
        new LogicalPosition(newRect.x, newRect.y),
      );
    }
  }, [isScroll]);

  useEffect(() => {
    if (!mainWindow) return;
    if (!divRef.current) return;
    if (childWindow.current) return;

    const rect = divRef.current.getBoundingClientRect();
    const name = column.name.toLowerCase().replace(/\W/g, "");

    // create new webview
    initialRect.current = rect;
    childWindow.current = new Webview(mainWindow, name, {
      url: column.content,
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      transparent: true,
      userAgent: "Lume/4.0",
    });

    // track window resize event
    trackResize();

    return () => {
      if (unlisten.current) unlisten.current();
    };
  }, []);

  return (
    <div className="shadow-primary relative flex h-full w-[420px] shrink-0 flex-col rounded-xl bg-white dark:bg-black">
      <div className="flex h-11 w-full shrink-0 items-center justify-center gap-2 border-b border-neutral-100 dark:border-neutral-900">
        <div className="inline-flex items-center gap-1.5">
          <div className="text-[13px] font-medium">{column.name}</div>
        </div>
      </div>
      <div ref={divRef} className="flex-1" />
      <div className="h-6 w-full shrink-0 border-t border-neutral-100 dark:border-neutral-900" />
    </div>
  );
}
