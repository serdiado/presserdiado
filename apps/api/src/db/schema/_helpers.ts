// MySQL helpers — UUID v4 üretimi (Postgres'in defaultRandom() karşılığı).
// crypto.randomUUID Node 19+ standart.

import { randomUUID } from 'node:crypto';
import { varchar } from 'drizzle-orm/mysql-core';

/**
 * UUID birincil anahtar — varchar(36) + JS tarafında üretilen v4.
 *
 *   id: uuidPk(),
 */
export const uuidPk = () =>
  varchar('id', { length: 36 })
    .primaryKey()
    .$defaultFn(() => randomUUID())
    .notNull();

/**
 * UUID dış anahtar referans alanı — sadece kolon, .references() çağıran
 * dosyada eklenir.
 */
export const uuidFk = (col: string) => varchar(col, { length: 36 });
