export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PAYMENT_METHOD = {
  COD: 'COD',
  PAYOS: 'PAYOS',
};

export const DISCOUNT_TYPE = {
  FIXED: 'FIXED',
  PERCENT: 'PERCENT',
};

export const SHIPPING_THRESHOLD = 500000;
export const SHIPPING_FEE = 30000;
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 100;


export const SEASONS = {
  SPRING: 'spring',
  SUMMER: 'summer',
  AUTUMN: 'autumn',
  WINTER: 'winter',
  ALL_SEASON: 'all-season',
};

export const MATERIALS = {
  COTTON: 'cotton',
  POLYESTER: 'polyester',
  LINEN: 'linen',
  DENIM: 'denim',
  WOOL: 'wool',
  LEATHER: 'leather',
  SILK: 'silk',
  NYLON: 'nylon',
  SPANDEX: 'spandex',
  FLEECE: 'fleece',
  KAKI: 'kaki',
};

export const PRODUCT_TAGS = {
  BASIC: 'basic',
  CASUAL: 'casual',
  FORMAL: 'formal',
  STREETWEAR: 'streetwear',
  OVERSIZE: 'oversize',
  SLIM_FIT: 'slim-fit',
  REGULAR_FIT: 'regular-fit',
  SPORT: 'sport',
  OFFICE: 'office',
  PREMIUM: 'premium',
  MINIMALIST: 'minimalist',
  VINTAGE: 'vintage',
  BREATHABLE: 'breathable',
  STRETCH: 'stretch',
  LIGHTWEIGHT: 'lightweight',
};
export const SEASON_LABELS = {
  spring: 'Xuân',
  summer: 'Hè',
  autumn: 'Thu',
  winter: 'Đông',
  allSeason: 'Quanh năm',
};

export const MATERIAL_LABELS = {
  cotton: 'Cotton',
  polyester: 'Polyester',
  linen: 'Linen',
  denim: 'Denim',
  wool: 'Len',
  leather: 'Da',
  silk: 'Lụa',
  nylon: 'Nylon',
  spandex: 'Spandex',
  fleece: 'Nỉ',
  kaki: 'Kaki',
};

export const PRODUCT_TAG_LABELS = {
  basic: 'Cơ bản',
  casual: 'Thường ngày',
  formal: 'Trang trọng',
  streetwear: 'Streetwear',
  oversize: 'Oversize',
  sport: 'Thể thao',
  office: 'Công sở',
  premium: 'Cao cấp',
  minimalist: 'Tối giản',
  vintage: 'Vintage',
  breathable: 'Thoáng khí',
  stretch: 'Co giãn',
  lightweight: 'Nhẹ',
};
