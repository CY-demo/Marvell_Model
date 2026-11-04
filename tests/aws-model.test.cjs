const assert=require('node:assert/strict');
const {defaults:d,calculate:c}=require('../docs/aws-model');
let count=0;
function eq(a,b){count++;if(typeof a==='number'&&typeof b==='number')assert.ok(Math.abs(a-b)<=Math.max(1,Math.abs(b))*1e-12, `${a} ≈ ${b}`);else assert.equal(a,b);}
function rejects(v){count++;assert.throws(()=>c({...d,...v}));}
const base=c({...d});
for(const [key,value]of Object.entries({gpu:2000000,servers:250000,links:1000000,hostModules:1000000,switchModules:1000000,modules:2000000,dsp:2000000,allocated:1000000,attach:1,marvellAttach:.5,value:100000000,periodInstall:500000,spareUnits:10000,receipts:500000,uncovered:490000,release:'2027-07-02'}))eq(base[key],value);
for(const key of ['share','optical','dspFraction','realization']){eq(c({...d,[key]:0}).allocated,0);rejects({[key]:101});rejects({[key]:-1});}
eq(c({...d,share:100}).allocated,base.dsp);eq(c({...d,share:25}).dsp,base.dsp);eq(c({...d,linksPerServer:8}).dsp,4000000);eq(c({...d,gpuPerServer:16}).dsp,1000000);eq(c({...d,optical:50,dspFraction:50}).dsp,500000);eq(c({...d,dspPerModule:2}).dsp,4000000);eq(c({...d,gpuPlan:0}).attach,null);eq(c({...d,opening:999999999}).receipts,0);eq(c({...d,committed:999999999}).uncovered,0);eq(c({...d,periodFraction:100}).nextPeriodInstall,0);eq(c({...d,periodFraction:0}).periodInstall,0);eq(c({...d,share:33.3}).allocated,666000);eq(c({...d,leadWeeks:0}).release,d.targetDate);eq(c({...d,gpuPlan:0,opening:0,closing:100,committed:10}).uncovered,90);
for(const v of [{gpuPerServer:0},{gpuPerServer:1.5},{asp:NaN},{asp:Infinity},{asp:-1},{share:NaN},{targetDate:'2027-02-30'},{targetDate:''},{targetDate:'1900-01-01'},{qualification:'true'},{gpuPlan:100000001},{leadWeeks:1.5},{gpuPlan:100000000,gpuPerServer:1,linksPerServer:1024,dspPerModule:16,asp:1000000}])rejects(v);
for(let share=0;share<=100;share+=10){const r=c({...d,share});eq(r.dsp,base.dsp);eq(r.allocated,base.dsp*share/100);eq(r.modules,r.hostModules+r.switchModules);eq(r.uncovered,Math.max(0,r.receipts-d.committed));}
const original=require('../docs/model.js');eq(original.calculate(original.defaults).dsp,80);
console.log(`PASS: ${count} assertions. Baseline, two-end accounting, share isolation, architecture sensitivity, stock/flow bridge, dates, precision guard, invalid inputs, and original-model regression.`);
