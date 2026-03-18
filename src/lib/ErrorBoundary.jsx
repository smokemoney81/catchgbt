import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error);
    this.setState({ error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-bold">Fehler beim Laden</h1>
            <p className="text-gray-400 text-sm">{this.state.error?.message || 'Ein Fehler ist aufgetreten'}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold"
            >
              Neu laden
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}