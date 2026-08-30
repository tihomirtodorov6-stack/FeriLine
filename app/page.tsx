'use client';
import { useState, useEffect } from 'react';
type Lang='BG'|'EN';
const t={
  BG:{
    appName:'VoziMe.bg',
    route:'Споделено пътуване • Цяла България',
    networkBanner:'VoziMe.bg е част от',
    networkName:'dropoffpay.co.uk',
    login:'Вход',register:'Регистрация',logout:'Изход',
    find:'Намери',my:'Моите',offer:'Предложи',edit:'Редактирай',
    from:'От',to:'До',departure:'Тръгване',return:'Връщане',
    seats:'Места',message:'Къде точно минаваш?',date:'Кога',
    today:'Днес',tomorrow:'Утре',
    publish:'Публикувай',save:'Запази',cancel:'Откажи',
    full:'ПЪЛНА',free:'Свободна',
    call:'Обади се',viber:'Viber',
    noRides:'Няма пътувания в момента - бъди първият!',
    noMyRides:'Нямаш обяви',
    callToArrange:'⚠️ Пътуването НЕ е безплатно - цена по договаряне',
    shared:'Част от dropoffpay.co.uk • Споделен разход',
    limit:'Лимит 2 обяви за 24ч',
    sharedCost:'Споделен разход',
    donateTitle:'Платформата е безплатна',
    donateSub:'Пътуването НЕ е безплатно • Споделен разход • DropOffPay Network',
    donateButton:'☕ Подкрепи в Ko-fi',
    verified:'✓ VERIFIED PART OF DROPOFFPAY.CO.UK NETWORK',
    offering:'Предлагам',
    searching:'Търся',
    driverConfirm:'Потвърждавам че съм шофьор с кола и книжка и предлагам свободни места',
    mustConfirm:'Трябва да потвърдиш че си шофьор!',
    driverBadge:'🚗 ШОФЬОР',
    passengerBadge:'🙋 ПЪТНИК ТЪРСИ',
    notFreeBadge:'НЕ Е БЕЗПЛАТНО',
    notFreeInfo:'Пътуването е с споделен разход, не е безплатно'
  },
  EN:{
    appName:'VoziMe.bg',
    route:'Ride-sharing • All Bulgaria',
    networkBanner:'VoziMe.bg is part of',
    networkName:'dropoffpay.co.uk',
    login:'Login',register:'Register',logout:'Logout',
    find:'Find',my:'My Rides',offer:'Offer',edit:'Edit',
    from:'From',to:'To',departure:'Depart',return:'Return',
    seats:'Seats',message:'Where do you pass?',date:'When',
    today:'Today',tomorrow:'Tomorrow',
    publish:'Publish',save:'Save',cancel:'Cancel',
    full:'FULL',free:'Free',
    call:'Call',viber:'Viber',
    noRides:'No rides yet - be the first!',
    noMyRides:'No rides',
    callToArrange:'⚠️ Ride is NOT free - call for price',
    shared:'Part of dropoffpay.co.uk network • Shared cost',
    limit:'Limit 2 rides / 24h',
    sharedCost:'Shared cost',
    donateTitle:'Platform is free',
    donateSub:'Ride is NOT free • Shared cost • DropOffPay Network',
    donateButton:'☕ Support on Ko-fi',
    verified:'✓ VERIFIED PART OF DROPOFFPAY.CO.UK NETWORK',
    offering:'Offering',
    searching:'Seeking',
    driverConfirm:'I confirm I am a driver with a car and license offering free seats',
    mustConfirm:'You must confirm you are a driver!',
    driverBadge:'🚗 DRIVER',
    passengerBadge:'🙋 SEEKING RIDE',
    notFreeBadge:'NOT FREE',
    notFreeInfo:'Ride is shared cost, not free'
  }
};
const translateDate=(d:string,l:Lang)=>l==='EN'?(d==='Днес'?'Today':d==='Утре'?'Tomorrow':d):(d==='Today'?'Днес':d==='Tomorrow'?'Утре':d);
type User={id:string,firstName:string,lastName:string,phone:string,password:string};
type Ride={id:string,driverName:string,driverPhone:string,driverId:string,from:string,to:string,time:string,returnTime:string,date:any,seats:number,message:string,createdAt:number,isFull:boolean,requests:any[],type:'offer'|'request',isDriverVerified:boolean};

