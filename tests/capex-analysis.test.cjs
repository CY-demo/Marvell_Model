const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const M=require('../docs/capex-demand-model.js');
const p={...M.common},base=M.estimate(p);
let n=0;
const eq=(a,b)=>{assert.ok(Math.abs(a-b)<=1e-8*Math.max(1,Math.abs(b)),a+' vs '+b);n++};
const ok=(a)=>{assert.ok(a);n++};
eq(base.headline,20);eq(base.effective,10);
eq(base.dc,8.5e9);eq(base.it,5.95e9);eq(base.acc,3.57e9);
eq(base.gpu,38675);eq(base.asic,49980);eq(base.gpuServers,4834.375);
eq(base.acc+base.cpu+base.net+base.storage,base.it);
eq(base.gpuBudget+base.asicBudget,base.acc);
eq(base.costAllocation+base.effective*1e9,20e9);
eq(M.estimate({...p,volume:100}).gpu,base.gpu*2);
eq(M.estimate({...p,gpuCost:p.gpuCost*2}).gpu,base.gpu/2);
eq(M.estimate({...p,gpuCost:p.gpuCost*2}).asic,base.asic);
eq(M.estimate({...p,opticalShare:35}).products[1].units,base.products[1].units/2);
eq(M.estimate({...p,opticalShare:35}).gpu,base.gpu);
eq(M.estimate({...p,customShare:0}).products[5].units,0);
eq(M.estimate({...p,customShare:0}).asic,base.asic);
eq(M.estimate({...p,volume:0},'annual').gpu,M.estimate({...p,volume:100},'annual').gpu);
eq(M.estimate({...p,next:p.old}).gpu,0);
eq(M.estimate({...p,next:p.old}).value,0);
eq(M.estimate({...p,next:180}).gpu,-base.gpu);
const gpuOnly=M.estimate({...p,old:0,next:.001,volume:100,dc:100,it:100,accelerated:100,network:0,storage:0,gpuMix:100,gpuCost:10000,gpuGbps:800,edgeGbps:800,uplink:100,edgeOptical:100,up1600:0,dspAttach:100,ethernet:100,switchUtil:100});
eq(gpuOnly.gpu,100);eq(gpuOnly.asic,0);eq(gpuOnly.edgeLinks,100);
eq(gpuOnly.module800,400);eq(gpuOnly.switchChips,240000/51200);
const attachZero=M.estimate({...p,dspAttach:0});
eq(attachZero.products.slice(0,3).reduce((a,x)=>a+x.units,0),0);
eq(attachZero.aecDsps,base.aecDsps);
eq(M.estimate({...p,edgeOptical:100}).aecCables,0);
eq(M.estimate({...p,aecAttach:0}).aecDsps,0);
eq(M.estimate({...p,ethernet:0}).switchChips,0);
const networkPrice=M.estimate({...p,module800Cost:p.module800Cost*2});
eq(networkPrice.gpu,base.gpu);eq(networkPrice.modules,base.modules);ok(networkPrice.networkBom>base.networkBom);
for(const edgeGbps of [400,800,1600]){
 const r=M.estimate({...p,edgeGbps});
 eq(r.module400*400+r.module800*800+r.module1600*1600,2*(r.bw*p.edgeOptical/100+r.upBw));
 eq(r.aecDsps,2*r.aecCables);
}
for(const c of Object.values(M.companies)){
 M.validate(c.p);
 for(const mode of ['increment','annual']){
  const r=M.estimate(c.p,mode),[lo,mid,hi]=M.scenarios(c.p,mode);
  eq(r.acc+r.cpu+r.net+r.storage,r.it);eq(r.value,r.products.reduce((s,x)=>s+x.value,0));
  ok(lo.gpu<mid.gpu&&mid.gpu<hi.gpu);
  for(const v of Object.values(r).filter(x=>typeof x==='number'))ok(Number.isFinite(v));
 }
}
for(const bad of [{gpuCost:0},{asicCost:0},{switchUtil:0},{it:101},{opticalShare:-1},{gpuCost:NaN},{old:Infinity},{next:''},{accelerated:90,network:20},{edgeGbps:300}]){
 assert.throws(()=>M.estimate({...p,...bad}));n++;
}
assert.throws(()=>M.estimate(p,'bad'));n++;
const html=fs.readFileSync(path.join(__dirname,'../docs/capex.html'),'utf8');
ok(html.includes('capex-demand-model.js'));ok(html.includes('capex-demand.js'));ok(html.includes('capex-demand.css'));
const prose=html+fs.readFileSync(path.join(__dirname,'../docs/capex-demand.js'),'utf8')+fs.readFileSync(path.join(__dirname,'../docs/capex-demand-model.js'),'utf8');
ok(!/不等於|不是|不能|先判斷：哪些證據|中間不能跳步|not a forecast/i.test(prose));
console.log(n+' CapEx demand checks passed: budget closure, hardware costs, topology, supplier shares, company cases, validation and requested copy.');

