import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const schedules=sqliteTable('schedules',{month:text('month').primaryKey(),data:text('data').notNull(),revision:integer('revision').notNull().default(1)});
export const editorSessions=sqliteTable('editor_sessions',{tokenHash:text('token_hash').primaryKey(),expiresAt:integer('expires_at').notNull()},table=>[index('editor_sessions_expires_at_idx').on(table.expiresAt)]);
