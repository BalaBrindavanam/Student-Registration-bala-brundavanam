import fs from 'fs';
import path from 'path';
import { District, Mandal, Village, School, Student, AttendanceRecord, AttendanceSummary } from '../src/types';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: 'admin' | 'user';
  provider: 'google' | 'password';
  picture?: string;
  createdAt: string;
}

const DEFAULT_ADMIN: UserAccount = {
  id: 'user-admin-bala',
  email: 'bala@gmail.com',
  name: 'Bala (Admin)',
  password: 'Bala$2026',
  role: 'admin',
  provider: 'password',
  createdAt: new Date().toISOString()
};

interface DatabaseSchema {
  districts: District[];
  mandals: Mandal[];
  villages: Village[];
  schools: School[];
  students: Student[];
  attendance?: AttendanceRecord[];
  users?: UserAccount[];
  sequenceCounter: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Initial seed data for Andhra Pradesh
const INITIAL_DISTRICTS: District[] = [
  { id: 'dist-kurnool', name: 'Kurnool', code: 'KUR' },
  { id: 'dist-alluri-sitharama-raju', name: 'Alluri Sitharama Raju', code: 'ASR' },
  { id: 'dist-anakapalli', name: 'Anakapalli', code: 'AKP' },
  { id: 'dist-ananthapuramu', name: 'Ananthapuramu', code: 'ATP' },
  { id: 'dist-annamayya', name: 'Annamayya', code: 'ANN' },
  { id: 'dist-bapatla', name: 'Bapatla', code: 'BPT' },
  { id: 'dist-chittoor', name: 'Chittoor', code: 'CTR' },
  { id: 'dist-konaseema', name: 'Dr. B.R. Ambedkar Konaseema', code: 'KNS' },
  { id: 'dist-east-godavari', name: 'East Godavari', code: 'EG' },
  { id: 'dist-eluru', name: 'Eluru', code: 'ELR' },
  { id: 'dist-guntur', name: 'Guntur', code: 'GNT' },
  { id: 'dist-kakinada', name: 'Kakinada', code: 'KKD' },
  { id: 'dist-krishna', name: 'Krishna', code: 'KRI' },
  { id: 'dist-nandyal', name: 'Nandyal', code: 'NDL' },
  { id: 'dist-ntr', name: 'NTR (Vijayawada)', code: 'NTR' },
  { id: 'dist-palnadu', name: 'Palnadu', code: 'PLN' },
  { id: 'dist-parvathipuram', name: 'Parvathipuram Manyam', code: 'PVM' },
  { id: 'dist-prakasam', name: 'Prakasam', code: 'PKM' },
  { id: 'dist-spsr-nellore', name: 'Sri Potti Sriramulu Nellore', code: 'NLR' },
  { id: 'dist-sri-sathya-sai', name: 'Sri Sathya Sai', code: 'SSS' },
  { id: 'dist-srikakulam', name: 'Srikakulam', code: 'SKL' },
  { id: 'dist-tirupati', name: 'Tirupati', code: 'TPT' },
  { id: 'dist-visakhapatnam', name: 'Visakhapatnam', code: 'VSP' },
  { id: 'dist-vizianagaram', name: 'Vizianagaram', code: 'VZM' },
  { id: 'dist-west-godavari', name: 'West Godavari', code: 'WG' },
  { id: 'dist-ysr-kadapa', name: 'YSR Kadapa', code: 'YSR' },
];

const INITIAL_MANDALS: Mandal[] = [
  // Kurnool District Mandals
  { id: 'mnd-mantralayam', districtId: 'dist-kurnool', name: 'Mantralayam' },
  { id: 'mnd-kurnool-urban', districtId: 'dist-kurnool', name: 'Kurnool Urban' },
  { id: 'mnd-adoni', districtId: 'dist-kurnool', name: 'Adoni' },
  { id: 'mnd-yemmiganur', districtId: 'dist-kurnool', name: 'Yemmiganur' },
  { id: 'mnd-kodumur', districtId: 'dist-kurnool', name: 'Kodumur' },
  { id: 'mnd-pattikonda', districtId: 'dist-kurnool', name: 'Pattikonda' },
  { id: 'mnd-dhone', districtId: 'dist-kurnool', name: 'Dhone' },
  { id: 'mnd-alur', districtId: 'dist-kurnool', name: 'Alur' },
  { id: 'mnd-aspari', districtId: 'dist-kurnool', name: 'Aspari' },
  { id: 'mnd-holagunda', districtId: 'dist-kurnool', name: 'Holagunda' },
  { id: 'mnd-kowthalam', districtId: 'dist-kurnool', name: 'Kowthalam' },
  { id: 'mnd-nandavaram', districtId: 'dist-kurnool', name: 'Nandavaram' },
  { id: 'mnd-pedda-kadubur', districtId: 'dist-kurnool', name: 'Pedda Kadubur' },
  { id: 'mnd-gudur-kur', districtId: 'dist-kurnool', name: 'Gudur' },
  { id: 'mnd-orvakal', districtId: 'dist-kurnool', name: 'Orvakal' },
  { id: 'mnd-veldurthi', districtId: 'dist-kurnool', name: 'Veldurthi' },
  { id: 'mnd-c-belagal', districtId: 'dist-kurnool', name: 'C.Belagal' },

  // Guntur District Mandals
  { id: 'mnd-guntur-east', districtId: 'dist-guntur', name: 'Guntur East' },
  { id: 'mnd-guntur-west', districtId: 'dist-guntur', name: 'Guntur West' },
  { id: 'mnd-tenali', districtId: 'dist-guntur', name: 'Tenali' },
  { id: 'mnd-mangalagiri', districtId: 'dist-guntur', name: 'Mangalagiri' },
  { id: 'mnd-tadikonda', districtId: 'dist-guntur', name: 'Tadikonda' },

  // NTR (Vijayawada) Mandals
  { id: 'mnd-vijayawada-central', districtId: 'dist-ntr', name: 'Vijayawada Central' },
  { id: 'mnd-vijayawada-east', districtId: 'dist-ntr', name: 'Vijayawada East' },
  { id: 'mnd-ibrahimpatnam', districtId: 'dist-ntr', name: 'Ibrahimpatnam' },
  { id: 'mnd-jaggayyapeta', districtId: 'dist-ntr', name: 'Jaggayyapeta' },

  // Visakhapatnam Mandals
  { id: 'mnd-vizag-urban', districtId: 'dist-visakhapatnam', name: 'Visakhapatnam Urban' },
  { id: 'mnd-gajuwaka', districtId: 'dist-visakhapatnam', name: 'Gajuwaka' },
  { id: 'mnd-bheemunipatnam', districtId: 'dist-visakhapatnam', name: 'Bheemunipatnam' },

  // Tirupati Mandals
  { id: 'mnd-tirupati-urban', districtId: 'dist-tirupati', name: 'Tirupati Urban' },
  { id: 'mnd-chandragiri', districtId: 'dist-tirupati', name: 'Chandragiri' },
  { id: 'mnd-srikalahasti', districtId: 'dist-tirupati', name: 'Srikalahasti' },

  // Ananthapuramu Mandals
  { id: 'mnd-ananthapur-urban', districtId: 'dist-ananthapuramu', name: 'Ananthapuramu Urban' },
  { id: 'mnd-dharmavaram', districtId: 'dist-ananthapuramu', name: 'Dharmavaram' },
  { id: 'mnd-tadipatri', districtId: 'dist-ananthapuramu', name: 'Tadipatri' },

  // YSR Kadapa Mandals
  { id: 'mnd-kadapa-urban', districtId: 'dist-ysr-kadapa', name: 'Kadapa Urban' },
  { id: 'mnd-proddatur', districtId: 'dist-ysr-kadapa', name: 'Proddatur' },
  { id: 'mnd-pulivendula', districtId: 'dist-ysr-kadapa', name: 'Pulivendula' },

  // Krishna Mandals
  { id: 'mnd-machilipatnam', districtId: 'dist-krishna', name: 'Machilipatnam' },
  { id: 'mnd-gudivada', districtId: 'dist-krishna', name: 'Gudivada' },

  // Nandyal Mandals
  { id: 'mnd-nandyal-urban', districtId: 'dist-nandyal', name: 'Nandyal Urban' },
  { id: 'mnd-allagadda', districtId: 'dist-nandyal', name: 'Allagadda' }
];

const INITIAL_VILLAGES: Village[] = [
  // Mantralayam Mandal Villages (Official hierarchy: Kurnool -> Mantralayam -> Madhavaram)
  { id: 'vil-madhavaram', mandalId: 'mnd-mantralayam', name: 'Madhavaram' },
  { id: 'vil-mantralayam', mandalId: 'mnd-mantralayam', name: 'Mantralayam' },
  { id: 'vil-chetnihalli', mandalId: 'mnd-mantralayam', name: 'Chetnihalli' },
  { id: 'vil-basapuram', mandalId: 'mnd-mantralayam', name: 'Basapuram' },
  { id: 'vil-chilakaladoni', mandalId: 'mnd-mantralayam', name: 'Chilakaladoni' },
  { id: 'vil-kachapuram', mandalId: 'mnd-mantralayam', name: 'Kachapuram' },
  { id: 'vil-rampuram', mandalId: 'mnd-mantralayam', name: 'Rampuram' },
  { id: 'vil-suvarnagiri', mandalId: 'mnd-mantralayam', name: 'Suvarnagiri' },
  { id: 'vil-vannedoddi', mandalId: 'mnd-mantralayam', name: 'Vannedoddi' },
  { id: 'vil-budur', mandalId: 'mnd-mantralayam', name: 'Budur' },
  { id: 'vil-tungabhadra', mandalId: 'mnd-mantralayam', name: 'Tungabhadra' },

  // Kurnool Urban Villages / Localities
  { id: 'vil-kurnool-proper', mandalId: 'mnd-kurnool-urban', name: 'Kurnool Proper' },
  { id: 'vil-kallur', mandalId: 'mnd-kurnool-urban', name: 'Kallur' },
  { id: 'vil-b-camp', mandalId: 'mnd-kurnool-urban', name: 'B-Camp' },
  { id: 'vil-joharapuram', mandalId: 'mnd-kurnool-urban', name: 'Joharapuram' },

  // Adoni Villages
  { id: 'vil-adoni-town', mandalId: 'mnd-adoni', name: 'Adoni Town' },
  { id: 'vil-mandagiri', mandalId: 'mnd-adoni', name: 'Mandagiri' },
  { id: 'vil-isvi', mandalId: 'mnd-adoni', name: 'Isvi' },
  { id: 'vil-basarakodu', mandalId: 'mnd-adoni', name: 'Basarakodu' },

  // Yemmiganur Villages
  { id: 'vil-yemmiganur-town', mandalId: 'mnd-yemmiganur', name: 'Yemmiganur Town' },
  { id: 'vil-banavasi', mandalId: 'mnd-yemmiganur', name: 'Banavasi' },
  { id: 'vil-gudikal', mandalId: 'mnd-yemmiganur', name: 'Gudikal' },

  // Kodumur Villages
  { id: 'vil-kodumur-proper', mandalId: 'mnd-kodumur', name: 'Kodumur' },
  { id: 'vil-pyalakurthy', mandalId: 'mnd-kodumur', name: 'Pyalakurthy' },

  // Guntur East / West / Tenali / Mangalagiri
  { id: 'vil-guntur-collectorate', mandalId: 'mnd-guntur-east', name: 'Old Guntur' },
  { id: 'vil-guntur-brodipet', mandalId: 'mnd-guntur-west', name: 'Brodipet' },
  { id: 'vil-tenali-town', mandalId: 'mnd-tenali', name: 'Tenali Town' },
  { id: 'vil-mangalagiri-town', mandalId: 'mnd-mangalagiri', name: 'Mangalagiri Town' },

  // NTR / Vijayawada
  { id: 'vil-governorpet', mandalId: 'mnd-vijayawada-central', name: 'Governorpet' },
  { id: 'vil-benz-circle', mandalId: 'mnd-vijayawada-east', name: 'Benz Circle' },
  { id: 'vil-ibrahimpatnam-vil', mandalId: 'mnd-ibrahimpatnam', name: 'Ibrahimpatnam' },

  // Visakhapatnam
  { id: 'vil-vizag-beach-road', mandalId: 'mnd-vizag-urban', name: 'Maharanipeta' },
  { id: 'vil-gajuwaka-junction', mandalId: 'mnd-gajuwaka', name: 'Gajuwaka Junction' },
  { id: 'vil-bheemili-beach', mandalId: 'mnd-bheemunipatnam', name: 'Bheemili' },

  // Tirupati
  { id: 'vil-tirupati-proper', mandalId: 'mnd-tirupati-urban', name: 'Tirupati Main' },
  { id: 'vil-chandragiri-fort', mandalId: 'mnd-chandragiri', name: 'Chandragiri' },

  // Ananthapuramu
  { id: 'vil-atp-town', mandalId: 'mnd-ananthapur-urban', name: 'Ananthapur City' },
  { id: 'vil-dharmavaram-town', mandalId: 'mnd-dharmavaram', name: 'Dharmavaram Town' }
];

const INITIAL_SCHOOLS: School[] = [
  // Madhavaram Schools (Kurnool -> Mantralayam -> Madhavaram)
  // Specific real schools for Madhavaram Village
  {
    id: 'sch-madhavaram-zphs',
    villageId: 'vil-madhavaram',
    name: 'Zilla Parishad High School (ZPHS), Madhavaram',
    type: 'Zilla Parishad'
  },
  {
    id: 'sch-madhavaram-mpps-main',
    villageId: 'vil-madhavaram',
    name: 'Mandal Parishad Primary School (MPPS Main), Madhavaram',
    type: 'Mandal Parishad'
  },
  {
    id: 'sch-madhavaram-mpps-hw',
    villageId: 'vil-madhavaram',
    name: 'MPPS Madhavaram Harijana Wada (H.W.)',
    type: 'Mandal Parishad'
  },
  {
    id: 'sch-madhavaram-mpps-urdu',
    villageId: 'vil-madhavaram',
    name: 'MPPS Madhavaram Urdu Medium School',
    type: 'Mandal Parishad'
  },
  {
    id: 'sch-madhavaram-raghavendra',
    villageId: 'vil-madhavaram',
    name: 'Sri Raghavendra English Medium School, Madhavaram',
    type: 'Private'
  },

  // Mantralayam Village Schools
  {
    id: 'sch-mantralayam-zphs',
    villageId: 'vil-mantralayam',
    name: 'Zilla Parishad High School (ZPHS), Mantralayam',
    type: 'Zilla Parishad'
  },
  {
    id: 'sch-mantralayam-mpps',
    villageId: 'vil-mantralayam',
    name: 'Mandal Parishad Primary School (MPPS), Mantralayam',
    type: 'Mandal Parishad'
  },
  {
    id: 'sch-mantralayam-guru-sarvabhouma',
    villageId: 'vil-mantralayam',
    name: 'Guru Sarvabhouma High School, Mantralayam',
    type: 'Aided'
  },
  {
    id: 'sch-mantralayam-kgbv',
    villageId: 'vil-mantralayam',
    name: 'Kasturba Gandhi Balika Vidyalaya (KGBV), Mantralayam',
    type: 'Government'
  },
  {
    id: 'sch-mantralayam-sharada',
    villageId: 'vil-mantralayam',
    name: 'Sri Sharada Vidyaniketan, Mantralayam',
    type: 'Private'
  },

  // Chetnihalli Schools
  {
    id: 'sch-chetnihalli-mpps',
    villageId: 'vil-chetnihalli',
    name: 'Mandal Parishad Primary School (MPPS), Chetnihalli',
    type: 'Mandal Parishad'
  },

  // Basapuram Schools
  {
    id: 'sch-basapuram-zphs',
    villageId: 'vil-basapuram',
    name: 'Zilla Parishad High School (ZPHS), Basapuram',
    type: 'Zilla Parishad'
  },
  {
    id: 'sch-basapuram-mpps',
    villageId: 'vil-basapuram',
    name: 'Mandal Parishad Primary School (MPPS), Basapuram',
    type: 'Mandal Parishad'
  },

  // Chilakaladoni Schools
  {
    id: 'sch-chilakaladoni-mpps',
    villageId: 'vil-chilakaladoni',
    name: 'Mandal Parishad Primary School (MPPS), Chilakaladoni',
    type: 'Mandal Parishad'
  },

  // Kurnool Proper / Kallur Schools
  {
    id: 'sch-kurnool-gov-city-hs',
    villageId: 'vil-kurnool-proper',
    name: 'Government Model Boys High School, Kurnool',
    type: 'Government'
  },
  {
    id: 'sch-kurnool-st-josephs',
    villageId: 'vil-kurnool-proper',
    name: 'St. Joseph\'s Girls High School, Kurnool',
    type: 'Aided'
  },
  {
    id: 'sch-kallur-zphs',
    villageId: 'vil-kallur',
    name: 'Zilla Parishad High School, Kallur',
    type: 'Zilla Parishad'
  },
  {
    id: 'sch-b-camp-mhs',
    villageId: 'vil-b-camp',
    name: 'Municipal High School, B-Camp, Kurnool',
    type: 'Government'
  },

  // Adoni Schools
  {
    id: 'sch-adoni-muni-hs',
    villageId: 'vil-adoni-town',
    name: 'Municipal High School, Adoni',
    type: 'Government'
  },
  {
    id: 'sch-adoni-st-antony',
    villageId: 'vil-adoni-town',
    name: 'St. Antony\'s High School, Adoni',
    type: 'Aided'
  },

  // Yemmiganur Schools
  {
    id: 'sch-yemmiganur-zphs',
    villageId: 'vil-yemmiganur-town',
    name: 'Zilla Parishad High School, Yemmiganur',
    type: 'Zilla Parishad'
  },

  // Guntur Schools
  {
    id: 'sch-guntur-brodipet-zphs',
    villageId: 'vil-guntur-brodipet',
    name: 'Government High School, Brodipet, Guntur',
    type: 'Government'
  },
  {
    id: 'sch-mangalagiri-zphs',
    villageId: 'vil-mangalagiri-town',
    name: 'Zilla Parishad High School, Mangalagiri',
    type: 'Zilla Parishad'
  },

  // Vijayawada Schools
  {
    id: 'sch-vja-bishop-grassi',
    villageId: 'vil-governorpet',
    name: 'Bishop Grassi High School, Governorpet, Vijayawada',
    type: 'Aided'
  },
  {
    id: 'sch-vja-andhra-loyo',
    villageId: 'vil-benz-circle',
    name: 'Andhra Loyola High School, Benz Circle, Vijayawada',
    type: 'Aided'
  },

  // Visakhapatnam Schools
  {
    id: 'sch-vsp-kv-waltair',
    villageId: 'vil-vizag-beach-road',
    name: 'Kendriya Vidyalaya Waltair, Visakhapatnam',
    type: 'Government'
  },
  {
    id: 'sch-vsp-gajuwaka-zphs',
    villageId: 'vil-gajuwaka-junction',
    name: 'ZPHS Gajuwaka Main, Visakhapatnam',
    type: 'Zilla Parishad'
  },

  // Tirupati Schools
  {
    id: 'sch-tpt-sv-high-school',
    villageId: 'vil-tirupati-proper',
    name: 'Sri Venkateswara High School (TTD), Tirupati',
    type: 'Aided'
  }
];

// Initial seeded student for Madhavaram so search and profiles work immediately
const INITIAL_STUDENTS: Student[] = [
  {
    id: 'BBT000001',
    firstName: 'Sai Krishna',
    lastName: 'Kuruba',
    className: 'Class 8',
    schoolId: 'sch-madhavaram-zphs',
    schoolName: 'Zilla Parishad High School (ZPHS), Madhavaram',
    fatherName: 'Venkata Ramana',
    motherName: 'Lakshmi Devi',
    mobileNumber: '9848012345',
    colonyStreet: 'Ramanjaneya Temple Street',
    districtId: 'dist-kurnool',
    districtName: 'Kurnool',
    mandalId: 'mnd-mantralayam',
    mandalName: 'Mantralayam',
    villageId: 'vil-madhavaram',
    villageName: 'Madhavaram',
    registeredAt: '2026-09-01T09:30:00.000Z'
  }
];

class DatabaseManager {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.db = this.loadDatabase();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        // Verify structure integrity
        if (
          Array.isArray(parsed.districts) &&
          Array.isArray(parsed.mandals) &&
          Array.isArray(parsed.villages) &&
          Array.isArray(parsed.schools) &&
          Array.isArray(parsed.students)
        ) {
          let needsSave = false;

          if (!Array.isArray(parsed.attendance)) {
            parsed.attendance = [];
            needsSave = true;
          }

          if (!Array.isArray(parsed.users)) {
            parsed.users = [DEFAULT_ADMIN];
            needsSave = true;
          } else {
            // Ensure admin bala@gmail.com exists with password Bala$2026 and admin role
            const existingAdmin = parsed.users.find(u => u.email.toLowerCase() === 'bala@gmail.com');
            if (!existingAdmin) {
              parsed.users.push(DEFAULT_ADMIN);
              needsSave = true;
            } else {
              if (existingAdmin.password !== 'Bala$2026' || existingAdmin.role !== 'admin') {
                existingAdmin.password = 'Bala$2026';
                existingAdmin.role = 'admin';
                needsSave = true;
              }
            }
          }

          // Migrate any legacy STU-2026-XXXX IDs to BBT00000X format
          parsed.students = parsed.students.map((student, idx) => {
            if (student.id.startsWith('STU-')) {
              needsSave = true;
              const numericPart = student.id.split('-').pop() || String(idx + 1);
              const num = parseInt(numericPart, 10) || (idx + 1);
              return {
                ...student,
                id: `BBT${String(num).padStart(6, '0')}`
              };
            }
            return student;
          });
          if (needsSave) {
            this.saveDatabase(parsed);
          }
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error reading database file, initializing fresh:', err);
    }

