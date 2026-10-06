// Conservative CSV cleanup: no numeric/date coercion or duplicate deletion.
export function cleanCsv(input) {
  if (input.includes('\0')) throw new Error('Binary input is not CSV.');
  const text = input.replace(/^\uFEFF/, '');
  const rows = []; let row = [], value = '', quoted = false, closed = false;
  const field = () => { row.push(value); value = ''; closed = false; };
  const line = () => { field(); rows.push(row); row = []; };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') { if (text[i+1] === '"') { value += '"'; i++; } else { quoted = false; closed = true; } }
      else value += c;
    } else if (c === ',') field();
    else if (c === '\r' || c === '\n') { line(); if (c === '\r' && text[i+1] === '\n') i++; }
    else if (c === '"' && !value && !closed) quoted = true;
    else { if (closed || c === '"') throw new Error('Malformed CSV quoting.'); value += c; }
  }
  if (quoted) throw new Error('Unclosed CSV quote.');
  if (value || row.length || closed) line();
  let trimmedCells = 0, removedBlankRows = 0, formulaCells = 0;
  const cleaned = rows.map(r => r.map(v => { const t=v.trim(); if(t!==v)trimmedCells++; return t; }))
    .filter(r => { if(r.every(v=>v==='')){removedBlankRows++;return false;} return true; });
  if (cleaned.length < 2 || cleaned[0].length < 2) throw new Error('Requires comma-delimited CSV with a header and data.');
  const width = cleaned[0].length;
  if (cleaned.some(r=>r.length!==width)) throw new Error('Inconsistent column counts; manual review required.');
  if (cleaned[0].some(v=>!v) || new Set(cleaned[0]).size!==width) throw new Error('Missing or duplicate headers; manual review required.');
  const seen = new Set(); let duplicateRows = 0;
  for (const r of cleaned.slice(1)) {const k=JSON.stringify(r);if(seen.has(k))duplicateRows++;seen.add(k);}
  // Formula-like values need human review; retain originals in private storage.
  for (const r of cleaned) for(const v of r) if(/^[=+@-]/.test(v))formulaCells++;
  const csv=cleaned.map(r=>r.map(v=>'"'+v.replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
  return {csv, report:{dataRows:cleaned.length-1,columns:width,trimmedCells,removedBlankRows,duplicateRowsRetained:duplicateRows,formulaCells,requiresHumanReview:true}};
}
