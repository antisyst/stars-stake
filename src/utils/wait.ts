export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const waitFor = async (
  predicate: () => boolean,
  timeoutMs = 8000,
  intervalMs = 50
): Promise<boolean> => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate()) return true;
    await wait(intervalMs);
  }
  return predicate();
};