/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UserProfile,
  IncomeSource,
  FixedCost,
  SavingsGoal,
  ExpenseItem,
  TextbookComparison,
  MealBudgetPlan,
  WeeklyChallenge,
  TaskItem,
  TimetableEvent,
  StudyMaterial,
  StudyChatMessage,
} from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'usr-student-001',
  name: 'Thabo Ndlovu',
  email: 'thabo.student@uct.ac.za',
  institution: 'University of Cape Town (UCT)',
  livingType: 'digs',
  currentBalance: 1240.0, // R1,240 currently in student bank account
  isPremium: false,
  referralCodeUsed: undefined,
  onboardingCompleted: true,
  popiaConsentGiven: true,
  popiaConsentDate: '2026-10-20',
  theme: 'dark',
  dailyCoachQueriesCount: 1,
  lastCoachQueryDate: new Date().toISOString().split('T')[0],
};

// Calculate realistic next payday ~ 12 days in the future
export const getNextPaydayDate = (daysFromNow: number = 11): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

export const INITIAL_INCOMES: IncomeSource[] = [
  {
    id: 'inc-1',
    name: 'NSFAS Monthly Allowance',
    amount: 1650.0,
    nextPayDate: getNextPaydayDate(12),
    isPrimary: true,
  },
  {
    id: 'inc-2',
    name: 'Family Transfer (Gogo / Mama)',
    amount: 500.0,
    nextPayDate: getNextPaydayDate(18),
    isPrimary: false,
  },
];

export const INITIAL_FIXED_COSTS: FixedCost[] = [
  {
    id: 'fix-1',
    name: 'Campus Commute (Taxi / Bus)',
    amount: 280.0,
    category: 'transport',
    dueDate: getNextPaydayDate(5),
    isPaid: false,
  },
  {
    id: 'fix-2',
    name: 'MTN / Vodacom Student 10GB Data',
    amount: 149.0,
    category: 'data',
    dueDate: getNextPaydayDate(8),
    isPaid: false,
  },
  {
    id: 'fix-3',
    name: 'Digs WiFi Share',
    amount: 120.0,
    category: 'data',
    dueDate: getNextPaydayDate(15),
    isPaid: true,
  },
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sav-1',
    name: 'Res Emergency Buffer',
    targetAmount: 500.0,
    currentSaved: 360.0,
    targetDate: getNextPaydayDate(25),
    icon: '🛡️',
    category: 'Emergency',
  },
  {
    id: 'sav-2',
    name: 'December Bus Ticket Home',
    targetAmount: 850.0,
    currentSaved: 510.0,
    targetDate: getNextPaydayDate(45),
    icon: '🚌',
    category: 'Travel',
  },
  {
    id: 'sav-3',
    name: 'Refurbished Study Laptop Fund',
    targetAmount: 2400.0,
    currentSaved: 680.0,
    targetDate: getNextPaydayDate(90),
    icon: '💻',
    category: 'Academic',
  },
];

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    amount: 45.0,
    category: 'food',
    note: 'Tuckshop bunny chow & Coke',
    date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    source: 'manual',
  },
  {
    id: 'exp-2',
    amount: 18.0,
    category: 'transport',
    note: 'Minibus taxi from Digs to Upper Campus',
    date: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    source: 'manual',
  },
  {
    id: 'exp-3',
    amount: 35.0,
    category: 'data',
    note: 'Emergency 1GB night owl data bundle',
    date: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    source: 'manual',
  },
  {
    id: 'exp-4',
    amount: 85.0,
    category: 'food',
    note: 'Shoprite essentials: eggs, samp, onions, tomato relish',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    source: 'manual',
  },
  {
    id: 'exp-5',
    amount: 120.0,
    category: 'social',
    note: 'Friday drinks & chill at Student Union',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    source: 'manual',
  },
  {
    id: 'exp-6',
    amount: 60.0,
    category: 'books',
    note: 'Printed past exam papers & tutorial reader at PNA',
    date: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    source: 'manual',
  },
  {
    id: 'exp-7',
    amount: 140.0,
    category: 'food',
    note: 'Late night McDonald’s delivery after studying',
    date: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    source: 'manual',
  },
];