export default function Home(){
  const [lang,setLang]=useState<Lang>('BG'); const tr=t[lang];
  const [users,setUsers]=useState<User[]>([]); const [currentUser,setCurrentUser]=useState<User|null>(null);
  const [mode,setMode]=useState<'login'|'register'|'app'>('login'); const [tab,setTab]=useState<'find'|'my'|'offer'>('find');
  const [rides,setRides]=useState<Ride[]>([]); const [editingRide,setEditingRide]=useState<string|null>(null);
  const [form,setForm]=useState({firstName:'',lastName:'',phone:'',password:''});
  const [offerForm,setOfferForm]=useState({type:'offer' as 'offer'|'request',from:'',to:'',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false});

  useEffect(()=>{
    const sl=localStorage.getItem('vozime_lang') as Lang; if(sl) setLang(sl);
    const u=localStorage.getItem('vozime_users'); const cu=localStorage.getItem('vozime_current'); const r=localStorage.getItem('vozime_rides_noprice');
    if(u) setUsers(JSON.parse(u)); if(cu){ setCurrentUser(JSON.parse(cu)); setMode('app'); }
    if(r){ const f=JSON.parse(r).filter((x:Ride)=>Date.now()-x.createdAt<48*60*60*1000).sort((a:Ride,b:Ride)=>b.createdAt-a.createdAt); localStorage.setItem('vozime_rides_noprice', JSON.stringify(f)); setRides(f); }
  },[]);

  const changeLang=(l:Lang)=>{setLang(l);localStorage.setItem('vozime_lang', l);};
  const saveRides=(nr:Ride[])=>{const s=[...nr].sort((a,b)=>b.createdAt-a.createdAt);setRides(s);localStorage.setItem('vozime_rides_noprice', JSON.stringify(s));};
  const saveUsers=(nu:User[])=>{setUsers(nu);localStorage.setItem('vozime_users', JSON.stringify(nu));};
  const handleRegister=()=>{if(!form.firstName||!form.lastName||!form.phone||!form.password){alert('Попълни всички');return;}if(users.find(u=>u.phone===form.phone)){alert('Телефонът съществува');return;}const nu={id:Date.now().toString(),...form};saveUsers([...users,nu]);localStorage.setItem('vozime_current', JSON.stringify(nu));setCurrentUser(nu);setMode('app');};
  const handleLogin=()=>{const f=users.find(u=>u.phone===form.phone&&u.password===form.password);if(!f){alert('Грешен телефон');return;}localStorage.setItem('vozime_current', JSON.stringify(f));setCurrentUser(f);setMode('app');};
  const logout=()=>{localStorage.removeItem('vozime_current');setCurrentUser(null);setMode('login');};

  const publishRide=()=>{
    if(!currentUser) return;
    if(!offerForm.from ||!offerForm.to){alert(lang==='BG'?'Напиши От и До':'Enter From and To');return;}
    if(offerForm.type==='offer' &&!offerForm.isDriver){alert(tr.mustConfirm);return;}
    const last24h = rides.filter(r=>r.driverId===currentUser.id && Date.now()-r.createdAt < 24*60*60*1000);
    if(!editingRide && last24h.length>=2){ alert(tr.limit); return; }
    const now = Date.now();
    const nr:Ride={ id: editingRide||now.toString(), driverName:`${currentUser.firstName} ${currentUser.lastName}`, driverPhone:currentUser.phone, driverId:currentUser.id, from:offerForm.from, to:offerForm.to, time:offerForm.time, returnTime:offerForm.returnTime, date:offerForm.date, seats:parseInt(offerForm.seats)||1, message:offerForm.message, createdAt: editingRide? rides.find(r=>r.id===editingRide)!.createdAt : now, isFull:false, requests:[], type:offerForm.type, isDriverVerified: offerForm.type==='offer'? offerForm.isDriver : false };
    if(editingRide){ saveRides(rides.map(r=>r.id===editingRide?nr:r)); setEditingRide(null); } else saveRides([nr,...rides]);
    setOfferForm({type:'offer',from:'',to:'',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false});
    setTab('my');
  };
  const startEdit=(ride:Ride)=>{ setOfferForm({type:ride.type||'offer',from:ride.from, to:ride.to, time:ride.time, returnTime:ride.returnTime, date:ride.date, seats:ride.seats.toString(), message:ride.message, isDriver:ride.isDriverVerified||false}); setEditingRide(ride.id); setTab('offer'); };
  const deleteRide=(id:string)=>{ if(confirm('Delete?')) saveRides(rides.filter(r=>r.id!==id)); };

  const appStyle:React.CSSProperties={fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',position:'fixed',top:0,left:0,right:0,bottom:0,height:'100dvh',width:'100vw',maxWidth:'480px',margin:'0 auto',background:'white',display:'flex',flexDirection:'column',overflow:'hidden',overscrollBehavior:'none' as any};
  const networkBannerStyle:React.CSSProperties={background:'#0F4C75',color:'white',padding:'6px 12px',fontSize:'11px',textAlign:'center',flexShrink:0,zIndex:30,display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'};
  const headerStyle:React.CSSProperties={height:'60px',minHeight:'60px',background:'#0F4C75',color:'white',display:'flex',alignItems:'center',padding:'0 12px',gap:'8px',flexShrink:0,zIndex:20};
  const tabsStyle:React.CSSProperties={height:'56px',minHeight:'56px',display:'flex',gap:'6px',padding:'8px',background:'#f1f3f4',borderBottom:'1px solid #eee',flexShrink:0,zIndex:20};
  const contentStyle:React.CSSProperties={flex:1,overflowY:'auto',overflowX:'hidden',WebkitOverflowScrolling:'touch' as any,overscrollBehavior:'contain' as any};
  const footerStyle:React.CSSProperties={height:'auto',minHeight:'88px',flexShrink:0,background:'white',borderTop:'1px solid #e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between',padding:`12px 12px calc(12px + env(safe-area-inset-bottom, 12px)) 12px`,gap:'12px',boxShadow:'0 -4px 20px rgba(0,0,0,0.08)',zIndex:20};

  const Footer=()=>(
    <div style={footerStyle}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:'13px',fontWeight:'800',color:'#0F4C75',lineHeight:'1.2'}}>❤️ {tr.donateTitle}</div>
        <div style={{fontSize:'11px',color:'#842029',fontWeight:'700',marginTop:'3px',lineHeight:'1.2'}}>{tr.donateSub}</div>
      </div>
      <a href="https://ko-fi.com/dropoffpay" target="_blank" rel="noopener noreferrer" style={{background:'#FF5E5B',color:'white',padding:'14px 22px',borderRadius:'28px',fontWeight:'bold',textDecoration:'none',fontSize:'14px',whiteSpace:'nowrap',flexShrink:0,boxShadow:'0 2px 8px rgba(255,94,91,0.3)'}}>{tr.donateButton}</a>
    </div>
  );

  if(mode!=='app'){
    return (<main style={appStyle}>
      <div style={networkBannerStyle}><span>{tr.networkBanner}</span><span style={{background:'#FFD60A',color:'black',padding:'2px 8px',borderRadius:'10px',fontWeight:'bold',fontSize:'11px'}}>{tr.networkName}</span></div>
      <div style={{...contentStyle,padding:'24px'}}>
        <div style={{display:'flex',justifyContent:'flex-end',gap:'6px'}}><button onClick={()=>changeLang('BG')} style={{padding:'6px 12px',borderRadius:'20px',border:'none',fontWeight:'bold',background:lang==='BG'?'#0F4C75':'#eee',color:lang==='BG'?'white':'#666'}}>BG</button><button onClick={()=>changeLang('EN')} style={{padding:'6px 12px',borderRadius:'20px',border:'none',fontWeight:'bold',background:lang==='EN'?'#0F4C75':'#eee',color:lang==='EN'?'white':'#666'}}>EN</button></div>
        <div style={{textAlign:'center',marginTop:'16px'}}><div style={{width:'64px',height:'64px',background:'#2ECC71',borderRadius:'20px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',fontSize:'32px'}}>🚗</div><h1 style={{fontSize:'28px',fontWeight:'bold',margin:'12px 0 4px'}}>{tr.appName}</h1><p style={{fontSize:'13px',color:'#888'}}>{tr.route}</p><div style={{background:'black',color:'#FFD60A',fontSize:'10px',fontWeight:'bold',padding:'6px 12px',borderRadius:'20px',display:'inline-block',marginTop:'10px',letterSpacing:'0.5px'}}>{tr.verified}</div><div style={{marginTop:'10px',background:'#f8d7da',border:'1px solid #f5c2c7',color:'#842029',fontSize:'11px',fontWeight:'800',padding:'6px 12px',borderRadius:'20px',display:'inline-block'}}>{tr.notFreeInfo}</div></div>
        <div style={{display:'flex',gap:'8px',background:'#f1f3f4',padding:'4px',borderRadius:'12px',margin:'20px 0',height:'48px'}}><button onClick={()=>setMode('login')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:mode==='login'?'white':'transparent'}}>{tr.login}</button><button onClick={()=>setMode('register')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:mode==='register'?'white':'transparent'}}>{tr.register}</button></div>
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>{mode==='register'?<><div style={{display:'flex',gap:'8px'}}><input placeholder="Име" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><input placeholder="Фамилия" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/></div><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><button onClick={handleRegister} style={{background:'#0F4C75',color:'white',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',height:'52px'}}>{tr.register}</button></>:<><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{border:'1px solid #ddd',padding:'14px',borderRadius:'12px',fontSize:'16px'}}/><button onClick={handleLogin} style={{background:'#2ECC71',color:'#0F4C75',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',height:'52px'}}>{tr.login}</button></>}</div>
      </div><Footer/></main>);
  }

  const visibleRides=rides.filter(r=>!r.isFull&&Date.now()-r.createdAt<48*60*60*1000).sort((a,b)=>b.createdAt-a.createdAt);
  const myRides=rides.filter(r=>r.driverId===currentUser?.id&&Date.now()-r.createdAt<48*60*60*1000).sort((a,b)=>b.createdAt-a.createdAt);

  return (
    <main style={appStyle}>
      <div style={networkBannerStyle}><span>{tr.networkBanner}</span><a href="https://dropoffpay.co.uk" target="_blank" style={{background:'#FFD60A',color:'black',padding:'2px 8px',borderRadius:'10px',fontWeight:'bold',fontSize:'11px',textDecoration:'none'}}>{tr.networkName}</a></div>
      <header style={headerStyle}><div style={{width:'36px',height:'36px',background:'#2ECC71',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>🚗</div><div style={{flex:1}}><div style={{fontWeight:'bold',fontSize:'13px'}}>{currentUser?.firstName} {currentUser?.lastName}</div><div style={{fontSize:'10px',opacity:0.8}}>{currentUser?.phone}</div></div><div style={{display:'flex',gap:'4px'}}><button onClick={()=>changeLang('BG')} style={{padding:'5px 10px',borderRadius:'20px',border:'none',fontWeight:'bold',background:lang==='BG'?'white':'rgba(255,255,255,0.2)',color:lang==='BG'?'#0F4C75':'white',fontSize:'11px'}}>BG</button><button onClick={()=>changeLang('EN')} style={{padding:'5px 10px',borderRadius:'20px',border:'none',fontWeight:'bold',background:lang==='EN'?'white':'rgba(255,255,255,0.2)',color:lang==='EN'?'#0F4C75':'white',fontSize:'11px'}}>EN</button></div><button onClick={logout} style={{fontSize:'11px',background:'rgba(255,255,255,0.2)',border:'none',color:'white',padding:'6px 10px',borderRadius:'20px'}}>{tr.logout}</button></header>
      <div style={tabsStyle}><button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666',fontSize:'12px'}}>{tr.find} ({visibleRides.length})</button><button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666',fontSize:'12px'}}>{tr.my} ({myRides.length})</button><button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'12px',fontWeight:'bold',border:'none',background:tab==='offer'?'#0F4C75':'white',color:tab==='offer'?'white':'#666',fontSize:'12px'}}>{editingRide? tr.edit : tr.offer}</button></div>
      <div style={contentStyle}>
        {tab==='find' && (
          <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>
            <div style={{background:'black',color:'#FFD60A',fontSize:'10px',fontWeight:'bold',padding:'6px 12px',borderRadius:'20px',textAlign:'center',letterSpacing:'0.5px'}}>{tr.verified}</div>
            <div style={{background:'#f8d7da',border:'1px solid #f5c2c7',color:'#842029',fontSize:'11px',fontWeight:'800',padding:'8px 12px',borderRadius:'12px',textAlign:'center'}}>⚠️ {tr.notFreeInfo.toUpperCase()}</div>
            {visibleRides.map(ride=>{
              const isOffer = (ride.type||'offer')==='offer';
              return (
              <div key={ride.id} style={{border: isOffer? '1px solid #eee' : '2px dashed #0F4C75',borderRadius:'16px',padding:'14px',background: isOffer? 'white' : '#f0f7ff'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px'}}>
                  <div style={{fontWeight:'bold',fontSize:'16px',flex:1}}>{ride.from} → {ride.to} <span style={{fontSize:'11px',background:'#f1f3f4',padding:'3px 8px',borderRadius:'10px',marginLeft:'6px'}}>{translateDate(ride.date,lang)}</span></div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'4px'}}>
                    <span style={{fontSize:'10px',padding:'4px 8px',borderRadius:'10px',fontWeight:'bold',whiteSpace:'nowrap',background: isOffer? '#FF3B30' : '#0F4C75', color:'white'}}>{isOffer? tr.notFreeBadge : tr.passengerBadge}</span>
                    <span style={{fontSize:'10px',padding:'4px 8px',borderRadius:'10px',fontWeight:'bold',background:'#e6f9ed',color:'#0F4C75'}}>{isOffer? tr.driverBadge : ''}</span>
                  </div>
                </div>
                <div style={{fontSize:'12px',color:'#888',marginTop:'4px'}}>{tr.departure}: {ride.time} • {tr.return}: {ride.returnTime} • {ride.seats} {tr.seats}</div>
                <div style={{marginTop:'10px',padding:'10px',background:isOffer?'#f8f9fa':'white',borderRadius:'12px'}}>
                  <div style={{fontWeight:'bold',fontSize:'14px'}}>👤 {ride.driverName} {isOffer && ride.isDriverVerified && <span style={{fontSize:'10px',background:'#2ECC71',color:'white',padding:'2px 6px',borderRadius:'8px',marginLeft:'6px'}}>✓ ШОФЬОР</span>}</div>
                  <div style={{fontSize:'13px',marginTop:'6px'}}>"{ride.message}"</div>
                </div>
                <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
                  <a href={`tel:${ride.driverPhone}`} style={{flex:1,background:'#0F4C75',color:'white',textAlign:'center',padding:'12px',borderRadius:'12px',fontWeight:'bold',textDecoration:'none'}}>📞 {tr.call}</a>
                  <a href={`https://wa.me/${ride.driverPhone.replace(/[^0-9]/g,'')}`} target="_blank" style={{background:'#25D366',color:'white',padding:'12px 16px',borderRadius:'12px',fontWeight:'bold',textDecoration:'none'}}>{tr.viber}</a>
                </div>
                <div style={{fontSize:'12px',color:'#842029',background:'#f8d7da',border:'1px solid #f5c2c7',padding:'8px',borderRadius:'8px',textAlign:'center',marginTop:'8px',fontWeight:'800'}}>{tr.callToArrange}</div>
              </div>
            )})}
            {visibleRides.length===0&&<div style={{textAlign:'center',color:'#888',marginTop:'10px'}}>{tr.noRides}</div>}
          </div>
        )}
        {tab==='my' && (<div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>{myRides.map(ride=><div key={ride.id} style={{border:'2px solid #0F4C75',borderRadius:'16px',padding:'14px'}}><div style={{fontWeight:'bold'}}>{ride.type==='request'?'🙋':'🚗'} {ride.from}→{ride.to} • {ride.time} <span style={{fontSize:'10px',background:'#FF3B30',color:'white',padding:'2px 6px',borderRadius:'8px',marginLeft:'6px'}}>{tr.notFreeBadge}</span></div><div style={{display:'flex',gap:'6px',marginTop:'10px'}}><button onClick={()=>startEdit(ride)} style={{flex:1,background:'#0F4C75',color:'white',border:'none',padding:'8px',borderRadius:'10px'}}>✏️ {tr.edit}</button><button onClick={()=>deleteRide(ride.id)} style={{background:'#eee',border:'none',padding:'8px 12px',borderRadius:'10px'}}>🗑️</button></div></div>)}</div>)}
        {tab==='offer' && (
          <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'12px'}}>
            <div style={{background:'#f8d7da',border:'1px solid #f5c2c7',color:'#842029',fontSize:'12px',fontWeight:'800',padding:'10px 12px',borderRadius:'12px',textAlign:'center'}}>⚠️ {tr.notFreeInfo}</div>
            <div style={{display:'flex',gap:'8px',background:'#f1f3f4',padding:'4px',borderRadius:'14px'}}>
              <button onClick={()=>setOfferForm({...offerForm,type:'offer'})} style={{flex:1,padding:'14px',borderRadius:'10px',border:'none',fontWeight:'bold',fontSize:'14px',background:offerForm.type==='offer'?'#0F4C75':'white',color:offerForm.type==='offer'?'white':'#666'}}>🚗 {tr.offering}</button>
              <button onClick={()=>setOfferForm({...offerForm,type:'request'})} style={{flex:1,padding:'14px',borderRadius:'10px',border:'none',fontWeight:'bold',fontSize:'14px',background:offerForm.type==='request'?'#0F4C75':'white',color:offerForm.type==='request'?'white':'#666'}}>🙋 {tr.searching}</button>
            </div>
            <div style={{display:'flex',gap:'8px'}}>
              <input placeholder={lang==='BG'?'От - напр. София':'From - e.g. Sofia'} value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/>
              <input placeholder={lang==='BG'?'До - напр. Варна':'To - e.g. Varna'} value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px',fontSize:'16px'}}/>
            </div>
            <div style={{display:'flex',gap:'8px'}}><select value={offerForm.date} onChange={e=>setOfferForm({...offerForm,date:e.target.value as any})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px'}}><option>{tr.today}</option><option>{tr.tomorrow}</option></select><input type="time" value={offerForm.time} onChange={e=>setOfferForm({...offerForm,time:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px'}}/><input type="time" value={offerForm.returnTime} onChange={e=>setOfferForm({...offerForm,returnTime:e.target.value})} style={{flex:1,border:'1px solid #ddd',padding:'12px',borderRadius:'12px'}}/></div>
            <input placeholder={tr.seats} value={offerForm.seats} onChange={e=>setOfferForm({...offerForm,seats:e.target.value})} style={{border:'1px solid #ddd',padding:'12px',borderRadius:'12px'}}/>
            <textarea placeholder={lang==='BG'?'Къде точно минаваш? През кои градове/спирки?':'Where do you pass? Which cities/stops?'} value={offerForm.message} onChange={e=>setOfferForm({...offerForm,message:e.target.value})} style={{border:'1px solid #ddd',padding:'12px',borderRadius:'12px',minHeight:'80px',fontSize:'16px'}}/>
            {offerForm.type==='offer' && (
              <label style={{display:'flex',gap:'12px',alignItems:'flex-start',background:'#e6f9ed',padding:'14px',borderRadius:'12px',border:'2px solid',borderColor:offerForm.isDriver?'#2ECC71':'#ddd',cursor:'pointer'}}>
                <input type="checkbox" checked={offerForm.isDriver} onChange={e=>setOfferForm({...offerForm,isDriver:e.target.checked})} style={{width:'22px',height:'22px',marginTop:'2px',flexShrink:0}}/>
                <span style={{fontSize:'13px',lineHeight:'1.4',fontWeight:'500'}}>{tr.driverConfirm}</span>
              </label>
            )}
            <button onClick={publishRide} style={{background: offerForm.type==='offer' &&!offerForm.isDriver? '#ccc' : '#2ECC71',color: offerForm.type==='offer' &&!offerForm.isDriver? '#888' : '#0F4C75',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',fontSize:'16px'}} disabled={offerForm.type==='offer' &&!offerForm.isDriver}>{editingRide? tr.save : tr.publish} {offerForm.type==='offer'? '🚗' : '🙋'}</button>
          </div>
        )}
      </div>
      <Footer/>
    </main>
  );
}