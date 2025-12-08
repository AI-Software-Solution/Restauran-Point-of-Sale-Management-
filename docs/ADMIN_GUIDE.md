# Administrator Qo'llanmasi

Bu qo'llanma tizim administratorlari uchun mo'ljallangan. Tizim sozlamalari, foydalanuvchilarni boshqarish va keng qamrovli sozlamalar haqida.

---

## Admin Paneliga Kirish

### Kirish Yo'li
1. Tizimga admin sifatida kiring
2. Chap menyuda **Admin Panel** ni bosing
3. Yoki to'g'ridan-to'g'ri: `/admin-pro`

### Admin Interfeysi
Admin panel quyidagi bo'limlardan iborat:
- Bosh sahifa (Dashboard)
- Foydalanuvchilar
- Mahsulotlar
- Kategoriyalar
- Qavatlar va Stollar
- Hisobotlar
- Sozlamalar

---

## Foydalanuvchilarni Boshqarish

### Yangi Foydalanuvchi Qo'shish

1. **Foydalanuvchilar** bo'limini oching
2. **+ Yangi** tugmasini bosing
3. Ma'lumotlarni kiriting:

| Maydon | Tavsif |
|--------|--------|
| Ism | To'liq ism-familiya |
| Email | Kirish uchun email |
| Parol | Kamida 8 belgi |
| Rol | Huquqlar darajasi |
| Telefon | Aloqa uchun |

4. **Saqlash** tugmasini bosing

### Rollar va Huquqlar

| Rol | Huquqlar |
|-----|----------|
| **Admin** | To'liq kirish, barcha sozlamalar |
| **Manager** | Hisobotlar, chegirmalar, bekor qilish |
| **Cashier** | Buyurtma olish, to'lov qabul qilish |
| **Waiter** | Faqat buyurtma olish |
| **Kitchen** | Oshxona displeysi |

### Foydalanuvchini Tahrirlash

1. Foydalanuvchini ro'yxatdan toping
2. **Tahrirlash** tugmasini bosing
3. Kerakli o'zgartirishlarni kiriting
4. **Saqlash**

### Foydalanuvchini O'chirish

1. Foydalanuvchini toping
2. **O'chirish** tugmasini bosing
3. Tasdiqlang

> ⚠️ O'chirilgan foydalanuvchi qayta tiklanmaydi!

---

## Mahsulotlarni Boshqarish

### Yangi Mahsulot Qo'shish

1. **Mahsulotlar** bo'limini oching
2. **+ Yangi** tugmasini bosing
3. Ma'lumotlarni kiriting:

| Maydon | Tavsif |
|--------|--------|
| Nomi | Mahsulot nomi |
| Kategoriya | Tegishli kategoriya |
| Narx | Sotuv narxi (so'm) |
| Tavsif | Qisqacha tavsif |
| Rasm | Mahsulot rasmi |

4. **Saqlash**

### Mahsulot Narxini O'zgartirish

1. Mahsulotni toping
2. **Tahrirlash**
3. Yangi narxni kiriting
4. **Saqlash**

### Mahsulotni Yashirish

Vaqtinchalik mavjud bo'lmagan mahsulotlar uchun:
1. Mahsulotni toping
2. **Faol** tugmasini o'chiring
3. Mahsulot menyuda ko'rinmaydi

### Modifierlar Yaratish

1. **Modifierlar** bo'limini oching
2. **Yangi guruh** yarating
3. Modifier elementlarini qo'shing:
   - Nomi
   - Qo'shimcha narx (agar bor bo'lsa)
   - Majburiy/Ixtiyoriy

---

## Kategoriyalarni Boshqarish

### Yangi Kategoriya

1. **Kategoriyalar** bo'limini oching
2. **+ Yangi** tugmasini bosing
3. Kiriting:
   - Nomi
   - Rasm
   - Tartib raqami
4. **Saqlash**

### Kategoriya Tartibini O'zgartirish

1. Kategoriyalarni drag-and-drop bilan suring
2. Avtomatik saqlanadi

---

## Qavatlar va Stollarni Boshqarish

### Yangi Qavat Yaratish

1. **Qavatlar** bo'limini oching
2. **+ Yangi qavat** tugmasini bosing
3. Kiriting:
   - Qavat nomi (masalan: "1-qavat", "Veranda")
