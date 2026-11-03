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

  // ../core/ai.js
  var require_ai = __commonJS({
    "../core/ai.js"(exports, module) {
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
        const user = mode === "outline" ? `Organize em t\xF3picos o conte\xFAdo abaixo:

${ctx}` : mode === "notes" ? `Escreva a nota de estudo para este t\xF3pico:

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
        version: "0.1.21",
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

  // ../core/backup.js
  var require_backup = __commonJS({
    "../core/backup.js"(exports, module) {
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

  // ../core/errorlog.js
  var require_errorlog = __commonJS({
    "../core/errorlog.js"(exports, module) {
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

  // ../core/pdfrefs.js
  var require_pdfrefs = __commonJS({
    "../core/pdfrefs.js"(exports, module) {
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

  // ../core/model.js
  var require_model = __commonJS({
    "../core/model.js"(exports, module) {
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

  // ../core/flow.js
  var require_flow = __commonJS({
    "../core/flow.js"(exports, module) {
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
          } else if (t !== "end" && n.children.length > 1) {
            warn.push({ level: "warn", id: n.id, message: `Passo "${name}" com ${n.children.length} pr\xF3ximos; para bifurcar, use uma decis\xE3o.` });
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
        typeOf
      };
    }
  });

  // ../core/themes.js
  var require_themes = __commonJS({
    "../core/themes.js"(exports, module) {
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
      module.exports = { THEMES, getTheme, resolveStyle, sanitizeStyle, sanitizeTheme };
    }
  });

  // ../core/logo.js
  var require_logo = __commonJS({
    "../core/logo.js"(exports, module) {
      "use strict";
      var LOGO_VB = { x: 48, y: 116, w: 504, h: 591 };
      var COLORS = {
        color: { 1: "#f8fafb", 2: "#3586cd", 3: "#d7effe", 4: "#fecd65", 5: "#f9813c" },
        dark: { 1: "#ffffff", 2: "#7fb8f0", 3: "#d7effe", 4: "#fecd65", 5: "#f9813c" }
      };
      var PARTS = [
        ["1", [
          "M253.266 233.08 C252.791 230.109 254.471 223.817 255.547 220.969 C255.972 219.844 256.272 218.684 256.766 217.578 C261.627 206.69 268.94 200.476 279.226 194.941 C283.046 192.886 287.391 191.701 291.639 190.968 C292.616 190.799 293.505 190.462 294.517 190.578 C295.581 190.699 296.616 191.255 297.347 192.035 C299.222 194.035 299.288 196.389 297.405 198.358 C297.091 198.687 296.842 199.071 296.448 19",
          "9.316 C294.648 200.434 291.247 200.633 289.163 201.368 C284.275 203.092 280.467 204.971 276.414 208.231 C275.689 208.815 274.863 209.334 274.208 209.999 C270.366 213.899 266.338 219.33 264.619 224.574 C264.093 226.181 263.555 227.879 263.259 229.545 C262.938 231.351 263.296 233.478 262.151 235.029 C260.013 237.923 253.838 236.658 253.266 233.08 Z"
        ].join("")],
        ["1", "M294.305 337.545 L294.305 337.026 C289.993 336.709 285.536 337.042 281.214 337.1 C280.103 337.116 277.622 336.486 277.048 337.474 C274.365 334.022 274.977 330.608 274.977 326.509 L325.145 326.253 C325.462 328.548 325.9 334.354 324.248 336.106 C322.348 338.12 318.295 337.49 315.82 337.487 C311.163 337.482 306.505 337.484 301.848 337.479 C299.347 337.477 296.798 337.334 294.305 337.545 Z"],
        ["1", [
          "M505.152 456.702 C505.516 456.712 505.946 456.646 506.255 456.884 C506.99 457.45 508.493 460.661 508.954 461.632 C510.844 465.615 512.471 469.751 513.654 474.006 C514.1 475.61 514.323 477.268 514.766 478.866 C515.436 481.286 515.508 483.874 515.766 486.364 C517.466 502.75 513.146 520.639 502.619 533.509 C499.985 536.73 492.513 544.93 488.292 545.097 C486.925 543.885 486.662 541.489 485.039 541.009",
          " C485.013 539.468 484.698 539.659 483.743 538.609 C483.257 538.075 482.592 537.169 481.971 536.816 C478.706 534.962 474.007 537.461 473.644 541.171 C473.484 542.813 475.111 545.843 475.996 547.214 C476.236 547.586 476.588 547.848 476.812 548.241 C477.639 549.694 478.356 551.195 479.059 552.711 C479.474 553.607 479.724 554.516 480.073 555.421 C480.275 555.942 480.674 556.377 480.889 556.906 C482.07",
          "8 559.825 483.075 562.871 483.714 565.961 C484.268 568.642 484.34 571.432 484.961 574.089 C484.616 574.401 484.29 574.861 483.882 575.086 C482.29 575.963 479.926 576.365 478.17 576.888 C474.88 577.868 471.559 578.8 468.302 579.895 C466.339 580.555 462.702 582.071 460.806 582.078 C460.792 583.569 461.163 585.028 461.26 586.516 C461.396 588.632 460.843 590.753 460.244 592.767 C458.979 597.025 456.64",
          "5 601.058 453.986 604.585 C442.117 620.327 420.749 626.102 401.948 622.149 C394.734 620.632 387.946 617.63 381.224 614.694 C378.631 613.562 373.677 610.789 371.03 610.674 C371.958 607.285 372.799 604.044 374.642 600.99 C376.221 598.374 378.39 595.804 380.824 593.92 C381.232 593.605 381.74 593.514 382.144 593.208 C382.645 592.827 383.029 592.313 383.545 591.945 C384.32 591.391 385.238 591.013 386.0",
          "81 590.591 C390.984 588.137 395.446 586.445 401.108 586.885 C407.308 587.366 413.66 589.973 419.497 592.031 C419.925 592.182 420.261 592.51 420.686 592.65 C421.603 592.951 422.754 592.943 423.718 593.162 C431.678 594.977 439.646 594.161 447.202 591.089 C449.069 590.33 452.949 589.31 453.858 587.437 C454.205 587.434 454.666 587.509 454.984 587.34 C455.329 587.155 455.527 586.689 455.816 586.426 C45",
          "6.758 585.571 458.69 584.474 458.821 583.063 C458.907 582.139 458.217 581.069 457.795 580.294 C457.143 579.098 452.776 577.339 451.379 577.12 C449.461 576.821 447.359 578.599 445.675 579.32 C441.757 580.998 438.116 582.762 433.717 582.775 C427.966 582.791 422.724 581.167 417.381 579.292 C415.886 578.767 414.474 578.033 412.963 577.601 C405.465 575.458 398.707 574.843 391.039 576.589 C387.613 577.3",
          "69 384.387 578.6 381.242 580.094 C380.572 580.413 379.579 580.736 379.036 581.238 C378.751 581.5 378.659 581.833 378.526 582.181 C377.329 582.185 376.846 582.409 376.417 583.569 C376.06 583.571 375.607 583.5 375.27 583.642 C374.905 583.795 374.702 584.306 374.42 584.573 C372.309 586.571 370.247 588.422 368.322 590.614 C361.466 598.421 358.677 609.985 360.021 620.272 C360.272 622.186 360.632 624.16",
          "8 361.226 626.008 C361.746 627.622 362.903 629.499 362.929 631.169 C362.813 631.517 362.737 632.106 362.457 632.359 C361.495 633.231 360.022 633.121 358.882 633.501 C358.148 633.745 357.458 634.151 356.669 634.284 C356.202 634.362 355.579 634.154 355.09 634.144 C354.539 635.266 352.288 634.851 351.154 634.83 C347.428 634.761 345.491 632.775 343.263 630.038 C342.517 629.122 341.676 628.501 341.424 ",
          "627.27 L340.306 627.189 C340.162 625.872 339.346 624.232 338.023 623.88 L337.98 622.37 C337.635 622.384 337.29 622.394 336.945 622.409 C337.048 621.163 337.194 620.722 335.845 620.42 L335.845 619.039 L334.78 618.897 C334.841 618.504 335.085 617.896 334.916 617.519 C334.643 616.91 333.882 616.694 333.485 616.197 C333.245 615.897 333.182 615.495 332.961 615.183 C332.759 614.9 332.346 614.815 332.222",
          " 614.478 C332.082 614.097 332.376 613.665 332.149 613.304 C331.956 612.997 331.525 612.999 331.309 612.713 C330.748 611.97 329.693 609.887 329.491 608.993 C328.658 609.322 328.279 609.079 327.467 609.118 C326.99 609.141 326.555 609.345 326.058 609.358 C326.483 608.866 326.6 608.728 326.604 608.112 C329.051 608.049 331.13 607.306 333.292 606.198 C333.609 606.035 334.036 606.023 334.312 605.798 C334",
          ".648 605.524 334.864 605.109 335.198 604.818 C336.258 603.897 337.52 602.84 338.334 601.696 C338.954 600.826 339.856 597.739 340.062 596.619 C340.801 592.618 339.763 588.72 337.561 585.408 C337.062 584.656 336.718 584.002 336.03 583.381 C335.643 583.032 335.148 582.896 334.725 582.604 C332.12 580.809 329.121 579.899 325.901 579.963 C324.296 579.994 320.546 580.965 319.191 581.771 C318.425 582.225 ",
          "317.413 583.191 316.59 583.757 C316.054 584.126 315.874 584.762 315.272 585.133 C312.245 585.133 309.163 584.649 306.159 585.289 C302.135 586.145 295.932 588.532 292.39 590.621 C288.779 592.751 285.58 595.488 282.232 597.994 C277.999 601.162 273.651 604.145 269.083 606.807 C251.233 617.212 230.316 618.861 211.835 609.115 C198.741 602.209 188.825 590.439 183.333 576.789 C181.239 571.582 180.052 566",
          ".055 179.099 560.543 C178.946 559.659 178.755 555.366 178.55 554.98 C178.44 554.771 178.254 554.842 178.079 554.761 C179.26 553.076 179.74 550.966 180.71 549.126 C181.054 548.475 182.376 546.675 182.507 546.306 C182.661 545.874 182.591 545.299 182.619 544.843 C183.878 544.618 183.929 544.099 183.931 542.91 C184.359 542.807 184.756 542.742 185.076 542.406 C185.674 541.775 186.088 540.891 186.683 54",
          "0.217 C188.694 537.939 190.883 535.805 193.168 533.801 C193.778 533.265 194.506 532.948 195.111 532.441 C195.639 531.998 196.012 531.408 196.54 530.962 C197.383 530.25 198.303 529.718 199.164 529.063 C199.929 528.48 200.513 527.652 201.259 527.029 C201.868 526.521 202.601 526.154 203.191 525.652 C204.014 524.951 204.732 524.145 205.605 523.48 C205.967 523.204 206.416 523.101 206.776 522.829 C207.6",
          "97 522.136 208.454 521.088 209.346 520.318 C210.086 519.679 210.959 519.241 211.686 518.628 C212.692 517.78 213.515 516.75 214.567 515.928 C214.971 515.612 215.478 515.483 215.863 515.146 C216.425 514.654 216.828 514.019 217.397 513.528 C218.088 512.93 218.762 512.282 219.495 511.736 C219.859 511.464 220.304 511.336 220.653 511.042 C221.526 510.304 222.241 509.408 223.138 508.674 C223.953 508.007 ",
          "224.862 507.642 225.556 506.817 C225.806 506.519 225.821 506.275 225.911 505.92 C227.694 505.858 227.235 505.257 228.3 504.98 C229.286 504.724 230.47 504.926 231.489 504.812 C231.558 504.99 231.49 505.184 231.681 505.309 C232.148 505.614 234.382 505.405 235.033 505.405 C238.769 505.405 242.505 505.424 246.241 505.4 C256.638 505.333 267.037 505.247 277.436 505.321 C280.364 505.342 283.297 505.286 2",
          "86.224 505.331 C288.797 505.371 291.596 505.673 294.132 505.203 C293.602 507.627 294.011 511.537 293.993 514.14 C293.94 521.897 294.061 529.652 293.909 537.406 C293.383 537.819 293.22 538.047 293.06 538.707 C290.872 538.771 288.31 540.734 286.442 541.803 C284.702 542.799 282.862 543.654 281.083 544.579 C277.453 546.467 273.626 548.061 270.101 550.068 C268.476 550.994 266.891 552.005 265.207 552.87",
          "3 C262.953 554.034 260.593 555.025 258.38 556.248 C256.375 557.357 254.457 558.65 252.359 559.663 C250.239 560.688 249.957 558.901 248.4 558.08 C247.782 557.754 247.299 557.279 246.708 556.925 C244.623 555.673 241.956 554.961 239.553 554.676 C235.328 554.175 231.483 555.083 227.78 557.09 C227.457 557.266 227.042 557.284 226.744 557.484 C225.902 558.046 223.748 560.366 223.034 561.219 C222.689 561.",
          "63 222.164 561.971 221.87 562.404 C221.639 562.744 221.601 563.228 221.4 563.599 C218.802 568.408 218.193 574.175 219.914 579.408 C224.193 592.425 239.866 594.774 249.625 586.201 C250.364 585.551 252.392 583.709 252.883 582.986 C253.085 582.688 253.103 582.271 253.279 581.948 C255.366 578.106 255.789 573.745 255.834 569.424 C256.343 569.422 256.876 569.46 257.372 569.324 C258.196 569.097 259.005 5",
          "68.486 259.765 568.098 C261.819 567.052 263.871 566 265.938 565.024 C266.686 564.671 267.663 563.875 268.489 563.431 C272.898 561.059 277.479 559.015 281.871 556.717 C282.947 556.154 283.961 555.383 285.068 554.814 C286.993 553.825 289.009 552.955 290.893 551.909 C292.706 550.902 294.677 550.131 296.446 549.088 C297.83 548.272 299.161 547.09 300.769 546.681 C301.879 546.399 306.708 548.47 308.054 ",
          "548.958 C313.283 550.853 318.414 553.126 323.646 554.919 C325.65 555.605 327.145 556.972 329.323 556.979 C329.545 559.167 330.143 560.144 331.649 561.719 C332.227 562.324 332.956 563.251 333.691 563.652 C336.547 565.209 341.021 564.474 343.743 563.027 C344.361 562.698 345.174 562.492 345.696 562.031 C346.398 561.411 346.71 560.758 347.2 559.995 C347.441 559.62 347.823 559.327 348.022 558.929 C348.",
          "214 558.544 348.228 558.047 348.352 557.633 C349.405 554.108 348.38 551.055 346.731 547.947 C346.144 546.84 345.059 546.558 344.076 545.969 C341.049 544.158 337.812 543.955 334.502 545.122 C333.721 545.397 332.979 546.145 332.071 546.055 C330.274 545.877 327.831 544.509 326.137 543.816 C325.105 543.395 323.927 543.173 322.863 542.796 C320.006 541.781 317.183 540.677 314.357 539.653 C312.76 539.074",
          " 308.119 538.033 307.022 537.08 C306.687 536.789 306.186 536.422 306.008 536.006 C305.454 534.713 305.82 530.258 305.826 528.65 C305.844 523.588 305.834 518.525 305.833 513.463 C305.832 510.68 305.687 507.833 305.907 505.06 C306.89 505.06 307.832 504.837 308.803 504.833 C323.069 504.773 337.336 504.856 351.602 504.848 C354.879 504.846 358.164 504.777 361.439 504.848 C362.128 504.863 362.783 505.05",
          "8 363.477 505.06 C364.648 505.063 367.475 504.727 368.384 505.39 C370.408 506.866 372.865 509.723 374.544 511.645 C374.919 512.075 375.069 512.627 375.465 513.046 C379.214 517.014 383.387 520.558 386.95 524.716 C387.286 525.108 387.414 525.611 387.745 526.001 C389.622 528.214 391.904 530.179 393.956 532.232 C394.484 532.759 395.394 533.361 395.745 534.014 C396.025 534.537 394.932 539.349 394.968 5",
          "40.563 C395.035 542.856 395.773 544.748 396.78 546.746 C396.943 547.069 396.957 547.496 397.163 547.788 C397.736 548.599 399.051 549.694 399.822 550.384 C400.135 550.664 400.356 551.116 400.701 551.344 C401.719 552.015 404.186 552.915 405.408 553.199 C408.276 553.866 411.636 553.755 414.39 552.62 C415.358 552.22 416.093 551.579 416.958 551.022 C417.987 550.359 418.918 549.746 419.699 548.757 C419.",
          "98 548.401 420.041 547.94 420.26 547.549 C421.449 545.42 422.344 543.463 422.576 540.997 C422.856 538.009 422.17 534.487 420.51 531.956 C420.121 531.363 419.541 530.839 419.1 530.276 C418.196 529.123 418.079 528.438 416.444 528.375 C416.193 527.38 415.753 527.347 414.937 526.858 C412.891 525.634 410.032 525.667 407.743 525.988 C406.641 526.142 405.066 526.524 403.99 526.14 C402.689 525.675 400.391",
          " 522.93 399.352 521.853 C395.751 518.117 392.488 514.197 388.831 510.54 C387.416 509.125 384.408 507.048 384.168 505.046 L385.422 504.815 C385.492 504.993 385.423 505.187 385.617 505.311 C386.136 505.645 388.757 505.405 389.493 505.405 L402.442 505.405 C420.685 505.405 438.924 505.28 457.163 505.276 L457.212 504.807 L457.714 504.995 C457.771 506.331 458.416 508.051 459.78 508.412 C459.95 510.229 4",
          "60.583 510.324 461.754 511.529 C462.268 512.057 462.697 512.704 463.276 513.162 C466.138 515.427 469.924 516.922 473.557 517.184 C483.72 517.915 492.548 510.809 493.455 500.597 C493.766 497.1 493.139 494.087 491.94 490.83 C491.656 490.06 491.367 489.109 490.867 488.45 C489.551 486.715 487.952 485.155 486.263 483.771 C485.975 483.535 485.777 483.19 485.475 482.975 C485.182 482.766 484.762 482.756 4",
          "84.435 482.601 C482.743 481.798 481.195 481.068 479.335 480.656 C475.722 479.857 472.12 480.236 468.635 481.377 C467.415 481.777 465.933 482.124 465.507 483.437 C465.127 483.438 464.562 483.338 464.226 483.556 C463.93 483.748 459.999 487.714 459.872 487.95 C459.687 488.294 459.76 488.839 459.743 489.22 C457.906 489.806 458.085 492.93 456.431 493.397 C455.068 493.781 451.964 493.481 450.429 493.478",
          " C445.252 493.467 440.074 493.459 434.898 493.486 C418.39 493.571 401.882 493.461 385.373 493.481 C379.391 493.489 373.409 493.518 367.427 493.505 C366.298 493.502 361.854 493.837 361.189 493.114 C360.385 492.241 364.16 487.386 364.696 486.311 C364.907 485.888 364.891 485.435 364.911 484.978 C365.34 484.848 365.707 484.761 366.015 484.397 C366.309 484.051 366.339 483.48 366.576 483.079 C367.04 482",
          ".29 367.872 481.507 368.194 480.671 C368.341 480.289 368.326 479.893 368.345 479.493 C369.635 479.036 370.378 477.432 370.486 476.111 C370.891 475.94 371.231 475.802 371.528 475.454 C371.741 475.206 371.752 474.894 371.865 474.601 C372.281 473.528 373.277 472.76 373.708 471.733 C373.88 471.323 373.88 470.861 373.917 470.425 C375.246 470.039 375.904 468.321 375.956 467 C377.216 466.645 377.234 466.",
          "017 377.241 464.812 C377.637 464.744 377.995 464.75 378.296 464.432 C378.523 464.193 378.54 463.854 378.695 463.575 C379.451 462.221 380.17 460.796 381.078 459.52 C381.322 459.178 381.762 459.026 381.945 458.637 C382.116 458.277 382.081 457.858 382.099 457.472 C382.976 457.448 383.721 457.042 384.563 457.015 C391.447 456.793 398.38 457.022 405.269 457.011 C408.677 457.006 413.905 457.581 417.002 4",
          "56.137 C417.601 455.858 419.438 453.856 420.013 453.281 C422.818 450.478 425.588 447.629 428.356 444.789 C429.74 443.368 431.226 441.381 432.971 440.403 C434.534 439.528 436.123 440.171 437.788 440.261 C439.047 440.33 440.327 440.237 441.552 439.925 C449.289 437.959 453.686 429.948 451.647 422.292 C450.853 419.313 448.657 416.369 446.107 414.579 C445.815 414.374 445.399 414.354 445.077 414.194 C44",
          "2.291 412.811 439.07 412.029 435.936 412.655 C433.834 413.075 431.773 414.192 430.045 415.429 C429.271 415.984 428.538 416.335 427.877 417.055 C427.485 417.482 427.352 418.041 427.017 418.506 C425.098 421.169 424.501 424.699 424.803 427.961 C424.948 429.533 425.272 430.99 425.248 432.577 C423.845 433.158 417.21 439.885 415.997 441.38 C414.925 442.701 414.132 444.258 412.671 445.26 C411.332 446.177",
          " 407.866 445.712 406.222 445.7 C401.449 445.663 396.673 445.707 391.899 445.699 C390.725 445.697 386.949 445.984 386.083 445.539 C385.595 445.289 385.054 444.684 384.928 444.145 C384.655 442.984 384.903 441.553 384.901 440.364 C384.897 437.142 384.901 433.921 384.902 430.7 C384.905 421.267 384.83 411.831 384.9 402.399 C384.92 399.638 384.892 396.876 384.878 394.116 C384.872 393.021 384.638 391.564",
          " 384.991 390.517 C385.701 388.409 389.416 388.712 390.272 386.489 C392.244 386.392 393.128 384.814 394.136 383.328 C394.572 382.686 395.322 382.091 395.675 381.436 C397.274 378.467 398.083 374.861 398.096 371.469 C400.49 371.205 402.571 370.162 404.851 369.398 C407.63 368.466 410.397 367.47 413.219 366.676 C414.043 366.444 414.942 366.484 415.738 366.241 C416.225 366.092 416.617 365.76 417.122 365",
          ".629 C431.401 361.933 446.123 361.939 459.939 367.394 C462.711 368.488 465.461 369.82 468.053 371.277 C468.64 371.606 469.107 372.141 469.686 372.446 C471.23 373.261 472.734 374.12 474.165 375.129 C474.731 375.528 475.162 376.078 475.712 376.49 C476.12 376.794 476.618 376.921 477.025 377.241 C477.791 377.842 478.376 378.596 479.113 379.217 C479.506 379.548 479.995 379.723 480.391 380.055 C481.969 ",
          "381.38 483.429 382.889 484.811 384.414 C485.902 385.617 486.462 387.217 488.147 387.773 C488.169 388.221 488.141 388.69 488.371 389.096 C488.76 389.784 489.504 390.231 489.933 390.905 C490.629 391.999 491.42 393.061 492.043 394.21 C492.488 395.03 492.781 395.945 493.247 396.746 C493.505 397.188 493.872 397.535 494.111 397.998 C494.59 398.928 494.862 399.891 495.273 400.829 C495.454 401.242 495.775",
          " 401.575 495.956 401.995 C498.292 407.422 499.96 413.4 500.494 419.291 C501.344 428.672 500.441 438.425 496.865 447.161 C495.873 449.582 494.675 451.986 493.368 454.254 C491.972 456.674 489.729 459.673 489.442 462.519 C489.106 465.842 491.625 468.43 494.813 468.707 C495.573 468.773 496.646 468.736 497.325 468.346 C500.75 466.38 503.392 460.14 505.152 456.702 Z"
        ].join("")],
        ["2", [
          "M254.547 133.87 C256.347 133.192 258.308 132.219 260.273 132.851 C263.365 133.845 264.808 139.383 265.95 142.087 C266.338 143.005 266.908 143.851 267.286 144.757 C267.436 145.119 267.388 145.533 267.51 145.905 C267.799 146.782 268.161 147.704 268.505 148.577 C269.746 151.72 271.41 154.761 270.326 158.265 C270.192 158.698 270.153 159.14 269.853 159.5 C268.29 161.371 264.497 161.896 262.441 160.449 ",
          "C261.519 159.8 260.957 158.739 260.496 157.743 C259.865 156.38 259.091 155.048 258.511 153.685 C258.358 153.326 258.398 152.911 258.271 152.541 C257.762 151.052 256.998 149.643 256.423 148.18 C256.236 147.707 256.191 147.192 255.996 146.715 C254.908 144.056 253.213 141.294 253.171 138.346 C253.147 136.708 253.925 135.341 254.547 133.87 Z"
        ].join("")],
        ["2", [
          "M345.969 133.743 C346.83 135.279 347.663 136.777 347.496 138.604 C347.3 140.735 346.285 142.664 345.596 144.65 C344.327 148.308 341.227 157.587 338.486 159.936 C337.453 160.822 335.941 161.165 334.608 161.059 C333.971 161.008 332.87 160.888 332.327 160.542 C331.816 160.216 331.354 159.586 330.854 159.201 C330.342 158.037 329.744 156.909 329.8 155.604 C329.913 153.02 331.399 150.565 332.328 148.214",
          " C333.465 145.334 334.449 142.369 335.635 139.533 C336.5 137.467 336.995 134.605 338.96 133.263 C341.322 131.651 343.679 132.566 345.969 133.743 Z"
        ].join("")],
        ["2", [
          "M436.199 157.276 C436.237 156.419 436.306 155.23 436.588 154.42 C436.737 153.994 437.049 153.658 437.184 153.217 C437.881 150.935 438.334 148.744 439.485 146.633 C440.782 146.157 442.057 145.611 443.413 146.234 C446.251 147.539 446.553 155.927 449.207 158.685 C451.794 161.374 456.481 162.881 459.915 164.116 C461.085 164.537 462.254 165.317 463.407 165.815 C463.562 167.739 463.333 168.911 462.59 17",
          "0.697 C459.858 171.604 457.167 172.635 454.481 173.64 C453.313 174.076 452.064 174.267 451.011 175.009 C450.391 175.445 449.77 176.266 449.282 176.851 C449.018 177.167 448.992 177.527 448.816 177.881 C447.777 179.974 447.048 182.116 446.246 184.333 C445.954 185.139 445.769 186.174 445.345 186.909 C444.958 187.579 444.224 188.344 443.527 188.683 C442.648 189.11 441.585 189.032 440.64 189.075 C438.2",
          "23 186.144 437.893 184 436.719 180.544 C436.294 179.291 435.669 178.329 435.641 176.976 C434.614 176.7 434.382 176.344 434.297 175.297 C433.323 175.152 432.829 175.01 432.381 174.105 C430.636 173.934 429.015 173.102 427.373 172.517 C424.996 171.669 422.309 171.534 421.342 168.847 C421.019 167.951 421.039 167.068 421.442 166.2 C421.793 165.444 422.581 164.65 423.284 164.207 C423.996 163.758 425.076",
          " 163.613 425.88 163.353 C428.008 162.666 430.348 161.92 432.219 160.662 C432.887 160.213 433.709 159.753 434.293 159.205 C435.065 158.484 435.15 157.655 436.199 157.276 Z"
        ].join("")],
        ["2", [
          "M130.936 176.038 C132.058 175.687 133.13 175.208 134.258 174.879 C138.6 173.613 143.892 172.752 146.668 168.77 C148.548 166.074 148.912 161.135 150.056 157.944 C150.405 156.968 151.097 156.005 151.592 155.103 C153.642 154.345 154.753 154.343 156.81 155.065 C158.505 158.251 159.403 161.664 160.604 165.051 C161.089 166.418 161.858 167.56 161.997 169.017 C163.526 169.451 164.537 171.15 166.085 171.90",
          "6 C167.183 172.443 168.345 172.689 169.449 173.146 C172.071 174.231 174.777 175.187 177.469 176.107 C178.63 178.883 178.705 179.283 177.562 182.021 C176.591 182.32 175.787 182.97 174.837 183.334 C172.112 184.38 169.23 185.057 166.502 186.118 C164.931 186.73 163.42 187.613 161.902 188.355 C160.818 190.634 159.908 192.799 159.32 195.263 C159.121 196.092 159.166 196.995 158.945 197.8 C158.623 198.974",
          " 157.944 200.352 157.546 201.538 C156.162 202.585 154.673 203.53 152.867 202.899 C149.077 201.575 149.328 195.001 147.837 191.865 C147.294 190.721 146.727 189.258 145.87 188.315 C145.171 187.546 144.3 187.494 143.831 186.511 C142.219 186.4 131.517 183.126 130.83 182.06 C129.635 180.206 130.409 177.934 130.936 176.038 Z"
        ].join("")],
        ["2", [
          "M231.93 244.132 C231.956 242.292 231.763 240.453 231.765 238.611 C231.767 236.538 231.963 234.468 231.946 232.398 C232.234 228.322 233.072 224.319 234.097 220.374 C234.241 219.823 234.156 219.229 234.317 218.691 C234.461 218.211 234.848 217.837 235.013 217.354 C236.161 213.994 237.386 210.712 238.887 207.502 C239.806 205.535 240.927 203.809 242.011 201.937 C242.243 201.538 242.288 200.972 242.575 ",
          "200.625 C242.89 200.245 243.242 200.163 243.684 200.029 C243.707 199.64 243.646 199.115 243.804 198.754 C243.994 198.322 244.587 197.999 244.88 197.612 C245.318 197.033 245.648 196.325 246.109 195.781 C247.028 194.697 248.097 193.719 248.981 192.596 C249.228 192.282 249.341 191.898 249.575 191.578 C250.38 190.481 251.586 189.422 252.602 188.517 C253.56 187.665 254.743 187.055 255.701 186.149 C256.",
          "906 185.01 257.783 184.547 259.015 183.553 C259.354 183.28 259.587 182.733 259.984 182.559 C260.317 182.412 260.77 182.483 261.125 182.481 C261.558 181.33 262.064 181.104 263.252 181.1 C263.809 179.612 265.76 179.181 267.085 178.478 C270.793 176.513 274.648 174.968 278.672 173.766 C290.857 170.128 303.712 169.412 316.17 172.137 C316.891 172.294 317.672 172.218 318.374 172.404 C318.809 172.519 319.",
          "167 172.829 319.598 172.967 C321.185 173.473 322.814 173.83 324.395 174.367 C325.85 174.861 327.358 175.306 328.786 175.857 C330.833 176.646 332.796 177.912 334.77 178.885 C335.528 179.26 336.669 179.61 337.278 180.191 C337.556 180.455 337.645 180.795 337.774 181.141 C338.982 181.144 339.494 181.353 339.822 182.575 C340.268 182.589 340.746 182.554 341.162 182.749 C341.764 183.032 342.156 183.692 3",
          "42.649 184.119 C343.762 185.084 344.921 185.71 345.92 186.805 C348.271 189.381 351.145 191.529 353.406 194.187 C353.737 194.576 353.854 195.086 354.16 195.496 C354.621 196.115 355.24 196.628 355.682 197.242 C356.135 197.872 356.49 198.599 356.934 199.245 C357.818 200.529 358.629 200.978 358.748 202.756 C360.185 203.235 360.622 205.195 361.282 206.471 C363.129 210.042 364.715 213.711 365.957 217.54",
          "8 C370.53 231.677 370.504 247.25 365.062 261.178 C363.906 264.136 362.544 266.969 361.084 269.786 C360.631 270.659 360.3 271.693 359.735 272.492 C359.483 272.849 359.098 272.988 358.718 273.159 C358.712 274.34 358.436 274.793 357.345 275.296 C357.335 276.437 357.065 276.898 355.944 277.22 C355.924 277.602 355.992 278.142 355.815 278.49 C355.563 278.991 354.824 279.439 354.46 279.906 C354.067 280.4",
          "11 353.883 281.004 353.519 281.51 C353.027 282.196 352.275 282.712 351.717 283.35 C351.064 284.096 350.629 284.935 350.035 285.697 C349.68 286.152 349.178 286.45 348.784 286.864 C347.803 287.893 347.701 289.23 346.208 289.527 C346.169 290.752 346.129 291.314 344.828 291.594 C344.828 292.015 344.902 292.526 344.771 292.932 C344.574 293.538 343.757 294.178 343.413 294.763 C342.355 296.564 341.399 29",
          "8.549 340.535 300.447 C339.847 301.958 339.34 303.708 338.935 305.318 C337.845 309.645 338.044 314.113 337.41 318.501 C337.173 320.139 336.769 321.778 336.383 323.385 C336.26 323.895 336.01 324.306 335.999 324.846 C335.895 329.829 337.001 334.09 335.084 339.012 C334.597 340.262 333.944 341.374 333.321 342.554 C333.175 342.829 333.166 343.178 332.994 343.434 C332.792 343.735 332.389 343.903 332.133",
          " 344.161 C331.263 345.039 330.473 346.097 329.513 346.875 C329.165 347.158 328.71 347.284 328.345 347.551 C327.984 347.815 327.686 348.193 327.266 348.367 C326.79 348.564 326.25 348.522 325.746 348.528 C325.009 354.261 322.769 358.591 318.28 362.321 C317.836 362.69 317.457 363.293 316.987 363.595 C316.681 363.791 316.276 363.81 315.952 363.996 C312.442 366.017 308.685 367.317 304.631 367.736 C302.",
          "227 367.984 299.796 367.823 297.393 367.649 C293.521 367.367 289.987 366.36 286.343 365.1 C285.537 364.822 284.477 364.579 283.81 364.017 C283.488 363.745 283.441 363.415 283.329 363.037 C282.934 363.037 282.39 363.128 282.025 362.941 C281.817 362.834 278.329 359.374 278.258 359.211 C278.113 358.877 278.185 358.423 278.183 358.069 C277.811 357.893 277.419 357.749 277.177 357.392 C276.966 357.08 27",
          "6.974 356.656 276.841 356.309 C276.515 355.462 275.995 354.664 275.705 353.813 C275.375 352.841 275.232 351.8 274.918 350.822 C274.658 350.012 274.26 349.507 274.179 348.622 C272.705 348.468 268.347 345.537 267.518 344.299 C267.222 343.855 267.245 343.334 267.223 342.825 C264.389 342.067 263.843 334.457 263.882 331.958 C263.911 330.081 264.39 328.149 264.292 326.284 C264.171 323.976 263.194 321.23",
          "6 262.883 318.833 C262.268 314.082 262.403 309.304 261.141 304.64 C260.446 302.073 259.316 299.766 258.273 297.356 C257.582 295.76 256.243 294.284 256.086 292.517 C254.971 291.995 254.771 291.532 254.768 290.333 C254.377 290.214 254.076 290.159 253.783 289.838 C253.443 289.466 253.288 288.949 252.99 288.54 C252.415 287.75 251.649 287.194 251.049 286.443 C250.632 285.922 250.447 285.256 250.016 284",
          ".717 C249.471 284.037 248.528 283.523 248.13 282.754 C247.918 282.345 247.952 281.867 247.936 281.422 C246.133 280.901 245.843 279.1 244.693 277.84 C244.433 277.555 243.935 277.426 243.789 277.05 C243.655 276.708 243.725 276.257 243.723 275.897 C242.55 275.494 242.324 275 242.32 273.802 C241.12 273.41 240.972 272.852 240.969 271.654 C240.612 271.538 240.264 271.473 239.998 271.177 C239.29 270.388 ",
          "237.221 265.776 236.856 264.628 C236.574 263.739 236.085 262.978 235.731 262.132 C235.408 261.359 235.287 260.478 234.976 259.687 C234.812 259.269 234.45 258.952 234.318 258.527 C234.137 257.943 234.21 257.279 234.057 256.676 C233.011 252.552 232.175 248.391 231.93 244.132 Z M326.03 314.66 C326.38 312.384 326.45 310.079 326.776 307.802 C326.864 307.189 327.132 306.596 327.251 305.983 C328.249 300.",
          "861 329.851 295.895 332.353 291.289 C333.988 288.278 335.796 285.306 337.862 282.569 C341.757 277.408 346.145 272.575 349.507 267.028 C355.91 256.464 359.007 243.997 357.439 231.626 C356.524 224.412 354.461 217.107 350.73 210.818 C345.866 202.619 339.23 195.491 331.15 190.362 C315.45 180.395 294.721 178.522 277.624 185.964 C271.347 188.696 265.697 192.717 260.643 197.296 C255.398 202.046 251.294 2",
          "07.93 248.154 214.235 C246.092 218.374 244.779 222.955 243.921 227.482 C241.21 241.785 243.269 254.534 250.789 267.042 C256.01 275.725 263.748 282.597 268.342 291.718 C270.529 296.062 272.046 300.807 272.885 305.596 C273.423 308.661 273.548 311.777 274.222 314.817 L286.446 314.98 C286.833 311.185 286.665 307.35 286.627 303.538 C286.552 296.116 286.254 288.707 285.84 281.297 C285.699 278.772 285.45",
          "5 276.25 285.327 273.726 C285.251 272.24 285.485 269.369 284.88 268.081 C284.229 266.693 279.244 266.122 277.659 265.345 C272.464 262.796 268.903 257.659 268.836 251.801 C268.721 241.702 278.182 236.047 286.893 241.363 C292.122 244.555 294.021 250.667 294.924 256.353 C298.403 256.587 301.934 256.561 305.397 256.143 C305.978 252.816 306.713 249.492 308.217 246.449 C316.291 230.116 338.385 242.125 3",
          "30.372 257.346 C328.898 260.146 326.733 261.889 324.187 263.627 C321.487 265.47 318.383 265.733 315.213 265.886 C314.751 277.079 314.545 288.282 314.438 299.485 C314.409 302.59 314.397 305.699 314.464 308.804 C314.492 310.134 314.366 311.632 314.697 312.929 C314.868 313.599 315.289 314.24 315.595 314.852 C319.071 314.932 322.569 315.035 326.03 314.66 Z M322.101 249.154 C321.438 249.239 320.675 249",
          ".241 320.041 249.481 C318.071 250.227 317.392 253.021 316.918 254.765 C321.041 254.185 322.144 253.414 322.101 249.154 Z M283.921 255.733 C283.56 253.934 282.87 250.836 280.636 250.349 C279.917 250.193 279.032 250.35 278.309 250.37 C279.148 254.446 279.77 255.168 283.921 255.733 Z M303.719 313.903 C304.749 312.445 304.112 296.778 304.11 293.833 C304.028 287.918 304.186 281.985 304.26 276.07 C304.2",
          "98 272.996 304.501 269.892 304.133 266.838 L296.039 266.967 C296.041 271.5 296.382 276.045 296.545 280.576 C296.956 291.993 297.435 303.449 297.552 314.862 L303.356 314.949 Z M277.048 337.474 C279.23 337.911 281.549 337.718 283.767 337.716 C287.278 337.712 290.798 337.744 294.305 337.545 C296.798 337.334 299.347 337.477 301.848 337.479 C306.505 337.484 311.163 337.482 315.82 337.487 C318.295 337.4",
          "9 322.348 338.12 324.248 336.106 C325.9 334.354 325.462 328.548 325.145 326.253 L274.977 326.509 C274.977 330.608 274.365 334.022 277.048 337.474 Z M313.981 348.871 L286.164 348.833 C286.558 350.683 287.076 352.571 288.527 353.911 C293.102 358.137 307.62 358.21 312.053 353.693 C313.428 352.292 313.748 350.752 313.981 348.871 Z"
        ].join("")],
        ["2", [
          "M221.317 208.133 C220.255 208.833 219.472 209.968 218.175 210.285 C214.549 211.17 205.65 207.284 202.238 205.545 C200.916 204.872 199.523 204.257 198.163 203.664 C197.773 203.494 197.268 203.499 196.919 203.259 C196.549 203.005 196.443 202.604 196.297 202.21 L194.293 201.899 C194.049 200.514 193.317 199.145 193.433 197.712 C193.541 196.382 194.185 195.148 195.175 194.262 C199.349 190.523 206.656 1",
          "95.339 210.889 196.945 C213.176 197.813 219.66 200.065 220.965 201.903 C222.586 204.183 221.595 205.835 221.317 208.133 Z"
        ].join("")],
        ["2", [
          "M405.39 201.852 C403.628 202.849 401.775 203.892 399.925 204.695 C399.099 205.054 398.2 205.259 397.365 205.637 C393.765 207.268 386.731 210.986 382.865 210.284 C381.328 210.005 380.11 208.481 379.129 207.419 C378.889 205.891 378.622 204.268 379.273 202.786 C379.691 201.833 381.106 200.509 382.018 200.022 C383.131 199.428 384.301 199.171 385.465 198.695 C385.942 198.5 386.338 198.159 386.809 197.9",
          "67 C388.859 197.13 390.949 196.428 392.992 195.528 C395.568 194.394 399.145 192.364 402.017 192.603 C405.126 192.862 407.325 195.967 406.73 198.979 C406.519 200.046 405.932 200.926 405.39 201.852 Z"
        ].join("")],
        ["2", [
          "M426.018 303.579 C427.598 302.162 428.949 300.631 431.19 300.592 C431.492 299.208 432.941 298.856 433.811 297.773 C434.608 296.781 435.25 295.379 435.748 294.215 C437.521 290.069 437.308 285.212 438.377 280.866 C438.735 279.412 439.133 277.977 439.726 276.599 C440.217 275.457 441.035 274.405 441.194 273.171 C442.845 272.143 443.911 270.279 445.482 269.112 C448.606 266.79 454.194 266.318 457.849 26",
          "7.33 C459.394 267.758 462.209 268.566 462.727 270.167 L464.107 270.167 C464.996 271.991 467.232 273.33 468.666 274.762 C470.453 276.545 472.043 278.551 473.964 280.195 C475.135 281.197 476.516 281.915 477.818 280.711 C480.621 278.12 480.185 271.316 480.405 267.724 C480.546 265.417 480.786 262.973 481.42 260.744 C481.815 259.353 483.552 255.227 484.437 254.202 C485.129 253.401 486.062 252.725 486.8",
          "23 251.976 C487.268 251.537 487.578 250.961 488.077 250.577 C488.812 250.011 489.901 249.604 490.744 249.184 C498.125 245.503 507.341 245.937 514.539 249.818 C515.89 252.472 515.897 254.246 514.578 256.948 C513.348 257.785 512.283 258.591 510.777 258.792 C508.883 259.044 506.842 258.318 505.007 257.934 C500.642 257.02 495.816 257.585 493.073 261.493 C492.056 262.941 492.055 263.866 491.668 265.471",
          " C490.967 268.376 491.208 271.023 491.091 273.996 C491.011 276.015 490.741 278.001 490.311 279.973 C489.921 281.76 488.944 285.747 486.985 286.163 C486.975 286.653 487.03 287.214 486.774 287.656 C486.435 288.24 485.807 288.341 485.299 288.708 C484.644 289.181 484.067 289.898 483.387 290.306 C481.873 291.213 480.022 291.801 478.29 292.153 C475.163 292.787 471.788 292.294 469.091 290.617 C468.763 29",
          "0.412 468.366 290.385 468.055 290.146 C467.601 289.798 467.285 289.299 466.878 288.902 C465.312 287.371 463.799 285.821 462.273 284.25 C460.25 282.166 458.067 280.27 456.129 278.088 L452.044 278.04 C449.393 281.617 448.62 285.637 447.758 289.931 C446.452 296.433 444.981 302.753 439.776 307.242 C439.163 307.77 438.549 308.401 437.91 308.88 C436.222 310.146 431.763 311.983 429.661 311.588 C428.655 3",
          "11.399 427.788 310.775 426.921 310.267 C425.693 307.857 425.492 306.235 426.018 303.579 Z"
        ].join("")],
        ["2", [
          "M75.729 263.748 C77.953 262.677 80.014 261.73 82.452 261.225 C86.381 260.411 92.519 260.65 96.256 262.175 C97.3 262.601 98.302 263.248 99.286 263.797 C99.676 264.015 100.143 264.086 100.501 264.356 C101.003 264.734 101.34 265.294 101.789 265.729 C102.582 266.495 103.592 267.245 104.263 268.113 C104.538 268.47 104.616 268.933 104.842 269.319 C105.674 270.743 106.522 272.207 107.135 273.741 C109.515",
          " 279.702 108.005 286.621 110.941 292.385 C112.044 292.434 113.627 292.734 114.665 292.227 C116.842 291.162 120.108 287.068 122.038 285.251 C122.383 284.926 122.788 284.795 123.179 284.547 C124.229 283.878 125.269 282.91 125.974 281.892 C127.501 281.657 128.681 280.422 130.166 280.059 C135.261 278.812 141.213 279.489 145.056 283.332 C146.032 284.308 146.683 284.872 146.731 286.308 C148.46 286.749 1",
          "49.018 289.349 149.586 290.854 C151.312 295.427 151.833 300.41 153.74 304.902 C155.938 310.081 159.354 310.602 163.205 313.887 C163.876 316.513 164.238 319.756 161.636 321.501 C159.251 323.1 152.153 321.379 151.481 318.793 C151.036 318.782 150.555 318.82 150.137 318.636 C149.444 318.333 146.954 315.842 146.641 315.15 C146.443 314.714 146.47 314.159 146.426 313.69 C144.702 313.314 143.999 310.485 1",
          "43.386 308.968 C142.847 307.635 142.152 306.18 141.799 304.794 C141.307 302.865 140.96 300.852 140.301 298.965 C140.17 298.591 139.884 298.3 139.76 297.927 C139.599 297.447 139.683 296.91 139.547 296.418 C139.156 295.007 138.208 293.945 138.141 292.451 C137.347 292.19 136.96 291.571 136.241 291.223 C135.259 290.747 133.525 291.09 132.482 291.175 C130.038 293.987 127.278 296.548 124.568 299.101 C12",
          "4.078 299.563 123.764 300.236 123.182 300.597 C122.729 300.877 122.093 300.834 121.579 300.883 C121.256 302.399 119.07 302.784 117.68 303.167 C114.517 304.039 111.124 304.063 108.01 302.967 C106.829 302.551 105.757 301.787 104.515 301.643 C103.76 300.389 101.383 298.77 100.916 297.793 C99.342 294.505 98.412 291.095 98.083 287.455 C97.844 284.814 97.874 282.167 97.286 279.569 C97.047 278.511 96.538",
          " 277.402 95.99 276.479 C95.423 275.522 94.767 275.237 94.632 274.043 C93.644 273.89 93.525 273.478 92.772 272.98 C91.616 272.215 90.062 271.881 88.696 271.85 C85.361 271.772 82.241 274.04 78.896 273.413 C77.799 273.208 76.754 272.599 75.734 272.174 C74.13 268.166 74.155 267.747 75.729 263.748 Z"
        ].join("")],
        ["2", [
          "M495.85 325.556 C496.545 325.097 496.854 324.822 497.287 324.129 C498.653 324.002 499.894 323.296 501.204 322.902 C505.675 321.555 510.696 320.645 513.255 316.377 C514.983 313.496 515.223 309.983 516.136 306.825 C516.449 305.745 517.046 304.738 517.522 303.725 C520.155 302.779 521.24 302.263 523.949 303.327 C525.116 306.394 525.407 309.545 526.26 312.691 C526.692 314.285 527.744 315.733 527.814 31",
          "7.369 C529.257 317.809 530.368 319.359 531.408 320.4 C532.396 320.648 533.299 321.039 534.262 321.306 C534.759 321.443 535.287 321.367 535.778 321.504 C536.158 321.61 536.438 321.916 536.792 322.08 C537.562 322.437 538.435 322.635 539.235 322.925 C539.969 323.191 540.811 323.322 541.514 323.633 C542.601 324.113 543.649 324.708 544.745 325.188 C546.527 330.412 544.406 331.541 539.84 333.14 C539.086",
          " 333.404 538.286 333.599 537.552 333.911 C537.191 334.064 536.902 334.362 536.53 334.484 C535.372 334.864 534.434 334.787 533.132 335.433 C532.586 335.703 531.845 335.975 531.382 336.362 C530.18 337.364 529.306 338.826 527.769 339.316 C527.714 341.011 526.628 342.495 526.233 344.168 C525.448 347.503 524.848 354.079 520.185 353.743 C519.298 353.679 518.381 353.243 517.543 352.981 C516.371 350.583 5",
          "15.904 349.086 515.061 346.619 C514.933 346.245 514.679 345.923 514.572 345.544 C514.436 345.055 514.51 344.518 514.42 344.018 C514.217 342.896 513.893 341.76 513.466 340.704 C512.618 338.608 511.027 337.827 510.337 336.168 C508.95 336.071 507.815 335.223 506.487 334.821 C504.368 334.18 502.06 333.892 499.994 333.106 C499.05 332.747 498.367 332.165 497.338 332.025 C495.386 329.112 494.372 329.383 ",
          "495.85 325.556 Z"
        ].join("")],
        ["2", [
          "M80.314 449.188 C78.624 449.537 77.214 452 76.183 453.324 C72.888 457.558 70.045 462.095 67.866 466.999 C58.43 488.235 57.866 509.681 66.907 531.132 C76.648 554.243 98.317 571.46 122.941 576.003 C136.207 578.451 149.974 577.304 163.347 576.461 C163.366 571.245 163.863 565.783 164.983 560.689 C165.525 558.226 166.559 555.852 166.999 553.38 C167.539 552.479 167.682 551.516 168.088 550.577 C168.767 5",
          "49.004 169.497 547.478 170.101 545.866 C170.371 545.146 170.862 544.442 171.197 543.74 C171.96 542.136 172.682 540.304 173.63 538.814 C174.301 537.758 175.093 536.783 175.805 535.757 C176.029 535.435 176.136 535.039 176.383 534.736 C178.549 532.078 181.117 529.716 183.67 527.434 C184.182 526.977 184.551 526.372 185.094 525.95 C185.452 525.672 185.898 525.55 186.261 525.274 C187.134 524.611 187.866",
          " 523.816 188.689 523.112 C189.536 522.387 190.548 521.816 191.405 521.074 C191.872 520.67 192.194 520.126 192.682 519.74 C193.606 519.008 194.642 518.423 195.558 517.643 C196.025 517.245 196.323 516.686 196.809 516.303 C197.165 516.023 197.614 515.909 197.977 515.636 C198.855 514.973 199.595 514.201 200.401 513.472 C200.773 513.135 201.269 512.946 201.66 512.621 C202.854 511.629 203.865 510.424 20",
          "5.038 509.446 C205.387 509.155 205.841 509.063 206.203 508.792 C207.208 508.039 208.049 507.09 209.027 506.329 C209.773 505.856 210.088 505.538 210.383 504.7 L143.264 504.75 L143.202 505.437 C142.811 506.018 142.622 506.161 141.929 506.308 C141.916 506.761 141.94 507.225 141.756 507.652 C141.232 508.871 137.42 513.191 136.285 513.908 C135.821 514.201 135.203 514.17 134.674 514.213 C134.396 515.433",
          " 133.728 515.337 132.699 515.797 C128.782 517.549 124.185 517.962 120.077 516.619 C116.043 515.3 113.534 513.316 110.9 509.98 C110.64 509.651 110.223 509.472 109.984 509.137 C109.776 508.847 109.76 508.426 109.592 508.105 C107.601 504.307 106.547 500.115 107.129 495.809 C107.511 492.983 108.409 491.251 109.71 488.79 C109.893 488.445 109.938 488.038 110.151 487.711 C110.548 487.104 111.238 486.673 ",
          "111.74 486.154 C112.452 485.419 113.19 484.412 114.023 483.829 C114.388 483.573 114.856 483.502 115.243 483.275 C118.941 481.112 123.302 479.848 127.619 480.409 C132.221 481.007 136.137 482.99 139.138 486.547 C140.074 487.656 140.576 487.67 140.58 489.227 C142.438 489.779 142.332 493.088 144.113 493.429 C146.214 493.831 148.682 493.468 150.82 493.479 C156.457 493.506 162.095 493.507 167.732 493.48",
          "7 C183.55 493.429 199.37 493.548 215.188 493.49 C221.113 493.467 227.039 493.448 232.964 493.484 C234.294 493.492 238.484 493.901 239.361 493.014 C239.55 492.823 239.653 492.607 239.589 492.337 C239.425 491.641 238.889 491.206 238.522 490.634 C238.193 490.121 238.032 489.487 237.718 488.951 C236.84 487.455 235.513 486.165 235.386 484.364 C234.97 484.203 234.627 484.08 234.325 483.723 C234.028 483.",
          "372 234.001 482.816 233.765 482.412 C233.302 481.62 232.481 480.834 232.157 479.995 C232.01 479.614 232.026 479.217 232.007 478.817 C231.672 478.685 231.325 478.586 231.064 478.322 C230.985 478.243 228.764 474.625 228.702 474.469 C228.543 474.065 228.54 473.599 228.496 473.171 C228.103 473.06 227.788 473.016 227.483 472.704 C227.188 472.401 227.187 471.922 226.989 471.558 C226.131 469.978 224.723 ",
          "468.543 223.922 467 C223.704 466.58 223.719 466.129 223.697 465.671 C222.47 465.311 222.343 464.737 222.341 463.533 C221.019 463.179 220.293 461.491 220.213 460.18 C218.393 459.552 218.873 457.527 216.036 457.005 C214.074 456.644 211.822 456.907 209.831 456.924 C205.23 456.961 200.627 456.959 196.026 456.956 C192.162 456.953 187.723 457.414 184.05 455.994 C180.74 454.714 178.385 451.957 175.937 44",
          "9.508 C174.765 448.336 173.498 447.21 172.407 445.964 C172.105 445.619 171.983 445.177 171.705 444.819 C170.669 443.482 168.586 441.215 167.119 440.413 C166.711 440.19 166.22 439.833 165.749 439.788 C165.145 439.732 164.484 439.951 163.883 440.011 C162.348 440.165 160.761 440.194 159.244 439.882 C157.589 439.542 155.625 438.905 154.216 437.987 C153.857 437.753 153.593 437.34 153.258 437.064 C149.7",
          "13 434.138 147.74 429.806 148.032 425.168 C148.181 422.788 149.414 419.029 150.957 417.186 C151.322 416.75 151.824 416.504 152.22 416.111 C156.038 412.311 161.893 411.251 166.915 413.08 C167.28 413.213 167.695 413.206 168.04 413.386 C168.845 413.806 169.688 414.518 170.406 415.082 C171.457 415.908 172.733 417.051 173.513 418.132 C173.694 418.384 173.703 418.73 173.831 419.009 C174.957 421.45 175.9",
          "05 423.828 175.883 426.578 C175.876 427.565 175.135 431.597 175.25 431.983 C175.816 433.891 180.168 435.957 180.65 438.459 C182.76 439.04 185.867 444.642 188.269 445.469 C189.929 446.04 194.707 445.645 196.7 445.66 C202.911 445.705 209.128 445.772 215.337 445.777 C215.781 436.322 215.448 426.795 215.46 417.33 C215.472 408.158 215.812 398.905 215.299 389.748 C213.947 389.729 212 389.337 211.508 387",
          ".989 C211.128 387.977 210.58 388.057 210.236 387.867 C209.325 387.362 206.977 384.651 206.243 383.746 C205.996 383.441 205.66 383.217 205.421 382.911 C204.586 381.841 204.064 380.272 203.645 378.999 C201.932 373.789 202.229 368.39 204.7 363.458 C205.526 361.808 207.809 358.11 209.53 357.368 C209.952 357.186 210.427 357.219 210.874 357.206 C210.989 356.797 211.056 356.377 211.43 356.109 C211.733 35",
          "5.892 212.166 355.9 212.509 355.765 C214.171 355.109 215.233 354.611 217.014 354.231 C222.749 353.007 227.212 354.663 232.012 357.646 C233.738 358.719 235.704 360.136 235.745 362.314 C236.141 362.395 236.48 362.405 236.777 362.727 C237.82 363.86 238.771 367.994 239.021 369.587 C240.062 376.219 237.271 382.658 232.215 386.903 C230.701 388.174 228.643 388.68 227.183 389.975 C226.907 390.041 226.634 ",
          "390.113 226.36 390.184 L226.414 449.147 C227.524 450.821 229.483 453.521 229.672 455.464 C230.061 455.586 230.375 455.634 230.662 455.966 C230.963 456.315 230.994 456.88 231.228 457.285 C232.164 458.909 233.68 460.352 233.791 462.294 C234.227 462.437 234.576 462.527 234.876 462.918 C235.157 463.284 235.183 463.843 235.417 464.255 C236.32 465.843 237.803 467.238 237.963 469.122 C239.12 469.618 239.",
          "214 470.182 239.215 471.376 C240.636 471.792 241.268 473.401 241.35 474.808 C242.693 475.159 243.365 476.871 243.466 478.191 C244.694 478.587 244.747 479.185 244.766 480.388 C245.166 480.474 245.497 480.488 245.805 480.805 C246.099 481.109 246.1 481.597 246.302 481.961 C246.705 482.686 247.934 483.971 248.141 484.543 C248.284 484.942 248.208 485.456 248.208 485.873 C248.552 485.95 248.833 485.95 2",
          "49.116 486.199 C249.723 486.732 250.078 487.946 250.488 488.656 C251.028 489.591 253.499 493.137 254.442 493.416 C255.39 493.697 256.696 493.488 257.682 493.491 C260.675 493.5 263.669 493.471 266.662 493.482 C272.647 493.506 278.635 493.438 284.621 493.489 C287.462 493.513 291.837 493.87 294.506 493.325 L294.689 445.108 C294.424 445.074 294.167 445.038 293.891 445.024 C290.517 443.188 286.932 441.",
          "688 283.383 440.172 C282.655 439.861 281.839 439.704 281.132 439.376 C279.94 438.823 278.795 438.177 277.57 437.671 C277.155 437.499 276.684 437.48 276.284 437.285 C274.89 436.607 273.49 435.646 271.892 435.529 C270.218 435.407 267.887 437.153 266.215 437.692 C262.814 438.789 257.03 438.15 254.184 435.864 C253.041 434.946 251.548 433.701 250.712 432.494 C250.484 432.165 250.443 431.673 250.254 431",
          ".307 C248.183 427.294 247.944 422.824 249.792 418.679 C249.965 418.292 249.999 417.799 250.212 417.442 C250.421 417.092 250.833 416.875 251.082 416.544 C251.865 415.501 253.286 413.881 254.356 413.158 C254.651 412.958 255.068 412.938 255.391 412.772 C258.239 411.308 261.178 410.612 264.374 411.257 C268.519 412.095 272.098 414.344 274.189 418.062 C275.057 419.603 274.97 421.815 276.035 423.211 C277",
          ".606 425.271 280.371 426.07 282.6 427.17 C284.889 428.299 287.166 429.478 289.481 430.577 C291.155 431.372 292.745 432.612 294.671 432.549 L294.703 431.177 L294.713 387.387 C294.738 386.631 294.752 385.736 295.053 385.027 C296.185 382.358 299.569 381.336 302.173 381.99 C302.522 382.078 302.959 382.074 303.267 382.273 C304.352 382.975 305.167 384.393 305.542 385.59 C306.282 387.957 305.87 394.179 3",
          "05.851 396.934 C305.804 403.875 306.208 411.196 305.786 418.084 L305.727 447.286 C306.062 447.275 306.394 447.263 306.73 447.237 C307.518 446.301 308.598 445.705 309.501 444.868 C310.387 444.048 311.332 443.289 312.205 442.457 C312.662 442.022 312.975 441.46 313.467 441.059 C314.567 440.161 315.752 439.387 316.831 438.424 C317.56 437.775 318.138 436.976 318.872 436.328 C319.382 435.878 320.03 435.",
          "661 320.547 435.195 C321.442 434.388 322.386 433.624 323.255 432.789 C324.325 431.761 325.036 430.413 326.517 429.94 C326.529 425.668 326.013 423.733 328.395 419.867 C328.908 419.034 329.171 418.35 329.933 417.674 C330.319 417.331 330.811 417.161 331.236 416.876 C335.406 414.073 340.195 413.566 344.701 416.071 C345.092 416.288 345.675 416.367 346.01 416.639 C348.186 418.404 349.469 420.665 350.226",
          " 423.309 C350.845 425.473 351.027 427.76 350.305 429.927 C350 430.841 349.466 432.393 348.954 433.17 C348.559 433.769 345.161 437.155 344.576 437.489 C343.313 438.21 341.526 438.753 340.076 438.907 C337.692 439.16 334.788 437.952 332.637 439.213 C330.201 440.641 328.43 442.837 326.357 444.694 C325.932 445.075 325.378 445.235 324.942 445.607 C323.232 447.069 321.774 448.781 320.097 450.262 C319.381",
          " 450.894 318.514 451.357 317.783 452.005 C316.413 453.221 315.223 454.672 313.824 455.834 C313.43 456.162 312.94 456.326 312.546 456.661 C310.869 458.089 309.399 459.668 307.809 461.179 C307.16 461.796 306.357 461.954 306.004 462.863 C305.633 463.82 305.84 465.094 305.83 466.104 C305.795 469.416 306.004 472.764 305.79 476.068 L305.822 493.203 L306.51 493.203 C307.453 493.847 314.85 493.502 316.526",
          " 493.488 C323.312 493.43 330.101 493.473 336.887 493.482 C338.813 493.484 344.679 493.82 346.17 493.355 C348.19 492.726 348.721 488.479 350.681 487.844 C350.755 486.501 351.456 484.82 352.846 484.552 C352.865 483.348 352.891 482.726 354.147 482.371 C354.214 480.965 354.917 479.378 356.281 478.877 C356.285 477.679 356.471 477.21 357.581 476.677 C357.692 475.409 358.394 473.797 359.67 473.462 C359.7",
          "05 473.028 359.699 472.561 359.858 472.149 C360.254 471.123 361.286 470.35 361.709 469.291 C361.825 469.001 361.826 468.672 362.032 468.422 C362.334 468.054 362.687 467.952 363.113 467.807 C363.189 466.474 363.89 464.815 365.248 464.478 C365.25 463.271 365.339 462.671 366.583 462.32 C366.611 461.873 366.6 461.413 366.803 461 C367.026 460.547 367.452 460.207 367.726 459.782 C368.197 459.052 368.448",
          " 458.298 368.827 457.545 C369.086 457.029 369.63 456.627 369.939 456.12 C370.636 454.977 371.07 453.692 371.762 452.575 C372.544 451.31 373.497 450.275 373.716 448.714 C374.077 446.148 373.752 443.376 373.753 440.787 C373.757 435.15 373.773 429.513 373.757 423.876 C373.736 416.111 373.771 408.346 373.778 400.581 C373.781 397.052 374.032 393.453 373.768 389.934 C370.53 389.828 366.8 385.928 364.834",
          " 383.554 C359.812 377.49 360.453 367.427 364.853 361.177 C365.147 360.759 365.314 360.262 365.649 359.873 C366.861 358.467 368.384 357.477 369.958 356.52 C371.312 355.697 372.909 354.783 374.467 354.486 C378.709 353.677 382.355 353.658 386.463 355.087 C387.711 355.521 389.096 355.782 389.484 357.185 C392.338 357.281 392.645 360.601 395.319 360.832 C396.66 360.948 400.087 359.418 401.534 358.936 C4",
          "05.782 357.519 410.066 356.356 414.39 355.215 C416.141 354.753 419.383 354.456 420.571 353.142 C419.935 352.445 419.868 351.942 419.829 351.013 C418.451 350.739 417.464 348.608 416.382 347.564 C415.728 346.933 415.385 346.07 414.785 345.378 C412.913 343.221 410.891 341.107 408.658 339.318 C408.304 339.034 407.866 338.884 407.519 338.6 C406.944 338.129 406.493 337.562 405.865 337.135 C405.525 336.9",
          "03 405.036 336.89 404.744 336.612 C404.384 336.27 404.266 335.823 404.132 335.366 C402.972 335.363 402.44 335.276 402.108 334.091 C400.356 333.947 399.296 332.842 397.784 332.11 C397.343 331.897 396.781 331.895 396.376 331.636 C396.07 331.44 395.938 331.054 395.634 330.875 C395.097 330.56 394.325 330.58 393.745 330.35 C393.274 330.163 392.881 329.816 392.405 329.621 C391.706 329.336 390.994 329.20",
          "6 390.292 328.966 C389.865 328.821 389.505 328.523 389.079 328.365 C387.092 327.628 385.021 327.042 382.957 326.565 C377.192 325.233 371.407 324.743 365.495 324.822 C362.031 324.869 355.839 325.986 352.876 324.434 C351.97 323.959 350.782 323.002 350.27 322.097 C350.09 321.777 350.089 321.342 349.996 320.99 C349.314 318.405 350.244 315.506 352.751 314.285 C355.059 313.161 362.123 313.161 364.894 31",
          "3.161 C376.178 313.159 387.445 314.836 397.799 319.46 C398.943 319.971 400.164 320.34 401.294 320.844 C403.337 321.753 405.172 322.959 407.094 324.073 C407.646 324.392 408.529 324.592 408.98 325.001 C409.326 325.314 409.441 325.656 409.59 326.078 C410.789 326.082 411.281 326.321 411.653 327.507 C412.018 327.508 412.463 327.443 412.813 327.567 C413.225 327.713 413.491 328.3 413.824 328.579 C414.494",
          " 329.141 415.29 329.421 415.961 329.93 C416.595 330.412 417.101 331.072 417.632 331.659 C418.703 332.842 419.993 333.863 421.136 334.98 C422.371 336.187 423.483 337.508 424.692 338.738 C425.295 339.352 426.001 339.852 426.562 340.513 C427.059 341.099 427.314 341.888 427.811 342.51 C428.125 342.903 428.576 343.202 428.856 343.612 C429.324 344.297 429.643 345.082 430.19 345.727 C430.417 345.994 430.",
          "814 346.11 430.977 346.432 C431.183 346.836 431.078 347.466 431.083 347.906 C432.758 348.185 433.151 350.128 433.285 351.617 C444.974 351.607 454.202 352.51 465.181 356.944 C467.851 358.022 470.504 359.072 472.961 360.574 C473.288 360.773 473.686 360.787 473.976 361.056 C474.255 361.315 474.275 361.583 474.384 361.919 C475.724 362.006 477.416 362.679 477.732 364.057 C479.006 364.136 479.528 364.2 ",
          "479.876 365.53 C481.291 365.556 482.359 366.087 482.726 367.536 C483.171 367.559 483.641 367.537 484.052 367.74 C484.645 368.033 486.744 370.271 487.424 370.892 C488.266 371.659 489.305 372.208 490.102 372.976 C490.82 373.667 491.686 374.378 492.27 375.188 C492.536 375.556 492.651 375.989 492.95 376.342 C494.014 377.593 495.38 378.682 496.371 379.968 C496.872 380.618 497.218 381.432 497.707 382.11",
          "2 C497.968 382.476 498.512 382.651 498.695 383.053 C498.861 383.42 498.786 383.953 498.799 384.348 C500.046 384.653 500.211 385.202 500.213 386.416 C500.658 386.539 501.02 386.604 501.325 387.002 C501.655 387.433 501.775 388.132 502.062 388.623 C502.437 389.266 502.913 389.801 503.312 390.414 C504.336 391.985 505.07 393.918 505.771 395.648 C506.563 397.603 507.524 399.534 508.226 401.516 C508.567 ",
          "402.477 508.723 403.52 509.049 404.492 C509.192 404.922 509.487 405.29 509.608 405.723 C509.76 406.266 509.718 406.857 509.853 407.41 C511.173 412.843 511.644 418.237 512.014 423.794 C512.049 424.315 512.343 424.734 512.41 425.241 C512.506 425.968 512.435 426.744 512.435 427.477 C513.556 427.606 514.159 427.862 514.394 429.015 C516.747 429.07 517.396 431.209 519.302 432.319 C520.743 433.158 521.65",
          "6 434.316 522.814 435.505 C524.096 436.821 525.426 438.1 526.724 439.402 C527.613 440.293 528.64 441.055 529.453 442.027 C530.253 442.984 530.802 444.099 531.703 445.018 C532.84 446.179 533.368 447.131 534.37 448.318 C534.819 448.85 535.563 449.273 535.844 449.924 C536.038 450.371 535.993 450.933 536.018 451.411 C536.462 451.491 536.872 451.514 537.189 451.893 C537.451 452.206 537.466 452.705 537.",
          "676 453.063 C538.282 454.103 539.038 455.009 539.58 456.07 C542.017 460.846 544.414 465.529 546.233 470.588 C553.167 489.878 553.371 511.656 546.223 530.925 C544.795 534.777 543.223 538.705 541.334 542.315 C541.103 542.758 540.703 543.103 540.454 543.546 C539.692 544.905 539.045 547.336 537.435 547.674 C537.435 548.895 537.374 549.483 536.103 549.816 C536.075 550.213 536.13 550.725 535.992 551.099",
          " C535.851 551.479 535.37 551.64 535.118 551.94 C534.572 552.59 534.249 553.383 533.747 554.046 C533.305 554.631 532.712 555.093 532.272 555.697 C531.971 556.11 531.86 556.625 531.543 557.021 C531.047 557.641 530.342 558.08 529.81 558.677 C527.611 561.137 525.287 563.391 522.881 565.643 C522.212 566.27 521.663 567.021 520.96 567.616 C520.489 568.014 519.867 568.183 519.374 568.57 C518.859 568.976 5",
          "18.429 569.508 517.912 569.89 C517.242 570.384 516.433 570.7 515.794 571.251 C515.527 571.481 515.386 571.872 515.069 572.041 C514.683 572.248 514.055 572.157 513.627 572.178 C513.351 573.491 512.726 573.496 511.501 573.497 C511.221 575.087 509.35 575.415 508.073 576.167 C507.433 576.545 506.883 577.017 506.265 577.406 C504.191 578.714 501.749 579.649 499.498 580.577 C498.521 580.98 497.676 581.48",
          "7 496.612 581.593 C496.435 583.801 496.778 586.063 496.54 588.263 C496.485 588.771 496.147 589.176 496.074 589.683 C494.926 597.635 493.531 605.401 490.196 612.753 C489.291 614.751 488.273 616.669 487.288 618.626 C486.898 619.4 486.567 620.498 485.992 621.144 C485.704 621.468 485.372 621.496 484.982 621.593 C484.98 622.818 484.865 623.384 483.583 623.662 C483.583 624.067 483.669 624.6 483.507 624.",
          "983 C483.347 625.361 482.862 625.477 482.61 625.783 C482.037 626.481 481.736 627.355 481.204 628.059 C480.861 628.512 480.382 628.837 479.99 629.241 C479.266 629.99 478.936 630.961 478.279 631.702 C476.355 633.871 474.151 636.17 471.935 638.038 C471.586 638.333 471.138 638.445 470.772 638.713 C469.156 639.894 468.224 641.785 466.135 641.839 C465.725 643.405 464.705 643.861 463.19 643.872 C462.917 ",
          "645.376 461.27 646.015 459.838 646.09 C459.747 646.431 459.739 646.709 459.473 646.979 C458.77 647.693 452.651 650.48 451.434 650.902 C450.563 651.205 449.783 651.7 448.931 652.028 C448.133 652.335 447.269 652.452 446.475 652.794 C446.114 652.95 445.824 653.244 445.457 653.381 C444.697 653.665 443.749 653.64 442.949 653.868 C442.123 654.102 441.376 654.552 440.576 654.784 C439.734 655.028 438.743 ",
          "655.001 437.87 655.187 C433.584 656.097 429.156 656.958 424.769 657.146 C422.872 657.112 420.976 657.291 419.079 657.291 C416.836 657.29 414.596 657.086 412.354 657.108 C406.863 656.888 401.302 656.227 395.979 654.839 C394.844 654.543 390.908 653.053 390.071 653.694 C388.524 654.88 392.226 663.419 392.342 665.428 C392.446 667.227 393.337 668.639 393.663 670.194 C393.898 671.314 393.975 672.445 394",
          ".268 673.57 C394.455 674.29 394.837 674.939 395.024 675.641 C395.155 676.132 395.092 676.665 395.189 677.166 C395.484 678.683 395.944 680.188 396.328 681.685 C397.194 685.053 398.259 688.485 398.634 691.953 C398.901 694.433 398.69 697.095 397.803 699.436 C397.315 700.726 396.528 701.673 396.467 703.086 L394.371 703.397 C394.231 703.841 394.151 704.185 393.742 704.48 C393.441 704.698 393.021 704.69",
          "2 392.676 704.81 C389.304 705.959 385.505 706.04 381.971 705.746 L357.121 705.487 C354.758 704.987 352.184 704.031 350.347 702.407 C350.042 702.138 349.903 701.639 349.647 701.313 C349.222 700.772 348.657 700.264 348.272 699.714 C346.935 697.803 346.333 695.43 345.381 693.333 C344.621 691.66 343.707 690.064 342.995 688.384 C342.084 686.235 339.768 683.936 339.67 681.711 C338.354 681.249 337.021 67",
          "8.926 336.988 677.534 C335.471 677.18 335.192 675.529 334.088 674.546 C333.514 674.036 332.819 673.504 332.394 672.856 C332.143 672.474 332.044 672.049 331.738 671.694 C329.59 669.208 326.836 666.073 324.14 664.205 C323.019 663.427 322.126 662.5 321.028 661.677 C320.585 661.345 319.989 661.179 319.617 660.765 C319.359 660.48 319.352 660.215 319.265 659.866 C318.052 659.82 317.522 659.724 317.203 6",
          "58.465 C315.873 658.426 314.173 657.816 313.805 656.463 C313.356 656.437 312.903 656.441 312.476 656.277 C310.456 655.503 308.655 654.159 306.785 653.13 C304.953 652.123 302.817 651.302 301.204 650.058 C300.002 649.132 298.305 649.026 297.822 647.501 C296.63 647.429 296.094 647.301 295.766 646.072 C294.387 645.978 293.308 645.371 292.94 643.976 C292.44 643.946 291.914 643.964 291.477 643.677 C290.",
          "674 643.151 290.149 642.265 289.436 641.638 C287.473 639.912 282.745 636.972 282.344 634.351 C281.389 634.586 280.617 634.891 279.609 634.962 C279.321 636.501 277.697 636.691 276.5 637.53 C273.095 639.913 268.762 641.849 264.866 643.388 C251.365 648.72 239.052 650.309 224.675 647.763 C220.568 647.036 216.417 646.068 212.523 644.55 C210.573 643.79 208.519 643.185 206.622 642.324 C204.287 641.265 20",
          "2.1 639.946 199.892 638.681 C198.521 637.895 196.126 637.294 195.874 635.623 C194.396 635.532 193.286 635.199 192.895 633.614 C190.87 633.454 190.583 632.235 189.071 631.142 C188.658 630.843 188.141 630.753 187.751 630.423 C186.781 629.605 186.03 628.572 185.13 627.69 C183.815 626.402 182.545 625.072 181.24 623.774 C180.291 622.83 179.431 622.197 178.779 621.006 C177.739 619.107 176.22 619.213 176",
          ".193 616.727 C174.826 616.444 174.789 615.888 174.69 614.617 C174.349 614.538 174.06 614.537 173.782 614.285 C173.144 613.706 171.96 610.916 171.476 609.991 C170.105 607.376 169.028 604.684 167.847 601.986 C167.494 601.181 166.999 600.397 166.691 599.589 C166.346 598.684 166.235 597.144 165.918 596.091 C165.769 595.6 165.421 595.199 165.286 594.713 C164.853 593.156 165.003 588.549 163.031 588.026 ",
          "C161.864 587.716 158.731 588.199 157.37 588.265 C152.545 588.496 147.713 588.649 142.884 588.741 C131.379 588.959 119.644 587.835 108.822 583.798 C106.993 583.116 105.152 582.539 103.41 581.691 C99.825 579.945 95.843 578.432 92.617 576.109 C91.443 575.265 89.796 575.075 89.426 573.591 C88.214 573.543 87.656 573.472 87.347 572.202 C86.946 572.179 86.432 572.238 86.054 572.101 C85.669 571.961 85.531",
          " 571.474 85.232 571.221 C84.539 570.635 83.664 570.329 82.958 569.789 C82.374 569.343 81.926 568.73 81.361 568.256 C80.747 567.741 79.996 567.441 79.402 566.94 C78.962 566.568 78.68 566.058 78.271 565.657 C77.054 564.464 75.735 563.296 74.442 562.185 C73.873 561.697 73.211 561.463 72.665 560.915 C72.199 560.446 72.027 559.898 71.637 559.391 C70.953 558.502 70.129 557.628 69.356 556.813 C68.962 556",
          ".398 68.471 556.084 68.106 555.639 C67.538 554.949 67.191 554.095 66.591 553.401 C66.165 552.908 65.492 552.554 65.205 551.953 C64.987 551.498 65.047 550.932 65.041 550.442 C63.736 550.188 63.628 549.662 63.626 548.418 C61.9 547.961 61.343 545.443 60.456 544.011 C57.872 539.839 56.003 535.235 54.178 530.641 C54.01 530.219 54.001 529.755 53.828 529.332 C52.742 526.682 52.074 523.71 51.418 520.913 C",
          "48.217 507.266 48.453 492.996 51.669 479.382 C51.864 478.557 51.854 477.653 52.078 476.852 C52.198 476.42 52.523 476.072 52.672 475.647 C53.51 473.259 54.229 470.844 55.131 468.475 C56.553 464.739 58.36 460.061 60.435 456.676 C60.673 456.289 61.009 455.982 61.236 455.582 C62.049 454.152 62.663 451.814 64.336 451.362 C64.36 449.945 64.884 448.888 66.308 448.461 C66.482 446.477 68.343 445.381 69.507",
          " 443.873 C69.785 443.513 69.907 443.067 70.2 442.718 C72.019 440.551 74.351 438.832 76.302 436.821 C77.562 435.523 78.671 434.065 80.05 432.861 C80.803 432.205 81.726 431.717 82.504 431.045 C83.335 430.327 84.025 429.492 84.834 428.768 C85.74 427.959 87.446 427.6 87.849 426.222 C88.068 425.47 87.829 424.61 87.936 423.838 C87.991 423.446 88.218 423.112 88.283 422.723 C88.693 420.299 88.645 417.65 8",
          "8.987 415.174 C89.861 408.857 91.612 402.673 94.127 396.835 C95.137 394.491 95.978 392.091 97.358 389.93 C97.561 389.612 97.564 389.208 97.834 388.93 C98.096 388.658 98.378 388.647 98.714 388.549 C98.87 386.664 100.01 385.541 101.082 384.099 C101.724 383.236 101.848 382.545 102.945 382.176 C102.966 381.726 102.94 381.259 103.161 380.848 C103.525 380.172 104.295 379.746 104.782 379.162 C105.509 378",
          ".292 106.082 377.27 106.802 376.43 C108.291 374.693 110.076 372.936 111.799 371.43 C112.431 370.878 113.212 370.522 113.86 369.952 C115.268 368.711 116.33 366.953 118.316 366.897 C118.675 365.729 119.073 365.4 120.281 365.391 C120.741 364.282 121.207 363.992 122.385 363.985 C122.557 363.578 122.697 363.241 123.042 362.938 C123.447 362.582 124.165 362.494 124.647 362.211 C125.324 361.814 125.928 36",
          "1.218 126.61 360.862 C128.732 359.754 130.894 358.652 133.125 357.801 C135.762 356.796 138.337 355.689 141.042 354.863 C144.864 353.697 148.852 352.758 152.815 352.232 C155.212 351.914 157.633 351.852 160.027 351.564 C160.535 351.503 160.947 351.18 161.46 351.139 C163.504 350.975 165.619 351.127 167.669 351.127 C167.776 349.605 168.212 347.537 169.831 347.022 C169.834 345.817 170.044 345.281 171.2",
          "66 344.963 C171.267 344.573 171.173 344.021 171.371 343.666 C171.655 343.156 172.365 342.735 172.739 342.248 C173.154 341.709 173.345 341.018 173.781 340.515 C174.194 340.038 174.736 339.694 175.164 339.23 C177.049 337.191 178.961 335.249 180.998 333.361 C181.671 332.737 182.21 331.98 182.912 331.383 C183.5 330.884 184.29 330.633 184.911 330.132 C185.304 329.815 185.602 329.365 186.014 329.082 C18",
          "6.695 328.614 187.498 328.299 188.133 327.751 C188.4 327.521 188.507 327.12 188.82 326.944 C189.176 326.745 189.729 326.84 190.12 326.839 C190.562 325.564 191.034 325.458 192.315 325.405 C192.407 325.006 192.42 324.67 192.763 324.382 C193.439 323.814 194.5 323.5 195.281 323.071 C196.109 322.616 196.887 321.929 197.715 321.526 C199.869 320.477 202.055 319.536 204.308 318.643 C214.556 314.581 225.46",
          "7 312.823 236.496 313.094 C239.37 313.164 245.383 313.121 247.868 314.362 C248.217 314.536 248.423 315.007 248.693 315.279 C248.943 315.531 249.317 315.72 249.503 316.027 C251.173 318.79 249.751 322.844 247.079 324.369 C244.089 326.076 237.961 324.852 234.476 324.8 C228.571 324.711 222.59 325.307 216.859 326.754 C214.737 327.289 212.552 327.943 210.525 328.747 C209.892 328.998 209.318 329.409 208.",
          "693 329.644 C207.354 330.147 206.003 330.511 204.727 331.219 C203.229 332.049 201.659 332.731 200.173 333.61 C199.713 333.882 199.377 334.411 198.908 334.631 C198.531 334.807 198.003 334.723 197.598 334.724 C197.216 335.949 196.712 336.082 195.492 336.085 C195.413 336.435 195.412 336.703 195.161 336.992 C194.792 337.417 194.198 337.573 193.747 337.898 C192.724 338.636 191.692 339.443 190.737 340.2",
          "59 C188.245 342.386 185.721 344.773 183.676 347.34 C183.392 347.697 183.271 348.14 182.996 348.5 C182.413 349.265 181.634 349.834 181.06 350.625 C180.235 351.762 179.406 352.975 178.68 354.185 C178.465 354.545 178.459 355.034 178.181 355.345 C177.888 355.672 177.555 355.697 177.162 355.796 C177.067 357.624 175.856 359.176 175.035 360.758 C174.013 362.727 173.069 364.783 172.285 366.889 C171.487 36",
          "9.032 170.744 371.244 170.209 373.469 C170.075 374.026 170.137 374.611 169.999 375.16 C169.89 375.595 169.574 375.942 169.451 376.378 C169.142 377.482 168.957 378.629 168.767 379.758 C168.339 382.291 168.526 385.592 167.095 387.794 C164.842 391.26 159.101 391.284 156.933 387.651 C155.78 385.719 156.493 382.492 156.817 380.423 C157.523 375.915 158.701 371.567 159.74 367.137 C160.062 365.763 160.821",
          " 364.546 160.926 363.105 C157.823 362.737 154.455 363.519 151.428 364.156 C144.884 365.533 138.33 367.459 132.532 370.878 C132.095 371.136 131.793 371.542 131.373 371.808 C131.016 372.033 130.554 372.058 130.178 372.272 C129.049 372.912 127.955 373.697 126.888 374.424 C126.206 374.888 125.732 375.567 125.101 376.018 C124.806 376.229 124.409 376.244 124.099 376.456 C123.267 377.025 122.732 377.81 1",
          "21.991 378.464 C121.438 378.951 120.747 379.206 120.191 379.723 C118.985 380.845 117.709 381.99 116.668 383.271 C116.345 383.668 116.239 384.175 115.899 384.56 C115.333 385.2 114.643 385.717 114.072 386.348 C113.296 387.207 112.653 388.186 111.94 389.074 C110.928 390.335 110.401 392.684 108.787 393.112 C108.732 394.922 107.525 396.019 106.744 397.549 C105.8 399.398 104.927 401.266 104.166 403.197 ",
          "C101.487 409.989 99.76 417.194 99.665 424.516 C99.577 431.328 100.725 438.23 103.273 444.539 C104.68 448.024 107.9 451.832 108.345 455.427 C108.576 457.292 107.479 458.649 107.397 460.391 C105.071 460.536 104.091 462.47 101.184 461.345 C99.775 460.8 98.417 459.298 97.559 458.088 C97.122 457.473 96.882 456.549 96.48 455.868 C93.741 451.232 90.708 445.724 90.158 440.273 L88.604 440.273 C88.092 441.8",
          "59 86.763 442.46 85.566 443.43 C84.107 444.611 80.74 447.443 80.314 449.188 Z M213.925 372.526 C213.932 381.134 225.267 382.533 227.582 374.218 C227.798 373.442 228.039 372.941 228.037 372.105 C228.036 371.334 227.757 370.871 227.534 370.163 C225.212 362.791 213.917 364.146 213.925 372.526 Z M372.398 370.899 C371.946 372.112 372.35 373.729 372.742 374.859 C373.915 378.243 374.664 378.797 378.091 3",
          "79.647 C378.913 379.851 379.384 380.173 380.293 380.109 C380.816 380.071 381.179 379.711 381.673 379.587 C384.418 378.899 385.642 377.215 386.683 374.676 C387.199 373.418 386.811 371.526 386.311 370.368 C384.945 367.209 382.651 365.263 379.07 365.373 C378.29 365.397 377.261 365.44 376.524 365.701 C374.257 366.503 373.163 368.851 372.398 370.899 Z M457.212 504.807 C454.732 504.338 451.985 504.667 4",
          "49.463 504.645 C443.019 504.589 436.573 504.651 430.128 504.649 C420.117 504.645 410.104 504.648 400.092 504.694 C395.232 504.716 390.266 504.409 385.422 504.815 L384.168 505.046 C384.408 507.048 387.416 509.125 388.831 510.54 C392.488 514.197 395.751 518.117 399.352 521.853 C400.391 522.93 402.689 525.675 403.99 526.14 C405.066 526.524 406.641 526.142 407.743 525.988 C410.032 525.667 412.891 525.",
          "634 414.937 526.858 C415.753 527.347 416.193 527.38 416.444 528.375 C418.079 528.438 418.196 529.123 419.1 530.276 C419.541 530.839 420.121 531.363 420.51 531.956 C422.17 534.487 422.856 538.009 422.576 540.997 C422.344 543.463 421.449 545.42 420.26 547.549 C420.041 547.94 419.98 548.401 419.699 548.757 C418.918 549.746 417.987 550.359 416.958 551.022 C416.093 551.579 415.358 552.22 414.39 552.62 ",
          "C411.636 553.755 408.276 553.866 405.408 553.199 C404.186 552.915 401.719 552.015 400.701 551.344 C400.356 551.116 400.135 550.664 399.822 550.384 C399.051 549.694 397.736 548.599 397.163 547.788 C396.957 547.496 396.943 547.069 396.78 546.746 C395.773 544.748 395.035 542.856 394.968 540.563 C394.932 539.349 396.025 534.537 395.745 534.014 C395.394 533.361 394.484 532.759 393.956 532.232 C391.904 ",
          "530.179 389.622 528.214 387.745 526.001 C387.414 525.611 387.286 525.108 386.95 524.716 C383.387 520.558 379.214 517.014 375.465 513.046 C375.069 512.627 374.919 512.075 374.544 511.645 C372.865 509.723 370.408 506.866 368.384 505.39 C367.475 504.727 364.648 505.063 363.477 505.06 C362.783 505.058 362.128 504.863 361.439 504.848 C358.164 504.777 354.879 504.846 351.602 504.848 C337.336 504.856 323",
          ".069 504.773 308.803 504.833 C307.832 504.837 306.89 505.06 305.907 505.06 C305.687 507.833 305.832 510.68 305.833 513.463 C305.834 518.525 305.844 523.588 305.826 528.65 C305.82 530.258 305.454 534.713 306.008 536.006 C306.186 536.422 306.687 536.789 307.022 537.08 C308.119 538.033 312.76 539.074 314.357 539.653 C317.183 540.677 320.006 541.781 322.863 542.796 C323.927 543.173 325.105 543.395 326",
          ".137 543.816 C327.831 544.509 330.274 545.877 332.071 546.055 C332.979 546.145 333.721 545.397 334.502 545.122 C337.812 543.955 341.049 544.158 344.076 545.969 C345.059 546.558 346.144 546.84 346.731 547.947 C348.38 551.055 349.405 554.108 348.352 557.633 C348.228 558.047 348.214 558.544 348.022 558.929 C347.823 559.327 347.441 559.62 347.2 559.995 C346.71 560.758 346.398 561.411 345.696 562.031 C",
          "345.174 562.492 344.361 562.698 343.743 563.027 C341.021 564.474 336.547 565.209 333.691 563.652 C332.956 563.251 332.227 562.324 331.649 561.719 C330.143 560.144 329.545 559.167 329.323 556.979 C327.145 556.972 325.65 555.605 323.646 554.919 C318.414 553.126 313.283 550.853 308.054 548.958 C306.708 548.47 301.879 546.399 300.769 546.681 C299.161 547.09 297.83 548.272 296.446 549.088 C294.677 550.",
          "131 292.706 550.902 290.893 551.909 C289.009 552.955 286.993 553.825 285.068 554.814 C283.961 555.383 282.947 556.154 281.871 556.717 C277.479 559.015 272.898 561.059 268.489 563.431 C267.663 563.875 266.686 564.671 265.938 565.024 C263.871 566 261.819 567.052 259.765 568.098 C259.005 568.486 258.196 569.097 257.372 569.324 C256.876 569.46 256.343 569.422 255.834 569.424 C255.789 573.745 255.366 5",
          "78.106 253.279 581.948 C253.103 582.271 253.085 582.688 252.883 582.986 C252.392 583.709 250.364 585.551 249.625 586.201 C239.866 594.774 224.193 592.425 219.914 579.408 C218.193 574.175 218.802 568.408 221.4 563.599 C221.601 563.228 221.639 562.744 221.87 562.404 C222.164 561.971 222.689 561.63 223.034 561.219 C223.748 560.366 225.902 558.046 226.744 557.484 C227.042 557.284 227.457 557.266 227.7",
          "8 557.09 C231.483 555.083 235.328 554.175 239.553 554.676 C241.956 554.961 244.623 555.673 246.708 556.925 C247.299 557.279 247.782 557.754 248.4 558.08 C249.957 558.901 250.239 560.688 252.359 559.663 C254.457 558.65 256.375 557.357 258.38 556.248 C260.593 555.025 262.953 554.034 265.207 552.873 C266.891 552.005 268.476 550.994 270.101 550.068 C273.626 548.061 277.453 546.467 281.083 544.579 C282",
          ".862 543.654 284.702 542.799 286.442 541.803 C288.31 540.734 290.872 538.771 293.06 538.707 C293.22 538.047 293.383 537.819 293.909 537.406 L294.593 537.318 L294.634 505.078 L294.132 505.203 L294.283 504.706 L231.489 504.812 C230.47 504.926 229.286 504.724 228.3 504.98 C227.235 505.257 227.694 505.858 225.911 505.92 C225.821 506.275 225.806 506.519 225.556 506.817 C224.862 507.642 223.953 508.007 ",
          "223.138 508.674 C222.241 509.408 221.526 510.304 220.653 511.042 C220.304 511.336 219.859 511.464 219.495 511.736 C218.762 512.282 218.088 512.93 217.397 513.528 C216.828 514.019 216.425 514.654 215.863 515.146 C215.478 515.483 214.971 515.612 214.567 515.928 C213.515 516.75 212.692 517.78 211.686 518.628 C210.959 519.241 210.086 519.679 209.346 520.318 C208.454 521.088 207.697 522.136 206.776 522",
          ".829 C206.416 523.101 205.967 523.204 205.605 523.48 C204.732 524.145 204.014 524.951 203.191 525.652 C202.601 526.154 201.868 526.521 201.259 527.029 C200.513 527.652 199.929 528.48 199.164 529.063 C198.303 529.718 197.383 530.25 196.54 530.962 C196.012 531.408 195.639 531.998 195.111 532.441 C194.506 532.948 193.778 533.265 193.168 533.801 C190.883 535.805 188.694 537.939 186.683 540.217 C186.08",
          "8 540.891 185.674 541.775 185.076 542.406 C184.756 542.742 184.359 542.807 183.931 542.91 C183.929 544.099 183.878 544.618 182.619 544.843 C182.591 545.299 182.661 545.874 182.507 546.306 C182.376 546.675 181.054 548.475 180.71 549.126 C179.74 550.966 179.26 553.076 178.079 554.761 C177.487 557.103 176.56 559.344 176.017 561.705 C174.235 569.443 174.075 577.351 175.17 585.191 C178.539 609.305 196.",
          "703 627.928 219.559 634.904 C228.143 637.524 237.45 638.451 246.345 637.03 C263.277 634.323 275.315 624.808 288.817 615.149 C294.522 611.068 300.263 607.021 305.894 602.839 C307.414 601.711 311.754 599.155 312.575 597.717 C312.99 596.991 312.734 593.414 312.869 592.264 C313.051 590.713 313.433 589.031 314.062 587.596 C314.433 586.75 314.947 585.998 315.272 585.133 C315.874 584.762 316.054 584.126 ",
          "316.59 583.757 C317.413 583.191 318.425 582.225 319.191 581.771 C320.546 580.965 324.296 579.994 325.901 579.963 C329.121 579.899 332.12 580.809 334.725 582.604 C335.148 582.896 335.643 583.032 336.03 583.381 C336.718 584.002 337.062 584.656 337.561 585.408 C339.763 588.72 340.801 592.618 340.062 596.619 C339.856 597.739 338.954 600.826 338.334 601.696 C337.52 602.84 336.258 603.897 335.198 604.81",
          "8 C334.864 605.109 334.648 605.524 334.312 605.798 C334.036 606.023 333.609 606.035 333.292 606.198 C331.13 607.306 329.051 608.049 326.604 608.112 C325.994 607.701 321.005 606.531 320.287 606.747 C318.73 607.216 315.056 610.39 313.531 611.497 C308.921 614.842 304.169 617.974 299.521 621.265 C297.879 622.428 296.251 623.614 294.59 624.75 C293.687 625.368 292.545 625.947 291.772 626.72 C291.584 626",
          ".907 291.47 627.148 291.546 627.415 C291.84 628.452 295.026 631.366 295.934 632.222 C300.621 636.642 306.164 640.09 311.844 643.082 C316.499 645.534 321.267 647.991 325.597 650.993 C333.369 656.383 340.367 663.635 345.911 671.275 C349.533 676.265 352.668 681.556 355.228 687.165 C355.857 688.543 357.411 693.458 358.557 694.063 C359.898 694.772 365.022 694.373 366.77 694.392 C373.598 694.465 380.461",
          " 694.532 387.286 694.325 C387.291 691.036 386.343 687.851 385.52 684.687 C384.767 681.794 384.055 678.887 383.329 675.987 C381.723 669.572 380.079 663.167 378.485 656.751 C377.681 653.516 377.001 649.257 375.372 646.361 C374.738 645.234 373.49 644.474 372.551 643.619 C371.574 642.73 370.661 641.763 369.789 640.771 C368.201 638.965 366.714 637.025 365.469 634.966 C364.788 633.84 364.252 632.428 363",
          ".424 631.413 C363.273 631.229 363.119 631.263 362.929 631.169 C362.903 629.499 361.746 627.622 361.226 626.008 C360.632 624.168 360.272 622.186 360.021 620.272 C358.677 609.985 361.466 598.421 368.322 590.614 C370.247 588.422 372.309 586.571 374.42 584.573 C374.702 584.306 374.905 583.795 375.27 583.642 C375.607 583.5 376.06 583.571 376.417 583.569 C376.846 582.409 377.329 582.185 378.526 582.181 ",
          "C378.659 581.833 378.751 581.5 379.036 581.238 C379.579 580.736 380.572 580.413 381.242 580.094 C384.387 578.6 387.613 577.369 391.039 576.589 C398.707 574.843 405.465 575.458 412.963 577.601 C414.474 578.033 415.886 578.767 417.381 579.292 C422.724 581.167 427.966 582.791 433.717 582.775 C438.116 582.762 441.757 580.998 445.675 579.32 C447.359 578.599 449.461 576.821 451.379 577.12 C452.776 577.3",
          "39 457.143 579.098 457.795 580.294 C458.217 581.069 458.907 582.139 458.821 583.063 C458.69 584.474 456.758 585.571 455.816 586.426 C455.527 586.689 455.329 587.155 454.984 587.34 C454.666 587.509 454.205 587.434 453.858 587.437 C452.949 589.31 449.069 590.33 447.202 591.089 C439.646 594.161 431.678 594.977 423.718 593.162 C422.754 592.943 421.603 592.951 420.686 592.65 C420.261 592.51 419.925 592",
          ".182 419.497 592.031 C413.66 589.973 407.308 587.366 401.108 586.885 C395.446 586.445 390.984 588.137 386.081 590.591 C385.238 591.013 384.32 591.391 383.545 591.945 C383.029 592.313 382.645 592.827 382.144 593.208 C381.74 593.514 381.232 593.605 380.824 593.92 C378.39 595.804 376.221 598.374 374.642 600.99 C372.799 604.044 371.958 607.285 371.03 610.674 C370.594 613.801 370.426 616.995 371.095 62",
          "0.106 C373.962 633.445 383.415 639.767 395.901 643.059 C399.686 644.057 403.517 644.832 407.42 645.187 C409.427 645.37 411.441 645.357 413.451 645.455 C417.888 645.672 422.286 645.839 426.719 645.43 C456.089 642.722 480.234 621.707 484.773 592.145 C485.696 586.134 485.582 580.118 484.961 574.089 C484.34 571.432 484.268 568.642 483.714 565.961 C483.075 562.871 482.078 559.825 480.889 556.906 C480.6",
          "74 556.377 480.275 555.942 480.073 555.421 C479.724 554.516 479.474 553.607 479.059 552.711 C478.356 551.195 477.639 549.694 476.812 548.241 C476.588 547.848 476.236 547.586 475.996 547.214 C475.111 545.843 473.484 542.813 473.644 541.171 C474.007 537.461 478.706 534.962 481.971 536.816 C482.592 537.169 483.257 538.075 483.743 538.609 C484.698 539.659 485.013 539.468 485.039 541.009 C486.662 541.4",
          "89 486.925 543.885 488.292 545.097 C488.528 547.276 490.469 550.557 491.293 552.762 C493.24 557.975 495.178 564.177 495.505 569.747 C497.915 569.711 500.309 567.892 502.324 566.684 C507.542 563.556 512.468 559.896 516.95 555.78 C523.404 549.853 528.394 542.508 532.208 534.655 C542.068 514.355 542.752 492.782 534.435 471.796 C530.674 462.306 525.083 454.066 517.938 446.796 C517.048 445.89 511.603 4",
          "40.367 510.73 440.771 C510.142 441.044 509.626 444.165 509.439 444.902 C508.815 447.365 508.037 449.754 507.058 452.099 C506.427 453.612 505.566 455.12 505.152 456.702 C503.392 460.14 500.75 466.38 497.325 468.346 C496.646 468.736 495.573 468.773 494.813 468.707 C491.625 468.43 489.106 465.842 489.442 462.519 C489.729 459.673 491.972 456.674 493.368 454.254 C494.675 451.986 495.873 449.582 496.865",
          " 447.161 C500.441 438.425 501.344 428.672 500.494 419.291 C499.96 413.4 498.292 407.422 495.956 401.995 C495.775 401.575 495.454 401.242 495.273 400.829 C494.862 399.891 494.59 398.928 494.111 397.998 C493.872 397.535 493.505 397.188 493.247 396.746 C492.781 395.945 492.488 395.03 492.043 394.21 C491.42 393.061 490.629 391.999 489.933 390.905 C489.504 390.231 488.76 389.784 488.371 389.096 C488.14",
          "1 388.69 488.169 388.221 488.147 387.773 C486.462 387.217 485.902 385.617 484.811 384.414 C483.429 382.889 481.969 381.38 480.391 380.055 C479.995 379.723 479.506 379.548 479.113 379.217 C478.376 378.596 477.791 377.842 477.025 377.241 C476.618 376.921 476.12 376.794 475.712 376.49 C475.162 376.078 474.731 375.528 474.165 375.129 C472.734 374.12 471.23 373.261 469.686 372.446 C469.107 372.141 468.",
          "64 371.606 468.053 371.277 C465.461 369.82 462.711 368.488 459.939 367.394 C446.123 361.939 431.401 361.933 417.122 365.629 C416.617 365.76 416.225 366.092 415.738 366.241 C414.942 366.484 414.043 366.444 413.219 366.676 C410.397 367.47 407.63 368.466 404.851 369.398 C402.571 370.162 400.49 371.205 398.096 371.469 C398.083 374.861 397.274 378.467 395.675 381.436 C395.322 382.091 394.572 382.686 39",
          "4.136 383.328 C393.128 384.814 392.244 386.392 390.272 386.489 C389.416 388.712 385.701 388.409 384.991 390.517 C384.638 391.564 384.872 393.021 384.878 394.116 C384.892 396.876 384.92 399.638 384.9 402.399 C384.83 411.831 384.905 421.267 384.902 430.7 C384.901 433.921 384.897 437.142 384.901 440.364 C384.903 441.553 384.655 442.984 384.928 444.145 C385.054 444.684 385.595 445.289 386.083 445.539 ",
          "C386.949 445.984 390.725 445.697 391.899 445.699 C396.673 445.707 401.449 445.663 406.222 445.7 C407.866 445.712 411.332 446.177 412.671 445.26 C414.132 444.258 414.925 442.701 415.997 441.38 C417.21 439.885 423.845 433.158 425.248 432.577 C425.272 430.99 424.948 429.533 424.803 427.961 C424.501 424.699 425.098 421.169 427.017 418.506 C427.352 418.041 427.485 417.482 427.877 417.055 C428.538 416.3",
          "35 429.271 415.984 430.045 415.429 C431.773 414.192 433.834 413.075 435.936 412.655 C439.07 412.029 442.291 412.811 445.077 414.194 C445.399 414.354 445.815 414.374 446.107 414.579 C448.657 416.369 450.853 419.313 451.647 422.292 C453.686 429.948 449.289 437.959 441.552 439.925 C440.327 440.237 439.047 440.33 437.788 440.261 C436.123 440.171 434.534 439.528 432.971 440.403 C431.226 441.381 429.74 ",
          "443.368 428.356 444.789 C425.588 447.629 422.818 450.478 420.013 453.281 C419.438 453.856 417.601 455.858 417.002 456.137 C413.905 457.581 408.677 457.006 405.269 457.011 C398.38 457.022 391.447 456.793 384.563 457.015 C383.721 457.042 382.976 457.448 382.099 457.472 C382.081 457.858 382.116 458.277 381.945 458.637 C381.762 459.026 381.322 459.178 381.078 459.52 C380.17 460.796 379.451 462.221 378",
          ".695 463.575 C378.54 463.854 378.523 464.193 378.296 464.432 C377.995 464.75 377.637 464.744 377.241 464.812 C377.234 466.017 377.216 466.645 375.956 467 C375.904 468.321 375.246 470.039 373.917 470.425 C373.88 470.861 373.88 471.323 373.708 471.733 C373.277 472.76 372.281 473.528 371.865 474.601 C371.752 474.894 371.741 475.206 371.528 475.454 C371.231 475.802 370.891 475.94 370.486 476.111 C370.",
          "378 477.432 369.635 479.036 368.345 479.493 C368.326 479.893 368.341 480.289 368.194 480.671 C367.872 481.507 367.04 482.29 366.576 483.079 C366.339 483.48 366.309 484.051 366.015 484.397 C365.707 484.761 365.34 484.848 364.911 484.978 C364.891 485.435 364.907 485.888 364.696 486.311 C364.16 487.386 360.385 492.241 361.189 493.114 C361.854 493.837 366.298 493.502 367.427 493.505 C373.409 493.518 3",
          "79.391 493.489 385.373 493.481 C401.882 493.461 418.39 493.571 434.898 493.486 C440.074 493.459 445.252 493.467 450.429 493.478 C451.964 493.481 455.068 493.781 456.431 493.397 C458.085 492.93 457.906 489.806 459.743 489.22 C459.76 488.839 459.687 488.294 459.872 487.95 C459.999 487.714 463.93 483.748 464.226 483.556 C464.562 483.338 465.127 483.438 465.507 483.437 C465.933 482.124 467.415 481.777",
          " 468.635 481.377 C472.12 480.236 475.722 479.857 479.335 480.656 C481.195 481.068 482.743 481.798 484.435 482.601 C484.762 482.756 485.182 482.766 485.475 482.975 C485.777 483.19 485.975 483.535 486.263 483.771 C487.952 485.155 489.551 486.715 490.867 488.45 C491.367 489.109 491.656 490.06 491.94 490.83 C493.139 494.087 493.766 497.1 493.455 500.597 C492.548 510.809 483.72 517.915 473.557 517.184 ",
          "C469.924 516.922 466.138 515.427 463.276 513.162 C462.697 512.704 462.268 512.057 461.754 511.529 C460.583 510.324 459.95 510.229 459.78 508.412 C458.416 508.051 457.771 506.331 457.714 504.995 Z M118.024 498.848 C117.911 507.392 130.347 509.332 132.312 500.917 C132.455 500.306 132.766 499.786 132.776 499.148 C132.949 488.618 118.158 488.679 118.024 498.848 Z M467.997 498.848 C467.941 508.222 482.",
          "125 509.024 482.121 498.537 C482.117 488.694 468.056 488.953 467.997 498.848 Z M230.213 572.203 C229.873 572.977 230.251 573.666 230.493 574.371 C230.691 574.948 230.654 575.631 230.91 576.181 C231.597 577.654 233.41 579.2 234.979 579.611 C237.653 580.312 241.218 579.972 243.061 577.669 C243.688 576.886 244.018 575.858 244.441 574.963 C244.776 574.256 244.703 573.189 244.654 572.424 C244.382 568.1",
          "92 240.591 565.082 236.318 565.84 C234.117 566.23 231.716 567.887 230.856 570 C230.565 570.715 230.528 571.489 230.213 572.203 Z"
        ].join("")],
        ["2", [
          "M48.784 384.26 C48.773 382.621 49.16 380.427 50.245 379.145 C52.714 376.227 57.772 376.228 60.848 378.076 C61.179 378.275 61.308 378.636 61.584 378.887 C61.847 379.124 62.24 379.236 62.458 379.521 C63.174 380.461 63.669 383.029 63.671 384.216 C63.674 386.766 62.543 389.751 60.265 391.138 C59.953 391.328 59.524 391.333 59.178 391.444 C56.168 392.411 52.243 391.9 50.166 389.286 C49.113 387.959 48.79",
          "4 385.908 48.784 384.26 Z"
        ].join("")],
        ["2", "M536.249 383.571 C536.495 377.913 541.055 375.767 546.11 377.399 C546.859 377.64 548.032 377.854 548.628 378.363 C550.346 379.829 551.119 382.365 551.029 384.571 C550.936 386.843 549.711 389.978 547.584 391.121 C546.894 391.492 545.737 391.65 544.96 391.752 C539.84 392.427 536.029 388.643 536.249 383.571 Z"],
        ["3", "M231.946 232.398 C231.963 234.468 231.767 236.538 231.765 238.611 C231.763 240.453 231.956 242.292 231.93 244.132 L231.063 244.132 L231.079 232.398 Z"],
        ["3", "M294.305 337.545 C290.798 337.744 287.278 337.712 283.767 337.716 C281.549 337.718 279.23 337.911 277.048 337.474 C277.622 336.486 280.103 337.116 281.214 337.1 C285.536 337.042 289.993 336.709 294.305 337.026 Z"],
        ["3", "M213.925 372.526 C213.917 364.146 225.212 362.791 227.534 370.163 C227.757 370.871 228.036 371.334 228.037 372.105 C228.039 372.941 227.798 373.442 227.582 374.218 C225.267 382.533 213.932 381.134 213.925 372.526 Z"],
        ["3", [
          "M372.398 370.899 C373.163 368.851 374.257 366.503 376.524 365.701 C377.261 365.44 378.29 365.397 379.07 365.373 C382.651 365.263 384.945 367.209 386.311 370.368 C386.811 371.526 387.199 373.418 386.683 374.676 C385.642 377.215 384.418 378.899 381.673 379.587 C381.179 379.711 380.816 380.071 380.293 380.109 C379.384 380.173 378.913 379.851 378.091 379.647 C374.664 378.797 373.915 378.243 372.742 37",
          "4.859 C372.35 373.729 371.946 372.112 372.398 370.899 Z"
        ].join("")],
        ["3", "M294.713 387.387 L294.703 431.177 C294.53 431.091 294.347 431.163 294.242 430.948 C293.878 430.207 294.129 421.935 294.154 420.497 C294.349 409.469 294.185 398.418 294.196 387.387 Z"],
        ["3", "M227.183 389.975 L227.047 434.536 C227.04 436.677 227.497 448.327 226.414 449.147 L226.36 390.184 C226.634 390.113 226.907 390.041 227.183 389.975 Z"],
        ["3", "M305.786 418.084 C307.183 419.102 306.452 423.777 306.472 425.442 L306.73 447.237 C306.394 447.263 306.062 447.275 305.727 447.286 Z"],
        ["3", [
          "M488.292 545.097 C492.513 544.93 499.985 536.73 502.619 533.509 C513.146 520.639 517.466 502.75 515.766 486.364 C515.508 483.874 515.436 481.286 514.766 478.866 C514.323 477.268 514.1 475.61 513.654 474.006 C512.471 469.751 510.844 465.615 508.954 461.632 C508.493 460.661 506.99 457.45 506.255 456.884 C505.946 456.646 505.516 456.712 505.152 456.702 C505.566 455.12 506.427 453.612 507.058 452.099 ",
          "C508.037 449.754 508.815 447.365 509.439 444.902 C509.626 444.165 510.142 441.044 510.73 440.771 C511.603 440.367 517.048 445.89 517.938 446.796 C525.083 454.066 530.674 462.306 534.435 471.796 C542.752 492.782 542.068 514.355 532.208 534.655 C528.394 542.508 523.404 549.853 516.95 555.78 C512.468 559.896 507.542 563.556 502.324 566.684 C500.309 567.892 497.915 569.711 495.505 569.747 C495.178 564",
          ".177 493.24 557.975 491.293 552.762 C490.469 550.557 488.528 547.276 488.292 545.097 Z"
        ].join("")],
        ["3", "M293.891 445.024 C294.167 445.038 294.424 445.074 294.689 445.108 L294.506 493.325 L293.988 493.325 Z"],
        ["3", [
          "M80.314 449.188 C80.155 451.039 79.086 452.853 78.545 454.638 C77.865 456.882 77.361 459.374 76.988 461.688 C75.063 473.633 75.896 486.33 78.33 498.136 C78.788 500.358 79.634 502.492 80.279 504.667 C91.031 540.893 128.024 562.056 164.79 554.177 C165.564 554.011 166.237 553.579 166.999 553.38 C166.559 555.852 165.525 558.226 164.983 560.689 C163.863 565.783 163.366 571.245 163.347 576.461 C149.974 ",
          "577.304 136.207 578.451 122.941 576.003 C98.317 571.46 76.648 554.243 66.907 531.132 C57.866 509.681 58.43 488.235 67.866 466.999 C70.045 462.095 72.888 457.558 76.183 453.324 C77.214 452 78.624 449.537 80.314 449.188 Z"
        ].join("")],
        ["3", "M305.79 476.068 C306.865 476.862 306.493 490.847 306.51 493.203 L305.822 493.203 Z"],
        ["3", "M118.024 498.848 C118.158 488.679 132.949 488.618 132.776 499.148 C132.766 499.786 132.455 500.306 132.312 500.917 C130.347 509.332 117.911 507.392 118.024 498.848 Z"],
        ["3", "M467.997 498.848 C468.056 488.953 482.117 488.694 482.121 498.537 C482.125 509.024 467.941 508.222 467.997 498.848 Z"],
        ["3", "M209.027 506.329 L209.028 505.467 L143.202 505.437 L143.264 504.75 L210.383 504.7 C210.088 505.538 209.773 505.856 209.027 506.329 Z"],
        ["3", "M231.489 504.812 L294.283 504.706 L294.132 505.203 C291.596 505.673 288.797 505.371 286.224 505.331 C283.297 505.286 280.364 505.342 277.436 505.321 C267.037 505.247 256.638 505.333 246.241 505.4 C242.505 505.424 238.769 505.405 235.033 505.405 C234.382 505.405 232.148 505.614 231.681 505.309 C231.49 505.184 231.558 504.99 231.489 504.812 Z"],
        ["3", "M385.422 504.815 C390.266 504.409 395.232 504.716 400.092 504.694 C410.104 504.648 420.117 504.645 430.128 504.649 C436.573 504.651 443.019 504.589 449.463 504.645 C451.985 504.667 454.732 504.338 457.212 504.807 L457.163 505.276 C438.924 505.28 420.685 505.405 402.442 505.405 L389.493 505.405 C388.757 505.405 386.136 505.645 385.617 505.311 C385.423 505.187 385.492 504.993 385.422 504.815 Z"],
        ["3", "M294.132 505.203 L294.634 505.078 L294.593 537.318 L293.909 537.406 C294.061 529.652 293.94 521.897 293.993 514.14 C294.011 511.537 293.602 507.627 294.132 505.203 Z"],
        ["3", [
          "M178.079 554.761 C178.254 554.842 178.44 554.771 178.55 554.98 C178.755 555.366 178.946 559.659 179.099 560.543 C180.052 566.055 181.239 571.582 183.333 576.789 C188.825 590.439 198.741 602.209 211.835 609.115 C230.316 618.861 251.233 617.212 269.083 606.807 C273.651 604.145 277.999 601.162 282.232 597.994 C285.58 595.488 288.779 592.751 292.39 590.621 C295.932 588.532 302.135 586.145 306.159 585.",
          "289 C309.163 584.649 312.245 585.133 315.272 585.133 C314.947 585.998 314.433 586.75 314.062 587.596 C313.433 589.031 313.051 590.713 312.869 592.264 C312.734 593.414 312.99 596.991 312.575 597.717 C311.754 599.155 307.414 601.711 305.894 602.839 C300.263 607.021 294.522 611.068 288.817 615.149 C275.315 624.808 263.277 634.323 246.345 637.03 C237.45 638.451 228.143 637.524 219.559 634.904 C196.703",
          " 627.928 178.539 609.305 175.17 585.191 C174.075 577.351 174.235 569.443 176.017 561.705 C176.56 559.344 177.487 557.103 178.079 554.761 Z"
        ].join("")],
        ["3", [
          "M230.213 572.203 C230.528 571.489 230.565 570.715 230.856 570 C231.716 567.887 234.117 566.23 236.318 565.84 C240.591 565.082 244.382 568.192 244.654 572.424 C244.703 573.189 244.776 574.256 244.441 574.963 C244.018 575.858 243.688 576.886 243.061 577.669 C241.218 579.972 237.653 580.312 234.979 579.611 C233.41 579.2 231.597 577.654 230.91 576.181 C230.654 575.631 230.691 574.948 230.493 574.371 C",
          "230.251 573.666 229.873 572.977 230.213 572.203 Z"
        ].join("")],
        ["3", [
          "M484.961 574.089 C485.582 580.118 485.696 586.134 484.773 592.145 C480.234 621.707 456.089 642.722 426.719 645.43 C422.286 645.839 417.888 645.672 413.451 645.455 C411.441 645.357 409.427 645.37 407.42 645.187 C403.517 644.832 399.686 644.057 395.901 643.059 C383.415 639.767 373.962 633.445 371.095 620.106 C370.426 616.995 370.594 613.801 371.03 610.674 C373.677 610.789 378.631 613.562 381.224 614",
          ".694 C387.946 617.63 394.734 620.632 401.948 622.149 C420.749 626.102 442.117 620.327 453.986 604.585 C456.645 601.058 458.979 597.025 460.244 592.767 C460.843 590.753 461.396 588.632 461.26 586.516 C461.163 585.028 460.792 583.569 460.806 582.078 C462.702 582.071 466.339 580.555 468.302 579.895 C471.559 578.8 474.88 577.868 478.17 576.888 C479.926 576.365 482.29 575.963 483.882 575.086 C484.29 57",
          "4.861 484.616 574.401 484.961 574.089 Z"
        ].join("")],
        ["3", [
          "M326.604 608.112 C326.6 608.728 326.483 608.866 326.058 609.358 C326.555 609.345 326.99 609.141 327.467 609.118 C328.279 609.079 328.658 609.322 329.491 608.993 C329.693 609.887 330.748 611.97 331.309 612.713 C331.525 612.999 331.956 612.997 332.149 613.304 C332.376 613.665 332.082 614.097 332.222 614.478 C332.346 614.815 332.759 614.9 332.961 615.183 C333.182 615.495 333.245 615.897 333.485 616.1",
          "97 C333.882 616.694 334.643 616.91 334.916 617.519 C335.085 617.896 334.841 618.504 334.78 618.897 L335.845 619.039 L335.845 620.42 C337.194 620.722 337.048 621.163 336.945 622.409 C337.29 622.394 337.635 622.384 337.98 622.37 L338.023 623.88 C339.346 624.232 340.162 625.872 340.306 627.189 L341.424 627.27 C341.676 628.501 342.517 629.122 343.263 630.038 C345.491 632.775 347.428 634.761 351.154 63",
          "4.83 C352.288 634.851 354.539 635.266 355.09 634.144 C355.579 634.154 356.202 634.362 356.669 634.284 C357.458 634.151 358.148 633.745 358.882 633.501 C360.022 633.121 361.495 633.231 362.457 632.359 C362.737 632.106 362.813 631.517 362.929 631.169 C363.119 631.263 363.273 631.229 363.424 631.413 C364.252 632.428 364.788 633.84 365.469 634.966 C366.714 637.025 368.201 638.965 369.789 640.771 C370.",
          "661 641.763 371.574 642.73 372.551 643.619 C373.49 644.474 374.738 645.234 375.372 646.361 C377.001 649.257 377.681 653.516 378.485 656.751 C380.079 663.167 381.723 669.572 383.329 675.987 C384.055 678.887 384.767 681.794 385.52 684.687 C386.343 687.851 387.291 691.036 387.286 694.325 C380.461 694.532 373.598 694.465 366.77 694.392 C365.022 694.373 359.898 694.772 358.557 694.063 C357.411 693.458 ",
          "355.857 688.543 355.228 687.165 C352.668 681.556 349.533 676.265 345.911 671.275 C340.367 663.635 333.369 656.383 325.597 650.993 C321.267 647.991 316.499 645.534 311.844 643.082 C306.164 640.09 300.621 636.642 295.934 632.222 C295.026 631.366 291.84 628.452 291.546 627.415 C291.47 627.148 291.584 626.907 291.772 626.72 C292.545 625.947 293.687 625.368 294.59 624.75 C296.251 623.614 297.879 622.42",
          "8 299.521 621.265 C304.169 617.974 308.921 614.842 313.531 611.497 C315.056 610.39 318.73 607.216 320.287 606.747 C321.005 606.531 325.994 607.701 326.604 608.112 Z"
        ].join("")],
        ["3", "M412.354 657.108 C414.596 657.086 416.836 657.29 419.079 657.291 C420.976 657.291 422.872 657.112 424.769 657.146 C424.767 657.481 424.73 657.782 424.687 658.099 C420.584 658.102 416.442 658.363 412.354 657.971 C412.354 657.683 412.354 657.396 412.354 657.108 Z"],
        ["3", "M357.121 705.487 L381.971 705.746 L381.971 706.436 L357.16 706.483 C357.14 706.15 357.121 705.823 357.121 705.487 Z"],
        ["4", [
          "M294.578 147.493 C294.637 140.809 294.523 134.123 294.623 127.44 C294.66 125.005 294.249 122.224 294.966 119.864 C296.53 114.718 304.424 115.64 305.307 121.756 C305.589 123.701 305.373 125.836 305.373 127.801 C305.374 132.122 305.351 136.445 305.392 140.767 C305.422 143.892 305.988 148.334 304.864 151.234 C303.08 155.837 297.194 156.539 295.075 151.752 C294.504 150.463 294.566 148.874 294.578 147.",
          "493 Z"
        ].join("")],
        ["4", [
          "M211.611 156.466 C211.558 152.453 216.477 150.061 219.808 151.947 C222.356 153.39 224.182 155.886 226.234 157.914 C229.826 161.465 233.492 164.998 236.936 168.692 C238.77 170.66 241.369 172.895 241.184 175.848 C240.966 179.319 237.255 182.821 233.738 180.921 C231.374 179.643 229.577 177.186 227.711 175.302 C223.95 171.504 220.213 167.673 216.361 163.964 C214.252 161.932 211.653 159.625 211.611 156",
          ".466 Z"
        ].join("")],
        ["4", "M359.227 175.793 C359.086 172.667 361.442 170.659 363.41 168.595 C365.981 165.9 368.876 163.534 371.478 160.875 C374.017 158.28 377.454 154.063 380.475 152.241 C383.694 150.3 388.14 152.527 388.59 156.234 C388.96 159.273 386.261 161.454 384.388 163.41 C380.534 167.435 376.514 171.335 372.544 175.248 C370.891 176.878 369.263 178.993 367.22 180.145 C363.916 182.008 359.4 179.653 359.227 175.793 Z"],
        ["4", [
          "M326.03 314.66 C322.569 315.035 319.071 314.932 315.595 314.852 C315.289 314.24 314.868 313.599 314.697 312.929 C314.366 311.632 314.492 310.134 314.464 308.804 C314.397 305.699 314.409 302.59 314.438 299.485 C314.545 288.282 314.751 277.079 315.213 265.886 C318.383 265.733 321.487 265.47 324.187 263.627 C326.733 261.889 328.898 260.146 330.372 257.346 C338.385 242.125 316.291 230.116 308.217 246.",
          "449 C306.713 249.492 305.978 252.816 305.397 256.143 C301.934 256.561 298.403 256.587 294.924 256.353 C294.021 250.667 292.122 244.555 286.893 241.363 C278.182 236.047 268.721 241.702 268.836 251.801 C268.903 257.659 272.464 262.796 277.659 265.345 C279.244 266.122 284.229 266.693 284.88 268.081 C285.485 269.369 285.251 272.24 285.327 273.726 C285.455 276.25 285.699 278.772 285.84 281.297 C286.254",
          " 288.707 286.552 296.116 286.627 303.538 C286.665 307.35 286.833 311.185 286.446 314.98 L274.222 314.817 C273.548 311.777 273.423 308.661 272.885 305.596 C272.046 300.807 270.529 296.062 268.342 291.718 C263.748 282.597 256.01 275.725 250.789 267.042 C243.269 254.534 241.21 241.785 243.921 227.482 C244.779 222.955 246.092 218.374 248.154 214.235 C251.294 207.93 255.398 202.046 260.643 197.296 C265",
          ".697 192.717 271.347 188.696 277.624 185.964 C294.721 178.522 315.45 180.395 331.15 190.362 C339.23 195.491 345.866 202.619 350.73 210.818 C354.461 217.107 356.524 224.412 357.439 231.626 C359.007 243.997 355.91 256.464 349.507 267.028 C346.145 272.575 341.757 277.408 337.862 282.569 C335.796 285.306 333.988 288.278 332.353 291.289 C329.851 295.895 328.249 300.861 327.251 305.983 C327.132 306.596 ",
          "326.864 307.189 326.776 307.802 C326.45 310.079 326.38 312.384 326.03 314.66 Z M253.266 233.08 C253.838 236.658 260.013 237.923 262.151 235.029 C263.296 233.478 262.938 231.351 263.259 229.545 C263.555 227.879 264.093 226.181 264.619 224.574 C266.338 219.33 270.366 213.899 274.208 209.999 C274.863 209.334 275.689 208.815 276.414 208.231 C280.467 204.971 284.275 203.092 289.163 201.368 C291.247 200",
          ".633 294.648 200.434 296.448 199.316 C296.842 199.071 297.091 198.687 297.405 198.358 C299.288 196.389 299.222 194.035 297.347 192.035 C296.616 191.255 295.581 190.699 294.517 190.578 C293.505 190.462 292.616 190.799 291.639 190.968 C287.391 191.701 283.046 192.886 279.226 194.941 C268.94 200.476 261.627 206.69 256.766 217.578 C256.272 218.684 255.972 219.844 255.547 220.969 C254.471 223.817 252.7",
          "91 230.109 253.266 233.08 Z"
        ].join("")],
        ["4", [
          "M455.409 234.468 C455.319 231.601 457.234 228.607 458.463 226.124 C462.362 218.246 465.222 213.868 472.399 208.571 C473.68 207.626 475.197 206.937 476.655 206.316 C479.487 205.11 482.488 204.283 484.847 206.925 C486.628 208.92 487.022 211.659 485.282 213.779 C484.021 215.316 482.134 215.784 480.414 216.589 C477.728 217.844 474.96 219.534 473.033 221.837 C471.295 223.914 469.917 226.456 468.826 228",
          ".924 C467.58 231.74 466.905 235.749 464.357 237.726 C461.618 239.851 455.532 238.371 455.409 234.468 Z"
        ].join("")],
        ["4", [
          "M128.691 238.479 C131.267 238.553 132.506 237.904 134.852 237.149 C139.323 235.71 143.682 235.761 147.586 238.683 C151.244 241.422 152.776 246.248 153.532 250.569 C153.963 253.032 154.234 255.613 155.418 257.862 C156.838 260.556 160.488 260.473 161.656 263.744 C162.46 265.997 161.198 268.881 158.953 269.752 C157.121 270.463 155.01 270.108 153.289 269.272 C147.505 266.464 145.008 260.516 143.826 25",
          "4.538 C143.431 252.54 143.326 248.983 141.931 247.5 C140.217 245.678 138.16 246.93 136.245 247.625 C133.017 248.796 129.09 250.038 125.653 248.871 C121.282 247.386 118.419 244.011 117.361 239.568 C116.751 237.008 116.962 233.807 115.142 231.732 C112.144 228.316 106.779 233.159 104.203 228.169 C103.575 226.953 103.632 225.604 104.045 224.331 C105.842 218.802 113.538 218.807 117.942 220.765 C122.378",
          " 222.737 125.333 226.337 126.565 231.031 C127.235 233.588 127.57 236.059 128.691 238.479 Z"
        ].join("")],
        ["4", [
          "M178.866 239.991 C178.932 237.09 181.3 235.102 184.05 234.767 C187.999 234.285 193.252 234.722 197.342 234.728 C201.721 234.734 206.275 234.355 210.634 234.801 C213.459 235.09 215.85 237.236 215.83 240.188 C215.808 243.335 213.264 245.363 210.31 245.702 C208.374 245.924 206.387 245.789 204.443 245.782 C201.276 245.772 198.112 245.823 194.945 245.8 C191.379 245.775 187.608 246.148 184.074 245.591 C",
          "181.197 245.138 178.795 243.092 178.866 239.991 Z"
        ].join("")],
        ["4", [
          "M384.806 239.484 C385.576 236.576 387.808 235.147 390.693 234.847 C392.524 234.657 394.383 234.76 396.22 234.743 C399.964 234.709 403.708 234.738 407.452 234.719 C410.114 234.705 415.051 234.33 417.461 234.903 C420.431 235.608 422.149 238.57 421.474 241.503 C420.727 244.755 417.561 245.706 414.64 245.779 C409.463 245.909 404.268 245.759 399.089 245.75 C396.142 245.744 393.034 246.046 390.108 245.6",
          "39 C387.357 245.256 383.961 242.67 384.806 239.484 Z"
        ].join("")],
        ["4", "M322.101 249.154 C322.144 253.414 321.041 254.185 316.918 254.765 C317.392 253.021 318.071 250.227 320.041 249.481 C320.675 249.241 321.438 249.239 322.101 249.154 Z"],
        ["4", "M283.921 255.733 C279.77 255.168 279.148 254.446 278.309 250.37 C279.032 250.35 279.917 250.193 280.636 250.349 C282.87 250.836 283.56 253.934 283.921 255.733 Z"],
        ["4", "M304.11 293.833 L303.719 313.903 L303.356 314.949 L297.552 314.862 C297.435 303.449 296.956 291.993 296.545 280.576 C296.382 276.045 296.041 271.5 296.039 266.967 L304.133 266.838 C304.501 269.892 304.298 272.996 304.26 276.07 C304.186 281.985 304.028 287.918 304.11 293.833 Z"],
        ["4", [
          "M196.52 282.79 C196.694 280.477 198.255 279.009 200.17 277.957 C203.687 276.026 207.368 274.351 210.957 272.56 C213.211 271.436 215.646 269.74 218.193 269.414 C221.509 268.989 224.445 271.677 224.311 275.009 C224.206 277.626 221.997 278.926 219.973 280.105 C217.403 281.603 214.609 282.757 211.96 284.113 C208.896 285.681 205.703 287.905 202.244 288.42 C198.867 288.922 196.274 286.047 196.52 282.79 ",
          "Z"
        ].join("")],
        ["4", [
          "M376.291 274.506 C376.38 271.242 379.247 268.926 382.438 269.438 C384.064 269.699 385.433 270.533 386.891 271.233 C389.48 272.475 392.041 273.782 394.596 275.093 C396.843 276.247 399.213 277.154 401.339 278.526 C403.035 279.621 403.982 281.471 403.847 283.485 C403.609 287.035 400.371 288.571 397.152 288.011 C394.352 287.524 391.078 285.466 388.513 284.192 C385.399 282.646 382.095 281.358 379.16 27",
          "9.487 C377.445 278.394 376.236 276.569 376.291 274.506 Z"
        ].join("")],
        ["5", "M304.11 293.833 C304.112 296.778 304.749 312.445 303.719 313.903 Z"],
        ["5", [
          "M80.964 357.113 C79.658 357.311 78.241 357.689 77.045 356.917 C75.569 355.963 74.174 350.013 73.383 348.155 C72.693 346.534 71.737 344.949 70.448 343.734 C68.938 342.311 66.94 341.496 64.96 340.975 C62.206 340.252 57.799 340.499 56.654 337.292 C56.196 336.009 56.799 334.438 57.866 333.644 C61.039 331.285 66.344 331.517 69.603 328.441 C70.605 327.494 71.39 326.335 72 325.1 C73.296 322.474 75.22 314",
          ".44 77.861 313.507 C79.899 312.787 81.439 314.499 82.209 316.172 C84.111 320.307 84.752 324.957 87.919 328.436 C88.944 329.561 90.394 330.387 91.801 330.929 C94.588 332.003 100.334 332.433 100.975 335.93 C101.123 336.735 100.953 337.513 100.482 338.184 C98.99 340.308 95.497 340.207 93.22 340.795 C91.381 341.27 89.589 341.966 88.062 343.111 C83.611 346.444 83.387 352.528 80.964 357.113 Z"
        ].join("")],
        ["5", "M455.546 326.966 C455.117 316.934 471.436 314.833 471.979 325.696 C472.553 337.185 455.989 337.338 455.546 326.966 Z"],
        ["5", "M313.981 348.871 C313.748 350.752 313.428 352.292 312.053 353.693 C307.62 358.21 293.102 358.137 288.527 353.911 C287.076 352.571 286.558 350.683 286.164 348.833 Z"]
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
        const paint = (cls) => mono ? color : COLORS[variant === "dark" ? "dark" : "color"][cls];
        const alpha = (cls) => mono && cls !== "1" ? ' fill-opacity="0.5"' : "";
        const g = PARTS.map(([cls, d]) => `<path d="${d}" fill="${paint(cls)}"${alpha(cls)}/>`).join("");
        return `<g transform="translate(${x} ${y}) scale(${k.toFixed(5)}) translate(${-LOGO_VB.x} ${-LOGO_VB.y})" aria-hidden="true">${g}</g>`;
      }
      module.exports = { logoSize, logoVariant, logoMarkup, luminance, LOGO_VB };
    }
  });

  // ../core/markers.js
  var require_markers = __commonJS({
    "../core/markers.js"(exports, module) {
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

  // ../core/layout.js
  var require_layout = __commonJS({
    "../core/layout.js"(exports, module) {
      "use strict";
      var { getTheme, resolveStyle } = require_themes();
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
        const theme = getTheme(opts.theme || map.meta.theme, map.meta.customTheme);
        const maxW = opts.maxTextWidth || 260;
        const boxes = /* @__PURE__ */ new Map();
        const views = progressViews(map.root);
        const measure = (node, level, branch, temp = false) => {
          const st = resolveStyle(theme, level, branch, node.style);
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

  // ../core/flow-layout.js
  var require_flow_layout = __commonJS({
    "../core/flow-layout.js"(exports, module) {
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

  // ../core/text.js
  var require_text = __commonJS({
    "../core/text.js"(exports, module) {
      "use strict";
      var HTML_ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      function escapeHtml(s) {
        return String(s ?? "").replace(/[&<>"']/g, (c) => HTML_ESC[c]);
      }
      module.exports = { escapeHtml };
    }
  });

  // ../core/print-style.js
  var require_print_style = __commonJS({
    "../core/print-style.js"(exports, module) {
      "use strict";
      var BASE = `
    @page { size: A4; margin: 15mm 14mm; }
    * { box-sizing: border-box; }
    body { font-family: "Segoe UI", Arial, Helvetica, sans-serif; color: #161616; font-size: 10pt; line-height: 1.35; margin: 0; }
    h1 { font-size: 18pt; font-weight: 700; margin: 0 0 1mm; line-height: 1.2; }
    h2 { font-size: 12.5pt; font-weight: 700; margin: 5mm 0 2mm; padding-bottom: 1mm; border-bottom: 0.6pt solid #999; break-after: avoid; }
    h3 { font-size: 11pt; font-weight: 600; margin: 3mm 0 1mm; break-after: avoid; line-height: 1.25; }
    h4, h5, h6 { font-size: 10pt; font-weight: 600; margin: 2mm 0 1mm; break-after: avoid; }
    .sub { color: #555; font-size: 9pt; margin: 0 0 4mm; }
    .num { color: #555; font-weight: 600; margin-right: 1.2mm; }
    /* peso do t\xEDtulo pela prioridade do passo/t\xF3pico: p1 \xE9 o mais pesado */
    .w3 > h2, .w3 > h3, .w3 > h4 { font-weight: 700; }
    .w2 > h2, .w2 > h3, .w2 > h4 { font-weight: 600; }
    .w1 > h2, .w1 > h3, .w1 > h4 { font-weight: 500; }
    .pri { color: #fff; font-size: 7.5pt; font-weight: 700; padding: 0.3mm 1.6mm; border-radius: 2mm; vertical-align: middle; margin-left: 1.5mm; }
    .meta { color: #555; font-size: 8.5pt; margin: 0 0 0.5mm; }
    .src { font-size: 8.5pt; color: #333; font-style: italic; margin: 0.8mm 0; }
    .links { font-size: 9pt; margin: 0.8mm 0; padding-left: 4mm; }
    .links li { margin: 0; }
    /* notas: mesma tipografia do texto, recuo pela borda da esquerda (sem caixa colorida) */
    .notes { font-size: 9.5pt; border-left: 1.2pt solid #bbb; padding: 0 0 0 2.5mm; margin: 1mm 0 2mm; }
    .notes p { margin: 0 0 1.5mm; }
    .notes h1, .notes h2, .notes h3, .notes h4, .notes h5, .notes h6 { font-size: 9.5pt; font-weight: 700; margin: 1.5mm 0 0.5mm; border: 0; padding: 0; break-after: avoid; }
    .notes ul, .notes ol { margin: 0 0 1.5mm 4mm; padding: 0; }
    .notes li { margin: 0 0 0.5mm; }
    .notes blockquote { margin: 1mm 0; padding-left: 2mm; border-left: 1pt solid #aaa; color: #333; }
    .notes table { border-collapse: collapse; font-size: 9pt; margin: 1mm 0; }
    .notes th, .notes td { border: 0.5pt solid #bbb; padding: 0.5mm 1.5mm; text-align: left; }
    .notes img { max-width: 100%; height: auto; }
    .notes.ai { border-left-color: #1e63c6; }
    .ai-note { font-size: 8.5pt; color: #1e63c6; font-style: italic; margin: 0 0 1mm; }
    code, .notes code { font-family: Consolas, "Courier New", monospace; font-size: 8.5pt; }
    .cols { column-count: 2; column-gap: 8mm; column-fill: auto; }
    .step, .topic { break-inside: avoid-column; }
`;
      function printCss(extra = "") {
        return BASE + extra;
      }
      var weightClass = (priority) => ({ p1: "w3", p2: "w2", p3: "w1" })[priority] || "w0";
      module.exports = { printCss, weightClass };
    }
  });

  // ../core/flow-export.js
  var require_flow_export = __commonJS({
    "../core/flow-export.js"(exports, module) {
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
    h3 small { color: #666; font-weight: normal; font-size: 8.5pt; }
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

  // ../core/forcelayout.js
  var require_forcelayout = __commonJS({
    "../core/forcelayout.js"(exports, module) {
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

  // ../core/links.js
  var require_links = __commonJS({
    "../core/links.js"(exports, module) {
      "use strict";
      var norm = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
      var LINK_RE = /\[\[([^\[\]\n|#]{1,200})(?:#([^\[\]\n|]{0,200}))?(?:\|([^\[\]\n]{1,200}))?\]\]/g;
      var stripCode = (s) => String(s ?? "").replace(/```[\s\S]*?```/g, " ").replace(/`[^`\n]*`/g, " ");
      function parseLinks(text) {
        const out = [];
        for (const m of stripCode(text).matchAll(LINK_RE)) {
          const a = m[1].trim(), b = m[2] === void 0 ? void 0 : m[2].trim();
          if (!a) continue;
          if (b === void 0) out.push({ raw: m[0], map: null, topic: a, alias: m[3] ? m[3].trim() : null });
          else out.push({ raw: m[0], map: a, topic: b || null, alias: m[3] ? m[3].trim() : null });
        }
        return out;
      }
      function rewriteLinks(text, fn) {
        const src = String(text ?? "");
        const protectedRanges = [];
        for (const m of src.matchAll(/```[\s\S]*?```|`[^`\n]*`/g)) protectedRanges.push([m.index, m.index + m[0].length]);
        return src.replace(LINK_RE, (raw, a, b, alias, offset) => {
          if (protectedRanges.some(([s, e]) => offset >= s && offset < e)) return raw;
          const A = a.trim(), B = b === void 0 ? void 0 : b.trim();
          const link = B === void 0 ? { raw, map: null, topic: A, alias: alias ? alias.trim() : null } : { raw, map: A, topic: B || null, alias: alias ? alias.trim() : null };
          const r = fn(link);
          return r == null ? raw : r;
        });
      }
      var plainLinks = (text) => rewriteLinks(text, (lk) => lk.alias || lk.topic || lk.map);
      module.exports = { norm, parseLinks, rewriteLinks, plainLinks, LINK_RE };
    }
  });

  // ../core/graph.js
  var require_graph = __commonJS({
    "../core/graph.js"(exports, module) {
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
          if (lk.map) {
            const cands = mapIndex.get(norm(lk.map)) || [];
            if (!cands.length) return { id: ghost(lk.topic ? `${lk.map}#${lk.topic}` : lk.map, norm(lk.map) + (t ? "#" + t : "")) };
            const e = cands.find((c) => c.key === from.key) || cands[0];
            if (t == null) return { id: idOf(e, e.root), ambiguous: cands.length > 1 };
            const hit = (e.topics.get(t) || [])[0];
            return hit ? { id: idOf(e, hit), ambiguous: cands.length > 1 } : { id: ghost(`${lk.map}#${lk.topic}`, norm(lk.map) + "#" + t) };
          }
          const own = (from.topics.get(t) || [])[0];
          if (own) return { id: idOf(from, own) };
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
          if (others.length) return { id: others[0], ambiguous: others.length > 1 };
          return { id: ghost(lk.topic, t) };
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
      module.exports = { buildGraph, neighborhood };
    }
  });

  // ../core/graph-labels.js
  var require_graph_labels = __commonJS({
    "../core/graph-labels.js"(exports, module) {
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

  // ../core/markdown.js
  var require_markdown = __commonJS({
    "../core/markdown.js"(exports, module) {
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

  // ../core/mentions.js
  var require_mentions = __commonJS({
    "../core/mentions.js"(exports, module) {
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

  // ../core/mindomo.js
  var require_mindomo = __commonJS({
    "../core/mindomo.js"(exports, module) {
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

  // ../core/mom.js
  var require_mom = __commonJS({
    "../core/mom.js"(exports, module) {
      "use strict";
      var fs2 = require_fs_vfs();
      var AdmZip = require_adm_zip();
      var { MindMap, createNode, newId } = require_model();
      var { sanitizeStyle, sanitizeTheme, THEMES } = require_themes();
      var { convertTheme, convertNodeStyle, htmlToMarkdown, markdownToHtml } = require_mindomo();
      var { MARKERS } = require_markers();
      var { sanitizePdfs, sanitizeRefs } = require_pdfrefs();
      var MAX_ENTRY_BYTES = 64 * 1024 * 1024;
      var MAX_NODES = 2e5;
      var MAX_DEPTH = 500;
      var SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;
      var KNOWN_MC = /* @__PURE__ */ new Set(["markers", "progress", "style", "collapsed", "refs", "flow"]);
      var FLOW_TYPES = ["start", "step", "decision", "end"];
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
          const hasMc = (node.markers || []).length || node.progress != null || hasStyle || node.collapsed || node.refs && node.refs.length || hasExtra || hasFlow;
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

  // ../core/shapes.js
  var require_shapes = __commonJS({
    "../core/shapes.js"(exports, module) {
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

  // ../core/study-export.js
  var require_study_export = __commonJS({
    "../core/study-export.js"(exports, module) {
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
    .toc { list-style: none; padding: 0; columns: 2; column-gap: 8mm; font-size: 9pt; }
    .toc li { break-inside: avoid; padding: 0.3mm 0; }
    .toc .l2, .toc .l3 { padding-left: 3mm; } .toc .l4, .toc .l5, .toc .l6 { padding-left: 6mm; color: #555; }
    .topic { margin-top: 2mm; }
    .topic .topic { margin-left: 4mm; border-left: 0.6pt solid #ddd; padding-left: 3mm; }
    section.sources { margin-top: 6mm; break-before: auto; } .sources ul { font-size: 9pt; }
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

  // ../core/svg.js
  var require_svg = __commonJS({
    "../core/svg.js"(exports, module) {
      "use strict";
      var { layoutMap, edgePoints } = require_layout();
      var { MARKERS } = require_markers();
      var { logoSize, logoVariant, logoMarkup } = require_logo();
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
      function renderGroup(L, { selectedId, selectedIds, selectedRel, interactive, hits, logo } = {}) {
        const { theme } = L;
        const out = [];
        if (theme.sketch) out.push(SKETCH_DEFS);
        for (const e of L.edges) {
          const w = e.to.style.edgeWidth || theme.line.width[Math.min(e.to.level - 1, theme.line.width.length - 1)];
          out.push(`<path d="${edgePath(e, theme.line.curve)}" fill="none" stroke="${e.to.style.edge || e.to.branch}" stroke-width="${w}" stroke-linecap="round"/>`);
        }
        for (const { rel, geo } of L.relations) {
          const col = /^#[0-9a-fA-F]{6}$/.test(rel.color || "") ? rel.color : REL_COLOR, sel = selectedRel === rel.id;
          const d = `M${geo.a.x},${geo.a.y} Q${geo.c.x},${geo.c.y} ${geo.b.x},${geo.b.y}`;
          const ar = geo.arrow.map((p) => `${p.x},${p.y}`).join(" ");
          out.push(`<g${interactive ? ` data-rel="${esc(rel.id)}" class="rel"` : ""}>` + (interactive ? `<path d="${d}" fill="none" stroke="transparent" stroke-width="14"/>` : "") + `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sel ? 3.5 : 2}" stroke-dasharray="7 5" stroke-linecap="round"/><polygon points="${ar}" fill="${col}"/>` + (rel.label ? `<text x="${geo.label.x}" y="${geo.label.y - 6}" text-anchor="middle" font-size="12" font-style="italic" fill="${col}" stroke="${theme.background}" stroke-width="4" paint-order="stroke">${esc(rel.label)}</text>` : "") + "</g>");
        }
        for (const b of L.boxes.values()) {
          const s = b.style, n = b.node;
          const tx = b.x + b.markerW + (b.w - b.markerW) / 2;
          let shape = "";
          if (s.shape === "underline") {
            shape = `<line x1="${b.x}" y1="${b.y + b.h}" x2="${b.x + b.w}" y2="${b.y + b.h}" stroke="${s.stroke || b.branch}" stroke-width="${s.strokeWidth || 2}"/>`;
          } else if (s.shape === "none") {
            shape = s.fill && s.fill !== "none" ? `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" fill="${s.fill}"/>` : "";
          } else if (s.shape === "ellipse") {
            shape = `<ellipse cx="${b.x + b.w / 2}" cy="${b.y + b.h / 2}" rx="${b.w / 2}" ry="${b.h / 2}" fill="${s.fill}"${s.stroke ? ` stroke="${s.stroke}" stroke-width="${s.strokeWidth}"` : ""}/>`;
          } else {
            const r = s.shape === "pill" ? Math.min(b.h / 2, 8) : s.shape === "round" ? 5 : 2;
            shape = `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="${r}" fill="${s.fill}"${s.stroke ? ` stroke="${s.stroke}" stroke-width="${s.strokeWidth}"` : ""}/>`;
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
          const text = b.lines.map((l, i) => `<text x="${txA}" y="${startY + i * b.lineHeight}" text-anchor="${anchor}" dominant-baseline="central" fill="${s.color}" font-size="${s.size}"${s.font ? ` font-family="${esc(`'${s.font}', ${theme.font}`)}"` : ""} font-weight="${s.bold ? 700 : 400}"${s.italic ? ' font-style="italic"' : ""}>${esc(l)}</text>`).join("");
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

  // ../core/vault.js
  var require_vault = __commonJS({
    "../core/vault.js"(exports, module) {
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
        "ai": require_ai(),
        "backup": require_backup(),
        "errorlog": require_errorlog(),
        "flow": require_flow(),
        "flow-export": require_flow_export(),
        "flow-layout": require_flow_layout(),
        "forcelayout": require_forcelayout(),
        "graph": require_graph(),
        "graph-labels": require_graph_labels(),
        "layout": require_layout(),
        "links": require_links(),
        "logo": require_logo(),
        "markdown": require_markdown(),
        "markers": require_markers(),
        "mentions": require_mentions(),
        "mindomo": require_mindomo(),
        "model": require_model(),
        "mom": require_mom(),
        "pdfrefs": require_pdfrefs(),
        "print-style": require_print_style(),
        "shapes": require_shapes(),
        "study-export": require_study_export(),
        "svg": require_svg(),
        "text": require_text(),
        "themes": require_themes(),
        "vault": require_vault()
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
