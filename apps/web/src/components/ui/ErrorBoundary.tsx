import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-hayl-bg text-hayl-text font-sans flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <p className="text-[10px] font-heading font-bold uppercase tracking-[0.35em] text-hayl-muted">
              SYSTEM FAILURE
            </p>
            <h1 className="text-4xl font-heading font-black italic uppercase tracking-tight">
              Something went wrong.
            </h1>
            <p className="text-sm text-hayl-muted leading-relaxed">
              The engine crashed while rendering this view. Reload to recover.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full py-3 bg-hayl-text text-hayl-bg font-heading font-bold uppercase tracking-[0.2em] rounded-full"
            >
              Reload Engine
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
