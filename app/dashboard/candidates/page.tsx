// app/(dashboard)/dashboard/candidates/page.tsx
// Added: View Details link on card kebab menu + list row
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Plus, Search, Upload, LayoutGrid, List,
  X, CheckCircle2, AlertCircle, Loader2, Trash2,
  MapPin, Mail, Briefcase, FileText, ChevronDown,
  ChevronLeft, ChevronRight, UserPlus, MoreVertical, Eye,
} from "lucide-react";

interface Candidate {
  id: string; fullName: string; email: string | null; phone: string | null;
  location: string | null; linkedinUrl: string | null; portfolioUrl: string | null;
  jobTitle: string | null; currentCompany: string | null; experienceYears: number | null;
  skills: string[]; education: string | null; summary: string | null;
  resumeFileName: string | null; status: string; createdAt: string;
}
interface CandidateForm {
  fullName: string; email: string; phone: string; location: string;
  linkedinUrl: string; portfolioUrl: string; jobTitle: string;
  currentCompany: string; experienceYears: string; skills: string;
  education: string; summary: string; notes: string;
}
const EMPTY_FORM: CandidateForm = {
  fullName:"",email:"",phone:"",location:"",linkedinUrl:"",portfolioUrl:"",
  jobTitle:"",currentCompany:"",experienceYears:"",skills:"",education:"",summary:"",notes:"",
};
const STATUS: Record<string,{bg:string;color:string;dot:string;label:string}> = {
  new:                 {bg:"#eff6ff",color:"#1d4ed8",dot:"#3b82f6",label:"New"},
  reviewing:           {bg:"#fffbeb",color:"#b45309",dot:"#f59e0b",label:"Reviewing"},
  interview_scheduled: {bg:"#f5f3ff",color:"#6d28d9",dot:"#8b5cf6",label:"Interview Scheduled"},
  interviewed:         {bg:"#f0fdf4",color:"#15803d",dot:"#22c55e",label:"Interviewed"},
  offer_sent:          {bg:"#fff7ed",color:"#c2410c",dot:"#f97316",label:"Offer Sent"},
  hired:               {bg:"#dcfce7",color:"#166534",dot:"#16a34a",label:"Hired"},
  rejected:            {bg:"#fef2f2",color:"#b91c1c",dot:"#ef4444",label:"Rejected"},
};
const PAGE_SIZE_OPTIONS = [12,24,48];
function initials(n:string){return n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);}
function grad(n:string){return["linear-gradient(135deg,#6366f1,#3b82f6)","linear-gradient(135deg,#10b981,#059669)","linear-gradient(135deg,#f59e0b,#d97706)","linear-gradient(135deg,#8b5cf6,#7c3aed)","linear-gradient(135deg,#ec4899,#db2777)"][n.charCodeAt(0)%5];}

function StatusBadge({status}:{status:string}){
  const s=STATUS[status]??STATUS.new;
  return <span style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:99,background:s.bg,color:s.color}}><span style={{width:5,height:5,borderRadius:"50%",background:s.dot,display:"block",flexShrink:0}}/>{s.label}</span>;
}
function Avatar({name,size=40}:{name:string;size?:number}){
  return <div style={{width:size,height:size,borderRadius:"50%",background:grad(name),display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.32,fontWeight:700,color:"#fff",flexShrink:0}}>{initials(name)}</div>;
}

