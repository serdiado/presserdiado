// Pilot market hesabı oluştur veya şifresini sıfırla — kayıt kapalıyken
// (config.auth.registrationEnabled=false) admin'in bilinen market hesaplarını açması/
// şifre değiştirmesi için. E-posta zaten kayıtlıysa şifre günceller, değilse hesabı oluşturur.
//   çalıştırma: npx tsx src/db/reset-password.ts <email> <yeni-şifre> [firma-adı]
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from './index.js';
import { users } from './schema/index.js';

const SALT_ROUNDS = 12;

const [email, password, companyName] = process.argv.slice(2);
if (!email || !password) {
  console.error('Kullanım: tsx src/db/reset-password.ts <email> <yeni-şifre> [firma-adı]');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Şifre en az 8 karakter olmalı');
  process.exit(1);
}

async function resetOrCreate(targetEmail: string, newPassword: string, targetCompanyName?: string) {
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const existing = await db.query.users.findFirst({
    where: eq(users.email, targetEmail),
    columns: { id: true },
  });

  if (existing) {
    await db.update(users).set({ passwordHash }).where(eq(users.id, existing.id));
    console.log(`✓ ${targetEmail} şifresi güncellendi.`);
    return;
  }

  await db.insert(users).values({
    id: randomUUID(),
    email: targetEmail,
    passwordHash,
    companyName: targetCompanyName ?? null,
  });
  // Ayrı ve belirgin uyarı — e-posta yazım hatası fark edilmeden yeni bir "hayalet" hesap
  // açılmasın diye (script bu e-postayla eşleşen kullanıcı bulamadığı için YENİ hesap açtı).
  console.log(`⚠ ${targetEmail} bulunamadı — YENİ hesap oluşturuldu. E-postayı kontrol edin.`);
}

resetOrCreate(email, password, companyName)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Hata:', err);
    process.exit(1);
  });
