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
    callToArrange:'Обади се за цена и уговорка',
    shared:'Споделено пътуване • Споделен разход',
    limit:'Лимит 2 обяви за 24ч',
    sharedCost:'Споделен разход',
    donateTitle:'VoziMe.bg е безплатен',
    donateButton:'☕ Подкрепи в Ko-fi'
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
    callToArrange:'Call for price & details',
    shared:'Ride sharing • Shared cost',
    limit:'Limit 2 rides / 24h',
    sharedCost:'Shared cost',
    donateTitle:'VoziMe.bg is free',
    donateButton:'☕ Support on Ko-fi'
  }
};

const translateDate = (d:string, l:Lang) => l==='EN'? (d==='Днес'?'Today':d==='Утре'?'Tomorrow':d) : (d==='Today'?'Днес':d==='Tomorrow'?'Утре':d);
const translatePlace = (p:string, l:Lang) => l==='EN'? (p==='Полско Косово'?'Polsko Kosovo':p==='Бяла'?'Byala':p) : (p==='Polsko Kosovo'?'Полско Косово':p==='Byala'?'Бяла':p);
const translateMessage = (msg:string, lang:Lang) => {
  if(lang==='BG'||!msg) return msg;
  let out=msg; const dict:any={'Паметника':'Monument','паметника':'monument','жп спирка':'train station','Полски Тръмбеш':'Polski Trambesh','пазара':'market'};
  Object.keys(dict).forEach(k=>{out=out.split(k).join(dict[k])}); return out;
};

