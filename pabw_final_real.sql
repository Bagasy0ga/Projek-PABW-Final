-- ============================================================
-- Supabase / PostgreSQL Schema + RLS
-- Converted from MySQL dump: pabw_final_real
-- ============================================================

-- ------------------------------------------------------------
-- EXTENSIONS
-- ------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SECTION 1: TABLE DEFINITIONS
-- ============================================================

-- ------------------------------------------------------------
-- TABLE: user
-- Mapped ke auth.users Supabase.
-- id_user di sini = integer auto-increment untuk backward-compat,
-- tapi kita tambah kolom auth_id (uuid) yang link ke auth.users.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public."user" (
  id_user      SERIAL        PRIMARY KEY,
  auth_id      UUID          UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name         VARCHAR(255)  NOT NULL,
  role         TEXT          NOT NULL DEFAULT 'customer' CHECK (role IN ('admin','customer')),
  phone_number VARCHAR(20)   NOT NULL,
  email        VARCHAR(255)  NOT NULL UNIQUE,
  password     VARCHAR(255)  NOT NULL,
  is_verified  BOOLEAN       NOT NULL DEFAULT FALSE
);

-- ------------------------------------------------------------
-- TABLE: company_profile
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_profile (
  id_company_profile SERIAL        PRIMARY KEY,
  company_name       VARCHAR(255)  NOT NULL,
  address            VARCHAR(255)  NOT NULL,
  phone_number       VARCHAR(20)   NOT NULL,
  email              VARCHAR(255)  NOT NULL UNIQUE,
  username           VARCHAR(20)   NOT NULL,
  id_user            INT           REFERENCES public."user"(id_user) ON DELETE SET NULL,
  password           VARCHAR(255)  NOT NULL DEFAULT ''
);

-- ------------------------------------------------------------
-- TABLE: list_hotel
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.list_hotel (
  id_list_hotel      SERIAL        PRIMARY KEY,
  id_company_profile INT           NOT NULL REFERENCES public.company_profile(id_company_profile) ON DELETE CASCADE,
  hotel_name         VARCHAR(255)  NOT NULL,
  location           VARCHAR(255)  NOT NULL,
  contact_person     VARCHAR(255)  NOT NULL,
  contact_email      VARCHAR(255)  NOT NULL,
  contact_phone      VARCHAR(20)   NOT NULL
);

-- ------------------------------------------------------------
-- TABLE: detail_kamar
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.detail_kamar (
  id_detail_kamar SERIAL        PRIMARY KEY,
  type_room       VARCHAR(255)  NOT NULL,
  description     TEXT          NOT NULL,
  facility        TEXT          NOT NULL,
  capacity        INT           NOT NULL
);

-- ------------------------------------------------------------
-- TABLE: list_kamar
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.list_kamar (
  id_list_kamar   SERIAL         PRIMARY KEY,
  id_list_hotel   INT            NOT NULL REFERENCES public.list_hotel(id_list_hotel) ON DELETE CASCADE,
  id_detail_kamar INT            NOT NULL REFERENCES public.detail_kamar(id_detail_kamar),
  room_number     VARCHAR(100)   NOT NULL,
  price           NUMERIC(10,2)  NOT NULL,
  status          TEXT           NOT NULL DEFAULT 'available' CHECK (status IN ('available','not available'))
);

