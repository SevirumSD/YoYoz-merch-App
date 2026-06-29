import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Get all products
export const getProducts = async (filters = {}) => {
  let query = supabase.from('Products').select('*')

  let targetCategory = filters.category;
  let targetGender = filters.gender;
  let targetStyle = filters.style;

  // Handle compatibility with old string prefixes
  if (typeof filters.category === 'string') {
    if (filters.category.startsWith('category_')) {
      targetCategory = filters.category.replace('category_', '');
    } else if (filters.category.startsWith('gender_')) {
      targetGender = filters.category.replace('gender_', '');
      targetCategory = undefined;
    } else if (filters.category.startsWith('style_')) {
      targetStyle = filters.category.replace('style_', '');
      targetCategory = undefined;
    } else if (filters.category === 'all') {
      targetCategory = undefined;
    }
  }

  if (targetStyle && targetStyle !== 'all') {
    query = query.eq('style', targetStyle);
  }

  // Sort by database Category and Gender columns
  query = query.order('Category', { ascending: true }).order('Gender', { ascending: true })

  const { data, error } = await query

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  const dbProducts = (data || []).map(p => {
    const name = p['"BoogieMan Tee"'] || p['BoogieMan Tee'] || 'Boogie Merch Item';
    const isApparel = name.toLowerCase().includes('tee') || name.toLowerCase().includes('hoodie');
    return {
      id: String(p.id),
      name,
      price: Number(p.Price || 0),
      image_url: p.image_url,
      category: p.Category ? p.Category.toLowerCase() : (name.toLowerCase().includes('tee') || name.toLowerCase().includes('shirt') ? 't-shirts'
                : name.toLowerCase().includes('hoodie') ? 'hoodies'
                : name.toLowerCase().includes('hat') ? 'accessories'
                : name.toLowerCase().includes('sticker') ? 'stickers'
                : 'merch'),
      dbCategory: p.Category,
      dbGender: p.Gender,
      style: p.style,
      koozie: p.Koozie || p.Koosies,
      sizes: isApparel ? ["S", "M", "L", "XL", "XXL"] : [],
      colors: isApparel ? ["Black", "Red"] : [],
      is_new: p.id === 4 || p.id === 6,
      tour_exclusive: p.id === 5 || p.id === 7,
      stock: 25,
      description: `Official Boogie & The Yo-Yoz concert merch. Rock the gig in style with this high-quality ${name.toLowerCase()}.`
    };
  });

  const combined = [...dbProducts, ...MOCK_CUSTOM_PRODUCTS];

  // Apply filters on the combined dataset
  if (targetCategory && targetCategory !== 'all') {
    combined = combined.filter(p => p.dbCategory === targetCategory);
  }
  if (targetGender && targetGender !== 'all') {
    combined = combined.filter(p => p.dbGender === targetGender || p.dbGender === 'unisex');
  }
  if (targetStyle && targetStyle !== 'all') {
    if (targetStyle === 'normal') {
      combined = combined.filter(p => p.style === 'normal' || !p.style);
    } else {
      combined = combined.filter(p => p.style === targetStyle);
    }
  }

  return combined;
}

