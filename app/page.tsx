'use client';
import { useState, useEffect } from 'react';
type Lang='BG'|'EN';
const ADMIN_PHONES=['+447935463970','07935463970','447935463970'];

const t={
  BG:{
    appName:'VoziMe.bg', route:'Споделено пътуване • Цяла България',
    networkBanner:'VoziMe.bg е част от', networkName:'dropoffpay.co.uk',
    login:'Вход',register:'Регистрация',logout:'Изход', find:'Намери',my:'Моите',offer:'Предложи',edit:'Редактирай', admin:'Админ',
    from:'От',to:'До',departure:'Тръгване',arrival:'Пристигане', seats:'Места',message:'Къде минаваш?',date:'Кога', today:'Днес',tomorrow:'Утре',
    publish:'Публикувай',save:'Запази',cancel:'Откажи', call:'Обади се',viber:'Viber',
    noRides:'Няма пътувания', noMyRides:'Нямаш обяви',
    callToArrange:'⚠️ Пътуването НЕ е безплатно - цена по договаряне',
    donateTitle:'Платформата е безплатна', donateSub:'Пътуването НЕ е безплатно • Споделен разход',
    donateButton:'Ko-fi', verified:'✓ VERIFIED PART OF DROPOFFPAY.CO.UK NETWORK',
    offering:'Предлагам', searching:'Търся',
    driverConfirm:'ДЕКЛАРИРАМ: Аз съм шофьор с валидна книжка и кола.',
    mustConfirm:'Попълни всичко + декларация!', driverBadge:'🚗 ШОФЬОР',
    notFreeBadge:'НЕ Е БЕЗПЛАТНО', notFreeInfo:'Споделен разход, не е безплатно',
    brand:'Марка *', color:'Цвят *', reg:'Рег. номер *',
  },
  EN:{ appName:'VoziMe.bg', route:'Ride-sharing', networkBanner:'VoziMe.bg is part of', networkName:'dropoffpay.co.uk', login:'Login',register:'Register',logout:'Logout', find:'Find',my:'My',offer:'Offer',edit:'Edit', admin:'Admin', from:'From',to:'To',departure:'Depart',arrival:'Arrival', seats:'Seats',message:'Where?',date:'When', today:'Today',tomorrow:'Tomorrow', publish:'Publish',save:'Save',cancel:'Cancel', call:'Call',viber:'Viber', noRides:'No rides', noMyRides:'No rides', callToArrange:'NOT free - call for price', donateTitle:'Platform free', donateSub:'Ride NOT free', donateButton:'Ko-fi', verified:'VERIFIED', offering:'Offering', searching:'Seeking', driverConfirm:'I am driver', mustConfirm:'Fill all!', driverBadge:'DRIVER', notFreeBadge:'NOT FREE', notFreeInfo:'Shared cost', brand:'Brand *', color:'Color *', reg:'Reg *', }
};

type User={id:string,firstName:string,lastName:string,phone:string,password:string};
type Ride={id:string,driverName:string,driverPhone:string,driverId:string,from:string,to:string,time:string,returnTime:string,date:any,seats:number,message:string,createdAt:number,isFull:boolean,type:'offer'|'request',isDriverVerified:boolean,carBrand:string,carColor:string,carReg:string,carInfo:string};
type Report={rideId:string, reporterId:string, reportedPhone:string, reportedName:string, from:string, to:string, time:number};