-- ------------------------------------------------------------
-- TABLE: deskripsi_hotel
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deskripsi_hotel (
  id_deskripsi_hotel SERIAL      PRIMARY KEY,
  id_list_hotel      INT         NOT NULL UNIQUE REFERENCES public.list_hotel(id_list_hotel) ON DELETE CASCADE ON UPDATE CASCADE,
  description        TEXT        NOT NULL,
  facility           TEXT,
  policy             TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_deskripsi_hotel_updated_at
  BEFORE UPDATE ON public.deskripsi_hotel
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- TABLE: history_purchase
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.history_purchase (
  id_history         SERIAL         PRIMARY KEY,
  id_user            INT            NOT NULL REFERENCES public."user"(id_user),
  id_company_profile INT            NOT NULL REFERENCES public.company_profile(id_company_profile),
  id_list_kamar      INT            NOT NULL REFERENCES public.list_kamar(id_list_kamar),
  purchase_date      TIMESTAMPTZ    DEFAULT NOW(),
  checkin_time       TIMESTAMPTZ    NOT NULL,
  checkout_time      TIMESTAMPTZ    NOT NULL,
  amount             NUMERIC(10,2)  NOT NULL,
  status             TEXT           NOT NULL DEFAULT 'confirmed'
                     CHECK (status IN ('confirmed','cancelled','checkin','checkout'))
);

-- ------------------------------------------------------------
-- TABLE: hotel_rating
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.hotel_rating (
  id_rating    SERIAL       PRIMARY KEY,
  id_user      INT          NOT NULL REFERENCES public."user"(id_user),
  id_list_hotel INT         NOT NULL REFERENCES public.list_hotel(id_list_hotel),
  id_history   INT          NOT NULL UNIQUE REFERENCES public.history_purchase(id_history),
  rating       SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review       TEXT,
  created_at   TIMESTAMPTZ  DEFAULT NOW(),
  updated_at   TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TRIGGER trg_hotel_rating_updated_at
  BEFORE UPDATE ON public.hotel_rating
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------
-- TABLE: email_verification_codes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.email_verification_codes (
  id_code     SERIAL        PRIMARY KEY,
  email       VARCHAR(255)  NOT NULL,
  purpose     TEXT          NOT NULL DEFAULT 'verify_email'
              CHECK (purpose IN ('verify_email','reset_password','login_otp','change_password')),
  otp_hash    VARCHAR(255)  NOT NULL,
  attempts    INT           NOT NULL DEFAULT 0,
  expires_at  TIMESTAMPTZ   NOT NULL,
  consumed_at TIMESTAMPTZ   DEFAULT NULL,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_purpose ON public.email_verification_codes(email, purpose);
CREATE INDEX IF NOT EXISTS idx_expires_at    ON public.email_verification_codes(expires_at);

-- ------------------------------------------------------------
-- TABLE: session_login
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.session_login (
  id_login      UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_user       INT          NOT NULL REFERENCES public."user"(id_user),
  user_type     TEXT         NOT NULL DEFAULT 'customer' CHECK (user_type IN ('admin','mitra','customer')),
  status        TEXT         NOT NULL DEFAULT 'active'   CHECK (status    IN ('active','inactive')),
  login_time    TIMESTAMPTZ  DEFAULT NOW(),
  last_activity TIMESTAMPTZ  DEFAULT NOW(),
  logout_time   TIMESTAMPTZ  DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_session_id_user ON public.session_login(id_user);

-- ------------------------------------------------------------
-- TABLE: session_login_backup
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.session_login_backup (
  id_login      INT          PRIMARY KEY DEFAULT 0,
  id_user       INT          NOT NULL REFERENCES public."user"(id_user),
  user_type     TEXT         NOT NULL DEFAULT 'customer' CHECK (user_type IN ('admin','mitra','customer')),
  status        TEXT         NOT NULL DEFAULT 'active'   CHECK (status    IN ('active','inactive')),
  login_time    TIMESTAMPTZ  DEFAULT NOW(),
  last_activity TIMESTAMPTZ  DEFAULT NOW(),
  logout_time   TIMESTAMPTZ  DEFAULT NULL
);


-- ============================================================
-- SECTION 2: HELPER FUNCTIONS untuk RLS
-- ============================================================

-- Ambil id_user dari auth.users yang sedang login
CREATE OR REPLACE FUNCTION public.get_my_user_id()
RETURNS INT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id_user FROM public."user"
  WHERE auth_id = auth.uid()
  LIMIT 1;
$$;

-- Cek apakah user yang login adalah admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public."user"
    WHERE auth_id = auth.uid() AND role = 'admin'
  );
$$;

-- Ambil id_company_profile milik admin/mitra yang login
CREATE OR REPLACE FUNCTION public.get_my_company_id()
RETURNS INT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT id_company_profile FROM public.company_profile
  WHERE id_user = public.get_my_user_id()
  LIMIT 1;
$$;


-- ============================================================
-- SECTION 3: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public."user"                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_hotel                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detail_kamar              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_kamar                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deskripsi_hotel           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history_purchase          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_rating              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_codes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_login             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_login_backup      ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- SECTION 4: RLS POLICIES
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- TABLE: user
--   • Customer: hanya bisa SELECT & UPDATE row miliknya sendiri
--   • Admin   : bisa SELECT semua, tidak bisa hapus sembarangan
--   • INSERT  : hanya via service_role (registration handler)
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "user: customer select own"
  ON public."user" FOR SELECT
  USING ( auth_id = auth.uid() OR public.is_admin() );

CREATE POLICY "user: customer update own"
  ON public."user" FOR UPDATE
  USING ( auth_id = auth.uid() )
  WITH CHECK ( auth_id = auth.uid() );

CREATE POLICY "user: admin can update all"
  ON public."user" FOR UPDATE
  USING ( public.is_admin() );

CREATE POLICY "user: admin can delete"
  ON public."user" FOR DELETE
  USING ( public.is_admin() );

-- INSERT hanya via service_role (bypass RLS di backend/auth trigger)
CREATE POLICY "user: insert via service role only"
  ON public."user" FOR INSERT
  WITH CHECK ( public.is_admin() );


-- ─────────────────────────────────────────────────────────────
-- TABLE: company_profile
--   • Public  : boleh SELECT (info hotel/mitra tersedia publik)
--   • Mitra   : UPDATE hanya profil milik sendiri
--   • Admin   : full access
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "company_profile: public read"
  ON public.company_profile FOR SELECT
  USING ( true );

CREATE POLICY "company_profile: mitra update own"
  ON public.company_profile FOR UPDATE
  USING  ( id_user = public.get_my_user_id() OR public.is_admin() )
  WITH CHECK ( id_user = public.get_my_user_id() OR public.is_admin() );

CREATE POLICY "company_profile: admin insert"
  ON public.company_profile FOR INSERT
  WITH CHECK ( public.is_admin() );

CREATE POLICY "company_profile: admin delete"
  ON public.company_profile FOR DELETE
  USING ( public.is_admin() );


-- ─────────────────────────────────────────────────────────────
-- TABLE: list_hotel
--   • Public  : SELECT semua (katalog hotel)
--   • Mitra   : INSERT/UPDATE/DELETE hanya hotel milik company-nya
--   • Admin   : full access
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "list_hotel: public read"
  ON public.list_hotel FOR SELECT
  USING ( true );

CREATE POLICY "list_hotel: mitra insert own"
  ON public.list_hotel FOR INSERT
  WITH CHECK (
    id_company_profile = public.get_my_company_id()
    OR public.is_admin()
  );

CREATE POLICY "list_hotel: mitra update own"
  ON public.list_hotel FOR UPDATE
  USING  ( id_company_profile = public.get_my_company_id() OR public.is_admin() )
  WITH CHECK ( id_company_profile = public.get_my_company_id() OR public.is_admin() );

CREATE POLICY "list_hotel: mitra delete own"
  ON public.list_hotel FOR DELETE
  USING ( id_company_profile = public.get_my_company_id() OR public.is_admin() );


-- ─────────────────────────────────────────────────────────────
-- TABLE: detail_kamar
--   • Public  : SELECT (tipe kamar adalah master data publik)
--   • Admin   : full access
--   • Mitra   : tidak bisa ubah master; ubah lewat list_kamar saja
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "detail_kamar: public read"
  ON public.detail_kamar FOR SELECT
  USING ( true );

CREATE POLICY "detail_kamar: admin write"
  ON public.detail_kamar FOR ALL
  USING ( public.is_admin() )
  WITH CHECK ( public.is_admin() );


-- ─────────────────────────────────────────────────────────────
-- TABLE: list_kamar
--   • Public  : SELECT (customer butuh lihat kamar & harga)
--   • Mitra   : INSERT/UPDATE/DELETE kamar di hotel miliknya
--   • Admin   : full access
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "list_kamar: public read"
  ON public.list_kamar FOR SELECT
  USING ( true );

CREATE POLICY "list_kamar: mitra insert own"
  ON public.list_kamar FOR INSERT
  WITH CHECK (
    id_list_hotel IN (
      SELECT id_list_hotel FROM public.list_hotel
      WHERE id_company_profile = public.get_my_company_id()
    )
    OR public.is_admin()
  );

CREATE POLICY "list_kamar: mitra update own"
  ON public.list_kamar FOR UPDATE
  USING (
    id_list_hotel IN (
      SELECT id_list_hotel FROM public.list_hotel
      WHERE id_company_profile = public.get_my_company_id()
    )
    OR public.is_admin()
  )
  WITH CHECK (
    id_list_hotel IN (
      SELECT id_list_hotel FROM public.list_hotel
      WHERE id_company_profile = public.get_my_company_id()
    )
    OR public.is_admin()
  );

CREATE POLICY "list_kamar: mitra delete own"
  ON public.list_kamar FOR DELETE
  USING (
    id_list_hotel IN (
      SELECT id_list_hotel FROM public.list_hotel
      WHERE id_company_profile = public.get_my_company_id()
    )
    OR public.is_admin()
  );


-- ─────────────────────────────────────────────────────────────
-- TABLE: deskripsi_hotel
--   • Public  : SELECT
--   • Mitra   : INSERT/UPDATE/DELETE deskripsi hotel miliknya
--   • Admin   : full access
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "deskripsi_hotel: public read"
  ON public.deskripsi_hotel FOR SELECT
  USING ( true );

CREATE POLICY "deskripsi_hotel: mitra insert own"
  ON public.deskripsi_hotel FOR INSERT
  WITH CHECK (
    id_list_hotel IN (
      SELECT id_list_hotel FROM public.list_hotel
      WHERE id_company_profile = public.get_my_company_id()
    )
    OR public.is_admin()
  );

CREATE POLICY "deskripsi_hotel: mitra update own"
  ON public.deskripsi_hotel FOR UPDATE
  USING (
    id_list_hotel IN (
      SELECT id_list_hotel FROM public.list_hotel
      WHERE id_company_profile = public.get_my_company_id()
    )
    OR public.is_admin()
  )
  WITH CHECK (
    id_list_hotel IN (
      SELECT id_list_hotel FROM public.list_hotel
      WHERE id_company_profile = public.get_my_company_id()
    )
    OR public.is_admin()
  );

CREATE POLICY "deskripsi_hotel: mitra delete own"
  ON public.deskripsi_hotel FOR DELETE
  USING (
    id_list_hotel IN (
      SELECT id_list_hotel FROM public.list_hotel
      WHERE id_company_profile = public.get_my_company_id()
    )
    OR public.is_admin()
  );


-- ─────────────────────────────────────────────────────────────
-- TABLE: history_purchase
--   • Customer : SELECT & INSERT hanya miliknya sendiri
--   • Mitra    : SELECT booking yang masuk ke hotel miliknya
--                UPDATE status (checkin/checkout) booking miliknya
--   • Admin    : full access
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "history_purchase: customer select own"
  ON public.history_purchase FOR SELECT
  USING (
    id_user = public.get_my_user_id()
    OR id_company_profile = public.get_my_company_id()
    OR public.is_admin()
  );

CREATE POLICY "history_purchase: customer insert own"
  ON public.history_purchase FOR INSERT
  WITH CHECK (
    id_user = public.get_my_user_id()
  );

CREATE POLICY "history_purchase: customer cancel own"
  ON public.history_purchase FOR UPDATE
  USING (
    -- Customer hanya boleh cancel booking miliknya
    ( id_user = public.get_my_user_id() AND status = 'confirmed' )
    -- Mitra boleh update status checkin/checkout
    OR id_company_profile = public.get_my_company_id()
    OR public.is_admin()
  )
  WITH CHECK (
    ( id_user = public.get_my_user_id() AND status = 'cancelled' )
    OR id_company_profile = public.get_my_company_id()
    OR public.is_admin()
  );

CREATE POLICY "history_purchase: admin delete"
  ON public.history_purchase FOR DELETE
  USING ( public.is_admin() );


-- ─────────────────────────────────────────────────────────────
-- TABLE: hotel_rating
--   • Public   : SELECT (rating publik)
--   • Customer : INSERT/UPDATE hanya review miliknya,
--                dan hanya jika booking sudah checkout
--   • Admin    : full access
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "hotel_rating: public read"
  ON public.hotel_rating FOR SELECT
  USING ( true );

CREATE POLICY "hotel_rating: customer insert own"
  ON public.hotel_rating FOR INSERT
  WITH CHECK (
    id_user = public.get_my_user_id()
    AND EXISTS (
      SELECT 1 FROM public.history_purchase hp
      WHERE hp.id_history = id_history
        AND hp.id_user    = public.get_my_user_id()
        AND hp.status     = 'checkout'
    )
  );

CREATE POLICY "hotel_rating: customer update own"
  ON public.hotel_rating FOR UPDATE
  USING  ( id_user = public.get_my_user_id() OR public.is_admin() )
  WITH CHECK ( id_user = public.get_my_user_id() OR public.is_admin() );

CREATE POLICY "hotel_rating: admin delete"
  ON public.hotel_rating FOR DELETE
  USING ( public.is_admin() );


-- ─────────────────────────────────────────────────────────────
-- TABLE: email_verification_codes
--   • User     : SELECT/INSERT/UPDATE hanya email miliknya
--   • Admin    : full access
--   CATATAN    : tabel ini sering diakses oleh service_role
--                (backend auth handler), bukan dari client langsung
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "email_verification_codes: owner access"
  ON public.email_verification_codes FOR ALL
  USING (
    email = (SELECT email FROM public."user" WHERE auth_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    email = (SELECT email FROM public."user" WHERE auth_id = auth.uid())
    OR public.is_admin()
  );


-- ─────────────────────────────────────────────────────────────
-- TABLE: session_login
--   • User  : SELECT/UPDATE sesi miliknya sendiri
--   • Admin : full access
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "session_login: owner access"
  ON public.session_login FOR SELECT
  USING ( id_user = public.get_my_user_id() OR public.is_admin() );

CREATE POLICY "session_login: owner insert"
  ON public.session_login FOR INSERT
  WITH CHECK ( id_user = public.get_my_user_id() OR public.is_admin() );

CREATE POLICY "session_login: owner update"
  ON public.session_login FOR UPDATE
  USING  ( id_user = public.get_my_user_id() OR public.is_admin() )
  WITH CHECK ( id_user = public.get_my_user_id() OR public.is_admin() );

CREATE POLICY "session_login: admin delete"
  ON public.session_login FOR DELETE
  USING ( public.is_admin() );


-- ─────────────────────────────────────────────────────────────
-- TABLE: session_login_backup
--   • Admin only (tabel backup internal)
-- ─────────────────────────────────────────────────────────────
CREATE POLICY "session_login_backup: admin only"
  ON public.session_login_backup FOR ALL
  USING ( public.is_admin() )
  WITH CHECK ( public.is_admin() );


-- ============================================================
-- SECTION 5: GRANT PRIVILEGES
-- Supabase menggunakan role: anon, authenticated, service_role
-- ============================================================

-- anon: hanya bisa baca data publik
GRANT SELECT ON public.list_hotel       TO anon;
GRANT SELECT ON public.list_kamar       TO anon;
GRANT SELECT ON public.detail_kamar     TO anon;
GRANT SELECT ON public.deskripsi_hotel  TO anon;
GRANT SELECT ON public.company_profile  TO anon;
GRANT SELECT ON public.hotel_rating     TO anon;

-- authenticated: akses penuh ke semua tabel (dikontrol oleh RLS)
GRANT SELECT, INSERT, UPDATE, DELETE ON public."user"                   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_profile          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.list_hotel               TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.detail_kamar             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.list_kamar               TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deskripsi_hotel          TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.history_purchase         TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_rating             TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_verification_codes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_login            TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_login_backup     TO authenticated;

-- Grant sequence usage
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- service_role bypass RLS secara default di Supabase (tidak perlu GRANT khusus)

-- ============================================================
-- END OF FILE
-- ============================================================