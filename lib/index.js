"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPolicyGuard = exports.setPolicyHeaders = void 0;
const server_1 = require("next/server");
let lastTime = null;
let headers = null;
const expiryTime = 10000; // 10 second expiry
function setPolicyHeaders(key, req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (lastTime === null || headers === null || lastTime < Date.now() - expiryTime) {
            let uri = `https://www.policyguard.io/api/csp/${key}`;
            let response = yield fetch(uri);
            if (response.ok) {
                headers = yield response.json();
            }
            else {
                console.error(`Failed to get policy header from ${uri}:`, yield response.text());
            }
        }
        if (headers !== null) {
            Object.keys(headers).forEach(key => res.headers.set(key, headers[key]));
        }
        return res;
    });
}
exports.setPolicyHeaders = setPolicyHeaders;
function withPolicyGuard(key, req, ev) {
    return setPolicyHeaders(key, req, server_1.NextResponse.next());
}
exports.withPolicyGuard = withPolicyGuard;
