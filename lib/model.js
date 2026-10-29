import { randomUUID } from 'node:crypto';
const stages=['found','linked','draft','approved','published'];
export function https(value){try{const url=new URL(value);return url.protocol==='https:'&&!url.username&&!url.password?url.href:null}catch{return null}}
const limits={id:180,title:300,category:20,store:30,url:4000,affiliate:4000,coupon:100,notes:2000,text:15000,kind:30,createdAt:40,updatedAt:40,approvedAt:40,publishedAt:40,researchedOn:10,sourceURL:4000,sourceAge:200,priceContext:1200,image:4000,imageSource:4000};
function invalid(message){throw Object.assign(new Error(message),{status:400})}
export function normalizeOffer(input){
 if(!input||typeof input!=='object'||Array.isArray(input))invalid('Oferta inválida.');
 const item={};for(const [key,max] of Object.entries(limits)){if(input[key]!==undefined&&input[key]!==null){if(typeof input[key]!=='string'||input[key].length>max)invalid('Campo inválido: '+key);item[key]=input[key]}}
 item.title=item.title?.trim();if(!item.id||!/^[a-zA-Z0-9_-]+$/.test(item.id)||!item.title||!['Casa','Beleza'].includes(item.category)||!['Mercado Livre','Shopee'].includes(item.store)||!https(item.url))invalid('Confira nome, categoria, loja e link.');
 if(!Number.isFinite(input.price)||input.price<=0||input.price>1000000)invalid('Preço inválido.');item.price=input.price;
 item.oldPrice=input.oldPrice??null;if(item.oldPrice!==null&&(!Number.isFinite(item.oldPrice)||item.oldPrice<=item.price))invalid('Preço anterior inválido.');
 item.stage=input.stage;if(!stages.includes(item.stage))invalid('Etapa inválida.');
 item.affiliate=item.affiliate||'';item.text=item.text||'';item.coupon=item.coupon||'';item.notes=item.notes||'';
 if(item.affiliate&&!https(item.affiliate))invalid('Link de afiliado inválido.');if(item.stage!=='found'&&!item.affiliate)invalid('A etapa exige seu link de afiliado.');
 if(['draft','approved','published'].includes(item.stage)&&!item.text.trim())invalid('Informe o texto da mensagem.');
 if(['approved','published'].includes(item.stage)&&(!item.text.includes(item.affiliate)||!item.approvedAt||!Number.isFinite(Date.parse(item.approvedAt))))invalid('A mensagem aprovada deve conter o link e o registro de aprovação.');
 if(item.stage==='published'&&(!item.publishedAt||!Number.isFinite(Date.parse(item.publishedAt))))invalid('Confirme a publicação manual.');
 if(item.image&&!/^assets\/[a-z0-9-]+\.jpg$/.test(item.image)){const url=https(item.image);const host=url&&new URL(url).hostname;if(!host||!['down-br.img.susercontent.com','http2.mlstatic.com'].includes(host))delete item.image}
 for(const key of ['sourceURL','imageSource'])if(item[key]&&!https(item[key]))delete item[key];
 item.demo=false;return item;
}
export function normalizeOffers(input){if(!Array.isArray(input)||input.length>2000)invalid('Limite de 2.000 ofertas por espaço.');const offers=input.map(normalizeOffer);if(new Set(offers.map(o=>o.id)).size!==offers.length)invalid('Existem ofertas duplicadas.');return offers}
export function newWorkspace(seed){return {schema:1,revision:randomUUID(),offers:normalizeOffers(seed),updatedAt:new Date().toISOString()}}
