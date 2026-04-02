import { useState, useRef, useEffect, useCallback } from "react";

// ============================================================
// 공시 기준 데이터
// ============================================================
const FINANCIAL_DATA = {
  year: "FY2025",
  consolidated: {
    assets: 6800,
    liabilities: 1235,
    equity: 5565,
    revenue: 4327,
  },
  thresholds: {
    revenue_2_5: 108,
    equity_2_5: 139,
    equity_5: 278,
    assets_2_5: 170,
    assets_10: 680,
    equity_25: 1391,
  },
};

// ============================================================
// System Prompt (기본 지시사항 — 규정 원문은 런타임에 추가)
// ============================================================
const SYSTEM_PROMPT_BASE = `당신은 네오위즈(Neowiz)의 공시 판단 전문 AI 어시스턴트입니다. 
사용자가 계약서, 거래 내용, 또는 공시 관련 질문을 하면, 반드시 아래에 첨부된 코스닥시장 공시규정, 업무규정, 업무규정 시행세칙 원문을 꼼꼼히 확인한 후, 해당 조항을 근거로 정확하게 답변해야 합니다.

## 중요 지시사항
1. **반드시 규정 원문을 먼저 확인하세요.** 아래에 코스닥시장 공시규정 전문이 첨부되어 있습니다. 답변하기 전에 관련 조항을 찾아 읽고, 그 조항을 근거로 답변하세요.
2. **추측하지 마세요.** 규정 원문에서 근거를 찾을 수 없으면 "규정 원문에서 명확한 근거를 찾기 어렵습니다"라고 솔직하게 말하세요.
3. **조항 번호를 정확히 인용하세요.** (예: "공시규정 제6조 제1항 제2호 마목 (3)")
4. **네오위즈는 대규모법인(대기업)입니다.** 자산총액 6,800억원으로 2,000억원 이상이므로, 규정에서 "대규모법인"이나 "대기업" 기준이 별도로 있는 경우 그 기준을 적용하세요.
5. **답변 순서를 반드시 지키세요.** 먼저 근거 규정과 분석을 작성하고, 분석이 끝난 후 맨 마지막에 최종 결론(공시 대상 O/X)을 작성하세요. 절대로 분석 전에 결론을 먼저 쓰지 마세요. 이는 분석 중 결론이 바뀌어 앞뒤가 모순되는 것을 방지하기 위함입니다.

## 답변 형식 (반드시 이 순서를 따르세요)
1. 근거 규정 (해당 조항 원문 인용)
2. 네오위즈 적용 기준 (대규모법인 여부, 기준금액 등)
3. 판단 분석 (기준금액 비교, 해당 여부 검토)
4. **최종 결론** (공시 대상 O 또는 X — 반드시 맨 마지막에 작성)
5. 공시 의무사항 (공시기한, 제출처, 첨부서류 등)
6. 주의사항

모르는 내용은 반드시 "정확한 답변이 어렵습니다"라고 말하세요. 추측하거나 아무 말이나 하면 안 됩니다.

## 적용 기간
FY2025 연결재무제표 기준 (2025년 4분기 기준)

## 네오위즈 기준 재무정보 (FY2025 연결)
- 자산총액: 6,800억원 (680,067백만원)
- 부채총액: 1,235억원 (123,544백만원)
- 자기자본: 5,565억원 (556,523백만원)
- 매출액: 4,327억원 (432,725백만원)

## 네오위즈 종속기업 현황 (2025.12.31 기준, 총 21개)
1. ㈜티앤케이팩토리 (58.83%)
2. 지온인베스트먼트㈜ (100%)
3. NEOWIZ Play Studio Hong Kong Ltd. (100%)
4. NEOWIZ GameOn Corp (100%)
5. ㈜네오팝 (84.57%)
6. ㈜콩닥스튜디오 (100%)
7. ㈜스티키핸즈 (100%)
8. ㈜겜플리트 (80%)
9. ㈜하이디어 (100%)
10. ㈜네오위즈스포츠 (100%)
11. ㈜블루스카이게임즈 (100%)
12. ㈜파우게임즈 (51.27%)
13. ㈜퀵윈스튜디오 (100%)
14. BNG Software Limited (100%)
15. INTELLA PTE, LTD. (100%)
16. Massive Gaming PTY, LTD. (100%)
17. Novaflow Labs Ltd. (100%)
18. NEOWIZ Santa Monica (100%)
19. PROPEL WAVES GAMES PTY LTD (100%)
20. Massive Gaming Malta Limited (100%)
21. NEOWIZ TAIWAN LTD. (100%)

## 수시공시 기준표

### 1. 영업 및 생산활동 관련 사항
| 공시항목 | 기준 | 기준금액 | 공시기한 | 근거규정 | 주요사항보고 | 거래정지 | 공시번복 | 공시변경 |
|---------|------|---------|---------|---------|------------|---------|---------|---------|
| 영업 일부/전부 정지·행정처분 | 매출2.5% | 108억 | 당일 | 공시규정7조①1가 | O | O | - | - |
| 거래처와의 거래중단 | 매출2.5% | 108억 | 당일 | 공시규정7조①1나 | - | - | - | - |
| 단일판매/공급계약 체결·해지 | 매출2.5% | 108억 | 익일 | 공시규정7조①1다 | - | - | O | 50% |
| 제품 수거·파기 | 매출2.5% | 108억 | 당일 | 공시규정7조①1라 | - | - | - | - |
| 생산활동 중단·폐업 | 매출2.5% | 108억 | 당일 | 공시규정7조①1마 | - | O | - | - |

### 2. 재무구조 관련사항
#### 가. 발행증권
| 공시항목 | 공시기한 | 근거규정 | 주요사항보고 | 거래정지 | 공시번복 | 공시변경 |
|---------|---------|---------|------------|---------|---------|---------|
| 유상증자·무상증자·자본감소 | 당일 | 공시규정7조①2가(1) | O | O | O | 20% |
| 주식소각 | 당일 | 공시규정7조①2가(2) | - | O | O | 20% |
| 자기주식 취득·처분(신탁계약 등) | 당일 | 공시규정7조①2가(3) | O | - | O | 예정기간내 미달 |
| 주식분할/병합 | 당일 | 공시규정7조①2가(4) | - | - | O | 20% |
| CB,BW,EB,DR,조건부자본증권 | 당일 | 공시규정7조①2가(6) | O | O | O | 50% |

#### 나. 투자활동
| 공시항목 | 기준 | 기준금액 | 공시기한 | 근거규정 | 주요사항보고 | 공시변경 |
|---------|------|---------|---------|---------|------------|---------|
| 신규시설투자·시설증설 | 자기자본5% | 278억 | 당일 | 공시규정7조①2나(1) | - | 50% |
| 유형자산 취득·처분 | 자산2.5% | 170억 | 당일 | 공시규정7조①2나(2) | O | 50% |
| 타법인주식·출자증권 취득·처분 | 자기자본2.5% | 139억 | 당일 | 공시규정7조①2나(3) | O | 50% |
| 피출자 비상장법인 부도 등 | 자기자본2.5% | 139억 | 익일 | 공시규정7조①2나(4) | - | - |

#### 다. 채권·채무
| 공시항목 | 기준 | 기준금액 | 공시기한 | 근거규정 | 공시변경 |
|---------|------|---------|---------|---------|---------|
| 단기차입금 증가 | 자기자본5% | 278억 | 당일 | 공시규정7조①2다(1) | 50% |
| 채무인수·면제 | 자기자본2.5% | 139억 | 당일 | 공시규정7조①2다(2) | 50% |
| 담보제공·채무보증 | 자기자본2.5% | 139억 | 당일 | 공시규정7조①2다(3) | 50% |
| 피보증법인 부도 등 | 자기자본2.5% | 139억 | 익일 | 공시규정7조①2다(4) | - |
| 사채원리금 미지급(누계) | 자기자본2.5% | 139억 | 당일 | 공시규정7조①2다(5) | - |
| 대출원리금 미지급(누계) | 자기자본2.5% | 139억 | 당일 | 공시규정7조①2다(6) | - |
| 선급금·가지급·대여금 | 자기자본2.5% | 139억 | 당일 | 공시규정7조①2다(7) | 50% |

#### 라. 손익
| 공시항목 | 기준 | 기준금액 | 공시기한 | 근거규정 | 거래정지 |
|---------|------|---------|---------|---------|---------|
| 재해발생 | 자산2.5% | 170억 | 당일 | 공시규정7조①2라(1) | - |
| 벌금·과태료·추징금 등 | 자기자본2.5% | 139억 | 당일 | 공시규정7조①2라(2) | - |
| 횡령·배임 | 자기자본2.5% | 139억 | 당일 | 공시규정7조①2라(3) | O |
| 파생상품 손실(누계) | 자기자본2.5% | 139억 | 익일 | 공시규정7조①2라(4) | - |
| 가지급납입 | 자기자본2.5% | 139억 | 당일 | 공시규정7조①2라(5) | O |
| 매출채권외 손상차손(누계) | 자기자본25% | 1,391억 | 당일 | 공시규정7조①2라(6) | O |

#### 마. 결산
- 감사보고서(부적정 등, 자본잠식50%↑, 매출50억↓): 당일, 거래정지O
- 반기검토보고서 부적정·의견거절: 당일, 거래정지O
- 내부결산 매출액·손익구조 변경: 당일, 거래정지O
- 주식배당: 당일, 거래정지O, 공시번복O, 공시변경20%
- 현금·현물배당, 중간·분기배당: 당일, 공시번복O, 공시변경20%

### 3. 기업경영활동 관련 사항
| 공시항목 | 공시기한 | 근거규정 | 주요사항보고 | 거래정지 |
|---------|---------|---------|------------|---------|
| 최대주주 변경 | 익일 | 공시규정7조①3가(1) | - | - |
| 주식의 포괄적 교환·이전 | 당일 | 공시규정7조①3가(4) | O | O |
| 영업양수도·합병·분할·분할합병 | 당일 | 공시규정7조①3가(5) | O | O |
| 간이합병·소규모합병 | 당일 | 공시규정7조①3가(6) | O | - |
| 부도·은행거래정지 | 당일 | 공시규정7조①3나(1) | O | O |
| 회생절차·파산 | 당일 | 공시규정7조①3나(2) | O | O |
| 해산사유 발생 | 당일 | 공시규정7조①3나(3) | O | O |
| 소송(자기자본2.5%=139억↑) | 당일 | 공시규정7조①3다(2) | - | - |
| 경영권분쟁 소송 | 당일 | 공시규정7조①3다(3) | - | - |

### 4. 포괄공시
- 영업·생산활동: 108억 이상
- 재무구조 등: 139억 이상
- 투자활동 등: 170억 이상

## 주요사항보고서 (금융위 제출)
- 중요한 기타자산 양수·양도: 자산10% = 680억, 익일
- 풋백옵션 계약체결: 자산10% = 680억, 익일
- 중요한 영업 양수·양도: 자산/매출/부채 10%, 당일
- 중요한 자산 양수·양도: 자산10% = 680억, 당일
- 합병·분할·주식교환이전: 3일 이내

## 자율공시 (수시공시 기준 미달 시)
수시공시 기준금액에 미달하더라도 투자자에게 알릴 필요가 있으면 자율공시 가능.
자율공시 후 번복·변경 시에도 불성실공시에 해당하므로 주의.

## 공정거래위원회 공시
네오위즈는 자산총액 5조원 미만으로 공정거래위원회 공시대상기업집단이 아닙니다.
따라서 대규모내부거래 공시, 기업집단현황 공시 등의 의무는 없습니다.

## 공정공시
미공시정보를 특정인에게 선별 제공 전 공시. 정보제공 10분 전까지.
대상정보: 장래사업계획, 영업실적 전망, 잠정실적, 수시공시 미신고 사항.

## 불성실공시
- 공시불이행/공시번복/공시변경 시 벌점 부과
- 10점↑: 매매거래정지 1일 + 제재금(1점당 2,000만원)
- 15점↑: 관리종목 지정

## 종속회사 공시
지배회사(네오위즈) 연결재무제표에 중대한 영향을 미칠 만한 종속회사의 사항도 공시대상.
종속회사의 이사회 결정 등이 지배회사의 공시의무를 발생시킬 수 있으므로, 종속회사 담당자가 지배회사 공시담당부서에 즉시 전달해야 함.

위에 명시된 21개 종속기업 중 어떤 회사에서 발생한 거래인지 확인하고, 네오위즈 연결재무제표 기준으로 공시 판단을 해야 합니다.

## 답변 형식 가이드
1. 공시 대상 여부를 먼저 명확히 답변 (O/X)
2. 해당 근거규정 명시
3. 공시기한 명시
4. 주요사항보고 해당 여부
5. 매매거래정지 가능 여부
6. 자율공시 해당 가능성
7. 공정거래위원회 공시 해당 여부 (네오위즈는 미해당)
8. 종속회사 관련 사항인 경우 어느 회사인지 명시
9. 주의사항이나 실무 팁

계약서가 업로드된 경우:
1. 계약서의 핵심 내용(당사자, 금액, 거래유형)을 먼저 요약
2. 종속기업 관련인지 확인
3. 해당하는 공시항목을 모두 검토
4. 각 항목별 공시 대상 여부 판단 (기준금액 비교)
5. 공시기한, 근거규정, 첨부서류 안내
6. 공정거래위원회 공시는 미해당임을 안내

항상 한국어로 답변하고, 마크다운 형식을 사용하세요.`;

