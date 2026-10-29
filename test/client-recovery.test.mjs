import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
async function boot({conflict=false}={}){
 const key='garimpo-platform-v1';const item={id:'local-draft',title:'Rascunho não sincronizado',text:'Mensagem editada'};const memory=new Map([[key+'-cloud-outbox',JSON.stringify({revision:'r1',offers:[item]})]]);const nodes=new Map();let server=[{id:'server-version',title:'Versão anterior'}];
 function node(id){if(!nodes.has(id))nodes.set(id,{dataset:{},hidden:false,textContent:'',innerHTML:'',classList:{add(){},remove(){}},querySelector(s){return node(id+' '+s)}});return nodes.get(id)}
 const context=vm.createContext({console,KEY:key,offers:[],view:'overview',persist(){memory.set(key,JSON.stringify(context.offers));return true},render(){},esc:String,validate:o=>typeof o.id==='string',toast(){},confirm:()=>true,window:{addEventListener(){}},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},document:{body:{classList:{add(){},remove(){}}},querySelector:node,querySelectorAll:()=>[]},fetch:async(path,options)=>{if(path==='/api/session')return new Response(JSON.stringify({authenticated:true}));if(options?.method==='PUT'){if(conflict)return new Response(JSON.stringify({error:'Conflito de revisão'}),{status:409});const body=JSON.parse(options.body);assert.equal(body.revision,'r1');server=body.offers;return new Response(JSON.stringify({revision:'r2',offers:server}))}return new Response(JSON.stringify({revision:conflict?'other-revision':'r1',offers:server,research:{status:'pending_configuration'}}))}});
 vm.runInContext(readFileSync('dist/cloud.js','utf8'),context);
 for(let i=0;i<8;i++)await new Promise(resolve=>setImmediate(resolve));
 return {memory,nodes,context,server:()=>server};
}
test('reabrir a página recupera o rascunho pendente e só limpa a fila após confirmação do servidor',async()=>{const app=await boot();assert.equal(app.server()[0].id,'local-draft');assert.equal(app.memory.has('garimpo-platform-v1-cloud-outbox'),false);assert.equal(app.context.offers[0].text,'Mensagem editada')});
test('conflito na recuperação preserva o rascunho e não sobrescreve a versão remota',async()=>{const app=await boot({conflict:true});assert.equal(app.server()[0].id,'server-version');assert.equal(app.context.offers[0].id,'local-draft');assert.equal(app.memory.has('garimpo-platform-v1-cloud-outbox'),true);assert.equal(app.nodes.get('#cloud-warning').hidden,false);assert.match(app.nodes.get('#cloud-status').textContent,/só neste navegador/)});
