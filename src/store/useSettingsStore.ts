import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, CertId } from '../types';

interface SettingsState extends AppSettings {
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setActiveCerts: (certs: CertId[]) => void;
  setPrimaryCert: (cert: CertId) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setStreaming: (enabled: boolean) => void;
  reset: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  groqApiKey: '',
  groqModel: 'llama-3.3-70b-versatile',
  activeCertIds: ['security-plus'],
  primaryCertId: 'security-plus',
  theme: 'dark',
  streamingEnabled: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      setApiKey: (key) => set({ groqApiKey: key }),
      setModel: (model) => set({ groqModel: model }),
      setActiveCerts: (certs) => set({ activeCertIds: certs }),
      setPrimaryCert: (cert) => set({ primaryCertId: cert }),
      setTheme: (theme) => set({ theme }),
      setStreaming: (enabled) => set({ streamingEnabled: enabled }),
      reset: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'cybercert-settings',
      partialize: (state) => ({
        groqApiKey: state.groqApiKey,
        groqModel: state.groqModel,
        activeCertIds: state.activeCertIds,
        primaryCertId: state.primaryCertId,
        theme: state.theme,
        streamingEnabled: state.streamingEnabled,
      }),
    }
  )
);