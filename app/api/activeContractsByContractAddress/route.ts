import { NextResponse } from "next/server";
import { supabase } from "../../../lib/superbaseClient";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const contractAddress = url.searchParams.get("contractAddress");

  if (!contractAddress) return NextResponse.json({ message: "Missing Data" });

  const { data, error } = await supabase
    .from("active_contracts")
    .select()
    .eq("contract_address", contractAddress.trim().toLowerCase());

  return NextResponse.json(data || { error });
}
