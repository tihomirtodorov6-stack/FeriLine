'use client';
import { useState, useEffect } from 'react';

type User = { id:string, firstName:string, lastName:string, phone:string, password:string };
type Request = { id:string, passengerName:string, passengerPhone:string, status:'pending'|'approved'|'rejected' };
type Ride = { id:string, driverName:string, driverPhone:string, driverId:string, from:string, to:string, time:string, returnTime:string, seats:number, price:number, message:string, createdAt:number, requests:Request[] };

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User|null>(null);
  const [mode, setMode] = useState<'login'|'register'|'app'>('login');
  const [tab, setTab] = useState<'find'|'my'|'offer'>('find');
  const [rides, setRides] = useState<Ride[]>([]);
  const [form, setForm] = useState({firstName:'', lastName:'', phone:'', password:''});
  const [offerForm, setOfferForm] = useState({from:'Полско Косово', to:'Бяла', time:'07:30', returnTime:'17:00', seats:3, price:3, message:'Тръгвам от паметника в 8:00, жк спирката в 8:05'});

  useEffect(()=>{
    const u = localStorage.getItem('vozime_users');
    const cu = localStorage.getItem('vozime_current');
    const r = localStorage.getItem('vozime_rides_v2');
    if(u) setUsers(JSON.parse(u));
    if(cu) { setCurrentUser(JSON.parse(cu)); setMode('app'); }
    if(r) setRides(JSON.parse(r));
    else setRides([
      { id:'1', driverName:'Тихомир Тодоров', driverPhone:'+447935463970', driverId:'1', from:'Полско Косово', to:'Бяла', time:'07:30', returnTime:'17:00', seats:2, price:3, message:'Тръгвам от паметника в 8:00', createdAt:Date.now(), requests:[{id:'r1', passengerName:'Иван Петров', passengerPhone:'0899123456', status:'pending'}] },
    ]);
  },[]);

  const saveUsers = (nu:User[])=>{ setUsers(nu); localStorage.setItem('vozime_users', JSON.stringify(nu)); };
  const saveRides = (nr:Ride[])=>{ setRides(nr); localStorage.setItem('vozime_rides_v2', JSON.stringify(nr)); };

  const handleRegister = ()=>{
    if(!form.firstName||!form.lastName||!form.phone||!form.password){ alert('Попълни всички'); return; }
    if(users.find(u=>u.phone===form.phone)){ alert('Телефонът съществува'); return; }
    const nu:User={id:Date.now().toString(),...form}; saveUsers([...users,nu]);
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
    const nr:Ride={ id:Date.now().toString(), driverName:`${currentUser.firstName} ${currentUser.lastName}`, driverPhone:currentUser.phone, driverId:currentUser.id, from:offerForm.from, to:offerForm.to, time:offerForm.time, returnTime:offerForm.returnTime, seats:offerForm.seats, price:offerForm.price, message:offerForm.message, createdAt:Date.now(), requests:[] };
    saveRides([nr,...rides]); setTab('my');
  };

  const requestRide = (rideId:string)=>{
    if(!currentUser) return;
    const nrides = rides.map(r=>{
      if(r.id!==rideId) return r;
      if(r.requests.find(q=>q.passengerPhone===currentUser.phone)){ alert('Вече си заявил'); return r; }
      if(r.driverId===currentUser.id){ alert('Това е твое пътуване'); return r; }
      return {...r, requests:[...r.requests, {id:Date.now().toString(), passengerName:`${currentUser.firstName} ${currentUser.lastName}`, passengerPhone:currentUser.phone, status:'pending' as const}]};
    });
    saveRides(nrides); alert('Заявката е изпратена! Шофьорът ще я одобри.');
  };

  const handleRequestAction = (rideId:string, reqId:string, action:'approved'|'rejected')=>{
    const nrides = rides.map(r=> r.id===rideId ? {...r, requests:r.requests.map(q=> q.id===reqId ? {...q, status:action} : q)} : r);
    saveRides(nrides);
  };

  const appStyle:React.CSSProperties={height:'100dvh',width:'100vw',maxWidth:'480px',margin:'0 auto',background:'white',display:'flex',flexDirection:'column',overflow:'hidden'};
  const headerStyle:React.CSSProperties={height:'60px',minHeight:'60px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 16px',gap:'12px',flexShrink:0};
  const tabsStyle:React.CSSProperties={height:'56px',minHeight:'56px',display:'flex',gap:'6px',padding:'8px',background:'#f1f3f4',borderBottom:'1px solid #eee',flexShrink:0};
  const contentStyle:React.CSSProperties={flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch' as any};

  if(mode!=='app'){
    return (<main style={appStyle}><div style={{...contentStyle,padding:'24px'}}><div style={{textAlign:'center',marginTop:'40px',marginBottom:'24px'}}><div style={{width:'64px',height:'64px',background:'#2ECC71',borderRadius:'20px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',fontSize:'32px'}}>🚗</div><h1 style={{fontSize:'28px',fontWeight:'bold',margin:'12px 0 4px'}}>VoziMe.bg</h1></div><div style={{display:'flex',gap:'8px',background:'#f1f3f4',padding:'4px',borderRadius:'12px',marginBottom:'24px',height:'48px'}}><button onClick={()=>setMode('login')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:mode==='login'?'white':'transparent',fontSize:'16px'}}>Вход</button><button onClick={()=>setMode('register')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:mode==='register'?'white':'transparent',fontSize:'16px'}}>Регистрация</button></div><div style={{display:'flex',flexDirection:'column',gap:'12px'}}>{mode==='register'? <><div style={{display:'flex',gap:'8px'}}><input placeholder="Име" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><input placeholder="Фамилия" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/></div><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><button onClick={handleRegister} style={{background:'#0F4C75',color:'white',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',height:'52px'}}>Регистрирай се</button></>:<><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><button onClick={handleLogin} style={{background:'#2ECC71',color:'#0F4C75',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',height:'52px'}}>Влез</button></>}</div></div></main>);
  }

  const myRides = rides.filter(r=>r.driverId===currentUser?.id);
  const myRequests = rides.filter(r=>r.requests.some(q=>q.passengerPhone===currentUser?.phone));

  return (
    <main style={appStyle}>
      <header style={headerStyle}>
        <div style={{width:'40px',height:'40px',background:'#2ECC71',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center'}}>🚗</div>
        <div><div style={{fontWeight:'bold',fontSize:'14px'}}>{currentUser?.firstName} {currentUser?.lastName}</div><div style={{fontSize:'11px',opacity:0.8}}>{currentUser?.phone}</div></div>
        <button onClick={logout} style={{marginLeft:'auto',fontSize:'12px',background:'rgba(255,255,255,0.2)',border:'none',color:'white',padding:'6px 10px',borderRadius:'20px'}}>Изход</button>
      </header>

      <div style={tabsStyle}>
        <button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666',fontSize:'13px'}}>Намери ({rides.length})</button>
        <button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666',fontSize:'13px'}}>Моите ({myRides.length})</button>
        <button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='offer'?'#0F4C75':'white',color:tab==='offer'?'white':'#666',fontSize:'13px'}}>Предложи</button>
      </div>

      <div style={contentStyle}>
        {tab==='find' && (
          <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>
            {rides.map(ride=>(
              <div key={ride.id} style={{border:'1px solid #eee',borderRadius:'16px',padding:'14px',flexShrink:0}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'bold'}}>{ride.from} → {ride.to}</div><div style={{background:'#0F4C75',color:'white',fontWeight:'bold',padding:'4px 12px',borderRadius:'20px',fontSize:'13px'}}>{ride.price} лв</div></div>
                <div style={{fontSize:'12px',color:'#888',marginTop:'4px'}}>Тръгва: {ride.time} • Връщане: {ride.returnTime} • {ride.seats} места</div>
                <div style={{marginTop:'10px',padding:'10px',background:'#f8f9fa',borderRadius:'12px'}}>
                  <div style={{fontWeight:'bold',fontSize:'14px'}}>👤 {ride.driverName}</div>
                  <div style={{fontSize:'13px',marginTop:'6px'}}>"{ride.message}"</div>
                </div>
                <button onClick={()=>requestRide(ride.id)} style={{width:'100%',marginTop:'10px',background:'#2ECC71',color:'#0F4C75',padding:'12px',borderRadius:'12px',fontWeight:'bold',border:'none',height:'44px'}}>
                  {ride.requests.find(q=>q.passengerPhone===currentUser?.phone) ? `Заявено: ${ride.requests.find(q=>q.passengerPhone===currentUser?.phone)?.status}` : 'Заяви място'}
                </button>
              </div>
            ))}
          </div>
        )}

        {tab==='my' && (
          <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>
            <h3 style={{margin:'0',fontSize:'15px',fontWeight:'bold'}}>Моите пътувания - заявки за одобрение</h3>
            {myRides.length===0 && <div style={{color:'#888',fontSize:'14px',marginTop:'20px',textAlign:'center'}}>Нямаш предложени пътувания</div>}
            {myRides.map(ride=>(
              <div key={ride.id} style={{border:'2px solid #0F4C75',borderRadius:'16px',padding:'14px'}}>
                <div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'bold'}}>{ride.from} → {ride.to} • {ride.time} / {ride.returnTime}</div><div style={{fontWeight:'bold',color:'#0F4C75'}}>{ride.price} лв</div></div>
                <div style={{marginTop:'12px'}}><div style={{fontSize:'13px',fontWeight:'bold',marginBottom:'6px'}}>Заявки ({ride.requests.length}):</div>
                  {ride.requests.length===0 && <div style={{fontSize:'12px',color:'#888'}}>Няма заявки още</div>}
                  {ride.requests.map(req=>(
                    <div key={req.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'white',border:'1px solid #eee',padding:'8px 10px',borderRadius:'10px',marginBottom:'6px'}}>
                      <div><div style={{fontWeight:'bold',fontSize:'13px'}}>{req.passengerName}</div><div style={{fontSize:'11px'}}>{req.passengerPhone} • {req.status}</div></div>
                      {req.status==='pending' && <div style={{display:'flex',gap:'6px'}}><button onClick={()=>handleRequestAction(ride.id, req.id, 'approved')} style={{background:'#2ECC71',border:'none',padding:'6px 12px',borderRadius:'20px',fontWeight:'bold',fontSize:'12px'}}>Одобри</button><button onClick={()=>handleRequestAction(ride.id, req.id, 'rejected')} style={{background:'#eee',border:'none',padding:'6px 12px',borderRadius:'20px',fontSize:'12px'}}>Откажи</button></div>}
                      {req.status==='approved' && <span style={{fontSize:'12px',color:'green',fontWeight:'bold'}}>✅ Одобрен</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <h3 style={{margin:'12px 0 0 0',fontSize:'15px',fontWeight:'bold'}}>Където съм заявил</h3>
            {myRequests.map(ride=>(
              <div key={ride.id} style={{border:'1px solid #ddd',borderRadius:'12px',padding:'12px'}}>
                <div style={{fontWeight:'bold',fontSize:'14px'}}>{ride.driverName} • {ride.from}→{ride.to}</div>
                <div style={{fontSize:'12px'}}>Статус: {ride.requests.find(q=>q.passengerPhone===currentUser?.phone)?.status}</div>
              </div>
            ))}
          </div>
        )}

        {tab==='offer' && (
          <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
            <h2 style={{fontWeight:'bold',fontSize:'16px',margin:'0'}}>Предложи като {currentUser?.firstName}</h2>
            <div style={{display:'flex',gap:'8px'}}><input value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/><input value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 80px 80px',gap:'8px'}}>
              <div><label style={{fontSize:'11px',color:'#888'}}>Тръгване</label><input type="time" value={offerForm.time} onChange={e=>setOfferForm({...offerForm,time:e.target.value})} style={{width:'100%',border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/></div>
              <div><label style={{fontSize:'11px',color:'#888'}}>Връщане</label><input type="time" value={offerForm.returnTime} onChange={e=>setOfferForm({...offerForm,returnTime:e.target.value})} style={{width:'100%',border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/></div>
              <div><label style={{fontSize:'11px',color:'#888'}}>Места</label><input type="number" value={offerForm.seats} onChange={e=>setOfferForm({...offerForm,seats:parseInt(e.target.value)||1})} style={{width:'100%',border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/></div>
              <div><label style={{fontSize:'11px',color:'#888'}}>Цена лв</label><input type="number" value={offerForm.price} onChange={e=>setOfferForm({...offerForm,price:parseInt(e.target.value)||3})} style={{width:'100%',border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/></div>
            </div>
            <textarea value={offerForm.message} onChange={e=>setOfferForm({...offerForm,message:e.target.value})} placeholder="Тръгвам от паметника в 8:00..." style={{border:'1px solid #ddd',padding:'12px',borderRadius:'12px',minHeight:'80px',fontSize:'16px',resize:'none'}}/>
            <button onClick={publishRide} style={{width:'100%',background:'#2ECC71',color:'#0F4C75',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',fontSize:'16px',height:'52px'}}>Публикувай за {offerForm.price} лв</button>
            <div style={{background:'#f0f7ff',padding:'10px',borderRadius:'10px',fontSize:'11px',color:'#0F4C75'}}>💡 Сега имаш цена, връщане и одобрение на заявки в раздел "Моите"</div>
          </div>
        )}
      </div>
    </main>
  );
}