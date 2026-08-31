const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'public', 'templates');
fs.mkdirSync(outDir, { recursive: true });

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Nahr';
pptx.company = 'Nahr';
pptx.subject = 'Technical and Financial Proposal Template';
pptx.title = 'Nahr Proposal Template';
pptx.lang = 'ar-SA';
pptx.theme = {
  headFontFace: 'Arial',
  bodyFontFace: 'Arial',
  lang: 'ar-SA'
};
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';
pptx.margin = 0;
pptx.rtlMode = true;

const C = {
  bg: 'FBF7EF',
  paper: 'FFFDF8',
  sand: 'D8C3A3',
  sand2: 'F0E4D1',
  brown: '9C7A4C',
  ink: '1D1A15',
  muted: '6D6254',
  line: 'E4D7C3',
  green: '2F5F58',
  white: 'FFFFFF'
};
const logo = path.join(root, 'public', 'logo-nahr-ai-header.png');

function addBg(slide, dark = false) {
  slide.background = { color: dark ? C.ink : C.bg };
  if (!dark) {
    slide.addShape(pptx.ShapeType.rect, { x: 0.2, y: 0.2, w: 12.93, h: 7.1, fill: { color: C.paper }, line: { color: C.line, transparency: 20 }, radius: 0.18 });
    slide.addShape(pptx.ShapeType.arc, { x: -1.3, y: 5.7, w: 4.2, h: 1.7, line: { color: C.sand, transparency: 25, width: 8 }, adjustPoint: 0.3 });
  } else {
    slide.addShape(pptx.ShapeType.rect, { x: 0.35, y: 0.35, w: 12.63, h: 6.8, fill: { color: C.ink }, line: { color: C.brown, transparency: 30 }, radius: 0.18 });
    slide.addShape(pptx.ShapeType.arc, { x: 0.6, y: 5.8, w: 5.4, h: 1.2, line: { color: C.sand, transparency: 10, width: 6 }, adjustPoint: 0.3 });
  }
}
function text(slide, value, x, y, w, h, opts = {}) {
  slide.addText(value, {
    x, y, w, h,
    fontFace: 'Arial',
    margin: 0.03,
    breakLine: false,
    fit: 'shrink',
    rtl: true,
    align: opts.align || 'right',
    valign: opts.valign || 'mid',
    color: opts.color || C.ink,
    fontSize: opts.fontSize || 18,
    bold: !!opts.bold,
    italic: !!opts.italic,
    lineSpacingMultiple: opts.lineSpacingMultiple || 0.9,
    bullet: opts.bullet,
    paraSpaceAfterPt: opts.paraSpaceAfterPt || 0,
  });
}
function header(slide, label, dark = false) {
  slide.addImage({ path: logo, x: 10.25, y: 0.36, w: 1.55, h: 0.58 });
  text(slide, label, 1.0, 0.52, 5.5, 0.28, { color: dark ? C.sand : C.brown, fontSize: 9, bold: true, align: 'left' });
  slide.addShape(pptx.ShapeType.line, { x: 1.0, y: 0.94, w: 11.25, h: 0, line: { color: dark ? C.brown : C.line, width: 1, transparency: 10 } });
}
function title(slide, h, sub, dark=false) {
  text(slide, h, 6.05, 1.25, 5.9, 1.4, { fontSize: 34, bold: true, color: dark ? C.white : C.ink });
  if (sub) text(slide, sub, 6.2, 2.78, 5.7, 0.82, { fontSize: 15, color: dark ? C.sand2 : C.muted });
}
function footer(slide, n, dark=false) {
  text(slide, String(n).padStart(2,'0'), 1.05, 6.55, 0.45, 0.25, { fontSize: 9, bold: true, color: dark ? C.sand : C.brown, align: 'left' });
  text(slide, 'نهر — عرض فني ومالي', 1.55, 6.55, 2.2, 0.25, { fontSize: 8.5, color: dark ? 'BBAE99' : C.muted, align: 'left' });
}
function card(slide, x, y, w, h, head, body, num) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: C.paper }, line: { color: C.line }, shadow: { type: 'outer', color: '9A7D55', opacity: 0.11, blur: 1, angle: 45, distance: 1 } });
  if (num) text(slide, num, x+w-0.55, y+0.22, 0.34, 0.25, { fontSize: 9, bold: true, color: C.brown });
  text(slide, head, x+0.32, y+0.42, w-0.62, 0.38, { fontSize: 18, bold: true });
  text(slide, body, x+0.32, y+0.98, w-0.62, h-1.15, { fontSize: 12.5, color: C.muted, valign:'top' });
}

