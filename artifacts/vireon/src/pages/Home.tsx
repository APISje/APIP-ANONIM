import { useState, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Send, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useSendVireonMessage } from "@/hooks/use-messages";
import { playSound } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { mutate: sendMessage, isPending } = useSendVireonMessage();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 100 * 1024 * 1024) { // 100MB limit
        toast({
          title: "File terlalu besar!",
          description: "Maksimal ukuran file adalah 100MB.",
          variant: "destructive"
        });
        return;
      }
      setFile(selected);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({ title: "Pesan kosong!", description: "Tuliskan sesuatu untuk dikirim.", variant: "destructive" });
      return;
    }

    // Play Sound
    playSound("/kirim.mp3");

    sendMessage({
      senderName: name.trim() || undefined,
      message,
      file: file || undefined
    }, {
      onSuccess: () => {
        // Confetti Celebration
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        toast({
          title: "Pesan Terkirim! 🎉",
          description: "Terima kasih sudah mengirim pesan anonim.",
        });

        // Reset
        setName("");
        setMessage("");
        setFile(null);
      },
      onError: (err) => {
        toast({
          title: "Gagal mengirim pesan",
          description: err.message || "Terjadi kesalahan sistem.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-12 md:py-20 relative">
      
      {/* Decorative background blurs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl z-10"
      >
        <div className="text-center mb-10">
          <img 
            src={`${import.meta.env.BASE_URL}images/logo.png`} 
            alt="Vireon Project Logo" 
            className="h-20 mx-auto mb-6 object-contain drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]"
          />
          <h1 className="text-4xl md:text-5xl font-display font-black mb-4">
            Kirim Pesan <span className="text-gradient">Anonim!</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Sampaikan apapun tanpa perlu khawatir ketahuan.
          </p>
        </div>

        <Card className="p-1 border-white/5 relative overflow-hidden">
          {/* Subtle gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          
          <form onSubmit={handleSubmit} className="relative bg-black/40 backdrop-blur-md rounded-[14px] p-6 sm:p-8 space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80 ml-1">Nama (Opsional)</label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sertakan nama jika mau..."
                maxLength={50}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80 ml-1">Pesan *</label>
              <Textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis pesanmu di sini..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80 ml-1">Lampiran (Opsional)</label>
              
              {!file ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-white/10 hover:border-pink-500/50 hover:bg-white/5 transition-all duration-300 rounded-xl p-6 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-white"
                >
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-pink-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">Upload foto atau file</p>
                    <p className="text-xs opacity-70 mt-1">Maksimal ukuran 100MB</p>
                  </div>
                </button>
              ) : (
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-gradient-neon flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="truncate">
                      <p className="font-medium text-sm text-white truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-red-400 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </div>

            <Button 
              type="submit" 
              disabled={isPending} 
              className="w-full text-lg h-14 mt-4 relative group overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isPending ? "Mengirim..." : "Kirim Pesan Sekarang"} 
                {!isPending && <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
              </span>
              {/* Button shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            </Button>

          </form>
        </Card>

        <div className="text-center mt-12 text-white/40 text-sm font-medium">
          <p>Sent with ❤️ from Vireon Project</p>
          <button 
            onClick={() => window.open('/dashboard')} // quick hidden route trigger or just link
            className="mt-2 text-xs opacity-50 hover:opacity-100 transition-opacity"
          >
            Owner Login
          </button>
        </div>

      </motion.div>
    </div>
  );
}
