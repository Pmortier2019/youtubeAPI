import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0F172A',
          color: '#F1F5F9',
          fontFamily: 'inherit',
          gap: 24,
          padding: 32,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 48,
            color: '#F0B429',
          }}>⚠</div>
          <h1 style={{
            fontSize: 22,
            fontWeight: 600,
            margin: 0,
            color: '#F1F5F9',
          }}>
            Er is iets misgegaan.
          </h1>
          <p style={{
            fontSize: 15,
            color: '#94A3B8',
            margin: 0,
          }}>
            Ververs de pagina om het opnieuw te proberen.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '10px 28px',
              background: '#F0B429',
              color: '#0F172A',
              border: 'none',
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Ververs de pagina
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
