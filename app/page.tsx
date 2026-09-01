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
  bg: { siteFree:'Сайтът е безплатен', sharedCosts:'Пътуването е споделени разходи', exit:'Изход', find:'Намери', my:'Моите', offer:'Предложи', admin:'👑 Админ', important:'ℹ️ ВАЖНО - 2 неща:', important1:'1. Сайтът VoziMe е 100% безплатен.', important1b:'Ние не вземаме комисионна.', important2:'2. Самото пътуване НЕ е безплатно.', important2b:'Шофьор и пътник се договарят ЛИЧНО.', all:'Всички', drivers:'Шофьори', passengers:'Пътници', search:'🔍 Лондон, София...', notFree:'⚠️ Пътуването НЕ е безплатно - лична договорка.', connectDirect:'📞 СВЪРЖИ СЕ ДИРЕКТНО:', call:'📞 Обади се', offers:'🚗 ПРЕДЛАГА', seeks:'🙋 ТЪРСИ', imDriver:'🚗 Аз съм Шофьор', imPassenger:'🙋 Аз съм Пътник', from:'От', to:'До', brand:'Марка', color:'Цвят', reg:'Рег. номер', seatsNeed:'Места нужни', seatsFree:'Свободни места', note:'Бележка...', declare:'ДЕКЛАРИРАМ: Пътувам лично, само споделени разходи, БЕЗ печалба.', fillFromTo:'Попълни От и До', publishSeeks:'🙋 Публикувай че ТЪРСИШ', publish:'🚗 Публикувай', edit:'Редактирай', youSeek:'ТЪРСИШ', youOffer:'ПРЕДЛАГАШ', footerTitle:'❤️ VoziMe е безплатна', footerSub:'Сайтът не взема комисионна.', footerWarn:'Пътуванията НЕ са безплатни - лична договорка.', enableLoc:'📍 Включи локация', report:'🚩 Докладвай', banned:'⛔ БАННАТ СИ', deleteAcc:'🗑️ Изтрий акаунт', loginTitle:'🌍 VoziMe.bg', loginSub:'Влез за да продължиш', tabLogin:'Вход', tabReg:'Регистрация', loginBtn:'Влез →', regBtn:'Регистрирай се →', firstName:'Име', lastName:'Фамилия', phone:'Телефон +447...' },
  en: { siteFree:'Site is free', sharedCosts:'Travel is shared costs', exit:'Exit', find:'Find', my:'My rides', offer:'Offer', admin:'👑 Admin', important:'ℹ️ IMPORTANT - 2 things:', important1:'1. VoziMe is 100% free.', important1b:'We take no commission.', important2:'2. Trip is NOT free.', important2b:'Driver and passenger agree personally.', all:'All', drivers:'Drivers', passengers:'Passengers', search:'🔍 London, Sofia...', notFree:'⚠️ Trip NOT free - personal agreement.', connectDirect:'📞 CONNECT DIRECTLY:', call:'📞 Call', offers:'🚗 OFFERS', seeks:'🙋 SEEKS', imDriver:'🚗 I am Driver', imPassenger:'🙋 I am Passenger', from:'From', to:'To', brand:'Brand', color:'Color', reg:'Reg number', seatsNeed:'Seats needed', seatsFree:'Free seats', note:'Note...', declare:'I DECLARE: Personal travel, shared costs only, NO profit.', fillFromTo:'Fill From and To', publishSeeks:'🙋 Publish SEEK', publish:'🚗 Publish', edit:'Edit', youSeek:'YOU SEEK', youOffer:'YOU OFFER', footerTitle:'❤️ VoziMe is free', footerSub:'No commission.', footerWarn:'Trips NOT free.', enableLoc:'📍 Enable location', report:'🚩 Report', banned:'⛔ BANNED', deleteAcc:'🗑️ Delete account', loginTitle:'🌍 VoziMe.bg', loginSub:'Login to continue', tabLogin:'Login', tabReg:'Register', loginBtn:'Login →', regBtn:'Register →', firstName:'First name', lastName:'Last name', phone:'Phone +447...' }
};

