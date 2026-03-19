import { useQuery } from "@tanstack/react-query";
import { getGuests, getGetGuestsQueryKey } from "@workspace/api-client-react";

export function useVireonGuests() {
  return useQuery({
    queryKey: getGetGuestsQueryKey(),
    queryFn: () => getGuests(),
  });
}
