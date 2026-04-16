import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            textAlign: 'center',
            border: '1px solid rgba(139, 157, 131, 0.2)',
          }}>
            <h2 style={{
              fontFamily: 'Georgia, serif',
              color: '#2D2D2D',
              marginBottom: '1rem',
            }}>
              Что-то пошло не так
            </h2>
            <p style={{
              fontFamily: 'Arial, sans-serif',
              color: '#6B6B6B',
              marginBottom: '1.5rem',
            }}>
              Произошла ошибка при загрузке компонента. Пожалуйста, перезагрузите страницу.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#8B9D83',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Arial, sans-serif',
                fontWeight: 500,
              }}
            >
              Перезагрузить страницу
            </button>
            {this.state.error && (
              <details style={{
                marginTop: '1rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                color: '#6B6B6B',
              }}>
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                  Технические детали
                </summary>
                <pre style={{
                  background: '#F5F3EE',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  overflow: 'auto',
                  fontFamily: 'Consolas, monospace',
                  fontSize: '0.75rem',
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