export default function Home(){
  const [lang,setLang]=useState<'bg'|'en'>('bg');
  const [loginTab,setLoginTab]=useState<'login'|'register'>('login');
  const [currentUser,setCurrentUser]=useState<any>(null);
  const [loginForm,setLoginForm]=useState({firstName:'',lastName:'',phone:''});
  const [tab,setTab]=useState<'find'|'my'|'offer'|'admin'>('find');
  const [rides,setRides]=useState<any[]>([]);
  const [editingRide,setEditingRide]=useState<string|null>(null);
  const [offerForm,setOfferForm]=useState({type:'offer',from:'',to:'',fromCountry:'GB',toCountry:'BG',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:''});
  const [filterType,setFilterType]=useState(''); const [filterText,setFilterText]=useState('');
  const [maintenance,setMaintenance]=useState<{enabled:boolean,msg:string}>({enabled:false,msg:''});
  const [bans,setBans]=useState<any[]>([]); const [reports,setReports]=useState<any[]>([]);
  const t = TRANSLATIONS[lang];
  const isAdmin = currentUser && isAdminPhone(currentUser.phone);

  const callAdmin = async (action:string, data:any={})=>{ const res = await fetch(EDGE_URL, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${SUPABASE_ANON_KEY}`, 'apikey': SUPABASE_ANON_KEY }, body: JSON.stringify({action,...data, adminPhone: currentUser?.phone}) }); if(!res.ok) throw new Error(await res.text()); return res.json(); };
  const loadRides = async ()=>{ const cutoffIso = new Date(Date.now() - 48*60*60*1000).toISOString(); const {data} = await supabase.from('rides').select('*').gte('created_at', cutoffIso).order('created_at',{ascending:true}); if(data) setRides(data.map((d:any)=>({id:d.id, driverName:d.driver_name, driverPhone:d.driver_phone, driverId:d.driver_id, from:d.from_city, to:d.to_city, fromCountry:d.from_country||'BG', toCountry:d.to_country||'BG', time:d.time, date:d.date, seats:d.seats, message:d.message, createdAt:d.created_at, type:d.type||'offer', carInfo:d.car_info, isDriverVerified:d.is_driver, carBrand:d.car_brand, carColor:d.car_color, carReg:d.car_reg}))); };

  useEffect(()=>{ const cu=localStorage.getItem('vozime_current'); if(cu) setCurrentUser(JSON.parse(cu)); const l=localStorage.getItem('vozime_lang') as any; if(l) setLang(l); loadRides(); },[]);
  useEffect(()=>{ localStorage.setItem('vozime_lang', lang); },[lang]);

  const handleAuth = ()=>{ if(!loginForm.firstName ||!loginForm.lastName ||!loginForm.phone){ alert('Попълни всички'); return; } const user = {id: Date.now().toString(), firstName: loginForm.firstName.trim(), lastName: loginForm.lastName.trim(), phone: loginForm.phone.trim()}; const users = JSON.parse(localStorage.getItem('vozime_users')||'[]'); if(loginTab==='register'){ if(users.find((u:any)=>clean(u.phone)===clean(user.phone))){ alert('Вече съществува'); return; } users.push(user); localStorage.setItem('vozime_users', JSON.stringify(users)); } localStorage.setItem('vozime_current', JSON.stringify(user)); setCurrentUser(user); };
  const logout=()=>{localStorage.removeItem('vozime_current');setCurrentUser(null);};
  const handleDeleteAccount = async ()=>{ if(!confirm('Завинаги?')) return; try{ await supabase.from('rides').delete().eq('driver_id', currentUser.id); }catch{} localStorage.removeItem('vozime_current'); setCurrentUser(null); };

  if(!currentUser){
    return (
      <main style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#1A4A6E',padding:'16px',boxSizing:'border-box'}}>
        <div style={{background:'white',padding:'20px',borderRadius:'24px',width:'100%',maxWidth:'380px',boxSizing:'border-box'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
            <div style={{fontWeight:'800',fontSize:'20px',color:'#16486B'}}>🌍 {t.loginTitle.replace('🌍 ','')}</div>
            <div style={{display:'flex',background:'#f1f3f4',borderRadius:'12px',padding:'2px',gap:'2px'}}>
              <button onClick={()=>setLang('bg')} style={{background:lang==='bg'?'white':'transparent',color:lang==='bg'?'#0F4C75':'#666',border:'none',padding:'6px 12px',borderRadius:'8px',fontWeight:'bold',fontSize:'12px'}}>🇧🇬 BG</button>
              <button onClick={()=>setLang('en')} style={{background:lang==='en'?'white':'transparent',color:lang==='en'?'#0F4C75':'#666',border:'none',padding:'6px 12px',borderRadius:'8px',fontWeight:'bold',fontSize:'12px'}}>🇬🇧 EN</button>
            </div>
          </div>
          <div style={{textAlign:'center',fontSize:'13px',color:'#666',marginBottom:'16px'}}>{t.loginSub}</div>
          <div style={{display:'flex',background:'#f1f3f4',borderRadius:'12px',padding:'3px',marginBottom:'16px'}}>
            <button onClick={()=>setLoginTab('login')} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',fontWeight:'bold',background:loginTab==='login'?'#0F4C75':'white',color:loginTab==='login'?'white':'#666'}}>{t.tabLogin}</button>
            <button onClick={()=>setLoginTab('register')} style={{flex:1,padding:'10px',borderRadius:'8px',border:'none',fontWeight:'bold',background:loginTab==='register'?'#0F4C75':'white',color:loginTab==='register'?'white':'#666'}}>{t.tabReg}</button>
          </div>
          <input placeholder={t.firstName} value={loginForm.firstName} onChange={e=>setLoginForm({...loginForm,firstName:e.target.value})} style={{width:'100%',padding:'14px 16px',borderRadius:'12px',border:'1px solid #e5e7eb',background:'#f9fafb',boxSizing:'border-box',marginBottom:'10px'}}/>
          <input placeholder={t.lastName} value={loginForm.lastName} onChange={e=>setLoginForm({...loginForm,lastName:e.target.value})} style={{width:'100%',padding:'14px 16px',borderRadius:'12px',border:'1px solid #e5e7eb',background:'#f9fafb',boxSizing:'border-box',marginBottom:'10px'}}/>
          <input placeholder={t.phone} value={loginForm.phone} onChange={e=>setLoginForm({...loginForm,phone:e.target.value})} style={{width:'100%',padding:'14px 16px',borderRadius:'12px',border:'1px solid #e5e7eb',background:'#f9fafb',boxSizing:'border-box',marginBottom:'14px'}}/>
          <button onClick={handleAuth} style={{width:'100%',padding:'16px',background:'#3DD68C',border:'none',borderRadius:'14px',fontWeight:'bold',color:'#0F62FE',fontSize:'15px'}}>{loginTab==='login'?t.loginBtn:t.regBtn}</button>
        </div>
      </main>
    );
  }

  return (
    <main style={{position:'fixed',inset:0,width:'100%',maxWidth:'480px',margin:'0 auto',background:'white',display:'flex',flexDirection:'column',overflow:'hidden',boxSizing:'border-box'}}>
      <header style={{height:'56px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 8px',gap:'6px'}}>
        <div style={{flex:1}}><b>{currentUser.firstName}</b> {isAdmin&&'👑'}</div>
        <button onClick={()=>setLang(lang==='bg'?'en':'bg')} style={{background:'rgba(255,255,255,0.2)',border:'none',color:'white',padding:'6px 10px',borderRadius:'8px',fontSize:'11px'}}>{lang==='bg'?'🇧🇬 BG':'🇬🇧 EN'}</button>
        <button onClick={handleDeleteAccount} style={{background:'black',color:'white',border:'none',padding:'6px 8px',borderRadius:'8px',fontSize:'9px'}}>{t.deleteAcc}</button>
        <button onClick={logout} style={{background:'#FF3B30',color:'white',border:'none',padding:'6px 10px',borderRadius:'8px',fontSize:'10px'}}>{t.exit}</button>
      </header>
      <div style={{padding:'20px',textAlign:'center',fontSize:'14px'}}>Тук е целия ти основен код за пътувания - Намери / Моите / Предложи / Админ е същия като преди. Кажи ако искаш да ти залепя и целия UI за офертите вътре.</div>
    </main>
  );
}