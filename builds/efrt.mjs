var t=function(t,n){let e=Math.min(t.length,n.length);for(;e>0;){const o=t.slice(0,e);if(o===n.slice(0,e))return o;e-=1}return""},n=function(t){t.sort();for(let n=1;n<t.length;n++)t[n-1]===t[n]&&t.splice(n,1)};const e=function(){this.counts={}},o={init:function(t){void 0===this.counts[t]&&(this.counts[t]=0)},add:function(t,n){void 0===n&&(n=1),this.init(t),this.counts[t]+=n},countOf:function(t){return this.init(t),this.counts[t]},highest:function(t){let n=[];const e=Object.keys(this.counts);for(let t=0;t<e.length;t++){const o=e[t];n.push([o,this.counts[o]])}return n.sort((function(t,n){return n[1]-t[1]})),t&&(n=n.slice(0,t)),n}};Object.keys(o).forEach((function(t){e.prototype[t]=o[t]}));const s="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",i=s.split("").reduce((function(t,n,e){return t[n]=e,t}),{});var r=function(t){if(void 0!==s[t])return s[t];let n=1,e=36,o="";for(;t>=e;t-=e,n++,e*=36);for(;n--;){const n=t%36;o=String.fromCharCode((n<10?48:55)+n)+o,t=(t-n)/36}return o},u=function(t){if(void 0!==i[t])return i[t];let n=0,e=1,o=36,s=1;for(;e<t.length;n+=o,e++,o*=36);for(let e=t.length-1;e>=0;e--,s*=36){let o=t.charCodeAt(e)-48;o>10&&(o-=7),n+=o*s}return n};const c=";",h=":",f=",",l="!",d=36,p=function(t,n){let e="",o="";t.isTerminal(n)&&(e+=l);const s=t.nodeProps(n);for(let i=0;i<s.length;i++){const u=s[i];if("number"==typeof n[u]){e+=o+u,o=f;continue}if(t.syms[n[u]._n]){e+=o+u+t.syms[n[u]._n],o="";continue}let c=r(n._n-n[u]._n-1+t.symCount);n[u]._g&&c.length>=n[u]._g.length&&1===n[n[u]._g]?(c=n[u]._g,e+=o+u+c,o=f):(e+=o+u+c,o="")}return e},g=function(t,n){if(t.visited(n))return;const e=t.nodeProps(n,!0);for(let o=0;o<e.length;o++){const s=e[o],i=n._n-n[s]._n-1;i<d&&t.histRel.add(i),t.histAbs.add(n[s]._n,r(i).length-1),g(t,n[s])}},a=function(t,n){if(void 0!==n._n)return;const e=t.nodeProps(n,!0);for(let o=0;o<e.length;o++)a(t,n[e[o]]);n._n=t.pos++,t.nodes.unshift(n)},y=function(t){t.nodes=[],t.nodeCount=0,t.syms={},t.symCount=0,t.pos=0,t.optimize(),t.histAbs=new e,t.histRel=new e,a(t,t.root),t.nodeCount=t.nodes.length,t.prepDFS(),g(t,t.root),t.symCount=function(t){t.histAbs=t.histAbs.highest(d);const n=[];n[-1]=0;let e=0,o=0;const s=3+r(t.nodeCount).length;for(let i=0;i<d&&void 0!==t.histAbs[i];i++)n[i]=t.histAbs[i][1]-s-t.histRel.countOf(d-i-1)+n[i-1],n[i]>=e&&(e=n[i],o=i+1);return o}(t);for(let n=0;n<t.symCount;n++)t.syms[t.histAbs[n][0]]=r(n);for(let n=0;n<t.nodeCount;n++)t.nodes[n]=p(t,t.nodes[n]);for(let n=t.symCount-1;n>=0;n--)t.nodes.unshift(r(n)+h+r(t.nodeCount-t.histAbs[n][0]-1));return t.nodes.join(c)},m=new RegExp("[0-9A-Z,;!:|¦]"),b={insertWords:function(t){if(void 0!==t){"string"==typeof t&&(t=t.split(/[^a-zA-Z]+/));for(let n=0;n<t.length;n++)t[n]=t[n].toLowerCase();n(t);for(let n=0;n<t.length;n++)null===t[n].match(m)&&this.insert(t[n])}},insert:function(n){this._insert(n,this.root);const e=this.lastWord;this.lastWord=n;if(t(n,e)===e)return;const o=this.uniqueNode(e,n,this.root);o&&this.combineSuffixNode(o)},_insert:function(n,e){let o,s;if(0===n.length)return;const i=Object.keys(e);for(let r=0;r<i.length;r++){const u=i[r];if(o=t(n,u),0!==o.length){if(u===o&&"object"==typeof e[u])return void this._insert(n.slice(o.length),e[u]);if(u===n&&"number"==typeof e[u])return;return s={},s[u.slice(o.length)]=e[u],this.addTerminal(s,n=n.slice(o.length)),delete e[u],e[o]=s,void this.wordCount++}}this.addTerminal(e,n),this.wordCount++},addTerminal:function(t,n){if(n.length<=1)return void(t[n]=1);const e={};t[n[0]]=e,this.addTerminal(e,n.slice(1))},nodeProps:function(t,n){const e=[];for(const o in t)""!==o&&"_"!==o[0]&&(n&&"object"!=typeof t[o]||e.push(o));return e.sort(),e},optimize:function(){this.combineSuffixNode(this.root),this.prepDFS(),this.countDegree(this.root),this.prepDFS(),this.collapseChains(this.root)},combineSuffixNode:function(t){if(t._c)return t;let n=[];this.isTerminal(t)&&n.push("!");const e=this.nodeProps(t);for(let o=0;o<e.length;o++){const s=e[o];"object"==typeof t[s]?(t[s]=this.combineSuffixNode(t[s]),n.push(s),n.push(t[s]._c)):n.push(s)}n=n.join("-");const o=this.suffixes[n];return o||(this.suffixes[n]=t,t._c=this.cNext++,t)},prepDFS:function(){this.vCur++},visited:function(t){return t._v===this.vCur||(t._v=this.vCur,!1)},countDegree:function(t){if(void 0===t._d&&(t._d=0),t._d++,this.visited(t))return;const n=this.nodeProps(t,!0);for(let e=0;e<n.length;e++)this.countDegree(t[n[e]])},collapseChains:function(t){let n,e,o,s;if(!this.visited(t)){for(e=this.nodeProps(t),s=0;s<e.length;s++)n=e[s],o=t[n],"object"==typeof o&&(this.collapseChains(o),void 0===o._g||1!==o._d&&1!==o._g.length||(delete t[n],n+=o._g,t[n]=o[o._g]));1!==e.length||this.isTerminal(t)||(t._g=n)}},isTerminal:function(t){return!!t[""]},uniqueNode:function(t,n,e){const o=this.nodeProps(e,!0);for(let s=0;s<o.length;s++){const i=o[s];if(i===t.slice(0,i.length))return i!==n.slice(0,i.length)?e[i]:this.uniqueNode(t.slice(i.length),n.slice(i.length),e[i])}},pack:function(){return y(this)}},C=function(t){this.root={},this.lastWord="",this.suffixes={},this.suffixCounts={},this.cNext=1,this.wordCount=0,this.insertWords(t),this.vCur=0};Object.keys(b).forEach((function(t){C.prototype[t]=b[t]}));const _=function(t){return"[object Array]"===Object.prototype.toString.call(t)},v=function(t){var n;t=null==(n=t)?{}:"string"==typeof n?n.split(/ +/g).reduce((function(t,n){return t[n]=!0,t}),{}):_(n)?n.reduce((function(t,n){return t[n]=!0,t}),{}):n;const e=Object.keys(t).reduce((function(n,e){const o=t[e];if(_(o)){for(let t=0;t<o.length;t++)n[o[t]]=n[o[t]]||[],n[o[t]].push(e);return n}return!1===n.hasOwnProperty(o)&&Object.defineProperty(n,o,{writable:!0,enumerable:!0,configurable:!0,value:[]}),n[o].push(e),n}),{});return Object.keys(e).forEach((function(t){const n=new C(e[t]);e[t]=n.pack()})),Object.keys(e).map((t=>t+"¦"+e[t])).join("|")},j=function(t,n,e){const o=u(n);return o<t.symCount?t.syms[o]:e+o+1-t.symCount},A=function(t){const n={nodes:t.split(";"),syms:[],symCount:0};return t.match(":")&&function(t){const n=new RegExp("([0-9A-Z]+):([0-9A-Z]+)");for(let e=0;e<t.nodes.length;e++){const o=n.exec(t.nodes[e]);if(!o){t.symCount=e;break}t.syms[u(o[1])]=u(o[2])}t.nodes=t.nodes.slice(t.symCount,t.nodes.length)}(n),function(t){const n=[],e=(o,s)=>{let i=t.nodes[o];"!"===i[0]&&(n.push(s),i=i.slice(1));const r=i.split(/([A-Z0-9,]+)/g);for(let i=0;i<r.length;i+=2){const u=r[i],c=r[i+1];if(!u)continue;const h=s+u;if(","===c||void 0===c){n.push(h);continue}const f=j(t,c,o);e(f,h)}};return e(0,""),n}(n)},O=function(t){if(!t)return{};const n=t.split("|").reduce(((t,n)=>{const e=n.split("¦");return t[e[0]]=e[1],t}),{}),e={};return Object.keys(n).forEach((function(t){const o=A(n[t]);"true"===t&&(t=!0);for(let n=0;n<o.length;n++){const s=o[n];!0===e.hasOwnProperty(s)?!1===Array.isArray(e[s])?e[s]=[e[s],t]:e[s].push(t):e[s]=t}})),e};var x="2.5.0";export{v as pack,O as unpack,x as version};
