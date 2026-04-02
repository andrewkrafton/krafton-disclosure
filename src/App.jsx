import { useState, useRef, useEffect, useCallback } from "react";

// ============================================================
// 공시 기준 데이터 — FY2025 연결재무제표 (2027년 3월 31일까지 적용)
// ============================================================
const FINANCIAL_DATA = {
  year: "FY2025",
  consolidated: { assets: 94336, liabilities: 22495, equity: 71841, revenue: 33265 },
  thresholds: { revenue_2_5: 831, revenue_10: 3327, equity_5: 3592, equity_10: 7184, assets_10: 9434, equity_25: 17960 },
};

// ============================================================
// System Prompt
// ============================================================
const SYSTEM_PROMPT_BASE = `당신은 크래프톤(KRAFTON)의 공시 판단 전문 AI 어시스턴트입니다. 
사용자가 계약서, 거래 내용, 또는 공시 관련 질문을 하면, 반드시 아래에 첨부된 코스피시장 공시규정 원문을 꼼꼼히 확인한 후, 해당 조항을 근거로 정확하게 답변해야 합니다.

## 중요 지시사항
1. **반드시 규정 원문을 먼저 확인하세요.** 아래에 코스피시장 공시규정 전문이 첨부되어 있습니다. 답변하기 전에 관련 조항을 찾아 읽고, 그 조항을 근거로 답변하세요.
2. **추측하지 마세요.** 규정 원문에서 근거를 찾을 수 없으면 "규정 원문에서 명확한 근거를 찾기 어렵습니다"라고 솔직하게 말하세요.
3. **조항 번호를 정확히 인용하세요.** (예: "공시규정 제6조 제1항 제2호 마목 (3)")
4. **크래프톤은 대규모법인(대기업)입니다.** 자산총액 9.4조원으로 공시규정 제2조 제17항의 대기업 기준(자산총액 2조원 이상)을 충족합니다. 따라서 규정에서 "대규모법인" 또는 "대기업"에 대해 별도 기준(예: 매출 2.5%, 자기자본 5% 등)이 적용됩니다. 이것은 매우 중요하므로 절대 틀리지 마세요.
5. **답변 순서를 반드시 지키세요.** 먼저 근거 규정과 분석을 작성하고, 분석이 끝난 후 맨 마지막에 최종 결론(공시 대상 O/X)을 작성하세요. 절대로 분석 전에 결론을 먼저 쓰지 마세요.

## 답변 형식 (반드시 이 순서)
1. 근거 규정 (해당 조항 원문 인용)
2. 크래프톤 적용 기준 (대규모법인 기준금액)
3. 판단 분석 (기준금액 비교)
4. **최종 결론** (공시 대상 O 또는 X — 반드시 맨 마지막)
5. 공시 의무사항 (공시기한, 제출처 등)
6. 주의사항

## 환율 관련 지시사항
- 외화 금액이 있으면 아래 환율로 원화 환산 후 기준금액과 비교하세요.
- 계약일이 명시되면 해당일 기준 환율을, 없으면 당일 환율을 적용하세요.
- 답변에 반드시 "[환율 적용] 계약일 YYYY-MM-DD 기준 1 USD = X,XXX KRW" 라고 명시하세요.
- 원화만 표시된 거래는 환율 언급 불필요.

모르는 내용은 "정확한 답변이 어렵습니다"라고 하세요.

## 적용 기간: FY2025 연결재무제표 기준 (2026년 4월 1일 ~ 2027년 3월 31일)

## 크래프톤 재무정보 (FY2025 연결)
자산총액: 94,336억 | 부채총액: 22,495억 | 자기자본: 71,841억 | 매출액: 33,265억

## 주요 공시 기준금액 (대규모법인)
매출2.5%=831억 | 매출10%=3,327억 | 자기자본5%=3,592억 | 자기자본10%=7,184억 | 자산10%=9,434억 | 자기자본25%=17,960억
※ 크래프톤은 자산총액 2조원 이상 대규모법인(대기업)으로 대기업 기준 적용

## 종속기업 정보
크래프톤 그룹 종속회사 포함

## 수시공시 기준표 (제6조)
영업정지·거래중단·판매계약·수거파기·생산중단: 매출2.5%=831억 (대기업)
신규시설투자·타법인출자·채무면제·담보제공·대여금: 자기자본5%=3,592억 (대기업)
유형자산취득·재해발생: 자산2.5%=2,358억 (대기업)
벌금·횡령·소송: 자기자본5%=3,592억
손상차손: 자기자본25%=17,960억

## 포괄공시 (제7조): 매출2.5%=831억, 자기자본2.5%=1,796억, 자산2.5%=2,358억
## 주요사항보고: 자산10%=9,434억
## 공정거래위원회 공시: 해당 (자산5조 이상)

항상 한국어, 마크다운 형식.`;

