// RGB PDF -> CMYK PDF dönüşümü (Ghostscript). Sipariş dondurma akışında kullanılır
// (bkz. modules/orders/order-pdf.service.ts); manuel stüdyo "Dışa Aktar" akışını etkilemez.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFile, writeFile, unlink } from 'node:fs/promises';

const execFileAsync = promisify(execFile);

export async function convertPdfToCmyk(buffer: Buffer): Promise<Buffer> {
  const id = randomUUID();
  const inPath = join(tmpdir(), `gs-${id}-in.pdf`);
  const outPath = join(tmpdir(), `gs-${id}-out.pdf`);

  try {
    await writeFile(inPath, buffer);

    await execFileAsync(
      'gs',
      [
        '-dNOPAUSE',
        '-dBATCH',
        '-dSAFER',
        '-dQUIET',
        '-sDEVICE=pdfwrite',
        '-dPDFSETTINGS=/prepress',
        '-sColorConversionStrategy=CMYK',
        '-sProcessColorModel=DeviceCMYK',
        '-dColorImageResolution=300',
        '-dGrayImageResolution=300',
        '-dCompatibilityLevel=1.4',
        `-sOutputFile=${outPath}`,
        inPath,
      ],
      { timeout: 60_000 },
    );

    const result = await readFile(outPath);
    if (result.length === 0) {
      throw new Error('Ghostscript boş çıktı üretti');
    }
    return result;
  } finally {
    await Promise.allSettled([unlink(inPath), unlink(outPath)]);
  }
}
