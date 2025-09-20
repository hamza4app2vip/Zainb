/* LSB steganography utilities */
function capacityBits(imageData){ return (imageData.data.length/4) * 3; }

function encodeLSB(imageData, payload){
  const data = imageData.data;
  const bits = bytesToBits(payload);
  const cap = capacityBits(imageData);
  if(bits.length > cap) throw new Error(`السعة غير كافية: نحتاج ${bits.length} بت، المتاح ${cap} بت.`);
  let bi = 0;
  for(let i=0;i<data.length && bi<bits.length;i+=4){
    for(let c=0;c<3 && bi<bits.length;c++){
      const idx = i + c;
      const bit = bits[bi++];
      data[idx] = (data[idx] & 0xFE) | bit;
    }
  }
  return imageData;
}

function decodeLSB(imageData, bytesNeeded){
  const data = imageData.data;
  const totalBits = bytesNeeded ? bytesNeeded*8 : capacityBits(imageData);
  const bits = [];
  let bi = 0;
  for(let i=0;i<data.length && bi<totalBits; i+=4){
    for(let c=0;c<3 && bi<totalBits; c++){
      bits.push(data[i+c] & 1); bi++;
    }
  }
  return bitsToBytes(bits);
}

function decodeFirstNBytes(imageData, nBytes){
  const data = imageData.data;
  const neededBits = nBytes*8;
  const bits = [];
  let bi=0;
  for(let i=0;i<data.length && bi<neededBits; i+=4){
    for(let c=0;c<3 && bi<neededBits; c++){
      bits.push(data[i+c] & 1); bi++;
    }
  }
  if(bits.length < neededBits) throw new Error('الصورة لا تحتوي على بيانات كافية حتى لقراءة الرأس.');
  return bitsToBytes(bits);
}

function bytesToBits(bytes){
  const out=[];
  for(let i=0;i<bytes.length;i++){
    const b = bytes[i];
    for(let k=0;k<8;k++) out.push((b>>k)&1);
  }
  return out;
}
function bitsToBytes(bits){
  const len = Math.floor(bits.length/8);
  const out = new Uint8Array(len);
  for(let i=0;i<len;i++){
    let b=0;
    for(let k=0;k<8;k++){ b |= (bits[i*8+k]&1) << k; }
    out[i]=b;
  }
  return out;
}
