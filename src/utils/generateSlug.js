export function generateSlug(text) {
  return text
    .toLowerCase()                  // chữ thường
    .normalize('NFD')               // tách dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/\s+/g, '-')           // đổi khoảng trắng thành "-"
    .replace(/[^\w-]+/g, '')        // bỏ ký tự đặc biệt
    .replace(/--+/g, '-')           // thay 2 dấu "-" liên tiếp
    .replace(/^-+|-+$/g, '');       // bỏ "-" đầu cuối
};




export const getCategoryId = (splat) => {
    if (!splat) return null;

    const segments = splat.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    const match = lastSegment.match(/-(\d+)$/);
    return match ? Number(match[1]) : null;
  };
