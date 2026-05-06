import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BiodataInput, JenisDokumen } from '@/lib/validations/schemas'

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error'

interface DokumenState {
  status:    UploadStatus
  fileName?: string
  error?:    string
}

interface PendaftaranStore {
  // State
  currentStep:    number
  pendaftaranId:  string | null
  biodataData:    Partial<BiodataInput>
  prodiId:        string | null
  prodiNama:      string | null
  dokumenStatus:  Partial<Record<JenisDokumen, DokumenState>>

  // Actions
  setStep:         (step: number) => void
  setPendaftaranId:(id: string) => void
  saveBiodata:     (data: Partial<BiodataInput>) => void
  setProdi:        (id: string, nama: string) => void
  setDokumenStatus:(jenis: JenisDokumen, state: DokumenState) => void
  resetStore:      () => void
}

const initialState = {
  currentStep:   0,
  pendaftaranId: null,
  biodataData:   {},
  prodiId:       null,
  prodiNama:     null,
  dokumenStatus: {},
}

export const usePendaftaranStore = create<PendaftaranStore>()(
  persist(
    (set) => ({
      ...initialState,

      setStep:          (step) => set({ currentStep: step }),
      setPendaftaranId: (id)   => set({ pendaftaranId: id }),

      saveBiodata: (data) =>
        set((state) => ({ biodataData: { ...state.biodataData, ...data } })),

      setProdi: (id, nama) => set({ prodiId: id, prodiNama: nama }),

      setDokumenStatus: (jenis, dokState) =>
        set((state) => ({
          dokumenStatus: { ...state.dokumenStatus, [jenis]: dokState },
        })),

      resetStore: () => set(initialState),
    }),
    {
      name:    'ppds-pendaftaran-draft',
      storage: createJSONStorage(() => localStorage),
      // PENTING: Hanya persist data non-sensitif
      partialize: (state) => ({
        currentStep:   state.currentStep,
        pendaftaranId: state.pendaftaranId,
        prodiId:       state.prodiId,
        prodiNama:     state.prodiNama,
        dokumenStatus: state.dokumenStatus,
        // biodataData TIDAK di-persist (berisi NIK dan data sensitif)
      }),
    }
  )
)
