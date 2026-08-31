'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ypfbljjrpppkdxdftjcv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NZrVv1hI7aTWVdeyZT27-Q_rWp_olMG";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_PHONES = ['+447935463970','447935463970','07935463970'];
const clean = (p:string)=> p.replace(/[^0-9]/g,'').slice(-10);
const isAdminPhone = (phone:string)=>{ if(!phone) return false; const c=phone.replace(/[^0-9+]/g,''); return ADMIN_PHONES.includes(c) || ADMIN_PHONES.includes(clean(c)) || c.includes('7935463970'); };

const COUNTRIES = [{code:'BG',name:'🇧🇬 България'},{code:'GB',name:'🇬🇧 UK'},{code:'DE',name:'🇩🇪 Германия'},{code:'ES',name:'🇪🇸 Испания'},{code:'GR',name:'🇬🇷 Гърция'},{code:'RO',name:'🇷🇴 Румъния'},{code:'TR',name:'🇹🇷 Турция'}];

const TRANSLATIONS = {
  bg: { platformFree:'Платформата е 100% безплатна', siteFree:'Сайтът е безплатен', sharedCosts:'Пътуването е споделени разходи', howItWorks:'ℹ️ Как работи', exit:'Изход', find:'Намери', my:'Моите', offer:'Предложи', admin:'👑 Админ', important:'ℹ️ ВАЖНО - 2 неща:', important1:'1. Сайтът VoziMe е 100% безплатен.', important1b:'Ние не вземаме комисионна.', important2:'2. Самото пътуване НЕ е безплатно.', important2b:'Шофьор и пътник се договарят ЛИЧНО за споделени разходи.', all:'Всички', drivers:'Шофьори', passengers:'Пътници', search:'🔍 Лондон, София...', notFree:'⚠️ Пътуването НЕ е безплатно - лична договорка за споделени разходи.', connectDirect:'📞 СВЪРЖИ СЕ ДИРЕКТНО:', call:'📞 Обади се', offers:'🚗 ПРЕДЛАГА', seeks:'🙋 ТЪРСИ', driver:'Шофьор', passenger:'Пътник', imDriver:'🚗 Аз съм Шофьор', imPassenger:'🙋 Аз съм Пътник', from:'От', to:'До', brand:'Марка', color:'Цвят', reg:'Рег. номер', seatsNeed:'Места нужни', seatsFree:'Свободни места', note:'Бележка...', declare:'ДЕКЛАРИРАМ: Пътувам лично, само споделени разходи, БЕЗ печалба.', fillFromTo:'Попълни От и До', publishSeeks:'🙋 Публикувай че ТЪРСИШ', publish:'🚗 Публикувай', edit:'Редактирай', youSeek:'ТЪРСИШ', youOffer:'ПРЕДЛАГАШ', footerTitle:'❤️ Платформата VoziMe е безплатна', footerSub:'Сайтът не взема комисионна.', footerWarn:'Пътуванията НЕ са безплатни - лична договорка.', enableLoc:'📍 Включи локация', report:'🚩 Докладвай', banned:'⛔ БАННАТ СИ', maintenanceTitle:'🔧 Сайтът е в профилактика', maintenanceMsg:'Работим по подобрения. Ще се върнем скоро!' },
  en: { platformFree:'Platform is 100% free', siteFree:'Site is free', sharedCosts:'Travel is shared costs', howItWorks:'ℹ️ How it works', exit:'Exit', find:'Find', my:'My rides', offer:'Offer', admin:'👑 Admin', important:'ℹ️ IMPORTANT - 2 things:', important1:'1. VoziMe site is 100% free.', important1b:'We take no commission.', important2:'2. Trip itself is NOT free.', important2b:'Driver and passenger agree personally on shared costs.', all:'All', drivers:'Drivers', passengers:'Passengers', search:'🔍 London, Sofia...', notFree:'⚠️ Trip is NOT free - personal cost agreement.', connectDirect:'📞 CONNECT DIRECTLY:', call:'📞 Call', offers:'🚗 OFFERS', seeks:'🙋 SEEKS', driver:'Driver', passenger:'Passenger', imDriver:'🚗 I am Driver', imPassenger:'🙋 I am Passenger', from:'From', to:'To', brand:'Brand', color:'Color', reg:'Reg number', seatsNeed:'Seats needed', seatsFree:'Free seats', note:'Note...', declare:'I DECLARE: I travel personally, only shared costs, NO profit.', fillFromTo:'Fill From and To', publishSeeks:'🙋 Publish that you SEEK', publish:'🚗 Publish', edit:'Edit', youSeek:'YOU SEEK', youOffer:'YOU OFFER', footerTitle:'❤️ VoziMe Platform is free', footerSub:'Site takes no commission.', footerWarn:'Trips are NOT free.', enableLoc:'📍 Enable location', report:'🚩 Report', banned:'⛔ YOU ARE BANNED', maintenanceTitle:'🔧 Site under maintenance', maintenanceMsg:'We are working on improvements. Back soon!' }
};

