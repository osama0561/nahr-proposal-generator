const sampleHeaders = [
  'Timestamp','Email','الاسم','القسم','المسمى الوظيفي','سنوات خبرتك في هذا المجال','المهمة المتكررة الأولى','ساعاتها أسبوعيًا','المهمة المتكررة الثانية','ساعاتها أسبوعيًا 2','المهمة المتكررة الثالثة','ساعاتها أسبوعيًا 3','ما أكثر ما تنتجه في عملك اليومي؟','استخدامك لأدوات الذكاء الاصطناعي حتى اليوم','الأدوات التي جربتها','أبعد ما وصلت إليه في استخدامها','صياغة طلب واضح يعطيني نتيجة دقيقة من أول مرة','الحكم على جودة المخرَج ومتى لا يصلح للاستخدام','استخدام الأداة على ملفات وبيانات عملي الحقيقية','بناء خطوة أتمتة تعمل دون تدخلي في كل مرة','اختر كل ما ينطبق عليك','أولويتك الأولى من التدريب','لو اختفت مهمة واحدة من يومك تلقائيًا، أي مهمة تختار؟','مجموع الساعات الأسبوعية التي تقضيها في مهام متكررة يمكن أتمتتها','استعدادك لتطبيق ما تتعلمه فعليًا في عملك بعد التدريب'
];
const sampleRows = [
  ['2026-08-31','reem@example.com','ريم أحمد','الموارد البشرية','أخصائية تطوير موظفين','٦ سنوات','تجميع تقارير الحضور والتدريب','5','تلخيص ملاحظات الاجتماعات','3','تحديث ملفات المتدربين','2','تقارير، عروض، رسائل بريدية','أستخدمها أحيانًا','ChatGPT, Gemini','أكتب مسودات وأراجعها يدويًا','3','3','2','1','عدم وضوح حالات الاستخدام، الخوف من الأخطاء، عدم وجود بيانات مرتبة','بناء قوالب وأتمتة للتقارير','تجهيز تقرير التدريب الأسبوعي وإرساله تلقائيًا','10','4'],
  ['2026-08-31','fahad@example.com','فهد سالم','المبيعات','مشرف مبيعات','٨ سنوات','كتابة متابعة العملاء','4','تجهيز عروض الأسعار','3','تلخيص مكالمات العملاء','2','رسائل عملاء، عروض، تقارير مبيعات','أستخدمها أسبوعيًا','ChatGPT, Copilot','أستخدمها في المسودات والتلخيص','4','3','2','2','عدم معرفة أفضل طريقة للطلب، الخوف من مشاركة بيانات حساسة','تسريع كتابة العروض والمتابعات','تحويل ملاحظات المكالمة إلى رسالة متابعة وعرض مختصر','9','5'],
  ['2026-08-31','sara@example.com','سارة علي','خدمة العملاء','قائدة فريق','٥ سنوات','تصنيف شكاوى العملاء','6','كتابة ردود متكررة','4','تقرير نهاية اليوم','2','ردود، تقارير، تصنيفات','لم أستخدمها إلا قليلًا','Gemini','تجربة أسئلة بسيطة','2','2','1','1','لا أعرف من أين أبدأ، لا توجد قوالب، ضعف الثقة في المخرجات','استخدام AI بأمان في خدمة العملاء','تصنيف الشكاوى واقتراح الرد المناسب تلقائيًا','12','4']
];

let state = { headers: sampleHeaders, rows: sampleRows, source: 'sample' };
let tableMode = 'important';
let latestDiagnostic = null;
let customerLogoData = '';
const $ = (id) => document.getElementById(id);
const arabicDigits = {'٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'};
const importantColumns = ['الاسم','القسم','المسمى الوظيفي','سنوات خبرتك','المهمة المتكررة الأولى','ساعاتها أسبوعيًا','المهمة المتكررة الثانية','ساعاتها أسبوعيًا 2','المهمة المتكررة الثالثة','ساعاتها أسبوعيًا 3','ما أكثر ما تنتجه','استخدامك لأدوات الذكاء الاصطناعي','أبعد ما وصلت إليه','أولويتك الأولى من التدريب','لو اختفت مهمة واحدة','مجموع الساعات الأسبوعية','استعدادك لتطبيق'];

