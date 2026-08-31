const fs = require('fs');
const required = ['مولد عروض نهر','Google Sheet','استخدم بيانات تجريبية','ولّد نظرة الشركة والعرض','companyOverview','avgSalary','monthlyHours','buildEconomicImpact','Power BI style visuals','التكلفة المالية للهدر','trainingPrice','سعر التدريب المقترح','قاعدة التسعير','buildDeepDiagnostics','القراءة التشخيصية للبيانات','حجم الفرصة بأدنى تقدير'];
const forbidden = ['lovable','v0.dev','bolt.new','✨','🚀','⚡'];
const html = fs.readFileSync('public/index.html','utf8');
const js = fs.readFileSync('public/script.js','utf8');
let fail = false;
for (const s of required) if (!html.includes(s) && !js.includes(s)) { console.error('missing', s); fail = true; }
for (const s of forbidden) if ((html+js).toLowerCase().includes(s.toLowerCase())) { console.error('forbidden', s); fail = true; }
if (fail) process.exit(1);
console.log('checks passed');
