'use strict';
const assert = require('node:assert/strict');
const {calculate,defaults,bounds}=require('../docs/capex-model.js');
let checks=0;
function near(a,b){assert.ok(Math.abs(a-b)<Math.max(1,Math.abs(b))*1e-10,`${a} != ${b}`);checks++;}
const d=calculate(defaults);
near(d.totalCapex,120e9);near(d.delta,20e9);near(d.ai,12e9);near(d.equipment,8.4e9);near(d.optics,420e6);near(d.dsp,42e6);near(d.supplier,21e6);near(d.capture,.00105);near(d.units,262500);near(d.periodUnits,131250);near(d.purchases,121250);near(d.purchaseValue,9700000);
for(const key of ['growth','ai','equipment','optics','dsp','share']){const r=calculate({...defaults,[key]:0});near(r.supplier,0);near(r.purchases,0);}
near(calculate({...defaults,realization:0}).purchases,0);
near(calculate({...defaults,inventory:200000}).purchases,0);
near(calculate({...defaults,inventory:200000}).unusedInventory,68750);
near(calculate({...defaults,inventory:0}).purchases,131250);
near(calculate({...defaults,growth:10}).supplier,10.5e6);
near(calculate({...defaults,growth:30,share:70}).supplier,44.1e6);
near(calculate({...defaults,share:60}).supplier-d.supplier,4.2e6);
near(calculate({...defaults,asp:160}).supplier,d.supplier);
near(calculate({...defaults,asp:160}).units,d.units/2);
for(const [key,[min,max]] of Object.entries(bounds)){for(const value of [NaN,Infinity,'20',min-1,max+1]){assert.throws(()=>calculate({...defaults,[key]:value}),RangeError);checks++;}}
for(let n=0;n<100;n++){const p={...defaults,growth:n,share:n,realization:n};const r=calculate(p);assert.ok(r.supplier<=r.dsp && r.dsp<=r.optics && r.optics<=r.equipment && r.equipment<=r.ai && r.ai<=r.delta);assert.ok(r.purchases>=0 && r.periodUnits<=r.units);checks+=2;}
assert.deepEqual(defaults,{base:100,growth:20,ai:60,equipment:70,optics:5,dsp:10,share:50,asp:80,realization:50,inventory:10000});checks++;
console.log(`Capex model: ${checks} assertions passed`);
