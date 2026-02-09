# KRAFTON 공시 판단 도우미

크래프톤의 공시기준표를 기반으로 공시 대상 여부를 AI가 판단해주는 챗봇입니다.

## 주요 기능
- 📄 **계약서 업로드 분석** — PDF/이미지 파일을 업로드하면 AI가 자동 분석
- 💬 **자연어 질의응답** — 거래 내용을 자연어로 질문하면 공시 대상 여부 판단
- 📊 **공시 이력 관리** — 모든 판단 결과를 자동 저장하고 통계 확인

## 배포 방법

### 1. GitHub에 올리기
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/krafton-disclosure.git
git push -u origin main
```

### 2. Vercel에서 배포
1. [vercel.com](https://vercel.com) 접속
2. "Import Project" → GitHub 레포 선택
3. 자동으로 빌드 & 배포됨
4. 생성된 URL 공유

## 기술 스택
- React 18 + Vite
- Claude API (Sonnet 4)
- LocalStorage (이력 관리)
