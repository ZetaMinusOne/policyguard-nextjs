import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
export declare function setPolicyHeaders(key: string, req: NextRequest, res: NextResponse): Promise<NextResponse>;
export declare function withPolicyGuard(key: string, req: NextRequest, ev: NextFetchEvent): Promise<NextResponse>;
