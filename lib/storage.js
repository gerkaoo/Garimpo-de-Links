import { get, put, head, BlobPreconditionFailedError, BlobNotFoundError } from '@vercel/blob';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { newWorkspace, normalizeOffers } from './model.js';
const WORKSPACE='garimpo/owner/workspace.json';const STATUS='garimpo/research/status.json';
export function createRepository(client={get,put,head},seedFactory=()=>JSON.parse(readFileSync(new URL('./seed.json',import.meta.url),'utf8'))){
function ready(){if(!process.env.BLOB_STORE_ID&&!process.env.BLOB_READ_WRITE_TOKEN)throw Object.assign(new Error('Armazenamento privado ainda não conectado.'),{status:503})}
async function read(path){ready();let metadata;try{metadata=await client.head(path)}catch(err){if(err instanceof BlobNotFoundError||err.name==='BlobNotFoundError')return null;throw err}if(!metadata)return null;const result=await client.get(path,{access:'private',useCache:false});if(!result||result.statusCode===404)return null;if(result.statusCode!==200||!metadata.etag)throw new Error('Unexpected blob response');return {data:JSON.parse(await new Response(result.stream).text()),etag:metadata.etag}}
async function loadWorkspace(){
 const record=await read(WORKSPACE);if(record)return record;
 const data=newWorkspace(seedFactory());
 try{await client.put(WORKSPACE,JSON.stringify(data),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json',cacheControlMaxAge:60})}catch(err){const retry=await read(WORKSPACE);if(retry)return retry;throw err}
 return await read(WORKSPACE);
}
async function saveWorkspace(revision,offers){
 const record=await loadWorkspace();if(typeof revision!=='string'||record.data.revision!==revision)throw Object.assign(new Error('Outra sessão alterou os dados. Exporte o rascunho local e atualize da nuvem antes de continuar.'),{status:409});
 const data={schema:1,revision:randomUUID(),offers:normalizeOffers(offers),updatedAt:new Date().toISOString()};
 try{await client.put(WORKSPACE,JSON.stringify(data),{access:'private',addRandomSuffix:false,allowOverwrite:true,ifMatch:record.etag,contentType:'application/json',cacheControlMaxAge:60})}catch(err){if(err instanceof BlobPreconditionFailedError||err.name==='BlobPreconditionFailedError')throw Object.assign(new Error('Os dados mudaram em outra sessão. Atualize da nuvem para continuar.'),{status:409});throw err}
 return data;
}
async function researchStatus(){return (await read(STATUS))?.data||{status:'pending_configuration',message:'Integração de busca adiada. Nenhuma loja conectada.',schedule:['08:00','12:00','16:00','20:00'],timezone:'America/Sao_Paulo',lastAttemptAt:null}}
async function recordResearchAttempt(slot){const data={status:'pending_configuration',message:'Integração de busca adiada pelo usuário. Nenhum preço ou produto novo foi coletado.',schedule:['08:00','12:00','16:00','20:00'],timezone:'America/Sao_Paulo',lastAttemptAt:new Date().toISOString(),slot};ready();await client.put(STATUS,JSON.stringify(data),{access:'private',addRandomSuffix:false,allowOverwrite:true,contentType:'application/json',cacheControlMaxAge:60});return data}
return {loadWorkspace,saveWorkspace,researchStatus,recordResearchAttempt};
}
export const {loadWorkspace,saveWorkspace,researchStatus,recordResearchAttempt}=createRepository();
