import { createHmac, createHash, timingSafeEqual, randomBytes } from 'node:crypto';
const COOKIE='garimpo_session';
export function safeEqual(a,b){const hash=s=>createHash('sha256').update(String(s)).digest();return timingSafeEqual(hash(a),hash(b))}
function configured(){return (process.env.AUTH_SECRET||'').length>=32&&(process.env.ADMIN_PASSWORD||'').length>=16}
function sign(value){return createHmac('sha256',process.env.AUTH_SECRET).update(value).digest('base64url')}
export function issueSession(now=Date.now()){
 if(!configured())throw Object.assign(new Error('Acesso privado ainda não configurado.'),{status:503});
 const payload=Buffer.from(JSON.stringify({sub:'owner',exp:now+7*86400000,nonce:randomBytes(16).toString('hex'),key:createHash('sha256').update(process.env.ADMIN_PASSWORD).digest('hex')})).toString('base64url');
 return payload+'.'+sign(payload);
}
export function verifySession(token,now=Date.now()){
 if(!configured()||typeof token!=='string'||token.length>2000)return false;
 const [payload,sig,...extra]=token.split('.');if(!payload||!sig||extra.length||!safeEqual(sig,sign(payload)))return false;
 try{const data=JSON.parse(Buffer.from(payload,'base64url'));return data.sub==='owner'&&Number.isFinite(data.exp)&&data.exp>now&&safeEqual(data.key,createHash('sha256').update(process.env.ADMIN_PASSWORD).digest('hex'))}catch{return false}
}
export function hasSession(req){const cookie=req.headers.cookie||'';const value=cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);return verifySession(value)}
export function sessionCookie(token,maxAge=604800){return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`}
export function sameOrigin(req){const origin=req.headers.origin;const host=req.headers.host;if(!origin||!host)return false;try{const url=new URL(origin);return url.host===host&&url.protocol==='https:'}catch{return false}}
export function requireSession(req){if(!hasSession(req))throw Object.assign(new Error('Entre para acessar seu espaço.'),{status:401})}
export function requireOrigin(req){if(!sameOrigin(req))throw Object.assign(new Error('Origem da solicitação inválida.'),{status:403})}
