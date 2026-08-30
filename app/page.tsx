'use client';
import { useState, useEffect } from 'react';

type Lang = 'BG' | 'EN';
const t = {
  BG: {
    appName:'VoziMe.bg', route:'Полско Косово ↔ Бяла',
    login:'Вход', register:'Регистрация', logout:'Изход',
    find:'Намери', my:'Моите', offer:'Предложи', edit:'Редактирай',
    from:'От', to:'До', departure:'Тръгване', return:'Връщане',
    seats:'Места', message:'Къде точно минаваш?', date:'Кога',
    today:'Днес', tomorrow:'Утре',
    publish:'Публикувай', save:'Запази', cancel:'Откажи',
    full:'ПЪЛНА', free:'Свободна',
    call:'Обади се', viber:'Viber',
    noRides:'Няма пътувания', noMyRides:'Нямаш обяви',
    callToArrange:'Обади се за да се разберете',
    shared:'Споделено пътуване • Без търговия',
    limit:'Лимит 2 обяви за 24ч'
  },
  EN: {
    appName:'VoziMe.bg', route:'Polsko Kosovo ↔ Byala',
    login:'Login', register:'Register', logout:'Logout',
    find:'Find', my:'My Rides', offer:'Offer', edit:'Edit',
    from:'From', to:'To', departure:'Depart', return:'Return',
    seats:'Seats', message:'Where do you pass?', date:'When',
    today:'Today', tomorrow:'Tomorrow',
    publish:'Publish', save:'Save', cancel:'Cancel',
    full:'FULL', free:'Free',
    call:'Call', viber:'Viber',
    noRides:'No rides', noMyRides:'No rides',
    callToArrange:'Call to arrange',
    shared:'Ride sharing • No trade',
    limit:'Limit 2 rides / 24h'
  }
};

// Помощна функция за превод на стари данни
const translateDate = (dateStr:string, lang:Lang) => {
  if(lang === 'EN'){
    if(dateStr === 'Днес') return 'Today';
    if(dateStr === 'Утре') return 'Tomorrow';
  } else {
    if(dateStr === 'Today') return 'Днес';
    if(dateStr === 'Tomorrow') return 'Утре';
  }
  return dateStr;
};
const translatePlace = (place:string, lang:Lang) => {
  if(lang === 'EN'){
    if(place === 'Полско Косово') return 'Polsko Kosovo';
    if(place === 'Бяла') return 'Byala';
  } else {
    if(place === 'Polsko Kosovo') return 'Полско Косово';
    if(place === 'Byala') return 'Бяла';
  }
  return place;
};

type User = { id:string, firstName:string, lastName:string, phone:string, password:string };
type Request = { id:string, passengerName:string, passengerPhone:string, status:'pending'|'approved'|'rejected' };
type Ride = { id:string, driverName:string, driverPhone:string, driverId:string, from:string, to:string, time:string, returnTime:string, date:any, seats:number, message:string, createdAt:number, isFull:boolean, requests:Request[] };

