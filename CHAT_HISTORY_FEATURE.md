# Chat History - LocalStorage Implementation

## 📝 Fitur Baru yang Ditambahkan:

Riwayat percakapan chat sekarang **tersimpan secara otomatis** di localStorage browser, sehingga:

- ✅ Chat history tidak hilang saat refresh page
- ✅ Chat history tetap ada saat browser ditutup dan dibuka kembali
- ✅ Maximum 100 messages tersimpan untuk menghemat storage
- ✅ Konfirmasi dialog saat clear history
- ✅ Counter jumlah messages di header

## 🔧 File yang Diubah:

### 1. **Hook Updated** (`src/hooks/use-chat-analyze.tsx`)

#### Fitur LocalStorage:

```typescript
const CHAT_HISTORY_KEY = "survey-chat-history";
const MAX_MESSAGES = 100; // Maximum messages to store

// Load messages saat initialization
const [messages, setMessages] = useState<ChatMessage[]>(() =>
  loadMessagesFromStorage()
);

// Auto-save setiap kali messages berubah
useEffect(() => {
  if (messages.length > 0) {
    saveMessagesToStorage(messages);
  }
}, [messages]);

// Clear juga menghapus dari localStorage
const clearMessages = () => {
  setMessages([]);
  localStorage.removeItem(CHAT_HISTORY_KEY);
};
```

#### Helper Functions:

- `loadMessagesFromStorage()` - Load chat history saat app start
- `saveMessagesToStorage(messages)` - Auto-save setiap ada perubahan
- Handle timestamp conversion (Date objects)
- Error handling untuk localStorage quota

### 2. **UI Component Updated** (`src/components/ui/survey-chat-interface.tsx`)

#### UI Improvements:

- **Message Counter**: Badge menampilkan jumlah messages di header

  ```tsx
  {
    messages.length;
  }
  messages;
  ```

- **Smart Trash Button**: Hanya muncul jika ada messages

  ```tsx
  {
    messages.length > 0 && (
      <Button onClick={() => setShowClearDialog(true)}>
        <Trash2 />
      </Button>
    );
  }
  ```

- **Confirmation Dialog**: Konfirmasi sebelum clear history
  - Icon warning merah
  - Pesan jelas tentang konsekuensi
  - Button Cancel & Clear History

## 🎯 Cara Kerja:

### 1. **Auto-Save**

```
User mengirim pesan → Messages state update → useEffect trigger
→ saveMessagesToStorage() → localStorage updated
```

### 2. **Auto-Load**

```
User buka chat → useState initialization → loadMessagesFromStorage()
→ Parse JSON → Convert timestamps → Set messages state
```

### 3. **Clear History**

```
User klik trash icon → Show confirmation dialog
→ User confirm → clearMessages() → messages = []
→ localStorage.removeItem() → Dialog close
```

## 💾 Data Structure di LocalStorage:

**Key:** `survey-chat-history`

**Value:** Array of ChatMessage objects

```json
[
  {
    "id": "1736234567890",
    "role": "user",
    "content": "Berapa completion rate survey?",
    "timestamp": "2025-01-09T10:30:00.000Z",
    "hasData": true,
    "isFallback": false
  },
  {
    "id": "1736234567891",
    "role": "assistant",
    "content": "Completion rate survey saat ini adalah 10%...",
    "timestamp": "2025-01-09T10:30:05.000Z",
    "hasData": true,
    "isFallback": false
  }
]
```

## 🔒 Limitasi & Keamanan:

### Storage Limits:

- **Max Messages**: 100 messages (configurable via `MAX_MESSAGES`)
- **Storage Method**: Automatically keeps only last 100 messages
- **Typical Size**: ~50-100 KB for 100 messages

### Error Handling:

```typescript
try {
  localStorage.setItem(key, value);
} catch (error) {
  // Handle quota exceeded
  // Handle access denied
  // Fail gracefully
}
```

### Privacy Notes:

- ⚠️ Data tersimpan di **browser lokal** (tidak di server)
- ⚠️ Data **tidak encrypted** di localStorage
- ⚠️ Data hilang jika user **clear browser data**
- ⚠️ Data **device-specific** (tidak sync antar device)

## 📱 User Experience:

### Saat Buka Chat:

1. Chat history otomatis ter-load
2. Scroll otomatis ke message terakhir
3. User bisa langsung lanjut percakapan

### Saat Refresh Page:

1. Chat history tetap ada
2. Tidak perlu start conversation dari awal
3. Context conversation terjaga

### Saat Clear History:

1. Konfirmasi dialog muncul
2. Warning message jelas
3. User bisa cancel
4. Jika confirm, history dihapus permanent

## 🎨 UI Features:

### Header Indicators:

```
📊 Survey Analytics    [5 messages]    🗑️  ✕
```

### Clear Dialog:

```
⚠️ Clear Chat History?

This will permanently delete all 5 messages from your chat history.
This action cannot be undone and your conversation will be lost.

[Cancel]  [Clear History]
```

### Smart Button Visibility:

- Trash button hanya muncul jika `messages.length > 0`
- Hover effect: `hover:bg-red-50` & `hover:text-red-600`

## 🧪 Testing:

### Test 1: Save & Load

1. Buka chat, kirim beberapa pesan
2. Refresh page
3. ✅ Chat history masih ada

### Test 2: Multiple Sessions

1. Kirim pesan, close chat
2. Buka chat lagi
3. ✅ History tetap tersimpan

### Test 3: Clear History

1. Klik trash icon
2. Konfirmasi dialog muncul
3. Klik "Clear History"
4. ✅ Chat kosong & localStorage cleared

### Test 4: Storage Limit

1. Kirim > 100 pesan
2. ✅ Hanya 100 pesan terakhir yang tersimpan

### Test 5: Error Handling

1. Block localStorage via browser settings
2. ✅ Chat masih berfungsi (without persistence)

## 🚀 Future Enhancements:

Possible improvements untuk future:

- [ ] Export chat history to file (.txt, .json)
- [ ] Search in chat history
- [ ] Pin important messages
- [ ] Sync across devices (requires backend)
- [ ] Encrypt localStorage data
- [ ] Chat history statistics
- [ ] Auto-delete old messages (> 30 days)
- [ ] Compress data untuk save storage

## 📊 Storage Usage Estimate:

| Messages | Approximate Size |
| -------- | ---------------- |
| 10       | ~5-10 KB         |
| 50       | ~25-50 KB        |
| 100      | ~50-100 KB       |

**Note:** Size varies based on message content length and complexity.
