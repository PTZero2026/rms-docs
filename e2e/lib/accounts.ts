// Tài khoản & hằng số môi trường dùng thử (tenant thuyloi-tenant).
// OTP mặc định môi trường thử = 123456 (email code Keycloak passwordless).
export const OTP_CODE = process.env.RMS_OTP || '123456';

export type Role = 'admin' | 'giangvien' | 'user' | 'author' | 'staff';

export interface Account {
  role: Role;
  email: string;
  /** Tên hiển thị sau đăng nhập (để khẳng định đúng danh tính). */
  displayName: string;
  storageState: string;
}

export interface Brand {
  key: string;
  /** Tên hiển thị (footer/branding) để khẳng định đúng tenant. */
  name: string;
  /** URL gốc của tenant. */
  baseUrl: string;
  /** Realm Keycloak (để chẩn đoán). */
  realm: string;
  accounts: Record<string, Account>;
}

// --- Brand: Trường đại học Thủy Lợi (tenant dùng thử đầu tiên, bật E4) ---
export const ACCOUNTS: Record<'admin' | 'giangvien', Account> = {
  admin: {
    role: 'admin',
    email: 'tuanphamhong@gmail.com',
    displayName: 'Nguyễn Văn A',
    storageState: '.auth/admin.json',
  },
  giangvien: {
    role: 'giangvien',
    email: 'tuanph@vnpay.vn',
    displayName: 'Phạm', // họ đủ để nhận diện; tránh phụ thuộc dấu cách kép
    storageState: '.auth/giangvien.json',
  },
};

export const BRAND = 'Trường đại học Thủy Lợi';

// --- Brand: Trường Đại học Bách Khoa Hà Nội ---
// displayName để trống — cập nhật sau khi biết tên hiển thị thật. OTP dùng chung OTP_CODE.
export const ACCOUNTS_BKA: Record<'user' | 'author' | 'staff' | 'admin', Account> = {
  user: { role: 'user', email: 'bka.user@gmail.com', displayName: '', storageState: '.auth/bka-user.json' },
  author: { role: 'author', email: 'bka.author@gmail.com', displayName: '', storageState: '.auth/bka-author.json' },
  staff: { role: 'staff', email: 'bka.staff@gmail.com', displayName: '', storageState: '.auth/bka-staff.json' },
  admin: { role: 'admin', email: 'bka.admin@gmail.com', displayName: '', storageState: '.auth/bka-admin.json' },
};

export const BRAND_BKA = 'Trường Đại học Bách Khoa Hà Nội';

/** Đăng ký brand để chọn theo môi trường/tenant. */
export const BRANDS: Record<string, Brand> = {
  'thuy-loi': {
    key: 'thuy-loi',
    name: BRAND,
    baseUrl: 'https://tl-nckh.vnest.vn',
    realm: 'thuyloi-tenant',
    accounts: ACCOUNTS,
  },
  bka: {
    key: 'bka',
    name: BRAND_BKA,
    baseUrl: 'https://nckh.vnest.vn',
    realm: 'bka-uni',
    accounts: ACCOUNTS_BKA,
  },
};

export const DENIED_TEXT = 'Không đủ quyền truy cập';