// Global mock product dataset
export const MOCK_CUSTOM_PRODUCTS = [
  {
    id: "mock-koozie-1",
    name: "Custom Concert Can Koozie",
    price: 10,
    image_url: "https://images.unsplash.com/photo-1597075095401-4475517fa2b6?w=500&q=80",
    category: "koozies",
    dbCategory: "Koozies",
    dbGender: "unisex",
    style: "custom",
    koozie: true,
    sizes: [],
    colors: ["Red", "Black", "White"],
    is_new: true,
    tour_exclusive: false,
    stock: 999,
    isCustom: true,
    description: "Customize your official Boogie & the Yo-Yoz Can Koozie with your name or custom text. Keeps your drink ice-cold at the gig!"
  },
  {
    id: "mock-steel-tumbler-1",
    name: "Custom Engraved Steel Tumbler (20oz)",
    price: 35,
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80",
    category: "steel tumblers",
    dbCategory: "Steel Tumblers",
    dbGender: "unisex",
    style: "custom",
    sizes: [],
    colors: ["Silver", "Midnight Black", "Flame Red"],
    is_new: true,
    tour_exclusive: true,
    stock: 999,
    isCustom: true,
    description: "Double-walled stainless steel tumbler engraved with the Boogie & the Yo-Yoz official insignia. Custom laser-etched text option."
  },
  {
    id: "mock-steel-tumbler-2",
    name: "Custom Matte Black Tumbler (20oz)",
    price: 38,
    image_url: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=500&q=80",
    category: "steel tumblers",
    dbCategory: "Steel Tumblers",
    dbGender: "unisex",
    style: "custom",
    sizes: [],
    colors: ["Matte Black", "Concert Red"],
    is_new: true,
    tour_exclusive: false,
    stock: 150,
    isCustom: true,
    description: "Premium double-wall vacuum insulated tumbler with high-contrast matte coating and laser-engraved band graphics."
  },
  {
    id: "mock-steel-tumbler-3",
    name: "Yo-Yoz Thermo Sports Bottle (18oz)",
    price: 30,
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80",
    category: "steel tumblers",
    dbCategory: "Steel Tumblers",
    dbGender: "unisex",
    style: "custom",
    sizes: [],
    colors: ["Brushed Steel", "Neon Red"],
    is_new: false,
    tour_exclusive: true,
    stock: 200,
    isCustom: true,
    description: "Concert-proof stainless steel bottle with leakproof lid, laser-etched with Yo-Yoz flame insignia."
  },
  {
    id: "mock-wine-tumbler-1",
    name: "Custom Insulated Wine Tumbler (12oz)",
    price: 28,
    image_url: "https://images.unsplash.com/photo-1575515321528-98e3b7b25203?w=500&q=80",
    category: "wine tumblers",
    dbCategory: "Wine Tumblers",
    dbGender: "unisex",
    style: "custom",
    sizes: [],
    colors: ["Rose Gold", "Concert Black", "Crimson Red"],
    is_new: false,
    tour_exclusive: true,
    stock: 999,
    isCustom: true,
    description: "Premium insulated wine tumbler, perfect for concerts, festivals, or tailgates. Personalize with your custom concert quote."
  },
  {
    id: "mock-hoodie-halfzip-1",
    name: "Boogie Half-Zip Tech Hoodie",
    price: 65,
    image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80",
    category: "hoodies",
    dbCategory: "Hoodies",
    dbGender: "men",
    style: "half-zip",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Red"],
    is_new: true,
    tour_exclusive: false,
    stock: 50,
    description: "Premium tech fleece half-zip hoodie with reflective logo print."
  },
  {
    id: "mock-hoodie-34zip-1",
    name: "Yo-Yoz Women's 3/4 Zip Pullover",
    price: 58,
    image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80",
    category: "hoodies",
    dbCategory: "Hoodies",
    dbGender: "women",
    style: "3/4-zip",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Red"],
    is_new: false,
    tour_exclusive: true,
    stock: 35,
    description: "Cozy 3/4 zip pullover hoodie with embroidered back design."
  },
  {
    id: "mock-accessory-tumbler-1",
    name: "Yo-Yoz Laser-Engraved Tumbler",
    price: 32,
    image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80",
    category: "accessories",
    dbCategory: "Accessories",
    dbGender: "unisex",
    style: "tumbler",
    sizes: [],
    colors: ["Silver", "Black", "Red"],
    is_new: false,
    tour_exclusive: true,
    stock: 120,
    description: "Stainless steel tumbler with double-wall insulation."
  },
  {
    id: "mock-accessory-cup-1",
    name: "Boogie Double Layer Cup",
    price: 18,
    image_url: "https://images.unsplash.com/photo-1575515321528-98e3b7b25203?w=500&q=80",
    category: "accessories",
    dbCategory: "Accessories",
    dbGender: "unisex",
    style: "cup",
    sizes: [],
    colors: ["Clear", "Red", "Blue"],
    is_new: true,
    tour_exclusive: false,
    stock: 80,
    description: "Acrylic double-layer cup with liquid glitter and concert design."
  },
  {
    id: "mock-accessory-wristband-1",
    name: "Custom LED Concert Wristband",
    price: 12,
    image_url: "https://images.unsplash.com/photo-1597075095401-4475517fa2b6?w=500&q=80",
    category: "accessories",
    dbCategory: "Accessories",
    dbGender: "unisex",
    style: "wristband",
    sizes: [],
    colors: ["Green", "Red", "Blue", "Pink"],
    is_new: true,
    tour_exclusive: true,
    stock: 999,
    isCustom: true,
    description: "Light-up concert wristband. Choose from Green, Red, Blue, or Pink neon LED flash colors. Sound-activated options available."
  }
];

// Get single product
export const getProduct = async (id) => {
  if (id && id.startsWith("mock-")) {
    return MOCK_CUSTOM_PRODUCTS.find(p => p.id === id) || null;
  }

  const { data, error } = await supabase
    .from('Products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching product:', error)
    return null
  }
  
  if (!data) return null;
  
  const name = data['"BoogieMan Tee"'] || data['BoogieMan Tee'] || 'Boogie Merch Item';
  const isApparel = name.toLowerCase().includes('tee') || name.toLowerCase().includes('hoodie');
  return {
    id: String(data.id),
    name,
    price: Number(data.Price || 0),
    image_url: data.image_url,
    category: data.Category ? data.Category.toLowerCase() : (name.toLowerCase().includes('tee') || name.toLowerCase().includes('shirt') ? 't-shirts'
              : name.toLowerCase().includes('hoodie') ? 'hoodies'
              : name.toLowerCase().includes('hat') ? 'accessories'
              : name.toLowerCase().includes('sticker') ? 'stickers'
              : 'merch'),
    dbCategory: data.Category,
    dbGender: data.Gender,
    style: data.style,
    koozie: data.Koozie || data.Koosies,
    sizes: isApparel ? ["S", "M", "L", "XL", "XXL"] : [],
    colors: isApparel ? ["Black", "Red"] : [],
    is_new: data.id === 4 || data.id === 6,
    tour_exclusive: data.id === 5 || data.id === 7,
    stock: 25,
    description: `Official Boogie & The Yo-Yoz concert merch. Rock the gig in style with this high-quality ${name.toLowerCase()}.`
  };
}

// Create order
export const createOrder = async (order) => {
  const { data, error } = await supabase
    .from('orders')
    .insert([order])
    .select()
    .single()
  
  if (error) console.error('Error creating order:', error)
  return data
}

// Create order items
export const createOrderItems = async (items) => {
  const { data, error } = await supabase
    .from('order_items')
    .insert(items)
  
  if (error) console.error('Error creating order items:', error)
  return data
}

// Get order by Stripe Payment Intent ID
export const getOrderByPaymentIntent = async (paymentIntentId) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()
  
  if (error) console.error('Error fetching order:', error)
  return data
}

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date() })
    .eq('id', orderId)
    .select()
    .single()
  
  if (error) console.error('Error updating order:', error)
  return data
}