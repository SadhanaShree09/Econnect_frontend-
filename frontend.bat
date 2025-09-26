npm run dev
@echo off
cmd /k
npm i -force
uvicorn Server:app --reload