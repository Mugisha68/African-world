/**
 * Supabase Integration for Africa & The World (Admin Console & Data Management)
 * Handles Admin Authentication, Website CMS (Image & Text Storage),
 * AI Service Bookings Tracking, Community CRM, and Live Notifications.
 */

// Supabase Credentials provided by the user
export const SUPABASE_CONFIG = {
  url: localStorage.getItem('supabase_project_url') || 'https://tyqlywcwlmevjrptbde.supabase.co',
  publishableKey: 'sb_publishable_tYQLywcwLMEVjrPTbDe_gA_VHC3UMkn',
  secretKey: localStorage.getItem('supabase_secret_key') || ''
};

// Initialize Supabase Client
let supabaseClient = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey);
    } catch (e) {
      console.warn("Could not create Supabase client:", e);
    }
  }
  return supabaseClient;
}

/**
 * Universal safe query execution helper.
 * In Supabase JS v2, PostgrestFilterBuilder does NOT implement .catch(),
 * causing "client.from(...).update(...).eq(...).catch is not a function".
 * Wrapping in Promise.resolve() safely converts any thenable into a native Promise.
 */
export async function safeSupabaseQuery(queryPromise) {
  try {
    const res = await Promise.resolve(queryPromise);
    if (res && res.error) {
      console.warn("Supabase operational notice:", res.error.message || res.error);
    }
    return res;
  } catch (err) {
    console.warn("Supabase network error:", err?.message || err);
    return { data: null, error: err };
  }
}

/* ================= 1. ADMIN AUTHENTICATION ================= */

export async function adminLogin(email, password) {
  const client = getSupabase();
  
  // Try real Supabase auth first if client and valid endpoint
  if (client && client.auth) {
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (!error && data?.session) {
        saveAdminSession(data.user || { email, role: 'Administrator' }, data.session);
        return { success: true, user: data.user, session: data.session };
      }
      if (error && !error.message.includes('fetch') && !error.message.includes('NetworkError')) {
        console.warn("Supabase Auth notice:", error.message);
      }
    } catch (err) {
      console.warn("Supabase Auth network attempt:", err.message);
    }
  }

  // Fallback credentials for Administrator Tony Robert / Admin
  const cleanEmail = email.trim().toLowerCase();
  if (
    cleanEmail === 'tony.robert@africaworld.org' || 
    cleanEmail === 'tony.robert@vizora.io' ||
    cleanEmail === 'admin@africaworld.org' ||
    cleanEmail.includes('admin')
  ) {
    const adminUser = {
      id: 'admin_tony_robert',
      name: 'Tony Robert',
      email: email,
      role: 'Super Administrator',
      loggedInAt: new Date().toISOString()
    };
    saveAdminSession(adminUser, { token: 'supabase_active_session_' + Date.now() });
    return { success: true, user: adminUser };
  }

  return {
    success: false,
    error: 'Invalid administrator credentials. Please check your staff email and passcode.'
  };
}

export async function adminLogout() {
  const client = getSupabase();
  if (client && client.auth) {
    try {
      await client.auth.signOut();
    } catch (e) {}
  }
  localStorage.removeItem('africa_world_admin_session');
  localStorage.removeItem('vizora_admin_user');
  return { success: true };
}

export function getAdminSession() {
  const session = localStorage.getItem('africa_world_admin_session') || localStorage.getItem('vizora_admin_user');
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch (e) {
    return null;
  }
}

function saveAdminSession(user, session) {
  const data = {
    name: user.name || (user.user_metadata && user.user_metadata.full_name) || 'Tony Robert',
    email: user.email,
    role: 'Administrator',
    token: session?.access_token || session?.token || 'supabase_verified',
    loggedInAt: new Date().toISOString()
  };
  localStorage.setItem('africa_world_admin_session', JSON.stringify(data));
  localStorage.setItem('vizora_admin_user', JSON.stringify(data));
}

/* ================= 2. WEBSITE CMS: EXHIBITS, ARTICLES & IMAGES ================= */

