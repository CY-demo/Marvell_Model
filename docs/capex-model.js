(function(root){
  'use strict';
  const defaults = Object.freeze({base:100,growth:20,ai:60,equipment:70,optics:5,dsp:10,share:50,asp:80,realization:50,inventory:10000});
  const bounds = Object.freeze({base:[0.01,10000],growth:[0,300],ai:[0,100],equipment:[0,100],optics:[0,100],dsp:[0,100],share:[0,100],asp:[0.01,100000],realization:[0,100],inventory:[0,1000000000]});
  function calculate(input){
    const p={...defaults,...input};
    for(const [key,[min,max]] of Object.entries(bounds)){
      if(typeof p[key] !== 'number' || !Number.isFinite(p[key]) || p[key]<min || p[key]>max) throw new RangeError(key);
    }
    const delta=p.base*1e9*p.growth/100;
    const ai=delta*p.ai/100;
    const equipment=ai*p.equipment/100;
    const optics=equipment*p.optics/100;
    const dsp=optics*p.dsp/100;
    const supplier=dsp*p.share/100;
    const units=supplier/p.asp;
    const periodUnits=units*p.realization/100;
    const purchases=Math.max(0,periodUnits-p.inventory);
    return {params:p,totalCapex:p.base*(1+p.growth/100)*1e9,delta,ai,equipment,optics,dsp,supplier,units,periodUnits,purchases,purchaseValue:purchases*p.asp,unusedInventory:Math.max(0,p.inventory-periodUnits),capture:delta>0?supplier/delta:0};
  }
  const api={defaults,bounds,calculate};
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.CapexModel=api;
})(typeof globalThis!=='undefined'?globalThis:this);
