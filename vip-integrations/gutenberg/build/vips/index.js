/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 1533:
/***/ ((module) => {


var Vips = (() => {
  var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;
  return (
function(moduleArg = {}) {
  var moduleRtn;

var l=moduleArg,aa,ba,ca=new Promise((a,b)=>{aa=a;ba=b}),da="object"==typeof window,ea="function"==typeof importScripts,fa="object"==typeof process&&"object"==typeof process.fc&&"string"==typeof process.fc.node,r=ea&&"em-pthread"==self.name;l.dynamicLibraries=l.dynamicLibraries||["vips-jxl.wasm","vips-heif.wasm"];l.workaroundCors&&(l.mainScriptUrlOrBlob=l.mainScriptUrlOrBlob||URL.createObjectURL(new Blob([`importScripts('${_scriptName}');`],{type:"application/javascript"})));
var ja=Object.assign({},l),ka=[],la="./this.program",ma=(a,b)=>{throw b;},na;ea?na=self.location.href:da?na=_scriptName:na=void 0;var oa="";function pa(a){return l.locateFile?l.locateFile(a,oa):oa+a}var qa,ra;
if(da||ea)na.startsWith("blob:")||(oa=na.substr(0,na.replace(/[?#].*/,"").lastIndexOf("/")+1)),ea&&(ra=a=>{var b=new XMLHttpRequest;b.open("GET",a,!1);b.responseType="arraybuffer";b.send(null);return new Uint8Array(b.response)}),qa=a=>fetch(a,{credentials:"same-origin"}).then(b=>b.ok?b.arrayBuffer():Promise.reject(Error(b.status+" : "+b.url)));var sa=l.print||console.log.bind(console),w=l.printErr||console.error.bind(console);Object.assign(l,ja);ja=null;l.arguments&&(ka=l.arguments);
l.thisProgram&&(la=l.thisProgram);l.quit&&(ma=l.quit);
if(r){var ta,ua=!1;function a(...c){console.error(c.join(" "))}l.printErr||(w=a);self.alert=function(...c){postMessage({Pa:"alert",text:c.join(" "),Fc:va()})};l.instantiateWasm=(c,d)=>new Promise(e=>{ta=f=>{var g=new WebAssembly.Instance(f,wa());d(g,f);e()}});self.onunhandledrejection=c=>{throw c.reason||c;};function b(c){try{var d=c.data,e=d.cmd;if("load"===e){let f=[];self.onmessage=g=>f.push(g);self.startWorker=()=>{postMessage({cmd:"loaded"});for(let g of f)b(g);self.onmessage=b};xa=d.dynamicLibraries;
ya=d.sharedModules;for(const g of d.handlers)if(!l[g]||l[g].proxy)l[g]=(...h)=>{postMessage({Pa:"callHandler",xc:g,kc:h})},"print"==g&&(sa=l[g]),"printErr"==g&&(w=l[g]);za=d.wasmMemory;Aa();ta(d.wasmModule)}else if("run"===e){Ba(d.pthread_ptr,0,0,1,0,0);Ca(d.pthread_ptr);Da();Ea();ua||(Fa(),ua=!0);try{Ga(d.start_routine,d.arg)}catch(f){if("unwind"!=f)throw f;}}else"cancel"===e?va()&&Ha(-1):"setimmediate"!==d.target&&("checkMailbox"===e?ua&&Ia():e&&(w(`worker: received unknown command ${e}`),w(d)))}catch(f){throw Ja(),
f;}}self.onmessage=b}var xa=l.dynamicLibraries||[],Ka;l.wasmBinary&&(Ka=l.wasmBinary);var za,La,Ma=!1,Na,x,y,z,A,B,C,Oa,D,Pa,Qa;function Aa(){var a=za.buffer;l.HEAP8=x=new Int8Array(a);l.HEAP16=z=new Int16Array(a);l.HEAPU8=y=new Uint8Array(a);l.HEAPU16=A=new Uint16Array(a);l.HEAP32=B=new Int32Array(a);l.HEAPU32=C=new Uint32Array(a);l.HEAPF32=Oa=new Float32Array(a);l.HEAPF64=Qa=new Float64Array(a);l.HEAP64=D=new BigInt64Array(a);l.HEAPU64=Pa=new BigUint64Array(a)}
if(!r){if(l.wasmMemory)za=l.wasmMemory;else{var Ra=l.INITIAL_MEMORY||1073741824;za=new WebAssembly.Memory({initial:Ra/65536,maximum:Ra/65536,shared:!0});if(!(za.buffer instanceof SharedArrayBuffer))throw w("requested a shared WebAssembly.Memory but the returned buffer is not a SharedArrayBuffer, indicating that while the browser has SharedArrayBuffer it does not have WebAssembly threads support - you may need to set a flag"),fa&&w("(on node you may need: --experimental-wasm-threads --experimental-wasm-bulk-memory and/or recent version)"),
Error("bad memory");}Aa()}var Sa=[],Ta=[],Ua=[],Va=[],Wa=[],Xa=[],Ya=!1,$a=!1;function ab(){Ya=!0;r||(bb(Xa),l.noFSInit||FS.init.Ea||FS.init(),FS.Ya=!1,bb(Ta))}var cb=0,db=null,eb=null;function fb(){cb++;l.monitorRunDependencies?.(cb)}function gb(){cb--;l.monitorRunDependencies?.(cb);if(0==cb&&(null!==db&&(clearInterval(db),db=null),eb)){var a=eb;eb=null;a()}}
function hb(a){l.onAbort?.(a);a="Aborted("+a+")";w(a);Ma=!0;Na=1;a=new WebAssembly.RuntimeError(a+". Build with -sASSERTIONS for more info.");ba(a);throw a;}var ib=a=>a.startsWith("data:application/octet-stream;base64,");class E extends Error{}class jb extends E{}class kb extends E{constructor(a){super(a);this.ba=a;a=lb(a);this.name=a[0];this.message=a[1]}}var mb;function nb(a){if(a==mb&&Ka)return new Uint8Array(Ka);if(ra)return ra(a);throw"both async and sync fetching of the wasm failed";}
function ob(a){return Ka?Promise.resolve().then(()=>nb(a)):qa(a).then(b=>new Uint8Array(b),()=>nb(a))}function pb(a,b,c){return ob(a).then(d=>WebAssembly.instantiate(d,b)).then(c,d=>{w(`failed to asynchronously prepare wasm: ${d}`);hb(d)})}
function qb(a,b){var c=mb;return Ka||"function"!=typeof WebAssembly.instantiateStreaming||ib(c)||"function"!=typeof fetch?pb(c,a,b):fetch(c,{credentials:"same-origin"}).then(d=>WebAssembly.instantiateStreaming(d,a).then(b,function(e){w(`wasm streaming compile failed: ${e}`);w("falling back to ArrayBuffer instantiation");return pb(c,a,b)}))}
function wa(){F={__assert_fail:rb,__call_sighandler:sb,__cxa_begin_catch:tb,__cxa_end_catch:ub,__cxa_find_matching_catch_2:vb,__cxa_find_matching_catch_3:wb,__cxa_rethrow:xb,__cxa_throw:yb,__cxa_uncaught_exceptions:zb,__heap_base:Ab,__indirect_function_table:Bb,__lsan_ignore_object:Cb,__memory_base:Db,__pthread_create_js:Eb,__resumeException:Fb,__stack_high:Gb,__stack_low:Hb,__stack_pointer:Ib,__syscall_dup:Jb,__syscall_faccessat:Kb,__syscall_fcntl64:Lb,__syscall_fstat64:Mb,__syscall_ftruncate64:Nb,
__syscall_getcwd:Ob,__syscall_ioctl:Pb,__syscall_lstat64:Qb,__syscall_newfstatat:Rb,__syscall_openat:Sb,__syscall_poll:Tb,__syscall_rmdir:Ub,__syscall_stat64:Vb,__syscall_unlinkat:Wb,__table_base:Xb,_abort_js:Yb,_dlopen_js:Zb,_dlsym_catchup_js:$b,_dlsym_js:ac,_embind_finalize_value_object:bc,_embind_register_arithmetic_vector:cc,_embind_register_bigint:dc,_embind_register_bool:ec,_embind_register_class:fc,_embind_register_class_class_function:gc,_embind_register_class_constructor:hc,_embind_register_class_function:ic,
_embind_register_class_property:jc,_embind_register_emval:kc,_embind_register_enum:lc,_embind_register_enum_value:mc,_embind_register_float:nc,_embind_register_function:oc,_embind_register_integer:pc,_embind_register_memory_view:qc,_embind_register_std_string:rc,_embind_register_std_wstring:sc,_embind_register_value_object:tc,_embind_register_value_object_field:uc,_embind_register_void:vc,_emscripten_dlopen_js:wc,_emscripten_dlsync_threads:xc,_emscripten_dlsync_threads_async:yc,_emscripten_get_dynamic_libraries_js:zc,
_emscripten_get_now_is_monotonic:Ac,_emscripten_init_main_thread_js:Bc,_emscripten_notify_mailbox_postmessage:Cc,_emscripten_receive_on_main_thread_js:Dc,_emscripten_runtime_keepalive_clear:Ec,_emscripten_thread_cleanup:Fc,_emscripten_thread_exit_joinable:Gc,_emscripten_thread_mailbox_await:Ca,_emscripten_thread_set_strongref:Hc,_emscripten_throw_longjmp:Ic,_emval_as:Jc,_emval_call:Kc,_emval_decref:Lc,_emval_get_global:Mc,_emval_get_method_caller:Nc,_emval_get_module_property:Oc,_emval_get_property:Pc,
_emval_incref:Qc,_emval_instanceof:Rc,_emval_is_number:Sc,_emval_is_string:Tc,_emval_new_cstring:Uc,_emval_run_destructors:Vc,_emval_set_property:Wc,_emval_take_value:Xc,_emval_typeof:Yc,_gmtime_js:Zc,_localtime_js:$c,_mmap_js:ad,_munmap_js:bd,_tzset_js:cd,emscripten_check_blocking_allowed:dd,emscripten_console_error:ed,emscripten_date_now:fd,emscripten_err:gd,emscripten_exit_with_live_runtime:hd,emscripten_get_heap_max:jd,emscripten_get_now:kd,emscripten_num_logical_cores:ld,emscripten_promise_destroy:md,
emscripten_promise_resolve:nd,emscripten_resize_heap:od,environ_get:pd,environ_sizes_get:qd,exit:rd,fd_close:sd,fd_fdstat_get:td,fd_read:ud,fd_seek:vd,fd_write:wd,ffi_call_js:xd,getentropy:yd,heif_error_success:zd,heif_image_release:Ad,heif_nclx_color_profile_free:Bd,invoke_di:Cd,invoke_dii:Dd,invoke_diii:Ed,invoke_diiii:Fd,invoke_fiii:Gd,invoke_i:Hd,invoke_ii:Id,invoke_iii:Jd,invoke_iiid:Kd,invoke_iiii:Ld,invoke_iiiii:Md,invoke_iiiiid:Nd,invoke_iiiiii:Od,invoke_iiiiiii:Pd,invoke_iiiiiiii:Qd,invoke_iiiiiiiiiii:Rd,
invoke_iiiiiiiiiiii:Sd,invoke_iiiiiiiiiiiii:Td,invoke_iiiiij:Ud,invoke_ji:Vd,invoke_jiiii:Wd,invoke_v:Xd,invoke_vi:Yd,invoke_vid:Zd,invoke_viddi:$d,invoke_vii:ae,invoke_viid:be,invoke_viidd:ce,invoke_viiddi:de,invoke_viidi:ee,invoke_viii:fe,invoke_viiid:ge,invoke_viiidddddi:he,invoke_viiiddddi:ie,invoke_viiidddi:je,invoke_viiiddi:ke,invoke_viiidi:le,invoke_viiii:me,invoke_viiiii:ne,invoke_viiiiii:oe,invoke_viiiiiii:pe,invoke_viiiiiiii:qe,invoke_viiiiiiiii:re,invoke_viiiiiiiiii:se,invoke_viiiiiiiiiii:te,
invoke_viiiiiiiiiiii:ue,invoke_viiiiiiiiiiiii:ve,invoke_viiiiiiiiiiiiiii:we,llvm_eh_typeid_for:xe,memory:za,proc_exit:ye};return{env:F,wasi_snapshot_preview1:F,"GOT.mem":new Proxy(F,ze),"GOT.func":new Proxy(F,ze)}}var Ae={};function Be(a){for(var b=A[a+6>>1];13===b&&!(16<C[a>>2]);){var c=C[a+8>>2],d=C[c>>2];if(0===d){b=0;break}else if(0===C[(c>>2)+1])a=d,b=A[d+6>>1];else break}return[a,b]}
function xd(a,b,c,d){var e=C[(a>>2)+1],f=C[(a>>2)+6],g=C[(a>>2)+2];a=Be(C[(a>>2)+3])[1];var h=I(),k=h,m=[],n=0;if(15===a)throw Error("complex ret marshalling nyi");if(0>a||15<a)throw Error("Unexpected rtype "+a);if(4===a||13===a)m.push(c),n=1;for(var p=0;p<f;p++){var q=C[(d>>2)+p],t=Be(C[(g>>2)+p]),u=t[0];t=t[1];switch(t){case 1:case 10:case 9:case 14:m.push(C[q>>2]);break;case 2:m.push(Oa[q>>2]);break;case 3:m.push(Qa[q>>3]);break;case 5:m.push(y[q]);break;case 6:m.push(x[q]);break;case 7:m.push(A[q>>
1]);break;case 8:m.push(z[q>>1]);break;case 11:case 12:m.push(Pa[q>>3]);break;case 4:m.push(Pa[q>>3]);m.push(Pa[(q>>3)+1]);break;case 13:t=C[u>>2];u=A[u+4>>1];k-=t;k&=~(u-1);x.subarray(k,k+t).set(x.subarray(q,q+t));m.push(k);break;case 15:throw Error("complex marshalling nyi");default:throw Error("Unexpected type "+t);}}if(f!=e){var v=[];for(p=e-1;p>=f;p--)switch(q=C[(d>>2)+p],t=Be(C[(g>>2)+p]),u=t[0],t=t[1],t){case 5:case 6:--k;k&=-1;y[k]=y[q];break;case 7:case 8:k-=2;k&=-2;A[k>>1]=A[q>>1];break;
case 1:case 9:case 10:case 14:case 2:k-=4;k&=-4;C[k>>2]=C[q>>2];break;case 3:case 11:case 12:k-=8;k&=-8;C[k>>2]=C[q>>2];C[(k>>2)+1]=C[(q>>2)+1];break;case 4:k-=16;k&=-8;C[k>>2]=C[q>>2];C[(k>>2)+1]=C[(q>>2)+1];C[(k>>2)+2]=C[(q>>2)+2];C[(k>>2)+3]=C[(q>>2)+3];break;case 13:k-=4;k&=-4;v.push([k,q,C[u>>2],A[u+4>>1]]);break;case 15:throw Error("complex arg marshalling nyi");default:throw Error("Unexpected argtype "+t);}m.push(k);for(p=0;p<v.length;p++)e=v[p],d=e[0],q=e[1],t=e[2],u=e[3],k-=t,k&=~(u-1),x.subarray(k,
k+t).set(x.subarray(q,q+t)),C[d>>2]=k}J(k);Ce(0);b=K(b).apply(null,m);J(h);if(!n)switch(a){case 0:break;case 1:case 9:case 10:case 14:C[c>>2]=b;break;case 2:Oa[c>>2]=b;break;case 3:Qa[c>>3]=b;break;case 5:case 6:y[c+0]=b;break;case 7:case 8:A[c>>1]=b;break;case 11:case 12:Pa[c>>3]=b;break;case 15:throw Error("complex ret marshalling nyi");default:throw Error("Unexpected rtype "+a);}}xd.g="viiii";
var M=0,Me=(a,b)=>{De=a;Ee=b;if(Fe)if(Ge||(M+=1,Ge=!0),0==a)He=function(){var d=Math.max(0,Ie+b-kd())|0;setTimeout(Je,d)};else if(1==a)He=function(){Ke(Je)};else if(2==a){if("undefined"==typeof Le)if("undefined"==typeof setImmediate){var c=[];addEventListener("message",d=>{if("setimmediate"===d.data||"setimmediate"===d.data.target)d.stopPropagation(),c.shift()()},!0);Le=function(d){c.push(d);ea?(l.setImmediates??(l.setImmediates=[]),l.setImmediates.push(d),postMessage({target:"setimmediate"})):postMessage("setimmediate",
"*")}}else Le=setImmediate;He=function(){Le(Je)}}},kd;kd=()=>performance.timeOrigin+performance.now();kd.g="d";function Ne(a){this.name="ExitStatus";this.message=`Program terminated with exit(${a})`;this.status=a}
var Oe=a=>-9007199254740992>a||9007199254740992<a?NaN:Number(a),Pe=a=>{a.terminate();a.onmessage=()=>{}},We=a=>{var b=Qe[a];Re.delete(a);a in Se&&Se[a].resolve();a=b.fa;delete Qe[a];Te.push(b);Ue.splice(Ue.indexOf(b),1);b.fa=0;Ve(a)},Ze=a=>{0==Te.length&&(Xe(),Ye(Te[0]));var b=Te.pop();if(!b)return 6;Ue.push(b);Qe[a.fa]=b;b.fa=a.fa;b.postMessage({cmd:"run",start_routine:a.ac,arg:a.Na,pthread_ptr:a.fa},a.cc);return 0},$e=a=>{a instanceof Ne||"unwind"==a||ma(1,a)},Te=[],Ue=[],af=[],Qe={};
function bf(){for(var a=6<navigator.hardwareConcurrency?navigator.hardwareConcurrency:6;a--;)Xe();Sa.unshift(()=>{fb("loading-workers");cf(()=>gb("loading-workers"))});Se={};Re=new Set}var df=()=>{for(var a of Ue)Pe(a);for(a of Te)Pe(a);Te=[];Ue=[];Qe=[]};function Ea(){af.forEach(a=>a())}
var Ye=a=>new Promise(b=>{a.onmessage=f=>{f=f.data;var g=f.cmd;if(f.targetThread&&f.targetThread!=va()){var h=Qe[f.targetThread];h?h.postMessage(f,f.transferList):w(`Internal error! Worker sent a message "${g}" to target pthread ${f.targetThread}, but that thread no longer exists!`)}else if("checkMailbox"===g)Ia();else if("spawnThread"===g)Ze(f);else if("cleanupThread"===g)We(f.thread);else if("markAsFinished"===g)f=f.thread,Re.add(f),f in Se&&Se[f].resolve();else if("killThread"===g)f=f.thread,g=
Qe[f],delete Qe[f],Pe(g),Ve(f),Ue.splice(Ue.indexOf(g),1),g.fa=0;else if("cancelThread"===g)Qe[f.thread].postMessage({cmd:"cancel"});else if("loaded"===g)a.loaded=!0,b(a);else if("alert"===g)alert(`Thread ${f.threadId}: ${f.text}`);else if("setimmediate"===f.target)a.postMessage(f);else if("callHandler"===g)l[f.handler](...f.args);else g&&w(`worker sent an unknown command ${g}`)};a.onerror=f=>{w(`${"worker sent an error!"} ${f.filename}:${f.lineno}: ${f.message}`);throw f;};var c=[],d=["onExit","onAbort",
"print","printErr"],e;for(e of d)l.propertyIsEnumerable(e)&&c.push(e);a.postMessage({cmd:"load",handlers:c,wasmMemory:za,wasmModule:La,dynamicLibraries:xa,sharedModules:ya})});function cf(a){r?a():Promise.all(Te.map(Ye)).then(a)}function Xe(){var a=na;l.mainScriptUrlOrBlob&&(a=l.mainScriptUrlOrBlob,"string"!=typeof a&&(a=URL.createObjectURL(a)));a=new Worker(a,{name:"em-pthread"});Te.push(a)}
var Re,Se,O=(a,b,...c)=>{for(var d=2*c.length,e=I(),f=Ce(8*d),g=f>>3,h=0;h<c.length;h++){var k=c[h];"bigint"==typeof k?(D[g+2*h]=1n,D[g+2*h+1]=k):(D[g+2*h]=0n,Qa[g+2*h+1]=k)}a=ef(a,0,d,f,b);J(e);return a};function ye(a){if(r)return O(0,1,a);Na=a;ff||0<M||(df(),l.onExit?.(a),Ma=!0);ma(a,new Ne(a))}ye.g="vi";function gf(a){if(r)return O(1,0,a);rd(a)}
var rd=a=>{Na=a;if(r)throw gf(a),"unwind";if(!(ff||0<M||r)){hf();bb(Va);FS.init.Ea=!1;jf(0);for(var b=0;b<FS.streams.length;b++){var c=FS.streams[b];c&&FS.close(c)}df();$a=!0}ye(a)};rd.g="vi";
var kf=()=>{if(!($a||ff||0<M))try{r?Ha(Na):rd(Na)}catch(a){$e(a)}},rf=a=>{function b(){return c<lf?(--M,kf(),!1):!0}Fe=a;var c=lf;Ge=!1;Je=function(){if(!Ma)if(0<mf.length){var d=mf.shift();d.vc(d.Na);if(nf){var e=nf,f=0==e%1?e-1:Math.floor(e);nf=d.qc?f:(8*e+(f+.5))/9}l.setStatus&&(d=l.statusMessage||"Please wait...",e=nf,f=of.tc,e?e<f?l.setStatus("{message} ({expected - remaining}/{expected})"):l.setStatus(d):l.setStatus(""));b()&&setTimeout(Je,0)}else b()&&(pf=pf+1|0,1==De&&1<Ee&&0!=pf%Ee?He():
(0==De&&(Ie=kd()),Ma||l.preMainLoop&&!1===l.preMainLoop()||(qf(a),l.postMainLoop?.()),b()&&("object"==typeof SDL&&SDL.audio?.Ec?.(),He())))}},qf=a=>{if(!$a&&!Ma)try{a(),kf()}catch(b){$e(b)}},sf=a=>{M+=1;setTimeout(()=>{--M;qf(a)},1E4)},tf=l.preloadPlugins||[],uf={},Ge=!1,He=null,lf=0,Fe=null,De=0,Ee=0,pf=0,mf=[],of={},Ie,Je,nf,vf=!1,wf=!1,xf=[];
function yf(){function a(){wf=document.pointerLockElement===l.canvas||document.mozPointerLockElement===l.canvas||document.webkitPointerLockElement===l.canvas||document.msPointerLockElement===l.canvas}if(!zf){zf=!0;tf.push({canHandle:function(c){return!l.noImageDecoding&&/\.(jpg|jpeg|png|bmp)$/i.test(c)},handle:function(c,d,e,f){var g=new Blob([c],{type:Af(d)});g.size!==c.length&&(g=new Blob([(new Uint8Array(c)).buffer],{type:Af(d)}));var h=URL.createObjectURL(g),k=new Image;k.onload=()=>{var m=document.createElement("canvas");
m.width=k.width;m.height=k.height;m.getContext("2d").drawImage(k,0,0);URL.revokeObjectURL(h);e?.(c)};k.onerror=()=>{w(`Image ${h} could not be decoded`);f?.()};k.src=h}});tf.push({canHandle:function(c){return!l.noAudioDecoding&&c.substr(-4)in{".ogg":1,".wav":1,".mp3":1}},handle:function(c,d,e){function f(){g||(g=!0,e?.(c))}var g=!1,h=URL.createObjectURL(new Blob([c],{type:Af(d)})),k=new Audio;k.addEventListener("canplaythrough",()=>f(k),!1);k.onerror=function(){if(!g){w(`warning: browser could not fully decode audio ${d}, trying slower base64 approach`);
for(var m="",n=0,p=0,q=0;q<c.length;q++)for(n=n<<8|c[q],p+=8;6<=p;){var t=n>>p-6&63;p-=6;m+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[t]}2==p?(m+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[(n&3)<<4],m+="=="):4==p&&(m+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[(n&15)<<2],m+="=");k.src="data:audio/x-"+d.substr(-3)+";base64,"+m;f(k)}};k.src=h;sf(()=>{f(k)})}});var b=l.canvas;b&&(b.requestPointerLock=b.requestPointerLock||b.mozRequestPointerLock||
b.webkitRequestPointerLock||b.msRequestPointerLock||(()=>{}),b.exitPointerLock=document.exitPointerLock||document.mozExitPointerLock||document.webkitExitPointerLock||document.msExitPointerLock||(()=>{}),b.exitPointerLock=b.exitPointerLock.bind(document),document.addEventListener("pointerlockchange",a,!1),document.addEventListener("mozpointerlockchange",a,!1),document.addEventListener("webkitpointerlockchange",a,!1),document.addEventListener("mspointerlockchange",a,!1),l.elementPointerLock&&b.addEventListener("click",
c=>{!wf&&l.canvas.requestPointerLock&&(l.canvas.requestPointerLock(),c.preventDefault())},!1))}}var Bf=!1,Cf=void 0,Df=void 0;function Ef(){if(!vf)return!1;(document.exitFullscreen||document.cancelFullScreen||document.mozCancelFullScreen||document.msExitFullscreen||document.webkitCancelFullScreen||(()=>{})).apply(document,[]);return!0}var Ff=0;
function Ke(a){if("function"==typeof requestAnimationFrame)requestAnimationFrame(a);else{var b=Date.now();if(0===Ff)Ff=b+1E3/60;else for(;b+2>=Ff;)Ff+=1E3/60;setTimeout(a,Math.max(Ff-b,0))}}function Af(a){return{jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",bmp:"image/bmp",ogg:"audio/ogg",wav:"audio/wav",mp3:"audio/mpeg"}[a.substr(a.lastIndexOf(".")+1)]}var Gf=[];function Hf(){var a=l.canvas;Gf.forEach(b=>b(a.width,a.height))}
function If(a,b,c){b&&c?(a.ic=b,a.Eb=c):(b=a.ic,c=a.Eb);var d=b,e=c;l.forcedAspectRatio&&0<l.forcedAspectRatio&&(d/e<l.forcedAspectRatio?d=Math.round(e*l.forcedAspectRatio):e=Math.round(d/l.forcedAspectRatio));if((document.fullscreenElement||document.mozFullScreenElement||document.msFullscreenElement||document.webkitFullscreenElement||document.webkitCurrentFullScreenElement)===a.parentNode&&"undefined"!=typeof screen){var f=Math.min(screen.width/d,screen.height/e);d=Math.round(d*f);e=Math.round(e*
f)}Df?(a.width!=d&&(a.width=d),a.height!=e&&(a.height=e),"undefined"!=typeof a.style&&(a.style.removeProperty("width"),a.style.removeProperty("height"))):(a.width!=b&&(a.width=b),a.height!=c&&(a.height=c),"undefined"!=typeof a.style&&(d!=b||e!=c?(a.style.setProperty("width",d+"px","important"),a.style.setProperty("height",e+"px","important")):(a.style.removeProperty("width"),a.style.removeProperty("height"))))}
var Jf={},Le,zf,Kf={},Lf=new Set(["__lsan_ignore_object","__lsan_ignore_object"]),ze={get(a,b){(a=Kf[b])||(a=Kf[b]=new WebAssembly.Global({value:"i32",mutable:!0}));Lf.has(b)||(a.required=!0);return a}},bb=a=>{for(;0<a.length;)a.shift()(l)},Da=()=>{var a=va(),b=C[a+52>>2];Mf(b,b-C[a+56>>2]);J(b)},Nf=new TextDecoder,Of=(a,b,c)=>{c=b+c;for(var d=b;a[d]&&!(d>=c);)++d;return Nf.decode(a.buffer?a.buffer instanceof SharedArrayBuffer?a.slice(b,d):a.subarray(b,d):new Uint8Array(a.slice(b,d)))},Pf=a=>{function b(){for(var n=
0,p=1;;){var q=a[e++];n+=(q&127)*p;p*=128;if(!(q&128))break}return n}function c(){var n=b();e+=n;return Of(a,e-n,n)}function d(n,p){if(n)throw Error(p);}var e=0,f=0,g="dylink.0";a instanceof WebAssembly.Module?(f=WebAssembly.Module.customSections(a,g),0===f.length&&(g="dylink",f=WebAssembly.Module.customSections(a,g)),d(0===f.length,"need dylink section"),a=new Uint8Array(f[0]),f=a.length):(f=1836278016==(new Uint32Array((new Uint8Array(a.subarray(0,24))).buffer))[0],d(!f,"need to see wasm magic number"),
d(0!==a[8],"need the dylink section to be first"),e=9,f=b(),f=e+f,g=c());var h={xa:[],gb:new Set,hb:new Set};if("dylink"==g){h.wa=b();h.ab=b();h.pa=b();h.bc=b();g=b();for(var k=0;k<g;++k){var m=c();h.xa.push(m)}}else for(d("dylink.0"!==g);e<f;)if(g=a[e++],k=b(),1===g)h.wa=b(),h.ab=b(),h.pa=b(),h.bc=b();else if(2===g)for(g=b(),k=0;k<g;++k)m=c(),h.xa.push(m);else if(3===g)for(g=b();g--;)k=c(),m=b(),m&256&&h.gb.add(k);else if(4===g)for(g=b();g--;)c(),k=c(),m=b(),1==(m&3)&&h.hb.add(k);else e+=k;return h},
Qf=[],Bb=new WebAssembly.Table({initial:5831,element:"anyfunc"}),K=a=>{var b=Qf[a];b||(a>=Qf.length&&(Qf.length=a+1),Qf[a]=b=Bb.get(a));return b},Ga=(a,b)=>{M=0;Rf();a=K(a)(b);ff||0<M?Na=a:Ha(a)},Uf=(a,b,c)=>{c={ya:Infinity,name:a,exports:c,global:!0};Sf[a]=c;void 0!=b&&(Tf[b]=c);return c},Sf={},Tf={},Ab=3665600,Vf=(a,b)=>Math.ceil(a/b)*b,Xf=a=>{if(Ya){var b=Wf(a);y.fill(0,b,b+a);return b}b=Ab;Ab=a=b+16*Math.ceil(a/16);Kf.__heap_base.value=a;return b},Zf=(a,b)=>{if(Yf)for(var c=a;c<a+b;c++){var d=
K(c);d&&Yf.set(d,c)}},Yf,$f=a=>{Yf||(Yf=new WeakMap,Zf(0,Bb.length));return Yf.get(a)||0},ag=[],bg=(a,b)=>{var c=$f(a);if(c)return c;if(ag.length)c=ag.pop();else{try{Bb.grow(1)}catch(h){if(!(h instanceof RangeError))throw h;throw"Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";}c=Bb.length-1}try{var d=c;Bb.set(d,a);Qf[d]=Bb.get(d)}catch(h){if(!(h instanceof TypeError))throw h;if("function"==typeof WebAssembly.Function){d=WebAssembly.Function;for(var e={i:"i32",j:"i64",f:"f32",d:"f64",e:"externref",
p:"i32"},f={parameters:[],results:"v"==b[0]?[]:[e[b[0]]]},g=1;g<b.length;++g)f.parameters.push(e[b[g]]);b=new d(f,a)}else{d=[1];e=b.slice(0,1);b=b.slice(1);f={i:127,p:127,j:126,f:125,d:124,e:111};d.push(96);g=b.length;128>g?d.push(g):d.push(g%128|128,g>>7);for(g=0;g<b.length;++g)d.push(f[b[g]]);"v"==e?d.push(0):d.push(1,f[e]);b=[0,97,115,109,1,0,0,0,1];e=d.length;128>e?b.push(e):b.push(e%128|128,e>>7);b.push(...d);b.push(2,7,1,1,101,1,102,0,0,7,5,1,1,102,0,0);b=new WebAssembly.Module(new Uint8Array(b));
b=(new WebAssembly.Instance(b,{e:{f:a}})).exports.f}d=c;Bb.set(d,b);Qf[d]=Bb.get(d)}Yf.set(a,c);return c},cg=(a,b,c)=>{var d={},e;for(e in a){var f=a[e];"object"==typeof f&&(f=f.value);"number"==typeof f&&(f+=b);d[e]=f}for(var g in d){a=g;if("__cpp_exception __c_longjmp __wasm_apply_data_relocs __dso_handle __tls_size __tls_align __set_stack_limits _emscripten_tls_init __wasm_init_tls __wasm_call_ctors __start_em_asm __stop_em_asm __start_em_js __stop_em_js".split(" ").includes(a)||a.startsWith("__em_js__"))continue;
a=d[g];let h,k;(h=Kf)[k=g]||(h[k]=new WebAssembly.Global({value:"i32",mutable:!0}));if(c||0==Kf[g].value)"function"==typeof a?Kf[g].value=bg(a):"number"==typeof a?Kf[g].value=a:w(`unhandled export type for '${g}': ${typeof a}`)}return d},dg=a=>{a=F[a];return!a||a.ia?!1:!0},eg=(a,b=[])=>K(a)(...b),gg=a=>(b,...c)=>{var d=I();try{return eg(b,c)}catch(e){J(d);if(!(e instanceof E))throw e;P(1,0);if("j"==a[0])return 0n}},ig=a=>{var b;dg(a)?b=F[a]:a.startsWith("invoke_")?b=F[a]=gg(a.split("_")[1]):a.startsWith("__cxa_find_matching_catch_")&&
(b=F[a]=(...c)=>hg(c));return{Ma:b,name:a}},R=(a,b)=>{if(!a)return"";b=a+b;for(var c=a;!(c>=b)&&y[c];)++c;return Nf.decode(y.slice(a,c))},mg=(a,b,c,d,e)=>{function f(){function h(u,v){function G(L,ha){L=[];for(var Za=0;16>Za;Za++)if(-1!=ha.indexOf("$"+Za))L.push("$"+Za);else break;L=L.join(",");Ae[H]=eval(`(${L}) => { ${ha} };`)}function N(L,ha,Za){var fg=[];ha=ha.slice(1,-1);if("void"!=ha){ha=ha.split(",");for(var yi in ha){var zi=ha[yi].split(" ").pop();fg.push(zi.replace("*",""))}}q[L]=eval(`(${fg}) => ${Za};`)}
!r&&c&&(ya[c]=u);Zf(p,g.pa);q=cg(v.exports,n);b.lb||jg();if("__start_em_asm"in q){var H=q.__start_em_asm;for(u=q.__stop_em_asm;H<u;){var Q=R(H);G(H,Q);H=y.indexOf(0,H)+1}}for(var ia in q)ia.startsWith("__em_js__")&&(H=q[ia],Q=R(H),u=Q.split("<::>"),N(ia.replace("__em_js__",""),u[0],u[1]),delete q[ia]);kg(q._emscripten_tls_init,v.exports,g);k&&((v=q.__wasm_apply_data_relocs)&&(Ya?v():Xa.push(v)),(v=q.__wasm_call_ctors)&&(Ya?v():Ta.push(v)));return q}var k=!e||!x[e+8];if(k){var m=Math.pow(2,g.ab),n=
g.wa?Vf(Xf(g.wa+m),m):0,p=g.pa?Bb.length:0;e&&(x[e+8]=1,C[e+12>>2]=n,B[e+16>>2]=g.wa,C[e+20>>2]=p,B[e+24>>2]=g.pa)}else n=C[e+12>>2],p=C[e+20>>2];m=p+g.pa-Bb.length;0<m&&Bb.grow(m);var q;m=new Proxy({},{get(u,v){switch(v){case "__memory_base":return n;case "__table_base":return p}if(v in F&&!F[v].ia)return F[v];if(!(v in u)){var G;u[v]=(...N)=>{if(!G){var H=ig(v).Ma;!H&&d&&(H=d[v]);H||=q[v];G=H}return G(...N)}}return u[v]}});var t={"GOT.mem":new Proxy({},ze),"GOT.func":new Proxy({},ze),env:m,wasi_snapshot_preview1:m};
if(b.G)return a instanceof WebAssembly.Module?(t=new WebAssembly.Instance(a,t),Promise.resolve(h(a,t))):WebAssembly.instantiate(a,t).then(u=>h(u.module,u.instance));m=a instanceof WebAssembly.Module?a:new WebAssembly.Module(a);t=new WebAssembly.Instance(m,t);return h(m,t)}var g=Pf(a);Lf=g.hb;if(b.G)return g.xa.reduce((h,k)=>h.then(()=>lg(k,b,d)),Promise.resolve()).then(f);g.xa.forEach(h=>lg(h,b,d));return f()},ng=a=>{var b,c;for([b,c]of Object.entries(a))dg(b)||(F[b]=c),b.startsWith("dynCall_")&&
!l.hasOwnProperty(b)&&(l[b]=c)},og=(a,b,c)=>{var d=`al ${a}`;qa(a).then(e=>{b(new Uint8Array(e));d&&gb(d)},()=>{if(c)c();else throw`Loading data file "${a}" failed.`;});d&&fb(d)};
function lg(a,b={global:!0,la:!0},c,d){function e(){var k=ya[a];if(k)return b.G?Promise.resolve(k):k;if(d){k=C[d+28>>2];var m=C[d+32>>2];if(k&&m)return k=x.slice(k,k+m),b.G?Promise.resolve(k):k}var n=pa(a);if(b.G)return new Promise(function(p,q){og(n,p,q)});if(!ra)throw Error(`${n}: file not found, and synchronous loading of external files is not available`);return ra(n)}function f(){var k=uf[a];return k?b.G?Promise.resolve(k):k:b.G?e().then(m=>mg(m,b,a,c,d)):mg(e(),b,a,c,d)}function g(k){h.global?
ng(k):c&&Object.assign(c,k);h.exports=k}var h=Sf[a];if(h)return b.global?h.global||(h.global=!0,ng(h.exports)):c&&Object.assign(c,h.exports),b.la&&Infinity!==h.ya&&(h.ya=Infinity),h.ya++,d&&(Tf[d]=h),b.G?Promise.resolve(!0):!0;h=Uf(a,d,"loading");h.ya=b.la?Infinity:1;h.global=b.global;if(b.G)return f().then(k=>{g(k);return!0});g(f());return!0}
var jg=()=>{var a,b;for([a,b]of Object.entries(Kf))if(0==b.value){var c=ig(a).Ma;if(c||b.required)if("function"==typeof c)b.value=bg(c,c.g);else if("number"==typeof c)b.value=c;else throw Error(`bad export type for '${a}': ${typeof c}`);}},pg=()=>{xa.length?(fb("loadDylibs"),xa.reduce((a,b)=>a.then(()=>lg(b,{G:!0,global:!0,la:!0,lb:!0})),Promise.resolve()).then(()=>{jg();gb("loadDylibs")})):jg()},ff=l.noExitRuntime||!1,kg=(a,b,c)=>{function d(){var e=a();if(e){var f={};c.gb.forEach(g=>f[g]=b[g]);
cg(f,e,!0)}}af.push(d);Ya&&d()},rb=(a,b,c,d)=>{hb(`Assertion failed: ${R(a)}, at: `+[b?R(b):"unknown filename",c,d?R(d):"unknown function"])};rb.g="vppip";var sb=(a,b)=>K(a)(b);sb.g="vpi";var qg=[],rg=0,tb=a=>{a=new sg(a);0==x[a.s+12]&&(x[a.s+12]=1,rg--);x[a.s+13]=0;qg.push(a);tg(a.ba);if(ug(C[a.s+4>>2]))a=C[a.ba>>2];else{var b=C[a.s+16>>2];a=0!==b?b:a.ba}return a};tb.g="pp";var vg=0,ub=()=>{P(0,0);var a=qg.pop();wg(a.ba);vg=0};ub.g="v";
class sg{constructor(a){this.ba=a;this.s=a-24}init(a,b){C[this.s+16>>2]=0;C[this.s+4>>2]=a;C[this.s+8>>2]=b}}var Fb=a=>{vg||=new kb(a);throw vg;};Fb.g="vp";var hg=a=>{var b=vg?.ba;if(!b)return xg(0),0;var c=new sg(b);C[c.s+16>>2]=b;var d=C[c.s+4>>2];if(!d)return xg(0),b;for(var e of a){if(0===e||e===d)break;if(yg(e,d,c.s+16))return xg(e),b}xg(d);return b},vb=()=>hg([]);vb.g="p";var wb=a=>hg([a]);wb.g="pp";
var xb=()=>{var a=qg.pop();a||hb("no exception to throw");var b=a.ba;0==x[a.s+13]&&(qg.push(a),x[a.s+13]=1,x[a.s+12]=0,rg++);vg=new kb(b);throw vg;};xb.g="v";var yb=(a,b,c)=>{(new sg(a)).init(b,c);vg=new kb(a);rg++;throw vg;};yb.g="vppp";var zb=()=>rg;zb.g="i";function Cb(...a){return F.__lsan_ignore_object(...a)}Cb.ia=!0;var Db=new WebAssembly.Global({value:"i32",mutable:!1},1024);function zg(a,b,c,d){return r?O(2,1,a,b,c,d):Eb(a,b,c,d)}
var Eb=(a,b,c,d)=>{if("undefined"==typeof SharedArrayBuffer)return w("Current environment does not support SharedArrayBuffer, pthreads are not available!"),6;var e=[];if(r&&0===e.length)return zg(a,b,c,d);a={ac:c,fa:a,Na:d,cc:e};return r?(a.Pa="spawnThread",postMessage(a,e),0):Ze(a)};Eb.g="ipppp";
var Gb=3665600,Hb=3403456,Ib=new WebAssembly.Global({value:"i32",mutable:!0},3665600),Ag=(a,b)=>{for(var c=0,d=a.length-1;0<=d;d--){var e=a[d];"."===e?a.splice(d,1):".."===e?(a.splice(d,1),c++):c&&(a.splice(d,1),c--)}if(b)for(;c;c--)a.unshift("..");return a},Bg=a=>{var b="/"===a.charAt(0),c="/"===a.substr(-1);(a=Ag(a.split("/").filter(d=>!!d),!b).join("/"))||b||(a=".");a&&c&&(a+="/");return(b?"/":"")+a},Cg=a=>{var b=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
a=b[0];b=b[1];if(!a&&!b)return".";b&&=b.substr(0,b.length-1);return a+b},Dg=a=>{if("/"===a)return"/";a=Bg(a);a=a.replace(/\/$/,"");var b=a.lastIndexOf("/");return-1===b?a:a.substr(b+1)},Eg=(a,b)=>Bg(a+"/"+b),Fg=()=>{if("object"==typeof crypto&&"function"==typeof crypto.getRandomValues)return a=>(a.set(crypto.getRandomValues(new Uint8Array(a.byteLength))),a);hb("initRandomDevice")},Gg=a=>(Gg=Fg())(a),Hg=(...a)=>{for(var b="",c=!1,d=a.length-1;-1<=d&&!c;d--){c=0<=d?a[d]:FS.cwd();if("string"!=typeof c)throw new TypeError("Arguments to path.resolve must be strings");
if(!c)return"";b=c+"/"+b;c="/"===c.charAt(0)}b=Ag(b.split("/").filter(e=>!!e),!c).join("/");return(c?"/":"")+b||"."},Ig=(a,b)=>{function c(g){for(var h=0;h<g.length&&""===g[h];h++);for(var k=g.length-1;0<=k&&""===g[k];k--);return h>k?[]:g.slice(h,k-h+1)}a=Hg(a).substr(1);b=Hg(b).substr(1);a=c(a.split("/"));b=c(b.split("/"));for(var d=Math.min(a.length,b.length),e=d,f=0;f<d;f++)if(a[f]!==b[f]){e=f;break}d=[];for(f=e;f<a.length;f++)d.push("..");d=d.concat(b.slice(e));return d.join("/")},Jg=[],Kg=a=>
{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);127>=d?b++:2047>=d?b+=2:55296<=d&&57343>=d?(b+=4,++c):b+=3}return b},Lg=(a,b,c,d)=>{if(!(0<d))return 0;var e=c;d=c+d-1;for(var f=0;f<a.length;++f){var g=a.charCodeAt(f);if(55296<=g&&57343>=g){var h=a.charCodeAt(++f);g=65536+((g&1023)<<10)|h&1023}if(127>=g){if(c>=d)break;b[c++]=g}else{if(2047>=g){if(c+1>=d)break;b[c++]=192|g>>6}else{if(65535>=g){if(c+2>=d)break;b[c++]=224|g>>12}else{if(c+3>=d)break;b[c++]=240|g>>18;b[c++]=128|g>>12&63}b[c++]=128|
g>>6&63}b[c++]=128|g&63}}b[c]=0;return c-e};function Mg(a){var b=Array(Kg(a)+1);a=Lg(a,b,0,b.length);b.length=a;return b}var Ng=[];function Og(a,b){Ng[a]={input:[],K:[],W:b};FS.registerDevice(a,Pg)}
var Pg={open(a){var b=Ng[a.node.na];if(!b)throw new FS.h(43);a.A=b;a.seekable=!1},close(a){a.A.W.sa(a.A)},sa(a){a.A.W.sa(a.A)},read(a,b,c,d){if(!a.A||!a.A.W.Xa)throw new FS.h(60);for(var e=0,f=0;f<d;f++){try{var g=a.A.W.Xa(a.A)}catch(h){throw new FS.h(29);}if(void 0===g&&0===e)throw new FS.h(6);if(null===g||void 0===g)break;e++;b[c+f]=g}e&&(a.node.timestamp=Date.now());return e},write(a,b,c,d){if(!a.A||!a.A.W.Ia)throw new FS.h(60);try{for(var e=0;e<d;e++)a.A.W.Ia(a.A,b[c+e])}catch(f){throw new FS.h(29);
}d&&(a.node.timestamp=Date.now());return e}},Qg={Xa(){a:{if(!Jg.length){var a=null;"undefined"!=typeof window&&"function"==typeof window.prompt&&(a=window.prompt("Input: "),null!==a&&(a+="\n"));if(!a){a=null;break a}Jg=Mg(a)}a=Jg.shift()}return a},Ia(a,b){null===b||10===b?(sa(Of(a.K,0)),a.K=[]):0!=b&&a.K.push(b)},sa(a){a.K&&0<a.K.length&&(sa(Of(a.K,0)),a.K=[])},Hb(){return{nc:25856,pc:5,mc:191,oc:35387,lc:[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]}},Ib(){return 0},
Jb(){return[24,80]}},Rg={Ia(a,b){null===b||10===b?(w(Of(a.K,0)),a.K=[]):0!=b&&a.K.push(b)},sa(a){a.K&&0<a.K.length&&(w(Of(a.K,0)),a.K=[])}},Tg=a=>{a=65536*Math.ceil(a/65536);var b=Sg(65536,a);b?(y.fill(0,b,b+a),a=b):a=0;return a};function Ug(a,b){var c=a.u?a.u.length:0;c>=b||(b=Math.max(b,c*(1048576>c?2:1.125)>>>0),0!=c&&(b=Math.max(b,256)),c=a.u,a.u=new Uint8Array(b),0<a.C&&a.u.set(c.subarray(0,a.C),0))}
var S={T:null,mount(){return S.createNode(null,"/",16895,0)},createNode(a,b,c,d){var e;(e=FS.isBlkdev(c))||(e=4096===(c&61440));if(e)throw new FS.h(63);S.T||(S.T={dir:{node:{R:S.m.R,H:S.m.H,ca:S.m.ca,V:S.m.V,rename:S.m.rename,unlink:S.m.unlink,rmdir:S.m.rmdir,oa:S.m.oa,symlink:S.m.symlink},stream:{llseek:S.o.llseek}},file:{node:{R:S.m.R,H:S.m.H},stream:{llseek:S.o.llseek,read:S.o.read,write:S.o.write,Z:S.o.Z,da:S.o.da,ha:S.o.ha}},link:{node:{R:S.m.R,H:S.m.H,readlink:S.m.readlink},stream:{}},Oa:{node:{R:S.m.R,
H:S.m.H},stream:FS.qb}});c=FS.createNode(a,b,c,d);FS.isDir(c.mode)?(c.m=S.T.dir.node,c.o=S.T.dir.stream,c.u={}):FS.isFile(c.mode)?(c.m=S.T.file.node,c.o=S.T.file.stream,c.C=0,c.u=null):FS.isLink(c.mode)?(c.m=S.T.link.node,c.o=S.T.link.stream):FS.isChrdev(c.mode)&&(c.m=S.T.Oa.node,c.o=S.T.Oa.stream);c.timestamp=Date.now();a&&(a.u[b]=c,a.timestamp=c.timestamp);return c},wc(a){return a.u?a.u.subarray?a.u.subarray(0,a.C):new Uint8Array(a.u):new Uint8Array(0)},m:{R(a){var b={};b.tb=FS.isChrdev(a.mode)?
a.id:1;b.Gb=a.id;b.mode=a.mode;b.Pb=1;b.uid=0;b.Db=0;b.na=a.na;FS.isDir(a.mode)?b.size=4096:FS.isFile(a.mode)?b.size=a.C:FS.isLink(a.mode)?b.size=a.link.length:b.size=0;b.mb=new Date(a.timestamp);b.Nb=new Date(a.timestamp);b.sb=new Date(a.timestamp);b.nb=4096;b.ob=Math.ceil(b.size/b.nb);return b},H(a,b){void 0!==b.mode&&(a.mode=b.mode);void 0!==b.timestamp&&(a.timestamp=b.timestamp);if(void 0!==b.size&&(b=b.size,a.C!=b))if(0==b)a.u=null,a.C=0;else{var c=a.u;a.u=new Uint8Array(b);c&&a.u.set(c.subarray(0,
Math.min(b,a.C)));a.C=b}},ca(){throw FS.Ba[44];},V(a,b,c,d){return S.createNode(a,b,c,d)},rename(a,b,c){if(FS.isDir(a.mode)){try{var d=Vg(b,c)}catch(f){}if(d)for(var e in d.u)throw new FS.h(55);}delete a.parent.u[a.name];a.parent.timestamp=Date.now();a.name=c;b.u[c]=a;b.timestamp=a.parent.timestamp},unlink(a,b){delete a.u[b];a.timestamp=Date.now()},rmdir(a,b){var c=Vg(a,b),d;for(d in c.u)throw new FS.h(55);delete a.u[b];a.timestamp=Date.now()},oa(a){var b=[".",".."],c;for(c of Object.keys(a.u))b.push(c);
return b},symlink(a,b,c){a=S.createNode(a,b,41471,0);a.link=c;return a},readlink(a){if(!FS.isLink(a.mode))throw new FS.h(28);return a.link}},o:{read(a,b,c,d,e){var f=a.node.u;if(e>=a.node.C)return 0;a=Math.min(a.node.C-e,d);if(8<a&&f.subarray)b.set(f.subarray(e,e+a),c);else for(d=0;d<a;d++)b[c+d]=f[e+d];return a},write(a,b,c,d,e,f){if(!d)return 0;a=a.node;a.timestamp=Date.now();if(b.subarray&&(!a.u||a.u.subarray)){if(f)return a.u=b.subarray(c,c+d),a.C=d;if(0===a.C&&0===e)return a.u=b.slice(c,c+d),
a.C=d;if(e+d<=a.C)return a.u.set(b.subarray(c,c+d),e),d}Ug(a,e+d);if(a.u.subarray&&b.subarray)a.u.set(b.subarray(c,c+d),e);else for(f=0;f<d;f++)a.u[e+f]=b[c+f];a.C=Math.max(a.C,e+d);return d},llseek(a,b,c){1===c?b+=a.position:2===c&&FS.isFile(a.node.mode)&&(b+=a.node.C);if(0>b)throw new FS.h(28);return b},Z(a,b,c){Ug(a.node,b+c);a.node.C=Math.max(a.node.C,b+c)},da(a,b,c,d,e){if(!FS.isFile(a.node.mode))throw new FS.h(43);a=a.node.u;if(e&2||a.buffer!==x.buffer){if(0<c||c+b<a.length)a.subarray?a=a.subarray(c,
c+b):a=Array.prototype.slice.call(a,c,c+b);c=!0;b=Tg(b);if(!b)throw new FS.h(48);x.set(a,b)}else c=!1,b=a.byteOffset;return{s:b,X:c}},ha(a,b,c,d){S.o.write(a,b,0,d,c,!1);return 0}}},Wg=(a,b,c,d)=>{"undefined"!=typeof Jf&&yf();var e=!1;tf.forEach(f=>{!e&&f.canHandle(b)&&(f.handle(a,b,c,d),e=!0)});return e},Xg=(a,b,c,d,e,f,g,h,k,m)=>{function n(t){function u(v){m?.();h||FS.createDataFile(a,b,v,d,e,k);f?.();gb(q)}Wg(t,p,u,()=>{g?.();gb(q)})||u(t)}var p=b?Hg(Bg(a+"/"+b)):a,q=`cp ${p}`;fb(q);"string"==
typeof c?og(c,n,g):n(c)},Yg=(a,b)=>{var c=0;a&&(c|=365);b&&(c|=146);return c};function Vg(a,b){var c=FS.isDir(a.mode)?(c=Zg(a,"x"))?c:a.m.ca?0:2:54;if(c)throw new FS.h(c);for(c=FS.S[$g(a.id,b)];c;c=c.ea){var d=c.name;if(c.parent.id===a.id&&d===b)return c}return FS.ca(a,b)}function $g(a,b){for(var c=0,d=0;d<b.length;d++)c=(c<<5)-c+b.charCodeAt(d)|0;return(a+c>>>0)%FS.S.length}function ah(a){var b=$g(a.parent.id,a.name);a.ea=FS.S[b];FS.S[b]=a}
function bh(a){var b=$g(a.parent.id,a.name);if(FS.S[b]===a)FS.S[b]=a.ea;else for(b=FS.S[b];b;){if(b.ea===a){b.ea=a.ea;break}b=b.ea}}function ch(a){var b=["r","w","rw"][a&3];a&512&&(b+="w");return b}function Zg(a,b){if(FS.Ya)return 0;if(!b.includes("r")||a.mode&292){if(b.includes("w")&&!(a.mode&146)||b.includes("x")&&!(a.mode&73))return 2}else return 2;return 0}function dh(a,b){try{return Vg(a,b),20}catch(c){}return Zg(a,"wx")}
function eh(a,b,c){try{var d=Vg(a,b)}catch(e){return e.B}if(a=Zg(a,"wx"))return a;if(c){if(!FS.isDir(d.mode))return 54;if(FS.ua(d)||FS.getPath(d)===FS.cwd())return 10}else if(FS.isDir(d.mode))return 31;return 0}function T(a){a=FS.Wa(a);if(!a)throw new FS.h(8);return a}function fh(a,b=-1){a=Object.assign(new FS.jb,a);if(-1==b)a:{for(b=0;b<=FS.kb;b++)if(!FS.streams[b])break a;throw new FS.h(33);}a.P=b;return FS.streams[b]=a}function gh(a,b=-1){a=fh(a,b);a.o?.sc?.(a);return a}
function hh(a){var b=[];for(a=[a];a.length;){var c=a.pop();b.push(c);a.push(...c.ka)}return b}function ih(a,b,c,d){a="string"==typeof a?a:FS.getPath(a);b=Bg(a+"/"+b);return FS.create(b,Yg(c,d))}
function jh(a){if(!(a.Kb||a.Lb||a.link||a.u)){if("undefined"!=typeof XMLHttpRequest)throw Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");try{a.u=ra(a.url),a.C=a.u.length}catch(b){throw new FS.h(29);}}}
var FS={root:null,ka:[],Ta:{},streams:[],Ob:1,S:null,Ra:"/",Ea:!1,Ya:!0,h:class{constructor(a){this.name="ErrnoError";this.B=a}},Ba:{},xb:null,za:0,jb:class{constructor(){this.M={};this.node=null}get object(){return this.node}set object(a){this.node=a}get flags(){return this.M.flags}set flags(a){this.M.flags=a}get position(){return this.M.position}set position(a){this.M.position=a}},ib:class{constructor(a,b,c,d){a||=this;this.parent=a;this.mount=a.mount;this.O=null;this.id=FS.Ob++;this.name=b;this.mode=
c;this.m={};this.o={};this.na=d}get read(){return 365===(this.mode&365)}set read(a){a?this.mode|=365:this.mode&=-366}get write(){return 146===(this.mode&146)}set write(a){a?this.mode|=146:this.mode&=-147}get Lb(){return FS.isDir(this.mode)}get Kb(){return FS.isChrdev(this.mode)}},lookupPath(a,b={}){a=Hg(a);if(!a)return{path:"",node:null};b=Object.assign({Aa:!0,La:0},b);if(8<b.La)throw new FS.h(32);a=a.split("/").filter(g=>!!g);for(var c=FS.root,d="/",e=0;e<a.length;e++){var f=e===a.length-1;if(f&&
b.parent)break;c=Vg(c,a[e]);d=Bg(d+"/"+a[e]);c.O&&(!f||f&&b.Aa)&&(c=c.O.root);if(!f||b.follow)for(f=0;FS.isLink(c.mode);)if(c=FS.readlink(d),d=Hg(Cg(d),c),c=FS.lookupPath(d,{La:b.La+1}).node,40<f++)throw new FS.h(32);}return{path:d,node:c}},getPath(a){for(var b;;){if(FS.ua(a))return a=a.mount.bb,b?"/"!==a[a.length-1]?`${a}/${b}`:a+b:a;b=b?`${a.name}/${b}`:a.name;a=a.parent}},createNode(a,b,c,d){a=new FS.ib(a,b,c,d);ah(a);return a},ua(a){return a===a.parent},isFile(a){return 32768===(a&61440)},isDir(a){return 16384===
(a&61440)},isLink(a){return 40960===(a&61440)},isChrdev(a){return 8192===(a&61440)},isBlkdev(a){return 24576===(a&61440)},isSocket(a){return 49152===(a&49152)},kb:4096,Wa:a=>FS.streams[a],qb:{open(a){a.o=FS.zb(a.node.na).o;a.o.open?.(a)},llseek(){throw new FS.h(70);}},Ha:a=>a>>8,Ac:a=>a&255,makedev:(a,b)=>a<<8|b,registerDevice(a,b){FS.Ta[a]={o:b}},zb:a=>FS.Ta[a],syncfs(a,b){function c(g){FS.za--;return b(g)}function d(g){if(g){if(!d.vb)return d.vb=!0,c(g)}else++f>=e.length&&c(null)}"function"==typeof a&&
(b=a,a=!1);FS.za++;1<FS.za&&w(`warning: ${FS.za} FS.syncfs operations in flight at once, probably just doing extra work`);var e=hh(FS.root.mount),f=0;e.forEach(g=>{if(!g.type.syncfs)return d(null);g.type.syncfs(g,a,d)})},mount(a,b,c){var d="/"===c;if(d&&FS.root)throw new FS.h(10);if(!d&&c){var e=FS.lookupPath(c,{Aa:!1});c=e.path;e=e.node;if(e.O)throw new FS.h(10);if(!FS.isDir(e.mode))throw new FS.h(54);}b={type:a,Dc:b,bb:c,ka:[]};a=a.mount(b);a.mount=b;b.root=a;d?FS.root=a:e&&(e.O=b,e.mount&&e.mount.ka.push(b));
return a},unmount(a){a=FS.lookupPath(a,{Aa:!1});if(!a.node.O)throw new FS.h(28);a=a.node;var b=a.O,c=hh(b);Object.keys(FS.S).forEach(d=>{for(d=FS.S[d];d;){var e=d.ea;c.includes(d.mount)&&bh(d);d=e}});a.O=null;a.mount.ka.splice(a.mount.ka.indexOf(b),1)},ca(a,b){return a.m.ca(a,b)},V(a,b,c){var d=FS.lookupPath(a,{parent:!0}).node;a=Dg(a);if(!a||"."===a||".."===a)throw new FS.h(28);var e=dh(d,a);if(e)throw new FS.h(e);if(!d.m.V)throw new FS.h(63);return d.m.V(d,a,b,c)},create(a,b){return FS.V(a,(void 0!==
b?b:438)&4095|32768,0)},mkdir(a,b){return FS.V(a,(void 0!==b?b:511)&1023|16384,0)},Bc(a,b){a=a.split("/");for(var c="",d=0;d<a.length;++d)if(a[d]){c+="/"+a[d];try{FS.mkdir(c,b)}catch(e){if(20!=e.B)throw e;}}},mkdev(a,b,c){"undefined"==typeof c&&(c=b,b=438);return FS.V(a,b|8192,c)},symlink(a,b){if(!Hg(a))throw new FS.h(44);var c=FS.lookupPath(b,{parent:!0}).node;if(!c)throw new FS.h(44);b=Dg(b);var d=dh(c,b);if(d)throw new FS.h(d);if(!c.m.symlink)throw new FS.h(63);return c.m.symlink(c,b,a)},rename(a,
b){var c=Cg(a),d=Cg(b),e=Dg(a),f=Dg(b);var g=FS.lookupPath(a,{parent:!0});var h=g.node;g=FS.lookupPath(b,{parent:!0});g=g.node;if(!h||!g)throw new FS.h(44);if(h.mount!==g.mount)throw new FS.h(75);var k=Vg(h,e);a=Ig(a,d);if("."!==a.charAt(0))throw new FS.h(28);a=Ig(b,c);if("."!==a.charAt(0))throw new FS.h(55);try{var m=Vg(g,f)}catch(n){}if(k!==m){b=FS.isDir(k.mode);if(e=eh(h,e,b))throw new FS.h(e);if(e=m?eh(g,f,b):dh(g,f))throw new FS.h(e);if(!h.m.rename)throw new FS.h(63);if(k.O||m&&m.O)throw new FS.h(10);
if(g!==h&&(e=Zg(h,"w")))throw new FS.h(e);bh(k);try{h.m.rename(k,g,f),k.parent=g}catch(n){throw n;}finally{ah(k)}}},rmdir(a){var b=FS.lookupPath(a,{parent:!0}).node;a=Dg(a);var c=Vg(b,a),d=eh(b,a,!0);if(d)throw new FS.h(d);if(!b.m.rmdir)throw new FS.h(63);if(c.O)throw new FS.h(10);b.m.rmdir(b,a);bh(c)},oa(a){a=FS.lookupPath(a,{follow:!0}).node;if(!a.m.oa)throw new FS.h(54);return a.m.oa(a)},unlink(a){var b=FS.lookupPath(a,{parent:!0}).node;if(!b)throw new FS.h(44);a=Dg(a);var c=Vg(b,a),d=eh(b,a,!1);
if(d)throw new FS.h(d);if(!b.m.unlink)throw new FS.h(63);if(c.O)throw new FS.h(10);b.m.unlink(b,a);bh(c)},readlink(a){a=FS.lookupPath(a).node;if(!a)throw new FS.h(44);if(!a.m.readlink)throw new FS.h(28);return Hg(FS.getPath(a.parent),a.m.readlink(a))},stat(a,b){a=FS.lookupPath(a,{follow:!b}).node;if(!a)throw new FS.h(44);if(!a.m.R)throw new FS.h(63);return a.m.R(a)},lstat(a){return FS.stat(a,!0)},chmod(a,b,c){a="string"==typeof a?FS.lookupPath(a,{follow:!c}).node:a;if(!a.m.H)throw new FS.h(63);a.m.H(a,
{mode:b&4095|a.mode&-4096,timestamp:Date.now()})},lchmod(a,b){FS.chmod(a,b,!0)},fchmod(a,b){a=T(a);FS.chmod(a.node,b)},chown(a,b,c,d){a="string"==typeof a?FS.lookupPath(a,{follow:!d}).node:a;if(!a.m.H)throw new FS.h(63);a.m.H(a,{timestamp:Date.now()})},lchown(a,b,c){FS.chown(a,b,c,!0)},fchown(a,b,c){a=T(a);FS.chown(a.node,b,c)},truncate(a,b){if(0>b)throw new FS.h(28);a="string"==typeof a?FS.lookupPath(a,{follow:!0}).node:a;if(!a.m.H)throw new FS.h(63);if(FS.isDir(a.mode))throw new FS.h(31);if(!FS.isFile(a.mode))throw new FS.h(28);
var c=Zg(a,"w");if(c)throw new FS.h(c);a.m.H(a,{size:b,timestamp:Date.now()})},ftruncate(a,b){a=T(a);if(0===(a.flags&2097155))throw new FS.h(28);FS.truncate(a.node,b)},utime(a,b,c){a=FS.lookupPath(a,{follow:!0}).node;a.m.H(a,{timestamp:Math.max(b,c)})},open(a,b,c){if(""===a)throw new FS.h(44);if("string"==typeof b){var d={r:0,"r+":2,w:577,"w+":578,a:1089,"a+":1090}[b];if("undefined"==typeof d)throw Error(`Unknown file open mode: ${b}`);b=d}c=b&64?("undefined"==typeof c?438:c)&4095|32768:0;if("object"==
typeof a)var e=a;else{a=Bg(a);try{e=FS.lookupPath(a,{follow:!(b&131072)}).node}catch(g){}}d=!1;if(b&64)if(e){if(b&128)throw new FS.h(20);}else e=FS.V(a,c,0),d=!0;if(!e)throw new FS.h(44);FS.isChrdev(e.mode)&&(b&=-513);if(b&65536&&!FS.isDir(e.mode))throw new FS.h(54);if(!d){c=e;var f=b;if(c=c?FS.isLink(c.mode)?32:FS.isDir(c.mode)&&("r"!==ch(f)||f&512)?31:Zg(c,ch(f)):44)throw new FS.h(c);}b&512&&!d&&FS.truncate(e,0);b&=-131713;e=fh({node:e,path:FS.getPath(e),flags:b,seekable:!0,position:0,o:e.o,ec:[],
error:!1});e.o.open&&e.o.open(e);!l.logReadFiles||b&1||(FS.Ka||(FS.Ka={}),a in FS.Ka||(FS.Ka[a]=1));return e},close(a){if(null===a.P)throw new FS.h(8);a.Ca&&(a.Ca=null);try{a.o.close&&a.o.close(a)}catch(b){throw b;}finally{FS.streams[a.P]=null}a.P=null},llseek(a,b,c){if(null===a.P)throw new FS.h(8);if(!a.seekable||!a.o.llseek)throw new FS.h(70);if(0!=c&&1!=c&&2!=c)throw new FS.h(28);a.position=a.o.llseek(a,b,c);a.ec=[];return a.position},read(a,b,c,d,e){if(0>d||0>e)throw new FS.h(28);if(null===a.P)throw new FS.h(8);
if(1===(a.flags&2097155))throw new FS.h(8);if(FS.isDir(a.node.mode))throw new FS.h(31);if(!a.o.read)throw new FS.h(28);var f="undefined"!=typeof e;if(!f)e=a.position;else if(!a.seekable)throw new FS.h(70);b=a.o.read(a,b,c,d,e);f||(a.position+=b);return b},write(a,b,c,d,e,f){if(0>d||0>e)throw new FS.h(28);if(null===a.P)throw new FS.h(8);if(0===(a.flags&2097155))throw new FS.h(8);if(FS.isDir(a.node.mode))throw new FS.h(31);if(!a.o.write)throw new FS.h(28);a.seekable&&a.flags&1024&&FS.llseek(a,0,2);
var g="undefined"!=typeof e;if(!g)e=a.position;else if(!a.seekable)throw new FS.h(70);b=a.o.write(a,b,c,d,e,f);g||(a.position+=b);return b},Z(a,b,c){if(null===a.P)throw new FS.h(8);if(0>b||0>=c)throw new FS.h(28);if(0===(a.flags&2097155))throw new FS.h(8);if(!FS.isFile(a.node.mode)&&!FS.isDir(a.node.mode))throw new FS.h(43);if(!a.o.Z)throw new FS.h(138);a.o.Z(a,b,c)},da(a,b,c,d,e){if(0!==(d&2)&&0===(e&2)&&2!==(a.flags&2097155))throw new FS.h(2);if(1===(a.flags&2097155))throw new FS.h(2);if(!a.o.da)throw new FS.h(43);
return a.o.da(a,b,c,d,e)},ha(a,b,c,d,e){return a.o.ha?a.o.ha(a,b,c,d,e):0},Fa(a,b,c){if(!a.o.Fa)throw new FS.h(59);return a.o.Fa(a,b,c)},readFile(a,b={}){b.flags=b.flags||0;b.encoding=b.encoding||"binary";if("utf8"!==b.encoding&&"binary"!==b.encoding)throw Error(`Invalid encoding type "${b.encoding}"`);var c,d=FS.open(a,b.flags);a=FS.stat(a).size;var e=new Uint8Array(a);FS.read(d,e,0,a,0);"utf8"===b.encoding?c=Of(e,0):"binary"===b.encoding&&(c=e);FS.close(d);return c},writeFile(a,b,c={}){c.flags=
c.flags||577;a=FS.open(a,c.flags,c.mode);if("string"==typeof b){var d=new Uint8Array(Kg(b)+1);b=Lg(b,d,0,d.length);FS.write(a,d,0,b,void 0,c.pb)}else if(ArrayBuffer.isView(b))FS.write(a,b,0,b.byteLength,void 0,c.pb);else throw Error("Unsupported data type");FS.close(a)},cwd:()=>FS.Ra,chdir(a){a=FS.lookupPath(a,{follow:!0});if(null===a.node)throw new FS.h(44);if(!FS.isDir(a.node.mode))throw new FS.h(54);var b=Zg(a.node,"x");if(b)throw new FS.h(b);FS.Ra=a.path},init(a,b,c){FS.init.Ea=!0;l.stdin=a||
l.stdin;l.stdout=b||l.stdout;l.stderr=c||l.stderr;l.stdin?FS.createDevice("/dev","stdin",l.stdin):FS.symlink("/dev/tty","/dev/stdin");l.stdout?FS.createDevice("/dev","stdout",null,l.stdout):FS.symlink("/dev/tty","/dev/stdout");l.stderr?FS.createDevice("/dev","stderr",null,l.stderr):FS.symlink("/dev/tty1","/dev/stderr");FS.open("/dev/stdin",0);FS.open("/dev/stdout",1);FS.open("/dev/stderr",1)},uc(a,b){a=FS.analyzePath(a,b);return a.Ua?a.object:null},analyzePath(a,b){try{var c=FS.lookupPath(a,{follow:!b});
a=c.path}catch(e){}var d={ua:!1,Ua:!1,error:0,name:null,path:null,object:null,Qb:!1,Sb:null,Rb:null};try{c=FS.lookupPath(a,{parent:!0}),d.Qb=!0,d.Sb=c.path,d.Rb=c.node,d.name=Dg(a),c=FS.lookupPath(a,{follow:!b}),d.Ua=!0,d.path=c.path,d.object=c.node,d.name=c.node.name,d.ua="/"===c.path}catch(e){d.error=e.B}return d},createPath(a,b){a="string"==typeof a?a:FS.getPath(a);for(b=b.split("/").reverse();b.length;){var c=b.pop();if(c){var d=Bg(a+"/"+c);try{FS.mkdir(d)}catch(e){}a=d}}return d},createDataFile(a,
b,c,d,e,f){var g=b;a&&(a="string"==typeof a?a:FS.getPath(a),g=b?Bg(a+"/"+b):a);a=Yg(d,e);g=FS.create(g,a);if(c){if("string"==typeof c){b=Array(c.length);d=0;for(e=c.length;d<e;++d)b[d]=c.charCodeAt(d);c=b}FS.chmod(g,a|146);b=FS.open(g,577);FS.write(b,c,0,c.length,0,f);FS.close(b);FS.chmod(g,a)}},createDevice(a,b,c,d){a=Eg("string"==typeof a?a:FS.getPath(a),b);b=Yg(!!c,!!d);FS.createDevice.Ha||(FS.createDevice.Ha=64);var e=FS.makedev(FS.createDevice.Ha++,0);FS.registerDevice(e,{open(f){f.seekable=
!1},close(){d?.buffer?.length&&d(10)},read(f,g,h,k){for(var m=0,n=0;n<k;n++){try{var p=c()}catch(q){throw new FS.h(29);}if(void 0===p&&0===m)throw new FS.h(6);if(null===p||void 0===p)break;m++;g[h+n]=p}m&&(f.node.timestamp=Date.now());return m},write(f,g,h,k){for(var m=0;m<k;m++)try{d(g[h+m])}catch(n){throw new FS.h(29);}k&&(f.node.timestamp=Date.now());return m}});return FS.mkdev(a,b,e)},createLazyFile(a,b,c,d,e){function f(p,q,t,u,v){p=p.node.u;if(v>=p.length)return 0;u=Math.min(p.length-v,u);if(p.slice)for(var G=
0;G<u;G++)q[t+G]=p[v+G];else for(G=0;G<u;G++)q[t+G]=p.get(v+G);return u}class g{constructor(){this.Da=!1;this.M=[];this.ja=void 0;this.Za=this.$a=0}get(p){if(!(p>this.length-1||0>p)){var q=p%this.fb;return this.ja(p/this.fb|0)[q]}}dc(p){this.ja=p}cb(){var p=new XMLHttpRequest;p.open("HEAD",c,!1);p.send(null);if(!(200<=p.status&&300>p.status||304===p.status))throw Error("Couldn't load "+c+". Status: "+p.status);var q=Number(p.getResponseHeader("Content-length")),t,u=(t=p.getResponseHeader("Accept-Ranges"))&&
"bytes"===t;p=(t=p.getResponseHeader("Content-Encoding"))&&"gzip"===t;var v=1048576;u||(v=q);var G=this;G.dc(N=>{var H=N*v,Q=(N+1)*v-1;Q=Math.min(Q,q-1);if("undefined"==typeof G.M[N]){var ia=G.M;if(H>Q)throw Error("invalid range ("+H+", "+Q+") or no bytes requested!");if(Q>q-1)throw Error("only "+q+" bytes available! programmer error!");var L=new XMLHttpRequest;L.open("GET",c,!1);q!==v&&L.setRequestHeader("Range","bytes="+H+"-"+Q);L.responseType="arraybuffer";L.overrideMimeType&&L.overrideMimeType("text/plain; charset=x-user-defined");
L.send(null);if(!(200<=L.status&&300>L.status||304===L.status))throw Error("Couldn't load "+c+". Status: "+L.status);H=void 0!==L.response?new Uint8Array(L.response||[]):Mg(L.responseText||"");ia[N]=H}if("undefined"==typeof G.M[N])throw Error("doXHR failed!");return G.M[N]});if(p||!q)v=q=1,v=q=this.ja(0).length,sa("LazyFiles on gzip forces download of the whole file when length is accessed");this.$a=q;this.Za=v;this.Da=!0}get length(){this.Da||this.cb();return this.$a}get fb(){this.Da||this.cb();
return this.Za}}if("undefined"!=typeof XMLHttpRequest){if(!ea)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var h=new g;var k=void 0}else k=c,h=void 0;var m=ih(a,b,d,e);h?m.u=h:k&&(m.u=null,m.url=k);Object.defineProperties(m,{C:{get:function(){return this.u.length}}});var n={};Object.keys(m.o).forEach(p=>{var q=m.o[p];n[p]=(...t)=>{jh(m);return q(...t)}});n.read=(p,q,t,u,v)=>{jh(m);return f(p,q,t,u,v)};n.da=(p,q,t)=>{jh(m);
var u=Tg(q);if(!u)throw new FS.h(48);f(p,x,u,q,t);return{s:u,X:!0}};m.o=n;return m}},kh=5;function lh(a,b,c){if("/"===b.charAt(0))return b;a=-100===a?FS.cwd():T(a).path;if(0==b.length){if(!c)throw new FS.h(44);return a}return Bg(a+"/"+b)}
function mh(a,b,c){a=a(b);B[c>>2]=a.tb;B[c+4>>2]=a.mode;C[c+8>>2]=a.Pb;B[c+12>>2]=a.uid;B[c+16>>2]=a.Db;B[c+20>>2]=a.na;D[c+24>>3]=BigInt(a.size);B[c+32>>2]=4096;B[c+36>>2]=a.ob;b=a.mb.getTime();var d=a.Nb.getTime(),e=a.sb.getTime();D[c+40>>3]=BigInt(Math.floor(b/1E3));C[c+48>>2]=b%1E3*1E3;D[c+56>>3]=BigInt(Math.floor(d/1E3));C[c+64>>2]=d%1E3*1E3;D[c+72>>3]=BigInt(Math.floor(e/1E3));C[c+80>>2]=e%1E3*1E3;D[c+88>>3]=BigInt(a.Gb);return 0}var nh=void 0;
function Jb(a){if(r)return O(3,1,a);try{var b=T(a);return gh(b).P}catch(c){if("undefined"==typeof FS||"ErrnoError"!==c.name)throw c;return-c.B}}Jb.g="ii";function Kb(a,b,c,d){if(r)return O(4,1,a,b,c,d);try{b=R(b);b=lh(a,b);if(c&-8)return-28;var e=FS.lookupPath(b,{follow:!0}).node;if(!e)return-44;a="";c&4&&(a+="r");c&2&&(a+="w");c&1&&(a+="x");return a&&Zg(e,a)?-2:0}catch(f){if("undefined"==typeof FS||"ErrnoError"!==f.name)throw f;return-f.B}}Kb.g="iipii";
function oh(){var a=B[+nh>>2];nh+=4;return a}function Lb(a,b,c){if(r)return O(5,1,a,b,c);nh=c;try{var d=T(a);switch(b){case 0:var e=oh();if(0>e)break;for(;FS.streams[e];)e++;return gh(d,e).P;case 1:case 2:return 0;case 3:return d.flags;case 4:return e=oh(),d.flags|=e,0;case 12:return e=oh(),z[e+0>>1]=2,0;case 13:case 14:return 0}return-28}catch(f){if("undefined"==typeof FS||"ErrnoError"!==f.name)throw f;return-f.B}}Lb.g="iiip";
function Mb(a,b){if(r)return O(6,1,a,b);try{var c=T(a);return mh(FS.stat,c.path,b)}catch(d){if("undefined"==typeof FS||"ErrnoError"!==d.name)throw d;return-d.B}}Mb.g="iip";function Nb(a,b){if(r)return O(7,1,a,b);b=Oe(b);try{if(isNaN(b))return 61;FS.ftruncate(a,b);return 0}catch(c){if("undefined"==typeof FS||"ErrnoError"!==c.name)throw c;return-c.B}}Nb.g="iij";
function Ob(a,b){if(r)return O(8,1,a,b);try{if(0===b)return-28;var c=FS.cwd(),d=Kg(c)+1;if(b<d)return-68;Lg(c,y,a,b);return d}catch(e){if("undefined"==typeof FS||"ErrnoError"!==e.name)throw e;return-e.B}}Ob.g="ipp";
function Pb(a,b,c){if(r)return O(9,1,a,b,c);nh=c;try{var d=T(a);switch(b){case 21509:return d.A?0:-59;case 21505:if(!d.A)return-59;if(d.A.W.Hb){a=[3,28,127,21,4,0,1,0,17,19,26,0,18,15,23,22,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];var e=oh();B[e>>2]=25856;B[e+4>>2]=5;B[e+8>>2]=191;B[e+12>>2]=35387;for(var f=0;32>f;f++)x[e+f+17]=a[f]||0}return 0;case 21510:case 21511:case 21512:return d.A?0:-59;case 21506:case 21507:case 21508:if(!d.A)return-59;if(d.A.W.Ib)for(e=oh(),a=[],f=0;32>f;f++)a.push(x[e+f+17]);return 0;
case 21519:if(!d.A)return-59;e=oh();return B[e>>2]=0;case 21520:return d.A?-28:-59;case 21531:return e=oh(),FS.Fa(d,b,e);case 21523:if(!d.A)return-59;d.A.W.Jb&&(f=[24,80],e=oh(),z[e>>1]=f[0],z[e+2>>1]=f[1]);return 0;case 21524:return d.A?0:-59;case 21515:return d.A?0:-59;default:return-28}}catch(g){if("undefined"==typeof FS||"ErrnoError"!==g.name)throw g;return-g.B}}Pb.g="iiip";
function Qb(a,b){if(r)return O(10,1,a,b);try{return a=R(a),mh(FS.lstat,a,b)}catch(c){if("undefined"==typeof FS||"ErrnoError"!==c.name)throw c;return-c.B}}Qb.g="ipp";function Rb(a,b,c,d){if(r)return O(11,1,a,b,c,d);try{b=R(b);var e=d&256;b=lh(a,b,d&4096);return mh(e?FS.lstat:FS.stat,b,c)}catch(f){if("undefined"==typeof FS||"ErrnoError"!==f.name)throw f;return-f.B}}Rb.g="iippi";
function Sb(a,b,c,d){if(r)return O(12,1,a,b,c,d);nh=d;try{b=R(b);b=lh(a,b);var e=d?oh():0;return FS.open(b,c,e).P}catch(f){if("undefined"==typeof FS||"ErrnoError"!==f.name)throw f;return-f.B}}Sb.g="iipip";function Tb(a,b,c){if(r)return O(13,1,a,b,c);try{for(var d=c=0;d<b;d++){var e=a+8*d,f=z[e+4>>1],g=32,h=FS.Wa(B[e>>2]);h&&(g=kh,h.o.Ub&&(g=h.o.Ub(h,-1)));(g&=f|24)&&c++;z[e+6>>1]=g}return c}catch(k){if("undefined"==typeof FS||"ErrnoError"!==k.name)throw k;return-k.B}}Tb.g="ipii";
function Ub(a){if(r)return O(14,1,a);try{return a=R(a),FS.rmdir(a),0}catch(b){if("undefined"==typeof FS||"ErrnoError"!==b.name)throw b;return-b.B}}Ub.g="ip";function Vb(a,b){if(r)return O(15,1,a,b);try{return a=R(a),mh(FS.stat,a,b)}catch(c){if("undefined"==typeof FS||"ErrnoError"!==c.name)throw c;return-c.B}}Vb.g="ipp";
function Wb(a,b,c){if(r)return O(16,1,a,b,c);try{return b=R(b),b=lh(a,b),0===c?FS.unlink(b):512===c?FS.rmdir(b):hb("Invalid flags passed to unlinkat"),0}catch(d){if("undefined"==typeof FS||"ErrnoError"!==d.name)throw d;return-d.B}}Wb.g="iipi";var Xb=new WebAssembly.Global({value:"i32",mutable:!1},1),Yb=()=>{hb("")};Yb.g="v";
var ph={},qh=a=>{var b=Kg(a)+1,c=Ce(b);Lg(a,y,c,b);return c},sh=a=>{var b=I();a=qh(a);rh(a,0);J(b)},th=(a,b)=>{var c=R(a+36),d=B[a+4>>2];c=Bg(c);var e=!!(d&256),f=e?null:{};d={global:e,la:!!(d&4096),G:b.G};if(b.G)return lg(c,d,f,a);try{return lg(c,d,f,a)}catch(g){return sh(`Could not load dynamic lib: ${c}\n${g}`),0}},Zb=a=>th(a,{G:!1});Zb.g="pp";var $b=(a,b)=>{a=Tf[a].exports;b=Object.keys(a)[b];b=a[b];return bg(b,b.g)};$b.g="ppi";
var ac=(a,b,c)=>{b=R(b);var d=Tf[a];if(!d.exports.hasOwnProperty(b)||d.exports[b].ia)return sh(`Tried to lookup unknown symbol "${b}" in dynamic lib: ${d.name}`),0;a=Object.keys(d.exports).indexOf(b);b=d.exports[b];"function"==typeof b&&((d=$f(b))?b=d:(b=bg(b,b.g),C[c>>2]=a));return b};ac.g="pppp";var uh={},vh=a=>{for(;a.length;){var b=a.pop();a.pop()(b)}};function wh(a){return this.fromWireType(C[a>>2])}
var xh={},yh={},zh={},Ah,Ch=(a,b,c)=>{function d(h){h=c(h);if(h.length!==a.length)throw new Ah("Mismatched type converter count");for(var k=0;k<a.length;++k)Bh(a[k],h[k])}a.forEach(function(h){zh[h]=b});var e=Array(b.length),f=[],g=0;b.forEach((h,k)=>{yh.hasOwnProperty(h)?e[k]=yh[h]:(f.push(h),xh.hasOwnProperty(h)||(xh[h]=[]),xh[h].push(()=>{e[k]=yh[h];++g;g===f.length&&d(e)}))});0===f.length&&d(e)},bc=a=>{var b=uh[a];delete uh[a];var c=b.Ja,d=b.U,e=b.Va,f=e.map(g=>g.Cb).concat(e.map(g=>g.Yb));Ch([a],
f,g=>{var h={};e.forEach((k,m)=>{var n=g[m],p=k.ja,q=k.Bb,t=g[m+e.length],u=k.Xb,v=k.Zb;h[k.wb]={read:G=>n.fromWireType(p(q,G)),write:(G,N)=>{var H=[];u(v,G,t.toWireType(H,N));vh(H)}}});return[{name:b.name,fromWireType:k=>{var m={},n;for(n in h)m[n]=h[n].read(k);d(k);return m},toWireType:(k,m)=>{for(var n in h)if(!(n in m))throw new TypeError(`Missing field: "${n}"`);var p=c();for(n in h)h[n].write(p,m[n]);null!==k&&k.push(d,p);return p},argPackAdvance:Dh,readValueFromPointer:wh,J:d}]})};bc.g="vp";
var Eh,U=a=>{for(var b="";y[a];)b+=Eh[y[a++]];return b},V,Fh=a=>{throw new V(a);};function Gh(a,b,c={}){var d=b.name;if(!a)throw new V(`type "${d}" must have a positive integer typeid pointer`);if(yh.hasOwnProperty(a)){if(c.Fb)return;throw new V(`Cannot register type '${d}' twice`);}yh[a]=b;delete zh[a];xh.hasOwnProperty(a)&&(b=xh[a],delete xh[a],b.forEach(e=>e()))}
function Bh(a,b,c={}){if(!("argPackAdvance"in b))throw new TypeError("registerType registeredInstance requires argPackAdvance");return Gh(a,b,c)}
var cc=(a,b,c,d,e)=>{b=U(b);if(d)a:switch(c){case 4:d=Oa;break a;case 8:d=Qa;break a;default:throw new TypeError(`invalid float width (${c}): ${b}`);}else a:switch(c){case 1:d=e?x:y;break a;case 2:d=e?z:A;break a;case 4:d=e?B:C;break a;case 8:d=e?D:Pa;break a;default:throw new TypeError(`invalid integer width (${c}): ${b}`);}var f=d,g=Math.log2(c);Bh(a,{name:b,fromWireType:h=>{for(var k=C[h>>2],m=Array(k),n=h+Math.max(4,c)>>g,p=0;p<k;++p)m[p]=f[n+p];W(h);return m},toWireType:(h,k)=>{"number"==typeof k&&
(k=[k]);if(!Array.isArray(k))throw new V("Cannot pass non-array to C++ vector type "+b);k=Array.prototype.concat.apply([],k);var m=k.length,n=Math.max(4,c),p=Wf(n+m*c);n=p+n>>g;C[p>>2]=m;f.set(k,n);null!==h&&h.push(W,p);return p},argPackAdvance:Dh,readValueFromPointer:wh,J(h){W(h)}})};cc.g="vpppii";
var Hh=a=>{if(null===a)return"null";var b=typeof a;return"object"===b||"array"===b||"function"===b?a.toString():""+a},Ih=(a,b,c)=>{switch(b){case 1:return c?d=>x[d]:d=>y[d];case 2:return c?d=>z[d>>1]:d=>A[d>>1];case 4:return c?d=>B[d>>2]:d=>C[d>>2];case 8:return c?d=>D[d>>3]:d=>Pa[d>>3];default:throw new TypeError(`invalid integer width (${b}): ${a}`);}},dc=(a,b,c)=>{b=U(b);var d=b.includes("u");Bh(a,{name:b,fromWireType:e=>e,toWireType:function(e,f){if("bigint"!=typeof f&&"number"!=typeof f)throw new TypeError(`Cannot convert "${Hh(f)}" to ${this.name}`);
"number"==typeof f&&(f=BigInt(f));return f},argPackAdvance:Dh,readValueFromPointer:Ih(b,c,!d),J:null})};dc.g="vpppjj";var Dh=8,ec=(a,b,c,d)=>{b=U(b);Bh(a,{name:b,fromWireType:function(e){return!!e},toWireType:function(e,f){return f?c:d},argPackAdvance:Dh,readValueFromPointer:function(e){return this.fromWireType(y[e])},J:null})};ec.g="vppii";
var Jh=a=>{throw new V(a.l.D.v.name+" instance already deleted");},Kh=!1,Lh=!1,Mh=()=>{},Nh=(a,b,c)=>{if(b===c)return a;if(void 0===c.L)return null;a=Nh(a,b,c.L);return null===a?null:c.ub(a)},Oh={},Ph=[],Qh=()=>{for(;Ph.length;){var a=Ph.pop();a.l.aa=!1;a["delete"]()}},Rh,Sh={},Th=(a,b)=>{if(void 0===b)throw new V("ptr should not be undefined");for(;a.L;)b=a.qa(b),a=a.L;return Sh[b]},Vh=(a,b)=>{if(!b.D||!b.s)throw new Ah("makeClassHandle requires ptr and ptrType");if(!!b.N!==!!b.I)throw new Ah("Both smartPtrType and smartPtr must be specified");
b.count={value:1};return Uh(Object.create(a,{l:{value:b,writable:!0}}))},Uh=a=>{if(Kh)return Uh=b=>b.deleteLater(),Uh(a);if("undefined"===typeof FinalizationRegistry)return Uh=b=>b,a;Lh=new FinalizationRegistry(b=>{b=b.l;--b.count.value;0===b.count.value&&(b.I?b.N.U(b.I):b.D.v.U(b.s))});Uh=b=>{var c=b.l;c.I&&Lh.register(b,{l:c},b);return b};Mh=b=>{Lh.unregister(b)};return Uh(a)};function Wh(){}
var Xh=(a,b)=>Object.defineProperty(b,"name",{value:a}),Yh=(a,b,c)=>{if(void 0===a[b].F){var d=a[b];a[b]=function(...e){if(!a[b].F.hasOwnProperty(e.length))throw new V(`Function '${c}' called with an invalid number of arguments (${e.length}) - expects one of (${a[b].F})!`);return a[b].F[e.length].apply(this,e)};a[b].F=[];a[b].F[d.ga]=d}},Zh=(a,b,c)=>{if(l.hasOwnProperty(a)){if(void 0===c||void 0!==l[a].F&&void 0!==l[a].F[c])throw new V(`Cannot register public name '${a}' twice`);Yh(l,a,a);if(l.hasOwnProperty(c))throw new V(`Cannot register multiple overloads of a function with the same number of arguments (${c})!`);
l[a].F[c]=b}else l[a]=b,void 0!==c&&(l[a].Cc=c)},$h=a=>{if(void 0===a)return"_unknown";a=a.replace(/[^a-zA-Z0-9_]/g,"$");var b=a.charCodeAt(0);return 48<=b&&57>=b?`_${a}`:a};function ai(a,b,c,d,e,f,g,h){this.name=a;this.constructor=b;this.Y=c;this.U=d;this.L=e;this.yb=f;this.qa=g;this.ub=h;this.Vb=[]}var bi=(a,b,c)=>{for(;b!==c;){if(!b.qa)throw new V(`Expected null or instance of ${c.name}, got an instance of ${b.name}`);a=b.qa(a);b=b.L}return a};
function ci(a,b){if(null===b){if(this.Ga)throw new V(`null is not a valid ${this.name}`);return 0}if(!b.l)throw new V(`Cannot pass "${Hh(b)}" as a ${this.name}`);if(!b.l.s)throw new V(`Cannot pass deleted object as a pointer of type ${this.name}`);return bi(b.l.s,b.l.D.v,this.v)}
function di(a,b){if(null===b){if(this.Ga)throw new V(`null is not a valid ${this.name}`);if(this.va){var c=this.Ja();null!==a&&a.push(this.U,c);return c}return 0}if(!b||!b.l)throw new V(`Cannot pass "${Hh(b)}" as a ${this.name}`);if(!b.l.s)throw new V(`Cannot pass deleted object as a pointer of type ${this.name}`);if(!this.ta&&b.l.D.ta)throw new V(`Cannot convert argument of type ${b.l.N?b.l.N.name:b.l.D.name} to parameter type ${this.name}`);c=bi(b.l.s,b.l.D.v,this.v);if(this.va){if(void 0===b.l.I)throw new V("Passing raw pointer to smart pointer is illegal");
switch(this.$b){case 0:if(b.l.N===this)c=b.l.I;else throw new V(`Cannot convert argument of type ${b.l.N?b.l.N.name:b.l.D.name} to parameter type ${this.name}`);break;case 1:c=b.l.I;break;case 2:if(b.l.N===this)c=b.l.I;else{var d=b.clone();c=this.Wb(c,ei(()=>d["delete"]()));null!==a&&a.push(this.U,c)}break;default:throw new V("Unsupporting sharing policy");}}return c}
function fi(a,b){if(null===b){if(this.Ga)throw new V(`null is not a valid ${this.name}`);return 0}if(!b.l)throw new V(`Cannot pass "${Hh(b)}" as a ${this.name}`);if(!b.l.s)throw new V(`Cannot pass deleted object as a pointer of type ${this.name}`);if(b.l.D.ta)throw new V(`Cannot convert argument of type ${b.l.D.name} to parameter type ${this.name}`);return bi(b.l.s,b.l.D.v,this.v)}
function gi(a,b,c,d,e,f,g,h,k,m,n){this.name=a;this.v=b;this.Ga=c;this.ta=d;this.va=e;this.Tb=f;this.$b=g;this.eb=h;this.Ja=k;this.Wb=m;this.U=n;e||void 0!==b.L?this.toWireType=di:(this.toWireType=d?ci:fi,this.J=null)}
var hi=(a,b,c)=>{if(!l.hasOwnProperty(a))throw new Ah("Replacing nonexistent public symbol");void 0!==l[a].F&&void 0!==c?l[a].F[c]=b:(l[a]=b,l[a].ga=c)},X=(a,b)=>{a=U(a);var c=K(b);if("function"!=typeof c)throw new V(`unknown function pointer with signature ${a}: ${b}`);return c},ii,ki=a=>{a=ji(a);var b=U(a);W(a);return b},li=(a,b)=>{function c(f){e[f]||yh[f]||(zh[f]?zh[f].forEach(c):(d.push(f),e[f]=!0))}var d=[],e={};b.forEach(c);throw new ii(`${a}: `+d.map(ki).join([", "]));},fc=(a,b,c,d,e,f,g,
h,k,m,n,p,q)=>{n=U(n);f=X(e,f);h&&=X(g,h);m&&=X(k,m);q=X(p,q);var t=$h(n);Zh(t,function(){li(`Cannot construct ${n} due to unbound types`,[d])});Ch([a,b,c],d?[d]:[],u=>{u=u[0];if(d){var v=u.v;var G=v.Y}else G=Wh.prototype;u=Xh(n,function(...ia){if(Object.getPrototypeOf(this)!==N)throw new V("Use 'new' to construct "+n);if(void 0===H.$)throw new V(n+" has no accessible constructor");var L=H.$[ia.length];if(void 0===L)throw new V(`Tried to invoke ctor of ${n} with invalid number of parameters (${ia.length}) - expected (${Object.keys(H.$).toString()}) parameters instead!`);
return L.apply(this,ia)});var N=Object.create(G,{constructor:{value:u}});u.prototype=N;var H=new ai(n,u,N,q,v,f,h,m);if(H.L){var Q;(Q=H.L).ra??(Q.ra=[]);H.L.ra.push(H)}v=new gi(n,H,!0,!1,!1);Q=new gi(n+"*",H,!1,!1,!1);G=new gi(n+" const*",H,!1,!0,!1);Oh[a]={pointerType:Q,rb:G};hi(t,u);return[v,Q,G]})};fc.g="vppppppppppppp";function mi(a){for(var b=1;b<a.length;++b)if(null!==a[b]&&void 0===a[b].J)return!0;return!1}
function ni(a){var b=Function;if(!(b instanceof Function))throw new TypeError(`new_ called with constructor type ${typeof b} which is not a function`);var c=Xh(b.name||"unknownFunctionName",function(){});c.prototype=b.prototype;c=new c;a=b.apply(c,a);return a instanceof Object?a:c}
function oi(a,b,c,d,e,f){var g=b.length;if(2>g)throw new V("argTypes array size mismatch! Must at least get return value and 'this' types!");var h=null!==b[1]&&null!==c,k=mi(b);c="void"!==b[0].name;d=[a,Fh,d,e,vh,b[0],b[1]];for(e=0;e<g-2;++e)d.push(b[e+2]);if(!k)for(e=h?1:2;e<b.length;++e)null!==b[e].J&&d.push(b[e].J);k=mi(b);e=b.length;var m="",n="";for(g=0;g<e-2;++g)m+=(0!==g?", ":"")+"arg"+g,n+=(0!==g?", ":"")+"arg"+g+"Wired";m=`\n        return function (${m}) {\n        if (arguments.length !== ${e-
2}) {\n          throwBindingError('function ' + humanName + ' called with ' + arguments.length + ' arguments, expected ${e-2}');\n        }`;k&&(m+="var destructors = [];\n");var p=k?"destructors":"null",q="humanName throwBindingError invoker fn runDestructors retType classParam".split(" ");h&&(m+="var thisWired = classParam['toWireType']("+p+", this);\n");for(g=0;g<e-2;++g)m+="var arg"+g+"Wired = argType"+g+"['toWireType']("+p+", arg"+g+");\n",q.push("argType"+g);h&&(n="thisWired"+(0<n.length?", ":
"")+n);m+=(c||f?"var rv = ":"")+"invoker(fn"+(0<n.length?", ":"")+n+");\n";if(k)m+="runDestructors(destructors);\n";else for(g=h?1:2;g<b.length;++g)f=1===g?"thisWired":"arg"+(g-2)+"Wired",null!==b[g].J&&(m+=`${f}_dtor(${f});\n`,q.push(`${f}_dtor`));c&&(m+="var ret = retType['fromWireType'](rv);\nreturn ret;\n");let [t,u]=[q,m+"}\n"];t.push(u);b=ni(t)(...d);return Xh(a,b)}
var pi=(a,b)=>{for(var c=[],d=0;d<a;d++)c.push(C[b+4*d>>2]);return c},qi=a=>{a=a.trim();const b=a.indexOf("(");return-1!==b?a.substr(0,b):a},gc=(a,b,c,d,e,f,g,h)=>{var k=pi(c,d);b=U(b);b=qi(b);f=X(e,f);Ch([],[a],m=>{function n(){li(`Cannot call ${p} due to unbound types`,k)}m=m[0];var p=`${m.name}.${b}`;b.startsWith("@@")&&(b=Symbol[b.substring(2)]);var q=m.v.constructor;void 0===q[b]?(n.ga=c-1,q[b]=n):(Yh(q,b,p),q[b].F[c-1]=n);Ch([],k,t=>{t=oi(p,[t[0],null].concat(t.slice(1)),null,f,g,h);void 0===
q[b].F?(t.ga=c-1,q[b]=t):q[b].F[c-1]=t;if(m.v.ra)for(const u of m.v.ra)u.constructor.hasOwnProperty(b)||(u.constructor[b]=t);return[]});return[]})};gc.g="vppippppi";
var hc=(a,b,c,d,e,f)=>{var g=pi(b,c);e=X(d,e);Ch([],[a],h=>{h=h[0];var k=`constructor ${h.name}`;void 0===h.v.$&&(h.v.$=[]);if(void 0!==h.v.$[b-1])throw new V(`Cannot register multiple constructors with identical number of parameters (${b-1}) for class '${h.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);h.v.$[b-1]=()=>{li(`Cannot construct ${h.name} due to unbound types`,g)};Ch([],g,m=>{m.splice(1,0,null);h.v.$[b-1]=oi(k,m,null,e,f);return[]});
return[]})};hc.g="vpipppp";var ic=(a,b,c,d,e,f,g,h,k)=>{var m=pi(c,d);b=U(b);b=qi(b);f=X(e,f);Ch([],[a],n=>{function p(){li(`Cannot call ${q} due to unbound types`,m)}n=n[0];var q=`${n.name}.${b}`;b.startsWith("@@")&&(b=Symbol[b.substring(2)]);h&&n.v.Vb.push(b);var t=n.v.Y,u=t[b];void 0===u||void 0===u.F&&u.className!==n.name&&u.ga===c-2?(p.ga=c-2,p.className=n.name,t[b]=p):(Yh(t,b,q),t[b].F[c-2]=p);Ch([],m,v=>{v=oi(q,v,n,f,g,k);void 0===t[b].F?(v.ga=c-2,t[b]=v):t[b].F[c-2]=v;return[]});return[]})};
ic.g="vppippppii";
var ri=(a,b,c)=>{if(!(a instanceof Object))throw new V(`${c} with invalid "this": ${a}`);if(!(a instanceof b.v.constructor))throw new V(`${c} incompatible with "this" of type ${a.constructor.name}`);if(!a.l.s)throw new V(`cannot call emscripten binding method ${c} on deleted object`);return bi(a.l.s,a.l.D.v,b.v)},jc=(a,b,c,d,e,f,g,h,k,m)=>{b=U(b);e=X(d,e);Ch([],[a],n=>{n=n[0];var p=`${n.name}.${b}`,q={get(){li(`Cannot access ${p} due to unbound types`,[c,g])},enumerable:!0,configurable:!0};q.set=
k?()=>li(`Cannot access ${p} due to unbound types`,[c,g]):()=>{throw new V(p+" is a read-only property");};Object.defineProperty(n.v.Y,b,q);Ch([],k?[c,g]:[c],t=>{var u=t[0],v={get(){var N=ri(this,n,p+" getter");return u.fromWireType(e(f,N))},enumerable:!0};if(k){k=X(h,k);var G=t[1];v.set=function(N){var H=ri(this,n,p+" setter"),Q=[];k(m,H,G.toWireType(Q,N));vh(Q)}}Object.defineProperty(n.v.Y,b,v);return[]});return[]})};jc.g="vpppppppppp";var si=[],ti=[],Lc=a=>{9<a&&0===--ti[a+1]&&(ti[a]=void 0,si.push(a))};
Lc.g="vp";var Y=a=>{if(!a)throw new V("Cannot use deleted val. handle = "+a);return ti[a]},ei=a=>{switch(a){case void 0:return 2;case null:return 4;case !0:return 6;case !1:return 8;default:const b=si.pop()||ti.length;ti[b]=a;ti[b+1]=1;return b}},ui={name:"emscripten::val",fromWireType:a=>{var b=Y(a);Lc(a);return b},toWireType:(a,b)=>ei(b),argPackAdvance:Dh,readValueFromPointer:wh,J:null},kc=a=>Bh(a,ui);kc.g="vp";
var vi=(a,b,c)=>{switch(b){case 1:return c?function(d){return this.fromWireType(x[d])}:function(d){return this.fromWireType(y[d])};case 2:return c?function(d){return this.fromWireType(z[d>>1])}:function(d){return this.fromWireType(A[d>>1])};case 4:return c?function(d){return this.fromWireType(B[d>>2])}:function(d){return this.fromWireType(C[d>>2])};default:throw new TypeError(`invalid integer width (${b}): ${a}`);}},lc=(a,b,c,d)=>{function e(){}b=U(b);e.values={};Bh(a,{name:b,constructor:e,fromWireType:function(f){return this.constructor.values[f]},
toWireType:(f,g)=>g.value,argPackAdvance:Dh,readValueFromPointer:vi(b,c,d),J:null});Zh(b,e)};lc.g="vpppi";var wi=(a,b)=>{var c=yh[a];if(void 0===c)throw a=`${b} has unknown type ${ki(a)}`,new V(a);return c},mc=(a,b,c)=>{var d=wi(a,"enum");b=U(b);a=d.constructor;d=Object.create(d.constructor.prototype,{value:{value:c},constructor:{value:Xh(`${d.name}_${b}`,function(){})}});a.values[c]=d;a[b]=d};mc.g="vppi";
var xi=(a,b)=>{switch(b){case 4:return function(c){return this.fromWireType(Oa[c>>2])};case 8:return function(c){return this.fromWireType(Qa[c>>3])};default:throw new TypeError(`invalid float width (${b}): ${a}`);}},nc=(a,b,c)=>{b=U(b);Bh(a,{name:b,fromWireType:d=>d,toWireType:(d,e)=>e,argPackAdvance:Dh,readValueFromPointer:xi(b,c),J:null})};nc.g="vppp";
var oc=(a,b,c,d,e,f,g)=>{var h=pi(b,c);a=U(a);a=qi(a);e=X(d,e);Zh(a,function(){li(`Cannot call ${a} due to unbound types`,h)},b-1);Ch([],h,k=>{hi(a,oi(a,[k[0],null].concat(k.slice(1)),null,e,f,g),b-1);return[]})};oc.g="vpippppi";var pc=(a,b,c,d,e)=>{b=U(b);-1===e&&(e=4294967295);e=h=>h;if(0===d){var f=32-8*c;e=h=>h<<f>>>f}var g=b.includes("unsigned")?function(h,k){return k>>>0}:function(h,k){return k};Bh(a,{name:b,fromWireType:e,toWireType:g,argPackAdvance:Dh,readValueFromPointer:Ih(b,c,0!==d),J:null})};
pc.g="vpppii";var qc=(a,b,c)=>{function d(f){return new e(x.buffer,C[f+4>>2],C[f>>2])}var e=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][b];c=U(c);Bh(a,{name:c,fromWireType:d,argPackAdvance:Dh,readValueFromPointer:d},{Fb:!0})};qc.g="vpip";
var rc=(a,b)=>{b=U(b);var c="std::string"===b;Bh(a,{name:b,fromWireType:function(d){var e=C[d>>2],f=d+4;if(c)for(var g=f,h=0;h<=e;++h){var k=f+h;if(h==e||0==y[k]){g=R(g,k-g);if(void 0===m)var m=g;else m+=String.fromCharCode(0),m+=g;g=k+1}}else{m=Array(e);for(h=0;h<e;++h)m[h]=String.fromCharCode(y[f+h]);m=m.join("")}W(d);return m},toWireType:function(d,e){e instanceof ArrayBuffer&&(e=new Uint8Array(e));var f="string"==typeof e;if(!(f||e instanceof Uint8Array||e instanceof Uint8ClampedArray||e instanceof
Int8Array))throw new V("Cannot pass non-string to std::string");var g=c&&f?Kg(e):e.length;var h=Wf(4+g+1),k=h+4;C[h>>2]=g;if(c&&f)Lg(e,y,k,g+1);else if(f)for(f=0;f<g;++f){var m=e.charCodeAt(f);if(255<m)throw W(k),new V("String has UTF-16 code units that do not fit in 8 bits");y[k+f]=m}else y.set(e,k);null!==d&&d.push(W,h);return h},argPackAdvance:Dh,readValueFromPointer:wh,J(d){W(d)}})};rc.g="vpp";
var Ai=new TextDecoder("utf-16le"),Bi=(a,b)=>{var c=a>>1;for(b=c+b/2;!(c>=b)&&A[c];)++c;return Ai.decode(y.slice(a,c<<1))},Ci=(a,b,c)=>{c??=2147483647;if(2>c)return 0;c-=2;var d=b;c=c<2*a.length?c/2:a.length;for(var e=0;e<c;++e)z[b>>1]=a.charCodeAt(e),b+=2;z[b>>1]=0;return b-d},Di=a=>2*a.length,Ei=(a,b)=>{for(var c=0,d="";!(c>=b/4);){var e=B[a+4*c>>2];if(0==e)break;++c;65536<=e?(e-=65536,d+=String.fromCharCode(55296|e>>10,56320|e&1023)):d+=String.fromCharCode(e)}return d},Fi=(a,b,c)=>{c??=2147483647;
if(4>c)return 0;var d=b;c=d+c-4;for(var e=0;e<a.length;++e){var f=a.charCodeAt(e);if(55296<=f&&57343>=f){var g=a.charCodeAt(++e);f=65536+((f&1023)<<10)|g&1023}B[b>>2]=f;b+=4;if(b+4>c)break}B[b>>2]=0;return b-d},Gi=a=>{for(var b=0,c=0;c<a.length;++c){var d=a.charCodeAt(c);55296<=d&&57343>=d&&++c;b+=4}return b},sc=(a,b,c)=>{c=U(c);if(2===b){var d=Bi;var e=Ci;var f=Di;var g=h=>A[h>>1]}else 4===b&&(d=Ei,e=Fi,f=Gi,g=h=>C[h>>2]);Bh(a,{name:c,fromWireType:h=>{for(var k=C[h>>2],m,n=h+4,p=0;p<=k;++p){var q=
h+4+p*b;if(p==k||0==g(q))n=d(n,q-n),void 0===m?m=n:(m+=String.fromCharCode(0),m+=n),n=q+b}W(h);return m},toWireType:(h,k)=>{if("string"!=typeof k)throw new V(`Cannot pass non-string to C++ string type ${c}`);var m=f(k),n=Wf(4+m+b);C[n>>2]=m/b;e(k,n+4,m+b);null!==h&&h.push(W,n);return n},argPackAdvance:Dh,readValueFromPointer:wh,J(h){W(h)}})};sc.g="vppp";var tc=(a,b,c,d,e,f)=>{uh[a]={name:U(b),Ja:X(c,d),U:X(e,f),Va:[]}};tc.g="vpppppp";
var uc=(a,b,c,d,e,f,g,h,k,m)=>{uh[a].Va.push({wb:U(b),Cb:c,ja:X(d,e),Bb:f,Yb:g,Xb:X(h,k),Zb:m})};uc.g="vpppppppppp";var vc=(a,b)=>{b=U(b);Bh(a,{Mb:!0,name:b,argPackAdvance:0,fromWireType:()=>{},toWireType:()=>{}})};vc.g="vpp";var wc=(a,b,c,d)=>{function e(h){var k=R(a+36);sh(`'Could not load dynamic lib: ${k}\n${h}`);--M;qf(()=>K(c)(a,d))}function f(){--M;qf(()=>K(b)(a,d))}M+=1;var g=th(a,{G:!0});g?g.then(f,e):e()};wc.g="vpppp";
var xc=()=>{for(const a of Object.keys(Qe)){const b=Number(a);Re.has(b)||Hi(b)}};xc.g="v";function Ii(a){var b=Ji;b.X[a]=void 0;b.M.push(a)}class Ki{constructor(){this.X=[void 0];this.M=[]}get(a){return this.X[a]}has(a){return void 0!==this.X[a]}Z(a){var b=this.M.pop()||this.X.length;this.X[b]=a;return b}}
var Ji=new Ki,Li=()=>{var a={};a.promise=new Promise((b,c)=>{a.reject=c;a.resolve=b});a.id=Ji.Z(a);return a},yc=(a,b,c)=>{const d=[];0===Object.keys(Se).length||hb();var e=Li();d.push(e.promise);Mi(e.id);for(const f of Object.keys(Qe)){const g=Number(f);g===a||Re.has(g)||(e=Li(),Ni(g,e.id),Se[g]=e,d.push(e.promise))}Promise.all(d).then(()=>{Se={};K(b)(c)})};yc.g="vppp";
function zc(){var a=Wf(4*(xa.length+1)),b=a;xa.forEach(c=>{var d=C,e=b>>2,f=Kg(c)+1,g=Wf(f);g&&Lg(c,y,g,f);d[e]=g;b+=4});C[b>>2]=0;return a}zc.g="p";var Ac=()=>1;Ac.g="i";var Bc=a=>{Ba(a,!ea,1,!da,262144,!1);Ea()};Bc.g="vp";var Ca=a=>{"function"===typeof Atomics.hc&&(Atomics.hc(B,a>>2,a).value.then(Ia),Atomics.store(B,a+128>>2,1))};Ca.g="vp";var Ia=()=>{var a=va();a&&(Ca(a),qf(Oi))},Cc=(a,b)=>{a==b?setTimeout(Ia):r?postMessage({targetThread:a,cmd:"checkMailbox"}):(a=Qe[a])&&a.postMessage({cmd:"checkMailbox"})};
Cc.g="vppp";var Pi=[],Dc=(a,b,c,d,e)=>{d/=2;Pi.length=d;c=e>>3;for(e=0;e<d;e++)Pi[e]=D[c+2*e]?D[c+2*e+1]:Qa[c+2*e+1];return(b?Ae[b]:Qi[a])(...Pi)};Dc.g="dippip";function Ec(){if(r)return O(17,1);ff=!1;M=0}Ec.g="v";var Fc=a=>{r?postMessage({cmd:"cleanupThread",thread:a}):We(a)};Fc.g="vp";var Gc=a=>{r?postMessage({cmd:"markAsFinished",thread:a}):(Re.add(a),a in Se&&Se[a].resolve())};Gc.g="vp";var Hc=()=>{};Hc.g="vp";var Ic=()=>{throw new jb;};Ic.g="v";
var Ri=(a,b,c)=>{var d=[];a=a.toWireType(d,c);d.length&&(C[b>>2]=ei(d));return a},Jc=(a,b,c)=>{a=Y(a);b=wi(b,"emval::as");return Ri(b,c,a)};Jc.g="dppp";var Si=[],Kc=(a,b,c,d)=>{a=Si[a];b=Y(b);return a(null,b,c,d)};Kc.g="dpppp";var Ti={},Ui=a=>{var b=Ti[a];return void 0===b?U(a):b},Vi=()=>"object"==typeof globalThis?globalThis:Function("return this")(),Mc=a=>{if(0===a)return ei(Vi());a=Ui(a);return ei(Vi()[a])};Mc.g="pp";
var Wi=a=>{var b=Si.length;Si.push(a);return b},Xi=(a,b)=>{for(var c=Array(a),d=0;d<a;++d)c[d]=wi(C[b+4*d>>2],"parameter "+d);return c},Nc=(a,b,c)=>{b=Xi(a,b);var d=b.shift();a--;var e="return function (obj, func, destructorsRef, args) {\n",f=0,g=[];0===c&&g.push("obj");for(var h=["retType"],k=[d],m=0;m<a;++m)g.push("arg"+m),h.push("argType"+m),k.push(b[m]),e+=`  var arg${m} = argType${m}.readValueFromPointer(args${f?"+"+f:""});\n`,f+=b[m].argPackAdvance;e+=`  var rv = ${1===c?"new func":"func.call"}(${g.join(", ")});\n`;
d.Mb||(h.push("emval_returnValue"),k.push(Ri),e+="  return emval_returnValue(retType, destructorsRef, rv);\n");h.push(e+"};\n");a=ni(h)(...k);c=`methodCaller<(${b.map(n=>n.name).join(", ")}) => ${d.name}>`;return Wi(Xh(c,a))};Nc.g="pipi";var Oc=a=>{a=Ui(a);return ei(l[a])};Oc.g="pp";var Pc=(a,b)=>{a=Y(a);b=Y(b);return ei(a[b])};Pc.g="ppp";var Qc=a=>{9<a&&(ti[a+1]+=1)};Qc.g="vp";var Rc=(a,b)=>{a=Y(a);b=Y(b);return a instanceof b};Rc.g="ipp";var Sc=a=>{a=Y(a);return"number"==typeof a};Sc.g="ip";
var Tc=a=>{a=Y(a);return"string"==typeof a};Tc.g="ip";var Uc=a=>ei(Ui(a));Uc.g="pp";var Vc=a=>{var b=Y(a);vh(b);Lc(a)};Vc.g="vp";var Wc=(a,b,c)=>{a=Y(a);b=Y(b);c=Y(c);a[b]=c};Wc.g="vppp";var Xc=(a,b)=>{a=wi(a,"_emval_take_value");a=a.readValueFromPointer(b);return ei(a)};Xc.g="ppp";var Yc=a=>{a=Y(a);return ei(typeof a)};Yc.g="pp";
function Zc(a,b){a=Oe(a);a=new Date(1E3*a);B[b>>2]=a.getUTCSeconds();B[b+4>>2]=a.getUTCMinutes();B[b+8>>2]=a.getUTCHours();B[b+12>>2]=a.getUTCDate();B[b+16>>2]=a.getUTCMonth();B[b+20>>2]=a.getUTCFullYear()-1900;B[b+24>>2]=a.getUTCDay();B[b+28>>2]=(a.getTime()-Date.UTC(a.getUTCFullYear(),0,1,0,0,0,0))/864E5|0}Zc.g="vjp";var Yi=[0,31,60,91,121,152,182,213,244,274,305,335],Zi=[0,31,59,90,120,151,181,212,243,273,304,334];
function $c(a,b){a=Oe(a);a=new Date(1E3*a);B[b>>2]=a.getSeconds();B[b+4>>2]=a.getMinutes();B[b+8>>2]=a.getHours();B[b+12>>2]=a.getDate();B[b+16>>2]=a.getMonth();B[b+20>>2]=a.getFullYear()-1900;B[b+24>>2]=a.getDay();var c=a.getFullYear();B[b+28>>2]=(0!==c%4||0===c%100&&0!==c%400?Zi:Yi)[a.getMonth()]+a.getDate()-1|0;B[b+36>>2]=-(60*a.getTimezoneOffset());c=(new Date(a.getFullYear(),6,1)).getTimezoneOffset();var d=(new Date(a.getFullYear(),0,1)).getTimezoneOffset();B[b+32>>2]=(c!=d&&a.getTimezoneOffset()==
Math.min(d,c))|0}$c.g="vjp";function ad(a,b,c,d,e,f,g){if(r)return O(18,1,a,b,c,d,e,f,g);e=Oe(e);try{if(isNaN(e))return 61;var h=T(d),k=FS.da(h,a,e,b,c),m=k.s;B[f>>2]=k.X;C[g>>2]=m;return 0}catch(n){if("undefined"==typeof FS||"ErrnoError"!==n.name)throw n;return-n.B}}ad.g="ipiiijpp";
function bd(a,b,c,d,e,f){if(r)return O(19,1,a,b,c,d,e,f);f=Oe(f);try{var g=T(e);if(c&2){c=f;if(!FS.isFile(g.node.mode))throw new FS.h(43);d&2||FS.ha(g,y.slice(a,a+b),c,b,d)}}catch(h){if("undefined"==typeof FS||"ErrnoError"!==h.name)throw h;return-h.B}}bd.g="ippiiij";
var cd=(a,b,c,d)=>{var e=(new Date).getFullYear(),f=(new Date(e,0,1)).getTimezoneOffset();e=(new Date(e,6,1)).getTimezoneOffset();C[a>>2]=60*Math.max(f,e);B[b>>2]=Number(f!=e);b=g=>{var h=Math.abs(g);return`UTC${0<=g?"-":"+"}${String(Math.floor(h/60)).padStart(2,"0")}${String(h%60).padStart(2,"0")}`};a=b(f);b=b(e);e<f?(Lg(a,y,c,17),Lg(b,y,d,17)):(Lg(a,y,d,17),Lg(b,y,c,17))};cd.g="vpppp";var dd=()=>{};dd.g="v";var ed=a=>{console.error(R(a))};ed.g="vp";var fd=()=>Date.now();fd.g="d";var gd=a=>w(R(a));
gd.g="vp";var hd=()=>{M+=1;throw"unwind";};hd.g="v";var jd=()=>y.length;jd.g="p";var ld=()=>navigator.hardwareConcurrency;ld.g="i";var md=a=>{Ii(a)};md.g="vp";var nd=(a,b,c)=>{a=Ji.get(a);switch(b){case 0:a.resolve(c);break;case 1:a.resolve(Ji.get(c).promise);break;case 2:a.resolve(Ji.get(c).promise);Ii(c);break;case 3:a.reject(c)}};nd.g="vpip";var od=()=>!1;od.g="ip";
var aj=()=>{if(!$i){var a={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:("object"==typeof navigator&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8",_:la||"./this.program"},b;for(b in ph)void 0===ph[b]?delete a[b]:a[b]=ph[b];var c=[];for(b in a)c.push(`${b}=${a[b]}`);$i=c}return $i},$i;
function pd(a,b){if(r)return O(20,1,a,b);var c=0;aj().forEach((d,e)=>{var f=b+c;e=C[a+4*e>>2]=f;for(f=0;f<d.length;++f)x[e++]=d.charCodeAt(f);x[e]=0;c+=d.length+1});return 0}pd.g="ipp";function qd(a,b){if(r)return O(21,1,a,b);var c=aj();C[a>>2]=c.length;var d=0;c.forEach(e=>d+=e.length+1);C[b>>2]=d;return 0}qd.g="ipp";function sd(a){if(r)return O(22,1,a);try{var b=T(a);FS.close(b);return 0}catch(c){if("undefined"==typeof FS||"ErrnoError"!==c.name)throw c;return c.B}}sd.g="ii";
function td(a,b){if(r)return O(23,1,a,b);try{var c=T(a),d=c.A?2:FS.isDir(c.mode)?3:FS.isLink(c.mode)?7:4;x[b]=d;z[b+2>>1]=0;D[b+8>>3]=BigInt(0);D[b+16>>3]=BigInt(0);return 0}catch(e){if("undefined"==typeof FS||"ErrnoError"!==e.name)throw e;return e.B}}td.g="iip";
function ud(a,b,c,d){if(r)return O(24,1,a,b,c,d);try{a:{var e=T(a);a=b;for(var f,g=b=0;g<c;g++){var h=C[a>>2],k=C[a+4>>2];a+=8;var m=FS.read(e,x,h,k,f);if(0>m){var n=-1;break a}b+=m;if(m<k)break;"undefined"!=typeof f&&(f+=m)}n=b}C[d>>2]=n;return 0}catch(p){if("undefined"==typeof FS||"ErrnoError"!==p.name)throw p;return p.B}}ud.g="iippp";
function vd(a,b,c,d){if(r)return O(25,1,a,b,c,d);b=Oe(b);try{if(isNaN(b))return 61;var e=T(a);FS.llseek(e,b,c);D[d>>3]=BigInt(e.position);e.Ca&&0===b&&0===c&&(e.Ca=null);return 0}catch(f){if("undefined"==typeof FS||"ErrnoError"!==f.name)throw f;return f.B}}vd.g="iijip";
function wd(a,b,c,d){if(r)return O(26,1,a,b,c,d);try{a:{var e=T(a);a=b;for(var f,g=b=0;g<c;g++){var h=C[a>>2],k=C[a+4>>2];a+=8;var m=FS.write(e,x,h,k,f);if(0>m){var n=-1;break a}b+=m;"undefined"!=typeof f&&(f+=m)}n=b}C[d>>2]=n;return 0}catch(p){if("undefined"==typeof FS||"ErrnoError"!==p.name)throw p;return p.B}}wd.g="iippp";var yd=(a,b)=>{Gg(y.subarray(a,a+b));return 0};yd.g="ipp";function zd(...a){return F.heif_error_success(...a)}zd.ia=!0;function Ad(...a){return F.heif_image_release(...a)}
Ad.ia=!0;function Bd(...a){return F.heif_nclx_color_profile_free(...a)}Bd.ia=!0;var xe=a=>a;xe.g="vp";var bj=FS.createPath,cj=FS.createLazyFile,dj=FS.createDevice;l.incrementExceptionRefcount=a=>tg(a);l.decrementExceptionRefcount=a=>wg(a);var lb=a=>{var b=I(),c=Ce(4),d=Ce(4);ej(a,c,d);a=C[c>>2];d=C[d>>2];c=R(a);W(a);if(d){var e=R(d);W(d)}J(b);return[c,e]};l.getExceptionMessage=a=>lb(a);
l.requestFullscreen=function(a,b){function c(){vf=!1;var f=d.parentNode;(document.fullscreenElement||document.mozFullScreenElement||document.msFullscreenElement||document.webkitFullscreenElement||document.webkitCurrentFullScreenElement)===f?(d.exitFullscreen=Ef,Cf&&d.requestPointerLock(),vf=!0,Df?("undefined"!=typeof SDL&&(B[SDL.screen>>2]=C[SDL.screen>>2]|8388608),If(l.canvas),Hf()):If(d)):(f.parentNode.insertBefore(d,f),f.parentNode.removeChild(f),Df?("undefined"!=typeof SDL&&(B[SDL.screen>>2]=
C[SDL.screen>>2]&-8388609),If(l.canvas),Hf()):If(d));l.onFullScreen?.(vf);l.onFullscreen?.(vf)}Cf=a;Df=b;"undefined"==typeof Cf&&(Cf=!0);"undefined"==typeof Df&&(Df=!1);var d=l.canvas;Bf||(Bf=!0,document.addEventListener("fullscreenchange",c,!1),document.addEventListener("mozfullscreenchange",c,!1),document.addEventListener("webkitfullscreenchange",c,!1),document.addEventListener("MSFullscreenChange",c,!1));var e=document.createElement("div");d.parentNode.insertBefore(e,d);e.appendChild(d);e.requestFullscreen=
e.requestFullscreen||e.mozRequestFullScreen||e.msRequestFullscreen||(e.webkitRequestFullscreen?()=>e.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT):null)||(e.webkitRequestFullScreen?()=>e.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT):null);e.requestFullscreen()};l.requestAnimationFrame=Ke;l.setCanvasSize=function(a,b,c){If(l.canvas,a,b);c||Hf()};l.pauseMainLoop=function(){He=null;lf++};l.resumeMainLoop=function(){lf++;var a=De,b=Ee,c=Fe;Fe=null;rf(c);Me(a,b);He()};
l.getUserMedia=function(a){let b;(b=window).getUserMedia||(b.getUserMedia=navigator.getUserMedia||navigator.mozGetUserMedia);window.getUserMedia(a)};l.createContext=function(a,b,c,d){if(b&&l.Qa&&a==l.canvas)return l.Qa;var e;if(b){var f={antialias:!1,alpha:!1,yc:1};if(d)for(var g in d)f[g]=d[g];if("undefined"!=typeof GL&&(e=GL.rc(a,f)))var h=GL.getContext(e).jc}else h=a.getContext("2d");if(!h)return null;c&&(l.Qa=h,b&&GL.zc(e),l.Gc=b,xf.forEach(k=>k()),yf());return h};r?ff=!1:bf();
(()=>{var a={promiseChainEnd:Promise.resolve(),canHandle:b=>!l.noWasmDecoding&&b.endsWith(".so"),handle:(b,c,d,e)=>{a.promiseChainEnd=a.promiseChainEnd.then(()=>mg(b,{G:!0,la:!0},c,{})).then(f=>{uf[c]=f;d(b)},f=>{w(`failed to instantiate wasm: ${c}: ${f}`);e()})}};tf.push(a)})();FS.createPreloadedFile=Xg;[44].forEach(a=>{FS.Ba[a]=new FS.h(a);FS.Ba[a].stack="<generic error, no stack>"});FS.S=Array(4096);FS.mount(S,{},"/");FS.mkdir("/tmp");FS.mkdir("/home");FS.mkdir("/home/web_user");
(function(){FS.mkdir("/dev");FS.registerDevice(FS.makedev(1,3),{read:()=>0,write:(d,e,f,g)=>g});FS.mkdev("/dev/null",FS.makedev(1,3));Og(FS.makedev(5,0),Qg);Og(FS.makedev(6,0),Rg);FS.mkdev("/dev/tty",FS.makedev(5,0));FS.mkdev("/dev/tty1",FS.makedev(6,0));var a=new Uint8Array(1024),b=0,c=()=>{0===b&&(b=Gg(a).byteLength);return a[--b]};FS.createDevice("/dev","random",c);FS.createDevice("/dev","urandom",c);FS.mkdir("/dev/shm");FS.mkdir("/dev/shm/tmp")})();
(function(){FS.mkdir("/proc");var a=FS.mkdir("/proc/self");FS.mkdir("/proc/self/fd");FS.mount({mount(){var b=FS.createNode(a,"fd",16895,73);b.m={ca(c,d){var e=T(+d);c={parent:null,mount:{bb:"fake"},m:{readlink:()=>e.path}};return c.parent=c}};return b}},{},"/proc/self/fd")})();FS.xb={MEMFS:S};l.FS_createPath=FS.createPath;l.FS_createDataFile=FS.createDataFile;l.FS_createPreloadedFile=FS.createPreloadedFile;l.FS_unlink=FS.unlink;l.FS_createLazyFile=FS.createLazyFile;l.FS_createDevice=FS.createDevice;
Ah=l.InternalError=class extends Error{constructor(a){super(a);this.name="InternalError"}};for(var fj=Array(256),gj=0;256>gj;++gj)fj[gj]=String.fromCharCode(gj);Eh=fj;V=l.BindingError=class extends Error{constructor(a){super(a);this.name="BindingError"}};
Object.assign(Wh.prototype,{isAliasOf:function(a){if(!(this instanceof Wh&&a instanceof Wh))return!1;var b=this.l.D.v,c=this.l.s;a.l=a.l;var d=a.l.D.v;for(a=a.l.s;b.L;)c=b.qa(c),b=b.L;for(;d.L;)a=d.qa(a),d=d.L;return b===d&&c===a},clone:function(){this.l.s||Jh(this);if(this.l.ma)return this.l.count.value+=1,this;var a=Uh,b=Object,c=b.create,d=Object.getPrototypeOf(this),e=this.l;a=a(c.call(b,d,{l:{value:{count:e.count,aa:e.aa,ma:e.ma,s:e.s,D:e.D,I:e.I,N:e.N}}}));a.l.count.value+=1;a.l.aa=!1;return a},
["delete"](){this.l.s||Jh(this);if(this.l.aa&&!this.l.ma)throw new V("Object already scheduled for deletion");Mh(this);var a=this.l;--a.count.value;0===a.count.value&&(a.I?a.N.U(a.I):a.D.v.U(a.s));this.l.ma||(this.l.I=void 0,this.l.s=void 0)},isDeleted:function(){return!this.l.s},deleteLater:function(){this.l.s||Jh(this);if(this.l.aa&&!this.l.ma)throw new V("Object already scheduled for deletion");Ph.push(this);1===Ph.length&&Rh&&Rh(Qh);this.l.aa=!0;return this}});
l.getInheritedInstanceCount=()=>Object.keys(Sh).length;l.getLiveInheritedInstances=()=>{var a=[],b;for(b in Sh)Sh.hasOwnProperty(b)&&a.push(Sh[b]);return a};l.setAutoDeleteLater=a=>{Kh=a};l.flushPendingDeletes=Qh;l.setDelayFunction=a=>{Rh=a;Ph.length&&Rh&&Rh(Qh)};
Object.assign(gi.prototype,{Ab(a){this.eb&&(a=this.eb(a));return a},Sa(a){this.U?.(a)},argPackAdvance:Dh,readValueFromPointer:wh,fromWireType:function(a){function b(){return this.va?Vh(this.v.Y,{D:this.Tb,s:c,N:this,I:a}):Vh(this.v.Y,{D:this,s:a})}var c=this.Ab(a);if(!c)return this.Sa(a),null;var d=Th(this.v,c);if(void 0!==d){if(0===d.l.count.value)return d.l.s=c,d.l.I=a,d.clone();d=d.clone();this.Sa(a);return d}d=this.v.yb(c);d=Oh[d];if(!d)return b.call(this);d=this.ta?d.rb:d.pointerType;var e=Nh(c,
this.v,d.v);return null===e?b.call(this):this.va?Vh(d.v.Y,{D:d,s:e,N:this,I:a}):Vh(d.v.Y,{D:d,s:e})}});ii=l.UnboundTypeError=((a,b)=>{var c=Xh(b,function(d){this.name=b;this.message=d;d=Error(d).stack;void 0!==d&&(this.stack=this.toString()+"\n"+d.replace(/^Error(:[^\n]*)?\n/,""))});c.prototype=Object.create(a.prototype);c.prototype.constructor=c;c.prototype.toString=function(){return void 0===this.message?this.name:`${this.name}: ${this.message}`};return c})(Error,"UnboundTypeError");
ti.push(0,1,void 0,1,null,1,!0,1,!1,1);l.count_emval_handles=()=>ti.length/2-5-si.length;Sa.unshift(()=>{ph.VIPS_MAX_THREADS=6<navigator.hardwareConcurrency?navigator.hardwareConcurrency:6;ph.VIPS_CONCURRENCY=1});Object.assign(Wh.prototype,{preventAutoDelete:function(){const a=Ph.indexOf(this);-1<a&&Ph.splice(a,1);this.l.aa=!1;return this}});
var Qi=[ye,gf,zg,Jb,Kb,Lb,Mb,Nb,Ob,Pb,Qb,Rb,Sb,Tb,Ub,Vb,Wb,Ec,ad,bd,pd,qd,sd,td,ud,vd,wd],F,Z=function(){function a(c,d){Z=c.exports;Z=cg(Z,1024);var e=Pf(d);ng(Z);Uf("__main__",0,F);pg();kg(Z._emscripten_tls_init,c.exports,e);Ta.unshift(Z.__wasm_call_ctors);Xa.push(Z.__wasm_apply_data_relocs);La=d;gb("wasm-instantiate");return Z}var b=wa();fb("wasm-instantiate");if(l.instantiateWasm)try{return l.instantiateWasm(b,a)}catch(c){w(`Module.instantiateWasm callback failed with error: ${c}`),ba(c)}mb||=
ib("vips.wasm")?"vips.wasm":pa("vips.wasm");qb(b,function(c){a(c.instance,c.module)}).catch(ba);return{}}(),ji=a=>(ji=Z.__getTypeName)(a),Fa=()=>(Fa=Z._embind_initialize_bindings)(),va=()=>(va=Z.pthread_self)(),Wf=a=>(Wf=Z.malloc)(a);l._main=(a,b)=>(l._main=Z.main)(a,b);var W=a=>(W=Z.free)(a),jf=a=>(jf=Z.fflush)(a);l._emscripten_builtin_free=a=>(l._emscripten_builtin_free=Z.emscripten_builtin_free)(a);var Sg=(a,b)=>(Sg=Z.emscripten_builtin_memalign)(a,b);
l._emscripten_builtin_malloc=a=>(l._emscripten_builtin_malloc=Z.emscripten_builtin_malloc)(a);var hf=()=>(hf=Z.__funcs_on_exit)();l.___libc_calloc=(a,b)=>(l.___libc_calloc=Z.__libc_calloc)(a,b);l.___libc_free=a=>(l.___libc_free=Z.__libc_free)(a);l.___libc_malloc=a=>(l.___libc_malloc=Z.__libc_malloc)(a);
var rh=(a,b)=>(rh=Z.__dl_seterr)(a,b),Mi=a=>(Mi=Z._emscripten_dlsync_self_async)(a),Rf=()=>(Rf=Z._emscripten_dlsync_self)(),Ni=(a,b)=>(Ni=Z._emscripten_proxy_dlsync_async)(a,b),Hi=a=>(Hi=Z._emscripten_proxy_dlsync)(a),Ba=(a,b,c,d,e,f)=>(Ba=Z._emscripten_thread_init)(a,b,c,d,e,f),Ja=()=>(Ja=Z._emscripten_thread_crashed)(),ef=(a,b,c,d,e)=>(ef=Z._emscripten_run_on_main_thread_js)(a,b,c,d,e),Ve=a=>(Ve=Z._emscripten_thread_free_data)(a),Ha=a=>(Ha=Z._emscripten_thread_exit)(a),Oi=()=>(Oi=Z._emscripten_check_mailbox)();
l.__ZdaPvm=(a,b)=>(l.__ZdaPvm=Z._ZdaPvm)(a,b);l.__Znaj=a=>(l.__Znaj=Z._Znaj)(a);l.__ZnajSt11align_val_t=(a,b)=>(l.__ZnajSt11align_val_t=Z._ZnajSt11align_val_t)(a,b);l.__Znwj=a=>(l.__Znwj=Z._Znwj)(a);l.__ZnwjSt11align_val_t=(a,b)=>(l.__ZnwjSt11align_val_t=Z._ZnwjSt11align_val_t)(a,b);l.___libc_realloc=(a,b)=>(l.___libc_realloc=Z.__libc_realloc)(a,b);l._malloc_size=a=>(l._malloc_size=Z.malloc_size)(a);l._malloc_usable_size=a=>(l._malloc_usable_size=Z.malloc_usable_size)(a);
l._reallocf=(a,b)=>(l._reallocf=Z.reallocf)(a,b);var P=(a,b)=>(P=Z.setThrew)(a,b),xg=a=>(xg=Z._emscripten_tempret_set)(a),Mf=(a,b)=>(Mf=Z.emscripten_stack_set_limits)(a,b),J=a=>(J=Z._emscripten_stack_restore)(a),Ce=a=>(Ce=Z._emscripten_stack_alloc)(a),I=()=>(I=Z.emscripten_stack_get_current)(),tg=a=>(tg=Z.__cxa_increment_exception_refcount)(a),wg=a=>(wg=Z.__cxa_decrement_exception_refcount)(a),ej=(a,b,c)=>(ej=Z.__get_exception_message)(a,b,c),yg=(a,b,c)=>(yg=Z.__cxa_can_catch)(a,b,c),ug=a=>(ug=Z.__cxa_is_pointer_type)(a);
l.___THREW__=1196;l.__ZTISt12length_error=1418820;l.__ZTVSt12length_error=1418800;l.__ZTVN10__cxxabiv120__si_class_type_infoE=1418492;l.__ZTVN10__cxxabiv117__class_type_infoE=1418452;l.__ZTISt20bad_array_new_length=1418704;l.___threwValue=1200;l._stdout=1411936;l._stderr=1411784;l._g_mem_gc_friendly=3339644;l._g_utf8_skip=1355028;l.__ZTVNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEEE=1422376;l.__ZTTNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE=1422792;
l.__ZTTNSt3__219basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE=1423024;l.__ZTVNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE=1422732;l.__ZTVNSt3__219basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE=1422984;l.__ZNSt3__24coutE=3402584;l.__ZNSt3__24cerrE=3402752;l.__ZNSt3__25ctypeIcE2idE=3399804;l.__ZTVNSt3__212bad_weak_ptrE=1418948;l.__ZTINSt3__212bad_weak_ptrE=1418968;l.__ZTINSt3__219__shared_weak_countE=1419008;l.__ZTISt9bad_alloc=1418692;
l.__ZSt7nothrow=932108;l.__ZTISt12out_of_range=1418852;l.__ZTVSt12out_of_range=1418832;l.__ZTVN10__cxxabiv121__vmi_class_type_infoE=1418544;function Yd(a,b){var c=I();try{K(a)(b)}catch(d){J(c);if(!(d instanceof E))throw d;P(1,0)}}function fe(a,b,c,d){var e=I();try{K(a)(b,c,d)}catch(f){J(e);if(!(f instanceof E))throw f;P(1,0)}}function Jd(a,b,c){var d=I();try{return K(a)(b,c)}catch(e){J(d);if(!(e instanceof E))throw e;P(1,0)}}
function Id(a,b){var c=I();try{return K(a)(b)}catch(d){J(c);if(!(d instanceof E))throw d;P(1,0)}}function Hd(a){var b=I();try{return K(a)()}catch(c){J(b);if(!(c instanceof E))throw c;P(1,0)}}function Xd(a){var b=I();try{K(a)()}catch(c){J(b);if(!(c instanceof E))throw c;P(1,0)}}function me(a,b,c,d,e){var f=I();try{K(a)(b,c,d,e)}catch(g){J(f);if(!(g instanceof E))throw g;P(1,0)}}function Ed(a,b,c,d){var e=I();try{return K(a)(b,c,d)}catch(f){J(e);if(!(f instanceof E))throw f;P(1,0)}}
function Ld(a,b,c,d){var e=I();try{return K(a)(b,c,d)}catch(f){J(e);if(!(f instanceof E))throw f;P(1,0)}}function ae(a,b,c){var d=I();try{K(a)(b,c)}catch(e){J(d);if(!(e instanceof E))throw e;P(1,0)}}function Od(a,b,c,d,e,f){var g=I();try{return K(a)(b,c,d,e,f)}catch(h){J(g);if(!(h instanceof E))throw h;P(1,0)}}function ne(a,b,c,d,e,f){var g=I();try{K(a)(b,c,d,e,f)}catch(h){J(g);if(!(h instanceof E))throw h;P(1,0)}}
function Pd(a,b,c,d,e,f,g){var h=I();try{return K(a)(b,c,d,e,f,g)}catch(k){J(h);if(!(k instanceof E))throw k;P(1,0)}}function Md(a,b,c,d,e){var f=I();try{return K(a)(b,c,d,e)}catch(g){J(f);if(!(g instanceof E))throw g;P(1,0)}}function be(a,b,c,d){var e=I();try{K(a)(b,c,d)}catch(f){J(e);if(!(f instanceof E))throw f;P(1,0)}}function ce(a,b,c,d,e){var f=I();try{K(a)(b,c,d,e)}catch(g){J(f);if(!(g instanceof E))throw g;P(1,0)}}
function Kd(a,b,c,d){var e=I();try{return K(a)(b,c,d)}catch(f){J(e);if(!(f instanceof E))throw f;P(1,0)}}function Zd(a,b,c){var d=I();try{K(a)(b,c)}catch(e){J(d);if(!(e instanceof E))throw e;P(1,0)}}function Fd(a,b,c,d,e){var f=I();try{return K(a)(b,c,d,e)}catch(g){J(f);if(!(g instanceof E))throw g;P(1,0)}}function Cd(a,b){var c=I();try{return K(a)(b)}catch(d){J(c);if(!(d instanceof E))throw d;P(1,0)}}
function se(a,b,c,d,e,f,g,h,k,m,n){var p=I();try{K(a)(b,c,d,e,f,g,h,k,m,n)}catch(q){J(p);if(!(q instanceof E))throw q;P(1,0)}}function oe(a,b,c,d,e,f,g){var h=I();try{K(a)(b,c,d,e,f,g)}catch(k){J(h);if(!(k instanceof E))throw k;P(1,0)}}function pe(a,b,c,d,e,f,g,h){var k=I();try{K(a)(b,c,d,e,f,g,h)}catch(m){J(k);if(!(m instanceof E))throw m;P(1,0)}}function Dd(a,b,c){var d=I();try{return K(a)(b,c)}catch(e){J(d);if(!(e instanceof E))throw e;P(1,0)}}
function ee(a,b,c,d,e){var f=I();try{K(a)(b,c,d,e)}catch(g){J(f);if(!(g instanceof E))throw g;P(1,0)}}function ge(a,b,c,d,e){var f=I();try{K(a)(b,c,d,e)}catch(g){J(f);if(!(g instanceof E))throw g;P(1,0)}}function $d(a,b,c,d,e){var f=I();try{K(a)(b,c,d,e)}catch(g){J(f);if(!(g instanceof E))throw g;P(1,0)}}function je(a,b,c,d,e,f,g,h){var k=I();try{K(a)(b,c,d,e,f,g,h)}catch(m){J(k);if(!(m instanceof E))throw m;P(1,0)}}
function he(a,b,c,d,e,f,g,h,k,m){var n=I();try{K(a)(b,c,d,e,f,g,h,k,m)}catch(p){J(n);if(!(p instanceof E))throw p;P(1,0)}}function ie(a,b,c,d,e,f,g,h,k){var m=I();try{K(a)(b,c,d,e,f,g,h,k)}catch(n){J(m);if(!(n instanceof E))throw n;P(1,0)}}function le(a,b,c,d,e,f){var g=I();try{K(a)(b,c,d,e,f)}catch(h){J(g);if(!(h instanceof E))throw h;P(1,0)}}function ke(a,b,c,d,e,f,g){var h=I();try{K(a)(b,c,d,e,f,g)}catch(k){J(h);if(!(k instanceof E))throw k;P(1,0)}}
function ue(a,b,c,d,e,f,g,h,k,m,n,p,q){var t=I();try{K(a)(b,c,d,e,f,g,h,k,m,n,p,q)}catch(u){J(t);if(!(u instanceof E))throw u;P(1,0)}}function te(a,b,c,d,e,f,g,h,k,m,n,p){var q=I();try{K(a)(b,c,d,e,f,g,h,k,m,n,p)}catch(t){J(q);if(!(t instanceof E))throw t;P(1,0)}}function re(a,b,c,d,e,f,g,h,k,m){var n=I();try{K(a)(b,c,d,e,f,g,h,k,m)}catch(p){J(n);if(!(p instanceof E))throw p;P(1,0)}}
function qe(a,b,c,d,e,f,g,h,k){var m=I();try{K(a)(b,c,d,e,f,g,h,k)}catch(n){J(m);if(!(n instanceof E))throw n;P(1,0)}}function ve(a,b,c,d,e,f,g,h,k,m,n,p,q,t){var u=I();try{K(a)(b,c,d,e,f,g,h,k,m,n,p,q,t)}catch(v){J(u);if(!(v instanceof E))throw v;P(1,0)}}function de(a,b,c,d,e,f){var g=I();try{K(a)(b,c,d,e,f)}catch(h){J(g);if(!(h instanceof E))throw h;P(1,0)}}function Qd(a,b,c,d,e,f,g,h){var k=I();try{return K(a)(b,c,d,e,f,g,h)}catch(m){J(k);if(!(m instanceof E))throw m;P(1,0)}}
function Vd(a,b){var c=I();try{return K(a)(b)}catch(d){J(c);if(!(d instanceof E))throw d;P(1,0);return 0n}}function Td(a,b,c,d,e,f,g,h,k,m,n,p,q){var t=I();try{return K(a)(b,c,d,e,f,g,h,k,m,n,p,q)}catch(u){J(t);if(!(u instanceof E))throw u;P(1,0)}}function Wd(a,b,c,d,e){var f=I();try{return K(a)(b,c,d,e)}catch(g){J(f);if(!(g instanceof E))throw g;P(1,0);return 0n}}function Gd(a,b,c,d){var e=I();try{return K(a)(b,c,d)}catch(f){J(e);if(!(f instanceof E))throw f;P(1,0)}}
function Rd(a,b,c,d,e,f,g,h,k,m,n){var p=I();try{return K(a)(b,c,d,e,f,g,h,k,m,n)}catch(q){J(p);if(!(q instanceof E))throw q;P(1,0)}}function Sd(a,b,c,d,e,f,g,h,k,m,n,p){var q=I();try{return K(a)(b,c,d,e,f,g,h,k,m,n,p)}catch(t){J(q);if(!(t instanceof E))throw t;P(1,0)}}function we(a,b,c,d,e,f,g,h,k,m,n,p,q,t,u,v){var G=I();try{K(a)(b,c,d,e,f,g,h,k,m,n,p,q,t,u,v)}catch(N){J(G);if(!(N instanceof E))throw N;P(1,0)}}
function Ud(a,b,c,d,e,f){var g=I();try{return K(a)(b,c,d,e,f)}catch(h){J(g);if(!(h instanceof E))throw h;P(1,0)}}function Nd(a,b,c,d,e,f){var g=I();try{return K(a)(b,c,d,e,f)}catch(h){J(g);if(!(h instanceof E))throw h;P(1,0)}}l.addRunDependency=fb;l.removeRunDependency=gb;l.bigintToI53Checked=Oe;l.ENV=ph;l.addFunction=bg;l.FS_createPreloadedFile=Xg;l.FS_unlink=a=>FS.unlink(a);l.FS_createPath=bj;l.FS_createDevice=dj;l.FS=FS;l.FS_createDataFile=(a,b,c,d,e,f)=>{FS.createDataFile(a,b,c,d,e,f)};
l.FS_createLazyFile=cj;l.deletionQueue=Ph;var hj;eb=function ij(){hj||jj();hj||(eb=ij)};function kj(a=[]){var b=ig("main").Ma;if(b){a.unshift(la);var c=a.length,d=Ce(4*(c+1)),e=d;a.forEach(g=>{C[e>>2]=qh(g);e+=4});C[e>>2]=0;try{var f=b(c,d);rd(f,!0)}catch(g){$e(g)}}}var ya={};
function jj(){var a=ka;function b(){if(!hj&&(hj=!0,l.calledRun=!0,!Ma&&(ab(),r||bb(Ua),aa(l),l.onRuntimeInitialized?.(),lj&&kj(a),!r))){if(l.postRun)for("function"==typeof l.postRun&&(l.postRun=[l.postRun]);l.postRun.length;){var c=l.postRun.shift();Wa.unshift(c)}bb(Wa)}}if(!(0<cb))if(r)aa(l),ab(),startWorker(l);else{if(l.preRun)for("function"==typeof l.preRun&&(l.preRun=[l.preRun]);l.preRun.length;)Sa.unshift(l.preRun.shift());bb(Sa);0<cb||(l.setStatus?(l.setStatus("Running..."),setTimeout(function(){setTimeout(function(){l.setStatus("")},
1);b()},1)):b())}}if(l.preInit)for("function"==typeof l.preInit&&(l.preInit=[l.preInit]);0<l.preInit.length;)l.preInit.pop()();var lj=!0;l.noInitialRun&&(lj=!1);jj();moduleRtn=ca;


  return moduleRtn;
}
);
})();
if (true)
  module.exports = Vips;
else {}
var isPthread = globalThis.self?.name === 'em-pthread';
// When running as a pthread, construct a new instance on startup
isPthread && Vips();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  cancelOperations: () => (/* binding */ cancelOperations),
  compressImage: () => (/* binding */ compressImage),
  convertImageFormat: () => (/* binding */ convertImageFormat),
  hasTransparency: () => (/* binding */ hasTransparency),
  resizeImage: () => (/* binding */ resizeImage),
  setLocation: () => (/* binding */ setLocation)
});

// EXTERNAL MODULE: ./node_modules/wasm-vips/lib/vips.js
var vips = __webpack_require__(1533);
var vips_default = /*#__PURE__*/__webpack_require__.n(vips);
;// ./node_modules/wasm-vips/lib/vips.wasm
const lib_vips_namespaceObject = "./build/vips/vips.wasm";
;// ./node_modules/wasm-vips/lib/vips-heif.wasm
const vips_heif_namespaceObject = "./build/vips/vips-heif.wasm";
;// ./node_modules/wasm-vips/lib/vips-jxl.wasm
const vips_jxl_namespaceObject = "./build/vips/vips-jxl.wasm";
;// ./packages/vips/build-module/utils.js
/**
 * Determines whether a given file type supports a quality setting,
 *
 * @todo Make this smarter.
 *
 * @param type Mime type.
 * @return Whether the file supports a quality setting.
 */
function supportsQuality(type) {
  return ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(type);
}

/**
 * Determines whether a given file type supports animation,
 *
 * @todo Make this smarter.
 *
 * @param type Mime type.
 * @return Whether the file supports animation.
 */
function supportsAnimation(type) {
  return ['image/webp', 'image/gif'].includes(type);
}

/**
 * Determines whether a given file type supports interlaced/progressive output.
 *
 * @todo Make this smarter.
 *
 * @param type Mime type.
 * @return Whether the file supports interlaced/progressive output.
 */
function supportsInterlace(type) {
  return ['image/jpeg', 'image/gif', 'image/png'].includes(type);
}

;// ./packages/vips/build-module/index.js
/**
 * External dependencies
 */


// @ts-expect-error
// eslint-disable-next-line import/no-unresolved


// @ts-expect-error
// eslint-disable-next-line import/no-unresolved


// @ts-expect-error
// eslint-disable-next-line import/no-unresolved


/**
 * Internal dependencies
 */


let build_module_location = '';

/**
 * Dynamically sets the location / public path to use for loading the WASM files.
 *
 * This is required when loading this module in an inline worker,
 * where globals such as __webpack_public_path__ are not available.
 *
 * @param newLocation Location, typically a base URL such as "https://example.com/path/to/js/...".
 */
function setLocation(newLocation) {
  build_module_location = newLocation;
}
let cleanup;
let vipsInstance;

/**
 * Instantiates and returns a new vips instance.
 *
 * Reuses any existing instance.
 */
async function getVips() {
  if (vipsInstance) {
    return vipsInstance;
  }
  vipsInstance = await vips_default()({
    locateFile: fileName => {
      if (fileName.endsWith('vips.wasm')) {
        fileName = lib_vips_namespaceObject;
      } else if (fileName.endsWith('vips-heif.wasm')) {
        fileName = vips_heif_namespaceObject;
      } else if (fileName.endsWith('vips-jxl.wasm')) {
        fileName = vips_jxl_namespaceObject;
      }
      return build_module_location + fileName;
    },
    preRun: module => {
      // https://github.com/kleisauke/wasm-vips/issues/13#issuecomment-1073246828
      module.setAutoDeleteLater(true);
      module.setDelayFunction(fn => {
        cleanup = fn;
      });
    }
  });
  return vipsInstance;
}

/**
 * Holds a list of ongoing operations for a given ID.
 *
 * This way, operations can be cancelled mid-progress.
 */
const inProgressOperations = new Set();

/**
 * Cancels all ongoing image operations for a given item ID.
 *
 * The onProgress callbacks check for an IDs existence in this list,
 * killing the process if it's absent.
 *
 * @param id Item ID.
 * @return boolean Whether any operation was cancelled.
 */
async function cancelOperations(id) {
  return inProgressOperations.delete(id);
}

/**
 * Converts an image to a different format using vips.
 *
 * @param id         Item ID.
 * @param buffer     Original file buffer.
 * @param inputType  Input mime type.
 * @param outputType Output mime type.
 * @param quality    Desired quality.
 * @param interlaced Whether to use interlaced/progressive mode.
 *                   Only used if the outputType supports it.
 */
async function convertImageFormat(id, buffer, inputType, outputType, quality = 0.82, interlaced = false) {
  const ext = outputType.split('/')[1];
  inProgressOperations.add(id);
  let strOptions = '';
  const loadOptions = {};

  // To ensure all frames are loaded in case the image is animated.
  if (supportsAnimation(inputType)) {
    strOptions = '[n=-1]';
    loadOptions.n = -1;
  }
  const vips = await getVips();
  const image = vips.Image.newFromBuffer(buffer, strOptions, loadOptions);

  // TODO: Report progress, see https://github.com/swissspidy/media-experiments/issues/327.
  image.onProgress = () => {
    if (!inProgressOperations.has(id)) {
      image.kill = true;
    }
  };
  const saveOptions = {};
  if (supportsQuality(outputType)) {
    saveOptions.Q = quality * 100;
  }
  if (interlaced && supportsInterlace(outputType)) {
    saveOptions.interlace = interlaced;
  }

  // See https://github.com/swissspidy/media-experiments/issues/324.
  if ('image/avif' === outputType) {
    saveOptions.effort = 2;
  }
  const outBuffer = image.writeToBuffer(`.${ext}`, saveOptions);
  const result = outBuffer.buffer;
  cleanup?.();
  return result;
}

/**
 * Compresses an existing image using vips.
 *
 * @param id         Item ID.
 * @param buffer     Original file buffer.
 * @param type       Mime type.
 * @param quality    Desired quality.
 * @param interlaced Whether to use interlaced/progressive mode.
 *                   Only used if the outputType supports it.
 * @return Compressed file data.
 */
async function compressImage(id, buffer, type, quality = 0.82, interlaced = false) {
  return convertImageFormat(id, buffer, type, type, quality, interlaced);
}

/**
 * Resizes an image using vips.
 *
 * @param id        Item ID.
 * @param buffer    Original file buffer.
 * @param type      Mime type.
 * @param resize    Resize options.
 * @param smartCrop Whether to use smart cropping (i.e. saliency-aware).
 * @return Processed file data plus the old and new dimensions.
 */
async function resizeImage(id, buffer, type, resize, smartCrop = false) {
  const ext = type.split('/')[1];
  inProgressOperations.add(id);
  const vips = await getVips();
  const thumbnailOptions = {
    size: 'down'
  };
  let strOptions = '';
  const loadOptions = {};

  // To ensure all frames are loaded in case the image is animated.
  // But only if we're not cropping.
  if (supportsAnimation(type) && !resize.crop) {
    strOptions = '[n=-1]';
    thumbnailOptions.option_string = strOptions;
    loadOptions.n = -1;
  }

  // TODO: Report progress, see https://github.com/swissspidy/media-experiments/issues/327.
  const onProgress = () => {
    if (!inProgressOperations.has(id)) {
      image.kill = true;
    }
  };
  let image = vips.Image.newFromBuffer(buffer, strOptions, loadOptions);
  image.onProgress = onProgress;
  const {
    width,
    pageHeight
  } = image;

  // If resize.height is zero.
  resize.height = resize.height || pageHeight / width * resize.width;
  let resizeWidth = resize.width;
  thumbnailOptions.height = resize.height;
  if (!resize.crop) {
    image = vips.Image.thumbnailBuffer(buffer, resizeWidth, thumbnailOptions);
    image.onProgress = onProgress;
  } else if (true === resize.crop) {
    thumbnailOptions.crop = smartCrop ? 'attention' : 'centre';
    image = vips.Image.thumbnailBuffer(buffer, resizeWidth, thumbnailOptions);
    image.onProgress = onProgress;
  } else {
    // First resize, then do the cropping.
    // This allows operating on the second bitmap with the correct dimensions.

    if (width < pageHeight) {
      resizeWidth = resize.width >= resize.height ? resize.width : width / pageHeight * resize.height;
      thumbnailOptions.height = resize.width >= resize.height ? pageHeight / width * resizeWidth : resize.height;
    } else {
      resizeWidth = resize.width >= resize.height ? width / pageHeight * resize.height : resize.width;
      thumbnailOptions.height = resize.width >= resize.height ? resize.height : pageHeight / width * resizeWidth;
    }
    image = vips.Image.thumbnailBuffer(buffer, resizeWidth, thumbnailOptions);
    image.onProgress = onProgress;
    let left = 0;
    if ('center' === resize.crop[0]) {
      left = (image.width - resize.width) / 2;
    } else if ('right' === resize.crop[0]) {
      left = image.width - resize.width;
    }
    let top = 0;
    if ('center' === resize.crop[1]) {
      top = (image.height - resize.height) / 2;
    } else if ('bottom' === resize.crop[1]) {
      top = image.height - resize.height;
    }

    // Address rounding errors where `left` or `top` become negative integers
    // and `resize.width` / `resize.height` are bigger than the actual dimensions.
    // Downside: one side could be 1px smaller than the requested size.
    left = Math.max(0, left);
    top = Math.max(0, top);
    resize.width = Math.min(image.width, resize.width);
    resize.height = Math.min(image.height, resize.height);
    image = image.crop(left, top, resize.width, resize.height);
    image.onProgress = onProgress;
  }

  // TODO: Allow passing quality?
  const saveOptions = {};
  const outBuffer = image.writeToBuffer(`.${ext}`, saveOptions);
  const result = {
    buffer: outBuffer.buffer,
    width: image.width,
    height: image.pageHeight,
    originalWidth: width,
    originalHeight: pageHeight
  };

  // Only call after `image` is no longer being used.
  cleanup?.();
  return result;
}

/**
 * Determines whether an image has an alpha channel.
 *
 * @param buffer Original file object.
 * @return Whether the image has an alpha channel.
 */
async function hasTransparency(buffer) {
  const vips = await getVips();
  const image = vips.Image.newFromBuffer(buffer);
  const hasAlpha = image.hasAlpha();
  cleanup?.();
  return hasAlpha;
}

})();

(window.wp = window.wp || {}).vips = __webpack_exports__;
/******/ })()
;