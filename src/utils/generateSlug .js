export function generateSlug  (text)  {
  return text
    .toLowerCase()                  // chữ thường
    .normalize('NFD')               // tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/\s+/g, '-')           // đổi khoảng trắng thành "-"
    .replace(/[^\w-]+/g, '')        // bỏ ký tự đặc biệt
    .replace(/--+/g, '-')           // thay 2 dấu "-" liên tiếp
    .replace(/^-+|-+$/g, '');       // bỏ "-" đầu cuối
};