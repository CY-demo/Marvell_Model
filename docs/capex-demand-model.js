(function(root){
'use strict';
const sources={
 amazon:{title:'Amazon Q3 2026 · 2026-10-29',url:'https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-Third-Quarter-Results/default.aspx'},
 amazonBase:{title:'Amazon Q4 2025 · 2026-02-05',url:'https://www.aboutamazon.com/news/company-news/amazon-earnings-q4-2025-report'},
 awsPace:{title:'AWS installation pace · 2026-10-30',url:'https://www.aboutamazon.com/news/company-news/aws-growth-ai-demand-q3-2026-earnings'},
 google:{title:'Alphabet Q3 2026 · 2026-10-28',url:'https://abc.xyz/investor/events/event-details/2026/2026-Q3-Earnings-Call-2026-Ujou16CTw9/default.aspx'},
 googleBase:{title:'Alphabet Q2 2026 · 2026-07-29',url:'https://abc.xyz/investor/events/event-details/2026/2026-Q2-Earnings-Call-2026-GgTAq7Is0z/'},
 msft:{title:'Microsoft FY27 Q1 · 2026-10-28',url:'https://www.microsoft.com/en-us/investor/events/fy-2027/earnings-fy-2027-q1'},
 msftBase:{title:'Microsoft FY26 Q2 · CY2025 Q4',url:'https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q2'},
 msftQ1:{title:'Microsoft CY2025 Q1 · $21.4B',url:'https://www.microsoft.com/en-us/investor/events/fy-2025/earnings-fy-2025-q3'},
 msftQ2:{title:'Microsoft CY2025 Q2 · $24.2B',url:'https://www.microsoft.com/en-us/investor/events/fy-2025/earnings-fy-2025-q4'},
 msftQ3:{title:'Microsoft CY2025 Q3 · $34.9B',url:'https://www.microsoft.com/en-us/investor/events/fy-2026/earnings-fy-2026-q1'},
 meta:{title:'Meta Q3 2026 · 2026-10-21',url:'https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Third-Quarter-2026-Results/'},
 metaBase:{title:'Meta Q2 2026 · 2026-07-29',url:'https://investor.atmeta.com/investor-news/press-release-details/2026/Meta-Reports-Second-Quarter-2026-Results/'},
 gpuPrice:{title:'Broadberry · DGX B200 / B300 systems',url:'https://www.broadberry.com/ai-training-rackmount-servers'},
 gpu:{title:'NVIDIA HGX AI Factory · B300',url:'https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory/latest/components.html'},
 trn:{title:'AWS Trn2 · 16 chips, 3.2 Tbps EFA',url:'https://aws.amazon.com/ec2/instance-types/trn2/'},
 tpu:{title:'Google Cloud · TPU specifications',url:'https://docs.cloud.google.com/docs/compute-area/tpus?hl=en'},
 maia:{title:'Microsoft · Maia 200 architecture',url:'https://techcommunity.microsoft.com/blog/azureinfrastructureblog/deep-dive-into-the-maia-200-architecture/4489312'},
 mtia:{title:'Meta · MTIA 300 · 2026-08-24',url:'https://engineering.fb.com/2026/08/24/networking-traffic/mtia-300-meta-training-chip-built-in-nics/'},
 dsp:{title:'Marvell · PAM4 optical DSPs',url:'https://www.marvell.com/products/pam-dsp.html'},
 aec:{title:'Marvell · Alaska A AEC DSPs',url:'https://www.marvell.com/products/aec-dsps.html'},
 sw:{title:'Marvell · Teralynx 10 · 51.2 Tbps',url:'https://www.marvell.com/content/dam/marvell/en/public-collateral/switching/marvell-teralynx-10-data-center-ethernet-switch-product-brief.pdf'},
 share:{title:'J.P. Morgan analyst Harlan Sur · 2026-11-02',url:'https://investor.marvell.com/sec-filings/all-sec-filings/content/0001193125-26-443876/d178787d425.htm'},
 partnership:{title:'Marvell–AWS agreement · 2024-12-02',url:'https://www.marvell.com/company/newsroom/marvell-expands-strategic-collaboration-aws-enable-accelerated-infrastructure-ai-cloud.html'}
};
const common={old:200,next:220,volume:50,dc:85,it:70,accelerated:60,network:15,storage:5,gpuMix:65,gpuCost:60000,asicCost:25000,cpuCost:15000,
 gpuGbps:800,asicGbps:200,edgeGbps:800,uplink:75,edgeOptical:80,up1600:30,dspAttach:90,aecAttach:70,ethernet:80,switchUtil:75,
 opticalShare:70,aecShare:30,switchShare:10,customShare:50,dsp800Asp:100,dsp1600Asp:180,aecAsp:40,switchAsp:3000,customAsp:5000,
 module800Cost:1000,module1600Cost:2000,switchCost:40000,aecCost:400};
const companies={
 amazon:{name:'Amazon / AWS',custom:'Trainium',compare:['CY2026 年初指引 → 最新指引','CY2026 initial → latest guidance'],basis:['全公司現金 CapEx','Company cash capex'],source:'amazon',baseSource:'amazonBase',hardware:'trn',p:{...common},
 note:['AWS 部署速率與 Trainium 規模支持 GPU＋自研晶片雙路配置。增額的實體採購配置設為 50%，另 50% 配置至成本與支出組合調整。','AWS installation pace and Trainium scale support a GPU / custom-silicon mix. Allocate 50% of the increase to hardware volume and 50% to cost and spending-mix changes.'],
 dcWhy:['AWS 為主要擴建方向，基準配置 85%，以 75–95% 檢查變動。','AWS drives the buildout; use 85%, with a 75–95% working range.'],
 mixWhy:['Trainium2 已部署 140 萬顆；加速運算預算基準採 GPU 65%、Trainium 35%。','Trainium2 reached 1.4 million installed chips; allocate 65% of accelerated spending to GPUs and 35% to Trainium.'],
 asicWhy:['Trn2 每顆分攤 96 GB 加速器記憶體；平台成本採 $25k 工程估值，涵蓋晶片、HBM、主機及機架配套。','Trn2 allocates 96 GB accelerator memory per chip. Use a $25k engineering estimate for silicon, HBM, host and rack allocation.']},
 google:{name:'Alphabet / Google',custom:'TPU',compare:['CY2026 Q2 上修前 → Q3 維持指引中點','CY2026 pre-Q2 revision → Q3 maintained midpoint'],basis:['全公司 CapEx','Company capex'],source:'google',baseSource:'googleBase',hardware:'tpu',p:{...common,old:185,next:200,volume:100,dc:95,it:65,gpuMix:40,asicCost:30000,asicGbps:100,customShare:0},
 note:['Q3 技術基礎設施配置為設備 65%、資料中心 35%。TPU 與 NVIDIA GPU 分別配置平台成本及外部網路頻寬。','Q3 technical infrastructure was 65% equipment and 35% datacenters. TPU and NVIDIA GPU budgets use separate costs and external network bandwidth.'],
 dcWhy:['法說指出 CapEx 大部分投入技術基礎設施，採 95% 配置基準。','The call assigns the vast majority to technical infrastructure; use 95%.'],
 mixWhy:['Gemini 與 Cloud TPU 使用自研平台；加速運算預算採 TPU 60%、GPU 40%。','Gemini and Cloud TPU use custom platforms; allocate 60% of accelerated spending to TPU and 40% to GPU.'],
 asicWhy:['以 Ironwood 192 GB HBM 與主機分攤設定 $30k 工程估值；DCN 採每晶片 100 Gbps。','Use a $30k engineering estimate anchored to Ironwood 192 GB HBM and host allocation; DCN is 100 Gbps per chip.']},
 microsoft:{name:'Microsoft',custom:'Maia',compare:['CY2025 實績重建 → CY2026 指引','CY2025 reconstructed actual → CY2026 guidance'],basis:['含融資租賃 CapEx','Capex including finance leases'],source:'msft',baseSource:'msftBase',hardware:'maia',p:{...common,old:118,next:170,volume:100,dc:95,it:79,gpuMix:85,asicCost:35000,asicGbps:200,customShare:0},
 note:['最新季度約 75% CapEx 配置短期設備。GPU 承接主要訓練與雲端需求，Maia 承接部分推論需求。','About 75% of quarterly capex went to short-lived equipment. GPUs serve core training and cloud demand; Maia serves part of inference.'],
 dcWhy:['Azure 與 AI 基建主導投資，配置 95% 至資料中心相關項目。','Azure and AI infrastructure drive investment; allocate 95% to datacenter projects.'],
 mixWhy:['以 NVIDIA GPU 為主、Maia 推論導入為輔，採 85%／15% 預算組合。','Use an 85% / 15% budget mix for GPU-led deployments and Maia inference adoption.'],
 asicWhy:['Maia 200 配備 216 GB HBM3e；平台成本採 $35k 工程估值，scale-out 另設 200 Gbps 規劃值。','Maia 200 has 216 GB HBM3e; use a $35k platform estimate and a separate 200 Gbps scale-out planning allocation.']},
 meta:{name:'Meta',custom:'MTIA',compare:['CY2026 Q2 → Q3 指引中點','CY2026 Q2 → Q3 guidance midpoint'],basis:['含融資租賃本金支付 CapEx','Capex including finance-lease principal'],source:'meta',baseSource:'metaBase',hardware:'mtia',p:{...common,old:137.5,next:140,volume:100,dc:95,it:70,gpuMix:85,asicCost:20000,asicGbps:200,customShare:0},
 note:['GPU 支援生成式 AI，MTIA 支援排序與推薦模型。設備配置採同業 65–75% 區間的 70% 中值。','GPUs support generative AI; MTIA serves ranking and recommendation. Equipment allocation uses 70%, the midpoint of the 65–75% peer anchors.'],
 dcWhy:['投資聚焦 AI 與核心業務基建，採 95% 資料中心配置。','Investment focuses on AI and core infrastructure; use a 95% datacenter allocation.'],
 mixWhy:['MTIA 300 擴展推薦模型訓練；預算基準採 GPU 85%、MTIA 15%。','MTIA 300 expands recommendation training; use an 85% GPU / 15% MTIA budget mix.'],
 asicWhy:['依推薦工作負載的專用設計，平台成本採 $20k 工程估值；外部網路配置 200 Gbps／晶片。','Use a $20k platform estimate for specialized recommendation hardware and 200 Gbps external networking per chip.']}
};
const percent=['volume','dc','it','accelerated','network','storage','gpuMix','uplink','edgeOptical','up1600','dspAttach','aecAttach','ethernet','opticalShare','aecShare','switchShare','customShare'];
function validate(p){
 for(const k of Object.keys(common))if(typeof p[k]!=='number'||!Number.isFinite(p[k])||p[k]<0)throw new Error(k);
 for(const k of percent)if(p[k]>100)throw new Error(k);
 if(p.accelerated+p.network+p.storage>100+1e-9)throw new Error('allocation');
 for(const k of ['gpuCost','asicCost','cpuCost','edgeGbps','switchUtil'])if(p[k]<=0)throw new Error(k);
 if(p.switchUtil>100||![400,800,1600].includes(p.edgeGbps))throw new Error('edgeGbps');
}
function estimate(p,mode='increment'){
 validate(p);if(!['increment','annual'].includes(mode))throw new Error('mode');
 const pct=n=>n/100,headline=mode==='annual'?p.next:p.next-p.old,effective=headline*(mode==='annual'?1:pct(p.volume));
 const dc=effective*1e9*pct(p.dc),it=dc*pct(p.it),acc=it*pct(p.accelerated),net=it*pct(p.network),storage=it*pct(p.storage),cpu=it-acc-net-storage;
 const gpuBudget=acc*pct(p.gpuMix),asicBudget=acc-gpuBudget,gpu=gpuBudget/p.gpuCost,asic=asicBudget/p.asicCost,cpuServers=cpu/p.cpuCost,gpuServers=gpu/8;
 const bw=gpu*p.gpuGbps+asic*p.asicGbps,edgeLinks=bw/p.edgeGbps,upBw=bw*pct(p.uplink);
 const edgeOpt=2*edgeLinks*pct(p.edgeOptical),up800=2*upBw*(1-pct(p.up1600))/800,up1600=2*upBw*pct(p.up1600)/1600;
 const module400=p.edgeGbps===400?edgeOpt:0,module800=(p.edgeGbps===800?edgeOpt:0)+up800,module1600=(p.edgeGbps===1600?edgeOpt:0)+up1600;
 const aecCables=edgeLinks*(1-pct(p.edgeOptical))*pct(p.aecAttach),aecDsps=2*aecCables;
 // Two tiers: leaf downlinks B, leaf uplinks uB, spine downlinks uB; one switch ASIC per chassis equivalent.
 const switchChips=bw*(1+2*pct(p.uplink))*pct(p.ethernet)/(51200*pct(p.switchUtil));
 const product=(id,market,share,asp)=>({id,market,share,units:market*pct(share),asp,value:market*pct(share)*asp});
 const products=[product('dsp400',module400*pct(p.dspAttach),p.opticalShare,p.dsp800Asp*.6),product('dsp800',module800*pct(p.dspAttach),p.opticalShare,p.dsp800Asp),product('dsp1600',module1600*pct(p.dspAttach),p.opticalShare,p.dsp1600Asp),product('aec',aecDsps,p.aecShare,p.aecAsp),product('switch',switchChips,p.switchShare,p.switchAsp),product('custom',asic,p.customShare,p.customAsp)];
 const networkBom=module400*p.module800Cost*.6+module800*p.module800Cost+module1600*p.module1600Cost+aecCables*p.aecCost+switchChips*p.switchCost;
 return{headline,effective,costAllocation:(headline-effective)*1e9,dc,it,acc,net,storage,cpu,gpuBudget,asicBudget,gpu,asic,cpuServers,gpuServers,bw,edgeLinks,upBw,module400,module800,module1600,modules:module400+module800+module1600,aecCables,aecDsps,switchChips,products,value:products.reduce((s,x)=>s+x.value,0),networkBom,networkHeadroom:net-networkBom,networkCoverage:networkBom===0?null:net/networkBom};
}
function scenarios(p,mode){
 const make=high=>estimate({...p,it:Math.max(0,Math.min(100,p.it+(high?10:-10))),accelerated:Math.max(0,Math.min(100-p.network-p.storage,p.accelerated+(high?10:-10))),gpuCost:p.gpuCost*(high?.8:1.2),asicCost:p.asicCost*(high?.8:1.2)},mode);
 return[make(false),estimate(p,mode),make(true)];
}
const api={sources,companies,common,validate,estimate,scenarios};
if(typeof module==='object'&&module.exports)module.exports=api;else root.CapexDemand=api;
})(typeof globalThis==='object'?globalThis:this);

