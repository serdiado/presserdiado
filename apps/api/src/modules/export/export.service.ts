// Puppeteer-driven export pipeline. Boots headless Chromium, navigates to
// /print-view?formaId=N on the web app with injected catalog/layer state,
// then either snapshots (PNG/JPEG) or prints (PDF) the canvas at exact mm.

import puppeteer, { type Browser } from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { config } from '../../config.js';

export type ExportFormat = 'pdf' | 'png' | 'jpeg';

interface FormaPageConfig {
  pageNumber: number;
  widthMm: number;
}
interface FormaTemplate {
  id: string;
  bleedMm: number;
  openHeightMm: number;
  openWidthMm: number;
  pages: FormaPageConfig[];
}
interface FormaShape {
  id: number;
  pages: { pageNumber: number }[];
}

export interface ExportRequest {
  formaIds: number[];
  format: ExportFormat;
  catalogState: {
    activeTemplate: FormaTemplate;
    formas: FormaShape[];
    [k: string]: unknown;
  };
  layerState?: { layers: unknown[] } | null;
}

export interface ExportResult {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

const MM_TO_PX = 96 / 25.4;

function dimensionsForForma(req: ExportRequest, formaId: number): { widthMm: number; heightMm: number } {
  const forma = req.catalogState.formas.find((f) => f.id === formaId);
  const tpl = req.catalogState.activeTemplate;
  if (!forma || !tpl) return { widthMm: 210, heightMm: 297 };
  const widthMm =
    forma.pages.reduce((sum, p) => {
      const cfg = tpl.pages.find((pp) => pp.pageNumber === p.pageNumber);
      return sum + (cfg?.widthMm ?? 210);
    }, 0) +
    tpl.bleedMm * 2;
  const heightMm = tpl.openHeightMm + tpl.bleedMm * 2;
  return { widthMm, heightMm };
}

async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
}

async function gotoPrintView(
  browser: Browser,
  req: ExportRequest,
  formaId: number,
  scale: number,
): Promise<{ page: import('puppeteer').Page; widthMm: number; heightMm: number }> {
  const { widthMm, heightMm } = dimensionsForForma(req, formaId);
  const widthPx = Math.ceil((widthMm * 96) / 25.4);
  const heightPx = Math.ceil((heightMm * 96) / 25.4);

  const page = await browser.newPage();
  await page.setViewport({ width: widthPx, height: heightPx, deviceScaleFactor: scale });

  // Inject catalog/layer state into the next page navigation, mirroring the
  // zustand persist key written by useCatalogStore.
  // Function body runs in the browser context (puppeteer), so window/localStorage
  // are available there even though TypeScript types don't include DOM lib here.
  await page.evaluateOnNewDocument(
    /* eslint-disable @typescript-eslint/no-explicit-any */
    function inject(catalog: any, layers: any) {
      const w = globalThis as any;
      try {
        w.localStorage.setItem(
          'matbaapro-studio-v1',
          JSON.stringify({ state: catalog, version: 0 }),
        );
      } catch {
        /* ignore */
      }
      w.__INJECTED_LAYER_STATE__ = layers ?? { layers: [] };
    },
    req.catalogState as unknown,
    req.layerState as unknown,
  );

  const url = `${config.web.baseUrl}/print-view?formaId=${formaId}`;
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('#print-canvas-ready', { timeout: 60000 });

  return { page, widthMm, heightMm };
}

export async function exportCatalog(req: ExportRequest): Promise<ExportResult> {
  if (!req.formaIds || req.formaIds.length === 0) {
    throw new Error('formaIds required');
  }

  const browser = await launchBrowser();
  try {
    if (req.format === 'pdf') {
      const merged = await PDFDocument.create();
      for (const formaId of req.formaIds) {
        const { page, widthMm, heightMm } = await gotoPrintView(browser, req, formaId, 2);
        const pdfBuffer = (await page.pdf({
          printBackground: true,
          width: `${widthMm}mm`,
          height: `${heightMm}mm`,
          margin: { top: 0, right: 0, bottom: 0, left: 0 },
          pageRanges: '1',
          preferCSSPageSize: true,
        })) as Buffer;
        await page.close();

        const doc = await PDFDocument.load(pdfBuffer);
        const copied = await merged.copyPages(doc, [0]);
        merged.addPage(copied[0]);
      }
      const bytes = await merged.save();
      return {
        buffer: Buffer.from(bytes),
        contentType: 'application/pdf',
        filename: 'Katalog.pdf',
      };
    }

    // PNG / JPEG — only first formaId (snapshot one spread)
    const formaId = req.formaIds[0];
    const { page, widthMm, heightMm } = await gotoPrintView(browser, req, formaId, 3.125);
    const widthPx = (widthMm * 96) / 25.4;
    const heightPx = (heightMm * 96) / 25.4;

    const buf = (await page.screenshot({
      type: req.format === 'jpeg' ? 'jpeg' : 'png',
      quality: req.format === 'jpeg' ? 100 : undefined,
      omitBackground: req.format === 'png',
      clip: { x: 0, y: 0, width: widthPx, height: heightPx },
    })) as Buffer;
    await page.close();

    return {
      buffer: Buffer.from(buf),
      contentType: req.format === 'jpeg' ? 'image/jpeg' : 'image/png',
      filename: `katalog.${req.format}`,
    };
  } finally {
    await browser.close();
  }
}