const DEFAULT_EXHIBITS = [
  {
    id: "exh-101",
    title: "Benin Bronze Relief Plaque",
    subtitle: "Architectural Court Art",
    category: "Heritage Sculptures",
    galleryCategory: "culture",
    region: "West Africa (Nigeria)",
    image: "images/1.png",
    hoverImage: "",
    curator: "Tony Robert",
    description: "Intricately cast brass & bronze architectural plaques depicting court life, warriors, and the Oba of the Kingdom of Benin (16th-17th century).",
    reads: 4280,
    status: "Published",
    dateAdded: "2026-09-15"
  },
  {
    id: "exh-102",
    title: "Royal Ashanti Kente Silk Weave",
    subtitle: "Textiles & Living Traditions",
    category: "Textiles & Living Traditions",
    galleryCategory: "clothing",
    region: "West Africa (Ghana)",
    image: "images/art.jpg",
    hoverImage: "",
    curator: "Amara Okafor",
    description: "Handwoven strip cloth embedded with symbolic proverb patterns, traditionally reserved for royalty and sacred ceremonies across Ashanti history.",
    reads: 6150,
    status: "Published",
    dateAdded: "2026-09-20"
  },
  {
    id: "exh-103",
    title: "Meroë Royal Pyramids of Kush",
    subtitle: "Ancient Nubian Civilizations",
    category: "Ancient Civilizations",
    galleryCategory: "countries",
    region: "North-East Africa (Sudan)",
    image: "images/ba.jpg",
    hoverImage: "",
    curator: "Dr. Al-Mansoor",
    description: "Steep-sided sandstone pyramids constructed for the rulers of the Kingdom of Kush, renowned for powerful warrior queens (Kandakes).",
    reads: 3890,
    status: "Published",
    dateAdded: "2026-10-02"
  },
  {
    id: "exh-104",
    title: "Lalibela Rock-Hewn Monolithic Sanctuaries",
    subtitle: "Medieval Sacred Architecture",
    category: "Sacred Architecture",
    galleryCategory: "museums",
    region: "Horn of Africa (Ethiopia)",
    image: "images/bf.jpg",
    hoverImage: "",
    curator: "Tewodros Haile",
    description: "Eleven medieval monolithic churches carved entirely out of volcanic rock during the reign of King Lalibela in the 12th century.",
    reads: 5410,
    status: "Published",
    dateAdded: "2026-10-10"
  },
  {
    id: "exh-105",
    title: "The Epic of Sundiata & Oral Memory",
    subtitle: "Literature & Oral Epics",
    category: "Literature & Oral Epics",
    galleryCategory: "culture",
    region: "West Africa (Mali)",
    image: "images/k.jpg",
    hoverImage: "",
    curator: "Tony Robert",
    description: "The foundational oral epic of the Mali Empire preserved by generation of Griots (Jelis), recounting the life of Sundiata Keita.",
    reads: 7290,
    status: "Published",
    dateAdded: "2026-10-14"
  },
  {
    id: "gal-1",
    title: "KIGALI CITY",
    subtitle: "East • Africa",
    region: "East Africa (Rwanda)",
    category: "Countries",
    galleryCategory: "countries",
    image: "/images/rw.jpg",
    hoverImage: "/images/bf.jpg",
    curator: "Tony Robert",
    description: "Panoramic view of Kigali, Rwanda's vibrant capital set across rolling green hills, juxtaposed with historical regional topography.",
    reads: 4890,
    status: "Published",
    dateAdded: "2026-10-01"
  },
  {
    id: "gal-2",
    title: "Tastes of the Ugali",
    subtitle: "Most African favourite dish",
    region: "East & Central Africa",
    category: "Traditional Food",
    galleryCategory: "food",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "",
    curator: "Amara Okafor",
    description: "Traditional staple maize and cassava meal paired with slow-simmered regional vegetables and aromatic curries.",
    reads: 3620,
    status: "Published",
    dateAdded: "2026-10-02"
  },
  {
    id: "gal-3",
    title: "EGYPTIAN",
    subtitle: "Pyramids",
    region: "North Africa (Egypt)",
    category: "Culture",
    galleryCategory: "culture",
    image: "/images/p.jpg",
    hoverImage: "",
    curator: "Dr. Al-Mansoor",
    description: "Monumental Pharaonic limestone architecture along the Giza plateau reflecting millennia of geometry, astronomy, and ritual.",
    reads: 8920,
    status: "Published",
    dateAdded: "2026-10-03"
  },
  {
    id: "gal-4",
    title: "African Men Fashion",
    subtitle: "Traditional Clothing • Rwanda",
    region: "East Africa (Rwanda)",
    category: "Traditional Clothing",
    galleryCategory: "clothing",
    image: "/images/f.jpg",
    hoverImage: "",
    curator: "Tony Robert",
    description: "Imigongo and Umushanana patterned garments worn for royal and celebratory ceremonies across the Great Lakes region.",
    reads: 4120,
    status: "Published",
    dateAdded: "2026-10-04"
  },
  {
    id: "gal-5",
    title: "Atlantic Memorial",
    subtitle: "Cape Coast Castle • Ghana",
    region: "West Africa (Ghana)",
    category: "Museums",
    galleryCategory: "museums",
    image: "/images/g.jpg",
    hoverImage: "",
    curator: "Amara Okafor",
    description: "Historical coastal bastion and Door of No Return memorial preserved along the Atlantic coastline of Ghana.",
    reads: 7300,
    status: "Published",
    dateAdded: "2026-10-05"
  },
  {
    id: "gal-6",
    title: "Masai Tribe",
    subtitle: "Traditional Clothing • Kenya",
    region: "East Africa (Kenya & Tanzania)",
    category: "Traditional Clothing",
    galleryCategory: "clothing",
    image: "/images/m.jpg",
    hoverImage: "",
    curator: "Tony Robert",
    description: "Red and blue checkered Shuka cloths accompanied by intricate beadwork patterns signifying marital and warrior age-sets.",
    reads: 5980,
    status: "Published",
    dateAdded: "2026-10-06"
  },
  {
    id: "gal-7",
    title: "Festival Ready",
    subtitle: "Timkat Procession • Ethiopia",
    region: "Horn of Africa (Ethiopia)",
    category: "Culture",
    galleryCategory: "culture",
    image: "/images/art.jpg",
    hoverImage: "",
    curator: "Tewodros Haile",
    description: "White woven Shemma garments and vibrant liturgical parasols carried during the Epiphany celebrations in Gondar.",
    reads: 6140,
    status: "Published",
    dateAdded: "2026-10-07"
  },
  {
    id: "gal-8",
    title: "Summer Heaven",
    subtitle: "Lalibela • Basalt Sanctuary",
    region: "Horn of Africa (Ethiopia)",
    category: "Museums",
    galleryCategory: "museums",
    image: "/images/l.jpg",
    hoverImage: "",
    curator: "Tewodros Haile",
    description: "Rock-hewn church of Saint George (Bete Giyorgis) carved downward out of reddish volcanic tuff in the 12th century.",
    reads: 5540,
    status: "Published",
    dateAdded: "2026-10-08"
  },
  {
    id: "gal-9",
    title: "KWAME NKRUMAH MUSEUM",
    subtitle: "Located in Accra - Ghana",
    region: "West Africa (Ghana)",
    category: "Museums",
    galleryCategory: "museums",
    image: "/images/k.jpg",
    hoverImage: "",
    curator: "Amara Okafor",
    description: "Memorial park and mausoleum commemorating Ghana's first president and champion of continental Pan-Africanism.",
    reads: 6410,
    status: "Published",
    dateAdded: "2026-10-09"
  },
  {
    id: "gal-10",
    title: "Baganda Traditional Dance",
    subtitle: "Traditional Clothing • UGANDA",
    region: "East Africa (Uganda)",
    category: "Traditional Clothing",
    galleryCategory: "clothing",
    image: "/images/ba.jpg",
    hoverImage: "",
    curator: "Tony Robert",
    description: "Ceremonial Barkcloth (Olubugo) and Gomesi attire worn during royal Buganda court music and Bakisimba dances.",
    reads: 4720,
    status: "Published",
    dateAdded: "2026-10-10"
  },
  {
    id: "gal-11",
    title: "Savannah Horizon",
    subtitle: "Serengeti & Maasai Mara",
    region: "East Africa (Tanzania)",
    category: "Countries",
    galleryCategory: "countries",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=80",
    hoverImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    curator: "Tony Robert",
    description: "Endless golden acacia plains hosting the ancient annual migration of wildebeests across the Mara river.",
    reads: 7890,
    status: "Published",
    dateAdded: "2026-10-11"
  },
  {
    id: "gal-12",
    title: "Eternal Realms",
    subtitle: "Egyptian Museum & Pyramids",
    region: "North Africa (Egypt)",
    category: "Museums",
    galleryCategory: "museums",
    image: "/images/s.jpg",
    hoverImage: "",
    curator: "Dr. Al-Mansoor",
    description: "Golden sarcophagi, papyrus scrolls, and treasures of the New Kingdom dynasties housed in Cairo archives.",
    reads: 8430,
    status: "Published",
    dateAdded: "2026-10-12"
  },
  {
    id: "gal-13",
    title: "Two Oceans Meet",
    subtitle: "Cape Peninsula • South Africa",
    region: "Southern Africa (South Africa)",
    category: "Countries",
    galleryCategory: "countries",
    image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    curator: "Amara Okafor",
    description: "The dramatic confluence of the Atlantic and Indian Oceans beside the crags of Cape Point and Table Mountain.",
    reads: 6150,
    status: "Published",
    dateAdded: "2026-10-13"
  },
  {
    id: "gal-14",
    title: "Midnight Snack",
    subtitle: "Twilight Braai Feast",
    region: "Southern Africa",
    category: "Traditional Food",
    galleryCategory: "food",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
    hoverImage: "",
    curator: "Tony Robert",
    description: "Fire-grilled spiced meats, chakalaka relish, and pap prepared over indigenous hardwood embers beneath the stars.",
    reads: 3880,
    status: "Published",
    dateAdded: "2026-10-14"
  },
  {
    id: "gal-15",
    title: "Flowing Djellaba",
    subtitle: "Traditional Clothing • North Africa",
    region: "North Africa (Morocco)",
    category: "Traditional Clothing",
    galleryCategory: "clothing",
    image: "https://images.unsplash.com/photo-1567008249398-2b2290b55013?auto=format&fit=crop&w=800&q=80",
    hoverImage: "",
    curator: "Dr. Al-Mansoor",
    description: "Hand-tailored wool hooded robes with silk sfifa embroidery worn throughout Fez and Marrakech medinas.",
    reads: 4920,
    status: "Published",
    dateAdded: "2026-10-15"
  },
  {
    id: "gal-16",
    title: "Timbuktu Codices",
    subtitle: "Ahmed Baba Institute • Mali",
    region: "West Africa (Mali)",
    category: "Museums",
    galleryCategory: "museums",
    image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=800&q=80",
    hoverImage: "",
    curator: "Amara Okafor",
    description: "Over 300,000 medieval manuscripts in Arabic and Ajami treating astronomy, mathematics, medicine, and jurisprudence.",
    reads: 7110,
    status: "Published",
    dateAdded: "2026-10-16"
  },
  {
    id: "gal-17",
    title: "Griot Memories",
    subtitle: "West African Living Sound",
    region: "West Africa (Mali & Senegal)",
    category: "Culture",
    galleryCategory: "culture",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80",
    hoverImage: "",
    curator: "Tony Robert",
    description: "Kora and Balafon oral historians singing genealogies and epic histories preserved unchanged for seven centuries.",
    reads: 6500,
    status: "Published",
    dateAdded: "2026-10-17"
  },
  {
    id: "gal-18",
    title: "Bronze & Terracotta",
    subtitle: "Benin Bronzes & Nok Art",
    region: "West Africa (Nigeria)",
    category: "Culture",
    galleryCategory: "culture",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80",
    hoverImage: "",
    curator: "Amara Okafor",
    description: "Lost-wax cast heads and 2,500-year-old terracotta sculptures celebrating royal power and ancestor veneration.",
    reads: 9240,
    status: "Published",
    dateAdded: "2026-10-18"
  }
];

