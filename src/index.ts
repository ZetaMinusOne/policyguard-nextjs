import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

let lastTime = null as unknown as number;
let headers = null as any;
let fetching = false;
const expiryTime = 10000; // 10 second expiry

export async function getPolicyHeaders(apiKey: string) {
    let uri = `https://www.policyguard.io/api/csp/${apiKey}`;
    let response = await fetch(uri);
    if(response.ok) {
        return await response.json();
    } else {
        console.error(`Failed to get policy header from ${uri}:`, await response.text());
        return headers; // since the fetch failed, return the cached value
    }
}

// returns the expiration time of the current cached policy
export function getPolicyExpiration() {
    return lastTime + expiryTime;
}

// returns whether or not the current cached policy has expired
export function isPolicyExpired() {
    return lastTime === null || getPolicyExpiration() < Date.now();
}

// updates the cached headers, only allows one call at a time
export async function updatePolicyHeadersCache(apiKey: string) {
    if(fetching) return; // only one fetch at a time

    fetching = true; // set fetching bit to prevent someone else from fetching
    
    headers = await getPolicyHeaders(apiKey); // get the headers and update the cache

    lastTime = Date.now(); // update our cache expiration

    fetching = false; // allow others to update
}

export function setPolicyHeaders(apiKey: string, req: NextRequest, res: NextResponse) {
    if(isPolicyExpired()) {
        // this is an async method but we do not await because we do not want to block the request
        updatePolicyHeadersCache(apiKey);
    }
    
    if(headers !== null) {
        Object.keys(headers).forEach(key => res.headers.set(key, headers[key]));
    }

    return res;
}

export function withPolicyGuard(key: string, req: NextRequest, ev: NextFetchEvent) {
    return setPolicyHeaders(key, req, NextResponse.next());
}