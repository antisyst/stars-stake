import { viewport } from "@telegram-apps/sdk";

export const waitForViewportMount = async (): Promise<void> => {
  while (!viewport.isMounted()) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};