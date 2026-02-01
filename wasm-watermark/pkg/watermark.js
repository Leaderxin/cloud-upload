/* @ts-self-types="./wasm_watermark.d.ts" */

// ============================================================================
// WASM 绑定代码（来自 wasm_watermark.js）
// ============================================================================

export class WatermarkError {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WatermarkErrorFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_watermarkerror_free(ptr, 0);
    }
    /**
     * @returns {string}
     */
    get message() {
        let deferred1_0;
        let deferred1_1;
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.watermarkerror_message(retptr, this.__wbg_ptr);
            var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
            var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
            deferred1_0 = r0;
            deferred1_1 = r1;
            return getStringFromWasm0(r0, r1);
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
            wasm.__wbindgen_export4(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) WatermarkError.prototype[Symbol.dispose] = WatermarkError.prototype.free;

/**
 * @param {Uint8Array} image_data
 * @param {any} config_js
 * @returns {Uint8Array}
 */
export function add_watermark(image_data, config_js) {
    try {
        const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
        const ptr0 = passArray8ToWasm0(image_data, wasm.__wbindgen_export);
        const len0 = WASM_VECTOR_LEN;
        wasm.add_watermark(retptr, ptr0, len0, addHeapObject(config_js));
        var r0 = getDataViewMemory0().getInt32(retptr + 4 * 0, true);
        var r1 = getDataViewMemory0().getInt32(retptr + 4 * 1, true);
        var r2 = getDataViewMemory0().getInt32(retptr + 4 * 2, true);
        var r3 = getDataViewMemory0().getInt32(retptr + 4 * 3, true);
        if (r3) {
            throw takeObject(r2);
        }
        var v2 = getArrayU8FromWasm0(r0, r1).slice();
        wasm.__wbindgen_export4(r0, r1 * 1, 1);
        return v2;
    } finally {
        wasm.__wbindgen_add_to_stack_pointer(16);
    }
}

/**
 * @param {Uint8Array} image_data
 * @param {any} config_js
 * @returns {Promise<Uint8Array>}
 */
export function add_watermark_async(image_data, config_js) {
    const ptr0 = passArray8ToWasm0(image_data, wasm.__wbindgen_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.add_watermark_async(ptr0, len0, addHeapObject(config_js));
    return takeObject(ret);
}

export function init() {
    wasm.init();
}

function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg_Error_8c4e43fe74559d73: function(arg0, arg1) {
            const ret = Error(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbg_Number_04624de7d0e8332d: function(arg0) {
            const ret = Number(getObject(arg0));
            return ret;
        },
        __wbg_String_8f0eb39a4a4c2f66: function(arg0, arg1) {
            const ret = String(getObject(arg1));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_boolean_get_bbbb1c18aa2f5e25: function(arg0) {
            const v = getObject(arg0);
            const ret = typeof(v) === 'boolean' ? v : undefined;
            return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
        },
        __wbg___wbindgen_debug_string_0bc8482c6e3508ae: function(arg0, arg1) {
            const ret = debugString(getObject(arg1));
            const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            const len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_in_47fa6863be6f2f25: function(arg0, arg1) {
            const ret = getObject(arg0) in getObject(arg1);
            return ret;
        },
        __wbg___wbindgen_is_function_0095a73b8b156f76: function(arg0) {
            const ret = typeof(getObject(arg0)) === 'function';
            return ret;
        },
        __wbg___wbindgen_is_object_5ae8e5880f2c1fbd: function(arg0) {
            const val = getObject(arg0);
            const ret = typeof(val) === 'object' && val !== null;
            return ret;
        },
        __wbg___wbindgen_is_undefined_9e4d92534c42d778: function(arg0) {
            const ret = getObject(arg0) === undefined;
            return ret;
        },
        __wbg___wbindgen_jsval_loose_eq_9dd77d8cd6671811: function(arg0, arg1) {
            const ret = getObject(arg0) == getObject(arg1);
            return ret;
        },
        __wbg___wbindgen_number_get_8ff4255516ccad3e: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        },
        __wbg___wbindgen_string_get_72fb696202c56729: function(arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof(obj) === 'string' ? obj : undefined;
            var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_export, wasm.__wbindgen_export2);
            var len1 = WASM_VECTOR_LEN;
            getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg___wbindgen_throw_be289d5034ed271b: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbg__wbg_cb_unref_d9b87ff7982e3b21: function(arg0) {
            getObject(arg0)._wbg_cb_unref();
        },
        __wbg_call_389efe28435a9388: function() { return handleError(function (arg0, arg1) {
            const ret = getObject(arg0).call(getObject(arg1));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_call_4708e0c13bdc8e95: function() { return handleError(function (arg0, arg1, arg2) {
            const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        }, arguments); },
        __wbg_get_with_ref_key_1dc361bd10053bfe: function(arg0, arg1) {
            const ret = getObject(arg0)[getObject(arg1)];
            return addHeapObject(ret);
        },
        __wbg_instanceof_ArrayBuffer_c367199e2fa2aa04: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof ArrayBuffer;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_instanceof_Uint8Array_9b9075935c74707c: function(arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof Uint8Array;
            } catch (_) {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_isSafeInteger_bfbc7332a9768d2a: function(arg0) {
            const ret = Number.isSafeInteger(getObject(arg0));
            return ret;
        },
        __wbg_length_32ed9a279acd054c: function(arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_new_b5d9e2fb389fef91: function(arg0, arg1) {
            try {
                var state0 = {a: arg0, b: arg1};
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return __wasm_bindgen_func_elem_472(a, state0.b, arg0, arg1);
                    } finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return addHeapObject(ret);
            } finally {
                state0.a = state0.b = 0;
            }
        },
        __wbg_new_dd2b680c8bf6ae29: function(arg0) {
            const ret = new Uint8Array(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_new_no_args_1c7c842f08d00ebb: function(arg0, arg1) {
            const ret = new Function(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbg_prototypesetcall_bdcdcc5842e4d77d: function(arg0, arg1, arg2) {
            Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), getObject(arg2));
        },
        __wbg_queueMicrotask_0aa0a927f78f5d98: function(arg0) {
            const ret = getObject(arg0).queueMicrotask;
            return addHeapObject(ret);
        },
        __wbg_queueMicrotask_5bb536982f78a56f: function(arg0) {
            queueMicrotask(getObject(arg0));
        },
        __wbg_resolve_002c4b7d9d8f6b64: function(arg0) {
            const ret = Promise.resolve(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_static_accessor_GLOBAL_12837167ad935116: function() {
            const ret = typeof global === 'undefined' ? null : global;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_GLOBAL_THIS_e628e89ab3b1c95f: function() {
            const ret = typeof globalThis === 'undefined' ? null : globalThis;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_SELF_a621d3dfbb60d0ce: function() {
            const ret = typeof self === 'undefined' ? null : self;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_static_accessor_WINDOW_f8727f0cf888e0bd: function() {
            const ret = typeof window === 'undefined' ? null : window;
            return isLikeNone(ret) ? 0 : addHeapObject(ret);
        },
        __wbg_then_b9e7b3b5f1a9e1b5: function(arg0, arg1) {
            const ret = getObject(arg0).then(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Closure(Closure { dtor_idx: 32, function: Function { arguments: [Externref], shim_idx: 33, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
            const ret = makeMutClosure(arg0, arg1, wasm.__wasm_bindgen_func_elem_363, __wasm_bindgen_func_elem_369);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000002: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_cast_0000000000000003: function(arg0, arg1) {
            var v0 = getArrayU8FromWasm0(arg0, arg1).slice();
            wasm.__wbindgen_export4(arg0, arg1 * 1, 1);
            // Cast intrinsic for `Vector(U8) -> Externref`.
            const ret = v0;
            return addHeapObject(ret);
        },
        __wbindgen_object_clone_ref: function(arg0) {
            const ret = getObject(arg0);
            return addHeapObject(ret);
        },
        __wbindgen_object_drop_ref: function(arg0) {
            takeObject(arg0);
        },
    };
    return {
        __proto__: null,
        "./wasm_watermark_bg.js": import0,
    };
}

function __wasm_bindgen_func_elem_369(arg0, arg1, arg2) {
    wasm.__wasm_bindgen_func_elem_369(arg0, arg1, addHeapObject(arg2));
}

function __wasm_bindgen_func_elem_472(arg0, arg1, arg2, arg3) {
    wasm.__wasm_bindgen_func_elem_472(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
}

const WatermarkErrorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_watermarkerror_free(ptr >>> 0, 1));

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => state.dtor(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getObject(idx) { return heap[idx]; }

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_export3(addHeapObject(e));
    }
}

let heap = new Array(128).fill(undefined);
heap.push(undefined, null, true, false);

let heap_next = heap.length;

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(real);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    };
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasm;
function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    wasmModule = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('wasm_watermark_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };

// ============================================================================
// 辅助功能（来自 watermarkHelper.js）
// ============================================================================

/**
 * 使用 Canvas 渲染文字为图片
 * @param {string} text - 要渲染的文字
 * @param {number} fontSize - 字体大小
 * @param {string} color - 字体颜色（十六进制）
 * @param {string} imageType - 图片 MIME 类型（如 'image/jpeg', 'image/png'），默认为 'image/png'
 * @returns {string} - base64 编码的图片数据
 */
export function renderTextToImage(text, fontSize, color, imageType = 'image/png') {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // 检测是否包含中文字符
  const hasChinese = /[\u4e00-\u9fa5]/.test(text);
  
  // 根据是否包含中文选择字体
  const fontFamily = hasChinese
    ? '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", Arial, sans-serif'
    : 'Arial, sans-serif';
  
  // 设置字体
  ctx.font = `${fontSize}px ${fontFamily}`;
  
  // 测量文字尺寸
  const metrics = ctx.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  
  // 获取字体的实际高度（使用 fontBoundingBox 更准确）
  const fontBoundingBoxAscent = metrics.fontBoundingBoxAscent;
  const fontBoundingBoxDescent = metrics.fontBoundingBoxDescent;
  const textHeight = Math.ceil(fontBoundingBoxAscent + fontBoundingBoxDescent);
  
  // 设置画布大小（增加 padding 确保完整）
  const padding = 5;
  canvas.width = textWidth + padding * 2;
  canvas.height = textHeight + padding * 2;
  
  // 重新设置字体（因为改变画布大小会重置上下文）
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';
  
  // 绘制文字（从基线位置开始，考虑 padding）
  ctx.fillText(text, padding, padding + fontBoundingBoxAscent);
  
  // 转换为 base64，使用指定的图片类型
  return canvas.toDataURL(imageType);
}

/**
 * 添加水印到图片（高级 API，自动处理文字渲染）
 * @param {File|Blob|ArrayBuffer} image - 图片文件或数据
 * @param {Object} config - 水印配置
 * @returns {Promise<Blob>} - 处理后的图片Blob
 */
export async function addWatermark(image, config) {
  // 确保 WASM 已初始化
  if (wasm === undefined) {
    await __wbg_init();
  }

  // 将图片转换为ArrayBuffer
  let imageBuffer;
  if (image instanceof File || image instanceof Blob) {
    imageBuffer = await image.arrayBuffer();
  } else if (image instanceof ArrayBuffer) {
    imageBuffer = image;
  } else {
    throw new Error('不支持的图片格式，请提供File、Blob或ArrayBuffer');
  }

  const imageData = new Uint8Array(imageBuffer);

  try {
    // 调用WASM函数添加水印
    const result = add_watermark(imageData, config);
    
    // 将结果转换为Blob
    const blob = new Blob([result], { type: 'image/png' });
    return blob;
  } catch (error) {
    console.error('添加水印失败:', error);
    throw error;
  }
}

/**
 * 异步添加水印（支持大文件，自动处理文字渲染）
 * @param {File|Blob|ArrayBuffer} image - 图片文件或数据
 * @param {Object} config - 水印配置
 * @returns {Promise<Blob>} - 处理后的图片Blob
 */
export async function addWatermarkAsync(image, config) {
  // 确保 WASM 已初始化
  if (wasm === undefined) {
    await __wbg_init();
  }

  // 将图片转换为ArrayBuffer
  let imageBuffer;
  let imageType = 'image/png'; // 默认图片类型
  if (image instanceof File || image instanceof Blob) {
    imageBuffer = await image.arrayBuffer();
    // 获取原始文件的 MIME 类型
    imageType = image.type || 'image/png';
  } else if (image instanceof ArrayBuffer) {
    imageBuffer = image;
  } else {
    throw new Error('不支持的图片格式，请提供File、Blob或ArrayBuffer');
  }

  const imageData = new Uint8Array(imageBuffer);

  // 处理文字水印：自动渲染文字为图片
  let finalConfig = { ...config };
  if (config.type === 'text' && config.text) {
    try {
      // 使用客户端 Canvas 渲染文字，始终使用 PNG 格式以支持透明度
      const textImageData = renderTextToImage(
        config.text,
        config.font_size || 30,
        config.font_color || '#FFFFFF',
        'image/png'  // 始终使用 PNG 格式，因为 PNG 支持透明度
      );
      // 将渲染的文字图片作为 image_data
      finalConfig.image_data = textImageData;
      if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
        console.log('文字水印已渲染为图片，类型: image/png');
      }
    } catch (error) {
      console.error('渲染文字失败:', error);
      throw new Error('渲染文字失败: ' + error.message);
    }
  }

  try {
    // 调用WASM异步函数添加水印
    const result = await add_watermark_async(imageData, finalConfig);
    
    // 将结果转换为Blob
    const blob = new Blob([result], { type: 'image/png' });
    return blob;
  } catch (error) {
    console.error('添加水印失败:', error);
    throw error;
  }
}

/**
 * 检查是否为图片文件
 * @param {File} file - 文件对象
 * @returns {boolean}
 */
export function isImageFile(file) {
  if (!file || !file.type) {
    return false;
  }
  return file.type.startsWith('image/');
}

/**
 * 默认水印配置
 */
export const defaultWatermarkConfig = {
  // 水印类型：text 或 image
  type: 'text',
  
  // 文字水印参数
  text: '水印文字',
  font: 'Arial',
  font_size: 30,
  font_color: '#FFFFFF',
  transparency: 0.5, // 不透明度，范围 0-1，0 为完全透明，1 为完全不透明
  rotate: 0,
  x_offset: 10,
  y_offset: 10,
  tile: false,
  
  // 图片水印参数
  image_data: null, // base64编码的图片数据
  width: null,
  height: null,
};

/**
 * 创建文字水印配置
 * @param {Object} options - 配置选项
 * @param {string} options.text - 水印文字
 * @param {string} options.font - 字体名称
 * @param {number} options.fontSize - 字体大小
 * @param {string} options.fontColor - 字体颜色（十六进制）
 * @param {number} options.transparency - 不透明度，范围 0-1，0 为完全透明，1 为完全不透明
 * @param {number} options.rotate - 旋转角度（度）
 * @param {number} options.xOffset - X轴偏移量
 * @param {number} options.yOffset - Y轴偏移量
 * @param {boolean} options.tile - 是否平铺
 * @returns {Object} - 水印配置对象
 */
export function createTextWatermarkConfig(options = {}) {
  return {
    type: 'text',
    text: options.text || '水印文字',
    font: options.font || 'Arial',
    font_size: options.fontSize || 30,
    font_color: options.fontColor || '#FFFFFF',
    transparency: options.transparency !== undefined ? options.transparency : 0.5,
    rotate: options.rotate || 0,
    x_offset: options.xOffset !== undefined ? options.xOffset : 10,
    y_offset: options.yOffset !== undefined ? options.yOffset : 10,
    tile: options.tile || false,
  };
}

/**
 * 创建图片水印配置
 * @param {Object} options - 配置选项
 * @param {string} options.imageData - base64编码的图片数据
 * @param {number} options.width - 图片宽度
 * @param {number} options.height - 图片高度
 * @param {number} options.transparency - 不透明度，范围 0-1，0 为完全透明，1 为完全不透明
 * @param {number} options.rotate - 旋转角度（度）
 * @param {number} options.xOffset - X轴偏移量
 * @param {number} options.yOffset - Y轴偏移量
 * @param {boolean} options.tile - 是否平铺
 * @returns {Object} - 水印配置对象
 */
export function createImageWatermarkConfig(options = {}) {
  return {
    type: 'image',
    image_data: options.imageData, // base64编码的图片数据
    width: options.width,
    height: options.height,
    transparency: options.transparency !== undefined ? options.transparency : 0.5,
    rotate: options.rotate || 0,
    x_offset: options.xOffset !== undefined ? options.xOffset : 10,
    y_offset: options.yOffset !== undefined ? options.yOffset : 10,
    tile: options.tile || false,
  };
}