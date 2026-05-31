import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a112c', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#e8b65a', fontSize: 28, fontWeight: 'bold' }}>שבת בירוחם</Text>
      <Text style={{ color: '#a9b0cc', fontSize: 16, marginTop: 8 }}>כניסת שבת 19:08</Text>
    </View>
  );
}
