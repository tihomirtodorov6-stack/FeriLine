'use client';
import { useState, useEffect } from 'react';

type User = { id:string, firstName:string, lastName:string, phone:string, password:string };
type Ride = { id:string, driverName:string, driverPhone:string, from:string, to:string, time:string, seats:number, message:string, price:number, createdAt:number };

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User|null>(null);
  const [mode, setMode] = useState<'login'|'register'|'app'>('login');
  const [tab, setTab] = useState<'find'|'offer'>('find');
  const [rides, setRides] = useState<Ride[]>([]);
  const [form, setForm] = useState({firstName:'', lastName:'', phone:'', password:''});
  const [offerForm, setOfferForm] = useState({from:'Полско Косово', to:'Бяла', time:'07:30', seats:3, message:'Тръгвам от центъра'});

  useEffect(()=>{
    const u = localStorage.getItem('vozime_users');
    const cu = localStorage.getItem('vozime_current');
    const r = localStorage.getItem('vozime_rides');
    if(u) setUsers(JSON.parse(u));
    if(cu) { setCurrentUser(JSON.parse(cu)); setMode('app'); }
    if(r) setRides(JSON.parse(r));
    else setRides([
      { id:'1', driverName:'Тихомир Тодоров', driverPhone:'0888 123 456', from:'Полско Косово', to:'Бяла', time:'07:30', seats:2, message:'Тръгвам от площада', price:3, createdAt:Date.now() },
      { id:'2', driverName:'Иван Петров', driverPhone:'0899 654 321', from:'Бяла', to:'Полско Косово', time:'17:00', seats:3, message:'Връщам се от работа', price:3, createdAt:Date.now() },
    ]);
  },[]);

  const saveUsers = (nu:User[])=>{ setUsers(nu); localStorage.setItem('vozime_users', JSON.stringify(nu)); };
  const saveRides = (nr:Ride[])=>{ setRides(nr); localStorage.setItem('vozime_rides', JSON.stringify(nr)); };

  const handleRegister = ()=>{
    if(!form.firstName||!form.lastName||!form.phone||!form.password){ alert('Попълни всички'); return; }
    if(users.find(u=>u.phone===form.phone)){ alert('Телефонът съществува'); return; }
    const nu:User = { id:Date.now().toString(),...form };
    const newUsers=[...users,nu]; saveUsers(newUsers);
    localStorage.setItem('vozime_current', JSON.stringify(nu)); setCurrentUser(nu); setMode('app');
  };
  const handleLogin = ()=>{
    const f=users.find(u=>u.phone===form.phone&&u.password===form.password);
    if(!f){ alert('Грешен телефон или парола'); return; }
    localStorage.setItem('vozime_current', JSON.stringify(f)); setCurrentUser(f); setMode('app');
  };
  const logout = ()=>{ localStorage.removeItem('vozime_current'); setCurrentUser(null); setMode('login'); };
  const publishRide = ()=>{
    if(!currentUser) return;
    const nr:Ride={ id:Date.now().toString(), driverName:`${currentUser.firstName} ${currentUser.lastName}`, driverPhone:currentUser.phone, from:offerForm.from, to:offerForm.to, time:offerForm.time, seats:offerForm.seats, message:offerForm.message, price:3, createdAt:Date.now() };
    saveRides([nr,...rides]); setTab('find');
  };

  // FIXED LAYOUT STYLES
  const appStyle:React.CSSProperties = { height:'100dvh', width:'100vw', maxWidth:'480px', margin:'0 auto', background:'white', display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' };
  const headerStyle:React.CSSProperties = { height:'60px', minHeight:'60px', background:'#0F4C75', color:'white', display:'flex', alignItems:'center', padding:'0 16px', gap:'12px', flexShrink:0 };
  const tabsStyle:React.CSSProperties = { height:'56px', minHeight:'56px', display:'flex', gap:'8px', padding:'8px 12px', background:'#f8f9fa', borderBottom:'1px solid #eee', flexShrink:0 };
  const contentStyle:React.CSSProperties = { flex:1, overflowY:'auto', overflowX:'hidden', WebkitOverflowScrolling:'touch' };

  if(mode!=='app'){
    return (
      <main style={appStyle}>
        <div style={{...contentStyle, padding:'24px', display:'flex', flexDirection:'column'}}>
          <div style={{textAlign:'center', marginTop:'40px', marginBottom:'24px', flexShrink:0}}>
            <div style={{width:'64px', height:'64px', background:'#2ECC71', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', fontSize:'32px'}}>🚗</div>
            <h1 style={{fontSize:'28px', fontWeight:'bold', margin:'12px 0 4px'}}>VoziMe.bg</h1>
            <p style={{color:'#888', margin:0, fontSize:'14px'}}>Полско Косово ↔ Бяла • 3 лв</p>
          </div>
          <div style={{display:'flex', gap:'8px', background:'#f1f3f4', padding:'4px', borderRadius:'12px', marginBottom:'24px', height:'48px', minHeight:'48px', flexShrink:0}}>
            <button onClick={()=>setMode('login')} style={{flex:1, borderRadius:'10px', border:'none', fontWeight:'bold', background: mode==='login'? 'white':'transparent', fontSize:'16px'}}>Вход</button>
            <button onClick={()=>setMode('register')} style={{flex:1, borderRadius:'10px', border:'none', fontWeight:'bold', background: mode==='register'? 'white':'transparent', fontSize:'16px'}}>Регистрация</button>
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {mode==='register' && <><div style={{display:'flex', gap:'8px'}}><input placeholder="Име" value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})} style={{flex:1, border:'1px solid #ddd', padding:'14px', borderRadius:'12px', fontSize:'16px'}} /><input placeholder="Фамилия" value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})} style={{flex:1, border:'1px solid #ddd', padding:'14px', borderRadius:'12px', fontSize:'16px'}} /></div><input placeholder="Телефон 0888..." value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{border:'1px solid #ddd', padding:'14px', borderRadius:'12px', fontSize:'16px'}} /><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} style={{border:'1px solid #ddd', padding:'14px', borderRadius:'12px', fontSize:'16px'}} /><button onClick={handleRegister} style={{background:'#0F4C75', color:'white', padding:'16px', borderRadius:'12px', fontWeight:'bold', border:'none', fontSize:'16px', height:'52px'}}>Регистрирай се</button></>}
            {mode==='login' && <><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{border:'1px solid #ddd', padding:'14px', borderRadius:'12px', fontSize:'16px'}} /><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} style={{border:'1px solid #ddd', padding:'14px', borderRadius:'12px', fontSize:'16px'}} /><button onClick={handleLogin} style={{background:'#2ECC71', color:'#0F4C75', padding:'16px', borderRadius:'12px', fontWeight:'bold', border:'none', fontSize:'16px', height:'52px'}}>Влез с телефон</button></>}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={appStyle}>
      {/* FIXED HEADER */}
      <header style={headerStyle}>
        <div style={{width:'40px', height:'40px', background:'#2ECC71', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>🚗</div>
        <div style={{overflow:'hidden'}}><div style={{fontWeight:'bold', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{currentUser?.firstName} {currentUser?.lastName}</div><div style={{fontSize:'11px', opacity:0.8, whiteSpace:'nowrap'}}>{currentUser?.phone}</div></div>
        <button onClick={logout} style={{marginLeft:'auto', fontSize:'12px', background:'rgba(255,255,255,0.2)', border:'none', color:'white', padding:'6px 10px', borderRadius:'20px', flexShrink:0}}>Изход</button>
      </header>

      {/* FIXED TABS - 56px височина */}
      <div style={tabsStyle}>
        <button onClick={()=>setTab('find')} style={{flex:1, borderRadius:'12px', fontWeight:'bold', border:'none', background: tab==='find'? '#0F4C75' : 'white', color: tab==='find'? 'white' : '#666', fontSize:'14px'}}>Намери ({rides.length})</button>
        <button onClick={()=>setTab('offer')} style={{flex:1, borderRadius:'12px', fontWeight:'bold', border:'none', background: tab==='offer'? '#0F4C75' : 'white', color: tab==='offer'? 'white' : '#666', fontSize:'14px'}}>Предложи</button>
      </div>

      {/* FIXED CONTENT - скролва само вътре */}
      <div style={contentStyle}>
        {tab==='find'? (
          <div style={{padding:'12px', display:'flex', flexDirection:'column', gap:'12px'}}>
            {rides.map(ride => (
              <div key={ride.id} style={{border:'1px solid #eee', borderRadius:'16px', padding:'14px', background:'white', flexShrink:0}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <div style={{fontWeight:'bold', fontSize:'15px'}}>{ride.from} → {ride.to}</div>
                  <div style={{background:'#e6f9ed', color:'#0F4C75', fontWeight:'bold', padding:'4px 10px', borderRadius:'20px', fontSize:'13px', flexShrink:0}}>{ride.price} лв</div>
                </div>
                <div style={{fontSize:'12px', color:'#888', marginTop:'2px'}}>{ride.time} • {ride.seats} места • {new Date(ride.createdAt).toLocaleTimeString('bg-BG',{hour:'2-digit',minute:'2-digit'})}</div>
                <div style={{marginTop:'10px', padding:'10px', background:'#f8f9fa', borderRadius:'12px'}}>
                  <div style={{fontWeight:'bold', fontSize:'14px'}}>👤 {ride.driverName}</div>
                  <div style={{fontSize:'12px', color:'#666'}}>📞 {ride.driverPhone}</div>
                  <div style={{fontSize:'13px', marginTop:'6px', lineHeight:'1.3'}}>"{ride.message}"</div>
                </div>
                <button style={{width:'100%', marginTop:'10px', background:'#0F4C75', color:'white', padding:'12px', borderRadius:'12px', fontWeight:'bold', border:'none', height:'44px', fontSize:'14px'}}>Пиши на {ride.driverName.split(' ')[0]} 💬</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
            <h2 style={{fontWeight:'bold', fontSize:'16px', margin:'0 0 4px 0', flexShrink:0}}>Предложи като {currentUser?.firstName}</h2>
            <div style={{display:'flex', gap:'8px', flexShrink:0}}><input value={offerForm.from} onChange={e=>setOfferForm({...offerForm, from:e.target.value})} style={{flex:1, border:'1px solid #ddd', padding:'12px', borderRadius:'12px', fontSize:'16px'}} /><input value={offerForm.to} onChange={e=>setOfferForm({...offerForm, to:e.target.value})} style={{flex:1, border:'1px solid #ddd', padding:'12px', borderRadius:'12px', fontSize:'16px'}} /></div>
            <div style={{display:'flex', gap:'8px', flexShrink:0}}><input type="time" value={offerForm.time} onChange={e=>setOfferForm({...offerForm, time:e.target.value})} style={{flex:1, border:'1px solid #ddd', padding:'12px', borderRadius:'12px', fontSize:'16px'}} /><input type="number" value={offerForm.seats} onChange={e=>setOfferForm({...offerForm, seats:parseInt(e.target.value)||1})} style={{width:'80px', border:'1px solid #ddd', padding:'12px', borderRadius:'12px', fontSize:'16px'}} /></div>
            <textarea value={offerForm.message} onChange={e=>setOfferForm({...offerForm, message:e.target.value})} style={{border:'1px solid #ddd', padding:'12px', borderRadius:'12px', minHeight:'80px', maxHeight:'120px', fontSize:'16px', resize:'none', flexShrink:0}} />
            <button onClick={publishRide} style={{width:'100%', background:'#2ECC71', color:'#0F4C75', padding:'16px', borderRadius:'12px', fontWeight:'bold', border:'none', fontSize:'16px', height:'52px', flexShrink:0}}>Публикувай</button>
            <div style={{height:'20px', flexShrink:0}}></div>
          </div>
        )}
      </div>
    </main>
  );
}