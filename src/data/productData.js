// Men
const menProducts = [
  { id: 1, name: 'Quần Flex Joggers', price: '₫1,590,000', image: 'https://images.unsplash.com/photo-1578102718171-ec1f91680562?w=400', color: 'Oxblood', danhMuc: 'Đồ thể thao nam', parent: 'Nam' },
  { id: 2, name: 'Áo Hoodie Oversized', price: '₫1,790,000', image: 'https://images.unsplash.com/photo-1556821840-3a63f956097a7?w=40000', color: 'Oxblood', danhMuc: 'Áo khoác nam', parent: 'Nam' },
  { id: 3, name: 'Quần Short Cycling', price: '₫890,000', image: 'https://images.unsplash.com/photo-1580519427538-e3e93bb701bc5?w=4000', color: 'Oxblood', danhMuc: 'Đồ thể thao nam', parent: 'Nam' },
  { id: 5, name: 'Áo Hoodie Workshop', price: '₫1,890,000', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', color: 'Đen/Đỏ', danhMuc: 'Áo khoác nam', parent: 'Nam' },
  { id: 6, name: 'Áo Hoodie Workshop', price: '₫1,890,000', image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400', color: 'Xám', danhMuc: 'Áo khoác nam', parent: 'Nam' },
  { id: 8, name: 'Áo Hoodie Workshop', price: '₫1,890,000', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', color: 'Đen/Đỏ', danhMuc: 'Áo khoác nam', parent: 'Nam' },
  { id: 9, name: 'Áo Thun Performance', price: '₫690,000', image: 'https://images.unsplash.com/photo-1600180758895-86c3b2e5b0e4?w=400', color: 'Xanh Navy', danhMuc: 'Áo thun nam', parent: 'Nam' },
  { id: 10, name: 'Quần Short Running', price: '₫850,000', image: 'https://images.unsplash.com/photo-1593032465170-1f50d4b4e0d3?w=400', color: 'Đen', danhMuc: 'Đồ thể thao nam', parent: 'Nam' }
];


// Women
const womenProducts = [
  { id: 4, name: 'Áo Ngực Thể Thao', price: '₫990,000', image: 'https://images.unsplash.com/photo-1579364046732-c21c2f736a251?w=4000', color: 'Oxblood', danhMuc: 'Áo sơ mi nữ', parent: 'Nữ' },
  { id: 7, name: 'Áo Hoodie Croptop Workshop', price: '₫1,590,000', image: 'https://images.unsplash.com/photo-1578102641831-f01c623c6b5c?w=400', color: 'Đỏ', danhMuc: 'Áo khoác nữ', parent: 'Nữ' },
  { id: 11, name: 'Áo Hoodie Croptop Workshop', price: '₫1,590,000', image: 'https://images.unsplash.com/photo-1578102641831-f01c623c6b5c?w=400', color: 'Đỏ', danhMuc: 'Áo khoác nữ', parent: 'Nữ' },
  { id: 12, name: 'Quần Legging Yoga', price: '₫1,290,000', image: 'https://images.unsplash.com/photo-1594737625785-8b3b5b42d3a5?w=400', color: 'Xám', danhMuc: 'Đồ ngủ nữ', parent: 'Nữ' },
  { id: 13, name: 'Áo Tank Top', price: '₫790,000', image: 'https://images.unsplash.com/photo-1612445207193-8ed1e4b4c6f3?w=400', color: 'Trắng', danhMuc: 'Áo sơ mi nữ', parent: 'Nữ' },
  { id: 15, name: 'Áo Hoodie Croptop Workshop', price: '₫1,590,000', image: 'https://images.unsplash.com/photo-1578102641831-f01c623c6b5c?w=400', color: 'Đỏ', danhMuc: 'Áo khoác nữ', parent: 'Nữ' }
];


// Accessories
const accessories = [
  { id: 17, name: 'Bình Nước', price: '₫390,000', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', color: 'Đỏ', danhMuc: 'Phụ kiện thời trang', parent: 'Phụ kiện' },
  { id: 18, name: 'Vớ Thể Thao', price: '₫290,000', image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400', color: 'Hồng', danhMuc: 'Phụ kiện thời trang', parent: 'Phụ kiện' },
  { id: 19, name: 'Mũ Lưỡi Trai', price: '₫490,000', image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', color: 'Đen', danhMuc: 'Mũ nón', parent: 'Phụ kiện' },
  { id: 20, name: 'Bình Lắc', price: '₫390,000', image: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=400', color: 'Đen', danhMuc: 'Phụ kiện thời trang', parent: 'Phụ kiện' },
  { id: 21, name: 'Túi Thể Thao', price: '₫1,290,000', image: 'https://images.unsplash.com/photo-1600180758895-3a2c4e5d6f1b?w=400', color: 'Đen', danhMuc: 'Phụ kiện thời trang', parent: 'Phụ kiện' },
  { id: 22, name: 'Băng Đô', price: '₫150,000', image: 'https://images.unsplash.com/photo-1600180758895-2b1d4e5c6a3f?w=400', color: 'Xanh', danhMuc: 'Phụ kiện thời trang', parent: 'Phụ kiện' }
];

export { menProducts, womenProducts, accessories };
