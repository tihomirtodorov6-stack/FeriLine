'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ypfbljjrpppkdxdftjcv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NZrVv1hI7aTWVdeyZT27-Q_rWp_olMG";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_PHONES = ['+447935463970','447935463970','07935463970','+447935463970'.replace('+','')];
const clean = (p:string)=> p.replace(/[^0-9]/g,'').slice(-10);
const isAdminPhone = (phone:string)=>{ if(!phone) return false; const c = phone.replace(/[^0-9+]/g,''); return ADMIN_PHONES.includes(c) || ADMIN_PHONES.includes(clean(c)) || c.includes('7935463970'); };

const COUNTRIES = [{code:'BG',name:'🇧🇬 България'},{code:'GB',name:'🇬🇧 UK'},{code:'DE',name:'🇩🇪 Германия'},{code:'ES',name:'🇪🇸 Испания'},{code:'GR',name:'🇬🇷 Гърция'},{code:'RO',name:'🇷🇴 Румъния'},{code:'TR',name:'🇹🇷 Турция'}];

const TRANSLATIONS = {
  bg: { platformFree:'Платформата е 100% безплатна', siteFree:'Сайтът е безплатен', sharedCosts:'Пътуването е споделени разходи', howItWorks:'ℹ️ Как работи', exit:'Изход', find:'Намери', my:'Моите', offer:'Предложи', admin:'👑 Админ', important:'ℹ️ ВАЖНО - 2 неща:', important1:'1. Сайтът VoziMe е 100% безплатен.', important1b:'Ние не вземаме комисионна. Ако искаш да ни подкрепиш - бутона Ko-fi долу.', important2:'2. Самото пътуване НЕ е безплатно.', important2b:'Шофьор и пътник се договарят ЛИЧНО за споделени разходи. Без печалба.', all:'Всички', drivers:'Шофьори', passengers:'Пътници', search:'🔍 Лондон, София...', notFree:'⚠️ Пътуването НЕ е безплатно - лична договорка за споделени разходи между шофьор и пътник. Сайтът не участва.', connectDirect:'📞 СВЪРЖИ СЕ ДИРЕКТНО - Лична договорка за разходите:', call:'📞 Обади се', offers:'🚗 ПРЕДЛАГА', seeks:'🙋 ТЪРСИ', driver:'Шофьор', passenger:'Пътник', imDriver:'🚗 Аз съм Шофьор', imPassenger:'🙋 Аз съм Пътник', siteFreeUse:'Сайтът е безплатен', useFree:'използвай го свободно.', travelNotFree:'Пътуването НЕ е безплатно', personalAgreement:'ти и другият човек се договаряте ЛИЧНО какви са споделените разходи.', from:'От', to:'До', brand:'Марка', color:'Цвят', reg:'Рег. номер', seatsNeed:'Места нужни', seatsFree:'Свободни места', note:'Бележка...', declare:'ДЕКЛАРИРАМ: Пътувам лично по маршрута. Предлагам само споделени разходи, БЕЗ печалба. Не е такси. Сайтът е само борса.', fillFromTo:'Попълни От и До', publishSeeks:'🙋 Публикувай че ТЪРСИШ', publish:'🚗 Публикувай', edit:'Редактирай', youSeek:'ТЪРСИШ', youOffer:'ПРЕДЛАГАШ', footerTitle:'❤️ Платформата VoziMe е безплатна', footerSub:'Сайтът не взема комисионна. Подкрепи ни с Ko-fi.', footerWarn:'Пътуванията НЕ са безплатни - лична договорка за разходите.', enableLoc:'📍 Включи локация', loc:'📍 Локация', loadingLoc:'📍 Зарежда...', whatIsCost:'Здравей! За', whatIsCost2:'от VoziMe - какви са споделените разходи?', today:'Днес', report:'🚩 Докладвай', reportReason:'Причина за доклад:', banned:'⛔ БАННАТ СИ', maintenanceTitle:'🔧 Сайтът е в профилактика', maintenanceMsg:'Работим по подобрения. Ще се върнем скоро!'},
  en: { platformFree:'Platform is 100% free', siteFree:'Site is free', sharedCosts:'Travel is shared costs', howItWorks:'ℹ️ How it works', exit:'Exit', find:'Find', my:'My rides', offer:'Offer', admin:'👑 Admin', important:'ℹ️ IMPORTANT - 2 things:', important1:'1. VoziMe site is 100% free.', important1b:'We take no commission. If you want to support - Ko-fi below.', important2:'2. Trip itself is NOT free.', important2b:'Driver and passenger agree PERSONALLY on shared costs. No profit.', all:'All', drivers:'Drivers', passengers:'Passengers', search:'🔍 London, Sofia...', notFree:'⚠️ Trip is NOT free - personal agreement for shared costs. Site not involved.', connectDirect:'📞 CONNECT DIRECTLY - Personal cost agreement:', call:'📞 Call', offers:'🚗 OFFERS', seeks:'🙋 SEEKS', driver:'Driver', passenger:'Passenger', imDriver:'🚗 I am Driver', imPassenger:'🙋 I am Passenger', siteFreeUse:'Site is free', useFree:'use it freely.', travelNotFree:'Trip is NOT free', personalAgreement:'you and the other person agree PERSONALLY on shared costs.', from:'From', to:'To', brand:'Brand', color:'Color', reg:'Reg number', seatsNeed:'Seats needed', seatsFree:'Free seats', note:'Note...', declare:'I DECLARE: I travel personally. Only shared costs, NO profit. Not a taxi.', fillFromTo:'Fill From and To', publishSeeks:'🙋 Publish that you SEEK', publish:'🚗 Publish', edit:'Edit', youSeek:'YOU SEEK', youOffer:'YOU OFFER', footerTitle:'❤️ VoziMe Platform is free', footerSub:'Site takes no commission. Support us with Ko-fi.', footerWarn:'Trips are NOT free - personal cost agreement.', enableLoc:'📍 Enable location', loc:'📍 Location', loadingLoc:'📍 Loading...', whatIsCost:'Hello! For', whatIsCost2:'from VoziMe - what are shared costs?', today:'Today', report:'🚩 Report', reportReason:'Report reason:', banned:'⛔ YOU ARE BANNED', maintenanceTitle:'🔧 Site under maintenance', maintenanceMsg:'We are working on improvements. Back soon!'}
};