function normalize(s){ return String(s||'').replace(/[\u064B-\u065F]/g,'').trim(); }
function toNum(v){ const s=String(v||'').replace(/[٠-٩]/g,d=>arabicDigits[d]).match(/-?\d+(\.\d+)?/); return s?Number(s[0]):0; }
function escapeHtml(s){ return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function splitMulti(v){ return String(v||'').split(/[,،;؛\n]+/).map(s=>s.trim()).filter(Boolean); }
function countBy(items){ const m=new Map(); items.filter(Boolean).forEach(x=>m.set(x,(m.get(x)||0)+1)); return [...m.entries()].sort((a,b)=>b[1]-a[1]); }
function parseHours(v){
  const raw = String(v||'').trim();
  const s = raw.replace(/[٠-٩]/g,d=>arabicDigits[d]);
  if (!s) return 0;
  const nums = [...s.matchAll(/\d+(?:\.\d+)?/g)].map(m=>Number(m[0]));
  if (!nums.length) return 0;
  if (/اقل|أقل|less/i.test(raw)) return nums[0] / 2;
  if (/اكثر|أكثر|more|\+/i.test(raw)) return nums[0] + Math.min(8, Math.max(2, nums[0] * 0.17));
  if (nums.length >= 2) return (nums[0]+nums[1])/2;
  return nums[0];
}
function clusterTask(text){
  const t=String(text||'');
  const clusters=[
    ['التقارير والتلخيص', /تقرير|تقارير|تلخيص|محضر|عرض|عروض/i],
    ['خدمة العملاء والرسائل', /عميل|عملاء|واتساب|رسائل|ردود|شكاوى|شكاوي|متابعة/i],
    ['إدخال ونقل البيانات', /ادخال|إدخال|نقل|تحديث|بيانات|نظام|اكسل|excel|مطابقة/i],
    ['المالية والتحصيل', /تحصيل|فاتورة|فواتير|مطابقة|رصيد|أرصدة|ارصدة|سداد|متأخر|متاخر/i],
    ['الموارد البشرية والتدريب', /تدريب|موظف|موظفين|حضور|متدرب|تطوير/i],
    ['العقود والشؤون القانونية', /عقد|عقود|قانون|قضية|قضايا|محكمة/i]
  ];
  return clusters.find(([,re])=>re.test(t))?.[0] || 'عمليات متفرقة';
}
function pick(row, names){
  const headers = state.headers.map(h => normalize(h));
  for (const name of names) {
    const n = normalize(name);
    const exact = headers.findIndex(h => h === n);
    if (exact >= 0 && row[exact]) return row[exact];
  }
  for (const name of names) {
    const n = normalize(name);
    const idx = headers.findIndex(h => h.includes(n));
    if (idx >= 0 && row[idx]) return row[idx];
  }
  return '';
}
function personName(row){ return pick(row,['الاسم']) || 'غير محدد'; }
function repeatedTasks(row){
  return [
    [pick(row,['المهمة المتكررة الأولى']), pick(row,['ساعاتها أسبوعيًا'])],
    [pick(row,['المهمة المتكررة الثانية']), pick(row,['ساعاتها أسبوعيًا 2'])],
    [pick(row,['المهمة المتكررة الثالثة']), pick(row,['ساعاتها أسبوعيًا 3'])]
  ].filter(([task])=>task);
}
function rowWasteHours(row){
  const baseline = parseHours(pick(row,['مجموع الساعات الأسبوعية']));
  const taskHours = repeatedTasks(row).reduce((s,[,h])=>s+parseHours(h),0);
  return baseline || taskHours;
}
function dedupeRows(rows){
  const seen = new Set(), unique = [], duplicates = [];
  for (const row of rows) {
    const name = normalize(pick(row,['الاسم'])).toLowerCase();
    const dept = normalize(pick(row,['القسم'])).toLowerCase();
    const email = normalize(pick(row,['Email','Email Address','البريد','الإيميل'])).toLowerCase();
    const keys = [email && `email:${email}`, (name || dept) && `person:${name}|${dept}`].filter(Boolean);
    if (keys.some(k => seen.has(k))) duplicates.push({ key: keys[0] || '', name: personName(row) });
    else { keys.forEach(k => seen.add(k)); unique.push(row); }
  }
  return { unique, duplicates };
}
function selectedColumnIndexes(){
  if (tableMode === 'all') return state.headers.map((_,i)=>i);
  return state.headers.map((h,i)=>({h,i})).filter(({h})=>importantColumns.some(p=>normalize(h).includes(normalize(p)))).map(x=>x.i);
}
function cleanData(){
  const deduped = dedupeRows(state.rows || []);
  return deduped.unique.map(row => Object.fromEntries(state.headers.map((h,i)=>[h, row[i] || ''])));
}
function buildAggregate(){
  const rawRows = state.rows || [];
  const deduped = dedupeRows(rawRows);
  const rows = deduped.unique;
  const depts = countBy(rows.map(r=>pick(r,['القسم'])));
  const titles = countBy(rows.map(r=>pick(r,['المسمى الوظيفي'])));
  const priorities = countBy(rows.map(r=>pick(r,['أولويتك الأولى من التدريب'])));
  const tools = countBy(rows.flatMap(r=>splitMulti(pick(r,['الأدوات التي جربتها']))));
  const totalWaste = rows.reduce((s,r)=>s+rowWasteHours(r),0);
  const taskCount = rows.reduce((s,r)=>s+repeatedTasks(r).length,0);
  return { rows, people: rows.length, rawCount: rawRows.length, duplicateCount: deduped.duplicates.length, depts, titles, priorities, tools, totalWaste, taskCount };
}
function topList(pairs, max=6){ return pairs.slice(0,max).map(([k,v])=>`<li>${escapeHtml(k)} <small>(${v})</small></li>`).join('') || '<li>غير محدد</li>'; }
function renderOverview(){
  const a = buildAggregate();
  $('companyOverview').innerHTML = `<div class="overview-grid">
    <div><b>${a.people}</b><span>العينة بعد إزالة التكرار</span></div>
    <div><b>${a.rawCount}</b><span>الردود الخام</span></div>
    <div><b>${a.depts.length}</b><span>الأقسام</span></div>
    <div><b>${Math.round(a.totalWaste).toLocaleString('ar-SA')}</b><span>ساعات أسبوعية متكررة</span></div>
  </div><p class="overview-note">التكرارات المحذوفة: ${a.duplicateCount}. هذه الصفحة تعرض البيانات فقط ولا تولّد عرضًا.</p>`;
  $('schemaSummary').innerHTML = `<div class="overview-grid">
    <div><b>${state.headers.length}</b><span>الأعمدة المقروءة</span></div>
    <div><b>${a.taskCount}</b><span>مهام متكررة مذكورة</span></div>
    <div><b>${a.titles.length}</b><span>مسميات وظيفية</span></div>
    <div><b>${a.tools.length}</b><span>أدوات AI مذكورة</span></div>
  </div><div class="two-col"><div><h3>أهم الأولويات</h3><ul>${topList(a.priorities,5)}</ul></div><div><h3>الأدوات المجربة</h3><ul>${topList(a.tools,5)}</ul></div></div>`;
}
function renderTable(){
  const a = buildAggregate();
  const idxs = selectedColumnIndexes();
  if (!a.rows.length) { $('dataTable').innerHTML = '<p class="empty">لا توجد بيانات بعد.</p>'; return; }
  const head = idxs.map(i=>`<th>${escapeHtml(state.headers[i])}</th>`).join('');
  const body = a.rows.map(row=>`<tr>${idxs.map(i=>`<td>${escapeHtml(row[i] || '')}</td>`).join('')}</tr>`).join('');
  $('dataTable').innerHTML = `<div class="table-scroll"><table class="generated-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
function render(){ renderOverview(); renderTable(); }
function setStatus(msg){ $('loadStatus').textContent = msg; }
async function loadSheet(){
  const url=$('sheetUrl').value.trim();
  if(!url){ setStatus('ضع رابط Google Sheet أو استخدم البيانات التجريبية.'); return; }
  setStatus('جاري قراءة الشيت بنفس طريقة المولد الحالي...');
  try {
    const res=await fetch('/api/read-sheet?url='+encodeURIComponent(url));
    const data=await res.json();
    if(!res.ok){ setStatus(data.error || 'تعذر قراءة الشيت.'); return; }
    state={headers:data.headers, rows:data.rows, source:data.source || url};
    render();
    setStatus(`تمت قراءة ${data.rows.length} رد من الشيت. تم تنظيفها وعرضها بدون توليد عرض.`);
  } catch(e) {
    setStatus('تعذر قراءة الشيت: ' + (e.message || 'خطأ غير معروف'));
  }
}
function download(name, type, text){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); URL.revokeObjectURL(a.href); }
function cleanCsv(){
  const rows = cleanData();
  const esc = (v)=>`"${String(v ?? '').replace(/"/g,'""')}"`;
  return [state.headers.map(esc).join(','), ...rows.map(r=>state.headers.map(h=>esc(r[h])).join(','))].join('\n');
}
function compactForDiagnostic(){
  const rows = buildAggregate().rows;
  return rows.map(r=>({
    name: personName(r),
    email: pick(r,['Email','Email Address','البريد','الإيميل']),
    dept: pick(r,['القسم']),
    title: pick(r,['المسمى الوظيفي']),
    years: pick(r,['سنوات خبرتك','سنوات الخبرة']),
    tasks: repeatedTasks(r).map(([task,hours])=>({task,hours})),
    dailyOutput: pick(r,['ما أكثر ما تنتجه']),
    aiUsage: pick(r,['استخدامك لأدوات الذكاء الاصطناعي','استخدام أدوات الذكاء الاصطناعي']),
    tools: pick(r,['الأدوات التي جربتها']),
    furthestUse: pick(r,['أبعد ما وصلت إليه']),
    promptScore: toNum(pick(r,['صياغة طلب واضح','تقييم صياغة الطلب'])),
    qualityScore: toNum(pick(r,['الحكم على جودة','تقييم الحكم على جودة'])),
    dataScore: toNum(pick(r,['ملفات وبيانات عملي','استخدام AI على بيانات العمل','تقييم استخدام AI على بيانات العمل'])),
    automationScore: toNum(pick(r,['بناء خطوة أتمتة','تقييم بناء الأتمتة'])),
    barriers: pick(r,['اختر كل ما ينطبق عليك','العوائق الحالية']),
    trainingDemand: pick(r,['أولويتك الأولى من التدريب','أولوية التدريب']),
    automationWish: pick(r,['لو اختفت مهمة واحدة','المهمة التي يتمنى الموظف']),
    wasteHours: rowWasteHours(r),
    employeeAutomatableOpinion: pick(r,['مجموع الساعات الأسبوعية','مجموع الساعات الأسبوعية القابلة للأتمتة']),
    readiness: toNum(pick(r,['استعدادك لتطبيق','الاستعداد للتطبيق']))
  }));
}
function listItems(items){
  const arr = Array.isArray(items) ? items : (items && typeof items === 'object' ? Object.entries(items).map(([k,v])=>`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) : (items ? [items] : []));
  return arr.slice(0,8).map(x=>`<li>${escapeHtml(typeof x === 'string' ? x : JSON.stringify(x))}</li>`).join('') || '<li>غير متوفر من البيانات الحالية.</li>';
}
function money(n){ return Number.isFinite(Number(n)) ? `${Math.round(Number(n)).toLocaleString('ar-SA')} ريال` : 'غير محسوب'; }
function plainMoney(n){ return Number.isFinite(Number(n)) ? Math.round(Number(n)).toLocaleString('ar-SA') : '—'; }
function financialInputs(){
  const avgSalary = toNum($('avgSalary')?.value || 0);
  const monthlyHours = toNum($('monthlyHours')?.value || 0);
  const loadedHourlyCost = avgSalary > 0 && monthlyHours > 0 ? avgSalary / monthlyHours : null;
  return { avgSalary, monthlyHours, loadedHourlyCost };
}
function diagnosticTable(rows, cols){
  if(!rows || !rows.length) return '<p>غير متوفر من البيانات الحالية.</p>';
  return `<table class="generated-table"><thead><tr>${cols.map(c=>`<th>${escapeHtml(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,8).map(r=>`<tr>${cols.map(c=>`<td>${escapeHtml(r[c.key] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function renderDiagnostic(d){
  latestDiagnostic = d;
  const capability = diagnosticTable(d.capabilityLadder, [{key:'label',label:'المهارة'}, {key:'average',label:'المتوسط'}, {key:'lowPct',label:'% ١–٢'}, {key:'highPct',label:'% ٤–٥'}, {key:'interpretation',label:'المعنى'}]);
  const clusters = diagnosticTable(d.processClusters, [{key:'name',label:'العملية'}, {key:'employeeCount',label:'الموظفون'}, {key:'weeklyHours',label:'ساعات/أسبوع'}, {key:'automationFeasibility',label:'قابلية الأتمتة'}, {key:'intervention',label:'التدخل'}]);
  const beforeAfter = (d.beforeAfter||[]).slice(0,6).map(x=>`<div class="before-after-card"><h3>${escapeHtml(x.area)}</h3><div class="three-state"><div><b>قبل</b><p>${escapeHtml(x.before)}</p></div><div><b>التدخل</b><p>${escapeHtml(x.intervention)}</p></div><div><b>بعد</b><p>${escapeHtml(x.after)}</p></div></div></div>`).join('') || '<p>غير متوفر من البيانات الحالية.</p>';
  const fin = financialInputs();
  $('diagnosticOutput').innerHTML = `<div class="cover"><img src="/logo-nahr.svg" alt="نهر"><h1>AI Transformation Diagnostic</h1><p>Current State → Intervention → Target State</p></div>
    <h2>١. Executive Summary</h2><p>${escapeHtml(d.executiveSummary || '')}</p>
    <div class="bi-kpis"><article class="bi-kpi"><span>متوسط الراتب</span><b>${money(fin.avgSalary)}</b><small>مدخل منك</small></article><article class="bi-kpi"><span>تكلفة الساعة</span><b>${money(fin.loadedHourlyCost)}</b><small>${fin.avgSalary && fin.monthlyHours ? `${Math.round(fin.avgSalary).toLocaleString('ar-SA')} ÷ ${Math.round(fin.monthlyHours).toLocaleString('ar-SA')} ساعة` : 'تحتاج راتب وساعات شهرية'}</small></article><article class="bi-kpi"><span>الردود الفريدة</span><b>${escapeHtml(d.dataIntegrity?.uniqueRespondents ?? '')}</b><small>بعد فحص البيانات</small></article><article class="bi-kpi"><span>الساعات الأسبوعية المعلنة</span><b>${escapeHtml(d.wasteEngine?.reportedWeeklyHours ?? '')}</b><small>Reported capacity</small></article><article class="bi-kpi"><span>FTE equivalent</span><b>${escapeHtml(d.wasteEngine?.fteEquivalent ?? '')}</b><small>${escapeHtml(d.wasteEngine?.assumption || '')}</small></article><article class="bi-kpi"><span>Consulting Fee</span><b>${money(d.pricing?.consultingFee)}</b><small>${escapeHtml(d.pricing?.rule || '')}</small></article></div>
    <h2>٢. Evidence Standard</h2><ul>${listItems(d.evidenceStandard)}</ul>
    <h2>٣. Data Integrity Scan</h2><table class="generated-table"><tr><th>البند</th><th>القيمة</th></tr><tr><td>Total responses</td><td>${escapeHtml(d.dataIntegrity?.totalResponses ?? '')}</td></tr><tr><td>Unique respondents</td><td>${escapeHtml(d.dataIntegrity?.uniqueRespondents ?? '')}</td></tr><tr><td>Duplicates</td><td>${escapeHtml(d.dataIntegrity?.duplicates ?? '')}</td></tr><tr><td>Data quality</td><td>${escapeHtml(d.dataIntegrity?.dataQualityScore ?? '')}</td></tr></table>
    <h2>٤. AI Capability Ladder</h2>${capability}
    <h2>٥. Contradiction Engine</h2><ul>${listItems(d.contradictions)}</ul>
    <h2>٦. Automation Blindness Index</h2><ul>${listItems(d.automationBlindness)}</ul>
    <h2>٧. Process Clustering</h2>${clusters}
    <h2>٨. Need vs Demand Gap</h2><ul>${listItems(d.needVsDemandGap)}</ul>
    <h2>٩. Barrier Decomposition</h2>${diagnosticTable(d.barrierDecomposition, [{key:'barrier',label:'العائق'}, {key:'type',label:'نوعه'}, {key:'intervention',label:'التدخل'}])}
    <h2>١٠. Before → Intervention → After</h2>${beforeAfter}
    <h2>١١. Engagement Architecture</h2><ol>${listItems(d.engagementArchitecture).replaceAll('<li>','<li>')}</ol>
    <h2>١٢. Value Case & Success Measurement</h2><p>الفرصة النظرية: ${escapeHtml(d.valueCase?.theoreticalOpportunityHours ?? '')} ساعة. الهدف الواقعي: ${escapeHtml(d.valueCase?.realisticTargetHours ?? '')} ساعة. ${escapeHtml(d.valueCase?.measurableValue || '')}</p><ul>${listItems(d.successMeasurement)}</ul>`;
}
async function runDiagnostic(){
  const responses = compactForDiagnostic();
  if(!responses.length){ setStatus('حمّل الشيت أولًا قبل تشغيل التشخيص.'); return; }
  $('diagnosticOutput').innerHTML = '<p class="empty">جاري تشغيل محرك التشخيص الجديد...</p>';
  setStatus('جاري تشغيل التشخيص الجديد من البيانات المستخرجة...');
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), 90000);
  try {
    const fin = financialInputs();
    const res = await fetch('/api/diagnostic-proposal', { method:'POST', headers:{'content-type':'application/json'}, signal:controller.signal, body: JSON.stringify({ responses, workingWeeks: toNum($('workingWeeks')?.value || 46), avgSalary: fin.avgSalary || null, monthlyHours: fin.monthlyHours || null, loadedHourlyCost: fin.loadedHourlyCost }) });
    clearTimeout(timeout);
    const data = await res.json();
    if(!res.ok || data.error) throw new Error(data.error || 'Diagnostic failed');
    renderDiagnostic(data);
    setStatus(`تم تشغيل التشخيص الجديد باستخدام ${data.modelUsed || 'AI'}.`);
  } catch(e) {
    clearTimeout(timeout);
    $('diagnosticOutput').innerHTML = '<p class="empty">تعذر تشغيل التشخيص الآن. جرب مرة أخرى أو قلل حجم الشيت.</p>';
    setStatus('تعذر تشغيل التشخيص: ' + (e.message || 'خطأ غير معروف'));
  }
}

function proposalSettings(){
  const seats = toNum($('trainingSeats')?.value || 12) || 12;
  const seatPrice = toNum($('seatPrice')?.value || 5000) || 5000;
  const processPrice = toNum($('processPrice')?.value || 40000) || 40000;
  const automationPrice = toNum($('automationPrice')?.value || 40000) || 40000;
  const auditPrice = toNum($('auditPrice')?.value || 20000) || 20000;
  const trainingPrice = seats * seatPrice;
  return {
    customerName: $('customerName')?.value?.trim() || $('companyName')?.value?.trim() || 'الجهة العميلة',
    sector: $('companySector')?.value || 'القطاع الخاص',
    logo: customerLogoData || $('customerLogoUrl')?.value?.trim() || '/nufouth-logo-0.png',
    ink: $('proposalColor')?.value || '#0E262C',
    accent: $('accentColor')?.value || '#B9863B',
    weeks: toNum($('workingWeeks')?.value || 46) || 46,
    avgSalary: toNum($('avgSalary')?.value || 0),
    monthlyHours: toNum($('monthlyHours')?.value || 160) || 160,
    seats, seatPrice, processPrice, automationPrice, auditPrice,
    trainingPrice,
    total: trainingPrice + processPrice + automationPrice,
    paymentPct: toNum($('paymentPct')?.value || 50) || 50
  };
}
function avgScore(rows,key){ const vals=rows.map(r=>Number(r[key]||0)).filter(Boolean); return vals.length ? vals.reduce((a,b)=>a+b,0)/vals.length : 0; }
function barHtml(label,val,max=5){ const pct=Math.max(0,Math.min(100,(Number(val)||0)/max*100)); return `<div class="bar"><div class="barrow"><span>${escapeHtml(label)}</span><b>${Number(val||0).toFixed(1)}</b></div><div class="track"><div class="fill" style="width:${pct}%"></div></div></div>`; }
function topText(arr, fallback='غير محدد'){ return (arr && arr[0] && arr[0][0]) ? arr[0][0] : fallback; }
function slide(n,total,html,dark=false,extra=''){
  const s=proposalSettings();
  return `<section class="d-slide ${dark?'dark':''} ${extra}" style="--deck-ink:${s.ink};--deck-accent:${s.accent}"><img class="d-nahr" src="/logo-nahr.svg" alt="نهر"><img class="d-client" src="${escapeHtml(s.logo)}" alt="شعار العميل">${n?`<div class="d-num">${n} / ${total}</div>`:''}${html}</section>`;
}
function ensureDiagnosticForProposal(){
  if (latestDiagnostic) return latestDiagnostic;
  const fin = financialInputs();
  return fallbackLikeClientDiagnostic({ responses: compactForDiagnostic(), workingWeeks: toNum($('workingWeeks')?.value || 46), avgSalary: fin.avgSalary, monthlyHours: fin.monthlyHours, loadedHourlyCost: fin.loadedHourlyCost });
}
function fallbackLikeClientDiagnostic(input){
  const rows = input.responses || [];
  const weeks = Number(input.workingWeeks || 46);
  const loadedHourlyCost = Number(input.loadedHourlyCost || 0);
  const totalWeekly = rows.reduce((s,r)=>s+Number(r.wasteHours||0),0);
  const annualHours = totalWeekly * weeks;
  const annualLaborWaste = loadedHourlyCost ? annualHours * loadedHourlyCost : null;
  const processMap = new Map();
  rows.forEach(r => (r.tasks||[]).forEach(t => { const k = clusterTask(t.task); const v=processMap.get(k)||{name:k,employeeCount:0,departments:new Set(),weeklyHours:0,automationFeasibility:'medium',intervention:'توحيد الإجراء وبناء قالب تشغيل أو أتمتة حسب جاهزية النظام'}; v.employeeCount++; if(r.dept) v.departments.add(r.dept); v.weeklyHours += parseHours(t.hours); processMap.set(k,v); }));
  const clusters=[...processMap.values()].map(x=>({...x,departments:[...x.departments],weeklyHours:+x.weeklyHours.toFixed(1)})).sort((a,b)=>b.weeklyHours-a.weeklyHours);
  return { modelUsed:'local-template', executiveSummary:`يعرض هذا المقترح تشخيصًا عمليًا لردود ${rows.length} من منسوبي الجهة، ويربط الفجوات ببرنامج تمكين وتشغيل قابل للقياس بدل الاكتفاء بتدريب عام.`,
    dataIntegrity:{totalResponses:rows.length,uniqueRespondents:rows.length,duplicates:0,dataQualityScore:rows.length>=5?'medium':'initial'},
    capabilityLadder:[{label:'صياغة الطلب',average:+avgScore(rows,'promptScore').toFixed(1)},{label:'الحكم على الجودة',average:+avgScore(rows,'qualityScore').toFixed(1)},{label:'التطبيق على بيانات العمل',average:+avgScore(rows,'dataScore').toFixed(1)},{label:'بناء الأتمتة',average:+avgScore(rows,'automationScore').toFixed(1)}],
    processClusters:clusters, departmentWaste: countBy(rows.map(r=>r.dept)).map(([name,count])=>({name,respondents:count,weeklyHours:+rows.filter(r=>r.dept===name).reduce((s,r)=>s+Number(r.wasteHours||0),0).toFixed(1)})),
    contradictions:['الاستعداد للتطبيق أعلى من القدرة الحالية على بناء خطوات أتمتة مستقرة.','الطلب الظاهر تدريب، لكن المشكلة التشغيلية تتطلب قوالب وإجراءات ومؤشرات متابعة.'],
    automationBlindness:['جزء من الأعمال المتكررة يوصف كجهد يومي طبيعي رغم أنه قابل للتوحيد أو الأتمتة جزئيًا.'],
    needVsDemandGap:['احتياج الجهة ليس معرفة أدوات فقط، بل نقل طريقة عمل قابلة للتكرار داخل الفريق.'],
    barrierDecomposition:[{barrier:'غياب القوالب والمعايير',type:'process',intervention:'بناء إجراءات ونماذج تشغيل موحدة'},{barrier:'ضعف الثقة في المخرجات',type:'training',intervention:'تمكين تطبيقي على ملفات العمل الحقيقية'},{barrier:'حساسية البيانات والأنظمة',type:'governance',intervention:'حوكمة استخدام وربط آمن'}],
    peopleSegmentation:[{segment:'جاهزون للتطبيق ويحتاجون إطار عمل',count:rows.filter(r=>Number(r.readiness)>=4).length,intervention:'تدريب متقدم وحالات استخدام مباشرة'},{segment:'يحتاجون أساسيات وثقة',count:rows.filter(r=>Number(r.readiness)<4).length,intervention:'تدريب تأسيسي وقوالب استخدام آمنة'}],
    beforeAfter:[{area:clusters[0]?.name || 'العمليات المتكررة',before:'جهد يدوي متكرر ومتفاوت بين الموظفين.',intervention:'تدريب + إجراء موحد + أتمتة/قالب تشغيل.',after:'مخرج أسرع، قابل للقياس، ومالك واضح للتشغيل.'}],
    engagementArchitecture:['التشخيص وخط الأساس','تمكين الطبقة المستهدفة','بناء الإجراءات والمؤشرات','تنفيذ الأتمتات المختارة','القياس البعدي والتسليم'],
    wasteEngine:{reportedWeeklyHours:+totalWeekly.toFixed(1),conservativeWeeklyHours:+(totalWeekly*.7).toFixed(1),annualHours:+annualHours.toFixed(1),fteEquivalent:+(annualHours/1920).toFixed(1),annualLaborWaste:annualLaborWaste?Math.round(annualLaborWaste):null,assumption:`${weeks} أسبوع عمل منتج سنويًا`},
    valueCase:{theoreticalOpportunityHours:+annualHours.toFixed(1),realisticTargetHours:+(annualHours*.35).toFixed(1),measurableValue:'يقاس عبر الساعات المستردة، زمن الدورة، وعدد اللمسات اليدوية قبل/بعد.'}, successMeasurement:['الساعات المستردة شهريًا','زمن إنجاز العملية','نسبة استخدام القوالب','عدد الأتمتات المستخدمة فعليًا','رضا الإدارة عن جودة المخرجات'] };
}
function buildProposalDeckHtml(){
  const a=buildAggregate(), rows=compactForDiagnostic(), d=ensureDiagnosticForProposal(), s=proposalSettings(), total=18;
  const topDept=topText(a.depts,'الأقسام المستهدفة'), topPriority=topText(a.priorities,'تطبيقات عملية على العمل'), topCluster=d.processClusters?.[0]?.name || 'العمليات المتكررة';
  const avgReadiness = rows.length ? rows.reduce((x,r)=>x+Number(r.readiness||0),0)/rows.length : 0;
  const avgAutomation = avgScore(rows,'automationScore');
  const hourly = s.avgSalary && s.monthlyHours ? s.avgSalary/s.monthlyHours : 0;
  const annualWaste = d.wasteEngine?.annualLaborWaste || (hourly ? (d.wasteEngine?.annualHours||0)*hourly : 0);
  const capBars = (d.capabilityLadder||[]).slice(0,4).map(x=>barHtml(x.label,x.average||0)).join('');
  const clusterRows = (d.processClusters||[]).slice(0,5).map(x=>`<tr><td>${escapeHtml(x.name)}</td><td>${escapeHtml((x.departments||[]).join('، ') || topDept)}</td><td class="money">${escapeHtml(x.weeklyHours||0)}</td><td>${escapeHtml(x.intervention||'تدريب + إجراء + أتمتة')}</td></tr>`).join('');
  const deptRows = (d.departmentWaste||[]).slice(0,6).map(x=>`<tr><td>${escapeHtml(x.name)}</td><td>${escapeHtml(x.respondents||'')}</td><td class="money">${escapeHtml(x.weeklyHours||0)}</td></tr>`).join('');
  const before = (d.beforeAfter||[]).slice(0,3).map(x=>`<div class="card"><h3>${escapeHtml(x.area)}</h3><p><b>قبل:</b> ${escapeHtml(x.before)}</p><p><b>التدخل:</b> ${escapeHtml(x.intervention)}</p><p><b>بعد:</b> ${escapeHtml(x.after)}</p></div>`).join('');
  const phases = (d.engagementArchitecture||[]).slice(0,5).map((x,i)=>`<div class="card"><h3>${i+1}. ${escapeHtml(x)}</h3><p>مرحلة مرتبطة بمخرج قابل للاعتماد والقياس.</p></div>`).join('');
  const blockers = (d.barrierDecomposition||[]).slice(0,3).map(x=>`<div class="card"><h3>${escapeHtml(x.barrier)}</h3><p>${escapeHtml(x.intervention)}</p></div>`).join('');
  const success = (d.successMeasurement||[]).slice(0,6).map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  const slides=[];
  slides.push(slide('',total,`<div class="d-body"><p class="eyeb">عرض فني ومالي مخصص</p><h1>تمكين الطبقة الإشرافية<span>ورفع الكفاءة التشغيلية</span></h1><p class="lede">برنامج مبني على تشخيص ميداني لردود ${escapeHtml(s.customerName)}، لتحويل جاهزية الفريق إلى تطبيقات تشغيلية قابلة للقياس.</p><div class="three"><div class="mini"><b>مقدّم إلى</b><span>${escapeHtml(s.customerName)}</span></div><div class="mini"><b>مقدّم من</b><span>نهر لتمكين الموظفين وأنظمة العمل</span></div><div class="mini"><b>القطاع</b><span>${escapeHtml(s.sector)}</span></div></div></div>`,true,'cover'));
  slides.push(slide(2,total,`<p class="eyeb">العيّنة</p><h2>التشخيص يُقرأ على مستوى الشركة لا على رد فردي</h2><div class="d-body grid g4"><div class="card"><div class="stat sm">${a.people}</div><div class="lbl">ردود فريدة</div></div><div class="card"><div class="stat sm">${a.depts.length}</div><div class="lbl">أقسام ممثلة</div></div><div class="card"><div class="stat sm">${Math.round(a.totalWaste)}</div><div class="lbl">ساعات أسبوعية متكررة</div></div><div class="card"><div class="stat sm">${a.taskCount}</div><div class="lbl">مهام مذكورة</div></div></div><p class="foot">التكرارات المحذوفة: ${a.duplicateCount}. أي نقص بيانات يُستكمل في مرحلة خط الأساس.</p>`));
  slides.push(slide(3,total,`<div class="d-body"><p class="eyeb">الخلاصة</p><h2>الفجوة ليست في الرغبة، بل في تحويل الرغبة إلى تشغيل يومي.</h2><p class="lede">${escapeHtml(d.executiveSummary||'')}</p><div class="grid g2"><div class="card brass"><div class="stat sm">${avgReadiness.toFixed(1)}</div><div class="lbl">استعداد التطبيق</div></div><div class="card"><div class="stat sm">${avgAutomation.toFixed(1)}</div><div class="lbl">قدرة بناء الأتمتة</div></div></div></div>`,true));
  slides.push(slide(4,total,`<p class="eyeb">Data Integrity</p><h2>الأرقام المستخدمة منفصلة عن الفرضيات</h2><div class="d-body grid g3"><div class="card"><h3>FACT</h3><p>عدد الردود، الأقسام، المهام، والساعات المصرّح بها من الشيت.</p></div><div class="card"><h3>CALCULATION</h3><p>الساعات السنوية = الساعات الأسبوعية × ${s.weeks} أسبوع. تكلفة الساعة = الراتب ÷ ساعات الشهر.</p></div><div class="card"><h3>HYPOTHESIS</h3><p>نسبة الاسترداد الفعلية وقابلية الأتمتة النهائية تُثبت في خط الأساس.</p></div></div>`));
  slides.push(slide(5,total,`<p class="eyeb">AI Capability Ladder</p><h2>مستوى الجاهزية حسب المهارات العملية</h2><div class="d-body grid g2"><div class="card">${capBars}</div><div class="card solid"><h3>المعنى التجاري</h3><p>كلما انخفضت مهارة التطبيق على بيانات العمل وبناء الأتمتة، يصبح التدريب وحده غير كافٍ ويحتاج إلى إجراءات وقوالب وتسليم عملي.</p></div></div>`));
  slides.push(slide(6,total,`<p class="eyeb">Contradiction Engine</p><h2>التناقضات التي تكشف أين يجب التدخل</h2><div class="d-body grid g3">${(d.contradictions||[]).slice(0,3).map(x=>`<div class="card"><p>${escapeHtml(x)}</p></div>`).join('')}</div>`));
  slides.push(slide(7,total,`<p class="eyeb">Automation Blindness</p><h2>أعمال متكررة تُعامل كأنها طبيعية</h2><div class="d-body grid g2"><div class="card brass"><h3>${escapeHtml(topCluster)}</h3><p>أعلى عنق زجاجة ظاهر من البيانات.</p></div><div class="card"><ul>${(d.automationBlindness||[]).slice(0,5).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div></div>`));
  slides.push(slide(8,total,`<p class="eyeb">Process Clustering</p><h2>تجميع المهام حسب العمليات لا حسب الأشخاص</h2><div class="d-body"><table><thead><tr><th>العملية</th><th>الأقسام</th><th>س/أسبوع</th><th>التدخل</th></tr></thead><tbody>${clusterRows}</tbody></table></div>`));
  slides.push(slide(9,total,`<p class="eyeb">Department Waste</p><h2>توزيع الهدر المصرّح به حسب الأقسام</h2><div class="d-body"><table><thead><tr><th>القسم</th><th>الردود</th><th>ساعات أسبوعية</th></tr></thead><tbody>${deptRows}</tbody></table></div>`));
  slides.push(slide(10,total,`<p class="eyeb">Need vs Demand</p><h2>ما يطلبه الفريق وما تحتاجه المنظمة</h2><div class="d-body grid g2"><div class="card"><h3>الطلب الظاهر</h3><p>${escapeHtml(topPriority)}</p></div><div class="card solid"><h3>الاحتياج الحقيقي</h3><ul>${(d.needVsDemandGap||[]).slice(0,4).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul></div></div>`));
  slides.push(slide(11,total,`<p class="eyeb">Barrier Decomposition</p><h2>كل عائق له تدخل مختلف</h2><div class="d-body grid g3">${blockers}</div>`));
  slides.push(slide(12,total,`<p class="eyeb">Before → Intervention → After</p><h2>النتيجة ليست تدريب فقط، بل تغيير طريقة العمل</h2><div class="d-body grid g3">${before}</div>`));
  slides.push(slide(13,total,`<p class="eyeb">النطاق المقترح</p><h2>ثلاثة مسارات مترابطة</h2><div class="d-body grid g3"><div class="card"><h3>تمكين المشرفين</h3><p>تدريب تطبيقي على ملفات ${escapeHtml(s.customerName)} الحقيقية.</p></div><div class="card"><h3>الإجراءات والمؤشرات</h3><p>عمليات تشغيلية موحدة، ملاك واضحون، ومؤشرات متابعة.</p></div><div class="card solid"><h3>البناء على الأنظمة</h3><p>أتمتات أو طبقة تشغيل بديلة حسب جاهزية الأنظمة.</p></div></div>`));
  slides.push(slide(14,total,`<p class="eyeb">الجدول الزمني</p><h2>من التشخيص إلى القياس البعدي</h2><div class="d-body grid g4">${phases}</div><p class="foot">يتوقف مسار الربط التقني على توفر الوصول للأنظمة، ويستعاض عنه بطبقة تشغيل مستقلة عند الحاجة.</p>`));
  slides.push(slide(15,total,`<p class="eyeb">المقابل الاستثماري</p><h2>المقابل يعالج فجوة لا يغطيها التوظيف الفردي وحده</h2><div class="d-body grid g2"><div><table><tbody><tr><td>التدقيق والتحليل التشخيصي الأولي</td><td class="money"><span class="price-old">${plainMoney(s.auditPrice)}</span><span class="price-free">مشمولة مجانًا</span></td></tr><tr><td>تمكين المشرفين</td><td class="money">${plainMoney(s.trainingPrice)}</td></tr><tr><td>الإجراءات ومؤشرات القياس</td><td class="money">${plainMoney(s.processPrice)}</td></tr><tr><td>البناء على الأنظمة</td><td class="money">${plainMoney(s.automationPrice)}</td></tr><tr class="total"><td>الإجمالي المستحق</td><td class="money">${plainMoney(s.total)}</td></tr></tbody></table><div class="pay"><b>${s.paymentPct}%</b><span>دفعة أولية من قيمة الخدمة المرغوبة عند الاعتماد<small>ويُستكمل المتبقي حسب مراحل التنفيذ المتفق عليها.</small></span></div></div><div class="card brass"><div class="stat sm">${plainMoney(s.total/12)} ريال</div><p>شهريًا لمدة سنة تقريبًا — قريب من تكلفة توظيف مرشح قوي في الذكاء الاصطناعي والأتمتة، بينما هذا النطاق ينقل القدرة لفريق كامل مع إجراءات ومؤشرات وأتمتات.</p></div></div>`,false,'invoice'));
  slides.push(slide(16,total,`<p class="eyeb">مرونة الاعتماد</p><h2>يمكن اعتماد النطاق كاملًا أو اختيار الأولوية الحالية</h2><div class="d-body grid g4"><div class="card brass"><h3>البرنامج الكامل</h3><p>${plainMoney(s.total)} ريال</p></div><div class="card"><h3>تمكين المشرفين</h3><p>${plainMoney(s.trainingPrice)} ريال</p></div><div class="card"><h3>الإجراءات والمؤشرات</h3><p>${plainMoney(s.processPrice)} ريال</p></div><div class="card"><h3>البناء على الأنظمة</h3><p>${plainMoney(s.automationPrice)} ريال</p></div></div><p class="foot">أي احتياج إضافي خارج البنود أعلاه يُسعّر بشكل مستقل بعد تحديد النطاق.</p>`));
  slides.push(slide(17,total,`<p class="eyeb">Value Case</p><h2>الأثر يقاس على ساعات مستردة لا وعود عامة</h2><div class="d-body grid g3"><div class="card"><div class="stat sm">${plainMoney(d.wasteEngine?.annualHours)}</div><div class="lbl">ساعات سنوية نظرية</div></div><div class="card"><div class="stat sm">${plainMoney(d.valueCase?.realisticTargetHours)}</div><div class="lbl">هدف واقعي قابل للقياس</div></div><div class="card"><div class="stat sm">${money(annualWaste)}</div><div class="lbl">قيمة عمل سنوية تقديرية عند توفر الراتب</div></div></div>`));
  slides.push(slide(18,total,`<p class="eyeb">Success Measurement</p><h2>ما الذي نثبته بعد التنفيذ؟</h2><div class="d-body grid g2"><div class="card"><ul>${success}</ul></div><div class="card solid"><h3>الخطوة التالية</h3><p>اعتماد النطاق والمقابل، تسمية الراعي التنفيذي، وتحديد الأنظمة/العمليات التي يبدأ بها خط الأساس.</p></div></div>`,true));
  return `<div class="proposal-deck-wrap print-root"><div class="proposal-deck-tools"><div><b>عرض ${escapeHtml(s.customerName)} — 18 صفحة</b><br><span>PDF-style, reverse engineered from the approved proposal structure.</span></div></div><div class="client-deck">${slides.join('')}</div></div>`;
}
function buildProposalDeck(){
  if(!buildAggregate().rows.length){ setStatus('حمّل الشيت أولًا قبل توليد العرض.'); return; }
  $('proposalDeckOutput').innerHTML = buildProposalDeckHtml();
  setStatus('تم توليد العرض صفحة بصفحة. يمكنك الآن الطباعة/الحفظ كـ PDF أو تحميل HTML.');
}
function printProposal(){
  if (!$('proposalDeckOutput').querySelector('.client-deck')) buildProposalDeck();
  document.body.classList.add('printing-proposal');
  setTimeout(()=>{ window.print(); setTimeout(()=>document.body.classList.remove('printing-proposal'), 800); }, 100);
}
function downloadProposalHtml(){
  if (!$('proposalDeckOutput').querySelector('.client-deck')) buildProposalDeck();
  const html = `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>عرض نهر</title><link rel="stylesheet" href="https://nahr-proposal-generator.vercel.app/styles.css"><body>${$('proposalDeckOutput').innerHTML}</body></html>`;
  download('nahr-client-proposal.html','text/html;charset=utf-8',html);
}

$('loadSample').addEventListener('click',()=>{ state={headers:sampleHeaders, rows:sampleRows, source:'sample'}; render(); setStatus('تم تحميل بيانات تجريبية. هذه نسخة استخراج فقط بدون مولد.'); });
$('loadSheet').addEventListener('click',loadSheet);
$('runDiagnostic').addEventListener('click',runDiagnostic);
$('buildProposal').addEventListener('click',buildProposalDeck);
$('printProposal').addEventListener('click',printProposal);
$('downloadProposalHtml').addEventListener('click',downloadProposalHtml);
$('customerLogoFile').addEventListener('change',e=>{ const file=e.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{ customerLogoData=reader.result; setStatus('تم تحميل شعار العميل وسيستخدم في العرض.'); }; reader.readAsDataURL(file); });
$('showAll').addEventListener('click',()=>{ tableMode='all'; renderTable(); });
$('showImportant').addEventListener('click',()=>{ tableMode='important'; renderTable(); });
$('copyJson').addEventListener('click',async()=>{ await navigator.clipboard.writeText(JSON.stringify(cleanData(), null, 2)); setStatus('تم نسخ JSON النظيف.'); });
$('copyDiagnostic').addEventListener('click',async()=>{ await navigator.clipboard.writeText($('diagnosticOutput').innerText); setStatus('تم نسخ التشخيص.'); });
$('downloadDiagnostic').addEventListener('click',()=>download('nahr-ai-transformation-diagnostic.html','text/html;charset=utf-8','<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>تشخيص نهر</title><link rel="stylesheet" href="https://nahr-proposal-generator.vercel.app/styles.css"><body><main><article class="proposal">'+$('diagnosticOutput').innerHTML+'</article></main></body></html>'));
$('downloadJson').addEventListener('click',()=>download('nahr-clean-responses.json','application/json;charset=utf-8',JSON.stringify(cleanData(), null, 2)));
$('downloadCsv').addEventListener('click',()=>download('nahr-clean-responses.csv','text/csv;charset=utf-8',cleanCsv()));
render();
