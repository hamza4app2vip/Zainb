/* Crypto helpers: AES-256-GCM + PBKDF2-SHA-256 */

async function deriveKeyPBKDF2(password, salt, iterations=310000){
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), {name:'PBKDF2'}, false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    {name:'PBKDF2', salt, iterations, hash:'SHA-256'},
    baseKey,
    {name:'AES-GCM', length:256},
    false,
    ['encrypt','decrypt']
  );
  return key;
}

async function encryptBytesAESGCM(plainBytes, password, aadBytes=new Uint8Array(), iterations=310000){
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await deriveKeyPBKDF2(password, salt, iterations);
  const ctBuf = await crypto.subtle.encrypt({name:'AES-GCM', iv, additionalData: aadBytes}, key, plainBytes);
  const ct = new Uint8Array(ctBuf);

  // Package header: [MAGIC:4 'STEG'][VER:1][ALGO:1][RES:1][saltLen:1][ivLen:1][iters:4][aadLen:2][ctLen:4] + payloads
  const MAGIC = new Uint8Array([0x53,0x54,0x45,0x47]);
  const header = concatBytes(
    MAGIC,
    new Uint8Array([0x01, 0x01, 0x00]),
    new Uint8Array([salt.length, iv.length]),
    u32_to_bytes_le(iterations),
    u16_to_bytes_le(aadBytes.length),
    u32_to_bytes_le(ct.length),
  );
  return concatBytes(header, salt, iv, aadBytes, ct);
}

async function decryptBytesAESGCM(payloadBytes, password){
  if(payloadBytes.length < 19) throw new Error('البيانات غير كافية أو تالفة.');
  const m = payloadBytes.slice(0,4);
  if(!(m[0]==0x53 && m[1]==0x54 && m[2]==0x45 && m[3]==0x47)) throw new Error('MAGIC غير صحيح — ليست حزمة VIP Stego.');
  const ver = payloadBytes[4]; if(ver!==0x01) throw new Error('إصدار غير مدعوم.');
  const algo = payloadBytes[5]; if(algo!==0x01) throw new Error('خوارزمية غير مدعومة.');
  const saltLen = payloadBytes[7];
  const ivLen = payloadBytes[8];
  const iterations = bytes_to_u32_le(payloadBytes, 9);
  const aadLen = bytes_to_u16_le(payloadBytes, 13);
  const ctLen = bytes_to_u32_le(payloadBytes, 15);
  const headerLen = 19;
  let off = headerLen;

  if(payloadBytes.length < off + saltLen + ivLen + aadLen + ctLen) throw new Error('حجم الحزمة لا يطابق الرأس.');
  const salt = payloadBytes.slice(off, off+saltLen); off+=saltLen;
  const iv   = payloadBytes.slice(off, off+ivLen); off+=ivLen;
  const aad  = payloadBytes.slice(off, off+aadLen); off+=aadLen;
  const ct   = payloadBytes.slice(off, off+ctLen); off+=ctLen;

  const key = await deriveKeyPBKDF2(password, salt, iterations);
  const ptBuf = await crypto.subtle.decrypt({name:'AES-GCM', iv, additionalData: aad}, key, ct);
  return new Uint8Array(ptBuf);
}
