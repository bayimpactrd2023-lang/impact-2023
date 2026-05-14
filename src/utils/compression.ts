/**
 * LZ-String compression utility
 * Lightweight compression for localStorage data
 */

export const LZString = {
  /**
   * Compress a string using LZ-based compression
   */
  compress(input: string): string {
    if (!input) return '';

    const dict: { [key: string]: number } = {};
    const data: (string | number)[] = (input + '').split('');
    const out: number[] = [];
    const firstChar = data[0];
    let phrase = typeof firstChar === 'string' ? firstChar : String.fromCharCode(firstChar as number);
    let code = 256;

    for (let i = 1; i < data.length; i++) {
      const curr = data[i];
      const currChar = typeof curr === 'string' ? curr : String.fromCharCode(curr as number);
      const combined = phrase + currChar;

      if (dict[combined] != null) {
        phrase = combined;
      } else {
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        dict[combined] = code;
        code++;
        phrase = currChar;
      }
    }

    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));

    // Convert to base64-like string
    return _compress(out);
  },

  /**
   * Decompress a compressed string
   */
  decompress(compressed: string): string | null {
    if (!compressed) return null;

    const dict: { [key: number]: string } = {};
    const data = _decompress(compressed);

    if (!data || data.length === 0) return null;

    let currChar = String.fromCharCode(data[0]);
    let oldPhrase = currChar;
    const out = [currChar];
    let code = 256;
    let phrase: string;

    for (let i = 1; i < data.length; i++) {
      const currCode = data[i];

      if (currCode < 256) {
        phrase = String.fromCharCode(currCode);
      } else {
        phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
      }

      out.push(phrase);
      currChar = phrase.charAt(0);
      dict[code] = oldPhrase + currChar;
      code++;
      oldPhrase = phrase;
    }

    return out.join('');
  },
};

// Helper functions for base64-like encoding
function _compress(data: number[]): string {
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  let i = 0;

  while (i < data.length) {
    chr1 = data[i++];
    chr2 = data[i++];
    chr3 = data[i++];

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (chr2 == null || isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (chr3 == null || isNaN(chr3)) {
      enc4 = 64;
    }

    output = output +
      keyStr.charAt(enc1) + keyStr.charAt(enc2) +
      keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }

  return output;
}

function _decompress(input: string): number[] | null {
  const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const output: number[] = [];
  let chr1, chr2, chr3;
  let enc1, enc2, enc3, enc4;
  let i = 0;

  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

  while (i < input.length) {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output.push(chr1);

    if (enc3 !== 64) {
      output.push(chr2);
    }
    if (enc4 !== 64) {
      output.push(chr3);
    }
  }

  return output;
}
