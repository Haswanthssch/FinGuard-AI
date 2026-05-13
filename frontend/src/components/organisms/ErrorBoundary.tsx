import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-xl bg-red-50 text-red-900 border border-red-200 rounded-lg m-xl">
          <h2 className="text-h2 font-bold mb-md">Something went wrong.</h2>
          <p className="text-body mb-sm">The application encountered an unexpected error.</p>
          <pre className="text-caption bg-white p-sm rounded border border-red-100 overflow-auto">
            {this.state.error?.message}
          </pre>
          <button
            className="mt-lg px-md py-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
