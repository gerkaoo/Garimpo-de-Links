import { requireSession, requireOrigin } from '../lib/auth.js';
import { loadWorkspace, saveWorkspace, researchStatus } from '../lib/storage.js';
import { json, error, readBody } from '../lib/http.js';
export default async function handler(req,res){try{requireSession(req);
 if(req.method==='GET'){const record=await loadWorkspace();return json(res,200,{...record.data,research:await researchStatus()})}
 if(req.method==='PUT'){requireOrigin(req);const body=readBody(req);const data=await saveWorkspace(body.revision,body.offers);return json(res,200,data)}
 res.setHeader('Allow','GET, PUT');return json(res,405,{error:'Método não permitido.'});
 }catch(err){return error(res,err)}}
