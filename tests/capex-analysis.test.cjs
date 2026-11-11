const assert=require('node:assert/strict');
const {period,compare}=require('../docs/capex-analysis.js');
const a={endpoints:100000,attach:80,chips:1,share:70,asp:100};
assert.equal(compare(a,a).delta,0);
const lowerShare=compare(a,{...a,endpoints:120000,share:50});
assert.equal(lowerShare.base.units,56000);assert.equal(lowerShare.current.units,48000);assert.equal(lowerShare.delta,-800000);
const lpo=compare(a,{...a,attach:0});assert.equal(lpo.current.units,0);
assert.equal(period({...a,share:0}).value,0);
assert.equal(compare({...a,endpoints:0},a).pct,null);
assert.equal(period({...a,asp:0}).units,56000);
assert.equal(period({...a,asp:0}).value,0);
assert.throws(()=>period({...a,share:101}),RangeError);
assert.throws(()=>period({...a,endpoints:-1}),RangeError);
assert.throws(()=>period({...a,asp:NaN}),RangeError);
assert.throws(()=>period({...a,attach:''}),RangeError);
for(let i=0;i<=100;i++){const r=compare(a,{endpoints:i*2000,attach:i,chips:2,share:100-i,asp:70+i});assert.ok(Math.abs(r.effects.reduce((s,e)=>s+e.value,0)-r.delta)<1e-6);}
console.log('Architecture, allocation, zero baseline, invalid inputs and 101 bridge reconciliations passed');
