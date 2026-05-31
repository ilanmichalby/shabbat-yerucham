import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  Pressable,
  Modal,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

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

// Times are managed manually via the admin CSV upload and published here.
const DATA_URL =
  'https://raw.githubusercontent.com/ilanmichalby/shabbat-yerucham/main/site/public/shabbat-times.json';

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

type NotifPrefs = {
  friday10: boolean;
  hourBefore: boolean;
  halfHourBefore: boolean;
  custom: { enabled: boolean; weekday: number /* 1=ראשון..7=שבת */; hour: number; minute: number };
};

const DEFAULT_PREFS: NotifPrefs = {
  friday10: false,
  hourBefore: false,
  halfHourBefore: false,
  custom: { enabled: false, weekday: 6 /* שישי */, hour: 10, minute: 0 },
};

const PREFS_KEY = 'notif-prefs-v1';
const ANDROID_CHANNEL = 'shabbat';

// Show notifications even when the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function loadPrefs(): Promise<NotifPrefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFS, ...parsed, custom: { ...DEFAULT_PREFS.custom, ...parsed.custom } };
  } catch {
    return DEFAULT_PREFS;
  }
}

async function savePrefs(prefs: NotifPrefs): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore persistence errors
  }
}

async function ensurePermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: 'התראות שבת',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#e8b65a',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const req = await Notifications.requestPermissionsAsync();
    status = req.status;
  }
  return status === 'granted';
}

// Build a local Date from "YYYY-MM-DD" + "HH:MM" (device-local time), with an
// optional day/minute offset. Parsing the parts manually avoids UTC surprises.
function buildLocalDate(dateISO: string, time: string, dayOffset = 0, minuteOffset = 0): Date {
  const [y, m, d] = dateISO.slice(0, 10).split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d + dayOffset, hh, mm + minuteOffset, 0, 0);
}

async function rescheduleAll(prefs: NotifPrefs, shabbats: Shabbat[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = Date.now();
  const channelId = Platform.OS === 'android' ? ANDROID_CHANNEL : undefined;

  const schedule = async (date: Date, title: string, body: string) => {
    if (date.getTime() <= now) return;
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId },
    });
  };

  for (const s of shabbats) {
    if (!s?.dateISO || !s?.candleLighting) continue;

    if (prefs.friday10) {
      // יום שישי (יום לפני dateISO) בשעה 10:00
      await schedule(
        buildLocalDate(s.dateISO, '10:00', -1),
        'שבת בירוחם 🕯️',
        `שבת ${s.parsha} מתקרבת. כניסת השבת היום בשעה ${s.candleLighting}.`
      );
    }
    if (prefs.hourBefore) {
      await schedule(
        buildLocalDate(s.dateISO, s.candleLighting, -1, -60),
        'שעה לכניסת השבת 🕯️',
        `כניסת שבת ${s.parsha} בעוד שעה, בשעה ${s.candleLighting}.`
      );
    }
    if (prefs.halfHourBefore) {
      await schedule(
        buildLocalDate(s.dateISO, s.candleLighting, -1, -30),
        'חצי שעה לכניסת השבת 🕯️',
        `כניסת שבת ${s.parsha} בעוד חצי שעה, בשעה ${s.candleLighting}.`
      );
    }
  }

  if (prefs.custom.enabled) {
    await Notifications.scheduleNotificationAsync({
      content: { title: 'תזכורת שבת 🕯️', body: 'תזכורת מותאמת אישית לקראת השבת.' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: prefs.custom.weekday,
        hour: prefs.custom.hour,
        minute: prefs.custom.minute,
        channelId,
      },
    });
  }
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

