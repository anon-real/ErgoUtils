import {Serializer} from '@coinbarn/ergo-ts/dist/serializer';
import {Address} from "@coinbarn/ergo-ts/dist/models/address";

let ergolib = import('ergo-lib-wasm-browser')

const floatRe = new RegExp('^([0-9]*[.])?[0-9]*$')
const naturalRe = new RegExp('^[0-9]+$')

export async function encodeNum(n, isInt = false) {
    if (isInt) return (await ergolib).Constant.from_i32(n).encode_to_base16()
    else return (await ergolib).Constant.from_i64((await ergolib).I64.from_str(n)).encode_to_base16()
}

export async function decodeNum(n, isInt = false) {
    if (isInt) return (await ergolib).Constant.decode_from_base16(n).to_i32()
    else return (await ergolib).Constant.decode_from_base16(n).to_i64().to_str()

}

export async function encodeHex(reg) {
    return (await ergolib).Constant.from_byte_array(Buffer.from(reg, 'hex')).encode_to_base16()
}

export async function colTuple(a, b) {
    return (await ergolib).Constant.from_tuple_coll_bytes(Buffer.from(a, 'hex'), Buffer.from(b, 'hex')).encode_to_base16()
}

export async function decodeColTuple(str) {
    return (await ergolib).Constant.decode_from_base16(str).to_tuple_coll_bytes()
}

export async function encodeByteArray(reg) {
    return (await ergolib).Constant.from_byte_array(reg).encode_to_base16()
}

export function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

export async function decodeString(encoded) {
    return toHexString((await ergolib).Constant.decode_from_base16(encoded).to_byte_array())
}

export function currencyToLong(val, decimal = 9) {
    if (typeof val !== 'string') val = String(val)
    if (val === undefined) return 0
    if (val.startsWith('.')) return parseInt(val.slice(1) + '0'.repeat(decimal - val.length + 1))
    let parts = val.split('.')
    if (parts.length === 1) parts.push('')
    if (parts[1].length > decimal) return 0
    return parseInt(parts[0] + parts[1] + '0'.repeat(decimal - parts[1].length))
}

export function longToCurrency(val, decimal = 9) {
    if (typeof val !== "number") val = parseInt(val)
    return (val / Math.pow(10, decimal)).toFixed(decimal)
}

export function isFloat(num) {
    return num === '' || floatRe.test(num)
}

export function isNatural(num) {
    return num === '' || naturalRe.test(num)
}
