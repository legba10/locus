"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

/**
 * TZ-2: глобальный ловец ошибок — при падении показываем «Что-то пошло не так» + кнопку «Перезагрузить».
 * Без белого экрана.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div
          className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6 text-center"
          style={{ background: "var(--bg-main)", color: "var(--text-primary)" }}
        >
          <h1 className="text-xl font-semibold">Что-то пошло не так</h1>
          <p className="text-[var(--text-muted)] max-w-md">
            Произошла ошибка. Попробуйте перезагрузить страницу.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              background: "var(--primary)",
              color: "var(--primary-contrast)",
            }}
          >
            Перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
