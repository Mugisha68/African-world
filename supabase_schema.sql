-- ==============================================================================
-- AFRICA & THE WORLD | COMPREHENSIVE SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste Entire File -> Click "RUN"
-- This creates and updates all portal tables, chat dispatches, members CRM,
-- live notifications, and ticker items with idempotent upserts and full RLS policies.
-- ==============================================================================

-- 1. CREATE EXHIBITS & CONTENT CMS TABLE
CREATE TABLE IF NOT EXISTS public.exhibits (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    category TEXT NOT NULL,
    region TEXT NOT NULL,
    image TEXT,
    curator TEXT DEFAULT 'Tony Robert',
    description TEXT,
    reads INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Published',
    "galleryCategory" TEXT,
    "dateAdded" TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. CREATE BOOKINGS & AI EXPEDITIONS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    "travelerName" TEXT NOT NULL,
    "travelerEmail" TEXT NOT NULL,
    "serviceTitle" TEXT NOT NULL,
    destination TEXT,
    "bookedVia" TEXT DEFAULT 'Afrimax AI Assistant',
    "aiNotes" TEXT,
    "dateBooked" TEXT DEFAULT TO_CHAR(NOW(), 'Mon DD, YYYY'),
    "travelDates" TEXT DEFAULT 'Scheduled 2026/2027',
    "partySize" INTEGER DEFAULT 2,
    amount TEXT DEFAULT '$1,500.00',
    status TEXT DEFAULT 'AI Confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. CREATE MEMBERS & RESEARCH PATRONS TABLE (CRM)
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    location TEXT DEFAULT 'Global Patron',
    tier TEXT DEFAULT 'Cultural Explorer',
    status TEXT DEFAULT 'Active',
    expeditions INTEGER DEFAULT 1,
    "totalContributed" TEXT DEFAULT '$0.00',
    avatar TEXT,
    "joinedDate" TEXT DEFAULT TO_CHAR(NOW(), 'Mon YYYY'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. CREATE DOCUMENTARY VIDEOS CMS TABLE
CREATE TABLE IF NOT EXISTS public.videos (
    id TEXT PRIMARY KEY,
    track TEXT NOT NULL,
    num INTEGER DEFAULT 1,
    icon TEXT DEFAULT 'fa-video',
    title TEXT NOT NULL,
    tag TEXT DEFAULT 'Curated Archival Screening',
    "desc" TEXT,
    img TEXT,
    place TEXT,
    sub TEXT,
    yt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. CREATE NOTIFICATIONS & OPERATIONS STREAM TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    "recipientEmail" TEXT DEFAULT '',
    time TEXT DEFAULT 'Just now',
    read BOOLEAN DEFAULT FALSE,
    timestamp BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. CREATE TRAVELER & CURATOR MESSAGES / DISPATCHES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    sender TEXT NOT NULL,
    "senderEmail" TEXT DEFAULT '',
    "recipientEmail" TEXT DEFAULT 'all',
    "recipientName" TEXT DEFAULT 'Traveler',
    title TEXT DEFAULT 'Curator Advisory & Dispatch',
    message TEXT NOT NULL,
    type TEXT DEFAULT 'direct',
    "dateFormatted" TEXT,
    timestamp BIGINT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. CREATE KNOWLEDGE STREAM TICKER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.ticker_items (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    tag TEXT DEFAULT 'Civilization',
    icon TEXT DEFAULT 'fa-landmark',
    link TEXT DEFAULT 'history.html',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8. CREATE HERO TYPEWRITER PHRASES TABLE
CREATE TABLE IF NOT EXISTS public.typewriter_phrases (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    "orderIndex" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 9. ENSURE ALL COLUMNS EXIST ON PRE-EXISTING TABLES (MIGRATION SAFE)
ALTER TABLE public.exhibits ADD COLUMN IF NOT EXISTS subtitle TEXT;
ALTER TABLE public.exhibits ADD COLUMN IF NOT EXISTS "galleryCategory" TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "recipientEmail" TEXT DEFAULT '';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS "senderEmail" TEXT DEFAULT '';

-- 10. ENABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES
ALTER TABLE public.exhibits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticker_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typewriter_phrases ENABLE ROW LEVEL SECURITY;

-- 10. DROP EXISTING POLICIES INDIVIDUALLY AND RE-CREATE THEM CLEANLY
-- (Direct DROP POLICY IF EXISTS prevents error 42710 duplicate object errors)

DROP POLICY IF EXISTS "Exhibits unrestricted access" ON public.exhibits;
CREATE POLICY "Exhibits unrestricted access" ON public.exhibits FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Bookings unrestricted access" ON public.bookings;
CREATE POLICY "Bookings unrestricted access" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Members unrestricted access" ON public.members;
CREATE POLICY "Members unrestricted access" ON public.members FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Videos unrestricted access" ON public.videos;
CREATE POLICY "Videos unrestricted access" ON public.videos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Notifications unrestricted access" ON public.notifications;
CREATE POLICY "Notifications unrestricted access" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Messages unrestricted access" ON public.messages;
CREATE POLICY "Messages unrestricted access" ON public.messages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Ticker unrestricted access" ON public.ticker_items;
CREATE POLICY "Ticker unrestricted access" ON public.ticker_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Typewriter unrestricted access" ON public.typewriter_phrases;
CREATE POLICY "Typewriter unrestricted access" ON public.typewriter_phrases FOR ALL USING (true) WITH CHECK (true);

-- 11. GRANT PRIVILEGES TO ALL ROLES (ANON & AUTHENTICATED)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- 12. SEED CANONICAL EXHIBITS (IDEMPOTENT UPSERT)
INSERT INTO public.exhibits (id, title, category, region, image, curator, description, reads, status, "dateAdded")
VALUES
('exh-101', 'Benin Bronze Relief Plaque', 'Heritage Sculptures', 'West Africa (Nigeria)', 'images/1.png', 'Tony Robert', 'Intricately cast brass & bronze architectural plaques depicting court life, warriors, and the Oba of the Kingdom of Benin (16th-17th century).', 4280, 'Published', '2026-09-15'),
('exh-102', 'Royal Ashanti Kente Silk Weave', 'Textiles & Living Traditions', 'West Africa (Ghana)', 'images/art.jpg', 'Amara Okafor', 'Handwoven strip cloth embedded with symbolic proverb patterns, traditionally reserved for royalty and sacred ceremonies across Ashanti history.', 6150, 'Published', '2026-09-20'),
('exh-103', 'Meroë Royal Pyramids of Kush', 'Ancient Civilizations', 'North-East Africa (Sudan)', 'images/ba.jpg', 'Dr. Al-Mansoor', 'Steep-sided sandstone pyramids constructed for the rulers of the Kingdom of Kush, renowned for powerful warrior queens (Kandakes).', 3890, 'Published', '2026-10-02'),
('exh-104', 'Lalibela Rock-Hewn Monolithic Sanctuaries', 'Sacred Architecture', 'Horn of Africa (Ethiopia)', 'images/bf.jpg', 'Tewodros Haile', 'Eleven medieval monolithic churches carved entirely out of volcanic rock during the reign of King Lalibela in the 12th century.', 5410, 'Published', '2026-10-10'),
('exh-105', 'The Epic of Sundiata & Oral Memory', 'Literature & Oral Epics', 'West Africa (Mali)', 'images/k.jpg', 'Tony Robert', 'The foundational oral epic of the Mali Empire preserved by generation of Griots (Jelis), recounting the life of Sundiata Keita.', 7290, 'Published', '2026-10-14')
ON CONFLICT (id) DO UPDATE SET
title = EXCLUDED.title,
description = EXCLUDED.description,
category = EXCLUDED.category,
region = EXCLUDED.region,
image = EXCLUDED.image,
curator = EXCLUDED.curator,
status = EXCLUDED.status;

-- 13. SEED BOOKINGS (IDEMPOTENT UPSERT)
INSERT INTO public.bookings (id, "travelerName", "travelerEmail", "serviceTitle", destination, "bookedVia", "aiNotes", "dateBooked", "travelDates", "partySize", amount, status)
VALUES
('AI-SAFARI-8842', 'Dr. Evelyn Parker', 'e.parker@oxford.ac.uk', '7-Day Great Migration Safari & Maasai Cultural Exchange', 'Tanzania & Kenya', 'Afrimax AI Assistant', 'Traveler requested focus on wildlife conservation and traditional Maasai pastoral history. Recommended Seronera Valley and Olduvai Gorge.', 'Oct 21, 2026', 'Dec 12 - Dec 19, 2026', 2, '$3,850.00', 'AI Confirmed'),
('AI-CULTURE-7731', 'Kwame Mensah', 'kwame.m@heritage.org', 'Ashanti Heritage & Traditional Kente Weaving Workshop', 'Accra & Kumasi, Ghana', 'Afrimax AI Assistant', 'Educational booking for diaspora research group. Includes master weaver apprenticeship at Bonwire and Manhyia Palace tour.', 'Oct 20, 2026', 'Nov 05 - Nov 11, 2026', 4, '$1,940.00', 'Confirmed'),
('AI-NILE-6520', 'Elena Rostova', 'elena.rostova@berlin-art.de', 'Nubian Kingdom & Nile Historical Felucca Expedition', 'Aswan (Egypt) to Meroë (Sudan)', 'Afrimax AI Assistant', 'Archaeological interest in Kingdom of Kush and Philae Island temples. Requested English & French-speaking historical guide.', 'Oct 19, 2026', 'Jan 10 - Jan 18, 2027', 1, '$2,480.00', 'Under Review'),
('AI-LIT-4419', 'Marcus Sterling', 'm.sterling@literary-heritage.com', 'Griot Storytelling & Timbuktu Manuscripts Study', 'Bamako & Djenné, Mali', 'Afrimax AI Assistant', 'Academic research trip on West African oral traditions and preservation of Arabic-Ajami manuscripts.', 'Oct 16, 2026', 'Feb 02 - Feb 12, 2027', 2, '$3,120.00', 'Confirmed')
ON CONFLICT (id) DO UPDATE SET
"travelerName" = EXCLUDED."travelerName",
"serviceTitle" = EXCLUDED."serviceTitle",
destination = EXCLUDED.destination,
status = EXCLUDED.status;

-- 14. SEED VERIFIED COMMUNITY MEMBERS CRM (IDEMPOTENT UPSERT)
INSERT INTO public.members (id, name, email, location, expeditions, "totalContributed", tier, avatar, "joinedDate", status)
VALUES
('mem-patron-01', 'Kofi Mensah', 'kofi.mensah@heritage.af', 'Nairobi, Kenya', 2, '$0.00', 'Heritage Patron', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'Jan 2025', 'Active'),
('mem-patron-02', 'Dr. Amina Diallo', 'amina.diallo@unesco-trails.org', 'Dakar, Senegal', 3, '$0.00', 'Cultural Explorer', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', 'Feb 2025', 'Active'),
('mem-patron-03', 'Sarah Jenkins', 's.jenkins@oxford.edu', 'London, UK', 1, '$0.00', 'Heritage Explorer', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', 'Mar 2025', 'Active')
ON CONFLICT (id) DO UPDATE SET
name = EXCLUDED.name,
email = EXCLUDED.email,
location = EXCLUDED.location,
tier = EXCLUDED.tier,
avatar = EXCLUDED.avatar,
status = EXCLUDED.status;

-- 15. SEED CURATED DOCUMENTARY FILMS (IDEMPOTENT UPSERT)
INSERT INTO public.videos (id, track, num, icon, title, tag, "desc", img, place, sub, yt)
VALUES
('vid-anc-1', 'ancient', 1, 'fa-pyramid', 'The Kingdom of Kush: Black Pharaohs of Meroë', 'Archival Series • 52 min', 'Examine the 25th Dynasty of Egypt ruled from Nubia, the royal pyramid necropolis of Meroë, and the powerful Kandake warrior queens.', 'images/ba.jpg', 'Meroë Necropolis & Upper Nile', 'Sudan • c. 750 BCE – 350 CE', 'https://www.youtube.com/watch?v=0k57eHkLqWk'),
('vid-anc-2', 'ancient', 2, 'fa-church', 'Lalibela & The Rock-Hewn Churches of Roha', 'UNESCO Heritage Film • 48 min', 'Witness the eleven medieval monolithic churches of Ethiopia, carved downwards directly into volcanic basalt in the 12th century under King Lalibela.', 'images/bf.jpg', 'Lalibela Monolithic Complex', 'Ethiopia • 12th Century CE', 'https://www.youtube.com/watch?v=vVj4Zqg_w60'),
('vid-anc-3', 'ancient', 3, 'fa-monument', 'Great Zimbabwe: The Granite Citadel', 'Archaeological Documentary • 45 min', 'Uncover the mortarless dry-stone walls of Great Zimbabwe, capital of the Kingdom of Zimbabwe and medieval global trade center for gold and porcelain.', 'images/1.png', 'Great Enclosure & Hill Complex', 'Zimbabwe • 11th–15th Century', 'https://www.youtube.com/watch?v=kYv_8V2x_uA'),
('vid-slv-1', 'slave-trade', 1, 'fa-door-open', 'Gorée Island & The Door of No Return', 'Historical Memorial • 40 min', 'A poignant exploration of Maison des Esclaves off the Senegalese coast, remembering millions displaced during the transatlantic slave trade.', 'images/k.jpg', 'Maison des Esclaves, Gorée', 'Senegal • 15th–19th Century', 'https://www.youtube.com/watch?v=1F5O4_ZqRwk'),
('vid-slv-2', 'slave-trade', 2, 'fa-dungeon', 'Elmina Castle: Gold Coast Fortresses', 'Heritage Field Film • 50 min', 'The architecture of Dutch and Portuguese slave dungeons on the Gulf of Guinea and the resistance led by coastal communities.', 'images/art.jpg', 'Elmina & Cape Coast Castles', 'Ghana • 1482–1814 CE', 'https://www.youtube.com/watch?v=cM3O9_Xj480'),
('vid-slv-3', 'slave-trade', 3, 'fa-crown', 'The Kingdom of Dahomey & Ouidah Memorial Route', 'Cultural Documentary • 44 min', 'Tracing the sacred Slave Route of Ouidah to the Gate of No Return and the valor of the legendary Agojie warrior regiment.', 'images/ba.jpg', 'Ouidah Memorial & Royal Palaces', 'Benin • 17th–19th Century', 'https://www.youtube.com/watch?v=9_bVxMh12Zw'),
('vid-col-1', 'anticolonial', 1, 'fa-fire', 'The Battle of Algiers & Front de Libération', 'Liberation Archives • 60 min', 'Urban warfare, anticolonial resistance, and the Casbah struggle that inspired global African and Third-World liberation struggles.', 'images/bf.jpg', 'Casbah of Algiers & Martyrs Memorial', 'Algeria • 1954–1962 CE', 'https://www.youtube.com/watch?v=f_N3kHn13fM'),
('vid-col-2', 'anticolonial', 2, 'fa-book-open-reader', 'Patrice Lumumba: Congo Independence & Hope', 'Political Biography • 55 min', 'The historic 1960 independence speech of Prime Minister Patrice Lumumba and the international struggle for Congolese sovereignty.', 'images/1.png', 'Kinshasa & Kisangani', 'DR Congo • 1960–1961 CE', 'https://www.youtube.com/watch?v=2n5w6k_bI18'),
('vid-col-3', 'anticolonial', 3, 'fa-shield-halved', 'The Mau Mau & Kenya''s Forest Freedom Fighters', 'Decolonization Record • 49 min', 'The Aberdare Mountain guerrilla campaigns of Field Marshal Dedan Kimathi and Kenya''s journey to independence in 1963.', 'images/art.jpg', 'Aberdare Mountains & Nyeri', 'Kenya • 1952–1963 CE', 'https://www.youtube.com/watch?v=7hP3_2kM9Q0')
ON CONFLICT (id) DO UPDATE SET
title = EXCLUDED.title,
tag = EXCLUDED.tag,
"desc" = EXCLUDED."desc",
img = EXCLUDED.img,
place = EXCLUDED.place,
sub = EXCLUDED.sub,
yt = EXCLUDED.yt;

-- 16. SEED INITIAL CANONICAL TICKER STREAM (IDEMPOTENT UPSERT)
INSERT INTO public.ticker_items (id, text, tag, icon, link)
VALUES
('tick-1', 'Kingdom of Kush: Pyramids of Meroë & Kandake Queens', 'Civilization', 'fa-landmark', 'history.html'),
('tick-2', 'Mali Empire & Golden Trade of Mansa Musa', 'Empire', 'fa-crown', 'history.html'),
('tick-3', 'Swahili Coast Maritime Trade & Dhow Navigation', 'Trade', 'fa-ship', 'history.html'),
('tick-4', 'Lalibela: Monolithic Rock-Hewn Sanctuaries of Ethiopia', 'Heritage', 'fa-cube', 'history.html'),
('tick-5', 'Great Zimbabwe: Medieval Stone Architecture of Munhumutapa', 'Architecture', 'fa-shield-halved', 'history.html')
ON CONFLICT (id) DO UPDATE SET
text = EXCLUDED.text,
tag = EXCLUDED.tag,
icon = EXCLUDED.icon,
link = EXCLUDED.link;

-- 17. SEED HERO TYPEWRITER PHRASES (IDEMPOTENT UPSERT)
INSERT INTO public.typewriter_phrases (id, text, "orderIndex")
VALUES
('phrase-1', 'Pan-African Cultural Chronicles', 1),
('phrase-2', 'From Nile Valley to Great Zimbabwe', 2),
('phrase-3', 'UNESCO World Heritage Trails', 3),
('phrase-4', 'Ancient Civilizations & Heritage', 4),
('phrase-5', 'Living Legacies & Liberation Epics', 5)
ON CONFLICT (id) DO UPDATE SET
text = EXCLUDED.text,
"orderIndex" = EXCLUDED."orderIndex";

-- 18. VERIFICATION QUERY SUMMARY
SELECT 'exhibits' AS table_name, count(*) AS total_rows FROM public.exhibits
UNION ALL
SELECT 'bookings', count(*) FROM public.bookings
UNION ALL
SELECT 'members', count(*) FROM public.members
UNION ALL
SELECT 'videos', count(*) FROM public.videos
UNION ALL
SELECT 'notifications', count(*) FROM public.notifications
UNION ALL
SELECT 'messages', count(*) FROM public.messages
UNION ALL
SELECT 'ticker_items', count(*) FROM public.ticker_items
UNION ALL
SELECT 'typewriter_phrases', count(*) FROM public.typewriter_phrases;
