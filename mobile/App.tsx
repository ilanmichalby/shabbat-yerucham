import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a112c', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#e8b65a', fontSize: 28, fontWeight: 'bold' }}>שבת בירוחם</Text>
      <Text style={{ color: '#a9b0cc', fontSize: 16, marginTop: 8 }}>כניסת שבת 19:08</Text>
    </View>
  );
}

// ---- Design tokens (from .stitch/DESIGN.md "Nocturnal Sanctuary") ----
const C = {
  bg: '#0a112c',
  card: 'rgba(27, 35, 71, 0.85)',
  cardBorder: 'rgba(44, 53, 102, 0.6)',
  cardLow: '#131a35',
  cardHigh: '#222844',
  hairline: 'rgba(79, 69, 55, 0.3)',
  gold: '#e8b65a',
  goldDim: '#f1be62',
  goldText: '#ffd388',
  parchment: '#f5f1e6',
  muted: '#a9b0cc',
};

const FONT = {
  light: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-light',
  regular: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
  medium: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
  bold: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif',
};

// ---- Data ----
const THIS_WEEK = {
  place: 'ירוחם',
  context: 'פרשת ואתחנן | ט"ו באב תשפ"ד | 16 באוגוסט 2024',
  candle: '19:08',
  havdalah: '20:12',
};

const UPCOMING = [
  { date: '23.08', parasha: 'פרשת עקב', candle: '18:59', havdalah: '20:02' },
  { date: '30.08', parasha: 'פרשת ראה', candle: '18:50', havdalah: '19:53' },
  { date: '06.09', parasha: 'פרשת שופטים', candle: '18:40', havdalah: '19:42' },
  { date: '13.09', parasha: 'פרשת כי תצא', candle: '18:30', havdalah: '19:32' },
  { date: '20.09', parasha: 'פרשת כי תבוא', candle: '18:20', havdalah: '19:22' },
];

type Tab = 'home' | 'times' | 'about';

function Header() {
  return (
    <View style={styles.header}>
      <Text style={styles.brand}>שבת בירוחם</Text>
      <Text style={styles.gear}>⚙︎</Text>
    </View>
  );
}

function HomeScreen() {
  return (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{THIS_WEEK.place}</Text>
        <Text style={styles.heroSub}>{THIS_WEEK.context}</Text>
      </View>

      <TimeCard
        icon="☀︎"
        label="כניסת שבת — הדלקת נרות"
        time={THIS_WEEK.candle}
        glow
      />
      <TimeCard icon="★" label="צאת השבת" time={THIS_WEEK.havdalah} />

      <View style={styles.banner}>
        <Image
          source={{
            uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD4TM7vsCFY4L_rzGi_zM9SWmqc0oZus4qSWwWDNwdHOuhU1jYC1QbFHAtIVXvv6RK2KL1TlUjLPZoRcdpt3xbcXPJ8dNQe4lc-w8Yb-0wKy0ZEAoD2IXM1g3yRbBIoZ2ojkMo8mxx2kft_nenJADmjpiJuywEfZYPFrZmfe0F46LP0zA7MYL0HLGf11AKOyHF0YbbR4WLwZ-wY9nJkkrHncI8qwRFvxKAS3Tk-1Hy_Y41gWIMlaI-M86-PVsMLA09kIxbzmM4Ras',
          }}
          style={styles.bannerImg}
        />
        <Text style={styles.bannerText}>שבת שלום מירוחם</Text>
      </View>

      <Text style={styles.sectionTitle}>שבתות קרובות</Text>
      <UpcomingTable rows={UPCOMING.slice(0, 3)} />
    </View>
  );
}

function TimesScreen() {
  return (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>זמני שבת בירוחם</Text>
        <Text style={styles.heroSub}>כניסת ויציאת שבת לשבועות הקרובים</Text>
      </View>
      <View style={styles.nearPill}>
        <Text style={styles.nearPillText}>השבת הקרובה</Text>
      </View>
      <UpcomingTable
        rows={[
          {
            date: '16.08',
            parasha: 'פרשת ואתחנן',
            candle: THIS_WEEK.candle,
            havdalah: THIS_WEEK.havdalah,
          },
          ...UPCOMING,
        ]}
        highlightFirst
      />
      <Text style={styles.note}>הזמנים מחושבים עבור מיקומה של ירוחם.</Text>
    </View>
  );
}

function AboutScreen() {
  return (
    <View>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>אודות</Text>
        <Text style={styles.heroSub}>על אופן חישוב הזמנים</Text>
      </View>
      <View style={styles.aboutCard}>
        <Text style={styles.aboutText}>
          האפליקציה מציגה את זמני כניסת השבת (הדלקת נרות) וצאת השבת (הבדלה)
          עבור העיר ירוחם שבנגב.
        </Text>
        <Text style={styles.aboutText}>
          זמן הדלקת הנרות מחושב 20 דקות לפני השקיעה, וצאת השבת לפי שיטת
          הזמן המקובל. הזמנים מבוססים על מיקומה הגאוגרפי של ירוחם.
        </Text>
        <Text style={styles.aboutText}>שבת שלום ומבורך! 🕯️</Text>
      </View>
    </View>
  );
}

