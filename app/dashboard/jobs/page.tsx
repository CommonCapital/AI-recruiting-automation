// app/(dashboard)/dashboard/jobs/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase, Plus, Sparkles, X, Loader2, ChevronDown,
  MapPin, Clock, DollarSign, Users, CheckCircle2, AlertCircle,
  Edit2, Trash2, MoreVertical, Globe, ListChecks, Search,
  ArrowRight, Building2, Star, Send, Link2, Copy,
  ExternalLink, ChevronLeft, Mail, UserCheck, Monitor, Award,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Job {
  id:string; title:string; department:string|null; location:string|null;
  jobType:string; salaryMin:number|null; salaryMax:number|null;
  salaryCurrency:string; description:string|null;
  responsibilities:string[]; requirements:string[]; niceToHave:string[];
  benefits:string[]; skills:string[];
  status:"draft"|"active"|"expired"|"closed";
  remote:boolean; matchedCandidateIds:string[];
  createdAt:string; updatedAt:string;
}
interface MatchedCandidate {
  id:string; fullName:string; jobTitle:string|null;
  skills:string[]; experienceYears:number|null; location:string|null;
  email:string|null; currentCompany:string|null;
  status?:string; matchScore?:number;
}
interface JobForm {
  title:string; department:string; location:string; jobType:string;
  salaryMin:string; salaryMax:string; salaryCurrency:string;
  description:string; responsibilities:string; requirements:string;
  niceToHave:string; benefits:string; skills:string; remote:boolean;
}
interface SendResult {
  candidateId:string; interviewId:string; interviewLink:string;
  emailSent:boolean; error?:string;
}

const EMPTY_FORM:JobForm = {
  title:"",department:"",location:"",jobType:"full_time",salaryMin:"",salaryMax:"",
  salaryCurrency:"USD",description:"",responsibilities:"",requirements:"",
  niceToHave:"",benefits:"",skills:"",remote:false,
};
const JOB_TYPE_LABELS:Record<string,string> = {
  full_time:"Full-time",part_time:"Part-time",contract:"Contract",
  freelance:"Freelance",internship:"Internship",
};

// ─── Status configs ────────────────────────────────────────────────────────────
const JOB_STATUS:Record<string,{label:string;pill_bg:string;pill_color:string;dot:string;border:string}> = {
  draft:   {label:"Draft",   pill_bg:"#f1f5f9",pill_color:"#475569",dot:"#94a3b8",border:"#e2e8f0"},
  active:  {label:"Active",  pill_bg:"#f0fdf4",pill_color:"#15803d",dot:"#22c55e",border:"#bbf7d0"},
  expired: {label:"Expired", pill_bg:"#fff1f2",pill_color:"#be123c",dot:"#fb7185",border:"#fecdd3"},
  closed:  {label:"Closed",  pill_bg:"#f5f3ff",pill_color:"#6d28d9",dot:"#a78bfa",border:"#ddd6fe"},
};
const CAND_STATUS:Record<string,{label:string;bg:string;color:string}> = {
  new:{label:"New",bg:"#eff6ff",color:"#1d4ed8"},
  reviewing:{label:"Reviewing",bg:"#fefce8",color:"#a16207"},
  interview_scheduled:{label:"Scheduled",bg:"#f5f3ff",color:"#6d28d9"},
  interviewed:{label:"Interviewed",bg:"#f0fdf4",color:"#15803d"},
  offer_sent:{label:"Offer Sent",bg:"#fff7ed",color:"#c2410c"},
  hired:{label:"Hired",bg:"#dcfce7",color:"#166534"},
  rejected:{label:"Rejected",bg:"#fef2f2",color:"#b91c1c"},
};