export const INITIAL_CHALLENGE: WeeklyChallenge = {
  id: 'chal-1',
  title: 'Pack Res Lunch 3 Days',
  description: 'Skip the campus tuckshop/cafeteria 3 times this week. Pack a peanut butter sandwich or leftovers from digs.',
  potentialSavings: 135.0,
  targetDays: 3,
  completed: false,
};

export const SA_UNIVERSITIES = [
  // Private Institutions (Richfield, Stadio, IIE, Eduvos, Boston, etc.)
  'Richfield Graduate Institute of Technology',
  'STADIO Higher Education',
  'IIE Varsity College',
  'IIE Rosebank College',
  'Eduvos Higher Education',
  'Boston City Campus & Business College',
  'MANCOSA (Management College of Southern Africa)',
  'Regent Business School',
  'IIE Vega School',
  'AFDA (Film & Creative Arts)',
  'Damelin College',
  'Belgium Campus iTversity',
  'CTU Training Solutions',
  'IMM Graduate School',
  'Milpark Education',

  // Public Universities & Universities of Technology
  'University of Cape Town (UCT)',
  'University of the Witwatersrand (Wits)',
  'University of Pretoria (UP / Tuks)',
  'University of Johannesburg (UJ)',
  'Stellenbosch University (Maties)',
  'University of KwaZulu-Natal (UKZN)',
  'Tshwane University of Technology (TUT)',
  'University of the Western Cape (UWC)',
  'Rhodes University',
  'North-West University (NWU)',
  'University of the Free State (UFS)',
  'Nelson Mandela University (NMU)',
  'Cape Peninsula University of Technology (CPUT)',
  'Durban University of Technology (DUT)',
  'Central University of Technology (CUT)',
  'Vaal University of Technology (VUT)',
  'Walter Sisulu University (WSU)',
  'University of Limpopo (UL)',
  'University of Venda (Univen)',
  'University of Fort Hare (UFH)',
  'Sefako Makgatho Health Sciences University (SMU)',
  'Sol Plaatje University (SPU)',
  'University of Mpumalanga (UMP)',
  'UNISA (Distance Learning)',

  // TVET & Other Colleges
  'South West Gauteng TVET College',
  'False Bay TVET College',
  'Ekurhuleni East/West TVET College',
  'Tshwane North/South TVET College',
  'Other College / Private Academy',
];

export const SA_INSTITUTION_GROUPS = [
  {
    category: 'Private Higher Education & Colleges',
    institutions: [
      'Richfield Graduate Institute of Technology',
      'STADIO Higher Education',
      'IIE Varsity College',
      'IIE Rosebank College',
      'Eduvos Higher Education',
      'Boston City Campus & Business College',
      'MANCOSA (Management College of Southern Africa)',
      'Regent Business School',
      'IIE Vega School',
      'AFDA (Film & Creative Arts)',
      'Damelin College',
      'Belgium Campus iTversity',
      'CTU Training Solutions',
      'IMM Graduate School',
      'Milpark Education',
    ],
  },
  {
    category: 'Public Universities & Tech',
    institutions: [
      'University of Cape Town (UCT)',
      'University of the Witwatersrand (Wits)',
      'University of Pretoria (UP / Tuks)',
      'University of Johannesburg (UJ)',
      'Stellenbosch University (Maties)',
      'University of KwaZulu-Natal (UKZN)',
      'Tshwane University of Technology (TUT)',
      'University of the Western Cape (UWC)',
      'Rhodes University',
      'North-West University (NWU)',
      'University of the Free State (UFS)',
      'Nelson Mandela University (NMU)',
      'Cape Peninsula University of Technology (CPUT)',
      'Durban University of Technology (DUT)',
      'Central University of Technology (CUT)',
      'Vaal University of Technology (VUT)',
      'Walter Sisulu University (WSU)',
      'University of Limpopo (UL)',
      'University of Venda (Univen)',
      'University of Fort Hare (UFH)',
      'Sefako Makgatho Health Sciences University (SMU)',
      'Sol Plaatje University (SPU)',
      'University of Mpumalanga (UMP)',
      'UNISA (Distance Learning)',
    ],
  },
  {
    category: 'TVET & Other Colleges',
    institutions: [
      'South West Gauteng TVET College',
      'False Bay TVET College',
      'Ekurhuleni East/West TVET College',
      'Tshwane North/South TVET College',
      'Other College / Private Academy',
    ],
  },
];

