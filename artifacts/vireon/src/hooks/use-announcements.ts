import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAnnouncements, 
  createAnnouncement,
  getGetAnnouncementsQueryKey 
} from "@workspace/api-client-react";
import type { 
  CreateAnnouncementRequest, 
  CreateAnnouncementParams 
} from "@workspace/api-client-react";

export function useVireonAnnouncements() {
  return useQuery({
    queryKey: getGetAnnouncementsQueryKey(),
    queryFn: () => getAnnouncements(),
  });
}

export function useCreateVireonAnnouncement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, params }: { data: CreateAnnouncementRequest, params: CreateAnnouncementParams }) => 
      createAnnouncement(data, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetAnnouncementsQueryKey() });
    }
  });
}
