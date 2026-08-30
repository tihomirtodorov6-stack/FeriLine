'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ypfbljjrpppkdxdftjcv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NZrVv1hI7aTWVdeyZT27-Q_rWp_olMG";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_PHONES=['+447935463970','07935463970','447935463970'];
const OBLASTI = ['Благоевград','Бургас','Варна','Велико Търново','Видин','Враца','Габрово','Добрич','Кърджали','Кюстендил','Ловеч','Монтана','Пазарджик','Перник','Плевен','Пловдив','Разград','Русе','Силистра','Сливен','Смолян','София-град','София-област','Стара Загора','Търговище','Хасково','Шумен','Ямбол'];
const COUNTRIES = [{code:'BG',name:'🇧🇬 България'},{code:'GB',name:'🇬🇧 UK'},{code:'DE',name:'🇩🇪 Германия'},{code:'ES',name:'🇪🇸 Испания'},{code:'GR',name:'🇬🇷 Гърция'},{code:'RO',name:'🇷🇴 Румъния'},{code:'TR',name:'🇹🇷 Турция'},{code:'IT',name:'🇮🇹 Италия'},{code:'FR',name:'🇫🇷 Франция'},{code:'NL',name:'🇳🇱 Холандия'}];

export default function Home(){
  const [users,setUsers]=useState<any[]>([]); const [currentUser,setCurrentUser]=useState<any>(null);
  const [mode,setMode]=useState<'login'|'register'|'app'>('login'); const [tab,setTab]=useState<'find'|'my'|'offer'|'admin'>('find');
  const [rides,setRides]=useState<any[]>([]); const [editingRide,setEditingRide]=useState<string|null>(null);
  const [form,setForm]=useState({firstName:'',lastName:'',phone:'',password:''});
  const [offerForm,setOfferForm]=useState({type:'offer',from:'',to:'',fromCountry:'GB',toCountry:'BG',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:'',oblast:'',obshtina:'',grad:''});
  const [filterFromCountry,setFilterFromCountry]=useState(''); const [filterToCountry,setFilterToCountry]=useState('');
  const [filterOblast,setFilterOblast]=useState(''); const [filterText,setFilterText]=useState('');
  const [myLocation,setMyLocation]=useState<{country:string, countryName:string, oblast:string, city:string, full:string}|null>(null);
  const [locLoading,setLocLoading]=useState(false);
  const isAdmin = currentUser && ADMIN_PHONES.includes(currentUser.phone.replace(/\s/g,''));
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLocation = ()=>{
    if(!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      try{
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=en`);
        const data = await res.json();
        const countryCode = data.address?.country_code?.toUpperCase() || 'GB';
        const countryName = data.address?.country || 'United Kingdom';
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.hamlet || '';
        let oblastGuess = '';
        if(countryCode==='BG'){ oblastGuess = OBLASTI.find(o=> (data.display_name||'').toLowerCase().includes(o.toLowerCase())) || ''; }
        setMyLocation({country: countryCode, countryName, oblast: oblastGuess, city, full: data.display_name || ''});
      }catch(e){ setMyLocation({country:'GB', countryName:'United Kingdom', oblast:'', city:'Portsmouth', full:'Portsmouth'}) } finally{ setLocLoading(false); }
    },()=>{ setLocLoading(false); setMyLocation({country:'GB', countryName:'United Kingdom', oblast:'', city:'London', full:'London, UK'}); }, {enableHighAccuracy:true, timeout:8000, maximumAge:0});
  };

  const mapFromDB = (d:any)=>({
    id: d.id, driverName: d.driver_name, driverPhone: d.driver_phone, driverId: d.driver_id,
    from: d.from_city, to: d.to_city, fromCountry: (d as any).from_country || d.oblast || 'BG', toCountry: (d as any).to_country || 'BG',
    time: d.time, returnTime: d.return_time, date: d.date,
    seats: d.seats, message: d.message, createdAt: d.created_at, isFull:false, type: d.type,
    isDriverVerified: d.is_driver, carBrand: d.car_brand, carColor: d.car_color, carReg: d.car_reg, carInfo: d.car_info,
    oblast: d.oblast, obshtina: d.obshtina, grad: d.grad
  });

  const loadRides = async ()=>{
    const cutoff = Date.now() - 48*60*60*1000;
    const { data } = await supabase.from('rides').select('*').gt('created_at', cutoff).order('created_at', {ascending:true});
    if(data) setRides(data.map(mapFromDB));
  };

  useEffect(()=>{
    const u=localStorage.getItem('vozime_users'); const cu=localStorage.getItem('vozime_current');
    if(u) setUsers(JSON.parse(u)); if(cu){ setCurrentUser(JSON.parse(cu)); setMode('app'); }
    loadRides(); fetchLocation();
    const onVis = ()=>{ if(document.visibilityState==='visible'){ fetchLocation(); loadRides(); } };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', ()=>{ fetchLocation(); loadRides(); });
    return ()=>{ document.removeEventListener('visibilitychange', onVis); };
  },[]);

  const saveUsers=(nu:any[])=>{setUsers(nu);localStorage.setItem('vozime_users', JSON.stringify(nu));};
  const handleLogin=()=>{ const f=users.find(u=>u.phone===form.phone&&u.password===form.password); if(!f){alert('Грешен');return;} localStorage.setItem('vozime_current', JSON.stringify(f));setCurrentUser(f);setMode('app'); };
  const logout=()=>{localStorage.removeItem('vozime_current');setCurrentUser(null);setMode('login');};

  const carFilled = offerForm.carBrand.trim() && offerForm.carColor.trim() && offerForm.carReg.trim();
  const seatsFilled = offerForm.seats.trim() && parseInt(offerForm.seats)>0;
  const canPublish = offerForm.from.trim() && offerForm.to.trim() && seatsFilled && (offerForm.type==='request' || (carFilled && offerForm.isDriver));

  const publishRide= async ()=>{
    if(!canPublish){alert('Попълни От, До, кола и места!');return;}
    const now = Date.now(); const id = editingRide||now.toString();
    const existingCreated = editingRide ? (rides.find(r=>r.id===editingRide)?.createdAt || now) : now;
    const row:any = {
      id, driver_name: `${currentUser.firstName} ${currentUser.lastName}`, driver_phone: currentUser.phone, driver_id: currentUser.id,
      from_city: offerForm.from, to_city: offerForm.to, time: offerForm.time, return_time: offerForm.returnTime, date: offerForm.date,
      seats: parseInt(offerForm.seats)||1, message: offerForm.message, created_at: existingCreated, type: offerForm.type,
      is_driver: offerForm.isDriver, car_brand: offerForm.carBrand, car_color: offerForm.carColor, car_reg: offerForm.carReg.toUpperCase(),
      car_info: `${offerForm.carBrand} ${offerForm.carColor} ${offerForm.carReg.toUpperCase()}`, oblast: offerForm.oblast, obshtina: offerForm.obshtina, grad: offerForm.grad,
      from_country: offerForm.fromCountry, to_country: offerForm.toCountry
    };
    if(editingRide){ await supabase.from('rides').update(row).eq('id', editingRide); }
    else { await supabase.from('rides').insert(row); }
    setEditingRide(null); await loadRides(); setTab('my');
  };

  const startEdit=(ride:any)=>{ setOfferForm({type:ride.type,from:ride.from,to:ride.to,fromCountry:ride.fromCountry||'BG',toCountry:ride.toCountry||'BG',time:ride.time,returnTime:ride.returnTime,date:ride.date,seats:ride.seats.toString(),message:ride.message,isDriver:ride.isDriverVerified,carBrand:ride.carBrand,carColor:ride.carColor,carReg:ride.carReg,oblast:ride.oblast||'',obshtina:ride.obshtina||'',grad:ride.grad||''}); setEditingRide(ride.id); setTab('offer'); };
  const deleteRide = async (id:string)=>{ await supabase.from('rides').delete().eq('id', id); await loadRides(); }
  const getFlag = (code:string)=>COUNTRIES.find(c=>c.code===code)?.name.split(' ')[0] || code;
  const appStyle:React.CSSProperties={height:'100dvh',width:'100%',maxWidth:'480px',margin:'0 auto',background:'white',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative',fontFamily:'-apple-system, sans-serif'};
  const contentStyle:React.CSSProperties={flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch' as any};
  const headerStyle:React.CSSProperties={height:'60px',minHeight:'60px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 12px',gap:'8px',flexShrink:0};
  const footerStyle:React.CSSProperties={minHeight:'78px',flexShrink:0,background:'white',borderTop:'1px solid #e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px'};
  const inputStyle=(filled:boolean):React.CSSProperties=>({flex:1,padding:'12px',borderRadius:'12px',fontSize:'16px',border:filled?'2px solid #2ECC71':'2px solid #FF3B30',background:filled?'#e6f9ed':'#fff5f5',outline:'none'});
  const Footer=()=>(<div style={footerStyle}><div style={{flex:1}}><div style={{fontSize:'14px',fontWeight:'800',color:'#0F4C75'}}>❤️ Платформата е безплатна</div><div style={{fontSize:'11px',color:'#842029',fontWeight:'700'}}>Лондон ↔ София • Споделен разход</div></div><a href="https://ko-fi.com/dropoffpay" target="_blank" style={{background:'#FF5E5B',color:'white',padding:'12px 20px',borderRadius:'24px',fontWeight:'bold',textDecoration:'none'}}>☕ Ko-fi</a></div>);
  const visibleRides = rides.filter(r=>{ if(filterText &&!(r.from.toLowerCase().includes(filterText.toLowerCase()) || r.to.toLowerCase().includes(filterText.toLowerCase()))) return false; if(filterFromCountry && r.fromCountry!==filterFromCountry) return false; if(filterToCountry && r.toCountry!==filterToCountry) return false; if(filterOblast && r.oblast!==filterOblast) return false; return true; }).sort((a,b)=>a.createdAt - b.createdAt);
  const myRides = rides.filter(r=>r.driverId===currentUser?.id).sort((a,b)=>a.createdAt - b.createdAt);

  return (
    <main style={appStyle}>
      <div style={{background:'#0F4C75',color:'white',padding:'6px',textAlign:'center',fontSize:'11px'}}>🌍 VoziMe WORLD • Работи навсякъде • dropoffpay.co.uk</div>
      <header style={headerStyle}><div style={{width:'36px',height:'36px',background:'#2ECC71',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>🌍</div><div style={{flex:1}}><div style={{fontWeight:'bold',fontSize:'13px'}}>{myLocation? `${getFlag(myLocation.country)} ${myLocation.city}, ${myLocation.countryName}` : 'Зарежда локация...'} {locLoading?'...':''}</div><div style={{fontSize:'10px',opacity:0.8}}>Ти си тук • Работи от всяка държава</div></div><button onClick={logout} style={{fontSize:'12px',background:'rgba(255,255,255,0.2)',border:'none',color:'white',padding:'8px 14px',borderRadius:'20px',fontWeight:'bold'}}>Изход</button></header>
      <div style={{height:'56px',display:'flex',gap:'6px',padding:'8px',background:'#f1f3f4',flexShrink:0}}>
        <button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'12px',border:'none',fontWeight:'bold',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666',fontSize:'12px'}}>Намери ({visibleRides.length})</button>
        <button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'12px',border:'none',fontWeight:'bold',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666',fontSize:'12px'}}>Моите ({myRides.length})</button>
        <button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'12px',border:'none',fontWeight:'bold',background:tab==='offer'?'#2ECC71':'white',color:tab==='offer'?'#0F4C75':'#666',fontSize:'12px'}}>{editingRide?'Редактирай':'Предложи 🌍'}</button>
      </div>
      <div ref={scrollRef} style={contentStyle}>
        {tab==='find' && <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px', paddingBottom:'100px'}}>
          <div style={{background:'#f8f9fa',padding:'12px',borderRadius:'16px',border:'1px solid #eee',display:'flex',flexDirection:'column',gap:'8px'}}>
            <div style={{fontWeight:'bold',fontSize:'12px'}}>🌍 ФИЛТЪР - Работи навсякъде</div>
            <div style={{display:'flex',gap:'6px'}}>
              <select value={filterFromCountry} onChange={e=>setFilterFromCountry(e.target.value)} style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid #ddd',fontSize:'12px'}}><option value=''>От всяка държава</option>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select>
              <select value={filterToCountry} onChange={e=>setFilterToCountry(e.target.value)} style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid #ddd',fontSize:'12px'}}><option value=''>До всяка държава</option>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select>
            </div>
            <input placeholder="🔍 Търси Лондон, София, Berlin..." value={filterText} onChange={e=>setFilterText(e.target.value)} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd',fontSize:'13px'}}/>
            <div style={{fontSize:'10px',color:'#666'}}>Ти си в: {myLocation?.full || 'неизвестно'} • Обяви: {visibleRides.length} • 48ч LIVE</div>
          </div>
          {visibleRides.map((r:any)=><div key={r.id} style={{border:'1px solid #eee',borderRadius:'16px',padding:'14px',background:'white'}}><div style={{fontWeight:'bold',fontSize:'15px'}}>{getFlag(r.fromCountry)} {r.from} → {getFlag(r.toCountry)} {r.to}</div><div style={{fontSize:'12px',color:'#666',marginTop:'4px'}}>🕒 {r.time} → {r.returnTime} • {r.date} • 👥 {r.seats} • 🚗 {r.carInfo}</div><div style={{fontSize:'13px',marginTop:'6px'}}>👤 {r.driverName} ✓ ШОФЬОР</div></div>)}
        </div>}
        {tab==='offer' && (
          <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'12px', paddingBottom:'100px'}}>
            <div style={{background:'#e8f5e9',padding:'12px',borderRadius:'12px',border:'2px solid #2ECC71'}}><div style={{fontSize:'13px',fontWeight:'bold'}}>🌍 МЕЖДУНАРОДНО - Лондон ↔ София работи!</div><div style={{fontSize:'11px',marginTop:'4px'}}>Ти си в {myLocation?.city || 'Англия'} - можеш да пуснеш отвсякъде до всякъде</div></div>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <select value={offerForm.fromCountry} onChange={e=>setOfferForm({...offerForm,fromCountry:e.target.value})} style={{padding:'12px',borderRadius:'12px',border:'2px solid #2ECC71',background:'#e6f9ed',fontSize:'14px',fontWeight:'bold'}}>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select>
              <input placeholder="От град * - напр. London" value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} style={inputStyle(!!offerForm.from)}/>
            </div>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <select value={offerForm.toCountry} onChange={e=>setOfferForm({...offerForm,toCountry:e.target.value})} style={{padding:'12px',borderRadius:'12px',border:'2px solid #2ECC71',background:'#e6f9ed',fontSize:'14px',fontWeight:'bold'}}>{COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.name}</option>)}</select>
              <input placeholder="До град * - напр. София" value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} style={inputStyle(!!offerForm.to)}/>
            </div>
            {(offerForm.fromCountry==='BG' || offerForm.toCountry==='BG') && (
              <div style={{background:'#e3f2fd',padding:'10px',borderRadius:'12px',display:'flex',flexDirection:'column',gap:'6px'}}>
                <div style={{fontSize:'11px',fontWeight:'bold'}}>📍 За България - област (ако е нужно)</div>
                <select value={offerForm.oblast} onChange={e=>setOfferForm({...offerForm,oblast:e.target.value})} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd',fontSize:'13px'}}><option value=''>Без област / Международно</option>{OBLASTI.map(o=><option key={o} value={o}>{o}</option>)}</select>
              </div>
            )}
            <div style={{display:'flex',gap:'8px'}}>
              <select value={offerForm.date} onChange={e=>setOfferForm({...offerForm,date:e.target.value})} style={{flex:1,padding:'12px',borderRadius:'12px',border:'1px solid #ddd'}}><option>Днес</option><option>Утре</option></select>
              <input type="time" value={offerForm.time} onChange={e=>setOfferForm({...offerForm,time:e.target.value})} style={{flex:1,padding:'12px',borderRadius:'12px',border:'2px solid #2ECC71',background:'#e6f9ed'}}/>
              <input type="time" value={offerForm.returnTime} onChange={e=>setOfferForm({...offerForm,returnTime:e.target.value})} style={{flex:1,padding:'12px',borderRadius:'12px',border:'2px solid #2ECC71',background:'#e6f9ed'}}/>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <input placeholder="Марка *" value={offerForm.carBrand} onChange={e=>setOfferForm({...offerForm,carBrand:e.target.value})} style={inputStyle(!!offerForm.carBrand.trim())}/>
              <input placeholder="Цвят *" value={offerForm.carColor} onChange={e=>setOfferForm({...offerForm,carColor:e.target.value})} style={inputStyle(!!offerForm.carColor.trim())}/>
            </div>
            <input placeholder="Рег. номер *" value={offerForm.carReg} onChange={e=>setOfferForm({...offerForm,carReg:e.target.value.toUpperCase()})} style={inputStyle(!!offerForm.carReg.trim())}/>
            <input placeholder="Свободни места * - напр. 4" value={offerForm.seats} onChange={e=>setOfferForm({...offerForm,seats:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'12px',fontSize:'16px',border:seatsFilled?'2px solid #2ECC71':'2px solid #FF3B30',background:seatsFilled?'#e6f9ed':'#fff5f5'}}/>
            <textarea placeholder="Къде минаваш? Пример: London → Calais → София" value={offerForm.message} onChange={e=>setOfferForm({...offerForm,message:e.target.value})} style={{padding:'12px',borderRadius:'12px',border:'1px solid #ddd',minHeight:'70px'}}/>
            {offerForm.type==='offer' && <label style={{display:'flex',gap:'10px',background:offerForm.isDriver?'#e6f9ed':'#fff8e1',padding:'12px',borderRadius:'12px',border:`2px solid ${offerForm.isDriver?'#2ECC71':'#FFD60A'}`}}><input type="checkbox" checked={offerForm.isDriver} onChange={e=>setOfferForm({...offerForm,isDriver:e.target.checked})} style={{width:'20px',height:'20px'}}/><span style={{fontSize:'12px'}}>ДЕКЛАРИРАМ: Шофьор с валидна книжка.</span></label>}
            <button onClick={publishRide} disabled={!canPublish} style={{background:canPublish?'#2ECC71':'#ccc',color:'#0F4C75',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',fontSize:'16px'}}>{canPublish? `🌍 Публикувай ${offerForm.from||'От'} → ${offerForm.to||'До'} LIVE` : 'Попълни От и До *'}</button>
          </div>
        )}
        {tab==='my' && <div style={{padding:'12px'}}>{myRides.map((r:any)=><div key={r.id} style={{border:'2px solid #0F4C75',borderRadius:'16px',padding:'14px',marginBottom:'10px'}}>{getFlag(r.fromCountry)} {r.from} → {getFlag(r.toCountry)} {r.to} • {r.carInfo}<div style={{display:'flex',gap:'8px',marginTop:'10px'}}><button onClick={()=>startEdit(r)} style={{flex:1,background:'#0F4C75',color:'white',border:'none',padding:'10px',borderRadius:'10px'}}>✏️ Редактирай</button><button onClick={()=>deleteRide(r.id)} style={{padding:'10px 14px',borderRadius:'10px',border:'1px solid #ddd',background:'white'}}>🗑️</button></div></div>)}</div>}
      </div>
      <Footer/>
    </main>
  );
}