function DeleteConfirm({name,onConfirm,onCancel,loading}:{name:string;loading:boolean;onConfirm:()=>void;onCancel:()=>void}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(10,31,51,0.45)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#fff",borderRadius:16,padding:28,maxWidth:400,width:"100%",boxShadow:"0 24px 64px rgba(10,31,51,0.18)"}}>
        <div style={{width:48,height:48,borderRadius:12,background:"#fee2e2",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}><Trash2 size={20} color="#ef4444"/></div>
        <h3 style={{fontSize:16,fontWeight:700,color:"#0a1f33",margin:"0 0 8px"}}>Delete Candidate</h3>
        <p style={{fontSize:13.5,color:"#627d98",margin:"0 0 24px",lineHeight:1.6}}>Are you sure you want to delete <strong style={{color:"#334e68"}}>{name}</strong>? This cannot be undone.</p>
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

function CandidateCard({c,onDelete,onView}:{c:Candidate;onDelete:(c:Candidate)=>void;onView:(c:Candidate)=>void}){
  const [menuOpen,setMenuOpen]=useState(false);
  return(
    <div style={{background:"#fff",border:"1px solid #e5eaf0",borderRadius:14,padding:"18px",display:"flex",flexDirection:"column",gap:12,position:"relative",transition:"box-shadow 0.2s"}}
      onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 4px 20px rgba(10,31,51,0.09)")}
      onMouseLeave={e=>(e.currentTarget.style.boxShadow="none")}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0,flex:1}}>
          <Avatar name={c.fullName} size={40}/>
          <div style={{minWidth:0}}>
            <p style={{fontSize:14,fontWeight:700,color:"#0a1f33",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.fullName}</p>
            <p style={{fontSize:11.5,color:"#829ab1",margin:"2px 0 0"}}>{c.jobTitle??"—"}</p>
          </div>
        </div>
        <div style={{position:"relative",flexShrink:0}}>
          <button onClick={()=>setMenuOpen(o=>!o)} style={{width:28,height:28,borderRadius:7,border:"1px solid #e5eaf0",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
            <MoreVertical size={14} color="#829ab1"/>
          </button>
          {menuOpen&&(
            <>
              <div style={{position:"fixed",inset:0,zIndex:10}} onClick={()=>setMenuOpen(false)}/>
              <div style={{position:"absolute",right:0,top:32,zIndex:20,background:"#fff",border:"1px solid #e5eaf0",borderRadius:10,boxShadow:"0 8px 24px rgba(10,31,51,0.12)",overflow:"hidden",minWidth:140}}>
                <button onClick={()=>{setMenuOpen(false);onView(c);}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"10px 14px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#334e68",fontWeight:500}}>
                  <Eye size={13} color="#829ab1"/>View Details
                </button>
                <div style={{height:1,background:"#f0f4f8",margin:"0 8px"}}/>
                <button onClick={()=>{setMenuOpen(false);onDelete(c);}} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"10px 14px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:"#ef4444",fontWeight:500}}>
                  <Trash2 size={13}/>Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <StatusBadge status={c.status}/>
      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        {c.email&&<div style={{display:"flex",alignItems:"center",gap:6}}><Mail size={11} color="#bcccdc"/><span style={{fontSize:12,color:"#627d98",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.email}</span></div>}
        {c.location&&<div style={{display:"flex",alignItems:"center",gap:6}}><MapPin size={11} color="#bcccdc"/><span style={{fontSize:12,color:"#627d98"}}>{c.location}</span></div>}
        {c.currentCompany&&<div style={{display:"flex",alignItems:"center",gap:6}}><Briefcase size={11} color="#bcccdc"/><span style={{fontSize:12,color:"#627d98"}}>{c.currentCompany}{c.experienceYears?` · ${c.experienceYears}y`:""}</span></div>}
      </div>
      {c.skills?.length>0&&(
        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
          {c.skills.slice(0,3).map(s=><span key={s} style={{fontSize:10.5,fontWeight:600,padding:"2px 8px",borderRadius:99,background:"#f0f4f8",color:"#486581"}}>{s}</span>)}
          {c.skills.length>3&&<span style={{fontSize:10.5,color:"#bcccdc",alignSelf:"center"}}>+{c.skills.length-3}</span>}
        </div>
      )}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:8,borderTop:"1px solid #f0f4f8"}}>
        <span style={{fontSize:10.5,color:"#bcccdc"}}>{new Date(c.createdAt).toLocaleDateString()}</span>
        {/* View details link */}
        <button onClick={()=>onView(c)} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:"#3b82f6",background:"none",border:"none",cursor:"pointer",padding:0}}>
          <Eye size={12}/>View
        </button>
      </div>
    </div>
  );
}

function CandidateRow({c,onDelete,onView}:{c:Candidate;onDelete:(c:Candidate)=>void;onView:(c:Candidate)=>void}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",borderBottom:"1px solid #f4f6f8",transition:"background 0.15s",cursor:"pointer"}}
      onClick={()=>onView(c)}
      onMouseEnter={e=>(e.currentTarget.style.background="#fafbfc")}
      onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
      <Avatar name={c.fullName} size={34}/>
      <div style={{flex:"0 0 190px",minWidth:0}}>
        <p style={{fontSize:13.5,fontWeight:600,color:"#0a1f33",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.fullName}</p>
        <p style={{fontSize:11.5,color:"#829ab1",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.email??"—"}</p>
      </div>
      <div style={{flex:"0 0 170px",minWidth:0}}>
        <p style={{fontSize:13,color:"#334e68",margin:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.jobTitle??"—"}</p>
        <p style={{fontSize:11.5,color:"#829ab1",margin:0}}>{c.currentCompany??""}</p>
      </div>
      <div style={{flex:"0 0 110px"}}><p style={{fontSize:12.5,color:"#627d98",margin:0}}>{c.location??"—"}</p></div>
      <div style={{flex:1,display:"flex",flexWrap:"wrap",gap:4}}>
        {c.skills?.slice(0,3).map(s=><span key={s} style={{fontSize:10.5,fontWeight:600,padding:"2px 8px",borderRadius:99,background:"#f0f4f8",color:"#486581"}}>{s}</span>)}
        {c.skills?.length>3&&<span style={{fontSize:10.5,color:"#bcccdc"}}>+{c.skills.length-3}</span>}
      </div>
      <div style={{flexShrink:0}}><StatusBadge status={c.status}/></div>
      <span style={{fontSize:11.5,color:"#bcccdc",flexShrink:0,minWidth:72}}>{new Date(c.createdAt).toLocaleDateString()}</span>
      <button onClick={e=>{e.stopPropagation();onView(c);}} style={{width:30,height:30,borderRadius:8,border:"1px solid #dbeafe",background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}} title="View Details">
        <Eye size={13} color="#3b82f6"/>
      </button>
      <button onClick={e=>{e.stopPropagation();onDelete(c);}} style={{width:30,height:30,borderRadius:8,border:"1px solid #fee2e2",background:"#fef2f2",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}
        onMouseEnter={e=>(e.currentTarget.style.background="#fee2e2")} onMouseLeave={e=>(e.currentTarget.style.background="#fef2f2")}>
        <Trash2 size={13} color="#ef4444"/>
      </button>
    </div>
  );
}

function Field({label,value,onChange,placeholder,type="text",span=false}:{label:string;value:string;placeholder?:string;type?:string;span?:boolean;onChange:(e:React.ChangeEvent<HTMLInputElement>)=>void}){
  return(
    <div style={span?{gridColumn:"1/-1"}:{}}>
      <label style={{fontSize:11.5,fontWeight:600,color:"#627d98",display:"block",marginBottom:5}}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{width:"100%",padding:"9px 11px",borderRadius:9,border:"1.5px solid #e5eaf0",fontSize:13,color:"#334e68",outline:"none",boxSizing:"border-box",background:"#fafbfc",transition:"border-color 0.15s"}}
        onFocus={e=>(e.currentTarget.style.borderColor="#3b82f6")} onBlur={e=>(e.currentTarget.style.borderColor="#e5eaf0")}/>
    </div>
  );
}
function SectionLabel({children}:{children:React.ReactNode}){return <p style={{fontSize:10.5,fontWeight:700,color:"#bcccdc",letterSpacing:"0.07em",textTransform:"uppercase",margin:"0 0 10px"}}>{children}</p>;}

function AddDialog({onClose,onSaved}:{onClose:()=>void;onSaved:(c:Candidate)=>void}){
  const [step,setStep]=useState<"upload"|"form">("upload");
  const [form,setForm]=useState<CandidateForm>(EMPTY_FORM);
  const [parsing,setParsing]=useState(false);
  const [parseErr,setParseErr]=useState("");
  const [saving,setSaving]=useState(false);
  const [saveErr,setSaveErr]=useState("");
  const [fileName,setFileName]=useState("");
  const fileRef=useRef<HTMLInputElement>(null);
  const f=(k:keyof CandidateForm)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>setForm(p=>({...p,[k]:e.target.value}));

  async function handleFile(file:File){
    setParsing(true);setParseErr("");
    const fd=new FormData();fd.append("resume",file);
    try{
      const res=await fetch("/api/candidates/parse-resume",{method:"POST",body:fd});
      const json=await res.json();
      if(!res.ok)throw new Error(json.error);
      const d=json.data;setFileName(file.name);
      setForm({fullName:d.fullName??"",email:d.email??"",phone:d.phone??"",location:d.location??"",linkedinUrl:d.linkedinUrl??"",portfolioUrl:d.portfolioUrl??"",jobTitle:d.jobTitle??"",currentCompany:d.currentCompany??"",experienceYears:d.experienceYears!=null?String(d.experienceYears):"",skills:Array.isArray(d.skills)?d.skills.join(", "):"",education:d.education??"",summary:d.summary??"",notes:""});
      setStep("form");
    }catch(e:any){setParseErr(e.message??"Parse failed");}
    finally{setParsing(false);}
  }

  async function handleSave(){
    if(!form.fullName.trim()){setSaveErr("Full name is required.");return;}
    setSaving(true);setSaveErr("");
    try{
      const res=await fetch("/api/candidates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,experienceYears:form.experienceYears?parseInt(form.experienceYears):null,skills:form.skills?form.skills.split(",").map(s=>s.trim()).filter(Boolean):[],resumeFileName:fileName||null})});
      const json=await res.json();
      if(!res.ok)throw new Error(json.error);
      onSaved(json.candidate);
    }catch(e:any){setSaveErr(e.message??"Save failed");setSaving(false);}
  }

  return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(10,31,51,0.45)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#fff",borderRadius:18,width:"100%",maxWidth:620,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(10,31,51,0.18)",display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 22px",borderBottom:"1px solid #f0f4f8",flexShrink:0,position:"sticky",top:0,background:"#fff",zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:34,height:34,borderRadius:9,background:"#eff6ff",display:"flex",alignItems:"center",justifyContent:"center"}}><UserPlus size={16} color="#3b82f6"/></div>
            <div>
              <h2 style={{fontSize:15,fontWeight:700,color:"#0a1f33",margin:0}}>Add Candidate</h2>
              <p style={{fontSize:11.5,color:"#829ab1",margin:0}}>{step==="upload"?"Upload resume or fill manually":fileName?`Parsed · ${fileName}`:"Manual entry"}</p>
            </div>
          </div>
          <button onClick={onClose} style={{width:30,height:30,borderRadius:8,border:"1px solid #e5eaf0",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={14} color="#627d98"/></button>
        </div>

        {step==="upload"&&(
          <div style={{padding:22,display:"flex",flexDirection:"column",gap:14}}>
            <div onClick={()=>fileRef.current?.click()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFile(f);}} onDragOver={e=>e.preventDefault()}
              style={{border:"2px dashed #d9e2ec",borderRadius:14,padding:"32px 20px",textAlign:"center",cursor:"pointer",background:"#fafbfc",transition:"all 0.2s"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="#3b82f6";(e.currentTarget as HTMLDivElement).style.background="#eff6ff";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="#d9e2ec";(e.currentTarget as HTMLDivElement).style.background="#fafbfc";}}>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)handleFile(f);}}/>
              {parsing?(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                  <Loader2 size={28} color="#3b82f6" style={{animation:"spin 1s linear infinite"}}/>
                  <p style={{fontSize:13.5,color:"#3b82f6",fontWeight:600,margin:0}}>AI is reading your resume…</p>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
                  <div style={{width:48,height:48,borderRadius:12,background:"#eff6ff",border:"1px solid #bfdbfe",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto"}}><Upload size={20} color="#3b82f6"/></div>
                  <p style={{fontSize:13.5,fontWeight:600,color:"#0a1f33",margin:0}}>Drop resume here or click to browse</p>
                  <p style={{fontSize:12,color:"#829ab1",margin:0}}>PDF, DOCX or TXT · AI auto-fills the form</p>
                </div>
              )}
            </div>
            {parseErr&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 13px",borderRadius:9,background:"#fee2e2",border:"1px solid #fca5a5"}}><AlertCircle size={13} color="#ef4444"/><span style={{fontSize:12.5,color:"#dc2626"}}>{parseErr}</span></div>}
            <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{flex:1,height:1,background:"#e5eaf0"}}/><span style={{fontSize:12,color:"#bcccdc"}}>or</span><div style={{flex:1,height:1,background:"#e5eaf0"}}/></div>
            <button onClick={()=>setStep("form")} style={{padding:"11px",borderRadius:10,border:"1px solid #e5eaf0",background:"#f8fafc",fontSize:13.5,fontWeight:600,color:"#486581",cursor:"pointer"}}>Fill out manually</button>
          </div>
        )}

        {step==="form"&&(
          <div style={{padding:22,display:"flex",flexDirection:"column",gap:18}}>
            {fileName&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",borderRadius:9,background:"#f0fdf4",border:"1px solid #bbf7d0"}}><CheckCircle2 size={13} color="#10b981"/><span style={{fontSize:12.5,color:"#059669"}}>AI filled from <strong>{fileName}</strong> — review & edit below</span></div>}
            <div><SectionLabel>Personal</SectionLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="Full Name *" value={form.fullName} onChange={f("fullName")} placeholder="Sarah Chen" span/>
                <Field label="Email" value={form.email} onChange={f("email")} placeholder="sarah@example.com"/>
                <Field label="Phone" value={form.phone} onChange={f("phone")} placeholder="+1 555 0000"/>
                <Field label="Location" value={form.location} onChange={f("location")} placeholder="New York, USA" span/>
              </div>
            </div>
            <div><SectionLabel>Professional</SectionLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="Job Title" value={form.jobTitle} onChange={f("jobTitle")} placeholder="Senior Frontend Engineer"/>
                <Field label="Current Company" value={form.currentCompany} onChange={f("currentCompany")} placeholder="Acme Corp"/>
                <Field label="Years of Experience" value={form.experienceYears} onChange={f("experienceYears")} placeholder="5" type="number"/>
                <Field label="Education" value={form.education} onChange={f("education")} placeholder="B.Sc CS, MIT"/>
                <Field label="Skills (comma separated)" value={form.skills} onChange={f("skills")} placeholder="React, TypeScript, Node.js" span/>
              </div>
            </div>
            <div><SectionLabel>Links</SectionLabel>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <Field label="LinkedIn URL" value={form.linkedinUrl} onChange={f("linkedinUrl")} placeholder="linkedin.com/in/sarah"/>
                <Field label="Portfolio / GitHub" value={form.portfolioUrl} onChange={f("portfolioUrl")} placeholder="github.com/sarah"/>
              </div>
            </div>
            <div><SectionLabel>Notes</SectionLabel>
              <textarea value={form.summary} onChange={f("summary")} placeholder="Professional summary…" rows={2}
                style={{width:"100%",padding:"9px 11px",borderRadius:9,border:"1.5px solid #e5eaf0",fontSize:13,color:"#334e68",resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit",marginBottom:10}}
                onFocus={e=>(e.currentTarget.style.borderColor="#3b82f6")} onBlur={e=>(e.currentTarget.style.borderColor="#e5eaf0")}/>
              <textarea value={form.notes} onChange={f("notes")} placeholder="Internal recruiter notes…" rows={2}
                style={{width:"100%",padding:"9px 11px",borderRadius:9,border:"1.5px solid #e5eaf0",fontSize:13,color:"#334e68",resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}
                onFocus={e=>(e.currentTarget.style.borderColor="#3b82f6")} onBlur={e=>(e.currentTarget.style.borderColor="#e5eaf0")}/>
            </div>
            {saveErr&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",borderRadius:9,background:"#fee2e2",border:"1px solid #fca5a5"}}><AlertCircle size={13} color="#ef4444"/><span style={{fontSize:12.5,color:"#dc2626"}}>{saveErr}</span></div>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setStep("upload");setFileName("");}} style={{flex:1,padding:"11px",borderRadius:10,border:"1px solid #e5eaf0",background:"#f8fafc",fontSize:13.5,fontWeight:600,color:"#486581",cursor:"pointer"}}>Back</button>
              <button onClick={handleSave} disabled={saving} style={{flex:2,padding:"11px",borderRadius:10,border:"none",background:saving?"#93c5fd":"linear-gradient(135deg,#2563eb,#1d4ed8)",fontSize:13.5,fontWeight:600,color:"#fff",cursor:saving?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:saving?"none":"0 4px 14px rgba(37,99,235,0.3)"}}>
                {saving?<><Loader2 size={14} style={{animation:"spin 1s linear infinite"}}/>Saving…</>:<><CheckCircle2 size={14}/>Save Candidate</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Pagination({page,totalPages,pageSize,onPage,onPageSize}:{page:number;totalPages:number;pageSize:number;onPage:(p:number)=>void;onPageSize:(n:number)=>void}){
  const pages=Array.from({length:Math.min(totalPages,7)},(_,i)=>{
    if(totalPages<=7)return i+1;
    if(page<=4)return i+1<=5?i+1:totalPages-(6-i);
    if(page>=totalPages-3)return i<2?i+1:totalPages-(6-i);
    return i===0?1:i===6?totalPages:page+i-3;
  });
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,paddingTop:20}}>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <span style={{fontSize:12.5,color:"#829ab1"}}>Rows per page:</span>
        {PAGE_SIZE_OPTIONS.map(n=>(
          <button key={n} onClick={()=>{onPageSize(n);onPage(1);}} style={{width:34,height:28,borderRadius:7,border:pageSize===n?"1.5px solid #3b82f6":"1px solid #e5eaf0",background:pageSize===n?"#eff6ff":"#f8fafc",fontSize:12.5,fontWeight:pageSize===n?700:400,color:pageSize===n?"#1d4ed8":"#627d98",cursor:"pointer"}}>{n}</button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <PB disabled={page===1} onClick={()=>onPage(page-1)}><ChevronLeft size={14}/></PB>
        {pages.map((p,i)=><PB key={i} active={p===page} onClick={()=>onPage(p)}>{p}</PB>)}
        <PB disabled={page===totalPages} onClick={()=>onPage(page+1)}><ChevronRight size={14}/></PB>
      </div>
      <span style={{fontSize:12.5,color:"#829ab1"}}>Page {page} of {totalPages}</span>
    </div>
  );
}
function PB({children,onClick,disabled,active}:{children:React.ReactNode;onClick?:()=>void;disabled?:boolean;active?:boolean}){
  return <button onClick={onClick} disabled={disabled} style={{minWidth:32,height:32,borderRadius:8,border:active?"1.5px solid #3b82f6":"1px solid #e5eaf0",background:active?"#eff6ff":"#fff",fontSize:13,fontWeight:active?700:400,color:active?"#1d4ed8":disabled?"#d1d5db":"#486581",cursor:disabled?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:"0 4px",opacity:disabled?0.4:1}}>{children}</button>;
}

export default function CandidatesPage(){
  const router=useRouter();
  const [all,setAll]=useState<Candidate[]>([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");
  const [viewMode,setViewMode]=useState<"grid"|"list">("grid");
  const [statusFilter,setFilter]=useState("all");
  const [showAdd,setShowAdd]=useState(false);
  const [toDelete,setToDelete]=useState<Candidate|null>(null);
  const [deleting,setDeleting]=useState(false);
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(12);

  const fetchAll=useCallback(async()=>{
    setLoading(true);
    try{const res=await fetch("/api/candidates");const json=await res.json();setAll(json.candidates??[]);}
    finally{setLoading(false);}
  },[]);

  useEffect(()=>{fetchAll();},[fetchAll]);
  useEffect(()=>{setPage(1);},[search,statusFilter,pageSize]);

  const filtered=all.filter(c=>{
    const ms=statusFilter==="all"||c.status===statusFilter;
    const q=search.toLowerCase();
    const mq=!q||[c.fullName,c.email,c.jobTitle,c.currentCompany,c.location].some(v=>v?.toLowerCase().includes(q));
    return ms&&mq;
  });

  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const paged=filtered.slice((page-1)*pageSize,page*pageSize);

  function onView(c:Candidate){router.push(`/dashboard/candidates/${c.id}`);}
  function onSaved(c:Candidate){setAll(prev=>[c,...prev]);setShowAdd(false);}
  async function confirmDelete(){
    if(!toDelete)return;setDeleting(true);
    try{await fetch(`/api/candidates/${toDelete.id}`,{method:"DELETE"});setAll(prev=>prev.filter(c=>c.id!==toDelete.id));setToDelete(null);}
    finally{setDeleting(false);}
  }

  return(
    <div style={{padding:"24px 28px",fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
        <div>
          <h1 style={{fontSize:20,fontWeight:800,color:"#0a1f33",margin:0}}>Candidates</h1>
          <p style={{fontSize:13,color:"#829ab1",margin:"3px 0 0"}}>{filtered.length} result{filtered.length!==1?"s":""}{all.length!==filtered.length?` of ${all.length} total`:""}</p>
        </div>
        <button onClick={()=>setShowAdd(true)}
          style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"#fff",fontSize:13.5,fontWeight:600,cursor:"pointer",boxShadow:"0 3px 12px rgba(37,99,235,0.3)",transition:"transform 0.15s,box-shadow 0.15s"}}
          onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.transform="translateY(-1px)";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 6px 20px rgba(37,99,235,0.38)";}}
          onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.transform="translateY(0)";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 3px 12px rgba(37,99,235,0.3)";}}>
          <Plus size={15}/> Add Candidate
        </button>
      </div>

      {/* Toolbar */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:200,background:"#fff",border:"1px solid #e5eaf0",borderRadius:9,padding:"8px 12px",boxShadow:"0 1px 4px rgba(10,31,51,0.04)"}}>
          <Search size={13} color="#bcccdc"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, role, company…"
            style={{border:"none",outline:"none",fontSize:13,color:"#334e68",width:"100%",background:"transparent"}}/>
          {search&&<button onClick={()=>setSearch("")} style={{border:"none",background:"none",cursor:"pointer",display:"flex",padding:0}}><X size={13} color="#bcccdc"/></button>}
        </div>
        <div style={{position:"relative"}}>
          <select value={statusFilter} onChange={e=>setFilter(e.target.value)}
            style={{appearance:"none",padding:"8px 30px 8px 11px",borderRadius:9,border:"1px solid #e5eaf0",fontSize:13,color:"#334e68",background:"#fff",cursor:"pointer",outline:"none",boxShadow:"0 1px 4px rgba(10,31,51,0.04)"}}>
            <option value="all">All Statuses</option>
            {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
          </select>
          <ChevronDown size={12} color="#bcccdc" style={{position:"absolute",right:9,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}/>
        </div>
        <div style={{display:"flex",background:"#f4f6f8",borderRadius:9,padding:3,border:"1px solid #e5eaf0"}}>
          {(["grid","list"] as const).map(m=>(
            <button key={m} onClick={()=>setViewMode(m)}
              style={{width:32,height:28,borderRadius:7,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",background:viewMode===m?"#fff":"transparent",boxShadow:viewMode===m?"0 1px 4px rgba(0,0,0,0.08)":"none",transition:"all 0.15s"}}>
              {m==="grid"?<LayoutGrid size={14} color={viewMode===m?"#2563eb":"#bcccdc"}/>:<List size={14} color={viewMode===m?"#2563eb":"#bcccdc"}/>}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading?(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",padding:80,gap:10}}>
          <Loader2 size={22} color="#3b82f6" style={{animation:"spin 1s linear infinite"}}/><span style={{fontSize:13.5,color:"#829ab1"}}>Loading…</span>
        </div>
      ):paged.length===0?(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"64px 20px",gap:14}}>
          <div style={{width:56,height:56,borderRadius:16,background:"#f4f6f8",border:"1.5px dashed #d9e2ec",display:"flex",alignItems:"center",justifyContent:"center"}}><Users size={24} color="#d1d5db"/></div>
          <div style={{textAlign:"center"}}>
            <p style={{fontSize:15,fontWeight:600,color:"#486581",margin:"0 0 5px"}}>{search||statusFilter!=="all"?"No candidates found":"No candidates yet"}</p>
            <p style={{fontSize:13,color:"#bcccdc",margin:0}}>{search?"Try a different search term":"Click 'Add Candidate' to get started"}</p>
          </div>
          {!search&&statusFilter==="all"&&<button onClick={()=>setShowAdd(true)} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 18px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"#fff",fontSize:13.5,fontWeight:600,cursor:"pointer"}}><Plus size={15}/>Add First Candidate</button>}
        </div>
      ):viewMode==="grid"?(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
          {paged.map(c=><CandidateCard key={c.id} c={c} onDelete={setToDelete} onView={onView}/>)}
        </div>
      ):(
        <div style={{background:"#fff",border:"1px solid #e5eaf0",borderRadius:12,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:14,padding:"9px 16px",background:"#f8fafc",borderBottom:"1px solid #f0f4f8"}}>
            <div style={{width:34,flexShrink:0}}/>
            {[["190px","Name"],["170px","Role"],["110px","Location"],["1","Skills"],["auto","Status"],["72px","Added"],["30px",""],["30px",""]].map(([w,lbl])=>(
              <div key={lbl} style={{flex:w==="1"?1:`0 0 ${w}`}}>
                <span style={{fontSize:10.5,fontWeight:700,color:"#bcccdc",letterSpacing:"0.06em",textTransform:"uppercase"}}>{lbl}</span>
              </div>
            ))}
          </div>
          {paged.map(c=><CandidateRow key={c.id} c={c} onDelete={setToDelete} onView={onView}/>)}
        </div>
      )}

      {!loading&&filtered.length>0&&<Pagination page={page} totalPages={totalPages} pageSize={pageSize} onPage={setPage} onPageSize={setPageSize}/>}

      {showAdd&&<AddDialog onClose={()=>setShowAdd(false)} onSaved={onSaved}/>}
      {toDelete&&<DeleteConfirm name={toDelete.fullName} loading={deleting} onConfirm={confirmDelete} onCancel={()=>setToDelete(null)}/>}
    </div>
  );
}