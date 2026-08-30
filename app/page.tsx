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
  const [offerForm, setOfferForm] = useState({from:'Полско Косово', to:'Бяла', time:'07:30', seats:3, message:'Тръгвам от центъра, имам 3 места'});

  useEffect(()=>{
    const u = localStorage.getItem('vozime_users');
    const cu = localStorage.getItem('vozime_current');
    const r = localStorage.getItem('vozime_rides');
    if(u) setUsers(JSON.parse(u));
    if(cu) { setCurrentUser(JSON.parse(cu)); setMode('app'); }
    if(r) setRides(JSON.parse(r));
    else {
      // първоначални демо пътувания с имена
      setRides([
        { id:'1', driverName:'Тихомир Тодоров', driverPhone:'0888 123 456', from:'Полско Косово', to:'Бяла', time:'07:30', seats:2, message:'Тръгвам от площада, вземам и от Бяла обратно в 17:00', price:3, createdAt:Date.now()-100000 },
        { id:'2', driverName:'Иван Петров', driverPhone:'0899 654 321', from:'Бяла', to:'Полско Косово', time:'17:00', seats:3, message:'Имам място за 3-ма, връщам се от работа', price:3, createdAt:Date.now()-50000 },
      ]);
    }
  },[]);

  const saveUsers = (newUsers:User[])=>{ setUsers(newUsers); localStorage.setItem('vozime_users', JSON.stringify(newUsers)); };
  const saveRides = (newRides:Ride[])=>{ setRides(newRides); localStorage.setItem('vozime_rides', JSON.stringify(newRides)); };

  const handleRegister = ()=>{
    if(!form.firstName ||!form.lastName ||!form.phone ||!form.password){ alert('Попълни всички'); return; }
    if(users.find(u=>u.phone===form.phone)){ alert('Телефонът вече съществува'); return; }
    const newUser:User = { id:Date.now().toString(), firstName:form.firstName, lastName:form.lastName, phone:form.phone, password:form.password };
    const newUsers = [...users, newUser]; saveUsers(newUsers);
    localStorage.setItem('vozime_current', JSON.stringify(newUser));
    setCurrentUser(newUser); setMode('app');
  };
  const handleLogin = ()=>{
    const found = users.find(u=>u.phone===form.phone && u.password===form.password);
    if(!found){ alert('Грешен телефон или парола'); return; }
    localStorage.setItem('vozime_current', JSON.stringify(found));
    setCurrentUser(found); setMode('app');
  };
  const logout = ()=>{ localStorage.removeItem('vozime_current'); setCurrentUser(null); setMode('login'); };

  const publishRide = ()=>{
    if(!currentUser) return;
    const newRide:Ride = {
      id:Date.now().toString(),
      driverName: `${currentUser.firstName} ${currentUser.lastName}`,
      driverPhone: currentUser.phone,
      from: offerForm.from,
      to: offerForm.to,
      time: offerForm.time,
      seats: offerForm.seats,
      message: offerForm.message,
      price:3,
      createdAt: Date.now()
    };
    const newRides = [newRide,...rides];
    saveRides(newRides);
    setTab('find');
    alert(`Публикувано! Сега всички ще видят: ${newRide.driverName} - ${newRide.from} → ${newRide.to}`);
  };

  if(mode!=='app'){
    return (
      <main style={{minHeight:'100vh', maxWidth:'420px', margin:'0 auto', background:'white', fontFamily:'sans-serif', padding:'24px'}}>
        <div style={{textAlign:'center', marginBottom:'32px', marginTop:'40px'}}>
          <div style={{width:'64px', height:'64px', background:'#2ECC71', borderRadius:'20px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto', fontSize:'32px'}}>🚗</div>
          <h1 style={{fontWeight:'bold', fontSize:'28px', margin:'12px 0 4px'}}>VoziMe.bg</h1>
          <p style={{color:'#888', margin:0}}>Всички се виждаме по име</p>
        </div>
        <div style={{display:'flex', gap:'8px', background:'#f1f3f4', padding:'4px', borderRadius:'12px', marginBottom:'24px'}}>
          <button onClick={()=>setMode('login')} style={{flex:1, padding:'10px', borderRadius:'10px', border:'none', fontWeight:'bold', background: mode==='login'? 'white' : 'transparent'}}>Вход</button>
          <button onClick={()=>setMode('register')} style={{flex:1, padding:'10px', borderRadius:'10px', border:'none', fontWeight:'bold', background: mode==='register'? 'white' : 'transparent'}}>Регистрация</button>
        </div>
        {mode==='register'? (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <div style={{display:'flex', gap:'8px'}}><input placeholder="Име" value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})} style={{flex:1, border:'1px solid #ddd', padding:'14px', borderRadius:'12px'}} /><input placeholder="Фамилия" value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})} style={{flex:1, border:'1px solid #ddd', padding:'14px', borderRadius:'12px'}} /></div>
            <input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{border:'1px solid #ddd', padding:'14px', borderRadius:'12px'}} />
            <input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} style={{border:'1px solid #ddd', padding:'14px', borderRadius:'12px'}} />
            <button onClick={handleRegister} style={{background:'#0F4C75', color:'white', padding:'16px', borderRadius:'12px', fontWeight:'bold', border:'none'}}>Регистрирай се</button>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} style={{border:'1px solid #ddd', padding:'14px', borderRadius:'12px'}} />
            <input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} style={{border:'1px solid #ddd', padding:'14px', borderRadius:'12px'}} />
            <button onClick={handleLogin} style={{background:'#2ECC71', color:'#0F4C75', padding:'16px', borderRadius:'12px', fontWeight:'bold', border:'none'}}>Влез</button>
          </div>
        )}
      </main>
    );
  }

  return (
    <main style={{minHeight:'100vh', maxWidth:'420px', margin:'0 auto', background:'white', fontFamily:'sans-serif'}}>
      <header style={{background:'#0F4C75', color:'white', padding:'16px', display:'flex', alignItems:'center', gap:'12px'}}>
        <div style={{width:'40px', height:'40px', background:'#2ECC71', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>🚗</div>
        <div><div style={{fontWeight:'bold'}}>{currentUser?.firstName} {currentUser?.lastName}</div><div style={{fontSize:'11px', opacity:0.8}}>{currentUser?.phone}</div></div>
        <button onClick={logout} style={{marginLeft:'auto', fontSize:'12px', background:'rgba(255,255,255,0.2)', border:'none', color:'white', padding:'6px 10px', borderRadius:'20px'}}>Изход</button>
      </header>

      <div style={{display:'flex', gap:'8px', padding:'12px', background:'#f8f9fa'}}>
        <button onClick={()=>setTab('find')} style={{flex:1, padding:'12px', borderRadius:'12px', fontWeight:'bold', border:'none', background: tab==='find'? '#0F4C75' : 'white', color: tab==='find'? 'white' : '#666'}}>Намери ({rides.length})</button>
        <button onClick={()=>setTab('offer')} style={{flex:1, padding:'12px', borderRadius:'12px', fontWeight:'bold', border:'none', background: tab==='offer'? '#0F4C75' : 'white', color: tab==='offer'? 'white' : '#666'}}>Предложи</button>
      </div>

      {tab==='find'? (
        <div style={{padding:'16px', display:'flex', flexDirection:'column', gap:'16px'}}>
          {rides.map(ride => (
            <div key={ride.id} style={{border:'1px solid #eee', borderRadius:'16px', padding:'16px', background:'white'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <div style={{fontWeight:'bold', fontSize:'16px'}}>{ride.from} → {ride.to}</div>
                <div style={{background:'#e6f9ed', color:'#0F4C75', fontWeight:'bold', padding:'4px 12px', borderRadius:'20px', fontSize:'14px'}}>{ride.price} лв</div>
              </div>
              <div style={{fontSize:'12px', color:'#888', marginTop:'4px'}}>{ride.time} • {ride.seats} места</div>
              <div style={{margin:'12px 0', padding:'12px', background:'#f8f9fa', borderRadius:'12px'}}>
                <div style={{fontWeight:'bold', fontSize:'14px'}}>👤 {ride.driverName}</div>
                <div style={{fontSize:'12px', color:'#666'}}>📞 {ride.driverPhone}</div>
                <div style={{fontSize:'14px', marginTop:'8px', fontStyle:'italic'}}>"{ride.message}"</div>
              </div>
              <button style={{width:'100%', background:'#0F4C75', color:'white', padding:'12px', borderRadius:'12px', fontWeight:'bold', border:'none'}}>Пиши на {ride.driverName.split(' ')[0]} 💬</button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
          <h2 style={{fontWeight:'bold'}}>Предложи като {currentUser?.firstName} {currentUser?.lastName}</h2>
          <div style={{display:'flex', gap:'8px'}}><input value={offerForm.from} onChange={e=>setOfferForm({...offerForm, from:e.target.value})} style={{flex:1, border:'1px solid #ddd', padding:'12px', borderRadius:'12px'}} /><input value={offerForm.to} onChange={e=>setOfferForm({...offerForm, to:e.target.value})} style={{flex:1, border:'1px solid #ddd', padding:'12px', borderRadius:'12px'}} /></div>
          <div style={{display:'flex', gap:'8px'}}><input type="time" value={offerForm.time} onChange={e=>setOfferForm({...offerForm, time:e.target.value})} style={{flex:1, border:'1px solid #ddd', padding:'12px', borderRadius:'12px'}} /><input type="number" value={offerForm.seats} onChange={e=>setOfferForm({...offerForm, seats:parseInt(e.target.value)})} style={{width:'100px', border:'1px solid #ddd', padding:'12px', borderRadius:'12px'}} /></div>
          <textarea value={offerForm.message} onChange={e=>setOfferForm({...offerForm, message:e.target.value})} placeholder="Съобщение: откъде тръгваш..." style={{border:'1px solid #ddd', padding:'12px', borderRadius:'12px', minHeight:'80px'}} />
          <button onClick={publishRide} style={{width:'100%', background:'#2ECC71', color:'#0F4C75', padding:'16px', borderRadius:'12px', fontWeight:'bold', border:'none', fontSize:'16px'}}>Публикувай - всички ще видят името ти</button>
        </div>
      )}
    </main>
  );
}