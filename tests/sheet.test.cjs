const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'..');
const dataRoot=path.resolve(root,'../..');
const app=process.env.FOUNDRY_APP_PATH || path.resolve(root,'../../../../../foundry-nodejs-v14');
const req=createRequire(path.join(app,'package.json'));
const H=req('handlebars').create();
const postcss=req('postcss');
const {parseDocument}=req('htmlparser2');
const dom=req('domutils');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const lookup=(o,p)=>p.split('.').reduce((v,k)=>v?.[k],o);
const de=JSON.parse(fs.readFileSync(path.join(dataRoot,'systems/dsa5/lang/de.json')));
const own=JSON.parse(read('lang/de.json'));
const missing=new Set();
const localize=key=>{if(typeof key!=='string')return '';const value=lookup(own,key)??lookup(de,key);if(value===undefined && !key.startsWith('TYPES.Item.'))missing.add(key);return value??key;};
H.registerHelper('localize',localize);
H.registerHelper('getAttr',(a,b,c)=>a.system.characteristics[b][c]);
H.registerHelper('attrAbbr',ch=>localize('CHARAbbrev.'+ch.toUpperCase()));
H.registerHelper('concat',(...args)=>args.slice(0,-1).join(''));
H.registerHelper('concatUp',(...args)=>args.slice(0,-1).join('').toUpperCase().replace(/^CHARABBREV/,'CHARAbbrev'));
const magicTraditionIcons=['animisten','druiden','elfen','geoden','gildenmagier','hexen','magiedilettanten','scharlatane','zauberalchimisten','zauberbarden','zaubertaenzer','zibiljas'];
const godIcons=['Achaz','Angrosch','Aves','Boron','Brazoragh','Chrssirssr','Efferd','Ferkina','Firun','Fjarninger','Gjalsker','Gravesh','Hesinde','Hszint','Ifirn','Ingerimm','Kor','Namenloser','Nandus','Nivesen','Peraine','Phex','Praios','Rahja','Rikai','Rondra','Shinxir','Swafnir','Tahaya','Tairach','Travia','Trollzacker','Tsa','Zsahh','levthan','marbo','numinoru'];
const findTraditionIcon=(text,names,folder)=>{if(!text)return '';const lower=String(text).toLowerCase();const hit=names.find(n=>lower.includes(n.toLowerCase()));return hit?`systems/dsa5/icons/${folder}/${hit}.webp`:'';};
for(const [key,fn]of Object.entries({eq:(a,b)=>a===b,ne:(a,b)=>a!==b,gt:(a,b)=>a>b,gte:(a,b)=>a>=b,lte:(a,b)=>a<=b,not:a=>!a,and:(...a)=>a.slice(0,-1).every(Boolean),or:(...a)=>a.slice(0,-1).some(Boolean),ifThen:(c,a,b)=>c?a:b,roman:()=>'',joinStr:(separator,values)=>(values??[]).join(separator),specCategoryHelp:()=>'',dsa5hFormatNum:v=>String(v??0),dsa5hPercent:(v,m)=>m?Math.max(0,Math.min(100,v/m*100)):0,dsa5hCharacteristics:i=>[1,2,3].map(n=>i.system['characteristic'+n]?.value).filter(Boolean),dsa5hTraditionIcon:(text,kind)=>findTraditionIcon(text,kind==='religion'?godIcons:magicTraditionIcons,kind==='religion'?'months':'traditionen')}))H.registerHelper(key,fn);
H.registerHelper('formInput',(field,options)=>{
 assert(field?.path,'formInput received an undefined schema field');
 const {value,disabled}=options.hash;return new H.SafeString('<input name="'+field.path+'" value="'+H.escapeExpression(value??'')+'"'+(disabled?' disabled':'')+'>');
});
H.registerHelper('selectOptions',()=>new H.SafeString('<option>Test</option>'));
const modulePaths=['templates/actors/dsa5-helpers-character-sheet.hbs',...fs.readdirSync(path.join(root,'templates/actors/parts')).filter(f=>f.endsWith('.hbs')).map(f=>'templates/actors/parts/'+f)];
for(const p of modulePaths)H.registerPartial('modules/dsa5-helpers/'+p,read(p));
for(const p of ['companions/actor-companion','companions/companion-card','parts/member-card-header','parts/horse']) H.registerPartial('systems/dsa5/templates/actors/'+p+'.hbs',fs.readFileSync(path.join(dataRoot,'systems/dsa5/templates/actors/'+p+'.hbs'),'utf8'));
const render=H.compile(read(modulePaths[0]));
const valueField=v=>({value:v});
function item(id,type='skill') {return {_id:id,id,name:'Test '+id,img:'icons/svg/d20.svg',type,attack:13,parry:8,damagedie:'1d6',damageAdd:'+2',structureMax:10,structureCurrent:7,system:{characteristic1:valueField('mu'),characteristic2:valueField('ge'),characteristic3:valueField('kk'),talentValue:valueField(7),burden:valueField('yes'),quantity:valueField(2),preparedWeight:1,step:valueField(1),maxRank:valueField(3),max:valueField(3),guidevalue:valueField('ge'),weapontype:valueField(0),attack:valueField(12),parry:valueField(6),combatskill:valueField('Swords'),reach:valueField('medium'),AsPCost:valueField('4'),castingTime:valueField('2'),range:valueField('8'),equipmentType:valueField('tools'),worn:valueField(true),protection:valueField(3),calculatedEncumbrance:1,capacity:15,bagweight:2,talent:{value:'Test skill',value2:'Other',value3:'Third'},interval:valueField('1 h'),usedTestCount:valueField(1),allowedTestCount:valueField(7),cummulatedQS:valueField(3)}};}
function fixture() {
 const skills=[item('skill')],spell=item('spell','spell'),weapon=item('weapon','meleeweapon'),armor=item('armor','armor'),bag=item('bag','equipment');bag.children=[item('bag-child','equipment')];bag.children[0].system.weight=valueField(0.75);bag.system.equipmentType.value='bags';bag.system.capacity=10;
 const tradition=item('tradition','specialability');tradition.name='Tradition (Gildenmagier)';tradition.system.category={value:'magical'};
 // Foundry's EmbeddedCollection is a Map with Array-style helpers — find() is what the sheet uses.
 const items=Object.assign(new Map([skills[0],spell,weapon,armor,bag,tradition,...bag.children].map(i=>[i._id,i])),{find(fn){return [...this.values()].find(fn);}});
 const status=Object.fromEntries(['wounds','astralenergy','karmaenergy','fatePoints','soulpower','toughness','dodge','initiative','speed'].map(k=>[k,{value:10,current:10,max:20,modifier:0,advances:0,initial:5}]));status.size=valueField('average');
 const system={status,characteristics:Object.fromEntries(['mu','kl','in','ch','ff','ge','ko','kk'].map(k=>[k,valueField(13)])),sheetLocked:valueField(false),details:{experience:{current:100,total:1000,spent:900},biography:valueField('Public biography'),notes:{value:'Notes',ownerdescription:'OWNER_SECRET',gmdescription:'GM_SECRET'}},temperature:{coldProtection:0,heatProtection:0},repeatingEffects:{startOfRound:{},disabled:{}}};
 const prepare={allSkillsLeft:{body:skills,social:[],nature:[]},allSkillsRight:{knowledge:[],trade:[]},sortedSpecs:{general:['general'],combat:['Combat'],magical:[],clerical:[]},specAbs:{general:[item('general','specialability')],Combat:[item('combat','specialability')]},advantages:[],disadvantages:[],mentalAttrs:['mu','kl','in','ch'],bodyAttrs:['ff','ge','ko','kk'],canAdvance:true,sheetLocked:false,schips:[{value:1,cssClass:''}],magic:{hasSpells:true,hasPrayers:true,spellList:[spell],ritualList:[],liturgy:[item('liturgy','liturgy')],ceremony:[]},wornMeleeWeapons:[weapon],wornRangedWeapons:[],wornArmor:[armor],combatskills:[item('combatskill','combatskill')],brawling:{attack:12,parry:6},inventory:{bags:{show:true,items:[bag]},tools:{show:true,dataType:'equipment',items:[item('tool','equipment')]}},money:{coins:[item('coin','money')]},aggregatedtests:[item('aggregate','aggregatedTest')],diseases:[item('disease','disease')],itemModifiers:{Attack:{value:1,sources:['Test source']}}};
 const context={prepare,document:{name:'Test Hero',img:'icons/svg/mystery-man.svg',system},owner:true,editable:true,isGM:true,conditions:[{_id:'effect',name:'CONDITION.inpain',value:1,img:'icons/svg/aura.svg',editable:true,manual:1}],cumulativeConditions:[],transferedConditions:[],manualConditions:[],enrichedBiography:'Public biography',enrichedOwnerdescription:'OWNER_SECRET',enrichedGmdescription:'GM_SECRET',companionSections:[],hasCompanions:false};
 context.fields={name:{path:'name'}};context.systemFields={};
 // Explicit paths are cross-checked against the installed system templates in a separate test.
 for(const source of modulePaths.map(read))for(const match of source.matchAll(/systemFields\.([\w.]+)/g)) {const parts=match[1].split('.');let target=context.systemFields;for(const p of parts)target=target[p]??={};target.path='system.'+parts.filter(p=>p!=='fields').join('.');}
 const actor={system,items,isOwner:true,getFlag:()=>['skill','weapon','missing'],async setFlag(scope,key,value){this.saved={scope,key,value};}};
 return {context,actor};
}
let Sheet;
async function loadSheet(){if(Sheet)return Sheet;global.game={i18n:{localize},settings:{get:()=> 'light'}};global.dsa5={sheets:{ActorSheetdsa5Character:class{async _prepareContext(){return this.context;}showLimited(){return !!this.limited;}async prepareCompanionTab(){this.companionPrepared=true;}}}};({Dsa5HelpersCharacterSheet:Sheet}=await import('data:text/javascript;base64,'+Buffer.from(read('scripts/sheets/dsa5-helpers-character-sheet.js')).toString('base64')));return Sheet;}
async function prepare(){const C=await loadSheet(),f=fixture(),sheet=new C();Object.assign(sheet,{context:f.context,actor:f.actor,isEditable:true});return {sheet,context:await sheet._prepareContext({}),actor:f.actor};}
function elements(html,predicate){return dom.findAll(predicate,parseDocument(html).children);}
test('all templates and CSS parse',()=>{for(const p of modulePaths)H.precompile(read(p));postcss.parse(read('styles/dsa5-helpers-character-sheet.css'));});
test('full hero renders all ten tabs, real item bindings and no duplicate form names',async()=>{const {context}=await prepare();const html=render(context);const panels=elements(html,el=>el.attribs?.['data-tab-panel']);assert.equal(panels.length,10);assert(html.includes('data-action="rollAggregatedProbe"'));assert(html.includes('data-which="3"'));assert(!html.includes('data-item-id="bag-child"'),'bag contents belong to the DSA5 item sheet, not a sheet-side dialog');assert(html.includes('OWNER_SECRET'));assert(html.includes('GM_SECRET'));const names=elements(html,el=>el.attribs?.name).map(el=>el.attribs.name);assert.equal(names.length,new Set(names).size,'duplicate form field names');assert(!html.includes('TabInProgress'));});
test('limited rendering excludes private actor data',async()=>{const {sheet}=await prepare();sheet.limited=true;const context=await sheet._prepareContext({});const html=render(context);assert(!html.includes('OWNER_SECRET'));assert(!html.includes('GM_SECRET'));assert(!html.includes('data-tab-panel'));assert(html.includes('Public biography'));assert.equal(Sheet.LIMITEDPARTS,Sheet.PARTS);});
test('observer and player views exclude GM and owner notes appropriately',async()=>{const {context}=await prepare();context.isGM=false;let html=render(context);assert(!html.includes('GM_SECRET'));assert(html.includes('OWNER_SECRET'));context.owner=false;context.editable=false;context.dsa5h.editMode=false;html=render(context);assert(!html.includes('OWNER_SECRET'));assert(!html.includes('GM_SECRET'));assert(!html.includes('data-action="dsa5hFavorite"'));});
test('notes editors and coin inputs follow the real ApplicationV2 context flag "editable"',async()=>{const {context}=await prepare();delete context.isEditable;context.editable=true;let html=render(context);const coin=()=>elements(html,el=>el.attribs?.class==='money-change')[0];const editors=()=>elements(html,el=>['system.details.biography.value','system.details.notes.value','system.details.notes.ownerdescription','system.details.notes.gmdescription'].includes(el.attribs?.name));assert(coin());assert(!('disabled' in coin().attribs));assert.equal(editors().length,4);assert(editors().every(el=>!('disabled' in el.attribs)));context.editable=false;html=render(context);assert('disabled' in coin().attribs);assert(editors().every(el=>'disabled' in el.attribs));});
test('play mode disables FW correction, preserves rolls',async()=>{const {sheet}=await prepare();sheet.context.prepare.sheetLocked=true;sheet.context.prepare.canAdvance=false;const context=await sheet._prepareContext({});const html=render(context);const values=elements(html,el=>el.attribs?.class==='skill-advances');assert(values.length);assert(values.every(el=>Object.hasOwn(el.attribs,'disabled')));assert(html.includes('data-action="skillSelect"'));assert(!html.includes('data-fct="_advanceItem"'));});
test('favorites use actor flags, remove missing items and enforce ownership',async()=>{const {sheet,actor,context}=await prepare();assert.equal(context.dsa5h.favorites.missing,undefined);assert.equal(context.dsa5h.favoriteGroups.length,2);await Sheet.DEFAULT_OPTIONS.actions.dsa5hFavorite.call(sheet,{}, {dataset:{itemId:'skill'}});assert.deepEqual(actor.saved.value,['weapon']);delete actor.saved;sheet.isEditable=false;await Sheet.DEFAULT_OPTIONS.actions.dsa5hFavorite.call(sheet,{}, {dataset:{itemId:'spell'}});assert.equal(actor.saved,undefined);});
test('empty character still renders every tab',async()=>{const {sheet}=await prepare();sheet.context.prepare={};sheet.context.conditions=[];const html=render(await sheet._prepareContext({}));assert.equal(elements(html,el=>el.attribs?.['data-tab-panel']).length,10);assert(html.includes(localize('DSA5HELPERS.NoFavorites')));});
test('companion context is prepared for the custom root',async()=>{const {sheet}=await prepare();assert(sheet.companionPrepared);});
test('every static action exists in module, Foundry or DSA5 action tables',()=>{const sources=[read('scripts/sheets/dsa5-helpers-character-sheet.js'),...['actor/actor-sheet.js','actor/character-sheet.js','actor/companions/companion-handler-class.js'].map(p=>fs.readFileSync(path.join(dataRoot,'systems/dsa5/modules',p),'utf8')),fs.readFileSync(path.join(app,'client/applications/api/document-sheet.mjs'),'utf8')].join('\n');for(const p of modulePaths)for(const [,action]of read(p).matchAll(/data-action="([\w-]+)"/g))assert(new RegExp('\\b'+action+'\\s*:').test(sources),action+' has no registered handler');});
test('form field paths are present in installed system templates',()=>{const gather=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?gather(path.join(dir,e.name)):e.name.endsWith('.hbs')?[fs.readFileSync(path.join(dir,e.name),'utf8')]:[]);const refs=gather(path.join(dataRoot,'systems/dsa5/templates')).join('\n');for(const source of modulePaths.map(read))for(const [field]of source.matchAll(/systemFields\.[\w.]+/g))assert(refs.includes(field),'unverified system schema path: '+field);});
test('localization keys used by nonempty hero resolve',async()=>{missing.clear();const {context}=await prepare();render(context);const unresolved=[...missing].filter(k=>k && !['Swords','Test coin'].includes(k));assert.deepEqual(unresolved,[]);});

