"use client";

import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="text-center max-w-lg mx-auto">
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-accent"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold font-[var(--font-heading)] text-foreground mb-4">
              حدث خطأ ما
            </h2>

            <p className="text-text-muted mb-2 leading-relaxed">
              نعتذر، يبدو أن هناك خطأ غير متوقع قد حدث.
            </p>

            {this.state.error && (
              <p className="text-sm text-text-muted/70 bg-surface border border-border rounded-xl px-4 py-3 mb-8 font-mono leading-relaxed">
                {this.state.error.message}
              </p>
            )}

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={this.reset}
                className="px-6 py-3 rounded-xl bg-accent text-white font-[var(--font-heading)] font-semibold text-sm hover:bg-accent-dark transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 active:scale-95"
              >
                حاول مرة أخرى
              </button>
              <a
                href="/"
                className="px-6 py-3 rounded-xl bg-surface border border-border text-foreground font-[var(--font-heading)] font-semibold text-sm hover:bg-surface-hover transition-all duration-300 active:scale-95"
              >
                العودة للرئيسية
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