export default function Home() {
  const [lang, setLang] = useState<Lang>('BG');
  const tr = t[lang];
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User|null>(null);
  const [mode, setMode] = useState<'login'|'register'|'app'>('login');
  const [tab, setTab] = useState<'find'|'my'|'offer'>('find');
  const [rides, setRides] = useState<Ride[]>([]);
  const [editingRide, setEditingRide] = useState<string|null>(null);
  const [form, setForm] = useState({firstName:'', lastName:'', phone:'', password:''});
  const [offerForm, setOfferForm] = useState({from:'Полско Косово', to:'Бяла', time:'07:30', returnTime:'11:30', date:'Днес', seats:'3', message:'Минавам през паметника в 8:00, жп спирка 8:05'});

  useEffect(()=>{
    const savedLang = localStorage.getItem('vozime_lang') as Lang;
    if(savedLang) {
      setLang(savedLang);
      if(savedLang === 'EN'){
        setOfferForm(f=>({...f, from:'Polsko Kosovo', to:'Byala', date:'Today'}));
      }
    }
    const u = localStorage.getItem('vozime_users');
    const cu = localStorage.getItem('vozime_current');
    let r = localStorage.getItem('vozime_rides_noprice');
    if(u) setUsers(JSON.parse(u));
    if(cu) { setCurrentUser(JSON.parse(cu)); setMode('app'); }
    if(r){
      const filtered = JSON.parse(r).filter((x:Ride)=>Date.now()-x.createdAt < 48*60*60*1000);
      localStorage.setItem('vozime_rides_noprice', JSON.stringify(filtered));
      setRides(filtered);
    }
  },[]);

  const changeLang = (l:Lang)=>{
    setLang(l);
    localStorage.setItem('vozime_lang', l);
    if(l === 'EN'){
      setOfferForm(f=>({...f, from: f.from==='Полско Косово'?'Polsko Kosovo':f.from, to: f.to==='Бяла'?'Byala':f.to, date: f.date==='Днес'?'Today':f.date==='Утре'?'Tomorrow':f.date}));
    } else {
      setOfferForm(f=>({...f, from: f.from==='Polsko Kosovo'?'Полско Косово':f.from, to: f.to==='Byala'?'Бяла':f.to, date: f.date==='Today'?'Днес':f.date==='Tomorrow'?'Утре':f.date}));
    }
  };

  const saveUsers = (nu:User[])=>{ setUsers(nu); localStorage.setItem('vozime_users', JSON.stringify(nu)); };
  const saveRides = (nr:Ride[])=>{ setRides(nr); localStorage.setItem('vozime_rides_noprice', JSON.stringify(nr)); };

  const handleRegister = ()=>{ if(!form.firstName||!form.lastName||!form.phone||!form.password){ alert('Попълни всички'); return; } if(users.find(u=>u.phone===form.phone)){ alert('Телефонът съществува'); return; } const nu:User={id:Date.now().toString(),...form}; saveUsers([...users,nu]); localStorage.setItem('vozime_current', JSON.stringify(nu)); setCurrentUser(nu); setMode('app'); };
  const handleLogin = ()=>{ const f=users.find(u=>u.phone===form.phone&&u.password===form.password); if(!f){ alert('Грешен телефон'); return; } localStorage.setItem('vozime_current', JSON.stringify(f)); setCurrentUser(f); setMode('app'); };
  const logout = ()=>{ localStorage.removeItem('vozime_current'); setCurrentUser(null); setMode('login'); };

  const publishRide = ()=>{
    if(!currentUser) return;
    const last24h = rides.filter(r=>r.driverId===currentUser.id && Date.now()-r.createdAt < 24*60*60*1000);
    if(!editingRide && last24h.length>=2){ alert(tr.limit); return; }
    const nr:Ride={ id: editingRide||Date.now().toString(), driverName:`${currentUser.firstName} ${currentUser.lastName}`, driverPhone:currentUser.phone, driverId:currentUser.id, from:offerForm.from, to:offerForm.to, time:offerForm.time, returnTime:offerForm.returnTime, date:offerForm.date, seats:parseInt(offerForm.seats)||1, message:offerForm.message, createdAt: editingRide? rides.find(r=>r.id===editingRide)!.createdAt : Date.now(), isFull: editingRide? rides.find(r=>r.id===editingRide)!.isFull : false, requests: editingRide? rides.find(r=>r.id===editingRide)!.requests : [] };
    if(editingRide){ saveRides(rides.map(r=>r.id===editingRide?nr:r)); setEditingRide(null); } else saveRides([nr,...rides]);
    setOfferForm({from: lang==='EN'?'Polsko Kosovo':'Полско Косово', to: lang==='EN'?'Byala':'Бяла', time:'07:30', returnTime:'11:30', date: lang==='EN'?'Today':'Днес', seats:'3', message:''});
    setTab('my');
  };

  const startEdit = (ride:Ride)=>{ setOfferForm({from:ride.from, to:ride.to, time:ride.time, returnTime:ride.returnTime, date:ride.date, seats:ride.seats.toString(), message:ride.message}); setEditingRide(ride.id); setTab('offer'); };
  const toggleFull = (id:string)=> saveRides(rides.map(r=> r.id===id? {...r, isFull:!r.isFull} : r));
  const deleteRide = (id:string)=>{ if(confirm('Delete? / Да изтрия?')) saveRides(rides.filter(r=>r.id!==id)); };

  const appStyle:React.CSSProperties={height:'100dvh',width:'100vw',maxWidth:'480px',margin:'0 auto',background:'white',display:'flex',flexDirection:'column',overflow:'hidden'};
  const headerStyle:React.CSSProperties={height:'60px',minHeight:'60px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 12px',gap:'8px',flexShrink:0};
  const tabsStyle:React.CSSProperties={height:'56px',minHeight:'56px',display:'flex',gap:'6px',padding:'8px',background:'#f1f3f4',borderBottom:'1px solid #eee',flexShrink:0};
  const contentStyle:React.CSSProperties={flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch' as any};

  if(mode!=='app'){
    return (<main style={appStyle}><div style={{...contentStyle,padding:'24px'}}><div style={{display:'flex',justifyContent:'flex-end',gap:'6px'}}><button onClick={()=>changeLang('BG')} style={{padding:'6px 12px',borderRadius:'20px',border:'none',fontWeight:'bold',background:lang==='BG'?'#0F4C75':'#eee',color:lang==='BG'?'white':'#666'}}>BG</button><button onClick={()=>changeLang('EN')} style={{padding:'6px 12px',borderRadius:'20px',border:'none',fontWeight:'bold',background:lang==='EN'?'#0F4C75':'#eee',color:lang==='EN'?'white':'#666'}}>EN</button></div><div style={{textAlign:'center',marginTop:'20px'}}><div style={{width:'64px',height:'64px',background:'#2ECC71',borderRadius:'20px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',fontSize:'32px'}}>🚗</div><h1 style={{fontSize:'28px',fontWeight:'bold',margin:'12px 0 4px'}}>{tr.appName}</h1><p style={{fontSize:'13px',color:'#888'}}>{tr.route}</p><p style={{fontSize:'11px',color:'#0F4C75',background:'#e6f9ed',display:'inline-block',padding:'4px 10px',borderRadius:'20px',marginTop:'8px'}}>{tr.shared}</p></div><div style={{display:'flex',gap:'8px',background:'#f1f3f4',padding:'4px',borderRadius:'12px',margin:'24px 0',height:'48px'}}><button onClick={()=>setMode('login')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:mode==='login'?'white':'transparent'}}>{tr.login}</button><button onClick={()=>setMode('register')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:mode==='register'?'white':'transparent'}}>{tr.register}</button></div><div style={{display:'flex',flexDirection:'column',gap:'12px'}}>{mode==='register'? <><div style={{display:'flex',gap:'8px'}}><input placeholder="Име" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><input placeholder="Фамилия" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/></div><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><button onClick={handleRegister} style={{background:'#0F4C75',color:'white',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',height:'52px'}}>{tr.register}</button></>:<><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><button onClick={handleLogin} style={{background:'#2ECC71',color:'#0F4C75',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',height:'52px'}}>{tr.login}</button></>}</div></div></main>);
  }

  const myRides = rides.filter(r=>r.driverId===currentUser?.id);

  return (
    <main style={appStyle}>
      <header style={headerStyle}>
        <div style={{width:'36px',height:'36px',background:'#2ECC71',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>🚗</div>
        <div style={{flex:1}}><div style={{fontWeight:'bold',fontSize:'13px'}}>{currentUser?.firstName} {currentUser?.lastName}</div><div style={{fontSize:'10px',opacity:0.8}}>{currentUser?.phone}</div></div>
        <div style={{display:'flex',gap:'4px'}}><button onClick={()=>changeLang('BG')} style={{padding:'5px 10px',borderRadius:'20px',border:'none',fontWeight:'bold',background:lang==='BG'?'white':'rgba(255,255,255,0.2)',color:lang==='BG'?'#0F4C75':'white',fontSize:'11px'}}>BG</button><button onClick={()=>changeLang('EN')} style={{padding:'5px 10px',borderRadius:'20px',border:'none',fontWeight:'bold',background:lang==='EN'?'white':'rgba(255,255,255,0.2)',color:lang==='EN'?'#0F4C75':'white',fontSize:'11px'}}>EN</button></div>
        <button onClick={logout} style={{fontSize:'11px',background:'rgba(255,255,255,0.2)',border:'none',color:'white',padding:'6px 10px',borderRadius:'20px'}}>{tr.logout}</button>
      </header>

      <div style={tabsStyle}>
        <button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666',fontSize:'12px'}}>{tr.find} ({rides.filter(r=>!r.isFull).length})</button>
        <button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666',fontSize:'12px'}}>{tr.my} ({myRides.length})</button>
        <button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='offer'?'#0F4C75':'white',color:tab==='offer'?'white':'#666',fontSize:'12px'}}>{editingRide? tr.edit : tr.offer}</button>
      </div>

      <div style={contentStyle}>
        {tab==='find' && (
          <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>
            {rides.filter(r=>!r.isFull).map(ride=>{
              const displayFrom = translatePlace(ride.from, lang);
              const displayTo = translatePlace(ride.to, lang);
              const displayDate = translateDate(ride.date, lang);
              return (
              <div key={ride.id} style={{border:'1px solid #eee',borderRadius:'16px',padding:'14px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{fontWeight:'bold',fontSize:'16px'}}>{displayFrom} → {displayTo} <span style={{fontSize:'11px',background:'#f1f3f4',padding:'3px 8px',borderRadius:'10px',marginLeft:'6px'}}>{displayDate}</span></div><div style={{fontSize:'12px',color:'#888'}}>{ride.seats} {tr.seats}</div></div>
                <div style={{fontSize:'12px',color:'#888',marginTop:'4px'}}>{tr.departure}: {ride.time} • {tr.return}: {ride.returnTime}</div>
                <div style={{marginTop:'10px',padding:'10px',background:'#f8f9fa',borderRadius:'12px'}}>
                  <div style={{fontWeight:'bold',fontSize:'14px'}}>👤 {ride.driverName}</div>
                  <div style={{fontSize:'13px',marginTop:'6px',lineHeight:'1.3'}}>"{ride.message}"</div>
                </div>
                <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
                  <a href={`tel:${ride.driverPhone}`} style={{flex:1,background:'#0F4C75',color:'white',textAlign:'center',padding:'12px',borderRadius:'12px',fontWeight:'bold',fontSize:'14px',textDecoration:'none'}}>📞 {tr.call}</a>
                  <a href={`https://wa.me/${ride.driverPhone.replace(/[^0-9]/g,'')}`} target="_blank" style={{background:'#25D366',color:'white',padding:'12px 16px',borderRadius:'12px',fontWeight:'bold',fontSize:'13px',textDecoration:'none'}}>{tr.viber}</a>
                </div>
                <div style={{fontSize:'10px',color:'#888',textAlign:'center',marginTop:'8px'}}>{tr.callToArrange}</div>
              </div>
              );
            })}
            {rides.filter(r=>!r.isFull).length===0 && <div style={{textAlign:'center',color:'#888',marginTop:'30px'}}>{tr.noRides}</div>}
          </div>
        )}

        {tab==='my' && (
          <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>
            {myRides.map(ride=>{
              const displayFrom = translatePlace(ride.from, lang);
              const displayTo = translatePlace(ride.to, lang);
              const displayDate = translateDate(ride.date, lang);
              return (
              <div key={ride.id} style={{border: ride.isFull? '2px solid red' : '2px solid #0F4C75',borderRadius:'16px',padding:'14px', background: ride.isFull? '#fff5f5' : 'white'}}>
                <div style={{fontWeight:'bold',fontSize:'14px'}}>{displayDate}: {displayFrom}→{displayTo} • {ride.time}/{ride.returnTime} • {ride.seats} {tr.seats} {ride.isFull && `🔴 ${tr.full}`}</div>
                <div style={{display:'flex',gap:'6px',marginTop:'10px'}}>
                  <button onClick={()=>startEdit(ride)} style={{flex:1,background:'#0F4C75',color:'white',border:'none',padding:'8px',borderRadius:'10px',fontWeight:'bold',fontSize:'12px'}}>✏️ {tr.edit}</button>
                  <button onClick={()=>toggleFull(ride.id)} style={{flex:1,background: ride.isFull? '#2ECC71' : '#ff4444',color:'white',border:'none',padding:'8px',borderRadius:'10px',fontWeight:'bold',fontSize:'12px'}}>{ride.isFull? tr.free : tr.full}</button>
                  <button onClick={()=>deleteRide(ride.id)} style={{background:'#eee',border:'none',padding:'8px 12px',borderRadius:'10px'}}>🗑️</button>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {tab==='offer' && (
          <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
            <h2 style={{fontWeight:'bold',fontSize:'15px',margin:'0'}}>{editingRide? `✏️ ${tr.edit}` : tr.offer}</h2>
            <div style={{display:'flex',gap:'8px'}}><input value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} placeholder={tr.from} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/><input value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} placeholder={tr.to} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/></div>
            <div style={{display:'flex',gap:'8px'}}><select value={offerForm.date} onChange={e=>setOfferForm({...offerForm,date:e.target.value as any})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}><option>{tr.today}</option><option>{tr.tomorrow}</option></select><input type="time" value={offerForm.time} onChange={e=>setOfferForm({...offerForm,time:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/><input type="time" value={offerForm.returnTime} onChange={e=>setOfferForm({...offerForm,returnTime:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/></div>
            <div><label style={{fontSize:'11px',color:'#888'}}>{tr.seats}</label><input inputMode="numeric" value={offerForm.seats} onChange={e=>setOfferForm({...offerForm,seats:e.target.value})} onFocus={e=>e.target.select()} style={{width:'100%',border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/></div>
            <textarea value={offerForm.message} onChange={e=>setOfferForm({...offerForm,message:e.target.value})} placeholder={tr.message} style={{border:'1px solid #ddd',padding:'12px',borderRadius:'12px',minHeight:'80px',fontSize:'16px',resize:'none'}}/>
            <button onClick={publishRide} style={{width:'100%',background: editingRide? '#0F4C75' : '#2ECC71',color: editingRide? 'white' : '#0F4C75',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',fontSize:'16px',height:'52px'}}>{editingRide? `💾 ${tr.save}` : tr.publish}</button>
            {editingRide && <button onClick={()=>{setEditingRide(null); setTab('my');}} style={{width:'100%',background:'#eee',padding:'12px',borderRadius:'12px',border:'none'}}>{tr.cancel}</button>}
            <div style={{background:'#f1f3f4',padding:'10px',borderRadius:'10px',fontSize:'11px',color:'#666',textAlign:'center'}}>{tr.shared} • {tr.callToArrange}</div>
          </div>
        )}
      </div>
    </main>
  );
}