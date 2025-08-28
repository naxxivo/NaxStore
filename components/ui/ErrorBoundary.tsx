import React, { Component, ReactNode } from 'react';
import Button from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.hasError && !this.state.hasError) {
      if (this.props.children !== prevProps.children) {
        this.setState({ retryCount: 0 });
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      retryCount: prevState.retryCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.state.retryCount >= 3) {
        return this.props.fallback || (
          <div className="text-center p-8 bg-[hsl(var(--card))] rounded-lg shadow-lg m-auto">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h2>
            <p className="text-[hsl(var(--muted-foreground))]">We've tried to recover, but it's not working. Please refresh the page or contact support.</p>
          </div>
        );
      }
      return this.props.fallback || (
        <div className="text-center p-8 bg-[hsl(var(--card))] rounded-lg shadow-lg m-auto">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong.</h2>
          <Button onClick={this.handleRetry}>
            Retry ({this.state.retryCount}/3)
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