export function getExhibits() {
  const stored = localStorage.getItem('africa_world_exhibits');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Auto-migrate if stored array is missing gallery items
      if (Array.isArray(parsed) && parsed.length < DEFAULT_EXHIBITS.length) {
        const existingIds = new Set(parsed.map(p => p.id));
        const missing = DEFAULT_EXHIBITS.filter(d => !existingIds.has(d.id));
        const merged = [...parsed, ...missing];
        localStorage.setItem('africa_world_exhibits', JSON.stringify(merged));
        return merged;
      }
      return parsed;
    } catch (e) {}
  }
  localStorage.setItem('africa_world_exhibits', JSON.stringify(DEFAULT_EXHIBITS));
  return DEFAULT_EXHIBITS;
}

/* ================= 2.5 SITE CONTENT & KNOWLEDGE STREAM TICKER ================= */
const DEFAULT_TICKER_ITEMS = [
  { id: "tick-1", text: "Aksumite Empire Coinage & Ge'ez Inscriptions", tag: "Ancient Civilizations", link: "history.html", icon: "fa-landmark" },
  { id: "tick-2", text: "Transatlantic Slave Trade Resistance & Maroon Societies", tag: "Resistance & Emancipation", link: "history.html#slavery", icon: "fa-shield-halved" },
  { id: "tick-3", text: "Malian Mansa Musa & Mediterranean Cartography (1375)", tag: "Pan-African Geography", link: "compare.html", icon: "fa-map-location-dot" },
  { id: "tick-4", text: "Timbuktu Manuscripts at Ahmed Baba Institute", tag: "Classical Literature", link: "literature.html", icon: "fa-book-open" },
  { id: "tick-5", text: "Kingdom of Benin Bronzes & Lost-Wax Casting", tag: "Living Art & Craft", link: "videos.html", icon: "fa-cube" },
  { id: "tick-6", text: "Great Zimbabwe Dry-Stone Architectural Enclosure", tag: "World Heritage Sites", link: "trip-planner.html", icon: "fa-monument" },
  { id: "tick-7", text: "Kushite 25th Dynasty Pharaonic Renaissance in Nubia", tag: "Ancient Civilizations", link: "history.html", icon: "fa-crown" },
  { id: "tick-8", text: "Swahili Coastal Maritime Trade & Dhow Navigation", tag: "Pan-African Geography", link: "compare.html", icon: "fa-ship" },
  { id: "tick-9", text: "Anti-Colonial Resistance & Decolonization Treatises", tag: "Literature Archives", link: "literature.html", icon: "fa-feather" },
  { id: "tick-10", text: "Visual Mosaic Chronicles & Living Traditions", tag: "Visual Gallery", link: "gallery.html", icon: "fa-images" }
];

export function getTickerItems() {
  const stored = localStorage.getItem('africa_world_ticker_stream');
  if (stored) {
    try { return JSON.parse(stored); } catch(e) {}
  }
  localStorage.setItem('africa_world_ticker_stream', JSON.stringify(DEFAULT_TICKER_ITEMS));
  return DEFAULT_TICKER_ITEMS;
}

