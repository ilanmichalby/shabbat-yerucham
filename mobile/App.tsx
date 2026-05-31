import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';

type ShabbatData = {
  parsha: string;
  date: string;
  candleLighting: string;
  havdalah: string;
  rabbeinuTam: string;
};

function formatTimeFromISO(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function addMinutes(iso: string, mins: number): string {
  const d = new Date(new Date(iso).getTime() + mins * 60000);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

async function loadShabbatTimes(): Promise<ShabbatData> {
  const url =
    'https://www.hebcal.com/shabbat?cfg=json&geo=pos&latitude=30.9881&longitude=34.9269&tzid=Asia%2FJerusalem&havdalah=42&leyning=off';
  const res = await fetch(url);
  const json = await res.json();
  const items: any[] = json.items ?? [];
  const candles = items.find((i) => i.category === 'candles');
  const havdalah = items.find((i) => i.category === 'havdalah');
  const parashat = items.find((i) => i.category === 'parashat');
  return {
    parsha: parashat?.hebrew ?? parashat?.title ?? '',
    date: candles?.date?.slice(0, 10) ?? '',
    candleLighting: candles ? formatTimeFromISO(candles.date) : '--:--',
    havdalah: havdalah ? formatTimeFromISO(havdalah.date) : '--:--',
    rabbeinuTam: havdalah ? addMinutes(havdalah.date, 8) : '--:--',
  };
}

export default function App() {
  const [data, setData] = useState<ShabbatData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadShabbatTimes().then(setData).catch(() => setError(true));
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>שבת בירוחם</Text>

        {!data && !error && (
          <ActivityIndicator color="#e8b65a" style={{ marginTop: 32 }} />
        )}

        {error && (
          <Text style={styles.error}>לא ניתן לטעון את הנתונים. בדוק חיבור לאינטרנט.</Text>
        )}

        {data && (
          <>
            {!!data.parsha && <Text style={styles.parsha}>{data.parsha}</Text>}
            {!!data.date && <Text style={styles.date}>{formatDate(data.date)}</Text>}
            <View style={styles.divider} />
            <TimeRow label="הדלקת נרות" value={data.candleLighting} />
            <TimeRow label="צאת שבת" value={data.havdalah} />
            <TimeRow label="צאת שבת (רבנו תם)" value={data.rabbeinuTam} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TimeRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowValue}>{value}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a112c' },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: {
    color: '#e8b65a',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  parsha: {
    color: '#a9b0cc',
    fontSize: 18,
    marginTop: 12,
    textAlign: 'center',
  },
  date: {
    color: '#6b7399',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: '#e8b65a44',
    marginVertical: 28,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1e2d5a',
  },
  rowLabel: { color: '#a9b0cc', fontSize: 16, textAlign: 'right' },
  rowValue: { color: '#e8b65a', fontSize: 20, fontWeight: 'bold' },
  error: { color: '#a9b0cc', fontSize: 16, marginTop: 24, textAlign: 'center' },
});