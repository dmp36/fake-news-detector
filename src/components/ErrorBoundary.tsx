import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ShieldAlert, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-deep flex items-center justify-center p-6 text-center">
          <div className="glass p-12 rounded-[2.5rem] max-w-lg border-rose-500/20">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center text-rose-500 mx-auto mb-8">
              <ShieldAlert size={48} />
            </div>
            <h1 className="text-3xl font-black text-white mb-4">Oops! Something went wrong</h1>
            <p className="text-slate-400 mb-8 leading-relaxed">
              We encountered an unexpected error. Please try refreshing the page or contact support if the issue persists.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/30 transition-all flex items-center gap-2 mx-auto"
            >
              <RotateCcw size={20} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