// ============================================================
// 규정 원문 텍스트 파일 로딩
// ============================================================
const REGULATION_FILES = [
  { name: "코스닥시장 공시규정", path: "/kosdaq_disclosure_regulation.txt", full: true },
  { name: "코스닥시장 업무규정", path: "/kosdaq_business_regulation.txt", full: false },
  { name: "코스닥시장 업무규정 시행세칙", path: "/kosdaq_business_enforcement.txt", full: false },
];

async function loadRegulationTexts() {
  const texts = [];
  for (const file of REGULATION_FILES) {
    try {
      const response = await fetch(file.path);
      if (response.ok) {
        const text = await response.text();
        texts.push({ name: file.name, text, full: file.full });
      }
    } catch (e) {
      console.error(`Failed to load ${file.name}:`, e);
    }
  }
  return texts;
}

function buildSystemPrompt(regulations) {
  let prompt = SYSTEM_PROMPT_BASE;
  if (regulations && regulations.length > 0) {
    prompt += `\n\n${"=".repeat(60)}\n아래는 코스닥시장 규정 원문입니다. 반드시 이 원문을 참조하여 답변하세요.\n${"=".repeat(60)}\n`;
    for (const reg of regulations) {
      if (reg.full) {
        // 공시규정은 전문 포함
        prompt += `\n\n${"─".repeat(40)}\n## ${reg.name} (원문 전문)\n${"─".repeat(40)}\n${reg.text}`;
      }
      // 업무규정/시행세칙은 공시 판단에 직접 관련이 적으므로 전문을 포함하지 않음
      // (매매거래, 결제, 호가 등 시장운영 규정이 대부분)
    }
    prompt += `\n\n## 참고사항\n업무규정과 업무규정 시행세칙은 매매거래·결제·시장관리 관련 규정으로, 공시 판단에 필요한 경우 별도로 확인이 필요합니다.`;
  }
  return prompt;
}

