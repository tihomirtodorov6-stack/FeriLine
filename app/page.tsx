export default function Home() {
  return (
    <main style={{fontFamily:'sans-serif', maxWidth:'400px', margin:'0 auto', padding:'20px', textAlign:'center'}}>
      <div style={{fontSize:'60px'}}>🚗</div>
      <h1 style={{fontSize:'32px', fontWeight:'bold', color:'#0F4C75'}}>VoziMe.bg</h1>
      <p style={{color:'#555'}}>Споделено пътуване</p>
      <p style={{fontWeight:'bold', marginTop:'10px', background:'#f0f0f0', padding:'10px', borderRadius:'10px'}}>
        Полско Косово ↔ Бяла ↔ Полски Тръмбеш<br/>3 лв / място
      </p>
      <div style={{marginTop:'30px', padding:'20px', background:'#0F4C75', color:'white', borderRadius:'20px'}}>
        <h2>✅ Сайтът е ЖИВ!</h2>
        <p>Vercel вече работи</p>
      </div>
      <p style={{marginTop:'20px', fontSize:'12px', color:'#999'}}>Следваща стъпка: добавяме търсене и предлагане</p>
    </main>
  );
}