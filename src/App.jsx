import { useState, useRef, useEffect } from "react";

const FD = {
  year: "FY2024", period: "2025.04.01 ~ 2026.03.31",
  c: { assets: 79195, liab: 10903, equity: 68291, revenue: 27098 },
};

const DK = `[크래프톤 공시기준표 - FY2024 연결재무제표 기준, 적용기간 2025.04.01~2026.03.31]
■ 기준 재무정보(연결): 자산총액 7조9,195억원, 부채총액 1조903억원, 자기자본 6조8,291억원, 매출액 2조7,098억원
■ 기준 재무제표: 종속회사가 있는 주권상장법인은 연결재무제표 기준, 최근 사업연도말 재무제표상 수치 적용

■ 수시공시 기준표
[1. 영업 및 생산활동]
1) 영업정지·행정처분: 매출2.5%=677억, 당일, 공시규정7조①1가, 주요사항보고O, 거래정지O
2) 거래처 거래중단: 매출2.5%=677억, 당일, 7조①1나
3) 단일판매/공급계약 체결·해지: 매출2.5%=677억, 익일, 7조①1다, 공시번복O, 공시변경50%
4) 제품 수거·파기: 매출2.5%=677억, 당일, 7조①1라
5) 생산활동 중단·폐업: 매출2.5%=677억, 당일, 7조①1마, 거래정지O

[2. 재무구조 - 발행증권]
1) 유상증자·무상증자·자본감소: 당일, 7조①2가(1), 주요사항보고O, 거래정지O, 공시번복O, 변경20%
2) 주식소각: 당일, 7조①2가(2), 거래정지O, 공시번복O, 변경20%
3) 자기주식 취득·처분: 당일, 7조①2가(3), 주요사항보고O, 공시번복O
4) 주식분할/병합: 당일, 7조①2가(4), 공시번복O, 변경20%
6) CB/BW/EB/DR/조건부자본증권: 당일, 7조①2가(6), 주요사항보고O, 거래정지O, 변경50%
8) 상장폐지결정: 당일, 7조①2가(8), 거래정지O, 공시번복O

[2. 재무구조 - 투자활동]
10) 시설투자·시설증설: 자기자본5%=3,414억, 당일, 7조①2나(1), 변경50%
11) 유형자산 취득·처분: 자산2.5%=1,979억, 당일, 7조①2나(2), 주요사항보고O, 변경50%
12) 타법인주식·출자증권 취득·처분: 자기자본2.5%=1,707억, 당일, 7조①2나(3), 주요사항보고O, 공시번복O, 변경50%
13) 피출자비상장법인 부도등: 자기자본2.5%=1,707억, 익일, 7조①2나(4)

[2. 재무구조 - 채권채무]
14) 단기차입금 증가: 자기자본5%=3,414억, 당일, 7조①2다(1), 변경50%
15) 채무인수·면제: 자기자본2.5%=1,707억, 당일, 7조①2다(2), 변경50%
16) 담보제공·채무보증: 자기자본2.5%=1,707억, 당일, 7조①2다(3), 변경50%
17) 피보증법인 부도등: 자기자본2.5%=1,707억, 익일, 7조①2다(4)
18) 사채원리금 미지급: 자기자본2.5%=1,707억, 당일, 7조①2다(5)
19) 대출원리금 미지급: 자기자본2.5%=1,707억, 당일, 7조①2다(6)
20) 선급금/가지급/대여: 자기자본2.5%=1,707억, 당일, 7조①2다(7), 변경50%

[2. 재무구조 - 손익]
21) 재해발생: 자산2.5%=1,979억, 당일, 7조①2라(1)
22) 벌금·과태료등: 자기자본2.5%=1,707억, 당일, 7조①2라(2)
23) 횡령·배임: 자기자본2.5%=1,707억, 당일, 7조①2라(3), 거래정지O
24) 파생상품손실: 자기자본2.5%=1,707억, 익일, 7조①2라(4)
25) 가장납입: 자기자본2.5%=1,707억, 당일, 7조①2라(5), 거래정지O
26) 손상차손(매출채권外): 자기자본25%=1조7,072억, 당일, 7조①2라(6), 거래정지O

[2. 결산] 27~32) 감사의견부적정, 반기검토의견부적정, 손익구조변경, 주식배당, 현금배당, 회계처리기준위반 - 당일, 거래정지O

[3. 지배구조/구조개편]
1) 최대주주변경: 익일, 7조①3가(1)
3) 주식교환·이전: 당일, 7조①3가(4), 주요사항보고O, 거래정지O
4) 영업양수도/합병/분할: 당일, 7조①3가(5), 주요사항보고O, 거래정지O, 변경50%/20%
5) 간이합병·소규모합병: 당일, 7조①3가(6), 주요사항보고O

[3. 존립] 부도, 회생절차, 해산: 당일, 7조①3나, 주요사항보고O, 거래정지O
[3. 소송] 증권소송, 청구금액 자기자본2.5%(1,707억)이상 소송, 경영권분쟁: 당일, 7조①3다

[4. 포괄공시] 영업·생산:677억, 재무구조:1,707억, 투자활동:1,979억 (당일, 7조①4)

■ 주요사항보고서(자본시장법161조): 자산양수도(자산10%=7,919억), 영업양수도(자산/매출/부채10%), 합병/분할(3일이내)
■ 공정공시: 중요정보 선별제공시 사전(10분전) 공시. 대상: 사업계획, 영업실적전망, 잠정실적
■ 공정거래위원회: 자산5조이상 기업집단. 대규모내부거래(50억이상 또는 MAX[자본금,자본총계]×5%) 이사회의결후 1일내
■ 불성실공시: 10점→매매거래정지1일, 15점→관리종목. 벌점1~4점: 400만원/점, 5~9점: 1,000만원/점, 10점+: 2,000만원/점
■ 자율공시: 수시공시 미달시 가능. 번복시 불성실공시 해당
■ 종속회사: 지배회사 연결F/S에 중대한 영향시 지배회사 공시의무 발생. 종속회사 담당자가 지배회사 공시부서에 즉시 전달해야 함`;

