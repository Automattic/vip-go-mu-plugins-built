/*! For license information please see view.js.LICENSE.txt */
(()=>{var i={79162:(i,o,e)=>{"use strict";e.d(o,{Vm:()=>t,hj:()=>r});var s=e(43317);const n={USD:.5,AUD:.5,BRL:.5,CAD:.5,CHF:.5,DKK:2.5,EUR:.5,GBP:.3,HKD:4,INR:.5,JPY:50,MXN:10,NOK:3,NZD:.5,PLN:2,SEK:3,SGD:.5};Object.keys(n).map((i=>{const{symbol:o}=(0,s.X)(i);var e;return{value:i,label:o===i?i:`${i} ${e=o,String(e||"").replace(/\.+$/,"")}`}}));function r(i){return n[i]}function t(i,o){return i?"number"==typeof i?i:(i=parseFloat(i.replace(new RegExp("\\"+s.M[o].grouping,"g"),"").replace(new RegExp("\\"+s.M[o].decimal,"g"),".")),isNaN(i)?null:i):null}},63166:(i,o,e)=>{"use strict";function s(i){if("https://subscribe.wordpress.com"===i.origin&&i.data){const o=JSON.parse(i.data);o&&"close"===o.action&&(window.removeEventListener("message",s),tb_remove())}}e.d(o,{fc:()=>n});const n=i=>{Array.prototype.slice.call(document.querySelectorAll(i)).forEach((i=>{if("true"!==i.getAttribute("data-jetpack-memberships-button-initialized")){try{!function(i){i.addEventListener("click",(o=>{o.preventDefault();const e=i.getAttribute("href");window.scrollTo(0,0),tb_show(null,e+"&display=alternate&TB_iframe=true",null),window.addEventListener("message",s,!1),document.querySelector("#TB_window").classList.add("jetpack-memberships-modal"),window.scrollTo(0,0)}))}(i)}catch(i){console.error("Problem setting up Thickbox",i)}i.setAttribute("data-jetpack-memberships-button-initialized","true")}}))}},80425:(i,o,e)=>{"object"==typeof window&&window.Jetpack_Block_Assets_Base_Url&&window.Jetpack_Block_Assets_Base_Url.url&&(e.p=window.Jetpack_Block_Assets_Base_Url.url)},43317:(i,o,e)=>{"use strict";e.d(o,{M:()=>s,X:()=>n});const s={AED:{symbol:"د.إ.‏",grouping:",",decimal:".",precision:2},AFN:{symbol:"؋",grouping:",",decimal:".",precision:2},ALL:{symbol:"Lek",grouping:".",decimal:",",precision:2},AMD:{symbol:"֏",grouping:",",decimal:".",precision:2},ANG:{symbol:"ƒ",grouping:",",decimal:".",precision:2},AOA:{symbol:"Kz",grouping:",",decimal:".",precision:2},ARS:{symbol:"$",grouping:".",decimal:",",precision:2},AUD:{symbol:"A$",grouping:",",decimal:".",precision:2},AWG:{symbol:"ƒ",grouping:",",decimal:".",precision:2},AZN:{symbol:"₼",grouping:" ",decimal:",",precision:2},BAM:{symbol:"КМ",grouping:".",decimal:",",precision:2},BBD:{symbol:"Bds$",grouping:",",decimal:".",precision:2},BDT:{symbol:"৳",grouping:",",decimal:".",precision:0},BGN:{symbol:"лв.",grouping:" ",decimal:",",precision:2},BHD:{symbol:"د.ب.‏",grouping:",",decimal:".",precision:3},BIF:{symbol:"FBu",grouping:",",decimal:".",precision:0},BMD:{symbol:"$",grouping:",",decimal:".",precision:2},BND:{symbol:"$",grouping:".",decimal:",",precision:0},BOB:{symbol:"Bs",grouping:".",decimal:",",precision:2},BRL:{symbol:"R$",grouping:".",decimal:",",precision:2},BSD:{symbol:"$",grouping:",",decimal:".",precision:2},BTC:{symbol:"Ƀ",grouping:",",decimal:".",precision:2},BTN:{symbol:"Nu.",grouping:",",decimal:".",precision:1},BWP:{symbol:"P",grouping:",",decimal:".",precision:2},BYR:{symbol:"р.",grouping:" ",decimal:",",precision:2},BZD:{symbol:"BZ$",grouping:",",decimal:".",precision:2},CAD:{symbol:"C$",grouping:",",decimal:".",precision:2},CDF:{symbol:"FC",grouping:",",decimal:".",precision:2},CHF:{symbol:"CHF",grouping:"'",decimal:".",precision:2},CLP:{symbol:"$",grouping:".",decimal:",",precision:2},CNY:{symbol:"¥",grouping:",",decimal:".",precision:2},COP:{symbol:"$",grouping:".",decimal:",",precision:2},CRC:{symbol:"₡",grouping:".",decimal:",",precision:2},CUC:{symbol:"CUC",grouping:",",decimal:".",precision:2},CUP:{symbol:"$MN",grouping:",",decimal:".",precision:2},CVE:{symbol:"$",grouping:",",decimal:".",precision:2},CZK:{symbol:"Kč",grouping:" ",decimal:",",precision:2},DJF:{symbol:"Fdj",grouping:",",decimal:".",precision:0},DKK:{symbol:"kr.",grouping:"",decimal:",",precision:2},DOP:{symbol:"RD$",grouping:",",decimal:".",precision:2},DZD:{symbol:"د.ج.‏",grouping:",",decimal:".",precision:2},EGP:{symbol:"ج.م.‏",grouping:",",decimal:".",precision:2},ERN:{symbol:"Nfk",grouping:",",decimal:".",precision:2},ETB:{symbol:"ETB",grouping:",",decimal:".",precision:2},EUR:{symbol:"€",grouping:".",decimal:",",precision:2},FJD:{symbol:"FJ$",grouping:",",decimal:".",precision:2},FKP:{symbol:"£",grouping:",",decimal:".",precision:2},GBP:{symbol:"£",grouping:",",decimal:".",precision:2},GEL:{symbol:"Lari",grouping:" ",decimal:",",precision:2},GHS:{symbol:"₵",grouping:",",decimal:".",precision:2},GIP:{symbol:"£",grouping:",",decimal:".",precision:2},GMD:{symbol:"D",grouping:",",decimal:".",precision:2},GNF:{symbol:"FG",grouping:",",decimal:".",precision:0},GTQ:{symbol:"Q",grouping:",",decimal:".",precision:2},GYD:{symbol:"G$",grouping:",",decimal:".",precision:2},HKD:{symbol:"HK$",grouping:",",decimal:".",precision:2},HNL:{symbol:"L.",grouping:",",decimal:".",precision:2},HRK:{symbol:"kn",grouping:".",decimal:",",precision:2},HTG:{symbol:"G",grouping:",",decimal:".",precision:2},HUF:{symbol:"Ft",grouping:".",decimal:",",precision:0},IDR:{symbol:"Rp",grouping:".",decimal:",",precision:0},ILS:{symbol:"₪",grouping:",",decimal:".",precision:2},INR:{symbol:"₹",grouping:",",decimal:".",precision:2},IQD:{symbol:"د.ع.‏",grouping:",",decimal:".",precision:2},IRR:{symbol:"﷼",grouping:",",decimal:"/",precision:2},ISK:{symbol:"kr.",grouping:".",decimal:",",precision:0},JMD:{symbol:"J$",grouping:",",decimal:".",precision:2},JOD:{symbol:"د.ا.‏",grouping:",",decimal:".",precision:3},JPY:{symbol:"¥",grouping:",",decimal:".",precision:0},KES:{symbol:"S",grouping:",",decimal:".",precision:2},KGS:{symbol:"сом",grouping:" ",decimal:"-",precision:2},KHR:{symbol:"៛",grouping:",",decimal:".",precision:0},KMF:{symbol:"CF",grouping:",",decimal:".",precision:2},KPW:{symbol:"₩",grouping:",",decimal:".",precision:0},KRW:{symbol:"₩",grouping:",",decimal:".",precision:0},KWD:{symbol:"د.ك.‏",grouping:",",decimal:".",precision:3},KYD:{symbol:"$",grouping:",",decimal:".",precision:2},KZT:{symbol:"₸",grouping:" ",decimal:"-",precision:2},LAK:{symbol:"₭",grouping:",",decimal:".",precision:0},LBP:{symbol:"ل.ل.‏",grouping:",",decimal:".",precision:2},LKR:{symbol:"₨",grouping:",",decimal:".",precision:0},LRD:{symbol:"L$",grouping:",",decimal:".",precision:2},LSL:{symbol:"M",grouping:",",decimal:".",precision:2},LYD:{symbol:"د.ل.‏",grouping:",",decimal:".",precision:3},MAD:{symbol:"د.م.‏",grouping:",",decimal:".",precision:2},MDL:{symbol:"lei",grouping:",",decimal:".",precision:2},MGA:{symbol:"Ar",grouping:",",decimal:".",precision:0},MKD:{symbol:"ден.",grouping:".",decimal:",",precision:2},MMK:{symbol:"K",grouping:",",decimal:".",precision:2},MNT:{symbol:"₮",grouping:" ",decimal:",",precision:2},MOP:{symbol:"MOP$",grouping:",",decimal:".",precision:2},MRO:{symbol:"UM",grouping:",",decimal:".",precision:2},MTL:{symbol:"₤",grouping:",",decimal:".",precision:2},MUR:{symbol:"₨",grouping:",",decimal:".",precision:2},MVR:{symbol:"MVR",grouping:",",decimal:".",precision:1},MWK:{symbol:"MK",grouping:",",decimal:".",precision:2},MXN:{symbol:"MX$",grouping:",",decimal:".",precision:2},MYR:{symbol:"RM",grouping:",",decimal:".",precision:2},MZN:{symbol:"MT",grouping:",",decimal:".",precision:0},NAD:{symbol:"N$",grouping:",",decimal:".",precision:2},NGN:{symbol:"₦",grouping:",",decimal:".",precision:2},NIO:{symbol:"C$",grouping:",",decimal:".",precision:2},NOK:{symbol:"kr",grouping:" ",decimal:",",precision:2},NPR:{symbol:"₨",grouping:",",decimal:".",precision:2},NZD:{symbol:"NZ$",grouping:",",decimal:".",precision:2},OMR:{symbol:"﷼",grouping:",",decimal:".",precision:3},PAB:{symbol:"B/.",grouping:",",decimal:".",precision:2},PEN:{symbol:"S/.",grouping:",",decimal:".",precision:2},PGK:{symbol:"K",grouping:",",decimal:".",precision:2},PHP:{symbol:"₱",grouping:",",decimal:".",precision:2},PKR:{symbol:"₨",grouping:",",decimal:".",precision:2},PLN:{symbol:"zł",grouping:" ",decimal:",",precision:2},PYG:{symbol:"₲",grouping:".",decimal:",",precision:2},QAR:{symbol:"﷼",grouping:",",decimal:".",precision:2},RON:{symbol:"lei",grouping:".",decimal:",",precision:2},RSD:{symbol:"Дин.",grouping:".",decimal:",",precision:2},RUB:{symbol:"₽",grouping:" ",decimal:",",precision:2},RWF:{symbol:"RWF",grouping:" ",decimal:",",precision:2},SAR:{symbol:"﷼",grouping:",",decimal:".",precision:2},SBD:{symbol:"S$",grouping:",",decimal:".",precision:2},SCR:{symbol:"₨",grouping:",",decimal:".",precision:2},SDD:{symbol:"LSd",grouping:",",decimal:".",precision:2},SDG:{symbol:"£‏",grouping:",",decimal:".",precision:2},SEK:{symbol:"kr",grouping:",",decimal:".",precision:2},SGD:{symbol:"S$",grouping:",",decimal:".",precision:2},SHP:{symbol:"£",grouping:",",decimal:".",precision:2},SLL:{symbol:"Le",grouping:",",decimal:".",precision:2},SOS:{symbol:"S",grouping:",",decimal:".",precision:2},SRD:{symbol:"$",grouping:",",decimal:".",precision:2},STD:{symbol:"Db",grouping:",",decimal:".",precision:2},SVC:{symbol:"₡",grouping:",",decimal:".",precision:2},SYP:{symbol:"£",grouping:",",decimal:".",precision:2},SZL:{symbol:"E",grouping:",",decimal:".",precision:2},THB:{symbol:"฿",grouping:",",decimal:".",precision:2},TJS:{symbol:"TJS",grouping:" ",decimal:";",precision:2},TMT:{symbol:"m",grouping:" ",decimal:",",precision:0},TND:{symbol:"د.ت.‏",grouping:",",decimal:".",precision:3},TOP:{symbol:"T$",grouping:",",decimal:".",precision:2},TRY:{symbol:"TL",grouping:".",decimal:",",precision:2},TTD:{symbol:"TT$",grouping:",",decimal:".",precision:2},TVD:{symbol:"$T",grouping:",",decimal:".",precision:2},TWD:{symbol:"NT$",grouping:",",decimal:".",precision:2},TZS:{symbol:"TSh",grouping:",",decimal:".",precision:2},UAH:{symbol:"₴",grouping:" ",decimal:",",precision:2},UGX:{symbol:"USh",grouping:",",decimal:".",precision:2},USD:{symbol:"$",grouping:",",decimal:".",precision:2},UYU:{symbol:"$U",grouping:".",decimal:",",precision:2},UZS:{symbol:"сўм",grouping:" ",decimal:",",precision:2},VEB:{symbol:"Bs.",grouping:",",decimal:".",precision:2},VEF:{symbol:"Bs. F.",grouping:".",decimal:",",precision:2},VND:{symbol:"₫",grouping:".",decimal:",",precision:1},VUV:{symbol:"VT",grouping:",",decimal:".",precision:0},WST:{symbol:"WS$",grouping:",",decimal:".",precision:2},XAF:{symbol:"F",grouping:",",decimal:".",precision:2},XCD:{symbol:"$",grouping:",",decimal:".",precision:2},XOF:{symbol:"F",grouping:" ",decimal:",",precision:2},XPF:{symbol:"F",grouping:",",decimal:".",precision:2},YER:{symbol:"﷼",grouping:",",decimal:".",precision:2},ZAR:{symbol:"R",grouping:" ",decimal:",",precision:2},ZMW:{symbol:"ZK",grouping:",",decimal:".",precision:2},WON:{symbol:"₩",grouping:",",decimal:".",precision:2}};function n(i){return s[i]||{symbol:"$",grouping:",",decimal:".",precision:2}}},25607:(i,o,e)=>{"use strict";e.d(o,{ZP:()=>r});var s=e(43317),n=e(5375);function r(i,o){let e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};const r=(0,s.X)(o);if(!r||isNaN(i))return null;const{decimal:t,grouping:c,precision:l,symbol:m}={...r,...e},a=i<0?"-":"";let p=(0,n.Z)(Math.abs(i),l,t,c);return e.stripZeros&&(p=function(i,o){const e=new RegExp(`\\${o}0+$`);return i.replace(e,"")}(p,t)),`${a}${m}${p}`}},5375:(i,o,e)=>{"use strict";function s(i){let o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:".",s=arguments.length>3&&void 0!==arguments[3]?arguments[3]:",";const n=(i+"").replace(/[^0-9+\-Ee.]/g,""),r=isFinite(+n)?+n:0,t=isFinite(+o)?Math.abs(o):0,c=(t?function(i,o){const e=Math.pow(10,o);return""+(Math.round(i*e)/e).toFixed(o)}(r,t):""+Math.round(r)).split(".");return c[0].length>3&&(c[0]=c[0].replace(/\B(?=(?:\d{3})+(?!\d))/g,s)),(c[1]||"").length<t&&(c[1]=c[1]||"",c[1]+=new Array(t-c[1].length+1).join("0")),c.join(e)}e.d(o,{Z:()=>s})},47701:i=>{"use strict";i.exports=window.wp.domReady},96483:i=>{"use strict";i.exports=window.wp.url}},o={};function e(s){var n=o[s];if(void 0!==n)return n.exports;var r=o[s]={exports:{}};return i[s](r,r.exports,e),r.exports}e.n=i=>{var o=i&&i.__esModule?()=>i.default:()=>i;return e.d(o,{a:o}),o},e.d=(i,o)=>{for(var s in o)e.o(o,s)&&!e.o(i,s)&&Object.defineProperty(i,s,{enumerable:!0,get:o[s]})},e.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(i){if("object"==typeof window)return window}}(),e.o=(i,o)=>Object.prototype.hasOwnProperty.call(i,o),(()=>{var i;e.g.importScripts&&(i=e.g.location+"");var o=e.g.document;if(!i&&o&&(o.currentScript&&(i=o.currentScript.src),!i)){var s=o.getElementsByTagName("script");s.length&&(i=s[s.length-1].src)}if(!i)throw new Error("Automatic publicPath is not supported in this browser");i=i.replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),e.p=i+"../"})(),(()=>{"use strict";e(80425)})(),(()=>{"use strict";var i=e(25607),o=e(47701),s=e.n(o),n=e(96483),r=e(79162),t=e(63166);class c{constructor(i){this.block=i,this.amount=null,this.isCustomAmount=!1,this.interval="one-time",this.initNavigation(),this.handleCustomAmount(),this.handleChosenAmount(),this.block.querySelector(".donations__container").classList.add("loaded")}getNavItem(i){return this.block.querySelector(`.donations__nav-item[data-interval="${i}"]`)}resetSelectedAmount(){const i=this.block.querySelector(".donations__amount.is-selected");i&&i.classList.remove("is-selected")}getDonateButton(){return this.block.querySelector(`.donations__donate-button.${{"one-time":"donations__one-time-item","1 month":"donations__monthly-item","1 year":"donations__annual-item"}[this.interval]}`)}toggleDonateButton(i){const o=this.getDonateButton();i?o.classList.remove("is-disabled"):o.classList.add("is-disabled")}updateUrl(){const i=this.getDonateButton(),o=i.getAttribute("href");this.amount?i.setAttribute("href",(0,n.addQueryArgs)(o,{amount:this.amount,...this.isCustomAmount&&{customAmount:!0}})):i.setAttribute("href",(0,n.removeQueryArgs)(o,"amount","customAmount"))}updateAmountFromCustomAmountInput(){const i=this.block.querySelector(".donations__custom-amount .donations__amount-value"),o=this.block.querySelector(".donations__custom-amount"),e=i.innerHTML;if(!e)return this.amount=null,void this.toggleDonateButton(!1);const s=i.dataset.currency,n=(0,r.Vm)(e,s);n&&n>=(0,r.hj)(s)?(o.classList.remove("has-error"),this.amount=n,this.toggleDonateButton(!0)):(o.classList.add("has-error"),this.amount=null,this.toggleDonateButton(!1)),this.updateUrl()}initNavigation(){const i=this.block.querySelectorAll(".donations__nav-item"),o=this.block.querySelector(".donations__tab"),e={"one-time":"is-one-time","1 month":"is-monthly","1 year":"is-annual"},s=i=>{const s=this.interval,n=i.target.dataset.interval;this.interval=n;const r=this.getNavItem(s);r&&r.classList.remove("is-active");const t=this.getNavItem(n);t&&t.classList.add("is-active"),o.classList.remove(e[s]),o.classList.add(e[n]),this.amount=null,this.isCustomAmount=!1,this.resetSelectedAmount(),this.updateUrl(),this.toggleDonateButton(!1)};i.forEach((i=>{i.addEventListener("click",s),i.addEventListener("keydown",s)}));const n=this.getNavItem(this.interval);n&&n.classList.add("is-active"),o.classList.add(e[this.interval])}handleCustomAmount(){const o=this.block.querySelector(".donations__custom-amount .donations__amount-value");if(!o)return;const e=this.block.querySelector(".donations__custom-amount");o.setAttribute("contenteditable",""),o.addEventListener("keydown",(i=>{"Enter"===i.key&&i.preventDefault()})),o.addEventListener("focus",(()=>{this.resetSelectedAmount(),e.classList.add("is-selected"),this.isCustomAmount||(this.isCustomAmount=!0,this.updateAmountFromCustomAmountInput())})),o.addEventListener("blur",(()=>{this.isCustomAmount&&this.amount&&(o.innerHTML=(0,i.ZP)(this.amount,o.dataset.currency,{symbol:""}))})),o.addEventListener("input",(()=>this.updateAmountFromCustomAmountInput()))}handleChosenAmount(){this.block.querySelectorAll(".donations__amount:not( .donations__custom-amount )").forEach((i=>{i.addEventListener("click",(i=>{this.resetSelectedAmount(),i.target.classList.add("is-selected"),this.amount=i.target.dataset.amount,this.isCustomAmount=!1;const o=this.block.querySelector(".donations__custom-amount");o&&o.classList.remove("has-error"),this.updateUrl();this.getDonateButton().classList.remove("is-disabled")}))})),this.block.querySelectorAll(".donations__donate-button").forEach((i=>i.classList.add("is-disabled")))}}s()((()=>{document.querySelectorAll(".wp-block-jetpack-donations").forEach((i=>new c(i))),(0,t.fc)(".donations__donate-button")}))})()})();