type User = { id:string, firstName:string, lastName:string, phone:string, password:string };
type Ride = { id:string, driverName:string, driverPhone:string, driverId:string, from:string, to:string, time:string, returnTime:string, date:any, seats:number, message:string, createdAt:number, isFull:boolean, requests:any[] };

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
  const [offerForm, setOfferForm] = useState({from:'Полско Косово', to:'Бяла', time:'09:30', returnTime:'12:30', date:'Днес', seats:'4', message:'Паметника 9:30 - жп спирка 9:40 - Полски Тръмбеш (пазара) 10:00'});

  useEffect(()=>{
    const sl = localStorage.getItem('vozime_lang') as Lang; if(sl) setLang(sl);
    const u = localStorage.getItem('vozime_users'); const cu = localStorage.getItem('vozime_current'); const r = localStorage.getItem('vozime_rides_noprice');
    if(u) setUsers(JSON.parse(u)); if(cu){ setCurrentUser(JSON.parse(cu)); setMode('app'); }
    if(r){
      const f=JSON.parse(r).filter((x:Ride)=>Date.now()-x.createdAt < 48*60*60*1000).sort((a:Ride,b:Ride)=>b.createdAt-a.createdAt);
      localStorage.setItem('vozime_rides_noprice', JSON.stringify(f)); setRides(f);
    }
  },[]);

  const changeLang = (l:Lang)=>{ setLang(l); localStorage.setItem('vozime_lang', l); };
  const saveRides = (nr:Ride[])=>{
    const sorted = [...nr].sort((a,b)=>b.createdAt - a.createdAt);
    setRides(sorted); localStorage.setItem('vozime_rides_noprice', JSON.stringify(sorted));
  };
  const saveUsers = (nu:User[])=>{ setUsers(nu); localStorage.setItem('vozime_users', JSON.stringify(nu)); };
  const handleRegister = ()=>{ if(!form.firstName||!form.lastName||!form.phone||!form.password){ alert('Попълни всички'); return; } if(users.find(u=>u.phone===form.phone)){ alert('Телефонът съществува'); return; } const nu={id:Date.now().toString(),...form}; saveUsers([...users,nu]); localStorage.setItem('vozime_current', JSON.stringify(nu)); setCurrentUser(nu); setMode('app'); };
  const handleLogin = ()=>{ const f=users.find(u=>u.phone===form.phone&&u.password===form.password); if(!f){ alert('Грешен телефон'); return; } localStorage.setItem('vozime_current', JSON.stringify(f)); setCurrentUser(f); setMode('app'); };
  const logout = ()=>{ localStorage.removeItem('vozime_current'); setCurrentUser(null); setMode('login'); };

  const publishRide = ()=>{
    if(!currentUser) return;
    const last24h = rides.filter(r=>r.driverId===currentUser.id && Date.now()-r.createdAt < 24*60*60*1000);
    if(!editingRide && last24h.length>=2){ alert(tr.limit); return; }
    const now = Date.now();
    const nr:Ride={ id: editingRide||now.toString(), driverName:`${currentUser.firstName} ${currentUser.lastName}`, driverPhone:currentUser.phone, driverId:currentUser.id, from:offerForm.from, to:offerForm.to, time:offerForm.time, returnTime:offerForm.returnTime, date:offerForm.date, seats:parseInt(offerForm.seats)||1, message:offerForm.message, createdAt: editingRide? rides.find(r=>r.id===editingRide)!.createdAt : now, isFull: editingRide? rides.find(r=>r.id===editingRide)!.isFull : false, requests: editingRide? rides.find(r=>r.id===editingRide)!.requests : [] };
    if(editingRide){ saveRides(rides.map(r=>r.id===editingRide?nr:r)); setEditingRide(null); } else saveRides([nr,...rides]);
    setTab('my');
  };

  const startEdit = (ride:Ride)=>{ setOfferForm({from:ride.from, to:ride.to, time:ride.time, returnTime:ride.returnTime, date:ride.date, seats:ride.seats.toString(), message:ride.message}); setEditingRide(ride.id); setTab('offer'); };
  const deleteRide = (id:string)=>{ if(confirm('Delete?')) saveRides(rides.filter(r=>r.id!==id)); };

  const appStyle:React.CSSProperties={
    fontFamily:'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    height:'100dvh', width:'100vw', maxWidth:'480px', margin:'0 auto', background:'white', display:'flex', flexDirection:'column', overflow:'hidden'
  };
  const headerStyle:React.CSSProperties={height:'60px',minHeight:'60px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 12px',gap:'8px',flexShrink:0};
  const tabsStyle:React.CSSProperties={height:'56px',minHeight:'56px',display:'flex',gap:'6px',padding:'8px',background:'#f1f3f4',borderBottom:'1px solid #eee',flexShrink:0};
  const contentStyle:React.CSSProperties={flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch' as any, paddingBottom:'10px'};
  const footerStyle:React.CSSProperties={
    height:'72px', minHeight:'72px', flexShrink:0,
    background:'white', borderTop:'1px solid #e5e7eb',
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'0 12px', gap:'10px', boxShadow:'0 -4px 20px rgba(0,0,0,0.06)'
  };

  const Footer = () => (
    <div style={footerStyle}>
      <div style={{flex:1, lineHeight:'1.2'}}>
        <div style={{fontSize:'12px', fontWeight:'bold', color:'#0F4C75'}}>❤️ {tr.donateTitle}</div>
        <div style={{fontSize:'10px', color:'#888'}}>{lang==='BG'?'Безплатен • Дарение по желание':'Free • Voluntary donation'}</div>
      </div>
      <a href="https://ko-fi.com/dropoffpay" target="_blank" rel="noopener noreferrer"
         style={{background:'#FF5E5B', color:'white', padding:'12px 22px', borderRadius:'24px', fontWeight:'bold', textDecoration:'none', fontSize:'14px', whiteSpace:'nowrap', flexShrink:0}}>
        {tr.donateButton}
      </a>
    </div>
  );

  if(mode!=='app'){
    return (<main style={appStyle}><div style={{...contentStyle,padding:'24px'}}><h1 style={{fontWeight:'bold',textAlign:'center'}}>{tr.appName}</h1></div><Footer/></main>);
  }

  // ТУК Е СОРТИРАНЕТО - ВИНАГИ НАЙ-НОВОТО ОТГОРЕ + САМО 48ч
  const visibleRides = rides.filter(r=>!r.isFull && Date.now()-r.createdAt < 48*60*60*1000).sort((a,b)=>b.createdAt - a.createdAt);
  const myRides = rides.filter(r=>r.driverId===currentUser?.id && Date.now()-r.createdAt < 48*60*60*1000).sort((a,b)=>b.createdAt - a.createdAt);

  return (
    <main style={appStyle}>
      <header style={headerStyle}>
        <div style={{width:'36px',height:'36px',background:'#2ECC71',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>🚗</div>
        <div style={{flex:1}}><div style={{fontWeight:'bold',fontSize:'13px'}}>{currentUser?.firstName} {currentUser?.lastName}</div><div style={{fontSize:'10px',opacity:0.8}}>{currentUser?.phone}</div></div>
        <div style={{display:'flex',gap:'4px'}}><button onClick={()=>changeLang('BG')} style={{padding:'5px 10px',borderRadius:'20px',border:'none',fontWeight:'bold',background:lang==='BG'?'white':'rgba(255,255,255,0.2)',color:lang==='BG'?'#0F4C75':'white',fontSize:'11px'}}>BG</button><button onClick={()=>changeLang('EN')} style={{padding:'5px 10px',borderRadius:'20px',border:'none',fontWeight:'bold',background:lang==='EN'?'white':'rgba(255,255,255,0.2)',color:lang==='EN'?'#0F4C75':'white',fontSize:'11px'}}>EN</button></div>
        <button onClick={logout} style={{fontSize:'11px',background:'rgba(255,255,255,0.2)',border:'none',color:'white',padding:'6px 10px',borderRadius:'20px'}}>{tr.logout}</button>
      </header>

      <div style={tabsStyle}>
        <button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666',fontSize:'12px'}}>{tr.find} ({visibleRides.length})</button>
        <button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666',fontSize:'12px'}}>{tr.my} ({myRides.length})</button>
        <button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='offer'?'#0F4C75':'white',color:tab==='offer'?'white':'#666',fontSize:'12px'}}>{editingRide? tr.edit : tr.offer}</button>
      </div>

      <div style={contentStyle}>
        {tab==='find' && (
          <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>
            {visibleRides.map(ride=>{
              const dF=translatePlace(ride.from,lang); const dT=translatePlace(ride.to,lang); const dD=translateDate(ride.date,lang); const dM=translateMessage(ride.message,lang);
              return (
              <div key={ride.id} style={{border:'1px solid #eee',borderRadius:'16px',padding:'14px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px'}}>
                  <div style={{fontWeight:'bold',fontSize:'16px'}}>{dF} → {dT} <span style={{fontSize:'11px',background:'#f1f3f4',padding:'3px 8px',borderRadius:'10px',marginLeft:'6px'}}>{dD}</span></div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px'}}>
                    <span style={{fontSize:'11px',background:'#FFF3CD',color:'#856404',padding:'4px 8px',borderRadius:'10px',fontWeight:'bold',whiteSpace:'nowrap'}}>💰 {tr.sharedCost}</span>
                    <span style={{fontSize:'11px',color:'#888'}}>{ride.seats} {tr.seats}</span>
                  </div>
                </div>
                <div style={{fontSize:'12px',color:'#888',marginTop:'4px'}}>{tr.departure}: {ride.time} • {tr.return}: {ride.returnTime}</div>
                <div style={{marginTop:'10px',padding:'10px',background:'#f8f9fa',borderRadius:'12px'}}>
                  <div style={{fontWeight:'bold',fontSize:'14px'}}>👤 {ride.driverName}</div>
                  <div style={{fontSize:'13px',marginTop:'6px'}}>"{dM}"</div>
                </div>
                <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
                  <a href={`tel:${ride.driverPhone}`} style={{flex:1,background:'#0F4C75',color:'white',textAlign:'center',padding:'12px',borderRadius:'12px',fontWeight:'bold',textDecoration:'none'}}>📞 {tr.call}</a>
                  <a href={`https://wa.me/${ride.driverPhone.replace(/[^0-9]/g,'')}`} target="_blank" style={{background:'#25D366',color:'white',padding:'12px 16px',borderRadius:'12px',fontWeight:'bold',textDecoration:'none'}}>{tr.viber}</a>
                </div>
                <div style={{fontSize:'11px',color:'#856404',background:'#FFF8E1',padding:'6px',borderRadius:'8px',textAlign:'center',marginTop:'8px',fontWeight:'bold'}}>{tr.callToArrange}</div>
              </div>);
            })}
            {visibleRides.length===0 && <div style={{textAlign:'center',color:'#888',marginTop:'30px'}}>{tr.noRides}</div>}
          </div>
        )}
        {tab==='my' && (
          <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>
            {myRides.map(ride=><div key={ride.id} style={{border:'2px solid #0F4C75',borderRadius:'16px',padding:'14px'}}><div style={{fontWeight:'bold'}}>{ride.from}→{ride.to} • {ride.time} • {new Date(ride.createdAt).toLocaleString('bg-BG')}</div><div style={{display:'flex',gap:'6px',marginTop:'10px'}}><button onClick={()=>startEdit(ride)} style={{flex:1,background:'#0F4C75',color:'white',border:'none',padding:'8px',borderRadius:'10px'}}>✏️ {tr.edit}</button><button onClick={()=>deleteRide(ride.id)} style={{background:'#eee',border:'none',padding:'8px 12px',borderRadius:'10px'}}>🗑️</button></div></div>)}
          </div>
        )}
        {tab==='offer' && (
          <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'10px'}}>
            <div style={{display:'flex',gap:'8px'}}><input value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px'}}/><input value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px'}}/></div>
            <div style={{display:'flex',gap:'8px'}}><select value={offerForm.date} onChange={e=>setOfferForm({...offerForm,date:e.target.value as any})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px'}}><option>{tr.today}</option><option>{tr.tomorrow}</option></select><input type="time" value={offerForm.time} onChange={e=>setOfferForm({...offerForm,time:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px'}}/><input type="time" value={offerForm.returnTime} onChange={e=>setOfferForm({...offerForm,returnTime:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px'}}/></div>
            <input value={offerForm.seats} onChange={e=>setOfferForm({...offerForm,seats:e.target.value})} style={{border:'1px solid #ddd',padding:'12px',borderRadius:'12px'}}/>
            <textarea value={offerForm.message} onChange={e=>setOfferForm({...offerForm,message:e.target.value})} style={{border:'1px solid #ddd',padding:'12px',borderRadius:'12px',minHeight:'80px'}}/>
            <button onClick={publishRide} style={{background:'#2ECC71',color:'#0F4C75',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none'}}>{editingRide? tr.save : tr.publish}</button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}