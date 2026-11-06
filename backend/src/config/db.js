import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

const { Pool } = pg;

let pool = null;
let isPostgresConnected = false;

// Relational Store with File-backed Persistence (cross-browser & persistent across restarts)
export const embeddedStore = {
  users: [],
  lawyer_profiles: [],
  law_categories: [],
  cases: [],
  documents: [],
  chat_sessions: [],
  chat_messages: []
};

// Safe disk write to data/store.json
export const persistStore = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(embeddedStore, null, 2), 'utf8');
  } catch (err) {
    console.error('🚨 [Database Persistence Error]:', err.message);
  }
};

// Seed default initial data into embedded storage
const initEmbeddedDefaults = async () => {
  // If data/store.json exists on disk, load directly from disk!
  if (fs.existsSync(STORE_FILE)) {
    try {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      embeddedStore.users = parsed.users || [];
      embeddedStore.lawyer_profiles = parsed.lawyer_profiles || [];
      embeddedStore.law_categories = parsed.law_categories || [];
      embeddedStore.cases = parsed.cases || [];
      embeddedStore.documents = parsed.documents || [];
      embeddedStore.chat_sessions = parsed.chat_sessions || [];
      embeddedStore.chat_messages = parsed.chat_messages || [];

      // Ensure Adv. Rahul Rawat is in store if missing
      const hasRahul = embeddedStore.users.some(u => u.email === 'rahul.rawat@legaladvice.com');
      if (!hasRahul) {
        await seedAdvocateRahul();
        persistStore();
      }
      return;
    } catch (e) {
      console.warn('⚠️ [Database] store.json corrupted, re-initializing defaults:', e.message);
    }
  }

  const defaultPasswordHash = await bcrypt.hash('LegalPass123!', 12);

  // 1. Seed Adv. Rahul Rawat & other Specialist Advocates
  const lawyers = [
    {
      id: 'lawyer-rahul',
      name: 'Adv. Rahul Rawat',
      email: 'rahul.rawat@legaladvice.com',
      password_hash: defaultPasswordHash,
      role: 'lawyer',
      created_at: new Date().toISOString(),
      profile: {
        id: 'prof-rahul',
        user_id: 'lawyer-rahul',
        license_no: 'D/1482/2018 (Bar Council of Delhi)',
        court: 'High Court of Delhi & Supreme Court of India',
        area_of_expertise: 'Criminal Law & Bail Specialist',
        experience_years: 9,
        achievements: '250+ Bail Approvals • Special Trial Counsel • Delhi Bar Member',
        bio: 'Senior Criminal Defense Counsel specializing in bail petitions, quashing, commercial fraud defense, and high-stakes trials.',
        avatar_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=300',
        hourly_rate: 2500.00,
        currency: '₹',
        is_available: true,
        rating: 4.97
      }
    },
    {
      id: 'lawyer-1',
      name: 'Elena Rostova, Esq.',
      email: 'elena.rostova@legaladvice.com',
      password_hash: defaultPasswordHash,
      role: 'lawyer',
      created_at: new Date().toISOString(),
      profile: {
        id: 'prof-1',
        user_id: 'lawyer-1',
        license_no: 'NY-489211 (State Bar of NY)',
        court: 'Federal Appeals & District Court',
        area_of_expertise: 'Criminal Law',
        experience_years: 14,
        achievements: 'Former Senior Public Defender • 94% Case Dismissal/Acquittal Rate',
        bio: 'Dedicated criminal defense advocate specializing in federal appeals, state felony trials, and complex constitutional defense.',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
        hourly_rate: 3000.00,
        currency: '₹',
        is_available: true,
        rating: 4.95
      }
    },
    {
      id: 'lawyer-2',
      name: 'Marcus Vance, Esq.',
      email: 'marcus.vance@legaladvice.com',
      password_hash: defaultPasswordHash,
      role: 'lawyer',
      created_at: new Date().toISOString(),
      profile: {
        id: 'prof-2',
        user_id: 'lawyer-2',
        license_no: 'CA-992144 (State Bar of California)',
        court: 'Commercial Division & NCLT',
        area_of_expertise: 'Business Law',
        experience_years: 18,
        achievements: 'Represented $2.4B+ in Cross-border M&A • Silicon Valley Top Corporate Counsel',
        bio: 'Corporate strategist focused on venture capital financings, joint ventures, regulatory compliance, and commercial contracts.',
        avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
        hourly_rate: 4500.00,
        currency: '₹',
        is_available: true,
        rating: 4.98
      }
    },
    {
      id: 'lawyer-3',
      name: 'Sarah Chen, Esq.',
      email: 'sarah.chen@legaladvice.com',
      password_hash: defaultPasswordHash,
      role: 'lawyer',
      created_at: new Date().toISOString(),
      profile: {
        id: 'prof-3',
        user_id: 'lawyer-3',
        license_no: 'D/8920/2015 (Family Court Roster)',
        court: 'Principal Family Courts & Mediation Centers',
        area_of_expertise: 'Family Law',
        experience_years: 11,
        achievements: 'Certified Matrimonial Arbitrator • 450+ High-Asset Divorces Settled Amicably',
        bio: 'Empathetic counsel for custody agreements, complex marital asset division, and family court mediation.',
        avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
        hourly_rate: 2200.00,
        currency: '₹',
        is_available: true,
        rating: 4.92
      }
    },
    {
      id: 'lawyer-4',
      name: 'David Reynolds, Esq.',
      email: 'david.reynolds@legaladvice.com',
      password_hash: defaultPasswordHash,
      role: 'lawyer',
      created_at: new Date().toISOString(),
      profile: {
        id: 'prof-4',
        user_id: 'lawyer-4',
        license_no: 'MA-310892 (RERA & Property Bar)',
        court: 'RERA Tribunal & Civil Court',
        area_of_expertise: 'Real Estate Law',
        experience_years: 15,
        achievements: 'Title Counsel for Major REITs • 1,200+ Conveyances Closed Safely',
        bio: 'Guiding developers, brokers, and residential buyers through zoning disputes, land acquisitions, and closing escrows.',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        hourly_rate: 2800.00,
        currency: '₹',
        is_available: true,
        rating: 4.88
      }
    }
  ];

  for (const l of lawyers) {
    embeddedStore.users.push({
      id: l.id,
      name: l.name,
      email: l.email,
      password_hash: l.password_hash,
      role: l.role,
      created_at: l.created_at
    });
    embeddedStore.lawyer_profiles.push(l.profile);
  }

  // 2. Seed Permanent Demo Client
  embeddedStore.users.push({
    id: 'client-demo-1',
    name: 'Alexander Wright',
    email: 'client@example.com',
    password_hash: defaultPasswordHash,
    role: 'client',
    created_at: new Date().toISOString()
  });

  // 3. Seed Law Categories
  embeddedStore.law_categories = [
    {
      id: 'cat-1',
      slug: 'family-law',
      title: 'Family Law',
      short_desc: 'Compassionate counsel for divorce, child custody, alimony, and adoption proceedings.',
      full_desc: 'Family law covers sensitive and life-altering legal matters involving familial relationships. Our dedicated attorneys specialize in navigating divorce settlements, custody battles, marital agreements, and child support hearings with confidentiality and empathy.',
      key_services: 'Divorce Mediation, Child Custody & Visitation, Alimony Support, Prenuptial Agreements, Guardianship & Adoption',
      icon_name: 'Users'
    },
    {
      id: 'cat-2',
      slug: 'criminal-law',
      title: 'Criminal Law',
      short_desc: 'Relentless defense for misdemeanors, felonies, DUI/DWIs, and white-collar defense.',
      full_desc: 'Facing criminal accusations requires immediate, strategic defense counsel. We protect your constitutional rights, challenge prosecutorial overreach, investigate state evidence, and represent you at trial or settlement negotiation.',
      key_services: 'Felony & Misdemeanor Defense, White-Collar Crimes, DUI/Traffic Offenses, Bail & Bond Hearings, Record Expungement',
      icon_name: 'ShieldAlert'
    },
    {
      id: 'cat-3',
      slug: 'real-estate-law',
      title: 'Real Estate Law',
      short_desc: 'Guidance for commercial & residential transactions, lease disputes, and zoning issues.',
      full_desc: 'Whether purchasing real property, structuring a commercial lease, or dealing with title encumbrances, our property attorneys protect high-value assets and ensure regulatory compliance in transactions.',
      key_services: 'Property Purchase Closings, Commercial Leases, Title Deeds & Liens, Boundary Disputes, Zoning & Land Use',
      icon_name: 'Building'
    },
    {
      id: 'cat-4',
      slug: 'employment-law',
      title: 'Employment Law',
      short_desc: 'Advocacy for wrongful termination, workplace harassment, wage disputes, and severance.',
      full_desc: 'Both employees and employers navigate an intricate web of federal and state labor statutes. We provide representation in wrongful termination, FLSA wage theft, discrimination, and non-compete agreements.',
      key_services: 'Wrongful Termination, Sexual Harassment & Discrimination, Wage & Hour Claims, Severance Review, Non-Compete Clauses',
      icon_name: 'Briefcase'
    },
    {
      id: 'cat-5',
      slug: 'business-law',
      title: 'Business Law',
      short_desc: 'Corporate formation, governance, contract drafting, mergers, and intellectual property.',
      full_desc: 'From early-stage entity structuring to complex enterprise litigation and mergers & acquisitions, we serve as outside general counsel for businesses of all scales.',
      key_services: 'LLC/Corp Formation, Contract Negotiation, IP & Trademark Licensing, M&A Advisory, Commercial Litigation',
      icon_name: 'FileText'
    },
    {
      id: 'cat-6',
      slug: 'personal-injury-law',
      title: 'Personal Injury Law',
      short_desc: 'Maximizing compensation for vehicular accidents, medical malpractice, and slip & falls.',
      full_desc: 'When negligence injures you or your family, you deserve aggressive advocacy against insurance firms. We secure damages for medical bills, pain and suffering, and lost income.',
      key_services: 'Auto & Truck Collisions, Medical Malpractice, Slip and Fall Claims, Product Liability, Wrongful Death',
      icon_name: 'HeartPulse'
    }
  ];

  // 4. Seed initial Demo Case
  embeddedStore.cases.push({
    id: 'case-demo-1',
    client_id: 'client-demo-1',
    lawyer_id: 'lawyer-rahul',
    category_slug: 'criminal-law',
    title: 'Urgent Anticipatory Bail Petition - Delhi High Court',
    description: 'Anticipatory bail petition filed under Section 438 CrPC regarding alleged corporate fraud allegations.',
    status: 'In Review',
    priority: 'High',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date().toISOString()
  });

  // 5. Seed initial Chat Session between Alexander and Adv. Rahul Rawat
  embeddedStore.chat_sessions.push({
    id: 'chat-demo-rahul',
    client_id: 'client-demo-1',
    lawyer_id: 'lawyer-rahul',
    case_id: 'case-demo-1',
    status: 'Active',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  });

  embeddedStore.chat_messages.push(
    {
      id: 'msg-1',
      session_id: 'chat-demo-rahul',
      sender_id: 'client-demo-1',
      message_text: 'Namaste Rahul Sir, I have uploaded the FIR copy and need urgent legal advice on anticipatory bail.',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString()
    },
    {
      id: 'msg-2',
      session_id: 'chat-demo-rahul',
      sender_id: 'lawyer-rahul',
      message_text: 'Namaste Alexander. I have reviewed the case particulars. Rest assured, we will prepare the petition today and move the High Court tomorrow morning.',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    }
  );

  // Persist to disk!
  persistStore();
};

