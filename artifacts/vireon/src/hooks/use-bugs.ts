import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getBugs, 
  reportBug,
  getGetBugsQueryKey 
} from "@workspace/api-client-react";
import type { 
  GetBugsParams, 
  ReportBugRequest 
} from "@workspace/api-client-react";

export function useVireonBugs(params: GetBugsParams, enabled: boolean = true) {
  return useQuery({
    queryKey: getGetBugsQueryKey(params),
    queryFn: () => getBugs(params),
    enabled: enabled && !!params.password,
  });
}

export function useReportVireonBug() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ReportBugRequest) => reportBug(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bugs'] });
    }
  });
}
