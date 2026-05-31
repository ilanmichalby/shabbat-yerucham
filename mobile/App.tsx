import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';

type Shabbat = {
  parsha: string;
  dateISO: string;
  sunset: string;
  candleLighting: string;
  havdalah: string;
  rabbeinuTam: string;
};

type AppData = {
  current: Shabbat;
  upcoming: Shabbat[];
};

const LAT = 30.9881;
const LON = 34.9269;

function hm(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function addMinutes(iso: string, mins: number): string {
  return hm(new Date(new Date(iso).getTime() + mins * 60000).toISOString());
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

function shortDate(iso: string): string {
  if (!iso) return '';
  const [, m, d] = iso.slice(0, 10).split('-');
  return `${d}.${m}`;
}

async function loadSunset(date: string): Promise<string> {
  try {
    const url =
      `https://www.hebcal.com/zmanim?cfg=json&latitude=${LAT}&longitude=${LON}` +
      `&tzid=Asia%2FJerusalem&date=${date}`;
    const res = await fetch(url);
    const json = await res.json();
    const sunset = json?.times?.sunset;
    return sunset ? hm(sunset) : '--:--';
  } catch {
    return '--:--';
  }
}

async function loadShabbatData(): Promise<AppData> {
  const start = new Date();
  const end = new Date(start.getTime() + 35 * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  const url =
    `https://www.hebcal.com/hebcal?v=1&cfg=json&geo=pos&latitude=${LAT}&longitude=${LON}` +
    `&tzid=Asia%2FJerusalem&c=on&havdalah=42&s=on&maj=on&min=off&mod=off&nx=off` +
    `&start=${fmt(start)}&end=${fmt(end)}`;
  const res = await fetch(url);
  const json = await res.json();
  const items: any[] = json.items ?? [];

  // Group events by their Shabbat (parashat date marks the Saturday).
  const candles = items.filter((i) => i.category === 'candles');
  const havdalot = items.filter((i) => i.category === 'havdalah');
  const parashot = items.filter((i) => i.category === 'parashat');

  const shabbats: Shabbat[] = await Promise.all(
    candles.map(async (c) => {
      const cDate = new Date(c.date);
      // Havdalah is the day after candle lighting.
      const hav = havdalot.find((h) => {
        const diff = (new Date(h.date).getTime() - cDate.getTime()) / 3600000;
        return diff > 0 && diff < 30;
      });
      // Parsha shares the Saturday date with havdalah.
      const par = parashot.find((p) => {
        if (!hav) return false;
        return p.date.slice(0, 10) === hav.date.slice(0, 10);
      });
      return {
        parsha: par?.hebrew ?? par?.title ?? 'שבת',
        dateISO: c.date,
        sunset: await loadSunset(c.date.slice(0, 10)),
        candleLighting: hm(c.date),
        havdalah: hav ? hm(hav.date) : '--:--',
        rabbeinuTam: hav ? addMinutes(hav.date, 8) : '--:--',
      };
    })
  );

  return {
    current: shabbats[0],
    upcoming: shabbats.slice(1, 4),
  };
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadShabbatData().then(setData).catch(() => setError(true));
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>שבת בירוחם</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {!data && !error && (
          <ActivityIndicator color="#e8b65a" style={{ marginTop: 48 }} />
        )}

        {error && (
          <Text style={styles.error}>לא ניתן לטעון את הנתונים. בדוק חיבור לאינטרנט.</Text>
        )}

        {data && (
          <>
            {/* Hero */}
            <View style={styles.hero}>
              <Text style={styles.heroCity}>ירוחם</Text>
              {!!data.current?.parsha && (
                <Text style={styles.heroSub}>
                  {data.current.parsha} · {formatDate(data.current.dateISO)}
                </Text>
              )}
            </View>

            {/* Time cards */}
            <View style={styles.cards}>
              <Card label="כניסת שבת — הדלקת נרות" value={data.current?.candleLighting} highlight />
              <Card label="שקיעה" value={data.current?.sunset} />
              <Card label="צאת השבת" value={data.current?.havdalah} />
              <Card label="צאת שבת (רבנו תם)" value={data.current?.rabbeinuTam} />
            </View>

            {/* Upcoming */}
            {data.upcoming.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>שבתות קרובות</Text>
                <View style={styles.table}>
                  <View style={[styles.tableRow, styles.tableHead]}>
                    <Text style={[styles.th, styles.colTime]}>צאת</Text>
                    <Text style={[styles.th, styles.colTime]}>שקיעה</Text>
                    <Text style={[styles.th, styles.colTime]}>כניסה</Text>
                    <Text style={[styles.th, styles.colParsha]}>פרשה</Text>
                    <Text style={[styles.th, styles.colDate]}>תאריך</Text>
                  </View>
                  {data.upcoming.map((s) => (
                    <View key={s.dateISO} style={styles.tableRow}>
                      <Text style={[styles.tdTime, styles.colTime]}>{s.havdalah}</Text>
                      <Text style={[styles.tdTime, styles.colTime]}>{s.sunset}</Text>
                      <Text style={[styles.tdTime, styles.colTime]}>{s.candleLighting}</Text>
                      <Text style={[styles.tdParsha, styles.colParsha]}>{s.parsha}</Text>
                      <Text style={[styles.td, styles.colDate]}>{shortDate(s.dateISO)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.footer}>הזמנים מיועדים לירוחם בלבד.</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Card({ label, value, highlight }: { label: string; value?: string; highlight?: boolean }) {
  return (
    <View style={[styles.card, highlight && styles.cardHighlight]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value ?? '--:--'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a112c' },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2c356680',
  },
  headerTitle: { color: '#ffd388', fontSize: 22, fontWeight: 'bold' },
  scroll: { padding: 20, paddingBottom: 40 },

  hero: { alignItems: 'center', marginTop: 16, marginBottom: 24 },
  heroCity: { color: '#ffd388', fontSize: 30, fontWeight: '700' },
  heroSub: { color: '#a9b0cc', fontSize: 15, marginTop: 6, textAlign: 'center' },

  cards: { gap: 14 },
  card: {
    backgroundColor: 'rgba(27, 35, 71, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(44, 53, 102, 0.5)',
    borderRadius: 16,
    paddingVertical: 22,
    alignItems: 'center',
  },
  cardHighlight: { borderColor: '#e8b65a66' },
  cardLabel: { color: '#a9b0cc', fontSize: 14, marginBottom: 10 },
  cardValue: { color: '#f1be62', fontSize: 44, fontWeight: '700', letterSpacing: -1 },

  section: { marginTop: 32 },
  sectionTitle: {
    color: '#ffd388',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 14,
    textAlign: 'right',
  },
  table: {
    backgroundColor: 'rgba(27, 35, 71, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(44, 53, 102, 0.5)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2c356633',
  },
  tableHead: { backgroundColor: '#22284480' },
  th: { color: '#a9b0cc', fontSize: 12, fontWeight: '500' },
  td: { color: '#f5f1e6', fontSize: 15 },
  tdParsha: { color: '#f5f1e6', fontSize: 15, fontWeight: '500' },
  tdTime: { color: '#f1be62', fontSize: 15 },
  colDate: { flex: 1.1, textAlign: 'right' },
  colParsha: { flex: 2, textAlign: 'right' },
  colTime: { flex: 1, textAlign: 'center' },

  footer: { color: '#6b7399', fontSize: 12, textAlign: 'center', marginTop: 32 },
  error: { color: '#a9b0cc', fontSize: 16, marginTop: 48, textAlign: 'center' },
});
