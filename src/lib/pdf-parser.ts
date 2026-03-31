// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string; numpages: number; info: Record<string, unknown> }>;

export interface ParsedPdf {
  text: string;
  pageCount: number;
  info: Record<string, unknown>;
}

export async function parsePdf(buffer: Buffer): Promise<ParsedPdf> {
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    pageCount: data.numpages,
    info: data.info ?? {},
  };
}
