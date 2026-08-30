'use client';
import { useState, useEffect } from 'react';
type Lang='BG'|'EN';
const ADMIN_PHONES=['+447935463970','07935463970','447935463970'];

const t={
  BG:{
    appName:'VoziMe.bg', route:'Споделено пътуване • Цяла България',
    networkBanner:'VoziMe.bg е част от', networkName:'dropoffpay.co.uk',
    login:'Вход',register:'Регистрация',logout:'Изход', find:'Намери',my:'Моите',offer:'Предложи',edit:'Редактирай', admin:'Админ',
    from:'От',to:'До',departure:'Тръгване',return:'Връщане', seats:'Места',message:'Къде точно минаваш?',date:'Кога', today:'Днес',tomorrow:'Утре',
    publish:'Публикувай',save:'Запази',cancel:'Откажи', call:'Обади се',viber:'Viber',
    noRides:'Няма пътувания - бъди първият!', noMyRides:'Нямаш обяви',
    callToArrange:'⚠️ Пътуването НЕ е безплатно - цена по договаряне',
    shared:'Част от dropoffpay.co.uk • Споделен разход', limit:'Лимит 2 обяви за 24ч',
    donateTitle:'Платформата е безплатна', donateSub:'Пътуването НЕ е безплатно • Споделен разход',
    donateButton:'☕ Подкрепи в Ko-fi', verified:'✓ VERIFIED PART OF DROPOFFPAY.CO.UK NETWORK',
    offering:'Предлагам', searching:'Търся',
    driverConfirm:'ДЕКЛАРИРАМ: Аз съм шофьор с валидна книжка и кола. При фалшива обява профилът ще бъде блокиран.',
    mustConfirm:'Попълни колата + декларация!', driverBadge:'🚗 ШОФЬОР', passengerBadge:'🙋 ПЪТНИК ТЪРСИ',
    notFreeBadge:'НЕ Е БЕЗПЛАТНО', notFreeInfo:'Пътуването е с споделен разход, не е безплатно',
    brand:'Марка *', color:'Цвят *', reg:'Рег. номер *',
  },
  EN:{
    appName:'VoziMe.bg', route:'Ride-sharing • All Bulgaria',
    networkBanner:'VoziMe.bg is part of', networkName:'dropoffpay.co.uk',
    login:'Login',register:'Register',logout:'Logout', find:'Find',my:'My Rides',offer:'Offer',edit:'Edit', admin:'Admin',
    from:'From',to:'To',departure:'Depart',return:'Return', seats:'Seats',message:'Where do you pass?',date:'When', today:'Today',tomorrow:'Tomorrow',
    publish:'Publish',save:'Save',cancel:'Cancel', call:'Call',viber:'Viber',
    noRides:'No rides - be first!', noMyRides:'No rides',
    callToArrange:'⚠️ Ride is NOT free - call for price',
    shared:'Part of dropoffpay.co.uk', limit:'Limit 2 / 24h',
    donateTitle:'Platform is free', donateSub:'Ride is NOT free • Shared cost',
    donateButton:'☕ Support on Ko-fi', verified:'✓ VERIFIED PART OF DROPOFFPAY.CO.UK NETWORK',
    offering:'Offering', searching:'Seeking',
    driverConfirm:'I DECLARE: I am driver with license and car. False ride = block.',
    mustConfirm:'Fill car + declaration!', driverBadge:'🚗 DRIVER', passengerBadge:'🙋 SEEKING',
    notFreeBadge:'NOT FREE', notFreeInfo:'Shared cost, not free',
    brand:'Brand *', color:'Color *', reg:'Reg No *',
  }
};
type User={id:string,firstName:string,lastName:string,phone:string,password:string};
type Ride={id:string,driverName:string,driverPhone:string,driverId:string,from:string,to:string,time:string,returnTime:string,date:any,seats:number,message:string,createdAt:number,isFull:boolean,requests:any[],type:'offer'|'request',isDriverVerified:boolean,carBrand:string,carColor:string,carReg:string,carInfo:string};
type Report={rideId:string, reporterId:string, reporterPhone:string, reportedPhone:string, reportedName:string, from:string, to:string, time:number};

