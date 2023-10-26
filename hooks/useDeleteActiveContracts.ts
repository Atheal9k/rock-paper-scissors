import { supabase } from "../lib/superbaseClient";

const useDeleteActiveContracts = async (
  playerAddress: `0x${string}` | undefined
) => {
  if (playerAddress) {
    const { error } = await supabase
      .from("active_contracts")
      .delete()
      .or(
        `player_address.eq.${playerAddress
          .trim()
          .toLowerCase()},player_two_address.eq.${playerAddress
          .trim()
          .toLowerCase()}`
      );
  }
};

export default useDeleteActiveContracts;
