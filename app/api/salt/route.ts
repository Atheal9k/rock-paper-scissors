import crypto from "crypto";
import { NextResponse } from "next/server";

export async function GET() {
  const salt = crypto.randomInt(100000000, 10000000000);

  return NextResponse.json({ salt: salt });
}
