-- ============================================================================
-- LEGAL ADVICE PLATFORM - ENTERPRISE SQL SCHEMA & SEED DATA (PostgreSQL / ANSI SQL)
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'lawyer', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Lawyer Profiles Table
CREATE TABLE IF NOT EXISTS lawyer_profiles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    area_of_expertise VARCHAR(100) NOT NULL,
    experience_years INT NOT NULL DEFAULT 5,
    achievements TEXT,
    bio TEXT,
    avatar_url TEXT,
    hourly_rate NUMERIC(10, 2) DEFAULT 200.00,
    is_available BOOLEAN DEFAULT TRUE,
    rating NUMERIC(3, 2) DEFAULT 4.90,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Law Categories Table
CREATE TABLE IF NOT EXISTS law_categories (
    id VARCHAR(36) PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    short_desc TEXT NOT NULL,
    full_desc TEXT NOT NULL,
    key_services TEXT NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'Scale',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cases Table
CREATE TABLE IF NOT EXISTS cases (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    category_slug VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Review', 'Closed')),
    priority VARCHAR(20) DEFAULT 'Medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Documents Table (with BOLA/IDOR protection enforcement via user_id)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY,
    case_id VARCHAR(36) REFERENCES cases(id) ON DELETE SET NULL,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id VARCHAR(36) PRIMARY KEY,
    client_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lawyer_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id VARCHAR(36) REFERENCES cases(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    sender_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high performance & IDOR query speeds
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_lawyer_id ON cases(lawyer_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- ============================================================================
-- SEED DATA: 6 CORE LAW CATEGORIES
-- ============================================================================
INSERT INTO law_categories (id, slug, title, short_desc, full_desc, key_services, icon_name)
VALUES
('cat-1', 'family-law', 'Family Law', 
 'Compassionate counsel for divorce, child custody, alimony, and adoption proceedings.',
 'Family law covers sensitive and life-altering legal matters involving familial relationships. Our dedicated attorneys specialize in navigating divorce settlements, custody battles, marital agreements, and child support hearings with confidentiality and empathy.',
 'Divorce Mediation, Child Custody & Visitation, Alimony Support, Prenuptial Agreements, Guardianship & Adoption',
 'Users')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO law_categories (id, slug, title, short_desc, full_desc, key_services, icon_name)
VALUES
('cat-2', 'criminal-law', 'Criminal Law', 
 'Relentless defense for misdemeanors, felonies, DUI/DWIs, and white-collar defense.',
 'Facing criminal accusations requires immediate, strategic defense counsel. We protect your constitutional rights, challenge prosecutorial overreach, investigate state evidence, and represent you at trial or settlement negotiation.',
 'Felony & Misdemeanor Defense, White-Collar Crimes, DUI/Traffic Offenses, Bail & Bond Hearings, Record Expungement',
 'ShieldAlert')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO law_categories (id, slug, title, short_desc, full_desc, key_services, icon_name)
VALUES
('cat-3', 'real-estate-law', 'Real Estate Law', 
 'Guidance for commercial & residential transactions, lease disputes, and zoning issues.',
 'Whether purchasing real property, structuring a commercial lease, or dealing with title encumbrances, our property attorneys protect high-value assets and ensure regulatory compliance in transactions.',
 'Property Purchase Closings, Commercial Leases, Title Deeds & Liens, Boundary Disputes, Zoning & Land Use',
 'Building')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO law_categories (id, slug, title, short_desc, full_desc, key_services, icon_name)
VALUES
('cat-4', 'employment-law', 'Employment Law', 
 'Advocacy for wrongful termination, workplace harassment, wage disputes, and severance.',
 'Both employees and employers navigate an intricate web of federal and state labor statutes. We provide representation in wrongful termination, FLSA wage theft, discrimination, and non-compete agreements.',
 'Wrongful Termination, Sexual Harassment & Discrimination, Wage & Hour Claims, Severance Review, Non-Compete Clauses',
 'Briefcase')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO law_categories (id, slug, title, short_desc, full_desc, key_services, icon_name)
VALUES
('cat-5', 'business-law', 'Business Law', 
 'Corporate formation, governance, contract drafting, mergers, and intellectual property.',
 'From early-stage entity structuring to complex enterprise litigation and mergers & acquisitions, we serve as outside general counsel for businesses of all scales.',
 'LLC/Corp Formation, Contract Negotiation, IP & Trademark Licensing, M&A Advisory, Commercial Litigation',
 'FileText')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO law_categories (id, slug, title, short_desc, full_desc, key_services, icon_name)
VALUES
('cat-6', 'personal-injury-law', 'Personal Injury Law', 
 'Maximizing compensation for vehicular accidents, medical malpractice, and slip & falls.',
 'When negligence injures you or your family, you deserve aggressive advocacy against insurance firms. We secure damages for medical bills, pain and suffering, and lost income.',
 'Auto & Truck Collisions, Medical Malpractice, Slip and Fall Claims, Product Liability, Wrongful Death',
 'HeartPulse')
ON CONFLICT (slug) DO NOTHING;
