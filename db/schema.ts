import { boolean, date, index, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// ---- Better Auth tables (shape required by the Drizzle adapter) ----
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, (t) => [index("session_user_idx").on(t.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("account_user_idx").on(t.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("verification_identifier_idx").on(t.identifier)]);

// ---- Business tables ----
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull(),
  // The signed-in account that first ordered with this phone; null for customers the owner added by hand.
  userId: text("user_id"),
  name: text("name").notNull(),
  bag: integer("bag").notNull().default(1),
  street: text("street").notNull().default(""),
  unit: text("unit").notNull().default(""),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [uniqueIndex("customers_phone_idx").on(t.phone)]);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  source: text("source").notNull().default("web"), // web | admin
  qtyPaid: integer("qty_paid").notNull(),
  qtyFree: integer("qty_free").notNull().default(0),
  unitPrice: integer("unit_price").notNull(),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  total: integer("total").notNull(),
  bag: integer("bag").notNull(),
  street: text("street").notNull().default(""),
  unit: text("unit").notNull().default(""),
  note: text("note").notNull().default(""),
  deliveryDate: date("delivery_date").notNull(),
  slot: text("slot").notNull(), // asap | 09-12 | 12-15 | 15-17
  status: text("status").notNull().default("new"), // new | out | delivered | cancelled
  payment: text("payment"), // cash | transfer | debt
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  outAt: timestamp("out_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
}, (t) => [
  index("orders_customer_idx").on(t.customerId),
  index("orders_user_idx").on(t.userId),
  index("orders_delivery_idx").on(t.deliveryDate),
  index("orders_status_idx").on(t.status),
]);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").notNull().references(() => customers.id),
  orderId: integer("order_id").references(() => orders.id, { onDelete: "set null" }),
  amount: integer("amount").notNull(),
  method: text("method").notNull(), // cash | transfer
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("payments_customer_idx").on(t.customerId), index("payments_created_idx").on(t.createdAt)]);

export const settings = pgTable("settings", {
  id: integer("id").primaryKey(),
  price: integer("price").notNull().default(0),
  deliveryFee: integer("delivery_fee").notNull().default(0),
  bonusEnabled: boolean("bonus_enabled").notNull().default(true),
  bonusBuy: integer("bonus_buy").notNull().default(3),
  bonusFree: integer("bonus_free").notNull().default(1),
  phone1: text("phone1").notNull().default("88027971"),
  phone2: text("phone2").notNull().default("89115224"),
  bankName: text("bank_name").notNull().default("Хаан банк"),
  bankAccount: text("bank_account").notNull().default("5560525003"),
  acceptingOrders: boolean("accepting_orders").notNull().default(true),
  bottleLabel: text("bottle_label").notNull().default("18.9 л"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
export type SettingsRow = typeof settings.$inferSelect;
