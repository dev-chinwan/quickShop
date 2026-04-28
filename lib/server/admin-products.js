function asNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function asInteger(value) {
  const parsed = asNumber(value);
  if (parsed === undefined) return undefined;
  return Math.trunc(parsed);
}

function asBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function asStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return undefined;
}

function ensureStatus(value) {
  if (!value) return undefined;
  if (value === 'draft' || value === 'active') return value;
  return null;
}

export function toAdminProduct(product, categories = []) {
  const categoryId = product.category || '';
  const categoryName = categories.find((item) => item.id === categoryId)?.name || product.categoryName || categoryId;
  const stock = Number.isFinite(product.stock) ? product.stock : 0;

  return {
    id: product.id,
    name: product.name || '',
    slug: product.slug || '',
    description: product.description || '',
    brand: product.brand || '',
    categoryId,
    categoryName,
    price: Number(product.price || 0),
    compareAtPrice: Number(product.originalPrice || product.price || 0),
    currency: product.currency || 'USD',
    sku: product.sku || '',
    stock,
    inStock: product.inStock ?? stock > 0,
    unitLabel: product.unit || '',
    image: product.image || '',
    images: Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []),
    featured: Boolean(product.isFeatured),
    tags: Array.isArray(product.tags) ? product.tags : [],
    rating: Number(product.rating || 0),
    reviewCount: Number(product.reviews || 0),
    status: product.status || 'active',
    seo: product.seo || { title: '', description: '' },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function fromAdminPayload(payload, current = {}) {
  const errors = [];
  const result = {
    ...current,
  };

  if ('name' in payload) result.name = String(payload.name || '').trim();
  if ('slug' in payload) result.slug = String(payload.slug || '').trim().toLowerCase();
  if ('description' in payload) result.description = String(payload.description || '').trim();
  if ('brand' in payload) result.brand = String(payload.brand || '').trim() || 'QuickShop';
  if ('categoryId' in payload) result.category = String(payload.categoryId || '').trim();
  if ('categoryName' in payload) result.categoryName = String(payload.categoryName || '').trim();

  const price = asNumber(payload.price);
  if ('price' in payload) {
    if (price === undefined || price < 0) {
      errors.push('price must be a non-negative number');
    } else {
      result.price = price;
    }
  }

  const compareAtPrice = asNumber(payload.compareAtPrice);
  if ('compareAtPrice' in payload) {
    if (compareAtPrice === undefined || compareAtPrice < 0) {
      errors.push('compareAtPrice must be a non-negative number');
    } else {
      result.originalPrice = compareAtPrice;
    }
  }

  if ('currency' in payload) result.currency = String(payload.currency || 'USD').trim().toUpperCase();
  if ('sku' in payload) result.sku = String(payload.sku || '').trim();

  const stock = asInteger(payload.stock);
  if ('stock' in payload) {
    if (stock === undefined || stock < 0) {
      errors.push('stock must be an integer greater than or equal to 0');
    } else {
      result.stock = stock;
      if (!('inStock' in payload)) {
        result.inStock = stock > 0;
      }
    }
  }

  const inStock = asBoolean(payload.inStock);
  if ('inStock' in payload) {
    if (inStock === undefined) {
      errors.push('inStock must be a boolean');
    } else {
      result.inStock = inStock;
    }
  }

  if ('unitLabel' in payload) result.unit = String(payload.unitLabel || '').trim();
  if ('image' in payload) result.image = String(payload.image || '').trim();

  const images = asStringArray(payload.images);
  if ('images' in payload && images !== undefined) {
    result.images = images;
  }

  const featured = asBoolean(payload.featured);
  if ('featured' in payload) {
    if (featured === undefined) {
      errors.push('featured must be a boolean');
    } else {
      result.isFeatured = featured;
    }
  }

  const tags = asStringArray(payload.tags);
  if ('tags' in payload && tags !== undefined) {
    result.tags = tags;
  }

  const rating = asNumber(payload.rating);
  if ('rating' in payload && rating !== undefined) {
    result.rating = rating;
  }

  const reviewCount = asInteger(payload.reviewCount);
  if ('reviewCount' in payload && reviewCount !== undefined) {
    result.reviews = reviewCount;
  }

  const status = ensureStatus(payload.status);
  if ('status' in payload) {
    if (status === null) {
      errors.push('status must be either draft or active');
    } else {
      result.status = status;
    }
  }

  if ('seo' in payload) {
    result.seo = {
      title: String(payload.seo?.title || '').trim(),
      description: String(payload.seo?.description || '').trim(),
    };
  }

  if (!result.originalPrice && result.price !== undefined) {
    result.originalPrice = result.price;
  }

  const requiredCreateFields = ['name', 'slug', 'description', 'category', 'price', 'sku', 'unit', 'image'];
  requiredCreateFields.forEach((key) => {
    if (current.id === undefined && (result[key] === undefined || result[key] === '')) {
      errors.push(`${key} is required`);
    }
  });

  if (result.originalPrice !== undefined && result.price !== undefined && result.originalPrice < result.price) {
    errors.push('compareAtPrice must be greater than or equal to price');
  }

  return {
    success: errors.length === 0,
    errors,
    data: result,
  };
}

export function normalizeAdminFilters(searchParams) {
  return {
    search: searchParams.get('search') || undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    status: searchParams.get('status') || undefined,
    featured: searchParams.get('featured') || undefined,
    page: searchParams.get('page') || undefined,
    limit: searchParams.get('limit') || undefined,
    sort: searchParams.get('sort') || undefined,
  };
}
