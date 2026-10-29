import { issueSession, hasSession, safeEqual, sessionCookie, requireOrigin } from '../lib/auth.js';
import { json, error, readBody } from '../lib/http.js';
export default async function handler(req,res){try{
 if(req.method==='GET')return json(res,200,{authenticated:hasSession(req)});
 requireOrigin(req);
 if(req.method==='DELETE'){res.setHeader('Set-Cookie',sessionCookie('',0));return json(res,200,{authenticated:false})}
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST, DELETE');return json(res,405,{error:'Método não permitido.'})}
 if(!process.env.ADMIN_PASSWORD||(process.env.AUTH_SECRET||'').length<32)return json(res,503,{error:'Configure o acesso privado no projeto da Vercel.'});
 const {password}=readBody(req);if(typeof password!=='string'||password.length>300||!safeEqual(password,process.env.ADMIN_PASSWORD))return json(res,401,{error:'Senha incorreta.'});
 res.setHeader('Set-Cookie',sessionCookie(issueSession()));return json(res,200,{authenticated:true});
 }catch(err){return error(res,err)}}