    const defaultDb: DatabaseSchema = {
      districts: INITIAL_DISTRICTS,
      mandals: INITIAL_MANDALS,
      villages: INITIAL_VILLAGES,
      schools: INITIAL_SCHOOLS,
      students: INITIAL_STUDENTS,
      attendance: [],
      users: [DEFAULT_ADMIN],
      sequenceCounter: 1
    };
    this.saveDatabase(defaultDb);
    return defaultDb;
  }

  private saveDatabase(data?: DatabaseSchema) {
    try {
      const state = data || this.db;
      // Atomic write via temp file
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(state, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  // Location Hierarchy Queries
  public getDistricts(): District[] {
    return [...this.db.districts].sort((a, b) => a.name.localeCompare(b.name));
  }

  public getDistrictById(id: string): District | undefined {
    return this.db.districts.find(d => d.id === id);
  }

  public getMandals(districtId?: string): Mandal[] {
    let result = [...this.db.mandals];
    if (districtId) {
      result = result.filter(m => m.districtId === districtId);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  public getMandalById(id: string): Mandal | undefined {
    return this.db.mandals.find(m => m.id === id);
  }

  public getVillages(mandalId?: string): Village[] {
    let result = [...this.db.villages];
    if (mandalId) {
      result = result.filter(v => v.mandalId === mandalId);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  public getVillageById(id: string): Village | undefined {
    return this.db.villages.find(v => v.id === id);
  }

  public getSchools(villageId?: string): School[] {
    let result = [...this.db.schools];
    if (villageId) {
      result = result.filter(s => s.villageId === villageId);
    }
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  public getSchoolById(id: string): School | undefined {
    return this.db.schools.find(s => s.id === id);
  }

  // Add / Update Locations
  public addVillage(mandalId: string, name: string): Village {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `vil-${slug}-${Date.now().toString(36)}`;
    const newVillage: Village = { id, mandalId, name: name.trim() };
    this.db.villages.push(newVillage);
    this.saveDatabase();
    return newVillage;
  }

  public addSchool(villageId: string, name: string, type: School['type'] = 'Government'): School {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 30);
    const id = `sch-${slug}-${Date.now().toString(36)}`;
    const newSchool: School = {
      id,
      villageId,
      name: name.trim(),
      type
    };
    this.db.schools.push(newSchool);
    this.saveDatabase();
    return newSchool;
  }

  public deleteSchool(id: string): { success: boolean; deletedSchool?: School; enrolledStudents: number } {
    const schoolIndex = this.db.schools.findIndex(s => s.id === id);
    if (schoolIndex === -1) {
      return { success: false, enrolledStudents: 0 };
    }
    const [deletedSchool] = this.db.schools.splice(schoolIndex, 1);
    const enrolledStudents = this.db.students.filter(s => s.schoolId === id).length;
    this.saveDatabase();
    return { success: true, deletedSchool, enrolledStudents };
  }

  public restoreDefaultSchools(villageId?: string): School[] {
    if (villageId) {
      // Restore default schools for this specific village from INITIAL_SCHOOLS
      const defaultForVillage = INITIAL_SCHOOLS.filter(s => s.villageId === villageId);
      // Remove current schools for village
      this.db.schools = this.db.schools.filter(s => s.villageId !== villageId);
      // Re-insert initial defaults
      this.db.schools.push(...defaultForVillage);
    } else {
      this.db.schools = [...INITIAL_SCHOOLS];
    }
    this.saveDatabase();
    return this.getSchools(villageId);
  }

  // Student ID generation: BBT000001 (BBT followed by zero-padded number)
  // For single-digit numbers 1-9, format is exactly "BBT00000" + number (e.g. BBT000001)
  private generateNextStudentId(): string {
    this.db.sequenceCounter += 1;
    const paddedIndex = String(this.db.sequenceCounter).padStart(6, '0');
    return `BBT${paddedIndex}`;
  }

  // Students CRUD
  public getStudents(searchQuery?: string): Student[] {
    if (!searchQuery || !searchQuery.trim()) {
      return [...this.db.students].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
    }
    const q = searchQuery.toLowerCase().trim();
    const isPureNumber = /^\d+$/.test(q);
    const paddedBbt6 = isPureNumber ? `bbt${q.padStart(6, '0')}` : '';
    const paddedBbt5 = isPureNumber ? `bbt${q.padStart(5, '0')}` : '';

    return this.db.students.filter(student => {
      const studentIdLower = student.id.toLowerCase();
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      return (
        studentIdLower.includes(q) ||
        (isPureNumber && (studentIdLower === paddedBbt6 || studentIdLower === paddedBbt5 || studentIdLower.endsWith(q))) ||
        fullName.includes(q) ||
        student.mobileNumber.includes(q) ||
        student.schoolName.toLowerCase().includes(q) ||
        student.villageName.toLowerCase().includes(q) ||
        student.mandalName.toLowerCase().includes(q) ||
        student.districtName.toLowerCase().includes(q) ||
        student.className.toLowerCase().includes(q)
      );
    }).sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  }

  public getStudentById(id: string): Student | undefined {
    return this.db.students.find(s => s.id.toLowerCase() === id.toLowerCase());
  }

  public createStudent(input: {
    firstName: string;
    lastName: string;
    className: string;
    schoolId: string;
    schoolName?: string;
    fatherName: string;
    motherName: string;
    mobileNumber: string;
    colonyStreet?: string;
    districtId: string;
    mandalId: string;
    villageId: string;
  }): Student {
    const district = this.getDistrictById(input.districtId);
    const mandal = this.getMandalById(input.mandalId);
    const village = this.getVillageById(input.villageId);
    const school = this.getSchoolById(input.schoolId);

    const studentId = this.generateNextStudentId();
    const newStudent: Student = {
      id: studentId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      className: input.className.trim(),
      schoolId: input.schoolId,
      schoolName: school?.name || input.schoolName || 'Unknown School',
      fatherName: input.fatherName.trim(),
      motherName: input.motherName.trim(),
      mobileNumber: input.mobileNumber.trim(),
      colonyStreet: (input.colonyStreet || '').trim(),
      districtId: input.districtId,
      districtName: district?.name || '',
      mandalId: input.mandalId,
      mandalName: mandal?.name || '',
      villageId: input.villageId,
      villageName: village?.name || '',
      registeredAt: new Date().toISOString()
    };

    this.db.students.push(newStudent);
    this.saveDatabase();
    return newStudent;
  }

  public updateStudent(id: string, updates: Partial<Student>): Student | null {
    const index = this.db.students.findIndex(s => s.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    const current = this.db.students[index];
    const district = updates.districtId ? this.getDistrictById(updates.districtId) : undefined;
    const mandal = updates.mandalId ? this.getMandalById(updates.mandalId) : undefined;
    const village = updates.villageId ? this.getVillageById(updates.villageId) : undefined;
    const school = updates.schoolId ? this.getSchoolById(updates.schoolId) : undefined;

    // Support updating Student ID if provided
    let finalId = current.id;
    if (updates.id && updates.id.trim()) {
      const candidateId = updates.id.trim().toUpperCase();
      if (candidateId.toLowerCase() !== current.id.toLowerCase()) {
        const collision = this.db.students.find(s => s.id.toLowerCase() === candidateId.toLowerCase());
        if (collision) {
          throw new Error(`Student ID "${candidateId}" is already assigned to ${collision.firstName} ${collision.lastName}.`);
        }
        finalId = candidateId;
      }
    }

    const updated: Student = {
      ...current,
      ...updates,
      id: finalId, // Updated ID allowed
      registeredAt: current.registeredAt, // Creation time is immutable
      districtName: district?.name || updates.districtName || current.districtName,
      mandalName: mandal?.name || updates.mandalName || current.mandalName,
      villageName: village?.name || updates.villageName || current.villageName,
      schoolName: school?.name || updates.schoolName || current.schoolName,
      updatedAt: new Date().toISOString()
    };

    this.db.students[index] = updated;
    this.saveDatabase();
    return updated;
  }

  public deleteStudent(id: string): boolean {
    const initialLen = this.db.students.length;
    this.db.students = this.db.students.filter(s => s.id.toLowerCase() !== id.toLowerCase());
    if (this.db.students.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public getStats() {
    return {
      totalStudents: this.db.students.length,
      totalDistricts: this.db.districts.length,
      totalMandals: this.db.mandals.length,
      totalVillages: this.db.villages.length,
      totalSchools: this.db.schools.length
    };
  }

  /**
   * Get attendance records for a specific date and optional class
   */
  public getAttendance(date: string, className?: string): AttendanceRecord[] {
    if (!this.db.attendance) {
      this.db.attendance = [];
    }
    return this.db.attendance.filter(r => {
      const matchDate = r.date === date;
      const matchClass = !className || className === 'All Classes' || r.className === className;
      return matchDate && matchClass;
    });
  }

  /**
   * Save or update batch attendance records
   */
  public saveAttendance(records: AttendanceRecord[]): { saved: number; records: AttendanceRecord[] } {
    if (!this.db.attendance) {
      this.db.attendance = [];
    }

    const now = new Date().toISOString();
    const updatedRecords: AttendanceRecord[] = [];

    for (const rec of records) {
      // Find if record already exists for this student on this date
      const existingIdx = this.db.attendance.findIndex(
        r => r.date === rec.date && r.studentId.toLowerCase() === rec.studentId.toLowerCase()
      );

      const completeRecord: AttendanceRecord = {
        ...rec,
        id: rec.id || `att-${rec.date}-${rec.studentId}`,
        markedAt: now
      };

      if (existingIdx >= 0) {
        this.db.attendance[existingIdx] = completeRecord;
      } else {
        this.db.attendance.push(completeRecord);
      }
      updatedRecords.push(completeRecord);
    }

    this.saveDatabase();
    return { saved: updatedRecords.length, records: updatedRecords };
  }

  /**
   * Get all attendance history for a single student
   */
  public getStudentAttendance(studentId: string): AttendanceRecord[] {
    if (!this.db.attendance) {
      this.db.attendance = [];
    }
    return this.db.attendance
      .filter(r => r.studentId.toLowerCase() === studentId.toLowerCase())
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * Calculate attendance summary stats for a given date
   */
  public getAttendanceSummary(date: string, className?: string): AttendanceSummary {
    const records = this.getAttendance(date, className);
    let relevantStudents = this.db.students;
    if (className && className !== 'All Classes') {
      relevantStudents = relevantStudents.filter(s => s.className === className);
    }

    const totalStudents = relevantStudents.length;
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;

    for (const rec of records) {
      if (rec.status === 'present') presentCount++;
      else if (rec.status === 'absent') absentCount++;
      else if (rec.status === 'leave') leaveCount++;
    }

    const markedCount = presentCount + absentCount + leaveCount;
    const unmarkedCount = Math.max(0, totalStudents - markedCount);
    const percentage = markedCount > 0 ? Math.round((presentCount / markedCount) * 100) : 0;

    return {
      date,
      totalStudents,
      presentCount,
      absentCount,
      leaveCount,
      unmarkedCount,
      percentage
    };
  }

  // --- User Authentication Methods ---
  public getUsers(): UserAccount[] {
    if (!this.db.users || !Array.isArray(this.db.users)) {
      this.db.users = [DEFAULT_ADMIN];
      this.saveDatabase();
    }
    return this.db.users;
  }

  public findUserByEmail(email: string): UserAccount | undefined {
    return this.getUsers().find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  public createUser(data: {
    email: string;
    name: string;
    password?: string;
    role?: 'admin' | 'user';
    provider?: 'google' | 'password';
    picture?: string;
  }): UserAccount {
    const users = this.getUsers();
    const normalizedEmail = data.email.trim().toLowerCase();
    
    // Explicit rule: admin google is bala@gmail.com
    const role: 'admin' | 'user' = normalizedEmail === 'bala@gmail.com' ? 'admin' : (data.role || 'user');
    
    const existingIndex = users.findIndex(u => u.email.toLowerCase() === normalizedEmail);
    if (existingIndex >= 0) {
      const existing = users[existingIndex];
      if (data.name) existing.name = data.name;
      if (data.picture) existing.picture = data.picture;
      if (data.password && !existing.password) existing.password = data.password;
      if (normalizedEmail === 'bala@gmail.com') {
        existing.role = 'admin';
        existing.password = 'Bala$2026';
      }
      this.saveDatabase();
      return existing;
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      email: normalizedEmail,
      name: data.name || normalizedEmail.split('@')[0],
      password: normalizedEmail === 'bala@gmail.com' ? 'Bala$2026' : data.password,
      role,
      provider: data.provider || 'password',
      picture: data.picture,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveDatabase();
    return newUser;
  }
}

export const dbManager = new DatabaseManager();