function TimeCard({
  icon,
  label,
  time,
  glow,
}: {
  icon: string;
  label: string;
  time: string;
  glow?: boolean;
}) {
  return (
    <View style={[styles.card, glow && styles.cardGlow]}>
      <Text style={[styles.cardIcon, { color: glow ? C.goldDim : C.muted }]}>
        {icon}
      </Text>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardTime}>{time}</Text>
    </View>
  );
}

function UpcomingTable({
  rows,
  highlightFirst,
}: {
  rows: { date: string; parasha: string; candle: string; havdalah: string }[];
  highlightFirst?: boolean;
}) {
  return (
    <View style={styles.table}>
      <View style={[styles.tr, styles.thead]}>
        <Text style={[styles.th, styles.colDate]}>תאריך</Text>
        <Text style={[styles.th, styles.colParasha]}>פרשה</Text>
        <Text style={[styles.th, styles.colTime]}>כניסה</Text>
        <Text style={[styles.th, styles.colTime]}>צאת</Text>
      </View>
      {rows.map((r, i) => (
        <View
          key={r.date}
          style={[
            styles.tr,
            i < rows.length - 1 && styles.trBorder,
            highlightFirst && i === 0 && styles.trHighlight,
          ]}
        >
          <Text style={[styles.td, styles.colDate]}>{r.date}</Text>
          <Text style={[styles.td, styles.colParasha, styles.tdMedium]}>
            {r.parasha}
          </Text>
          <Text style={[styles.tdTime, styles.colTime]}>{r.candle}</Text>
          <Text style={[styles.tdTime, styles.colTime]}>{r.havdalah}</Text>
        </View>
      ))}
    </View>
  );
}

function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: { key: Tab; icon: string; label: string }[] = [
    { key: 'about', icon: 'ⓘ', label: 'אודות' },
    { key: 'times', icon: '🕐', label: 'זמנים' },
    { key: 'home', icon: '⌂', label: 'בית' },
  ];
  return (
    <View style={styles.bottomNav}>
      {items.map((it) => {
        const active = tab === it.key;
        return (
          <Pressable
            key={it.key}
            style={styles.navItem}
            onPress={() => setTab(it.key)}
          >
            <Text style={[styles.navIcon, active && styles.navIconActive]}>
              {it.icon}
            </Text>
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },

  header: {
    height: 60,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.hairline,
    backgroundColor: C.bg,
  },
  brand: { fontFamily: FONT.bold, fontSize: 22, color: C.goldText },
  gear: { fontSize: 20, color: C.goldText },

  hero: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  heroTitle: {
    fontFamily: FONT.bold,
    fontSize: 30,
    color: C.goldText,
    marginBottom: 6,
  },
  heroSub: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: C.muted,
    textAlign: 'center',
  },

  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  cardGlow: {
    shadowColor: C.gold,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  cardIcon: { fontSize: 30, marginBottom: 8 },
  cardLabel: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: C.muted,
    marginBottom: 14,
  },
  cardTime: {
    fontFamily: FONT.bold,
    fontSize: 52,
    color: C.gold,
    letterSpacing: -1,
  },

  banner: {
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    justifyContent: 'flex-end',
  },
  bannerImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  bannerText: {
    fontFamily: FONT.medium,
    color: C.parchment,
    fontSize: 14,
    textAlign: 'right',
    padding: 16,
  },

  sectionTitle: {
    fontFamily: FONT.medium,
    fontSize: 22,
    color: C.goldText,
    marginBottom: 12,
    textAlign: 'right',
  },

  table: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tr: { flexDirection: 'row-reverse', alignItems: 'center', padding: 14 },
  thead: { backgroundColor: C.cardHigh },
  trBorder: { borderBottomWidth: 1, borderBottomColor: C.hairline },
  trHighlight: { backgroundColor: 'rgba(232,182,90,0.10)' },
  th: { fontFamily: FONT.medium, fontSize: 12, color: C.muted, textAlign: 'right' },
  td: { fontFamily: FONT.regular, fontSize: 15, color: C.parchment, textAlign: 'right' },
  tdMedium: { fontFamily: FONT.medium },
  tdTime: { fontFamily: FONT.bold, fontSize: 14, color: C.goldDim, textAlign: 'right' },
  colDate: { width: 56 },
  colParasha: { flex: 1 },
  colTime: { width: 52 },

  nearPill: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(232,182,90,0.15)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 12,
  },
  nearPillText: { fontFamily: FONT.medium, fontSize: 12, color: C.gold },
  note: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.muted,
    textAlign: 'center',
    marginTop: 16,
  },

  aboutCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 16,
    padding: 24,
    gap: 14,
  },
  aboutText: {
    fontFamily: FONT.regular,
    fontSize: 16,
    lineHeight: 26,
    color: C.parchment,
    textAlign: 'right',
  },

  bottomNav: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: C.hairline,
    backgroundColor: C.bg,
  },
  navItem: { alignItems: 'center', gap: 2 },
  navIcon: { fontSize: 20, color: C.muted },
  navIconActive: { color: C.goldText },
  navLabel: { fontFamily: FONT.medium, fontSize: 10, color: C.muted },
  navLabelActive: { color: C.goldText },
});