// Interview types with full config
const INTERVIEW_TYPES = [
  {id:"screening", label:"Screening Interview",  icon:<Monitor size={18} color="#2563eb"/>,
   desc:"Initial call — culture fit & basic qualifications", duration:"15–20 min",
   questions:5, color:"#2563eb", lightBg:"#eff6ff", border:"#bfdbfe"},
  {id:"tech",      label:"Technical Interview",  icon:<Award size={18} color="#7c3aed"/>,
   desc:"Deep dive — skills, problem solving & coding assessment", duration:"30–45 min",
   questions:8, color:"#7c3aed", lightBg:"#f5f3ff", border:"#ddd6fe"},
  {id:"hr_final",  label:"HR Final Interview",   icon:<UserCheck size={18} color="#0891b2"/>,
   desc:"Final round — values, expectations & compensation discussion", duration:"20–30 min",
   questions:6, color:"#0891b2", lightBg:"#ecfeff", border:"#a5f3fc"},
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtSalary(min:number|null,max:number|null,cur:string){
  if(!min&&!max)return null;
  const f=(n:number)=>n>=1000?`${Math.round(n/1000)}k`:String(n);
  if(min&&max)return `${cur} ${f(min)}–${f(max)}`;
  if(min)return `${cur} ${f(min)}+`;
  return `Up to ${cur} ${f(max!)}`;
}
function initials(n:string){return n.split(" ").map(w=>w[0]??"").join("").toUpperCase().slice(0,2);}
function avatarGrad(n:string){
  return["linear-gradient(135deg,#6366f1,#818cf8)","linear-gradient(135deg,#0ea5e9,#38bdf8)",
    "linear-gradient(135deg,#10b981,#34d399)","linear-gradient(135deg,#f59e0b,#fbbf24)",
    "linear-gradient(135deg,#ec4899,#f472b6)","linear-gradient(135deg,#8b5cf6,#a78bfa)"][n.charCodeAt(0)%6];
}
function scoreColor(s:number){
  if(s>=75)return{bg:"#f0fdf4",color:"#15803d",border:"#86efac"};
  if(s>=50)return{bg:"#fffbeb",color:"#92400e",border:"#fcd34d"};
  if(s>=25)return{bg:"#fff7ed",color:"#9a3412",border:"#fdba74"};
  return{bg:"#f8fafc",color:"#64748b",border:"#cbd5e1"};
}

// ─── MatchPanel (3-step) ──────────────────────────────────────────────────────
type PanelStep = "select"|"configure"|"done";

function MatchPanel({job,onClose}:{job:Job;onClose:()=>void}){
  const router = useRouter();

  // Fetch state
  const [matches,    setMatches]    = useState<MatchedCandidate[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchErr,   setFetchErr]   = useState("");
  const [scoreMin,   setScoreMin]   = useState(0);

  // Selection state
  const [selected,   setSelected]   = useState<Set<string>>(new Set());

  // Step state
  const [step,           setStep]           = useState<PanelStep>("select");
  const [interviewType,  setInterviewType]  = useState("screening");
  const [sending,        setSending]        = useState(false);
  const [sendErr,        setSendErr]        = useState("");
  const [results,        setResults]        = useState<SendResult[]>([]);
  const [summary,        setSummary]        = useState<{sent:number;failed:number;total:number}|null>(null);
  const [copiedId,       setCopiedId]       = useState<string|null>(null);

  useEffect(()=>{
    setLoading(true); setFetchErr(""); setMatches([]);
    fetch(`/api/jobs/${job.id}/match`,{method:"POST"})
      .then(async r=>{
        const j=await r.json();
        if(!r.ok||j.error)throw new Error(j.error??"Match failed");
        setMatches(j.matches??[]);
      })
      .catch(e=>setFetchErr(e.message??"Something went wrong"))
      .finally(()=>setLoading(false));
  },[job.id]);

  const visible      = matches.filter(c=>(c.matchScore??0)>=scoreMin);
  const allIds       = visible.map(c=>c.id);
  const allChecked   = allIds.length>0 && allIds.every(id=>selected.has(id));
  const someChecked  = allIds.some(id=>selected.has(id));
  const strongCount  = matches.filter(c=>(c.matchScore??0)>=60).length;
  const selectedCandidates = matches.filter(c=>selected.has(c.id));
  const selType      = INTERVIEW_TYPES.find(t=>t.id===interviewType)!;
  const baseUrl      = typeof window!=="undefined"?window.location.origin:"";

  function toggleAll(){
    if(allChecked){setSelected(p=>{const n=new Set(p);allIds.forEach(id=>n.delete(id));return n;});}
    else{setSelected(p=>{const n=new Set(p);allIds.forEach(id=>n.add(id));return n;});}
  }
  function toggleOne(id:string){
    setSelected(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n;});
  }

  async function handleSend(){
    setSending(true); setSendErr("");
    try{
      const res=await fetch(`/api/jobs/${job.id}/send-invites`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({candidateIds:Array.from(selected),interviewType}),
      });
      const json=await res.json();
      if(!res.ok)throw new Error(json.error);
      setResults(json.results??[]);
      setSummary(json.summary);
      setStep("done");
    }catch(e:any){setSendErr(e.message??"Failed to send");}
    finally{setSending(false);}
  }

  function copyLink(link:string,id:string){
    navigator.clipboard.writeText(link).then(()=>{
      setCopiedId(id);
      setTimeout(()=>setCopiedId(null),2000);
    });
  }

  // ── Shared backdrop ──────────────────────────────────────────────────────────
  const Backdrop = ({children}:{children:React.ReactNode})=>(
    <div style={{position:"fixed",inset:0,zIndex:300,background:"rgba(2,8,23,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      {children}
    </div>
  );

  // ── Shared gradient header ───────────────────────────────────────────────────
  const PanelHeader = ()=>(
    <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1e3a8a 55%,#312e81 100%)",padding:"20px 22px 18px",flexShrink:0}}>
      {/* Top row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          {step!=="select"&&(
            <button onClick={()=>setStep(step==="configure"?"select":"select")}
              style={{width:30,height:30,borderRadius:8,border:"1px solid rgba(255,255,255,0.18)",background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
              <ChevronLeft size={15} color="rgba(255,255,255,0.7)"/>
            </button>
          )}
          <div style={{width:42,height:42,borderRadius:12,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            {step==="select"?<Sparkles size={19} color="#a5f3fc"/>
              :step==="configure"?<Send size={19} color="#a5f3fc"/>
              :<CheckCircle2 size={19} color="#4ade80"/>}
          </div>
          <div>
            <h2 style={{fontSize:16,fontWeight:800,color:"#fff",margin:"0 0 2px",letterSpacing:"-0.01em"}}>
              {step==="select"?"AI Candidate Matches"
                :step==="configure"?"Configure Interview Invite"
                :"Invites Sent Successfully!"}
            </h2>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.5)",margin:0}}>
              {step==="select"?`${job.title}${job.department?` · ${job.department}`:""}`:
               step==="configure"?`${selected.size} candidate${selected.size!==1?"s":""} · ${job.title}`:
               `${summary?.sent??0} of ${summary?.total??0} emails delivered`}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
          <X size={15} color="rgba(255,255,255,0.7)"/>
        </button>
      </div>

      {/* Step progress bar */}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:step==="select"&&!loading&&!fetchErr&&matches.length>0?14:0}}>
        {(["select","configure","done"] as PanelStep[]).map((s,i)=>{
          const idx=["select","configure","done"].indexOf(step);
          const done=i<idx; const active=s===step;
          return(
            <div key={s} style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:20,height:20,borderRadius:"50%",background:done?"#4ade80":active?"#fff":"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}}>
                  {done?<span style={{fontSize:10,color:"#0f172a",fontWeight:900}}>✓</span>
                    :<span style={{fontSize:9,fontWeight:800,color:active?"#1e3a8a":"rgba(255,255,255,0.3)"}}>{i+1}</span>}
                </div>
                <span style={{fontSize:11,fontWeight:600,color:active?"#fff":done?"rgba(255,255,255,0.5)":"rgba(255,255,255,0.25)"}}>
                  {["Select","Configure","Done"][i]}
                </span>
              </div>
              {i<2&&<div style={{width:28,height:1,background:"rgba(255,255,255,0.12)"}}/>}
            </div>
          );
        })}
      </div>

      {/* Stats (select step only) */}
      {step==="select"&&!loading&&!fetchErr&&matches.length>0&&(
        <div style={{display:"flex",gap:8}}>
          {[{l:"Total Ranked",v:matches.length,bg:"rgba(255,255,255,0.08)",c:"#fff"},
            {l:"Strong Match",v:strongCount,bg:"rgba(34,197,94,0.15)",c:"#4ade80"},
            {l:"Selected",v:selected.size,bg:selected.size>0?"rgba(99,102,241,0.25)":"rgba(255,255,255,0.06)",c:selected.size>0?"#a5b4fc":"rgba(255,255,255,0.3)"}
          ].map(s=>(
            <div key={s.l} style={{flex:1,padding:"8px 10px",borderRadius:9,background:s.bg,border:"1px solid rgba(255,255,255,0.07)"}}>
              <p style={{fontSize:18,fontWeight:800,color:s.c,margin:0,lineHeight:1}}>{s.v}</p>
              <p style={{fontSize:9.5,color:"rgba(255,255,255,0.35)",margin:"3px 0 0",fontWeight:600,letterSpacing:"0.03em"}}>{s.l.toUpperCase()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ══ STEP 1: SELECT ══════════════════════════════════════════════════════════
  if(step==="select") return(
    <Backdrop>
      <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:660,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 40px 100px rgba(0,0,0,0.35)",overflow:"hidden"}}>
        <PanelHeader/>

        {/* Score filter */}
        {!loading&&!fetchErr&&visible.length>0&&(
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"9px 20px",borderBottom:"1px solid #f1f5f9",background:"#fafbfc",flexShrink:0}}>
            <span style={{fontSize:11.5,fontWeight:600,color:"#64748b",whiteSpace:"nowrap"}}>Min score:</span>
            <input type="range" min={0} max={80} step={10} value={scoreMin}
              onChange={e=>setScoreMin(Number(e.target.value))}
              style={{flex:1,accentColor:"#6366f1",cursor:"pointer"}}/>
            <span style={{fontSize:12,fontWeight:700,color:"#6366f1",minWidth:30,textAlign:"right"}}>{scoreMin}%</span>
            {scoreMin>0&&<button onClick={()=>setScoreMin(0)} style={{fontSize:11,color:"#94a3b8",background:"none",border:"none",cursor:"pointer",padding:0}}>Reset</button>}
          </div>
        )}

        {/* Select-all bar */}
        {!loading&&!fetchErr&&visible.length>0&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 20px",background:"#f8fafc",borderBottom:"1px solid #f1f5f9",flexShrink:0}}>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={toggleAll}>
              {/* Custom checkbox */}
              <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${allChecked||someChecked?"#6366f1":"#d1d5db"}`,background:allChecked?"#6366f1":"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                {allChecked&&<span style={{color:"#fff",fontSize:11,fontWeight:900,lineHeight:1}}>✓</span>}
                {!allChecked&&someChecked&&<div style={{width:8,height:2,background:"#6366f1",borderRadius:1}}/>}
              </div>
              <span style={{fontSize:12.5,fontWeight:600,color:"#334155"}}>
                {allChecked?`Deselect all ${visible.length}`:`Select all ${visible.length} visible`}
              </span>
            </label>
            {selected.size>0&&(
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,fontWeight:700,color:"#6366f1",background:"#eef2ff",padding:"3px 10px",borderRadius:99,border:"1px solid #c7d2fe"}}>
                  {selected.size} selected
                </span>
                <button onClick={()=>setSelected(new Set())} style={{fontSize:11,color:"#94a3b8",background:"none",border:"none",cursor:"pointer"}}>Clear</button>
              </div>
            )}
          </div>
        )}

        {/* Candidate list */}
        <div style={{flex:1,overflowY:"auto"}}>
          {/* Loading */}
          {loading&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"56px 24px",gap:18}}>
              <div style={{position:"relative"}}>
                <div style={{width:60,height:60,borderRadius:18,background:"linear-gradient(135deg,#e0e7ff,#ddd6fe)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Sparkles size={26} color="#6366f1"/>
                </div>
                <div style={{position:"absolute",inset:-3,borderRadius:21,border:"2px solid transparent",borderTopColor:"#6366f1",animation:"spin 0.9s linear infinite"}}/>
              </div>
              <div style={{textAlign:"center"}}>
                <p style={{fontSize:15,fontWeight:700,color:"#0f172a",margin:"0 0 5px"}}>Analyzing candidates…</p>
                <p style={{fontSize:12.5,color:"#94a3b8",margin:0,maxWidth:260,lineHeight:1.5}}>Gemini is ranking every candidate by skill overlap, experience & title</p>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading&&fetchErr&&(
            <div style={{margin:20,display:"flex",gap:10,padding:"13px 15px",borderRadius:12,background:"#fef2f2",border:"1px solid #fecaca"}}>
              <AlertCircle size={16} color="#ef4444" style={{flexShrink:0,marginTop:1}}/>
              <div><p style={{fontSize:13,fontWeight:700,color:"#dc2626",margin:"0 0 2px"}}>Match failed</p>
              <p style={{fontSize:12.5,color:"#f87171",margin:0}}>{fetchErr}</p></div>
            </div>
          )}

          {/* Empty */}
          {!loading&&!fetchErr&&matches.length===0&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"56px 24px",gap:12}}>
              <div style={{width:52,height:52,borderRadius:14,background:"#f8fafc",border:"1.5px dashed #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Users size={22} color="#cbd5e1"/>
              </div>
              <p style={{fontSize:14,fontWeight:700,color:"#475569",margin:0}}>No candidates in system</p>
              <p style={{fontSize:13,color:"#94a3b8",margin:0,textAlign:"center",maxWidth:260}}>Add candidates first, then run matching again</p>
            </div>
          )}

          {/* Filter empty */}
          {!loading&&!fetchErr&&matches.length>0&&visible.length===0&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"36px 24px",gap:8}}>
              <p style={{fontSize:13.5,fontWeight:600,color:"#475569",margin:0}}>No candidates above {scoreMin}% score</p>
              <button onClick={()=>setScoreMin(0)} style={{fontSize:12.5,color:"#6366f1",background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Lower threshold</button>
            </div>
          )}

          {/* Results */}
          {!loading&&!fetchErr&&visible.map((c,i)=>{
            const score=c.matchScore??0; const sc=scoreColor(score);
            const cs=c.status?CAND_STATUS[c.status]:null;
            const isSelected=selected.has(c.id); const isStrong=score>=60;
            const matchSkills=(c.skills??[]).filter(s=>(job.skills??[]).map(x=>x.toLowerCase()).includes(s.toLowerCase()));
            const otherSkills=(c.skills??[]).filter(s=>!matchSkills.includes(s));
            return(
              <div key={c.id} onClick={()=>toggleOne(c.id)}
                style={{display:"flex",gap:12,padding:"13px 20px",borderBottom:"1px solid #f8fafc",cursor:"pointer",background:isSelected?"#f5f3ff":"transparent",transition:"background 0.1s"}}
                onMouseEnter={e=>{if(!isSelected)(e.currentTarget as HTMLDivElement).style.background="#f8fafc";}}
                onMouseLeave={e=>{if(!isSelected)(e.currentTarget as HTMLDivElement).style.background="transparent";}}>

                {/* Checkbox */}
                <div style={{paddingTop:14,flexShrink:0}}>
                  <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${isSelected?"#6366f1":"#d1d5db"}`,background:isSelected?"#6366f1":"#fff",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s"}}>
                    {isSelected&&<span style={{color:"#fff",fontSize:11,fontWeight:900,lineHeight:1}}>✓</span>}
                  </div>
                </div>

                {/* Rank + avatar stack */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,flexShrink:0}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:i===0?"linear-gradient(135deg,#6366f1,#4f46e5)":i===1?"linear-gradient(135deg,#0ea5e9,#0284c7)":i===2?"linear-gradient(135deg,#10b981,#059669)":"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:i<3?"#fff":"#94a3b8"}}>
                    {i+1}
                  </div>
                  <div style={{width:40,height:40,borderRadius:"50%",background:avatarGrad(c.fullName),display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",boxShadow:isStrong?"0 0 0 2px #fff,0 0 0 4px #22c55e":isSelected?"0 0 0 2px #fff,0 0 0 3px #6366f1":"none",transition:"box-shadow 0.15s"}}>
                    {initials(c.fullName)}
                  </div>
                </div>

                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:3}}>
                    <span style={{fontSize:13.5,fontWeight:700,color:"#0f172a"}}>{c.fullName}</span>
                    {isStrong&&<span style={{fontSize:9.5,fontWeight:800,padding:"1px 7px",borderRadius:99,background:"linear-gradient(135deg,#16a34a,#15803d)",color:"#fff",letterSpacing:"0.03em"}}>STRONG</span>}
                    {cs&&<span style={{fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:99,background:cs.bg,color:cs.color}}>{cs.label}</span>}
                    {!c.email&&<span style={{fontSize:10,fontWeight:600,padding:"1px 7px",borderRadius:99,background:"#fef3c7",color:"#b45309"}}>No email</span>}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:6}}>
                    {c.jobTitle&&<span style={{fontSize:11.5,color:"#475569",display:"flex",alignItems:"center",gap:3}}><Briefcase size={10} color="#cbd5e1"/>{c.jobTitle}</span>}
                    {c.currentCompany&&<span style={{fontSize:11.5,color:"#64748b",display:"flex",alignItems:"center",gap:3}}><Building2 size={10} color="#cbd5e1"/>{c.currentCompany}</span>}
                    {c.experienceYears&&<span style={{fontSize:11.5,color:"#64748b"}}>{c.experienceYears}y exp</span>}
                    {c.location&&<span style={{fontSize:11.5,color:"#64748b",display:"flex",alignItems:"center",gap:3}}><MapPin size={10} color="#cbd5e1"/>{c.location}</span>}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                    {matchSkills.slice(0,4).map(s=><span key={s} style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:99,background:"#f0fdf4",color:"#15803d",border:"1px solid #86efac"}}>✓ {s}</span>)}
                    {otherSkills.slice(0,3).map(s=><span key={s} style={{fontSize:10,padding:"2px 7px",borderRadius:99,background:"#f8fafc",color:"#94a3b8",border:"1px solid #e2e8f0"}}>{s}</span>)}
                    {(c.skills?.length??0)>7&&<span style={{fontSize:10,color:"#cbd5e1",alignSelf:"center"}}>+{(c.skills?.length??0)-7}</span>}
                  </div>
                </div>

                {/* Score + profile link */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
                  <div style={{minWidth:44,padding:"4px 7px",borderRadius:8,background:sc.bg,border:`1px solid ${sc.border}`,textAlign:"center"}}>
                    <p style={{fontSize:14,fontWeight:800,color:sc.color,margin:0,lineHeight:1}}>{score}</p>
                    <p style={{fontSize:8.5,fontWeight:700,color:sc.color,margin:"1px 0 0",opacity:0.7,letterSpacing:"0.03em"}}>SCORE</p>
                  </div>
                  <button onClick={e=>{e.stopPropagation();router.push(`/dashboard/candidates/${c.id}`);}}
                    style={{fontSize:10.5,color:"#94a3b8",background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:3,padding:0,whiteSpace:"nowrap"}}>
                    <ExternalLink size={10}/>Profile
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {!loading&&!fetchErr&&(
          <div style={{padding:"12px 20px",borderTop:"1px solid #f1f5f9",background:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexShrink:0}}>
            <span style={{fontSize:12,color:"#94a3b8"}}>
              {selected.size===0?"Check candidates to select them":`${selected.size} candidate${selected.size!==1?"s":""} ready to invite`}
            </span>
            <button onClick={()=>selected.size>0&&setStep("configure")} disabled={selected.size===0}
              style={{display:"flex",alignItems:"center",gap:8,padding:"10px 22px",borderRadius:10,border:"none",
                background:selected.size>0?"linear-gradient(135deg,#4f46e5,#2563eb)":"#e2e8f0",
                color:selected.size>0?"#fff":"#94a3b8",fontSize:13.5,fontWeight:700,
                cursor:selected.size>0?"pointer":"not-allowed",
                boxShadow:selected.size>0?"0 3px 12px rgba(79,70,229,0.35)":"none",
                transition:"all 0.15s"}}>
              <Send size={14}/>
              Send Invite{selected.size!==1?"s":""}{selected.size>0?` (${selected.size})`:""}
            </button>
          </div>
        )}
      </div>
    </Backdrop>
  );

  // ══ STEP 2: CONFIGURE ═══════════════════════════════════════════════════════
  if(step==="configure") return(
    <Backdrop>
      <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:620,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 40px 100px rgba(0,0,0,0.35)",overflow:"hidden"}}>
        <PanelHeader/>

        <div style={{flex:1,overflowY:"auto",padding:"22px 24px",display:"flex",flexDirection:"column",gap:22}}>

          {/* Interview type selector */}
          <div>
            <p style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:"0.08em",textTransform:"uppercase",margin:"0 0 12px"}}>Select Interview Type</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {INTERVIEW_TYPES.map(t=>{
                const active=interviewType===t.id;
                return(
                  <button key={t.id} onClick={()=>setInterviewType(t.id)}
                    style={{display:"flex",alignItems:"center",gap:14,padding:"15px 16px",borderRadius:13,
                      border:`2px solid ${active?t.color:t.border}`,
                      background:active?t.lightBg:"#fff",cursor:"pointer",textAlign:"left",
                      transition:"all 0.15s",width:"100%",boxShadow:active?`0 2px 12px ${t.color}22`:"none"}}>
                    {/* Icon bubble */}
                    <div style={{width:46,height:46,borderRadius:13,background:active?t.color:t.lightBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s",boxShadow:active?`0 4px 12px ${t.color}40`:"none"}}>
                      {active
                        ?<div style={{filter:"brightness(10)"}}>{t.icon}</div>
                        :<div style={{color:t.color}}>{t.icon}</div>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                        <span style={{fontSize:14,fontWeight:700,color:active?t.color:"#0f172a"}}>{t.label}</span>
                        <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:active?t.color:"#f1f5f9",color:active?"#fff":"#64748b"}}>{t.questions} Qs</span>
                        <span style={{fontSize:10.5,color:"#94a3b8"}}>{t.duration}</span>
                      </div>
                      <p style={{fontSize:12.5,color:active?t.color:"#64748b",margin:0,lineHeight:1.5,opacity:active?0.85:1}}>{t.desc}</p>
                    </div>
                    {/* Radio dot */}
                    <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${active?t.color:"#d1d5db"}`,background:active?t.color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"}}>
                      {active&&<div style={{width:7,height:7,borderRadius:"50%",background:"#fff"}}/>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Candidates being invited */}
          <div>
            <p style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:"0.08em",textTransform:"uppercase",margin:"0 0 10px"}}>
              Sending To — {selectedCandidates.length} Candidate{selectedCandidates.length!==1?"s":""}
            </p>
            <div style={{background:"#f8fafc",borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden"}}>
              {selectedCandidates.slice(0,6).map((c,i)=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderBottom:i<Math.min(selectedCandidates.length,6)-1?"1px solid #f1f5f9":"none"}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:avatarGrad(c.fullName),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>
                    {initials(c.fullName)}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:600,color:"#0f172a",margin:0}}>{c.fullName}</p>
                    <p style={{fontSize:11.5,margin:0,color:c.email?"#64748b":"#f59e0b",fontStyle:c.email?"normal":"italic"}}>
                      {c.email?<><Mail size={10} style={{display:"inline",verticalAlign:"middle",marginRight:3}}/>{c.email}</>:"No email — invite will be skipped"}
                    </p>
                  </div>
                  <span style={{fontSize:10.5,fontWeight:700,color:scoreColor(c.matchScore??0).color,background:scoreColor(c.matchScore??0).bg,padding:"2px 8px",borderRadius:99,border:`1px solid ${scoreColor(c.matchScore??0).border}`,flexShrink:0}}>
                    {c.matchScore??0}%
                  </span>
                </div>
              ))}
              {selectedCandidates.length>6&&(
                <div style={{padding:"8px 14px",background:"#f1f5f9",borderTop:"1px solid #e2e8f0"}}>
                  <span style={{fontSize:12.5,color:"#64748b"}}>+{selectedCandidates.length-6} more candidates</span>
                </div>
              )}
            </div>
          </div>

          {/* Interview link preview */}
          <div style={{background:"linear-gradient(135deg,#f5f3ff,#eff6ff)",border:"1.5px solid #ddd6fe",borderRadius:13,padding:"14px 16px"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
              <Link2 size={13} color="#7c3aed"/>
              <span style={{fontSize:12,fontWeight:700,color:"#4c1d95"}}>Auto-generated Unique Links</span>
            </div>
            <p style={{fontSize:12.5,color:"#6d28d9",margin:"0 0 9px",lineHeight:1.6}}>
              Each candidate receives a private, personalised interview link. Links are created on send and expire after use.
            </p>
            <div style={{background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"8px 12px",fontFamily:"monospace",fontSize:11.5,color:"#7c3aed",border:"1px solid #ddd6fe",wordBreak:"break-all"}}>
              {baseUrl||"https://yourapp.com"}/interview/<span style={{opacity:0.5}}>[unique-session-id]</span>
            </div>
          </div>

          {sendErr&&(
            <div style={{display:"flex",gap:10,padding:"12px 14px",borderRadius:10,background:"#fef2f2",border:"1px solid #fecaca"}}>
              <AlertCircle size={14} color="#ef4444" style={{flexShrink:0,marginTop:1}}/>
              <div><p style={{fontSize:13,fontWeight:600,color:"#dc2626",margin:"0 0 2px"}}>Send failed</p>
              <p style={{fontSize:12,color:"#f87171",margin:0}}>{sendErr}</p></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{padding:"13px 24px",borderTop:"1px solid #f1f5f9",display:"flex",gap:10,flexShrink:0,background:"#fff"}}>
          <button onClick={()=>setStep("select")}
            style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid #e2e8f0",background:"#f8fafc",fontSize:13.5,fontWeight:600,color:"#475569",cursor:"pointer"}}>
            Back
          </button>
          <button onClick={handleSend} disabled={sending}
            style={{flex:2,padding:"11px",borderRadius:10,border:"none",
              background:sending?"#93c5fd":`linear-gradient(135deg,${selType?.color??'#2563eb'},#1d4ed8)`,
              fontSize:13.5,fontWeight:700,color:"#fff",cursor:sending?"not-allowed":"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              boxShadow:sending?"none":`0 4px 14px ${selType?.color??'#2563eb'}44`,
              transition:"all 0.15s"}}>
            {sending?<Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>:<Send size={14}/>}
            {sending?"Sending…":`Send ${selectedCandidates.length} ${selType?.label??"Interview"} Invite${selectedCandidates.length!==1?"s":""}`}
          </button>
        </div>
      </div>
    </Backdrop>
  );

  // ══ STEP 3: DONE ════════════════════════════════════════════════════════════
  const sentArr   = results.filter(r=>r.emailSent);
  const failedArr = results.filter(r=>!r.emailSent);

  return(
    <Backdrop>
      <div style={{background:"#fff",borderRadius:20,width:"100%",maxWidth:580,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 40px 100px rgba(0,0,0,0.35)",overflow:"hidden"}}>
        <PanelHeader/>

        <div style={{flex:1,overflowY:"auto",padding:"22px 24px",display:"flex",flexDirection:"column",gap:20}}>
          {/* Summary numbers */}
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1,padding:"18px 16px",borderRadius:13,background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"1px solid #bbf7d0",textAlign:"center"}}>
              <p style={{fontSize:32,fontWeight:900,color:"#15803d",margin:0,lineHeight:1}}>{sentArr.length}</p>
              <p style={{fontSize:12,fontWeight:600,color:"#16a34a",margin:"5px 0 0"}}>✓ Emails Sent</p>
            </div>
            {failedArr.length>0&&(
              <div style={{flex:1,padding:"18px 16px",borderRadius:13,background:"linear-gradient(135deg,#fef2f2,#fee2e2)",border:"1px solid #fecaca",textAlign:"center"}}>
                <p style={{fontSize:32,fontWeight:900,color:"#dc2626",margin:0,lineHeight:1}}>{failedArr.length}</p>
                <p style={{fontSize:12,fontWeight:600,color:"#ef4444",margin:"5px 0 0"}}>✗ Not Sent</p>
              </div>
            )}
          </div>

          {/* Per-candidate result cards */}
          <div>
            <p style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:"0.08em",textTransform:"uppercase",margin:"0 0 10px"}}>Interview Links Generated</p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {results.map(r=>{
                const cand=matches.find(c=>c.id===r.candidateId);
                const copied=copiedId===r.interviewId;
                return(
                  <div key={r.candidateId} style={{borderRadius:12,border:`1px solid ${r.emailSent?"#e2e8f0":"#fecaca"}`,overflow:"hidden"}}>
                    {/* Candidate row */}
                    <div style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:r.emailSent?"#f8fafc":"#fef2f2"}}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:cand?avatarGrad(cand.fullName):"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0}}>
                        {cand?initials(cand.fullName):"?"}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <p style={{fontSize:13,fontWeight:700,color:"#0f172a",margin:0}}>{cand?.fullName??r.candidateId}</p>
                        <p style={{fontSize:11.5,margin:0,color:r.emailSent?"#15803d":"#dc2626"}}>
                          {r.emailSent?"✓ Invite email sent successfully":r.error??"No email address on file"}
                        </p>
                      </div>
                      <span style={{fontSize:10.5,fontWeight:700,padding:"2px 9px",borderRadius:99,background:r.emailSent?"#dcfce7":"#fee2e2",color:r.emailSent?"#15803d":"#b91c1c",flexShrink:0}}>
                        {r.emailSent?"Sent":"Failed"}
                      </span>
                    </div>
                    {/* Link row */}
                    {r.interviewLink&&(
                      <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:"#f5f3ff",borderTop:"1px solid #ede9fe"}}>
                        <Link2 size={11} color="#7c3aed" style={{flexShrink:0}}/>
                        <span style={{fontSize:11,color:"#7c3aed",fontFamily:"monospace",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                          {r.interviewLink}
                        </span>
                        <button onClick={()=>copyLink(r.interviewLink,r.interviewId)}
                          style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,color:copied?"#15803d":"#6d28d9",background:"none",border:"none",cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>
                          {copied?<CheckCircle2 size={12} color="#15803d"/>:<Copy size={12}/>}
                          {copied?"Copied!":"Copy"}
                        </button>
                        <button onClick={()=>window.open(r.interviewLink,"_blank")}
                          style={{display:"flex",alignItems:"center",gap:3,fontSize:11,fontWeight:600,color:"#6d28d9",background:"none",border:"none",cursor:"pointer",flexShrink:0}}>
                          <ExternalLink size={11}/>Open
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:"13px 24px",borderTop:"1px solid #f1f5f9",display:"flex",gap:10,flexShrink:0,background:"#fff"}}>
          <button onClick={()=>{setStep("select");setSelected(new Set());setResults([]);setSummary(null);setSendErr("");}}
            style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid #e2e8f0",background:"#f8fafc",fontSize:13.5,fontWeight:600,color:"#475569",cursor:"pointer"}}>
            Select More
          </button>
          <button onClick={onClose}
            style={{flex:1,padding:"11px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",fontSize:13.5,fontWeight:700,color:"#fff",cursor:"pointer",boxShadow:"0 4px 14px rgba(37,99,235,0.3)"}}>
            Done
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────────────────
function Textarea({label,value,onChange,placeholder,rows=3,hint}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;rows?:number;hint?:string}){
  return(<div>
    <label style={{fontSize:11.5,fontWeight:600,color:"#627d98",display:"block",marginBottom:5}}>{label}</label>
    {hint&&<p style={{fontSize:11,color:"#bcccdc",margin:"0 0 5px"}}>{hint}</p>}
    <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{width:"100%",padding:"9px 11px",borderRadius:9,border:"1.5px solid #e5eaf0",fontSize:13,color:"#334e68",resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.6,background:"#fafbfc"}}
      onFocus={e=>(e.currentTarget.style.borderColor="#3b82f6")}
      onBlur={e=>(e.currentTarget.style.borderColor="#e5eaf0")}/>
  </div>);
}
function Input({label,value,onChange,placeholder,type="text",half=false}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;type?:string;half?:boolean}){
  return(<div style={half?{flex:1}:{}}>
    <label style={{fontSize:11.5,fontWeight:600,color:"#627d98",display:"block",marginBottom:5}}>{label}</label>
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{width:"100%",padding:"9px 11px",borderRadius:9,border:"1.5px solid #e5eaf0",fontSize:13,color:"#334e68",outline:"none",boxSizing:"border-box",background:"#fafbfc"}}
      onFocus={e=>(e.currentTarget.style.borderColor="#3b82f6")}
      onBlur={e=>(e.currentTarget.style.borderColor="#e5eaf0")}/>
  </div>);
}
function SLabel({children}:{children:React.ReactNode}){
  return <p style={{fontSize:10.5,fontWeight:700,color:"#bcccdc",letterSpacing:"0.07em",textTransform:"uppercase",margin:"4px 0 12px"}}>{children}</p>;
}

// ─── Add/Edit Job Dialog ──────────────────────────────────────────────────────
function JobDialog({editJob,onClose,onSaved}:{editJob?:Job;onClose:()=>void;onSaved:(j:Job)=>void}){
  const isEdit=!!editJob;
  const [aiTitle,setAiTitle]=useState(editJob?.title??"");
  const [aiLoading,setAiLoading]=useState(false);
  const [aiError,setAiError]=useState("");
  const [aiFilled,setAiFilled]=useState(false);
  const [form,setForm]=useState<JobForm>(editJob?{
    title:editJob.title,department:editJob.department??"",location:editJob.location??"",
    jobType:editJob.jobType,salaryMin:editJob.salaryMin!=null?String(editJob.salaryMin):"",
    salaryMax:editJob.salaryMax!=null?String(editJob.salaryMax):"",salaryCurrency:editJob.salaryCurrency??"USD",
    description:editJob.description??"",responsibilities:(editJob.responsibilities??[]).join("\n"),
    requirements:(editJob.requirements??[]).join("\n"),niceToHave:(editJob.niceToHave??[]).join("\n"),
    benefits:(editJob.benefits??[]).join("\n"),skills:(editJob.skills??[]).join(", "),remote:editJob.remote,
  }:EMPTY_FORM);
  const [saving,setSaving]=useState(false);
  const [saveErr,setSaveErr]=useState("");
  const f=(k:keyof JobForm)=>(v:string|boolean)=>setForm(p=>({...p,[k]:v}));

  async function handleAiFill(){
    if(!aiTitle.trim()){setAiError("Enter a job title first.");return;}
    setAiLoading(true);setAiError("");setAiFilled(false);
    try{
      const res=await fetch("/api/jobs/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:aiTitle})});
      const json=await res.json();
      if(!res.ok)throw new Error(json.error);
      const d=json.data;
      setForm({title:d.title??aiTitle,department:d.department??"",location:d.location??"",jobType:d.jobType??"full_time",
        salaryMin:d.salaryMin!=null?String(d.salaryMin):"",salaryMax:d.salaryMax!=null?String(d.salaryMax):"",
        salaryCurrency:d.salaryCurrency??"USD",description:d.description??"",
        responsibilities:Array.isArray(d.responsibilities)?d.responsibilities.join("\n"):"",
        requirements:Array.isArray(d.requirements)?d.requirements.join("\n"):"",
        niceToHave:Array.isArray(d.niceToHave)?d.niceToHave.join("\n"):"",
        benefits:Array.isArray(d.benefits)?d.benefits.join("\n"):"",
        skills:Array.isArray(d.skills)?d.skills.join(", "):"",remote:d.remote??false});
      setAiFilled(true);
    }catch(e:any){setAiError(e.message??"AI fill failed");}
    finally{setAiLoading(false);}
  }

  function toArray(s:string){return s.split("\n").map(l=>l.trim()).filter(Boolean);}
  async function handleSave(status:"draft"|"active"="draft"){
    if(!form.title.trim()){setSaveErr("Job title is required.");return;}
    setSaving(true);setSaveErr("");
    try{
      const payload={title:form.title.trim(),department:form.department||null,location:form.location||null,
        jobType:form.jobType,salaryMin:form.salaryMin?Number(form.salaryMin):null,salaryMax:form.salaryMax?Number(form.salaryMax):null,
        salaryCurrency:form.salaryCurrency||"USD",description:form.description||null,
        responsibilities:toArray(form.responsibilities),requirements:toArray(form.requirements),
        niceToHave:toArray(form.niceToHave),benefits:toArray(form.benefits),
        skills:form.skills?form.skills.split(",").map(s=>s.trim()).filter(Boolean):[],
        remote:form.remote,status};
      const url=isEdit?`/api/jobs/${editJob!.id}`:"/api/jobs";
      const res=await fetch(url,{method:isEdit?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const json=await res.json();
      if(!res.ok)throw new Error(json.error);
      onSaved(json.job);
    }catch(e:any){setSaveErr(e.message??"Save failed");setSaving(false);}
  }

  return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(10,31,51,0.5)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:700,maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(10,31,51,0.18)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:"1px solid #f0f4f8",position:"sticky",top:0,background:"#fff",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:9,background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center"}}><Briefcase size={16} color="#3b82f6"/></div>
            <div><h2 style={{fontSize:15,fontWeight:700,color:"#0a1f33",margin:0}}>{isEdit?"Edit Job":"New Job Posting"}</h2>
            <p style={{fontSize:11.5,color:"#829ab1",margin:0}}>Fill manually or let AI generate</p></div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:"1px solid #e5eaf0",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={14} color="#627d98"/></button>
        </div>
        <div style={{padding:"20px 24px",display:"flex",flexDirection:"column",gap:20}}>
          <div style={{borderRadius:14,border:"1.5px solid #e0e7ff",background:"linear-gradient(135deg,#f5f3ff,#eff6ff)",padding:"16px 18px"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:12}}>
              <Sparkles size={14} color="#7c3aed"/>
              <span style={{fontSize:12.5,fontWeight:700,color:"#4c1d95"}}>AI Quick Fill</span>
              <span style={{fontSize:11,color:"#a78bfa"}}>— type a title, AI writes the rest</span>
            </div>
            <div style={{display:"flex",gap:8}}>
              <input value={aiTitle} onChange={e=>setAiTitle(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAiFill()}
                placeholder="e.g. Senior Backend Engineer"
                style={{flex:1,padding:"9px 12px",borderRadius:9,border:"1.5px solid #c4b5fd",fontSize:13,color:"#334e68",outline:"none",background:"#fff"}}
                onFocus={e=>(e.currentTarget.style.borderColor="#7c3aed")}
                onBlur={e=>(e.currentTarget.style.borderColor="#c4b5fd")}/>
              <button onClick={handleAiFill} disabled={aiLoading}
                style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:9,border:"none",background:aiLoading?"#c4b5fd":"linear-gradient(135deg,#7c3aed,#6366f1)",color:"#fff",fontSize:13,fontWeight:600,cursor:aiLoading?"not-allowed":"pointer",boxShadow:aiLoading?"none":"0 3px 10px rgba(124,58,237,0.3)"}}>
                {aiLoading?<Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>:<Sparkles size={14}/>}
                {aiLoading?"Generating…":"Generate"}
              </button>
            </div>
            {aiError&&<p style={{fontSize:12,color:"#dc2626",margin:"8px 0 0"}}>{aiError}</p>}
            {aiFilled&&<div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}><CheckCircle2 size={13} color="#10b981"/><span style={{fontSize:12,color:"#059669"}}>AI filled the form — review & edit below</span></div>}
          </div>

          <div><SLabel>Basic Info</SLabel>
            <div style={{display:"flex",flexDirection:"column",gap:11}}>
              <Input label="Job Title *" value={form.title} onChange={f("title")} placeholder="Senior Frontend Engineer"/>
              <div style={{display:"flex",gap:11}}><Input label="Department" value={form.department} onChange={f("department")} placeholder="Engineering" half/><Input label="Location" value={form.location} onChange={f("location")} placeholder="New York, USA" half/></div>
              <div style={{display:"flex",gap:11,alignItems:"flex-end"}}>
                <div style={{flex:1}}>
                  <label style={{fontSize:11.5,fontWeight:600,color:"#627d98",display:"block",marginBottom:5}}>Job Type</label>
                  <div style={{position:"relative"}}>
                    <select value={form.jobType} onChange={e=>f("jobType")(e.target.value)}
                      style={{width:"100%",appearance:"none",padding:"9px 28px 9px 11px",borderRadius:9,border:"1.5px solid #e5eaf0",fontSize:13,color:"#334e68",background:"#fafbfc",cursor:"pointer",outline:"none"}}>
                      {Object.entries(JOB_TYPE_LABELS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                    </select>
                    <ChevronDown size={12} color="#bcccdc" style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,paddingBottom:2}}>
                  <button onClick={()=>f("remote")(!form.remote)}
                    style={{width:38,height:22,borderRadius:99,border:"none",background:form.remote?"#3b82f6":"#d9e2ec",cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
                    <span style={{position:"absolute",top:2,left:form.remote?18:2,width:18,height:18,borderRadius:"50%",background:"#fff",boxShadow:"0 1px 3px rgba(0,0,0,0.2)",transition:"left 0.2s",display:"block"}}/>
                  </button>
                  <span style={{fontSize:12.5,fontWeight:600,color:form.remote?"#1d4ed8":"#829ab1"}}>Remote</span>
                </div>
              </div>
            </div>
          </div>

          <div><SLabel>Compensation</SLabel>
            <div style={{display:"flex",gap:11}}>
              <Input label="Min Salary" value={form.salaryMin} onChange={f("salaryMin")} placeholder="80000" type="number" half/>
              <Input label="Max Salary" value={form.salaryMax} onChange={f("salaryMax")} placeholder="120000" type="number" half/>
              <div style={{flex:"0 0 90px"}}>
                <label style={{fontSize:11.5,fontWeight:600,color:"#627d98",display:"block",marginBottom:5}}>Currency</label>
                <div style={{position:"relative"}}>
                  <select value={form.salaryCurrency} onChange={e=>f("salaryCurrency")(e.target.value)}
                    style={{width:"100%",appearance:"none",padding:"9px 24px 9px 9px",borderRadius:9,border:"1.5px solid #e5eaf0",fontSize:13,color:"#334e68",background:"#fafbfc",cursor:"pointer",outline:"none"}}>
                    {["USD","EUR","GBP","CAD","AUD"].map(c=><option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={11} color="#bcccdc" style={{position:"absolute",right:7,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>
                </div>
              </div>
            </div>
          </div>

          <div><SLabel>Description</SLabel><Textarea label="Job Description" value={form.description} onChange={f("description")} placeholder="Overview of the role…" rows={4}/></div>
          <div><SLabel>Responsibilities & Requirements</SLabel>
            <div style={{display:"flex",flexDirection:"column",gap:11}}>
              <Textarea label="Responsibilities" value={form.responsibilities} onChange={f("responsibilities")} placeholder={"Lead architecture decisions\nMentor engineers"} rows={4} hint="One per line"/>
              <Textarea label="Requirements"     value={form.requirements}     onChange={f("requirements")}     placeholder={"5+ years React\nStrong TypeScript"}         rows={4} hint="One per line"/>
              <Textarea label="Nice to Have"     value={form.niceToHave}       onChange={f("niceToHave")}       placeholder={"Next.js experience"}                        rows={3} hint="One per line"/>
              <Textarea label="Benefits"         value={form.benefits}         onChange={f("benefits")}         placeholder={"Health & dental\nUnlimited PTO"}            rows={3} hint="One per line"/>
            </div>
          </div>
          <div><SLabel>Skills</SLabel><Input label="Required Skills (comma separated)" value={form.skills} onChange={f("skills")} placeholder="React, TypeScript, Node.js"/></div>

          {saveErr&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 13px",borderRadius:9,background:"#fee2e2",border:"1px solid #fca5a5"}}><AlertCircle size={13} color="#ef4444"/><span style={{fontSize:12.5,color:"#dc2626"}}>{saveErr}</span></div>}
          <div style={{display:"flex",gap:10,paddingBottom:4}}>
            <button onClick={onClose} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid #e5eaf0",background:"#f8fafc",fontSize:13.5,fontWeight:600,color:"#486581",cursor:"pointer"}}>Cancel</button>
            <button onClick={()=>handleSave("draft")} disabled={saving} style={{flex:1,padding:"11px",borderRadius:10,border:"1.5px solid #3b82f6",background:"#fff",fontSize:13.5,fontWeight:600,color:"#2563eb",cursor:saving?"not-allowed":"pointer"}}>Save as Draft</button>
            <button onClick={()=>handleSave("active")} disabled={saving}
              style={{flex:2,padding:"11px",borderRadius:10,border:"none",background:saving?"#93c5fd":"linear-gradient(135deg,#2563eb,#1d4ed8)",fontSize:13.5,fontWeight:600,color:"#fff",cursor:saving?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:saving?"none":"0 4px 14px rgba(37,99,235,0.3)"}}>
              {saving?<Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>:<CheckCircle2 size={14}/>}
              {saving?"Saving…":isEdit?"Update & Publish":"Publish Job"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({job,onStatusChange,onEdit,onDelete,onMatch}:{
  job:Job;onStatusChange:(id:string,s:Job["status"])=>void;
  onEdit:(j:Job)=>void;onDelete:(j:Job)=>void;onMatch:(j:Job)=>void;
}){
  const [menuOpen,setMenuOpen]=useState(false);
  const [statusOpen,setStatusOpen]=useState(false);
  const sc=JOB_STATUS[job.status]??JOB_STATUS.draft;
  const salary=fmtSalary(job.salaryMin,job.salaryMax,job.salaryCurrency);
  const headerGrad:Record<string,string>={
    draft:"linear-gradient(135deg,#334155,#475569)",
    active:"linear-gradient(135deg,#15803d,#16a34a 50%,#22c55e)",
    expired:"linear-gradient(135deg,#be123c,#e11d48 50%,#fb7185)",
    closed:"linear-gradient(135deg,#4c1d95,#6d28d9 50%,#8b5cf6)",
  };

  return(
    <div style={{background:"#fff",border:`1px solid ${sc.border}`,borderRadius:16,overflow:"hidden",display:"flex",flexDirection:"column",transition:"box-shadow 0.2s,transform 0.15s"}}
      onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow="0 8px 32px rgba(15,23,42,0.12)";(e.currentTarget as HTMLDivElement).style.transform="translateY(-2px)";}}
      onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.boxShadow="none";(e.currentTarget as HTMLDivElement).style.transform="translateY(0)";}}>

      {/* Coloured header */}
      <div style={{background:headerGrad[job.status]??headerGrad.draft,padding:"15px 15px 13px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.06)",top:-20,right:-20,pointerEvents:"none"}}/>
        <div style={{position:"absolute",width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,0.04)",bottom:-10,right:30,pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,position:"relative"}}>
          <div style={{flex:1,minWidth:0}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10,fontWeight:800,padding:"2px 9px",borderRadius:99,background:"rgba(255,255,255,0.18)",color:"rgba(255,255,255,0.9)",marginBottom:7,letterSpacing:"0.05em",border:"1px solid rgba(255,255,255,0.15)"}}>
              <span style={{width:4,height:4,borderRadius:"50%",background:"rgba(255,255,255,0.8)",display:"block"}}/>{sc.label.toUpperCase()}
            </span>
            <h3 style={{fontSize:15,fontWeight:800,color:"#fff",margin:0,lineHeight:1.3,letterSpacing:"-0.01em",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{job.title}</h3>
            {job.department&&<p style={{fontSize:12,color:"rgba(255,255,255,0.6)",margin:"4px 0 0"}}>{job.department}</p>}
          </div>
          <div style={{position:"relative",flexShrink:0}}>
            <button onClick={()=>setMenuOpen(o=>!o)}
              style={{width:28,height:28,borderRadius:7,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <MoreVertical size={14} color="rgba(255,255,255,0.8)"/>
            </button>
            {menuOpen&&(
              <><div style={{position:"fixed",inset:0,zIndex:10}} onClick={()=>setMenuOpen(false)}/>
              <div style={{position:"absolute",right:0,top:32,zIndex:20,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 8px 24px rgba(10,31,51,0.12)",overflow:"hidden",minWidth:140}}>
                <button onClick={()=>{setMenuOpen(false);onEdit(job);}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"10px 14px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#334e68",fontWeight:500}}><Edit2 size={13} color="#94a3b8"/>Edit</button>
                <button onClick={()=>{setMenuOpen(false);onDelete(job);}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"10px 14px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#ef4444",fontWeight:500}}><Trash2 size={13}/>Delete</button>
              </div></>
            )}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{padding:"13px 15px",flex:1,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
          {job.location&&<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11.5,color:"#475569",padding:"3px 9px",borderRadius:8,background:"#f8fafc",border:"1px solid #e2e8f0"}}><MapPin size={10} color="#cbd5e1"/>{job.location}</span>}
          {job.remote&&<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11.5,color:"#1d4ed8",padding:"3px 9px",borderRadius:8,background:"#eff6ff",border:"1px solid #bfdbfe"}}><Globe size={10}/>Remote</span>}
          <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11.5,color:"#475569",padding:"3px 9px",borderRadius:8,background:"#f8fafc",border:"1px solid #e2e8f0"}}><Clock size={10} color="#cbd5e1"/>{JOB_TYPE_LABELS[job.jobType]??job.jobType}</span>
          {salary&&<span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11.5,color:"#15803d",padding:"3px 9px",borderRadius:8,background:"#f0fdf4",border:"1px solid #bbf7d0"}}><DollarSign size={10}/>{salary}</span>}
        </div>

        {job.skills?.length>0&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
            {job.skills.slice(0,5).map(s=><span key={s} style={{fontSize:10.5,fontWeight:600,padding:"2px 9px",borderRadius:99,background:"#f1f5f9",color:"#475569",border:"1px solid #e2e8f0"}}>{s}</span>)}
            {job.skills.length>5&&<span style={{fontSize:10.5,color:"#94a3b8",alignSelf:"center"}}>+{job.skills.length-5}</span>}
          </div>
        )}

        {(job.requirements?.length>0||job.responsibilities?.length>0)&&(
          <div style={{display:"flex",gap:12}}>
            {job.requirements?.length>0&&<span style={{fontSize:11.5,color:"#64748b",display:"flex",alignItems:"center",gap:4}}><ListChecks size={11} color="#94a3b8"/>{job.requirements.length} requirements</span>}
            {job.responsibilities?.length>0&&<span style={{fontSize:11.5,color:"#64748b",display:"flex",alignItems:"center",gap:4}}><CheckCircle2 size={11} color="#94a3b8"/>{job.responsibilities.length} tasks</span>}
          </div>
        )}

        {job.matchedCandidateIds?.length>0&&(
          <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",borderRadius:8,background:"#faf5ff",border:"1px solid #ede9fe"}}>
            <Star size={11} color="#a78bfa" style={{flexShrink:0}}/>
            <span style={{fontSize:11.5,fontWeight:600,color:"#7c3aed"}}>{job.matchedCandidateIds.length} candidates matched last run</span>
          </div>
        )}

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid #f1f5f9",marginTop:"auto"}}>
          <div style={{position:"relative"}}>
            <button onClick={()=>setStatusOpen(o=>!o)}
              style={{display:"inline-flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:sc.pill_bg,border:`1.5px solid ${sc.border}`,cursor:"pointer"}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:sc.dot,display:"block"}}/>
              <span style={{fontSize:11,fontWeight:700,color:sc.pill_color}}>{sc.label}</span>
              <ChevronDown size={10} color={sc.dot}/>
            </button>
            {statusOpen&&(
              <><div style={{position:"fixed",inset:0,zIndex:10}} onClick={()=>setStatusOpen(false)}/>
              <div style={{position:"absolute",left:0,top:30,zIndex:20,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,boxShadow:"0 8px 24px rgba(10,31,51,0.12)",overflow:"hidden",minWidth:150}}>
                {Object.entries(JOB_STATUS).map(([k,v])=>(
                  <button key={k} onClick={()=>{setStatusOpen(false);onStatusChange(job.id,k as Job["status"]);}}
                    style={{width:"100%",display:"flex",alignItems:"center",gap:9,padding:"9px 14px",border:"none",background:k===job.status?v.pill_bg:"none",cursor:"pointer"}}>
                    <span style={{width:8,height:8,borderRadius:"50%",background:v.dot,display:"block",flexShrink:0}}/>
                    <span style={{fontSize:12.5,color:v.pill_color,fontWeight:k===job.status?700:500}}>{v.label}</span>
                  </button>
                ))}
              </div></>
            )}
          </div>
          <span style={{fontSize:11,color:"#94a3b8"}}>{new Date(job.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* AI Match CTA */}
      <button onClick={()=>onMatch(job)}
        style={{margin:"0 12px 12px",padding:"9px 0",borderRadius:10,border:"1.5px solid #ddd6fe",background:"linear-gradient(135deg,#faf5ff,#f0f9ff)",fontSize:12.5,fontWeight:700,color:"#6d28d9",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all 0.15s"}}
        onMouseEnter={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.background="linear-gradient(135deg,#ede9fe,#dbeafe)";b.style.borderColor="#c4b5fd";b.style.boxShadow="0 2px 8px rgba(124,58,237,0.18)";}}
        onMouseLeave={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.background="linear-gradient(135deg,#faf5ff,#f0f9ff)";b.style.borderColor="#ddd6fe";b.style.boxShadow="none";}}>
        <Sparkles size={13} color="#7c3aed"/>View Matching Candidates
      </button>
    </div>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({title,onConfirm,onCancel,loading}:{title:string;loading:boolean;onConfirm:()=>void;onCancel:()=>void}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(10,31,51,0.45)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:16,padding:28,maxWidth:400,width:"100%",boxShadow:"0 24px 64px rgba(10,31,51,0.18)"}}>
        <div style={{width:48,height:48,borderRadius:12,background:"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}><Trash2 size={20} color="#ef4444"/></div>
        <h3 style={{fontSize:16,fontWeight:700,color:"#0a1f33",margin:"0 0 8px"}}>Delete Job Posting</h3>
        <p style={{fontSize:13.5,color:"#627d98",margin:"0 0 24px",lineHeight:1.6}}>Delete <strong style={{color:"#334e68"}}>{title}</strong>? This cannot be undone.</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"10px",borderRadius:10,border:"1px solid #e5eaf0",background:"#f8fafc",fontSize:13.5,fontWeight:600,color:"#486581",cursor:"pointer"}}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:"#ef4444",fontSize:13.5,fontWeight:600,color:"#fff",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {loading?<Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>:<Trash2 size={14}/>}
            {loading?"Deleting…":"Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JobsPage(){
  const [allJobs,setAllJobs]=useState<Job[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [statusFilter,setFilter]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [editJob,setEditJob]=useState<Job|undefined>(undefined);
  const [toDelete,setToDelete]=useState<Job|null>(null);
  const [deleting,setDeleting]=useState(false);
  const [matchJob,setMatchJob]=useState<Job|null>(null);

  const fetchJobs=useCallback(async()=>{
    setLoading(true);
    try{const r=await fetch("/api/jobs");const j=await r.json();setAllJobs(j.jobs??[]);}
    finally{setLoading(false);}
  },[]);
  useEffect(()=>{fetchJobs();},[fetchJobs]);

  const filtered=allJobs.filter(j=>{
    const ms=statusFilter==="all"||j.status===statusFilter;
    const q=search.toLowerCase();
    const mq=!q||[j.title,j.department,j.location].some(v=>v?.toLowerCase().includes(q));
    return ms&&mq;
  });

  function onSaved(j:Job){
    setAllJobs(prev=>{const e=prev.find(p=>p.id===j.id);return e?prev.map(p=>p.id===j.id?j:p):[j,...prev];});
    setShowAdd(false);setEditJob(undefined);
  }
  async function handleStatusChange(id:string,status:Job["status"]){
    const res=await fetch(`/api/jobs/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})});
    const json=await res.json();
    if(json.job)setAllJobs(prev=>prev.map(j=>j.id===id?json.job:j));
  }
  async function confirmDelete(){
    if(!toDelete)return;setDeleting(true);
    await fetch(`/api/jobs/${toDelete.id}`,{method:"DELETE"});
    setAllJobs(prev=>prev.filter(j=>j.id!==toDelete.id));
    setToDelete(null);setDeleting(false);
  }

  const stats={total:allJobs.length,active:allJobs.filter(j=>j.status==="active").length,draft:allJobs.filter(j=>j.status==="draft").length};

  return(
    <div style={{padding:"24px 28px",fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:800,color:"#0a1f33",margin:0}}>Job Postings</h1>
          <p style={{fontSize:13,color:"#829ab1",margin:"3px 0 0"}}>{stats.active} active · {stats.draft} draft · {stats.total} total</p>
        </div>
        <button onClick={()=>setShowAdd(true)}
          style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"#fff",fontSize:13.5,fontWeight:600,cursor:"pointer",boxShadow:"0 3px 12px rgba(37,99,235,0.3)",transition:"transform 0.15s,box-shadow 0.15s"}}
          onMouseEnter={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.transform="translateY(-1px)";b.style.boxShadow="0 6px 20px rgba(37,99,235,0.38)";}}
          onMouseLeave={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.transform="translateY(0)";b.style.boxShadow="0 3px 12px rgba(37,99,235,0.3)";}}>
          <Plus size={15}/> Add New Job
        </button>
      </div>

      {/* Status pills */}
      <div style={{display:"flex",gap:8,marginBottom:18,flexWrap:"wrap"}}>
        <button onClick={()=>setFilter("all")}
          style={{padding:"5px 14px",borderRadius:99,border:`1.5px solid ${statusFilter==="all"?"#6366f1":"#e2e8f0"}`,background:statusFilter==="all"?"#eef2ff":"#fff",fontSize:12,fontWeight:600,color:statusFilter==="all"?"#4f46e5":"#64748b",cursor:"pointer",transition:"all 0.15s"}}>
          All <span style={{fontWeight:700,color:statusFilter==="all"?"#6366f1":"#94a3b8"}}>{allJobs.length}</span>
        </button>
        {Object.entries(JOB_STATUS).map(([k,v])=>{
          const count=allJobs.filter(j=>j.status===k).length;
          const isActive=statusFilter===k;
          return(
            <button key={k} onClick={()=>setFilter(isActive?"all":k)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"5px 14px",borderRadius:99,border:`1.5px solid ${isActive?v.dot:v.border}`,background:isActive?v.pill_bg:"#fff",cursor:"pointer",transition:"all 0.15s"}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:v.dot,display:"block"}}/>
              <span style={{fontSize:12,fontWeight:600,color:isActive?v.pill_color:"#64748b"}}>{v.label}</span>
              <span style={{fontSize:11,fontWeight:700,color:isActive?v.dot:"#cbd5e1"}}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20,maxWidth:380,background:"#fff",border:"1px solid #e2e8f0",borderRadius:9,padding:"8px 12px",boxShadow:"0 1px 4px rgba(15,23,42,0.04)"}}>
        <Search size={13} color="#cbd5e1"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search jobs…"
          style={{border:"none",outline:"none",fontSize:13,color:"#334e68",width:"100%",background:"transparent"}}/>
        {search&&<button onClick={()=>setSearch("")} style={{border:"none",background:"none",cursor:"pointer",display:"flex",padding:0}}><X size={13} color="#cbd5e1"/></button>}
      </div>

      {loading?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:80,gap:10}}>
          <Loader2 size={22} color="#6366f1" style={{animation:"spin 1s linear infinite"}}/>
          <span style={{fontSize:13.5,color:"#94a3b8"}}>Loading jobs…</span>
        </div>
      ):filtered.length===0?(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"64px 20px",gap:14}}>
          <div style={{width:56,height:56,borderRadius:16,background:"#f8fafc",border:"1.5px dashed #e2e8f0",display:"flex",alignItems:"center",justifyContent:"center"}}><Briefcase size={24} color="#cbd5e1"/></div>
          <div style={{textAlign:"center"}}>
            <p style={{fontSize:15,fontWeight:600,color:"#475569",margin:"0 0 5px"}}>{search||statusFilter!=="all"?"No jobs found":"No job postings yet"}</p>
            <p style={{fontSize:13,color:"#94a3b8",margin:0}}>{search?"Try a different search":"Click 'Add New Job' to create your first posting"}</p>
          </div>
          {!search&&statusFilter==="all"&&(
            <button onClick={()=>setShowAdd(true)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"#fff",fontSize:13.5,fontWeight:600,cursor:"pointer"}}>
              <Plus size={15}/> Add First Job
            </button>
          )}
        </div>
      ):(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
          {filtered.map(j=>(
            <JobCard key={j.id} job={j}
              onStatusChange={handleStatusChange}
              onEdit={j=>{setEditJob(j);}}
              onDelete={setToDelete}
              onMatch={setMatchJob}/>
          ))}
        </div>
      )}

      {(showAdd||editJob)&&<JobDialog editJob={editJob} onClose={()=>{setShowAdd(false);setEditJob(undefined);}} onSaved={onSaved}/>}
      {toDelete&&<DeleteConfirm title={toDelete.title} loading={deleting} onConfirm={confirmDelete} onCancel={()=>setToDelete(null)}/>}
      {matchJob&&<MatchPanel job={matchJob} onClose={()=>setMatchJob(null)}/>}
    </div>
  );
}