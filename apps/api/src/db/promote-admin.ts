// İlk admin'i atama — tek seferlik. Kullanıcı önceden kayıtlı olmalı.
//   çalıştırma: npx tsx src/db/promote-admin.ts <email>
import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { users } from './schema/index.js';

const email = process.argv[2];
if (!email) {
  console.error('Kullanım: tsx src/db/promote-admin.ts <email>');
  process.exit(1);
}

async function promote(targetEmail: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, targetEmail),
    columns: { id: true, email: true, role: true },
  });

  if (!user) {
    console.error(`Kullanıcı bulunamadı: ${targetEmail}`);
    process.exit(1);
  }

  if (user.role === 'admin') {
    console.log(`= ${targetEmail} zaten admin.`);
    return;
  }

  await db.update(users).set({ role: 'admin' }).where(eq(users.id, user.id));
  console.log(`✓ ${targetEmail} artık admin.`);
}

promote(email)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Promote hatası:', err);
    process.exit(1);
  });
