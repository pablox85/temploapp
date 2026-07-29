"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";

const STORAGE_KEY = "temploapp-floating-back-button-position";
const HISTORY_STORAGE_KEY = "temploapp-dashboard-history";
const BUTTON_WIDTH = 104;
const BUTTON_HEIGHT = 48;
const VIEWPORT_MARGIN = 12;

type Position = { x: number; y: number };

function clampPosition(position: Position): Position {
  return {
    x: Math.min(Math.max(VIEWPORT_MARGIN, position.x), window.innerWidth - BUTTON_WIDTH - VIEWPORT_MARGIN),
    y: Math.min(Math.max(VIEWPORT_MARGIN, position.y), window.innerHeight - BUTTON_HEIGHT - VIEWPORT_MARGIN),
  };
}

function defaultPosition(): Position {
  return {
    x: Math.max(VIEWPORT_MARGIN, window.innerWidth - BUTTON_WIDTH - 20),
    y: Math.max(VIEWPORT_MARGIN, window.innerHeight - BUTTON_HEIGHT - 20),
  };
}

function getDashboardHistory(): string[] {
  try {
    const saved: unknown = JSON.parse(window.sessionStorage.getItem(HISTORY_STORAGE_KEY) ?? "[]");
    return Array.isArray(saved) && saved.every((path) => typeof path === "string") ? saved : [];
  } catch {
    window.sessionStorage.removeItem(HISTORY_STORAGE_KEY);
    return [];
  }
}

function saveDashboardHistory(paths: string[]) {
  window.sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(paths.slice(-20)));
}

export function FloatingBackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pointerStart = useRef<Position | null>(null);
  const dragOrigin = useRef<Position | null>(null);
  const didDrag = useRef(false);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
        if (
          saved
          && typeof saved === "object"
          && "x" in saved
          && "y" in saved
          && typeof saved.x === "number"
          && typeof saved.y === "number"
        ) {
          setPosition(clampPosition({ x: saved.x, y: saved.y }));
          return;
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setPosition(defaultPosition());
    });
  }, []);

  useEffect(() => {
    if (!pathname.startsWith("/dashboard")) return;

    const paths = getDashboardHistory();
    if (paths.at(-1) === pathname) return;

    if (paths.at(-2) === pathname) {
      saveDashboardHistory(paths.slice(0, -1));
      return;
    }

    saveDashboardHistory([...paths, pathname]);
  }, [pathname]);

  useEffect(() => {
    function keepInViewport() {
      setPosition((current) => current ? clampPosition(current) : current);
    }

    window.addEventListener("resize", keepInViewport);
    return () => window.removeEventListener("resize", keepInViewport);
  }, []);

  function handlePointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (!position) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointerStart.current = { x: event.clientX, y: event.clientY };
    dragOrigin.current = position;
    didDrag.current = false;
    setIsDragging(true);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (!pointerStart.current || !dragOrigin.current) return;
    const deltaX = event.clientX - pointerStart.current.x;
    const deltaY = event.clientY - pointerStart.current.y;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) didDrag.current = true;
    setPosition(clampPosition({ x: dragOrigin.current.x + deltaX, y: dragOrigin.current.y + deltaY }));
  }

  function finishDragging() {
    setIsDragging(false);
    pointerStart.current = null;
    dragOrigin.current = null;
    setPosition((current) => {
      if (current) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      return current;
    });
  }

  function handleClick() {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }

    if (pathname === "/dashboard") {
      saveDashboardHistory(["/dashboard"]);
      return;
    }

    const paths = getDashboardHistory();
    if (pathname.startsWith("/dashboard") && paths.at(-1) === pathname && paths.length > 1) {
      const previousPath = paths.at(-2);
      if (previousPath) {
        saveDashboardHistory(paths.slice(0, -1));
        router.push(previousPath);
        return;
      }
    }

    saveDashboardHistory(["/dashboard"]);
    router.push("/dashboard");
  }

  if (!position) return null;

  return (
    <button
      type="button"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDragging}
      onPointerCancel={finishDragging}
      onClick={handleClick}
      className={`fixed z-50 inline-flex h-12 w-[104px] touch-none items-center justify-center gap-2 rounded-full border border-teal-500/30 bg-teal-600 px-4 text-sm font-semibold text-white shadow-lg shadow-teal-950/25 transition hover:bg-teal-700 focus-visible:ring-4 focus-visible:ring-teal-500/30 focus-visible:outline-none ${isDragging ? "scale-105 cursor-grabbing" : "cursor-grab"}`}
      style={{ left: position.x, top: position.y }}
      aria-label="Volver dentro de TemploAPP. Arrastra para mover el botón."
      title="Volver al movimiento anterior · arrastra para mover"
    >
      <ArrowLeftIcon className="size-4" />
      Volver
    </button>
  );
}
