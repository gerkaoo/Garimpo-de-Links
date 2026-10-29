// URLs extraídas dos anúncios originais; os arquivos são cópias das fotos, sem edição.
window.GARIMPO_PHOTOS={
 'web-shopee-1112216120-23593177233':{image:'assets/potes-vidro-shopee.jpg',imageSource:'https://down-br.img.susercontent.com/file/br-11134207-820m4-msve1y7r5v5z7a'},
 'web-shopee-333281563-17226918761':{image:'assets/necessaire-gancho-shopee.jpg',imageSource:'https://down-br.img.susercontent.com/file/f48751780cd7a41f1c88bdbfabc4b8bb'}
};
for(const item of window.GARIMPO_CATALOG?.offers||[]){const photo=window.GARIMPO_PHOTOS[item.id];if(photo)Object.assign(item,photo)}
