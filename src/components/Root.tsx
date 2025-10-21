import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';
import { ToastProvider } from '@/contexts/ToastContext';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { RatesProvider } from '@/contexts/RatesContext';
import { HistoryProvider } from '@/contexts/HistoryContext';
import { publicUrl } from '@/helpers/publicUrl.ts';

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === 'string'
            ? error
            : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <TonConnectUIProvider manifestUrl={publicUrl('tonconnect-manifest.json')}>
        <AppDataProvider>
          <HistoryProvider>
            <ToastProvider>
              <RatesProvider>
                <App />
              </RatesProvider>
            </ToastProvider>
          </HistoryProvider>
        </AppDataProvider>
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
}