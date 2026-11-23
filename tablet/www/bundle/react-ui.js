(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/react/cjs/react.production.min.js
  var require_react_production_min = __commonJS({
    "node_modules/react/cjs/react.production.min.js"(exports) {
      "use strict";
      var l2 = Symbol.for("react.element");
      var n2 = Symbol.for("react.portal");
      var p2 = Symbol.for("react.fragment");
      var q2 = Symbol.for("react.strict_mode");
      var r2 = Symbol.for("react.profiler");
      var t2 = Symbol.for("react.provider");
      var u2 = Symbol.for("react.context");
      var v2 = Symbol.for("react.forward_ref");
      var w2 = Symbol.for("react.suspense");
      var x2 = Symbol.for("react.memo");
      var y2 = Symbol.for("react.lazy");
      var z2 = Symbol.iterator;
      function A2(a2) {
        if (null === a2 || "object" !== typeof a2) return null;
        a2 = z2 && a2[z2] || a2["@@iterator"];
        return "function" === typeof a2 ? a2 : null;
      }
      var B2 = { isMounted: function() {
        return false;
      }, enqueueForceUpdate: function() {
      }, enqueueReplaceState: function() {
      }, enqueueSetState: function() {
      } };
      var C2 = Object.assign;
      var D2 = {};
      function E2(a2, b2, e2) {
        this.props = a2;
        this.context = b2;
        this.refs = D2;
        this.updater = e2 || B2;
      }
      E2.prototype.isReactComponent = {};
      E2.prototype.setState = function(a2, b2) {
        if ("object" !== typeof a2 && "function" !== typeof a2 && null != a2) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, a2, b2, "setState");
      };
      E2.prototype.forceUpdate = function(a2) {
        this.updater.enqueueForceUpdate(this, a2, "forceUpdate");
      };
      function F2() {
      }
      F2.prototype = E2.prototype;
      function G2(a2, b2, e2) {
        this.props = a2;
        this.context = b2;
        this.refs = D2;
        this.updater = e2 || B2;
      }
      var H3 = G2.prototype = new F2();
      H3.constructor = G2;
      C2(H3, E2.prototype);
      H3.isPureReactComponent = true;
      var I2 = Array.isArray;
      var J2 = Object.prototype.hasOwnProperty;
      var K2 = { current: null };
      var L2 = { key: true, ref: true, __self: true, __source: true };
      function M2(a2, b2, e2) {
        var d2, c2 = {}, k2 = null, h2 = null;
        if (null != b2) for (d2 in void 0 !== b2.ref && (h2 = b2.ref), void 0 !== b2.key && (k2 = "" + b2.key), b2) J2.call(b2, d2) && !L2.hasOwnProperty(d2) && (c2[d2] = b2[d2]);
        var g2 = arguments.length - 2;
        if (1 === g2) c2.children = e2;
        else if (1 < g2) {
          for (var f2 = Array(g2), m2 = 0; m2 < g2; m2++) f2[m2] = arguments[m2 + 2];
          c2.children = f2;
        }
        if (a2 && a2.defaultProps) for (d2 in g2 = a2.defaultProps, g2) void 0 === c2[d2] && (c2[d2] = g2[d2]);
        return { $$typeof: l2, type: a2, key: k2, ref: h2, props: c2, _owner: K2.current };
      }
      function N2(a2, b2) {
        return { $$typeof: l2, type: a2.type, key: b2, ref: a2.ref, props: a2.props, _owner: a2._owner };
      }
      function O2(a2) {
        return "object" === typeof a2 && null !== a2 && a2.$$typeof === l2;
      }
      function escape2(a2) {
        var b2 = { "=": "=0", ":": "=2" };
        return "$" + a2.replace(/[=:]/g, function(a3) {
          return b2[a3];
        });
      }
      var P2 = /\/+/g;
      function Q2(a2, b2) {
        return "object" === typeof a2 && null !== a2 && null != a2.key ? escape2("" + a2.key) : b2.toString(36);
      }
      function R2(a2, b2, e2, d2, c2) {
        var k2 = typeof a2;
        if ("undefined" === k2 || "boolean" === k2) a2 = null;
        var h2 = false;
        if (null === a2) h2 = true;
        else switch (k2) {
          case "string":
          case "number":
            h2 = true;
            break;
          case "object":
            switch (a2.$$typeof) {
              case l2:
              case n2:
                h2 = true;
            }
        }
        if (h2) return h2 = a2, c2 = c2(h2), a2 = "" === d2 ? "." + Q2(h2, 0) : d2, I2(c2) ? (e2 = "", null != a2 && (e2 = a2.replace(P2, "$&/") + "/"), R2(c2, b2, e2, "", function(a3) {
          return a3;
        })) : null != c2 && (O2(c2) && (c2 = N2(c2, e2 + (!c2.key || h2 && h2.key === c2.key ? "" : ("" + c2.key).replace(P2, "$&/") + "/") + a2)), b2.push(c2)), 1;
        h2 = 0;
        d2 = "" === d2 ? "." : d2 + ":";
        if (I2(a2)) for (var g2 = 0; g2 < a2.length; g2++) {
          k2 = a2[g2];
          var f2 = d2 + Q2(k2, g2);
          h2 += R2(k2, b2, e2, f2, c2);
        }
        else if (f2 = A2(a2), "function" === typeof f2) for (a2 = f2.call(a2), g2 = 0; !(k2 = a2.next()).done; ) k2 = k2.value, f2 = d2 + Q2(k2, g2++), h2 += R2(k2, b2, e2, f2, c2);
        else if ("object" === k2) throw b2 = String(a2), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b2 ? "object with keys {" + Object.keys(a2).join(", ") + "}" : b2) + "). If you meant to render a collection of children, use an array instead.");
        return h2;
      }
      function S2(a2, b2, e2) {
        if (null == a2) return a2;
        var d2 = [], c2 = 0;
        R2(a2, d2, "", "", function(a3) {
          return b2.call(e2, a3, c2++);
        });
        return d2;
      }
      function T2(a2) {
        if (-1 === a2._status) {
          var b2 = a2._result;
          b2 = b2();
          b2.then(function(b3) {
            if (0 === a2._status || -1 === a2._status) a2._status = 1, a2._result = b3;
          }, function(b3) {
            if (0 === a2._status || -1 === a2._status) a2._status = 2, a2._result = b3;
          });
          -1 === a2._status && (a2._status = 0, a2._result = b2);
        }
        if (1 === a2._status) return a2._result.default;
        throw a2._result;
      }
      var U2 = { current: null };
      var V2 = { transition: null };
      var W2 = { ReactCurrentDispatcher: U2, ReactCurrentBatchConfig: V2, ReactCurrentOwner: K2 };
      function X2() {
        throw Error("act(...) is not supported in production builds of React.");
      }
      exports.Children = { map: S2, forEach: function(a2, b2, e2) {
        S2(a2, function() {
          b2.apply(this, arguments);
        }, e2);
      }, count: function(a2) {
        var b2 = 0;
        S2(a2, function() {
          b2++;
        });
        return b2;
      }, toArray: function(a2) {
        return S2(a2, function(a3) {
          return a3;
        }) || [];
      }, only: function(a2) {
        if (!O2(a2)) throw Error("React.Children.only expected to receive a single React element child.");
        return a2;
      } };
      exports.Component = E2;
      exports.Fragment = p2;
      exports.Profiler = r2;
      exports.PureComponent = G2;
      exports.StrictMode = q2;
      exports.Suspense = w2;
      exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W2;
      exports.act = X2;
      exports.cloneElement = function(a2, b2, e2) {
        if (null === a2 || void 0 === a2) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a2 + ".");
        var d2 = C2({}, a2.props), c2 = a2.key, k2 = a2.ref, h2 = a2._owner;
        if (null != b2) {
          void 0 !== b2.ref && (k2 = b2.ref, h2 = K2.current);
          void 0 !== b2.key && (c2 = "" + b2.key);
          if (a2.type && a2.type.defaultProps) var g2 = a2.type.defaultProps;
          for (f2 in b2) J2.call(b2, f2) && !L2.hasOwnProperty(f2) && (d2[f2] = void 0 === b2[f2] && void 0 !== g2 ? g2[f2] : b2[f2]);
        }
        var f2 = arguments.length - 2;
        if (1 === f2) d2.children = e2;
        else if (1 < f2) {
          g2 = Array(f2);
          for (var m2 = 0; m2 < f2; m2++) g2[m2] = arguments[m2 + 2];
          d2.children = g2;
        }
        return { $$typeof: l2, type: a2.type, key: c2, ref: k2, props: d2, _owner: h2 };
      };
      exports.createContext = function(a2) {
        a2 = { $$typeof: u2, _currentValue: a2, _currentValue2: a2, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
        a2.Provider = { $$typeof: t2, _context: a2 };
        return a2.Consumer = a2;
      };
      exports.createElement = M2;
      exports.createFactory = function(a2) {
        var b2 = M2.bind(null, a2);
        b2.type = a2;
        return b2;
      };
      exports.createRef = function() {
        return { current: null };
      };
      exports.forwardRef = function(a2) {
        return { $$typeof: v2, render: a2 };
      };
      exports.isValidElement = O2;
      exports.lazy = function(a2) {
        return { $$typeof: y2, _payload: { _status: -1, _result: a2 }, _init: T2 };
      };
      exports.memo = function(a2, b2) {
        return { $$typeof: x2, type: a2, compare: void 0 === b2 ? null : b2 };
      };
      exports.startTransition = function(a2) {
        var b2 = V2.transition;
        V2.transition = {};
        try {
          a2();
        } finally {
          V2.transition = b2;
        }
      };
      exports.unstable_act = X2;
      exports.useCallback = function(a2, b2) {
        return U2.current.useCallback(a2, b2);
      };
      exports.useContext = function(a2) {
        return U2.current.useContext(a2);
      };
      exports.useDebugValue = function() {
      };
      exports.useDeferredValue = function(a2) {
        return U2.current.useDeferredValue(a2);
      };
      exports.useEffect = function(a2, b2) {
        return U2.current.useEffect(a2, b2);
      };
      exports.useId = function() {
        return U2.current.useId();
      };
      exports.useImperativeHandle = function(a2, b2, e2) {
        return U2.current.useImperativeHandle(a2, b2, e2);
      };
      exports.useInsertionEffect = function(a2, b2) {
        return U2.current.useInsertionEffect(a2, b2);
      };
      exports.useLayoutEffect = function(a2, b2) {
        return U2.current.useLayoutEffect(a2, b2);
      };
      exports.useMemo = function(a2, b2) {
        return U2.current.useMemo(a2, b2);
      };
      exports.useReducer = function(a2, b2, e2) {
        return U2.current.useReducer(a2, b2, e2);
      };
      exports.useRef = function(a2) {
        return U2.current.useRef(a2);
      };
      exports.useState = function(a2) {
        return U2.current.useState(a2);
      };
      exports.useSyncExternalStore = function(a2, b2, e2) {
        return U2.current.useSyncExternalStore(a2, b2, e2);
      };
      exports.useTransition = function() {
        return U2.current.useTransition();
      };
      exports.version = "18.3.1";
    }
  });

  // node_modules/react/index.js
  var require_react = __commonJS({
    "node_modules/react/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/scheduler/cjs/scheduler.production.min.js
  var require_scheduler_production_min = __commonJS({
    "node_modules/scheduler/cjs/scheduler.production.min.js"(exports) {
      "use strict";
      function f2(a2, b2) {
        var c2 = a2.length;
        a2.push(b2);
        a: for (; 0 < c2; ) {
          var d2 = c2 - 1 >>> 1, e2 = a2[d2];
          if (0 < g2(e2, b2)) a2[d2] = b2, a2[c2] = e2, c2 = d2;
          else break a;
        }
      }
      function h2(a2) {
        return 0 === a2.length ? null : a2[0];
      }
      function k2(a2) {
        if (0 === a2.length) return null;
        var b2 = a2[0], c2 = a2.pop();
        if (c2 !== b2) {
          a2[0] = c2;
          a: for (var d2 = 0, e2 = a2.length, w2 = e2 >>> 1; d2 < w2; ) {
            var m2 = 2 * (d2 + 1) - 1, C2 = a2[m2], n2 = m2 + 1, x2 = a2[n2];
            if (0 > g2(C2, c2)) n2 < e2 && 0 > g2(x2, C2) ? (a2[d2] = x2, a2[n2] = c2, d2 = n2) : (a2[d2] = C2, a2[m2] = c2, d2 = m2);
            else if (n2 < e2 && 0 > g2(x2, c2)) a2[d2] = x2, a2[n2] = c2, d2 = n2;
            else break a;
          }
        }
        return b2;
      }
      function g2(a2, b2) {
        var c2 = a2.sortIndex - b2.sortIndex;
        return 0 !== c2 ? c2 : a2.id - b2.id;
      }
      if ("object" === typeof performance && "function" === typeof performance.now) {
        l2 = performance;
        exports.unstable_now = function() {
          return l2.now();
        };
      } else {
        p2 = Date, q2 = p2.now();
        exports.unstable_now = function() {
          return p2.now() - q2;
        };
      }
      var l2;
      var p2;
      var q2;
      var r2 = [];
      var t2 = [];
      var u2 = 1;
      var v2 = null;
      var y2 = 3;
      var z2 = false;
      var A2 = false;
      var B2 = false;
      var D2 = "function" === typeof setTimeout ? setTimeout : null;
      var E2 = "function" === typeof clearTimeout ? clearTimeout : null;
      var F2 = "undefined" !== typeof setImmediate ? setImmediate : null;
      "undefined" !== typeof navigator && void 0 !== navigator.scheduling && void 0 !== navigator.scheduling.isInputPending && navigator.scheduling.isInputPending.bind(navigator.scheduling);
      function G2(a2) {
        for (var b2 = h2(t2); null !== b2; ) {
          if (null === b2.callback) k2(t2);
          else if (b2.startTime <= a2) k2(t2), b2.sortIndex = b2.expirationTime, f2(r2, b2);
          else break;
          b2 = h2(t2);
        }
      }
      function H3(a2) {
        B2 = false;
        G2(a2);
        if (!A2) if (null !== h2(r2)) A2 = true, I2(J2);
        else {
          var b2 = h2(t2);
          null !== b2 && K2(H3, b2.startTime - a2);
        }
      }
      function J2(a2, b2) {
        A2 = false;
        B2 && (B2 = false, E2(L2), L2 = -1);
        z2 = true;
        var c2 = y2;
        try {
          G2(b2);
          for (v2 = h2(r2); null !== v2 && (!(v2.expirationTime > b2) || a2 && !M2()); ) {
            var d2 = v2.callback;
            if ("function" === typeof d2) {
              v2.callback = null;
              y2 = v2.priorityLevel;
              var e2 = d2(v2.expirationTime <= b2);
              b2 = exports.unstable_now();
              "function" === typeof e2 ? v2.callback = e2 : v2 === h2(r2) && k2(r2);
              G2(b2);
            } else k2(r2);
            v2 = h2(r2);
          }
          if (null !== v2) var w2 = true;
          else {
            var m2 = h2(t2);
            null !== m2 && K2(H3, m2.startTime - b2);
            w2 = false;
          }
          return w2;
        } finally {
          v2 = null, y2 = c2, z2 = false;
        }
      }
      var N2 = false;
      var O2 = null;
      var L2 = -1;
      var P2 = 5;
      var Q2 = -1;
      function M2() {
        return exports.unstable_now() - Q2 < P2 ? false : true;
      }
      function R2() {
        if (null !== O2) {
          var a2 = exports.unstable_now();
          Q2 = a2;
          var b2 = true;
          try {
            b2 = O2(true, a2);
          } finally {
            b2 ? S2() : (N2 = false, O2 = null);
          }
        } else N2 = false;
      }
      var S2;
      if ("function" === typeof F2) S2 = function() {
        F2(R2);
      };
      else if ("undefined" !== typeof MessageChannel) {
        T2 = new MessageChannel(), U2 = T2.port2;
        T2.port1.onmessage = R2;
        S2 = function() {
          U2.postMessage(null);
        };
      } else S2 = function() {
        D2(R2, 0);
      };
      var T2;
      var U2;
      function I2(a2) {
        O2 = a2;
        N2 || (N2 = true, S2());
      }
      function K2(a2, b2) {
        L2 = D2(function() {
          a2(exports.unstable_now());
        }, b2);
      }
      exports.unstable_IdlePriority = 5;
      exports.unstable_ImmediatePriority = 1;
      exports.unstable_LowPriority = 4;
      exports.unstable_NormalPriority = 3;
      exports.unstable_Profiling = null;
      exports.unstable_UserBlockingPriority = 2;
      exports.unstable_cancelCallback = function(a2) {
        a2.callback = null;
      };
      exports.unstable_continueExecution = function() {
        A2 || z2 || (A2 = true, I2(J2));
      };
      exports.unstable_forceFrameRate = function(a2) {
        0 > a2 || 125 < a2 ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : P2 = 0 < a2 ? Math.floor(1e3 / a2) : 5;
      };
      exports.unstable_getCurrentPriorityLevel = function() {
        return y2;
      };
      exports.unstable_getFirstCallbackNode = function() {
        return h2(r2);
      };
      exports.unstable_next = function(a2) {
        switch (y2) {
          case 1:
          case 2:
          case 3:
            var b2 = 3;
            break;
          default:
            b2 = y2;
        }
        var c2 = y2;
        y2 = b2;
        try {
          return a2();
        } finally {
          y2 = c2;
        }
      };
      exports.unstable_pauseExecution = function() {
      };
      exports.unstable_requestPaint = function() {
      };
      exports.unstable_runWithPriority = function(a2, b2) {
        switch (a2) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
            break;
          default:
            a2 = 3;
        }
        var c2 = y2;
        y2 = a2;
        try {
          return b2();
        } finally {
          y2 = c2;
        }
      };
      exports.unstable_scheduleCallback = function(a2, b2, c2) {
        var d2 = exports.unstable_now();
        "object" === typeof c2 && null !== c2 ? (c2 = c2.delay, c2 = "number" === typeof c2 && 0 < c2 ? d2 + c2 : d2) : c2 = d2;
        switch (a2) {
          case 1:
            var e2 = -1;
            break;
          case 2:
            e2 = 250;
            break;
          case 5:
            e2 = 1073741823;
            break;
          case 4:
            e2 = 1e4;
            break;
          default:
            e2 = 5e3;
        }
        e2 = c2 + e2;
        a2 = { id: u2++, callback: b2, priorityLevel: a2, startTime: c2, expirationTime: e2, sortIndex: -1 };
        c2 > d2 ? (a2.sortIndex = c2, f2(t2, a2), null === h2(r2) && a2 === h2(t2) && (B2 ? (E2(L2), L2 = -1) : B2 = true, K2(H3, c2 - d2))) : (a2.sortIndex = e2, f2(r2, a2), A2 || z2 || (A2 = true, I2(J2)));
        return a2;
      };
      exports.unstable_shouldYield = M2;
      exports.unstable_wrapCallback = function(a2) {
        var b2 = y2;
        return function() {
          var c2 = y2;
          y2 = b2;
          try {
            return a2.apply(this, arguments);
          } finally {
            y2 = c2;
          }
        };
      };
    }
  });

  // node_modules/scheduler/index.js
  var require_scheduler = __commonJS({
    "node_modules/scheduler/index.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_scheduler_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/react-dom/cjs/react-dom.production.min.js
  var require_react_dom_production_min = __commonJS({
    "node_modules/react-dom/cjs/react-dom.production.min.js"(exports) {
      "use strict";
      var aa = require_react();
      var ca = require_scheduler();
      function p2(a2) {
        for (var b2 = "https://reactjs.org/docs/error-decoder.html?invariant=" + a2, c2 = 1; c2 < arguments.length; c2++) b2 += "&args[]=" + encodeURIComponent(arguments[c2]);
        return "Minified React error #" + a2 + "; visit " + b2 + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
      }
      var da = /* @__PURE__ */ new Set();
      var ea = {};
      function fa(a2, b2) {
        ha(a2, b2);
        ha(a2 + "Capture", b2);
      }
      function ha(a2, b2) {
        ea[a2] = b2;
        for (a2 = 0; a2 < b2.length; a2++) da.add(b2[a2]);
      }
      var ia = !("undefined" === typeof window || "undefined" === typeof window.document || "undefined" === typeof window.document.createElement);
      var ja = Object.prototype.hasOwnProperty;
      var ka = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/;
      var la = {};
      var ma = {};
      function oa(a2) {
        if (ja.call(ma, a2)) return true;
        if (ja.call(la, a2)) return false;
        if (ka.test(a2)) return ma[a2] = true;
        la[a2] = true;
        return false;
      }
      function pa(a2, b2, c2, d2) {
        if (null !== c2 && 0 === c2.type) return false;
        switch (typeof b2) {
          case "function":
          case "symbol":
            return true;
          case "boolean":
            if (d2) return false;
            if (null !== c2) return !c2.acceptsBooleans;
            a2 = a2.toLowerCase().slice(0, 5);
            return "data-" !== a2 && "aria-" !== a2;
          default:
            return false;
        }
      }
      function qa(a2, b2, c2, d2) {
        if (null === b2 || "undefined" === typeof b2 || pa(a2, b2, c2, d2)) return true;
        if (d2) return false;
        if (null !== c2) switch (c2.type) {
          case 3:
            return !b2;
          case 4:
            return false === b2;
          case 5:
            return isNaN(b2);
          case 6:
            return isNaN(b2) || 1 > b2;
        }
        return false;
      }
      function v2(a2, b2, c2, d2, e2, f2, g2) {
        this.acceptsBooleans = 2 === b2 || 3 === b2 || 4 === b2;
        this.attributeName = d2;
        this.attributeNamespace = e2;
        this.mustUseProperty = c2;
        this.propertyName = a2;
        this.type = b2;
        this.sanitizeURL = f2;
        this.removeEmptyString = g2;
      }
      var z2 = {};
      "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(a2) {
        z2[a2] = new v2(a2, 0, false, a2, null, false, false);
      });
      [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(a2) {
        var b2 = a2[0];
        z2[b2] = new v2(b2, 1, false, a2[1], null, false, false);
      });
      ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(a2) {
        z2[a2] = new v2(a2, 2, false, a2.toLowerCase(), null, false, false);
      });
      ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(a2) {
        z2[a2] = new v2(a2, 2, false, a2, null, false, false);
      });
      "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(a2) {
        z2[a2] = new v2(a2, 3, false, a2.toLowerCase(), null, false, false);
      });
      ["checked", "multiple", "muted", "selected"].forEach(function(a2) {
        z2[a2] = new v2(a2, 3, true, a2, null, false, false);
      });
      ["capture", "download"].forEach(function(a2) {
        z2[a2] = new v2(a2, 4, false, a2, null, false, false);
      });
      ["cols", "rows", "size", "span"].forEach(function(a2) {
        z2[a2] = new v2(a2, 6, false, a2, null, false, false);
      });
      ["rowSpan", "start"].forEach(function(a2) {
        z2[a2] = new v2(a2, 5, false, a2.toLowerCase(), null, false, false);
      });
      var ra = /[\-:]([a-z])/g;
      function sa(a2) {
        return a2[1].toUpperCase();
      }
      "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(a2) {
        var b2 = a2.replace(
          ra,
          sa
        );
        z2[b2] = new v2(b2, 1, false, a2, null, false, false);
      });
      "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(a2) {
        var b2 = a2.replace(ra, sa);
        z2[b2] = new v2(b2, 1, false, a2, "http://www.w3.org/1999/xlink", false, false);
      });
      ["xml:base", "xml:lang", "xml:space"].forEach(function(a2) {
        var b2 = a2.replace(ra, sa);
        z2[b2] = new v2(b2, 1, false, a2, "http://www.w3.org/XML/1998/namespace", false, false);
      });
      ["tabIndex", "crossOrigin"].forEach(function(a2) {
        z2[a2] = new v2(a2, 1, false, a2.toLowerCase(), null, false, false);
      });
      z2.xlinkHref = new v2("xlinkHref", 1, false, "xlink:href", "http://www.w3.org/1999/xlink", true, false);
      ["src", "href", "action", "formAction"].forEach(function(a2) {
        z2[a2] = new v2(a2, 1, false, a2.toLowerCase(), null, true, true);
      });
      function ta(a2, b2, c2, d2) {
        var e2 = z2.hasOwnProperty(b2) ? z2[b2] : null;
        if (null !== e2 ? 0 !== e2.type : d2 || !(2 < b2.length) || "o" !== b2[0] && "O" !== b2[0] || "n" !== b2[1] && "N" !== b2[1]) qa(b2, c2, e2, d2) && (c2 = null), d2 || null === e2 ? oa(b2) && (null === c2 ? a2.removeAttribute(b2) : a2.setAttribute(b2, "" + c2)) : e2.mustUseProperty ? a2[e2.propertyName] = null === c2 ? 3 === e2.type ? false : "" : c2 : (b2 = e2.attributeName, d2 = e2.attributeNamespace, null === c2 ? a2.removeAttribute(b2) : (e2 = e2.type, c2 = 3 === e2 || 4 === e2 && true === c2 ? "" : "" + c2, d2 ? a2.setAttributeNS(d2, b2, c2) : a2.setAttribute(b2, c2)));
      }
      var ua = aa.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
      var va = Symbol.for("react.element");
      var wa = Symbol.for("react.portal");
      var ya = Symbol.for("react.fragment");
      var za = Symbol.for("react.strict_mode");
      var Aa = Symbol.for("react.profiler");
      var Ba = Symbol.for("react.provider");
      var Ca = Symbol.for("react.context");
      var Da = Symbol.for("react.forward_ref");
      var Ea = Symbol.for("react.suspense");
      var Fa = Symbol.for("react.suspense_list");
      var Ga = Symbol.for("react.memo");
      var Ha = Symbol.for("react.lazy");
      Symbol.for("react.scope");
      Symbol.for("react.debug_trace_mode");
      var Ia = Symbol.for("react.offscreen");
      Symbol.for("react.legacy_hidden");
      Symbol.for("react.cache");
      Symbol.for("react.tracing_marker");
      var Ja = Symbol.iterator;
      function Ka(a2) {
        if (null === a2 || "object" !== typeof a2) return null;
        a2 = Ja && a2[Ja] || a2["@@iterator"];
        return "function" === typeof a2 ? a2 : null;
      }
      var A2 = Object.assign;
      var La;
      function Ma(a2) {
        if (void 0 === La) try {
          throw Error();
        } catch (c2) {
          var b2 = c2.stack.trim().match(/\n( *(at )?)/);
          La = b2 && b2[1] || "";
        }
        return "\n" + La + a2;
      }
      var Na = false;
      function Oa(a2, b2) {
        if (!a2 || Na) return "";
        Na = true;
        var c2 = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
          if (b2) if (b2 = function() {
            throw Error();
          }, Object.defineProperty(b2.prototype, "props", { set: function() {
            throw Error();
          } }), "object" === typeof Reflect && Reflect.construct) {
            try {
              Reflect.construct(b2, []);
            } catch (l2) {
              var d2 = l2;
            }
            Reflect.construct(a2, [], b2);
          } else {
            try {
              b2.call();
            } catch (l2) {
              d2 = l2;
            }
            a2.call(b2.prototype);
          }
          else {
            try {
              throw Error();
            } catch (l2) {
              d2 = l2;
            }
            a2();
          }
        } catch (l2) {
          if (l2 && d2 && "string" === typeof l2.stack) {
            for (var e2 = l2.stack.split("\n"), f2 = d2.stack.split("\n"), g2 = e2.length - 1, h2 = f2.length - 1; 1 <= g2 && 0 <= h2 && e2[g2] !== f2[h2]; ) h2--;
            for (; 1 <= g2 && 0 <= h2; g2--, h2--) if (e2[g2] !== f2[h2]) {
              if (1 !== g2 || 1 !== h2) {
                do
                  if (g2--, h2--, 0 > h2 || e2[g2] !== f2[h2]) {
                    var k2 = "\n" + e2[g2].replace(" at new ", " at ");
                    a2.displayName && k2.includes("<anonymous>") && (k2 = k2.replace("<anonymous>", a2.displayName));
                    return k2;
                  }
                while (1 <= g2 && 0 <= h2);
              }
              break;
            }
          }
        } finally {
          Na = false, Error.prepareStackTrace = c2;
        }
        return (a2 = a2 ? a2.displayName || a2.name : "") ? Ma(a2) : "";
      }
      function Pa(a2) {
        switch (a2.tag) {
          case 5:
            return Ma(a2.type);
          case 16:
            return Ma("Lazy");
          case 13:
            return Ma("Suspense");
          case 19:
            return Ma("SuspenseList");
          case 0:
          case 2:
          case 15:
            return a2 = Oa(a2.type, false), a2;
          case 11:
            return a2 = Oa(a2.type.render, false), a2;
          case 1:
            return a2 = Oa(a2.type, true), a2;
          default:
            return "";
        }
      }
      function Qa(a2) {
        if (null == a2) return null;
        if ("function" === typeof a2) return a2.displayName || a2.name || null;
        if ("string" === typeof a2) return a2;
        switch (a2) {
          case ya:
            return "Fragment";
          case wa:
            return "Portal";
          case Aa:
            return "Profiler";
          case za:
            return "StrictMode";
          case Ea:
            return "Suspense";
          case Fa:
            return "SuspenseList";
        }
        if ("object" === typeof a2) switch (a2.$$typeof) {
          case Ca:
            return (a2.displayName || "Context") + ".Consumer";
          case Ba:
            return (a2._context.displayName || "Context") + ".Provider";
          case Da:
            var b2 = a2.render;
            a2 = a2.displayName;
            a2 || (a2 = b2.displayName || b2.name || "", a2 = "" !== a2 ? "ForwardRef(" + a2 + ")" : "ForwardRef");
            return a2;
          case Ga:
            return b2 = a2.displayName || null, null !== b2 ? b2 : Qa(a2.type) || "Memo";
          case Ha:
            b2 = a2._payload;
            a2 = a2._init;
            try {
              return Qa(a2(b2));
            } catch (c2) {
            }
        }
        return null;
      }
      function Ra(a2) {
        var b2 = a2.type;
        switch (a2.tag) {
          case 24:
            return "Cache";
          case 9:
            return (b2.displayName || "Context") + ".Consumer";
          case 10:
            return (b2._context.displayName || "Context") + ".Provider";
          case 18:
            return "DehydratedFragment";
          case 11:
            return a2 = b2.render, a2 = a2.displayName || a2.name || "", b2.displayName || ("" !== a2 ? "ForwardRef(" + a2 + ")" : "ForwardRef");
          case 7:
            return "Fragment";
          case 5:
            return b2;
          case 4:
            return "Portal";
          case 3:
            return "Root";
          case 6:
            return "Text";
          case 16:
            return Qa(b2);
          case 8:
            return b2 === za ? "StrictMode" : "Mode";
          case 22:
            return "Offscreen";
          case 12:
            return "Profiler";
          case 21:
            return "Scope";
          case 13:
            return "Suspense";
          case 19:
            return "SuspenseList";
          case 25:
            return "TracingMarker";
          case 1:
          case 0:
          case 17:
          case 2:
          case 14:
          case 15:
            if ("function" === typeof b2) return b2.displayName || b2.name || null;
            if ("string" === typeof b2) return b2;
        }
        return null;
      }
      function Sa(a2) {
        switch (typeof a2) {
          case "boolean":
          case "number":
          case "string":
          case "undefined":
            return a2;
          case "object":
            return a2;
          default:
            return "";
        }
      }
      function Ta(a2) {
        var b2 = a2.type;
        return (a2 = a2.nodeName) && "input" === a2.toLowerCase() && ("checkbox" === b2 || "radio" === b2);
      }
      function Ua(a2) {
        var b2 = Ta(a2) ? "checked" : "value", c2 = Object.getOwnPropertyDescriptor(a2.constructor.prototype, b2), d2 = "" + a2[b2];
        if (!a2.hasOwnProperty(b2) && "undefined" !== typeof c2 && "function" === typeof c2.get && "function" === typeof c2.set) {
          var e2 = c2.get, f2 = c2.set;
          Object.defineProperty(a2, b2, { configurable: true, get: function() {
            return e2.call(this);
          }, set: function(a3) {
            d2 = "" + a3;
            f2.call(this, a3);
          } });
          Object.defineProperty(a2, b2, { enumerable: c2.enumerable });
          return { getValue: function() {
            return d2;
          }, setValue: function(a3) {
            d2 = "" + a3;
          }, stopTracking: function() {
            a2._valueTracker = null;
            delete a2[b2];
          } };
        }
      }
      function Va(a2) {
        a2._valueTracker || (a2._valueTracker = Ua(a2));
      }
      function Wa(a2) {
        if (!a2) return false;
        var b2 = a2._valueTracker;
        if (!b2) return true;
        var c2 = b2.getValue();
        var d2 = "";
        a2 && (d2 = Ta(a2) ? a2.checked ? "true" : "false" : a2.value);
        a2 = d2;
        return a2 !== c2 ? (b2.setValue(a2), true) : false;
      }
      function Xa(a2) {
        a2 = a2 || ("undefined" !== typeof document ? document : void 0);
        if ("undefined" === typeof a2) return null;
        try {
          return a2.activeElement || a2.body;
        } catch (b2) {
          return a2.body;
        }
      }
      function Ya(a2, b2) {
        var c2 = b2.checked;
        return A2({}, b2, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: null != c2 ? c2 : a2._wrapperState.initialChecked });
      }
      function Za(a2, b2) {
        var c2 = null == b2.defaultValue ? "" : b2.defaultValue, d2 = null != b2.checked ? b2.checked : b2.defaultChecked;
        c2 = Sa(null != b2.value ? b2.value : c2);
        a2._wrapperState = { initialChecked: d2, initialValue: c2, controlled: "checkbox" === b2.type || "radio" === b2.type ? null != b2.checked : null != b2.value };
      }
      function ab(a2, b2) {
        b2 = b2.checked;
        null != b2 && ta(a2, "checked", b2, false);
      }
      function bb(a2, b2) {
        ab(a2, b2);
        var c2 = Sa(b2.value), d2 = b2.type;
        if (null != c2) if ("number" === d2) {
          if (0 === c2 && "" === a2.value || a2.value != c2) a2.value = "" + c2;
        } else a2.value !== "" + c2 && (a2.value = "" + c2);
        else if ("submit" === d2 || "reset" === d2) {
          a2.removeAttribute("value");
          return;
        }
        b2.hasOwnProperty("value") ? cb(a2, b2.type, c2) : b2.hasOwnProperty("defaultValue") && cb(a2, b2.type, Sa(b2.defaultValue));
        null == b2.checked && null != b2.defaultChecked && (a2.defaultChecked = !!b2.defaultChecked);
      }
      function db(a2, b2, c2) {
        if (b2.hasOwnProperty("value") || b2.hasOwnProperty("defaultValue")) {
          var d2 = b2.type;
          if (!("submit" !== d2 && "reset" !== d2 || void 0 !== b2.value && null !== b2.value)) return;
          b2 = "" + a2._wrapperState.initialValue;
          c2 || b2 === a2.value || (a2.value = b2);
          a2.defaultValue = b2;
        }
        c2 = a2.name;
        "" !== c2 && (a2.name = "");
        a2.defaultChecked = !!a2._wrapperState.initialChecked;
        "" !== c2 && (a2.name = c2);
      }
      function cb(a2, b2, c2) {
        if ("number" !== b2 || Xa(a2.ownerDocument) !== a2) null == c2 ? a2.defaultValue = "" + a2._wrapperState.initialValue : a2.defaultValue !== "" + c2 && (a2.defaultValue = "" + c2);
      }
      var eb = Array.isArray;
      function fb(a2, b2, c2, d2) {
        a2 = a2.options;
        if (b2) {
          b2 = {};
          for (var e2 = 0; e2 < c2.length; e2++) b2["$" + c2[e2]] = true;
          for (c2 = 0; c2 < a2.length; c2++) e2 = b2.hasOwnProperty("$" + a2[c2].value), a2[c2].selected !== e2 && (a2[c2].selected = e2), e2 && d2 && (a2[c2].defaultSelected = true);
        } else {
          c2 = "" + Sa(c2);
          b2 = null;
          for (e2 = 0; e2 < a2.length; e2++) {
            if (a2[e2].value === c2) {
              a2[e2].selected = true;
              d2 && (a2[e2].defaultSelected = true);
              return;
            }
            null !== b2 || a2[e2].disabled || (b2 = a2[e2]);
          }
          null !== b2 && (b2.selected = true);
        }
      }
      function gb(a2, b2) {
        if (null != b2.dangerouslySetInnerHTML) throw Error(p2(91));
        return A2({}, b2, { value: void 0, defaultValue: void 0, children: "" + a2._wrapperState.initialValue });
      }
      function hb(a2, b2) {
        var c2 = b2.value;
        if (null == c2) {
          c2 = b2.children;
          b2 = b2.defaultValue;
          if (null != c2) {
            if (null != b2) throw Error(p2(92));
            if (eb(c2)) {
              if (1 < c2.length) throw Error(p2(93));
              c2 = c2[0];
            }
            b2 = c2;
          }
          null == b2 && (b2 = "");
          c2 = b2;
        }
        a2._wrapperState = { initialValue: Sa(c2) };
      }
      function ib(a2, b2) {
        var c2 = Sa(b2.value), d2 = Sa(b2.defaultValue);
        null != c2 && (c2 = "" + c2, c2 !== a2.value && (a2.value = c2), null == b2.defaultValue && a2.defaultValue !== c2 && (a2.defaultValue = c2));
        null != d2 && (a2.defaultValue = "" + d2);
      }
      function jb(a2) {
        var b2 = a2.textContent;
        b2 === a2._wrapperState.initialValue && "" !== b2 && null !== b2 && (a2.value = b2);
      }
      function kb(a2) {
        switch (a2) {
          case "svg":
            return "http://www.w3.org/2000/svg";
          case "math":
            return "http://www.w3.org/1998/Math/MathML";
          default:
            return "http://www.w3.org/1999/xhtml";
        }
      }
      function lb(a2, b2) {
        return null == a2 || "http://www.w3.org/1999/xhtml" === a2 ? kb(b2) : "http://www.w3.org/2000/svg" === a2 && "foreignObject" === b2 ? "http://www.w3.org/1999/xhtml" : a2;
      }
      var mb;
      var nb = (function(a2) {
        return "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction ? function(b2, c2, d2, e2) {
          MSApp.execUnsafeLocalFunction(function() {
            return a2(b2, c2, d2, e2);
          });
        } : a2;
      })(function(a2, b2) {
        if ("http://www.w3.org/2000/svg" !== a2.namespaceURI || "innerHTML" in a2) a2.innerHTML = b2;
        else {
          mb = mb || document.createElement("div");
          mb.innerHTML = "<svg>" + b2.valueOf().toString() + "</svg>";
          for (b2 = mb.firstChild; a2.firstChild; ) a2.removeChild(a2.firstChild);
          for (; b2.firstChild; ) a2.appendChild(b2.firstChild);
        }
      });
      function ob(a2, b2) {
        if (b2) {
          var c2 = a2.firstChild;
          if (c2 && c2 === a2.lastChild && 3 === c2.nodeType) {
            c2.nodeValue = b2;
            return;
          }
        }
        a2.textContent = b2;
      }
      var pb = {
        animationIterationCount: true,
        aspectRatio: true,
        borderImageOutset: true,
        borderImageSlice: true,
        borderImageWidth: true,
        boxFlex: true,
        boxFlexGroup: true,
        boxOrdinalGroup: true,
        columnCount: true,
        columns: true,
        flex: true,
        flexGrow: true,
        flexPositive: true,
        flexShrink: true,
        flexNegative: true,
        flexOrder: true,
        gridArea: true,
        gridRow: true,
        gridRowEnd: true,
        gridRowSpan: true,
        gridRowStart: true,
        gridColumn: true,
        gridColumnEnd: true,
        gridColumnSpan: true,
        gridColumnStart: true,
        fontWeight: true,
        lineClamp: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
        tabSize: true,
        widows: true,
        zIndex: true,
        zoom: true,
        fillOpacity: true,
        floodOpacity: true,
        stopOpacity: true,
        strokeDasharray: true,
        strokeDashoffset: true,
        strokeMiterlimit: true,
        strokeOpacity: true,
        strokeWidth: true
      };
      var qb = ["Webkit", "ms", "Moz", "O"];
      Object.keys(pb).forEach(function(a2) {
        qb.forEach(function(b2) {
          b2 = b2 + a2.charAt(0).toUpperCase() + a2.substring(1);
          pb[b2] = pb[a2];
        });
      });
      function rb(a2, b2, c2) {
        return null == b2 || "boolean" === typeof b2 || "" === b2 ? "" : c2 || "number" !== typeof b2 || 0 === b2 || pb.hasOwnProperty(a2) && pb[a2] ? ("" + b2).trim() : b2 + "px";
      }
      function sb(a2, b2) {
        a2 = a2.style;
        for (var c2 in b2) if (b2.hasOwnProperty(c2)) {
          var d2 = 0 === c2.indexOf("--"), e2 = rb(c2, b2[c2], d2);
          "float" === c2 && (c2 = "cssFloat");
          d2 ? a2.setProperty(c2, e2) : a2[c2] = e2;
        }
      }
      var tb = A2({ menuitem: true }, { area: true, base: true, br: true, col: true, embed: true, hr: true, img: true, input: true, keygen: true, link: true, meta: true, param: true, source: true, track: true, wbr: true });
      function ub(a2, b2) {
        if (b2) {
          if (tb[a2] && (null != b2.children || null != b2.dangerouslySetInnerHTML)) throw Error(p2(137, a2));
          if (null != b2.dangerouslySetInnerHTML) {
            if (null != b2.children) throw Error(p2(60));
            if ("object" !== typeof b2.dangerouslySetInnerHTML || !("__html" in b2.dangerouslySetInnerHTML)) throw Error(p2(61));
          }
          if (null != b2.style && "object" !== typeof b2.style) throw Error(p2(62));
        }
      }
      function vb(a2, b2) {
        if (-1 === a2.indexOf("-")) return "string" === typeof b2.is;
        switch (a2) {
          case "annotation-xml":
          case "color-profile":
          case "font-face":
          case "font-face-src":
          case "font-face-uri":
          case "font-face-format":
          case "font-face-name":
          case "missing-glyph":
            return false;
          default:
            return true;
        }
      }
      var wb = null;
      function xb(a2) {
        a2 = a2.target || a2.srcElement || window;
        a2.correspondingUseElement && (a2 = a2.correspondingUseElement);
        return 3 === a2.nodeType ? a2.parentNode : a2;
      }
      var yb = null;
      var zb = null;
      var Ab = null;
      function Bb(a2) {
        if (a2 = Cb(a2)) {
          if ("function" !== typeof yb) throw Error(p2(280));
          var b2 = a2.stateNode;
          b2 && (b2 = Db(b2), yb(a2.stateNode, a2.type, b2));
        }
      }
      function Eb(a2) {
        zb ? Ab ? Ab.push(a2) : Ab = [a2] : zb = a2;
      }
      function Fb() {
        if (zb) {
          var a2 = zb, b2 = Ab;
          Ab = zb = null;
          Bb(a2);
          if (b2) for (a2 = 0; a2 < b2.length; a2++) Bb(b2[a2]);
        }
      }
      function Gb(a2, b2) {
        return a2(b2);
      }
      function Hb() {
      }
      var Ib = false;
      function Jb(a2, b2, c2) {
        if (Ib) return a2(b2, c2);
        Ib = true;
        try {
          return Gb(a2, b2, c2);
        } finally {
          if (Ib = false, null !== zb || null !== Ab) Hb(), Fb();
        }
      }
      function Kb(a2, b2) {
        var c2 = a2.stateNode;
        if (null === c2) return null;
        var d2 = Db(c2);
        if (null === d2) return null;
        c2 = d2[b2];
        a: switch (b2) {
          case "onClick":
          case "onClickCapture":
          case "onDoubleClick":
          case "onDoubleClickCapture":
          case "onMouseDown":
          case "onMouseDownCapture":
          case "onMouseMove":
          case "onMouseMoveCapture":
          case "onMouseUp":
          case "onMouseUpCapture":
          case "onMouseEnter":
            (d2 = !d2.disabled) || (a2 = a2.type, d2 = !("button" === a2 || "input" === a2 || "select" === a2 || "textarea" === a2));
            a2 = !d2;
            break a;
          default:
            a2 = false;
        }
        if (a2) return null;
        if (c2 && "function" !== typeof c2) throw Error(p2(231, b2, typeof c2));
        return c2;
      }
      var Lb = false;
      if (ia) try {
        Mb = {};
        Object.defineProperty(Mb, "passive", { get: function() {
          Lb = true;
        } });
        window.addEventListener("test", Mb, Mb);
        window.removeEventListener("test", Mb, Mb);
      } catch (a2) {
        Lb = false;
      }
      var Mb;
      function Nb(a2, b2, c2, d2, e2, f2, g2, h2, k2) {
        var l2 = Array.prototype.slice.call(arguments, 3);
        try {
          b2.apply(c2, l2);
        } catch (m2) {
          this.onError(m2);
        }
      }
      var Ob = false;
      var Pb = null;
      var Qb = false;
      var Rb = null;
      var Sb = { onError: function(a2) {
        Ob = true;
        Pb = a2;
      } };
      function Tb(a2, b2, c2, d2, e2, f2, g2, h2, k2) {
        Ob = false;
        Pb = null;
        Nb.apply(Sb, arguments);
      }
      function Ub(a2, b2, c2, d2, e2, f2, g2, h2, k2) {
        Tb.apply(this, arguments);
        if (Ob) {
          if (Ob) {
            var l2 = Pb;
            Ob = false;
            Pb = null;
          } else throw Error(p2(198));
          Qb || (Qb = true, Rb = l2);
        }
      }
      function Vb(a2) {
        var b2 = a2, c2 = a2;
        if (a2.alternate) for (; b2.return; ) b2 = b2.return;
        else {
          a2 = b2;
          do
            b2 = a2, 0 !== (b2.flags & 4098) && (c2 = b2.return), a2 = b2.return;
          while (a2);
        }
        return 3 === b2.tag ? c2 : null;
      }
      function Wb(a2) {
        if (13 === a2.tag) {
          var b2 = a2.memoizedState;
          null === b2 && (a2 = a2.alternate, null !== a2 && (b2 = a2.memoizedState));
          if (null !== b2) return b2.dehydrated;
        }
        return null;
      }
      function Xb(a2) {
        if (Vb(a2) !== a2) throw Error(p2(188));
      }
      function Yb(a2) {
        var b2 = a2.alternate;
        if (!b2) {
          b2 = Vb(a2);
          if (null === b2) throw Error(p2(188));
          return b2 !== a2 ? null : a2;
        }
        for (var c2 = a2, d2 = b2; ; ) {
          var e2 = c2.return;
          if (null === e2) break;
          var f2 = e2.alternate;
          if (null === f2) {
            d2 = e2.return;
            if (null !== d2) {
              c2 = d2;
              continue;
            }
            break;
          }
          if (e2.child === f2.child) {
            for (f2 = e2.child; f2; ) {
              if (f2 === c2) return Xb(e2), a2;
              if (f2 === d2) return Xb(e2), b2;
              f2 = f2.sibling;
            }
            throw Error(p2(188));
          }
          if (c2.return !== d2.return) c2 = e2, d2 = f2;
          else {
            for (var g2 = false, h2 = e2.child; h2; ) {
              if (h2 === c2) {
                g2 = true;
                c2 = e2;
                d2 = f2;
                break;
              }
              if (h2 === d2) {
                g2 = true;
                d2 = e2;
                c2 = f2;
                break;
              }
              h2 = h2.sibling;
            }
            if (!g2) {
              for (h2 = f2.child; h2; ) {
                if (h2 === c2) {
                  g2 = true;
                  c2 = f2;
                  d2 = e2;
                  break;
                }
                if (h2 === d2) {
                  g2 = true;
                  d2 = f2;
                  c2 = e2;
                  break;
                }
                h2 = h2.sibling;
              }
              if (!g2) throw Error(p2(189));
            }
          }
          if (c2.alternate !== d2) throw Error(p2(190));
        }
        if (3 !== c2.tag) throw Error(p2(188));
        return c2.stateNode.current === c2 ? a2 : b2;
      }
      function Zb(a2) {
        a2 = Yb(a2);
        return null !== a2 ? $b(a2) : null;
      }
      function $b(a2) {
        if (5 === a2.tag || 6 === a2.tag) return a2;
        for (a2 = a2.child; null !== a2; ) {
          var b2 = $b(a2);
          if (null !== b2) return b2;
          a2 = a2.sibling;
        }
        return null;
      }
      var ac = ca.unstable_scheduleCallback;
      var bc = ca.unstable_cancelCallback;
      var cc = ca.unstable_shouldYield;
      var dc = ca.unstable_requestPaint;
      var B2 = ca.unstable_now;
      var ec = ca.unstable_getCurrentPriorityLevel;
      var fc = ca.unstable_ImmediatePriority;
      var gc = ca.unstable_UserBlockingPriority;
      var hc = ca.unstable_NormalPriority;
      var ic = ca.unstable_LowPriority;
      var jc = ca.unstable_IdlePriority;
      var kc = null;
      var lc = null;
      function mc(a2) {
        if (lc && "function" === typeof lc.onCommitFiberRoot) try {
          lc.onCommitFiberRoot(kc, a2, void 0, 128 === (a2.current.flags & 128));
        } catch (b2) {
        }
      }
      var oc = Math.clz32 ? Math.clz32 : nc;
      var pc = Math.log;
      var qc = Math.LN2;
      function nc(a2) {
        a2 >>>= 0;
        return 0 === a2 ? 32 : 31 - (pc(a2) / qc | 0) | 0;
      }
      var rc = 64;
      var sc = 4194304;
      function tc(a2) {
        switch (a2 & -a2) {
          case 1:
            return 1;
          case 2:
            return 2;
          case 4:
            return 4;
          case 8:
            return 8;
          case 16:
            return 16;
          case 32:
            return 32;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
            return a2 & 4194240;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            return a2 & 130023424;
          case 134217728:
            return 134217728;
          case 268435456:
            return 268435456;
          case 536870912:
            return 536870912;
          case 1073741824:
            return 1073741824;
          default:
            return a2;
        }
      }
      function uc(a2, b2) {
        var c2 = a2.pendingLanes;
        if (0 === c2) return 0;
        var d2 = 0, e2 = a2.suspendedLanes, f2 = a2.pingedLanes, g2 = c2 & 268435455;
        if (0 !== g2) {
          var h2 = g2 & ~e2;
          0 !== h2 ? d2 = tc(h2) : (f2 &= g2, 0 !== f2 && (d2 = tc(f2)));
        } else g2 = c2 & ~e2, 0 !== g2 ? d2 = tc(g2) : 0 !== f2 && (d2 = tc(f2));
        if (0 === d2) return 0;
        if (0 !== b2 && b2 !== d2 && 0 === (b2 & e2) && (e2 = d2 & -d2, f2 = b2 & -b2, e2 >= f2 || 16 === e2 && 0 !== (f2 & 4194240))) return b2;
        0 !== (d2 & 4) && (d2 |= c2 & 16);
        b2 = a2.entangledLanes;
        if (0 !== b2) for (a2 = a2.entanglements, b2 &= d2; 0 < b2; ) c2 = 31 - oc(b2), e2 = 1 << c2, d2 |= a2[c2], b2 &= ~e2;
        return d2;
      }
      function vc(a2, b2) {
        switch (a2) {
          case 1:
          case 2:
          case 4:
            return b2 + 250;
          case 8:
          case 16:
          case 32:
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
            return b2 + 5e3;
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            return -1;
          case 134217728:
          case 268435456:
          case 536870912:
          case 1073741824:
            return -1;
          default:
            return -1;
        }
      }
      function wc(a2, b2) {
        for (var c2 = a2.suspendedLanes, d2 = a2.pingedLanes, e2 = a2.expirationTimes, f2 = a2.pendingLanes; 0 < f2; ) {
          var g2 = 31 - oc(f2), h2 = 1 << g2, k2 = e2[g2];
          if (-1 === k2) {
            if (0 === (h2 & c2) || 0 !== (h2 & d2)) e2[g2] = vc(h2, b2);
          } else k2 <= b2 && (a2.expiredLanes |= h2);
          f2 &= ~h2;
        }
      }
      function xc(a2) {
        a2 = a2.pendingLanes & -1073741825;
        return 0 !== a2 ? a2 : a2 & 1073741824 ? 1073741824 : 0;
      }
      function yc() {
        var a2 = rc;
        rc <<= 1;
        0 === (rc & 4194240) && (rc = 64);
        return a2;
      }
      function zc(a2) {
        for (var b2 = [], c2 = 0; 31 > c2; c2++) b2.push(a2);
        return b2;
      }
      function Ac(a2, b2, c2) {
        a2.pendingLanes |= b2;
        536870912 !== b2 && (a2.suspendedLanes = 0, a2.pingedLanes = 0);
        a2 = a2.eventTimes;
        b2 = 31 - oc(b2);
        a2[b2] = c2;
      }
      function Bc(a2, b2) {
        var c2 = a2.pendingLanes & ~b2;
        a2.pendingLanes = b2;
        a2.suspendedLanes = 0;
        a2.pingedLanes = 0;
        a2.expiredLanes &= b2;
        a2.mutableReadLanes &= b2;
        a2.entangledLanes &= b2;
        b2 = a2.entanglements;
        var d2 = a2.eventTimes;
        for (a2 = a2.expirationTimes; 0 < c2; ) {
          var e2 = 31 - oc(c2), f2 = 1 << e2;
          b2[e2] = 0;
          d2[e2] = -1;
          a2[e2] = -1;
          c2 &= ~f2;
        }
      }
      function Cc(a2, b2) {
        var c2 = a2.entangledLanes |= b2;
        for (a2 = a2.entanglements; c2; ) {
          var d2 = 31 - oc(c2), e2 = 1 << d2;
          e2 & b2 | a2[d2] & b2 && (a2[d2] |= b2);
          c2 &= ~e2;
        }
      }
      var C2 = 0;
      function Dc(a2) {
        a2 &= -a2;
        return 1 < a2 ? 4 < a2 ? 0 !== (a2 & 268435455) ? 16 : 536870912 : 4 : 1;
      }
      var Ec;
      var Fc;
      var Gc;
      var Hc;
      var Ic;
      var Jc = false;
      var Kc = [];
      var Lc = null;
      var Mc = null;
      var Nc = null;
      var Oc = /* @__PURE__ */ new Map();
      var Pc = /* @__PURE__ */ new Map();
      var Qc = [];
      var Rc = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
      function Sc(a2, b2) {
        switch (a2) {
          case "focusin":
          case "focusout":
            Lc = null;
            break;
          case "dragenter":
          case "dragleave":
            Mc = null;
            break;
          case "mouseover":
          case "mouseout":
            Nc = null;
            break;
          case "pointerover":
          case "pointerout":
            Oc.delete(b2.pointerId);
            break;
          case "gotpointercapture":
          case "lostpointercapture":
            Pc.delete(b2.pointerId);
        }
      }
      function Tc(a2, b2, c2, d2, e2, f2) {
        if (null === a2 || a2.nativeEvent !== f2) return a2 = { blockedOn: b2, domEventName: c2, eventSystemFlags: d2, nativeEvent: f2, targetContainers: [e2] }, null !== b2 && (b2 = Cb(b2), null !== b2 && Fc(b2)), a2;
        a2.eventSystemFlags |= d2;
        b2 = a2.targetContainers;
        null !== e2 && -1 === b2.indexOf(e2) && b2.push(e2);
        return a2;
      }
      function Uc(a2, b2, c2, d2, e2) {
        switch (b2) {
          case "focusin":
            return Lc = Tc(Lc, a2, b2, c2, d2, e2), true;
          case "dragenter":
            return Mc = Tc(Mc, a2, b2, c2, d2, e2), true;
          case "mouseover":
            return Nc = Tc(Nc, a2, b2, c2, d2, e2), true;
          case "pointerover":
            var f2 = e2.pointerId;
            Oc.set(f2, Tc(Oc.get(f2) || null, a2, b2, c2, d2, e2));
            return true;
          case "gotpointercapture":
            return f2 = e2.pointerId, Pc.set(f2, Tc(Pc.get(f2) || null, a2, b2, c2, d2, e2)), true;
        }
        return false;
      }
      function Vc(a2) {
        var b2 = Wc(a2.target);
        if (null !== b2) {
          var c2 = Vb(b2);
          if (null !== c2) {
            if (b2 = c2.tag, 13 === b2) {
              if (b2 = Wb(c2), null !== b2) {
                a2.blockedOn = b2;
                Ic(a2.priority, function() {
                  Gc(c2);
                });
                return;
              }
            } else if (3 === b2 && c2.stateNode.current.memoizedState.isDehydrated) {
              a2.blockedOn = 3 === c2.tag ? c2.stateNode.containerInfo : null;
              return;
            }
          }
        }
        a2.blockedOn = null;
      }
      function Xc(a2) {
        if (null !== a2.blockedOn) return false;
        for (var b2 = a2.targetContainers; 0 < b2.length; ) {
          var c2 = Yc(a2.domEventName, a2.eventSystemFlags, b2[0], a2.nativeEvent);
          if (null === c2) {
            c2 = a2.nativeEvent;
            var d2 = new c2.constructor(c2.type, c2);
            wb = d2;
            c2.target.dispatchEvent(d2);
            wb = null;
          } else return b2 = Cb(c2), null !== b2 && Fc(b2), a2.blockedOn = c2, false;
          b2.shift();
        }
        return true;
      }
      function Zc(a2, b2, c2) {
        Xc(a2) && c2.delete(b2);
      }
      function $c() {
        Jc = false;
        null !== Lc && Xc(Lc) && (Lc = null);
        null !== Mc && Xc(Mc) && (Mc = null);
        null !== Nc && Xc(Nc) && (Nc = null);
        Oc.forEach(Zc);
        Pc.forEach(Zc);
      }
      function ad(a2, b2) {
        a2.blockedOn === b2 && (a2.blockedOn = null, Jc || (Jc = true, ca.unstable_scheduleCallback(ca.unstable_NormalPriority, $c)));
      }
      function bd(a2) {
        function b2(b3) {
          return ad(b3, a2);
        }
        if (0 < Kc.length) {
          ad(Kc[0], a2);
          for (var c2 = 1; c2 < Kc.length; c2++) {
            var d2 = Kc[c2];
            d2.blockedOn === a2 && (d2.blockedOn = null);
          }
        }
        null !== Lc && ad(Lc, a2);
        null !== Mc && ad(Mc, a2);
        null !== Nc && ad(Nc, a2);
        Oc.forEach(b2);
        Pc.forEach(b2);
        for (c2 = 0; c2 < Qc.length; c2++) d2 = Qc[c2], d2.blockedOn === a2 && (d2.blockedOn = null);
        for (; 0 < Qc.length && (c2 = Qc[0], null === c2.blockedOn); ) Vc(c2), null === c2.blockedOn && Qc.shift();
      }
      var cd = ua.ReactCurrentBatchConfig;
      var dd = true;
      function ed(a2, b2, c2, d2) {
        var e2 = C2, f2 = cd.transition;
        cd.transition = null;
        try {
          C2 = 1, fd(a2, b2, c2, d2);
        } finally {
          C2 = e2, cd.transition = f2;
        }
      }
      function gd(a2, b2, c2, d2) {
        var e2 = C2, f2 = cd.transition;
        cd.transition = null;
        try {
          C2 = 4, fd(a2, b2, c2, d2);
        } finally {
          C2 = e2, cd.transition = f2;
        }
      }
      function fd(a2, b2, c2, d2) {
        if (dd) {
          var e2 = Yc(a2, b2, c2, d2);
          if (null === e2) hd(a2, b2, d2, id, c2), Sc(a2, d2);
          else if (Uc(e2, a2, b2, c2, d2)) d2.stopPropagation();
          else if (Sc(a2, d2), b2 & 4 && -1 < Rc.indexOf(a2)) {
            for (; null !== e2; ) {
              var f2 = Cb(e2);
              null !== f2 && Ec(f2);
              f2 = Yc(a2, b2, c2, d2);
              null === f2 && hd(a2, b2, d2, id, c2);
              if (f2 === e2) break;
              e2 = f2;
            }
            null !== e2 && d2.stopPropagation();
          } else hd(a2, b2, d2, null, c2);
        }
      }
      var id = null;
      function Yc(a2, b2, c2, d2) {
        id = null;
        a2 = xb(d2);
        a2 = Wc(a2);
        if (null !== a2) if (b2 = Vb(a2), null === b2) a2 = null;
        else if (c2 = b2.tag, 13 === c2) {
          a2 = Wb(b2);
          if (null !== a2) return a2;
          a2 = null;
        } else if (3 === c2) {
          if (b2.stateNode.current.memoizedState.isDehydrated) return 3 === b2.tag ? b2.stateNode.containerInfo : null;
          a2 = null;
        } else b2 !== a2 && (a2 = null);
        id = a2;
        return null;
      }
      function jd(a2) {
        switch (a2) {
          case "cancel":
          case "click":
          case "close":
          case "contextmenu":
          case "copy":
          case "cut":
          case "auxclick":
          case "dblclick":
          case "dragend":
          case "dragstart":
          case "drop":
          case "focusin":
          case "focusout":
          case "input":
          case "invalid":
          case "keydown":
          case "keypress":
          case "keyup":
          case "mousedown":
          case "mouseup":
          case "paste":
          case "pause":
          case "play":
          case "pointercancel":
          case "pointerdown":
          case "pointerup":
          case "ratechange":
          case "reset":
          case "resize":
          case "seeked":
          case "submit":
          case "touchcancel":
          case "touchend":
          case "touchstart":
          case "volumechange":
          case "change":
          case "selectionchange":
          case "textInput":
          case "compositionstart":
          case "compositionend":
          case "compositionupdate":
          case "beforeblur":
          case "afterblur":
          case "beforeinput":
          case "blur":
          case "fullscreenchange":
          case "focus":
          case "hashchange":
          case "popstate":
          case "select":
          case "selectstart":
            return 1;
          case "drag":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "mousemove":
          case "mouseout":
          case "mouseover":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "scroll":
          case "toggle":
          case "touchmove":
          case "wheel":
          case "mouseenter":
          case "mouseleave":
          case "pointerenter":
          case "pointerleave":
            return 4;
          case "message":
            switch (ec()) {
              case fc:
                return 1;
              case gc:
                return 4;
              case hc:
              case ic:
                return 16;
              case jc:
                return 536870912;
              default:
                return 16;
            }
          default:
            return 16;
        }
      }
      var kd = null;
      var ld = null;
      var md = null;
      function nd() {
        if (md) return md;
        var a2, b2 = ld, c2 = b2.length, d2, e2 = "value" in kd ? kd.value : kd.textContent, f2 = e2.length;
        for (a2 = 0; a2 < c2 && b2[a2] === e2[a2]; a2++) ;
        var g2 = c2 - a2;
        for (d2 = 1; d2 <= g2 && b2[c2 - d2] === e2[f2 - d2]; d2++) ;
        return md = e2.slice(a2, 1 < d2 ? 1 - d2 : void 0);
      }
      function od(a2) {
        var b2 = a2.keyCode;
        "charCode" in a2 ? (a2 = a2.charCode, 0 === a2 && 13 === b2 && (a2 = 13)) : a2 = b2;
        10 === a2 && (a2 = 13);
        return 32 <= a2 || 13 === a2 ? a2 : 0;
      }
      function pd() {
        return true;
      }
      function qd() {
        return false;
      }
      function rd(a2) {
        function b2(b3, d2, e2, f2, g2) {
          this._reactName = b3;
          this._targetInst = e2;
          this.type = d2;
          this.nativeEvent = f2;
          this.target = g2;
          this.currentTarget = null;
          for (var c2 in a2) a2.hasOwnProperty(c2) && (b3 = a2[c2], this[c2] = b3 ? b3(f2) : f2[c2]);
          this.isDefaultPrevented = (null != f2.defaultPrevented ? f2.defaultPrevented : false === f2.returnValue) ? pd : qd;
          this.isPropagationStopped = qd;
          return this;
        }
        A2(b2.prototype, { preventDefault: function() {
          this.defaultPrevented = true;
          var a3 = this.nativeEvent;
          a3 && (a3.preventDefault ? a3.preventDefault() : "unknown" !== typeof a3.returnValue && (a3.returnValue = false), this.isDefaultPrevented = pd);
        }, stopPropagation: function() {
          var a3 = this.nativeEvent;
          a3 && (a3.stopPropagation ? a3.stopPropagation() : "unknown" !== typeof a3.cancelBubble && (a3.cancelBubble = true), this.isPropagationStopped = pd);
        }, persist: function() {
        }, isPersistent: pd });
        return b2;
      }
      var sd = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(a2) {
        return a2.timeStamp || Date.now();
      }, defaultPrevented: 0, isTrusted: 0 };
      var td = rd(sd);
      var ud = A2({}, sd, { view: 0, detail: 0 });
      var vd = rd(ud);
      var wd;
      var xd;
      var yd;
      var Ad = A2({}, ud, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: zd, button: 0, buttons: 0, relatedTarget: function(a2) {
        return void 0 === a2.relatedTarget ? a2.fromElement === a2.srcElement ? a2.toElement : a2.fromElement : a2.relatedTarget;
      }, movementX: function(a2) {
        if ("movementX" in a2) return a2.movementX;
        a2 !== yd && (yd && "mousemove" === a2.type ? (wd = a2.screenX - yd.screenX, xd = a2.screenY - yd.screenY) : xd = wd = 0, yd = a2);
        return wd;
      }, movementY: function(a2) {
        return "movementY" in a2 ? a2.movementY : xd;
      } });
      var Bd = rd(Ad);
      var Cd = A2({}, Ad, { dataTransfer: 0 });
      var Dd = rd(Cd);
      var Ed = A2({}, ud, { relatedTarget: 0 });
      var Fd = rd(Ed);
      var Gd = A2({}, sd, { animationName: 0, elapsedTime: 0, pseudoElement: 0 });
      var Hd = rd(Gd);
      var Id = A2({}, sd, { clipboardData: function(a2) {
        return "clipboardData" in a2 ? a2.clipboardData : window.clipboardData;
      } });
      var Jd = rd(Id);
      var Kd = A2({}, sd, { data: 0 });
      var Ld = rd(Kd);
      var Md = {
        Esc: "Escape",
        Spacebar: " ",
        Left: "ArrowLeft",
        Up: "ArrowUp",
        Right: "ArrowRight",
        Down: "ArrowDown",
        Del: "Delete",
        Win: "OS",
        Menu: "ContextMenu",
        Apps: "ContextMenu",
        Scroll: "ScrollLock",
        MozPrintableKey: "Unidentified"
      };
      var Nd = {
        8: "Backspace",
        9: "Tab",
        12: "Clear",
        13: "Enter",
        16: "Shift",
        17: "Control",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "ArrowLeft",
        38: "ArrowUp",
        39: "ArrowRight",
        40: "ArrowDown",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        144: "NumLock",
        145: "ScrollLock",
        224: "Meta"
      };
      var Od = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
      function Pd(a2) {
        var b2 = this.nativeEvent;
        return b2.getModifierState ? b2.getModifierState(a2) : (a2 = Od[a2]) ? !!b2[a2] : false;
      }
      function zd() {
        return Pd;
      }
      var Qd = A2({}, ud, { key: function(a2) {
        if (a2.key) {
          var b2 = Md[a2.key] || a2.key;
          if ("Unidentified" !== b2) return b2;
        }
        return "keypress" === a2.type ? (a2 = od(a2), 13 === a2 ? "Enter" : String.fromCharCode(a2)) : "keydown" === a2.type || "keyup" === a2.type ? Nd[a2.keyCode] || "Unidentified" : "";
      }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: zd, charCode: function(a2) {
        return "keypress" === a2.type ? od(a2) : 0;
      }, keyCode: function(a2) {
        return "keydown" === a2.type || "keyup" === a2.type ? a2.keyCode : 0;
      }, which: function(a2) {
        return "keypress" === a2.type ? od(a2) : "keydown" === a2.type || "keyup" === a2.type ? a2.keyCode : 0;
      } });
      var Rd = rd(Qd);
      var Sd = A2({}, Ad, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 });
      var Td = rd(Sd);
      var Ud = A2({}, ud, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: zd });
      var Vd = rd(Ud);
      var Wd = A2({}, sd, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 });
      var Xd = rd(Wd);
      var Yd = A2({}, Ad, {
        deltaX: function(a2) {
          return "deltaX" in a2 ? a2.deltaX : "wheelDeltaX" in a2 ? -a2.wheelDeltaX : 0;
        },
        deltaY: function(a2) {
          return "deltaY" in a2 ? a2.deltaY : "wheelDeltaY" in a2 ? -a2.wheelDeltaY : "wheelDelta" in a2 ? -a2.wheelDelta : 0;
        },
        deltaZ: 0,
        deltaMode: 0
      });
      var Zd = rd(Yd);
      var $d = [9, 13, 27, 32];
      var ae2 = ia && "CompositionEvent" in window;
      var be2 = null;
      ia && "documentMode" in document && (be2 = document.documentMode);
      var ce2 = ia && "TextEvent" in window && !be2;
      var de2 = ia && (!ae2 || be2 && 8 < be2 && 11 >= be2);
      var ee2 = String.fromCharCode(32);
      var fe2 = false;
      function ge2(a2, b2) {
        switch (a2) {
          case "keyup":
            return -1 !== $d.indexOf(b2.keyCode);
          case "keydown":
            return 229 !== b2.keyCode;
          case "keypress":
          case "mousedown":
          case "focusout":
            return true;
          default:
            return false;
        }
      }
      function he2(a2) {
        a2 = a2.detail;
        return "object" === typeof a2 && "data" in a2 ? a2.data : null;
      }
      var ie2 = false;
      function je(a2, b2) {
        switch (a2) {
          case "compositionend":
            return he2(b2);
          case "keypress":
            if (32 !== b2.which) return null;
            fe2 = true;
            return ee2;
          case "textInput":
            return a2 = b2.data, a2 === ee2 && fe2 ? null : a2;
          default:
            return null;
        }
      }
      function ke2(a2, b2) {
        if (ie2) return "compositionend" === a2 || !ae2 && ge2(a2, b2) ? (a2 = nd(), md = ld = kd = null, ie2 = false, a2) : null;
        switch (a2) {
          case "paste":
            return null;
          case "keypress":
            if (!(b2.ctrlKey || b2.altKey || b2.metaKey) || b2.ctrlKey && b2.altKey) {
              if (b2.char && 1 < b2.char.length) return b2.char;
              if (b2.which) return String.fromCharCode(b2.which);
            }
            return null;
          case "compositionend":
            return de2 && "ko" !== b2.locale ? null : b2.data;
          default:
            return null;
        }
      }
      var le2 = { color: true, date: true, datetime: true, "datetime-local": true, email: true, month: true, number: true, password: true, range: true, search: true, tel: true, text: true, time: true, url: true, week: true };
      function me2(a2) {
        var b2 = a2 && a2.nodeName && a2.nodeName.toLowerCase();
        return "input" === b2 ? !!le2[a2.type] : "textarea" === b2 ? true : false;
      }
      function ne2(a2, b2, c2, d2) {
        Eb(d2);
        b2 = oe2(b2, "onChange");
        0 < b2.length && (c2 = new td("onChange", "change", null, c2, d2), a2.push({ event: c2, listeners: b2 }));
      }
      var pe2 = null;
      var qe = null;
      function re2(a2) {
        se2(a2, 0);
      }
      function te2(a2) {
        var b2 = ue2(a2);
        if (Wa(b2)) return a2;
      }
      function ve2(a2, b2) {
        if ("change" === a2) return b2;
      }
      var we2 = false;
      if (ia) {
        if (ia) {
          ye2 = "oninput" in document;
          if (!ye2) {
            ze = document.createElement("div");
            ze.setAttribute("oninput", "return;");
            ye2 = "function" === typeof ze.oninput;
          }
          xe2 = ye2;
        } else xe2 = false;
        we2 = xe2 && (!document.documentMode || 9 < document.documentMode);
      }
      var xe2;
      var ye2;
      var ze;
      function Ae2() {
        pe2 && (pe2.detachEvent("onpropertychange", Be), qe = pe2 = null);
      }
      function Be(a2) {
        if ("value" === a2.propertyName && te2(qe)) {
          var b2 = [];
          ne2(b2, qe, a2, xb(a2));
          Jb(re2, b2);
        }
      }
      function Ce2(a2, b2, c2) {
        "focusin" === a2 ? (Ae2(), pe2 = b2, qe = c2, pe2.attachEvent("onpropertychange", Be)) : "focusout" === a2 && Ae2();
      }
      function De2(a2) {
        if ("selectionchange" === a2 || "keyup" === a2 || "keydown" === a2) return te2(qe);
      }
      function Ee2(a2, b2) {
        if ("click" === a2) return te2(b2);
      }
      function Fe(a2, b2) {
        if ("input" === a2 || "change" === a2) return te2(b2);
      }
      function Ge(a2, b2) {
        return a2 === b2 && (0 !== a2 || 1 / a2 === 1 / b2) || a2 !== a2 && b2 !== b2;
      }
      var He = "function" === typeof Object.is ? Object.is : Ge;
      function Ie(a2, b2) {
        if (He(a2, b2)) return true;
        if ("object" !== typeof a2 || null === a2 || "object" !== typeof b2 || null === b2) return false;
        var c2 = Object.keys(a2), d2 = Object.keys(b2);
        if (c2.length !== d2.length) return false;
        for (d2 = 0; d2 < c2.length; d2++) {
          var e2 = c2[d2];
          if (!ja.call(b2, e2) || !He(a2[e2], b2[e2])) return false;
        }
        return true;
      }
      function Je(a2) {
        for (; a2 && a2.firstChild; ) a2 = a2.firstChild;
        return a2;
      }
      function Ke(a2, b2) {
        var c2 = Je(a2);
        a2 = 0;
        for (var d2; c2; ) {
          if (3 === c2.nodeType) {
            d2 = a2 + c2.textContent.length;
            if (a2 <= b2 && d2 >= b2) return { node: c2, offset: b2 - a2 };
            a2 = d2;
          }
          a: {
            for (; c2; ) {
              if (c2.nextSibling) {
                c2 = c2.nextSibling;
                break a;
              }
              c2 = c2.parentNode;
            }
            c2 = void 0;
          }
          c2 = Je(c2);
        }
      }
      function Le(a2, b2) {
        return a2 && b2 ? a2 === b2 ? true : a2 && 3 === a2.nodeType ? false : b2 && 3 === b2.nodeType ? Le(a2, b2.parentNode) : "contains" in a2 ? a2.contains(b2) : a2.compareDocumentPosition ? !!(a2.compareDocumentPosition(b2) & 16) : false : false;
      }
      function Me2() {
        for (var a2 = window, b2 = Xa(); b2 instanceof a2.HTMLIFrameElement; ) {
          try {
            var c2 = "string" === typeof b2.contentWindow.location.href;
          } catch (d2) {
            c2 = false;
          }
          if (c2) a2 = b2.contentWindow;
          else break;
          b2 = Xa(a2.document);
        }
        return b2;
      }
      function Ne(a2) {
        var b2 = a2 && a2.nodeName && a2.nodeName.toLowerCase();
        return b2 && ("input" === b2 && ("text" === a2.type || "search" === a2.type || "tel" === a2.type || "url" === a2.type || "password" === a2.type) || "textarea" === b2 || "true" === a2.contentEditable);
      }
      function Oe(a2) {
        var b2 = Me2(), c2 = a2.focusedElem, d2 = a2.selectionRange;
        if (b2 !== c2 && c2 && c2.ownerDocument && Le(c2.ownerDocument.documentElement, c2)) {
          if (null !== d2 && Ne(c2)) {
            if (b2 = d2.start, a2 = d2.end, void 0 === a2 && (a2 = b2), "selectionStart" in c2) c2.selectionStart = b2, c2.selectionEnd = Math.min(a2, c2.value.length);
            else if (a2 = (b2 = c2.ownerDocument || document) && b2.defaultView || window, a2.getSelection) {
              a2 = a2.getSelection();
              var e2 = c2.textContent.length, f2 = Math.min(d2.start, e2);
              d2 = void 0 === d2.end ? f2 : Math.min(d2.end, e2);
              !a2.extend && f2 > d2 && (e2 = d2, d2 = f2, f2 = e2);
              e2 = Ke(c2, f2);
              var g2 = Ke(
                c2,
                d2
              );
              e2 && g2 && (1 !== a2.rangeCount || a2.anchorNode !== e2.node || a2.anchorOffset !== e2.offset || a2.focusNode !== g2.node || a2.focusOffset !== g2.offset) && (b2 = b2.createRange(), b2.setStart(e2.node, e2.offset), a2.removeAllRanges(), f2 > d2 ? (a2.addRange(b2), a2.extend(g2.node, g2.offset)) : (b2.setEnd(g2.node, g2.offset), a2.addRange(b2)));
            }
          }
          b2 = [];
          for (a2 = c2; a2 = a2.parentNode; ) 1 === a2.nodeType && b2.push({ element: a2, left: a2.scrollLeft, top: a2.scrollTop });
          "function" === typeof c2.focus && c2.focus();
          for (c2 = 0; c2 < b2.length; c2++) a2 = b2[c2], a2.element.scrollLeft = a2.left, a2.element.scrollTop = a2.top;
        }
      }
      var Pe2 = ia && "documentMode" in document && 11 >= document.documentMode;
      var Qe = null;
      var Re = null;
      var Se2 = null;
      var Te2 = false;
      function Ue(a2, b2, c2) {
        var d2 = c2.window === c2 ? c2.document : 9 === c2.nodeType ? c2 : c2.ownerDocument;
        Te2 || null == Qe || Qe !== Xa(d2) || (d2 = Qe, "selectionStart" in d2 && Ne(d2) ? d2 = { start: d2.selectionStart, end: d2.selectionEnd } : (d2 = (d2.ownerDocument && d2.ownerDocument.defaultView || window).getSelection(), d2 = { anchorNode: d2.anchorNode, anchorOffset: d2.anchorOffset, focusNode: d2.focusNode, focusOffset: d2.focusOffset }), Se2 && Ie(Se2, d2) || (Se2 = d2, d2 = oe2(Re, "onSelect"), 0 < d2.length && (b2 = new td("onSelect", "select", null, b2, c2), a2.push({ event: b2, listeners: d2 }), b2.target = Qe)));
      }
      function Ve(a2, b2) {
        var c2 = {};
        c2[a2.toLowerCase()] = b2.toLowerCase();
        c2["Webkit" + a2] = "webkit" + b2;
        c2["Moz" + a2] = "moz" + b2;
        return c2;
      }
      var We = { animationend: Ve("Animation", "AnimationEnd"), animationiteration: Ve("Animation", "AnimationIteration"), animationstart: Ve("Animation", "AnimationStart"), transitionend: Ve("Transition", "TransitionEnd") };
      var Xe = {};
      var Ye = {};
      ia && (Ye = document.createElement("div").style, "AnimationEvent" in window || (delete We.animationend.animation, delete We.animationiteration.animation, delete We.animationstart.animation), "TransitionEvent" in window || delete We.transitionend.transition);
      function Ze(a2) {
        if (Xe[a2]) return Xe[a2];
        if (!We[a2]) return a2;
        var b2 = We[a2], c2;
        for (c2 in b2) if (b2.hasOwnProperty(c2) && c2 in Ye) return Xe[a2] = b2[c2];
        return a2;
      }
      var $e = Ze("animationend");
      var af = Ze("animationiteration");
      var bf = Ze("animationstart");
      var cf = Ze("transitionend");
      var df = /* @__PURE__ */ new Map();
      var ef = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
      function ff(a2, b2) {
        df.set(a2, b2);
        fa(b2, [a2]);
      }
      for (gf = 0; gf < ef.length; gf++) {
        hf = ef[gf], jf = hf.toLowerCase(), kf = hf[0].toUpperCase() + hf.slice(1);
        ff(jf, "on" + kf);
      }
      var hf;
      var jf;
      var kf;
      var gf;
      ff($e, "onAnimationEnd");
      ff(af, "onAnimationIteration");
      ff(bf, "onAnimationStart");
      ff("dblclick", "onDoubleClick");
      ff("focusin", "onFocus");
      ff("focusout", "onBlur");
      ff(cf, "onTransitionEnd");
      ha("onMouseEnter", ["mouseout", "mouseover"]);
      ha("onMouseLeave", ["mouseout", "mouseover"]);
      ha("onPointerEnter", ["pointerout", "pointerover"]);
      ha("onPointerLeave", ["pointerout", "pointerover"]);
      fa("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
      fa("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
      fa("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
      fa("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
      fa("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
      fa("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
      var lf = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ");
      var mf = new Set("cancel close invalid load scroll toggle".split(" ").concat(lf));
      function nf(a2, b2, c2) {
        var d2 = a2.type || "unknown-event";
        a2.currentTarget = c2;
        Ub(d2, b2, void 0, a2);
        a2.currentTarget = null;
      }
      function se2(a2, b2) {
        b2 = 0 !== (b2 & 4);
        for (var c2 = 0; c2 < a2.length; c2++) {
          var d2 = a2[c2], e2 = d2.event;
          d2 = d2.listeners;
          a: {
            var f2 = void 0;
            if (b2) for (var g2 = d2.length - 1; 0 <= g2; g2--) {
              var h2 = d2[g2], k2 = h2.instance, l2 = h2.currentTarget;
              h2 = h2.listener;
              if (k2 !== f2 && e2.isPropagationStopped()) break a;
              nf(e2, h2, l2);
              f2 = k2;
            }
            else for (g2 = 0; g2 < d2.length; g2++) {
              h2 = d2[g2];
              k2 = h2.instance;
              l2 = h2.currentTarget;
              h2 = h2.listener;
              if (k2 !== f2 && e2.isPropagationStopped()) break a;
              nf(e2, h2, l2);
              f2 = k2;
            }
          }
        }
        if (Qb) throw a2 = Rb, Qb = false, Rb = null, a2;
      }
      function D2(a2, b2) {
        var c2 = b2[of];
        void 0 === c2 && (c2 = b2[of] = /* @__PURE__ */ new Set());
        var d2 = a2 + "__bubble";
        c2.has(d2) || (pf(b2, a2, 2, false), c2.add(d2));
      }
      function qf(a2, b2, c2) {
        var d2 = 0;
        b2 && (d2 |= 4);
        pf(c2, a2, d2, b2);
      }
      var rf = "_reactListening" + Math.random().toString(36).slice(2);
      function sf(a2) {
        if (!a2[rf]) {
          a2[rf] = true;
          da.forEach(function(b3) {
            "selectionchange" !== b3 && (mf.has(b3) || qf(b3, false, a2), qf(b3, true, a2));
          });
          var b2 = 9 === a2.nodeType ? a2 : a2.ownerDocument;
          null === b2 || b2[rf] || (b2[rf] = true, qf("selectionchange", false, b2));
        }
      }
      function pf(a2, b2, c2, d2) {
        switch (jd(b2)) {
          case 1:
            var e2 = ed;
            break;
          case 4:
            e2 = gd;
            break;
          default:
            e2 = fd;
        }
        c2 = e2.bind(null, b2, c2, a2);
        e2 = void 0;
        !Lb || "touchstart" !== b2 && "touchmove" !== b2 && "wheel" !== b2 || (e2 = true);
        d2 ? void 0 !== e2 ? a2.addEventListener(b2, c2, { capture: true, passive: e2 }) : a2.addEventListener(b2, c2, true) : void 0 !== e2 ? a2.addEventListener(b2, c2, { passive: e2 }) : a2.addEventListener(b2, c2, false);
      }
      function hd(a2, b2, c2, d2, e2) {
        var f2 = d2;
        if (0 === (b2 & 1) && 0 === (b2 & 2) && null !== d2) a: for (; ; ) {
          if (null === d2) return;
          var g2 = d2.tag;
          if (3 === g2 || 4 === g2) {
            var h2 = d2.stateNode.containerInfo;
            if (h2 === e2 || 8 === h2.nodeType && h2.parentNode === e2) break;
            if (4 === g2) for (g2 = d2.return; null !== g2; ) {
              var k2 = g2.tag;
              if (3 === k2 || 4 === k2) {
                if (k2 = g2.stateNode.containerInfo, k2 === e2 || 8 === k2.nodeType && k2.parentNode === e2) return;
              }
              g2 = g2.return;
            }
            for (; null !== h2; ) {
              g2 = Wc(h2);
              if (null === g2) return;
              k2 = g2.tag;
              if (5 === k2 || 6 === k2) {
                d2 = f2 = g2;
                continue a;
              }
              h2 = h2.parentNode;
            }
          }
          d2 = d2.return;
        }
        Jb(function() {
          var d3 = f2, e3 = xb(c2), g3 = [];
          a: {
            var h3 = df.get(a2);
            if (void 0 !== h3) {
              var k3 = td, n2 = a2;
              switch (a2) {
                case "keypress":
                  if (0 === od(c2)) break a;
                case "keydown":
                case "keyup":
                  k3 = Rd;
                  break;
                case "focusin":
                  n2 = "focus";
                  k3 = Fd;
                  break;
                case "focusout":
                  n2 = "blur";
                  k3 = Fd;
                  break;
                case "beforeblur":
                case "afterblur":
                  k3 = Fd;
                  break;
                case "click":
                  if (2 === c2.button) break a;
                case "auxclick":
                case "dblclick":
                case "mousedown":
                case "mousemove":
                case "mouseup":
                case "mouseout":
                case "mouseover":
                case "contextmenu":
                  k3 = Bd;
                  break;
                case "drag":
                case "dragend":
                case "dragenter":
                case "dragexit":
                case "dragleave":
                case "dragover":
                case "dragstart":
                case "drop":
                  k3 = Dd;
                  break;
                case "touchcancel":
                case "touchend":
                case "touchmove":
                case "touchstart":
                  k3 = Vd;
                  break;
                case $e:
                case af:
                case bf:
                  k3 = Hd;
                  break;
                case cf:
                  k3 = Xd;
                  break;
                case "scroll":
                  k3 = vd;
                  break;
                case "wheel":
                  k3 = Zd;
                  break;
                case "copy":
                case "cut":
                case "paste":
                  k3 = Jd;
                  break;
                case "gotpointercapture":
                case "lostpointercapture":
                case "pointercancel":
                case "pointerdown":
                case "pointermove":
                case "pointerout":
                case "pointerover":
                case "pointerup":
                  k3 = Td;
              }
              var t2 = 0 !== (b2 & 4), J2 = !t2 && "scroll" === a2, x2 = t2 ? null !== h3 ? h3 + "Capture" : null : h3;
              t2 = [];
              for (var w2 = d3, u2; null !== w2; ) {
                u2 = w2;
                var F2 = u2.stateNode;
                5 === u2.tag && null !== F2 && (u2 = F2, null !== x2 && (F2 = Kb(w2, x2), null != F2 && t2.push(tf(w2, F2, u2))));
                if (J2) break;
                w2 = w2.return;
              }
              0 < t2.length && (h3 = new k3(h3, n2, null, c2, e3), g3.push({ event: h3, listeners: t2 }));
            }
          }
          if (0 === (b2 & 7)) {
            a: {
              h3 = "mouseover" === a2 || "pointerover" === a2;
              k3 = "mouseout" === a2 || "pointerout" === a2;
              if (h3 && c2 !== wb && (n2 = c2.relatedTarget || c2.fromElement) && (Wc(n2) || n2[uf])) break a;
              if (k3 || h3) {
                h3 = e3.window === e3 ? e3 : (h3 = e3.ownerDocument) ? h3.defaultView || h3.parentWindow : window;
                if (k3) {
                  if (n2 = c2.relatedTarget || c2.toElement, k3 = d3, n2 = n2 ? Wc(n2) : null, null !== n2 && (J2 = Vb(n2), n2 !== J2 || 5 !== n2.tag && 6 !== n2.tag)) n2 = null;
                } else k3 = null, n2 = d3;
                if (k3 !== n2) {
                  t2 = Bd;
                  F2 = "onMouseLeave";
                  x2 = "onMouseEnter";
                  w2 = "mouse";
                  if ("pointerout" === a2 || "pointerover" === a2) t2 = Td, F2 = "onPointerLeave", x2 = "onPointerEnter", w2 = "pointer";
                  J2 = null == k3 ? h3 : ue2(k3);
                  u2 = null == n2 ? h3 : ue2(n2);
                  h3 = new t2(F2, w2 + "leave", k3, c2, e3);
                  h3.target = J2;
                  h3.relatedTarget = u2;
                  F2 = null;
                  Wc(e3) === d3 && (t2 = new t2(x2, w2 + "enter", n2, c2, e3), t2.target = u2, t2.relatedTarget = J2, F2 = t2);
                  J2 = F2;
                  if (k3 && n2) b: {
                    t2 = k3;
                    x2 = n2;
                    w2 = 0;
                    for (u2 = t2; u2; u2 = vf(u2)) w2++;
                    u2 = 0;
                    for (F2 = x2; F2; F2 = vf(F2)) u2++;
                    for (; 0 < w2 - u2; ) t2 = vf(t2), w2--;
                    for (; 0 < u2 - w2; ) x2 = vf(x2), u2--;
                    for (; w2--; ) {
                      if (t2 === x2 || null !== x2 && t2 === x2.alternate) break b;
                      t2 = vf(t2);
                      x2 = vf(x2);
                    }
                    t2 = null;
                  }
                  else t2 = null;
                  null !== k3 && wf(g3, h3, k3, t2, false);
                  null !== n2 && null !== J2 && wf(g3, J2, n2, t2, true);
                }
              }
            }
            a: {
              h3 = d3 ? ue2(d3) : window;
              k3 = h3.nodeName && h3.nodeName.toLowerCase();
              if ("select" === k3 || "input" === k3 && "file" === h3.type) var na = ve2;
              else if (me2(h3)) if (we2) na = Fe;
              else {
                na = De2;
                var xa = Ce2;
              }
              else (k3 = h3.nodeName) && "input" === k3.toLowerCase() && ("checkbox" === h3.type || "radio" === h3.type) && (na = Ee2);
              if (na && (na = na(a2, d3))) {
                ne2(g3, na, c2, e3);
                break a;
              }
              xa && xa(a2, h3, d3);
              "focusout" === a2 && (xa = h3._wrapperState) && xa.controlled && "number" === h3.type && cb(h3, "number", h3.value);
            }
            xa = d3 ? ue2(d3) : window;
            switch (a2) {
              case "focusin":
                if (me2(xa) || "true" === xa.contentEditable) Qe = xa, Re = d3, Se2 = null;
                break;
              case "focusout":
                Se2 = Re = Qe = null;
                break;
              case "mousedown":
                Te2 = true;
                break;
              case "contextmenu":
              case "mouseup":
              case "dragend":
                Te2 = false;
                Ue(g3, c2, e3);
                break;
              case "selectionchange":
                if (Pe2) break;
              case "keydown":
              case "keyup":
                Ue(g3, c2, e3);
            }
            var $a;
            if (ae2) b: {
              switch (a2) {
                case "compositionstart":
                  var ba = "onCompositionStart";
                  break b;
                case "compositionend":
                  ba = "onCompositionEnd";
                  break b;
                case "compositionupdate":
                  ba = "onCompositionUpdate";
                  break b;
              }
              ba = void 0;
            }
            else ie2 ? ge2(a2, c2) && (ba = "onCompositionEnd") : "keydown" === a2 && 229 === c2.keyCode && (ba = "onCompositionStart");
            ba && (de2 && "ko" !== c2.locale && (ie2 || "onCompositionStart" !== ba ? "onCompositionEnd" === ba && ie2 && ($a = nd()) : (kd = e3, ld = "value" in kd ? kd.value : kd.textContent, ie2 = true)), xa = oe2(d3, ba), 0 < xa.length && (ba = new Ld(ba, a2, null, c2, e3), g3.push({ event: ba, listeners: xa }), $a ? ba.data = $a : ($a = he2(c2), null !== $a && (ba.data = $a))));
            if ($a = ce2 ? je(a2, c2) : ke2(a2, c2)) d3 = oe2(d3, "onBeforeInput"), 0 < d3.length && (e3 = new Ld("onBeforeInput", "beforeinput", null, c2, e3), g3.push({ event: e3, listeners: d3 }), e3.data = $a);
          }
          se2(g3, b2);
        });
      }
      function tf(a2, b2, c2) {
        return { instance: a2, listener: b2, currentTarget: c2 };
      }
      function oe2(a2, b2) {
        for (var c2 = b2 + "Capture", d2 = []; null !== a2; ) {
          var e2 = a2, f2 = e2.stateNode;
          5 === e2.tag && null !== f2 && (e2 = f2, f2 = Kb(a2, c2), null != f2 && d2.unshift(tf(a2, f2, e2)), f2 = Kb(a2, b2), null != f2 && d2.push(tf(a2, f2, e2)));
          a2 = a2.return;
        }
        return d2;
      }
      function vf(a2) {
        if (null === a2) return null;
        do
          a2 = a2.return;
        while (a2 && 5 !== a2.tag);
        return a2 ? a2 : null;
      }
      function wf(a2, b2, c2, d2, e2) {
        for (var f2 = b2._reactName, g2 = []; null !== c2 && c2 !== d2; ) {
          var h2 = c2, k2 = h2.alternate, l2 = h2.stateNode;
          if (null !== k2 && k2 === d2) break;
          5 === h2.tag && null !== l2 && (h2 = l2, e2 ? (k2 = Kb(c2, f2), null != k2 && g2.unshift(tf(c2, k2, h2))) : e2 || (k2 = Kb(c2, f2), null != k2 && g2.push(tf(c2, k2, h2))));
          c2 = c2.return;
        }
        0 !== g2.length && a2.push({ event: b2, listeners: g2 });
      }
      var xf = /\r\n?/g;
      var yf = /\u0000|\uFFFD/g;
      function zf(a2) {
        return ("string" === typeof a2 ? a2 : "" + a2).replace(xf, "\n").replace(yf, "");
      }
      function Af(a2, b2, c2) {
        b2 = zf(b2);
        if (zf(a2) !== b2 && c2) throw Error(p2(425));
      }
      function Bf() {
      }
      var Cf = null;
      var Df = null;
      function Ef(a2, b2) {
        return "textarea" === a2 || "noscript" === a2 || "string" === typeof b2.children || "number" === typeof b2.children || "object" === typeof b2.dangerouslySetInnerHTML && null !== b2.dangerouslySetInnerHTML && null != b2.dangerouslySetInnerHTML.__html;
      }
      var Ff = "function" === typeof setTimeout ? setTimeout : void 0;
      var Gf = "function" === typeof clearTimeout ? clearTimeout : void 0;
      var Hf = "function" === typeof Promise ? Promise : void 0;
      var Jf = "function" === typeof queueMicrotask ? queueMicrotask : "undefined" !== typeof Hf ? function(a2) {
        return Hf.resolve(null).then(a2).catch(If);
      } : Ff;
      function If(a2) {
        setTimeout(function() {
          throw a2;
        });
      }
      function Kf(a2, b2) {
        var c2 = b2, d2 = 0;
        do {
          var e2 = c2.nextSibling;
          a2.removeChild(c2);
          if (e2 && 8 === e2.nodeType) if (c2 = e2.data, "/$" === c2) {
            if (0 === d2) {
              a2.removeChild(e2);
              bd(b2);
              return;
            }
            d2--;
          } else "$" !== c2 && "$?" !== c2 && "$!" !== c2 || d2++;
          c2 = e2;
        } while (c2);
        bd(b2);
      }
      function Lf(a2) {
        for (; null != a2; a2 = a2.nextSibling) {
          var b2 = a2.nodeType;
          if (1 === b2 || 3 === b2) break;
          if (8 === b2) {
            b2 = a2.data;
            if ("$" === b2 || "$!" === b2 || "$?" === b2) break;
            if ("/$" === b2) return null;
          }
        }
        return a2;
      }
      function Mf(a2) {
        a2 = a2.previousSibling;
        for (var b2 = 0; a2; ) {
          if (8 === a2.nodeType) {
            var c2 = a2.data;
            if ("$" === c2 || "$!" === c2 || "$?" === c2) {
              if (0 === b2) return a2;
              b2--;
            } else "/$" === c2 && b2++;
          }
          a2 = a2.previousSibling;
        }
        return null;
      }
      var Nf = Math.random().toString(36).slice(2);
      var Of = "__reactFiber$" + Nf;
      var Pf = "__reactProps$" + Nf;
      var uf = "__reactContainer$" + Nf;
      var of = "__reactEvents$" + Nf;
      var Qf = "__reactListeners$" + Nf;
      var Rf = "__reactHandles$" + Nf;
      function Wc(a2) {
        var b2 = a2[Of];
        if (b2) return b2;
        for (var c2 = a2.parentNode; c2; ) {
          if (b2 = c2[uf] || c2[Of]) {
            c2 = b2.alternate;
            if (null !== b2.child || null !== c2 && null !== c2.child) for (a2 = Mf(a2); null !== a2; ) {
              if (c2 = a2[Of]) return c2;
              a2 = Mf(a2);
            }
            return b2;
          }
          a2 = c2;
          c2 = a2.parentNode;
        }
        return null;
      }
      function Cb(a2) {
        a2 = a2[Of] || a2[uf];
        return !a2 || 5 !== a2.tag && 6 !== a2.tag && 13 !== a2.tag && 3 !== a2.tag ? null : a2;
      }
      function ue2(a2) {
        if (5 === a2.tag || 6 === a2.tag) return a2.stateNode;
        throw Error(p2(33));
      }
      function Db(a2) {
        return a2[Pf] || null;
      }
      var Sf = [];
      var Tf = -1;
      function Uf(a2) {
        return { current: a2 };
      }
      function E2(a2) {
        0 > Tf || (a2.current = Sf[Tf], Sf[Tf] = null, Tf--);
      }
      function G2(a2, b2) {
        Tf++;
        Sf[Tf] = a2.current;
        a2.current = b2;
      }
      var Vf = {};
      var H3 = Uf(Vf);
      var Wf = Uf(false);
      var Xf = Vf;
      function Yf(a2, b2) {
        var c2 = a2.type.contextTypes;
        if (!c2) return Vf;
        var d2 = a2.stateNode;
        if (d2 && d2.__reactInternalMemoizedUnmaskedChildContext === b2) return d2.__reactInternalMemoizedMaskedChildContext;
        var e2 = {}, f2;
        for (f2 in c2) e2[f2] = b2[f2];
        d2 && (a2 = a2.stateNode, a2.__reactInternalMemoizedUnmaskedChildContext = b2, a2.__reactInternalMemoizedMaskedChildContext = e2);
        return e2;
      }
      function Zf(a2) {
        a2 = a2.childContextTypes;
        return null !== a2 && void 0 !== a2;
      }
      function $f() {
        E2(Wf);
        E2(H3);
      }
      function ag(a2, b2, c2) {
        if (H3.current !== Vf) throw Error(p2(168));
        G2(H3, b2);
        G2(Wf, c2);
      }
      function bg(a2, b2, c2) {
        var d2 = a2.stateNode;
        b2 = b2.childContextTypes;
        if ("function" !== typeof d2.getChildContext) return c2;
        d2 = d2.getChildContext();
        for (var e2 in d2) if (!(e2 in b2)) throw Error(p2(108, Ra(a2) || "Unknown", e2));
        return A2({}, c2, d2);
      }
      function cg(a2) {
        a2 = (a2 = a2.stateNode) && a2.__reactInternalMemoizedMergedChildContext || Vf;
        Xf = H3.current;
        G2(H3, a2);
        G2(Wf, Wf.current);
        return true;
      }
      function dg(a2, b2, c2) {
        var d2 = a2.stateNode;
        if (!d2) throw Error(p2(169));
        c2 ? (a2 = bg(a2, b2, Xf), d2.__reactInternalMemoizedMergedChildContext = a2, E2(Wf), E2(H3), G2(H3, a2)) : E2(Wf);
        G2(Wf, c2);
      }
      var eg = null;
      var fg = false;
      var gg = false;
      function hg(a2) {
        null === eg ? eg = [a2] : eg.push(a2);
      }
      function ig(a2) {
        fg = true;
        hg(a2);
      }
      function jg() {
        if (!gg && null !== eg) {
          gg = true;
          var a2 = 0, b2 = C2;
          try {
            var c2 = eg;
            for (C2 = 1; a2 < c2.length; a2++) {
              var d2 = c2[a2];
              do
                d2 = d2(true);
              while (null !== d2);
            }
            eg = null;
            fg = false;
          } catch (e2) {
            throw null !== eg && (eg = eg.slice(a2 + 1)), ac(fc, jg), e2;
          } finally {
            C2 = b2, gg = false;
          }
        }
        return null;
      }
      var kg = [];
      var lg = 0;
      var mg = null;
      var ng = 0;
      var og = [];
      var pg = 0;
      var qg = null;
      var rg = 1;
      var sg = "";
      function tg(a2, b2) {
        kg[lg++] = ng;
        kg[lg++] = mg;
        mg = a2;
        ng = b2;
      }
      function ug(a2, b2, c2) {
        og[pg++] = rg;
        og[pg++] = sg;
        og[pg++] = qg;
        qg = a2;
        var d2 = rg;
        a2 = sg;
        var e2 = 32 - oc(d2) - 1;
        d2 &= ~(1 << e2);
        c2 += 1;
        var f2 = 32 - oc(b2) + e2;
        if (30 < f2) {
          var g2 = e2 - e2 % 5;
          f2 = (d2 & (1 << g2) - 1).toString(32);
          d2 >>= g2;
          e2 -= g2;
          rg = 1 << 32 - oc(b2) + e2 | c2 << e2 | d2;
          sg = f2 + a2;
        } else rg = 1 << f2 | c2 << e2 | d2, sg = a2;
      }
      function vg(a2) {
        null !== a2.return && (tg(a2, 1), ug(a2, 1, 0));
      }
      function wg(a2) {
        for (; a2 === mg; ) mg = kg[--lg], kg[lg] = null, ng = kg[--lg], kg[lg] = null;
        for (; a2 === qg; ) qg = og[--pg], og[pg] = null, sg = og[--pg], og[pg] = null, rg = og[--pg], og[pg] = null;
      }
      var xg = null;
      var yg = null;
      var I2 = false;
      var zg = null;
      function Ag(a2, b2) {
        var c2 = Bg(5, null, null, 0);
        c2.elementType = "DELETED";
        c2.stateNode = b2;
        c2.return = a2;
        b2 = a2.deletions;
        null === b2 ? (a2.deletions = [c2], a2.flags |= 16) : b2.push(c2);
      }
      function Cg(a2, b2) {
        switch (a2.tag) {
          case 5:
            var c2 = a2.type;
            b2 = 1 !== b2.nodeType || c2.toLowerCase() !== b2.nodeName.toLowerCase() ? null : b2;
            return null !== b2 ? (a2.stateNode = b2, xg = a2, yg = Lf(b2.firstChild), true) : false;
          case 6:
            return b2 = "" === a2.pendingProps || 3 !== b2.nodeType ? null : b2, null !== b2 ? (a2.stateNode = b2, xg = a2, yg = null, true) : false;
          case 13:
            return b2 = 8 !== b2.nodeType ? null : b2, null !== b2 ? (c2 = null !== qg ? { id: rg, overflow: sg } : null, a2.memoizedState = { dehydrated: b2, treeContext: c2, retryLane: 1073741824 }, c2 = Bg(18, null, null, 0), c2.stateNode = b2, c2.return = a2, a2.child = c2, xg = a2, yg = null, true) : false;
          default:
            return false;
        }
      }
      function Dg(a2) {
        return 0 !== (a2.mode & 1) && 0 === (a2.flags & 128);
      }
      function Eg(a2) {
        if (I2) {
          var b2 = yg;
          if (b2) {
            var c2 = b2;
            if (!Cg(a2, b2)) {
              if (Dg(a2)) throw Error(p2(418));
              b2 = Lf(c2.nextSibling);
              var d2 = xg;
              b2 && Cg(a2, b2) ? Ag(d2, c2) : (a2.flags = a2.flags & -4097 | 2, I2 = false, xg = a2);
            }
          } else {
            if (Dg(a2)) throw Error(p2(418));
            a2.flags = a2.flags & -4097 | 2;
            I2 = false;
            xg = a2;
          }
        }
      }
      function Fg(a2) {
        for (a2 = a2.return; null !== a2 && 5 !== a2.tag && 3 !== a2.tag && 13 !== a2.tag; ) a2 = a2.return;
        xg = a2;
      }
      function Gg(a2) {
        if (a2 !== xg) return false;
        if (!I2) return Fg(a2), I2 = true, false;
        var b2;
        (b2 = 3 !== a2.tag) && !(b2 = 5 !== a2.tag) && (b2 = a2.type, b2 = "head" !== b2 && "body" !== b2 && !Ef(a2.type, a2.memoizedProps));
        if (b2 && (b2 = yg)) {
          if (Dg(a2)) throw Hg(), Error(p2(418));
          for (; b2; ) Ag(a2, b2), b2 = Lf(b2.nextSibling);
        }
        Fg(a2);
        if (13 === a2.tag) {
          a2 = a2.memoizedState;
          a2 = null !== a2 ? a2.dehydrated : null;
          if (!a2) throw Error(p2(317));
          a: {
            a2 = a2.nextSibling;
            for (b2 = 0; a2; ) {
              if (8 === a2.nodeType) {
                var c2 = a2.data;
                if ("/$" === c2) {
                  if (0 === b2) {
                    yg = Lf(a2.nextSibling);
                    break a;
                  }
                  b2--;
                } else "$" !== c2 && "$!" !== c2 && "$?" !== c2 || b2++;
              }
              a2 = a2.nextSibling;
            }
            yg = null;
          }
        } else yg = xg ? Lf(a2.stateNode.nextSibling) : null;
        return true;
      }
      function Hg() {
        for (var a2 = yg; a2; ) a2 = Lf(a2.nextSibling);
      }
      function Ig() {
        yg = xg = null;
        I2 = false;
      }
      function Jg(a2) {
        null === zg ? zg = [a2] : zg.push(a2);
      }
      var Kg = ua.ReactCurrentBatchConfig;
      function Lg(a2, b2, c2) {
        a2 = c2.ref;
        if (null !== a2 && "function" !== typeof a2 && "object" !== typeof a2) {
          if (c2._owner) {
            c2 = c2._owner;
            if (c2) {
              if (1 !== c2.tag) throw Error(p2(309));
              var d2 = c2.stateNode;
            }
            if (!d2) throw Error(p2(147, a2));
            var e2 = d2, f2 = "" + a2;
            if (null !== b2 && null !== b2.ref && "function" === typeof b2.ref && b2.ref._stringRef === f2) return b2.ref;
            b2 = function(a3) {
              var b3 = e2.refs;
              null === a3 ? delete b3[f2] : b3[f2] = a3;
            };
            b2._stringRef = f2;
            return b2;
          }
          if ("string" !== typeof a2) throw Error(p2(284));
          if (!c2._owner) throw Error(p2(290, a2));
        }
        return a2;
      }
      function Mg(a2, b2) {
        a2 = Object.prototype.toString.call(b2);
        throw Error(p2(31, "[object Object]" === a2 ? "object with keys {" + Object.keys(b2).join(", ") + "}" : a2));
      }
      function Ng(a2) {
        var b2 = a2._init;
        return b2(a2._payload);
      }
      function Og(a2) {
        function b2(b3, c3) {
          if (a2) {
            var d3 = b3.deletions;
            null === d3 ? (b3.deletions = [c3], b3.flags |= 16) : d3.push(c3);
          }
        }
        function c2(c3, d3) {
          if (!a2) return null;
          for (; null !== d3; ) b2(c3, d3), d3 = d3.sibling;
          return null;
        }
        function d2(a3, b3) {
          for (a3 = /* @__PURE__ */ new Map(); null !== b3; ) null !== b3.key ? a3.set(b3.key, b3) : a3.set(b3.index, b3), b3 = b3.sibling;
          return a3;
        }
        function e2(a3, b3) {
          a3 = Pg(a3, b3);
          a3.index = 0;
          a3.sibling = null;
          return a3;
        }
        function f2(b3, c3, d3) {
          b3.index = d3;
          if (!a2) return b3.flags |= 1048576, c3;
          d3 = b3.alternate;
          if (null !== d3) return d3 = d3.index, d3 < c3 ? (b3.flags |= 2, c3) : d3;
          b3.flags |= 2;
          return c3;
        }
        function g2(b3) {
          a2 && null === b3.alternate && (b3.flags |= 2);
          return b3;
        }
        function h2(a3, b3, c3, d3) {
          if (null === b3 || 6 !== b3.tag) return b3 = Qg(c3, a3.mode, d3), b3.return = a3, b3;
          b3 = e2(b3, c3);
          b3.return = a3;
          return b3;
        }
        function k2(a3, b3, c3, d3) {
          var f3 = c3.type;
          if (f3 === ya) return m2(a3, b3, c3.props.children, d3, c3.key);
          if (null !== b3 && (b3.elementType === f3 || "object" === typeof f3 && null !== f3 && f3.$$typeof === Ha && Ng(f3) === b3.type)) return d3 = e2(b3, c3.props), d3.ref = Lg(a3, b3, c3), d3.return = a3, d3;
          d3 = Rg(c3.type, c3.key, c3.props, null, a3.mode, d3);
          d3.ref = Lg(a3, b3, c3);
          d3.return = a3;
          return d3;
        }
        function l2(a3, b3, c3, d3) {
          if (null === b3 || 4 !== b3.tag || b3.stateNode.containerInfo !== c3.containerInfo || b3.stateNode.implementation !== c3.implementation) return b3 = Sg(c3, a3.mode, d3), b3.return = a3, b3;
          b3 = e2(b3, c3.children || []);
          b3.return = a3;
          return b3;
        }
        function m2(a3, b3, c3, d3, f3) {
          if (null === b3 || 7 !== b3.tag) return b3 = Tg(c3, a3.mode, d3, f3), b3.return = a3, b3;
          b3 = e2(b3, c3);
          b3.return = a3;
          return b3;
        }
        function q2(a3, b3, c3) {
          if ("string" === typeof b3 && "" !== b3 || "number" === typeof b3) return b3 = Qg("" + b3, a3.mode, c3), b3.return = a3, b3;
          if ("object" === typeof b3 && null !== b3) {
            switch (b3.$$typeof) {
              case va:
                return c3 = Rg(b3.type, b3.key, b3.props, null, a3.mode, c3), c3.ref = Lg(a3, null, b3), c3.return = a3, c3;
              case wa:
                return b3 = Sg(b3, a3.mode, c3), b3.return = a3, b3;
              case Ha:
                var d3 = b3._init;
                return q2(a3, d3(b3._payload), c3);
            }
            if (eb(b3) || Ka(b3)) return b3 = Tg(b3, a3.mode, c3, null), b3.return = a3, b3;
            Mg(a3, b3);
          }
          return null;
        }
        function r2(a3, b3, c3, d3) {
          var e3 = null !== b3 ? b3.key : null;
          if ("string" === typeof c3 && "" !== c3 || "number" === typeof c3) return null !== e3 ? null : h2(a3, b3, "" + c3, d3);
          if ("object" === typeof c3 && null !== c3) {
            switch (c3.$$typeof) {
              case va:
                return c3.key === e3 ? k2(a3, b3, c3, d3) : null;
              case wa:
                return c3.key === e3 ? l2(a3, b3, c3, d3) : null;
              case Ha:
                return e3 = c3._init, r2(
                  a3,
                  b3,
                  e3(c3._payload),
                  d3
                );
            }
            if (eb(c3) || Ka(c3)) return null !== e3 ? null : m2(a3, b3, c3, d3, null);
            Mg(a3, c3);
          }
          return null;
        }
        function y2(a3, b3, c3, d3, e3) {
          if ("string" === typeof d3 && "" !== d3 || "number" === typeof d3) return a3 = a3.get(c3) || null, h2(b3, a3, "" + d3, e3);
          if ("object" === typeof d3 && null !== d3) {
            switch (d3.$$typeof) {
              case va:
                return a3 = a3.get(null === d3.key ? c3 : d3.key) || null, k2(b3, a3, d3, e3);
              case wa:
                return a3 = a3.get(null === d3.key ? c3 : d3.key) || null, l2(b3, a3, d3, e3);
              case Ha:
                var f3 = d3._init;
                return y2(a3, b3, c3, f3(d3._payload), e3);
            }
            if (eb(d3) || Ka(d3)) return a3 = a3.get(c3) || null, m2(b3, a3, d3, e3, null);
            Mg(b3, d3);
          }
          return null;
        }
        function n2(e3, g3, h3, k3) {
          for (var l3 = null, m3 = null, u2 = g3, w2 = g3 = 0, x2 = null; null !== u2 && w2 < h3.length; w2++) {
            u2.index > w2 ? (x2 = u2, u2 = null) : x2 = u2.sibling;
            var n3 = r2(e3, u2, h3[w2], k3);
            if (null === n3) {
              null === u2 && (u2 = x2);
              break;
            }
            a2 && u2 && null === n3.alternate && b2(e3, u2);
            g3 = f2(n3, g3, w2);
            null === m3 ? l3 = n3 : m3.sibling = n3;
            m3 = n3;
            u2 = x2;
          }
          if (w2 === h3.length) return c2(e3, u2), I2 && tg(e3, w2), l3;
          if (null === u2) {
            for (; w2 < h3.length; w2++) u2 = q2(e3, h3[w2], k3), null !== u2 && (g3 = f2(u2, g3, w2), null === m3 ? l3 = u2 : m3.sibling = u2, m3 = u2);
            I2 && tg(e3, w2);
            return l3;
          }
          for (u2 = d2(e3, u2); w2 < h3.length; w2++) x2 = y2(u2, e3, w2, h3[w2], k3), null !== x2 && (a2 && null !== x2.alternate && u2.delete(null === x2.key ? w2 : x2.key), g3 = f2(x2, g3, w2), null === m3 ? l3 = x2 : m3.sibling = x2, m3 = x2);
          a2 && u2.forEach(function(a3) {
            return b2(e3, a3);
          });
          I2 && tg(e3, w2);
          return l3;
        }
        function t2(e3, g3, h3, k3) {
          var l3 = Ka(h3);
          if ("function" !== typeof l3) throw Error(p2(150));
          h3 = l3.call(h3);
          if (null == h3) throw Error(p2(151));
          for (var u2 = l3 = null, m3 = g3, w2 = g3 = 0, x2 = null, n3 = h3.next(); null !== m3 && !n3.done; w2++, n3 = h3.next()) {
            m3.index > w2 ? (x2 = m3, m3 = null) : x2 = m3.sibling;
            var t3 = r2(e3, m3, n3.value, k3);
            if (null === t3) {
              null === m3 && (m3 = x2);
              break;
            }
            a2 && m3 && null === t3.alternate && b2(e3, m3);
            g3 = f2(t3, g3, w2);
            null === u2 ? l3 = t3 : u2.sibling = t3;
            u2 = t3;
            m3 = x2;
          }
          if (n3.done) return c2(
            e3,
            m3
          ), I2 && tg(e3, w2), l3;
          if (null === m3) {
            for (; !n3.done; w2++, n3 = h3.next()) n3 = q2(e3, n3.value, k3), null !== n3 && (g3 = f2(n3, g3, w2), null === u2 ? l3 = n3 : u2.sibling = n3, u2 = n3);
            I2 && tg(e3, w2);
            return l3;
          }
          for (m3 = d2(e3, m3); !n3.done; w2++, n3 = h3.next()) n3 = y2(m3, e3, w2, n3.value, k3), null !== n3 && (a2 && null !== n3.alternate && m3.delete(null === n3.key ? w2 : n3.key), g3 = f2(n3, g3, w2), null === u2 ? l3 = n3 : u2.sibling = n3, u2 = n3);
          a2 && m3.forEach(function(a3) {
            return b2(e3, a3);
          });
          I2 && tg(e3, w2);
          return l3;
        }
        function J2(a3, d3, f3, h3) {
          "object" === typeof f3 && null !== f3 && f3.type === ya && null === f3.key && (f3 = f3.props.children);
          if ("object" === typeof f3 && null !== f3) {
            switch (f3.$$typeof) {
              case va:
                a: {
                  for (var k3 = f3.key, l3 = d3; null !== l3; ) {
                    if (l3.key === k3) {
                      k3 = f3.type;
                      if (k3 === ya) {
                        if (7 === l3.tag) {
                          c2(a3, l3.sibling);
                          d3 = e2(l3, f3.props.children);
                          d3.return = a3;
                          a3 = d3;
                          break a;
                        }
                      } else if (l3.elementType === k3 || "object" === typeof k3 && null !== k3 && k3.$$typeof === Ha && Ng(k3) === l3.type) {
                        c2(a3, l3.sibling);
                        d3 = e2(l3, f3.props);
                        d3.ref = Lg(a3, l3, f3);
                        d3.return = a3;
                        a3 = d3;
                        break a;
                      }
                      c2(a3, l3);
                      break;
                    } else b2(a3, l3);
                    l3 = l3.sibling;
                  }
                  f3.type === ya ? (d3 = Tg(f3.props.children, a3.mode, h3, f3.key), d3.return = a3, a3 = d3) : (h3 = Rg(f3.type, f3.key, f3.props, null, a3.mode, h3), h3.ref = Lg(a3, d3, f3), h3.return = a3, a3 = h3);
                }
                return g2(a3);
              case wa:
                a: {
                  for (l3 = f3.key; null !== d3; ) {
                    if (d3.key === l3) if (4 === d3.tag && d3.stateNode.containerInfo === f3.containerInfo && d3.stateNode.implementation === f3.implementation) {
                      c2(a3, d3.sibling);
                      d3 = e2(d3, f3.children || []);
                      d3.return = a3;
                      a3 = d3;
                      break a;
                    } else {
                      c2(a3, d3);
                      break;
                    }
                    else b2(a3, d3);
                    d3 = d3.sibling;
                  }
                  d3 = Sg(f3, a3.mode, h3);
                  d3.return = a3;
                  a3 = d3;
                }
                return g2(a3);
              case Ha:
                return l3 = f3._init, J2(a3, d3, l3(f3._payload), h3);
            }
            if (eb(f3)) return n2(a3, d3, f3, h3);
            if (Ka(f3)) return t2(a3, d3, f3, h3);
            Mg(a3, f3);
          }
          return "string" === typeof f3 && "" !== f3 || "number" === typeof f3 ? (f3 = "" + f3, null !== d3 && 6 === d3.tag ? (c2(a3, d3.sibling), d3 = e2(d3, f3), d3.return = a3, a3 = d3) : (c2(a3, d3), d3 = Qg(f3, a3.mode, h3), d3.return = a3, a3 = d3), g2(a3)) : c2(a3, d3);
        }
        return J2;
      }
      var Ug = Og(true);
      var Vg = Og(false);
      var Wg = Uf(null);
      var Xg = null;
      var Yg = null;
      var Zg = null;
      function $g() {
        Zg = Yg = Xg = null;
      }
      function ah(a2) {
        var b2 = Wg.current;
        E2(Wg);
        a2._currentValue = b2;
      }
      function bh(a2, b2, c2) {
        for (; null !== a2; ) {
          var d2 = a2.alternate;
          (a2.childLanes & b2) !== b2 ? (a2.childLanes |= b2, null !== d2 && (d2.childLanes |= b2)) : null !== d2 && (d2.childLanes & b2) !== b2 && (d2.childLanes |= b2);
          if (a2 === c2) break;
          a2 = a2.return;
        }
      }
      function ch(a2, b2) {
        Xg = a2;
        Zg = Yg = null;
        a2 = a2.dependencies;
        null !== a2 && null !== a2.firstContext && (0 !== (a2.lanes & b2) && (dh = true), a2.firstContext = null);
      }
      function eh(a2) {
        var b2 = a2._currentValue;
        if (Zg !== a2) if (a2 = { context: a2, memoizedValue: b2, next: null }, null === Yg) {
          if (null === Xg) throw Error(p2(308));
          Yg = a2;
          Xg.dependencies = { lanes: 0, firstContext: a2 };
        } else Yg = Yg.next = a2;
        return b2;
      }
      var fh = null;
      function gh(a2) {
        null === fh ? fh = [a2] : fh.push(a2);
      }
      function hh(a2, b2, c2, d2) {
        var e2 = b2.interleaved;
        null === e2 ? (c2.next = c2, gh(b2)) : (c2.next = e2.next, e2.next = c2);
        b2.interleaved = c2;
        return ih(a2, d2);
      }
      function ih(a2, b2) {
        a2.lanes |= b2;
        var c2 = a2.alternate;
        null !== c2 && (c2.lanes |= b2);
        c2 = a2;
        for (a2 = a2.return; null !== a2; ) a2.childLanes |= b2, c2 = a2.alternate, null !== c2 && (c2.childLanes |= b2), c2 = a2, a2 = a2.return;
        return 3 === c2.tag ? c2.stateNode : null;
      }
      var jh = false;
      function kh(a2) {
        a2.updateQueue = { baseState: a2.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
      }
      function lh(a2, b2) {
        a2 = a2.updateQueue;
        b2.updateQueue === a2 && (b2.updateQueue = { baseState: a2.baseState, firstBaseUpdate: a2.firstBaseUpdate, lastBaseUpdate: a2.lastBaseUpdate, shared: a2.shared, effects: a2.effects });
      }
      function mh(a2, b2) {
        return { eventTime: a2, lane: b2, tag: 0, payload: null, callback: null, next: null };
      }
      function nh(a2, b2, c2) {
        var d2 = a2.updateQueue;
        if (null === d2) return null;
        d2 = d2.shared;
        if (0 !== (K2 & 2)) {
          var e2 = d2.pending;
          null === e2 ? b2.next = b2 : (b2.next = e2.next, e2.next = b2);
          d2.pending = b2;
          return ih(a2, c2);
        }
        e2 = d2.interleaved;
        null === e2 ? (b2.next = b2, gh(d2)) : (b2.next = e2.next, e2.next = b2);
        d2.interleaved = b2;
        return ih(a2, c2);
      }
      function oh(a2, b2, c2) {
        b2 = b2.updateQueue;
        if (null !== b2 && (b2 = b2.shared, 0 !== (c2 & 4194240))) {
          var d2 = b2.lanes;
          d2 &= a2.pendingLanes;
          c2 |= d2;
          b2.lanes = c2;
          Cc(a2, c2);
        }
      }
      function ph(a2, b2) {
        var c2 = a2.updateQueue, d2 = a2.alternate;
        if (null !== d2 && (d2 = d2.updateQueue, c2 === d2)) {
          var e2 = null, f2 = null;
          c2 = c2.firstBaseUpdate;
          if (null !== c2) {
            do {
              var g2 = { eventTime: c2.eventTime, lane: c2.lane, tag: c2.tag, payload: c2.payload, callback: c2.callback, next: null };
              null === f2 ? e2 = f2 = g2 : f2 = f2.next = g2;
              c2 = c2.next;
            } while (null !== c2);
            null === f2 ? e2 = f2 = b2 : f2 = f2.next = b2;
          } else e2 = f2 = b2;
          c2 = { baseState: d2.baseState, firstBaseUpdate: e2, lastBaseUpdate: f2, shared: d2.shared, effects: d2.effects };
          a2.updateQueue = c2;
          return;
        }
        a2 = c2.lastBaseUpdate;
        null === a2 ? c2.firstBaseUpdate = b2 : a2.next = b2;
        c2.lastBaseUpdate = b2;
      }
      function qh(a2, b2, c2, d2) {
        var e2 = a2.updateQueue;
        jh = false;
        var f2 = e2.firstBaseUpdate, g2 = e2.lastBaseUpdate, h2 = e2.shared.pending;
        if (null !== h2) {
          e2.shared.pending = null;
          var k2 = h2, l2 = k2.next;
          k2.next = null;
          null === g2 ? f2 = l2 : g2.next = l2;
          g2 = k2;
          var m2 = a2.alternate;
          null !== m2 && (m2 = m2.updateQueue, h2 = m2.lastBaseUpdate, h2 !== g2 && (null === h2 ? m2.firstBaseUpdate = l2 : h2.next = l2, m2.lastBaseUpdate = k2));
        }
        if (null !== f2) {
          var q2 = e2.baseState;
          g2 = 0;
          m2 = l2 = k2 = null;
          h2 = f2;
          do {
            var r2 = h2.lane, y2 = h2.eventTime;
            if ((d2 & r2) === r2) {
              null !== m2 && (m2 = m2.next = {
                eventTime: y2,
                lane: 0,
                tag: h2.tag,
                payload: h2.payload,
                callback: h2.callback,
                next: null
              });
              a: {
                var n2 = a2, t2 = h2;
                r2 = b2;
                y2 = c2;
                switch (t2.tag) {
                  case 1:
                    n2 = t2.payload;
                    if ("function" === typeof n2) {
                      q2 = n2.call(y2, q2, r2);
                      break a;
                    }
                    q2 = n2;
                    break a;
                  case 3:
                    n2.flags = n2.flags & -65537 | 128;
                  case 0:
                    n2 = t2.payload;
                    r2 = "function" === typeof n2 ? n2.call(y2, q2, r2) : n2;
                    if (null === r2 || void 0 === r2) break a;
                    q2 = A2({}, q2, r2);
                    break a;
                  case 2:
                    jh = true;
                }
              }
              null !== h2.callback && 0 !== h2.lane && (a2.flags |= 64, r2 = e2.effects, null === r2 ? e2.effects = [h2] : r2.push(h2));
            } else y2 = { eventTime: y2, lane: r2, tag: h2.tag, payload: h2.payload, callback: h2.callback, next: null }, null === m2 ? (l2 = m2 = y2, k2 = q2) : m2 = m2.next = y2, g2 |= r2;
            h2 = h2.next;
            if (null === h2) if (h2 = e2.shared.pending, null === h2) break;
            else r2 = h2, h2 = r2.next, r2.next = null, e2.lastBaseUpdate = r2, e2.shared.pending = null;
          } while (1);
          null === m2 && (k2 = q2);
          e2.baseState = k2;
          e2.firstBaseUpdate = l2;
          e2.lastBaseUpdate = m2;
          b2 = e2.shared.interleaved;
          if (null !== b2) {
            e2 = b2;
            do
              g2 |= e2.lane, e2 = e2.next;
            while (e2 !== b2);
          } else null === f2 && (e2.shared.lanes = 0);
          rh |= g2;
          a2.lanes = g2;
          a2.memoizedState = q2;
        }
      }
      function sh(a2, b2, c2) {
        a2 = b2.effects;
        b2.effects = null;
        if (null !== a2) for (b2 = 0; b2 < a2.length; b2++) {
          var d2 = a2[b2], e2 = d2.callback;
          if (null !== e2) {
            d2.callback = null;
            d2 = c2;
            if ("function" !== typeof e2) throw Error(p2(191, e2));
            e2.call(d2);
          }
        }
      }
      var th = {};
      var uh = Uf(th);
      var vh = Uf(th);
      var wh = Uf(th);
      function xh(a2) {
        if (a2 === th) throw Error(p2(174));
        return a2;
      }
      function yh(a2, b2) {
        G2(wh, b2);
        G2(vh, a2);
        G2(uh, th);
        a2 = b2.nodeType;
        switch (a2) {
          case 9:
          case 11:
            b2 = (b2 = b2.documentElement) ? b2.namespaceURI : lb(null, "");
            break;
          default:
            a2 = 8 === a2 ? b2.parentNode : b2, b2 = a2.namespaceURI || null, a2 = a2.tagName, b2 = lb(b2, a2);
        }
        E2(uh);
        G2(uh, b2);
      }
      function zh() {
        E2(uh);
        E2(vh);
        E2(wh);
      }
      function Ah(a2) {
        xh(wh.current);
        var b2 = xh(uh.current);
        var c2 = lb(b2, a2.type);
        b2 !== c2 && (G2(vh, a2), G2(uh, c2));
      }
      function Bh(a2) {
        vh.current === a2 && (E2(uh), E2(vh));
      }
      var L2 = Uf(0);
      function Ch(a2) {
        for (var b2 = a2; null !== b2; ) {
          if (13 === b2.tag) {
            var c2 = b2.memoizedState;
            if (null !== c2 && (c2 = c2.dehydrated, null === c2 || "$?" === c2.data || "$!" === c2.data)) return b2;
          } else if (19 === b2.tag && void 0 !== b2.memoizedProps.revealOrder) {
            if (0 !== (b2.flags & 128)) return b2;
          } else if (null !== b2.child) {
            b2.child.return = b2;
            b2 = b2.child;
            continue;
          }
          if (b2 === a2) break;
          for (; null === b2.sibling; ) {
            if (null === b2.return || b2.return === a2) return null;
            b2 = b2.return;
          }
          b2.sibling.return = b2.return;
          b2 = b2.sibling;
        }
        return null;
      }
      var Dh = [];
      function Eh() {
        for (var a2 = 0; a2 < Dh.length; a2++) Dh[a2]._workInProgressVersionPrimary = null;
        Dh.length = 0;
      }
      var Fh = ua.ReactCurrentDispatcher;
      var Gh = ua.ReactCurrentBatchConfig;
      var Hh = 0;
      var M2 = null;
      var N2 = null;
      var O2 = null;
      var Ih = false;
      var Jh = false;
      var Kh = 0;
      var Lh = 0;
      function P2() {
        throw Error(p2(321));
      }
      function Mh(a2, b2) {
        if (null === b2) return false;
        for (var c2 = 0; c2 < b2.length && c2 < a2.length; c2++) if (!He(a2[c2], b2[c2])) return false;
        return true;
      }
      function Nh(a2, b2, c2, d2, e2, f2) {
        Hh = f2;
        M2 = b2;
        b2.memoizedState = null;
        b2.updateQueue = null;
        b2.lanes = 0;
        Fh.current = null === a2 || null === a2.memoizedState ? Oh : Ph;
        a2 = c2(d2, e2);
        if (Jh) {
          f2 = 0;
          do {
            Jh = false;
            Kh = 0;
            if (25 <= f2) throw Error(p2(301));
            f2 += 1;
            O2 = N2 = null;
            b2.updateQueue = null;
            Fh.current = Qh;
            a2 = c2(d2, e2);
          } while (Jh);
        }
        Fh.current = Rh;
        b2 = null !== N2 && null !== N2.next;
        Hh = 0;
        O2 = N2 = M2 = null;
        Ih = false;
        if (b2) throw Error(p2(300));
        return a2;
      }
      function Sh() {
        var a2 = 0 !== Kh;
        Kh = 0;
        return a2;
      }
      function Th() {
        var a2 = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
        null === O2 ? M2.memoizedState = O2 = a2 : O2 = O2.next = a2;
        return O2;
      }
      function Uh() {
        if (null === N2) {
          var a2 = M2.alternate;
          a2 = null !== a2 ? a2.memoizedState : null;
        } else a2 = N2.next;
        var b2 = null === O2 ? M2.memoizedState : O2.next;
        if (null !== b2) O2 = b2, N2 = a2;
        else {
          if (null === a2) throw Error(p2(310));
          N2 = a2;
          a2 = { memoizedState: N2.memoizedState, baseState: N2.baseState, baseQueue: N2.baseQueue, queue: N2.queue, next: null };
          null === O2 ? M2.memoizedState = O2 = a2 : O2 = O2.next = a2;
        }
        return O2;
      }
      function Vh(a2, b2) {
        return "function" === typeof b2 ? b2(a2) : b2;
      }
      function Wh(a2) {
        var b2 = Uh(), c2 = b2.queue;
        if (null === c2) throw Error(p2(311));
        c2.lastRenderedReducer = a2;
        var d2 = N2, e2 = d2.baseQueue, f2 = c2.pending;
        if (null !== f2) {
          if (null !== e2) {
            var g2 = e2.next;
            e2.next = f2.next;
            f2.next = g2;
          }
          d2.baseQueue = e2 = f2;
          c2.pending = null;
        }
        if (null !== e2) {
          f2 = e2.next;
          d2 = d2.baseState;
          var h2 = g2 = null, k2 = null, l2 = f2;
          do {
            var m2 = l2.lane;
            if ((Hh & m2) === m2) null !== k2 && (k2 = k2.next = { lane: 0, action: l2.action, hasEagerState: l2.hasEagerState, eagerState: l2.eagerState, next: null }), d2 = l2.hasEagerState ? l2.eagerState : a2(d2, l2.action);
            else {
              var q2 = {
                lane: m2,
                action: l2.action,
                hasEagerState: l2.hasEagerState,
                eagerState: l2.eagerState,
                next: null
              };
              null === k2 ? (h2 = k2 = q2, g2 = d2) : k2 = k2.next = q2;
              M2.lanes |= m2;
              rh |= m2;
            }
            l2 = l2.next;
          } while (null !== l2 && l2 !== f2);
          null === k2 ? g2 = d2 : k2.next = h2;
          He(d2, b2.memoizedState) || (dh = true);
          b2.memoizedState = d2;
          b2.baseState = g2;
          b2.baseQueue = k2;
          c2.lastRenderedState = d2;
        }
        a2 = c2.interleaved;
        if (null !== a2) {
          e2 = a2;
          do
            f2 = e2.lane, M2.lanes |= f2, rh |= f2, e2 = e2.next;
          while (e2 !== a2);
        } else null === e2 && (c2.lanes = 0);
        return [b2.memoizedState, c2.dispatch];
      }
      function Xh(a2) {
        var b2 = Uh(), c2 = b2.queue;
        if (null === c2) throw Error(p2(311));
        c2.lastRenderedReducer = a2;
        var d2 = c2.dispatch, e2 = c2.pending, f2 = b2.memoizedState;
        if (null !== e2) {
          c2.pending = null;
          var g2 = e2 = e2.next;
          do
            f2 = a2(f2, g2.action), g2 = g2.next;
          while (g2 !== e2);
          He(f2, b2.memoizedState) || (dh = true);
          b2.memoizedState = f2;
          null === b2.baseQueue && (b2.baseState = f2);
          c2.lastRenderedState = f2;
        }
        return [f2, d2];
      }
      function Yh() {
      }
      function Zh(a2, b2) {
        var c2 = M2, d2 = Uh(), e2 = b2(), f2 = !He(d2.memoizedState, e2);
        f2 && (d2.memoizedState = e2, dh = true);
        d2 = d2.queue;
        $h(ai.bind(null, c2, d2, a2), [a2]);
        if (d2.getSnapshot !== b2 || f2 || null !== O2 && O2.memoizedState.tag & 1) {
          c2.flags |= 2048;
          bi(9, ci.bind(null, c2, d2, e2, b2), void 0, null);
          if (null === Q2) throw Error(p2(349));
          0 !== (Hh & 30) || di(c2, b2, e2);
        }
        return e2;
      }
      function di(a2, b2, c2) {
        a2.flags |= 16384;
        a2 = { getSnapshot: b2, value: c2 };
        b2 = M2.updateQueue;
        null === b2 ? (b2 = { lastEffect: null, stores: null }, M2.updateQueue = b2, b2.stores = [a2]) : (c2 = b2.stores, null === c2 ? b2.stores = [a2] : c2.push(a2));
      }
      function ci(a2, b2, c2, d2) {
        b2.value = c2;
        b2.getSnapshot = d2;
        ei(b2) && fi(a2);
      }
      function ai(a2, b2, c2) {
        return c2(function() {
          ei(b2) && fi(a2);
        });
      }
      function ei(a2) {
        var b2 = a2.getSnapshot;
        a2 = a2.value;
        try {
          var c2 = b2();
          return !He(a2, c2);
        } catch (d2) {
          return true;
        }
      }
      function fi(a2) {
        var b2 = ih(a2, 1);
        null !== b2 && gi(b2, a2, 1, -1);
      }
      function hi(a2) {
        var b2 = Th();
        "function" === typeof a2 && (a2 = a2());
        b2.memoizedState = b2.baseState = a2;
        a2 = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Vh, lastRenderedState: a2 };
        b2.queue = a2;
        a2 = a2.dispatch = ii.bind(null, M2, a2);
        return [b2.memoizedState, a2];
      }
      function bi(a2, b2, c2, d2) {
        a2 = { tag: a2, create: b2, destroy: c2, deps: d2, next: null };
        b2 = M2.updateQueue;
        null === b2 ? (b2 = { lastEffect: null, stores: null }, M2.updateQueue = b2, b2.lastEffect = a2.next = a2) : (c2 = b2.lastEffect, null === c2 ? b2.lastEffect = a2.next = a2 : (d2 = c2.next, c2.next = a2, a2.next = d2, b2.lastEffect = a2));
        return a2;
      }
      function ji() {
        return Uh().memoizedState;
      }
      function ki(a2, b2, c2, d2) {
        var e2 = Th();
        M2.flags |= a2;
        e2.memoizedState = bi(1 | b2, c2, void 0, void 0 === d2 ? null : d2);
      }
      function li(a2, b2, c2, d2) {
        var e2 = Uh();
        d2 = void 0 === d2 ? null : d2;
        var f2 = void 0;
        if (null !== N2) {
          var g2 = N2.memoizedState;
          f2 = g2.destroy;
          if (null !== d2 && Mh(d2, g2.deps)) {
            e2.memoizedState = bi(b2, c2, f2, d2);
            return;
          }
        }
        M2.flags |= a2;
        e2.memoizedState = bi(1 | b2, c2, f2, d2);
      }
      function mi(a2, b2) {
        return ki(8390656, 8, a2, b2);
      }
      function $h(a2, b2) {
        return li(2048, 8, a2, b2);
      }
      function ni(a2, b2) {
        return li(4, 2, a2, b2);
      }
      function oi(a2, b2) {
        return li(4, 4, a2, b2);
      }
      function pi(a2, b2) {
        if ("function" === typeof b2) return a2 = a2(), b2(a2), function() {
          b2(null);
        };
        if (null !== b2 && void 0 !== b2) return a2 = a2(), b2.current = a2, function() {
          b2.current = null;
        };
      }
      function qi(a2, b2, c2) {
        c2 = null !== c2 && void 0 !== c2 ? c2.concat([a2]) : null;
        return li(4, 4, pi.bind(null, b2, a2), c2);
      }
      function ri() {
      }
      function si(a2, b2) {
        var c2 = Uh();
        b2 = void 0 === b2 ? null : b2;
        var d2 = c2.memoizedState;
        if (null !== d2 && null !== b2 && Mh(b2, d2[1])) return d2[0];
        c2.memoizedState = [a2, b2];
        return a2;
      }
      function ti(a2, b2) {
        var c2 = Uh();
        b2 = void 0 === b2 ? null : b2;
        var d2 = c2.memoizedState;
        if (null !== d2 && null !== b2 && Mh(b2, d2[1])) return d2[0];
        a2 = a2();
        c2.memoizedState = [a2, b2];
        return a2;
      }
      function ui(a2, b2, c2) {
        if (0 === (Hh & 21)) return a2.baseState && (a2.baseState = false, dh = true), a2.memoizedState = c2;
        He(c2, b2) || (c2 = yc(), M2.lanes |= c2, rh |= c2, a2.baseState = true);
        return b2;
      }
      function vi(a2, b2) {
        var c2 = C2;
        C2 = 0 !== c2 && 4 > c2 ? c2 : 4;
        a2(true);
        var d2 = Gh.transition;
        Gh.transition = {};
        try {
          a2(false), b2();
        } finally {
          C2 = c2, Gh.transition = d2;
        }
      }
      function wi() {
        return Uh().memoizedState;
      }
      function xi(a2, b2, c2) {
        var d2 = yi(a2);
        c2 = { lane: d2, action: c2, hasEagerState: false, eagerState: null, next: null };
        if (zi(a2)) Ai(b2, c2);
        else if (c2 = hh(a2, b2, c2, d2), null !== c2) {
          var e2 = R2();
          gi(c2, a2, d2, e2);
          Bi(c2, b2, d2);
        }
      }
      function ii(a2, b2, c2) {
        var d2 = yi(a2), e2 = { lane: d2, action: c2, hasEagerState: false, eagerState: null, next: null };
        if (zi(a2)) Ai(b2, e2);
        else {
          var f2 = a2.alternate;
          if (0 === a2.lanes && (null === f2 || 0 === f2.lanes) && (f2 = b2.lastRenderedReducer, null !== f2)) try {
            var g2 = b2.lastRenderedState, h2 = f2(g2, c2);
            e2.hasEagerState = true;
            e2.eagerState = h2;
            if (He(h2, g2)) {
              var k2 = b2.interleaved;
              null === k2 ? (e2.next = e2, gh(b2)) : (e2.next = k2.next, k2.next = e2);
              b2.interleaved = e2;
              return;
            }
          } catch (l2) {
          } finally {
          }
          c2 = hh(a2, b2, e2, d2);
          null !== c2 && (e2 = R2(), gi(c2, a2, d2, e2), Bi(c2, b2, d2));
        }
      }
      function zi(a2) {
        var b2 = a2.alternate;
        return a2 === M2 || null !== b2 && b2 === M2;
      }
      function Ai(a2, b2) {
        Jh = Ih = true;
        var c2 = a2.pending;
        null === c2 ? b2.next = b2 : (b2.next = c2.next, c2.next = b2);
        a2.pending = b2;
      }
      function Bi(a2, b2, c2) {
        if (0 !== (c2 & 4194240)) {
          var d2 = b2.lanes;
          d2 &= a2.pendingLanes;
          c2 |= d2;
          b2.lanes = c2;
          Cc(a2, c2);
        }
      }
      var Rh = { readContext: eh, useCallback: P2, useContext: P2, useEffect: P2, useImperativeHandle: P2, useInsertionEffect: P2, useLayoutEffect: P2, useMemo: P2, useReducer: P2, useRef: P2, useState: P2, useDebugValue: P2, useDeferredValue: P2, useTransition: P2, useMutableSource: P2, useSyncExternalStore: P2, useId: P2, unstable_isNewReconciler: false };
      var Oh = { readContext: eh, useCallback: function(a2, b2) {
        Th().memoizedState = [a2, void 0 === b2 ? null : b2];
        return a2;
      }, useContext: eh, useEffect: mi, useImperativeHandle: function(a2, b2, c2) {
        c2 = null !== c2 && void 0 !== c2 ? c2.concat([a2]) : null;
        return ki(
          4194308,
          4,
          pi.bind(null, b2, a2),
          c2
        );
      }, useLayoutEffect: function(a2, b2) {
        return ki(4194308, 4, a2, b2);
      }, useInsertionEffect: function(a2, b2) {
        return ki(4, 2, a2, b2);
      }, useMemo: function(a2, b2) {
        var c2 = Th();
        b2 = void 0 === b2 ? null : b2;
        a2 = a2();
        c2.memoizedState = [a2, b2];
        return a2;
      }, useReducer: function(a2, b2, c2) {
        var d2 = Th();
        b2 = void 0 !== c2 ? c2(b2) : b2;
        d2.memoizedState = d2.baseState = b2;
        a2 = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: a2, lastRenderedState: b2 };
        d2.queue = a2;
        a2 = a2.dispatch = xi.bind(null, M2, a2);
        return [d2.memoizedState, a2];
      }, useRef: function(a2) {
        var b2 = Th();
        a2 = { current: a2 };
        return b2.memoizedState = a2;
      }, useState: hi, useDebugValue: ri, useDeferredValue: function(a2) {
        return Th().memoizedState = a2;
      }, useTransition: function() {
        var a2 = hi(false), b2 = a2[0];
        a2 = vi.bind(null, a2[1]);
        Th().memoizedState = a2;
        return [b2, a2];
      }, useMutableSource: function() {
      }, useSyncExternalStore: function(a2, b2, c2) {
        var d2 = M2, e2 = Th();
        if (I2) {
          if (void 0 === c2) throw Error(p2(407));
          c2 = c2();
        } else {
          c2 = b2();
          if (null === Q2) throw Error(p2(349));
          0 !== (Hh & 30) || di(d2, b2, c2);
        }
        e2.memoizedState = c2;
        var f2 = { value: c2, getSnapshot: b2 };
        e2.queue = f2;
        mi(ai.bind(
          null,
          d2,
          f2,
          a2
        ), [a2]);
        d2.flags |= 2048;
        bi(9, ci.bind(null, d2, f2, c2, b2), void 0, null);
        return c2;
      }, useId: function() {
        var a2 = Th(), b2 = Q2.identifierPrefix;
        if (I2) {
          var c2 = sg;
          var d2 = rg;
          c2 = (d2 & ~(1 << 32 - oc(d2) - 1)).toString(32) + c2;
          b2 = ":" + b2 + "R" + c2;
          c2 = Kh++;
          0 < c2 && (b2 += "H" + c2.toString(32));
          b2 += ":";
        } else c2 = Lh++, b2 = ":" + b2 + "r" + c2.toString(32) + ":";
        return a2.memoizedState = b2;
      }, unstable_isNewReconciler: false };
      var Ph = {
        readContext: eh,
        useCallback: si,
        useContext: eh,
        useEffect: $h,
        useImperativeHandle: qi,
        useInsertionEffect: ni,
        useLayoutEffect: oi,
        useMemo: ti,
        useReducer: Wh,
        useRef: ji,
        useState: function() {
          return Wh(Vh);
        },
        useDebugValue: ri,
        useDeferredValue: function(a2) {
          var b2 = Uh();
          return ui(b2, N2.memoizedState, a2);
        },
        useTransition: function() {
          var a2 = Wh(Vh)[0], b2 = Uh().memoizedState;
          return [a2, b2];
        },
        useMutableSource: Yh,
        useSyncExternalStore: Zh,
        useId: wi,
        unstable_isNewReconciler: false
      };
      var Qh = { readContext: eh, useCallback: si, useContext: eh, useEffect: $h, useImperativeHandle: qi, useInsertionEffect: ni, useLayoutEffect: oi, useMemo: ti, useReducer: Xh, useRef: ji, useState: function() {
        return Xh(Vh);
      }, useDebugValue: ri, useDeferredValue: function(a2) {
        var b2 = Uh();
        return null === N2 ? b2.memoizedState = a2 : ui(b2, N2.memoizedState, a2);
      }, useTransition: function() {
        var a2 = Xh(Vh)[0], b2 = Uh().memoizedState;
        return [a2, b2];
      }, useMutableSource: Yh, useSyncExternalStore: Zh, useId: wi, unstable_isNewReconciler: false };
      function Ci(a2, b2) {
        if (a2 && a2.defaultProps) {
          b2 = A2({}, b2);
          a2 = a2.defaultProps;
          for (var c2 in a2) void 0 === b2[c2] && (b2[c2] = a2[c2]);
          return b2;
        }
        return b2;
      }
      function Di(a2, b2, c2, d2) {
        b2 = a2.memoizedState;
        c2 = c2(d2, b2);
        c2 = null === c2 || void 0 === c2 ? b2 : A2({}, b2, c2);
        a2.memoizedState = c2;
        0 === a2.lanes && (a2.updateQueue.baseState = c2);
      }
      var Ei = { isMounted: function(a2) {
        return (a2 = a2._reactInternals) ? Vb(a2) === a2 : false;
      }, enqueueSetState: function(a2, b2, c2) {
        a2 = a2._reactInternals;
        var d2 = R2(), e2 = yi(a2), f2 = mh(d2, e2);
        f2.payload = b2;
        void 0 !== c2 && null !== c2 && (f2.callback = c2);
        b2 = nh(a2, f2, e2);
        null !== b2 && (gi(b2, a2, e2, d2), oh(b2, a2, e2));
      }, enqueueReplaceState: function(a2, b2, c2) {
        a2 = a2._reactInternals;
        var d2 = R2(), e2 = yi(a2), f2 = mh(d2, e2);
        f2.tag = 1;
        f2.payload = b2;
        void 0 !== c2 && null !== c2 && (f2.callback = c2);
        b2 = nh(a2, f2, e2);
        null !== b2 && (gi(b2, a2, e2, d2), oh(b2, a2, e2));
      }, enqueueForceUpdate: function(a2, b2) {
        a2 = a2._reactInternals;
        var c2 = R2(), d2 = yi(a2), e2 = mh(c2, d2);
        e2.tag = 2;
        void 0 !== b2 && null !== b2 && (e2.callback = b2);
        b2 = nh(a2, e2, d2);
        null !== b2 && (gi(b2, a2, d2, c2), oh(b2, a2, d2));
      } };
      function Fi(a2, b2, c2, d2, e2, f2, g2) {
        a2 = a2.stateNode;
        return "function" === typeof a2.shouldComponentUpdate ? a2.shouldComponentUpdate(d2, f2, g2) : b2.prototype && b2.prototype.isPureReactComponent ? !Ie(c2, d2) || !Ie(e2, f2) : true;
      }
      function Gi(a2, b2, c2) {
        var d2 = false, e2 = Vf;
        var f2 = b2.contextType;
        "object" === typeof f2 && null !== f2 ? f2 = eh(f2) : (e2 = Zf(b2) ? Xf : H3.current, d2 = b2.contextTypes, f2 = (d2 = null !== d2 && void 0 !== d2) ? Yf(a2, e2) : Vf);
        b2 = new b2(c2, f2);
        a2.memoizedState = null !== b2.state && void 0 !== b2.state ? b2.state : null;
        b2.updater = Ei;
        a2.stateNode = b2;
        b2._reactInternals = a2;
        d2 && (a2 = a2.stateNode, a2.__reactInternalMemoizedUnmaskedChildContext = e2, a2.__reactInternalMemoizedMaskedChildContext = f2);
        return b2;
      }
      function Hi(a2, b2, c2, d2) {
        a2 = b2.state;
        "function" === typeof b2.componentWillReceiveProps && b2.componentWillReceiveProps(c2, d2);
        "function" === typeof b2.UNSAFE_componentWillReceiveProps && b2.UNSAFE_componentWillReceiveProps(c2, d2);
        b2.state !== a2 && Ei.enqueueReplaceState(b2, b2.state, null);
      }
      function Ii(a2, b2, c2, d2) {
        var e2 = a2.stateNode;
        e2.props = c2;
        e2.state = a2.memoizedState;
        e2.refs = {};
        kh(a2);
        var f2 = b2.contextType;
        "object" === typeof f2 && null !== f2 ? e2.context = eh(f2) : (f2 = Zf(b2) ? Xf : H3.current, e2.context = Yf(a2, f2));
        e2.state = a2.memoizedState;
        f2 = b2.getDerivedStateFromProps;
        "function" === typeof f2 && (Di(a2, b2, f2, c2), e2.state = a2.memoizedState);
        "function" === typeof b2.getDerivedStateFromProps || "function" === typeof e2.getSnapshotBeforeUpdate || "function" !== typeof e2.UNSAFE_componentWillMount && "function" !== typeof e2.componentWillMount || (b2 = e2.state, "function" === typeof e2.componentWillMount && e2.componentWillMount(), "function" === typeof e2.UNSAFE_componentWillMount && e2.UNSAFE_componentWillMount(), b2 !== e2.state && Ei.enqueueReplaceState(e2, e2.state, null), qh(a2, c2, e2, d2), e2.state = a2.memoizedState);
        "function" === typeof e2.componentDidMount && (a2.flags |= 4194308);
      }
      function Ji(a2, b2) {
        try {
          var c2 = "", d2 = b2;
          do
            c2 += Pa(d2), d2 = d2.return;
          while (d2);
          var e2 = c2;
        } catch (f2) {
          e2 = "\nError generating stack: " + f2.message + "\n" + f2.stack;
        }
        return { value: a2, source: b2, stack: e2, digest: null };
      }
      function Ki(a2, b2, c2) {
        return { value: a2, source: null, stack: null != c2 ? c2 : null, digest: null != b2 ? b2 : null };
      }
      function Li(a2, b2) {
        try {
          console.error(b2.value);
        } catch (c2) {
          setTimeout(function() {
            throw c2;
          });
        }
      }
      var Mi = "function" === typeof WeakMap ? WeakMap : Map;
      function Ni(a2, b2, c2) {
        c2 = mh(-1, c2);
        c2.tag = 3;
        c2.payload = { element: null };
        var d2 = b2.value;
        c2.callback = function() {
          Oi || (Oi = true, Pi = d2);
          Li(a2, b2);
        };
        return c2;
      }
      function Qi(a2, b2, c2) {
        c2 = mh(-1, c2);
        c2.tag = 3;
        var d2 = a2.type.getDerivedStateFromError;
        if ("function" === typeof d2) {
          var e2 = b2.value;
          c2.payload = function() {
            return d2(e2);
          };
          c2.callback = function() {
            Li(a2, b2);
          };
        }
        var f2 = a2.stateNode;
        null !== f2 && "function" === typeof f2.componentDidCatch && (c2.callback = function() {
          Li(a2, b2);
          "function" !== typeof d2 && (null === Ri ? Ri = /* @__PURE__ */ new Set([this]) : Ri.add(this));
          var c3 = b2.stack;
          this.componentDidCatch(b2.value, { componentStack: null !== c3 ? c3 : "" });
        });
        return c2;
      }
      function Si(a2, b2, c2) {
        var d2 = a2.pingCache;
        if (null === d2) {
          d2 = a2.pingCache = new Mi();
          var e2 = /* @__PURE__ */ new Set();
          d2.set(b2, e2);
        } else e2 = d2.get(b2), void 0 === e2 && (e2 = /* @__PURE__ */ new Set(), d2.set(b2, e2));
        e2.has(c2) || (e2.add(c2), a2 = Ti.bind(null, a2, b2, c2), b2.then(a2, a2));
      }
      function Ui(a2) {
        do {
          var b2;
          if (b2 = 13 === a2.tag) b2 = a2.memoizedState, b2 = null !== b2 ? null !== b2.dehydrated ? true : false : true;
          if (b2) return a2;
          a2 = a2.return;
        } while (null !== a2);
        return null;
      }
      function Vi(a2, b2, c2, d2, e2) {
        if (0 === (a2.mode & 1)) return a2 === b2 ? a2.flags |= 65536 : (a2.flags |= 128, c2.flags |= 131072, c2.flags &= -52805, 1 === c2.tag && (null === c2.alternate ? c2.tag = 17 : (b2 = mh(-1, 1), b2.tag = 2, nh(c2, b2, 1))), c2.lanes |= 1), a2;
        a2.flags |= 65536;
        a2.lanes = e2;
        return a2;
      }
      var Wi = ua.ReactCurrentOwner;
      var dh = false;
      function Xi(a2, b2, c2, d2) {
        b2.child = null === a2 ? Vg(b2, null, c2, d2) : Ug(b2, a2.child, c2, d2);
      }
      function Yi(a2, b2, c2, d2, e2) {
        c2 = c2.render;
        var f2 = b2.ref;
        ch(b2, e2);
        d2 = Nh(a2, b2, c2, d2, f2, e2);
        c2 = Sh();
        if (null !== a2 && !dh) return b2.updateQueue = a2.updateQueue, b2.flags &= -2053, a2.lanes &= ~e2, Zi(a2, b2, e2);
        I2 && c2 && vg(b2);
        b2.flags |= 1;
        Xi(a2, b2, d2, e2);
        return b2.child;
      }
      function $i(a2, b2, c2, d2, e2) {
        if (null === a2) {
          var f2 = c2.type;
          if ("function" === typeof f2 && !aj(f2) && void 0 === f2.defaultProps && null === c2.compare && void 0 === c2.defaultProps) return b2.tag = 15, b2.type = f2, bj(a2, b2, f2, d2, e2);
          a2 = Rg(c2.type, null, d2, b2, b2.mode, e2);
          a2.ref = b2.ref;
          a2.return = b2;
          return b2.child = a2;
        }
        f2 = a2.child;
        if (0 === (a2.lanes & e2)) {
          var g2 = f2.memoizedProps;
          c2 = c2.compare;
          c2 = null !== c2 ? c2 : Ie;
          if (c2(g2, d2) && a2.ref === b2.ref) return Zi(a2, b2, e2);
        }
        b2.flags |= 1;
        a2 = Pg(f2, d2);
        a2.ref = b2.ref;
        a2.return = b2;
        return b2.child = a2;
      }
      function bj(a2, b2, c2, d2, e2) {
        if (null !== a2) {
          var f2 = a2.memoizedProps;
          if (Ie(f2, d2) && a2.ref === b2.ref) if (dh = false, b2.pendingProps = d2 = f2, 0 !== (a2.lanes & e2)) 0 !== (a2.flags & 131072) && (dh = true);
          else return b2.lanes = a2.lanes, Zi(a2, b2, e2);
        }
        return cj(a2, b2, c2, d2, e2);
      }
      function dj(a2, b2, c2) {
        var d2 = b2.pendingProps, e2 = d2.children, f2 = null !== a2 ? a2.memoizedState : null;
        if ("hidden" === d2.mode) if (0 === (b2.mode & 1)) b2.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, G2(ej, fj), fj |= c2;
        else {
          if (0 === (c2 & 1073741824)) return a2 = null !== f2 ? f2.baseLanes | c2 : c2, b2.lanes = b2.childLanes = 1073741824, b2.memoizedState = { baseLanes: a2, cachePool: null, transitions: null }, b2.updateQueue = null, G2(ej, fj), fj |= a2, null;
          b2.memoizedState = { baseLanes: 0, cachePool: null, transitions: null };
          d2 = null !== f2 ? f2.baseLanes : c2;
          G2(ej, fj);
          fj |= d2;
        }
        else null !== f2 ? (d2 = f2.baseLanes | c2, b2.memoizedState = null) : d2 = c2, G2(ej, fj), fj |= d2;
        Xi(a2, b2, e2, c2);
        return b2.child;
      }
      function gj(a2, b2) {
        var c2 = b2.ref;
        if (null === a2 && null !== c2 || null !== a2 && a2.ref !== c2) b2.flags |= 512, b2.flags |= 2097152;
      }
      function cj(a2, b2, c2, d2, e2) {
        var f2 = Zf(c2) ? Xf : H3.current;
        f2 = Yf(b2, f2);
        ch(b2, e2);
        c2 = Nh(a2, b2, c2, d2, f2, e2);
        d2 = Sh();
        if (null !== a2 && !dh) return b2.updateQueue = a2.updateQueue, b2.flags &= -2053, a2.lanes &= ~e2, Zi(a2, b2, e2);
        I2 && d2 && vg(b2);
        b2.flags |= 1;
        Xi(a2, b2, c2, e2);
        return b2.child;
      }
      function hj(a2, b2, c2, d2, e2) {
        if (Zf(c2)) {
          var f2 = true;
          cg(b2);
        } else f2 = false;
        ch(b2, e2);
        if (null === b2.stateNode) ij(a2, b2), Gi(b2, c2, d2), Ii(b2, c2, d2, e2), d2 = true;
        else if (null === a2) {
          var g2 = b2.stateNode, h2 = b2.memoizedProps;
          g2.props = h2;
          var k2 = g2.context, l2 = c2.contextType;
          "object" === typeof l2 && null !== l2 ? l2 = eh(l2) : (l2 = Zf(c2) ? Xf : H3.current, l2 = Yf(b2, l2));
          var m2 = c2.getDerivedStateFromProps, q2 = "function" === typeof m2 || "function" === typeof g2.getSnapshotBeforeUpdate;
          q2 || "function" !== typeof g2.UNSAFE_componentWillReceiveProps && "function" !== typeof g2.componentWillReceiveProps || (h2 !== d2 || k2 !== l2) && Hi(b2, g2, d2, l2);
          jh = false;
          var r2 = b2.memoizedState;
          g2.state = r2;
          qh(b2, d2, g2, e2);
          k2 = b2.memoizedState;
          h2 !== d2 || r2 !== k2 || Wf.current || jh ? ("function" === typeof m2 && (Di(b2, c2, m2, d2), k2 = b2.memoizedState), (h2 = jh || Fi(b2, c2, h2, d2, r2, k2, l2)) ? (q2 || "function" !== typeof g2.UNSAFE_componentWillMount && "function" !== typeof g2.componentWillMount || ("function" === typeof g2.componentWillMount && g2.componentWillMount(), "function" === typeof g2.UNSAFE_componentWillMount && g2.UNSAFE_componentWillMount()), "function" === typeof g2.componentDidMount && (b2.flags |= 4194308)) : ("function" === typeof g2.componentDidMount && (b2.flags |= 4194308), b2.memoizedProps = d2, b2.memoizedState = k2), g2.props = d2, g2.state = k2, g2.context = l2, d2 = h2) : ("function" === typeof g2.componentDidMount && (b2.flags |= 4194308), d2 = false);
        } else {
          g2 = b2.stateNode;
          lh(a2, b2);
          h2 = b2.memoizedProps;
          l2 = b2.type === b2.elementType ? h2 : Ci(b2.type, h2);
          g2.props = l2;
          q2 = b2.pendingProps;
          r2 = g2.context;
          k2 = c2.contextType;
          "object" === typeof k2 && null !== k2 ? k2 = eh(k2) : (k2 = Zf(c2) ? Xf : H3.current, k2 = Yf(b2, k2));
          var y2 = c2.getDerivedStateFromProps;
          (m2 = "function" === typeof y2 || "function" === typeof g2.getSnapshotBeforeUpdate) || "function" !== typeof g2.UNSAFE_componentWillReceiveProps && "function" !== typeof g2.componentWillReceiveProps || (h2 !== q2 || r2 !== k2) && Hi(b2, g2, d2, k2);
          jh = false;
          r2 = b2.memoizedState;
          g2.state = r2;
          qh(b2, d2, g2, e2);
          var n2 = b2.memoizedState;
          h2 !== q2 || r2 !== n2 || Wf.current || jh ? ("function" === typeof y2 && (Di(b2, c2, y2, d2), n2 = b2.memoizedState), (l2 = jh || Fi(b2, c2, l2, d2, r2, n2, k2) || false) ? (m2 || "function" !== typeof g2.UNSAFE_componentWillUpdate && "function" !== typeof g2.componentWillUpdate || ("function" === typeof g2.componentWillUpdate && g2.componentWillUpdate(d2, n2, k2), "function" === typeof g2.UNSAFE_componentWillUpdate && g2.UNSAFE_componentWillUpdate(d2, n2, k2)), "function" === typeof g2.componentDidUpdate && (b2.flags |= 4), "function" === typeof g2.getSnapshotBeforeUpdate && (b2.flags |= 1024)) : ("function" !== typeof g2.componentDidUpdate || h2 === a2.memoizedProps && r2 === a2.memoizedState || (b2.flags |= 4), "function" !== typeof g2.getSnapshotBeforeUpdate || h2 === a2.memoizedProps && r2 === a2.memoizedState || (b2.flags |= 1024), b2.memoizedProps = d2, b2.memoizedState = n2), g2.props = d2, g2.state = n2, g2.context = k2, d2 = l2) : ("function" !== typeof g2.componentDidUpdate || h2 === a2.memoizedProps && r2 === a2.memoizedState || (b2.flags |= 4), "function" !== typeof g2.getSnapshotBeforeUpdate || h2 === a2.memoizedProps && r2 === a2.memoizedState || (b2.flags |= 1024), d2 = false);
        }
        return jj(a2, b2, c2, d2, f2, e2);
      }
      function jj(a2, b2, c2, d2, e2, f2) {
        gj(a2, b2);
        var g2 = 0 !== (b2.flags & 128);
        if (!d2 && !g2) return e2 && dg(b2, c2, false), Zi(a2, b2, f2);
        d2 = b2.stateNode;
        Wi.current = b2;
        var h2 = g2 && "function" !== typeof c2.getDerivedStateFromError ? null : d2.render();
        b2.flags |= 1;
        null !== a2 && g2 ? (b2.child = Ug(b2, a2.child, null, f2), b2.child = Ug(b2, null, h2, f2)) : Xi(a2, b2, h2, f2);
        b2.memoizedState = d2.state;
        e2 && dg(b2, c2, true);
        return b2.child;
      }
      function kj(a2) {
        var b2 = a2.stateNode;
        b2.pendingContext ? ag(a2, b2.pendingContext, b2.pendingContext !== b2.context) : b2.context && ag(a2, b2.context, false);
        yh(a2, b2.containerInfo);
      }
      function lj(a2, b2, c2, d2, e2) {
        Ig();
        Jg(e2);
        b2.flags |= 256;
        Xi(a2, b2, c2, d2);
        return b2.child;
      }
      var mj = { dehydrated: null, treeContext: null, retryLane: 0 };
      function nj(a2) {
        return { baseLanes: a2, cachePool: null, transitions: null };
      }
      function oj(a2, b2, c2) {
        var d2 = b2.pendingProps, e2 = L2.current, f2 = false, g2 = 0 !== (b2.flags & 128), h2;
        (h2 = g2) || (h2 = null !== a2 && null === a2.memoizedState ? false : 0 !== (e2 & 2));
        if (h2) f2 = true, b2.flags &= -129;
        else if (null === a2 || null !== a2.memoizedState) e2 |= 1;
        G2(L2, e2 & 1);
        if (null === a2) {
          Eg(b2);
          a2 = b2.memoizedState;
          if (null !== a2 && (a2 = a2.dehydrated, null !== a2)) return 0 === (b2.mode & 1) ? b2.lanes = 1 : "$!" === a2.data ? b2.lanes = 8 : b2.lanes = 1073741824, null;
          g2 = d2.children;
          a2 = d2.fallback;
          return f2 ? (d2 = b2.mode, f2 = b2.child, g2 = { mode: "hidden", children: g2 }, 0 === (d2 & 1) && null !== f2 ? (f2.childLanes = 0, f2.pendingProps = g2) : f2 = pj(g2, d2, 0, null), a2 = Tg(a2, d2, c2, null), f2.return = b2, a2.return = b2, f2.sibling = a2, b2.child = f2, b2.child.memoizedState = nj(c2), b2.memoizedState = mj, a2) : qj(b2, g2);
        }
        e2 = a2.memoizedState;
        if (null !== e2 && (h2 = e2.dehydrated, null !== h2)) return rj(a2, b2, g2, d2, h2, e2, c2);
        if (f2) {
          f2 = d2.fallback;
          g2 = b2.mode;
          e2 = a2.child;
          h2 = e2.sibling;
          var k2 = { mode: "hidden", children: d2.children };
          0 === (g2 & 1) && b2.child !== e2 ? (d2 = b2.child, d2.childLanes = 0, d2.pendingProps = k2, b2.deletions = null) : (d2 = Pg(e2, k2), d2.subtreeFlags = e2.subtreeFlags & 14680064);
          null !== h2 ? f2 = Pg(h2, f2) : (f2 = Tg(f2, g2, c2, null), f2.flags |= 2);
          f2.return = b2;
          d2.return = b2;
          d2.sibling = f2;
          b2.child = d2;
          d2 = f2;
          f2 = b2.child;
          g2 = a2.child.memoizedState;
          g2 = null === g2 ? nj(c2) : { baseLanes: g2.baseLanes | c2, cachePool: null, transitions: g2.transitions };
          f2.memoizedState = g2;
          f2.childLanes = a2.childLanes & ~c2;
          b2.memoizedState = mj;
          return d2;
        }
        f2 = a2.child;
        a2 = f2.sibling;
        d2 = Pg(f2, { mode: "visible", children: d2.children });
        0 === (b2.mode & 1) && (d2.lanes = c2);
        d2.return = b2;
        d2.sibling = null;
        null !== a2 && (c2 = b2.deletions, null === c2 ? (b2.deletions = [a2], b2.flags |= 16) : c2.push(a2));
        b2.child = d2;
        b2.memoizedState = null;
        return d2;
      }
      function qj(a2, b2) {
        b2 = pj({ mode: "visible", children: b2 }, a2.mode, 0, null);
        b2.return = a2;
        return a2.child = b2;
      }
      function sj(a2, b2, c2, d2) {
        null !== d2 && Jg(d2);
        Ug(b2, a2.child, null, c2);
        a2 = qj(b2, b2.pendingProps.children);
        a2.flags |= 2;
        b2.memoizedState = null;
        return a2;
      }
      function rj(a2, b2, c2, d2, e2, f2, g2) {
        if (c2) {
          if (b2.flags & 256) return b2.flags &= -257, d2 = Ki(Error(p2(422))), sj(a2, b2, g2, d2);
          if (null !== b2.memoizedState) return b2.child = a2.child, b2.flags |= 128, null;
          f2 = d2.fallback;
          e2 = b2.mode;
          d2 = pj({ mode: "visible", children: d2.children }, e2, 0, null);
          f2 = Tg(f2, e2, g2, null);
          f2.flags |= 2;
          d2.return = b2;
          f2.return = b2;
          d2.sibling = f2;
          b2.child = d2;
          0 !== (b2.mode & 1) && Ug(b2, a2.child, null, g2);
          b2.child.memoizedState = nj(g2);
          b2.memoizedState = mj;
          return f2;
        }
        if (0 === (b2.mode & 1)) return sj(a2, b2, g2, null);
        if ("$!" === e2.data) {
          d2 = e2.nextSibling && e2.nextSibling.dataset;
          if (d2) var h2 = d2.dgst;
          d2 = h2;
          f2 = Error(p2(419));
          d2 = Ki(f2, d2, void 0);
          return sj(a2, b2, g2, d2);
        }
        h2 = 0 !== (g2 & a2.childLanes);
        if (dh || h2) {
          d2 = Q2;
          if (null !== d2) {
            switch (g2 & -g2) {
              case 4:
                e2 = 2;
                break;
              case 16:
                e2 = 8;
                break;
              case 64:
              case 128:
              case 256:
              case 512:
              case 1024:
              case 2048:
              case 4096:
              case 8192:
              case 16384:
              case 32768:
              case 65536:
              case 131072:
              case 262144:
              case 524288:
              case 1048576:
              case 2097152:
              case 4194304:
              case 8388608:
              case 16777216:
              case 33554432:
              case 67108864:
                e2 = 32;
                break;
              case 536870912:
                e2 = 268435456;
                break;
              default:
                e2 = 0;
            }
            e2 = 0 !== (e2 & (d2.suspendedLanes | g2)) ? 0 : e2;
            0 !== e2 && e2 !== f2.retryLane && (f2.retryLane = e2, ih(a2, e2), gi(d2, a2, e2, -1));
          }
          tj();
          d2 = Ki(Error(p2(421)));
          return sj(a2, b2, g2, d2);
        }
        if ("$?" === e2.data) return b2.flags |= 128, b2.child = a2.child, b2 = uj.bind(null, a2), e2._reactRetry = b2, null;
        a2 = f2.treeContext;
        yg = Lf(e2.nextSibling);
        xg = b2;
        I2 = true;
        zg = null;
        null !== a2 && (og[pg++] = rg, og[pg++] = sg, og[pg++] = qg, rg = a2.id, sg = a2.overflow, qg = b2);
        b2 = qj(b2, d2.children);
        b2.flags |= 4096;
        return b2;
      }
      function vj(a2, b2, c2) {
        a2.lanes |= b2;
        var d2 = a2.alternate;
        null !== d2 && (d2.lanes |= b2);
        bh(a2.return, b2, c2);
      }
      function wj(a2, b2, c2, d2, e2) {
        var f2 = a2.memoizedState;
        null === f2 ? a2.memoizedState = { isBackwards: b2, rendering: null, renderingStartTime: 0, last: d2, tail: c2, tailMode: e2 } : (f2.isBackwards = b2, f2.rendering = null, f2.renderingStartTime = 0, f2.last = d2, f2.tail = c2, f2.tailMode = e2);
      }
      function xj(a2, b2, c2) {
        var d2 = b2.pendingProps, e2 = d2.revealOrder, f2 = d2.tail;
        Xi(a2, b2, d2.children, c2);
        d2 = L2.current;
        if (0 !== (d2 & 2)) d2 = d2 & 1 | 2, b2.flags |= 128;
        else {
          if (null !== a2 && 0 !== (a2.flags & 128)) a: for (a2 = b2.child; null !== a2; ) {
            if (13 === a2.tag) null !== a2.memoizedState && vj(a2, c2, b2);
            else if (19 === a2.tag) vj(a2, c2, b2);
            else if (null !== a2.child) {
              a2.child.return = a2;
              a2 = a2.child;
              continue;
            }
            if (a2 === b2) break a;
            for (; null === a2.sibling; ) {
              if (null === a2.return || a2.return === b2) break a;
              a2 = a2.return;
            }
            a2.sibling.return = a2.return;
            a2 = a2.sibling;
          }
          d2 &= 1;
        }
        G2(L2, d2);
        if (0 === (b2.mode & 1)) b2.memoizedState = null;
        else switch (e2) {
          case "forwards":
            c2 = b2.child;
            for (e2 = null; null !== c2; ) a2 = c2.alternate, null !== a2 && null === Ch(a2) && (e2 = c2), c2 = c2.sibling;
            c2 = e2;
            null === c2 ? (e2 = b2.child, b2.child = null) : (e2 = c2.sibling, c2.sibling = null);
            wj(b2, false, e2, c2, f2);
            break;
          case "backwards":
            c2 = null;
            e2 = b2.child;
            for (b2.child = null; null !== e2; ) {
              a2 = e2.alternate;
              if (null !== a2 && null === Ch(a2)) {
                b2.child = e2;
                break;
              }
              a2 = e2.sibling;
              e2.sibling = c2;
              c2 = e2;
              e2 = a2;
            }
            wj(b2, true, c2, null, f2);
            break;
          case "together":
            wj(b2, false, null, null, void 0);
            break;
          default:
            b2.memoizedState = null;
        }
        return b2.child;
      }
      function ij(a2, b2) {
        0 === (b2.mode & 1) && null !== a2 && (a2.alternate = null, b2.alternate = null, b2.flags |= 2);
      }
      function Zi(a2, b2, c2) {
        null !== a2 && (b2.dependencies = a2.dependencies);
        rh |= b2.lanes;
        if (0 === (c2 & b2.childLanes)) return null;
        if (null !== a2 && b2.child !== a2.child) throw Error(p2(153));
        if (null !== b2.child) {
          a2 = b2.child;
          c2 = Pg(a2, a2.pendingProps);
          b2.child = c2;
          for (c2.return = b2; null !== a2.sibling; ) a2 = a2.sibling, c2 = c2.sibling = Pg(a2, a2.pendingProps), c2.return = b2;
          c2.sibling = null;
        }
        return b2.child;
      }
      function yj(a2, b2, c2) {
        switch (b2.tag) {
          case 3:
            kj(b2);
            Ig();
            break;
          case 5:
            Ah(b2);
            break;
          case 1:
            Zf(b2.type) && cg(b2);
            break;
          case 4:
            yh(b2, b2.stateNode.containerInfo);
            break;
          case 10:
            var d2 = b2.type._context, e2 = b2.memoizedProps.value;
            G2(Wg, d2._currentValue);
            d2._currentValue = e2;
            break;
          case 13:
            d2 = b2.memoizedState;
            if (null !== d2) {
              if (null !== d2.dehydrated) return G2(L2, L2.current & 1), b2.flags |= 128, null;
              if (0 !== (c2 & b2.child.childLanes)) return oj(a2, b2, c2);
              G2(L2, L2.current & 1);
              a2 = Zi(a2, b2, c2);
              return null !== a2 ? a2.sibling : null;
            }
            G2(L2, L2.current & 1);
            break;
          case 19:
            d2 = 0 !== (c2 & b2.childLanes);
            if (0 !== (a2.flags & 128)) {
              if (d2) return xj(a2, b2, c2);
              b2.flags |= 128;
            }
            e2 = b2.memoizedState;
            null !== e2 && (e2.rendering = null, e2.tail = null, e2.lastEffect = null);
            G2(L2, L2.current);
            if (d2) break;
            else return null;
          case 22:
          case 23:
            return b2.lanes = 0, dj(a2, b2, c2);
        }
        return Zi(a2, b2, c2);
      }
      var zj;
      var Aj;
      var Bj;
      var Cj;
      zj = function(a2, b2) {
        for (var c2 = b2.child; null !== c2; ) {
          if (5 === c2.tag || 6 === c2.tag) a2.appendChild(c2.stateNode);
          else if (4 !== c2.tag && null !== c2.child) {
            c2.child.return = c2;
            c2 = c2.child;
            continue;
          }
          if (c2 === b2) break;
          for (; null === c2.sibling; ) {
            if (null === c2.return || c2.return === b2) return;
            c2 = c2.return;
          }
          c2.sibling.return = c2.return;
          c2 = c2.sibling;
        }
      };
      Aj = function() {
      };
      Bj = function(a2, b2, c2, d2) {
        var e2 = a2.memoizedProps;
        if (e2 !== d2) {
          a2 = b2.stateNode;
          xh(uh.current);
          var f2 = null;
          switch (c2) {
            case "input":
              e2 = Ya(a2, e2);
              d2 = Ya(a2, d2);
              f2 = [];
              break;
            case "select":
              e2 = A2({}, e2, { value: void 0 });
              d2 = A2({}, d2, { value: void 0 });
              f2 = [];
              break;
            case "textarea":
              e2 = gb(a2, e2);
              d2 = gb(a2, d2);
              f2 = [];
              break;
            default:
              "function" !== typeof e2.onClick && "function" === typeof d2.onClick && (a2.onclick = Bf);
          }
          ub(c2, d2);
          var g2;
          c2 = null;
          for (l2 in e2) if (!d2.hasOwnProperty(l2) && e2.hasOwnProperty(l2) && null != e2[l2]) if ("style" === l2) {
            var h2 = e2[l2];
            for (g2 in h2) h2.hasOwnProperty(g2) && (c2 || (c2 = {}), c2[g2] = "");
          } else "dangerouslySetInnerHTML" !== l2 && "children" !== l2 && "suppressContentEditableWarning" !== l2 && "suppressHydrationWarning" !== l2 && "autoFocus" !== l2 && (ea.hasOwnProperty(l2) ? f2 || (f2 = []) : (f2 = f2 || []).push(l2, null));
          for (l2 in d2) {
            var k2 = d2[l2];
            h2 = null != e2 ? e2[l2] : void 0;
            if (d2.hasOwnProperty(l2) && k2 !== h2 && (null != k2 || null != h2)) if ("style" === l2) if (h2) {
              for (g2 in h2) !h2.hasOwnProperty(g2) || k2 && k2.hasOwnProperty(g2) || (c2 || (c2 = {}), c2[g2] = "");
              for (g2 in k2) k2.hasOwnProperty(g2) && h2[g2] !== k2[g2] && (c2 || (c2 = {}), c2[g2] = k2[g2]);
            } else c2 || (f2 || (f2 = []), f2.push(
              l2,
              c2
            )), c2 = k2;
            else "dangerouslySetInnerHTML" === l2 ? (k2 = k2 ? k2.__html : void 0, h2 = h2 ? h2.__html : void 0, null != k2 && h2 !== k2 && (f2 = f2 || []).push(l2, k2)) : "children" === l2 ? "string" !== typeof k2 && "number" !== typeof k2 || (f2 = f2 || []).push(l2, "" + k2) : "suppressContentEditableWarning" !== l2 && "suppressHydrationWarning" !== l2 && (ea.hasOwnProperty(l2) ? (null != k2 && "onScroll" === l2 && D2("scroll", a2), f2 || h2 === k2 || (f2 = [])) : (f2 = f2 || []).push(l2, k2));
          }
          c2 && (f2 = f2 || []).push("style", c2);
          var l2 = f2;
          if (b2.updateQueue = l2) b2.flags |= 4;
        }
      };
      Cj = function(a2, b2, c2, d2) {
        c2 !== d2 && (b2.flags |= 4);
      };
      function Dj(a2, b2) {
        if (!I2) switch (a2.tailMode) {
          case "hidden":
            b2 = a2.tail;
            for (var c2 = null; null !== b2; ) null !== b2.alternate && (c2 = b2), b2 = b2.sibling;
            null === c2 ? a2.tail = null : c2.sibling = null;
            break;
          case "collapsed":
            c2 = a2.tail;
            for (var d2 = null; null !== c2; ) null !== c2.alternate && (d2 = c2), c2 = c2.sibling;
            null === d2 ? b2 || null === a2.tail ? a2.tail = null : a2.tail.sibling = null : d2.sibling = null;
        }
      }
      function S2(a2) {
        var b2 = null !== a2.alternate && a2.alternate.child === a2.child, c2 = 0, d2 = 0;
        if (b2) for (var e2 = a2.child; null !== e2; ) c2 |= e2.lanes | e2.childLanes, d2 |= e2.subtreeFlags & 14680064, d2 |= e2.flags & 14680064, e2.return = a2, e2 = e2.sibling;
        else for (e2 = a2.child; null !== e2; ) c2 |= e2.lanes | e2.childLanes, d2 |= e2.subtreeFlags, d2 |= e2.flags, e2.return = a2, e2 = e2.sibling;
        a2.subtreeFlags |= d2;
        a2.childLanes = c2;
        return b2;
      }
      function Ej(a2, b2, c2) {
        var d2 = b2.pendingProps;
        wg(b2);
        switch (b2.tag) {
          case 2:
          case 16:
          case 15:
          case 0:
          case 11:
          case 7:
          case 8:
          case 12:
          case 9:
          case 14:
            return S2(b2), null;
          case 1:
            return Zf(b2.type) && $f(), S2(b2), null;
          case 3:
            d2 = b2.stateNode;
            zh();
            E2(Wf);
            E2(H3);
            Eh();
            d2.pendingContext && (d2.context = d2.pendingContext, d2.pendingContext = null);
            if (null === a2 || null === a2.child) Gg(b2) ? b2.flags |= 4 : null === a2 || a2.memoizedState.isDehydrated && 0 === (b2.flags & 256) || (b2.flags |= 1024, null !== zg && (Fj(zg), zg = null));
            Aj(a2, b2);
            S2(b2);
            return null;
          case 5:
            Bh(b2);
            var e2 = xh(wh.current);
            c2 = b2.type;
            if (null !== a2 && null != b2.stateNode) Bj(a2, b2, c2, d2, e2), a2.ref !== b2.ref && (b2.flags |= 512, b2.flags |= 2097152);
            else {
              if (!d2) {
                if (null === b2.stateNode) throw Error(p2(166));
                S2(b2);
                return null;
              }
              a2 = xh(uh.current);
              if (Gg(b2)) {
                d2 = b2.stateNode;
                c2 = b2.type;
                var f2 = b2.memoizedProps;
                d2[Of] = b2;
                d2[Pf] = f2;
                a2 = 0 !== (b2.mode & 1);
                switch (c2) {
                  case "dialog":
                    D2("cancel", d2);
                    D2("close", d2);
                    break;
                  case "iframe":
                  case "object":
                  case "embed":
                    D2("load", d2);
                    break;
                  case "video":
                  case "audio":
                    for (e2 = 0; e2 < lf.length; e2++) D2(lf[e2], d2);
                    break;
                  case "source":
                    D2("error", d2);
                    break;
                  case "img":
                  case "image":
                  case "link":
                    D2(
                      "error",
                      d2
                    );
                    D2("load", d2);
                    break;
                  case "details":
                    D2("toggle", d2);
                    break;
                  case "input":
                    Za(d2, f2);
                    D2("invalid", d2);
                    break;
                  case "select":
                    d2._wrapperState = { wasMultiple: !!f2.multiple };
                    D2("invalid", d2);
                    break;
                  case "textarea":
                    hb(d2, f2), D2("invalid", d2);
                }
                ub(c2, f2);
                e2 = null;
                for (var g2 in f2) if (f2.hasOwnProperty(g2)) {
                  var h2 = f2[g2];
                  "children" === g2 ? "string" === typeof h2 ? d2.textContent !== h2 && (true !== f2.suppressHydrationWarning && Af(d2.textContent, h2, a2), e2 = ["children", h2]) : "number" === typeof h2 && d2.textContent !== "" + h2 && (true !== f2.suppressHydrationWarning && Af(
                    d2.textContent,
                    h2,
                    a2
                  ), e2 = ["children", "" + h2]) : ea.hasOwnProperty(g2) && null != h2 && "onScroll" === g2 && D2("scroll", d2);
                }
                switch (c2) {
                  case "input":
                    Va(d2);
                    db(d2, f2, true);
                    break;
                  case "textarea":
                    Va(d2);
                    jb(d2);
                    break;
                  case "select":
                  case "option":
                    break;
                  default:
                    "function" === typeof f2.onClick && (d2.onclick = Bf);
                }
                d2 = e2;
                b2.updateQueue = d2;
                null !== d2 && (b2.flags |= 4);
              } else {
                g2 = 9 === e2.nodeType ? e2 : e2.ownerDocument;
                "http://www.w3.org/1999/xhtml" === a2 && (a2 = kb(c2));
                "http://www.w3.org/1999/xhtml" === a2 ? "script" === c2 ? (a2 = g2.createElement("div"), a2.innerHTML = "<script><\/script>", a2 = a2.removeChild(a2.firstChild)) : "string" === typeof d2.is ? a2 = g2.createElement(c2, { is: d2.is }) : (a2 = g2.createElement(c2), "select" === c2 && (g2 = a2, d2.multiple ? g2.multiple = true : d2.size && (g2.size = d2.size))) : a2 = g2.createElementNS(a2, c2);
                a2[Of] = b2;
                a2[Pf] = d2;
                zj(a2, b2, false, false);
                b2.stateNode = a2;
                a: {
                  g2 = vb(c2, d2);
                  switch (c2) {
                    case "dialog":
                      D2("cancel", a2);
                      D2("close", a2);
                      e2 = d2;
                      break;
                    case "iframe":
                    case "object":
                    case "embed":
                      D2("load", a2);
                      e2 = d2;
                      break;
                    case "video":
                    case "audio":
                      for (e2 = 0; e2 < lf.length; e2++) D2(lf[e2], a2);
                      e2 = d2;
                      break;
                    case "source":
                      D2("error", a2);
                      e2 = d2;
                      break;
                    case "img":
                    case "image":
                    case "link":
                      D2(
                        "error",
                        a2
                      );
                      D2("load", a2);
                      e2 = d2;
                      break;
                    case "details":
                      D2("toggle", a2);
                      e2 = d2;
                      break;
                    case "input":
                      Za(a2, d2);
                      e2 = Ya(a2, d2);
                      D2("invalid", a2);
                      break;
                    case "option":
                      e2 = d2;
                      break;
                    case "select":
                      a2._wrapperState = { wasMultiple: !!d2.multiple };
                      e2 = A2({}, d2, { value: void 0 });
                      D2("invalid", a2);
                      break;
                    case "textarea":
                      hb(a2, d2);
                      e2 = gb(a2, d2);
                      D2("invalid", a2);
                      break;
                    default:
                      e2 = d2;
                  }
                  ub(c2, e2);
                  h2 = e2;
                  for (f2 in h2) if (h2.hasOwnProperty(f2)) {
                    var k2 = h2[f2];
                    "style" === f2 ? sb(a2, k2) : "dangerouslySetInnerHTML" === f2 ? (k2 = k2 ? k2.__html : void 0, null != k2 && nb(a2, k2)) : "children" === f2 ? "string" === typeof k2 ? ("textarea" !== c2 || "" !== k2) && ob(a2, k2) : "number" === typeof k2 && ob(a2, "" + k2) : "suppressContentEditableWarning" !== f2 && "suppressHydrationWarning" !== f2 && "autoFocus" !== f2 && (ea.hasOwnProperty(f2) ? null != k2 && "onScroll" === f2 && D2("scroll", a2) : null != k2 && ta(a2, f2, k2, g2));
                  }
                  switch (c2) {
                    case "input":
                      Va(a2);
                      db(a2, d2, false);
                      break;
                    case "textarea":
                      Va(a2);
                      jb(a2);
                      break;
                    case "option":
                      null != d2.value && a2.setAttribute("value", "" + Sa(d2.value));
                      break;
                    case "select":
                      a2.multiple = !!d2.multiple;
                      f2 = d2.value;
                      null != f2 ? fb(a2, !!d2.multiple, f2, false) : null != d2.defaultValue && fb(
                        a2,
                        !!d2.multiple,
                        d2.defaultValue,
                        true
                      );
                      break;
                    default:
                      "function" === typeof e2.onClick && (a2.onclick = Bf);
                  }
                  switch (c2) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                      d2 = !!d2.autoFocus;
                      break a;
                    case "img":
                      d2 = true;
                      break a;
                    default:
                      d2 = false;
                  }
                }
                d2 && (b2.flags |= 4);
              }
              null !== b2.ref && (b2.flags |= 512, b2.flags |= 2097152);
            }
            S2(b2);
            return null;
          case 6:
            if (a2 && null != b2.stateNode) Cj(a2, b2, a2.memoizedProps, d2);
            else {
              if ("string" !== typeof d2 && null === b2.stateNode) throw Error(p2(166));
              c2 = xh(wh.current);
              xh(uh.current);
              if (Gg(b2)) {
                d2 = b2.stateNode;
                c2 = b2.memoizedProps;
                d2[Of] = b2;
                if (f2 = d2.nodeValue !== c2) {
                  if (a2 = xg, null !== a2) switch (a2.tag) {
                    case 3:
                      Af(d2.nodeValue, c2, 0 !== (a2.mode & 1));
                      break;
                    case 5:
                      true !== a2.memoizedProps.suppressHydrationWarning && Af(d2.nodeValue, c2, 0 !== (a2.mode & 1));
                  }
                }
                f2 && (b2.flags |= 4);
              } else d2 = (9 === c2.nodeType ? c2 : c2.ownerDocument).createTextNode(d2), d2[Of] = b2, b2.stateNode = d2;
            }
            S2(b2);
            return null;
          case 13:
            E2(L2);
            d2 = b2.memoizedState;
            if (null === a2 || null !== a2.memoizedState && null !== a2.memoizedState.dehydrated) {
              if (I2 && null !== yg && 0 !== (b2.mode & 1) && 0 === (b2.flags & 128)) Hg(), Ig(), b2.flags |= 98560, f2 = false;
              else if (f2 = Gg(b2), null !== d2 && null !== d2.dehydrated) {
                if (null === a2) {
                  if (!f2) throw Error(p2(318));
                  f2 = b2.memoizedState;
                  f2 = null !== f2 ? f2.dehydrated : null;
                  if (!f2) throw Error(p2(317));
                  f2[Of] = b2;
                } else Ig(), 0 === (b2.flags & 128) && (b2.memoizedState = null), b2.flags |= 4;
                S2(b2);
                f2 = false;
              } else null !== zg && (Fj(zg), zg = null), f2 = true;
              if (!f2) return b2.flags & 65536 ? b2 : null;
            }
            if (0 !== (b2.flags & 128)) return b2.lanes = c2, b2;
            d2 = null !== d2;
            d2 !== (null !== a2 && null !== a2.memoizedState) && d2 && (b2.child.flags |= 8192, 0 !== (b2.mode & 1) && (null === a2 || 0 !== (L2.current & 1) ? 0 === T2 && (T2 = 3) : tj()));
            null !== b2.updateQueue && (b2.flags |= 4);
            S2(b2);
            return null;
          case 4:
            return zh(), Aj(a2, b2), null === a2 && sf(b2.stateNode.containerInfo), S2(b2), null;
          case 10:
            return ah(b2.type._context), S2(b2), null;
          case 17:
            return Zf(b2.type) && $f(), S2(b2), null;
          case 19:
            E2(L2);
            f2 = b2.memoizedState;
            if (null === f2) return S2(b2), null;
            d2 = 0 !== (b2.flags & 128);
            g2 = f2.rendering;
            if (null === g2) if (d2) Dj(f2, false);
            else {
              if (0 !== T2 || null !== a2 && 0 !== (a2.flags & 128)) for (a2 = b2.child; null !== a2; ) {
                g2 = Ch(a2);
                if (null !== g2) {
                  b2.flags |= 128;
                  Dj(f2, false);
                  d2 = g2.updateQueue;
                  null !== d2 && (b2.updateQueue = d2, b2.flags |= 4);
                  b2.subtreeFlags = 0;
                  d2 = c2;
                  for (c2 = b2.child; null !== c2; ) f2 = c2, a2 = d2, f2.flags &= 14680066, g2 = f2.alternate, null === g2 ? (f2.childLanes = 0, f2.lanes = a2, f2.child = null, f2.subtreeFlags = 0, f2.memoizedProps = null, f2.memoizedState = null, f2.updateQueue = null, f2.dependencies = null, f2.stateNode = null) : (f2.childLanes = g2.childLanes, f2.lanes = g2.lanes, f2.child = g2.child, f2.subtreeFlags = 0, f2.deletions = null, f2.memoizedProps = g2.memoizedProps, f2.memoizedState = g2.memoizedState, f2.updateQueue = g2.updateQueue, f2.type = g2.type, a2 = g2.dependencies, f2.dependencies = null === a2 ? null : { lanes: a2.lanes, firstContext: a2.firstContext }), c2 = c2.sibling;
                  G2(L2, L2.current & 1 | 2);
                  return b2.child;
                }
                a2 = a2.sibling;
              }
              null !== f2.tail && B2() > Gj && (b2.flags |= 128, d2 = true, Dj(f2, false), b2.lanes = 4194304);
            }
            else {
              if (!d2) if (a2 = Ch(g2), null !== a2) {
                if (b2.flags |= 128, d2 = true, c2 = a2.updateQueue, null !== c2 && (b2.updateQueue = c2, b2.flags |= 4), Dj(f2, true), null === f2.tail && "hidden" === f2.tailMode && !g2.alternate && !I2) return S2(b2), null;
              } else 2 * B2() - f2.renderingStartTime > Gj && 1073741824 !== c2 && (b2.flags |= 128, d2 = true, Dj(f2, false), b2.lanes = 4194304);
              f2.isBackwards ? (g2.sibling = b2.child, b2.child = g2) : (c2 = f2.last, null !== c2 ? c2.sibling = g2 : b2.child = g2, f2.last = g2);
            }
            if (null !== f2.tail) return b2 = f2.tail, f2.rendering = b2, f2.tail = b2.sibling, f2.renderingStartTime = B2(), b2.sibling = null, c2 = L2.current, G2(L2, d2 ? c2 & 1 | 2 : c2 & 1), b2;
            S2(b2);
            return null;
          case 22:
          case 23:
            return Hj(), d2 = null !== b2.memoizedState, null !== a2 && null !== a2.memoizedState !== d2 && (b2.flags |= 8192), d2 && 0 !== (b2.mode & 1) ? 0 !== (fj & 1073741824) && (S2(b2), b2.subtreeFlags & 6 && (b2.flags |= 8192)) : S2(b2), null;
          case 24:
            return null;
          case 25:
            return null;
        }
        throw Error(p2(156, b2.tag));
      }
      function Ij(a2, b2) {
        wg(b2);
        switch (b2.tag) {
          case 1:
            return Zf(b2.type) && $f(), a2 = b2.flags, a2 & 65536 ? (b2.flags = a2 & -65537 | 128, b2) : null;
          case 3:
            return zh(), E2(Wf), E2(H3), Eh(), a2 = b2.flags, 0 !== (a2 & 65536) && 0 === (a2 & 128) ? (b2.flags = a2 & -65537 | 128, b2) : null;
          case 5:
            return Bh(b2), null;
          case 13:
            E2(L2);
            a2 = b2.memoizedState;
            if (null !== a2 && null !== a2.dehydrated) {
              if (null === b2.alternate) throw Error(p2(340));
              Ig();
            }
            a2 = b2.flags;
            return a2 & 65536 ? (b2.flags = a2 & -65537 | 128, b2) : null;
          case 19:
            return E2(L2), null;
          case 4:
            return zh(), null;
          case 10:
            return ah(b2.type._context), null;
          case 22:
          case 23:
            return Hj(), null;
          case 24:
            return null;
          default:
            return null;
        }
      }
      var Jj = false;
      var U2 = false;
      var Kj = "function" === typeof WeakSet ? WeakSet : Set;
      var V2 = null;
      function Lj(a2, b2) {
        var c2 = a2.ref;
        if (null !== c2) if ("function" === typeof c2) try {
          c2(null);
        } catch (d2) {
          W2(a2, b2, d2);
        }
        else c2.current = null;
      }
      function Mj(a2, b2, c2) {
        try {
          c2();
        } catch (d2) {
          W2(a2, b2, d2);
        }
      }
      var Nj = false;
      function Oj(a2, b2) {
        Cf = dd;
        a2 = Me2();
        if (Ne(a2)) {
          if ("selectionStart" in a2) var c2 = { start: a2.selectionStart, end: a2.selectionEnd };
          else a: {
            c2 = (c2 = a2.ownerDocument) && c2.defaultView || window;
            var d2 = c2.getSelection && c2.getSelection();
            if (d2 && 0 !== d2.rangeCount) {
              c2 = d2.anchorNode;
              var e2 = d2.anchorOffset, f2 = d2.focusNode;
              d2 = d2.focusOffset;
              try {
                c2.nodeType, f2.nodeType;
              } catch (F2) {
                c2 = null;
                break a;
              }
              var g2 = 0, h2 = -1, k2 = -1, l2 = 0, m2 = 0, q2 = a2, r2 = null;
              b: for (; ; ) {
                for (var y2; ; ) {
                  q2 !== c2 || 0 !== e2 && 3 !== q2.nodeType || (h2 = g2 + e2);
                  q2 !== f2 || 0 !== d2 && 3 !== q2.nodeType || (k2 = g2 + d2);
                  3 === q2.nodeType && (g2 += q2.nodeValue.length);
                  if (null === (y2 = q2.firstChild)) break;
                  r2 = q2;
                  q2 = y2;
                }
                for (; ; ) {
                  if (q2 === a2) break b;
                  r2 === c2 && ++l2 === e2 && (h2 = g2);
                  r2 === f2 && ++m2 === d2 && (k2 = g2);
                  if (null !== (y2 = q2.nextSibling)) break;
                  q2 = r2;
                  r2 = q2.parentNode;
                }
                q2 = y2;
              }
              c2 = -1 === h2 || -1 === k2 ? null : { start: h2, end: k2 };
            } else c2 = null;
          }
          c2 = c2 || { start: 0, end: 0 };
        } else c2 = null;
        Df = { focusedElem: a2, selectionRange: c2 };
        dd = false;
        for (V2 = b2; null !== V2; ) if (b2 = V2, a2 = b2.child, 0 !== (b2.subtreeFlags & 1028) && null !== a2) a2.return = b2, V2 = a2;
        else for (; null !== V2; ) {
          b2 = V2;
          try {
            var n2 = b2.alternate;
            if (0 !== (b2.flags & 1024)) switch (b2.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (null !== n2) {
                  var t2 = n2.memoizedProps, J2 = n2.memoizedState, x2 = b2.stateNode, w2 = x2.getSnapshotBeforeUpdate(b2.elementType === b2.type ? t2 : Ci(b2.type, t2), J2);
                  x2.__reactInternalSnapshotBeforeUpdate = w2;
                }
                break;
              case 3:
                var u2 = b2.stateNode.containerInfo;
                1 === u2.nodeType ? u2.textContent = "" : 9 === u2.nodeType && u2.documentElement && u2.removeChild(u2.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(p2(163));
            }
          } catch (F2) {
            W2(b2, b2.return, F2);
          }
          a2 = b2.sibling;
          if (null !== a2) {
            a2.return = b2.return;
            V2 = a2;
            break;
          }
          V2 = b2.return;
        }
        n2 = Nj;
        Nj = false;
        return n2;
      }
      function Pj(a2, b2, c2) {
        var d2 = b2.updateQueue;
        d2 = null !== d2 ? d2.lastEffect : null;
        if (null !== d2) {
          var e2 = d2 = d2.next;
          do {
            if ((e2.tag & a2) === a2) {
              var f2 = e2.destroy;
              e2.destroy = void 0;
              void 0 !== f2 && Mj(b2, c2, f2);
            }
            e2 = e2.next;
          } while (e2 !== d2);
        }
      }
      function Qj(a2, b2) {
        b2 = b2.updateQueue;
        b2 = null !== b2 ? b2.lastEffect : null;
        if (null !== b2) {
          var c2 = b2 = b2.next;
          do {
            if ((c2.tag & a2) === a2) {
              var d2 = c2.create;
              c2.destroy = d2();
            }
            c2 = c2.next;
          } while (c2 !== b2);
        }
      }
      function Rj(a2) {
        var b2 = a2.ref;
        if (null !== b2) {
          var c2 = a2.stateNode;
          switch (a2.tag) {
            case 5:
              a2 = c2;
              break;
            default:
              a2 = c2;
          }
          "function" === typeof b2 ? b2(a2) : b2.current = a2;
        }
      }
      function Sj(a2) {
        var b2 = a2.alternate;
        null !== b2 && (a2.alternate = null, Sj(b2));
        a2.child = null;
        a2.deletions = null;
        a2.sibling = null;
        5 === a2.tag && (b2 = a2.stateNode, null !== b2 && (delete b2[Of], delete b2[Pf], delete b2[of], delete b2[Qf], delete b2[Rf]));
        a2.stateNode = null;
        a2.return = null;
        a2.dependencies = null;
        a2.memoizedProps = null;
        a2.memoizedState = null;
        a2.pendingProps = null;
        a2.stateNode = null;
        a2.updateQueue = null;
      }
      function Tj(a2) {
        return 5 === a2.tag || 3 === a2.tag || 4 === a2.tag;
      }
      function Uj(a2) {
        a: for (; ; ) {
          for (; null === a2.sibling; ) {
            if (null === a2.return || Tj(a2.return)) return null;
            a2 = a2.return;
          }
          a2.sibling.return = a2.return;
          for (a2 = a2.sibling; 5 !== a2.tag && 6 !== a2.tag && 18 !== a2.tag; ) {
            if (a2.flags & 2) continue a;
            if (null === a2.child || 4 === a2.tag) continue a;
            else a2.child.return = a2, a2 = a2.child;
          }
          if (!(a2.flags & 2)) return a2.stateNode;
        }
      }
      function Vj(a2, b2, c2) {
        var d2 = a2.tag;
        if (5 === d2 || 6 === d2) a2 = a2.stateNode, b2 ? 8 === c2.nodeType ? c2.parentNode.insertBefore(a2, b2) : c2.insertBefore(a2, b2) : (8 === c2.nodeType ? (b2 = c2.parentNode, b2.insertBefore(a2, c2)) : (b2 = c2, b2.appendChild(a2)), c2 = c2._reactRootContainer, null !== c2 && void 0 !== c2 || null !== b2.onclick || (b2.onclick = Bf));
        else if (4 !== d2 && (a2 = a2.child, null !== a2)) for (Vj(a2, b2, c2), a2 = a2.sibling; null !== a2; ) Vj(a2, b2, c2), a2 = a2.sibling;
      }
      function Wj(a2, b2, c2) {
        var d2 = a2.tag;
        if (5 === d2 || 6 === d2) a2 = a2.stateNode, b2 ? c2.insertBefore(a2, b2) : c2.appendChild(a2);
        else if (4 !== d2 && (a2 = a2.child, null !== a2)) for (Wj(a2, b2, c2), a2 = a2.sibling; null !== a2; ) Wj(a2, b2, c2), a2 = a2.sibling;
      }
      var X2 = null;
      var Xj = false;
      function Yj(a2, b2, c2) {
        for (c2 = c2.child; null !== c2; ) Zj(a2, b2, c2), c2 = c2.sibling;
      }
      function Zj(a2, b2, c2) {
        if (lc && "function" === typeof lc.onCommitFiberUnmount) try {
          lc.onCommitFiberUnmount(kc, c2);
        } catch (h2) {
        }
        switch (c2.tag) {
          case 5:
            U2 || Lj(c2, b2);
          case 6:
            var d2 = X2, e2 = Xj;
            X2 = null;
            Yj(a2, b2, c2);
            X2 = d2;
            Xj = e2;
            null !== X2 && (Xj ? (a2 = X2, c2 = c2.stateNode, 8 === a2.nodeType ? a2.parentNode.removeChild(c2) : a2.removeChild(c2)) : X2.removeChild(c2.stateNode));
            break;
          case 18:
            null !== X2 && (Xj ? (a2 = X2, c2 = c2.stateNode, 8 === a2.nodeType ? Kf(a2.parentNode, c2) : 1 === a2.nodeType && Kf(a2, c2), bd(a2)) : Kf(X2, c2.stateNode));
            break;
          case 4:
            d2 = X2;
            e2 = Xj;
            X2 = c2.stateNode.containerInfo;
            Xj = true;
            Yj(a2, b2, c2);
            X2 = d2;
            Xj = e2;
            break;
          case 0:
          case 11:
          case 14:
          case 15:
            if (!U2 && (d2 = c2.updateQueue, null !== d2 && (d2 = d2.lastEffect, null !== d2))) {
              e2 = d2 = d2.next;
              do {
                var f2 = e2, g2 = f2.destroy;
                f2 = f2.tag;
                void 0 !== g2 && (0 !== (f2 & 2) ? Mj(c2, b2, g2) : 0 !== (f2 & 4) && Mj(c2, b2, g2));
                e2 = e2.next;
              } while (e2 !== d2);
            }
            Yj(a2, b2, c2);
            break;
          case 1:
            if (!U2 && (Lj(c2, b2), d2 = c2.stateNode, "function" === typeof d2.componentWillUnmount)) try {
              d2.props = c2.memoizedProps, d2.state = c2.memoizedState, d2.componentWillUnmount();
            } catch (h2) {
              W2(c2, b2, h2);
            }
            Yj(a2, b2, c2);
            break;
          case 21:
            Yj(a2, b2, c2);
            break;
          case 22:
            c2.mode & 1 ? (U2 = (d2 = U2) || null !== c2.memoizedState, Yj(a2, b2, c2), U2 = d2) : Yj(a2, b2, c2);
            break;
          default:
            Yj(a2, b2, c2);
        }
      }
      function ak(a2) {
        var b2 = a2.updateQueue;
        if (null !== b2) {
          a2.updateQueue = null;
          var c2 = a2.stateNode;
          null === c2 && (c2 = a2.stateNode = new Kj());
          b2.forEach(function(b3) {
            var d2 = bk.bind(null, a2, b3);
            c2.has(b3) || (c2.add(b3), b3.then(d2, d2));
          });
        }
      }
      function ck(a2, b2) {
        var c2 = b2.deletions;
        if (null !== c2) for (var d2 = 0; d2 < c2.length; d2++) {
          var e2 = c2[d2];
          try {
            var f2 = a2, g2 = b2, h2 = g2;
            a: for (; null !== h2; ) {
              switch (h2.tag) {
                case 5:
                  X2 = h2.stateNode;
                  Xj = false;
                  break a;
                case 3:
                  X2 = h2.stateNode.containerInfo;
                  Xj = true;
                  break a;
                case 4:
                  X2 = h2.stateNode.containerInfo;
                  Xj = true;
                  break a;
              }
              h2 = h2.return;
            }
            if (null === X2) throw Error(p2(160));
            Zj(f2, g2, e2);
            X2 = null;
            Xj = false;
            var k2 = e2.alternate;
            null !== k2 && (k2.return = null);
            e2.return = null;
          } catch (l2) {
            W2(e2, b2, l2);
          }
        }
        if (b2.subtreeFlags & 12854) for (b2 = b2.child; null !== b2; ) dk(b2, a2), b2 = b2.sibling;
      }
      function dk(a2, b2) {
        var c2 = a2.alternate, d2 = a2.flags;
        switch (a2.tag) {
          case 0:
          case 11:
          case 14:
          case 15:
            ck(b2, a2);
            ek(a2);
            if (d2 & 4) {
              try {
                Pj(3, a2, a2.return), Qj(3, a2);
              } catch (t2) {
                W2(a2, a2.return, t2);
              }
              try {
                Pj(5, a2, a2.return);
              } catch (t2) {
                W2(a2, a2.return, t2);
              }
            }
            break;
          case 1:
            ck(b2, a2);
            ek(a2);
            d2 & 512 && null !== c2 && Lj(c2, c2.return);
            break;
          case 5:
            ck(b2, a2);
            ek(a2);
            d2 & 512 && null !== c2 && Lj(c2, c2.return);
            if (a2.flags & 32) {
              var e2 = a2.stateNode;
              try {
                ob(e2, "");
              } catch (t2) {
                W2(a2, a2.return, t2);
              }
            }
            if (d2 & 4 && (e2 = a2.stateNode, null != e2)) {
              var f2 = a2.memoizedProps, g2 = null !== c2 ? c2.memoizedProps : f2, h2 = a2.type, k2 = a2.updateQueue;
              a2.updateQueue = null;
              if (null !== k2) try {
                "input" === h2 && "radio" === f2.type && null != f2.name && ab(e2, f2);
                vb(h2, g2);
                var l2 = vb(h2, f2);
                for (g2 = 0; g2 < k2.length; g2 += 2) {
                  var m2 = k2[g2], q2 = k2[g2 + 1];
                  "style" === m2 ? sb(e2, q2) : "dangerouslySetInnerHTML" === m2 ? nb(e2, q2) : "children" === m2 ? ob(e2, q2) : ta(e2, m2, q2, l2);
                }
                switch (h2) {
                  case "input":
                    bb(e2, f2);
                    break;
                  case "textarea":
                    ib(e2, f2);
                    break;
                  case "select":
                    var r2 = e2._wrapperState.wasMultiple;
                    e2._wrapperState.wasMultiple = !!f2.multiple;
                    var y2 = f2.value;
                    null != y2 ? fb(e2, !!f2.multiple, y2, false) : r2 !== !!f2.multiple && (null != f2.defaultValue ? fb(
                      e2,
                      !!f2.multiple,
                      f2.defaultValue,
                      true
                    ) : fb(e2, !!f2.multiple, f2.multiple ? [] : "", false));
                }
                e2[Pf] = f2;
              } catch (t2) {
                W2(a2, a2.return, t2);
              }
            }
            break;
          case 6:
            ck(b2, a2);
            ek(a2);
            if (d2 & 4) {
              if (null === a2.stateNode) throw Error(p2(162));
              e2 = a2.stateNode;
              f2 = a2.memoizedProps;
              try {
                e2.nodeValue = f2;
              } catch (t2) {
                W2(a2, a2.return, t2);
              }
            }
            break;
          case 3:
            ck(b2, a2);
            ek(a2);
            if (d2 & 4 && null !== c2 && c2.memoizedState.isDehydrated) try {
              bd(b2.containerInfo);
            } catch (t2) {
              W2(a2, a2.return, t2);
            }
            break;
          case 4:
            ck(b2, a2);
            ek(a2);
            break;
          case 13:
            ck(b2, a2);
            ek(a2);
            e2 = a2.child;
            e2.flags & 8192 && (f2 = null !== e2.memoizedState, e2.stateNode.isHidden = f2, !f2 || null !== e2.alternate && null !== e2.alternate.memoizedState || (fk = B2()));
            d2 & 4 && ak(a2);
            break;
          case 22:
            m2 = null !== c2 && null !== c2.memoizedState;
            a2.mode & 1 ? (U2 = (l2 = U2) || m2, ck(b2, a2), U2 = l2) : ck(b2, a2);
            ek(a2);
            if (d2 & 8192) {
              l2 = null !== a2.memoizedState;
              if ((a2.stateNode.isHidden = l2) && !m2 && 0 !== (a2.mode & 1)) for (V2 = a2, m2 = a2.child; null !== m2; ) {
                for (q2 = V2 = m2; null !== V2; ) {
                  r2 = V2;
                  y2 = r2.child;
                  switch (r2.tag) {
                    case 0:
                    case 11:
                    case 14:
                    case 15:
                      Pj(4, r2, r2.return);
                      break;
                    case 1:
                      Lj(r2, r2.return);
                      var n2 = r2.stateNode;
                      if ("function" === typeof n2.componentWillUnmount) {
                        d2 = r2;
                        c2 = r2.return;
                        try {
                          b2 = d2, n2.props = b2.memoizedProps, n2.state = b2.memoizedState, n2.componentWillUnmount();
                        } catch (t2) {
                          W2(d2, c2, t2);
                        }
                      }
                      break;
                    case 5:
                      Lj(r2, r2.return);
                      break;
                    case 22:
                      if (null !== r2.memoizedState) {
                        gk(q2);
                        continue;
                      }
                  }
                  null !== y2 ? (y2.return = r2, V2 = y2) : gk(q2);
                }
                m2 = m2.sibling;
              }
              a: for (m2 = null, q2 = a2; ; ) {
                if (5 === q2.tag) {
                  if (null === m2) {
                    m2 = q2;
                    try {
                      e2 = q2.stateNode, l2 ? (f2 = e2.style, "function" === typeof f2.setProperty ? f2.setProperty("display", "none", "important") : f2.display = "none") : (h2 = q2.stateNode, k2 = q2.memoizedProps.style, g2 = void 0 !== k2 && null !== k2 && k2.hasOwnProperty("display") ? k2.display : null, h2.style.display = rb("display", g2));
                    } catch (t2) {
                      W2(a2, a2.return, t2);
                    }
                  }
                } else if (6 === q2.tag) {
                  if (null === m2) try {
                    q2.stateNode.nodeValue = l2 ? "" : q2.memoizedProps;
                  } catch (t2) {
                    W2(a2, a2.return, t2);
                  }
                } else if ((22 !== q2.tag && 23 !== q2.tag || null === q2.memoizedState || q2 === a2) && null !== q2.child) {
                  q2.child.return = q2;
                  q2 = q2.child;
                  continue;
                }
                if (q2 === a2) break a;
                for (; null === q2.sibling; ) {
                  if (null === q2.return || q2.return === a2) break a;
                  m2 === q2 && (m2 = null);
                  q2 = q2.return;
                }
                m2 === q2 && (m2 = null);
                q2.sibling.return = q2.return;
                q2 = q2.sibling;
              }
            }
            break;
          case 19:
            ck(b2, a2);
            ek(a2);
            d2 & 4 && ak(a2);
            break;
          case 21:
            break;
          default:
            ck(
              b2,
              a2
            ), ek(a2);
        }
      }
      function ek(a2) {
        var b2 = a2.flags;
        if (b2 & 2) {
          try {
            a: {
              for (var c2 = a2.return; null !== c2; ) {
                if (Tj(c2)) {
                  var d2 = c2;
                  break a;
                }
                c2 = c2.return;
              }
              throw Error(p2(160));
            }
            switch (d2.tag) {
              case 5:
                var e2 = d2.stateNode;
                d2.flags & 32 && (ob(e2, ""), d2.flags &= -33);
                var f2 = Uj(a2);
                Wj(a2, f2, e2);
                break;
              case 3:
              case 4:
                var g2 = d2.stateNode.containerInfo, h2 = Uj(a2);
                Vj(a2, h2, g2);
                break;
              default:
                throw Error(p2(161));
            }
          } catch (k2) {
            W2(a2, a2.return, k2);
          }
          a2.flags &= -3;
        }
        b2 & 4096 && (a2.flags &= -4097);
      }
      function hk(a2, b2, c2) {
        V2 = a2;
        ik(a2, b2, c2);
      }
      function ik(a2, b2, c2) {
        for (var d2 = 0 !== (a2.mode & 1); null !== V2; ) {
          var e2 = V2, f2 = e2.child;
          if (22 === e2.tag && d2) {
            var g2 = null !== e2.memoizedState || Jj;
            if (!g2) {
              var h2 = e2.alternate, k2 = null !== h2 && null !== h2.memoizedState || U2;
              h2 = Jj;
              var l2 = U2;
              Jj = g2;
              if ((U2 = k2) && !l2) for (V2 = e2; null !== V2; ) g2 = V2, k2 = g2.child, 22 === g2.tag && null !== g2.memoizedState ? jk(e2) : null !== k2 ? (k2.return = g2, V2 = k2) : jk(e2);
              for (; null !== f2; ) V2 = f2, ik(f2, b2, c2), f2 = f2.sibling;
              V2 = e2;
              Jj = h2;
              U2 = l2;
            }
            kk(a2, b2, c2);
          } else 0 !== (e2.subtreeFlags & 8772) && null !== f2 ? (f2.return = e2, V2 = f2) : kk(a2, b2, c2);
        }
      }
      function kk(a2) {
        for (; null !== V2; ) {
          var b2 = V2;
          if (0 !== (b2.flags & 8772)) {
            var c2 = b2.alternate;
            try {
              if (0 !== (b2.flags & 8772)) switch (b2.tag) {
                case 0:
                case 11:
                case 15:
                  U2 || Qj(5, b2);
                  break;
                case 1:
                  var d2 = b2.stateNode;
                  if (b2.flags & 4 && !U2) if (null === c2) d2.componentDidMount();
                  else {
                    var e2 = b2.elementType === b2.type ? c2.memoizedProps : Ci(b2.type, c2.memoizedProps);
                    d2.componentDidUpdate(e2, c2.memoizedState, d2.__reactInternalSnapshotBeforeUpdate);
                  }
                  var f2 = b2.updateQueue;
                  null !== f2 && sh(b2, f2, d2);
                  break;
                case 3:
                  var g2 = b2.updateQueue;
                  if (null !== g2) {
                    c2 = null;
                    if (null !== b2.child) switch (b2.child.tag) {
                      case 5:
                        c2 = b2.child.stateNode;
                        break;
                      case 1:
                        c2 = b2.child.stateNode;
                    }
                    sh(b2, g2, c2);
                  }
                  break;
                case 5:
                  var h2 = b2.stateNode;
                  if (null === c2 && b2.flags & 4) {
                    c2 = h2;
                    var k2 = b2.memoizedProps;
                    switch (b2.type) {
                      case "button":
                      case "input":
                      case "select":
                      case "textarea":
                        k2.autoFocus && c2.focus();
                        break;
                      case "img":
                        k2.src && (c2.src = k2.src);
                    }
                  }
                  break;
                case 6:
                  break;
                case 4:
                  break;
                case 12:
                  break;
                case 13:
                  if (null === b2.memoizedState) {
                    var l2 = b2.alternate;
                    if (null !== l2) {
                      var m2 = l2.memoizedState;
                      if (null !== m2) {
                        var q2 = m2.dehydrated;
                        null !== q2 && bd(q2);
                      }
                    }
                  }
                  break;
                case 19:
                case 17:
                case 21:
                case 22:
                case 23:
                case 25:
                  break;
                default:
                  throw Error(p2(163));
              }
              U2 || b2.flags & 512 && Rj(b2);
            } catch (r2) {
              W2(b2, b2.return, r2);
            }
          }
          if (b2 === a2) {
            V2 = null;
            break;
          }
          c2 = b2.sibling;
          if (null !== c2) {
            c2.return = b2.return;
            V2 = c2;
            break;
          }
          V2 = b2.return;
        }
      }
      function gk(a2) {
        for (; null !== V2; ) {
          var b2 = V2;
          if (b2 === a2) {
            V2 = null;
            break;
          }
          var c2 = b2.sibling;
          if (null !== c2) {
            c2.return = b2.return;
            V2 = c2;
            break;
          }
          V2 = b2.return;
        }
      }
      function jk(a2) {
        for (; null !== V2; ) {
          var b2 = V2;
          try {
            switch (b2.tag) {
              case 0:
              case 11:
              case 15:
                var c2 = b2.return;
                try {
                  Qj(4, b2);
                } catch (k2) {
                  W2(b2, c2, k2);
                }
                break;
              case 1:
                var d2 = b2.stateNode;
                if ("function" === typeof d2.componentDidMount) {
                  var e2 = b2.return;
                  try {
                    d2.componentDidMount();
                  } catch (k2) {
                    W2(b2, e2, k2);
                  }
                }
                var f2 = b2.return;
                try {
                  Rj(b2);
                } catch (k2) {
                  W2(b2, f2, k2);
                }
                break;
              case 5:
                var g2 = b2.return;
                try {
                  Rj(b2);
                } catch (k2) {
                  W2(b2, g2, k2);
                }
            }
          } catch (k2) {
            W2(b2, b2.return, k2);
          }
          if (b2 === a2) {
            V2 = null;
            break;
          }
          var h2 = b2.sibling;
          if (null !== h2) {
            h2.return = b2.return;
            V2 = h2;
            break;
          }
          V2 = b2.return;
        }
      }
      var lk = Math.ceil;
      var mk = ua.ReactCurrentDispatcher;
      var nk = ua.ReactCurrentOwner;
      var ok = ua.ReactCurrentBatchConfig;
      var K2 = 0;
      var Q2 = null;
      var Y2 = null;
      var Z2 = 0;
      var fj = 0;
      var ej = Uf(0);
      var T2 = 0;
      var pk = null;
      var rh = 0;
      var qk = 0;
      var rk = 0;
      var sk = null;
      var tk = null;
      var fk = 0;
      var Gj = Infinity;
      var uk = null;
      var Oi = false;
      var Pi = null;
      var Ri = null;
      var vk = false;
      var wk = null;
      var xk = 0;
      var yk = 0;
      var zk = null;
      var Ak = -1;
      var Bk = 0;
      function R2() {
        return 0 !== (K2 & 6) ? B2() : -1 !== Ak ? Ak : Ak = B2();
      }
      function yi(a2) {
        if (0 === (a2.mode & 1)) return 1;
        if (0 !== (K2 & 2) && 0 !== Z2) return Z2 & -Z2;
        if (null !== Kg.transition) return 0 === Bk && (Bk = yc()), Bk;
        a2 = C2;
        if (0 !== a2) return a2;
        a2 = window.event;
        a2 = void 0 === a2 ? 16 : jd(a2.type);
        return a2;
      }
      function gi(a2, b2, c2, d2) {
        if (50 < yk) throw yk = 0, zk = null, Error(p2(185));
        Ac(a2, c2, d2);
        if (0 === (K2 & 2) || a2 !== Q2) a2 === Q2 && (0 === (K2 & 2) && (qk |= c2), 4 === T2 && Ck(a2, Z2)), Dk(a2, d2), 1 === c2 && 0 === K2 && 0 === (b2.mode & 1) && (Gj = B2() + 500, fg && jg());
      }
      function Dk(a2, b2) {
        var c2 = a2.callbackNode;
        wc(a2, b2);
        var d2 = uc(a2, a2 === Q2 ? Z2 : 0);
        if (0 === d2) null !== c2 && bc(c2), a2.callbackNode = null, a2.callbackPriority = 0;
        else if (b2 = d2 & -d2, a2.callbackPriority !== b2) {
          null != c2 && bc(c2);
          if (1 === b2) 0 === a2.tag ? ig(Ek.bind(null, a2)) : hg(Ek.bind(null, a2)), Jf(function() {
            0 === (K2 & 6) && jg();
          }), c2 = null;
          else {
            switch (Dc(d2)) {
              case 1:
                c2 = fc;
                break;
              case 4:
                c2 = gc;
                break;
              case 16:
                c2 = hc;
                break;
              case 536870912:
                c2 = jc;
                break;
              default:
                c2 = hc;
            }
            c2 = Fk(c2, Gk.bind(null, a2));
          }
          a2.callbackPriority = b2;
          a2.callbackNode = c2;
        }
      }
      function Gk(a2, b2) {
        Ak = -1;
        Bk = 0;
        if (0 !== (K2 & 6)) throw Error(p2(327));
        var c2 = a2.callbackNode;
        if (Hk() && a2.callbackNode !== c2) return null;
        var d2 = uc(a2, a2 === Q2 ? Z2 : 0);
        if (0 === d2) return null;
        if (0 !== (d2 & 30) || 0 !== (d2 & a2.expiredLanes) || b2) b2 = Ik(a2, d2);
        else {
          b2 = d2;
          var e2 = K2;
          K2 |= 2;
          var f2 = Jk();
          if (Q2 !== a2 || Z2 !== b2) uk = null, Gj = B2() + 500, Kk(a2, b2);
          do
            try {
              Lk();
              break;
            } catch (h2) {
              Mk(a2, h2);
            }
          while (1);
          $g();
          mk.current = f2;
          K2 = e2;
          null !== Y2 ? b2 = 0 : (Q2 = null, Z2 = 0, b2 = T2);
        }
        if (0 !== b2) {
          2 === b2 && (e2 = xc(a2), 0 !== e2 && (d2 = e2, b2 = Nk(a2, e2)));
          if (1 === b2) throw c2 = pk, Kk(a2, 0), Ck(a2, d2), Dk(a2, B2()), c2;
          if (6 === b2) Ck(a2, d2);
          else {
            e2 = a2.current.alternate;
            if (0 === (d2 & 30) && !Ok(e2) && (b2 = Ik(a2, d2), 2 === b2 && (f2 = xc(a2), 0 !== f2 && (d2 = f2, b2 = Nk(a2, f2))), 1 === b2)) throw c2 = pk, Kk(a2, 0), Ck(a2, d2), Dk(a2, B2()), c2;
            a2.finishedWork = e2;
            a2.finishedLanes = d2;
            switch (b2) {
              case 0:
              case 1:
                throw Error(p2(345));
              case 2:
                Pk(a2, tk, uk);
                break;
              case 3:
                Ck(a2, d2);
                if ((d2 & 130023424) === d2 && (b2 = fk + 500 - B2(), 10 < b2)) {
                  if (0 !== uc(a2, 0)) break;
                  e2 = a2.suspendedLanes;
                  if ((e2 & d2) !== d2) {
                    R2();
                    a2.pingedLanes |= a2.suspendedLanes & e2;
                    break;
                  }
                  a2.timeoutHandle = Ff(Pk.bind(null, a2, tk, uk), b2);
                  break;
                }
                Pk(a2, tk, uk);
                break;
              case 4:
                Ck(a2, d2);
                if ((d2 & 4194240) === d2) break;
                b2 = a2.eventTimes;
                for (e2 = -1; 0 < d2; ) {
                  var g2 = 31 - oc(d2);
                  f2 = 1 << g2;
                  g2 = b2[g2];
                  g2 > e2 && (e2 = g2);
                  d2 &= ~f2;
                }
                d2 = e2;
                d2 = B2() - d2;
                d2 = (120 > d2 ? 120 : 480 > d2 ? 480 : 1080 > d2 ? 1080 : 1920 > d2 ? 1920 : 3e3 > d2 ? 3e3 : 4320 > d2 ? 4320 : 1960 * lk(d2 / 1960)) - d2;
                if (10 < d2) {
                  a2.timeoutHandle = Ff(Pk.bind(null, a2, tk, uk), d2);
                  break;
                }
                Pk(a2, tk, uk);
                break;
              case 5:
                Pk(a2, tk, uk);
                break;
              default:
                throw Error(p2(329));
            }
          }
        }
        Dk(a2, B2());
        return a2.callbackNode === c2 ? Gk.bind(null, a2) : null;
      }
      function Nk(a2, b2) {
        var c2 = sk;
        a2.current.memoizedState.isDehydrated && (Kk(a2, b2).flags |= 256);
        a2 = Ik(a2, b2);
        2 !== a2 && (b2 = tk, tk = c2, null !== b2 && Fj(b2));
        return a2;
      }
      function Fj(a2) {
        null === tk ? tk = a2 : tk.push.apply(tk, a2);
      }
      function Ok(a2) {
        for (var b2 = a2; ; ) {
          if (b2.flags & 16384) {
            var c2 = b2.updateQueue;
            if (null !== c2 && (c2 = c2.stores, null !== c2)) for (var d2 = 0; d2 < c2.length; d2++) {
              var e2 = c2[d2], f2 = e2.getSnapshot;
              e2 = e2.value;
              try {
                if (!He(f2(), e2)) return false;
              } catch (g2) {
                return false;
              }
            }
          }
          c2 = b2.child;
          if (b2.subtreeFlags & 16384 && null !== c2) c2.return = b2, b2 = c2;
          else {
            if (b2 === a2) break;
            for (; null === b2.sibling; ) {
              if (null === b2.return || b2.return === a2) return true;
              b2 = b2.return;
            }
            b2.sibling.return = b2.return;
            b2 = b2.sibling;
          }
        }
        return true;
      }
      function Ck(a2, b2) {
        b2 &= ~rk;
        b2 &= ~qk;
        a2.suspendedLanes |= b2;
        a2.pingedLanes &= ~b2;
        for (a2 = a2.expirationTimes; 0 < b2; ) {
          var c2 = 31 - oc(b2), d2 = 1 << c2;
          a2[c2] = -1;
          b2 &= ~d2;
        }
      }
      function Ek(a2) {
        if (0 !== (K2 & 6)) throw Error(p2(327));
        Hk();
        var b2 = uc(a2, 0);
        if (0 === (b2 & 1)) return Dk(a2, B2()), null;
        var c2 = Ik(a2, b2);
        if (0 !== a2.tag && 2 === c2) {
          var d2 = xc(a2);
          0 !== d2 && (b2 = d2, c2 = Nk(a2, d2));
        }
        if (1 === c2) throw c2 = pk, Kk(a2, 0), Ck(a2, b2), Dk(a2, B2()), c2;
        if (6 === c2) throw Error(p2(345));
        a2.finishedWork = a2.current.alternate;
        a2.finishedLanes = b2;
        Pk(a2, tk, uk);
        Dk(a2, B2());
        return null;
      }
      function Qk(a2, b2) {
        var c2 = K2;
        K2 |= 1;
        try {
          return a2(b2);
        } finally {
          K2 = c2, 0 === K2 && (Gj = B2() + 500, fg && jg());
        }
      }
      function Rk(a2) {
        null !== wk && 0 === wk.tag && 0 === (K2 & 6) && Hk();
        var b2 = K2;
        K2 |= 1;
        var c2 = ok.transition, d2 = C2;
        try {
          if (ok.transition = null, C2 = 1, a2) return a2();
        } finally {
          C2 = d2, ok.transition = c2, K2 = b2, 0 === (K2 & 6) && jg();
        }
      }
      function Hj() {
        fj = ej.current;
        E2(ej);
      }
      function Kk(a2, b2) {
        a2.finishedWork = null;
        a2.finishedLanes = 0;
        var c2 = a2.timeoutHandle;
        -1 !== c2 && (a2.timeoutHandle = -1, Gf(c2));
        if (null !== Y2) for (c2 = Y2.return; null !== c2; ) {
          var d2 = c2;
          wg(d2);
          switch (d2.tag) {
            case 1:
              d2 = d2.type.childContextTypes;
              null !== d2 && void 0 !== d2 && $f();
              break;
            case 3:
              zh();
              E2(Wf);
              E2(H3);
              Eh();
              break;
            case 5:
              Bh(d2);
              break;
            case 4:
              zh();
              break;
            case 13:
              E2(L2);
              break;
            case 19:
              E2(L2);
              break;
            case 10:
              ah(d2.type._context);
              break;
            case 22:
            case 23:
              Hj();
          }
          c2 = c2.return;
        }
        Q2 = a2;
        Y2 = a2 = Pg(a2.current, null);
        Z2 = fj = b2;
        T2 = 0;
        pk = null;
        rk = qk = rh = 0;
        tk = sk = null;
        if (null !== fh) {
          for (b2 = 0; b2 < fh.length; b2++) if (c2 = fh[b2], d2 = c2.interleaved, null !== d2) {
            c2.interleaved = null;
            var e2 = d2.next, f2 = c2.pending;
            if (null !== f2) {
              var g2 = f2.next;
              f2.next = e2;
              d2.next = g2;
            }
            c2.pending = d2;
          }
          fh = null;
        }
        return a2;
      }
      function Mk(a2, b2) {
        do {
          var c2 = Y2;
          try {
            $g();
            Fh.current = Rh;
            if (Ih) {
              for (var d2 = M2.memoizedState; null !== d2; ) {
                var e2 = d2.queue;
                null !== e2 && (e2.pending = null);
                d2 = d2.next;
              }
              Ih = false;
            }
            Hh = 0;
            O2 = N2 = M2 = null;
            Jh = false;
            Kh = 0;
            nk.current = null;
            if (null === c2 || null === c2.return) {
              T2 = 1;
              pk = b2;
              Y2 = null;
              break;
            }
            a: {
              var f2 = a2, g2 = c2.return, h2 = c2, k2 = b2;
              b2 = Z2;
              h2.flags |= 32768;
              if (null !== k2 && "object" === typeof k2 && "function" === typeof k2.then) {
                var l2 = k2, m2 = h2, q2 = m2.tag;
                if (0 === (m2.mode & 1) && (0 === q2 || 11 === q2 || 15 === q2)) {
                  var r2 = m2.alternate;
                  r2 ? (m2.updateQueue = r2.updateQueue, m2.memoizedState = r2.memoizedState, m2.lanes = r2.lanes) : (m2.updateQueue = null, m2.memoizedState = null);
                }
                var y2 = Ui(g2);
                if (null !== y2) {
                  y2.flags &= -257;
                  Vi(y2, g2, h2, f2, b2);
                  y2.mode & 1 && Si(f2, l2, b2);
                  b2 = y2;
                  k2 = l2;
                  var n2 = b2.updateQueue;
                  if (null === n2) {
                    var t2 = /* @__PURE__ */ new Set();
                    t2.add(k2);
                    b2.updateQueue = t2;
                  } else n2.add(k2);
                  break a;
                } else {
                  if (0 === (b2 & 1)) {
                    Si(f2, l2, b2);
                    tj();
                    break a;
                  }
                  k2 = Error(p2(426));
                }
              } else if (I2 && h2.mode & 1) {
                var J2 = Ui(g2);
                if (null !== J2) {
                  0 === (J2.flags & 65536) && (J2.flags |= 256);
                  Vi(J2, g2, h2, f2, b2);
                  Jg(Ji(k2, h2));
                  break a;
                }
              }
              f2 = k2 = Ji(k2, h2);
              4 !== T2 && (T2 = 2);
              null === sk ? sk = [f2] : sk.push(f2);
              f2 = g2;
              do {
                switch (f2.tag) {
                  case 3:
                    f2.flags |= 65536;
                    b2 &= -b2;
                    f2.lanes |= b2;
                    var x2 = Ni(f2, k2, b2);
                    ph(f2, x2);
                    break a;
                  case 1:
                    h2 = k2;
                    var w2 = f2.type, u2 = f2.stateNode;
                    if (0 === (f2.flags & 128) && ("function" === typeof w2.getDerivedStateFromError || null !== u2 && "function" === typeof u2.componentDidCatch && (null === Ri || !Ri.has(u2)))) {
                      f2.flags |= 65536;
                      b2 &= -b2;
                      f2.lanes |= b2;
                      var F2 = Qi(f2, h2, b2);
                      ph(f2, F2);
                      break a;
                    }
                }
                f2 = f2.return;
              } while (null !== f2);
            }
            Sk(c2);
          } catch (na) {
            b2 = na;
            Y2 === c2 && null !== c2 && (Y2 = c2 = c2.return);
            continue;
          }
          break;
        } while (1);
      }
      function Jk() {
        var a2 = mk.current;
        mk.current = Rh;
        return null === a2 ? Rh : a2;
      }
      function tj() {
        if (0 === T2 || 3 === T2 || 2 === T2) T2 = 4;
        null === Q2 || 0 === (rh & 268435455) && 0 === (qk & 268435455) || Ck(Q2, Z2);
      }
      function Ik(a2, b2) {
        var c2 = K2;
        K2 |= 2;
        var d2 = Jk();
        if (Q2 !== a2 || Z2 !== b2) uk = null, Kk(a2, b2);
        do
          try {
            Tk();
            break;
          } catch (e2) {
            Mk(a2, e2);
          }
        while (1);
        $g();
        K2 = c2;
        mk.current = d2;
        if (null !== Y2) throw Error(p2(261));
        Q2 = null;
        Z2 = 0;
        return T2;
      }
      function Tk() {
        for (; null !== Y2; ) Uk(Y2);
      }
      function Lk() {
        for (; null !== Y2 && !cc(); ) Uk(Y2);
      }
      function Uk(a2) {
        var b2 = Vk(a2.alternate, a2, fj);
        a2.memoizedProps = a2.pendingProps;
        null === b2 ? Sk(a2) : Y2 = b2;
        nk.current = null;
      }
      function Sk(a2) {
        var b2 = a2;
        do {
          var c2 = b2.alternate;
          a2 = b2.return;
          if (0 === (b2.flags & 32768)) {
            if (c2 = Ej(c2, b2, fj), null !== c2) {
              Y2 = c2;
              return;
            }
          } else {
            c2 = Ij(c2, b2);
            if (null !== c2) {
              c2.flags &= 32767;
              Y2 = c2;
              return;
            }
            if (null !== a2) a2.flags |= 32768, a2.subtreeFlags = 0, a2.deletions = null;
            else {
              T2 = 6;
              Y2 = null;
              return;
            }
          }
          b2 = b2.sibling;
          if (null !== b2) {
            Y2 = b2;
            return;
          }
          Y2 = b2 = a2;
        } while (null !== b2);
        0 === T2 && (T2 = 5);
      }
      function Pk(a2, b2, c2) {
        var d2 = C2, e2 = ok.transition;
        try {
          ok.transition = null, C2 = 1, Wk(a2, b2, c2, d2);
        } finally {
          ok.transition = e2, C2 = d2;
        }
        return null;
      }
      function Wk(a2, b2, c2, d2) {
        do
          Hk();
        while (null !== wk);
        if (0 !== (K2 & 6)) throw Error(p2(327));
        c2 = a2.finishedWork;
        var e2 = a2.finishedLanes;
        if (null === c2) return null;
        a2.finishedWork = null;
        a2.finishedLanes = 0;
        if (c2 === a2.current) throw Error(p2(177));
        a2.callbackNode = null;
        a2.callbackPriority = 0;
        var f2 = c2.lanes | c2.childLanes;
        Bc(a2, f2);
        a2 === Q2 && (Y2 = Q2 = null, Z2 = 0);
        0 === (c2.subtreeFlags & 2064) && 0 === (c2.flags & 2064) || vk || (vk = true, Fk(hc, function() {
          Hk();
          return null;
        }));
        f2 = 0 !== (c2.flags & 15990);
        if (0 !== (c2.subtreeFlags & 15990) || f2) {
          f2 = ok.transition;
          ok.transition = null;
          var g2 = C2;
          C2 = 1;
          var h2 = K2;
          K2 |= 4;
          nk.current = null;
          Oj(a2, c2);
          dk(c2, a2);
          Oe(Df);
          dd = !!Cf;
          Df = Cf = null;
          a2.current = c2;
          hk(c2, a2, e2);
          dc();
          K2 = h2;
          C2 = g2;
          ok.transition = f2;
        } else a2.current = c2;
        vk && (vk = false, wk = a2, xk = e2);
        f2 = a2.pendingLanes;
        0 === f2 && (Ri = null);
        mc(c2.stateNode, d2);
        Dk(a2, B2());
        if (null !== b2) for (d2 = a2.onRecoverableError, c2 = 0; c2 < b2.length; c2++) e2 = b2[c2], d2(e2.value, { componentStack: e2.stack, digest: e2.digest });
        if (Oi) throw Oi = false, a2 = Pi, Pi = null, a2;
        0 !== (xk & 1) && 0 !== a2.tag && Hk();
        f2 = a2.pendingLanes;
        0 !== (f2 & 1) ? a2 === zk ? yk++ : (yk = 0, zk = a2) : yk = 0;
        jg();
        return null;
      }
      function Hk() {
        if (null !== wk) {
          var a2 = Dc(xk), b2 = ok.transition, c2 = C2;
          try {
            ok.transition = null;
            C2 = 16 > a2 ? 16 : a2;
            if (null === wk) var d2 = false;
            else {
              a2 = wk;
              wk = null;
              xk = 0;
              if (0 !== (K2 & 6)) throw Error(p2(331));
              var e2 = K2;
              K2 |= 4;
              for (V2 = a2.current; null !== V2; ) {
                var f2 = V2, g2 = f2.child;
                if (0 !== (V2.flags & 16)) {
                  var h2 = f2.deletions;
                  if (null !== h2) {
                    for (var k2 = 0; k2 < h2.length; k2++) {
                      var l2 = h2[k2];
                      for (V2 = l2; null !== V2; ) {
                        var m2 = V2;
                        switch (m2.tag) {
                          case 0:
                          case 11:
                          case 15:
                            Pj(8, m2, f2);
                        }
                        var q2 = m2.child;
                        if (null !== q2) q2.return = m2, V2 = q2;
                        else for (; null !== V2; ) {
                          m2 = V2;
                          var r2 = m2.sibling, y2 = m2.return;
                          Sj(m2);
                          if (m2 === l2) {
                            V2 = null;
                            break;
                          }
                          if (null !== r2) {
                            r2.return = y2;
                            V2 = r2;
                            break;
                          }
                          V2 = y2;
                        }
                      }
                    }
                    var n2 = f2.alternate;
                    if (null !== n2) {
                      var t2 = n2.child;
                      if (null !== t2) {
                        n2.child = null;
                        do {
                          var J2 = t2.sibling;
                          t2.sibling = null;
                          t2 = J2;
                        } while (null !== t2);
                      }
                    }
                    V2 = f2;
                  }
                }
                if (0 !== (f2.subtreeFlags & 2064) && null !== g2) g2.return = f2, V2 = g2;
                else b: for (; null !== V2; ) {
                  f2 = V2;
                  if (0 !== (f2.flags & 2048)) switch (f2.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Pj(9, f2, f2.return);
                  }
                  var x2 = f2.sibling;
                  if (null !== x2) {
                    x2.return = f2.return;
                    V2 = x2;
                    break b;
                  }
                  V2 = f2.return;
                }
              }
              var w2 = a2.current;
              for (V2 = w2; null !== V2; ) {
                g2 = V2;
                var u2 = g2.child;
                if (0 !== (g2.subtreeFlags & 2064) && null !== u2) u2.return = g2, V2 = u2;
                else b: for (g2 = w2; null !== V2; ) {
                  h2 = V2;
                  if (0 !== (h2.flags & 2048)) try {
                    switch (h2.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Qj(9, h2);
                    }
                  } catch (na) {
                    W2(h2, h2.return, na);
                  }
                  if (h2 === g2) {
                    V2 = null;
                    break b;
                  }
                  var F2 = h2.sibling;
                  if (null !== F2) {
                    F2.return = h2.return;
                    V2 = F2;
                    break b;
                  }
                  V2 = h2.return;
                }
              }
              K2 = e2;
              jg();
              if (lc && "function" === typeof lc.onPostCommitFiberRoot) try {
                lc.onPostCommitFiberRoot(kc, a2);
              } catch (na) {
              }
              d2 = true;
            }
            return d2;
          } finally {
            C2 = c2, ok.transition = b2;
          }
        }
        return false;
      }
      function Xk(a2, b2, c2) {
        b2 = Ji(c2, b2);
        b2 = Ni(a2, b2, 1);
        a2 = nh(a2, b2, 1);
        b2 = R2();
        null !== a2 && (Ac(a2, 1, b2), Dk(a2, b2));
      }
      function W2(a2, b2, c2) {
        if (3 === a2.tag) Xk(a2, a2, c2);
        else for (; null !== b2; ) {
          if (3 === b2.tag) {
            Xk(b2, a2, c2);
            break;
          } else if (1 === b2.tag) {
            var d2 = b2.stateNode;
            if ("function" === typeof b2.type.getDerivedStateFromError || "function" === typeof d2.componentDidCatch && (null === Ri || !Ri.has(d2))) {
              a2 = Ji(c2, a2);
              a2 = Qi(b2, a2, 1);
              b2 = nh(b2, a2, 1);
              a2 = R2();
              null !== b2 && (Ac(b2, 1, a2), Dk(b2, a2));
              break;
            }
          }
          b2 = b2.return;
        }
      }
      function Ti(a2, b2, c2) {
        var d2 = a2.pingCache;
        null !== d2 && d2.delete(b2);
        b2 = R2();
        a2.pingedLanes |= a2.suspendedLanes & c2;
        Q2 === a2 && (Z2 & c2) === c2 && (4 === T2 || 3 === T2 && (Z2 & 130023424) === Z2 && 500 > B2() - fk ? Kk(a2, 0) : rk |= c2);
        Dk(a2, b2);
      }
      function Yk(a2, b2) {
        0 === b2 && (0 === (a2.mode & 1) ? b2 = 1 : (b2 = sc, sc <<= 1, 0 === (sc & 130023424) && (sc = 4194304)));
        var c2 = R2();
        a2 = ih(a2, b2);
        null !== a2 && (Ac(a2, b2, c2), Dk(a2, c2));
      }
      function uj(a2) {
        var b2 = a2.memoizedState, c2 = 0;
        null !== b2 && (c2 = b2.retryLane);
        Yk(a2, c2);
      }
      function bk(a2, b2) {
        var c2 = 0;
        switch (a2.tag) {
          case 13:
            var d2 = a2.stateNode;
            var e2 = a2.memoizedState;
            null !== e2 && (c2 = e2.retryLane);
            break;
          case 19:
            d2 = a2.stateNode;
            break;
          default:
            throw Error(p2(314));
        }
        null !== d2 && d2.delete(b2);
        Yk(a2, c2);
      }
      var Vk;
      Vk = function(a2, b2, c2) {
        if (null !== a2) if (a2.memoizedProps !== b2.pendingProps || Wf.current) dh = true;
        else {
          if (0 === (a2.lanes & c2) && 0 === (b2.flags & 128)) return dh = false, yj(a2, b2, c2);
          dh = 0 !== (a2.flags & 131072) ? true : false;
        }
        else dh = false, I2 && 0 !== (b2.flags & 1048576) && ug(b2, ng, b2.index);
        b2.lanes = 0;
        switch (b2.tag) {
          case 2:
            var d2 = b2.type;
            ij(a2, b2);
            a2 = b2.pendingProps;
            var e2 = Yf(b2, H3.current);
            ch(b2, c2);
            e2 = Nh(null, b2, d2, a2, e2, c2);
            var f2 = Sh();
            b2.flags |= 1;
            "object" === typeof e2 && null !== e2 && "function" === typeof e2.render && void 0 === e2.$$typeof ? (b2.tag = 1, b2.memoizedState = null, b2.updateQueue = null, Zf(d2) ? (f2 = true, cg(b2)) : f2 = false, b2.memoizedState = null !== e2.state && void 0 !== e2.state ? e2.state : null, kh(b2), e2.updater = Ei, b2.stateNode = e2, e2._reactInternals = b2, Ii(b2, d2, a2, c2), b2 = jj(null, b2, d2, true, f2, c2)) : (b2.tag = 0, I2 && f2 && vg(b2), Xi(null, b2, e2, c2), b2 = b2.child);
            return b2;
          case 16:
            d2 = b2.elementType;
            a: {
              ij(a2, b2);
              a2 = b2.pendingProps;
              e2 = d2._init;
              d2 = e2(d2._payload);
              b2.type = d2;
              e2 = b2.tag = Zk(d2);
              a2 = Ci(d2, a2);
              switch (e2) {
                case 0:
                  b2 = cj(null, b2, d2, a2, c2);
                  break a;
                case 1:
                  b2 = hj(null, b2, d2, a2, c2);
                  break a;
                case 11:
                  b2 = Yi(null, b2, d2, a2, c2);
                  break a;
                case 14:
                  b2 = $i(null, b2, d2, Ci(d2.type, a2), c2);
                  break a;
              }
              throw Error(p2(
                306,
                d2,
                ""
              ));
            }
            return b2;
          case 0:
            return d2 = b2.type, e2 = b2.pendingProps, e2 = b2.elementType === d2 ? e2 : Ci(d2, e2), cj(a2, b2, d2, e2, c2);
          case 1:
            return d2 = b2.type, e2 = b2.pendingProps, e2 = b2.elementType === d2 ? e2 : Ci(d2, e2), hj(a2, b2, d2, e2, c2);
          case 3:
            a: {
              kj(b2);
              if (null === a2) throw Error(p2(387));
              d2 = b2.pendingProps;
              f2 = b2.memoizedState;
              e2 = f2.element;
              lh(a2, b2);
              qh(b2, d2, null, c2);
              var g2 = b2.memoizedState;
              d2 = g2.element;
              if (f2.isDehydrated) if (f2 = { element: d2, isDehydrated: false, cache: g2.cache, pendingSuspenseBoundaries: g2.pendingSuspenseBoundaries, transitions: g2.transitions }, b2.updateQueue.baseState = f2, b2.memoizedState = f2, b2.flags & 256) {
                e2 = Ji(Error(p2(423)), b2);
                b2 = lj(a2, b2, d2, c2, e2);
                break a;
              } else if (d2 !== e2) {
                e2 = Ji(Error(p2(424)), b2);
                b2 = lj(a2, b2, d2, c2, e2);
                break a;
              } else for (yg = Lf(b2.stateNode.containerInfo.firstChild), xg = b2, I2 = true, zg = null, c2 = Vg(b2, null, d2, c2), b2.child = c2; c2; ) c2.flags = c2.flags & -3 | 4096, c2 = c2.sibling;
              else {
                Ig();
                if (d2 === e2) {
                  b2 = Zi(a2, b2, c2);
                  break a;
                }
                Xi(a2, b2, d2, c2);
              }
              b2 = b2.child;
            }
            return b2;
          case 5:
            return Ah(b2), null === a2 && Eg(b2), d2 = b2.type, e2 = b2.pendingProps, f2 = null !== a2 ? a2.memoizedProps : null, g2 = e2.children, Ef(d2, e2) ? g2 = null : null !== f2 && Ef(d2, f2) && (b2.flags |= 32), gj(a2, b2), Xi(a2, b2, g2, c2), b2.child;
          case 6:
            return null === a2 && Eg(b2), null;
          case 13:
            return oj(a2, b2, c2);
          case 4:
            return yh(b2, b2.stateNode.containerInfo), d2 = b2.pendingProps, null === a2 ? b2.child = Ug(b2, null, d2, c2) : Xi(a2, b2, d2, c2), b2.child;
          case 11:
            return d2 = b2.type, e2 = b2.pendingProps, e2 = b2.elementType === d2 ? e2 : Ci(d2, e2), Yi(a2, b2, d2, e2, c2);
          case 7:
            return Xi(a2, b2, b2.pendingProps, c2), b2.child;
          case 8:
            return Xi(a2, b2, b2.pendingProps.children, c2), b2.child;
          case 12:
            return Xi(a2, b2, b2.pendingProps.children, c2), b2.child;
          case 10:
            a: {
              d2 = b2.type._context;
              e2 = b2.pendingProps;
              f2 = b2.memoizedProps;
              g2 = e2.value;
              G2(Wg, d2._currentValue);
              d2._currentValue = g2;
              if (null !== f2) if (He(f2.value, g2)) {
                if (f2.children === e2.children && !Wf.current) {
                  b2 = Zi(a2, b2, c2);
                  break a;
                }
              } else for (f2 = b2.child, null !== f2 && (f2.return = b2); null !== f2; ) {
                var h2 = f2.dependencies;
                if (null !== h2) {
                  g2 = f2.child;
                  for (var k2 = h2.firstContext; null !== k2; ) {
                    if (k2.context === d2) {
                      if (1 === f2.tag) {
                        k2 = mh(-1, c2 & -c2);
                        k2.tag = 2;
                        var l2 = f2.updateQueue;
                        if (null !== l2) {
                          l2 = l2.shared;
                          var m2 = l2.pending;
                          null === m2 ? k2.next = k2 : (k2.next = m2.next, m2.next = k2);
                          l2.pending = k2;
                        }
                      }
                      f2.lanes |= c2;
                      k2 = f2.alternate;
                      null !== k2 && (k2.lanes |= c2);
                      bh(
                        f2.return,
                        c2,
                        b2
                      );
                      h2.lanes |= c2;
                      break;
                    }
                    k2 = k2.next;
                  }
                } else if (10 === f2.tag) g2 = f2.type === b2.type ? null : f2.child;
                else if (18 === f2.tag) {
                  g2 = f2.return;
                  if (null === g2) throw Error(p2(341));
                  g2.lanes |= c2;
                  h2 = g2.alternate;
                  null !== h2 && (h2.lanes |= c2);
                  bh(g2, c2, b2);
                  g2 = f2.sibling;
                } else g2 = f2.child;
                if (null !== g2) g2.return = f2;
                else for (g2 = f2; null !== g2; ) {
                  if (g2 === b2) {
                    g2 = null;
                    break;
                  }
                  f2 = g2.sibling;
                  if (null !== f2) {
                    f2.return = g2.return;
                    g2 = f2;
                    break;
                  }
                  g2 = g2.return;
                }
                f2 = g2;
              }
              Xi(a2, b2, e2.children, c2);
              b2 = b2.child;
            }
            return b2;
          case 9:
            return e2 = b2.type, d2 = b2.pendingProps.children, ch(b2, c2), e2 = eh(e2), d2 = d2(e2), b2.flags |= 1, Xi(a2, b2, d2, c2), b2.child;
          case 14:
            return d2 = b2.type, e2 = Ci(d2, b2.pendingProps), e2 = Ci(d2.type, e2), $i(a2, b2, d2, e2, c2);
          case 15:
            return bj(a2, b2, b2.type, b2.pendingProps, c2);
          case 17:
            return d2 = b2.type, e2 = b2.pendingProps, e2 = b2.elementType === d2 ? e2 : Ci(d2, e2), ij(a2, b2), b2.tag = 1, Zf(d2) ? (a2 = true, cg(b2)) : a2 = false, ch(b2, c2), Gi(b2, d2, e2), Ii(b2, d2, e2, c2), jj(null, b2, d2, true, a2, c2);
          case 19:
            return xj(a2, b2, c2);
          case 22:
            return dj(a2, b2, c2);
        }
        throw Error(p2(156, b2.tag));
      };
      function Fk(a2, b2) {
        return ac(a2, b2);
      }
      function $k(a2, b2, c2, d2) {
        this.tag = a2;
        this.key = c2;
        this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
        this.index = 0;
        this.ref = null;
        this.pendingProps = b2;
        this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
        this.mode = d2;
        this.subtreeFlags = this.flags = 0;
        this.deletions = null;
        this.childLanes = this.lanes = 0;
        this.alternate = null;
      }
      function Bg(a2, b2, c2, d2) {
        return new $k(a2, b2, c2, d2);
      }
      function aj(a2) {
        a2 = a2.prototype;
        return !(!a2 || !a2.isReactComponent);
      }
      function Zk(a2) {
        if ("function" === typeof a2) return aj(a2) ? 1 : 0;
        if (void 0 !== a2 && null !== a2) {
          a2 = a2.$$typeof;
          if (a2 === Da) return 11;
          if (a2 === Ga) return 14;
        }
        return 2;
      }
      function Pg(a2, b2) {
        var c2 = a2.alternate;
        null === c2 ? (c2 = Bg(a2.tag, b2, a2.key, a2.mode), c2.elementType = a2.elementType, c2.type = a2.type, c2.stateNode = a2.stateNode, c2.alternate = a2, a2.alternate = c2) : (c2.pendingProps = b2, c2.type = a2.type, c2.flags = 0, c2.subtreeFlags = 0, c2.deletions = null);
        c2.flags = a2.flags & 14680064;
        c2.childLanes = a2.childLanes;
        c2.lanes = a2.lanes;
        c2.child = a2.child;
        c2.memoizedProps = a2.memoizedProps;
        c2.memoizedState = a2.memoizedState;
        c2.updateQueue = a2.updateQueue;
        b2 = a2.dependencies;
        c2.dependencies = null === b2 ? null : { lanes: b2.lanes, firstContext: b2.firstContext };
        c2.sibling = a2.sibling;
        c2.index = a2.index;
        c2.ref = a2.ref;
        return c2;
      }
      function Rg(a2, b2, c2, d2, e2, f2) {
        var g2 = 2;
        d2 = a2;
        if ("function" === typeof a2) aj(a2) && (g2 = 1);
        else if ("string" === typeof a2) g2 = 5;
        else a: switch (a2) {
          case ya:
            return Tg(c2.children, e2, f2, b2);
          case za:
            g2 = 8;
            e2 |= 8;
            break;
          case Aa:
            return a2 = Bg(12, c2, b2, e2 | 2), a2.elementType = Aa, a2.lanes = f2, a2;
          case Ea:
            return a2 = Bg(13, c2, b2, e2), a2.elementType = Ea, a2.lanes = f2, a2;
          case Fa:
            return a2 = Bg(19, c2, b2, e2), a2.elementType = Fa, a2.lanes = f2, a2;
          case Ia:
            return pj(c2, e2, f2, b2);
          default:
            if ("object" === typeof a2 && null !== a2) switch (a2.$$typeof) {
              case Ba:
                g2 = 10;
                break a;
              case Ca:
                g2 = 9;
                break a;
              case Da:
                g2 = 11;
                break a;
              case Ga:
                g2 = 14;
                break a;
              case Ha:
                g2 = 16;
                d2 = null;
                break a;
            }
            throw Error(p2(130, null == a2 ? a2 : typeof a2, ""));
        }
        b2 = Bg(g2, c2, b2, e2);
        b2.elementType = a2;
        b2.type = d2;
        b2.lanes = f2;
        return b2;
      }
      function Tg(a2, b2, c2, d2) {
        a2 = Bg(7, a2, d2, b2);
        a2.lanes = c2;
        return a2;
      }
      function pj(a2, b2, c2, d2) {
        a2 = Bg(22, a2, d2, b2);
        a2.elementType = Ia;
        a2.lanes = c2;
        a2.stateNode = { isHidden: false };
        return a2;
      }
      function Qg(a2, b2, c2) {
        a2 = Bg(6, a2, null, b2);
        a2.lanes = c2;
        return a2;
      }
      function Sg(a2, b2, c2) {
        b2 = Bg(4, null !== a2.children ? a2.children : [], a2.key, b2);
        b2.lanes = c2;
        b2.stateNode = { containerInfo: a2.containerInfo, pendingChildren: null, implementation: a2.implementation };
        return b2;
      }
      function al(a2, b2, c2, d2, e2) {
        this.tag = b2;
        this.containerInfo = a2;
        this.finishedWork = this.pingCache = this.current = this.pendingChildren = null;
        this.timeoutHandle = -1;
        this.callbackNode = this.pendingContext = this.context = null;
        this.callbackPriority = 0;
        this.eventTimes = zc(0);
        this.expirationTimes = zc(-1);
        this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
        this.entanglements = zc(0);
        this.identifierPrefix = d2;
        this.onRecoverableError = e2;
        this.mutableSourceEagerHydrationData = null;
      }
      function bl(a2, b2, c2, d2, e2, f2, g2, h2, k2) {
        a2 = new al(a2, b2, c2, h2, k2);
        1 === b2 ? (b2 = 1, true === f2 && (b2 |= 8)) : b2 = 0;
        f2 = Bg(3, null, null, b2);
        a2.current = f2;
        f2.stateNode = a2;
        f2.memoizedState = { element: d2, isDehydrated: c2, cache: null, transitions: null, pendingSuspenseBoundaries: null };
        kh(f2);
        return a2;
      }
      function cl(a2, b2, c2) {
        var d2 = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
        return { $$typeof: wa, key: null == d2 ? null : "" + d2, children: a2, containerInfo: b2, implementation: c2 };
      }
      function dl(a2) {
        if (!a2) return Vf;
        a2 = a2._reactInternals;
        a: {
          if (Vb(a2) !== a2 || 1 !== a2.tag) throw Error(p2(170));
          var b2 = a2;
          do {
            switch (b2.tag) {
              case 3:
                b2 = b2.stateNode.context;
                break a;
              case 1:
                if (Zf(b2.type)) {
                  b2 = b2.stateNode.__reactInternalMemoizedMergedChildContext;
                  break a;
                }
            }
            b2 = b2.return;
          } while (null !== b2);
          throw Error(p2(171));
        }
        if (1 === a2.tag) {
          var c2 = a2.type;
          if (Zf(c2)) return bg(a2, c2, b2);
        }
        return b2;
      }
      function el(a2, b2, c2, d2, e2, f2, g2, h2, k2) {
        a2 = bl(c2, d2, true, a2, e2, f2, g2, h2, k2);
        a2.context = dl(null);
        c2 = a2.current;
        d2 = R2();
        e2 = yi(c2);
        f2 = mh(d2, e2);
        f2.callback = void 0 !== b2 && null !== b2 ? b2 : null;
        nh(c2, f2, e2);
        a2.current.lanes = e2;
        Ac(a2, e2, d2);
        Dk(a2, d2);
        return a2;
      }
      function fl(a2, b2, c2, d2) {
        var e2 = b2.current, f2 = R2(), g2 = yi(e2);
        c2 = dl(c2);
        null === b2.context ? b2.context = c2 : b2.pendingContext = c2;
        b2 = mh(f2, g2);
        b2.payload = { element: a2 };
        d2 = void 0 === d2 ? null : d2;
        null !== d2 && (b2.callback = d2);
        a2 = nh(e2, b2, g2);
        null !== a2 && (gi(a2, e2, g2, f2), oh(a2, e2, g2));
        return g2;
      }
      function gl(a2) {
        a2 = a2.current;
        if (!a2.child) return null;
        switch (a2.child.tag) {
          case 5:
            return a2.child.stateNode;
          default:
            return a2.child.stateNode;
        }
      }
      function hl(a2, b2) {
        a2 = a2.memoizedState;
        if (null !== a2 && null !== a2.dehydrated) {
          var c2 = a2.retryLane;
          a2.retryLane = 0 !== c2 && c2 < b2 ? c2 : b2;
        }
      }
      function il(a2, b2) {
        hl(a2, b2);
        (a2 = a2.alternate) && hl(a2, b2);
      }
      function jl() {
        return null;
      }
      var kl = "function" === typeof reportError ? reportError : function(a2) {
        console.error(a2);
      };
      function ll(a2) {
        this._internalRoot = a2;
      }
      ml.prototype.render = ll.prototype.render = function(a2) {
        var b2 = this._internalRoot;
        if (null === b2) throw Error(p2(409));
        fl(a2, b2, null, null);
      };
      ml.prototype.unmount = ll.prototype.unmount = function() {
        var a2 = this._internalRoot;
        if (null !== a2) {
          this._internalRoot = null;
          var b2 = a2.containerInfo;
          Rk(function() {
            fl(null, a2, null, null);
          });
          b2[uf] = null;
        }
      };
      function ml(a2) {
        this._internalRoot = a2;
      }
      ml.prototype.unstable_scheduleHydration = function(a2) {
        if (a2) {
          var b2 = Hc();
          a2 = { blockedOn: null, target: a2, priority: b2 };
          for (var c2 = 0; c2 < Qc.length && 0 !== b2 && b2 < Qc[c2].priority; c2++) ;
          Qc.splice(c2, 0, a2);
          0 === c2 && Vc(a2);
        }
      };
      function nl(a2) {
        return !(!a2 || 1 !== a2.nodeType && 9 !== a2.nodeType && 11 !== a2.nodeType);
      }
      function ol(a2) {
        return !(!a2 || 1 !== a2.nodeType && 9 !== a2.nodeType && 11 !== a2.nodeType && (8 !== a2.nodeType || " react-mount-point-unstable " !== a2.nodeValue));
      }
      function pl() {
      }
      function ql(a2, b2, c2, d2, e2) {
        if (e2) {
          if ("function" === typeof d2) {
            var f2 = d2;
            d2 = function() {
              var a3 = gl(g2);
              f2.call(a3);
            };
          }
          var g2 = el(b2, d2, a2, 0, null, false, false, "", pl);
          a2._reactRootContainer = g2;
          a2[uf] = g2.current;
          sf(8 === a2.nodeType ? a2.parentNode : a2);
          Rk();
          return g2;
        }
        for (; e2 = a2.lastChild; ) a2.removeChild(e2);
        if ("function" === typeof d2) {
          var h2 = d2;
          d2 = function() {
            var a3 = gl(k2);
            h2.call(a3);
          };
        }
        var k2 = bl(a2, 0, false, null, null, false, false, "", pl);
        a2._reactRootContainer = k2;
        a2[uf] = k2.current;
        sf(8 === a2.nodeType ? a2.parentNode : a2);
        Rk(function() {
          fl(b2, k2, c2, d2);
        });
        return k2;
      }
      function rl(a2, b2, c2, d2, e2) {
        var f2 = c2._reactRootContainer;
        if (f2) {
          var g2 = f2;
          if ("function" === typeof e2) {
            var h2 = e2;
            e2 = function() {
              var a3 = gl(g2);
              h2.call(a3);
            };
          }
          fl(b2, g2, a2, e2);
        } else g2 = ql(c2, b2, a2, e2, d2);
        return gl(g2);
      }
      Ec = function(a2) {
        switch (a2.tag) {
          case 3:
            var b2 = a2.stateNode;
            if (b2.current.memoizedState.isDehydrated) {
              var c2 = tc(b2.pendingLanes);
              0 !== c2 && (Cc(b2, c2 | 1), Dk(b2, B2()), 0 === (K2 & 6) && (Gj = B2() + 500, jg()));
            }
            break;
          case 13:
            Rk(function() {
              var b3 = ih(a2, 1);
              if (null !== b3) {
                var c3 = R2();
                gi(b3, a2, 1, c3);
              }
            }), il(a2, 1);
        }
      };
      Fc = function(a2) {
        if (13 === a2.tag) {
          var b2 = ih(a2, 134217728);
          if (null !== b2) {
            var c2 = R2();
            gi(b2, a2, 134217728, c2);
          }
          il(a2, 134217728);
        }
      };
      Gc = function(a2) {
        if (13 === a2.tag) {
          var b2 = yi(a2), c2 = ih(a2, b2);
          if (null !== c2) {
            var d2 = R2();
            gi(c2, a2, b2, d2);
          }
          il(a2, b2);
        }
      };
      Hc = function() {
        return C2;
      };
      Ic = function(a2, b2) {
        var c2 = C2;
        try {
          return C2 = a2, b2();
        } finally {
          C2 = c2;
        }
      };
      yb = function(a2, b2, c2) {
        switch (b2) {
          case "input":
            bb(a2, c2);
            b2 = c2.name;
            if ("radio" === c2.type && null != b2) {
              for (c2 = a2; c2.parentNode; ) c2 = c2.parentNode;
              c2 = c2.querySelectorAll("input[name=" + JSON.stringify("" + b2) + '][type="radio"]');
              for (b2 = 0; b2 < c2.length; b2++) {
                var d2 = c2[b2];
                if (d2 !== a2 && d2.form === a2.form) {
                  var e2 = Db(d2);
                  if (!e2) throw Error(p2(90));
                  Wa(d2);
                  bb(d2, e2);
                }
              }
            }
            break;
          case "textarea":
            ib(a2, c2);
            break;
          case "select":
            b2 = c2.value, null != b2 && fb(a2, !!c2.multiple, b2, false);
        }
      };
      Gb = Qk;
      Hb = Rk;
      var sl = { usingClientEntryPoint: false, Events: [Cb, ue2, Db, Eb, Fb, Qk] };
      var tl = { findFiberByHostInstance: Wc, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" };
      var ul = { bundleType: tl.bundleType, version: tl.version, rendererPackageName: tl.rendererPackageName, rendererConfig: tl.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ua.ReactCurrentDispatcher, findHostInstanceByFiber: function(a2) {
        a2 = Zb(a2);
        return null === a2 ? null : a2.stateNode;
      }, findFiberByHostInstance: tl.findFiberByHostInstance || jl, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
      if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
        vl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!vl.isDisabled && vl.supportsFiber) try {
          kc = vl.inject(ul), lc = vl;
        } catch (a2) {
        }
      }
      var vl;
      exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = sl;
      exports.createPortal = function(a2, b2) {
        var c2 = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : null;
        if (!nl(b2)) throw Error(p2(200));
        return cl(a2, b2, null, c2);
      };
      exports.createRoot = function(a2, b2) {
        if (!nl(a2)) throw Error(p2(299));
        var c2 = false, d2 = "", e2 = kl;
        null !== b2 && void 0 !== b2 && (true === b2.unstable_strictMode && (c2 = true), void 0 !== b2.identifierPrefix && (d2 = b2.identifierPrefix), void 0 !== b2.onRecoverableError && (e2 = b2.onRecoverableError));
        b2 = bl(a2, 1, false, null, null, c2, false, d2, e2);
        a2[uf] = b2.current;
        sf(8 === a2.nodeType ? a2.parentNode : a2);
        return new ll(b2);
      };
      exports.findDOMNode = function(a2) {
        if (null == a2) return null;
        if (1 === a2.nodeType) return a2;
        var b2 = a2._reactInternals;
        if (void 0 === b2) {
          if ("function" === typeof a2.render) throw Error(p2(188));
          a2 = Object.keys(a2).join(",");
          throw Error(p2(268, a2));
        }
        a2 = Zb(b2);
        a2 = null === a2 ? null : a2.stateNode;
        return a2;
      };
      exports.flushSync = function(a2) {
        return Rk(a2);
      };
      exports.hydrate = function(a2, b2, c2) {
        if (!ol(b2)) throw Error(p2(200));
        return rl(null, a2, b2, true, c2);
      };
      exports.hydrateRoot = function(a2, b2, c2) {
        if (!nl(a2)) throw Error(p2(405));
        var d2 = null != c2 && c2.hydratedSources || null, e2 = false, f2 = "", g2 = kl;
        null !== c2 && void 0 !== c2 && (true === c2.unstable_strictMode && (e2 = true), void 0 !== c2.identifierPrefix && (f2 = c2.identifierPrefix), void 0 !== c2.onRecoverableError && (g2 = c2.onRecoverableError));
        b2 = el(b2, null, a2, 1, null != c2 ? c2 : null, e2, false, f2, g2);
        a2[uf] = b2.current;
        sf(a2);
        if (d2) for (a2 = 0; a2 < d2.length; a2++) c2 = d2[a2], e2 = c2._getVersion, e2 = e2(c2._source), null == b2.mutableSourceEagerHydrationData ? b2.mutableSourceEagerHydrationData = [c2, e2] : b2.mutableSourceEagerHydrationData.push(
          c2,
          e2
        );
        return new ml(b2);
      };
      exports.render = function(a2, b2, c2) {
        if (!ol(b2)) throw Error(p2(200));
        return rl(null, a2, b2, false, c2);
      };
      exports.unmountComponentAtNode = function(a2) {
        if (!ol(a2)) throw Error(p2(40));
        return a2._reactRootContainer ? (Rk(function() {
          rl(null, null, a2, false, function() {
            a2._reactRootContainer = null;
            a2[uf] = null;
          });
        }), true) : false;
      };
      exports.unstable_batchedUpdates = Qk;
      exports.unstable_renderSubtreeIntoContainer = function(a2, b2, c2, d2) {
        if (!ol(c2)) throw Error(p2(200));
        if (null == a2 || void 0 === a2._reactInternals) throw Error(p2(38));
        return rl(a2, b2, c2, false, d2);
      };
      exports.version = "18.3.1-next-f1338f8080-20240426";
    }
  });

  // node_modules/react-dom/index.js
  var require_react_dom = __commonJS({
    "node_modules/react-dom/index.js"(exports, module) {
      "use strict";
      function checkDCE() {
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === "undefined" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== "function") {
          return;
        }
        if (false) {
          throw new Error("^_^");
        }
        try {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
        } catch (err) {
          console.error(err);
        }
      }
      if (true) {
        checkDCE();
        module.exports = require_react_dom_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // node_modules/react-dom/client.js
  var require_client = __commonJS({
    "node_modules/react-dom/client.js"(exports) {
      "use strict";
      var m2 = require_react_dom();
      if (true) {
        exports.createRoot = m2.createRoot;
        exports.hydrateRoot = m2.hydrateRoot;
      } else {
        i2 = m2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        exports.createRoot = function(c2, o2) {
          i2.usingClientEntryPoint = true;
          try {
            return m2.createRoot(c2, o2);
          } finally {
            i2.usingClientEntryPoint = false;
          }
        };
        exports.hydrateRoot = function(c2, h2, o2) {
          i2.usingClientEntryPoint = true;
          try {
            return m2.hydrateRoot(c2, h2, o2);
          } finally {
            i2.usingClientEntryPoint = false;
          }
        };
      }
      var i2;
    }
  });

  // node_modules/react/cjs/react-jsx-runtime.production.min.js
  var require_react_jsx_runtime_production_min = __commonJS({
    "node_modules/react/cjs/react-jsx-runtime.production.min.js"(exports) {
      "use strict";
      var f2 = require_react();
      var k2 = Symbol.for("react.element");
      var l2 = Symbol.for("react.fragment");
      var m2 = Object.prototype.hasOwnProperty;
      var n2 = f2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner;
      var p2 = { key: true, ref: true, __self: true, __source: true };
      function q2(c2, a2, g2) {
        var b2, d2 = {}, e2 = null, h2 = null;
        void 0 !== g2 && (e2 = "" + g2);
        void 0 !== a2.key && (e2 = "" + a2.key);
        void 0 !== a2.ref && (h2 = a2.ref);
        for (b2 in a2) m2.call(a2, b2) && !p2.hasOwnProperty(b2) && (d2[b2] = a2[b2]);
        if (c2 && c2.defaultProps) for (b2 in a2 = c2.defaultProps, a2) void 0 === d2[b2] && (d2[b2] = a2[b2]);
        return { $$typeof: k2, type: c2, key: e2, ref: h2, props: d2, _owner: n2.current };
      }
      exports.Fragment = l2;
      exports.jsx = q2;
      exports.jsxs = q2;
    }
  });

  // node_modules/react/jsx-runtime.js
  var require_jsx_runtime = __commonJS({
    "node_modules/react/jsx-runtime.js"(exports, module) {
      "use strict";
      if (true) {
        module.exports = require_react_jsx_runtime_production_min();
      } else {
        module.exports = null;
      }
    }
  });

  // renderer/react/index.jsx
  var import_client = __toESM(require_client());
  var import_react_dom = __toESM(require_react_dom());

  // renderer/react/Dashboard.jsx
  var import_react2 = __toESM(require_react());

  // renderer/react/hooks.js
  var import_react = __toESM(require_react());
  var H = () => window.MC;
  function useEscape(onClose) {
    (0, import_react.useEffect)(() => {
      const m2 = H().modalEl();
      const f2 = (e2) => {
        if (e2.key === "Escape") {
          e2.stopPropagation();
          onClose();
        }
      };
      m2.addEventListener("keydown", f2);
      return () => m2.removeEventListener("keydown", f2);
    }, [onClose]);
  }
  function useMcRender() {
    const [n2, set] = (0, import_react.useState)(0);
    (0, import_react.useEffect)(() => {
      let t2 = 0;
      const f2 = () => {
        clearTimeout(t2);
        t2 = setTimeout(() => set((x2) => x2 + 1), 30);
      };
      document.addEventListener("mc:render", f2);
      return () => {
        document.removeEventListener("mc:render", f2);
        clearTimeout(t2);
      };
    }, []);
    return n2;
  }

  // renderer/react/Dashboard.jsx
  var import_jsx_runtime = __toESM(require_jsx_runtime());
  function Dashboard({ onClose }) {
    const [data] = (0, import_react2.useState)(() => H().dashData());
    const open = (r2) => H().homeActions.openRecent(r2);
    const cur2 = data.current, t2 = data.totals;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dash-page", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { className: "dash-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Painel de mapas" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "btn small", id: "dashClose", onClick: onClose, children: "Fechar" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", { className: "dash-sec", id: "dashTotals", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dash-cards", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dash-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: t2.maps }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "mapas recentes" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dash-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: t2.topics }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "t\xF3picos" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dash-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: t2.links }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "liga\xE7\xF5es e setas" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dash-card", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: t2.pdfs }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PDFs ligados" })
        ] })
      ] }) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dash-sec", id: "dashCurrent", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Mapa aberto" }),
        cur2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "muted", children: [
            cur2.name,
            " \xB7 ",
            cur2.saved,
            cur2.dirty ? " \xB7 altera\xE7\xF5es n\xE3o salvas" : ""
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dash-grid", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: cur2.topics }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "t\xF3picos" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: cur2.depth }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "n\xEDveis" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: cur2.links }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "liga\xE7\xF5es e setas" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: cur2.notes }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "com nota" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: cur2.withoutNotes }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "sem nota" })
            ] }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: cur2.pdfs }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PDFs ligados" })
            ] })
          ] })
        ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "empty", children: "Nenhum mapa aberto. Abra ou crie um mapa para ver o resumo aqui." })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { className: "dash-sec", id: "dashMaps", children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Mapas recentes" }),
        data.maps.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "empty", children: "Os mapas que voc\xEA abrir aparecem aqui." }),
        data.maps.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", { className: "dash-table", children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Mapa" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "T\xF3picos" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "N\xEDveis" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Liga\xE7\xF5es" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "PDFs" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Formato" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Alterado" })
          ] }) }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: data.maps.map((m2) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { className: m2.exists ? "" : "missing", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m2.exists ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "link", onClick: () => open(m2), title: m2.path, children: m2.name }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "muted", children: [
              m2.name,
              " (n\xE3o encontrado)"
            ] }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m2.topics ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m2.depth ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m2.links ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m2.pdfs ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m2.layout ?? "\u2014" }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: m2.when })
          ] }, m2.path)) })
        ] })
      ] })
    ] });
  }

  // renderer/react/FlatIcon.jsx
  var import_jsx_runtime2 = __toESM(require_jsx_runtime());
  function FlatIcon({ name, size = 16, className = "", style = {} }) {
    const common = {
      width: size,
      height: size,
      display: "inline-block",
      verticalAlign: "middle",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 2,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      flexShrink: 0,
      ...style
    };
    switch (name) {
      case "pdf":
      case "file":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "14 2 14 8 20 8" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "16", y1: "17", x2: "8", y2: "17" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "10 9 9 9 8 9" })
        ] });
      case "video":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "2", y: "4", width: "15", height: "16", rx: "2" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polygon", { points: "23 7 17 12 23 17", fill: "currentColor", stroke: "none" })
        ] });
      case "browser":
      case "globe":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" })
        ] });
      case "book":
      case "study":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" })
        ] });
      case "home":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "9 22 9 12 15 12 15 22" })
        ] });
      case "external":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "15 3 21 3 21 9" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "10", y1: "14", x2: "21", y2: "3" })
        ] });
      case "pin":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "12", y1: "17", x2: "12", y2: "22" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M5 17h14v-2l-2-3V5a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7l-2 3v2z" })
        ] });
      case "clock":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "12 6 12 12 16 14" })
        ] });
      case "folder":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { viewBox: "0 0 24 24", style: common, className, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" }) });
      case "link":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })
        ] });
      case "plus":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "12", y1: "5", x2: "12", y2: "19" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "5", y1: "12", x2: "19", y2: "12" })
        ] });
      case "close":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "6", y1: "6", x2: "18", y2: "18" })
        ] });
      case "arrowLeft":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "19", y1: "12", x2: "5", y2: "12" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "12 19 5 12 12 5" })
        ] });
      case "arrowRight":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "5", y1: "12", x2: "19", y2: "12" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "12 5 19 12 12 19" })
        ] });
      case "refresh":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "23 4 23 10 17 10" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" })
        ] });
      case "target":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "12", r: "6" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "12", r: "2" })
        ] });
      case "robot":
      case "ai":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "3", y: "11", width: "18", height: "10", rx: "2" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "5", r: "2" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M12 7v4" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "8", y1: "16", x2: "8", y2: "16" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "16", y1: "16", x2: "16", y2: "16" })
        ] });
      case "clipboard":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "8", y: "2", width: "8", height: "4", rx: "1", ry: "1" })
        ] });
      case "archive":
      case "library":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "21 8 21 21 3 21 3 8" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("rect", { x: "1", y: "3", width: "22", height: "5" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "10", y1: "12", x2: "14", y2: "12" })
        ] });
      case "edit":
      case "exam":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })
        ] });
      case "brain":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M9.5 2A4.5 4.5 0 0 0 5 6.5c0 .77.2 1.5.55 2.14A4.5 4.5 0 0 0 3 12.5C3 15 5 17 7.5 17c.17 0 .34-.01.5-.03V17a4 4 0 0 0 4 4h.5V2h-.5z" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M14.5 2A4.5 4.5 0 0 1 19 6.5c0 .77-.2 1.5-.55 2.14A4.5 4.5 0 0 1 21 12.5C21 15 19 17 16.5 17c-.17 0-.34-.01-.5-.03V17a4 4 0 0 1-4 4h-.5V2h.5z" })
        ] });
      case "shield":
      case "backup":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("svg", { viewBox: "0 0 24 24", style: common, className, children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }) });
      case "maximize":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "15 3 21 3 21 9" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "9 21 3 21 3 15" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "21", y1: "3", x2: "14", y2: "10" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "3", y1: "21", x2: "10", y2: "14" })
        ] });
      case "restore":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("polyline", { points: "1 4 1 10 7 10" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("path", { d: "M3.51 15a9 9 0 1 0 2.13-9.36L1 10" })
        ] });
      case "info":
        return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("svg", { viewBox: "0 0 24 24", style: common, className, children: [
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("circle", { cx: "12", cy: "12", r: "10" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
          /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" })
        ] });
      default:
        return null;
    }
  }

  // renderer/react/Panels.jsx
  var import_jsx_runtime3 = __toESM(require_jsx_runtime());
  function Row({ r: r2, onClick, children }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "lk" + (r2.ghost ? " ghost" : ""), onClick, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "dot", style: r2.ghost ? { background: "transparent", border: "1px dashed var(--text-dim)" } : { background: r2.dot } }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "t", children: r2.title }),
      r2.rel && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "m rel", title: "Rela\xE7\xE3o desenhada no mapa (conta como conex\xE3o na rede)", children: r2.label ? `seta \xB7 ${r2.label}` : "seta" }),
      r2.meta ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "m", children: r2.meta }) : null,
      children
    ] });
  }
  function Connections({ model }) {
    const h2 = H();
    if (model.empty) return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "muted", children: "Selecione um t\xF3pico. Escreva [[T\xEDtulo]] nas notas para ligar conte\xFAdos." });
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(import_jsx_runtime3.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h4", { children: `Links deste t\xF3pico (${model.out.length})` }),
      !model.out.length && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "muted", children: "Nenhum. Digite [[ nas notas para ligar a outro t\xF3pico." }),
      model.out.map((r2, i2) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Row, { r: r2, onClick: () => h2.openTopic(r2.n), children: r2.canCreate && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "go", title: "Criar este t\xF3pico", "data-create": r2.title, onClick: (e2) => {
        e2.stopPropagation();
        h2.createTopicFromLink(r2.title);
      }, children: "\uFF0B" }) }, "o" + i2)),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h4", { children: `Citado em (${model.inn.length})` }),
      !model.inn.length && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "muted", children: "Nenhum t\xF3pico cita este." }),
      model.inn.map((r2, i2) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Row, { r: r2, onClick: () => h2.openTopic(r2.n) }, "i" + i2)),
      model.men.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("h4", { children: `Men\xE7\xF5es sem link (${model.men.length})` }),
      model.men.map((r2, i2) => /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(Row, { r: r2, onClick: () => h2.openTopic(r2.n), children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "go", title: "Transformar em link", style: { width: "auto", padding: "0 6px" }, "data-linkify": r2.m.id, onClick: (e2) => {
        e2.stopPropagation();
        h2.linkifyMention(model.selNode, r2.m);
      }, children: "[[ ]]" }) }, "m" + i2)),
      model.tip && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "muted", children: "Dica: no grafo, escolha a pasta do vault para ligar este mapa a outros." })
    ] });
  }
  var OL_MAX_INDENT = 8;
  function Outline({ rows }) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(import_jsx_runtime3.Fragment, { children: rows.map((r2) => /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "ol-row" + (r2.sel ? " sel" : "") + (r2.hit ? " hit" : ""), "data-ol-id": r2.id, role: "treeitem", style: { paddingLeft: 8 + Math.min(r2.depth, OL_MAX_INDENT) * 14 }, title: r2.depth > OL_MAX_INDENT ? `${r2.title} \u2014 n\xEDvel ${r2.depth}` : void 0, children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "ol-tog", "data-ol-tog": r2.hasChildren ? r2.id : void 0, children: r2.hasChildren ? r2.collapsed ? "\u25B6" : "\u25BC" : "" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "ol-dot", style: { background: r2.branch } }),
      r2.depth > OL_MAX_INDENT && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "ol-lvl", children: r2.depth }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "ol-t", children: r2.title }),
      r2.progress != null && /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { className: "ol-pct", children: r2.progress + "%" })
    ] }, r2.id)) });
  }
  function RefsBox() {
    const h2 = H();
    useMcRender();
    const sel = h2.primary();
    const refs = sel && sel.node.refs ? sel.node.refs : [];
    if (!refs.length) return null;
    const pdfs = h2.map().meta.pdfs || [];
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "refs", id: "refsList", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "field-label", children: `Fontes (${refs.length})` }),
      refs.map((r2, i2) => {
        const p2 = pdfs.find((x2) => x2.id === r2.pdf);
        return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("div", { className: "ref-row", "data-ref": i2, children: [
          /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("button", { className: "ref-open", title: "Abrir o PDF nesta p\xE1gina", onClick: () => h2.pdfOpenRef(r2), children: [
            /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("b", { style: { display: "inline-flex", alignItems: "center" }, children: [
              /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FlatIcon, { name: "pdf", size: 12, style: { marginRight: "5px" } }),
              `${p2 ? p2.name : "PDF n\xE3o vinculado"}, p. ${r2.page}`
            ] }),
            r2.quote ? /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("span", { children: `\u201C${r2.quote.length > 140 ? r2.quote.slice(0, 139) + "\u2026" : r2.quote}\u201D` }) : null
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("button", { className: "ref-del", title: "Remover esta fonte", onClick: () => h2.removeRef(sel.node.id, i2), "aria-label": "Remover fonte", style: { display: "inline-flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(FlatIcon, { name: "close", size: 11 }) })
        ] }, i2);
      })
    ] });
  }

  // renderer/react/PdfPane.jsx
  var import_react4 = __toESM(require_react());

  // node_modules/pdfjs-dist/build/pdf.min.mjs
  var import_meta = {};
  var t = { d: (e2, i2) => {
    for (var s2 in i2) t.o(i2, s2) && !t.o(e2, s2) && Object.defineProperty(e2, s2, { enumerable: true, get: i2[s2] });
  }, o: (t2, e2) => Object.prototype.hasOwnProperty.call(t2, e2) };
  var __webpack_exports__ = globalThis.pdfjsLib = {};
  t.d(__webpack_exports__, { AbortException: () => AbortException, AnnotationEditorLayer: () => AnnotationEditorLayer, AnnotationEditorParamsType: () => m, AnnotationEditorType: () => g, AnnotationEditorUIManager: () => AnnotationEditorUIManager, AnnotationLayer: () => AnnotationLayer, AnnotationMode: () => p, ColorPicker: () => ColorPicker, DOMSVGFactory: () => DOMSVGFactory, DrawLayer: () => DrawLayer, FeatureTest: () => util_FeatureTest, GlobalWorkerOptions: () => GlobalWorkerOptions, ImageKind: () => _, InvalidPDFException: () => InvalidPDFException, MissingPDFException: () => MissingPDFException, OPS: () => X, OutputScale: () => OutputScale, PDFDataRangeTransport: () => PDFDataRangeTransport, PDFDateString: () => PDFDateString, PDFWorker: () => PDFWorker, PasswordResponses: () => K, PermissionFlag: () => f, PixelsPerInch: () => PixelsPerInch, RenderingCancelledException: () => RenderingCancelledException, TextLayer: () => TextLayer, TouchManager: () => TouchManager, UnexpectedResponseException: () => UnexpectedResponseException, Util: () => Util, VerbosityLevel: () => q, XfaLayer: () => XfaLayer, build: () => Nt, createValidAbsoluteUrl: () => createValidAbsoluteUrl, fetchData: () => fetchData, getDocument: () => getDocument, getFilenameFromUrl: () => getFilenameFromUrl, getPdfFilenameFromUrl: () => getPdfFilenameFromUrl, getXfaPageViewport: () => getXfaPageViewport, isDataScheme: () => isDataScheme, isPdfFile: () => isPdfFile, noContextMenu: () => noContextMenu, normalizeUnicode: () => normalizeUnicode, setLayerDimensions: () => setLayerDimensions, shadow: () => shadow, stopEvent: () => stopEvent, version: () => Ot });
  var e = !("object" != typeof process || process + "" != "[object process]" || process.versions.nw || process.versions.electron && process.type && "browser" !== process.type);
  var i = [1, 0, 0, 1, 0, 0];
  var s = [1e-3, 0, 0, 1e-3, 0, 0];
  var n = 1.35;
  var a = 1;
  var r = 2;
  var o = 4;
  var l = 16;
  var h = 32;
  var d = 64;
  var c = 128;
  var u = 256;
  var p = { DISABLE: 0, ENABLE: 1, ENABLE_FORMS: 2, ENABLE_STORAGE: 3 };
  var g = { DISABLE: -1, NONE: 0, FREETEXT: 3, HIGHLIGHT: 9, STAMP: 13, INK: 15 };
  var m = { RESIZE: 1, CREATE: 2, FREETEXT_SIZE: 11, FREETEXT_COLOR: 12, FREETEXT_OPACITY: 13, INK_COLOR: 21, INK_THICKNESS: 22, INK_OPACITY: 23, HIGHLIGHT_COLOR: 31, HIGHLIGHT_DEFAULT_COLOR: 32, HIGHLIGHT_THICKNESS: 33, HIGHLIGHT_FREE: 34, HIGHLIGHT_SHOW_ALL: 35, DRAW_STEP: 41 };
  var f = { PRINT: 4, MODIFY_CONTENTS: 8, COPY: 16, MODIFY_ANNOTATIONS: 32, FILL_INTERACTIVE_FORMS: 256, COPY_FOR_ACCESSIBILITY: 512, ASSEMBLE: 1024, PRINT_HIGH_QUALITY: 2048 };
  var b = 0;
  var A = 1;
  var w = 2;
  var v = 3;
  var y = 3;
  var x = 4;
  var _ = { GRAYSCALE_1BPP: 1, RGB_24BPP: 2, RGBA_32BPP: 3 };
  var E = 1;
  var S = 2;
  var C = 3;
  var T = 4;
  var M = 5;
  var P = 6;
  var D = 7;
  var k = 8;
  var R = 9;
  var I = 10;
  var F = 11;
  var L = 12;
  var O = 13;
  var N = 14;
  var B = 15;
  var H2 = 16;
  var z = 17;
  var U = 20;
  var G = 1;
  var $ = 2;
  var V = 3;
  var j = 4;
  var W = 5;
  var q = { ERRORS: 0, WARNINGS: 1, INFOS: 5 };
  var X = { dependency: 1, setLineWidth: 2, setLineCap: 3, setLineJoin: 4, setMiterLimit: 5, setDash: 6, setRenderingIntent: 7, setFlatness: 8, setGState: 9, save: 10, restore: 11, transform: 12, moveTo: 13, lineTo: 14, curveTo: 15, curveTo2: 16, curveTo3: 17, closePath: 18, rectangle: 19, stroke: 20, closeStroke: 21, fill: 22, eoFill: 23, fillStroke: 24, eoFillStroke: 25, closeFillStroke: 26, closeEOFillStroke: 27, endPath: 28, clip: 29, eoClip: 30, beginText: 31, endText: 32, setCharSpacing: 33, setWordSpacing: 34, setHScale: 35, setLeading: 36, setFont: 37, setTextRenderingMode: 38, setTextRise: 39, moveText: 40, setLeadingMoveText: 41, setTextMatrix: 42, nextLine: 43, showText: 44, showSpacedText: 45, nextLineShowText: 46, nextLineSetSpacingShowText: 47, setCharWidth: 48, setCharWidthAndBounds: 49, setStrokeColorSpace: 50, setFillColorSpace: 51, setStrokeColor: 52, setStrokeColorN: 53, setFillColor: 54, setFillColorN: 55, setStrokeGray: 56, setFillGray: 57, setStrokeRGBColor: 58, setFillRGBColor: 59, setStrokeCMYKColor: 60, setFillCMYKColor: 61, shadingFill: 62, beginInlineImage: 63, beginImageData: 64, endInlineImage: 65, paintXObject: 66, markPoint: 67, markPointProps: 68, beginMarkedContent: 69, beginMarkedContentProps: 70, endMarkedContent: 71, beginCompat: 72, endCompat: 73, paintFormXObjectBegin: 74, paintFormXObjectEnd: 75, beginGroup: 76, endGroup: 77, beginAnnotation: 80, endAnnotation: 81, paintImageMaskXObject: 83, paintImageMaskXObjectGroup: 84, paintImageXObject: 85, paintInlineImageXObject: 86, paintInlineImageXObjectGroup: 87, paintImageXObjectRepeat: 88, paintImageMaskXObjectRepeat: 89, paintSolidColorImageMask: 90, constructPath: 91, setStrokeTransparent: 92, setFillTransparent: 93 };
  var K = { NEED_PASSWORD: 1, INCORRECT_PASSWORD: 2 };
  var Y = q.WARNINGS;
  function setVerbosityLevel(t2) {
    Number.isInteger(t2) && (Y = t2);
  }
  function getVerbosityLevel() {
    return Y;
  }
  function info(t2) {
    Y >= q.INFOS && console.log(`Info: ${t2}`);
  }
  function warn(t2) {
    Y >= q.WARNINGS && console.log(`Warning: ${t2}`);
  }
  function unreachable(t2) {
    throw new Error(t2);
  }
  function assert(t2, e2) {
    t2 || unreachable(e2);
  }
  function createValidAbsoluteUrl(t2, e2 = null, i2 = null) {
    if (!t2) return null;
    try {
      if (i2 && "string" == typeof t2) {
        if (i2.addDefaultProtocol && t2.startsWith("www.")) {
          const e3 = t2.match(/\./g);
          e3?.length >= 2 && (t2 = `http://${t2}`);
        }
        if (i2.tryConvertEncoding) try {
          t2 = (function stringToUTF8String(t3) {
            return decodeURIComponent(escape(t3));
          })(t2);
        } catch {
        }
      }
      const s2 = e2 ? new URL(t2, e2) : new URL(t2);
      if ((function _isValidProtocol(t3) {
        switch (t3?.protocol) {
          case "http:":
          case "https:":
          case "ftp:":
          case "mailto:":
          case "tel:":
            return true;
          default:
            return false;
        }
      })(s2)) return s2;
    } catch {
    }
    return null;
  }
  function shadow(t2, e2, i2, s2 = false) {
    Object.defineProperty(t2, e2, { value: i2, enumerable: !s2, configurable: true, writable: false });
    return i2;
  }
  var Q = (function BaseExceptionClosure() {
    function BaseException(t2, e2) {
      this.message = t2;
      this.name = e2;
    }
    BaseException.prototype = new Error();
    BaseException.constructor = BaseException;
    return BaseException;
  })();
  var PasswordException = class extends Q {
    constructor(t2, e2) {
      super(t2, "PasswordException");
      this.code = e2;
    }
  };
  var UnknownErrorException = class extends Q {
    constructor(t2, e2) {
      super(t2, "UnknownErrorException");
      this.details = e2;
    }
  };
  var InvalidPDFException = class extends Q {
    constructor(t2) {
      super(t2, "InvalidPDFException");
    }
  };
  var MissingPDFException = class extends Q {
    constructor(t2) {
      super(t2, "MissingPDFException");
    }
  };
  var UnexpectedResponseException = class extends Q {
    constructor(t2, e2) {
      super(t2, "UnexpectedResponseException");
      this.status = e2;
    }
  };
  var FormatError = class extends Q {
    constructor(t2) {
      super(t2, "FormatError");
    }
  };
  var AbortException = class extends Q {
    constructor(t2) {
      super(t2, "AbortException");
    }
  };
  function bytesToString(t2) {
    "object" == typeof t2 && void 0 !== t2?.length || unreachable("Invalid argument for bytesToString");
    const e2 = t2.length, i2 = 8192;
    if (e2 < i2) return String.fromCharCode.apply(null, t2);
    const s2 = [];
    for (let n2 = 0; n2 < e2; n2 += i2) {
      const a2 = Math.min(n2 + i2, e2), r2 = t2.subarray(n2, a2);
      s2.push(String.fromCharCode.apply(null, r2));
    }
    return s2.join("");
  }
  function stringToBytes(t2) {
    "string" != typeof t2 && unreachable("Invalid argument for stringToBytes");
    const e2 = t2.length, i2 = new Uint8Array(e2);
    for (let s2 = 0; s2 < e2; ++s2) i2[s2] = 255 & t2.charCodeAt(s2);
    return i2;
  }
  function objectFromMap(t2) {
    const e2 = /* @__PURE__ */ Object.create(null);
    for (const [i2, s2] of t2) e2[i2] = s2;
    return e2;
  }
  var util_FeatureTest = class {
    static get isLittleEndian() {
      return shadow(this, "isLittleEndian", (function isLittleEndian() {
        const t2 = new Uint8Array(4);
        t2[0] = 1;
        return 1 === new Uint32Array(t2.buffer, 0, 1)[0];
      })());
    }
    static get isEvalSupported() {
      return shadow(this, "isEvalSupported", (function isEvalSupported() {
        try {
          new Function("");
          return true;
        } catch {
          return false;
        }
      })());
    }
    static get isOffscreenCanvasSupported() {
      return shadow(this, "isOffscreenCanvasSupported", "undefined" != typeof OffscreenCanvas);
    }
    static get isImageDecoderSupported() {
      return shadow(this, "isImageDecoderSupported", "undefined" != typeof ImageDecoder);
    }
    static get platform() {
      return "undefined" != typeof navigator && "string" == typeof navigator?.platform ? shadow(this, "platform", { isMac: navigator.platform.includes("Mac"), isWindows: navigator.platform.includes("Win"), isFirefox: "string" == typeof navigator?.userAgent && navigator.userAgent.includes("Firefox") }) : shadow(this, "platform", { isMac: false, isWindows: false, isFirefox: false });
    }
    static get isCSSRoundSupported() {
      return shadow(this, "isCSSRoundSupported", globalThis.CSS?.supports?.("width: round(1.5px, 1px)"));
    }
  };
  var J = Array.from(Array(256).keys(), ((t2) => t2.toString(16).padStart(2, "0")));
  var Util = class {
    static makeHexColor(t2, e2, i2) {
      return `#${J[t2]}${J[e2]}${J[i2]}`;
    }
    static scaleMinMax(t2, e2) {
      let i2;
      if (t2[0]) {
        if (t2[0] < 0) {
          i2 = e2[0];
          e2[0] = e2[2];
          e2[2] = i2;
        }
        e2[0] *= t2[0];
        e2[2] *= t2[0];
        if (t2[3] < 0) {
          i2 = e2[1];
          e2[1] = e2[3];
          e2[3] = i2;
        }
        e2[1] *= t2[3];
        e2[3] *= t2[3];
      } else {
        i2 = e2[0];
        e2[0] = e2[1];
        e2[1] = i2;
        i2 = e2[2];
        e2[2] = e2[3];
        e2[3] = i2;
        if (t2[1] < 0) {
          i2 = e2[1];
          e2[1] = e2[3];
          e2[3] = i2;
        }
        e2[1] *= t2[1];
        e2[3] *= t2[1];
        if (t2[2] < 0) {
          i2 = e2[0];
          e2[0] = e2[2];
          e2[2] = i2;
        }
        e2[0] *= t2[2];
        e2[2] *= t2[2];
      }
      e2[0] += t2[4];
      e2[1] += t2[5];
      e2[2] += t2[4];
      e2[3] += t2[5];
    }
    static transform(t2, e2) {
      return [t2[0] * e2[0] + t2[2] * e2[1], t2[1] * e2[0] + t2[3] * e2[1], t2[0] * e2[2] + t2[2] * e2[3], t2[1] * e2[2] + t2[3] * e2[3], t2[0] * e2[4] + t2[2] * e2[5] + t2[4], t2[1] * e2[4] + t2[3] * e2[5] + t2[5]];
    }
    static applyTransform(t2, e2) {
      return [t2[0] * e2[0] + t2[1] * e2[2] + e2[4], t2[0] * e2[1] + t2[1] * e2[3] + e2[5]];
    }
    static applyInverseTransform(t2, e2) {
      const i2 = e2[0] * e2[3] - e2[1] * e2[2];
      return [(t2[0] * e2[3] - t2[1] * e2[2] + e2[2] * e2[5] - e2[4] * e2[3]) / i2, (-t2[0] * e2[1] + t2[1] * e2[0] + e2[4] * e2[1] - e2[5] * e2[0]) / i2];
    }
    static getAxialAlignedBoundingBox(t2, e2) {
      const i2 = this.applyTransform(t2, e2), s2 = this.applyTransform(t2.slice(2, 4), e2), n2 = this.applyTransform([t2[0], t2[3]], e2), a2 = this.applyTransform([t2[2], t2[1]], e2);
      return [Math.min(i2[0], s2[0], n2[0], a2[0]), Math.min(i2[1], s2[1], n2[1], a2[1]), Math.max(i2[0], s2[0], n2[0], a2[0]), Math.max(i2[1], s2[1], n2[1], a2[1])];
    }
    static inverseTransform(t2) {
      const e2 = t2[0] * t2[3] - t2[1] * t2[2];
      return [t2[3] / e2, -t2[1] / e2, -t2[2] / e2, t2[0] / e2, (t2[2] * t2[5] - t2[4] * t2[3]) / e2, (t2[4] * t2[1] - t2[5] * t2[0]) / e2];
    }
    static singularValueDecompose2dScale(t2) {
      const e2 = [t2[0], t2[2], t2[1], t2[3]], i2 = t2[0] * e2[0] + t2[1] * e2[2], s2 = t2[0] * e2[1] + t2[1] * e2[3], n2 = t2[2] * e2[0] + t2[3] * e2[2], a2 = t2[2] * e2[1] + t2[3] * e2[3], r2 = (i2 + a2) / 2, o2 = Math.sqrt((i2 + a2) ** 2 - 4 * (i2 * a2 - n2 * s2)) / 2, l2 = r2 + o2 || 1, h2 = r2 - o2 || 1;
      return [Math.sqrt(l2), Math.sqrt(h2)];
    }
    static normalizeRect(t2) {
      const e2 = t2.slice(0);
      if (t2[0] > t2[2]) {
        e2[0] = t2[2];
        e2[2] = t2[0];
      }
      if (t2[1] > t2[3]) {
        e2[1] = t2[3];
        e2[3] = t2[1];
      }
      return e2;
    }
    static intersect(t2, e2) {
      const i2 = Math.max(Math.min(t2[0], t2[2]), Math.min(e2[0], e2[2])), s2 = Math.min(Math.max(t2[0], t2[2]), Math.max(e2[0], e2[2]));
      if (i2 > s2) return null;
      const n2 = Math.max(Math.min(t2[1], t2[3]), Math.min(e2[1], e2[3])), a2 = Math.min(Math.max(t2[1], t2[3]), Math.max(e2[1], e2[3]));
      return n2 > a2 ? null : [i2, n2, s2, a2];
    }
    static #t(t2, e2, i2, s2, n2, a2, r2, o2, l2, h2) {
      if (l2 <= 0 || l2 >= 1) return;
      const d2 = 1 - l2, c2 = l2 * l2, u2 = c2 * l2, p2 = d2 * (d2 * (d2 * t2 + 3 * l2 * e2) + 3 * c2 * i2) + u2 * s2, g2 = d2 * (d2 * (d2 * n2 + 3 * l2 * a2) + 3 * c2 * r2) + u2 * o2;
      h2[0] = Math.min(h2[0], p2);
      h2[1] = Math.min(h2[1], g2);
      h2[2] = Math.max(h2[2], p2);
      h2[3] = Math.max(h2[3], g2);
    }
    static #e(t2, e2, i2, s2, n2, a2, r2, o2, l2, h2, d2, c2) {
      if (Math.abs(l2) < 1e-12) {
        Math.abs(h2) >= 1e-12 && this.#t(t2, e2, i2, s2, n2, a2, r2, o2, -d2 / h2, c2);
        return;
      }
      const u2 = h2 ** 2 - 4 * d2 * l2;
      if (u2 < 0) return;
      const p2 = Math.sqrt(u2), g2 = 2 * l2;
      this.#t(t2, e2, i2, s2, n2, a2, r2, o2, (-h2 + p2) / g2, c2);
      this.#t(t2, e2, i2, s2, n2, a2, r2, o2, (-h2 - p2) / g2, c2);
    }
    static bezierBoundingBox(t2, e2, i2, s2, n2, a2, r2, o2, l2) {
      if (l2) {
        l2[0] = Math.min(l2[0], t2, r2);
        l2[1] = Math.min(l2[1], e2, o2);
        l2[2] = Math.max(l2[2], t2, r2);
        l2[3] = Math.max(l2[3], e2, o2);
      } else l2 = [Math.min(t2, r2), Math.min(e2, o2), Math.max(t2, r2), Math.max(e2, o2)];
      this.#e(t2, i2, n2, r2, e2, s2, a2, o2, 3 * (3 * (i2 - n2) - t2 + r2), 6 * (t2 - 2 * i2 + n2), 3 * (i2 - t2), l2);
      this.#e(t2, i2, n2, r2, e2, s2, a2, o2, 3 * (3 * (s2 - a2) - e2 + o2), 6 * (e2 - 2 * s2 + a2), 3 * (s2 - e2), l2);
      return l2;
    }
  };
  var Z = null;
  var tt = null;
  function normalizeUnicode(t2) {
    if (!Z) {
      Z = /([\u00a0\u00b5\u037e\u0eb3\u2000-\u200a\u202f\u2126\ufb00-\ufb04\ufb06\ufb20-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufba1\ufba4-\ufba9\ufbae-\ufbb1\ufbd3-\ufbdc\ufbde-\ufbe7\ufbea-\ufbf8\ufbfc-\ufbfd\ufc00-\ufc5d\ufc64-\ufcf1\ufcf5-\ufd3d\ufd88\ufdf4\ufdfa-\ufdfb\ufe71\ufe77\ufe79\ufe7b\ufe7d]+)|(\ufb05+)/gu;
      tt = /* @__PURE__ */ new Map([["\uFB05", "\u017Ft"]]);
    }
    return t2.replaceAll(Z, ((t3, e2, i2) => e2 ? e2.normalize("NFKC") : tt.get(i2)));
  }
  var et = "pdfjs_internal_id_";
  "function" != typeof Promise.try && (Promise.try = function(t2, ...e2) {
    return new Promise(((i2) => {
      i2(t2(...e2));
    }));
  });
  var it = "http://www.w3.org/2000/svg";
  var PixelsPerInch = class {
    static CSS = 96;
    static PDF = 72;
    static PDF_TO_CSS_UNITS = this.CSS / this.PDF;
  };
  async function fetchData(t2, e2 = "text") {
    if (isValidFetchUrl(t2, document.baseURI)) {
      const i2 = await fetch(t2);
      if (!i2.ok) throw new Error(i2.statusText);
      switch (e2) {
        case "arraybuffer":
          return i2.arrayBuffer();
        case "blob":
          return i2.blob();
        case "json":
          return i2.json();
      }
      return i2.text();
    }
    return new Promise(((i2, s2) => {
      const n2 = new XMLHttpRequest();
      n2.open("GET", t2, true);
      n2.responseType = e2;
      n2.onreadystatechange = () => {
        if (n2.readyState === XMLHttpRequest.DONE) if (200 !== n2.status && 0 !== n2.status) s2(new Error(n2.statusText));
        else {
          switch (e2) {
            case "arraybuffer":
            case "blob":
            case "json":
              i2(n2.response);
              return;
          }
          i2(n2.responseText);
        }
      };
      n2.send(null);
    }));
  }
  var PageViewport = class _PageViewport {
    constructor({ viewBox: t2, userUnit: e2, scale: i2, rotation: s2, offsetX: n2 = 0, offsetY: a2 = 0, dontFlip: r2 = false }) {
      this.viewBox = t2;
      this.userUnit = e2;
      this.scale = i2;
      this.rotation = s2;
      this.offsetX = n2;
      this.offsetY = a2;
      i2 *= e2;
      const o2 = (t2[2] + t2[0]) / 2, l2 = (t2[3] + t2[1]) / 2;
      let h2, d2, c2, u2, p2, g2, m2, f2;
      (s2 %= 360) < 0 && (s2 += 360);
      switch (s2) {
        case 180:
          h2 = -1;
          d2 = 0;
          c2 = 0;
          u2 = 1;
          break;
        case 90:
          h2 = 0;
          d2 = 1;
          c2 = 1;
          u2 = 0;
          break;
        case 270:
          h2 = 0;
          d2 = -1;
          c2 = -1;
          u2 = 0;
          break;
        case 0:
          h2 = 1;
          d2 = 0;
          c2 = 0;
          u2 = -1;
          break;
        default:
          throw new Error("PageViewport: Invalid rotation, must be a multiple of 90 degrees.");
      }
      if (r2) {
        c2 = -c2;
        u2 = -u2;
      }
      if (0 === h2) {
        p2 = Math.abs(l2 - t2[1]) * i2 + n2;
        g2 = Math.abs(o2 - t2[0]) * i2 + a2;
        m2 = (t2[3] - t2[1]) * i2;
        f2 = (t2[2] - t2[0]) * i2;
      } else {
        p2 = Math.abs(o2 - t2[0]) * i2 + n2;
        g2 = Math.abs(l2 - t2[1]) * i2 + a2;
        m2 = (t2[2] - t2[0]) * i2;
        f2 = (t2[3] - t2[1]) * i2;
      }
      this.transform = [h2 * i2, d2 * i2, c2 * i2, u2 * i2, p2 - h2 * i2 * o2 - c2 * i2 * l2, g2 - d2 * i2 * o2 - u2 * i2 * l2];
      this.width = m2;
      this.height = f2;
    }
    get rawDims() {
      const { userUnit: t2, viewBox: e2 } = this, i2 = e2.map(((e3) => e3 * t2));
      return shadow(this, "rawDims", { pageWidth: i2[2] - i2[0], pageHeight: i2[3] - i2[1], pageX: i2[0], pageY: i2[1] });
    }
    clone({ scale: t2 = this.scale, rotation: e2 = this.rotation, offsetX: i2 = this.offsetX, offsetY: s2 = this.offsetY, dontFlip: n2 = false } = {}) {
      return new _PageViewport({ viewBox: this.viewBox.slice(), userUnit: this.userUnit, scale: t2, rotation: e2, offsetX: i2, offsetY: s2, dontFlip: n2 });
    }
    convertToViewportPoint(t2, e2) {
      return Util.applyTransform([t2, e2], this.transform);
    }
    convertToViewportRectangle(t2) {
      const e2 = Util.applyTransform([t2[0], t2[1]], this.transform), i2 = Util.applyTransform([t2[2], t2[3]], this.transform);
      return [e2[0], e2[1], i2[0], i2[1]];
    }
    convertToPdfPoint(t2, e2) {
      return Util.applyInverseTransform([t2, e2], this.transform);
    }
  };
  var RenderingCancelledException = class extends Q {
    constructor(t2, e2 = 0) {
      super(t2, "RenderingCancelledException");
      this.extraDelay = e2;
    }
  };
  function isDataScheme(t2) {
    const e2 = t2.length;
    let i2 = 0;
    for (; i2 < e2 && "" === t2[i2].trim(); ) i2++;
    return "data:" === t2.substring(i2, i2 + 5).toLowerCase();
  }
  function isPdfFile(t2) {
    return "string" == typeof t2 && /\.pdf$/i.test(t2);
  }
  function getFilenameFromUrl(t2) {
    [t2] = t2.split(/[#?]/, 1);
    return t2.substring(t2.lastIndexOf("/") + 1);
  }
  function getPdfFilenameFromUrl(t2, e2 = "document.pdf") {
    if ("string" != typeof t2) return e2;
    if (isDataScheme(t2)) {
      warn('getPdfFilenameFromUrl: ignore "data:"-URL for performance reasons.');
      return e2;
    }
    const i2 = /[^/?#=]+\.pdf\b(?!.*\.pdf\b)/i, s2 = /^(?:(?:[^:]+:)?\/\/[^/]+)?([^?#]*)(\?[^#]*)?(#.*)?$/.exec(t2);
    let n2 = i2.exec(s2[1]) || i2.exec(s2[2]) || i2.exec(s2[3]);
    if (n2) {
      n2 = n2[0];
      if (n2.includes("%")) try {
        n2 = i2.exec(decodeURIComponent(n2))[0];
      } catch {
      }
    }
    return n2 || e2;
  }
  var StatTimer = class {
    started = /* @__PURE__ */ Object.create(null);
    times = [];
    time(t2) {
      t2 in this.started && warn(`Timer is already running for ${t2}`);
      this.started[t2] = Date.now();
    }
    timeEnd(t2) {
      t2 in this.started || warn(`Timer has not been started for ${t2}`);
      this.times.push({ name: t2, start: this.started[t2], end: Date.now() });
      delete this.started[t2];
    }
    toString() {
      const t2 = [];
      let e2 = 0;
      for (const { name: t3 } of this.times) e2 = Math.max(t3.length, e2);
      for (const { name: i2, start: s2, end: n2 } of this.times) t2.push(`${i2.padEnd(e2)} ${n2 - s2}ms
`);
      return t2.join("");
    }
  };
  function isValidFetchUrl(t2, e2) {
    try {
      const { protocol: i2 } = e2 ? new URL(t2, e2) : new URL(t2);
      return "http:" === i2 || "https:" === i2;
    } catch {
      return false;
    }
  }
  function noContextMenu(t2) {
    t2.preventDefault();
  }
  function stopEvent(t2) {
    t2.preventDefault();
    t2.stopPropagation();
  }
  var PDFDateString = class {
    static #i;
    static toDateObject(t2) {
      if (!t2 || "string" != typeof t2) return null;
      this.#i ||= new RegExp("^D:(\\d{4})(\\d{2})?(\\d{2})?(\\d{2})?(\\d{2})?(\\d{2})?([Z|+|-])?(\\d{2})?'?(\\d{2})?'?");
      const e2 = this.#i.exec(t2);
      if (!e2) return null;
      const i2 = parseInt(e2[1], 10);
      let s2 = parseInt(e2[2], 10);
      s2 = s2 >= 1 && s2 <= 12 ? s2 - 1 : 0;
      let n2 = parseInt(e2[3], 10);
      n2 = n2 >= 1 && n2 <= 31 ? n2 : 1;
      let a2 = parseInt(e2[4], 10);
      a2 = a2 >= 0 && a2 <= 23 ? a2 : 0;
      let r2 = parseInt(e2[5], 10);
      r2 = r2 >= 0 && r2 <= 59 ? r2 : 0;
      let o2 = parseInt(e2[6], 10);
      o2 = o2 >= 0 && o2 <= 59 ? o2 : 0;
      const l2 = e2[7] || "Z";
      let h2 = parseInt(e2[8], 10);
      h2 = h2 >= 0 && h2 <= 23 ? h2 : 0;
      let d2 = parseInt(e2[9], 10) || 0;
      d2 = d2 >= 0 && d2 <= 59 ? d2 : 0;
      if ("-" === l2) {
        a2 += h2;
        r2 += d2;
      } else if ("+" === l2) {
        a2 -= h2;
        r2 -= d2;
      }
      return new Date(Date.UTC(i2, s2, n2, a2, r2, o2));
    }
  };
  function getXfaPageViewport(t2, { scale: e2 = 1, rotation: i2 = 0 }) {
    const { width: s2, height: n2 } = t2.attributes.style, a2 = [0, 0, parseInt(s2), parseInt(n2)];
    return new PageViewport({ viewBox: a2, userUnit: 1, scale: e2, rotation: i2 });
  }
  function getRGB(t2) {
    if (t2.startsWith("#")) {
      const e2 = parseInt(t2.slice(1), 16);
      return [(16711680 & e2) >> 16, (65280 & e2) >> 8, 255 & e2];
    }
    if (t2.startsWith("rgb(")) return t2.slice(4, -1).split(",").map(((t3) => parseInt(t3)));
    if (t2.startsWith("rgba(")) return t2.slice(5, -1).split(",").map(((t3) => parseInt(t3))).slice(0, 3);
    warn(`Not a valid color format: "${t2}"`);
    return [0, 0, 0];
  }
  function getCurrentTransform(t2) {
    const { a: e2, b: i2, c: s2, d: n2, e: a2, f: r2 } = t2.getTransform();
    return [e2, i2, s2, n2, a2, r2];
  }
  function getCurrentTransformInverse(t2) {
    const { a: e2, b: i2, c: s2, d: n2, e: a2, f: r2 } = t2.getTransform().invertSelf();
    return [e2, i2, s2, n2, a2, r2];
  }
  function setLayerDimensions(t2, e2, i2 = false, s2 = true) {
    if (e2 instanceof PageViewport) {
      const { pageWidth: s3, pageHeight: n2 } = e2.rawDims, { style: a2 } = t2, r2 = util_FeatureTest.isCSSRoundSupported, o2 = `var(--scale-factor) * ${s3}px`, l2 = `var(--scale-factor) * ${n2}px`, h2 = r2 ? `round(down, ${o2}, var(--scale-round-x, 1px))` : `calc(${o2})`, d2 = r2 ? `round(down, ${l2}, var(--scale-round-y, 1px))` : `calc(${l2})`;
      if (i2 && e2.rotation % 180 != 0) {
        a2.width = d2;
        a2.height = h2;
      } else {
        a2.width = h2;
        a2.height = d2;
      }
    }
    s2 && t2.setAttribute("data-main-rotation", e2.rotation);
  }
  var OutputScale = class {
    constructor() {
      const t2 = window.devicePixelRatio || 1;
      this.sx = t2;
      this.sy = t2;
    }
    get scaled() {
      return 1 !== this.sx || 1 !== this.sy;
    }
    get symmetric() {
      return this.sx === this.sy;
    }
  };
  var EditorToolbar = class _EditorToolbar {
    #s = null;
    #n = null;
    #a;
    #r = null;
    #o = null;
    static #l = null;
    constructor(t2) {
      this.#a = t2;
      _EditorToolbar.#l ||= Object.freeze({ freetext: "pdfjs-editor-remove-freetext-button", highlight: "pdfjs-editor-remove-highlight-button", ink: "pdfjs-editor-remove-ink-button", stamp: "pdfjs-editor-remove-stamp-button" });
    }
    render() {
      const t2 = this.#s = document.createElement("div");
      t2.classList.add("editToolbar", "hidden");
      t2.setAttribute("role", "toolbar");
      const e2 = this.#a._uiManager._signal;
      t2.addEventListener("contextmenu", noContextMenu, { signal: e2 });
      t2.addEventListener("pointerdown", _EditorToolbar.#h, { signal: e2 });
      const i2 = this.#r = document.createElement("div");
      i2.className = "buttons";
      t2.append(i2);
      const s2 = this.#a.toolbarPosition;
      if (s2) {
        const { style: e3 } = t2, i3 = "ltr" === this.#a._uiManager.direction ? 1 - s2[0] : s2[0];
        e3.insetInlineEnd = 100 * i3 + "%";
        e3.top = `calc(${100 * s2[1]}% + var(--editor-toolbar-vert-offset))`;
      }
      this.#d();
      return t2;
    }
    get div() {
      return this.#s;
    }
    static #h(t2) {
      t2.stopPropagation();
    }
    #c(t2) {
      this.#a._focusEventsAllowed = false;
      stopEvent(t2);
    }
    #u(t2) {
      this.#a._focusEventsAllowed = true;
      stopEvent(t2);
    }
    #p(t2) {
      const e2 = this.#a._uiManager._signal;
      t2.addEventListener("focusin", this.#c.bind(this), { capture: true, signal: e2 });
      t2.addEventListener("focusout", this.#u.bind(this), { capture: true, signal: e2 });
      t2.addEventListener("contextmenu", noContextMenu, { signal: e2 });
    }
    hide() {
      this.#s.classList.add("hidden");
      this.#n?.hideDropdown();
    }
    show() {
      this.#s.classList.remove("hidden");
      this.#o?.shown();
    }
    #d() {
      const { editorType: t2, _uiManager: e2 } = this.#a, i2 = document.createElement("button");
      i2.className = "delete";
      i2.tabIndex = 0;
      i2.setAttribute("data-l10n-id", _EditorToolbar.#l[t2]);
      this.#p(i2);
      i2.addEventListener("click", ((t3) => {
        e2.delete();
      }), { signal: e2._signal });
      this.#r.append(i2);
    }
    get #g() {
      const t2 = document.createElement("div");
      t2.className = "divider";
      return t2;
    }
    async addAltText(t2) {
      const e2 = await t2.render();
      this.#p(e2);
      this.#r.prepend(e2, this.#g);
      this.#o = t2;
    }
    addColorPicker(t2) {
      this.#n = t2;
      const e2 = t2.renderButton();
      this.#p(e2);
      this.#r.prepend(e2, this.#g);
    }
    remove() {
      this.#s.remove();
      this.#n?.destroy();
      this.#n = null;
    }
  };
  var HighlightToolbar = class {
    #r = null;
    #s = null;
    #m;
    constructor(t2) {
      this.#m = t2;
    }
    #f() {
      const t2 = this.#s = document.createElement("div");
      t2.className = "editToolbar";
      t2.setAttribute("role", "toolbar");
      t2.addEventListener("contextmenu", noContextMenu, { signal: this.#m._signal });
      const e2 = this.#r = document.createElement("div");
      e2.className = "buttons";
      t2.append(e2);
      this.#b();
      return t2;
    }
    #A(t2, e2) {
      let i2 = 0, s2 = 0;
      for (const n2 of t2) {
        const t3 = n2.y + n2.height;
        if (t3 < i2) continue;
        const a2 = n2.x + (e2 ? n2.width : 0);
        if (t3 > i2) {
          s2 = a2;
          i2 = t3;
        } else e2 ? a2 > s2 && (s2 = a2) : a2 < s2 && (s2 = a2);
      }
      return [e2 ? 1 - s2 : s2, i2];
    }
    show(t2, e2, i2) {
      const [s2, n2] = this.#A(e2, i2), { style: a2 } = this.#s ||= this.#f();
      t2.append(this.#s);
      a2.insetInlineEnd = 100 * s2 + "%";
      a2.top = `calc(${100 * n2}% + var(--editor-toolbar-vert-offset))`;
    }
    hide() {
      this.#s.remove();
    }
    #b() {
      const t2 = document.createElement("button");
      t2.className = "highlightButton";
      t2.tabIndex = 0;
      t2.setAttribute("data-l10n-id", "pdfjs-highlight-floating-button1");
      const e2 = document.createElement("span");
      t2.append(e2);
      e2.className = "visuallyHidden";
      e2.setAttribute("data-l10n-id", "pdfjs-highlight-floating-button-label");
      const i2 = this.#m._signal;
      t2.addEventListener("contextmenu", noContextMenu, { signal: i2 });
      t2.addEventListener("click", (() => {
        this.#m.highlightSelection("floating_button");
      }), { signal: i2 });
      this.#r.append(t2);
    }
  };
  function bindEvents(t2, e2, i2) {
    for (const s2 of i2) e2.addEventListener(s2, t2[s2].bind(t2));
  }
  var IdManager = class {
    #w = 0;
    get id() {
      return "pdfjs_internal_editor_" + this.#w++;
    }
  };
  var ImageManager = class _ImageManager {
    #v = (function getUuid() {
      if ("function" == typeof crypto.randomUUID) return crypto.randomUUID();
      const t2 = new Uint8Array(32);
      crypto.getRandomValues(t2);
      return bytesToString(t2);
    })();
    #w = 0;
    #y = null;
    static get _isSVGFittingCanvas() {
      const t2 = new OffscreenCanvas(1, 3).getContext("2d", { willReadFrequently: true }), e2 = new Image();
      e2.src = 'data:image/svg+xml;charset=UTF-8,<svg viewBox="0 0 1 1" width="1" height="1" xmlns="http://www.w3.org/2000/svg"><rect width="1" height="1" style="fill:red;"/></svg>';
      return shadow(this, "_isSVGFittingCanvas", e2.decode().then((() => {
        t2.drawImage(e2, 0, 0, 1, 1, 0, 0, 1, 3);
        return 0 === new Uint32Array(t2.getImageData(0, 0, 1, 1).data.buffer)[0];
      })));
    }
    async #x(t2, e2) {
      this.#y ||= /* @__PURE__ */ new Map();
      let i2 = this.#y.get(t2);
      if (null === i2) return null;
      if (i2?.bitmap) {
        i2.refCounter += 1;
        return i2;
      }
      try {
        i2 ||= { bitmap: null, id: `image_${this.#v}_${this.#w++}`, refCounter: 0, isSvg: false };
        let t3;
        if ("string" == typeof e2) {
          i2.url = e2;
          t3 = await fetchData(e2, "blob");
        } else e2 instanceof File ? t3 = i2.file = e2 : e2 instanceof Blob && (t3 = e2);
        if ("image/svg+xml" === t3.type) {
          const e3 = _ImageManager._isSVGFittingCanvas, s2 = new FileReader(), n2 = new Image(), a2 = new Promise(((t4, a3) => {
            n2.onload = () => {
              i2.bitmap = n2;
              i2.isSvg = true;
              t4();
            };
            s2.onload = async () => {
              const t5 = i2.svgUrl = s2.result;
              n2.src = await e3 ? `${t5}#svgView(preserveAspectRatio(none))` : t5;
            };
            n2.onerror = s2.onerror = a3;
          }));
          s2.readAsDataURL(t3);
          await a2;
        } else i2.bitmap = await createImageBitmap(t3);
        i2.refCounter = 1;
      } catch (t3) {
        warn(t3);
        i2 = null;
      }
      this.#y.set(t2, i2);
      i2 && this.#y.set(i2.id, i2);
      return i2;
    }
    async getFromFile(t2) {
      const { lastModified: e2, name: i2, size: s2, type: n2 } = t2;
      return this.#x(`${e2}_${i2}_${s2}_${n2}`, t2);
    }
    async getFromUrl(t2) {
      return this.#x(t2, t2);
    }
    async getFromBlob(t2, e2) {
      const i2 = await e2;
      return this.#x(t2, i2);
    }
    async getFromId(t2) {
      this.#y ||= /* @__PURE__ */ new Map();
      const e2 = this.#y.get(t2);
      if (!e2) return null;
      if (e2.bitmap) {
        e2.refCounter += 1;
        return e2;
      }
      if (e2.file) return this.getFromFile(e2.file);
      if (e2.blobPromise) {
        const { blobPromise: t3 } = e2;
        delete e2.blobPromise;
        return this.getFromBlob(e2.id, t3);
      }
      return this.getFromUrl(e2.url);
    }
    getFromCanvas(t2, e2) {
      this.#y ||= /* @__PURE__ */ new Map();
      let i2 = this.#y.get(t2);
      if (i2?.bitmap) {
        i2.refCounter += 1;
        return i2;
      }
      const s2 = new OffscreenCanvas(e2.width, e2.height);
      s2.getContext("2d").drawImage(e2, 0, 0);
      i2 = { bitmap: s2.transferToImageBitmap(), id: `image_${this.#v}_${this.#w++}`, refCounter: 1, isSvg: false };
      this.#y.set(t2, i2);
      this.#y.set(i2.id, i2);
      return i2;
    }
    getSvgUrl(t2) {
      const e2 = this.#y.get(t2);
      return e2?.isSvg ? e2.svgUrl : null;
    }
    deleteId(t2) {
      this.#y ||= /* @__PURE__ */ new Map();
      const e2 = this.#y.get(t2);
      if (!e2) return;
      e2.refCounter -= 1;
      if (0 !== e2.refCounter) return;
      const { bitmap: i2 } = e2;
      if (!e2.url && !e2.file) {
        const t3 = new OffscreenCanvas(i2.width, i2.height);
        t3.getContext("bitmaprenderer").transferFromImageBitmap(i2);
        e2.blobPromise = t3.convertToBlob();
      }
      i2.close?.();
      e2.bitmap = null;
    }
    isValidId(t2) {
      return t2.startsWith(`image_${this.#v}_`);
    }
  };
  var CommandManager = class {
    #_ = [];
    #E = false;
    #S;
    #C = -1;
    constructor(t2 = 128) {
      this.#S = t2;
    }
    add({ cmd: t2, undo: e2, post: i2, mustExec: s2, type: n2 = NaN, overwriteIfSameType: a2 = false, keepUndo: r2 = false }) {
      s2 && t2();
      if (this.#E) return;
      const o2 = { cmd: t2, undo: e2, post: i2, type: n2 };
      if (-1 === this.#C) {
        this.#_.length > 0 && (this.#_.length = 0);
        this.#C = 0;
        this.#_.push(o2);
        return;
      }
      if (a2 && this.#_[this.#C].type === n2) {
        r2 && (o2.undo = this.#_[this.#C].undo);
        this.#_[this.#C] = o2;
        return;
      }
      const l2 = this.#C + 1;
      if (l2 === this.#S) this.#_.splice(0, 1);
      else {
        this.#C = l2;
        l2 < this.#_.length && this.#_.splice(l2);
      }
      this.#_.push(o2);
    }
    undo() {
      if (-1 === this.#C) return;
      this.#E = true;
      const { undo: t2, post: e2 } = this.#_[this.#C];
      t2();
      e2?.();
      this.#E = false;
      this.#C -= 1;
    }
    redo() {
      if (this.#C < this.#_.length - 1) {
        this.#C += 1;
        this.#E = true;
        const { cmd: t2, post: e2 } = this.#_[this.#C];
        t2();
        e2?.();
        this.#E = false;
      }
    }
    hasSomethingToUndo() {
      return -1 !== this.#C;
    }
    hasSomethingToRedo() {
      return this.#C < this.#_.length - 1;
    }
    cleanType(t2) {
      if (-1 !== this.#C) {
        for (let e2 = this.#C; e2 >= 0; e2--) if (this.#_[e2].type !== t2) {
          this.#_.splice(e2 + 1, this.#C - e2);
          this.#C = e2;
          return;
        }
        this.#_.length = 0;
        this.#C = -1;
      }
    }
    destroy() {
      this.#_ = null;
    }
  };
  var KeyboardManager = class {
    constructor(t2) {
      this.buffer = [];
      this.callbacks = /* @__PURE__ */ new Map();
      this.allKeys = /* @__PURE__ */ new Set();
      const { isMac: e2 } = util_FeatureTest.platform;
      for (const [i2, s2, n2 = {}] of t2) for (const t3 of i2) {
        const i3 = t3.startsWith("mac+");
        if (e2 && i3) {
          this.callbacks.set(t3.slice(4), { callback: s2, options: n2 });
          this.allKeys.add(t3.split("+").at(-1));
        } else if (!e2 && !i3) {
          this.callbacks.set(t3, { callback: s2, options: n2 });
          this.allKeys.add(t3.split("+").at(-1));
        }
      }
    }
    #T(t2) {
      t2.altKey && this.buffer.push("alt");
      t2.ctrlKey && this.buffer.push("ctrl");
      t2.metaKey && this.buffer.push("meta");
      t2.shiftKey && this.buffer.push("shift");
      this.buffer.push(t2.key);
      const e2 = this.buffer.join("+");
      this.buffer.length = 0;
      return e2;
    }
    exec(t2, e2) {
      if (!this.allKeys.has(e2.key)) return;
      const i2 = this.callbacks.get(this.#T(e2));
      if (!i2) return;
      const { callback: s2, options: { bubbles: n2 = false, args: a2 = [], checker: r2 = null } } = i2;
      if (!r2 || r2(t2, e2)) {
        s2.bind(t2, ...a2, e2)();
        n2 || stopEvent(e2);
      }
    }
  };
  var ColorManager = class _ColorManager {
    static _colorsMapping = /* @__PURE__ */ new Map([["CanvasText", [0, 0, 0]], ["Canvas", [255, 255, 255]]]);
    get _colors() {
      const t2 = /* @__PURE__ */ new Map([["CanvasText", null], ["Canvas", null]]);
      !(function getColorValues(t3) {
        const e2 = document.createElement("span");
        e2.style.visibility = "hidden";
        document.body.append(e2);
        for (const i2 of t3.keys()) {
          e2.style.color = i2;
          const s2 = window.getComputedStyle(e2).color;
          t3.set(i2, getRGB(s2));
        }
        e2.remove();
      })(t2);
      return shadow(this, "_colors", t2);
    }
    convert(t2) {
      const e2 = getRGB(t2);
      if (!window.matchMedia("(forced-colors: active)").matches) return e2;
      for (const [t3, i2] of this._colors) if (i2.every(((t4, i3) => t4 === e2[i3]))) return _ColorManager._colorsMapping.get(t3);
      return e2;
    }
    getHexCode(t2) {
      const e2 = this._colors.get(t2);
      return e2 ? Util.makeHexColor(...e2) : t2;
    }
  };
  var AnnotationEditorUIManager = class _AnnotationEditorUIManager {
    #M = new AbortController();
    #P = null;
    #D = /* @__PURE__ */ new Map();
    #k = /* @__PURE__ */ new Map();
    #R = null;
    #I = null;
    #F = null;
    #L = new CommandManager();
    #O = null;
    #N = null;
    #B = 0;
    #H = /* @__PURE__ */ new Set();
    #z = null;
    #U = null;
    #G = /* @__PURE__ */ new Set();
    _editorUndoBar = null;
    #$ = false;
    #V = false;
    #j = false;
    #W = null;
    #q = null;
    #X = null;
    #K = null;
    #Y = false;
    #Q = null;
    #J = new IdManager();
    #Z = false;
    #tt = false;
    #et = null;
    #it = null;
    #st = null;
    #nt = null;
    #at = g.NONE;
    #rt = /* @__PURE__ */ new Set();
    #ot = null;
    #lt = null;
    #ht = null;
    #dt = { isEditing: false, isEmpty: true, hasSomethingToUndo: false, hasSomethingToRedo: false, hasSelectedEditor: false, hasSelectedText: false };
    #ct = [0, 0];
    #ut = null;
    #pt = null;
    #gt = null;
    #mt = null;
    static TRANSLATE_SMALL = 1;
    static TRANSLATE_BIG = 10;
    static get _keyboardManager() {
      const t2 = _AnnotationEditorUIManager.prototype, arrowChecker = (t3) => t3.#pt.contains(document.activeElement) && "BUTTON" !== document.activeElement.tagName && t3.hasSomethingToControl(), textInputChecker = (t3, { target: e3 }) => {
        if (e3 instanceof HTMLInputElement) {
          const { type: t4 } = e3;
          return "text" !== t4 && "number" !== t4;
        }
        return true;
      }, e2 = this.TRANSLATE_SMALL, i2 = this.TRANSLATE_BIG;
      return shadow(this, "_keyboardManager", new KeyboardManager([[["ctrl+a", "mac+meta+a"], t2.selectAll, { checker: textInputChecker }], [["ctrl+z", "mac+meta+z"], t2.undo, { checker: textInputChecker }], [["ctrl+y", "ctrl+shift+z", "mac+meta+shift+z", "ctrl+shift+Z", "mac+meta+shift+Z"], t2.redo, { checker: textInputChecker }], [["Backspace", "alt+Backspace", "ctrl+Backspace", "shift+Backspace", "mac+Backspace", "mac+alt+Backspace", "mac+ctrl+Backspace", "Delete", "ctrl+Delete", "shift+Delete", "mac+Delete"], t2.delete, { checker: textInputChecker }], [["Enter", "mac+Enter"], t2.addNewEditorFromKeyboard, { checker: (t3, { target: e3 }) => !(e3 instanceof HTMLButtonElement) && t3.#pt.contains(e3) && !t3.isEnterHandled }], [[" ", "mac+ "], t2.addNewEditorFromKeyboard, { checker: (t3, { target: e3 }) => !(e3 instanceof HTMLButtonElement) && t3.#pt.contains(document.activeElement) }], [["Escape", "mac+Escape"], t2.unselectAll], [["ArrowLeft", "mac+ArrowLeft"], t2.translateSelectedEditors, { args: [-e2, 0], checker: arrowChecker }], [["ctrl+ArrowLeft", "mac+shift+ArrowLeft"], t2.translateSelectedEditors, { args: [-i2, 0], checker: arrowChecker }], [["ArrowRight", "mac+ArrowRight"], t2.translateSelectedEditors, { args: [e2, 0], checker: arrowChecker }], [["ctrl+ArrowRight", "mac+shift+ArrowRight"], t2.translateSelectedEditors, { args: [i2, 0], checker: arrowChecker }], [["ArrowUp", "mac+ArrowUp"], t2.translateSelectedEditors, { args: [0, -e2], checker: arrowChecker }], [["ctrl+ArrowUp", "mac+shift+ArrowUp"], t2.translateSelectedEditors, { args: [0, -i2], checker: arrowChecker }], [["ArrowDown", "mac+ArrowDown"], t2.translateSelectedEditors, { args: [0, e2], checker: arrowChecker }], [["ctrl+ArrowDown", "mac+shift+ArrowDown"], t2.translateSelectedEditors, { args: [0, i2], checker: arrowChecker }]]));
    }
    constructor(t2, e2, i2, s2, n2, a2, r2, o2, l2, h2, d2, c2, u2) {
      const p2 = this._signal = this.#M.signal;
      this.#pt = t2;
      this.#gt = e2;
      this.#R = i2;
      this._eventBus = s2;
      s2._on("editingaction", this.onEditingAction.bind(this), { signal: p2 });
      s2._on("pagechanging", this.onPageChanging.bind(this), { signal: p2 });
      s2._on("scalechanging", this.onScaleChanging.bind(this), { signal: p2 });
      s2._on("rotationchanging", this.onRotationChanging.bind(this), { signal: p2 });
      s2._on("setpreference", this.onSetPreference.bind(this), { signal: p2 });
      s2._on("switchannotationeditorparams", ((t3) => this.updateParams(t3.type, t3.value)), { signal: p2 });
      this.#ft();
      this.#bt();
      this.#At();
      this.#I = n2.annotationStorage;
      this.#W = n2.filterFactory;
      this.#lt = a2;
      this.#K = r2 || null;
      this.#$ = o2;
      this.#V = l2;
      this.#j = h2;
      this.#nt = d2 || null;
      this.viewParameters = { realScale: PixelsPerInch.PDF_TO_CSS_UNITS, rotation: 0 };
      this.isShiftKeyDown = false;
      this._editorUndoBar = c2 || null;
      this._supportsPinchToZoom = false !== u2;
    }
    destroy() {
      this.#mt?.resolve();
      this.#mt = null;
      this.#M?.abort();
      this.#M = null;
      this._signal = null;
      for (const t2 of this.#k.values()) t2.destroy();
      this.#k.clear();
      this.#D.clear();
      this.#G.clear();
      this.#P = null;
      this.#rt.clear();
      this.#L.destroy();
      this.#R?.destroy();
      this.#Q?.hide();
      this.#Q = null;
      if (this.#q) {
        clearTimeout(this.#q);
        this.#q = null;
      }
      if (this.#ut) {
        clearTimeout(this.#ut);
        this.#ut = null;
      }
      this._editorUndoBar?.destroy();
    }
    combinedSignal(t2) {
      return AbortSignal.any([this._signal, t2.signal]);
    }
    get mlManager() {
      return this.#nt;
    }
    get useNewAltTextFlow() {
      return this.#V;
    }
    get useNewAltTextWhenAddingImage() {
      return this.#j;
    }
    get hcmFilter() {
      return shadow(this, "hcmFilter", this.#lt ? this.#W.addHCMFilter(this.#lt.foreground, this.#lt.background) : "none");
    }
    get direction() {
      return shadow(this, "direction", getComputedStyle(this.#pt).direction);
    }
    get highlightColors() {
      return shadow(this, "highlightColors", this.#K ? new Map(this.#K.split(",").map(((t2) => t2.split("=").map(((t3) => t3.trim()))))) : null);
    }
    get highlightColorNames() {
      return shadow(this, "highlightColorNames", this.highlightColors ? new Map(Array.from(this.highlightColors, ((t2) => t2.reverse()))) : null);
    }
    setCurrentDrawingSession(t2) {
      if (t2) {
        this.unselectAll();
        this.disableUserSelect(true);
      } else this.disableUserSelect(false);
      this.#N = t2;
    }
    setMainHighlightColorPicker(t2) {
      this.#st = t2;
    }
    editAltText(t2, e2 = false) {
      this.#R?.editAltText(this, t2, e2);
    }
    switchToMode(t2, e2) {
      this._eventBus.on("annotationeditormodechanged", e2, { once: true, signal: this._signal });
      this._eventBus.dispatch("showannotationeditorui", { source: this, mode: t2 });
    }
    setPreference(t2, e2) {
      this._eventBus.dispatch("setpreference", { source: this, name: t2, value: e2 });
    }
    onSetPreference({ name: t2, value: e2 }) {
      if ("enableNewAltTextWhenAddingImage" === t2) this.#j = e2;
    }
    onPageChanging({ pageNumber: t2 }) {
      this.#B = t2 - 1;
    }
    focusMainContainer() {
      this.#pt.focus();
    }
    findParent(t2, e2) {
      for (const i2 of this.#k.values()) {
        const { x: s2, y: n2, width: a2, height: r2 } = i2.div.getBoundingClientRect();
        if (t2 >= s2 && t2 <= s2 + a2 && e2 >= n2 && e2 <= n2 + r2) return i2;
      }
      return null;
    }
    disableUserSelect(t2 = false) {
      this.#gt.classList.toggle("noUserSelect", t2);
    }
    addShouldRescale(t2) {
      this.#G.add(t2);
    }
    removeShouldRescale(t2) {
      this.#G.delete(t2);
    }
    onScaleChanging({ scale: t2 }) {
      this.commitOrRemove();
      this.viewParameters.realScale = t2 * PixelsPerInch.PDF_TO_CSS_UNITS;
      for (const t3 of this.#G) t3.onScaleChanging();
      this.#N?.onScaleChanging();
    }
    onRotationChanging({ pagesRotation: t2 }) {
      this.commitOrRemove();
      this.viewParameters.rotation = t2;
    }
    #wt({ anchorNode: t2 }) {
      return t2.nodeType === Node.TEXT_NODE ? t2.parentElement : t2;
    }
    #vt(t2) {
      const { currentLayer: e2 } = this;
      if (e2.hasTextLayer(t2)) return e2;
      for (const e3 of this.#k.values()) if (e3.hasTextLayer(t2)) return e3;
      return null;
    }
    highlightSelection(t2 = "") {
      const e2 = document.getSelection();
      if (!e2 || e2.isCollapsed) return;
      const { anchorNode: i2, anchorOffset: s2, focusNode: n2, focusOffset: a2 } = e2, r2 = e2.toString(), o2 = this.#wt(e2).closest(".textLayer"), l2 = this.getSelectionBoxes(o2);
      if (!l2) return;
      e2.empty();
      const h2 = this.#vt(o2), d2 = this.#at === g.NONE, callback = () => {
        h2?.createAndAddNewEditor({ x: 0, y: 0 }, false, { methodOfCreation: t2, boxes: l2, anchorNode: i2, anchorOffset: s2, focusNode: n2, focusOffset: a2, text: r2 });
        d2 && this.showAllEditors("highlight", true, true);
      };
      d2 ? this.switchToMode(g.HIGHLIGHT, callback) : callback();
    }
    #yt() {
      const t2 = document.getSelection();
      if (!t2 || t2.isCollapsed) return;
      const e2 = this.#wt(t2).closest(".textLayer"), i2 = this.getSelectionBoxes(e2);
      if (i2) {
        this.#Q ||= new HighlightToolbar(this);
        this.#Q.show(e2, i2, "ltr" === this.direction);
      }
    }
    addToAnnotationStorage(t2) {
      t2.isEmpty() || !this.#I || this.#I.has(t2.id) || this.#I.setValue(t2.id, t2);
    }
    #xt() {
      const t2 = document.getSelection();
      if (!t2 || t2.isCollapsed) {
        if (this.#ot) {
          this.#Q?.hide();
          this.#ot = null;
          this.#_t({ hasSelectedText: false });
        }
        return;
      }
      const { anchorNode: e2 } = t2;
      if (e2 === this.#ot) return;
      const i2 = this.#wt(t2).closest(".textLayer");
      if (i2) {
        this.#Q?.hide();
        this.#ot = e2;
        this.#_t({ hasSelectedText: true });
        if (this.#at === g.HIGHLIGHT || this.#at === g.NONE) {
          this.#at === g.HIGHLIGHT && this.showAllEditors("highlight", true, true);
          this.#Y = this.isShiftKeyDown;
          if (!this.isShiftKeyDown) {
            const t3 = this.#at === g.HIGHLIGHT ? this.#vt(i2) : null;
            t3?.toggleDrawing();
            const e3 = new AbortController(), s2 = this.combinedSignal(e3), pointerup = (i3) => {
              if ("pointerup" !== i3.type || 0 === i3.button) {
                e3.abort();
                t3?.toggleDrawing(true);
                "pointerup" === i3.type && this.#Et("main_toolbar");
              }
            };
            window.addEventListener("pointerup", pointerup, { signal: s2 });
            window.addEventListener("blur", pointerup, { signal: s2 });
          }
        }
      } else if (this.#ot) {
        this.#Q?.hide();
        this.#ot = null;
        this.#_t({ hasSelectedText: false });
      }
    }
    #Et(t2 = "") {
      this.#at === g.HIGHLIGHT ? this.highlightSelection(t2) : this.#$ && this.#yt();
    }
    #ft() {
      document.addEventListener("selectionchange", this.#xt.bind(this), { signal: this._signal });
    }
    #St() {
      if (this.#X) return;
      this.#X = new AbortController();
      const t2 = this.combinedSignal(this.#X);
      window.addEventListener("focus", this.focus.bind(this), { signal: t2 });
      window.addEventListener("blur", this.blur.bind(this), { signal: t2 });
    }
    #Ct() {
      this.#X?.abort();
      this.#X = null;
    }
    blur() {
      this.isShiftKeyDown = false;
      if (this.#Y) {
        this.#Y = false;
        this.#Et("main_toolbar");
      }
      if (!this.hasSelection) return;
      const { activeElement: t2 } = document;
      for (const e2 of this.#rt) if (e2.div.contains(t2)) {
        this.#it = [e2, t2];
        e2._focusEventsAllowed = false;
        break;
      }
    }
    focus() {
      if (!this.#it) return;
      const [t2, e2] = this.#it;
      this.#it = null;
      e2.addEventListener("focusin", (() => {
        t2._focusEventsAllowed = true;
      }), { once: true, signal: this._signal });
      e2.focus();
    }
    #At() {
      if (this.#et) return;
      this.#et = new AbortController();
      const t2 = this.combinedSignal(this.#et);
      window.addEventListener("keydown", this.keydown.bind(this), { signal: t2 });
      window.addEventListener("keyup", this.keyup.bind(this), { signal: t2 });
    }
    #Tt() {
      this.#et?.abort();
      this.#et = null;
    }
    #Mt() {
      if (this.#O) return;
      this.#O = new AbortController();
      const t2 = this.combinedSignal(this.#O);
      document.addEventListener("copy", this.copy.bind(this), { signal: t2 });
      document.addEventListener("cut", this.cut.bind(this), { signal: t2 });
      document.addEventListener("paste", this.paste.bind(this), { signal: t2 });
    }
    #Pt() {
      this.#O?.abort();
      this.#O = null;
    }
    #bt() {
      const t2 = this._signal;
      document.addEventListener("dragover", this.dragOver.bind(this), { signal: t2 });
      document.addEventListener("drop", this.drop.bind(this), { signal: t2 });
    }
    addEditListeners() {
      this.#At();
      this.#Mt();
    }
    removeEditListeners() {
      this.#Tt();
      this.#Pt();
    }
    dragOver(t2) {
      for (const { type: e2 } of t2.dataTransfer.items) for (const i2 of this.#U) if (i2.isHandlingMimeForPasting(e2)) {
        t2.dataTransfer.dropEffect = "copy";
        t2.preventDefault();
        return;
      }
    }
    drop(t2) {
      for (const e2 of t2.dataTransfer.items) for (const i2 of this.#U) if (i2.isHandlingMimeForPasting(e2.type)) {
        i2.paste(e2, this.currentLayer);
        t2.preventDefault();
        return;
      }
    }
    copy(t2) {
      t2.preventDefault();
      this.#P?.commitOrRemove();
      if (!this.hasSelection) return;
      const e2 = [];
      for (const t3 of this.#rt) {
        const i2 = t3.serialize(true);
        i2 && e2.push(i2);
      }
      0 !== e2.length && t2.clipboardData.setData("application/pdfjs", JSON.stringify(e2));
    }
    cut(t2) {
      this.copy(t2);
      this.delete();
    }
    async paste(t2) {
      t2.preventDefault();
      const { clipboardData: e2 } = t2;
      for (const t3 of e2.items) for (const e3 of this.#U) if (e3.isHandlingMimeForPasting(t3.type)) {
        e3.paste(t3, this.currentLayer);
        return;
      }
      let i2 = e2.getData("application/pdfjs");
      if (!i2) return;
      try {
        i2 = JSON.parse(i2);
      } catch (t3) {
        warn(`paste: "${t3.message}".`);
        return;
      }
      if (!Array.isArray(i2)) return;
      this.unselectAll();
      const s2 = this.currentLayer;
      try {
        const t3 = [];
        for (const e3 of i2) {
          const i3 = await s2.deserialize(e3);
          if (!i3) return;
          t3.push(i3);
        }
        const cmd = () => {
          for (const e3 of t3) this.#Dt(e3);
          this.#kt(t3);
        }, undo = () => {
          for (const e3 of t3) e3.remove();
        };
        this.addCommands({ cmd, undo, mustExec: true });
      } catch (t3) {
        warn(`paste: "${t3.message}".`);
      }
    }
    keydown(t2) {
      this.isShiftKeyDown || "Shift" !== t2.key || (this.isShiftKeyDown = true);
      this.#at === g.NONE || this.isEditorHandlingKeyboard || _AnnotationEditorUIManager._keyboardManager.exec(this, t2);
    }
    keyup(t2) {
      if (this.isShiftKeyDown && "Shift" === t2.key) {
        this.isShiftKeyDown = false;
        if (this.#Y) {
          this.#Y = false;
          this.#Et("main_toolbar");
        }
      }
    }
    onEditingAction({ name: t2 }) {
      switch (t2) {
        case "undo":
        case "redo":
        case "delete":
        case "selectAll":
          this[t2]();
          break;
        case "highlightSelection":
          this.highlightSelection("context_menu");
      }
    }
    #_t(t2) {
      if (Object.entries(t2).some((([t3, e2]) => this.#dt[t3] !== e2))) {
        this._eventBus.dispatch("annotationeditorstateschanged", { source: this, details: Object.assign(this.#dt, t2) });
        this.#at === g.HIGHLIGHT && false === t2.hasSelectedEditor && this.#Rt([[m.HIGHLIGHT_FREE, true]]);
      }
    }
    #Rt(t2) {
      this._eventBus.dispatch("annotationeditorparamschanged", { source: this, details: t2 });
    }
    setEditingState(t2) {
      if (t2) {
        this.#St();
        this.#Mt();
        this.#_t({ isEditing: this.#at !== g.NONE, isEmpty: this.#It(), hasSomethingToUndo: this.#L.hasSomethingToUndo(), hasSomethingToRedo: this.#L.hasSomethingToRedo(), hasSelectedEditor: false });
      } else {
        this.#Ct();
        this.#Pt();
        this.#_t({ isEditing: false });
        this.disableUserSelect(false);
      }
    }
    registerEditorTypes(t2) {
      if (!this.#U) {
        this.#U = t2;
        for (const t3 of this.#U) this.#Rt(t3.defaultPropertiesToUpdate);
      }
    }
    getId() {
      return this.#J.id;
    }
    get currentLayer() {
      return this.#k.get(this.#B);
    }
    getLayer(t2) {
      return this.#k.get(t2);
    }
    get currentPageIndex() {
      return this.#B;
    }
    addLayer(t2) {
      this.#k.set(t2.pageIndex, t2);
      this.#Z ? t2.enable() : t2.disable();
    }
    removeLayer(t2) {
      this.#k.delete(t2.pageIndex);
    }
    async updateMode(t2, e2 = null, i2 = false) {
      if (this.#at !== t2) {
        if (this.#mt) {
          await this.#mt.promise;
          if (!this.#mt) return;
        }
        this.#mt = Promise.withResolvers();
        this.#at = t2;
        if (t2 !== g.NONE) {
          this.setEditingState(true);
          await this.#Ft();
          this.unselectAll();
          for (const e3 of this.#k.values()) e3.updateMode(t2);
          if (e2) {
            for (const t3 of this.#D.values()) if (t3.annotationElementId === e2) {
              this.setSelected(t3);
              t3.enterInEditMode();
            } else t3.unselect();
            this.#mt.resolve();
          } else {
            i2 && this.addNewEditorFromKeyboard();
            this.#mt.resolve();
          }
        } else {
          this.setEditingState(false);
          this.#Lt();
          this._editorUndoBar?.hide();
          this.#mt.resolve();
        }
      }
    }
    addNewEditorFromKeyboard() {
      this.currentLayer.canCreateNewEmptyEditor() && this.currentLayer.addNewEditor();
    }
    updateToolbar(t2) {
      t2 !== this.#at && this._eventBus.dispatch("switchannotationeditormode", { source: this, mode: t2 });
    }
    updateParams(t2, e2) {
      if (this.#U) {
        switch (t2) {
          case m.CREATE:
            this.currentLayer.addNewEditor();
            return;
          case m.HIGHLIGHT_DEFAULT_COLOR:
            this.#st?.updateColor(e2);
            break;
          case m.HIGHLIGHT_SHOW_ALL:
            this._eventBus.dispatch("reporttelemetry", { source: this, details: { type: "editing", data: { type: "highlight", action: "toggle_visibility" } } });
            (this.#ht ||= /* @__PURE__ */ new Map()).set(t2, e2);
            this.showAllEditors("highlight", e2);
        }
        for (const i2 of this.#rt) i2.updateParams(t2, e2);
        for (const i2 of this.#U) i2.updateDefaultParams(t2, e2);
      }
    }
    showAllEditors(t2, e2, i2 = false) {
      for (const i3 of this.#D.values()) i3.editorType === t2 && i3.show(e2);
      (this.#ht?.get(m.HIGHLIGHT_SHOW_ALL) ?? true) !== e2 && this.#Rt([[m.HIGHLIGHT_SHOW_ALL, e2]]);
    }
    enableWaiting(t2 = false) {
      if (this.#tt !== t2) {
        this.#tt = t2;
        for (const e2 of this.#k.values()) {
          t2 ? e2.disableClick() : e2.enableClick();
          e2.div.classList.toggle("waiting", t2);
        }
      }
    }
    async #Ft() {
      if (!this.#Z) {
        this.#Z = true;
        const t2 = [];
        for (const e2 of this.#k.values()) t2.push(e2.enable());
        await Promise.all(t2);
        for (const t3 of this.#D.values()) t3.enable();
      }
    }
    #Lt() {
      this.unselectAll();
      if (this.#Z) {
        this.#Z = false;
        for (const t2 of this.#k.values()) t2.disable();
        for (const t2 of this.#D.values()) t2.disable();
      }
    }
    getEditors(t2) {
      const e2 = [];
      for (const i2 of this.#D.values()) i2.pageIndex === t2 && e2.push(i2);
      return e2;
    }
    getEditor(t2) {
      return this.#D.get(t2);
    }
    addEditor(t2) {
      this.#D.set(t2.id, t2);
    }
    removeEditor(t2) {
      if (t2.div.contains(document.activeElement)) {
        this.#q && clearTimeout(this.#q);
        this.#q = setTimeout((() => {
          this.focusMainContainer();
          this.#q = null;
        }), 0);
      }
      this.#D.delete(t2.id);
      this.unselect(t2);
      t2.annotationElementId && this.#H.has(t2.annotationElementId) || this.#I?.remove(t2.id);
    }
    addDeletedAnnotationElement(t2) {
      this.#H.add(t2.annotationElementId);
      this.addChangedExistingAnnotation(t2);
      t2.deleted = true;
    }
    isDeletedAnnotationElement(t2) {
      return this.#H.has(t2);
    }
    removeDeletedAnnotationElement(t2) {
      this.#H.delete(t2.annotationElementId);
      this.removeChangedExistingAnnotation(t2);
      t2.deleted = false;
    }
    #Dt(t2) {
      const e2 = this.#k.get(t2.pageIndex);
      if (e2) e2.addOrRebuild(t2);
      else {
        this.addEditor(t2);
        this.addToAnnotationStorage(t2);
      }
    }
    setActiveEditor(t2) {
      if (this.#P !== t2) {
        this.#P = t2;
        t2 && this.#Rt(t2.propertiesToUpdate);
      }
    }
    get #Ot() {
      let t2 = null;
      for (t2 of this.#rt) ;
      return t2;
    }
    updateUI(t2) {
      this.#Ot === t2 && this.#Rt(t2.propertiesToUpdate);
    }
    updateUIForDefaultProperties(t2) {
      this.#Rt(t2.defaultPropertiesToUpdate);
    }
    toggleSelected(t2) {
      if (this.#rt.has(t2)) {
        this.#rt.delete(t2);
        t2.unselect();
        this.#_t({ hasSelectedEditor: this.hasSelection });
      } else {
        this.#rt.add(t2);
        t2.select();
        this.#Rt(t2.propertiesToUpdate);
        this.#_t({ hasSelectedEditor: true });
      }
    }
    setSelected(t2) {
      this.#N?.commitOrRemove();
      for (const e2 of this.#rt) e2 !== t2 && e2.unselect();
      this.#rt.clear();
      this.#rt.add(t2);
      t2.select();
      this.#Rt(t2.propertiesToUpdate);
      this.#_t({ hasSelectedEditor: true });
    }
    isSelected(t2) {
      return this.#rt.has(t2);
    }
    get firstSelectedEditor() {
      return this.#rt.values().next().value;
    }
    unselect(t2) {
      t2.unselect();
      this.#rt.delete(t2);
      this.#_t({ hasSelectedEditor: this.hasSelection });
    }
    get hasSelection() {
      return 0 !== this.#rt.size;
    }
    get isEnterHandled() {
      return 1 === this.#rt.size && this.firstSelectedEditor.isEnterHandled;
    }
    undo() {
      this.#L.undo();
      this.#_t({ hasSomethingToUndo: this.#L.hasSomethingToUndo(), hasSomethingToRedo: true, isEmpty: this.#It() });
      this._editorUndoBar?.hide();
    }
    redo() {
      this.#L.redo();
      this.#_t({ hasSomethingToUndo: true, hasSomethingToRedo: this.#L.hasSomethingToRedo(), isEmpty: this.#It() });
    }
    addCommands(t2) {
      this.#L.add(t2);
      this.#_t({ hasSomethingToUndo: true, hasSomethingToRedo: false, isEmpty: this.#It() });
    }
    cleanUndoStack(t2) {
      this.#L.cleanType(t2);
    }
    #It() {
      if (0 === this.#D.size) return true;
      if (1 === this.#D.size) for (const t2 of this.#D.values()) return t2.isEmpty();
      return false;
    }
    delete() {
      this.commitOrRemove();
      const t2 = this.currentLayer?.endDrawingSession(true);
      if (!this.hasSelection && !t2) return;
      const e2 = t2 ? [t2] : [...this.#rt], undo = () => {
        for (const t3 of e2) this.#Dt(t3);
      };
      this.addCommands({ cmd: () => {
        this._editorUndoBar?.show(undo, 1 === e2.length ? e2[0].editorType : e2.length);
        for (const t3 of e2) t3.remove();
      }, undo, mustExec: true });
    }
    commitOrRemove() {
      this.#P?.commitOrRemove();
    }
    hasSomethingToControl() {
      return this.#P || this.hasSelection;
    }
    #kt(t2) {
      for (const t3 of this.#rt) t3.unselect();
      this.#rt.clear();
      for (const e2 of t2) if (!e2.isEmpty()) {
        this.#rt.add(e2);
        e2.select();
      }
      this.#_t({ hasSelectedEditor: this.hasSelection });
    }
    selectAll() {
      for (const t2 of this.#rt) t2.commit();
      this.#kt(this.#D.values());
    }
    unselectAll() {
      if (this.#P) {
        this.#P.commitOrRemove();
        if (this.#at !== g.NONE) return;
      }
      if (!this.#N?.commitOrRemove() && this.hasSelection) {
        for (const t2 of this.#rt) t2.unselect();
        this.#rt.clear();
        this.#_t({ hasSelectedEditor: false });
      }
    }
    translateSelectedEditors(t2, e2, i2 = false) {
      i2 || this.commitOrRemove();
      if (!this.hasSelection) return;
      this.#ct[0] += t2;
      this.#ct[1] += e2;
      const [s2, n2] = this.#ct, a2 = [...this.#rt];
      this.#ut && clearTimeout(this.#ut);
      this.#ut = setTimeout((() => {
        this.#ut = null;
        this.#ct[0] = this.#ct[1] = 0;
        this.addCommands({ cmd: () => {
          for (const t3 of a2) this.#D.has(t3.id) && t3.translateInPage(s2, n2);
        }, undo: () => {
          for (const t3 of a2) this.#D.has(t3.id) && t3.translateInPage(-s2, -n2);
        }, mustExec: false });
      }), 1e3);
      for (const i3 of a2) i3.translateInPage(t2, e2);
    }
    setUpDragSession() {
      if (this.hasSelection) {
        this.disableUserSelect(true);
        this.#z = /* @__PURE__ */ new Map();
        for (const t2 of this.#rt) this.#z.set(t2, { savedX: t2.x, savedY: t2.y, savedPageIndex: t2.pageIndex, newX: 0, newY: 0, newPageIndex: -1 });
      }
    }
    endDragSession() {
      if (!this.#z) return false;
      this.disableUserSelect(false);
      const t2 = this.#z;
      this.#z = null;
      let e2 = false;
      for (const [{ x: i2, y: s2, pageIndex: n2 }, a2] of t2) {
        a2.newX = i2;
        a2.newY = s2;
        a2.newPageIndex = n2;
        e2 ||= i2 !== a2.savedX || s2 !== a2.savedY || n2 !== a2.savedPageIndex;
      }
      if (!e2) return false;
      const move = (t3, e3, i2, s2) => {
        if (this.#D.has(t3.id)) {
          const n2 = this.#k.get(s2);
          if (n2) t3._setParentAndPosition(n2, e3, i2);
          else {
            t3.pageIndex = s2;
            t3.x = e3;
            t3.y = i2;
          }
        }
      };
      this.addCommands({ cmd: () => {
        for (const [e3, { newX: i2, newY: s2, newPageIndex: n2 }] of t2) move(e3, i2, s2, n2);
      }, undo: () => {
        for (const [e3, { savedX: i2, savedY: s2, savedPageIndex: n2 }] of t2) move(e3, i2, s2, n2);
      }, mustExec: true });
      return true;
    }
    dragSelectedEditors(t2, e2) {
      if (this.#z) for (const i2 of this.#z.keys()) i2.drag(t2, e2);
    }
    rebuild(t2) {
      if (null === t2.parent) {
        const e2 = this.getLayer(t2.pageIndex);
        if (e2) {
          e2.changeParent(t2);
          e2.addOrRebuild(t2);
        } else {
          this.addEditor(t2);
          this.addToAnnotationStorage(t2);
          t2.rebuild();
        }
      } else t2.parent.addOrRebuild(t2);
    }
    get isEditorHandlingKeyboard() {
      return this.getActive()?.shouldGetKeyboardEvents() || 1 === this.#rt.size && this.firstSelectedEditor.shouldGetKeyboardEvents();
    }
    isActive(t2) {
      return this.#P === t2;
    }
    getActive() {
      return this.#P;
    }
    getMode() {
      return this.#at;
    }
    get imageManager() {
      return shadow(this, "imageManager", new ImageManager());
    }
    getSelectionBoxes(t2) {
      if (!t2) return null;
      const e2 = document.getSelection();
      for (let i3 = 0, s3 = e2.rangeCount; i3 < s3; i3++) if (!t2.contains(e2.getRangeAt(i3).commonAncestorContainer)) return null;
      const { x: i2, y: s2, width: n2, height: a2 } = t2.getBoundingClientRect();
      let r2;
      switch (t2.getAttribute("data-main-rotation")) {
        case "90":
          r2 = (t3, e3, r3, o3) => ({ x: (e3 - s2) / a2, y: 1 - (t3 + r3 - i2) / n2, width: o3 / a2, height: r3 / n2 });
          break;
        case "180":
          r2 = (t3, e3, r3, o3) => ({ x: 1 - (t3 + r3 - i2) / n2, y: 1 - (e3 + o3 - s2) / a2, width: r3 / n2, height: o3 / a2 });
          break;
        case "270":
          r2 = (t3, e3, r3, o3) => ({ x: 1 - (e3 + o3 - s2) / a2, y: (t3 - i2) / n2, width: o3 / a2, height: r3 / n2 });
          break;
        default:
          r2 = (t3, e3, r3, o3) => ({ x: (t3 - i2) / n2, y: (e3 - s2) / a2, width: r3 / n2, height: o3 / a2 });
      }
      const o2 = [];
      for (let t3 = 0, i3 = e2.rangeCount; t3 < i3; t3++) {
        const i4 = e2.getRangeAt(t3);
        if (!i4.collapsed) for (const { x: t4, y: e3, width: s3, height: n3 } of i4.getClientRects()) 0 !== s3 && 0 !== n3 && o2.push(r2(t4, e3, s3, n3));
      }
      return 0 === o2.length ? null : o2;
    }
    addChangedExistingAnnotation({ annotationElementId: t2, id: e2 }) {
      (this.#F ||= /* @__PURE__ */ new Map()).set(t2, e2);
    }
    removeChangedExistingAnnotation({ annotationElementId: t2 }) {
      this.#F?.delete(t2);
    }
    renderAnnotationElement(t2) {
      const e2 = this.#F?.get(t2.data.id);
      if (!e2) return;
      const i2 = this.#I.getRawValue(e2);
      i2 && (this.#at !== g.NONE || i2.hasBeenModified) && i2.renderAnnotationElement(t2);
    }
  };
  var AltText = class _AltText {
    #o = null;
    #Nt = false;
    #Bt = null;
    #Ht = null;
    #zt = null;
    #Ut = null;
    #Gt = false;
    #$t = null;
    #a = null;
    #Vt = null;
    #jt = null;
    #Wt = false;
    static #qt = null;
    static _l10n = null;
    constructor(t2) {
      this.#a = t2;
      this.#Wt = t2._uiManager.useNewAltTextFlow;
      _AltText.#qt ||= Object.freeze({ added: "pdfjs-editor-new-alt-text-added-button", "added-label": "pdfjs-editor-new-alt-text-added-button-label", missing: "pdfjs-editor-new-alt-text-missing-button", "missing-label": "pdfjs-editor-new-alt-text-missing-button-label", review: "pdfjs-editor-new-alt-text-to-review-button", "review-label": "pdfjs-editor-new-alt-text-to-review-button-label" });
    }
    static initialize(t2) {
      _AltText._l10n ??= t2;
    }
    async render() {
      const t2 = this.#Bt = document.createElement("button");
      t2.className = "altText";
      t2.tabIndex = "0";
      const e2 = this.#Ht = document.createElement("span");
      t2.append(e2);
      if (this.#Wt) {
        t2.classList.add("new");
        t2.setAttribute("data-l10n-id", _AltText.#qt.missing);
        e2.setAttribute("data-l10n-id", _AltText.#qt["missing-label"]);
      } else {
        t2.setAttribute("data-l10n-id", "pdfjs-editor-alt-text-button");
        e2.setAttribute("data-l10n-id", "pdfjs-editor-alt-text-button-label");
      }
      const i2 = this.#a._uiManager._signal;
      t2.addEventListener("contextmenu", noContextMenu, { signal: i2 });
      t2.addEventListener("pointerdown", ((t3) => t3.stopPropagation()), { signal: i2 });
      const onClick = (t3) => {
        t3.preventDefault();
        this.#a._uiManager.editAltText(this.#a);
        this.#Wt && this.#a._reportTelemetry({ action: "pdfjs.image.alt_text.image_status_label_clicked", data: { label: this.#Xt } });
      };
      t2.addEventListener("click", onClick, { capture: true, signal: i2 });
      t2.addEventListener("keydown", ((e3) => {
        if (e3.target === t2 && "Enter" === e3.key) {
          this.#Gt = true;
          onClick(e3);
        }
      }), { signal: i2 });
      await this.#Kt();
      return t2;
    }
    get #Xt() {
      return (this.#o ? "added" : null === this.#o && this.guessedText && "review") || "missing";
    }
    finish() {
      if (this.#Bt) {
        this.#Bt.focus({ focusVisible: this.#Gt });
        this.#Gt = false;
      }
    }
    isEmpty() {
      return this.#Wt ? null === this.#o : !this.#o && !this.#Nt;
    }
    hasData() {
      return this.#Wt ? null !== this.#o || !!this.#Vt : this.isEmpty();
    }
    get guessedText() {
      return this.#Vt;
    }
    async setGuessedText(t2) {
      if (null === this.#o) {
        this.#Vt = t2;
        this.#jt = await _AltText._l10n.get("pdfjs-editor-new-alt-text-generated-alt-text-with-disclaimer", { generatedAltText: t2 });
        this.#Kt();
      }
    }
    toggleAltTextBadge(t2 = false) {
      if (this.#Wt && !this.#o) {
        if (!this.#$t) {
          const t3 = this.#$t = document.createElement("div");
          t3.className = "noAltTextBadge";
          this.#a.div.append(t3);
        }
        this.#$t.classList.toggle("hidden", !t2);
      } else {
        this.#$t?.remove();
        this.#$t = null;
      }
    }
    serialize(t2) {
      let e2 = this.#o;
      t2 || this.#Vt !== e2 || (e2 = this.#jt);
      return { altText: e2, decorative: this.#Nt, guessedText: this.#Vt, textWithDisclaimer: this.#jt };
    }
    get data() {
      return { altText: this.#o, decorative: this.#Nt };
    }
    set data({ altText: t2, decorative: e2, guessedText: i2, textWithDisclaimer: s2, cancel: n2 = false }) {
      if (i2) {
        this.#Vt = i2;
        this.#jt = s2;
      }
      if (this.#o !== t2 || this.#Nt !== e2) {
        if (!n2) {
          this.#o = t2;
          this.#Nt = e2;
        }
        this.#Kt();
      }
    }
    toggle(t2 = false) {
      if (this.#Bt) {
        if (!t2 && this.#Ut) {
          clearTimeout(this.#Ut);
          this.#Ut = null;
        }
        this.#Bt.disabled = !t2;
      }
    }
    shown() {
      this.#a._reportTelemetry({ action: "pdfjs.image.alt_text.image_status_label_displayed", data: { label: this.#Xt } });
    }
    destroy() {
      this.#Bt?.remove();
      this.#Bt = null;
      this.#Ht = null;
      this.#zt = null;
      this.#$t?.remove();
      this.#$t = null;
    }
    async #Kt() {
      const t2 = this.#Bt;
      if (!t2) return;
      if (this.#Wt) {
        t2.classList.toggle("done", !!this.#o);
        t2.setAttribute("data-l10n-id", _AltText.#qt[this.#Xt]);
        this.#Ht?.setAttribute("data-l10n-id", _AltText.#qt[`${this.#Xt}-label`]);
        if (!this.#o) {
          this.#zt?.remove();
          return;
        }
      } else {
        if (!this.#o && !this.#Nt) {
          t2.classList.remove("done");
          this.#zt?.remove();
          return;
        }
        t2.classList.add("done");
        t2.setAttribute("data-l10n-id", "pdfjs-editor-alt-text-edit-button");
      }
      let e2 = this.#zt;
      if (!e2) {
        this.#zt = e2 = document.createElement("span");
        e2.className = "tooltip";
        e2.setAttribute("role", "tooltip");
        e2.id = `alt-text-tooltip-${this.#a.id}`;
        const i3 = 100, s2 = this.#a._uiManager._signal;
        s2.addEventListener("abort", (() => {
          clearTimeout(this.#Ut);
          this.#Ut = null;
        }), { once: true });
        t2.addEventListener("mouseenter", (() => {
          this.#Ut = setTimeout((() => {
            this.#Ut = null;
            this.#zt.classList.add("show");
            this.#a._reportTelemetry({ action: "alt_text_tooltip" });
          }), i3);
        }), { signal: s2 });
        t2.addEventListener("mouseleave", (() => {
          if (this.#Ut) {
            clearTimeout(this.#Ut);
            this.#Ut = null;
          }
          this.#zt?.classList.remove("show");
        }), { signal: s2 });
      }
      if (this.#Nt) e2.setAttribute("data-l10n-id", "pdfjs-editor-alt-text-decorative-tooltip");
      else {
        e2.removeAttribute("data-l10n-id");
        e2.textContent = this.#o;
      }
      e2.parentNode || t2.append(e2);
      const i2 = this.#a.getImageForAltText();
      i2?.setAttribute("aria-describedby", e2.id);
    }
  };
  var TouchManager = class _TouchManager {
    #pt;
    #Yt = false;
    #Qt = null;
    #Jt;
    #Zt;
    #te;
    #ee;
    #ie;
    #se = null;
    #ne;
    #ae = null;
    constructor({ container: t2, isPinchingDisabled: e2 = null, isPinchingStopped: i2 = null, onPinchStart: s2 = null, onPinching: n2 = null, onPinchEnd: a2 = null, signal: r2 }) {
      this.#pt = t2;
      this.#Qt = i2;
      this.#Jt = e2;
      this.#Zt = s2;
      this.#te = n2;
      this.#ee = a2;
      this.#ne = new AbortController();
      this.#ie = AbortSignal.any([r2, this.#ne.signal]);
      t2.addEventListener("touchstart", this.#re.bind(this), { passive: false, signal: this.#ie });
    }
    get MIN_TOUCH_DISTANCE_TO_PINCH() {
      return shadow(this, "MIN_TOUCH_DISTANCE_TO_PINCH", 35 / (window.devicePixelRatio || 1));
    }
    #re(t2) {
      if (this.#Jt?.() || t2.touches.length < 2) return;
      if (!this.#ae) {
        this.#ae = new AbortController();
        const t3 = AbortSignal.any([this.#ie, this.#ae.signal]), e3 = this.#pt, i3 = { signal: t3, passive: false };
        e3.addEventListener("touchmove", this.#oe.bind(this), i3);
        e3.addEventListener("touchend", this.#le.bind(this), i3);
        e3.addEventListener("touchcancel", this.#le.bind(this), i3);
        this.#Zt?.();
      }
      stopEvent(t2);
      if (2 !== t2.touches.length || this.#Qt?.()) {
        this.#se = null;
        return;
      }
      let [e2, i2] = t2.touches;
      e2.identifier > i2.identifier && ([e2, i2] = [i2, e2]);
      this.#se = { touch0X: e2.screenX, touch0Y: e2.screenY, touch1X: i2.screenX, touch1Y: i2.screenY };
    }
    #oe(t2) {
      if (!this.#se || 2 !== t2.touches.length) return;
      let [e2, i2] = t2.touches;
      e2.identifier > i2.identifier && ([e2, i2] = [i2, e2]);
      const { screenX: s2, screenY: n2 } = e2, { screenX: a2, screenY: r2 } = i2, o2 = this.#se, { touch0X: l2, touch0Y: h2, touch1X: d2, touch1Y: c2 } = o2, u2 = d2 - l2, p2 = c2 - h2, g2 = a2 - s2, m2 = r2 - n2, f2 = Math.hypot(g2, m2) || 1, b2 = Math.hypot(u2, p2) || 1;
      if (!this.#Yt && Math.abs(b2 - f2) <= _TouchManager.MIN_TOUCH_DISTANCE_TO_PINCH) return;
      o2.touch0X = s2;
      o2.touch0Y = n2;
      o2.touch1X = a2;
      o2.touch1Y = r2;
      t2.preventDefault();
      if (!this.#Yt) {
        this.#Yt = true;
        return;
      }
      const A2 = [(s2 + a2) / 2, (n2 + r2) / 2];
      this.#te?.(A2, b2, f2);
    }
    #le(t2) {
      this.#ae.abort();
      this.#ae = null;
      this.#ee?.();
      if (this.#se) {
        t2.preventDefault();
        this.#se = null;
        this.#Yt = false;
      }
    }
    destroy() {
      this.#ne?.abort();
      this.#ne = null;
    }
  };
  var AnnotationEditor = class _AnnotationEditor {
    #he = null;
    #de = null;
    #o = null;
    #ce = false;
    #ue = null;
    #pe = "";
    #ge = false;
    #me = null;
    #fe = null;
    #be = null;
    #Ae = null;
    #we = "";
    #ve = false;
    #ye = null;
    #xe = false;
    #_e = false;
    #Ee = false;
    #Se = null;
    #Ce = 0;
    #Te = 0;
    #Me = null;
    #Pe = null;
    _editToolbar = null;
    _initialOptions = /* @__PURE__ */ Object.create(null);
    _initialData = null;
    _isVisible = true;
    _uiManager = null;
    _focusEventsAllowed = true;
    static _l10n = null;
    static _l10nResizer = null;
    #De = false;
    #ke = _AnnotationEditor._zIndex++;
    static _borderLineWidth = -1;
    static _colorManager = new ColorManager();
    static _zIndex = 1;
    static _telemetryTimeout = 1e3;
    static get _resizerKeyboardManager() {
      const t2 = _AnnotationEditor.prototype._resizeWithKeyboard, e2 = AnnotationEditorUIManager.TRANSLATE_SMALL, i2 = AnnotationEditorUIManager.TRANSLATE_BIG;
      return shadow(this, "_resizerKeyboardManager", new KeyboardManager([[["ArrowLeft", "mac+ArrowLeft"], t2, { args: [-e2, 0] }], [["ctrl+ArrowLeft", "mac+shift+ArrowLeft"], t2, { args: [-i2, 0] }], [["ArrowRight", "mac+ArrowRight"], t2, { args: [e2, 0] }], [["ctrl+ArrowRight", "mac+shift+ArrowRight"], t2, { args: [i2, 0] }], [["ArrowUp", "mac+ArrowUp"], t2, { args: [0, -e2] }], [["ctrl+ArrowUp", "mac+shift+ArrowUp"], t2, { args: [0, -i2] }], [["ArrowDown", "mac+ArrowDown"], t2, { args: [0, e2] }], [["ctrl+ArrowDown", "mac+shift+ArrowDown"], t2, { args: [0, i2] }], [["Escape", "mac+Escape"], _AnnotationEditor.prototype._stopResizingWithKeyboard]]));
    }
    constructor(t2) {
      this.parent = t2.parent;
      this.id = t2.id;
      this.width = this.height = null;
      this.pageIndex = t2.parent.pageIndex;
      this.name = t2.name;
      this.div = null;
      this._uiManager = t2.uiManager;
      this.annotationElementId = null;
      this._willKeepAspectRatio = false;
      this._initialOptions.isCentered = t2.isCentered;
      this._structTreeParentId = null;
      const { rotation: e2, rawDims: { pageWidth: i2, pageHeight: s2, pageX: n2, pageY: a2 } } = this.parent.viewport;
      this.rotation = e2;
      this.pageRotation = (360 + e2 - this._uiManager.viewParameters.rotation) % 360;
      this.pageDimensions = [i2, s2];
      this.pageTranslation = [n2, a2];
      const [r2, o2] = this.parentDimensions;
      this.x = t2.x / r2;
      this.y = t2.y / o2;
      this.isAttachedToDOM = false;
      this.deleted = false;
    }
    get editorType() {
      return Object.getPrototypeOf(this).constructor._type;
    }
    static get isDrawer() {
      return false;
    }
    static get _defaultLineColor() {
      return shadow(this, "_defaultLineColor", this._colorManager.getHexCode("CanvasText"));
    }
    static deleteAnnotationElement(t2) {
      const e2 = new FakeEditor({ id: t2.parent.getNextId(), parent: t2.parent, uiManager: t2._uiManager });
      e2.annotationElementId = t2.annotationElementId;
      e2.deleted = true;
      e2._uiManager.addToAnnotationStorage(e2);
    }
    static initialize(t2, e2) {
      _AnnotationEditor._l10n ??= t2;
      _AnnotationEditor._l10nResizer ||= Object.freeze({ topLeft: "pdfjs-editor-resizer-top-left", topMiddle: "pdfjs-editor-resizer-top-middle", topRight: "pdfjs-editor-resizer-top-right", middleRight: "pdfjs-editor-resizer-middle-right", bottomRight: "pdfjs-editor-resizer-bottom-right", bottomMiddle: "pdfjs-editor-resizer-bottom-middle", bottomLeft: "pdfjs-editor-resizer-bottom-left", middleLeft: "pdfjs-editor-resizer-middle-left" });
      if (-1 !== _AnnotationEditor._borderLineWidth) return;
      const i2 = getComputedStyle(document.documentElement);
      _AnnotationEditor._borderLineWidth = parseFloat(i2.getPropertyValue("--outline-width")) || 0;
    }
    static updateDefaultParams(t2, e2) {
    }
    static get defaultPropertiesToUpdate() {
      return [];
    }
    static isHandlingMimeForPasting(t2) {
      return false;
    }
    static paste(t2, e2) {
      unreachable("Not implemented");
    }
    get propertiesToUpdate() {
      return [];
    }
    get _isDraggable() {
      return this.#De;
    }
    set _isDraggable(t2) {
      this.#De = t2;
      this.div?.classList.toggle("draggable", t2);
    }
    get isEnterHandled() {
      return true;
    }
    center() {
      const [t2, e2] = this.pageDimensions;
      switch (this.parentRotation) {
        case 90:
          this.x -= this.height * e2 / (2 * t2);
          this.y += this.width * t2 / (2 * e2);
          break;
        case 180:
          this.x += this.width / 2;
          this.y += this.height / 2;
          break;
        case 270:
          this.x += this.height * e2 / (2 * t2);
          this.y -= this.width * t2 / (2 * e2);
          break;
        default:
          this.x -= this.width / 2;
          this.y -= this.height / 2;
      }
      this.fixAndSetPosition();
    }
    addCommands(t2) {
      this._uiManager.addCommands(t2);
    }
    get currentLayer() {
      return this._uiManager.currentLayer;
    }
    setInBackground() {
      this.div.style.zIndex = 0;
    }
    setInForeground() {
      this.div.style.zIndex = this.#ke;
    }
    setParent(t2) {
      if (null !== t2) {
        this.pageIndex = t2.pageIndex;
        this.pageDimensions = t2.pageDimensions;
      } else this.#Re();
      this.parent = t2;
    }
    focusin(t2) {
      this._focusEventsAllowed && (this.#ve ? this.#ve = false : this.parent.setSelected(this));
    }
    focusout(t2) {
      if (!this._focusEventsAllowed) return;
      if (!this.isAttachedToDOM) return;
      const e2 = t2.relatedTarget;
      if (!e2?.closest(`#${this.id}`)) {
        t2.preventDefault();
        this.parent?.isMultipleSelection || this.commitOrRemove();
      }
    }
    commitOrRemove() {
      this.isEmpty() ? this.remove() : this.commit();
    }
    commit() {
      this.addToAnnotationStorage();
    }
    addToAnnotationStorage() {
      this._uiManager.addToAnnotationStorage(this);
    }
    setAt(t2, e2, i2, s2) {
      const [n2, a2] = this.parentDimensions;
      [i2, s2] = this.screenToPageTranslation(i2, s2);
      this.x = (t2 + i2) / n2;
      this.y = (e2 + s2) / a2;
      this.fixAndSetPosition();
    }
    #Ie([t2, e2], i2, s2) {
      [i2, s2] = this.screenToPageTranslation(i2, s2);
      this.x += i2 / t2;
      this.y += s2 / e2;
      this._onTranslating(this.x, this.y);
      this.fixAndSetPosition();
    }
    translate(t2, e2) {
      this.#Ie(this.parentDimensions, t2, e2);
    }
    translateInPage(t2, e2) {
      this.#ye ||= [this.x, this.y, this.width, this.height];
      this.#Ie(this.pageDimensions, t2, e2);
      this.div.scrollIntoView({ block: "nearest" });
    }
    drag(t2, e2) {
      this.#ye ||= [this.x, this.y, this.width, this.height];
      const { div: i2, parentDimensions: [s2, n2] } = this;
      this.x += t2 / s2;
      this.y += e2 / n2;
      if (this.parent && (this.x < 0 || this.x > 1 || this.y < 0 || this.y > 1)) {
        const { x: t3, y: e3 } = this.div.getBoundingClientRect();
        if (this.parent.findNewParent(this, t3, e3)) {
          this.x -= Math.floor(this.x);
          this.y -= Math.floor(this.y);
        }
      }
      let { x: a2, y: r2 } = this;
      const [o2, l2] = this.getBaseTranslation();
      a2 += o2;
      r2 += l2;
      const { style: h2 } = i2;
      h2.left = `${(100 * a2).toFixed(2)}%`;
      h2.top = `${(100 * r2).toFixed(2)}%`;
      this._onTranslating(a2, r2);
      i2.scrollIntoView({ block: "nearest" });
    }
    _onTranslating(t2, e2) {
    }
    _onTranslated(t2, e2) {
    }
    get _hasBeenMoved() {
      return !!this.#ye && (this.#ye[0] !== this.x || this.#ye[1] !== this.y);
    }
    get _hasBeenResized() {
      return !!this.#ye && (this.#ye[2] !== this.width || this.#ye[3] !== this.height);
    }
    getBaseTranslation() {
      const [t2, e2] = this.parentDimensions, { _borderLineWidth: i2 } = _AnnotationEditor, s2 = i2 / t2, n2 = i2 / e2;
      switch (this.rotation) {
        case 90:
          return [-s2, n2];
        case 180:
          return [s2, n2];
        case 270:
          return [s2, -n2];
        default:
          return [-s2, -n2];
      }
    }
    get _mustFixPosition() {
      return true;
    }
    fixAndSetPosition(t2 = this.rotation) {
      const { div: { style: e2 }, pageDimensions: [i2, s2] } = this;
      let { x: n2, y: a2, width: r2, height: o2 } = this;
      r2 *= i2;
      o2 *= s2;
      n2 *= i2;
      a2 *= s2;
      if (this._mustFixPosition) switch (t2) {
        case 0:
          n2 = Math.max(0, Math.min(i2 - r2, n2));
          a2 = Math.max(0, Math.min(s2 - o2, a2));
          break;
        case 90:
          n2 = Math.max(0, Math.min(i2 - o2, n2));
          a2 = Math.min(s2, Math.max(r2, a2));
          break;
        case 180:
          n2 = Math.min(i2, Math.max(r2, n2));
          a2 = Math.min(s2, Math.max(o2, a2));
          break;
        case 270:
          n2 = Math.min(i2, Math.max(o2, n2));
          a2 = Math.max(0, Math.min(s2 - r2, a2));
      }
      this.x = n2 /= i2;
      this.y = a2 /= s2;
      const [l2, h2] = this.getBaseTranslation();
      n2 += l2;
      a2 += h2;
      e2.left = `${(100 * n2).toFixed(2)}%`;
      e2.top = `${(100 * a2).toFixed(2)}%`;
      this.moveInDOM();
    }
    static #Fe(t2, e2, i2) {
      switch (i2) {
        case 90:
          return [e2, -t2];
        case 180:
          return [-t2, -e2];
        case 270:
          return [-e2, t2];
        default:
          return [t2, e2];
      }
    }
    screenToPageTranslation(t2, e2) {
      return _AnnotationEditor.#Fe(t2, e2, this.parentRotation);
    }
    pageTranslationToScreen(t2, e2) {
      return _AnnotationEditor.#Fe(t2, e2, 360 - this.parentRotation);
    }
    #Le(t2) {
      switch (t2) {
        case 90: {
          const [t3, e2] = this.pageDimensions;
          return [0, -t3 / e2, e2 / t3, 0];
        }
        case 180:
          return [-1, 0, 0, -1];
        case 270: {
          const [t3, e2] = this.pageDimensions;
          return [0, t3 / e2, -e2 / t3, 0];
        }
        default:
          return [1, 0, 0, 1];
      }
    }
    get parentScale() {
      return this._uiManager.viewParameters.realScale;
    }
    get parentRotation() {
      return (this._uiManager.viewParameters.rotation + this.pageRotation) % 360;
    }
    get parentDimensions() {
      const { parentScale: t2, pageDimensions: [e2, i2] } = this;
      return [e2 * t2, i2 * t2];
    }
    setDims(t2, e2) {
      const [i2, s2] = this.parentDimensions, { style: n2 } = this.div;
      n2.width = `${(100 * t2 / i2).toFixed(2)}%`;
      this.#ge || (n2.height = `${(100 * e2 / s2).toFixed(2)}%`);
    }
    fixDims() {
      const { style: t2 } = this.div, { height: e2, width: i2 } = t2, s2 = i2.endsWith("%"), n2 = !this.#ge && e2.endsWith("%");
      if (s2 && n2) return;
      const [a2, r2] = this.parentDimensions;
      s2 || (t2.width = `${(100 * parseFloat(i2) / a2).toFixed(2)}%`);
      this.#ge || n2 || (t2.height = `${(100 * parseFloat(e2) / r2).toFixed(2)}%`);
    }
    getInitialTranslation() {
      return [0, 0];
    }
    #Oe() {
      if (this.#me) return;
      this.#me = document.createElement("div");
      this.#me.classList.add("resizers");
      const t2 = this._willKeepAspectRatio ? ["topLeft", "topRight", "bottomRight", "bottomLeft"] : ["topLeft", "topMiddle", "topRight", "middleRight", "bottomRight", "bottomMiddle", "bottomLeft", "middleLeft"], e2 = this._uiManager._signal;
      for (const i2 of t2) {
        const t3 = document.createElement("div");
        this.#me.append(t3);
        t3.classList.add("resizer", i2);
        t3.setAttribute("data-resizer-name", i2);
        t3.addEventListener("pointerdown", this.#Ne.bind(this, i2), { signal: e2 });
        t3.addEventListener("contextmenu", noContextMenu, { signal: e2 });
        t3.tabIndex = -1;
      }
      this.div.prepend(this.#me);
    }
    #Ne(t2, e2) {
      e2.preventDefault();
      const { isMac: i2 } = util_FeatureTest.platform;
      if (0 !== e2.button || e2.ctrlKey && i2) return;
      this.#o?.toggle(false);
      const s2 = this._isDraggable;
      this._isDraggable = false;
      this.#fe = [e2.screenX, e2.screenY];
      const n2 = new AbortController(), a2 = this._uiManager.combinedSignal(n2);
      this.parent.togglePointerEvents(false);
      window.addEventListener("pointermove", this.#Be.bind(this, t2), { passive: true, capture: true, signal: a2 });
      window.addEventListener("touchmove", stopEvent, { passive: false, signal: a2 });
      window.addEventListener("contextmenu", noContextMenu, { signal: a2 });
      this.#be = { savedX: this.x, savedY: this.y, savedWidth: this.width, savedHeight: this.height };
      const r2 = this.parent.div.style.cursor, o2 = this.div.style.cursor;
      this.div.style.cursor = this.parent.div.style.cursor = window.getComputedStyle(e2.target).cursor;
      const pointerUpCallback = () => {
        n2.abort();
        this.parent.togglePointerEvents(true);
        this.#o?.toggle(true);
        this._isDraggable = s2;
        this.parent.div.style.cursor = r2;
        this.div.style.cursor = o2;
        this.#He();
      };
      window.addEventListener("pointerup", pointerUpCallback, { signal: a2 });
      window.addEventListener("blur", pointerUpCallback, { signal: a2 });
    }
    #ze(t2, e2, i2, s2) {
      this.width = i2;
      this.height = s2;
      this.x = t2;
      this.y = e2;
      const [n2, a2] = this.parentDimensions;
      this.setDims(n2 * i2, a2 * s2);
      this.fixAndSetPosition();
      this._onResized();
    }
    _onResized() {
    }
    #He() {
      if (!this.#be) return;
      const { savedX: t2, savedY: e2, savedWidth: i2, savedHeight: s2 } = this.#be;
      this.#be = null;
      const n2 = this.x, a2 = this.y, r2 = this.width, o2 = this.height;
      n2 === t2 && a2 === e2 && r2 === i2 && o2 === s2 || this.addCommands({ cmd: this.#ze.bind(this, n2, a2, r2, o2), undo: this.#ze.bind(this, t2, e2, i2, s2), mustExec: true });
    }
    static _round(t2) {
      return Math.round(1e4 * t2) / 1e4;
    }
    #Be(t2, e2) {
      const [i2, s2] = this.parentDimensions, n2 = this.x, a2 = this.y, r2 = this.width, o2 = this.height, l2 = _AnnotationEditor.MIN_SIZE / i2, h2 = _AnnotationEditor.MIN_SIZE / s2, d2 = this.#Le(this.rotation), transf = (t3, e3) => [d2[0] * t3 + d2[2] * e3, d2[1] * t3 + d2[3] * e3], c2 = this.#Le(360 - this.rotation);
      let u2, p2, g2 = false, m2 = false;
      switch (t2) {
        case "topLeft":
          g2 = true;
          u2 = (t3, e3) => [0, 0];
          p2 = (t3, e3) => [t3, e3];
          break;
        case "topMiddle":
          u2 = (t3, e3) => [t3 / 2, 0];
          p2 = (t3, e3) => [t3 / 2, e3];
          break;
        case "topRight":
          g2 = true;
          u2 = (t3, e3) => [t3, 0];
          p2 = (t3, e3) => [0, e3];
          break;
        case "middleRight":
          m2 = true;
          u2 = (t3, e3) => [t3, e3 / 2];
          p2 = (t3, e3) => [0, e3 / 2];
          break;
        case "bottomRight":
          g2 = true;
          u2 = (t3, e3) => [t3, e3];
          p2 = (t3, e3) => [0, 0];
          break;
        case "bottomMiddle":
          u2 = (t3, e3) => [t3 / 2, e3];
          p2 = (t3, e3) => [t3 / 2, 0];
          break;
        case "bottomLeft":
          g2 = true;
          u2 = (t3, e3) => [0, e3];
          p2 = (t3, e3) => [t3, 0];
          break;
        case "middleLeft":
          m2 = true;
          u2 = (t3, e3) => [0, e3 / 2];
          p2 = (t3, e3) => [t3, e3 / 2];
      }
      const f2 = u2(r2, o2), b2 = p2(r2, o2);
      let A2 = transf(...b2);
      const w2 = _AnnotationEditor._round(n2 + A2[0]), v2 = _AnnotationEditor._round(a2 + A2[1]);
      let y2, x2, _2 = 1, E2 = 1;
      if (e2.fromKeyboard) ({ deltaX: y2, deltaY: x2 } = e2);
      else {
        const { screenX: t3, screenY: i3 } = e2, [s3, n3] = this.#fe;
        [y2, x2] = this.screenToPageTranslation(t3 - s3, i3 - n3);
        this.#fe[0] = t3;
        this.#fe[1] = i3;
      }
      [y2, x2] = (S2 = y2 / i2, C2 = x2 / s2, [c2[0] * S2 + c2[2] * C2, c2[1] * S2 + c2[3] * C2]);
      var S2, C2;
      if (g2) {
        const t3 = Math.hypot(r2, o2);
        _2 = E2 = Math.max(Math.min(Math.hypot(b2[0] - f2[0] - y2, b2[1] - f2[1] - x2) / t3, 1 / r2, 1 / o2), l2 / r2, h2 / o2);
      } else m2 ? _2 = Math.max(l2, Math.min(1, Math.abs(b2[0] - f2[0] - y2))) / r2 : E2 = Math.max(h2, Math.min(1, Math.abs(b2[1] - f2[1] - x2))) / o2;
      const T2 = _AnnotationEditor._round(r2 * _2), M2 = _AnnotationEditor._round(o2 * E2);
      A2 = transf(...p2(T2, M2));
      const P2 = w2 - A2[0], D2 = v2 - A2[1];
      this.#ye ||= [this.x, this.y, this.width, this.height];
      this.width = T2;
      this.height = M2;
      this.x = P2;
      this.y = D2;
      this.setDims(i2 * T2, s2 * M2);
      this.fixAndSetPosition();
      this._onResizing();
    }
    _onResizing() {
    }
    altTextFinish() {
      this.#o?.finish();
    }
    async addEditToolbar() {
      if (this._editToolbar || this.#_e) return this._editToolbar;
      this._editToolbar = new EditorToolbar(this);
      this.div.append(this._editToolbar.render());
      this.#o && await this._editToolbar.addAltText(this.#o);
      return this._editToolbar;
    }
    removeEditToolbar() {
      if (this._editToolbar) {
        this._editToolbar.remove();
        this._editToolbar = null;
        this.#o?.destroy();
      }
    }
    addContainer(t2) {
      const e2 = this._editToolbar?.div;
      e2 ? e2.before(t2) : this.div.append(t2);
    }
    getClientDimensions() {
      return this.div.getBoundingClientRect();
    }
    async addAltTextButton() {
      if (!this.#o) {
        AltText.initialize(_AnnotationEditor._l10n);
        this.#o = new AltText(this);
        if (this.#he) {
          this.#o.data = this.#he;
          this.#he = null;
        }
        await this.addEditToolbar();
      }
    }
    get altTextData() {
      return this.#o?.data;
    }
    set altTextData(t2) {
      this.#o && (this.#o.data = t2);
    }
    get guessedAltText() {
      return this.#o?.guessedText;
    }
    async setGuessedAltText(t2) {
      await this.#o?.setGuessedText(t2);
    }
    serializeAltText(t2) {
      return this.#o?.serialize(t2);
    }
    hasAltText() {
      return !!this.#o && !this.#o.isEmpty();
    }
    hasAltTextData() {
      return this.#o?.hasData() ?? false;
    }
    render() {
      this.div = document.createElement("div");
      this.div.setAttribute("data-editor-rotation", (360 - this.rotation) % 360);
      this.div.className = this.name;
      this.div.setAttribute("id", this.id);
      this.div.tabIndex = this.#ce ? -1 : 0;
      this._isVisible || this.div.classList.add("hidden");
      this.setInForeground();
      this.#Ue();
      const [t2, e2] = this.parentDimensions;
      if (this.parentRotation % 180 != 0) {
        this.div.style.maxWidth = `${(100 * e2 / t2).toFixed(2)}%`;
        this.div.style.maxHeight = `${(100 * t2 / e2).toFixed(2)}%`;
      }
      const [i2, s2] = this.getInitialTranslation();
      this.translate(i2, s2);
      bindEvents(this, this.div, ["pointerdown"]);
      this.isResizable && this._uiManager._supportsPinchToZoom && (this.#Pe ||= new TouchManager({ container: this.div, isPinchingDisabled: () => !this.isSelected, onPinchStart: this.#Ge.bind(this), onPinching: this.#$e.bind(this), onPinchEnd: this.#Ve.bind(this), signal: this._uiManager._signal }));
      this._uiManager._editorUndoBar?.hide();
      return this.div;
    }
    #Ge() {
      this.#be = { savedX: this.x, savedY: this.y, savedWidth: this.width, savedHeight: this.height };
      this.#o?.toggle(false);
      this.parent.togglePointerEvents(false);
    }
    #$e(t2, e2, i2) {
      let s2 = i2 / e2 * 0.7 + 1 - 0.7;
      if (1 === s2) return;
      const n2 = this.#Le(this.rotation), transf = (t3, e3) => [n2[0] * t3 + n2[2] * e3, n2[1] * t3 + n2[3] * e3], [a2, r2] = this.parentDimensions, o2 = this.x, l2 = this.y, h2 = this.width, d2 = this.height, c2 = _AnnotationEditor.MIN_SIZE / a2, u2 = _AnnotationEditor.MIN_SIZE / r2;
      s2 = Math.max(Math.min(s2, 1 / h2, 1 / d2), c2 / h2, u2 / d2);
      const p2 = _AnnotationEditor._round(h2 * s2), g2 = _AnnotationEditor._round(d2 * s2);
      if (p2 === h2 && g2 === d2) return;
      this.#ye ||= [o2, l2, h2, d2];
      const m2 = transf(h2 / 2, d2 / 2), f2 = _AnnotationEditor._round(o2 + m2[0]), b2 = _AnnotationEditor._round(l2 + m2[1]), A2 = transf(p2 / 2, g2 / 2);
      this.x = f2 - A2[0];
      this.y = b2 - A2[1];
      this.width = p2;
      this.height = g2;
      this.setDims(a2 * p2, r2 * g2);
      this.fixAndSetPosition();
      this._onResizing();
    }
    #Ve() {
      this.#o?.toggle(true);
      this.parent.togglePointerEvents(true);
      this.#He();
    }
    pointerdown(t2) {
      const { isMac: e2 } = util_FeatureTest.platform;
      if (0 !== t2.button || t2.ctrlKey && e2) t2.preventDefault();
      else {
        this.#ve = true;
        this._isDraggable ? this.#je(t2) : this.#We(t2);
      }
    }
    get isSelected() {
      return this._uiManager.isSelected(this);
    }
    #We(t2) {
      const { isMac: e2 } = util_FeatureTest.platform;
      t2.ctrlKey && !e2 || t2.shiftKey || t2.metaKey && e2 ? this.parent.toggleSelected(this) : this.parent.setSelected(this);
    }
    #je(t2) {
      const { isSelected: e2 } = this;
      this._uiManager.setUpDragSession();
      let i2 = false;
      const s2 = new AbortController(), n2 = this._uiManager.combinedSignal(s2), a2 = { capture: true, passive: false, signal: n2 }, cancelDrag = (t3) => {
        s2.abort();
        this.#ue = null;
        this.#ve = false;
        this._uiManager.endDragSession() || this.#We(t3);
        i2 && this._onStopDragging();
      };
      if (e2) {
        this.#Ce = t2.clientX;
        this.#Te = t2.clientY;
        this.#ue = t2.pointerId;
        this.#pe = t2.pointerType;
        window.addEventListener("pointermove", ((t3) => {
          if (!i2) {
            i2 = true;
            this._onStartDragging();
          }
          const { clientX: e3, clientY: s3, pointerId: n3 } = t3;
          if (n3 !== this.#ue) {
            stopEvent(t3);
            return;
          }
          const [a3, r2] = this.screenToPageTranslation(e3 - this.#Ce, s3 - this.#Te);
          this.#Ce = e3;
          this.#Te = s3;
          this._uiManager.dragSelectedEditors(a3, r2);
        }), a2);
        window.addEventListener("touchmove", stopEvent, a2);
        window.addEventListener("pointerdown", ((t3) => {
          t3.pointerType === this.#pe && (this.#Pe || t3.isPrimary) && cancelDrag(t3);
          stopEvent(t3);
        }), a2);
      }
      const pointerUpCallback = (t3) => {
        this.#ue && this.#ue !== t3.pointerId ? stopEvent(t3) : cancelDrag(t3);
      };
      window.addEventListener("pointerup", pointerUpCallback, { signal: n2 });
      window.addEventListener("blur", pointerUpCallback, { signal: n2 });
    }
    _onStartDragging() {
    }
    _onStopDragging() {
    }
    moveInDOM() {
      this.#Se && clearTimeout(this.#Se);
      this.#Se = setTimeout((() => {
        this.#Se = null;
        this.parent?.moveEditorInDOM(this);
      }), 0);
    }
    _setParentAndPosition(t2, e2, i2) {
      t2.changeParent(this);
      this.x = e2;
      this.y = i2;
      this.fixAndSetPosition();
      this._onTranslated();
    }
    getRect(t2, e2, i2 = this.rotation) {
      const s2 = this.parentScale, [n2, a2] = this.pageDimensions, [r2, o2] = this.pageTranslation, l2 = t2 / s2, h2 = e2 / s2, d2 = this.x * n2, c2 = this.y * a2, u2 = this.width * n2, p2 = this.height * a2;
      switch (i2) {
        case 0:
          return [d2 + l2 + r2, a2 - c2 - h2 - p2 + o2, d2 + l2 + u2 + r2, a2 - c2 - h2 + o2];
        case 90:
          return [d2 + h2 + r2, a2 - c2 + l2 + o2, d2 + h2 + p2 + r2, a2 - c2 + l2 + u2 + o2];
        case 180:
          return [d2 - l2 - u2 + r2, a2 - c2 + h2 + o2, d2 - l2 + r2, a2 - c2 + h2 + p2 + o2];
        case 270:
          return [d2 - h2 - p2 + r2, a2 - c2 - l2 - u2 + o2, d2 - h2 + r2, a2 - c2 - l2 + o2];
        default:
          throw new Error("Invalid rotation");
      }
    }
    getRectInCurrentCoords(t2, e2) {
      const [i2, s2, n2, a2] = t2, r2 = n2 - i2, o2 = a2 - s2;
      switch (this.rotation) {
        case 0:
          return [i2, e2 - a2, r2, o2];
        case 90:
          return [i2, e2 - s2, o2, r2];
        case 180:
          return [n2, e2 - s2, r2, o2];
        case 270:
          return [n2, e2 - a2, o2, r2];
        default:
          throw new Error("Invalid rotation");
      }
    }
    onceAdded(t2) {
    }
    isEmpty() {
      return false;
    }
    enableEditMode() {
      this.#_e = true;
    }
    disableEditMode() {
      this.#_e = false;
    }
    isInEditMode() {
      return this.#_e;
    }
    shouldGetKeyboardEvents() {
      return this.#Ee;
    }
    needsToBeRebuilt() {
      return this.div && !this.isAttachedToDOM;
    }
    get isOnScreen() {
      const { top: t2, left: e2, bottom: i2, right: s2 } = this.getClientDimensions(), { innerHeight: n2, innerWidth: a2 } = window;
      return e2 < a2 && s2 > 0 && t2 < n2 && i2 > 0;
    }
    #Ue() {
      if (this.#Ae || !this.div) return;
      this.#Ae = new AbortController();
      const t2 = this._uiManager.combinedSignal(this.#Ae);
      this.div.addEventListener("focusin", this.focusin.bind(this), { signal: t2 });
      this.div.addEventListener("focusout", this.focusout.bind(this), { signal: t2 });
    }
    rebuild() {
      this.#Ue();
    }
    rotate(t2) {
    }
    resize() {
    }
    serializeDeleted() {
      return { id: this.annotationElementId, deleted: true, pageIndex: this.pageIndex, popupRef: this._initialData?.popupRef || "" };
    }
    serialize(t2 = false, e2 = null) {
      unreachable("An editor must be serializable");
    }
    static async deserialize(t2, e2, i2) {
      const s2 = new this.prototype.constructor({ parent: e2, id: e2.getNextId(), uiManager: i2 });
      s2.rotation = t2.rotation;
      s2.#he = t2.accessibilityData;
      const [n2, a2] = s2.pageDimensions, [r2, o2, l2, h2] = s2.getRectInCurrentCoords(t2.rect, a2);
      s2.x = r2 / n2;
      s2.y = o2 / a2;
      s2.width = l2 / n2;
      s2.height = h2 / a2;
      return s2;
    }
    get hasBeenModified() {
      return !!this.annotationElementId && (this.deleted || null !== this.serialize());
    }
    remove() {
      this.#Ae?.abort();
      this.#Ae = null;
      this.isEmpty() || this.commit();
      this.parent ? this.parent.remove(this) : this._uiManager.removeEditor(this);
      if (this.#Se) {
        clearTimeout(this.#Se);
        this.#Se = null;
      }
      this.#Re();
      this.removeEditToolbar();
      if (this.#Me) {
        for (const t2 of this.#Me.values()) clearTimeout(t2);
        this.#Me = null;
      }
      this.parent = null;
      this.#Pe?.destroy();
      this.#Pe = null;
    }
    get isResizable() {
      return false;
    }
    makeResizable() {
      if (this.isResizable) {
        this.#Oe();
        this.#me.classList.remove("hidden");
        bindEvents(this, this.div, ["keydown"]);
      }
    }
    get toolbarPosition() {
      return null;
    }
    keydown(t2) {
      if (!this.isResizable || t2.target !== this.div || "Enter" !== t2.key) return;
      this._uiManager.setSelected(this);
      this.#be = { savedX: this.x, savedY: this.y, savedWidth: this.width, savedHeight: this.height };
      const e2 = this.#me.children;
      if (!this.#de) {
        this.#de = Array.from(e2);
        const t3 = this.#qe.bind(this), i3 = this.#Xe.bind(this), s3 = this._uiManager._signal;
        for (const e3 of this.#de) {
          const n3 = e3.getAttribute("data-resizer-name");
          e3.setAttribute("role", "spinbutton");
          e3.addEventListener("keydown", t3, { signal: s3 });
          e3.addEventListener("blur", i3, { signal: s3 });
          e3.addEventListener("focus", this.#Ke.bind(this, n3), { signal: s3 });
          e3.setAttribute("data-l10n-id", _AnnotationEditor._l10nResizer[n3]);
        }
      }
      const i2 = this.#de[0];
      let s2 = 0;
      for (const t3 of e2) {
        if (t3 === i2) break;
        s2++;
      }
      const n2 = (360 - this.rotation + this.parentRotation) % 360 / 90 * (this.#de.length / 4);
      if (n2 !== s2) {
        if (n2 < s2) for (let t4 = 0; t4 < s2 - n2; t4++) this.#me.append(this.#me.firstChild);
        else if (n2 > s2) for (let t4 = 0; t4 < n2 - s2; t4++) this.#me.firstChild.before(this.#me.lastChild);
        let t3 = 0;
        for (const i3 of e2) {
          const e3 = this.#de[t3++].getAttribute("data-resizer-name");
          i3.setAttribute("data-l10n-id", _AnnotationEditor._l10nResizer[e3]);
        }
      }
      this.#Ye(0);
      this.#Ee = true;
      this.#me.firstChild.focus({ focusVisible: true });
      t2.preventDefault();
      t2.stopImmediatePropagation();
    }
    #qe(t2) {
      _AnnotationEditor._resizerKeyboardManager.exec(this, t2);
    }
    #Xe(t2) {
      this.#Ee && t2.relatedTarget?.parentNode !== this.#me && this.#Re();
    }
    #Ke(t2) {
      this.#we = this.#Ee ? t2 : "";
    }
    #Ye(t2) {
      if (this.#de) for (const e2 of this.#de) e2.tabIndex = t2;
    }
    _resizeWithKeyboard(t2, e2) {
      this.#Ee && this.#Be(this.#we, { deltaX: t2, deltaY: e2, fromKeyboard: true });
    }
    #Re() {
      this.#Ee = false;
      this.#Ye(-1);
      this.#He();
    }
    _stopResizingWithKeyboard() {
      this.#Re();
      this.div.focus();
    }
    select() {
      this.makeResizable();
      this.div?.classList.add("selectedEditor");
      if (this._editToolbar) {
        this._editToolbar?.show();
        this.#o?.toggleAltTextBadge(false);
      } else this.addEditToolbar().then((() => {
        this.div?.classList.contains("selectedEditor") && this._editToolbar?.show();
      }));
    }
    unselect() {
      this.#me?.classList.add("hidden");
      this.div?.classList.remove("selectedEditor");
      this.div?.contains(document.activeElement) && this._uiManager.currentLayer.div.focus({ preventScroll: true });
      this._editToolbar?.hide();
      this.#o?.toggleAltTextBadge(true);
    }
    updateParams(t2, e2) {
    }
    disableEditing() {
    }
    enableEditing() {
    }
    enterInEditMode() {
    }
    getImageForAltText() {
      return null;
    }
    get contentDiv() {
      return this.div;
    }
    get isEditing() {
      return this.#xe;
    }
    set isEditing(t2) {
      this.#xe = t2;
      if (this.parent) if (t2) {
        this.parent.setSelected(this);
        this.parent.setActiveEditor(this);
      } else this.parent.setActiveEditor(null);
    }
    setAspectRatio(t2, e2) {
      this.#ge = true;
      const i2 = t2 / e2, { style: s2 } = this.div;
      s2.aspectRatio = i2;
      s2.height = "auto";
    }
    static get MIN_SIZE() {
      return 16;
    }
    static canCreateNewEmptyEditor() {
      return true;
    }
    get telemetryInitialData() {
      return { action: "added" };
    }
    get telemetryFinalData() {
      return null;
    }
    _reportTelemetry(t2, e2 = false) {
      if (e2) {
        this.#Me ||= /* @__PURE__ */ new Map();
        const { action: e3 } = t2;
        let i2 = this.#Me.get(e3);
        i2 && clearTimeout(i2);
        i2 = setTimeout((() => {
          this._reportTelemetry(t2);
          this.#Me.delete(e3);
          0 === this.#Me.size && (this.#Me = null);
        }), _AnnotationEditor._telemetryTimeout);
        this.#Me.set(e3, i2);
      } else {
        t2.type ||= this.editorType;
        this._uiManager._eventBus.dispatch("reporttelemetry", { source: this, details: { type: "editing", data: t2 } });
      }
    }
    show(t2 = this._isVisible) {
      this.div.classList.toggle("hidden", !t2);
      this._isVisible = t2;
    }
    enable() {
      this.div && (this.div.tabIndex = 0);
      this.#ce = false;
    }
    disable() {
      this.div && (this.div.tabIndex = -1);
      this.#ce = true;
    }
    renderAnnotationElement(t2) {
      let e2 = t2.container.querySelector(".annotationContent");
      if (e2) {
        if ("CANVAS" === e2.nodeName) {
          const t3 = e2;
          e2 = document.createElement("div");
          e2.classList.add("annotationContent", this.editorType);
          t3.before(e2);
        }
      } else {
        e2 = document.createElement("div");
        e2.classList.add("annotationContent", this.editorType);
        t2.container.prepend(e2);
      }
      return e2;
    }
    resetAnnotationElement(t2) {
      const { firstChild: e2 } = t2.container;
      "DIV" === e2?.nodeName && e2.classList.contains("annotationContent") && e2.remove();
    }
  };
  var FakeEditor = class extends AnnotationEditor {
    constructor(t2) {
      super(t2);
      this.annotationElementId = t2.annotationElementId;
      this.deleted = true;
    }
    serialize() {
      return this.serializeDeleted();
    }
  };
  var st = 3285377520;
  var nt = 4294901760;
  var at = 65535;
  var MurmurHash3_64 = class {
    constructor(t2) {
      this.h1 = t2 ? 4294967295 & t2 : st;
      this.h2 = t2 ? 4294967295 & t2 : st;
    }
    update(t2) {
      let e2, i2;
      if ("string" == typeof t2) {
        e2 = new Uint8Array(2 * t2.length);
        i2 = 0;
        for (let s3 = 0, n3 = t2.length; s3 < n3; s3++) {
          const n4 = t2.charCodeAt(s3);
          if (n4 <= 255) e2[i2++] = n4;
          else {
            e2[i2++] = n4 >>> 8;
            e2[i2++] = 255 & n4;
          }
        }
      } else {
        if (!ArrayBuffer.isView(t2)) throw new Error("Invalid data format, must be a string or TypedArray.");
        e2 = t2.slice();
        i2 = e2.byteLength;
      }
      const s2 = i2 >> 2, n2 = i2 - 4 * s2, a2 = new Uint32Array(e2.buffer, 0, s2);
      let r2 = 0, o2 = 0, l2 = this.h1, h2 = this.h2;
      const d2 = 3432918353, c2 = 461845907, u2 = 11601, p2 = 13715;
      for (let t3 = 0; t3 < s2; t3++) if (1 & t3) {
        r2 = a2[t3];
        r2 = r2 * d2 & nt | r2 * u2 & at;
        r2 = r2 << 15 | r2 >>> 17;
        r2 = r2 * c2 & nt | r2 * p2 & at;
        l2 ^= r2;
        l2 = l2 << 13 | l2 >>> 19;
        l2 = 5 * l2 + 3864292196;
      } else {
        o2 = a2[t3];
        o2 = o2 * d2 & nt | o2 * u2 & at;
        o2 = o2 << 15 | o2 >>> 17;
        o2 = o2 * c2 & nt | o2 * p2 & at;
        h2 ^= o2;
        h2 = h2 << 13 | h2 >>> 19;
        h2 = 5 * h2 + 3864292196;
      }
      r2 = 0;
      switch (n2) {
        case 3:
          r2 ^= e2[4 * s2 + 2] << 16;
        case 2:
          r2 ^= e2[4 * s2 + 1] << 8;
        case 1:
          r2 ^= e2[4 * s2];
          r2 = r2 * d2 & nt | r2 * u2 & at;
          r2 = r2 << 15 | r2 >>> 17;
          r2 = r2 * c2 & nt | r2 * p2 & at;
          1 & s2 ? l2 ^= r2 : h2 ^= r2;
      }
      this.h1 = l2;
      this.h2 = h2;
    }
    hexdigest() {
      let t2 = this.h1, e2 = this.h2;
      t2 ^= e2 >>> 1;
      t2 = 3981806797 * t2 & nt | 36045 * t2 & at;
      e2 = 4283543511 * e2 & nt | (2950163797 * (e2 << 16 | t2 >>> 16) & nt) >>> 16;
      t2 ^= e2 >>> 1;
      t2 = 444984403 * t2 & nt | 60499 * t2 & at;
      e2 = 3301882366 * e2 & nt | (3120437893 * (e2 << 16 | t2 >>> 16) & nt) >>> 16;
      t2 ^= e2 >>> 1;
      return (t2 >>> 0).toString(16).padStart(8, "0") + (e2 >>> 0).toString(16).padStart(8, "0");
    }
  };
  var rt = Object.freeze({ map: null, hash: "", transfer: void 0 });
  var AnnotationStorage = class {
    #Qe = false;
    #Je = null;
    #Ze = /* @__PURE__ */ new Map();
    constructor() {
      this.onSetModified = null;
      this.onResetModified = null;
      this.onAnnotationEditor = null;
    }
    getValue(t2, e2) {
      const i2 = this.#Ze.get(t2);
      return void 0 === i2 ? e2 : Object.assign(e2, i2);
    }
    getRawValue(t2) {
      return this.#Ze.get(t2);
    }
    remove(t2) {
      this.#Ze.delete(t2);
      0 === this.#Ze.size && this.resetModified();
      if ("function" == typeof this.onAnnotationEditor) {
        for (const t3 of this.#Ze.values()) if (t3 instanceof AnnotationEditor) return;
        this.onAnnotationEditor(null);
      }
    }
    setValue(t2, e2) {
      const i2 = this.#Ze.get(t2);
      let s2 = false;
      if (void 0 !== i2) {
        for (const [t3, n2] of Object.entries(e2)) if (i2[t3] !== n2) {
          s2 = true;
          i2[t3] = n2;
        }
      } else {
        s2 = true;
        this.#Ze.set(t2, e2);
      }
      s2 && this.#ti();
      e2 instanceof AnnotationEditor && "function" == typeof this.onAnnotationEditor && this.onAnnotationEditor(e2.constructor._type);
    }
    has(t2) {
      return this.#Ze.has(t2);
    }
    getAll() {
      return this.#Ze.size > 0 ? objectFromMap(this.#Ze) : null;
    }
    setAll(t2) {
      for (const [e2, i2] of Object.entries(t2)) this.setValue(e2, i2);
    }
    get size() {
      return this.#Ze.size;
    }
    #ti() {
      if (!this.#Qe) {
        this.#Qe = true;
        "function" == typeof this.onSetModified && this.onSetModified();
      }
    }
    resetModified() {
      if (this.#Qe) {
        this.#Qe = false;
        "function" == typeof this.onResetModified && this.onResetModified();
      }
    }
    get print() {
      return new PrintAnnotationStorage(this);
    }
    get serializable() {
      if (0 === this.#Ze.size) return rt;
      const t2 = /* @__PURE__ */ new Map(), e2 = new MurmurHash3_64(), i2 = [], s2 = /* @__PURE__ */ Object.create(null);
      let n2 = false;
      for (const [i3, a2] of this.#Ze) {
        const r2 = a2 instanceof AnnotationEditor ? a2.serialize(false, s2) : a2;
        if (r2) {
          t2.set(i3, r2);
          e2.update(`${i3}:${JSON.stringify(r2)}`);
          n2 ||= !!r2.bitmap;
        }
      }
      if (n2) for (const e3 of t2.values()) e3.bitmap && i2.push(e3.bitmap);
      return t2.size > 0 ? { map: t2, hash: e2.hexdigest(), transfer: i2 } : rt;
    }
    get editorStats() {
      let t2 = null;
      const e2 = /* @__PURE__ */ new Map();
      for (const i2 of this.#Ze.values()) {
        if (!(i2 instanceof AnnotationEditor)) continue;
        const s2 = i2.telemetryFinalData;
        if (!s2) continue;
        const { type: n2 } = s2;
        e2.has(n2) || e2.set(n2, Object.getPrototypeOf(i2).constructor);
        t2 ||= /* @__PURE__ */ Object.create(null);
        const a2 = t2[n2] ||= /* @__PURE__ */ new Map();
        for (const [t3, e3] of Object.entries(s2)) {
          if ("type" === t3) continue;
          let i3 = a2.get(t3);
          if (!i3) {
            i3 = /* @__PURE__ */ new Map();
            a2.set(t3, i3);
          }
          const s3 = i3.get(e3) ?? 0;
          i3.set(e3, s3 + 1);
        }
      }
      for (const [i2, s2] of e2) t2[i2] = s2.computeTelemetryFinalData(t2[i2]);
      return t2;
    }
    resetModifiedIds() {
      this.#Je = null;
    }
    get modifiedIds() {
      if (this.#Je) return this.#Je;
      const t2 = [];
      for (const e2 of this.#Ze.values()) e2 instanceof AnnotationEditor && e2.annotationElementId && e2.serialize() && t2.push(e2.annotationElementId);
      return this.#Je = { ids: new Set(t2), hash: t2.join(",") };
    }
  };
  var PrintAnnotationStorage = class extends AnnotationStorage {
    #ei;
    constructor(t2) {
      super();
      const { map: e2, hash: i2, transfer: s2 } = t2.serializable, n2 = structuredClone(e2, s2 ? { transfer: s2 } : null);
      this.#ei = { map: n2, hash: i2, transfer: s2 };
    }
    get print() {
      unreachable("Should not call PrintAnnotationStorage.print");
    }
    get serializable() {
      return this.#ei;
    }
    get modifiedIds() {
      return shadow(this, "modifiedIds", { ids: /* @__PURE__ */ new Set(), hash: "" });
    }
  };
  var FontLoader = class {
    #ii = /* @__PURE__ */ new Set();
    constructor({ ownerDocument: t2 = globalThis.document, styleElement: e2 = null }) {
      this._document = t2;
      this.nativeFontFaces = /* @__PURE__ */ new Set();
      this.styleElement = null;
      this.loadingRequests = [];
      this.loadTestFontId = 0;
    }
    addNativeFontFace(t2) {
      this.nativeFontFaces.add(t2);
      this._document.fonts.add(t2);
    }
    removeNativeFontFace(t2) {
      this.nativeFontFaces.delete(t2);
      this._document.fonts.delete(t2);
    }
    insertRule(t2) {
      if (!this.styleElement) {
        this.styleElement = this._document.createElement("style");
        this._document.documentElement.getElementsByTagName("head")[0].append(this.styleElement);
      }
      const e2 = this.styleElement.sheet;
      e2.insertRule(t2, e2.cssRules.length);
    }
    clear() {
      for (const t2 of this.nativeFontFaces) this._document.fonts.delete(t2);
      this.nativeFontFaces.clear();
      this.#ii.clear();
      if (this.styleElement) {
        this.styleElement.remove();
        this.styleElement = null;
      }
    }
    async loadSystemFont({ systemFontInfo: t2, _inspectFont: e2 }) {
      if (t2 && !this.#ii.has(t2.loadedName)) {
        assert(!this.disableFontFace, "loadSystemFont shouldn't be called when `disableFontFace` is set.");
        if (this.isFontLoadingAPISupported) {
          const { loadedName: i2, src: s2, style: n2 } = t2, a2 = new FontFace(i2, s2, n2);
          this.addNativeFontFace(a2);
          try {
            await a2.load();
            this.#ii.add(i2);
            e2?.(t2);
          } catch {
            warn(`Cannot load system font: ${t2.baseFontName}, installing it could help to improve PDF rendering.`);
            this.removeNativeFontFace(a2);
          }
        } else unreachable("Not implemented: loadSystemFont without the Font Loading API.");
      }
    }
    async bind(t2) {
      if (t2.attached || t2.missingFile && !t2.systemFontInfo) return;
      t2.attached = true;
      if (t2.systemFontInfo) {
        await this.loadSystemFont(t2);
        return;
      }
      if (this.isFontLoadingAPISupported) {
        const e3 = t2.createNativeFontFace();
        if (e3) {
          this.addNativeFontFace(e3);
          try {
            await e3.loaded;
          } catch (i2) {
            warn(`Failed to load font '${e3.family}': '${i2}'.`);
            t2.disableFontFace = true;
            throw i2;
          }
        }
        return;
      }
      const e2 = t2.createFontFaceRule();
      if (e2) {
        this.insertRule(e2);
        if (this.isSyncFontLoadingSupported) return;
        await new Promise(((e3) => {
          const i2 = this._queueLoadingCallback(e3);
          this._prepareFontLoadEvent(t2, i2);
        }));
      }
    }
    get isFontLoadingAPISupported() {
      return shadow(this, "isFontLoadingAPISupported", !!this._document?.fonts);
    }
    get isSyncFontLoadingSupported() {
      let t2 = false;
      (e || "undefined" != typeof navigator && "string" == typeof navigator?.userAgent && /Mozilla\/5.0.*?rv:\d+.*? Gecko/.test(navigator.userAgent)) && (t2 = true);
      return shadow(this, "isSyncFontLoadingSupported", t2);
    }
    _queueLoadingCallback(t2) {
      const { loadingRequests: e2 } = this, i2 = { done: false, complete: function completeRequest() {
        assert(!i2.done, "completeRequest() cannot be called twice.");
        i2.done = true;
        for (; e2.length > 0 && e2[0].done; ) {
          const t3 = e2.shift();
          setTimeout(t3.callback, 0);
        }
      }, callback: t2 };
      e2.push(i2);
      return i2;
    }
    get _loadTestFont() {
      return shadow(this, "_loadTestFont", atob("T1RUTwALAIAAAwAwQ0ZGIDHtZg4AAAOYAAAAgUZGVE1lkzZwAAAEHAAAABxHREVGABQAFQAABDgAAAAeT1MvMlYNYwkAAAEgAAAAYGNtYXABDQLUAAACNAAAAUJoZWFk/xVFDQAAALwAAAA2aGhlYQdkA+oAAAD0AAAAJGhtdHgD6AAAAAAEWAAAAAZtYXhwAAJQAAAAARgAAAAGbmFtZVjmdH4AAAGAAAAAsXBvc3T/hgAzAAADeAAAACAAAQAAAAEAALZRFsRfDzz1AAsD6AAAAADOBOTLAAAAAM4KHDwAAAAAA+gDIQAAAAgAAgAAAAAAAAABAAADIQAAAFoD6AAAAAAD6AABAAAAAAAAAAAAAAAAAAAAAQAAUAAAAgAAAAQD6AH0AAUAAAKKArwAAACMAooCvAAAAeAAMQECAAACAAYJAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAwAAuAC4DIP84AFoDIQAAAAAAAQAAAAAAAAAAACAAIAABAAAADgCuAAEAAAAAAAAAAQAAAAEAAAAAAAEAAQAAAAEAAAAAAAIAAQAAAAEAAAAAAAMAAQAAAAEAAAAAAAQAAQAAAAEAAAAAAAUAAQAAAAEAAAAAAAYAAQAAAAMAAQQJAAAAAgABAAMAAQQJAAEAAgABAAMAAQQJAAIAAgABAAMAAQQJAAMAAgABAAMAAQQJAAQAAgABAAMAAQQJAAUAAgABAAMAAQQJAAYAAgABWABYAAAAAAAAAwAAAAMAAAAcAAEAAAAAADwAAwABAAAAHAAEACAAAAAEAAQAAQAAAC7//wAAAC7////TAAEAAAAAAAABBgAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAD/gwAyAAAAAQAAAAAAAAAAAAAAAAAAAAABAAQEAAEBAQJYAAEBASH4DwD4GwHEAvgcA/gXBIwMAYuL+nz5tQXkD5j3CBLnEQACAQEBIVhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYWFhYAAABAQAADwACAQEEE/t3Dov6fAH6fAT+fPp8+nwHDosMCvm1Cvm1DAz6fBQAAAAAAAABAAAAAMmJbzEAAAAAzgTjFQAAAADOBOQpAAEAAAAAAAAADAAUAAQAAAABAAAAAgABAAAAAAAAAAAD6AAAAAAAAA=="));
    }
    _prepareFontLoadEvent(t2, e2) {
      function int32(t3, e3) {
        return t3.charCodeAt(e3) << 24 | t3.charCodeAt(e3 + 1) << 16 | t3.charCodeAt(e3 + 2) << 8 | 255 & t3.charCodeAt(e3 + 3);
      }
      function spliceString(t3, e3, i3, s3) {
        return t3.substring(0, e3) + s3 + t3.substring(e3 + i3);
      }
      let i2, s2;
      const n2 = this._document.createElement("canvas");
      n2.width = 1;
      n2.height = 1;
      const a2 = n2.getContext("2d");
      let r2 = 0;
      const o2 = `lt${Date.now()}${this.loadTestFontId++}`;
      let l2 = this._loadTestFont;
      l2 = spliceString(l2, 976, o2.length, o2);
      const h2 = 1482184792;
      let d2 = int32(l2, 16);
      for (i2 = 0, s2 = o2.length - 3; i2 < s2; i2 += 4) d2 = d2 - h2 + int32(o2, i2) | 0;
      i2 < o2.length && (d2 = d2 - h2 + int32(o2 + "XXX", i2) | 0);
      l2 = spliceString(l2, 16, 4, (function string32(t3) {
        return String.fromCharCode(t3 >> 24 & 255, t3 >> 16 & 255, t3 >> 8 & 255, 255 & t3);
      })(d2));
      const c2 = `@font-face {font-family:"${o2}";src:${`url(data:font/opentype;base64,${btoa(l2)});`}}`;
      this.insertRule(c2);
      const u2 = this._document.createElement("div");
      u2.style.visibility = "hidden";
      u2.style.width = u2.style.height = "10px";
      u2.style.position = "absolute";
      u2.style.top = u2.style.left = "0px";
      for (const e3 of [t2.loadedName, o2]) {
        const t3 = this._document.createElement("span");
        t3.textContent = "Hi";
        t3.style.fontFamily = e3;
        u2.append(t3);
      }
      this._document.body.append(u2);
      !(function isFontReady(t3, e3) {
        if (++r2 > 30) {
          warn("Load test font never loaded.");
          e3();
          return;
        }
        a2.font = "30px " + t3;
        a2.fillText(".", 0, 20);
        a2.getImageData(0, 0, 1, 1).data[3] > 0 ? e3() : setTimeout(isFontReady.bind(null, t3, e3));
      })(o2, (() => {
        u2.remove();
        e2.complete();
      }));
    }
  };
  var FontFaceObject = class {
    constructor(t2, { disableFontFace: e2 = false, fontExtraProperties: i2 = false, inspectFont: s2 = null }) {
      this.compiledGlyphs = /* @__PURE__ */ Object.create(null);
      for (const e3 in t2) this[e3] = t2[e3];
      this.disableFontFace = true === e2;
      this.fontExtraProperties = true === i2;
      this._inspectFont = s2;
    }
    createNativeFontFace() {
      if (!this.data || this.disableFontFace) return null;
      let t2;
      if (this.cssFontInfo) {
        const e2 = { weight: this.cssFontInfo.fontWeight };
        this.cssFontInfo.italicAngle && (e2.style = `oblique ${this.cssFontInfo.italicAngle}deg`);
        t2 = new FontFace(this.cssFontInfo.fontFamily, this.data, e2);
      } else t2 = new FontFace(this.loadedName, this.data, {});
      this._inspectFont?.(this);
      return t2;
    }
    createFontFaceRule() {
      if (!this.data || this.disableFontFace) return null;
      const t2 = `url(data:${this.mimetype};base64,${(function toBase64Util(t3) {
        return Uint8Array.prototype.toBase64 ? t3.toBase64() : btoa(bytesToString(t3));
      })(this.data)});`;
      let e2;
      if (this.cssFontInfo) {
        let i2 = `font-weight: ${this.cssFontInfo.fontWeight};`;
        this.cssFontInfo.italicAngle && (i2 += `font-style: oblique ${this.cssFontInfo.italicAngle}deg;`);
        e2 = `@font-face {font-family:"${this.cssFontInfo.fontFamily}";${i2}src:${t2}}`;
      } else e2 = `@font-face {font-family:"${this.loadedName}";src:${t2}}`;
      this._inspectFont?.(this, t2);
      return e2;
    }
    getPathGenerator(t2, e2) {
      if (void 0 !== this.compiledGlyphs[e2]) return this.compiledGlyphs[e2];
      const i2 = this.loadedName + "_path_" + e2;
      let s2;
      try {
        s2 = t2.get(i2);
      } catch (t3) {
        warn(`getPathGenerator - ignoring character: "${t3}".`);
      }
      const n2 = new Path2D(s2 || "");
      this.fontExtraProperties || t2.delete(i2);
      return this.compiledGlyphs[e2] = n2;
    }
  };
  var ot = 1;
  var lt = 2;
  var ht = 1;
  var dt = 2;
  var ct = 3;
  var ut = 4;
  var pt = 5;
  var gt = 6;
  var mt = 7;
  var ft = 8;
  function onFn() {
  }
  function wrapReason(t2) {
    if (t2 instanceof AbortException || t2 instanceof InvalidPDFException || t2 instanceof MissingPDFException || t2 instanceof PasswordException || t2 instanceof UnexpectedResponseException || t2 instanceof UnknownErrorException) return t2;
    t2 instanceof Error || "object" == typeof t2 && null !== t2 || unreachable('wrapReason: Expected "reason" to be a (possibly cloned) Error.');
    switch (t2.name) {
      case "AbortException":
        return new AbortException(t2.message);
      case "InvalidPDFException":
        return new InvalidPDFException(t2.message);
      case "MissingPDFException":
        return new MissingPDFException(t2.message);
      case "PasswordException":
        return new PasswordException(t2.message, t2.code);
      case "UnexpectedResponseException":
        return new UnexpectedResponseException(t2.message, t2.status);
      case "UnknownErrorException":
        return new UnknownErrorException(t2.message, t2.details);
    }
    return new UnknownErrorException(t2.message, t2.toString());
  }
  var MessageHandler = class {
    #si = new AbortController();
    constructor(t2, e2, i2) {
      this.sourceName = t2;
      this.targetName = e2;
      this.comObj = i2;
      this.callbackId = 1;
      this.streamId = 1;
      this.streamSinks = /* @__PURE__ */ Object.create(null);
      this.streamControllers = /* @__PURE__ */ Object.create(null);
      this.callbackCapabilities = /* @__PURE__ */ Object.create(null);
      this.actionHandler = /* @__PURE__ */ Object.create(null);
      i2.addEventListener("message", this.#ni.bind(this), { signal: this.#si.signal });
    }
    #ni({ data: t2 }) {
      if (t2.targetName !== this.sourceName) return;
      if (t2.stream) {
        this.#ai(t2);
        return;
      }
      if (t2.callback) {
        const e3 = t2.callbackId, i2 = this.callbackCapabilities[e3];
        if (!i2) throw new Error(`Cannot resolve callback ${e3}`);
        delete this.callbackCapabilities[e3];
        if (t2.callback === ot) i2.resolve(t2.data);
        else {
          if (t2.callback !== lt) throw new Error("Unexpected callback case");
          i2.reject(wrapReason(t2.reason));
        }
        return;
      }
      const e2 = this.actionHandler[t2.action];
      if (!e2) throw new Error(`Unknown action from worker: ${t2.action}`);
      if (t2.callbackId) {
        const i2 = this.sourceName, s2 = t2.sourceName, n2 = this.comObj;
        Promise.try(e2, t2.data).then((function(e3) {
          n2.postMessage({ sourceName: i2, targetName: s2, callback: ot, callbackId: t2.callbackId, data: e3 });
        }), (function(e3) {
          n2.postMessage({ sourceName: i2, targetName: s2, callback: lt, callbackId: t2.callbackId, reason: wrapReason(e3) });
        }));
      } else t2.streamId ? this.#ri(t2) : e2(t2.data);
    }
    on(t2, e2) {
      const i2 = this.actionHandler;
      if (i2[t2]) throw new Error(`There is already an actionName called "${t2}"`);
      i2[t2] = e2;
    }
    send(t2, e2, i2) {
      this.comObj.postMessage({ sourceName: this.sourceName, targetName: this.targetName, action: t2, data: e2 }, i2);
    }
    sendWithPromise(t2, e2, i2) {
      const s2 = this.callbackId++, n2 = Promise.withResolvers();
      this.callbackCapabilities[s2] = n2;
      try {
        this.comObj.postMessage({ sourceName: this.sourceName, targetName: this.targetName, action: t2, callbackId: s2, data: e2 }, i2);
      } catch (t3) {
        n2.reject(t3);
      }
      return n2.promise;
    }
    sendWithStream(t2, e2, i2, s2) {
      const n2 = this.streamId++, a2 = this.sourceName, r2 = this.targetName, o2 = this.comObj;
      return new ReadableStream({ start: (i3) => {
        const l2 = Promise.withResolvers();
        this.streamControllers[n2] = { controller: i3, startCall: l2, pullCall: null, cancelCall: null, isClosed: false };
        o2.postMessage({ sourceName: a2, targetName: r2, action: t2, streamId: n2, data: e2, desiredSize: i3.desiredSize }, s2);
        return l2.promise;
      }, pull: (t3) => {
        const e3 = Promise.withResolvers();
        this.streamControllers[n2].pullCall = e3;
        o2.postMessage({ sourceName: a2, targetName: r2, stream: gt, streamId: n2, desiredSize: t3.desiredSize });
        return e3.promise;
      }, cancel: (t3) => {
        assert(t3 instanceof Error, "cancel must have a valid reason");
        const e3 = Promise.withResolvers();
        this.streamControllers[n2].cancelCall = e3;
        this.streamControllers[n2].isClosed = true;
        o2.postMessage({ sourceName: a2, targetName: r2, stream: ht, streamId: n2, reason: wrapReason(t3) });
        return e3.promise;
      } }, i2);
    }
    #ri(t2) {
      const e2 = t2.streamId, i2 = this.sourceName, s2 = t2.sourceName, n2 = this.comObj, a2 = this, r2 = this.actionHandler[t2.action], o2 = { enqueue(t3, a3 = 1, r3) {
        if (this.isCancelled) return;
        const o3 = this.desiredSize;
        this.desiredSize -= a3;
        if (o3 > 0 && this.desiredSize <= 0) {
          this.sinkCapability = Promise.withResolvers();
          this.ready = this.sinkCapability.promise;
        }
        n2.postMessage({ sourceName: i2, targetName: s2, stream: ut, streamId: e2, chunk: t3 }, r3);
      }, close() {
        if (!this.isCancelled) {
          this.isCancelled = true;
          n2.postMessage({ sourceName: i2, targetName: s2, stream: ct, streamId: e2 });
          delete a2.streamSinks[e2];
        }
      }, error(t3) {
        assert(t3 instanceof Error, "error must have a valid reason");
        if (!this.isCancelled) {
          this.isCancelled = true;
          n2.postMessage({ sourceName: i2, targetName: s2, stream: pt, streamId: e2, reason: wrapReason(t3) });
        }
      }, sinkCapability: Promise.withResolvers(), onPull: null, onCancel: null, isCancelled: false, desiredSize: t2.desiredSize, ready: null };
      o2.sinkCapability.resolve();
      o2.ready = o2.sinkCapability.promise;
      this.streamSinks[e2] = o2;
      Promise.try(r2, t2.data, o2).then((function() {
        n2.postMessage({ sourceName: i2, targetName: s2, stream: ft, streamId: e2, success: true });
      }), (function(t3) {
        n2.postMessage({ sourceName: i2, targetName: s2, stream: ft, streamId: e2, reason: wrapReason(t3) });
      }));
    }
    #ai(t2) {
      const e2 = t2.streamId, i2 = this.sourceName, s2 = t2.sourceName, n2 = this.comObj, a2 = this.streamControllers[e2], r2 = this.streamSinks[e2];
      switch (t2.stream) {
        case ft:
          t2.success ? a2.startCall.resolve() : a2.startCall.reject(wrapReason(t2.reason));
          break;
        case mt:
          t2.success ? a2.pullCall.resolve() : a2.pullCall.reject(wrapReason(t2.reason));
          break;
        case gt:
          if (!r2) {
            n2.postMessage({ sourceName: i2, targetName: s2, stream: mt, streamId: e2, success: true });
            break;
          }
          r2.desiredSize <= 0 && t2.desiredSize > 0 && r2.sinkCapability.resolve();
          r2.desiredSize = t2.desiredSize;
          Promise.try(r2.onPull || onFn).then((function() {
            n2.postMessage({ sourceName: i2, targetName: s2, stream: mt, streamId: e2, success: true });
          }), (function(t3) {
            n2.postMessage({ sourceName: i2, targetName: s2, stream: mt, streamId: e2, reason: wrapReason(t3) });
          }));
          break;
        case ut:
          assert(a2, "enqueue should have stream controller");
          if (a2.isClosed) break;
          a2.controller.enqueue(t2.chunk);
          break;
        case ct:
          assert(a2, "close should have stream controller");
          if (a2.isClosed) break;
          a2.isClosed = true;
          a2.controller.close();
          this.#oi(a2, e2);
          break;
        case pt:
          assert(a2, "error should have stream controller");
          a2.controller.error(wrapReason(t2.reason));
          this.#oi(a2, e2);
          break;
        case dt:
          t2.success ? a2.cancelCall.resolve() : a2.cancelCall.reject(wrapReason(t2.reason));
          this.#oi(a2, e2);
          break;
        case ht:
          if (!r2) break;
          const o2 = wrapReason(t2.reason);
          Promise.try(r2.onCancel || onFn, o2).then((function() {
            n2.postMessage({ sourceName: i2, targetName: s2, stream: dt, streamId: e2, success: true });
          }), (function(t3) {
            n2.postMessage({ sourceName: i2, targetName: s2, stream: dt, streamId: e2, reason: wrapReason(t3) });
          }));
          r2.sinkCapability.reject(o2);
          r2.isCancelled = true;
          delete this.streamSinks[e2];
          break;
        default:
          throw new Error("Unexpected stream case");
      }
    }
    async #oi(t2, e2) {
      await Promise.allSettled([t2.startCall?.promise, t2.pullCall?.promise, t2.cancelCall?.promise]);
      delete this.streamControllers[e2];
    }
    destroy() {
      this.#si?.abort();
      this.#si = null;
    }
  };
  var BaseCanvasFactory = class {
    #li = false;
    constructor({ enableHWA: t2 = false }) {
      this.#li = t2;
    }
    create(t2, e2) {
      if (t2 <= 0 || e2 <= 0) throw new Error("Invalid canvas size");
      const i2 = this._createCanvas(t2, e2);
      return { canvas: i2, context: i2.getContext("2d", { willReadFrequently: !this.#li }) };
    }
    reset(t2, e2, i2) {
      if (!t2.canvas) throw new Error("Canvas is not specified");
      if (e2 <= 0 || i2 <= 0) throw new Error("Invalid canvas size");
      t2.canvas.width = e2;
      t2.canvas.height = i2;
    }
    destroy(t2) {
      if (!t2.canvas) throw new Error("Canvas is not specified");
      t2.canvas.width = 0;
      t2.canvas.height = 0;
      t2.canvas = null;
      t2.context = null;
    }
    _createCanvas(t2, e2) {
      unreachable("Abstract method `_createCanvas` called.");
    }
  };
  var BaseCMapReaderFactory = class {
    constructor({ baseUrl: t2 = null, isCompressed: e2 = true }) {
      this.baseUrl = t2;
      this.isCompressed = e2;
    }
    async fetch({ name: t2 }) {
      if (!this.baseUrl) throw new Error("Ensure that the `cMapUrl` and `cMapPacked` API parameters are provided.");
      if (!t2) throw new Error("CMap name must be specified.");
      const e2 = this.baseUrl + t2 + (this.isCompressed ? ".bcmap" : "");
      return this._fetch(e2).then(((t3) => ({ cMapData: t3, isCompressed: this.isCompressed }))).catch(((t3) => {
        throw new Error(`Unable to load ${this.isCompressed ? "binary " : ""}CMap at: ${e2}`);
      }));
    }
    async _fetch(t2) {
      unreachable("Abstract method `_fetch` called.");
    }
  };
  var DOMCMapReaderFactory = class extends BaseCMapReaderFactory {
    async _fetch(t2) {
      const e2 = await fetchData(t2, this.isCompressed ? "arraybuffer" : "text");
      return e2 instanceof ArrayBuffer ? new Uint8Array(e2) : stringToBytes(e2);
    }
  };
  var BaseFilterFactory = class {
    addFilter(t2) {
      return "none";
    }
    addHCMFilter(t2, e2) {
      return "none";
    }
    addAlphaFilter(t2) {
      return "none";
    }
    addLuminosityFilter(t2) {
      return "none";
    }
    addHighlightHCMFilter(t2, e2, i2, s2, n2) {
      return "none";
    }
    destroy(t2 = false) {
    }
  };
  var BaseStandardFontDataFactory = class {
    constructor({ baseUrl: t2 = null }) {
      this.baseUrl = t2;
    }
    async fetch({ filename: t2 }) {
      if (!this.baseUrl) throw new Error("Ensure that the `standardFontDataUrl` API parameter is provided.");
      if (!t2) throw new Error("Font filename must be specified.");
      const e2 = `${this.baseUrl}${t2}`;
      return this._fetch(e2).catch(((t3) => {
        throw new Error(`Unable to load font data at: ${e2}`);
      }));
    }
    async _fetch(t2) {
      unreachable("Abstract method `_fetch` called.");
    }
  };
  var DOMStandardFontDataFactory = class extends BaseStandardFontDataFactory {
    async _fetch(t2) {
      const e2 = await fetchData(t2, "arraybuffer");
      return new Uint8Array(e2);
    }
  };
  e && warn("Please use the `legacy` build in Node.js environments.");
  async function node_utils_fetchData(t2) {
    const e2 = process.getBuiltinModule("fs"), i2 = await e2.promises.readFile(t2);
    return new Uint8Array(i2);
  }
  var bt = "Fill";
  var At = "Stroke";
  var wt = "Shading";
  function applyBoundingBox(t2, e2) {
    if (!e2) return;
    const i2 = e2[2] - e2[0], s2 = e2[3] - e2[1], n2 = new Path2D();
    n2.rect(e2[0], e2[1], i2, s2);
    t2.clip(n2);
  }
  var BaseShadingPattern = class {
    getPattern() {
      unreachable("Abstract method `getPattern` called.");
    }
  };
  var RadialAxialShadingPattern = class extends BaseShadingPattern {
    constructor(t2) {
      super();
      this._type = t2[1];
      this._bbox = t2[2];
      this._colorStops = t2[3];
      this._p0 = t2[4];
      this._p1 = t2[5];
      this._r0 = t2[6];
      this._r1 = t2[7];
      this.matrix = null;
    }
    _createGradient(t2) {
      let e2;
      "axial" === this._type ? e2 = t2.createLinearGradient(this._p0[0], this._p0[1], this._p1[0], this._p1[1]) : "radial" === this._type && (e2 = t2.createRadialGradient(this._p0[0], this._p0[1], this._r0, this._p1[0], this._p1[1], this._r1));
      for (const t3 of this._colorStops) e2.addColorStop(t3[0], t3[1]);
      return e2;
    }
    getPattern(t2, e2, i2, s2) {
      let n2;
      if (s2 === At || s2 === bt) {
        const a2 = e2.current.getClippedPathBoundingBox(s2, getCurrentTransform(t2)) || [0, 0, 0, 0], r2 = Math.ceil(a2[2] - a2[0]) || 1, o2 = Math.ceil(a2[3] - a2[1]) || 1, l2 = e2.cachedCanvases.getCanvas("pattern", r2, o2), h2 = l2.context;
        h2.clearRect(0, 0, h2.canvas.width, h2.canvas.height);
        h2.beginPath();
        h2.rect(0, 0, h2.canvas.width, h2.canvas.height);
        h2.translate(-a2[0], -a2[1]);
        i2 = Util.transform(i2, [1, 0, 0, 1, a2[0], a2[1]]);
        h2.transform(...e2.baseTransform);
        this.matrix && h2.transform(...this.matrix);
        applyBoundingBox(h2, this._bbox);
        h2.fillStyle = this._createGradient(h2);
        h2.fill();
        n2 = t2.createPattern(l2.canvas, "no-repeat");
        const d2 = new DOMMatrix(i2);
        n2.setTransform(d2);
      } else {
        applyBoundingBox(t2, this._bbox);
        n2 = this._createGradient(t2);
      }
      return n2;
    }
  };
  function drawTriangle(t2, e2, i2, s2, n2, a2, r2, o2) {
    const l2 = e2.coords, h2 = e2.colors, d2 = t2.data, c2 = 4 * t2.width;
    let u2;
    if (l2[i2 + 1] > l2[s2 + 1]) {
      u2 = i2;
      i2 = s2;
      s2 = u2;
      u2 = a2;
      a2 = r2;
      r2 = u2;
    }
    if (l2[s2 + 1] > l2[n2 + 1]) {
      u2 = s2;
      s2 = n2;
      n2 = u2;
      u2 = r2;
      r2 = o2;
      o2 = u2;
    }
    if (l2[i2 + 1] > l2[s2 + 1]) {
      u2 = i2;
      i2 = s2;
      s2 = u2;
      u2 = a2;
      a2 = r2;
      r2 = u2;
    }
    const p2 = (l2[i2] + e2.offsetX) * e2.scaleX, g2 = (l2[i2 + 1] + e2.offsetY) * e2.scaleY, m2 = (l2[s2] + e2.offsetX) * e2.scaleX, f2 = (l2[s2 + 1] + e2.offsetY) * e2.scaleY, b2 = (l2[n2] + e2.offsetX) * e2.scaleX, A2 = (l2[n2 + 1] + e2.offsetY) * e2.scaleY;
    if (g2 >= A2) return;
    const w2 = h2[a2], v2 = h2[a2 + 1], y2 = h2[a2 + 2], x2 = h2[r2], _2 = h2[r2 + 1], E2 = h2[r2 + 2], S2 = h2[o2], C2 = h2[o2 + 1], T2 = h2[o2 + 2], M2 = Math.round(g2), P2 = Math.round(A2);
    let D2, k2, R2, I2, F2, L2, O2, N2;
    for (let t3 = M2; t3 <= P2; t3++) {
      if (t3 < f2) {
        const e4 = t3 < g2 ? 0 : (g2 - t3) / (g2 - f2);
        D2 = p2 - (p2 - m2) * e4;
        k2 = w2 - (w2 - x2) * e4;
        R2 = v2 - (v2 - _2) * e4;
        I2 = y2 - (y2 - E2) * e4;
      } else {
        let e4;
        e4 = t3 > A2 ? 1 : f2 === A2 ? 0 : (f2 - t3) / (f2 - A2);
        D2 = m2 - (m2 - b2) * e4;
        k2 = x2 - (x2 - S2) * e4;
        R2 = _2 - (_2 - C2) * e4;
        I2 = E2 - (E2 - T2) * e4;
      }
      let e3;
      e3 = t3 < g2 ? 0 : t3 > A2 ? 1 : (g2 - t3) / (g2 - A2);
      F2 = p2 - (p2 - b2) * e3;
      L2 = w2 - (w2 - S2) * e3;
      O2 = v2 - (v2 - C2) * e3;
      N2 = y2 - (y2 - T2) * e3;
      const i3 = Math.round(Math.min(D2, F2)), s3 = Math.round(Math.max(D2, F2));
      let n3 = c2 * t3 + 4 * i3;
      for (let t4 = i3; t4 <= s3; t4++) {
        e3 = (D2 - t4) / (D2 - F2);
        e3 < 0 ? e3 = 0 : e3 > 1 && (e3 = 1);
        d2[n3++] = k2 - (k2 - L2) * e3 | 0;
        d2[n3++] = R2 - (R2 - O2) * e3 | 0;
        d2[n3++] = I2 - (I2 - N2) * e3 | 0;
        d2[n3++] = 255;
      }
    }
  }
  function drawFigure(t2, e2, i2) {
    const s2 = e2.coords, n2 = e2.colors;
    let a2, r2;
    switch (e2.type) {
      case "lattice":
        const o2 = e2.verticesPerRow, l2 = Math.floor(s2.length / o2) - 1, h2 = o2 - 1;
        for (a2 = 0; a2 < l2; a2++) {
          let e3 = a2 * o2;
          for (let a3 = 0; a3 < h2; a3++, e3++) {
            drawTriangle(t2, i2, s2[e3], s2[e3 + 1], s2[e3 + o2], n2[e3], n2[e3 + 1], n2[e3 + o2]);
            drawTriangle(t2, i2, s2[e3 + o2 + 1], s2[e3 + 1], s2[e3 + o2], n2[e3 + o2 + 1], n2[e3 + 1], n2[e3 + o2]);
          }
        }
        break;
      case "triangles":
        for (a2 = 0, r2 = s2.length; a2 < r2; a2 += 3) drawTriangle(t2, i2, s2[a2], s2[a2 + 1], s2[a2 + 2], n2[a2], n2[a2 + 1], n2[a2 + 2]);
        break;
      default:
        throw new Error("illegal figure");
    }
  }
  var MeshShadingPattern = class extends BaseShadingPattern {
    constructor(t2) {
      super();
      this._coords = t2[2];
      this._colors = t2[3];
      this._figures = t2[4];
      this._bounds = t2[5];
      this._bbox = t2[7];
      this._background = t2[8];
      this.matrix = null;
    }
    _createMeshCanvas(t2, e2, i2) {
      const s2 = Math.floor(this._bounds[0]), n2 = Math.floor(this._bounds[1]), a2 = Math.ceil(this._bounds[2]) - s2, r2 = Math.ceil(this._bounds[3]) - n2, o2 = Math.min(Math.ceil(Math.abs(a2 * t2[0] * 1.1)), 3e3), l2 = Math.min(Math.ceil(Math.abs(r2 * t2[1] * 1.1)), 3e3), h2 = a2 / o2, d2 = r2 / l2, c2 = { coords: this._coords, colors: this._colors, offsetX: -s2, offsetY: -n2, scaleX: 1 / h2, scaleY: 1 / d2 }, u2 = o2 + 4, p2 = l2 + 4, g2 = i2.getCanvas("mesh", u2, p2), m2 = g2.context, f2 = m2.createImageData(o2, l2);
      if (e2) {
        const t3 = f2.data;
        for (let i3 = 0, s3 = t3.length; i3 < s3; i3 += 4) {
          t3[i3] = e2[0];
          t3[i3 + 1] = e2[1];
          t3[i3 + 2] = e2[2];
          t3[i3 + 3] = 255;
        }
      }
      for (const t3 of this._figures) drawFigure(f2, t3, c2);
      m2.putImageData(f2, 2, 2);
      return { canvas: g2.canvas, offsetX: s2 - 2 * h2, offsetY: n2 - 2 * d2, scaleX: h2, scaleY: d2 };
    }
    getPattern(t2, e2, i2, s2) {
      applyBoundingBox(t2, this._bbox);
      let n2;
      if (s2 === wt) n2 = Util.singularValueDecompose2dScale(getCurrentTransform(t2));
      else {
        n2 = Util.singularValueDecompose2dScale(e2.baseTransform);
        if (this.matrix) {
          const t3 = Util.singularValueDecompose2dScale(this.matrix);
          n2 = [n2[0] * t3[0], n2[1] * t3[1]];
        }
      }
      const a2 = this._createMeshCanvas(n2, s2 === wt ? null : this._background, e2.cachedCanvases);
      if (s2 !== wt) {
        t2.setTransform(...e2.baseTransform);
        this.matrix && t2.transform(...this.matrix);
      }
      t2.translate(a2.offsetX, a2.offsetY);
      t2.scale(a2.scaleX, a2.scaleY);
      return t2.createPattern(a2.canvas, "no-repeat");
    }
  };
  var DummyShadingPattern = class extends BaseShadingPattern {
    getPattern() {
      return "hotpink";
    }
  };
  var vt = 1;
  var yt = 2;
  var TilingPattern = class _TilingPattern {
    static MAX_PATTERN_SIZE = 3e3;
    constructor(t2, e2, i2, s2, n2) {
      this.operatorList = t2[2];
      this.matrix = t2[3];
      this.bbox = t2[4];
      this.xstep = t2[5];
      this.ystep = t2[6];
      this.paintType = t2[7];
      this.tilingType = t2[8];
      this.color = e2;
      this.ctx = i2;
      this.canvasGraphicsFactory = s2;
      this.baseTransform = n2;
    }
    createPatternCanvas(t2) {
      const { bbox: e2, operatorList: i2, paintType: s2, tilingType: n2, color: a2, canvasGraphicsFactory: r2 } = this;
      let { xstep: o2, ystep: l2 } = this;
      o2 = Math.abs(o2);
      l2 = Math.abs(l2);
      info("TilingType: " + n2);
      const h2 = e2[0], d2 = e2[1], c2 = e2[2], u2 = e2[3], p2 = c2 - h2, g2 = u2 - d2, m2 = Util.singularValueDecompose2dScale(this.matrix), f2 = Util.singularValueDecompose2dScale(this.baseTransform), b2 = m2[0] * f2[0], A2 = m2[1] * f2[1];
      let w2 = p2, v2 = g2, y2 = false, x2 = false;
      const _2 = Math.ceil(o2 * b2), E2 = Math.ceil(l2 * A2);
      _2 >= Math.ceil(p2 * b2) ? w2 = o2 : y2 = true;
      E2 >= Math.ceil(g2 * A2) ? v2 = l2 : x2 = true;
      const S2 = this.getSizeAndScale(w2, this.ctx.canvas.width, b2), C2 = this.getSizeAndScale(v2, this.ctx.canvas.height, A2), T2 = t2.cachedCanvases.getCanvas("pattern", S2.size, C2.size), M2 = T2.context, P2 = r2.createCanvasGraphics(M2);
      P2.groupLevel = t2.groupLevel;
      this.setFillAndStrokeStyleToContext(P2, s2, a2);
      M2.translate(-S2.scale * h2, -C2.scale * d2);
      P2.transform(S2.scale, 0, 0, C2.scale, 0, 0);
      M2.save();
      this.clipBbox(P2, h2, d2, c2, u2);
      P2.baseTransform = getCurrentTransform(P2.ctx);
      P2.executeOperatorList(i2);
      P2.endDrawing();
      M2.restore();
      if (y2 || x2) {
        const e3 = T2.canvas;
        y2 && (w2 = o2);
        x2 && (v2 = l2);
        const i3 = this.getSizeAndScale(w2, this.ctx.canvas.width, b2), s3 = this.getSizeAndScale(v2, this.ctx.canvas.height, A2), n3 = i3.size, a3 = s3.size, r3 = t2.cachedCanvases.getCanvas("pattern-workaround", n3, a3), c3 = r3.context, u3 = y2 ? Math.floor(p2 / o2) : 0, m3 = x2 ? Math.floor(g2 / l2) : 0;
        for (let t3 = 0; t3 <= u3; t3++) for (let i4 = 0; i4 <= m3; i4++) c3.drawImage(e3, n3 * t3, a3 * i4, n3, a3, 0, 0, n3, a3);
        return { canvas: r3.canvas, scaleX: i3.scale, scaleY: s3.scale, offsetX: h2, offsetY: d2 };
      }
      return { canvas: T2.canvas, scaleX: S2.scale, scaleY: C2.scale, offsetX: h2, offsetY: d2 };
    }
    getSizeAndScale(t2, e2, i2) {
      const s2 = Math.max(_TilingPattern.MAX_PATTERN_SIZE, e2);
      let n2 = Math.ceil(t2 * i2);
      n2 >= s2 ? n2 = s2 : i2 = n2 / t2;
      return { scale: i2, size: n2 };
    }
    clipBbox(t2, e2, i2, s2, n2) {
      const a2 = s2 - e2, r2 = n2 - i2;
      t2.ctx.rect(e2, i2, a2, r2);
      t2.current.updateRectMinMax(getCurrentTransform(t2.ctx), [e2, i2, s2, n2]);
      t2.clip();
      t2.endPath();
    }
    setFillAndStrokeStyleToContext(t2, e2, i2) {
      const s2 = t2.ctx, n2 = t2.current;
      switch (e2) {
        case vt:
          const t3 = this.ctx;
          s2.fillStyle = t3.fillStyle;
          s2.strokeStyle = t3.strokeStyle;
          n2.fillColor = t3.fillStyle;
          n2.strokeColor = t3.strokeStyle;
          break;
        case yt:
          const a2 = Util.makeHexColor(i2[0], i2[1], i2[2]);
          s2.fillStyle = a2;
          s2.strokeStyle = a2;
          n2.fillColor = a2;
          n2.strokeColor = a2;
          break;
        default:
          throw new FormatError(`Unsupported paint type: ${e2}`);
      }
    }
    getPattern(t2, e2, i2, s2) {
      let n2 = i2;
      if (s2 !== wt) {
        n2 = Util.transform(n2, e2.baseTransform);
        this.matrix && (n2 = Util.transform(n2, this.matrix));
      }
      const a2 = this.createPatternCanvas(e2);
      let r2 = new DOMMatrix(n2);
      r2 = r2.translate(a2.offsetX, a2.offsetY);
      r2 = r2.scale(1 / a2.scaleX, 1 / a2.scaleY);
      const o2 = t2.createPattern(a2.canvas, "repeat");
      o2.setTransform(r2);
      return o2;
    }
  };
  function convertBlackAndWhiteToRGBA({ src: t2, srcPos: e2 = 0, dest: i2, width: s2, height: n2, nonBlackColor: a2 = 4294967295, inverseDecode: r2 = false }) {
    const o2 = util_FeatureTest.isLittleEndian ? 4278190080 : 255, [l2, h2] = r2 ? [a2, o2] : [o2, a2], d2 = s2 >> 3, c2 = 7 & s2, u2 = t2.length;
    i2 = new Uint32Array(i2.buffer);
    let p2 = 0;
    for (let s3 = 0; s3 < n2; s3++) {
      for (const s5 = e2 + d2; e2 < s5; e2++) {
        const s6 = e2 < u2 ? t2[e2] : 255;
        i2[p2++] = 128 & s6 ? h2 : l2;
        i2[p2++] = 64 & s6 ? h2 : l2;
        i2[p2++] = 32 & s6 ? h2 : l2;
        i2[p2++] = 16 & s6 ? h2 : l2;
        i2[p2++] = 8 & s6 ? h2 : l2;
        i2[p2++] = 4 & s6 ? h2 : l2;
        i2[p2++] = 2 & s6 ? h2 : l2;
        i2[p2++] = 1 & s6 ? h2 : l2;
      }
      if (0 === c2) continue;
      const s4 = e2 < u2 ? t2[e2++] : 255;
      for (let t3 = 0; t3 < c2; t3++) i2[p2++] = s4 & 1 << 7 - t3 ? h2 : l2;
    }
    return { srcPos: e2, destPos: p2 };
  }
  var xt = 16;
  var CachedCanvases = class {
    constructor(t2) {
      this.canvasFactory = t2;
      this.cache = /* @__PURE__ */ Object.create(null);
    }
    getCanvas(t2, e2, i2) {
      let s2;
      if (void 0 !== this.cache[t2]) {
        s2 = this.cache[t2];
        this.canvasFactory.reset(s2, e2, i2);
      } else {
        s2 = this.canvasFactory.create(e2, i2);
        this.cache[t2] = s2;
      }
      return s2;
    }
    delete(t2) {
      delete this.cache[t2];
    }
    clear() {
      for (const t2 in this.cache) {
        const e2 = this.cache[t2];
        this.canvasFactory.destroy(e2);
        delete this.cache[t2];
      }
    }
  };
  function drawImageAtIntegerCoords(t2, e2, i2, s2, n2, a2, r2, o2, l2, h2) {
    const [d2, c2, u2, p2, g2, m2] = getCurrentTransform(t2);
    if (0 === c2 && 0 === u2) {
      const f2 = r2 * d2 + g2, b2 = Math.round(f2), A2 = o2 * p2 + m2, w2 = Math.round(A2), v2 = (r2 + l2) * d2 + g2, y2 = Math.abs(Math.round(v2) - b2) || 1, x2 = (o2 + h2) * p2 + m2, _2 = Math.abs(Math.round(x2) - w2) || 1;
      t2.setTransform(Math.sign(d2), 0, 0, Math.sign(p2), b2, w2);
      t2.drawImage(e2, i2, s2, n2, a2, 0, 0, y2, _2);
      t2.setTransform(d2, c2, u2, p2, g2, m2);
      return [y2, _2];
    }
    if (0 === d2 && 0 === p2) {
      const f2 = o2 * u2 + g2, b2 = Math.round(f2), A2 = r2 * c2 + m2, w2 = Math.round(A2), v2 = (o2 + h2) * u2 + g2, y2 = Math.abs(Math.round(v2) - b2) || 1, x2 = (r2 + l2) * c2 + m2, _2 = Math.abs(Math.round(x2) - w2) || 1;
      t2.setTransform(0, Math.sign(c2), Math.sign(u2), 0, b2, w2);
      t2.drawImage(e2, i2, s2, n2, a2, 0, 0, _2, y2);
      t2.setTransform(d2, c2, u2, p2, g2, m2);
      return [_2, y2];
    }
    t2.drawImage(e2, i2, s2, n2, a2, r2, o2, l2, h2);
    return [Math.hypot(d2, c2) * l2, Math.hypot(u2, p2) * h2];
  }
  var CanvasExtraState = class {
    constructor(t2, e2) {
      this.alphaIsShape = false;
      this.fontSize = 0;
      this.fontSizeScale = 1;
      this.textMatrix = i;
      this.textMatrixScale = 1;
      this.fontMatrix = s;
      this.leading = 0;
      this.x = 0;
      this.y = 0;
      this.lineX = 0;
      this.lineY = 0;
      this.charSpacing = 0;
      this.wordSpacing = 0;
      this.textHScale = 1;
      this.textRenderingMode = b;
      this.textRise = 0;
      this.fillColor = "#000000";
      this.strokeColor = "#000000";
      this.patternFill = false;
      this.patternStroke = false;
      this.fillAlpha = 1;
      this.strokeAlpha = 1;
      this.lineWidth = 1;
      this.activeSMask = null;
      this.transferMaps = "none";
      this.startNewPathAndClipBox([0, 0, t2, e2]);
    }
    clone() {
      const t2 = Object.create(this);
      t2.clipBox = this.clipBox.slice();
      return t2;
    }
    setCurrentPoint(t2, e2) {
      this.x = t2;
      this.y = e2;
    }
    updatePathMinMax(t2, e2, i2) {
      [e2, i2] = Util.applyTransform([e2, i2], t2);
      this.minX = Math.min(this.minX, e2);
      this.minY = Math.min(this.minY, i2);
      this.maxX = Math.max(this.maxX, e2);
      this.maxY = Math.max(this.maxY, i2);
    }
    updateRectMinMax(t2, e2) {
      const i2 = Util.applyTransform(e2, t2), s2 = Util.applyTransform(e2.slice(2), t2), n2 = Util.applyTransform([e2[0], e2[3]], t2), a2 = Util.applyTransform([e2[2], e2[1]], t2);
      this.minX = Math.min(this.minX, i2[0], s2[0], n2[0], a2[0]);
      this.minY = Math.min(this.minY, i2[1], s2[1], n2[1], a2[1]);
      this.maxX = Math.max(this.maxX, i2[0], s2[0], n2[0], a2[0]);
      this.maxY = Math.max(this.maxY, i2[1], s2[1], n2[1], a2[1]);
    }
    updateScalingPathMinMax(t2, e2) {
      Util.scaleMinMax(t2, e2);
      this.minX = Math.min(this.minX, e2[0]);
      this.minY = Math.min(this.minY, e2[1]);
      this.maxX = Math.max(this.maxX, e2[2]);
      this.maxY = Math.max(this.maxY, e2[3]);
    }
    updateCurvePathMinMax(t2, e2, i2, s2, n2, a2, r2, o2, l2, h2) {
      const d2 = Util.bezierBoundingBox(e2, i2, s2, n2, a2, r2, o2, l2, h2);
      h2 || this.updateRectMinMax(t2, d2);
    }
    getPathBoundingBox(t2 = bt, e2 = null) {
      const i2 = [this.minX, this.minY, this.maxX, this.maxY];
      if (t2 === At) {
        e2 || unreachable("Stroke bounding box must include transform.");
        const t3 = Util.singularValueDecompose2dScale(e2), s2 = t3[0] * this.lineWidth / 2, n2 = t3[1] * this.lineWidth / 2;
        i2[0] -= s2;
        i2[1] -= n2;
        i2[2] += s2;
        i2[3] += n2;
      }
      return i2;
    }
    updateClipFromPath() {
      const t2 = Util.intersect(this.clipBox, this.getPathBoundingBox());
      this.startNewPathAndClipBox(t2 || [0, 0, 0, 0]);
    }
    isEmptyClip() {
      return this.minX === 1 / 0;
    }
    startNewPathAndClipBox(t2) {
      this.clipBox = t2;
      this.minX = 1 / 0;
      this.minY = 1 / 0;
      this.maxX = 0;
      this.maxY = 0;
    }
    getClippedPathBoundingBox(t2 = bt, e2 = null) {
      return Util.intersect(this.clipBox, this.getPathBoundingBox(t2, e2));
    }
  };
  function putBinaryImageData(t2, e2) {
    if (e2 instanceof ImageData) {
      t2.putImageData(e2, 0, 0);
      return;
    }
    const i2 = e2.height, s2 = e2.width, n2 = i2 % xt, a2 = (i2 - n2) / xt, r2 = 0 === n2 ? a2 : a2 + 1, o2 = t2.createImageData(s2, xt);
    let l2, h2 = 0;
    const d2 = e2.data, c2 = o2.data;
    let u2, p2, g2, m2;
    if (e2.kind === _.GRAYSCALE_1BPP) {
      const e3 = d2.byteLength, i3 = new Uint32Array(c2.buffer, 0, c2.byteLength >> 2), m3 = i3.length, f2 = s2 + 7 >> 3, b2 = 4294967295, A2 = util_FeatureTest.isLittleEndian ? 4278190080 : 255;
      for (u2 = 0; u2 < r2; u2++) {
        g2 = u2 < a2 ? xt : n2;
        l2 = 0;
        for (p2 = 0; p2 < g2; p2++) {
          const t3 = e3 - h2;
          let n3 = 0;
          const a3 = t3 > f2 ? s2 : 8 * t3 - 7, r3 = -8 & a3;
          let o3 = 0, c3 = 0;
          for (; n3 < r3; n3 += 8) {
            c3 = d2[h2++];
            i3[l2++] = 128 & c3 ? b2 : A2;
            i3[l2++] = 64 & c3 ? b2 : A2;
            i3[l2++] = 32 & c3 ? b2 : A2;
            i3[l2++] = 16 & c3 ? b2 : A2;
            i3[l2++] = 8 & c3 ? b2 : A2;
            i3[l2++] = 4 & c3 ? b2 : A2;
            i3[l2++] = 2 & c3 ? b2 : A2;
            i3[l2++] = 1 & c3 ? b2 : A2;
          }
          for (; n3 < a3; n3++) {
            if (0 === o3) {
              c3 = d2[h2++];
              o3 = 128;
            }
            i3[l2++] = c3 & o3 ? b2 : A2;
            o3 >>= 1;
          }
        }
        for (; l2 < m3; ) i3[l2++] = 0;
        t2.putImageData(o2, 0, u2 * xt);
      }
    } else if (e2.kind === _.RGBA_32BPP) {
      p2 = 0;
      m2 = s2 * xt * 4;
      for (u2 = 0; u2 < a2; u2++) {
        c2.set(d2.subarray(h2, h2 + m2));
        h2 += m2;
        t2.putImageData(o2, 0, p2);
        p2 += xt;
      }
      if (u2 < r2) {
        m2 = s2 * n2 * 4;
        c2.set(d2.subarray(h2, h2 + m2));
        t2.putImageData(o2, 0, p2);
      }
    } else {
      if (e2.kind !== _.RGB_24BPP) throw new Error(`bad image kind: ${e2.kind}`);
      g2 = xt;
      m2 = s2 * g2;
      for (u2 = 0; u2 < r2; u2++) {
        if (u2 >= a2) {
          g2 = n2;
          m2 = s2 * g2;
        }
        l2 = 0;
        for (p2 = m2; p2--; ) {
          c2[l2++] = d2[h2++];
          c2[l2++] = d2[h2++];
          c2[l2++] = d2[h2++];
          c2[l2++] = 255;
        }
        t2.putImageData(o2, 0, u2 * xt);
      }
    }
  }
  function putBinaryImageMask(t2, e2) {
    if (e2.bitmap) {
      t2.drawImage(e2.bitmap, 0, 0);
      return;
    }
    const i2 = e2.height, s2 = e2.width, n2 = i2 % xt, a2 = (i2 - n2) / xt, r2 = 0 === n2 ? a2 : a2 + 1, o2 = t2.createImageData(s2, xt);
    let l2 = 0;
    const h2 = e2.data, d2 = o2.data;
    for (let e3 = 0; e3 < r2; e3++) {
      const i3 = e3 < a2 ? xt : n2;
      ({ srcPos: l2 } = convertBlackAndWhiteToRGBA({ src: h2, srcPos: l2, dest: d2, width: s2, height: i3, nonBlackColor: 0 }));
      t2.putImageData(o2, 0, e3 * xt);
    }
  }
  function copyCtxState(t2, e2) {
    const i2 = ["strokeStyle", "fillStyle", "fillRule", "globalAlpha", "lineWidth", "lineCap", "lineJoin", "miterLimit", "globalCompositeOperation", "font", "filter"];
    for (const s2 of i2) void 0 !== t2[s2] && (e2[s2] = t2[s2]);
    if (void 0 !== t2.setLineDash) {
      e2.setLineDash(t2.getLineDash());
      e2.lineDashOffset = t2.lineDashOffset;
    }
  }
  function resetCtxToDefault(t2) {
    t2.strokeStyle = t2.fillStyle = "#000000";
    t2.fillRule = "nonzero";
    t2.globalAlpha = 1;
    t2.lineWidth = 1;
    t2.lineCap = "butt";
    t2.lineJoin = "miter";
    t2.miterLimit = 10;
    t2.globalCompositeOperation = "source-over";
    t2.font = "10px sans-serif";
    if (void 0 !== t2.setLineDash) {
      t2.setLineDash([]);
      t2.lineDashOffset = 0;
    }
    if (!e) {
      const { filter: e2 } = t2;
      "none" !== e2 && "" !== e2 && (t2.filter = "none");
    }
  }
  function getImageSmoothingEnabled(t2, e2) {
    if (e2) return true;
    const i2 = Util.singularValueDecompose2dScale(t2);
    i2[0] = Math.fround(i2[0]);
    i2[1] = Math.fround(i2[1]);
    const s2 = Math.fround((globalThis.devicePixelRatio || 1) * PixelsPerInch.PDF_TO_CSS_UNITS);
    return i2[0] <= s2 && i2[1] <= s2;
  }
  var _t = ["butt", "round", "square"];
  var Et = ["miter", "round", "bevel"];
  var St = {};
  var Ct = {};
  var CanvasGraphics = class _CanvasGraphics {
    constructor(t2, e2, i2, s2, n2, { optionalContentConfig: a2, markedContentStack: r2 = null }, o2, l2) {
      this.ctx = t2;
      this.current = new CanvasExtraState(this.ctx.canvas.width, this.ctx.canvas.height);
      this.stateStack = [];
      this.pendingClip = null;
      this.pendingEOFill = false;
      this.res = null;
      this.xobjs = null;
      this.commonObjs = e2;
      this.objs = i2;
      this.canvasFactory = s2;
      this.filterFactory = n2;
      this.groupStack = [];
      this.processingType3 = null;
      this.baseTransform = null;
      this.baseTransformStack = [];
      this.groupLevel = 0;
      this.smaskStack = [];
      this.smaskCounter = 0;
      this.tempSMask = null;
      this.suspendedCtx = null;
      this.contentVisible = true;
      this.markedContentStack = r2 || [];
      this.optionalContentConfig = a2;
      this.cachedCanvases = new CachedCanvases(this.canvasFactory);
      this.cachedPatterns = /* @__PURE__ */ new Map();
      this.annotationCanvasMap = o2;
      this.viewportScale = 1;
      this.outputScaleX = 1;
      this.outputScaleY = 1;
      this.pageColors = l2;
      this._cachedScaleForStroking = [-1, 0];
      this._cachedGetSinglePixelWidth = null;
      this._cachedBitmapsMap = /* @__PURE__ */ new Map();
    }
    getObject(t2, e2 = null) {
      return "string" == typeof t2 ? t2.startsWith("g_") ? this.commonObjs.get(t2) : this.objs.get(t2) : e2;
    }
    beginDrawing({ transform: t2, viewport: e2, transparency: i2 = false, background: s2 = null }) {
      const n2 = this.ctx.canvas.width, a2 = this.ctx.canvas.height, r2 = this.ctx.fillStyle;
      this.ctx.fillStyle = s2 || "#ffffff";
      this.ctx.fillRect(0, 0, n2, a2);
      this.ctx.fillStyle = r2;
      if (i2) {
        const t3 = this.cachedCanvases.getCanvas("transparent", n2, a2);
        this.compositeCtx = this.ctx;
        this.transparentCanvas = t3.canvas;
        this.ctx = t3.context;
        this.ctx.save();
        this.ctx.transform(...getCurrentTransform(this.compositeCtx));
      }
      this.ctx.save();
      resetCtxToDefault(this.ctx);
      if (t2) {
        this.ctx.transform(...t2);
        this.outputScaleX = t2[0];
        this.outputScaleY = t2[0];
      }
      this.ctx.transform(...e2.transform);
      this.viewportScale = e2.scale;
      this.baseTransform = getCurrentTransform(this.ctx);
    }
    executeOperatorList(t2, e2, i2, s2) {
      const n2 = t2.argsArray, a2 = t2.fnArray;
      let r2 = e2 || 0;
      const o2 = n2.length;
      if (o2 === r2) return r2;
      const l2 = o2 - r2 > 10 && "function" == typeof i2, h2 = l2 ? Date.now() + 15 : 0;
      let d2 = 0;
      const c2 = this.commonObjs, u2 = this.objs;
      let p2;
      for (; ; ) {
        if (void 0 !== s2 && r2 === s2.nextBreakPoint) {
          s2.breakIt(r2, i2);
          return r2;
        }
        p2 = a2[r2];
        if (p2 !== X.dependency) this[p2].apply(this, n2[r2]);
        else for (const t3 of n2[r2]) {
          const e3 = t3.startsWith("g_") ? c2 : u2;
          if (!e3.has(t3)) {
            e3.get(t3, i2);
            return r2;
          }
        }
        r2++;
        if (r2 === o2) return r2;
        if (l2 && ++d2 > 10) {
          if (Date.now() > h2) {
            i2();
            return r2;
          }
          d2 = 0;
        }
      }
    }
    #hi() {
      for (; this.stateStack.length || this.inSMaskMode; ) this.restore();
      this.current.activeSMask = null;
      this.ctx.restore();
      if (this.transparentCanvas) {
        this.ctx = this.compositeCtx;
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.drawImage(this.transparentCanvas, 0, 0);
        this.ctx.restore();
        this.transparentCanvas = null;
      }
    }
    endDrawing() {
      this.#hi();
      this.cachedCanvases.clear();
      this.cachedPatterns.clear();
      for (const t2 of this._cachedBitmapsMap.values()) {
        for (const e2 of t2.values()) "undefined" != typeof HTMLCanvasElement && e2 instanceof HTMLCanvasElement && (e2.width = e2.height = 0);
        t2.clear();
      }
      this._cachedBitmapsMap.clear();
      this.#di();
    }
    #di() {
      if (this.pageColors) {
        const t2 = this.filterFactory.addHCMFilter(this.pageColors.foreground, this.pageColors.background);
        if ("none" !== t2) {
          const e2 = this.ctx.filter;
          this.ctx.filter = t2;
          this.ctx.drawImage(this.ctx.canvas, 0, 0);
          this.ctx.filter = e2;
        }
      }
    }
    _scaleImage(t2, e2) {
      const i2 = t2.width ?? t2.displayWidth, s2 = t2.height ?? t2.displayHeight;
      let n2, a2, r2 = Math.max(Math.hypot(e2[0], e2[1]), 1), o2 = Math.max(Math.hypot(e2[2], e2[3]), 1), l2 = i2, h2 = s2, d2 = "prescale1";
      for (; r2 > 2 && l2 > 1 || o2 > 2 && h2 > 1; ) {
        let e3 = l2, i3 = h2;
        if (r2 > 2 && l2 > 1) {
          e3 = l2 >= 16384 ? Math.floor(l2 / 2) - 1 || 1 : Math.ceil(l2 / 2);
          r2 /= l2 / e3;
        }
        if (o2 > 2 && h2 > 1) {
          i3 = h2 >= 16384 ? Math.floor(h2 / 2) - 1 || 1 : Math.ceil(h2) / 2;
          o2 /= h2 / i3;
        }
        n2 = this.cachedCanvases.getCanvas(d2, e3, i3);
        a2 = n2.context;
        a2.clearRect(0, 0, e3, i3);
        a2.drawImage(t2, 0, 0, l2, h2, 0, 0, e3, i3);
        t2 = n2.canvas;
        l2 = e3;
        h2 = i3;
        d2 = "prescale1" === d2 ? "prescale2" : "prescale1";
      }
      return { img: t2, paintWidth: l2, paintHeight: h2 };
    }
    _createMaskCanvas(t2) {
      const e2 = this.ctx, { width: i2, height: s2 } = t2, n2 = this.current.fillColor, a2 = this.current.patternFill, r2 = getCurrentTransform(e2);
      let o2, l2, h2, d2;
      if ((t2.bitmap || t2.data) && t2.count > 1) {
        const e3 = t2.bitmap || t2.data.buffer;
        l2 = JSON.stringify(a2 ? r2 : [r2.slice(0, 4), n2]);
        o2 = this._cachedBitmapsMap.get(e3);
        if (!o2) {
          o2 = /* @__PURE__ */ new Map();
          this._cachedBitmapsMap.set(e3, o2);
        }
        const i3 = o2.get(l2);
        if (i3 && !a2) {
          return { canvas: i3, offsetX: Math.round(Math.min(r2[0], r2[2]) + r2[4]), offsetY: Math.round(Math.min(r2[1], r2[3]) + r2[5]) };
        }
        h2 = i3;
      }
      if (!h2) {
        d2 = this.cachedCanvases.getCanvas("maskCanvas", i2, s2);
        putBinaryImageMask(d2.context, t2);
      }
      let c2 = Util.transform(r2, [1 / i2, 0, 0, -1 / s2, 0, 0]);
      c2 = Util.transform(c2, [1, 0, 0, 1, 0, -s2]);
      const [u2, p2, g2, m2] = Util.getAxialAlignedBoundingBox([0, 0, i2, s2], c2), f2 = Math.round(g2 - u2) || 1, b2 = Math.round(m2 - p2) || 1, A2 = this.cachedCanvases.getCanvas("fillCanvas", f2, b2), w2 = A2.context, v2 = u2, y2 = p2;
      w2.translate(-v2, -y2);
      w2.transform(...c2);
      if (!h2) {
        h2 = this._scaleImage(d2.canvas, getCurrentTransformInverse(w2));
        h2 = h2.img;
        o2 && a2 && o2.set(l2, h2);
      }
      w2.imageSmoothingEnabled = getImageSmoothingEnabled(getCurrentTransform(w2), t2.interpolate);
      drawImageAtIntegerCoords(w2, h2, 0, 0, h2.width, h2.height, 0, 0, i2, s2);
      w2.globalCompositeOperation = "source-in";
      const x2 = Util.transform(getCurrentTransformInverse(w2), [1, 0, 0, 1, -v2, -y2]);
      w2.fillStyle = a2 ? n2.getPattern(e2, this, x2, bt) : n2;
      w2.fillRect(0, 0, i2, s2);
      if (o2 && !a2) {
        this.cachedCanvases.delete("fillCanvas");
        o2.set(l2, A2.canvas);
      }
      return { canvas: A2.canvas, offsetX: Math.round(v2), offsetY: Math.round(y2) };
    }
    setLineWidth(t2) {
      t2 !== this.current.lineWidth && (this._cachedScaleForStroking[0] = -1);
      this.current.lineWidth = t2;
      this.ctx.lineWidth = t2;
    }
    setLineCap(t2) {
      this.ctx.lineCap = _t[t2];
    }
    setLineJoin(t2) {
      this.ctx.lineJoin = Et[t2];
    }
    setMiterLimit(t2) {
      this.ctx.miterLimit = t2;
    }
    setDash(t2, e2) {
      const i2 = this.ctx;
      if (void 0 !== i2.setLineDash) {
        i2.setLineDash(t2);
        i2.lineDashOffset = e2;
      }
    }
    setRenderingIntent(t2) {
    }
    setFlatness(t2) {
    }
    setGState(t2) {
      for (const [e2, i2] of t2) switch (e2) {
        case "LW":
          this.setLineWidth(i2);
          break;
        case "LC":
          this.setLineCap(i2);
          break;
        case "LJ":
          this.setLineJoin(i2);
          break;
        case "ML":
          this.setMiterLimit(i2);
          break;
        case "D":
          this.setDash(i2[0], i2[1]);
          break;
        case "RI":
          this.setRenderingIntent(i2);
          break;
        case "FL":
          this.setFlatness(i2);
          break;
        case "Font":
          this.setFont(i2[0], i2[1]);
          break;
        case "CA":
          this.current.strokeAlpha = i2;
          break;
        case "ca":
          this.current.fillAlpha = i2;
          this.ctx.globalAlpha = i2;
          break;
        case "BM":
          this.ctx.globalCompositeOperation = i2;
          break;
        case "SMask":
          this.current.activeSMask = i2 ? this.tempSMask : null;
          this.tempSMask = null;
          this.checkSMaskState();
          break;
        case "TR":
          this.ctx.filter = this.current.transferMaps = this.filterFactory.addFilter(i2);
      }
    }
    get inSMaskMode() {
      return !!this.suspendedCtx;
    }
    checkSMaskState() {
      const t2 = this.inSMaskMode;
      this.current.activeSMask && !t2 ? this.beginSMaskMode() : !this.current.activeSMask && t2 && this.endSMaskMode();
    }
    beginSMaskMode() {
      if (this.inSMaskMode) throw new Error("beginSMaskMode called while already in smask mode");
      const t2 = this.ctx.canvas.width, e2 = this.ctx.canvas.height, i2 = "smaskGroupAt" + this.groupLevel, s2 = this.cachedCanvases.getCanvas(i2, t2, e2);
      this.suspendedCtx = this.ctx;
      this.ctx = s2.context;
      const n2 = this.ctx;
      n2.setTransform(...getCurrentTransform(this.suspendedCtx));
      copyCtxState(this.suspendedCtx, n2);
      !(function mirrorContextOperations(t3, e3) {
        if (t3._removeMirroring) throw new Error("Context is already forwarding operations.");
        t3.__originalSave = t3.save;
        t3.__originalRestore = t3.restore;
        t3.__originalRotate = t3.rotate;
        t3.__originalScale = t3.scale;
        t3.__originalTranslate = t3.translate;
        t3.__originalTransform = t3.transform;
        t3.__originalSetTransform = t3.setTransform;
        t3.__originalResetTransform = t3.resetTransform;
        t3.__originalClip = t3.clip;
        t3.__originalMoveTo = t3.moveTo;
        t3.__originalLineTo = t3.lineTo;
        t3.__originalBezierCurveTo = t3.bezierCurveTo;
        t3.__originalRect = t3.rect;
        t3.__originalClosePath = t3.closePath;
        t3.__originalBeginPath = t3.beginPath;
        t3._removeMirroring = () => {
          t3.save = t3.__originalSave;
          t3.restore = t3.__originalRestore;
          t3.rotate = t3.__originalRotate;
          t3.scale = t3.__originalScale;
          t3.translate = t3.__originalTranslate;
          t3.transform = t3.__originalTransform;
          t3.setTransform = t3.__originalSetTransform;
          t3.resetTransform = t3.__originalResetTransform;
          t3.clip = t3.__originalClip;
          t3.moveTo = t3.__originalMoveTo;
          t3.lineTo = t3.__originalLineTo;
          t3.bezierCurveTo = t3.__originalBezierCurveTo;
          t3.rect = t3.__originalRect;
          t3.closePath = t3.__originalClosePath;
          t3.beginPath = t3.__originalBeginPath;
          delete t3._removeMirroring;
        };
        t3.save = function ctxSave() {
          e3.save();
          this.__originalSave();
        };
        t3.restore = function ctxRestore() {
          e3.restore();
          this.__originalRestore();
        };
        t3.translate = function ctxTranslate(t4, i3) {
          e3.translate(t4, i3);
          this.__originalTranslate(t4, i3);
        };
        t3.scale = function ctxScale(t4, i3) {
          e3.scale(t4, i3);
          this.__originalScale(t4, i3);
        };
        t3.transform = function ctxTransform(t4, i3, s3, n3, a2, r2) {
          e3.transform(t4, i3, s3, n3, a2, r2);
          this.__originalTransform(t4, i3, s3, n3, a2, r2);
        };
        t3.setTransform = function ctxSetTransform(t4, i3, s3, n3, a2, r2) {
          e3.setTransform(t4, i3, s3, n3, a2, r2);
          this.__originalSetTransform(t4, i3, s3, n3, a2, r2);
        };
        t3.resetTransform = function ctxResetTransform() {
          e3.resetTransform();
          this.__originalResetTransform();
        };
        t3.rotate = function ctxRotate(t4) {
          e3.rotate(t4);
          this.__originalRotate(t4);
        };
        t3.clip = function ctxRotate(t4) {
          e3.clip(t4);
          this.__originalClip(t4);
        };
        t3.moveTo = function(t4, i3) {
          e3.moveTo(t4, i3);
          this.__originalMoveTo(t4, i3);
        };
        t3.lineTo = function(t4, i3) {
          e3.lineTo(t4, i3);
          this.__originalLineTo(t4, i3);
        };
        t3.bezierCurveTo = function(t4, i3, s3, n3, a2, r2) {
          e3.bezierCurveTo(t4, i3, s3, n3, a2, r2);
          this.__originalBezierCurveTo(t4, i3, s3, n3, a2, r2);
        };
        t3.rect = function(t4, i3, s3, n3) {
          e3.rect(t4, i3, s3, n3);
          this.__originalRect(t4, i3, s3, n3);
        };
        t3.closePath = function() {
          e3.closePath();
          this.__originalClosePath();
        };
        t3.beginPath = function() {
          e3.beginPath();
          this.__originalBeginPath();
        };
      })(n2, this.suspendedCtx);
      this.setGState([["BM", "source-over"], ["ca", 1], ["CA", 1]]);
    }
    endSMaskMode() {
      if (!this.inSMaskMode) throw new Error("endSMaskMode called while not in smask mode");
      this.ctx._removeMirroring();
      copyCtxState(this.ctx, this.suspendedCtx);
      this.ctx = this.suspendedCtx;
      this.suspendedCtx = null;
    }
    compose(t2) {
      if (!this.current.activeSMask) return;
      if (t2) {
        t2[0] = Math.floor(t2[0]);
        t2[1] = Math.floor(t2[1]);
        t2[2] = Math.ceil(t2[2]);
        t2[3] = Math.ceil(t2[3]);
      } else t2 = [0, 0, this.ctx.canvas.width, this.ctx.canvas.height];
      const e2 = this.current.activeSMask, i2 = this.suspendedCtx;
      this.composeSMask(i2, e2, this.ctx, t2);
      this.ctx.save();
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.restore();
    }
    composeSMask(t2, e2, i2, s2) {
      const n2 = s2[0], a2 = s2[1], r2 = s2[2] - n2, o2 = s2[3] - a2;
      if (0 !== r2 && 0 !== o2) {
        this.genericComposeSMask(e2.context, i2, r2, o2, e2.subtype, e2.backdrop, e2.transferMap, n2, a2, e2.offsetX, e2.offsetY);
        t2.save();
        t2.globalAlpha = 1;
        t2.globalCompositeOperation = "source-over";
        t2.setTransform(1, 0, 0, 1, 0, 0);
        t2.drawImage(i2.canvas, 0, 0);
        t2.restore();
      }
    }
    genericComposeSMask(t2, e2, i2, s2, n2, a2, r2, o2, l2, h2, d2) {
      let c2 = t2.canvas, u2 = o2 - h2, p2 = l2 - d2;
      if (a2) {
        const e3 = Util.makeHexColor(...a2);
        if (u2 < 0 || p2 < 0 || u2 + i2 > c2.width || p2 + s2 > c2.height) {
          const t3 = this.cachedCanvases.getCanvas("maskExtension", i2, s2), n3 = t3.context;
          n3.drawImage(c2, -u2, -p2);
          n3.globalCompositeOperation = "destination-atop";
          n3.fillStyle = e3;
          n3.fillRect(0, 0, i2, s2);
          n3.globalCompositeOperation = "source-over";
          c2 = t3.canvas;
          u2 = p2 = 0;
        } else {
          t2.save();
          t2.globalAlpha = 1;
          t2.setTransform(1, 0, 0, 1, 0, 0);
          const n3 = new Path2D();
          n3.rect(u2, p2, i2, s2);
          t2.clip(n3);
          t2.globalCompositeOperation = "destination-atop";
          t2.fillStyle = e3;
          t2.fillRect(u2, p2, i2, s2);
          t2.restore();
        }
      }
      e2.save();
      e2.globalAlpha = 1;
      e2.setTransform(1, 0, 0, 1, 0, 0);
      "Alpha" === n2 && r2 ? e2.filter = this.filterFactory.addAlphaFilter(r2) : "Luminosity" === n2 && (e2.filter = this.filterFactory.addLuminosityFilter(r2));
      const g2 = new Path2D();
      g2.rect(o2, l2, i2, s2);
      e2.clip(g2);
      e2.globalCompositeOperation = "destination-in";
      e2.drawImage(c2, u2, p2, i2, s2, o2, l2, i2, s2);
      e2.restore();
    }
    save() {
      if (this.inSMaskMode) {
        copyCtxState(this.ctx, this.suspendedCtx);
        this.suspendedCtx.save();
      } else this.ctx.save();
      const t2 = this.current;
      this.stateStack.push(t2);
      this.current = t2.clone();
    }
    restore() {
      0 === this.stateStack.length && this.inSMaskMode && this.endSMaskMode();
      if (0 !== this.stateStack.length) {
        this.current = this.stateStack.pop();
        if (this.inSMaskMode) {
          this.suspendedCtx.restore();
          copyCtxState(this.suspendedCtx, this.ctx);
        } else this.ctx.restore();
        this.checkSMaskState();
        this.pendingClip = null;
        this._cachedScaleForStroking[0] = -1;
        this._cachedGetSinglePixelWidth = null;
      }
    }
    transform(t2, e2, i2, s2, n2, a2) {
      this.ctx.transform(t2, e2, i2, s2, n2, a2);
      this._cachedScaleForStroking[0] = -1;
      this._cachedGetSinglePixelWidth = null;
    }
    constructPath(t2, e2, i2) {
      const s2 = this.ctx, n2 = this.current;
      let a2, r2, o2 = n2.x, l2 = n2.y;
      const h2 = getCurrentTransform(s2), d2 = 0 === h2[0] && 0 === h2[3] || 0 === h2[1] && 0 === h2[2], c2 = d2 ? i2.slice(0) : null;
      for (let i3 = 0, u2 = 0, p2 = t2.length; i3 < p2; i3++) switch (0 | t2[i3]) {
        case X.rectangle:
          o2 = e2[u2++];
          l2 = e2[u2++];
          const t3 = e2[u2++], i4 = e2[u2++], p3 = o2 + t3, g2 = l2 + i4;
          s2.moveTo(o2, l2);
          if (0 === t3 || 0 === i4) s2.lineTo(p3, g2);
          else {
            s2.lineTo(p3, l2);
            s2.lineTo(p3, g2);
            s2.lineTo(o2, g2);
          }
          d2 || n2.updateRectMinMax(h2, [o2, l2, p3, g2]);
          s2.closePath();
          break;
        case X.moveTo:
          o2 = e2[u2++];
          l2 = e2[u2++];
          s2.moveTo(o2, l2);
          d2 || n2.updatePathMinMax(h2, o2, l2);
          break;
        case X.lineTo:
          o2 = e2[u2++];
          l2 = e2[u2++];
          s2.lineTo(o2, l2);
          d2 || n2.updatePathMinMax(h2, o2, l2);
          break;
        case X.curveTo:
          a2 = o2;
          r2 = l2;
          o2 = e2[u2 + 4];
          l2 = e2[u2 + 5];
          s2.bezierCurveTo(e2[u2], e2[u2 + 1], e2[u2 + 2], e2[u2 + 3], o2, l2);
          n2.updateCurvePathMinMax(h2, a2, r2, e2[u2], e2[u2 + 1], e2[u2 + 2], e2[u2 + 3], o2, l2, c2);
          u2 += 6;
          break;
        case X.curveTo2:
          a2 = o2;
          r2 = l2;
          s2.bezierCurveTo(o2, l2, e2[u2], e2[u2 + 1], e2[u2 + 2], e2[u2 + 3]);
          n2.updateCurvePathMinMax(h2, a2, r2, o2, l2, e2[u2], e2[u2 + 1], e2[u2 + 2], e2[u2 + 3], c2);
          o2 = e2[u2 + 2];
          l2 = e2[u2 + 3];
          u2 += 4;
          break;
        case X.curveTo3:
          a2 = o2;
          r2 = l2;
          o2 = e2[u2 + 2];
          l2 = e2[u2 + 3];
          s2.bezierCurveTo(e2[u2], e2[u2 + 1], o2, l2, o2, l2);
          n2.updateCurvePathMinMax(h2, a2, r2, e2[u2], e2[u2 + 1], o2, l2, o2, l2, c2);
          u2 += 4;
          break;
        case X.closePath:
          s2.closePath();
      }
      d2 && n2.updateScalingPathMinMax(h2, c2);
      n2.setCurrentPoint(o2, l2);
    }
    closePath() {
      this.ctx.closePath();
    }
    stroke(t2 = true) {
      const e2 = this.ctx, i2 = this.current.strokeColor;
      e2.globalAlpha = this.current.strokeAlpha;
      if (this.contentVisible) if ("object" == typeof i2 && i2?.getPattern) {
        e2.save();
        e2.strokeStyle = i2.getPattern(e2, this, getCurrentTransformInverse(e2), At);
        this.rescaleAndStroke(false);
        e2.restore();
      } else this.rescaleAndStroke(true);
      t2 && this.consumePath(this.current.getClippedPathBoundingBox());
      e2.globalAlpha = this.current.fillAlpha;
    }
    closeStroke() {
      this.closePath();
      this.stroke();
    }
    fill(t2 = true) {
      const e2 = this.ctx, i2 = this.current.fillColor;
      let s2 = false;
      if (this.current.patternFill) {
        e2.save();
        e2.fillStyle = i2.getPattern(e2, this, getCurrentTransformInverse(e2), bt);
        s2 = true;
      }
      const n2 = this.current.getClippedPathBoundingBox();
      if (this.contentVisible && null !== n2) if (this.pendingEOFill) {
        e2.fill("evenodd");
        this.pendingEOFill = false;
      } else e2.fill();
      s2 && e2.restore();
      t2 && this.consumePath(n2);
    }
    eoFill() {
      this.pendingEOFill = true;
      this.fill();
    }
    fillStroke() {
      this.fill(false);
      this.stroke(false);
      this.consumePath();
    }
    eoFillStroke() {
      this.pendingEOFill = true;
      this.fillStroke();
    }
    closeFillStroke() {
      this.closePath();
      this.fillStroke();
    }
    closeEOFillStroke() {
      this.pendingEOFill = true;
      this.closePath();
      this.fillStroke();
    }
    endPath() {
      this.consumePath();
    }
    clip() {
      this.pendingClip = St;
    }
    eoClip() {
      this.pendingClip = Ct;
    }
    beginText() {
      this.current.textMatrix = i;
      this.current.textMatrixScale = 1;
      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
    }
    endText() {
      const t2 = this.pendingTextPaths, e2 = this.ctx;
      if (void 0 === t2) {
        e2.beginPath();
        return;
      }
      const i2 = new Path2D(), s2 = e2.getTransform().invertSelf();
      for (const { transform: e3, x: n2, y: a2, fontSize: r2, path: o2 } of t2) i2.addPath(o2, new DOMMatrix(e3).preMultiplySelf(s2).translate(n2, a2).scale(r2, -r2));
      e2.clip(i2);
      e2.beginPath();
      delete this.pendingTextPaths;
    }
    setCharSpacing(t2) {
      this.current.charSpacing = t2;
    }
    setWordSpacing(t2) {
      this.current.wordSpacing = t2;
    }
    setHScale(t2) {
      this.current.textHScale = t2 / 100;
    }
    setLeading(t2) {
      this.current.leading = -t2;
    }
    setFont(t2, e2) {
      const i2 = this.commonObjs.get(t2), n2 = this.current;
      if (!i2) throw new Error(`Can't find font for ${t2}`);
      n2.fontMatrix = i2.fontMatrix || s;
      0 !== n2.fontMatrix[0] && 0 !== n2.fontMatrix[3] || warn("Invalid font matrix for font " + t2);
      if (e2 < 0) {
        e2 = -e2;
        n2.fontDirection = -1;
      } else n2.fontDirection = 1;
      this.current.font = i2;
      this.current.fontSize = e2;
      if (i2.isType3Font) return;
      const a2 = i2.loadedName || "sans-serif", r2 = i2.systemFontInfo?.css || `"${a2}", ${i2.fallbackName}`;
      let o2 = "normal";
      i2.black ? o2 = "900" : i2.bold && (o2 = "bold");
      const l2 = i2.italic ? "italic" : "normal";
      let h2 = e2;
      e2 < 16 ? h2 = 16 : e2 > 100 && (h2 = 100);
      this.current.fontSizeScale = e2 / h2;
      this.ctx.font = `${l2} ${o2} ${h2}px ${r2}`;
    }
    setTextRenderingMode(t2) {
      this.current.textRenderingMode = t2;
    }
    setTextRise(t2) {
      this.current.textRise = t2;
    }
    moveText(t2, e2) {
      this.current.x = this.current.lineX += t2;
      this.current.y = this.current.lineY += e2;
    }
    setLeadingMoveText(t2, e2) {
      this.setLeading(-e2);
      this.moveText(t2, e2);
    }
    setTextMatrix(t2, e2, i2, s2, n2, a2) {
      this.current.textMatrix = [t2, e2, i2, s2, n2, a2];
      this.current.textMatrixScale = Math.hypot(t2, e2);
      this.current.x = this.current.lineX = 0;
      this.current.y = this.current.lineY = 0;
    }
    nextLine() {
      this.moveText(0, this.current.leading);
    }
    #ci(t2, e2, i2) {
      const s2 = new Path2D();
      s2.addPath(t2, new DOMMatrix(i2).invertSelf().multiplySelf(e2));
      return s2;
    }
    paintChar(t2, e2, i2, s2, n2) {
      const a2 = this.ctx, r2 = this.current, o2 = r2.font, l2 = r2.textRenderingMode, h2 = r2.fontSize / r2.fontSizeScale, d2 = l2 & y, c2 = !!(l2 & x), u2 = r2.patternFill && !o2.missingFile, p2 = r2.patternStroke && !o2.missingFile;
      let g2;
      (o2.disableFontFace || c2 || u2 || p2) && (g2 = o2.getPathGenerator(this.commonObjs, t2));
      if (o2.disableFontFace || u2 || p2) {
        a2.save();
        a2.translate(e2, i2);
        a2.scale(h2, -h2);
        if (d2 === b || d2 === w) if (s2) {
          const t3 = a2.getTransform();
          a2.setTransform(...s2);
          a2.fill(this.#ci(g2, t3, s2));
        } else a2.fill(g2);
        if (d2 === A || d2 === w) if (n2) {
          const t3 = a2.getTransform();
          a2.setTransform(...n2);
          a2.stroke(this.#ci(g2, t3, n2));
        } else {
          a2.lineWidth /= h2;
          a2.stroke(g2);
        }
        a2.restore();
      } else {
        d2 !== b && d2 !== w || a2.fillText(t2, e2, i2);
        d2 !== A && d2 !== w || a2.strokeText(t2, e2, i2);
      }
      if (c2) {
        (this.pendingTextPaths ||= []).push({ transform: getCurrentTransform(a2), x: e2, y: i2, fontSize: h2, path: g2 });
      }
    }
    get isFontSubpixelAAEnabled() {
      const { context: t2 } = this.cachedCanvases.getCanvas("isFontSubpixelAAEnabled", 10, 10);
      t2.scale(1.5, 1);
      t2.fillText("I", 0, 10);
      const e2 = t2.getImageData(0, 0, 10, 10).data;
      let i2 = false;
      for (let t3 = 3; t3 < e2.length; t3 += 4) if (e2[t3] > 0 && e2[t3] < 255) {
        i2 = true;
        break;
      }
      return shadow(this, "isFontSubpixelAAEnabled", i2);
    }
    showText(t2) {
      const e2 = this.current, i2 = e2.font;
      if (i2.isType3Font) return this.showType3Text(t2);
      const s2 = e2.fontSize;
      if (0 === s2) return;
      const n2 = this.ctx, a2 = e2.fontSizeScale, r2 = e2.charSpacing, o2 = e2.wordSpacing, l2 = e2.fontDirection, h2 = e2.textHScale * l2, d2 = t2.length, c2 = i2.vertical, u2 = c2 ? 1 : -1, p2 = i2.defaultVMetrics, g2 = s2 * e2.fontMatrix[0], m2 = e2.textRenderingMode === b && !i2.disableFontFace && !e2.patternFill;
      n2.save();
      n2.transform(...e2.textMatrix);
      n2.translate(e2.x, e2.y + e2.textRise);
      l2 > 0 ? n2.scale(h2, -1) : n2.scale(h2, 1);
      let f2, v2;
      if (e2.patternFill) {
        n2.save();
        const t3 = e2.fillColor.getPattern(n2, this, getCurrentTransformInverse(n2), bt);
        f2 = getCurrentTransform(n2);
        n2.restore();
        n2.fillStyle = t3;
      }
      if (e2.patternStroke) {
        n2.save();
        const t3 = e2.strokeColor.getPattern(n2, this, getCurrentTransformInverse(n2), At);
        v2 = getCurrentTransform(n2);
        n2.restore();
        n2.strokeStyle = t3;
      }
      let x2 = e2.lineWidth;
      const _2 = e2.textMatrixScale;
      if (0 === _2 || 0 === x2) {
        const t3 = e2.textRenderingMode & y;
        t3 !== A && t3 !== w || (x2 = this.getSinglePixelWidth());
      } else x2 /= _2;
      if (1 !== a2) {
        n2.scale(a2, a2);
        x2 /= a2;
      }
      n2.lineWidth = x2;
      if (i2.isInvalidPDFjsFont) {
        const i3 = [];
        let s3 = 0;
        for (const e3 of t2) {
          i3.push(e3.unicode);
          s3 += e3.width;
        }
        n2.fillText(i3.join(""), 0, 0);
        e2.x += s3 * g2 * h2;
        n2.restore();
        this.compose();
        return;
      }
      let E2, S2 = 0;
      for (E2 = 0; E2 < d2; ++E2) {
        const e3 = t2[E2];
        if ("number" == typeof e3) {
          S2 += u2 * e3 * s2 / 1e3;
          continue;
        }
        let h3 = false;
        const d3 = (e3.isSpace ? o2 : 0) + r2, b2 = e3.fontChar, A2 = e3.accent;
        let w2, y2, x3 = e3.width;
        if (c2) {
          const t3 = e3.vmetric || p2, i3 = -(e3.vmetric ? t3[1] : 0.5 * x3) * g2, s3 = t3[2] * g2;
          x3 = t3 ? -t3[0] : x3;
          w2 = i3 / a2;
          y2 = (S2 + s3) / a2;
        } else {
          w2 = S2 / a2;
          y2 = 0;
        }
        if (i2.remeasure && x3 > 0) {
          const t3 = 1e3 * n2.measureText(b2).width / s2 * a2;
          if (x3 < t3 && this.isFontSubpixelAAEnabled) {
            const e4 = x3 / t3;
            h3 = true;
            n2.save();
            n2.scale(e4, 1);
            w2 /= e4;
          } else x3 !== t3 && (w2 += (x3 - t3) / 2e3 * s2 / a2);
        }
        if (this.contentVisible && (e3.isInFont || i2.missingFile)) if (m2 && !A2) n2.fillText(b2, w2, y2);
        else {
          this.paintChar(b2, w2, y2, f2, v2);
          if (A2) {
            const t3 = w2 + s2 * A2.offset.x / a2, e4 = y2 - s2 * A2.offset.y / a2;
            this.paintChar(A2.fontChar, t3, e4, f2, v2);
          }
        }
        S2 += c2 ? x3 * g2 - d3 * l2 : x3 * g2 + d3 * l2;
        h3 && n2.restore();
      }
      c2 ? e2.y -= S2 : e2.x += S2 * h2;
      n2.restore();
      this.compose();
    }
    showType3Text(t2) {
      const e2 = this.ctx, i2 = this.current, n2 = i2.font, a2 = i2.fontSize, r2 = i2.fontDirection, o2 = n2.vertical ? 1 : -1, l2 = i2.charSpacing, h2 = i2.wordSpacing, d2 = i2.textHScale * r2, c2 = i2.fontMatrix || s, u2 = t2.length;
      let p2, g2, m2, f2;
      if (!(i2.textRenderingMode === v) && 0 !== a2) {
        this._cachedScaleForStroking[0] = -1;
        this._cachedGetSinglePixelWidth = null;
        e2.save();
        e2.transform(...i2.textMatrix);
        e2.translate(i2.x, i2.y);
        e2.scale(d2, r2);
        for (p2 = 0; p2 < u2; ++p2) {
          g2 = t2[p2];
          if ("number" == typeof g2) {
            f2 = o2 * g2 * a2 / 1e3;
            this.ctx.translate(f2, 0);
            i2.x += f2 * d2;
            continue;
          }
          const s2 = (g2.isSpace ? h2 : 0) + l2, r3 = n2.charProcOperatorList[g2.operatorListId];
          if (!r3) {
            warn(`Type3 character "${g2.operatorListId}" is not available.`);
            continue;
          }
          if (this.contentVisible) {
            this.processingType3 = g2;
            this.save();
            e2.scale(a2, a2);
            e2.transform(...c2);
            this.executeOperatorList(r3);
            this.restore();
          }
          m2 = Util.applyTransform([g2.width, 0], c2)[0] * a2 + s2;
          e2.translate(m2, 0);
          i2.x += m2 * d2;
        }
        e2.restore();
        this.processingType3 = null;
      }
    }
    setCharWidth(t2, e2) {
    }
    setCharWidthAndBounds(t2, e2, i2, s2, n2, a2) {
      this.ctx.rect(i2, s2, n2 - i2, a2 - s2);
      this.ctx.clip();
      this.endPath();
    }
    getColorN_Pattern(t2) {
      let e2;
      if ("TilingPattern" === t2[0]) {
        const i2 = t2[1], s2 = this.baseTransform || getCurrentTransform(this.ctx), n2 = { createCanvasGraphics: (t3) => new _CanvasGraphics(t3, this.commonObjs, this.objs, this.canvasFactory, this.filterFactory, { optionalContentConfig: this.optionalContentConfig, markedContentStack: this.markedContentStack }) };
        e2 = new TilingPattern(t2, i2, this.ctx, n2, s2);
      } else e2 = this._getPattern(t2[1], t2[2]);
      return e2;
    }
    setStrokeColorN() {
      this.current.strokeColor = this.getColorN_Pattern(arguments);
      this.current.patternStroke = true;
    }
    setFillColorN() {
      this.current.fillColor = this.getColorN_Pattern(arguments);
      this.current.patternFill = true;
    }
    setStrokeRGBColor(t2, e2, i2) {
      this.ctx.strokeStyle = this.current.strokeColor = Util.makeHexColor(t2, e2, i2);
      this.current.patternStroke = false;
    }
    setStrokeTransparent() {
      this.ctx.strokeStyle = this.current.strokeColor = "transparent";
      this.current.patternStroke = false;
    }
    setFillRGBColor(t2, e2, i2) {
      this.ctx.fillStyle = this.current.fillColor = Util.makeHexColor(t2, e2, i2);
      this.current.patternFill = false;
    }
    setFillTransparent() {
      this.ctx.fillStyle = this.current.fillColor = "transparent";
      this.current.patternFill = false;
    }
    _getPattern(t2, e2 = null) {
      let i2;
      if (this.cachedPatterns.has(t2)) i2 = this.cachedPatterns.get(t2);
      else {
        i2 = (function getShadingPattern(t3) {
          switch (t3[0]) {
            case "RadialAxial":
              return new RadialAxialShadingPattern(t3);
            case "Mesh":
              return new MeshShadingPattern(t3);
            case "Dummy":
              return new DummyShadingPattern();
          }
          throw new Error(`Unknown IR type: ${t3[0]}`);
        })(this.getObject(t2));
        this.cachedPatterns.set(t2, i2);
      }
      e2 && (i2.matrix = e2);
      return i2;
    }
    shadingFill(t2) {
      if (!this.contentVisible) return;
      const e2 = this.ctx;
      this.save();
      const i2 = this._getPattern(t2);
      e2.fillStyle = i2.getPattern(e2, this, getCurrentTransformInverse(e2), wt);
      const s2 = getCurrentTransformInverse(e2);
      if (s2) {
        const { width: t3, height: i3 } = e2.canvas, [n2, a2, r2, o2] = Util.getAxialAlignedBoundingBox([0, 0, t3, i3], s2);
        this.ctx.fillRect(n2, a2, r2 - n2, o2 - a2);
      } else this.ctx.fillRect(-1e10, -1e10, 2e10, 2e10);
      this.compose(this.current.getClippedPathBoundingBox());
      this.restore();
    }
    beginInlineImage() {
      unreachable("Should not call beginInlineImage");
    }
    beginImageData() {
      unreachable("Should not call beginImageData");
    }
    paintFormXObjectBegin(t2, e2) {
      if (this.contentVisible) {
        this.save();
        this.baseTransformStack.push(this.baseTransform);
        t2 && this.transform(...t2);
        this.baseTransform = getCurrentTransform(this.ctx);
        if (e2) {
          const t3 = e2[2] - e2[0], i2 = e2[3] - e2[1];
          this.ctx.rect(e2[0], e2[1], t3, i2);
          this.current.updateRectMinMax(getCurrentTransform(this.ctx), e2);
          this.clip();
          this.endPath();
        }
      }
    }
    paintFormXObjectEnd() {
      if (this.contentVisible) {
        this.restore();
        this.baseTransform = this.baseTransformStack.pop();
      }
    }
    beginGroup(t2) {
      if (!this.contentVisible) return;
      this.save();
      if (this.inSMaskMode) {
        this.endSMaskMode();
        this.current.activeSMask = null;
      }
      const e2 = this.ctx;
      t2.isolated || info("TODO: Support non-isolated groups.");
      t2.knockout && warn("Knockout groups not supported.");
      const i2 = getCurrentTransform(e2);
      t2.matrix && e2.transform(...t2.matrix);
      if (!t2.bbox) throw new Error("Bounding box is required.");
      let s2 = Util.getAxialAlignedBoundingBox(t2.bbox, getCurrentTransform(e2));
      const n2 = [0, 0, e2.canvas.width, e2.canvas.height];
      s2 = Util.intersect(s2, n2) || [0, 0, 0, 0];
      const a2 = Math.floor(s2[0]), r2 = Math.floor(s2[1]), o2 = Math.max(Math.ceil(s2[2]) - a2, 1), l2 = Math.max(Math.ceil(s2[3]) - r2, 1);
      this.current.startNewPathAndClipBox([0, 0, o2, l2]);
      let h2 = "groupAt" + this.groupLevel;
      t2.smask && (h2 += "_smask_" + this.smaskCounter++ % 2);
      const d2 = this.cachedCanvases.getCanvas(h2, o2, l2), c2 = d2.context;
      c2.translate(-a2, -r2);
      c2.transform(...i2);
      if (t2.smask) this.smaskStack.push({ canvas: d2.canvas, context: c2, offsetX: a2, offsetY: r2, subtype: t2.smask.subtype, backdrop: t2.smask.backdrop, transferMap: t2.smask.transferMap || null, startTransformInverse: null });
      else {
        e2.setTransform(1, 0, 0, 1, 0, 0);
        e2.translate(a2, r2);
        e2.save();
      }
      copyCtxState(e2, c2);
      this.ctx = c2;
      this.setGState([["BM", "source-over"], ["ca", 1], ["CA", 1]]);
      this.groupStack.push(e2);
      this.groupLevel++;
    }
    endGroup(t2) {
      if (!this.contentVisible) return;
      this.groupLevel--;
      const e2 = this.ctx, i2 = this.groupStack.pop();
      this.ctx = i2;
      this.ctx.imageSmoothingEnabled = false;
      if (t2.smask) {
        this.tempSMask = this.smaskStack.pop();
        this.restore();
      } else {
        this.ctx.restore();
        const t3 = getCurrentTransform(this.ctx);
        this.restore();
        this.ctx.save();
        this.ctx.setTransform(...t3);
        const i3 = Util.getAxialAlignedBoundingBox([0, 0, e2.canvas.width, e2.canvas.height], t3);
        this.ctx.drawImage(e2.canvas, 0, 0);
        this.ctx.restore();
        this.compose(i3);
      }
    }
    beginAnnotation(t2, e2, i2, s2, n2) {
      this.#hi();
      resetCtxToDefault(this.ctx);
      this.ctx.save();
      this.save();
      this.baseTransform && this.ctx.setTransform(...this.baseTransform);
      if (e2) {
        const s3 = e2[2] - e2[0], a2 = e2[3] - e2[1];
        if (n2 && this.annotationCanvasMap) {
          (i2 = i2.slice())[4] -= e2[0];
          i2[5] -= e2[1];
          (e2 = e2.slice())[0] = e2[1] = 0;
          e2[2] = s3;
          e2[3] = a2;
          const [n3, r2] = Util.singularValueDecompose2dScale(getCurrentTransform(this.ctx)), { viewportScale: o2 } = this, l2 = Math.ceil(s3 * this.outputScaleX * o2), h2 = Math.ceil(a2 * this.outputScaleY * o2);
          this.annotationCanvas = this.canvasFactory.create(l2, h2);
          const { canvas: d2, context: c2 } = this.annotationCanvas;
          this.annotationCanvasMap.set(t2, d2);
          this.annotationCanvas.savedCtx = this.ctx;
          this.ctx = c2;
          this.ctx.save();
          this.ctx.setTransform(n3, 0, 0, -r2, 0, a2 * r2);
          resetCtxToDefault(this.ctx);
        } else {
          resetCtxToDefault(this.ctx);
          this.endPath();
          this.ctx.rect(e2[0], e2[1], s3, a2);
          this.ctx.clip();
          this.ctx.beginPath();
        }
      }
      this.current = new CanvasExtraState(this.ctx.canvas.width, this.ctx.canvas.height);
      this.transform(...i2);
      this.transform(...s2);
    }
    endAnnotation() {
      if (this.annotationCanvas) {
        this.ctx.restore();
        this.#di();
        this.ctx = this.annotationCanvas.savedCtx;
        delete this.annotationCanvas.savedCtx;
        delete this.annotationCanvas;
      }
    }
    paintImageMaskXObject(t2) {
      if (!this.contentVisible) return;
      const e2 = t2.count;
      (t2 = this.getObject(t2.data, t2)).count = e2;
      const i2 = this.ctx, s2 = this.processingType3;
      if (s2) {
        void 0 === s2.compiled && (s2.compiled = (function compileType3Glyph(t3) {
          const { width: e3, height: i3 } = t3;
          if (e3 > 1e3 || i3 > 1e3) return null;
          const s3 = new Uint8Array([0, 2, 4, 0, 1, 0, 5, 4, 8, 10, 0, 8, 0, 2, 1, 0]), n3 = e3 + 1;
          let a3, r2, o2, l2 = new Uint8Array(n3 * (i3 + 1));
          const h2 = e3 + 7 & -8;
          let d2 = new Uint8Array(h2 * i3), c2 = 0;
          for (const e4 of t3.data) {
            let t4 = 128;
            for (; t4 > 0; ) {
              d2[c2++] = e4 & t4 ? 0 : 255;
              t4 >>= 1;
            }
          }
          let u2 = 0;
          c2 = 0;
          if (0 !== d2[c2]) {
            l2[0] = 1;
            ++u2;
          }
          for (r2 = 1; r2 < e3; r2++) {
            if (d2[c2] !== d2[c2 + 1]) {
              l2[r2] = d2[c2] ? 2 : 1;
              ++u2;
            }
            c2++;
          }
          if (0 !== d2[c2]) {
            l2[r2] = 2;
            ++u2;
          }
          for (a3 = 1; a3 < i3; a3++) {
            c2 = a3 * h2;
            o2 = a3 * n3;
            if (d2[c2 - h2] !== d2[c2]) {
              l2[o2] = d2[c2] ? 1 : 8;
              ++u2;
            }
            let t4 = (d2[c2] ? 4 : 0) + (d2[c2 - h2] ? 8 : 0);
            for (r2 = 1; r2 < e3; r2++) {
              t4 = (t4 >> 2) + (d2[c2 + 1] ? 4 : 0) + (d2[c2 - h2 + 1] ? 8 : 0);
              if (s3[t4]) {
                l2[o2 + r2] = s3[t4];
                ++u2;
              }
              c2++;
            }
            if (d2[c2 - h2] !== d2[c2]) {
              l2[o2 + r2] = d2[c2] ? 2 : 4;
              ++u2;
            }
            if (u2 > 1e3) return null;
          }
          c2 = h2 * (i3 - 1);
          o2 = a3 * n3;
          if (0 !== d2[c2]) {
            l2[o2] = 8;
            ++u2;
          }
          for (r2 = 1; r2 < e3; r2++) {
            if (d2[c2] !== d2[c2 + 1]) {
              l2[o2 + r2] = d2[c2] ? 4 : 8;
              ++u2;
            }
            c2++;
          }
          if (0 !== d2[c2]) {
            l2[o2 + r2] = 4;
            ++u2;
          }
          if (u2 > 1e3) return null;
          const p2 = new Int32Array([0, n3, -1, 0, -n3, 0, 0, 0, 1]), g2 = new Path2D();
          for (a3 = 0; u2 && a3 <= i3; a3++) {
            let t4 = a3 * n3;
            const i4 = t4 + e3;
            for (; t4 < i4 && !l2[t4]; ) t4++;
            if (t4 === i4) continue;
            g2.moveTo(t4 % n3, a3);
            const s4 = t4;
            let r3 = l2[t4];
            do {
              const e4 = p2[r3];
              do {
                t4 += e4;
              } while (!l2[t4]);
              const i5 = l2[t4];
              if (5 !== i5 && 10 !== i5) {
                r3 = i5;
                l2[t4] = 0;
              } else {
                r3 = i5 & 51 * r3 >> 4;
                l2[t4] &= r3 >> 2 | r3 << 2;
              }
              g2.lineTo(t4 % n3, t4 / n3 | 0);
              l2[t4] || --u2;
            } while (s4 !== t4);
            --a3;
          }
          d2 = null;
          l2 = null;
          return function(t4) {
            t4.save();
            t4.scale(1 / e3, -1 / i3);
            t4.translate(0, -i3);
            t4.fill(g2);
            t4.beginPath();
            t4.restore();
          };
        })(t2));
        if (s2.compiled) {
          s2.compiled(i2);
          return;
        }
      }
      const n2 = this._createMaskCanvas(t2), a2 = n2.canvas;
      i2.save();
      i2.setTransform(1, 0, 0, 1, 0, 0);
      i2.drawImage(a2, n2.offsetX, n2.offsetY);
      i2.restore();
      this.compose();
    }
    paintImageMaskXObjectRepeat(t2, e2, i2 = 0, s2 = 0, n2, a2) {
      if (!this.contentVisible) return;
      t2 = this.getObject(t2.data, t2);
      const r2 = this.ctx;
      r2.save();
      const o2 = getCurrentTransform(r2);
      r2.transform(e2, i2, s2, n2, 0, 0);
      const l2 = this._createMaskCanvas(t2);
      r2.setTransform(1, 0, 0, 1, l2.offsetX - o2[4], l2.offsetY - o2[5]);
      for (let t3 = 0, h2 = a2.length; t3 < h2; t3 += 2) {
        const h3 = Util.transform(o2, [e2, i2, s2, n2, a2[t3], a2[t3 + 1]]), [d2, c2] = Util.applyTransform([0, 0], h3);
        r2.drawImage(l2.canvas, d2, c2);
      }
      r2.restore();
      this.compose();
    }
    paintImageMaskXObjectGroup(t2) {
      if (!this.contentVisible) return;
      const e2 = this.ctx, i2 = this.current.fillColor, s2 = this.current.patternFill;
      for (const n2 of t2) {
        const { data: t3, width: a2, height: r2, transform: o2 } = n2, l2 = this.cachedCanvases.getCanvas("maskCanvas", a2, r2), h2 = l2.context;
        h2.save();
        putBinaryImageMask(h2, this.getObject(t3, n2));
        h2.globalCompositeOperation = "source-in";
        h2.fillStyle = s2 ? i2.getPattern(h2, this, getCurrentTransformInverse(e2), bt) : i2;
        h2.fillRect(0, 0, a2, r2);
        h2.restore();
        e2.save();
        e2.transform(...o2);
        e2.scale(1, -1);
        drawImageAtIntegerCoords(e2, l2.canvas, 0, 0, a2, r2, 0, -1, 1, 1);
        e2.restore();
      }
      this.compose();
    }
    paintImageXObject(t2) {
      if (!this.contentVisible) return;
      const e2 = this.getObject(t2);
      e2 ? this.paintInlineImageXObject(e2) : warn("Dependent image isn't ready yet");
    }
    paintImageXObjectRepeat(t2, e2, i2, s2) {
      if (!this.contentVisible) return;
      const n2 = this.getObject(t2);
      if (!n2) {
        warn("Dependent image isn't ready yet");
        return;
      }
      const a2 = n2.width, r2 = n2.height, o2 = [];
      for (let t3 = 0, n3 = s2.length; t3 < n3; t3 += 2) o2.push({ transform: [e2, 0, 0, i2, s2[t3], s2[t3 + 1]], x: 0, y: 0, w: a2, h: r2 });
      this.paintInlineImageXObjectGroup(n2, o2);
    }
    applyTransferMapsToCanvas(t2) {
      if ("none" !== this.current.transferMaps) {
        t2.filter = this.current.transferMaps;
        t2.drawImage(t2.canvas, 0, 0);
        t2.filter = "none";
      }
      return t2.canvas;
    }
    applyTransferMapsToBitmap(t2) {
      if ("none" === this.current.transferMaps) return t2.bitmap;
      const { bitmap: e2, width: i2, height: s2 } = t2, n2 = this.cachedCanvases.getCanvas("inlineImage", i2, s2), a2 = n2.context;
      a2.filter = this.current.transferMaps;
      a2.drawImage(e2, 0, 0);
      a2.filter = "none";
      return n2.canvas;
    }
    paintInlineImageXObject(t2) {
      if (!this.contentVisible) return;
      const i2 = t2.width, s2 = t2.height, n2 = this.ctx;
      this.save();
      if (!e) {
        const { filter: t3 } = n2;
        "none" !== t3 && "" !== t3 && (n2.filter = "none");
      }
      n2.scale(1 / i2, -1 / s2);
      let a2;
      if (t2.bitmap) a2 = this.applyTransferMapsToBitmap(t2);
      else if ("function" == typeof HTMLElement && t2 instanceof HTMLElement || !t2.data) a2 = t2;
      else {
        const e2 = this.cachedCanvases.getCanvas("inlineImage", i2, s2).context;
        putBinaryImageData(e2, t2);
        a2 = this.applyTransferMapsToCanvas(e2);
      }
      const r2 = this._scaleImage(a2, getCurrentTransformInverse(n2));
      n2.imageSmoothingEnabled = getImageSmoothingEnabled(getCurrentTransform(n2), t2.interpolate);
      drawImageAtIntegerCoords(n2, r2.img, 0, 0, r2.paintWidth, r2.paintHeight, 0, -s2, i2, s2);
      this.compose();
      this.restore();
    }
    paintInlineImageXObjectGroup(t2, e2) {
      if (!this.contentVisible) return;
      const i2 = this.ctx;
      let s2;
      if (t2.bitmap) s2 = t2.bitmap;
      else {
        const e3 = t2.width, i3 = t2.height, n2 = this.cachedCanvases.getCanvas("inlineImage", e3, i3).context;
        putBinaryImageData(n2, t2);
        s2 = this.applyTransferMapsToCanvas(n2);
      }
      for (const t3 of e2) {
        i2.save();
        i2.transform(...t3.transform);
        i2.scale(1, -1);
        drawImageAtIntegerCoords(i2, s2, t3.x, t3.y, t3.w, t3.h, 0, -1, 1, 1);
        i2.restore();
      }
      this.compose();
    }
    paintSolidColorImageMask() {
      if (this.contentVisible) {
        this.ctx.fillRect(0, 0, 1, 1);
        this.compose();
      }
    }
    markPoint(t2) {
    }
    markPointProps(t2, e2) {
    }
    beginMarkedContent(t2) {
      this.markedContentStack.push({ visible: true });
    }
    beginMarkedContentProps(t2, e2) {
      "OC" === t2 ? this.markedContentStack.push({ visible: this.optionalContentConfig.isVisible(e2) }) : this.markedContentStack.push({ visible: true });
      this.contentVisible = this.isContentVisible();
    }
    endMarkedContent() {
      this.markedContentStack.pop();
      this.contentVisible = this.isContentVisible();
    }
    beginCompat() {
    }
    endCompat() {
    }
    consumePath(t2) {
      const e2 = this.current.isEmptyClip();
      this.pendingClip && this.current.updateClipFromPath();
      this.pendingClip || this.compose(t2);
      const i2 = this.ctx;
      if (this.pendingClip) {
        e2 || (this.pendingClip === Ct ? i2.clip("evenodd") : i2.clip());
        this.pendingClip = null;
      }
      this.current.startNewPathAndClipBox(this.current.clipBox);
      i2.beginPath();
    }
    getSinglePixelWidth() {
      if (!this._cachedGetSinglePixelWidth) {
        const t2 = getCurrentTransform(this.ctx);
        if (0 === t2[1] && 0 === t2[2]) this._cachedGetSinglePixelWidth = 1 / Math.min(Math.abs(t2[0]), Math.abs(t2[3]));
        else {
          const e2 = Math.abs(t2[0] * t2[3] - t2[2] * t2[1]), i2 = Math.hypot(t2[0], t2[2]), s2 = Math.hypot(t2[1], t2[3]);
          this._cachedGetSinglePixelWidth = Math.max(i2, s2) / e2;
        }
      }
      return this._cachedGetSinglePixelWidth;
    }
    getScaleForStroking() {
      if (-1 === this._cachedScaleForStroking[0]) {
        const { lineWidth: t2 } = this.current, { a: e2, b: i2, c: s2, d: n2 } = this.ctx.getTransform();
        let a2, r2;
        if (0 === i2 && 0 === s2) {
          const i3 = Math.abs(e2), s3 = Math.abs(n2);
          if (i3 === s3) if (0 === t2) a2 = r2 = 1 / i3;
          else {
            const e3 = i3 * t2;
            a2 = r2 = e3 < 1 ? 1 / e3 : 1;
          }
          else if (0 === t2) {
            a2 = 1 / i3;
            r2 = 1 / s3;
          } else {
            const e3 = i3 * t2, n3 = s3 * t2;
            a2 = e3 < 1 ? 1 / e3 : 1;
            r2 = n3 < 1 ? 1 / n3 : 1;
          }
        } else {
          const o2 = Math.abs(e2 * n2 - i2 * s2), l2 = Math.hypot(e2, i2), h2 = Math.hypot(s2, n2);
          if (0 === t2) {
            a2 = h2 / o2;
            r2 = l2 / o2;
          } else {
            const e3 = t2 * o2;
            a2 = h2 > e3 ? h2 / e3 : 1;
            r2 = l2 > e3 ? l2 / e3 : 1;
          }
        }
        this._cachedScaleForStroking[0] = a2;
        this._cachedScaleForStroking[1] = r2;
      }
      return this._cachedScaleForStroking;
    }
    rescaleAndStroke(t2) {
      const { ctx: e2 } = this, { lineWidth: i2 } = this.current, [s2, n2] = this.getScaleForStroking();
      e2.lineWidth = i2 || 1;
      if (1 === s2 && 1 === n2) {
        e2.stroke();
        return;
      }
      const a2 = e2.getLineDash();
      t2 && e2.save();
      e2.scale(s2, n2);
      if (a2.length > 0) {
        const t3 = Math.max(s2, n2);
        e2.setLineDash(a2.map(((e3) => e3 / t3)));
        e2.lineDashOffset /= t3;
      }
      e2.stroke();
      t2 && e2.restore();
    }
    isContentVisible() {
      for (let t2 = this.markedContentStack.length - 1; t2 >= 0; t2--) if (!this.markedContentStack[t2].visible) return false;
      return true;
    }
  };
  for (const t2 in X) void 0 !== CanvasGraphics.prototype[t2] && (CanvasGraphics.prototype[X[t2]] = CanvasGraphics.prototype[t2]);
  var GlobalWorkerOptions = class {
    static #ui = null;
    static #pi = "";
    static get workerPort() {
      return this.#ui;
    }
    static set workerPort(t2) {
      if (!("undefined" != typeof Worker && t2 instanceof Worker) && null !== t2) throw new Error("Invalid `workerPort` type.");
      this.#ui = t2;
    }
    static get workerSrc() {
      return this.#pi;
    }
    static set workerSrc(t2) {
      if ("string" != typeof t2) throw new Error("Invalid `workerSrc` type.");
      this.#pi = t2;
    }
  };
  var Metadata = class {
    #gi;
    #mi;
    constructor({ parsedData: t2, rawData: e2 }) {
      this.#gi = t2;
      this.#mi = e2;
    }
    getRaw() {
      return this.#mi;
    }
    get(t2) {
      return this.#gi.get(t2) ?? null;
    }
    getAll() {
      return objectFromMap(this.#gi);
    }
    has(t2) {
      return this.#gi.has(t2);
    }
  };
  var Tt = Symbol("INTERNAL");
  var OptionalContentGroup = class {
    #fi = false;
    #bi = false;
    #Ai = false;
    #wi = true;
    constructor(t2, { name: e2, intent: i2, usage: s2, rbGroups: n2 }) {
      this.#fi = !!(t2 & r);
      this.#bi = !!(t2 & o);
      this.name = e2;
      this.intent = i2;
      this.usage = s2;
      this.rbGroups = n2;
    }
    get visible() {
      if (this.#Ai) return this.#wi;
      if (!this.#wi) return false;
      const { print: t2, view: e2 } = this.usage;
      return this.#fi ? "OFF" !== e2?.viewState : !this.#bi || "OFF" !== t2?.printState;
    }
    _setVisible(t2, e2, i2 = false) {
      t2 !== Tt && unreachable("Internal method `_setVisible` called.");
      this.#Ai = i2;
      this.#wi = e2;
    }
  };
  var OptionalContentConfig = class {
    #vi = null;
    #yi = /* @__PURE__ */ new Map();
    #xi = null;
    #_i = null;
    constructor(t2, e2 = r) {
      this.renderingIntent = e2;
      this.name = null;
      this.creator = null;
      if (null !== t2) {
        this.name = t2.name;
        this.creator = t2.creator;
        this.#_i = t2.order;
        for (const i2 of t2.groups) this.#yi.set(i2.id, new OptionalContentGroup(e2, i2));
        if ("OFF" === t2.baseState) for (const t3 of this.#yi.values()) t3._setVisible(Tt, false);
        for (const e3 of t2.on) this.#yi.get(e3)._setVisible(Tt, true);
        for (const e3 of t2.off) this.#yi.get(e3)._setVisible(Tt, false);
        this.#xi = this.getHash();
      }
    }
    #Ei(t2) {
      const e2 = t2.length;
      if (e2 < 2) return true;
      const i2 = t2[0];
      for (let s2 = 1; s2 < e2; s2++) {
        const e3 = t2[s2];
        let n2;
        if (Array.isArray(e3)) n2 = this.#Ei(e3);
        else {
          if (!this.#yi.has(e3)) {
            warn(`Optional content group not found: ${e3}`);
            return true;
          }
          n2 = this.#yi.get(e3).visible;
        }
        switch (i2) {
          case "And":
            if (!n2) return false;
            break;
          case "Or":
            if (n2) return true;
            break;
          case "Not":
            return !n2;
          default:
            return true;
        }
      }
      return "And" === i2;
    }
    isVisible(t2) {
      if (0 === this.#yi.size) return true;
      if (!t2) {
        info("Optional content group not defined.");
        return true;
      }
      if ("OCG" === t2.type) {
        if (!this.#yi.has(t2.id)) {
          warn(`Optional content group not found: ${t2.id}`);
          return true;
        }
        return this.#yi.get(t2.id).visible;
      }
      if ("OCMD" === t2.type) {
        if (t2.expression) return this.#Ei(t2.expression);
        if (!t2.policy || "AnyOn" === t2.policy) {
          for (const e2 of t2.ids) {
            if (!this.#yi.has(e2)) {
              warn(`Optional content group not found: ${e2}`);
              return true;
            }
            if (this.#yi.get(e2).visible) return true;
          }
          return false;
        }
        if ("AllOn" === t2.policy) {
          for (const e2 of t2.ids) {
            if (!this.#yi.has(e2)) {
              warn(`Optional content group not found: ${e2}`);
              return true;
            }
            if (!this.#yi.get(e2).visible) return false;
          }
          return true;
        }
        if ("AnyOff" === t2.policy) {
          for (const e2 of t2.ids) {
            if (!this.#yi.has(e2)) {
              warn(`Optional content group not found: ${e2}`);
              return true;
            }
            if (!this.#yi.get(e2).visible) return true;
          }
          return false;
        }
        if ("AllOff" === t2.policy) {
          for (const e2 of t2.ids) {
            if (!this.#yi.has(e2)) {
              warn(`Optional content group not found: ${e2}`);
              return true;
            }
            if (this.#yi.get(e2).visible) return false;
          }
          return true;
        }
        warn(`Unknown optional content policy ${t2.policy}.`);
        return true;
      }
      warn(`Unknown group type ${t2.type}.`);
      return true;
    }
    setVisibility(t2, e2 = true, i2 = true) {
      const s2 = this.#yi.get(t2);
      if (s2) {
        if (i2 && e2 && s2.rbGroups.length) for (const e3 of s2.rbGroups) for (const i3 of e3) i3 !== t2 && this.#yi.get(i3)?._setVisible(Tt, false, true);
        s2._setVisible(Tt, !!e2, true);
        this.#vi = null;
      } else warn(`Optional content group not found: ${t2}`);
    }
    setOCGState({ state: t2, preserveRB: e2 }) {
      let i2;
      for (const s2 of t2) {
        switch (s2) {
          case "ON":
          case "OFF":
          case "Toggle":
            i2 = s2;
            continue;
        }
        const t3 = this.#yi.get(s2);
        if (t3) switch (i2) {
          case "ON":
            this.setVisibility(s2, true, e2);
            break;
          case "OFF":
            this.setVisibility(s2, false, e2);
            break;
          case "Toggle":
            this.setVisibility(s2, !t3.visible, e2);
        }
      }
      this.#vi = null;
    }
    get hasInitialVisibility() {
      return null === this.#xi || this.getHash() === this.#xi;
    }
    getOrder() {
      return this.#yi.size ? this.#_i ? this.#_i.slice() : [...this.#yi.keys()] : null;
    }
    getGroups() {
      return this.#yi.size > 0 ? objectFromMap(this.#yi) : null;
    }
    getGroup(t2) {
      return this.#yi.get(t2) || null;
    }
    getHash() {
      if (null !== this.#vi) return this.#vi;
      const t2 = new MurmurHash3_64();
      for (const [e2, i2] of this.#yi) t2.update(`${e2}:${i2.visible}`);
      return this.#vi = t2.hexdigest();
    }
  };
  var PDFDataTransportStream = class {
    constructor(t2, { disableRange: e2 = false, disableStream: i2 = false }) {
      assert(t2, 'PDFDataTransportStream - missing required "pdfDataRangeTransport" argument.');
      const { length: s2, initialData: n2, progressiveDone: a2, contentDispositionFilename: r2 } = t2;
      this._queuedChunks = [];
      this._progressiveDone = a2;
      this._contentDispositionFilename = r2;
      if (n2?.length > 0) {
        const t3 = n2 instanceof Uint8Array && n2.byteLength === n2.buffer.byteLength ? n2.buffer : new Uint8Array(n2).buffer;
        this._queuedChunks.push(t3);
      }
      this._pdfDataRangeTransport = t2;
      this._isStreamingSupported = !i2;
      this._isRangeSupported = !e2;
      this._contentLength = s2;
      this._fullRequestReader = null;
      this._rangeReaders = [];
      t2.addRangeListener(((t3, e3) => {
        this._onReceiveData({ begin: t3, chunk: e3 });
      }));
      t2.addProgressListener(((t3, e3) => {
        this._onProgress({ loaded: t3, total: e3 });
      }));
      t2.addProgressiveReadListener(((t3) => {
        this._onReceiveData({ chunk: t3 });
      }));
      t2.addProgressiveDoneListener((() => {
        this._onProgressiveDone();
      }));
      t2.transportReady();
    }
    _onReceiveData({ begin: t2, chunk: e2 }) {
      const i2 = e2 instanceof Uint8Array && e2.byteLength === e2.buffer.byteLength ? e2.buffer : new Uint8Array(e2).buffer;
      if (void 0 === t2) this._fullRequestReader ? this._fullRequestReader._enqueue(i2) : this._queuedChunks.push(i2);
      else {
        assert(this._rangeReaders.some((function(e3) {
          if (e3._begin !== t2) return false;
          e3._enqueue(i2);
          return true;
        })), "_onReceiveData - no `PDFDataTransportStreamRangeReader` instance found.");
      }
    }
    get _progressiveDataLength() {
      return this._fullRequestReader?._loaded ?? 0;
    }
    _onProgress(t2) {
      void 0 === t2.total ? this._rangeReaders[0]?.onProgress?.({ loaded: t2.loaded }) : this._fullRequestReader?.onProgress?.({ loaded: t2.loaded, total: t2.total });
    }
    _onProgressiveDone() {
      this._fullRequestReader?.progressiveDone();
      this._progressiveDone = true;
    }
    _removeRangeReader(t2) {
      const e2 = this._rangeReaders.indexOf(t2);
      e2 >= 0 && this._rangeReaders.splice(e2, 1);
    }
    getFullReader() {
      assert(!this._fullRequestReader, "PDFDataTransportStream.getFullReader can only be called once.");
      const t2 = this._queuedChunks;
      this._queuedChunks = null;
      return new PDFDataTransportStreamReader(this, t2, this._progressiveDone, this._contentDispositionFilename);
    }
    getRangeReader(t2, e2) {
      if (e2 <= this._progressiveDataLength) return null;
      const i2 = new PDFDataTransportStreamRangeReader(this, t2, e2);
      this._pdfDataRangeTransport.requestDataRange(t2, e2);
      this._rangeReaders.push(i2);
      return i2;
    }
    cancelAllRequests(t2) {
      this._fullRequestReader?.cancel(t2);
      for (const e2 of this._rangeReaders.slice(0)) e2.cancel(t2);
      this._pdfDataRangeTransport.abort();
    }
  };
  var PDFDataTransportStreamReader = class {
    constructor(t2, e2, i2 = false, s2 = null) {
      this._stream = t2;
      this._done = i2 || false;
      this._filename = isPdfFile(s2) ? s2 : null;
      this._queuedChunks = e2 || [];
      this._loaded = 0;
      for (const t3 of this._queuedChunks) this._loaded += t3.byteLength;
      this._requests = [];
      this._headersReady = Promise.resolve();
      t2._fullRequestReader = this;
      this.onProgress = null;
    }
    _enqueue(t2) {
      if (!this._done) {
        if (this._requests.length > 0) {
          this._requests.shift().resolve({ value: t2, done: false });
        } else this._queuedChunks.push(t2);
        this._loaded += t2.byteLength;
      }
    }
    get headersReady() {
      return this._headersReady;
    }
    get filename() {
      return this._filename;
    }
    get isRangeSupported() {
      return this._stream._isRangeSupported;
    }
    get isStreamingSupported() {
      return this._stream._isStreamingSupported;
    }
    get contentLength() {
      return this._stream._contentLength;
    }
    async read() {
      if (this._queuedChunks.length > 0) {
        return { value: this._queuedChunks.shift(), done: false };
      }
      if (this._done) return { value: void 0, done: true };
      const t2 = Promise.withResolvers();
      this._requests.push(t2);
      return t2.promise;
    }
    cancel(t2) {
      this._done = true;
      for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
      this._requests.length = 0;
    }
    progressiveDone() {
      this._done || (this._done = true);
    }
  };
  var PDFDataTransportStreamRangeReader = class {
    constructor(t2, e2, i2) {
      this._stream = t2;
      this._begin = e2;
      this._end = i2;
      this._queuedChunk = null;
      this._requests = [];
      this._done = false;
      this.onProgress = null;
    }
    _enqueue(t2) {
      if (!this._done) {
        if (0 === this._requests.length) this._queuedChunk = t2;
        else {
          this._requests.shift().resolve({ value: t2, done: false });
          for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
          this._requests.length = 0;
        }
        this._done = true;
        this._stream._removeRangeReader(this);
      }
    }
    get isStreamingSupported() {
      return false;
    }
    async read() {
      if (this._queuedChunk) {
        const t3 = this._queuedChunk;
        this._queuedChunk = null;
        return { value: t3, done: false };
      }
      if (this._done) return { value: void 0, done: true };
      const t2 = Promise.withResolvers();
      this._requests.push(t2);
      return t2.promise;
    }
    cancel(t2) {
      this._done = true;
      for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
      this._requests.length = 0;
      this._stream._removeRangeReader(this);
    }
  };
  function createHeaders(t2, e2) {
    const i2 = new Headers();
    if (!t2 || !e2 || "object" != typeof e2) return i2;
    for (const t3 in e2) {
      const s2 = e2[t3];
      void 0 !== s2 && i2.append(t3, s2);
    }
    return i2;
  }
  function getResponseOrigin(t2) {
    try {
      return new URL(t2).origin;
    } catch {
    }
    return null;
  }
  function validateRangeRequestCapabilities({ responseHeaders: t2, isHttp: e2, rangeChunkSize: i2, disableRange: s2 }) {
    const n2 = { allowRangeRequests: false, suggestedLength: void 0 }, a2 = parseInt(t2.get("Content-Length"), 10);
    if (!Number.isInteger(a2)) return n2;
    n2.suggestedLength = a2;
    if (a2 <= 2 * i2) return n2;
    if (s2 || !e2) return n2;
    if ("bytes" !== t2.get("Accept-Ranges")) return n2;
    if ("identity" !== (t2.get("Content-Encoding") || "identity")) return n2;
    n2.allowRangeRequests = true;
    return n2;
  }
  function extractFilenameFromHeader(t2) {
    const e2 = t2.get("Content-Disposition");
    if (e2) {
      let t3 = (function getFilenameFromContentDispositionHeader(t4) {
        let e3 = true, i2 = toParamRegExp("filename\\*", "i").exec(t4);
        if (i2) {
          i2 = i2[1];
          let t5 = rfc2616unquote(i2);
          t5 = unescape(t5);
          t5 = rfc5987decode(t5);
          t5 = rfc2047decode(t5);
          return fixupEncoding(t5);
        }
        i2 = (function rfc2231getparam(t5) {
          const e4 = [];
          let i3;
          const s2 = toParamRegExp("filename\\*((?!0\\d)\\d+)(\\*?)", "ig");
          for (; null !== (i3 = s2.exec(t5)); ) {
            let [, t6, s3, n3] = i3;
            t6 = parseInt(t6, 10);
            if (t6 in e4) {
              if (0 === t6) break;
            } else e4[t6] = [s3, n3];
          }
          const n2 = [];
          for (let t6 = 0; t6 < e4.length && t6 in e4; ++t6) {
            let [i4, s3] = e4[t6];
            s3 = rfc2616unquote(s3);
            if (i4) {
              s3 = unescape(s3);
              0 === t6 && (s3 = rfc5987decode(s3));
            }
            n2.push(s3);
          }
          return n2.join("");
        })(t4);
        if (i2) return fixupEncoding(rfc2047decode(i2));
        i2 = toParamRegExp("filename", "i").exec(t4);
        if (i2) {
          i2 = i2[1];
          let t5 = rfc2616unquote(i2);
          t5 = rfc2047decode(t5);
          return fixupEncoding(t5);
        }
        function toParamRegExp(t5, e4) {
          return new RegExp("(?:^|;)\\s*" + t5 + '\\s*=\\s*([^";\\s][^;\\s]*|"(?:[^"\\\\]|\\\\"?)+"?)', e4);
        }
        function textdecode(t5, i3) {
          if (t5) {
            if (!/^[\x00-\xFF]+$/.test(i3)) return i3;
            try {
              const s2 = new TextDecoder(t5, { fatal: true }), n2 = stringToBytes(i3);
              i3 = s2.decode(n2);
              e3 = false;
            } catch {
            }
          }
          return i3;
        }
        function fixupEncoding(t5) {
          if (e3 && /[\x80-\xff]/.test(t5)) {
            t5 = textdecode("utf-8", t5);
            e3 && (t5 = textdecode("iso-8859-1", t5));
          }
          return t5;
        }
        function rfc2616unquote(t5) {
          if (t5.startsWith('"')) {
            const e4 = t5.slice(1).split('\\"');
            for (let t6 = 0; t6 < e4.length; ++t6) {
              const i3 = e4[t6].indexOf('"');
              if (-1 !== i3) {
                e4[t6] = e4[t6].slice(0, i3);
                e4.length = t6 + 1;
              }
              e4[t6] = e4[t6].replaceAll(/\\(.)/g, "$1");
            }
            t5 = e4.join('"');
          }
          return t5;
        }
        function rfc5987decode(t5) {
          const e4 = t5.indexOf("'");
          return -1 === e4 ? t5 : textdecode(t5.slice(0, e4), t5.slice(e4 + 1).replace(/^[^']*'/, ""));
        }
        function rfc2047decode(t5) {
          return !t5.startsWith("=?") || /[\x00-\x19\x80-\xff]/.test(t5) ? t5 : t5.replaceAll(/=\?([\w-]*)\?([QqBb])\?((?:[^?]|\?(?!=))*)\?=/g, (function(t6, e4, i3, s2) {
            if ("q" === i3 || "Q" === i3) return textdecode(e4, s2 = (s2 = s2.replaceAll("_", " ")).replaceAll(/=([0-9a-fA-F]{2})/g, (function(t7, e5) {
              return String.fromCharCode(parseInt(e5, 16));
            })));
            try {
              s2 = atob(s2);
            } catch {
            }
            return textdecode(e4, s2);
          }));
        }
        return "";
      })(e2);
      if (t3.includes("%")) try {
        t3 = decodeURIComponent(t3);
      } catch {
      }
      if (isPdfFile(t3)) return t3;
    }
    return null;
  }
  function createResponseStatusError(t2, e2) {
    return 404 === t2 || 0 === t2 && e2.startsWith("file:") ? new MissingPDFException('Missing PDF "' + e2 + '".') : new UnexpectedResponseException(`Unexpected server response (${t2}) while retrieving PDF "${e2}".`, t2);
  }
  function validateResponseStatus(t2) {
    return 200 === t2 || 206 === t2;
  }
  function createFetchOptions(t2, e2, i2) {
    return { method: "GET", headers: t2, signal: i2.signal, mode: "cors", credentials: e2 ? "include" : "same-origin", redirect: "follow" };
  }
  function getArrayBuffer(t2) {
    if (t2 instanceof Uint8Array) return t2.buffer;
    if (t2 instanceof ArrayBuffer) return t2;
    warn(`getArrayBuffer - unexpected data format: ${t2}`);
    return new Uint8Array(t2).buffer;
  }
  var PDFFetchStream = class {
    _responseOrigin = null;
    constructor(t2) {
      this.source = t2;
      this.isHttp = /^https?:/i.test(t2.url);
      this.headers = createHeaders(this.isHttp, t2.httpHeaders);
      this._fullRequestReader = null;
      this._rangeRequestReaders = [];
    }
    get _progressiveDataLength() {
      return this._fullRequestReader?._loaded ?? 0;
    }
    getFullReader() {
      assert(!this._fullRequestReader, "PDFFetchStream.getFullReader can only be called once.");
      this._fullRequestReader = new PDFFetchStreamReader(this);
      return this._fullRequestReader;
    }
    getRangeReader(t2, e2) {
      if (e2 <= this._progressiveDataLength) return null;
      const i2 = new PDFFetchStreamRangeReader(this, t2, e2);
      this._rangeRequestReaders.push(i2);
      return i2;
    }
    cancelAllRequests(t2) {
      this._fullRequestReader?.cancel(t2);
      for (const e2 of this._rangeRequestReaders.slice(0)) e2.cancel(t2);
    }
  };
  var PDFFetchStreamReader = class {
    constructor(t2) {
      this._stream = t2;
      this._reader = null;
      this._loaded = 0;
      this._filename = null;
      const e2 = t2.source;
      this._withCredentials = e2.withCredentials || false;
      this._contentLength = e2.length;
      this._headersCapability = Promise.withResolvers();
      this._disableRange = e2.disableRange || false;
      this._rangeChunkSize = e2.rangeChunkSize;
      this._rangeChunkSize || this._disableRange || (this._disableRange = true);
      this._abortController = new AbortController();
      this._isStreamingSupported = !e2.disableStream;
      this._isRangeSupported = !e2.disableRange;
      const i2 = new Headers(t2.headers), s2 = e2.url;
      fetch(s2, createFetchOptions(i2, this._withCredentials, this._abortController)).then(((e3) => {
        t2._responseOrigin = getResponseOrigin(e3.url);
        if (!validateResponseStatus(e3.status)) throw createResponseStatusError(e3.status, s2);
        this._reader = e3.body.getReader();
        this._headersCapability.resolve();
        const i3 = e3.headers, { allowRangeRequests: n2, suggestedLength: a2 } = validateRangeRequestCapabilities({ responseHeaders: i3, isHttp: t2.isHttp, rangeChunkSize: this._rangeChunkSize, disableRange: this._disableRange });
        this._isRangeSupported = n2;
        this._contentLength = a2 || this._contentLength;
        this._filename = extractFilenameFromHeader(i3);
        !this._isStreamingSupported && this._isRangeSupported && this.cancel(new AbortException("Streaming is disabled."));
      })).catch(this._headersCapability.reject);
      this.onProgress = null;
    }
    get headersReady() {
      return this._headersCapability.promise;
    }
    get filename() {
      return this._filename;
    }
    get contentLength() {
      return this._contentLength;
    }
    get isRangeSupported() {
      return this._isRangeSupported;
    }
    get isStreamingSupported() {
      return this._isStreamingSupported;
    }
    async read() {
      await this._headersCapability.promise;
      const { value: t2, done: e2 } = await this._reader.read();
      if (e2) return { value: t2, done: e2 };
      this._loaded += t2.byteLength;
      this.onProgress?.({ loaded: this._loaded, total: this._contentLength });
      return { value: getArrayBuffer(t2), done: false };
    }
    cancel(t2) {
      this._reader?.cancel(t2);
      this._abortController.abort();
    }
  };
  var PDFFetchStreamRangeReader = class {
    constructor(t2, e2, i2) {
      this._stream = t2;
      this._reader = null;
      this._loaded = 0;
      const s2 = t2.source;
      this._withCredentials = s2.withCredentials || false;
      this._readCapability = Promise.withResolvers();
      this._isStreamingSupported = !s2.disableStream;
      this._abortController = new AbortController();
      const n2 = new Headers(t2.headers);
      n2.append("Range", `bytes=${e2}-${i2 - 1}`);
      const a2 = s2.url;
      fetch(a2, createFetchOptions(n2, this._withCredentials, this._abortController)).then(((e3) => {
        const i3 = getResponseOrigin(e3.url);
        if (i3 !== t2._responseOrigin) throw new Error(`Expected range response-origin "${i3}" to match "${t2._responseOrigin}".`);
        if (!validateResponseStatus(e3.status)) throw createResponseStatusError(e3.status, a2);
        this._readCapability.resolve();
        this._reader = e3.body.getReader();
      })).catch(this._readCapability.reject);
      this.onProgress = null;
    }
    get isStreamingSupported() {
      return this._isStreamingSupported;
    }
    async read() {
      await this._readCapability.promise;
      const { value: t2, done: e2 } = await this._reader.read();
      if (e2) return { value: t2, done: e2 };
      this._loaded += t2.byteLength;
      this.onProgress?.({ loaded: this._loaded });
      return { value: getArrayBuffer(t2), done: false };
    }
    cancel(t2) {
      this._reader?.cancel(t2);
      this._abortController.abort();
    }
  };
  var NetworkManager = class {
    _responseOrigin = null;
    constructor({ url: t2, httpHeaders: e2, withCredentials: i2 }) {
      this.url = t2;
      this.isHttp = /^https?:/i.test(t2);
      this.headers = createHeaders(this.isHttp, e2);
      this.withCredentials = i2 || false;
      this.currXhrId = 0;
      this.pendingRequests = /* @__PURE__ */ Object.create(null);
    }
    request(t2) {
      const e2 = new XMLHttpRequest(), i2 = this.currXhrId++, s2 = this.pendingRequests[i2] = { xhr: e2 };
      e2.open("GET", this.url);
      e2.withCredentials = this.withCredentials;
      for (const [t3, i3] of this.headers) e2.setRequestHeader(t3, i3);
      if (this.isHttp && "begin" in t2 && "end" in t2) {
        e2.setRequestHeader("Range", `bytes=${t2.begin}-${t2.end - 1}`);
        s2.expectedStatus = 206;
      } else s2.expectedStatus = 200;
      e2.responseType = "arraybuffer";
      assert(t2.onError, "Expected `onError` callback to be provided.");
      e2.onerror = () => {
        t2.onError(e2.status);
      };
      e2.onreadystatechange = this.onStateChange.bind(this, i2);
      e2.onprogress = this.onProgress.bind(this, i2);
      s2.onHeadersReceived = t2.onHeadersReceived;
      s2.onDone = t2.onDone;
      s2.onError = t2.onError;
      s2.onProgress = t2.onProgress;
      e2.send(null);
      return i2;
    }
    onProgress(t2, e2) {
      const i2 = this.pendingRequests[t2];
      i2 && i2.onProgress?.(e2);
    }
    onStateChange(t2, e2) {
      const i2 = this.pendingRequests[t2];
      if (!i2) return;
      const s2 = i2.xhr;
      if (s2.readyState >= 2 && i2.onHeadersReceived) {
        i2.onHeadersReceived();
        delete i2.onHeadersReceived;
      }
      if (4 !== s2.readyState) return;
      if (!(t2 in this.pendingRequests)) return;
      delete this.pendingRequests[t2];
      if (0 === s2.status && this.isHttp) {
        i2.onError(s2.status);
        return;
      }
      const n2 = s2.status || 200;
      if (!(200 === n2 && 206 === i2.expectedStatus) && n2 !== i2.expectedStatus) {
        i2.onError(s2.status);
        return;
      }
      const a2 = (function network_getArrayBuffer(t3) {
        const e3 = t3.response;
        return "string" != typeof e3 ? e3 : stringToBytes(e3).buffer;
      })(s2);
      if (206 === n2) {
        const t3 = s2.getResponseHeader("Content-Range"), e3 = /bytes (\d+)-(\d+)\/(\d+)/.exec(t3);
        if (e3) i2.onDone({ begin: parseInt(e3[1], 10), chunk: a2 });
        else {
          warn('Missing or invalid "Content-Range" header.');
          i2.onError(0);
        }
      } else a2 ? i2.onDone({ begin: 0, chunk: a2 }) : i2.onError(s2.status);
    }
    getRequestXhr(t2) {
      return this.pendingRequests[t2].xhr;
    }
    isPendingRequest(t2) {
      return t2 in this.pendingRequests;
    }
    abortRequest(t2) {
      const e2 = this.pendingRequests[t2].xhr;
      delete this.pendingRequests[t2];
      e2.abort();
    }
  };
  var PDFNetworkStream = class {
    constructor(t2) {
      this._source = t2;
      this._manager = new NetworkManager(t2);
      this._rangeChunkSize = t2.rangeChunkSize;
      this._fullRequestReader = null;
      this._rangeRequestReaders = [];
    }
    _onRangeRequestReaderClosed(t2) {
      const e2 = this._rangeRequestReaders.indexOf(t2);
      e2 >= 0 && this._rangeRequestReaders.splice(e2, 1);
    }
    getFullReader() {
      assert(!this._fullRequestReader, "PDFNetworkStream.getFullReader can only be called once.");
      this._fullRequestReader = new PDFNetworkStreamFullRequestReader(this._manager, this._source);
      return this._fullRequestReader;
    }
    getRangeReader(t2, e2) {
      const i2 = new PDFNetworkStreamRangeRequestReader(this._manager, t2, e2);
      i2.onClosed = this._onRangeRequestReaderClosed.bind(this);
      this._rangeRequestReaders.push(i2);
      return i2;
    }
    cancelAllRequests(t2) {
      this._fullRequestReader?.cancel(t2);
      for (const e2 of this._rangeRequestReaders.slice(0)) e2.cancel(t2);
    }
  };
  var PDFNetworkStreamFullRequestReader = class {
    constructor(t2, e2) {
      this._manager = t2;
      this._url = e2.url;
      this._fullRequestId = t2.request({ onHeadersReceived: this._onHeadersReceived.bind(this), onDone: this._onDone.bind(this), onError: this._onError.bind(this), onProgress: this._onProgress.bind(this) });
      this._headersCapability = Promise.withResolvers();
      this._disableRange = e2.disableRange || false;
      this._contentLength = e2.length;
      this._rangeChunkSize = e2.rangeChunkSize;
      this._rangeChunkSize || this._disableRange || (this._disableRange = true);
      this._isStreamingSupported = false;
      this._isRangeSupported = false;
      this._cachedChunks = [];
      this._requests = [];
      this._done = false;
      this._storedError = void 0;
      this._filename = null;
      this.onProgress = null;
    }
    _onHeadersReceived() {
      const t2 = this._fullRequestId, e2 = this._manager.getRequestXhr(t2);
      this._manager._responseOrigin = getResponseOrigin(e2.responseURL);
      const i2 = e2.getAllResponseHeaders(), s2 = new Headers(i2 ? i2.trimStart().replace(/[^\S ]+$/, "").split(/[\r\n]+/).map(((t3) => {
        const [e3, ...i3] = t3.split(": ");
        return [e3, i3.join(": ")];
      })) : []), { allowRangeRequests: n2, suggestedLength: a2 } = validateRangeRequestCapabilities({ responseHeaders: s2, isHttp: this._manager.isHttp, rangeChunkSize: this._rangeChunkSize, disableRange: this._disableRange });
      n2 && (this._isRangeSupported = true);
      this._contentLength = a2 || this._contentLength;
      this._filename = extractFilenameFromHeader(s2);
      this._isRangeSupported && this._manager.abortRequest(t2);
      this._headersCapability.resolve();
    }
    _onDone(t2) {
      if (t2) if (this._requests.length > 0) {
        this._requests.shift().resolve({ value: t2.chunk, done: false });
      } else this._cachedChunks.push(t2.chunk);
      this._done = true;
      if (!(this._cachedChunks.length > 0)) {
        for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
        this._requests.length = 0;
      }
    }
    _onError(t2) {
      this._storedError = createResponseStatusError(t2, this._url);
      this._headersCapability.reject(this._storedError);
      for (const t3 of this._requests) t3.reject(this._storedError);
      this._requests.length = 0;
      this._cachedChunks.length = 0;
    }
    _onProgress(t2) {
      this.onProgress?.({ loaded: t2.loaded, total: t2.lengthComputable ? t2.total : this._contentLength });
    }
    get filename() {
      return this._filename;
    }
    get isRangeSupported() {
      return this._isRangeSupported;
    }
    get isStreamingSupported() {
      return this._isStreamingSupported;
    }
    get contentLength() {
      return this._contentLength;
    }
    get headersReady() {
      return this._headersCapability.promise;
    }
    async read() {
      await this._headersCapability.promise;
      if (this._storedError) throw this._storedError;
      if (this._cachedChunks.length > 0) {
        return { value: this._cachedChunks.shift(), done: false };
      }
      if (this._done) return { value: void 0, done: true };
      const t2 = Promise.withResolvers();
      this._requests.push(t2);
      return t2.promise;
    }
    cancel(t2) {
      this._done = true;
      this._headersCapability.reject(t2);
      for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
      this._requests.length = 0;
      this._manager.isPendingRequest(this._fullRequestId) && this._manager.abortRequest(this._fullRequestId);
      this._fullRequestReader = null;
    }
  };
  var PDFNetworkStreamRangeRequestReader = class {
    constructor(t2, e2, i2) {
      this._manager = t2;
      this._url = t2.url;
      this._requestId = t2.request({ begin: e2, end: i2, onHeadersReceived: this._onHeadersReceived.bind(this), onDone: this._onDone.bind(this), onError: this._onError.bind(this), onProgress: this._onProgress.bind(this) });
      this._requests = [];
      this._queuedChunk = null;
      this._done = false;
      this._storedError = void 0;
      this.onProgress = null;
      this.onClosed = null;
    }
    _onHeadersReceived() {
      const t2 = getResponseOrigin(this._manager.getRequestXhr(this._requestId)?.responseURL);
      if (t2 !== this._manager._responseOrigin) {
        this._storedError = new Error(`Expected range response-origin "${t2}" to match "${this._manager._responseOrigin}".`);
        this._onError(0);
      }
    }
    _close() {
      this.onClosed?.(this);
    }
    _onDone(t2) {
      const e2 = t2.chunk;
      if (this._requests.length > 0) {
        this._requests.shift().resolve({ value: e2, done: false });
      } else this._queuedChunk = e2;
      this._done = true;
      for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
      this._requests.length = 0;
      this._close();
    }
    _onError(t2) {
      this._storedError ??= createResponseStatusError(t2, this._url);
      for (const t3 of this._requests) t3.reject(this._storedError);
      this._requests.length = 0;
      this._queuedChunk = null;
    }
    _onProgress(t2) {
      this.isStreamingSupported || this.onProgress?.({ loaded: t2.loaded });
    }
    get isStreamingSupported() {
      return false;
    }
    async read() {
      if (this._storedError) throw this._storedError;
      if (null !== this._queuedChunk) {
        const t3 = this._queuedChunk;
        this._queuedChunk = null;
        return { value: t3, done: false };
      }
      if (this._done) return { value: void 0, done: true };
      const t2 = Promise.withResolvers();
      this._requests.push(t2);
      return t2.promise;
    }
    cancel(t2) {
      this._done = true;
      for (const t3 of this._requests) t3.resolve({ value: void 0, done: true });
      this._requests.length = 0;
      this._manager.isPendingRequest(this._requestId) && this._manager.abortRequest(this._requestId);
      this._close();
    }
  };
  var Mt = /^[a-z][a-z0-9\-+.]+:/i;
  var PDFNodeStream = class {
    constructor(t2) {
      this.source = t2;
      this.url = (function parseUrlOrPath(t3) {
        if (Mt.test(t3)) return new URL(t3);
        const e2 = process.getBuiltinModule("url");
        return new URL(e2.pathToFileURL(t3));
      })(t2.url);
      assert("file:" === this.url.protocol, "PDFNodeStream only supports file:// URLs.");
      this._fullRequestReader = null;
      this._rangeRequestReaders = [];
    }
    get _progressiveDataLength() {
      return this._fullRequestReader?._loaded ?? 0;
    }
    getFullReader() {
      assert(!this._fullRequestReader, "PDFNodeStream.getFullReader can only be called once.");
      this._fullRequestReader = new PDFNodeStreamFsFullReader(this);
      return this._fullRequestReader;
    }
    getRangeReader(t2, e2) {
      if (e2 <= this._progressiveDataLength) return null;
      const i2 = new PDFNodeStreamFsRangeReader(this, t2, e2);
      this._rangeRequestReaders.push(i2);
      return i2;
    }
    cancelAllRequests(t2) {
      this._fullRequestReader?.cancel(t2);
      for (const e2 of this._rangeRequestReaders.slice(0)) e2.cancel(t2);
    }
  };
  var PDFNodeStreamFsFullReader = class {
    constructor(t2) {
      this._url = t2.url;
      this._done = false;
      this._storedError = null;
      this.onProgress = null;
      const e2 = t2.source;
      this._contentLength = e2.length;
      this._loaded = 0;
      this._filename = null;
      this._disableRange = e2.disableRange || false;
      this._rangeChunkSize = e2.rangeChunkSize;
      this._rangeChunkSize || this._disableRange || (this._disableRange = true);
      this._isStreamingSupported = !e2.disableStream;
      this._isRangeSupported = !e2.disableRange;
      this._readableStream = null;
      this._readCapability = Promise.withResolvers();
      this._headersCapability = Promise.withResolvers();
      const i2 = process.getBuiltinModule("fs");
      i2.promises.lstat(this._url).then(((t3) => {
        this._contentLength = t3.size;
        this._setReadableStream(i2.createReadStream(this._url));
        this._headersCapability.resolve();
      }), ((t3) => {
        "ENOENT" === t3.code && (t3 = new MissingPDFException(`Missing PDF "${this._url}".`));
        this._storedError = t3;
        this._headersCapability.reject(t3);
      }));
    }
    get headersReady() {
      return this._headersCapability.promise;
    }
    get filename() {
      return this._filename;
    }
    get contentLength() {
      return this._contentLength;
    }
    get isRangeSupported() {
      return this._isRangeSupported;
    }
    get isStreamingSupported() {
      return this._isStreamingSupported;
    }
    async read() {
      await this._readCapability.promise;
      if (this._done) return { value: void 0, done: true };
      if (this._storedError) throw this._storedError;
      const t2 = this._readableStream.read();
      if (null === t2) {
        this._readCapability = Promise.withResolvers();
        return this.read();
      }
      this._loaded += t2.length;
      this.onProgress?.({ loaded: this._loaded, total: this._contentLength });
      return { value: new Uint8Array(t2).buffer, done: false };
    }
    cancel(t2) {
      this._readableStream ? this._readableStream.destroy(t2) : this._error(t2);
    }
    _error(t2) {
      this._storedError = t2;
      this._readCapability.resolve();
    }
    _setReadableStream(t2) {
      this._readableStream = t2;
      t2.on("readable", (() => {
        this._readCapability.resolve();
      }));
      t2.on("end", (() => {
        t2.destroy();
        this._done = true;
        this._readCapability.resolve();
      }));
      t2.on("error", ((t3) => {
        this._error(t3);
      }));
      !this._isStreamingSupported && this._isRangeSupported && this._error(new AbortException("streaming is disabled"));
      this._storedError && this._readableStream.destroy(this._storedError);
    }
  };
  var PDFNodeStreamFsRangeReader = class {
    constructor(t2, e2, i2) {
      this._url = t2.url;
      this._done = false;
      this._storedError = null;
      this.onProgress = null;
      this._loaded = 0;
      this._readableStream = null;
      this._readCapability = Promise.withResolvers();
      const s2 = t2.source;
      this._isStreamingSupported = !s2.disableStream;
      const n2 = process.getBuiltinModule("fs");
      this._setReadableStream(n2.createReadStream(this._url, { start: e2, end: i2 - 1 }));
    }
    get isStreamingSupported() {
      return this._isStreamingSupported;
    }
    async read() {
      await this._readCapability.promise;
      if (this._done) return { value: void 0, done: true };
      if (this._storedError) throw this._storedError;
      const t2 = this._readableStream.read();
      if (null === t2) {
        this._readCapability = Promise.withResolvers();
        return this.read();
      }
      this._loaded += t2.length;
      this.onProgress?.({ loaded: this._loaded });
      return { value: new Uint8Array(t2).buffer, done: false };
    }
    cancel(t2) {
      this._readableStream ? this._readableStream.destroy(t2) : this._error(t2);
    }
    _error(t2) {
      this._storedError = t2;
      this._readCapability.resolve();
    }
    _setReadableStream(t2) {
      this._readableStream = t2;
      t2.on("readable", (() => {
        this._readCapability.resolve();
      }));
      t2.on("end", (() => {
        t2.destroy();
        this._done = true;
        this._readCapability.resolve();
      }));
      t2.on("error", ((t3) => {
        this._error(t3);
      }));
      this._storedError && this._readableStream.destroy(this._storedError);
    }
  };
  var Pt = 30;
  var TextLayer = class _TextLayer {
    #Si = Promise.withResolvers();
    #pt = null;
    #Ci = false;
    #Ti = !!globalThis.FontInspector?.enabled;
    #Mi = null;
    #Pi = null;
    #Di = 0;
    #ki = 0;
    #Ri = null;
    #Ii = null;
    #Fi = 0;
    #Li = 0;
    #Oi = /* @__PURE__ */ Object.create(null);
    #Ni = [];
    #Bi = null;
    #Hi = [];
    #zi = /* @__PURE__ */ new WeakMap();
    #Ui = null;
    static #Gi = /* @__PURE__ */ new Map();
    static #$i = /* @__PURE__ */ new Map();
    static #Vi = /* @__PURE__ */ new WeakMap();
    static #ji = null;
    static #Wi = /* @__PURE__ */ new Set();
    constructor({ textContentSource: t2, container: e2, viewport: i2 }) {
      if (t2 instanceof ReadableStream) this.#Bi = t2;
      else {
        if ("object" != typeof t2) throw new Error('No "textContentSource" parameter specified.');
        this.#Bi = new ReadableStream({ start(e3) {
          e3.enqueue(t2);
          e3.close();
        } });
      }
      this.#pt = this.#Ii = e2;
      this.#Li = i2.scale * (globalThis.devicePixelRatio || 1);
      this.#Fi = i2.rotation;
      this.#Pi = { div: null, properties: null, ctx: null };
      const { pageWidth: s2, pageHeight: n2, pageX: a2, pageY: r2 } = i2.rawDims;
      this.#Ui = [1, 0, 0, -1, -a2, r2 + n2];
      this.#ki = s2;
      this.#Di = n2;
      _TextLayer.#qi();
      setLayerDimensions(e2, i2);
      this.#Si.promise.finally((() => {
        _TextLayer.#Wi.delete(this);
        this.#Pi = null;
        this.#Oi = null;
      })).catch((() => {
      }));
    }
    static get fontFamilyMap() {
      const { isWindows: t2, isFirefox: e2 } = util_FeatureTest.platform;
      return shadow(this, "fontFamilyMap", /* @__PURE__ */ new Map([["sans-serif", (t2 && e2 ? "Calibri, " : "") + "sans-serif"], ["monospace", (t2 && e2 ? "Lucida Console, " : "") + "monospace"]]));
    }
    render() {
      const pump = () => {
        this.#Ri.read().then((({ value: t2, done: e2 }) => {
          if (e2) this.#Si.resolve();
          else {
            this.#Mi ??= t2.lang;
            Object.assign(this.#Oi, t2.styles);
            this.#Xi(t2.items);
            pump();
          }
        }), this.#Si.reject);
      };
      this.#Ri = this.#Bi.getReader();
      _TextLayer.#Wi.add(this);
      pump();
      return this.#Si.promise;
    }
    update({ viewport: t2, onBefore: e2 = null }) {
      const i2 = t2.scale * (globalThis.devicePixelRatio || 1), s2 = t2.rotation;
      if (s2 !== this.#Fi) {
        e2?.();
        this.#Fi = s2;
        setLayerDimensions(this.#Ii, { rotation: s2 });
      }
      if (i2 !== this.#Li) {
        e2?.();
        this.#Li = i2;
        const t3 = { div: null, properties: null, ctx: _TextLayer.#Ki(this.#Mi) };
        for (const e3 of this.#Hi) {
          t3.properties = this.#zi.get(e3);
          t3.div = e3;
          this.#Yi(t3);
        }
      }
    }
    cancel() {
      const t2 = new AbortException("TextLayer task cancelled.");
      this.#Ri?.cancel(t2).catch((() => {
      }));
      this.#Ri = null;
      this.#Si.reject(t2);
    }
    get textDivs() {
      return this.#Hi;
    }
    get textContentItemsStr() {
      return this.#Ni;
    }
    #Xi(t2) {
      if (this.#Ci) return;
      this.#Pi.ctx ??= _TextLayer.#Ki(this.#Mi);
      const e2 = this.#Hi, i2 = this.#Ni;
      for (const s2 of t2) {
        if (e2.length > 1e5) {
          warn("Ignoring additional textDivs for performance reasons.");
          this.#Ci = true;
          return;
        }
        if (void 0 !== s2.str) {
          i2.push(s2.str);
          this.#Qi(s2);
        } else if ("beginMarkedContentProps" === s2.type || "beginMarkedContent" === s2.type) {
          const t3 = this.#pt;
          this.#pt = document.createElement("span");
          this.#pt.classList.add("markedContent");
          null !== s2.id && this.#pt.setAttribute("id", `${s2.id}`);
          t3.append(this.#pt);
        } else "endMarkedContent" === s2.type && (this.#pt = this.#pt.parentNode);
      }
    }
    #Qi(t2) {
      const e2 = document.createElement("span"), i2 = { angle: 0, canvasWidth: 0, hasText: "" !== t2.str, hasEOL: t2.hasEOL, fontSize: 0 };
      this.#Hi.push(e2);
      const s2 = Util.transform(this.#Ui, t2.transform);
      let n2 = Math.atan2(s2[1], s2[0]);
      const a2 = this.#Oi[t2.fontName];
      a2.vertical && (n2 += Math.PI / 2);
      let r2 = this.#Ti && a2.fontSubstitution || a2.fontFamily;
      r2 = _TextLayer.fontFamilyMap.get(r2) || r2;
      const o2 = Math.hypot(s2[2], s2[3]), l2 = o2 * _TextLayer.#Ji(r2, this.#Mi);
      let h2, d2;
      if (0 === n2) {
        h2 = s2[4];
        d2 = s2[5] - l2;
      } else {
        h2 = s2[4] + l2 * Math.sin(n2);
        d2 = s2[5] - l2 * Math.cos(n2);
      }
      const c2 = "calc(var(--scale-factor)*", u2 = e2.style;
      if (this.#pt === this.#Ii) {
        u2.left = `${(100 * h2 / this.#ki).toFixed(2)}%`;
        u2.top = `${(100 * d2 / this.#Di).toFixed(2)}%`;
      } else {
        u2.left = `${c2}${h2.toFixed(2)}px)`;
        u2.top = `${c2}${d2.toFixed(2)}px)`;
      }
      u2.fontSize = `${c2}${(_TextLayer.#ji * o2).toFixed(2)}px)`;
      u2.fontFamily = r2;
      i2.fontSize = o2;
      e2.setAttribute("role", "presentation");
      e2.textContent = t2.str;
      e2.dir = t2.dir;
      this.#Ti && (e2.dataset.fontName = a2.fontSubstitutionLoadedName || t2.fontName);
      0 !== n2 && (i2.angle = n2 * (180 / Math.PI));
      let p2 = false;
      if (t2.str.length > 1) p2 = true;
      else if (" " !== t2.str && t2.transform[0] !== t2.transform[3]) {
        const e3 = Math.abs(t2.transform[0]), i3 = Math.abs(t2.transform[3]);
        e3 !== i3 && Math.max(e3, i3) / Math.min(e3, i3) > 1.5 && (p2 = true);
      }
      p2 && (i2.canvasWidth = a2.vertical ? t2.height : t2.width);
      this.#zi.set(e2, i2);
      this.#Pi.div = e2;
      this.#Pi.properties = i2;
      this.#Yi(this.#Pi);
      i2.hasText && this.#pt.append(e2);
      if (i2.hasEOL) {
        const t3 = document.createElement("br");
        t3.setAttribute("role", "presentation");
        this.#pt.append(t3);
      }
    }
    #Yi(t2) {
      const { div: e2, properties: i2, ctx: s2 } = t2, { style: n2 } = e2;
      let a2 = "";
      _TextLayer.#ji > 1 && (a2 = `scale(${1 / _TextLayer.#ji})`);
      if (0 !== i2.canvasWidth && i2.hasText) {
        const { fontFamily: t3 } = n2, { canvasWidth: r2, fontSize: o2 } = i2;
        _TextLayer.#Zi(s2, o2 * this.#Li, t3);
        const { width: l2 } = s2.measureText(e2.textContent);
        l2 > 0 && (a2 = `scaleX(${r2 * this.#Li / l2}) ${a2}`);
      }
      0 !== i2.angle && (a2 = `rotate(${i2.angle}deg) ${a2}`);
      a2.length > 0 && (n2.transform = a2);
    }
    static cleanup() {
      if (!(this.#Wi.size > 0)) {
        this.#Gi.clear();
        for (const { canvas: t2 } of this.#$i.values()) t2.remove();
        this.#$i.clear();
      }
    }
    static #Ki(t2 = null) {
      let e2 = this.#$i.get(t2 ||= "");
      if (!e2) {
        const i2 = document.createElement("canvas");
        i2.className = "hiddenCanvasElement";
        i2.lang = t2;
        document.body.append(i2);
        e2 = i2.getContext("2d", { alpha: false, willReadFrequently: true });
        this.#$i.set(t2, e2);
        this.#Vi.set(e2, { size: 0, family: "" });
      }
      return e2;
    }
    static #Zi(t2, e2, i2) {
      const s2 = this.#Vi.get(t2);
      if (e2 !== s2.size || i2 !== s2.family) {
        t2.font = `${e2}px ${i2}`;
        s2.size = e2;
        s2.family = i2;
      }
    }
    static #qi() {
      if (null !== this.#ji) return;
      const t2 = document.createElement("div");
      t2.style.opacity = 0;
      t2.style.lineHeight = 1;
      t2.style.fontSize = "1px";
      t2.style.position = "absolute";
      t2.textContent = "X";
      document.body.append(t2);
      this.#ji = t2.getBoundingClientRect().height;
      t2.remove();
    }
    static #Ji(t2, e2) {
      const i2 = this.#Gi.get(t2);
      if (i2) return i2;
      const s2 = this.#Ki(e2);
      s2.canvas.width = s2.canvas.height = Pt;
      this.#Zi(s2, Pt, t2);
      const n2 = s2.measureText("");
      let a2 = n2.fontBoundingBoxAscent, r2 = Math.abs(n2.fontBoundingBoxDescent);
      if (a2) {
        const e3 = a2 / (a2 + r2);
        this.#Gi.set(t2, e3);
        s2.canvas.width = s2.canvas.height = 0;
        return e3;
      }
      s2.strokeStyle = "red";
      s2.clearRect(0, 0, Pt, Pt);
      s2.strokeText("g", 0, 0);
      let o2 = s2.getImageData(0, 0, Pt, Pt).data;
      r2 = 0;
      for (let t3 = o2.length - 1 - 3; t3 >= 0; t3 -= 4) if (o2[t3] > 0) {
        r2 = Math.ceil(t3 / 4 / Pt);
        break;
      }
      s2.clearRect(0, 0, Pt, Pt);
      s2.strokeText("A", 0, Pt);
      o2 = s2.getImageData(0, 0, Pt, Pt).data;
      a2 = 0;
      for (let t3 = 0, e3 = o2.length; t3 < e3; t3 += 4) if (o2[t3] > 0) {
        a2 = Pt - Math.floor(t3 / 4 / Pt);
        break;
      }
      s2.canvas.width = s2.canvas.height = 0;
      const l2 = a2 ? a2 / (a2 + r2) : 0.8;
      this.#Gi.set(t2, l2);
      return l2;
    }
  };
  var XfaText = class _XfaText {
    static textContent(t2) {
      const e2 = [], i2 = { items: e2, styles: /* @__PURE__ */ Object.create(null) };
      !(function walk(t3) {
        if (!t3) return;
        let i3 = null;
        const s2 = t3.name;
        if ("#text" === s2) i3 = t3.value;
        else {
          if (!_XfaText.shouldBuildText(s2)) return;
          t3?.attributes?.textContent ? i3 = t3.attributes.textContent : t3.value && (i3 = t3.value);
        }
        null !== i3 && e2.push({ str: i3 });
        if (t3.children) for (const e3 of t3.children) walk(e3);
      })(t2);
      return i2;
    }
    static shouldBuildText(t2) {
      return !("textarea" === t2 || "input" === t2 || "option" === t2 || "select" === t2);
    }
  };
  var Dt = 65536;
  var kt = e ? class NodeCanvasFactory extends BaseCanvasFactory {
    _createCanvas(t2, e2) {
      return process.getBuiltinModule("module").createRequire(import_meta.url)("@napi-rs/canvas").createCanvas(t2, e2);
    }
  } : class DOMCanvasFactory extends BaseCanvasFactory {
    constructor({ ownerDocument: t2 = globalThis.document, enableHWA: e2 = false }) {
      super({ enableHWA: e2 });
      this._document = t2;
    }
    _createCanvas(t2, e2) {
      const i2 = this._document.createElement("canvas");
      i2.width = t2;
      i2.height = e2;
      return i2;
    }
  };
  var Rt = e ? class NodeCMapReaderFactory extends BaseCMapReaderFactory {
    async _fetch(t2) {
      return node_utils_fetchData(t2);
    }
  } : DOMCMapReaderFactory;
  var It = e ? class NodeFilterFactory extends BaseFilterFactory {
  } : class DOMFilterFactory extends BaseFilterFactory {
    #ts;
    #es;
    #is;
    #ss;
    #ns;
    #as;
    #w = 0;
    constructor({ docId: t2, ownerDocument: e2 = globalThis.document }) {
      super();
      this.#ss = t2;
      this.#ns = e2;
    }
    get #y() {
      return this.#es ||= /* @__PURE__ */ new Map();
    }
    get #rs() {
      return this.#as ||= /* @__PURE__ */ new Map();
    }
    get #os() {
      if (!this.#is) {
        const t2 = this.#ns.createElement("div"), { style: e2 } = t2;
        e2.visibility = "hidden";
        e2.contain = "strict";
        e2.width = e2.height = 0;
        e2.position = "absolute";
        e2.top = e2.left = 0;
        e2.zIndex = -1;
        const i2 = this.#ns.createElementNS(it, "svg");
        i2.setAttribute("width", 0);
        i2.setAttribute("height", 0);
        this.#is = this.#ns.createElementNS(it, "defs");
        t2.append(i2);
        i2.append(this.#is);
        this.#ns.body.append(t2);
      }
      return this.#is;
    }
    #ls(t2) {
      if (1 === t2.length) {
        const e3 = t2[0], i3 = new Array(256);
        for (let t3 = 0; t3 < 256; t3++) i3[t3] = e3[t3] / 255;
        const s3 = i3.join(",");
        return [s3, s3, s3];
      }
      const [e2, i2, s2] = t2, n2 = new Array(256), a2 = new Array(256), r2 = new Array(256);
      for (let t3 = 0; t3 < 256; t3++) {
        n2[t3] = e2[t3] / 255;
        a2[t3] = i2[t3] / 255;
        r2[t3] = s2[t3] / 255;
      }
      return [n2.join(","), a2.join(","), r2.join(",")];
    }
    #hs(t2) {
      if (void 0 === this.#ts) {
        this.#ts = "";
        const t3 = this.#ns.URL;
        t3 !== this.#ns.baseURI && (isDataScheme(t3) ? warn('#createUrl: ignore "data:"-URL for performance reasons.') : this.#ts = t3.split("#", 1)[0]);
      }
      return `url(${this.#ts}#${t2})`;
    }
    addFilter(t2) {
      if (!t2) return "none";
      let e2 = this.#y.get(t2);
      if (e2) return e2;
      const [i2, s2, n2] = this.#ls(t2), a2 = 1 === t2.length ? i2 : `${i2}${s2}${n2}`;
      e2 = this.#y.get(a2);
      if (e2) {
        this.#y.set(t2, e2);
        return e2;
      }
      const r2 = `g_${this.#ss}_transfer_map_${this.#w++}`, o2 = this.#hs(r2);
      this.#y.set(t2, o2);
      this.#y.set(a2, o2);
      const l2 = this.#ds(r2);
      this.#cs(i2, s2, n2, l2);
      return o2;
    }
    addHCMFilter(t2, e2) {
      const i2 = `${t2}-${e2}`, s2 = "base";
      let n2 = this.#rs.get(s2);
      if (n2?.key === i2) return n2.url;
      if (n2) {
        n2.filter?.remove();
        n2.key = i2;
        n2.url = "none";
        n2.filter = null;
      } else {
        n2 = { key: i2, url: "none", filter: null };
        this.#rs.set(s2, n2);
      }
      if (!t2 || !e2) return n2.url;
      const a2 = this.#us(t2);
      t2 = Util.makeHexColor(...a2);
      const r2 = this.#us(e2);
      e2 = Util.makeHexColor(...r2);
      this.#os.style.color = "";
      if ("#000000" === t2 && "#ffffff" === e2 || t2 === e2) return n2.url;
      const o2 = new Array(256);
      for (let t3 = 0; t3 <= 255; t3++) {
        const e3 = t3 / 255;
        o2[t3] = e3 <= 0.03928 ? e3 / 12.92 : ((e3 + 0.055) / 1.055) ** 2.4;
      }
      const l2 = o2.join(","), h2 = `g_${this.#ss}_hcm_filter`, d2 = n2.filter = this.#ds(h2);
      this.#cs(l2, l2, l2, d2);
      this.#ps(d2);
      const getSteps = (t3, e3) => {
        const i3 = a2[t3] / 255, s3 = r2[t3] / 255, n3 = new Array(e3 + 1);
        for (let t4 = 0; t4 <= e3; t4++) n3[t4] = i3 + t4 / e3 * (s3 - i3);
        return n3.join(",");
      };
      this.#cs(getSteps(0, 5), getSteps(1, 5), getSteps(2, 5), d2);
      n2.url = this.#hs(h2);
      return n2.url;
    }
    addAlphaFilter(t2) {
      let e2 = this.#y.get(t2);
      if (e2) return e2;
      const [i2] = this.#ls([t2]), s2 = `alpha_${i2}`;
      e2 = this.#y.get(s2);
      if (e2) {
        this.#y.set(t2, e2);
        return e2;
      }
      const n2 = `g_${this.#ss}_alpha_map_${this.#w++}`, a2 = this.#hs(n2);
      this.#y.set(t2, a2);
      this.#y.set(s2, a2);
      const r2 = this.#ds(n2);
      this.#gs(i2, r2);
      return a2;
    }
    addLuminosityFilter(t2) {
      let e2, i2, s2 = this.#y.get(t2 || "luminosity");
      if (s2) return s2;
      if (t2) {
        [e2] = this.#ls([t2]);
        i2 = `luminosity_${e2}`;
      } else i2 = "luminosity";
      s2 = this.#y.get(i2);
      if (s2) {
        this.#y.set(t2, s2);
        return s2;
      }
      const n2 = `g_${this.#ss}_luminosity_map_${this.#w++}`, a2 = this.#hs(n2);
      this.#y.set(t2, a2);
      this.#y.set(i2, a2);
      const r2 = this.#ds(n2);
      this.#ms(r2);
      t2 && this.#gs(e2, r2);
      return a2;
    }
    addHighlightHCMFilter(t2, e2, i2, s2, n2) {
      const a2 = `${e2}-${i2}-${s2}-${n2}`;
      let r2 = this.#rs.get(t2);
      if (r2?.key === a2) return r2.url;
      if (r2) {
        r2.filter?.remove();
        r2.key = a2;
        r2.url = "none";
        r2.filter = null;
      } else {
        r2 = { key: a2, url: "none", filter: null };
        this.#rs.set(t2, r2);
      }
      if (!e2 || !i2) return r2.url;
      const [o2, l2] = [e2, i2].map(this.#us.bind(this));
      let h2 = Math.round(0.2126 * o2[0] + 0.7152 * o2[1] + 0.0722 * o2[2]), d2 = Math.round(0.2126 * l2[0] + 0.7152 * l2[1] + 0.0722 * l2[2]), [c2, u2] = [s2, n2].map(this.#us.bind(this));
      d2 < h2 && ([h2, d2, c2, u2] = [d2, h2, u2, c2]);
      this.#os.style.color = "";
      const getSteps = (t3, e3, i3) => {
        const s3 = new Array(256), n3 = (d2 - h2) / i3, a3 = t3 / 255, r3 = (e3 - t3) / (255 * i3);
        let o3 = 0;
        for (let t4 = 0; t4 <= i3; t4++) {
          const e4 = Math.round(h2 + t4 * n3), i4 = a3 + t4 * r3;
          for (let t5 = o3; t5 <= e4; t5++) s3[t5] = i4;
          o3 = e4 + 1;
        }
        for (let t4 = o3; t4 < 256; t4++) s3[t4] = s3[o3 - 1];
        return s3.join(",");
      }, p2 = `g_${this.#ss}_hcm_${t2}_filter`, g2 = r2.filter = this.#ds(p2);
      this.#ps(g2);
      this.#cs(getSteps(c2[0], u2[0], 5), getSteps(c2[1], u2[1], 5), getSteps(c2[2], u2[2], 5), g2);
      r2.url = this.#hs(p2);
      return r2.url;
    }
    destroy(t2 = false) {
      if (!t2 || !this.#as?.size) {
        this.#is?.parentNode.parentNode.remove();
        this.#is = null;
        this.#es?.clear();
        this.#es = null;
        this.#as?.clear();
        this.#as = null;
        this.#w = 0;
      }
    }
    #ms(t2) {
      const e2 = this.#ns.createElementNS(it, "feColorMatrix");
      e2.setAttribute("type", "matrix");
      e2.setAttribute("values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0.59 0.11 0 0");
      t2.append(e2);
    }
    #ps(t2) {
      const e2 = this.#ns.createElementNS(it, "feColorMatrix");
      e2.setAttribute("type", "matrix");
      e2.setAttribute("values", "0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0");
      t2.append(e2);
    }
    #ds(t2) {
      const e2 = this.#ns.createElementNS(it, "filter");
      e2.setAttribute("color-interpolation-filters", "sRGB");
      e2.setAttribute("id", t2);
      this.#os.append(e2);
      return e2;
    }
    #fs(t2, e2, i2) {
      const s2 = this.#ns.createElementNS(it, e2);
      s2.setAttribute("type", "discrete");
      s2.setAttribute("tableValues", i2);
      t2.append(s2);
    }
    #cs(t2, e2, i2, s2) {
      const n2 = this.#ns.createElementNS(it, "feComponentTransfer");
      s2.append(n2);
      this.#fs(n2, "feFuncR", t2);
      this.#fs(n2, "feFuncG", e2);
      this.#fs(n2, "feFuncB", i2);
    }
    #gs(t2, e2) {
      const i2 = this.#ns.createElementNS(it, "feComponentTransfer");
      e2.append(i2);
      this.#fs(i2, "feFuncA", t2);
    }
    #us(t2) {
      this.#os.style.color = t2;
      return getRGB(getComputedStyle(this.#os).getPropertyValue("color"));
    }
  };
  var Ft = e ? class NodeStandardFontDataFactory extends BaseStandardFontDataFactory {
    async _fetch(t2) {
      return node_utils_fetchData(t2);
    }
  } : DOMStandardFontDataFactory;
  function getDocument(t2 = {}) {
    "string" == typeof t2 || t2 instanceof URL ? t2 = { url: t2 } : (t2 instanceof ArrayBuffer || ArrayBuffer.isView(t2)) && (t2 = { data: t2 });
    const i2 = new PDFDocumentLoadingTask(), { docId: s2 } = i2, n2 = t2.url ? (function getUrlProp(t3) {
      if (t3 instanceof URL) return t3.href;
      try {
        return new URL(t3, window.location).href;
      } catch {
        if (e && "string" == typeof t3) return t3;
      }
      throw new Error("Invalid PDF url data: either string or URL-object is expected in the url property.");
    })(t2.url) : null, a2 = t2.data ? (function getDataProp(t3) {
      if (e && "undefined" != typeof Buffer && t3 instanceof Buffer) throw new Error("Please provide binary data as `Uint8Array`, rather than `Buffer`.");
      if (t3 instanceof Uint8Array && t3.byteLength === t3.buffer.byteLength) return t3;
      if ("string" == typeof t3) return stringToBytes(t3);
      if (t3 instanceof ArrayBuffer || ArrayBuffer.isView(t3) || "object" == typeof t3 && !isNaN(t3?.length)) return new Uint8Array(t3);
      throw new Error("Invalid PDF binary data: either TypedArray, string, or array-like object is expected in the data property.");
    })(t2.data) : null, r2 = t2.httpHeaders || null, o2 = true === t2.withCredentials, l2 = t2.password ?? null, h2 = t2.range instanceof PDFDataRangeTransport ? t2.range : null, d2 = Number.isInteger(t2.rangeChunkSize) && t2.rangeChunkSize > 0 ? t2.rangeChunkSize : Dt;
    let c2 = t2.worker instanceof PDFWorker ? t2.worker : null;
    const u2 = t2.verbosity, p2 = "string" != typeof t2.docBaseUrl || isDataScheme(t2.docBaseUrl) ? null : t2.docBaseUrl, g2 = "string" == typeof t2.cMapUrl ? t2.cMapUrl : null, m2 = false !== t2.cMapPacked, f2 = t2.CMapReaderFactory || Rt, b2 = "string" == typeof t2.standardFontDataUrl ? t2.standardFontDataUrl : null, A2 = t2.StandardFontDataFactory || Ft, w2 = true !== t2.stopAtErrors, v2 = Number.isInteger(t2.maxImageSize) && t2.maxImageSize > -1 ? t2.maxImageSize : -1, y2 = false !== t2.isEvalSupported, x2 = "boolean" == typeof t2.isOffscreenCanvasSupported ? t2.isOffscreenCanvasSupported : !e, _2 = "boolean" == typeof t2.isImageDecoderSupported ? t2.isImageDecoderSupported : !e && (util_FeatureTest.platform.isFirefox || !globalThis.chrome), E2 = Number.isInteger(t2.canvasMaxAreaInBytes) ? t2.canvasMaxAreaInBytes : -1, S2 = "boolean" == typeof t2.disableFontFace ? t2.disableFontFace : e, C2 = true === t2.fontExtraProperties, T2 = true === t2.enableXfa, M2 = t2.ownerDocument || globalThis.document, P2 = true === t2.disableRange, D2 = true === t2.disableStream, k2 = true === t2.disableAutoFetch, R2 = true === t2.pdfBug, I2 = t2.CanvasFactory || kt, F2 = t2.FilterFactory || It, L2 = true === t2.enableHWA, O2 = h2 ? h2.length : t2.length ?? NaN, N2 = "boolean" == typeof t2.useSystemFonts ? t2.useSystemFonts : !e && !S2, B2 = "boolean" == typeof t2.useWorkerFetch ? t2.useWorkerFetch : f2 === DOMCMapReaderFactory && A2 === DOMStandardFontDataFactory && g2 && b2 && isValidFetchUrl(g2, document.baseURI) && isValidFetchUrl(b2, document.baseURI);
    setVerbosityLevel(u2);
    const H3 = { canvasFactory: new I2({ ownerDocument: M2, enableHWA: L2 }), filterFactory: new F2({ docId: s2, ownerDocument: M2 }), cMapReaderFactory: B2 ? null : new f2({ baseUrl: g2, isCompressed: m2 }), standardFontDataFactory: B2 ? null : new A2({ baseUrl: b2 }) };
    if (!c2) {
      const t3 = { verbosity: u2, port: GlobalWorkerOptions.workerPort };
      c2 = t3.port ? PDFWorker.fromPort(t3) : new PDFWorker(t3);
      i2._worker = c2;
    }
    const z2 = { docId: s2, apiVersion: "4.10.38", data: a2, password: l2, disableAutoFetch: k2, rangeChunkSize: d2, length: O2, docBaseUrl: p2, enableXfa: T2, evaluatorOptions: { maxImageSize: v2, disableFontFace: S2, ignoreErrors: w2, isEvalSupported: y2, isOffscreenCanvasSupported: x2, isImageDecoderSupported: _2, canvasMaxAreaInBytes: E2, fontExtraProperties: C2, useSystemFonts: N2, cMapUrl: B2 ? g2 : null, standardFontDataUrl: B2 ? b2 : null } }, U2 = { disableFontFace: S2, fontExtraProperties: C2, ownerDocument: M2, pdfBug: R2, styleElement: null, loadingParams: { disableAutoFetch: k2, enableXfa: T2 } };
    c2.promise.then((function() {
      if (i2.destroyed) throw new Error("Loading aborted");
      if (c2.destroyed) throw new Error("Worker was destroyed");
      const t3 = c2.messageHandler.sendWithPromise("GetDocRequest", z2, a2 ? [a2.buffer] : null);
      let l3;
      if (h2) l3 = new PDFDataTransportStream(h2, { disableRange: P2, disableStream: D2 });
      else if (!a2) {
        if (!n2) throw new Error("getDocument - no `url` parameter provided.");
        let t4;
        if (e) if (isValidFetchUrl(n2)) {
          if ("undefined" == typeof fetch || "undefined" == typeof Response || !("body" in Response.prototype)) throw new Error("getDocument - the Fetch API was disabled in Node.js, see `--no-experimental-fetch`.");
          t4 = PDFFetchStream;
        } else t4 = PDFNodeStream;
        else t4 = isValidFetchUrl(n2) ? PDFFetchStream : PDFNetworkStream;
        l3 = new t4({ url: n2, length: O2, httpHeaders: r2, withCredentials: o2, rangeChunkSize: d2, disableRange: P2, disableStream: D2 });
      }
      return t3.then(((t4) => {
        if (i2.destroyed) throw new Error("Loading aborted");
        if (c2.destroyed) throw new Error("Worker was destroyed");
        const e2 = new MessageHandler(s2, t4, c2.port), n3 = new WorkerTransport(e2, i2, l3, U2, H3);
        i2._transport = n3;
        e2.send("Ready", null);
      }));
    })).catch(i2._capability.reject);
    return i2;
  }
  function isRefProxy(t2) {
    return "object" == typeof t2 && Number.isInteger(t2?.num) && t2.num >= 0 && Number.isInteger(t2?.gen) && t2.gen >= 0;
  }
  var PDFDocumentLoadingTask = class _PDFDocumentLoadingTask {
    static #ss = 0;
    constructor() {
      this._capability = Promise.withResolvers();
      this._transport = null;
      this._worker = null;
      this.docId = "d" + _PDFDocumentLoadingTask.#ss++;
      this.destroyed = false;
      this.onPassword = null;
      this.onProgress = null;
    }
    get promise() {
      return this._capability.promise;
    }
    async destroy() {
      this.destroyed = true;
      try {
        this._worker?.port && (this._worker._pendingDestroy = true);
        await this._transport?.destroy();
      } catch (t2) {
        this._worker?.port && delete this._worker._pendingDestroy;
        throw t2;
      }
      this._transport = null;
      this._worker?.destroy();
      this._worker = null;
    }
  };
  var PDFDataRangeTransport = class {
    constructor(t2, e2, i2 = false, s2 = null) {
      this.length = t2;
      this.initialData = e2;
      this.progressiveDone = i2;
      this.contentDispositionFilename = s2;
      this._rangeListeners = [];
      this._progressListeners = [];
      this._progressiveReadListeners = [];
      this._progressiveDoneListeners = [];
      this._readyCapability = Promise.withResolvers();
    }
    addRangeListener(t2) {
      this._rangeListeners.push(t2);
    }
    addProgressListener(t2) {
      this._progressListeners.push(t2);
    }
    addProgressiveReadListener(t2) {
      this._progressiveReadListeners.push(t2);
    }
    addProgressiveDoneListener(t2) {
      this._progressiveDoneListeners.push(t2);
    }
    onDataRange(t2, e2) {
      for (const i2 of this._rangeListeners) i2(t2, e2);
    }
    onDataProgress(t2, e2) {
      this._readyCapability.promise.then((() => {
        for (const i2 of this._progressListeners) i2(t2, e2);
      }));
    }
    onDataProgressiveRead(t2) {
      this._readyCapability.promise.then((() => {
        for (const e2 of this._progressiveReadListeners) e2(t2);
      }));
    }
    onDataProgressiveDone() {
      this._readyCapability.promise.then((() => {
        for (const t2 of this._progressiveDoneListeners) t2();
      }));
    }
    transportReady() {
      this._readyCapability.resolve();
    }
    requestDataRange(t2, e2) {
      unreachable("Abstract method PDFDataRangeTransport.requestDataRange");
    }
    abort() {
    }
  };
  var PDFDocumentProxy = class {
    constructor(t2, e2) {
      this._pdfInfo = t2;
      this._transport = e2;
    }
    get annotationStorage() {
      return this._transport.annotationStorage;
    }
    get canvasFactory() {
      return this._transport.canvasFactory;
    }
    get filterFactory() {
      return this._transport.filterFactory;
    }
    get numPages() {
      return this._pdfInfo.numPages;
    }
    get fingerprints() {
      return this._pdfInfo.fingerprints;
    }
    get isPureXfa() {
      return shadow(this, "isPureXfa", !!this._transport._htmlForXfa);
    }
    get allXfaHtml() {
      return this._transport._htmlForXfa;
    }
    getPage(t2) {
      return this._transport.getPage(t2);
    }
    getPageIndex(t2) {
      return this._transport.getPageIndex(t2);
    }
    getDestinations() {
      return this._transport.getDestinations();
    }
    getDestination(t2) {
      return this._transport.getDestination(t2);
    }
    getPageLabels() {
      return this._transport.getPageLabels();
    }
    getPageLayout() {
      return this._transport.getPageLayout();
    }
    getPageMode() {
      return this._transport.getPageMode();
    }
    getViewerPreferences() {
      return this._transport.getViewerPreferences();
    }
    getOpenAction() {
      return this._transport.getOpenAction();
    }
    getAttachments() {
      return this._transport.getAttachments();
    }
    getJSActions() {
      return this._transport.getDocJSActions();
    }
    getOutline() {
      return this._transport.getOutline();
    }
    getOptionalContentConfig({ intent: t2 = "display" } = {}) {
      const { renderingIntent: e2 } = this._transport.getRenderingIntent(t2);
      return this._transport.getOptionalContentConfig(e2);
    }
    getPermissions() {
      return this._transport.getPermissions();
    }
    getMetadata() {
      return this._transport.getMetadata();
    }
    getMarkInfo() {
      return this._transport.getMarkInfo();
    }
    getData() {
      return this._transport.getData();
    }
    saveDocument() {
      return this._transport.saveDocument();
    }
    getDownloadInfo() {
      return this._transport.downloadInfoCapability.promise;
    }
    cleanup(t2 = false) {
      return this._transport.startCleanup(t2 || this.isPureXfa);
    }
    destroy() {
      return this.loadingTask.destroy();
    }
    cachedPageNumber(t2) {
      return this._transport.cachedPageNumber(t2);
    }
    get loadingParams() {
      return this._transport.loadingParams;
    }
    get loadingTask() {
      return this._transport.loadingTask;
    }
    getFieldObjects() {
      return this._transport.getFieldObjects();
    }
    hasJSActions() {
      return this._transport.hasJSActions();
    }
    getCalculationOrderIds() {
      return this._transport.getCalculationOrderIds();
    }
  };
  var PDFPageProxy = class {
    #bs = null;
    #As = false;
    constructor(t2, e2, i2, s2 = false) {
      this._pageIndex = t2;
      this._pageInfo = e2;
      this._transport = i2;
      this._stats = s2 ? new StatTimer() : null;
      this._pdfBug = s2;
      this.commonObjs = i2.commonObjs;
      this.objs = new PDFObjects();
      this._maybeCleanupAfterRender = false;
      this._intentStates = /* @__PURE__ */ new Map();
      this.destroyed = false;
    }
    get pageNumber() {
      return this._pageIndex + 1;
    }
    get rotate() {
      return this._pageInfo.rotate;
    }
    get ref() {
      return this._pageInfo.ref;
    }
    get userUnit() {
      return this._pageInfo.userUnit;
    }
    get view() {
      return this._pageInfo.view;
    }
    getViewport({ scale: t2, rotation: e2 = this.rotate, offsetX: i2 = 0, offsetY: s2 = 0, dontFlip: n2 = false } = {}) {
      return new PageViewport({ viewBox: this.view, userUnit: this.userUnit, scale: t2, rotation: e2, offsetX: i2, offsetY: s2, dontFlip: n2 });
    }
    getAnnotations({ intent: t2 = "display" } = {}) {
      const { renderingIntent: e2 } = this._transport.getRenderingIntent(t2);
      return this._transport.getAnnotations(this._pageIndex, e2);
    }
    getJSActions() {
      return this._transport.getPageJSActions(this._pageIndex);
    }
    get filterFactory() {
      return this._transport.filterFactory;
    }
    get isPureXfa() {
      return shadow(this, "isPureXfa", !!this._transport._htmlForXfa);
    }
    async getXfa() {
      return this._transport._htmlForXfa?.children[this._pageIndex] || null;
    }
    render({ canvasContext: t2, viewport: e2, intent: i2 = "display", annotationMode: s2 = p.ENABLE, transform: n2 = null, background: a2 = null, optionalContentConfigPromise: r2 = null, annotationCanvasMap: l2 = null, pageColors: h2 = null, printAnnotationStorage: d2 = null, isEditing: c2 = false }) {
      this._stats?.time("Overall");
      const u2 = this._transport.getRenderingIntent(i2, s2, d2, c2), { renderingIntent: g2, cacheKey: m2 } = u2;
      this.#As = false;
      this.#ws();
      r2 ||= this._transport.getOptionalContentConfig(g2);
      let f2 = this._intentStates.get(m2);
      if (!f2) {
        f2 = /* @__PURE__ */ Object.create(null);
        this._intentStates.set(m2, f2);
      }
      if (f2.streamReaderCancelTimeout) {
        clearTimeout(f2.streamReaderCancelTimeout);
        f2.streamReaderCancelTimeout = null;
      }
      const b2 = !!(g2 & o);
      if (!f2.displayReadyCapability) {
        f2.displayReadyCapability = Promise.withResolvers();
        f2.operatorList = { fnArray: [], argsArray: [], lastChunk: false, separateAnnots: null };
        this._stats?.time("Page Request");
        this._pumpOperatorList(u2);
      }
      const complete = (t3) => {
        f2.renderTasks.delete(A2);
        (this._maybeCleanupAfterRender || b2) && (this.#As = true);
        this.#vs(!b2);
        if (t3) {
          A2.capability.reject(t3);
          this._abortOperatorList({ intentState: f2, reason: t3 instanceof Error ? t3 : new Error(t3) });
        } else A2.capability.resolve();
        if (this._stats) {
          this._stats.timeEnd("Rendering");
          this._stats.timeEnd("Overall");
          globalThis.Stats?.enabled && globalThis.Stats.add(this.pageNumber, this._stats);
        }
      }, A2 = new InternalRenderTask({ callback: complete, params: { canvasContext: t2, viewport: e2, transform: n2, background: a2 }, objs: this.objs, commonObjs: this.commonObjs, annotationCanvasMap: l2, operatorList: f2.operatorList, pageIndex: this._pageIndex, canvasFactory: this._transport.canvasFactory, filterFactory: this._transport.filterFactory, useRequestAnimationFrame: !b2, pdfBug: this._pdfBug, pageColors: h2 });
      (f2.renderTasks ||= /* @__PURE__ */ new Set()).add(A2);
      const w2 = A2.task;
      Promise.all([f2.displayReadyCapability.promise, r2]).then((([t3, e3]) => {
        if (this.destroyed) complete();
        else {
          this._stats?.time("Rendering");
          if (!(e3.renderingIntent & g2)) throw new Error("Must use the same `intent`-argument when calling the `PDFPageProxy.render` and `PDFDocumentProxy.getOptionalContentConfig` methods.");
          A2.initializeGraphics({ transparency: t3, optionalContentConfig: e3 });
          A2.operatorListChanged();
        }
      })).catch(complete);
      return w2;
    }
    getOperatorList({ intent: t2 = "display", annotationMode: e2 = p.ENABLE, printAnnotationStorage: i2 = null, isEditing: s2 = false } = {}) {
      const n2 = this._transport.getRenderingIntent(t2, e2, i2, s2, true);
      let a2, r2 = this._intentStates.get(n2.cacheKey);
      if (!r2) {
        r2 = /* @__PURE__ */ Object.create(null);
        this._intentStates.set(n2.cacheKey, r2);
      }
      if (!r2.opListReadCapability) {
        a2 = /* @__PURE__ */ Object.create(null);
        a2.operatorListChanged = function operatorListChanged() {
          if (r2.operatorList.lastChunk) {
            r2.opListReadCapability.resolve(r2.operatorList);
            r2.renderTasks.delete(a2);
          }
        };
        r2.opListReadCapability = Promise.withResolvers();
        (r2.renderTasks ||= /* @__PURE__ */ new Set()).add(a2);
        r2.operatorList = { fnArray: [], argsArray: [], lastChunk: false, separateAnnots: null };
        this._stats?.time("Page Request");
        this._pumpOperatorList(n2);
      }
      return r2.opListReadCapability.promise;
    }
    streamTextContent({ includeMarkedContent: t2 = false, disableNormalization: e2 = false } = {}) {
      return this._transport.messageHandler.sendWithStream("GetTextContent", { pageIndex: this._pageIndex, includeMarkedContent: true === t2, disableNormalization: true === e2 }, { highWaterMark: 100, size: (t3) => t3.items.length });
    }
    getTextContent(t2 = {}) {
      if (this._transport._htmlForXfa) return this.getXfa().then(((t3) => XfaText.textContent(t3)));
      const e2 = this.streamTextContent(t2);
      return new Promise((function(t3, i2) {
        const s2 = e2.getReader(), n2 = { items: [], styles: /* @__PURE__ */ Object.create(null), lang: null };
        !(function pump() {
          s2.read().then((function({ value: e3, done: i3 }) {
            if (i3) t3(n2);
            else {
              n2.lang ??= e3.lang;
              Object.assign(n2.styles, e3.styles);
              n2.items.push(...e3.items);
              pump();
            }
          }), i2);
        })();
      }));
    }
    getStructTree() {
      return this._transport.getStructTree(this._pageIndex);
    }
    _destroy() {
      this.destroyed = true;
      const t2 = [];
      for (const e2 of this._intentStates.values()) {
        this._abortOperatorList({ intentState: e2, reason: new Error("Page was destroyed."), force: true });
        if (!e2.opListReadCapability) for (const i2 of e2.renderTasks) {
          t2.push(i2.completed);
          i2.cancel();
        }
      }
      this.objs.clear();
      this.#As = false;
      this.#ws();
      return Promise.all(t2);
    }
    cleanup(t2 = false) {
      this.#As = true;
      const e2 = this.#vs(false);
      t2 && e2 && (this._stats &&= new StatTimer());
      return e2;
    }
    #vs(t2 = false) {
      this.#ws();
      if (!this.#As || this.destroyed) return false;
      if (t2) {
        this.#bs = setTimeout((() => {
          this.#bs = null;
          this.#vs(false);
        }), 5e3);
        return false;
      }
      for (const { renderTasks: t3, operatorList: e2 } of this._intentStates.values()) if (t3.size > 0 || !e2.lastChunk) return false;
      this._intentStates.clear();
      this.objs.clear();
      this.#As = false;
      return true;
    }
    #ws() {
      if (this.#bs) {
        clearTimeout(this.#bs);
        this.#bs = null;
      }
    }
    _startRenderPage(t2, e2) {
      const i2 = this._intentStates.get(e2);
      if (i2) {
        this._stats?.timeEnd("Page Request");
        i2.displayReadyCapability?.resolve(t2);
      }
    }
    _renderPageChunk(t2, e2) {
      for (let i2 = 0, s2 = t2.length; i2 < s2; i2++) {
        e2.operatorList.fnArray.push(t2.fnArray[i2]);
        e2.operatorList.argsArray.push(t2.argsArray[i2]);
      }
      e2.operatorList.lastChunk = t2.lastChunk;
      e2.operatorList.separateAnnots = t2.separateAnnots;
      for (const t3 of e2.renderTasks) t3.operatorListChanged();
      t2.lastChunk && this.#vs(true);
    }
    _pumpOperatorList({ renderingIntent: t2, cacheKey: e2, annotationStorageSerializable: i2, modifiedIds: s2 }) {
      const { map: n2, transfer: a2 } = i2, r2 = this._transport.messageHandler.sendWithStream("GetOperatorList", { pageIndex: this._pageIndex, intent: t2, cacheKey: e2, annotationStorage: n2, modifiedIds: s2 }, a2).getReader(), o2 = this._intentStates.get(e2);
      o2.streamReader = r2;
      const pump = () => {
        r2.read().then((({ value: t3, done: e3 }) => {
          if (e3) o2.streamReader = null;
          else if (!this._transport.destroyed) {
            this._renderPageChunk(t3, o2);
            pump();
          }
        }), ((t3) => {
          o2.streamReader = null;
          if (!this._transport.destroyed) {
            if (o2.operatorList) {
              o2.operatorList.lastChunk = true;
              for (const t4 of o2.renderTasks) t4.operatorListChanged();
              this.#vs(true);
            }
            if (o2.displayReadyCapability) o2.displayReadyCapability.reject(t3);
            else {
              if (!o2.opListReadCapability) throw t3;
              o2.opListReadCapability.reject(t3);
            }
          }
        }));
      };
      pump();
    }
    _abortOperatorList({ intentState: t2, reason: e2, force: i2 = false }) {
      if (t2.streamReader) {
        if (t2.streamReaderCancelTimeout) {
          clearTimeout(t2.streamReaderCancelTimeout);
          t2.streamReaderCancelTimeout = null;
        }
        if (!i2) {
          if (t2.renderTasks.size > 0) return;
          if (e2 instanceof RenderingCancelledException) {
            let i3 = 100;
            e2.extraDelay > 0 && e2.extraDelay < 1e3 && (i3 += e2.extraDelay);
            t2.streamReaderCancelTimeout = setTimeout((() => {
              t2.streamReaderCancelTimeout = null;
              this._abortOperatorList({ intentState: t2, reason: e2, force: true });
            }), i3);
            return;
          }
        }
        t2.streamReader.cancel(new AbortException(e2.message)).catch((() => {
        }));
        t2.streamReader = null;
        if (!this._transport.destroyed) {
          for (const [e3, i3] of this._intentStates) if (i3 === t2) {
            this._intentStates.delete(e3);
            break;
          }
          this.cleanup();
        }
      }
    }
    get stats() {
      return this._stats;
    }
  };
  var LoopbackPort = class {
    #ys = /* @__PURE__ */ new Map();
    #xs = Promise.resolve();
    postMessage(t2, e2) {
      const i2 = { data: structuredClone(t2, e2 ? { transfer: e2 } : null) };
      this.#xs.then((() => {
        for (const [t3] of this.#ys) t3.call(this, i2);
      }));
    }
    addEventListener(t2, e2, i2 = null) {
      let s2 = null;
      if (i2?.signal instanceof AbortSignal) {
        const { signal: n2 } = i2;
        if (n2.aborted) {
          warn("LoopbackPort - cannot use an `aborted` signal.");
          return;
        }
        const onAbort = () => this.removeEventListener(t2, e2);
        s2 = () => n2.removeEventListener("abort", onAbort);
        n2.addEventListener("abort", onAbort);
      }
      this.#ys.set(e2, s2);
    }
    removeEventListener(t2, e2) {
      const i2 = this.#ys.get(e2);
      i2?.();
      this.#ys.delete(e2);
    }
    terminate() {
      for (const [, t2] of this.#ys) t2?.();
      this.#ys.clear();
    }
  };
  var PDFWorker = class _PDFWorker {
    static #_s = 0;
    static #Es = false;
    static #Ss;
    static {
      if (e) {
        this.#Es = true;
        GlobalWorkerOptions.workerSrc ||= "./pdf.worker.mjs";
      }
      this._isSameOrigin = (t2, e2) => {
        let i2;
        try {
          i2 = new URL(t2);
          if (!i2.origin || "null" === i2.origin) return false;
        } catch {
          return false;
        }
        const s2 = new URL(e2, i2);
        return i2.origin === s2.origin;
      };
      this._createCDNWrapper = (t2) => {
        const e2 = `await import("${t2}");`;
        return URL.createObjectURL(new Blob([e2], { type: "text/javascript" }));
      };
    }
    constructor({ name: t2 = null, port: e2 = null, verbosity: i2 = getVerbosityLevel() } = {}) {
      this.name = t2;
      this.destroyed = false;
      this.verbosity = i2;
      this._readyCapability = Promise.withResolvers();
      this._port = null;
      this._webWorker = null;
      this._messageHandler = null;
      if (e2) {
        if (_PDFWorker.#Ss?.has(e2)) throw new Error("Cannot use more than one PDFWorker per port.");
        (_PDFWorker.#Ss ||= /* @__PURE__ */ new WeakMap()).set(e2, this);
        this._initializeFromPort(e2);
      } else this._initialize();
    }
    get promise() {
      return this._readyCapability.promise;
    }
    #Cs() {
      this._readyCapability.resolve();
      this._messageHandler.send("configure", { verbosity: this.verbosity });
    }
    get port() {
      return this._port;
    }
    get messageHandler() {
      return this._messageHandler;
    }
    _initializeFromPort(t2) {
      this._port = t2;
      this._messageHandler = new MessageHandler("main", "worker", t2);
      this._messageHandler.on("ready", (function() {
      }));
      this.#Cs();
    }
    _initialize() {
      if (_PDFWorker.#Es || _PDFWorker.#Ts) {
        this._setupFakeWorker();
        return;
      }
      let { workerSrc: t2 } = _PDFWorker;
      try {
        _PDFWorker._isSameOrigin(window.location.href, t2) || (t2 = _PDFWorker._createCDNWrapper(new URL(t2, window.location).href));
        const e2 = new Worker(t2, { type: "module" }), i2 = new MessageHandler("main", "worker", e2), terminateEarly = () => {
          s2.abort();
          i2.destroy();
          e2.terminate();
          this.destroyed ? this._readyCapability.reject(new Error("Worker was destroyed")) : this._setupFakeWorker();
        }, s2 = new AbortController();
        e2.addEventListener("error", (() => {
          this._webWorker || terminateEarly();
        }), { signal: s2.signal });
        i2.on("test", ((t3) => {
          s2.abort();
          if (!this.destroyed && t3) {
            this._messageHandler = i2;
            this._port = e2;
            this._webWorker = e2;
            this.#Cs();
          } else terminateEarly();
        }));
        i2.on("ready", ((t3) => {
          s2.abort();
          if (this.destroyed) terminateEarly();
          else try {
            sendTest();
          } catch {
            this._setupFakeWorker();
          }
        }));
        const sendTest = () => {
          const t3 = new Uint8Array();
          i2.send("test", t3, [t3.buffer]);
        };
        sendTest();
        return;
      } catch {
        info("The worker has been disabled.");
      }
      this._setupFakeWorker();
    }
    _setupFakeWorker() {
      if (!_PDFWorker.#Es) {
        warn("Setting up fake worker.");
        _PDFWorker.#Es = true;
      }
      _PDFWorker._setupFakeWorkerGlobal.then(((t2) => {
        if (this.destroyed) {
          this._readyCapability.reject(new Error("Worker was destroyed"));
          return;
        }
        const e2 = new LoopbackPort();
        this._port = e2;
        const i2 = "fake" + _PDFWorker.#_s++, s2 = new MessageHandler(i2 + "_worker", i2, e2);
        t2.setup(s2, e2);
        this._messageHandler = new MessageHandler(i2, i2 + "_worker", e2);
        this.#Cs();
      })).catch(((t2) => {
        this._readyCapability.reject(new Error(`Setting up fake worker failed: "${t2.message}".`));
      }));
    }
    destroy() {
      this.destroyed = true;
      this._webWorker?.terminate();
      this._webWorker = null;
      _PDFWorker.#Ss?.delete(this._port);
      this._port = null;
      this._messageHandler?.destroy();
      this._messageHandler = null;
    }
    static fromPort(t2) {
      if (!t2?.port) throw new Error("PDFWorker.fromPort - invalid method signature.");
      const e2 = this.#Ss?.get(t2.port);
      if (e2) {
        if (e2._pendingDestroy) throw new Error("PDFWorker.fromPort - the worker is being destroyed.\nPlease remember to await `PDFDocumentLoadingTask.destroy()`-calls.");
        return e2;
      }
      return new _PDFWorker(t2);
    }
    static get workerSrc() {
      if (GlobalWorkerOptions.workerSrc) return GlobalWorkerOptions.workerSrc;
      throw new Error('No "GlobalWorkerOptions.workerSrc" specified.');
    }
    static get #Ts() {
      try {
        return globalThis.pdfjsWorker?.WorkerMessageHandler || null;
      } catch {
        return null;
      }
    }
    static get _setupFakeWorkerGlobal() {
      return shadow(this, "_setupFakeWorkerGlobal", (async () => {
        if (this.#Ts) return this.#Ts;
        return (await import(this.workerSrc)).WorkerMessageHandler;
      })());
    }
  };
  var WorkerTransport = class {
    #Ms = /* @__PURE__ */ new Map();
    #Ps = /* @__PURE__ */ new Map();
    #Ds = /* @__PURE__ */ new Map();
    #ks = /* @__PURE__ */ new Map();
    #Rs = null;
    constructor(t2, e2, i2, s2, n2) {
      this.messageHandler = t2;
      this.loadingTask = e2;
      this.commonObjs = new PDFObjects();
      this.fontLoader = new FontLoader({ ownerDocument: s2.ownerDocument, styleElement: s2.styleElement });
      this.loadingParams = s2.loadingParams;
      this._params = s2;
      this.canvasFactory = n2.canvasFactory;
      this.filterFactory = n2.filterFactory;
      this.cMapReaderFactory = n2.cMapReaderFactory;
      this.standardFontDataFactory = n2.standardFontDataFactory;
      this.destroyed = false;
      this.destroyCapability = null;
      this._networkStream = i2;
      this._fullReader = null;
      this._lastProgress = null;
      this.downloadInfoCapability = Promise.withResolvers();
      this.setupMessageHandler();
    }
    #Is(t2, e2 = null) {
      const i2 = this.#Ms.get(t2);
      if (i2) return i2;
      const s2 = this.messageHandler.sendWithPromise(t2, e2);
      this.#Ms.set(t2, s2);
      return s2;
    }
    get annotationStorage() {
      return shadow(this, "annotationStorage", new AnnotationStorage());
    }
    getRenderingIntent(t2, e2 = p.ENABLE, i2 = null, s2 = false, n2 = false) {
      let g2 = r, m2 = rt;
      switch (t2) {
        case "any":
          g2 = a;
          break;
        case "display":
          break;
        case "print":
          g2 = o;
          break;
        default:
          warn(`getRenderingIntent - invalid intent: ${t2}`);
      }
      const f2 = g2 & o && i2 instanceof PrintAnnotationStorage ? i2 : this.annotationStorage;
      switch (e2) {
        case p.DISABLE:
          g2 += d;
          break;
        case p.ENABLE:
          break;
        case p.ENABLE_FORMS:
          g2 += l;
          break;
        case p.ENABLE_STORAGE:
          g2 += h;
          m2 = f2.serializable;
          break;
        default:
          warn(`getRenderingIntent - invalid annotationMode: ${e2}`);
      }
      s2 && (g2 += c);
      n2 && (g2 += u);
      const { ids: b2, hash: A2 } = f2.modifiedIds;
      return { renderingIntent: g2, cacheKey: [g2, m2.hash, A2].join("_"), annotationStorageSerializable: m2, modifiedIds: b2 };
    }
    destroy() {
      if (this.destroyCapability) return this.destroyCapability.promise;
      this.destroyed = true;
      this.destroyCapability = Promise.withResolvers();
      this.#Rs?.reject(new Error("Worker was destroyed during onPassword callback"));
      const t2 = [];
      for (const e3 of this.#Ps.values()) t2.push(e3._destroy());
      this.#Ps.clear();
      this.#Ds.clear();
      this.#ks.clear();
      this.hasOwnProperty("annotationStorage") && this.annotationStorage.resetModified();
      const e2 = this.messageHandler.sendWithPromise("Terminate", null);
      t2.push(e2);
      Promise.all(t2).then((() => {
        this.commonObjs.clear();
        this.fontLoader.clear();
        this.#Ms.clear();
        this.filterFactory.destroy();
        TextLayer.cleanup();
        this._networkStream?.cancelAllRequests(new AbortException("Worker was terminated."));
        this.messageHandler?.destroy();
        this.messageHandler = null;
        this.destroyCapability.resolve();
      }), this.destroyCapability.reject);
      return this.destroyCapability.promise;
    }
    setupMessageHandler() {
      const { messageHandler: t2, loadingTask: e2 } = this;
      t2.on("GetReader", ((t3, e3) => {
        assert(this._networkStream, "GetReader - no `IPDFStream` instance available.");
        this._fullReader = this._networkStream.getFullReader();
        this._fullReader.onProgress = (t4) => {
          this._lastProgress = { loaded: t4.loaded, total: t4.total };
        };
        e3.onPull = () => {
          this._fullReader.read().then((function({ value: t4, done: i2 }) {
            if (i2) e3.close();
            else {
              assert(t4 instanceof ArrayBuffer, "GetReader - expected an ArrayBuffer.");
              e3.enqueue(new Uint8Array(t4), 1, [t4]);
            }
          })).catch(((t4) => {
            e3.error(t4);
          }));
        };
        e3.onCancel = (t4) => {
          this._fullReader.cancel(t4);
          e3.ready.catch(((t5) => {
            if (!this.destroyed) throw t5;
          }));
        };
      }));
      t2.on("ReaderHeadersReady", (async (t3) => {
        await this._fullReader.headersReady;
        const { isStreamingSupported: i2, isRangeSupported: s2, contentLength: n2 } = this._fullReader;
        if (!i2 || !s2) {
          this._lastProgress && e2.onProgress?.(this._lastProgress);
          this._fullReader.onProgress = (t4) => {
            e2.onProgress?.({ loaded: t4.loaded, total: t4.total });
          };
        }
        return { isStreamingSupported: i2, isRangeSupported: s2, contentLength: n2 };
      }));
      t2.on("GetRangeReader", ((t3, e3) => {
        assert(this._networkStream, "GetRangeReader - no `IPDFStream` instance available.");
        const i2 = this._networkStream.getRangeReader(t3.begin, t3.end);
        if (i2) {
          e3.onPull = () => {
            i2.read().then((function({ value: t4, done: i3 }) {
              if (i3) e3.close();
              else {
                assert(t4 instanceof ArrayBuffer, "GetRangeReader - expected an ArrayBuffer.");
                e3.enqueue(new Uint8Array(t4), 1, [t4]);
              }
            })).catch(((t4) => {
              e3.error(t4);
            }));
          };
          e3.onCancel = (t4) => {
            i2.cancel(t4);
            e3.ready.catch(((t5) => {
              if (!this.destroyed) throw t5;
            }));
          };
        } else e3.close();
      }));
      t2.on("GetDoc", (({ pdfInfo: t3 }) => {
        this._numPages = t3.numPages;
        this._htmlForXfa = t3.htmlForXfa;
        delete t3.htmlForXfa;
        e2._capability.resolve(new PDFDocumentProxy(t3, this));
      }));
      t2.on("DocException", ((t3) => {
        e2._capability.reject(wrapReason(t3));
      }));
      t2.on("PasswordRequest", ((t3) => {
        this.#Rs = Promise.withResolvers();
        try {
          if (!e2.onPassword) throw wrapReason(t3);
          const updatePassword = (t4) => {
            t4 instanceof Error ? this.#Rs.reject(t4) : this.#Rs.resolve({ password: t4 });
          };
          e2.onPassword(updatePassword, t3.code);
        } catch (t4) {
          this.#Rs.reject(t4);
        }
        return this.#Rs.promise;
      }));
      t2.on("DataLoaded", ((t3) => {
        e2.onProgress?.({ loaded: t3.length, total: t3.length });
        this.downloadInfoCapability.resolve(t3);
      }));
      t2.on("StartRenderPage", ((t3) => {
        if (this.destroyed) return;
        this.#Ps.get(t3.pageIndex)._startRenderPage(t3.transparency, t3.cacheKey);
      }));
      t2.on("commonobj", (([e3, i2, s2]) => {
        if (this.destroyed) return null;
        if (this.commonObjs.has(e3)) return null;
        switch (i2) {
          case "Font":
            const { disableFontFace: n2, fontExtraProperties: a2, pdfBug: r2 } = this._params;
            if ("error" in s2) {
              const t3 = s2.error;
              warn(`Error during font loading: ${t3}`);
              this.commonObjs.resolve(e3, t3);
              break;
            }
            const o2 = r2 && globalThis.FontInspector?.enabled ? (t3, e4) => globalThis.FontInspector.fontAdded(t3, e4) : null, l2 = new FontFaceObject(s2, { disableFontFace: n2, fontExtraProperties: a2, inspectFont: o2 });
            this.fontLoader.bind(l2).catch((() => t2.sendWithPromise("FontFallback", { id: e3 }))).finally((() => {
              !a2 && l2.data && (l2.data = null);
              this.commonObjs.resolve(e3, l2);
            }));
            break;
          case "CopyLocalImage":
            const { imageRef: h2 } = s2;
            assert(h2, "The imageRef must be defined.");
            for (const t3 of this.#Ps.values()) for (const [, i3] of t3.objs) if (i3?.ref === h2) {
              if (!i3.dataLen) return null;
              this.commonObjs.resolve(e3, structuredClone(i3));
              return i3.dataLen;
            }
            break;
          case "FontPath":
          case "Image":
          case "Pattern":
            this.commonObjs.resolve(e3, s2);
            break;
          default:
            throw new Error(`Got unknown common object type ${i2}`);
        }
        return null;
      }));
      t2.on("obj", (([t3, e3, i2, s2]) => {
        if (this.destroyed) return;
        const n2 = this.#Ps.get(e3);
        if (!n2.objs.has(t3)) if (0 !== n2._intentStates.size) switch (i2) {
          case "Image":
            n2.objs.resolve(t3, s2);
            s2?.dataLen > 1e7 && (n2._maybeCleanupAfterRender = true);
            break;
          case "Pattern":
            n2.objs.resolve(t3, s2);
            break;
          default:
            throw new Error(`Got unknown object type ${i2}`);
        }
        else s2?.bitmap?.close();
      }));
      t2.on("DocProgress", ((t3) => {
        this.destroyed || e2.onProgress?.({ loaded: t3.loaded, total: t3.total });
      }));
      t2.on("FetchBuiltInCMap", (async (t3) => {
        if (this.destroyed) throw new Error("Worker was destroyed.");
        if (!this.cMapReaderFactory) throw new Error("CMapReaderFactory not initialized, see the `useWorkerFetch` parameter.");
        return this.cMapReaderFactory.fetch(t3);
      }));
      t2.on("FetchStandardFontData", (async (t3) => {
        if (this.destroyed) throw new Error("Worker was destroyed.");
        if (!this.standardFontDataFactory) throw new Error("StandardFontDataFactory not initialized, see the `useWorkerFetch` parameter.");
        return this.standardFontDataFactory.fetch(t3);
      }));
    }
    getData() {
      return this.messageHandler.sendWithPromise("GetData", null);
    }
    saveDocument() {
      this.annotationStorage.size <= 0 && warn("saveDocument called while `annotationStorage` is empty, please use the getData-method instead.");
      const { map: t2, transfer: e2 } = this.annotationStorage.serializable;
      return this.messageHandler.sendWithPromise("SaveDocument", { isPureXfa: !!this._htmlForXfa, numPages: this._numPages, annotationStorage: t2, filename: this._fullReader?.filename ?? null }, e2).finally((() => {
        this.annotationStorage.resetModified();
      }));
    }
    getPage(t2) {
      if (!Number.isInteger(t2) || t2 <= 0 || t2 > this._numPages) return Promise.reject(new Error("Invalid page request."));
      const e2 = t2 - 1, i2 = this.#Ds.get(e2);
      if (i2) return i2;
      const s2 = this.messageHandler.sendWithPromise("GetPage", { pageIndex: e2 }).then(((i3) => {
        if (this.destroyed) throw new Error("Transport destroyed");
        i3.refStr && this.#ks.set(i3.refStr, t2);
        const s3 = new PDFPageProxy(e2, i3, this, this._params.pdfBug);
        this.#Ps.set(e2, s3);
        return s3;
      }));
      this.#Ds.set(e2, s2);
      return s2;
    }
    getPageIndex(t2) {
      return isRefProxy(t2) ? this.messageHandler.sendWithPromise("GetPageIndex", { num: t2.num, gen: t2.gen }) : Promise.reject(new Error("Invalid pageIndex request."));
    }
    getAnnotations(t2, e2) {
      return this.messageHandler.sendWithPromise("GetAnnotations", { pageIndex: t2, intent: e2 });
    }
    getFieldObjects() {
      return this.#Is("GetFieldObjects");
    }
    hasJSActions() {
      return this.#Is("HasJSActions");
    }
    getCalculationOrderIds() {
      return this.messageHandler.sendWithPromise("GetCalculationOrderIds", null);
    }
    getDestinations() {
      return this.messageHandler.sendWithPromise("GetDestinations", null);
    }
    getDestination(t2) {
      return "string" != typeof t2 ? Promise.reject(new Error("Invalid destination request.")) : this.messageHandler.sendWithPromise("GetDestination", { id: t2 });
    }
    getPageLabels() {
      return this.messageHandler.sendWithPromise("GetPageLabels", null);
    }
    getPageLayout() {
      return this.messageHandler.sendWithPromise("GetPageLayout", null);
    }
    getPageMode() {
      return this.messageHandler.sendWithPromise("GetPageMode", null);
    }
    getViewerPreferences() {
      return this.messageHandler.sendWithPromise("GetViewerPreferences", null);
    }
    getOpenAction() {
      return this.messageHandler.sendWithPromise("GetOpenAction", null);
    }
    getAttachments() {
      return this.messageHandler.sendWithPromise("GetAttachments", null);
    }
    getDocJSActions() {
      return this.#Is("GetDocJSActions");
    }
    getPageJSActions(t2) {
      return this.messageHandler.sendWithPromise("GetPageJSActions", { pageIndex: t2 });
    }
    getStructTree(t2) {
      return this.messageHandler.sendWithPromise("GetStructTree", { pageIndex: t2 });
    }
    getOutline() {
      return this.messageHandler.sendWithPromise("GetOutline", null);
    }
    getOptionalContentConfig(t2) {
      return this.#Is("GetOptionalContentConfig").then(((e2) => new OptionalContentConfig(e2, t2)));
    }
    getPermissions() {
      return this.messageHandler.sendWithPromise("GetPermissions", null);
    }
    getMetadata() {
      const t2 = "GetMetadata", e2 = this.#Ms.get(t2);
      if (e2) return e2;
      const i2 = this.messageHandler.sendWithPromise(t2, null).then(((t3) => ({ info: t3[0], metadata: t3[1] ? new Metadata(t3[1]) : null, contentDispositionFilename: this._fullReader?.filename ?? null, contentLength: this._fullReader?.contentLength ?? null })));
      this.#Ms.set(t2, i2);
      return i2;
    }
    getMarkInfo() {
      return this.messageHandler.sendWithPromise("GetMarkInfo", null);
    }
    async startCleanup(t2 = false) {
      if (!this.destroyed) {
        await this.messageHandler.sendWithPromise("Cleanup", null);
        for (const t3 of this.#Ps.values()) {
          if (!t3.cleanup()) throw new Error(`startCleanup: Page ${t3.pageNumber} is currently rendering.`);
        }
        this.commonObjs.clear();
        t2 || this.fontLoader.clear();
        this.#Ms.clear();
        this.filterFactory.destroy(true);
        TextLayer.cleanup();
      }
    }
    cachedPageNumber(t2) {
      if (!isRefProxy(t2)) return null;
      const e2 = 0 === t2.gen ? `${t2.num}R` : `${t2.num}R${t2.gen}`;
      return this.#ks.get(e2) ?? null;
    }
  };
  var Lt = Symbol("INITIAL_DATA");
  var PDFObjects = class {
    #Fs = /* @__PURE__ */ Object.create(null);
    #Ls(t2) {
      return this.#Fs[t2] ||= { ...Promise.withResolvers(), data: Lt };
    }
    get(t2, e2 = null) {
      if (e2) {
        const i3 = this.#Ls(t2);
        i3.promise.then((() => e2(i3.data)));
        return null;
      }
      const i2 = this.#Fs[t2];
      if (!i2 || i2.data === Lt) throw new Error(`Requesting object that isn't resolved yet ${t2}.`);
      return i2.data;
    }
    has(t2) {
      const e2 = this.#Fs[t2];
      return !!e2 && e2.data !== Lt;
    }
    delete(t2) {
      const e2 = this.#Fs[t2];
      if (!e2 || e2.data === Lt) return false;
      delete this.#Fs[t2];
      return true;
    }
    resolve(t2, e2 = null) {
      const i2 = this.#Ls(t2);
      i2.data = e2;
      i2.resolve();
    }
    clear() {
      for (const t2 in this.#Fs) {
        const { data: e2 } = this.#Fs[t2];
        e2?.bitmap?.close();
      }
      this.#Fs = /* @__PURE__ */ Object.create(null);
    }
    *[Symbol.iterator]() {
      for (const t2 in this.#Fs) {
        const { data: e2 } = this.#Fs[t2];
        e2 !== Lt && (yield [t2, e2]);
      }
    }
  };
  var RenderTask = class {
    #Os = null;
    constructor(t2) {
      this.#Os = t2;
      this.onContinue = null;
    }
    get promise() {
      return this.#Os.capability.promise;
    }
    cancel(t2 = 0) {
      this.#Os.cancel(null, t2);
    }
    get separateAnnots() {
      const { separateAnnots: t2 } = this.#Os.operatorList;
      if (!t2) return false;
      const { annotationCanvasMap: e2 } = this.#Os;
      return t2.form || t2.canvas && e2?.size > 0;
    }
  };
  var InternalRenderTask = class _InternalRenderTask {
    #Ns = null;
    static #Bs = /* @__PURE__ */ new WeakSet();
    constructor({ callback: t2, params: e2, objs: i2, commonObjs: s2, annotationCanvasMap: n2, operatorList: a2, pageIndex: r2, canvasFactory: o2, filterFactory: l2, useRequestAnimationFrame: h2 = false, pdfBug: d2 = false, pageColors: c2 = null }) {
      this.callback = t2;
      this.params = e2;
      this.objs = i2;
      this.commonObjs = s2;
      this.annotationCanvasMap = n2;
      this.operatorListIdx = null;
      this.operatorList = a2;
      this._pageIndex = r2;
      this.canvasFactory = o2;
      this.filterFactory = l2;
      this._pdfBug = d2;
      this.pageColors = c2;
      this.running = false;
      this.graphicsReadyCallback = null;
      this.graphicsReady = false;
      this._useRequestAnimationFrame = true === h2 && "undefined" != typeof window;
      this.cancelled = false;
      this.capability = Promise.withResolvers();
      this.task = new RenderTask(this);
      this._cancelBound = this.cancel.bind(this);
      this._continueBound = this._continue.bind(this);
      this._scheduleNextBound = this._scheduleNext.bind(this);
      this._nextBound = this._next.bind(this);
      this._canvas = e2.canvasContext.canvas;
    }
    get completed() {
      return this.capability.promise.catch((function() {
      }));
    }
    initializeGraphics({ transparency: t2 = false, optionalContentConfig: e2 }) {
      if (this.cancelled) return;
      if (this._canvas) {
        if (_InternalRenderTask.#Bs.has(this._canvas)) throw new Error("Cannot use the same canvas during multiple render() operations. Use different canvas or ensure previous operations were cancelled or completed.");
        _InternalRenderTask.#Bs.add(this._canvas);
      }
      if (this._pdfBug && globalThis.StepperManager?.enabled) {
        this.stepper = globalThis.StepperManager.create(this._pageIndex);
        this.stepper.init(this.operatorList);
        this.stepper.nextBreakPoint = this.stepper.getNextBreakPoint();
      }
      const { canvasContext: i2, viewport: s2, transform: n2, background: a2 } = this.params;
      this.gfx = new CanvasGraphics(i2, this.commonObjs, this.objs, this.canvasFactory, this.filterFactory, { optionalContentConfig: e2 }, this.annotationCanvasMap, this.pageColors);
      this.gfx.beginDrawing({ transform: n2, viewport: s2, transparency: t2, background: a2 });
      this.operatorListIdx = 0;
      this.graphicsReady = true;
      this.graphicsReadyCallback?.();
    }
    cancel(t2 = null, e2 = 0) {
      this.running = false;
      this.cancelled = true;
      this.gfx?.endDrawing();
      if (this.#Ns) {
        window.cancelAnimationFrame(this.#Ns);
        this.#Ns = null;
      }
      _InternalRenderTask.#Bs.delete(this._canvas);
      this.callback(t2 || new RenderingCancelledException(`Rendering cancelled, page ${this._pageIndex + 1}`, e2));
    }
    operatorListChanged() {
      if (this.graphicsReady) {
        this.stepper?.updateOperatorList(this.operatorList);
        this.running || this._continue();
      } else this.graphicsReadyCallback ||= this._continueBound;
    }
    _continue() {
      this.running = true;
      this.cancelled || (this.task.onContinue ? this.task.onContinue(this._scheduleNextBound) : this._scheduleNext());
    }
    _scheduleNext() {
      this._useRequestAnimationFrame ? this.#Ns = window.requestAnimationFrame((() => {
        this.#Ns = null;
        this._nextBound().catch(this._cancelBound);
      })) : Promise.resolve().then(this._nextBound).catch(this._cancelBound);
    }
    async _next() {
      if (!this.cancelled) {
        this.operatorListIdx = this.gfx.executeOperatorList(this.operatorList, this.operatorListIdx, this._continueBound, this.stepper);
        if (this.operatorListIdx === this.operatorList.argsArray.length) {
          this.running = false;
          if (this.operatorList.lastChunk) {
            this.gfx.endDrawing();
            _InternalRenderTask.#Bs.delete(this._canvas);
            this.callback();
          }
        }
      }
    }
  };
  var Ot = "4.10.38";
  var Nt = "f9bea397f";
  function makeColorComp(t2) {
    return Math.floor(255 * Math.max(0, Math.min(1, t2))).toString(16).padStart(2, "0");
  }
  function scaleAndClamp(t2) {
    return Math.max(0, Math.min(255, 255 * t2));
  }
  var ColorConverters = class {
    static CMYK_G([t2, e2, i2, s2]) {
      return ["G", 1 - Math.min(1, 0.3 * t2 + 0.59 * i2 + 0.11 * e2 + s2)];
    }
    static G_CMYK([t2]) {
      return ["CMYK", 0, 0, 0, 1 - t2];
    }
    static G_RGB([t2]) {
      return ["RGB", t2, t2, t2];
    }
    static G_rgb([t2]) {
      return [t2 = scaleAndClamp(t2), t2, t2];
    }
    static G_HTML([t2]) {
      const e2 = makeColorComp(t2);
      return `#${e2}${e2}${e2}`;
    }
    static RGB_G([t2, e2, i2]) {
      return ["G", 0.3 * t2 + 0.59 * e2 + 0.11 * i2];
    }
    static RGB_rgb(t2) {
      return t2.map(scaleAndClamp);
    }
    static RGB_HTML(t2) {
      return `#${t2.map(makeColorComp).join("")}`;
    }
    static T_HTML() {
      return "#00000000";
    }
    static T_rgb() {
      return [null];
    }
    static CMYK_RGB([t2, e2, i2, s2]) {
      return ["RGB", 1 - Math.min(1, t2 + s2), 1 - Math.min(1, i2 + s2), 1 - Math.min(1, e2 + s2)];
    }
    static CMYK_rgb([t2, e2, i2, s2]) {
      return [scaleAndClamp(1 - Math.min(1, t2 + s2)), scaleAndClamp(1 - Math.min(1, i2 + s2)), scaleAndClamp(1 - Math.min(1, e2 + s2))];
    }
    static CMYK_HTML(t2) {
      const e2 = this.CMYK_RGB(t2).slice(1);
      return this.RGB_HTML(e2);
    }
    static RGB_CMYK([t2, e2, i2]) {
      const s2 = 1 - t2, n2 = 1 - e2, a2 = 1 - i2;
      return ["CMYK", s2, n2, a2, Math.min(s2, n2, a2)];
    }
  };
  var BaseSVGFactory = class {
    create(t2, e2, i2 = false) {
      if (t2 <= 0 || e2 <= 0) throw new Error("Invalid SVG dimensions");
      const s2 = this._createSVG("svg:svg");
      s2.setAttribute("version", "1.1");
      if (!i2) {
        s2.setAttribute("width", `${t2}px`);
        s2.setAttribute("height", `${e2}px`);
      }
      s2.setAttribute("preserveAspectRatio", "none");
      s2.setAttribute("viewBox", `0 0 ${t2} ${e2}`);
      return s2;
    }
    createElement(t2) {
      if ("string" != typeof t2) throw new Error("Invalid SVG element type");
      return this._createSVG(t2);
    }
    _createSVG(t2) {
      unreachable("Abstract method `_createSVG` called.");
    }
  };
  var DOMSVGFactory = class extends BaseSVGFactory {
    _createSVG(t2) {
      return document.createElementNS(it, t2);
    }
  };
  var XfaLayer = class {
    static setupStorage(t2, e2, i2, s2, n2) {
      const a2 = s2.getValue(e2, { value: null });
      switch (i2.name) {
        case "textarea":
          null !== a2.value && (t2.textContent = a2.value);
          if ("print" === n2) break;
          t2.addEventListener("input", ((t3) => {
            s2.setValue(e2, { value: t3.target.value });
          }));
          break;
        case "input":
          if ("radio" === i2.attributes.type || "checkbox" === i2.attributes.type) {
            a2.value === i2.attributes.xfaOn ? t2.setAttribute("checked", true) : a2.value === i2.attributes.xfaOff && t2.removeAttribute("checked");
            if ("print" === n2) break;
            t2.addEventListener("change", ((t3) => {
              s2.setValue(e2, { value: t3.target.checked ? t3.target.getAttribute("xfaOn") : t3.target.getAttribute("xfaOff") });
            }));
          } else {
            null !== a2.value && t2.setAttribute("value", a2.value);
            if ("print" === n2) break;
            t2.addEventListener("input", ((t3) => {
              s2.setValue(e2, { value: t3.target.value });
            }));
          }
          break;
        case "select":
          if (null !== a2.value) {
            t2.setAttribute("value", a2.value);
            for (const t3 of i2.children) t3.attributes.value === a2.value ? t3.attributes.selected = true : t3.attributes.hasOwnProperty("selected") && delete t3.attributes.selected;
          }
          t2.addEventListener("input", ((t3) => {
            const i3 = t3.target.options, n3 = -1 === i3.selectedIndex ? "" : i3[i3.selectedIndex].value;
            s2.setValue(e2, { value: n3 });
          }));
      }
    }
    static setAttributes({ html: t2, element: e2, storage: i2 = null, intent: s2, linkService: n2 }) {
      const { attributes: a2 } = e2, r2 = t2 instanceof HTMLAnchorElement;
      "radio" === a2.type && (a2.name = `${a2.name}-${s2}`);
      for (const [e3, i3] of Object.entries(a2)) if (null != i3) switch (e3) {
        case "class":
          i3.length && t2.setAttribute(e3, i3.join(" "));
          break;
        case "dataId":
          break;
        case "id":
          t2.setAttribute("data-element-id", i3);
          break;
        case "style":
          Object.assign(t2.style, i3);
          break;
        case "textContent":
          t2.textContent = i3;
          break;
        default:
          (!r2 || "href" !== e3 && "newWindow" !== e3) && t2.setAttribute(e3, i3);
      }
      r2 && n2.addLinkAttributes(t2, a2.href, a2.newWindow);
      i2 && a2.dataId && this.setupStorage(t2, a2.dataId, e2, i2);
    }
    static render(t2) {
      const e2 = t2.annotationStorage, i2 = t2.linkService, s2 = t2.xfaHtml, n2 = t2.intent || "display", a2 = document.createElement(s2.name);
      s2.attributes && this.setAttributes({ html: a2, element: s2, intent: n2, linkService: i2 });
      const r2 = "richText" !== n2, o2 = t2.div;
      o2.append(a2);
      if (t2.viewport) {
        const e3 = `matrix(${t2.viewport.transform.join(",")})`;
        o2.style.transform = e3;
      }
      r2 && o2.setAttribute("class", "xfaLayer xfaFont");
      const l2 = [];
      if (0 === s2.children.length) {
        if (s2.value) {
          const t3 = document.createTextNode(s2.value);
          a2.append(t3);
          r2 && XfaText.shouldBuildText(s2.name) && l2.push(t3);
        }
        return { textDivs: l2 };
      }
      const h2 = [[s2, -1, a2]];
      for (; h2.length > 0; ) {
        const [t3, s3, a3] = h2.at(-1);
        if (s3 + 1 === t3.children.length) {
          h2.pop();
          continue;
        }
        const o3 = t3.children[++h2.at(-1)[1]];
        if (null === o3) continue;
        const { name: d2 } = o3;
        if ("#text" === d2) {
          const t4 = document.createTextNode(o3.value);
          l2.push(t4);
          a3.append(t4);
          continue;
        }
        const c2 = o3?.attributes?.xmlns ? document.createElementNS(o3.attributes.xmlns, d2) : document.createElement(d2);
        a3.append(c2);
        o3.attributes && this.setAttributes({ html: c2, element: o3, storage: e2, intent: n2, linkService: i2 });
        if (o3.children?.length > 0) h2.push([o3, -1, c2]);
        else if (o3.value) {
          const t4 = document.createTextNode(o3.value);
          r2 && XfaText.shouldBuildText(d2) && l2.push(t4);
          c2.append(t4);
        }
      }
      for (const t3 of o2.querySelectorAll(".xfaNonInteractive input, .xfaNonInteractive textarea")) t3.setAttribute("readOnly", true);
      return { textDivs: l2 };
    }
    static update(t2) {
      const e2 = `matrix(${t2.viewport.transform.join(",")})`;
      t2.div.style.transform = e2;
      t2.div.hidden = false;
    }
  };
  var Bt = 1e3;
  var Ht = /* @__PURE__ */ new WeakSet();
  function getRectDims(t2) {
    return { width: t2[2] - t2[0], height: t2[3] - t2[1] };
  }
  var AnnotationElementFactory = class {
    static create(t2) {
      switch (t2.data.annotationType) {
        case S:
          return new LinkAnnotationElement(t2);
        case E:
          return new TextAnnotationElement(t2);
        case U:
          switch (t2.data.fieldType) {
            case "Tx":
              return new TextWidgetAnnotationElement(t2);
            case "Btn":
              return t2.data.radioButton ? new RadioButtonWidgetAnnotationElement(t2) : t2.data.checkBox ? new CheckboxWidgetAnnotationElement(t2) : new PushButtonWidgetAnnotationElement(t2);
            case "Ch":
              return new ChoiceWidgetAnnotationElement(t2);
            case "Sig":
              return new SignatureWidgetAnnotationElement(t2);
          }
          return new WidgetAnnotationElement(t2);
        case H2:
          return new PopupAnnotationElement(t2);
        case C:
          return new FreeTextAnnotationElement(t2);
        case T:
          return new LineAnnotationElement(t2);
        case M:
          return new SquareAnnotationElement(t2);
        case P:
          return new CircleAnnotationElement(t2);
        case k:
          return new PolylineAnnotationElement(t2);
        case N:
          return new CaretAnnotationElement(t2);
        case B:
          return new InkAnnotationElement(t2);
        case D:
          return new PolygonAnnotationElement(t2);
        case R:
          return new HighlightAnnotationElement(t2);
        case I:
          return new UnderlineAnnotationElement(t2);
        case F:
          return new SquigglyAnnotationElement(t2);
        case L:
          return new StrikeOutAnnotationElement(t2);
        case O:
          return new StampAnnotationElement(t2);
        case z:
          return new FileAttachmentAnnotationElement(t2);
        default:
          return new AnnotationElement(t2);
      }
    }
  };
  var AnnotationElement = class _AnnotationElement {
    #Hs = null;
    #zs = false;
    #Us = null;
    constructor(t2, { isRenderable: e2 = false, ignoreBorder: i2 = false, createQuadrilaterals: s2 = false } = {}) {
      this.isRenderable = e2;
      this.data = t2.data;
      this.layer = t2.layer;
      this.linkService = t2.linkService;
      this.downloadManager = t2.downloadManager;
      this.imageResourcesPath = t2.imageResourcesPath;
      this.renderForms = t2.renderForms;
      this.svgFactory = t2.svgFactory;
      this.annotationStorage = t2.annotationStorage;
      this.enableScripting = t2.enableScripting;
      this.hasJSActions = t2.hasJSActions;
      this._fieldObjects = t2.fieldObjects;
      this.parent = t2.parent;
      e2 && (this.container = this._createContainer(i2));
      s2 && this._createQuadrilaterals();
    }
    static _hasPopupData({ titleObj: t2, contentsObj: e2, richText: i2 }) {
      return !!(t2?.str || e2?.str || i2?.str);
    }
    get _isEditable() {
      return this.data.isEditable;
    }
    get hasPopupData() {
      return _AnnotationElement._hasPopupData(this.data);
    }
    updateEdited(t2) {
      if (!this.container) return;
      this.#Hs ||= { rect: this.data.rect.slice(0) };
      const { rect: e2 } = t2;
      e2 && this.#Gs(e2);
      this.#Us?.popup.updateEdited(t2);
    }
    resetEdited() {
      if (this.#Hs) {
        this.#Gs(this.#Hs.rect);
        this.#Us?.popup.resetEdited();
        this.#Hs = null;
      }
    }
    #Gs(t2) {
      const { container: { style: e2 }, data: { rect: i2, rotation: s2 }, parent: { viewport: { rawDims: { pageWidth: n2, pageHeight: a2, pageX: r2, pageY: o2 } } } } = this;
      i2?.splice(0, 4, ...t2);
      const { width: l2, height: h2 } = getRectDims(t2);
      e2.left = 100 * (t2[0] - r2) / n2 + "%";
      e2.top = 100 * (a2 - t2[3] + o2) / a2 + "%";
      if (0 === s2) {
        e2.width = 100 * l2 / n2 + "%";
        e2.height = 100 * h2 / a2 + "%";
      } else this.setRotation(s2);
    }
    _createContainer(t2) {
      const { data: e2, parent: { page: i2, viewport: s2 } } = this, n2 = document.createElement("section");
      n2.setAttribute("data-annotation-id", e2.id);
      this instanceof WidgetAnnotationElement || (n2.tabIndex = Bt);
      const { style: a2 } = n2;
      a2.zIndex = this.parent.zIndex++;
      e2.alternativeText && (n2.title = e2.alternativeText);
      e2.noRotate && n2.classList.add("norotate");
      if (!e2.rect || this instanceof PopupAnnotationElement) {
        const { rotation: t3 } = e2;
        e2.hasOwnCanvas || 0 === t3 || this.setRotation(t3, n2);
        return n2;
      }
      const { width: r2, height: o2 } = getRectDims(e2.rect);
      if (!t2 && e2.borderStyle.width > 0) {
        a2.borderWidth = `${e2.borderStyle.width}px`;
        const t3 = e2.borderStyle.horizontalCornerRadius, i3 = e2.borderStyle.verticalCornerRadius;
        if (t3 > 0 || i3 > 0) {
          const e3 = `calc(${t3}px * var(--scale-factor)) / calc(${i3}px * var(--scale-factor))`;
          a2.borderRadius = e3;
        } else if (this instanceof RadioButtonWidgetAnnotationElement) {
          const t4 = `calc(${r2}px * var(--scale-factor)) / calc(${o2}px * var(--scale-factor))`;
          a2.borderRadius = t4;
        }
        switch (e2.borderStyle.style) {
          case G:
            a2.borderStyle = "solid";
            break;
          case $:
            a2.borderStyle = "dashed";
            break;
          case V:
            warn("Unimplemented border style: beveled");
            break;
          case j:
            warn("Unimplemented border style: inset");
            break;
          case W:
            a2.borderBottomStyle = "solid";
        }
        const s3 = e2.borderColor || null;
        if (s3) {
          this.#zs = true;
          a2.borderColor = Util.makeHexColor(0 | s3[0], 0 | s3[1], 0 | s3[2]);
        } else a2.borderWidth = 0;
      }
      const l2 = Util.normalizeRect([e2.rect[0], i2.view[3] - e2.rect[1] + i2.view[1], e2.rect[2], i2.view[3] - e2.rect[3] + i2.view[1]]), { pageWidth: h2, pageHeight: d2, pageX: c2, pageY: u2 } = s2.rawDims;
      a2.left = 100 * (l2[0] - c2) / h2 + "%";
      a2.top = 100 * (l2[1] - u2) / d2 + "%";
      const { rotation: p2 } = e2;
      if (e2.hasOwnCanvas || 0 === p2) {
        a2.width = 100 * r2 / h2 + "%";
        a2.height = 100 * o2 / d2 + "%";
      } else this.setRotation(p2, n2);
      return n2;
    }
    setRotation(t2, e2 = this.container) {
      if (!this.data.rect) return;
      const { pageWidth: i2, pageHeight: s2 } = this.parent.viewport.rawDims, { width: n2, height: a2 } = getRectDims(this.data.rect);
      let r2, o2;
      if (t2 % 180 == 0) {
        r2 = 100 * n2 / i2;
        o2 = 100 * a2 / s2;
      } else {
        r2 = 100 * a2 / i2;
        o2 = 100 * n2 / s2;
      }
      e2.style.width = `${r2}%`;
      e2.style.height = `${o2}%`;
      e2.setAttribute("data-main-rotation", (360 - t2) % 360);
    }
    get _commonActions() {
      const setColor = (t2, e2, i2) => {
        const s2 = i2.detail[t2], n2 = s2[0], a2 = s2.slice(1);
        i2.target.style[e2] = ColorConverters[`${n2}_HTML`](a2);
        this.annotationStorage.setValue(this.data.id, { [e2]: ColorConverters[`${n2}_rgb`](a2) });
      };
      return shadow(this, "_commonActions", { display: (t2) => {
        const { display: e2 } = t2.detail, i2 = e2 % 2 == 1;
        this.container.style.visibility = i2 ? "hidden" : "visible";
        this.annotationStorage.setValue(this.data.id, { noView: i2, noPrint: 1 === e2 || 2 === e2 });
      }, print: (t2) => {
        this.annotationStorage.setValue(this.data.id, { noPrint: !t2.detail.print });
      }, hidden: (t2) => {
        const { hidden: e2 } = t2.detail;
        this.container.style.visibility = e2 ? "hidden" : "visible";
        this.annotationStorage.setValue(this.data.id, { noPrint: e2, noView: e2 });
      }, focus: (t2) => {
        setTimeout((() => t2.target.focus({ preventScroll: false })), 0);
      }, userName: (t2) => {
        t2.target.title = t2.detail.userName;
      }, readonly: (t2) => {
        t2.target.disabled = t2.detail.readonly;
      }, required: (t2) => {
        this._setRequired(t2.target, t2.detail.required);
      }, bgColor: (t2) => {
        setColor("bgColor", "backgroundColor", t2);
      }, fillColor: (t2) => {
        setColor("fillColor", "backgroundColor", t2);
      }, fgColor: (t2) => {
        setColor("fgColor", "color", t2);
      }, textColor: (t2) => {
        setColor("textColor", "color", t2);
      }, borderColor: (t2) => {
        setColor("borderColor", "borderColor", t2);
      }, strokeColor: (t2) => {
        setColor("strokeColor", "borderColor", t2);
      }, rotation: (t2) => {
        const e2 = t2.detail.rotation;
        this.setRotation(e2);
        this.annotationStorage.setValue(this.data.id, { rotation: e2 });
      } });
    }
    _dispatchEventFromSandbox(t2, e2) {
      const i2 = this._commonActions;
      for (const s2 of Object.keys(e2.detail)) {
        const n2 = t2[s2] || i2[s2];
        n2?.(e2);
      }
    }
    _setDefaultPropertiesFromJS(t2) {
      if (!this.enableScripting) return;
      const e2 = this.annotationStorage.getRawValue(this.data.id);
      if (!e2) return;
      const i2 = this._commonActions;
      for (const [s2, n2] of Object.entries(e2)) {
        const a2 = i2[s2];
        if (a2) {
          a2({ detail: { [s2]: n2 }, target: t2 });
          delete e2[s2];
        }
      }
    }
    _createQuadrilaterals() {
      if (!this.container) return;
      const { quadPoints: t2 } = this.data;
      if (!t2) return;
      const [e2, i2, s2, n2] = this.data.rect.map(((t3) => Math.fround(t3)));
      if (8 === t2.length) {
        const [a3, r3, o3, l3] = t2.subarray(2, 6);
        if (s2 === a3 && n2 === r3 && e2 === o3 && i2 === l3) return;
      }
      const { style: a2 } = this.container;
      let r2;
      if (this.#zs) {
        const { borderColor: t3, borderWidth: e3 } = a2;
        a2.borderWidth = 0;
        r2 = ["url('data:image/svg+xml;utf8,", '<svg xmlns="http://www.w3.org/2000/svg"', ' preserveAspectRatio="none" viewBox="0 0 1 1">', `<g fill="transparent" stroke="${t3}" stroke-width="${e3}">`];
        this.container.classList.add("hasBorder");
      }
      const o2 = s2 - e2, l2 = n2 - i2, { svgFactory: h2 } = this, d2 = h2.createElement("svg");
      d2.classList.add("quadrilateralsContainer");
      d2.setAttribute("width", 0);
      d2.setAttribute("height", 0);
      const c2 = h2.createElement("defs");
      d2.append(c2);
      const u2 = h2.createElement("clipPath"), p2 = `clippath_${this.data.id}`;
      u2.setAttribute("id", p2);
      u2.setAttribute("clipPathUnits", "objectBoundingBox");
      c2.append(u2);
      for (let i3 = 2, s3 = t2.length; i3 < s3; i3 += 8) {
        const s4 = t2[i3], a3 = t2[i3 + 1], d3 = t2[i3 + 2], c3 = t2[i3 + 3], p3 = h2.createElement("rect"), g2 = (d3 - e2) / o2, m2 = (n2 - a3) / l2, f2 = (s4 - d3) / o2, b2 = (a3 - c3) / l2;
        p3.setAttribute("x", g2);
        p3.setAttribute("y", m2);
        p3.setAttribute("width", f2);
        p3.setAttribute("height", b2);
        u2.append(p3);
        r2?.push(`<rect vector-effect="non-scaling-stroke" x="${g2}" y="${m2}" width="${f2}" height="${b2}"/>`);
      }
      if (this.#zs) {
        r2.push("</g></svg>')");
        a2.backgroundImage = r2.join("");
      }
      this.container.append(d2);
      this.container.style.clipPath = `url(#${p2})`;
    }
    _createPopup() {
      const { data: t2 } = this, e2 = this.#Us = new PopupAnnotationElement({ data: { color: t2.color, titleObj: t2.titleObj, modificationDate: t2.modificationDate, contentsObj: t2.contentsObj, richText: t2.richText, parentRect: t2.rect, borderStyle: 0, id: `popup_${t2.id}`, rotation: t2.rotation }, parent: this.parent, elements: [this] });
      this.parent.div.append(e2.render());
    }
    render() {
      unreachable("Abstract method `AnnotationElement.render` called");
    }
    _getElementsByName(t2, e2 = null) {
      const i2 = [];
      if (this._fieldObjects) {
        const s2 = this._fieldObjects[t2];
        if (s2) for (const { page: t3, id: n2, exportValues: a2 } of s2) {
          if (-1 === t3) continue;
          if (n2 === e2) continue;
          const s3 = "string" == typeof a2 ? a2 : null, r2 = document.querySelector(`[data-element-id="${n2}"]`);
          !r2 || Ht.has(r2) ? i2.push({ id: n2, exportValue: s3, domElement: r2 }) : warn(`_getElementsByName - element not allowed: ${n2}`);
        }
        return i2;
      }
      for (const s2 of document.getElementsByName(t2)) {
        const { exportValue: t3 } = s2, n2 = s2.getAttribute("data-element-id");
        n2 !== e2 && (Ht.has(s2) && i2.push({ id: n2, exportValue: t3, domElement: s2 }));
      }
      return i2;
    }
    show() {
      this.container && (this.container.hidden = false);
      this.popup?.maybeShow();
    }
    hide() {
      this.container && (this.container.hidden = true);
      this.popup?.forceHide();
    }
    getElementsToTriggerPopup() {
      return this.container;
    }
    addHighlightArea() {
      const t2 = this.getElementsToTriggerPopup();
      if (Array.isArray(t2)) for (const e2 of t2) e2.classList.add("highlightArea");
      else t2.classList.add("highlightArea");
    }
    _editOnDoubleClick() {
      if (!this._isEditable) return;
      const { annotationEditorType: t2, data: { id: e2 } } = this;
      this.container.addEventListener("dblclick", (() => {
        this.linkService.eventBus?.dispatch("switchannotationeditormode", { source: this, mode: t2, editId: e2 });
      }));
    }
  };
  var LinkAnnotationElement = class extends AnnotationElement {
    constructor(t2, e2 = null) {
      super(t2, { isRenderable: true, ignoreBorder: !!e2?.ignoreBorder, createQuadrilaterals: true });
      this.isTooltipOnly = t2.data.isTooltipOnly;
    }
    render() {
      const { data: t2, linkService: e2 } = this, i2 = document.createElement("a");
      i2.setAttribute("data-element-id", t2.id);
      let s2 = false;
      if (t2.url) {
        e2.addLinkAttributes(i2, t2.url, t2.newWindow);
        s2 = true;
      } else if (t2.action) {
        this._bindNamedAction(i2, t2.action);
        s2 = true;
      } else if (t2.attachment) {
        this.#$s(i2, t2.attachment, t2.attachmentDest);
        s2 = true;
      } else if (t2.setOCGState) {
        this.#Vs(i2, t2.setOCGState);
        s2 = true;
      } else if (t2.dest) {
        this._bindLink(i2, t2.dest);
        s2 = true;
      } else {
        if (t2.actions && (t2.actions.Action || t2.actions["Mouse Up"] || t2.actions["Mouse Down"]) && this.enableScripting && this.hasJSActions) {
          this._bindJSAction(i2, t2);
          s2 = true;
        }
        if (t2.resetForm) {
          this._bindResetFormAction(i2, t2.resetForm);
          s2 = true;
        } else if (this.isTooltipOnly && !s2) {
          this._bindLink(i2, "");
          s2 = true;
        }
      }
      this.container.classList.add("linkAnnotation");
      s2 && this.container.append(i2);
      return this.container;
    }
    #js() {
      this.container.setAttribute("data-internal-link", "");
    }
    _bindLink(t2, e2) {
      t2.href = this.linkService.getDestinationHash(e2);
      t2.onclick = () => {
        e2 && this.linkService.goToDestination(e2);
        return false;
      };
      (e2 || "" === e2) && this.#js();
    }
    _bindNamedAction(t2, e2) {
      t2.href = this.linkService.getAnchorUrl("");
      t2.onclick = () => {
        this.linkService.executeNamedAction(e2);
        return false;
      };
      this.#js();
    }
    #$s(t2, e2, i2 = null) {
      t2.href = this.linkService.getAnchorUrl("");
      e2.description && (t2.title = e2.description);
      t2.onclick = () => {
        this.downloadManager?.openOrDownloadData(e2.content, e2.filename, i2);
        return false;
      };
      this.#js();
    }
    #Vs(t2, e2) {
      t2.href = this.linkService.getAnchorUrl("");
      t2.onclick = () => {
        this.linkService.executeSetOCGState(e2);
        return false;
      };
      this.#js();
    }
    _bindJSAction(t2, e2) {
      t2.href = this.linkService.getAnchorUrl("");
      const i2 = /* @__PURE__ */ new Map([["Action", "onclick"], ["Mouse Up", "onmouseup"], ["Mouse Down", "onmousedown"]]);
      for (const s2 of Object.keys(e2.actions)) {
        const n2 = i2.get(s2);
        n2 && (t2[n2] = () => {
          this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: e2.id, name: s2 } });
          return false;
        });
      }
      t2.onclick || (t2.onclick = () => false);
      this.#js();
    }
    _bindResetFormAction(t2, e2) {
      const i2 = t2.onclick;
      i2 || (t2.href = this.linkService.getAnchorUrl(""));
      this.#js();
      if (this._fieldObjects) t2.onclick = () => {
        i2?.();
        const { fields: t3, refs: s2, include: n2 } = e2, a2 = [];
        if (0 !== t3.length || 0 !== s2.length) {
          const e3 = new Set(s2);
          for (const i3 of t3) {
            const t4 = this._fieldObjects[i3] || [];
            for (const { id: i4 } of t4) e3.add(i4);
          }
          for (const t4 of Object.values(this._fieldObjects)) for (const i3 of t4) e3.has(i3.id) === n2 && a2.push(i3);
        } else for (const t4 of Object.values(this._fieldObjects)) a2.push(...t4);
        const r2 = this.annotationStorage, o2 = [];
        for (const t4 of a2) {
          const { id: e3 } = t4;
          o2.push(e3);
          switch (t4.type) {
            case "text": {
              const i4 = t4.defaultValue || "";
              r2.setValue(e3, { value: i4 });
              break;
            }
            case "checkbox":
            case "radiobutton": {
              const i4 = t4.defaultValue === t4.exportValues;
              r2.setValue(e3, { value: i4 });
              break;
            }
            case "combobox":
            case "listbox": {
              const i4 = t4.defaultValue || "";
              r2.setValue(e3, { value: i4 });
              break;
            }
            default:
              continue;
          }
          const i3 = document.querySelector(`[data-element-id="${e3}"]`);
          i3 && (Ht.has(i3) ? i3.dispatchEvent(new Event("resetform")) : warn(`_bindResetFormAction - element not allowed: ${e3}`));
        }
        this.enableScripting && this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: "app", ids: o2, name: "ResetForm" } });
        return false;
      };
      else {
        warn('_bindResetFormAction - "resetForm" action not supported, ensure that the `fieldObjects` parameter is provided.');
        i2 || (t2.onclick = () => false);
      }
    }
  };
  var TextAnnotationElement = class extends AnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: true });
    }
    render() {
      this.container.classList.add("textAnnotation");
      const t2 = document.createElement("img");
      t2.src = this.imageResourcesPath + "annotation-" + this.data.name.toLowerCase() + ".svg";
      t2.setAttribute("data-l10n-id", "pdfjs-text-annotation-type");
      t2.setAttribute("data-l10n-args", JSON.stringify({ type: this.data.name }));
      !this.data.popupRef && this.hasPopupData && this._createPopup();
      this.container.append(t2);
      return this.container;
    }
  };
  var WidgetAnnotationElement = class extends AnnotationElement {
    render() {
      return this.container;
    }
    showElementAndHideCanvas(t2) {
      if (this.data.hasOwnCanvas) {
        "CANVAS" === t2.previousSibling?.nodeName && (t2.previousSibling.hidden = true);
        t2.hidden = false;
      }
    }
    _getKeyModifier(t2) {
      return util_FeatureTest.platform.isMac ? t2.metaKey : t2.ctrlKey;
    }
    _setEventListener(t2, e2, i2, s2, n2) {
      i2.includes("mouse") ? t2.addEventListener(i2, ((t3) => {
        this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: this.data.id, name: s2, value: n2(t3), shift: t3.shiftKey, modifier: this._getKeyModifier(t3) } });
      })) : t2.addEventListener(i2, ((t3) => {
        if ("blur" === i2) {
          if (!e2.focused || !t3.relatedTarget) return;
          e2.focused = false;
        } else if ("focus" === i2) {
          if (e2.focused) return;
          e2.focused = true;
        }
        n2 && this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: this.data.id, name: s2, value: n2(t3) } });
      }));
    }
    _setEventListeners(t2, e2, i2, s2) {
      for (const [n2, a2] of i2) if ("Action" === a2 || this.data.actions?.[a2]) {
        "Focus" !== a2 && "Blur" !== a2 || (e2 ||= { focused: false });
        this._setEventListener(t2, e2, n2, a2, s2);
        "Focus" !== a2 || this.data.actions?.Blur ? "Blur" !== a2 || this.data.actions?.Focus || this._setEventListener(t2, e2, "focus", "Focus", null) : this._setEventListener(t2, e2, "blur", "Blur", null);
      }
    }
    _setBackgroundColor(t2) {
      const e2 = this.data.backgroundColor || null;
      t2.style.backgroundColor = null === e2 ? "transparent" : Util.makeHexColor(e2[0], e2[1], e2[2]);
    }
    _setTextStyle(t2) {
      const e2 = ["left", "center", "right"], { fontColor: i2 } = this.data.defaultAppearanceData, s2 = this.data.defaultAppearanceData.fontSize || 9, a2 = t2.style;
      let r2;
      const roundToOneDecimal = (t3) => Math.round(10 * t3) / 10;
      if (this.data.multiLine) {
        const t3 = Math.abs(this.data.rect[3] - this.data.rect[1] - 2), e3 = t3 / (Math.round(t3 / (n * s2)) || 1);
        r2 = Math.min(s2, roundToOneDecimal(e3 / n));
      } else {
        const t3 = Math.abs(this.data.rect[3] - this.data.rect[1] - 2);
        r2 = Math.min(s2, roundToOneDecimal(t3 / n));
      }
      a2.fontSize = `calc(${r2}px * var(--scale-factor))`;
      a2.color = Util.makeHexColor(i2[0], i2[1], i2[2]);
      null !== this.data.textAlignment && (a2.textAlign = e2[this.data.textAlignment]);
    }
    _setRequired(t2, e2) {
      e2 ? t2.setAttribute("required", true) : t2.removeAttribute("required");
      t2.setAttribute("aria-required", e2);
    }
  };
  var TextWidgetAnnotationElement = class extends WidgetAnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: t2.renderForms || t2.data.hasOwnCanvas || !t2.data.hasAppearance && !!t2.data.fieldValue });
    }
    setPropertyOnSiblings(t2, e2, i2, s2) {
      const n2 = this.annotationStorage;
      for (const a2 of this._getElementsByName(t2.name, t2.id)) {
        a2.domElement && (a2.domElement[e2] = i2);
        n2.setValue(a2.id, { [s2]: i2 });
      }
    }
    render() {
      const t2 = this.annotationStorage, e2 = this.data.id;
      this.container.classList.add("textWidgetAnnotation");
      let i2 = null;
      if (this.renderForms) {
        const s2 = t2.getValue(e2, { value: this.data.fieldValue });
        let n2 = s2.value || "";
        const a2 = t2.getValue(e2, { charLimit: this.data.maxLen }).charLimit;
        a2 && n2.length > a2 && (n2 = n2.slice(0, a2));
        let r2 = s2.formattedValue || this.data.textContent?.join("\n") || null;
        r2 && this.data.comb && (r2 = r2.replaceAll(/\s+/g, ""));
        const o2 = { userValue: n2, formattedValue: r2, lastCommittedValue: null, commitKey: 1, focused: false };
        if (this.data.multiLine) {
          i2 = document.createElement("textarea");
          i2.textContent = r2 ?? n2;
          this.data.doNotScroll && (i2.style.overflowY = "hidden");
        } else {
          i2 = document.createElement("input");
          i2.type = "text";
          i2.setAttribute("value", r2 ?? n2);
          this.data.doNotScroll && (i2.style.overflowX = "hidden");
        }
        this.data.hasOwnCanvas && (i2.hidden = true);
        Ht.add(i2);
        i2.setAttribute("data-element-id", e2);
        i2.disabled = this.data.readOnly;
        i2.name = this.data.fieldName;
        i2.tabIndex = Bt;
        this._setRequired(i2, this.data.required);
        a2 && (i2.maxLength = a2);
        i2.addEventListener("input", ((s3) => {
          t2.setValue(e2, { value: s3.target.value });
          this.setPropertyOnSiblings(i2, "value", s3.target.value, "value");
          o2.formattedValue = null;
        }));
        i2.addEventListener("resetform", ((t3) => {
          const e3 = this.data.defaultFieldValue ?? "";
          i2.value = o2.userValue = e3;
          o2.formattedValue = null;
        }));
        let blurListener = (t3) => {
          const { formattedValue: e3 } = o2;
          null != e3 && (t3.target.value = e3);
          t3.target.scrollLeft = 0;
        };
        if (this.enableScripting && this.hasJSActions) {
          i2.addEventListener("focus", ((t3) => {
            if (o2.focused) return;
            const { target: e3 } = t3;
            o2.userValue && (e3.value = o2.userValue);
            o2.lastCommittedValue = e3.value;
            o2.commitKey = 1;
            this.data.actions?.Focus || (o2.focused = true);
          }));
          i2.addEventListener("updatefromsandbox", ((i3) => {
            this.showElementAndHideCanvas(i3.target);
            const s4 = { value(i4) {
              o2.userValue = i4.detail.value ?? "";
              t2.setValue(e2, { value: o2.userValue.toString() });
              i4.target.value = o2.userValue;
            }, formattedValue(i4) {
              const { formattedValue: s5 } = i4.detail;
              o2.formattedValue = s5;
              null != s5 && i4.target !== document.activeElement && (i4.target.value = s5);
              t2.setValue(e2, { formattedValue: s5 });
            }, selRange(t3) {
              t3.target.setSelectionRange(...t3.detail.selRange);
            }, charLimit: (i4) => {
              const { charLimit: s5 } = i4.detail, { target: n3 } = i4;
              if (0 === s5) {
                n3.removeAttribute("maxLength");
                return;
              }
              n3.setAttribute("maxLength", s5);
              let a3 = o2.userValue;
              if (a3 && !(a3.length <= s5)) {
                a3 = a3.slice(0, s5);
                n3.value = o2.userValue = a3;
                t2.setValue(e2, { value: a3 });
                this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: e2, name: "Keystroke", value: a3, willCommit: true, commitKey: 1, selStart: n3.selectionStart, selEnd: n3.selectionEnd } });
              }
            } };
            this._dispatchEventFromSandbox(s4, i3);
          }));
          i2.addEventListener("keydown", ((t3) => {
            o2.commitKey = 1;
            let i3 = -1;
            "Escape" === t3.key ? i3 = 0 : "Enter" !== t3.key || this.data.multiLine ? "Tab" === t3.key && (o2.commitKey = 3) : i3 = 2;
            if (-1 === i3) return;
            const { value: s4 } = t3.target;
            if (o2.lastCommittedValue !== s4) {
              o2.lastCommittedValue = s4;
              o2.userValue = s4;
              this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: e2, name: "Keystroke", value: s4, willCommit: true, commitKey: i3, selStart: t3.target.selectionStart, selEnd: t3.target.selectionEnd } });
            }
          }));
          const s3 = blurListener;
          blurListener = null;
          i2.addEventListener("blur", ((t3) => {
            if (!o2.focused || !t3.relatedTarget) return;
            this.data.actions?.Blur || (o2.focused = false);
            const { value: i3 } = t3.target;
            o2.userValue = i3;
            o2.lastCommittedValue !== i3 && this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: e2, name: "Keystroke", value: i3, willCommit: true, commitKey: o2.commitKey, selStart: t3.target.selectionStart, selEnd: t3.target.selectionEnd } });
            s3(t3);
          }));
          this.data.actions?.Keystroke && i2.addEventListener("beforeinput", ((t3) => {
            o2.lastCommittedValue = null;
            const { data: i3, target: s4 } = t3, { value: n3, selectionStart: a3, selectionEnd: r3 } = s4;
            let l2 = a3, h2 = r3;
            switch (t3.inputType) {
              case "deleteWordBackward": {
                const t4 = n3.substring(0, a3).match(/\w*[^\w]*$/);
                t4 && (l2 -= t4[0].length);
                break;
              }
              case "deleteWordForward": {
                const t4 = n3.substring(a3).match(/^[^\w]*\w*/);
                t4 && (h2 += t4[0].length);
                break;
              }
              case "deleteContentBackward":
                a3 === r3 && (l2 -= 1);
                break;
              case "deleteContentForward":
                a3 === r3 && (h2 += 1);
            }
            t3.preventDefault();
            this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: e2, name: "Keystroke", value: n3, change: i3 || "", willCommit: false, selStart: l2, selEnd: h2 } });
          }));
          this._setEventListeners(i2, o2, [["focus", "Focus"], ["blur", "Blur"], ["mousedown", "Mouse Down"], ["mouseenter", "Mouse Enter"], ["mouseleave", "Mouse Exit"], ["mouseup", "Mouse Up"]], ((t3) => t3.target.value));
        }
        blurListener && i2.addEventListener("blur", blurListener);
        if (this.data.comb) {
          const t3 = (this.data.rect[2] - this.data.rect[0]) / a2;
          i2.classList.add("comb");
          i2.style.letterSpacing = `calc(${t3}px * var(--scale-factor) - 1ch)`;
        }
      } else {
        i2 = document.createElement("div");
        i2.textContent = this.data.fieldValue;
        i2.style.verticalAlign = "middle";
        i2.style.display = "table-cell";
        this.data.hasOwnCanvas && (i2.hidden = true);
      }
      this._setTextStyle(i2);
      this._setBackgroundColor(i2);
      this._setDefaultPropertiesFromJS(i2);
      this.container.append(i2);
      return this.container;
    }
  };
  var SignatureWidgetAnnotationElement = class extends WidgetAnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: !!t2.data.hasOwnCanvas });
    }
  };
  var CheckboxWidgetAnnotationElement = class extends WidgetAnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: t2.renderForms });
    }
    render() {
      const t2 = this.annotationStorage, e2 = this.data, i2 = e2.id;
      let s2 = t2.getValue(i2, { value: e2.exportValue === e2.fieldValue }).value;
      if ("string" == typeof s2) {
        s2 = "Off" !== s2;
        t2.setValue(i2, { value: s2 });
      }
      this.container.classList.add("buttonWidgetAnnotation", "checkBox");
      const n2 = document.createElement("input");
      Ht.add(n2);
      n2.setAttribute("data-element-id", i2);
      n2.disabled = e2.readOnly;
      this._setRequired(n2, this.data.required);
      n2.type = "checkbox";
      n2.name = e2.fieldName;
      s2 && n2.setAttribute("checked", true);
      n2.setAttribute("exportValue", e2.exportValue);
      n2.tabIndex = Bt;
      n2.addEventListener("change", ((s3) => {
        const { name: n3, checked: a2 } = s3.target;
        for (const s4 of this._getElementsByName(n3, i2)) {
          const i3 = a2 && s4.exportValue === e2.exportValue;
          s4.domElement && (s4.domElement.checked = i3);
          t2.setValue(s4.id, { value: i3 });
        }
        t2.setValue(i2, { value: a2 });
      }));
      n2.addEventListener("resetform", ((t3) => {
        const i3 = e2.defaultFieldValue || "Off";
        t3.target.checked = i3 === e2.exportValue;
      }));
      if (this.enableScripting && this.hasJSActions) {
        n2.addEventListener("updatefromsandbox", ((e3) => {
          const s3 = { value(e4) {
            e4.target.checked = "Off" !== e4.detail.value;
            t2.setValue(i2, { value: e4.target.checked });
          } };
          this._dispatchEventFromSandbox(s3, e3);
        }));
        this._setEventListeners(n2, null, [["change", "Validate"], ["change", "Action"], ["focus", "Focus"], ["blur", "Blur"], ["mousedown", "Mouse Down"], ["mouseenter", "Mouse Enter"], ["mouseleave", "Mouse Exit"], ["mouseup", "Mouse Up"]], ((t3) => t3.target.checked));
      }
      this._setBackgroundColor(n2);
      this._setDefaultPropertiesFromJS(n2);
      this.container.append(n2);
      return this.container;
    }
  };
  var RadioButtonWidgetAnnotationElement = class extends WidgetAnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: t2.renderForms });
    }
    render() {
      this.container.classList.add("buttonWidgetAnnotation", "radioButton");
      const t2 = this.annotationStorage, e2 = this.data, i2 = e2.id;
      let s2 = t2.getValue(i2, { value: e2.fieldValue === e2.buttonValue }).value;
      if ("string" == typeof s2) {
        s2 = s2 !== e2.buttonValue;
        t2.setValue(i2, { value: s2 });
      }
      if (s2) for (const s3 of this._getElementsByName(e2.fieldName, i2)) t2.setValue(s3.id, { value: false });
      const n2 = document.createElement("input");
      Ht.add(n2);
      n2.setAttribute("data-element-id", i2);
      n2.disabled = e2.readOnly;
      this._setRequired(n2, this.data.required);
      n2.type = "radio";
      n2.name = e2.fieldName;
      s2 && n2.setAttribute("checked", true);
      n2.tabIndex = Bt;
      n2.addEventListener("change", ((e3) => {
        const { name: s3, checked: n3 } = e3.target;
        for (const e4 of this._getElementsByName(s3, i2)) t2.setValue(e4.id, { value: false });
        t2.setValue(i2, { value: n3 });
      }));
      n2.addEventListener("resetform", ((t3) => {
        const i3 = e2.defaultFieldValue;
        t3.target.checked = null != i3 && i3 === e2.buttonValue;
      }));
      if (this.enableScripting && this.hasJSActions) {
        const s3 = e2.buttonValue;
        n2.addEventListener("updatefromsandbox", ((e3) => {
          const n3 = { value: (e4) => {
            const n4 = s3 === e4.detail.value;
            for (const s4 of this._getElementsByName(e4.target.name)) {
              const e5 = n4 && s4.id === i2;
              s4.domElement && (s4.domElement.checked = e5);
              t2.setValue(s4.id, { value: e5 });
            }
          } };
          this._dispatchEventFromSandbox(n3, e3);
        }));
        this._setEventListeners(n2, null, [["change", "Validate"], ["change", "Action"], ["focus", "Focus"], ["blur", "Blur"], ["mousedown", "Mouse Down"], ["mouseenter", "Mouse Enter"], ["mouseleave", "Mouse Exit"], ["mouseup", "Mouse Up"]], ((t3) => t3.target.checked));
      }
      this._setBackgroundColor(n2);
      this._setDefaultPropertiesFromJS(n2);
      this.container.append(n2);
      return this.container;
    }
  };
  var PushButtonWidgetAnnotationElement = class extends LinkAnnotationElement {
    constructor(t2) {
      super(t2, { ignoreBorder: t2.data.hasAppearance });
    }
    render() {
      const t2 = super.render();
      t2.classList.add("buttonWidgetAnnotation", "pushButton");
      const e2 = t2.lastChild;
      if (this.enableScripting && this.hasJSActions && e2) {
        this._setDefaultPropertiesFromJS(e2);
        e2.addEventListener("updatefromsandbox", ((t3) => {
          this._dispatchEventFromSandbox({}, t3);
        }));
      }
      return t2;
    }
  };
  var ChoiceWidgetAnnotationElement = class extends WidgetAnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: t2.renderForms });
    }
    render() {
      this.container.classList.add("choiceWidgetAnnotation");
      const t2 = this.annotationStorage, e2 = this.data.id, i2 = t2.getValue(e2, { value: this.data.fieldValue }), s2 = document.createElement("select");
      Ht.add(s2);
      s2.setAttribute("data-element-id", e2);
      s2.disabled = this.data.readOnly;
      this._setRequired(s2, this.data.required);
      s2.name = this.data.fieldName;
      s2.tabIndex = Bt;
      let n2 = this.data.combo && this.data.options.length > 0;
      if (!this.data.combo) {
        s2.size = this.data.options.length;
        this.data.multiSelect && (s2.multiple = true);
      }
      s2.addEventListener("resetform", ((t3) => {
        const e3 = this.data.defaultFieldValue;
        for (const t4 of s2.options) t4.selected = t4.value === e3;
      }));
      for (const t3 of this.data.options) {
        const e3 = document.createElement("option");
        e3.textContent = t3.displayValue;
        e3.value = t3.exportValue;
        if (i2.value.includes(t3.exportValue)) {
          e3.setAttribute("selected", true);
          n2 = false;
        }
        s2.append(e3);
      }
      let a2 = null;
      if (n2) {
        const t3 = document.createElement("option");
        t3.value = " ";
        t3.setAttribute("hidden", true);
        t3.setAttribute("selected", true);
        s2.prepend(t3);
        a2 = () => {
          t3.remove();
          s2.removeEventListener("input", a2);
          a2 = null;
        };
        s2.addEventListener("input", a2);
      }
      const getValue = (t3) => {
        const e3 = t3 ? "value" : "textContent", { options: i3, multiple: n3 } = s2;
        return n3 ? Array.prototype.filter.call(i3, ((t4) => t4.selected)).map(((t4) => t4[e3])) : -1 === i3.selectedIndex ? null : i3[i3.selectedIndex][e3];
      };
      let r2 = getValue(false);
      const getItems = (t3) => {
        const e3 = t3.target.options;
        return Array.prototype.map.call(e3, ((t4) => ({ displayValue: t4.textContent, exportValue: t4.value })));
      };
      if (this.enableScripting && this.hasJSActions) {
        s2.addEventListener("updatefromsandbox", ((i3) => {
          const n3 = { value(i4) {
            a2?.();
            const n4 = i4.detail.value, o2 = new Set(Array.isArray(n4) ? n4 : [n4]);
            for (const t3 of s2.options) t3.selected = o2.has(t3.value);
            t2.setValue(e2, { value: getValue(true) });
            r2 = getValue(false);
          }, multipleSelection(t3) {
            s2.multiple = true;
          }, remove(i4) {
            const n4 = s2.options, a3 = i4.detail.remove;
            n4[a3].selected = false;
            s2.remove(a3);
            if (n4.length > 0) {
              -1 === Array.prototype.findIndex.call(n4, ((t3) => t3.selected)) && (n4[0].selected = true);
            }
            t2.setValue(e2, { value: getValue(true), items: getItems(i4) });
            r2 = getValue(false);
          }, clear(i4) {
            for (; 0 !== s2.length; ) s2.remove(0);
            t2.setValue(e2, { value: null, items: [] });
            r2 = getValue(false);
          }, insert(i4) {
            const { index: n4, displayValue: a3, exportValue: o2 } = i4.detail.insert, l2 = s2.children[n4], h2 = document.createElement("option");
            h2.textContent = a3;
            h2.value = o2;
            l2 ? l2.before(h2) : s2.append(h2);
            t2.setValue(e2, { value: getValue(true), items: getItems(i4) });
            r2 = getValue(false);
          }, items(i4) {
            const { items: n4 } = i4.detail;
            for (; 0 !== s2.length; ) s2.remove(0);
            for (const t3 of n4) {
              const { displayValue: e3, exportValue: i5 } = t3, n5 = document.createElement("option");
              n5.textContent = e3;
              n5.value = i5;
              s2.append(n5);
            }
            s2.options.length > 0 && (s2.options[0].selected = true);
            t2.setValue(e2, { value: getValue(true), items: getItems(i4) });
            r2 = getValue(false);
          }, indices(i4) {
            const s3 = new Set(i4.detail.indices);
            for (const t3 of i4.target.options) t3.selected = s3.has(t3.index);
            t2.setValue(e2, { value: getValue(true) });
            r2 = getValue(false);
          }, editable(t3) {
            t3.target.disabled = !t3.detail.editable;
          } };
          this._dispatchEventFromSandbox(n3, i3);
        }));
        s2.addEventListener("input", ((i3) => {
          const s3 = getValue(true), n3 = getValue(false);
          t2.setValue(e2, { value: s3 });
          i3.preventDefault();
          this.linkService.eventBus?.dispatch("dispatcheventinsandbox", { source: this, detail: { id: e2, name: "Keystroke", value: r2, change: n3, changeEx: s3, willCommit: false, commitKey: 1, keyDown: false } });
        }));
        this._setEventListeners(s2, null, [["focus", "Focus"], ["blur", "Blur"], ["mousedown", "Mouse Down"], ["mouseenter", "Mouse Enter"], ["mouseleave", "Mouse Exit"], ["mouseup", "Mouse Up"], ["input", "Action"], ["input", "Validate"]], ((t3) => t3.target.value));
      } else s2.addEventListener("input", (function(i3) {
        t2.setValue(e2, { value: getValue(true) });
      }));
      this.data.combo && this._setTextStyle(s2);
      this._setBackgroundColor(s2);
      this._setDefaultPropertiesFromJS(s2);
      this.container.append(s2);
      return this.container;
    }
  };
  var PopupAnnotationElement = class extends AnnotationElement {
    constructor(t2) {
      const { data: e2, elements: i2 } = t2;
      super(t2, { isRenderable: AnnotationElement._hasPopupData(e2) });
      this.elements = i2;
      this.popup = null;
    }
    render() {
      this.container.classList.add("popupAnnotation");
      const t2 = this.popup = new PopupElement({ container: this.container, color: this.data.color, titleObj: this.data.titleObj, modificationDate: this.data.modificationDate, contentsObj: this.data.contentsObj, richText: this.data.richText, rect: this.data.rect, parentRect: this.data.parentRect || null, parent: this.parent, elements: this.elements, open: this.data.open }), e2 = [];
      for (const i2 of this.elements) {
        i2.popup = t2;
        i2.container.ariaHasPopup = "dialog";
        e2.push(i2.data.id);
        i2.addHighlightArea();
      }
      this.container.setAttribute("aria-controls", e2.map(((t3) => `${et}${t3}`)).join(","));
      return this.container;
    }
  };
  var PopupElement = class {
    #Ws = this.#qs.bind(this);
    #Xs = this.#Ks.bind(this);
    #Ys = this.#Qs.bind(this);
    #Js = this.#Zs.bind(this);
    #tn = null;
    #pt = null;
    #en = null;
    #in = null;
    #sn = null;
    #nn = null;
    #an = null;
    #rn = false;
    #on = null;
    #C = null;
    #ln = null;
    #hn = null;
    #dn = null;
    #Hs = null;
    #cn = false;
    constructor({ container: t2, color: e2, elements: i2, titleObj: s2, modificationDate: n2, contentsObj: a2, richText: r2, parent: o2, rect: l2, parentRect: h2, open: d2 }) {
      this.#pt = t2;
      this.#dn = s2;
      this.#en = a2;
      this.#hn = r2;
      this.#nn = o2;
      this.#tn = e2;
      this.#ln = l2;
      this.#an = h2;
      this.#sn = i2;
      this.#in = PDFDateString.toDateObject(n2);
      this.trigger = i2.flatMap(((t3) => t3.getElementsToTriggerPopup()));
      for (const t3 of this.trigger) {
        t3.addEventListener("click", this.#Js);
        t3.addEventListener("mouseenter", this.#Ys);
        t3.addEventListener("mouseleave", this.#Xs);
        t3.classList.add("popupTriggerArea");
      }
      for (const t3 of i2) t3.container?.addEventListener("keydown", this.#Ws);
      this.#pt.hidden = true;
      d2 && this.#Zs();
    }
    render() {
      if (this.#on) return;
      const t2 = this.#on = document.createElement("div");
      t2.className = "popup";
      if (this.#tn) {
        const e3 = t2.style.outlineColor = Util.makeHexColor(...this.#tn);
        if (CSS.supports("background-color", "color-mix(in srgb, red 30%, white)")) t2.style.backgroundColor = `color-mix(in srgb, ${e3} 30%, white)`;
        else {
          const e4 = 0.7;
          t2.style.backgroundColor = Util.makeHexColor(...this.#tn.map(((t3) => Math.floor(e4 * (255 - t3) + t3))));
        }
      }
      const e2 = document.createElement("span");
      e2.className = "header";
      const i2 = document.createElement("h1");
      e2.append(i2);
      ({ dir: i2.dir, str: i2.textContent } = this.#dn);
      t2.append(e2);
      if (this.#in) {
        const t3 = document.createElement("span");
        t3.classList.add("popupDate");
        t3.setAttribute("data-l10n-id", "pdfjs-annotation-date-time-string");
        t3.setAttribute("data-l10n-args", JSON.stringify({ dateObj: this.#in.valueOf() }));
        e2.append(t3);
      }
      const s2 = this.#un;
      if (s2) {
        XfaLayer.render({ xfaHtml: s2, intent: "richText", div: t2 });
        t2.lastChild.classList.add("richText", "popupContent");
      } else {
        const e3 = this._formatContents(this.#en);
        t2.append(e3);
      }
      this.#pt.append(t2);
    }
    get #un() {
      const t2 = this.#hn, e2 = this.#en;
      return !t2?.str || e2?.str && e2.str !== t2.str ? null : this.#hn.html || null;
    }
    get #pn() {
      return this.#un?.attributes?.style?.fontSize || 0;
    }
    get #gn() {
      return this.#un?.attributes?.style?.color || null;
    }
    #mn(t2) {
      const e2 = [], i2 = { str: t2, html: { name: "div", attributes: { dir: "auto" }, children: [{ name: "p", children: e2 }] } }, s2 = { style: { color: this.#gn, fontSize: this.#pn ? `calc(${this.#pn}px * var(--scale-factor))` : "" } };
      for (const i3 of t2.split("\n")) e2.push({ name: "span", value: i3, attributes: s2 });
      return i2;
    }
    _formatContents({ str: t2, dir: e2 }) {
      const i2 = document.createElement("p");
      i2.classList.add("popupContent");
      i2.dir = e2;
      const s2 = t2.split(/(?:\r\n?|\n)/);
      for (let t3 = 0, e3 = s2.length; t3 < e3; ++t3) {
        const n2 = s2[t3];
        i2.append(document.createTextNode(n2));
        t3 < e3 - 1 && i2.append(document.createElement("br"));
      }
      return i2;
    }
    #qs(t2) {
      t2.altKey || t2.shiftKey || t2.ctrlKey || t2.metaKey || ("Enter" === t2.key || "Escape" === t2.key && this.#rn) && this.#Zs();
    }
    updateEdited({ rect: t2, popupContent: e2 }) {
      this.#Hs ||= { contentsObj: this.#en, richText: this.#hn };
      t2 && (this.#C = null);
      if (e2) {
        this.#hn = this.#mn(e2);
        this.#en = null;
      }
      this.#on?.remove();
      this.#on = null;
    }
    resetEdited() {
      if (this.#Hs) {
        ({ contentsObj: this.#en, richText: this.#hn } = this.#Hs);
        this.#Hs = null;
        this.#on?.remove();
        this.#on = null;
        this.#C = null;
      }
    }
    #fn() {
      if (null !== this.#C) return;
      const { page: { view: t2 }, viewport: { rawDims: { pageWidth: e2, pageHeight: i2, pageX: s2, pageY: n2 } } } = this.#nn;
      let a2 = !!this.#an, r2 = a2 ? this.#an : this.#ln;
      for (const t3 of this.#sn) if (!r2 || null !== Util.intersect(t3.data.rect, r2)) {
        r2 = t3.data.rect;
        a2 = true;
        break;
      }
      const o2 = Util.normalizeRect([r2[0], t2[3] - r2[1] + t2[1], r2[2], t2[3] - r2[3] + t2[1]]), l2 = a2 ? r2[2] - r2[0] + 5 : 0, h2 = o2[0] + l2, d2 = o2[1];
      this.#C = [100 * (h2 - s2) / e2, 100 * (d2 - n2) / i2];
      const { style: c2 } = this.#pt;
      c2.left = `${this.#C[0]}%`;
      c2.top = `${this.#C[1]}%`;
    }
    #Zs() {
      this.#rn = !this.#rn;
      if (this.#rn) {
        this.#Qs();
        this.#pt.addEventListener("click", this.#Js);
        this.#pt.addEventListener("keydown", this.#Ws);
      } else {
        this.#Ks();
        this.#pt.removeEventListener("click", this.#Js);
        this.#pt.removeEventListener("keydown", this.#Ws);
      }
    }
    #Qs() {
      this.#on || this.render();
      if (this.isVisible) this.#rn && this.#pt.classList.add("focused");
      else {
        this.#fn();
        this.#pt.hidden = false;
        this.#pt.style.zIndex = parseInt(this.#pt.style.zIndex) + 1e3;
      }
    }
    #Ks() {
      this.#pt.classList.remove("focused");
      if (!this.#rn && this.isVisible) {
        this.#pt.hidden = true;
        this.#pt.style.zIndex = parseInt(this.#pt.style.zIndex) - 1e3;
      }
    }
    forceHide() {
      this.#cn = this.isVisible;
      this.#cn && (this.#pt.hidden = true);
    }
    maybeShow() {
      if (this.#cn) {
        this.#on || this.#Qs();
        this.#cn = false;
        this.#pt.hidden = false;
      }
    }
    get isVisible() {
      return false === this.#pt.hidden;
    }
  };
  var FreeTextAnnotationElement = class extends AnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: true, ignoreBorder: true });
      this.textContent = t2.data.textContent;
      this.textPosition = t2.data.textPosition;
      this.annotationEditorType = g.FREETEXT;
    }
    render() {
      this.container.classList.add("freeTextAnnotation");
      if (this.textContent) {
        const t2 = document.createElement("div");
        t2.classList.add("annotationTextContent");
        t2.setAttribute("role", "comment");
        for (const e2 of this.textContent) {
          const i2 = document.createElement("span");
          i2.textContent = e2;
          t2.append(i2);
        }
        this.container.append(t2);
      }
      !this.data.popupRef && this.hasPopupData && this._createPopup();
      this._editOnDoubleClick();
      return this.container;
    }
  };
  var LineAnnotationElement = class extends AnnotationElement {
    #bn = null;
    constructor(t2) {
      super(t2, { isRenderable: true, ignoreBorder: true });
    }
    render() {
      this.container.classList.add("lineAnnotation");
      const t2 = this.data, { width: e2, height: i2 } = getRectDims(t2.rect), s2 = this.svgFactory.create(e2, i2, true), n2 = this.#bn = this.svgFactory.createElement("svg:line");
      n2.setAttribute("x1", t2.rect[2] - t2.lineCoordinates[0]);
      n2.setAttribute("y1", t2.rect[3] - t2.lineCoordinates[1]);
      n2.setAttribute("x2", t2.rect[2] - t2.lineCoordinates[2]);
      n2.setAttribute("y2", t2.rect[3] - t2.lineCoordinates[3]);
      n2.setAttribute("stroke-width", t2.borderStyle.width || 1);
      n2.setAttribute("stroke", "transparent");
      n2.setAttribute("fill", "transparent");
      s2.append(n2);
      this.container.append(s2);
      !t2.popupRef && this.hasPopupData && this._createPopup();
      return this.container;
    }
    getElementsToTriggerPopup() {
      return this.#bn;
    }
    addHighlightArea() {
      this.container.classList.add("highlightArea");
    }
  };
  var SquareAnnotationElement = class extends AnnotationElement {
    #An = null;
    constructor(t2) {
      super(t2, { isRenderable: true, ignoreBorder: true });
    }
    render() {
      this.container.classList.add("squareAnnotation");
      const t2 = this.data, { width: e2, height: i2 } = getRectDims(t2.rect), s2 = this.svgFactory.create(e2, i2, true), n2 = t2.borderStyle.width, a2 = this.#An = this.svgFactory.createElement("svg:rect");
      a2.setAttribute("x", n2 / 2);
      a2.setAttribute("y", n2 / 2);
      a2.setAttribute("width", e2 - n2);
      a2.setAttribute("height", i2 - n2);
      a2.setAttribute("stroke-width", n2 || 1);
      a2.setAttribute("stroke", "transparent");
      a2.setAttribute("fill", "transparent");
      s2.append(a2);
      this.container.append(s2);
      !t2.popupRef && this.hasPopupData && this._createPopup();
      return this.container;
    }
    getElementsToTriggerPopup() {
      return this.#An;
    }
    addHighlightArea() {
      this.container.classList.add("highlightArea");
    }
  };
  var CircleAnnotationElement = class extends AnnotationElement {
    #wn = null;
    constructor(t2) {
      super(t2, { isRenderable: true, ignoreBorder: true });
    }
    render() {
      this.container.classList.add("circleAnnotation");
      const t2 = this.data, { width: e2, height: i2 } = getRectDims(t2.rect), s2 = this.svgFactory.create(e2, i2, true), n2 = t2.borderStyle.width, a2 = this.#wn = this.svgFactory.createElement("svg:ellipse");
      a2.setAttribute("cx", e2 / 2);
      a2.setAttribute("cy", i2 / 2);
      a2.setAttribute("rx", e2 / 2 - n2 / 2);
      a2.setAttribute("ry", i2 / 2 - n2 / 2);
      a2.setAttribute("stroke-width", n2 || 1);
      a2.setAttribute("stroke", "transparent");
      a2.setAttribute("fill", "transparent");
      s2.append(a2);
      this.container.append(s2);
      !t2.popupRef && this.hasPopupData && this._createPopup();
      return this.container;
    }
    getElementsToTriggerPopup() {
      return this.#wn;
    }
    addHighlightArea() {
      this.container.classList.add("highlightArea");
    }
  };
  var PolylineAnnotationElement = class extends AnnotationElement {
    #vn = null;
    constructor(t2) {
      super(t2, { isRenderable: true, ignoreBorder: true });
      this.containerClassName = "polylineAnnotation";
      this.svgElementName = "svg:polyline";
    }
    render() {
      this.container.classList.add(this.containerClassName);
      const { data: { rect: t2, vertices: e2, borderStyle: i2, popupRef: s2 } } = this;
      if (!e2) return this.container;
      const { width: n2, height: a2 } = getRectDims(t2), r2 = this.svgFactory.create(n2, a2, true);
      let o2 = [];
      for (let i3 = 0, s3 = e2.length; i3 < s3; i3 += 2) {
        const s4 = e2[i3] - t2[0], n3 = t2[3] - e2[i3 + 1];
        o2.push(`${s4},${n3}`);
      }
      o2 = o2.join(" ");
      const l2 = this.#vn = this.svgFactory.createElement(this.svgElementName);
      l2.setAttribute("points", o2);
      l2.setAttribute("stroke-width", i2.width || 1);
      l2.setAttribute("stroke", "transparent");
      l2.setAttribute("fill", "transparent");
      r2.append(l2);
      this.container.append(r2);
      !s2 && this.hasPopupData && this._createPopup();
      return this.container;
    }
    getElementsToTriggerPopup() {
      return this.#vn;
    }
    addHighlightArea() {
      this.container.classList.add("highlightArea");
    }
  };
  var PolygonAnnotationElement = class extends PolylineAnnotationElement {
    constructor(t2) {
      super(t2);
      this.containerClassName = "polygonAnnotation";
      this.svgElementName = "svg:polygon";
    }
  };
  var CaretAnnotationElement = class extends AnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: true, ignoreBorder: true });
    }
    render() {
      this.container.classList.add("caretAnnotation");
      !this.data.popupRef && this.hasPopupData && this._createPopup();
      return this.container;
    }
  };
  var InkAnnotationElement = class extends AnnotationElement {
    #yn = null;
    #xn = [];
    constructor(t2) {
      super(t2, { isRenderable: true, ignoreBorder: true });
      this.containerClassName = "inkAnnotation";
      this.svgElementName = "svg:polyline";
      this.annotationEditorType = "InkHighlight" === this.data.it ? g.HIGHLIGHT : g.INK;
    }
    #_n(t2, e2) {
      switch (t2) {
        case 90:
          return { transform: `rotate(90) translate(${-e2[0]},${e2[1]}) scale(1,-1)`, width: e2[3] - e2[1], height: e2[2] - e2[0] };
        case 180:
          return { transform: `rotate(180) translate(${-e2[2]},${e2[1]}) scale(1,-1)`, width: e2[2] - e2[0], height: e2[3] - e2[1] };
        case 270:
          return { transform: `rotate(270) translate(${-e2[2]},${e2[3]}) scale(1,-1)`, width: e2[3] - e2[1], height: e2[2] - e2[0] };
        default:
          return { transform: `translate(${-e2[0]},${e2[3]}) scale(1,-1)`, width: e2[2] - e2[0], height: e2[3] - e2[1] };
      }
    }
    render() {
      this.container.classList.add(this.containerClassName);
      const { data: { rect: t2, rotation: e2, inkLists: i2, borderStyle: s2, popupRef: n2 } } = this, { transform: a2, width: r2, height: o2 } = this.#_n(e2, t2), l2 = this.svgFactory.create(r2, o2, true), h2 = this.#yn = this.svgFactory.createElement("svg:g");
      l2.append(h2);
      h2.setAttribute("stroke-width", s2.width || 1);
      h2.setAttribute("stroke-linecap", "round");
      h2.setAttribute("stroke-linejoin", "round");
      h2.setAttribute("stroke-miterlimit", 10);
      h2.setAttribute("stroke", "transparent");
      h2.setAttribute("fill", "transparent");
      h2.setAttribute("transform", a2);
      for (let t3 = 0, e3 = i2.length; t3 < e3; t3++) {
        const e4 = this.svgFactory.createElement(this.svgElementName);
        this.#xn.push(e4);
        e4.setAttribute("points", i2[t3].join(","));
        h2.append(e4);
      }
      !n2 && this.hasPopupData && this._createPopup();
      this.container.append(l2);
      this._editOnDoubleClick();
      return this.container;
    }
    updateEdited(t2) {
      super.updateEdited(t2);
      const { thickness: e2, points: i2, rect: s2 } = t2, n2 = this.#yn;
      e2 >= 0 && n2.setAttribute("stroke-width", e2 || 1);
      if (i2) for (let t3 = 0, e3 = this.#xn.length; t3 < e3; t3++) this.#xn[t3].setAttribute("points", i2[t3].join(","));
      if (s2) {
        const { transform: t3, width: e3, height: i3 } = this.#_n(this.data.rotation, s2);
        n2.parentElement.setAttribute("viewBox", `0 0 ${e3} ${i3}`);
        n2.setAttribute("transform", t3);
      }
    }
    getElementsToTriggerPopup() {
      return this.#xn;
    }
    addHighlightArea() {
      this.container.classList.add("highlightArea");
    }
  };
  var HighlightAnnotationElement = class extends AnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: true, ignoreBorder: true, createQuadrilaterals: true });
      this.annotationEditorType = g.HIGHLIGHT;
    }
    render() {
      !this.data.popupRef && this.hasPopupData && this._createPopup();
      this.container.classList.add("highlightAnnotation");
      this._editOnDoubleClick();
      return this.container;
    }
  };
  var UnderlineAnnotationElement = class extends AnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: true, ignoreBorder: true, createQuadrilaterals: true });
    }
    render() {
      !this.data.popupRef && this.hasPopupData && this._createPopup();
      this.container.classList.add("underlineAnnotation");
      return this.container;
    }
  };
  var SquigglyAnnotationElement = class extends AnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: true, ignoreBorder: true, createQuadrilaterals: true });
    }
    render() {
      !this.data.popupRef && this.hasPopupData && this._createPopup();
      this.container.classList.add("squigglyAnnotation");
      return this.container;
    }
  };
  var StrikeOutAnnotationElement = class extends AnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: true, ignoreBorder: true, createQuadrilaterals: true });
    }
    render() {
      !this.data.popupRef && this.hasPopupData && this._createPopup();
      this.container.classList.add("strikeoutAnnotation");
      return this.container;
    }
  };
  var StampAnnotationElement = class extends AnnotationElement {
    constructor(t2) {
      super(t2, { isRenderable: true, ignoreBorder: true });
      this.annotationEditorType = g.STAMP;
    }
    render() {
      this.container.classList.add("stampAnnotation");
      this.container.setAttribute("role", "img");
      !this.data.popupRef && this.hasPopupData && this._createPopup();
      this._editOnDoubleClick();
      return this.container;
    }
  };
  var FileAttachmentAnnotationElement = class extends AnnotationElement {
    #En = null;
    constructor(t2) {
      super(t2, { isRenderable: true });
      const { file: e2 } = this.data;
      this.filename = e2.filename;
      this.content = e2.content;
      this.linkService.eventBus?.dispatch("fileattachmentannotation", { source: this, ...e2 });
    }
    render() {
      this.container.classList.add("fileAttachmentAnnotation");
      const { container: t2, data: e2 } = this;
      let i2;
      if (e2.hasAppearance || 0 === e2.fillAlpha) i2 = document.createElement("div");
      else {
        i2 = document.createElement("img");
        i2.src = `${this.imageResourcesPath}annotation-${/paperclip/i.test(e2.name) ? "paperclip" : "pushpin"}.svg`;
        e2.fillAlpha && e2.fillAlpha < 1 && (i2.style = `filter: opacity(${Math.round(100 * e2.fillAlpha)}%);`);
      }
      i2.addEventListener("dblclick", this.#Sn.bind(this));
      this.#En = i2;
      const { isMac: s2 } = util_FeatureTest.platform;
      t2.addEventListener("keydown", ((t3) => {
        "Enter" === t3.key && (s2 ? t3.metaKey : t3.ctrlKey) && this.#Sn();
      }));
      !e2.popupRef && this.hasPopupData ? this._createPopup() : i2.classList.add("popupTriggerArea");
      t2.append(i2);
      return t2;
    }
    getElementsToTriggerPopup() {
      return this.#En;
    }
    addHighlightArea() {
      this.container.classList.add("highlightArea");
    }
    #Sn() {
      this.downloadManager?.openOrDownloadData(this.content, this.filename);
    }
  };
  var AnnotationLayer = class {
    #Cn = null;
    #Tn = null;
    #Mn = /* @__PURE__ */ new Map();
    #Pn = null;
    constructor({ div: t2, accessibilityManager: e2, annotationCanvasMap: i2, annotationEditorUIManager: s2, page: n2, viewport: a2, structTreeLayer: r2 }) {
      this.div = t2;
      this.#Cn = e2;
      this.#Tn = i2;
      this.#Pn = r2 || null;
      this.page = n2;
      this.viewport = a2;
      this.zIndex = 0;
      this._annotationEditorUIManager = s2;
    }
    hasEditableAnnotations() {
      return this.#Mn.size > 0;
    }
    async #Dn(t2, e2) {
      const i2 = t2.firstChild || t2, s2 = i2.id = `${et}${e2}`, n2 = await this.#Pn?.getAriaAttributes(s2);
      if (n2) for (const [t3, e3] of n2) i2.setAttribute(t3, e3);
      this.div.append(t2);
      this.#Cn?.moveElementInDOM(this.div, t2, i2, false);
    }
    async render(t2) {
      const { annotations: e2 } = t2, i2 = this.div;
      setLayerDimensions(i2, this.viewport);
      const s2 = /* @__PURE__ */ new Map(), n2 = { data: null, layer: i2, linkService: t2.linkService, downloadManager: t2.downloadManager, imageResourcesPath: t2.imageResourcesPath || "", renderForms: false !== t2.renderForms, svgFactory: new DOMSVGFactory(), annotationStorage: t2.annotationStorage || new AnnotationStorage(), enableScripting: true === t2.enableScripting, hasJSActions: t2.hasJSActions, fieldObjects: t2.fieldObjects, parent: this, elements: null };
      for (const t3 of e2) {
        if (t3.noHTML) continue;
        const e3 = t3.annotationType === H2;
        if (e3) {
          const e4 = s2.get(t3.id);
          if (!e4) continue;
          n2.elements = e4;
        } else {
          const { width: e4, height: i4 } = getRectDims(t3.rect);
          if (e4 <= 0 || i4 <= 0) continue;
        }
        n2.data = t3;
        const i3 = AnnotationElementFactory.create(n2);
        if (!i3.isRenderable) continue;
        if (!e3 && t3.popupRef) {
          const e4 = s2.get(t3.popupRef);
          e4 ? e4.push(i3) : s2.set(t3.popupRef, [i3]);
        }
        const a2 = i3.render();
        t3.hidden && (a2.style.visibility = "hidden");
        await this.#Dn(a2, t3.id);
        if (i3._isEditable) {
          this.#Mn.set(i3.data.id, i3);
          this._annotationEditorUIManager?.renderAnnotationElement(i3);
        }
      }
      this.#kn();
    }
    update({ viewport: t2 }) {
      const e2 = this.div;
      this.viewport = t2;
      setLayerDimensions(e2, { rotation: t2.rotation });
      this.#kn();
      e2.hidden = false;
    }
    #kn() {
      if (!this.#Tn) return;
      const t2 = this.div;
      for (const [e2, i2] of this.#Tn) {
        const s2 = t2.querySelector(`[data-annotation-id="${e2}"]`);
        if (!s2) continue;
        i2.className = "annotationContent";
        const { firstChild: n2 } = s2;
        n2 ? "CANVAS" === n2.nodeName ? n2.replaceWith(i2) : n2.classList.contains("annotationContent") ? n2.after(i2) : n2.before(i2) : s2.append(i2);
      }
      this.#Tn.clear();
    }
    getEditableAnnotations() {
      return Array.from(this.#Mn.values());
    }
    getEditableAnnotation(t2) {
      return this.#Mn.get(t2);
    }
  };
  var zt = /\r\n?|\n/g;
  var FreeTextEditor = class _FreeTextEditor extends AnnotationEditor {
    #tn;
    #Rn = "";
    #In = `${this.id}-editor`;
    #Fn = null;
    #pn;
    static _freeTextDefaultContent = "";
    static _internalPadding = 0;
    static _defaultColor = null;
    static _defaultFontSize = 10;
    static get _keyboardManager() {
      const t2 = _FreeTextEditor.prototype, arrowChecker = (t3) => t3.isEmpty(), e2 = AnnotationEditorUIManager.TRANSLATE_SMALL, i2 = AnnotationEditorUIManager.TRANSLATE_BIG;
      return shadow(this, "_keyboardManager", new KeyboardManager([[["ctrl+s", "mac+meta+s", "ctrl+p", "mac+meta+p"], t2.commitOrRemove, { bubbles: true }], [["ctrl+Enter", "mac+meta+Enter", "Escape", "mac+Escape"], t2.commitOrRemove], [["ArrowLeft", "mac+ArrowLeft"], t2._translateEmpty, { args: [-e2, 0], checker: arrowChecker }], [["ctrl+ArrowLeft", "mac+shift+ArrowLeft"], t2._translateEmpty, { args: [-i2, 0], checker: arrowChecker }], [["ArrowRight", "mac+ArrowRight"], t2._translateEmpty, { args: [e2, 0], checker: arrowChecker }], [["ctrl+ArrowRight", "mac+shift+ArrowRight"], t2._translateEmpty, { args: [i2, 0], checker: arrowChecker }], [["ArrowUp", "mac+ArrowUp"], t2._translateEmpty, { args: [0, -e2], checker: arrowChecker }], [["ctrl+ArrowUp", "mac+shift+ArrowUp"], t2._translateEmpty, { args: [0, -i2], checker: arrowChecker }], [["ArrowDown", "mac+ArrowDown"], t2._translateEmpty, { args: [0, e2], checker: arrowChecker }], [["ctrl+ArrowDown", "mac+shift+ArrowDown"], t2._translateEmpty, { args: [0, i2], checker: arrowChecker }]]));
    }
    static _type = "freetext";
    static _editorType = g.FREETEXT;
    constructor(t2) {
      super({ ...t2, name: "freeTextEditor" });
      this.#tn = t2.color || _FreeTextEditor._defaultColor || AnnotationEditor._defaultLineColor;
      this.#pn = t2.fontSize || _FreeTextEditor._defaultFontSize;
    }
    static initialize(t2, e2) {
      AnnotationEditor.initialize(t2, e2);
      const i2 = getComputedStyle(document.documentElement);
      this._internalPadding = parseFloat(i2.getPropertyValue("--freetext-padding"));
    }
    static updateDefaultParams(t2, e2) {
      switch (t2) {
        case m.FREETEXT_SIZE:
          _FreeTextEditor._defaultFontSize = e2;
          break;
        case m.FREETEXT_COLOR:
          _FreeTextEditor._defaultColor = e2;
      }
    }
    updateParams(t2, e2) {
      switch (t2) {
        case m.FREETEXT_SIZE:
          this.#Ln(e2);
          break;
        case m.FREETEXT_COLOR:
          this.#On(e2);
      }
    }
    static get defaultPropertiesToUpdate() {
      return [[m.FREETEXT_SIZE, _FreeTextEditor._defaultFontSize], [m.FREETEXT_COLOR, _FreeTextEditor._defaultColor || AnnotationEditor._defaultLineColor]];
    }
    get propertiesToUpdate() {
      return [[m.FREETEXT_SIZE, this.#pn], [m.FREETEXT_COLOR, this.#tn]];
    }
    #Ln(t2) {
      const setFontsize = (t3) => {
        this.editorDiv.style.fontSize = `calc(${t3}px * var(--scale-factor))`;
        this.translate(0, -(t3 - this.#pn) * this.parentScale);
        this.#pn = t3;
        this.#Nn();
      }, e2 = this.#pn;
      this.addCommands({ cmd: setFontsize.bind(this, t2), undo: setFontsize.bind(this, e2), post: this._uiManager.updateUI.bind(this._uiManager, this), mustExec: true, type: m.FREETEXT_SIZE, overwriteIfSameType: true, keepUndo: true });
    }
    #On(t2) {
      const setColor = (t3) => {
        this.#tn = this.editorDiv.style.color = t3;
      }, e2 = this.#tn;
      this.addCommands({ cmd: setColor.bind(this, t2), undo: setColor.bind(this, e2), post: this._uiManager.updateUI.bind(this._uiManager, this), mustExec: true, type: m.FREETEXT_COLOR, overwriteIfSameType: true, keepUndo: true });
    }
    _translateEmpty(t2, e2) {
      this._uiManager.translateSelectedEditors(t2, e2, true);
    }
    getInitialTranslation() {
      const t2 = this.parentScale;
      return [-_FreeTextEditor._internalPadding * t2, -(_FreeTextEditor._internalPadding + this.#pn) * t2];
    }
    rebuild() {
      if (this.parent) {
        super.rebuild();
        null !== this.div && (this.isAttachedToDOM || this.parent.add(this));
      }
    }
    enableEditMode() {
      if (this.isInEditMode()) return;
      this.parent.setEditingState(false);
      this.parent.updateToolbar(g.FREETEXT);
      super.enableEditMode();
      this.overlayDiv.classList.remove("enabled");
      this.editorDiv.contentEditable = true;
      this._isDraggable = false;
      this.div.removeAttribute("aria-activedescendant");
      this.#Fn = new AbortController();
      const t2 = this._uiManager.combinedSignal(this.#Fn);
      this.editorDiv.addEventListener("keydown", this.editorDivKeydown.bind(this), { signal: t2 });
      this.editorDiv.addEventListener("focus", this.editorDivFocus.bind(this), { signal: t2 });
      this.editorDiv.addEventListener("blur", this.editorDivBlur.bind(this), { signal: t2 });
      this.editorDiv.addEventListener("input", this.editorDivInput.bind(this), { signal: t2 });
      this.editorDiv.addEventListener("paste", this.editorDivPaste.bind(this), { signal: t2 });
    }
    disableEditMode() {
      if (this.isInEditMode()) {
        this.parent.setEditingState(true);
        super.disableEditMode();
        this.overlayDiv.classList.add("enabled");
        this.editorDiv.contentEditable = false;
        this.div.setAttribute("aria-activedescendant", this.#In);
        this._isDraggable = true;
        this.#Fn?.abort();
        this.#Fn = null;
        this.div.focus({ preventScroll: true });
        this.isEditing = false;
        this.parent.div.classList.add("freetextEditing");
      }
    }
    focusin(t2) {
      if (this._focusEventsAllowed) {
        super.focusin(t2);
        t2.target !== this.editorDiv && this.editorDiv.focus();
      }
    }
    onceAdded(t2) {
      if (!this.width) {
        this.enableEditMode();
        t2 && this.editorDiv.focus();
        this._initialOptions?.isCentered && this.center();
        this._initialOptions = null;
      }
    }
    isEmpty() {
      return !this.editorDiv || "" === this.editorDiv.innerText.trim();
    }
    remove() {
      this.isEditing = false;
      if (this.parent) {
        this.parent.setEditingState(true);
        this.parent.div.classList.add("freetextEditing");
      }
      super.remove();
    }
    #Bn() {
      const t2 = [];
      this.editorDiv.normalize();
      let e2 = null;
      for (const i2 of this.editorDiv.childNodes) if (e2?.nodeType !== Node.TEXT_NODE || "BR" !== i2.nodeName) {
        t2.push(_FreeTextEditor.#Hn(i2));
        e2 = i2;
      }
      return t2.join("\n");
    }
    #Nn() {
      const [t2, e2] = this.parentDimensions;
      let i2;
      if (this.isAttachedToDOM) i2 = this.div.getBoundingClientRect();
      else {
        const { currentLayer: t3, div: e3 } = this, s2 = e3.style.display, n2 = e3.classList.contains("hidden");
        e3.classList.remove("hidden");
        e3.style.display = "hidden";
        t3.div.append(this.div);
        i2 = e3.getBoundingClientRect();
        e3.remove();
        e3.style.display = s2;
        e3.classList.toggle("hidden", n2);
      }
      if (this.rotation % 180 == this.parentRotation % 180) {
        this.width = i2.width / t2;
        this.height = i2.height / e2;
      } else {
        this.width = i2.height / t2;
        this.height = i2.width / e2;
      }
      this.fixAndSetPosition();
    }
    commit() {
      if (!this.isInEditMode()) return;
      super.commit();
      this.disableEditMode();
      const t2 = this.#Rn, e2 = this.#Rn = this.#Bn().trimEnd();
      if (t2 === e2) return;
      const setText = (t3) => {
        this.#Rn = t3;
        if (t3) {
          this.#zn();
          this._uiManager.rebuild(this);
          this.#Nn();
        } else this.remove();
      };
      this.addCommands({ cmd: () => {
        setText(e2);
      }, undo: () => {
        setText(t2);
      }, mustExec: false });
      this.#Nn();
    }
    shouldGetKeyboardEvents() {
      return this.isInEditMode();
    }
    enterInEditMode() {
      this.enableEditMode();
      this.editorDiv.focus();
    }
    dblclick(t2) {
      this.enterInEditMode();
    }
    keydown(t2) {
      if (t2.target === this.div && "Enter" === t2.key) {
        this.enterInEditMode();
        t2.preventDefault();
      }
    }
    editorDivKeydown(t2) {
      _FreeTextEditor._keyboardManager.exec(this, t2);
    }
    editorDivFocus(t2) {
      this.isEditing = true;
    }
    editorDivBlur(t2) {
      this.isEditing = false;
    }
    editorDivInput(t2) {
      this.parent.div.classList.toggle("freetextEditing", this.isEmpty());
    }
    disableEditing() {
      this.editorDiv.setAttribute("role", "comment");
      this.editorDiv.removeAttribute("aria-multiline");
    }
    enableEditing() {
      this.editorDiv.setAttribute("role", "textbox");
      this.editorDiv.setAttribute("aria-multiline", true);
    }
    render() {
      if (this.div) return this.div;
      let t2, e2;
      if (this.width) {
        t2 = this.x;
        e2 = this.y;
      }
      super.render();
      this.editorDiv = document.createElement("div");
      this.editorDiv.className = "internal";
      this.editorDiv.setAttribute("id", this.#In);
      this.editorDiv.setAttribute("data-l10n-id", "pdfjs-free-text2");
      this.editorDiv.setAttribute("data-l10n-attrs", "default-content");
      this.enableEditing();
      this.editorDiv.contentEditable = true;
      const { style: i2 } = this.editorDiv;
      i2.fontSize = `calc(${this.#pn}px * var(--scale-factor))`;
      i2.color = this.#tn;
      this.div.append(this.editorDiv);
      this.overlayDiv = document.createElement("div");
      this.overlayDiv.classList.add("overlay", "enabled");
      this.div.append(this.overlayDiv);
      bindEvents(this, this.div, ["dblclick", "keydown"]);
      if (this.width) {
        const [i3, s2] = this.parentDimensions;
        if (this.annotationElementId) {
          const { position: n2 } = this._initialData;
          let [a2, r2] = this.getInitialTranslation();
          [a2, r2] = this.pageTranslationToScreen(a2, r2);
          const [o2, l2] = this.pageDimensions, [h2, d2] = this.pageTranslation;
          let c2, u2;
          switch (this.rotation) {
            case 0:
              c2 = t2 + (n2[0] - h2) / o2;
              u2 = e2 + this.height - (n2[1] - d2) / l2;
              break;
            case 90:
              c2 = t2 + (n2[0] - h2) / o2;
              u2 = e2 - (n2[1] - d2) / l2;
              [a2, r2] = [r2, -a2];
              break;
            case 180:
              c2 = t2 - this.width + (n2[0] - h2) / o2;
              u2 = e2 - (n2[1] - d2) / l2;
              [a2, r2] = [-a2, -r2];
              break;
            case 270:
              c2 = t2 + (n2[0] - h2 - this.height * l2) / o2;
              u2 = e2 + (n2[1] - d2 - this.width * o2) / l2;
              [a2, r2] = [-r2, a2];
          }
          this.setAt(c2 * i3, u2 * s2, a2, r2);
        } else this.setAt(t2 * i3, e2 * s2, this.width * i3, this.height * s2);
        this.#zn();
        this._isDraggable = true;
        this.editorDiv.contentEditable = false;
      } else {
        this._isDraggable = false;
        this.editorDiv.contentEditable = true;
      }
      return this.div;
    }
    static #Hn(t2) {
      return (t2.nodeType === Node.TEXT_NODE ? t2.nodeValue : t2.innerText).replaceAll(zt, "");
    }
    editorDivPaste(t2) {
      const e2 = t2.clipboardData || window.clipboardData, { types: i2 } = e2;
      if (1 === i2.length && "text/plain" === i2[0]) return;
      t2.preventDefault();
      const s2 = _FreeTextEditor.#Un(e2.getData("text") || "").replaceAll(zt, "\n");
      if (!s2) return;
      const n2 = window.getSelection();
      if (!n2.rangeCount) return;
      this.editorDiv.normalize();
      n2.deleteFromDocument();
      const a2 = n2.getRangeAt(0);
      if (!s2.includes("\n")) {
        a2.insertNode(document.createTextNode(s2));
        this.editorDiv.normalize();
        n2.collapseToStart();
        return;
      }
      const { startContainer: r2, startOffset: o2 } = a2, l2 = [], h2 = [];
      if (r2.nodeType === Node.TEXT_NODE) {
        const t3 = r2.parentElement;
        h2.push(r2.nodeValue.slice(o2).replaceAll(zt, ""));
        if (t3 !== this.editorDiv) {
          let e3 = l2;
          for (const i3 of this.editorDiv.childNodes) i3 !== t3 ? e3.push(_FreeTextEditor.#Hn(i3)) : e3 = h2;
        }
        l2.push(r2.nodeValue.slice(0, o2).replaceAll(zt, ""));
      } else if (r2 === this.editorDiv) {
        let t3 = l2, e3 = 0;
        for (const i3 of this.editorDiv.childNodes) {
          e3++ === o2 && (t3 = h2);
          t3.push(_FreeTextEditor.#Hn(i3));
        }
      }
      this.#Rn = `${l2.join("\n")}${s2}${h2.join("\n")}`;
      this.#zn();
      const d2 = new Range();
      let c2 = l2.reduce(((t3, e3) => t3 + e3.length), 0);
      for (const { firstChild: t3 } of this.editorDiv.childNodes) if (t3.nodeType === Node.TEXT_NODE) {
        const e3 = t3.nodeValue.length;
        if (c2 <= e3) {
          d2.setStart(t3, c2);
          d2.setEnd(t3, c2);
          break;
        }
        c2 -= e3;
      }
      n2.removeAllRanges();
      n2.addRange(d2);
    }
    #zn() {
      this.editorDiv.replaceChildren();
      if (this.#Rn) for (const t2 of this.#Rn.split("\n")) {
        const e2 = document.createElement("div");
        e2.append(t2 ? document.createTextNode(t2) : document.createElement("br"));
        this.editorDiv.append(e2);
      }
    }
    #Gn() {
      return this.#Rn.replaceAll("\xA0", " ");
    }
    static #Un(t2) {
      return t2.replaceAll(" ", "\xA0");
    }
    get contentDiv() {
      return this.editorDiv;
    }
    static async deserialize(t2, e2, i2) {
      let s2 = null;
      if (t2 instanceof FreeTextAnnotationElement) {
        const { data: { defaultAppearanceData: { fontSize: e3, fontColor: i3 }, rect: n3, rotation: a2, id: r2, popupRef: o2 }, textContent: l2, textPosition: h2, parent: { page: { pageNumber: d2 } } } = t2;
        if (!l2 || 0 === l2.length) return null;
        s2 = t2 = { annotationType: g.FREETEXT, color: Array.from(i3), fontSize: e3, value: l2.join("\n"), position: h2, pageIndex: d2 - 1, rect: n3.slice(0), rotation: a2, id: r2, deleted: false, popupRef: o2 };
      }
      const n2 = await super.deserialize(t2, e2, i2);
      n2.#pn = t2.fontSize;
      n2.#tn = Util.makeHexColor(...t2.color);
      n2.#Rn = _FreeTextEditor.#Un(t2.value);
      n2.annotationElementId = t2.id || null;
      n2._initialData = s2;
      return n2;
    }
    serialize(t2 = false) {
      if (this.isEmpty()) return null;
      if (this.deleted) return this.serializeDeleted();
      const e2 = _FreeTextEditor._internalPadding * this.parentScale, i2 = this.getRect(e2, e2), s2 = AnnotationEditor._colorManager.convert(this.isAttachedToDOM ? getComputedStyle(this.editorDiv).color : this.#tn), n2 = { annotationType: g.FREETEXT, color: s2, fontSize: this.#pn, value: this.#Gn(), pageIndex: this.pageIndex, rect: i2, rotation: this.rotation, structTreeParentId: this._structTreeParentId };
      if (t2) return n2;
      if (this.annotationElementId && !this.#$n(n2)) return null;
      n2.id = this.annotationElementId;
      return n2;
    }
    #$n(t2) {
      const { value: e2, fontSize: i2, color: s2, pageIndex: n2 } = this._initialData;
      return this._hasBeenMoved || t2.value !== e2 || t2.fontSize !== i2 || t2.color.some(((t3, e3) => t3 !== s2[e3])) || t2.pageIndex !== n2;
    }
    renderAnnotationElement(t2) {
      const e2 = super.renderAnnotationElement(t2);
      if (this.deleted) return e2;
      const { style: i2 } = e2;
      i2.fontSize = `calc(${this.#pn}px * var(--scale-factor))`;
      i2.color = this.#tn;
      e2.replaceChildren();
      for (const t3 of this.#Rn.split("\n")) {
        const i3 = document.createElement("div");
        i3.append(t3 ? document.createTextNode(t3) : document.createElement("br"));
        e2.append(i3);
      }
      const s2 = _FreeTextEditor._internalPadding * this.parentScale;
      t2.updateEdited({ rect: this.getRect(s2, s2), popupContent: this.#Rn });
      return e2;
    }
    resetAnnotationElement(t2) {
      super.resetAnnotationElement(t2);
      t2.resetEdited();
    }
  };
  var Outline2 = class {
    static PRECISION = 1e-4;
    toSVGPath() {
      unreachable("Abstract method `toSVGPath` must be implemented.");
    }
    get box() {
      unreachable("Abstract getter `box` must be implemented.");
    }
    serialize(t2, e2) {
      unreachable("Abstract method `serialize` must be implemented.");
    }
    static _rescale(t2, e2, i2, s2, n2, a2) {
      a2 ||= new Float32Array(t2.length);
      for (let r2 = 0, o2 = t2.length; r2 < o2; r2 += 2) {
        a2[r2] = e2 + t2[r2] * s2;
        a2[r2 + 1] = i2 + t2[r2 + 1] * n2;
      }
      return a2;
    }
    static _rescaleAndSwap(t2, e2, i2, s2, n2, a2) {
      a2 ||= new Float32Array(t2.length);
      for (let r2 = 0, o2 = t2.length; r2 < o2; r2 += 2) {
        a2[r2] = e2 + t2[r2 + 1] * s2;
        a2[r2 + 1] = i2 + t2[r2] * n2;
      }
      return a2;
    }
    static _translate(t2, e2, i2, s2) {
      s2 ||= new Float32Array(t2.length);
      for (let n2 = 0, a2 = t2.length; n2 < a2; n2 += 2) {
        s2[n2] = e2 + t2[n2];
        s2[n2 + 1] = i2 + t2[n2 + 1];
      }
      return s2;
    }
    static svgRound(t2) {
      return Math.round(1e4 * t2);
    }
    static _normalizePoint(t2, e2, i2, s2, n2) {
      switch (n2) {
        case 90:
          return [1 - e2 / i2, t2 / s2];
        case 180:
          return [1 - t2 / i2, 1 - e2 / s2];
        case 270:
          return [e2 / i2, 1 - t2 / s2];
        default:
          return [t2 / i2, e2 / s2];
      }
    }
    static _normalizePagePoint(t2, e2, i2) {
      switch (i2) {
        case 90:
          return [1 - e2, t2];
        case 180:
          return [1 - t2, 1 - e2];
        case 270:
          return [e2, 1 - t2];
        default:
          return [t2, e2];
      }
    }
    static createBezierPoints(t2, e2, i2, s2, n2, a2) {
      return [(t2 + 5 * i2) / 6, (e2 + 5 * s2) / 6, (5 * i2 + n2) / 6, (5 * s2 + a2) / 6, (i2 + n2) / 2, (s2 + a2) / 2];
    }
  };
  var FreeDrawOutliner = class _FreeDrawOutliner {
    #Vn;
    #jn = [];
    #Wn;
    #qn;
    #Xn = [];
    #Kn = new Float32Array(18);
    #Yn;
    #Qn;
    #Jn;
    #Zn;
    #ta;
    #ea;
    #ia = [];
    static #sa = 8;
    static #na = 2;
    static #aa = _FreeDrawOutliner.#sa + _FreeDrawOutliner.#na;
    constructor({ x: t2, y: e2 }, i2, s2, n2, a2, r2 = 0) {
      this.#Vn = i2;
      this.#ea = n2 * s2;
      this.#qn = a2;
      this.#Kn.set([NaN, NaN, NaN, NaN, t2, e2], 6);
      this.#Wn = r2;
      this.#Zn = _FreeDrawOutliner.#sa * s2;
      this.#Jn = _FreeDrawOutliner.#aa * s2;
      this.#ta = s2;
      this.#ia.push(t2, e2);
    }
    isEmpty() {
      return isNaN(this.#Kn[8]);
    }
    #ra() {
      const t2 = this.#Kn.subarray(4, 6), e2 = this.#Kn.subarray(16, 18), [i2, s2, n2, a2] = this.#Vn;
      return [(this.#Yn + (t2[0] - e2[0]) / 2 - i2) / n2, (this.#Qn + (t2[1] - e2[1]) / 2 - s2) / a2, (this.#Yn + (e2[0] - t2[0]) / 2 - i2) / n2, (this.#Qn + (e2[1] - t2[1]) / 2 - s2) / a2];
    }
    add({ x: t2, y: e2 }) {
      this.#Yn = t2;
      this.#Qn = e2;
      const [i2, s2, n2, a2] = this.#Vn;
      let [r2, o2, l2, h2] = this.#Kn.subarray(8, 12);
      const d2 = t2 - l2, c2 = e2 - h2, u2 = Math.hypot(d2, c2);
      if (u2 < this.#Jn) return false;
      const p2 = u2 - this.#Zn, g2 = p2 / u2, m2 = g2 * d2, f2 = g2 * c2;
      let b2 = r2, A2 = o2;
      r2 = l2;
      o2 = h2;
      l2 += m2;
      h2 += f2;
      this.#ia?.push(t2, e2);
      const w2 = m2 / p2, v2 = -f2 / p2 * this.#ea, y2 = w2 * this.#ea;
      this.#Kn.set(this.#Kn.subarray(2, 8), 0);
      this.#Kn.set([l2 + v2, h2 + y2], 4);
      this.#Kn.set(this.#Kn.subarray(14, 18), 12);
      this.#Kn.set([l2 - v2, h2 - y2], 16);
      if (isNaN(this.#Kn[6])) {
        if (0 === this.#Xn.length) {
          this.#Kn.set([r2 + v2, o2 + y2], 2);
          this.#Xn.push(NaN, NaN, NaN, NaN, (r2 + v2 - i2) / n2, (o2 + y2 - s2) / a2);
          this.#Kn.set([r2 - v2, o2 - y2], 14);
          this.#jn.push(NaN, NaN, NaN, NaN, (r2 - v2 - i2) / n2, (o2 - y2 - s2) / a2);
        }
        this.#Kn.set([b2, A2, r2, o2, l2, h2], 6);
        return !this.isEmpty();
      }
      this.#Kn.set([b2, A2, r2, o2, l2, h2], 6);
      if (Math.abs(Math.atan2(A2 - o2, b2 - r2) - Math.atan2(f2, m2)) < Math.PI / 2) {
        [r2, o2, l2, h2] = this.#Kn.subarray(2, 6);
        this.#Xn.push(NaN, NaN, NaN, NaN, ((r2 + l2) / 2 - i2) / n2, ((o2 + h2) / 2 - s2) / a2);
        [r2, o2, b2, A2] = this.#Kn.subarray(14, 18);
        this.#jn.push(NaN, NaN, NaN, NaN, ((b2 + r2) / 2 - i2) / n2, ((A2 + o2) / 2 - s2) / a2);
        return true;
      }
      [b2, A2, r2, o2, l2, h2] = this.#Kn.subarray(0, 6);
      this.#Xn.push(((b2 + 5 * r2) / 6 - i2) / n2, ((A2 + 5 * o2) / 6 - s2) / a2, ((5 * r2 + l2) / 6 - i2) / n2, ((5 * o2 + h2) / 6 - s2) / a2, ((r2 + l2) / 2 - i2) / n2, ((o2 + h2) / 2 - s2) / a2);
      [l2, h2, r2, o2, b2, A2] = this.#Kn.subarray(12, 18);
      this.#jn.push(((b2 + 5 * r2) / 6 - i2) / n2, ((A2 + 5 * o2) / 6 - s2) / a2, ((5 * r2 + l2) / 6 - i2) / n2, ((5 * o2 + h2) / 6 - s2) / a2, ((r2 + l2) / 2 - i2) / n2, ((o2 + h2) / 2 - s2) / a2);
      return true;
    }
    toSVGPath() {
      if (this.isEmpty()) return "";
      const t2 = this.#Xn, e2 = this.#jn;
      if (isNaN(this.#Kn[6]) && !this.isEmpty()) return this.#oa();
      const i2 = [];
      i2.push(`M${t2[4]} ${t2[5]}`);
      for (let e3 = 6; e3 < t2.length; e3 += 6) isNaN(t2[e3]) ? i2.push(`L${t2[e3 + 4]} ${t2[e3 + 5]}`) : i2.push(`C${t2[e3]} ${t2[e3 + 1]} ${t2[e3 + 2]} ${t2[e3 + 3]} ${t2[e3 + 4]} ${t2[e3 + 5]}`);
      this.#la(i2);
      for (let t3 = e2.length - 6; t3 >= 6; t3 -= 6) isNaN(e2[t3]) ? i2.push(`L${e2[t3 + 4]} ${e2[t3 + 5]}`) : i2.push(`C${e2[t3]} ${e2[t3 + 1]} ${e2[t3 + 2]} ${e2[t3 + 3]} ${e2[t3 + 4]} ${e2[t3 + 5]}`);
      this.#ha(i2);
      return i2.join(" ");
    }
    #oa() {
      const [t2, e2, i2, s2] = this.#Vn, [n2, a2, r2, o2] = this.#ra();
      return `M${(this.#Kn[2] - t2) / i2} ${(this.#Kn[3] - e2) / s2} L${(this.#Kn[4] - t2) / i2} ${(this.#Kn[5] - e2) / s2} L${n2} ${a2} L${r2} ${o2} L${(this.#Kn[16] - t2) / i2} ${(this.#Kn[17] - e2) / s2} L${(this.#Kn[14] - t2) / i2} ${(this.#Kn[15] - e2) / s2} Z`;
    }
    #ha(t2) {
      const e2 = this.#jn;
      t2.push(`L${e2[4]} ${e2[5]} Z`);
    }
    #la(t2) {
      const [e2, i2, s2, n2] = this.#Vn, a2 = this.#Kn.subarray(4, 6), r2 = this.#Kn.subarray(16, 18), [o2, l2, h2, d2] = this.#ra();
      t2.push(`L${(a2[0] - e2) / s2} ${(a2[1] - i2) / n2} L${o2} ${l2} L${h2} ${d2} L${(r2[0] - e2) / s2} ${(r2[1] - i2) / n2}`);
    }
    newFreeDrawOutline(t2, e2, i2, s2, n2, a2) {
      return new FreeDrawOutline(t2, e2, i2, s2, n2, a2);
    }
    getOutlines() {
      const t2 = this.#Xn, e2 = this.#jn, i2 = this.#Kn, [s2, n2, a2, r2] = this.#Vn, o2 = new Float32Array((this.#ia?.length ?? 0) + 2);
      for (let t3 = 0, e3 = o2.length - 2; t3 < e3; t3 += 2) {
        o2[t3] = (this.#ia[t3] - s2) / a2;
        o2[t3 + 1] = (this.#ia[t3 + 1] - n2) / r2;
      }
      o2[o2.length - 2] = (this.#Yn - s2) / a2;
      o2[o2.length - 1] = (this.#Qn - n2) / r2;
      if (isNaN(i2[6]) && !this.isEmpty()) return this.#da(o2);
      const l2 = new Float32Array(this.#Xn.length + 24 + this.#jn.length);
      let h2 = t2.length;
      for (let e3 = 0; e3 < h2; e3 += 2) if (isNaN(t2[e3])) l2[e3] = l2[e3 + 1] = NaN;
      else {
        l2[e3] = t2[e3];
        l2[e3 + 1] = t2[e3 + 1];
      }
      h2 = this.#ca(l2, h2);
      for (let t3 = e2.length - 6; t3 >= 6; t3 -= 6) for (let i3 = 0; i3 < 6; i3 += 2) if (isNaN(e2[t3 + i3])) {
        l2[h2] = l2[h2 + 1] = NaN;
        h2 += 2;
      } else {
        l2[h2] = e2[t3 + i3];
        l2[h2 + 1] = e2[t3 + i3 + 1];
        h2 += 2;
      }
      this.#ua(l2, h2);
      return this.newFreeDrawOutline(l2, o2, this.#Vn, this.#ta, this.#Wn, this.#qn);
    }
    #da(t2) {
      const e2 = this.#Kn, [i2, s2, n2, a2] = this.#Vn, [r2, o2, l2, h2] = this.#ra(), d2 = new Float32Array(36);
      d2.set([NaN, NaN, NaN, NaN, (e2[2] - i2) / n2, (e2[3] - s2) / a2, NaN, NaN, NaN, NaN, (e2[4] - i2) / n2, (e2[5] - s2) / a2, NaN, NaN, NaN, NaN, r2, o2, NaN, NaN, NaN, NaN, l2, h2, NaN, NaN, NaN, NaN, (e2[16] - i2) / n2, (e2[17] - s2) / a2, NaN, NaN, NaN, NaN, (e2[14] - i2) / n2, (e2[15] - s2) / a2], 0);
      return this.newFreeDrawOutline(d2, t2, this.#Vn, this.#ta, this.#Wn, this.#qn);
    }
    #ua(t2, e2) {
      const i2 = this.#jn;
      t2.set([NaN, NaN, NaN, NaN, i2[4], i2[5]], e2);
      return e2 + 6;
    }
    #ca(t2, e2) {
      const i2 = this.#Kn.subarray(4, 6), s2 = this.#Kn.subarray(16, 18), [n2, a2, r2, o2] = this.#Vn, [l2, h2, d2, c2] = this.#ra();
      t2.set([NaN, NaN, NaN, NaN, (i2[0] - n2) / r2, (i2[1] - a2) / o2, NaN, NaN, NaN, NaN, l2, h2, NaN, NaN, NaN, NaN, d2, c2, NaN, NaN, NaN, NaN, (s2[0] - n2) / r2, (s2[1] - a2) / o2], e2);
      return e2 + 24;
    }
  };
  var FreeDrawOutline = class extends Outline2 {
    #Vn;
    #pa = new Float32Array(4);
    #Wn;
    #qn;
    #ia;
    #ta;
    #ga;
    constructor(t2, e2, i2, s2, n2, a2) {
      super();
      this.#ga = t2;
      this.#ia = e2;
      this.#Vn = i2;
      this.#ta = s2;
      this.#Wn = n2;
      this.#qn = a2;
      this.lastPoint = [NaN, NaN];
      this.#ma(a2);
      const [r2, o2, l2, h2] = this.#pa;
      for (let e3 = 0, i3 = t2.length; e3 < i3; e3 += 2) {
        t2[e3] = (t2[e3] - r2) / l2;
        t2[e3 + 1] = (t2[e3 + 1] - o2) / h2;
      }
      for (let t3 = 0, i3 = e2.length; t3 < i3; t3 += 2) {
        e2[t3] = (e2[t3] - r2) / l2;
        e2[t3 + 1] = (e2[t3 + 1] - o2) / h2;
      }
    }
    toSVGPath() {
      const t2 = [`M${this.#ga[4]} ${this.#ga[5]}`];
      for (let e2 = 6, i2 = this.#ga.length; e2 < i2; e2 += 6) isNaN(this.#ga[e2]) ? t2.push(`L${this.#ga[e2 + 4]} ${this.#ga[e2 + 5]}`) : t2.push(`C${this.#ga[e2]} ${this.#ga[e2 + 1]} ${this.#ga[e2 + 2]} ${this.#ga[e2 + 3]} ${this.#ga[e2 + 4]} ${this.#ga[e2 + 5]}`);
      t2.push("Z");
      return t2.join(" ");
    }
    serialize([t2, e2, i2, s2], n2) {
      const a2 = i2 - t2, r2 = s2 - e2;
      let o2, l2;
      switch (n2) {
        case 0:
          o2 = Outline2._rescale(this.#ga, t2, s2, a2, -r2);
          l2 = Outline2._rescale(this.#ia, t2, s2, a2, -r2);
          break;
        case 90:
          o2 = Outline2._rescaleAndSwap(this.#ga, t2, e2, a2, r2);
          l2 = Outline2._rescaleAndSwap(this.#ia, t2, e2, a2, r2);
          break;
        case 180:
          o2 = Outline2._rescale(this.#ga, i2, e2, -a2, r2);
          l2 = Outline2._rescale(this.#ia, i2, e2, -a2, r2);
          break;
        case 270:
          o2 = Outline2._rescaleAndSwap(this.#ga, i2, s2, -a2, -r2);
          l2 = Outline2._rescaleAndSwap(this.#ia, i2, s2, -a2, -r2);
      }
      return { outline: Array.from(o2), points: [Array.from(l2)] };
    }
    #ma(t2) {
      const e2 = this.#ga;
      let i2 = e2[4], s2 = e2[5], n2 = i2, a2 = s2, r2 = i2, o2 = s2, l2 = i2, h2 = s2;
      const d2 = t2 ? Math.max : Math.min;
      for (let t3 = 6, c3 = e2.length; t3 < c3; t3 += 6) {
        if (isNaN(e2[t3])) {
          n2 = Math.min(n2, e2[t3 + 4]);
          a2 = Math.min(a2, e2[t3 + 5]);
          r2 = Math.max(r2, e2[t3 + 4]);
          o2 = Math.max(o2, e2[t3 + 5]);
          if (h2 < e2[t3 + 5]) {
            l2 = e2[t3 + 4];
            h2 = e2[t3 + 5];
          } else h2 === e2[t3 + 5] && (l2 = d2(l2, e2[t3 + 4]));
        } else {
          const c4 = Util.bezierBoundingBox(i2, s2, ...e2.slice(t3, t3 + 6));
          n2 = Math.min(n2, c4[0]);
          a2 = Math.min(a2, c4[1]);
          r2 = Math.max(r2, c4[2]);
          o2 = Math.max(o2, c4[3]);
          if (h2 < c4[3]) {
            l2 = c4[2];
            h2 = c4[3];
          } else h2 === c4[3] && (l2 = d2(l2, c4[2]));
        }
        i2 = e2[t3 + 4];
        s2 = e2[t3 + 5];
      }
      const c2 = this.#pa;
      c2[0] = n2 - this.#Wn;
      c2[1] = a2 - this.#Wn;
      c2[2] = r2 - n2 + 2 * this.#Wn;
      c2[3] = o2 - a2 + 2 * this.#Wn;
      this.lastPoint = [l2, h2];
    }
    get box() {
      return this.#pa;
    }
    newOutliner(t2, e2, i2, s2, n2, a2 = 0) {
      return new FreeDrawOutliner(t2, e2, i2, s2, n2, a2);
    }
    getNewOutline(t2, e2) {
      const [i2, s2, n2, a2] = this.#pa, [r2, o2, l2, h2] = this.#Vn, d2 = n2 * l2, c2 = a2 * h2, u2 = i2 * l2 + r2, p2 = s2 * h2 + o2, g2 = this.newOutliner({ x: this.#ia[0] * d2 + u2, y: this.#ia[1] * c2 + p2 }, this.#Vn, this.#ta, t2, this.#qn, e2 ?? this.#Wn);
      for (let t3 = 2; t3 < this.#ia.length; t3 += 2) g2.add({ x: this.#ia[t3] * d2 + u2, y: this.#ia[t3 + 1] * c2 + p2 });
      return g2.getOutlines();
    }
  };
  var HighlightOutliner = class {
    #Vn;
    #fa;
    #ba = [];
    #Aa = [];
    constructor(t2, e2 = 0, i2 = 0, s2 = true) {
      let n2 = 1 / 0, a2 = -1 / 0, r2 = 1 / 0, o2 = -1 / 0;
      const l2 = 10 ** -4;
      for (const { x: i3, y: s3, width: h3, height: d3 } of t2) {
        const t3 = Math.floor((i3 - e2) / l2) * l2, c3 = Math.ceil((i3 + h3 + e2) / l2) * l2, u3 = Math.floor((s3 - e2) / l2) * l2, p3 = Math.ceil((s3 + d3 + e2) / l2) * l2, g3 = [t3, u3, p3, true], m2 = [c3, u3, p3, false];
        this.#ba.push(g3, m2);
        n2 = Math.min(n2, t3);
        a2 = Math.max(a2, c3);
        r2 = Math.min(r2, u3);
        o2 = Math.max(o2, p3);
      }
      const h2 = a2 - n2 + 2 * i2, d2 = o2 - r2 + 2 * i2, c2 = n2 - i2, u2 = r2 - i2, p2 = this.#ba.at(s2 ? -1 : -2), g2 = [p2[0], p2[2]];
      for (const t3 of this.#ba) {
        const [e3, i3, s3] = t3;
        t3[0] = (e3 - c2) / h2;
        t3[1] = (i3 - u2) / d2;
        t3[2] = (s3 - u2) / d2;
      }
      this.#Vn = new Float32Array([c2, u2, h2, d2]);
      this.#fa = g2;
    }
    getOutlines() {
      this.#ba.sort(((t3, e2) => t3[0] - e2[0] || t3[1] - e2[1] || t3[2] - e2[2]));
      const t2 = [];
      for (const e2 of this.#ba) if (e2[3]) {
        t2.push(...this.#wa(e2));
        this.#va(e2);
      } else {
        this.#ya(e2);
        t2.push(...this.#wa(e2));
      }
      return this.#xa(t2);
    }
    #xa(t2) {
      const e2 = [], i2 = /* @__PURE__ */ new Set();
      for (const i3 of t2) {
        const [t3, s3, n3] = i3;
        e2.push([t3, s3, i3], [t3, n3, i3]);
      }
      e2.sort(((t3, e3) => t3[1] - e3[1] || t3[0] - e3[0]));
      for (let t3 = 0, s3 = e2.length; t3 < s3; t3 += 2) {
        const s4 = e2[t3][2], n3 = e2[t3 + 1][2];
        s4.push(n3);
        n3.push(s4);
        i2.add(s4);
        i2.add(n3);
      }
      const s2 = [];
      let n2;
      for (; i2.size > 0; ) {
        const t3 = i2.values().next().value;
        let [e3, a2, r2, o2, l2] = t3;
        i2.delete(t3);
        let h2 = e3, d2 = a2;
        n2 = [e3, r2];
        s2.push(n2);
        for (; ; ) {
          let t4;
          if (i2.has(o2)) t4 = o2;
          else {
            if (!i2.has(l2)) break;
            t4 = l2;
          }
          i2.delete(t4);
          [e3, a2, r2, o2, l2] = t4;
          if (h2 !== e3) {
            n2.push(h2, d2, e3, d2 === a2 ? a2 : r2);
            h2 = e3;
          }
          d2 = d2 === a2 ? r2 : a2;
        }
        n2.push(h2, d2);
      }
      return new HighlightOutline(s2, this.#Vn, this.#fa);
    }
    #_a(t2) {
      const e2 = this.#Aa;
      let i2 = 0, s2 = e2.length - 1;
      for (; i2 <= s2; ) {
        const n2 = i2 + s2 >> 1, a2 = e2[n2][0];
        if (a2 === t2) return n2;
        a2 < t2 ? i2 = n2 + 1 : s2 = n2 - 1;
      }
      return s2 + 1;
    }
    #va([, t2, e2]) {
      const i2 = this.#_a(t2);
      this.#Aa.splice(i2, 0, [t2, e2]);
    }
    #ya([, t2, e2]) {
      const i2 = this.#_a(t2);
      for (let s2 = i2; s2 < this.#Aa.length; s2++) {
        const [i3, n2] = this.#Aa[s2];
        if (i3 !== t2) break;
        if (i3 === t2 && n2 === e2) {
          this.#Aa.splice(s2, 1);
          return;
        }
      }
      for (let s2 = i2 - 1; s2 >= 0; s2--) {
        const [i3, n2] = this.#Aa[s2];
        if (i3 !== t2) break;
        if (i3 === t2 && n2 === e2) {
          this.#Aa.splice(s2, 1);
          return;
        }
      }
    }
    #wa(t2) {
      const [e2, i2, s2] = t2, n2 = [[e2, i2, s2]], a2 = this.#_a(s2);
      for (let t3 = 0; t3 < a2; t3++) {
        const [i3, s3] = this.#Aa[t3];
        for (let t4 = 0, a3 = n2.length; t4 < a3; t4++) {
          const [, r2, o2] = n2[t4];
          if (!(s3 <= r2 || o2 <= i3)) if (r2 >= i3) if (o2 > s3) n2[t4][1] = s3;
          else {
            if (1 === a3) return [];
            n2.splice(t4, 1);
            t4--;
            a3--;
          }
          else {
            n2[t4][2] = i3;
            o2 > s3 && n2.push([e2, s3, o2]);
          }
        }
      }
      return n2;
    }
  };
  var HighlightOutline = class extends Outline2 {
    #Vn;
    #Ea;
    constructor(t2, e2, i2) {
      super();
      this.#Ea = t2;
      this.#Vn = e2;
      this.lastPoint = i2;
    }
    toSVGPath() {
      const t2 = [];
      for (const e2 of this.#Ea) {
        let [i2, s2] = e2;
        t2.push(`M${i2} ${s2}`);
        for (let n2 = 2; n2 < e2.length; n2 += 2) {
          const a2 = e2[n2], r2 = e2[n2 + 1];
          if (a2 === i2) {
            t2.push(`V${r2}`);
            s2 = r2;
          } else if (r2 === s2) {
            t2.push(`H${a2}`);
            i2 = a2;
          }
        }
        t2.push("Z");
      }
      return t2.join(" ");
    }
    serialize([t2, e2, i2, s2], n2) {
      const a2 = [], r2 = i2 - t2, o2 = s2 - e2;
      for (const e3 of this.#Ea) {
        const i3 = new Array(e3.length);
        for (let n3 = 0; n3 < e3.length; n3 += 2) {
          i3[n3] = t2 + e3[n3] * r2;
          i3[n3 + 1] = s2 - e3[n3 + 1] * o2;
        }
        a2.push(i3);
      }
      return a2;
    }
    get box() {
      return this.#Vn;
    }
    get classNamesForOutlining() {
      return ["highlightOutline"];
    }
  };
  var FreeHighlightOutliner = class extends FreeDrawOutliner {
    newFreeDrawOutline(t2, e2, i2, s2, n2, a2) {
      return new FreeHighlightOutline(t2, e2, i2, s2, n2, a2);
    }
  };
  var FreeHighlightOutline = class extends FreeDrawOutline {
    newOutliner(t2, e2, i2, s2, n2, a2 = 0) {
      return new FreeHighlightOutliner(t2, e2, i2, s2, n2, a2);
    }
  };
  var ColorPicker = class _ColorPicker {
    #Sa = null;
    #Ca = null;
    #Ta;
    #Ma = null;
    #Pa = false;
    #Da = false;
    #a = null;
    #ka;
    #Ra = null;
    #m = null;
    #Ia;
    static #Fa = null;
    static get _keyboardManager() {
      return shadow(this, "_keyboardManager", new KeyboardManager([[["Escape", "mac+Escape"], _ColorPicker.prototype._hideDropdownFromKeyboard], [[" ", "mac+ "], _ColorPicker.prototype._colorSelectFromKeyboard], [["ArrowDown", "ArrowRight", "mac+ArrowDown", "mac+ArrowRight"], _ColorPicker.prototype._moveToNext], [["ArrowUp", "ArrowLeft", "mac+ArrowUp", "mac+ArrowLeft"], _ColorPicker.prototype._moveToPrevious], [["Home", "mac+Home"], _ColorPicker.prototype._moveToBeginning], [["End", "mac+End"], _ColorPicker.prototype._moveToEnd]]));
    }
    constructor({ editor: t2 = null, uiManager: e2 = null }) {
      if (t2) {
        this.#Da = false;
        this.#Ia = m.HIGHLIGHT_COLOR;
        this.#a = t2;
      } else {
        this.#Da = true;
        this.#Ia = m.HIGHLIGHT_DEFAULT_COLOR;
      }
      this.#m = t2?._uiManager || e2;
      this.#ka = this.#m._eventBus;
      this.#Ta = t2?.color || this.#m?.highlightColors.values().next().value || "#FFFF98";
      _ColorPicker.#Fa ||= Object.freeze({ blue: "pdfjs-editor-colorpicker-blue", green: "pdfjs-editor-colorpicker-green", pink: "pdfjs-editor-colorpicker-pink", red: "pdfjs-editor-colorpicker-red", yellow: "pdfjs-editor-colorpicker-yellow" });
    }
    renderButton() {
      const t2 = this.#Sa = document.createElement("button");
      t2.className = "colorPicker";
      t2.tabIndex = "0";
      t2.setAttribute("data-l10n-id", "pdfjs-editor-colorpicker-button");
      t2.setAttribute("aria-haspopup", true);
      const e2 = this.#m._signal;
      t2.addEventListener("click", this.#La.bind(this), { signal: e2 });
      t2.addEventListener("keydown", this.#qs.bind(this), { signal: e2 });
      const i2 = this.#Ca = document.createElement("span");
      i2.className = "swatch";
      i2.setAttribute("aria-hidden", true);
      i2.style.backgroundColor = this.#Ta;
      t2.append(i2);
      return t2;
    }
    renderMainDropdown() {
      const t2 = this.#Ma = this.#Oa();
      t2.setAttribute("aria-orientation", "horizontal");
      t2.setAttribute("aria-labelledby", "highlightColorPickerLabel");
      return t2;
    }
    #Oa() {
      const t2 = document.createElement("div"), e2 = this.#m._signal;
      t2.addEventListener("contextmenu", noContextMenu, { signal: e2 });
      t2.className = "dropdown";
      t2.role = "listbox";
      t2.setAttribute("aria-multiselectable", false);
      t2.setAttribute("aria-orientation", "vertical");
      t2.setAttribute("data-l10n-id", "pdfjs-editor-colorpicker-dropdown");
      for (const [i2, s2] of this.#m.highlightColors) {
        const n2 = document.createElement("button");
        n2.tabIndex = "0";
        n2.role = "option";
        n2.setAttribute("data-color", s2);
        n2.title = i2;
        n2.setAttribute("data-l10n-id", _ColorPicker.#Fa[i2]);
        const a2 = document.createElement("span");
        n2.append(a2);
        a2.className = "swatch";
        a2.style.backgroundColor = s2;
        n2.setAttribute("aria-selected", s2 === this.#Ta);
        n2.addEventListener("click", this.#Na.bind(this, s2), { signal: e2 });
        t2.append(n2);
      }
      t2.addEventListener("keydown", this.#qs.bind(this), { signal: e2 });
      return t2;
    }
    #Na(t2, e2) {
      e2.stopPropagation();
      this.#ka.dispatch("switchannotationeditorparams", { source: this, type: this.#Ia, value: t2 });
    }
    _colorSelectFromKeyboard(t2) {
      if (t2.target === this.#Sa) {
        this.#La(t2);
        return;
      }
      const e2 = t2.target.getAttribute("data-color");
      e2 && this.#Na(e2, t2);
    }
    _moveToNext(t2) {
      this.#Ba ? t2.target !== this.#Sa ? t2.target.nextSibling?.focus() : this.#Ma.firstChild?.focus() : this.#La(t2);
    }
    _moveToPrevious(t2) {
      if (t2.target !== this.#Ma?.firstChild && t2.target !== this.#Sa) {
        this.#Ba || this.#La(t2);
        t2.target.previousSibling?.focus();
      } else this.#Ba && this._hideDropdownFromKeyboard();
    }
    _moveToBeginning(t2) {
      this.#Ba ? this.#Ma.firstChild?.focus() : this.#La(t2);
    }
    _moveToEnd(t2) {
      this.#Ba ? this.#Ma.lastChild?.focus() : this.#La(t2);
    }
    #qs(t2) {
      _ColorPicker._keyboardManager.exec(this, t2);
    }
    #La(t2) {
      if (this.#Ba) {
        this.hideDropdown();
        return;
      }
      this.#Pa = 0 === t2.detail;
      if (!this.#Ra) {
        this.#Ra = new AbortController();
        window.addEventListener("pointerdown", this.#h.bind(this), { signal: this.#m.combinedSignal(this.#Ra) });
      }
      if (this.#Ma) {
        this.#Ma.classList.remove("hidden");
        return;
      }
      const e2 = this.#Ma = this.#Oa();
      this.#Sa.append(e2);
    }
    #h(t2) {
      this.#Ma?.contains(t2.target) || this.hideDropdown();
    }
    hideDropdown() {
      this.#Ma?.classList.add("hidden");
      this.#Ra?.abort();
      this.#Ra = null;
    }
    get #Ba() {
      return this.#Ma && !this.#Ma.classList.contains("hidden");
    }
    _hideDropdownFromKeyboard() {
      if (!this.#Da) if (this.#Ba) {
        this.hideDropdown();
        this.#Sa.focus({ preventScroll: true, focusVisible: this.#Pa });
      } else this.#a?.unselect();
    }
    updateColor(t2) {
      this.#Ca && (this.#Ca.style.backgroundColor = t2);
      if (!this.#Ma) return;
      const e2 = this.#m.highlightColors.values();
      for (const i2 of this.#Ma.children) i2.setAttribute("aria-selected", e2.next().value === t2);
    }
    destroy() {
      this.#Sa?.remove();
      this.#Sa = null;
      this.#Ca = null;
      this.#Ma?.remove();
      this.#Ma = null;
    }
  };
  var HighlightEditor = class _HighlightEditor extends AnnotationEditor {
    #Ha = null;
    #za = 0;
    #Ua;
    #Ga = null;
    #n = null;
    #$a = null;
    #Va = null;
    #ja = 0;
    #Wa = null;
    #qa = null;
    #w = null;
    #Xa = false;
    #fa = null;
    #Ka;
    #Ya = null;
    #Qa = "";
    #ea;
    #Ja = "";
    static _defaultColor = null;
    static _defaultOpacity = 1;
    static _defaultThickness = 12;
    static _type = "highlight";
    static _editorType = g.HIGHLIGHT;
    static _freeHighlightId = -1;
    static _freeHighlight = null;
    static _freeHighlightClipId = "";
    static get _keyboardManager() {
      const t2 = _HighlightEditor.prototype;
      return shadow(this, "_keyboardManager", new KeyboardManager([[["ArrowLeft", "mac+ArrowLeft"], t2._moveCaret, { args: [0] }], [["ArrowRight", "mac+ArrowRight"], t2._moveCaret, { args: [1] }], [["ArrowUp", "mac+ArrowUp"], t2._moveCaret, { args: [2] }], [["ArrowDown", "mac+ArrowDown"], t2._moveCaret, { args: [3] }]]));
    }
    constructor(t2) {
      super({ ...t2, name: "highlightEditor" });
      this.color = t2.color || _HighlightEditor._defaultColor;
      this.#ea = t2.thickness || _HighlightEditor._defaultThickness;
      this.#Ka = t2.opacity || _HighlightEditor._defaultOpacity;
      this.#Ua = t2.boxes || null;
      this.#Ja = t2.methodOfCreation || "";
      this.#Qa = t2.text || "";
      this._isDraggable = false;
      if (t2.highlightId > -1) {
        this.#Xa = true;
        this.#Za(t2);
        this.#tr();
      } else if (this.#Ua) {
        this.#Ha = t2.anchorNode;
        this.#za = t2.anchorOffset;
        this.#Va = t2.focusNode;
        this.#ja = t2.focusOffset;
        this.#er();
        this.#tr();
        this.rotate(this.rotation);
      }
    }
    get telemetryInitialData() {
      return { action: "added", type: this.#Xa ? "free_highlight" : "highlight", color: this._uiManager.highlightColorNames.get(this.color), thickness: this.#ea, methodOfCreation: this.#Ja };
    }
    get telemetryFinalData() {
      return { type: "highlight", color: this._uiManager.highlightColorNames.get(this.color) };
    }
    static computeTelemetryFinalData(t2) {
      return { numberOfColors: t2.get("color").size };
    }
    #er() {
      const t2 = new HighlightOutliner(this.#Ua, 1e-3);
      this.#qa = t2.getOutlines();
      [this.x, this.y, this.width, this.height] = this.#qa.box;
      const e2 = new HighlightOutliner(this.#Ua, 25e-4, 1e-3, "ltr" === this._uiManager.direction);
      this.#$a = e2.getOutlines();
      const { lastPoint: i2 } = this.#$a;
      this.#fa = [(i2[0] - this.x) / this.width, (i2[1] - this.y) / this.height];
    }
    #Za({ highlightOutlines: t2, highlightId: e2, clipPathId: i2 }) {
      this.#qa = t2;
      this.#$a = t2.getNewOutline(this.#ea / 2 + 1.5, 25e-4);
      if (e2 >= 0) {
        this.#w = e2;
        this.#Ga = i2;
        this.parent.drawLayer.finalizeDraw(e2, { bbox: t2.box, path: { d: t2.toSVGPath() } });
        this.#Ya = this.parent.drawLayer.drawOutline({ rootClass: { highlightOutline: true, free: true }, bbox: this.#$a.box, path: { d: this.#$a.toSVGPath() } }, true);
      } else if (this.parent) {
        const e3 = this.parent.viewport.rotation;
        this.parent.drawLayer.updateProperties(this.#w, { bbox: _HighlightEditor.#ir(this.#qa.box, (e3 - this.rotation + 360) % 360), path: { d: t2.toSVGPath() } });
        this.parent.drawLayer.updateProperties(this.#Ya, { bbox: _HighlightEditor.#ir(this.#$a.box, e3), path: { d: this.#$a.toSVGPath() } });
      }
      const [s2, n2, a2, r2] = t2.box;
      switch (this.rotation) {
        case 0:
          this.x = s2;
          this.y = n2;
          this.width = a2;
          this.height = r2;
          break;
        case 90: {
          const [t3, e3] = this.parentDimensions;
          this.x = n2;
          this.y = 1 - s2;
          this.width = a2 * e3 / t3;
          this.height = r2 * t3 / e3;
          break;
        }
        case 180:
          this.x = 1 - s2;
          this.y = 1 - n2;
          this.width = a2;
          this.height = r2;
          break;
        case 270: {
          const [t3, e3] = this.parentDimensions;
          this.x = 1 - n2;
          this.y = s2;
          this.width = a2 * e3 / t3;
          this.height = r2 * t3 / e3;
          break;
        }
      }
      const { lastPoint: o2 } = this.#$a;
      this.#fa = [(o2[0] - s2) / a2, (o2[1] - n2) / r2];
    }
    static initialize(t2, e2) {
      AnnotationEditor.initialize(t2, e2);
      _HighlightEditor._defaultColor ||= e2.highlightColors?.values().next().value || "#fff066";
    }
    static updateDefaultParams(t2, e2) {
      switch (t2) {
        case m.HIGHLIGHT_DEFAULT_COLOR:
          _HighlightEditor._defaultColor = e2;
          break;
        case m.HIGHLIGHT_THICKNESS:
          _HighlightEditor._defaultThickness = e2;
      }
    }
    translateInPage(t2, e2) {
    }
    get toolbarPosition() {
      return this.#fa;
    }
    updateParams(t2, e2) {
      switch (t2) {
        case m.HIGHLIGHT_COLOR:
          this.#On(e2);
          break;
        case m.HIGHLIGHT_THICKNESS:
          this.#sr(e2);
      }
    }
    static get defaultPropertiesToUpdate() {
      return [[m.HIGHLIGHT_DEFAULT_COLOR, _HighlightEditor._defaultColor], [m.HIGHLIGHT_THICKNESS, _HighlightEditor._defaultThickness]];
    }
    get propertiesToUpdate() {
      return [[m.HIGHLIGHT_COLOR, this.color || _HighlightEditor._defaultColor], [m.HIGHLIGHT_THICKNESS, this.#ea || _HighlightEditor._defaultThickness], [m.HIGHLIGHT_FREE, this.#Xa]];
    }
    #On(t2) {
      const setColorAndOpacity = (t3, e3) => {
        this.color = t3;
        this.#Ka = e3;
        this.parent?.drawLayer.updateProperties(this.#w, { root: { fill: t3, "fill-opacity": e3 } });
        this.#n?.updateColor(t3);
      }, e2 = this.color, i2 = this.#Ka;
      this.addCommands({ cmd: setColorAndOpacity.bind(this, t2, _HighlightEditor._defaultOpacity), undo: setColorAndOpacity.bind(this, e2, i2), post: this._uiManager.updateUI.bind(this._uiManager, this), mustExec: true, type: m.HIGHLIGHT_COLOR, overwriteIfSameType: true, keepUndo: true });
      this._reportTelemetry({ action: "color_changed", color: this._uiManager.highlightColorNames.get(t2) }, true);
    }
    #sr(t2) {
      const e2 = this.#ea, setThickness = (t3) => {
        this.#ea = t3;
        this.#nr(t3);
      };
      this.addCommands({ cmd: setThickness.bind(this, t2), undo: setThickness.bind(this, e2), post: this._uiManager.updateUI.bind(this._uiManager, this), mustExec: true, type: m.INK_THICKNESS, overwriteIfSameType: true, keepUndo: true });
      this._reportTelemetry({ action: "thickness_changed", thickness: t2 }, true);
    }
    async addEditToolbar() {
      const t2 = await super.addEditToolbar();
      if (!t2) return null;
      if (this._uiManager.highlightColors) {
        this.#n = new ColorPicker({ editor: this });
        t2.addColorPicker(this.#n);
      }
      return t2;
    }
    disableEditing() {
      super.disableEditing();
      this.div.classList.toggle("disabled", true);
    }
    enableEditing() {
      super.enableEditing();
      this.div.classList.toggle("disabled", false);
    }
    fixAndSetPosition() {
      return super.fixAndSetPosition(this.#ar());
    }
    getBaseTranslation() {
      return [0, 0];
    }
    getRect(t2, e2) {
      return super.getRect(t2, e2, this.#ar());
    }
    onceAdded(t2) {
      this.annotationElementId || this.parent.addUndoableEditor(this);
      t2 && this.div.focus();
    }
    remove() {
      this.#rr();
      this._reportTelemetry({ action: "deleted" });
      super.remove();
    }
    rebuild() {
      if (this.parent) {
        super.rebuild();
        if (null !== this.div) {
          this.#tr();
          this.isAttachedToDOM || this.parent.add(this);
        }
      }
    }
    setParent(t2) {
      let e2 = false;
      if (this.parent && !t2) this.#rr();
      else if (t2) {
        this.#tr(t2);
        e2 = !this.parent && this.div?.classList.contains("selectedEditor");
      }
      super.setParent(t2);
      this.show(this._isVisible);
      e2 && this.select();
    }
    #nr(t2) {
      if (!this.#Xa) return;
      this.#Za({ highlightOutlines: this.#qa.getNewOutline(t2 / 2) });
      this.fixAndSetPosition();
      const [e2, i2] = this.parentDimensions;
      this.setDims(this.width * e2, this.height * i2);
    }
    #rr() {
      if (null !== this.#w && this.parent) {
        this.parent.drawLayer.remove(this.#w);
        this.#w = null;
        this.parent.drawLayer.remove(this.#Ya);
        this.#Ya = null;
      }
    }
    #tr(t2 = this.parent) {
      if (null === this.#w) {
        ({ id: this.#w, clipPathId: this.#Ga } = t2.drawLayer.draw({ bbox: this.#qa.box, root: { viewBox: "0 0 1 1", fill: this.color, "fill-opacity": this.#Ka }, rootClass: { highlight: true, free: this.#Xa }, path: { d: this.#qa.toSVGPath() } }, false, true));
        this.#Ya = t2.drawLayer.drawOutline({ rootClass: { highlightOutline: true, free: this.#Xa }, bbox: this.#$a.box, path: { d: this.#$a.toSVGPath() } }, this.#Xa);
        this.#Wa && (this.#Wa.style.clipPath = this.#Ga);
      }
    }
    static #ir([t2, e2, i2, s2], n2) {
      switch (n2) {
        case 90:
          return [1 - e2 - s2, t2, s2, i2];
        case 180:
          return [1 - t2 - i2, 1 - e2 - s2, i2, s2];
        case 270:
          return [e2, 1 - t2 - i2, s2, i2];
      }
      return [t2, e2, i2, s2];
    }
    rotate(t2) {
      const { drawLayer: e2 } = this.parent;
      let i2;
      if (this.#Xa) {
        t2 = (t2 - this.rotation + 360) % 360;
        i2 = _HighlightEditor.#ir(this.#qa.box, t2);
      } else i2 = _HighlightEditor.#ir([this.x, this.y, this.width, this.height], t2);
      e2.updateProperties(this.#w, { bbox: i2, root: { "data-main-rotation": t2 } });
      e2.updateProperties(this.#Ya, { bbox: _HighlightEditor.#ir(this.#$a.box, t2), root: { "data-main-rotation": t2 } });
    }
    render() {
      if (this.div) return this.div;
      const t2 = super.render();
      if (this.#Qa) {
        t2.setAttribute("aria-label", this.#Qa);
        t2.setAttribute("role", "mark");
      }
      this.#Xa ? t2.classList.add("free") : this.div.addEventListener("keydown", this.#or.bind(this), { signal: this._uiManager._signal });
      const e2 = this.#Wa = document.createElement("div");
      t2.append(e2);
      e2.setAttribute("aria-hidden", "true");
      e2.className = "internal";
      e2.style.clipPath = this.#Ga;
      const [i2, s2] = this.parentDimensions;
      this.setDims(this.width * i2, this.height * s2);
      bindEvents(this, this.#Wa, ["pointerover", "pointerleave"]);
      this.enableEditing();
      return t2;
    }
    pointerover() {
      this.isSelected || this.parent?.drawLayer.updateProperties(this.#Ya, { rootClass: { hovered: true } });
    }
    pointerleave() {
      this.isSelected || this.parent?.drawLayer.updateProperties(this.#Ya, { rootClass: { hovered: false } });
    }
    #or(t2) {
      _HighlightEditor._keyboardManager.exec(this, t2);
    }
    _moveCaret(t2) {
      this.parent.unselect(this);
      switch (t2) {
        case 0:
        case 2:
          this.#lr(true);
          break;
        case 1:
        case 3:
          this.#lr(false);
      }
    }
    #lr(t2) {
      if (!this.#Ha) return;
      const e2 = window.getSelection();
      t2 ? e2.setPosition(this.#Ha, this.#za) : e2.setPosition(this.#Va, this.#ja);
    }
    select() {
      super.select();
      this.#Ya && this.parent?.drawLayer.updateProperties(this.#Ya, { rootClass: { hovered: false, selected: true } });
    }
    unselect() {
      super.unselect();
      if (this.#Ya) {
        this.parent?.drawLayer.updateProperties(this.#Ya, { rootClass: { selected: false } });
        this.#Xa || this.#lr(false);
      }
    }
    get _mustFixPosition() {
      return !this.#Xa;
    }
    show(t2 = this._isVisible) {
      super.show(t2);
      if (this.parent) {
        this.parent.drawLayer.updateProperties(this.#w, { rootClass: { hidden: !t2 } });
        this.parent.drawLayer.updateProperties(this.#Ya, { rootClass: { hidden: !t2 } });
      }
    }
    #ar() {
      return this.#Xa ? this.rotation : 0;
    }
    #hr() {
      if (this.#Xa) return null;
      const [t2, e2] = this.pageDimensions, [i2, s2] = this.pageTranslation, n2 = this.#Ua, a2 = new Float32Array(8 * n2.length);
      let r2 = 0;
      for (const { x: o2, y: l2, width: h2, height: d2 } of n2) {
        const n3 = o2 * t2 + i2, c2 = (1 - l2) * e2 + s2;
        a2[r2] = a2[r2 + 4] = n3;
        a2[r2 + 1] = a2[r2 + 3] = c2;
        a2[r2 + 2] = a2[r2 + 6] = n3 + h2 * t2;
        a2[r2 + 5] = a2[r2 + 7] = c2 - d2 * e2;
        r2 += 8;
      }
      return a2;
    }
    #dr(t2) {
      return this.#qa.serialize(t2, this.#ar());
    }
    static startHighlighting(t2, e2, { target: i2, x: s2, y: n2 }) {
      const { x: a2, y: r2, width: o2, height: l2 } = i2.getBoundingClientRect(), h2 = new AbortController(), d2 = t2.combinedSignal(h2), pointerUpCallback = (e3) => {
        h2.abort();
        this.#cr(t2, e3);
      };
      window.addEventListener("blur", pointerUpCallback, { signal: d2 });
      window.addEventListener("pointerup", pointerUpCallback, { signal: d2 });
      window.addEventListener("pointerdown", stopEvent, { capture: true, passive: false, signal: d2 });
      window.addEventListener("contextmenu", noContextMenu, { signal: d2 });
      i2.addEventListener("pointermove", this.#ur.bind(this, t2), { signal: d2 });
      this._freeHighlight = new FreeHighlightOutliner({ x: s2, y: n2 }, [a2, r2, o2, l2], t2.scale, this._defaultThickness / 2, e2, 1e-3);
      ({ id: this._freeHighlightId, clipPathId: this._freeHighlightClipId } = t2.drawLayer.draw({ bbox: [0, 0, 1, 1], root: { viewBox: "0 0 1 1", fill: this._defaultColor, "fill-opacity": this._defaultOpacity }, rootClass: { highlight: true, free: true }, path: { d: this._freeHighlight.toSVGPath() } }, true, true));
    }
    static #ur(t2, e2) {
      this._freeHighlight.add(e2) && t2.drawLayer.updateProperties(this._freeHighlightId, { path: { d: this._freeHighlight.toSVGPath() } });
    }
    static #cr(t2, e2) {
      this._freeHighlight.isEmpty() ? t2.drawLayer.remove(this._freeHighlightId) : t2.createAndAddNewEditor(e2, false, { highlightId: this._freeHighlightId, highlightOutlines: this._freeHighlight.getOutlines(), clipPathId: this._freeHighlightClipId, methodOfCreation: "main_toolbar" });
      this._freeHighlightId = -1;
      this._freeHighlight = null;
      this._freeHighlightClipId = "";
    }
    static async deserialize(t2, e2, i2) {
      let s2 = null;
      if (t2 instanceof HighlightAnnotationElement) {
        const { data: { quadPoints: e3, rect: i3, rotation: n3, id: a3, color: r3, opacity: o3, popupRef: l3 }, parent: { page: { pageNumber: h3 } } } = t2;
        s2 = t2 = { annotationType: g.HIGHLIGHT, color: Array.from(r3), opacity: o3, quadPoints: e3, boxes: null, pageIndex: h3 - 1, rect: i3.slice(0), rotation: n3, id: a3, deleted: false, popupRef: l3 };
      } else if (t2 instanceof InkAnnotationElement) {
        const { data: { inkLists: e3, rect: i3, rotation: n3, id: a3, color: r3, borderStyle: { rawWidth: o3 }, popupRef: l3 }, parent: { page: { pageNumber: h3 } } } = t2;
        s2 = t2 = { annotationType: g.HIGHLIGHT, color: Array.from(r3), thickness: o3, inkLists: e3, boxes: null, pageIndex: h3 - 1, rect: i3.slice(0), rotation: n3, id: a3, deleted: false, popupRef: l3 };
      }
      const { color: n2, quadPoints: a2, inkLists: r2, opacity: o2 } = t2, l2 = await super.deserialize(t2, e2, i2);
      l2.color = Util.makeHexColor(...n2);
      l2.#Ka = o2 || 1;
      r2 && (l2.#ea = t2.thickness);
      l2.annotationElementId = t2.id || null;
      l2._initialData = s2;
      const [h2, d2] = l2.pageDimensions, [c2, u2] = l2.pageTranslation;
      if (a2) {
        const t3 = l2.#Ua = [];
        for (let e3 = 0; e3 < a2.length; e3 += 8) t3.push({ x: (a2[e3] - c2) / h2, y: 1 - (a2[e3 + 1] - u2) / d2, width: (a2[e3 + 2] - a2[e3]) / h2, height: (a2[e3 + 1] - a2[e3 + 5]) / d2 });
        l2.#er();
        l2.#tr();
        l2.rotate(l2.rotation);
      } else if (r2) {
        l2.#Xa = true;
        const t3 = r2[0], i3 = { x: t3[0] - c2, y: d2 - (t3[1] - u2) }, s3 = new FreeHighlightOutliner(i3, [0, 0, h2, d2], 1, l2.#ea / 2, true, 1e-3);
        for (let e3 = 0, n4 = t3.length; e3 < n4; e3 += 2) {
          i3.x = t3[e3] - c2;
          i3.y = d2 - (t3[e3 + 1] - u2);
          s3.add(i3);
        }
        const { id: n3, clipPathId: a3 } = e2.drawLayer.draw({ bbox: [0, 0, 1, 1], root: { viewBox: "0 0 1 1", fill: l2.color, "fill-opacity": l2._defaultOpacity }, rootClass: { highlight: true, free: true }, path: { d: s3.toSVGPath() } }, true, true);
        l2.#Za({ highlightOutlines: s3.getOutlines(), highlightId: n3, clipPathId: a3 });
        l2.#tr();
      }
      return l2;
    }
    serialize(t2 = false) {
      if (this.isEmpty() || t2) return null;
      if (this.deleted) return this.serializeDeleted();
      const e2 = this.getRect(0, 0), i2 = AnnotationEditor._colorManager.convert(this.color), s2 = { annotationType: g.HIGHLIGHT, color: i2, opacity: this.#Ka, thickness: this.#ea, quadPoints: this.#hr(), outlines: this.#dr(e2), pageIndex: this.pageIndex, rect: e2, rotation: this.#ar(), structTreeParentId: this._structTreeParentId };
      if (this.annotationElementId && !this.#$n(s2)) return null;
      s2.id = this.annotationElementId;
      return s2;
    }
    #$n(t2) {
      const { color: e2 } = this._initialData;
      return t2.color.some(((t3, i2) => t3 !== e2[i2]));
    }
    renderAnnotationElement(t2) {
      t2.updateEdited({ rect: this.getRect(0, 0) });
      return null;
    }
    static canCreateNewEmptyEditor() {
      return false;
    }
  };
  var DrawingOptions = class {
    #pr = /* @__PURE__ */ Object.create(null);
    updateProperty(t2, e2) {
      this[t2] = e2;
      this.updateSVGProperty(t2, e2);
    }
    updateProperties(t2) {
      if (t2) for (const [e2, i2] of Object.entries(t2)) this.updateProperty(e2, i2);
    }
    updateSVGProperty(t2, e2) {
      this.#pr[t2] = e2;
    }
    toSVGProperties() {
      const t2 = this.#pr;
      this.#pr = /* @__PURE__ */ Object.create(null);
      return { root: t2 };
    }
    reset() {
      this.#pr = /* @__PURE__ */ Object.create(null);
    }
    updateAll(t2 = this) {
      this.updateProperties(t2);
    }
    clone() {
      unreachable("Not implemented");
    }
  };
  var DrawingEditor = class _DrawingEditor extends AnnotationEditor {
    #gr = null;
    #mr;
    _drawId = null;
    static _currentDrawId = -1;
    static _currentParent = null;
    static #fr = null;
    static #br = null;
    static #Ar = null;
    static #wr = NaN;
    static #vr = null;
    static #yr = null;
    static #xr = NaN;
    static _INNER_MARGIN = 3;
    constructor(t2) {
      super(t2);
      this.#mr = t2.mustBeCommitted || false;
      if (t2.drawOutlines) {
        this.#_r(t2);
        this.#tr();
      }
    }
    #_r({ drawOutlines: t2, drawId: e2, drawingOptions: i2 }) {
      this.#gr = t2;
      this._drawingOptions ||= i2;
      if (e2 >= 0) {
        this._drawId = e2;
        this.parent.drawLayer.finalizeDraw(e2, t2.defaultProperties);
      } else this._drawId = this.#Er(t2, this.parent);
      this.#Sr(t2.box);
    }
    #Er(t2, e2) {
      const { id: i2 } = e2.drawLayer.draw(_DrawingEditor._mergeSVGProperties(this._drawingOptions.toSVGProperties(), t2.defaultSVGProperties), false, false);
      return i2;
    }
    static _mergeSVGProperties(t2, e2) {
      const i2 = new Set(Object.keys(t2));
      for (const [s2, n2] of Object.entries(e2)) i2.has(s2) ? Object.assign(t2[s2], n2) : t2[s2] = n2;
      return t2;
    }
    static getDefaultDrawingOptions(t2) {
      unreachable("Not implemented");
    }
    static get typesMap() {
      unreachable("Not implemented");
    }
    static get isDrawer() {
      return true;
    }
    static get supportMultipleDrawings() {
      return false;
    }
    static updateDefaultParams(t2, e2) {
      const i2 = this.typesMap.get(t2);
      i2 && this._defaultDrawingOptions.updateProperty(i2, e2);
      if (this._currentParent) {
        _DrawingEditor.#fr.updateProperty(i2, e2);
        this._currentParent.drawLayer.updateProperties(this._currentDrawId, this._defaultDrawingOptions.toSVGProperties());
      }
    }
    updateParams(t2, e2) {
      const i2 = this.constructor.typesMap.get(t2);
      i2 && this._updateProperty(t2, i2, e2);
    }
    static get defaultPropertiesToUpdate() {
      const t2 = [], e2 = this._defaultDrawingOptions;
      for (const [i2, s2] of this.typesMap) t2.push([i2, e2[s2]]);
      return t2;
    }
    get propertiesToUpdate() {
      const t2 = [], { _drawingOptions: e2 } = this;
      for (const [i2, s2] of this.constructor.typesMap) t2.push([i2, e2[s2]]);
      return t2;
    }
    _updateProperty(t2, e2, i2) {
      const s2 = this._drawingOptions, n2 = s2[e2], setter = (t3) => {
        s2.updateProperty(e2, t3);
        const i3 = this.#gr.updateProperty(e2, t3);
        i3 && this.#Sr(i3);
        this.parent?.drawLayer.updateProperties(this._drawId, s2.toSVGProperties());
      };
      this.addCommands({ cmd: setter.bind(this, i2), undo: setter.bind(this, n2), post: this._uiManager.updateUI.bind(this._uiManager, this), mustExec: true, type: t2, overwriteIfSameType: true, keepUndo: true });
    }
    _onResizing() {
      this.parent?.drawLayer.updateProperties(this._drawId, _DrawingEditor._mergeSVGProperties(this.#gr.getPathResizingSVGProperties(this.#Cr()), { bbox: this.#Tr() }));
    }
    _onResized() {
      this.parent?.drawLayer.updateProperties(this._drawId, _DrawingEditor._mergeSVGProperties(this.#gr.getPathResizedSVGProperties(this.#Cr()), { bbox: this.#Tr() }));
    }
    _onTranslating(t2, e2) {
      this.parent?.drawLayer.updateProperties(this._drawId, { bbox: this.#Tr(t2, e2) });
    }
    _onTranslated() {
      this.parent?.drawLayer.updateProperties(this._drawId, _DrawingEditor._mergeSVGProperties(this.#gr.getPathTranslatedSVGProperties(this.#Cr(), this.parentDimensions), { bbox: this.#Tr() }));
    }
    _onStartDragging() {
      this.parent?.drawLayer.updateProperties(this._drawId, { rootClass: { moving: true } });
    }
    _onStopDragging() {
      this.parent?.drawLayer.updateProperties(this._drawId, { rootClass: { moving: false } });
    }
    commit() {
      super.commit();
      this.disableEditMode();
      this.disableEditing();
    }
    disableEditing() {
      super.disableEditing();
      this.div.classList.toggle("disabled", true);
    }
    enableEditing() {
      super.enableEditing();
      this.div.classList.toggle("disabled", false);
    }
    getBaseTranslation() {
      return [0, 0];
    }
    get isResizable() {
      return true;
    }
    onceAdded(t2) {
      this.annotationElementId || this.parent.addUndoableEditor(this);
      this._isDraggable = true;
      if (this.#mr) {
        this.#mr = false;
        this.commit();
        this.parent.setSelected(this);
        t2 && this.isOnScreen && this.div.focus();
      }
    }
    remove() {
      this.#rr();
      super.remove();
    }
    rebuild() {
      if (this.parent) {
        super.rebuild();
        if (null !== this.div) {
          this.#tr();
          this.#Sr(this.#gr.box);
          this.isAttachedToDOM || this.parent.add(this);
        }
      }
    }
    setParent(t2) {
      let e2 = false;
      if (this.parent && !t2) {
        this._uiManager.removeShouldRescale(this);
        this.#rr();
      } else if (t2) {
        this._uiManager.addShouldRescale(this);
        this.#tr(t2);
        e2 = !this.parent && this.div?.classList.contains("selectedEditor");
      }
      super.setParent(t2);
      e2 && this.select();
    }
    #rr() {
      if (null !== this._drawId && this.parent) {
        this.parent.drawLayer.remove(this._drawId);
        this._drawId = null;
        this._drawingOptions.reset();
      }
    }
    #tr(t2 = this.parent) {
      if (null === this._drawId || this.parent !== t2) if (null === this._drawId) {
        this._drawingOptions.updateAll();
        this._drawId = this.#Er(this.#gr, t2);
      } else this.parent.drawLayer.updateParent(this._drawId, t2.drawLayer);
    }
    #Mr([t2, e2, i2, s2]) {
      const { parentDimensions: [n2, a2], rotation: r2 } = this;
      switch (r2) {
        case 90:
          return [e2, 1 - t2, i2 * (a2 / n2), s2 * (n2 / a2)];
        case 180:
          return [1 - t2, 1 - e2, i2, s2];
        case 270:
          return [1 - e2, t2, i2 * (a2 / n2), s2 * (n2 / a2)];
        default:
          return [t2, e2, i2, s2];
      }
    }
    #Cr() {
      const { x: t2, y: e2, width: i2, height: s2, parentDimensions: [n2, a2], rotation: r2 } = this;
      switch (r2) {
        case 90:
          return [1 - e2, t2, i2 * (n2 / a2), s2 * (a2 / n2)];
        case 180:
          return [1 - t2, 1 - e2, i2, s2];
        case 270:
          return [e2, 1 - t2, i2 * (n2 / a2), s2 * (a2 / n2)];
        default:
          return [t2, e2, i2, s2];
      }
    }
    #Sr(t2) {
      [this.x, this.y, this.width, this.height] = this.#Mr(t2);
      if (this.div) {
        this.fixAndSetPosition();
        const [t3, e2] = this.parentDimensions;
        this.setDims(this.width * t3, this.height * e2);
      }
      this._onResized();
    }
    #Tr() {
      const { x: t2, y: e2, width: i2, height: s2, rotation: n2, parentRotation: a2, parentDimensions: [r2, o2] } = this;
      switch ((4 * n2 + a2) / 90) {
        case 1:
          return [1 - e2 - s2, t2, s2, i2];
        case 2:
          return [1 - t2 - i2, 1 - e2 - s2, i2, s2];
        case 3:
          return [e2, 1 - t2 - i2, s2, i2];
        case 4:
          return [t2, e2 - i2 * (r2 / o2), s2 * (o2 / r2), i2 * (r2 / o2)];
        case 5:
          return [1 - e2, t2, i2 * (r2 / o2), s2 * (o2 / r2)];
        case 6:
          return [1 - t2 - s2 * (o2 / r2), 1 - e2, s2 * (o2 / r2), i2 * (r2 / o2)];
        case 7:
          return [e2 - i2 * (r2 / o2), 1 - t2 - s2 * (o2 / r2), i2 * (r2 / o2), s2 * (o2 / r2)];
        case 8:
          return [t2 - i2, e2 - s2, i2, s2];
        case 9:
          return [1 - e2, t2 - i2, s2, i2];
        case 10:
          return [1 - t2, 1 - e2, i2, s2];
        case 11:
          return [e2 - s2, 1 - t2, s2, i2];
        case 12:
          return [t2 - s2 * (o2 / r2), e2, s2 * (o2 / r2), i2 * (r2 / o2)];
        case 13:
          return [1 - e2 - i2 * (r2 / o2), t2 - s2 * (o2 / r2), i2 * (r2 / o2), s2 * (o2 / r2)];
        case 14:
          return [1 - t2, 1 - e2 - i2 * (r2 / o2), s2 * (o2 / r2), i2 * (r2 / o2)];
        case 15:
          return [e2, 1 - t2, i2 * (r2 / o2), s2 * (o2 / r2)];
        default:
          return [t2, e2, i2, s2];
      }
    }
    rotate() {
      this.parent && this.parent.drawLayer.updateProperties(this._drawId, _DrawingEditor._mergeSVGProperties({ bbox: this.#Tr() }, this.#gr.updateRotation((this.parentRotation - this.rotation + 360) % 360)));
    }
    onScaleChanging() {
      this.parent && this.#Sr(this.#gr.updateParentDimensions(this.parentDimensions, this.parent.scale));
    }
    static onScaleChangingWhenDrawing() {
    }
    render() {
      if (this.div) return this.div;
      const t2 = super.render();
      t2.classList.add("draw");
      const e2 = document.createElement("div");
      t2.append(e2);
      e2.setAttribute("aria-hidden", "true");
      e2.className = "internal";
      const [i2, s2] = this.parentDimensions;
      this.setDims(this.width * i2, this.height * s2);
      this._uiManager.addShouldRescale(this);
      this.disableEditing();
      return t2;
    }
    static createDrawerInstance(t2, e2, i2, s2, n2) {
      unreachable("Not implemented");
    }
    static startDrawing(t2, e2, i2, s2) {
      const { target: n2, offsetX: a2, offsetY: r2, pointerId: o2, pointerType: l2 } = s2;
      if (_DrawingEditor.#vr && _DrawingEditor.#vr !== l2) return;
      const { viewport: { rotation: h2 } } = t2, { width: d2, height: c2 } = n2.getBoundingClientRect(), u2 = _DrawingEditor.#br = new AbortController(), p2 = t2.combinedSignal(u2);
      _DrawingEditor.#wr ||= o2;
      _DrawingEditor.#vr ??= l2;
      window.addEventListener("pointerup", ((t3) => {
        _DrawingEditor.#wr === t3.pointerId ? this._endDraw(t3) : _DrawingEditor.#yr?.delete(t3.pointerId);
      }), { signal: p2 });
      window.addEventListener("pointercancel", ((t3) => {
        _DrawingEditor.#wr === t3.pointerId ? this._currentParent.endDrawingSession() : _DrawingEditor.#yr?.delete(t3.pointerId);
      }), { signal: p2 });
      window.addEventListener("pointerdown", ((t3) => {
        if (_DrawingEditor.#vr === t3.pointerType) {
          (_DrawingEditor.#yr ||= /* @__PURE__ */ new Set()).add(t3.pointerId);
          if (_DrawingEditor.#fr.isCancellable()) {
            _DrawingEditor.#fr.removeLastElement();
            _DrawingEditor.#fr.isEmpty() ? this._currentParent.endDrawingSession(true) : this._endDraw(null);
          }
        }
      }), { capture: true, passive: false, signal: p2 });
      window.addEventListener("contextmenu", noContextMenu, { signal: p2 });
      n2.addEventListener("pointermove", this._drawMove.bind(this), { signal: p2 });
      n2.addEventListener("touchmove", ((t3) => {
        t3.timeStamp === _DrawingEditor.#xr && stopEvent(t3);
      }), { signal: p2 });
      t2.toggleDrawing();
      e2._editorUndoBar?.hide();
      if (_DrawingEditor.#fr) t2.drawLayer.updateProperties(this._currentDrawId, _DrawingEditor.#fr.startNew(a2, r2, d2, c2, h2));
      else {
        e2.updateUIForDefaultProperties(this);
        _DrawingEditor.#fr = this.createDrawerInstance(a2, r2, d2, c2, h2);
        _DrawingEditor.#Ar = this.getDefaultDrawingOptions();
        this._currentParent = t2;
        ({ id: this._currentDrawId } = t2.drawLayer.draw(this._mergeSVGProperties(_DrawingEditor.#Ar.toSVGProperties(), _DrawingEditor.#fr.defaultSVGProperties), true, false));
      }
    }
    static _drawMove(t2) {
      _DrawingEditor.#xr = -1;
      if (!_DrawingEditor.#fr) return;
      const { offsetX: e2, offsetY: i2, pointerId: s2 } = t2;
      if (_DrawingEditor.#wr === s2) if (_DrawingEditor.#yr?.size >= 1) this._endDraw(t2);
      else {
        this._currentParent.drawLayer.updateProperties(this._currentDrawId, _DrawingEditor.#fr.add(e2, i2));
        _DrawingEditor.#xr = t2.timeStamp;
        stopEvent(t2);
      }
    }
    static _cleanup(t2) {
      if (t2) {
        this._currentDrawId = -1;
        this._currentParent = null;
        _DrawingEditor.#fr = null;
        _DrawingEditor.#Ar = null;
        _DrawingEditor.#vr = null;
        _DrawingEditor.#xr = NaN;
      }
      if (_DrawingEditor.#br) {
        _DrawingEditor.#br.abort();
        _DrawingEditor.#br = null;
        _DrawingEditor.#wr = NaN;
        _DrawingEditor.#yr = null;
      }
    }
    static _endDraw(t2) {
      const e2 = this._currentParent;
      if (e2) {
        e2.toggleDrawing(true);
        this._cleanup(false);
        t2 && e2.drawLayer.updateProperties(this._currentDrawId, _DrawingEditor.#fr.end(t2.offsetX, t2.offsetY));
        if (this.supportMultipleDrawings) {
          const t3 = _DrawingEditor.#fr, i2 = this._currentDrawId, s2 = t3.getLastElement();
          e2.addCommands({ cmd: () => {
            e2.drawLayer.updateProperties(i2, t3.setLastElement(s2));
          }, undo: () => {
            e2.drawLayer.updateProperties(i2, t3.removeLastElement());
          }, mustExec: false, type: m.DRAW_STEP });
        } else this.endDrawing(false);
      }
    }
    static endDrawing(t2) {
      const e2 = this._currentParent;
      if (!e2) return null;
      e2.toggleDrawing(true);
      e2.cleanUndoStack(m.DRAW_STEP);
      if (!_DrawingEditor.#fr.isEmpty()) {
        const { pageDimensions: [i2, s2], scale: n2 } = e2, a2 = e2.createAndAddNewEditor({ offsetX: 0, offsetY: 0 }, false, { drawId: this._currentDrawId, drawOutlines: _DrawingEditor.#fr.getOutlines(i2 * n2, s2 * n2, n2, this._INNER_MARGIN), drawingOptions: _DrawingEditor.#Ar, mustBeCommitted: !t2 });
        this._cleanup(true);
        return a2;
      }
      e2.drawLayer.remove(this._currentDrawId);
      this._cleanup(true);
      return null;
    }
    createDrawingOptions(t2) {
    }
    static deserializeDraw(t2, e2, i2, s2, n2, a2) {
      unreachable("Not implemented");
    }
    static async deserialize(t2, e2, i2) {
      const { rawDims: { pageWidth: s2, pageHeight: n2, pageX: a2, pageY: r2 } } = e2.viewport, o2 = this.deserializeDraw(a2, r2, s2, n2, this._INNER_MARGIN, t2), l2 = await super.deserialize(t2, e2, i2);
      l2.createDrawingOptions(t2);
      l2.#_r({ drawOutlines: o2 });
      l2.#tr();
      l2.onScaleChanging();
      l2.rotate();
      return l2;
    }
    serializeDraw(t2) {
      const [e2, i2] = this.pageTranslation, [s2, n2] = this.pageDimensions;
      return this.#gr.serialize([e2, i2, s2, n2], t2);
    }
    renderAnnotationElement(t2) {
      t2.updateEdited({ rect: this.getRect(0, 0) });
      return null;
    }
    static canCreateNewEmptyEditor() {
      return false;
    }
  };
  var InkDrawOutliner = class {
    #Kn = new Float64Array(6);
    #bn;
    #Pr;
    #Fi;
    #ea;
    #ia;
    #Dr = "";
    #kr = 0;
    #Ea = new InkDrawOutline();
    #Rr;
    #Ir;
    constructor(t2, e2, i2, s2, n2, a2) {
      this.#Rr = i2;
      this.#Ir = s2;
      this.#Fi = n2;
      this.#ea = a2;
      [t2, e2] = this.#Fr(t2, e2);
      const r2 = this.#bn = [NaN, NaN, NaN, NaN, t2, e2];
      this.#ia = [t2, e2];
      this.#Pr = [{ line: r2, points: this.#ia }];
      this.#Kn.set(r2, 0);
    }
    updateProperty(t2, e2) {
      "stroke-width" === t2 && (this.#ea = e2);
    }
    #Fr(t2, e2) {
      return Outline2._normalizePoint(t2, e2, this.#Rr, this.#Ir, this.#Fi);
    }
    isEmpty() {
      return !this.#Pr || 0 === this.#Pr.length;
    }
    isCancellable() {
      return this.#ia.length <= 10;
    }
    add(t2, e2) {
      [t2, e2] = this.#Fr(t2, e2);
      const [i2, s2, n2, a2] = this.#Kn.subarray(2, 6), r2 = t2 - n2, o2 = e2 - a2;
      if (Math.hypot(this.#Rr * r2, this.#Ir * o2) <= 2) return null;
      this.#ia.push(t2, e2);
      if (isNaN(i2)) {
        this.#Kn.set([n2, a2, t2, e2], 2);
        this.#bn.push(NaN, NaN, NaN, NaN, t2, e2);
        return { path: { d: this.toSVGPath() } };
      }
      isNaN(this.#Kn[0]) && this.#bn.splice(6, 6);
      this.#Kn.set([i2, s2, n2, a2, t2, e2], 0);
      this.#bn.push(...Outline2.createBezierPoints(i2, s2, n2, a2, t2, e2));
      return { path: { d: this.toSVGPath() } };
    }
    end(t2, e2) {
      const i2 = this.add(t2, e2);
      return i2 || (2 === this.#ia.length ? { path: { d: this.toSVGPath() } } : null);
    }
    startNew(t2, e2, i2, s2, n2) {
      this.#Rr = i2;
      this.#Ir = s2;
      this.#Fi = n2;
      [t2, e2] = this.#Fr(t2, e2);
      const a2 = this.#bn = [NaN, NaN, NaN, NaN, t2, e2];
      this.#ia = [t2, e2];
      const r2 = this.#Pr.at(-1);
      if (r2) {
        r2.line = new Float32Array(r2.line);
        r2.points = new Float32Array(r2.points);
      }
      this.#Pr.push({ line: a2, points: this.#ia });
      this.#Kn.set(a2, 0);
      this.#kr = 0;
      this.toSVGPath();
      return null;
    }
    getLastElement() {
      return this.#Pr.at(-1);
    }
    setLastElement(t2) {
      if (!this.#Pr) return this.#Ea.setLastElement(t2);
      this.#Pr.push(t2);
      this.#bn = t2.line;
      this.#ia = t2.points;
      this.#kr = 0;
      return { path: { d: this.toSVGPath() } };
    }
    removeLastElement() {
      if (!this.#Pr) return this.#Ea.removeLastElement();
      this.#Pr.pop();
      this.#Dr = "";
      for (let t2 = 0, e2 = this.#Pr.length; t2 < e2; t2++) {
        const { line: e3, points: i2 } = this.#Pr[t2];
        this.#bn = e3;
        this.#ia = i2;
        this.#kr = 0;
        this.toSVGPath();
      }
      return { path: { d: this.#Dr } };
    }
    toSVGPath() {
      const t2 = Outline2.svgRound(this.#bn[4]), e2 = Outline2.svgRound(this.#bn[5]);
      if (2 === this.#ia.length) {
        this.#Dr = `${this.#Dr} M ${t2} ${e2} Z`;
        return this.#Dr;
      }
      if (this.#ia.length <= 6) {
        const i3 = this.#Dr.lastIndexOf("M");
        this.#Dr = `${this.#Dr.slice(0, i3)} M ${t2} ${e2}`;
        this.#kr = 6;
      }
      if (4 === this.#ia.length) {
        const t3 = Outline2.svgRound(this.#bn[10]), e3 = Outline2.svgRound(this.#bn[11]);
        this.#Dr = `${this.#Dr} L ${t3} ${e3}`;
        this.#kr = 12;
        return this.#Dr;
      }
      const i2 = [];
      if (0 === this.#kr) {
        i2.push(`M ${t2} ${e2}`);
        this.#kr = 6;
      }
      for (let t3 = this.#kr, e3 = this.#bn.length; t3 < e3; t3 += 6) {
        const [e4, s2, n2, a2, r2, o2] = this.#bn.slice(t3, t3 + 6).map(Outline2.svgRound);
        i2.push(`C${e4} ${s2} ${n2} ${a2} ${r2} ${o2}`);
      }
      this.#Dr += i2.join(" ");
      this.#kr = this.#bn.length;
      return this.#Dr;
    }
    getOutlines(t2, e2, i2, s2) {
      const n2 = this.#Pr.at(-1);
      n2.line = new Float32Array(n2.line);
      n2.points = new Float32Array(n2.points);
      this.#Ea.build(this.#Pr, t2, e2, i2, this.#Fi, this.#ea, s2);
      this.#Kn = null;
      this.#bn = null;
      this.#Pr = null;
      this.#Dr = null;
      return this.#Ea;
    }
    get defaultSVGProperties() {
      return { root: { viewBox: "0 0 10000 10000" }, rootClass: { draw: true }, bbox: [0, 0, 1, 1] };
    }
  };
  var InkDrawOutline = class _InkDrawOutline extends Outline2 {
    #pa;
    #Lr = 0;
    #Wn;
    #Pr;
    #Rr;
    #Ir;
    #Or;
    #Fi;
    #ea;
    build(t2, e2, i2, s2, n2, a2, r2) {
      this.#Rr = e2;
      this.#Ir = i2;
      this.#Or = s2;
      this.#Fi = n2;
      this.#ea = a2;
      this.#Wn = r2 ?? 0;
      this.#Pr = t2;
      this.#Nr();
    }
    setLastElement(t2) {
      this.#Pr.push(t2);
      return { path: { d: this.toSVGPath() } };
    }
    removeLastElement() {
      this.#Pr.pop();
      return { path: { d: this.toSVGPath() } };
    }
    toSVGPath() {
      const t2 = [];
      for (const { line: e2 } of this.#Pr) {
        t2.push(`M${Outline2.svgRound(e2[4])} ${Outline2.svgRound(e2[5])}`);
        if (6 !== e2.length) if (12 !== e2.length) for (let i2 = 6, s2 = e2.length; i2 < s2; i2 += 6) {
          const [s3, n2, a2, r2, o2, l2] = e2.subarray(i2, i2 + 6).map(Outline2.svgRound);
          t2.push(`C${s3} ${n2} ${a2} ${r2} ${o2} ${l2}`);
        }
        else t2.push(`L${Outline2.svgRound(e2[10])} ${Outline2.svgRound(e2[11])}`);
        else t2.push("Z");
      }
      return t2.join("");
    }
    serialize([t2, e2, i2, s2], n2) {
      const a2 = [], r2 = [], [o2, l2, h2, d2] = this.#Br();
      let c2, u2, p2, g2, m2, f2, b2, A2, w2;
      switch (this.#Fi) {
        case 0:
          w2 = Outline2._rescale;
          c2 = t2;
          u2 = e2 + s2;
          p2 = i2;
          g2 = -s2;
          m2 = t2 + o2 * i2;
          f2 = e2 + (1 - l2 - d2) * s2;
          b2 = t2 + (o2 + h2) * i2;
          A2 = e2 + (1 - l2) * s2;
          break;
        case 90:
          w2 = Outline2._rescaleAndSwap;
          c2 = t2;
          u2 = e2;
          p2 = i2;
          g2 = s2;
          m2 = t2 + l2 * i2;
          f2 = e2 + o2 * s2;
          b2 = t2 + (l2 + d2) * i2;
          A2 = e2 + (o2 + h2) * s2;
          break;
        case 180:
          w2 = Outline2._rescale;
          c2 = t2 + i2;
          u2 = e2;
          p2 = -i2;
          g2 = s2;
          m2 = t2 + (1 - o2 - h2) * i2;
          f2 = e2 + l2 * s2;
          b2 = t2 + (1 - o2) * i2;
          A2 = e2 + (l2 + d2) * s2;
          break;
        case 270:
          w2 = Outline2._rescaleAndSwap;
          c2 = t2 + i2;
          u2 = e2 + s2;
          p2 = -i2;
          g2 = -s2;
          m2 = t2 + (1 - l2 - d2) * i2;
          f2 = e2 + (1 - o2 - h2) * s2;
          b2 = t2 + (1 - l2) * i2;
          A2 = e2 + (1 - o2) * s2;
      }
      for (const { line: t3, points: e3 } of this.#Pr) {
        a2.push(w2(t3, c2, u2, p2, g2, n2 ? new Array(t3.length) : null));
        r2.push(w2(e3, c2, u2, p2, g2, n2 ? new Array(e3.length) : null));
      }
      return { lines: a2, points: r2, rect: [m2, f2, b2, A2] };
    }
    static deserialize(t2, e2, i2, s2, n2, { paths: { lines: a2, points: r2 }, rotation: o2, thickness: l2 }) {
      const h2 = [];
      let d2, c2, u2, p2, g2;
      switch (o2) {
        case 0:
          g2 = Outline2._rescale;
          d2 = -t2 / i2;
          c2 = e2 / s2 + 1;
          u2 = 1 / i2;
          p2 = -1 / s2;
          break;
        case 90:
          g2 = Outline2._rescaleAndSwap;
          d2 = -e2 / s2;
          c2 = -t2 / i2;
          u2 = 1 / s2;
          p2 = 1 / i2;
          break;
        case 180:
          g2 = Outline2._rescale;
          d2 = t2 / i2 + 1;
          c2 = -e2 / s2;
          u2 = -1 / i2;
          p2 = 1 / s2;
          break;
        case 270:
          g2 = Outline2._rescaleAndSwap;
          d2 = e2 / s2 + 1;
          c2 = t2 / i2 + 1;
          u2 = -1 / s2;
          p2 = -1 / i2;
      }
      if (!a2) {
        a2 = [];
        for (const t3 of r2) {
          const e3 = t3.length;
          if (2 === e3) {
            a2.push(new Float32Array([NaN, NaN, NaN, NaN, t3[0], t3[1]]));
            continue;
          }
          if (4 === e3) {
            a2.push(new Float32Array([NaN, NaN, NaN, NaN, t3[0], t3[1], NaN, NaN, NaN, NaN, t3[2], t3[3]]));
            continue;
          }
          const i3 = new Float32Array(3 * (e3 - 2));
          a2.push(i3);
          let [s3, n3, r3, o3] = t3.subarray(0, 4);
          i3.set([NaN, NaN, NaN, NaN, s3, n3], 0);
          for (let a3 = 4; a3 < e3; a3 += 2) {
            const e4 = t3[a3], l3 = t3[a3 + 1];
            i3.set(Outline2.createBezierPoints(s3, n3, r3, o3, e4, l3), 3 * (a3 - 2));
            [s3, n3, r3, o3] = [r3, o3, e4, l3];
          }
        }
      }
      for (let t3 = 0, e3 = a2.length; t3 < e3; t3++) h2.push({ line: g2(a2[t3].map(((t4) => t4 ?? NaN)), d2, c2, u2, p2), points: g2(r2[t3].map(((t4) => t4 ?? NaN)), d2, c2, u2, p2) });
      const m2 = new _InkDrawOutline();
      m2.build(h2, i2, s2, 1, o2, l2, n2);
      return m2;
    }
    #Hr(t2 = this.#ea) {
      const e2 = this.#Wn + t2 / 2 * this.#Or;
      return this.#Fi % 180 == 0 ? [e2 / this.#Rr, e2 / this.#Ir] : [e2 / this.#Ir, e2 / this.#Rr];
    }
    #Br() {
      const [t2, e2, i2, s2] = this.#pa, [n2, a2] = this.#Hr(0);
      return [t2 + n2, e2 + a2, i2 - 2 * n2, s2 - 2 * a2];
    }
    #Nr() {
      const t2 = this.#pa = new Float32Array([1 / 0, 1 / 0, -1 / 0, -1 / 0]);
      for (const { line: e3 } of this.#Pr) {
        if (e3.length <= 12) {
          for (let i4 = 4, s3 = e3.length; i4 < s3; i4 += 6) {
            const [s4, n2] = e3.subarray(i4, i4 + 2);
            t2[0] = Math.min(t2[0], s4);
            t2[1] = Math.min(t2[1], n2);
            t2[2] = Math.max(t2[2], s4);
            t2[3] = Math.max(t2[3], n2);
          }
          continue;
        }
        let i3 = e3[4], s2 = e3[5];
        for (let n2 = 6, a2 = e3.length; n2 < a2; n2 += 6) {
          const [a3, r2, o2, l2, h2, d2] = e3.subarray(n2, n2 + 6);
          Util.bezierBoundingBox(i3, s2, a3, r2, o2, l2, h2, d2, t2);
          i3 = h2;
          s2 = d2;
        }
      }
      const [e2, i2] = this.#Hr();
      t2[0] = Math.min(1, Math.max(0, t2[0] - e2));
      t2[1] = Math.min(1, Math.max(0, t2[1] - i2));
      t2[2] = Math.min(1, Math.max(0, t2[2] + e2));
      t2[3] = Math.min(1, Math.max(0, t2[3] + i2));
      t2[2] -= t2[0];
      t2[3] -= t2[1];
    }
    get box() {
      return this.#pa;
    }
    updateProperty(t2, e2) {
      return "stroke-width" === t2 ? this.#sr(e2) : null;
    }
    #sr(t2) {
      const [e2, i2] = this.#Hr();
      this.#ea = t2;
      const [s2, n2] = this.#Hr(), [a2, r2] = [s2 - e2, n2 - i2], o2 = this.#pa;
      o2[0] -= a2;
      o2[1] -= r2;
      o2[2] += 2 * a2;
      o2[3] += 2 * r2;
      return o2;
    }
    updateParentDimensions([t2, e2], i2) {
      const [s2, n2] = this.#Hr();
      this.#Rr = t2;
      this.#Ir = e2;
      this.#Or = i2;
      const [a2, r2] = this.#Hr(), o2 = a2 - s2, l2 = r2 - n2, h2 = this.#pa;
      h2[0] -= o2;
      h2[1] -= l2;
      h2[2] += 2 * o2;
      h2[3] += 2 * l2;
      return h2;
    }
    updateRotation(t2) {
      this.#Lr = t2;
      return { path: { transform: this.rotationTransform } };
    }
    get viewBox() {
      return this.#pa.map(Outline2.svgRound).join(" ");
    }
    get defaultProperties() {
      const [t2, e2] = this.#pa;
      return { root: { viewBox: this.viewBox }, path: { "transform-origin": `${Outline2.svgRound(t2)} ${Outline2.svgRound(e2)}` } };
    }
    get rotationTransform() {
      const [, , t2, e2] = this.#pa;
      let i2 = 0, s2 = 0, n2 = 0, a2 = 0, r2 = 0, o2 = 0;
      switch (this.#Lr) {
        case 90:
          s2 = e2 / t2;
          n2 = -t2 / e2;
          r2 = t2;
          break;
        case 180:
          i2 = -1;
          a2 = -1;
          r2 = t2;
          o2 = e2;
          break;
        case 270:
          s2 = -e2 / t2;
          n2 = t2 / e2;
          o2 = e2;
          break;
        default:
          return "";
      }
      return `matrix(${i2} ${s2} ${n2} ${a2} ${Outline2.svgRound(r2)} ${Outline2.svgRound(o2)})`;
    }
    getPathResizingSVGProperties([t2, e2, i2, s2]) {
      const [n2, a2] = this.#Hr(), [r2, o2, l2, h2] = this.#pa;
      if (Math.abs(l2 - n2) <= Outline2.PRECISION || Math.abs(h2 - a2) <= Outline2.PRECISION) {
        const n3 = t2 + i2 / 2 - (r2 + l2 / 2), a3 = e2 + s2 / 2 - (o2 + h2 / 2);
        return { path: { "transform-origin": `${Outline2.svgRound(t2)} ${Outline2.svgRound(e2)}`, transform: `${this.rotationTransform} translate(${n3} ${a3})` } };
      }
      const d2 = (i2 - 2 * n2) / (l2 - 2 * n2), c2 = (s2 - 2 * a2) / (h2 - 2 * a2), u2 = l2 / i2, p2 = h2 / s2;
      return { path: { "transform-origin": `${Outline2.svgRound(r2)} ${Outline2.svgRound(o2)}`, transform: `${this.rotationTransform} scale(${u2} ${p2}) translate(${Outline2.svgRound(n2)} ${Outline2.svgRound(a2)}) scale(${d2} ${c2}) translate(${Outline2.svgRound(-n2)} ${Outline2.svgRound(-a2)})` } };
    }
    getPathResizedSVGProperties([t2, e2, i2, s2]) {
      const [n2, a2] = this.#Hr(), r2 = this.#pa, [o2, l2, h2, d2] = r2;
      r2[0] = t2;
      r2[1] = e2;
      r2[2] = i2;
      r2[3] = s2;
      if (Math.abs(h2 - n2) <= Outline2.PRECISION || Math.abs(d2 - a2) <= Outline2.PRECISION) {
        const n3 = t2 + i2 / 2 - (o2 + h2 / 2), a3 = e2 + s2 / 2 - (l2 + d2 / 2);
        for (const { line: t3, points: e3 } of this.#Pr) {
          Outline2._translate(t3, n3, a3, t3);
          Outline2._translate(e3, n3, a3, e3);
        }
        return { root: { viewBox: this.viewBox }, path: { "transform-origin": `${Outline2.svgRound(t2)} ${Outline2.svgRound(e2)}`, transform: this.rotationTransform || null, d: this.toSVGPath() } };
      }
      const c2 = (i2 - 2 * n2) / (h2 - 2 * n2), u2 = (s2 - 2 * a2) / (d2 - 2 * a2), p2 = -c2 * (o2 + n2) + t2 + n2, g2 = -u2 * (l2 + a2) + e2 + a2;
      if (1 !== c2 || 1 !== u2 || 0 !== p2 || 0 !== g2) for (const { line: t3, points: e3 } of this.#Pr) {
        Outline2._rescale(t3, p2, g2, c2, u2, t3);
        Outline2._rescale(e3, p2, g2, c2, u2, e3);
      }
      return { root: { viewBox: this.viewBox }, path: { "transform-origin": `${Outline2.svgRound(t2)} ${Outline2.svgRound(e2)}`, transform: this.rotationTransform || null, d: this.toSVGPath() } };
    }
    getPathTranslatedSVGProperties([t2, e2], i2) {
      const [s2, n2] = i2, a2 = this.#pa, r2 = t2 - a2[0], o2 = e2 - a2[1];
      if (this.#Rr === s2 && this.#Ir === n2) for (const { line: t3, points: e3 } of this.#Pr) {
        Outline2._translate(t3, r2, o2, t3);
        Outline2._translate(e3, r2, o2, e3);
      }
      else {
        const t3 = this.#Rr / s2, e3 = this.#Ir / n2;
        this.#Rr = s2;
        this.#Ir = n2;
        for (const { line: i3, points: s3 } of this.#Pr) {
          Outline2._rescale(i3, r2, o2, t3, e3, i3);
          Outline2._rescale(s3, r2, o2, t3, e3, s3);
        }
        a2[2] *= t3;
        a2[3] *= e3;
      }
      a2[0] = t2;
      a2[1] = e2;
      return { root: { viewBox: this.viewBox }, path: { d: this.toSVGPath(), "transform-origin": `${Outline2.svgRound(t2)} ${Outline2.svgRound(e2)}` } };
    }
    get defaultSVGProperties() {
      const t2 = this.#pa;
      return { root: { viewBox: this.viewBox }, rootClass: { draw: true }, path: { d: this.toSVGPath(), "transform-origin": `${Outline2.svgRound(t2[0])} ${Outline2.svgRound(t2[1])}`, transform: this.rotationTransform || null }, bbox: t2 };
    }
  };
  var InkDrawingOptions = class _InkDrawingOptions extends DrawingOptions {
    #zr;
    constructor(t2) {
      super();
      this.#zr = t2;
      super.updateProperties({ fill: "none", stroke: AnnotationEditor._defaultLineColor, "stroke-opacity": 1, "stroke-width": 1, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-miterlimit": 10 });
    }
    updateSVGProperty(t2, e2) {
      if ("stroke-width" === t2) {
        e2 ??= this["stroke-width"];
        e2 *= this.#zr.realScale;
      }
      super.updateSVGProperty(t2, e2);
    }
    clone() {
      const t2 = new _InkDrawingOptions(this.#zr);
      t2.updateAll(this);
      return t2;
    }
  };
  var InkEditor = class _InkEditor extends DrawingEditor {
    static _type = "ink";
    static _editorType = g.INK;
    static _defaultDrawingOptions = null;
    constructor(t2) {
      super({ ...t2, name: "inkEditor" });
      this._willKeepAspectRatio = true;
    }
    static initialize(t2, e2) {
      AnnotationEditor.initialize(t2, e2);
      this._defaultDrawingOptions = new InkDrawingOptions(e2.viewParameters);
    }
    static getDefaultDrawingOptions(t2) {
      const e2 = this._defaultDrawingOptions.clone();
      e2.updateProperties(t2);
      return e2;
    }
    static get supportMultipleDrawings() {
      return true;
    }
    static get typesMap() {
      return shadow(this, "typesMap", /* @__PURE__ */ new Map([[m.INK_THICKNESS, "stroke-width"], [m.INK_COLOR, "stroke"], [m.INK_OPACITY, "stroke-opacity"]]));
    }
    static createDrawerInstance(t2, e2, i2, s2, n2) {
      return new InkDrawOutliner(t2, e2, i2, s2, n2, this._defaultDrawingOptions["stroke-width"]);
    }
    static deserializeDraw(t2, e2, i2, s2, n2, a2) {
      return InkDrawOutline.deserialize(t2, e2, i2, s2, n2, a2);
    }
    static async deserialize(t2, e2, i2) {
      let s2 = null;
      if (t2 instanceof InkAnnotationElement) {
        const { data: { inkLists: e3, rect: i3, rotation: n3, id: a2, color: r2, opacity: o2, borderStyle: { rawWidth: l2 }, popupRef: h2 }, parent: { page: { pageNumber: d2 } } } = t2;
        s2 = t2 = { annotationType: g.INK, color: Array.from(r2), thickness: l2, opacity: o2, paths: { points: e3 }, boxes: null, pageIndex: d2 - 1, rect: i3.slice(0), rotation: n3, id: a2, deleted: false, popupRef: h2 };
      }
      const n2 = await super.deserialize(t2, e2, i2);
      n2.annotationElementId = t2.id || null;
      n2._initialData = s2;
      return n2;
    }
    onScaleChanging() {
      if (!this.parent) return;
      super.onScaleChanging();
      const { _drawId: t2, _drawingOptions: e2, parent: i2 } = this;
      e2.updateSVGProperty("stroke-width");
      i2.drawLayer.updateProperties(t2, e2.toSVGProperties());
    }
    static onScaleChangingWhenDrawing() {
      const t2 = this._currentParent;
      if (t2) {
        super.onScaleChangingWhenDrawing();
        this._defaultDrawingOptions.updateSVGProperty("stroke-width");
        t2.drawLayer.updateProperties(this._currentDrawId, this._defaultDrawingOptions.toSVGProperties());
      }
    }
    createDrawingOptions({ color: t2, thickness: e2, opacity: i2 }) {
      this._drawingOptions = _InkEditor.getDefaultDrawingOptions({ stroke: Util.makeHexColor(...t2), "stroke-width": e2, "stroke-opacity": i2 });
    }
    serialize(t2 = false) {
      if (this.isEmpty()) return null;
      if (this.deleted) return this.serializeDeleted();
      const { lines: e2, points: i2, rect: s2 } = this.serializeDraw(t2), { _drawingOptions: { stroke: n2, "stroke-opacity": a2, "stroke-width": r2 } } = this, o2 = { annotationType: g.INK, color: AnnotationEditor._colorManager.convert(n2), opacity: a2, thickness: r2, paths: { lines: e2, points: i2 }, pageIndex: this.pageIndex, rect: s2, rotation: this.rotation, structTreeParentId: this._structTreeParentId };
      if (t2) return o2;
      if (this.annotationElementId && !this.#$n(o2)) return null;
      o2.id = this.annotationElementId;
      return o2;
    }
    #$n(t2) {
      const { color: e2, thickness: i2, opacity: s2, pageIndex: n2 } = this._initialData;
      return this._hasBeenMoved || this._hasBeenResized || t2.color.some(((t3, i3) => t3 !== e2[i3])) || t2.thickness !== i2 || t2.opacity !== s2 || t2.pageIndex !== n2;
    }
    renderAnnotationElement(t2) {
      const { points: e2, rect: i2 } = this.serializeDraw(false);
      t2.updateEdited({ rect: i2, thickness: this._drawingOptions["stroke-width"], points: e2 });
      return null;
    }
  };
  var StampEditor = class _StampEditor extends AnnotationEditor {
    #Ur = null;
    #Gr = null;
    #$r = null;
    #Vr = null;
    #jr = null;
    #Wr = "";
    #qr = null;
    #Xr = null;
    #Kr = false;
    #Yr = false;
    static _type = "stamp";
    static _editorType = g.STAMP;
    constructor(t2) {
      super({ ...t2, name: "stampEditor" });
      this.#Vr = t2.bitmapUrl;
      this.#jr = t2.bitmapFile;
    }
    static initialize(t2, e2) {
      AnnotationEditor.initialize(t2, e2);
    }
    static get supportedTypes() {
      return shadow(this, "supportedTypes", ["apng", "avif", "bmp", "gif", "jpeg", "png", "svg+xml", "webp", "x-icon"].map(((t2) => `image/${t2}`)));
    }
    static get supportedTypesStr() {
      return shadow(this, "supportedTypesStr", this.supportedTypes.join(","));
    }
    static isHandlingMimeForPasting(t2) {
      return this.supportedTypes.includes(t2);
    }
    static paste(t2, e2) {
      e2.pasteEditor(g.STAMP, { bitmapFile: t2.getAsFile() });
    }
    altTextFinish() {
      this._uiManager.useNewAltTextFlow && (this.div.hidden = false);
      super.altTextFinish();
    }
    get telemetryFinalData() {
      return { type: "stamp", hasAltText: !!this.altTextData?.altText };
    }
    static computeTelemetryFinalData(t2) {
      const e2 = t2.get("hasAltText");
      return { hasAltText: e2.get(true) ?? 0, hasNoAltText: e2.get(false) ?? 0 };
    }
    #Qr(t2, e2 = false) {
      if (t2) {
        this.#Ur = t2.bitmap;
        if (!e2) {
          this.#Gr = t2.id;
          this.#Kr = t2.isSvg;
        }
        t2.file && (this.#Wr = t2.file.name);
        this.#Jr();
      } else this.remove();
    }
    #Zr() {
      this.#$r = null;
      this._uiManager.enableWaiting(false);
      if (this.#qr) if (this._uiManager.useNewAltTextWhenAddingImage && this._uiManager.useNewAltTextFlow && this.#Ur) {
        this._editToolbar.hide();
        this._uiManager.editAltText(this, true);
      } else {
        if (!this._uiManager.useNewAltTextWhenAddingImage && this._uiManager.useNewAltTextFlow && this.#Ur) {
          this._reportTelemetry({ action: "pdfjs.image.image_added", data: { alt_text_modal: false, alt_text_type: "empty" } });
          try {
            this.mlGuessAltText();
          } catch {
          }
        }
        this.div.focus();
      }
    }
    async mlGuessAltText(t2 = null, e2 = true) {
      if (this.hasAltTextData()) return null;
      const { mlManager: i2 } = this._uiManager;
      if (!i2) throw new Error("No ML.");
      if (!await i2.isEnabledFor("altText")) throw new Error("ML isn't enabled for alt text.");
      const { data: s2, width: n2, height: a2 } = t2 || this.copyCanvas(null, null, true).imageData, r2 = await i2.guess({ name: "altText", request: { data: s2, width: n2, height: a2, channels: s2.length / (n2 * a2) } });
      if (!r2) throw new Error("No response from the AI service.");
      if (r2.error) throw new Error("Error from the AI service.");
      if (r2.cancel) return null;
      if (!r2.output) throw new Error("No valid response from the AI service.");
      const o2 = r2.output;
      await this.setGuessedAltText(o2);
      e2 && !this.hasAltTextData() && (this.altTextData = { alt: o2, decorative: false });
      return o2;
    }
    #to() {
      if (this.#Gr) {
        this._uiManager.enableWaiting(true);
        this._uiManager.imageManager.getFromId(this.#Gr).then(((t3) => this.#Qr(t3, true))).finally((() => this.#Zr()));
        return;
      }
      if (this.#Vr) {
        const t3 = this.#Vr;
        this.#Vr = null;
        this._uiManager.enableWaiting(true);
        this.#$r = this._uiManager.imageManager.getFromUrl(t3).then(((t4) => this.#Qr(t4))).finally((() => this.#Zr()));
        return;
      }
      if (this.#jr) {
        const t3 = this.#jr;
        this.#jr = null;
        this._uiManager.enableWaiting(true);
        this.#$r = this._uiManager.imageManager.getFromFile(t3).then(((t4) => this.#Qr(t4))).finally((() => this.#Zr()));
        return;
      }
      const t2 = document.createElement("input");
      t2.type = "file";
      t2.accept = _StampEditor.supportedTypesStr;
      const e2 = this._uiManager._signal;
      this.#$r = new Promise(((i2) => {
        t2.addEventListener("change", (async () => {
          if (t2.files && 0 !== t2.files.length) {
            this._uiManager.enableWaiting(true);
            const e3 = await this._uiManager.imageManager.getFromFile(t2.files[0]);
            this._reportTelemetry({ action: "pdfjs.image.image_selected", data: { alt_text_modal: this._uiManager.useNewAltTextFlow } });
            this.#Qr(e3);
          } else this.remove();
          i2();
        }), { signal: e2 });
        t2.addEventListener("cancel", (() => {
          this.remove();
          i2();
        }), { signal: e2 });
      })).finally((() => this.#Zr()));
      t2.click();
    }
    remove() {
      if (this.#Gr) {
        this.#Ur = null;
        this._uiManager.imageManager.deleteId(this.#Gr);
        this.#qr?.remove();
        this.#qr = null;
        if (this.#Xr) {
          clearTimeout(this.#Xr);
          this.#Xr = null;
        }
      }
      super.remove();
    }
    rebuild() {
      if (this.parent) {
        super.rebuild();
        if (null !== this.div) {
          this.#Gr && null === this.#qr && this.#to();
          this.isAttachedToDOM || this.parent.add(this);
        }
      } else this.#Gr && this.#to();
    }
    onceAdded(t2) {
      this._isDraggable = true;
      t2 && this.div.focus();
    }
    isEmpty() {
      return !(this.#$r || this.#Ur || this.#Vr || this.#jr || this.#Gr);
    }
    get isResizable() {
      return true;
    }
    render() {
      if (this.div) return this.div;
      let t2, e2;
      if (this.width) {
        t2 = this.x;
        e2 = this.y;
      }
      super.render();
      this.div.hidden = true;
      this.div.setAttribute("role", "figure");
      this.addAltTextButton();
      this.#Ur ? this.#Jr() : this.#to();
      if (this.width && !this.annotationElementId) {
        const [i2, s2] = this.parentDimensions;
        this.setAt(t2 * i2, e2 * s2, this.width * i2, this.height * s2);
      }
      this._uiManager.addShouldRescale(this);
      return this.div;
    }
    _onResized() {
      this.onScaleChanging();
    }
    onScaleChanging() {
      if (!this.parent) return;
      null !== this.#Xr && clearTimeout(this.#Xr);
      this.#Xr = setTimeout((() => {
        this.#Xr = null;
        this.#eo();
      }), 200);
    }
    #Jr() {
      const { div: t2 } = this;
      let { width: e2, height: i2 } = this.#Ur;
      const [s2, n2] = this.pageDimensions, a2 = 0.75;
      if (this.width) {
        e2 = this.width * s2;
        i2 = this.height * n2;
      } else if (e2 > a2 * s2 || i2 > a2 * n2) {
        const t3 = Math.min(a2 * s2 / e2, a2 * n2 / i2);
        e2 *= t3;
        i2 *= t3;
      }
      const [r2, o2] = this.parentDimensions;
      this.setDims(e2 * r2 / s2, i2 * o2 / n2);
      this._uiManager.enableWaiting(false);
      const l2 = this.#qr = document.createElement("canvas");
      l2.setAttribute("role", "img");
      this.addContainer(l2);
      this.width = e2 / s2;
      this.height = i2 / n2;
      this._initialOptions?.isCentered ? this.center() : this.fixAndSetPosition();
      this._initialOptions = null;
      this._uiManager.useNewAltTextWhenAddingImage && this._uiManager.useNewAltTextFlow && !this.annotationElementId || (t2.hidden = false);
      this.#eo();
      if (!this.#Yr) {
        this.parent.addUndoableEditor(this);
        this.#Yr = true;
      }
      this._reportTelemetry({ action: "inserted_image" });
      this.#Wr && l2.setAttribute("aria-label", this.#Wr);
    }
    copyCanvas(t2, e2, i2 = false) {
      t2 || (t2 = 224);
      const { width: s2, height: n2 } = this.#Ur, a2 = new OutputScale();
      let r2 = this.#Ur, o2 = s2, l2 = n2, h2 = null;
      if (e2) {
        if (s2 > e2 || n2 > e2) {
          const t4 = Math.min(e2 / s2, e2 / n2);
          o2 = Math.floor(s2 * t4);
          l2 = Math.floor(n2 * t4);
        }
        h2 = document.createElement("canvas");
        const t3 = h2.width = Math.ceil(o2 * a2.sx), i3 = h2.height = Math.ceil(l2 * a2.sy);
        this.#Kr || (r2 = this.#io(t3, i3));
        const d3 = h2.getContext("2d");
        d3.filter = this._uiManager.hcmFilter;
        let c2 = "white", u2 = "#cfcfd8";
        if ("none" !== this._uiManager.hcmFilter) u2 = "black";
        else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
          c2 = "#8f8f9d";
          u2 = "#42414d";
        }
        const p2 = 15, g2 = p2 * a2.sx, m2 = p2 * a2.sy, f2 = new OffscreenCanvas(2 * g2, 2 * m2), b2 = f2.getContext("2d");
        b2.fillStyle = c2;
        b2.fillRect(0, 0, 2 * g2, 2 * m2);
        b2.fillStyle = u2;
        b2.fillRect(0, 0, g2, m2);
        b2.fillRect(g2, m2, g2, m2);
        d3.fillStyle = d3.createPattern(f2, "repeat");
        d3.fillRect(0, 0, t3, i3);
        d3.drawImage(r2, 0, 0, r2.width, r2.height, 0, 0, t3, i3);
      }
      let d2 = null;
      if (i2) {
        let e3, i3;
        if (a2.symmetric && r2.width < t2 && r2.height < t2) {
          e3 = r2.width;
          i3 = r2.height;
        } else {
          r2 = this.#Ur;
          if (s2 > t2 || n2 > t2) {
            const a3 = Math.min(t2 / s2, t2 / n2);
            e3 = Math.floor(s2 * a3);
            i3 = Math.floor(n2 * a3);
            this.#Kr || (r2 = this.#io(e3, i3));
          }
        }
        const o3 = new OffscreenCanvas(e3, i3).getContext("2d", { willReadFrequently: true });
        o3.drawImage(r2, 0, 0, r2.width, r2.height, 0, 0, e3, i3);
        d2 = { width: e3, height: i3, data: o3.getImageData(0, 0, e3, i3).data };
      }
      return { canvas: h2, width: o2, height: l2, imageData: d2 };
    }
    #io(t2, e2) {
      const { width: i2, height: s2 } = this.#Ur;
      let n2 = i2, a2 = s2, r2 = this.#Ur;
      for (; n2 > 2 * t2 || a2 > 2 * e2; ) {
        const i3 = n2, s3 = a2;
        n2 > 2 * t2 && (n2 = n2 >= 16384 ? Math.floor(n2 / 2) - 1 : Math.ceil(n2 / 2));
        a2 > 2 * e2 && (a2 = a2 >= 16384 ? Math.floor(a2 / 2) - 1 : Math.ceil(a2 / 2));
        const o2 = new OffscreenCanvas(n2, a2);
        o2.getContext("2d").drawImage(r2, 0, 0, i3, s3, 0, 0, n2, a2);
        r2 = o2.transferToImageBitmap();
      }
      return r2;
    }
    #eo() {
      const [t2, e2] = this.parentDimensions, { width: i2, height: s2 } = this, n2 = new OutputScale(), a2 = Math.ceil(i2 * t2 * n2.sx), r2 = Math.ceil(s2 * e2 * n2.sy), o2 = this.#qr;
      if (!o2 || o2.width === a2 && o2.height === r2) return;
      o2.width = a2;
      o2.height = r2;
      const l2 = this.#Kr ? this.#Ur : this.#io(a2, r2), h2 = o2.getContext("2d");
      h2.filter = this._uiManager.hcmFilter;
      h2.drawImage(l2, 0, 0, l2.width, l2.height, 0, 0, a2, r2);
    }
    getImageForAltText() {
      return this.#qr;
    }
    #so(t2) {
      if (t2) {
        if (this.#Kr) {
          const t4 = this._uiManager.imageManager.getSvgUrl(this.#Gr);
          if (t4) return t4;
        }
        const t3 = document.createElement("canvas");
        ({ width: t3.width, height: t3.height } = this.#Ur);
        t3.getContext("2d").drawImage(this.#Ur, 0, 0);
        return t3.toDataURL();
      }
      if (this.#Kr) {
        const [t3, e2] = this.pageDimensions, i2 = Math.round(this.width * t3 * PixelsPerInch.PDF_TO_CSS_UNITS), s2 = Math.round(this.height * e2 * PixelsPerInch.PDF_TO_CSS_UNITS), n2 = new OffscreenCanvas(i2, s2);
        n2.getContext("2d").drawImage(this.#Ur, 0, 0, this.#Ur.width, this.#Ur.height, 0, 0, i2, s2);
        return n2.transferToImageBitmap();
      }
      return structuredClone(this.#Ur);
    }
    static async deserialize(t2, e2, i2) {
      let s2 = null;
      if (t2 instanceof StampAnnotationElement) {
        const { data: { rect: n3, rotation: a3, id: r3, structParent: o3, popupRef: l3 }, container: h3, parent: { page: { pageNumber: d3 } } } = t2, c3 = h3.querySelector("canvas"), u3 = i2.imageManager.getFromCanvas(h3.id, c3);
        c3.remove();
        const p2 = (await e2._structTree.getAriaAttributes(`${et}${r3}`))?.get("aria-label") || "";
        s2 = t2 = { annotationType: g.STAMP, bitmapId: u3.id, bitmap: u3.bitmap, pageIndex: d3 - 1, rect: n3.slice(0), rotation: a3, id: r3, deleted: false, accessibilityData: { decorative: false, altText: p2 }, isSvg: false, structParent: o3, popupRef: l3 };
      }
      const n2 = await super.deserialize(t2, e2, i2), { rect: a2, bitmap: r2, bitmapUrl: o2, bitmapId: l2, isSvg: h2, accessibilityData: d2 } = t2;
      if (l2 && i2.imageManager.isValidId(l2)) {
        n2.#Gr = l2;
        r2 && (n2.#Ur = r2);
      } else n2.#Vr = o2;
      n2.#Kr = h2;
      const [c2, u2] = n2.pageDimensions;
      n2.width = (a2[2] - a2[0]) / c2;
      n2.height = (a2[3] - a2[1]) / u2;
      n2.annotationElementId = t2.id || null;
      d2 && (n2.altTextData = d2);
      n2._initialData = s2;
      n2.#Yr = !!s2;
      return n2;
    }
    serialize(t2 = false, e2 = null) {
      if (this.isEmpty()) return null;
      if (this.deleted) return this.serializeDeleted();
      const i2 = { annotationType: g.STAMP, bitmapId: this.#Gr, pageIndex: this.pageIndex, rect: this.getRect(0, 0), rotation: this.rotation, isSvg: this.#Kr, structTreeParentId: this._structTreeParentId };
      if (t2) {
        i2.bitmapUrl = this.#so(true);
        i2.accessibilityData = this.serializeAltText(true);
        return i2;
      }
      const { decorative: s2, altText: n2 } = this.serializeAltText(false);
      !s2 && n2 && (i2.accessibilityData = { type: "Figure", alt: n2 });
      if (this.annotationElementId) {
        const t3 = this.#$n(i2);
        if (t3.isSame) return null;
        t3.isSameAltText ? delete i2.accessibilityData : i2.accessibilityData.structParent = this._initialData.structParent ?? -1;
      }
      i2.id = this.annotationElementId;
      if (null === e2) return i2;
      e2.stamps ||= /* @__PURE__ */ new Map();
      const a2 = this.#Kr ? (i2.rect[2] - i2.rect[0]) * (i2.rect[3] - i2.rect[1]) : null;
      if (e2.stamps.has(this.#Gr)) {
        if (this.#Kr) {
          const t3 = e2.stamps.get(this.#Gr);
          if (a2 > t3.area) {
            t3.area = a2;
            t3.serialized.bitmap.close();
            t3.serialized.bitmap = this.#so(false);
          }
        }
      } else {
        e2.stamps.set(this.#Gr, { area: a2, serialized: i2 });
        i2.bitmap = this.#so(false);
      }
      return i2;
    }
    #$n(t2) {
      const { pageIndex: e2, accessibilityData: { altText: i2 } } = this._initialData, s2 = t2.pageIndex === e2, n2 = (t2.accessibilityData?.alt || "") === i2;
      return { isSame: !this._hasBeenMoved && !this._hasBeenResized && s2 && n2, isSameAltText: n2 };
    }
    renderAnnotationElement(t2) {
      t2.updateEdited({ rect: this.getRect(0, 0) });
      return null;
    }
  };
  var AnnotationEditorLayer = class _AnnotationEditorLayer {
    #Cn;
    #no = false;
    #ao = null;
    #ro = null;
    #oo = null;
    #lo = /* @__PURE__ */ new Map();
    #ho = false;
    #do = false;
    #co = false;
    #uo = null;
    #po = null;
    #go = null;
    #mo = null;
    #m;
    static _initialized = false;
    static #U = new Map([FreeTextEditor, InkEditor, StampEditor, HighlightEditor].map(((t2) => [t2._editorType, t2])));
    constructor({ uiManager: t2, pageIndex: e2, div: i2, structTreeLayer: s2, accessibilityManager: n2, annotationLayer: a2, drawLayer: r2, textLayer: o2, viewport: l2, l10n: h2 }) {
      const d2 = [..._AnnotationEditorLayer.#U.values()];
      if (!_AnnotationEditorLayer._initialized) {
        _AnnotationEditorLayer._initialized = true;
        for (const e3 of d2) e3.initialize(h2, t2);
      }
      t2.registerEditorTypes(d2);
      this.#m = t2;
      this.pageIndex = e2;
      this.div = i2;
      this.#Cn = n2;
      this.#ao = a2;
      this.viewport = l2;
      this.#go = o2;
      this.drawLayer = r2;
      this._structTree = s2;
      this.#m.addLayer(this);
    }
    get isEmpty() {
      return 0 === this.#lo.size;
    }
    get isInvisible() {
      return this.isEmpty && this.#m.getMode() === g.NONE;
    }
    updateToolbar(t2) {
      this.#m.updateToolbar(t2);
    }
    updateMode(t2 = this.#m.getMode()) {
      this.#fo();
      switch (t2) {
        case g.NONE:
          this.disableTextSelection();
          this.togglePointerEvents(false);
          this.toggleAnnotationLayerPointerEvents(true);
          this.disableClick();
          return;
        case g.INK:
          this.disableTextSelection();
          this.togglePointerEvents(true);
          this.enableClick();
          break;
        case g.HIGHLIGHT:
          this.enableTextSelection();
          this.togglePointerEvents(false);
          this.disableClick();
          break;
        default:
          this.disableTextSelection();
          this.togglePointerEvents(true);
          this.enableClick();
      }
      this.toggleAnnotationLayerPointerEvents(false);
      const { classList: e2 } = this.div;
      for (const i2 of _AnnotationEditorLayer.#U.values()) e2.toggle(`${i2._type}Editing`, t2 === i2._editorType);
      this.div.hidden = false;
    }
    hasTextLayer(t2) {
      return t2 === this.#go?.div;
    }
    setEditingState(t2) {
      this.#m.setEditingState(t2);
    }
    addCommands(t2) {
      this.#m.addCommands(t2);
    }
    cleanUndoStack(t2) {
      this.#m.cleanUndoStack(t2);
    }
    toggleDrawing(t2 = false) {
      this.div.classList.toggle("drawing", !t2);
    }
    togglePointerEvents(t2 = false) {
      this.div.classList.toggle("disabled", !t2);
    }
    toggleAnnotationLayerPointerEvents(t2 = false) {
      this.#ao?.div.classList.toggle("disabled", !t2);
    }
    async enable() {
      this.#co = true;
      this.div.tabIndex = 0;
      this.togglePointerEvents(true);
      const t2 = /* @__PURE__ */ new Set();
      for (const e3 of this.#lo.values()) {
        e3.enableEditing();
        e3.show(true);
        if (e3.annotationElementId) {
          this.#m.removeChangedExistingAnnotation(e3);
          t2.add(e3.annotationElementId);
        }
      }
      if (!this.#ao) {
        this.#co = false;
        return;
      }
      const e2 = this.#ao.getEditableAnnotations();
      for (const i2 of e2) {
        i2.hide();
        if (this.#m.isDeletedAnnotationElement(i2.data.id)) continue;
        if (t2.has(i2.data.id)) continue;
        const e3 = await this.deserialize(i2);
        if (e3) {
          this.addOrRebuild(e3);
          e3.enableEditing();
        }
      }
      this.#co = false;
    }
    disable() {
      this.#do = true;
      this.div.tabIndex = -1;
      this.togglePointerEvents(false);
      const t2 = /* @__PURE__ */ new Map(), e2 = /* @__PURE__ */ new Map();
      for (const i3 of this.#lo.values()) {
        i3.disableEditing();
        if (i3.annotationElementId) if (null === i3.serialize()) {
          e2.set(i3.annotationElementId, i3);
          this.getEditableAnnotation(i3.annotationElementId)?.show();
          i3.remove();
        } else t2.set(i3.annotationElementId, i3);
      }
      if (this.#ao) {
        const i3 = this.#ao.getEditableAnnotations();
        for (const s2 of i3) {
          const { id: i4 } = s2.data;
          if (this.#m.isDeletedAnnotationElement(i4)) continue;
          let n2 = e2.get(i4);
          if (n2) {
            n2.resetAnnotationElement(s2);
            n2.show(false);
            s2.show();
          } else {
            n2 = t2.get(i4);
            if (n2) {
              this.#m.addChangedExistingAnnotation(n2);
              n2.renderAnnotationElement(s2) && n2.show(false);
            }
            s2.show();
          }
        }
      }
      this.#fo();
      this.isEmpty && (this.div.hidden = true);
      const { classList: i2 } = this.div;
      for (const t3 of _AnnotationEditorLayer.#U.values()) i2.remove(`${t3._type}Editing`);
      this.disableTextSelection();
      this.toggleAnnotationLayerPointerEvents(true);
      this.#do = false;
    }
    getEditableAnnotation(t2) {
      return this.#ao?.getEditableAnnotation(t2) || null;
    }
    setActiveEditor(t2) {
      this.#m.getActive() !== t2 && this.#m.setActiveEditor(t2);
    }
    enableTextSelection() {
      this.div.tabIndex = -1;
      if (this.#go?.div && !this.#mo) {
        this.#mo = new AbortController();
        const t2 = this.#m.combinedSignal(this.#mo);
        this.#go.div.addEventListener("pointerdown", this.#bo.bind(this), { signal: t2 });
        this.#go.div.classList.add("highlighting");
      }
    }
    disableTextSelection() {
      this.div.tabIndex = 0;
      if (this.#go?.div && this.#mo) {
        this.#mo.abort();
        this.#mo = null;
        this.#go.div.classList.remove("highlighting");
      }
    }
    #bo(t2) {
      this.#m.unselectAll();
      const { target: e2 } = t2;
      if (e2 === this.#go.div || ("img" === e2.getAttribute("role") || e2.classList.contains("endOfContent")) && this.#go.div.contains(e2)) {
        const { isMac: e3 } = util_FeatureTest.platform;
        if (0 !== t2.button || t2.ctrlKey && e3) return;
        this.#m.showAllEditors("highlight", true, true);
        this.#go.div.classList.add("free");
        this.toggleDrawing();
        HighlightEditor.startHighlighting(this, "ltr" === this.#m.direction, { target: this.#go.div, x: t2.x, y: t2.y });
        this.#go.div.addEventListener("pointerup", (() => {
          this.#go.div.classList.remove("free");
          this.toggleDrawing(true);
        }), { once: true, signal: this.#m._signal });
        t2.preventDefault();
      }
    }
    enableClick() {
      if (this.#ro) return;
      this.#ro = new AbortController();
      const t2 = this.#m.combinedSignal(this.#ro);
      this.div.addEventListener("pointerdown", this.pointerdown.bind(this), { signal: t2 });
      const e2 = this.pointerup.bind(this);
      this.div.addEventListener("pointerup", e2, { signal: t2 });
      this.div.addEventListener("pointercancel", e2, { signal: t2 });
    }
    disableClick() {
      this.#ro?.abort();
      this.#ro = null;
    }
    attach(t2) {
      this.#lo.set(t2.id, t2);
      const { annotationElementId: e2 } = t2;
      e2 && this.#m.isDeletedAnnotationElement(e2) && this.#m.removeDeletedAnnotationElement(t2);
    }
    detach(t2) {
      this.#lo.delete(t2.id);
      this.#Cn?.removePointerInTextLayer(t2.contentDiv);
      !this.#do && t2.annotationElementId && this.#m.addDeletedAnnotationElement(t2);
    }
    remove(t2) {
      this.detach(t2);
      this.#m.removeEditor(t2);
      t2.div.remove();
      t2.isAttachedToDOM = false;
    }
    changeParent(t2) {
      if (t2.parent !== this) {
        if (t2.parent && t2.annotationElementId) {
          this.#m.addDeletedAnnotationElement(t2.annotationElementId);
          AnnotationEditor.deleteAnnotationElement(t2);
          t2.annotationElementId = null;
        }
        this.attach(t2);
        t2.parent?.detach(t2);
        t2.setParent(this);
        if (t2.div && t2.isAttachedToDOM) {
          t2.div.remove();
          this.div.append(t2.div);
        }
      }
    }
    add(t2) {
      if (t2.parent !== this || !t2.isAttachedToDOM) {
        this.changeParent(t2);
        this.#m.addEditor(t2);
        this.attach(t2);
        if (!t2.isAttachedToDOM) {
          const e2 = t2.render();
          this.div.append(e2);
          t2.isAttachedToDOM = true;
        }
        t2.fixAndSetPosition();
        t2.onceAdded(!this.#co);
        this.#m.addToAnnotationStorage(t2);
        t2._reportTelemetry(t2.telemetryInitialData);
      }
    }
    moveEditorInDOM(t2) {
      if (!t2.isAttachedToDOM) return;
      const { activeElement: e2 } = document;
      if (t2.div.contains(e2) && !this.#oo) {
        t2._focusEventsAllowed = false;
        this.#oo = setTimeout((() => {
          this.#oo = null;
          if (t2.div.contains(document.activeElement)) t2._focusEventsAllowed = true;
          else {
            t2.div.addEventListener("focusin", (() => {
              t2._focusEventsAllowed = true;
            }), { once: true, signal: this.#m._signal });
            e2.focus();
          }
        }), 0);
      }
      t2._structTreeParentId = this.#Cn?.moveElementInDOM(this.div, t2.div, t2.contentDiv, true);
    }
    addOrRebuild(t2) {
      if (t2.needsToBeRebuilt()) {
        t2.parent ||= this;
        t2.rebuild();
        t2.show();
      } else this.add(t2);
    }
    addUndoableEditor(t2) {
      this.addCommands({ cmd: () => t2._uiManager.rebuild(t2), undo: () => {
        t2.remove();
      }, mustExec: false });
    }
    getNextId() {
      return this.#m.getId();
    }
    get #Ao() {
      return _AnnotationEditorLayer.#U.get(this.#m.getMode());
    }
    combinedSignal(t2) {
      return this.#m.combinedSignal(t2);
    }
    #wo(t2) {
      const e2 = this.#Ao;
      return e2 ? new e2.prototype.constructor(t2) : null;
    }
    canCreateNewEmptyEditor() {
      return this.#Ao?.canCreateNewEmptyEditor();
    }
    pasteEditor(t2, e2) {
      this.#m.updateToolbar(t2);
      this.#m.updateMode(t2);
      const { offsetX: i2, offsetY: s2 } = this.#vo(), n2 = this.getNextId(), a2 = this.#wo({ parent: this, id: n2, x: i2, y: s2, uiManager: this.#m, isCentered: true, ...e2 });
      a2 && this.add(a2);
    }
    async deserialize(t2) {
      return await _AnnotationEditorLayer.#U.get(t2.annotationType ?? t2.annotationEditorType)?.deserialize(t2, this, this.#m) || null;
    }
    createAndAddNewEditor(t2, e2, i2 = {}) {
      const s2 = this.getNextId(), n2 = this.#wo({ parent: this, id: s2, x: t2.offsetX, y: t2.offsetY, uiManager: this.#m, isCentered: e2, ...i2 });
      n2 && this.add(n2);
      return n2;
    }
    #vo() {
      const { x: t2, y: e2, width: i2, height: s2 } = this.div.getBoundingClientRect(), n2 = Math.max(0, t2), a2 = Math.max(0, e2), r2 = (n2 + Math.min(window.innerWidth, t2 + i2)) / 2 - t2, o2 = (a2 + Math.min(window.innerHeight, e2 + s2)) / 2 - e2, [l2, h2] = this.viewport.rotation % 180 == 0 ? [r2, o2] : [o2, r2];
      return { offsetX: l2, offsetY: h2 };
    }
    addNewEditor() {
      this.createAndAddNewEditor(this.#vo(), true);
    }
    setSelected(t2) {
      this.#m.setSelected(t2);
    }
    toggleSelected(t2) {
      this.#m.toggleSelected(t2);
    }
    unselect(t2) {
      this.#m.unselect(t2);
    }
    pointerup(t2) {
      const { isMac: e2 } = util_FeatureTest.platform;
      if (!(0 !== t2.button || t2.ctrlKey && e2) && t2.target === this.div && this.#ho) {
        this.#ho = false;
        this.#Ao?.isDrawer && this.#Ao.supportMultipleDrawings || (this.#no ? this.#m.getMode() !== g.STAMP ? this.createAndAddNewEditor(t2, false) : this.#m.unselectAll() : this.#no = true);
      }
    }
    pointerdown(t2) {
      this.#m.getMode() === g.HIGHLIGHT && this.enableTextSelection();
      if (this.#ho) {
        this.#ho = false;
        return;
      }
      const { isMac: e2 } = util_FeatureTest.platform;
      if (0 !== t2.button || t2.ctrlKey && e2) return;
      if (t2.target !== this.div) return;
      this.#ho = true;
      if (this.#Ao?.isDrawer) {
        this.startDrawingSession(t2);
        return;
      }
      const i2 = this.#m.getActive();
      this.#no = !i2 || i2.isEmpty();
    }
    startDrawingSession(t2) {
      this.div.focus();
      if (this.#uo) {
        this.#Ao.startDrawing(this, this.#m, false, t2);
        return;
      }
      this.#m.setCurrentDrawingSession(this);
      this.#uo = new AbortController();
      const e2 = this.#m.combinedSignal(this.#uo);
      this.div.addEventListener("blur", (({ relatedTarget: t3 }) => {
        if (t3 && !this.div.contains(t3)) {
          this.#po = null;
          this.commitOrRemove();
        }
      }), { signal: e2 });
      this.#Ao.startDrawing(this, this.#m, false, t2);
    }
    pause(t2) {
      if (t2) {
        const { activeElement: t3 } = document;
        this.div.contains(t3) && (this.#po = t3);
      } else this.#po && setTimeout((() => {
        this.#po?.focus();
        this.#po = null;
      }), 0);
    }
    endDrawingSession(t2 = false) {
      if (!this.#uo) return null;
      this.#m.setCurrentDrawingSession(null);
      this.#uo.abort();
      this.#uo = null;
      this.#po = null;
      return this.#Ao.endDrawing(t2);
    }
    findNewParent(t2, e2, i2) {
      const s2 = this.#m.findParent(e2, i2);
      if (null === s2 || s2 === this) return false;
      s2.changeParent(t2);
      return true;
    }
    commitOrRemove() {
      if (this.#uo) {
        this.endDrawingSession();
        return true;
      }
      return false;
    }
    onScaleChanging() {
      this.#uo && this.#Ao.onScaleChangingWhenDrawing(this);
    }
    destroy() {
      this.commitOrRemove();
      if (this.#m.getActive()?.parent === this) {
        this.#m.commitOrRemove();
        this.#m.setActiveEditor(null);
      }
      if (this.#oo) {
        clearTimeout(this.#oo);
        this.#oo = null;
      }
      for (const t2 of this.#lo.values()) {
        this.#Cn?.removePointerInTextLayer(t2.contentDiv);
        t2.setParent(null);
        t2.isAttachedToDOM = false;
        t2.div.remove();
      }
      this.div = null;
      this.#lo.clear();
      this.#m.removeLayer(this);
    }
    #fo() {
      for (const t2 of this.#lo.values()) t2.isEmpty() && t2.remove();
    }
    render({ viewport: t2 }) {
      this.viewport = t2;
      setLayerDimensions(this.div, t2);
      for (const t3 of this.#m.getEditors(this.pageIndex)) {
        this.add(t3);
        t3.rebuild();
      }
      this.updateMode();
    }
    update({ viewport: t2 }) {
      this.#m.commitOrRemove();
      this.#fo();
      const e2 = this.viewport.rotation, i2 = t2.rotation;
      this.viewport = t2;
      setLayerDimensions(this.div, { rotation: i2 });
      if (e2 !== i2) for (const t3 of this.#lo.values()) t3.rotate(i2);
    }
    get pageDimensions() {
      const { pageWidth: t2, pageHeight: e2 } = this.viewport.rawDims;
      return [t2, e2];
    }
    get scale() {
      return this.#m.viewParameters.realScale;
    }
  };
  var DrawLayer = class _DrawLayer {
    #nn = null;
    #w = 0;
    #yo = /* @__PURE__ */ new Map();
    #xo = /* @__PURE__ */ new Map();
    constructor({ pageIndex: t2 }) {
      this.pageIndex = t2;
    }
    setParent(t2) {
      if (this.#nn) {
        if (this.#nn !== t2) {
          if (this.#yo.size > 0) for (const e2 of this.#yo.values()) {
            e2.remove();
            t2.append(e2);
          }
          this.#nn = t2;
        }
      } else this.#nn = t2;
    }
    static get _svgFactory() {
      return shadow(this, "_svgFactory", new DOMSVGFactory());
    }
    static #_o(t2, [e2, i2, s2, n2]) {
      const { style: a2 } = t2;
      a2.top = 100 * i2 + "%";
      a2.left = 100 * e2 + "%";
      a2.width = 100 * s2 + "%";
      a2.height = 100 * n2 + "%";
    }
    #Eo() {
      const t2 = _DrawLayer._svgFactory.create(1, 1, true);
      this.#nn.append(t2);
      t2.setAttribute("aria-hidden", true);
      return t2;
    }
    #So(t2, e2) {
      const i2 = _DrawLayer._svgFactory.createElement("clipPath");
      t2.append(i2);
      const s2 = `clip_${e2}`;
      i2.setAttribute("id", s2);
      i2.setAttribute("clipPathUnits", "objectBoundingBox");
      const n2 = _DrawLayer._svgFactory.createElement("use");
      i2.append(n2);
      n2.setAttribute("href", `#${e2}`);
      n2.classList.add("clip");
      return s2;
    }
    #Co(t2, e2) {
      for (const [i2, s2] of Object.entries(e2)) null === s2 ? t2.removeAttribute(i2) : t2.setAttribute(i2, s2);
    }
    draw(t2, e2 = false, i2 = false) {
      const s2 = this.#w++, n2 = this.#Eo(), a2 = _DrawLayer._svgFactory.createElement("defs");
      n2.append(a2);
      const r2 = _DrawLayer._svgFactory.createElement("path");
      a2.append(r2);
      const o2 = `path_p${this.pageIndex}_${s2}`;
      r2.setAttribute("id", o2);
      r2.setAttribute("vector-effect", "non-scaling-stroke");
      e2 && this.#xo.set(s2, r2);
      const l2 = i2 ? this.#So(a2, o2) : null, h2 = _DrawLayer._svgFactory.createElement("use");
      n2.append(h2);
      h2.setAttribute("href", `#${o2}`);
      this.updateProperties(n2, t2);
      this.#yo.set(s2, n2);
      return { id: s2, clipPathId: `url(#${l2})` };
    }
    drawOutline(t2, e2) {
      const i2 = this.#w++, s2 = this.#Eo(), n2 = _DrawLayer._svgFactory.createElement("defs");
      s2.append(n2);
      const a2 = _DrawLayer._svgFactory.createElement("path");
      n2.append(a2);
      const r2 = `path_p${this.pageIndex}_${i2}`;
      a2.setAttribute("id", r2);
      a2.setAttribute("vector-effect", "non-scaling-stroke");
      let o2;
      if (e2) {
        const t3 = _DrawLayer._svgFactory.createElement("mask");
        n2.append(t3);
        o2 = `mask_p${this.pageIndex}_${i2}`;
        t3.setAttribute("id", o2);
        t3.setAttribute("maskUnits", "objectBoundingBox");
        const e3 = _DrawLayer._svgFactory.createElement("rect");
        t3.append(e3);
        e3.setAttribute("width", "1");
        e3.setAttribute("height", "1");
        e3.setAttribute("fill", "white");
        const s3 = _DrawLayer._svgFactory.createElement("use");
        t3.append(s3);
        s3.setAttribute("href", `#${r2}`);
        s3.setAttribute("stroke", "none");
        s3.setAttribute("fill", "black");
        s3.setAttribute("fill-rule", "nonzero");
        s3.classList.add("mask");
      }
      const l2 = _DrawLayer._svgFactory.createElement("use");
      s2.append(l2);
      l2.setAttribute("href", `#${r2}`);
      o2 && l2.setAttribute("mask", `url(#${o2})`);
      const h2 = l2.cloneNode();
      s2.append(h2);
      l2.classList.add("mainOutline");
      h2.classList.add("secondaryOutline");
      this.updateProperties(s2, t2);
      this.#yo.set(i2, s2);
      return i2;
    }
    finalizeDraw(t2, e2) {
      this.#xo.delete(t2);
      this.updateProperties(t2, e2);
    }
    updateProperties(t2, e2) {
      if (!e2) return;
      const { root: i2, bbox: s2, rootClass: n2, path: a2 } = e2, r2 = "number" == typeof t2 ? this.#yo.get(t2) : t2;
      if (r2) {
        i2 && this.#Co(r2, i2);
        s2 && _DrawLayer.#_o(r2, s2);
        if (n2) {
          const { classList: t3 } = r2;
          for (const [e3, i3] of Object.entries(n2)) t3.toggle(e3, i3);
        }
        if (a2) {
          const t3 = r2.firstChild.firstChild;
          this.#Co(t3, a2);
        }
      }
    }
    updateParent(t2, e2) {
      if (e2 === this) return;
      const i2 = this.#yo.get(t2);
      if (i2) {
        e2.#nn.append(i2);
        this.#yo.delete(t2);
        e2.#yo.set(t2, i2);
      }
    }
    remove(t2) {
      this.#xo.delete(t2);
      if (null !== this.#nn) {
        this.#yo.get(t2).remove();
        this.#yo.delete(t2);
      }
    }
    destroy() {
      this.#nn = null;
      for (const t2 of this.#yo.values()) t2.remove();
      this.#yo.clear();
      this.#xo.clear();
    }
  };
  globalThis.pdfjsTestingUtils = { HighlightOutliner };
  var Ut = __webpack_exports__.AbortException;
  var Gt = __webpack_exports__.AnnotationEditorLayer;
  var $t = __webpack_exports__.AnnotationEditorParamsType;
  var Vt = __webpack_exports__.AnnotationEditorType;
  var jt = __webpack_exports__.AnnotationEditorUIManager;
  var Wt = __webpack_exports__.AnnotationLayer;
  var qt = __webpack_exports__.AnnotationMode;
  var Xt = __webpack_exports__.ColorPicker;
  var Kt = __webpack_exports__.DOMSVGFactory;
  var Yt = __webpack_exports__.DrawLayer;
  var Qt = __webpack_exports__.FeatureTest;
  var Jt = __webpack_exports__.GlobalWorkerOptions;
  var Zt = __webpack_exports__.ImageKind;
  var te = __webpack_exports__.InvalidPDFException;
  var ee = __webpack_exports__.MissingPDFException;
  var ie = __webpack_exports__.OPS;
  var se = __webpack_exports__.OutputScale;
  var ne = __webpack_exports__.PDFDataRangeTransport;
  var ae = __webpack_exports__.PDFDateString;
  var re = __webpack_exports__.PDFWorker;
  var oe = __webpack_exports__.PasswordResponses;
  var le = __webpack_exports__.PermissionFlag;
  var he = __webpack_exports__.PixelsPerInch;
  var de = __webpack_exports__.RenderingCancelledException;
  var ce = __webpack_exports__.TextLayer;
  var ue = __webpack_exports__.TouchManager;
  var pe = __webpack_exports__.UnexpectedResponseException;
  var ge = __webpack_exports__.Util;
  var me = __webpack_exports__.VerbosityLevel;
  var fe = __webpack_exports__.XfaLayer;
  var be = __webpack_exports__.build;
  var Ae = __webpack_exports__.createValidAbsoluteUrl;
  var we = __webpack_exports__.fetchData;
  var ve = __webpack_exports__.getDocument;
  var ye = __webpack_exports__.getFilenameFromUrl;
  var xe = __webpack_exports__.getPdfFilenameFromUrl;
  var _e = __webpack_exports__.getXfaPageViewport;
  var Ee = __webpack_exports__.isDataScheme;
  var Se = __webpack_exports__.isPdfFile;
  var Ce = __webpack_exports__.noContextMenu;
  var Te = __webpack_exports__.normalizeUnicode;
  var Me = __webpack_exports__.setLayerDimensions;
  var Pe = __webpack_exports__.shadow;
  var De = __webpack_exports__.stopEvent;
  var ke = __webpack_exports__.version;

  // renderer/react/pdfEngine.js
  Jt.workerSrc = new URL("bundle/pdf.worker.js", document.baseURI).href;
  async function loadPdf(bytes) {
    try {
      const task = ve({ data: bytes, isEvalSupported: false, enableXfa: false });
      return await task.promise;
    } catch (e2) {
      const n2 = e2 && e2.name;
      if (n2 === "PasswordException") throw new Error("Este PDF \xE9 protegido por senha; ainda n\xE3o consigo abri-lo.");
      if (n2 === "InvalidPDFException" || n2 === "FormatError") throw new Error("Arquivo inv\xE1lido: n\xE3o parece um PDF \xEDntegro.");
      throw new Error("N\xE3o consegui abrir o PDF: " + (e2 && e2.message ? e2.message : e2));
    }
  }
  function renderPage(page, scale, canvas, textDiv) {
    const vp = page.getViewport({ scale });
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(vp.width * dpr);
    canvas.height = Math.floor(vp.height * dpr);
    canvas.style.width = Math.floor(vp.width) + "px";
    canvas.style.height = Math.floor(vp.height) + "px";
    const task = page.render({ canvasContext: canvas.getContext("2d"), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : void 0 });
    let layer = null, cancelled = false;
    const done = (async () => {
      await task.promise;
      if (cancelled) return;
      textDiv.textContent = "";
      textDiv.style.setProperty("--scale-factor", String(vp.scale));
      textDiv.style.setProperty("--total-scale-factor", String(vp.scale));
      layer = new ce({ textContentSource: page.streamTextContent(), container: textDiv, viewport: vp });
      await layer.render();
    })();
    return { vp, done, cancel: () => {
      cancelled = true;
      try {
        task.cancel();
      } catch {
      }
      try {
        layer && layer.cancel();
      } catch {
      }
    } };
  }
  var strip = (s2) => String(s2).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ");
  async function pageText(doc, n2) {
    const p2 = await doc.getPage(n2);
    const c2 = await p2.getTextContent();
    return strip(c2.items.map((i2) => i2.str).join(" "));
  }
  var norm = strip;
  var isRenderCancel = (e2) => !!e2 && (e2.name === "RenderingCancelledException" || /cancel/i.test(String(e2.message)));

  // renderer/react/PdfPage.jsx
  var import_react3 = __toESM(require_react());
  var import_jsx_runtime4 = __toESM(require_jsx_runtime());
  function PdfPage({ doc, num, scale, base, hl, root }) {
    const wrap = (0, import_react3.useRef)(null), canvas = (0, import_react3.useRef)(null), text = (0, import_react3.useRef)(null);
    const [size, setSize] = (0, import_react3.useState)({ w: Math.floor(base.w * scale), h: Math.floor(base.h * scale) });
    const [vis, setVis] = (0, import_react3.useState)(false);
    (0, import_react3.useEffect)(() => {
      setSize((s2) => vis ? s2 : { w: Math.floor(base.w * scale), h: Math.floor(base.h * scale) });
    }, [scale, base.w, base.h, vis]);
    (0, import_react3.useEffect)(() => {
      const io = new IntersectionObserver((es) => setVis(es.some((e2) => e2.isIntersecting)), { root: root.current, rootMargin: "900px 0px" });
      io.observe(wrap.current);
      return () => io.disconnect();
    }, [root]);
    (0, import_react3.useEffect)(() => {
      if (!vis) {
        if (canvas.current) {
          canvas.current.width = 0;
          canvas.current.height = 0;
        }
        if (text.current) text.current.textContent = "";
        return void 0;
      }
      let live = true, job = null;
      (async () => {
        const page = await doc.getPage(num);
        if (!live) return;
        job = renderPage(page, scale, canvas.current, text.current);
        setSize({ w: Math.floor(job.vp.width), h: Math.floor(job.vp.height) });
        await job.done;
      })().catch((e2) => {
        if (!isRenderCancel(e2) && live) {
          try {
            window.MC.logError("PDF p. " + num + ": " + (e2 && e2.message));
          } catch {
          }
        }
      });
      return () => {
        live = false;
        if (job) job.cancel();
      };
    }, [vis, scale, doc, num]);
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: "pdf-page", ref: wrap, "data-page": num, style: { width: size.w, height: size.h }, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("canvas", { ref: canvas }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "pdf-hls", children: hl.map((r2, i2) => /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "pdf-hl", "data-node": r2.node, style: { left: `${r2.x * 100}%`, top: `${r2.y * 100}%`, width: `${r2.w * 100}%`, height: `${r2.h * 100}%` } }, i2)) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "textLayer", ref: text })
    ] });
  }

  // renderer/react/PdfPane.jsx
  var import_jsx_runtime5 = __toESM(require_jsx_runtime());
  var STEPS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
  var shorten = (s2, n2 = 110) => s2.length <= n2 ? s2 : s2.slice(0, n2 - 1).replace(/\s+\S*$/, "") + "\u2026";
  function PdfPane({ initial }) {
    const h2 = H();
    useMcRender();
    const map = h2.map();
    const [src, setSrc] = (0, import_react4.useState)(initial.path ? { path: initial.path, name: initial.name } : null);
    const [doc, setDoc] = (0, import_react4.useState)(null);
    const [err, setErr] = (0, import_react4.useState)("");
    const [base, setBase] = (0, import_react4.useState)({ w: 595, h: 842 });
    const [fitScale, setFitScale] = (0, import_react4.useState)(1);
    const [mode, setMode] = (0, import_react4.useState)(h2.loadCfg().pdfScale || "fit");
    const [page, setPage] = (0, import_react4.useState)(1);
    const [pageIn, setPageIn] = (0, import_react4.useState)("1");
    const [sel, setSel] = (0, import_react4.useState)(null);
    const [msg, setMsg] = (0, import_react4.useState)("");
    const [query, setQuery] = (0, import_react4.useState)("");
    const scroller = (0, import_react4.useRef)(null), pane = (0, import_react4.useRef)(null), texts = (0, import_react4.useRef)(/* @__PURE__ */ new Map()), want = (0, import_react4.useRef)(initial.page || null), saveT = (0, import_react4.useRef)(null), findFrom = (0, import_react4.useRef)(0);
    const touchPts = (0, import_react4.useRef)(/* @__PURE__ */ new Map());
    const pinchRef = (0, import_react4.useRef)(null);
    const scale = mode === "fit" ? fitScale : mode;
    const pdfs = map.meta.pdfs || [];
    const reg = src ? pdfs.find((p2) => p2.path.toLowerCase() === src.path.toLowerCase()) : null;
    (0, import_react4.useEffect)(() => {
      if (!src) {
        setDoc(null);
        return void 0;
      }
      let live = true, cur2 = null;
      setErr("");
      setDoc(null);
      texts.current = /* @__PURE__ */ new Map();
      (async () => {
        let bytes;
        try {
          bytes = new Uint8Array(h2.fs.readFileSync(src.path));
        } catch (e2) {
          throw new Error(e2 && e2.code === "ENOENT" ? "Arquivo n\xE3o encontrado: " + src.path : "N\xE3o consegui ler o arquivo: " + (e2 && e2.message));
        }
        const d2 = await loadPdf(bytes);
        cur2 = d2;
        if (!live) {
          d2.destroy();
          return;
        }
        const p1 = await d2.getPage(1), v2 = p1.getViewport({ scale: 1 });
        setBase({ w: v2.width, h: v2.height });
        setDoc(d2);
        const saved = (h2.loadCfg().pdfPos || {})[src.path];
        if (!want.current && saved) want.current = Math.min(saved, d2.numPages);
      })().catch((e2) => {
        if (live) setErr(e2.message);
      });
      return () => {
        live = false;
        if (cur2) cur2.destroy();
      };
    }, [src && src.path]);
    (0, import_react4.useEffect)(() => {
      const el = scroller.current;
      if (!el) return void 0;
      const calc = () => setFitScale(Math.max(0.3, Math.min(3, (el.clientWidth - 26) / base.w)));
      calc();
      const ro = new ResizeObserver(calc);
      ro.observe(el);
      return () => ro.disconnect();
    }, [base.w, doc]);
    (0, import_react4.useEffect)(() => {
      const el = scroller.current;
      if (!el) return void 0;
      const dist = (a2, b2) => Math.hypot(a2.clientX - b2.clientX, a2.clientY - b2.clientY);
      const onStart = (e2) => {
        if (e2.touches.length === 2) {
          pinchRef.current = { d: dist(e2.touches[0], e2.touches[1]), scale: mode === "fit" ? fitScale : mode };
        }
      };
      const onMove = (e2) => {
        if (e2.touches.length !== 2 || !pinchRef.current) return;
        e2.preventDefault();
        const d2 = dist(e2.touches[0], e2.touches[1]);
        const ratio = d2 / pinchRef.current.d;
        const target = Math.max(0.5, Math.min(3, pinchRef.current.scale * ratio));
        let closest = STEPS[0], best = Infinity;
        for (const s2 of STEPS) {
          if (Math.abs(s2 - target) < best) {
            best = Math.abs(s2 - target);
            closest = s2;
          }
        }
        setMode(closest);
      };
      const onEnd = () => {
        pinchRef.current = null;
      };
      el.addEventListener("touchstart", onStart, { passive: true });
      el.addEventListener("touchmove", onMove, { passive: false });
      el.addEventListener("touchend", onEnd);
      el.addEventListener("touchcancel", onEnd);
      return () => {
        el.removeEventListener("touchstart", onStart);
        el.removeEventListener("touchmove", onMove);
        el.removeEventListener("touchend", onEnd);
        el.removeEventListener("touchcancel", onEnd);
      };
    }, [mode, fitScale]);
    const goPage = (0, import_react4.useCallback)((n2, smooth = false) => {
      const el = scroller.current && scroller.current.querySelector(`[data-page="${n2}"]`);
      if (el) scroller.current.scrollTo({ top: el.offsetTop - 8, behavior: smooth ? "smooth" : "auto" });
    }, []);
    (0, import_react4.useEffect)(() => {
      if (doc && want.current) {
        const n2 = want.current;
        want.current = null;
        requestAnimationFrame(() => {
          goPage(n2);
          setPage(n2);
          setPageIn(String(n2));
        });
      }
    }, [doc, goPage]);
    (0, import_react4.useEffect)(() => {
      if (doc) goPage(page);
    }, [scale]);
    (0, import_react4.useEffect)(() => {
      const f2 = (e2) => {
        const d2 = e2.detail || {};
        if (d2.page) want.current = d2.page;
        if (d2.path && (!src || d2.path !== src.path)) setSrc({ path: d2.path, name: d2.name });
        else if (d2.page && doc) {
          goPage(d2.page, true);
          setPage(d2.page);
          setPageIn(String(d2.page));
          want.current = null;
        }
      };
      document.addEventListener("mc:pdf-open", f2);
      return () => document.removeEventListener("mc:pdf-open", f2);
    }, [src, doc, goPage]);
    const onScroll = (0, import_react4.useCallback)(() => {
      setSel(null);
      const el = scroller.current;
      if (!el) return;
      const top = el.scrollTop + el.clientHeight * 0.3;
      let cur2 = 1;
      for (const p2 of el.querySelectorAll(".pdf-page")) {
        if (p2.offsetTop <= top) cur2 = +p2.dataset.page;
        else break;
      }
      setPage(cur2);
      setPageIn(String(cur2));
      clearTimeout(saveT.current);
      saveT.current = setTimeout(() => {
        if (src) h2.saveCfg({ pdfPos: { ...h2.loadCfg().pdfPos || {}, [src.path]: cur2 } });
      }, 700);
    }, [src && src.path]);
    const onMouseUp = () => {
      setTimeout(() => {
        const s2 = window.getSelection();
        if (!s2 || s2.isCollapsed || !s2.rangeCount || !scroller.current || !scroller.current.contains(s2.anchorNode)) return;
        const range = s2.getRangeAt(0);
        const pageOf = (n2) => (n2.nodeType === 3 ? n2.parentElement : n2).closest(".pdf-page");
        const a2 = pageOf(range.startContainer), b2 = pageOf(range.endContainer);
        if (!a2 || !b2) return;
        if (a2 !== b2) {
          setMsg("Selecione o trecho dentro de uma \xFAnica p\xE1gina.");
          setSel(null);
          return;
        }
        const text = s2.toString().replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
        if (!text) return;
        const pr = a2.getBoundingClientRect(), rects = [];
        for (const r2 of range.getClientRects()) {
          if (r2.width < 2 || r2.height < 2) continue;
          const q2 = [(r2.left - pr.left) / pr.width, (r2.top - pr.top) / pr.height, r2.width / pr.width, r2.height / pr.height];
          if (!rects.some((x2) => Math.abs(x2[0] - q2[0]) < 2e-3 && Math.abs(x2[1] - q2[1]) < 2e-3 && Math.abs(x2[2] - q2[2]) < 2e-3)) rects.push(q2);
        }
        const last = range.getBoundingClientRect(), box = pane.current.getBoundingClientRect();
        setMsg("");
        setSel({ text, rects: rects.slice(0, 40), page: +a2.dataset.page, x: Math.max(6, Math.min(box.width - 250, last.left - box.left)), y: last.bottom - box.top + 6 });
      }, 0);
    };
    const capture = (modeCap) => {
      if (!sel || !src) return;
      try {
        const r2 = h2.pdfCapture({ source: src, page: sel.page, text: sel.text, rects: sel.rects, mode: modeCap });
        setMsg(modeCap === "topic" ? `T\xF3pico criado a partir do trecho (p. ${sel.page}).` : `Trecho anotado em "${r2.title}" (p. ${sel.page}).`);
      } catch (e2) {
        setMsg("N\xE3o consegui registrar o trecho: " + e2.message);
      }
      window.getSelection().removeAllRanges();
      setSel(null);
    };
    const onClickPage = (e2) => {
      if (!e2.ctrlKey && !e2.metaKey) return;
      const el = e2.target.closest(".pdf-page");
      if (!el) return;
      const pr = el.getBoundingClientRect(), x2 = (e2.clientX - pr.left) / pr.width, y2 = (e2.clientY - pr.top) / pr.height;
      const hits = (highlights.get(+el.dataset.page) || []).filter((r2) => x2 >= r2.x && x2 <= r2.x + r2.w && y2 >= r2.y && y2 <= r2.y + r2.h);
      const dist = (r2) => Math.hypot(x2 - (r2.x + r2.w / 2), y2 - (r2.y + r2.h / 2));
      const hit = hits.sort((a2, b2) => dist(a2) - dist(b2))[0];
      if (hit) h2.goTo(hit.node);
    };
    const highlights = (0, import_react4.useMemo)(() => {
      const out = /* @__PURE__ */ new Map();
      if (!reg) return out;
      map.walk((n2) => {
        for (const r2 of n2.refs || []) if (r2.pdf === reg.id) for (const q2 of r2.rects) {
          if (!out.has(r2.page)) out.set(r2.page, []);
          out.get(r2.page).push({ node: n2.id, x: q2[0], y: q2[1], w: q2[2], h: q2[3] });
        }
      });
      return out;
    }, [map, reg && reg.id, h2.rev()]);
    const chips = (0, import_react4.useMemo)(() => {
      const out = [];
      if (reg) map.walk((n2) => {
        if ((n2.refs || []).some((r2) => r2.pdf === reg.id && r2.page === page)) out.push(n2);
      });
      return out;
    }, [map, reg && reg.id, page, h2.rev()]);
    const find = async (fromStart) => {
      if (!doc || !query.trim()) return;
      const q2 = norm(query.trim());
      const start = fromStart ? 1 : (findFrom.current || page) + 1;
      for (let k2 = 0; k2 < doc.numPages; k2++) {
        const n2 = (start - 1 + k2) % doc.numPages + 1;
        if (!texts.current.has(n2)) texts.current.set(n2, await pageText(doc, n2));
        if (texts.current.get(n2).includes(q2)) {
          findFrom.current = n2;
          goPage(n2, true);
          setPage(n2);
          setPageIn(String(n2));
          setMsg(`\u201C${query.trim()}\u201D encontrado na p. ${n2}.`);
          return;
        }
      }
      setMsg(`\u201C${query.trim()}\u201D n\xE3o foi encontrado.`);
    };
    const onOpen = async () => {
      const p2 = await h2.ipc("dialog:open-pdf");
      if (p2) {
        want.current = null;
        setSrc({ path: p2, name: h2.baseName(p2) });
      }
    };
    const onRelink = async () => {
      const p2 = await h2.ipc("dialog:open-pdf");
      if (!p2) return;
      if (reg) h2.relinkPdf(reg.id, p2);
      setSrc({ path: p2, name: src.name });
    };
    const zoom = (d2) => {
      const cur2 = scale;
      const i2 = STEPS.findIndex((x2) => x2 >= cur2 - 1e-3);
      const next = d2 > 0 ? STEPS[Math.min(STEPS.length - 1, i2 < 0 ? STEPS.length - 1 : STEPS[i2] > cur2 + 1e-3 ? i2 : i2 + 1)] : STEPS[Math.max(0, (i2 < 0 ? STEPS.length : i2) - 1)];
      setMode(next);
      h2.saveCfg({ pdfScale: next });
    };
    const pageList = (0, import_react4.useMemo)(() => doc ? Array.from({ length: doc.numPages }, (_2, i2) => i2 + 1) : [], [doc]);
    return /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "pdf-box", ref: pane, "data-ui": "react", children: [
      /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "pdf-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("select", { id: "pdfSel", value: src ? src.path : "", onChange: (e2) => {
          const p2 = pdfs.find((x2) => x2.path === e2.target.value);
          if (p2) {
            want.current = null;
            setSrc({ path: p2.path, name: p2.name });
          }
        }, title: "PDFs deste mapa", children: [
          !src && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: "", children: "(nenhum PDF aberto)" }),
          src && !reg && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: src.path, children: src.name || h2.baseName(src.path) }),
          pdfs.map((p2) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("option", { value: p2.path, children: p2.name }, p2.id))
        ] }),
        src && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { className: "btn small", id: "pdfOpen", onClick: onOpen, style: { display: "inline-flex", alignItems: "center" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FlatIcon, { name: "pdf", size: 13, style: { marginRight: "5px" } }),
          " Abrir outro PDF\u2026"
        ] }),
        (doc || src) && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)(
          "button",
          {
            className: "btn small",
            id: "pdfCloseDoc",
            onClick: () => {
              if (doc) doc.destroy();
              setDoc(null);
              setSrc(null);
              setMsg("PDF fechado.");
            },
            title: "Fechar PDF atual e descarregar da mem\xF3ria",
            style: { color: "#ef4444", display: "inline-flex", alignItems: "center" },
            children: [
              /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FlatIcon, { name: "close", size: 12, style: { marginRight: "4px" } }),
              " Fechar PDF"
            ]
          }
        )
      ] }),
      doc && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "pdf-bar", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { className: "btn small", id: "pdfPrev", disabled: page <= 1, onClick: () => {
          goPage(page - 1, true);
        }, "aria-label": "P\xE1gina anterior", style: { display: "inline-flex", alignItems: "center" }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FlatIcon, { name: "arrowLeft", size: 11 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { id: "pdfPageNum", type: "text", inputMode: "numeric", value: pageIn, onChange: (e2) => setPageIn(e2.target.value), onKeyDown: (e2) => {
          if (e2.key === "Enter") {
            const n2 = Math.max(1, Math.min(doc.numPages, parseInt(pageIn, 10) || 1));
            goPage(n2);
            setPage(n2);
            setPageIn(String(n2));
          }
        }, "aria-label": "P\xE1gina" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "muted", id: "pdfPageCount", children: `/ ${doc.numPages}` }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { className: "btn small", id: "pdfNext", disabled: page >= doc.numPages, onClick: () => {
          goPage(page + 1, true);
        }, "aria-label": "Pr\xF3xima p\xE1gina", style: { display: "inline-flex", alignItems: "center" }, children: /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FlatIcon, { name: "arrowRight", size: 11 }) }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "sep" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { className: "btn small", id: "pdfZoomOut", onClick: () => zoom(-1), title: "Diminuir", style: { fontWeight: 600 }, children: "\u2212" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { className: "btn small" + (mode === "fit" ? " primary" : ""), id: "pdfFit", onClick: () => {
          setMode("fit");
          h2.saveCfg({ pdfScale: "fit" });
        }, title: "Ajustar \xE0 largura", children: `${Math.round(scale * 100)}%` }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { className: "btn small", id: "pdfZoomIn", onClick: () => zoom(1), title: "Aumentar", style: { fontWeight: 600 }, children: "+" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "sep" }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("input", { id: "pdfFind", type: "search", placeholder: "Buscar no PDF\u2026", value: query, onChange: (e2) => {
          setQuery(e2.target.value);
          findFrom.current = 0;
        }, onKeyDown: (e2) => {
          if (e2.key === "Enter") find(false);
        } })
      ] }),
      chips.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "pdf-chips", id: "pdfChips", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("span", { className: "muted", children: "T\xF3picos nesta p\xE1gina:" }),
        chips.map((n2) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { className: "chip2", "data-node": n2.id, onClick: () => h2.goTo(n2.id), title: "Ir ao t\xF3pico no mapa", children: shorten(n2.title, 36) }, n2.id))
      ] }),
      err && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "pdf-err", id: "pdfErr", children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { children: err }),
        src && /não encontrado/i.test(err) && /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("button", { className: "btn small primary", id: "pdfRelink", onClick: onRelink, children: "Localizar o PDF\u2026" })
      ] }),
      !src && !err && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "pdf-empty", id: "pdfEmpty", children: [
        "Abra um PDF para ler ao lado do mapa. Selecione um trecho para criar um t\xF3pico ou anotar, com a p\xE1gina e o destaque.",
        /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("br", {}),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { className: "btn primary", id: "pdfOpen2", onClick: onOpen, style: { display: "inline-flex", alignItems: "center", marginTop: "10px" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FlatIcon, { name: "pdf", size: 14, style: { marginRight: "6px" } }),
          " Abrir PDF\u2026"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "pdf-scroll", id: "pdfScroll", ref: scroller, onScroll, onMouseUp, onMouseDown: () => setSel(null), onClick: onClickPage, children: doc && pageList.map((n2) => /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(PdfPage, { doc, num: n2, scale, base, root: scroller, hl: highlights.get(n2) || [] }, n2)) }),
      sel && /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("div", { className: "pdf-sel", id: "pdfSel2", style: { left: sel.x, top: sel.y }, onMouseDown: (e2) => e2.preventDefault(), children: [
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { className: "btn small primary", id: "pdfMkTopic", onClick: () => capture("topic"), title: "Cria um t\xF3pico filho do selecionado com este trecho", style: { display: "inline-flex", alignItems: "center" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FlatIcon, { name: "plus", size: 12, style: { marginRight: "4px" } }),
          " T\xF3pico"
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime5.jsxs)("button", { className: "btn small", id: "pdfMkNote", onClick: () => capture("note"), title: "Acrescenta o trecho \xE0s notas do t\xF3pico selecionado", style: { display: "inline-flex", alignItems: "center" }, children: [
          /* @__PURE__ */ (0, import_jsx_runtime5.jsx)(FlatIcon, { name: "plus", size: 12, style: { marginRight: "4px" } }),
          " Nota"
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime5.jsx)("div", { className: "pdf-msg", id: "pdfMsg", role: "status", children: msg })
    ] });
  }

  // renderer/react/ShortcutsModal.jsx
  var import_jsx_runtime6 = __toESM(require_jsx_runtime());
  var GROUPS = [
    ["Fluxograma", [["Enter", "passo seguinte (depois do selecionado)"], ["Tab", "novo ramo da decis\xE3o selecionada"], ["F2 ou duplo clique", "editar o t\xEDtulo do passo"], ["Delete", "excluir o passo (com o que vem depois)"], ["Esc", "limpar a sele\xE7\xE3o (volta ao in\xEDcio)"], ["Roda do mouse", "zoom"], ["Arrastar o fundo", "mover a vista"]]],
    ["Mapa", [
      ["Tab", "novo t\xF3pico filho"],
      ["Enter", "novo t\xF3pico irm\xE3o"],
      ["F2", "renomear o t\xF3pico"],
      ["Espa\xE7o", "recolher/expandir o ramo"],
      ["Delete", "excluir"],
      ["Ctrl+Z / Ctrl+Y", "desfazer / refazer"],
      ["Ctrl+C / X / V", "copiar, recortar e colar t\xF3picos"],
      ["Alt+\u2191 \u2193", "mover o t\xF3pico entre irm\xE3os"],
      ["Alt+\u2190 \u2192", "subir / descer de n\xEDvel"],
      ["Ctrl+F", "buscar no mapa"],
      ["Ctrl+0", "ajustar \xE0 tela"],
      ["Ctrl+\\", "recolher/expandir o painel lateral"],
      ["Ctrl + roda do mouse", "zoom"],
      ["Ctrl+Shift+M", "fechar o mapa"],
      ["Ctrl+Shift+H", "tela inicial"],
      ["Shift + arrastar no fundo", "selecionar v\xE1rios t\xF3picos"]
    ]],
    ["Liga\xE7\xF5es", [["R", "seta de rela\xE7\xE3o: clique no t\xF3pico de origem e depois no de destino"], ["Alt + arrastar", "seta de rela\xE7\xE3o entre dois t\xF3picos (solte sobre o destino)"], ["Ctrl+K (nas notas)", "link de texto [[ ]] para outro t\xF3pico ou mapa"]]],
    ["Notas e IA", [
      ["N", "adicionar ou editar a nota do t\xF3pico"],
      ["Ctrl+B / Ctrl+I", "negrito / it\xE1lico na nota"],
      ["[[", "autocompletar links nas notas"],
      ["Tecla de menu / Shift+F10", "menu de contexto do t\xF3pico"]
    ]],
    ["Janela", [["Ctrl+E", "painel de mapas"], ["Ctrl+G", "rede de conhecimento"], ["Ctrl+Shift+P", "leitor de PDF ao lado do mapa"], ["Alt+1 \u2026 5", "abas do painel: Estilo, Notas, Conex\xF5es, Assistente, Estrutura"], ["Esc", "fecha a janela, o menu ou a pesquisa"]]],
    ["PDF", [["Selecionar texto", "bot\xF5es \uFF0B T\xF3pico / \uFF0B Nota"], ["Ctrl + clique no destaque", "ir ao t\xF3pico do trecho"], ["Arrastar o divisor", "mudar a largura do leitor"], ["\u2190 \u2192 no divisor", "ajustar a largura (Shift = passo grande; duplo clique restaura)"]]],
    ["Arquivos", [["Ctrl+N / O / S", "novo mapa, abrir, salvar (.mom)"], ["Ctrl+Shift+S", "salvar como"], ["F1", "esta ajuda"]]]
  ];
  function ShortcutsModal({ onClose }) {
    useEscape(onClose);
    return /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "modal-box", id: "keysBox", "data-ui": "react", children: [
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h2", { children: "Atalhos do teclado" }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("div", { className: "keys-grid", children: GROUPS.map(([g2, rows]) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "keys-group", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("h3", { children: g2 }),
        rows.map(([k2, d2]) => /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "keys-row", children: [
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("kbd", { children: k2 }),
          /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { children: d2 })
        ] }, k2))
      ] }, g2)) }),
      /* @__PURE__ */ (0, import_jsx_runtime6.jsxs)("div", { className: "foot", children: [
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("span", { className: "grow" }),
        /* @__PURE__ */ (0, import_jsx_runtime6.jsx)("button", { className: "btn primary", id: "keysClose", onClick: onClose, children: "Fechar" })
      ] })
    ] });
  }

  // renderer/react/Home.jsx
  var import_react5 = __toESM(require_react());

  // renderer/react/home-parts.jsx
  var import_jsx_runtime7 = __toESM(require_jsx_runtime());
  var ago = (ms) => {
    if (!ms) return "";
    const d2 = Math.floor((Date.now() - ms) / 864e5);
    return d2 <= 0 ? "hoje" : d2 === 1 ? "ontem" : d2 < 30 ? `h\xE1 ${d2} dias` : new Date(ms).toLocaleDateString("pt-BR");
  };
  function ActionButton({ id, title, hint, primary, onClick }) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", { className: "hm-action" + (primary ? " primary" : ""), id, onClick, children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("b", { children: title }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { children: hint })
    ] });
  }
  function ContinueCard({ last, onOpen }) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("section", { className: "hm-sec hm-continue-sec", id: "hmLast", children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("h3", { children: "Continuar de onde parou" }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", { className: "hm-continue", id: "hmContinue", onClick: () => onOpen(last), children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("b", { children: last.name }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("span", { className: "muted", children: [
          last.dir,
          " \xB7 ",
          ago(last.mtime)
        ] })
      ] })
    ] });
  }
  function RecentCard({ item, onOpen, onRemove }) {
    return /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("li", { className: "hm-card" + (item.exists ? "" : " missing"), children: [
      /* @__PURE__ */ (0, import_jsx_runtime7.jsxs)("button", { className: "hm-card-open", disabled: !item.exists, onClick: () => onOpen(item), title: item.path, children: [
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("b", { children: item.name }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "muted", children: item.exists ? `${item.dir}` : "arquivo n\xE3o encontrado" }),
        /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("span", { className: "hm-card-when", children: item.exists ? ago(item.mtime) : "" })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime7.jsx)("button", { className: "icon-btn sm hm-card-x", title: "Tirar da lista (o arquivo n\xE3o \xE9 apagado)", "aria-label": "Tirar da lista: " + item.name, onClick: () => onRemove(item.path), children: "\xD7" })
    ] });
  }

  // renderer/react/Home.jsx
  var import_jsx_runtime8 = __toESM(require_jsx_runtime());
  function Home() {
    const [data, setData] = (0, import_react5.useState)(() => H().homeData());
    const A2 = H().homeActions;
    const refresh = () => setData(H().homeData());
    const remove = async (p2) => {
      await A2.removeRecent(p2);
      refresh();
    };
    const clear = async () => {
      await A2.clearRecent();
      refresh();
    };
    return /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "hm", children: [
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "hm-start", children: [
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "hm-brand", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("img", { className: "hm-logo", src: "assets/logo.svg", alt: "", height: "40" }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("h1", { children: "BRANIAC" })
        ] }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("p", { className: "hm-lead", children: "Seu grande c\xE9rebro para mapas mentais. Abre e salva no formato do Mindomo. Cada nota vira um arquivo Markdown que o Obsidian l\xEA." }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "hm-actions", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ActionButton, { id: "hmNew", primary: true, title: "Novo mapa", hint: "Come\xE7a com a ideia central e tr\xEAs t\xF3picos", onClick: () => A2.newBlank() }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ActionButton, { id: "hmOpen", title: "Abrir arquivo .mom", hint: "Um mapa do Mindomo ou salvo aqui", onClick: () => A2.openFile() }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ActionButton, { id: "hmPdf", title: "Ler um PDF", hint: "Selecione um trecho para virar t\xF3pico", onClick: () => A2.openPdf() }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ActionButton, { id: "hmDash", title: "Painel de mapas", hint: "Resumo dos seus mapas", onClick: () => H().openDash() })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("div", { className: "hm-main", children: [
        data.last && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(ContinueCard, { last: data.last, onOpen: A2.openRecent }),
        /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("section", { className: "hm-sec", id: "hmRecent", children: [
          /* @__PURE__ */ (0, import_jsx_runtime8.jsxs)("h3", { children: [
            /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("span", { children: "Mapas recentes" }),
            data.recent.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("button", { className: "link", id: "hmClear", onClick: clear, children: "limpar lista" })
          ] }),
          data.recent.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("div", { className: "empty", children: "Nenhum mapa aberto ainda. Crie um novo, arraste um arquivo .mom para esta janela, ou importe uma pasta do Obsidian para come\xE7ar seu segundo c\xE9rebro." }),
          /* @__PURE__ */ (0, import_jsx_runtime8.jsx)("ul", { className: "hm-cards", children: data.recent.map((r2) => /* @__PURE__ */ (0, import_jsx_runtime8.jsx)(RecentCard, { item: r2, onOpen: A2.openRecent, onRemove: remove }, r2.path)) })
        ] })
      ] })
    ] });
  }

  // renderer/react/index.jsx
  var import_jsx_runtime9 = __toESM(require_jsx_runtime());
  var cur = null;
  function unmount() {
    if (cur) {
      try {
        cur.root.unmount();
      } catch {
      }
      cur = null;
    }
  }
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var visible = (e2) => !!(e2.offsetWidth || e2.offsetHeight || e2.getClientRects().length);
  var returnFocus = null;
  var restoreTimer = null;
  var pendingBack = null;
  window.addEventListener("keydown", (e2) => trapKeys(e2), true);
  function trapKeys(e2) {
    const m2 = document.getElementById("modal");
    if (e2.key !== "Tab" || !m2 || m2.hidden) return;
    e2.stopPropagation();
    const items = [...m2.querySelectorAll(FOCUSABLE)].filter(visible);
    if (!items.length) {
      e2.preventDefault();
      return;
    }
    const first = items[0], last = items[items.length - 1], cur2 = document.activeElement;
    if (!m2.contains(cur2)) {
      e2.preventDefault();
      first.focus();
    } else if (e2.shiftKey && cur2 === first) {
      e2.preventDefault();
      last.focus();
    } else if (!e2.shiftKey && cur2 === last) {
      e2.preventDefault();
      first.focus();
    }
  }
  function initialFocus(m2) {
    const box = m2.querySelector(".modal-box");
    if (!box) return;
    const label = box.querySelector("h2");
    if (label) m2.setAttribute("aria-label", label.textContent.replace(/\s+/g, " ").trim());
    const first = (sel) => [...box.querySelectorAll(sel)].find(visible);
    const touch = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
    const typing = (e2) => e2 && /^(INPUT|TEXTAREA)$/.test(e2.tagName) && !/^(button|submit|checkbox|radio|range|color|file)$/i.test(e2.type || "");
    let target = first("[data-autofocus]") || first("input:not([type=hidden]):not([type=radio]):not([type=checkbox]):not([disabled])") || first("button.primary:not([disabled])") || first(FOCUSABLE);
    if (touch && typing(target)) target = first("button.primary:not([disabled])") || first("button:not([disabled])") || box;
    if (target) {
      if (target === box) box.setAttribute("tabindex", "-1");
      target.focus();
    }
  }
  function mount(Component, props) {
    const H3 = window.MC, m2 = H3.modalEl();
    unmount();
    if (restoreTimer) {
      clearTimeout(restoreTimer);
      restoreTimer = null;
      returnFocus = pendingBack;
    } else if (m2.hidden && document.activeElement && document.activeElement !== document.body) returnFocus = document.activeElement;
    m2.setAttribute("role", "dialog");
    m2.setAttribute("aria-modal", "true");
    m2.textContent = "";
    m2.hidden = false;
    const host = document.createElement("div");
    host.id = "react-host";
    m2.appendChild(host);
    const root = (0, import_client.createRoot)(host);
    cur = { root, host };
    const close = () => {
      unmount();
      H3.closeModal();
      const back = returnFocus;
      returnFocus = null;
      pendingBack = back;
      clearTimeout(restoreTimer);
      restoreTimer = setTimeout(() => {
        restoreTimer = null;
        if (H3.modalEl().hidden && back && document.contains(back) && visible(back)) back.focus();
      }, 0);
    };
    (0, import_react_dom.flushSync)(() => root.render(/* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Component, { ...props, onClose: close })));
    initialFocus(m2);
  }
  var dashRoot = null;
  function renderDash() {
    const box = document.getElementById("dash");
    if (!dashRoot) {
      box.textContent = "";
      dashRoot = (0, import_client.createRoot)(box);
    }
    (0, import_react_dom.flushSync)(() => dashRoot.render(/* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Dashboard, { onClose: () => window.MC.closeDash() })));
  }
  function unmountDash() {
    if (!dashRoot) return;
    try {
      dashRoot.unmount();
    } catch {
    }
    dashRoot = null;
    const box = document.getElementById("dash");
    box.textContent = "";
    delete box.dataset.ui;
  }
  var panels = {};
  function renderPanel(id, element) {
    const box = document.getElementById(id);
    if (!box) return;
    if (!panels[id]) {
      box.textContent = "";
      panels[id] = (0, import_client.createRoot)(box);
    }
    (0, import_react_dom.flushSync)(() => panels[id].render(element));
    box.dataset.ui = "react";
  }
  function unmountPanel(id) {
    if (!panels[id]) return;
    try {
      panels[id].unmount();
    } catch {
    }
    delete panels[id];
    const box = document.getElementById(id);
    if (box) {
      box.textContent = "";
      delete box.dataset.ui;
    }
  }
  var pdfRoot = null;
  var resizeSoon = () => setTimeout(() => window.dispatchEvent(new Event("resize")), 0);
  function PdfHost({ initial, onClose }) {
    return /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)(import_jsx_runtime9.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("div", { className: "media-head", children: [
        /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { children: "Leitor de PDF" }),
        /* @__PURE__ */ (0, import_jsx_runtime9.jsxs)("span", { className: "media-tools", children: [
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { type: "button", className: "icon-btn sm", id: "pdfMax", title: "Maximizar o leitor (ocupa a \xE1rea de trabalho)", "aria-label": "Maximizar o leitor de PDF", onClick: () => window.toggleDockMax && window.toggleDockMax(), children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { "aria-hidden": "true", children: "\u2922" }) }),
          /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("button", { type: "button", className: "icon-btn sm", id: "pdfClose", title: "Fechar o leitor de PDF (Ctrl+Shift+P)", "aria-label": "Fechar o leitor de PDF", onClick: onClose, children: /* @__PURE__ */ (0, import_jsx_runtime9.jsx)("span", { "aria-hidden": "true", children: "\u2715" }) })
        ] })
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PdfPane, { initial })
    ] });
  }
  function openPdf(opts = {}) {
    const pane = document.getElementById("pdfpane"), split = document.getElementById("pdfsplit");
    document.dispatchEvent(new CustomEvent("mc:media-focus"));
    if (pdfRoot) {
      if (opts.path || opts.page) document.dispatchEvent(new CustomEvent("mc:pdf-open", { detail: opts }));
      return;
    }
    pane.hidden = false;
    split.hidden = false;
    pane.textContent = "";
    const cfg = window.MC && typeof window.MC.loadCfg === "function" ? window.MC.loadCfg() : {};
    const w2 = cfg.pdfWidth;
    if (w2) pane.style.width = w2 + "px";
    pdfRoot = (0, import_client.createRoot)(pane);
    (0, import_react_dom.flushSync)(() => pdfRoot.render(/* @__PURE__ */ (0, import_jsx_runtime9.jsx)(PdfHost, { initial: opts, onClose: closePdf })));
    document.body.classList.add("pdf-open");
    resizeSoon();
  }
  function closePdf() {
    if (!pdfRoot) return;
    try {
      pdfRoot.unmount();
    } catch {
    }
    pdfRoot = null;
    const pane = document.getElementById("pdfpane");
    pane.textContent = "";
    pane.hidden = true;
    document.getElementById("pdfsplit").hidden = true;
    document.body.classList.remove("pdf-open");
    resizeSoon();
    document.dispatchEvent(new CustomEvent("mc:map-focus"));
  }
  var refsRoot = { r: null };
  function renderRefs() {
    const box = document.getElementById("refsBox");
    if (!box) return;
    if (!refsRoot.r) {
      box.textContent = "";
      refsRoot.r = (0, import_client.createRoot)(box);
    }
    (0, import_react_dom.flushSync)(() => refsRoot.r.render(/* @__PURE__ */ (0, import_jsx_runtime9.jsx)(RefsBox, {})));
  }
  document.addEventListener("mc:render", () => {
    if (document.getElementById("refsBox")) renderRefs();
  });
  var homeRoot = null;
  function openHome() {
    const box = document.getElementById("home");
    if (!homeRoot) {
      box.textContent = "";
      homeRoot = (0, import_client.createRoot)(box);
    }
    box.hidden = false;
    box.dataset.ui = "react";
    document.querySelector('[data-act="home"]')?.classList.add("on");
    (0, import_react_dom.flushSync)(() => homeRoot.render(/* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Home, { onClose: closeHome })));
    const target = box.querySelector("#hmContinue") || box.querySelector("#hmNew");
    if (target) target.focus();
    window.dispatchEvent(new Event("mc:render"));
  }
  function closeHome() {
    if (!homeRoot) return;
    try {
      homeRoot.unmount();
    } catch {
    }
    homeRoot = null;
    const box = document.getElementById("home");
    box.hidden = true;
    box.textContent = "";
    delete box.dataset.ui;
    document.querySelector('[data-act="home"]')?.classList.remove("on");
    window.dispatchEvent(new Event("mc:render"));
  }
  window.MCReact = {
    version: 2,
    openShortcuts: () => mount(ShortcutsModal, {}),
    openHome,
    closeHome,
    homeIsOpen: () => !!homeRoot,
    renderDash,
    unmountDash,
    openPdf,
    closePdf,
    togglePdf: () => pdfRoot ? closePdf() : openPdf({}),
    pdfIsOpen: () => !!pdfRoot,
    renderRefs,
    renderLinks: (model) => renderPanel("linksBody", /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Connections, { model })),
    unmountLinks: () => unmountPanel("linksBody"),
    renderOutline: (rows) => renderPanel("outline", /* @__PURE__ */ (0, import_jsx_runtime9.jsx)(Outline, { rows })),
    unmountOutline: () => unmountPanel("outline"),
    unmount
  };
})();
