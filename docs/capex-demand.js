(function(){
'use strict';
const M=window.CapexDemand,$=id=>document.getElementById(id);
let lang=new URLSearchParams(window.location.search).get('lang')==='en'?'en':'tw',company='amazon',mode='increment',active='model',p={...M.companies.amazon.p};
const t=(a,b)=>lang==='en'?b:a;
const f=(n,d=0)=>Number(n).toLocaleString(lang==='en'?'en-US':'zh-TW',{maximumFractionDigits:d});
const money=n=>(n<0?'−$':'$')+f(Math.abs(n),0);
const compact=n=>(n<0?'−$':'$')+f(Math.abs(n)/(Math.abs(n)>=1e9?1e9:1e6),2)+(Math.abs(n)>=1e9?'B':'M');
const tr=(a,b)=>'<tr>'+a.map((v,i)=>'<'+(b?'th':'td')+(i>0?' class="num"':'')+'>'+v+'</'+(b?'th':'td')+'>').join('')+'</tr>';
const table=(head,rows,cls='')=>'<div class="table-wrap '+cls+'"><table><thead>'+tr(head,true)+'</thead><tbody>'+rows.map(r=>tr(r)).join('')+'</tbody></table></div>';
const link=(key,label)=>'<a href="'+M.sources[key].url+'" target="_blank" rel="noopener">'+(label||M.sources[key].title)+'</a>';
const copy={
 intro:['預設數值依公開事實推估；你可以在既有公式中修改數值，調整推估結果。','Default values are estimated from publicly available data. You can adjust the inputs in the existing formulas to update the estimates.'],
 title:['Cap 增長範例','Capex growth example'],subtitle:['從投資預算，算到 GPU、自研加速器與 Marvell 產品需求。','Translate investment budgets into GPUs, custom accelerators and Marvell product demand.'],
 date:['資料檢視 2026-11-10','Sources reviewed Nov 10, 2026'],navModel:['需求情境模型','Demand model'],navMap:['產品與供應鏈','Products & supply chain'],navAws:['AWS 公開計畫','AWS public plans'],navCapex:['CapEx 需求推算','Capex demand'],
 company:['公司','Company'],scope:['分析範圍','Scope'],old:['原 CapEx · USD B','Prior capex · USD B'],next:['新 CapEx · USD B','New capex · USD B'],reset:['恢復預設基準','Reset default assumptions'],
 allocationTitle:['預算配置','Budget allocation'],judgmentTitle:['這組假設的判斷','Reading this scenario'],tabModel:['推算過程','Calculation'],tabEvidence:['假設與來源','Assumptions & sources'],tabSensitivity:['情境比較','Scenarios'],
 calcTitle:['CapEx → 加速器採購量','Capex → accelerator purchases'],hardwareTitle:['設備需求推估','Estimated hardware demand'],networkTitle:['加速器 → 網路產品','Accelerators → network products'],marvellTitle:['Marvell 產品機會','Marvell product opportunity'],
 crossTitle:['部署速率與預算交叉檢查','Deployment and budget cross-checks'],evidenceTitle:['基準假設如何形成','How the base case is constructed'],sensitivityTitle:['設備配置與平台成本一起比較','Equipment allocation and platform costs'],
 inputsTitle:['調整推估假設','Adjust the assumptions'],inputsHint:['所有比例以欄位標示的上一層預算為分母','Each allocation names its denominator'],sourcesTitle:['資料來源','Sources'],footer:['CapEx 需求推算 · 公開資料／推估假設／計算結果','Capex demand model · Public data / Estimated inputs / Calculated outputs']
};
const groups=[
 {name:['預算與產品配置','Budget and product mix'],keys:[
 ['volume','增額分配至設備數量','Increase allocated to hardware volume','%', '增額中的採購量配置；其餘配置成本與組合變動。','Volume-related share of the increase; the remainder funds cost and mix changes.'],
 ['dc','資料中心占 CapEx','Datacenter share of capex','%','資料中心相關設備、建置與電力。','Datacenter equipment, construction and power.'],
 ['it','IT 設備占資料中心','Equipment share of datacenter budget','%','伺服器、外部網路與儲存設備。','Servers, external networking and storage.'],
 ['accelerated','加速運算占 IT 設備','Accelerated systems / equipment','%','GPU 與自研加速器平台。','GPU and custom-accelerator platforms.'],
 ['network','外部網路占 IT 設備','External network / equipment','%','交換器、光模組、線纜及資料中心互連。','Switches, optical modules, cables and DCI.'],
 ['storage','獨立儲存占 IT 設備','External storage / equipment','%','獨立儲存設備；CPU 伺服器取得配置餘額。','External storage; CPU servers receive the remaining allocation.'],
 ['gpuMix','GPU 占加速運算預算','GPU share of accelerated budget','%','自研加速器取得剩餘的加速運算預算。','Custom accelerators receive the remaining accelerated budget.']]},
 {name:['平台成本','Platform costs'],keys:[
 ['gpuCost','每 GPU 分攤整機成本','Platform cost per GPU','USD','基準為 B300 級平台：GPU、主機、記憶體、NIC 與機內互連。','B300-class platform: GPU, host, memory, NICs and internal fabric.'],
 ['asicCost','每自研晶片分攤平台成本','Platform cost per custom chip','USD','含加速器、記憶體、主機與機架配套的工程估值。','Engineering estimate including accelerator, memory, host and rack allocation.'],
 ['cpuCost','CPU 伺服器成本','CPU server cost','USD','一般運算伺服器工程估值。','Engineering estimate per general-purpose server.']]},
 {name:['Scale-out 網路配置','Scale-out network'],keys:[
 ['gpuGbps','每 GPU 外部頻寬','External bandwidth per GPU','Gbps','B300 參考配置採每 GPU 800 Gbps。','B300 reference allocation: 800 Gbps per GPU.'],
 ['asicGbps','每自研晶片外部頻寬','External bandwidth per custom chip','Gbps','Trn2 200；Ironwood DCN 100；Maia／MTIA 採規劃值。','Trn2: 200; Ironwood DCN: 100; planning values for Maia / MTIA.'],
 ['edgeGbps','伺服器端口容量','Server-facing port capacity','Gbps','按埠容量換算等效連線與模組數。','Equivalent links and modules at the selected port capacity.'],
 ['uplink','Leaf 上行／下行頻寬','Leaf uplink / downlink bandwidth','%','100% 為 1:1；50% 為 2:1 超額訂閱。','100% is 1:1; 50% is 2:1 oversubscription.'],
 ['edgeOptical','伺服器連線光學比例','Optical share of server links','%','其餘配置為短距離銅纜；交換器上行配置光學連線。','The remainder uses short copper; switch uplinks use optical links.'],
 ['up1600','上行頻寬分配至 1.6T','Uplink bandwidth at 1.6T','%','其餘上行頻寬使用 800G；兩端各配置一個模組。','Remaining uplink bandwidth uses 800G; one module at each end.'],
 ['dspAttach','光模組採用 DSP 比例','DSP attach rate in optics','%','基準 90% DSP、10% 線性光學等架構。','Base mix: 90% DSP-based, 10% linear and other optics.'],
 ['aecAttach','銅纜採用 AEC 比例','AEC share of copper links','%','AEC 每條配置兩顆端點 DSP。','Two endpoint DSPs per AEC cable.'],
 ['ethernet','頻寬採用 Ethernet 比例','Ethernet share of bandwidth','%','此比例決定 Teralynx 可服務交換容量。','Determines addressable Ethernet switching capacity.'],
 ['switchUtil','交換晶片埠容量使用率','Switch port-capacity utilization','%','以 51.2 Tbps 晶片換算機箱等效量。','Convert bandwidth to 51.2 Tbps chassis equivalents.']]},
 {name:['Marvell 供應份額與單價','Marvell allocation and ASP'],keys:[
 ['opticalShare','Optical DSP 份額','Optical DSP allocation','%','70% 以 J.P. Morgan 分析師市場估計作為份額情境起點。','70% starts from a J.P. Morgan analyst market-share estimate.'],
 ['aecShare','AEC DSP 份額','AEC DSP allocation','%','基準 30% 供應配置假設。','Base supplier-allocation assumption: 30%.'],
 ['switchShare','Ethernet switch 份額','Ethernet switch allocation','%','基準 10% 供應配置假設。','Base supplier-allocation assumption: 10%.'],
 ['customShare','Custom ASIC 設計案配置','Custom ASIC program allocation','%','AWS 基準 50%；其他公司起始值 0%，可依設計案資料調整。','AWS starts at 50%; other companies at 0%, adjustable by program evidence.'],
 ['dsp800Asp','800G DSP 單價','800G DSP ASP','USD','工程估值；400G 以此值的 60% 計算。','Engineering estimate; 400G uses 60% of this value.'],
 ['dsp1600Asp','1.6T DSP 單價','1.6T DSP ASP','USD','工程估值，獨立調整速度升級的晶片價值。','Engineering estimate for higher-speed silicon content.'],
 ['aecAsp','AEC DSP 單價','AEC DSP ASP','USD','每顆端點 DSP 的工程估值。','Engineering estimate per endpoint DSP.'],
 ['switchAsp','Switch ASIC 單價','Switch ASIC ASP','USD','每顆交換晶片的工程估值。','Engineering estimate per switch chip.'],
 ['customAsp','Custom compute 晶片單價','Custom compute silicon ASP','USD','以運算晶片供應價值計算。','Value assigned to the supplied compute silicon.']]},
 {name:['網路成本校準','Network cost calibration'],keys:[
 ['module800Cost','800G 模組採購價','800G module cost','USD','預算檢核工程值；400G 取 60%。','Budget-check engineering estimate; 400G uses 60%.'],
 ['module1600Cost','1.6T 模組採購價','1.6T module cost','USD','預算檢核工程值。','Budget-check engineering estimate.'],
 ['switchCost','Ethernet 交換器整機價','Ethernet switch chassis cost','USD','含交換晶片與機箱的工程值。','Engineering estimate including switch silicon and chassis.'],
 ['aecCost','AEC 線纜採購價','AEC cable cost','USD','含兩端 DSP 的工程值。','Engineering estimate including both DSPs.']]}
];
const fields=groups.flatMap(g=>g.keys);
const coreKeys=['volume','dc','it','accelerated','gpuMix','gpuCost','asicCost'];
const drafts={};
function inputControl(key,id){
 const field=fields.find(x=>x[0]===key),unit=field[3];
 return key==='edgeGbps'?'<select id="'+id+'" data-key="'+key+'">'+[400,800,1600].map(v=>'<option'+(p[key]===v?' selected':'')+' value="'+v+'">'+v+'</option>').join('')+'</select>':'<input id="'+id+'" data-key="'+key+'" type="number" min="'+(['gpuCost','asicCost','cpuCost','switchUtil'].includes(key)?'0.01':'0')+'"'+(unit==='%'?' max="100"':'')+' step="any" value="'+(Number.isFinite(p[key])?p[key]:'')+'">';
}
function resetControl(key){
 const field=fields.find(x=>x[0]===key),base=M.companies[company].p[key];
 return '<button class="field-reset" type="button" data-reset-key="'+key+'" aria-label="'+t(field[1]+'：還原預設基準',field[2]+': restore default baseline')+'">'+t('還原基準 ','Restore ')+f(base,2)+(field[3]==='%'?'%':'')+'</button>';
}
function makeInputs(){
 const opens=[...document.querySelectorAll('#inputs details')].map(e=>e.open);
 $('inputs').innerHTML=groups.map((g,i)=>{
  const keys=g.keys.filter(x=>!$('workbench')||!coreKeys.includes(x[0]));
  return '<details id="group-'+i+'"'+((opens.length?opens[i]:!$('workbench')&&i===0)?' open':'')+'><summary>'+t(...g.name)+'<span>'+t('推估假設 · 可調整','Estimated inputs · editable')+'</span></summary><div class="fields">'+keys.map(([key,zh,en,unit,whyZh,whyEn])=>'<div class="field"><label for="p-'+key+'">'+t(zh,en)+' · '+unit+'</label>'+inputControl(key,'p-'+key)+resetControl(key)+'<small>'+t(whyZh,whyEn)+'</small></div>').join('')+'</div></details>';
 }).join('');
}
function makeWorkbench(){
 if(!$('workbench'))return;
 const c=M.companies[company];
 const reasons={
 volume:[t('把 CapEx 增額分配到採購量；其餘配置成本與支出組合。AWS 基準採 50%，其他公司採 100%。','Allocate the increase to hardware volume; the remainder funds cost and spending mix. AWS starts at 50%, other companies at 100%.'),company==='amazon'?'awsPace':c.source],
 dc:[t(...c.dcWhy),c.source],
 it:[t('設備包含伺服器、網路與儲存。Alphabet 以 65% 設備配置為錨點；Microsoft 以 75% 全公司設備配置 ÷ 95% 資料中心配置換算約 79%；AWS／Meta 採 70% 同業參考值。','Equipment covers servers, networking and storage. Alphabet anchors 65%; Microsoft normalizes 75% company capex by 95% datacenter share to about 79%; AWS / Meta use a 70% peer-informed estimate.'),company==='microsoft'?'msft':'google'],
 accelerated:[t('IT 設備預算中，加速運算基準 60%、網路 15%、儲存 5%，CPU 伺服器取得餘額。','Within equipment: accelerated systems start at 60%, networking at 15%, storage at 5%; CPU servers receive the remainder.'),null],
 gpuMix:[t(...c.mixWhy),c.hardware],
 gpuCost:[t('8-GPU B300 整機參考價 $646,878，折合每 GPU 約 $80,860。規模採購與配置調整係數採 0.74，基準約 $60,000／GPU。','An eight-GPU B300 system reference of $646,878 gives about $80,860 per GPU. A 0.74 procurement/configuration factor anchors the $60,000 base.'),'gpuPrice'],
 asicCost:[t(...c.asicWhy),c.hardware]};
 $('workbench').innerHTML='<div class="work-heading"><div><h2>'+t('公式如何計算','How the formulas work')+'</h2><p>'+t('白色數字欄可直接輸入。每列右側顯示運算與結果；「還原基準」恢復單項設定。','Type directly into the white number fields. Each row shows the calculation and output. Restore resets one assumption.')+'</p></div><a href="#assumptions">'+t('網路、市佔率與其他參數 ↓','Network, market share and other inputs ↓')+'</a></div><div id="capex-entry" class="capex-entry"></div><div id="live-results" class="live-results" aria-live="polite"></div><div id="work-error" class="work-error" role="status" hidden></div><div class="step-grid-labels"><span>'+t('推算順序與假設依據','Step and rationale')+'</span><span>'+t('你的假設','Your input')+'</span><span>'+t('即時運算結果','Live calculation')+'</span></div><div class="step-rows">'+coreKeys.map((key)=>{
 const field=fields.find(x=>x[0]===key),why=reasons[key];
 return '<div class="step-row" id="step-'+key+'"><div class="step-description"><label for="work-'+key+'">'+t(field[1],field[2])+'</label><p>'+t(field[4],field[5])+'</p><details class="step-source"><summary>'+t('基準值怎麼來','Why this base value')+'</summary><p>'+why[0]+(why[1]?' '+link(why[1],t('查看來源','Source')):'')+'</p></details></div><div class="step-input"><span class="unit">'+field[3]+'</span>'+inputControl(key,'work-'+key)+resetControl(key)+'</div><div class="step-result"><span id="formula-'+key+'"></span><strong id="output-'+key+'"></strong></div></div>';
 }).join('')+'</div><div class="equation-box"><h3>'+t('如何計算GPU需求','How GPU demand is calculated')+'</h3><div id="gpu-equation"></div></div><div class="comparison-heading"><h3>'+t('預設基準 vs 調整數值後','Default baseline vs. adjusted values')+'</h3><span id="changes-count"></span></div><div id="base-comparison"></div><div id="changed-inputs" class="changed-inputs"></div>';
}
function updateWorkbench(r){
 if(!$('workbench'))return;
 const c=M.companies[company],b=M.estimate(c.p,mode),annual=mode==='annual',unit=t(' 顆',' units');
 $('work-error').hidden=true;
 $('capex-entry').textContent=(annual?t('全年預算 = ','Annual budget = ')+compact(p.next*1e9):t('CapEx 增額 = ','Capex increase = ')+compact(p.next*1e9)+' − '+compact(p.old*1e9)+' = '+compact(r.headline*1e9))+' · '+t('B = 10 億美元；M = 100 萬美元','B = billion USD; M = million USD');
 $('step-volume').hidden=annual;
 const steps={
 volume:[compact(r.headline*1e9)+' × '+f(p.volume,2)+'%',compact(r.effective*1e9)],
 dc:[compact(r.effective*1e9)+' × '+f(p.dc,2)+'%',compact(r.dc)],
 it:[compact(r.dc)+' × '+f(p.it,2)+'%',compact(r.it)],
 accelerated:[compact(r.it)+' × '+f(p.accelerated,2)+'%',compact(r.acc)],
 gpuMix:[compact(r.acc)+' × '+f(p.gpuMix,2)+'%',t('GPU 預算 ','GPU budget ')+money(r.gpuBudget)],
 gpuCost:[money(r.gpuBudget)+' ÷ '+money(p.gpuCost),f(r.gpu)+unit],
 asicCost:[money(r.acc)+' × '+f(100-p.gpuMix,2)+'% ÷ '+money(p.asicCost),f(r.asic)+unit]};
 for(const [key,[formula,result]] of Object.entries(steps)){$('formula-'+key).textContent=formula;$('output-'+key).textContent=result;}
 const delta=(x,y)=>{const d=Math.round(x)-Math.round(y);return(d>0?'+':'')+f(d);};
 const valueDelta=(r.value>b.value?'+':'')+compact(r.value-b.value);
 $('live-results').innerHTML='<div><span>'+t('你的 GPU 推估','Your GPU estimate')+'</span><strong>'+f(r.gpu)+unit+'</strong><small>'+t('較預設基準 ','vs. default baseline ')+delta(r.gpu,b.gpu)+unit+'</small></div><div><span>'+c.custom+'</span><strong>'+f(r.asic)+unit+'</strong><small>'+t('較預設基準 ','vs. default baseline ')+delta(r.asic,b.asic)+unit+'</small></div><div><span>'+t('Marvell 晶片金額','Marvell silicon value')+'</span><strong>'+compact(r.value)+'</strong><small>'+t('較預設基準 ','vs. default baseline ')+valueDelta+'</small></div>';
 const factors=[money(r.headline*1e9),...(annual?[]:[f(p.volume,2)+'%']),f(p.dc,2)+'%',f(p.it,2)+'%',f(p.accelerated,2)+'%',f(p.gpuMix,2)+'%'];
 $('gpu-equation').innerHTML='<p>'+t('預算 → 實體採購 → 資料中心 → IT 設備 → 加速運算 → GPU 預算 → GPU 顆數','Budget → hardware volume → datacenter → equipment → accelerated systems → GPU budget → GPU units')+'</p><strong>'+factors.join(' × ')+' ÷ '+money(p.gpuCost)+' = '+f(r.gpu)+unit+'</strong>';
 const changes=Object.keys(c.p).filter(k=>p[k]!==c.p[k]);
 $('changes-count').textContent=changes.length?t('已調整 ','Edited ')+changes.length+t(' 項',' inputs'):t('使用預設基準','Using default baseline');
 $('base-comparison').innerHTML=table([t('產品','Product'),t('預設基準','Default baseline'),t('調整數值後','Adjusted values'),t('差額','Change')],[['GPU',f(b.gpu),f(r.gpu),delta(r.gpu,b.gpu)],[c.custom,f(b.asic),f(r.asic),delta(r.asic,b.asic)],[t('Marvell 晶片金額','Marvell silicon value'),compact(b.value),compact(r.value),valueDelta]],'narrow');
 $('changed-inputs').innerHTML=changes.map(key=>{const field=fields.find(x=>x[0]===key),label=field?t(field[1],field[2]):t(...copy[key]);return '<span>'+label+': '+f(c.p[key],2)+' → <b>'+f(p[key],2)+'</b></span>';}).join('');
 document.querySelectorAll('[data-key]').forEach(e=>e.classList.toggle('edited',p[e.dataset.key]!==c.p[e.dataset.key]));
 document.querySelectorAll('[data-reset-key]').forEach(e=>e.disabled=p[e.dataset.resetKey]===c.p[e.dataset.resetKey]);
}
function syncInput(key){
 document.querySelectorAll('[data-key="'+key+'"]').forEach(e=>e.value=Number.isFinite(p[key])?p[key]:'');
 if(key==='old'||key==='next')$(key).value=p[key];
}
function language(){
 document.documentElement.lang=lang==='en'?'en':'zh-Hant';
 document.title=t('Cap 增長範例 | Marvell 產品需求推算','Capex growth example | Marvell product demand');
 document.querySelectorAll('[data-t]').forEach(e=>e.textContent=t(...copy[e.dataset.t]));
 document.querySelectorAll('[data-lang]').forEach(e=>e.setAttribute('aria-pressed',String(e.dataset.lang===lang)));
 $('scope').options[0].text=t('CapEx 增額','Capex increase');$('scope').options[1].text=t('最新全年預算','Latest annual budget');
 makeInputs();makeWorkbench();renderResults();
}
function renderResults(){
 const c=M.companies[company],annual=mode==='annual';
 $('context').innerHTML=t(...c.compare)+' · '+t(...c.basis)+' · '+link(c.baseSource,t('基準來源','Baseline source'))+' '+link(c.source,t('最新來源','Latest source'))+' <a href="'+($('workbench')?'#workbench':'#assumptions')+'">'+t('調整推估假設 ↓','Edit assumptions ↓')+'</a>';
 let r;try{r=M.estimate(p,mode);$('error').hidden=true;$('results').hidden=false;$('results').dataset.valid='true';}catch(e){$('error').hidden=false;$('results').hidden=!$('workbench');$('results').dataset.valid='false';const field=fields.find(x=>x[0]===e.message);$('error').textContent=e.message==='allocation'?t('請將加速運算、網路、儲存三項配置合計調整至 100% 以內。','Set accelerated, networking and storage allocations to a combined 100% or less.'):t('請填入有效數值：','Enter a valid value: ')+(field?t(field[1],field[2]):e.message);if($('workbench')){$('work-error').hidden=false;$('work-error').textContent=$('error').textContent;$('live-results').textContent=t('調整數值後繼續試算','Update the input to continue');coreKeys.forEach(k=>{$('formula-'+k).textContent='';$('output-'+k).textContent='—';});$('gpu-equation').textContent='—';$('base-comparison').textContent='—';$('changes-count').textContent='';$('changed-inputs').textContent='';document.querySelectorAll('[data-reset-key]').forEach(x=>x.disabled=p[x.dataset.resetKey]===c.p[x.dataset.resetKey]);}return;}updateWorkbench(r);
 const scope=t(annual?'全年預算支應':'增額支應',annual?'Funded by annual budget':'Funded by the increase');
 $('headline').innerHTML='<div class="metric"><label>'+t('GPU 需求推估 · B300 級平台','Estimated GPU demand · B300-class')+'</label><strong>'+f(r.gpu)+' '+t('顆','GPUs')+'</strong><p>'+scope+' · '+t('約','about')+' '+f(r.gpuServers)+' '+t('台 8-GPU 伺服器','eight-GPU server equivalents')+'</p></div><div class="metric"><label>'+c.custom+' '+t('需求推估','estimated demand')+'</label><strong>'+f(r.asic)+' '+t('顆','chips')+'</strong><p>'+t('平台成本','Platform cost')+' '+money(p.asicCost)+' / '+t('顆','chip')+'</p></div><div class="metric"><label>'+t('Marvell 晶片機會金額','Marvell silicon opportunity')+'</label><strong>'+compact(r.value)+'</strong><p>'+t('依產品份額與 ASP 加總','Sum of product allocation × ASP')+'</p></div>';
 const budgets=[[t('加速運算平台','Accelerated systems'),r.acc],[t('CPU 伺服器','CPU servers'),r.cpu],[t('外部網路','External networking'),r.net],[t('獨立儲存','External storage'),r.storage]];
 $('budgetBars').innerHTML=budgets.map(([label,v])=>'<div class="bar-row"><span>'+label+'</span><div class="bar"><i style="width:'+(r.it?Math.abs(v/r.it)*100:0)+'%"></i></div><span class="num">'+compact(v)+'</span></div>').join('')+'<p class="micro">'+t('IT 設備預算合計','Total equipment budget')+' '+compact(r.it)+' · '+t('CPU 配置','CPU allocation')+' '+f(100-p.accelerated-p.network-p.storage,1)+'%</p>';
 $('judgment').innerHTML='<p>'+t('以','With')+' '+compact(r.headline*1e9)+' '+t(annual?'全年預算計算，':'CapEx 增額計算，',annual?'annual budget, ':'capex increase, ')+t('先分配','allocate')+' '+compact(r.effective*1e9)+' '+t('至實體採購，再得到','to hardware volume, yielding')+' '+compact(r.acc)+' '+t('加速運算預算。','of accelerated-compute budget.')+'</p><p>'+t('其中 GPU 採','GPU allocation:')+' '+f(p.gpuMix,1)+'%，'+c.custom+' '+f(100-p.gpuMix,1)+'%。'+t('平台單價與產品配比是顆數的主要調整點。','Platform cost and product mix are the main unit-demand drivers.')+'</p>';
 const calc=[
 [t(annual?'全年 CapEx':'CapEx 增額',annual?'Annual capex':'Capex increase'),annual?compact(p.next*1e9):compact(p.next*1e9)+' − '+compact(p.old*1e9),compact(r.headline*1e9)],
 [t('實體採購配置','Hardware-volume allocation'),f(annual?100:p.volume)+'%',compact(r.effective*1e9)],
 [t('資料中心預算','Datacenter budget'),compact(r.effective*1e9)+' × '+f(p.dc)+'%',compact(r.dc)],
 [t('IT 設備','IT equipment'),compact(r.dc)+' × '+f(p.it)+'%',compact(r.it)],
 [t('加速運算平台','Accelerated systems'),compact(r.it)+' × '+f(p.accelerated)+'%',compact(r.acc)],
 ['GPU '+t('預算','budget'),compact(r.acc)+' × '+f(p.gpuMix)+'%',compact(r.gpuBudget)],
 ['GPU '+t('顆數','units'),compact(r.gpuBudget)+' ÷ '+money(p.gpuCost),f(r.gpu)],
 [c.custom+' '+t('顆數','units'),compact(r.asicBudget)+' ÷ '+money(p.asicCost),f(r.asic)]];
 if($('calculation'))$('calculation').innerHTML=table([t('項目','Item'),t('運算','Calculation'),t('結果','Result')],calc,'narrow');
 $('hardware').innerHTML=table([t('產品','Product'),t('預算','Budget'),t('推估採購量','Estimated purchases')],[
 ['GPU',compact(r.gpuBudget),f(r.gpu)+' '+t('顆','units')],[c.custom,compact(r.asicBudget),f(r.asic)+' '+t('顆','units')],[t('8-GPU 伺服器等效量','Eight-GPU server equivalents'),t('GPU 平台內','Within GPU budget'),f(r.gpuServers)+' '+t('台','systems')],[t('CPU 伺服器','CPU servers'),compact(r.cpu),f(r.cpuServers)+' '+t('台','systems')],[t('外部網路','External networking'),compact(r.net),t('依下方拓樸展開','Expanded below')],[t('獨立儲存','External storage'),compact(r.storage),t('預算池','Budget pool')]],'narrow')+'<p class="micro">'+t('成本與支出組合調整配置','Allocation to cost and spending-mix changes')+' '+compact(r.costAllocation)+'</p>';
 $('networkFlow').innerHTML='<div class="flow-grid"><div><h3>'+t('加速器對外頻寬','Accelerator-facing bandwidth')+'</h3><strong>'+f(r.bw/1000,1)+' Tbps</strong><p>'+f(r.gpu)+' × '+f(p.gpuGbps)+' + '+f(r.asic)+' × '+f(p.asicGbps)+' Gbps</p></div><div><h3>'+t('伺服器 → Leaf','Server → leaf')+'</h3><strong>'+f(r.edgeLinks)+' '+t('等效連線','equivalent links')+'</strong><p>'+f(p.edgeGbps)+'G '+t('埠容量；光學','ports; optical')+' '+f(p.edgeOptical)+'%，AEC '+f((100-p.edgeOptical)*p.aecAttach/100,1)+'%</p></div><div><h3>'+t('Leaf → Spine','Leaf → spine')+'</h3><strong>'+f(r.upBw/1000,1)+' Tbps</strong><p>'+t('上行／下行','Uplink / downlink')+' '+f(p.uplink)+'%；1.6T '+t('頻寬占比','bandwidth share')+' '+f(p.up1600)+'%</p></div></div>'+table([t('產品需求','Product demand'),t('計算方式','Calculation'),t('數量','Quantity')],[
 ['400G '+t('光模組','optical modules'),t('400G 伺服器光連線 × 2 端','400G server optical links × 2 ends'),f(r.module400)],
 ['800G '+t('光模組','optical modules'),t('800G 伺服器光連線 × 2 + 800G 上行連線 × 2','800G server optical links × 2 + 800G uplinks × 2'),f(r.module800)],
 ['1.6T '+t('光模組','optical modules'),t('1.6T 伺服器光連線 × 2 + 1.6T 上行連線 × 2','1.6T server optical links × 2 + 1.6T uplinks × 2'),f(r.module1600)],
 ['AEC '+t('線纜','cables'),t('伺服器連線 × 銅比例 × AEC 比例','Server links × copper fraction × AEC fraction'),f(r.aecCables)],
 ['51.2T '+t('Ethernet 交換器等效量','Ethernet switch equivalents'),t('B × (1 + 2 × 上行比) × Ethernet 比例 ÷ (51,200 × 使用率)','B × (1 + 2 × uplink ratio) × Ethernet fraction ÷ (51,200 × utilization)'),f(r.switchChips)]])+'<p class="micro">'+t('B 為加速器對外總頻寬，單位 Gbps。計算範圍：兩層 scale-out；光模組以所選埠速折算。','B is aggregate external bandwidth in Gbps. Scope: two-tier scale-out; optical modules are port-capacity equivalents.')+' '+link('gpu')+' · '+link(c.hardware)+'</p>';
 const names={dsp400:'400G Optical DSP',dsp800:'800G Optical DSP',dsp1600:'1.6T Optical DSP',aec:'Alaska A · AEC DSP',switch:'Teralynx · Ethernet switch',custom:'Custom compute ASIC'};
 $('products').innerHTML=table([t('Marvell 產品','Marvell product'),t('同類晶片需求','Class demand'),t('供應份額假設','Allocation'),t('Marvell 顆數','Marvell units'),'ASP',t('機會金額','Value')],r.products.map(x=>[names[x.id],f(x.market),f(x.share)+'%',f(x.units),money(x.asp),compact(x.value)]))+'<p class="micro">'+t('Optical DSP = 光模組 × DSP 採用率；AEC DSP = 線纜 × 2；Custom compute = 自研晶片 × 設計案配置。金額以各產品顆數乘晶片單價。','Optical DSP = optical modules × attach rate; AEC DSP = cables × 2; custom compute = custom chips × program allocation. Value = allocated units × silicon ASP.')+'</p>';
 const annualR=M.estimate(p,'annual'),pace=365*24*60*60/14;
 const checks=[['AI scale-out '+t('主要網路元件成本','major component cost'),compact(r.networkBom),t('光模組、AEC、Ethernet 交換器按整機／模組採購價加總。','Sum optics, AECs and Ethernet chassis at system/module procurement costs.')],[t('外部網路預算餘額','External network budget remaining'),compact(r.networkHeadroom),t('對照','Compare with')+' '+compact(r.net)+' '+t('網路預算；餘額分配前端網路、DCI、其他機箱與備品。','network budget; allocate the remainder to frontend networks, DCI, other chassis and spares.')]];
 if(company==='amazon')checks.push([t('AWS 部署速率年化','AWS annualized installation pace'),f(pace)+' '+t('顆／年','chips/year'),t('官方每 14 秒安裝 1 顆，換算 365 天速率。模型全年 GPU＋Trainium 為 ','Official pace: one chip every 14 seconds, annualized over 365 days. Modeled annual GPU + Trainium: ')+f(annualR.gpu+annualR.asic)+'；'+t('量級比 ','scale ratio ')+f((annualR.gpu+annualR.asic)/pace,2)+'×。 '+link('awsPace',t('來源','Source'))]);
 else checks.push([t('GPU 系統成本錨點','GPU system cost anchor'),money(646878/8)+' / GPU',t('Broadberry B300 整機 $646,878／8 顆；本模型採 ','Broadberry B300 system: $646,878 / 8 GPUs; model uses ')+money(p.gpuCost)+'，'+f(p.gpuCost/(646878/8)*100,1)+'% '+t('公開整機參考值。','of the public system reference.')+' '+link('gpuPrice',t('來源','Source'))]);
 $('crossChecks').innerHTML='<div class="table-wrap"><table><thead><tr><th>'+t('檢核','Check')+'</th><th class="num">'+t('數值','Value')+'</th><th>'+t('如何使用','Interpretation')+'</th></tr></thead><tbody>'+checks.map(row=>'<tr><td>'+row[0]+'</td><td class="num">'+row[1]+'</td><td>'+row[2]+'</td></tr>').join('')+'</tbody></table></div>'+(r.networkHeadroom<0?'<p class="attention">'+t('網路配置需增加 ','Add ')+compact(Math.abs(r.networkHeadroom))+t('，或調整模組成本、上行頻寬與光學比例。',' to network allocation, or adjust module costs, uplink bandwidth and optical mix.')+'</p>':'');
 if($('workbench')){$('networkFlow').insertAdjacentHTML('beforeend','<button type="button" data-open-assumptions="2">'+t('修改頻寬、連線與光學比例','Edit bandwidth, links and optical mix')+'</button>');$('products').insertAdjacentHTML('beforeend','<p class="worked-example">800G DSP: '+f(r.module800,3)+' × '+f(p.dspAttach,2)+'% × '+f(p.opticalShare,2)+'% = '+f(r.products[1].units)+' '+t('顆','units')+'</p><button type="button" data-open-assumptions="2,3">'+t('修改 DSP 採用率、市佔率與單價','Edit DSP attach rate, supplier share and ASP')+'</button>');}renderEvidence(c);renderSensitivity(r);
}
function renderEvidence(c){
 const rows=[
 [t('CapEx 金額','Capex amounts'),t('公開資料','Public data'),money(c.p.old*1e9)+' → '+money(c.p.next*1e9)+' · '+t(...c.compare)+'。 '+link(c.baseSource,t('原值','Prior'))+' / '+link(c.source,t('新值','New'))+(company==='microsoft'?'<br>CY2025: '+link('msftQ1','21.4')+' + '+link('msftQ2','24.2')+' + '+link('msftQ3','34.9')+' + '+link('msftBase','37.5')+' = $118B':'')],
 [t('增額用途','Use of the increase'),t('推估假設','Estimated input'),t(...c.note)+' '+link(c.source,t('公司資料','Company source'))+(company==='amazon'?' · '+link('awsPace',t('記憶體成本與部署','Memory costs and installations')):'')],
 [t('資料中心比重','Datacenter share'),f(c.p.dc)+'% · '+t('推估','Estimate'),t(...c.dcWhy)+' '+link(c.source,t('來源','Source'))],
 [t('IT 設備比重','Equipment share'),f(c.p.it)+'% · '+t('來源錨定','Source anchored'),t('Alphabet Q3：技術基礎設施設備 65%；Microsoft 最新季度：短期設備約 75%。Microsoft 以 75% ÷ 95% 換算資料中心內設備比重約 79%；AWS／Meta 採 70% 同業基準。跨期使用此配置推估新增採購。','Alphabet Q3: equipment is 65% of technical infrastructure. Microsoft: about 75% of quarterly capex is short-lived assets. Microsoft normalizes 75% by its 95% datacenter allocation to about 79%. AWS / Meta use a 70% peer-informed base. Apply these mixes to incremental purchasing.')+' '+link('google','Alphabet')+' / '+link('msft','Microsoft')],
 [t('設備內部配置','Equipment allocation'),t('推估假設','Estimated input'),t('加速運算 60%、CPU 20%、網路 15%、獨立儲存 5%。以運算平台為主要成本，網路比重再用模組與交換器成本校準。','Accelerated systems 60%, CPU 20%, networking 15%, external storage 5%. Compute platforms lead spending; check networking against module and chassis costs.')],
 [t('GPU／自研配比','GPU / custom mix'),t('推估假設','Estimated input'),t(...c.mixWhy)+' '+link(c.hardware,t('產品架構','Architecture'))+' '+(company==='amazon'?link('amazonBase','Trainium2'):'')],
 [t('GPU 平台成本','GPU platform cost'),t('價格錨點＋推估','Price anchor + estimate'),t('Broadberry B200 整機 $562,154、B300 $646,878，均為 8 GPU。B300 每 GPU 分攤約 $80,860；基準以規模採購／配置調整係數約 0.74，採 $60,000。成本情境採基準 ±20%。','Broadberry lists eight-GPU B200 at $562,154 and B300 at $646,878. B300 is about $80,860 per GPU. A 0.74 procurement/configuration factor yields a $60,000 base. Cost scenarios vary the base by ±20%.')+' '+link('gpuPrice',t('供應商報價頁','Vendor listing'))],
 [c.custom+' '+t('平台成本','platform cost'),t('工程推估','Engineering estimate'),t(...c.asicWhy)+' '+link(c.hardware,t('規格依據','Specifications'))],
 [t('網路用量','Network content'),t('規格＋拓樸假設','Specs + topology'),t('B300 每 GPU 800 Gbps；Trn2 3.2 Tbps／16 晶片；Ironwood DCN 每晶片 100 Gbps。兩層 leaf–spine、上行比 75%、伺服器光學比例 80%，形成基準連線用量。','B300: 800 Gbps per GPU. Trn2: 3.2 Tbps / 16 chips. Ironwood DCN: 100 Gbps per chip. Two-tier leaf–spine, 75% uplink ratio and 80% optical server links form the base topology.')+' '+link('gpu','NVIDIA')+' / '+link('trn','AWS')+' / '+link('tpu','Google')],
 [t('Optical DSP 份額','Optical DSP share'),t('分析師估計＋配置假設','Analyst estimate + allocation'),t('J.P. Morgan 的 Harlan Sur 在 2026-11-02 提問時估計 DSP 市佔 70% 以上；模型以 70% 作為光學 DSP 供應配置的起點，可依客戶與速度調整。','J.P. Morgan’s Harlan Sur estimated DSP share above 70% in a Nov 2, 2026 question. The model starts optical DSP allocation at 70%, adjustable by customer and speed.')+' '+link('share',t('逐字稿','Transcript'))],
 [t('其他產品配置','Other product allocations'),t('推估假設','Estimated inputs'),t('AEC 30%、Ethernet switch 10%；AWS Custom compute 50%，依五年合作範圍建立設計案情境。其他客戶 Custom compute 起始為 0%。','AEC 30%, Ethernet switch 10%, AWS custom compute 50%, using the five-year collaboration as a program scenario. Custom compute starts at 0% for other customers.')+' '+link('partnership',t('AWS 合作範圍','AWS agreement'))],
 [t('晶片 ASP 與網路成本','Silicon ASP and network costs'),t('工程推估','Engineering estimates'),t('800G／1.6T DSP：$100／$180；AEC DSP：$40；switch ASIC：$3,000；custom compute：$5,000。網路檢核採 800G／1.6T 模組 $1,000／$2,000、交換器 $40,000、AEC $400。可用供應商報價替換。','800G / 1.6T DSP: $100 / $180; AEC DSP: $40; switch ASIC: $3,000; custom compute: $5,000. Network checks use $1,000 / $2,000 optics, $40,000 chassis and $400 AECs. Supplier quotes can replace these inputs.')],
 [t('交換晶片容量','Switch capacity'),t('產品規格','Product specification'),t('Teralynx 10：51.2 Tbps，可提供 64×800G 或 128×400G；基準用 75% 埠容量使用率。','Teralynx 10: 51.2 Tbps, supporting 64×800G or 128×400G; base port-capacity utilization is 75%.')+' '+link('sw',t('產品規格','Product brief'))]
 ];
 $('evidence').innerHTML='<p class="comparison-copy">'+t('公開資料設定金額與硬體規格，推估假設設定採購配置與單價。下表保存預設基準，編輯值會即時更新計算結果。','Public data anchor budgets and hardware specs; estimated inputs set procurement mix and costs. This table records company defaults; edited inputs update the calculations.')+'</p><div class="table-wrap"><table class="evidence-table"><thead><tr><th>'+t('假設','Input')+'</th><th>'+t('依據類型','Basis')+'</th><th>'+t('採用理由與來源','Rationale and source')+'</th></tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(x=>'<td>'+x+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
}
function renderSensitivity(r){
 const cases=M.scenarios(p,mode),names=[t('採購量偏低','Lower unit case'),t('目前基準','Current base'),t('採購量偏高','Higher unit case')];
 $('sensitivity').innerHTML='<p>'+t('偏低：設備比重與加速運算比重各減 10 個百分點、平台成本加 20%。偏高：兩項比重各加 10 個百分點、平台成本減 20%。產品配比及供應份額沿用目前輸入。','Lower: equipment and accelerated shares each fall 10 percentage points; platform costs rise 20%. Higher: both shares rise 10 points; costs fall 20%. Product mix and supplier allocation follow current inputs.')+'</p>'+table([t('結果','Output'),...names],[
 ['GPU',...cases.map(x=>f(x.gpu))],[M.companies[company].custom,...cases.map(x=>f(x.asic))],[t('光模組','Optical modules'),...cases.map(x=>f(x.modules))],[t('Marvell 晶片金額','Marvell silicon value'),...cases.map(x=>compact(x.value))]])+'<h3 style="margin-top:24px">'+t('GPU 預算占比 × 每 GPU 平台成本','GPU budget mix × platform cost per GPU')+'</h3>'+table([t('GPU 預算比重','GPU budget share'),money(p.gpuCost*.8),money(p.gpuCost),money(p.gpuCost*1.2)],[Math.max(0,p.gpuMix-15),p.gpuMix,Math.min(100,p.gpuMix+15)].map(m=>[f(m)+'%',...[.8,1,1.2].map(k=>f(r.acc*m/100/(p.gpuCost*k)))]))+'<p class="micro">'+t('每格為 GPU 顆數；加速運算總預算保持 ','Cells show GPU units with accelerated spending held at ')+compact(r.acc)+'.</p>'+(mode==='increment'?'<h3>'+t('CapEx 增額的實體採購配置','Hardware-volume share of the capex increase')+'</h3>'+table([t('實體採購占增額','Volume share of increase'),'GPU',M.companies[company].custom],[25,50,75,100].map(v=>{const x=M.estimate({...p,volume:v},mode);return[f(v)+'%',f(x.gpu),f(x.asic)];})): '');
}
$('company').innerHTML=Object.entries(M.companies).map(([key,c])=>'<option value="'+key+'">'+c.name+'</option>').join('');
function loadCompany(useDraft=false){p={...(useDraft&&drafts[company]?drafts[company]:M.companies[company].p)};$('old').value=p.old;$('next').value=p.next;makeInputs();makeWorkbench();renderResults();}
$('company').addEventListener('change',()=>{drafts[company]={...p};company=$('company').value;loadCompany(true);});
$('scope').addEventListener('change',()=>{mode=$('scope').value;renderResults();});
['old','next'].forEach(key=>$(key).addEventListener('input',()=>{p[key]=$(key).value===''?NaN:Number($(key).value);renderResults();}));
$('reset').addEventListener('click',()=>{delete drafts[company];loadCompany();});
document.addEventListener('input',e=>{const key=e.target.dataset.key;if(!key)return;p[key]=e.target.value===''?NaN:Number(e.target.value);renderResults();});
document.addEventListener('click',e=>{const reset=e.target.closest('[data-reset-key]');if(reset){const key=reset.dataset.resetKey;p[key]=M.companies[company].p[key];syncInput(key);renderResults();}const open=e.target.closest('[data-open-assumptions]');if(open){const ids=open.dataset.openAssumptions.split(',');ids.forEach(i=>$('group-'+i).open=true);$('group-'+ids[0]).scrollIntoView({block:'start',behavior:'smooth'});}});
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{lang=b.dataset.lang;const url=new URL(window.location.href);url.searchParams.set('lang',lang);window.history.replaceState(null,'',url.href);language();}));
document.querySelectorAll('[data-panel]').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.panel;document.querySelectorAll('[data-panel]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));['model','evidence','sensitivity'].forEach(id=>$('panel-'+id).hidden=id!==active);}));
$('sources').innerHTML=Object.keys(M.sources).map(key=>link(key)).join('');
loadCompany();language();
})();

