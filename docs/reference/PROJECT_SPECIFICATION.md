# Finanza - Personal Finance Assistant App 
## Complete Project Specification Document

---

### 🎯 **Executive Summary**

Finanza is an intelligent personal finance management application specifically designed for Tunisian users. The app features a unique animated coin avatar assistant that speaks in authentic Tunisian dialect, providing financial guidance, motivation, and smart notifications. Built with modern technology stack including Expo, Supabase, and NativeWind.

---

## 🎨 **Brand Identity & Visual Design**

### Color Palette
- **Primary Violet:** `#7F56D9` - Main brand color
- **Secondary Orange:** `#FFA94D` - Accent and highlights  
- **Success Green:** `#10B981` - Positive financial actions
- **Warning Red:** `#EF4444` - Alerts and debt warnings
- **Neutral Gray:** `#6B7280` - Secondary text
- **Background Light:** `#F9FAFB` - App background
- **Background Dark:** `#111827` - Dark mode support

### Typography
- **Primary Font:** Inter (Arabic + Latin support)
- **Arabic Font:** Noto Sans Arabic
- **Display Font:** Poppins (for headings)

### Avatar Design
- **Finanza Coin Avatar:** Animated gold coin with:
  - Expressive eyes 👀
  - Friendly smile 😊  
  - Small legs for walking animations 🦵
  - Arms for gesturing 🤲
  - Various emotional states (happy, concerned, excited)

---

## 🗣️ **Language & Localization**

### Primary Language: Tunisian Arabic Dialect

