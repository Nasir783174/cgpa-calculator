/* Exact decimal/rational engine. Browser + Node, no dependencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WeightedMath=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{
'use strict';
const MAX_ROWS=500;
const abs=n=>n<0n?-n:n;
function gcd(a,b){a=abs(a);b=abs(b);while(b){const t=a%b;a=b;b=t;}return a||1n;}
function rat(n,d=1n){if(d===0n)throw Error('Cannot divide by zero.');if(d<0n){n=-n;d=-d;}const g=gcd(n,d);return {n:n/g,d:d/g};}
const add=(a,b)=>rat(a.n*b.d+b.n*a.d,a.d*b.d),sub=(a,b)=>rat(a.n*b.d-b.n*a.d,a.d*b.d),mul=(a,b)=>rat(a.n*b.n,a.d*b.d),div=(a,b)=>rat(a.n*b.d,a.d*b.n);
const cmp=(a,b)=>a.n*b.d<b.n*a.d?-1:a.n*b.d>b.n*a.d?1:0;
function parseNumber(input,percent=false){
 let s=String(input).trim();if(!s)throw Error('Enter a number.');if(s.length>160)throw Error('Number is too long.');
 if(s.endsWith('%')){if(!percent)throw Error('Use a number without %.');s=s.slice(0,-1).trim();}
 if(s.includes(',')){if(!/^[+-]?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s))throw Error('Use a dot for decimals; commas must group thousands.');s=s.replaceAll(',','');}
 if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d{1,3})?$/i.test(s))throw Error('Enter a valid number, such as 80, 0.5, or 1e3.');
 const [base,ex='0']=s.toLowerCase().split('e');const digits=base.replace(/[+\-.]/g,'');if(digits.length>30)throw Error('Use at most 30 digits per number.');const exponent=Number(ex);if(Math.abs(exponent)>100)throw Error('Use an exponent between -100 and 100.');
 const places=(base.split('.')[1]||'').length-exponent;const sign=base.startsWith('-')?-1n:1n;const n=sign*BigInt(digits);return places>=0?rat(n,10n**BigInt(places)):rat(n*10n**BigInt(-places));
}
function format(a,places=2,ceil=false){
 if(!Number.isInteger(places)||places<0||places>10)throw Error('Decimals must be between 0 and 10.');const scale=10n**BigInt(places),v=a.n*scale;let q=v/a.d;const r=v%a.d;
 if(ceil){if(r>0n)q++;}else if(abs(r)*2n>=a.d)q+=v<0n?-1n:1n;
 const neg=q<0n;let s=abs(q).toString().padStart(places+1,'0');let whole=places?s.slice(0,-places):s;whole=whole.replace(/\B(?=(\d{3})+(?!\d))/g,',');return (neg?'-':'')+whole+(places?'.'+s.slice(-places):'');
}
function scientific(a,significant=6){
 if(!a.n)return '0';const n=abs(a.n);let exponent=n.toString().length-a.d.toString().length;
 const at=e=>e>=0?rat(a.n,a.d*10n**BigInt(e)):rat(a.n*10n**BigInt(-e),a.d);
 let mantissa=at(exponent);if(abs(mantissa.n)<mantissa.d){exponent--;mantissa=at(exponent);}
 let shown=format(mantissa,significant-1);if(shown==='10.'+'0'.repeat(significant-1)||shown==='-10.'+'0'.repeat(significant-1)){exponent++;shown=format(at(exponent),significant-1);}
 return shown+'e'+(exponent>=0?'+':'')+exponent;
}
function analyze(rows,scale='relative'){
 if(rows.length>MAX_ROWS)throw Error(`Use at most ${MAX_ROWS} rows.`);const entries=[],errors=[];
 rows.forEach((row,i)=>{const v=String(row.value??'').trim(),w=String(row.weight??'').trim();if(!v&&!w)return;let value,weight;
 try{value=parseNumber(v,true);}catch(e){errors.push({row:i,field:'value',message:e.message});}
 try{weight=parseNumber(w,scale!=='fraction');if(weight.n<0n)throw Error('Weight cannot be negative.');}catch(e){errors.push({row:i,field:'weight',message:e.message});}
 if(value&&weight&&weight.n>=0n)entries.push({label:String(row.label||`Item ${i+1}`).slice(0,80),value,weight});});
 if(errors.length)return {errors,entries:[]};if(!entries.length)return {errors:[],empty:true,entries};const total=entries.reduce((s,e)=>add(s,e.weight),rat(0n));if(total.n===0n)return {errors:[],message:'Total weight must be greater than zero.',entries};
 const sum=entries.reduce((s,e)=>add(s,mul(e.value,e.weight)),rat(0n));const average=div(sum,total);const simple=div(entries.reduce((s,e)=>add(s,e.value),rat(0n)),rat(BigInt(entries.length)));
 return {errors:[],entries,total,sum,average,simple,difference:sub(average,simple)};
}
function target(stats,t,w,min='',max=''){
 if(!stats.average)throw Error('Enter valid completed values and weights first.');const goal=parseNumber(t,true),remaining=parseNumber(w,true);if(remaining.n<=0n)throw Error('Remaining weight must be greater than zero.');
 const low=String(min).trim()?parseNumber(min,true):null,high=String(max).trim()?parseNumber(max,true):null;if(low&&high&&cmp(low,high)>0)throw Error('Minimum cannot exceed maximum.');const combined=add(stats.total,remaining),needed=div(sub(mul(goal,combined),stats.sum),remaining);
 return {needed,combined,status:high&&cmp(needed,high)>0?'unreachable':low&&cmp(needed,low)<=0?'secured':'reachable'};
}
function splitDelimited(line,delimiter){let cells=[],cell='',quoted=false,closed=false;
 for(let i=0;i<line.length;i++){let c=line[i];if(quoted){if(c==='"'){if(line[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;}else if(c===delimiter){cells.push(cell.trim());cell='';closed=false;}else if(c==='"'){if(cell.trim()||closed)throw Error('Misplaced quote.');quoted=true;}else {if(closed&&c.trim())throw Error('Unexpected text after a quoted cell.');cell+=c;}}
 if(quoted)throw Error('Close the quoted cell.');cells.push(cell.trim());return cells;
}
function parsePaste(text,scale='relative'){if(text.length>200000)throw Error('Paste is too large. Use at most 500 rows.');const lines=text.split(/\r?\n/),rows=[];let delimiter=null,header=false;
 for(let i=0;i<lines.length;i++){const line=lines[i];if(!line.trim())continue;
 if(delimiter===null){delimiter=line.includes('\t')?'\t':line.includes(';')?';':line.includes(',')?',':line.includes(':')?':':'space';}
 let p;try{p=delimiter==='space'?line.trim().split(/\s+/):splitDelimited(line,delimiter);}catch(e){throw Error(`Line ${i+1}: ${e.message}`);}
 const lower=p.map(s=>s.toLowerCase());const valueHeaders=['value','score','grade','price','grade point','grade points'],weightHeaders=['weight','weight (%)','credits','quantity','frequency'];
 if(!rows.length&&!header&&((p.length===2&&valueHeaders.includes(lower[0])&&weightHeaders.includes(lower[1]))||(p.length===3&&['label','name','item','course'].includes(lower[0])&&valueHeaders.includes(lower[1])&&weightHeaders.includes(lower[2])))){header=true;continue;}
 if(p.length!==2&&p.length!==3)throw Error(`Line ${i+1}: expected value, weight or label, value, weight. Use tabs for labels with spaces; quote numbers containing commas.`);
 const offset=p.length-2;try{parseNumber(p[offset],true);const w=parseNumber(p[offset+1],scale!=='fraction');if(w.n<0n)throw Error('Weight cannot be negative.');}catch(e){throw Error(`Line ${i+1}: ${e.message}`);}
 if(offset&&p[0].length>80)throw Error(`Line ${i+1}: labels must be 80 characters or fewer.`);rows.push({label:offset?p[0]:'',value:p[offset],weight:p[offset+1]});if(rows.length>MAX_ROWS)throw Error('Use at most 500 rows.');
 }if(!rows.length)throw Error('No data rows found. Paste value and weight columns.');return rows;
}
return {MAX_ROWS,rat,add,sub,mul,div,cmp,parseNumber,format,scientific,analyze,target,parsePaste};
});