const SP = `당신은 크래프톤(KRAFTON)의 공시 전문 AI 어시스턴트입니다.
[역할] 계약서/거래 내용에 대해 공시 대상 여부를 정확하게 판단합니다.
- 공시대상이면: 공시항목, 근거규정, 기준금액, 공시기한, 주요사항보고 여부, 거래정지 여부를 구체적으로 안내
- 비대상이면: 이유 + 자율공시 해당 여부 검토
- 불확실하면: "확인이 필요합니다" 또는 "IR팀과 협의하시기 바랍니다"
- 추측/확인되지 않은 내용을 단정적으로 말하지 않습니다
[답변형식] 핵심 결론 먼저 → 근거 제시. 마크다운 사용. 금액비교 반드시 포함. 복수 항목 해당시 모두 안내.
${DK}`;

async function callAPI(msgs, fileData) {
  const content = [];
  if (fileData) {
    if (fileData.type === "application/pdf") content.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: fileData.base64 } });
    else if (fileData.type.startsWith("image/")) content.push({ type: "image", source: { type: "base64", media_type: fileData.type, data: fileData.base64 } });
    content.push({ type: "text", text: fileData.msg || "이 문서를 분석하여 공시 대상 여부를 판단해주세요. 계약 금액, 거래 유형, 상대방을 파악하고 해당 공시 항목과 기준금액을 비교하여 구체적으로 답변해주세요." });
  }
  const apiMsgs = msgs.map((m, i) => ({
    role: m.role,
    content: m.role === "user" && fileData && i === msgs.length - 1 ? content : m.content,
  }));
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, system: SP, messages: apiMsgs }),
  });
  const d = await r.json();
  return d.content?.map(b => b.text || "").join("") || "응답을 생성하지 못했습니다.";
}