// ============================================================
// Claude API 호출 — Vercel serverless function 경유
// ============================================================
async function callClaudeAPI(messages, apiKey, regulations) {
  const apiMessages = [];

  for (const msg of messages) {
    if (msg.isUser) {
      if (msg.file) {
        const content = [];
        if (msg.file.type === "application/pdf") {
          content.push({
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: msg.file.base64 },
          });
        } else if (msg.file.type.startsWith("image/")) {
          content.push({
            type: "image",
            source: { type: "base64", media_type: msg.file.type, data: msg.file.base64 },
          });
        }
        content.push({ type: "text", text: msg.text || "이 문서를 분석하여 공시 대상 여부를 판단해주세요." });
        apiMessages.push({ role: "user", content });
      } else {
        apiMessages.push({ role: "user", content: msg.text });
      }
    } else {
      apiMessages.push({ role: "assistant", content: msg.text });
    }
  }

  // 규정 원문이 포함된 전체 시스템 프롬프트 생성
  const fullSystemPrompt = buildSystemPrompt(regulations);

  // 시스템 프롬프트를 캐싱 가능한 형태로 구성
  const systemWithCache = [
    {
      type: "text",
      text: fullSystemPrompt,
      cache_control: { type: "ephemeral" },
    },
  ];

  // Try serverless function first, fallback to direct API
  let response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: apiMessages, system: systemWithCache }),
    });
    if (!response.ok) throw new Error("serverless failed");
  } catch {
    // Fallback: direct browser call (needs CORS header)
    if (!apiKey) throw new Error("API 키가 필요합니다. 설정에서 입력해주세요.");
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        system: systemWithCache,
        messages: apiMessages,
      }),
    });
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API 오류 (${response.status})`);
  }

  const data = await response.json();
  const text = data.content
    ?.filter((item) => item.type === "text")
    .map((item) => item.text)
    .join("\n");

  return text || "죄송합니다. 응답을 생성하지 못했습니다.";
}

// ============================================================
// Storage helpers (localStorage)
// ============================================================
function loadHistorySync() {
  try {
    const data = localStorage.getItem("neowiz-disclosure-history");
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveHistoryLocal(history) {
  try {
    localStorage.setItem("neowiz-disclosure-history", JSON.stringify(history));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

function loadApiKeyLocal() {
  try {
    return localStorage.getItem("neowiz-api-key") || "";
  } catch {
    return "";
  }
}

function saveApiKeyLocal(key) {
  try {
    localStorage.setItem("neowiz-api-key", key);
  } catch {}
}

// ============================================================
// Markdown renderer
// ============================================================
function renderMarkdown(text) {
  if (!text) return "";
  const lines = text.split("\n");
  let inTable = false;
  let tableHtml = "";
  let processedLines = [];
  let headerParsed = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      if (trimmed.replace(/[|\s\-:]/g, "") === "") {
        headerParsed = true;
        continue;
      }
      if (!inTable) {
        inTable = true;
        headerParsed = false;
        tableHtml = '<div class="markdown-table"><table><tbody>';
      }
      const cells = trimmed.split("|").filter((c) => c !== "");
      const isHeader = !headerParsed;
      if (isHeader) headerParsed = true;
      const tag = isHeader ? "th" : "td";
      tableHtml += `<tr>${cells.map((c) => `<${tag}>${c.trim()}</${tag}>`).join("")}</tr>`;
    } else {
      if (inTable) {
        tableHtml += "</tbody></table></div>";
        processedLines.push(tableHtml);
        tableHtml = "";
        inTable = false;
        headerParsed = false;
      }
      processedLines.push(line);
    }
  }
  if (inTable) {
    tableHtml += "</tbody></table></div>";
    processedLines.push(tableHtml);
  }

  let html = processedLines
    .join("\n")
    .replace(/^#### (.*$)/gm, '<div class="markdown-h4">$1</div>')
    .replace(/^### (.*$)/gm, '<div class="markdown-h3">$1</div>')
    .replace(/^## (.*$)/gm, '<div class="markdown-h2">$1</div>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.*?)`/g, '<code class="markdown-code">$1</code>')
    .replace(/^- (.*$)/gm, '<div class="markdown-ul-item">$1</div>')
    .replace(/^(\d+)\. (.*$)/gm, '<div class="markdown-ol-item">$1. $2</div>')
    .replace(/\n\n/g, '<div class="markdown-spacer"></div>')
    .replace(/\n/g, "");

  return html;
}