export default function Home(){
  const [lang,setLang]=useState<Lang>('BG'); const tr=t[lang];
  const [users,setUsers]=useState<User[]>([]); const [currentUser,setCurrentUser]=useState<User|null>(null);
  const [mode,setMode]=useState<'login'|'register'|'app'>('login'); const [tab,setTab]=useState<'find'|'my'|'offer'|'admin'>('find');
  const [rides,setRides]=useState<Ride[]>([]); const [editingRide,setEditingRide]=useState<string|null>(null);
  const [form,setForm]=useState({firstName:'',lastName:'',phone:'',password:''});
  const [offerForm,setOfferForm]=useState({type:'offer' as 'offer'|'request',from:'',to:'',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:''});
  const [blockedPhones,setBlockedPhones]=useState<string[]>([]);
  const [reports,setReports]=useState<Report[]>([]);
  const isAdmin = currentUser && ADMIN_PHONES.includes(currentUser.phone.replace(/\s/g,''));

  useEffect(()=>{
    if (typeof document!== 'undefined') {
      document.body.style.margin='0'; document.body.style.padding='0'; document.body.style.overflow='hidden';
      document.documentElement.style.overflow='hidden';
    }
    const sl=localStorage.getItem('vozime_lang') as Lang; if(sl) setLang(sl);
    const u=localStorage.getItem('vozime_users'); const cu=localStorage.getItem('vozime_current'); const r=localStorage.getItem('vozime_rides_noprice'); const bp=localStorage.getItem('vozime_blocked'); const rp=localStorage.getItem('vozime_reports');
    if(u) setUsers(JSON.parse(u)); if(cu){ setCurrentUser(JSON.parse(cu)); setMode('app'); }
    if(r){ const f=JSON.parse(r).filter((x:Ride)=>Date.now()-x.createdAt<48*60*60*1000).sort((a:Ride,b:Ride)=>b.createdAt-a.createdAt); setRides(f); }
    if(bp) setBlockedPhones(JSON.parse(bp)); if(rp) setReports(JSON.parse(rp));
  },[]);

  const saveRides=(nr:Ride[])=>{const s=[...nr].sort((a,b)=>b.createdAt-a.createdAt);setRides(s);localStorage.setItem('vozime_rides_noprice', JSON.stringify(s));};
  const saveUsers=(nu:User[])=>{setUsers(nu);localStorage.setItem('vozime_users', JSON.stringify(nu));};
  const saveBlocked=(bp:string[])=>{setBlockedPhones(bp);localStorage.setItem('vozime_blocked',JSON.stringify(bp));}
  const saveReports=(nr:Report[])=>{setReports(nr);localStorage.setItem('vozime_reports',JSON.stringify(nr));}

  const handleRegister=()=>{
    if(!form.firstName||!form.lastName||!form.phone||!form.password){alert('Попълни всички');return;}
    if(blockedPhones.includes(form.phone)){alert('Телефонът е блокиран!');return;}
    if(users.find(u=>u.phone===form.phone)){alert('Телефонът съществува');return;}
    const nu={id:Date.now().toString(),...form};saveUsers([...users,nu]);localStorage.setItem('vozime_current', JSON.stringify(nu));setCurrentUser(nu);setMode('app');
  };
  const handleLogin=()=>{
    const f=users.find(u=>u.phone===form.phone&&u.password===form.password);
    if(!f){alert('Грешен телефон/парола');return;}
    if(blockedPhones.includes(f.phone)){alert('Профилът е блокиран!');return;}
    localStorage.setItem('vozime_current', JSON.stringify(f));setCurrentUser(f);setMode('app');
  };
  const logout=()=>{localStorage.removeItem('vozime_current');setCurrentUser(null);setMode('login');};

  const carFilled = offerForm.carBrand.trim() && offerForm.carColor.trim() && offerForm.carReg.trim();
  const canPublish = offerForm.type==='request' || (carFilled && offerForm.isDriver && offerForm.from && offerForm.to);

  const publishRide=()=>{
    if(!currentUser) return;
    if(!offerForm.from ||!offerForm.to){alert('Напиши От и До');return;}
    if(offerForm.type==='offer'){
      if(!carFilled){alert('Попълни Марка, Цвят и Рег. номер!');return;}
      if(!offerForm.isDriver){alert(tr.mustConfirm);return;}
    }
    const last24h = rides.filter(r=>r.driverId===currentUser.id && Date.now()-r.createdAt < 24*60*60*1000);
    if(!editingRide && last24h.length>=2){ alert(tr.limit); return; }
    const now = Date.now();
    const carInfo = offerForm.type==='offer'? `${offerForm.carBrand} ${offerForm.carColor} ${offerForm.carReg.toUpperCase()}` : '';
    const nr:Ride={ id: editingRide||now.toString(), driverName:`${currentUser.firstName} ${currentUser.lastName}`, driverPhone:currentUser.phone, driverId:currentUser.id, from:offerForm.from, to:offerForm.to, time:offerForm.time, returnTime:offerForm.returnTime, date:offerForm.date, seats:parseInt(offerForm.seats)||1, message:offerForm.message, createdAt: editingRide? rides.find(r=>r.id===editingRide)!.createdAt : now, isFull:false, requests:[], type:offerForm.type, isDriverVerified: offerForm.type==='offer'? offerForm.isDriver : false, carBrand:offerForm.carBrand, carColor:offerForm.carColor, carReg:offerForm.carReg.toUpperCase(), carInfo };
    if(editingRide){ saveRides(rides.map(r=>r.id===editingRide?nr:r)); setEditingRide(null); } else saveRides([nr,...rides]);
    setOfferForm({type:'offer',from:'',to:'',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:''}); setTab('my');
  };

  const reportRide=(ride:Ride)=>{
    if(!currentUser) return;
    if(currentUser.phone===ride.driverPhone){alert('Не можеш себе си!'); return;}
    if(reports.find(r=>r.rideId===ride.id && r.reporterId===currentUser.id)){alert('Вече си докладвал!'); return;}
    if(!confirm(`Докладваш ${ride.driverName}?`)) return;
    const newRep:Report={rideId:ride.id, reporterId:currentUser.id, reporterPhone:currentUser.phone, reportedPhone:ride.driverPhone, reportedName:ride.driverName, from:ride.from, to:ride.to, time:Date.now()};
    saveReports([...reports, newRep]); alert('✅ Сигнал записан в Админ панела.');
  };

  // ОПРАВЕН СТАБИЛЕН ЕКРАН - НЕ ПОДСКАЧА
  const appStyle:React.CSSProperties={
    fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    height:'100dvh', width:'100%', maxWidth:'480px', margin:'0 auto',
    background:'white', display:'flex', flexDirection:'column',
    overflow:'hidden', position:'relative', // не fixed!
  };
  const networkBannerStyle:React.CSSProperties={background:'#0F4C75',color:'white',padding:'6px 12px',fontSize:'11px',textAlign:'center',flexShrink:0,display:'flex',justifyContent:'center',gap:'6px'};
  const headerStyle:React.CSSProperties={height:'60px',minHeight:'60px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 12px',gap:'8px',flexShrink:0};
  const tabsStyle:React.CSSProperties={height:'56px',minHeight:'56px',display:'flex',gap:'6px',padding:'8px',background:'#f1f3f4',borderBottom:'1px solid #eee',flexShrink:0};
  const contentStyle:React.CSSProperties={flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch' as any, overscrollBehavior:'contain', touchAction:'pan-y' as any};
  const footerStyle:React.CSSProperties={minHeight:'88px',flexShrink:0,background:'white',borderTop:'1px solid #e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px',gap:'12px'};

  if(mode!=='app'){
    return (<main style={appStyle}><div style={networkBannerStyle}><span>{tr.networkBanner}</span><span style={{background:'#FFD60A',color:'black',padding:'2px 8px',borderRadius:'10px',fontWeight:'bold'}}>{tr.networkName}</span></div><div style={{...contentStyle,padding:'24px'}}><div style={{textAlign:'center'}}><h1>{tr.appName}</h1></div><div style={{display:'flex',gap:'8px',background:'#f1f3f4',padding:'4px',borderRadius:'12px',margin:'20px 0',height:'48px'}}><button onClick={()=>setMode('login')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:mode==='login'?'white':'transparent'}}>{tr.login}</button><button onClick={()=>setMode('register')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:mode==='register'?'white':'transparent'}}>{tr.register}</button></div><div style={{display:'flex',flexDirection:'column',gap:'12px'}}>{mode==='register'?<><div style={{display:'flex',gap:'8px'}}><input placeholder="Име" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'14px',borderRadius:'12px'}}/><input placeholder="Фамилия" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'14px',borderRadius:'12px'}}/></div><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px'}}/><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px'}}/><button onClick={handleRegister} style={{background:'#0F4C75',color:'white',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none'}}>{tr.register}</button></>:<><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px'}}/><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px'}}/><button onClick={handleLogin} style={{background:'#2ECC71',color:'#0F4C75',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none'}}>{tr.login}</button></>}</div></div></main>);
  }

  const visibleRides=rides.filter(r=>!r.isFull&&Date.now()-r.createdAt<48*60*60*1000&&!blockedPhones.includes(r.driverPhone)).sort((a,b)=>b.createdAt-a.createdAt);
  const myRides=rides.filter(r=>r.driverId===currentUser?.id).sort((a,b)=>b.createdAt-a.createdAt);

  const inputBase = (filled:boolean):React.CSSProperties=>({
    flex:1, padding:'12px', borderRadius:'12px', fontSize:'16px',
    border: filled? '2px solid #2ECC71' : '2px solid #FF3B30',
    background: filled? '#e6f9ed' : '#fff5f5',
    outline:'none'
  });

  return (
    <main style={appStyle}>
      <div style={networkBannerStyle}><span>{tr.networkBanner}</span><a href="https://dropoffpay.co.uk" target="_blank" style={{background:'#FFD60A',color:'black',padding:'2px 8px',borderRadius:'10px',fontWeight:'bold',textDecoration:'none'}}>{tr.networkName}</a></div>
      <header style={headerStyle}><div style={{flex:1}}><b>{currentUser?.firstName} {isAdmin && <span style={{background:'#FFD60A',color:'black',padding:'2px 6px',borderRadius:'6px',fontSize:'9px'}}>ADMIN</span>}</b></div><button onClick={logout} style={{fontSize:'11px',background:'rgba(255,255,255,0.2)',border:'none',color:'white',padding:'6px 10px',borderRadius:'20px'}}>{tr.logout}</button></header>
      <div style={tabsStyle}>
        <button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666',fontSize:'11px'}}>Намери ({visibleRides.length})</button>
        <button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666',fontSize:'11px'}}>Моите ({myRides.length})</button>
        <button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='offer'?'#0F4C75':'white',color:tab==='offer'?'white':'#666',fontSize:'11px'}}>Предложи</button>
        {isAdmin && <button onClick={()=>setTab('admin')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='admin'?'#FF3B30':'black',color:'white',fontSize:'11px'}}>Админ ({reports.length})</button>}
      </div>
      <div style={contentStyle}>
        {tab==='find' && <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>{visibleRides.map(r=><div key={r.id} style={{border:'1px solid #eee',borderRadius:'16px',padding:'14px'}}><b>{r.from}→{r.to}</b> <span style={{background:'#FF3B30',color:'white',padding:'2px 6px',borderRadius:'8px',fontSize:'10px'}}>{tr.notFreeBadge}</span><div style={{fontSize:'12px',color:'#666'}}>{r.carInfo} • {r.time}</div><div style={{display:'flex',gap:'8px',marginTop:'8px'}}><a href={`tel:${r.driverPhone}`} style={{flex:1,background:'#0F4C75',color:'white',textAlign:'center',padding:'10px',borderRadius:'10px',textDecoration:'none'}}>📞 Обади се</a><button onClick={()=>reportRide(r)} style={{border:'1px solid #ddd',padding:'10px',borderRadius:'10px',fontSize:'11px'}}>🚩</button></div></div>)}</div>}

        {tab==='offer' && (
          <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'12px'}}>
            <div style={{display:'flex',gap:'8px',background:'#f1f3f4',padding:'4px',borderRadius:'14px'}}>
              <button onClick={()=>setOfferForm({...offerForm,type:'offer'})} style={{flex:1,padding:'12px',borderRadius:'10px',border:'none',fontWeight:'bold',background:offerForm.type==='offer'?'#0F4C75':'white',color:offerForm.type==='offer'?'white':'#666'}}>🚗 Предлагам</button>
              <button onClick={()=>setOfferForm({...offerForm,type:'request'})} style={{flex:1,padding:'12px',borderRadius:'10px',border:'none',fontWeight:'bold',background:offerForm.type==='request'?'#0F4C75':'white',color:offerForm.type==='request'?'white':'#666'}}>🙋 Търся</button>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <input placeholder="От" value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} style={inputBase(!!offerForm.from)}/>
              <input placeholder="До" value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} style={inputBase(!!offerForm.to)}/>
            </div>

            {offerForm.type==='offer' && (
              <>
                <div style={{display:'flex',gap:'8px'}}>
                  <input placeholder={tr.brand} value={offerForm.carBrand} onChange={e=>setOfferForm({...offerForm,carBrand:e.target.value})} style={inputBase(!!offerForm.carBrand.trim())}/>
                  <input placeholder={tr.color} value={offerForm.carColor} onChange={e=>setOfferForm({...offerForm,carColor:e.target.value})} style={inputBase(!!offerForm.carColor.trim())}/>
                </div>
                <input placeholder={tr.reg} value={offerForm.carReg} onChange={e=>setOfferForm({...offerForm,carReg:e.target.value.toUpperCase()})} style={inputBase(!!offerForm.carReg.trim())}/>
                {carFilled && <div style={{fontSize:'12px',color:'#2ECC71',fontWeight:'bold',textAlign:'center',background:'#e6f9ed',padding:'6px',borderRadius:'8px'}}>✅ {offerForm.carBrand} {offerForm.carColor} {offerForm.carReg.toUpperCase()}</div>}
              </>
            )}

            <textarea placeholder="Къде минаваш?" value={offerForm.message} onChange={e=>setOfferForm({...offerForm,message:e.target.value})} style={{border:'1px solid #ddd',padding:'12px',borderRadius:'12px',minHeight:'60px'}}/>

            {offerForm.type==='offer' && (
              <label style={{display:'flex',gap:'10px',background: offerForm.isDriver?'#e6f9ed':'#fff8e1',padding:'12px',borderRadius:'12px',border:`2px solid ${offerForm.isDriver?'#2ECC71':'#FFD60A'}`}}>
                <input type="checkbox" checked={offerForm.isDriver} onChange={e=>setOfferForm({...offerForm,isDriver:e.target.checked})}/>
                <span style={{fontSize:'12px'}}>{tr.driverConfirm}</span>
              </label>
            )}

            <button onClick={publishRide} disabled={!canPublish} style={{background: canPublish? '#2ECC71' : '#ccc', color: canPublish? '#0F4C75' : '#888', padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',fontSize:'16px'}}>
              {canPublish? 'Публикувай 🚗' : 'Попълни Марка, Цвят и Рег. номер *'}
            </button>
          </div>
        )}

        {tab==='admin' && isAdmin && (
          <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>
            <h3>🛡️ Админ панел</h3>
            <div style={{background:'#f8d7da',padding:'10px',borderRadius:'10px'}}><b>Сигнали ({reports.length})</b>{reports.map((rep,i)=><div key={i} style={{background:'white',padding:'8px',borderRadius:'8px',marginTop:'6px',fontSize:'12px'}}>{rep.reportedName} {rep.reportedPhone} - {rep.from}→{rep.to}<div style={{display:'flex',gap:'6px',marginTop:'6px'}}><button onClick={()=>{saveBlocked([...blockedPhones, rep.reportedPhone]); saveRides(rides.filter(r=>r.driverPhone!==rep.reportedPhone)); saveReports(reports.filter((_,idx)=>idx!==i));}} style={{background:'#FF3B30',color:'white',border:'none',padding:'6px 8px',borderRadius:'6px'}}>⛔ Блокирай</button><button onClick={()=>saveReports(reports.filter((_,idx)=>idx!==i))} style={{background:'#eee',border:'none',padding:'6px 8px',borderRadius:'6px'}}>Отхвърли</button></div></div>)}</div>
            <div style={{background:'#fff3cd',padding:'10px',borderRadius:'10px'}}><b>Блокирани ({blockedPhones.length})</b>{blockedPhones.map(ph=><div key={ph} style={{display:'flex',justifyContent:'space-between',background:'white',padding:'6px',borderRadius:'6px',marginTop:'4px',fontSize:'12px'}}>{ph}<button onClick={()=>saveBlocked(blockedPhones.filter(p=>p!==ph))} style={{background:'#2ECC71',color:'white',border:'none',padding:'4px 6px',borderRadius:'4px'}}>Разблокирай</button></div>)}</div>
          </div>
        )}
        {tab==='my' && <div style={{padding:'12px'}}>{myRides.map(r=><div key={r.id} style={{border:'1px solid #ddd',padding:'10px',borderRadius:'10px',marginBottom:'8px'}}>{r.from}→{r.to} {r.carInfo}<button onClick={()=>saveRides(rides.filter(x=>x.id!==r.id))} style={{marginLeft:'8px'}}>🗑️</button></div>)}</div>}
      </div>
      <div style={footerStyle}><div><b>❤️ {tr.donateTitle}</b><div style={{fontSize:'11px',color:'#842029',fontWeight:'700'}}>{tr.donateSub}</div></div><a href="https://ko-fi.com/dropoffpay" target="_blank" style={{background:'#FF5E5B',color:'white',padding:'10px 16px',borderRadius:'20px',textDecoration:'none',fontWeight:'bold'}}>Ko-fi</a></div>
    </main>
  );
}