# Vireon Project

## Overview

Platform pesan anonim (NGL-style) berbasis web. Pengguna bisa kirim pesan anonim, opsional cantumkan nama, dan upload file/foto.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **File upload**: Multer (memory storage, base64 in DB)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── vireon/          # Frontend React app (Vireon Project)
│   └── api-server/      # Express API server
├── lib/
│   ├── api-spec/        # OpenAPI spec + Orval codegen config
│   ├── api-client-react/# Generated React Query hooks
│   ├── api-zod/         # Generated Zod schemas from OpenAPI
│   └── db/              # Drizzle ORM schema + DB connection
├── scripts/             # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

### Halaman Utama (/)
- Announcement bar animasi dari founder (10 detik per slide)
- Form kirim pesan anonim
- Nama opsional, pesan wajib, file/foto opsional (max 100MB)
- Tombol Kirim dengan suara kirim.mp3 dan konfeti

### Menu Tamu (/guests)
- Daftar pengirim yang mencantumkan nama
- Kartu dengan avatar, nama, jumlah pesan, terakhir aktif

### Dashboard (/dashboard)
- Login dengan kode rahasia (admin only)
- Tab Pesan: lihat semua pesan, accept, download file
- Tab Bug Reports: lihat laporan bug dari tamu
- Tab Pengumuman: buat & kelola announcement

## Database Schema
- `messages` - pesan anonim (termasuk file base64)
- `announcements` - pengumuman dari founder
- `bugs` - laporan bug dari pengguna

## Admin Password
Tersimpan di server (tidak ditampilkan di UI). Tanya pemilik untuk kodenya.

## GitHub
Repository: https://github.com/APISje/APISje
