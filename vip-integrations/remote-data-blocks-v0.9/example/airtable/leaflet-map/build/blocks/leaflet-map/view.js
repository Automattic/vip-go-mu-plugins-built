(()=>{"use strict";var e={n:t=>{var a=t&&t.__esModule?()=>t.default:()=>t;return e.d(a,{a}),a},d:(t,a)=>{for(var o in a)e.o(a,o)&&!e.o(t,o)&&Object.defineProperty(t,o,{enumerable:!0,get:a[o]})},o:(e,t)=>Object.prototype.hasOwnProperty.call(e,t)};const t=window.wp.domReady;e.n(t)()((()=>{document.querySelectorAll(".wp-block-example-leaflet-map[data-map-coordinates]").forEach((e=>{const t=e?.dataset.mapCoordinates??"";let a=[];try{a=JSON.parse(t)??[]}catch(e){}delete e.dataset.mapCoordinates;const o=leaflet.map(e).setView([a[0].x,a[0].y],25),r=leaflet.layerGroup().addTo(o);leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:4}).addTo(o),a.filter((e=>e.x&&e.y)).forEach((e=>{leaflet.marker([e.x,e.y],{title:e.name}).addTo(r)})),o.flyTo([a[0].x,a[0].y])}))}))})();