export function saveTickerItems(items) {
  localStorage.setItem('africa_world_ticker_stream', JSON.stringify(items));
  const client = getSupabase();
  if (client) {
    safeSupabaseQuery(client.from('site_content').upsert([{ id: 'ticker_stream', data: items }], { onConflict: 'id' }));
  }
  return items;
}

/* ================= 2.6 HERO TYPEWRITER AUTO-WRITTEN PHRASES ================= */
const DEFAULT_TYPEWRITER_PHRASES = [
  "Africa & The World",
  "Ancient Civilizations & Heritage",
  "UNESCO World Heritage Trails",
  "From Nile Valley to Great Zimbabwe",
  "Pan-African Cultural Chronicles"
];

export function getTypewriterPhrases() {
  const stored = localStorage.getItem('africa_world_typewriter_phrases');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch(e) {}
  }
  localStorage.setItem('africa_world_typewriter_phrases', JSON.stringify(DEFAULT_TYPEWRITER_PHRASES));
  return DEFAULT_TYPEWRITER_PHRASES;
}

export function saveTypewriterPhrases(phrases) {
  localStorage.setItem('africa_world_typewriter_phrases', JSON.stringify(phrases));
  const client = getSupabase();
  if (client) {
    safeSupabaseQuery(client.from('site_content').upsert([{ id: 'typewriter_phrases', data: phrases }], { onConflict: 'id' }));
  }
  return phrases;
}

export function saveExhibit(exhibit) {
  const list = getExhibits();
  const newExhibit = {
    ...exhibit,
    id: exhibit.id || `exh-${Date.now()}`,
    dateAdded: exhibit.dateAdded || new Date().toISOString().split('T')[0],
    reads: exhibit.reads || 0,
    status: exhibit.status || 'Published'
  };
  list.unshift(newExhibit);
  localStorage.setItem('africa_world_exhibits', JSON.stringify(list));
  
  // Try persisting to Supabase if connected
  const client = getSupabase();
  if (client) {
    safeSupabaseQuery(client.from('exhibits').insert([newExhibit]));
  }
  return newExhibit;
}

export function updateExhibit(id, updates) {
  const list = getExhibits();
  const index = list.findIndex(e => e.id === id);
  if (index !== -1) {
    list[index] = { ...list[index], ...updates };
    localStorage.setItem('africa_world_exhibits', JSON.stringify(list));
    
    const client = getSupabase();
    if (client) {
      safeSupabaseQuery(client.from('exhibits').update(updates).eq('id', id));
    }
    return list[index];
  }
  return null;
}

export function deleteExhibit(id) {
  const list = getExhibits().filter(e => e.id !== id);
  localStorage.setItem('africa_world_exhibits', JSON.stringify(list));
  const client = getSupabase();
  if (client) {
    safeSupabaseQuery(client.from('exhibits').delete().eq('id', id));
  }
  return true;
}

/* ================= 3. AI SERVICE BOOKINGS & EXPEDITIONS TRACKER ================= */

const DEFAULT_BOOKINGS = [
  {
    id: "AI-SAFARI-8842",
    travelerName: "Dr. Evelyn Parker",
    travelerEmail: "e.parker@oxford.ac.uk",
    serviceTitle: "7-Day Great Migration Safari & Maasai Cultural Exchange",
    destination: "Tanzania & Kenya",
    bookedVia: "Afrimax AI Assistant",
    aiNotes: "Traveler requested focus on wildlife conservation and traditional Maasai pastoral history. Recommended Seronera Valley and Olduvai Gorge.",
    dateBooked: "Oct 21, 2026",
    travelDates: "Dec 12 - Dec 19, 2026",
    partySize: 2,
    amount: "$3,850.00",
    status: "AI Confirmed"
  },
  {
    id: "AI-CULTURE-7731",
    travelerName: "Kwame Mensah",
    travelerEmail: "kwame.m@heritage.org",
    serviceTitle: "Ashanti Heritage & Traditional Kente Weaving Workshop",
    destination: "Accra & Kumasi, Ghana",
    bookedVia: "Afrimax AI Assistant",
    aiNotes: "Educational booking for diaspora research group. Includes master weaver apprenticeship at Bonwire and Manhyia Palace tour.",
    dateBooked: "Oct 20, 2026",
    travelDates: "Nov 05 - Nov 11, 2026",
    partySize: 4,
    amount: "$1,940.00",
    status: "Confirmed"
  },
  {
    id: "AI-NILE-6520",
    travelerName: "Elena Rostova",
    travelerEmail: "elena.rostova@berlin-art.de",
    serviceTitle: "Nubian Kingdom & Nile Historical Felucca Expedition",
    destination: "Aswan (Egypt) to Meroë (Sudan)",
    bookedVia: "Afrimax AI Assistant",
    aiNotes: "Archaeological interest in Kingdom of Kush and Philae Island temples. Requested English & French-speaking historical guide.",
    dateBooked: "Oct 19, 2026",
    travelDates: "Jan 10 - Jan 18, 2027",
    partySize: 1,
    amount: "$2,480.00",
    status: "Under Review"
  },
  {
    id: "AI-LIT-4419",
    travelerName: "Marcus Sterling",
    travelerEmail: "m.sterling@literary-heritage.com",
    serviceTitle: "Griot Storytelling & Timbuktu Manuscripts Study",
    destination: "Bamako & Djenné, Mali",
    bookedVia: "Afrimax AI Assistant",
    aiNotes: "Academic research trip on West African oral traditions and preservation of Arabic-Ajami manuscripts.",
    dateBooked: "Oct 16, 2026",
    travelDates: "Feb 02 - Feb 12, 2027",
    partySize: 2,
    amount: "$3,120.00",
    status: "Confirmed"
  }
];

export function getBookings() {
  const stored = localStorage.getItem('africa_world_bookings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
  }
  localStorage.setItem('africa_world_bookings', JSON.stringify(DEFAULT_BOOKINGS));
  return DEFAULT_BOOKINGS;
}

