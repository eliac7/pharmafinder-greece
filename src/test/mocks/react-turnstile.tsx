import type { MouseEvent } from "react";

export function Turnstile({ onSuccess }: { onSuccess?: (token: string) => void }) {
  const handleClick = (_event: MouseEvent<HTMLButtonElement>) => {
    onSuccess?.("test-turnstile-token");
  };

  return <button type="button" data-testid="turnstile" onClick={handleClick}>Turnstile</button>;
}