// ============================================================
// 환율/규정/API — 기존 로직 100% 보존
// ============================================================
async function fetchExchangeRates(date) {
  const ep = date ? `https://api.frankfurter.dev/v1/${date}?base=KRW` : `https://api.frankfurter.dev/v1/latest?base=KRW`;
  try { const r = await fetch(ep); if (!r.ok) return null; const d = await r.json(); const rates = {}; for (const [c, v] of Object.entries(d.rates)) rates[c] = (1/v).toFixed(2); return { date: d.date, rates }; } catch { return null; }
}
function fmtRates(rd) {
  if (!rd) return "";
  const m = ["USD","EUR","JPY","CNY","GBP","HKD","SGD","AUD","CAD","CHF"];
  return `\n## 환율 (${rd.date})\n` + m.filter(c=>rd.rates[c]).map(c=>`1 ${c} = ${Number(rd.rates[c]).toLocaleString()} KRW`).join("\n");
}

const REG_FILES = [
  { name: "코스닥시장 공시규정", path: "/kosdaq_disclosure_regulation.txt", full: true },
  { name: "코스닥시장 업무규정", path: "/kosdaq_business_regulation.txt", full: false },
  { name: "코스닥시장 업무규정 시행세칙", path: "/kosdaq_business_enforcement.txt", full: false },
];
async function loadRegs() {
  const t = [];
  for (const f of REG_FILES) { try { const r = await fetch(f.path); if (r.ok) { const tx = await r.text(); t.push({...f, text: tx}); } } catch {} }
  return t;
}
function buildPrompt(regs, fx) {
  let p = SYSTEM_PROMPT_BASE;
  if (fx) p += fx;
  if (regs?.length > 0) { p += `\n\n${"=".repeat(50)}\n규정 원문 (반드시 참조)\n${"=".repeat(50)}\n`; for (const r of regs) if (r.full) p += `\n## ${r.name}\n${r.text}`; }
  return p;
}

async function callAPI(messages, regs, fx) {
  const apiMsgs = [];
  for (const m of messages) {
    if (m.isUser) {
      if (m.file) {
        const c = [];
        if (m.file.type === "application/pdf") c.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: m.file.base64 } });
        else if (m.file.type.startsWith("image/")) c.push({ type: "image", source: { type: "base64", media_type: m.file.type, data: m.file.base64 } });
        c.push({ type: "text", text: m.text || "이 문서를 분석하여 공시 대상 여부를 판단해주세요." });
        apiMsgs.push({ role: "user", content: c });
      } else apiMsgs.push({ role: "user", content: m.text });
    } else apiMsgs.push({ role: "assistant", content: m.text });
  }
  const sys = [{ type: "text", text: buildPrompt(regs, fx), cache_control: { type: "ephemeral" } }];
  let res;
  try {
    res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: apiMsgs, system: sys }) });
    if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.error?.message || `서버오류(${res.status})`); }
  } catch (e) { throw new Error(e.message || "API 호출 실패"); }
  const data = await res.json();
  return data.content?.filter(i=>i.type==="text").map(i=>i.text).join("\n") || "응답 생성 실패";
}

function loadHist() { try { return JSON.parse(localStorage.getItem("nw-h")||"[]"); } catch { return []; } }
function saveHist(h) { try { localStorage.setItem("nw-h", JSON.stringify(h)); } catch {} }

