import { NextResponse } from "next/server";
import { mockAdminTransactions } from "@/lib/mock/data";

export function GET() {
  return NextResponse.json({ success: true, code: 200, data: mockAdminTransactions });
}
