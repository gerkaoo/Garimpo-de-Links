import { requireSession } from '../lib/auth.js';
import { json,error } from '../lib/http.js';
import { runPublicProbe } from '../lib/public-probe.js';
export default async function handler(req,res){try{requireSession(req);if(req.method!=='GET')return json(res,405,{error:'Método não permitido.'});return json(res,200,await runPublicProbe())}catch(err){return error(res,err)}}