export const TEXTBOOK_PRESETS: TextbookComparison[] = [
  {
    id: 'tb-1',
    courseCode: 'ACC1006 / Accounting 1',
    bookTitle: 'Financial Accounting: An Introduction (8th Ed)',
    newPrice: 790.0,
    secondHandPrice: 280.0,
    libraryReserveNotes: '3 copies on 2-hour Short Loan in Main Library',
    condition: 'Good',
    whereToFind: 'UCT / Wits Buy & Sell WhatsApp Group or Wize Books',
  },
  {
    id: 'tb-2',
    courseCode: 'MAM1000 / Calculus',
    bookTitle: 'Stewart Calculus: Early Transcendentals (Metric)',
    newPrice: 1150.0,
    secondHandPrice: 420.0,
    libraryReserveNotes: 'Free OpenStax PDF alternative covers 90% of syllabus',
    condition: 'Like New',
    whereToFind: 'Senior Student Digs noticeboard / Facebook Marketplace',
  },
  {
    id: 'tb-3',
    courseCode: 'LAW1004 / South African Law',
    bookTitle: 'Introduction to South African Law and Legal Theory',
    newPrice: 650.0,
    secondHandPrice: 220.0,
    libraryReserveNotes: 'Digital eBook accessible via university library portal with student login',
    condition: 'Fair',
    whereToFind: 'Campus Law Students Society (LawSoc) book swap',
  },
  {
    id: 'tb-4',
    courseCode: 'ECO1010 / Microeconomics',
    bookTitle: 'Economics: Global & Southern African Perspectives',
    newPrice: 890.0,
    secondHandPrice: 310.0,
    libraryReserveNotes: '6 copies in Res study room collection',
    condition: 'Good',
    whereToFind: 'PNA Res board / Van Schaik second-hand buyback',
  },
];

export const MEAL_PLANS: MealBudgetPlan[] = [
  {
    id: 'meal-tight',
    tier: 'tight',
    title: 'The Res Survivor (R140 / week)',
    weeklyBudgetZar: 140.0,
    staples: [
      { name: 'Maize Meal (Pap) 2.5kg', estPrice: 28.0, unit: 'bag', store: 'Shoprite / Boxer' },
      { name: 'Eggs (Pack of 18)', estPrice: 46.0, unit: 'pack', store: 'Checkers / Boxer' },
      { name: 'Chakalaka & Baked Beans (2 cans)', estPrice: 26.0, unit: 'cans', store: 'Shoprite' },
      { name: 'Onions & Tomatoes bag', estPrice: 22.0, unit: 'bag', store: 'Local street stall' },
      { name: 'Maggi 2-Minute Noodles (5-pack)', estPrice: 24.0, unit: 'pack', store: 'Any supermarket' },
    ],
    mealSchedule: [
      { day: 'Monday', lunch: '2 Boiled eggs with toast/pap', dinner: 'Pap with tomato & onion relish', quickTip: 'Boil eggs in bulk on Sunday' },
      { day: 'Tuesday', lunch: '2-Minute noodles with egg stir-in', dinner: 'Chakalaka with warm pap', quickTip: 'Add curry powder to boost flavor' },
      { day: 'Wednesday', lunch: 'Baked beans on toast', dinner: 'Scrambled eggs with onions & pap', quickTip: 'Use res microwave if load shedding' },
      { day: 'Thursday', lunch: 'Noodles with chopped greens', dinner: 'Pap & chakalaka mix with boiled egg', quickTip: 'Drink water before meals to stay full' },
      { day: 'Friday', lunch: '2-Egg omelette wrap', dinner: 'Hearty warm samp or pap dinner', quickTip: 'Cook once, eat twice' },
      { day: 'Weekend', lunch: 'Res digs shared brunch', dinner: 'Loaded noodles with mixed veggies', quickTip: 'Pool ingredients with res neighbours' },
    ],
  },
  {
    id: 'meal-balanced',
    tier: 'balanced',
    title: 'Balanced Digs Feast (R240 / week)',
    weeklyBudgetZar: 240.0,
    staples: [
      { name: 'Lucky Star Pilchards (400g can)', estPrice: 25.0, unit: 'can', store: 'Shoprite / Spar' },
      { name: 'Frozen mixed veggies (1kg)', estPrice: 32.0, unit: 'bag', store: 'Checkers' },
      { name: 'Eggs (Pack of 18)', estPrice: 46.0, unit: 'pack', store: 'Boxer' },
      { name: 'Brown Rice / Samp (2kg)', estPrice: 34.0, unit: 'bag', store: 'Shoprite' },
      { name: 'Peanut Butter 400g', estPrice: 38.0, unit: 'jar', store: 'Pick n Pay' },
      { name: 'Brown Bread (2 loaves)', estPrice: 36.0, unit: 'loaves', store: 'Any store' },
      { name: 'Bananas bunch', estPrice: 18.0, unit: 'bunch', store: 'Street vendor' },
    ],
    mealSchedule: [
      { day: 'Monday', lunch: 'Peanut butter & banana toast', dinner: 'Pilchards in tomato gravy with rice', quickTip: 'Pilchards provide essential Omega-3 for studying' },
      { day: 'Tuesday', lunch: 'Leftover pilchards with rice', dinner: 'Egg fried rice with mixed veggies', quickTip: 'Use day-old cold rice for best fried rice' },
      { day: 'Wednesday', lunch: 'Boiled egg sandwiches', dinner: 'Veggie curry with samp & beans', quickTip: 'Samp is high fibre and keeps you full for exams' },
      { day: 'Thursday', lunch: 'Peanut butter toast & fruit', dinner: 'Rice with scrambled eggs & veggies', quickTip: 'Add soy sauce or peri-peri for kick' },
      { day: 'Friday', lunch: 'Toasted cheese & tomato', dinner: 'Pilchard fishcakes with mash or rice', quickTip: 'Mix pilchards with mashed potato and pan fry' },
      { day: 'Weekend', lunch: 'French toast with eggs', dinner: 'Big batch stew with veggies', quickTip: 'Freeze portions for the coming test week' },
    ],
  },
];

