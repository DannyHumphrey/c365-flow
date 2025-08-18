import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { syncOnce } from './syncEngine';

export function useOfflineSync() {
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        syncOnce();
      }
    });
    return () => unsub();
  }, []);
}