export default function Home(){
  const [lang,setLang]=useState<'bg'|'en'>('bg');
  const [currentUser,setCurrentUser]=useState<any>(null);
  const [tab,setTab]=useState<'find'|'my'|'offer'|'admin'>('find');
  const [rides,setRides]=useState<any[]>([]);
  const [editingRide,setEditingRide]=useState<string|null>(null);
  const [offerForm,setOfferForm]=useState({type:'offer',from:'',to:'',fromCountry:'GB',toCountry:'BG',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:'',oblast:''});
  const [filterType,setFilterType]=useState(''); const [filterText,setFilterText]=useState('');
  const [myLocation,setMyLocation]=useState<any>(null);
  const [locLoading,setLocLoading]=useState(false); const [locDenied,setLocDenied]=useState(false);
  const [showTerms,setShowTerms]=useState(false);
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
          setLocDenied(false);
        }catch{ tryIPLocation(); } finally{ setLocLoading(false); }
      }, ()=>{ tryIPLocation(); }, {enableHighAccuracy:true, timeout:8000});
    } else { tryIPLocation(); }
  };
  const tryIPLocation = async ()=>{
    try{ const res = await fetch('https://ipapi.co/json/'); const data = await res.json(); if(data.city){ setMyLocation({country: data.country_code||'GB', city: data.city}); setLocDenied(false); } else { setMyLocation(null); setLocDenied(true); } }catch{ setMyLocation(null); setLocDenied(true); } finally{ setLocLoading(false); }
  };

  useEffect(()=>{
    const savedLang = localStorage.getItem('vozime_lang') as 'bg'|'en'; if(savedLang) setLang(savedLang);
    const cu=localStorage.getItem('vozime_current'); if(cu){ setCurrentUser(JSON.parse(cu)); }
    const maint = localStorage.getItem('vozime_maintenance'); if(maint){ setMaintenance(JSON.parse(maint)); }
    const b = localStorage.getItem('vozime_bans'); if(b) setBans(JSON.parse(b));
    const r = localStorage.getItem('vozime_reports'); if(r) setReports(JSON.parse(r));
    loadRides(); fetchLocation();
  },[]);
  useEffect(()=>{ localStorage.setItem('vozime_lang', lang); },[lang]);
  useEffect(()=>{ localStorage.setItem('vozime_maintenance', JSON.stringify(maintenance)); },[maintenance]);
  useEffect(()=>{ localStorage.setItem('vozime_bans', JSON.stringify(bans)); },[bans]);
  useEffect(()=>{ localStorage.setItem('vozime_reports', JSON.stringify(reports)); },[reports]);
  useEffect(()=>{ if(ridesContainerRef.current){ ridesContainerRef.current.scrollTop = ridesContainerRef.current.scrollHeight; } },[rides, filterType, filterText, tab]);

  const mapFromDB = (d:any)=>({id:d.id, driverName:d.driver_name, driverPhone:d.driver_phone, driverId:d.driver_id, from:d.from_city, to:d.to_city, fromCountry:d.from_country||'BG', toCountry:d.to_country||'BG', time:d.time, returnTime:d.return_time, date:d.date, seats:d.seats, message:d.message, createdAt:d.created_at, type:d.type||'offer', carInfo:d.car_info, isDriverVerified:d.is_driver});
  const loadRides = async ()=>{ const cutoff = Date.now() - 48*60*60*1000; const {data} = await supabase.from('rides').select('*').gt('created_at', cutoff).order('created_at',{ascending:true}); if(data) setRides(data.map(mapFromDB)); };
  const logout=()=>{localStorage.removeItem('vozime_current');setCurrentUser(null); setTab('find');};
  const isBanned = (phone:string)=>{ const now=Date.now(); return bans.find(b=> b.phone===clean(phone) && (b.until==='forever' || b.until>now)); };
  const currentBanned = currentUser? isBanned(currentUser.phone) : null;

  const carFilled = offerForm.carBrand.trim() && offerForm.carColor.trim() && offerForm.carReg.trim();
  const seatsFilled = offerForm.seats.trim() && parseInt(offerForm.seats)>0;
  const canPublish = offerForm.from.trim() && offerForm.to.trim() && seatsFilled && (offerForm.type==='request' || (carFilled && offerForm.isDriver)) &&!currentBanned;

  const publishRide= async ()=>{
    if(currentBanned){ alert(`${t.banned}: ${currentBanned.reason} до ${currentBanned.until==='forever'?'завинаги':new Date(currentBanned.until).toLocaleString()}`); return; }
    if(!canPublish){alert(lang==='bg'?'Попълни всички *':'Fill all *');return;}
    const id = editingRide||Date.now().toString(); const existingCreated = editingRide? (rides.find(r=>r.id===editingRide)?.createdAt || Date.now()) : Date.now();
    const row:any = {id, driver_name: `${currentUser.firstName} ${currentUser.lastName}`, driver_phone: currentUser.phone, driver_id: currentUser.id, from_city: offerForm.from, to_city: offerForm.to, time: offerForm.time, return_time: offerForm.returnTime, date: lang==='bg'?'Днес':'Today', seats: parseInt(offerForm.seats)||1, message: offerForm.message, created_at: existingCreated, type: offerForm.type, is_driver: offerForm.isDriver, car_brand: offerForm.carBrand, car_color: offerForm.carColor, car_reg: offerForm.carReg.toUpperCase(), car_info: `${offerForm.carBrand} ${offerForm.carColor} ${offerForm.carReg.toUpperCase()}`, from_country: offerForm.fromCountry, to_country: offerForm.toCountry};
    if(editingRide) await supabase.from('rides').update(row).eq('id', editingRide); else await supabase.from('rides').insert(row);
    setEditingRide(null); await loadRides(); setTab('find');
  };
  const startEdit=(r:any)=>{ setOfferForm({type:r.type,from:r.from,to:r.to,fromCountry:r.fromCountry,toCountry:r.toCountry,time:r.time,returnTime:r.returnTime,date:r.date,seats:r.seats.toString(),message:r.message,isDriver:r.isDriverVerified,carBrand:'',carColor:'',carReg:'',oblast:''}); setEditingRide(r.id); setTab('offer'); };
  const deleteRide = async (id:string)=>{ await supabase.from('rides').delete().eq('id', id); await loadRides(); }
  const getFlag = (c:string)=>COUNTRIES.find(x=>x.code===c)?.name.split(' ')[0]||'🏳️';
  const cleanPhone = (p:string)=> p.replace(/[^0-9+]/g,''); const waPhone = (p:string)=> p.replace(/[^0-9]/g,'');

  const handleReport = (ride:any)=>{
    const reason = prompt(lang==='bg'?`${t.reportReason}\n1. Иска прекалено много пари\n2. Некоректен / измама\n3. Не отговаря\n4. Друго`:`${t.reportReason}\n1. Asks too much money\n2. Scam / rude\n3. No answer\n4. Other`);
    if(!reason) return;
    const newReport = {id:Date.now().toString(), rideId:ride.id, reportedPhone:ride.driverPhone, reportedName:ride.driverName, from:ride.from, to:ride.to, reason, reporterPhone:currentUser?.phone||'anon', reporterName:currentUser?`${currentUser.firstName} ${currentUser.lastName}`:'Anon', createdAt:Date.now()};
    setReports([newReport,...reports]);
    alert(lang==='bg'?'Докладът е изпратен до админа!':'Report sent to admin!');
  };
  const handleBan = (phone:string, reason:string, duration:string)=>{
    const cleanP = clean(phone);
    let until:any = 'forever';
    if(duration==='1h') until = Date.now()+3600000;
    if(duration==='24h') until = Date.now()+86400000;
    if(duration==='7d') until = Date.now()+604800000;
    const newBan = {id:Date.now().toString(), phone:cleanP, originalPhone:phone, reason, until, bannedBy:'+447935463970', createdAt:Date.now()};
    setBans([newBan,...bans.filter(b=>b.phone!==cleanP)]);
    setBanPhoneInput(''); setBanReasonInput('');
  };
  const unban = (id:string)=> setBans(bans.filter(b=>b.id!==id));

  const filteredRides = rides.filter(r=>{ if(filterText &&!(r.from.toLowerCase().includes(filterText.toLowerCase())||r.to.toLowerCase().includes(filterText.toLowerCase()))) return false; if(filterType && r.type!==filterType) return false; return true;});

  if(maintenance.enabled &&!isAdmin){
    return (
      <main style={{height:'100dvh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F4C75',color:'white',padding:'20px',textAlign:'center',fontFamily:'-apple-system'}}>
        <div>
          <div style={{fontSize:'60px'}}>🔧</div>
          <div style={{fontSize:'24px',fontWeight:'bold',marginTop:'10px'}}>{t.maintenanceTitle}</div>
          <div style={{fontSize:'14px',marginTop:'10px',opacity:0.9}}>{maintenance.msg||t.maintenanceMsg}</div>
          <div style={{fontSize:'12px',marginTop:'20px',opacity:0.6}}>VoziMe WORLD • dropoffpay.co.uk</div>
          {currentUser && <button onClick={logout} style={{marginTop:'20px',background:'#FF3B30',border:'none',color:'white',padding:'10px 20px',borderRadius:'12px'}}>Изход (админ логин)</button>}
        </div>
      </main>
    );
  }

  return (
    <main style={{height:'100dvh',width:'100%',maxWidth:'480px',margin:'0 auto',background:'white',display:'flex',flexDirection:'column',overflow:'hidden',fontFamily:'-apple-system, sans-serif'}}>
      <div style={{flexShrink:0}}>
        <div style={{background:maintenance.enabled?'#FF3B30':'#0F4C75',color:'white',padding:'6px',textAlign:'center',fontSize:'10px'}}>{maintenance.enabled?'🔴 MAINTENANCE MODE - Сайтът е спрян за поправка':'🌍 VoziMe WORLD • Платформата е 100% безплатна • dropoffpay.co.uk'}</div>
        <header style={{height:'56px',minHeight:'56px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 8px',gap:'6px'}}>
          <div style={{width:'32px',height:'32px',background:isAdmin?'#FFD60A':'#2ECC71',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{isAdmin?'👑':'🌍'}</div>
          <div style={{flex:1,overflow:'hidden'}}>
            {locLoading? <div style={{fontWeight:'bold',fontSize:'12px'}}>{t.loadingLoc}</div> : myLocation? <><div style={{fontWeight:'bold',fontSize:'13px'}}>{getFlag(myLocation.country)} {myLocation.city} {isAdmin&&'👑'}</div><div style={{fontSize:'9px',opacity:0.9}}>{t.siteFree} • {t.sharedCosts}</div></> : <><div style={{fontWeight:'bold',fontSize:'12px'}}>🌍 VoziMe {isAdmin&&'👑 ADMIN'}</div><div style={{fontSize:'9px',opacity:0.9}}>{t.siteFree} • {t.sharedCosts}</div></>}
          </div>
          <div style={{display:'flex',background:'rgba(255,255,255,0.15)',borderRadius:'12px',padding:'2px',gap:'2px'}}>
            <button onClick={()=>setLang('bg')} style={{background:lang==='bg'?'white':'transparent',color:lang==='bg'?'#0F4C75':'white',border:'none',padding:'4px 8px',borderRadius:'8px',fontWeight:'bold',fontSize:'11px'}}>🇧🇬</button>
            <button onClick={()=>setLang('en')} style={{background:lang==='en'?'white':'transparent',color:lang==='en'?'#0F4C75':'white',border:'none',padding:'4px 8px',borderRadius:'8px',fontWeight:'bold',fontSize:'11px'}}>🇬🇧</button>
          </div>
          {locDenied && <button onClick={()=>fetchLocation()} style={{fontSize:'9px',background:'#2ECC71',border:'none',color:'#0F4C75',padding:'5px 8px',borderRadius:'12px',fontWeight:'bold'}}>{t.enableLoc}</button>}
          <button onClick={()=>setShowTerms(true)} style={{fontSize:'9px',background:'rgba(255,255,255,0.15)',border:'none',color:'white',padding:'5px 8px',borderRadius:'12px'}}>ℹ️</button>
          <button onClick={logout} style={{fontSize:'10px',background:'#FF3B30',border:'none',color:'white',padding:'5px 10px',borderRadius:'12px',fontWeight:'bold'}}>{t.exit}</button>
        </header>
        <div style={{height:'52px',display:'flex',gap:'4px',padding:'6px',background:'#f1f3f4'}}>
          <button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666',fontSize:'11px'}}>{t.find} ({filteredRides.length})</button>
          <button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666',fontSize:'11px'}}>{t.my}</button>
          <button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='offer'?'#2ECC71':'white',color:tab==='offer'?'#0F4C75':'#666',fontSize:'11px'}}>{t.offer}</button>
          {isAdmin && <button onClick={()=>setTab('admin')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:tab==='admin'?'#FFD60A':'#FF3B30',color:tab==='admin'?'black':'white',fontSize:'11px'}}>{t.admin} ({reports.length}/{bans.length})</button>}
        </div>
      </div>

      {currentBanned && <div style={{background:'#FF3B30',color:'white',padding:'10px',textAlign:'center',fontSize:'12px',fontWeight:'bold',flexShrink:0}}>⛔ {t.banned}: {currentBanned.reason} - {currentBanned.until==='forever'?'завинаги / forever':new Date(currentBanned.until).toLocaleString()}</div>}

      {tab==='find' && (
        <div style={{flexShrink:0,background:'white',padding:'8px 10px',borderBottom:'1px solid #e5e7eb',display:'flex',flexDirection:'column',gap:'8px'}}>
          <div style={{background:'#e3f2fd',padding:'10px',borderRadius:'12px',border:'1px solid #90caf9'}}>
            <div style={{fontSize:'11px',fontWeight:'800',color:'#0F4C75'}}>{t.important}</div>
            <div style={{fontSize:'11px',marginTop:'4px',lineHeight:'1.4'}}><b>{t.important1}</b> {t.important1b}<br/><b>{t.important2}</b> {t.important2b}</div>
          </div>
          <div style={{display:'flex',gap:'6px'}}>
            <button onClick={()=>setFilterType('')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'11px',background:filterType===''?'#0F4C75':'white',color:filterType===''?'white':'#666'}}>{t.all}</button>
            <button onClick={()=>setFilterType('offer')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'10px',background:filterType==='offer'?'#2ECC71':'white'}}>🚗 {t.drivers}</button>
            <button onClick={()=>setFilterType('request')} style={{flex:1,padding:'8px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'10px',background:filterType==='request'?'#FFD60A':'white'}}>🙋 {t.passengers}</button>
          </div>
          <input placeholder={t.search} value={filterText} onChange={e=>setFilterText(e.target.value)} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd',fontSize:'13px',width:'100%'}}/>
        </div>
      )}

      <div style={{flex:1,overflowY:'auto',background:'#f9fafb'}} ref={ridesContainerRef}>
        {tab==='find' && (
          <div style={{padding:'10px',display:'flex',flexDirection:'column',gap:'10px'}}>
            {filteredRides.map((r:any)=>{
              const isReq = r.type==='request';
              const banned = isBanned(r.driverPhone);
              return (
                <div key={r.id} style={{border: banned?'2px solid #FF3B30':isReq?'2px solid #FFD60A':'2px solid #2ECC71',borderRadius:'14px',padding:'12px',background: banned?'#ffeaea':isReq?'#fffbe6':'#f0fdf4',opacity:banned?0.6:1}}>
                  {banned && <div style={{background:'#FF3B30',color:'white',fontSize:'10px',padding:'4px 8px',borderRadius:'6px',marginBottom:'6px',fontWeight:'bold'}}>⛔ БАННАТ: {banned.reason}</div>}
                  <div style={{display:'flex',justifyContent:'space-between'}}><b style={{fontSize:'14px'}}>{getFlag(r.fromCountry)} {r.from} → {getFlag(r.toCountry)} {r.to}</b><span style={{background:isReq?'#FFD60A':'#2ECC71',color:isReq?'black':'white',fontSize:'9px',padding:'3px 8px',borderRadius:'12px',fontWeight:'bold'}}>{isReq?`🙋 ${t.seeks}`:`🚗 ${t.offers}`}</span></div>
                  <div style={{fontSize:'11px',marginTop:'4px'}}>{isReq?`${t.passenger} ${r.driverName} • ${r.seats}`:`${t.driver} ${r.driverName} • ${r.seats} • ${r.carInfo}`} • {r.time} • {r.date}</div>
                  <div style={{fontSize:'10px',background:'#fff3cd',padding:'6px 8px',borderRadius:'8px',marginTop:'6px',border:'1px solid #ffe69c'}}>{t.notFree}</div>
                  {r.message && <div style={{fontSize:'11px',marginTop:'6px',background:'white',padding:'6px',borderRadius:'6px'}}>💬 {r.message}</div>}
                  <div style={{marginTop:'10px',background:'white',borderRadius:'10px',padding:'8px',border:'1px solid #ddd'}}>
                    <div style={{fontSize:'10px',fontWeight:'bold',color:'#0F4C75',marginBottom:'6px'}}>{t.connectDirect}</div>
                    <div style={{fontSize:'12px',fontWeight:'bold',marginBottom:'8px'}}>{r.driverName} • {r.driverPhone}</div>
                    <div style={{display:'flex',gap:'5px',marginBottom:'6px'}}>
                      <a href={`tel:${cleanPhone(r.driverPhone)}`} style={{flex:1,background:'#0F4C75',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>{t.call}</a>
                      <a href={`https://wa.me/${waPhone(r.driverPhone)}?text=${encodeURIComponent(`${t.whatIsCost} ${r.from} → ${r.to} ${t.whatIsCost2}`)}`} target="_blank" style={{flex:1,background:'#25D366',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>💬 WhatsApp</a>
                      <a href={`viber://chat?number=${encodeURIComponent(cleanPhone(r.driverPhone))}`} style={{flex:1,background:'#7360F2',color:'white',padding:'10px',borderRadius:'8px',textAlign:'center',fontWeight:'bold',textDecoration:'none',fontSize:'11px'}}>📱 Viber</a>
                    </div>
                    <div style={{display:'flex',gap:'5px'}}>
                      <button onClick={()=>handleReport(r)} style={{flex:1,background:'#fff3cd',border:'1px solid #ffe69c',padding:'6px',borderRadius:'6px',fontSize:'10px',fontWeight:'bold'}}>{t.report}</button>
                      {isAdmin && <button onClick={()=>deleteRide(r.id)} style={{background:'#FF3B30',color:'white',border:'none',padding:'6px 12px',borderRadius:'6px',fontSize:'10px',fontWeight:'bold'}}>🗑️ Админ изтрий</button>}
                      {isAdmin && <button onClick={()=>{const reason=prompt('Причина за бан:'); if(reason) handleBan(r.driverPhone, reason, '24h');}} style={{background:'black',color:'white',border:'none',padding:'6px 12px',borderRadius:'6px',fontSize:'10px',fontWeight:'bold'}}>⛔ БАН</button>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab==='admin' && isAdmin && (
          <div style={{padding:'10px',display:'flex',flexDirection:'column',gap:'12px'}}>
            <div style={{background:'#0F4C75',color:'white',padding:'12px',borderRadius:'12px'}}>
              <div style={{fontWeight:'bold',fontSize:'14px'}}>👑 АДМИН ПАНЕЛ - {currentUser.phone}</div>
              <div style={{fontSize:'11px',opacity:0.8}}>Само ти виждаш това. Всички екстри.</div>
            </div>

            <div style={{background:'white',border:'2px solid #FF3B30',borderRadius:'12px',padding:'12px'}}>
              <div style={{fontWeight:'bold',fontSize:'13px',color:'#FF3B30'}}>🔧 СПРИ САЙТА ЗА ПОПРАВКА</div>
              <div style={{fontSize:'11px',marginTop:'4px'}}>Когато е включено, всички освен теб виждат екран "Сайтът е в профилактика".</div>
              <div style={{display:'flex',gap:'8px',marginTop:'10px',alignItems:'center'}}>
                <button onClick={()=>setMaintenance({...maintenance,enabled:!maintenance.enabled})} style={{background:maintenance.enabled?'#2ECC71':'#FF3B30',color:'white',border:'none',padding:'10px 16px',borderRadius:'8px',fontWeight:'bold',fontSize:'12px'}}>{maintenance.enabled?'✅ Сайтът е СПРЯН - Цъкни за ПУСКАНЕ':'🔴 СПРИ САЙТА СЕГА'}</button>
                <span style={{fontSize:'11px',fontWeight:'bold',color:maintenance.enabled?'#FF3B30':'#2ECC71'}}>{maintenance.enabled?'🔴 СПРЯН':'🟢 Работи'}</span>
              </div>
              <input placeholder="Съобщение за профилактика..." value={maintenance.msg} onChange={e=>setMaintenance({...maintenance,msg:e.target.value})} style={{width:'100%',marginTop:'8px',padding:'8px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'11px'}}/>
            </div>

            <div style={{background:'white',border:'2px solid black',borderRadius:'12px',padding:'12px'}}>
              <div style={{fontWeight:'bold',fontSize:'13px'}}>⛔ БАН СИСТЕМА - {bans.length} баннати</div>
              <div style={{display:'flex',gap:'6px',marginTop:'8px'}}>
                <input placeholder="Телефон +44..." value={banPhoneInput} onChange={e=>setBanPhoneInput(e.target.value)} style={{flex:1,padding:'8px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'11px'}}/>
                <select value={banDuration} onChange={e=>setBanDuration(e.target.value)} style={{padding:'8px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'11px'}}>
                  <option value="1h">1 час</option><option value="24h">24 часа</option><option value="7d">7 дни</option><option value="forever">Завинаги</option>
                </select>
              </div>
              <input placeholder="Причина за бан..." value={banReasonInput} onChange={e=>setBanReasonInput(e.target.value)} style={{width:'100%',marginTop:'6px',padding:'8px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'11px'}}/>
              <button onClick={()=>{if(!banPhoneInput) return; handleBan(banPhoneInput, banReasonInput||'Некоректен', banDuration);}} style={{width:'100%',marginTop:'6px',background:'black',color:'white',padding:'10px',borderRadius:'8px',fontWeight:'bold',border:'none'}}>⛔ БАННИ ТОЗИ НОМЕР</button>
              <div style={{marginTop:'10px',display:'flex',flexDirection:'column',gap:'6px',maxHeight:'200px',overflowY:'auto'}}>
                {bans.map(b=><div key={b.id} style={{background:'#ffeaea',padding:'8px',borderRadius:'8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><div style={{fontWeight:'bold',fontSize:'11px'}}>{b.originalPhone} ({b.phone})</div><div style={{fontSize:'10px'}}>{b.reason} • {b.until==='forever'?'завинаги':new Date(b.until).toLocaleString()}</div></div>
                  <button onClick={()=>unban(b.id)} style={{background:'#2ECC71',border:'none',padding:'6px 10px',borderRadius:'6px',fontSize:'10px',fontWeight:'bold'}}>UNBAN</button>
                </div>)}
                {bans.length===0 && <div style={{fontSize:'11px',color:'#666',textAlign:'center'}}>Няма баннати</div>}
              </div>
            </div>

            <div style={{background:'white',border:'2px solid #FFD60A',borderRadius:'12px',padding:'12px'}}>
              <div style={{fontWeight:'bold',fontSize:'13px'}}>🚩 ДОКЛАДИ ОТ ПОТРЕБИТЕЛИ - {reports.length}</div>
              <div style={{marginTop:'10px',display:'flex',flexDirection:'column',gap:'8px',maxHeight:'300px',overflowY:'auto'}}>
                {reports.map(rep=><div key={rep.id} style={{background:'#fffbe6',border:'1px solid #FFD60A',padding:'10px',borderRadius:'10px'}}>
                  <div style={{fontSize:'11px',fontWeight:'bold'}}>🚩 {rep.reportedName} • {rep.reportedPhone} • {rep.from}→{rep.to}</div>
                  <div style={{fontSize:'10px',marginTop:'2px'}}>Причина: <b>{rep.reason}</b></div>
                  <div style={{fontSize:'10px',color:'#666'}}>Докладвал: {rep.reporterName} ({rep.reporterPhone}) • {new Date(rep.createdAt).toLocaleString()}</div>
                  <div style={{display:'flex',gap:'6px',marginTop:'6px'}}>
                    <button onClick={()=>{handleBan(rep.reportedPhone, `Репорт: ${rep.reason}`, '24h'); setReports(reports.filter(r=>r.id!==rep.id));}} style={{flex:1,background:'#FF3B30',color:'white',border:'none',padding:'6px',borderRadius:'6px',fontSize:'10px',fontWeight:'bold'}}>⛔ БАН 24ч</button>
                    <button onClick={()=>{handleBan(rep.reportedPhone, `Репорт: ${rep.reason}`, 'forever'); setReports(reports.filter(r=>r.id!==rep.id));}} style={{flex:1,background:'black',color:'white',border:'none',padding:'6px',borderRadius:'6px',fontSize:'10px',fontWeight:'bold'}}>⛔ БАН завинаги</button>
                    <button onClick={()=>setReports(reports.filter(r=>r.id!==rep.id))} style={{padding:'6px 10px',borderRadius:'6px',border:'1px solid #ddd',background:'white',fontSize:'10px'}}>❌ Отхвърли</button>
                  </div>
                </div>)}
                {reports.length===0 && <div style={{fontSize:'11px',color:'#666',textAlign:'center'}}>Няма доклади 😇</div>}
              </div>
              {reports.length>0 && <button onClick={()=>setReports([])} style={{width:'100%',marginTop:'8px',background:'#f1f3f4',border:'none',padding:'8px',borderRadius:'8px',fontSize:'11px'}}>Изчисти всички доклади</button>}
            </div>

            <div style={{background:'white',border:'2px solid #0F4C75',borderRadius:'12px',padding:'12px'}}>
              <div style={{fontWeight:'bold',fontSize:'13px'}}>📋 ВСИЧКИ ОБЯВИ - {rides.length} общо</div>
              <div style={{marginTop:'8px',display:'flex',flexDirection:'column',gap:'6px',maxHeight:'300px',overflowY:'auto'}}>
                {rides.slice().reverse().map(r=><div key={r.id} style={{border:'1px solid #ddd',padding:'8px',borderRadius:'8px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><div style={{fontWeight:'bold',fontSize:'11px'}}>{r.from} → {r.to} • {r.driverName} • {r.driverPhone}</div><div style={{fontSize:'10px',color:'#666'}}>{r.type} • {new Date(r.createdAt).toLocaleString()}</div></div>
                  <div style={{display:'flex',gap:'4px'}}><button onClick={()=>deleteRide(r.id)} style={{background:'#FF3B30',color:'white',border:'none',padding:'6px 8px',borderRadius:'6px',fontSize:'10px'}}>🗑️</button><button onClick={()=>handleBan(r.driverPhone,'Админ бан','24h')} style={{background:'black',color:'white',border:'none',padding:'6px 8px',borderRadius:'6px',fontSize:'10px'}}>⛔</button></div>
                </div>)}
              </div>
              <button onClick={async()=>{if(confirm('СИГУРЕН ЛИ СИ? Триеш ВСИЧКИ обяви!')){await supabase.from('rides').delete().neq('id','000'); loadRides();}}} style={{width:'100%',marginTop:'8px',background:'#FF3B30',color:'white',border:'none',padding:'10px',borderRadius:'8px',fontWeight:'bold',fontSize:'12px'}}>💣 ИЗТРИЙ ВСИЧКИ ОБЯВИ</button>
            </div>
          </div>
        )}

        {tab==='offer' && (
          <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'10px'}}>
            {currentBanned && <div style={{background:'#FF3B30',color:'white',padding:'10px',borderRadius:'10px',fontWeight:'bold',fontSize:'12px'}}>⛔ БАННАТ СИ: {currentBanned.reason}</div>}
            <div style={{display:'flex',gap:'6px',background:'#f1f3f4',padding:'3px',borderRadius:'12px'}}>
              <button onClick={()=>setOfferForm({...offerForm,type:'offer'})} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'11px',background:offerForm.type==='offer'?'#0F4C75':'white',color:offerForm.type==='offer'?'white':'#666'}}>{t.imDriver}</button>
              <button onClick={()=>setOfferForm({...offerForm,type:'request'})} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',fontWeight:'bold',fontSize:'11px',background:offerForm.type==='request'?'#FFD60A':'white',color:offerForm.type==='request'?'black':'#666'}}>{t.imPassenger}</button>
            </div>
            <div style={{background:'#e8f5e9',padding:'10px',borderRadius:'10px',border:'1px solid #a5d6a7',fontSize:'11px',lineHeight:'1.4'}}><b>{t.siteFreeUse}</b> - {t.useFree} <b>{t.travelNotFree}</b> - {t.personalAgreement}</div>
            <div style={{display:'flex',gap:'6px'}}><select value={offerForm.fromCountry} onChange={e=>setOfferForm({...offerForm,fromCountry:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'2px solid #2ECC71',background:'#e6f9ed',fontWeight:'bold',fontSize:'12px'}}>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select><input placeholder={`${t.from} - London`} value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:offerForm.from?'2px solid #2ECC71':'2px solid #FF3B30'}}/></div>
            <div style={{display:'flex',gap:'6px'}}><select value={offerForm.toCountry} onChange={e=>setOfferForm({...offerForm,toCountry:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'2px solid #2ECC71',background:'#e6f9ed',fontWeight:'bold',fontSize:'12px'}}>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select><input placeholder={`${t.to} - Sofia`} value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:offerForm.to?'2px solid #2ECC71':'2px solid #FF3B30'}}/></div>
            {offerForm.type==='offer' && <><div style={{display:'flex',gap:'6px'}}><input placeholder={`${t.brand} *`} value={offerForm.carBrand} onChange={e=>setOfferForm({...offerForm,carBrand:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:offerForm.carBrand?'2px solid #2ECC71':'2px solid #FF3B30'}}/><input placeholder={`${t.color} *`} value={offerForm.carColor} onChange={e=>setOfferForm({...offerForm,carColor:e.target.value})} style={{flex:1,padding:'10px',borderRadius:'10px',border:offerForm.carColor?'2px solid #2ECC71':'2px solid #FF3B30'}}/></div><input placeholder={`${t.reg} *`} value={offerForm.carReg} onChange={e=>setOfferForm({...offerForm,carReg:e.target.value.toUpperCase()})} style={{width:'100%',padding:'10px',borderRadius:'10px',border:offerForm.carReg?'2px solid #2ECC71':'2px solid #FF3B30'}}/></>}
            <input placeholder={offerForm.type==='request'?`${t.seatsNeed} - 2`:`${t.seatsFree} - 4`} value={offerForm.seats} onChange={e=>setOfferForm({...offerForm,seats:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:offerForm.seats?'2px solid #2ECC71':'2px solid #FF3B30'}}/>
            <textarea placeholder={t.note} value={offerForm.message} onChange={e=>setOfferForm({...offerForm,message:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd',minHeight:'50px'}}/>
            {offerForm.type==='offer' && <label style={{display:'flex',gap:'8px',background:offerForm.isDriver?'#e6f9ed':'#fff8e1',padding:'10px',borderRadius:'10px',border:`2px solid ${offerForm.isDriver?'#2ECC71':'#FFD60A'}`,fontSize:'11px'}}><input type="checkbox" checked={offerForm.isDriver} onChange={e=>setOfferForm({...offerForm,isDriver:e.target.checked})}/>{t.declare}</label>}
            <button onClick={publishRide} disabled={!canPublish} style={{background:canPublish?'#2ECC71':'#ccc',padding:'14px',borderRadius:'10px',fontWeight:'bold',border:'none'}}>{canPublish? (offerForm.type==='request'?`${t.publishSeeks} ${offerForm.from}→${offerForm.to}`:`${t.publish} ${offerForm.from}→${offerForm.to}`):`${t.fillFromTo} *`}</button>
          </div>
        )}
        {tab==='my' && <div style={{padding:'10px'}}>{rides.filter(r=>r.driverId===currentUser?.id).map((r:any)=><div key={r.id} style={{border:'2px solid #0F4C75',borderRadius:'12px',padding:'12px',marginBottom:'8px'}}><b>{getFlag(r.fromCountry)} {r.from} → {getFlag(r.toCountry)} {r.to}</b> <span style={{background:r.type==='request'?'#FFD60A':'#2ECC71',padding:'2px 6px',borderRadius:'6px',fontSize:'10px'}}>{r.type==='request'?t.youSeek:t.youOffer}</span><div style={{display:'flex',gap:'6px',marginTop:'8px'}}><button onClick={()=>startEdit(r)} style={{flex:1,background:'#0F4C75',color:'white',border:'none',padding:'8px',borderRadius:'8px',fontSize:'12px'}}>{t.edit}</button><button onClick={()=>deleteRide(r.id)} style={{padding:'8px 12px',borderRadius:'8px',border:'1px solid #ddd',background:'white'}}>🗑️</button></div></div>)}</div>}
      </div>

      <div style={{flexShrink:0,minHeight:'88px',background:'white',borderTop:'1px solid #e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',gap:'8px'}}>
        <div style={{flex:1}}><div style={{fontSize:'12px',fontWeight:'800',color:'#0F4C75'}}>{t.footerTitle} {isAdmin&&'👑'}</div><div style={{fontSize:'10px',color:'#333',marginTop:'2px'}}>{t.footerSub}<br/><span style={{color:'#b45309',fontWeight:'700'}}>{t.footerWarn}</span></div></div>
        <a href="https://ko-fi.com/dropoffpay" target="_blank" style={{background:'#72A9ED',color:'white',padding:'10px 16px',borderRadius:'20px',fontWeight:'bold',textDecoration:'none',fontSize:'12px'}}>☕ Ko-fi</a>
      </div>

      {showTerms && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
          <div style={{background:'white',borderRadius:'16px',padding:'20px',maxWidth:'400px',maxHeight:'80vh',overflowY:'auto'}}>
            <div style={{fontWeight:'bold',fontSize:'16px',marginBottom:'12px'}}>{t.howItWorks}</div>
            <div style={{fontSize:'12px',lineHeight:'1.5',display:'flex',flexDirection:'column',gap:'10px'}}>
              <div><b>{t.important1}</b><br/>{t.important1b}</div>
              <div><b>{t.important2}</b><br/>{t.notFree}</div>
              {isAdmin && <div style={{background:'#FFD60A',padding:'8px',borderRadius:'8px'}}><b>👑 Админ си!</b><br/>Виждаш таб Админ с всички екстри - спри сайта, бан, репорти.</div>}
            </div>
            <button onClick={()=>setShowTerms(false)} style={{width:'100%',marginTop:'16px',background:'#0F4C75',color:'white',padding:'12px',borderRadius:'10px',border:'none',fontWeight:'bold'}}>OK</button>
          </div>
        </div>
      )}
    </main>
  );
}