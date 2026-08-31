function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (inQuotes) {
      if (c === '"' && n === '"') { cell += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else cell += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (c !== '\r') cell += c;
    }
  }
  row.push(cell); rows.push(row);
  return rows.filter(r => r.some(v => String(v || '').trim()));
}
function googleCsvUrl(input) {
  const url = new URL(input);
  if (!url.hostname.includes('docs.google.com')) return input;
  const m = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
  if (!m) return input;
  let gid = url.searchParams.get('gid') || '0';
  if (url.hash && url.hash.includes('gid=')) {
    const hm = url.hash.match(/gid=([0-9]+)/); if (hm) gid = hm[1];
  }
  return `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=csv&gid=${gid}`;
}
module.exports = async (req, res) => {
  try {
    const input = req.query.url;
    if (!input) return res.status(400).json({ error: 'Missing sheet url' });
    const csvUrl = googleCsvUrl(input);
    const r = await fetch(csvUrl, { headers: { 'user-agent': 'NahrProposalGenerator/1.0' } });
    const text = await r.text();
    if (!r.ok) return res.status(400).json({ error: `Could not fetch sheet CSV: HTTP ${r.status}` });
    if (/<!doctype html|<html/i.test(text) && /Sign in|accounts\.google/i.test(text)) {
      return res.status(403).json({ error: 'الشيت خاص أو غير قابل للتصدير. شاركه أو استخدم رابط CSV قابل للقراءة.' });
    }
    const rows = parseCsv(text);
    const headers = rows.shift() || [];
    return res.status(200).json({ headers, rows, source: csvUrl });
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Failed to read sheet' });
  }
};
