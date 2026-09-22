# Хишиг ус — захиалгын систем: дизайн spec

Огноо: 2026-09-23. Захиалагч: Хишиг ус (Өвөрхангай, Арвайхээр). Статус: батлагдсан загвар, хөгжүүлэлт эхэлж байна.

## 1. Зорилго

Арвайхээр сум дотор баллонтой цэвэр ус хүргэх нэг эзэнтэй бизнесийн захиалга, хүргэлт, төлбөр, өрийн бүртгэлийн вэб систем. Хэрэглэгч Gmail-ээр нэвтэрч захиална; эзэн (admin) утсаар ирсэн захиалгыг өөрөө бүртгэнэ, хүргэнэ, төлбөр авна, тайлан харна.

Хамрахгүй (эхний хувилбар): гар утасны апп, онлайн төлбөр (QPay), SMS, олон хүргэгч, маршрут.

## 2. Хэрэглэгчийн төрөл

- **Хэрэглэгч** — Gmail-ээр нэвтэрсэн хүн. Өөрийн өгсөн захиалгуудаа харна, шинээр захиална, "Шинэ" төлөвтэй захиалгаа цуцална.
- **Admin** — `ADMIN_EMAILS` env-д байгаа имэйлээр нэвтэрсэн хүн. Бүх зүйлд эрхтэй.
- Хэрэглэгчийг бизнесийн хувьд **утасны дугаараар** таньдаг (customers.phone давхцахгүй). Gmail бүртгэл = нэвтрэх эрх. "Миний захиалгууд" = тухайн Gmail-ээр өөрөө өгсөн захиалгууд (orders.user_id). Өөр хүний дугаар бичсэн ч тэр хүний түүхийг харахгүй.

## 3. Бизнесийн дүрэм

- **Бүтээгдэхүүн**: нэг л төрөл — баллонтой ус (шошгон дээр 18.9 л; эзэн "5 л" гэж хэлсэн — хэмжээний бичвэр `settings.bottle_label`, admin засна). Хоосон баллоныг аваад дүүрэнээр солино; барьцаа, савны үнэ байхгүй.
- **Үнэ**: `settings.price` (нэгж), `settings.delivery_fee` (захиалга бүрт нэг удаа). Захиалга дээр тухайн үеийн үнэ хадгалагдана (`unit_price`, `delivery_fee` баганад), үнэ дараа өөрчлөгдсөн ч түүх зөв.
- **Бонус** (нэг захиалга дотор): `free = floor(qty_paid / bonus_buy) * bonus_free`, анхдагч 3 → 1. `settings.bonus_enabled` унтраах боломжтой. Захиалга дээр `qty_free` хадгалагдана.
- **Нийт** = `qty_paid * unit_price + delivery_fee`. Тоо 1–20.
- **Хүргэлтийн цаг**: ажлын цаг 09:00–17:00 (Asia/Ulaanbaatar). Сонголт: "Аль болох хурдан" (зөвхөн өнөөдөр, 17:00-оос өмнө) эсвэл Өнөөдөр/Маргааш × 09–12 / 12–15 / 15–17. Өнөөдрийн хүрээ дуусахад 60 минутаас бага үлдсэн бол сонгогдохгүй. 17:00-оос хойш зөвхөн маргааш.
- **Төлөв**: `new` → `out` → `delivered`; `new` → `cancelled` (хэрэглэгч эсвэл admin); `out` → `cancelled` (зөвхөн admin). `delivered` эцсийн. Төлөв бүрийн цаг хадгалагдана.
- **Төлбөр**: хүргэлтээр. "Хүргэсэн" гэхэд admin Бэлэн / Данс / Дараа төлнө сонгоно. Бэлэн, Данс → тэр дор нь `payments` мөр үүснэ (order_id-той). Дараа төлнө → өр.
- **Өр**: хэрэглэгчийн `debt = Σ(delivered захиалгын total) − Σ(payments.amount)`. Өр төлөлтийг admin хэрэглэгчийн хуудаснаас ямар ч дүнгээр бүртгэнэ (`payments.order_id = null`).
- **Спам хамгаалалт**: нэг хэрэглэгч нэг зэрэг 3-аас илүү нээлттэй (`new`/`out`) захиалгатай байж болохгүй.
- **Захиалга хаах**: `settings.accepting_orders = false` эсвэл `price = 0` бол форм хаалттай, "Удахгүй нээгдэнэ".
- **Утас**: `[6-9]` цифрээр эхэлсэн 8 орон. **Хаяг**: баг (1–10), байр/гудамж, тоот/хашаа, нэмэлт тайлбар.
- **Мэдэгдэл**: захиалга бүр Telegram bot-оор эзний chat руу очно (хэн, утас, хаяг, тоо, цаг, дүн, линк). Telegram алдаа захиалгыг зогсоохгүй.

