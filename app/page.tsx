'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ypfbljjrpppkdxdftjcv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NZrVv1hI7aTWVdeyZT27-Q_rWp_olMG";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_PHONES=['+447935463970','07935463970','447935463970'];
const OBLASTI = ['Благоевград','Бургас','Варна','Велико Търново','Видин','Враца','Габрово','Добрич','Кърджали','Кюстендил','Ловеч','Монтана','Пазарджик','Перник','Плевен','Пловдив','Разград','Русе','Силистра','Сливен','Смолян','София-град','София-област','Стара Загора','Търговище','Хасково','Шумен','Ямбол'];

export default function Home(){
  const [users,setUsers]=useState<any[]>([]); const [currentUser,setCurrentUser]=useState<any>(null);
  const [mode,setMode]=useState<'login'|'register'|'app'>('login'); const [tab,setTab]=useState<'find'|'my'|'offer'|'admin'>('find');
  const [rides,setRides]=useState<any[]>([]); const [editingRide,setEditingRide]=useState<string|null>(null);
  const [form,setForm]=useState({firstName:'',lastName:'',phone:'',password:''});
  const [offerForm,setOfferForm]=useState({type:'offer',from:'',to:'',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:'',oblast:'',obshtina:'',grad:''});
  const [reports,setReports]=useState<any[]>([]); const [blockedPhones,setBlockedPhones]=useState<string[]>([]);
  const [filterOblast,setFilterOblast]=useState(''); const [filterObshtina,setFilterObshtina]=useState(''); const [filterGrad,setFilterGrad]=useState(''); const [filterText,setFilterText]=useState(''); const [showOnlyMyObshtina,setShowOnlyMyObshtina]=useState(false);
  const [myLocation,setMyLocation]=useState<{oblast:string,obshtina:string,grad:string}|null>(null);
  const [locLoading,setLocLoading]=useState(false);
  const isAdmin = currentUser && ADMIN_PHONES.includes(currentUser.phone.replace(/\s/g,''));
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLocation = ()=>{
    if(!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      try{
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&accept-language=bg`);
        const data = await res.json();
        const city = data.address?.town || data.address?.city || data.address?.village || data.address?.hamlet || '';
        const county = (data.address?.county || '').replace('община','').trim();
        let oblastGuess = OBLASTI.find(o=> data.display_name?.toLowerCase().includes(o.toLowerCase())) || '';
        if(!oblastGuess && data.address?.state) {
          oblastGuess = OBLASTI.find(o=> data.address.state.toLowerCase().includes(o.toLowerCase().split('-')[0])) || '';
        }
        const loc = {oblast: oblastGuess, obshtina: county, grad: city};
        setMyLocation(loc);
        if(oblastGuess) setFilterOblast(oblastGuess);
      }catch{} finally{ setLocLoading(false); }
    },()=>{ setLocLoading(false); }, {enableHighAccuracy:true, timeout:8000, maximumAge:0});
  };

  const mapFromDB = (d:any)=>({
    id: d.id, driverName: d.driver_name, driverPhone: d.driver_phone, driverId: d.driver_id,
    from: d.from_city, to: d.to_city, time: d.time, returnTime: d.return_time, date: d.date,
    seats: d.seats, message: d.message, createdAt: d.created_at, isFull:false, type: d.type,
    isDriverVerified: d.is_driver, carBrand: d.car_brand, carColor: d.car_color, carReg: d.car_reg, carInfo: d.car_info,
    oblast: d.oblast, obshtina: d.obshtina, grad: d.grad
  });

  const loadRides = async ()=>{
    const cutoff = Date.now() - 48*60*60*1000;
    const { data, error } = await supabase.from('rides').select('*').gt('created_at', cutoff).order('created_at', {ascending:true});
    if(!error && data) setRides(data.map(mapFromDB));
  };

  useEffect(()=>{
    const u=localStorage.getItem('vozime_users'); const cu=localStorage.getItem('vozime_current'); const rp=localStorage.getItem('vozime_reports'); const bp=localStorage.getItem('vozime_blocked');
    if(u) setUsers(JSON.parse(u)); if(cu){ setCurrentUser(JSON.parse(cu)); setMode('app'); }
    if(rp) setReports(JSON.parse(rp)); if(bp) setBlockedPhones(JSON.parse(bp));
    loadRides();
    fetchLocation();
    const onVis = ()=>{ if(document.visibilityState==='visible'){ fetchLocation(); loadRides(); } };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('focus', ()=>{ fetchLocation(); loadRides(); });
    return ()=>{ document.removeEventListener('visibilitychange', onVis); window.removeEventListener('focus', fetchLocation); };
  },[]);

  useEffect(()=>{ if(scrollRef.current){ setTimeout(()=>{ scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight; }, 50); } },[tab, rides.length, filterOblast, filterObshtina, filterGrad]);

  const saveUsers=(nu:any[])=>{setUsers(nu);localStorage.setItem('vozime_users', JSON.stringify(nu));};
  const handleRegister=()=>{ const nu={id:Date.now().toString(),...form};saveUsers([...users,nu]);localStorage.setItem('vozime_current', JSON.stringify(nu));setCurrentUser(nu);setMode('app'); };
  const handleLogin=()=>{ const f=users.find(u=>u.phone===form.phone&&u.password===form.password); if(!f){alert('Грешен');return;} localStorage.setItem('vozime_current', JSON.stringify(f));setCurrentUser(f);setMode('app'); };
  const logout=()=>{localStorage.removeItem('vozime_current');setCurrentUser(null);setMode('login');};

  const carFilled = offerForm.carBrand.trim() && offerForm.carColor.trim() && offerForm.carReg.trim();
  const seatsFilled = offerForm.seats.trim() && parseInt(offerForm.seats)>0;
  const locationFilled = offerForm.oblast.trim() && offerForm.obshtina.trim() && offerForm.grad.trim();
  const canPublish = offerForm.from.trim() && offerForm.to.trim() && seatsFilled && locationFilled && (offerForm.type==='request' || (carFilled && offerForm.isDriver));

  const publishRide= async ()=>{
    if(!canPublish){alert('Попълни Област/Община/Град, От, До, кола и места + декларация!');return;}
    const now = Date.now(); 
    const id = editingRide||now.toString();
    const existingCreated = editingRide ? (rides.find(r=>r.id===editingRide)?.createdAt || now) : now;
    const row = {
      id,
      driver_name: `${currentUser.firstName} ${currentUser.lastName}`,
      driver_phone: currentUser.phone,
      driver_id: currentUser.id,
      from_city: offerForm.from,
      to_city: offerForm.to,
      time: offerForm.time,
      return_time: offerForm.returnTime,
      date: offerForm.date,
      seats: parseInt(offerForm.seats)||1,
      message: offerForm.message,
      created_at: existingCreated,
      type: offerForm.type,
      is_driver: offerForm.isDriver,
      car_brand: offerForm.carBrand,
      car_color: offerForm.carColor,
      car_reg: offerForm.carReg.toUpperCase(),
      car_info: `${offerForm.carBrand} ${offerForm.carColor} ${offerForm.carReg.toUpperCase()}`,
      oblast: offerForm.oblast,
      obshtina: offerForm.obshtina,
      grad: offerForm.grad
    };
    if(editingRide){
      await supabase.from('rides').update(row).eq('id', editingRide);
    } else {
      await supabase.from('rides').insert(row);
    }
    setEditingRide(null);
    setOfferForm({type:'offer',from:'',to:'',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:'',oblast:offerForm.oblast,obshtina:'',grad:''});
    await loadRides();
    setTab('my');
  };

  const startEdit=(ride:any)=>{ setOfferForm({type:ride.type,from:ride.from,to:ride.to,time:ride.time,returnTime:ride.returnTime,date:ride.date,seats:ride.seats.toString(),message:ride.message,isDriver:ride.isDriverVerified,carBrand:ride.carBrand,carColor:ride.carColor,carReg:ride.carReg,oblast:ride.oblast||'',obshtina:ride.obshtina||'',grad:ride.grad||''}); setEditingRide(ride.id); setTab('offer'); };
  const deleteRide = async (id:string)=>{
    await supabase.from('rides').delete().eq('id', id);
    await loadRides();
  }

  const appStyle:React.CSSProperties={height:'100dvh',width:'100%',maxWidth:'480px',margin:'0 auto',background:'white',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative',fontFamily:'-apple-system, sans-serif'};
  const contentStyle:React.CSSProperties={flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch' as any, overscrollBehavior:'contain' as any};
  const headerStyle:React.CSSProperties={height:'60px',minHeight:'60px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 12px',gap:'8px',flexShrink:0,zIndex:20};
  const footerStyle:React.CSSProperties={minHeight:'78px',flexShrink:0,background:'white',borderTop:'1px solid #e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px',boxShadow:'0 -4px 20px rgba(0,0,0,0.06)',zIndex:20};
  const inputStyle=(filled:boolean):React.CSSProperties=>({flex:1,padding:'12px',borderRadius:'12px',fontSize:'16px',border:filled?'2px solid #2ECC71':'2px solid #FF3B30',background:filled?'#e6f9ed':'#fff5f5',outline:'none'});

  const Footer=()=>(
    <div style={footerStyle}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:'14px',fontWeight:'800',color:'#0F4C75'}}>❤️ Платформата е безплатна</div>
        <div style={{fontSize:'11px',color:'#842029',fontWeight:'700',marginTop:'2px'}}>Пътуването НЕ е безплатно • Споделен разход • DropOffPay Network</div>
      </div>
      <a href="https://ko-fi.com/dropoffpay" target="_blank" rel="noopener noreferrer" style={{background:'#FF5E5B',color:'white',padding:'12px 20px',borderRadius:'24px',fontWeight:'bold',textDecoration:'none',fontSize:'14px',whiteSpace:'nowrap'}}>☕ Ko-fi</a>
    </div>
  );

  if(mode!=='app'){
    return (<main style={appStyle}><div style={{background:'#0F4C75',color:'white',padding:'6px',textAlign:'center',fontSize:'11px',flexShrink:0}}>VoziMe.bg е част от <span style={{background:'#FFD60A',color:'black',padding:'2px 8px',borderRadius:'10px',fontWeight:'bold'}}>dropoffpay.co.uk</span></div><div style={{...contentStyle,padding:'20px'}}><div style={{display:'flex',gap:'8px',background:'#f1f3f4',padding:'4px',borderRadius:'12px',height:'48px'}}><button onClick={()=>setMode('login')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:mode==='login'?'white':'transparent'}}>Вход</button><button onClick={()=>setMode('register')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:mode==='register'?'white':'transparent'}}>Регистрация</button></div><div style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'20px'}}><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{padding:'12px',borderRadius:'12px',border:'1px solid #ddd'}}/><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{padding:'12px',borderRadius:'12px',border:'1px solid #ddd'}}/><button onClick={handleLogin} style={{background:'#2ECC71',color:'#0F4C75',padding:'14px',borderRadius:'12px',fontWeight:'bold',border:'none'}}>Вход</button></div></div><Footer/></main>)
  }

  const visibleRidesBase = rides.filter(r=>!blockedPhones.includes(r.driverPhone));
  const visibleRides = visibleRidesBase.filter(r=>{
    if(filterText &&!(r.from.toLowerCase().includes(filterText.toLowerCase()) || r.to.toLowerCase().includes(filterText.toLowerCase()) || r.grad?.toLowerCase().includes(filterText.toLowerCase()) || r.message?.toLowerCase().includes(filterText.toLowerCase()))) return false;
    if(filterOblast && r.oblast!==filterOblast) return false;
    if(filterObshtina && r.obshtina?.toLowerCase()!==filterObshtina.toLowerCase()) return false;
    if(filterGrad && r.grad?.toLowerCase()!==filterGrad.toLowerCase()) return false;
    if(showOnlyMyObshtina && myLocation){
      if(myLocation.oblast && r.oblast!==myLocation.oblast) return false;
      if(myLocation.obshtina && r.obshtina?.toLowerCase()!==myLocation.obshtina.toLowerCase()) return false;
    }
    return true;
  }).sort((a,b)=>a.createdAt - b.createdAt);
  const myRides = rides.filter(r=>r.driverId===currentUser?.id).sort((a,b)=>a.createdAt - b.createdAt);

  return (
    <main style={appStyle}>
      <div style={{background:'#0F4C75',color:'white',padding:'6px',textAlign:'center',fontSize:'11px',flexShrink:0}}>VoziMe.bg е част от <span style={{background:'#FFD60A',color:'black',padding:'2px 8px',borderRadius:'10px',fontWeight:'bold'}}>dropoffpay.co.uk</span></div>
      <header style={headerStyle}>
        <div style={{width:'36px',height:'36px',background:'#2ECC71',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🚗</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:'bold',fontSize:'15px',display:'flex',alignItems:'center',gap:'6px'}}>{currentUser?.firstName || 'Тихомир'} <span style={{background:'#FFD60A',color:'black',padding:'2px 8px',borderRadius:'10px',fontSize:'10px',fontWeight:'bold'}}>ADMIN</span></div>
          <div style={{fontSize:'10px',opacity:0.8}}>{myLocation? `📍 ${myLocation.grad||''} ${myLocation.obshtina||myLocation.oblast} ${locLoading?'(обновява...)' : ''}` : (currentUser?.phone || '+447935463970')}</div>
        </div>
        <button onClick={logout} style={{fontSize:'12px',background:'rgba(255,255,255,0.2)',border:'none',color:'white',padding:'8px 14px',borderRadius:'20px',fontWeight:'bold'}}>Изход</button>
      </header>
      <div style={{height:'56px',display:'flex',gap:'6px',padding:'8px',background:'#f1f3f4',flexShrink:0}}>
        <button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'12px',border:'none',fontWeight:'bold',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666',fontSize:'12px'}}>Намери ({visibleRides.length})</button>
        <button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'12px',border:'none',fontWeight:'bold',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666',fontSize:'12px'}}>Моите ({myRides.length})</button>
        <button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'12px',border:'none',fontWeight:'bold',background:tab==='offer'?'#0F4C75':'white',color:tab==='offer'?'white':'#666',fontSize:'12px'}}>{editingRide?'Редактирай':'Предложи'}</button>
        {isAdmin && <button onClick={()=>setTab('admin')} style={{borderRadius:'12px',border:'none',fontWeight:'bold',background:'black',color:'white',padding:'0 14px',fontSize:'12px'}}>Админ</button>}
      </div>

      <div ref={scrollRef} style={contentStyle}>
        {tab==='find' && <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px', paddingBottom:'100px'}}>
          <div style={{background:'#f8f9fa',padding:'12px',borderRadius:'16px',border:'1px solid #eee',display:'flex',flexDirection:'column',gap:'8px'}}>
            <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
              <select value={filterOblast} onChange={e=>setFilterOblast(e.target.value)} style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid #ddd',fontSize:'13px'}}>
                <option value=''>Всички области</option>{OBLASTI.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
              <button onClick={()=>{fetchLocation(); loadRides();}} style={{padding:'10px 12px',borderRadius:'10px',border:'none',fontWeight:'bold',fontSize:'11px',background:'#2ECC71',color:'#0F4C75'}}>📍 {locLoading? '...' : 'Обнови'}</button>
              <button onClick={()=>{setShowOnlyMyObshtina(!showOnlyMyObshtina)}} style={{padding:'10px 12px',borderRadius:'10px',border:'none',fontWeight:'bold',fontSize:'11px',background:showOnlyMyObshtina?'#0F4C75':'white',color:showOnlyMyObshtina?'white':'#666'}}>📍 {myLocation? `${myLocation.obshtina||myLocation.oblast}` : 'Моята'}</button>
            </div>
            <div style={{display:'flex',gap:'6px'}}>
              <input placeholder="Община - напр. Поморие" value={filterObshtina} onChange={e=>setFilterObshtina(e.target.value)} style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid #ddd',fontSize:'13px'}}/>
              <input placeholder="Град/Село - напр. Ахелой" value={filterGrad} onChange={e=>setFilterGrad(e.target.value)} style={{flex:1,padding:'10px',borderRadius:'10px',border:'1px solid #ddd',fontSize:'13px'}}/>
            </div>
            <input placeholder="🔍 Търси От, До, град, съобщение..." value={filterText} onChange={e=>setFilterText(e.target.value)} style={{padding:'10px',borderRadius:'10px',border:'1px solid #ddd',fontSize:'13px'}}/>
            {(filterOblast||filterObshtina||filterGrad||filterText||showOnlyMyObshtina) && <button onClick={()=>{setFilterOblast('');setFilterObshtina('');setFilterGrad('');setFilterText('');setShowOnlyMyObshtina(false);}} style={{padding:'6px',borderRadius:'8px',border:'1px solid #ddd',fontSize:'11px',background:'white'}}>❌ Изчисти филтрите</button>}
            <div style={{fontSize:'10px',color:'#666'}}>Текуща локация: {myLocation? `${myLocation.grad||''} ${myLocation.obshtina} ${myLocation.oblast}` : 'непозната'} • Показва {visibleRides.length} от {visibleRidesBase.length} • Supabase LIVE</div>
          </div>
          {visibleRides.map((r:any)=><div key={r.id} style={{border:'1px solid #eee',borderRadius:'16px',padding:'14px',background:'white'}}><div style={{display:'flex',justifyContent:'space-between'}}><b>{r.from} → {r.to}</b><span style={{background:'#FF3B30',color:'white',fontSize:'10px',padding:'3px 8px',borderRadius:'8px'}}>НЕ Е БЕЗПЛАТНО</span></div><div style={{fontSize:'11px',color:'#0F4C75',fontWeight:'bold',marginTop:'4px'}}>📍 {r.oblast} • {r.obshtina} • {r.grad}</div><div style={{fontSize:'12px',color:'#666',marginTop:'4px'}}>🕒 Тръгване: {r.time} • Очакв.: {r.returnTime} • {r.date}</div><div style={{fontSize:'12px',marginTop:'4px'}}>🚗 {r.carInfo} • 👥 {r.seats} места</div><div style={{fontSize:'13px',marginTop:'8px'}}>👤 {r.driverName} ✓ ШОФЬОР</div></div>)}
        </div>}

        {tab==='my' && <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px', paddingBottom:'100px'}}>{myRides.map((r:any)=>(
          <div key={r.id} style={{border:'2px solid #0F4C75',borderRadius:'16px',padding:'14px',background:'#f8f9fa'}}>
            <div style={{fontWeight:'bold'}}>{r.from} → {r.to} • {r.carInfo}</div>
            <div style={{fontSize:'11px',color:'#0F4C75',fontWeight:'bold'}}>📍 {r.oblast} • {r.obshtina} • {r.grad}</div>
            <div style={{fontSize:'12px',color:'#555',marginTop:'4px'}}>🕒 Тръгване: {r.time} • Очакв.: {r.returnTime} • {r.date} • 👥 {r.seats} места</div>
            <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
              <button onClick={()=>startEdit(r)} style={{flex:1,background:'#0F4C75',color:'white',border:'none',padding:'10px',borderRadius:'10px',fontWeight:'bold'}}>✏️ Редактирай</button>
              <button onClick={()=>deleteRide(r.id)} style={{background:'#fff',border:'1px solid #ddd',padding:'10px 14px',borderRadius:'10px'}}>🗑️</button>
            </div>
          </div>
        ))}</div>}

        {tab==='offer' && (
          <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'12px', paddingBottom:'100px'}}>
            <div style={{display:'flex',gap:'8px',background:'#f1f3f4',padding:'4px',borderRadius:'14px'}}>
              <button onClick={()=>setOfferForm({...offerForm,type:'offer'})} style={{flex:1,padding:'12px',borderRadius:'10px',border:'none',fontWeight:'bold',background:offerForm.type==='offer'?'#0F4C75':'white',color:offerForm.type==='offer'?'white':'#666'}}>🚗 Предлагам</button>
              <button onClick={()=>setOfferForm({...offerForm,type:'request'})} style={{flex:1,padding:'12px',borderRadius:'10px',border:'none',fontWeight:'bold',background:offerForm.type==='request'?'#0F4C75':'white',color:offerForm.type==='request'?'white':'#666'}}>🙋 Търся</button>
            </div>
            <div style={{background:'#e3f2fd',padding:'12px',borderRadius:'12px',border:'2px solid #0F4C75',display:'flex',flexDirection:'column',gap:'8px'}}>
              <div style={{fontSize:'12px',fontWeight:'bold',color:'#0F4C75'}}>📍 КЪДЕ Е ПЪТУВАНЕТО? * {myLocation? `(Ти си в ${myLocation.grad||myLocation.obshtina})` : ''}</div>
              <select value={offerForm.oblast} onChange={e=>setOfferForm({...offerForm,oblast:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'12px',fontSize:'16px',border:offerForm.oblast?'2px solid #2ECC71':'2px solid #FF3B30',background:offerForm.oblast?'#e6f9ed':'#fff5f5'}}>
                <option value=''>Избери Област *</option>{OBLASTI.map(o=><option key={o} value={o}>{o}</option>)}
              </select>
              <div style={{display:'flex',gap:'8px'}}>
                <input placeholder="Община * - напр. Поморие" value={offerForm.obshtina} onChange={e=>setOfferForm({...offerForm,obshtina:e.target.value})} style={inputStyle(!!offerForm.obshtina.trim())}/>
                <input placeholder="Град/Село * - напр. Ахелой" value={offerForm.grad} onChange={e=>setOfferForm({...offerForm,grad:e.target.value})} style={inputStyle(!!offerForm.grad.trim())}/>
              </div>
              <button onClick={()=>{ if(myLocation){ setOfferForm({...offerForm, oblast: myLocation.oblast || offerForm.oblast, obshtina: myLocation.obshtina || offerForm.obshtina, grad: myLocation.grad || offerForm.grad}); } else { fetchLocation(); } }} style={{padding:'8px',borderRadius:'8px',border:'1px solid #0F4C75',background:'white',fontSize:'12px',fontWeight:'bold'}}>📍 Попълни от текущата ми локация</button>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <input placeholder="От" value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} style={inputStyle(!!offerForm.from)}/>
              <input placeholder="До" value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} style={inputStyle(!!offerForm.to)}/>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <select value={offerForm.date} onChange={e=>setOfferForm({...offerForm,date:e.target.value})} style={{flex:1,padding:'12px',borderRadius:'12px',border:'1px solid #ddd'}}>
                <option>Днес</option><option>Утре</option>
              </select>
              <input type="time" value={offerForm.time} onChange={e=>setOfferForm({...offerForm,time:e.target.value})} style={{flex:1,padding:'12px',borderRadius:'12px',border:'2px solid #2ECC71',background:'#e6f9ed'}}/>
              <input type="time" value={offerForm.returnTime} onChange={e=>setOfferForm({...offerForm,returnTime:e.target.value})} style={{flex:1,padding:'12px',borderRadius:'12px',border:'2px solid #2ECC71',background:'#e6f9ed'}}/>
            </div>
            <div style={{fontSize:'10px',color:'#666',display:'flex',gap:'8px',marginTop:'-8px'}}><span style={{flex:1,textAlign:'center'}}>Дата</span><span style={{flex:1,textAlign:'center'}}>Час тръгване</span><span style={{flex:1,textAlign:'center'}}>Очакв. пристигане</span></div>
            <div style={{display:'flex',gap:'8px'}}>
              <input placeholder="Марка *" value={offerForm.carBrand} onChange={e=>setOfferForm({...offerForm,carBrand:e.target.value})} style={inputStyle(!!offerForm.carBrand.trim())}/>
              <input placeholder="Цвят *" value={offerForm.carColor} onChange={e=>setOfferForm({...offerForm,carColor:e.target.value})} style={inputStyle(!!offerForm.carColor.trim())}/>
            </div>
            <input placeholder="Рег. номер *" value={offerForm.carReg} onChange={e=>setOfferForm({...offerForm,carReg:e.target.value.toUpperCase()})} style={inputStyle(!!offerForm.carReg.trim())}/>
            <div>
              <input placeholder="Свободни места * - напр. 4" value={offerForm.seats} onChange={e=>setOfferForm({...offerForm,seats:e.target.value})} style={{width:'100%',padding:'12px',borderRadius:'12px',fontSize:'16px',border:seatsFilled?'2px solid #2ECC71':'2px solid #FF3B30',background:seatsFilled?'#e6f9ed':'#fff5f5',outline:'none'}}/>
              <div style={{fontSize:'10px',color:'#666',marginTop:'4px',marginLeft:'4px'}}>Свободни места - колко пътници взимаш? Брой места в колата</div>
            </div>
            <textarea placeholder="Къде точно минаваш? През кои градове?" value={offerForm.message} onChange={e=>setOfferForm({...offerForm,message:e.target.value})} style={{padding:'12px',borderRadius:'12px',border:'1px solid #ddd',minHeight:'70px',fontSize:'16px'}}/>
            {offerForm.type==='offer' && (
              <label style={{display:'flex',gap:'10px',background:offerForm.isDriver?'#e6f9ed':'#fff8e1',padding:'12px',borderRadius:'12px',border:`2px solid ${offerForm.isDriver?'#2ECC71':'#FFD60A'}`}}>
                <input type="checkbox" checked={offerForm.isDriver} onChange={e=>setOfferForm({...offerForm,isDriver:e.target.checked})} style={{width:'20px',height:'20px'}}/>
                <span style={{fontSize:'12px'}}>ДЕКЛАРИРАМ: Аз съм шофьор с валидна книжка и кола.</span>
              </label>
            )}
            <button onClick={publishRide} disabled={!canPublish} style={{background:canPublish?'#2ECC71':'#ccc',color:canPublish?'#0F4C75':'#888',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',fontSize:'16px'}}>
              {editingRide? '💾 Запази промените' : (canPublish? 'Публикувай 🚗 LIVE' : 'Попълни Област/Община/Град, От, До, кола *')}
            </button>
          </div>
        )}
        {tab==='admin' && isAdmin && <div style={{padding:'12px', paddingBottom:'100px'}}>Админ - {reports.length} сигнала<br/>Общо обяви: {rides.length} • Текуща локация: {myLocation? `${myLocation.grad} ${myLocation.obshtina} ${myLocation.oblast}` : 'непозната'} • Supabase: ypfbljjrpppkdxdftjcv</div>}
      </div>
      <Footer/>
    </main>
  );
}