const seedAdvocateRahul = async () => {
  const defaultPasswordHash = await bcrypt.hash('LegalPass123!', 12);
  embeddedStore.users.push({
    id: 'lawyer-rahul',
    name: 'Adv. Rahul Rawat',
    email: 'rahul.rawat@legaladvice.com',
    password_hash: defaultPasswordHash,
    role: 'lawyer',
    created_at: new Date().toISOString()
  });
  embeddedStore.lawyer_profiles.push({
    id: 'prof-rahul',
    user_id: 'lawyer-rahul',
    license_no: 'D/1482/2018 (Bar Council of Delhi)',
    court: 'High Court of Delhi & Supreme Court of India',
    area_of_expertise: 'Criminal Law & Bail Specialist',
    experience_years: 9,
    achievements: '250+ Bail Approvals • Special Trial Counsel • Delhi Bar Member',
    bio: 'Senior Criminal Defense Counsel specializing in bail petitions, quashing, commercial fraud defense, and high-stakes trials.',
    avatar_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=300',
    hourly_rate: 2500.00,
    currency: '₹',
    is_available: true,
    rating: 4.97
  });
};

// Initialize DB connection & disk persistence
export const initDB = async () => {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.includes('placeholder')) {
    try {
      pool = new Pool({
        connectionString: dbUrl,
        connectionTimeoutMillis: 3000,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      });
      const client = await pool.connect();
      client.release();
      isPostgresConnected = true;
      console.log('✅ [Database] Successfully connected to PostgreSQL Pool.');

      const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await pool.query(schemaSql);
        console.log('✅ [Database] Schema and seeds synced with PostgreSQL.');
      }
      return;
    } catch (err) {
      console.warn(`⚠️ [Database] PostgreSQL connection failed (${err.message}). Using Persistent JSON Engine.`);
      isPostgresConnected = false;
      pool = null;
    }
  }

  await initEmbeddedDefaults();
  console.log(`⚡ [Database] Running on Persistent Storage Engine at: ${STORE_FILE}`);
};