// Initial Tasks Data (Task Manager)
export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'tsk-1',
    title: 'Submit Macroeconomics Tutorial 4 Problem Set',
    completed: false,
    priority: 'high',
    category: 'academic',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '17:00',
    courseCode: 'ECO1010',
    estimatedMinutes: 60,
  },
  {
    id: 'tsk-2',
    title: 'Buy MTN Student 10GB Data Bundle before midnight',
    completed: false,
    priority: 'high',
    category: 'finance',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '22:00',
    estimatedMinutes: 5,
  },
  {
    id: 'tsk-3',
    title: 'Review Computer Science Binary Search Tree slides',
    completed: true,
    priority: 'medium',
    category: 'academic',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '14:30',
    courseCode: 'CSC1015',
    estimatedMinutes: 45,
  },
  {
    id: 'tsk-4',
    title: 'Laundry wash & dry at Digs before load shedding',
    completed: false,
    priority: 'medium',
    category: 'errand',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dueTime: '18:00',
    estimatedMinutes: 40,
  },
  {
    id: 'tsk-5',
    title: 'Study group meet with Zanele & Dylan at Main Library',
    completed: false,
    priority: 'low',
    category: 'academic',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    dueTime: '11:00',
    courseCode: 'MAM1000',
    estimatedMinutes: 90,
  },
  {
    id: 'tsk-6',
    title: 'Review monthly NSFAS spending and save R50 to buffer',
    completed: true,
    priority: 'low',
    category: 'finance',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '20:00',
    estimatedMinutes: 10,
  },
];