test('ranged weapons, charged magic, tradition items and companions render populated',async()=>{
 const {sheet}=await prepare();const p=sheet.context.prepare;
 const ranged=item('ranged','rangeweapon');ranged.LZ=3;ranged.progress=1;ranged.ammo=[{pickId:'ammo-id',name:'Bolts',selected:true}];p.wornRangedWeapons=[ranged];
 const spell=p.magic.spellList[0];spell.LZ=2;spell.progress=1;spell.extensions='Test extension';
 p.magic.ritualList=[item('ritual','ritual')];p.magic.ceremony=[item('ceremony','ceremony')];
 const artifact=item('staff','specialability');artifact.system.artifact='staff';artifact.abilities=[{...item('ability','specialability'),AEpayable:true,OnUseEffect:true}];p.traditionArtifacts=[artifact];
 sheet.context.companionSections=[{visible:true,label:'COMPANIONS.Companion',contents:[{uuid:'Actor.companion',name:'Companion',img:'icons/svg/pawprint.svg',system:sheet.actor.system,prepareCompanion:{}}]}];sheet.context.hasCompanions=true;
 const html=render(await sheet._prepareContext({}));assert(html.includes('data-ammo-id="ammo-id"'));assert(html.includes('data-action="chargeSpell"'));assert(html.includes('data-action="traditionPayCost"'));assert(html.includes('data-action="memberCardLink"'));assert(html.includes('Test extension'));
});
test('navigation rejects unknown tabs and preserves subtab selection',async()=>{
 const {sheet}=await prepare();const panel={dataset:{tabPanel:'combat'}};const sub={dataset:{subPanel:'combat:skills'}};const button={dataset:{parentTab:'combat',subtab:'skills'},classList:{toggle(_key,value){this.active=value;}},setAttribute(k,v){this[k]=v;}};
 sheet.element={dataset:{},querySelector(){return null;},querySelectorAll(selector){return selector==='[data-tab-panel]'?[panel]:selector==='[data-sub-panel]'?[sub]:selector==='[data-subtab]'?[button]:[];}};
 Sheet.DEFAULT_OPTIONS.actions.dsa5hSetTab.call(sheet,{}, {dataset:{tab:'invalid'}});assert.equal(sheet._currentTab,'cover');
 Sheet.DEFAULT_OPTIONS.actions.dsa5hSetTab.call(sheet,{}, {dataset:{tab:'combat'}});Sheet.DEFAULT_OPTIONS.actions.dsa5hSetSubTab.call(sheet,{},button);assert.equal(panel.hidden,false);assert.equal(sub.hidden,false);assert.equal(button['aria-pressed'],'true');await sheet._prepareContext({});assert.equal(sheet._subtabs.combat,'skills');
});
test('bags expose the category required by the inherited drop handler',async()=>{const {context}=await prepare();const html=render(context);const bag=elements(html,el=>el.attribs?.class==='item dsa5h-bag')[0];assert.equal(bag.attribs['data-category'],'bags');assert.equal(bag.attribs['data-item-id'],'bag');});
test('every item context-menu button has a .withContext target like the inherited _itemContextMenu expects',async()=>{const {context}=await prepare();const html=render(context);const hasWithContext=node=>(node.children??[]).some(c=>String(c.attribs?.class??'').split(/\s+/).includes('withContext')||hasWithContext(c));const buttons=elements(html,el=>el.attribs?.['data-action']==='itemContextMenu');assert(buttons.length);for(const el of buttons){let parent=el;while(parent&&!parent.attribs?.['data-item-id'])parent=parent.parent;assert(parent&&hasWithContext(parent),'itemContextMenu in item '+parent?.attribs?.['data-item-id']+' has no .withContext target');}});
test('rendered item actions resolve to an item or explicit advancement attribute',async()=>{const {context}=await prepare();const html=render(context);const actions=new Set(['itemEdit','itemContextMenu','skillSelect','chRollCombat','quantityClick','itemToggle','dsa5hEquip','rollAggregatedProbe','deleteItem','postItem','dsa5hFavorite']);for(const el of elements(html,el=>actions.has(el.attribs?.['data-action']))){let parent=el;while(parent&&!parent.attribs?.['data-item-id'])parent=parent.parent;assert(parent?.attribs?.['data-item-id'],el.attribs['data-action']+' has no item binding');}});
test('startup loads every referenced module partial and preserves inherited tab configuration',()=>{const entry=read('scripts/dsa5-helpers.js');for(const p of modulePaths)assert(entry.includes('modules/dsa5-helpers/'+p),p+' is not preloaded');assert(!/static TABS\s*=/.test(read('scripts/sheets/dsa5-helpers-character-sheet.js')));});
test('tradition pill opens the tradition special ability, bag tiles show a numeric fill level',async()=>{
 const {sheet,context}=await prepare();assert.deepEqual(context.dsa5h.traditionItems,{magical:'tradition',clerical:undefined});
 context.dsa5h.inventory[0].items[0].toggle=true;let html=render(context);assert(elements(html,el=>el.attribs?.['data-action']==='dsa5hEquip').length>0);assert.equal(Sheet.DEFAULT_OPTIONS.ownerActions.dsa5hEquip.buttons.join(),'0,2');
 assert.deepEqual(context.dsa5h.bags[0].dsa5hFill,{weight:1.5,capacity:10,over:false});assert(html.includes('1.5 / 10'));assert(html.includes('width:15%'));
 sheet.context.prepare.sheetLocked=true;html=render(await sheet._prepareContext({}));
 const pill=elements(html,el=>String(el.attribs?.class??'')==='dsa5h-tradition-name')[0];assert.equal(pill.attribs['data-item-id'],'tradition');assert.equal(pill.attribs['data-action'],'itemEdit');
});
test('conditions get named +/− buttons on status and cover, minus reuses the system handler with right-click semantics',async()=>{
 const {sheet}=await prepare();sheet.context.conditions=[{_id:'effect',name:'CONDITION.inpain',value:1,img:'icons/svg/aura.svg',editable:4,manual:1,descriptor:'inpain'}];
 const html=render(await sheet._prepareContext({}));
 const downs=elements(html,el=>el.attribs?.['data-action']==='dsa5hConditionDown');const ups=elements(html,el=>el.attribs?.['data-action']==='conditionValue');
 assert.equal(downs.length,2);assert.equal(ups.length,2);
 const inDescriptor=node=>{for(let n=node.parent;n;n=n.parent)if(n.attribs?.['data-descriptor']==='inpain')return true;return false;};
 for(const b of [...downs,...ups]){assert(inDescriptor(b),'stepper needs a [data-descriptor] ancestor for _conditionValue');assert(b.attribs['aria-label']);assert.equal(b.attribs['aria-disabled'],undefined);}
 assert(Sheet.DEFAULT_OPTIONS.ownerActions.dsa5hConditionDown);
 const calls=[];Sheet._conditionValue=function(ev,target){calls.push([this,ev.button,target]);};
 try{const target={};await Sheet.DEFAULT_OPTIONS.ownerActions.dsa5hConditionDown.call(sheet,{button:0},target);assert.deepEqual(calls,[[sheet,2,target]]);}finally{delete Sheet._conditionValue;}
 sheet.context.conditions[0].manual=0;sheet.context.conditions[0].value=4;const capped=render(await sheet._prepareContext({}));
 for(const action of ['dsa5hConditionDown','conditionValue'])for(const b of elements(capped,el=>el.attribs?.['data-action']===action))assert.equal(b.attribs['aria-disabled'],'true');
});
test('talent search spans all groups without marking one, "only improved" hides FW 0, both render their controls',async()=>{
 const {sheet,context}=await prepare();const html=render(context);
 assert.equal(elements(html,el=>el.attribs?.['data-action']==='dsa5hOnlyLearned' && el.attribs.role==='switch').length,1);
 assert.equal(elements(html,el=>el.attribs?.['data-talent-search-info']!==undefined).length,1);
 assert(elements(html,el=>String(el.attribs?.class??'').includes('dsa5h-skill-row item')).every(r=>r.attribs['data-fw']!==undefined));
 const row=(name,fw)=>({hidden:false,dataset:{fw:String(fw)},querySelector:()=>({textContent:name})});
 const grouped={};const mkPanel=(id,rows,inGroup=true)=>({hidden:true,dataset:{skillPanel:id},closest:()=>inGroup?grouped:null,querySelectorAll:()=>rows,querySelector:sel=>sel==='[data-only-learned-empty]'?(this_empty[id]??={hidden:true}):rows[0]});
 const this_empty={};
 const body=mkPanel('body',[row('Klettern',0),row('Fliegen',3)]),nature=mkPanel('nature',[row('Fährtensuchen',5)]),agg=mkPanel('aggregated',[],false);
 const info={hidden:true,querySelector:()=>info.text,text:{}};const filter={attrs:{},setAttribute(k,v){this.attrs[k]=v;},classList:{toggle(){}}};
 global.game.i18n.format=(k,d)=>k+':'+d.query;
 sheet.element={querySelectorAll:sel=>sel==='[data-skill-panel]'?[body,nature,agg]:[],querySelector:sel=>sel==='[data-talent-search-info]'?info:sel==='[data-action="dsa5hOnlyLearned"]'?filter:null};
 sheet._subtabs.skills='aggregated';sheet._search.talent='fähr';sheet._applyTalentSearch();
 assert.equal(body.hidden,true);assert.equal(nature.hidden,false);assert.equal(agg.hidden,true);assert.equal(info.hidden,false);
 sheet._search.talent='';sheet._subtabs.skills='body';Sheet.DEFAULT_OPTIONS.actions.dsa5hOnlyLearned.call(sheet);
 assert.equal(body.hidden,false);assert.deepEqual(body.querySelectorAll().map(r=>r.hidden),[true,false]);assert.equal(filter.attrs['aria-checked'],'true');assert.equal(info.hidden,true);assert.equal(agg.hidden,true);
});
