import { BadRequestException } from '@nestjs/common';

/** CSV with quoted commas/newlines, escaped quotes, CRLF and UTF-8 BOM. */
export function parseStudentCsv(input: string): { row: number; cells: string[] }[] {
  const source = input.replace(/^\uFEFF/, '');
  const records: { row: number; cells: string[] }[] = [];
  let cells: string[] = [], field = '', quoted = false, closedQuote = false;
  let line = 1, recordLine = 1;
  const push = () => {
    cells.push(field.trim());
    if (cells.some(Boolean)) records.push({ row: recordLine, cells });
    cells = []; field = ''; closedQuote = false;
    if (records.length > 1001) throw new BadRequestException('Import at most 1,000 students per file');
  };
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; closedQuote = true; }
      } else {
        field += ch;
        if (ch === '\n') line++;
      }
    } else if (ch === ',') {
      cells.push(field.trim()); field = ''; closedQuote = false;
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && source[i + 1] === '\n') i++;
      push(); line++; recordLine = line;
    } else if (closedQuote) {
      if (!/\s/.test(ch)) throw new BadRequestException(`Invalid text after closing quote on row ${line}`);
    } else if (ch === '"') {
      if (field.trim()) throw new BadRequestException(`Unexpected quote on row ${line}`);
      quoted = true; field = '';
    } else field += ch;
  }
  if (quoted) throw new BadRequestException(`Unclosed quote starting on row ${recordLine}`);
  if (field || cells.length || closedQuote) push();
  return records;
}
