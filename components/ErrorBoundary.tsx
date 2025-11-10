import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-100 p-4">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Ocorreu um Erro Inesperado</h1>
            <p className="text-center mb-4">A aplicação encontrou um problema e não pôde continuar. Por favor, tente recarregar a página.</p>
            <p className="text-sm text-slate-400 mb-6">Se o problema persistir, pode ser útil limpar o cache do seu navegador.</p>
            <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-brand-accent text-white rounded-md hover:bg-blue-600"
            >
                Recarregar Página
            </button>
            {this.state.error && (
                <pre className="mt-8 p-4 bg-slate-800 text-red-400 rounded-md text-xs overflow-auto w-full max-w-2xl">
                    {this.state.error.toString()}
                </pre>
            )}
        </div>
      );
    }

    // Fix: Correctly access children from this.props.
    return this.props.children;
  }
}

export default ErrorBoundary;
