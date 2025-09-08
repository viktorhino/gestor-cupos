export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>✅ Aplicación Funcionando</h1>
      <p>Si puedes ver esta página, el deploy de Vercel está funcionando correctamente.</p>
      <p>Fecha: {new Date().toLocaleString()}</p>
    </div>
  );
}
