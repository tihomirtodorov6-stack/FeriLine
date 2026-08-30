'use client';
import { useState } from 'react';

const mockRides = [
  { id: 1, driver: 'Тихомир', from: 'Полско Косово', to: 'Бяла', time: '07:30', seats: 3, price: 3, car: 'VW Passat', rating: 4.9 },
  { id: 2, driver: 'Иван', from: 'Бяла', to: 'Полско Косово', time: '17:00', seats: 2, price: 3, car: 'Opel Astra', rating: 5.0 },
];

export default function Home() {
  const [tab, setTab] = useState<'find'|'offer'>('find');
  const [tracking, setTracking] = useState<number|null>(null);

  return (
    <main style={{minHeight:'100vh', maxWidth:'420px', margin:'0 auto', background:'white', fontFamily:'sans-serif'}}>
      <header style={{background:'#0F4C75', color:'white', padding:'16px', display:'flex', alignItems:'center', gap:'12px'}}>
        <div style={{width:'40px', height:'40px', background:'#2ECC71', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>🚗</div>
        <div><h1 style={{fontWeight:'bold', margin:0}}>VoziMe.bg</h1><p style={{fontSize:'12px', opacity:0.8, margin:0}}>Полско Косово ↔ Бяла</p></div>
        <span style={{marginLeft:'auto', fontSize:'10px', background:'rgba(255,255,255,0.2)', padding:'4px 8px', borderRadius:'20px'}}>LIVE</span>
      </header>

      <div style={{display:'flex', gap:'8px', padding:'12px', background:'#f8f9fa'}}>
        <button onClick={()=>setTab('find')} style={{flex:1, padding:'12px', borderRadius:'12px', fontWeight:'bold', border:'none', background: tab==='find' ? '#0F4C75' : 'white', color: tab==='find' ? 'white' : '#666'}}>Намери возене</button>
        <button onClick={()=>setTab('offer')} style={{flex:1, padding:'12px', borderRadius:'12px', fontWeight:'bold', border:'none', background: tab==='offer' ? '#0F4C75' : 'white', color: tab==='offer' ? 'white' : '#666'}}>Предложи</button>
      </div>

      {tab==='find' ? (
        <div style={{padding:'16px', display:'flex', flexDirection:'column', gap:'16px'}}>
          <div style={{background:'#f1f3f4', padding:'12px', borderRadius:'12px', display:'flex', gap:'16px'}}>
            <div><div style={{fontSize:'12px', color:'#888'}}>От</div><div style={{fontWeight:'bold'}}>Полско Косово</div></div>
            <div><div style={{fontSize:'12px', color:'#888'}}>До</div><div style={{fontWeight:'bold'}}>Бяла</div></div>
          </div>

          {mockRides.map(ride => (
            <div key={ride.id} style={{border:'1px solid #eee', borderRadius:'16px', padding:'16px'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div><div style={{fontWeight:'bold'}}>{ride.from} → {ride.to}</div><div style={{fontSize:'12px', color:'#888'}}>{ride.time} • {ride.car} • ⭐ {ride.rating}</div></div>
                <div style={{background:'#e6f9ed', color:'#0F4C75', fontWeight:'bold', padding:'4px 12px', borderRadius:'20px', height:'fit-content'}}>{ride.price} лв</div>
              </div>
              <div style={{margin:'12px 0', fontSize:'14px'}}>👤 {ride.driver} • Шофьор</div>
              {tracking===ride.id && <div style={{background:'#e8f0fe', padding:'12px', borderRadius:'12px', fontSize:'13px', marginBottom:'12px'}}>📍 Live: Шофьорът тръгна, пристига след 12 мин в центъра на Полско Косово</div>}
              <div style={{display:'flex', gap:'8px'}}>
                <button onClick={()=>setTracking(ride.id)} style={{flex:1, background:'#0F4C75', color:'white', padding:'12px', borderRadius:'12px', fontWeight:'bold', border:'none'}}>{tracking===ride.id ? 'Проследяване ВКЛ' : 'Заяви място'}</button>
                <button style={{padding:'12px', border:'1px solid #ddd', borderRadius:'12px', background:'white'}}>💬</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
          <h2 style={{fontWeight:'bold'}}>Предложи пътуване - 3 лв/място</h2>
          <input defaultValue="Полско Косово" style={{width:'100%', border:'1px solid #ddd', padding:'12px', borderRadius:'12px'}} />
          <input defaultValue="Бяла" style={{width:'100%', border:'1px solid #ddd', padding:'12px', borderRadius:'12px'}} />
          <div style={{display:'flex', gap:'8px'}}>
            <input type="time" defaultValue="07:30" style={{flex:1, border:'1px solid #ddd', padding:'12px', borderRadius:'12px'}} />
            <input type="number" defaultValue="3" style={{width:'100px', border:'1px solid #ddd', padding:'12px', borderRadius:'12px'}} />
          </div>
          <div style={{background:'#e6f9ed', padding:'12px', borderRadius:'12px', fontSize:'13px'}}>💰 Разход ~8лв бензин, подялба по ЗДП чл.6 - не е такси</div>
          <button style={{width:'100%', background:'#2ECC71', color:'#0F4C75', padding:'16px', borderRadius:'12px', fontWeight:'bold', fontSize:'16px', border:'none'}}>Публикувай за 3 лв</button>
          <div style={{borderTop:'1px solid #eee', paddingTop:'16px', marginTop:'16px'}}>
            <h3 style={{fontWeight:'bold', margin:0}}>Верификация</h3>
            <p style={{fontSize:'12px', color:'#888', margin:'4px 0'}}>Снимай книжка - одобрение</p>
            <div style={{border:'2px dashed #ccc', borderRadius:'12px', padding:'24px', textAlign:'center', marginTop:'8px'}}>📸 Снимай шофьорска книжка</div>
          </div>
        </div>
      )}
    </main>
  );
}