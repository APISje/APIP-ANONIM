import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  Lock, CheckCircle2, Download, File, 
  MessageSquare, Bug, BellRing, Plus, ShieldCheck, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { playSound } from "@/lib/utils";
import { 
  useVireonMessages, 
  useAcceptVireonMessage 
} from "@/hooks/use-messages";
import { useVireonBugs } from "@/hooks/use-bugs";
import { 
  useVireonAnnouncements, 
  useCreateVireonAnnouncement 
} from "@/hooks/use-announcements";

type Tab = "pesan" | "bugs" | "pengumuman";

export default function Dashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("pesan");
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput === "APIP") {
      setPassword(loginInput);
      setIsAuthenticated(true);
      toast({ title: "Akses Diberikan", description: "Selamat datang, Owner!" });
    } else {
      toast({ title: "Kode Salah", description: "Anda bukan pemilik yang sah.", variant: "destructive" });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center border-white/10 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-neon" />
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock className="w-8 h-8 text-pink-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Owner Dashboard</h2>
            <p className="text-muted-foreground mb-8">Masukkan kode akses untuk melihat data</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <Input 
                type="password" 
                placeholder="Masukkan kode akses" 
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                className="text-center tracking-widest text-lg h-14"
              />
              <Button type="submit" className="w-full h-14 text-lg">Masuk</Button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-pink-500" />
            Dashboard <span className="text-gradient">Vireon</span>
          </h1>
          <p className="text-muted-foreground mt-2">Kelola semua data yang masuk dengan aman.</p>
        </div>
        
        <div className="flex bg-white/5 p-1 rounded-xl w-full md:w-auto">
          <TabButton active={activeTab === "pesan"} onClick={() => setActiveTab("pesan")} icon={<MessageSquare className="w-4 h-4" />}>Pesan</TabButton>
          <TabButton active={activeTab === "bugs"} onClick={() => setActiveTab("bugs")} icon={<Bug className="w-4 h-4" />}>Bugs</TabButton>
          <TabButton active={activeTab === "pengumuman"} onClick={() => setActiveTab("pengumuman")} icon={<BellRing className="w-4 h-4" />}>Announce</TabButton>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "pesan" && <MessagesTab password={password} />}
          {activeTab === "bugs" && <BugsTab password={password} />}
          {activeTab === "pengumuman" && <AnnouncementsTab password={password} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, children, icon }: { active: boolean, onClick: () => void, children: React.ReactNode, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
        active 
        ? "bg-white/10 text-white shadow-sm" 
        : "text-white/50 hover:text-white/80 hover:bg-white/5"
      }`}
    >
      {icon} {children}
    </button>
  );
}

// --- TAB COMPONENTS ---

function MessagesTab({ password }: { password: string }) {
  const { data, isLoading } = useVireonMessages({ password });
  const { mutate: acceptMsg } = useAcceptVireonMessage();
  const [filter, setFilter] = useState<"all"|"accepted"|"unaccepted">("all");
  const [prevCount, setPrevCount] = useState(0);

  // Notification Sound Logic
  useEffect(() => {
    if (data?.messages && data.messages.length > prevCount) {
      if (prevCount > 0) playSound("/kirim.mp3");
      setPrevCount(data.messages.length);
    }
  }, [data?.messages, prevCount]);

  const messages = data?.messages || [];
  const filtered = messages.filter(m => {
    if (filter === "all") return true;
    if (filter === "accepted") return m.accepted;
    return !m.accepted;
  });

  const handleDownloadFile = (id: number) => {
    const url = `/api/messages/${id}/file?password=${password}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    const withFiles = messages.filter(m => m.hasFile);
    if (withFiles.length === 0) return;
    
    // Hacky frontend multi-download with delay to bypass popup blockers
    withFiles.forEach((m, i) => {
      setTimeout(() => {
        handleDownloadFile(m.id);
      }, i * 500);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
        <div className="flex gap-2">
          <FilterBadge active={filter === "all"} onClick={() => setFilter("all")}>Semua ({messages.length})</FilterBadge>
          <FilterBadge active={filter === "unaccepted"} onClick={() => setFilter("unaccepted")}>Baru</FilterBadge>
          <FilterBadge active={filter === "accepted"} onClick={() => setFilter("accepted")}>Diterima</FilterBadge>
        </div>
        
        <Button onClick={handleDownloadAll} variant="secondary" className="w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" /> Ambil Semua File
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-white/50">Memuat pesan...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
          <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-lg text-white/50">Tidak ada pesan ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(msg => (
            <Card key={msg.id} className={`p-6 flex flex-col transition-all duration-300 ${msg.accepted ? 'border-pink-500/30 bg-pink-500/5' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-lg text-white">{msg.senderName || "Anonim"}</h4>
                  <p className="text-xs text-muted-foreground">{format(new Date(msg.createdAt), "dd MMM yyyy, HH:mm")}</p>
                </div>
                <button 
                  onClick={() => acceptMsg({ id: msg.id, params: { password } })}
                  className={`p-2 rounded-full transition-colors ${msg.accepted ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/40 hover:bg-white/20 hover:text-white'}`}
                  title={msg.accepted ? "Telah diterima" : "Terima pesan"}
                >
                  <Heart className={`w-5 h-5 ${msg.accepted ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="bg-black/30 rounded-xl p-4 text-white/90 text-sm flex-1 whitespace-pre-wrap">
                {msg.message}
              </div>

              {msg.hasFile && (
                <div className="mt-4 flex items-center justify-between bg-violet-900/20 border border-violet-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <File className="w-8 h-8 text-violet-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-sm font-medium truncate text-white">{msg.fileName || "File Terlampir"}</p>
                      <p className="text-xs text-violet-300/70">{msg.fileSize ? (msg.fileSize / 1024 / 1024).toFixed(2) + " MB" : "Unknown size"}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownloadFile(msg.id)}
                    className="p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition-colors shrink-0 shadow-lg shadow-violet-500/30"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterBadge({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${active ? 'bg-pink-500 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
    >
      {children}
    </button>
  );
}

function BugsTab({ password }: { password: string }) {
  const { data, isLoading } = useVireonBugs({ password });
  const bugs = data?.bugs || [];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-red-950/10 border-red-500/20">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-red-400">
          <Bug className="w-5 h-5" /> Laporan Bug Masuk
        </h2>
        <p className="text-sm text-white/60">Laporan dari pengguna terkait bug atau kendala platform.</p>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-white/50">Memuat bugs...</div>
      ) : bugs.length === 0 ? (
        <div className="text-center py-12 text-white/50">Belum ada laporan bug. Sistem aman! 🚀</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bugs.map(bug => (
            <div key={bug.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-red-400">{bug.reporterName || "Pengguna Anonim"}</span>
                <span className="text-xs text-white/40">{format(new Date(bug.createdAt), "dd MMM yyyy, HH:mm")}</span>
              </div>
              <p className="text-sm text-white/80">{bug.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AnnouncementsTab({ password }: { password: string }) {
  const { data, isLoading } = useVireonAnnouncements();
  const { mutate: createAnnounce, isPending } = useCreateVireonAnnouncement();
  const { toast } = useToast();
  
  const [content, setContent] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    createAnnounce({ data: { content }, params: { password } }, {
      onSuccess: () => {
        toast({ title: "Berhasil", description: "Pengumuman ditambahkan." });
        setContent("");
      },
      onError: (err) => {
        toast({ title: "Gagal", description: err.message, variant: "destructive" });
      }
    });
  };

  const announcements = data?.announcements || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-pink-500" /> Buat Pengumuman
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white/80">Teks Pengumuman</label>
              <Textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Pengumuman akan muncul di baris atas semua halaman..."
                required
              />
            </div>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Menyimpan..." : "Siarkan Pengumuman"}
            </Button>
          </form>
        </Card>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-4 ml-1">Pengumuman Aktif</h3>
        {isLoading ? (
          <div className="text-white/50">Memuat...</div>
        ) : announcements.length === 0 ? (
          <div className="text-white/50 p-6 bg-white/5 rounded-xl border border-white/5 text-center">Belum ada pengumuman.</div>
        ) : (
          <div className="space-y-4">
            {announcements.map(ann => (
              <div key={ann.id} className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden group">
                <div className={`absolute top-0 left-0 w-1 h-full ${ann.active ? 'bg-green-500' : 'bg-gray-500'}`} />
                <p className="text-sm text-white/90 pl-3">{ann.content}</p>
                <p className="text-xs text-white/40 mt-3 pl-3 flex justify-between">
                  <span>{format(new Date(ann.createdAt), "dd MMM yyyy")}</span>
                  <span>{ann.active ? "Aktif" : "Nonaktif"}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
