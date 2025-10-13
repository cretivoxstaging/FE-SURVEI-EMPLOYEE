# Survey Status - Implementasi Server-Side

## Apa yang sudah dibuat?

Sistem status survey sekarang menggunakan **server-side storage** sehingga status yang diatur di satu device (laptop admin) akan langsung terlihat di semua device lain (HP, tablet, dll).

## File yang diubah:

### 1. **API Endpoint Baru** (`src/app/api/v1/survey-status/route.ts`)

- `GET /api/v1/survey-status` - Mendapatkan status survey saat ini
- `POST /api/v1/survey-status` - Mengubah status survey (active/inactive)

### 2. **Hook Updated** (`src/hooks/use-active-survey.tsx`)

- Sekarang menggunakan React Query untuk fetch data dari server
- Auto-refresh setiap 30 detik untuk memastikan status selalu update
- Refresh otomatis saat window mendapat focus
- Menampilkan toast notification saat status berubah

### 3. **Guard Component Updated** (`src/components/survey-status-guard.tsx`)

- Menggunakan hook `useActiveSurvey` untuk mendapatkan status dari server
- Tidak lagi menggunakan localStorage

### 4. **Dashboard Updated** (`src/app/(authenticated)/admin/dashboard/page.tsx`)

- Button menampilkan loading state saat update status
- Button disabled saat sedang proses update

## Cara Kerja:

1. **Admin mengubah status di laptop:**

   - Klik button "Activate/Deactivate Survey"
   - Status tersimpan di server via API
   - Notifikasi toast muncul
   - Semua device otomatis akan melihat perubahan

2. **User membuka survey di HP:**

   - Sistem mengecek status dari server
   - Jika inactive, muncul pesan "Oh... no! Survey is not accepting responses"
   - Jika active, user bisa mengisi survey
   - Status di-refresh otomatis setiap 30 detik

3. **Multi-device sync:**
   - Laptop admin mengubah status → tersimpan di server
   - HP user otomatis mendapat update (max 30 detik)
   - Tablet lain juga mendapat update yang sama
   - Tidak ada lagi masalah device-specific

## Fitur Tambahan:

- ✅ **Optimistic Updates**: UI langsung berubah, tidak perlu tunggu server response
- ✅ **Auto-refresh**: Status di-refresh otomatis setiap 30 detik
- ✅ **Focus Refresh**: Saat buka tab/window lagi, status langsung di-refresh
- ✅ **Toast Notifications**: User mendapat feedback jelas saat status berubah
- ✅ **Error Handling**: Jika server error, survey tetap bisa diakses (fail open)
- ✅ **Loading States**: Button menampilkan "Updating..." saat proses update

## Integrasi Backend:

API endpoint frontend `/api/v1/survey-status` sekarang sudah terintegrasi dengan backend API:

### Backend Endpoint:

- **GET** `/api/v1/surveystatus/1` - Mendapatkan status survey
- **PUT** `/api/v1/surveystatus/1` - Mengubah status survey

### Format Data Backend:

```json
{
  "status": "active" // atau "inactive"
}
```

### Format Data Frontend (Internal):

```json
{
  "isActive": true, // boolean
  "updatedAt": "2025-01-09T10:00:00.000Z"
}
```

### Konversi Format:

API route akan otomatis melakukan konversi antara format backend (`status: "active"/"inactive"`) dan format frontend (`isActive: boolean`):

- **Backend → Frontend**: `"active"` → `true`, `"inactive"` → `false`
- **Frontend → Backend**: `true` → `"active"`, `false` → `"inactive"`

### Fallback Mechanism:

- Jika endpoint backend tidak tersedia (404), sistem akan return default status (active)
- Error handling memastikan survey tetap bisa diakses jika ada masalah koneksi

## Testing:

1. Buka dashboard admin di laptop
2. Klik "Deactivate Survey"
3. Buka `/survey` di HP
4. Seharusnya muncul pesan "Oh... no!" dan survey tidak bisa diakses
5. Kembali ke laptop, klik "Activate Survey"
6. Refresh atau tunggu 30 detik di HP
7. Survey seharusnya bisa diakses lagi
