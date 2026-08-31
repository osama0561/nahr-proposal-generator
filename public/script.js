const sampleHeaders = [
  'Timestamp','Email','الاسم','القسم','المسمى الوظيفي','سنوات خبرتك في هذا المجال','المهمة المتكررة الأولى','ساعاتها أسبوعيًا','المهمة المتكررة الثانية','ساعاتها أسبوعيًا 2','المهمة المتكررة الثالثة','ساعاتها أسبوعيًا 3','ما أكثر ما تنتجه في عملك اليومي؟','استخدامك لأدوات الذكاء الاصطناعي حتى اليوم','الأدوات التي جربتها','أبعد ما وصلت إليه في استخدامها','صياغة طلب واضح يعطيني نتيجة دقيقة من أول مرة','الحكم على جودة المخرَج ومتى لا يصلح للاستخدام','استخدام الأداة على ملفات وبيانات عملي الحقيقية','بناء خطوة أتمتة تعمل دون تدخلي في كل مرة','اختر كل ما ينطبق عليك','أولويتك الأولى من التدريب','لو اختفت مهمة واحدة من يومك تلقائيًا، أي مهمة تختار؟','مجموع الساعات الأسبوعية التي تقضيها في مهام متكررة يمكن أتمتتها','استعدادك لتطبيق ما تتعلمه فعليًا في عملك بعد التدريب'
];
const sampleRows = [[
  '2026-08-31','reem@example.com','ريم أحمد','الموارد البشرية','أخصائية تطوير موظفين','٦ سنوات','تجميع تقارير الحضور والتدريب','5','تلخيص ملاحظات الاجتماعات','3','تحديث ملفات المتدربين','2','تقارير، عروض، رسائل بريدية','أستخدمها أحيانًا','ChatGPT, Gemini','أكتب مسودات وأراجعها يدويًا','3','3','2','1','عدم وضوح حالات الاستخدام، الخوف من الأخطاء، عدم وجود بيانات مرتبة','بناء قوالب وأتمتة للتقارير','تجهيز تقرير التدريب الأسبوعي وإرساله تلقائيًا','10','4'
]];
let state = { headers: sampleHeaders, rows: sampleRows };
const $ = (id) => document.getElementById(id);
function normalize(s){ return String(s||'').replace(/[\u064B-\u065F]/g,'').trim(); }
function pick(row, names){
  for (const name of names) {
    const idx = state.headers.findIndex(h => normalize(h).includes(normalize(name)) || normalize(name).includes(normalize(h)));
    if (idx >= 0 && row[idx]) return row[idx];
  }
  return '';
}
function setStatus(msg){ $('loadStatus').textContent = msg; }
function renderRows(){
  const sel=$('rowSelect'); sel.innerHTML='';
  state.rows.forEach((row,i)=>{
    const name = pick(row,['الاسم']) || `رد ${i+1}`;
    const dept = pick(row,['القسم']);
    const option=document.createElement('option');
    option.value=String(i); option.textContent=`${i+1}. ${name}${dept?' — '+dept:''}`;
    sel.appendChild(option);
  });
  renderPreview();
}
function renderPreview(){
  const row = state.rows[Number($('rowSelect').value || 0)] || [];
  const box=$('answerPreview'); box.innerHTML='';
  state.headers.forEach((h,i)=>{
    if(!row[i]) return;
    const d=document.createElement('div'); d.className='answer-item';
    d.innerHTML=`<b>${escapeHtml(h)}</b><span>${escapeHtml(row[i])}</span>`;
    box.appendChild(d);
  });
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
  renderRows(); setStatus(`تمت قراءة ${data.rows.length} رد و ${data.headers.length} سؤال/عمود.`);
}
function repeatedTasks(row){
  const pairs = [
    [pick(row,['المهمة المتكررة الأولى']), pick(row,['ساعاتها أسبوعيًا'])],
    [pick(row,['المهمة المتكررة الثانية']), pick(row,['ساعاتها أسبوعيًا 2'])],
    [pick(row,['المهمة المتكررة الثالثة']), pick(row,['ساعاتها أسبوعيًا 3'])]
  ].filter(([task])=>task);
  return pairs;
}
function generateProposal(){
  const row = state.rows[Number($('rowSelect').value || 0)] || [];
  const company = $('companyName').value.trim() || 'اسم الجهة التجريبية';
  const sector = $('companySector').value;
  const name = pick(row,['الاسم']);
  const dept = pick(row,['القسم']);
  const title = pick(row,['المسمى الوظيفي']);
  const years = pick(row,['سنوات خبرتك']);
  const output = pick(row,['ما أكثر ما تنتجه']);
  const aiUse = pick(row,['استخدامك لأدوات الذكاء الاصطناعي']);
  const tools = pick(row,['الأدوات التي جربتها']);
  const reached = pick(row,['أبعد ما وصلت إليه']);
  const obstacles = pick(row,['اختر كل ما ينطبق عليك']);
  const priority = pick(row,['أولويتك الأولى من التدريب']);
  const automate = pick(row,['لو اختفت مهمة واحدة']);
  const baseline = pick(row,['مجموع الساعات الأسبوعية']);
  const readiness = pick(row,['استعدادك لتطبيق']);
  const tasks = repeatedTasks(row);
  const html = `<div class="cover"><img src="/logo-nahr.svg" alt="نهر"><h1>عرض فني ومالي مبدئي</h1><p>${escapeHtml($('programName').value)}</p><div class="meta"><div><b>الجهة</b><br>${escapeHtml(company)}</div><div><b>القطاع</b><br>${escapeHtml(sector)}</div><div><b>المدة المقترحة</b><br>${escapeHtml($('timeline').value)}</div><div><b>صلاحية العرض</b><br>${escapeHtml($('validity').value)}</div></div></div>
<h2>١. الملخص التنفيذي</h2><p>بناءً على إجابات نموذج جاهزية الذكاء الاصطناعي والأتمتة، نقترح برنامجًا عمليًا يساعد ${escapeHtml(company)} على تحويل استخدام الذكاء الاصطناعي من معرفة عامة إلى تطبيقات يومية مرتبطة بمهام الموظفين والتقارير والمتابعة.</p>
<h2>٢. فهم الاحتياج الحالي</h2><table class="generated-table"><tr><th>البند</th><th>الإجابة</th></tr><tr><td>صاحب الرد</td><td>${escapeHtml(name)} — ${escapeHtml(title)} — ${escapeHtml(dept)}</td></tr><tr><td>سنوات الخبرة</td><td>${escapeHtml(years)}</td></tr><tr><td>أكثر المخرجات اليومية</td><td>${escapeHtml(output)}</td></tr><tr><td>الاستخدام الحالي للذكاء الاصطناعي</td><td>${escapeHtml(aiUse)}</td></tr><tr><td>الأدوات المجربة</td><td>${escapeHtml(tools)}</td></tr><tr><td>أبعد مستوى وصل له</td><td>${escapeHtml(reached)}</td></tr></table>
<h2>٣. المهام المتكررة المرشحة للأتمتة</h2><ul>${tasks.map(([t,h])=>`<li>${escapeHtml(t)}${h?' — تقريبًا '+escapeHtml(h)+' ساعات أسبوعيًا':''}</li>`).join('') || '<li>يتم تحديدها في اجتماع الفهم.</li>'}</ul>
<h2>٤. العوائق الحالية</h2><p>${escapeHtml(obstacles || 'تحدد تفصيليًا في اجتماع الفهم.')}</p>
<h2>٥. مخرجات البرنامج المقترحة</h2><ul><li>تدريب عملي على صياغة الطلبات واستخدام الأدوات في مهام حقيقية.</li><li>تحويل مهمة “${escapeHtml(automate || 'مهمة متكررة مختارة')}” إلى تمرين تطبيقي داخل البرنامج.</li><li>قوالب عمل تساعد الفريق على إنتاج ${escapeHtml(output || 'التقارير والمخرجات اليومية')} بجودة أعلى.</li><li>قياس قبل/بعد بناءً على خط الأساس: ${escapeHtml(baseline || 'غير محدد')} ساعات أسبوعية قابلة للتحسين.</li></ul>
<h2>٦. نطاق العمل المقترح</h2><h3>مسار التدريب والتطبيق</h3><p>ورش عملية مبنية على مهام المشاركين، وليست محاضرة عامة عن الذكاء الاصطناعي.</p><h3>مسار القوالب والأتمتة</h3><p>تصميم نماذج تشغيل وقوالب تساعد المشاركين على تطبيق ما تعلموه بعد انتهاء التدريب.</p>
<h2>٧. خطة التنفيذ</h2><ol><li>اجتماع فهم مع الفريق المعني.</li><li>تحليل إجابات النموذج وتحديد أكثر المهام تكرارًا.</li><li>تصميم تمارين مبنية على مهام واقعية.</li><li>تنفيذ التدريب والتطبيق العملي.</li><li>متابعة الأثر بعد ٩٠ يومًا باستخدام نفس أسئلة خط الأساس.</li></ol>
<h2>٨. العرض المالي</h2><p>${escapeHtml($('pricing').value)}</p><h2>٩. الخطوة التالية</h2><p>اعتماد نطاق العمل وعدد المشاركين، ثم إرسال النسخة النهائية من العرض الفني والمالي.</p>`;
  $('proposal').innerHTML=html;
}
function htmlToMd(node){
  return node.innerText.replace(/\n{3,}/g,'\n\n');
}
function download(name, type, text){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([text],{type}));
  a.download=name; a.click(); URL.revokeObjectURL(a.href);
}
$('loadSample').addEventListener('click',()=>{ state={headers:sampleHeaders, rows:sampleRows}; renderRows(); setStatus('تم تحميل بيانات تجريبية. غيّر اسم الجهة ثم ولّد العرض.'); });
$('loadSheet').addEventListener('click',loadSheet);
$('rowSelect').addEventListener('change',renderPreview);
$('generate').addEventListener('click',generateProposal);
$('copyProposal').addEventListener('click',async()=>{ await navigator.clipboard.writeText(htmlToMd($('proposal'))); });
$('downloadMd').addEventListener('click',()=>download('nahr-proposal-draft.md','text/markdown;charset=utf-8',htmlToMd($('proposal'))));
$('downloadHtml').addEventListener('click',()=>download('nahr-proposal-draft.html','text/html;charset=utf-8','<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>عرض نهر</title><link rel="stylesheet" href="https://nahr-proposal-generator.vercel.app/styles.css"><body><main><article class="proposal">'+$('proposal').innerHTML+'</article></main></body></html>'));
$('printPdf').addEventListener('click',()=>window.print());
renderRows();
