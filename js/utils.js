/* Utils */
const $ = (sel)=>document.querySelector(sel);
const enc = new TextEncoder();
const dec = new TextDecoder();

const logLine = (el,msg,cls='')=>{
  const line = document.createElement('div');
  if(cls) line.classList.add(cls);
  line.textContent = msg;
  el.appendChild(line);
};
const estimatePasswordStrength = (pw)=>{
  let s=0; if(pw.length>=12) s++; if(/[A-Z]/.test(pw)&&/[a-z]/.test(pw)) s++; if(/\d/.test(pw)) s++; if(/\W/.test(pw)) s++;
  return s; // 0..4
};
const concatBytes = (...arrs)=>{
  const total = arrs.reduce((a,b)=>a+b.length,0);
  const out = new Uint8Array(total);
  let off=0; for(const a of arrs){ out.set(a,off); off+=a.length; }
  return out;
};
function u32_to_bytes_le(num){
  const b = new Uint8Array(4);
  const v = new DataView(b.buffer);
  v.setUint32(0, num, true);
  return b;
}
function u16_to_bytes_le(num){
  const b = new Uint8Array(2);
  const v = new DataView(b.buffer);
  v.setUint16(0, num, true);
  return b;
}
function bytes_to_u32_le(bytes, off=0){
  return new DataView(bytes.buffer, bytes.byteOffset+off, 4).getUint32(0, true);
}
function bytes_to_u16_le(bytes, off=0){
  return new DataView(bytes.buffer, bytes.byteOffset+off, 2).getUint16(0, true);
}
