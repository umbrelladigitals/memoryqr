import { Heart, Crown, Baby, Building, Star, Cake } from 'lucide-react'

export const eventTypeConfig = {
  wedding: {
    name: 'Düğün',
    icon: Heart,
    gradient: 'from-rose-100 via-pink-50 to-red-100',
    borderColor: 'border-rose-300',
    iconColor: 'text-rose-600',
    accentColor: 'bg-rose-500',
    pattern: '🌹',
    printBg: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 25%, #fecaca 50%, #fda4af 75%, #fb7185 100%)',
    specialFields: [
      { key: 'brideName', label: 'Gelin Adı', icon: '👰‍♀️' },
      { key: 'groomName', label: 'Damat Adı', icon: '🤵‍♂️' },
      { key: 'weddingDate', label: 'Düğün Tarihi', icon: '💒' },
      { key: 'venue', label: 'Düğün Salonu', icon: '🏛️' }
    ],
    printTemplate: {
      title: (participants: any) => {
        const bride = participants?.brideName || participants?.bride || '';
        const groom = participants?.groomName || participants?.groom || '';
        return bride && groom ? `${bride} & ${groom}` : 'Düğün';
      }
    },
    decorativeSvg: `
      <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;">
        <defs>
          <pattern id="wedding-roses" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <g opacity="0.12">
              <!-- Ana güller -->
              <g transform="translate(30,30)">
                <circle cx="0" cy="0" r="12" fill="#f43f5e" opacity="0.15"/>
                <path d="M-8,-8 Q0,-12 8,-8 Q12,0 8,8 Q0,12 -8,8 Q-12,0 -8,-8" fill="#f43f5e" opacity="0.1"/>
                <circle cx="0" cy="0" r="6" fill="#ec4899" opacity="0.2"/>
              </g>
              <g transform="translate(90,90)">
                <circle cx="0" cy="0" r="10" fill="#ec4899" opacity="0.12"/>
                <path d="M-6,-6 Q0,-9 6,-6 Q9,0 6,6 Q0,9 -6,6 Q-9,0 -6,-6" fill="#ec4899" opacity="0.08"/>
              </g>
              <!-- Küçük çiçekler -->
              <g transform="translate(70,20)">
                <circle cx="0" cy="0" r="4" fill="#f43f5e" opacity="0.15"/>
                <path d="M-2,-2 L0,-4 L2,-2 L4,0 L2,2 L0,4 L-2,2 L-4,0 Z" fill="#ec4899" opacity="0.1"/>
              </g>
              <g transform="translate(20,80)">
                <circle cx="0" cy="0" r="3" fill="#ec4899" opacity="0.18"/>
                <path d="M-1.5,-1.5 L0,-3 L1.5,-1.5 L3,0 L1.5,1.5 L0,3 L-1.5,1.5 L-3,0 Z" fill="#f43f5e" opacity="0.12"/>
              </g>
              <!-- Yapraklar -->
              <path d="M50,10 Q60,15 50,25 Q40,15 50,10" fill="#10b981" opacity="0.08"/>
              <path d="M100,50 Q105,60 95,60 Q90,50 100,50" fill="#10b981" opacity="0.08"/>
            </g>
          </pattern>
          
          <!-- Çerçeve deseni -->
          <pattern id="wedding-border" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <g opacity="0.15">
              <circle cx="20" cy="20" r="3" fill="#f43f5e"/>
              <path d="M15,15 Q20,10 25,15 Q20,20 15,15" fill="#ec4899" opacity="0.8"/>
            </g>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#wedding-roses)"/>
        
        <!-- Köşe süslemeleri -->
        <g className="corner-decorations">
          <!-- Sol üst köşe -->
          <g transform="translate(10,10)">
            <path d="M0,30 Q15,0 30,0 L40,0 L40,10 Q40,25 25,25 L0,25 Z" fill="url(#wedding-border)" opacity="0.3"/>
            <circle cx="15" cy="15" r="8" fill="#f43f5e" opacity="0.15"/>
            <path d="M10,10 Q15,5 20,10 Q15,15 10,10" fill="#ec4899" opacity="0.2"/>
          </g>
          
          <!-- Sağ alt köşe -->
          <g transform="translate(310,210) rotate(180)">
            <path d="M0,30 Q15,0 30,0 L40,0 L40,10 Q40,25 25,25 L0,25 Z" fill="url(#wedding-border)" opacity="0.3"/>
            <circle cx="15" cy="15" r="8" fill="#f43f5e" opacity="0.15"/>
            <path d="M10,10 Q15,5 20,10 Q15,15 10,10" fill="#ec4899" opacity="0.2"/>
          </g>
        </g>
      </svg>
    `,
    decorativeElements: ['🌹', '💐', '🌸', '🌺']
  },
  
  engagement: {
    name: 'Nişan',
    icon: Crown,
    gradient: 'from-purple-100 via-violet-50 to-pink-100',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-600',
    accentColor: 'bg-purple-500',
    pattern: '💍',
    printBg: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 25%, #e9d5ff 50%, #d8b4fe 75%, #c084fc 100%)',
    specialFields: [
      { key: 'brideName', label: 'Gelin Adı', icon: '👸' },
      { key: 'groomName', label: 'Damat Adı', icon: '🤴' },
      { key: 'engagementDate', label: 'Nişan Tarihi', icon: '💍' },
      { key: 'families', label: 'Aileler', icon: '👨‍👩‍👧‍👦' }
    ],
    printTemplate: {
      title: (participants: any) => {
        const bride = participants?.brideName || participants?.bride || '';
        const groom = participants?.groomName || participants?.groom || '';
        return bride && groom ? `${bride} & ${groom}` : 'Nişan';
      }
    },
    decorativeSvg: `
      <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;">
        <defs>
          <pattern id="engagement-diamonds" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <g opacity="0.12">
              <!-- Büyük elmas -->
              <g transform="translate(50,30)">
                <polygon points="0,-15 10,-5 0,15 -10,-5" fill="#a855f7" opacity="0.2"/>
                <polygon points="0,-10 6,-3 0,10 -6,-3" fill="#c084fc" opacity="0.3"/>
                <polygon points="0,-5 3,-1.5 0,5 -3,-1.5" fill="#d8b4fe" opacity="0.4"/>
              </g>
              
              <!-- Küçük elmaslar -->
              <g transform="translate(20,70)">
                <polygon points="0,-8 5,-3 0,8 -5,-3" fill="#8b5cf6" opacity="0.15"/>
                <polygon points="0,-4 2.5,-1.5 0,4 -2.5,-1.5" fill="#c084fc" opacity="0.25"/>
              </g>
              
              <g transform="translate(80,80)">
                <polygon points="0,-6 4,-2 0,6 -4,-2" fill="#a855f7" opacity="0.18"/>
                <polygon points="0,-3 2,-1 0,3 -2,-1" fill="#d8b4fe" opacity="0.3"/>
              </g>
              
              <!-- Taç motifleri -->
              <g transform="translate(25,25)">
                <path d="M-10,5 L-5,0 L0,8 L5,0 L10,5 L5,10 L-5,10 Z" fill="#a855f7" opacity="0.1"/>
                <circle cx="0" cy="3" r="2" fill="#c084fc" opacity="0.2"/>
              </g>
              
              <!-- Parlama efektleri -->
              <g transform="translate(70,20)">
                <path d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z" fill="#fbbf24" opacity="0.15"/>
              </g>
            </g>
          </pattern>
          
          <!-- Çerçeve kraliyet deseni -->
          <pattern id="engagement-border" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <g opacity="0.18">
              <path d="M25,5 L30,15 L40,15 L32,22 L35,32 L25,27 L15,32 L18,22 L10,15 L20,15 Z" fill="#a855f7"/>
            </g>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#engagement-diamonds)"/>
        
        <!-- Kraliyet çerçevesi -->
        <g className="royal-corners">
          <!-- Sol üst taç -->
          <g transform="translate(15,15)">
            <path d="M0,20 L5,5 L10,15 L15,5 L20,15 L25,5 L30,20 L25,25 L5,25 Z" fill="url(#engagement-border)" opacity="0.25"/>
            <circle cx="15" cy="15" r="3" fill="#a855f7" opacity="0.3"/>
          </g>
          
          <!-- Sağ alt taç -->
          <g transform="translate(320,210) rotate(180)">
            <path d="M0,20 L5,5 L10,15 L15,5 L20,15 L25,5 L30,20 L25,25 L5,25 Z" fill="url(#engagement-border)" opacity="0.25"/>
            <circle cx="15" cy="15" r="3" fill="#a855f7" opacity="0.3"/>
          </g>
          
          <!-- Yan süslemeler -->
          <g transform="translate(5,120)">
            <polygon points="10,0 15,8 20,0 25,10 20,20 15,12 10,20 5,10" fill="#c084fc" opacity="0.15"/>
          </g>
          
          <g transform="translate(320,120)">
            <polygon points="10,0 15,8 20,0 25,10 20,20 15,12 10,20 5,10" fill="#c084fc" opacity="0.15"/>
          </g>
        </g>
      </svg>
    `,
    decorativeElements: ['💎', '👑', '✨', '⭐']
  },
  
  birthday: {
    name: 'Doğum Günü',
    icon: Cake,
    gradient: 'from-yellow-100 via-amber-50 to-orange-100',
    borderColor: 'border-orange-300',
    iconColor: 'text-orange-600',
    accentColor: 'bg-orange-500',
    pattern: '🎂',
    printBg: 'linear-gradient(135deg, #fefbef 0%, #fef3c7 25%, #fed7aa 50%, #fdba74 75%, #fb923c 100%)',
    specialFields: [
      { key: 'birthdayPersonName', label: 'Doğum Günü Sahibi', icon: '🎂' },
      { key: 'age', label: 'Yaş', icon: '🎈' },
      { key: 'theme', label: 'Parti Teması', icon: '🎭' },
      { key: 'surpriseMessage', label: 'Sürpriz Mesaj', icon: '🎁' }
    ],
    printTemplate: {
      title: (participants: any) => {
        const name = participants?.birthdayPersonName || participants?.celebrant || '';
        const age = participants?.age || '';
        return name ? (age ? `${name} - ${age}. Yaş` : name) : 'Doğum Günü';
      }
    },
    decorativeSvg: `
      <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;">
        <defs>
          <pattern id="birthday-balloons" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <g opacity="0.12">
              <!-- Balonlar -->
              <g transform="translate(25,20)">
                <ellipse cx="0" cy="0" rx="8" ry="12" fill="#f97316" opacity="0.2"/>
                <ellipse cx="0" cy="0" rx="5" ry="8" fill="#fb923c" opacity="0.15"/>
                <path d="M0,12 Q-2,15 -1,18 Q0,16 1,18 Q2,15 0,12" stroke="#f97316" strokeWidth="1" fill="none"/>
              </g>
              
              <g transform="translate(55,35)">
                <ellipse cx="0" cy="0" rx="6" ry="10" fill="#fbbf24" opacity="0.18"/>
                <ellipse cx="0" cy="0" rx="4" ry="7" fill="#f59e0b" opacity="0.12"/>
                <path d="M0,10 Q-1.5,12 -0.5,14 Q0,13 0.5,14 Q1.5,12 0,10" stroke="#fbbf24" strokeWidth="1" fill="none"/>
              </g>
              
              <g transform="translate(15,55)">
                <ellipse cx="0" cy="0" rx="5" ry="8" fill="#fb923c" opacity="0.15"/>
                <path d="M0,8 Q-1,10 0,12 Q1,10 0,8" stroke="#fb923c" strokeWidth="1" fill="none"/>
              </g>
              
              <!-- Konfeti -->
              <g transform="translate(40,15)">
                <circle cx="0" cy="0" r="2" fill="#f97316" opacity="0.3"/>
                <circle cx="5" cy="8" r="1.5" fill="#fbbf24" opacity="0.25"/>
                <circle cx="-3" cy="12" r="1" fill="#fb923c" opacity="0.2"/>
              </g>
              
              <!-- Parti şapkası -->
              <g transform="translate(65,60)">
                <polygon points="0,-8 4,4 -4,4" fill="#f97316" opacity="0.2"/>
                <circle cx="0" cy="-8" r="2" fill="#fbbf24" opacity="0.25"/>
              </g>
              
              <!-- Streamers -->
              <path d="M10,70 Q20,65 30,70 Q40,75 50,70" stroke="#f97316" strokeWidth="2" fill="none" opacity="0.15"/>
              <path d="M20,10 Q30,15 40,10 Q50,5 60,10" stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.12"/>
            </g>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#birthday-balloons)"/>
        
        <!-- Parti çerçevesi -->
        <g className="party-border">
          <!-- Sol üst parti köşesi -->
          <g transform="translate(10,10)">
            <circle cx="15" cy="15" r="12" fill="#f97316" opacity="0.1"/>
            <ellipse cx="15" cy="10" rx="3" ry="8" fill="#fbbf24" opacity="0.2"/>
            <path d="M15,18 Q13,20 15,22 Q17,20 15,18" stroke="#f97316" strokeWidth="1" fill="none"/>
            <circle cx="25" cy="8" r="1" fill="#fb923c" opacity="0.3"/>
            <circle cx="8" cy="22" r="1.5" fill="#fbbf24" opacity="0.25"/>
          </g>
          
          <!-- Sağ alt parti köşesi -->
          <g transform="translate(310,210) rotate(180)">
            <circle cx="15" cy="15" r="12" fill="#f97316" opacity="0.1"/>
            <ellipse cx="15" cy="10" rx="3" ry="8" fill="#fbbf24" opacity="0.2"/>
            <path d="M15,18 Q13,20 15,22 Q17,20 15,18" stroke="#f97316" strokeWidth="1" fill="none"/>
            <circle cx="25" cy="8" r="1" fill="#fb923c" opacity="0.3"/>
            <circle cx="8" cy="22" r="1.5" fill="#fbbf24" opacity="0.25"/>
          </g>
        </g>
      </svg>
    `,
    decorativeElements: ['🎈', '🎉', '🎊', '🎁']
  },
  
  baby_shower: {
    name: 'Baby Shower',
    icon: Baby,
    gradient: 'from-blue-100 via-sky-50 to-cyan-100',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-600',
    accentColor: 'bg-blue-500',
    pattern: '👶',
    printBg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #bae6fd 50%, #7dd3fc 75%, #38bdf8 100%)',
    specialFields: [
      { key: 'parentNames', label: 'Anne & Baba', icon: '👨‍👩‍👧' },
      { key: 'babyName', label: 'Bebek Adı', icon: '👶' },
      { key: 'dueDate', label: 'Tahmini Doğum', icon: '📅' },
      { key: 'gender', label: 'Cinsiyet', icon: '💙💖' }
    ],
    printTemplate: {
      title: (participants: any) => {
        const parents = participants?.parentNames || participants?.parents || '';
        const babyName = participants?.babyName || '';
        return babyName ? `${babyName}` : (parents ? `${parents}'ın Bebeği` : 'Baby Shower');
      }
    },
    decorativeSvg: `
      <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;">
        <defs>
          <pattern id="baby-hearts" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
            <g opacity="0.12">
              <!-- Büyük kalpler -->
              <g transform="translate(30,25)">
                <path d="M0,8 C0,3 -5,0 -8,4 C-11,0 -16,3 -16,8 C-16,13 0,25 0,25 C0,25 16,13 16,8 C16,3 11,0 8,4 C5,0 0,3 0,8" fill="#3b82f6" opacity="0.15"/>
                <path d="M0,5 C0,2 -3,0 -5,2 C-7,0 -10,2 -10,5 C-10,8 0,15 0,15 C0,15 10,8 10,5 C10,2 7,0 5,2 C3,0 0,2 0,5" fill="#60a5fa" opacity="0.2"/>
              </g>
              
              <g transform="translate(70,65)">
                <path d="M0,6 C0,2 -4,0 -6,3 C-8,0 -12,2 -12,6 C-12,10 0,20 0,20 C0,20 12,10 12,6 C12,2 8,0 6,3 C4,0 0,2 0,6" fill="#60a5fa" opacity="0.12"/>
              </g>
              
              <!-- Bebek ayak izleri -->
              <g transform="translate(20,60)">
                <ellipse cx="0" cy="0" rx="2" ry="3" fill="#3b82f6" opacity="0.2"/>
                <circle cx="-1" cy="-4" r="1" fill="#3b82f6" opacity="0.15"/>
                <circle cx="1" cy="-4" r="1" fill="#3b82f6" opacity="0.15"/>
                <circle cx="-2" cy="-6" r="0.8" fill="#3b82f6" opacity="0.12"/>
                <circle cx="2" cy="-6" r="0.8" fill="#3b82f6" opacity="0.12"/>
              </g>
              
              <g transform="translate(60,20)">
                <ellipse cx="0" cy="0" rx="1.5" ry="2.5" fill="#60a5fa" opacity="0.18"/>
                <circle cx="-0.8" cy="-3" r="0.8" fill="#60a5fa" opacity="0.15"/>
                <circle cx="0.8" cy="-3" r="0.8" fill="#60a5fa" opacity="0.15"/>
              </g>
              
              <!-- Yıldızlar ve bulutlar -->
              <g transform="translate(15,20)">
                <path d="M0,-4 L1,-1 L4,0 L1,1 L0,4 L-1,1 L-4,0 L-1,-1 Z" fill="#fbbf24" opacity="0.15"/>
              </g>
              
              <g transform="translate(75,45)">
                <ellipse cx="0" cy="0" rx="8" ry="4" fill="#e5e7eb" opacity="0.1"/>
                <ellipse cx="-3" cy="-1" rx="5" ry="3" fill="#e5e7eb" opacity="0.08"/>
                <ellipse cx="4" cy="-1" rx="4" ry="2" fill="#e5e7eb" opacity="0.06"/>
              </g>
            </g>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#baby-hearts)"/>
        
        <!-- Bebek çerçevesi -->
        <g className="baby-border">
          <g transform="translate(15,15)">
            <circle cx="10" cy="10" r="15" fill="#3b82f6" opacity="0.08"/>
            <path d="M10,2 C10,-1 7,-3 5,0 C3,-3 0,-1 0,2 C0,5 10,15 10,15 C10,15 20,5 20,2 C20,-1 17,-3 15,0 C13,-3 10,-1 10,2" fill="#60a5fa" opacity="0.12"/>
          </g>
          
          <g transform="translate(315,215) rotate(180)">
            <circle cx="10" cy="10" r="15" fill="#3b82f6" opacity="0.08"/>
            <path d="M10,2 C10,-1 7,-3 5,0 C3,-3 0,-1 0,2 C0,5 10,15 10,15 C10,15 20,5 20,2 C20,-1 17,-3 15,0 C13,-3 10,-1 10,2" fill="#60a5fa" opacity="0.12"/>
          </g>
        </g>
      </svg>
    `,
    decorativeElements: ['🍼', '🧸', '👶', '🎀']
  },
  
  corporate: {
    name: 'Kurumsal Etkinlik',
    icon: Building,
    gradient: 'from-gray-100 via-slate-50 to-zinc-100',
    borderColor: 'border-gray-400',
    iconColor: 'text-gray-700',
    accentColor: 'bg-gray-600',
    pattern: '🏢',
    printBg: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)',
    specialFields: [
      { key: 'companyName', label: 'Şirket Adı', icon: '🏢' },
      { key: 'eventPurpose', label: 'Etkinlik Amacı', icon: '🎯' },
      { key: 'department', label: 'Departman', icon: '👥' },
      { key: 'organizer', label: 'Organizatör', icon: '👨‍💼' }
    ],
    printTemplate: {
      title: (participants: any) => {
        const company = participants?.companyName || '';
        const purpose = participants?.eventPurpose || '';
        return company || purpose || 'Kurumsal Etkinlik';
      }
    },
    decorativeSvg: `
      <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;">
        <defs>
          <pattern id="corporate-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <g opacity="0.08">
              <rect x="10" y="10" width="15" height="15" stroke="#475569" strokeWidth="1" fill="none" rx="2"/>
              <rect x="35" y="35" width="10" height="10" stroke="#64748b" strokeWidth="1" fill="rgba(71,85,105,0.05)" rx="1"/>
              <rect x="35" y="10" width="8" height="12" stroke="#64748b" strokeWidth="0.5" fill="none" rx="1"/>
              <rect x="10" y="35" width="12" height="8" stroke="#64748b" strokeWidth="0.5" fill="none" rx="1"/>
              
              <line x1="15" y1="15" x2="20" y2="15" stroke="#475569" strokeWidth="0.5"/>
              <line x1="15" y1="18" x2="20" y2="18" stroke="#475569" strokeWidth="0.5"/>
              <line x1="15" y1="21" x2="20" y2="21" stroke="#475569" strokeWidth="0.5"/>
              
              <circle cx="40" cy="16" r="1" fill="#64748b" opacity="0.3"/>
              <circle cx="16" cy="40" r="1" fill="#64748b" opacity="0.25"/>
            </g>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#corporate-grid)"/>
        
        <g className="corporate-frame">
          <g transform="translate(20,20)">
            <rect x="0" y="0" width="25" height="20" stroke="#475569" strokeWidth="2" fill="rgba(71,85,105,0.05)" rx="3"/>
            <rect x="5" y="5" width="4" height="3" fill="#64748b" opacity="0.2"/>
            <rect x="12" y="5" width="4" height="3" fill="#64748b" opacity="0.2"/>
            <rect x="19" y="5" width="4" height="3" fill="#64748b" opacity="0.2"/>
            <rect x="5" y="10" width="4" height="3" fill="#64748b" opacity="0.15"/>
            <rect x="12" y="10" width="4" height="3" fill="#64748b" opacity="0.15"/>
            <rect x="19" y="10" width="4" height="3" fill="#64748b" opacity="0.15"/>
          </g>
          
          <g transform="translate(300,190) rotate(180)">
            <rect x="0" y="0" width="25" height="20" stroke="#475569" strokeWidth="2" fill="rgba(71,85,105,0.05)" rx="3"/>
            <rect x="5" y="5" width="4" height="3" fill="#64748b" opacity="0.2"/>
            <rect x="12" y="5" width="4" height="3" fill="#64748b" opacity="0.2"/>
            <rect x="19" y="5" width="4" height="3" fill="#64748b" opacity="0.2"/>
          </g>
        </g>
      </svg>
    `,
    decorativeElements: ['💼', '📊', '🎯', '⭐']
  },
  
  other: {
    name: 'Diğer Etkinlik',
    icon: Star,
    gradient: 'from-indigo-100 via-purple-50 to-pink-100',
    borderColor: 'border-indigo-300',
    iconColor: 'text-indigo-600',
    accentColor: 'bg-indigo-500',
    pattern: '⭐',
    printBg: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 25%, #e2e8f0 50%, #cbd5e1 75%, #94a3b8 100%)',
    specialFields: [
      { key: 'eventName', label: 'Etkinlik Adı', icon: '🎪' },
      { key: 'hostName', label: 'Ev Sahibi', icon: '🎭' },
      { key: 'specialNote', label: 'Özel Not', icon: '📝' },
      { key: 'dresscode', label: 'Kıyafet Kodu', icon: '👔' }
    ],
    printTemplate: {
      title: (participants: any) => {
        const eventName = participants?.eventName || '';
        const hostName = participants?.hostName || '';
        return eventName || hostName || 'Özel Etkinlik';
      }
    },
    decorativeSvg: `
      <svg width="100%" height="100%" style="position: absolute; top: 0; left: 0; z-index: 1;">
        <defs>
          <pattern id="other-stars" x="0" y="0" width="70" height="70" patternUnits="userSpaceOnUse">
            <g opacity="0.12">
              <polygon points="35,5 38,18 51,18 41,27 44,40 35,33 26,40 29,27 19,18 32,18" fill="#6366f1" opacity="0.2"/>
              <polygon points="15,50 16,55 21,55 18,58 19,63 15,61 11,63 12,58 9,55 14,55" fill="#818cf8" opacity="0.15"/>
              <polygon points="55,55 57,62 64,62 59,66 61,73 55,69 49,73 51,66 46,62 53,62" fill="#a5b4fc" opacity="0.18"/>
              
              <circle cx="20" cy="20" r="2" fill="#fbbf24" opacity="0.15"/>
              <circle cx="50" cy="25" r="1.5" fill="#f59e0b" opacity="0.12"/>
              <circle cx="25" cy="45" r="1" fill="#fbbf24" opacity="0.1"/>
            </g>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="url(#other-stars)"/>
        
        <g className="star-corners">
          <g transform="translate(15,15)">
            <polygon points="15,0 18,10 28,10 20,16 23,26 15,21 7,26 10,16 2,10 12,10" fill="#6366f1" opacity="0.15"/>
            <circle cx="15" cy="15" r="3" fill="#fbbf24" opacity="0.2"/>
          </g>
          
          <g transform="translate(315,215) rotate(180)">
            <polygon points="15,0 18,10 28,10 20,16 23,26 15,21 7,26 10,16 2,10 12,10" fill="#6366f1" opacity="0.15"/>
            <circle cx="15" cy="15" r="3" fill="#fbbf24" opacity="0.2"/>
          </g>
        </g>
      </svg>
    `,
    decorativeElements: ['✨', '🌟', '💫', '🎊']
  }
}
