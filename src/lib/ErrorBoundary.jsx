import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ error });
  }

  handleRetry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: null, 
      retryCount: prevState.retryCount + 1 
    }));
  };

  handleFullPageReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isMinimalError = this.props.isMinimal === true;
      const isFull = this.props.isFull !== false;

      if (isMinimalError) {
        return (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
            <p className="text-sm text-red-400 mb-3">Komponente konnte nicht geladen werden</p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors min-h-[44px]"
              aria-label="Komponente erneut laden"
            >
              Erneut versuchen
            </button>
          </div>
        );
      }

      return (
        <div className={`${isFull ? 'min-h-screen' : 'p-6 rounded-lg'} bg-gray-950 text-white flex items-center justify-center`}>
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-bold">Fehler beim Laden</h1>
            <p className="text-gray-400 text-sm">{this.state.error?.message || 'Ein Fehler ist aufgetreten'}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleRetry}
                className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition-colors min-h-[44px]"
                aria-label="Seite erneut versuchen zu laden"
              >
                Erneut versuchen {this.state.retryCount > 0 && `(${this.state.retryCount})`}
              </button>
              <button
                onClick={this.handleFullPageReload}
                className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-semibold transition-colors min-h-[44px]"
                aria-label="Gesamte Seite neu laden"
              >
                Vollstaendiges Neuladen
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}