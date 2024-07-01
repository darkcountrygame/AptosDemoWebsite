export const decodeHex = (hexString) => {
    const bytes = new Uint8Array(hexString.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));
    return new TextDecoder().decode(bytes);
}