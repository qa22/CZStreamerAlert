import parseABAMessage from './parser.js';

const sample = `៛100 paid by VANG SOKCHHENG (*858) on Jul 10, 05:57 PM via ABA KHQR (ACLEDA Bank Plc.) at S.CG SHOP by S.VANG. Trx. ID: 178368104912409, APV: 443816.`;
console.log('Sample:', sample);
console.log('Parse result:', parseABAMessage(sample));