4. **Saqlash**

### Stol Qo'shish

1. Kerakli qavatni oching
2. **+ Stol qo'shish** tugmasini bosing
3. Kiriting:
   - Stol raqami
   - O'rindiqlar soni
4. Stolni drag-and-drop bilan joylashtiring
5. **Saqlash**

### Stol Joylashuvini O'zgartirish

1. Qavatni tahrirlash rejimida oching
2. Stollarni suring
3. **Saqlash**

---

## Hisobotlar

### Kunlik Hisobot

1. **Hisobotlar** → **Kunlik**
2. Sanani tanlang
3. Ko'rsatkichlar:
   - Jami sotuv
   - Buyurtmalar soni
   - O'rtacha chek
   - To'lov usullari

### Haftalik/Oylik Hisobot

1. **Hisobotlar** → **Davr bo'yicha**
2. Boshlanish va tugash sanasini tanlang
3. **Hisobot olish**

### Eksport Qilish

1. Kerakli hisobotni oching
2. **Eksport** tugmasini bosing
3. Formatni tanlang:
   - PDF
   - Excel
   - CSV

### Mahsulotlar Hisoboti

1. **Hisobotlar** → **Mahsulotlar**
2. Ko'rsatkichlar:
   - Eng ko'p sotiladiganlar
   - Eng kam sotiladiganlar
   - Foyda tahlili

---

## Tizim Sozlamalari

### Restoran Ma'lumotlari

1. **Sozlamalar** → **Restoran**
2. O'zgartiring:
   - Nomi
   - Manzil
   - Telefon
   - Logo

### Chek Sozlamalari

1. **Sozlamalar** → **Chek**
2. O'zgartiring:
   - Chek boshi matni
   - Chek oxiri matni
   - QR kod ko'rsatish
   - Tip so'rash

### Soliq Sozlamalari

1. **Sozlamalar** → **Soliq**
2. O'zgartiring:
   - QQS foizi
   - Xizmat to'lovi
   - Chekda ko'rsatish

---

## Xavfsizlik

### Parollarni Boshqarish

**Foydalanuvchi parolini tiklash:**
1. Foydalanuvchini toping
2. **Parolni tiklash**
3. Yangi parol yuboriladi

**Majburiy parol o'zgartirish:**
1. **Sozlamalar** → **Xavfsizlik**
2. **Parol muddat** ni belgilang

### Kirish Tarixi

1. **Hisobotlar** → **Kirish tarixi**
2. Ko'rsatkichlar:
   - Kim kirdi
   - Qachon
   - Qayerdan (IP)

### Amallar Logi

1. **Hisobotlar** → **Amallar tarixi**
2. Barcha muhim amallar yozilgan:
   - Buyurtma bekor qilish
   - Chegirma berish
   - Narx o'zgartirish

---

## Zaxiralash va Tiklash

### Avtomatik Zaxiralash
- Har kuni avtomatik zaxiralanadi
- So'nggi 30 kunlik zaxiralar saqlanadi

### Qo'lda Zaxiralash
1. **Sozlamalar** → **Zaxiralash**
2. **Hozir zaxiralash** tugmasini bosing
3. Fayl yuklab olinadi

### Ma'lumotlarni Tiklash
> ⚠️ Faqat texnik yordam bilan!

Agar tiklash kerak bo'lsa, texnik yordamga murojaat qiling.

---

## Muammolarni Bartaraf Etish

### Tizim sekin ishlamoqda
1. Brauzer keshini tozalang
2. Boshqa brauzerda sinab ko'ring
3. Internet tezligini tekshiring

### Foydalanuvchi kira olmayapti
1. Email to'g'riligini tekshiring
2. Parolni tiklang
3. Rol faolligini tekshiring

### Hisobotlar to'g'ri emas
1. Sanalarni qayta tekshiring
2. Filtrlarni tozalang
3. Texnik yordamga murojaat qiling

---

## Texnik Yordam

Murakkab muammolar uchun:
- 📧 Email: admin@myrestauran.uz
- 📱 Telegram: @myrestauran_admin
- 📞 Texnik yordam: +998 XX XXX XX XX

---

*Administrator mas'uliyati katta - ehtiyotkor bo'ling!*
