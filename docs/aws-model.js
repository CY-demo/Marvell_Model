(function (root) {
  'use strict';
  const defaults = Object.freeze({gpuPlan:2000000, realization:100, gpuPerServer:8, linksPerServer:4, optical:100, dspFraction:100, dspPerModule:1, share:70, asp:100, periodFraction:50, spare:2, opening:30000, closing:20000, committed:10000, leadWeeks:26, targetDate:'2027-12-31', qualification:'unverified'});
  const percent = ['realization','optical','dspFraction','share','periodFraction','spare'];
  const whole = {gpuPlan:[0,100000000],gpuPerServer:[1,1024],linksPerServer:[0,1024],dspPerModule:[0,16],opening:[0,1e12],closing:[0,1e12],committed:[0,1e12],leadWeeks:[0,520]};
  function calculate(v) {
    for (const k of [...percent,...Object.keys(whole),'asp']) if (!Number.isFinite(v[k])) throw Error('number');
    for (const k of percent) if(v[k]<0||v[k]>100) throw Error('percent');
    for (const [k,[min,max]] of Object.entries(whole)) if(!Number.isSafeInteger(v[k])||v[k]<min||v[k]>max) throw Error(k==='gpuPerServer'?'gpuPerServer':'integer');
    if(v.asp<0||v.asp>1000000) throw Error('asp');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(v.targetDate)) throw Error('date');
    const target = new Date(v.targetDate+'T00:00:00Z');
    if(!Number.isFinite(target.getTime())||target.toISOString().slice(0,10)!==v.targetDate||target.getUTCFullYear()<2000||target.getUTCFullYear()>2100) throw Error('date');
    if(!['unverified','assumed-ready'].includes(v.qualification)) throw Error('qualification');
    const gpu=v.gpuPlan*v.realization/100, servers=gpu/v.gpuPerServer, links=servers*v.linksPerServer;
    const opticalLinks=links*v.optical/100, hostModules=opticalLinks, switchModules=opticalLinks, modules=hostModules+switchModules;
    const dsp=modules*v.dspFraction/100*v.dspPerModule, allocated=dsp*v.share/100;
    const attach=gpu?dsp/gpu:null, marvellAttach=gpu?allocated/gpu:null, value=allocated*v.asp;
    if([gpu,servers,links,opticalLinks,modules,dsp,allocated,value].some(n=>!Number.isFinite(n)||n>Number.MAX_SAFE_INTEGER)) throw Error('range');
    const periodInstall=allocated*v.periodFraction/100, nextPeriodInstall=allocated-periodInstall, spareUnits=periodInstall*v.spare/100;
    const rawReceipts=periodInstall+spareUnits+v.closing-v.opening, receipts=Math.max(0,rawReceipts), excessOpening=Math.max(0,-rawReceipts);
    const uncovered=Math.max(0,receipts-v.committed), excessCommitted=Math.max(0,v.committed-receipts);
    const release=new Date(target.getTime()-v.leadWeeks*7*86400000).toISOString().slice(0,10);
    return {gpu,servers,links,opticalLinks,hostModules,switchModules,modules,dsp,allocated,attach,marvellAttach,value,periodInstall,nextPeriodInstall,spareUnits,rawReceipts,receipts,excessOpening,uncovered,excessCommitted,release};
  }
  const model={defaults,calculate}; root.AwsShareModel=model;
  if(typeof module!=='undefined')module.exports=model;
})(typeof window!=='undefined'?window:globalThis);
