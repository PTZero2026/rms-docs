// Tài khoản & hằng số môi trường dùng thử (tenant thuyloi-tenant).
// OTP mặc định môi trường thử = 123456 (email code Keycloak passwordless).
export const OTP_CODE = process.env.RMS_OTP || '123456';

export type Role = 'admin' | 'giangvien';

export interface Account {
  role: Role;
  email: string;
  /** Tên hiển thị sau đăng nhập (để khẳng định đúng danh tính). */
  displayName: string;
  storageState: string;
}

export const ACCOUNTS: Record<Role, Account> = {
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
export const DENIED_TEXT = 'Không đủ quyền truy cập';
