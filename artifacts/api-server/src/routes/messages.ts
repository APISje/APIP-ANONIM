import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { db, messagesTable, announcementsTable, bugsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router: IRouter = Router();
const ADMIN_PASSWORD = "APIP";

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

function checkAuth(req: Request, res: Response): boolean {
  const password = req.query.password as string;
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

router.get("/messages", async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;
  try {
    const messages = await db
      .select({
        id: messagesTable.id,
        senderName: messagesTable.senderName,
        message: messagesTable.message,
        hasFile: messagesTable.hasFile,
        fileName: messagesTable.fileName,
        fileType: messagesTable.fileType,
        fileSize: messagesTable.fileSize,
        accepted: messagesTable.accepted,
        createdAt: messagesTable.createdAt,
      })
      .from(messagesTable)
      .orderBy(desc(messagesTable.createdAt));

    res.json({ messages, total: messages.length });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/messages", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const { senderName, message } = req.body;
    if (!message || message.trim() === "") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    let hasFile = false;
    let fileName: string | null = null;
    let fileType: string | null = null;
    let fileSize: number | null = null;
    let fileData: string | null = null;

    if (req.file) {
      hasFile = true;
      fileName = req.file.originalname;
      fileType = req.file.mimetype;
      fileSize = req.file.size;
      fileData = req.file.buffer.toString("base64");
    }

    const [inserted] = await db
      .insert(messagesTable)
      .values({
        senderName: senderName?.trim() || null,
        message: message.trim(),
        hasFile,
        fileName,
        fileType,
        fileSize,
        fileData,
        accepted: false,
      })
      .returning({
        id: messagesTable.id,
        senderName: messagesTable.senderName,
        message: messagesTable.message,
        hasFile: messagesTable.hasFile,
        fileName: messagesTable.fileName,
        fileType: messagesTable.fileType,
        fileSize: messagesTable.fileSize,
        accepted: messagesTable.accepted,
        createdAt: messagesTable.createdAt,
      });

    res.status(201).json({ message: inserted });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/messages/:id/accept", async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(messagesTable)
      .set({ accepted: true })
      .where(eq(messagesTable.id, id))
      .returning({
        id: messagesTable.id,
        senderName: messagesTable.senderName,
        message: messagesTable.message,
        hasFile: messagesTable.hasFile,
        fileName: messagesTable.fileName,
        fileType: messagesTable.fileType,
        fileSize: messagesTable.fileSize,
        accepted: messagesTable.accepted,
        createdAt: messagesTable.createdAt,
      });

    if (!updated) {
      res.status(404).json({ error: "Message not found" });
      return;
    }
    res.json({ message: updated });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/messages/:id/file", async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;
  try {
    const id = parseInt(req.params.id);
    const [msg] = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.id, id));

    if (!msg || !msg.hasFile || !msg.fileData) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    const buffer = Buffer.from(msg.fileData, "base64");
    res.setHeader("Content-Disposition", `attachment; filename="${msg.fileName || "download"}"`);
    res.setHeader("Content-Type", msg.fileType || "application/octet-stream");
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/guests", async (_req: Request, res: Response) => {
  try {
    const rows = await db
      .select({
        senderName: messagesTable.senderName,
        count: sql<number>`count(*)::int`,
        lastSeen: sql<Date>`max(${messagesTable.createdAt})`,
        id: sql<number>`min(${messagesTable.id})`,
      })
      .from(messagesTable)
      .where(sql`${messagesTable.senderName} is not null and ${messagesTable.senderName} != ''`)
      .groupBy(messagesTable.senderName)
      .orderBy(desc(sql`max(${messagesTable.createdAt})`));

    const guests = rows.map((r) => ({
      id: r.id,
      senderName: r.senderName!,
      messageCount: r.count,
      lastSeen: r.lastSeen,
    }));

    res.json({ guests });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/announcements", async (_req: Request, res: Response) => {
  try {
    const announcements = await db
      .select()
      .from(announcementsTable)
      .where(eq(announcementsTable.active, true))
      .orderBy(desc(announcementsTable.createdAt));
    res.json({ announcements });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/announcements", async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;
  try {
    const { content } = req.body;
    if (!content || content.trim() === "") {
      res.status(400).json({ error: "Content is required" });
      return;
    }
    const [announcement] = await db
      .insert(announcementsTable)
      .values({ content: content.trim(), active: true })
      .returning();
    res.status(201).json({ announcement });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bugs", async (req: Request, res: Response) => {
  try {
    const { description, reporterName } = req.body;
    if (!description || description.trim() === "") {
      res.status(400).json({ error: "Description is required" });
      return;
    }
    const [bug] = await db
      .insert(bugsTable)
      .values({
        description: description.trim(),
        reporterName: reporterName?.trim() || null,
      })
      .returning();
    res.status(201).json({ bug });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bugs", async (req: Request, res: Response) => {
  if (!checkAuth(req, res)) return;
  try {
    const bugs = await db
      .select()
      .from(bugsTable)
      .orderBy(desc(bugsTable.createdAt));
    res.json({ bugs });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
