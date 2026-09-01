'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ypfbljjrpppkdxdftjcv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NZrVv1hI7aTWVdeyZT27-Q_rWp_olMG";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const EDGE_URL = "https://ypfbljjrpppkdxdftjcv.supabase.co/functions/v1/admin";

const ADMIN_PHONES = ['+447935463970','447935463970','07935463970'];
const clean = (p:string)=> p.replace(/[^0-9]/g,'').slice(-10);
const isAdminPhone = (phone:string)=>{ if(!phone) return false; const c=phone.replace(/[^0-9+]/g,''); return ADMIN_PHONES.includes(c) || ADMIN_PHONES.includes(clean(c)) || c.includes('7935463970'); };
const COUNTRIES = [{code:'BG',name:'🇧🇬 България'},{code:'GB',name:'🇬🇧 UK'},{code:'DE',name:'🇩🇪 Германия'},{code:'ES',name:'🇪🇸 Испания'},{code:'GR',name:'🇬🇷 Гърция'},{code:'RO',name:'🇷🇴 Румъния'},{code:'TR',name:'🇹🇷 Турция'}];

const TRANSLATIONS = {
  bg: { siteFree:'Сайтът е безплатен', sharedCosts:'Пътуването е споделени разходи', exit:'Изход', find:'Намери', my:'Моите', offer:'Предложи', admin:'👑 Админ', important:'ℹ️ ВАЖНО - 2 неща:', important1:'1. Сайтът VoziMe е 100% безплатен.', important1b:'Ние не вземаме комисионна.', important2:'2. Самото пътуване НЕ е безплатно.', important2b:'Шофьор и пътник се договарят ЛИЧНО.', all:'Всички', drivers:'Шофьори', passengers:'Пътници', search:'🔍 Лондон, София...', notFree:'⚠️ Пътуването НЕ е безплатно - лична договорка.', connectDirect:'📞 СВЪРЖИ СЕ ДИРЕКТНО:', call:'📞 Обади се', offers:'🚗 ПРЕДЛАГА', seeks:'🙋 ТЪРСИ', imDriver:'🚗 Аз съм Шофьор', imPassenger:'🙋 Аз съм Пътник', from:'От', to:'До', brand:'Марка', color:'Цвят', reg:'Рег. номер', seatsNeed:'Места нужни', seatsFree:'Свободни места', note:'Бележка...', declare:'ДЕКЛАРИРАМ: Пътувам лично, само споделени разходи, БЕЗ печалба.', fillFromTo:'Попълни От и До', publishSeeks:'🙋 Публикувай че ТЪРСИШ', publish:'🚗 Публикувай', edit:'Редактирай', youSeek:'ТЪРСИШ', youOffer:'ПРЕДЛАГАШ', footerTitle:'❤️ VoziMe е безплатна', footerSub:'Сайтът не взема комисионна.', footerWarn:'Пътуванията НЕ са безплатни - лична договорка.', enableLoc:'📍 Включи локация', report:'🚩 Докладвай', banned:'⛔ БАННАТ СИ', maintenanceTitle:'🔧 Профилактика', maintenanceMsg:'Работим по подобрения.' },
  en: { siteFree:'Site is free', sharedCosts:'Travel is shared costs', exit:'Exit', find:'Find', my:'My rides', offer:'Offer', admin:'👑 Admin', important:'ℹ️ IMPORTANT - 2 things:', important1:'1. VoziMe is 100% free.', important1b:'We take no commission.', important2:'2. Trip is NOT free.', important2b:'Driver and passenger agree personally.', all:'All', drivers:'Drivers', passengers:'Passengers', search:'🔍 London, Sofia...', notFree:'⚠️ Trip NOT free - personal agreement.', connectDirect:'📞 CONNECT DIRECTLY:', call:'📞 Call', offers:'🚗 OFFERS', seeks:'🙋 SEEKS', imDriver:'🚗 I am Driver', imPassenger:'🙋 I am Passenger', from:'From', to:'To', brand:'Brand', color:'Color', reg:'Reg number', seatsNeed:'Seats needed', seatsFree:'Free seats', note:'Note...', declare:'I DECLARE: Personal travel, shared costs only, NO profit.', fillFromTo:'Fill From and To', publishSeeks:'🙋 Publish SEEK', publish:'🚗 Publish', edit:'Edit', youSeek:'YOU SEEK', youOffer:'YOU OFFER', footerTitle:'❤️ VoziMe is free', footerSub:'No commission.', footerWarn:'Trips NOT free.', enableLoc:'📍 Enable location', report:'🚩 Report', banned:'⛔ BANNED', maintenanceTitle:'🔧 Maintenance', maintenanceMsg:'Working on improvements.' }
};