// Initial Timetable & Everyday Life Events
export const INITIAL_TIMETABLE_EVENTS: TimetableEvent[] = [
  {
    id: 'ev-1',
    title: 'Macroeconomics Lecture (Fiscal Multipliers)',
    courseCode: 'ECO1010',
    type: 'lecture',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:45',
    location: 'Leslie Social LT1 (Upper Campus)',
    color: '#10b981', // emerald
    reminder: true,
  },
  {
    id: 'ev-2',
    title: 'CS Python Practical Lab',
    courseCode: 'CSC1015',
    type: 'lab',
    dayOfWeek: 'Monday',
    startTime: '14:00',
    endTime: '16:30',
    location: 'Computer Science Lab 3',
    color: '#3b82f6', // blue
    reminder: true,
  },
  {
    id: 'ev-3',
    title: 'Gym & Cardio Session (Student Wellness)',
    type: 'life',
    dayOfWeek: 'Monday',
    startTime: '17:30',
    endTime: '18:45',
    location: 'Campus Sports Centre',
    color: '#8b5cf6', // purple
    reminder: false,
  },
  {
    id: 'ev-4',
    title: 'Calculus 1 Tutorial & Problem Solving',
    courseCode: 'MAM1000',
    type: 'tutorial',
    dayOfWeek: 'Tuesday',
    startTime: '10:00',
    endTime: '11:45',
    location: 'Maths Block RM 204',
    color: '#f59e0b', // amber
    reminder: true,
  },
  {
    id: 'ev-5',
    title: 'Commercial Law Lecture (Contracts & POPIA)',
    courseCode: 'CML1001',
    type: 'lecture',
    dayOfWeek: 'Tuesday',
    startTime: '13:00',
    endTime: '14:30',
    location: 'Kramer Law LT2',
    color: '#ec4899', // pink
    reminder: true,
  },
  {
    id: 'ev-6',
    title: 'Campus Society Meeting (Debate / Tech Soc)',
    type: 'life',
    dayOfWeek: 'Tuesday',
    startTime: '16:00',
    endTime: '17:30',
    location: 'Students Union Hall B',
    color: '#06b6d4', // cyan
    reminder: false,
  },
  {
    id: 'ev-7',
    title: 'Quiet Study Block & Past Paper Review',
    type: 'study',
    dayOfWeek: 'Wednesday',
    startTime: '11:00',
    endTime: '13:30',
    location: 'Chancellor Oppenheimer Library (2nd Floor)',
    color: '#6366f1', // indigo
    reminder: true,
  },
  {
    id: 'ev-8',
    title: 'Part-Time Tutoring Shift (Matric Maths)',
    type: 'life',
    dayOfWeek: 'Thursday',
    startTime: '15:30',
    endTime: '17:30',
    location: 'Online Zoom / Student Union',
    color: '#10b981',
    reminder: true,
  },
  {
    id: 'ev-9',
    title: 'Midterm Theory Test (Calculus)',
    courseCode: 'MAM1000',
    type: 'exam',
    dayOfWeek: 'Friday',
    startTime: '14:00',
    endTime: '16:00',
    location: 'Sports Hall Exam Venue 1',
    color: '#ef4444', // red
    reminder: true,
  },
];