// ============================================================
// Sub-components
// ============================================================

function MessageBubble({ message }) {
  const isUser = message.isUser;
  return (
    <div className={`message-bubble ${isUser ? "user" : "assistant"}`}>
      {!isUser && <div className="message-avatar">K</div>}
      <div className={`message-content ${isUser ? "user" : ""}`}>
        {message.file && (
          <div className="message-file-info">
            <span>{message.file.type.includes("pdf") ? "📄" : "🖼️"}</span>
            <span className="file-name">{message.file.name}</span>
            <span className="file-size">
              ({(message.file.size / 1024).toFixed(0)}KB)
            </span>
          </div>
        )}
        {isUser ? (
          <span>{message.text}</span>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(message.text) }} />
        )}
      </div>
    </div>
  );
}

function HistoryDashboard({ history, onClose, onClear, onDelete, onRestore }) {
  const statusCounts = { disclosed: 0, notDisclosed: 0, voluntary: 0, unknown: 0 };
  for (const h of history) {
    if (h.status === "공시대상") statusCounts.disclosed++;
    else if (h.status === "미해당") statusCounts.notDisclosed++;
    else if (h.status === "자율공시") statusCounts.voluntary++;
    else statusCounts.unknown++;
  }
  const total = history.length || 1;

  const statCards = [
    { label: "공시대상", count: statusCounts.disclosed, color: "#dc2626", bg: "#fef2f2" },
    { label: "미해당", count: statusCounts.notDisclosed, color: "#16a34a", bg: "#f0fdf4" },
    { label: "자율공시", count: statusCounts.voluntary, color: "#d97706", bg: "#fffbeb" },
    { label: "검토필요", count: statusCounts.unknown, color: "#6366f1", bg: "#eef2ff" },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header with-bg">
          <div>
            <div className="modal-title">공시 판단 이력</div>
            <div className="modal-subtitle">총 {history.length}건</div>
          </div>
          <div className="header-actions">
            {history.length > 0 && (
              <button onClick={onClear} className="btn btn-danger">
                전체 삭제
              </button>
            )}
            <button onClick={onClose} className="btn btn-icon">
              닫기
            </button>
          </div>
        </div>

        {history.length > 0 && (
          <div className="history-stats">
            {statCards.map((s) => (
              <div key={s.label} className="stat-card" style={{ background: s.bg }}>
                <div className="stat-count" style={{ color: s.color }}>{s.count}</div>
                <div className="stat-label" style={{ color: s.color }}>{s.label}</div>
                <div className="stat-percent">{((s.count / total) * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
        )}

        <div className="modal-body scrollable">
          {history.length === 0 ? (
            <div className="history-empty">
              <div className="history-empty-icon">📋</div>
              <div className="history-empty-text">아직 이력이 없습니다</div>
              <div className="history-empty-subtext">
                공시 관련 질문을 하면 자동 기록됩니다
              </div>
            </div>
          ) : (
            [...history].reverse().map((h, i) => {
              const statusClass = 
                h.status === "공시대상" ? "disclosed" :
                h.status === "미해당" ? "not-disclosed" :
                h.status === "자율공시" ? "voluntary" : "unknown";
              
              return (
                <div
                  key={i}
                  className="history-item"
                  onClick={() => onRestore(h)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(history.length - 1 - i);
                    }}
                    className="history-item-delete"
                    title="삭제"
                  >
                    ×
                  </button>
                  <div className="history-item-header">
                    <span className={`history-status-badge ${statusClass}`}>
                      {h.status || "검토필요"}
                    </span>
                    <span className="history-date">{h.date}</span>
                  </div>
                  <div className="history-title">{h.title}</div>
                  {h.amount && <div className="history-amount">💰 {h.amount}</div>}
                  {h.regulation && (
                    <div className="history-regulation">📌 {h.regulation}</div>
                  )}
                  <div className="history-restore-hint">클릭하여 대화 복원</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function KeyMetrics() {
  const financialMetrics = [
    { label: "자산총액", value: "6,800억원" },
    { label: "부채총액", value: "1,235억원" },
    { label: "자기자본", value: "5,565억원" },
    { label: "매출액", value: "4,327억원" },
  ];

  const thresholdMetrics = [
    { label: "매출액 2.5%", value: "108억원", sub: "영업·계약" },
    { label: "자기자본 2.5%", value: "139억원", sub: "재무구조" },
    { label: "자산 2.5%", value: "170억원", sub: "투자활동" },
    { label: "자기자본 5%", value: "278억원", sub: "시설투자 등" },
    { label: "자산 10%", value: "680억원", sub: "주요사항보고" },
    { label: "자기자본 25%", value: "1,391억원", sub: "손상차손" },
  ];

  return (
    <div className="key-metrics">
      {/* 재무 현황 */}
      <div className="metrics-card">
        <div className="metrics-title">💼 FY2025 연결재무제표</div>
        <div className="metrics-grid two-col">
          {financialMetrics.map((m) => (
            <div key={m.label} className="metric-item">
              <span className="metric-label">{m.label}</span>
              <span className="metric-value">{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 공시 기준금액 */}
      <div className="metrics-card">
        <div className="metrics-title">⚖️ 주요 공시 기준금액</div>
        <div className="metrics-grid three-col">
          {thresholdMetrics.map((m) => (
            <div key={m.label} className="threshold-item">
              <div className="threshold-label">{m.label}</div>
              <div className="threshold-value">{m.value}</div>
              <div className="threshold-sub">{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ apiKey, onSave, onClose }) {
  const [key, setKey] = useState(apiKey);
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content small">
        <div className="modal-header">
          <div className="modal-title">⚙️ API 설정</div>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <div className="modal-body">
          <label className="settings-label">Anthropic API Key</label>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-ant-api03-..."
            onKeyDown={(e) => { if (e.key === "Enter") { onSave(key); onClose(); } }}
            className="settings-input"
          />
          <p className="settings-note">
            Vercel에 환경변수(ANTHROPIC_API_KEY)가 설정된 경우 서버 사이드로 호출됩니다.
            <br />
            환경변수가 없으면 이 키로 직접 호출합니다. 키는 브라우저에만 저장됩니다.
          </p>
          <div className="settings-info-box">
            <strong>📊 적용 재무기준 (FY2025 연결)</strong>
            <br />
            자산: 6,800억 | 부채: 1,235억 | 자기자본: 5,565억 | 매출: 4,327억
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            취소
          </button>
          <button onClick={() => { onSave(key); onClose(); }} className="btn btn-primary">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main App
// ============================================================
export default function App() {
  const [messages, setMessages] = useState([
    {
      isUser: false,
      text: `안녕하세요. **Krafton 공시 판단 시스템**입니다.

PDF/이미지 계약서를 업로드하거나, 공시 관련 질문을 입력해주세요.

아래 버튼을 눌러 시작하시거나, 자유롭게 질문해주세요.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(loadApiKeyLocal);
  const [regulations, setRegulations] = useState([]);
  const [regulationsLoaded, setRegulationsLoaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setHistory(loadHistorySync());
  }, []);

  // 규정 원문 로드
  useEffect(() => {
    loadRegulationTexts().then((regs) => {
      setRegulations(regs);
      setRegulationsLoaded(true);
      console.log(`규정 ${regs.length}개 로드 완료 (${regs.reduce((a, r) => a + r.text.length, 0).toLocaleString()}자)`);
    });
  }, []);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = () => reject(new Error("File read failed"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file) => {
    if (!file) return;
    const validTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      alert("PDF 또는 이미지 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      alert("파일 크기는 20MB 이하여야 합니다.");
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      setPendingFile({ name: file.name, type: file.type, size: file.size, base64 });
    } catch {
      alert("파일 읽기에 실패했습니다.");
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  // 클립보드에서 이미지 붙여넣기 (Ctrl+V)
  const handlePaste = useCallback(async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          try {
            const base64 = await fileToBase64(file);
            setPendingFile({
              name: `붙여넣기_${new Date().toLocaleTimeString("ko-KR")}.png`,
              type: file.type,
              size: file.size,
              base64,
            });
          } catch {
            alert("이미지 붙여넣기에 실패했습니다.");
          }
        }
        break;
      }
    }
  }, []);

  const extractHistoryFromResponse = (query, response, fileInfo, fullMessages) => {
    const entry = {
      date: new Date().toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      title: query.slice(0, 55) + (query.length > 55 ? "..." : ""),
      status: "검토필요",
      category: "기타",
      amount: null,
      regulation: null,
      messages: fullMessages,
      timestamp: Date.now(),
    };

    const rLower = response.toLowerCase();
    if (
      rLower.includes("공시 대상입니다") ||
      rLower.includes("공시대상") ||
      rLower.includes("공시 의무") ||
      response.includes("✅")
    ) {
      entry.status = "공시대상";
    } else if (
      rLower.includes("미달") ||
      rLower.includes("해당하지 않") ||
      rLower.includes("공시 대상이 아닙") ||
      response.includes("❌")
    ) {
      entry.status = "미해당";
    } else if (rLower.includes("자율공시")) {
      entry.status = "자율공시";
    }

    const amtMatch = query.match(/(\d[\d,.]*)\s*(억|조|만)/);
    if (amtMatch) entry.amount = amtMatch[0];

    const regMatch = response.match(/공시규정\s*\d+조[^\s,.)]+/);
    if (regMatch) entry.regulation = regMatch[0];

    if (query.includes("투자") || query.includes("취득") || query.includes("출자"))
      entry.category = "투자활동";
    else if (query.includes("계약") || query.includes("판매") || query.includes("공급"))
      entry.category = "영업·계약";
    else if (query.includes("합병") || query.includes("분할") || query.includes("양수"))
      entry.category = "구조개편";
    else if (query.includes("소송") || query.includes("벌금")) entry.category = "소송·제재";
    else if (query.includes("차입") || query.includes("보증") || query.includes("담보"))
      entry.category = "채권·채무";

    return entry;
  };

  const handleSend = async (text) => {
    const query = text || input.trim();
    if (!query && !pendingFile) return;

    const userMsg = {
      isUser: true,
      text: query || "이 문서를 분석하여 공시 대상 여부를 판단해주세요.",
      file: pendingFile || undefined,
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setPendingFile(null);
    setIsLoading(true);

    try {
      const apiMessages = newMessages.filter((_, i) => i > 0);
      const response = await callClaudeAPI(apiMessages, apiKey, regulations);
      const finalMessages = [...newMessages, { isUser: false, text: response }];
      setMessages(finalMessages);

      const entry = extractHistoryFromResponse(
        query || pendingFile?.name || "",
        response,
        pendingFile,
        finalMessages
      );
      if (pendingFile) entry.title = `📄 ${pendingFile.name}`;
      const newHistory = [...history, entry];
      setHistory(newHistory);
      saveHistoryLocal(newHistory);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          isUser: false,
          text: `⚠️ API 호출 중 오류가 발생했습니다: ${error.message}\n\n우측 상단 ⚙️ 버튼에서 API 키를 확인해주세요.`,
        },
      ]);
    }
    setIsLoading(false);
  };

  const handleClearHistory = () => {
    if (confirm("전체 이력을 삭제하시겠습니까?")) {
      setHistory([]);
      saveHistoryLocal([]);
    }
  };

  const handleDeleteHistory = (index) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    saveHistoryLocal(newHistory);
  };

  const handleRestoreThread = (historyItem) => {
    if (historyItem.messages && historyItem.messages.length > 0) {
      setMessages(historyItem.messages);
      setShowHistory(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    saveApiKeyLocal(key);
  };

  const SUGGESTED = [
    "150억원 규모의 타법인 주식 취득은 공시 대상인가요?",
    "120억원 판매계약 체결 시 공시가 필요한가요?",
    "크래프톤은 공정거래위원회 공시 대상 기업인가요?",
    "현재 크래프톤의 공시 기준금액을 알려주세요",
    "종속회사의 거래도 공시 대상이 될 수 있나요?",
    "자율공시는 언제 해야 하나요?",
    "불성실공시 벌점은 어떻게 부과되나요?",
    "200억원 규모의 신규시설투자는 공시 대상인가요?",
  ];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`app-container ${dragOver ? "drag-over" : ""}`}
    >
      {showHistory && (
        <HistoryDashboard
          history={history}
          onClose={() => setShowHistory(false)}
          onClear={handleClearHistory}
          onDelete={handleDeleteHistory}
          onRestore={handleRestoreThread}
        />
      )}

      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Header */}
      <div className="app-header">
        <div className="header-logo">K</div>
        <div className="header-info">
          <div className="header-title">Krafton 공시 판단 시스템</div>
          <div className="header-subtitle">
            Claude API · FY2025 연결 기준 · 종속기업 21개사 포함
            {regulationsLoaded && (
              <span style={{ color: "#16a34a", marginLeft: 6 }}>✓ 규정 {regulations.length}개 로드됨</span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowSettings(true)} className="btn btn-icon">
            ⚙️
          </button>
          <button onClick={() => setShowHistory(true)} className="btn btn-icon btn-history">
            이력 <span className="badge">{history.length}</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        <KeyMetrics />

        <div className="messages-list">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
        </div>

        {isLoading && (
          <div className="loading-indicator">
            <div className="message-avatar">N</div>
            <div className="loading-content">
              <div className="spinner" />
              공시 기준 검토 중...
            </div>
          </div>
        )}

        {messages.length === 1 && !isLoading && (
          <div className="suggested-questions">
            <div className="suggested-title">자주 묻는 질문</div>
            <div className="suggested-list">
              {SUGGESTED.map((q, i) => (
                <button key={i} onClick={() => handleSend(q)} className="suggested-btn">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        {pendingFile && (
          <div className="file-preview">
            <span>{pendingFile.type.includes("pdf") ? "📄" : "🖼️"}</span>
            <span className="file-preview-name">{pendingFile.name}</span>
            <span className="file-preview-size">
              ({(pendingFile.size / 1024).toFixed(0)}KB)
            </span>
            <button onClick={() => setPendingFile(null)} className="btn file-preview-close">
              ✕
            </button>
          </div>
        )}

        <div className="input-wrapper">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="btn btn-attach"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.gif"
            className="hidden-input"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />

          <div className="input-box">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              onPaste={handlePaste}
              placeholder={
                pendingFile ? "추가 지시사항 (선택)..." : "공시 관련 질문을 입력하세요... (Ctrl+V로 이미지 붙여넣기 가능)"
              }
              disabled={isLoading}
              rows={1}
              className="input-textarea"
            />
          </div>

          <button
            onClick={() => handleSend()}
            disabled={isLoading || (!input.trim() && !pendingFile)}
            className={`btn btn-send ${!isLoading && (input.trim() || pendingFile) ? "active" : ""}`}
          >
            →
          </button>
        </div>

        <div className="input-footer">
          Claude API 기반 · FY2025 연결 · 최종 판단은 반드시 IR팀과 확인하세요
        </div>
      </div>
    </div>
  );
}