**Sample Phrases Used Throughout App:**
- "Ahla w sahla ya [username]!" (Welcome!)
- "Ya sahbi, khalik maana nrakhou el budget!" (Buddy, let's organize the budget!)
- "Yezzi mel masrouf, yalla yalla!" (Enough spending, come on!)
- "El but mte3na wsel! Mabrouk!" (Our goal is reached! Congratulations!)
- "Tawa nsajlou el masrouf?" (Should we record the expense now?)
- "Rak 3andek factora tkhalles!" (You have a bill to pay!)
- "Chkoun 9al lik tosrof heka?" (Who told you to spend like this?)
- "Finanza t9oulek: wakt el idikhar!" (Finanza tells you: saving time!)

### Tone & Personality
- **Friendly:** Like talking to a close friend (sahbi/sahbti)
- **Motivational:** Encouraging without being pushy
- **Humorous:** Light jokes about spending habits
- **Culturally Aware:** References to Tunisian lifestyle and culture
- **Respectful:** Adapts formality based on user preferences

---

## 🏗️ **Technical Architecture**

### Frontend Stack
```
React Native (0.79.5)
├── Expo SDK 53
├── Expo Router (File-based routing)
├── NativeWind (Tailwind CSS for React Native)
├── React Native Reanimated (Animations)
├── Expo Voice (Speech recognition)
├── Expo Notifications (Push notifications)
├── Expo Image Picker (Receipt uploads)
└── React Native Chart Kit (Financial graphs)
```

### Backend Stack
```
Supabase
├── PostgreSQL Database
├── Real-time subscriptions
├── Row Level Security (RLS)
├── Authentication (Email/Phone)
├── Storage (Receipt images)
├── Edge Functions (Notifications logic)
└── Database Triggers (Auto-calculations)
```

### Database Schema Overview
```sql
-- Users table
users (id, email, name, avatar_url, language, profile_type, created_at)

-- Transactions table  
transactions (id, user_id, type, amount, category, description, date, receipt_url)

-- Budget table
budgets (id, user_id, month_year, total_amount, categories_json)

-- Savings Goals table
savings_goals (id, user_id, name, target_amount, current_amount, deadline)

-- Debts table
debts (id, user_id, type, person_name, amount, due_date, is_paid)

-- Bills table
bills (id, user_id, name, amount, due_date, is_recurring, reminder_days)

-- Notifications table
notifications (id, user_id, type, message, is_read, scheduled_for)
```

---

## 🎭 **Finanza Avatar System**

### Avatar Personality
- **Name:** Finanza (فينانزا)
- **Gender:** Neutral (but user can choose voice preference)
- **Personality Traits:**
  - Wise but fun financial advisor
  - Supportive friend who cares about user's financial wellness
  - Occasionally teasing about bad spending habits
  - Celebrates financial wins enthusiastically

### Animation States
1. **Idle:** Gentle breathing, occasional blinks
2. **Speaking:** Mouth movements synced with text-to-speech
3. **Happy:** Jumping with sparkles when goals achieved
4. **Concerned:** Worried expression for overspending
5. **Excited:** Fast movements for positive notifications
6. **Sleeping:** Closed eyes for night mode

### Voice System
- **Text-to-Speech:** Arabic language support
- **Voice Options:** 
  - Male voice (Tunisian accent)
  - Female voice (Tunisian accent)
- **Speech Recognition:** Tunisian Arabic dialect recognition
- **Wake Words:** "Ya Finanza" or "Finanza"

---

## 📱 **Core Features Specification**

### 1. Welcome & Onboarding Flow

#### Welcome Screen
```
[Animated Finanza coin bouncing]
"Ahla w sahla fi Finanza! 
Ana mawjoud besh na3awnek fi florsk!"

[Continue Button] → Create Account
```

#### Account Creation
- Name input with Tunisian keyboard support
- Profile photo upload option
- Language selection (Arabic/French/English)
- Voice preference (Male/Female)

#### Financial Profile Quiz
1. "Kemm tosrof fi shhar 3adi?" (How much do you spend monthly?)
2. "3andek objectifs idikhar?" (Do you have savings goals?)
3. "Todfor bi credit wala cash?" (Do you pay by credit or cash?)
4. "3andek dyoun?" (Do you have debts?)

**Profile Types Generated:**
- **Prudent (Haris):** Careful spender, saves regularly
- **Balanced (Moutawazin):** Good balance between spending and saving  
- **Spender (Masrouf):** Enjoys spending, needs budget guidance

### 2. Dashboard (Home Screen)

#### Financial Overview Cards
```
┌─ 💰 Total Cash ─────────────────┐
│  1,250 TND                      │
│  ↗️ +150 from last month        │
└─────────────────────────────────┘

┌─ 📊 Monthly Budget ─────────────┐
│  650/800 TND used               │
│  ⚠️ 18% remaining               │
│  [Progress Bar: 82% filled]     │
└─────────────────────────────────┘

┌─ 🎯 Savings Goals ──────────────┐
│  Summer Vacation: 75% (3/4)     │
│  New Car: 45% (9/20)           │
│  [View All Goals]               │
└─────────────────────────────────┘

┌─ 💸 This Month ─────────────────┐
│  Expenses: 650 TND              │
│  Income: 1,200 TND              │
│  Net: +550 TND                  │
└─────────────────────────────────┘
```

#### Finanza Avatar Interactions
- **Morning:** "Sbah el kheir! Shnowa plan el youm?"
- **Evening:** "Kifesh kan naharkom? Nsajlou masrouf?"
- **Budget Alert:** "Ya sahbi! Budget 9rib yekmal!"
- **Goal Achievement:** "Mabrouk! Objectif mte3ek wsel!"

### 3. Transaction Management

#### Add Transaction Flow
```
[+ Add Transaction Button]
↓
┌─ Transaction Type ──────────────┐
│ 💸 Expense                      │
│ 💰 Income                       │  
│ 🏛️ Savings                      │
│ 💳 Debt Payment                 │
│ 📄 Bill                         │
└─────────────────────────────────┘
↓
┌─ Amount Input ──────────────────┐
│ Amount: [___] TND               │
│ Category: [Dropdown]            │
│ Date: [Calendar Picker]         │
│ Description: [Text Input]       │
│ Receipt: [📷 Add Photo]         │
└─────────────────────────────────┘
```

#### Voice Input Feature
- **Activation:** "Ya Finanza, sajel masrouf"
- **Sample Commands:**
  - "Sraft 25 dinar 3al 9ahwa" → Expense: 25 TND, Category: Food
  - "Jani 500 dinar mel khedma" → Income: 500 TND
  - "Khalast factorat noor 80 dinar" → Bill: 80 TND, Electricity

#### Transaction Categories
**Expenses:**
- 🍽️ Food & Dining (Makla w Sharba)
- 🚗 Transportation (Transport)  
- 🛒 Shopping (Shira)
- 🏠 Bills (Facturat)
- 💊 Health (Saha)
- 🎯 Entertainment (Tarfih)
- 👔 Clothing (Hwayej)
- 📚 Education (Ta3lim)
- 💰 Other (Okhra)

**Income:**
- 💼 Salary (Murtab)
- 💰 Business (Tijara)
- 🎁 Gifts (Hadaya)
- 💸 Side Income (Dekhl Idafi)

### 4. Budget Management

#### Budget Creation Wizard
```
Step 1: Set Monthly Income
"Kemm dakhlak fi shahr?"
[Amount Input: ___ TND]

Step 2: Essential Expenses
"Kemm testahl fi facturat w hwayej dharouriya?"
- Rent: ___ TND
- Utilities: ___ TND  
- Food: ___ TND
- Transport: ___ TND

Step 3: Category Allocation
"Ba9i amount: 300 TND"
"Kifesh thabeb t9asemha?"
- Entertainment: ___ TND
- Shopping: ___ TND
- Savings: ___ TND
```

#### Budget Tracking & Alerts
- **Daily Check:** "Masrouf el youm: 45 TND"
- **Weekly Review:** "Jom3a zina! Ba9i 3andek 125 TND"
- **Overspending Alert:** "Yezzi! Category Food fatat el budget!"
- **Smart Suggestions:** "Thabeb n9allek men Shopping lel Savings?"

### 5. Savings Goals System

#### Goal Creation
```
┌─ Create Savings Goal ───────────┐
│ Goal Name: [Summer Vacation]    │
│ Target Amount: [2000] TND       │
│ Deadline: [📅 July 2025]       │
│ Monthly Contribution: [166] TND │
│                                 │
│ "Besh nwasslou lel hedaf!"      │
│ [Create Goal]                   │
└─────────────────────────────────┘
```

#### Progress Tracking
- **Visual Progress:** Animated progress bars
- **Milestone Celebrations:** 25%, 50%, 75%, 100%
- **Motivational Messages:**
  - 25%: "Bid2a zina! Kemmel heka!"
  - 50%: "Nos tariq! Rak fi good track!"
  - 75%: "9rib nwasslou! Final push!"
  - 100%: "MABROUK! Hedaf achieved! 🎉"

#### Smart Savings Suggestions
- **Round-up:** "Thabeb n3amlouk round-up lel idikhar?"
- **Spare Change:** "3andek 15 TND extra. Nsajlouhom fil hedaf?"
- **Challenge Mode:** "Challenge: 7 days bla masrouf gher dharouri!"

### 6. Debt & Bills Management

#### Debt Tracking
```
Two Categories:
┌─ Money I Owe (Ana Madyoun) ─────┐
│ 🏪 Grocery Store: 120 TND       │
│   Due: Tomorrow                 │
│   [Pay Now] [Remind Later]      │
│                                 │
│ 👤 Ahmed: 50 TND                │
│   Due: Next week                │
│   [Mark Paid] [Extend]          │
└─────────────────────────────────┘

┌─ Money Owed to Me (Madyounili) ─┐
│ 👤 Sara: 80 TND                 │
│   Since: 2 weeks ago            │
│   [Remind] [Mark Paid]          │
│                                 │
│ 👤 Karim: 200 TND               │
│   Since: 1 month ago            │
│   [Send Reminder] [Write Off]   │
└─────────────────────────────────┘
```

#### Bill Management
- **Recurring Bills:** Automatic monthly entries
- **Due Date Alerts:** 3 days, 1 day, day-of reminders
- **Payment Tracking:** Mark as paid, partial payments
- **Late Payment:** "Ya sahbi! Factora ta5ret!"

### 7. Smart Notification System

#### Notification Types & Examples

**Daily Motivations:**
- "Sbah el nour! Ready lel financial wins el youm?"
- "Youm jdid, choices jdida! Khalina nrakhou el budget!"

**Spending Alerts:**
- "Alert! Sraft 30% men budget food fi youm wehad!"
- "Spending pattern detected: coffee 3 times today!"

**Savings Reminders:**
- "Ma dakhaltech flous lel idikhar el osb3a hedhi!"
- "Reminder: vacation fund needs 167 TND hedha eshahr!"

**Debt Reminders:**
- "Facturat internet t5als ghodwa!"
- "Ahmed ma5lasch el 50 TND yet. Thabeb tfakarhou?"

**Achievement Celebrations:**
- "MABROUK! Wslét lel 1000 TND savings!"
- "Success! Month kemmlét bla overspending!"

**Funny/Cultural References:**
- "Masrouf mta3 el qahwa wlét akther men el makla! 😅"
- "Rak t9elli ken ma sraftech heka, tawa 3andek villa! 🏠"
- "Idikhar mte3ek ya3mel bik millionaire yaw ma yaw! 💰"

### 8. Financial Calendar

#### Calendar View Features
```
Monthly Calendar with:
📅 Transaction dots (color-coded)
💰 Income days (green dots)
💸 Expense days (red dots)  
💳 Bill due dates (orange alerts)
🎯 Savings contributions (blue dots)
⚠️ Debt deadlines (red alerts)

Daily View:
- All transactions for selected day
- Upcoming bills/debts (next 7 days)
- Quick add transaction
- Finanza daily tip
```

#### Smart Scheduling
- **Paycheck Prediction:** "Murtab jay fi 3 days!"
- **Bill Clustering:** "5 bills dus fi nefs el week!"
- **Spend Timing:** "Weekend = high spending zone!"

### 9. Analytics & Reports

#### Monthly Financial Report
```
┌─ Month Summary: January 2025 ───┐
│                                 │
│ 📊 Total Income: 1,800 TND      │
│ 💸 Total Expenses: 1,200 TND    │
│ 💰 Net Savings: 600 TND         │
│ 📈 vs Last Month: +15%          │
│                                 │
│ Top Spending Categories:        │
│ 1. Food: 350 TND (29%)          │
│ 2. Transport: 200 TND (17%)     │
│ 3. Bills: 180 TND (15%)         │
│                                 │
│ 🎯 Goals Progress:              │
│ ✅ Vacation: +250 TND           │
│ ⚠️ Car: +50 TND (behind goal)   │
│                                 │
│ 💡 Finanza Insights:            │
│ "Spending 3al makla zéd 20%     │
│ compared to last month."        │
└─────────────────────────────────┘
```

#### Visual Charts
- **Expense Pie Chart:** Category breakdown
- **Income vs Expense Line Graph:** Monthly trends
- **Savings Progress:** Goal achievement timelines
- **Spending Heatmap:** High/low spending days

### 10. Profile & Settings

#### User Profile Management
```
┌─ Profile Settings ──────────────┐
│ 📷 [Profile Photo]              │
│ Name: Ahmed Ben Ali             │
│ Email: ahmed@email.com          │
│ Phone: +216 XX XXX XXX          │
│                                 │
│ Financial Profile: Balanced     │
│ [Retake Assessment Quiz]        │
│                                 │
│ 🗣️ Language: العربية التونسية    │
│ 🔊 Voice: Male (Tunisian)       │
│ 🔔 Notifications: Enabled       │
│                                 │
│ [Save Changes]                  │
└─────────────────────────────────┘
```

#### App Preferences
- **Theme:** Light/Dark/Auto
- **Currency:** TND (primary), EUR, USD
- **Notification Frequency:** High/Medium/Low/Off
- **Finanza Avatar:** Show/Hide animations
- **Voice Commands:** Enabled/Disabled
- **Data Backup:** Auto-sync to cloud

---

## 🔔 **Notification Engine Specification**

### Smart Notification Logic

#### Spending Pattern Analysis
```javascript
// Pseudo-code for notification triggers
if (dailySpending > (monthlyBudget / 30) * 1.5) {
  sendNotification("Ya sahbi! Masrouf el youm 3ali! 💸")
}

if (categorySpending['Food'] > categoryBudget['Food'] * 0.8) {
  sendNotification("Food budget 9rib yekmal! Ba9i 20% 😬")
}

if (consecutiveDaysWithoutSavings > 7) {
  sendNotification("Osb3a kémla bla idikhar! Thabeb nrakhou shwaya? 💰")
}
```

#### Contextual Notifications
- **Weekend Alerts:** "Weekend = masrouf danger zone! 😄"
- **Payday Celebration:** "Murtab wsel! Time lel budget planning! 🎉"
- **Month-end Review:** "Shahr kémel! Kifesh kan performance? 📊"

### Notification Personalization
- **User Behavior Learning:** Adapt timing and tone
- **Financial Profile Integration:** Different messages for different profiles
- **Cultural Events:** Ramadan, Eid, New Year spending tips
- **Weather Integration:** "Shta... maybe skip the café today? ☔"

---

## 🔒 **Security & Privacy**

### Data Protection
- **Encryption:** All financial data encrypted at rest and in transit
- **Local Storage:** Sensitive data stored locally with encryption
- **Biometric Lock:** Face ID / Fingerprint / PIN protection
- **Session Management:** Auto-logout after inactivity

### Privacy Features
- **Data Minimization:** Only collect necessary financial data
- **No Sharing:** Financial data never shared with third parties
- **Export Control:** User can export and delete all data
- **Anonymized Analytics:** Usage patterns without personal data

---

## 🚀 **Implementation Phases**

### Phase 1: Core MVP (Months 1-2)
- [ ] User authentication and profile setup
- [ ] Basic transaction management (add/view/edit/delete)
- [ ] Simple budget creation and tracking
- [ ] Finanza avatar basic animations
- [ ] Essential notifications

### Phase 2: Intelligence Layer (Month 3)
- [ ] Voice input for transactions
- [ ] Smart notification engine
- [ ] Savings goals system
- [ ] Basic analytics and charts
- [ ] Tunisian dialect text-to-speech

### Phase 3: Advanced Features (Month 4)
- [ ] Debt and bill management
- [ ] Financial calendar
- [ ] Advanced analytics and reports
- [ ] Receipt scanning with OCR
- [ ] Enhanced avatar interactions

### Phase 4: Polish & Launch (Month 5)
- [ ] Performance optimization
- [ ] Advanced voice recognition
- [ ] UI/UX refinements
- [ ] Testing and bug fixes
- [ ] App store preparation

---

## 📊 **Success Metrics**

### User Engagement
- **Daily Active Users:** Target 70% retention
- **Transaction Entry:** Average 3+ transactions per day
- **Voice Usage:** 40% of users using voice features
- **Notification Interaction:** 60% click-through rate

### Financial Impact
- **Budget Adherence:** 80% of users stay within budget
- **Savings Goals:** 65% goal completion rate
- **Debt Reduction:** Average 25% debt reduction in 6 months

### App Performance
- **Load Time:** < 2 seconds app startup
- **Crash Rate:** < 0.5% sessions
- **User Satisfaction:** 4.5+ stars average rating

---

This specification serves as the complete blueprint for building Finanza. Each section can be expanded into detailed technical documentation during the development phase.
