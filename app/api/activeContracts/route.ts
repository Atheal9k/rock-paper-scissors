import { NextResponse } from "next/server";
import { supabase } from "../../../lib/superbaseClient";

export async function POST(request: Request) {
  const { contractAddress, playerOneAddress, playerTwoAddress, move, salt } =
    await request.json();
  if (
    !contractAddress ||
    !playerOneAddress ||
    !playerTwoAddress ||
    !move ||
    !salt
  )
    return NextResponse.json({ message: "Missing Data" });

  const { error } = await supabase.from("active_contracts").insert({
    contract_address: contractAddress,
    player_address: playerOneAddress,
    player_two_address: playerTwoAddress,
    move: move,
    salt: salt,
  });
  console.log(error);
  return NextResponse.json({ message: "Added" } || { error });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const playerAddress = url.searchParams.get("playerAddress");

  if (!playerAddress) return NextResponse.json({ message: "Missing Data" });

  const { data, error } = await supabase
    .from("active_contracts")
    .select()
    .or(
      `player_address.eq.${playerAddress
        .trim()
        .toLowerCase()},player_two_address.eq.${playerAddress
        .trim()
        .toLowerCase()}`
    )
    .filter("ended", "eq", false);

  return NextResponse.json(data || { error });
}
