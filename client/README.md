# Vocal Mall Client

React와 Vite 기반의 Vocal Mall 클라이언트입니다.

## 실행 방법

```powershell
npm install
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다. `/api` 요청은 Vite
프록시를 통해 `http://localhost:5000`의 Express 서버로 전달됩니다.

## 명령어

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드 생성
- `npm run preview`: 프로덕션 빌드 미리보기
- `npm run lint`: 코드 검사
- `npm run check`: 코드 검사 후 프로덕션 빌드

## 환경변수

필요한 경우 `.env.example`을 `.env`로 복사하고 API 기본 주소를 변경합니다.

```env
VITE_API_BASE_URL=/api
```
