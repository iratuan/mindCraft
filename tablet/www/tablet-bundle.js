"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // node_modules/base64-js/index.js
  var require_base64_js = __commonJS({
    "node_modules/base64-js/index.js"(exports) {
      "use strict";
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1) validLen = len2;
        var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
        return [validLen, placeHoldersLen];
      }
      function byteLength(b64) {
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function _byteLength(b64, validLen, placeHoldersLen) {
        return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
      }
      function toByteArray(b64) {
        var tmp;
        var lens = getLens(b64);
        var validLen = lens[0];
        var placeHoldersLen = lens[1];
        var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
        var curByte = 0;
        var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
        var i2;
        for (i2 = 0; i2 < len2; i2 += 4) {
          tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
          arr[curByte++] = tmp >> 16 & 255;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 2) {
          tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
          arr[curByte++] = tmp & 255;
        }
        if (placeHoldersLen === 1) {
          tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
          arr[curByte++] = tmp >> 8 & 255;
          arr[curByte++] = tmp & 255;
        }
        return arr;
      }
      function tripletToBase64(num) {
        return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
      }
      function encodeChunk(uint8, start, end) {
        var tmp;
        var output = [];
        for (var i2 = start; i2 < end; i2 += 3) {
          tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
          output.push(tripletToBase64(tmp));
        }
        return output.join("");
      }
      function fromByteArray(uint8) {
        var tmp;
        var len2 = uint8.length;
        var extraBytes = len2 % 3;
        var parts = [];
        var maxChunkLength = 16383;
        for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
          parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
        }
        if (extraBytes === 1) {
          tmp = uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/ieee754/index.js"(exports) {
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
        var e, m;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var nBits = -7;
        var i = isLE ? nBytes - 1 : 0;
        var d = isLE ? -1 : 1;
        var s = buffer[offset + i];
        i += d;
        e = s & (1 << -nBits) - 1;
        s >>= -nBits;
        nBits += eLen;
        for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        m = e & (1 << -nBits) - 1;
        e >>= -nBits;
        nBits += mLen;
        for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
        }
        if (e === 0) {
          e = 1 - eBias;
        } else if (e === eMax) {
          return m ? NaN : (s ? -1 : 1) * Infinity;
        } else {
          m = m + Math.pow(2, mLen);
          e = e - eBias;
        }
        return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
      };
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
        var e, m, c;
        var eLen = nBytes * 8 - mLen - 1;
        var eMax = (1 << eLen) - 1;
        var eBias = eMax >> 1;
        var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
        var i = isLE ? 0 : nBytes - 1;
        var d = isLE ? 1 : -1;
        var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
        value = Math.abs(value);
        if (isNaN(value) || value === Infinity) {
          m = isNaN(value) ? 1 : 0;
          e = eMax;
        } else {
          e = Math.floor(Math.log(value) / Math.LN2);
          if (value * (c = Math.pow(2, -e)) < 1) {
            e--;
            c *= 2;
          }
          if (e + eBias >= 1) {
            value += rt / c;
          } else {
            value += rt * Math.pow(2, 1 - eBias);
          }
          if (value * c >= 2) {
            e++;
            c /= 2;
          }
          if (e + eBias >= eMax) {
            m = 0;
            e = eMax;
          } else if (e + eBias >= 1) {
            m = (value * c - 1) * Math.pow(2, mLen);
            e = e + eBias;
          } else {
            m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
            e = 0;
          }
        }
        for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
        }
        e = e << mLen | m;
        eLen += mLen;
        for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
        }
        buffer[offset + i - d] |= s * 128;
      };
    }
  });

  // node_modules/buffer/index.js
  var require_buffer = __commonJS({
    "node_modules/buffer/index.js"(exports) {
      "use strict";
      var base64 = require_base64_js();
      var ieee754 = require_ieee754();
      var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
      exports.Buffer = Buffer2;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      var K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer2.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
        console.error(
          "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
        );
      }
      function typedArraySupport() {
        try {
          const arr = new Uint8Array(1);
          const proto = { foo: function() {
            return 42;
          } };
          Object.setPrototypeOf(proto, Uint8Array.prototype);
          Object.setPrototypeOf(arr, proto);
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer2.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer2.isBuffer(this)) return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer2.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer2.isBuffer(this)) return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer2.prototype);
        return buf;
      }
      function Buffer2(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }
      Buffer2.poolSize = 8192;
      function from(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString(value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
          return fromArrayView(value);
        }
        if (value == null) {
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
          );
        }
        if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof value === "number") {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          );
        }
        const valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value) {
          return Buffer2.from(valueOf, encodingOrOffset, length);
        }
        const b = fromObject(value);
        if (b) return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
          return Buffer2.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      Buffer2.from = function(value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer2, Uint8Array);
      function assertSize(size) {
        if (typeof size !== "number") {
          throw new TypeError('"size" argument must be of type number');
        } else if (size < 0) {
          throw new RangeError('The value "' + size + '" is invalid for option "size"');
        }
      }
      function alloc(size, fill, encoding) {
        assertSize(size);
        if (size <= 0) {
          return createBuffer(size);
        }
        if (fill !== void 0) {
          return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
        }
        return createBuffer(size);
      }
      Buffer2.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer2.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer2.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer2.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        const length = byteLength(string, encoding) | 0;
        let buf = createBuffer(length);
        const actual = buf.write(string, encoding);
        if (actual !== length) {
          buf = buf.slice(0, actual);
        }
        return buf;
      }
      function fromArrayLike(array) {
        const length = array.length < 0 ? 0 : checked(array.length) | 0;
        const buf = createBuffer(length);
        for (let i = 0; i < length; i += 1) {
          buf[i] = array[i] & 255;
        }
        return buf;
      }
      function fromArrayView(arrayView) {
        if (isInstance(arrayView, Uint8Array)) {
          const copy = new Uint8Array(arrayView);
          return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
        }
        return fromArrayLike(arrayView);
      }
      function fromArrayBuffer(array, byteOffset, length) {
        if (byteOffset < 0 || array.byteLength < byteOffset) {
          throw new RangeError('"offset" is outside of buffer bounds');
        }
        if (array.byteLength < byteOffset + (length || 0)) {
          throw new RangeError('"length" is outside of buffer bounds');
        }
        let buf;
        if (byteOffset === void 0 && length === void 0) {
          buf = new Uint8Array(array);
        } else if (length === void 0) {
          buf = new Uint8Array(array, byteOffset);
        } else {
          buf = new Uint8Array(array, byteOffset, length);
        }
        Object.setPrototypeOf(buf, Buffer2.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer2.isBuffer(obj)) {
          const len = checked(obj.length) | 0;
          const buf = createBuffer(len);
          if (buf.length === 0) {
            return buf;
          }
          obj.copy(buf, 0, 0, len);
          return buf;
        }
        if (obj.length !== void 0) {
          if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
            return createBuffer(0);
          }
          return fromArrayLike(obj);
        }
        if (obj.type === "Buffer" && Array.isArray(obj.data)) {
          return fromArrayLike(obj.data);
        }
      }
      function checked(length) {
        if (length >= K_MAX_LENGTH) {
          throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
        }
        return length | 0;
      }
      function SlowBuffer(length) {
        if (+length != length) {
          length = 0;
        }
        return Buffer2.alloc(+length);
      }
      Buffer2.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer2.prototype;
      };
      Buffer2.compare = function compare(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer2.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array)) b = Buffer2.from(b, b.offset, b.byteLength);
        if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b) return 0;
        let x = a.length;
        let y = b.length;
        for (let i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer2.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case "hex":
          case "utf8":
          case "utf-8":
          case "ascii":
          case "latin1":
          case "binary":
          case "base64":
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return true;
          default:
            return false;
        }
      };
      Buffer2.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer2.alloc(0);
        }
        let i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        const buffer = Buffer2.allocUnsafe(length);
        let pos = 0;
        for (i = 0; i < list.length; ++i) {
          let buf = list[i];
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
              if (!Buffer2.isBuffer(buf)) buf = Buffer2.from(buf);
              buf.copy(buffer, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer,
                buf,
                pos
              );
            }
          } else if (!Buffer2.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer, pos);
          }
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer2.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
          );
        }
        const len = string.length;
        const mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0) return 0;
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "ascii":
            case "latin1":
            case "binary":
              return len;
            case "utf8":
            case "utf-8":
              return utf8ToBytes(string).length;
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return len * 2;
            case "hex":
              return len >>> 1;
            case "base64":
              return base64ToBytes(string).length;
            default:
              if (loweredCase) {
                return mustMatch ? -1 : utf8ToBytes(string).length;
              }
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer2.byteLength = byteLength;
      function slowToString(encoding, start, end) {
        let loweredCase = false;
        if (start === void 0 || start < 0) {
          start = 0;
        }
        if (start > this.length) {
          return "";
        }
        if (end === void 0 || end > this.length) {
          end = this.length;
        }
        if (end <= 0) {
          return "";
        }
        end >>>= 0;
        start >>>= 0;
        if (end <= start) {
          return "";
        }
        if (!encoding) encoding = "utf8";
        while (true) {
          switch (encoding) {
            case "hex":
              return hexSlice(this, start, end);
            case "utf8":
            case "utf-8":
              return utf8Slice(this, start, end);
            case "ascii":
              return asciiSlice(this, start, end);
            case "latin1":
            case "binary":
              return latin1Slice(this, start, end);
            case "base64":
              return base64Slice(this, start, end);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return utf16leSlice(this, start, end);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer2.prototype._isBuffer = true;
      function swap(b, n, m) {
        const i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer2.prototype.swap16 = function swap16() {
        const len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (let i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer2.prototype.swap32 = function swap32() {
        const len = this.length;
        if (len % 4 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 32-bits");
        }
        for (let i = 0; i < len; i += 4) {
          swap(this, i, i + 3);
          swap(this, i + 1, i + 2);
        }
        return this;
      };
      Buffer2.prototype.swap64 = function swap64() {
        const len = this.length;
        if (len % 8 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 64-bits");
        }
        for (let i = 0; i < len; i += 8) {
          swap(this, i, i + 7);
          swap(this, i + 1, i + 6);
          swap(this, i + 2, i + 5);
          swap(this, i + 3, i + 4);
        }
        return this;
      };
      Buffer2.prototype.toString = function toString() {
        const length = this.length;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
      Buffer2.prototype.equals = function equals(b) {
        if (!Buffer2.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer2.compare(this, b) === 0;
      };
      Buffer2.prototype.inspect = function inspect() {
        let str = "";
        const max = exports.INSPECT_MAX_BYTES;
        str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max) str += " ... ";
        return "<Buffer " + str + ">";
      };
      if (customInspectSymbol) {
        Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
      }
      Buffer2.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer2.from(target, target.offset, target.byteLength);
        }
        if (!Buffer2.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
          );
        }
        if (start === void 0) {
          start = 0;
        }
        if (end === void 0) {
          end = target ? target.length : 0;
        }
        if (thisStart === void 0) {
          thisStart = 0;
        }
        if (thisEnd === void 0) {
          thisEnd = this.length;
        }
        if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
          throw new RangeError("out of range index");
        }
        if (thisStart >= thisEnd && start >= end) {
          return 0;
        }
        if (thisStart >= thisEnd) {
          return -1;
        }
        if (start >= end) {
          return 1;
        }
        start >>>= 0;
        end >>>= 0;
        thisStart >>>= 0;
        thisEnd >>>= 0;
        if (this === target) return 0;
        let x = thisEnd - thisStart;
        let y = end - start;
        const len = Math.min(x, y);
        const thisCopy = this.slice(thisStart, thisEnd);
        const targetCopy = target.slice(start, end);
        for (let i = 0; i < len; ++i) {
          if (thisCopy[i] !== targetCopy[i]) {
            x = thisCopy[i];
            y = targetCopy[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (buffer.length === 0) return -1;
        if (typeof byteOffset === "string") {
          encoding = byteOffset;
          byteOffset = 0;
        } else if (byteOffset > 2147483647) {
          byteOffset = 2147483647;
        } else if (byteOffset < -2147483648) {
          byteOffset = -2147483648;
        }
        byteOffset = +byteOffset;
        if (numberIsNaN(byteOffset)) {
          byteOffset = dir ? 0 : buffer.length - 1;
        }
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;
          else return -1;
        }
        if (typeof val === "string") {
          val = Buffer2.from(val, encoding);
        }
        if (Buffer2.isBuffer(val)) {
          if (val.length === 0) {
            return -1;
          }
          return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
        } else if (typeof val === "number") {
          val = val & 255;
          if (typeof Uint8Array.prototype.indexOf === "function") {
            if (dir) {
              return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
            } else {
              return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
            }
          }
          return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
        }
        throw new TypeError("val must be string, number or Buffer");
      }
      function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
        let indexSize = 1;
        let arrLength = arr.length;
        let valLength = val.length;
        if (encoding !== void 0) {
          encoding = String(encoding).toLowerCase();
          if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
            if (arr.length < 2 || val.length < 2) {
              return -1;
            }
            indexSize = 2;
            arrLength /= 2;
            valLength /= 2;
            byteOffset /= 2;
          }
        }
        function read(buf, i2) {
          if (indexSize === 1) {
            return buf[i2];
          } else {
            return buf.readUInt16BE(i2 * indexSize);
          }
        }
        let i;
        if (dir) {
          let foundIndex = -1;
          for (i = byteOffset; i < arrLength; i++) {
            if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            let found = true;
            for (let j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
      };
      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0;
        const remaining = buf.length - offset;
        if (!length) {
          length = remaining;
        } else {
          length = Number(length);
          if (length > remaining) {
            length = remaining;
          }
        }
        const strLen = string.length;
        if (length > strLen / 2) {
          length = strLen / 2;
        }
        let i;
        for (i = 0; i < length; ++i) {
          const parsed = parseInt(string.substr(i * 2, 2), 16);
          if (numberIsNaN(parsed)) return i;
          buf[offset + i] = parsed;
        }
        return i;
      }
      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
      }
      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length);
      }
      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length);
      }
      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
      }
      Buffer2.prototype.write = function write(string, offset, length, encoding) {
        if (offset === void 0) {
          encoding = "utf8";
          length = this.length;
          offset = 0;
        } else if (length === void 0 && typeof offset === "string") {
          encoding = offset;
          length = this.length;
          offset = 0;
        } else if (isFinite(offset)) {
          offset = offset >>> 0;
          if (isFinite(length)) {
            length = length >>> 0;
            if (encoding === void 0) encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        const remaining = this.length - offset;
        if (length === void 0 || length > remaining) length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding) encoding = "utf8";
        let loweredCase = false;
        for (; ; ) {
          switch (encoding) {
            case "hex":
              return hexWrite(this, string, offset, length);
            case "utf8":
            case "utf-8":
              return utf8Write(this, string, offset, length);
            case "ascii":
            case "latin1":
            case "binary":
              return asciiWrite(this, string, offset, length);
            case "base64":
              return base64Write(this, string, offset, length);
            case "ucs2":
            case "ucs-2":
            case "utf16le":
            case "utf-16le":
              return ucs2Write(this, string, offset, length);
            default:
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer2.prototype.toJSON = function toJSON() {
        return {
          type: "Buffer",
          data: Array.prototype.slice.call(this._arr || this, 0)
        };
      };
      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf);
        } else {
          return base64.fromByteArray(buf.slice(start, end));
        }
      }
      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end);
        const res = [];
        let i = start;
        while (i < end) {
          const firstByte = buf[i];
          let codePoint = null;
          let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
          if (i + bytesPerSequence <= end) {
            let secondByte, thirdByte, fourthByte, tempCodePoint;
            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 128) {
                  codePoint = firstByte;
                }
                break;
              case 2:
                secondByte = buf[i + 1];
                if ((secondByte & 192) === 128) {
                  tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                  if (tempCodePoint > 127) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 3:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                  if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                    codePoint = tempCodePoint;
                  }
                }
                break;
              case 4:
                secondByte = buf[i + 1];
                thirdByte = buf[i + 2];
                fourthByte = buf[i + 3];
                if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                  tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                  if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                    codePoint = tempCodePoint;
                  }
                }
            }
          }
          if (codePoint === null) {
            codePoint = 65533;
            bytesPerSequence = 1;
          } else if (codePoint > 65535) {
            codePoint -= 65536;
            res.push(codePoint >>> 10 & 1023 | 55296);
            codePoint = 56320 | codePoint & 1023;
          }
          res.push(codePoint);
          i += bytesPerSequence;
        }
        return decodeCodePointsArray(res);
      }
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        const len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints);
        }
        let res = "";
        let i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          );
        }
        return res;
      }
      function asciiSlice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i] & 127);
        }
        return ret;
      }
      function latin1Slice(buf, start, end) {
        let ret = "";
        end = Math.min(buf.length, end);
        for (let i = start; i < end; ++i) {
          ret += String.fromCharCode(buf[i]);
        }
        return ret;
      }
      function hexSlice(buf, start, end) {
        const len = buf.length;
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
        let out = "";
        for (let i = start; i < end; ++i) {
          out += hexSliceLookupTable[buf[i]];
        }
        return out;
      }
      function utf16leSlice(buf, start, end) {
        const bytes = buf.slice(start, end);
        let res = "";
        for (let i = 0; i < bytes.length - 1; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
        }
        return res;
      }
      Buffer2.prototype.slice = function slice(start, end) {
        const len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start) end = start;
        const newBuf = this.subarray(start, end);
        Object.setPrototypeOf(newBuf, Buffer2.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          checkOffset(offset, byteLength2, this.length);
        }
        let val = this[offset + --byteLength2];
        let mul = 1;
        while (byteLength2 > 0 && (mul *= 256)) {
          val += this[offset + --byteLength2] * mul;
        }
        return val;
      };
      Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer2.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
        const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
        return BigInt(lo) + (BigInt(hi) << BigInt(32));
      });
      Buffer2.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
        return (BigInt(hi) << BigInt(32)) + BigInt(lo);
      });
      Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let i = byteLength2;
        let mul = 1;
        let val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer2.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
        return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
      });
      Buffer2.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
        offset = offset >>> 0;
        validateNumber(offset, "offset");
        const first = this[offset];
        const last = this[offset + 7];
        if (first === void 0 || last === void 0) {
          boundsError(offset, this.length - 8);
        }
        const val = (first << 24) + // Overflow
        this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
        return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
      });
      Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer2.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let mul = 1;
        let i = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) {
          const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
          checkInt(this, value, offset, byteLength2, maxBytes, 0);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          this[offset + i] = value / mul & 255;
        }
        return offset + byteLength2;
      };
      Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
        return offset + 4;
      };
      Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      function wrtBigUInt64LE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        lo = lo >> 8;
        buf[offset++] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        hi = hi >> 8;
        buf[offset++] = hi;
        return offset;
      }
      function wrtBigUInt64BE(buf, value, offset, min, max) {
        checkIntBI(value, min, max, buf, offset, 7);
        let lo = Number(value & BigInt(4294967295));
        buf[offset + 7] = lo;
        lo = lo >> 8;
        buf[offset + 6] = lo;
        lo = lo >> 8;
        buf[offset + 5] = lo;
        lo = lo >> 8;
        buf[offset + 4] = lo;
        let hi = Number(value >> BigInt(32) & BigInt(4294967295));
        buf[offset + 3] = hi;
        hi = hi >> 8;
        buf[offset + 2] = hi;
        hi = hi >> 8;
        buf[offset + 1] = hi;
        hi = hi >> 8;
        buf[offset] = hi;
        return offset + 8;
      }
      Buffer2.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer2.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = 0;
        let mul = 1;
        let sub = 0;
        this[offset] = value & 255;
        while (++i < byteLength2 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          const limit = Math.pow(2, 8 * byteLength2 - 1);
          checkInt(this, value, offset, byteLength2, limit - 1, -limit);
        }
        let i = byteLength2 - 1;
        let mul = 1;
        let sub = 0;
        this[offset + i] = value & 255;
        while (--i >= 0 && (mul *= 256)) {
          if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
            sub = 1;
          }
          this[offset + i] = (value / mul >> 0) - sub & 255;
        }
        return offset + byteLength2;
      };
      Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
        if (value < 0) value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };
      Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0) value = 4294967295 + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      Buffer2.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      Buffer2.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer2.isBuffer(target)) throw new TypeError("argument should be a Buffer");
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        const len = end - start;
        if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
          this.copyWithin(targetStart, start, end);
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          );
        }
        return len;
      };
      Buffer2.prototype.fill = function fill(val, start, end, encoding) {
        if (typeof val === "string") {
          if (typeof start === "string") {
            encoding = start;
            start = 0;
            end = this.length;
          } else if (typeof end === "string") {
            encoding = end;
            end = this.length;
          }
          if (encoding !== void 0 && typeof encoding !== "string") {
            throw new TypeError("encoding must be a string");
          }
          if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
            throw new TypeError("Unknown encoding: " + encoding);
          }
          if (val.length === 1) {
            const code = val.charCodeAt(0);
            if (encoding === "utf8" && code < 128 || encoding === "latin1") {
              val = code;
            }
          }
        } else if (typeof val === "number") {
          val = val & 255;
        } else if (typeof val === "boolean") {
          val = Number(val);
        }
        if (start < 0 || this.length < start || this.length < end) {
          throw new RangeError("Out of range index");
        }
        if (end <= start) {
          return this;
        }
        start = start >>> 0;
        end = end === void 0 ? this.length : end >>> 0;
        if (!val) val = 0;
        let i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          const bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
          const len = bytes.length;
          if (len === 0) {
            throw new TypeError('The value "' + val + '" is invalid for argument "value"');
          }
          for (i = 0; i < end - start; ++i) {
            this[i + start] = bytes[i % len];
          }
        }
        return this;
      };
      var errors = {};
      function E(sym, getMessage, Base) {
        errors[sym] = class NodeError extends Base {
          constructor() {
            super();
            Object.defineProperty(this, "message", {
              value: getMessage.apply(this, arguments),
              writable: true,
              configurable: true
            });
            this.name = `${this.name} [${sym}]`;
            this.stack;
            delete this.name;
          }
          get code() {
            return sym;
          }
          set code(value) {
            Object.defineProperty(this, "code", {
              configurable: true,
              enumerable: true,
              value,
              writable: true
            });
          }
          toString() {
            return `${this.name} [${sym}]: ${this.message}`;
          }
        };
      }
      E(
        "ERR_BUFFER_OUT_OF_BOUNDS",
        function(name) {
          if (name) {
            return `${name} is outside of buffer bounds`;
          }
          return "Attempt to access memory outside buffer bounds";
        },
        RangeError
      );
      E(
        "ERR_INVALID_ARG_TYPE",
        function(name, actual) {
          return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
        },
        TypeError
      );
      E(
        "ERR_OUT_OF_RANGE",
        function(str, range, input) {
          let msg = `The value of "${str}" is out of range.`;
          let received = input;
          if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
            received = addNumericalSeparator(String(input));
          } else if (typeof input === "bigint") {
            received = String(input);
            if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
              received = addNumericalSeparator(received);
            }
            received += "n";
          }
          msg += ` It must be ${range}. Received ${received}`;
          return msg;
        },
        RangeError
      );
      function addNumericalSeparator(val) {
        let res = "";
        let i = val.length;
        const start = val[0] === "-" ? 1 : 0;
        for (; i >= start + 4; i -= 3) {
          res = `_${val.slice(i - 3, i)}${res}`;
        }
        return `${val.slice(0, i)}${res}`;
      }
      function checkBounds(buf, offset, byteLength2) {
        validateNumber(offset, "offset");
        if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
          boundsError(offset, buf.length - (byteLength2 + 1));
        }
      }
      function checkIntBI(value, min, max, buf, offset, byteLength2) {
        if (value > max || value < min) {
          const n = typeof min === "bigint" ? "n" : "";
          let range;
          if (byteLength2 > 3) {
            if (min === 0 || min === BigInt(0)) {
              range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
            } else {
              range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
            }
          } else {
            range = `>= ${min}${n} and <= ${max}${n}`;
          }
          throw new errors.ERR_OUT_OF_RANGE("value", range, value);
        }
        checkBounds(buf, offset, byteLength2);
      }
      function validateNumber(value, name) {
        if (typeof value !== "number") {
          throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
        }
      }
      function boundsError(value, length, type) {
        if (Math.floor(value) !== value) {
          validateNumber(value, type);
          throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
        }
        if (length < 0) {
          throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
        }
        throw new errors.ERR_OUT_OF_RANGE(
          type || "offset",
          `>= ${type ? 1 : 0} and <= ${length}`,
          value
        );
      }
      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = str.split("=")[0];
        str = str.trim().replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
        while (str.length % 4 !== 0) {
          str = str + "=";
        }
        return str;
      }
      function utf8ToBytes(string, units) {
        units = units || Infinity;
        let codePoint;
        const length = string.length;
        let leadSurrogate = null;
        const bytes = [];
        for (let i = 0; i < length; ++i) {
          codePoint = string.charCodeAt(i);
          if (codePoint > 55295 && codePoint < 57344) {
            if (!leadSurrogate) {
              if (codePoint > 56319) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
          } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(
              codePoint >> 6 | 192,
              codePoint & 63 | 128
            );
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(
              codePoint >> 12 | 224,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(
              codePoint >> 18 | 240,
              codePoint >> 12 & 63 | 128,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else {
            throw new Error("Invalid code point");
          }
        }
        return bytes;
      }
      function asciiToBytes(str) {
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          byteArray.push(str.charCodeAt(i) & 255);
        }
        return byteArray;
      }
      function utf16leToBytes(str, units) {
        let c, hi, lo;
        const byteArray = [];
        for (let i = 0; i < str.length; ++i) {
          if ((units -= 2) < 0) break;
          c = str.charCodeAt(i);
          hi = c >> 8;
          lo = c % 256;
          byteArray.push(lo);
          byteArray.push(hi);
        }
        return byteArray;
      }
      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str));
      }
      function blitBuffer(src, dst, offset, length) {
        let i;
        for (i = 0; i < length; ++i) {
          if (i + offset >= dst.length || i >= src.length) break;
          dst[i + offset] = src[i];
        }
        return i;
      }
      function isInstance(obj, type) {
        return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
      }
      function numberIsNaN(obj) {
        return obj !== obj;
      }
      var hexSliceLookupTable = (function() {
        const alphabet = "0123456789abcdef";
        const table = new Array(256);
        for (let i = 0; i < 16; ++i) {
          const i16 = i * 16;
          for (let j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet[i] + alphabet[j];
          }
        }
        return table;
      })();
      function defineBigIntMethod(fn) {
        return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
      }
      function BufferBigIntNotDefined() {
        throw new Error("BigInt not supported");
      }
    }
  });

  // shim/globals.js
  var require_globals = __commonJS({
    "shim/globals.js"(exports, module) {
      "use strict";
      var { Buffer: Buffer2 } = require_buffer();
      if (typeof globalThis.Buffer === "undefined") globalThis.Buffer = Buffer2;
      if (typeof globalThis.process === "undefined") globalThis.process = { pid: 0, env: {}, platform: "web", cwd: () => "/", versions: {} };
      module.exports = { Buffer: Buffer2 };
    }
  });

  // node_modules/@capacitor/core/dist/index.cjs.js
  var require_index_cjs = __commonJS({
    "node_modules/@capacitor/core/dist/index.cjs.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ExceptionCode = void 0;
      (function(ExceptionCode) {
        ExceptionCode["Unimplemented"] = "UNIMPLEMENTED";
        ExceptionCode["Unavailable"] = "UNAVAILABLE";
      })(exports.ExceptionCode || (exports.ExceptionCode = {}));
      var CapacitorException = class extends Error {
        constructor(message, code, data) {
          super(message);
          this.message = message;
          this.code = code;
          this.data = data;
        }
      };
      var getPlatformId = (win) => {
        var _a, _b;
        if (win === null || win === void 0 ? void 0 : win.androidBridge) {
          return "android";
        } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
          return "ios";
        } else {
          return "web";
        }
      };
      var createCapacitor = (win) => {
        const capCustomPlatform = win.CapacitorCustomPlatform || null;
        const cap = win.Capacitor || {};
        const Plugins = cap.Plugins = cap.Plugins || {};
        const getPlatform = () => {
          return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
        };
        const isNativePlatform = () => getPlatform() !== "web";
        const isPluginAvailable = (pluginName) => {
          const plugin = registeredPlugins.get(pluginName);
          if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            return true;
          }
          if (getPluginHeader(pluginName)) {
            return true;
          }
          return false;
        };
        const getPluginHeader = (pluginName) => {
          var _a;
          return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find((h) => h.name === pluginName);
        };
        const handleError = (err) => win.console.error(err);
        const registeredPlugins = /* @__PURE__ */ new Map();
        const registerPlugin2 = (pluginName, jsImplementations = {}) => {
          const registeredPlugin = registeredPlugins.get(pluginName);
          if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
          }
          const platform = getPlatform();
          const pluginHeader = getPluginHeader(pluginName);
          let jsImplementation;
          const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
              jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
            } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
              jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
            }
            return jsImplementation;
          };
          const createPluginMethod = (impl, prop) => {
            var _a, _b;
            if (pluginHeader) {
              const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
              if (methodHeader) {
                if (methodHeader.rtype === "promise") {
                  return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                } else {
                  return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                }
              } else if (impl) {
                return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
              }
            } else if (impl) {
              return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
            } else {
              throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, exports.ExceptionCode.Unimplemented);
            }
          };
          const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
              const p = loadPluginImplementation().then((impl) => {
                const fn = createPluginMethod(impl, prop);
                if (fn) {
                  const p2 = fn(...args);
                  remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
                  return p2;
                } else {
                  throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, exports.ExceptionCode.Unimplemented);
                }
              });
              if (prop === "addListener") {
                p.remove = async () => remove();
              }
              return p;
            };
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, "name", {
              value: prop,
              writable: false,
              configurable: false
            });
            return wrapper;
          };
          const addListener = createPluginMethodWrapper("addListener");
          const removeListener = createPluginMethodWrapper("removeListener");
          const addListenerNative = (eventName, callback) => {
            const call = addListener({ eventName }, callback);
            const remove = async () => {
              const callbackId = await call;
              removeListener({
                eventName,
                callbackId
              }, callback);
            };
            const p = new Promise((resolve) => call.then(() => resolve({ remove })));
            p.remove = async () => {
              console.warn(`Using addListener() without 'await' is deprecated.`);
              await remove();
            };
            return p;
          };
          const proxy = new Proxy({}, {
            get(_, prop) {
              switch (prop) {
                // https://github.com/facebook/react/issues/20030
                case "$$typeof":
                  return void 0;
                case "toJSON":
                  return () => ({});
                case "addListener":
                  return pluginHeader ? addListenerNative : addListener;
                case "removeListener":
                  return removeListener;
                default:
                  return createPluginMethodWrapper(prop);
              }
            }
          });
          Plugins[pluginName] = proxy;
          registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: /* @__PURE__ */ new Set([...Object.keys(jsImplementations), ...pluginHeader ? [platform] : []])
          });
          return proxy;
        };
        if (!cap.convertFileSrc) {
          cap.convertFileSrc = (filePath) => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.registerPlugin = registerPlugin2;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        return cap;
      };
      var initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
      var Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      var registerPlugin = Capacitor.registerPlugin;
      var WebPlugin = class {
        constructor() {
          this.listeners = {};
          this.retainedEventArguments = {};
          this.windowListeners = {};
        }
        addListener(eventName, listenerFunc) {
          let firstListener = false;
          const listeners = this.listeners[eventName];
          if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
          }
          this.listeners[eventName].push(listenerFunc);
          const windowListener = this.windowListeners[eventName];
          if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
          }
          if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
          }
          const remove = async () => this.removeListener(eventName, listenerFunc);
          const p = Promise.resolve({ remove });
          return p;
        }
        async removeAllListeners() {
          this.listeners = {};
          for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
          }
          this.windowListeners = {};
        }
        notifyListeners(eventName, data, retainUntilConsumed) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            if (retainUntilConsumed) {
              let args = this.retainedEventArguments[eventName];
              if (!args) {
                args = [];
              }
              args.push(data);
              this.retainedEventArguments[eventName] = args;
            }
            return;
          }
          listeners.forEach((listener) => listener(data));
        }
        hasListeners(eventName) {
          var _a;
          return !!((_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.length);
        }
        registerWindowListener(windowEventName, pluginEventName) {
          this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: (event) => {
              this.notifyListeners(pluginEventName, event);
            }
          };
        }
        unimplemented(msg = "not implemented") {
          return new Capacitor.Exception(msg, exports.ExceptionCode.Unimplemented);
        }
        unavailable(msg = "not available") {
          return new Capacitor.Exception(msg, exports.ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            return;
          }
          const index = listeners.indexOf(listenerFunc);
          if (index !== -1) {
            this.listeners[eventName].splice(index, 1);
          }
          if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
          }
        }
        addWindowListener(handle) {
          window.addEventListener(handle.windowEventName, handle.handler);
          handle.registered = true;
        }
        removeWindowListener(handle) {
          if (!handle) {
            return;
          }
          window.removeEventListener(handle.windowEventName, handle.handler);
          handle.registered = false;
        }
        sendRetainedArgumentsForEvent(eventName) {
          const args = this.retainedEventArguments[eventName];
          if (!args) {
            return;
          }
          delete this.retainedEventArguments[eventName];
          args.forEach((arg) => {
            this.notifyListeners(eventName, arg);
          });
        }
      };
      var WebView = /* @__PURE__ */ registerPlugin("WebView");
      var encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      var decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
      var CapacitorCookiesPluginWeb = class extends WebPlugin {
        async getCookies() {
          const cookies = document.cookie;
          const cookieMap = {};
          cookies.split(";").forEach((cookie) => {
            if (cookie.length <= 0)
              return;
            let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
          });
          return cookieMap;
        }
        async setCookie(options) {
          try {
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            const expires = options.expires ? `; expires=${options.expires.replace("expires=", "")}` : "";
            const path2 = (options.path || "/").replace("path=", "");
            const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
            document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path2}; ${domain};`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async deleteCookie(options) {
          try {
            document.cookie = `${options.key}=; Max-Age=0`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearCookies() {
          try {
            const cookies = document.cookie.split(";") || [];
            for (const cookie of cookies) {
              document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
            }
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearAllCookies() {
          try {
            await this.clearCookies();
          } catch (error) {
            return Promise.reject(error);
          }
        }
      };
      var CapacitorCookies = registerPlugin("CapacitorCookies", {
        web: () => new CapacitorCookiesPluginWeb()
      });
      var readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
      var normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
          acc[key] = headers[originalKeys[index]];
          return acc;
        }, {});
        return normalized;
      };
      var buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
          return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
          const [key, value] = entry;
          let encodedValue;
          let item;
          if (Array.isArray(value)) {
            item = "";
            value.forEach((str) => {
              encodedValue = shouldEncode ? encodeURIComponent(str) : str;
              item += `${key}=${encodedValue}&`;
            });
            item.slice(0, -1);
          } else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
          }
          return `${accumulator}&${item}`;
        }, "");
        return output.substr(1);
      };
      var buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers["content-type"] || "";
        if (typeof options.data === "string") {
          output.body = options.data;
        } else if (type.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
          }
          output.body = params.toString();
        } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
          const form = new FormData();
          if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
              form.append(key, value);
            });
          } else {
            for (const key of Object.keys(options.data)) {
              form.append(key, options.data[key]);
            }
          }
          output.body = form;
          const headers2 = new Headers(output.headers);
          headers2.delete("content-type");
          output.headers = headers2;
        } else if (type.includes("application/json") || typeof options.data === "object") {
          output.body = JSON.stringify(options.data);
        }
        return output;
      };
      var CapacitorHttpPluginWeb = class extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
          const requestInit = buildRequestInit(options, options.webFetchExtra);
          const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
          const url = urlParams ? `${options.url}?${urlParams}` : options.url;
          const response = await fetch(url, requestInit);
          const contentType = response.headers.get("content-type") || "";
          let { responseType = "text" } = response.ok ? options : {};
          if (contentType.includes("application/json")) {
            responseType = "json";
          }
          let data;
          let blob;
          switch (responseType) {
            case "arraybuffer":
            case "blob":
              blob = await response.blob();
              data = await readBlobAsBase64(blob);
              break;
            case "json":
              data = await response.json();
              break;
            case "document":
            case "text":
            default:
              data = await response.text();
          }
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return {
            data,
            headers,
            status: response.status,
            url: response.url
          };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
        }
      };
      var CapacitorHttp = registerPlugin("CapacitorHttp", {
        web: () => new CapacitorHttpPluginWeb()
      });
      exports.SystemBarsStyle = void 0;
      (function(SystemBarsStyle) {
        SystemBarsStyle["Dark"] = "DARK";
        SystemBarsStyle["Light"] = "LIGHT";
        SystemBarsStyle["Default"] = "DEFAULT";
      })(exports.SystemBarsStyle || (exports.SystemBarsStyle = {}));
      exports.SystemBarType = void 0;
      (function(SystemBarType) {
        SystemBarType["StatusBar"] = "StatusBar";
        SystemBarType["NavigationBar"] = "NavigationBar";
      })(exports.SystemBarType || (exports.SystemBarType = {}));
      var SystemBarsPluginWeb = class extends WebPlugin {
        async setStyle() {
          this.unavailable("not available for web");
        }
        async setAnimation() {
          this.unavailable("not available for web");
        }
        async show() {
          this.unavailable("not available for web");
        }
        async hide() {
          this.unavailable("not available for web");
        }
      };
      var SystemBars = registerPlugin("SystemBars", {
        web: () => new SystemBarsPluginWeb()
      });
      exports.Capacitor = Capacitor;
      exports.CapacitorCookies = CapacitorCookies;
      exports.CapacitorException = CapacitorException;
      exports.CapacitorHttp = CapacitorHttp;
      exports.SystemBars = SystemBars;
      exports.WebPlugin = WebPlugin;
      exports.WebView = WebView;
      exports.buildRequestInit = buildRequestInit;
      exports.registerPlugin = registerPlugin;
    }
  });

  // node_modules/@capacitor/synapse/dist/synapse.cjs
  var require_synapse = __commonJS({
    "node_modules/@capacitor/synapse/dist/synapse.cjs"(exports) {
      "use strict";
      Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
      function s(t) {
        t.CapacitorUtils.Synapse = new Proxy({}, { get(a, o) {
          return new Proxy({}, { get(d, n) {
            return (c, p, r) => {
              const e = t.Capacitor.Plugins[o];
              if (e === void 0) {
                r(new Error(`Capacitor plugin ${o} not found`));
                return;
              }
              if (typeof e[n] != "function") {
                r(new Error(`Method ${n} not found in Capacitor plugin ${o}`));
                return;
              }
              (async () => {
                try {
                  const i = await e[n](c);
                  p(i);
                } catch (i) {
                  r(i);
                }
              })();
            };
          } });
        } });
      }
      function u(t) {
        t.CapacitorUtils.Synapse = new Proxy({}, { get(a, o) {
          return t.cordova.plugins[o];
        } });
      }
      function y(t = false) {
        typeof window > "u" || (window.CapacitorUtils = window.CapacitorUtils || {}, window.Capacitor !== void 0 && !t ? s(window) : window.cordova !== void 0 && u(window));
      }
      exports.exposeSynapse = y;
    }
  });

  // node_modules/@capacitor/filesystem/dist/plugin.cjs.js
  var require_plugin_cjs = __commonJS({
    "node_modules/@capacitor/filesystem/dist/plugin.cjs.js"(exports) {
      "use strict";
      var core2 = require_index_cjs();
      var synapse = require_synapse();
      exports.Directory = void 0;
      (function(Directory2) {
        Directory2["Documents"] = "DOCUMENTS";
        Directory2["Data"] = "DATA";
        Directory2["Library"] = "LIBRARY";
        Directory2["Cache"] = "CACHE";
        Directory2["External"] = "EXTERNAL";
        Directory2["ExternalStorage"] = "EXTERNAL_STORAGE";
        Directory2["ExternalCache"] = "EXTERNAL_CACHE";
        Directory2["LibraryNoCloud"] = "LIBRARY_NO_CLOUD";
        Directory2["Temporary"] = "TEMPORARY";
      })(exports.Directory || (exports.Directory = {}));
      exports.Encoding = void 0;
      (function(Encoding) {
        Encoding["UTF8"] = "utf8";
        Encoding["ASCII"] = "ascii";
        Encoding["UTF16"] = "utf16";
      })(exports.Encoding || (exports.Encoding = {}));
      var FilesystemDirectory = exports.Directory;
      var FilesystemEncoding = exports.Encoding;
      var Filesystem2 = core2.registerPlugin("Filesystem", {
        web: () => Promise.resolve().then(function() {
          return web;
        }).then((m) => new m.FilesystemWeb())
      });
      synapse.exposeSynapse();
      function resolve(path2) {
        const posix = path2.split("/").filter((item) => item !== ".");
        const newPosix = [];
        posix.forEach((item) => {
          if (item === ".." && newPosix.length > 0 && newPosix[newPosix.length - 1] !== "..") {
            newPosix.pop();
          } else {
            newPosix.push(item);
          }
        });
        return newPosix.join("/");
      }
      function isPathParent(parent, children) {
        parent = resolve(parent);
        children = resolve(children);
        const pathsA = parent.split("/");
        const pathsB = children.split("/");
        return parent !== children && pathsA.every((value, index) => value === pathsB[index]);
      }
      var FilesystemWeb = class _FilesystemWeb extends core2.WebPlugin {
        constructor() {
          super(...arguments);
          this.DB_VERSION = 1;
          this.DB_NAME = "Disc";
          this._writeCmds = ["add", "put", "delete"];
          this.downloadFile = async (options) => {
            var _a, _b;
            const requestInit = core2.buildRequestInit(options, options.webFetchExtra);
            const response = await fetch(options.url, requestInit);
            let blob;
            if (!options.progress)
              blob = await response.blob();
            else if (!(response === null || response === void 0 ? void 0 : response.body))
              blob = new Blob();
            else {
              const reader = response.body.getReader();
              let bytes = 0;
              const chunks = [];
              const contentType = response.headers.get("content-type");
              const contentLength = parseInt(response.headers.get("content-length") || "0", 10);
              while (true) {
                const { done, value } = await reader.read();
                if (done)
                  break;
                chunks.push(value);
                bytes += (value === null || value === void 0 ? void 0 : value.length) || 0;
                const status = {
                  url: options.url,
                  bytes,
                  contentLength
                };
                this.notifyListeners("progress", status);
              }
              const allChunks = new Uint8Array(bytes);
              let position = 0;
              for (const chunk of chunks) {
                if (typeof chunk === "undefined")
                  continue;
                allChunks.set(chunk, position);
                position += chunk.length;
              }
              blob = new Blob([allChunks.buffer], { type: contentType || void 0 });
            }
            const result = await this.writeFile({
              path: options.path,
              directory: (_a = options.directory) !== null && _a !== void 0 ? _a : void 0,
              recursive: (_b = options.recursive) !== null && _b !== void 0 ? _b : false,
              data: blob
            });
            return { path: result.uri, blob };
          };
        }
        readFileInChunks(_options, _callback) {
          throw this.unavailable("Method not implemented.");
        }
        async initDb() {
          if (this._db !== void 0) {
            return this._db;
          }
          if (!("indexedDB" in window)) {
            throw this.unavailable("This browser doesn't support IndexedDB");
          }
          return new Promise((resolve2, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onupgradeneeded = _FilesystemWeb.doUpgrade;
            request.onsuccess = () => {
              this._db = request.result;
              resolve2(request.result);
            };
            request.onerror = () => reject(request.error);
            request.onblocked = () => {
              console.warn("db blocked");
            };
          });
        }
        static doUpgrade(event) {
          const eventTarget = event.target;
          const db = eventTarget.result;
          switch (event.oldVersion) {
            case 0:
            case 1:
            default: {
              if (db.objectStoreNames.contains("FileStorage")) {
                db.deleteObjectStore("FileStorage");
              }
              const store = db.createObjectStore("FileStorage", { keyPath: "path" });
              store.createIndex("by_folder", "folder");
            }
          }
        }
        async dbRequest(cmd, args) {
          const readFlag = this._writeCmds.indexOf(cmd) !== -1 ? "readwrite" : "readonly";
          return this.initDb().then((conn) => {
            return new Promise((resolve2, reject) => {
              const tx = conn.transaction(["FileStorage"], readFlag);
              const store = tx.objectStore("FileStorage");
              const req = store[cmd](...args);
              req.onsuccess = () => resolve2(req.result);
              req.onerror = () => reject(req.error);
            });
          });
        }
        async dbIndexRequest(indexName, cmd, args) {
          const readFlag = this._writeCmds.indexOf(cmd) !== -1 ? "readwrite" : "readonly";
          return this.initDb().then((conn) => {
            return new Promise((resolve2, reject) => {
              const tx = conn.transaction(["FileStorage"], readFlag);
              const store = tx.objectStore("FileStorage");
              const index = store.index(indexName);
              const req = index[cmd](...args);
              req.onsuccess = () => resolve2(req.result);
              req.onerror = () => reject(req.error);
            });
          });
        }
        getPath(directory, uriPath) {
          const cleanedUriPath = uriPath !== void 0 ? uriPath.replace(/^[/]+|[/]+$/g, "") : "";
          let fsPath = "";
          if (directory !== void 0)
            fsPath += "/" + directory;
          if (uriPath !== "")
            fsPath += "/" + cleanedUriPath;
          return fsPath;
        }
        async clear() {
          const conn = await this.initDb();
          const tx = conn.transaction(["FileStorage"], "readwrite");
          const store = tx.objectStore("FileStorage");
          store.clear();
        }
        /**
         * Read a file from disk
         * @param options options for the file read
         * @return a promise that resolves with the read file data result
         */
        async readFile(options) {
          const path2 = this.getPath(options.directory, options.path);
          const entry = await this.dbRequest("get", [path2]);
          if (entry === void 0)
            throw Error("File does not exist.");
          return { data: entry.content ? entry.content : "" };
        }
        /**
         * Write a file to disk in the specified location on device
         * @param options options for the file write
         * @return a promise that resolves with the file write result
         */
        async writeFile(options) {
          const path2 = this.getPath(options.directory, options.path);
          let data = options.data;
          const encoding = options.encoding;
          const doRecursive = options.recursive;
          const occupiedEntry = await this.dbRequest("get", [path2]);
          if (occupiedEntry && occupiedEntry.type === "directory")
            throw Error("The supplied path is a directory.");
          const parentPath = path2.substr(0, path2.lastIndexOf("/"));
          const parentEntry = await this.dbRequest("get", [parentPath]);
          if (parentEntry === void 0) {
            const subDirIndex = parentPath.indexOf("/", 1);
            if (subDirIndex !== -1) {
              const parentArgPath = parentPath.substr(subDirIndex);
              await this.mkdir({
                path: parentArgPath,
                directory: options.directory,
                recursive: doRecursive
              });
            }
          }
          if (!encoding && !(data instanceof Blob)) {
            data = data.indexOf(",") >= 0 ? data.split(",")[1] : data;
            if (!this.isBase64String(data))
              throw Error("The supplied data is not valid base64 content.");
          }
          const now = Date.now();
          const pathObj = {
            path: path2,
            folder: parentPath,
            type: "file",
            size: data instanceof Blob ? data.size : data.length,
            ctime: now,
            mtime: now,
            content: data
          };
          await this.dbRequest("put", [pathObj]);
          return {
            uri: pathObj.path
          };
        }
        /**
         * Append to a file on disk in the specified location on device
         * @param options options for the file append
         * @return a promise that resolves with the file write result
         */
        async appendFile(options) {
          const path2 = this.getPath(options.directory, options.path);
          let data = options.data;
          const encoding = options.encoding;
          const parentPath = path2.substr(0, path2.lastIndexOf("/"));
          const now = Date.now();
          let ctime = now;
          const occupiedEntry = await this.dbRequest("get", [path2]);
          if (occupiedEntry && occupiedEntry.type === "directory")
            throw Error("The supplied path is a directory.");
          const parentEntry = await this.dbRequest("get", [parentPath]);
          if (parentEntry === void 0) {
            const subDirIndex = parentPath.indexOf("/", 1);
            if (subDirIndex !== -1) {
              const parentArgPath = parentPath.substr(subDirIndex);
              await this.mkdir({
                path: parentArgPath,
                directory: options.directory,
                recursive: true
              });
            }
          }
          if (!encoding && !this.isBase64String(data))
            throw Error("The supplied data is not valid base64 content.");
          if (occupiedEntry !== void 0) {
            if (occupiedEntry.content instanceof Blob) {
              throw Error("The occupied entry contains a Blob object which cannot be appended to.");
            }
            if (occupiedEntry.content !== void 0 && !encoding) {
              data = btoa(atob(occupiedEntry.content) + atob(data));
            } else {
              data = occupiedEntry.content + data;
            }
            ctime = occupiedEntry.ctime;
          }
          const pathObj = {
            path: path2,
            folder: parentPath,
            type: "file",
            size: data.length,
            ctime,
            mtime: now,
            content: data
          };
          await this.dbRequest("put", [pathObj]);
        }
        /**
         * Delete a file from disk
         * @param options options for the file delete
         * @return a promise that resolves with the deleted file data result
         */
        async deleteFile(options) {
          const path2 = this.getPath(options.directory, options.path);
          const entry = await this.dbRequest("get", [path2]);
          if (entry === void 0)
            throw Error("File does not exist.");
          const entries = await this.dbIndexRequest("by_folder", "getAllKeys", [IDBKeyRange.only(path2)]);
          if (entries.length !== 0)
            throw Error("Folder is not empty.");
          await this.dbRequest("delete", [path2]);
        }
        /**
         * Create a directory.
         * @param options options for the mkdir
         * @return a promise that resolves with the mkdir result
         */
        async mkdir(options) {
          const path2 = this.getPath(options.directory, options.path);
          const doRecursive = options.recursive;
          const parentPath = path2.substr(0, path2.lastIndexOf("/"));
          const depth = (path2.match(/\//g) || []).length;
          const parentEntry = await this.dbRequest("get", [parentPath]);
          const occupiedEntry = await this.dbRequest("get", [path2]);
          if (depth === 1)
            throw Error("Cannot create Root directory");
          if (occupiedEntry !== void 0)
            throw Error("Current directory does already exist.");
          if (!doRecursive && depth !== 2 && parentEntry === void 0)
            throw Error("Parent directory must exist");
          if (doRecursive && depth !== 2 && parentEntry === void 0) {
            const parentArgPath = parentPath.substr(parentPath.indexOf("/", 1));
            await this.mkdir({
              path: parentArgPath,
              directory: options.directory,
              recursive: doRecursive
            });
          }
          const now = Date.now();
          const pathObj = {
            path: path2,
            folder: parentPath,
            type: "directory",
            size: 0,
            ctime: now,
            mtime: now
          };
          await this.dbRequest("put", [pathObj]);
        }
        /**
         * Remove a directory
         * @param options the options for the directory remove
         */
        async rmdir(options) {
          const { path: path2, directory, recursive } = options;
          const fullPath = this.getPath(directory, path2);
          const entry = await this.dbRequest("get", [fullPath]);
          if (entry === void 0)
            throw Error("Folder does not exist.");
          if (entry.type !== "directory")
            throw Error("Requested path is not a directory");
          const readDirResult = await this.readdir({ path: path2, directory });
          if (readDirResult.files.length !== 0 && !recursive)
            throw Error("Folder is not empty");
          for (const entry2 of readDirResult.files) {
            const entryPath = `${path2}/${entry2.name}`;
            const entryObj = await this.stat({ path: entryPath, directory });
            if (entryObj.type === "file") {
              await this.deleteFile({ path: entryPath, directory });
            } else {
              await this.rmdir({ path: entryPath, directory, recursive });
            }
          }
          await this.dbRequest("delete", [fullPath]);
        }
        /**
         * Return a list of files from the directory (not recursive)
         * @param options the options for the readdir operation
         * @return a promise that resolves with the readdir directory listing result
         */
        async readdir(options) {
          const path2 = this.getPath(options.directory, options.path);
          const entry = await this.dbRequest("get", [path2]);
          if (options.path !== "" && entry === void 0)
            throw Error("Folder does not exist.");
          const entries = await this.dbIndexRequest("by_folder", "getAllKeys", [IDBKeyRange.only(path2)]);
          const files = await Promise.all(entries.map(async (e) => {
            let subEntry = await this.dbRequest("get", [e]);
            if (subEntry === void 0) {
              subEntry = await this.dbRequest("get", [e + "/"]);
            }
            return {
              name: e.substring(path2.length + 1),
              type: subEntry.type,
              size: subEntry.size,
              ctime: subEntry.ctime,
              mtime: subEntry.mtime,
              uri: subEntry.path
            };
          }));
          return { files };
        }
        /**
         * Return full File URI for a path and directory
         * @param options the options for the stat operation
         * @return a promise that resolves with the file stat result
         */
        async getUri(options) {
          const path2 = this.getPath(options.directory, options.path);
          let entry = await this.dbRequest("get", [path2]);
          if (entry === void 0) {
            entry = await this.dbRequest("get", [path2 + "/"]);
          }
          return {
            uri: (entry === null || entry === void 0 ? void 0 : entry.path) || path2
          };
        }
        /**
         * Return data about a file
         * @param options the options for the stat operation
         * @return a promise that resolves with the file stat result
         */
        async stat(options) {
          const path2 = this.getPath(options.directory, options.path);
          let entry = await this.dbRequest("get", [path2]);
          if (entry === void 0) {
            entry = await this.dbRequest("get", [path2 + "/"]);
          }
          if (entry === void 0)
            throw Error("Entry does not exist.");
          return {
            name: entry.path.substring(path2.length + 1),
            type: entry.type,
            size: entry.size,
            ctime: entry.ctime,
            mtime: entry.mtime,
            uri: entry.path
          };
        }
        /**
         * Rename a file or directory
         * @param options the options for the rename operation
         * @return a promise that resolves with the rename result
         */
        async rename(options) {
          await this._copy(options, true);
          return;
        }
        /**
         * Copy a file or directory
         * @param options the options for the copy operation
         * @return a promise that resolves with the copy result
         */
        async copy(options) {
          return this._copy(options, false);
        }
        async requestPermissions() {
          return { publicStorage: "granted" };
        }
        async checkPermissions() {
          return { publicStorage: "granted" };
        }
        /**
         * Function that can perform a copy or a rename
         * @param options the options for the rename operation
         * @param doRename whether to perform a rename or copy operation
         * @return a promise that resolves with the result
         */
        async _copy(options, doRename = false) {
          let { toDirectory } = options;
          const { to, from, directory: fromDirectory } = options;
          if (!to || !from) {
            throw Error("Both to and from must be provided");
          }
          if (!toDirectory) {
            toDirectory = fromDirectory;
          }
          const fromPath = this.getPath(fromDirectory, from);
          const toPath = this.getPath(toDirectory, to);
          if (fromPath === toPath) {
            return {
              uri: toPath
            };
          }
          if (isPathParent(fromPath, toPath)) {
            throw Error("To path cannot contain the from path");
          }
          let toObj;
          try {
            toObj = await this.stat({
              path: to,
              directory: toDirectory
            });
          } catch (e) {
            const toPathComponents = to.split("/");
            toPathComponents.pop();
            const toPath2 = toPathComponents.join("/");
            if (toPathComponents.length > 0) {
              const toParentDirectory = await this.stat({
                path: toPath2,
                directory: toDirectory
              });
              if (toParentDirectory.type !== "directory") {
                throw new Error("Parent directory of the to path is a file");
              }
            }
          }
          if (toObj && toObj.type === "directory") {
            throw new Error("Cannot overwrite a directory with a file");
          }
          const fromObj = await this.stat({
            path: from,
            directory: fromDirectory
          });
          const updateTime = async (path2, ctime2, mtime) => {
            const fullPath = this.getPath(toDirectory, path2);
            const entry = await this.dbRequest("get", [fullPath]);
            entry.ctime = ctime2;
            entry.mtime = mtime;
            await this.dbRequest("put", [entry]);
          };
          const ctime = fromObj.ctime ? fromObj.ctime : Date.now();
          switch (fromObj.type) {
            // The "from" object is a file
            case "file": {
              const file = await this.readFile({
                path: from,
                directory: fromDirectory
              });
              if (doRename) {
                await this.deleteFile({
                  path: from,
                  directory: fromDirectory
                });
              }
              let encoding;
              if (!(file.data instanceof Blob) && !this.isBase64String(file.data)) {
                encoding = exports.Encoding.UTF8;
              }
              const writeResult = await this.writeFile({
                path: to,
                directory: toDirectory,
                data: file.data,
                encoding
              });
              if (doRename) {
                await updateTime(to, ctime, fromObj.mtime);
              }
              return writeResult;
            }
            case "directory": {
              if (toObj) {
                throw Error("Cannot move a directory over an existing object");
              }
              try {
                await this.mkdir({
                  path: to,
                  directory: toDirectory,
                  recursive: false
                });
                if (doRename) {
                  await updateTime(to, ctime, fromObj.mtime);
                }
              } catch (e) {
              }
              const contents = (await this.readdir({
                path: from,
                directory: fromDirectory
              })).files;
              for (const filename of contents) {
                await this._copy({
                  from: `${from}/${filename.name}`,
                  to: `${to}/${filename.name}`,
                  directory: fromDirectory,
                  toDirectory
                }, doRename);
              }
              if (doRename) {
                await this.rmdir({
                  path: from,
                  directory: fromDirectory
                });
              }
            }
          }
          return {
            uri: toPath
          };
        }
        isBase64String(str) {
          try {
            return btoa(atob(str)) == str;
          } catch (err) {
            return false;
          }
        }
      };
      FilesystemWeb._debug = true;
      var web = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        FilesystemWeb
      });
      exports.Filesystem = Filesystem2;
      exports.FilesystemDirectory = FilesystemDirectory;
      exports.FilesystemEncoding = FilesystemEncoding;
    }
  });

  // node_modules/@capacitor/app/dist/plugin.cjs.js
  var require_plugin_cjs2 = __commonJS({
    "node_modules/@capacitor/app/dist/plugin.cjs.js"(exports) {
      "use strict";
      var core2 = require_index_cjs();
      var App2 = core2.registerPlugin("App", {
        web: () => Promise.resolve().then(function() {
          return web;
        }).then((m) => new m.AppWeb())
      });
      var AppWeb = class extends core2.WebPlugin {
        constructor() {
          super();
          this.handleVisibilityChange = () => {
            const data = {
              isActive: document.hidden !== true
            };
            this.notifyListeners("appStateChange", data);
            if (document.hidden) {
              this.notifyListeners("pause", null);
            } else {
              this.notifyListeners("resume", null);
            }
          };
          document.addEventListener("visibilitychange", this.handleVisibilityChange, false);
        }
        exitApp() {
          throw this.unimplemented("Not implemented on web.");
        }
        async getInfo() {
          throw this.unimplemented("Not implemented on web.");
        }
        async getLaunchUrl() {
          return { url: "" };
        }
        async getState() {
          return { isActive: document.hidden !== true };
        }
        async minimizeApp() {
          throw this.unimplemented("Not implemented on web.");
        }
        async toggleBackButtonHandler() {
          throw this.unimplemented("Not implemented on web.");
        }
        async getAppLanguage() {
          return {
            value: navigator.language.split("-")[0].toLowerCase()
          };
        }
      };
      var web = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        AppWeb
      });
      exports.App = App2;
    }
  });

  // shim/path.js
  var require_path = __commonJS({
    "shim/path.js"(exports, module) {
      "use strict";
      function normalizeParts(p) {
        const out = [];
        for (const s of p.split("/")) {
          if (!s || s === ".") continue;
          if (s === "..") out.pop();
          else out.push(s);
        }
        return out;
      }
      var isAbsolute = (p) => String(p).startsWith("/");
      var resolve = (...args) => {
        let r = "";
        for (let i = args.length - 1; i >= 0 && !isAbsolute(r); i--) {
          const a = String(args[i]);
          if (a) r = a + (r ? "/" + r : "");
        }
        if (!isAbsolute(r)) r = "/" + r;
        return "/" + normalizeParts(r).join("/");
      };
      var normalize = (p) => {
        p = String(p);
        const abs = isAbsolute(p), parts = normalizeParts(p).join("/");
        return (abs ? "/" : "") + parts || (abs ? "/" : ".");
      };
      var join = (...args) => normalize(args.filter((a) => String(a)).join("/") || ".");
      var dirname = (p) => {
        p = String(p);
        if (/^\/+$/.test(p)) return "/";
        p = p.replace(/\/+$/, "");
        const i = p.lastIndexOf("/");
        return i < 0 ? "." : i === 0 ? "/" : p.slice(0, i);
      };
      var basename = (p, ext) => {
        p = String(p).replace(/\/+$/, "");
        let b = p.slice(p.lastIndexOf("/") + 1);
        if (ext && b.endsWith(ext) && b !== ext) b = b.slice(0, -ext.length);
        return b;
      };
      var extname = (p) => {
        const b = basename(p), i = b.lastIndexOf(".");
        return i <= 0 ? "" : b.slice(i);
      };
      module.exports = { sep: "/", isAbsolute, resolve, normalize, join, dirname, basename, extname };
    }
  });

  // shim/fs-vfs.js
  var require_fs_vfs = __commonJS({
    "shim/fs-vfs.js"(exports, module) {
      "use strict";
      var path2 = require_path();
      var files = /* @__PURE__ */ new Map();
      var mtimes = /* @__PURE__ */ new Map();
      var dirs = /* @__PURE__ */ new Set(["/"]);
      var listeners = /* @__PURE__ */ new Set();
      var enoent = (p, op) => Object.assign(new Error(`ENOENT: no such file or directory, ${op} '${p}'`), { code: "ENOENT", path: p });
      var norm = (p) => path2.resolve(String(p));
      var changed = (op, p) => {
        for (const f of listeners) {
          try {
            f({ op, path: p });
          } catch {
          }
        }
      };
      var toBytes = (d) => typeof d === "string" ? new TextEncoder().encode(d) : d instanceof Uint8Array ? new Uint8Array(d) : new Uint8Array(d.buffer ? d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength) : d);
      var asBuffer = (u8) => typeof Buffer !== "undefined" ? Buffer.from(u8.buffer, u8.byteOffset, u8.length) : u8;
      function mkdirSync(p, o = {}) {
        p = norm(p);
        if (dirs.has(p)) return;
        const parent = path2.dirname(p);
        if (!dirs.has(parent)) {
          if (o.recursive) mkdirSync(parent, o);
          else throw enoent(parent, "mkdir");
        }
        dirs.add(p);
        changed("mkdir", p);
      }
      function writeFileSync(p, data) {
        p = norm(p);
        const parent = path2.dirname(p);
        if (!dirs.has(parent)) throw enoent(p, "open");
        files.set(p, toBytes(data));
        mtimes.set(p, Date.now());
        changed("write", p);
      }
      function readFileSync(p, enc) {
        p = norm(p);
        const b = files.get(p);
        if (!b) throw enoent(p, "open");
        if (enc) {
          if (!/^utf-?8$/i.test(typeof enc === "string" ? enc : enc.encoding)) throw new Error("codifica\xE7\xE3o n\xE3o suportada");
          return new TextDecoder().decode(b);
        }
        return asBuffer(new Uint8Array(b));
      }
      var existsSync = (p) => {
        p = norm(p);
        return files.has(p) || dirs.has(p);
      };
      function renameSync(a, b) {
        a = norm(a);
        b = norm(b);
        const d = files.get(a);
        if (!d) throw enoent(a, "rename");
        if (!dirs.has(path2.dirname(b))) throw enoent(b, "rename");
        const mt = mtimes.get(a);
        files.delete(a);
        mtimes.delete(a);
        files.set(b, d);
        mtimes.set(b, mt || Date.now());
        changed("delete", a);
        changed("write", b);
      }
      function rmSync(p, o = {}) {
        p = norm(p);
        if (files.delete(p)) {
          mtimes.delete(p);
          changed("delete", p);
          return;
        }
        if (dirs.has(p)) {
          const pre = p === "/" ? "/" : p + "/";
          if (!o.recursive && [...files.keys(), ...dirs].some((k) => k !== p && k.startsWith(pre))) throw new Error(`ENOTEMPTY: ${p}`);
          for (const k of [...files.keys()]) if (k.startsWith(pre)) {
            files.delete(k);
            mtimes.delete(k);
            changed("delete", k);
          }
          for (const k of [...dirs]) if (k !== "/" && (k === p || k.startsWith(pre))) {
            dirs.delete(k);
            changed("delete", k);
          }
          return;
        }
        if (!o.force) throw enoent(p, "rm");
      }
      function readdirSync(p, o = {}) {
        p = norm(p);
        if (!dirs.has(p)) throw enoent(p, "scandir");
        const pre = p === "/" ? "/" : p + "/", names = /* @__PURE__ */ new Map();
        for (const k of files.keys()) if (k.startsWith(pre) && !k.slice(pre.length).includes("/")) names.set(k.slice(pre.length), false);
        for (const k of dirs) if (k !== p && k.startsWith(pre) && !k.slice(pre.length).includes("/")) names.set(k.slice(pre.length), true);
        const list = [...names.entries()].sort((a, b) => a[0].localeCompare(b[0]));
        return o.withFileTypes ? list.map(([name, isDir]) => ({ name, isDirectory: () => isDir, isFile: () => !isDir })) : list.map(([n]) => n);
      }
      function statSync(p) {
        p = norm(p);
        const f = files.get(p);
        if (f) return { isFile: () => true, isDirectory: () => false, size: f.length, mtimeMs: mtimes.get(p) || 0 };
        if (dirs.has(p)) return { isFile: () => false, isDirectory: () => true, size: 0, mtimeMs: 0 };
        throw enoent(p, "stat");
      }
      function copyFileSync(a, b) {
        a = norm(a);
        const d = files.get(a);
        if (!d) throw enoent(a, "copyfile");
        writeFileSync(b, d);
      }
      function utimesSync(p, _atime, mtime) {
        p = norm(p);
        if (!files.has(p)) throw enoent(p, "utime");
        const ms = mtime instanceof Date ? mtime.getTime() : Number(mtime) < 1e11 ? Number(mtime) * 1e3 : Number(mtime);
        mtimes.set(p, Number.isFinite(ms) ? ms : Date.now());
      }
      var vfs = {
        snapshot: () => ({ files: [...files].map(([k, v]) => [k, Array.from(v)]), dirs: [...dirs] }),
        restore: (s) => {
          files.clear();
          mtimes.clear();
          dirs.clear();
          dirs.add("/");
          for (const d of s.dirs || []) dirs.add(d);
          for (const [k, v] of s.files || []) files.set(k, new Uint8Array(v));
        },
        onChange: (cb) => {
          listeners.add(cb);
          return () => listeners.delete(cb);
        },
        clear: () => {
          files.clear();
          mtimes.clear();
          dirs.clear();
          dirs.add("/");
        },
        /** Acesso cru (sem cópia) para a camada que persiste no armazenamento do aparelho. */
        rawGet: (p) => files.get(norm(p)),
        rawMtime: (p) => mtimes.get(norm(p)) || 0,
        /** Carrega de uma vez (restauração ao abrir o app): entries = [[caminho, Uint8Array, mtime]], dirList = [caminho]. Não dispara onChange. */
        loadRaw: (entries, dirList) => {
          files.clear();
          mtimes.clear();
          dirs.clear();
          dirs.add("/");
          for (const d of dirList || []) dirs.add(d);
          for (const [k, v, mt] of entries || []) {
            files.set(k, v);
            if (mt) mtimes.set(k, mt);
          }
        },
        paths: () => ({ files: [...files.keys()], dirs: [...dirs] })
      };
      module.exports = { mkdirSync, writeFileSync, readFileSync, existsSync, renameSync, rmSync, readdirSync, statSync, copyFileSync, utimesSync, unlinkSync: (p) => rmSync(p), vfs };
    }
  });

  // node_modules/@capacitor/share/dist/plugin.cjs.js
  var require_plugin_cjs3 = __commonJS({
    "node_modules/@capacitor/share/dist/plugin.cjs.js"(exports) {
      "use strict";
      var core2 = require_index_cjs();
      var Share = core2.registerPlugin("Share", {
        web: () => Promise.resolve().then(function() {
          return web;
        }).then((m) => new m.ShareWeb())
      });
      var ShareWeb = class extends core2.WebPlugin {
        async canShare() {
          if (typeof navigator === "undefined" || !navigator.share) {
            return { value: false };
          } else {
            return { value: true };
          }
        }
        async share(options) {
          if (typeof navigator === "undefined" || !navigator.share) {
            throw this.unavailable("Share API not available in this browser");
          }
          await navigator.share({
            title: options.title,
            text: options.text,
            url: options.url
          });
          return {};
        }
      };
      var web = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        ShareWeb
      });
      exports.Share = Share;
    }
  });

  // node_modules/@capacitor/clipboard/dist/plugin.cjs.js
  var require_plugin_cjs4 = __commonJS({
    "node_modules/@capacitor/clipboard/dist/plugin.cjs.js"(exports) {
      "use strict";
      var core2 = require_index_cjs();
      var ClipboardWeb = class extends core2.WebPlugin {
        async write(options) {
          if (typeof navigator === "undefined" || !navigator.clipboard) {
            throw this.unavailable("Clipboard API not available in this browser");
          }
          if (options.string !== void 0) {
            await this.writeText(options.string);
          } else if (options.url) {
            await this.writeText(options.url);
          } else if (options.image) {
            if (typeof ClipboardItem !== "undefined") {
              try {
                const blob = await (await fetch(options.image)).blob();
                const clipboardItemInput = new ClipboardItem({ [blob.type]: blob });
                await navigator.clipboard.write([clipboardItemInput]);
              } catch (err) {
                throw new Error("Failed to write image");
              }
            } else {
              throw this.unavailable("Writing images to the clipboard is not supported in this browser");
            }
          } else {
            throw new Error("Nothing to write");
          }
        }
        async read() {
          if (typeof navigator === "undefined" || !navigator.clipboard) {
            throw this.unavailable("Clipboard API not available in this browser");
          }
          if (typeof ClipboardItem !== "undefined") {
            try {
              const clipboardItems = await navigator.clipboard.read();
              const type = clipboardItems[0].types[0];
              const clipboardBlob = await clipboardItems[0].getType(type);
              const data = await this._getBlobData(clipboardBlob, type);
              return { value: data, type };
            } catch (err) {
              return this.readText();
            }
          } else {
            return this.readText();
          }
        }
        async readText() {
          if (typeof navigator === "undefined" || !navigator.clipboard || !navigator.clipboard.readText) {
            throw this.unavailable("Reading from clipboard not supported in this browser");
          }
          const text = await navigator.clipboard.readText();
          return { value: text, type: "text/plain" };
        }
        async writeText(text) {
          if (typeof navigator === "undefined" || !navigator.clipboard || !navigator.clipboard.writeText) {
            throw this.unavailable("Writting to clipboard not supported in this browser");
          }
          await navigator.clipboard.writeText(text);
        }
        _getBlobData(clipboardBlob, type) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            if (type.includes("image")) {
              reader.readAsDataURL(clipboardBlob);
            } else {
              reader.readAsText(clipboardBlob);
            }
            reader.onloadend = () => {
              const r = reader.result;
              resolve(r);
            };
            reader.onerror = (e) => {
              reject(e);
            };
          });
        }
      };
      var Clipboard = core2.registerPlugin("Clipboard", {
        web: () => new ClipboardWeb()
      });
      exports.Clipboard = Clipboard;
    }
  });

  // node_modules/@capacitor/browser/dist/plugin.cjs.js
  var require_plugin_cjs5 = __commonJS({
    "node_modules/@capacitor/browser/dist/plugin.cjs.js"(exports) {
      "use strict";
      var core2 = require_index_cjs();
      var Browser = core2.registerPlugin("Browser", {
        web: () => Promise.resolve().then(function() {
          return web;
        }).then((m) => new m.BrowserWeb())
      });
      var BrowserWeb = class extends core2.WebPlugin {
        constructor() {
          super();
          this._lastWindow = null;
        }
        async open(options) {
          this._lastWindow = window.open(options.url, options.windowName || "_blank");
        }
        async close() {
          return new Promise((resolve, reject) => {
            if (this._lastWindow != null) {
              this._lastWindow.close();
              this._lastWindow = null;
              resolve();
            } else {
              reject("No active window to close!");
            }
          });
        }
      };
      new BrowserWeb();
      var web = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        BrowserWeb
      });
      exports.Browser = Browser;
    }
  });

  // node_modules/@capawesome/capacitor-file-picker/dist/plugin.cjs.js
  var require_plugin_cjs6 = __commonJS({
    "node_modules/@capawesome/capacitor-file-picker/dist/plugin.cjs.js"(exports) {
      "use strict";
      var core2 = require_index_cjs();
      var FilePickerWeb = class extends core2.WebPlugin {
        constructor() {
          super(...arguments);
          this.ERROR_PICK_FILE_CANCELED = "pickFiles canceled.";
        }
        async checkPermissions() {
          throw this.unimplemented("Not implemented on web.");
        }
        async convertHeicToJpeg(_options) {
          throw this.unimplemented("Not implemented on web.");
        }
        async convertRawToJpeg(_options) {
          throw this.unimplemented("Not implemented on web.");
        }
        async copyFile(_options) {
          throw this.unimplemented("Not implemented on web.");
        }
        async pickFiles(options) {
          const pickedFiles = await this.openFilePicker(options);
          if (!pickedFiles) {
            throw new Error(this.ERROR_PICK_FILE_CANCELED);
          }
          const result = {
            files: []
          };
          for (const pickedFile of pickedFiles) {
            const file = {
              blob: pickedFile,
              modifiedAt: pickedFile.lastModified,
              mimeType: this.getMimeTypeFromUrl(pickedFile),
              name: this.getNameFromUrl(pickedFile),
              path: void 0,
              size: this.getSizeFromUrl(pickedFile),
              webPath: URL.createObjectURL(pickedFile)
            };
            if (options === null || options === void 0 ? void 0 : options.readData) {
              file.data = await this.getDataFromFile(pickedFile);
            }
            result.files.push(file);
          }
          return result;
        }
        async pickDirectory() {
          throw this.unimplemented("Not implemented on web.");
        }
        async pickImages(options) {
          return this.pickFiles(Object.assign({ types: ["image/*"] }, options));
        }
        async pickMedia(options) {
          return this.pickFiles(Object.assign({ types: ["image/*", "video/*"] }, options));
        }
        async pickVideos(options) {
          return this.pickFiles(Object.assign({ types: ["video/*"] }, options));
        }
        async requestPermissions(_options) {
          throw this.unimplemented("Not implemented on web.");
        }
        async openFilePicker(options) {
          var _a;
          const accept = ((_a = options === null || options === void 0 ? void 0 : options.types) === null || _a === void 0 ? void 0 : _a.join(",")) || "";
          const limit = (options === null || options === void 0 ? void 0 : options.limit) === void 0 ? 0 : options.limit;
          return new Promise((resolve) => {
            let onChangeFired = false;
            const input = document.createElement("input");
            input.type = "file";
            input.accept = accept;
            input.multiple = limit === 0;
            const hasCancelEvent = "oncancel" in input;
            const onChangeHandler = () => {
              onChangeFired = true;
              removeAllListeners();
              const files = Array.from(input.files || []);
              resolve(files);
            };
            const onCancelHandler = () => {
              removeAllListeners();
              resolve(void 0);
            };
            const onFocusHandler = async () => {
              await this.wait(500);
              if (onChangeFired) {
                return;
              }
              removeAllListeners();
              resolve(void 0);
            };
            const removeAllListeners = () => {
              input.removeEventListener("change", onChangeHandler);
              if (hasCancelEvent) {
                input.removeEventListener("cancel", onCancelHandler);
              } else {
                window.removeEventListener("focus", onFocusHandler);
              }
            };
            input.addEventListener("change", onChangeHandler, { once: true });
            if (hasCancelEvent) {
              input.addEventListener("cancel", onCancelHandler, { once: true });
            } else {
              window.addEventListener("focus", onFocusHandler, { once: true });
            }
            input.click();
          });
        }
        async getDataFromFile(file) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              const result = typeof reader.result === "string" ? reader.result : "";
              const splittedResult = result.split("base64,");
              const base64 = splittedResult[1] || "";
              resolve(base64);
            };
            reader.onerror = (error) => {
              reject(error);
            };
          });
        }
        getNameFromUrl(file) {
          return file.name;
        }
        getMimeTypeFromUrl(file) {
          return file.type;
        }
        getSizeFromUrl(file) {
          return file.size;
        }
        async wait(delayMs) {
          return new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      };
      var FilePicker = core2.registerPlugin("FilePicker", {
        web: () => new FilePickerWeb()
      });
      exports.FilePicker = FilePicker;
    }
  });

  // node_modules/@aparajita/capacitor-secure-storage/dist/plugin.cjs
  var require_plugin = __commonJS({
    "node_modules/@aparajita/capacitor-secure-storage/dist/plugin.cjs"(exports) {
      "use strict";
      var core2 = require_index_cjs();
      exports.StorageErrorType = void 0;
      (function(StorageErrorType) {
        StorageErrorType["missingKey"] = "missingKey";
        StorageErrorType["invalidData"] = "invalidData";
        StorageErrorType["osError"] = "osError";
        StorageErrorType["unknownError"] = "unknownError";
        StorageErrorType["missingPrefix"] = "missingPrefix";
      })(exports.StorageErrorType || (exports.StorageErrorType = {}));
      exports.KeychainAccess = void 0;
      (function(KeychainAccess) {
        KeychainAccess[KeychainAccess["whenUnlocked"] = 0] = "whenUnlocked";
        KeychainAccess[KeychainAccess["whenUnlockedThisDeviceOnly"] = 1] = "whenUnlockedThisDeviceOnly";
        KeychainAccess[KeychainAccess["afterFirstUnlock"] = 2] = "afterFirstUnlock";
        KeychainAccess[KeychainAccess["afterFirstUnlockThisDeviceOnly"] = 3] = "afterFirstUnlockThisDeviceOnly";
        KeychainAccess[KeychainAccess["whenPasscodeSetThisDeviceOnly"] = 4] = "whenPasscodeSetThisDeviceOnly";
      })(exports.KeychainAccess || (exports.KeychainAccess = {}));
      var StorageError = class extends Error {
        constructor(message, code) {
          super(message);
          this.name = "StorageError";
          this.code = code;
        }
      };
      var proxy = core2.registerPlugin("SecureStorage", {
        web: async () => {
          const module2 = await Promise.resolve().then(function() {
            return web;
          });
          return new module2.SecureStorageWeb();
        },
        ios: async () => {
          const module2 = await Promise.resolve().then(function() {
            return native;
          });
          return new module2.SecureStorageNative(proxy);
        },
        android: async () => {
          const module2 = await Promise.resolve().then(function() {
            return native;
          });
          return new module2.SecureStorageNative(proxy);
        }
      });
      function isStorageErrorType(value) {
        return value !== void 0 && Object.keys(exports.StorageErrorType).includes(value);
      }
      var SecureStorageBase = class _SecureStorageBase extends core2.WebPlugin {
        constructor() {
          super(...arguments);
          this.prefix = "capacitor-storage_";
          this.sync = false;
          this.access = exports.KeychainAccess.whenUnlocked;
        }
        async setSynchronize(sync) {
          this.sync = sync;
          if (core2.Capacitor.getPlatform() === "ios") {
            return this.setSynchronizeKeychain({ sync });
          }
        }
        async getSynchronize() {
          return this.sync;
        }
        async setDefaultKeychainAccess(access) {
          this.access = access;
        }
        async tryOperation(operation) {
          try {
            return await operation();
          } catch (error) {
            if (error instanceof core2.CapacitorException && isStorageErrorType(error.code)) {
              throw new StorageError(error.message, error.code);
            }
            throw error;
          }
        }
        async get(key, convertDate = true, sync) {
          if (key) {
            const { data } = await this.tryOperation(async () => this.internalGetItem({
              prefixedKey: this.prefixedKey(key),
              sync: sync !== null && sync !== void 0 ? sync : this.sync
            }));
            if (data === null) {
              return null;
            }
            if (convertDate) {
              const date = parseISODate(data);
              if (date) {
                return date;
              }
            }
            try {
              return JSON.parse(data);
            } catch (_a) {
              throw new StorageError("Invalid data", exports.StorageErrorType.invalidData);
            }
          }
          return _SecureStorageBase.missingKey();
        }
        async getItem(key) {
          if (key) {
            const { data } = await this.tryOperation(async () => this.internalGetItem({
              prefixedKey: this.prefixedKey(key),
              sync: this.sync
            }));
            return data;
          }
          return null;
        }
        async set(key, data, convertDate = true, sync, access) {
          if (key) {
            let convertedData = data;
            if (convertDate && data instanceof Date) {
              convertedData = data.toISOString();
            }
            return this.tryOperation(async () => this.internalSetItem({
              prefixedKey: this.prefixedKey(key),
              data: JSON.stringify(convertedData),
              sync: sync !== null && sync !== void 0 ? sync : this.sync,
              access: access !== null && access !== void 0 ? access : this.access
            }));
          }
          return _SecureStorageBase.missingKey();
        }
        async setItem(key, value) {
          if (key) {
            return this.tryOperation(async () => this.internalSetItem({
              prefixedKey: this.prefixedKey(key),
              data: value,
              sync: this.sync,
              access: this.access
            }));
          }
          return _SecureStorageBase.missingKey();
        }
        async remove(key, sync) {
          if (key) {
            const { success } = await this.tryOperation(async () => this.internalRemoveItem({
              prefixedKey: this.prefixedKey(key),
              sync: sync !== null && sync !== void 0 ? sync : this.sync
            }));
            return success;
          }
          return _SecureStorageBase.missingKey();
        }
        async removeItem(key) {
          if (key) {
            await this.tryOperation(async () => this.internalRemoveItem({
              prefixedKey: this.prefixedKey(key),
              sync: this.sync
            }));
            return;
          }
          _SecureStorageBase.missingKey();
        }
        async clearItemsWithPrefix(options) {
          const prefix = this.checkPrefix(options.prefix);
          await this.tryOperation(async () => this.internalClearItemsWithPrefix({
            prefix,
            sync: this.sync
          }));
        }
        checkPrefix(prefix) {
          if (prefix.trim().length === 0) {
            throw new StorageError("Non-blank prefix provided", exports.StorageErrorType.missingPrefix);
          }
          return prefix;
        }
        async keys(sync) {
          const { keys } = await this.tryOperation(async () => this.internalGetPrefixedKeys({
            prefix: this.prefix,
            sync: sync !== null && sync !== void 0 ? sync : this.sync
          }));
          const prefixLength = this.prefix.length;
          return keys.map((key) => key.slice(prefixLength));
        }
        async getKeyPrefix() {
          return this.prefix;
        }
        async setKeyPrefix(prefix) {
          this.prefix = this.checkPrefix(prefix);
        }
        prefixedKey(key) {
          return this.prefix + key;
        }
        static missingKey() {
          throw new StorageError("No key provided", exports.StorageErrorType.missingKey);
        }
      };
      var isoDateRE = /^"(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}).(\d{3})Z"$/u;
      function parseISODate(isoDate) {
        const match = isoDateRE.exec(isoDate);
        if (match) {
          const year = Number.parseInt(match[1], 10);
          const month = Number.parseInt(match[2], 10) - 1;
          const day = Number.parseInt(match[3], 10);
          const hour = Number.parseInt(match[4], 10);
          const minute = Number.parseInt(match[5], 10);
          const second = Number.parseInt(match[6], 10);
          const millis = Number.parseInt(match[7], 10);
          const epochTime = Date.UTC(year, month, day, hour, minute, second, millis);
          return new Date(epochTime);
        }
        return null;
      }
      var SecureStorageWeb = class extends SecureStorageBase {
        // @native
        async setSynchronizeKeychain(_options) {
        }
        // @native
        // eslint-disable-next-line @typescript-eslint/require-await
        async internalGetItem(options) {
          return { data: localStorage.getItem(options.prefixedKey) };
        }
        // @native
        // eslint-disable-next-line @typescript-eslint/require-await
        async internalSetItem(options) {
          localStorage.setItem(options.prefixedKey, options.data);
        }
        // @native
        // eslint-disable-next-line @typescript-eslint/require-await
        async internalRemoveItem(options) {
          const item = localStorage.getItem(options.prefixedKey);
          if (item !== null) {
            localStorage.removeItem(options.prefixedKey);
            return { success: true };
          }
          return { success: false };
        }
        async clear() {
          const { keys } = await this.internalGetPrefixedKeys({ prefix: this.prefix });
          for (const key of keys) {
            localStorage.removeItem(key);
          }
        }
        // @native
        // eslint-disable-next-line @typescript-eslint/require-await
        async internalClearItemsWithPrefix(_options) {
          console.warn("internalClearItemsWithPrefix is native only");
        }
        // @native
        // eslint-disable-next-line @typescript-eslint/require-await
        async internalGetPrefixedKeys(options) {
          const keys = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key === null || key === void 0 ? void 0 : key.startsWith(options.prefix)) {
              keys.push(key);
            }
          }
          return { keys };
        }
      };
      var web = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        SecureStorageWeb
      });
      var SecureStorageNative = class extends SecureStorageBase {
        constructor(capProxy) {
          super();
          const proxy2 = capProxy;
          this.setSynchronizeKeychain = proxy2.setSynchronizeKeychain;
          this.internalGetItem = proxy2.internalGetItem;
          this.internalSetItem = proxy2.internalSetItem;
          this.internalRemoveItem = proxy2.internalRemoveItem;
          this.internalClearItemsWithPrefix = proxy2.internalClearItemsWithPrefix;
          this.internalGetPrefixedKeys = proxy2.internalGetPrefixedKeys;
        }
        // @native
        async setSynchronizeKeychain(_options) {
        }
        // @native
        async internalGetItem(_options) {
          return { data: "" };
        }
        // @native
        async internalSetItem(_options) {
        }
        // @native
        async internalRemoveItem(_options) {
          return { success: true };
        }
        async clear(sync) {
          return this.tryOperation(async () => this.clearItemsWithPrefix({
            prefix: this.prefix,
            sync: sync !== null && sync !== void 0 ? sync : this.sync
          }));
        }
        // @native
        async internalClearItemsWithPrefix(_options) {
        }
        // @native
        async internalGetPrefixedKeys(_options) {
          return { keys: [] };
        }
      };
      var native = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        SecureStorageNative
      });
      exports.SecureStorage = proxy;
      exports.StorageError = StorageError;
    }
  });

  // ../core/services/ai.js
  var require_ai = __commonJS({
    "../core/services/ai.js"(exports, module) {
      "use strict";
      var PROVIDERS = {
        groq: {
          label: "Groq (gratuito)",
          url: "https://api.groq.com/openai/v1/chat/completions",
          model: "llama-3.1-8b-instant",
          // cota diária alta e poucos tokens por pedido
          keyHint: "gsk_\u2026",
          keyPattern: /^gsk_[\x21-\x7e]{20,300}$/,
          format: "openai"
        },
        claude: {
          label: "Claude (Anthropic)",
          url: "https://api.anthropic.com/v1/messages",
          model: "claude-sonnet-5-5",
          keyHint: "sk-ant-\u2026",
          keyPattern: /^sk-[\x21-\x7e]{16,300}$/,
          format: "anthropic"
        }
      };
      var DEFAULT_PROVIDER = "groq";
      var MAX_TOKENS = 1200;
      var LIMITS = { depth: 6, nodes: 80, title: 120, selection: 4e3, question: 1e3, note: 600, paragraphs: 3 };
      var TEACHER = "Voc\xEA \xE9 um professor experiente de concursos p\xFAblicos brasileiros, em portugu\xEAs do Brasil. Ensina com foco na prova: v\xE1 direto ao ponto, use linguagem clara, cite a base legal ou o conceito-chave quando houver, aponte pegadinhas comuns de banca e, quando fizer sentido, a diferen\xE7a entre conceitos parecidos. Use somente o tema e o conte\xFAdo fornecidos como base. Se o conte\xFAdo n\xE3o bastar, diga isso e n\xE3o invente lei, artigo ou jurisprud\xEAncia. Lembre que a legisla\xE7\xE3o pode ter sido alterada: confira o texto oficial e o edital.";
      var SYSTEM_ANSWER = TEACHER + " Responda \xE0 pergunta do aluno com objetividade, em at\xE9 8 frases.";
      var SYSTEM_NOTES = TEACHER + " Escreva uma nota de estudo para o aluno revisar o tema. Formato: no m\xE1ximo 3 frases curtas ou 3 t\xF3picos. Inclua (1) a ideia central em uma frase, (2) um exemplo muito breve de cobran\xE7a em prova e (3) uma pergunta de m\xFAltipla escolha ou de recorda\xE7\xE3o que fa\xE7a o aluno lembrar o assunto. Sem introdu\xE7\xE3o, sem t\xEDtulo. At\xE9 " + LIMITS.note + " caracteres.";
      var SYSTEM_PARAGRAPHS = TEACHER + " Escreva de 1 a 3 par\xE1grafos de revis\xE3o sobre o tema, voltados \xE0 revis\xE3o para concurso p\xFAblico: o conceito essencial, como a banca costuma cobrar e o ponto que candidatos confundem. Use texto corrido, sem t\xEDtulos, sem listas e sem introdu\xE7\xE3o. Use 1 par\xE1grafo para tema simples e 3 para tema complexo. Cada par\xE1grafo com 2 a 4 frases. Separe os par\xE1grafos com uma linha em branco.";
      var SYSTEM_OUTLINE = TEACHER + ' Organize o conte\xFAdo em t\xF3picos para um mapa mental de estudo. Responda SOMENTE com JSON no formato {"topics":[{"title":"...","note":"...","children":[...]}]}, sem texto antes ou depois. Cada t\xF3pico pode ter uma "note" curta (uma ou duas frases) que explica o t\xF3pico para o estudo; use "" quando n\xE3o houver o que explicar. T\xEDtulos curtos (at\xE9 8 palavras). No m\xE1ximo ' + LIMITS.depth + " n\xEDveis e " + LIMITS.nodes + " t\xF3picos no total.";
      function cleanText(v, max) {
        return String(v ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
      }
      function pickModels(ids) {
        const ok = [...new Set((ids || []).map(String))].filter((id) => validModel(id) && !/whisper|tts|guard|embed|moderat|safeguard|prompt-guard/i.test(id));
        const rank = (id) => /versatile|gpt-oss|instruct|sonnet|opus|haiku/i.test(id) ? 0 : /instant|llama|qwen|mixtral/i.test(id) ? 1 : 2;
        return ok.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
      }
      function validKey(provider, key) {
        const p = PROVIDERS[provider];
        return !!p && p.keyPattern.test(String(key || "").trim());
      }
      var validModel = (m) => /^[A-Za-z0-9._/-]{1,100}$/.test(String(m || "")) && !String(m || "").includes("..");
      function buildRequest({ provider = DEFAULT_PROVIDER, model, mode, question, selection, topic, apiKey }) {
        const p = PROVIDERS[provider];
        if (!p) throw new Error("Provedor de IA desconhecido.");
        const useModel = validModel(model) ? model : p.model;
        if (!["outline", "answer", "notes", "paragraphs"].includes(mode)) throw new Error("Modo de IA desconhecido.");
        const sel = cleanText(selection, LIMITS.selection);
        const tema = cleanText(topic, 300);
        const q = cleanText(question, LIMITS.question);
        if (!sel) throw new Error("Selecione um t\xF3pico ou escreva um trecho antes de perguntar.");
        const ctx = (tema ? `Tema do t\xF3pico: ${tema}
` : "") + `Conte\xFAdo do t\xF3pico:
${sel}`;
        const user = mode === "outline" ? `${q || "Organize em t\xF3picos o conte\xFAdo abaixo:"}

${ctx}` : mode === "notes" ? `${q || "Escreva a nota de estudo para este t\xF3pico:"}

${ctx}` : mode === "paragraphs" ? `Escreva os par\xE1grafos de revis\xE3o para este t\xF3pico:

${ctx}` : `${ctx}

Pergunta do aluno: ${q || "Explique o t\xF3pico de forma resumida, do jeito que cairia em prova."}`;
        const system = mode === "outline" ? SYSTEM_OUTLINE : mode === "notes" ? SYSTEM_NOTES : mode === "paragraphs" ? SYSTEM_PARAGRAPHS : SYSTEM_ANSWER;
        const key = String(apiKey || "");
        if (p.format === "anthropic") {
          return {
            url: p.url,
            headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
            body: { model: useModel, max_tokens: MAX_TOKENS, system, messages: [{ role: "user", content: user }] }
          };
        }
        return {
          url: p.url,
          headers: { "content-type": "application/json", authorization: "Bearer " + key },
          body: { model: useModel, max_tokens: MAX_TOKENS, messages: [{ role: "system", content: system }, { role: "user", content: user }] }
        };
      }
      function parseResponse(json, provider = DEFAULT_PROVIDER) {
        const p = PROVIDERS[provider];
        if (!json || typeof json !== "object" || !p) throw new Error("Resposta inesperada do assistente.");
        if (json.type === "error" || json.error) {
          const msg = json.error && json.error.message ? String(json.error.message) : "erro desconhecido";
          throw new Error("O assistente recusou o pedido: " + cleanText(msg, 200));
        }
        let text = "";
        if (p.format === "anthropic") {
          const parts = Array.isArray(json.content) ? json.content : [];
          text = parts.filter((x) => x && x.type === "text" && typeof x.text === "string").map((x) => x.text).join("\n").trim();
        } else {
          const ch = json.choices && json.choices[0];
          const c = ch && ch.message;
          text = c && typeof c.content === "string" ? c.content.trim() : "";
          if (!text && ch && ch.finish_reason === "length") throw new Error("O assistente parou antes de terminar a resposta (limite de tokens). Tente de novo ou escolha outro modelo.");
        }
        if (!text) throw new Error("O assistente n\xE3o devolveu texto. Tente de novo ou escolha outro modelo.");
        return text;
      }
      function parseParagraphs(text) {
        const t = String(text || "").replace(/```[a-z]*\n?/gi, "").replace(/\r/g, "").trim();
        const parts = t.split(/\n\s*\n/).map((p) => cleanText(p.replace(/^\s*(#+|[-*•]|\d+[.)])\s+/gm, ""), 1200)).filter(Boolean);
        if (!parts.length) return { ok: false, error: "O assistente n\xE3o devolveu par\xE1grafos utiliz\xE1veis. Tente de novo." };
        return { ok: true, paragraphs: parts.slice(0, LIMITS.paragraphs) };
      }
      function parseNote(text) {
        let t = String(text || "").replace(/```[a-z]*\n?/gi, "").replace(/\r/g, "").trim();
        t = t.split("\n").map((l) => l.replace(/\s+$/, "")).join("\n").replace(/\n{3,}/g, "\n\n").trim();
        if (!t) return { ok: false, error: "O assistente n\xE3o devolveu uma nota utiliz\xE1vel. Tente de novo." };
        if (t.length > LIMITS.note) {
          const cut = t.slice(0, LIMITS.note), sp = cut.lastIndexOf(" ");
          t = (sp > LIMITS.note * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:\s]+$/, "") + "\u2026";
        }
        return { ok: true, text: t };
      }
      function extractJson(text) {
        const t = String(text || "").trim();
        try {
          return JSON.parse(t);
        } catch {
        }
        const a = t.indexOf("{"), b = t.lastIndexOf("}");
        if (a >= 0 && b > a) {
          try {
            return JSON.parse(t.slice(a, b + 1));
          } catch {
          }
        }
        return null;
      }
      function parseOutline(text) {
        const obj = extractJson(text);
        if (!obj || !Array.isArray(obj.topics)) return { ok: false, error: "O assistente n\xE3o devolveu uma lista de t\xF3picos v\xE1lida. Tente de novo." };
        let count = 0;
        const walk2 = (list, depth) => {
          const out = [];
          for (const it of list) {
            if (!it || typeof it !== "object") continue;
            const title = cleanText(it.title, LIMITS.title);
            if (!title) continue;
            if (++count > LIMITS.nodes) throw new Error(`Muitos t\xF3picos (m\xE1ximo ${LIMITS.nodes}). Selecione um trecho menor.`);
            const node = { title, note: cleanText(it.note, LIMITS.note), children: [] };
            if (Array.isArray(it.children) && it.children.length) {
              if (depth + 1 >= LIMITS.depth) throw new Error(`Estrutura profunda demais (m\xE1ximo ${LIMITS.depth} n\xEDveis).`);
              node.children = walk2(it.children, depth + 1);
            }
            out.push(node);
          }
          return out;
        };
        try {
          const topics = walk2(obj.topics, 0);
          if (!topics.length) return { ok: false, error: "O assistente n\xE3o devolveu nenhum t\xF3pico utiliz\xE1vel." };
          return { ok: true, topics };
        } catch (e) {
          return { ok: false, error: e.message };
        }
      }
      module.exports = { PROVIDERS, DEFAULT_PROVIDER, LIMITS, buildRequest, parseResponse, parseOutline, parseNote, parseParagraphs, cleanText, validKey, validModel, pickModels };
    }
  });

  // shim/ai-host.js
  var require_ai_host = __commonJS({
    "shim/ai-host.js"(exports, module) {
      "use strict";
      var { SecureStorage } = require_plugin();
      var ai = require_ai();
      var TIMEOUT_MS = 6e4;
      var providerOf = (p) => ai.PROVIDERS[p] ? p : ai.DEFAULT_PROVIDER;
      var keyName = (provider) => "chave-" + providerOf(provider);
      async function readKey(provider) {
        try {
          return await SecureStorage.getItem(keyName(provider)) || null;
        } catch {
          return null;
        }
      }
      async function saveKey(provider, key) {
        const p = providerOf(provider), k = String(key || "").trim();
        if (!ai.validKey(p, k)) throw new Error(`Essa n\xE3o parece uma chave do ${ai.PROVIDERS[p].label} (come\xE7a com "${ai.PROVIDERS[p].keyHint}").`);
        await SecureStorage.setItem(keyName(p), k);
        return true;
      }
      async function clearKey(provider) {
        await SecureStorage.removeItem(keyName(provider)).catch(() => {
        });
        return true;
      }
      async function keyStatus(provider) {
        const p = providerOf(provider);
        return { provider: p, saved: !!await readKey(p), available: true };
      }
      function httpError(status, body) {
        let apiMsg = "";
        try {
          const j = JSON.parse(body);
          apiMsg = j.error && (j.error.message || j.error) || j.message || "";
        } catch {
        }
        apiMsg = ai.cleanText(typeof apiMsg === "string" ? apiMsg : "", 240);
        if (status === 401 || status === 403) return "A chave foi recusada pelo provedor. Confira se copiou a chave inteira e se ela est\xE1 ativa. " + (apiMsg ? "(" + apiMsg + ")" : "");
        if (status === 429) return "Limite de uso do provedor atingido. Tente de novo em alguns minutos." + (apiMsg ? " (" + apiMsg + ")" : "");
        if (status >= 500) return "O servi\xE7o do provedor est\xE1 inst\xE1vel agora. Tente de novo em instantes.";
        return "O provedor n\xE3o atendeu o pedido (c\xF3digo " + status + ")" + (apiMsg ? ": " + apiMsg : ".");
      }
      async function getJsonBody(res) {
        const text = await res.text();
        if (res.status < 200 || res.status > 299) throw new Error(httpError(res.status, text));
        try {
          return JSON.parse(text);
        } catch {
          throw new Error("Resposta inesperada do provedor.");
        }
      }
      async function postJson(req) {
        const ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
        const timer2 = ctl ? setTimeout(() => ctl.abort(), TIMEOUT_MS) : null;
        try {
          const res = await fetch(req.url, { method: "POST", headers: req.headers, body: JSON.stringify(req.body), signal: ctl ? ctl.signal : void 0 });
          return await getJsonBody(res);
        } catch (e) {
          if (e && e.name === "AbortError") throw new Error("O assistente demorou demais para responder. Tente de novo.");
          if (e instanceof TypeError) throw new Error("Sem conex\xE3o com a internet para falar com o assistente.");
          throw e;
        } finally {
          if (timer2) clearTimeout(timer2);
        }
      }
      var modelCache = /* @__PURE__ */ new Map();
      var MODEL_TTL_MS = 10 * 60 * 1e3;
      async function resolveModel(provider, model) {
        if (ai.validModel(model)) return model;
        const c = modelCache.get(provider);
        if (c && Date.now() - c.at < MODEL_TTL_MS) return c.id;
        const { ids } = await models(provider);
        modelCache.set(provider, { id: ids[0], at: Date.now() });
        return ids[0];
      }
      async function ask({ provider, model, mode, question, selection, topic }) {
        const p = providerOf(provider);
        const apiKey = await readKey(p);
        if (!apiKey) throw new Error(`Informe a sua chave do ${ai.PROVIDERS[p].label} na aba Assistente antes de perguntar.`);
        const req = ai.buildRequest({ provider: p, model: await resolveModel(p, model), mode, question, selection, topic, apiKey });
        const text = ai.parseResponse(await postJson(req), p);
        if (mode === "notes") {
          const n = ai.parseNote(text);
          if (!n.ok) throw new Error(n.error);
          return { text: n.text };
        }
        if (mode === "outline") {
          const r = ai.parseOutline(text);
          if (!r.ok) throw new Error(r.error);
          return { topics: r.topics };
        }
        return { text };
      }
      async function models(provider) {
        const p = providerOf(provider);
        const apiKey = await readKey(p);
        if (!apiKey) throw new Error(`Guarde a chave do ${ai.PROVIDERS[p].label} antes de listar os modelos.`);
        const headers = p === "claude" ? { "x-api-key": apiKey, "anthropic-version": "2023-06-01" } : { authorization: "Bearer " + apiKey };
        const url = p === "claude" ? "https://api.anthropic.com/v1/models" : "https://api.groq.com/openai/v1/models";
        const res = await fetch(url, { method: "GET", headers });
        const json = await getJsonBody(res);
        const ids = ai.pickModels((json.data || []).map((m) => m.id));
        if (!ids.length) throw new Error("A conta n\xE3o tem modelos de conversa dispon\xEDveis.");
        return { ids };
      }
      async function test(provider, model) {
        const p = providerOf(provider);
        const apiKey = await readKey(p);
        if (!apiKey) throw new Error(`Guarde a chave do ${ai.PROVIDERS[p].label} antes de testar.`);
        const req = ai.buildRequest({ provider: p, model: await resolveModel(p, model), mode: "answer", question: "Responda apenas: ok", selection: "Teste de conex\xE3o.", apiKey });
        req.body.max_tokens = 256;
        ai.parseResponse(await postJson(req), p);
        return true;
      }
      module.exports = { saveKey, clearKey, keyStatus, ask, models, test, httpError };
    }
  });

  // package.json
  var require_package = __commonJS({
    "package.json"(exports, module) {
      module.exports = {
        name: "braniac-tablet",
        version: "0.7.13",
        private: true,
        description: "Casca Android (Capacitor) do BRANIAC: empacota a mesma interface do desktop para o tablet.",
        scripts: {
          "build:www": "node scripts/build-www.js",
          sync: "npm run build:www && npx cap sync android && node scripts/patch-android.js",
          "apk:debug": "cd android && gradlew assembleDebug"
        },
        dependencies: {
          "@aparajita/capacitor-secure-storage": "^8.0.1",
          "@capacitor/android": "^8.6.0",
          "@capacitor/app": "^8.1.2",
          "@capacitor/browser": "^8.0.5",
          "@capacitor/clipboard": "^8.0.1",
          "@capacitor/core": "^8.6.0",
          "@capacitor/dialog": "^8.0.1",
          "@capacitor/filesystem": "^8.1.5",
          "@capacitor/preferences": "^8.0.1",
          "@capacitor/share": "^8.0.3",
          "@capawesome/capacitor-file-picker": "^8.1.1",
          buffer: "^6.0.3",
          fflate: "^0.8.3"
        },
        devDependencies: {
          "@capacitor/cli": "^8.6.0"
        }
      };
    }
  });

  // shim/host.js
  var require_host = __commonJS({
    "shim/host.js"(exports, module) {
      "use strict";
      var { Filesystem: Filesystem2, Directory: Directory2 } = require_plugin_cjs();
      var { Share } = require_plugin_cjs3();
      var { Clipboard } = require_plugin_cjs4();
      var { Browser } = require_plugin_cjs5();
      var { FilePicker } = require_plugin_cjs6();
      var fs2 = require_fs_vfs();
      var ai = require_ai_host();
      var APP_DIR = "/app-data";
      var handlers = /* @__PURE__ */ new Map();
      var listeners = /* @__PURE__ */ new Map();
      var state = { dirty: false, mapOpen: false };
      var gate = Promise.resolve();
      var setGate = (p) => {
        gate = p;
      };
      var sharePending = /* @__PURE__ */ new Set();
      var safeName = (n) => String(n || "mapa").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, "_").slice(0, 120) || "mapa";
      var nativeOf = (p) => "braniac" + p;
      function uniquePath(dir, name) {
        const dot = name.lastIndexOf(".");
        const ext = dot > 0 ? name.slice(dot) : "";
        const stem = ext ? name.slice(0, dot) : name;
        let p = `${dir}/${name}`;
        for (let i = 2; fs2.existsSync(p); i++) p = `${dir}/${stem} (${i})${ext}`;
        return p;
      }
      function askButtons({ title = "BRANIAC", message, detail = "", buttons = ["OK"] }) {
        return new Promise((resolve) => {
          const wrap = document.createElement("div");
          wrap.className = "tab-dialog-wrap";
          wrap.setAttribute("role", "dialog");
          wrap.setAttribute("aria-modal", "true");
          const box = document.createElement("div");
          box.className = "tab-dialog";
          const h = document.createElement("h2");
          h.textContent = title;
          const p = document.createElement("p");
          p.textContent = message;
          box.append(h, p);
          if (detail) {
            const d = document.createElement("p");
            d.className = "tab-dialog-detail";
            d.textContent = detail;
            box.append(d);
          }
          const row = document.createElement("div");
          row.className = "tab-dialog-actions";
          buttons.forEach((label, i) => {
            const b = document.createElement("button");
            b.type = "button";
            b.textContent = label;
            b.className = i === 0 ? "tab-btn primary" : "tab-btn";
            b.onclick = () => {
              wrap.remove();
              resolve(i);
            };
            row.append(b);
          });
          box.append(row);
          wrap.append(box);
          document.body.append(wrap);
          if (row.firstChild) row.firstChild.focus();
        });
      }
      function toBase64(u8) {
        let s = "";
        for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
        return btoa(s);
      }
      function fromBase64(b64) {
        const bin = atob(b64);
        const u8 = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        return u8;
      }
      async function importPicked(file, folder = "maps") {
        let data = file.data;
        if (!data) data = (await Filesystem2.readFile({ path: file.path })).data;
        const bytes = typeof data === "string" ? fromBase64(data) : data;
        fs2.mkdirSync(`${APP_DIR}/${folder}`, { recursive: true });
        const p = uniquePath(`${APP_DIR}/${folder}`, safeName(file.name));
        fs2.writeFileSync(p, bytes);
        return p;
      }
      async function shareFile(p) {
        const { uri } = await Filesystem2.getUri({ path: nativeOf(p), directory: Directory2.Data });
        await Share.share({ title: "BRANIAC", text: p.slice(p.lastIndexOf("/") + 1), files: [uri], dialogTitle: "Salvar ou enviar" }).catch(() => {
        });
      }
      var reg = (channel, fn) => handlers.set(channel, fn);
      reg("app:path", () => APP_DIR);
      reg("app:version", () => require_package().version);
      reg("app:start-override", () => null);
      reg("dialog:open", async () => {
        const r = await FilePicker.pickFiles({ types: ["*/*"], limit: 1, readData: true }).catch(() => null);
        const f = r && r.files && r.files[0];
        if (!f) return null;
        if (!/\.mom$/i.test(f.name || "")) {
          await askButtons({ message: "Escolha um arquivo .mom (mapa do Mindomo ou do BRANIAC)." });
          return null;
        }
        return importPicked(f);
      });
      reg("dialog:open-pdf", async () => {
        const r = await FilePicker.pickFiles({ types: ["application/pdf"], limit: 1, readData: true }).catch(() => null);
        const f = r && r.files && r.files[0];
        if (!f) return null;
        if (!/\.pdf$/i.test(f.name || "")) {
          await askButtons({ message: "Escolha um arquivo PDF." });
          return null;
        }
        return importPicked(f, "pdfs");
      });
      reg("dialog:open-at", async () => null);
      reg("dialog:folder", async () => null);
      reg("dialog:save", async (defaultName) => {
        fs2.mkdirSync(`${APP_DIR}/maps`, { recursive: true });
        return uniquePath(`${APP_DIR}/maps`, safeName(defaultName));
      });
      reg("dialog:save-export", async (kind, defaultName) => {
        fs2.mkdirSync(`${APP_DIR}/exports`, { recursive: true });
        const p = uniquePath(`${APP_DIR}/exports`, safeName(defaultName));
        sharePending.add(p);
        return p;
      });
      reg("dialog:error", (msg) => askButtons({ message: String(msg) }));
      reg("dialog:confirm", (o) => askButtons({ message: o.message, detail: o.detail, buttons: o.buttons }));
      reg("dialog:confirm-discard", () => askButtons({
        message: "H\xE1 altera\xE7\xF5es n\xE3o salvas.",
        detail: "Deseja salvar antes de continuar?",
        buttons: ["Salvar", "Descartar", "Cancelar"]
      }));
      reg("export:pdf", async () => ({ ok: false, error: "Exportar PDF ainda n\xE3o est\xE1 dispon\xEDvel no tablet. Use Markdown ou PNG." }));
      reg("clip:write", async (text) => {
        await Clipboard.write({ string: String(text) });
      });
      reg("clip:read", async () => String((await Clipboard.read().catch(() => ({ value: "" }))).value || ""));
      reg("open-external", async (url) => {
        const u = String(url || "");
        if (!/^(https?:\/\/|mailto:)[^\s<>"']+$/i.test(u)) return { ok: false };
        await Browser.open({ url: u }).catch(() => {
        });
        return { ok: true };
      });
      var recentFile = `${APP_DIR}/recent.json`;
      function loadRecent() {
        try {
          const list = JSON.parse(fs2.readFileSync(recentFile, "utf8"));
          return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
        } catch {
          return [];
        }
      }
      function saveRecent(list) {
        fs2.mkdirSync(APP_DIR, { recursive: true });
        fs2.writeFileSync(recentFile, JSON.stringify(list.slice(0, 12)));
      }
      reg("recent:list", () => loadRecent().map((p) => {
        const exists = fs2.existsSync(p);
        return { path: p, exists, mtime: exists ? fs2.statSync(p).mtimeMs : null };
      }));
      reg("recent:add", (p) => {
        if (typeof p === "string") saveRecent([p, ...loadRecent().filter((x) => x !== p)]);
      });
      reg("recent:remove", (p) => saveRecent(loadRecent().filter((x) => x !== p)));
      reg("recent:clear", () => saveRecent([]));
      var aiCall = (fn) => async (...args) => {
        try {
          return { ok: true, ...await fn(...args) };
        } catch (e) {
          return { ok: false, error: e && e.message || "Falha no assistente." };
        }
      };
      reg("ai:key-status", (provider) => ai.keyStatus(provider));
      reg("ai:key-save", aiCall((provider, key) => ai.saveKey(provider, key)));
      reg("ai:key-clear", (provider) => ai.clearKey(provider));
      reg("ai:ask", aiCall((req) => ai.ask(req || {})));
      reg("ai:test", aiCall((provider, model) => ai.test(provider, model)));
      reg("ai:models", aiCall((provider) => ai.models(provider)));
      function invoke(channel, ...args) {
        const fn = handlers.get(channel);
        if (!fn) return Promise.reject(new Error("Recurso indispon\xEDvel no tablet: " + channel));
        return gate.then(() => fn(...args));
      }
      function send(channel, ...args) {
        if (channel === "dirty") state.dirty = !!args[0];
        else if (channel === "map-state") state.mapOpen = !!args[0];
      }
      function on(channel, fn) {
        if (!listeners.has(channel)) listeners.set(channel, []);
        listeners.get(channel).push(fn);
      }
      function emit(channel, ...args) {
        for (const fn of listeners.get(channel) || []) fn({}, ...args);
      }
      module.exports = {
        ipcRenderer: { invoke, send, on },
        webUtils: { getPathForFile: () => "" },
        // arrastar arquivo para o app: só no desktop
        emit,
        state,
        sharePending,
        shareFile,
        askButtons,
        toBase64,
        fromBase64,
        nativeOf,
        setGate
      };
    }
  });

  // ../core/components/contrast.js
  var require_contrast = __commonJS({
    "../core/components/contrast.js"(exports, module) {
      "use strict";
      var HEX = /^#[0-9a-fA-F]{6}$/;
      var MIN_GRAPHIC = 3;
      var MIN_TEXT = 4.5;
      var isHex = (c) => HEX.test(c || "");
      function luminance(hex) {
        const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      }
      function contrast(a, b) {
        const x = luminance(a), y = luminance(b);
        return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
      }
      function lighten(hex, t) {
        const ch = (i) => parseInt(hex.slice(i, i + 2), 16);
        const mix = (v) => Math.round(v + (255 - v) * t).toString(16).padStart(2, "0");
        return `#${mix(ch(1))}${mix(ch(3))}${mix(ch(5))}`;
      }
      function darken(hex, t) {
        const ch = (i) => parseInt(hex.slice(i, i + 2), 16);
        const mix = (v) => Math.round(v * (1 - t)).toString(16).padStart(2, "0");
        return `#${mix(ch(1))}${mix(ch(3))}${mix(ch(5))}`;
      }
      function onCanvas(color, canvas, min = MIN_GRAPHIC) {
        if (!isHex(color) || !isHex(canvas) || contrast(color, canvas) >= min) return color;
        const first = luminance(canvas) < 0.5 ? lighten : darken;
        const second = first === lighten ? darken : lighten;
        for (let t = 0.05; t <= 1.001; t += 0.05) {
          const a = first(color, Math.min(t, 1));
          if (contrast(a, canvas) >= min) return a;
          const b = second(color, Math.min(t, 1));
          if (contrast(b, canvas) >= min) return b;
        }
        return contrast("#ffffff", canvas) >= contrast("#000000", canvas) ? "#ffffff" : "#000000";
      }
      module.exports = { MIN_GRAPHIC, MIN_TEXT, isHex, luminance, contrast, lighten, darken, onCanvas };
    }
  });

  // ../core/components/themes.js
  var require_themes = __commonJS({
    "../core/components/themes.js"(exports, module) {
      "use strict";
      var THEMES = {
        ocean: {
          name: "Oceano",
          background: "#f3f7ff",
          font: "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          branches: ["#0073e6", "#00a896", "#f4a261", "#e76f51", "#8e6bd8", "#2a9d8f", "#d6336c"],
          levels: [
            { shape: "round", fill: "#0b3d91", color: "#ffffff", size: 22, bold: true, padX: 22, padY: 12 },
            { shape: "round", fill: "branch", color: "#ffffff", size: 16, bold: true, padX: 14, padY: 8 },
            { shape: "underline", fill: "none", color: "#1c2b3a", size: 13, bold: false, padX: 8, padY: 5 }
          ],
          line: { width: [5, 3, 2], curve: "bezier" }
        },
        dark: {
          name: "Escuro",
          background: "#14161c",
          font: "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          branches: ["#4cc9f0", "#f72585", "#b5e48c", "#ffd166", "#9b5de5", "#ff9f1c", "#06d6a0"],
          levels: [
            { shape: "round", fill: "#262b38", color: "#ffffff", size: 22, bold: true, padX: 22, padY: 12, stroke: "branch" },
            { shape: "round", fill: "#1d212b", color: "#ffffff", size: 16, bold: true, padX: 14, padY: 8, stroke: "branch" },
            { shape: "underline", fill: "none", color: "#d7dbe6", size: 13, bold: false, padX: 8, padY: 5 }
          ],
          line: { width: [5, 3, 2], curve: "bezier" }
        },
        paper: {
          name: "Papel",
          background: "#fbf8f1",
          font: 'Georgia, "Times New Roman", serif',
          branches: ["#6b4f3a", "#8c6d46", "#4f6d4f", "#7a4e5e", "#47637a", "#a0522d"],
          levels: [
            { shape: "rect", fill: "#fffdf8", color: "#3b2d22", size: 22, bold: true, padX: 22, padY: 12, stroke: "#6b4f3a" },
            { shape: "rect", fill: "#fffdf8", color: "#3b2d22", size: 16, bold: true, padX: 12, padY: 7, stroke: "branch" },
            { shape: "underline", fill: "none", color: "#3b2d22", size: 13, bold: false, padX: 6, padY: 4 }
          ],
          line: { width: [3, 2, 1.5], curve: "elbow" }
        },
        neon: {
          name: "Neon",
          background: "#0a0612",
          font: '"Trebuchet MS", Verdana, sans-serif',
          branches: ["#00f5d4", "#fee440", "#f15bb5", "#9b5de5", "#00bbf9", "#ff6b35"],
          levels: [
            { shape: "round", fill: "#1a1030", color: "#ffffff", size: 22, bold: true, padX: 24, padY: 12, stroke: "#00f5d4" },
            { shape: "round", fill: "#150d26", color: "#ffffff", size: 16, bold: true, padX: 14, padY: 8, stroke: "branch" },
            { shape: "underline", fill: "none", color: "#e9e2ff", size: 13, bold: false, padX: 8, padY: 5 }
          ],
          line: { width: [4, 3, 2], curve: "bezier" }
        },
        // Desenho à mão: monocromático e flat (sem sombras nem gradientes). `sketch` faz o desenho tremer levemente, como traço de caneta.
        draw: {
          name: "Desenho (\xE0 m\xE3o)",
          background: "#f4f4f4",
          font: "Segoe Print, Comic Sans MS, cursive",
          sketch: true,
          branches: ["#111111", "#444444", "#666666"],
          levels: [
            { shape: "ellipse", fill: "#ffffff", color: "#111111", size: 20, bold: true, padX: 22, padY: 12, stroke: "#111111", strokeWidth: 2 },
            { shape: "rect", fill: "#ffffff", color: "#111111", size: 16, bold: false, padX: 14, padY: 8, stroke: "#111111", strokeWidth: 1.6 },
            { shape: "underline", fill: "none", color: "#111111", size: 14, bold: false, padX: 8, padY: 5 }
          ],
          line: { width: [2, 1.6, 1.2], curve: "bezier" }
        },
        mono: {
          name: "Monocrom\xE1tico (impress\xE3o)",
          background: "#ffffff",
          font: "Arial, Helvetica, sans-serif",
          branches: ["#222222", "#555555", "#777777"],
          levels: [
            { shape: "rect", fill: "#222222", color: "#ffffff", size: 22, bold: true, padX: 20, padY: 11 },
            { shape: "rect", fill: "#ffffff", color: "#111111", size: 16, bold: true, padX: 12, padY: 7, stroke: "#222222" },
            { shape: "underline", fill: "none", color: "#111111", size: 13, bold: false, padX: 6, padY: 4 }
          ],
          line: { width: [3, 2, 1.5], curve: "elbow" }
        }
      };
      var SHAPES = /* @__PURE__ */ new Set(["pill", "rect", "round", "underline", "ellipse", "none"]);
      var ALIGNS = /* @__PURE__ */ new Set(["auto", "left", "center", "right"]);
      var HEX = /^#[0-9a-fA-F]{6}$/;
      var FONT_NAME = /^[A-Za-z0-9][A-Za-z0-9 _-]{0,39}$/;
      var num = (v, lo, hi) => Number.isFinite(v) && v >= lo && v <= hi;
      function sanitizeStyle(s) {
        const o = {};
        if (!s || typeof s !== "object") return o;
        if (typeof s.fill === "string" && (HEX.test(s.fill) || s.fill === "none")) o.fill = s.fill;
        if (typeof s.color === "string" && HEX.test(s.color)) o.color = s.color;
        if (typeof s.shape === "string" && SHAPES.has(s.shape)) o.shape = s.shape;
        if (typeof s.align === "string" && ALIGNS.has(s.align)) o.align = s.align;
        if (Number.isFinite(s.size) && s.size >= 6 && s.size <= 96) o.size = s.size;
        if (typeof s.bold === "boolean") o.bold = s.bold;
        if (typeof s.italic === "boolean") o.italic = s.italic;
        if (typeof s.stroke === "string" && HEX.test(s.stroke)) o.stroke = s.stroke;
        if (num(s.strokeWidth, 0, 10)) o.strokeWidth = s.strokeWidth;
        if (typeof s.edge === "string" && HEX.test(s.edge)) o.edge = s.edge;
        if (num(s.edgeWidth, 0.5, 12)) o.edgeWidth = s.edgeWidth;
        if (typeof s.font === "string" && FONT_NAME.test(s.font)) o.font = s.font;
        return o;
      }
      function sanitizeTheme(t) {
        if (!t || typeof t !== "object" || !Array.isArray(t.levels) || !t.levels.length) return null;
        const color = (v, d) => typeof v === "string" && HEX.test(v) ? v : d;
        const levels = t.levels.slice(0, 16).map((l) => {
          l = l && typeof l === "object" ? l : {};
          const o = {
            shape: SHAPES.has(l.shape) ? l.shape : "round",
            fill: l.fill === "none" || l.fill === "branch" || HEX.test(l.fill || "") ? l.fill : "none",
            color: color(l.color, "#000000"),
            size: num(l.size, 6, 96) ? l.size : 14,
            bold: l.bold === true,
            padX: num(l.padX, 0, 60) ? l.padX : 8,
            padY: num(l.padY, 0, 40) ? l.padY : 5
          };
          if (l.italic === true) o.italic = true;
          if (typeof l.stroke === "string" && (HEX.test(l.stroke) || l.stroke === "branch")) o.stroke = l.stroke;
          if (num(l.strokeWidth, 0, 10)) o.strokeWidth = l.strokeWidth;
          if (typeof l.edge === "string" && HEX.test(l.edge)) o.edge = l.edge;
          if (num(l.edgeWidth, 0.5, 12)) o.edgeWidth = l.edgeWidth;
          if (typeof l.font === "string" && FONT_NAME.test(l.font)) o.font = l.font;
          return o;
        });
        const branches = (Array.isArray(t.branches) ? t.branches : []).filter((c) => typeof c === "string" && HEX.test(c)).slice(0, 12);
        const font = typeof t.font === "string" && /^[A-Za-z0-9 ,"'_-]{1,160}$/.test(t.font) ? t.font : "Segoe UI, Roboto, Helvetica, Arial, sans-serif";
        const widths = (t.line && Array.isArray(t.line.width) ? t.line.width : []).filter((w) => num(w, 0.5, 12)).slice(0, 16);
        return {
          name: String(t.name || "Original").replace(/[<>&"]/g, "").slice(0, 80),
          background: color(t.background, "#ffffff"),
          font,
          branches: branches.length ? branches : ["#0073e6", "#00a896", "#f4a261", "#e76f51"],
          levels,
          line: { width: widths.length ? widths : [2], curve: t.line && (t.line.curve === "elbow" || t.line.curve === "bezier") ? t.line.curve : "bezier" }
        };
      }
      function getTheme(id, custom) {
        if (id === "custom" && custom) {
          const t = sanitizeTheme(custom);
          if (t) return t;
        }
        return THEMES[id] || THEMES.ocean;
      }
      function resolveStyle(theme, level, branchColor, nodeStyle = {}) {
        const base = theme.levels[Math.min(level, theme.levels.length - 1)];
        const clean = sanitizeStyle(nodeStyle);
        const s = { ...base, ...pick(clean, ["shape", "align", "color", "size", "bold", "italic", "edge", "edgeWidth", "font"]) };
        const fill = clean.fill || base.fill;
        s.fill = fill === "branch" ? branchColor : fill;
        s.stroke = clean.stroke || (base.stroke === "branch" ? branchColor : base.stroke);
        s.strokeWidth = clean.strokeWidth !== void 0 ? clean.strokeWidth : base.strokeWidth !== void 0 ? base.strokeWidth : 2;
        if (!(s.strokeWidth > 0)) s.stroke = void 0;
        s.branch = branchColor;
        return s;
      }
      function pick(o, keys) {
        const r = {};
        for (const k of keys) if (o[k] !== void 0) r[k] = o[k];
        return r;
      }
      function adaptThemeToCanvas(theme, canvas) {
        if (!canvas || !/^#[0-9a-fA-F]{6}$/.test(canvas)) return theme;
        const { onCanvas } = require_contrast();
        const branches = theme.branches.map((c) => onCanvas(c, canvas, 3));
        const levels = theme.levels.map((base) => {
          const level = { ...base };
          if (level.fill && level.fill !== "none" && level.fill !== "branch") {
            level.fill = onCanvas(level.fill, canvas, 3);
          }
          if (level.stroke && level.stroke !== "branch") {
            level.stroke = onCanvas(level.stroke, canvas, 3);
          }
          return level;
        });
        return { ...theme, branches, levels };
      }
      function adaptStyleToCanvas(style, canvas, branchColor) {
        if (!canvas || !/^#[0-9a-fA-F]{6}$/.test(canvas)) return style;
        const { onCanvas } = require_contrast();
        const s = { ...style };
        if (s.fill && s.fill !== "none") {
          s.fill = onCanvas(s.fill, canvas, 3);
        }
        if (s.stroke) {
          s.stroke = onCanvas(s.stroke, canvas, 3);
        }
        if (s.branch) {
          s.branch = onCanvas(s.branch, canvas, 3);
        }
        return s;
      }
      module.exports = { THEMES, getTheme, resolveStyle, sanitizeStyle, sanitizeTheme, adaptThemeToCanvas, adaptStyleToCanvas };
    }
  });

  // ../core/components/logo.js
  var require_logo = __commonJS({
    "../core/components/logo.js"(exports, module) {
      "use strict";
      var LOGO_VB = { x: 0, y: 0, w: 475.764, h: 363.682 };
      var COLORS = { color: "#000000", dark: "#f8fafb" };
      var PARTS = [
        "M0.037 244.131 L8.28 244.179 L8.282 240.059 L12.661 240.067 L12.684 233.164 L64.904 233.158 L64.892 225.322 L57.401 225.307 L57.441 221.468 L49.867 221.47 L49.861 217.747 L46.061 217.759 L46.1 213.896 L42.176 213.886 L42.17 202.658 L34.835 202.687 L34.829 139.062 L42.227 139.11 L42.199 127.786 L49.872 127.81 L49.845 105.256 L57.548 105.284 L57.515 90.281 L65.012 90.294 L65.009 75.34 L72.266 75.372 L72.277 60.301 L80 60.324 L79.976 56.442 L87.347 56.449 L87.318 49.085 L94.914 49.121 L94.901 45.231 L102.48 45.26 L102.475 37.824 L110.152 37.82 L110.151 26.61 L117.583 26.647 L117.548 18.983 L132.679 19.004 L132.68 15.263 L147.667 15.243 L147.652 7.81 L170.289 7.822 L170.225 0.019 L222.83 0.003 L222.794 7.772 L230.226 7.785 L230.227 15.223 L245.483 15.248 L245.477 7.771 L252.861 7.789 L252.855 0 L305.527 0.003 L305.46 7.802 L328.096 7.784 L328.096 15.27 L342.991 15.285 L342.97 19.007 L358.272 18.979 L358.273 26.651 L365.573 26.659 L365.579 37.855 L373.369 37.803 L373.333 45.262 L380.861 45.266 L380.862 49.136 L388.43 49.124 L388.389 56.461 L395.776 56.428 L395.76 60.289 L403.452 60.274 L403.428 75.374 L410.799 75.347 L410.795 90.313 L418.331 90.282 L418.279 105.267 L425.942 105.26 L425.916 127.814 L433.6 127.78 L433.592 139.04 L440.866 139.029 L440.899 202.688 L433.603 202.682 L433.58 213.933 L429.779 213.888 L429.798 217.756 L425.837 217.71 L425.877 225.228 L418.492 225.221 L418.483 229.128 L414.71 229.059 L414.687 233.156 L463.014 233.137 L463.032 240.045 L467.483 240.05 L467.471 244.155 L475.735 244.122 L475.764 332.613 L470.673 332.606 L470.698 338.191 L463.09 338.173 L463.091 344.751 L436.518 344.709 L436.535 341.025 L430.123 340.965 L430.099 352.848 L426.141 352.83 L426.145 356.949 L421.386 356.978 L421.401 363.651 L341.897 363.667 L341.882 356.899 L134.033 356.878 L133.975 363.682 L54.271 363.671 L54.328 357 L49.676 356.983 L49.703 352.799 L45.687 352.833 L45.621 340.878 L39.372 340.89 L39.39 344.762 L12.667 344.755 L12.669 338.189 L4.91 338.196 L4.91 332.573 L0 332.549 Z M147.428 48.979 C146.568 48.618 141.283 48.832 139.968 48.832 C139.927 50.038 139.882 51.295 139.962 52.499 C139.979 52.763 140.119 52.993 140.131 53.26 C140.174 54.297 140.078 55.34 140.117 56.376 L136.445 56.351 L136.413 52.698 C134.012 52.698 131.605 52.659 129.204 52.692 C128.854 52.697 128.538 52.851 128.192 52.856 C124.672 52.9 121.15 52.765 117.63 52.866 L117.603 60.156 L125.095 60.188 L125.138 67.812 L147.615 67.87 L147.687 75.235 L155.18 75.252 L155.241 82.778 L140.101 82.78 L140.102 75.282 L117.461 75.262 L117.381 60.317 C107.38 60.317 97.368 60.206 87.364 60.269 C87.366 61.209 87.565 67.481 87.239 67.804 C86.956 68.085 80.897 67.959 80.014 67.961 C79.903 69.058 79.972 70.192 79.961 71.295 C79.934 73.832 79.951 76.368 79.945 78.905 C79.943 80.067 80.034 81.27 79.951 82.427 C79.931 82.72 79.741 82.966 79.735 83.258 C79.682 85.644 79.7 88.069 79.75 90.456 L83.515 90.421 C83.687 88.597 83.531 86.68 83.545 84.844 C83.569 81.648 83.666 78.457 83.663 75.251 L87.229 75.198 L87.303 97.665 C86.235 97.493 85.104 97.614 84.025 97.622 C82.684 97.631 81.327 97.454 79.979 97.575 L79.954 105.267 L72.429 105.212 C72.184 107.606 72.398 110.143 72.411 112.551 C72.437 117.572 72.534 122.592 72.533 127.604 L87.569 127.773 C87.266 128.66 87.461 129.849 87.465 130.787 C87.474 132.95 87.458 135.113 87.488 137.276 C87.582 144.057 87.462 150.843 87.464 157.625 L95.04 157.646 L95.053 165.252 L102.396 165.276 L102.472 172.506 L109.918 172.516 L109.977 180.213 L132.391 180.216 L132.47 165.249 L125.179 165.245 L125.214 157.802 C124.649 157.799 124.117 157.856 123.594 157.619 C123.163 157.843 122.843 157.555 122.376 157.8 C121.262 157.306 119.055 157.598 117.791 157.598 C117.779 155.359 117.822 153.107 117.743 150.87 C117.73 150.491 117.529 150.171 117.522 149.794 C117.472 146.94 117.552 144.077 117.555 141.223 C117.557 139.272 117.344 137.183 117.575 135.25 L125.075 135.312 L125.054 142.762 L132.618 142.778 L132.571 150.304 L140.077 150.307 L140.087 172.579 L162.647 172.538 L162.616 165.328 L170.198 165.389 C170.526 167.435 170.266 169.618 170.272 171.687 C170.283 175.344 170.31 179.001 170.318 182.658 C170.322 184.36 170.238 186.073 170.297 187.772 C172.61 187.768 174.953 187.651 177.262 187.747 C177.772 187.768 178.3 188.141 178.82 188.231 C179.506 188.349 180.282 188.233 180.978 188.24 C181.821 188.249 184.254 188.487 184.865 188.085 L184.826 190.806 L184.511 190.811 L184.506 190.496 L182.588 190.5 L182.551 190.811 L182.242 190.8 L182.25 190.172 L181.621 190.184 L181.607 190.811 C181.157 190.736 180.814 190.537 180.339 190.477 C180.561 190.356 180.708 190.333 180.976 190.325 L180.98 189.529 C180.516 189.597 180.033 189.892 179.651 190.17 C179.553 190.074 179.452 189.993 179.363 189.866 C179.21 190.033 179.125 190.082 178.937 190.172 L179.036 189.529 L178.416 189.507 C178.418 189.049 178.529 188.831 178.737 188.438 C178.404 188.414 178.14 188.532 177.813 188.605 L177.794 195.176 C180.028 195.465 182.396 195.138 184.647 195.174 C185.064 195.181 185.262 195.498 185.619 195.541 C186.601 195.66 187.669 195.531 188.658 195.527 L188.78 195.298 C189.878 195.541 191.546 195.863 192.655 195.441 L192.803 202.979 L207.551 202.99 C207.639 204.241 207.209 205.515 207.294 206.836 L215.073 206.755 L214.973 214.207 L222.685 214.17 L222.669 218.053 C223.797 218.053 227.328 217.716 228.085 218.34 C228.561 217.967 229.112 218.022 229.695 218.087 C229.695 218.737 229.846 219.455 229.389 219.962 C229.734 220.38 229.691 220.735 229.703 221.258 L230.184 221.258 L230.262 214.169 L222.685 214.17 L222.738 206.798 L215.073 206.755 C215.341 205.941 215.192 204.911 215.19 204.057 C215.185 202.453 215.189 200.849 215.189 199.245 L207.673 199.268 L207.695 195.338 C204.035 195.284 200.372 195.311 196.712 195.324 C195.568 195.328 193.694 195.082 192.655 195.441 L192.674 187.907 C191.322 187.907 185.728 187.714 184.865 188.085 C185.264 186.379 185.039 184.029 185.024 182.253 C184.998 179.103 185.024 175.954 185.021 172.804 L177.658 172.794 L177.644 165.377 L170.198 165.389 L170.167 142.728 L177.618 142.737 L177.627 135.161 L185.067 135.202 L185.139 105.09 L192.748 105.154 C192.794 103.636 192.744 102.116 192.755 100.597 C192.762 99.665 192.916 98.555 192.682 97.655 L207.767 97.633 L207.792 82.807 L200.211 82.8 L200.193 75.25 L215.303 75.303 L215.324 82.756 L222.915 82.777 C222.915 85.036 223.201 88.148 222.829 90.302 L215.38 90.294 L215.346 97.651 L222.858 97.67 L222.829 90.302 L230.355 90.286 C230.349 86.547 230.314 82.809 230.326 79.071 C230.328 78.552 230.46 75.59 230.209 75.382 C229.863 75.094 223.739 75.283 222.808 75.283 L222.838 67.915 L230.34 67.91 L230.244 52.805 L219.031 52.863 C219.011 53.422 219.198 56.123 218.974 56.375 C218.621 56.773 216.691 56.563 216.105 56.573 C213.249 56.625 210.389 56.565 207.533 56.565 C207.532 55.277 207.794 54.029 207.692 52.726 L200.254 52.613 C200.216 52.338 200.227 52.254 200.382 52.02 C200.198 51.738 200.212 51.671 200.383 51.37 C200.048 50.666 200.21 49.704 200.21 48.933 L196.557 48.898 L196.54 45.101 L192.774 45.126 L192.79 41.475 L189.135 41.441 L189.131 37.693 L185.366 37.73 C185.217 35.127 185.354 32.513 185.384 29.914 C185.396 28.843 185.239 27.728 185.359 26.666 L189.124 26.688 L189.144 22.874 C189.793 22.87 190.393 23.038 191.023 23.045 C192.79 23.065 194.605 22.934 196.364 23.075 C196.348 23.336 196.226 23.559 196.22 23.812 C196.203 24.559 196.386 25.332 196.369 26.103 C196.358 26.63 196.198 27.116 196.21 27.664 C196.217 27.986 196.357 28.272 196.363 28.592 C196.367 28.88 196.212 29.153 196.23 29.43 C196.245 29.652 196.356 29.849 196.364 30.09 L192.523 30.061 L192.582 37.882 L199.946 37.939 L199.977 45.306 L203.788 45.341 L203.806 49.152 C204.982 49.152 206.241 49.282 207.408 49.143 C207.717 49.106 207.893 48.874 208.222 48.852 L208.243 49.152 C208.809 49.151 209.308 48.957 209.876 48.965 C210.189 48.969 210.473 49.121 210.786 49.152 L210.786 47.871 C210.58 48.147 210.5 48.18 210.156 48.191 L210.22 47.569 C209.453 47.525 208.951 47.848 208.222 47.886 L208.206 48.191 L207.902 48.175 L207.902 45.611 L211.096 45.617 L211.184 49.152 L230.307 49.125 L230.26 26.693 L226.449 26.683 L226.435 22.927 L222.7 22.889 L222.676 15.299 L215.309 15.245 L215.254 7.83 C202.774 7.83 190.28 7.856 177.801 7.805 C177.76 8.707 177.915 14.734 177.678 15.025 C177.365 15.409 174.63 15.208 174.001 15.244 C171.344 15.398 168.657 15.363 165.996 15.393 C164.948 15.404 163.866 15.303 162.825 15.419 L162.756 37.61 L170.241 37.704 L170.197 60.216 L162.696 60.259 L162.741 45.279 L155.325 45.267 C155.209 37.792 155.283 30.326 155.313 22.848 L139.976 22.895 L139.985 26.581 L128.614 26.542 L128.627 30.291 L124.943 30.273 L124.952 34.115 L121.187 34.105 L121.159 37.892 L117.633 37.875 L117.572 45.343 L109.989 45.345 L110.031 49.152 C115.963 49.152 121.874 49.036 127.801 49.036 C130.668 49.036 133.558 49.23 136.432 49.116 L136.468 45.306 C137.456 45.306 138.53 45.187 139.509 45.318 C139.854 45.364 140.109 45.597 140.476 45.607 C142.77 45.667 145.072 45.592 147.366 45.589 C147.441 46.681 147.13 47.926 147.428 48.979 Z M275.731 82.925 C275.09 82.727 274.417 82.818 273.753 82.799 C271.839 82.746 269.91 82.769 267.996 82.801 L268.075 97.667 L283.082 97.656 C282.86 98.502 283.016 99.555 283.018 100.435 C283.021 102.009 282.952 103.584 282.969 105.158 L290.58 105.116 C290.838 107.516 290.569 110.037 290.625 112.455 C290.803 120.029 290.618 127.629 290.619 135.207 L298.168 135.283 L298.119 142.734 L302.11 142.746 L302.127 124.174 C302.412 124.166 302.51 124.208 302.747 124.374 C302.967 124.197 303.074 124.162 303.356 124.148 L303.451 124.399 L305.614 124.402 L305.653 120.434 L309.46 120.469 L309.501 116.664 L313.228 116.645 L313.22 112.96 C314.523 112.817 315.883 112.914 317.193 112.913 C319.407 112.911 321.63 112.974 323.843 112.912 C324.191 112.902 324.51 112.763 324.859 112.755 C325.887 112.731 326.932 112.836 327.955 112.743 L328.028 90.23 L335.637 90.235 L335.667 112.718 L343.181 112.729 L343.168 120.253 L358.143 120.247 L358.181 112.739 L365.832 112.714 L365.786 97.651 L373.232 97.674 L373.243 90.245 L380.773 90.281 L380.768 82.845 C379.315 82.682 377.78 82.842 376.316 82.838 C373.164 82.829 370.012 82.821 366.861 82.812 C366.194 82.81 362.416 82.967 362.126 82.668 C361.799 82.33 361.962 79.666 361.962 79.057 L365.644 79.062 L365.68 71.481 L373.433 71.505 L373.439 75.191 C376.961 75.234 380.485 75.162 384.007 75.179 C384.367 75.18 384.644 75.402 384.991 75.428 C385.994 75.502 387.028 75.433 388.034 75.433 C388.056 76.339 388.286 77.864 387.785 78.629 C387.95 78.835 388.321 78.992 388.395 79.237 C388.655 80.094 388.448 81.299 388.444 82.192 C388.435 84.824 388.29 87.557 388.494 90.179 L396.02 90.191 L395.912 67.876 C393.421 67.877 390.97 67.753 388.481 67.754 C388.375 66.742 388.519 65.685 388.51 64.665 C388.497 63.21 388.375 61.741 388.374 60.273 C383.351 60.057 378.286 60.226 373.254 60.218 C368.37 60.209 363.148 59.976 358.3 60.311 L358.284 75.294 L350.605 75.232 L350.611 79.134 L354.449 79.128 L354.441 90.184 C353.319 90.253 352.057 90.317 350.938 90.194 C350.596 90.156 350.446 89.865 350.066 89.86 C346.696 89.817 343.345 89.979 339.982 89.982 C339.835 90.188 339.818 90.169 339.544 90.166 L339.598 79.279 L343.347 79.262 L343.372 75.256 L335.631 75.251 L335.64 82.768 L320.616 82.82 L320.59 105.252 L312.993 105.249 L313.04 90.206 L305.589 90.233 L305.612 82.785 L298.009 82.781 L298.072 75.253 L313.05 75.215 L313.122 82.766 L320.572 82.771 L320.583 75.292 L328.01 75.22 L328.001 67.77 L350.556 67.792 L350.481 60.072 C349.991 60.036 349.649 60.094 349.264 59.758 C349.061 59.943 348.965 60.003 348.7 60.049 C348.769 59.945 348.838 59.842 348.911 59.74 C348.544 59.341 348.197 58.857 347.649 58.767 L347.637 59.076 L347.329 59.088 C347.246 56.8 347.317 54.5 347.317 52.211 C347.317 51.254 347.169 50.322 347.227 49.364 L348.268 49.357 C348.273 49.512 348.262 49.645 348.244 49.793 L347.637 49.827 L347.671 51.075 L348.152 51.075 C348.088 51.185 348.03 51.297 347.97 51.407 C348.276 51.714 348.475 51.967 348.911 52.037 L348.946 51.396 C349.779 51.988 349.583 52.335 350.502 51.415 C350.269 51.129 350.116 50.935 350.062 50.567 C350.397 50.757 350.516 51.127 350.843 51.328 C351.041 51.45 351.296 51.352 351.502 51.459 C352.03 51.733 352.057 51.916 352.741 52.161 L352.737 52.678 C352.233 52.678 351.89 52.723 351.501 52.375 C351.166 52.645 350.95 52.675 350.525 52.684 L350.531 53.96 C350.822 53.923 350.88 53.875 351.064 53.639 C351.381 53.806 351.445 53.909 351.483 54.273 C351.375 54.169 351.261 54.072 351.149 53.974 C350.511 54.612 350.522 54.997 350.522 55.878 C351.008 55.884 351.204 55.698 351.63 55.563 L351.497 55.854 C351.779 56.195 351.99 56.475 352.445 56.501 L352.361 55.883 C352.542 55.979 352.623 56.029 352.767 56.202 C353.24 55.768 353.872 55.756 354.352 56.187 C354.586 55.989 354.702 55.912 355.006 55.886 C354.896 55.996 354.805 56.108 354.711 56.226 L355.334 56.839 C355.558 56.6 355.642 56.525 355.968 56.514 C355.555 56.948 355.333 57.154 355.329 57.772 C355.733 57.747 356.035 57.503 356.467 57.453 L356.402 57.165 C356.822 57.305 357.121 57.456 357.573 57.535 C357.465 57.838 357.185 57.888 356.934 58.124 C356.343 57.589 355.74 57.97 355.025 57.972 L355.009 58.757 L355.96 58.767 C354.92 60.12 357.321 60.106 358.085 60.09 L358.112 52.642 L365.558 52.628 L365.585 49.667 L364.959 49.652 C364.95 49.838 364.911 49.972 364.86 50.114 C364.741 50.002 364.693 49.981 364.612 49.797 C364.228 49.944 364.048 50.041 363.911 50.434 C363.506 50.433 363.32 50.391 363.009 50.128 L362.583 50.434 L362.701 49.918 L362.174 49.884 L362.029 50.434 C361.748 50.331 361.923 50.194 361.971 49.887 C361.683 49.956 361.491 50.081 361.194 50.079 L361.098 49.797 C360.24 49.788 359.616 49.581 359.166 50.435 L358.846 50.453 L359.175 49.671 C358.894 49.685 358.76 49.723 358.534 49.895 L358.593 49.152 C358.724 49.272 358.858 49.439 359.043 49.464 C359.385 49.509 361.028 49.526 361.333 49.45 C361.561 49.394 361.685 49.182 361.933 49.159 C362.977 49.061 364.096 49.322 365.128 49.138 C365.281 49.111 365.396 49.01 365.488 48.89 C365.751 48.548 365.656 46.048 365.656 45.474 L358.022 45.496 C358.358 44.674 358.225 39.081 358.165 37.861 L354.426 37.825 L354.414 34.098 L350.738 34.085 L350.739 30.32 L343.095 30.289 L343.092 26.627 L335.72 26.625 L335.703 22.885 L313.123 22.952 L313.084 30.356 L320.374 30.388 L320.382 45.281 L313.036 45.3 L313.071 60.282 L305.634 60.285 L305.599 18.843 L312.888 18.86 L312.913 15.415 L298.194 15.226 L298.113 7.812 C287.934 7.819 277.711 7.49 267.542 7.844 C265.207 7.926 262.846 7.703 260.516 7.876 L260.482 15.221 L252.991 15.322 L253.04 22.932 L249.311 22.969 L249.273 26.702 L245.463 26.742 L245.484 49.152 L253.016 49.152 L253.022 45.471 C254.678 45.476 256.334 45.499 257.989 45.512 C258.64 45.518 259.429 45.65 260.064 45.504 C260.228 45.466 260.391 45.346 260.487 45.209 C260.593 45.057 260.463 42.012 260.463 41.521 L264.212 41.56 C264.218 40.485 264.059 39.347 264.168 38.28 C264.205 37.916 264.583 37.781 264.621 37.434 C264.733 36.442 264.595 35.408 264.646 34.41 L267.902 34.38 C267.901 33.232 267.844 32.087 267.894 30.939 C267.911 30.56 268.124 30.244 268.148 29.866 C268.215 28.833 268.155 27.777 268.155 26.742 L271.576 26.718 L271.637 22.903 C272.216 22.844 272.676 23.004 273.227 23.034 C274.052 23.078 274.883 23.047 275.709 23.046 L275.709 19.223 C277.073 19.046 278.539 19.187 279.916 19.181 C282.17 19.171 284.423 19.091 286.602 19.026 C286.728 21.001 286.498 23.024 286.497 25.005 C286.497 25.418 286.447 25.876 286.525 26.283 C286.582 26.576 286.754 26.774 286.757 27.09 C286.762 27.703 286.622 28.323 286.614 28.95 C286.578 31.941 286.597 34.932 286.601 37.923 C285.623 37.924 284.527 37.79 283.585 38.031 C283.405 37.799 283.299 37.709 283.031 37.615 C282.902 38.304 283.176 38.864 283.252 39.538 L283.859 39.504 L283.706 38.898 C284.178 39.101 284.166 39.378 284.204 39.858 L284.821 39.834 C284.822 39.383 284.872 38.949 285.112 38.576 L285.193 39.537 C285.535 39.467 285.75 39.262 286.102 39.217 C286.16 38.928 286.123 38.986 286.373 38.897 L286.393 41.14 L282.627 41.14 L282.598 44.952 L279.052 45.012 L279.026 48.832 L275.297 48.869 L275.271 52.757 L271.746 52.749 C271.72 53.866 271.793 54.988 271.76 56.103 C271.75 56.479 271.535 56.797 271.531 57.179 C271.465 63.214 271.552 69.249 271.553 75.284 L275.619 75.27 C275.689 77.446 275.187 80.956 275.731 82.925 Z M252.934 90.317 L252.983 97.632 L260.348 97.628 L260.349 90.347 L252.934 90.317 C252.7 89.434 252.822 88.438 252.824 87.529 C252.829 85.954 252.813 84.378 252.813 82.802 L260.403 82.756 L260.42 75.31 L268.076 75.255 C268.257 68.801 268.003 62.335 268.06 55.878 C268.069 54.905 267.994 53.883 268.123 52.917 C268.161 52.629 268.395 52.441 268.418 52.164 C268.482 51.401 268.41 50.611 268.416 49.844 L268.155 49.786 L268.155 49.465 L271.964 49.46 L271.987 41.783 L275.671 41.781 L275.696 37.895 L279.351 37.865 L279.37 34.343 L283.183 34.317 L283.119 22.872 C282.267 22.872 281.408 22.9 280.556 22.869 C280.267 22.859 279.997 22.705 279.706 22.761 C279.461 22.807 279.211 22.983 279.138 23.23 C278.86 24.167 279.135 25.423 279.077 26.399 L275.231 26.398 L275.185 30.037 L271.579 30.033 L271.539 41.46 L267.853 41.461 L267.834 45.047 L264.019 45.055 L263.982 48.864 L260.222 48.837 L260.256 52.678 C257.96 52.678 255.661 52.642 253.365 52.679 C252.991 52.685 252.64 52.822 252.263 52.822 C249.995 52.818 247.725 52.742 245.456 52.752 C245.456 57.79 245.322 62.833 245.43 67.876 L252.925 67.856 L252.898 75.3 L245.447 75.266 L245.415 90.23 C247.017 90.231 248.619 90.217 250.221 90.215 C251.112 90.214 252.062 90.124 252.934 90.317 Z M350.692 82.502 L342.966 82.517 L342.991 86.943 C343.846 86.951 346.631 86.788 347.294 87.007 C347.543 87.089 347.754 87.358 347.961 87.516 C348.057 87.423 348.156 87.334 348.255 87.243 L348.554 87.301 C348.622 87.581 348.691 87.687 348.9 87.887 L349.352 87.524 L349.24 88.227 L349.857 88.253 L349.881 88.87 L350.5 88.894 C350.545 88.246 350.486 87.644 350.411 87.003 C351.009 86.175 350.695 83.569 350.692 82.502 Z M410.913 142.573 C409.781 142.295 408.422 142.492 407.257 142.503 L407.249 135.465 L403.164 135.443 L403.285 150.375 L410.89 150.376 L410.913 142.573 C411.923 142.819 413.138 142.645 414.178 142.636 C415.582 142.625 417.006 142.722 418.418 142.722 L418.45 112.835 L414.684 112.822 L414.669 109.014 L410.984 109.042 L410.999 105.219 L395.949 105.255 L395.96 97.723 L388.376 97.729 L388.347 105.249 L373.223 105.269 L373.246 109.405 C380.521 109.405 387.818 109.336 395.067 109.344 C395.067 109.473 395.061 109.598 395.055 109.726 L391.882 109.739 C392.776 110.641 392.255 111.025 393.113 111.963 C392.817 111.942 392.743 111.892 392.533 111.677 C392.184 111.946 391.919 112.161 391.882 112.61 C392.431 112.61 392.969 112.512 393.46 112.774 C393.568 112.698 393.678 112.628 393.787 112.554 C393.894 112.633 393.998 112.712 394.109 112.786 C394.738 112.431 395.083 112.651 395.712 112.877 L395.781 120.087 L388.123 120.098 C388.124 122.324 387.848 125.635 388.412 127.703 L403.311 127.721 L403.36 112.581 L406.609 112.525 L406.603 109.726 L404.045 109.731 L404.039 110.046 L403.724 110.052 L403.653 110.326 L403.118 110.298 L403.035 110.046 L402.554 110.046 C402.42 110.261 402.475 110.249 402.363 110.051 L401.806 110.046 L401.801 110.362 L400.844 110.367 C400.882 110.747 400.982 110.863 401.322 111.031 C401.332 111.161 401.333 111.288 401.336 111.417 C400.96 111.275 400.878 110.924 400.534 110.749 C400.175 110.565 399.636 110.701 399.237 110.578 C399.29 110.137 399.574 110.026 399.871 109.717 L395.712 109.719 C395.714 109.59 395.723 109.465 395.731 109.338 C398.083 109.339 400.383 109.405 402.73 109.405 C404.139 109.405 405.524 109.246 406.929 109.435 C406.945 110.426 406.825 111.492 406.95 112.473 C406.986 112.76 407.286 112.88 407.319 113.173 C407.435 114.221 407.302 115.306 407.353 116.359 L410.134 116.346 L410.104 115.815 C409.562 115.815 409.012 115.932 408.855 115.312 L409.165 115.396 C409.454 115.114 409.566 115.187 409.83 115.48 L410.121 115.345 L410.134 114.552 C410.288 114.543 410.44 114.534 410.596 114.533 C410.597 114.913 410.489 115.259 410.476 115.627 C410.463 115.991 410.59 116.407 410.621 116.777 L414.621 116.784 L414.614 117.097 L414.337 117.141 C414.332 119.144 414.441 121.201 414.381 123.187 C413.659 122.938 414.175 122.226 413.018 122.226 C413.085 122.678 413.321 122.804 413.659 123.08 L413.372 123.519 L413.783 123.844 L413.659 125.743 C413.814 125.746 413.963 125.743 414.118 125.736 L414.135 125.11 L414.455 125.11 C414.461 125.406 414.331 125.623 414.307 125.911 C414.262 126.437 414.298 126.984 414.301 127.512 C414.32 131.727 414.378 135.952 414.365 140.162 C414.236 140.166 414.109 140.169 413.98 140.168 L413.975 138.891 C413.676 138.86 413.553 138.78 413.316 138.593 C413.062 138.832 412.949 138.892 412.602 138.859 C412.745 138.533 412.955 138.315 413.018 137.965 L412.413 137.932 L412.336 137.288 C412.065 137.342 411.936 137.463 411.708 137.609 L411.711 136.968 L410.775 136.994 C410.777 137.919 410.873 138.844 410.877 139.778 C410.881 140.701 410.76 141.661 410.913 142.573 Z M305.596 165.393 L298.146 165.37 L298.13 172.789 L290.859 172.805 L290.816 188.021 L283.05 187.973 L282.897 195.263 L267.929 195.263 L267.919 199.307 L260.581 199.299 L260.572 206.669 L252.915 206.748 C252.917 207.755 252.879 208.787 252.943 209.791 C252.957 210.023 253.086 210.224 253.1 210.449 C253.179 211.676 252.925 212.947 253.053 214.186 L256.578 214.194 L256.617 210.387 C257.336 210.327 258.281 210.192 258.872 210.649 C258.991 210.528 259.101 210.452 259.231 210.361 C259.701 210.727 260.202 210.708 260.783 210.631 C260.783 209.838 260.617 208.846 260.954 208.118 C261.112 208.118 261.268 208.123 261.424 208.128 C261.424 208.709 261.288 209.297 261.772 209.693 C261.988 209.485 262.076 209.432 262.371 209.4 L262.386 210.026 C262.849 209.984 263.168 209.728 263.668 209.708 L263.553 209.087 C263.707 209.084 263.841 209.096 263.988 209.114 L264.023 209.72 L264.95 209.686 L264.984 209.079 C265.275 209.12 265.364 209.179 265.578 209.387 C265.812 209.183 265.924 209.106 266.232 209.083 C266.229 210.125 265.151 210.242 265.972 211.063 C266.145 211.236 266.329 211.487 266.554 211.591 C266.927 211.762 267.205 211.557 267.467 211.323 C267.594 211.417 267.7 211.495 267.815 211.621 C267.899 211.502 268.006 211.416 268.097 211.323 C268.225 211.416 268.333 211.494 268.45 211.616 C268.568 211.526 268.679 211.438 268.789 211.329 L268.796 212.275 C269.096 212.251 269.189 212.16 269.412 211.964 L269.437 212.901 C270.263 212.86 270.125 212.09 270.654 211.734 C270.857 211.597 271.103 211.684 271.322 211.605 C271.543 211.525 271.659 211.311 271.921 211.336 C272.138 211.356 272.229 211.562 272.414 211.646 C273.024 211.923 273.899 211.919 274.244 212.578 C273.691 212.624 273.52 212.537 273.405 211.984 L272.001 212.055 L272.012 212.925 C272.376 212.87 272.597 212.635 272.962 212.612 C272.894 212.879 272.942 212.834 272.67 212.921 C272.581 213.345 272.455 213.51 272.019 213.561 L272.297 213.271 C271.917 212.79 271.663 212.588 271.039 212.624 L271.02 213.246 L270.078 213.265 C270.153 213.696 270.41 213.898 270.714 214.203 C270.948 213.984 271.043 213.911 271.36 213.908 L271.339 214.207 L270.719 214.228 L270.74 215.489 C271.046 215.446 271.216 215.306 271.485 215.169 L271.367 215.81 C271.822 215.738 272.159 215.511 272.642 215.455 C272.62 215 272.749 214.651 272.783 214.207 L273.103 214.207 C273.178 214.632 273.419 214.871 273.603 215.236 C273.07 215.213 272.723 215.617 272.642 216.12 C273.129 216.134 273.321 215.951 273.748 215.81 C273.703 215.918 273.662 216.032 273.613 216.14 C273.899 216.448 273.923 216.638 273.924 217.053 L274.526 217.092 L274.606 216.451 C275.075 216.626 274.885 218.423 274.885 218.976 L275.407 219.015 L275.423 213.817 C276.783 214.292 278.544 213.875 279.952 213.856 C280.917 213.844 281.874 213.955 282.84 213.955 L282.841 209.72 L282.28 209.72 C282.252 210.099 282.315 210.52 282.239 210.891 C282.182 211.169 281.979 211.344 281.932 211.643 C281.776 211.643 281.621 211.639 281.465 211.635 L281.614 211.027 C281.192 210.992 280.972 210.977 280.652 210.684 C280.362 210.95 279.489 211.556 279.135 211.643 C278.903 211.086 278.511 211.064 278.1 210.691 C277.88 210.919 277.788 210.982 277.473 210.993 C277.674 210.775 277.732 210.681 277.77 210.391 C277.206 210.337 276.893 210.375 276.423 210.682 C276.229 210.466 276.156 210.407 275.877 210.361 L275.872 210.991 L275.564 211.002 L275.553 210.396 L274.244 210.343 C274.242 209.768 274.059 209.558 273.76 209.093 L274.248 209.119 L274.276 209.678 L274.885 209.703 C274.888 209.121 275.126 208.556 275.52 208.124 C275.232 207.799 275.213 207.581 275.187 207.156 C274.751 207.158 274.56 207.217 274.215 207.477 C273.993 207.272 273.905 207.187 273.603 207.178 L273.695 207.797 C273.467 207.717 273.448 207.715 273.298 207.502 L272.533 208.114 L272.49 207.836 C273.074 207.487 272.91 207.267 272.642 206.764 L273.27 206.836 C273.252 206.531 273.167 206.435 272.962 206.208 C273.225 205.866 273.282 205.681 273.283 205.246 C272.955 205.273 272.799 205.458 272.496 205.554 C272.543 205.442 272.58 205.326 272.623 205.215 C271.945 204.537 271.952 204.772 271.128 204.57 C270.681 204.461 270.488 204.246 269.97 204.276 C269.655 204.294 269.439 204.456 269.116 204.429 C269.279 204.167 269.434 204.188 269.757 204.14 L269.757 203.659 L269.144 203.631 L269.116 203.338 L268.458 203.158 L268.457 204.592 L268.155 204.574 L268.155 202.971 C268.799 202.94 269.567 202.874 270.09 203.277 C270.61 202.844 271.331 202.99 271.98 202.99 L272.001 199.486 C272.484 199.45 272.988 199.304 273.453 199.286 C273.911 199.269 274.405 199.393 274.876 199.395 L274.885 199.706 C274.225 199.748 273.609 199.576 272.962 199.649 C272.963 199.804 272.974 199.953 272.986 200.105 C273.394 200.107 273.632 200.331 273.984 200.37 C274.369 200.413 274.596 200.12 274.885 200.441 L273.924 200.521 L273.939 201.067 C274.77 201.07 274.821 201.595 275.516 201.708 C275.534 201.128 275.333 200.328 275.929 200.047 L276.152 200.746 L276.473 200.746 L276.488 201.693 L277.033 201.708 L277.182 201.067 L277.449 201.12 C277.366 201.339 277.168 201.587 277.148 201.82 C277.093 202.463 277.954 202.67 278.411 202.665 L278.415 202.028 L278.735 202.028 L278.731 202.667 C279.031 202.635 279.133 202.541 279.36 202.349 C279.581 202.517 279.772 202.844 280.035 202.946 C280.341 203.064 280.502 202.738 280.773 202.686 C281.138 202.615 281.569 202.663 281.936 202.701 C281.989 202.973 282.157 203.128 282.229 203.381 C282.331 203.738 282.257 204.201 282.257 204.571 L282.856 204.572 L282.861 198.885 L290.543 198.856 L290.549 195.183 L297.991 195.207 L297.962 187.76 L305.613 187.739 L305.596 165.393 L313.277 165.314 L313.192 172.602 C314.096 172.705 315.049 172.595 315.961 172.586 C317.696 172.568 319.431 172.564 321.167 172.553 C325.973 172.523 330.779 172.619 335.584 172.646 L335.66 150.325 L343.133 150.299 L343.118 142.775 L350.726 142.769 L350.704 135.32 L358.294 135.277 C358.278 139.443 358.334 143.61 358.311 147.776 C358.305 148.818 358.41 152.24 358.018 152.994 C358.091 153.135 358.183 153.259 358.198 153.422 C358.223 153.706 358.02 153.958 358.01 154.246 C357.972 155.351 358.088 156.479 357.967 157.577 L350.552 157.601 L350.609 165.212 L343.194 165.252 C343.065 167.939 343.242 170.641 343.302 173.316 C343.353 175.61 343.314 177.908 343.338 180.202 L357.573 180.184 L357.623 179.914 L357.944 179.914 C357.935 180.041 357.93 180.169 357.918 180.297 L365.73 180.305 L365.724 172.554 L362.06 172.553 L362.07 176.389 L357.903 176.389 C357.874 177.358 357.968 178.291 357.946 179.273 C357.818 179.27 357.697 179.258 357.573 179.246 L357.556 177.372 C357.353 177.607 357.288 177.647 356.98 177.671 C356.735 176.829 355.778 176.7 355.009 176.716 C355.011 177.354 355.175 177.498 355.661 177.867 C355.563 178.083 355.498 178.162 355.315 178.312 C354.974 178.032 354.838 177.724 354.368 177.689 L354.349 178.312 C353.918 178.382 353.774 178.581 353.558 178.953 L353.243 178.943 L352.766 178.312 C352.533 178.537 352.445 178.61 352.124 178.605 L352.097 177.991 L351.328 178.024 C351.322 178.297 351.309 178.427 351.176 178.632 L351.129 177.991 L350.606 178.029 C350.602 178.356 350.636 178.469 350.388 178.632 L350.432 177.991 C349.986 177.996 349.761 178.168 349.363 178.312 C349.194 177.964 348.963 177.769 348.919 177.378 C349.203 177.353 349.563 177.29 349.838 177.386 C350.029 177.453 350.143 177.653 350.361 177.653 C350.565 177.653 351.092 177.358 351.483 177.323 L351.456 176.389 C351.022 176.39 350.829 176.456 350.482 176.709 C350.175 176.409 350.008 176.187 349.56 176.189 L349.56 176.67 L348.104 176.736 C348.185 177.413 348.534 178.094 348.598 178.632 L347.958 178.631 L347.957 177.991 C347.84 177.926 347.743 177.856 347.637 177.785 C347.714 177.285 347.684 177.059 347.287 176.725 L347.003 176.872 L347.364 175.748 C347.549 176.234 347.698 176.594 348.234 176.709 C348.306 176.241 348.523 175.89 348.599 175.445 C348.913 175.453 349.012 175.526 349.247 175.74 C349.355 175.611 349.459 175.527 349.581 175.427 C349.575 175.57 349.576 175.719 349.56 175.867 L350.842 175.748 L350.688 175.107 C351.037 175.226 351.218 175.493 351.51 175.722 C351.848 175.383 352.094 175.187 352.124 174.694 C351.858 174.674 351.677 174.681 351.483 174.559 C351.949 174.337 352.234 174.156 352.765 174.13 L352.75 173.504 L349.24 173.489 C349.242 173.36 349.251 173.234 349.259 173.107 L358.534 173.171 L358.534 169.645 C359.952 169.612 361.879 170.002 363.139 169.338 C363.211 169.429 363.285 169.507 363.352 169.627 C363.755 169.632 363.939 169.619 364.237 169.338 C364.713 169.604 365.049 169.607 365.588 169.669 C365.67 170.096 365.902 170.319 365.906 170.787 C365.381 171.142 365.589 171.999 365.59 172.583 L373.16 172.646 L373.125 154.154 L365.934 154.158 L365.878 150.367 L362.039 150.37 L362.041 142.758 L365.846 142.766 L365.84 139.002 L376.897 139.015 L376.938 142.752 L380.744 142.796 L380.795 150.362 L376.878 150.388 C376.903 152.845 377.042 155.285 377 157.742 C376.958 160.244 376.757 162.832 376.947 165.327 L380.702 165.326 C380.702 162.935 380.531 160.501 380.682 158.115 C380.705 157.763 380.945 157.507 380.962 157.152 C381.008 156.182 380.883 155.188 381.008 154.226 L384.815 154.224 L384.815 150.778 L388.301 150.722 L388.276 127.686 L380.984 127.674 L380.955 112.625 C380.239 112.592 379.335 112.799 378.745 112.347 C378.336 112.623 378.152 112.637 377.764 112.324 C377.645 112.441 377.532 112.52 377.402 112.61 C377.306 112.525 377.23 112.466 377.14 112.35 L376.708 112.61 C376.343 112.265 376.165 112.382 375.757 112.61 C375.196 112.127 374.849 112.786 374.23 112.344 C374.143 112.463 374.07 112.523 373.978 112.61 L373.918 110.266 L373.365 110.271 C373.367 111.288 373.249 112.275 373.215 113.274 C373.136 115.622 373.158 117.975 373.192 120.322 L365.9 120.317 C365.778 121.345 366.125 127.214 365.758 127.578 C365.443 127.889 363.756 127.735 363.261 127.737 C360.91 127.745 358.56 127.74 356.209 127.73 C346.862 127.688 337.513 127.734 328.166 127.734 L328.13 142.69 L313.018 142.724 L313.009 127.687 L320.442 127.69 L320.536 120.324 L328.031 120.247 L328.028 116.481 C326.868 116.39 325.691 116.479 324.527 116.455 C324.262 116.45 324.027 116.296 323.769 116.301 C323.593 116.304 323.455 116.438 323.28 116.433 C323.055 116.426 322.862 116.28 322.625 116.273 C320.624 116.219 318.618 116.266 316.616 116.266 L316.62 120.094 L312.866 120.101 L312.874 123.926 L309.222 123.953 L309.231 127.638 L305.34 127.674 C305.219 132.488 305.233 137.353 305.333 142.168 C305.343 142.636 305.655 142.977 305.656 143.444 C305.673 150.753 305.415 158.088 305.596 165.393 Z M177.634 150.32 L177.674 157.766 C183.423 157.756 189.176 157.893 194.914 157.924 C201.61 157.96 208.316 157.892 215.017 157.921 L215.067 172.507 C212.641 172.287 210.164 172.543 207.733 172.543 L207.698 180.353 L215.435 180.368 L215.422 172.767 C217.362 173.08 219.34 172.988 221.308 172.986 C224.245 172.984 227.182 172.97 230.119 172.975 L230.131 188.003 L233.958 188.032 L234.027 206.743 L241.807 206.734 L241.856 188.002 L245.617 188.016 L245.597 172.863 C248.96 172.863 252.316 172.967 255.687 172.973 C257.236 172.976 258.867 173.129 260.384 172.799 L260.399 180.334 L267.899 180.331 L267.934 172.543 L260.703 172.543 L260.706 157.914 C267.702 157.852 274.702 157.944 281.693 157.912 C287.171 157.886 292.653 157.722 298.136 157.751 L298.195 150.343 C292.982 150.344 287.762 150.16 282.557 150.152 C275.292 150.141 268.022 150.245 260.751 150.17 L260.691 135.312 L267.944 135.363 L267.9 127.644 L260.269 127.615 L260.252 135.086 L245.674 135.092 L245.638 120.036 L241.663 120.073 L241.645 97.622 L234.122 97.649 L234.073 120.082 L230.107 120.051 L230.065 135.083 L215.372 135.134 L215.362 127.615 L207.833 127.635 L207.779 135.336 L215.068 135.307 L215.01 150.182 Z M57.489 112.964 L57.453 146.306 L61.265 146.282 L61.265 150.141 C62.402 150.147 63.812 150.301 64.909 149.996 C65.463 150.442 66.439 150.269 67.057 150.031 C67.637 150.278 67.902 150.081 68.486 150.039 C69.021 150.644 71.681 150.389 72.554 150.396 L72.59 135.399 L64.767 135.401 L64.788 112.923 Z M373.598 142.737 L369.431 142.696 L369.431 150.429 L373.589 150.429 Z M425.962 146.466 L418.558 146.496 L418.582 150.383 L422.018 150.346 C421.983 152.779 422.147 155.168 422.147 157.601 L425.797 157.619 C425.802 153.903 425.92 150.191 425.962 146.466 Z M49.971 154.039 C50.002 156.554 49.922 159.028 49.904 161.544 L53.606 161.542 L53.589 157.71 L57.212 157.735 L57.229 154.004 Z M79.835 165.402 C79.66 166.517 79.633 171.712 79.882 172.722 C79.155 172.535 78.328 172.645 77.577 172.641 C75.84 172.633 74.103 172.638 72.367 172.638 L72.433 180.267 L79.952 180.298 L79.987 184.354 L87.075 184.407 L87.102 187.905 L94.825 188.065 L94.858 195.391 C103.792 195.388 112.739 195.246 121.68 195.271 C122.659 195.273 123.667 195.208 124.642 195.286 C124.937 195.31 125.129 195.544 125.424 195.555 C127.878 195.651 130.402 195.633 132.856 195.53 C132.855 194.174 132.6 192.953 132.581 191.617 L117.244 191.586 L117.269 187.903 C112.474 187.762 107.653 188.063 102.863 187.844 C102.568 187.831 102.303 187.687 102.012 187.674 C100.954 187.624 99.89 187.735 98.833 187.658 C98.834 186.973 99.023 184.575 98.603 184.137 C98.376 183.901 96.201 184.133 95.723 184.143 C92.928 184.202 90.115 184.117 87.317 184.124 C87.287 182.936 87.526 181.544 87.257 180.394 L94.856 180.461 L94.884 172.761 L87.207 172.795 C87.403 172.025 87.264 171.129 87.258 170.334 C87.246 168.706 87.245 167.078 87.241 165.45 L79.835 165.402 L79.904 157.8 L72.333 157.84 L72.333 165.451 Z M395.913 165.395 L403.594 165.474 L403.618 157.806 L395.858 157.8 L395.913 165.395 L388.503 165.449 L388.513 172.817 L380.825 172.752 L380.889 180.411 L388.461 180.42 C388.224 181.511 388.351 182.937 388.439 184.055 C390.952 184.054 393.382 184.284 395.897 184.285 L395.95 180.325 C394.252 180.261 392.542 180.312 390.843 180.327 C390.068 180.334 389.213 180.232 388.461 180.42 L388.513 172.817 L395.851 172.739 C395.519 173.9 395.771 175.47 395.771 176.688 L403.556 176.67 L403.564 172.668 C402.003 172.58 400.423 172.668 398.86 172.658 C397.921 172.652 396.745 172.463 395.851 172.739 Z M410.875 157.84 L410.808 169.224 L414.905 169.244 L414.855 165.467 L418.434 165.478 L418.43 157.884 Z M384.595 184.152 L384.607 187.79 L388.475 187.826 C388.484 186.593 388.261 185.391 388.469 184.205 Z M53.52 169.049 L53.619 187.856 L57.44 187.785 L57.407 191.587 L61.084 191.608 C61.081 191.033 61.216 190.376 61.185 189.821 C61.081 187.974 61.051 186.093 60.988 184.224 L57.408 184.16 C57.328 179.113 57.271 174.071 57.322 169.015 Z M426.027 172.636 L425.993 187.767 L429.764 187.759 L429.821 172.653 Z M136.116 191.132 L136.231 236.545 L140.097 236.532 C140.113 226.564 140.17 216.599 140.12 206.632 C140.101 202.832 140.282 199.026 140.102 195.228 L143.677 195.266 L143.633 191.421 L151.389 191.382 L151.351 180.445 L140.16 180.409 C140.172 181.454 140.234 182.528 140.168 183.572 C140.146 183.918 139.971 184.225 139.959 184.578 C139.926 185.624 140.098 186.743 139.945 187.779 C139.917 187.974 139.785 188.083 139.661 188.222 C139.846 188.462 139.962 188.593 139.959 188.888 C139.801 188.785 139.767 188.782 139.652 188.596 C139.171 188.986 138.995 189.19 138.354 189.226 L138.372 190.17 L138.686 190.156 C138.837 189.966 138.892 189.939 139.095 189.85 C139.05 190.005 139.027 190.147 139.001 190.303 L139.555 190.296 C139.613 189.955 139.648 189.877 139.955 189.717 L139.929 190.613 L139.338 190.517 L139.338 190.917 L139.939 190.99 L139.957 191.295 C139.639 191.299 139.392 191.146 139.079 191.134 C138.095 191.095 137.101 191.132 136.116 191.132 Z M380.825 191.594 L384.404 191.611 L384.396 188.029 C384.08 188.01 381.116 187.89 381.092 187.904 C380.702 188.13 380.732 191.077 380.825 191.594 C379.813 191.39 378.668 191.514 377.635 191.509 C375.526 191.5 373.416 191.497 371.307 191.501 C364.687 191.515 358.064 191.585 351.444 191.535 C348.725 191.514 345.883 191.945 343.165 191.589 L343.169 184.06 L313.097 184.024 C313.095 187.734 313.036 191.448 313.092 195.158 C313.11 196.41 312.919 197.849 313.196 199.068 L305.695 199.073 L305.714 214.05 L298.145 214.103 L298.146 221.633 L280.334 221.706 L280.334 222.186 C281.027 222.262 281.774 222.106 282.457 222.236 C282.735 222.289 282.914 222.494 283.212 222.54 L283.218 223.495 C283.595 223.502 284.037 223.437 284.405 223.522 C284.606 223.569 284.725 223.761 284.929 223.804 C285.104 223.841 285.293 223.798 285.46 223.875 C285.736 224.002 285.877 224.374 286.186 224.437 C286.47 224.495 286.759 224.183 287.064 224.165 L287.086 224.463 L287.384 224.485 L287.409 225.022 C287.929 225.022 288.334 225.199 288.821 225.237 C289.454 225.287 290.107 225.247 290.743 225.248 C290.75 225.774 290.805 226.32 290.762 226.844 C290.728 227.247 290.585 227.566 290.605 227.988 L291.23 227.973 L291.245 227.347 C291.82 227.505 291.554 227.964 291.245 228.294 C291.935 229.065 293.293 228.95 294.261 228.818 C294.006 227.597 294.208 226.508 294.285 225.258 L301.733 225.267 L301.716 217.604 L312.927 217.647 C313.036 216.491 312.933 215.314 312.989 214.154 C313.002 213.887 313.189 213.695 313.208 213.436 C313.295 212.303 313.233 211.133 313.226 209.996 C313.223 209.448 313.255 208.865 313.186 208.321 C313.163 208.135 313.011 208.009 313.02 207.814 C313.029 207.614 313.18 207.466 313.188 207.263 C313.263 205.481 313.259 203.695 313.26 201.908 C313.26 200.989 313.346 199.969 313.196 199.068 L316.847 199.058 C316.847 198.357 316.639 196.081 316.948 195.563 C317.075 195.35 317.24 195.341 317.457 195.298 L317.592 195.483 C318.062 195.482 318.461 195.346 318.908 195.313 C319.305 195.283 319.797 195.492 320.187 195.379 C320.918 195.166 320.58 192.345 320.629 191.631 L335.452 191.672 L335.472 195.248 L380.902 195.267 Z M61.231 195.388 L61.288 198.965 L64.748 198.987 L64.783 195.413 Z M154.783 195.308 C154.537 196.513 154.747 197.916 154.754 199.144 L162.645 199.144 L162.615 184.012 L155.102 184.006 C155.087 186.823 155.171 189.639 155.153 192.455 C155.148 193.206 155.443 194.853 154.783 195.308 Z M65.083 199.345 C65.07 200.129 65.085 200.924 65.039 201.707 C65.022 201.985 64.784 202.291 64.942 202.557 C65.234 203.05 71.327 202.799 72.274 202.776 L72.201 199.324 Z M76.058 202.969 C75.382 203.067 74.92 202.964 74.284 202.93 C74.088 202.919 73.928 203.046 73.736 203.062 C73.306 203.097 72.891 203.015 72.469 202.942 L72.487 206.43 L76.095 206.436 Z M147.743 202.864 C147.757 207.954 147.737 213.044 147.76 218.133 C147.77 220.4 147.622 222.741 147.81 224.998 C147.97 224.998 148.13 224.997 148.29 224.997 L148.318 221.258 C148.502 221.366 148.487 221.321 148.597 221.541 L149.212 221.578 C149.263 221.167 149.252 220.957 149.546 220.643 C149.588 221.086 149.68 221.742 149.538 222.169 C149.451 222.431 149.297 222.564 149.251 222.852 C149.727 222.863 149.907 222.641 150.321 222.558 C150.69 222.484 151.114 222.539 151.487 222.537 L149.89 220.94 L151.174 220.972 C150.951 221.193 150.876 221.27 150.89 221.578 C151.481 221.575 151.682 221.432 151.998 220.938 L152.435 221.237 C152.533 221.134 152.649 221.037 152.748 220.938 C152.979 221.104 153.105 221.212 153.39 221.258 L153.418 219.666 C153.087 219.978 152.951 220.275 152.51 220.275 L152.777 219.815 C152.147 219.841 150.985 220.514 150.533 219.862 L152.472 219.854 C152.203 219.481 151.901 219.178 151.833 218.733 C151.953 218.718 152.05 218.71 152.178 218.714 L152.244 219.335 L152.777 219.307 C152.78 218.584 152.994 218.376 153.714 218.373 L153.807 218.084 L154.343 218.053 C154.397 218.499 154.49 219.173 154.345 219.606 C154.281 219.797 154.081 219.913 154.077 220.129 C154.072 220.37 154.313 220.5 154.361 220.724 C154.439 221.095 154.375 221.52 154.399 221.899 L154.88 221.899 L154.94 214.144 L151.349 214.135 C151.355 212.449 151.376 210.764 151.374 209.079 C151.374 208.338 151.236 207.488 151.377 206.76 C151.421 206.531 151.611 206.384 151.766 206.224 C151.217 205.396 151.495 203.92 151.495 202.953 Z M170.144 199.145 L162.392 199.166 L162.391 206.836 L168.16 206.856 L168.14 207.477 L167.519 207.456 L167.499 207.156 L166.879 207.177 L166.862 207.464 C166.627 207.294 166.535 207.249 166.251 207.259 L166.285 207.805 L166.558 207.94 C166.213 208.825 165.755 211.169 167.205 211.311 C167.307 211.122 167.344 211.112 167.49 211.002 L167.519 211.605 C167.972 211.662 168.158 211.565 168.528 211.323 C168.615 211.417 168.698 211.503 168.779 211.611 C169.033 211.417 169.086 211.332 169.122 211.014 L169.431 211.002 L169.442 211.632 L170.069 211.64 C170.066 207.472 170.135 203.32 170.144 199.145 Z M76.29 206.645 L76.285 210.211 L79.794 210.222 L79.829 206.593 Z M87.198 210.486 L79.888 210.445 C79.939 211.645 80.093 212.79 80.173 213.974 C81.114 213.961 82.329 214.157 83.208 213.79 C83.68 214.01 85.472 213.733 86.172 213.778 C86.502 213.799 86.874 214 87.182 214.105 Z M324.399 210.203 L324.386 214.116 L331.933 214.122 L331.934 210.325 C330.533 209.605 329.954 209.688 328.405 209.77 C328.039 210.492 325.221 210.197 324.399 210.203 Z M339.462 210.328 L339.431 213.97 L343.101 213.978 L343.103 210.271 Z M87.254 214.16 C87.591 215.423 87.519 216.421 87.109 217.647 L94.755 217.668 L94.727 214.232 Z M170.477 222.803 C170.139 223.512 170.317 224.531 170.317 225.3 L183.821 225.299 C184.351 224.881 184.501 225.333 185.042 225.279 C185.269 225.256 185.437 225.081 185.664 225.055 C186.625 224.944 187.25 225.125 188.184 224.787 L188.348 225.062 L188.985 225.104 L188.993 224.791 L188.552 224.378 C189.058 224.443 189.252 224.732 189.634 225.09 L189.634 223.872 C189.251 223.816 189.017 223.822 188.689 223.644 L188.679 223.34 L189.926 223.495 L189.954 222.882 C190.643 222.833 191.049 222.355 191.677 222.236 C192.67 222.047 193.755 222.303 194.762 222.184 L194.762 221.783 L177.583 221.736 L177.585 217.77 C177.438 217.751 177.298 217.733 177.142 217.733 C177.104 219.186 175.649 218.642 174.57 218.715 C174.603 219.006 174.659 219.105 174.855 219.327 C174.437 219.278 173.943 218.995 173.597 218.743 L173.294 218.847 C173.502 218.379 173.772 218.389 174.25 218.346 C174.252 217.847 174.486 217.576 174.57 217.116 L173.312 217.092 L173.291 217.709 L172.994 217.733 C172.838 217.012 171.702 216.855 171.045 216.692 L171.045 217.696 L171.686 217.622 C171.481 217.822 171.346 217.851 171.045 217.885 C171.273 218.418 171.347 218.742 171.386 219.335 C171.707 219.282 171.886 219.095 172.194 219.016 C172.06 219.262 172.021 219.381 172.038 219.656 L172.647 219.687 L172.679 220.297 C172.964 220.252 173.041 220.193 173.242 219.976 L173.921 220.114 C173.924 219.958 173.937 219.809 173.952 219.656 L174.242 219.686 L174.211 220.297 L173.288 220.402 L173.288 220.803 C173.629 220.844 173.963 220.797 174.25 220.963 C174.025 221.062 173.906 221.046 173.637 220.99 C173.121 221.34 172.618 221.258 172.006 221.258 L172.006 222.54 L171.045 222.508 L171.013 221.899 L170.404 221.931 Z M245.515 219.656 L246.041 219.619 L246.041 218.053 L252.771 217.733 L252.771 216.771 C251.918 216.76 251.504 216.736 251.489 215.812 L250.849 215.81 L250.848 216.771 L246.041 216.771 L246.026 215.489 L245.545 215.489 Z M332.005 221.461 L332.023 225.247 C333.643 225.237 335.282 225.329 336.899 225.222 C337.097 225.209 337.268 225.089 337.458 225.078 C337.633 225.067 337.789 225.204 337.968 225.217 C338.71 225.27 339.468 225.227 340.211 225.228 C340.993 225.23 342.604 225.552 343.175 224.986 C343.706 225.093 346.567 225.215 346.992 225.047 C347.238 224.95 347.448 224.653 347.632 224.469 C347.017 223.823 346.77 223.093 346.615 222.219 L349.858 222.219 C349.87 222.066 349.881 221.917 349.881 221.761 C348.6 221.623 347.271 221.716 345.983 221.714 C343.603 221.711 341.223 221.694 338.843 221.691 C337.091 221.688 335.347 221.761 333.648 221.334 C332.944 221.563 332.69 221.543 332.005 221.461 Z M370.393 221.708 L370.393 222.19 L373.598 222.276 C373.494 222.384 373.426 222.469 373.277 222.559 L373.297 222.86 L373.928 222.842 C374.039 222.668 374.089 222.645 374.234 222.54 L374.239 223.145 L374.851 223.161 L374.762 222.54 C375.019 222.699 375.001 222.854 375.071 223.164 L375.759 222.76 C377.393 224.363 376.59 222.837 377.448 223.237 C377.951 223.472 378.286 224.344 378.712 224.77 C378.778 224.668 378.852 224.567 378.918 224.463 L379.22 224.474 C379.105 224.697 379.074 224.796 379.079 225.037 L380.336 225.02 C380.555 224.561 380.761 224.305 380.561 223.838 C380.739 223.439 380.718 223.133 380.548 222.732 L380.775 221.694 Z M263.347 224.783 L264.311 225.742 C264.414 225.625 264.518 225.536 264.629 225.442 L264.611 227.027 L263.988 227.046 L264.008 227.988 L264.629 228.009 L264.309 228.919 L264.919 228.95 L264.95 230.202 L265.562 230.232 L265.56 229.621 L265.847 229.591 L265.908 229.892 C266.355 229.98 266.85 230.254 267.219 230.527 C267.422 230.329 267.569 230.214 267.834 230.123 C267.696 230.391 267.555 230.553 267.514 230.861 L268.59 230.838 L268.729 230.232 L268.796 231.496 C269.375 230.977 269.916 230.555 270.71 230.552 L270.719 229.294 C270.37 229.619 270.22 229.888 269.757 229.891 L269.734 229.353 L267.661 229.108 C267.719 227.437 267.834 225.777 267.834 224.117 C267.326 224.648 267.02 224.915 266.813 225.601 C266.491 225.86 266.362 226.022 265.971 226.065 L266.232 225.642 C265.978 225.59 265.85 225.617 265.594 225.707 C265.596 225.58 265.61 225.464 265.623 225.343 L266.575 225.424 C266.575 224.661 266.319 224.492 265.591 224.441 C265.698 224.307 265.735 224.249 265.905 224.146 L265.911 223.829 C265.281 223.817 264.787 224.096 264.286 224.463 C264.185 224.364 264.069 224.268 263.971 224.16 Z M245.524 225.105 L245.526 228.906 L253.15 228.891 L254.14 227.902 L254 226.706 C253.453 226.706 252.773 226.607 252.233 226.725 C251.948 226.788 251.801 226.984 251.489 227.014 L251.477 226.386 C251.033 226.455 250.832 226.723 250.517 227.034 L249.593 226.092 C249.496 226.189 249.379 226.284 249.282 226.386 C248.859 226.096 248.717 226.008 248.318 226.386 C247.957 226.123 247.787 225.819 247.323 225.754 L247.314 226.386 L246.682 226.377 C246.787 226.232 246.809 226.184 246.985 226.075 L247.002 225.765 L246.221 225.745 L246.141 226.706 C245.901 226.272 246.066 225.611 246.004 225.104 C245.844 225.104 245.684 225.104 245.524 225.105 Z M328.235 225.267 L328.256 229.034 C329.359 228.848 330.718 229.064 331.869 229.078 L331.822 225.298 Z M155.103 225.269 L155.055 229.219 L158.83 229.19 L158.793 225.251 Z M254.694 228.629 L253.262 229.03 C253.585 230.655 253.412 232.425 253.412 234.078 L254.694 234.078 L254.694 233.119 L253.733 233.593 L253.733 232.475 L255.472 232.127 C255.679 231.217 255.361 230.774 255.335 229.915 L254.695 229.911 Z M324.443 229.162 L324.478 232.6 L327.918 232.573 L328.019 229.133 Z M320.675 232.947 C320.683 233.235 320.818 233.485 320.811 233.77 C320.804 234.019 320.67 234.227 320.646 234.474 C320.58 235.144 320.606 235.841 320.599 236.513 L324.255 236.491 C324.071 235.329 324.129 234.153 324.113 232.98 Z M158.906 229.172 L158.916 236.528 L166.503 236.536 L166.491 232.842 L162.66 232.851 L162.644 229.236 Z M5.107 247.63 L5.172 330.582 L10.156 330.557 L10.162 334.263 L14.12 334.257 L14.066 337.63 L38.439 337.633 L38.431 333.776 L50.071 333.771 L50.012 352.724 L56.717 352.694 L56.689 356.817 L130.685 356.8 L130.714 352.701 L345.17 352.686 L345.169 356.785 L418.999 356.797 L418.988 352.725 L425.677 352.699 L425.666 333.762 L437.185 333.772 L437.188 337.64 L461.643 337.675 L461.603 334.26 L465.627 334.271 L465.633 330.501 L470.612 330.551 L470.721 247.54 L466.467 247.6 L466.457 244.072 L463.023 244.064 L463.02 240.26 L403.583 240.232 L403.587 244.071 L72.319 244.058 L72.342 240.249 L13.21 240.23 L13.195 244.054 L9.406 244.049 L9.41 247.624 Z",
        "M328.204 56.684 C328.562 55.52 328.279 54.032 328.333 52.813 C329.21 52.81 335.077 52.914 335.4 52.635 C335.725 52.354 335.358 51.208 335.362 50.805 C335.364 50.56 335.486 50.347 335.483 50.107 C335.478 49.464 335.321 48.814 335.356 48.141 C335.404 47.224 335.629 46.342 335.546 45.39 C334.533 45.389 333.36 45.562 332.363 45.389 C332.147 45.351 331.997 45.155 331.768 45.119 C330.878 44.976 328.723 44.877 327.897 45.114 C328.263 44.058 327.888 42.635 328.005 41.51 C330.294 41.52 332.608 41.434 334.894 41.527 C335.3 41.543 335.65 41.757 336.052 41.77 C337.056 41.802 338.07 41.698 339.071 41.781 C339.073 42.813 338.997 43.878 339.088 44.906 C339.113 45.199 339.279 45.451 339.3 45.742 C339.349 46.45 339.26 47.164 339.338 47.87 L339.946 47.837 C339.946 46.515 340.485 46.774 340.578 45.947 L339.946 45.938 C339.948 45.81 339.959 45.686 339.968 45.56 L342.83 45.643 L342.814 47.87 L341.228 47.887 L341.244 48.511 C341.865 48.512 342.222 48.827 342.83 48.835 C342.751 48.938 342.681 49.034 342.586 49.133 C342.84 49.544 342.844 49.727 342.571 50.128 C343.075 50.805 342.83 54.506 342.83 55.562 L342.51 55.562 L342.509 55.242 L342.189 55.242 L342.189 54.28 C341.885 54.251 341.765 54.172 341.528 53.98 C341.313 54.188 341.225 54.244 340.932 54.28 C340.784 53.593 340.477 53.814 339.964 53.598 C339.708 53.491 339.571 53.162 339.288 53.106 C338.502 52.952 336.616 53.124 335.71 53.123 L335.644 56.681 C334.071 56.68 332.49 56.723 330.917 56.681 C330.042 56.657 329.048 56.261 328.204 56.684 Z",
        "M327.897 45.114 C327.658 45.949 327.705 48.03 327.862 48.913 C327.908 49.171 328.103 49.372 328.134 49.629 C328.254 50.612 328.135 51.676 328.13 52.666 L324.562 52.656 L324.59 45.239 C325.572 45.264 326.996 45.519 327.897 45.114 Z",
        "M358.022 45.496 C357.939 45.669 357.913 45.721 357.893 45.924 L355.359 45.951 L355.329 46.266 C355.049 45.862 354.71 45.947 354.247 45.947 C354.106 46.273 354.147 46.478 353.804 46.57 C353.817 46.284 353.868 46.182 354.045 45.951 L352.291 45.947 C352.234 46.05 352.166 46.145 352.106 46.238 C351.823 45.901 351.572 45.947 351.146 45.947 C351.146 45.814 351.145 45.681 351.145 45.548 C352.626 45.54 356.891 45.894 358.022 45.496 Z",
        "M147.428 48.979 C148.512 49.355 150.023 49.096 151.167 49.077 C151.186 49.955 151.293 56.211 150.988 56.433 C150.759 56.599 148.072 56.447 147.578 56.448 L147.506 60.16 L140.135 60.139 C140.139 58.894 140.299 57.612 140.117 56.376 L147.526 56.385 C147.528 54.706 147.532 53.028 147.534 51.349 C147.535 50.588 147.671 49.703 147.428 48.979 Z",
        "M328.204 56.684 C328.137 56.856 328.109 56.94 328.091 57.129 C328.476 57.175 328.958 57.075 329.323 57.2 C329.924 57.406 330.338 58.009 330.945 58.126 L330.972 58.74 C331.489 58.785 331.811 58.806 332.201 58.447 L332.885 59.078 C332.978 58.937 333.066 58.868 333.175 58.767 C333.197 58.856 333.227 58.921 333.217 59.075 L333.843 59.088 L333.856 59.395 L334.804 59.408 L334.785 59.923 C333.783 59.911 332.774 59.613 331.767 59.772 C331.53 59.809 331.34 59.994 331.096 60.049 L330.974 59.783 L327.778 59.756 C327.778 60.758 327.987 62.866 327.748 63.744 C327.709 63.888 327.607 63.85 327.499 63.895 L327.446 63.628 C326.686 63.603 326.214 64.123 325.507 63.626 C325.038 63.992 324.5 63.895 323.926 63.895 L323.924 67.42 L320.122 67.458 L320.16 68.062 L319.759 68.062 C319.826 67.536 320.292 67.321 320.382 66.8 C319.685 66.753 319.439 66.609 319.434 65.878 C319.149 65.88 319.093 65.92 318.899 66.139 L318.476 65.822 C318.192 66.109 318.104 66.287 318.108 66.692 L318.793 66.728 C318.79 66.851 318.778 66.969 318.767 67.088 C318.468 66.988 318.375 67.009 318.096 67.16 C317.987 67.03 317.914 66.942 317.832 66.782 L317.513 66.78 L317.511 67.739 C317.378 67.74 317.246 67.741 317.113 67.741 C317.114 66.676 317.117 65.621 317.121 64.553 C317.242 64.538 317.359 64.522 317.487 64.518 C317.533 65.117 317.398 65.643 317.826 66.112 C318.143 65.828 318.35 65.571 318.775 65.498 C318.678 65.391 318.582 65.282 318.482 65.177 C318.973 65.256 319.22 65.526 319.754 65.46 C319.634 64.878 319.265 64.916 318.793 64.685 L318.807 64.379 L320.696 64.531 C320.719 64.086 320.969 63.781 321.008 63.379 C321.093 62.484 321.001 61.573 321.055 60.676 L324.562 60.652 L324.6 56.844 C325.474 56.844 327.513 57.084 328.204 56.684 Z",
        "M177.732 75.25 L177.762 82.777 L170.196 82.776 L170.217 90.228 L162.777 90.219 L162.737 105.253 L155.127 105.248 C155.136 100.094 155.174 94.94 155.169 89.785 C155.168 88.289 155.17 86.794 155.171 85.298 C155.171 84.462 155.082 83.601 155.241 82.778 L162.68 82.745 L162.669 75.214 Z",
        "M109.974 79.141 L117.39 79.245 L117.398 82.931 L121.374 82.969 L121.39 86.558 L124.916 86.542 L124.981 90.254 C123.86 89.975 122.48 90.176 121.322 90.176 L121.273 86.765 L117.464 86.766 L117.408 82.871 C114.886 82.875 112.504 82.643 109.976 82.642 Z",
        "M192.682 97.655 C191.73 97.338 190.441 97.546 189.436 97.548 C188.165 97.551 186.867 97.488 185.599 97.565 C185.308 97.583 185.046 97.734 184.753 97.755 C182.48 97.913 179.954 97.914 177.7 97.66 L177.729 90.239 L185.337 90.245 L185.439 83.031 L199.989 83.046 L200.014 90.173 C199.881 90.174 199.748 90.175 199.616 90.176 L199.49 89.981 C197.998 89.988 196.497 89.927 195.006 89.992 C194.713 90.004 194.468 90.166 194.173 90.174 C193.809 90.184 193.202 89.952 192.904 90.156 C192.761 90.254 192.625 90.401 192.59 90.576 C192.448 91.301 192.476 97.099 192.682 97.655 Z",
        "M275.731 82.925 C276.798 83.235 278.123 83.031 279.233 83.037 C281.931 83.05 284.629 83.013 287.327 83.037 C288.327 83.046 289.349 82.955 290.345 83.039 L290.374 90.237 L298.139 90.25 L298.119 97.702 C295.786 97.797 293.424 97.81 291.089 97.74 C290.767 97.73 290.478 97.578 290.158 97.555 C289.016 97.473 283.92 97.366 283.082 97.656 C283.325 96.876 283.165 95.871 283.163 95.05 C283.161 93.43 283.238 91.793 283.147 90.176 L275.722 90.142 Z",
        "M106.144 139.062 C106.567 138.249 106.301 134.572 106.304 133.434 C106.309 131.705 106.217 129.952 106.308 128.225 C106.327 127.877 106.596 127.638 106.61 127.278 C106.701 124.992 106.609 122.676 106.61 120.387 L102.472 120.395 L102.401 105.307 C101.135 104.989 99.568 105.238 98.261 105.231 C94.627 105.211 90.994 105.224 87.361 105.239 L87.303 97.665 L94.979 97.705 L94.901 90.255 L102.502 90.244 L102.524 97.66 L110.075 97.7 L110.094 112.728 L117.615 112.744 L117.659 120.166 L124.229 120.155 C124.241 120.003 124.252 119.854 124.253 119.698 L119.766 119.618 C119.828 119.363 119.812 119.364 120.086 119.298 C120.133 118.721 120.918 118.509 121.365 118.062 C121.149 117.856 121.092 117.781 121.055 117.491 L121.367 117.418 C121.432 116.979 121.683 116.782 121.991 116.475 L121.689 116.081 C122.046 115.683 121.997 115.371 122.026 114.852 L122.587 114.854 L122.543 114.213 C122.815 114.37 122.784 114.523 122.822 114.854 C123.203 114.669 123.428 114.335 123.838 114.213 C123.875 114.319 123.934 114.43 123.973 114.533 C124.415 114.593 124.651 114.855 124.894 115.219 C124.501 115.701 124.757 115.716 124.873 116.225 C125.062 117.053 124.984 118.334 124.885 119.178 C124.84 119.559 124.625 119.759 124.643 120.184 L132.466 120.233 L132.5 112.746 L140.031 112.744 L140.018 90.258 L147.653 90.27 C147.653 95.583 147.582 100.897 147.612 106.211 C147.638 110.877 147.796 115.55 147.615 120.213 L155.182 120.257 L155.215 127.683 C156.097 127.682 162.231 127.531 162.544 127.737 C162.93 127.992 162.76 130.817 162.755 131.398 C162.738 133.855 162.741 136.312 162.744 138.769 C162.745 140.089 162.825 141.436 162.723 142.751 L147.66 142.723 L147.6 127.768 L109.832 127.741 L109.978 138.941 C108.926 139.022 107.038 138.706 106.144 139.062 Z",
        "M124.981 90.254 C126.161 90.505 127.529 90.31 128.734 90.299 L128.76 101.418 L125.09 101.425 C124.841 98.812 125.067 95.926 125.068 93.283 C125.068 92.31 125.216 91.199 124.981 90.254 Z",
        "M117.818 94.295 L121.048 94.307 L121.048 105.559 L124.601 105.559 C124.569 107.263 124.758 108.965 124.72 110.687 C124.563 110.687 124.409 110.681 124.253 110.674 L124.253 106.836 L122.65 106.851 L122.65 108.123 C121.887 108.123 120.705 108.359 120.104 107.821 C119.879 108.012 119.772 108.154 119.658 108.428 C119.057 108.315 118.895 108.126 118.163 108.123 L118.134 110.687 L117.813 110.687 Z",
        "M87.569 127.773 C87.826 126.975 87.641 125.875 87.635 125.028 C87.623 123.381 87.681 121.72 87.599 120.075 L80.064 120.094 C79.997 119.592 79.948 118.958 80.042 118.456 C80.087 118.22 80.23 118.042 80.244 117.794 C80.32 116.414 80.266 115.009 80.248 113.627 L80.024 113.53 C80.035 113.36 80.004 113.166 80.152 113.043 C80.494 112.757 82.906 112.931 83.472 112.931 C87.234 112.931 91.006 112.851 94.767 112.938 L94.753 127.674 C93.15 127.674 91.547 127.674 89.943 127.674 C89.182 127.674 88.296 127.549 87.569 127.773 Z",
        "M106.144 139.062 C105.907 139.5 105.999 140.001 105.959 140.493 C105.686 140.441 105.693 140.461 105.637 140.173 L104.374 140.198 L104.188 140.812 C104.032 140.812 103.891 140.798 103.741 140.78 L103.706 140.173 C102.842 140.35 103.1 141.38 103.1 142.079 C102.974 142.085 102.856 142.085 102.73 142.081 L102.794 139.211 C103.06 139.253 103.066 139.237 103.147 139.505 L104.028 139.507 L104.066 139.22 C104.622 139.272 105.04 139.531 105.64 139.532 L105.664 139.235 Z",
        "M110.151 149.467 L111.662 149.446 L111.763 149.194 L111.893 149.467 L112.375 149.467 L112.403 149.173 L113.034 149.147 L113.027 148.592 L112.717 148.506 L113.008 148.381 L113.031 147.678 L112.735 147.553 C112.992 147.351 113.026 147.222 113.076 146.903 L113.398 146.903 L113.356 150.082 C113.071 150.093 112.969 150.052 112.729 149.892 C112.008 150.296 110.964 150.108 110.153 150.108 Z",
        "M79.882 172.722 C80.941 172.967 86.082 172.981 87.207 172.795 C86.991 173.67 87.055 179.458 87.257 180.394 C86.518 180.225 85.7 180.324 84.941 180.307 C83.289 180.27 81.601 180.171 79.952 180.298 C80.014 179.178 79.94 178.056 79.964 176.936 C79.991 175.609 80.192 174.014 79.882 172.722 Z",
        "M459.324 251.328 C459.098 267.784 459.237 284.258 459.286 300.715 C459.303 306.19 459.337 311.659 459.337 317.135 C459.338 320.351 459.244 323.579 459.348 326.794 L448.819 326.784 L448.825 322.856 L414.844 322.855 C414.791 330.621 414.895 338.389 414.928 346.155 L351.171 346.1 L351.203 341.712 L124.864 341.72 L124.902 346.097 L60.577 346.116 C60.707 338.353 60.63 330.588 60.723 322.822 L27.005 322.864 L27.058 326.822 L16.394 326.81 C16.53 321.191 16.42 315.556 16.405 309.935 C16.388 303.715 16.448 297.49 16.444 291.269 C16.437 277.945 16.619 264.61 16.398 251.288 Z M222.69 259.493 L222.714 311.293 L241.814 311.291 L241.816 281.817 L245.509 281.811 L245.48 289.857 L252.816 289.839 L252.767 296.633 L256.428 296.634 L256.443 311.295 L275.621 311.305 L275.614 259.513 L256.292 259.487 L256.32 281.184 L252.988 281.157 L253.006 274.155 L249.644 274.145 L249.676 270.233 L245.619 270.27 L245.629 266.487 L241.857 266.484 L241.873 259.462 Z M290.492 300.353 L282.76 300.336 L282.77 311.297 L316.823 311.29 L316.792 300.434 L309.283 300.419 L309.323 270.29 L316.788 270.276 L316.786 259.519 L282.854 259.492 L282.842 270.287 L290.5 270.284 Z M388.293 266.44 L388.274 304.252 L395.698 304.261 L395.651 311.319 L433.388 311.313 L433.378 304.352 L440.905 304.355 L440.912 292.657 L421.979 292.659 L422.025 300.454 L407.282 300.432 L407.269 270.289 L421.87 270.31 L421.885 277.865 L441.029 277.872 L441.037 266.44 L433.401 266.447 L433.436 259.472 L395.616 259.455 L395.635 266.436 Z M35.025 259.489 L35.031 311.298 L80.061 311.322 L80.046 304.31 L87.477 304.302 L87.53 289.119 L80.235 289.149 L80.249 281.786 L87.549 281.805 L87.549 266.46 L80.056 266.484 L80.083 259.51 Z M98.371 259.553 L98.376 311.308 L117.468 311.318 L117.482 290.291 L132.377 290.316 L132.337 311.317 L151.56 311.296 L151.569 289.011 L144.279 289.038 L144.288 281.809 L151.555 281.835 L151.568 266.415 L143.99 266.441 L143.98 259.526 Z M166.553 266.463 L159.014 266.428 L159.021 311.32 L177.803 311.323 L177.792 290.337 L192.614 290.32 L192.61 311.304 L211.612 311.299 L211.61 266.453 L204.001 266.46 L204.028 259.499 L166.533 259.472 Z M332.029 266.439 L324.405 266.446 L324.446 311.288 L343.49 311.312 L343.5 290.293 L358.254 290.285 L358.268 311.297 L377.487 311.323 L377.52 266.422 L370.107 266.425 L370.103 259.484 L332.037 259.492 Z M192.721 320.665 L191.151 320.57 L191.179 334.717 L192.703 334.686 L192.652 336.551 L204.321 336.545 L204.319 333.242 L196.004 333.211 L195.993 329.263 L199.768 329.296 L199.777 325.957 L195.996 325.978 L196.014 321.944 L204.364 321.901 L204.406 318.797 L192.735 318.861 Z M175.203 318.806 L175.185 336.589 L185.797 336.579 L185.766 334.719 L187.202 334.772 L187.189 333.417 L188.773 333.407 L188.766 322.455 L187.195 322.436 L187.233 320.638 L185.769 320.776 L185.765 318.85 Z M75.093 320.616 L73.414 320.61 L73.432 334.734 L74.911 334.708 L74.899 336.545 L85.552 336.554 L85.543 334.687 L86.854 334.726 L86.887 325.966 L79.755 325.938 L79.744 329.193 L81.9 329.198 L81.936 333.282 L78.278 333.282 L78.267 321.901 L86.846 321.945 L86.845 318.767 L75.093 318.818 Z M90.525 320.649 L88.924 320.644 L88.964 334.698 L90.514 334.696 L90.467 336.516 L102.368 336.523 L102.369 333.193 L93.886 333.198 L93.891 329.274 L97.626 329.265 L97.633 325.947 L93.894 325.939 L93.901 321.934 L102.245 321.903 L102.211 318.824 L90.53 318.797 Z M132.365 318.866 L119.919 318.889 L119.924 321.894 L123.857 321.922 L123.844 336.606 L128.767 336.607 L128.769 321.931 L132.386 321.902 Z M216.923 320.583 L215.361 320.58 L215.39 334.685 L216.952 334.65 L216.907 336.538 L227.262 336.535 L227.244 334.662 L228.703 334.628 L228.739 329.673 L223.966 329.664 L223.962 333.236 L220.206 333.202 L220.198 321.894 L223.968 321.884 L223.959 325.485 L228.837 325.464 L228.784 320.655 L227.288 320.638 L227.301 318.803 L216.908 318.783 Z M310.477 318.857 L310.476 321.856 L313.265 321.869 L313.262 333.31 L310.515 333.276 L310.516 336.579 L320.924 336.542 L320.911 333.35 L318.108 333.343 L318.107 321.93 L321.129 321.942 L321.083 318.855 Z M373.508 318.854 L373.502 321.904 L377.233 321.901 L377.273 336.528 L382.01 336.545 L382.022 321.928 L385.799 321.931 L385.8 318.813 Z M104.365 333.335 L104.363 336.588 L116.339 336.595 L116.331 334.777 L117.748 334.735 L117.714 327.758 L116.335 327.775 L116.362 326.12 L109.276 326.114 L109.294 322.009 L117.723 322.034 L117.703 318.897 L106.046 318.903 L106.058 320.723 L104.414 320.71 L104.388 327.299 L105.7 327.243 L105.656 329.232 L112.885 329.219 L112.862 333.345 Z M136.38 320.726 L134.776 320.682 L134.821 334.665 L136.441 334.66 L136.42 336.561 L146.742 336.568 L146.746 334.691 L148.277 334.733 L148.29 320.658 L146.704 320.635 L146.716 318.8 L136.395 318.771 Z M279.185 320.711 L279.192 334.671 L280.668 334.665 L280.649 336.537 L292.433 336.525 L292.416 333.289 L284.067 333.262 L284.117 329.312 L287.817 329.309 L287.844 325.945 L284.103 325.938 L284.087 321.921 L292.437 321.919 L292.45 318.787 L280.787 318.822 L280.784 320.717 Z M296.327 320.688 L294.756 320.679 L294.773 334.658 L296.273 334.639 L296.215 336.553 L306.7 336.581 L306.675 334.718 L308.187 334.676 L308.189 329.677 L303.36 329.686 L303.332 333.269 L299.577 333.285 L299.586 321.913 L303.37 321.915 L303.357 325.537 L308.158 325.508 L308.154 320.708 L306.706 320.689 L306.707 318.767 L296.365 318.792 Z M341.674 320.601 L341.659 334.751 L343.178 334.755 L343.178 336.586 L354.94 336.564 L354.9 333.223 L346.573 333.216 L346.552 329.276 L350.468 329.257 L350.479 325.977 L346.524 325.988 L346.549 321.91 L354.983 321.917 L354.982 318.795 L343.269 318.738 L343.321 320.64 Z M231.383 320.649 L231.334 334.663 L232.809 334.66 L232.711 336.507 L243.168 336.523 L243.173 334.695 L244.759 334.693 L244.781 320.622 L243.168 320.612 L243.181 318.771 L232.827 318.775 L232.825 320.64 Z M150.99 318.847 L150.968 336.523 L155.655 336.565 L155.652 329.247 L159.415 329.251 L159.36 336.574 L164.184 336.563 L164.136 329.226 L162.599 329.246 L162.612 326.507 L164.153 326.513 L164.206 320.645 L162.803 320.609 L162.824 318.789 Z M357.409 318.786 L357.364 336.568 L362.326 336.582 L362.266 327.601 L363.944 327.624 L363.947 330.033 L366.181 330.025 L366.189 336.565 L370.968 336.542 L370.937 318.788 L366.228 318.786 L366.226 323.888 L364.266 323.904 L364.287 321.772 L362.352 321.761 L362.366 318.78 Z M247.364 318.832 L247.325 336.544 L252.18 336.55 L252.153 327.717 L253.827 327.688 L253.814 330.047 L256.18 329.985 L256.156 336.589 L260.963 336.598 L260.905 318.757 L256.088 318.75 L256.167 323.24 L253.948 323.231 L254.009 321.123 L252.179 321.126 L252.198 318.826 Z M323.314 318.85 L323.297 336.562 L327.948 336.553 L327.948 327.784 L329.404 327.777 L329.425 329.956 L332.835 329.958 L332.828 327.774 L334.573 327.777 L334.577 336.574 L339.274 336.559 L339.306 318.83 L334.529 318.819 L334.546 320.992 L332.742 320.939 L332.723 323.125 L329.67 323.134 L329.661 320.965 L327.896 320.975 L327.925 318.826 Z M263.333 318.774 L263.333 336.554 L268.236 336.572 L268.172 329.235 L272.061 329.212 L272.04 336.57 L276.902 336.542 L276.881 318.787 L272.055 318.778 L272.049 326.001 L268.175 325.981 L268.161 318.795 Z M388.509 320.605 L388.518 334.724 L389.903 334.701 L389.953 336.555 L400.423 336.54 L400.397 334.694 L401.997 334.74 L402.024 320.629 L400.369 320.639 L400.422 318.815 L390.023 318.757 L390.078 320.638 Z",
        "M177.732,75.25 L177.694,67.802 L185.099,67.787 L185.093,60.268 L177.732,60.27 L177.758,52.755 L185.181,52.79 L185.164,60.241 L192.747,60.255 L192.756,67.936 L185.176,67.945 L185.178,75.317 Z",
        "M298.072,75.253 L290.55,75.294 L290.553,67.921 L283.107,67.939 L283.085,60.274 L290.512,60.269 L290.544,52.774 L298.058,52.781 L297.982,60.355 L290.691,60.326 L290.683,67.767 L298.052,67.759 Z",
        "M109.974,79.141 L105.991,79.087 L106.021,82.519 L102.765,82.478 L102.659,75.445 L109.936,75.402 Z",
        "M177.7,97.66 L177.688,112.791 L170.181,112.842 L170.18,97.728 Z",
        "M298.119,97.702 L305.628,97.752 L305.603,112.821 L298.106,112.765 Z",
        "M132.387,270.302 L132.418,280.993 L117.468,280.986 L117.464,270.271 Z",
        "M177.817,270.284 L192.504,270.313 L192.487,280.996 L177.807,280.96 Z",
        "M343.505,270.285 L358.198,270.301 L358.228,280.996 L343.496,280.971 Z",
        "M54.098,270.322 L68.501,270.341 L68.503,281 L54.05,281.005 Z",
        "M54.061,290.347 L68.693,290.331 L68.635,300.367 L54.048,300.384 Z",
        "M143.515,321.873 L143.535,333.305 L139.728,333.235 L139.732,321.886 Z",
        "M155.674,321.887 L159.394,321.904 L159.384,326.028 L155.688,326.012 Z",
        "M239.85,321.891 L239.858,333.313 L236.16,333.275 L236.159,321.889 Z",
        "M397.109,321.858 L397.14,333.352 L393.454,333.353 L393.439,321.85 Z",
        "M180.106,321.929 L182.891,321.929 L182.889,323.769 L184.071,323.76 L184.019,331.714 L182.689,331.707 L182.715,333.274 L180.091,333.302 Z"
      ];
      function logoSize(fontSize) {
        const h = Math.round(fontSize * 1.2);
        return { w: Math.round(h * LOGO_VB.w / LOGO_VB.h), h };
      }
      function logoVariant({ fill, mono }) {
        if (mono) return "mono";
        return luminance(fill) < 0.45 ? "dark" : "color";
      }
      function luminance(hex) {
        if (!/^#[0-9a-fA-F]{6}$/.test(String(hex || ""))) return 1;
        const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      }
      function logoMarkup({ x, y, fontSize, variant = "color", color = "#111111" }) {
        const { h } = logoSize(fontSize);
        const k = h / LOGO_VB.h;
        const mono = variant === "mono";
        if (mono && !/^#[0-9a-fA-F]{6}$/.test(color)) return "";
        const paint = () => mono ? color : COLORS[variant === "dark" ? "dark" : "color"];
        const g = PARTS.map((d) => `<path d="${d}" fill="${paint()}"/>`).join("");
        return `<g transform="translate(${x} ${y}) scale(${k.toFixed(5)}) translate(${-LOGO_VB.x} ${-LOGO_VB.y})" aria-hidden="true">${g}</g>`;
      }
      module.exports = { logoSize, logoVariant, logoMarkup, luminance, LOGO_VB };
    }
  });

  // ../core/components/markers.js
  var require_markers = __commonJS({
    "../core/components/markers.js"(exports, module) {
      "use strict";
      var MARKERS = {
        p1: { glyph: "1", color: "#e53935", label: "Prioridade 1" },
        p2: { glyph: "2", color: "#fb8c00", label: "Prioridade 2" },
        p3: { glyph: "3", color: "#43a047", label: "Prioridade 3" },
        ok: { glyph: "\u2713", color: "#2e9e5b", label: "Conclu\xEDdo" },
        warn: { glyph: "!", color: "#d81b60", label: "Aten\xE7\xE3o" },
        ask: { glyph: "?", color: "#1e88e5", label: "D\xFAvida" },
        star: { glyph: "\u2605", color: "#f5a623", label: "Favorito" },
        flag: { glyph: "\u2691", color: "#8e24aa", label: "Bandeira" },
        idea: { glyph: "\u2726", color: "#00acc1", label: "Ideia" }
      };
      function tagText(node) {
        const parts = [];
        if (node.progress != null) parts.push(`${node.progress}%`);
        for (const m of node.markers || []) if (MARKERS[m]) parts.push(MARKERS[m].glyph);
        return parts.length ? ` (${parts.join(" ")})` : "";
      }
      module.exports = { MARKERS, tagText };
    }
  });

  // ../core/components/layout.js
  var require_layout = __commonJS({
    "../core/components/layout.js"(exports, module) {
      "use strict";
      var { getTheme, resolveStyle, adaptThemeToCanvas, adaptStyleToCanvas } = require_themes();
      var { logoSize } = require_logo();
      var { MARKERS } = require_markers();
      function progressViews(root) {
        const out = /* @__PURE__ */ new Map();
        const rec = (n) => {
          if (!n.children.length) {
            const has = Number.isFinite(n.progress);
            out.set(n.id, { roll: has ? n.progress : null });
            return { w: 1, p: has ? n.progress : 0, any: has };
          }
          const acc = { w: 0, p: 0, any: false };
          for (const c of n.children) {
            const v = rec(c);
            acc.w += v.w;
            acc.p += v.p;
            acc.any = acc.any || v.any;
          }
          out.set(n.id, { roll: acc.any && acc.w ? acc.p / acc.w : null });
          return acc;
        };
        rec(root);
        return out;
      }
      var H_GAP = [70, 46, 32];
      var GRID_MIN = 40;
      var GRID_COL_GAP = 28;
      var V_GAP = 12;
      function textWidth(text, size, bold) {
        let w = 0;
        for (const ch of text) {
          w += /[ilI.,;:'|!]/.test(ch) ? 0.3 : /[mwMW@]/.test(ch) ? 0.85 : /[A-Z]/.test(ch) ? 0.68 : ch.codePointAt(0) > 11904 ? 1 : 0.54;
        }
        return w * size * (bold ? 1.06 : 1);
      }
      function wrap(text, size, bold, maxW) {
        const lines = [];
        for (const para of String(text || " ").split("\n")) {
          let cur = "";
          for (const word of para.split(/\s+/)) {
            const t = cur ? cur + " " + word : word;
            if (cur && textWidth(t, size, bold) > maxW) {
              lines.push(cur);
              cur = word;
            } else cur = t;
          }
          lines.push(cur);
        }
        return lines;
      }
      function layoutMap(map, opts = {}) {
        let theme = getTheme(opts.theme || map.meta.theme, map.meta.customTheme);
        if (opts.canvas) theme = adaptThemeToCanvas(theme, opts.canvas);
        const maxW = opts.maxTextWidth || 260;
        const boxes = /* @__PURE__ */ new Map();
        const views = progressViews(map.root);
        const measure = (node, level, branch, temp = false) => {
          let st = resolveStyle(theme, level, branch, node.style);
          if (opts.canvas) st = adaptStyleToCanvas(st, opts.canvas, st.branch);
          const lines = wrap(node.title, st.size, st.bold, maxW);
          const tw = Math.max(...lines.map((l) => textWidth(l, st.size, st.bold)));
          const lh = st.size * 1.25;
          const nm = (node.markers || []).filter((m) => MARKERS[m]).length;
          const md = Math.round(st.size * 1.05);
          const logoW = level === 0 ? logoSize(st.size).w + 8 : 0;
          const markerW = (nm ? Math.ceil(nm * (md + 4) + st.padX * 0.3) : 0) + logoW;
          const box = {
            id: node.id,
            node,
            level,
            style: st,
            lines,
            lineHeight: lh,
            markerW,
            logoW,
            markerD: md,
            markers: (node.markers || []).filter((m) => MARKERS[m]),
            // progresso: o do próprio tópico, ou o agregado pelas folhas (azul na tela) quando ele não tem valor próprio
            progress: node.progress != null ? node.progress : views.get(node.id).roll,
            progressAuto: node.progress == null && views.get(node.id).roll != null,
            w: Math.ceil(tw + st.padX * 2 + markerW),
            h: Math.ceil(lines.length * lh + st.padY * 2),
            x: 0,
            y: 0,
            side: 1,
            branch,
            subtreeH: 0
          };
          if (!temp) boxes.set(node.id, box);
          return box;
        };
        const prep = (node, level, branch) => {
          const b = measure(node, level, branch);
          const kids = node.collapsed ? [] : node.children;
          b.kids = kids.map((c, i) => prep(c, level + 1, level === 0 ? theme.branches[i % theme.branches.length] : branch));
          if (b.kids.length > GRID_MIN && b.kids.every((k) => !k.kids.length)) {
            const cw = Math.max(...b.kids.map((k) => k.w)) + GRID_COL_GAP, rh = Math.max(...b.kids.map((k) => k.h)) + V_GAP;
            const rows = Math.max(4, Math.ceil(Math.sqrt(b.kids.length * 0.6 * cw / rh)));
            b.grid = { rows, cw, rh };
            b.subtreeH = Math.max(b.h, rows * rh - V_GAP);
          } else {
            const kh = b.kids.reduce((s, k) => s + k.subtreeH, 0) + Math.max(0, b.kids.length - 1) * V_GAP;
            b.subtreeH = Math.max(b.h, kh);
          }
          b.leaves = b.kids.length ? b.kids.reduce((s, k) => s + k.leaves, 0) : 1;
          return b;
        };
        const root = prep(map.root, 0, theme.branches[0]);
        const place = (b, x, centerY, side) => {
          b.side = side;
          b.x = side > 0 ? x : x - b.w;
          b.y = centerY - b.h / 2;
          const gap = H_GAP[Math.min(b.level, H_GAP.length - 1)];
          const total = b.kids.reduce((s, k) => s + k.subtreeH, 0) + Math.max(0, b.kids.length - 1) * V_GAP;
          let y = centerY - total / 2;
          const childX = side > 0 ? b.x + b.w + gap : b.x - gap;
          if (b.grid) {
            const g = b.grid, top = centerY - (g.rows * g.rh - V_GAP) / 2;
            b.kids.forEach((k, i) => place(k, childX + side * Math.floor(i / g.rows) * g.cw, top + i % g.rows * g.rh + k.h / 2, side));
            return;
          }
          for (const k of b.kids) {
            place(k, childX, y + k.subtreeH / 2, side);
            y += k.subtreeH + V_GAP;
          }
        };
        const mode = opts.direction || "both";
        root.x = -root.w / 2;
        root.y = -root.h / 2;
        if (mode === "right") {
          const total = root.kids.reduce((s, k) => s + k.subtreeH, 0) + Math.max(0, root.kids.length - 1) * V_GAP;
          root.x = 0;
          root.y = -root.h / 2;
          let y = -total / 2;
          for (const k of root.kids) {
            place(k, root.w + H_GAP[0], y + k.subtreeH / 2, 1);
            y += k.subtreeH + V_GAP;
          }
        } else {
          const countAll = (node) => 1 + node.children.reduce((s, c) => s + countAll(c), 0);
          const hs = map.root.children.map((c) => countAll(c));
          const sum = hs.reduce((a, b) => a + b, 0);
          let acc = 0, cut = 0;
          for (let i = 0; i < hs.length; i++) {
            if (acc + hs[i] / 2 <= sum / 2) {
              acc += hs[i];
              cut = i + 1;
            }
          }
          if (hs.length > 1 && cut === 0) cut = 1;
          const place2 = (list, side) => {
            const total = list.reduce((s, k) => s + k.subtreeH, 0) + Math.max(0, list.length - 1) * V_GAP;
            let y = -total / 2;
            const x = side > 0 ? root.w / 2 + H_GAP[0] : -root.w / 2 - H_GAP[0];
            for (const k of list) {
              place(k, x, y + k.subtreeH / 2, side);
              y += k.subtreeH + V_GAP;
            }
          };
          place2(root.kids.slice(0, cut), 1);
          place2(root.kids.slice(cut), -1);
        }
        const edges = [];
        for (const b of boxes.values()) for (const k of b.kids || []) edges.push({ from: b, to: k });
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const b of boxes.values()) {
          minX = Math.min(minX, b.x);
          minY = Math.min(minY, b.y);
          maxX = Math.max(maxX, b.x + b.w);
          maxY = Math.max(maxY, b.y + b.h);
        }
        const pad = opts.padding ?? 40;
        const bounds = { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 };
        const relations = (map.meta.relations || []).map((r) => ({ rel: r, geo: relationGeometry(boxes, r) })).filter((r) => r.geo);
        const grow = (px, py) => {
          const x2 = bounds.x + bounds.w, y2 = bounds.y + bounds.h;
          bounds.x = Math.min(bounds.x, px - pad / 2);
          bounds.y = Math.min(bounds.y, py - pad / 2);
          bounds.w = Math.max(x2, px + pad / 2) - bounds.x;
          bounds.h = Math.max(y2, py + pad / 2) - bounds.y;
        };
        for (const { geo } of relations) {
          grow(geo.c.x, geo.c.y);
          grow(geo.label.x, geo.label.y);
        }
        for (const b of boxes.values()) if (b.progress != null) grow(b.x, b.y + b.h + 10);
        return { boxes, edges, relations, bounds, theme, root };
      }
      function edgePoints({ from, to }) {
        const dir = to.x + to.w / 2 >= from.x + from.w / 2 ? 1 : -1;
        const a = { x: dir > 0 ? from.x + from.w : from.x, y: from.y + from.h / 2 };
        const underline = to.style.shape === "underline";
        const b = { x: dir > 0 ? to.x : to.x + to.w, y: underline ? to.y + to.h : to.y + to.h / 2 };
        return { a, b, dir };
      }
      function clip(b, tx, ty, m = 5) {
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2, dx = tx - cx, dy = ty - cy;
        if (!dx && !dy) return { x: cx, y: cy };
        const s = 1 / Math.max(Math.abs(dx) / (b.w / 2 + m), Math.abs(dy) / (b.h / 2 + m));
        return { x: cx + dx * s, y: cy + dy * s };
      }
      function relationGeometry(boxes, rel) {
        const fa = boxes.get(rel.from), tb = boxes.get(rel.to);
        if (!fa || !tb) return null;
        const ac = { x: fa.x + fa.w / 2, y: fa.y + fa.h / 2 }, bc = { x: tb.x + tb.w / 2, y: tb.y + tb.h / 2 };
        const dist = Math.hypot(bc.x - ac.x, bc.y - ac.y) || 1;
        const c = { x: (ac.x + bc.x) / 2 - (bc.y - ac.y) / dist * dist * 0.22, y: (ac.y + bc.y) / 2 + (bc.x - ac.x) / dist * dist * 0.22 };
        const a = clip(fa, c.x, c.y), b = clip(tb, c.x, c.y, 7);
        const ang = Math.atan2(b.y - c.y, b.x - c.x), L = 11, W = 0.42;
        const arrow = [b, { x: b.x - L * Math.cos(ang - W), y: b.y - L * Math.sin(ang - W) }, { x: b.x - L * Math.cos(ang + W), y: b.y - L * Math.sin(ang + W) }];
        return { a, b, c, arrow, label: { x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y } };
      }
      module.exports = { layoutMap, edgePoints, textWidth };
    }
  });

  // shim/crypto.js
  var require_crypto = __commonJS({
    "shim/crypto.js"(exports, module) {
      "use strict";
      var K = new Uint32Array([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      var Sha256 = class {
        constructor() {
          this.h = new Uint32Array([1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225]);
          this.buf = new Uint8Array(64);
          this.fill = 0;
          this.len = 0;
          this.w = new Uint32Array(80);
          this.done = false;
        }
        update(data, enc) {
          if (this.done) throw new Error("digest j\xE1 calculado");
          const b = typeof data === "string" ? new TextEncoder().encode(data) : data instanceof Uint8Array ? data : new Uint8Array(data.buffer || data);
          if (typeof data === "string" && enc && enc !== "utf8" && enc !== "utf-8") throw new Error("codifica\xE7\xE3o n\xE3o suportada: " + enc);
          this.len += b.length;
          let i = 0;
          if (this.fill) {
            const take = Math.min(64 - this.fill, b.length);
            this.buf.set(b.subarray(0, take), this.fill);
            this.fill += take;
            i = take;
            if (this.fill === 64) {
              this._block(this.buf, 0);
              this.fill = 0;
            }
          }
          for (; i + 64 <= b.length; i += 64) this._block(b, i);
          if (i < b.length) {
            this.buf.set(b.subarray(i), 0);
            this.fill = b.length - i;
          }
          return this;
        }
        _block(p, o) {
          const w = this.w, h = this.h;
          for (let i = 0; i < 16; i++) w[i] = p[o + 4 * i] << 24 | p[o + 4 * i + 1] << 16 | p[o + 4 * i + 2] << 8 | p[o + 4 * i + 3];
          for (let i = 16; i < 64; i++) {
            const a2 = w[i - 15], b2 = w[i - 2];
            const s0 = (a2 >>> 7 | a2 << 25) ^ (a2 >>> 18 | a2 << 14) ^ a2 >>> 3, s1 = (b2 >>> 17 | b2 << 15) ^ (b2 >>> 19 | b2 << 13) ^ b2 >>> 10;
            w[i] = w[i - 16] + s0 + w[i - 7] + s1 | 0;
          }
          let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
          for (let i = 0; i < 64; i++) {
            const S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7), ch = e & f ^ ~e & g;
            const t1 = hh + S1 + ch + K[i] + w[i] | 0;
            const S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10), maj = a & b ^ a & c ^ b & c;
            const t2 = S0 + maj | 0;
            hh = g;
            g = f;
            f = e;
            e = d + t1 | 0;
            d = c;
            c = b;
            b = a;
            a = t1 + t2 | 0;
          }
          h[0] += a;
          h[1] += b;
          h[2] += c;
          h[3] += d;
          h[4] += e;
          h[5] += f;
          h[6] += g;
          h[7] += hh;
        }
        digest(enc) {
          if (this.done) throw new Error("digest j\xE1 calculado");
          this.done = true;
          const bits = this.len * 8, pad = new Uint8Array((this.fill < 56 ? 56 : 120) - this.fill + 8);
          pad[0] = 128;
          const hi = Math.floor(bits / 4294967296), lo = bits >>> 0, n = pad.length;
          pad[n - 8] = hi >>> 24;
          pad[n - 7] = hi >>> 16;
          pad[n - 6] = hi >>> 8;
          pad[n - 5] = hi;
          pad[n - 4] = lo >>> 24;
          pad[n - 3] = lo >>> 16;
          pad[n - 2] = lo >>> 8;
          pad[n - 1] = lo;
          const keep = this.len;
          this.done = false;
          this.update(pad);
          this.len = keep;
          this.done = true;
          const out = new Uint8Array(32);
          for (let i = 0; i < 8; i++) {
            out[4 * i] = this.h[i] >>> 24;
            out[4 * i + 1] = this.h[i] >>> 16;
            out[4 * i + 2] = this.h[i] >>> 8;
            out[4 * i + 3] = this.h[i];
          }
          if (enc === "hex") return Array.from(out, (x) => x.toString(16).padStart(2, "0")).join("");
          if (!enc) return typeof Buffer !== "undefined" ? Buffer.from(out) : out;
          throw new Error("codifica\xE7\xE3o n\xE3o suportada: " + enc);
        }
      };
      var Sha1 = class extends Sha256 {
        constructor() {
          super();
          this.h = new Uint32Array([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
        }
        _block(p, o) {
          const w = this.w;
          const h = this.h;
          const rol = (x, n) => x << n | x >>> 32 - n;
          for (let i = 0; i < 16; i++) w[i] = p[o + 4 * i] << 24 | p[o + 4 * i + 1] << 16 | p[o + 4 * i + 2] << 8 | p[o + 4 * i + 3];
          for (let i = 16; i < 80; i++) w[i] = rol(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
          let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4];
          for (let i = 0; i < 80; i++) {
            const f = i < 20 ? b & c | ~b & d : i < 40 ? b ^ c ^ d : i < 60 ? b & c | b & d | c & d : b ^ c ^ d, k = i < 20 ? 1518500249 : i < 40 ? 1859775393 : i < 60 ? 2400959708 : 3395469782;
            const t = rol(a, 5) + f + e + k + w[i] | 0;
            e = d;
            d = c;
            c = rol(b, 30);
            b = a;
            a = t;
          }
          h[0] = h[0] + a | 0;
          h[1] = h[1] + b | 0;
          h[2] = h[2] + c | 0;
          h[3] = h[3] + d | 0;
          h[4] = h[4] + e | 0;
        }
        digest(enc) {
          if (this.done) throw new Error("digest j\xE1 calculado");
          this.done = true;
          const bits = this.len * 8, pad = new Uint8Array((this.fill < 56 ? 56 : 120) - this.fill + 8);
          pad[0] = 128;
          const hi = Math.floor(bits / 4294967296), lo = bits >>> 0, n = pad.length;
          pad[n - 8] = hi >>> 24;
          pad[n - 7] = hi >>> 16;
          pad[n - 6] = hi >>> 8;
          pad[n - 5] = hi;
          pad[n - 4] = lo >>> 24;
          pad[n - 3] = lo >>> 16;
          pad[n - 2] = lo >>> 8;
          pad[n - 1] = lo;
          const keep = this.len;
          this.done = false;
          this.update(pad);
          this.len = keep;
          this.done = true;
          const out = new Uint8Array(20);
          for (let i = 0; i < 5; i++) {
            out[4 * i] = this.h[i] >>> 24;
            out[4 * i + 1] = this.h[i] >>> 16;
            out[4 * i + 2] = this.h[i] >>> 8;
            out[4 * i + 3] = this.h[i];
          }
          if (enc === "hex") return Array.from(out, (x) => x.toString(16).padStart(2, "0")).join("");
          if (!enc) return typeof Buffer !== "undefined" ? Buffer.from(out) : out;
          throw new Error("codifica\xE7\xE3o n\xE3o suportada: " + enc);
        }
      };
      function createHash(alg) {
        const a = String(alg).toLowerCase();
        if (a === "sha256") return new Sha256();
        if (a === "sha1") return new Sha1();
        throw new Error("s\xF3 sha256 e sha1 s\xE3o suportados na vers\xE3o web");
      }
      function randomBytes(n) {
        const a = new Uint8Array(n);
        const c = globalThis.crypto;
        if (!c || !c.getRandomValues) throw new Error("sem gerador de n\xFAmeros aleat\xF3rios seguro neste ambiente");
        for (let i = 0; i < n; i += 65536) c.getRandomValues(a.subarray(i, Math.min(n, i + 65536)));
        return typeof Buffer !== "undefined" ? Buffer.from(a) : a;
      }
      module.exports = { createHash, randomBytes };
    }
  });

  // ../core/components/pdfrefs.js
  var require_pdfrefs = __commonJS({
    "../core/components/pdfrefs.js"(exports, module) {
      "use strict";
      var SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
      var MAX_PDFS = 200;
      var MAX_REFS = 500;
      var MAX_RECTS = 40;
      var MAX_QUOTE = 2e3;
      var MAX_PAGE = 1e5;
      var clamp01 = (n) => Math.min(1, Math.max(0, n));
      function sanitizePdfs(list) {
        const out = [], seen = /* @__PURE__ */ new Set();
        for (const p of Array.isArray(list) ? list : []) {
          if (out.length >= MAX_PDFS) break;
          if (!p || typeof p.id !== "string" || !SAFE_ID.test(p.id) || seen.has(p.id) || typeof p.path !== "string" || !p.path) continue;
          seen.add(p.id);
          out.push({ id: p.id, name: String(p.name ?? "").slice(0, 200) || baseName(p.path), path: p.path.slice(0, 1e3) });
        }
        return out;
      }
      var baseName = (p) => String(p).split(/[\\/]/).pop().replace(/\.pdf$/i, "").slice(0, 200) || "PDF";
      function sanitizeRefs(list) {
        const out = [];
        for (const r of Array.isArray(list) ? list : []) {
          if (out.length >= MAX_REFS) break;
          if (!r || typeof r.pdf !== "string" || !SAFE_ID.test(r.pdf) || !Number.isInteger(r.page) || r.page < 1 || r.page > MAX_PAGE) continue;
          const rects = (Array.isArray(r.rects) ? r.rects : []).slice(0, MAX_RECTS).filter((q) => Array.isArray(q) && q.length === 4 && q.every((n) => Number.isFinite(n))).map((q) => q.map(clamp01)).filter((q) => q[2] > 0 && q[3] > 0);
          out.push({ pdf: r.pdf, page: r.page, quote: String(r.quote ?? "").slice(0, MAX_QUOTE), rects });
        }
        return out;
      }
      var refLabel = (ref, pdfs) => {
        const p = (pdfs || []).find((x) => x.id === ref.pdf);
        return `${p ? p.name : "PDF n\xE3o vinculado"}, p. ${ref.page}`;
      };
      module.exports = { sanitizePdfs, sanitizeRefs, refLabel, baseName, SAFE_ID, MAX_REFS };
    }
  });

  // ../core/components/model.js
  var require_model = __commonJS({
    "../core/components/model.js"(exports, module) {
      "use strict";
      var crypto = require_crypto();
      var pdfrefs = require_pdfrefs();
      var newId = () => crypto.randomBytes(16).toString("hex");
      function createNode(title = "T\xF3pico", extra = {}) {
        return { id: newId(), title, notes: "", collapsed: false, style: {}, markers: [], progress: null, children: [], ...extra };
      }
      var MAX_DEPTH = 100;
      var MindMap = class _MindMap {
        constructor(root = createNode("Mapa mental"), meta = {}) {
          this.root = root;
          this.meta = { name: root.title, theme: "ocean", ...meta };
          if (!Array.isArray(this.meta.relations)) this.meta.relations = [];
          this._undo = [];
          this._redo = [];
        }
        /** Acha um tópico pelo id. Sem `node`, procura na árvore principal e também nos tópicos soltos do Mindomo (editáveis no lugar). */
        find(id, node = null, parent = null) {
          if (node) return this._findIn(id, node, parent);
          const main = this._findIn(id, this.root, null);
          if (main) return main;
          for (const f of this.meta._momFloating || []) {
            const r = this._findIn(id, f.node, null);
            if (r) return r;
          }
          return null;
        }
        _findIn(id, node, parent) {
          if (node.id === id) return { node, parent };
          for (const c of node.children) {
            const r = this._findIn(id, c, node);
            if (r) return r;
          }
          return null;
        }
        walk(fn, node = this.root, level = 0, parent = null) {
          fn(node, level, parent);
          for (const c of node.children) this.walk(fn, c, level + 1, node);
        }
        // --- histórico (snapshots JSON; simples e robusto para mapas de tamanho normal) ---
        _snapshot() {
          if (this._inBatch) return;
          this._undo.push(JSON.stringify({ root: this.root, meta: this.meta }));
          if (this._undo.length > 200) this._undo.shift();
          this._redo.length = 0;
        }
        _restore(json) {
          const s = JSON.parse(json);
          this.root = s.root;
          this.meta = s.meta;
        }
        /** Há o que desfazer / refazer (a interface usa para habilitar os botões). */
        canUndo() {
          return this._undo.length > 0;
        }
        canRedo() {
          return this._redo.length > 0;
        }
        undo() {
          if (!this._undo.length) return false;
          this._redo.push(JSON.stringify({ root: this.root, meta: this.meta }));
          this._restore(this._undo.pop());
          return true;
        }
        redo() {
          if (!this._redo.length) return false;
          this._undo.push(JSON.stringify({ root: this.root, meta: this.meta }));
          this._restore(this._redo.pop());
          return true;
        }
        /**
         * Executa várias alterações como UMA ação desfazível. Se algo lançar erro, tudo é revertido
         * (nenhuma alteração parcial fica no mapa).
         */
        batch(fn) {
          if (this._inBatch) return fn();
          const before = JSON.stringify({ root: this.root, meta: this.meta });
          this._snapshot();
          this._inBatch = true;
          try {
            return fn();
          } catch (e) {
            this._restore(before);
            this._undo.pop();
            throw e;
          } finally {
            this._inBatch = false;
          }
        }
        /** Ids ordenados pela ordem do documento, sem repetidos, sem a raiz e sem descendentes de outro id da lista. */
        topLevel(ids) {
          const want = new Set(ids);
          const out = [];
          const rec = (n, covered) => {
            if (want.has(n.id) && n !== this.root) {
              if (!covered) out.push(n);
              covered = true;
            }
            n.children.forEach((c) => rec(c, covered));
          };
          rec(this.root, false);
          return out;
        }
        // --- edição ---
        /** Profundidade de um tópico (raiz = 0), ou -1 se não existir. Iterativo: seguro em árvores muito fundas. */
        depthOf(id) {
          const stack = [[this.root, 0]];
          while (stack.length) {
            const [n, d] = stack.pop();
            if (n.id === id) return d;
            for (const c of n.children) stack.push([c, d + 1]);
          }
          return -1;
        }
        /** Altura de uma subárvore (nó sem filhos = 0). Iterativo. */
        static heightOf(node) {
          let h = 0;
          const stack = [[node, 0]];
          while (stack.length) {
            const [n, d] = stack.pop();
            if (d > h) h = d;
            for (const c of n.children) stack.push([c, d + 1]);
          }
          return h;
        }
        /** Garante que um tópico (ou subárvore de altura `height`) pendurado em `parentId` não passe de MAX_DEPTH níveis. */
        _checkDepth(parentId, height = 0) {
          if (this.depthOf(parentId) + 1 + height > MAX_DEPTH) throw new Error(`Profundidade m\xE1xima: ${MAX_DEPTH} n\xEDveis de subt\xF3picos.`);
        }
        addChild(parentId, title = "T\xF3pico", index) {
          const p = this.find(parentId);
          if (!p) return null;
          this._checkDepth(parentId);
          this._snapshot();
          const n = createNode(title);
          p.node.collapsed = false;
          if (index == null || index > p.node.children.length) p.node.children.push(n);
          else p.node.children.splice(index, 0, n);
          return n;
        }
        /** Adiciona uma raiz independente, exibida fora da árvore principal e preservada no formato .mom. */
        addFloating(title = "T\xF3pico flutuante") {
          const list = Array.isArray(this.meta._momFloating) ? this.meta._momFloating : [];
          this._snapshot();
          const index = list.reduce((max, f) => Math.max(max, Number.isFinite(f.index) ? f.index : -1), -1) + 1;
          const floating = { node: createNode(title), index, parentId: null, previousId: null };
          this.meta._momFloating = [...list, floating];
          return floating.node;
        }
        addSibling(id, title = "T\xF3pico") {
          const r = this.find(id);
          if (!r || !r.parent) return null;
          return this.addChild(r.parent.id, title, r.parent.children.indexOf(r.node) + 1);
        }
        remove(id) {
          const r = this.find(id);
          if (!r || !r.parent) return false;
          this._snapshot();
          r.parent.children.splice(r.parent.children.indexOf(r.node), 1);
          const gone = /* @__PURE__ */ new Set();
          this.walk((n) => gone.add(n.id), r.node);
          this.meta.relations = this.meta.relations.filter((x) => !gone.has(x.from) && !gone.has(x.to));
          return true;
        }
        toggleMarker(id, marker) {
          const r = this.find(id);
          if (!r) return false;
          this._snapshot();
          const m = r.node.markers || (r.node.markers = []);
          const i = m.indexOf(marker);
          if (i >= 0) m.splice(i, 1);
          else m.push(marker);
          return true;
        }
        /** Relação (seta) entre dois tópicos quaisquer. Retorna a relação ou null se inválida/duplicada. */
        addRelation(from, to, label = "") {
          if (from === to || !this.find(from) || !this.find(to)) return null;
          if (this.meta.relations.some((x) => x.from === from && x.to === to)) return null;
          this._snapshot();
          const rel = { id: newId(), from, to, label };
          this.meta.relations.push(rel);
          return rel;
        }
        updateRelation(id, patch) {
          const r = this.meta.relations.find((x) => x.id === id);
          if (!r) return false;
          this._snapshot();
          Object.assign(r, patch);
          return true;
        }
        removeRelation(id) {
          if (!this.meta.relations.some((x) => x.id === id)) return false;
          this._snapshot();
          this.meta.relations = this.meta.relations.filter((x) => x.id !== id);
          return true;
        }
        /** Remove vários tópicos (e suas relações) como uma ação. Retorna quantos tópicos de topo saíram. */
        /** Exclui um tópico solto do Mindomo (com tudo o que está dentro dele). Uma ação desfazível. */
        removeFloating(id) {
          const list = this.meta._momFloating;
          const i = (list || []).findIndex((f) => f.node.id === id);
          if (i < 0) return false;
          this._snapshot();
          list.splice(i, 1);
          if (!list.length) delete this.meta._momFloating;
          return true;
        }
        removeMany(ids) {
          const tops = this.topLevel(ids);
          if (!tops.length) return 0;
          this.batch(() => tops.forEach((n) => this.remove(n.id)));
          return tops.length;
        }
        updateMany(ids, patch) {
          const list = ids.filter((id) => this.find(id));
          if (!list.length) return false;
          this.batch(() => list.forEach((id) => this.update(id, patch)));
          return true;
        }
        toggleMarkerMany(ids, marker) {
          const list = ids.map((id) => this.find(id)).filter(Boolean);
          if (!list.length) return false;
          const all = list.every((r) => (r.node.markers || []).includes(marker));
          this.batch(() => list.forEach((r) => {
            if ((r.node.markers || []).includes(marker) === all) this.toggleMarker(r.node.id, marker);
          }));
          return true;
        }
        /** Move vários tópicos (preservando a ordem do documento) para dentro de newParentId. */
        moveMany(ids, newParentId, index) {
          const tops = this.topLevel(ids);
          if (!tops.length || !this.find(newParentId)) return false;
          if (tops.some((n) => this.find(newParentId, n))) return false;
          this.batch(() => tops.forEach((n, i) => this.move(n.id, newParentId, index == null ? void 0 : index + i)));
          return true;
        }
        /**
         * Mostra os tópicos até o nível `n` (0 = só a raiz; 1 = raiz + disciplinas…) e recolhe os mais profundos.
         * `n = Infinity` expande tudo. Uma única ação desfazível. Retorna quantos tópicos mudaram de estado.
         */
        showLevels(n) {
          const changes = [];
          this.walk((node, level) => {
            const want = node.children.length > 0 && level >= n;
            if (!!node.collapsed !== want) changes.push([node, want]);
          });
          if (!changes.length) return 0;
          this._snapshot();
          for (const [node, want] of changes) node.collapsed = want;
          return changes.length;
        }
        /**
         * Põe os tópicos `ids` (em ordem de documento) ANTES ou DEPOIS do tópico `targetId`, como irmãos dele — é o "soltar entre irmãos" do arrastar.
         * Serve para reordenar (mesmo pai) e para mudar de pai ao mesmo tempo. Uma única ação desfazível. A raiz não tem irmãos.
         * @param where 'before' | 'after'
         */
        moveBeside(ids, targetId, where) {
          const t = this.find(targetId);
          if (!t || !t.parent || where !== "before" && where !== "after") return false;
          const tops = this.topLevel(ids);
          if (!tops.length || tops.some((n) => n.id === targetId || this.find(targetId, n))) return false;
          const parentId = t.parent.id;
          this.batch(() => {
            let anchor = t.node;
            for (const n of tops) {
              const kids = t.parent.children.filter((c) => c !== n);
              const at = kids.indexOf(anchor);
              this.move(n.id, parentId, where === "before" && anchor === t.node ? at : at + 1);
              anchor = n;
            }
          });
          return true;
        }
        // ---- reordenar e mudar de nível (teclado: Alt+setas) ----
        /** Troca de lugar com o irmão anterior (dir = -1) ou seguinte (dir = +1). */
        moveSibling(id, dir) {
          const r = this.find(id);
          if (!r || !r.parent) return false;
          const arr = r.parent.children, i = arr.indexOf(r.node), j = i + dir;
          if (j < 0 || j >= arr.length) return false;
          this._snapshot();
          [arr[i], arr[j]] = [arr[j], arr[i]];
          return true;
        }
        /** Rebaixa: o tópico vira o último filho do irmão que vem logo antes dele. */
        indent(id) {
          const r = this.find(id);
          if (!r || !r.parent) return false;
          const arr = r.parent.children, i = arr.indexOf(r.node);
          if (i <= 0) return false;
          const prev = arr[i - 1];
          this._snapshot();
          arr.splice(i, 1);
          prev.collapsed = false;
          prev.children.push(r.node);
          return true;
        }
        /** Promove: o tópico passa a ser irmão do pai, logo depois dele. Filhos diretos da raiz não podem subir. */
        outdent(id) {
          const r = this.find(id);
          if (!r || !r.parent) return false;
          const g = this.find(r.parent.id);
          if (!g.parent) return false;
          this._snapshot();
          r.parent.children.splice(r.parent.children.indexOf(r.node), 1);
          g.parent.children.splice(g.parent.children.indexOf(g.node) + 1, 0, r.node);
          return true;
        }
        /**
         * Escolhe sozinho o maior nível que mantém no máximo `maxVisible` tópicos visíveis (mínimo 1: as disciplinas sempre
         * aparecem) e recolhe o resto. Serve para importações grandes (editais com centenas de tópicos). Retorna o nível usado.
         */
        autoLevels(maxVisible = 120) {
          const per = [];
          this.walk((n, l) => {
            per[l] = (per[l] || 0) + 1;
          });
          let cum = 0, best = 1;
          for (let l = 0; l < per.length; l++) {
            cum += per[l];
            if (cum <= maxVisible) best = Math.max(best, l);
          }
          this.showLevels(best);
          return best;
        }
        /** Cópia profunda com ids novos. A cópia é um tópico novo: não leva os campos extras do arquivo original (_mcExtra). */
        static cloneSubtree(node) {
          const { children, ...rest } = node;
          const c = { ...JSON.parse(JSON.stringify(rest)), id: newId() };
          delete c._mom;
          delete c._mcExtra;
          c.children = node.children.map((k) => _MindMap.cloneSubtree(k));
          return c;
        }
        /** Insere uma subárvore já com ids novos como filho de parentId. Retorna o nó inserido. */
        addSubtree(parentId, tree, index) {
          const p = this.find(parentId);
          if (!p) return null;
          this._checkDepth(parentId, _MindMap.heightOf(tree));
          this._snapshot();
          p.node.collapsed = false;
          if (index == null || index > p.node.children.length) p.node.children.push(tree);
          else p.node.children.splice(index, 0, tree);
          return tree;
        }
        // --- PDFs vinculados e referências de trechos (core/pdfrefs.js) ---
        /** Registra um PDF no mapa (mesmo caminho = mesmo registro). */
        addPdf({ name, path: p }) {
          if (!p || typeof p !== "string") throw new Error("Caminho do PDF inv\xE1lido.");
          const cur = (this.meta.pdfs || []).find((x) => x.path.toLowerCase() === p.toLowerCase());
          if (cur) return cur;
          this._snapshot();
          const pdf = { id: newId().slice(0, 16), name: String(name || "").slice(0, 200) || pdfrefs.baseName(p), path: p.slice(0, 1e3) };
          (this.meta.pdfs = this.meta.pdfs || []).push(pdf);
          return pdf;
        }
        /** Aponta um PDF registrado para outro arquivo (outro computador, arquivo movido). */
        relinkPdf(id, p) {
          const pdf = (this.meta.pdfs || []).find((x) => x.id === id);
          if (!pdf || !p || typeof p !== "string") return false;
          this._snapshot();
          pdf.path = p.slice(0, 1e3);
          return true;
        }
        /** Anexa uma referência (PDF, página, trecho e retângulos) a um tópico. */
        addRef(nodeId, ref) {
          const r = this.find(nodeId);
          if (!r) return false;
          const clean = pdfrefs.sanitizeRefs([ref])[0];
          if (!clean) throw new Error("Refer\xEAncia de PDF inv\xE1lida.");
          if (!(this.meta.pdfs || []).some((x) => x.id === clean.pdf)) throw new Error("O PDF da refer\xEAncia n\xE3o est\xE1 registrado no mapa.");
          this._snapshot();
          (r.node.refs = r.node.refs || []).push(clean);
          return true;
        }
        removeRef(nodeId, index) {
          const r = this.find(nodeId);
          if (!r || !Array.isArray(r.node.refs) || !r.node.refs[index]) return false;
          this._snapshot();
          r.node.refs.splice(index, 1);
          if (!r.node.refs.length) delete r.node.refs;
          return true;
        }
        update(id, patch) {
          const r = this.find(id);
          if (!r) return false;
          this._snapshot();
          const { style, ...rest } = patch;
          Object.assign(r.node, rest);
          if (style) r.node.style = { ...r.node.style, ...style };
          return true;
        }
        /** Move `id` para ser filho de `newParentId` na posição `index`. Impede ciclos. */
        move(id, newParentId, index) {
          const r = this.find(id);
          const np = this.find(newParentId);
          if (!r || !np || !r.parent) return false;
          if (this.find(newParentId, r.node)) return false;
          this._checkDepth(newParentId, _MindMap.heightOf(r.node));
          this._snapshot();
          r.parent.children.splice(r.parent.children.indexOf(r.node), 1);
          const i = index == null ? np.node.children.length : Math.min(index, np.node.children.length);
          np.node.children.splice(i, 0, r.node);
          return true;
        }
        toJSON() {
          return { meta: this.meta, root: this.root };
        }
        static fromJSON(j) {
          return new _MindMap(j.root, j.meta);
        }
      };
      module.exports = { MindMap, createNode, newId, MAX_DEPTH };
    }
  });

  // ../core/components/flow.js
  var require_flow = __commonJS({
    "../core/components/flow.js"(exports, module) {
      "use strict";
      var { MindMap, createNode } = require_model();
      var FLOW_TYPES = ["start", "step", "decision", "end"];
      var FLOW_LABELS = { start: "In\xEDcio", step: "Passo", decision: "Decis\xE3o", end: "Fim" };
      var MAX_BRANCHES = 2;
      var DEFAULT_BRANCHES = ["Sim", "N\xE3o"];
      var MAX_PATHS = 200;
      var MAX_PATH_LEN = 60;
      var typeOf = (n) => FLOW_TYPES.includes(n.flowType) ? n.flowType : "step";
      function isFlow(map) {
        return map.meta.kind === "flow" || map.root.flowType === "start";
      }
      function createFlow(title = "Fluxograma") {
        return new MindMap(createNode(title, { flowType: "start" }), { kind: "flow", name: title });
      }
      var nodeOf = (map, id) => {
        const r = map.find(id);
        return r ? r.node : null;
      };
      var isLeaf = (n) => n.children.length === 0;
      function insertStepAfter(map, id, { type = "step", title, branch } = {}) {
        const r = map.find(id);
        if (!r) throw new Error("Passo n\xE3o encontrado.");
        if (!FLOW_TYPES.includes(type)) throw new Error("Tipo de passo desconhecido.");
        if (type === "start") throw new Error("Um fluxo tem s\xF3 um in\xEDcio.");
        const t = typeOf(r.node);
        if (t === "end") throw new Error("O fim n\xE3o tem sa\xEDda. Insira o passo antes dele, selecionando o passo anterior.");
        if (t === "decision") {
          if (!branch) throw new Error("Escolha o ramo da decis\xE3o (ex.: Sim ou N\xE3o).");
          return addBranch(map, id, branch, { type, title });
        }
        if (type === "end" && r.node.children.length) throw new Error("O fim deve ficar no final: insira-o depois do \xFAltimo passo.");
        map._snapshot();
        const n = createNode(title || FLOW_LABELS[type], { flowType: type });
        if (type !== "end") {
          n.children = r.node.children;
          r.node.children = [n];
        } else {
          r.node.children.push(n);
        }
        r.node.collapsed = false;
        return n;
      }
      function addBranch(map, decisionId, label, { type = "step", title } = {}) {
        const r = map.find(decisionId);
        if (!r) throw new Error("Decis\xE3o n\xE3o encontrada.");
        if (typeOf(r.node) !== "decision") throw new Error("S\xF3 uma decis\xE3o tem ramos.");
        const text = String(label || "").trim();
        if (!text) throw new Error("O ramo precisa de um r\xF3tulo (ex.: Sim ou N\xE3o).");
        if (r.node.children.length >= MAX_BRANCHES) throw new Error(`Uma decis\xE3o tem no m\xE1ximo ${MAX_BRANCHES} ramos.`);
        if (r.node.children.some((c) => (c.branchLabel || "").toLowerCase() === text.toLowerCase())) throw new Error(`J\xE1 existe um ramo "${text}".`);
        if (type === "start") throw new Error("Um fluxo tem s\xF3 um in\xEDcio.");
        map._snapshot();
        const n = createNode(title || FLOW_LABELS[type], { flowType: type, branchLabel: text.slice(0, 60) });
        r.node.children.push(n);
        r.node.collapsed = false;
        return n;
      }
      function setFlowType(map, id, type) {
        const r = map.find(id);
        if (!r) throw new Error("Passo n\xE3o encontrado.");
        if (!FLOW_TYPES.includes(type)) throw new Error("Tipo de passo desconhecido.");
        if (type === "start" && findStarts(map).some((n) => n.id !== id)) throw new Error("Um fluxo tem s\xF3 um in\xEDcio.");
        if (type === "end" && r.node.children.length) throw new Error("O fim n\xE3o tem sa\xEDda: remova ou mova os pr\xF3ximos passos antes.");
        map._snapshot();
        r.node.flowType = type;
        return r.node;
      }
      function removeStep(map, id) {
        const r = map.find(id);
        if (!r) throw new Error("Passo n\xE3o encontrado.");
        if (!r.parent) throw new Error("O in\xEDcio do fluxo n\xE3o pode ser exclu\xEDdo.");
        const n = r.node;
        const sub = n.children.length > 1 || typeOf(n) === "decision";
        if (!sub && n.children.length === 1) {
          map._snapshot();
          const i = r.parent.children.indexOf(n);
          const next = n.children[0];
          if (typeOf(r.parent) === "decision") next.branchLabel = n.branchLabel || next.branchLabel;
          r.parent.children.splice(i, 1, next);
          map.meta.relations = map.meta.relations.filter((x) => x.from !== n.id && x.to !== n.id);
          return { removed: 1, subtree: false };
        }
        const count = [];
        map.walk((x) => count.push(x), n);
        map.remove(id);
        return { removed: count.length, subtree: sub };
      }
      function findStarts(map) {
        const out = [];
        map.walk((n) => {
          if (typeOf(n) === "start") out.push(n);
        });
        return out;
      }
      function successors(map, id) {
        const n = nodeOf(map, id);
        if (!n) return [];
        const seq = n.children.map((c) => ({ to: c.id, label: c.branchLabel || "", kind: "seq" }));
        const rel = map.meta.relations.filter((x) => x.from === id).map((x) => ({ to: x.to, label: x.label || "", kind: "rel" }));
        return [...seq, ...rel];
      }
      function connect(map, fromId, toId, label = "") {
        const from = nodeOf(map, fromId);
        const to = nodeOf(map, toId);
        if (!from) throw new Error("Passo de sa\xEDda n\xE3o encontrado.");
        if (!to) throw new Error("Passo de entrada n\xE3o encontrado.");
        if (fromId === toId) throw new Error("Um passo n\xE3o pode ligar para si mesmo.");
        const existing = map.meta.relations.find((r) => r.from === fromId && r.to === toId);
        if (existing) {
          map._snapshot();
          existing.label = String(label).slice(0, 60);
        } else {
          map._snapshot();
          const rel = { id: "r" + Date.now() + "-" + Math.random().toString(36).slice(2, 9), from: fromId, to: toId, label: String(label).slice(0, 60) };
          if (!Array.isArray(map.meta.relations)) map.meta.relations = [];
          map.meta.relations.push(rel);
        }
      }
      function disconnect(map, fromId, toId) {
        map._snapshot();
        map.meta.relations = map.meta.relations.filter((r) => !(r.from === fromId && r.to === toId));
      }
      function validateFlow(map) {
        const warn = [];
        const starts = findStarts(map);
        if (!starts.length) warn.push({ level: "error", id: null, message: "O fluxo n\xE3o tem in\xEDcio." });
        if (starts.length > 1) warn.push({ level: "error", id: starts[1].id, message: "H\xE1 mais de um in\xEDcio no fluxo." });
        map.walk((n) => {
          const t = typeOf(n);
          const name = n.title || "Sem t\xEDtulo";
          if (t === "decision") {
            const k = n.children.length;
            if (k !== MAX_BRANCHES) warn.push({ level: "warn", id: n.id, message: `Decis\xE3o "${name}" com ${k} ramo(s); o correto s\xE3o ${MAX_BRANCHES} (ex.: Sim e N\xE3o).` });
            for (const c of n.children) if (!c.branchLabel) warn.push({ level: "warn", id: c.id, message: `Ramo sem r\xF3tulo ap\xF3s a decis\xE3o "${name}".` });
          } else if (t === "end" && n.children.length) {
            warn.push({ level: "error", id: n.id, message: `O fim "${name}" tem sa\xEDdas; o fim n\xE3o pode ter pr\xF3ximos passos.` });
          } else if (t !== "end" && t !== "decision" && n.children.length > 1) {
            warn.push({ level: "error", id: n.id, message: `Passo "${name}" com ${n.children.length} pr\xF3ximos filhos; a estrutura n\xE3o \xE9 v\xE1lida. Para bifurcar, use uma decis\xE3o; para caminhos alternativos, use setas extras.` });
          }
          if (t !== "end" && t !== "decision" && isLeaf(n) && !map.meta.relations.some((x) => x.from === n.id)) {
            warn.push({ level: "warn", id: n.id, message: `Passo "${name}" sem sa\xEDda: marque como Fim ou acrescente o pr\xF3ximo passo.` });
          }
        });
        return warn;
      }
      function listPaths(map, { max = MAX_PATHS, maxLen = MAX_PATH_LEN } = {}) {
        const paths = [];
        let truncated = false;
        const starts = findStarts(map);
        if (!starts.length) return { paths, truncated };
        const walkFrom = (id, trail, seen) => {
          if (paths.length >= max) {
            truncated = true;
            return;
          }
          const outs = successors(map, id);
          if (typeOf(nodeOf(map, id)) === "end" || !outs.length) {
            paths.push(trail.slice());
            return;
          }
          if (trail.length >= maxLen) {
            truncated = true;
            paths.push(trail.slice());
            return;
          }
          for (const e of outs) {
            if (seen.has(e.to)) {
              paths.push([...trail, { id: e.to, via: e.label, loopTo: true }]);
              continue;
            }
            seen.add(e.to);
            trail.push({ id: e.to, via: e.label });
            walkFrom(e.to, trail, seen);
            trail.pop();
            seen.delete(e.to);
            if (paths.length >= max) {
              truncated = true;
              return;
            }
          }
        };
        for (const s of starts) walkFrom(s.id, [{ id: s.id, via: "" }], /* @__PURE__ */ new Set([s.id]));
        return { paths, truncated };
      }
      module.exports = {
        FLOW_TYPES,
        FLOW_LABELS,
        MAX_BRANCHES,
        DEFAULT_BRANCHES,
        MAX_PATHS,
        isFlow,
        createFlow,
        insertStepAfter,
        addBranch,
        setFlowType,
        removeStep,
        findStarts,
        successors,
        validateFlow,
        listPaths,
        typeOf,
        connect,
        disconnect
      };
    }
  });

  // ../core/components/flow-layout.js
  var require_flow_layout = __commonJS({
    "../core/components/flow-layout.js"(exports, module) {
      "use strict";
      var { textWidth } = require_layout();
      var { typeOf } = require_flow();
      var FONT = 13;
      var MAX_TEXT_W = 190;
      var GAP_X = 36;
      var GAP_Y = 56;
      var SIZE = {
        start: { h: 40, padX: 26, min: 110 },
        end: { h: 40, padX: 26, min: 110 },
        step: { h: 44, padX: 22, min: 132 },
        decision: { h: 66, padX: 44, min: 150 }
        // losango: precisa de mais área para o texto caber
      };
      function wrapWords(text, size, maxW) {
        const words = String(text || "").split(/\s+/).filter(Boolean);
        if (!words.length) return ["Sem t\xEDtulo"];
        const lines = [];
        let cur = "";
        for (const w of words) {
          const t = cur ? `${cur} ${w}` : w;
          if (cur && textWidth(t, size, false) > maxW) {
            lines.push(cur);
            cur = w;
          } else cur = t;
        }
        if (cur) lines.push(cur);
        return lines.slice(0, 4);
      }
      function boxFor(n) {
        const t = typeOf(n);
        const s = SIZE[t];
        const lines = wrapWords(n.title, FONT, MAX_TEXT_W);
        const tw = Math.max(...lines.map((l) => textWidth(l, FONT, false)));
        const lh = FONT * 1.3;
        const w = Math.max(s.min, Math.ceil(tw + s.padX * 2));
        const h = Math.max(s.h, Math.ceil(lines.length * lh + 18));
        return { id: n.id, type: t, title: n.title || "Sem t\xEDtulo", lines, lineHeight: lh, w, h, x: 0, y: 0, branch: n.branchLabel || "", sub: w, kids: [] };
      }
      function measure(n) {
        const b = boxFor(n);
        b.kids = n.children.map(measure);
        if (b.kids.length > 1) b.sub = Math.max(b.w, b.kids.reduce((s, k) => s + k.sub, 0) + (b.kids.length - 1) * GAP_X);
        else if (b.kids.length === 1) b.sub = Math.max(b.w, b.kids[0].sub);
        return b;
      }
      function place(b, cx, y, boxes) {
        b.x = cx - b.w / 2;
        b.y = y;
        boxes.set(b.id, b);
        if (b.kids.length === 1) {
          place(b.kids[0], cx, y + b.h + GAP_Y, boxes);
        } else if (b.kids.length > 1) {
          const total = b.kids.reduce((s, k) => s + k.sub, 0) + (b.kids.length - 1) * GAP_X;
          let left = cx - total / 2;
          for (const k of b.kids) {
            place(k, left + k.sub / 2, y + b.h + GAP_Y, boxes);
            left += k.sub + GAP_X;
          }
        }
      }
      function layoutFlow(map) {
        const root = measure(map.root);
        const boxes = /* @__PURE__ */ new Map();
        place(root, 0, 0, boxes);
        const edges = [];
        for (const b of boxes.values()) for (const k of b.kids) edges.push({ from: b.id, to: k.id, label: k.branch });
        const relations = map.meta.relations.filter((r) => boxes.has(r.from) && boxes.has(r.to)).map((r) => ({ id: r.id, from: r.from, to: r.to, label: r.label || "" }));
        let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
        for (const b of boxes.values()) {
          x1 = Math.min(x1, b.x);
          y1 = Math.min(y1, b.y);
          x2 = Math.max(x2, b.x + b.w);
          y2 = Math.max(y2, b.y + b.h);
        }
        const bounds = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
        return { boxes, edges, relations, bounds };
      }
      module.exports = { layoutFlow, wrapWords, GAP_X, GAP_Y };
    }
  });

  // ../core/components/forcelayout.js
  var require_forcelayout = __commonJS({
    "../core/components/forcelayout.js"(exports, module) {
      "use strict";
      function mulberry32(a) {
        return () => {
          a |= 0;
          a = a + 1831565813 | 0;
          let t = Math.imul(a ^ a >>> 15, 1 | a);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
      }
      function layoutComponent(m, edges, rnd, k, iterations) {
        const px = new Float64Array(m), py = new Float64Array(m), dx = new Float64Array(m), dy = new Float64Array(m);
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < m; i++) {
          const a = i * golden + rnd() * 0.6, r = Math.sqrt(i + 0.5) * k * 0.55;
          px[i] = Math.cos(a) * r;
          py[i] = Math.sin(a) * r;
        }
        const its = Math.max(60, Math.min(iterations, Math.round(iterations * Math.min(1, 500 / m))));
        let t = k * Math.min(3, 0.6 + Math.sqrt(m) * 0.12);
        const cool = t / (its + 1), cut2 = k * 6 * (k * 6);
        for (let it = 0; it < its; it++) {
          dx.fill(0);
          dy.fill(0);
          for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) {
            let ddx = px[i] - px[j], ddy = py[i] - py[j], d2 = ddx * ddx + ddy * ddy;
            if (d2 > cut2) continue;
            if (d2 < 0.01) {
              ddx = rnd() - 0.5;
              ddy = rnd() - 0.5;
              d2 = 0.01;
            }
            const d = Math.sqrt(d2), f = k * k / d, fx = ddx / d * f, fy = ddy / d * f;
            dx[i] += fx;
            dy[i] += fy;
            dx[j] -= fx;
            dy[j] -= fy;
          }
          for (const [a, b, w] of edges) {
            const ddx = px[a] - px[b], ddy = py[a] - py[b], d = Math.sqrt(ddx * ddx + ddy * ddy) || 0.01, f = d * d / k * w;
            dx[a] -= ddx / d * f;
            dy[a] -= ddy / d * f;
            dx[b] += ddx / d * f;
            dy[b] += ddy / d * f;
          }
          let cx = 0, cy = 0;
          for (let i = 0; i < m; i++) {
            cx += px[i];
            cy += py[i];
          }
          cx /= m;
          cy /= m;
          for (let i = 0; i < m; i++) {
            dx[i] -= (px[i] - cx) * 0.03;
            dy[i] -= (py[i] - cy) * 0.03;
            const d = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]) || 0.01, s = Math.min(d, t);
            px[i] += dx[i] / d * s;
            py[i] += dy[i] / d * s;
          }
          t -= cool;
        }
        let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
        for (let i = 0; i < m; i++) {
          x1 = Math.min(x1, px[i]);
          y1 = Math.min(y1, py[i]);
          x2 = Math.max(x2, px[i]);
          y2 = Math.max(y2, py[i]);
        }
        const pts = [];
        for (let i = 0; i < m; i++) pts.push({ x: px[i] - x1, y: py[i] - y1 });
        return { pts, w: x2 - x1, h: y2 - y1 };
      }
      function forceLayout(nodes, edges, { iterations = 300, seed = 7, maxNodes = 1500, spacing = 120 } = {}) {
        const pos = /* @__PURE__ */ new Map();
        if (!nodes.length) return pos;
        const list = nodes.length > maxNodes ? [...nodes].sort((a, b) => b.deg - a.deg).slice(0, maxNodes) : nodes;
        const n = list.length, idx = new Map(list.map((x3, i) => [x3.id, i]));
        const E = [];
        for (const e of edges) {
          const a = idx.get(e.from), b = idx.get(e.to);
          if (a !== void 0 && b !== void 0 && a !== b) E.push([a, b, e.type === "hierarchy" ? 0.5 : 1]);
        }
        const parent = Int32Array.from({ length: n }, (_, i) => i);
        const find = (x3) => {
          while (parent[x3] !== x3) {
            parent[x3] = parent[parent[x3]];
            x3 = parent[x3];
          }
          return x3;
        };
        for (const [a, b] of E) {
          const ra = find(a), rb = find(b);
          if (ra !== rb) parent[Math.max(ra, rb)] = Math.min(ra, rb);
        }
        const comps = /* @__PURE__ */ new Map();
        for (let i = 0; i < n; i++) {
          const r = find(i);
          (comps.get(r) || comps.set(r, []).get(r)).push(i);
        }
        const real = [...comps.values()].filter((c) => c.length >= 2).sort((a, b) => b.length - a.length || a[0] - b[0]);
        const orphans = [...comps.values()].filter((c) => c.length === 1).map((c) => c[0]);
        const extra = nodes.length > n ? nodes.filter((x3) => !idx.has(x3.id)) : [];
        const k = spacing * 0.8, gap = spacing * 0.9;
        const blocks = real.map((c, ci) => {
          const local = new Map(c.map((g, i) => [g, i])), ce = [];
          for (const [a, b, w] of E) if (local.has(a) && local.has(b)) ce.push([local.get(a), local.get(b), w]);
          const r = layoutComponent(c.length, ce, mulberry32(seed * 7919 + ci * 104729 + 13), k, iterations);
          return { c, ...r };
        });
        const area = blocks.reduce((s, b) => s + (b.w + gap) * (b.h + gap), 0) + (orphans.length + extra.length) * (k * 0.75) * (k * 0.75);
        const maxW = blocks.reduce((m, b) => Math.max(m, b.w), 0), target = Math.max(maxW, Math.sqrt(area) * 1.7);
        let x = 0, y = 0, rowH = 0, usedW = 0;
        const placed = [];
        for (const b of blocks) {
          if (x > 0 && x + b.w > target) {
            x = 0;
            y += rowH + gap;
            rowH = 0;
          }
          placed.push({ b, ox: x, oy: y });
          x += b.w + gap;
          rowH = Math.max(rowH, b.h);
          usedW = Math.max(usedW, x - gap);
        }
        const bottom = blocks.length ? y + rowH : 0;
        for (const { b, ox, oy } of placed) b.c.forEach((g, i) => pos.set(list[g].id, { x: ox + b.pts[i].x, y: oy + b.pts[i].y }));
        const lone = [...orphans.map((i) => list[i].id), ...extra.map((e) => e.id)];
        if (lone.length) {
          const cell = k * 0.75, cols = Math.max(3, Math.min(lone.length, Math.ceil(Math.max(usedW, cell * 6) / cell), Math.ceil(Math.sqrt(lone.length * 1.8))));
          const top = blocks.length ? bottom + gap * 1.4 : 0;
          lone.forEach((id, i) => pos.set(id, { x: i % cols * cell, y: top + Math.floor(i / cols) * cell }));
        }
        let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
        for (const p of pos.values()) {
          x1 = Math.min(x1, p.x);
          y1 = Math.min(y1, p.y);
          x2 = Math.max(x2, p.x);
          y2 = Math.max(y2, p.y);
        }
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        for (const p of pos.values()) {
          p.x -= mx;
          p.y -= my;
        }
        return pos;
      }
      module.exports = { forceLayout };
    }
  });

  // ../core/components/graph-labels.js
  var require_graph_labels = __commonJS({
    "../core/components/graph-labels.js"(exports, module) {
      "use strict";
      var ROW_H = 15;
      var CELL = 80;
      var SpatialGrid = class {
        constructor(cell = CELL) {
          this.cell = cell;
          this.cells = /* @__PURE__ */ new Map();
        }
        _key(cx, cy) {
          return cx * 100003 + cy;
        }
        put(b) {
          const c = this.cell;
          for (let cx = Math.floor(b.x / c); cx <= Math.floor((b.x + b.w) / c); cx++) for (let cy = Math.floor(b.y / c); cy <= Math.floor((b.y + b.h) / c); cy++) {
            const k = this._key(cx, cy);
            (this.cells.get(k) || this.cells.set(k, []).get(k)).push(b);
          }
          return b;
        }
        /** `b` encosta (com folga `gap`) em algum retângulo guardado, exceto `skip`? */
        hits(b, gap = 0, skip = null) {
          const c = this.cell;
          for (let cx = Math.floor((b.x - gap) / c); cx <= Math.floor((b.x + b.w + gap) / c); cx++) for (let cy = Math.floor((b.y - gap) / c); cy <= Math.floor((b.y + b.h + gap) / c); cy++) {
            const l = this.cells.get(this._key(cx, cy));
            if (!l) continue;
            for (const o of l) if (o !== skip && b.x - gap < o.x + o.w && o.x < b.x + b.w + gap && b.y - gap < o.y + o.h && o.y < b.y + b.h + gap) return true;
          }
          return false;
        }
      };
      function placeLabels(items, o) {
        const { width, height, obstacles = [], mode = "auto", budget = Infinity, gap = 0, measure, fit } = o;
        const placed = /* @__PURE__ */ new Map();
        let shown = 0;
        const grid = new SpatialGrid();
        const order = items.map((it, n) => [it, n]).sort((a, b) => (b[0].score || 0) - (a[0].score || 0) || a[1] - b[1]).map((x) => x[0]);
        const circ = /* @__PURE__ */ new Map();
        for (const it of order) circ.set(it.id, grid.put({ x: it.x - it.r, y: it.y - it.r, w: it.r * 2, h: it.r * 2 }));
        for (const b of obstacles) if (b.w > 0 && b.h > 0) grid.put({ ...b });
        for (const it of order) {
          const forced = !!it.forced;
          const allowed = mode === "all" ? true : mode === "none" ? forced : mode === "relevant" ? forced || !!it.relevant : forced || shown < budget;
          if (!allowed) continue;
          const text = fit(it.text, forced ? 300 : 170), w = measure(text, it) + 6, off = it.r + 4;
          const cands = [
            { x: it.x - w / 2, y: it.y + off, anchor: "middle", ox: 0, oy: off + ROW_H / 2 },
            { x: it.x + off, y: it.y - ROW_H / 2, anchor: "start", ox: off, oy: 0 },
            { x: it.x - w / 2, y: it.y - off - ROW_H, anchor: "middle", ox: 0, oy: -off - ROW_H / 2 },
            { x: it.x - off - w, y: it.y - ROW_H / 2, anchor: "end", ox: -off, oy: 0 }
          ];
          let pick = null;
          if (mode === "all") pick = cands[0];
          else for (const c of cands) {
            const b = { x: c.x, y: c.y, w, h: ROW_H };
            if (b.x >= -2 && b.x + w <= width + 2 && b.y >= 0 && b.y + ROW_H <= height + 2 && !grid.hits(b, gap, circ.get(it.id))) {
              pick = c;
              break;
            }
          }
          if (!pick && forced) pick = cands[0];
          if (!pick) continue;
          grid.put({ x: pick.x, y: pick.y, w, h: ROW_H });
          shown++;
          placed.set(it.id, { text, ox: pick.ox, oy: pick.oy, anchor: pick.anchor, big: forced });
        }
        return { placed, shown };
      }
      function relationLabelAnchor(a, b, focusEnd) {
        const from = focusEnd === "b" ? b : a, to = focusEnd === "b" ? a : b;
        let t = 0.5;
        if (focusEnd) {
          const len = Math.hypot(a.x - b.x, a.y - b.y) || 1;
          t = Math.min(0.5, 110 / len);
        }
        return { from, to, t, x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
      }
      module.exports = { placeLabels, relationLabelAnchor, SpatialGrid, ROW_H };
    }
  });

  // ../core/components/links.js
  var require_links = __commonJS({
    "../core/components/links.js"(exports, module) {
      "use strict";
      var norm = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
      var LINK_RE = /\[\[([^\[\]\n|#]{1,200})(?:#([^\[\]\n|]{0,200}))?(?:\|([^\[\]\n]{1,200}))?\]\]/g;
      var stripCode = (s) => String(s ?? "").replace(/```[\s\S]*?```/g, " ").replace(/`[^`\n]*`/g, " ");
      function shapeLink(raw, targetRaw, headingRaw, aliasRaw) {
        const target = targetRaw.trim();
        const hasHash = headingRaw !== void 0;
        const heading = hasHash ? headingRaw.trim() || null : null;
        const alias = aliasRaw ? aliasRaw.trim() : null;
        const typed = hasHash ? `${target}#${headingRaw.trim()}` : target;
        const parts = target.split("/").map((s) => s.trim()).filter(Boolean);
        if (parts.length > 1) {
          const note = parts[parts.length - 1];
          return { raw, target, typed, note, heading, map: parts[parts.length - 2], topic: note, hashForm: false, alias };
        }
        if (hasHash) return { raw, target, typed, note: target, heading, map: target, topic: heading, hashForm: true, alias };
        return { raw, target, typed, note: target, heading: null, map: null, topic: target, hashForm: false, alias };
      }
      function parseLinks(text) {
        const out = [];
        for (const m of stripCode(text).matchAll(LINK_RE)) {
          const a = m[1].trim();
          if (!a) continue;
          if (!a.replace(/\//g, "").trim()) continue;
          out.push(shapeLink(m[0], m[1], m[2], m[3]));
        }
        return out;
      }
      function rewriteLinks(text, fn) {
        const src = String(text ?? "");
        const protectedRanges = [];
        for (const m of src.matchAll(/```[\s\S]*?```|`[^`\n]*`/g)) protectedRanges.push([m.index, m.index + m[0].length]);
        return src.replace(LINK_RE, (raw, a, b, alias, offset) => {
          if (protectedRanges.some(([s, e]) => offset >= s && offset < e)) return raw;
          if (!a.trim()) return raw;
          const r = fn(shapeLink(raw, a, b, alias));
          return r == null ? raw : r;
        });
      }
      var plainLinks = (text) => rewriteLinks(text, (lk) => lk.alias || lk.topic || lk.map);
      function migrateLegacyLinks(text, hasMap) {
        let count = 0;
        const out = rewriteLinks(text, (lk) => {
          if (!lk.hashForm || !lk.map || !lk.topic || lk.map.includes("/") || !hasMap(lk.map)) return null;
          count++;
          const target = `${lk.map}/${lk.topic}`;
          return lk.alias ? `[[${target}|${lk.alias}]]` : `[[${target}]]`;
        });
        return { text: out, count };
      }
      module.exports = { norm, parseLinks, rewriteLinks, plainLinks, migrateLegacyLinks, LINK_RE };
    }
  });

  // ../core/components/graph.js
  var require_graph = __commonJS({
    "../core/components/graph.js"(exports, module) {
      "use strict";
      var { norm, parseLinks } = require_links();
      function walkAll(map, fn) {
        const visit = (node, level, parent) => {
          fn(node, level, parent);
          for (const c of node.children) visit(c, level + 1, node);
        };
        visit(map.root, 0, null);
        for (const f of map.meta._momFloating || []) visit(f.node, 0, null);
      }
      var EDGE_POWER = { link: 1, relation: 1.2, hierarchy: 0.5 };
      function computeWeights(nodes, edges) {
        const n = nodes.length;
        if (!n) return;
        const idx = new Map(nodes.map((g, i) => [g.id, i]));
        const outs = nodes.map(() => []);
        const addArc = (a, b, w) => {
          if (a !== b && w > 0) outs[a].push([b, w]);
        };
        for (const e of edges) {
          const a = idx.get(e.from), b = idx.get(e.to);
          if (a == null || b == null) continue;
          const w = EDGE_POWER[e.type] ?? 1;
          addArc(a, b, w);
          addArc(b, a, e.type === "hierarchy" ? w : w * 0.3);
        }
        const total = outs.map((l) => l.reduce((t, [, w]) => t + w, 0));
        let r = new Array(n).fill(1 / n);
        for (let it = 0; it < 40; it++) {
          const nx = new Array(n).fill(0);
          let dangling = 0;
          for (let i = 0; i < n; i++) {
            if (!total[i]) {
              dangling += r[i];
              continue;
            }
            for (const [j, w] of outs[i]) nx[j] += r[i] * w / total[i];
          }
          let diff = 0;
          for (let i = 0; i < n; i++) {
            const v = 0.15 / n + 0.85 * (nx[i] + dangling / n);
            diff += Math.abs(v - r[i]);
            nx[i] = v;
          }
          r = nx;
          if (diff < 1e-9) break;
        }
        const max = Math.max(...r) || 1;
        nodes.forEach((g, i) => {
          g.rank = r[i] / max;
          const own = Math.min(g.childCount || 0, 6) * 0.4 + (g.hasNote ? 1 : 0);
          g.importance = Math.round((g.rank * 10 + own + Math.min(g.deg || 0, 8) * 0.5) * 100) / 100;
        });
      }
      function buildGraph(maps, { hierarchy = false } = {}) {
        const nodes = [];
        const byId = /* @__PURE__ */ new Map();
        const edges = [];
        const edgeKeys = /* @__PURE__ */ new Set();
        const ghosts = /* @__PURE__ */ new Map();
        const mapIndex = /* @__PURE__ */ new Map();
        const add = (k, e) => {
          if (!mapIndex.has(k)) mapIndex.set(k, []);
          mapIndex.get(k).push(e);
        };
        const entries = maps.map((m) => {
          const topics = /* @__PURE__ */ new Map();
          const e = { ...m, topics, root: m.map.root };
          walkAll(m.map, (n) => {
            const k = norm(n.title);
            if (!topics.has(k)) topics.set(k, []);
            topics.get(k).push(n);
          });
          return e;
        });
        for (const e of entries) {
          add(norm(e.name), e);
          if (norm(e.map.root.title) !== norm(e.name)) add(norm(e.map.root.title), e);
        }
        const idOf = (e, n) => `${e.key}::${n.id}`;
        for (const e of entries) {
          walkAll(e.map, (n, level, parent) => {
            const g = { id: idOf(e, n), kind: "topic", title: n.title, mapKey: e.key, mapName: e.name, topicId: n.id, isRoot: !parent, progress: n.progress ?? null, deg: 0, childCount: n.children.length, hasNote: !!(n.notes && String(n.notes).trim()), weight: 0 };
            nodes.push(g);
            byId.set(g.id, g);
          });
        }
        const link = (from, to, type, extra = {}) => {
          if (from === to) return;
          const k = `${from}>${to}>${type}`;
          if (edgeKeys.has(k)) return;
          edgeKeys.add(k);
          edges.push({ from, to, type, ...extra });
        };
        const ghost = (label, key) => {
          const id = `ghost::${key}`;
          if (!ghosts.has(id)) {
            const g = { id, kind: "ghost", title: label, mapKey: null, mapName: null, topicId: null, isRoot: false, progress: null, deg: 0 };
            ghosts.set(id, g);
            nodes.push(g);
            byId.set(id, g);
          }
          return id;
        };
        const resolve = (lk, from) => {
          const t = lk.topic == null ? null : norm(lk.topic);
          const heading = lk.hashForm ? null : lk.heading ?? null;
          if (lk.map) {
            const cands = mapIndex.get(norm(lk.map)) || [];
            if (!cands.length && lk.hashForm && lk.note) {
              return resolve({ map: null, topic: lk.note, note: lk.note, heading: lk.heading, hashForm: false }, from);
            }
            if (!cands.length) return { id: ghost(lk.topic ? `${lk.map}#${lk.topic}` : lk.map, norm(lk.map) + (t ? "#" + t : "")), heading };
            const e = cands.find((c) => c.key === from.key) || cands[0];
            if (t == null) return { id: idOf(e, e.root), ambiguous: cands.length > 1, heading };
            const hit = (e.topics.get(t) || [])[0];
            return hit ? { id: idOf(e, hit), ambiguous: cands.length > 1, heading } : { id: ghost(`${lk.map}#${lk.topic}`, norm(lk.map) + "#" + t), heading };
          }
          const own = (from.topics.get(t) || [])[0];
          if (own) return { id: idOf(from, own), heading };
          const asMap = (mapIndex.get(t) || []).filter((c) => c.key !== from.key);
          const others = [];
          for (const e of [...entries].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))) {
            if (e.key === from.key) continue;
            const hit = (e.topics.get(t) || [])[0];
            if (hit) others.push(idOf(e, hit));
          }
          for (const e of asMap) {
            const id = idOf(e, e.root);
            if (!others.includes(id)) others.push(id);
          }
          if (others.length) return { id: others[0], ambiguous: others.length > 1, heading };
          return { id: ghost(lk.topic, t), heading };
        };
        for (const e of entries) {
          walkAll(e.map, (n, level, parent) => {
            const me = idOf(e, n);
            if (hierarchy && parent) link(idOf(e, parent), me, "hierarchy");
            for (const text of [n.title, n.notes]) {
              for (const lk of parseLinks(text)) {
                const r = resolve(lk, e);
                link(me, r.id, "link", { ...r.ambiguous ? { ambiguous: true } : {}, ...lk.alias ? { alias: lk.alias } : {} });
              }
            }
          });
          for (const r of e.map.meta.relations || []) {
            const a = e.map.find(r.from), b = e.map.find(r.to);
            if (a && b) link(idOf(e, a.node), idOf(e, b.node), "relation", { label: r.label || "" });
          }
        }
        for (const ed of edges) {
          if (ed.type === "hierarchy") continue;
          byId.get(ed.from).deg++;
          byId.get(ed.to).deg++;
        }
        for (const g of nodes) g.weight = (g.childCount || 0) + (g.hasNote ? 1 : 0) + g.deg;
        computeWeights(nodes, edges);
        const out = /* @__PURE__ */ new Map(), inn = /* @__PURE__ */ new Map();
        for (const ed of edges) {
          if (!out.has(ed.from)) out.set(ed.from, []);
          out.get(ed.from).push(ed);
          if (!inn.has(ed.to)) inn.set(ed.to, []);
          inn.get(ed.to).push(ed);
        }
        return {
          nodes,
          edges,
          byId,
          outgoing: (id) => (out.get(id) || []).filter((x) => x.type !== "hierarchy"),
          incoming: (id) => (inn.get(id) || []).filter((x) => x.type !== "hierarchy"),
          idOf: (mapKey, topicId) => `${mapKey}::${topicId}`,
          /** Resolve um link escrito no mapa `fromKey` com o mesmo critério do grafo (usado pelo exportador do Obsidian). */
          resolveLink: (lk, fromKey) => {
            const e = entries.find((x) => x.key === fromKey);
            return e ? resolve(lk, e) : null;
          }
        };
      }
      function neighborhood(g, id, depth = 1) {
        if (!g.byId.has(id)) return { nodes: [], edges: [] };
        const adj = /* @__PURE__ */ new Map();
        for (const e of g.edges) {
          if (!adj.has(e.from)) adj.set(e.from, []);
          adj.get(e.from).push(e.to);
          if (!adj.has(e.to)) adj.set(e.to, []);
          adj.get(e.to).push(e.from);
        }
        const seen = /* @__PURE__ */ new Map([[id, 0]]);
        let front = [id];
        for (let d = 1; d <= depth; d++) {
          const next = [];
          for (const x of front) for (const y of adj.get(x) || []) if (!seen.has(y)) {
            seen.set(y, d);
            next.push(y);
          }
          front = next;
        }
        return { nodes: g.nodes.filter((n) => seen.has(n.id)), edges: g.edges.filter((e) => seen.has(e.from) && seen.has(e.to)), distance: seen };
      }
      module.exports = { buildGraph, neighborhood, computeWeights };
    }
  });

  // ../core/components/mentions.js
  var require_mentions = __commonJS({
    "../core/components/mentions.js"(exports, module) {
      "use strict";
      var { norm, parseLinks, rewriteLinks } = require_links();
      var { buildGraph } = require_graph();
      var words = (s) => ` ${norm(s).replace(/[^\p{L}\p{N}]+/gu, " ").trim()} `;
      function unlinkedMentions(maps, fromKey, node, { minLen = 4, limit = 20 } = {}) {
        const g = buildGraph(maps);
        const me = g.idOf(fromKey, node.id);
        const linked = new Set(g.outgoing(me).map((e) => e.to));
        const text = words(`${node.title}
${rewriteLinks(node.notes || "", () => " ")}`.replace(/\[\[[^\]]*\]\]/g, " "));
        const out = [], seenTitles = /* @__PURE__ */ new Set();
        for (const n of g.nodes) {
          if (n.kind !== "topic" || n.id === me || linked.has(n.id)) continue;
          const w = words(n.title);
          if (w.trim().length < minLen) continue;
          if (text.includes(w) && !seenTitles.has(w + "|" + n.mapKey)) {
            seenTitles.add(w + "|" + n.mapKey);
            out.push({ id: n.id, mapKey: n.mapKey, topicId: n.topicId, title: n.title, mapName: n.mapName });
            if (out.length >= limit) break;
          }
        }
        return out;
      }
      function linkify(text, title, { target } = {}) {
        const src = String(text ?? "");
        const t = norm(title).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
        if (!t) return null;
        let n = "";
        const map = [];
        let i = 0;
        for (const ch of src) {
          const f = ch.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^\p{L}\p{N}]/gu, " ");
          for (let k = 0; k < f.length; k++) {
            n += f[k];
            map.push(i);
          }
          i += ch.length;
        }
        const blocked = [];
        for (const m of src.matchAll(/\[\[[^\]]*\]\]|```[\s\S]*?```|`[^`\n]*`/g)) blocked.push([m.index, m.index + m[0].length]);
        const re = new RegExp(`(?<![\\p{L}\\p{N}])${t.split(" ").map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[ ]+")}(?![\\p{L}\\p{N}])`, "gu");
        for (const m of n.matchAll(re)) {
          let start = map[m.index], end = map[m.index + m[0].length - 1] + 1;
          const lead = (String(title).trim().match(/^[^\p{L}\p{N}]+/u) || [""])[0], trail = (String(title).trim().match(/[^\p{L}\p{N}]+$/u) || [""])[0];
          if (lead && src.slice(Math.max(0, start - lead.length), start) === lead) start -= lead.length;
          if (trail && src.slice(end, end + trail.length) === trail) end += trail.length;
          if (blocked.some(([a, b]) => start < b && end > a)) continue;
          const original = src.slice(start, end);
          const label = target ? `[[${target}|${original}]]` : `[[${original}]]`;
          return src.slice(0, start) + label + src.slice(end);
        }
        return null;
      }
      module.exports = { unlinkedMentions, linkify, parseLinks };
    }
  });

  // ../core/components/shapes.js
  var require_shapes = __commonJS({
    "../core/components/shapes.js"(exports, module) {
      "use strict";
      var N = 64;
      var TOL = { line: 0.03, closeGap: 0.08, ellipse: 0.04, minLen: 40 };
      var CORNER_TURN = 50;
      var RIGHT = [70, 110];
      var dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
      function pathLength(pts) {
        let L = 0;
        for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1], pts[i]);
        return L;
      }
      function resample(pts, n = N) {
        const L = pathLength(pts);
        if (L === 0) return pts.slice(0, 1);
        const step = L / (n - 1), out = [{ ...pts[0] }];
        let acc = 0, i = 1, prev = pts[0];
        while (out.length < n - 1 && i < pts.length) {
          const d = dist(prev, pts[i]);
          if (acc + d >= step) {
            const t = (step - acc) / d;
            const q = { x: prev.x + (pts[i].x - prev.x) * t, y: prev.y + (pts[i].y - prev.y) * t };
            out.push(q);
            prev = q;
            acc = 0;
          } else {
            acc += d;
            prev = pts[i];
            i++;
          }
        }
        out.push({ ...pts[pts.length - 1] });
        return out;
      }
      function maxLineDev(pts, a, b) {
        const L = dist(a, b) || 1e-9;
        let m = 0;
        for (const p of pts) {
          const d = Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / L;
          if (d > m) m = d;
        }
        return m;
      }
      function turnAngle(v1, v2) {
        const dot = v1.x * v2.x + v1.y * v2.y;
        const m = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
        if (m === 0) return 0;
        return Math.acos(Math.max(-1, Math.min(1, dot / m))) * 180 / Math.PI;
      }
      function findCorners(p, w = 4, closed = false) {
        const n = p.length;
        const q = closed ? [...p.slice(n - w), ...p, ...p.slice(0, w)] : p;
        const off = closed ? w : 0;
        const turns = [];
        for (let i = w; i < q.length - w; i++) {
          const v1 = { x: q[i].x - q[i - w].x, y: q[i].y - q[i - w].y };
          const v2 = { x: q[i + w].x - q[i].x, y: q[i + w].y - q[i].y };
          turns.push({ i: i - off, t: turnAngle(v1, v2) });
        }
        const corners = [];
        for (let k = 0; k < turns.length; k++) {
          const { i, t } = turns[k];
          if (t < CORNER_TURN) continue;
          const near = turns.filter((o) => Math.abs(o.i - i) <= w);
          if (near.every((o) => o.t <= t)) {
            if (!corners.length || i - corners[corners.length - 1].i > w) corners.push({ i: (i % n + n) % n, t });
          }
        }
        if (closed && corners.length > 1) {
          const a = corners[0], b = corners[corners.length - 1];
          const gap = Math.min(Math.abs(a.i - b.i), n - Math.abs(a.i - b.i));
          if (gap <= w) {
            if (b.t > a.t) corners[0] = b;
            corners.pop();
          }
        }
        return corners;
      }
      function ellipseFit(p, L) {
        const xs = p.map((q) => q.x), ys = p.map((q) => q.y);
        const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
        const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2, ry = (y1 - y0) / 2;
        if (rx < 1 || ry < 1) return null;
        let err = 0;
        for (const q of p) {
          const r = Math.sqrt(((q.x - cx) / rx) ** 2 + ((q.y - cy) / ry) ** 2);
          err += Math.abs(r - 1) * Math.min(rx, ry);
        }
        err /= p.length;
        return err <= TOL.ellipse * L ? { kind: "ellipse", cx, cy, rx, ry } : null;
      }
      function classifyStroke(pts) {
        if (!Array.isArray(pts) || pts.length < 6) return null;
        const L = pathLength(pts);
        if (L < TOL.minLen) return null;
        const p = resample(pts);
        const a = p[0], b = p[p.length - 1];
        const closed = dist(a, b) <= TOL.closeGap * L;
        if (!closed && maxLineDev(p, a, b) <= TOL.line * L) {
          return { kind: "line", pts: [a, b] };
        }
        const corners = findCorners(p, 4, closed);
        const turns = corners.map((c) => c.t);
        const allRight = corners.length > 0 && turns.every((t) => t >= RIGHT[0] && t <= RIGHT[1]);
        if (closed) {
          if (corners.length === 4 && allRight) {
            const vs = corners.map((c) => p[c.i]);
            const x0 = Math.min(...vs.map((v) => v.x)), x1 = Math.max(...vs.map((v) => v.x));
            const y0 = Math.min(...vs.map((v) => v.y)), y1 = Math.max(...vs.map((v) => v.y));
            return { kind: "rect", x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
          }
          if (corners.length === 0) return ellipseFit(p, L);
          return null;
        }
        if (allRight && corners.length <= 5) {
          const vertices = [a, ...corners.map((c) => p[c.i]), b];
          return { kind: "poly", pts: vertices };
        }
        return null;
      }
      module.exports = { classifyStroke, resample, pathLength, findCorners, TOL };
    }
  });

  // ../core/utils/text.js
  var require_text = __commonJS({
    "../core/utils/text.js"(exports, module) {
      "use strict";
      var HTML_ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      function escapeHtml(s) {
        return String(s ?? "").replace(/[&<>"']/g, (c) => HTML_ESC[c]);
      }
      module.exports = { escapeHtml };
    }
  });

  // ../core/components/svg.js
  var require_svg = __commonJS({
    "../core/components/svg.js"(exports, module) {
      "use strict";
      var { layoutMap, edgePoints } = require_layout();
      var { MARKERS } = require_markers();
      var { logoSize, logoVariant, logoMarkup } = require_logo();
      var { contrast, luminance, onCanvas, MIN_GRAPHIC, MIN_TEXT } = require_contrast();
      var { escapeHtml: esc } = require_text();
      var REL_COLOR = "#e5484d";
      function edgePath(e, curve) {
        const { a, b, dir } = edgePoints(e);
        if (curve === "elbow") {
          const mx = a.x + (b.x - a.x) / 2;
          return `M${a.x},${a.y} L${mx},${a.y} L${mx},${b.y} L${b.x},${b.y}`;
        }
        const dx = Math.abs(b.x - a.x) * 0.5 * dir;
        return `M${a.x},${a.y} C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`;
      }
      function textAlign(b, s) {
        if (s.align && s.align !== "auto") return s.align;
        if (b.level === 0) return "center";
        return b.side < 0 ? "right" : "left";
      }
      var SKETCH_DEFS = '<defs><filter id="mc-sketch" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" xChannelSelector="R" yChannelSelector="G"/></filter></defs>';
      function renderGroup(L, { selectedId, selectedIds, selectedRel, interactive, hits, logo, canvas } = {}) {
        const { theme } = L;
        const out = [];
        if (theme.sketch) out.push(SKETCH_DEFS);
        for (const e of L.edges) {
          const w = e.to.style.edgeWidth || theme.line.width[Math.min(e.to.level - 1, theme.line.width.length - 1)];
          out.push(`<path d="${edgePath(e, theme.line.curve)}" fill="none" stroke="${canvas ? onCanvas(e.to.style.edge || e.to.branch, canvas, MIN_GRAPHIC) : e.to.style.edge || e.to.branch}" stroke-width="${w}" stroke-linecap="round"/>`);
        }
        for (const { rel, geo } of L.relations) {
          const col0 = /^#[0-9a-fA-F]{6}$/.test(rel.color || "") ? rel.color : REL_COLOR;
          const col = canvas ? onCanvas(col0, canvas, MIN_GRAPHIC) : col0, sel = selectedRel === rel.id;
          const d = `M${geo.a.x},${geo.a.y} Q${geo.c.x},${geo.c.y} ${geo.b.x},${geo.b.y}`;
          const ar = geo.arrow.map((p) => `${p.x},${p.y}`).join(" ");
          out.push(`<g${interactive ? ` data-rel="${esc(rel.id)}" class="rel"` : ""}>` + (interactive ? `<path d="${d}" fill="none" stroke="transparent" stroke-width="14"/>` : "") + `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sel ? 3.5 : 2}" stroke-dasharray="7 5" stroke-linecap="round"/><polygon points="${ar}" fill="${col}"/>` + (rel.label ? `<text x="${geo.label.x}" y="${geo.label.y - 6}" text-anchor="middle" font-size="12" font-style="italic" fill="${col}" stroke="${canvas || theme.background}" stroke-width="4" paint-order="stroke">${esc(rel.label)}</text>` : "") + "</g>");
        }
        for (const b of L.boxes.values()) {
          const s = b.style, n = b.node;
          const onCanvasText = canvas && (s.shape === "underline" || s.shape === "none" && (!s.fill || s.fill === "none"));
          const textColor = onCanvasText && luminance(canvas) < 0.5 ? "#ffffff" : s.color;
          const ink = onCanvasText ? onCanvas(textColor, canvas, MIN_TEXT) : s.color;
          const rim = canvas && !s.stroke && /^#[0-9a-fA-F]{6}$/.test(s.fill || "") && contrast(s.fill, canvas) < MIN_GRAPHIC ? ` stroke="${onCanvas("#9aa3b5", canvas, MIN_GRAPHIC)}" stroke-width="1.5"` : "";
          const tx = b.x + b.markerW + (b.w - b.markerW) / 2;
          let shape = "";
          if (s.shape === "underline") {
            shape = `<line x1="${b.x}" y1="${b.y + b.h}" x2="${b.x + b.w}" y2="${b.y + b.h}" stroke="${canvas ? onCanvas(s.stroke || b.branch, canvas, MIN_GRAPHIC) : s.stroke || b.branch}" stroke-width="${s.strokeWidth || 2}"/>`;
          } else if (s.shape === "none") {
            shape = s.fill && s.fill !== "none" ? `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${s.fill}"/>` : "";
          } else if (s.shape === "ellipse") {
            shape = `<ellipse cx="${b.x + b.w / 2}" cy="${b.y + b.h / 2}" rx="${b.w / 2}" ry="${b.h / 2}" fill="${s.fill}"${s.stroke ? ` stroke="${s.stroke}" stroke-width="${s.strokeWidth}"` : rim}/>`;
          } else {
            const r = s.shape === "pill" ? Math.min(b.h / 2, 8) : s.shape === "round" ? 5 : 2;
            shape = `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${r}" fill="${s.fill}"${s.stroke ? ` stroke="${s.stroke}" stroke-width="${s.strokeWidth}"` : rim}/>`;
          }
          if (logo && b.level === 0) {
            const ls = logoSize(s.size);
            const variant = logoVariant({ fill: s.fill, mono: !!theme.sketch });
            shape += logoMarkup({ x: b.x + s.padX * 0.7, y: b.y + b.h / 2 - ls.h / 2, fontSize: s.size, variant, color: s.color });
          }
          const startY = b.y + b.h / 2 - (b.lines.length - 1) * b.lineHeight / 2;
          const align = textAlign(b, s);
          const txA = align === "left" ? b.x + s.padX * 0.7 + b.markerW : align === "right" ? b.x + b.w - s.padX : tx;
          const anchor = align === "left" ? "start" : align === "right" ? "end" : "middle";
          const text = b.lines.map((l, i) => `<text x="${txA}" y="${startY + i * b.lineHeight}" text-anchor="${anchor}" dominant-baseline="central" fill="${ink}" font-size="${s.size}"${s.font ? ` font-family="${esc(`'${s.font}', ${theme.font}`)}"` : ""} font-weight="${s.bold ? 700 : 400}"${s.italic ? ' font-style="italic"' : ""}>${esc(l)}</text>`).join("");
          const markers = b.markers.map((m, i) => {
            const d = b.markerD, cx = b.x + s.padX * 0.7 + (b.logoW || 0) + d / 2 + i * (d + 4), cy = b.y + b.h / 2;
            return `<circle cx="${cx}" cy="${cy}" r="${d / 2}" fill="${MARKERS[m].color}"/><text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="${d * 0.62}" font-weight="700">${MARKERS[m].glyph}</text>`;
          }).join("");
          const progress = b.progress != null ? `<rect x="${b.x}" y="${b.y + b.h + 4}" width="${b.w}" height="4" rx="2" fill="#8a94a633"/><rect x="${b.x}" y="${b.y + b.h + 4}" width="${b.w * b.progress / 100}" height="4" rx="2" fill="${b.progressAuto ? "#4c9aff" : "#43a047"}"/>` : "";
          const hit = hits && hits.has(b.id) ? `<rect x="${b.x - 6}" y="${b.y - 6}" width="${b.w + 12}" height="${b.h + 12}" rx="12" fill="#ffeb3b55" stroke="#fbc02d" stroke-width="2"/>` : "";
          const sel = (selectedIds ? selectedIds.has(b.id) : selectedId === b.id) ? `<rect x="${b.x - 4}" y="${b.y - 4}" width="${b.w + 8}" height="${b.h + 8}" rx="10" fill="none" stroke="#ff9800" stroke-width="2.5" stroke-dasharray="5 3"/>` : "";
          const fx = b.side > 0 ? b.x + b.w + 10 : b.x - 10;
          const foldAttr = interactive ? ` data-fold="${esc(b.id)}" style="pointer-events:all;cursor:pointer"` : "";
          const hasKids = n.children.length > 0;
          const fold = hasKids && (interactive || n.collapsed) ? `<g class="fold-badge${n.collapsed ? " collapsed" : ""}"${foldAttr}><title>${n.collapsed ? `Clique para expandir (${n.children.length} subt\xF3picos)` : "Clique para recolher os subt\xF3picos"}</title><circle cx="${fx}" cy="${b.y + b.h / 2}" r="11" fill="${b.branch}"/><text x="${fx}" y="${b.y + b.h / 2}" text-anchor="middle" dominant-baseline="central" fill="#fff" font-size="${n.collapsed ? 11 : 15}" font-weight="700" pointer-events="none">${n.collapsed ? n.children.length : "\u2212"}</text></g>` : "";
          const noteTip = interactive ? "<title>Nota do t\xF3pico: clique para ver ou editar</title>" : "";
          const note = n.notes ? `<g class="note-icon"${interactive ? ' style="cursor:pointer"' : ""} transform="translate(${b.x + b.w - 8} ${b.y - 13})"><rect width="9" height="11" rx="1.7" fill="${theme.background}" stroke="${s.branch}" stroke-width="1.3"/><path d="M2.3 3.5h4.4M2.3 5.6h4.4M2.3 7.7h2.7" stroke="${s.branch}" stroke-width="1" stroke-linecap="round" fill="none"/>${noteTip}</g>` : "";
          out.push(`<g${interactive ? ` data-id="${esc(b.id)}" class="node"` : ""}>${hit}${shape}<g pointer-events="none">${progress}${markers}${text}${sel}${fold}</g>${note}${interactive ? `<rect class="hitarea" x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="transparent" pointer-events="all"/>` : ""}</g>`);
        }
        return theme.sketch ? '<g filter="url(#mc-sketch)">' + out.join("\n") + "</g>" : out.join("\n");
      }
      function toSVG(map, opts = {}) {
        const L = layoutMap(map, opts);
        const { x, y, w, h } = L.bounds;
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(w)}" height="${Math.ceil(h)}" viewBox="${x} ${y} ${w} ${h}" font-family="${esc(L.theme.font)}">
<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${L.theme.background}"/>
${renderGroup(L, { logo: true })}
</svg>`;
      }
      module.exports = { toSVG, renderGroup };
    }
  });

  // ../core/formats/drawio.js
  var require_drawio = __commonJS({
    "../core/formats/drawio.js"(exports, module) {
      "use strict";
      var { layoutFlow } = require_flow_layout();
      var { escapeHtml } = require_text();
      var STYLE = {
        start: "ellipse;whiteSpace=wrap;html=1;arcSize=50;fillColor=#d5e8d4;strokeColor=#82b366;",
        end: "ellipse;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#b85450;",
        step: "rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;",
        decision: "rhombus;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6b656;"
      };
      var EDGE = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;endArrow=block;";
      var EDGE_ALT = EDGE + "dashed=1;";
      var attr = (s) => escapeHtml(String(s == null ? "" : s)).replace(/\n/g, "&#10;");
      function toDrawio(map) {
        const { boxes, edges, relations } = layoutFlow(map);
        const cid = (id) => "n_" + String(id).replace(/[^A-Za-z0-9_-]/g, "_");
        const cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>'];
        for (const b of boxes.values()) {
          cells.push(`<mxCell id="${cid(b.id)}" value="${attr(b.title)}" style="${STYLE[b.type] || STYLE.step}" vertex="1" parent="1"><mxGeometry x="${Math.round(b.x)}" y="${Math.round(b.y)}" width="${Math.round(b.w)}" height="${Math.round(b.h)}" as="geometry"/></mxCell>`);
        }
        const edge = (id, e, style) => `<mxCell id="${id}" value="${attr(e.label)}" style="${style}" edge="1" parent="1" source="${cid(e.from)}" target="${cid(e.to)}"><mxGeometry relative="1" as="geometry"/></mxCell>`;
        edges.forEach((e, i) => cells.push(edge(`e_${i}`, e, EDGE)));
        relations.forEach((r, i) => cells.push(edge(`r_${i}`, r, EDGE_ALT)));
        const name = attr(map.meta.name || map.root.title || "Fluxograma");
        return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="MindCraft"><diagram id="mindcraft-flow" name="${name}"><mxGraphModel dx="1000" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0"><root>${cells.join("")}</root></mxGraphModel></diagram></mxfile>
`;
      }
      module.exports = { toDrawio };
    }
  });

  // ../core/formats/print-style.js
  var require_print_style = __commonJS({
    "../core/formats/print-style.js"(exports, module) {
      "use strict";
      var BASE = `
    @page { size: A4; margin: 15mm 14mm; }
    * { box-sizing: border-box; }
    body { font-family: "Segoe UI", Arial, Helvetica, sans-serif; color: #161616; font-size: 10pt; line-height: 1.35; margin: 0; }
    h1 { font-size: 16pt; font-weight: 700; margin: 0 0 1mm; line-height: 1.2; }
    h2 { font-size: 12pt; font-weight: 700; margin: 4mm 0 1.5mm; padding-bottom: 0.8mm; border-bottom: 0.6pt solid #999; break-after: avoid; }
    h3 { font-size: 10.5pt; font-weight: 600; margin: 2.5mm 0 0.8mm; break-after: avoid; line-height: 1.25; }
    h4, h5, h6 { font-size: 10pt; font-weight: 600; margin: 2mm 0 0.6mm; break-after: avoid; }
    .sub { color: #555; font-size: 9pt; margin: 0 0 3mm; }
    .num { color: #555; font-weight: 600; margin-right: 1mm; }
    /* peso do t\xEDtulo pela prioridade do passo/t\xF3pico: p1 \xE9 o mais pesado */
    .w3 > h2, .w3 > h3, .w3 > h4 { font-weight: 700; }
    .w2 > h2, .w2 > h3, .w2 > h4 { font-weight: 600; }
    .w1 > h2, .w1 > h3, .w1 > h4 { font-weight: 500; }
    .pri { color: #fff; font-size: 9pt; font-weight: 700; padding: 0 1.5mm; border-radius: 2mm; vertical-align: 0.1mm; margin-left: 1mm; }
    .meta, .src, .links, .ai-note, code, .notes, .notes table { font-size: 9pt; }
    .meta { color: #555; margin: 0 0 0.4mm; }
    .src { color: #333; font-style: italic; margin: 0.6mm 0; }
    .links { margin: 0.6mm 0; padding-left: 4mm; }
    .links li { margin: 0; }
    /* notas: texto de 9 pt, recuo fixo pela borda da esquerda (sem caixa colorida) */
    .notes { border-left: 1pt solid #bbb; padding: 0 0 0 2.5mm; margin: 0.8mm 0 1.6mm; }
    .notes p { margin: 0 0 1.2mm; }
    .notes h1, .notes h2, .notes h3, .notes h4, .notes h5, .notes h6 { font-size: 9pt; font-weight: 700; margin: 1mm 0 0.4mm; border: 0; padding: 0; break-after: avoid; }
    /* listas: um recuo s\xF3, e os n\xEDveis seguintes n\xE3o empurram mais o texto (evita a escada de tabula\xE7\xE3o) */
    .notes ul, .notes ol { margin: 0 0 1mm; padding-left: 4mm; }
    .notes ul ul, .notes ul ol, .notes ol ul, .notes ol ol { margin: 0; padding-left: 2.5mm; }
    .notes ul ul ul, .notes ul ol ol, .notes ol ul ul, .notes ol ol ol { padding-left: 0; }
    .notes li { margin: 0 0 0.4mm; }
    .notes blockquote { margin: 0.8mm 0; padding-left: 2mm; border-left: 0.8pt solid #aaa; color: #333; }
    .notes table { border-collapse: collapse; margin: 0.8mm 0; }
    .notes th, .notes td { border: 0.5pt solid #bbb; padding: 0.4mm 1.2mm; text-align: left; }
    .notes pre { margin: 0.8mm 0; white-space: pre-wrap; word-break: break-word; }
    .notes img { max-width: 100%; height: auto; }
    .notes.ai { border-left-color: #1e63c6; }
    .ai-note { color: #1e63c6; font-style: italic; margin: 0 0 0.8mm; }
    code, .notes code { font-family: Consolas, "Courier New", monospace; }
    .cols { column-count: 2; column-gap: 7mm; column-fill: auto; }
    .step, .topic { break-inside: avoid-column; }
`;
      function printCss(extra = "") {
        return BASE + extra;
      }
      var weightClass = (priority) => ({ p1: "w3", p2: "w2", p3: "w1" })[priority] || "w0";
      module.exports = { printCss, weightClass };
    }
  });

  // ../core/formats/flow-export.js
  var require_flow_export = __commonJS({
    "../core/formats/flow-export.js"(exports, module) {
      "use strict";
      var { findStarts, successors, validateFlow, listPaths, typeOf, FLOW_LABELS } = require_flow();
      var { layoutFlow } = require_flow_layout();
      var { escapeHtml: esc } = require_text();
      var { printCss } = require_print_style();
      function toFlowMarkdown(map, opts = {}) {
        const withNotes = opts.notes !== false;
        const generated = opts.generated || /* @__PURE__ */ new Map();
        const titleOf = /* @__PURE__ */ new Map();
        map.walk((n) => titleOf.set(n.id, n.title || "Sem t\xEDtulo"));
        const out = [];
        const starts = findStarts(map);
        const { paths, truncated } = listPaths(map);
        out.push(`# ${map.meta.name || map.root.title}`, "", `Fluxograma \xB7 ${titleOf.size} passo(s) \xB7 ${paths.length}${truncated ? "+" : ""} caminho(s)`, "");
        out.push("## Passos", "");
        const visit = (n, num, depth) => {
          const head = `${"#".repeat(Math.min(depth + 2, 6))} ${num} ${n.title || "Sem t\xEDtulo"} \xB7 ${FLOW_LABELS[typeOf(n)]}`;
          out.push(head, "");
          if (n.branchLabel) out.push(`*Ramo: ${n.branchLabel}*`, "");
          if (withNotes && (n.notes || "").trim()) out.push(n.notes.trim(), "");
          else if (withNotes && generated.get(n.id)) {
            out.push("*Texto de revis\xE3o gerado pela IA (revise antes de usar):*", "");
            for (const p of generated.get(n.id)) out.push(p, "");
          }
          n.children.forEach((c, i) => visit(c, `${num}.${i + 1}`, depth + 1));
        };
        for (const s of starts) visit(s, "1", 0);
        const links = [];
        map.walk((n) => {
          for (const e of successors(map, n.id)) {
            const to = titleOf.get(e.to) || "(passo removido)";
            const via = e.label ? ` (${e.label})` : "";
            links.push(`- **${titleOf.get(n.id)}** \u2192 ${to}${via}${e.kind === "rel" ? " \u2014 seta extra" : ""}`);
          }
        });
        if (links.length) out.push("## Liga\xE7\xF5es", "", ...links, "");
        out.push("## Caminhos poss\xEDveis", "");
        if (!paths.length) out.push("Nenhum caminho do in\xEDcio ao fim. Veja os pontos de aten\xE7\xE3o.", "");
        paths.forEach((p, i) => {
          const parts = p.map((step, k) => {
            const name = titleOf.get(step.id) || "(passo removido)";
            if (k === 0) return name;
            const via = step.via ? `\u2014(${step.via})\u2192` : "\u2192";
            return `${via} ${name}${step.loopTo ? " \u21BA" : ""}`;
          });
          out.push(`${i + 1}. ${parts.join(" ")}`);
        });
        if (truncated) out.push("", `_Lista cortada: o fluxo tem mais caminhos do que o limite de ${paths.length}._`);
        out.push("");
        const warn = validateFlow(map);
        if (warn.length) {
          out.push("## Pontos de aten\xE7\xE3o", "");
          for (const w of warn) out.push(`- ${w.level === "error" ? "Erro" : "Aviso"}: ${w.message}`);
          out.push("");
        }
        return out.join("\n");
      }
      var SHAPE_FILL = { start: ["#2e7d4f", "#ffffff"], end: ["#2e7d4f", "#ffffff"], decision: ["#fff1c2", "#3a2a00"], step: ["#ffffff", "#1c1c1c"] };
      function diagramSvg(map) {
        const L = layoutFlow(map);
        const b = L.bounds, pad = 20, shapes = [];
        for (const e of L.edges) {
          const a = L.boxes.get(e.from), c = L.boxes.get(e.to);
          const x1 = a.x + a.w / 2, y1 = a.y + a.h, x2 = c.x + c.w / 2, y2 = c.y, my = (y1 + y2) / 2;
          shapes.push(`<path d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" fill="none" stroke="#555" stroke-width="1.6" marker-end="url(#fa)"/>`);
          if (e.label) shapes.push(`<text x="${(x1 + x2) / 2}" y="${my}" font-size="12" text-anchor="middle" dominant-baseline="central" fill="#222">${esc(e.label)}</text>`);
        }
        for (const r of L.relations) {
          const a = L.boxes.get(r.from), c = L.boxes.get(r.to);
          const x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = c.x + c.w, y2 = c.y + c.h / 2, cx = Math.max(x1, x2) + 90;
          shapes.push(`<path d="M${x1},${y1} C${cx},${y1} ${cx},${y2} ${x2},${y2}" fill="none" stroke="#1e63c6" stroke-width="1.5" stroke-dasharray="6 4" marker-end="url(#fa)"/>`);
          if (r.label) shapes.push(`<text x="${cx - 4}" y="${(y1 + y2) / 2}" font-size="12" text-anchor="middle" fill="#1e63c6">${esc(r.label)}</text>`);
        }
        for (const bx of L.boxes.values()) {
          const cx = bx.x + bx.w / 2, cy = bx.y + bx.h / 2, [fill, ink] = SHAPE_FILL[bx.type] || SHAPE_FILL.step;
          const pill = bx.type === "start" || bx.type === "end";
          const stroke = pill ? "#2e7d4f" : "#666";
          shapes.push(bx.type === "decision" ? `<polygon points="${cx},${bx.y} ${bx.x + bx.w},${cy} ${cx},${bx.y + bx.h} ${bx.x},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>` : `<rect x="${bx.x}" y="${bx.y}" width="${bx.w}" height="${bx.h}" rx="${pill ? bx.h / 2 : 10}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>`);
          const top = cy - (bx.lines.length - 1) * bx.lineHeight / 2;
          bx.lines.forEach((l, i) => shapes.push(`<text x="${cx}" y="${top + i * bx.lineHeight}" font-size="13" text-anchor="middle" dominant-baseline="central" fill="${ink}">${esc(l)}</text>`));
        }
        return `<svg class="diagram" viewBox="${b.x - pad} ${b.y - pad} ${b.w + pad * 2} ${b.h + pad * 2}" xmlns="http://www.w3.org/2000/svg" font-family="Arial, sans-serif"><defs><marker id="fa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#555"/></marker></defs>${shapes.join("")}</svg>`;
      }
      function toFlowHtml(map, opts = {}) {
        const withNotes = opts.notes !== false;
        const generated = opts.generated || /* @__PURE__ */ new Map();
        const names = /* @__PURE__ */ new Map();
        map.walk((n) => names.set(n.id, n.title || "Sem t\xEDtulo"));
        const items = [];
        const visit = (n, num, depth) => {
          const body = [];
          if (n.branchLabel) body.push(`<p class="meta">Ramo: ${esc(n.branchLabel)}</p>`);
          if (withNotes && (n.notes || "").trim()) body.push(`<div class="notes">${esc(n.notes.trim()).replace(/\n/g, "<br>")}</div>`);
          else if (withNotes && generated.get(n.id)) body.push(`<div class="notes ai"><p class="ai-note">Texto de revis\xE3o gerado pela IA (revise antes de usar)</p>${generated.get(n.id).map((p) => `<p>${esc(p)}</p>`).join("")}</div>`);
          items.push(`<section class="step d${Math.min(depth, 5)}"><h3><span class="num">${esc(num)}</span> ${esc(n.title || "Sem t\xEDtulo")} <small>${esc(FLOW_LABELS[typeOf(n)])}</small></h3>${body.join("")}</section>`);
          n.children.forEach((c, i) => visit(c, `${num}.${i + 1}`, depth + 1));
        };
        for (const st of findStarts(map)) visit(st, "1", 0);
        const { paths, truncated } = listPaths(map);
        const pathItems = paths.map((p) => `<li>${esc(p.map((s, k) => k === 0 ? names.get(s.id) || "" : `${s.via ? `\u2014(${s.via})\u2192` : "\u2192"} ${names.get(s.id) || ""}${s.loopTo ? " \u21BA" : ""}`).join(" "))}</li>`).join("");
        const warn = validateFlow(map);
        return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(map.meta.name || map.root.title)}</title><style>${printCss(`
    .diagram { width: 100%; height: auto; max-height: 200mm; break-inside: avoid; }
    .step { margin: 0 0 2mm; }
    h3 small { color: #666; font-weight: normal; font-size: 9pt; }
    .paths { font-size: 9pt; } .warn { font-size: 9pt; color: #6a4b00; }
`)}</style></head><body>
    <h1>${esc(map.meta.name || map.root.title)}</h1><p class="sub">Fluxograma \xB7 ${names.size} passo(s) \xB7 ${paths.length}${truncated ? "+" : ""} caminho(s)</p>
    <h2>Diagrama</h2>${diagramSvg(map)}
    <h2>Passos</h2><div class="cols">${items.join("")}</div>
    <h2>Caminhos poss\xEDveis</h2><ol class="paths">${pathItems || "<li>Nenhum caminho do in\xEDcio ao fim.</li>"}</ol>
    ${truncated ? `<p class="warn">Lista cortada: o fluxo tem mais caminhos do que o limite de ${paths.length}.</p>` : ""}
    ${warn.length ? `<h2>Pontos de aten\xE7\xE3o</h2><ul class="warn">${warn.map((w) => `<li>${w.level === "error" ? "Erro" : "Aviso"}: ${esc(w.message)}</li>`).join("")}</ul>` : ""}
  </body></html>`;
      }
      module.exports = { toFlowMarkdown, toFlowHtml };
    }
  });

  // ../core/formats/markdown.js
  var require_markdown = __commonJS({
    "../core/formats/markdown.js"(exports, module) {
      "use strict";
      var { rewriteLinks, plainLinks } = require_links();
      var { escapeHtml: esc } = require_text();
      var SAFE_URL = /^(https?:\/\/|mailto:)[^\s<>"']+$/i;
      var FENCE = /^\s{0,3}(```|~~~)/;
      var LIST = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;
      var TASK = /^\[( |x|X)\]\s+(.*)$/;
      var TASK_LINE = /^(\s*(?:[-*+]|\d{1,9}[.)])\s+)\[( |x|X)\](\s)/;
      var HR = /^\s{0,3}([-*_])(\s*\1){2,}\s*$/;
      var TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
      var MAX_CHARS = 2e5;
      function inline(src) {
        const stash = [];
        const hold = (html) => {
          stash.push(html);
          return `\0${stash.length - 1}\0`;
        };
        let s = String(src).replace(/\u0000/g, "");
        s = s.replace(/(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/g, (_m, _t, code) => hold(`<code>${esc(code.trim())}</code>`));
        s = rewriteLinks(s, (lk) => hold(`<a href="#" class="wl" data-map="${esc(lk.map || "")}" data-topic="${esc(lk.topic == null ? "" : lk.topic)}">${esc(lk.alias || lk.topic || lk.map)}</a>`));
        s = s.replace(/!?\[([^\]\n]*)\]\(([^)\s]*)\)/g, (m, text, url) => {
          if (m.startsWith("!")) return hold(esc(text));
          return SAFE_URL.test(url) ? hold(`<a href="#" class="ext" data-url="${esc(url)}" title="${esc(url)}">${esc(text || url)}</a>`) : hold(esc(text) + ` (${esc(url)})`);
        });
        s = esc(s);
        s = s.replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, "<strong>$1</strong>").replace(/__(?=\S)([\s\S]*?\S)__/g, "<strong>$1</strong>").replace(/~~(?=\S)([\s\S]*?\S)~~/g, "<del>$1</del>").replace(/(?<![*\w])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?![*\w])/g, "<em>$1</em>").replace(/(?<![\w_])_(?=[^\s_])([^_\n]*?[^\s_])_(?![\w_])/g, "<em>$1</em>");
        return s.replace(/\u0000(\d+)\u0000/g, (_m, i) => stash[Number(i)]);
      }
      var cells = (line) => {
        let t = line.trim();
        if (t.startsWith("|")) t = t.slice(1);
        if (t.endsWith("|")) t = t.slice(0, -1);
        return t.split("|").map((c) => c.trim());
      };
      function mdToHtml(text) {
        const lines = String(text ?? "").slice(0, MAX_CHARS).replace(/\r\n?/g, "\n").split("\n");
        const out = [];
        let i = 0, task = 0;
        const isBlockStart = (l) => FENCE.test(l) || /^\s{0,3}#{1,6}\s/.test(l) || HR.test(l) || /^\s{0,3}>/.test(l) || LIST.test(l);
        while (i < lines.length) {
          const l = lines[i];
          if (!l.trim()) {
            i++;
            continue;
          }
          if (FENCE.test(l)) {
            const mark = FENCE.exec(l)[1];
            const code = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith(mark)) {
              code.push(lines[i]);
              i++;
            }
            i++;
            out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
            continue;
          }
          const h = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/.exec(l);
          if (h) {
            const n = Math.min(h[1].length, 4);
            out.push(`<h${n}>${inline(h[2])}</h${n}>`);
            i++;
            continue;
          }
          if (HR.test(l)) {
            out.push("<hr>");
            i++;
            continue;
          }
          if (/^\s{0,3}>/.test(l)) {
            const q = [];
            while (i < lines.length && /^\s{0,3}>/.test(lines[i])) {
              q.push(lines[i].replace(/^\s{0,3}>\s?/, ""));
              i++;
            }
            out.push(`<blockquote>${q.map(inline).join("<br>")}</blockquote>`);
            continue;
          }
          if (l.includes("|") && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1]) && lines[i + 1].includes("-")) {
            const head = cells(l);
            i += 2;
            const body = [];
            while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
              body.push(cells(lines[i]));
              i++;
            }
            out.push("<table><thead><tr>" + head.map((c) => `<th>${inline(c)}</th>`).join("") + "</tr></thead><tbody>" + body.map((r) => "<tr>" + head.map((_h, k) => `<td>${inline(r[k] || "")}</td>`).join("") + "</tr>").join("") + "</tbody></table>");
            continue;
          }
          if (LIST.test(l)) {
            const stack = [];
            let html = "";
            while (i < lines.length) {
              const m = LIST.exec(lines[i]);
              if (!m) break;
              const depth = Math.floor(m[1].replace(/\t/g, "  ").length / 2), ord = /\d/.test(m[2][0]), tag = ord ? "ol" : "ul";
              while (stack.length && stack[stack.length - 1].depth > depth) {
                html += `</li></${stack.pop().tag}>`;
              }
              if (stack.length && stack[stack.length - 1].depth === depth) html += "</li>";
              else {
                html += `<${tag}>`;
                stack.push({ depth, tag });
              }
              const t = TASK.exec(m[3]);
              if (t) html += `<li class="task"><input type="checkbox" data-task="${task++}"${t[1] === " " ? "" : " checked"}> ${inline(t[2])}`;
              else html += `<li>${inline(m[3])}`;
              i++;
            }
            while (stack.length) html += `</li></${stack.pop().tag}>`;
            out.push(html);
            continue;
          }
          const para = [l];
          i++;
          while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
            para.push(lines[i]);
            i++;
          }
          out.push(`<p>${para.map(inline).join("<br>")}</p>`);
        }
        return out.join("\n");
      }
      function toggleTask(text, index) {
        const lines = String(text ?? "").split("\n");
        let n = 0, fence = null;
        for (let k = 0; k < lines.length; k++) {
          const f = FENCE.exec(lines[k]);
          if (fence) {
            if (lines[k].trim().startsWith(fence)) fence = null;
            continue;
          }
          if (f) {
            fence = f[1];
            continue;
          }
          const m = TASK_LINE.exec(lines[k]);
          if (m && n++ === index) {
            lines[k] = lines[k].replace(TASK_LINE, (_a, pre, mark, sp) => `${pre}[${mark === " " ? "x" : " "}]${sp}`);
            return lines.join("\n");
          }
        }
        return text;
      }
      function mdToPlain(text) {
        const lines = String(text ?? "").replace(/\r\n?/g, "\n").split("\n");
        const out = [];
        let fence = null;
        for (let l of lines) {
          const f = FENCE.exec(l);
          if (fence) {
            if (l.trim().startsWith(fence)) fence = null;
            else out.push("    " + l);
            continue;
          }
          if (f) {
            fence = f[1];
            continue;
          }
          if (HR.test(l)) {
            out.push("\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500");
            continue;
          }
          if (TABLE_SEP.test(l) && l.includes("-") && l.includes("|")) continue;
          if (l.includes("|") && /^\s*\|.*\|\s*$/.test(l)) l = cells(l).join("  |  ");
          l = l.replace(/^\s{0,3}#{1,6}\s+/, "").replace(/^\s{0,3}>\s?/, "\u2502 ");
          l = l.replace(/^(\s*)[-*+]\s+\[( )\]\s+/, "$1\u2610 ").replace(/^(\s*)[-*+]\s+\[[xX]\]\s+/, "$1\u2611 ").replace(/^(\s*)[-*+]\s+/, "$1\u2022 ");
          l = l.replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, "$1 ($2)");
          l = l.replace(/`([^`]+)`/g, "$1").replace(/\*\*(\S(?:.*?\S)?)\*\*/g, "$1").replace(/__(\S(?:.*?\S)?)__/g, "$1").replace(/~~(\S(?:.*?\S)?)~~/g, "$1").replace(/(?<![*\w])\*([^\s*][^*]*?)\*(?![*\w])/g, "$1").replace(/(?<![\w_])_([^\s_][^_]*?)_(?![\w_])/g, "$1");
          out.push(l);
        }
        return plainLinks(out.join("\n"));
      }
      module.exports = { mdToHtml, mdToPlain, toggleTask };
    }
  });

  // ../core/formats/mindomo.js
  var require_mindomo = __commonJS({
    "../core/formats/mindomo.js"(exports, module) {
      "use strict";
      var { sanitizeTheme, sanitizeStyle } = require_themes();
      var HEX6 = /^[0-9a-fA-F]{6}$/;
      var hex = (v) => typeof v === "string" && HEX6.test(v.trim()) ? "#" + v.trim().toLowerCase() : null;
      var num = (v) => {
        const n = typeof v === "number" ? v : parseFloat(v);
        return Number.isFinite(n) ? n : null;
      };
      var bool = (v) => v === true || v === "true" ? true : v === false || v === "false" ? false : null;
      var mix = (a, b) => "#" + [1, 3, 5].map((i) => Math.round((parseInt(a.slice(i, i + 2), 16) + parseInt(b.slice(i, i + 2), 16)) / 2).toString(16).padStart(2, "0")).join("");
      var SHAPE = { 1: "underline", 2: "underline", 3: "rect", 4: "round", 5: "round", 6: "round", 7: "ellipse", 8: "ellipse", 9: "pill", 10: "ellipse", 11: "rect", 12: "round", 13: "rect", 14: "none" };
      var shapeOf = (t) => {
        const n = num(t);
        return n === null ? null : SHAPE[n] || "round";
      };
      function fillOf(type, value) {
        if (typeof value === "string" && value) {
          const parts = value.split(",").map((p) => hex(p)).filter(Boolean);
          if (parts.length >= 2) return mix(parts[0], parts[parts.length - 1]);
          if (parts.length === 1) return parts[0];
        }
        const t = num(type);
        return t === 2 || t === 9 ? "none" : null;
      }
      function parseFont(s) {
        const out = {};
        if (typeof s !== "string") return out;
        const tag = /<Font\b([^>]*)\/?>/i.exec(s);
        if (!tag) return out;
        const attr = (n) => {
          const m = new RegExp("\\b" + n + '="([^"]*)"', "i").exec(tag[1]);
          return m ? m[1] : null;
        };
        const c = hex(attr("Color")), z = num(attr("Size")), nm = attr("Name"), b = bool(attr("Bold")), i = bool(attr("Italic"));
        if (c) out.color = c;
        if (z !== null) out.size = Math.round(z);
        if (nm) out.font = nm;
        if (b !== null) out.bold = b;
        if (i !== null) out.italic = i;
        return out;
      }
      function wholeTitleBold(titleStyle, title) {
        if (typeof titleStyle !== "string") return null;
        const r = /<FontRange\b([^>]*)>/i.exec(titleStyle);
        if (!r) return null;
        const g = (n) => {
          const m = new RegExp("\\b" + n + '="([^"]*)"', "i").exec(r[1]);
          return m ? m[1] : null;
        };
        const from = num(g("From")), to = num(g("To")), b = bool(g("Bold"));
        return from === 0 && to !== null && to >= String(title ?? "").length - 1 && b !== null ? b : null;
      }
      function convertNodeStyle(style, titleStyle, title) {
        const s = style && typeof style === "object" ? style : {}, o = {};
        const fill = fillOf(s.fill_type, s.fill_value);
        if (fill) o.fill = fill;
        const shape = shapeOf(s.shape_type);
        if (shape) o.shape = shape;
        const bc = hex(s.border_color);
        if (bc) o.stroke = bc;
        const bt = num(s.border_thickness);
        if (bt !== null) o.strokeWidth = Math.max(0, Math.min(10, bt));
        const ec = hex(s.line_fill_value);
        if (ec) o.edge = ec;
        const ew = num(s.line_width);
        if (ew !== null && ew > 0) o.edgeWidth = Math.min(12, ew);
        const f = parseFont(titleStyle);
        if (f.color) o.color = f.color;
        if (f.size) o.size = f.size;
        if (f.font) o.font = f.font;
        if (f.bold !== void 0) o.bold = f.bold;
        if (f.italic !== void 0) o.italic = f.italic;
        const wb = wholeTitleBold(titleStyle, title);
        if (wb !== null && o.bold === void 0) o.bold = wb;
        return sanitizeStyle(o);
      }
      function levelOf(ns, i) {
        const s = ns && ns.style || {}, f = parseFont(ns && ns.font);
        const fillStyle = num(s.fill_style), bt = num(s.border_thickness) ?? 0, bc = hex(s.border_color);
        const lvl = {
          shape: shapeOf(s.shape_type) || "round",
          fill: fillOf(s.fill_type, s.fill_value) || "none",
          color: f.color || "#000000",
          size: f.size || (i === 0 ? 20 : 14),
          bold: f.bold === true,
          italic: f.italic === true,
          padX: Math.max(3, num(s.padding_left) ?? 8),
          padY: Math.max(2, num(s.padding_top) ?? 5)
        };
        if (bc && bt > 0 && fillStyle !== 18) {
          lvl.stroke = bc;
          lvl.strokeWidth = Math.min(10, bt);
        }
        const ec = hex(s.line_fill_value);
        if (ec) lvl.edge = ec;
        const ew = num(s.line_width);
        if (ew !== null && ew > 0) lvl.edgeWidth = Math.min(12, ew);
        if (f.font) lvl.font = f.font;
        return lvl;
      }
      function convertTheme(themes, themeId, name) {
        const t = themes && typeof themes === "object" && typeof themeId === "string" ? themes[themeId] : null;
        if (!t || !Array.isArray(t.nodeStyles) || !t.nodeStyles.length) return null;
        const levels = t.nodeStyles.slice(0, 16).map(levelOf);
        const ms = t.mapStyle || {};
        const bg = num(ms.fillType) === 0 || ms.fillType === "0" ? hex(ms.fillValue) : null;
        const l1 = levels[1] || levels[0];
        const palette = ["#0073e6", "#00a896", "#f4a261", "#e76f51", "#8e6bd8", "#2a9d8f", "#d6336c"];
        return sanitizeTheme({
          name: `Original do Mindomo${name ? " \u2014 " + String(name).slice(0, 40) : ""}`,
          background: bg || "#ffffff",
          font: `${levels.map((l) => l.font).find(Boolean) || "Segoe UI"}, Segoe UI, Roboto, Helvetica, Arial, sans-serif`,
          branches: [l1.edge, ...palette].filter(Boolean).slice(0, 8),
          levels,
          line: { width: levels.slice(1).map((l) => l.edgeWidth || 2), curve: "bezier" }
        });
      }
      var ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
      var decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
        if (e[0] === "#") {
          const c = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
          return Number.isFinite(c) && c > 0 && c < 1114112 ? String.fromCodePoint(c) : "";
        }
        return ENT[e.toLowerCase()] ?? m;
      });
      var wrap = (inner, mark) => {
        const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(inner);
        return m[2] ? m[1] + mark + m[2] + mark + m[3] : inner;
      };
      function htmlToMarkdown(html) {
        let s = String(html ?? "").slice(0, 4e5);
        s = s.replace(/<\s*(script|style)\b[\s\S]*?<\/\s*\1\s*>/gi, "");
        s = s.replace(/<\s*(em|i)\b[^>]*>([\s\S]*?)<\/\s*\1\s*>/gi, (m, t, inner) => wrap(inner, "*"));
        s = s.replace(/<\s*(strong|b)\b[^>]*>([\s\S]*?)<\/\s*\1\s*>/gi, (m, t, inner) => wrap(inner, "**"));
        s = s.replace(/<\s*br\s*\/?>/gi, "\n").replace(/<\s*li\b[^>]*>/gi, "\n- ").replace(/<\/\s*li\s*>/gi, "").replace(/<\/\s*(p|div|ul|ol|h[1-6]|tr)\s*>/gi, "\n").replace(/<\s*(p|div|h[1-6])\b[^>]*>/gi, "\n");
        s = s.replace(/<[^>]*>/g, "");
        s = decode(s).replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/(\S)[ \t]{2,}(?=\S)/g, "$1 ").replace(/\n{3,}/g, "\n\n");
        return s.trim();
      }
      var escHtml = require_text().escapeHtml;
      function markdownToHtml(md) {
        const inline = (t) => escHtml(t).replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
        return String(md ?? "").split(/\n{2,}/).map((p) => p.trim()).filter(Boolean).map((p) => "<p>" + p.split("\n").map(inline).join("<br>") + "</p>").join("");
      }
      module.exports = { convertTheme, convertNodeStyle, htmlToMarkdown, markdownToHtml, parseFont, SHAPE };
    }
  });

  // node_modules/fflate/lib/browser.cjs
  var require_browser = __commonJS({
    "node_modules/fflate/lib/browser.cjs"(exports) {
      "use strict";
      exports.deflate = deflate;
      exports.deflateSync = deflateSync;
      exports.inflate = inflate;
      exports.inflateSync = inflateSync;
      exports.gzip = gzip;
      exports.compress = gzip;
      exports.gzipSync = gzipSync;
      exports.compressSync = gzipSync;
      exports.gunzip = gunzip;
      exports.gunzipSync = gunzipSync;
      exports.zlib = zlib;
      exports.zlibSync = zlibSync;
      exports.unzlib = unzlib;
      exports.unzlibSync = unzlibSync;
      exports.gzip = gzip;
      exports.compress = gzip;
      exports.decompress = decompress;
      exports.decompressSync = decompressSync;
      exports.strToU8 = strToU8;
      exports.strFromU8 = strFromU8;
      exports.zip = zip;
      exports.zipSync = zipSync;
      exports.unzip = unzip;
      exports.unzipSync = unzipSync;
      var ch2 = {};
      var node_worker_1 = {};
      node_worker_1["default"] = (function(c, id, msg, transfer, cb) {
        var w = new Worker(ch2[id] || (ch2[id] = URL.createObjectURL(new Blob([
          c + ';addEventListener("error",function(e){e=e.error;postMessage({$e$:[e.message,e.code,e.stack]})})'
        ], { type: "text/javascript" }))));
        w.onmessage = function(e) {
          var d = e.data, ed = d.$e$;
          if (ed) {
            var err2 = new Error(ed[0]);
            err2["code"] = ed[1];
            err2.stack = ed[2];
            cb(err2, null);
          } else
            cb(null, d);
        };
        w.postMessage(msg, transfer);
        return w;
      });
      var u8 = Uint8Array;
      var u16 = Uint16Array;
      var i32 = Int32Array;
      var fleb = new u8([
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        1,
        1,
        1,
        1,
        2,
        2,
        2,
        2,
        3,
        3,
        3,
        3,
        4,
        4,
        4,
        4,
        5,
        5,
        5,
        5,
        0,
        /* unused */
        0,
        0,
        /* impossible */
        0
      ]);
      var fdeb = new u8([
        0,
        0,
        0,
        0,
        1,
        1,
        2,
        2,
        3,
        3,
        4,
        4,
        5,
        5,
        6,
        6,
        7,
        7,
        8,
        8,
        9,
        9,
        10,
        10,
        11,
        11,
        12,
        12,
        13,
        13,
        /* unused */
        0,
        0
      ]);
      var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
      var freb = function(eb, start) {
        var b = new u16(31);
        for (var i2 = 0; i2 < 31; ++i2) {
          b[i2] = start += 1 << eb[i2 - 1];
        }
        var r = new i32(b[30]);
        for (var i2 = 1; i2 < 30; ++i2) {
          for (var j = b[i2]; j < b[i2 + 1]; ++j) {
            r[j] = j - b[i2] << 5 | i2;
          }
        }
        return { b, r };
      };
      var _a = freb(fleb, 2);
      var fl = _a.b;
      var revfl = _a.r;
      fl[28] = 258, revfl[258] = 28;
      var _b = freb(fdeb, 0);
      var fd = _b.b;
      var revfd = _b.r;
      var rev = new u16(32768);
      for (i = 0; i < 32768; ++i) {
        x = (i & 43690) >> 1 | (i & 21845) << 1;
        x = (x & 52428) >> 2 | (x & 13107) << 2;
        x = (x & 61680) >> 4 | (x & 3855) << 4;
        rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
      }
      var x;
      var i;
      var hMap = (function(cd, mb, r) {
        var s = cd.length;
        var i2 = 0;
        var l = new u16(mb);
        for (; i2 < s; ++i2) {
          if (cd[i2])
            ++l[cd[i2] - 1];
        }
        var le = new u16(mb);
        for (i2 = 1; i2 < mb; ++i2) {
          le[i2] = le[i2 - 1] + l[i2 - 1] << 1;
        }
        var co;
        if (r) {
          co = new u16(1 << mb);
          var rvb = 15 - mb;
          for (i2 = 0; i2 < s; ++i2) {
            if (cd[i2]) {
              var sv = i2 << 4 | cd[i2];
              var r_1 = mb - cd[i2];
              var v = le[cd[i2] - 1]++ << r_1;
              for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
                co[rev[v] >> rvb] = sv;
              }
            }
          }
        } else {
          co = new u16(s);
          for (i2 = 0; i2 < s; ++i2) {
            if (cd[i2]) {
              co[i2] = rev[le[cd[i2] - 1]++] >> 15 - cd[i2];
            }
          }
        }
        return co;
      });
      var flt = new u8(288);
      for (i = 0; i < 144; ++i)
        flt[i] = 8;
      var i;
      for (i = 144; i < 256; ++i)
        flt[i] = 9;
      var i;
      for (i = 256; i < 280; ++i)
        flt[i] = 7;
      var i;
      for (i = 280; i < 288; ++i)
        flt[i] = 8;
      var i;
      var fdt = new u8(32);
      for (i = 0; i < 32; ++i)
        fdt[i] = 5;
      var i;
      var flm = /* @__PURE__ */ hMap(flt, 9, 0);
      var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
      var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
      var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
      var max = function(a) {
        var m = a[0];
        for (var i2 = 1; i2 < a.length; ++i2) {
          if (a[i2] > m)
            m = a[i2];
        }
        return m;
      };
      var bits = function(d, p, m) {
        var o = p / 8 | 0;
        return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
      };
      var bits16 = function(d, p) {
        var o = p / 8 | 0;
        return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
      };
      var shft = function(p) {
        return (p + 7) / 8 | 0;
      };
      var slc = function(v, s, e) {
        if (s == null || s < 0)
          s = 0;
        if (e == null || e > v.length)
          e = v.length;
        return new u8(v.subarray(s, e));
      };
      exports.FlateErrorCode = {
        UnexpectedEOF: 0,
        InvalidBlockType: 1,
        InvalidLengthLiteral: 2,
        InvalidDistance: 3,
        StreamFinished: 4,
        NoStreamHandler: 5,
        InvalidHeader: 6,
        NoCallback: 7,
        InvalidUTF8: 8,
        ExtraFieldTooLong: 9,
        InvalidDate: 10,
        FilenameTooLong: 11,
        StreamFinishing: 12,
        InvalidZipData: 13,
        UnknownCompressionMethod: 14
      };
      var ec = [
        "unexpected EOF",
        "invalid block type",
        "invalid length/literal",
        "invalid distance",
        "stream finished",
        "no stream handler",
        ,
        // determined by compression function
        "no callback",
        "invalid UTF-8 data",
        "extra field too long",
        "date not in range 1980-2099",
        "filename too long",
        "stream finishing",
        "invalid zip data"
        // determined by unknown compression method
      ];
      var err = function(ind, msg, nt) {
        var e = new Error(msg || ec[ind]);
        e.code = ind;
        if (Error.captureStackTrace)
          Error.captureStackTrace(e, err);
        if (!nt)
          throw e;
        return e;
      };
      var inflt = function(dat, st, buf, dict) {
        var sl = dat.length, dl = dict ? dict.length : 0;
        if (!sl || st.f && !st.l)
          return buf || new u8(0);
        var noBuf = !buf;
        var resize = noBuf || st.i != 2;
        var noSt = st.i;
        if (noBuf)
          buf = new u8(sl * 3);
        var cbuf = function(l2) {
          var bl = buf.length;
          if (l2 > bl) {
            var nbuf = new u8(Math.max(bl * 2, l2));
            nbuf.set(buf);
            buf = nbuf;
          }
        };
        var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
        var tbts = sl * 8;
        do {
          if (!lm) {
            final = bits(dat, pos, 1);
            var type = bits(dat, pos + 1, 3);
            pos += 3;
            if (!type) {
              var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
              if (t > sl) {
                if (noSt)
                  err(0);
                break;
              }
              if (resize)
                cbuf(bt + l);
              buf.set(dat.subarray(s, t), bt);
              st.b = bt += l, st.p = pos = t * 8, st.f = final;
              continue;
            } else if (type == 1)
              lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
            else if (type == 2) {
              var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
              var tl = hLit + bits(dat, pos + 5, 31) + 1;
              pos += 14;
              var ldt = new u8(tl);
              var clt = new u8(19);
              for (var i2 = 0; i2 < hcLen; ++i2) {
                clt[clim[i2]] = bits(dat, pos + i2 * 3, 7);
              }
              pos += hcLen * 3;
              var clb = max(clt), clbmsk = (1 << clb) - 1;
              var clm = hMap(clt, clb, 1);
              for (var i2 = 0; i2 < tl; ) {
                var r = clm[bits(dat, pos, clbmsk)];
                pos += r & 15;
                var s = r >> 4;
                if (s < 16) {
                  ldt[i2++] = s;
                } else {
                  var c = 0, n = 0;
                  if (s == 16)
                    n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i2 - 1];
                  else if (s == 17)
                    n = 3 + bits(dat, pos, 7), pos += 3;
                  else if (s == 18)
                    n = 11 + bits(dat, pos, 127), pos += 7;
                  while (n--)
                    ldt[i2++] = c;
                }
              }
              var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
              lbt = max(lt);
              dbt = max(dt);
              lm = hMap(lt, lbt, 1);
              dm = hMap(dt, dbt, 1);
            } else
              err(1);
            if (pos > tbts) {
              if (noSt)
                err(0);
              break;
            }
          }
          if (resize)
            cbuf(bt + 131072);
          var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
          var lpos = pos;
          for (; ; lpos = pos) {
            var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
            pos += c & 15;
            if (pos > tbts) {
              if (noSt)
                err(0);
              break;
            }
            if (!c)
              err(2);
            if (sym < 256)
              buf[bt++] = sym;
            else if (sym == 256) {
              lpos = pos, lm = null;
              break;
            } else {
              var add = sym - 254;
              if (sym > 264) {
                var i2 = sym - 257, b = fleb[i2];
                add = bits(dat, pos, (1 << b) - 1) + fl[i2];
                pos += b;
              }
              var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
              if (!d)
                err(3);
              pos += d & 15;
              var dt = fd[dsym];
              if (dsym > 3) {
                var b = fdeb[dsym];
                dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
              }
              if (pos > tbts) {
                if (noSt)
                  err(0);
                break;
              }
              if (resize)
                cbuf(bt + 131072);
              var end = bt + add;
              if (bt < dt) {
                var shift = dl - dt, dend = Math.min(dt, end);
                if (shift + bt < 0)
                  err(3);
                for (; bt < dend; ++bt)
                  buf[bt] = dict[shift + bt];
              }
              for (; bt < end; ++bt)
                buf[bt] = buf[bt - dt];
            }
          }
          st.l = lm, st.p = lpos, st.b = bt, st.f = final;
          if (lm)
            final = 1, st.m = lbt, st.d = dm, st.n = dbt;
        } while (!final);
        return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
      };
      var wbits = function(d, p, v) {
        v <<= p & 7;
        var o = p / 8 | 0;
        d[o] |= v;
        d[o + 1] |= v >> 8;
      };
      var wbits16 = function(d, p, v) {
        v <<= p & 7;
        var o = p / 8 | 0;
        d[o] |= v;
        d[o + 1] |= v >> 8;
        d[o + 2] |= v >> 16;
      };
      var hTree = function(d, mb) {
        var t = [];
        for (var i2 = 0; i2 < d.length; ++i2) {
          if (d[i2])
            t.push({ s: i2, f: d[i2] });
        }
        var s = t.length;
        var t2 = t.slice();
        if (!s)
          return { t: et, l: 0 };
        if (s == 1) {
          var v = new u8(t[0].s + 1);
          v[t[0].s] = 1;
          return { t: v, l: 1 };
        }
        t.sort(function(a, b) {
          return a.f - b.f;
        });
        t.push({ s: -1, f: 25001 });
        var l = t[0], r = t[1], i0 = 0, i1 = 1, i22 = 2;
        t[0] = { s: -1, f: l.f + r.f, l, r };
        while (i1 != s - 1) {
          l = t[t[i0].f < t[i22].f ? i0++ : i22++];
          r = t[i0 != i1 && t[i0].f < t[i22].f ? i0++ : i22++];
          t[i1++] = { s: -1, f: l.f + r.f, l, r };
        }
        var maxSym = t2[0].s;
        for (var i2 = 1; i2 < s; ++i2) {
          if (t2[i2].s > maxSym)
            maxSym = t2[i2].s;
        }
        var tr = new u16(maxSym + 1);
        var mbt = ln(t[i1 - 1], tr, 0);
        if (mbt > mb) {
          var i2 = 0, dt = 0;
          var lft = mbt - mb, cst = 1 << lft;
          t2.sort(function(a, b) {
            return tr[b.s] - tr[a.s] || a.f - b.f;
          });
          for (; i2 < s; ++i2) {
            var i2_1 = t2[i2].s;
            if (tr[i2_1] > mb) {
              dt += cst - (1 << mbt - tr[i2_1]);
              tr[i2_1] = mb;
            } else
              break;
          }
          dt >>= lft;
          while (dt > 0) {
            var i2_2 = t2[i2].s;
            if (tr[i2_2] < mb)
              dt -= 1 << mb - tr[i2_2]++ - 1;
            else
              ++i2;
          }
          for (; i2 >= 0 && dt; --i2) {
            var i2_3 = t2[i2].s;
            if (tr[i2_3] == mb) {
              --tr[i2_3];
              ++dt;
            }
          }
          mbt = mb;
        }
        return { t: new u8(tr), l: mbt };
      };
      var ln = function(n, l, d) {
        return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
      };
      var lc = function(c) {
        var s = c.length;
        while (s && !c[--s])
          ;
        var cl = new u16(++s);
        var cli = 0, cln = c[0], cls = 1;
        var w = function(v) {
          cl[cli++] = v;
        };
        for (var i2 = 1; i2 <= s; ++i2) {
          if (c[i2] == cln && i2 != s)
            ++cls;
          else {
            if (!cln && cls > 2) {
              for (; cls > 138; cls -= 138)
                w(32754);
              if (cls > 2) {
                w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
                cls = 0;
              }
            } else if (cls > 3) {
              w(cln), --cls;
              for (; cls > 6; cls -= 6)
                w(8304);
              if (cls > 2)
                w(cls - 3 << 5 | 8208), cls = 0;
            }
            while (cls--)
              w(cln);
            cls = 1;
            cln = c[i2];
          }
        }
        return { c: cl.subarray(0, cli), n: s };
      };
      var clen = function(cf, cl) {
        var l = 0;
        for (var i2 = 0; i2 < cl.length; ++i2)
          l += cf[i2] * cl[i2];
        return l;
      };
      var wfblk = function(out, pos, dat) {
        var s = dat.length;
        var o = shft(pos + 2);
        out[o] = s & 255;
        out[o + 1] = s >> 8;
        out[o + 2] = out[o] ^ 255;
        out[o + 3] = out[o + 1] ^ 255;
        for (var i2 = 0; i2 < s; ++i2)
          out[o + i2 + 4] = dat[i2];
        return (o + 4 + s) * 8;
      };
      var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
        wbits(out, p++, final);
        ++lf[256];
        var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
        var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
        var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
        var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
        var lcfreq = new u16(19);
        for (var i2 = 0; i2 < lclt.length; ++i2)
          ++lcfreq[lclt[i2] & 31];
        for (var i2 = 0; i2 < lcdt.length; ++i2)
          ++lcfreq[lcdt[i2] & 31];
        var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
        var nlcc = 19;
        for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
          ;
        var flen = bl + 5 << 3;
        var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
        var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
        if (bs >= 0 && flen <= ftlen && flen <= dtlen)
          return wfblk(out, p, dat.subarray(bs, bs + bl));
        var lm, ll, dm, dl;
        wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
        if (dtlen < ftlen) {
          lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
          var llm = hMap(lct, mlcb, 0);
          wbits(out, p, nlc - 257);
          wbits(out, p + 5, ndc - 1);
          wbits(out, p + 10, nlcc - 4);
          p += 14;
          for (var i2 = 0; i2 < nlcc; ++i2)
            wbits(out, p + 3 * i2, lct[clim[i2]]);
          p += 3 * nlcc;
          var lcts = [lclt, lcdt];
          for (var it = 0; it < 2; ++it) {
            var clct = lcts[it];
            for (var i2 = 0; i2 < clct.length; ++i2) {
              var len = clct[i2] & 31;
              wbits(out, p, llm[len]), p += lct[len];
              if (len > 15)
                wbits(out, p, clct[i2] >> 5 & 127), p += clct[i2] >> 12;
            }
          }
        } else {
          lm = flm, ll = flt, dm = fdm, dl = fdt;
        }
        for (var i2 = 0; i2 < li; ++i2) {
          var sym = syms[i2];
          if (sym > 255) {
            var len = sym >> 18 & 31;
            wbits16(out, p, lm[len + 257]), p += ll[len + 257];
            if (len > 7)
              wbits(out, p, sym >> 23 & 31), p += fleb[len];
            var dst = sym & 31;
            wbits16(out, p, dm[dst]), p += dl[dst];
            if (dst > 3)
              wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
          } else {
            wbits16(out, p, lm[sym]), p += ll[sym];
          }
        }
        wbits16(out, p, lm[256]);
        return p + ll[256];
      };
      var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
      var et = /* @__PURE__ */ new u8(0);
      var dflt = function(dat, lvl, plvl, pre, post, st) {
        var s = st.z || dat.length;
        var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
        var w = o.subarray(pre, o.length - post);
        var lst = st.l;
        var pos = (st.r || 0) & 7;
        if (lvl) {
          if (pos)
            w[0] = st.r >> 3;
          var opt = deo[lvl - 1];
          var n = opt >> 13, c = opt & 8191;
          var msk_1 = (1 << plvl) - 1;
          var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
          var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
          var hsh = function(i3) {
            return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
          };
          var syms = new i32(25e3);
          var lf = new u16(288), df = new u16(32);
          var lc_1 = 0, eb = 0, i2 = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
          for (; i2 + 2 < s; ++i2) {
            var hv = hsh(i2);
            var imod = i2 & 32767, pimod = head[hv];
            prev[imod] = pimod;
            head[hv] = imod;
            if (wi <= i2) {
              var rem = s - i2;
              if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
                pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
                li = lc_1 = eb = 0, bs = i2;
                for (var j = 0; j < 286; ++j)
                  lf[j] = 0;
                for (var j = 0; j < 30; ++j)
                  df[j] = 0;
              }
              var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
              if (rem > 2 && hv == hsh(i2 - dif)) {
                var maxn = Math.min(n, rem) - 1;
                var maxd = Math.min(32767, i2);
                var ml = Math.min(258, rem);
                while (dif <= maxd && --ch_1 && imod != pimod) {
                  if (dat[i2 + l] == dat[i2 + l - dif]) {
                    var nl = 0;
                    for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl)
                      ;
                    if (nl > l) {
                      l = nl, d = dif;
                      if (nl > maxn)
                        break;
                      var mmd = Math.min(dif, nl - 2);
                      var md = 0;
                      for (var j = 0; j < mmd; ++j) {
                        var ti = i2 - dif + j & 32767;
                        var pti = prev[ti];
                        var cd = ti - pti & 32767;
                        if (cd > md)
                          md = cd, pimod = ti;
                      }
                    }
                  }
                  imod = pimod, pimod = prev[imod];
                  dif += imod - pimod & 32767;
                }
              }
              if (d) {
                syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
                var lin = revfl[l] & 31, din = revfd[d] & 31;
                eb += fleb[lin] + fdeb[din];
                ++lf[257 + lin];
                ++df[din];
                wi = i2 + l;
                ++lc_1;
              } else {
                syms[li++] = dat[i2];
                ++lf[dat[i2]];
              }
            }
          }
          for (i2 = Math.max(i2, wi); i2 < s; ++i2) {
            syms[li++] = dat[i2];
            ++lf[dat[i2]];
          }
          pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
          if (!lst) {
            st.r = pos & 7 | w[pos / 8 | 0] << 3;
            pos -= 7;
            st.h = head, st.p = prev, st.i = i2, st.w = wi;
          }
        } else {
          for (var i2 = st.w || 0; i2 < s + lst; i2 += 65535) {
            var e = i2 + 65535;
            if (e >= s) {
              w[pos / 8 | 0] = lst;
              e = s;
            }
            pos = wfblk(w, pos + 1, dat.subarray(i2, e));
          }
          st.i = s;
        }
        return slc(o, 0, pre + shft(pos) + post);
      };
      var crct = /* @__PURE__ */ (function() {
        var t = new Int32Array(256);
        for (var i2 = 0; i2 < 256; ++i2) {
          var c = i2, k = 9;
          while (--k)
            c = (c & 1 && -306674912) ^ c >>> 1;
          t[i2] = c;
        }
        return t;
      })();
      var crc = function() {
        var c = -1;
        return {
          p: function(d) {
            var cr = c;
            for (var i2 = 0; i2 < d.length; ++i2)
              cr = crct[cr & 255 ^ d[i2]] ^ cr >>> 8;
            c = cr;
          },
          d: function() {
            return ~c;
          }
        };
      };
      var adler = function() {
        var a = 1, b = 0;
        return {
          p: function(d) {
            var n = a, m = b;
            var l = d.length | 0;
            for (var i2 = 0; i2 != l; ) {
              var e = Math.min(i2 + 2655, l);
              for (; i2 < e; ++i2)
                m += n += d[i2];
              n = (n & 65535) + 15 * (n >> 16), m = (m & 65535) + 15 * (m >> 16);
            }
            a = n, b = m;
          },
          d: function() {
            a %= 65521, b %= 65521;
            return (a & 255) << 24 | (a & 65280) << 8 | (b & 255) << 8 | b >> 8;
          }
        };
      };
      var dopt = function(dat, opt, pre, post, st) {
        if (!st) {
          st = { l: 1 };
          if (opt.dictionary) {
            var dict = opt.dictionary.subarray(-32768);
            var newDat = new u8(dict.length + dat.length);
            newDat.set(dict);
            newDat.set(dat, dict.length);
            dat = newDat;
            st.w = dict.length;
          }
        }
        return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
      };
      var mrg = function(a, b) {
        var o = {};
        for (var k in a)
          o[k] = a[k];
        for (var k in b)
          o[k] = b[k];
        return o;
      };
      var wcln = function(fn, fnStr, td2) {
        var dt = fn();
        var st = fn.toString();
        var ks = st.slice(st.indexOf("[") + 1, st.lastIndexOf("]")).replace(/\s+/g, "").split(",");
        for (var i2 = 0; i2 < dt.length; ++i2) {
          var v = dt[i2], k = ks[i2];
          if (typeof v == "function") {
            fnStr += ";" + k + "=";
            var st_1 = v.toString();
            if (v.prototype) {
              if (st_1.indexOf("[native code]") != -1) {
                var spInd = st_1.indexOf(" ", 8) + 1;
                fnStr += st_1.slice(spInd, st_1.indexOf("(", spInd));
              } else {
                fnStr += st_1;
                for (var t in v.prototype)
                  fnStr += ";" + k + ".prototype." + t + "=" + v.prototype[t].toString();
              }
            } else
              fnStr += st_1;
          } else
            td2[k] = v;
        }
        return fnStr;
      };
      var ch = [];
      var cbfs = function(v) {
        var tl = [];
        for (var k in v) {
          if (v[k].buffer) {
            tl.push((v[k] = new v[k].constructor(v[k])).buffer);
          }
        }
        return tl;
      };
      var wrkr = function(fns, init, id, cb) {
        if (!ch[id]) {
          var fnStr = "", td_1 = {}, m = fns.length - 1;
          for (var i2 = 0; i2 < m; ++i2)
            fnStr = wcln(fns[i2], fnStr, td_1);
          ch[id] = { c: wcln(fns[m], fnStr, td_1), e: td_1 };
        }
        var td2 = mrg({}, ch[id].e);
        return (0, node_worker_1.default)(ch[id].c + ";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=" + init.toString() + "}", id, td2, cbfs(td2), cb);
      };
      var bInflt = function() {
        return [u8, u16, i32, fleb, fdeb, clim, fl, fd, flrm, fdrm, rev, ec, hMap, max, bits, bits16, shft, slc, err, inflt, inflateSync, pbf, gopt];
      };
      var bDflt = function() {
        return [u8, u16, i32, fleb, fdeb, clim, revfl, revfd, flm, flt, fdm, fdt, rev, deo, et, hMap, wbits, wbits16, hTree, ln, lc, clen, wfblk, wblk, shft, slc, dflt, dopt, deflateSync, pbf];
      };
      var gze = function() {
        return [gzh, gzhl, wbytes, crc, crct];
      };
      var guze = function() {
        return [gzs, gzl];
      };
      var zle = function() {
        return [zlh, wbytes, adler];
      };
      var zule = function() {
        return [zls];
      };
      var pbf = function(msg) {
        return postMessage(msg, [msg.buffer]);
      };
      var gopt = function(o) {
        return o && {
          out: o.size && new u8(o.size),
          dictionary: o.dictionary
        };
      };
      var cbify = function(dat, opts, fns, init, id, cb) {
        var w = wrkr(fns, init, id, function(err2, dat2) {
          w.terminate();
          cb(err2, dat2);
        });
        w.postMessage([dat, opts], opts.consume ? [dat.buffer] : []);
        return function() {
          w.terminate();
        };
      };
      var astrm = function(strm) {
        strm.ondata = function(dat, final) {
          return postMessage([dat, final], [dat.buffer]);
        };
        return function(ev) {
          if (ev.data[0]) {
            strm.push(ev.data[0], ev.data[1]);
            postMessage([ev.data[0].length]);
          } else
            strm.flush(ev.data[1]);
        };
      };
      var astrmify = function(fns, strm, opts, init, id, flush2, ext) {
        var t;
        var w = wrkr(fns, init, id, function(err2, dat) {
          if (err2)
            w.terminate(), strm.ondata.call(strm, err2);
          else if (!Array.isArray(dat))
            ext(dat);
          else if (dat.length == 1) {
            strm.queuedSize -= dat[0];
            if (strm.ondrain)
              strm.ondrain(dat[0]);
          } else {
            if (dat[1])
              w.terminate();
            strm.ondata.call(strm, err2, dat[0], dat[1]);
          }
        });
        w.postMessage(opts);
        strm.queuedSize = 0;
        strm.push = function(d, f) {
          if (!strm.ondata)
            err(5);
          if (t)
            strm.ondata(err(4, 0, 1), null, !!f);
          strm.queuedSize += d.length;
          w.postMessage([d, t = f], d.buffer instanceof ArrayBuffer ? [d.buffer] : []);
        };
        strm.terminate = function() {
          w.terminate();
        };
        if (flush2) {
          strm.flush = function(sync) {
            w.postMessage([0, sync]);
          };
        }
      };
      var b2 = function(d, b) {
        return d[b] | d[b + 1] << 8;
      };
      var b4 = function(d, b) {
        return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
      };
      var b8 = function(d, b) {
        return b4(d, b) + b4(d, b + 4) * 4294967296;
      };
      var wbytes = function(d, b, v) {
        for (; v; ++b)
          d[b] = v, v >>>= 8;
      };
      var gzh = function(c, o) {
        var fn = o.filename;
        c[0] = 31, c[1] = 139, c[2] = 8, c[8] = o.level < 2 ? 4 : o.level == 9 ? 2 : 0, c[9] = 3;
        if (o.mtime != 0)
          wbytes(c, 4, Math.floor(new Date(o.mtime || Date.now()) / 1e3));
        if (fn) {
          c[3] = 8;
          for (var i2 = 0; i2 <= fn.length; ++i2)
            c[i2 + 10] = fn.charCodeAt(i2);
        }
      };
      var gzs = function(d) {
        if (d[0] != 31 || d[1] != 139 || d[2] != 8)
          err(6, "invalid gzip data");
        var flg = d[3];
        var st = 10;
        if (flg & 4)
          st += (d[10] | d[11] << 8) + 2;
        for (var zs = (flg >> 3 & 1) + (flg >> 4 & 1); zs > 0; zs -= !d[st++])
          ;
        return st + (flg & 2);
      };
      var gzl = function(d) {
        var l = d.length;
        return (d[l - 4] | d[l - 3] << 8 | d[l - 2] << 16 | d[l - 1] << 24) >>> 0;
      };
      var gzhl = function(o) {
        return 10 + (o.filename ? o.filename.length + 1 : 0);
      };
      var zlh = function(c, o) {
        var lv = o.level, fl2 = lv == 0 ? 0 : lv < 6 ? 1 : lv == 9 ? 3 : 2;
        c[0] = 120, c[1] = fl2 << 6 | (o.dictionary && 32);
        c[1] |= 31 - (c[0] << 8 | c[1]) % 31;
        if (o.dictionary) {
          var h = adler();
          h.p(o.dictionary);
          wbytes(c, 2, h.d());
        }
      };
      var zls = function(d, dict) {
        if ((d[0] & 15) != 8 || d[0] >> 4 > 7 || (d[0] << 8 | d[1]) % 31)
          err(6, "invalid zlib data");
        if ((d[1] >> 5 & 1) == +!dict)
          err(6, "invalid zlib data: " + (d[1] & 32 ? "need" : "unexpected") + " dictionary");
        return (d[1] >> 3 & 4) + 2;
      };
      function StrmOpt(opts, cb) {
        if (typeof opts == "function")
          cb = opts, opts = {};
        this.ondata = cb;
        return opts;
      }
      var Deflate = /* @__PURE__ */ (function() {
        function Deflate2(opts, cb) {
          if (typeof opts == "function")
            cb = opts, opts = {};
          this.ondata = cb;
          this.o = opts || {};
          this.s = { l: 0, i: 32768, w: 32768, z: 32768 };
          this.b = new u8(98304);
          if (this.o.dictionary) {
            var dict = this.o.dictionary.subarray(-32768);
            this.b.set(dict, 32768 - dict.length);
            this.s.i = 32768 - dict.length;
          }
        }
        Deflate2.prototype.p = function(c, f) {
          this.ondata(dopt(c, this.o, 0, 0, this.s), f);
        };
        Deflate2.prototype.push = function(chunk, final) {
          if (!this.ondata)
            err(5);
          if (this.s.l)
            err(4);
          var endLen = chunk.length + this.s.z;
          if (endLen > this.b.length) {
            if (endLen > 2 * this.b.length - 32768) {
              var newBuf = new u8(endLen & -32768);
              newBuf.set(this.b.subarray(0, this.s.z));
              this.b = newBuf;
            }
            var split = this.b.length - this.s.z;
            this.b.set(chunk.subarray(0, split), this.s.z);
            this.s.z = this.b.length;
            this.p(this.b, false);
            this.b.set(this.b.subarray(-32768));
            this.b.set(chunk.subarray(split), 32768);
            this.s.z = chunk.length - split + 32768;
            this.s.i = 32766, this.s.w = 32768;
          } else {
            this.b.set(chunk, this.s.z);
            this.s.z += chunk.length;
          }
          this.s.l = final & 1;
          if (this.s.z > this.s.w + 8191 || final) {
            this.p(this.b, final || false);
            this.s.w = this.s.i, this.s.i -= 2;
          }
          if (final) {
            this.s = this.o = {};
            this.b = et;
          }
        };
        Deflate2.prototype.flush = function(sync) {
          if (!this.ondata)
            err(5);
          if (this.s.l)
            err(4);
          this.p(this.b, false);
          this.s.w = this.s.i, this.s.i -= 2;
          if (sync) {
            var c = new u8(6);
            c[0] = this.s.r >> 3;
            var ep = wfblk(c, this.s.r, et);
            this.s.r = 0;
            this.ondata(c.subarray(0, ep >> 3), false);
          }
        };
        return Deflate2;
      })();
      exports.Deflate = Deflate;
      var AsyncDeflate = /* @__PURE__ */ (function() {
        function AsyncDeflate2(opts, cb) {
          astrmify([
            bDflt,
            function() {
              return [astrm, Deflate];
            }
          ], this, StrmOpt.call(this, opts, cb), function(ev) {
            var strm = new Deflate(ev.data);
            onmessage = astrm(strm);
          }, 6, 1);
        }
        return AsyncDeflate2;
      })();
      exports.AsyncDeflate = AsyncDeflate;
      function deflate(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return cbify(data, opts, [
          bDflt
        ], function(ev) {
          return pbf(deflateSync(ev.data[0], ev.data[1]));
        }, 0, cb);
      }
      function deflateSync(data, opts) {
        return dopt(data, opts || {}, 0, 0);
      }
      var Inflate = /* @__PURE__ */ (function() {
        function Inflate2(opts, cb) {
          if (typeof opts == "function")
            cb = opts, opts = {};
          this.ondata = cb;
          var dict = opts && opts.dictionary && opts.dictionary.subarray(-32768);
          this.s = { i: 0, b: dict ? dict.length : 0 };
          this.o = new u8(32768);
          this.p = new u8(0);
          if (dict)
            this.o.set(dict);
        }
        Inflate2.prototype.e = function(c) {
          if (!this.ondata)
            err(5);
          if (this.d)
            err(4);
          if (!this.p.length)
            this.p = c;
          else if (c.length) {
            var n = new u8(this.p.length + c.length);
            n.set(this.p), n.set(c, this.p.length), this.p = n;
          }
        };
        Inflate2.prototype.c = function(final) {
          this.s.i = +(this.d = final || false);
          var bts = this.s.b;
          var dt = inflt(this.p, this.s, this.o);
          this.ondata(slc(dt, bts, this.s.b), this.d);
          this.o = slc(dt, this.s.b - 32768), this.s.b = this.o.length;
          this.p = slc(this.p, this.s.p / 8 | 0), this.s.p &= 7;
        };
        Inflate2.prototype.push = function(chunk, final) {
          this.e(chunk), this.c(final);
        };
        return Inflate2;
      })();
      exports.Inflate = Inflate;
      var AsyncInflate = /* @__PURE__ */ (function() {
        function AsyncInflate2(opts, cb) {
          astrmify([
            bInflt,
            function() {
              return [astrm, Inflate];
            }
          ], this, StrmOpt.call(this, opts, cb), function(ev) {
            var strm = new Inflate(ev.data);
            onmessage = astrm(strm);
          }, 7, 0);
        }
        return AsyncInflate2;
      })();
      exports.AsyncInflate = AsyncInflate;
      function inflate(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return cbify(data, opts, [
          bInflt
        ], function(ev) {
          return pbf(inflateSync(ev.data[0], gopt(ev.data[1])));
        }, 1, cb);
      }
      function inflateSync(data, opts) {
        return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
      }
      var Gzip = /* @__PURE__ */ (function() {
        function Gzip2(opts, cb) {
          this.c = crc();
          this.l = 0;
          this.v = 1;
          Deflate.call(this, opts, cb);
        }
        Gzip2.prototype.push = function(chunk, final) {
          this.c.p(chunk);
          this.l += chunk.length;
          Deflate.prototype.push.call(this, chunk, final);
        };
        Gzip2.prototype.p = function(c, f) {
          var raw = dopt(c, this.o, this.v && gzhl(this.o), f && 8, this.s);
          if (this.v)
            gzh(raw, this.o), this.v = 0;
          if (f)
            wbytes(raw, raw.length - 8, this.c.d()), wbytes(raw, raw.length - 4, this.l);
          this.ondata(raw, f);
        };
        Gzip2.prototype.flush = function(sync) {
          Deflate.prototype.flush.call(this, sync);
        };
        return Gzip2;
      })();
      exports.Gzip = Gzip;
      exports.Compress = Gzip;
      var AsyncGzip = /* @__PURE__ */ (function() {
        function AsyncGzip2(opts, cb) {
          astrmify([
            bDflt,
            gze,
            function() {
              return [astrm, Deflate, Gzip];
            }
          ], this, StrmOpt.call(this, opts, cb), function(ev) {
            var strm = new Gzip(ev.data);
            onmessage = astrm(strm);
          }, 8, 1);
        }
        return AsyncGzip2;
      })();
      exports.AsyncGzip = AsyncGzip;
      exports.AsyncCompress = AsyncGzip;
      function gzip(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return cbify(data, opts, [
          bDflt,
          gze,
          function() {
            return [gzipSync];
          }
        ], function(ev) {
          return pbf(gzipSync(ev.data[0], ev.data[1]));
        }, 2, cb);
      }
      function gzipSync(data, opts) {
        if (!opts)
          opts = {};
        var c = crc(), l = data.length;
        c.p(data);
        var d = dopt(data, opts, gzhl(opts), 8), s = d.length;
        return gzh(d, opts), wbytes(d, s - 8, c.d()), wbytes(d, s - 4, l), d;
      }
      var Gunzip = /* @__PURE__ */ (function() {
        function Gunzip2(opts, cb) {
          this.v = 1;
          this.r = 0;
          Inflate.call(this, opts, cb);
        }
        Gunzip2.prototype.push = function(chunk, final) {
          Inflate.prototype.e.call(this, chunk);
          this.r += chunk.length;
          if (this.v) {
            var p = this.p.subarray(this.v - 1);
            var s = p.length > 3 ? gzs(p) : 4;
            if (s > p.length) {
              if (!final)
                return;
            } else if (this.v > 1 && this.onmember) {
              this.onmember(this.r - p.length);
            }
            this.p = p.subarray(s), this.v = 0;
          }
          Inflate.prototype.c.call(this, 0);
          if (this.s.f && !this.s.l) {
            this.v = shft(this.s.p) + 9;
            this.s = { i: 0 };
            this.o = new u8(0);
            this.push(new u8(0), final);
          } else if (final) {
            Inflate.prototype.c.call(this, final);
          }
        };
        return Gunzip2;
      })();
      exports.Gunzip = Gunzip;
      var AsyncGunzip = /* @__PURE__ */ (function() {
        function AsyncGunzip2(opts, cb) {
          var _this = this;
          astrmify([
            bInflt,
            guze,
            function() {
              return [astrm, Inflate, Gunzip];
            }
          ], this, StrmOpt.call(this, opts, cb), function(ev) {
            var strm = new Gunzip(ev.data);
            strm.onmember = function(offset) {
              return postMessage(offset);
            };
            onmessage = astrm(strm);
          }, 9, 0, function(offset) {
            return _this.onmember && _this.onmember(offset);
          });
        }
        return AsyncGunzip2;
      })();
      exports.AsyncGunzip = AsyncGunzip;
      function gunzip(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return cbify(data, opts, [
          bInflt,
          guze,
          function() {
            return [gunzipSync];
          }
        ], function(ev) {
          return pbf(gunzipSync(ev.data[0], ev.data[1]));
        }, 3, cb);
      }
      function gunzipSync(data, opts) {
        var st = gzs(data);
        if (st + 8 > data.length)
          err(6, "invalid gzip data");
        return inflt(data.subarray(st, -8), { i: 2 }, opts && opts.out || new u8(gzl(data)), opts && opts.dictionary);
      }
      var Zlib = /* @__PURE__ */ (function() {
        function Zlib2(opts, cb) {
          this.c = adler();
          this.v = 1;
          Deflate.call(this, opts, cb);
        }
        Zlib2.prototype.push = function(chunk, final) {
          this.c.p(chunk);
          Deflate.prototype.push.call(this, chunk, final);
        };
        Zlib2.prototype.p = function(c, f) {
          var raw = dopt(c, this.o, this.v && (this.o.dictionary ? 6 : 2), f && 4, this.s);
          if (this.v)
            zlh(raw, this.o), this.v = 0;
          if (f)
            wbytes(raw, raw.length - 4, this.c.d());
          this.ondata(raw, f);
        };
        Zlib2.prototype.flush = function(sync) {
          Deflate.prototype.flush.call(this, sync);
        };
        return Zlib2;
      })();
      exports.Zlib = Zlib;
      var AsyncZlib = /* @__PURE__ */ (function() {
        function AsyncZlib2(opts, cb) {
          astrmify([
            bDflt,
            zle,
            function() {
              return [astrm, Deflate, Zlib];
            }
          ], this, StrmOpt.call(this, opts, cb), function(ev) {
            var strm = new Zlib(ev.data);
            onmessage = astrm(strm);
          }, 10, 1);
        }
        return AsyncZlib2;
      })();
      exports.AsyncZlib = AsyncZlib;
      function zlib(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return cbify(data, opts, [
          bDflt,
          zle,
          function() {
            return [zlibSync];
          }
        ], function(ev) {
          return pbf(zlibSync(ev.data[0], ev.data[1]));
        }, 4, cb);
      }
      function zlibSync(data, opts) {
        if (!opts)
          opts = {};
        var a = adler();
        a.p(data);
        var d = dopt(data, opts, opts.dictionary ? 6 : 2, 4);
        return zlh(d, opts), wbytes(d, d.length - 4, a.d()), d;
      }
      var Unzlib = /* @__PURE__ */ (function() {
        function Unzlib2(opts, cb) {
          Inflate.call(this, opts, cb);
          this.v = opts && opts.dictionary ? 2 : 1;
        }
        Unzlib2.prototype.push = function(chunk, final) {
          Inflate.prototype.e.call(this, chunk);
          if (this.v) {
            if (this.p.length < 6 && !final)
              return;
            this.p = this.p.subarray(zls(this.p, this.v - 1)), this.v = 0;
          }
          if (final) {
            if (this.p.length < 4)
              err(6, "invalid zlib data");
            this.p = this.p.subarray(0, -4);
          }
          Inflate.prototype.c.call(this, final);
        };
        return Unzlib2;
      })();
      exports.Unzlib = Unzlib;
      var AsyncUnzlib = /* @__PURE__ */ (function() {
        function AsyncUnzlib2(opts, cb) {
          astrmify([
            bInflt,
            zule,
            function() {
              return [astrm, Inflate, Unzlib];
            }
          ], this, StrmOpt.call(this, opts, cb), function(ev) {
            var strm = new Unzlib(ev.data);
            onmessage = astrm(strm);
          }, 11, 0);
        }
        return AsyncUnzlib2;
      })();
      exports.AsyncUnzlib = AsyncUnzlib;
      function unzlib(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return cbify(data, opts, [
          bInflt,
          zule,
          function() {
            return [unzlibSync];
          }
        ], function(ev) {
          return pbf(unzlibSync(ev.data[0], gopt(ev.data[1])));
        }, 5, cb);
      }
      function unzlibSync(data, opts) {
        return inflt(data.subarray(zls(data, opts && opts.dictionary), -4), { i: 2 }, opts && opts.out, opts && opts.dictionary);
      }
      var Decompress = /* @__PURE__ */ (function() {
        function Decompress2(opts, cb) {
          this.o = StrmOpt.call(this, opts, cb) || {};
          this.G = Gunzip;
          this.I = Inflate;
          this.Z = Unzlib;
        }
        Decompress2.prototype.i = function() {
          var _this = this;
          this.s.ondata = function(dat, final) {
            _this.ondata(dat, final);
          };
        };
        Decompress2.prototype.push = function(chunk, final) {
          if (!this.ondata)
            err(5);
          if (!this.s) {
            if (this.p && this.p.length) {
              var n = new u8(this.p.length + chunk.length);
              n.set(this.p), n.set(chunk, this.p.length);
            } else
              this.p = chunk;
            if (this.p.length > 2) {
              this.s = this.p[0] == 31 && this.p[1] == 139 && this.p[2] == 8 ? new this.G(this.o) : (this.p[0] & 15) != 8 || this.p[0] >> 4 > 7 || (this.p[0] << 8 | this.p[1]) % 31 ? new this.I(this.o) : new this.Z(this.o);
              this.i();
              this.s.push(this.p, final);
              this.p = null;
            }
          } else
            this.s.push(chunk, final);
        };
        return Decompress2;
      })();
      exports.Decompress = Decompress;
      var AsyncDecompress = /* @__PURE__ */ (function() {
        function AsyncDecompress2(opts, cb) {
          Decompress.call(this, opts, cb);
          this.queuedSize = 0;
          this.G = AsyncGunzip;
          this.I = AsyncInflate;
          this.Z = AsyncUnzlib;
        }
        AsyncDecompress2.prototype.i = function() {
          var _this = this;
          this.s.ondata = function(err2, dat, final) {
            _this.ondata(err2, dat, final);
          };
          this.s.ondrain = function(size) {
            _this.queuedSize -= size;
            if (_this.ondrain)
              _this.ondrain(size);
          };
        };
        AsyncDecompress2.prototype.push = function(chunk, final) {
          this.queuedSize += chunk.length;
          Decompress.prototype.push.call(this, chunk, final);
        };
        return AsyncDecompress2;
      })();
      exports.AsyncDecompress = AsyncDecompress;
      function decompress(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        return data[0] == 31 && data[1] == 139 && data[2] == 8 ? gunzip(data, opts, cb) : (data[0] & 15) != 8 || data[0] >> 4 > 7 || (data[0] << 8 | data[1]) % 31 ? inflate(data, opts, cb) : unzlib(data, opts, cb);
      }
      function decompressSync(data, opts) {
        return data[0] == 31 && data[1] == 139 && data[2] == 8 ? gunzipSync(data, opts) : (data[0] & 15) != 8 || data[0] >> 4 > 7 || (data[0] << 8 | data[1]) % 31 ? inflateSync(data, opts) : unzlibSync(data, opts);
      }
      var fltn = function(d, p, t, o) {
        for (var k in d) {
          var val = d[k], n = p + k, op = o;
          if (Array.isArray(val))
            op = mrg(o, val[1]), val = val[0];
          if (ArrayBuffer.isView(val))
            t[n] = [val, op];
          else {
            t[n += "/"] = [new u8(0), op];
            fltn(val, n, t, o);
          }
        }
      };
      var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
      var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
      var tds = 0;
      try {
        td.decode(et, { stream: true });
        tds = 1;
      } catch (e) {
      }
      var dutf8 = function(d) {
        for (var r = "", i2 = 0; ; ) {
          var c = d[i2++];
          var eb = (c > 127) + (c > 223) + (c > 239);
          if (i2 + eb > d.length)
            return { s: r, r: slc(d, i2 - 1) };
          if (!eb)
            r += String.fromCharCode(c);
          else if (eb == 3) {
            c = ((c & 15) << 18 | (d[i2++] & 63) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
          } else if (eb & 1)
            r += String.fromCharCode((c & 31) << 6 | d[i2++] & 63);
          else
            r += String.fromCharCode((c & 15) << 12 | (d[i2++] & 63) << 6 | d[i2++] & 63);
        }
      };
      var DecodeUTF8 = /* @__PURE__ */ (function() {
        function DecodeUTF82(cb) {
          this.ondata = cb;
          if (tds)
            this.t = new TextDecoder();
          else
            this.p = et;
        }
        DecodeUTF82.prototype.push = function(chunk, final) {
          if (!this.ondata)
            err(5);
          final = !!final;
          if (this.t) {
            this.ondata(this.t.decode(chunk, { stream: true }), final);
            if (final) {
              if (this.t.decode().length)
                err(8);
              this.t = null;
            }
            return;
          }
          if (!this.p)
            err(4);
          var dat = new u8(this.p.length + chunk.length);
          dat.set(this.p);
          dat.set(chunk, this.p.length);
          var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
          if (final) {
            if (r.length)
              err(8);
            this.p = null;
          } else
            this.p = r;
          this.ondata(s, final);
        };
        return DecodeUTF82;
      })();
      exports.DecodeUTF8 = DecodeUTF8;
      var EncodeUTF8 = /* @__PURE__ */ (function() {
        function EncodeUTF82(cb) {
          this.ondata = cb;
        }
        EncodeUTF82.prototype.push = function(chunk, final) {
          if (!this.ondata)
            err(5);
          if (this.d)
            err(4);
          this.ondata(strToU8(chunk), this.d = final || false);
        };
        return EncodeUTF82;
      })();
      exports.EncodeUTF8 = EncodeUTF8;
      function strToU8(str, latin1) {
        if (latin1) {
          var ar_1 = new u8(str.length);
          for (var i2 = 0; i2 < str.length; ++i2)
            ar_1[i2] = str.charCodeAt(i2);
          return ar_1;
        }
        if (te)
          return te.encode(str);
        var l = str.length;
        var ar = new u8(str.length + (str.length >> 1));
        var ai = 0;
        var w = function(v) {
          ar[ai++] = v;
        };
        for (var i2 = 0; i2 < l; ++i2) {
          if (ai + 5 > ar.length) {
            var n = new u8(ai + 8 + (l - i2 << 1));
            n.set(ar);
            ar = n;
          }
          var c = str.charCodeAt(i2);
          if (c < 128 || latin1)
            w(c);
          else if (c < 2048)
            w(192 | c >> 6), w(128 | c & 63);
          else if (c > 55295 && c < 57344)
            c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i2) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
          else
            w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
        }
        return slc(ar, 0, ai);
      }
      function strFromU8(dat, latin1) {
        if (latin1) {
          var r = "";
          for (var i2 = 0; i2 < dat.length; i2 += 16384)
            r += String.fromCharCode.apply(null, dat.subarray(i2, i2 + 16384));
          return r;
        } else if (td) {
          return td.decode(dat);
        } else {
          var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
          if (r.length)
            err(8);
          return s;
        }
      }
      var dbf = function(l) {
        return l == 1 ? 3 : l < 6 ? 2 : l == 9 ? 1 : 0;
      };
      var slzh = function(d, b) {
        return b + 30 + b2(d, b + 26) + b2(d, b + 28);
      };
      var zh = function(d, b, z) {
        var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
        var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
        return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off];
      };
      var z64hs = function(d, b, l, z, sc, su, off) {
        var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
        var nf = nsc + nsu + noff;
        if (z && nf) {
          for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
            if (b2(d, b) == 1) {
              return [
                nsc ? b8(d, b + 4 + 8 * nsu) : sc,
                nsu ? b8(d, b + 4) : su,
                noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
                1
              ];
            }
          }
          if (z < 2)
            err(13);
        }
        return [sc, su, off, 0];
      };
      var exfl = function(ex) {
        var le = 0;
        if (ex) {
          for (var k in ex) {
            var l = ex[k].length;
            if (l > 65535)
              err(9);
            le += l + 4;
          }
        }
        return le;
      };
      var wzh = function(d, b, f, fn, u, c, ce, co) {
        var fl2 = fn.length, ex = f.extra, col = co && co.length;
        var exl = exfl(ex);
        wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
        if (ce != null)
          d[b++] = 20, d[b++] = f.os;
        d[b] = 20, b += 2;
        d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
        d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
        var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
        if (y < 0 || y > 119)
          err(10);
        wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
        if (c != -1) {
          wbytes(d, b, f.crc);
          wbytes(d, b + 4, c < 0 ? -c - 2 : c);
          wbytes(d, b + 8, f.size);
        }
        wbytes(d, b + 12, fl2);
        wbytes(d, b + 14, exl), b += 16;
        if (ce != null) {
          wbytes(d, b, col);
          wbytes(d, b + 6, f.attrs);
          wbytes(d, b + 10, ce), b += 14;
        }
        d.set(fn, b);
        b += fl2;
        if (exl) {
          for (var k in ex) {
            var exf = ex[k], l = exf.length;
            wbytes(d, b, +k);
            wbytes(d, b + 2, l);
            d.set(exf, b + 4), b += 4 + l;
          }
        }
        if (col)
          d.set(co, b), b += col;
        return b;
      };
      var wzf = function(o, b, c, d, e) {
        wbytes(o, b, 101010256);
        wbytes(o, b + 8, c);
        wbytes(o, b + 10, c);
        wbytes(o, b + 12, d);
        wbytes(o, b + 16, e);
      };
      var ZipPassThrough = /* @__PURE__ */ (function() {
        function ZipPassThrough2(filename) {
          this.filename = filename;
          this.c = crc();
          this.size = 0;
          this.compression = 0;
        }
        ZipPassThrough2.prototype.process = function(chunk, final) {
          this.ondata(null, chunk, final);
        };
        ZipPassThrough2.prototype.push = function(chunk, final) {
          if (!this.ondata)
            err(5);
          this.c.p(chunk);
          this.size += chunk.length;
          if (final)
            this.crc = this.c.d();
          this.process(chunk, final || false);
        };
        return ZipPassThrough2;
      })();
      exports.ZipPassThrough = ZipPassThrough;
      var ZipDeflate = /* @__PURE__ */ (function() {
        function ZipDeflate2(filename, opts) {
          var _this = this;
          if (!opts)
            opts = {};
          ZipPassThrough.call(this, filename);
          this.d = new Deflate(opts, function(dat, final) {
            _this.ondata(null, dat, final);
          });
          this.compression = 8;
          this.flag = dbf(opts.level);
        }
        ZipDeflate2.prototype.process = function(chunk, final) {
          try {
            this.d.push(chunk, final);
          } catch (e) {
            this.ondata(e, null, final);
          }
        };
        ZipDeflate2.prototype.push = function(chunk, final) {
          ZipPassThrough.prototype.push.call(this, chunk, final);
        };
        return ZipDeflate2;
      })();
      exports.ZipDeflate = ZipDeflate;
      var AsyncZipDeflate = /* @__PURE__ */ (function() {
        function AsyncZipDeflate2(filename, opts) {
          var _this = this;
          if (!opts)
            opts = {};
          ZipPassThrough.call(this, filename);
          this.d = new AsyncDeflate(opts, function(err2, dat, final) {
            _this.ondata(err2, dat, final);
          });
          this.compression = 8;
          this.flag = dbf(opts.level);
          this.terminate = this.d.terminate;
        }
        AsyncZipDeflate2.prototype.process = function(chunk, final) {
          this.d.push(chunk, final);
        };
        AsyncZipDeflate2.prototype.push = function(chunk, final) {
          ZipPassThrough.prototype.push.call(this, chunk, final);
        };
        return AsyncZipDeflate2;
      })();
      exports.AsyncZipDeflate = AsyncZipDeflate;
      var Zip = /* @__PURE__ */ (function() {
        function Zip2(cb) {
          this.ondata = cb;
          this.u = [];
          this.d = 1;
        }
        Zip2.prototype.add = function(file) {
          var _this = this;
          if (!this.ondata)
            err(5);
          if (this.d & 2)
            this.ondata(err(4 + (this.d & 1) * 8, 0, 1), null, false);
          else {
            var f = strToU8(file.filename), fl_1 = f.length;
            var com = file.comment, o = com && strToU8(com);
            var u = fl_1 != file.filename.length || o && com.length != o.length;
            var hl_1 = fl_1 + exfl(file.extra) + 30;
            if (fl_1 > 65535)
              this.ondata(err(11, 0, 1), null, false);
            var header = new u8(hl_1);
            wzh(header, 0, file, f, u, -1);
            var chks_1 = [header];
            var pAll_1 = function() {
              for (var _i = 0, chks_2 = chks_1; _i < chks_2.length; _i++) {
                var chk = chks_2[_i];
                _this.ondata(null, chk, false);
              }
              chks_1 = [];
            };
            var tr_1 = this.d;
            this.d = 0;
            var ind_1 = this.u.length;
            var uf_1 = mrg(file, {
              f,
              u,
              o,
              t: function() {
                if (file.terminate)
                  file.terminate();
              },
              r: function() {
                pAll_1();
                if (tr_1) {
                  var nxt = _this.u[ind_1 + 1];
                  if (nxt)
                    nxt.r();
                  else
                    _this.d = 1;
                }
                tr_1 = 1;
              }
            });
            var cl_1 = 0;
            file.ondata = function(err2, dat, final) {
              if (err2) {
                _this.ondata(err2, dat, final);
                _this.terminate();
              } else {
                cl_1 += dat.length;
                chks_1.push(dat);
                if (final) {
                  var dd = new u8(16);
                  wbytes(dd, 0, 134695760);
                  wbytes(dd, 4, file.crc);
                  wbytes(dd, 8, cl_1);
                  wbytes(dd, 12, file.size);
                  chks_1.push(dd);
                  uf_1.c = cl_1, uf_1.b = hl_1 + cl_1 + 16, uf_1.crc = file.crc, uf_1.size = file.size;
                  if (tr_1)
                    uf_1.r();
                  tr_1 = 1;
                } else if (tr_1)
                  pAll_1();
              }
            };
            this.u.push(uf_1);
          }
        };
        Zip2.prototype.end = function() {
          var _this = this;
          if (this.d & 2) {
            this.ondata(err(4 + (this.d & 1) * 8, 0, 1), null, true);
            return;
          }
          if (this.d)
            this.e();
          else
            this.u.push({
              r: function() {
                if (!(_this.d & 1))
                  return;
                _this.u.splice(-1, 1);
                _this.e();
              },
              t: function() {
              }
            });
          this.d = 3;
        };
        Zip2.prototype.e = function() {
          var bt = 0, l = 0, tl = 0;
          for (var _i = 0, _a2 = this.u; _i < _a2.length; _i++) {
            var f = _a2[_i];
            tl += 46 + f.f.length + exfl(f.extra) + (f.o ? f.o.length : 0);
          }
          var out = new u8(tl + 22);
          for (var _b2 = 0, _c = this.u; _b2 < _c.length; _b2++) {
            var f = _c[_b2];
            wzh(out, bt, f, f.f, f.u, -f.c - 2, l, f.o);
            bt += 46 + f.f.length + exfl(f.extra) + (f.o ? f.o.length : 0), l += f.b;
          }
          wzf(out, bt, this.u.length, tl, l);
          this.ondata(null, out, true);
          this.d = 2;
        };
        Zip2.prototype.terminate = function() {
          for (var _i = 0, _a2 = this.u; _i < _a2.length; _i++) {
            var f = _a2[_i];
            f.t();
          }
          this.d = 2;
        };
        return Zip2;
      })();
      exports.Zip = Zip;
      function zip(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        var r = {};
        fltn(data, "", r, opts);
        var k = Object.keys(r);
        var lft = k.length, o = 0, tot = 0;
        var slft = lft, files = new Array(lft);
        var term = [];
        var tAll = function() {
          for (var i3 = 0; i3 < term.length; ++i3)
            term[i3]();
        };
        var cbd = function(a, b) {
          mt(function() {
            cb(a, b);
          });
        };
        mt(function() {
          cbd = cb;
        });
        var cbf = function() {
          var out = new u8(tot + 22), oe = o, cdl = tot - o;
          tot = 0;
          for (var i3 = 0; i3 < slft; ++i3) {
            var f = files[i3];
            try {
              var l = f.c.length;
              wzh(out, tot, f, f.f, f.u, l);
              var badd = 30 + f.f.length + exfl(f.extra);
              var loc = tot + badd;
              out.set(f.c, loc);
              wzh(out, o, f, f.f, f.u, l, tot, f.m), o += 16 + badd + (f.m ? f.m.length : 0), tot = loc + l;
            } catch (e) {
              return cbd(e, null);
            }
          }
          wzf(out, o, files.length, cdl, oe);
          cbd(null, out);
        };
        if (!lft)
          cbf();
        var _loop_1 = function(i3) {
          var fn = k[i3];
          var _a2 = r[fn], file = _a2[0], p = _a2[1];
          var c = crc(), size = file.length;
          c.p(file);
          var f = strToU8(fn), s = f.length;
          var com = p.comment, m = com && strToU8(com), ms = m && m.length;
          var exl = exfl(p.extra);
          var compression = p.level == 0 ? 0 : 8;
          var cbl = function(e, d) {
            if (e) {
              tAll();
              cbd(e, null);
            } else {
              var l = d.length;
              files[i3] = mrg(p, {
                size,
                crc: c.d(),
                c: d,
                f,
                m,
                u: s != fn.length || m && com.length != ms,
                compression
              });
              o += 30 + s + exl + l;
              tot += 76 + 2 * (s + exl) + (ms || 0) + l;
              if (!--lft)
                cbf();
            }
          };
          if (s > 65535)
            cbl(err(11, 0, 1), null);
          if (!compression)
            cbl(null, file);
          else if (size < 16e4) {
            try {
              cbl(null, deflateSync(file, p));
            } catch (e) {
              cbl(e, null);
            }
          } else
            term.push(deflate(file, p, cbl));
        };
        for (var i2 = 0; i2 < slft; ++i2) {
          _loop_1(i2);
        }
        return tAll;
      }
      function zipSync(data, opts) {
        if (!opts)
          opts = {};
        var r = {};
        var files = [];
        fltn(data, "", r, opts);
        var o = 0;
        var tot = 0;
        for (var fn in r) {
          var _a2 = r[fn], file = _a2[0], p = _a2[1];
          var compression = p.level == 0 ? 0 : 8;
          var f = strToU8(fn), s = f.length;
          var com = p.comment, m = com && strToU8(com), ms = m && m.length;
          var exl = exfl(p.extra);
          if (s > 65535)
            err(11);
          var d = compression ? deflateSync(file, p) : file, l = d.length;
          var c = crc();
          c.p(file);
          files.push(mrg(p, {
            size: file.length,
            crc: c.d(),
            c: d,
            f,
            m,
            u: s != fn.length || m && com.length != ms,
            o,
            compression
          }));
          o += 30 + s + exl + l;
          tot += 76 + 2 * (s + exl) + (ms || 0) + l;
        }
        var out = new u8(tot + 22), oe = o, cdl = tot - o;
        for (var i2 = 0; i2 < files.length; ++i2) {
          var f = files[i2];
          wzh(out, f.o, f, f.f, f.u, f.c.length);
          var badd = 30 + f.f.length + exfl(f.extra);
          out.set(f.c, f.o + badd);
          wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
        }
        wzf(out, o, files.length, cdl, oe);
        return out;
      }
      var UnzipPassThrough = /* @__PURE__ */ (function() {
        function UnzipPassThrough2() {
        }
        UnzipPassThrough2.prototype.push = function(chunk, final) {
          this.ondata(null, chunk, final);
        };
        UnzipPassThrough2.compression = 0;
        return UnzipPassThrough2;
      })();
      exports.UnzipPassThrough = UnzipPassThrough;
      var UnzipInflate = /* @__PURE__ */ (function() {
        function UnzipInflate2() {
          var _this = this;
          this.i = new Inflate(function(dat, final) {
            _this.ondata(null, dat, final);
          });
        }
        UnzipInflate2.prototype.push = function(chunk, final) {
          try {
            this.i.push(chunk, final);
          } catch (e) {
            this.ondata(e, null, final);
          }
        };
        UnzipInflate2.compression = 8;
        return UnzipInflate2;
      })();
      exports.UnzipInflate = UnzipInflate;
      var AsyncUnzipInflate = /* @__PURE__ */ (function() {
        function AsyncUnzipInflate2(_, sz) {
          var _this = this;
          if (sz < 32e4) {
            this.i = new Inflate(function(dat, final) {
              _this.ondata(null, dat, final);
            });
          } else {
            this.i = new AsyncInflate(function(err2, dat, final) {
              _this.ondata(err2, dat, final);
            });
            this.terminate = this.i.terminate;
          }
        }
        AsyncUnzipInflate2.prototype.push = function(chunk, final) {
          if (this.i.terminate)
            chunk = slc(chunk, 0);
          this.i.push(chunk, final);
        };
        AsyncUnzipInflate2.compression = 8;
        return AsyncUnzipInflate2;
      })();
      exports.AsyncUnzipInflate = AsyncUnzipInflate;
      var Unzip = /* @__PURE__ */ (function() {
        function Unzip2(cb) {
          this.onfile = cb;
          this.k = [];
          this.o = {
            0: UnzipPassThrough
          };
          this.p = et;
        }
        Unzip2.prototype.push = function(chunk, final) {
          var _this = this;
          if (!this.onfile)
            err(5);
          if (!this.p)
            err(4);
          if (this.c > 0) {
            var len = Math.min(this.c, chunk.length);
            var toAdd = chunk.subarray(0, len);
            this.c -= len;
            if (this.d)
              this.d.push(toAdd, !this.c);
            else
              this.k[0].push(toAdd);
            chunk = chunk.subarray(len);
            if (chunk.length)
              return this.push(chunk, final);
          } else {
            var f = 0, i2 = 0, is = void 0, buf = void 0;
            if (!this.p.length)
              buf = chunk;
            else if (!chunk.length)
              buf = this.p;
            else {
              buf = new u8(this.p.length + chunk.length);
              buf.set(this.p), buf.set(chunk, this.p.length);
            }
            var l = buf.length, oc = this.c, add = oc && this.d;
            var _loop_2 = function() {
              var sig = b4(buf, i2);
              if (sig == 67324752) {
                f = 1, is = i2;
                this_1.d = null;
                this_1.c = 0;
                var bf = b2(buf, i2 + 6), cmp_1 = b2(buf, i2 + 8), u = bf & 2048, dd = bf & 8, fnl = b2(buf, i2 + 26), es = b2(buf, i2 + 28);
                if (l > i2 + 30 + fnl + es) {
                  var chks_3 = [];
                  this_1.k.unshift(chks_3);
                  f = 2;
                  var lsc = b4(buf, i2 + 18), lsu = b4(buf, i2 + 22);
                  var fn_1 = strFromU8(buf.subarray(i2 + 30, i2 += 30 + fnl), !u);
                  var _a2 = z64hs(buf, i2, es, 2, lsc, lsu, 0), sc_1 = _a2[0], su_1 = _a2[1], z64 = _a2[3];
                  if (dd)
                    sc_1 = -1 - z64;
                  i2 += es;
                  this_1.c = sc_1;
                  var d_1;
                  var file_1 = {
                    name: fn_1,
                    compression: cmp_1,
                    start: function() {
                      if (!file_1.ondata)
                        err(5);
                      if (!sc_1)
                        file_1.ondata(null, et, true);
                      else {
                        var ctr = _this.o[cmp_1];
                        if (!ctr)
                          file_1.ondata(err(14, "unknown compression type " + cmp_1, 1), null, false);
                        d_1 = sc_1 < 0 ? new ctr(fn_1) : new ctr(fn_1, sc_1, su_1);
                        d_1.ondata = function(err2, dat3, final2) {
                          file_1.ondata(err2, dat3, final2);
                        };
                        for (var _i = 0, chks_4 = chks_3; _i < chks_4.length; _i++) {
                          var dat2 = chks_4[_i];
                          d_1.push(dat2, false);
                        }
                        if (_this.k[0] == chks_3 && _this.c)
                          _this.d = d_1;
                        else
                          d_1.push(et, true);
                      }
                    },
                    terminate: function() {
                      if (d_1 && d_1.terminate)
                        d_1.terminate();
                    }
                  };
                  if (sc_1 >= 0)
                    file_1.size = sc_1, file_1.originalSize = su_1;
                  this_1.onfile(file_1);
                }
                return "break";
              } else if (oc) {
                if (sig == 134695760) {
                  is = i2 += 12 + (oc == -2 && 8), f = 3, this_1.c = 0;
                  return "break";
                } else if (sig == 33639248) {
                  is = i2 -= 4, f = 3, this_1.c = 0;
                  return "break";
                }
              }
            };
            var this_1 = this;
            for (; i2 < l - 4; ++i2) {
              var state_1 = _loop_2();
              if (state_1 === "break")
                break;
            }
            this.p = et;
            if (oc < 0) {
              var dat = f ? buf.subarray(0, is - 12 - (oc == -2 && 8) - (b4(buf, is - 16) == 134695760 && 4)) : buf.subarray(0, i2);
              if (add)
                add.push(dat, !!f);
              else
                this.k[+(f == 2)].push(dat);
            }
            if (f & 2)
              return this.push(buf.subarray(i2), final);
            this.p = buf.subarray(i2);
          }
          if (final) {
            if (this.c)
              err(13);
            this.p = null;
          }
        };
        Unzip2.prototype.register = function(decoder) {
          this.o[decoder.compression] = decoder;
        };
        return Unzip2;
      })();
      exports.Unzip = Unzip;
      var mt = typeof queueMicrotask == "function" ? queueMicrotask : typeof setTimeout == "function" ? setTimeout : function(fn) {
        fn();
      };
      function unzip(data, opts, cb) {
        if (!cb)
          cb = opts, opts = {};
        if (typeof cb != "function")
          err(7);
        var term = [];
        var tAll = function() {
          for (var i3 = 0; i3 < term.length; ++i3)
            term[i3]();
        };
        var files = {};
        var cbd = function(a, b) {
          mt(function() {
            cb(a, b);
          });
        };
        mt(function() {
          cbd = cb;
        });
        var e = data.length - 22;
        for (; b4(data, e) != 101010256; --e) {
          if (!e || data.length - e > 65558) {
            cbd(err(13, 0, 1), null);
            return tAll;
          }
        }
        ;
        var lft = b2(data, e + 8);
        if (lft) {
          var c = lft;
          var o = b4(data, e + 16);
          var z = b4(data, e - 20) == 117853008;
          if (z) {
            var ze = b4(data, e - 12);
            z = b4(data, ze) == 101075792;
            if (z) {
              c = lft = b4(data, ze + 32);
              o = b4(data, ze + 48);
            }
          }
          var fltr = opts && opts.filter;
          var _loop_3 = function(i3) {
            var _a2 = zh(data, o, z), c_1 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
            o = no;
            var cbl = function(e2, d) {
              if (e2) {
                tAll();
                cbd(e2, null);
              } else {
                if (d)
                  files[fn] = d;
                if (!--lft)
                  cbd(null, files);
              }
            };
            if (!fltr || fltr({
              name: fn,
              size: sc,
              originalSize: su,
              compression: c_1
            })) {
              if (!c_1)
                cbl(null, slc(data, b, b + sc));
              else if (c_1 == 8) {
                var infl = data.subarray(b, b + sc);
                if (su < 524288 || sc > 0.8 * su) {
                  try {
                    cbl(null, inflateSync(infl, { out: new u8(su) }));
                  } catch (e2) {
                    cbl(e2, null);
                  }
                } else
                  term.push(inflate(infl, { size: su }, cbl));
              } else
                cbl(err(14, "unknown compression type " + c_1, 1), null);
            } else
              cbl(null, null);
          };
          for (var i2 = 0; i2 < c; ++i2) {
            _loop_3(i2);
          }
        } else
          cbd(null, {});
        return tAll;
      }
      function unzipSync(data, opts) {
        var files = {};
        var e = data.length - 22;
        for (; b4(data, e) != 101010256; --e) {
          if (!e || data.length - e > 65558)
            err(13);
        }
        ;
        var c = b2(data, e + 8);
        if (!c)
          return {};
        var o = b4(data, e + 16);
        var z = b4(data, e - 20) == 117853008;
        if (z) {
          var ze = b4(data, e - 12);
          z = b4(data, ze) == 101075792;
          if (z) {
            c = b4(data, ze + 32);
            o = b4(data, ze + 48);
          }
        }
        var fltr = opts && opts.filter;
        for (var i2 = 0; i2 < c; ++i2) {
          var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
          o = no;
          if (!fltr || fltr({
            name: fn,
            size: sc,
            originalSize: su,
            compression: c_2
          })) {
            if (!c_2)
              files[fn] = slc(data, b, b + sc);
            else if (c_2 == 8)
              files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
            else
              err(14, "unknown compression type " + c_2);
          }
        }
        return files;
      }
    }
  });

  // shim/adm-zip.js
  var require_adm_zip = __commonJS({
    "shim/adm-zip.js"(exports, module) {
      "use strict";
      var { unzipSync, zipSync } = require_browser();
      var fs2 = require_fs_vfs();
      var toBuf = (u8) => typeof Buffer !== "undefined" ? Buffer.from(u8.buffer, u8.byteOffset, u8.length) : u8;
      var AdmZip = class {
        constructor(source) {
          this._raw = null;
          this._meta = /* @__PURE__ */ new Map();
          this._added = /* @__PURE__ */ new Map();
          this._order = [];
          if (source !== void 0 && source !== null) {
            const bytes = typeof source === "string" ? fs2.readFileSync(source) : source;
            this._raw = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
            try {
              unzipSync(this._raw, { filter: (f) => {
                if (!f.name.endsWith("/")) {
                  this._meta.set(f.name, { size: f.originalSize });
                  this._order.push(f.name);
                }
                return false;
              } });
            } catch (e) {
              throw new Error("Arquivo zip inv\xE1lido: " + e.message);
            }
          }
        }
        _entry(name) {
          const added = this._added.get(name);
          const meta = this._meta.get(name);
          if (!added && !meta) return null;
          const self2 = this;
          return {
            entryName: name,
            isDirectory: false,
            header: { size: added ? added.length : meta.size },
            getData() {
              if (added) return toBuf(added);
              const out = unzipSync(self2._raw, { filter: (f) => f.name === name });
              if (!out[name]) throw new Error("entrada ausente: " + name);
              return toBuf(out[name]);
            }
          };
        }
        getEntry(name) {
          return this._entry(name);
        }
        getEntries() {
          return this._order.map((n) => this._entry(n));
        }
        addFile(name, data) {
          if (!this._order.includes(name)) this._order.push(name);
          this._added.set(name, data instanceof Uint8Array ? data : new Uint8Array(data));
        }
        updateFile(name, data) {
          if (!this._order.includes(name)) throw new Error("Entrada inexistente: " + name);
          this._added.set(name, data instanceof Uint8Array ? data : new Uint8Array(data));
        }
        toBuffer() {
          const files = {};
          let original = null;
          for (const n of this._order) {
            if (this._added.has(n)) files[n] = this._added.get(n);
            else {
              original = original || unzipSync(this._raw);
              files[n] = original[n];
            }
          }
          return toBuf(zipSync(files, { level: 6 }));
        }
        writeZip(target) {
          fs2.writeFileSync(target, this.toBuffer());
        }
      };
      module.exports = AdmZip;
    }
  });

  // ../core/services/revisao.js
  var require_revisao = __commonJS({
    "../core/services/revisao.js"(exports, module) {
      "use strict";
      var INTERVALS = [1, 7, 15, 30, 60, 120];
      var KEY = /^\d{4}-\d{2}-\d{2}$/;
      function dayKey(d = /* @__PURE__ */ new Date()) {
        const p = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
      }
      function addDays(key, n) {
        const [y, m, d] = key.split("-").map(Number);
        const t = new Date(Date.UTC(y, m - 1, d + n));
        return t.toISOString().slice(0, 10);
      }
      function diffDays(a, b) {
        const [ya, ma, da] = a.split("-").map(Number), [yb, mb, db] = b.split("-").map(Number);
        return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 864e5);
      }
      function sanitizeReview(r) {
        if (!r || typeof r !== "object") return null;
        if (!Number.isInteger(r.done) || r.done < 0) return null;
        if (typeof r.next !== "string" || !KEY.test(r.next)) return null;
        const last = typeof r.last === "string" && KEY.test(r.last) ? r.last : null;
        return { done: r.done, last, next: r.next };
      }
      function markReviewed(review, today) {
        const done = (review && Number.isInteger(review.done) ? review.done : 0) + 1;
        const step = INTERVALS[Math.min(done - 1, INTERVALS.length - 1)];
        return { done, last: today, next: addDays(today, step) };
      }
      function collectReviews(root, today, horizon = 7) {
        const due = [];
        const upcoming = Array.from({ length: horizon }, (_, i) => ({ date: addDays(today, i + 1), count: 0 }));
        const walk2 = (node, trail) => {
          const path2 = [...trail, node.title];
          const r = sanitizeReview(node.review);
          if (r) {
            const diff = diffDays(today, r.next);
            if (diff <= 0) due.push({ id: node.id, title: node.title, path: path2.join(" \u203A "), next: r.next, overdueDays: -diff });
            else {
              const slot = upcoming[diff - 1];
              if (slot) slot.count++;
            }
          }
          for (const c of node.children || []) walk2(c, path2);
        };
        walk2(root, []);
        const today_ = due.filter((d) => d.overdueDays === 0).length;
        const overdue = due.length - today_;
        return { due, counts: { today: today_, overdue, total: due.length }, upcoming };
      }
      function shouldNotify({ lastDay, today, total }) {
        return total > 0 && lastDay !== today;
      }
      function notificationText(today, overdue) {
        const r = (n) => n === 1 ? "revis\xE3o" : "revis\xF5es";
        const a = (n) => n === 1 ? "atrasada" : "atrasadas";
        if (today > 0 && overdue > 0) return `Hoje: ${today} ${r(today)}. Al\xE9m disso, ${overdue} ${a(overdue)}.`;
        if (today > 0) return `Hoje: ${today} ${r(today)}.`;
        return `${overdue} ${r(overdue)} ${a(overdue)}.`;
      }
      module.exports = { INTERVALS, dayKey, addDays, diffDays, sanitizeReview, markReviewed, collectReviews, shouldNotify, notificationText };
    }
  });

  // ../core/formats/mom.js
  var require_mom = __commonJS({
    "../core/formats/mom.js"(exports, module) {
      "use strict";
      var fs2 = require_fs_vfs();
      var AdmZip = require_adm_zip();
      var { MindMap, createNode, newId } = require_model();
      var { sanitizeStyle, sanitizeTheme, THEMES } = require_themes();
      var { convertTheme, convertNodeStyle, htmlToMarkdown, markdownToHtml } = require_mindomo();
      var { MARKERS } = require_markers();
      var { sanitizePdfs, sanitizeRefs } = require_pdfrefs();
      var { sanitizeReview } = require_revisao();
      var MAX_ENTRY_BYTES = 64 * 1024 * 1024;
      var MAX_NODES = 2e5;
      var MAX_DEPTH = 500;
      var SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
      var KNOWN_MC = /* @__PURE__ */ new Set(["markers", "progress", "style", "collapsed", "refs", "flow", "review"]);
      var FLOW_TYPES = ["start", "step", "decision", "end"];
      function sanitizeFlashcards(cards) {
        if (!Array.isArray(cards)) throw new Error("Arquivo .mom inv\xE1lido: flashcards devem estar em uma lista.");
        return cards.map((card, i) => {
          if (!card || typeof card !== "object" || Array.isArray(card) || typeof card.front !== "string" || typeof card.back !== "string") {
            throw new Error(`Arquivo .mom inv\xE1lido: flashcard ${i + 1} sem frente e verso de texto.`);
          }
          return { ...card };
        });
      }
      var stripTags = (s) => String(s ?? "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/?(?:b|i|u|em|strong|span|div|p|font|a)\b[^>]*>/gi, "");
      function readMom(source) {
        const zip = new AdmZip(source);
        const get = (name) => {
          const e = zip.getEntry(name);
          if (!e) return null;
          if (e.header.size > MAX_ENTRY_BYTES) throw new Error(`Arquivo .mom inv\xE1lido: "${name}" \xE9 grande demais.`);
          return JSON.parse(e.getData().toString("utf8"));
        };
        const doc = get("document.json");
        const nodes = get("nodes.json");
        if (!doc || typeof doc !== "object" || !Array.isArray(nodes)) throw new Error("Arquivo .mom inv\xE1lido: faltam document.json/nodes.json");
        if (nodes.length > MAX_NODES) throw new Error("Arquivo .mom inv\xE1lido: t\xF3picos demais.");
        const idMap = /* @__PURE__ */ new Map();
        const taken = /* @__PURE__ */ new Set();
        const mapId = (old) => {
          if (idMap.has(old)) return idMap.get(old);
          const nid = typeof old === "string" && SAFE_ID.test(old) && !taken.has(old) ? old : newId();
          taken.add(nid);
          idMap.set(old, nid);
          return nid;
        };
        const fromMindCraft = doc.mcWriter === "mindcraft";
        const clean = fromMindCraft ? (s) => String(s ?? "") : stripTags;
        const byId = /* @__PURE__ */ new Map();
        const dups = /* @__PURE__ */ new Set();
        for (const n of nodes) {
          if (!n || typeof n !== "object" || n.deleted || typeof n.id !== "string") continue;
          if (byId.has(mapId(n.id))) {
            dups.add(n);
            continue;
          }
          const { id, parentId, previousId, title, index, mc, ...raw } = n;
          const nid = mapId(id);
          const m = mc && typeof mc === "object" ? mc : {};
          const mcExtra = Object.fromEntries(Object.entries(m).filter(([k]) => !KNOWN_MC.has(k)));
          byId.set(nid, {
            node: createNode(clean(title), {
              id: nid,
              notes: clean(n.notes?.text ?? (typeof n.notes === "string" ? n.notes : !fromMindCraft && typeof n.description === "string" ? htmlToMarkdown(n.description) : "")),
              // extensões do MindCraft (campos próprios em "mc"), todas validadas
              markers: Array.isArray(m.markers) ? m.markers.filter((x) => typeof x === "string" && MARKERS[x]) : [],
              progress: Number.isFinite(m.progress) ? Math.min(100, Math.max(0, m.progress)) : null,
              style: fromMindCraft ? sanitizeStyle(m.style) : convertNodeStyle(n.style, n.titleStyle, title),
              collapsed: m.collapsed === true,
              ...Array.isArray(m.refs) && sanitizeRefs(m.refs).length ? { refs: sanitizeRefs(m.refs) } : {},
              ...sanitizeReview(m.review) ? { review: sanitizeReview(m.review) } : {},
              ...m.flow && FLOW_TYPES.includes(m.flow.type) ? { flowType: m.flow.type } : {},
              ...m.flow && typeof m.flow.branchLabel === "string" && m.flow.branchLabel ? { branchLabel: clean(m.flow.branchLabel).slice(0, 60) } : {},
              ...Object.keys(mcExtra).length ? { _mcExtra: mcExtra } : {}
            }),
            parentId: typeof parentId === "string" ? mapId(parentId) : null,
            index: Number.isFinite(index) ? index : 0,
            raw: { ...raw },
            prev: typeof previousId === "string" ? mapId(previousId) : null
          });
        }
        const kids = /* @__PURE__ */ new Map();
        for (const [id, e] of byId) {
          if (!e.parentId || !byId.has(e.parentId)) continue;
          if (!kids.has(e.parentId)) kids.set(e.parentId, []);
          kids.get(e.parentId).push(e);
          e.id = id;
        }
        for (const [pid, list] of kids) {
          list.sort((a, b) => a.index - b.index);
          byId.get(pid).node.children = list.map((e) => e.node);
        }
        const rootId = typeof doc.mapInfo?.rootId === "string" ? mapId(doc.mapInfo.rootId) : null;
        const rootEntry = byId.get(rootId) || [...byId.values()].find((e) => !e.parentId || !byId.has(e.parentId));
        if (!rootEntry) throw new Error("Mapa sem t\xF3pico raiz");
        const seen = /* @__PURE__ */ new Set();
        const prune = (n, depth) => {
          seen.add(n.id);
          n.children = n.children.filter((c) => !seen.has(c.id));
          if (depth >= MAX_DEPTH && n.children.length) throw new Error(`Arquivo .mom inv\xE1lido: mais de ${MAX_DEPTH} n\xEDveis de profundidade (o arquivo n\xE3o foi alterado).`);
          n.children.forEach((c) => prune(c, depth + 1));
        };
        prune(rootEntry.node, 0);
        for (const e of byId.values()) e.node._mom = e.raw;
        const themes = get("themes.json"), tid = typeof doc.mapInfo?.themeId === "string" ? doc.mapInfo.themeId : "";
        const custom = fromMindCraft ? sanitizeTheme(doc.mcCustomTheme) : convertTheme(themes, tid, doc.mapInfo?.name);
        const theme = doc.mcTheme === "custom" && custom ? "custom" : typeof doc.mcTheme === "string" && THEMES[doc.mcTheme] ? doc.mcTheme : !fromMindCraft && custom ? "custom" : "ocean";
        const map = new MindMap(rootEntry.node, { name: String(doc.mapInfo?.name || rootEntry.node.title), theme });
        map.meta._momDoc = doc;
        if (fromMindCraft && doc.mcFlashcards !== void 0) map.meta.flashcards = sanitizeFlashcards(doc.mcFlashcards);
        const shown = /* @__PURE__ */ new Set();
        (function walk2(n) {
          shown.add(n.id);
          n.children.forEach(walk2);
        })(rootEntry.node);
        const rawById = new Map(nodes.filter((n) => n && typeof n.id === "string").map((n) => [n.id, n]));
        const floatTops = /* @__PURE__ */ new Map(), floatIds = /* @__PURE__ */ new Set();
        for (const [id, e] of byId) {
          if (shown.has(id)) continue;
          let top = e;
          const climbed = /* @__PURE__ */ new Set([top.node.id]);
          while (top.parentId && byId.has(top.parentId) && !climbed.has(top.parentId)) {
            top = byId.get(top.parentId);
            climbed.add(top.node.id);
          }
          const rawParent = top.parentId ? rawById.get(top.parentId) : null;
          if (rawParent && !rawParent.deleted) continue;
          if (rawParent && rawParent.deleted) continue;
          if (!floatTops.has(top.node.id)) floatTops.set(top.node.id, top);
        }
        for (const top of floatTops.values()) (function walk2(n) {
          floatIds.add(n.id);
          n.children.forEach(walk2);
        })(top.node);
        if (floatTops.size) map.meta._momFloating = [...floatTops.values()].map((t) => ({ node: t.node, index: t.index, previousId: t.prev, parentId: t.parentId }));
        const hidden = nodes.filter((n) => {
          if (!n || typeof n !== "object") return false;
          if (typeof n.id !== "string") return true;
          if (dups.has(n)) return true;
          const mid = mapId(n.id);
          return !shown.has(mid) && !floatIds.has(mid);
        });
        if (hidden.length) map.meta._momHidden = hidden;
        if (custom) map.meta.customTheme = custom;
        if (themes && typeof themes === "object" && !Array.isArray(themes) && JSON.stringify(themes).length < 4e6) map.meta._momThemes = themes;
        if (Array.isArray(doc.mcPdfs) && sanitizePdfs(doc.mcPdfs).length) map.meta.pdfs = sanitizePdfs(doc.mcPdfs);
        const changes = get("changes.json");
        if (Array.isArray(changes)) map.meta._momChanges = changes;
        const momRel = get("relations.json");
        if (Array.isArray(momRel)) {
          map.meta._momRelations = momRel.filter((r) => r && typeof r.fromNodeId === "string" && typeof r.toNodeId === "string").map((r) => ({ ...r, fromNodeId: mapId(r.fromNodeId), toNodeId: mapId(r.toNodeId) }));
        }
        if (Array.isArray(doc.mcRelations)) {
          map.meta.relations = doc.mcRelations.filter((r) => r && typeof r.from === "string" && typeof r.to === "string" && seen.has(mapId(r.from)) && seen.has(mapId(r.to)) && mapId(r.from) !== mapId(r.to)).map((r) => ({
            id: typeof r.id === "string" && SAFE_ID.test(r.id) ? r.id : newId(),
            from: mapId(r.from),
            to: mapId(r.to),
            label: String(r.label ?? "").slice(0, 200),
            ...typeof r.color === "string" && /^#[0-9a-fA-F]{6}$/.test(r.color) ? { color: r.color } : {},
            ...typeof r.style === "string" && ["solid", "dashed", "dotted"].includes(r.style) ? { style: r.style } : {}
          }));
        }
        return map;
      }
      function writeMom(map, target) {
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const list = [];
        const visit = (node, parentId, previousId, index) => {
          const raw = node._mom || {};
          const hasStyle = node.style && Object.keys(node.style).length;
          const hasExtra = !!(node._mcExtra && Object.keys(node._mcExtra).length);
          const hasFlow = node.flowType && node.flowType !== "step" || !!node.branchLabel;
          const hasReview = !!sanitizeReview(node.review);
          const hasMc = (node.markers || []).length || node.progress != null || hasStyle || node.collapsed || node.refs && node.refs.length || hasExtra || hasFlow || hasReview;
          list.push({
            version: 40,
            ...raw,
            id: node.id,
            originalId: node.id,
            ...parentId ? { parentId } : {},
            ...previousId ? { previousId } : {},
            title: node.title,
            index,
            creationDate: raw.creationDate || now,
            modificationDate: now,
            style: raw.style || { valign: 32e3, halign: 32e3, orientation: parentId ? 0 : 101 },
            creatorId: raw.creatorId ?? 4,
            ...node.notes ? { notes: { text: node.notes } } : {},
            // notas do Mindomo (HTML): só reescreve se o texto mudou aqui; senão o HTML original segue intacto
            ...typeof raw.description === "string" && node.notes !== htmlToMarkdown(raw.description) ? { description: node.notes ? markdownToHtml(node.notes) : "" } : {},
            ...hasMc ? { mc: {
              ...hasExtra ? node._mcExtra : {},
              markers: node.markers || [],
              progress: node.progress,
              ...hasStyle ? { style: node.style } : {},
              ...node.collapsed ? { collapsed: true } : {},
              ...node.refs && node.refs.length ? { refs: node.refs } : {},
              ...hasReview ? { review: sanitizeReview(node.review) } : {},
              ...hasFlow ? { flow: { type: node.flowType || "step", ...node.branchLabel ? { branchLabel: node.branchLabel } : {} } } : {}
            } } : {}
          });
          let prev = null;
          node.children.forEach((c, i) => {
            visit(c, node.id, prev, i);
            prev = c.id;
          });
        };
        visit(map.root, null, null, 0);
        for (const f of map.meta._momFloating || []) visit(f.node, f.parentId || null, f.previousId || null, Number.isFinite(f.index) ? f.index : 0);
        for (const raw of map.meta._momHidden || []) list.push(raw);
        const doc = map.meta._momDoc || {
          version: 40,
          mapInfo: {
            id: newId(),
            name: map.meta.name || map.root.title,
            type: 0,
            mapType: 0,
            creationDate: now,
            rootId: map.root.id,
            themeId: "",
            style: {},
            template: {},
            creator: { userId: 4, userName: "Guest", firstName: "Guest", lastName: "" }
          },
          mapUsers: { 4: { userId: 4, userName: "Guest", firstName: "Guest", lastName: "" } }
        };
        doc.mcWriter = "mindcraft";
        doc.mcRelations = map.meta.relations || [];
        if (Array.isArray(map.meta.flashcards)) doc.mcFlashcards = sanitizeFlashcards(map.meta.flashcards);
        doc.mcTheme = map.meta.theme || "ocean";
        if (map.meta.customTheme) doc.mcCustomTheme = map.meta.customTheme;
        else delete doc.mcCustomTheme;
        if (map.meta.pdfs && map.meta.pdfs.length) doc.mcPdfs = map.meta.pdfs;
        else delete doc.mcPdfs;
        doc.mapInfo.name = map.meta.name || map.root.title;
        doc.mapInfo.rootId = map.root.id;
        doc.mapInfo.modificationDate = now;
        const zip = new AdmZip();
        zip.addFile("themes.json", Buffer.from(JSON.stringify(map.meta._momThemes || {})));
        zip.addFile("document.json", Buffer.from(JSON.stringify(doc)));
        zip.addFile("nodes.json", Buffer.from(JSON.stringify(list)));
        zip.addFile("changes.json", Buffer.from(JSON.stringify(map.meta._momChanges || [])));
        if (Array.isArray(map.meta._momRelations)) {
          const ids = new Set(list.map((x) => x.id));
          const rel = map.meta._momRelations.filter((r) => ids.has(r.fromNodeId) && ids.has(r.toNodeId));
          if (rel.length) zip.addFile("relations.json", Buffer.from(JSON.stringify(rel)));
        }
        zip.addFile("Document.xml", Buffer.from('<mo:map xmlns:mo="http://schemas.mindomo.com/application/version-4.4"></mo:map>'));
        const buf = zip.toBuffer();
        if (target) {
          const tmp = target + ".tmp-" + process.pid;
          try {
            fs2.writeFileSync(tmp, buf);
            fs2.renameSync(tmp, target);
          } catch (e) {
            try {
              fs2.rmSync(tmp, { force: true });
            } catch {
            }
            throw e;
          }
        }
        return buf;
      }
      module.exports = { readMom, writeMom };
    }
  });

  // ../core/formats/study-export.js
  var require_study_export = __commonJS({
    "../core/formats/study-export.js"(exports, module) {
      "use strict";
      var { parseLinks } = require_links();
      var { mdToHtml } = require_markdown();
      var { MARKERS } = require_markers();
      var { escapeHtml: esc } = require_text();
      var { printCss, weightClass } = require_print_style();
      var WEIGHT = { p1: 3, p2: 2, p3: 1 };
      var DEFAULTS = { notes: true, sources: true, links: true, byWeight: true, maxDepth: Infinity, bw: false };
      var weightOf = (n) => Math.max(0, ...(n.markers || []).map((m) => WEIGHT[m] || 0));
      function orderChildren(children, byWeight) {
        return byWeight ? [...children].sort((a, b) => weightOf(b) - weightOf(a)) : children;
      }
      function buildStudyDoc(map, opts = {}) {
        const o = { ...DEFAULTS, ...opts };
        const pdfs = map.meta.pdfs || [];
        const pdfById = new Map(pdfs.map((p) => [p.id, p]));
        const titleOf = /* @__PURE__ */ new Map();
        const roots = [map.root, ...(map.meta._momFloating || []).map((f) => f.node)];
        for (const r of roots) (function walk2(n) {
          titleOf.set(n.id, n.title);
          n.children.forEach(walk2);
        })(r);
        const relOut = /* @__PURE__ */ new Map(), relIn = /* @__PURE__ */ new Map();
        for (const r of map.meta.relations || []) {
          if (!relOut.has(r.from)) relOut.set(r.from, []);
          if (!relIn.has(r.to)) relIn.set(r.to, []);
          relOut.get(r.from).push({ to: r.to, label: r.label || "" });
          relIn.get(r.to).push({ from: r.from, label: r.label || "" });
        }
        const usage = /* @__PURE__ */ new Map();
        const visit = (node, depth, num) => {
          const ref = (node.refs || []).map((r) => {
            const p = pdfById.get(r.pdf);
            const name = p ? p.name : "PDF removido";
            usage.set(name, (usage.get(name) || 0) + 1);
            return { pdf: name, page: r.page, quote: String(r.quote || "").slice(0, 400) };
          });
          const links = { out: [], in: [], text: [] };
          if (o.links) {
            for (const r of relOut.get(node.id) || []) links.out.push({ title: titleOf.get(r.to) || "(t\xF3pico removido)", label: r.label });
            for (const r of relIn.get(node.id) || []) links.in.push({ title: titleOf.get(r.from) || "(t\xF3pico removido)", label: r.label });
            for (const l of parseLinks(node.notes || "")) links.text.push(l.map ? `${l.map}#${l.topic || ""}` : l.topic || "");
          }
          const item = {
            num,
            title: node.title,
            depth,
            weight: weightOf(node),
            priority: (node.markers || []).find((m) => WEIGHT[m]) || null,
            progress: node.progress ?? null,
            notes: o.notes ? (node.notes || "").trim() : "",
            generated: o.generated && o.generated.get(node.id) || [],
            sources: o.sources ? ref : [],
            links: o.links ? links : { out: [], in: [], text: [] },
            children: []
          };
          if (depth < o.maxDepth) orderChildren(node.children, o.byWeight).forEach((c, i) => item.children.push(visit(c, depth + 1, `${num}.${i + 1}`)));
          return item;
        };
        const topics = [visit(map.root, 1, "1")];
        (map.meta._momFloating || []).forEach((f, i) => topics.push(visit(f.node, 1, `S${i + 1}`)));
        const sources = pdfs.map((p) => ({ name: p.name, uses: usage.get(p.name) || 0 }));
        return { title: map.meta.name || map.root.title, date: (/* @__PURE__ */ new Date()).toLocaleDateString("pt-BR"), count: countItems(topics), topics, sources, options: o };
      }
      var countItems = (list) => list.reduce((n, t) => n + 1 + countItems(t.children), 0);
      function walkItems(list, fn) {
        for (const t of list) {
          fn(t);
          walkItems(t.children, fn);
        }
      }
      function toMarkdown(doc) {
        const out = [`# ${doc.title}`, "", `Material de estudo \xB7 ${doc.date} \xB7 ${doc.count} t\xF3pico(s)`, ""];
        out.push("## Sum\xE1rio", "");
        walkItems(doc.topics, (t) => out.push(`${"  ".repeat(t.depth - 1)}- ${t.num} ${t.title}${t.priority ? ` (prioridade ${t.priority.slice(1)})` : ""}`));
        out.push("");
        const body = (t) => {
          out.push(`${"#".repeat(Math.min(t.depth + 1, 6))} ${t.num} ${t.title}${t.priority ? ` \xB7 prioridade ${t.priority.slice(1)}` : ""}`, "");
          if (t.progress !== null) out.push(`*Progresso: ${t.progress}%*`, "");
          if (t.notes) out.push(t.notes, "");
          else if (t.generated.length) {
            out.push("*Texto de revis\xE3o gerado pela IA (revise antes de usar):*", "");
            for (const p of t.generated) out.push(p, "");
          }
          for (const s of t.sources) out.push(`> Fonte: ${s.pdf}, p. ${s.page}${s.quote ? ` \u2014 \u201C${s.quote}\u201D` : ""}`, "");
          const c = t.links;
          if (c.out.length || c.in.length || c.text.length) {
            for (const l of c.out) out.push(`- Liga a: **${l.title}**${l.label ? ` (${l.label})` : ""}`);
            for (const l of c.in) out.push(`- Ligado por: **${l.title}**${l.label ? ` (${l.label})` : ""}`);
            for (const l of c.text) out.push(`- Link no texto: [[${l}]]`);
            out.push("");
          }
          t.children.forEach(body);
        };
        doc.topics.forEach(body);
        if (doc.options.sources && doc.sources.length) {
          out.push("## Fontes", "");
          for (const s of doc.sources) out.push(`- ${s.name}${s.uses ? ` (${s.uses} trecho(s) citado(s))` : ""}`);
          out.push("");
        }
        return out.join("\n");
      }
      var PRIORITY_COLOR = (p, bw) => bw ? "#222" : (MARKERS[p] || {}).color || "#666";
      function toHtml(doc) {
        const sec = (t) => {
          const h = Math.min(t.depth + 1, 5);
          const badge = t.priority ? `<span class="pri" style="background:${PRIORITY_COLOR(t.priority, doc.options.bw)}">P${esc(t.priority.slice(1))}</span>` : "";
          const parts = [`<section class="topic d${t.depth} ${weightClass(t.priority)}"><h${h}><span class="num">${esc(t.num)}</span> ${esc(t.title)} ${badge}</h${h}>`];
          if (t.progress !== null) parts.push(`<p class="meta">Progresso ${esc(String(t.progress))}%</p>`);
          if (t.notes) parts.push(`<div class="notes">${mdToHtml(t.notes)}</div>`);
          else if (t.generated.length) parts.push(`<div class="notes ai"><p class="ai-note">Texto de revis\xE3o gerado pela IA (revise antes de usar)</p>${t.generated.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`);
          for (const s of t.sources) parts.push(`<p class="src">Fonte: ${esc(s.pdf)}, p. ${esc(String(s.page))}${s.quote ? ` \u2014 \u201C${esc(s.quote)}\u201D` : ""}</p>`);
          const c = t.links;
          if (c.out.length || c.in.length || c.text.length) {
            parts.push('<ul class="links">');
            for (const l of c.out) parts.push(`<li>Liga a <b>${esc(l.title)}</b>${l.label ? ` (${esc(l.label)})` : ""}</li>`);
            for (const l of c.in) parts.push(`<li>Ligado por <b>${esc(l.title)}</b>${l.label ? ` (${esc(l.label)})` : ""}</li>`);
            for (const l of c.text) parts.push(`<li>Link no texto <code>[[${esc(l)}]]</code></li>`);
            parts.push("</ul>");
          }
          parts.push(...t.children.map(sec), "</section>");
          return parts.join("");
        };
        const toc = [];
        walkItems(doc.topics, (t) => toc.push(`<li class="l${t.depth}"><span class="num">${esc(t.num)}</span> ${esc(t.title)}</li>`));
        const srcs = doc.options.sources && doc.sources.length ? `<section class="sources"><h2>Fontes</h2><ul>${doc.sources.map((s) => `<li>${esc(s.name)}${s.uses ? ` (${s.uses} trecho(s))` : ""}</li>`).join("")}</ul></section>` : "";
        return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(doc.title)}</title><style>${printCss(`
    .toc { list-style: none; padding: 0; columns: 2; column-gap: 7mm; font-size: 9pt; margin: 0 0 2mm; }
    .toc li { break-inside: avoid; padding: 0; margin: 0; }
    /* sum\xE1rio nivelado \xE0 esquerda: o n\xFAmero (1.1.2) j\xE1 mostra a hierarquia, sem recuo crescente */
    .toc .l3, .toc .l4, .toc .l5, .toc .l6 { color: #444; }
    .topic { margin-top: 1.5mm; }
    /* t\xF3picos filhos: sem recuo acumulado; a hierarquia aparece pelo t\xEDtulo e pelo n\xFAmero */
    .topic .topic { margin-left: 0; padding-left: 0; border-left: 0; }
    section.sources { margin-top: 4mm; break-before: auto; }
    .sources ul { font-size: 9pt; margin: 0 0 0 4mm; padding: 0; }
`)}</style></head><body>
    <h1>${esc(doc.title)}</h1><p class="sub">Material de estudo \xB7 ${esc(doc.date)} \xB7 ${doc.count} t\xF3pico(s)</p>
    <h2>Sum\xE1rio</h2><ul class="toc">${toc.join("")}</ul>
    <div class="cols">${doc.topics.map(sec).join("")}</div>
    ${srcs}
  </body></html>`;
      }
      module.exports = { buildStudyDoc, toMarkdown, toHtml, weightOf, orderChildren, DEFAULTS };
    }
  });

  // ../core/services/backup.js
  var require_backup = __commonJS({
    "../core/services/backup.js"(exports, module) {
      "use strict";
      var fs2 = require_fs_vfs();
      var path2 = require_path();
      var crypto = require_crypto();
      var keyOf = (target) => crypto.createHash("sha1").update(path2.resolve(target).toLowerCase()).digest("hex").slice(0, 12);
      var backupDirFor = (root, target) => path2.join(root, keyOf(target));
      function listBackups(dir) {
        let names;
        try {
          names = fs2.readdirSync(dir);
        } catch {
          return [];
        }
        return names.filter((n) => /\.mom$/i.test(n)).map((n) => {
          const file = path2.join(dir, n), st = fs2.statSync(file);
          return { file, name: n, mtimeMs: st.mtimeMs, size: st.size };
        }).sort((a, b) => b.mtimeMs - a.mtimeMs || b.name.localeCompare(a.name));
      }
      function backupBefore(target, root, { keep = 30, minIntervalMs = 10 * 60 * 1e3, now = Date.now() } = {}) {
        if (!target || !fs2.existsSync(target)) return null;
        const st = fs2.statSync(target);
        if (!st.isFile() || st.size === 0) return null;
        const dir = backupDirFor(root, target);
        fs2.mkdirSync(dir, { recursive: true });
        const list = listBackups(dir);
        if (list[0] && now - list[0].mtimeMs < minIntervalMs) return null;
        const stamp = new Date(now).toISOString().replace(/[:.]/g, "-").slice(0, 19);
        const base = path2.basename(target, path2.extname(target)).replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").slice(0, 60) || "mapa";
        const dest = path2.join(dir, `${base} \u2014 ${stamp}.mom`);
        fs2.copyFileSync(target, dest);
        fs2.utimesSync(dest, new Date(now), new Date(now));
        fs2.writeFileSync(path2.join(dir, "origem.txt"), path2.resolve(target));
        for (const old of listBackups(dir).slice(keep)) fs2.rmSync(old.file, { force: true });
        return dest;
      }
      module.exports = { backupBefore, backupDirFor, listBackups };
    }
  });

  // ../core/services/errorlog.js
  var require_errorlog = __commonJS({
    "../core/services/errorlog.js"(exports, module) {
      "use strict";
      var fs2 = require_fs_vfs();
      var path2 = require_path();
      function logError(dir, message, { max = 512 * 1024, now = /* @__PURE__ */ new Date() } = {}) {
        try {
          fs2.mkdirSync(dir, { recursive: true });
          const file = path2.join(dir, "erros.log");
          if (fs2.existsSync(file) && fs2.statSync(file).size > max) {
            const buf = fs2.readFileSync(file);
            const tail = buf.subarray(Math.floor(buf.length / 2));
            const nl = tail.indexOf(10);
            fs2.writeFileSync(file, nl >= 0 ? tail.subarray(nl + 1) : tail);
          }
          fs2.appendFileSync(file, `${now.toISOString()}	${String(message).replace(/\s+/g, " ").slice(0, 2e3)}
`);
          return true;
        } catch {
          return false;
        }
      }
      module.exports = { logError };
    }
  });

  // ../core/services/obsidian.js
  var require_obsidian = __commonJS({
    "../core/services/obsidian.js"(exports, module) {
      "use strict";
      var { buildGraph } = require_graph();
      var { norm, rewriteLinks, plainLinks } = require_links();
      var FOLDER = "MindCraft";
      var ID_KEY = "mindcraft-id";
      var HASH_KEY = "mindcraft-hash";
      var RESERVED = /^(con|prn|aux|nul|com\d|lpt\d)$/i;
      function fingerprint(s) {
        let h = 2166136261;
        for (let i = 0; i < s.length; i++) {
          h ^= s.charCodeAt(i);
          h = Math.imul(h, 16777619);
        }
        return (h >>> 0).toString(16).padStart(8, "0") + s.length.toString(16);
      }
      function safeName(s, fallback = "Sem t\xEDtulo", max = 80) {
        let t = String(s ?? "").replace(/[\\/:*?"<>|#^[\]\u0000-\u001f]/g, " ").replace(/\s+/g, " ").replace(/^[.\s]+|[.\s]+$/g, "").slice(0, max).trim();
        if (!t) t = fallback;
        if (RESERVED.test(t)) t += " (nota)";
        return t;
      }
      var aliasText = (s) => String(s ?? "").replace(/[[\]|]/g, " ").replace(/\s+/g, " ").trim();
      function unique(name, used) {
        let cand = name, i = 2;
        while (used.has(cand.toLowerCase())) cand = `${name} (${i++})`;
        used.add(cand.toLowerCase());
        return cand;
      }
      function walkTopics(map, fn) {
        const visit = (node, parent) => {
          fn(node, parent);
          for (const c of node.children) visit(c, node);
        };
        visit(map.root, null);
        for (const f of map.meta._momFloating || []) visit(f.node, null);
      }
      function buildObsidianVault(maps, { folder = FOLDER } = {}) {
        const g = buildGraph(maps, { hierarchy: true });
        const usedFolders = /* @__PURE__ */ new Set();
        const folderOf = /* @__PURE__ */ new Map();
        for (const m of maps) folderOf.set(m.key, unique(safeName(plainLinks(m.name), "Mapa", 50), usedFolders));
        const pathOf = /* @__PURE__ */ new Map();
        const topics = [];
        for (const m of maps) {
          const used = /* @__PURE__ */ new Set();
          walkTopics(m.map, (n, parent) => {
            const id = `${m.key}::${n.id}`;
            const rel = `${folder}/${folderOf.get(m.key)}/${unique(safeName(plainLinks(n.title)), used)}`;
            pathOf.set(id, rel);
            topics.push({ m, n, id, parentId: parent ? `${m.key}::${parent.id}` : null });
          });
        }
        const notesOf = new Map(topics.map((t) => [t.id, String(t.n.notes || "")]));
        const headingCount = { missing: 0 };
        const hasHeading = (id, heading) => {
          const want = norm(heading);
          for (const line of (notesOf.get(id) || "").split("\n")) {
            const h = /^#{1,6}\s+(.+?)\s*#*\s*$/.exec(line);
            if (h && norm(h[1]) === want) return true;
          }
          return false;
        };
        const headingText = (h) => String(h ?? "").replace(/[[\]|^]/g, " ").replace(/\s+/g, " ").trim();
        const wiki = (id, alias, heading = null) => {
          const node = g.byId.get(id);
          if (!node) return `[[${safeName(alias)}]]`;
          if (node.kind === "ghost") return `[[${safeName(node.title)}|${aliasText(alias || node.title)}]]`;
          const shown = aliasText(alias || plainLinks(node.title)) || "Sem t\xEDtulo";
          let sec = "";
          if (heading) {
            if (hasHeading(id, heading)) sec = "#" + headingText(heading);
            else headingCount.missing++;
          }
          return `[[${pathOf.get(id)}${sec}|${shown}]]`;
        };
        const childrenOf = /* @__PURE__ */ new Map(), relOut = /* @__PURE__ */ new Map(), relIn = /* @__PURE__ */ new Map();
        for (const e of g.edges) {
          if (e.type === "hierarchy") {
            if (!childrenOf.has(e.from)) childrenOf.set(e.from, []);
            childrenOf.get(e.from).push(e.to);
          }
          if (e.type === "relation") {
            if (!relOut.has(e.from)) relOut.set(e.from, []);
            relOut.get(e.from).push(e);
            if (!relIn.has(e.to)) relIn.set(e.to, []);
            relIn.get(e.to).push(e);
          }
        }
        const parentOf = /* @__PURE__ */ new Map();
        for (const [p, kids] of childrenOf) for (const k of kids) parentOf.set(k, p);
        const files = [];
        let ghostCount = 0, ambiguous = 0;
        for (const { m, n, id, parentId } of topics) {
          const title = aliasText(plainLinks(n.title)) || "Sem t\xEDtulo";
          const notes = rewriteLinks(n.notes || "", (lk) => {
            const r = g.resolveLink(lk, m.key);
            if (!r) return null;
            if (r.ambiguous) ambiguous++;
            const ghost = g.byId.get(r.id)?.kind === "ghost";
            const shown = lk.alias || (r.heading || ghost ? lk.typed : lk.topic || lk.map);
            return wiki(r.id, shown, r.heading);
          }).trim();
          const sec = [];
          const parent = parentOf.get(id) ?? parentId;
          if (parent && g.byId.has(parent)) sec.push(`Parte de: ${wiki(parent)}`);
          const kids = childrenOf.get(id) || [];
          if (kids.length) sec.push("", "## Subt\xF3picos", ...kids.map((k) => `- ${wiki(k)}`));
          const rels = [...(relOut.get(id) || []).map((e) => `- \u2192 ${e.label ? e.label + " " : ""}${wiki(e.to)}`), ...(relIn.get(id) || []).map((e) => `- \u2190 ${e.label ? e.label + " " : ""}${wiki(e.from)}`)];
          if (rels.length) sec.push("", "## Rela\xE7\xF5es", ...rels);
          const bodyParts = [`# ${title}`];
          if (notes) bodyParts.push("", notes);
          if (sec.length) bodyParts.push("", "---", ...sec);
          const body = bodyParts.join("\n") + "\n";
          const fm = ["---", `${ID_KEY}: ${JSON.stringify(`${m.name}::${n.id}`)}`, `mapa: ${JSON.stringify(m.name)}`];
          if (n.progress != null && Number.isFinite(Number(n.progress))) fm.push(`progresso: ${Number(n.progress)}`);
          const prog = Number(n.progress);
          const tags = ["mindcraft"];
          if (Number.isFinite(prog)) {
            if (prog >= 100) tags.push("concluido");
            else tags.push("revisar");
            if (prog <= 25) tags.push("prioridade-alta");
          } else tags.push("revisar");
          fm.push("aliases:", `  - ${JSON.stringify(title)}`, "tags:", ...tags.map((t) => `  - ${t}`));
          const base = fm.join("\n") + "\n---\n" + body;
          const content = [...fm, `${HASH_KEY}: ${JSON.stringify(fingerprint(base))}`].join("\n") + "\n---\n" + body;
          files.push({ path: `${pathOf.get(id)}.md`, content });
        }
        for (const node of g.nodes) if (node.kind === "ghost") ghostCount++;
        const links = files.reduce((acc, f) => acc + (f.content.match(/\[\[/g) || []).length, 0);
        return { files, stats: { maps: maps.length, notes: files.length, links, ghosts: ghostCount, ambiguous, headingsMissing: headingCount.missing } };
      }
      module.exports = { buildObsidianVault, safeName, fingerprint, FOLDER, ID_KEY, HASH_KEY };
      function obsidianOpenUrl(vaultDir) {
        const dir = String(vaultDir || "").trim();
        if (!dir) throw new Error("Escolha primeiro a pasta do vault do Obsidian.");
        return `obsidian://open?path=${encodeURIComponent(dir)}`;
      }
      module.exports.obsidianOpenUrl = obsidianOpenUrl;
    }
  });

  // ../core/services/obsidian-import.js
  var require_obsidian_import = __commonJS({
    "../core/services/obsidian-import.js"(exports, module) {
      "use strict";
      var fs2 = require_fs_vfs();
      var path2 = require_path();
      var { fingerprint, ID_KEY, HASH_KEY } = require_obsidian();
      function readOurs(text) {
        const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
        if (!m || !new RegExp(`^${ID_KEY}: `, "m").test(m[1])) return null;
        const hashM = new RegExp(`^${HASH_KEY}: (.*)$`, "m").exec(m[1]);
        const storedHash = hashM ? (function(s) {
          try {
            return JSON.parse(s);
          } catch {
            return null;
          }
        })(hashM[1]) : null;
        const stripped = text.replace(new RegExp(`^${HASH_KEY}: .*\\n`, "m"), "");
        const edited = !storedHash || fingerprint(stripped) !== storedHash;
        const idM = new RegExp(`^${ID_KEY}: (.*)$`, "m").exec(m[1]);
        const id = idM ? (function(s) {
          try {
            return JSON.parse(s);
          } catch {
            return null;
          }
        })(idM[1]) : null;
        const bodyM = /^---\n[\s\S]*?\n---\n([\s\S]*)$/.exec(text);
        const body = bodyM ? bodyM[1].trim() : "";
        return { edited, id, body, storedHash };
      }
      function detectEditedNotes(vaultDir, folder = "MindCraft") {
        const base = path2.join(vaultDir, folder);
        const result = [];
        const walk2 = (d) => {
          let items;
          try {
            items = fs2.readdirSync(d, { withFileTypes: true });
          } catch {
            return;
          }
          for (const it of items) {
            const full = path2.join(d, it.name);
            if (it.isDirectory()) walk2(full);
            else if (it.isFile() && /\.md$/i.test(it.name)) {
              try {
                const text = fs2.readFileSync(full, "utf8");
                const ours = readOurs(text);
                if (ours && ours.edited) {
                  result.push({ path: path2.relative(vaultDir, full), id: ours.id, body: ours.body, fullPath: full });
                }
              } catch {
              }
            }
          }
        };
        walk2(base);
        return result;
      }
      module.exports = { detectEditedNotes, readOurs };
    }
  });

  // ../core/services/obsidian-write.js
  var require_obsidian_write = __commonJS({
    "../core/services/obsidian-write.js"(exports, module) {
      "use strict";
      var fs2 = require_fs_vfs();
      var path2 = require_path();
      var { fingerprint, ID_KEY, HASH_KEY, FOLDER } = require_obsidian();
      var HASH_LINE = new RegExp(`^${HASH_KEY}: .*\\n`, "m");
      function readOurs(text) {
        const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
        if (!m || !new RegExp(`^${ID_KEY}: `, "m").test(m[1])) return null;
        const hashM = new RegExp(`^${HASH_KEY}: (.*)$`, "m").exec(m[1]);
        const storedHash = hashM ? safeJson(hashM[1]) : null;
        const stripped = text.replace(HASH_LINE, "");
        const edited = !storedHash || fingerprint(stripped) !== storedHash;
        return { edited };
      }
      function safeJson(s) {
        try {
          return JSON.parse(s);
        } catch {
          return null;
        }
      }
      function listOurs(dir) {
        const out = [];
        const walk2 = (d) => {
          let items;
          try {
            items = fs2.readdirSync(d, { withFileTypes: true });
          } catch {
            return;
          }
          for (const it of items) {
            const full = path2.join(d, it.name);
            if (it.isDirectory()) walk2(full);
            else if (it.isFile() && /\.md$/i.test(it.name)) out.push(full);
          }
        };
        walk2(dir);
        return out;
      }
      function writeObsidianVault(vaultDir, files, { folder = FOLDER } = {}) {
        if (!vaultDir || !fs2.existsSync(vaultDir) || !fs2.statSync(vaultDir).isDirectory()) throw new Error("A pasta do vault n\xE3o existe.");
        const root = path2.resolve(vaultDir);
        const result = { written: [], unchanged: [], skipped: [], obsolete: 0 };
        const expected = /* @__PURE__ */ new Set();
        for (const f of files) {
          const target = path2.resolve(root, ...f.path.split("/"));
          if (!target.startsWith(root + path2.sep)) {
            result.skipped.push({ path: f.path, reason: "caminho fora do vault" });
            continue;
          }
          expected.add(target);
          let existing = null;
          try {
            existing = fs2.readFileSync(target, "utf8");
          } catch (e) {
            if (e.code !== "ENOENT") throw e;
          }
          if (existing !== null) {
            const ours = readOurs(existing);
            if (!ours) {
              result.skipped.push({ path: f.path, reason: "j\xE1 existe uma nota sua com esse nome" });
              continue;
            }
            if (ours.edited) {
              result.skipped.push({ path: f.path, reason: "editada no Obsidian (n\xE3o sobrescrevi)" });
              continue;
            }
            if (existing === f.content) {
              result.unchanged.push(f.path);
              continue;
            }
          }
          fs2.mkdirSync(path2.dirname(target), { recursive: true });
          const tmp = `${target}.tmp-${process.pid}`;
          try {
            fs2.writeFileSync(tmp, f.content, "utf8");
            fs2.renameSync(tmp, target);
          } catch (e) {
            try {
              fs2.unlinkSync(tmp);
            } catch {
            }
            throw e;
          }
          result.written.push(f.path);
        }
        const base = path2.join(root, folder);
        for (const file of listOurs(base)) {
          if (expected.has(path2.resolve(file))) continue;
          try {
            if (readOurs(fs2.readFileSync(file, "utf8"))) result.obsolete++;
          } catch {
          }
        }
        return result;
      }
      function countForeignNotes(vaultDir, folder = FOLDER, limit = 5e3) {
        const skip = path2.resolve(vaultDir, folder);
        let n = 0, seen = 0;
        const walk2 = (d) => {
          let items;
          try {
            items = fs2.readdirSync(d, { withFileTypes: true });
          } catch {
            return;
          }
          for (const it of items) {
            if (++seen > limit) return;
            if (it.name.startsWith(".")) continue;
            const full = path2.join(d, it.name);
            if (it.isDirectory()) {
              if (path2.resolve(full) !== skip) walk2(full);
            } else if (/\.md$/i.test(it.name)) n++;
          }
        };
        walk2(path2.resolve(vaultDir));
        return n;
      }
      module.exports = { writeObsidianVault, readOurs, countForeignNotes };
    }
  });

  // ../core/services/vault.js
  var require_vault = __commonJS({
    "../core/services/vault.js"(exports, module) {
      "use strict";
      var fs2 = require_fs_vfs();
      var path2 = require_path();
      var { readMom } = require_mom();
      var cache = /* @__PURE__ */ new Map();
      var IGNORE = /* @__PURE__ */ new Set(["node_modules", "$recycle.bin", "system volume information"]);
      function listMoms(dir, { maxDepth = 3, maxFiles = 500, maxVisited = 2e4 } = {}) {
        const out = [];
        let truncated = false, visited = 0;
        const walk2 = (d, depth) => {
          let items;
          try {
            items = fs2.readdirSync(d, { withFileTypes: true });
          } catch {
            return;
          }
          items.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
          for (const it of items) {
            if (out.length >= maxFiles || ++visited > maxVisited) {
              truncated = true;
              return;
            }
            if (it.name.startsWith(".") || IGNORE.has(it.name.toLowerCase())) continue;
            const full = path2.join(d, it.name);
            if (it.isDirectory()) {
              if (depth < maxDepth) walk2(full, depth + 1);
            } else if (it.isFile() && /\.mom$/i.test(it.name) && !/\.tmp-\d+$/i.test(it.name)) out.push(full);
          }
        };
        walk2(dir, 0);
        return { files: out, truncated };
      }
      function loadVault(dir) {
        const maps = [], errors = [];
        if (!dir || !fs2.existsSync(dir) || !fs2.statSync(dir).isDirectory()) return { maps, errors: [{ file: dir || "", error: "Pasta inexistente." }], truncated: false };
        const { files, truncated } = listMoms(dir);
        const live = new Set(files);
        for (const k of [...cache.keys()]) if (!live.has(k)) cache.delete(k);
        for (const file of files) {
          try {
            const st = fs2.statSync(file);
            let c = cache.get(file);
            if (!c || c.mtimeMs !== st.mtimeMs || c.size !== st.size) {
              c = { mtimeMs: st.mtimeMs, size: st.size, map: readMom(fs2.readFileSync(file)) };
              cache.set(file, c);
            }
            maps.push({ key: file, file, name: path2.basename(file, path2.extname(file)), map: c.map });
          } catch (e) {
            errors.push({ file, error: e.message });
          }
        }
        return { maps, errors, truncated };
      }
      module.exports = { listMoms, loadVault, clearVaultCache: () => cache.clear() };
    }
  });

  // build/core-registry.js
  var require_core_registry = __commonJS({
    "build/core-registry.js"(exports, module) {
      "use strict";
      module.exports = {
        "contrast": require_contrast(),
        "flow-layout": require_flow_layout(),
        "flow": require_flow(),
        "forcelayout": require_forcelayout(),
        "graph-labels": require_graph_labels(),
        "graph": require_graph(),
        "layout": require_layout(),
        "links": require_links(),
        "logo": require_logo(),
        "markers": require_markers(),
        "mentions": require_mentions(),
        "model": require_model(),
        "pdfrefs": require_pdfrefs(),
        "shapes": require_shapes(),
        "svg": require_svg(),
        "themes": require_themes(),
        "drawio": require_drawio(),
        "flow-export": require_flow_export(),
        "markdown": require_markdown(),
        "mindomo": require_mindomo(),
        "mom": require_mom(),
        "print-style": require_print_style(),
        "study-export": require_study_export(),
        "ai": require_ai(),
        "backup": require_backup(),
        "errorlog": require_errorlog(),
        "obsidian-import": require_obsidian_import(),
        "obsidian-write": require_obsidian_write(),
        "obsidian": require_obsidian(),
        "revisao": require_revisao(),
        "vault": require_vault(),
        "text": require_text()
      };
    }
  });

  // shim/entry.js
  require_globals();
  document.documentElement.dataset.host = "web";
  var { Filesystem, Directory } = require_plugin_cjs();
  var { App } = require_plugin_cjs2();
  var fs = require_fs_vfs();
  var path = require_path();
  var host = require_host();
  var core = require_core_registry();
  var NATIVE = { electron: host, fs, path };
  window.require = (id) => {
    const name = String(id);
    if (NATIVE[name]) return NATIVE[name];
    const base = path.basename(name);
    if (name.includes("/core/") && core[base]) return core[base];
    throw new Error("M\xF3dulo indispon\xEDvel no tablet: " + name);
  };
  window.process = { pid: 1, platform: "android", env: {}, versions: {}, cwd: () => "/" };
  window.__dirname = "/app/renderer";
  var NATIVE_ROOT = "braniac/app-data";
  async function walk(nativeDir, virtualDir, entries, dirs) {
    const listing = await Filesystem.readdir({ path: nativeDir, directory: Directory.Data }).catch(() => ({ files: [] }));
    for (const f of listing.files) {
      const v = virtualDir + "/" + f.name, n = nativeDir + "/" + f.name;
      if (f.type === "directory") {
        dirs.push(v);
        await walk(n, v, entries, dirs);
        continue;
      }
      const r = await Filesystem.readFile({ path: n, directory: Directory.Data });
      entries.push([v, host.fromBase64(r.data), Date.now()]);
    }
  }
  async function loadFromDevice() {
    const entries = [], dirs = ["/app-data"];
    await walk(NATIVE_ROOT, "/app-data", entries, dirs);
    fs.vfs.loadRaw(entries, dirs);
  }
  var dirtyFiles = /* @__PURE__ */ new Set();
  var goneFiles = /* @__PURE__ */ new Set();
  var toShare = /* @__PURE__ */ new Set();
  var timer = null;
  var chain = Promise.resolve();
  var warned = false;
  fs.vfs.onChange(({ op, path: p }) => {
    if (op === "write") {
      dirtyFiles.add(p);
      goneFiles.delete(p);
      if (host.sharePending.has(p)) toShare.add(p);
    } else if (op === "delete") {
      goneFiles.add(p);
      dirtyFiles.delete(p);
    } else return;
    schedule();
  });
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(flush, 400);
  }
  function flush() {
    clearTimeout(timer);
    chain = chain.then(async () => {
      for (const p of [...dirtyFiles]) {
        const bytes = fs.vfs.rawGet(p);
        if (!bytes) {
          dirtyFiles.delete(p);
          continue;
        }
        await Filesystem.writeFile({ path: host.nativeOf(p), directory: Directory.Data, data: host.toBase64(bytes), recursive: true });
        dirtyFiles.delete(p);
      }
      for (const p of [...goneFiles]) {
        await Filesystem.deleteFile({ path: host.nativeOf(p), directory: Directory.Data }).catch(() => {
        });
        goneFiles.delete(p);
      }
      for (const p of [...toShare]) {
        toShare.delete(p);
        host.sharePending.delete(p);
        await host.shareFile(p).catch(() => {
        });
      }
    }).catch(async () => {
      if (warned) return;
      warned = true;
      await host.askButtons({ message: "N\xE3o consegui gravar no armazenamento do aparelho.", detail: "Compartilhe o arquivo para n\xE3o perder o trabalho, e tente de novo." });
    });
    return chain;
  }
  async function onBack() {
    const top = document.querySelector(".tab-dialog-wrap, .tab-sheet");
    if (top) {
      top.remove();
      return;
    }
    const modal = document.querySelector("#modal");
    if (modal && !modal.hidden) {
      modal.hidden = true;
      return;
    }
    if (!host.state.mapOpen) {
      App.exitApp();
      return;
    }
    if (host.state.dirty) {
      const c = await host.askButtons({ message: "H\xE1 altera\xE7\xF5es n\xE3o salvas.", detail: "Deseja salvar antes de voltar ao in\xEDcio?", buttons: ["Salvar", "Descartar", "Cancelar"] });
      if (c === 2) return;
      if (c === 0) host.emit("menu", "save");
    }
    host.emit("menu", "home");
  }
  host.setGate(loadFromDevice().catch(() => {
  }));
  window.addEventListener("DOMContentLoaded", () => {
    App.addListener("backButton", onBack);
    App.addListener("pause", () => {
      flush();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) flush();
    });
  });
  window.BRANIAC_TABLET = { flush };
})();
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)

@capacitor/core/dist/index.cjs.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
