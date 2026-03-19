import { motion } from "framer-motion";
import { format } from "date-fns";
import { useVireonGuests } from "@/hooks/use-guests";
import { Card } from "@/components/ui/card";
import { Users, MessageSquare } from "lucide-react";

export default function Guests() {
  const { data, isLoading, error } = useVireonGuests();

  const guests = data?.guests || [];

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 mx-auto bg-gradient-neon rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-500/20 rotate-3"
        >
          <Users className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-4xl font-display font-bold mb-4">Menu <span className="text-gradient">Tamu</span></h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Melihat siapa saja yang telah meninggalkan jejak nama mereka.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-400 bg-red-900/10 rounded-2xl border border-red-500/20">
          Gagal memuat data tamu.
        </div>
      ) : guests.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-white/50 font-medium">Belum ada tamu yang meninggalkan nama.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {guests.map((guest, index) => (
            <motion.div
              key={guest.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:bg-white/10 transition-colors duration-300 group cursor-default">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-display font-bold text-lg group-hover:bg-transparent transition-colors">
                      {getInitials(guest.senderName)}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg truncate w-32" title={guest.senderName}>
                      {guest.senderName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(guest.lastSeen), "dd MMM yyyy, HH:mm")}
                    </p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <MessageSquare className="w-4 h-4 text-pink-400" />
                    <span>{guest.messageCount} Pesan</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
