export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F3EE',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        maxWidth: '600px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          color: '#8B9D83',
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          ПроСхему
        </h1>
        <p style={{
          color: '#6B6B6B',
          fontSize: '18px',
          marginBottom: '24px'
        }}>
          Приложение успешно загружено! ✅
        </p>
        <div style={{
          background: '#8B9D83',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          display: 'inline-block',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          Версия для тестирования
        </div>
      </div>
    </div>
  );
}
