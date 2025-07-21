import { useEffect, useRef } from "react";

export function useChatScroll(dep: unknown) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (ref.current) {
        ref.current.scrollTop = ref.current.scrollHeight;
      }
    }, 100);
  }, [dep]);

  return ref;
}