// Initial Study Materials for Google NotebookLM Clone
export const INITIAL_STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-1',
    title: 'Macroeconomics: Fiscal Policy & Keynesian Multiplier',
    type: 'notes',
    courseCode: 'ECO1010',
    dateAdded: '2 days ago',
    wordCount: 1420,
    selected: true,
    authorOrSpeaker: 'Prof. K. Daniels (Lecture 14)',
    content: `## Chapter 4: Keynesian Cross and Fiscal Multipliers in Developing Economies
    
1. The Marginal Propensity to Consume (MPC):
The MPC represents the proportion of an aggregate raise in pay that a consumer spends on goods and services rather than saving it. In South Africa, the MPC for low-to-middle income households is relatively high (estimated around 0.75 to 0.85), as disposable income is immediately directed toward essential food, utilities, and transport.

2. The Autonomous Spending Multiplier Formula:
Multiplier (k) = 1 / (1 - MPC + MPM)
Where MPM is the Marginal Propensity to Import. In an open economy with significant import leakages (fuel, electronics), the multiplier shrinks from k = 1/(1-0.8) = 5 down to roughly 1.8.

3. Government Spending vs Tax Cuts:
- Direct government expenditure increases aggregate demand immediately (shift of AD to the right).
- Tax cuts have a slightly dampened effect because households save or pay down debt with a fraction of the tax rebate.

4. Crowding Out Effect:
When the government runs large fiscal deficits financed by bond issuance, real interest rates may rise, reducing private sector capital investments. However, during economic slumps with excess capacity, crowding in can occur if infrastructure (ports, energy grid) unlocks private productivity.`,
  },
  {
    id: 'mat-2',
    title: 'CSC1015: Algorithms, Recursion & Binary Search Trees',
    type: 'slides',
    courseCode: 'CSC1015',
    dateAdded: '4 days ago',
    wordCount: 1180,
    selected: true,
    authorOrSpeaker: 'Dr. M. Patel (Slide Deck 6)',
    content: `## Module 3: Trees, Recursion & Algorithmic Complexity

1. Binary Search Tree (BST) Properties:
- For every node N, every node in the left subtree has a key strictly less than N.key.
- Every node in the right subtree has a key strictly greater than N.key.
- In-order traversal of a BST always yields the keys in sorted ascending order.

2. Time Complexity Analysis:
- Search / Insert / Delete in a balanced BST (e.g., AVL or Red-Black Tree): O(log n).
- Degenerate BST (inserted in sorted order, forming a linked list): O(n) worst-case.

3. Recursion Base Cases & Call Stack:
Every recursive function requires:
a) Base case(s) that terminate recursion without making further recursive calls.
b) Recursive step that moves parameters toward the base case.
Stack overflow happens when recursion depth exceeds system memory limit (Python default recursion limit is 1000).

4. Python Tree Traversal Implementation:
\`\`\`python
def inorder(root):
    if root is not None:
        inorder(root.left)
        print(root.val)
        inorder(root.right)
\`\`\``,
  },
  {
    id: 'mat-3',
    title: 'South African Commercial Law: Offer, Acceptance & POPIA',
    type: 'pdf',
    courseCode: 'CML1001',
    dateAdded: '1 week ago',
    wordCount: 1890,
    selected: true,
    authorOrSpeaker: 'Faculty of Law Course Pack (Vol. 2)',
    content: `## General Principles of Contract Law & Data Privacy Compliance

1. Essential Elements of a Valid Contract in South African Law:
- Consensus (meeting of the minds / animus contrahendi).
- Contractual capacity (age of majority is 18 in terms of Children's Act 38 of 2005).
- Legality (must not be contra bonos mores or prohibited by statute).
- Possibility of performance at the time of agreement.
- Formalities (general rule: informal contracts are valid; exceptions include sale of immovable property, suretyship).

2. Offer and Acceptance:
An offer is a declaration of intention by one party (offeror) to another (offeree). It must be definite, complete, clear, and made with the intention that its acceptance creates a binding obligation. An invitation to do business (e.g. price tags in a shop) is generally not an offer, but an invitation to treat (Crawley v Rex 1909).

3. Protection of Personal Information Act (POPIA Act 4 of 2013):
- Responsible party must process personal data lawfully, reasonably, and in a manner that does not infringe privacy.
- 8 Core Conditions for Lawful Processing: Accountability, Processing Limitation, Purpose Specification, Further Processing Limitation, Information Quality, Openness, Security Safeguards, Data Subject Participation.
- Data Subject Rights: Section 23 grants right of access; Section 24 grants right to request correction or complete erasure of personal data.`,
  },
];

// Initial Study Chat Messages
export const INITIAL_STUDY_CHAT: StudyChatMessage[] = [
  {
    id: 'smsg-init',
    role: 'assistant',
    text: `👋 Welcome to your **YURLFYE NotebookLM Study Studio**!

I use **Retrieval-Augmented Generation (RAG)** grounded strictly in your 3 selected source materials:
1. 📄 *Macroeconomics: Fiscal Policy & Keynesian Multiplier* (ECO1010)
2. 📄 *Algorithms, Recursion & Binary Search Trees* (CSC1015)
3. 📄 *South African Commercial Law: Offer, Acceptance & POPIA* (CML1001)

You can ask me to explain concepts, generate a custom Study Guide, test you with a quiz, or write flashcards with exact citations!`,
    timestamp: 'Just now',
    citations: [
      { sourceId: 'mat-1', sourceTitle: 'ECO1010 Notes', snippet: 'Keynesian Multiplier formula k = 1 / (1 - MPC + MPM)' },
      { sourceId: 'mat-2', sourceTitle: 'CSC1015 Slides', snippet: 'In-order traversal yields sorted keys in O(n)' },
      { sourceId: 'mat-3', sourceTitle: 'CML1001 Reader', snippet: 'POPIA Act 4 of 2013 Section 24 right of erasure' },
    ],
  },
];