## 4. Бренд, өгөгдөл (шошгоноос)

- Лого: `prototype/assets/logo.svg`, `logo-white.svg`. Өнгө: индиго `#2B2A5C`, ногоон `#3E8E2A`, ус `#2F7FC1`.
- Утас: 8802 7971, 8911 5224. Хаяг: Өвөрхангай, Арвайхээр. Данс: 5560525003 (банкны нэр тодорхойгүй — settings-д admin засна). Эзний өмнө өгсөн: 88909010, Хаан банк 5624290241 — аль нь зөвийг эзэн settings-ээс сонгоно.
- Усны найрлага, хадгалах нөхцөл: landing дээр статик текст.

## 5. Дэлгэцүүд (загвар: `prototype/`)

Хэрэглэгч: `/` landing (`web.html`), `/login`, `/app` нүүр (`home.html`), `/order` (`order.html`), `/orders` жагсаалт, `/orders/[id]` төлөв (`status.html`).
Admin: `/admin` өнөөдөр (`admin.html`), `/admin/orders` бүгд + шүүлт, `/admin/orders/new` гараар бүртгэх, `/admin/customers` (`admin-customers.html`), `/admin/customers/[id]` (`admin-customer.html`), `/admin/transactions` (`admin-tx.html`, тайлантай), `/admin/reports` компьютерийн тайлан (`admin-desk.html`), `/admin/settings`.
Загварын CSS/JS-ийг шууд ашиглана: `style.css` → global CSS, liquid nav / water button / bottle SVG → React компонент.

## 6. Техник

- Next.js (App Router, TypeScript), Server Components + Server Actions. Стиль: загварын CSS хэвээр (Tailwind хэрэглэхгүй).
- DB: Postgres (Neon) + Drizzle ORM. Local/test: PGlite (`DATABASE_URL` байхгүй үед). Migrations: drizzle-kit.
- Auth: Better Auth + Google provider, Drizzle adapter. Admin эрх: `ADMIN_EMAILS` (таслалаар).
- Telegram: Bot API `sendMessage`, env `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
- Цагийн бүс: бүх "өнөөдөр", цагийн хүрээ Asia/Ulaanbaatar-аар (`lib/time.ts`).
- Мөнгө: бүхэл төгрөг (integer).
- Deploy: Vercel + Neon. Env: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ADMIN_EMAILS`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

## 7. Өгөгдлийн загвар

- `customers`: id, phone (unique), name, bag, street, unit, note, created_at, updated_at.
- `orders`: id, customer_id, user_id (null = admin бүртгэсэн), source ('web'|'admin'), qty_paid, qty_free, unit_price, delivery_fee, total, bag, street, unit, note, delivery_date (date, UB), slot ('asap'|'09-12'|'12-15'|'15-17'), status, payment (null|'cash'|'transfer'|'debt'), created_at, out_at, delivered_at, cancelled_at.
- `payments`: id, customer_id, order_id (null = өр төлөлт), amount, method ('cash'|'transfer'), note, created_at.
- `settings` (нэг мөр): price, delivery_fee, bonus_enabled, bonus_buy, bonus_free, phone1, phone2, bank_name, bank_account, accepting_orders, bottle_label.
- Better Auth: user, session, account, verification.

## 8. Алдаа, аюулгүй байдал

- Бүх оруулгыг сервер дээр zod-оор шалгана, мессеж монголоор.
- Server action бүр session шалгана; admin action `ADMIN_EMAILS` шалгана.
- Төлөв шилжилт DB дээр нөхцөлтэй update (`where status = ...`) — давхар дарах, хоцорсон цуцлалтаас хамгаална.
- Хэрэглэгч зөвхөн өөрийн `user_id`-тай захиалгыг харна/цуцална.

## 9. Тест

- Vitest: бонус/дүн, цагийн хүрээ (UB цаг, 17:00 хил, 60 мин), өр, утас, төлөв шилжилт.
- Гараар: захиалах → Telegram → admin хүргэсэн → өр/гүйлгээ; утасны хэмжээнд.

## 10. Хийх дараалал

1. Scaffold, CSS port, domain lib + tests. 2. DB schema, migrations, PGlite dev. 3. Auth (Google), admin gate. 4. Хэрэглэгчийн урсгал (landing, order, status, list) + Telegram. 5. Admin (today, orders, new, customers, transactions, reports, settings). 6. Deploy заавар, Vercel.
