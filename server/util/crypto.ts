import CryptoJS from 'crypto-js';

//加密
export const encrypt = (str:string) => {
    var key = CryptoJS.enc.Utf8.parse("56cc7f3c53dc459b");
    var srcs = CryptoJS.enc.Utf8.parse(str);
    var encrypted = CryptoJS.AES.encrypt(srcs, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

//解密
export const decrypt = (str:string) => {
    var key = CryptoJS.enc.Utf8.parse("56cc7f3c53dc459b");
    var decrypt = CryptoJS.AES.decrypt(str, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    return CryptoJS.enc.Utf8.stringify(decrypt).toString();
}