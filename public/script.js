const sampleHeaders = [
  'Timestamp','Email','الاسم','القسم','المسمى الوظيفي','سنوات خبرتك في هذا المجال','المهمة المتكررة الأولى','ساعاتها أسبوعيًا','المهمة المتكررة الثانية','ساعاتها أسبوعيًا 2','المهمة المتكررة الثالثة','ساعاتها أسبوعيًا 3','ما أكثر ما تنتجه في عملك اليومي؟','استخدامك لأدوات الذكاء الاصطناعي حتى اليوم','الأدوات التي جربتها','أبعد ما وصلت إليه في استخدامها','صياغة طلب واضح يعطيني نتيجة دقيقة من أول مرة','الحكم على جودة المخرَج ومتى لا يصلح للاستخدام','استخدام الأداة على ملفات وبيانات عملي الحقيقية','بناء خطوة أتمتة تعمل دون تدخلي في كل مرة','اختر كل ما ينطبق عليك','أولويتك الأولى من التدريب','لو اختفت مهمة واحدة من يومك تلقائيًا، أي مهمة تختار؟','مجموع الساعات الأسبوعية التي تقضيها في مهام متكررة يمكن أتمتتها','استعدادك لتطبيق ما تتعلمه فعليًا في عملك بعد التدريب'
];
const sampleRows = [
  ['2026-08-31','reem@example.com','ريم أحمد','الموارد البشرية','أخصائية تطوير موظفين','٦ سنوات','تجميع تقارير الحضور والتدريب','5','تلخيص ملاحظات الاجتماعات','3','تحديث ملفات المتدربين','2','تقارير، عروض، رسائل بريدية','أستخدمها أحيانًا','ChatGPT, Gemini','أكتب مسودات وأراجعها يدويًا','3','3','2','1','عدم وضوح حالات الاستخدام، الخوف من الأخطاء، عدم وجود بيانات مرتبة','بناء قوالب وأتمتة للتقارير','تجهيز تقرير التدريب الأسبوعي وإرساله تلقائيًا','10','4'],
  ['2026-08-31','fahad@example.com','فهد سالم','المبيعات','مشرف مبيعات','٨ سنوات','كتابة متابعة العملاء','4','تجهيز عروض الأسعار','3','تلخيص مكالمات العملاء','2','رسائل عملاء، عروض، تقارير مبيعات','أستخدمها أسبوعيًا','ChatGPT, Copilot','أستخدمها في المسودات والتلخيص','4','3','2','2','عدم معرفة أفضل طريقة للطلب، الخوف من مشاركة بيانات حساسة','تسريع كتابة العروض والمتابعات','تحويل ملاحظات المكالمة إلى رسالة متابعة وعرض مختصر','9','5'],
  ['2026-08-31','sara@example.com','سارة علي','خدمة العملاء','قائدة فريق','٥ سنوات','تصنيف شكاوى العملاء','6','كتابة ردود متكررة','4','تقرير نهاية اليوم','2','ردود، تقارير، تصنيفات','لم أستخدمها إلا قليلًا','Gemini','تجربة أسئلة بسيطة','2','2','1','1','لا أعرف من أين أبدأ، لا توجد قوالب، ضعف الثقة في المخرجات','استخدام AI بأمان في خدمة العملاء','تصنيف الشكاوى واقتراح الرد المناسب تلقائيًا','12','4']
];
let state = { headers: sampleHeaders, rows: sampleRows };
const $ = (id) => document.getElementById(id);
const arabicDigits = {'٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'};
function normalize(s){ return String(s||'').replace(/[\u064B-\u065F]/g,'').trim(); }
function toNum(v){ const s=String(v||'').replace(/[٠-٩]/g,d=>arabicDigits[d]).match(/-?\d+(\.\d+)?/); return s?Number(s[0]):0; }
function pick(row, names){
  for (const name of names) {
    const idx = state.headers.findIndex(h => normalize(h).includes(normalize(name)) || normalize(name).includes(normalize(h)));
    if (idx >= 0 && row[idx]) return row[idx];
  }
  return '';
}
function valuesFor(row, namePart){
  const out=[];
  state.headers.forEach((h,i)=>{ if(normalize(h).includes(normalize(namePart)) && row[i]) out.push(row[i]); });
  return out;
}
function splitMulti(v){ return String(v||'').split(/[,،;؛\n]+/).map(s=>s.trim()).filter(Boolean); }
function countBy(items){ const m=new Map(); items.filter(Boolean).forEach(x=>m.set(x,(m.get(x)||0)+1)); return [...m.entries()].sort((a,b)=>b[1]-a[1]); }
function topList(pairs, max=6){ return pairs.slice(0,max).map(([k,v])=>`<li>${escapeHtml(k)} <small>(${v})</small></li>`).join('') || '<li>غير محدد</li>'; }
function avg(nums){ const arr=nums.filter(n=>Number.isFinite(n)&&n>0); return arr.length ? (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1) : 'غير محدد'; }
function setStatus(msg){ $('loadStatus').textContent = msg; }
function renderRows(){
  renderOverview();
}
function buildAggregate(){
  const rows = state.rows || [];
  const people = rows.length;
  const depts = countBy(rows.map(r=>pick(r,['القسم'])));
  const titles = countBy(rows.map(r=>pick(r,['المسمى الوظيفي'])));
  const outputs = countBy(rows.flatMap(r=>splitMulti(pick(r,['ما أكثر ما تنتجه']))));
  const aiUse = countBy(rows.map(r=>pick(r,['استخدامك لأدوات الذكاء الاصطناعي'])));
  const tools = countBy(rows.flatMap(r=>splitMulti(pick(r,['الأدوات التي جربتها']))));
  const obstacles = countBy(rows.flatMap(r=>splitMulti(pick(r,['اختر كل ما ينطبق عليك']))));
  const priorities = countBy(rows.map(r=>pick(r,['أولويتك الأولى من التدريب'])));
  const automationWishes = rows.map(r=>pick(r,['لو اختفت مهمة واحدة'])).filter(Boolean);
  const taskPairs = rows.flatMap(r=>repeatedTasks(r).map(([task,h])=>({task,hours:toNum(h), owner:pick(r,['الاسم']), dept:pick(r,['القسم'])})));
  const totalTaskHours = taskPairs.reduce((s,t)=>s+(t.hours||0),0);
  const baselineHours = rows.map(r=>toNum(pick(r,['مجموع الساعات الأسبوعية']))).filter(Boolean);
  const totalBaseline = baselineHours.reduce((a,b)=>a+b,0);
  const scores = {
    prompt: avg(rows.map(r=>toNum(pick(r,['صياغة طلب واضح'])))),
    quality: avg(rows.map(r=>toNum(pick(r,['الحكم على جودة'])))),
    data: avg(rows.map(r=>toNum(pick(r,['ملفات وبيانات عملي','استخدام الأداة على ملفات'])))),
    automation: avg(rows.map(r=>toNum(pick(r,['بناء خطوة أتمتة'])))),
    readiness: avg(rows.map(r=>toNum(pick(r,['استعدادك لتطبيق']))))
  };
  return { rows, people, depts, titles, outputs, aiUse, tools, obstacles, priorities, automationWishes, taskPairs, totalTaskHours, totalBaseline, scores };
}
function renderOverview(){
  const a=buildAggregate();
  const box=$('companyOverview');
  if(!box) return;
  box.innerHTML = `<div class="overview-grid">
    <div><b>${a.people}</b><span>عدد الردود</span></div>
    <div><b>${a.depts.length}</b><span>الأقسام</span></div>
    <div><b>${a.totalBaseline || a.totalTaskHours}</b><span>ساعات أسبوعية متكررة</span></div>
  </div>
  <p class="overview-note">العرض سيُبنى على كل الردود كمراجعة شركة كاملة. لا يتم استخدام رد فردي.</p>`;
}
function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
async function loadSheet(){
  const url=$('sheetUrl').value.trim();
  if(!url){ setStatus('ضع رابط Google Sheet أو استخدم البيانات التجريبية.'); return; }
  setStatus('جاري قراءة الشيت...');
  const res=await fetch('/api/read-sheet?url='+encodeURIComponent(url));
  const data=await res.json();
  if(!res.ok){ setStatus(data.error || 'تعذر قراءة الشيت.'); return; }
  state={headers:data.headers, rows:data.rows};
  renderRows(); setStatus(`تمت قراءة ${data.rows.length} رد. سيتم توليد نظرة شاملة على الشركة من كل الردود.`);
}
function repeatedTasks(row){
  const pairs = [
    [pick(row,['المهمة المتكررة الأولى']), pick(row,['ساعاتها أسبوعيًا'])],
    [pick(row,['المهمة المتكررة الثانية']), pick(row,['ساعاتها أسبوعيًا 2'])],
    [pick(row,['المهمة المتكررة الثالثة']), pick(row,['ساعاتها أسبوعيًا 3'])]
  ].filter(([task])=>task);
  return pairs;
}
function taskTable(tasks){
  return tasks.slice(0,12).map(t=>`<tr><td>${escapeHtml(t.task)}</td><td>${escapeHtml(t.dept)}</td><td>${escapeHtml(t.owner)}</td><td>${escapeHtml(t.hours || 'غير محدد')}</td></tr>`).join('') || '<tr><td colspan="4">يتم تحديدها في اجتماع الفهم.</td></tr>';
}
function generateProposal(){
  const company = $('companyName').value.trim() || 'اسم الجهة التجريبية';
  const sector = $('companySector').value;
  const a = buildAggregate();
  const topPriority = a.priorities[0]?.[0] || 'تحديد أولويات التدريب بعد اجتماع الفهم';
  const topObstacle = a.obstacles[0]?.[0] || 'تحدد تفصيليًا في اجتماع الفهم';
  const html = `<div class="cover"><img src="/logo-nahr.svg" alt="نهر"><h1>عرض فني ومالي مبدئي</h1><p>${escapeHtml($('programName').value)}</p><div class="meta"><div><b>الجهة</b><br>${escapeHtml(company)}</div><div><b>القطاع</b><br>${escapeHtml(sector)}</div><div><b>عدد الردود المحللة</b><br>${escapeHtml(a.people)}</div><div><b>المدة المقترحة</b><br>${escapeHtml($('timeline').value)}</div></div></div>
<h2>١. الملخص التنفيذي</h2><p>بناءً على تحليل ${escapeHtml(a.people)} رد من نموذج جاهزية الذكاء الاصطناعي والأتمتة، نقترح برنامجًا عمليًا يساعد ${escapeHtml(company)} على بناء جاهزية مؤسسية، وليس تدريبًا مبنيًا على حالة فردية. الأولوية الأكثر تكرارًا في الردود هي: <b>${escapeHtml(topPriority)}</b>.</p>
<h2>٢. النظرة العامة على الشركة</h2><table class="generated-table"><tr><th>البند</th><th>النتيجة</th></tr><tr><td>عدد الردود</td><td>${escapeHtml(a.people)}</td></tr><tr><td>الأقسام المشاركة</td><td>${a.depts.map(([d,c])=>escapeHtml(d)+' ('+c+')').join('، ') || 'غير محدد'}</td></tr><tr><td>المسميات الوظيفية</td><td>${a.titles.slice(0,8).map(([d,c])=>escapeHtml(d)+' ('+c+')').join('، ') || 'غير محدد'}</td></tr><tr><td>إجمالي الساعات الأسبوعية القابلة للتحسين</td><td>${escapeHtml(a.totalBaseline || a.totalTaskHours || 'غير محدد')}</td></tr><tr><td>أبرز العوائق</td><td>${escapeHtml(topObstacle)}</td></tr></table>
<h2>٣. أين يذهب وقت الفريق؟</h2><table class="generated-table"><tr><th>المهمة المتكررة</th><th>القسم</th><th>صاحب الرد</th><th>الساعات/أسبوع</th></tr>${taskTable(a.taskPairs)}</table>
<h2>٤. أكثر المخرجات اليومية</h2><ul>${topList(a.outputs,8)}</ul>
<h2>٥. مستوى الجاهزية الحالي</h2><table class="generated-table"><tr><th>المهارة</th><th>متوسط التقييم من ٥</th></tr><tr><td>صياغة طلب واضح</td><td>${a.scores.prompt}</td></tr><tr><td>الحكم على جودة المخرج</td><td>${a.scores.quality}</td></tr><tr><td>استخدام الأدوات على ملفات وبيانات العمل</td><td>${a.scores.data}</td></tr><tr><td>بناء خطوة أتمتة</td><td>${a.scores.automation}</td></tr><tr><td>الاستعداد للتطبيق</td><td>${a.scores.readiness}</td></tr></table>
<h2>٦. الأدوات والعوائق المتكررة</h2><div class="two-col"><div><h3>الأدوات المجربة</h3><ul>${topList(a.tools,8)}</ul></div><div><h3>العوائق</h3><ul>${topList(a.obstacles,8)}</ul></div></div>
<h2>٧. مخرجات البرنامج المقترحة</h2><ul><li>برنامج تدريبي مبني على احتياج الشركة كاملًا، مع أمثلة من أكثر الأقسام تكرارًا.</li><li>تمارين تطبيقية مبنية على مهام مثل: ${a.automationWishes.slice(0,4).map(escapeHtml).join('، ') || 'تحدد بعد اجتماع الفهم'}.</li><li>قوالب عمل تساعد الفريق على إنتاج ${a.outputs.slice(0,3).map(([k])=>escapeHtml(k)).join('، ') || 'المخرجات اليومية'} بجودة أعلى.</li><li>قياس أثر بعد ٩٠ يومًا بناءً على خط الأساس في الردود.</li></ul>
<h2>٨. نطاق العمل المقترح</h2><h3>مسار التدريب والتطبيق</h3><p>ورش عملية مبنية على أنماط الردود، وليست تدريبًا عامًا لشخص واحد.</p><h3>مسار القوالب والأتمتة</h3><p>تصميم نماذج تشغيل وقوالب لأكثر المهام المتكررة داخل الشركة.</p>
<h2>٩. خطة التنفيذ</h2><ol><li>تحليل كل ردود النموذج وتجميعها حسب الأقسام والأولويات.</li><li>اجتماع فهم مع أصحاب القرار لتأكيد النطاق والفئات.</li><li>تصميم تدريب وتمارين حسب أهم ٣–٥ مهام متكررة.</li><li>تنفيذ التدريب وتطبيق القوالب.</li><li>قياس الأثر بعد ٩٠ يومًا.</li></ol>
<h2>١٠. العرض المالي</h2><p>${escapeHtml($('pricing').value)}</p><h2>١١. الخطوة التالية</h2><p>اعتماد نطاق العمل وعدد المشاركين، ثم إرسال النسخة النهائية من العرض الفني والمالي.</p>`;
  $('proposal').innerHTML=html;
}
function htmlToMd(node){ return node.innerText.replace(/\n{3,}/g,'\n\n'); }
function download(name, type, text){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([text],{type})); a.download=name; a.click(); URL.revokeObjectURL(a.href); }
$('loadSample').addEventListener('click',()=>{ state={headers:sampleHeaders, rows:sampleRows}; renderRows(); setStatus('تم تحميل بيانات تجريبية متعددة الردود. غيّر اسم الجهة ثم ولّد نظرة الشركة.'); });
$('loadSheet').addEventListener('click',loadSheet);
$('generate').addEventListener('click',generateProposal);
$('copyProposal').addEventListener('click',async()=>{ await navigator.clipboard.writeText(htmlToMd($('proposal'))); });
$('downloadMd').addEventListener('click',()=>download('nahr-company-overview-proposal.md','text/markdown;charset=utf-8',htmlToMd($('proposal'))));
$('downloadHtml').addEventListener('click',()=>download('nahr-company-overview-proposal.html','text/html;charset=utf-8','<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>عرض نهر</title><link rel="stylesheet" href="https://nahr-proposal-generator.vercel.app/styles.css"><body><main><article class="proposal">'+$('proposal').innerHTML+'</article></main></body></html>'));
$('printPdf').addEventListener('click',()=>window.print());
renderRows();
