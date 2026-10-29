import { safeEqual } from './auth.js';
import { json, error } from './http.js';
import { recordResearchAttempt } from './storage.js';
export function cron(slot){return async(req,res)=>{try{
 if(req.method!=='GET')return json(res,405,{error:'Método não permitido.'});
 const secret=process.env.CRON_SECRET;if(!secret||secret.length<32||!safeEqual(req.headers.authorization||'','Bearer '+secret))return json(res,401,{error:'Não autorizado.'});
 const status=await recordResearchAttempt(slot);return json(res,200,{...status,collected:0});
 }catch(err){return error(res,err)}}}
