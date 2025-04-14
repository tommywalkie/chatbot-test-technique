"use client";

import { useEffect, RefObject } from "react";

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
  excludeRefs: RefObject<HTMLElement | null>[] = []
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      // Vérifie si le clic est dans un des éléments exclus
      const isInExcludedElement = excludeRefs.some(
        (excludeRef) =>
          excludeRef.current &&
          excludeRef.current.contains(event.target as Node)
      );

      if (!isInExcludedElement) {
        handler();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler, excludeRefs]);
}
