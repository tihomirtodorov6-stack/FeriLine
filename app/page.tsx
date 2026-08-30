'use client';
import { useState, useEffect, useRef } from 'react';
const ADMIN_PHONES=['+447935463970','07935463970','447935463970'];

export default function Home(){
  const [users,setUsers]=useState<any[]>([]); const [currentUser,setCurrentUser]=useState<any>(null);
  const [mode,setMode]=useState<'login'|'register'|'app'>('login'); const [tab,setTab]=useState<'find'|'my'|'offer'|'admin'>('find');
  const [rides,setRides]=useState<any[]>([]); const [editingRide,setEditingRide]=useState<string|null>(null);
  const [form,setForm]=useState({firstName:'',lastName:'',phone:'',password:''});
  const [offerForm,setOfferForm]=useState({type:'offer',from:'',to:'',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:''});
  const [reports,setReports]=useState<any[]>([]); const [blockedPhones,setBlockedPhones]=useState<string[]>([]);
  const isAdmin = currentUser && ADMIN_PHONES.includes(currentUser.phone.replace(/\s/g,''));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const u=localStorage.getItem('vozime_users'); const cu=localStorage.getItem('vozime_current'); const r=localStorage.getItem('vozime_rides_noprice'); const rp=localStorage.getItem('vozime_reports'); const bp=localStorage.getItem('vozime_blocked');
    if(u) setUsers(JSON.parse(u)); if(cu){ setCurrentUser(JSON.parse(cu)); setMode('app'); }
    if(r) setRides(JSON.parse(r).filter((x:any)=>Date.now()-x.createdAt<48*60*60*1000));
    if(rp) setReports(JSON.parse(rp)); if(bp) setBlockedPhones(JSON.parse(bp));
  },[]);

  // Винаги скролва до последната обява отдолу
  useEffect(()=>{
    if(scrollRef.current){
      setTimeout(()=>{ scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight; }, 50);
    }
  },[tab, rides.length]);

  const saveRides=(nr:any[])=>{setRides(nr);localStorage.setItem('vozime_rides_noprice', JSON.stringify(nr));};
  const saveUsers=(nu:any[])=>{setUsers(nu);localStorage.setItem('vozime_users', JSON.stringify(nu));};

  const handleRegister=()=>{ const nu={id:Date.now().toString(),...form};saveUsers([...users,nu]);localStorage.setItem('vozime_current', JSON.stringify(nu));setCurrentUser(nu);setMode('app'); };
  const handleLogin=()=>{ const f=users.find(u=>u.phone===form.phone&&u.password===form.password); if(!f){alert('Грешен');return;} localStorage.setItem('vozime_current', JSON.stringify(f));setCurrentUser(f);setMode('app'); };
  const logout=()=>{localStorage.removeItem('vozime_current');setCurrentUser(null);setMode('login');};

  const carFilled = offerForm.carBrand.trim() && offerForm.carColor.trim() && offerForm.carReg.trim();
  const seatsFilled = offerForm.seats.trim() && parseInt(offerForm.seats)>0;
  const canPublish = offerForm.from.trim() && offerForm.to.trim() && seatsFilled && (offerForm.type==='request' || (carFilled && offerForm.isDriver));

  const publishRide=()=>{
    if(!canPublish){alert('Попълни От, До, кола и места + декларация!');return;}
    const now = Date.now();
    const carInfo = `${offerForm.carBrand} ${offerForm.carColor} ${offerForm.carReg.toUpperCase()}`;
    const nr={ id: editingRide||now.toString(), driverName:`${currentUser.firstName} ${currentUser.lastName}`, driverPhone:currentUser.phone, driverId:currentUser.id, from:offerForm.from, to:offerForm.to, time:offerForm.time, returnTime:offerForm.returnTime, date:offerForm.date, seats:parseInt(offerForm.seats)||1, message:offerForm.message, createdAt: editingRide? rides.find(r=>r.id===editingRide)!.createdAt : now, isFull:false, type:offerForm.type, isDriverVerified: offerForm.isDriver, carBrand:offerForm.carBrand, carColor:offerForm.carColor, carReg:offerForm.carReg.toUpperCase(), carInfo };
    if(editingRide){ saveRides(rides.map(r=>r.id===editingRide?nr:r)); setEditingRide(null); } else saveRides([...rides, nr]);
    setOfferForm({type:'offer',from:'',to:'',time:'09:30',returnTime:'12:30',date:'Днес',seats:'4',message:'',isDriver:false,carBrand:'',carColor:'',carReg:''}); 
    setTab('my');
  };
  const startEdit=(ride:any)=>{ setOfferForm({type:ride.type,from:ride.from,to:ride.to,time:ride.time,returnTime:ride.returnTime,date:ride.date,seats:ride.seats.toString(),message:ride.message,isDriver:ride.isDriverVerified,carBrand:ride.carBrand,carColor:ride.carColor,carReg:ride.carReg}); setEditingRide(ride.id); setTab('offer'); };

  // ФИКСИРАН ЕКРАН
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

  // Сортирани стари -> нови, за да е последната най-отдолу и да се вижда
  const visibleRides = rides.filter(r=>!blockedPhones.includes(r.driverPhone)).sort((a,b)=>a.createdAt - b.createdAt);
  const myRides = rides.filter(r=>r.driverId===currentUser?.id).sort((a,b)=>a.createdAt - b.createdAt);

  return (
    <main style={appStyle}>
      <div style={{background:'#0F4C75',color:'white',padding:'6px',textAlign:'center',fontSize:'11px',flexShrink:0}}>VoziMe.bg е част от <span style={{background:'#FFD60A',color:'black',padding:'2px 8px',borderRadius:'10px',fontWeight:'bold'}}>dropoffpay.co.uk</span></div>
      
      <header style={headerStyle}>
        <div style={{width:'36px',height:'36px',background:'#2ECC71',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🚗</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:'bold',fontSize:'15px',display:'flex',alignItems:'center',gap:'6px'}}>{currentUser?.firstName || 'Тихомир'} <span style={{background:'#FFD60A',color:'black',padding:'2px 8px',borderRadius:'10px',fontSize:'10px',fontWeight:'bold'}}>ADMIN</span></div>
          <div style={{fontSize:'10px',opacity:0.8}}>{currentUser?.phone || '+447935463970'}</div>
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
        {tab==='find' && <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px', paddingBottom:'100px'}}>{visibleRides.map((r:any)=><div key={r.id} style={{border:'1px solid #eee',borderRadius:'16px',padding:'14px',background:'white'}}><div style={{display:'flex',justifyContent:'space-between'}}><b>{r.from} → {r.to}</b><span style={{background:'#FF3B30',color:'white',fontSize:'10px',padding:'3px 8px',borderRadius:'8px'}}>НЕ Е БЕЗПЛАТНО</span></div><div style={{fontSize:'12px',color:'#666',marginTop:'4px'}}>🕒 Тръгване: {r.time} • Очакв.: {r.returnTime} • {r.date}</div><div style={{fontSize:'12px',marginTop:'4px'}}>🚗 {r.carInfo} • 👥 {r.seats} свободни места - колко пътници взимаш?</div><div style={{fontSize:'13px',marginTop:'8px'}}>👤 {r.driverName} ✓ ШОФЬОР</div></div>)}</div>}

        {tab==='my' && <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'12px', paddingBottom:'100px'}}>{myRides.map((r:any)=>(
          <div key={r.id} style={{border:'2px solid #0F4C75',borderRadius:'16px',padding:'14px',background:'#f8f9fa'}}>
            <div style={{fontWeight:'bold'}}>{r.from} → {r.to} • {r.carInfo}</div>
            <div style={{fontSize:'12px',color:'#555',marginTop:'4px'}}>🕒 Тръгване: {r.time} • Очакв. пристигане: {r.returnTime} • {r.date} • 👥 {r.seats} свободни места</div>
            <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
              <button onClick={()=>startEdit(r)} style={{flex:1,background:'#0F4C75',color:'white',border:'none',padding:'10px',borderRadius:'10px',fontWeight:'bold'}}>✏️ Редактирай</button>
              <button onClick={()=>saveRides(rides.filter(x=>x.id!==r.id))} style={{background:'#fff',border:'1px solid #ddd',padding:'10px 14px',borderRadius:'10px'}}>🗑️</button>
            </div>
          </div>
        ))}</div>}

        {tab==='offer' && (
          <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'12px', paddingBottom:'100px'}}>
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
              {editingRide? '💾 Запази промените' : (canPublish? 'Публикувай 🚗' : 'Попълни От, До, кола и места *')}
            </button>
          </div>
        )}
        {tab==='admin' && isAdmin && <div style={{padding:'12px', paddingBottom:'100px'}}>Админ - {reports.length} сигнала</div>}
      </div>
      <Footer/>
    </main>
  );
}