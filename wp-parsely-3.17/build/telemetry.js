!function(){var e={873:function(e,t,n){var r=n(325).Symbol;e.exports=r},552:function(e,t,n){var r=n(873),o=n(659),i=n(350),a=r?r.toStringTag:void 0;e.exports=function(e){return null==e?void 0===e?"[object Undefined]":"[object Null]":a&&a in Object(e)?o(e):i(e)}},128:function(e,t,n){var r=n(800),o=/^\s+/;e.exports=function(e){return e?e.slice(0,r(e)+1).replace(o,""):e}},840:function(e,t,n){var r="object"==typeof n.g&&n.g&&n.g.Object===Object&&n.g;e.exports=r},659:function(e,t,n){var r=n(873),o=Object.prototype,i=o.hasOwnProperty,a=o.toString,c=r?r.toStringTag:void 0;e.exports=function(e){var t=i.call(e,c),n=e[c];try{e[c]=void 0;var r=!0}catch(e){}var o=a.call(e);return r&&(t?e[c]=n:delete e[c]),o}},350:function(e){var t=Object.prototype.toString;e.exports=function(e){return t.call(e)}},325:function(e,t,n){var r=n(840),o="object"==typeof self&&self&&self.Object===Object&&self,i=r||o||Function("return this")();e.exports=i},800:function(e){var t=/\s/;e.exports=function(e){for(var n=e.length;n--&&t.test(e.charAt(n)););return n}},602:function(e,t,n){var r=n(805),o=n(124),i=n(374),a=Math.max,c=Math.min;e.exports=function(e,t,n){var u,l,s,f,p,d,v=0,y=!1,b=!1,h=!0;if("function"!=typeof e)throw new TypeError("Expected a function");function w(t){var n=u,r=l;return u=l=void 0,v=t,f=e.apply(r,n)}function m(e){var n=e-d;return void 0===d||n>=t||n<0||b&&e-v>=s}function E(){var e=o();if(m(e))return g(e);p=setTimeout(E,function(e){var n=t-(e-d);return b?c(n,s-(e-v)):n}(e))}function g(e){return p=void 0,h&&u?w(e):(u=l=void 0,f)}function T(){var e=o(),n=m(e);if(u=arguments,l=this,d=e,n){if(void 0===p)return function(e){return v=e,p=setTimeout(E,t),y?w(e):f}(d);if(b)return clearTimeout(p),p=setTimeout(E,t),w(d)}return void 0===p&&(p=setTimeout(E,t)),f}return t=i(t)||0,r(n)&&(y=!!n.leading,s=(b="maxWait"in n)?a(i(n.maxWait)||0,t):s,h="trailing"in n?!!n.trailing:h),T.cancel=function(){void 0!==p&&clearTimeout(p),v=0,u=d=l=p=void 0},T.flush=function(){return void 0===p?f:g(o())},T}},805:function(e){e.exports=function(e){var t=typeof e;return null!=e&&("object"==t||"function"==t)}},346:function(e){e.exports=function(e){return null!=e&&"object"==typeof e}},394:function(e,t,n){var r=n(552),o=n(346);e.exports=function(e){return"symbol"==typeof e||o(e)&&"[object Symbol]"==r(e)}},124:function(e,t,n){var r=n(325);e.exports=function(){return r.Date.now()}},374:function(e,t,n){var r=n(128),o=n(805),i=n(394),a=/^[-+]0x[0-9a-f]+$/i,c=/^0b[01]+$/i,u=/^0o[0-7]+$/i,l=parseInt;e.exports=function(e){if("number"==typeof e)return e;if(i(e))return NaN;if(o(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=o(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=r(e);var n=c.test(e);return n||u.test(e)?l(e.slice(2),n?2:8):a.test(e)?NaN:+e}}},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var i=t[r]={exports:{}};return e[r](i,i.exports,n),i.exports}n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,{a:t}),t},n.d=function(e,t){for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},function(){"use strict";var e=window.wp.element,t=window.wp.plugins,r=function(){function e(){this._tkq=[],this.isLoaded=!1,this.isEnabled=!1,"undefined"!=typeof wpParselyTracksTelemetry&&(this.isEnabled=!0,this.loadTrackingLibrary())}return e.getInstance=function(){return window.wpParselyTelemetryInstance||Object.defineProperty(window,"wpParselyTelemetryInstance",{value:new e,writable:!1,configurable:!1,enumerable:!1}),window.wpParselyTelemetryInstance},e.prototype.loadTrackingLibrary=function(){var e=this,t=document.createElement("script");t.async=!0,t.src="//stats.wp.com/w.js",t.onload=function(){e.isLoaded=!0,e._tkq=window._tkq||[]},document.head.appendChild(t)},e.trackEvent=function(t){return n=this,r=arguments,i=function(t,n){var r;return void 0===n&&(n={}),function(e,t){var n,r,o,i={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]},a=Object.create(("function"==typeof Iterator?Iterator:Object).prototype);return a.next=c(0),a.throw=c(1),a.return=c(2),"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function c(c){return function(u){return function(c){if(n)throw new TypeError("Generator is already executing.");for(;a&&(a=0,c[0]&&(i=0)),i;)try{if(n=1,r&&(o=2&c[0]?r.return:c[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,c[1])).done)return o;switch(r=0,o&&(c=[2&c[0],o.value]),c[0]){case 0:case 1:o=c;break;case 4:return i.label++,{value:c[1],done:!1};case 5:i.label++,r=c[1],c=[0];continue;case 7:c=i.ops.pop(),i.trys.pop();continue;default:if(!((o=(o=i.trys).length>0&&o[o.length-1])||6!==c[0]&&2!==c[0])){i=0;continue}if(3===c[0]&&(!o||c[1]>o[0]&&c[1]<o[3])){i.label=c[1];break}if(6===c[0]&&i.label<o[1]){i.label=o[1],o=c;break}if(o&&i.label<o[2]){i.label=o[2],i.ops.push(c);break}o[2]&&i.ops.pop(),i.trys.pop();continue}c=t.call(e,i)}catch(e){c=[6,e],r=0}finally{n=o=0}if(5&c[0])throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}([c,u])}}}(this,(function(o){switch(o.label){case 0:return(r=e.getInstance()).isTelemetryEnabled()?[4,e.waitUntilLoaded()]:[2];case 1:return o.sent(),r.trackEvent(t,n),[2]}}))},new((o=void 0)||(o=Promise))((function(e,t){function a(e){try{u(i.next(e))}catch(e){t(e)}}function c(e){try{u(i.throw(e))}catch(e){t(e)}}function u(t){var n;t.done?e(t.value):(n=t.value,n instanceof o?n:new o((function(e){e(n)}))).then(a,c)}u((i=i.apply(n,r||[])).next())}));var n,r,o,i},e.waitUntilLoaded=function(){return new Promise((function(t,n){var r=e.getInstance();if(r.isTelemetryEnabled())if(r.isLoaded)t();else var o=0,i=setInterval((function(){r.isLoaded&&(clearInterval(i),t()),(o+=100)>=1e4&&(clearInterval(i),n("Telemetry library not loaded"))}),100);else n("Telemetry not enabled")}))},e.prototype.trackEvent=function(t,n){var r;this.isLoaded?(0!==t.indexOf(e.TRACKS_PREFIX)&&(t=e.TRACKS_PREFIX+t),this.isEventNameValid(t)?(n=this.prepareProperties(n),null===(r=this._tkq)||void 0===r||r.push(["recordEvent",t,n])):console.error("Error tracking event: Invalid event name")):console.error("Error tracking event: Telemetry not loaded")},e.prototype.isTelemetryEnabled=function(){return this.isEnabled},e.prototype.isProprietyValid=function(t){return e.PROPERTY_REGEX.test(t)},e.prototype.isEventNameValid=function(t){return e.EVENT_NAME_REGEX.test(t)},e.prototype.prepareProperties=function(e){return(e=this.sanitizeProperties(e)).parsely_version=wpParselyTracksTelemetry.version,wpParselyTracksTelemetry.user&&(e._ut=wpParselyTracksTelemetry.user.type,e._ui=wpParselyTracksTelemetry.user.id),wpParselyTracksTelemetry.vipgo_env&&(e.vipgo_env=wpParselyTracksTelemetry.vipgo_env),this.sanitizeProperties(e)},e.prototype.sanitizeProperties=function(e){var t=this,n={};return Object.keys(e).forEach((function(r){t.isProprietyValid(r)&&(n[r]=e[r])})),n},e.TRACKS_PREFIX="wpparsely_",e.EVENT_NAME_REGEX=/^(([a-z0-9]+)_){2}([a-z0-9_]+)$/,e.PROPERTY_REGEX=/^[a-z_][a-z0-9_]*$/,e}(),o=(r.trackEvent,window.wp.data),i=n(602),a=n.n(i);if(r.getInstance().isTelemetryEnabled()){var c=[function(){var t="wp-parsely/";return(0,e.useEffect)((function(){var e;return function(){return e=this,t=void 0,r=function(){return function(e,t){var n,r,o,i={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]},a=Object.create(("function"==typeof Iterator?Iterator:Object).prototype);return a.next=c(0),a.throw=c(1),a.return=c(2),"function"==typeof Symbol&&(a[Symbol.iterator]=function(){return this}),a;function c(c){return function(u){return function(c){if(n)throw new TypeError("Generator is already executing.");for(;a&&(a=0,c[0]&&(i=0)),i;)try{if(n=1,r&&(o=2&c[0]?r.return:c[0]?r.throw||((o=r.return)&&o.call(r),0):r.next)&&!(o=o.call(r,c[1])).done)return o;switch(r=0,o&&(c=[2&c[0],o.value]),c[0]){case 0:case 1:o=c;break;case 4:return i.label++,{value:c[1],done:!1};case 5:i.label++,r=c[1],c=[0];continue;case 7:c=i.ops.pop(),i.trys.pop();continue;default:if(!((o=(o=i.trys).length>0&&o[o.length-1])||6!==c[0]&&2!==c[0])){i=0;continue}if(3===c[0]&&(!o||c[1]>o[0]&&c[1]<o[3])){i.label=c[1];break}if(6===c[0]&&i.label<o[1]){i.label=o[1],o=c;break}if(o&&i.label<o[2]){i.label=o[2],i.ops.push(c);break}o[2]&&i.ops.pop(),i.trys.pop();continue}c=t.call(e,i)}catch(e){c=[6,e],r=0}finally{n=o=0}if(5&c[0])throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}([c,u])}}}(this,(function(e){return[2,new Promise((function(e){var t=(0,o.subscribe)((function(){((0,o.select)("core/editor").isCleanNewPost()||(0,o.select)("core/block-editor").getBlockCount()>0)&&(t(),e())}))}))]}))},new((n=void 0)||(n=Promise))((function(o,i){function a(e){try{u(r.next(e))}catch(e){i(e)}}function c(e){try{u(r.throw(e))}catch(e){i(e)}}function u(e){var t;e.done?o(e.value):(t=e.value,t instanceof n?t:new n((function(e){e(t)}))).then(a,c)}u((r=r.apply(e,t||[])).next())}));var e,t,n,r}().then((function(){var n=(0,o.select)("core/block-editor").getBlocks(),i=a()((function(){var e=(0,o.select)("core/block-editor").getBlocks(),i=e.map((function(e){return e.clientId})),a=n.map((function(e){return e.clientId}));e.filter((function(e){return!a.includes(e.clientId)})).forEach((function(e){e.name.startsWith(t)&&r.trackEvent("block_added",{block:e.name})})),a.filter((function(e){return!i.includes(e)})).forEach((function(e){var o=n.find((function(t){return t.clientId===e}));o&&o.name.startsWith(t)&&r.trackEvent("block_removed",{block:o.name})})),n=e}),1e3);return e=(0,o.subscribe)(i,"core/block-editor")})),function(){e&&e()}}),[]),null}],u=e.createElement.apply(void 0,function(e,t,n){if(n||2===arguments.length)for(var r,o=0,i=t.length;o<i;o++)!r&&o in t||(r||(r=Array.prototype.slice.call(t,0,o)),r[o]=t[o]);return e.concat(r||Array.prototype.slice.call(t))}([e.Fragment,null],c.map((function(t){return(0,e.createElement)(t)})),!1));(0,t.registerPlugin)("wp-parsely-tracks-js-events",{render:function(){return u}})}}()}();