export default function Home(){
  const [lang,setLang]=useState<'bg'|'en'>('bg');
  const [currentUser,setCurrentUser]=useState<any>(null);
  const [tab,setTab]=useState<'find'|'my'|'offer'|'admin'>('find');
  const [rides,setRides]=useState<any[]>([]);
  const [editingRide,setEditingRide]=useState<string|null>(null);
  const [offerForm,setOfferForm]=useState({type:'offer',from:'',to:'',fromCountry:'GB',toCountry:'BG',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:''});
  const [filterType,setFilterType]=useState(''); const [filterText,setFilterText]=useState('');
  const [myLocation,setMyLocation]=useState<any>(null); const [locLoading,setLocLoading]=useState(false); const [locDenied,setLocDenied]=useState(false);
  const [maintenance,setMaintenance]=useState<{enabled:boolean,msg:string}>({enabled:false,msg:''});
  const [bans,setBans]=useState<any[]>([]); const [reports,setReports]=useState<any[]>([]);
  const [banPhoneInput,setBanPhoneInput]=useState(''); const [banReasonInput,setBanReasonInput]=useState(''); const [banDuration,setBanDuration]=useState('forever');
  const ridesContainerRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];
  const isAdmin = currentUser && isAdminPhone(currentUser.phone);

  const fetchLocation = async ()=>{
    setLocLoading(true); setLocDenied(false);
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(async (pos)=>{
        try{
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=en`);
          const data = await res.json();
          setMyLocation({country: data.address?.country_code?.toUpperCase()||'GB', city: data.address?.city||data.address?.town||'Portsmouth'});
        }catch{ tryIPLocation(); } finally{ setLocLoading(false); }
      }, ()=>{ tryIPLocation(); }, {enableHighAccuracy:true, timeout:8000});
    } else { tryIPLocation(); }
  };
  const tryIPLocation = async ()=>{
    try{ const res = await fetch('https://ipapi.co/json/'); const data = await res.json(); if(data.city) setMyLocation({country: data.country_code||'GB', city: data.city}); else {setMyLocation(null); setLocDenied(true);} }catch{ setMyLocation(null); setLocDenied(true); } finally{ setLocLoading(false); }
  };

  const loadMaintenance = async ()=>{
    const {data} = await supabase.from('site_settings').select('*').eq('id',1).single();
    if(data) setMaintenance({enabled:data.maintenance_enabled, msg:data.maintenance_msg||''});
  };
  const loadBans = async ()=>{
    const {data} = await supabase.from('bans').select('*').order('created_at',{ascending:false});
    if(data) setBans(data.map((b:any)=>({id:b.id, phone:b.phone, originalPhone:b.original_phone, reason:b.reason, until:b.until, bannedBy:b.banned_by, createdAt:b.created_at})));
  };
  const loadReports = async ()=>{
    const {data} = await supabase.from('reports').select('*').eq('status','open').order('created_at',{ascending:false});
    if(data) setReports(data.map((r:any)=>({id:r.id, rideId:r.ride_id, reportedPhone:r.reported_phone, reportedName:r.reported_name, from:r.from_city, to:r.to_city, reason:r.reason, reporterPhone:r.reporter_phone, reporterName:r.reporter_name, createdAt:r.created_at})));
  };
  const loadRides = async ()=>{
    const cutoff = Date.now() - 48*60*60*1000;
    const {data} = await supabase.from('rides').select('*').gt('created_at', cutoff).order('created_at',{ascending:true});
    if(data) setRides(data.map((d:any)=>({id:d.id, driverName:d.driver_name, driverPhone:d.driver_phone, driverId:d.driver_id, from:d.from_city, to:d.to_city, fromCountry:d.from_country||'BG', toCountry:d.to_country||'BG', time:d.time, date:d.date, seats:d.seats, message:d.message, createdAt:d.created_at, type:d.type||'offer', carInfo:d.car_info, isDriverVerified:d.is_driver})));
  };

  useEffect(()=>{
    const savedLang = localStorage.getItem('vozime_lang') as 'bg'|'en'; if(savedLang) setLang(savedLang);
    const cu=localStorage.getItem('vozime_current'); if(cu) setCurrentUser(JSON.parse(cu));
    loadRides(); loadMaintenance(); loadBans(); loadReports(); fetchLocation();
    const interval = setInterval(()=>{
      loadMaintenance();
      loadBans();
      loadReports();
      loadRides();
    }, 2000);
    return ()=> clearInterval(interval);
  },[]);

  useEffect(()=>{ localStorage.setItem('vozime_lang', lang); },[lang]);
  useEffect(()=>{ if(ridesContainerRef.current) ridesContainerRef.current.scrollTop = ridesContainerRef.current.scrollHeight; },[rides, filterType, filterText, tab]);

  const logout=()=>{localStorage.removeItem('vozime_current');setCurrentUser(null); setTab('find');};
  const isBanned = (phone:string)=>{ const now=Date.now(); return bans.find(b=> b.phone===clean(phone) && (b.until==='forever' || Number(b.until)>now)); };
  const currentBanned = currentUser? isBanned(currentUser.phone) : null;
  const carFilled = offerForm.carBrand.trim() && offerForm.carColor.trim() && offerForm.carReg.trim();
  const seatsFilled = offerForm.seats.trim() && parseInt(offerForm.seats)>0;
  const canPublish = offerForm.from.trim() && offerForm.to.trim() && seatsFilled && (offerForm.type==='request' || (carFilled && offerForm.isDriver)) &&!currentBanned;

  const toggleMaintenance = async ()=>{
    const newEnabled =!maintenance.enabled;
    const {error} = await supabase.from('site_settings').update({maintenance_enabled:newEnabled, maintenance_msg:maintenance.msg, updated_at:Date.now()}).eq('id',1);
    if(!error) setMaintenance({...maintenance,enabled:newEnabled});
    else alert('Грешка: '+error.message);
  };
  const updateMaintenanceMsg = async (msg:string)=>{
    setMaintenance({...maintenance,msg});
    await supabase.from('site_settings').update({maintenance_msg:msg, updated_at:Date.now()}).eq('id',1);
  };

  const publishRide= async ()=>{
    if(currentBanned){ alert(`${t.banned}: ${currentBanned.reason}`); return; }
    if(!canPublish){alert('Попълни всички *');return;}
    const id = editingRide||Date.now().toString(); const existingCreated = editingRide? (rides.find(r=>r.id===editingRide)?.createdAt || Date.now()) : Date.now();
    const row:any = {id, driver_name:`${currentUser.firstName} ${currentUser.lastName}`, driver_phone:currentUser.phone, driver_id:currentUser.id, from_city:offerForm.from, to_city:offerForm.to, time:offerForm.time, return_time:offerForm.returnTime, date:lang==='bg'?'Днес':'Today', seats:parseInt(offerForm.seats)||1, message:offerForm.message, created_at:existingCreated, type:offerForm.type, is_driver:offerForm.isDriver, car_brand:offerForm.carBrand, car_color:offerForm.carColor, car_reg:offerForm.carReg.toUpperCase(), car_info:`${offerForm.carBrand} ${offerForm.carColor} ${offerForm.carReg.toUpperCase()}`, from_country:offerForm.fromCountry, to_country:offerForm.toCountry};
    if(editingRide) await supabase.from('rides').update(row).eq('id', editingRide); else await supabase.from('rides').insert(row);
    setEditingRide(null); await loadRides(); setTab('find');
  };
  const deleteRide = async (id:string)=>{ await supabase.from('rides').delete().eq('id', id); await loadRides(); }
  const getFlag = (c:string)=>COUNTRIES.find(x=>x.code===c)?.name.split(' ')[0]||'🏳️';
  const cleanPhone = (p:string)=> p.replace(/[^0-9+]/g,''); const waPhone = (p:string)=> p.replace(/[^0-9]/g,'');

  const handleReport = async (ride:any)=>{
    const reason = prompt(lang==='bg'?'Причина:\n1. Иска много пари\n2. Измама\n3. Не отговаря\n4. Друго':'Reason:\n1. Too much money\n2. Scam\n3. No answer\n4. Other');
    if(!reason) return;
    const newReport = {id:Date.now().toString(), ride_id:ride.id, reported_phone:ride.driverPhone, reported_name:ride.driverName, from_city:ride.from, to_city:ride.to, reason, reporter_phone:currentUser?.phone||'anon', reporter_name:currentUser?`${currentUser.firstName} ${currentUser.lastName}`:'Anon', created_at:Date.now(), status:'open'};
    const {error} = await supabase.from('reports').insert(newReport);
    if(!error){ setReports([ {...newReport, id:newReport.id, reportedPhone:newReport.reported_phone, reportedName:newReport.reported_name, from:newReport.from_city, to:newReport.to_city, reporterPhone:newReport.reporter_phone, reporterName:newReport.reporter_name, createdAt:newReport.created_at} as any,...reports]); alert(lang==='bg'?'Докладът е изпратен до админа!':'Report sent!'); }
    else alert('Грешка: '+error.message);
  };
  const handleBan = async (phone:string, reason:string, duration:string)=>{
    const cleanP = clean(phone);
    let until:any = 'forever'; if(duration==='1h') until = (Date.now()+3600000).toString(); if(duration==='24h') until = (Date.now()+86400000).toString(); if(duration==='7d') until = (Date.now()+604800000).toString();
    const newBan = {id:Date.now().toString(), phone:cleanP, original_phone:phone, reason, until, banned_by:'+447935463970', created_at:Date.now()};
    const {error} = await supabase.from('bans').insert(newBan);
    if(!error){ setBans([newBan as any,...bans.filter(b=>b.phone!==cleanP)]); setBanPhoneInput(''); setBanReasonInput(''); }
    else alert('Грешка: '+error.message);
  };
  const unban = async (id:string)=>{ await supabase.from('bans').delete().eq('id', id); setBans(bans.filter(b=>b.id!==id)); };
  const dismissReport = async (id:string)=>{ await supabase.from('reports').update({status:'dismissed'}).eq('id', id); setReports(reports.filter(r=>r.id!==id)); };
  const banFromReport = async (rep:any, dur:string)=>{ await handleBan(rep.reportedPhone, `Репорт: ${rep.reason}`, dur); await supabase.from('reports').update({status:'banned'}).eq('id', rep.id); setReports(reports.filter(r=>r.id!==rep.id)); };

  const filteredRides = rides.filter(r=>{ if(filterText &&!(r.from.toLowerCase().includes(filterText.toLowerCase())||r.to.toLowerCase().includes(filterText.toLowerCase()))) return false; if(filterType && r.type!==filterType) return false; return true;});

  if(maintenance.enabled &&!isAdmin){
    return (
      <main style={{height:'100dvh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F4C75',color:'white',padding:'20px',textAlign:'center'}}>
        <div><div style={{fontSize:'60px'}}>🔧</div><div style={{fontSize:'24px',fontWeight:'bold',marginTop:'10px'}}>{t.maintenanceTitle}</div><div style={{fontSize:'14px',marginTop:'10px'}}>{maintenance.msg||t.maintenanceMsg}</div></div>
      </main>
    );
  }

  return (
    <main style={{height:'100dvh',width:'100%',maxWidth:'480px',margin:'0 auto',background:'white',display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:'-apple-system, sans-serif'}}>
      <div style={{flexShrink:0}}>
        <div style={{background:maintenance.enabled?'#FF3B30':'#0F4C75',color:'white',padding:'6px',textAlign:'center',fontSize:'10px'}}>{maintenance.enabled?'🔴 MAINTENANCE - Сайтът е спрян!':'🌍 VoziMe WORLD • Платформата е 100% безплатна'}</div>
        <header style={{height:'56px',minHeight:'56px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 8px',gap:'6px'}}>
          <div style={{width:'32px',height:'32px',background:isAdmin?'#FFD60A':'#2ECC71',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}>{isAdmin?'👑':'🌍'}</div>
          <div style={{flex:1,overflow:'hidden'}}>{myLocation? <><div style={{fontWeight:'bold',fontSize:'13px'}}>{getFlag(myLocation.country)} {myLocation.city} {isAdmin&&'👑'}</div><div style={{fontSize:'9px',opacity:0.9}}>{t.siteFree} • {t.sharedCosts}</div></> : <><div style={{fontWeight:'bold',fontSize:'12px'}}>🌍 VoziMe {isAdmin&&'👑 ADMIN'}</div><div style={{fontSize:'9px',opacity:0.9}}>{t.siteFree}</div></>}</div>
          <div style={{display:'flex',background:'rgba(255,255,255,0.15)',borderRadius:'12px',padding:'2px',gap:'2px'}}><button onClick={()=>setLang('bg')} style={{background:lang==='bg'?'white':'transparent',color:lang==='bg'?'#0F4C75':'white',border:'none',padding:'4px 8px',borderRadius:'8px',fontWeight:'bold',fontSize:'11px'}}>🇧🇬</button><button onClick={()=>setLang('en')} style={{background:lang==='en'?'white':'transparent',color:lang==='en'?'#0F4C75':'white',border:'none',padding:'4px 8px',borderRadius:'8px',fontWeight:'bold',fontSize:'11px'}}>🇬🇧</button></div>
          {locDenied && <button onClick={()=>fetchLocation()} style={{fontSize:'9px',background:'#2ECC71',border:'none',color:'#0F4C75',padding:'5px 8px',borderRadius:'12px',fontWeight:'bold'}}>{t.enableLoc}</button>}
          <button onClick={logout} style={{fontSize:'10px',background:'#FF3B30',border:'none',color:'white',padding:'5px 10px',borderRadius:'12px',fontWeight:'bold'}}>{t.exit}</button>
        </header>
        <div style={{height:'52px',display:'flex',gap:'4px',padding:'6px',background:'#f1f3f4'}}>
          <button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666',fontSize:'11px'}}>{t.find} ({filteredRides.length})</button>
          <button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666',fontSize:'11px'}}>{t.my}</button>
          <button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='offer'?'#2ECC71':'white',color:tab==='offer'?'#0F4C75':'#666',fontSize:'11px'}}>{t.offer}</button>
          {isAdmin && <button onClick={()=>setTab('admin')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='admin'?'#FFD60A':'#FF3B30',color:tab==='admin'?'black':'white',fontSize:'11px'}}>{t.admin} ({reports.length}/{bans.length})</button>}
        </div>
      </div>

      {currentUser && isBanned(currentUser.phone) && <div style={{background:'#FF3B30',color:'white',padding:'10px',textAlign:'center',fontSize:'12px',fontWeight:'bold',flexShrink:0}}>⛔ {t.banned}: {isBanned(currentUser.phone)?.reason}</div>}

      {tab==='find' && (
        <div style={{flexShrink:0,background:'white',padding:'8px 10px',borderBottom:'1px solid #e5e7eb',display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={{background:'#e3f2fd',padding:'10px',borderRadius:'12px',border:'1px solid #90caf9'}}><div style={{fontSize:'11px',fontWeight:'800',color:'#0F4C75'}}>{t.important}</div><div style={{fontSize:'11px',marginTop:'4px'}}><b>{t.important1}</b> {t.important1b}<br/><b>{t.important2}</b> {t.important2b}</div></div>
          <div style={{display:'flex',gap:'6px'}}><button onClick={()=>setFilterType('')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'11px',background:filterType===''?'#0F4C75':'white',color:filterType===''?'white':'#666'}}>{t.all}</button><button onClick={()=>setFilterType('offer')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'10px',background:filterType==='offer'?'#2ECC71':'white'}}>🚗 {t.drivers}</button><button onClick={()=>setFilterType('request')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'10px',background:filterType==='request'?'#FFD60A':'white'}}>🙋 {t.passengers}</button></div>
          <input placeholder={t.search} value={filterText} onChange={e=>setFilterText(e.target.value)} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd',fontSize:'13px',width:'100%'}}/>
        </div>
      )}

      <div style={{flex:1,overflowY:'auto',background:'#f9fafb'}} ref={ridesContainerRef}>
        {tab==='find' && (
          <div style={{padding:'10px',display:'flex',flexDirection:'column',gap:'10px'}}>
            {filteredRides.map((r:any)=>{
              const banned = isBanned(r.driverPhone);
              const isReq = r.type==='request';
              return (
                <div key={r.id} style={{border: banned?'2px solid #FF3B30':isReq?'2px solid #FFD60A':'2px solid #2ECC71',borderRadius:'14px',padding:'12px',background: banned?'#ffeaea':isReq?'#fffbe6':'#f0fdf4',opacity:banned?0.6:1}}>
                  {banned && <div style={{background:'#FF3B30',color:'white',fontSize:'10px',padding:'4px 8px',borderRadius:'6px',marginBottom:'6px',fontWeight:'bold'}}>⛔ БАННАТ: {banned.reason}</div>}
                  <div style={{display:'flex',justifyContent:'space-between'}}><b style={{fontSize:'14px'}}>{getFlag(r.fromCountry)} {r.from} → {getFlag(r.toCountry)} {r.to}</b><span style={{background:isReq?'#FFD60A':'#2ECC71',color:isReq?'black':'white',fontSize:'9px',padding:'3px 8px',borderRadius:'12px',fontWeight:'bold'}}>{isReq?`🙋 ${t.seeks}`:`🚗 ${t.offers}`}</span></div>
                  <div style={{fontSize:'11px',marginTop:'4px'}}>{r.driverName} • {r.seats} • {r.carInfo} • {r.time}</div>
                  <div style={{fontSize:'10px',background:'#fff3cd',padding:'6px 8px',borderRadius:'8px',marginTop:'6px',border:'1px solid #ffe69c'}}>{t.notFree}</div>
                  {r.message && <div style={{fontSize:'11px',marginTop:'6px',background:'white',padding:'6px',borderRadius:'6px'}}>💬 {r.message}</div>}
                  <div style={{marginTop:'10px',background:'white',borderRadius:'10px',padding:'8px',border:'1px solid #ddd'}}>
                    <div style={{fontSize:'10px',fontWeight:'bold',color:'#0F4C75',marginBottom:'6px'}}>{t.connectDirect}</div>
                    <div style={{fontSize:'12px',fontWeight:'bold',marginBottom:'8px'}}>{r.driverName} • {r.driverPhone}</div>
                    <div style={{display:'flex',gap:'5px',marginBottom:'6px'}}>
                      <a href={`tel:${cleanPhone(r.driverPhone)}`} style={{flex:1,background:'#0F4C75',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>{t.call}</a>
                      <a href={`https://wa.me/${waPhone(r.driverPhone)}`} target="_blank" style={{flex:1,background:'#25D366',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>WhatsApp</a>
                      <a href={`viber://chat?number=${encodeURIComponent(cleanPhone(r.driverPhone))}`} style={{flex:1,background:'#7360F2',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>Viber</a>
                    </div>
                    <div style={{display:'flex',gap:'5px'}}>
                      <button onClick={()=>handleReport(r)} style={{flex:1,background:'#fff3cd',border:'1px solid #ffe69c',padding:'6px',borderRadius:'6px',fontSize:'10px',fontWeight:'bold'}}>{t.report}</button>
                      {isAdmin && <button onClick={()=>deleteRide(r.id)} style={{background:'#FF3B30',color:'white',border:'none',padding:'6px 12px',borderRadius:'6px',fontSize:'10px'}}>🗑️</button>}
                      {isAdmin && <button onClick={()=>{const reason=prompt('Причина:'); if(reason) handleBan(r.driverPhone, reason, '24h');}} style={{background:'black',color:'white',border:'none',padding:'6px 12px',borderRadius:'6px',fontSize:'10px'}}>⛔ БАН</button>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab==='admin' && isAdmin && (
          <div style={{padding:'10px',display:'flex',flexDirection:'column',gap:'12px'}}>
            <div style={{background:'#0F4C75',color:'white',padding:'12px',borderRadius:'12px'}}><div style={{fontWeight:'bold',fontSize:'14px'}}>👑 АДМИН - {currentUser.phone}</div><div style={{fontSize:'11px',opacity:0.8}}>Polling 2s - без рефреш!</div></div>

            <div style={{background:'white',border:'2px solid #FF3B30',borderRadius:'12px',padding:'12px'}}>
              <div style={{fontWeight:'bold',fontSize:'13px',color:'#FF3B30'}}>🔧 СПРИ САЙТА</div>
              <div style={{display:'flex',gap:'8px',marginTop:'10px',alignItems:'center'}}>
                <button onClick={toggleMaintenance} style={{background:maintenance.enabled?'#2ECC71':'#FF3B30',color:'white',border:'none',padding:'10px 16px',borderRadius:'8px',fontWeight:'bold',fontSize:'12px'}}>{maintenance.enabled?'✅ СПРЯН - ПУСНИ':'🔴 СПРИ САЙТА СЕГА'}</button>
                <span style={{fontSize:'11px',fontWeight:'bold',color:maintenance.enabled?'#FF3B30':'#2ECC71'}}>{maintenance.enabled?'🔴 СПРЯН':'🟢 Работи'}</span>
              </div>
              <input placeholder="Съобщение..." value={maintenance.msg} onChange={e=>updateMaintenanceMsg(e.target.value)} style={{width:'100%',marginTop:'8px',padding:'8px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'11px'}}/>
            </div>

            <div style={{background:'white',border:'2px solid black',borderRadius:'12px',padding:'12px'}}>
              <div style={{fontWeight:'bold',fontSize:'13px'}}>⛔ БАН - {bans.length}</div>
              <div style={{display:'flex',gap:'6px',marginTop:'8px'}}><input placeholder="Телефон" value={banPhoneInput} onChange={e=>setBanPhoneInput(e.target.value)} style={{flex:1,padding:'8px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'11px'}}/><select value={banDuration} onChange={e=>setBanDuration(e.target.value)} style={{padding:'8px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'11px'}}><option value="1h">1ч</option><option value="24h">24ч</option><option value="7d">7д</option><option value="forever">Завинаги</option></select></div>
              <input placeholder="Причина" value={banReasonInput} onChange={e=>setBanReasonInput(e.target.value)} style={{width:'100%',marginTop:'6px',padding:'8px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'11px'}}/>
              <button onClick={()=>{if(!banPhoneInput) return; handleBan(banPhoneInput, banReasonInput||'Некоректен', banDuration);}} style={{width:'100%',marginTop:'6px',background:'black',color:'white',padding:'10px',borderRadius:'8px',fontWeight:'bold',border:'none'}}>⛔ БАННИ ГЛОБАЛНО</button>
              <div style={{marginTop:'10px',display:'flex',flexDirection:'column',gap:'6px',maxHeight:'200px',overflowY:'auto'}}>
                {bans.map(b=><div key={b.id} style={{background:'#ffeaea',padding:'8px',borderRadius:'8px',display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'bold',fontSize:'11px'}}>{b.originalPhone||b.original_phone} ({b.phone})</div><div style={{fontSize:'10px'}}>{b.reason} • {b.until==='forever'?'завинаги':new Date(Number(b.until)).toLocaleString()}</div></div><button onClick={()=>unban(b.id)} style={{background:'#2ECC71',border:'none',padding:'6px 10px',borderRadius:'6px',fontSize:'10px'}}>UNBAN</button></div>)}
              </div>
            </div>

            <div style={{background:'white',border:'2px solid #FFD60A',borderRadius:'12px',padding:'12px'}}>
              <div style={{fontWeight:'bold',fontSize:'13px'}}>🚩 ДОКЛАДИ - {reports.length}</div>
              <div style={{marginTop:'10px',display:'flex',flexDirection:'column',gap:'8px',maxHeight:'400px',overflowY:'auto'}}>
                {reports.map(rep=><div key={rep.id} style={{background:'#fffbe6',border:'1px solid #FFD60A',padding:'10px',borderRadius:'10px'}}>
                  <div style={{fontSize:'11px',fontWeight:'bold'}}>🚩 {rep.reportedName||rep.reported_name} • {rep.reportedPhone||rep.reported_phone} • {rep.from||rep.from_city}→{rep.to||rep.to_city}</div>
                  <div style={{fontSize:'10px',marginTop:'2px'}}>Причина: <b>{rep.reason}</b></div>
                  <div style={{fontSize:'10px',color:'#666'}}>От: {rep.reporterName||rep.reporter_name} ({rep.reporterPhone||rep.reporter_phone})</div>
                  <div style={{display:'flex',gap:'6px',marginTop:'6px'}}>
                    <button onClick={()=>banFromReport(rep,'24h')} style={{flex:1,background:'#FF3B30',color:'white',border:'none',padding:'6px',borderRadius:'6px',fontSize:'10px',fontWeight:'bold'}}>⛔ БАН 24ч</button>
                    <button onClick={()=>banFromReport(rep,'forever')} style={{flex:1,background:'black',color:'white',border:'none',padding:'6px',borderRadius:'6px',fontSize:'10px',fontWeight:'bold'}}>⛔ Завинаги</button>
                    <button onClick={()=>dismissReport(rep.id)} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #ddd',background:'white',fontSize:'10px'}}>❌</button>
                  </div>
                </div>)}
                {reports.length===0 && <div style={{fontSize:'11px',textAlign:'center',color:'#666'}}>Няма доклади</div>}
              </div>
            </div>

            <div style={{background:'white',border:'2px solid #0F4C75',borderRadius:'12px',padding:'12px'}}>
              <div style={{fontWeight:'bold',fontSize:'13px'}}>📋 ВСИЧКИ ОБЯВИ - {rides.length}</div>
              <div style={{marginTop:'8px',display:'flex',flexDirection:'column',gap:'6px',maxHeight:'300px',overflowY:'auto'}}>
                {rides.slice().reverse().map(r=><div key={r.id} style={{border:'1px solid #ddd',padding:'8px',borderRadius:'8px',display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'bold',fontSize:'11px'}}>{r.from}→{r.to} • {r.driverName} • {r.driverPhone}</div></div><div style={{display:'flex',gap:'4px'}}><button onClick={()=>deleteRide(r.id)} style={{background:'#FF3B30',color:'white',border:'none',padding:'6px 8px',borderRadius:'6px',fontSize:'10px'}}>🗑️</button><button onClick={()=>handleBan(r.driverPhone,'Админ','24h')} style={{background:'black',color:'white',border:'none',padding:'6px 8px',borderRadius:'6px',fontSize:'10px'}}>⛔</button></div></div>)}
              </div>
            </div>
          </div>
        )}

        {tab==='offer' && (
          <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'10px'}}>
            {currentUser && isBanned(currentUser.phone) && <div style={{background:'#FF3B30',color:'white',padding:'10px',borderRadius:'10px',fontWeight:'bold',fontSize:'12px'}}>⛔ БАННАТ СИ: {isBanned(currentUser.phone)?.reason}</div>}
            <div style={{display:'flex',gap:'6px',background:'#f1f3f4',padding:'3px',borderRadius:'12px'}}><button onClick={()=>setOfferForm({...offerForm,type:'offer'})} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'11px',background:offerForm.type==='offer'?'#0F4C75':'white',color:offerForm.type==='offer'?'white':'#666'}}>{t.imDriver}</button><button onClick={()=>setOfferForm({...offerForm,type:'request'})} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'11px',background:offerForm.type==='request'?'#FFD60A':'white',color:offerForm.type==='request'?'black':'#666'}}>{t.imPassenger}</button></div>
            <div style={{display:'flex',gap:'6px'}}><select value={offerForm.fromCountry} onChange={e=>setOfferForm({...offerForm,fromCountry:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'2px solid #2ECC71',background:'#e6f9ed',fontWeight:'bold',fontSize:'12px'}}>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select><input placeholder={`${t.from} - London`} value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:offerForm.from?'2px solid #2ECC71':'2px solid #FF3B30'}}/></div>
            <div style={{display:'flex',gap:'6px'}}><select value={offerForm.toCountry} onChange={e=>setOfferForm({...offerForm,toCountry:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'2px solid #2ECC71',background:'#e6f9ed',fontWeight:'bold',fontSize:'12px'}}>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select><input placeholder={`${t.to} - Sofia`} value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:offerForm.to?'2px solid #2ECC71':'2px solid #FF3B30'}}/></div>
            {offerForm.type==='offer' && <><div style={{display:'flex',gap:'6px'}}><input placeholder={`${t.brand} *`} value={offerForm.carBrand} onChange={e=>setOfferForm({...offerForm,carBrand:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:offerForm.carBrand?'2px solid #2ECC71':'2px solid #FF3B30'}}/><input placeholder={`${t.color} *`} value={offerForm.carColor} onChange={e=>setOfferForm({...offerForm,carColor:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:offerForm.carColor?'2px solid #2ECC71':'2px solid #FF3B30'}}/></div><input placeholder={`${t.reg} *`} value={offerForm.carReg} onChange={e=>setOfferForm({...offerForm,carReg:e.target.value.toUpperCase()})} style={{width:'100%',padding:'10px',borderRadius:'10px',border:offerForm.carReg?'2px solid #2ECC71':'2px solid #FF3B30'}}/></>}
            <input placeholder={offerForm.type==='request'?`${t.seatsNeed} - 2`:`${t.seatsFree} - 4`} value={offerForm.seats} onChange={e=>setOfferForm({...offerForm,seats:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:offerForm.seats?'2px solid #2ECC71':'2px solid #FF3B30'}}/>
            <textarea placeholder={t.note} value={offerForm.message} onChange={e=>setOfferForm({...offerForm,message:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd',minHeight:'50px'}}/>
            {offerForm.type==='offer' && <label style={{display:'flex',gap:'8px',background:offerForm.isDriver?'#e6f9ed':'#fff8e1',padding:'10px',borderRadius:'10px',border:`2px solid ${offerForm.isDriver?'#2ECC71':'#FFD60A'}`,fontSize:'11px'}}><input type="checkbox" checked={offerForm.isDriver} onChange={e=>setOfferForm({...offerForm,isDriver:e.target.checked})}/>{t.declare}</label>}
            <button onClick={publishRide} disabled={!canPublish} style={{background:canPublish?'#2ECC71':'#ccc',padding:'14px',borderRadius:'10px',fontWeight:'bold',border:'none'}}>{canPublish? (offerForm.type==='request'?`${t.publishSeeks} ${offerForm.from}→${offerForm.to}`:`${t.publish} ${offerForm.from}→${offerForm.to}`):`${t.fillFromTo} *`}</button>
          </div>
        )}
        {tab==='my' && <div style={{padding:'10px'}}>{rides.filter(r=>r.driverId===currentUser?.id).map((r:any)=><div key={r.id} style={{border:'2px solid #0F4C75',borderRadius:'12px',padding:'12px',marginBottom:'8px'}}><b>{r.from} → {r.to}</b> <span style={{background:r.type==='request'?'#FFD60A':'#2ECC71',padding:'2px 6px',borderRadius:'6px',fontSize:'10px'}}>{r.type==='request'?t.youSeek:t.youOffer}</span><div style={{display:'flex',gap:'6px',marginTop:'8px'}}><button onClick={()=>{setOfferForm({type:r.type,from:r.from,to:r.to,fromCountry:r.fromCountry,toCountry:r.toCountry,time:r.time,returnTime:'',date:r.date,seats:r.seats.toString(),message:r.message,isDriver:r.isDriverVerified,carBrand:'',carColor:'',carReg:''}); setEditingRide(r.id); setTab('offer');}} style={{flex:1,background:'#0F4C75',color:'white',border:'none',padding:'8px',borderRadius:'8px',fontSize:'12px'}}>{t.edit}</button><button onClick={()=>deleteRide(r.id)} style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #ddd',background:'white'}}>🗑️</button></div></div>)}</div>}
      </div>

      <div style={{flexShrink:0,minHeight:'88px',background:'white',borderTop:'1px solid #e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',gap:'8px'}}>
        <div style={{flex:1}}><div style={{fontSize:'12px',fontWeight:'800',color:'#0F4C75'}}>{t.footerTitle}</div><div style={{fontSize:'10px',color:'#333',marginTop:'2px'}}>{t.footerSub}<br/><span style={{color:'#b45309',fontWeight:'700'}}>{t.footerWarn}</span></div></div>
        <a href="https://ko-fi.com/dropoffpay" target="_blank" style={{background:'#72A9ED',color:'white',padding:'10px 16px',borderRadius:'20px',fontWeight:'bold',textDecoration:'none',fontSize:'12px'}}>☕ Ko-fi</a>
      </div>
    </main>
  );
}