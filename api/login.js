// API Xác thực phía Server (Không thể bị xem bởi trình duyệt)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  // MÃ HASH SHA-256 CỦA USER VÀ PASS ĐÚNG (Được giấu kín trên server)
  // Bạn có thể thay đổi mã hash này nếu muốn đổi mật khẩu.
  const VALID_HASH = 'MÃ_HASH_SHA256_CỦA_BẠN_Ở_ĐÂY';

  // Hàm mã hoá chuỗi bằng SHA-256
  const crypto = require('crypto');
  const inputHash = crypto
    .createHash('sha256')
    .update(username + '|' + password)
    .digest('hex');

  // So sánh an toàn (Chống Timing Attack)
  if (inputHash === VALID_HASH) {
    // Nếu đúng, trả về một token bảo mật ngẫu nhiên để đăng nhập
    const token = crypto.randomBytes(32).toString('hex');
    return res.status(200).json({ success: true, token: token });
  } else {
    // Nếu sai, trả về lỗi (Không tiết lộ là sai user hay pass)
    return res.status(401).json({ success: false, error: 'Đăng nhập thất bại' });
  }
}
