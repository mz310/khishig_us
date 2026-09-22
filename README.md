# Хишиг ус

Арвайхээр сумын баллонтой усны захиалгын систем. Хэрэглэгч Gmail-ээр нэвтэрч захиалга өгнө, эзэн admin хэсгээс хүргэлт, төлбөр, өр, орлогын тайлангаа хөтөлнө.

Стек: Next.js (App Router) · Drizzle ORM · Neon Postgres · Better Auth (Google) · Vercel.

## Локал ажиллуулах

```bash
npm install
cp .env.example .env      # BETTER_AUTH_SECRET-ийг санамсаргүй урт мөрөөр солино
npm run dev
```

`DATABASE_URL` хоосон бол `.pglite/` хавтсанд суулгасан Postgres (PGlite) ашиглана — Neon шаардлагагүй.

Google OAuth-гүйгээр турших бол `.env`-д `DEV_LOGIN=1` тавиад:

```bash
curl -X POST localhost:3000/api/auth/sign-up/email -H 'content-type: application/json' \
  -d '{"email":"mzorigt6@gmail.com","password":"devpass1234","name":"Admin"}'
```

Шалгалт: `npm test` (домэйн/цагийн логик), `npm run typecheck`.

## Deploy (Vercel + Neon)

1. **Neon** — шинэ project үүсгээд connection string-ийг (pooled) `DATABASE_URL` болгоно.
2. **Google Cloud Console** → APIs & Services → Credentials → OAuth client (Web).
   Authorized redirect URI: `https://<домэйн>/api/auth/callback/google`.
   OAuth consent screen-ийг *In production* болгоно (эс бөгөөс зөвхөн test user нэвтэрнэ).
3. **Telegram** — @BotFather-оос bot token авна; bot-доо нэг мессеж бичээд
   `https://api.telegram.org/bot<TOKEN>/getUpdates` дээрээс `chat.id`-г авна.
4. **Vercel** — GitHub repo-г import хийж Environment Variables оруулна:

   | Нэр | Утга |
   |---|---|
   | `DATABASE_URL` | Neon connection string |
   | `BETTER_AUTH_SECRET` | `openssl rand -base64 32` |
   | `BETTER_AUTH_URL` | `https://<домэйн>` |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth client |
   | `ADMIN_EMAILS` | admin эрхтэй Gmail хаягууд (таслалаар) |
   | `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | шинэ захиалгын мэдэгдэл |

   `npm run build` нь эхлээд `drizzle/` доторх migration-уудыг Neon дээр ажиллуулаад дараа нь build хийнэ.
5. Deploy дууссаны дараа `/admin/settings` дээр үнэ, хүргэлтийн төлбөр, утас, дансаа оруулж
   "Захиалга хүлээн авч байна"-г идэвхжүүлнэ. Үнэ 0 байвал сайт "Удахгүй нээгдэнэ" гэж харуулна.

## Схем өөрчлөх

`db/schema.ts`-ийг засаад `npm run db:generate` ажиллуулбал `drizzle/` дотор шинэ SQL migration үүснэ. Локал PGlite болон production build хоёулаа тэр хавтаснаас migration-уудыг автоматаар ажиллуулна.

## Бүтэц

- `app/(customer)/` — хэрэглэгчийн хуудсууд (нүүр, захиалах, захиалгууд, профайл)
- `app/admin/` — эзний хуудсууд (өнөөдөр, захиалгууд, хэрэглэгчид, гүйлгээ, тайлан, тохиргоо)
- `app/actions/` — server action-ууд (захиалга үүсгэх, хүргэх, төлбөр, тохиргоо)
- `lib/domain.ts` — бизнес дүрэм (бонус, өр, төлөв шилжилт); `lib/time.ts` — Улаанбаатарын цагийн хүрээ
- `db/` — Drizzle схем, холболт; `drizzle/` — migration-ууд
- `prototype/` — батлагдсан дизайны HTML эх (лавлагаа)
