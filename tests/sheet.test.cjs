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
// Wie Foundrys {{localize}}: Hash-Argumente ersetzen {platzhalter} (game.i18n.format).
H.registerHelper('localize',(key,options)=>{const text=localize(key);const hash=options?.hash??{};return Object.keys(hash).length?String(text).replace(/\{(\w+)\}/g,(m,k)=>hash[k]??m):text;});
H.registerHelper('getAttr',(a,b,c)=>a.system.characteristics[b][c]);
H.registerHelper('attrAbbr',ch=>localize('CHARAbbrev.'+ch.toUpperCase()));
H.registerHelper('concat',(...args)=>args.slice(0,-1).join(''));
H.registerHelper('concatUp',(...args)=>args.slice(0,-1).join('').toUpperCase().replace(/^CHARABBREV/,'CHARAbbrev'));
const magicTraditionIcons=['animisten','druiden','elfen','geoden','gildenmagier','hexen','magiedilettanten','scharlatane','zauberalchimisten','zauberbarden','zaubertaenzer','zibiljas'];
const godIcons=['Achaz','Angrosch','Aves','Boron','Brazoragh','Chrssirssr','Efferd','Ferkina','Firun','Fjarninger','Gjalsker','Gravesh','Hesinde','Hszint','Ifirn','Ingerimm','Kor','Namenloser','Nandus','Nivesen','Peraine','Phex','Praios','Rahja','Rikai','Rondra','Shinxir','Swafnir','Tahaya','Tairach','Travia','Trollzacker','Tsa','Zsahh','levthan','marbo','numinoru'];
const findTraditionIcon=(text,names,folder)=>{if(!text)return '';const lower=String(text).toLowerCase();const hit=names.find(n=>lower.includes(n.toLowerCase()));return hit?`systems/dsa5/icons/${folder}/${hit}.webp`:'';};
for(const [key,fn]of Object.entries({eq:(a,b)=>a===b,ne:(a,b)=>a!==b,gt:(a,b)=>a>b,gte:(a,b)=>a>=b,lte:(a,b)=>a<=b,not:a=>!a,and:(...a)=>a.slice(0,-1).every(Boolean),or:(...a)=>a.slice(0,-1).some(Boolean),ifThen:(c,a,b)=>c?a:b,roman:()=>'',joinStr:(separator,values)=>(values??[]).join(separator),specCategoryHelp:()=>'',dsa5hFormatNum:v=>String(v??0),dsa5hInitial:t=>String(t??'').trim().charAt(0).toUpperCase(),dsa5hPercent:(v,m)=>m?Math.max(0,Math.min(100,v/m*100)):0,dsa5hCharacteristics:i=>[1,2,3].map(n=>i.system['characteristic'+n]?.value).filter(Boolean),dsa5hTraditionIcon:(text,kind)=>findTraditionIcon(text,kind==='religion'?godIcons:magicTraditionIcons,kind==='religion'?'months':'traditionen')}))H.registerHelper(key,fn);
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
 const actor={system,items,isOwner:true,flags:{favorites:['skill','weapon','missing']},getFlag(_scope,key){return this.flags[key];},async setFlag(scope,key,value){this.saved={scope,key,value};}};
 return {context,actor};
}
let Sheet;
// data:-URLs, weil die Modul-.js hier sonst als CommonJS gälten; der eine relative Import wird mit ersetzt.
const dataUrl=code=>'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
async function loadSheet(){if(Sheet)return Sheet;global.ResizeObserver??=class{observe(){}};global.document??={fonts:{ready:Promise.resolve()}};global.game={i18n:{localize},settings:{get:()=> 'light'}};global.dsa5={sheets:{ActorSheetdsa5Character:class{tabGroups={};_getHeaderControls(){return [{action:'system'}];}async _prepareContext(){return this.context;}showLimited(){return !!this.limited;}async prepareCompanionTab(){this.companionPrepared=true;}}}};({Dsa5HelpersCharacterSheet:Sheet}=await import(dataUrl(read('scripts/sheets/dsa5-helpers-character-sheet.js').replace("'../compat/steigerungsplaner.js'",JSON.stringify(dataUrl(read('scripts/compat/steigerungsplaner.js')))))));return Sheet;}
async function prepare(){const C=await loadSheet(),f=fixture(),sheet=new C();Object.assign(sheet,{context:f.context,actor:f.actor,isEditable:true});return {sheet,context:await sheet._prepareContext({}),actor:f.actor};}
function elements(html,predicate){return dom.findAll(predicate,parseDocument(html).children);}
test('all templates and CSS parse',()=>{for(const p of modulePaths)H.precompile(read(p));postcss.parse(read('styles/dsa5-helpers-character-sheet.css'));});
test('full hero renders all ten tabs, real item bindings and no duplicate form names',async()=>{const {context}=await prepare();const html=render(context);const panels=elements(html,el=>el.attribs?.['data-tab-panel']);assert.equal(panels.length,10);assert(html.includes('data-action="rollAggregatedProbe"'));assert(html.includes('data-which="3"'));assert(!html.includes('data-item-id="bag-child"'),'bag contents belong to the DSA5 item sheet, not a sheet-side dialog');assert(html.includes('OWNER_SECRET'));assert(html.includes('GM_SECRET'));const names=elements(html,el=>el.attribs?.name).map(el=>el.attribs.name);assert.equal(names.length,new Set(names).size,'duplicate form field names');assert(!html.includes('TabInProgress'));});
test('limited rendering excludes private actor data',async()=>{const {sheet}=await prepare();sheet.limited=true;const context=await sheet._prepareContext({});const html=render(context);assert(!html.includes('OWNER_SECRET'));assert(!html.includes('GM_SECRET'));assert(!html.includes('data-tab-panel'));assert(html.includes('Public biography'));assert.equal(Sheet.LIMITEDPARTS,Sheet.PARTS);});
test('observer and player views exclude GM and owner notes appropriately',async()=>{const {context}=await prepare();context.isGM=false;let html=render(context);assert(!html.includes('GM_SECRET'));assert(html.includes('OWNER_SECRET'));context.owner=false;context.editable=false;context.dsa5h.editMode=false;html=render(context);assert(!html.includes('OWNER_SECRET'));assert(!html.includes('GM_SECRET'));assert(!html.includes('data-action="dsa5hFavorite"'));});
test('Heldenname (#25): Tooltip im Spielmodus, Schrift wird bis 22px eingepasst, danach „…“',async()=>{
 const {sheet,context}=await prepare();const h1=html=>elements(html,el=>el.attribs?.class==='dsa5h-name')[0];
 context.dsa5h.editMode=false;assert(h1(render(context)).attribs['data-tooltip']);context.dsa5h.editMode=true;assert(!('data-tooltip' in h1(render(context)).attribs));
 assert(/\.dsa5h-name input \{[^}]*text-overflow: ellipsis/.test(read('styles/dsa5-helpers-character-sheet.css')));
 const savedStyle=global.getComputedStyle;sheet._nameCanvas={getContext:()=>({measureText:text=>({width:text.length*20})})};global.getComputedStyle=()=>({fontSize:'39px',fontWeight:'400',fontFamily:'Andalus'});
 const fit=(value,clientWidth)=>{let size;const heading={style:{removeProperty(){size=undefined;},set fontSize(v){size=v;}},querySelector:()=>({value,placeholder:'',clientWidth})};sheet.element={querySelector:()=>heading};sheet._fitName();return size;};
 try{assert.equal(fit('Kurz',400),undefined,'short name keeps the CSS size');assert.equal(fit('x'.repeat(20),300),'29px');assert.equal(fit('x'.repeat(30),300),'22px','never below 22px');}
 finally{global.getComputedStyle=savedStyle;}
});
test('personal details are the first, default notes sub-tab (issue #26)',async()=>{const {sheet,context}=await prepare();const html=render(context);assert.deepEqual(context.dsa5h.subnav.find(n=>n.tab==='notes').items.slice(0,3).map(i=>i.id),['details','biography','notes']);assert.equal(sheet._subtabs.notes,'details');assert(!html.includes('dsa5h-notes-layout'));const panel=id=>elements(html,el=>el.attribs?.['data-sub-panel']==='notes:'+id)[0];assert(panel('details')&&!('hidden' in panel('details').attribs));assert('hidden' in panel('biography').attribs);assert.equal(elements(html,el=>el.name==='input'&&/^system\.details\.(gender|family|age|height|weight|Home|socialstate|haircolor|eyecolor|distinguishingmark)\.value$/.test(el.attribs?.name||'')).length,10);});
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
test('body sub-tab: hands from worn weapons, a two-handed main weapon hides the off hand, figure flag and cast dialogs',async()=>{
 const {sheet,actor}=await prepare();const p=sheet.context.prepare;
 const main=item('main','meleeweapon'),off=item('off','meleeweapon');main.system.worn={value:true,offHand:false};off.system.worn={value:true,offHand:true};
 p.wornMeleeWeapons=[main,off];p.wornRangedWeapons=[];actor.items.set('main',main);actor.items.set('off',off);
 let context=await sheet._prepareContext({});let html=render(context);
 assert(html.includes('data-sub-panel="combat:body"'));assert(context.dsa5h.subnav.find(n=>n.tab==='combat').items.some(i=>i.id==='body'));
 assert.equal(context.dsa5h.body.hands.length,2);assert(html.includes('data-dsa5h-hand="offhand"'));assert(html.includes('data-current="off"'));
 const offSelect=elements(html,el=>el.attribs?.['data-dsa5h-hand']==='offhand')[0];assert(!dom.findAll(el=>el.attribs?.value==='main'&&Object.hasOwn(el.attribs,'selected'),offSelect.children).length);
 assert.equal(elements(html,el=>String(el.attribs?.class??'').includes('dsa5h-die-seal')).length,4);
 assert(html.includes('data-action="dsa5hBodyFigure"'),'figure switch in edit mode');assert(html.includes('data-cast-dialog="spell"'));
 main.wieldedTwoHand=true;context=await sheet._prepareContext({});html=render(context);
 assert.equal(context.dsa5h.body.hands.length,1);assert(context.dsa5h.body.single);assert(!html.includes('data-dsa5h-hand="offhand"'));
 const mainOptions=context.dsa5h.body.hands[0].options;assert(mainOptions.find(o=>o.id==='main').twoHanded);
 context.dsa5h.editMode=false;assert(!render(context).includes('data-action="dsa5hBodyFigure"'),'figure switch only in edit mode');
 assert(elements(html,el=>el.name==='img'&&String(el.attribs?.class??'').includes('dsa5h-body-figure')&&el.attribs.src===context.dsa5h.body.figure).length===1,'figure is a real img, not a CSS url() variable');assert(!html.includes('--figure'));
 const armor=n=>Array.from({length:n},(_,i)=>{const a=item('a'+i,'armor');a.system.protection={value:1};a.system.calculatedEncumbrance=0;return a;});
 p.wornArmor=armor(2);context=await sheet._prepareContext({});html=render(context);assert(!context.dsa5h.body.armorTable);assert(!html.includes('dsa5h-body-armor-table'));assert(html.includes('dsa5h-body-armor-item'));
 p.wornArmor=armor(3);context=await sheet._prepareContext({});html=render(context);assert(context.dsa5h.body.armorTable,'table from three armor pieces');
 assert.equal(elements(html,el=>el.name==='tr'&&el.attribs?.['data-item-id']).length,3);assert(!html.includes('dsa5h-body-armor-item'));
 await Sheet.DEFAULT_OPTIONS.ownerActions.dsa5hBodyFigure.call(sheet,{}, {dataset:{figure:'portrait'}});assert.deepEqual(actor.saved,{scope:'dsa5-helpers',key:'bodyFigure',value:'portrait'});
});
test('navigation rejects unknown tabs and preserves subtab selection',async()=>{
 const {sheet}=await prepare();const panel={dataset:{tabPanel:'combat'}};const sub={dataset:{subPanel:'combat:skills'}};const button={dataset:{parentTab:'combat',subtab:'skills'},classList:{toggle(_key,value){this.active=value;}},setAttribute(k,v){this[k]=v;}};
 sheet.element={dataset:{},querySelector(){return null;},querySelectorAll(selector){return selector==='[data-tab-panel]'?[panel]:selector==='[data-sub-panel]'?[sub]:selector==='[data-subtab]'?[button]:[];}};
 Sheet.DEFAULT_OPTIONS.actions.dsa5hSetTab.call(sheet,{}, {dataset:{tab:'invalid'}});assert.equal(sheet._currentTab,'cover');
 Sheet.DEFAULT_OPTIONS.actions.dsa5hSetTab.call(sheet,{}, {dataset:{tab:'combat'}});Sheet.DEFAULT_OPTIONS.actions.dsa5hSetSubTab.call(sheet,{},button);assert.equal(panel.hidden,false);assert.equal(sub.hidden,false);assert.equal(button['aria-pressed'],'true');await sheet._prepareContext({});assert.equal(sheet._subtabs.combat,'skills');
 Sheet.DEFAULT_OPTIONS.actions.dsa5hSetTab.call(sheet,{}, {dataset:{tab:'companion'}});assert.equal(sheet.tabGroups.sheet,'companion','inherited _onDropActor recognises the companion tab via tabGroups.sheet (#15)');
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
test('talent search spans all groups without marking one, Sammelproben are part of the list, "only improved" hides FW 0, both render their controls',async()=>{
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
 assert.equal(body.hidden,false);assert.equal(nature.hidden,false,'without a search all groups are listed');assert.deepEqual(body.querySelectorAll().map(r=>r.hidden),[true,false]);assert.equal(filter.attrs['aria-checked'],'true');assert.equal(info.hidden,true);assert.equal(agg.hidden,false,'Sammelproben follow the groups in the same scrolling list');
});
test('reload shows the system progress once, reset reuses the system handler with right-click semantics',async()=>{
 const {sheet}=await prepare();const p=sheet.context.prepare;
 const ranged=item('ranged','rangeweapon');ranged.LZ=3;ranged.progress='1/3';ranged.title='Ladestatus: 1/3';ranged.system.reloadTime={progress:1};p.wornRangedWeapons=[ranged];
 const html=render(await sheet._prepareContext({}));
 const load=elements(html,el=>el.attribs?.['data-action']==='loadWeapon');assert.equal(load.length,1);
 assert(!/1\/3\s*\/\s*3/.test(html),'progress must not repeat LZ');
 const resets=elements(html,el=>el.attribs?.['data-action']==='dsa5hReloadReset');assert.equal(resets.length,1);assert(resets[0].attribs['aria-label']);
 const calls=[];Sheet._loadWeapon=function(ev,target){calls.push([this,ev.button,target]);};
 try{const target={};await Sheet.DEFAULT_OPTIONS.ownerActions.dsa5hReloadReset.call(sheet,{button:0},target);assert.deepEqual(calls,[[sheet,2,target]]);}finally{delete Sheet._loadWeapon;}
 assert(Sheet.RIGHT_CLICK_ACTIONS.includes('[data-action="loadWeapon"]'));
 ranged.system.reloadTime.progress=0;assert.equal(elements(render(await sheet._prepareContext({})),el=>el.attribs?.['data-action']==='dsa5hReloadReset').length,0);
});
test('favorites render as grid cards with value, roll and star; weapon damage is a marked roll button everywhere',async()=>{
 const {context}=await prepare();const html=render(context);
 const cards=elements(html,el=>String(el.attribs?.class??'').split(' ').includes('dsa5h-fav-card'));assert.equal(cards.length,2);
 for(const card of cards){assert(card.attribs['data-item-id']);assert.equal(dom.findAll(el=>el.attribs?.['data-action']==='dsa5hFavorite',card.children).length,1);}
 const damage=elements(html,el=>el.attribs?.['data-mode']==='damage');assert(damage.length>=2);for(const b of damage)assert(String(b.attribs.class).includes('dsa5h-damage'));
});
test('aggregated tests can be added in play mode',async()=>{
 const {sheet}=await prepare();sheet.context.prepare.sheetLocked=true;const ctx=await sheet._prepareContext({});assert.equal(ctx.dsa5h.editMode,false);
 assert.equal(elements(render(ctx),el=>el.attribs?.['data-action']==='itemCreate' && el.attribs['data-type']==='aggregatedTest').length,1);
});
test('ammo row: selection inside a dropdown incl. "no ammunition", magazine count with swap button',async()=>{
 const {sheet}=await prepare();const p=sheet.context.prepare;
 const ranged=item('ranged','rangeweapon');ranged.LZ=2;ranged.progress='0/2';ranged.system.reloadTime={progress:0};ranged.ammo=[{pickId:'mag-id',name:'Magazin',count:'2',selected:true}];ranged.selectedAmmo={pickId:'mag-id',img:'x.webp',tooltip:'Magazin',count:'2'};ranged.clearAmmo={pickId:'clear',selected:false};ranged.ammoCurrent=10;ranged.ammoMax=10;p.wornRangedWeapons=[ranged];
 const html=render(await sheet._prepareContext({}));
 const picker=elements(html,el=>el.name==='details'&&String(el.attribs?.class).includes('dsa5h-ammo-pick'));assert.equal(picker.length,1);
 const picks=dom.findAll(el=>el.attribs?.['data-action']==='selectAmmo',picker[0].children).map(el=>el.attribs['data-ammo-id']);assert.deepEqual(picks,['mag-id','clear']);
 const swap=elements(html,el=>el.attribs?.['data-action']==='itemSwapMag');assert.equal(swap.length,1);assert.equal(swap[0].attribs['aria-disabled'],'true');assert(swap[0].attribs['aria-label']);
});
test('AP total/spent editable only in edit mode; combat skill search and two-column status render',async()=>{
 const {sheet,context}=await prepare();const html=render(context);
 const names=elements(html,el=>el.attribs?.name).map(el=>el.attribs.name);
 assert(names.includes('system.details.experience.total'));assert(names.includes('system.details.experience.spent'));
 assert.equal(elements(html,el=>String(el.attribs?.class).includes('combatSkillSearch')).length,1);
 assert(elements(html,el=>String(el.attribs?.class).split(' ').includes('dsa5h-two-col')).length>=3);
 sheet.context.prepare.sheetLocked=true;const play=render(await sheet._prepareContext({}));
 assert(!elements(play,el=>el.attribs?.name==='system.details.experience.total').length);
});
test('OnUse die button (issue #9): same system action on weapons, armor, body tab, chips, inventory and tradition items',async()=>{
 const {sheet}=await prepare();const p=sheet.context.prepare;
 const main=item('main','meleeweapon');main.OnUseEffect=true;main.system.worn={value:true,offHand:false};p.wornMeleeWeapons=[main];p.wornRangedWeapons=[];sheet.actor.items.set('main',main);
 const armor=item('armor2','armor');armor.OnUseEffect=true;armor.system.protection={value:1};p.wornArmor=[armor];
 p.specAbs.general[0].OnUseEffect=true;
 const html=render(await sheet._prepareContext({}));
 const buttons=elements(html,el=>el.attribs?.['data-action']==='onUseItem');
 for(const b of buttons){assert(String(b.attribs.class).includes('dsa5h-onuse'));assert(b.attribs['aria-label']);assert(!dom.textContent(b).includes('▶'));}
 const owners=new Set(buttons.map(b=>{let n=b.parent;while(n&&!n.attribs?.['data-item-id'])n=n.parent;return n?.attribs['data-item-id'];}));
 for(const id of ['main','armor2','general'])assert(owners.has(id),'onUse button inside [data-item-id='+id+']');
 assert(buttons.length>=5,'weapon row, overview armor, body armor, body hand, chip');
});
test('aim progress (issue #8) shows only once the weapon is aimed, with the system texts',async()=>{
 const {sheet}=await prepare();const p=sheet.context.prepare;
 const ranged=item('ranged','rangeweapon');ranged.LZ=2;ranged.progress='2/2';ranged.system.reloadTime={progress:2};ranged.system.aimTime={progress:0};p.wornRangedWeapons=[ranged];
 let html=render(await sheet._prepareContext({}));assert(!html.includes('dsa5h-aim'));
 ranged.system.aimTime.progress=1;ranged.aimProgress='1/2';ranged.aimTitle='Zielen (1/2)';html=render(await sheet._prepareContext({}));
 const aim=elements(html,el=>String(el.attribs?.class??'').split(' ').includes('dsa5h-aim'));assert.equal(aim.length,1);assert(dom.textContent(aim[0]).includes('1/2'));assert.equal(aim[0].attribs['data-tooltip'],'Zielen (1/2)');assert(!aim[0].attribs.class.includes('dsa5h-aim-done'));
 ranged.system.aimTime.progress=2;html=render(await sheet._prepareContext({}));assert(elements(html,el=>String(el.attribs?.class??'').includes('dsa5h-aim-done')).length===1);
});
test('aggregated tests show dice and FW of the referenced skill and still roll via rollAggregatedProbe',async()=>{
 const {sheet}=await prepare();const p=sheet.context.prepare;
 const agg=item('agg','aggregatedTest');agg.system.talent={value:'Test skill',value2:'Unknown skill'};agg.system.interval=valueField('1h');agg.system.usedTestCount=valueField(1);agg.system.allowedTestCount=valueField(7);agg.system.cummulatedQS=valueField(3);p.aggregatedtests=[agg];
 const context=await sheet._prepareContext({});assert.equal(context.dsa5h.aggregated[0].talents.length,2);assert.equal(context.dsa5h.aggregated[0].talents[0].skill?._id,'skill');
 const html=render(context);const rolls=elements(html,el=>el.attribs?.['data-action']==='rollAggregatedProbe');assert.equal(rolls.length,2);
 assert.equal(rolls[0].attribs['data-which'],'');assert(String(rolls[0].attribs.class).includes('dsa5h-skill-probe'));assert.equal(dom.findAll(el=>String(el.attribs?.class??'').includes('dsa5h-probe-die'),rolls[0].children).length,3);
 assert.equal(rolls[1].attribs['data-which'],'2');assert(elements(html,el=>el.attribs?.class==='dsa5h-aggregated-fw').length===1);
 assert(Sheet.FOCUS_KEYS.includes('which'));
});
test('base values: dodge and initiative rows, every base value name carries the system formula tooltip',async()=>{
 const {context}=await prepare();const html=render(context);
 for(const key of ['wounds','astralenergy','karmaenergy','fatePoints','soulpower','toughness','coldProtection','heatProtection','speed','sizeCategory','dodge','initiative','initDie','initDieMod'])assert(html.includes(`data-tooltip="FORMULA.${key}"`),key);
 assert(html.includes('name="system.status.dodge.modifier"'));assert(html.includes('name="system.status.initiative.modifier"'));assert.equal(context.dsa5h.initiative,10);
 // Initiativewürfel + Würfel-Mod nur im Bearbeiten-Modus (Nutzer 2026-09-30): Zeilen tragen .dsa5h-edit-only.
 for(const name of ['system.status.initiative.die','system.status.initiative.diemodifier']){const input=elements(html,el=>el.attribs?.name===name);assert.equal(input.length,1,name);let row=input[0];while(row&&!String(row.attribs?.class??'').split(' ').includes('row'))row=row.parent;assert(String(row.attribs.class).includes('dsa5h-edit-only'),name);}
});
test('weapons link their combat technique with KtW; the ranged hand on the body tab shows reload and magazine',async()=>{
 const {sheet,actor}=await prepare();const p=sheet.context.prepare;
 p.combatskills[0].name='Swords';
 const ranged=item('ranged','rangeweapon');ranged.LZ=2;ranged.progress='1/2';ranged.title='Ladestatus: 1/2';ranged.system.reloadTime={progress:1};ranged.system.aimTime={progress:0};ranged.system.worn={value:true,offHand:false};ranged.ammoCurrent=3;ranged.ammoMax=10;
 p.wornMeleeWeapons=[];p.wornRangedWeapons=[ranged];actor.items.set('ranged',ranged);
 let html=render(await sheet._prepareContext({}));
 const links=elements(html,el=>el.attribs?.['data-action']==='dsa5hJumpCombatSkill');
 assert.equal(links.length,2,'weapon row + hand');assert(links.every(l=>l.attribs['data-skill-id']==='combatskill'&&dom.textContent(l).includes('7')&&l.attribs['aria-label']));
 assert.equal(elements(html,el=>String(el.attribs?.class??'').includes('dsa5h-hand-ranged')).length,1);
 assert.equal(elements(html,el=>el.attribs?.['data-action']==='loadWeapon').length,2,'weapon row + hand');
 assert.equal(elements(html,el=>el.attribs?.['data-action']==='itemSwapMag').length,2,'weapon row + hand');
 p.combatskills[0].name='Other';html=render(await sheet._prepareContext({}));
 assert.equal(elements(html,el=>el.attribs?.['data-action']==='dsa5hJumpCombatSkill').length,0);assert(html.includes('<small>Swords</small>'),'plain technique name without a matching item');
});
test('body tab: a free off hand renders compactly below the main hand, its tile is the weapon picker',async()=>{
 const {sheet,actor}=await prepare();const p=sheet.context.prepare;
 const main=item('main','meleeweapon');main.system.worn={value:true,offHand:false};p.wornMeleeWeapons=[main];p.wornRangedWeapons=[];actor.items.set('main',main);
 let context=await sheet._prepareContext({});let html=render(context);
 assert(context.dsa5h.body.offFree);assert.equal(elements(html,el=>String(el.attribs?.class??'').includes('dsa5h-figure-hands off-free')).length,1);
 const free=elements(html,el=>String(el.attribs?.class??'').includes('dsa5h-hand-free'))[0];assert(free);
 const select=dom.findAll(el=>el.name==='select'&&el.attribs['data-dsa5h-hand']==='offhand',free.children);assert.equal(select.length,1);assert(select[0].attribs['aria-label']);
 const off=item('off','meleeweapon');off.system.worn={value:true,offHand:true};p.wornMeleeWeapons=[main,off];actor.items.set('off',off);
 context=await sheet._prepareContext({});html=render(context);assert(!context.dsa5h.body.offFree);assert(!html.includes('dsa5h-hand-free'));
});

test('character builder button replaces the species field only when the system allows building (issue #10)',async()=>{
 const {sheet}=await prepare();let html=render(await sheet._prepareContext({}));
 assert(!html.includes('data-action="startCharacterBuilder"'));assert(html.includes('name="system.details.species.value"'));
 sheet.context.prepare.canBuild=true;html=render(await sheet._prepareContext({}));
 assert(html.includes('data-action="startCharacterBuilder"'));assert(!html.includes('name="system.details.species.value"'));
 assert.equal(Sheet.DEFAULT_OPTIONS.ownerActions.startCharacterBuilder,Sheet._startCharacterBuilder);
});
test('frame listeners are re-attached when Foundry builds a new window element after close (drag via head)',async()=>{
 const {sheet,context}=await prepare();const base=Object.getPrototypeOf(Sheet.prototype);base._onRender??=async function(){};
 const frame=()=>{const types=[];return {types,dataset:{},classList:{toggle(){},add(){},remove(){},contains:()=>false},querySelector:()=>null,querySelectorAll:()=>[],addEventListener:t=>types.push(t)};};
 const first=frame();sheet.element=first;await sheet._onRender(context,{});await sheet._onRender(context,{});
 assert.equal(first.types.filter(t=>t==='pointerdown').length,1,'re-render of the same frame must not add listeners twice');
 const second=frame();sheet.element=second;await sheet._onRender(context,{});
 assert(second.types.includes('pointerdown'),'new frame after close/reopen lost the head drag listener');assert(second.types.includes('dblclick'),'double-click on the head minimizes like the system sheet');
});
test('patrons (own list prepare.patrons since DSA5 8.1.8) render on the magic tab only when present',async()=>{
 const {sheet}=await prepare();let html=render(await sheet._prepareContext({}));assert(!html.includes(localize('TYPES.Item.patron')));
 sheet.context.prepare.patrons=[{_id:'patron-1',name:'Katzenpatron',img:'icons/svg/cat.svg',system:{}}];html=render(await sheet._prepareContext({}));
 const chip=elements(html,el=>el.attribs?.['data-item-id']==='patron-1')[0];assert(chip,'patron chip missing');
 let panel=chip;while(panel&&!panel.attribs?.['data-tab-panel'])panel=panel.parent;assert.equal(panel?.attribs['data-tab-panel'],'magic');
});
const importChangelog=()=>import('data:text/javascript;base64,'+Buffer.from(read('scripts/apps/changelog.js')).toString('base64'));
// Vereinfachtes foundry.utils.isNewerVersion für reine x.y.z-Versionen.
const isNewer=(a,b)=>{const pa=a.split('.').map(Number),pb=b.split('.').map(Number);for(let i=0;i<3;i++)if((pa[i]||0)!==(pb[i]||0))return (pa[i]||0)>(pb[i]||0);return false;};
test('changelog splits the shipped CHANGELOG.md per version and filters unseen sections (issues #11/#12)',async()=>{
 const {parseChangelog,sectionsSince}=await importChangelog();
 const sections=parseChangelog(read('CHANGELOG.md'));const versions=sections.map(s=>s.version);
 assert(versions.includes('0.2.0')&&versions.includes('0.1.0'));assert(sections.every(s=>/^\d+\.\d+\.\d+$/.test(s.version)),'every heading is a version: '+versions);
 assert(!sections.some(s=>/^\[[^\]]+\]:/m.test(s.body)),'compare-link definitions are stripped');assert.equal(sections.find(s=>s.version==='0.2.0').date,'2026-09-30');
 const md='# Changelog\n\n## [0.3.0] — unveröffentlicht\n\n- c\n\n## [0.2.0] — 2026-09-30\n\n- b\n\n## [0.1.0] — 2026-09-29\n\n- a\n\n[0.2.0]: https://x\n';const all=parseChangelog(md);
 assert.deepEqual(sectionsSince(all,'0.1.0','0.2.0',isNewer).map(s=>s.version),['0.2.0'],'unreleased newer section stays hidden');
 assert.deepEqual(sectionsSince(all,'','0.2.0',isNewer).map(s=>s.version),['0.2.0','0.1.0'],'first install shows everything up to the installed version');
 assert.equal(all[2].body,'- a');
});
test('changelog window and settings: template, localization and registration order',()=>{
 missing.clear();const html=H.compile(read('templates/changelog.hbs'))({filtered:true,installed:'0.3.0',sections:[{version:'0.3.0',date:'2026-10-01',html:'<ul><li>x</li></ul>'}],url:'https://x'});
 assert(html.includes('data-action="showAll"'));assert(html.includes('<li>x</li>'));assert(!html.includes('data-action="jumpTo"'),'no version bar for a single section');
 const full=H.compile(read('templates/changelog.hbs'))({filtered:false,sections:[{version:'0.3.0',html:''},{version:'0.2.0',html:''}]});const details=elements(full,el=>el.name==='details');
 assert.equal(elements(full,el=>el.attribs?.['data-action']==='jumpTo').length,2);assert.deepEqual(details.map(d=>'open' in d.attribs),[true,false],'only the newest version starts open');assert.deepEqual([...missing],[]);
 const entry=read('scripts/dsa5-helpers.js');for(const key of ['defaultSheet','lastSeenVersion'])assert(entry.indexOf(`'${key}'`)<entry.indexOf('if (!Dsa5HelpersCharacterSheet)'),key+' must be registered even without the DSA5 sheet');
 assert(/makeDefault: game\.settings\.get\('dsa5-helpers', 'defaultSheet'\)/.test(entry));
 for(const lang of ['de','en']){const l=JSON.parse(read(`lang/${lang}.json`)).DSA5HELPERS;for(const k of ['Title','Open','Hint','Updated','ShowAll','OnGitHub','Missing','Versions'])assert(l.Changelog[k],lang+' Changelog.'+k);assert(l.Settings.DefaultSheet.Name&&l.Settings.DefaultSheet.Hint);}
});
test('Steigerungsplaner (#17): advanceWrapper is inherited, planner tab only with the planner module',async()=>{
 // Eigener ownerActions-Eintrag würde die Funktion vor dem libWrapper-Wrap des Planers festhalten (Shift-Klick steigert dann sofort).
 assert(!Object.hasOwn(Sheet.DEFAULT_OPTIONS.ownerActions,'advanceWrapper'));
 const {sheet,context}=await prepare();assert(!context.dsa5h.tabs.some(t=>t.id==='steigerungsplaner'));assert(!render(context).includes('steigerungsplaner-tab'));
 const plannerTemplate=path.join(dataRoot,'modules/dsa5-steigerungsplaner/templates/planner-tab.hbs');if(!fs.existsSync(plannerTemplate))return;
 const calls=[];const PlannerTab={async prepareContext(s,c){calls.push(s);c.plannerSections=[{label:'Körpertalente',cssClass:'body',groups:[{type:'item',key:'skill',label:'Test skill',icon:'x.webp',steps:[{id:'a',from:7,to:8,cost:2}]}]}];c.plannerTotalCost=2;c.plannerAvailableXP=100;return c;},attachListeners(){}};
 global.game.modules=new Map([['dsa5-steigerungsplaner',{active:true,api:{PlannerTab}}],['lib-wrapper',{active:true}]]);global.foundry={utils:{getRoute:p=>'/'+p},applications:{handlebars:{loadTemplates:async()=>{}}}};
 H.registerPartial('modules/dsa5-steigerungsplaner/templates/planner-tab.hbs',fs.readFileSync(plannerTemplate,'utf8'));
 try{
  await (await import(dataUrl(read('scripts/compat/steigerungsplaner.js')))).initSteigerungsplaner();
  const ctx=await sheet._prepareContext({});assert(ctx.dsa5h.tabs.some(t=>t.id==='steigerungsplaner'));assert.equal(calls[0],sheet);
  const html=render(ctx);const panel=elements(html,el=>el.attribs?.['data-tab-panel']==='steigerungsplaner')[0];assert(panel);
  assert(elements(html,el=>/\bsteigerungsplaner-tab\b/.test(el.attribs?.class??'')&&/\bactive\b/.test(el.attribs.class))[0],'planner template gets the active class');assert(html.includes('data-plan-apply'));
  sheet.actor.isOwner=false;assert(!(await sheet._prepareContext({})).dsa5h.tabs.some(t=>t.id==='steigerungsplaner'),'owners only');
 }finally{delete global.game.modules;delete global.foundry;}
});
test('Gefährten-Reiter (#21): je Held per Titelleisten-Menü aus-/einblendbar, nur für Owner',async()=>{
 const {sheet,actor,context}=await prepare();assert(context.dsa5h.tabs.some(t=>t.id==='companion'));
 const control=()=>sheet._getHeaderControls().find(c=>c.action==='dsa5hToggleCompanionTab');
 assert.equal(sheet._getHeaderControls()[0].action,'system','system controls stay');assert.equal(control().label,'DSA5HELPERS.CompanionTab.Hide');assert(localize(control().label)!==control().label);assert(control().visible.call(sheet));
 await Sheet.DEFAULT_OPTIONS.actions.dsa5hToggleCompanionTab.call(sheet);assert.deepEqual(actor.saved,{scope:'dsa5-helpers',key:'hideCompanionTab',value:true});
 actor.flags.hideCompanionTab=true;sheet._currentTab='companion';const hidden=await sheet._prepareContext({});assert(!hidden.dsa5h.tabs.some(t=>t.id==='companion'));assert.equal(sheet._currentTab,'cover');
 assert.equal(control().label,'DSA5HELPERS.CompanionTab.Show');assert(localize(control().label)!==control().label);
 delete actor.saved;actor.isOwner=false;assert(!control().visible.call(sheet));await Sheet.DEFAULT_OPTIONS.actions.dsa5hToggleCompanionTab.call(sheet);assert.equal(actor.saved,undefined);
});
test('Fensterrahmen (#22): eigene Rahmengrafik eingebunden, Ziehen am oberen Rahmenband und an freien Kopfstellen',async()=>{
 const css=read('styles/dsa5-helpers-character-sheet.css');assert(fs.existsSync(path.join(root,'styles/dsa5-helpers-frame.svg')),'run node tools/gen-frame.cjs');
 assert(/border-image: url\('dsa5-helpers-frame\.svg'\) 24 16 16 16/.test(css));assert(!css.includes('backgrounds/actor.webp'));
 assert(read('styles/dsa5-helpers-frame.svg').includes('tools/gen-frame.cjs'),'generated file header');
 const {sheet}=await prepare();const el={getBoundingClientRect:()=>({top:100})};sheet.element=el;global.getComputedStyle=()=>({borderTopWidth:'24px'});
 const node=(head,excluded)=>({closest:sel=>sel==='.dsa5h-head'?head:excluded});
 try{
  assert(sheet._isDragHandle({target:el,clientY:110}),'top frame band');assert(!sheet._isDragHandle({target:el,clientY:130}),'side/bottom border below the top band');
  assert(sheet._isDragHandle({target:node(true,null),clientY:300}),'free spot in the head');assert(!sheet._isDragHandle({target:node(true,{}),clientY:300}),'buttons in the head');assert(!sheet._isDragHandle({target:node(null,null),clientY:300}),'outside the head');
 }finally{delete global.getComputedStyle;}
});
test('Traditions-Badge (#23): Name und Symbol aus der Sonderfertigkeit, sonst aus dem Freitextfeld',async()=>{
 const {sheet}=await prepare();sheet.actor.system.tradition={magical:'',clerical:'Praioskirche'};sheet.context.prepare.sheetLocked=true;
 const context=await sheet._prepareContext({});
 assert.deepEqual(context.dsa5h.tradition.magical,{name:'Gildenmagier',fromItem:'Gildenmagier'},'tradition SF wins like in the system');
 assert.deepEqual(context.dsa5h.tradition.clerical,{name:'Praioskirche',fromItem:''},'free-text field without SF');
 const html=render(context);const names=elements(html,el=>el.attribs?.class==='dsa5h-tradition-name-text').map(el=>dom.textContent(el));
 assert.deepEqual(names,['Gildenmagier','Praioskirche']);
 const icons=elements(html,el=>el.attribs?.class==='dsa5h-tradition-icon').map(el=>el.attribs.src);
 assert(icons.includes('systems/dsa5/icons/traditionen/gildenmagier.webp'));assert(icons.includes('systems/dsa5/icons/months/Praios.webp'));
});
test('Titelleisten-Plakette (#24): kein eigenes ::before/::after an Foundrys Kopfknöpfen (dort zeichnet Font Awesome das Symbol)',()=>{
 const root=postcss.parse(read('styles/dsa5-helpers-character-sheet.css'));const bad=[];
 root.walkRules(rule=>{for(const sel of rule.selectors)if(/\.header-control[^,\s]*::?(before|after)/.test(sel))bad.push(sel);});
 assert.deepEqual(bad,[]);
});
// ---- Würfelstatistik (Issue #28) ----
const {pathToFileURL}=require('node:url');
const esm=p=>import(pathToFileURL(path.join(root,p)).href);
test('Würfelstatistik (#28): Chi-Quadrat-p-Werte gegen Tabellenwerte, Einstufung und Mindestanzahl',async()=>{
 const s=await esm('scripts/dice-stats/stats.js');
 for(const [chi2,df,p] of [[30.144,19,.05],[36.191,19,.01],[11.0705,5,.05],[3.8415,1,.05],[2,4,Math.exp(-1)*2]])assert(Math.abs(s.chiSquarePValue(chi2,df)-p)<5e-5,`chi2=${chi2} df=${df}`);
 assert.equal(s.evaluateDie(Array(6).fill(0)).verdict,'empty');
 const few=s.evaluateDie([5,5,5,5,5,4]);assert.equal(few.verdict,'few');assert.equal(few.minRolls,30);
 const fair=s.evaluateDie(Array(20).fill(10));assert.equal(fair.verdict,'normal');assert.equal(fair.mean,10.5);assert.equal(fair.p,1);
 // 100 Würfe W6, Abweichung so gewählt, dass chi² knapp über der 5-%- bzw. 1-%-Schwelle liegt (df=5: 11,07 bzw. 15,09).
 assert.equal(s.evaluateDie([30,10,14,14,16,16]).verdict,'slight');
 assert.equal(s.evaluateDie([32,10,12,14,16,16]).verdict,'strong');
 const ev=s.evaluateDie([2,1,1]);assert.equal(ev.n,4);assert.deepEqual(ev.deviations.map(d=>+d.toFixed(2)),[.5,-.25,-.25]);
});
test('Würfelstatistik (#28): Speicherformat bleibt klein (nur Zähler) und wird korrekt zusammengeführt',async()=>{
 const s=await esm('scripts/dice-stats/stats.js');
 const a=s.mergeCounts(null,{d:{20:[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2]}},1000);
 assert.deepEqual(Object.keys(a),['v','since','d','m']);assert.equal(a.v,1);assert.equal(a.since,1000);
 const b=s.mergeCounts(a,{d:{20:[1]},m:{6:[0,0,3,0,0,0]}},2000);
 assert.equal(b.since,1000,'since bleibt beim ersten Wurf');assert.equal(b.d[20][0],2);assert.equal(b.d[20][19],2);assert.equal(b.d[20].length,20);assert.deepEqual(b.m[6],[0,0,3,0,0,0]);
 assert.equal(a.d[20][0],1,'Eingabe wird nicht verändert');
 assert.deepEqual(s.dieTypes([b,{d:{6:[1,0,0,0,0,0],3:[0,0,0]}}],'d'),[20,6],'leere Zähler und fremde Würfelart zählen nicht; W20 vorn');
 assert(JSON.stringify(b).length<200,'wenige hundert Byte');
});
test('Würfelstatistik (#28): Erfassung nur mit Aktivierung + Zustimmung, ohne Mindest-/Höchstwerte, echte Würfel getrennt, gebündelt gespeichert',async()=>{
 class DiceTerm{constructor(faces,method){this.faces=faces;this.method=method;this.results=[];}async _evaluateAsync(options={}){for(const v of this.next)this.results.push({result:v,active:true});return this;}}
 class Die extends DiceTerm{} class Coin extends DiceTerm{}
 const updates=[];let flag;const timers=[];
 const saved={foundry:global.foundry,game:global.game,CONFIG:global.CONFIG,window:global.window,document:global.document,setTimeout:global.setTimeout};
 global.foundry={dice:{terms:{DiceTerm,Die}}};global.CONFIG={Dice:{fulfillment:{methods:{mersenne:{interactive:false},manual:{interactive:true}}}}};
 global.game={user:{getFlag:()=>flag,setFlag:async(scope,key,value)=>{updates.push(value);flag=value;}}};
 global.window={addEventListener(){}};global.document={addEventListener(){}};global.setTimeout=fn=>{timers.push(fn);return 1;};
 try{
  const r=await esm('scripts/dice-stats/recorder.js');let active=false;r.initRecorder(()=>active);
  const roll=async(term,values,options)=>{term.next=values;await term._evaluateAsync(options);};
  await roll(new Die(20),[1,20]);assert.equal(timers.length,0,'ohne Aktivierung/Zustimmung nichts erfasst');
  active=true;
  await roll(new Die(20),[20],{maximize:true});await roll(new Die(20),[1],{minimize:true});assert.equal(timers.length,0,'Mindest-/Höchstwerte sind keine Würfe');
  await roll(new Coin(2),[1]);assert.equal(timers.length,0,'Münzen zählen nicht');
  const t=new Die(6);t.results.push({result:6});await roll(t,[2,9]);
  await roll(new Die(20),[1,1,20]);await roll(new Die(20,'manual'),[5]);
  assert.equal(timers.length,1,'ein gebündelter Speichertermin');assert.equal(updates.length,0,'noch nichts gespeichert');
  await r.flush();
  assert.equal(updates.length,1,'ein einziges Update');
  assert.deepEqual(flag.d[6],[0,1,0,0,0,0],'nur neue Ergebnisse im gültigen Bereich');
  assert.equal(flag.d[20][0],2);assert.equal(flag.d[20][19],1);assert.equal(flag.m[20][4],1,'echte Würfel getrennt');assert.equal(flag.d[20][4],0);
  await roll(new Die(20),[7]);await r.flush();assert.equal(flag.d[20][6],1);assert.equal(flag.d[20][0],2,'weitergezählt');
 }finally{Object.assign(global,saved);}
});
test('Würfelstatistik (#28): Einstellungen und Texte',()=>{
 const src=read('scripts/dice-stats/settings.js');
 assert(/'diceStatsEnabled'[\s\S]*?scope: 'world'[\s\S]*?restricted: true[\s\S]*?default: false/.test(src),'Welt-Einstellung nur SL, Standard aus');
 assert(/'diceStatsConsent'[\s\S]*?scope: 'user'[\s\S]*?default: 'undecided'/.test(src),'Zustimmung je Benutzer');
 assert(/userId !== game\.userId/.test(src),'Zustimmung nur vom eigenen Client spiegeln');
 for(const lang of ['de','en']){const l=JSON.parse(read(`lang/${lang}.json`)).DSA5HELPERS.DiceStats;
  for(const key of [...src.matchAll(/'DSA5HELPERS\.DiceStats\.([\w.]+)'/g)].map(m=>m[1]))assert(lookup(l,key),`${lang}: DiceStats.${key}`);}
});
