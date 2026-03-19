import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getMessages, 
  sendMessage, 
  acceptMessage,
  getGetMessagesQueryKey
} from "@workspace/api-client-react";
import type { 
  GetMessagesParams, 
  SendMessageRequest, 
  AcceptMessageParams 
} from "@workspace/api-client-react";

export function useVireonMessages(params: GetMessagesParams, enabled: boolean = true) {
  return useQuery({
    queryKey: getGetMessagesQueryKey(params),
    queryFn: () => getMessages(params),
    enabled: enabled && !!params.password,
    refetchInterval: 30000, // Poll every 30 seconds for dashboard
  });
}

export function useSendVireonMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: SendMessageRequest) => sendMessage(data),
    onSuccess: () => {
      // Invalidate both potential queries just in case
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    }
  });
}

export function useAcceptVireonMessage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, params }: { id: number, params: AcceptMessageParams }) => 
      acceptMessage(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    }
  });
}