let n = 1;
// 1 Cover
{
  const s = pptx.addSlide(); addBg(s, true);
  s.addImage({ path: logo, x: 9.05, y: 0.72, w: 2.0, h: 0.75 });
  text(s, 'عرض فني ومالي', 7.0, 1.75, 4.3, 0.36, { color: C.sand, fontSize: 16, bold: true });
  text(s, '(اسم البرنامج)', 4.75, 2.18, 6.55, 0.92, { color: C.white, fontSize: 36, bold: true });
  text(s, 'مقدم إلى: (اسم الجهة)', 6.2, 3.35, 5.08, 0.35, { color: C.sand2, fontSize: 16 });
  text(s, 'التاريخ: (تاريخ العرض)    |    رقم العرض: (رقم العرض)', 5.1, 3.85, 6.2, 0.25, { color: 'BBAE99', fontSize: 10 });
  s.addShape(pptx.ShapeType.roundRect, { x: 1.05, y: 5.05, w: 3.9, h: 1.2, fill: { color: '2A261F' }, line: { color: C.brown, transparency: 35 }, radius: 0.12 });
  text(s, 'بعد الفهم يُرسل العرض الفني والمالي', 1.35, 5.28, 3.3, 0.45, { color: C.white, fontSize: 16, bold: true, align: 'center' });
  footer(s, n++, true);
}
// 2 Executive summary
{
  const s=pptx.addSlide(); addBg(s); header(s,'الملخص التنفيذي'); title(s,'لماذا هذا العرض؟','ملخص مخصص بناءً على إجابات نموذج جاهزية الذكاء الاصطناعي والأتمتة.');
  card(s,1.0,2.0,4.2,3.25,'فهمنا الأولي','تستهدف (اسم الجهة) تطوير قدرات (الفئة المستهدفة) في (القطاع) مع تركيز على: (أكبر التحديات / الأولوية الأولى).','01');
  card(s,5.55,2.0,3.0,3.25,'الهدف','تحويل التدريب إلى تطبيق عملي داخل مهام الموظفين، وليس مجرد شرح عام للأدوات.','02');
  card(s,8.9,2.0,3.35,3.25,'المخرجات','تمارين مبنية على إجابات المشاركين، قوالب تشغيل، ومؤشرات قياس أثر بعد ٩٠ يومًا.','03'); footer(s,n++);
}
// 3 Current situation
{
 const s=pptx.addSlide(); addBg(s); header(s,'فهم الاحتياج'); title(s,'الوضع الحالي كما يظهر من النموذج','هذه الشريحة تُعبّأ من إجابات Google Form / Sheet.');
 card(s,1.0,2.0,5.2,1.25,'المهام المتكررة','(المهمة المتكررة الأولى) — (ساعاتها أسبوعيًا)\n(المهمة المتكررة الثانية) — (ساعاتها أسبوعيًا)','');
 card(s,6.55,2.0,5.45,1.25,'المخرجات اليومية','أكثر ما ينتجه المشاركون: (ما أكثر ما تنتجه في عملك اليومي؟)','');
 card(s,1.0,3.65,5.2,1.45,'مستوى استخدام الذكاء الاصطناعي','الاستخدام الحالي: (استخدامك لأدوات الذكاء الاصطناعي)\nالأدوات المجربة: (الأدوات التي جربتها)','');
 card(s,6.55,3.65,5.45,1.45,'العوائق','(ما الذي يعيقك اليوم؟ / اختر كل ما ينطبق عليك)',''); footer(s,n++);
}
// 4 Participants baseline
{
 const s=pptx.addSlide(); addBg(s); header(s,'خط الأساس'); title(s,'نقيس قبل التدريب وبعده','حتى يكون البرنامج قابلًا للتقييم وليس انطباعًا عامًا.');
 s.addShape(pptx.ShapeType.roundRect,{x:1.05,y:2.0,w:5.2,h:2.7,fill:{color:C.ink},line:{color:C.ink},radius:0.12});
 text(s,'(مجموع الساعات الأسبوعية)',1.55,2.35,4.2,0.7,{fontSize:34,bold:true,color:C.sand,align:'center'});
 text(s,'ساعات أسبوعية في مهام متكررة يمكن أتمتتها',1.55,3.2,4.2,0.45,{fontSize:15,color:C.white,align:'center'});
 s.addShape(pptx.ShapeType.roundRect,{x:6.65,y:2.0,w:5.2,h:2.7,fill:{color:C.sand2},line:{color:C.line},radius:0.12});
 text(s,'(استعدادك لتطبيق ما تتعلمه)',7.05,2.35,4.4,0.7,{fontSize:30,bold:true,color:C.ink,align:'center'});
 text(s,'درجة الاستعداد من ١ إلى ٥',7.05,3.2,4.4,0.45,{fontSize:15,color:C.muted,align:'center'}); footer(s,n++);
}
// 5 Proposed journey
{
 const s=pptx.addSlide(); addBg(s); header(s,'رحلة البرنامج'); title(s,'من الإجابة إلى التمرين','كل تمرين في البرنامج يُشتق من مهام المشاركين الحقيقية.');
 const steps=['تحليل الردود','تصميم التمارين','تدريب عملي','قوالب وأتمتة','قياس بعد ٩٠ يوم'];
 steps.forEach((st,i)=>{ const x=1+i*2.35; s.addShape(pptx.ShapeType.roundRect,{x,y:3.0,w:1.95,h:1.25,fill:{color:i%2?C.sand2:C.paper},line:{color:C.line},radius:0.1}); text(s,String(i+1).padStart(2,'0'),x+1.35,3.18,0.32,0.22,{fontSize:9,bold:true,color:C.brown}); text(s,st,x+0.22,3.55,1.48,0.35,{fontSize:15,bold:true,align:'center'}); if(i<4) s.addShape(pptx.ShapeType.chevron,{x:x+1.98,y:3.33,w:0.28,h:0.28,fill:{color:C.sand},line:{color:C.sand}}); });
 text(s,'المدخلات: (إجابات النموذج)  ←  المخرجات: (برنامج مخصص + عرض فني ومالي)',2.0,5.15,9.3,0.35,{fontSize:16,color:C.muted,align:'center'}); footer(s,n++);
}
// 6 Training track
{
 const s=pptx.addSlide(); addBg(s); header(s,'نطاق العمل'); title(s,'المسار الأول: التدريب والتطبيق','محتوى عملي حسب القسم والمسمى الوظيفي وطبيعة المخرجات اليومية.');
 card(s,1.0,2.0,3.45,2.3,'صياغة الطلبات','تدريب المشاركين على طلب واضح يعطي نتيجة دقيقة من أول مرة.\nالمستوى الحالي: (تقييم صياغة طلب واضح)','01');
 card(s,4.75,2.0,3.45,2.3,'تقييم المخرجات','كيف يحكم الموظف على جودة ناتج الذكاء الاصطناعي ومتى لا يصلح للاستخدام.\nالمستوى الحالي: (تقييم الحكم على جودة المخرَج)','02');
 card(s,8.5,2.0,3.45,2.3,'تطبيق على العمل','استخدام الأدوات على ملفات وبيانات العمل الحقيقية ضمن ضوابط واضحة.\nالمستوى الحالي: (تقييم استخدام الأداة على بيانات عملي)','03'); footer(s,n++);
}
// 7 Automation track
{
 const s=pptx.addSlide(); addBg(s); header(s,'نطاق العمل'); title(s,'المسار الثاني: القوالب والأتمتة','تحويل المهمة المتكررة إلى نموذج تشغيل قابل للاستخدام بعد التدريب.');
 card(s,1.0,2.0,5.2,2.7,'مهمة مرشحة للتطبيق','لو اختفت مهمة واحدة من اليوم تلقائيًا ستكون: (لو اختفت مهمة واحدة من يومك تلقائيًا، أي مهمة تختار؟)','01');
 card(s,6.55,2.0,5.45,2.7,'مخرجات محتملة','(قالب تقرير)\n(مكتبة أوامر)\n(خطوة أتمتة)\n(لوحة متابعة / SOP)','02'); footer(s,n++);
}
// 8 Deliverables
{
 const s=pptx.addSlide(); addBg(s); header(s,'المخرجات'); title(s,'ما الذي تستلمه الجهة؟','مخرجات واضحة قبل بداية التنفيذ.');
 const items=[['تقرير فهم الاحتياج','ملخص نتائج النموذج حسب الأقسام والفئات.'],['تصميم البرنامج','محاور تدريب مبنية على الأولوية الأولى: (أولويتك الأولى من التدريب).'],['مواد وتمارين','تمارين مشتقة من المهام المتكررة والمخرجات اليومية.'],['قوالب تشغيل','نماذج تساعد الفريق على الاستمرار بعد التدريب.'],['تقرير أثر','مقارنة خط الأساس مع القياس بعد ٩٠ يومًا.'],['توصيات تالية','خطوات تحسين أو أتمتة لاحقة حسب النتائج.']];
 items.forEach((it,i)=>card(s,1+(i%3)*3.75,2.0+Math.floor(i/3)*1.85,3.45,1.45,it[0],it[1],String(i+1).padStart(2,'0'))); footer(s,n++);
}
// 9 Timeline
{
 const s=pptx.addSlide(); addBg(s); header(s,'الجدول الزمني'); title(s,'خطة تنفيذ مبدئية','تتغير المدة حسب عدد المشاركين ونطاق القوالب والأتمتة.');
 const rows=[['الأسبوع ١','اجتماع فهم وتحليل الردود'],['الأسبوع ٢','تصميم البرنامج والتمارين'],['الأسبوع ٣-٤','تنفيذ التدريب العملي'],['الأسبوع ٥','تسليم القوالب والأدوات'],['بعد ٩٠ يوم','قياس الأثر والتوصيات']];
 rows.forEach((r,i)=>{ const y=1.95+i*0.75; text(s,r[0],9.7,y,1.55,0.3,{fontSize:14,bold:true,color:C.brown}); s.addShape(pptx.ShapeType.line,{x:2.0,y:y+0.17,w:7.25,h:0,line:{color:C.line,width:1}}); text(s,r[1],2.2,y,6.7,0.3,{fontSize:14,color:C.ink}); });
 footer(s,n++);
}
// 10 Financial offer
{
 const s=pptx.addSlide(); addBg(s); header(s,'العرض المالي'); title(s,'الاستثمار المقترح','يبقى هذا القسم قابلًا للتعديل حتى اعتماد التسعير النهائي.');
 card(s,1.0,2.0,3.45,2.2,'رسوم التشخيص','(رسوم التشخيص)','01');
 card(s,4.75,2.0,3.45,2.2,'رسوم التدريب','(رسوم التدريب / سعر المشارك / عدد المشاركين)','02');
 card(s,8.5,2.0,3.45,2.2,'القوالب والأتمتة','(رسوم تطوير القوالب أو الأتمتة)','03');
 text(s,'الإجمالي قبل الضريبة: (الإجمالي قبل الضريبة)     |     ضريبة القيمة المضافة: (VAT)     |     الإجمالي شامل الضريبة: (الإجمالي)',1.2,5.05,10.9,0.38,{fontSize:16,bold:true,color:C.ink,align:'center'}); footer(s,n++);
}
// 11 Assumptions
{
 const s=pptx.addSlide(); addBg(s); header(s,'الافتراضات'); title(s,'ما الذي بُني عليه العرض؟','هذه النقاط تحمي النطاق وتوضح طريقة التعامل مع التغييرات.');
 const assumptions=['العرض مبني على إجابات النموذج واجتماع الفهم الأولي.','أي تغيير جوهري في عدد المشاركين أو نطاق الأتمتة يتطلب تحديث العرض.','لا يشمل العرض تراخيص أدوات خارجية إلا إذا ذُكر ذلك صراحة.','لا يتم إرسال أي مادة للعميل قبل مراجعة النسخة النهائية واعتمادها.','النتائج تعتمد على التزام الجهة بتطبيق المخرجات بعد التدريب.'];
 assumptions.forEach((a,i)=>text(s,`(${i+1}) ${a}`,1.45,2.0+i*0.62,10.4,0.35,{fontSize:15,color:C.ink})); footer(s,n++);
}
// 12 Closing
{
 const s=pptx.addSlide(); addBg(s,true); s.addImage({path:logo,x:9.2,y:0.8,w:2.0,h:0.75});
 text(s,'الخطوة التالية',6.2,2.05,5.0,0.55,{fontSize:18,bold:true,color:C.sand});
 text(s,'اجتماع مواءمة لاعتماد النطاق ثم إرسال النسخة النهائية.',2.2,2.65,9.0,0.95,{fontSize:32,bold:true,color:C.white,align:'center'});
 text(s,'للتواصل: (رقم الجوال)  |  (البريد الإلكتروني)  |  (الموقع)',2.2,4.25,9.0,0.35,{fontSize:14,color:C.sand2,align:'center'});
 footer(s,n++,true);
}

pptx.writeFile({ fileName: path.join(outDir, 'nahr-proposal-template.pptx') });
console.log(path.join(outDir, 'nahr-proposal-template.pptx'));
