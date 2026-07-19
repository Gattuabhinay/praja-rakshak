# Praja Rakshak · Telangana

**Idea2Impact Online Hackathon 2026**  
**Theme:** Sustainability & Social Impact  
**Flow:** Clean Up + Speak Up → Official portals  
**Tagline:** Clean up. Speak up. Act through official portals.

## Live app (use this for judges)

**https://praja-rakshak.vercel.app**

**GitHub:** https://github.com/Gattuabhinay/praja-rakshak

Demo login (if signup email is rate-limited):  
`demo@prajarakshak.ts` / `Telangana@2026`

---

One platform for Telangana citizens:
- **Clean Up** — vision AI classifies waste from a photo  
- **Speak Up** — AI drafts civic complaints; citizen files on official portals  

## Product flow
1. **Login / Create account** (or Demo)  
2. **Clean Up** — waste photo → AI classification  
3. **Speak Up** — complaint draft + filing guide  
4. **Official Portal** — government redirects / WhatsApp  
5. **Profile** — citizen details, history, AI settings, suggestions  

## AI keys
- **Admin key on Vercel:** `OPENROUTER_API_KEY` (server-only) — app works without a personal key  
- **Optional personal key:** Profile → AI / API settings (OpenRouter, OpenAI ChatGPT, Gemini, Claude)

## Tech stack
- Next.js 16 + TypeScript + Tailwind CSS 4  
- Supabase Auth + profiles / cases  
- OpenRouter / OpenAI / Gemini / Claude (BYOK + admin fallback)  
- Deployed on Vercel  

## Deploy
Already live: **https://praja-rakshak.vercel.app**  
Env vars are set in the Vercel project dashboard (not in the frontend bundle).

## Telangana official redirects
- GHMC IGS, GHMC, TSPCB  
- ACB Telangana (1064), Lokayukta, Telangana Police  
- CPGRAMS, Cybercrime, Women Safety / SHE Teams  
- Official WhatsApp channels where applicable  
