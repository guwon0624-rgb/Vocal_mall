# Vocal Mall Server

Node.js, Express, MongoDB(Mongoose) 기반 API 서버입니다.

## 시작하기

1. 환경변수 파일을 만듭니다.

   ```powershell
   Copy-Item .env.example .env
   ```

2. 로컬 MongoDB를 실행하거나 `.env`의 `MONGODB_URI`를 MongoDB Atlas 주소로 변경합니다.

3. 개발 서버를 실행합니다.

   ```powershell
   npm run dev
   ```

기본 주소는 `http://localhost:5000`이며 상태 확인 API는 `GET /api/health`입니다.
