export const API_VERSION = 'v1';

export const MAX_GRID_COLS = 10;
export const MAX_GRID_ROWS = 10;
export const MIN_GRID_COLS = 1;
export const MIN_GRID_ROWS = 1;

export const DEFAULT_GRID = { cols: 4, rows: 4 };
export const DEFAULT_BLEED_MM = 3;

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 4.0;
export const ZOOM_STEP = 0.1;

export const AUTOSAVE_DEBOUNCE_MS = 3000;

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE_MB = 20;
export const THUMBNAIL_WIDTH = 400;

export const PASSWORD_MIN_LENGTH = 8;
export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '7d';

export const STUDIO_STORE_VERSION = 6;

/**
 * Broşür adet kademeleri — İSTEMCİ VE SUNUCU İÇİN TEK KAYNAK.
 *
 * Burada duruyor çünkü sunucunun da doğrulaması gerekiyor: istemci artık adedi sabit bir
 * <select>'ten seçtiriyor ama API'ye elle istek atan biri (ya da eski/bozuk bir istemci)
 * kademe dışı bir adet gönderebilir. Fiyatlama birim-fiyat + adet-indirimi modeliyle
 * çalıştığı için kademe dışı bir adet reddedilmezse hesaplanır ve sipariş kabul edilirdi.
 * Liste iki yerde ayrı ayrı tanımlanırsa zamanla ayrışır; o yüzden tek yer.
 */
export const BROCHURE_QUANTITY_CHOICES: number[] = [500, 1000, 2000, 5000, 10000];
export const STUDIO_STORE_NAME = 'matbaapro-studio-v1';