async function loadShabbatData(): Promise<{ data: AppData; all: Shabbat[] }> {
  const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
  const json = await res.json();
  const all: Shabbat[] = (json.shabbats ?? [])
    .slice()
    .sort((a: Shabbat, b: Shabbat) => a.dateISO.localeCompare(b.dateISO));

  // "Current" is the nearest Shabbat that hasn't passed yet.
  const today = new Date().toISOString().slice(0, 10);
  let idx = all.findIndex((s) => s.dateISO >= today);
  if (idx === -1) idx = Math.max(0, all.length - 1);

  return {
    data: {
      current: all[idx],
      upcoming: all.slice(idx + 1, idx + 4),
    },
    all,
  };
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [allShabbats, setAllShabbats] = useState<Shabbat[]>([]);
  const [error, setError] = useState(false);
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    loadShabbatData()
      .then(({ data, all }) => {
        setData(data);
        setAllShabbats(all);
      })
      .catch(() => setError(true));
    loadPrefs().then(setPrefs);
  }, []);

  // Whenever prefs or data change, re-sync the scheduled notifications.
  useEffect(() => {
    if (allShabbats.length === 0) return;
    const anyOn =
      prefs.friday10 || prefs.hourBefore || prefs.halfHourBefore || prefs.custom.enabled;
    if (!anyOn) {
      Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
      return;
    }
    (async () => {
      const granted = await ensurePermissions();
      if (granted) await rescheduleAll(prefs, allShabbats);
    })().catch(() => {});
  }, [prefs, allShabbats]);

  const updatePrefs = useCallback((next: NotifPrefs) => {
    setPrefs(next);
    savePrefs(next);
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>שבת בירוחם</Text>
        <Pressable
          style={styles.bell}
          onPress={() => setSettingsOpen(true)}
          hitSlop={12}
          accessibilityLabel="הגדרות התראות"
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </Pressable>
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

      <SettingsModal
        visible={settingsOpen}
        prefs={prefs}
        onChange={updatePrefs}
        onClose={() => setSettingsOpen(false)}
      />
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

const WEEKDAYS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳']; // index 0 => weekday 1 (ראשון)

function SettingsModal({
  visible,
  prefs,
  onChange,
  onClose,
}: {
  visible: boolean;
  prefs: NotifPrefs;
  onChange: (next: NotifPrefs) => void;
  onClose: () => void;
}) {
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggle = (key: 'friday10' | 'hourBefore' | 'halfHourBefore') => (val: boolean) =>
    onChange({ ...prefs, [key]: val });

  const setCustom = (patch: Partial<NotifPrefs['custom']>) =>
    onChange({ ...prefs, custom: { ...prefs.custom, ...patch } });

  const timeLabel = `${String(prefs.custom.hour).padStart(2, '0')}:${String(
    prefs.custom.minute
  ).padStart(2, '0')}`;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.modalClose}>✕</Text>
            </Pressable>
            <Text style={styles.modalTitle}>התראות</Text>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <SettingRow
              label="יום שישי בבוקר (10:00)"
              value={prefs.friday10}
              onValueChange={toggle('friday10')}
            />
            <SettingRow
              label="שעה לפני כניסת השבת"
              value={prefs.hourBefore}
              onValueChange={toggle('hourBefore')}
            />
            <SettingRow
              label="חצי שעה לפני כניסת השבת"
              value={prefs.halfHourBefore}
              onValueChange={toggle('halfHourBefore')}
            />

            <View style={styles.divider} />

            <SettingRow
              label="התראה מותאמת אישית"
              value={prefs.custom.enabled}
              onValueChange={(val) => setCustom({ enabled: val })}
            />

            {prefs.custom.enabled && (
              <View style={styles.customBox}>
                <Text style={styles.customLabel}>יום בשבוע</Text>
                <View style={styles.daysRow}>
                  {WEEKDAYS.map((d, i) => {
                    const weekday = i + 1;
                    const active = prefs.custom.weekday === weekday;
                    return (
                      <Pressable
                        key={weekday}
                        style={[styles.dayChip, active && styles.dayChipActive]}
                        onPress={() => setCustom({ weekday })}
                      >
                        <Text style={[styles.dayChipText, active && styles.dayChipTextActive]}>
                          {d}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.customLabel}>שעה</Text>
                <Pressable style={styles.timeButton} onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.timeButtonText}>{timeLabel}</Text>
                </Pressable>

                {showTimePicker && (
                  <DateTimePicker
                    mode="time"
                    is24Hour
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    value={(() => {
                      const dt = new Date();
                      dt.setHours(prefs.custom.hour, prefs.custom.minute, 0, 0);
                      return dt;
                    })()}
                    onChange={(event, selected) => {
                      if (Platform.OS !== 'ios') setShowTimePicker(false);
                      if (event.type === 'set' && selected) {
                        setCustom({ hour: selected.getHours(), minute: selected.getMinutes() });
                      }
                    }}
                  />
                )}
              </View>
            )}

            <Text style={styles.modalNote}>
              ההתראות פועלות במכשיר באופן מקומי, ללא צורך בחיבור קבוע. נדרש אישור הרשאת התראות.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SettingRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#2c3566', true: '#e8b65a' }}
        thumbColor={value ? '#f1be62' : '#a9b0cc'}
      />
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0a112c',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  header: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2c356680',
  },
  headerTitle: { color: '#ffd388', fontSize: 22, fontWeight: 'bold' },
  bell: { position: 'absolute', left: 16, top: 0, bottom: 0, justifyContent: 'center' },
  bellIcon: { fontSize: 22 },
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

  // Settings modal
  modalBackdrop: { flex: 1, backgroundColor: '#00000099', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#0f1838',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: { color: '#ffd388', fontSize: 20, fontWeight: '700' },
  modalClose: { color: '#a9b0cc', fontSize: 20 },
  modalScroll: { paddingBottom: 12 },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  settingLabel: { color: '#f5f1e6', fontSize: 16, flex: 1, textAlign: 'right', marginLeft: 12 },
  divider: { height: 1, backgroundColor: '#2c356680', marginVertical: 8 },
  customBox: { marginTop: 4 },
  customLabel: { color: '#a9b0cc', fontSize: 14, textAlign: 'right', marginTop: 12, marginBottom: 8 },
  daysRow: { flexDirection: 'row-reverse', justifyContent: 'space-between' },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2c3566',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: { backgroundColor: '#e8b65a', borderColor: '#e8b65a' },
  dayChipText: { color: '#a9b0cc', fontSize: 14, fontWeight: '600' },
  dayChipTextActive: { color: '#0a112c' },
  timeButton: {
    backgroundColor: 'rgba(27, 35, 71, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(44, 53, 102, 0.5)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  timeButtonText: { color: '#f1be62', fontSize: 22, fontWeight: '700', letterSpacing: 1 },
  modalNote: { color: '#6b7399', fontSize: 12, textAlign: 'right', marginTop: 20, lineHeight: 18 },
});
