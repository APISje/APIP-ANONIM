import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useVireonAnnouncements } from "@/hooks/use-announcements";
import { useState, useEffect } from "react";

export function AnnouncementBar() {
  const { data } = useVireonAnnouncements();
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeAnnouncements = data?.announcements?.filter(a => a.active) || [];

  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className="w-full bg-gradient-to-r from-pink-600/90 to-violet-700/90 backdrop-blur-md text-white py-3 px-4 relative overflow-hidden flex items-center justify-center z-50 border-b border-white/10 shadow-[0_4px_30px_rgba(236,72,153,0.3)]">
      <Bell className="w-5 h-5 mr-3 animate-bounce shrink-0" />
      <div className="relative w-full max-w-3xl h-6 flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute w-full text-center font-medium text-sm sm:text-base truncate"
          >
            <span className="font-bold opacity-80 mr-2">Founder:</span>
            {activeAnnouncements[currentIndex].content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