// Universal Parameterized Query Interface
export const query = async (text, params = []) => {
  if (isPostgresConnected && pool) {
    try {
      return await pool.query(text, params);
    } catch (error) {
      console.error('[Database Error in PostgreSQL]:', error.message, 'SQL:', text);
      throw error;
    }
  }

  // --- Persistent Relational Query Simulator ---
  await initEmbeddedDefaults();
  const sql = text.trim();
  const normalized = sql.replace(/\s+/g, ' ');

  // 1. SELECT queries
  if (/^SELECT/i.test(normalized)) {
    // USERS by ID
    if (/FROM users WHERE id = \$1/i.test(normalized)) {
      const u = embeddedStore.users.find(x => x.id === params[0]);
      return { rows: u ? [{ ...u }] : [], rowCount: u ? 1 : 0 };
    }
    // USERS by EMAIL
    if (/FROM users WHERE email = \$1/i.test(normalized)) {
      const u = embeddedStore.users.find(x => x.email.toLowerCase() === (params[0] || '').toLowerCase());
      return { rows: u ? [{ ...u }] : [], rowCount: u ? 1 : 0 };
    }

    // ALL USERS
    if (/FROM users/i.test(normalized) && !/lawyer_profiles/i.test(normalized)) {
      return { rows: [...embeddedStore.users], rowCount: embeddedStore.users.length };
    }

    // LAW CATEGORIES
    if (/FROM law_categories/i.test(normalized)) {
      if (/WHERE slug = \$1/i.test(normalized)) {
        const cat = embeddedStore.law_categories.find(c => c.slug === params[0]);
        return { rows: cat ? [cat] : [], rowCount: cat ? 1 : 0 };
      }
      return { rows: [...embeddedStore.law_categories], rowCount: embeddedStore.law_categories.length };
    }

    // LAWYERS & PROFILES
    if (/FROM lawyer_profiles/i.test(normalized) || (/FROM users/i.test(normalized) && /lawyer/i.test(normalized))) {
      let list = embeddedStore.lawyer_profiles.map(p => {
        const u = embeddedStore.users.find(user => user.id === p.user_id) || {};
        return {
          id: p.id,
          user_id: p.user_id,
          name: u.name || 'Advocate',
          email: u.email || '',
          role: u.role || 'lawyer',
          license_no: p.license_no || 'Verified Bar Member',
          court: p.court || 'High Court & District Courts',
          area_of_expertise: p.area_of_expertise || 'General Legal Counsel',
          experience_years: p.experience_years || 5,
          achievements: p.achievements || '',
          bio: p.bio || '',
          avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=300',
          hourly_rate: p.hourly_rate || 2000.00,
          currency: p.currency || '₹',
          is_available: p.is_available !== undefined ? p.is_available : true,
          rating: p.rating || 4.90
        };
      });

      if (/WHERE p\.user_id = \$1|WHERE user_id = \$1/i.test(normalized)) {
        const found = list.find(l => l.user_id === params[0]);
        return { rows: found ? [found] : [], rowCount: found ? 1 : 0 };
      }

      if (/WHERE area_of_expertise ILIKE \$1|WHERE p\.area_of_expertise = \$1/i.test(normalized)) {
        const filtered = list.filter(l => l.area_of_expertise.toLowerCase() === (params[0] || '').toLowerCase());
        return { rows: filtered, rowCount: filtered.length };
      }

      return { rows: list, rowCount: list.length };
    }

    // CASES
    if (/FROM cases/i.test(normalized)) {
      let result = [...embeddedStore.cases];
      if (/WHERE id = \$1/i.test(normalized)) {
        result = result.filter(c => c.id === params[0]);
      } else if (/WHERE client_id = \$1/i.test(normalized)) {
        result = result.filter(c => c.client_id === params[0]);
      } else if (/WHERE lawyer_id = \$1/i.test(normalized)) {
        result = result.filter(c => c.lawyer_id === params[0]);
      }
      const enriched = result.map(c => {
        const client = embeddedStore.users.find(u => u.id === c.client_id);
        const lawyer = embeddedStore.users.find(u => u.id === c.lawyer_id);
        return {
          ...c,
          client_name: client ? client.name : 'Client',
          lawyer_name: lawyer ? lawyer.name : 'Unassigned'
        };
      });
      return { rows: enriched, rowCount: enriched.length };
    }

    // DOCUMENTS
    if (/FROM documents/i.test(normalized)) {
      let result = [...embeddedStore.documents];
      if (/WHERE id = \$1/i.test(normalized)) {
        result = result.filter(d => d.id === params[0]);
      } else if (/WHERE user_id = \$1/i.test(normalized)) {
        result = result.filter(d => d.user_id === params[0]);
      } else if (/WHERE case_id = \$1/i.test(normalized)) {
        result = result.filter(d => d.case_id === params[0]);
      }
      return { rows: result, rowCount: result.length };
    }

    // CHAT SESSIONS (Strict Privacy & Direct Session Isolation)
    if (/FROM chat_sessions/i.test(normalized)) {
      let result = [...embeddedStore.chat_sessions];
      if (/\b(?:s\.)?id = \$1/i.test(normalized)) {
        result = result.filter(s => s.id === params[0]);
      } else if (/client_id/i.test(normalized) && /lawyer_id/i.test(normalized) && params.length >= 2) {
        result = result.filter(s => 
          (s.client_id === params[0] && s.lawyer_id === params[1]) ||
          (s.client_id === params[1] && s.lawyer_id === params[0])
        );
      } else if (/\b(?:s\.)?client_id = \$1/i.test(normalized) || /\b(?:s\.)?lawyer_id = \$1/i.test(normalized)) {
        result = result.filter(s => s.client_id === params[0] || s.lawyer_id === params[0]);
      }
      const enriched = result.map(s => {
        const client = embeddedStore.users.find(u => u.id === s.client_id);
        const lawyer = embeddedStore.users.find(u => u.id === s.lawyer_id);
        const lawyerProf = embeddedStore.lawyer_profiles.find(p => p.user_id === s.lawyer_id);
        return {
          ...s,
          client_name: client ? client.name : 'Client',
          client_avatar: client ? (client.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200') : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          client_bio: client ? (client.bio || 'Petitioner Client') : 'Petitioner Client',
          client_email: client ? client.email : '',
          lawyer_name: lawyer ? lawyer.name : 'Advocate',
          lawyer_avatar: (lawyerProf && lawyerProf.avatar_url) ? lawyerProf.avatar_url : (lawyer && lawyer.avatar_url ? lawyer.avatar_url : 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=300'),
          lawyer_bio: lawyerProf ? (lawyerProf.bio || 'Admitted advocate with trial standing') : 'Admitted advocate with trial standing',
          lawyer_court: lawyerProf ? (lawyerProf.court || 'High Court of Delhi') : 'High Court of Delhi',
          lawyer_license: lawyerProf ? (lawyerProf.license_no || 'Verified Bar License') : 'Verified Bar License',
          lawyer_experience: lawyerProf ? (lawyerProf.experience_years || 5) : 5,
          area_of_expertise: lawyerProf ? (lawyerProf.area_of_expertise || 'Legal Counsel') : 'Legal Counsel'
        };
      });
      return { rows: enriched, rowCount: enriched.length };
    }

    // CHAT MESSAGES (Strict 1-to-1 End-to-End Session Isolation)
    if (/FROM chat_messages/i.test(normalized)) {
      let result = [...embeddedStore.chat_messages];
      if (/\b(?:m\.)?id = \$1/i.test(normalized)) {
        result = result.filter(m => m.id === params[0]);
      } else if (/session_id = \$1/i.test(normalized)) {
        result = result.filter(m => m.session_id === params[0]);
      }
      const enriched = result.map(m => {
        const sender = embeddedStore.users.find(u => u.id === m.sender_id);
        const lawyerProf = sender && sender.role === 'lawyer' ? embeddedStore.lawyer_profiles.find(p => p.user_id === sender.id) : null;
        return {
          ...m,
          sender_name: sender ? sender.name : 'User',
          sender_role: sender ? sender.role : 'client',
          sender_avatar: (lawyerProf && lawyerProf.avatar_url) ? lawyerProf.avatar_url : (sender ? sender.avatar_url : null)
        };
      });
      enriched.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      return { rows: enriched, rowCount: enriched.length };
    }
  }

  // 2. INSERT queries (Permanently Persisted to Disk!)
  if (/^INSERT INTO/i.test(normalized)) {
    if (/INSERT INTO users/i.test(normalized)) {
      const [id, name, email, password_hash, role] = params;
      const newUser = { id, name, email, password_hash, role, created_at: new Date().toISOString() };
      embeddedStore.users.push(newUser);
      persistStore();
      return { rows: [newUser], rowCount: 1 };
    }
    if (/INSERT INTO lawyer_profiles/i.test(normalized)) {
      // params: [id, user_id, area_of_expertise, experience_years, achievements, bio, hourly_rate, license_no, court, avatar_url]
      const [id, user_id, area_of_expertise, experience_years, achievements, bio, hourly_rate, license_no, court, avatar_url] = params;
      const newProf = {
        id,
        user_id,
        area_of_expertise: area_of_expertise || 'Criminal Law & General Counsel',
        experience_years: parseInt(experience_years || 5, 10),
        achievements: achievements || 'Bar Council Admitted Advocate',
        bio: bio || 'Dedicated advocate committed to constitutional justice.',
        hourly_rate: parseFloat(hourly_rate || 2000.00),
        license_no: license_no || 'Verified Bar Council Advocate',
        court: court || 'High Court & District Sessions',
        avatar_url: avatar_url || 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=300',
        currency: '₹',
        is_available: true,
        rating: 4.90,
        updated_at: new Date().toISOString()
      };
      embeddedStore.lawyer_profiles.push(newProf);
      persistStore();
      return { rows: [newProf], rowCount: 1 };
    }
    if (/INSERT INTO cases/i.test(normalized)) {
      const [id, client_id, lawyer_id, category_slug, title, description, priority] = params;
      const newCase = {
        id,
        client_id,
        lawyer_id: lawyer_id || null,
        category_slug,
        title,
        description,
        status: 'Open',
        priority: priority || 'Medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      embeddedStore.cases.push(newCase);
      persistStore();
      return { rows: [newCase], rowCount: 1 };
    }
    if (/INSERT INTO documents/i.test(normalized)) {
      const [id, case_id, user_id, original_name, stored_name, file_path, file_size, mime_type] = params;
      const newDoc = {
        id,
        case_id: case_id || null,
        user_id,
        original_name,
        stored_name,
        file_path,
        file_size,
        mime_type,
        created_at: new Date().toISOString()
      };
      embeddedStore.documents.push(newDoc);
      persistStore();
      return { rows: [newDoc], rowCount: 1 };
    }
    if (/INSERT INTO chat_sessions/i.test(normalized)) {
      const [id, client_id, lawyer_id, case_id] = params;
      const newSession = {
        id,
        client_id,
        lawyer_id,
        case_id: case_id || null,
        status: 'Active',
        created_at: new Date().toISOString()
      };
      embeddedStore.chat_sessions.push(newSession);
      persistStore();
      return { rows: [newSession], rowCount: 1 };
    }
    if (/INSERT INTO chat_messages/i.test(normalized)) {
      const [id, session_id, sender_id, message_text] = params;
      const newMsg = {
        id,
        session_id,
        sender_id,
        message_text,
        created_at: new Date().toISOString()
      };
      embeddedStore.chat_messages.push(newMsg);
      persistStore();
      return { rows: [newMsg], rowCount: 1 };
    }
  }

  // 3. UPDATE queries (Permanently Persisted to Disk!)
  if (/^UPDATE/i.test(normalized)) {
    // UPDATE users (name/avatar for clients)
    if (/UPDATE users SET/i.test(normalized)) {
      const user = embeddedStore.users.find(u => u.id === params[params.length - 1]);
      if (user) {
        if (/name/i.test(normalized) && params[0] !== undefined) user.name = params[0];
        if (/avatar_url/i.test(normalized)) {
          const aIdx = normalized.indexOf('avatar_url');
          if (aIdx >= 0) user.avatar_url = params[0];
        }
        persistStore();
        return { rows: [user], rowCount: 1 };
      }
    }
    if (/UPDATE cases SET status/i.test(normalized)) {
      const [status, caseId] = params;
      const c = embeddedStore.cases.find(x => x.id === caseId);
      if (c) {
        c.status = status;
        c.updated_at = new Date().toISOString();
        persistStore();
        return { rows: [c], rowCount: 1 };
      }
    }
    if (/UPDATE lawyer_profiles/i.test(normalized)) {
      if (/SET is_available = \$1 WHERE user_id = \$2/i.test(normalized)) {
        const [available, userId] = params;
        const p = embeddedStore.lawyer_profiles.find(x => x.user_id === userId);
        if (p) {
          p.is_available = Boolean(available);
          p.updated_at = new Date().toISOString();
          persistStore();
          return { rows: [p], rowCount: 1 };
        }
      }
      // avatar_url update for lawyer profile
      if (/SET avatar_url/i.test(normalized)) {
        const [avatar, uid] = params;
        const pf = embeddedStore.lawyer_profiles.find(x => x.user_id === uid);
        if (pf) { pf.avatar_url = avatar; pf.updated_at = new Date().toISOString(); persistStore(); return { rows: [pf], rowCount: 1 }; }
      }
      const [area, exp, achievements, bio, rate, available, userId] = params;
      const p = embeddedStore.lawyer_profiles.find(x => x.user_id === userId);
      if (p) {
        if (area !== undefined) p.area_of_expertise = area;
        if (exp !== undefined) p.experience_years = exp;
        if (achievements !== undefined) p.achievements = achievements;
        if (bio !== undefined) p.bio = bio;
        if (rate !== undefined) p.hourly_rate = rate;
        if (available !== undefined) p.is_available = available;
        p.updated_at = new Date().toISOString();
        persistStore();
        return { rows: [p], rowCount: 1 };
      }
    }
  }

  // 4. DELETE queries (Permanently Persisted to Disk!)
  if (/^DELETE/i.test(normalized)) {
    if (/DELETE FROM documents WHERE id = \$1/i.test(normalized)) {
      const idx = embeddedStore.documents.findIndex(d => d.id === params[0]);
      if (idx !== -1) {
        const deleted = embeddedStore.documents.splice(idx, 1);
        persistStore();
        return { rows: deleted, rowCount: 1 };
      }
    }
  }

  return { rows: [], rowCount: 0 };
};

export default { query, initDB, persistStore, embeddedStore };