export default function Home(){
  const [lang,setLang]=useState<Lang>('BG'); const tr=t[lang];
  const [users,setUsers]=useState<User[]>([]); const [currentUser,setCurrentUser]=useState<User|null>(null);
  const [mode,setMode]=useState<'login'|'register'|'app'>('login'); const [tab,setTab]=useState<'find'|'my'|'offer'|'admin'>('find');
  const [rides,setRides]=useState<Ride[]>([]); const [editingRide,setEditingRide]=useState<string|null>(null);
  const [form,setForm]=useState({firstName:'',lastName:'',phone:'',password:''});
  const [offerForm,setOfferForm]=useState({type:'offer' as 'offer'|'request',from:'',to:'',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:''});
  const [reports,setReports]=useState<Report[]>([]); const [blockedPhones,setBlockedPhones]=useState<string[]>([]);
  const isAdmin = currentUser && ADMIN_PHONES.includes(currentUser.phone.replace(/\s/g,''));

  useEffect(()=>{
    document.body.style.margin='0'; document.documentElement.style.overflow='hidden'; document.body.style.overflow='hidden';
    const u=localStorage.getItem('vozime_users'); const cu=localStorage.getItem('vozime_current'); const r=localStorage.getItem('vozime_rides_noprice'); const rp=localStorage.getItem('vozime_reports'); const bp=localStorage.getItem('vozime_blocked');
    if(u) setUsers(JSON.parse(u)); if(cu){ setCurrentUser(JSON.parse(cu)); setMode('app'); }
    if(r) setRides(JSON.parse(r).filter((x:Ride)=>Date.now()-x.createdAt<48*60*60*1000).sort((a:Ride,b:Ride)=>b.createdAt-a.createdAt));
    if(rp) setReports(JSON.parse(rp)); if(bp) setBlockedPhones(JSON.parse(bp));
  },[]);

  const saveRides=(nr:Ride[])=>{const s=[...nr].sort((a,b)=>b.createdAt-a.createdAt);setRides(s);localStorage.setItem('vozime_rides_noprice', JSON.stringify(s));};
  const saveUsers=(nu:User[])=>{setUsers(nu);localStorage.setItem('vozime_users', JSON.stringify(nu));};

  const handleRegister=()=>{ if(!form.firstName||!form.lastName||!form.phone||!form.password){alert('Попълни всички');return;} const nu={id:Date.now().toString(),...form};saveUsers([...users,nu]);localStorage.setItem('vozime_current', JSON.stringify(nu));setCurrentUser(nu);setMode('app'); };
  const handleLogin=()=>{ const f=users.find(u=>u.phone===form.phone&&u.password===form.password); if(!f){alert('Грешен');return;} localStorage.setItem('vozime_current', JSON.stringify(f));setCurrentUser(f);setMode('app'); };
  const logout=()=>{localStorage.removeItem('vozime_current');setCurrentUser(null);setMode('login');};

  const carFilled = offerForm.carBrand.trim() && offerForm.carColor.trim() && offerForm.carReg.trim();
  const canPublish = offerForm.from && offerForm.to && (offerForm.type==='request' || (carFilled && offerForm.isDriver));

  const publishRide=()=>{
    if(!currentUser) return;
    if(!canPublish){alert(tr.mustConfirm);return;}
    const now = Date.now();
    const carInfo = `${offerForm.carBrand} ${offerForm.carColor} ${offerForm.carReg.toUpperCase()}`;
    const nr:Ride={ id: editingRide||now.toString(), driverName:`${currentUser.firstName} ${currentUser.lastName}`, driverPhone:currentUser.phone, driverId:currentUser.id, from:offerForm.from, to:offerForm.to, time:offerForm.time, returnTime:offerForm.returnTime, date:offerForm.date, seats:parseInt(offerForm.seats)||1, message:offerForm.message, createdAt: editingRide? rides.find(r=>r.id===editingRide)!.createdAt : now, isFull:false, type:offerForm.type, isDriverVerified: offerForm.isDriver, carBrand:offerForm.carBrand, carColor:offerForm.carColor, carReg:offerForm.carReg.toUpperCase(), carInfo };
    if(editingRide){ saveRides(rides.map(r=>r.id===editingRide?nr:r)); setEditingRide(null); } else saveRides([nr,...rides]);
    setOfferForm({type:'offer',from:'',to:'',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:''}); setTab('my');
  };
  const startEdit=(ride:Ride)=>{ setOfferForm({type:ride.type,from:ride.from,to:ride.to,time:ride.time,returnTime:ride.returnTime,date:ride.date,seats:ride.seats.toString(),message:ride.message,isDriver:ride.isDriverVerified,carBrand:ride.carBrand,carColor:ride.carColor,carReg:ride.carReg}); setEditingRide(ride.id); setTab('offer'); };

  const appStyle:React.CSSProperties={height:'100dvh',width:'100%',maxWidth:'480px',margin:'0 auto',background:'white',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative',fontFamily:'-apple-system, sans-serif'};
  const contentStyle:React.CSSProperties={flex:1,overflowY:'auto',WebkitOverflowScrolling:'touch' as any};

  const inputStyle=(filled:boolean):React.CSSProperties=>({flex:1,padding:'12px',borderRadius:'12px',fontSize:'16px',border:filled?'2px solid #2ECC71':'2px solid #FF3B30',background:filled?'#e6f9ed':'#fff5f5',outline:'none'});

  if(mode!=='app'){
    return (<main style={appStyle}><div style={{background:'#0F4C75',color:'white',padding:'6px',textAlign:'center',fontSize:'11px'}}>{tr.networkBanner} <span style={{background:'#FFD60A',color:'black',padding:'2px 8px',borderRadius:'10px',fontWeight:'bold'}}>{tr.networkName}</span></div><div style={{...contentStyle,padding:'20px'}}><div style={{display:'flex',gap:'8px',background:'#f1f3f4',padding:'4px',borderRadius:'12px',height:'48px'}}><button onClick={()=>setMode('login')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:mode==='login'?'white':'transparent'}}>Вход</button><button onClick={()=>setMode('register')} style={{flex:1,borderRadius:'10px',border:'none',fontWeight:'bold',background:mode==='register'?'white':'transparent'}}>Регистрация</button></div><div style={{display:'flex',flexDirection:'column',gap:'10px',marginTop:'20px'}}>{mode==='register'?<><div style={{display:'flex',gap:'8px'}}><input placeholder="Име" value={form.firstName} onChange={e=>setForm({...form,firstName:e.target.value})} style={{flex:1,padding:'12px',borderRadius:'12px',border:'1px solid #ddd'}}/><input placeholder="Фамилия" value={form.lastName} onChange={e=>setForm({...form,lastName:e.target.value})} style={{flex:1,padding:'12px',borderRadius:'12px',border:'1px solid #ddd'}}/></div><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{padding:'12px',borderRadius:'12px',border:'1px solid #ddd'}}/><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{padding:'12px',borderRadius:'12px',border:'1px solid #ddd'}}/><button onClick={handleRegister} style={{background:'#0F4C75',color:'white',padding:'14px',borderRadius:'12px',fontWeight:'bold',border:'none'}}>Регистрация</button></>:<><input placeholder="Телефон" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={{padding:'12px',borderRadius:'12px',border:'1px solid #ddd'}}/><input type="password" placeholder="Парола" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{padding:'12px',borderRadius:'12px',border:'1px solid #ddd'}}/><button onClick={handleLogin} style={{background:'#2ECC71',color:'#0F4C75',padding:'14px',borderRadius:'12px',fontWeight:'bold',border:'none'}}>Вход</button></>}</div></div></main>)
  }

  const visibleRides=rides.filter(r=>!blockedPhones.includes(r.driverPhone));
  const myRides=rides.filter(r=>r.driverId===currentUser?.id);

  return (
    <main style={appStyle}>
      <div style={{background:'#0F4C75',color:'white',padding:'8px',textAlign:'center',fontSize:'11px'}}>VoziMe.bg е част от <span style={{background:'#FFD60A',color:'black',padding:'2px 8px',borderRadius:'10px',fontWeight:'bold'}}>dropoffpay.co.uk</span></div>
      <div style={{height:'56px',display:'flex',gap:'6px',padding:'8px',background:'#f1f3f4',flexShrink:0}}>
        <button onClick={()=>setTab('find')} style={{flex:1,borderRadius:'12px',border:'none',fontWeight:'bold',background:tab==='find'?'#0F4C75':'white',color:tab==='find'?'white':'#666'}}>Намери ({visibleRides.length})</button>
        <button onClick={()=>setTab('my')} style={{flex:1,borderRadius:'12px',border:'none',fontWeight:'bold',background:tab==='my'?'#0F4C75':'white',color:tab==='my'?'white':'#666'}}>Моите ({myRides.length})</button>
        <button onClick={()=>setTab('offer')} style={{flex:1,borderRadius:'12px',border:'none',fontWeight:'bold',background:tab==='offer'?'#0F4C75':'white',color:tab==='offer'?'white':'#666'}}>{editingRide?'Редактирай':'Предложи'}</button>
        {isAdmin && <button onClick={()=>setTab('admin')} style={{borderRadius:'12px',border:'none',fontWeight:'bold',background:'black',color:'white',padding:'0 12px'}}>Админ</button>}
      </div>

      <div style={contentStyle}>
        {tab==='find' && <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>{visibleRides.map(r=><div key={r.id} style={{border:'1px solid #eee',borderRadius:'16px',padding:'14px'}}><div style={{display:'flex',justifyContent:'space-between'}}><b>{r.from} → {r.to}</b><span style={{background:'#FF3B30',color:'white',fontSize:'10px',padding:'3px 8px',borderRadius:'8px'}}>НЕ Е БЕЗПЛАТНО</span></div><div style={{fontSize:'12px',color:'#666',marginTop:'4px'}}>🕒 {tr.departure}: {r.time} • {tr.arrival}: {r.returnTime} • 📅 {r.date}</div><div style={{fontSize:'12px',marginTop:'4px'}}>🚗 {r.carInfo} • {r.seats} места</div><div style={{fontSize:'13px',marginTop:'8px'}}>👤 {r.driverName} ✓ ШОФЬОР<br/>"{r.message}"</div><div style={{display:'flex',gap:'8px',marginTop:'10px'}}><a href={`tel:${r.driverPhone}`} style={{flex:1,background:'#0F4C75',color:'white',textAlign:'center',padding:'10px',borderRadius:'10px',textDecoration:'none',fontWeight:'bold'}}>📞 Обади се</a></div></div>)}</div>}

        {tab==='my' && <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px'}}>{myRides.map(r=>(
          <div key={r.id} style={{border:'2px solid #0F4C75',borderRadius:'16px',padding:'14px',background:'#f8f9fa'}}>
            <div style={{fontWeight:'bold'}}>{r.from} → {r.to} • {r.carInfo}</div>
            <div style={{fontSize:'12px',color:'#555',marginTop:'4px'}}>🕒 Тръгване: {r.time} • Очакванo: {r.returnTime} • {r.date} • {r.seats} места</div>
            <div style={{fontSize:'12px',marginTop:'4px'}}>"{r.message}"</div>
            <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
              <button onClick={()=>startEdit(r)} style={{flex:1,background:'#0F4C75',color:'white',border:'none',padding:'10px',borderRadius:'10px',fontWeight:'bold'}}>✏️ Редактирай</button>
              <button onClick={()=>saveRides(rides.filter(x=>x.id!==r.id))} style={{background:'#fff',border:'1px solid #ddd',padding:'10px 14px',borderRadius:'10px'}}>🗑️</button>
            </div>
          </div>
        ))}{myRides.length===0 && <div>Нямаш обяви</div>}</div>}

        {tab==='offer' && (
          <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'12px'}}>
            <div style={{display:'flex',gap:'8px',background:'#f1f3f4',padding:'4px',borderRadius:'14px'}}>
              <button onClick={()=>setOfferForm({...offerForm,type:'offer'})} style={{flex:1,padding:'12px',borderRadius:'10px',border:'none',fontWeight:'bold',background:offerForm.type==='offer'?'#0F4C75':'white',color:offerForm.type==='offer'?'white':'#666'}}>🚗 Предлагам</button>
              <button onClick={()=>setOfferForm({...offerForm,type:'request'})} style={{flex:1,padding:'12px',borderRadius:'10px',border:'none',fontWeight:'bold',background:offerForm.type==='request'?'#0F4C75':'white',color:offerForm.type==='request'?'white':'#666'}}>🙋 Търся</button>
            </div>

            <div style={{display:'flex',gap:'8px'}}>
              <input placeholder="От" value={offerForm.from} onChange={e=>setOfferForm({...offerForm,from:e.target.value})} style={inputStyle(!!offerForm.from)}/>
              <input placeholder="До" value={offerForm.to} onChange={e=>setOfferForm({...offerForm,to:e.target.value})} style={inputStyle(!!offerForm.to)}/>
            </div>

            <div style={{display:'flex',gap:'8px'}}>
              <select value={offerForm.date} onChange={e=>setOfferForm({...offerForm,date:e.target.value})} style={{flex:1,padding:'12px',borderRadius:'12px',border:'1px solid #ddd'}}>
                <option>Днес</option><option>Утре</option><option>29.08</option><option>30.08</option>
              </select>
              <input type="time" value={offerForm.time} onChange={e=>setOfferForm({...offerForm,time:e.target.value})} style={{flex:1,padding:'12px',borderRadius:'12px',border: offerForm.time?'2px solid #2ECC71':'1px solid #ddd',background: offerForm.time?'#e6f9ed':'white'}}/>
              <input type="time" value={offerForm.returnTime} onChange={e=>setOfferForm({...offerForm,returnTime:e.target.value})} style={{flex:1,padding:'12px',borderRadius:'12px',border: offerForm.returnTime?'2px solid #2ECC71':'1px solid #ddd',background: offerForm.returnTime?'#e6f9ed':'white'}}/>
            </div>
            <div style={{fontSize:'10px',color:'#666',display:'flex',gap:'8px',marginTop:'-8px'}}><span style={{flex:1,textAlign:'center'}}>Дата</span><span style={{flex:1,textAlign:'center'}}>Час тръгване</span><span style={{flex:1,textAlign:'center'}}>Очакв. пристигане</span></div>

            <div style={{display:'flex',gap:'8px'}}>
              <input placeholder={tr.brand} value={offerForm.carBrand} onChange={e=>setOfferForm({...offerForm,carBrand:e.target.value})} style={inputStyle(!!offerForm.carBrand.trim())}/>
              <input placeholder={tr.color} value={offerForm.carColor} onChange={e=>setOfferForm({...offerForm,carColor:e.target.value})} style={inputStyle(!!offerForm.carColor.trim())}/>
            </div>
            <input placeholder={tr.reg} value={offerForm.carReg} onChange={e=>setOfferForm({...offerForm,carReg:e.target.value.toUpperCase()})} style={inputStyle(!!offerForm.carReg.trim())}/>
            <input placeholder="Места" value={offerForm.seats} onChange={e=>setOfferForm({...offerForm,seats:e.target.value})} style={{padding:'12px',borderRadius:'12px',border:'1px solid #ddd'}}/>
            <textarea placeholder="Къде точно минаваш? През кои градове?" value={offerForm.message} onChange={e=>setOfferForm({...offerForm,message:e.target.value})} style={{padding:'12px',borderRadius:'12px',border:'1px solid #ddd',minHeight:'60px'}}/>

            {offerForm.type==='offer' && (
              <label style={{display:'flex',gap:'10px',background:offerForm.isDriver?'#e6f9ed':'#fff8e1',padding:'12px',borderRadius:'12px',border:`2px solid ${offerForm.isDriver?'#2ECC71':'#FFD60A'}`}}>
                <input type="checkbox" checked={offerForm.isDriver} onChange={e=>setOfferForm({...offerForm,isDriver:e.target.checked})}/>
                <span style={{fontSize:'12px'}}>{tr.driverConfirm}</span>
              </label>
            )}

            <button onClick={publishRide} disabled={!canPublish} style={{background:canPublish?'#2ECC71':'#ccc',color:canPublish?'#0F4C75':'#888',padding:'16px',borderRadius:'12px',fontWeight:'bold',border:'none',fontSize:'16px'}}>
              {editingRide? '💾 Запази промените' : (canPublish? 'Публикувай 🚗' : 'Попълни От, До и кола *')}
            </button>
          </div>
        )}

        {tab==='admin' && isAdmin && <div style={{padding:'12px'}}>Админ: {reports.length} сигнала<br/>{reports.map((rep,i)=><div key={i} style={{background:'#fff5f5',padding:'8px',marginTop:'6px',borderRadius:'8px',fontSize:'12px'}}>{rep.reportedName} {rep.reportedPhone} <button onClick={()=>{setReports(reports.filter((_,idx)=>idx!==i)); localStorage.setItem('vozime_reports',JSON.stringify(reports.filter((_,idx)=>idx!==i)));}} style={{marginLeft:'8px'}}>Отхвърли</button></div>)}</div>}
      </div>
    </main>
  );
}