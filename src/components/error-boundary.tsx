import React from "react";
import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          An unexpected error occurred. You can try again or reload the page.
        </p>
      </div>

      {error.message && (
        <div className="w-full max-w-md overflow-hidden rounded-lg border bg-muted/50">
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-muted-foreground">
              Error details
            </p>
          </div>
          <Separator />
          <div className="px-4 py-3">
            <code className="break-all text-xs text-destructive">
              {error.message}
            </code>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.location.reload()}>
          <RotateCcw />
          Reload page
        </Button>
        <Button onClick={resetError}>
          <RefreshCw />
          Try again
        </Button>
      </div>
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (props: ErrorFallbackProps) => React.ReactNode;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  resetError() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const fallbackProps: ErrorFallbackProps = {
        error: this.state.error,
        resetError: this.resetError,
      };

      return this.props.fallback
        ? this.props.fallback(fallbackProps)
        : <ErrorFallback {...fallbackProps} />;
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