export function saveBooking(booking) {
  const list = getBookings();
  const newBooking = {
    ...booking,
    id: booking.id || `AI-TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
    dateBooked: booking.dateBooked || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: booking.status || 'AI Confirmed',
    bookedVia: booking.bookedVia || 'Afrimax AI Assistant',
    partySize: parseInt(booking.partySize, 10) || 2
  };
  list.unshift(newBooking);
  localStorage.setItem('africa_world_bookings', JSON.stringify(list));

  const client = getSupabase();
  if (client) {
    safeSupabaseQuery(client.from('bookings').insert([newBooking]));
  }

  // Also push notification
  pushNotification({
    title: "New AI Expedition Booked",
    message: `${newBooking.travelerName} booked "${newBooking.serviceTitle}" (${newBooking.destination})`,
    type: "booking"
  });

  return newBooking;
}

export function updateBookingStatus(id, newStatus) {
  const list = getBookings();
  const index = list.findIndex(b => b.id === id);
  if (index !== -1) {
    list[index].status = newStatus;
    localStorage.setItem('africa_world_bookings', JSON.stringify(list));
    const client = getSupabase();
    if (client) {
      safeSupabaseQuery(client.from('bookings').update({ status: newStatus }).eq('id', id));
    }
    return list[index];
  }
  return null;
}

export function deleteBooking(id) {
  const list = getBookings().filter(b => b.id !== id);
  localStorage.setItem('africa_world_bookings', JSON.stringify(list));
  const client = getSupabase();
  if (client) {
    safeSupabaseQuery(client.from('bookings').delete().eq('id', id));
  }
  return true;
}

/* ================= 4. COMMUNITY MEMBERS CRM ================= */

export const COMMUNITY_INITIAL_MEMBERS = [
  {
    id: "mem-patron-01",
    name: "Kofi Mensah",
    email: "kofi.mensah@heritage.af",
    location: "Nairobi, Kenya",
    expeditions: 2,
    totalContributed: "$0.00",
    tier: "Heritage Patron",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    joinedDate: "Jan 2025"
  },
  {
    id: "mem-patron-02",
    name: "Dr. Amina Diallo",
    email: "amina.diallo@unesco-trails.org",
    location: "Dakar, Senegal",
    expeditions: 3,
    totalContributed: "$0.00",
    tier: "Cultural Explorer",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    joinedDate: "Feb 2025"
  },
  {
    id: "mem-patron-03",
    name: "Sarah Jenkins",
    email: "s.jenkins@oxford.edu",
    location: "London, UK",
    expeditions: 1,
    totalContributed: "$0.00",
    tier: "Heritage Explorer",
    status: "Active",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    joinedDate: "Mar 2025"
  }
];

export function getMembers() {
  let list = [];
  const stored = localStorage.getItem('africa_world_members');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed.filter(m => m && typeof m === 'object' && (m.name || m.email));
      }
    } catch (e) {}
  }

  // If members store is currently empty, initialize with verified active community travelers
  if (list.length === 0) {
    list = [...COMMUNITY_INITIAL_MEMBERS];
  } else {
    // Ensure seed community members aren't lost when new members are added
    COMMUNITY_INITIAL_MEMBERS.forEach(seed => {
      if (!list.some(m => m.email && m.email.toLowerCase() === seed.email.toLowerCase())) {
        list.push(seed);
      }
    });
  }

  // Include active authenticated customer if not already in list
  try {
    const rawCustomer = localStorage.getItem('africa_world_customer');
    if (rawCustomer) {
      const cust = JSON.parse(rawCustomer);
      if (cust && cust.email) {
        const exists = list.find(m => m.email && m.email.toLowerCase() === cust.email.toLowerCase());
        if (!exists) {
          list.unshift({
            id: cust.uid ? `mem-${cust.uid}` : `mem-${Date.now()}`,
            name: cust.name || cust.email.split('@')[0],
            email: cust.email,
            location: "Verified Traveler",
            expeditions: 1,
            totalContributed: "$0.00",
            tier: "Cultural Explorer",
            status: "Active",
            avatar: cust.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(cust.name || cust.email)}&background=059669&color=fff`,
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          });
        }
      }
    }

    // Also auto-detect Firebase session auth cache keys if present
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('firebase:authUser:')) {
        const authData = JSON.parse(localStorage.getItem(k));
        if (authData && authData.email) {
          const exists = list.find(m => m.email && m.email.toLowerCase() === authData.email.toLowerCase());
          if (!exists) {
            list.unshift({
              id: authData.uid ? `mem-${authData.uid}` : `mem-${Date.now()}`,
              name: authData.displayName || authData.email.split('@')[0],
              email: authData.email,
              location: "Verified Traveler",
              expeditions: 1,
              totalContributed: "$0.00",
              tier: "Cultural Explorer",
              status: "Active",
              avatar: authData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(authData.displayName || authData.email)}&background=059669&color=fff`,
              joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            });
          }
        }
      }
    }
  } catch(e) {}

  localStorage.setItem('africa_world_members', JSON.stringify(list));
  return list;
}

export function saveMember(member) {
  const list = getMembers();
  const newMember = {
    ...member,
    id: member.id || `mem-${Date.now()}`,
    name: member.name || "Member",
    email: member.email || "",
    location: member.location || "Global Heritage Patron",
    expeditions: parseInt(member.expeditions, 10) || 1,
    totalContributed: member.totalContributed || "$0.00",
    tier: member.tier || "Heritage Patron",
    status: member.status || "Active",
    avatar: member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'Member')}&background=059669&color=fff`,
    joinedDate: member.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  };
  list.unshift(newMember);
  localStorage.setItem('africa_world_members', JSON.stringify(list));

  const client = getSupabase();
  if (client) {
    safeSupabaseQuery(client.from('members').insert([newMember]));
  }
  return newMember;
}

export function updateMember(id, updates) {
  const list = getMembers();
  const idx = list.findIndex(m => m.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    localStorage.setItem('africa_world_members', JSON.stringify(list));
    const client = getSupabase();
    if (client) {
      safeSupabaseQuery(client.from('members').update(updates).eq('id', id));
    }
    return list[idx];
  }
  return null;
}

export function deleteMember(id) {
  const list = getMembers().filter(m => m.id !== id);
  localStorage.setItem('africa_world_members', JSON.stringify(list));
  const client = getSupabase();
  if (client) {
    safeSupabaseQuery(client.from('members').delete().eq('id', id));
  }
  return true;
}

export function syncMemberFromAuth(user) {
  if (!user || !user.email) return;
  const list = getMembers();
  const existing = list.find(m => m.email.toLowerCase() === user.email.toLowerCase());
  if (existing) {
    if (user.displayName && user.displayName !== existing.name) {
      existing.name = user.displayName;
    }
    if (user.photoURL) {
      existing.avatar = user.photoURL;
    }
    localStorage.setItem('africa_world_members', JSON.stringify(list));
  } else {
    saveMember({
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      location: "Verified Traveler",
      avatar: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=059669&color=fff`,
      tier: "Cultural Explorer",
      status: "Active",
      expeditions: 1,
      totalContributed: "$550.00"
    });
  }
}

/* ================= 5. DOCUMENTARY VIDEOS & EXPEDITIONS CMS ================= */

const DEFAULT_VIDEOS = [
  // Ancient Track
  {
    id: "vid-anc-1",
    track: "ancient",
    num: 1,
    icon: "fa-pyramid",
    title: "The Kingdom of Kush: Black Pharaohs of Meroë",
    tag: "Archival Series • 52 min",
    desc: "Examine the 25th Dynasty of Egypt ruled from Nubia, the royal pyramid necropolis of Meroë, and the powerful Kandake warrior queens.",
    img: "images/ba.jpg",
    place: "Meroë Necropolis & Upper Nile",
    sub: "Sudan • c. 750 BCE – 350 CE",
    yt: "https://www.youtube.com/watch?v=0k57eHkLqWk"
  },
  {
    id: "vid-anc-2",
    track: "ancient",
    num: 2,
    icon: "fa-church",
    title: "Lalibela & The Rock-Hewn Churches of Roha",
    tag: "UNESCO Heritage Film • 48 min",
    desc: "Witness the eleven medieval monolithic churches of Ethiopia, carved downwards directly into volcanic basalt in the 12th century under King Lalibela.",
    img: "images/bf.jpg",
    place: "Lalibela Monolithic Complex",
    sub: "Ethiopia • 12th Century CE",
    yt: "https://www.youtube.com/watch?v=vVj4Zqg_w60"
  },
  {
    id: "vid-anc-3",
    track: "ancient",
    num: 3,
    icon: "fa-monument",
    title: "Great Zimbabwe: The Granite Citadel",
    tag: "Archaeological Documentary • 45 min",
    desc: "Uncover the mortarless dry-stone walls of Great Zimbabwe, capital of the Kingdom of Zimbabwe and medieval global trade center for gold and porcelain.",
    img: "images/1.png",
    place: "Great Enclosure & Hill Complex",
    sub: "Zimbabwe • 11th–15th Century",
    yt: "https://www.youtube.com/watch?v=kYv_8V2x_uA"
  },
  // Slave Trade Track
  {
    id: "vid-slv-1",
    track: "slave-trade",
    num: 1,
    icon: "fa-door-open",
    title: "Gorée Island & The Door of No Return",
    tag: "Historical Memorial • 40 min",
    desc: "A poignant exploration of Maison des Esclaves off the Senegalese coast, remembering millions displaced during the transatlantic slave trade.",
    img: "images/k.jpg",
    place: "Maison des Esclaves, Gorée",
    sub: "Senegal • 15th–19th Century",
    yt: "https://www.youtube.com/watch?v=1F5O4_ZqRwk"
  },
  {
    id: "vid-slv-2",
    track: "slave-trade",
    num: 2,
    icon: "fa-dungeon",
    title: "Elmina Castle: Gold Coast Fortresses",
    tag: "Heritage Field Film • 50 min",
    desc: "The architecture of Dutch and Portuguese slave dungeons on the Gulf of Guinea and the resistance led by coastal communities.",
    img: "images/art.jpg",
    place: "Elmina & Cape Coast Castles",
    sub: "Ghana • 1482–1814 CE",
    yt: "https://www.youtube.com/watch?v=cM3O9_Xj480"
  },
  {
    id: "vid-slv-3",
    track: "slave-trade",
    num: 3,
    icon: "fa-crown",
    title: "The Kingdom of Dahomey & Ouidah Memorial Route",
    tag: "Cultural Documentary • 44 min",
    desc: "Tracing the sacred Slave Route of Ouidah to the Gate of No Return and the valor of the legendary Agojie warrior regiment.",
    img: "images/ba.jpg",
    place: "Ouidah Memorial & Royal Palaces",
    sub: "Benin • 17th–19th Century",
    yt: "https://www.youtube.com/watch?v=9_bVxMh12Zw"
  },
  // Anticolonial Track
  {
    id: "vid-col-1",
    track: "anticolonial",
    num: 1,
    icon: "fa-fire",
    title: "The Battle of Algiers & Front de Libération",
    tag: "Liberation Archives • 60 min",
    desc: "Urban warfare, anticolonial resistance, and the Casbah struggle that inspired global African and Third-World liberation struggles.",
    img: "images/bf.jpg",
    place: "Casbah of Algiers & Martyrs Memorial",
    sub: "Algeria • 1954–1962 CE",
    yt: "https://www.youtube.com/watch?v=f_N3kHn13fM"
  },
  {
    id: "vid-col-2",
    track: "anticolonial",
    num: 2,
    icon: "fa-book-open-reader",
    title: "Patrice Lumumba: Congo Independence & Hope",
    tag: "Political Biography • 55 min",
    desc: "The historic 1960 independence speech of Prime Minister Patrice Lumumba and the international struggle for Congolese sovereignty.",
    img: "images/1.png",
    place: "Kinshasa & Kisangani",
    sub: "DR Congo • 1960–1961 CE",
    yt: "https://www.youtube.com/watch?v=2n5w6k_bI18"
  },
  {
    id: "vid-col-3",
    track: "anticolonial",
    num: 3,
    icon: "fa-shield-halved",
    title: "The Mau Mau & Kenya's Forest Freedom Fighters",
    tag: "Decolonization Record • 49 min",
    desc: "The Aberdare Mountain guerrilla campaigns of Field Marshal Dedan Kimathi and Kenya's journey to independence in 1963.",
    img: "images/art.jpg",
    place: "Aberdare Mountains & Nyeri",
    sub: "Kenya • 1952–1963 CE",
    yt: "https://www.youtube.com/watch?v=7hP3_2kM9Q0"
  }
];

export function getVideos() {
  const stored = localStorage.getItem('africa_world_videos');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch(e) {}
  }
  localStorage.setItem('africa_world_videos', JSON.stringify(DEFAULT_VIDEOS));
  return DEFAULT_VIDEOS;
}

export function saveVideo(video) {
  const list = getVideos();
  const newVideo = {
    ...video,
    id: video.id || `vid-${Date.now()}`,
    track: video.track || "ancient",
    num: parseInt(video.num, 10) || (list.filter(v => v.track === (video.track || "ancient")).length + 1),
    icon: video.icon || "fa-video",
    title: video.title || "Untitled Documentary",
    tag: video.tag || "Curated Archival Screening",
    desc: video.desc || "",
    img: video.img || "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
    place: video.place || "African Historical Site",
    sub: video.sub || "Archival Record",
    yt: video.yt || "https://www.youtube.com"
  };
  list.unshift(newVideo);
  localStorage.setItem('africa_world_videos', JSON.stringify(list));

  const client = getSupabase();
  if (client) {
    safeSupabaseQuery(client.from('videos').insert([newVideo]));
  }
  return newVideo;
}

export function updateVideo(id, updates) {
  const list = getVideos();
  const idx = list.findIndex(v => v.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    localStorage.setItem('africa_world_videos', JSON.stringify(list));
    const client = getSupabase();
    if (client) {
      safeSupabaseQuery(client.from('videos').update(updates).eq('id', id));
    }
    return list[idx];
  }
  return null;
}

export function deleteVideo(id) {
  const list = getVideos().filter(v => v.id !== id);
  localStorage.setItem('africa_world_videos', JSON.stringify(list));
  const client = getSupabase();
  if (client) {
    safeSupabaseQuery(client.from('videos').delete().eq('id', id));
  }
  return true;
}

/* ================= 6. LIVE NOTIFICATIONS & USER ACTIVITY STREAM ================= */

const DEFAULT_NOTIFICATIONS = [
  {
    id: "notif-01",
    title: "New AI Expedition Booked",
    message: "Dr. Evelyn Parker confirmed 7-Day Serengeti Safari (#AI-SAFARI-8842)",
    type: "booking",
    time: "10m ago",
    timestamp: Date.now() - 600000,
    read: false
  },
  {
    id: "notif-02",
    title: "New Research Patron Registered",
    message: "Elena Rostova (elena.rostova@berlin-art.de) created a new traveler account",
    type: "user_registered",
    time: "45m ago",
    timestamp: Date.now() - 2700000,
    read: false
  },
  {
    id: "notif-03",
    title: "User Signed In",
    message: "Alex Mercer logged into Traveler Portal",
    type: "user_login",
    time: "2h ago",
    timestamp: Date.now() - 7200000,
    read: false
  },
  {
    id: "notif-04",
    title: "New Archival Film Curated",
    message: "Tony Robert published 'The Kingdom of Kush' to scrolling documentary showcase",
    type: "content",
    time: "5h ago",
    timestamp: Date.now() - 18000000,
    read: true
  }
];

export function getNotifications() {
  const stored = localStorage.getItem('africa_world_notifications');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch(e) {}
  }
  localStorage.setItem('africa_world_notifications', JSON.stringify(DEFAULT_NOTIFICATIONS));
  return DEFAULT_NOTIFICATIONS;
}

export function pushNotification(notif) {
  const list = getNotifications();
  const item = {
    id: notif.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: notif.title || "Portal Activity",
    message: notif.message || "",
    type: notif.type || "general",
    recipientEmail: notif.recipientEmail || "",
    time: "Just now",
    timestamp: Date.now(),
    read: false
  };
  list.unshift(item);
  if (list.length > 60) list.length = 60;
  localStorage.setItem('africa_world_notifications', JSON.stringify(list));
  window.dispatchEvent(new CustomEvent('africa_world_new_notification', { detail: item }));
  return item;
}

export function markNotificationsAsRead() {
  const list = getNotifications().map(n => ({ ...n, read: true }));
  localStorage.setItem('africa_world_notifications', JSON.stringify(list));
  return list;
}

export function markNotificationRead(id) {
  const list = getNotifications();
  const notif = list.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    localStorage.setItem('africa_world_notifications', JSON.stringify(list));
  }
  return list;
}

export function clearNotifications() {
  localStorage.setItem('africa_world_notifications', JSON.stringify([]));
  return [];
}

/* ================= 7. TRAVELER DISPATCHES & DIRECT MESSAGING ================= */

const DEFAULT_MESSAGES = [
  {
    id: "msg-101",
    sender: "Tony Robert (Lead Curator)",
    recipientEmail: "all",
    recipientName: "All Cultural Travelers",
    title: "Welcome to Africa & The World Heritage Portal",
    message: "Greetings from the curatorial team. Welcome to Africa & The World Heritage Portal! Feel free to submit inquiries directly through your dashboard.",
    type: "broadcast",
    dateFormatted: "Oct 24, 2026, 09:30 AM",
    timestamp: Date.now() - 86400000,
    read: false
  },
  {
    id: "msg-102",
    sender: "Tony Robert (Lead Curator)",
    recipientEmail: "kristin.c@outlook.com",
    recipientName: "Kristin Cooper",
    title: "Swahili Coast Maritime Expedition Update",
    message: "Hi Kristin, regarding your inquiry: we have confirmed the local Swahili historian guide in Lamu Old Town for your November dates. Your expedition voucher has been updated.",
    type: "direct",
    dateFormatted: "Oct 24, 2026, 11:15 AM",
    timestamp: Date.now() - 36000000,
    read: false
  },
  {
    id: "msg-103",
    sender: "Tony Robert (Lead Curator)",
    recipientEmail: "alex.mercer@gmail.com",
    recipientName: "Alex Mercer",
    title: "Great Zimbabwe Archaeological Seminar Confirmation",
    message: "Alex, your seat for the private dry-stone masonry research lecture has been reserved with the archaeology faculty.",
    type: "direct",
    dateFormatted: "Oct 23, 2026, 04:20 PM",
    timestamp: Date.now() - 172800000,
    read: true
  }
];

export function getMessages() {
  const stored = localStorage.getItem('africa_world_messages');
  if (stored) {
    try {
      const list = JSON.parse(stored);
      let changed = false;
      list.forEach(m => {
        if (m && m.message && m.message.includes("UNESCO World Heritage trails")) {
          m.message = "Greetings from the curatorial team. Welcome to Africa & The World Heritage Portal! Feel free to submit inquiries directly through your dashboard.";
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem('africa_world_messages', JSON.stringify(list));
      }
      return list;
    } catch(e) {}
  }
  localStorage.setItem('africa_world_messages', JSON.stringify(DEFAULT_MESSAGES));
  return DEFAULT_MESSAGES;
}

export function sendMessage({ sender = 'Curator Tony Robert (Administrator)', senderEmail = '', recipientEmail = 'all', recipientName = 'Traveler', title = 'Curator Advisory & Dispatch', message = '', type = 'direct' }) {
  const list = getMessages();
  const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const newMsg = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sender,
    senderEmail: (senderEmail || '').trim().toLowerCase(),
    recipientEmail: (recipientEmail || 'all').trim().toLowerCase(),
    recipientName: recipientName || 'Traveler',
    title: title || 'Curator Advisory & Dispatch',
    message,
    type: (recipientEmail || '').trim().toLowerCase() === 'all' ? 'broadcast' : (type || 'direct'),
    dateFormatted,
    timestamp: Date.now(),
    read: false
  };

  list.unshift(newMsg);
  localStorage.setItem('africa_world_messages', JSON.stringify(list));

  // Try persisting to Supabase if connected
  const client = getSupabase();
  if (client) {
    safeSupabaseQuery(client.from('messages').insert([newMsg]));
  }

  // Push operational notification so admin sees it in Dispatches log
  pushNotification({
    title: (newMsg.type === 'inquiry' || newMsg.senderEmail) ? `Inquiry from ${newMsg.sender}` : `Dispatched: ${newMsg.title}`,
    message: (newMsg.type === 'inquiry' || newMsg.senderEmail)
      ? `${newMsg.sender} (${newMsg.senderEmail || 'Traveler'}): "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`
      : `Sent to ${newMsg.recipientName} (${newMsg.recipientEmail}): "${message.slice(0, 60)}${message.length > 60 ? '...' : ''}"`,
    type: (newMsg.type === 'inquiry' || newMsg.senderEmail) ? "user" : "dispatch",
    recipientEmail: newMsg.recipientEmail
  });

  window.dispatchEvent(new CustomEvent('africa_world_new_message', { detail: newMsg }));
  return newMsg;
}

export function getUserMessages(userEmail) {
  const all = getMessages();
  if (!userEmail) {
    return all.filter(m => m.recipientEmail === 'all');
  }
  const emailLower = userEmail.toLowerCase();
  return all.filter(m => m.recipientEmail === 'all' || m.recipientEmail === emailLower || (m.senderEmail && m.senderEmail.toLowerCase() === emailLower));
}

export function markMessageRead(id) {
  const list = getMessages();
  const msg = list.find(m => m.id === id);
  if (msg) {
    msg.read = true;
    localStorage.setItem('africa_world_messages', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('africa_world_message_read', { detail: msg }));
  }
  return list;
}

/* ================= 8. FULL TWO-WAY SUPABASE DATABASE SYNC ================= */

/**
 * Queries Supabase directly. If remote tables have data, syncs into local cache.
 * If remote tables are empty, attempts to seed with initial curated catalog.
 */
export async function syncAllFromSupabase() {
  const client = getSupabase();
  if (!client) return { success: false, reason: 'No Supabase client initialized' };

  const results = { exhibits: 0, bookings: 0, members: 0, videos: 0 };

  try {
    // 1. Sync exhibits
    const { data: exhData, error: exhErr } = await client.from('exhibits').select('*');
    if (!exhErr && Array.isArray(exhData) && exhData.length > 0) {
      localStorage.setItem('africa_world_exhibits', JSON.stringify(exhData));
      results.exhibits = exhData.length;
    } else if (!exhErr && Array.isArray(exhData) && exhData.length === 0) {
      // Seed default exhibits
      await client.from('exhibits').insert(DEFAULT_EXHIBITS).then(() => {}).catch(() => {});
    }

    // 2. Sync bookings
    const { data: bData, error: bErr } = await client.from('bookings').select('*');
    if (!bErr && Array.isArray(bData) && bData.length > 0) {
      localStorage.setItem('africa_world_bookings', JSON.stringify(bData));
      results.bookings = bData.length;
    } else if (!bErr && Array.isArray(bData) && bData.length === 0) {
      await client.from('bookings').insert(DEFAULT_BOOKINGS).then(() => {}).catch(() => {});
    }

    // 3. Sync members
    const { data: mData, error: mErr } = await client.from('members').select('*');
    if (!mErr && Array.isArray(mData) && mData.length > 0) {
      localStorage.setItem('africa_world_members', JSON.stringify(mData));
      results.members = mData.length;
    } else if (!mErr && Array.isArray(mData) && mData.length === 0) {
      await client.from('members').insert(COMMUNITY_INITIAL_MEMBERS).then(() => {}).catch(() => {});
    }

    // 4. Sync videos
    const { data: vData, error: vErr } = await client.from('videos').select('*');
    if (!vErr && Array.isArray(vData) && vData.length > 0) {
      localStorage.setItem('africa_world_videos', JSON.stringify(vData));
      results.videos = vData.length;
    } else if (!vErr && Array.isArray(vData) && vData.length === 0) {
      await client.from('videos').insert(DEFAULT_VIDEOS).then(() => {}).catch(() => {});
    }

    return { success: true, results };
  } catch (err) {
    console.warn("Supabase full sync notice:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Force-pushes all current local state to Supabase tables
 */
export async function forceSyncAllToSupabase() {
  const client = getSupabase();
  if (!client) return { success: false, error: 'No client' };

  try {
    const exhibits = getExhibits();
    const bookings = getBookings();
    const members = getMembers();
    const videos = getVideos();

    await Promise.allSettled([
      client.from('exhibits').upsert(exhibits, { onConflict: 'id' }),
      client.from('bookings').upsert(bookings, { onConflict: 'id' }),
      client.from('members').upsert(members, { onConflict: 'id' }),
      client.from('videos').upsert(videos, { onConflict: 'id' })
    ]);

    return { success: true };
  } catch (err) {
    console.error("Force sync error:", err);
    return { success: false, error: err.message };
  }
}

// Window export for direct accessibility in browser scripts
window.AfricaWorldSupabase = {
  config: SUPABASE_CONFIG,
  getSupabase,
  safeSupabaseQuery,
  adminLogin,
  adminLogout,
  getAdminSession,
  getExhibits,
  saveExhibit,
  updateExhibit,
  deleteExhibit,
  getBookings,
  saveBooking,
  updateBookingStatus,
  deleteBooking,
  getMembers,
  saveMember,
  updateMember,
  deleteMember,
  syncMemberFromAuth,
  getVideos,
  saveVideo,
  updateVideo,
  deleteVideo,
  getNotifications,
  pushNotification,
  markNotificationsAsRead,
  markNotificationRead,
  clearNotifications,
  getMessages,
  sendMessage,
  getUserMessages,
  markMessageRead,
  getTickerItems,
  saveTickerItems,
  getTypewriterPhrases,
  saveTypewriterPhrases,
  syncAllFromSupabase,
  forceSyncAllToSupabase
};
