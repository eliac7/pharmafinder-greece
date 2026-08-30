export function Turnstile({ onSuccess }: { onSuccess?: (token: string) => void }) {
  const handleClick = () => {
    onSuccess?.("test-turnstile-token");
  };

  return <button type="button" data-testid="turnstile" onClick={handleClick}>Turnstile</button>;
}
