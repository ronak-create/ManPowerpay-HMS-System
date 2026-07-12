import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './ui/Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Frontend Crash:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neu flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-neu rounded-3xl shadow-neu-lg p-10 animate-scale-in">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500 bg-neu"
              style={{ boxShadow: 'inset 4px 4px 9px rgba(176,148,112,.3), inset -4px -4px 9px rgba(255,255,255,.85)' }}
            >
              <AlertTriangle size={40} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              The application encountered an unexpected error. Don't worry, your data is safe. Please try refreshing the page.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full btn-primary"
                icon={<RefreshCw size={18} />}
              >
                Refresh Application
              </Button>
              <Button 
                onClick={() => this.setState({ hasError: false })} 
                variant="ghost" 
                className="w-full text-xs text-gray-400"
              >
                Try to recover session
              </Button>
            </div>
            {import.meta.env.DEV && (
              <div className="mt-8 text-left p-4 bg-gray-900 rounded-xl overflow-hidden">
                <p className="text-xs font-mono text-red-400 break-all">{this.state.error?.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
