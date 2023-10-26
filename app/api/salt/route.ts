import { NextResponse } from "next/server";
import { supabase } from "../../../lib/superbaseClient";
import crypto from "crypto";

export async function POST(request: Request) {
  const { playerOneAddress } = await request.json();
  if (!playerOneAddress)
    return NextResponse.json({ message: "Missing Player One Address" });

  const randomSalt = crypto.randomInt(100000000, 10000000000);

  const { error } = await supabase
    .from("active_contracts")
    .update({ salt: randomSalt })
    .eq("address", playerOneAddress);
  console.log(error);
  return NextResponse.json({ salt: randomSalt });
}
