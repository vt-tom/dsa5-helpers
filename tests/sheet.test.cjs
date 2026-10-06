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
// Hausregeln: rules.js importiert wound-check.js und help-action.js relativ — alles als data:-URL.
function suggestionsUrl(){return dataUrl(read('scripts/skill-suggestions/context.js').replace("'./score.js'",JSON.stringify(dataUrl(read('scripts/skill-suggestions/score.js')))));}
function houseRulesUrl(){return dataUrl(read('scripts/house-rules/rules.js').replace("'./wound-check.js'",JSON.stringify(dataUrl(read('scripts/house-rules/wound-check.js')))).replace("'./help-action.js'",JSON.stringify(dataUrl(read('scripts/house-rules/help-action.js')))));}
async function loadSheet(){if(Sheet)return Sheet;global.ResizeObserver??=class{observe(){}};global.document??={fonts:{ready:Promise.resolve()}};global.game={i18n:{localize},settings:{get:()=> 'light'}};global.dsa5={sheets:{ActorSheetdsa5Character:class{tabGroups={};_getHeaderControls(){return [{action:'system'}];}async _prepareContext(){return this.context;}showLimited(){return !!this.limited;}async prepareCompanionTab(){this.companionPrepared=true;}}}};({Dsa5HelpersCharacterSheet:Sheet}=await import(dataUrl(read('scripts/sheets/dsa5-helpers-character-sheet.js').replace("'../compat/steigerungsplaner.js'",JSON.stringify(dataUrl(read('scripts/compat/steigerungsplaner.js')))).replace("'../skill-suggestions/context.js'",JSON.stringify(suggestionsUrl())).replace("'../house-rules/rules.js'",JSON.stringify(houseRulesUrl())))));return Sheet;}
async function prepare(){const C=await loadSheet(),f=fixture(),sheet=new C();Object.assign(sheet,{context:f.context,actor:f.actor,isEditable:true});return {sheet,context:await sheet._prepareContext({}),actor:f.actor};}
function elements(html,predicate){return dom.findAll(predicate,parseDocument(html).children);}
test('all templates and CSS parse',()=>{for(const p of modulePaths)H.precompile(read(p));postcss.parse(read('styles/dsa5-helpers-character-sheet.css'));});
// Issue #7: Hover-Effekte nur in @media (hover: hover), damit sie auf Touch-Geräten nicht hängen bleiben (Modul und Click-Dummy).
test('every :hover rule sits inside @media (hover: hover)',()=>{for(const file of ['styles/dsa5-helpers-character-sheet.css','clickdummy/style.css']){const bad=[];postcss.parse(read(file)).walkRules(rule=>{if(!/:hover\b/.test(rule.selector))return;let ok=false;for(let p=rule.parent;p&&p.type==='atrule';p=p.parent)if(p.name==='media'&&/\(\s*hover\s*:\s*hover\s*\)/.test(p.params))ok=true;if(!ok)bad.push(rule.selector.replace(/\s+/g,' '));});assert.deepEqual(bad,[],file+': :hover outside @media (hover: hover)');}});
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
test('personal details are the first, default notes sub-tab (issue #26)',async()=>{const {sheet,context}=await prepare();const html=render(context);assert.deepEqual(context.dsa5h.subnav.find(n=>n.tab==='notes').items.slice(0,3).map(i=>i.id),['details','biography','notes']);assert.equal(sheet._subtabs.notes,'details');assert(!html.includes('dsa5h-notes-layout'));const panel=id=>elements(html,el=>el.attribs?.['data-sub-panel']==='notes:'+id)[0];assert(panel('details')&&!('hidden' in panel('details').attribs));assert(!('hidden' in panel('biography').attribs),'all notes sections stacked (#32)');assert.equal(elements(html,el=>el.name==='input'&&/^system\.details\.(gender|family|age|height|weight|Home|socialstate|haircolor|eyecolor|distinguishingmark)\.value$/.test(el.attribs?.name||'')).length,10);});
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
 const ranged=item('ranged','rangeweapon');ranged.LZ=3;ranged.progress=1;ranged.ammo=[{pickId:'ammo-id',name:'Bolts',selected:true}];p.wornMeleeWeapons=[];p.wornRangedWeapons=[ranged];
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
 // Rüstung unter der Figur (Issue #29, Variante A): immer Kacheln in einer Zeile, Initiative rechts daneben, keine Wertezeile/Badge mehr.
 p.wornArmor=armor(4);context=await sheet._prepareContext({});html=render(context);
 const armorRow=elements(html,el=>el.attribs?.class==='dsa5h-body-armor-row')[0];assert(armorRow,'armor row');
 assert.equal(dom.findAll(el=>String(el.attribs?.class??'').includes('dsa5h-body-armor-item'),armorRow.children).length,4,'tiles also from three pieces on');
 const top=elements(html,el=>el.attribs?.class==='dsa5h-body-top')[0];assert(top,'top bar');assert(dom.findAll(el=>el.attribs?.class==='dsa5h-body-ini',top.children).length===1,'initiative at the top');assert(dom.findAll(el=>el.attribs?.class==='dsa5h-quick-actions',top.children).length===1,'quick actions at the top');
 assert(!html.includes('dsa5h-figure-badge')&&!html.includes('dsa5h-figure-stats')&&!html.includes('dsa5h-body-armor-table'));
 const panelHtml=html.slice(html.indexOf('dsa5h-body-panel'));assert(panelHtml.indexOf('dsa5h-body-top')<panelHtml.indexOf('dsa5h-body-grid'),'quick actions above everything');
 // Übersicht entfällt (Issue #29): ihre Waffentabellen stehen im Körper-Reiter.
 assert(!html.includes('data-sub-panel="combat:combat"'));assert.deepEqual(context.dsa5h.subnav.find(n=>n.tab==='combat').items.map(i=>i.id),['body','skills']);assert.equal(sheet._subtabs.combat,'body');
 assert(!html.includes('dsa5h-weapon-row'),'no weapon tables any more');
 await Sheet.DEFAULT_OPTIONS.ownerActions.dsa5hBodyFigure.call(sheet,{}, {dataset:{figure:'portrait'}});assert.deepEqual(actor.saved,{scope:'dsa5-helpers',key:'bodyFigure',value:'portrait'});
});
test('navigation rejects unknown tabs and preserves subtab selection',async()=>{
 const {sheet}=await prepare();const panel={dataset:{tabPanel:'combat'}};const sub={dataset:{subPanel:'combat:skills'}};const button={dataset:{parentTab:'combat',subtab:'skills'},classList:{toggle(_key,value){this.active=value;}},setAttribute(k,v){this[k]=v;}};
 sheet.element={dataset:{},querySelector(){return null;},querySelectorAll(selector){return selector==='[data-tab-panel]'?[panel]:selector==='[data-sub-panel]'?[sub]:selector==='[data-subtab]'?[button]:[];}};
 Sheet.DEFAULT_OPTIONS.actions.dsa5hSetTab.call(sheet,{}, {dataset:{tab:'invalid'}});assert.equal(sheet._currentTab,'cover');
 Sheet.DEFAULT_OPTIONS.actions.dsa5hSetTab.call(sheet,{}, {dataset:{tab:'combat'}});Sheet.DEFAULT_OPTIONS.actions.dsa5hSetSubTab.call(sheet,{},button);assert.equal(panel.hidden,false);assert(!sub.hidden,'sub-panels are never hidden (#32)');assert.equal(button['aria-pressed'],'true');await sheet._prepareContext({});assert.equal(sheet._subtabs.combat,'skills');
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
 const ranged=item('ranged','rangeweapon');ranged.LZ=3;ranged.progress='1/3';ranged.title='Ladestatus: 1/3';ranged.system.reloadTime={progress:1};p.wornMeleeWeapons=[];p.wornRangedWeapons=[ranged];
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
test('favorites for equipment and special abilities (#30): stars on inventory rows and SF chips, consume via the system, names open the item sheet',async()=>{
 const C=await loadSheet(),f=fixture(),sheet=new C();
 const potion=item('potion','consumable');f.context.prepare.inventory.consumables={show:true,dataType:'consumable',items:[potion]};f.actor.items.set('potion',potion);for(const i of [f.context.prepare.inventory.tools.items[0],...Object.values(f.context.prepare.specAbs).flat()])f.actor.items.set(i._id,i);
 f.actor.flags.favorites=['tool','bag-child','potion','general','combat','weapon'];Object.assign(sheet,{context:f.context,actor:f.actor,isEditable:true});
 const context=await sheet._prepareContext({});const groups=Object.fromEntries(context.dsa5h.favoriteGroups.map(g=>[g.label,g.items.map(i=>i._id)]));
 assert.deepEqual(groups['DSA5HELPERS.Tabs.inventory'].sort(),['bag-child','potion','tool']);assert.deepEqual(groups['DSA5HELPERS.SpecialAbilities'].sort(),['combat','general']);assert.deepEqual(groups['DSA5HELPERS.Weapons'],['weapon']);
 const html=render(context);
 const rows=elements(html,el=>String(el.attribs?.class??'').split(' ').includes('dsa5h-inventory-row')&&el.name==='div'&&!String(el.attribs.class).includes('row-head'));assert.equal(rows.length,2);
 for(const row of rows)assert.equal(dom.findAll(el=>el.attribs?.['data-action']==='dsa5hFavorite',row.children).length,1);
 assert.equal(elements(html,el=>String(el.attribs?.class??'').includes('dsa5h-chip-fav')).length,2);
 const consume=elements(html,el=>el.attribs?.['data-action']==='dsa5hConsume');assert.equal(consume.length,1);
 const names=elements(html,el=>String(el.attribs?.class??'').split(' ').includes('dsa5h-fav-name')&&!String(el.parent?.attribs?.class??'').includes('dsa5h-suggest-card'));assert.equal(names.length,6);for(const n of names)assert.equal(n.attribs['data-action'],'itemEdit');
 let consumed;sheet.consumeItem=async i=>{consumed=i;};sheet._getItemId=()=>'potion';await Sheet.DEFAULT_OPTIONS.ownerActions.dsa5hConsume.call(sheet,{},{});assert.equal(consumed,potion);
});
test('aggregated tests can be added in play mode',async()=>{
 const {sheet}=await prepare();sheet.context.prepare.sheetLocked=true;const ctx=await sheet._prepareContext({});assert.equal(ctx.dsa5h.editMode,false);
 assert.equal(elements(render(ctx),el=>el.attribs?.['data-action']==='itemCreate' && el.attribs['data-type']==='aggregatedTest').length,1);
});
test('ammo row: selection inside a dropdown incl. "no ammunition", magazine count with swap button',async()=>{
 const {sheet}=await prepare();const p=sheet.context.prepare;
 const ranged=item('ranged','rangeweapon');ranged.LZ=2;ranged.progress='0/2';ranged.system.reloadTime={progress:0};ranged.ammo=[{pickId:'mag-id',name:'Magazin',count:'2',selected:true}];ranged.selectedAmmo={pickId:'mag-id',img:'x.webp',tooltip:'Magazin',count:'2'};ranged.clearAmmo={pickId:'clear',selected:false};ranged.ammoCurrent=10;ranged.ammoMax=10;p.wornMeleeWeapons=[];p.wornRangedWeapons=[ranged];
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
 assert(buttons.length>=3,'body armor, body hand, chip');
});
test('aim progress (issue #8) shows only once the weapon is aimed, with the system texts',async()=>{
 const {sheet}=await prepare();const p=sheet.context.prepare;
 const ranged=item('ranged','rangeweapon');ranged.LZ=2;ranged.progress='2/2';ranged.system.reloadTime={progress:2};ranged.system.aimTime={progress:0};p.wornMeleeWeapons=[];p.wornRangedWeapons=[ranged];
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
 assert.equal(links.length,1,'hand (the weapon tables are gone, #29)');assert(links.every(l=>l.attribs['data-skill-id']==='combatskill'&&dom.textContent(l).includes('7')&&l.attribs['aria-label']));
 assert.equal(elements(html,el=>String(el.attribs?.class??'').includes('dsa5h-hand-ranged')).length,1);
 assert.equal(elements(html,el=>el.attribs?.['data-action']==='loadWeapon').length,1,'hand');
 assert.equal(elements(html,el=>el.attribs?.['data-action']==='itemSwapMag').length,1,'hand');
 p.combatskills[0].name='Other';html=render(await sheet._prepareContext({}));
 assert.equal(elements(html,el=>el.attribs?.['data-action']==='dsa5hJumpCombatSkill').length,0,'no jump link without a matching technique');
});
test('body tab: a free off hand renders compactly below the main hand, its tile is the weapon picker',async()=>{
 const {sheet,actor}=await prepare();const p=sheet.context.prepare;
 const main=item('main','meleeweapon');main.system.worn={value:true,offHand:false};p.wornMeleeWeapons=[main];p.wornRangedWeapons=[];actor.items.set('main',main);
 let context=await sheet._prepareContext({});let html=render(context);
 assert(context.dsa5h.body.offFree);assert.equal(elements(html,el=>String(el.attribs?.class??'').includes('dsa5h-body-side right off-free')).length,1,'free off hand on the right');
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
test('Würfelstatistik (#28): Speicherformat je Tag bleibt klein, Zeitraum-Summen und Übernahme des alten Formats',async()=>{
 const s=await esm('scripts/dice-stats/stats.js');const NOW=new Date(2026,9,2,22).getTime();
 const w=(i,v,n=20)=>Array.from({length:n},(_,k)=>k===i?v:0);
 const a=s.mergeCounts(null,{'2026-10-01':{d:{20:w(0,1)}}},NOW);
 assert.deepEqual(a,{v:2,days:{'2026-10-01':{d:{20:w(0,1)},m:{}}}});
 const b=s.mergeCounts(a,{'2026-10-01':{d:{20:[1]},m:{6:[0,0,3,0,0,0]}},'2026-10-02':{d:{20:w(19,2)}}},NOW);
 assert.equal(b.days['2026-10-01'].d[20][0],2);assert.equal(b.days['2026-10-01'].d[20].length,20);assert.deepEqual(b.days['2026-10-01'].m[6],[0,0,3,0,0,0]);
 assert.equal(a.days['2026-10-01'].d[20][0],1,'Eingabe wird nicht verändert');
 assert.deepEqual(s.playDays([b,{v:2,days:{'2026-09-24':{d:{},m:{}}}}]),['2026-10-02','2026-10-01','2026-09-24'],'neueste zuerst');
 const all=s.sumCounts(b);assert.equal(all.d[20][0],2);assert.equal(all.d[20][19],2);
 const day=s.sumCounts(b,{from:'2026-10-02',to:'2026-10-02'});assert.equal(day.d[20][0],0);assert.equal(day.d[20][19],2);assert.deepEqual(day.m,{});
 assert.equal(s.sumCounts(b,{from:'2026-10-02'}).d[20][19],2);assert.equal(s.sumCounts(b,{to:'2026-10-01'}).d[20][19],0,'offene Grenzen');
 assert.deepEqual(s.dieTypes([all,{d:{6:[1,0,0,0,0,0],3:[0,0,0]}}],'d'),[20,6],'leere Zähler und fremde Würfelart zählen nicht; W20 vorn');
 // Ein Tag reicht bis 6 Uhr: 1 Uhr nachts zählt zum Vortag.
 assert.equal(s.dayKey(new Date(2026,9,3,1,30).getTime()),'2026-10-02');assert.equal(s.dayKey(new Date(2026,9,2,19,0).getTime()),'2026-10-02');
 // Version 1 (ein Topf) wird als ein Abend am Tag von since übernommen.
 const old={v:1,since:new Date(2026,9,1,20).getTime(),d:{6:[1,2,3,4,5,6]},m:{}};
 assert.deepEqual(s.normalizeStats(old),{v:2,days:{'2026-10-01':{d:{6:[1,2,3,4,5,6]},m:{}}}});
 assert.equal(s.mergeCounts(old,{'2026-10-02':{d:{6:[1,0,0,0,0,0]}}},NOW).days['2026-10-01'].d[6][5],6,'alte Daten bleiben erhalten');
 // Ein typischer Spielabend (W20, W6, W3) braucht gut 100 Byte.
 const evening=s.mergeCounts(null,{'2026-10-02':{d:{20:Array(20).fill(8),6:Array(6).fill(10),3:[3,3,4]}}},NOW);
 assert(JSON.stringify(evening.days['2026-10-02']).length<160,JSON.stringify(evening).length);
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
  const today=(await esm('scripts/dice-stats/stats.js')).dayKey();assert.deepEqual(Object.keys(flag.days),[today],'Topf des aktuellen Spielabends');
  const c=()=>flag.days[today];
  assert.deepEqual(c().d[6],[0,1,0,0,0,0],'nur neue Ergebnisse im gültigen Bereich');
  assert.equal(c().d[20][0],2);assert.equal(c().d[20][19],1);assert.equal(c().m[20][4],1,'echte Würfel getrennt');assert.equal(c().d[20][4],0);
  await roll(new Die(20),[7]);await r.flush();assert.equal(c().d[20][6],1);assert.equal(c().d[20][0],2,'weitergezählt');
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
test('body tab (#29): main hand left, off hand right; a two-handed weapon sits on the chosen side, moved only in edit mode',async()=>{
 const {sheet,actor}=await prepare();const p=sheet.context.prepare;
 const main=item('main','meleeweapon'),off=item('off','meleeweapon');main.system.worn={value:true,offHand:false};off.system.worn={value:true,offHand:true};
 p.wornMeleeWeapons=[main,off];p.wornRangedWeapons=[];actor.items.set('main',main);actor.items.set('off',off);
 const side=(html,cls)=>elements(html,el=>String(el.attribs?.class??'').startsWith('dsa5h-body-side '+cls))[0];
 const selects=node=>dom.findAll(el=>el.name==='select',node.children).map(el=>el.attribs['data-dsa5h-hand']);
 let html=render(await sheet._prepareContext({}));
 assert.deepEqual(selects(side(html,'left')),['main']);assert.deepEqual(selects(side(html,'right')),['offhand']);
 assert(!html.includes('data-action="dsa5hTwoHandedSide"'),'no swap button for one-handed weapons');
 main.wieldedTwoHand=true;let context=await sheet._prepareContext({});html=render(context);
 assert.equal(context.dsa5h.body.twoHandedSide,'left');assert.deepEqual(selects(side(html,'left')),['main']);
 assert(dom.findAll(el=>el.attribs?.class==='dsa5h-hand-2h-note',side(html,'right').children).length===1,'note on the free side');
 const swap=elements(html,el=>el.attribs?.['data-action']==='dsa5hTwoHandedSide')[0];assert.equal(swap.attribs['data-side'],'right');assert(swap.attribs['aria-label']);
 context.dsa5h.editMode=false;assert(!render(context).includes('data-action="dsa5hTwoHandedSide"'),'swap only in edit mode');
 await Sheet.DEFAULT_OPTIONS.ownerActions.dsa5hTwoHandedSide.call(sheet,{},{dataset:{side:'right'}});assert.deepEqual(actor.saved,{scope:'dsa5-helpers',key:'twoHandedSide',value:'right'});
 actor.flags.twoHandedSide='right';
 context=await sheet._prepareContext({});html=render(context);
 assert.equal(context.dsa5h.body.twoHandedSide,'right');assert.deepEqual(selects(side(html,'right')),['main']);assert.deepEqual(selects(side(html,'left')),[]);
 assert.equal(elements(html,el=>el.attribs?.['data-action']==='dsa5hTwoHandedSide')[0].attribs['data-side'],'left');
});
test('Würfelstatistik (#28): Fenster „Karten“ – Karten je Spieler, Diagramm, Tabelle nur aufgeklappt, Zurücksetzen nur für die SL',async()=>{
 const {buildCards}=await esm('scripts/apps/dice-stats.js');
 const w20=Array.from({length:20},(_,i)=>i===0?14:i===19?2:5);
 const players=[{id:'a',name:'Anna',color:'#3f7fbf',counts:{d:{20:w20,6:[1,1,1,1,1,1]},m:{}}},{id:'b',name:'Ben',color:'#b3473b',counts:{d:{6:[2,0,0,0,0,0]},m:{}}}];
 const cards=buildCards(players,20,'d',{open:new Set(['a'])});
 assert.equal(cards.length,1,'Spieler ohne Würfe dieses Typs erscheinen nicht');
 const [card]=cards;assert.equal(card.n,106);assert.equal(card.bars.length,20);assert(card.bars[0].key&&card.bars[19].key&&!card.bars[1].key,'1 und 20 hervorgehoben');
 assert.deepEqual(card.bars.filter(b=>b.label).map(b=>b.face),[1,5,10,15,20]);assert(card.bars[0].h>card.bars[1].h);
 assert.deepEqual(card.figures.map(f=>f.label),['n','mean','ones','twenties']);
 assert.deepEqual(buildCards(players,6,'d').map(c=>c.figures.length),[2,2],'1en/20en nur beim W20');
 const tpl=H.compile(read('templates/dice-stats.hbs'));
 const ctx=isGM=>({enabled:true,isGM,faces:20,method:'d',types:[{faces:20,active:true},{faces:6,active:false}],methods:[{id:'d',active:true,label:'DSA5HELPERS.DiceStats.Method.d'},{id:'m',active:false,label:'DSA5HELPERS.DiceStats.Method.m'}],ownConsent:'yes',ranges:[{value:'all',label:'Gesamt',selected:true},{value:'2026-10-02',label:'Spielabend 2.10.2026'},{value:'custom',label:'Eigener Zeitraum'}],custom:false,cards,hidden:isGM?'Eva':'',slight:'0,05',strong:'0,01',hist:{width:300,height:70,total:84,labelY:82}});
 missing.clear();let html=tpl(ctx(false));
 assert.deepEqual([...missing].filter(k=>k.startsWith('DSA5HELPERS')),[],'alle Texte lokalisiert');
 assert.equal(elements(html,el=>el.name==='section'&&el.attribs.class==='dsa5h-ds-card').length,1);
 assert.equal(elements(html,el=>el.name==='rect').length,20);assert.equal(elements(html,el=>el.name==='table').length,1,'Tabelle der aufgeklappten Karte');
 assert(!html.includes('data-action="reset"'),'kein Löschen für Spieler');assert(!html.includes('Eva'),'Spieler sehen nicht, wer nicht ausgewertet wird');
 assert.equal(elements(html,el=>el.name==='select'&&el.attribs.name==='range').length,1);assert(!html.includes('type="date"'),'Datumsfelder nur bei eigenem Zeitraum');
 html=tpl({...ctx(false),custom:true,from:'2026-10-01',to:'2026-10-02'});assert.equal(elements(html,el=>el.attribs?.type==='date').length,2);
 html=tpl(ctx(true));const resets=elements(html,el=>el.attribs?.['data-action']==='reset');assert.equal(resets.length,2,'je Karte + alle');assert(html.includes('Eva'));
 assert(resets.every(b=>dom.findAll(el=>String(el.attribs?.class??'').includes('fa-trash-can'),b.children).length),'Mülleimer statt Neu-laden-Pfeil');
 missing.clear();html=tpl({...ctx(false),cards:[],ownConsent:'no'});assert(html.includes(localize('DSA5HELPERS.DiceStats.NoConsent')));assert.deepEqual([...missing],[]);
 for(const lang of ['de','en']){const l=JSON.parse(read(`lang/${lang}.json`)).DSA5HELPERS.DiceStats;for(const v of ['normal','slight','strong','few','empty'])assert(l.Verdict[v],`${lang} Verdict.${v}`);for(const f of ['n','mean','ones','twenties'])assert(l.Figure[f]);}
 assert(/registerMenu\('dsa5-helpers', 'diceStats'[\s\S]*?restricted: false/.test(read('scripts/dsa5-helpers.js')),'für alle über die Moduleinstellungen erreichbar');
 assert(read('scripts/dsa5-helpers.js').includes('"modules/dsa5-helpers/templates/dice-stats.hbs"'));
});
test('body tab (#29): armor shield in the armor row with breakdown tooltip, ammo picker in the ranged hand, short list of other weapons and trait attacks',async()=>{
 const {sheet,actor}=await prepare();const p=sheet.context.prepare;
 const armor=(id,rs,be,name)=>{const a=item(id,'armor');a.name=name;a.system.protection={value:rs};a.system.calculatedEncumbrance=be;return a;};
 p.wornArmor=[armor('a1',2,1,'Kettenhemd'),armor('a2',1,0,'Helm <b>')];p.armorSum=3;p.spellArmor=1;p.liturgyArmor=0;
 const ranged=item('ranged','rangeweapon');ranged.system.worn={value:true,offHand:false,requiresBothHands:false};ranged.ammo=[{pickId:'ammo-id',name:'Bolts',selected:true}];ranged.selectedAmmo={pickId:'ammo-id',img:'x.webp',tooltip:'Bolts',count:'5'};ranged.clearAmmo={pickId:'clear',selected:false};
 const dagger=item('dagger','meleeweapon');dagger.system.worn={value:true,offHand:true};dagger.wieldedTwoHand=false;
 const spare=item('spare','meleeweapon');spare.system.worn={value:true,offHand:true};
 const bite=item('bite','trait');bite.name='Biss';
 p.wornMeleeWeapons=[dagger,spare];p.wornRangedWeapons=[ranged];p.traits={meleeAttack:[bite],rangeAttack:[]};
 for(const w of [ranged,dagger,spare])actor.items.set(w._id,w);
 const context=await sheet._prepareContext({});const html=render(context);
 const armorRow=elements(html,el=>el.attribs?.class==='dsa5h-body-armor-row')[0];
 const shield=dom.findAll(el=>el.attribs?.class==='dsa5h-body-shield',armorRow.children)[0];assert(shield,'shield in the armor row');assert.equal(armorRow.children.filter(n=>n.type==='tag').at(-1),shield,'right-aligned at the end');
 assert(dom.textContent(shield).includes('3')&&dom.textContent(shield).includes('+1'),'RS sum and magic bonus');
 const tip=shield.attribs['data-tooltip'];assert(tip.includes('Kettenhemd')&&tip.includes('Helm &amp;lt;b&amp;gt;')||tip.includes('Helm &lt;b&gt;'),'pieces listed, names escaped');assert(!tip.includes('<b>'));
 assert.equal(context.dsa5h.body.magicArmor,1);assert(shield.attribs['aria-label']);
 const hands=elements(html,el=>String(el.attribs?.class??'').startsWith('dsa5h-body-side'));
 assert.equal(dom.findAll(el=>el.name==='details'&&String(el.attribs?.class).includes('dsa5h-ammo-pick'),hands[0].children).length,1,'ammo picker in the ranged main hand');
 const short=elements(html,el=>String(el.attribs?.class??'').split(' ').includes('dsa5h-short-weapon'));
 assert.deepEqual(short.map(r=>r.attribs['data-item-id']),['spare','bite'],'worn weapon outside the hands + trait attack');
 assert.equal(dom.findAll(el=>el.attribs?.['data-action']==='chRollCombat',short[1].children).length,3,'trait attack stays rollable (AT, PA, TP)');
 assert(dom.findAll(el=>String(el.attribs?.class??'').includes('withContext'),short[0].children).length,'context menu target');
});
test('sub-tabs as jump marks in every tab (#32): all sections render, a sub-tab scrolls to its section, scrolling moves the mark',async()=>{
 const {sheet,context}=await prepare();const html=render(context);
 for(const [tab,ids] of [['combat',['body','skills']],['magic',['spells','equipment']],['religion',['spells','equipment']],['notes',['details','biography','notes']]]){
  for(const id of ids){const panel=elements(html,el=>el.attribs?.['data-sub-panel']===tab+':'+id)[0];assert(panel,tab+':'+id);assert(!('hidden' in panel.attribs),tab+':'+id+' visible');}
 }
 // Scroll-Mitführung und Sprung an einem nachgebauten Inhaltsbereich (Abschnitte bei 0/400/900 px, Fenster 300 px hoch).
 const mk=(id,top)=>({dataset:{subPanel:'magic:'+id},hidden:false,getBoundingClientRect:()=>({top:top-content.scrollTop})});
 const content={scrollTop:0,clientHeight:300,scrollHeight:1400,getBoundingClientRect:()=>({top:0}),scrollTo({top}){this.target=top;},querySelector:()=>null};
 const sections=[mk('spells',0),mk('equipment',400)];
 const buttons=[];sheet.element={dataset:{},querySelector:sel=>sel==='.dsa5h-content'?content:null,querySelectorAll:sel=>sel.startsWith('[data-tab-panel="magic"] [data-sub-panel^="magic:"]')?sections:sel==='[data-subtab]'?buttons:[]};
 sheet._currentTab='magic';sheet._subtabs.magic='spells';
 Sheet.DEFAULT_OPTIONS.actions.dsa5hSetSubTab.call(sheet,{},{dataset:{parentTab:'magic',subtab:'equipment'}});
 assert.equal(sheet._subtabs.magic,'equipment');assert.equal(content.target,396,'scrolls to the section top');assert(sheet._jumping,'mark frozen while jumping');
 sheet._jumping=false;content.scrollTop=380;sheet._onContentScroll();assert.equal(sheet._subtabs.magic,'equipment');
 content.scrollTop=100;sheet._onContentScroll();assert.equal(sheet._subtabs.magic,'spells','mark follows scrolling back');
 content.scrollTop=1100;sheet._onContentScroll();assert.equal(sheet._subtabs.magic,'equipment','bottom marks the last section');
});
test('Würfelstatistik (#28): Tage älter als 12 Monate werden zusammengefasst, Gesamtsumme bleibt richtig',async()=>{
 const s=await esm('scripts/dice-stats/stats.js');const NOW=new Date(2026,9,2,22).getTime();
 const w=(i,v)=>Array.from({length:6},(_,k)=>k===i?v:0);
 let st=s.mergeCounts(null,{'2025-09-01':{d:{6:w(0,2)}},'2025-10-01':{d:{6:w(1,3)}},'2025-10-10':{d:{6:w(2,4)}},'2026-10-01':{d:{6:w(3,5)}}},NOW);
 assert.deepEqual(Object.keys(st.days).sort(),['2025-10-10','2026-10-01'],'nur die letzten 12 Monate einzeln');
 assert.deepEqual(st.older.d[6],[2,3,0,0,0,0]);assert.equal(st.olderUntil,'2025-10-01');
 assert.deepEqual(s.sumCounts(st).d[6],[2,3,4,5,0,0],'Gesamt inkl. zusammengefasster Tage');
 assert.deepEqual(s.sumCounts(st,{from:'2025-10-10'}).d[6],[0,0,4,5,0,0],'Zeitraum mit Anfang ohne den Sammeltopf');
 assert.deepEqual(s.sumCounts(st,{to:'2026-01-01'}).d[6],[2,3,4,0,0,0],'ohne Anfang mit Sammeltopf');
 assert.deepEqual(s.playDays([st]),['2026-10-01','2025-10-10']);
 // Ein Jahr später rutscht der nächste Tag in den Sammeltopf, ohne dass etwas verloren geht.
 st=s.mergeCounts(st,{'2026-10-20':{d:{6:w(5,1)}}},new Date(2026,9,20,22).getTime());
 assert.deepEqual(Object.keys(st.days).sort(),['2026-10-01','2026-10-20']);assert.deepEqual(st.older.d[6],[2,3,4,0,0,0]);assert.equal(st.olderUntil,'2025-10-10');
 assert.deepEqual(s.sumCounts(st).d[6],[2,3,4,5,0,1]);
});
// Hausregelbuch (2026-10-05): relative Importe werden wie bei loadSheet() durch data:-URLs ersetzt.
const houseRuleModules=async()=>{const wound=dataUrl(read('scripts/house-rules/wound-check.js'));const help=dataUrl(read('scripts/house-rules/help-action.js'));const rules=houseRulesUrl();const app=dataUrl(read('scripts/apps/house-rules.js').replace("'../house-rules/rules.js'",JSON.stringify(rules)));return {wound:await import(wound),help:await import(help),rules:await import(rules),app:await import(app)};};
for(const p of ['templates/house-rules/toggle.hbs','templates/house-rules/wound-check.hbs','templates/house-rules/help-action.hbs'])H.registerPartial('modules/dsa5-helpers/'+p,read(p));
test('Hausregel Wundeinschätzung: QS-Staffel und Veralten wie in Knigges World Script',async()=>{
 const {wound}=await houseRuleModules();const t=(k,d)=>d?k+':'+Object.values(d).join(','):k;const w=(qs,cur,max=40)=>wound.woundText(qs,cur,max,t);
 assert.equal(w(0,10),'Text.none');assert.equal(w(1,40),'Text.unhurt');assert.equal(w(1,39),'Text.hurt');
 assert.deepEqual([0,10,20,30,39,40].map(c=>w(2,c)),['Text.incapacitated','Text.critical','Text.severe','Text.marked','Text.light','Text.unhurt']);
 assert.equal(w(3,27),'Text.marked<br><small>Text.range:20–30</small>');assert.equal(w(4,27),'Text.marked<br><small>Text.range:25–30</small>');
 assert.equal(w(3,35),'Text.light<br><small>Text.range:30–40</small>');assert.equal(w(4,38,38),'Text.unhurt<br><small>Text.range:35–38</small>');
 assert.equal(w(6,10),'Text.critical<br><small>Text.about:10</small>');
 assert(wound.isFresh({lep:20},29,40),'Änderung unter einem Viertel bleibt gültig');assert(!wound.isFresh({lep:20},30,40),'ab einem Viertel veraltet');assert(!wound.isFresh(undefined,20,40));
 for(const key of ['none','unhurt','hurt','incapacitated','critical','severe','marked','light','range','about'])assert(lookup(own,'DSA5HELPERS.HouseRules.woundCheck.Text.'+key),key);
});
test('Hausregelbuch: Liste und Buch, Schalter nur für die SL, Urheber im Buch, Einstellung je Welt',async()=>{
 const settings={houseRules:{},theme:'light'};let isGM=true;
 global.game={i18n:{localize},settings:{get:(_m,k)=>settings[k],async set(_m,k,v){settings[k]=v;}},get user(){return {isGM};}};
 global.foundry={applications:{api:{ApplicationV2:class{async _prepareContext(){return {};}_onRender(){}render(){this.rendered=(this.rendered??0)+1;}},HandlebarsApplicationMixin:B=>B},instances:new Map()}};
 const {rules,app}=await houseRuleModules();const App=app.getHouseRulesApp();const tpl=H.compile(read('templates/house-rules.hbs'));
 assert.deepEqual(rules.HOUSE_RULES.map(r=>[r.id,r.credit]),[['woundCheck','Knigge'],['helpAction','VTTom']]);
 const sheet=new App();missing.clear();let html=tpl(await sheet._prepareContext({}));
 assert.equal(elements(html,el=>el.attribs?.class?.split(' ').includes('dsa5h-hr-entry')).length,2);
 assert(html.includes('Idee: Knigge')&&html.includes('Idee: VTTom'),'Urheber je Regel');
 assert.equal(elements(html,el=>el.attribs?.role==='switch'&&el.attribs['data-action']==='toggleRule'&&el.attribs['aria-checked']==='false').length,2);
 assert.equal(elements(html,el=>el.attribs?.['data-action']==='openPage').length,2);
 await App.DEFAULT_OPTIONS.actions.toggleRule.call(sheet,{},{dataset:{ruleId:'woundCheck'}});assert.deepEqual(settings.houseRules,{woundCheck:true});assert(rules.isRuleActive('woundCheck'));
 App.DEFAULT_OPTIONS.actions.setView.call(sheet,{},{dataset:{view:'book'}});html=tpl(await sheet._prepareContext({}));
 assert.equal(elements(html,el=>el.attribs?.class?.split(' ').includes('dsa5h-hr-toc')).length,1,'Buch beginnt mit dem Inhaltsverzeichnis');
 const tocLink=elements(html,el=>el.attribs?.['data-action']==='turnPage'&&el.attribs['data-page']==='1');assert(tocLink.length>=2,'Inhalt und Pfeil führen zu Seite 1');
 App.DEFAULT_OPTIONS.actions.turnPage.call(sheet,{},{dataset:{page:'1'}});assert.equal(sheet.state.turn,1,'Vorwärtsblättern merkt die Richtung für die Animation');
 App.DEFAULT_OPTIONS.actions.openPage.call(sheet,{},{dataset:{page:'1'}});html=tpl(await sheet._prepareContext({}));
 const top=elements(html,el=>el.attribs?.class==='dsa5h-hr-page-top')[0];assert(top&&dom.findAll(el=>el.attribs?.role==='switch',top.children).length===1,'Schalter oben rechts im Seitenkopf');
 assert(html.includes('Knigge'),'Urheber auf der Buchseite');assert.equal(elements(html,el=>el.name==='tr').length,7,'Kopf + 6 QS-Zeilen');
 assert(elements(html,el=>el.attribs?.role==='switch'&&el.attribs['aria-checked']==='true').length===1,'Schalter auch auf der Buchseite');assert(html.includes('Seite 2 von 3'));
 isGM=false;html=tpl(await sheet._prepareContext({}));assert.equal(elements(html,el=>el.attribs?.role==='switch').length,0);assert.equal(elements(html,el=>el.attribs?.class==='dsa5h-hr-state active').length,1);
 await App.DEFAULT_OPTIONS.actions.toggleRule.call(sheet,{},{dataset:{ruleId:'woundCheck'}});assert.deepEqual(settings.houseRules,{woundCheck:true},'Spieler schalten nichts um');
 assert.deepEqual([...missing].filter(k=>k.startsWith('DSA5HELPERS')),[]);
 const entry=read('scripts/dsa5-helpers.js');for(const p of ['templates/house-rules.hbs','templates/house-rules/toggle.hbs','templates/house-rules/wound-check.hbs'])assert(entry.includes('modules/dsa5-helpers/'+p),p+' wird geladen');
 assert(/registerMenu\('dsa5-helpers', 'houseRules'.*restricted: false/.test(entry),'Menü für alle lesbar');
 const en=JSON.parse(read('lang/en.json'));const keys=o=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'?keys(v).map(x=>k+'.'+x):[k]);assert.deepEqual(keys(en.DSA5HELPERS.HouseRules).sort(),keys(own.DSA5HELPERS.HouseRules).sort());
});
test('Wundeinschätzung im Bogen: Hinweis am Talent Heilkunde Wunden nur bei aktiver Regel, ohne Ziel ein Tooltip, sonst der Probendialog',async()=>{
 const {sheet,actor}=await prepare();const skill=actor.items.get('skill');skill.name='Heilkunde Wunden';
 let active=false,tip=null,targets=[],setup=null;
 global.game={i18n:{localize},settings:{get:(_m,k)=>k==='houseRules'?{woundCheck:active}:'light'},tooltip:{activate:(el,o)=>{tip=o.text;},deactivate(){}},user:{targets:{first:()=>targets[0]}}};
 const hint=html=>elements(html,el=>el.attribs?.['data-action']==='dsa5hWoundCheck');
 assert.equal(hint(render(await sheet._prepareContext({}))).length,0,'Regel aus: kein Hinweis');
 active=true;const html=render(await sheet._prepareContext({}));const btn=hint(html);assert.equal(btn.length,2,'Talentzeile + Favoritenkarte (Heilkunde Wunden ist Favorit)');
 assert(btn.some(b=>{let p=b;while(p&&!String(p.attribs?.class??'').includes('dsa5h-fav-card'))p=p.parent;return !!p;}),'Herz auch bei den Favoriten');
 let row=btn.find(b=>{let p=b;while(p&&!String(p.attribs?.class??'').includes('dsa5h-skill-row'))p=p.parent;return !!p;});while(row&&row.attribs?.['data-item-id']!=='skill')row=row.parent;assert(row,'Hinweis steht in der Zeile von Heilkunde Wunden');
 const handler=Sheet.DEFAULT_OPTIONS.ownerRollActions.dsa5hWoundCheck;const target={addEventListener(){}};
 await handler.call(sheet,{},target);assert.equal(tip,localize('DSA5HELPERS.HouseRules.woundCheck.PickTarget'));
 targets=[{name:'Ork',actor:{id:'ork',system:{status:{wounds:{value:20,max:30}}}}}];skill.clone=()=>skill;actor.setupSkill=async(s,o)=>{setup={s,o};return null;};
 await handler.call(sheet,{},target);assert.equal(setup?.s,skill,'normaler Probendialog des Systems');assert.equal(setup.o.messageMode,'self');
 assert(!read('scripts/house-rules/wound-check.js').includes('renderTokenHUD'),'kein Knopf mehr im Token-HUD');
});
test('Titelblatt-Leiste Variante G (#27/#31): Reiter Zustände | Persönliche Daten, alle Zustände, nur ausgefüllte Daten, Regeneration neben den Schips',async()=>{
 await loadSheet();global.game={i18n:{localize},settings:{get:()=> 'light'},user:{targets:{first:()=>undefined}}};
 const {sheet,actor}=await prepare();actor.system.details.gender={value:'Weiblich'};actor.system.details.Home={value:'  '};actor.system.details.haircolor={value:'Silberblond'};
 sheet.context.conditions=Array.from({length:6},(_,i)=>({_id:'c'+i,name:'CONDITION.inpain',value:1,img:'x.svg',editable:4,manual:1}));
 const context=await sheet._prepareContext({});assert.deepEqual(context.dsa5h.personalDetails.map(f=>f.value),['Weiblich','Silberblond']);
 // Sozialstatus: Zahl aus den Choices des Schemas übersetzt (wie im Systembogen), 0 = „-“ = nicht ausgefüllt.
 const social=field=>{actor.system.details.socialstate={value:field};actor.system.schema={getField:path=>path==='details.socialstate.value'?{choices:{0:'-',1:'SOCIAL_CLASS.slave',2:'SOCIAL_CLASS.freeman'}}:undefined};};
 social(2);assert.deepEqual((await sheet._prepareContext({})).dsa5h.personalDetails.map(f=>f.value),['Weiblich','Frei','Silberblond']);
 social(0);assert.deepEqual((await sheet._prepareContext({})).dsa5h.personalDetails.map(f=>f.value),['Weiblich','Silberblond']);
 delete actor.system.schema;delete actor.system.details.socialstate;
 const html=render(context);const aside=elements(html,el=>el.name==='aside')[0];
 assert.deepEqual(dom.findAll(el=>el.attribs?.role==='tab',aside.children).map(t=>t.attribs['data-side-tab']),['conditions','details']);
 assert.equal(dom.findAll(el=>String(el.attribs?.class??'').includes('dsa5h-cover-condition'),aside.children).length,6,'alle Zustände, der Inhalt scrollt');
 assert.equal(dom.findAll(el=>el.name==='dd',aside.children).length,2);assert(dom.findAll(el=>el.attribs?.['data-action']==='dsa5hOpenDetails',aside.children).length===1);
 assert(dom.findAll(el=>el.attribs?.['data-cover-slot']==='regen',aside.children).length===1,'Platz für die Regeneration in der Schips-Zeile');
 assert(elements(html,el=>el.attribs?.['data-cover-move']==='regen'&&el.attribs['data-action']==='chRegenerate').length===1);
 assert(elements(html,el=>el.attribs?.['data-header-slot']==='regen').length===1,'Rückweg in den Kopf');
 Sheet.DEFAULT_OPTIONS.actions.dsa5hCoverSideTab.call(sheet,{},{dataset:{sideTab:'details'}});assert.equal(sheet._coverSideTab,'details');
 Sheet.DEFAULT_OPTIONS.actions.dsa5hCoverSideTab.call(sheet,{},{dataset:{sideTab:'x'}});assert.equal(sheet._coverSideTab,'conditions');
 for(const k of ['NoConditions','ConditionsToStatus','NoPersonalDetails','EditInNotes'])assert(lookup(own,'DSA5HELPERS.'+k),k);
});
test('Hausregel Helfen: Knopf in den Kampf-Schnellaktionen nur bei aktiver Regel, Talentwahl, Probe über das System, QS-Hinweis im Chat',async()=>{
 const {help}=await houseRuleModules();const t=(k,d)=>d?k+':'+Object.values(d).join(','):k;
 assert.equal(help.helpMessage({helper:'Alrik',skill:'Einschüchtern',target:'Gerion',qs:2},t),'<strong>Title</strong><br>Chat.Success:Alrik,Einschüchtern,Chat.Target:Gerion,2<br><small>Chat.Manual</small>');
 assert.equal(help.helpMessage({helper:'Alrik',skill:'Einschüchtern',target:null,qs:0},t),'<strong>Title</strong><br>Chat.Failure:Alrik,Einschüchtern');
 const {sheet,actor}=await prepare();let active=false,chat=null,setup=null,dialog=null;
 const skill=actor.items.get('skill');skill.system.group={value:'social'};const other=item('other','skill');other.name='Klettern';other.system.group={value:'body'};actor.items.set('other',other);
 global.game={i18n:{localize,format:(k,d)=>localize(k).replace(/\{(\w+)\}/g,(m,x)=>d[x]??m),lang:'de'},settings:{get:(_m,k)=>k==='houseRules'?{helpAction:active}:'light'},user:{targets:{first:()=>({name:'Gerion'})}}};
 assert.deepEqual(help.skillOptions(actor).map(g=>[g.group,g.items.map(i=>i.id)]),[['body',['other']],['social',['skill']]],'Gruppen in Systemreihenfolge');
 const btn=html=>elements(html,el=>el.attribs?.['data-action']==='dsa5hHelpAction');
 assert.equal(btn(render(await sheet._prepareContext({}))).length,0,'Regel aus: kein Knopf');
 active=true;const html=render(await sheet._prepareContext({}));assert.equal(btn(html).length,1);
 let p=btn(html)[0];while(p&&!p.attribs?.['data-sub-panel'])p=p.parent;assert.equal(p?.attribs['data-sub-panel'],'combat:body','im Kampf-Reiter');
 global.foundry={utils:{escapeHTML:x=>String(x)},applications:{api:{DialogV2:{prompt:async o=>{dialog=o;return 'skill';}}}}};
 global.ChatMessage={getSpeaker:()=>({alias:'x'}),create:async m=>{chat=m;}};global.ui={notifications:{warn(){}}};
 actor.setupSkill=async(s,o)=>{setup={s,o};return {testData:{},cardOptions:{}};};actor.basicTest=async()=>({result:{successLevel:1,qualityStep:3}});actor.name='Alrik';
 await Sheet.DEFAULT_OPTIONS.ownerRollActions.dsa5hHelpAction.call(sheet,{},{});
 assert(dialog.content.includes('<optgroup')&&dialog.content.includes('Gerion'),'Talentauswahl nach Gruppen, markiertes Ziel genannt');
 assert(dialog.content.includes('name="search"')&&typeof dialog.render==='function','Suchfeld im Dialog');
 // Suche ohne DOM: kleine Attrappe mit <option>/<optgroup>-Verhalten.
 const opt=(v,t)=>({value:v,textContent:t,hidden:false,scrollIntoView(){},get selected(){return sel.value===v;}});
 const g1={children:[opt('a','Klettern (6)'),opt('b','Kraftakt (2)')],hidden:false},g2={children:[opt('c','Einschüchtern (8)')],hidden:false};
 const listeners={},inputL={};const input={value:'',addEventListener:(t,f)=>{inputL[t]=f;}};
 const sel={value:'',options:[...g1.children,...g2.children],querySelectorAll:()=>[g1,g2],get selectedOptions(){return this.options.filter(o=>o.value===this.value);},addEventListener:(t,f)=>{listeners[t]=f;}};
 let ok=0;help.attachSkillSearch({querySelector:q=>q.includes('search')?input:q.includes('select')?sel:{click(){ok++;}}});
 assert.equal(sel.value,'a','ohne Auswahl der erste Eintrag');
 input.value='einsch';inputL.input();assert.equal(sel.value,'c');assert(g1.hidden&&!g2.hidden,'leere Gruppe ausgeblendet');
 input.value='kr';inputL.input();assert.equal(sel.value,'b');inputL.keydown({key:'ArrowUp',preventDefault(){}});assert.equal(sel.value,'b','nur sichtbare Treffer');
 listeners.dblclick();assert.equal(ok,1,'Doppelklick würfelt');
 assert.equal(setup.s,skill,'Probe über den Probendialog des Systems');assert(chat.content.includes('3')&&chat.content.includes('Gerion'),'QS und Ziel im Chat');
 assert(!chat.whisper,'öffentlich, damit der Unterstützte es sieht');
});
test('Fokus in Eingabefeldern bleibt nach dem Neuzeichnen erhalten (Tab durch Notizen › Persönliche Daten)',async()=>{
 const {sheet}=await prepare();global.CSS??={escape:x=>String(x)};
 const field={dataset:{},id:'',name:'system.details.age.value',tagName:'INPUT',selectionStart:3,selectionEnd:3,closest(){return this;}};
 const prevDoc=global.document;global.document={...prevDoc,activeElement:field};
 sheet.element={contains:()=>true};const key=sheet._focusKey();
 assert.deepEqual(key,{selector:'INPUT[name="system.details.age.value"]',start:3,end:3},'auch Felder ohne data-action werden gemerkt');
 let focused=null,range=null;const fresh={focus(o){focused=o;},setSelectionRange(a,b){range=[a,b];}};
 global.document={...prevDoc,activeElement:null};sheet.element={querySelector:sel=>sel===key.selector?fresh:null};
 sheet._restoreFocus(key);assert(focused,'neues Feld fokussiert');assert.deepEqual(range,[3,3],'Cursorposition übernommen');
 const src=read('scripts/sheets/dsa5-helpers-character-sheet.js');assert(src.indexOf('this._applyCurrentTab();',src.indexOf('async _onRender'))<src.indexOf('this._restoreFocus(this._pendingFocus)'),'erst Reiter sichtbar machen, dann fokussieren');
 global.document=prevDoc;
});

// Talent-Vorschläge (2026-10-06): Bewertung ohne Foundry, Anfragen aus dem Chat, Karten auf dem Titelblatt.
const suggestionModules=async()=>{const score=await import(dataUrl(read('scripts/skill-suggestions/score.js')));const context=await import(suggestionsUrl());return {score,context};};
test('Vorschläge: Erfolgschance der 3W20-Probe exakt, inkl. Doppel-1 und Doppel-20',async()=>{
 const {score}=await suggestionModules();
 assert.equal(score.successChance([20,20,20],0),1-(1+3*19)/8000,'nur zwei/drei Zwanzigen misslingen');
 const low=score.successChance([1,1,1],0);assert.equal(low,(1+3*19)/8000,'nur zwei/drei Einsen gelingen');
 assert(score.successChance([14,14,14],10)>score.successChance([11,11,11],10));
 assert(score.successChance([12,12,12],5,2)>score.successChance([12,12,12],5),'Erleichterung hebt die Chance');
 const now=Date.now(),day=86400000;assert.equal(score.decay(4,now-14*day,now,14),2);
 const bumped=score.bumpUsage({s:2,t:now-14*day},now);assert.equal(bumped.s,2);assert.equal(bumped.t,now);
});
test('Vorschläge: Anfragen vorn, Favoriten raus, Nutzung/Spezialist/Kampf/Steigerung zählen, FW 0 nur bei Bedarf',async()=>{
 const {score}=await suggestionModules();const now=Date.now();
 const sk=(id,fw,a=12)=>({id,name:id,fw,attributes:[a,a,a]});
 const skills=[sk('Klettern',6),sk('Sinnesschärfe',8),sk('Zechen',3),sk('Reiten',4),sk('Tanzen',0,16),sk('Schwimmen',2),sk('Kraftakt',5),sk('Fliegen',0),sk('Lesen',10),sk('Malen',1)];
 const ranked=score.rankSuggestions({skills,now,requests:{Fliegen:{messageId:'m1',modifier:-2}},usage:{Zechen:{s:6,t:now}},advanced:{Malen:now},othersBest:{Reiten:2},inCombat:true,combatSkills:new Set(['Kraftakt']),classicSkills:new Set(['Sinnesschärfe']),favorites:new Set(['Lesen'])});
 assert.equal(ranked[0].id,'Fliegen');assert.equal(ranked[0].reason,'requested');assert.equal(ranked[0].messageId,'m1');assert.equal(ranked[0].modifier,-2);
 assert.equal(ranked.length,6);assert(!ranked.some(r=>r.id==='Lesen'),'Favoriten fallen heraus');assert(!ranked.some(r=>r.id==='Tanzen'),'FW 0 ohne Nutzung fällt heraus');
 const reason=id=>ranked.find(r=>r.id===id)?.reason;
 assert.equal(reason('Zechen'),'usage');assert.equal(reason('Reiten'),'specialist');assert.equal(reason('Kraftakt'),'combat');assert.equal(reason('Malen'),'advanced');
});
test('Vorschläge: offene Anfragen und @Rq-Links aus dem Chat',async()=>{
 const {context}=await suggestionModules();const now=Date.now();
 assert.deepEqual(context.parseRequestLink('Klettern -1'),{name:'Klettern',modifier:-1});assert.deepEqual(context.parseRequestLink('Bekehren & Überzeugen'),{name:'Bekehren & Überzeugen',modifier:0});assert.deepEqual(context.parseRequestLink('Fliegen 2'),{name:'Fliegen',modifier:2});assert.deepEqual(context.parseRequestLink('Klettern -1 options={"attrs":"MU,GE,KK"}'),{name:'Klettern',modifier:-1});
 const req=(id,status,extra={})=>({id,timestamp:now,flags:{dsa5:{rollRequest:{category:'skill',name:'Klettern',modifier:1,finalized:false,recipients:[{actorId:'a1',status}],...extra}}}});
 const {requests,mentions}=context.chatRequests({id:'a1'},[req('m0','unowned',{name:'Fliegen'}),req('m1','pending'),{id:'m6',timestamp:now,content:'<p>@RQ[Bekehren &amp; Überzeugen&nbsp;-1]</p>'},{id:'m7',timestamp:now,content:'<p><a class="roll-button request-roll" data-type="skill" data-modifier="2" data-name="Fliegen">Fliegen +2</a></p>'},req('m2','success',{name:'Reiten'}),req('m3','pending',{name:'Zechen',finalized:true}),{id:'m4',timestamp:now,content:'Bitte @Rq[Schwimmen +2] würfeln'},{id:'m5',timestamp:now-20*60000,content:'@Rq[Tanzen]'}],now);
 assert.deepEqual(requests,{Fliegen:{messageId:'m0',modifier:1},Klettern:{messageId:'m1',modifier:1}},'auch ohne Spieler online (unowned)');assert.deepEqual(mentions,{'Bekehren & Überzeugen':{modifier:-1},Fliegen:{modifier:2},Schwimmen:{modifier:2}});
});
test('Vorschläge: sechs Karten im Titelblatt, würfelbar wie Favoriten, offene Anfrage über den RollRequestService',async()=>{
 await loadSheet();global.game={i18n:{localize},settings:{get:()=> 'light'},user:{targets:{first:()=>undefined}}};
 const {sheet,actor}=await prepare();
 assert.equal((await sheet._prepareContext({})).dsa5h.suggestions.length,0,'einziges Talent ist Favorit');
 actor.flags.favorites=['weapon'];const context=await sheet._prepareContext({});const list=context.dsa5h.suggestions;assert(context.owner);
 assert(list.length>0&&list.length<=6);for(const e of list)assert(e.reasonLabel&&!e.reasonLabel.startsWith('DSA5HELPERS'),e.reasonLabel);
 const html=render(context);const cover=elements(html,el=>el.attribs?.['data-tab-panel']==='cover')[0];
 const cards=dom.findAll(el=>String(el.attribs?.class??'').includes('dsa5h-suggest-card'),cover.children);assert.equal(cards.length,list.length);
 assert(dom.findAll(el=>el.attribs?.['data-action']==='skillSelect',cards).length===list.length);
 const stars=dom.findAll(el=>el.attribs?.['data-action']==='dsa5hFavorite',cards);assert.equal(stars.length,list.length,'Favoritenstern je Vorschlag');for(const st of stars)assert.equal(st.attribs['aria-pressed'],'false');
 const calls=[];global.game.dsa5={queries:{RollRequestService:{triggerRollFromCard:(m,a)=>calls.push([m,a])}}};sheet.actor.isOwner=true;
 await Sheet.DEFAULT_OPTIONS.ownerRollActions.dsa5hAnswerRequest.call(sheet,{}, {dataset:{which:'msg1'}});assert.deepEqual(calls,[['msg1',sheet.actor.id]]);
});
