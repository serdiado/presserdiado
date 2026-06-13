// Login/Register sonrası dönüş hedefi (next) için open-redirect guard'ı.
// SADECE tek '/' ile başlayan iç path kabul edilir. '//' (protocol-relative),
// 'http(s)://', ':' veya '\' içeren değerler reddedilip /dashboard'a düşer.
// Örnek: '/new' geçer; '//evil.com', 'https://evil.com', '\\x' reddedilir.
export function safeNext(next: string | null | undefined): string {
  if (next && /^\/(?!\/)/.test(next) && !next.includes('\\') && !next.includes(':')) {
    return next;
  }
  return '/dashboard';
}
