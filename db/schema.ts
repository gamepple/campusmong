import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const schedules=sqliteTable('schedules',{month:text('month').primaryKey(),data:text('data').notNull(),revision:integer('revision').notNull().default(1)});