export default function Home(){
  const [lang,setLang]=useState<'bg'|'en'>('bg');
  const [currentUser,setCurrentUser]=useState<any>(null);
  const [authMode,setAuthMode]=useState<'login'|'register'>('login');
  const [loginForm,setLoginForm]=useState({firstName:'',lastName:'',phone:''});
  const [tab,setTab]=useState<'find'|'my'|'offer'|'admin'>('find');
  const [rides,setRides]=useState<any[]>([]);
  const [editingRide,setEditingRide]=useState<string|null>(null);
  const [offerForm,setOfferForm]=useState({type:'offer',from:'',to:'',fromCountry:'GB',toCountry:'BG',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:''});
  const [filterType,setFilterType]=useState(''); const [filterText,setFilterText]=useState('');
  const [myLocation,setMyLocation]=useState<any>(null); const [locDenied,setLocDenied]=useState(false);
  const [maintenance,setMaintenance]=useState<{enabled:boolean,msg:string}>({enabled:false,msg:''});
  const [bans,setBans]=useState<any[]>([]); const [reports,setReports]=useState<any[]>([]);
  const [banPhoneInput,setBanPhoneInput]=useState(''); const [banReasonInput,setBanReasonInput]=useState(''); const [banDuration,setBanDuration]=useState('forever');
  const ridesContainerRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];
  const isAdmin = currentUser && isAdminPhone(currentUser.phone);

  const callAdmin = async (action:string, data:any={})=>{
    const res = await fetch(EDGE_URL, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${SUPABASE_ANON_KEY}`, 'apikey':SUPABASE_ANON_KEY }, body:JSON.stringify({action,...data, adminPhone: currentUser?.phone, phone: currentUser?.phone}) });
    if(!res.ok) throw new Error(await res.text()); return res.json();
  };

  const fetchLocation = async ()=>{ if(navigator.geolocation){ navigator.geolocation.getCurrentPosition(async (pos)=>{ try{ const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=en`); const data = await res.json(); setMyLocation({country: data.address?.country_code?.toUpperCase()||'GB', city: data.address?.city||data.address?.town||'Portsmouth'}); }catch{} }, ()=>{ setLocDenied(true); }); } else { setLocDenied(true); } };

  const loadMaintenance = async ()=>{ const {data} = await supabase.from('site_settings').select('*').eq('id',1).single(); if(data) setMaintenance({enabled:data.maintenance_enabled, msg:data.maintenance_msg||''}); };
  const loadBans = async ()=>{ const {data} = await supabase.from('bans').select('*').order('created_at',{ascending:false}); if(data) setBans(data.map((b:any)=>({id:b.id, phone:b.phone, originalPhone:b.original_phone, reason:b.reason, until:b.until}))); };
  const loadReports = async ()=>{ const {data} = await supabase.from('reports').select('*').eq('status','open').order('created_at',{ascending:false}); if(data) setReports(data.map((r:any)=>({id:r.id, rideId:r.ride_id, reportedPhone:r.reported_phone, reportedName:r.reported_name, from:r.from_city, to:r.to_city, reason:r.reason, reporterPhone:r.reporter_phone, reporterName:r.reporter_name}))); };
  const loadRides = async ()=>{ const cutoff = Date.now() - 48*60*60*1000; const {data} = await supabase.from('rides').select('*').gt('created_at', cutoff).order('created_at',{ascending:true}); if(data) setRides(data.map((d:any)=>({id:d.id, driverName:d.driver_name, driverPhone:d.driver_phone, driverId:d.driver_id, from:d.from_city, to:d.to_city, fromCountry:d.from_country||'BG', toCountry:d.to_country||'BG', time:d.time, date:d.date, seats:d.seats, message:d.message, createdAt:d.created_at, type:d.type||'offer', carInfo:d.car_info, isDriverVerified:d.is_driver}))); };

  useEffect(()=>{
    const savedLang = localStorage.getItem('vozime_lang') as 'bg'|'en'; if(savedLang) setLang(savedLang);
    const cu=localStorage.getItem('vozime_current'); if(cu) setCurrentUser(JSON.parse(cu));
    const lastPhone = localStorage.getItem('vozime_last_phone'); if(lastPhone) setLoginForm(f=>({...f, phone:lastPhone}));
    loadRides(); loadMaintenance(); loadBans(); loadReports(); fetchLocation();
    const interval = setInterval(()=>{ loadMaintenance(); loadBans(); loadReports(); loadRides(); }, 3000); return ()=> clearInterval(interval);
  },[]);
  useEffect(()=>{ localStorage.setItem('vozime_lang', lang); },[lang]);

  const getUsers = ()=>{ try{ return JSON.parse(localStorage.getItem('vozime_users')||'[]'); }catch{ return []; } };
  const saveUserToList = (user:any)=>{ const users=getUsers(); const idx=users.findIndex((u:any)=>clean(u.phone)===clean(user.phone)); if(idx>=0) users[idx]=user; else users.push(user); localStorage.setItem('vozime_users', JSON.stringify(users)); localStorage.setItem('vozime_last_phone', user.phone); };

  const handleLogin = ()=>{
    if(!loginForm.phone){ alert('Въведи телефон'); return; }
    const users=getUsers(); const found=users.find((u:any)=>clean(u.phone)===clean(loginForm.phone));
    if(!found){ alert('Няма такъв номер. Първо се регистрирай.'); setAuthMode('register'); setLoginForm({...loginForm, firstName:'', lastName:''}); return; }
    localStorage.setItem('vozime_current', JSON.stringify(found)); setCurrentUser(found);
  };
  const handleRegister = ()=>{
    if(!loginForm.firstName ||!loginForm.lastName ||!loginForm.phone){ alert('Попълни Име, Фамилия и Телефон'); return; }
    const users=getUsers(); if(users.find((u:any)=>clean(u.phone)===clean(loginForm.phone))){ alert('Този телефон вече е регистриран! Влез с Login.'); setAuthMode('login'); return; }
    const user = {id: Date.now().toString(), firstName: loginForm.firstName.trim(), lastName: loginForm.lastName.trim(), phone: loginForm.phone.trim()};
    saveUserToList(user); localStorage.setItem('vozime_current', JSON.stringify(user)); setCurrentUser(user);
  };
  const handleDeleteAccount = async ()=>{
    if(!confirm(`Сигурен ли си че искаш да изтриеш акаунта ${currentUser.firstName} ${currentUser.lastName}?`)) return;
    if(!confirm('ПОСЛЕДНО: Наистина ли да те изтрия завинаги?')) return;
    try{ await supabase.from('rides').delete().eq('driver_id', currentUser.id); }catch{}
    const users=getUsers().filter((u:any)=>clean(u.phone)!==clean(currentUser.phone));
    localStorage.setItem('vozime_users', JSON.stringify(users));
    localStorage.removeItem('vozime_current'); localStorage.removeItem('vozime_last_phone');
    setCurrentUser(null); setTab('find'); alert('Акаунтът е изтрит. Приложението те забрави.');
  };
  const logout=()=>{localStorage.removeItem('vozime_current');setCurrentUser(null); setTab('find');};
  const isBanned = (phone:string)=>{ const now=Date.now(); return bans.find(b=> b.phone===clean(phone) && (b.until==='forever' || Number(b.until)>now)); };
  const currentBanned = currentUser? isBanned(currentUser.phone) : null;
  const carFilled = offerForm.carBrand.trim() && offerForm.carColor.trim() && offerForm.carReg.trim();
  const seatsFilled = offerForm.seats.trim() && parseInt(offerForm.seats)>0;
  const canPublish = offerForm.from.trim() && offerForm.to.trim() && seatsFilled && (offerForm.type==='request' || (carFilled && offerForm.isDriver)) &&!currentBanned;

  const toggleMaintenance = async ()=>{ const ne=!maintenance.enabled; try{ await callAdmin('maintenance',{enabled:ne, msg:maintenance.msg}); setMaintenance({...maintenance,enabled:ne}); }catch(e:any){ alert(e.message); } };
  const updateMaintenanceMsg = async (msg:string)=>{ setMaintenance({...maintenance,msg}); try{ await callAdmin('maintenance',{enabled:maintenance.enabled, msg}); }catch{} };
  const publishRide= async ()=>{ if(currentBanned){ alert(`${t.banned}: ${currentBanned.reason}`); return; } if(!canPublish){alert('Попълни всички *');return;} const id = editingRide||Date.now().toString(); const existingCreated = editingRide? (rides.find(r=>r.id===editingRide)?.createdAt || Date.now()) : Date.now(); const row:any = {id, driver_name:`${currentUser.firstName} ${currentUser.lastName}`, driver_phone:currentUser.phone, driver_id:currentUser.id, from_city:offerForm.from, to_city:offerForm.to, time:offerForm.time, return_time:offerForm.returnTime, date:lang==='bg'?'Днес':'Today', seats:parseInt(offerForm.seats)||1, message:offerForm.message, created_at:existingCreated, type:offerForm.type, is_driver:offerForm.isDriver, car_brand:offerForm.carBrand, car_color:offerForm.carColor, car_reg:offerForm.carReg.toUpperCase(), car_info:`${offerForm.carBrand} ${offerForm.carColor} ${offerForm.carReg.toUpperCase()}`, from_country:offerForm.fromCountry, to_country:offerForm.toCountry}; try{ if(editingRide){ await callAdmin('update_ride',{ride_id:editingRide, newData:row}); } else { await supabase.from('rides').insert(row); } setEditingRide(null); await loadRides(); setTab('find'); }catch(e:any){ alert('Грешка: '+e.message); } };
  const deleteRide = async (id:string)=>{ try{ await callAdmin('delete_ride',{ride_id:id}); await loadRides(); }catch(e:any){ alert(e.message); } }
  const getFlag = (c:string)=>COUNTRIES.find(x=>x.code===c)?.name.split(' ')[0]||'🏳️';
  const cleanPhone = (p:string)=> p.replace(/[^0-9+]/g,''); const waPhone = (p:string)=> p.replace(/[^0-9]/g,'');
  const handleReport = async (ride:any)=>{ const reason = prompt(lang==='bg'?'Причина:':'Reason:'); if(!reason) return; const newReport = {id:Date.now().toString(), ride_id:ride.id, reported_phone:ride.driverPhone, reported_name:ride.driverName, from_city:ride.from, to_city:ride.to, reason, reporter_phone:currentUser?.phone||'anon', reporter_name:currentUser?`${currentUser.firstName} ${currentUser.lastName}`:'Anon', created_at:Date.now(), status:'open'}; await supabase.from('reports').insert(newReport); alert('Доклад изпратен!'); };
  const handleBan = async (phone:string, reason:string, duration:string)=>{ try{ await callAdmin('ban',{original_phone:phone, reason, duration}); await loadBans(); }catch(e:any){ alert(e.message); } };
  const unban = async (id:string)=>{ try{ await callAdmin('unban',{ban_id:id}); setBans(bans.filter(b=>b.id!==id)); }catch(e:any){ alert(e.message); } };
  const dismissReport = async (id:string)=>{ try{ await callAdmin('dismiss_report',{report_id:id, status:'dismissed'}); setReports(reports.filter(r=>r.id!==id)); }catch(e:any){ alert(e.message); } };
  const banFromReport = async (rep:any, dur:string)=>{ await handleBan(rep.reportedPhone||rep.reported_phone, `Репорт: ${rep.reason}`, dur); try{ await callAdmin('dismiss_report',{report_id:rep.id, status:'banned'}); setReports(reports.filter(r=>r.id!==rep.id)); }catch{} };
  const filteredRides = rides.filter(r=>{ if(filterText &&!(r.from.toLowerCase().includes(filterText.toLowerCase())||r.to.toLowerCase().includes(filterText.toLowerCase()))) return false; if(filterType && r.type!==filterType) return false; return true;});

  if(!currentUser){
    return (
      <main style={{position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'#0F4C75', padding:'16px', boxSizing:'border-box'}}>
        <div style={{background:'white', padding:'20px', borderRadius:'16px', width:'100%', maxWidth:'340px', boxSizing:'border-box'}}>
          <div style={{textAlign:'center', fontWeight:'bold', fontSize:'22px', color:'#0F4C75'}}>🌍 VoziMe.bg</div>
          <div style={{display:'flex', gap:'6px', marginTop:'14px', background:'#f1f3f4', padding:'4px', borderRadius:'12px'}}>
            <button onClick={()=>setAuthMode('login')} style={{flex:1, padding:'10px', borderRadius:'8px', border:'none', fontWeight:'bold', background:authMode==='login'?'#0F4C75':'white', color:authMode==='login'?'white':'#666'}}>Login</button>
            <button onClick={()=>setAuthMode('register')} style={{flex:1, padding:'10px', borderRadius:'8px', border:'none', fontWeight:'bold', background:authMode==='register'?'#0F4C75':'white', color:authMode==='register'?'white':'#666'}}>Register</button>
          </div>
          {authMode==='login'? (
            <>
              <div style={{fontSize:'11px', color:'#666', marginTop:'12px', textAlign:'center'}}>Въведи телефона с който си се регистрирал</div>
              <input placeholder="Телефон +447935463970" value={loginForm.phone} onChange={e=>setLoginForm({...loginForm, phone:e.target.value})} style={{width:'100%', marginTop:'12px', padding:'12px', borderRadius:'10px', border:'1px solid #ddd', boxSizing:'border-box', display:'block'}}/>
              <button onClick={handleLogin} style={{width:'100%', marginTop:'12px', padding:'14px', background:'#0F4C75', color:'white', border:'none', borderRadius:'10px', fontWeight:'bold', boxSizing:'border-box', display:'block'}}>Login → Влез</button>
            </>
          ) : (
            <>
              <div style={{fontSize:'11px', color:'#666', marginTop:'12px', textAlign:'center'}}>Нова регистрация - запомня име + телефон завинаги</div>
              <input placeholder="Име" value={loginForm.firstName} onChange={e=>setLoginForm({...loginForm, firstName:e.target.value})} style={{width:'100%', marginTop:'12px', padding:'12px', borderRadius:'10px', border:'1px solid #ddd', boxSizing:'border-box', display:'block'}}/>
              <input placeholder="Фамилия" value={loginForm.lastName} onChange={e=>setLoginForm({...loginForm, lastName:e.target.value})} style={{width:'100%', marginTop:'8px', padding:'12px', borderRadius:'10px', border:'1px solid #ddd', boxSizing:'border-box', display:'block'}}/>
              <input placeholder="Телефон +44..." value={loginForm.phone} onChange={e=>setLoginForm({...loginForm, phone:e.target.value})} style={{width:'100%', marginTop:'8px', padding:'12px', borderRadius:'10px', border:'1px solid #ddd', boxSizing:'border-box', display:'block'}}/>
              <button onClick={handleRegister} style={{width:'100%', marginTop:'12px', padding:'14px', background:'#2ECC71', border:'none', borderRadius:'10px', fontWeight:'bold', boxSizing:'border-box', display:'block'}}>Register → Създай профил</button>
            </>
          )}
        </div>
      </main>
    );
  }

  if(maintenance.enabled &&!isAdmin){
    return (<main style={{position:'fixed', inset:0, display:'flex',alignItems:'center',justifyContent:'center',background:'#0F4C75',color:'white',padding:'20px',textAlign:'center'}}><div><div style={{fontSize:'60px'}}>🔧</div><div style={{fontSize:'24px',fontWeight:'bold',marginTop:'10px'}}>{t.maintenanceTitle}</div><div style={{fontSize:'14px',marginTop:'10px'}}>{maintenance.msg||t.maintenanceMsg}</div></div></main>);
  }

  return (
    <main style={{position:'fixed', inset:0, width:'100%', maxWidth:'480px', margin:'0 auto', background:'white', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:'-apple-system, sans-serif', boxSizing:'border-box'}}>
      <div style={{flexShrink:0}}>
        <div style={{background:maintenance.enabled?'#FF3B30':'#0F4C75',color:'white',padding:'6px',textAlign:'center',fontSize:'10px'}}>{maintenance.enabled?'🔴 MAINTENANCE':'🌍 VoziMe • Фиксиран ✅'}</div>
        <header style={{height:'56px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 8px',gap:'6px', boxSizing:'border-box'}}>
          <div style={{width:'32px',height:'32px',background:isAdmin?'#FFD60A':'#2ECC71',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}>{isAdmin?'👑':'🌍'}</div>
          <div style={{flex:1,overflow:'hidden'}}><div style={{fontWeight:'bold',fontSize:'13px'}}>{currentUser.firstName} {currentUser.lastName} {isAdmin&&'👑'}</div><div style={{fontSize:'9px'}}>{currentUser.phone}</div></div>
          <button onClick={handleDeleteAccount} style={{fontSize:'9px',background:'black',border:'none',color:'white',padding:'5px 8px',borderRadius:'12px',fontWeight:'bold'}}>🗑️ Изтрий акаунт</button>
          <button onClick={logout} style={{fontSize:'10px',background:'#FF3B30',border:'none',color:'white',padding:'5px 10px',borderRadius:'12px',fontWeight:'bold'}}>Изход</button>
        </header>
        <div style={{height:'52px',display:'flex',gap:'4px',padding:'6px',background:'#f1f3f4'}}>
          <button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666',fontSize:'11px'}}>{t.find} ({filteredRides.length})</button>
          <button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666',fontSize:'11px'}}>{t.my}</button>
          <button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='offer'?'#2ECC71':'white',color:tab==='offer'?'#0F4C75':'#666',fontSize:'11px'}}>{t.offer}</button>
          {isAdmin && <button onClick={()=>setTab('admin')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='admin'?'#FFD60A':'#FF3B30',color:tab==='admin'?'black':'white',fontSize:'11px'}}>{t.admin} ({reports.length}/{bans.length})</button>}
        </div>
      </div>
      {currentUser && isBanned(currentUser.phone) && <div style={{background:'#FF3B30',color:'white',padding:'10px',textAlign:'center',fontSize:'12px',fontWeight:'bold'}}>⛔ {t.banned}: {isBanned(currentUser.phone)?.reason}</div>}
      {tab==='find' && (<div style={{flexShrink:0,background:'white',padding:'8px 10px',borderBottom:'1px solid #e5e7eb',display:'flex',flexDirection:'column',gap:'8px'}}><div style={{display:'flex',gap:'6px'}}><button onClick={()=>setFilterType('')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',background:filterType===''?'#0F4C75':'white',color:filterType===''?'white':'#666'}}>Всички</button><button onClick={()=>setFilterType('offer')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',background:filterType==='offer'?'#2ECC71':'white'}}>🚗 Шофьори</button><button onClick={()=>setFilterType('request')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',background:filterType==='request'?'#FFD60A':'white'}}>🙋 Пътници</button></div><input placeholder={t.search} value={filterText} onChange={e=>setFilterText(e.target.value)} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd',width:'100%', boxSizing:'border-box'}}/></div>)}
      <div style={{flex:1, overflowY:'auto', background:'#f9fafb'}} ref={ridesContainerRef}>
        {tab==='find' && (<div style={{padding:'10px',display:'flex',flexDirection:'column',gap:'10px'}}>{filteredRides.map((r:any)=>{ const banned = isBanned(r.driverPhone); const isReq = r.type==='request'; return (<div key={r.id} style={{border: banned?'2px solid #FF3B30':isReq?'2px solid #FFD60A':'2px solid #2ECC71',borderRadius:'14px',padding:'12px',background: banned?'#ffeaea':isReq?'#fffbe6':'#f0fdf4', boxSizing:'border-box'}}><b>{getFlag(r.fromCountry)} {r.from} → {getFlag(r.toCountry)} {r.to}</b> <span style={{background:isReq?'#FFD60A':'#2ECC71',padding:'2px 6px',borderRadius:'6px',fontSize:'10px'}}>{isReq?'🙋 ТЪРСИ':'🚗 ПРЕДЛАГА'}</span><div style={{fontSize:'11px',marginTop:'4px'}}>{r.driverName} • {r.seats} • {r.carInfo}</div><div style={{marginTop:'8px',background:'white',borderRadius:'10px',padding:'8px',border:'1px solid #ddd'}}><div style={{fontSize:'12px',fontWeight:'bold'}}>{r.driverName} • {r.driverPhone}</div><div style={{display:'flex',gap:'5px',marginTop:'6px'}}><a href={`tel:${cleanPhone(r.driverPhone)}`} style={{flex:1,background:'#0F4C75',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>📞 Обади се</a><a href={`https://wa.me/${waPhone(r.driverPhone)}`} target="_blank" style={{flex:1,background:'#25D366',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>WhatsApp</a></div></div></div>)})}</div>)}
        {tab==='admin' && isAdmin && (<div style={{padding:'10px'}}><div style={{background:'#0F4C75',color:'white',padding:'12px',borderRadius:'12px'}}><b>👑 АДМИН</b> - {currentUser.firstName}</div><div style={{marginTop:'10px',background:'white',border:'2px solid #FF3B30',borderRadius:'12px',padding:'12px'}}><b>🔧 СПРИ САЙТА</b><div style={{display:'flex',gap:'8px',marginTop:'8px'}}><button onClick={toggleMaintenance} style={{background:maintenance.enabled?'#2ECC71':'#FF3B30',color:'white',border:'none',padding:'10px 16px',borderRadius:'8px',fontWeight:'bold'}}>{maintenance.enabled?'✅ ПУСНИ':'🔴 СПРИ'}</button></div><input placeholder="Съобщение..." value={maintenance.msg} onChange={e=>updateMaintenanceMsg(e.target.value)} style={{width:'100%',marginTop:'8px',padding:'8px',borderRadius:'8px',border:'1px solid #ddd', boxSizing:'border-box'}}/></div><div style={{marginTop:'10px'}}><b>⛔ БАН - {bans.length}</b>{bans.map(b=><div key={b.id} style={{background:'#ffeaea',padding:'8px',borderRadius:'8px',marginTop:'6px',display:'flex',justifyContent:'space-between'}}><span>{b.originalPhone||b.phone} - {b.reason}</span><button onClick={()=>unban(b.id)} style={{background:'#2ECC71',border:'none',padding:'4px 8px',borderRadius:'6px'}}>UNBAN</button></div>)}</div></div>)}
        {tab==='my' && <div style={{padding:'10px'}}>{rides.filter(r=>r.driverId===currentUser?.id).map((r:any)=><div key={r.id} style={{border:'2px solid #0F4C75',borderRadius:'12px',padding:'12px',marginBottom:'8px'}}><b>{r.from} → {r.to}</b><button onClick={()=>deleteRide(r.id)} style={{float:'right',background:'#FF3B30',color:'white',border:'none',padding:'4px 8px',borderRadius:'6px'}}>🗑️</button></div>)}<div style={{marginTop:'20px',borderTop:'1px solid #ddd',paddingTop:'10px'}}><button onClick={handleDeleteAccount} style={{width:'100%',background:'black',color:'white',padding:'12px',borderRadius:'10px',fontWeight:'bold',border:'none'}}>🗑️ ИЗТРИЙ АКАУНТА ЗАВИНАГИ</button><div style={{fontSize:'10px',color:'#666',textAlign:'center',marginTop:'6px'}}>Приложението ще те забрави и ще трябва нова регистрация</div></div></div>}
        {tab==='offer' && (<div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'10px'}}><div style={{display:'flex',gap:'6px',background:'#f1f3f4',padding:'3px',borderRadius:'12px'}}><button onClick={()=>setOfferForm({...offerForm,type:'offer'})} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',fontWeight:'bold',background:offerForm.type==='offer'?'#0F4C75':'white',color:offerForm.type==='offer'?'white':'#666'}}>{t.imDriver}</button><button onClick={()=>setOfferForm({...offerForm,type:'request'})} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',fontWeight:'bold',background:offerForm.type==='request'?'#FFD60A':'white',color:offerForm.type==='request'?'black':'#666'}}>{t.imPassenger}</button></div><input placeholder="От - London" value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd', boxSizing:'border-box'}}/><input placeholder="До - Sofia" value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd', boxSizing:'border-box'}}/><input placeholder="Места" value={offerForm.seats} onChange={e=>setOfferForm({...offerForm,seats:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd', boxSizing:'border-box'}}/><button onClick={publishRide} disabled={!canPublish} style={{background:canPublish?'#2ECC71':'#ccc',padding:'14px',borderRadius:'10px',fontWeight:'bold',border:'none'}}>{canPublish?'Публикувай':'Попълни От и До'}</button></div>)}
      </div>
    </main>
  );
}