function Md({ text }) {
  const fmt = (t) => {
    const p = []; const rx = /\*\*(.*?)\*\*/g; let m, li = 0, k = 0;
    while ((m = rx.exec(t)) !== null) { if (m.index > li) p.push(<span key={k++}>{t.slice(li, m.index)}</span>); p.push(<strong key={k++}>{m[1]}</strong>); li = rx.lastIndex; }
    if (li < t.length) p.push(<span key={k++}>{t.slice(li)}</span>); return p.length ? p : t;
  };
  const lines = text.split("\n"), els = []; let tbl = [], inT = false;
  const flush = (k) => { if (!tbl.length) return; const h = tbl[0], b = tbl.slice(1);
    els.push(<div key={`t${k}`} style={{overflowX:"auto",margin:"10px 0"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}><thead><tr>{h.map((c,i)=><th key={i} style={{padding:"7px 10px",border:"1px solid #e2e8f0",background:"#f1f5f9",fontWeight:600,textAlign:"left",whiteSpace:"nowrap"}}>{fmt(c.trim())}</th>)}</tr></thead><tbody>{b.map((r,ri)=><tr key={ri}>{r.map((c,ci)=><td key={ci} style={{padding:"6px 10px",border:"1px solid #e2e8f0"}}>{fmt(c.trim())}</td>)}</tr>)}</tbody></table></div>);
    tbl = [];
  };
  for (let i = 0; i < lines.length; i++) { const l = lines[i];
    if (l.trim().startsWith("|") && l.trim().endsWith("|")) { if (l.includes("---")) continue; inT = true; tbl.push(l.split("|").slice(1, -1)); continue; }
    else if (inT) { flush(i); inT = false; }
    if (l.startsWith("## ")) els.push(<h3 key={i} style={{margin:"14px 0 6px",fontSize:15,fontWeight:700,color:"#0f172a"}}>{fmt(l.slice(3))}</h3>);
    else if (l.startsWith("### ")) els.push(<h4 key={i} style={{margin:"10px 0 4px",fontSize:13.5,fontWeight:600,color:"#334155"}}>{fmt(l.slice(4))}</h4>);
    else if (l.startsWith("- ")||l.startsWith("• ")) els.push(<div key={i} style={{paddingLeft:16,position:"relative",margin:"2px 0"}}><span style={{position:"absolute",left:4}}>•</span>{fmt(l.slice(2))}</div>);
    else if (l.match(/^\d+\.\s/)) els.push(<div key={i} style={{paddingLeft:16,margin:"2px 0"}}>{fmt(l)}</div>);
    else if (!l.trim()) els.push(<div key={i} style={{height:6}}/>);
    else els.push(<p key={i} style={{margin:"3px 0"}}>{fmt(l)}</p>);
  }
  if (inT) flush(lines.length);
  return <div style={{lineHeight:1.7}}>{els}</div>;
}

function Dash({ hist, onClose }) {
  const s = { t: hist.length, y: hist.filter(h=>h.r==="공시대상").length, n: hist.filter(h=>h.r==="비공시").length, m: hist.filter(h=>h.r==="확인필요").length };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#fff",borderRadius:20,maxWidth:680,width:"100%",maxHeight:"85vh",overflow:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"24px 28px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h2 style={{fontSize:18,fontWeight:700}}>📊 공시 판단 이력</h2>
          <button onClick={onClose} style={{border:"none",background:"none",fontSize:22,cursor:"pointer",color:"#94a3b8"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,padding:"16px 28px"}}>
          {[{l:"전체",v:s.t,c:"#6366f1",bg:"#eef2ff"},{l:"공시대상",v:s.y,c:"#16a34a",bg:"#f0fdf4"},{l:"비공시",v:s.n,c:"#dc2626",bg:"#fef2f2"},{l:"확인필요",v:s.m,c:"#d97706",bg:"#fffbeb"}].map(x=>(
            <div key={x.l} style={{background:x.bg,borderRadius:12,padding:"14px",textAlign:"center"}}><div style={{fontSize:24,fontWeight:800,color:x.c}}>{x.v}</div><div style={{fontSize:11,color:x.c,fontWeight:600,marginTop:2}}>{x.l}</div></div>
          ))}
        </div>
        <div style={{padding:"0 28px 24px"}}>{hist.length===0?<div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>아직 이력이 없습니다.</div>:
          <div style={{display:"flex",flexDirection:"column",gap:8}}>{hist.slice(0,30).map(h=>(
            <div key={h.id} style={{border:"1px solid #e2e8f0",borderRadius:12,padding:"12px 16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                <div style={{fontSize:13,color:"#1e293b",fontWeight:500,flex:1}}>{h.q?.slice(0,80)}</div>
                <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:10,background:h.r==="공시대상"?"#dcfce7":h.r==="비공시"?"#fee2e2":"#fef3c7",color:h.r==="공시대상"?"#16a34a":h.r==="비공시"?"#dc2626":"#d97706"}}>{h.r}</span>
              </div>
              <div style={{fontSize:11,color:"#94a3b8",marginTop:4}}>{new Date(h.ts).toLocaleDateString("ko-KR")} {new Date(h.ts).toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"})}{h.fn?` · 📎 ${h.fn}`:""}</div>
            </div>
          ))}</div>
        }</div>
      </div>
    </div>
  );
}

const SUGG = ["2,000억원 규모의 타법인 주식 취득은 공시 대상이야?","700억원 판매계약 체결하면 공시해야 해?","종속회사가 합병결정하면 지배회사도 공시해야 해?","공정공시 제도 설명해줘","대규모 내부거래 공시 기준이 뭐야?","현재 공시 기준금액 전체 알려줘"];

export default function App() {
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState("");
  const [ld, setLd] = useState(false);
  const [file, setFile] = useState(null);
  const [dash, setDash] = useState(false);
  const [hist, setHist] = useState([]);
  const endRef = useRef(null);
  const fRef = useRef(null);

  useEffect(() => { try { setHist(JSON.parse(localStorage.getItem("kd-h")||"[]")); } catch{} }, []);
  useEffect(() => { endRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const addHist = (e) => { const h=JSON.parse(localStorage.getItem("kd-h")||"[]"); h.unshift({...e,id:Date.now(),ts:new Date().toISOString()}); if(h.length>100)h.pop(); localStorage.setItem("kd-h",JSON.stringify(h)); setHist(h); };

  const pickFile = (f) => {
    if(!f) return;
    if(!["application/pdf","image/png","image/jpeg","image/webp"].includes(f.type)){alert("PDF/이미지만 가능");return;}
    if(f.size>20*1024*1024){alert("20MB 이하만 가능");return;}
    const rd=new FileReader(); rd.onload=()=>setFile({name:f.name,type:f.type,size:f.size,base64:rd.result.split(",")[1]}); rd.readAsDataURL(f);
  };

  const send = async (txt) => {
    const q=txt||inp.trim(); if(!q&&!file) return;
    const um={role:"user",content:file?`[📎 ${file.name}] ${q||"이 문서를 분석하여 공시 대상 여부를 판단해주세요."}`:q,fn:file?.name};
    setMsgs(p=>[...p,um]); setInp(""); setLd(true);
    const cf=file; setFile(null);
    try {
      const am=[...msgs,{role:"user",content:q||"이 문서를 분석하여 공시 대상 여부를 판단해주세요."}].filter(m=>m.role==="user"||m.role==="assistant").slice(-10);
      const resp=await callAPI(am,cf?{...cf,msg:q||undefined}:null);
      setMsgs(p=>[...p,{role:"assistant",content:resp}]);
      let r="확인필요";
      if(resp.includes("공시 대상입니다")||resp.includes("공시대상입니다")||resp.includes("✅")) r="공시대상";
      else if(resp.includes("공시 대상이 아닙")||resp.includes("해당하지 않")||resp.includes("미달")) r="비공시";
      addHist({q:um.content.slice(0,200),r,fn:cf?.name||null});
    } catch(e) { setMsgs(p=>[...p,{role:"assistant",content:`⚠️ API 오류: ${e.message}`}]); }
    setLd(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#f8fafc,#eef2ff 50%,#f0f9ff)",fontFamily:"'Pretendard Variable','Noto Sans KR',-apple-system,sans-serif",display:"flex",flexDirection:"column"}}>
      <style>{`@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,80%,100%{transform:scale(.5);opacity:.3}40%{transform:scale(1);opacity:1}}*{box-sizing:border-box;margin:0}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px}textarea:focus,button:focus{outline:none}`}</style>

      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#0c0f1a,#1a1f3a 50%,#0f172a)",padding:"16px 20px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 20px rgba(0,0,0,.2)",position:"sticky",top:0,zIndex:100}}>
        <div style={{width:40,height:40,borderRadius:11,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,boxShadow:"0 2px 12px rgba(99,102,241,.4)"}}>📊</div>
        <div style={{flex:1}}><div style={{color:"#f1f5f9",fontSize:16,fontWeight:700}}>KRAFTON 공시 판단 도우미</div><div style={{color:"#6b7fa3",fontSize:11,marginTop:1}}>공시기준표 {FD.period} · Claude AI 기반</div></div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={()=>setDash(true)} style={{background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"7px 14px",color:"#94a3b8",fontSize:12,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>📋 이력{hist.length>0&&<span style={{background:"#6366f1",color:"#fff",borderRadius:8,padding:"1px 6px",fontSize:10}}>{hist.length}</span>}</button>
          <span style={{background:"rgba(34,197,94,.12)",color:"#4ade80",padding:"7px 12px",borderRadius:10,fontSize:11,fontWeight:600}}>● AI 연결됨</span>
        </div>
      </div>

      {/* Chat */}
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px",maxWidth:880,margin:"0 auto",width:"100%"}}>
        {msgs.length===0&&(
          <div style={{animation:"fadeUp .5s ease"}}>
            <div style={{textAlign:"center",padding:"40px 20px 24px"}}><div style={{fontSize:48,marginBottom:16}}>📊</div><h1 style={{fontSize:22,fontWeight:800,color:"#0f172a",marginBottom:8}}>크래프톤 공시 판단 도우미</h1><p style={{fontSize:14,color:"#64748b",lineHeight:1.6}}>거래 내용을 설명하거나 계약서를 업로드하면<br/><strong>공시 대상 여부</strong>를 AI가 판단해 드립니다.</p></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12,marginBottom:24,padding:"0 8px"}}>
              {[{i:"📄",t:"계약서 분석",d:"PDF/이미지 업로드 시 AI가 자동으로 계약 내용을 분석하여 공시 대상 여부를 판단합니다."},{i:"💬",t:"자연어 질의",d:"\"2,000억 투자\" 같이 자연어로 질문하면 해당 공시항목, 기준금액, 근거규정을 안내합니다."},{i:"📊",t:"이력 관리",d:"모든 공시 판단 결과가 자동 저장되어 이력 조회 및 통계 확인이 가능합니다."}].map(f=>(
                <div key={f.t} style={{background:"#fff",borderRadius:14,padding:"18px 20px",border:"1px solid #e8edf2"}}><div style={{fontSize:24,marginBottom:8}}>{f.i}</div><div style={{fontSize:13.5,fontWeight:700,color:"#1e293b",marginBottom:4}}>{f.t}</div><div style={{fontSize:12,color:"#64748b",lineHeight:1.5}}>{f.d}</div></div>
              ))}
            </div>
            <div style={{padding:"0 8px"}}><div style={{fontSize:12,color:"#64748b",fontWeight:600,marginBottom:10}}>💡 이런 질문을 해보세요</div><div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {SUGG.map((q,i)=><button key={i} onClick={()=>send(q)} style={{background:"#fff",border:"1px solid #d4d9e1",borderRadius:20,padding:"8px 15px",fontSize:12.5,color:"#374151",cursor:"pointer",transition:"all .15s",lineHeight:1.3}} onMouseEnter={e=>{e.target.style.background="#eef2ff";e.target.style.borderColor="#818cf8";e.target.style.color="#4338ca"}} onMouseLeave={e=>{e.target.style.background="#fff";e.target.style.borderColor="#d4d9e1";e.target.style.color="#374151"}}>{q}</button>)}
            </div></div>
          </div>
        )}

        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:16,animation:"fadeUp .3s ease"}}>
            {m.role!=="user"&&<div style={{width:34,height:34,borderRadius:10,flexShrink:0,marginRight:10,marginTop:2,background:"linear-gradient(135deg,#0f172a,#334155)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>📊</div>}
            <div style={{maxWidth:m.role==="user"?"75%":"82%",padding:m.role==="user"?"10px 16px":"16px 20px",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:m.role==="user"?"linear-gradient(135deg,#1e293b,#334155)":"#fff",color:m.role==="user"?"#f1f5f9":"#1e293b",fontSize:13.5,boxShadow:m.role==="user"?"0 2px 8px rgba(0,0,0,.1)":"0 1px 6px rgba(0,0,0,.06)",border:m.role==="user"?"none":"1px solid #e8edf2"}}>
              {m.role==="user"?<div>{m.fn&&<div style={{background:"rgba(255,255,255,.1)",borderRadius:8,padding:"5px 10px",marginBottom:6,fontSize:12}}>📎 {m.fn}</div>}<span>{m.content.replace(/^\[📎.*?\]\s*/,"")}</span></div>:<Md text={m.content}/>}
            </div>
          </div>
        ))}

        {ld&&<div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,animation:"fadeUp .3s ease"}}><div style={{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,#0f172a,#334155)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>📊</div><div style={{background:"#fff",padding:"14px 20px",borderRadius:"18px 18px 18px 4px",border:"1px solid #e8edf2",display:"flex",alignItems:"center",gap:8}}><div style={{display:"flex",gap:4}}>{[0,1,2].map(j=><div key={j} style={{width:7,height:7,borderRadius:"50%",background:"#6366f1",animation:`pulse 1.4s ${j*.2}s infinite ease-in-out`}}/>)}</div><span style={{fontSize:12.5,color:"#64748b"}}>공시 기준 분석 중...</span></div></div>}
        <div ref={endRef}/>
      </div>

      {/* File badge */}
      {file&&<div style={{maxWidth:880,margin:"0 auto",width:"100%",padding:"0 16px"}}><div style={{background:"#eef2ff",borderRadius:12,padding:"8px 14px",display:"flex",alignItems:"center",gap:8,marginBottom:4,border:"1px solid #c7d2fe"}}>
        <span style={{fontSize:18}}>{file.type==="application/pdf"?"📄":"🖼️"}</span>
        <div style={{flex:1}}><div style={{fontSize:12.5,fontWeight:600,color:"#3730a3"}}>{file.name}</div><div style={{fontSize:11,color:"#6366f1"}}>{(file.size/1024).toFixed(0)} KB</div></div>
        <button onClick={()=>setFile(null)} style={{border:"none",background:"rgba(99,102,241,.1)",borderRadius:6,width:24,height:24,cursor:"pointer",fontSize:13,color:"#6366f1",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div></div>}

      {/* Input */}
      <div style={{position:"sticky",bottom:0,background:"linear-gradient(to top,#f8fafc 85%,transparent)",padding:"8px 16px 18px"}}>
        <div style={{maxWidth:880,margin:"0 auto",display:"flex",gap:8,alignItems:"flex-end"}}>
          <input ref={fRef} type="file" accept=".pdf,image/*" style={{display:"none"}} onChange={e=>pickFile(e.target.files[0])}/>
          <button onClick={()=>!ld&&fRef.current?.click()} disabled={ld} style={{width:40,height:40,borderRadius:10,border:"1.5px solid #d1d5db",background:"#f8fafc",cursor:ld?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,opacity:ld?.5:1}} title="계약서 업로드">📎</button>
          <div style={{flex:1,background:"#fff",borderRadius:18,border:"1.5px solid #d1d5db",padding:"10px 16px",display:"flex",alignItems:"center",boxShadow:"0 2px 10px rgba(0,0,0,.04)"}}>
            <textarea value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={file?"추가 질문을 입력하거나 바로 전송...":"공시 관련 질문 또는 거래 내용을 입력하세요..."} rows={1} disabled={ld} style={{flex:1,border:"none",background:"transparent",fontSize:13.5,color:"#1e293b",resize:"none",fontFamily:"inherit",lineHeight:1.4}}/>
          </div>
          <button onClick={()=>send()} disabled={ld||(!inp.trim()&&!file)} style={{width:44,height:44,borderRadius:"50%",border:"none",background:(inp.trim()||file)&&!ld?"linear-gradient(135deg,#6366f1,#8b5cf6)":"#e2e8f0",color:"#fff",fontSize:18,cursor:(inp.trim()||file)&&!ld?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",flexShrink:0,boxShadow:(inp.trim()||file)&&!ld?"0 3px 12px rgba(99,102,241,.35)":"none"}}>↑</button>
        </div>
        <div style={{textAlign:"center",fontSize:10.5,color:"#94a3b8",marginTop:8}}>공시기준표 기준일 2025.04.01 · AI 판단은 참고용이며, 최종 판단은 반드시 IR팀과 확인하세요</div>
      </div>

      {dash&&<Dash hist={hist} onClose={()=>setDash(false)}/>}
    </div>
  );
}