// ============================================================
// Markdown & helpers
// ============================================================
function md(text) {
  if (!text) return "";
  const lines = text.split("\n"); let inT=false, tH="", out=[], hp=false;
  for (const l of lines) {
    const t=l.trim();
    if (t.startsWith("|")&&t.endsWith("|")) {
      if (t.replace(/[|\s\-:]/g,"")==="") { hp=true; continue; }
      if (!inT) { inT=true; hp=false; tH='<div class="md-tbl"><table><tbody>'; }
      const cells=t.split("|").filter(c=>c!==""); const isH=!hp; if(isH) hp=true;
      tH+=`<tr>${cells.map(c=>`<${isH?"th":"td"}>${c.trim()}</${isH?"th":"td"}>`).join("")}</tr>`;
    } else {
      if (inT) { tH+="</tbody></table></div>"; out.push(tH); tH=""; inT=false; hp=false; }
      out.push(l);
    }
  }
  if (inT) { tH+="</tbody></table></div>"; out.push(tH); }
  return out.join("\n")
    .replace(/^#### (.*)$/gm,'<h4>$1</h4>').replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^## (.*)$/gm,'<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g,"<strong>$1</strong>").replace(/`(.*?)`/g,"<code>$1</code>")
    .replace(/^- (.*)$/gm,'<div class="md-li">• $1</div>')
    .replace(/^(\d+)\. (.*)$/gm,'<div class="md-ol">$1. $2</div>')
    .replace(/\n\n/g,'<div style="height:8px"></div>').replace(/\n/g,"");
}

function conclude(text) {
  if (!text) return null;
  const l=text.toLowerCase();
  if (l.includes("공시 대상 o")||l.includes("공시대상 o")||l.includes("공시 대상입니다")||l.includes("공시대상입니다")||l.includes("공시 의무가 있")||text.includes("✅")) return "yes";
  if (l.includes("공시 대상 x")||l.includes("공시대상 x")||l.includes("공시 대상이 아닙")||l.includes("해당하지 않")||l.includes("미달")||text.includes("❌")) return "no";
  return null;
}

function exportPDF(q, r) {
  const c = conclude(r); const ct = c==="yes"?"공시 대상 O":c==="no"?"공시 대상 X":"검토 필요";
  const clean = r.replace(/\*\*/g,"").replace(/##/g,"").replace(/`/g,"");
  const date = new Date().toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric"});
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:'Malgun Gothic',sans-serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1f2937;font-size:13px;line-height:1.7}.hd{border-bottom:3px solid #dc2626;padding-bottom:14px;margin-bottom:20px}.logo{font-size:20px;font-weight:800;color:#dc2626}.sub{color:#6b7280;font-size:11px;margin-top:3px}.badge{display:inline-block;padding:5px 14px;border-radius:6px;font-weight:700;font-size:13px;margin:14px 0}.yes{background:#fef2f2;color:#dc2626;border:1px solid #fecaca}.no{background:#f0fdf4;color:#16a34a;border:1px solid #bbf7d0}.unk{background:#eef2ff;color:#6366f1;border:1px solid #c7d2fe}.sec{margin:14px 0;padding:14px;background:#f9fafb;border-radius:8px;border:1px solid #e5e7eb}.sec h3{font-size:13px;color:#374151;margin-bottom:6px}.ft{margin-top:28px;padding-top:14px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:10px}@media print{body{margin:20px}}</style></head><body><div class="hd"><div class="logo">KRAFTON 공시 판단 보고서</div><div class="sub">${date} · ${FINANCIAL_DATA.year} 연결 · AI 분석 (참고용)</div></div><div class="badge ${c||"unk"}">${ct}</div><div class="sec"><h3>질문</h3><p>${q}</p></div><div class="sec"><h3>AI 분석</h3><pre style="white-space:pre-wrap;font-family:inherit">${clean}</pre></div><div class="ft"><p>⚠️ 본 보고서는 AI 참고자료이며, 최종 판단은 IR팀/법무팀 확인 필요</p><p>KRAFTON 공시 판단 시스템 · Claude Sonnet 4 · ${FINANCIAL_DATA.year}</p></div></body></html>`;
  const b=new Blob([html],{type:"text/html"}); const u=URL.createObjectURL(b); const w=window.open(u); if(w) setTimeout(()=>w.print(),500);
}

// ============================================================
// Reference links
// ============================================================
const REFS = [
  { icon:"📋", label:"공시규정", url:"https://rule.krx.co.kr" },
  { icon:"📋", label:"업무규정", url:"https://rule.krx.co.kr" },
  { icon:"📋", label:"시행세칙", url:"https://rule.krx.co.kr" },
  { icon:"🔗", label:"KRX 법무포털", url:"https://rule.krx.co.kr" },
  { icon:"🔗", label:"DART 전자공시", url:"https://dart.fss.or.kr" },
  { icon:"🔗", label:"OPENDART", url:"https://opendart.fss.or.kr" },
];

// ============================================================
// Components
// ============================================================
function Msg({ message, onCopy, onPDF, qText }) {
  const isU = message.isUser;
  const con = !isU ? conclude(message.text) : null;
  return (
    <div className={`msg ${isU?"msg-u":"msg-a"}`}>
      {!isU && <div className="avatar">N</div>}
      <div className={`bubble ${isU?"bbl-u":""}`}>
        {message.file?.type?.startsWith("image/") && <img src={`data:${message.file.type};base64,${message.file.base64}`} alt="" className="bbl-img"/>}
        {message.file && !message.file.type?.startsWith("image/") && <div className="bbl-file">📄 <b>{message.file.name}</b> <span className="bbl-fs">({(message.file.size/1024).toFixed(0)}KB)</span></div>}
        {isU ? <span>{message.text}</span> : (<>
          {con && <div className={`tag ${con==="yes"?"tag-y":"tag-n"}`}>{con==="yes"?"📢 공시 대상 O":"✅ 공시 대상 X"}</div>}
          <div dangerouslySetInnerHTML={{__html:md(message.text)}}/>
          <div className="disclaim">⚠️ 본 답변은 참고용이며, 최종 판단은 IR팀/법무팀 및 외부 법률자문과 확인하시기 바랍니다.</div>
          <div className="bbl-acts"><button className="act-btn" onClick={()=>onCopy(message.text)}>📋 복사</button><button className="act-btn" onClick={()=>onPDF(qText,message.text)}>📄 PDF</button></div>
        </>)}
      </div>
    </div>
  );
}

function Home({ onAsk, regsOk, regCnt }) {
  const d = FINANCIAL_DATA;
  const fm = [{l:"자산총액",v:`${d.consolidated.assets.toLocaleString()}억`},{l:"부채총액",v:`${d.consolidated.liabilities.toLocaleString()}억`},{l:"자기자본",v:`${d.consolidated.equity.toLocaleString()}억`},{l:"매출액",v:`${d.consolidated.revenue.toLocaleString()}억`}];
  const th = [{l:"매출 2.5%",v:"831억",s:"영업·생산"},{l:"자기자본 5%",v:"3,592억",s:"투자·채무"},{l:"자기자본 10%",v:"7,184억",s:"신규투자"},{l:"자산 10%",v:"9,434억",s:"주요사항"},{l:"자산 2.5%",v:"2,358억",s:"유형자산"},{l:"자기자본 25%",v:"17,960억",s:"손상차손"}];
  const qs = ["5,000억원 타법인 주식 취득, 공시 대상?","1,000억원 판매계약 체결 시 공시 필요?","크래프톤은 공정거래위원회 공시 대상 기업인가요?","현재 크래프톤의 공시 기준금액을 알려주세요","종속회사 거래도 공시 대상?","자율공시는 언제?"];
  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="home-h1">KRAFTON<br/>공시 판단 시스템</h1>
        <p className="home-sub">코스피시장 공시규정 기반 AI 분석 · {d.year} 연결재무제표{regsOk&&<span className="home-ok"> · ✓ 규정 {regCnt}개 로드</span>}</p>
      </div>
      <div className="home-cards">
        <div className="hcard">
          <h3 className="hcard-t">💼 {d.year} 연결재무</h3>
          <div className="hcard-metrics">{fm.map(m=><div key={m.l} className="hm"><span className="hm-l">{m.l}</span><span className="hm-v">{m.v}</span></div>)}</div>
        </div>
        <div className="hcard">
          <h3 className="hcard-t">⚖️ 주요 공시 기준금액</h3>
          <div className="hcard-grid">{th.map(t=><div key={t.l} className="ht"><div className="ht-l">{t.l}</div><div className="ht-v">{t.v}</div><div className="ht-s">{t.s}</div></div>)}</div>
        </div>
      </div>
      <div className="hcard">
        <h3 className="hcard-t">🚀 빠른 질문</h3>
        <div className="hcard-qs">{qs.map((q,i)=><button key={i} className="qq" onClick={()=>onAsk(q)}>{q}</button>)}</div>
      </div>
      <div className="hcard">
        <h3 className="hcard-t">📚 참고 자료</h3>
        <div className="hcard-refs">{REFS.map((r,i)=><a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="ref">{r.icon} {r.label}</a>)}</div>
      </div>
    </div>
  );
}

// ============================================================
// App
// ============================================================
export default function App() {
  const [view, setView] = useState("home");
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [hist, setHist] = useState([]);
  const [sbOpen, setSbOpen] = useState(true);
  const [regs, setRegs] = useState([]);
  const [regsOk, setRegsOk] = useState(false);
  const [fx, setFx] = useState("");
  const [drag, setDrag] = useState(false);
  const [lastQ, setLastQ] = useState("");
  const endRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  useEffect(()=>{setHist(loadHist());},[]);
  useEffect(()=>{loadRegs().then(r=>{setRegs(r);setRegsOk(true);});},[]);
  useEffect(()=>{fetchExchangeRates(null).then(d=>{if(d)setFx(fmtRates(d));});},[]);

  const toB64=(f)=>new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result.split(",")[1]);r.onerror=()=>no();r.readAsDataURL(f);});

  const pickFile=async(f)=>{
    if(!f)return;
    const ok=["application/pdf","image/png","image/jpeg","image/jpg","image/webp","image/gif"];
    if(!ok.includes(f.type)){alert("PDF/이미지만 가능");return;}
    if(f.size>20*1024*1024){alert("20MB 이하만");return;}
    try{const b=await toB64(f);setFile({name:f.name,type:f.type,size:f.size,base64:b});}catch{alert("파일 읽기 실패");}
  };

  const onDrop=useCallback(e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer?.files?.[0];if(f)pickFile(f);},[]);
  const onDragOver=useCallback(e=>{e.preventDefault();setDrag(true);},[]);
  const onDragLeave=useCallback(()=>setDrag(false),[]);
  const onPaste=useCallback(async e=>{
    const items=e.clipboardData?.items;if(!items)return;
    for(const i of items){if(i.type.startsWith("image/")){e.preventDefault();const f=i.getAsFile();if(f){try{const b=await toB64(f);setFile({name:`캡처_${new Date().toLocaleTimeString("ko-KR")}.png`,type:f.type,size:f.size,base64:b});}catch{}}break;}}
  },[]);

  const copy=useCallback(t=>{navigator.clipboard.writeText(t).then(()=>alert("복사됨")).catch(()=>{const a=document.createElement("textarea");a.value=t;document.body.appendChild(a);a.select();document.execCommand("copy");document.body.removeChild(a);alert("복사됨");});},[]);

  const mkEntry=(q,r,fi,all)=>{
    const e={date:new Date().toLocaleDateString("ko-KR",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}),title:q.slice(0,50)+(q.length>50?"...":""),status:"검토필요",messages:all,ts:Date.now()};
    const rl=r.toLowerCase();
    if(rl.includes("공시 대상입니다")||rl.includes("공시대상")||rl.includes("공시 의무")||r.includes("✅"))e.status="공시대상";
    else if(rl.includes("미달")||rl.includes("해당하지 않")||rl.includes("공시 대상이 아닙")||r.includes("❌"))e.status="미해당";
    else if(rl.includes("자율공시"))e.status="자율공시";
    const rm=r.match(/공시규정\s*\d+조[^\s,.)]+/);if(rm)e.reg=rm[0];
    return e;
  };

  const send=async(text)=>{
    const q=text||input.trim();if(!q&&!file)return;
    if(view==="home"){setView("chat");setMsgs([]);}
    const um={isUser:true,text:q||"이 문서를 분석하여 공시 대상 여부를 판단해주세요.",file:file||undefined};
    const nm=[...msgs,um];setMsgs(nm);setInput("");setFile(null);setLoading(true);setLastQ(q||file?.name||"");
    try{
      const r=await callAPI(nm,regs,fx);const fm=[...nm,{isUser:false,text:r}];setMsgs(fm);
      const e=mkEntry(q||file?.name||"",r,file,fm);if(file)e.title=`📄 ${file.name}`;
      const nh=[...hist,e];setHist(nh);saveHist(nh);
    }catch(err){setMsgs(p=>[...p,{isUser:false,text:`⚠️ 오류: ${err.message}`}]);}
    setLoading(false);
  };

  const newChat=()=>{setView("home");setMsgs([]);setFile(null);setInput("");};
  const restore=(h)=>{if(h.messages?.length){setMsgs(h.messages);setView("chat");setTimeout(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),100);}};
  const delHist=(i)=>{const n=hist.filter((_,j)=>j!==i);setHist(n);saveHist(n);};
  const clearHist=()=>{if(confirm("전체 이력 삭제?")){setHist([]);saveHist([]);}};

  const stColor=s=>s==="공시대상"?"#dc2626":s==="미해당"?"#16a34a":s==="자율공시"?"#d97706":"#6366f1";
  const stBg=s=>s==="공시대상"?"#fef2f2":s==="미해당"?"#f0fdf4":s==="자율공시"?"#fffbeb":"#eef2ff";

  return (
    <div onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} className={`app${drag?" app-drag":""}`}>
      {/* Sidebar */}
      <aside className={`sb${sbOpen?"":" sb-closed"}`}>
        <div className="sb-top">
          <div className="sb-brand" onClick={newChat}><span className="sb-n">K</span>{sbOpen&&<span className="sb-name">KRAFTON</span>}</div>
          <button className="sb-tog" onClick={()=>setSbOpen(!sbOpen)}>{sbOpen?"◀":"▶"}</button>
        </div>
        {sbOpen&&<>
          <button className="sb-new" onClick={newChat}>+ 새 대화</button>
          <div className="sb-sec">
            <div className="sb-sec-t">최근 대화</div>
            {hist.length===0?<div className="sb-empty">이력 없음</div>:
            [...hist].reverse().slice(0,20).map((h,i)=>(
              <div key={i} className="sb-itm" onClick={()=>restore(h)}>
                <div className="sb-itm-top">
                  <span className="sb-st" style={{background:stBg(h.status),color:stColor(h.status)}}>{h.status||"검토"}</span>
                  <span className="sb-dt">{h.date}</span>
                </div>
                <div className="sb-ttl">{h.title}</div>
                {h.reg&&<div className="sb-reg">{h.reg}</div>}
                <button className="sb-del" onClick={e=>{e.stopPropagation();delHist(hist.length-1-i);}}>×</button>
              </div>
            ))}
            {hist.length>0&&<button className="sb-clr" onClick={clearHist}>전체 삭제</button>}
          </div>
          <div className="sb-sec">
            <div className="sb-sec-t">참고 자료</div>
            {REFS.map((r,i)=><a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="sb-ref">{r.icon} {r.label}</a>)}
          </div>
          <div className="sb-ft">{FINANCIAL_DATA.year} 연결 기준</div>
        </>}
      </aside>

      {/* Main */}
      <main className="mn">
        {view==="home"?<Home onAsk={send} regsOk={regsOk} regCnt={regs.length}/>:(
          <div className="chat">
            {msgs.map((m,i)=>{const q=m.isUser?m.text:(msgs[i-1]?.isUser?msgs[i-1].text:lastQ);return <Msg key={i} message={m} onCopy={copy} onPDF={exportPDF} qText={q}/>;})}
            {loading&&<div className="msg msg-a"><div className="avatar">N</div><div className="bubble loading-b"><div className="spin"/>규정 대조 중... (약 15~20초)</div></div>}
            <div ref={endRef}/>
          </div>
        )}

        <div className="ipt">
          {file&&<div className="ipt-preview">
            {file.type?.startsWith("image/")?<img src={`data:${file.type};base64,${file.base64}`} alt="" className="ipt-thumb"/>:<span>📄</span>}
            <span className="ipt-fn">{file.name}</span>
            <span className="ipt-fs">({(file.size/1024).toFixed(0)}KB)</span>
            <button onClick={()=>setFile(null)} className="ipt-x">✕</button>
          </div>}
          <div className="ipt-row">
            <button onClick={()=>fileRef.current?.click()} disabled={loading} className="ipt-clip">📎</button>
            <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif" style={{display:"none"}} onChange={e=>pickFile(e.target.files?.[0])}/>
            <div className="ipt-box">
              <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} onPaste={onPaste} placeholder={file?"추가 지시사항...":"공시 질문 입력 (Ctrl+V 이미지 붙여넣기)"} disabled={loading} rows={1}/>
            </div>
            <button onClick={()=>send()} disabled={loading||(!input.trim()&&!file)} className={`ipt-send${!loading&&(input.trim()||file)?" active":""}`}>→</button>
          </div>
          <div className="ipt-ft">Claude Sonnet 4 · {FINANCIAL_DATA.year} 연결 · 최종 판단은 IR팀 확인 필요</div>
        </div>
      </main>
    </div>
  );
}
