# KRAFTON 공시 판단 AI 어시스턴트

크래프톤 임직원을 위한 공시 판단 AI 시스템입니다.

## 주요 기능

- **공시 해당 여부 판단** — 거래/계약/사건 설명 시 공시 대상 여부, 근거규정, 기준금액, 공시기한 안내
- **계약서/문서 분석** — PDF/이미지 업로드 시 공시 항목 자동 식별
- **공시 이력 관리** — 판단 이력 자동 저장, 대화 복원, 상태별 통계
- **드래그앤드롭 파일 업로드** — 간편한 문서 첨부

## 적용 기준

- **재무기준**: FY2025 연결재무제표 (자산 94,336억 / 부채 22,495억 / 자기자본 71,841억 / 매출 33,265억)
- **적용규정**: 코스피시장 공시규정, 업무규정, 업무규정 시행세칙, 자본시장법
- **대규모법인**: 자산총액 2조원 이상 대기업 기준 적용
- **적용기간**: 2026년 4월 1일 ~ 2027년 3월 31일

## 배포 방법

### 1. GitHub 레포지토리 생성

```bash
git init
git add .
git commit -m "KRAFTON 공시 판단 AI 어시스턴트"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/krafton-disclosure.git
git push -u origin main
```

### 2. Vercel 배포

1. [vercel.com](https://vercel.com)에 GitHub 계정으로 로그인
2. "New Project" → GitHub 레포 선택
3. Framework: **Vite** 자동 감지됨
4. **Environment Variables** 설정:
   - `ANTHROPIC_API_KEY` = `sk-ant-api03-...` (Anthropic API 키)
5. "Deploy" 클릭

### 3. API 키 설정 (2가지 방법)

#### 방법 A: Vercel 환경변수 (권장)
- Vercel 대시보드 → Settings → Environment Variables
- `ANTHROPIC_API_KEY` 추가
- 서버사이드에서 안전하게 호출됨

#### 방법 B: 브라우저 직접 입력
- 앱 우측 상단 ⚙️ 클릭
- API 키 입력 (브라우저 localStorage에 저장)
- Vercel 환경변수가 없을 때 fallback으로 사용

## 로컬 개발

```bash
npm install
npm run dev
```

`.env.local` 파일 생성:
```
ANTHROPIC_API_KEY=sk-ant-api03-your-key
```

## 기술 스택

- **Frontend**: React 18 + Vite
- **API**: Vercel Serverless Functions
- **AI**: Claude Sonnet 4 (Anthropic)
- **Storage**: localStorage (브라우저)

## ⚠️ 주의사항

이 시스템의 답변은 참고용이며, 최종 공시 판단은 반드시 IR팀/법무팀 및 외부 법률자문과 확인하시기 바랍니다.
