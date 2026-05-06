'use client'
import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ChevronRight, ChevronLeft, Send, Loader2, Save } from 'lucide-react'
import { StepperProgress } from '@/components/registration/StepperProgress'
import { FileDropzone } from '@/components/registration/FileDropzone'
import { usePendaftaranStore } from '@/lib/store/pendaftaranStore'
import { saveDraft, submitPendaftaran, getProgramStudi, getBiodata, getPendaftaranDraft } from '@/lib/actions/pendaftaran'
import { checkProfileComplete } from '@/lib/actions/checkProfile'
import { BiodataSchema, type BiodataInput, type JenisDokumen } from '@/lib/validations/schemas'

// ─── Dokumen wajib ────────────────────────────────────────────
const DOKUMEN_LIST: { jenis: JenisDokumen; label: string; required: boolean }[] = [
  { jenis: 'KTP',                   label: 'KTP / Kartu Tanda Penduduk',          required: true  },
  { jenis: 'IJAZAH_PROFESI',        label: 'Ijazah Profesi Dokter',               required: true  },
  { jenis: 'TRANSKRIP_NILAI',       label: 'Transkrip Nilai',                     required: false },
  { jenis: 'STR',                   label: 'Surat Tanda Registrasi (STR)',         required: true  },
  { jenis: 'SURAT_REKOMENDASI',     label: 'Surat Rekomendasi IDI',               required: true  },
  { jenis: 'SURAT_IZIN_INSTITUSI',  label: 'Surat Izin Pimpinan Institusi',       required: false },
  { jenis: 'BUKTI_BAYAR',           label: 'Bukti Pembayaran Pendaftaran',        required: true  },
]

export default function DaftarPage() {
  const router    = useRouter()
  const store     = usePendaftaranStore()
  const [step, setStep]         = useState(store.currentStep || 1)
  const [saving, startSave]     = useTransition()
  const [submitting, startSubmit] = useTransition()
  const [prodiList, setProdiList] = useState<any[]>([])

  // ─── Step 1: Biodata Form ─────────────────────────────────
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BiodataInput>({
    resolver: zodResolver(BiodataSchema),
    defaultValues: store.biodataData as any,
  })

  useEffect(() => {
    // Fetch Program Studi list
    getProgramStudi().then(setProdiList)

    // Hydrate state from server if refreshing the page
    async function hydrate() {
      // Check Profile Completeness
      const isProfileComplete = await checkProfileComplete()
      if (!isProfileComplete) {
        toast.error('Mohon lengkapi Foto Profil dan Nama Lengkap Anda sebelum mendaftar!')
        router.push('/peserta/settings')
        return
      }

      const [biodata, draft] = await Promise.all([
        getBiodata(),
        getPendaftaranDraft()
      ])

      if (biodata) {
        store.saveBiodata(biodata as any)
        reset(biodata as any) // update form fields
      }

      if (draft) {
        store.setPendaftaranId(draft.id)
        if (draft.program_studi_id) {
          store.setProdi(draft.program_studi_id, draft.program_studi?.nama_prodi ?? '')
        }
        
        // Cek progress step yang sebenarnya
        let serverStep = 1
        if (biodata) serverStep = 2
        if (draft.program_studi_id) serverStep = 3

        if (serverStep > store.currentStep || store.currentStep === 1) {
          store.setStep(serverStep)
          setStep(serverStep)
        }
      }
    }

    // Only hydrate if we don't have biodata in memory (e.g. after refresh)
    if (Object.keys(store.biodataData).length === 0) {
      hydrate()
    }
  }, [store, reset])

  const handleStep1 = async (data: BiodataInput) => {
    startSave(async () => {
      store.saveBiodata(data)
      const result = await saveDraft(1, data)
      if (result.error) { toast.error(result.error); return }
      toast.success('Data diri tersimpan otomatis ✓')
      setStep(2)
      store.setStep(2)
    })
  }

  const handleStep2 = async (prodiId: string, prodiNama: string) => {
    startSave(async () => {
      store.setProdi(prodiId, prodiNama)
      const result = await saveDraft(2, { program_studi_id: prodiId }, store.pendaftaranId ?? undefined)
      if (result.error) { toast.error(result.error); return }
      if (result.pendaftaranId) store.setPendaftaranId(result.pendaftaranId)
      toast.success('Program studi tersimpan ✓')
      setStep(3)
      store.setStep(3)
    })
  }

  const handleSubmitFinal = async () => {
    if (!store.pendaftaranId) { toast.error('ID pendaftaran tidak ditemukan'); return }
    startSubmit(async () => {
      const result = await submitPendaftaran(store.pendaftaranId!)
      if (result.error) { toast.error(result.error); return }
      toast.success('Pendaftaran berhasil disubmit! Silakan tunggu verifikasi.')
      store.resetStore()
      router.push('/peserta/dashboard')
    })
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-in">
          <h1 className="text-2xl font-bold text-slate-800">Formulir Pendaftaran PPDS</h1>
          <p className="text-slate-500 text-sm mt-1">Fakultas Kedokteran Universitas Andalas</p>
        </div>

        {/* Stepper */}
        <div className="card mb-6 animate-in">
          <StepperProgress currentStep={step} />
        </div>

        {/* ─ Step 1: Data Diri ─ */}
        {step === 1 && (
          <div className="card animate-in" key="step1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Data Diri</h2>
                <p className="text-xs text-slate-500 mt-0.5">Isi dengan data sesuai KTP</p>
              </div>
              {saving && (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <Save className="w-3.5 h-3.5" /> Menyimpan...
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit(handleStep1)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">NIK (16 Digit)</label>
                  <input type="text" maxLength={16} className={`input-field ${errors.nik ? 'error' : ''}`}
                    placeholder="3201xxxxxxxxxx" {...register('nik')} />
                  {errors.nik && <p className="error-msg">{errors.nik.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Nama Lengkap (sesuai KTP)</label>
                  <input type="text" className={`input-field ${errors.nama_lengkap ? 'error' : ''}`}
                    placeholder="dr. Nama Anda" {...register('nama_lengkap')} />
                  {errors.nama_lengkap && <p className="error-msg">{errors.nama_lengkap.message}</p>}
                </div>

                <div>
                  <label className="label">Gelar Depan</label>
                  <input type="text" className="input-field" placeholder="dr." {...register('gelar_depan')} />
                </div>
                <div>
                  <label className="label">Gelar Belakang</label>
                  <input type="text" className="input-field" placeholder="M.Kes" {...register('gelar_belakang')} />
                </div>

                <div>
                  <label className="label">Tempat Lahir</label>
                  <input type="text" className={`input-field ${errors.tempat_lahir ? 'error' : ''}`}
                    placeholder="Padang" {...register('tempat_lahir')} />
                  {errors.tempat_lahir && <p className="error-msg">{errors.tempat_lahir.message}</p>}
                </div>
                <div>
                  <label className="label">Tanggal Lahir</label>
                  <input type="date" className={`input-field ${errors.tanggal_lahir ? 'error' : ''}`}
                    {...register('tanggal_lahir')} />
                  {errors.tanggal_lahir && <p className="error-msg">{errors.tanggal_lahir.message}</p>}
                </div>

                <div>
                  <label className="label">Jenis Kelamin</label>
                  <select className={`input-field ${errors.jenis_kelamin ? 'error' : ''}`} {...register('jenis_kelamin')}>
                    <option value="">Pilih...</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                  {errors.jenis_kelamin && <p className="error-msg">{errors.jenis_kelamin.message}</p>}
                </div>
                <div>
                  <label className="label">No. Handphone</label>
                  <input type="tel" className={`input-field ${errors.no_hp ? 'error' : ''}`}
                    placeholder="08xxxxxxxxxx" {...register('no_hp')} />
                  {errors.no_hp && <p className="error-msg">{errors.no_hp.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Alamat Lengkap</label>
                  <textarea className={`input-field ${errors.alamat ? 'error' : ''}`} rows={2}
                    placeholder="Jl. Perintis Kemerdekaan No. 94..." {...register('alamat')} />
                  {errors.alamat && <p className="error-msg">{errors.alamat.message}</p>}
                </div>

                <div>
                  <label className="label">Provinsi</label>
                  <input type="text" className={`input-field ${errors.provinsi ? 'error' : ''}`}
                    placeholder="Sumatera Barat" {...register('provinsi')} />
                  {errors.provinsi && <p className="error-msg">{errors.provinsi.message}</p>}
                </div>
                <div>
                  <label className="label">Kota/Kabupaten</label>
                  <input type="text" className={`input-field ${errors.kota ? 'error' : ''}`}
                    placeholder="Padang" {...register('kota')} />
                  {errors.kota && <p className="error-msg">{errors.kota.message}</p>}
                </div>

                <div>
                  <label className="label">Kode Pos</label>
                  <input type="text" maxLength={5} className={`input-field ${errors.kode_pos ? 'error' : ''}`}
                    placeholder="25127" {...register('kode_pos')} />
                  {errors.kode_pos && <p className="error-msg">{errors.kode_pos.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Asal Institusi</label>
                  <input type="text" className={`input-field ${errors.asal_institusi ? 'error' : ''}`}
                    placeholder="RS. Dr. M. Djamil Padang / RSUD..." {...register('asal_institusi')} />
                  {errors.asal_institusi && <p className="error-msg">{errors.asal_institusi.message}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="label">Nomor STR</label>
                  <input type="text" className="input-field" placeholder="Nomor Surat Tanda Registrasi"
                    {...register('no_str')} />
                </div>
              </div>

              <div className="divider" />
              <div className="flex justify-end">
                <button id="btn-step1-next" type="submit" disabled={saving} className="btn-primary">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Lanjutkan <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─ Step 2: Pilih Prodi ─ */}
        {step === 2 && (
          <Step2Prodi
            selectedProdiId={store.prodiId}
            onSelect={handleStep2}
            onBack={() => { setStep(1); store.setStep(1) }}
            saving={saving}
            prodiList={prodiList}
          />
        )}

        {/* ─ Step 3: Unggah Dokumen ─ */}
        {step === 3 && (
          <div className="card animate-in" key="step3">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-800">Unggah Dokumen</h2>
              <p className="text-xs text-slate-500 mt-0.5">Format PDF · Maks. 2MB per file · <span className="text-rose-500">*</span> = Wajib</p>
            </div>

            {store.pendaftaranId ? (
              <div className="space-y-4">
                {DOKUMEN_LIST.map((dok) => (
                  <FileDropzone
                    key={dok.jenis}
                    label={dok.label}
                    jenisDokumen={dok.jenis}
                    pendaftaranId={store.pendaftaranId!}
                    isRequired={dok.required}
                    currentStatus={store.dokumenStatus[dok.jenis]?.status}
                    onUploadSuccess={(_id) =>
                      store.setDokumenStatus(dok.jenis, { status: 'success', fileName: '' })
                    }
                  />
                ))}

                <div className="divider" />
                <div className="flex justify-between">
                  <button id="btn-step3-back" onClick={() => { setStep(2); store.setStep(2) }} className="btn-secondary">
                    <ChevronLeft className="w-4 h-4" /> Kembali
                  </button>
                  <button id="btn-submit-final" onClick={handleSubmitFinal} disabled={submitting} className="btn-primary">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Pendaftaran
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>Silakan selesaikan langkah sebelumnya terlebih dahulu.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Step 2 Component ─────────────────────────────────────────
function Step2Prodi({
  selectedProdiId, onSelect, onBack, saving, prodiList
}: {
  selectedProdiId: string | null
  onSelect: (id: string, nama: string) => void
  onBack: () => void
  saving: boolean
  prodiList: any[]
}) {
  const [selected, setSelected] = useState<{ id: string; nama: string } | null>(
    selectedProdiId ? { id: selectedProdiId, nama: '' } : null
  )

  return (
    <div className="card animate-in" key="step2">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">Pilih Program Studi</h2>
        <p className="text-xs text-slate-500 mt-0.5">Pilih satu program spesialisasi yang Anda minati</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {prodiList.map((prodi) => {
          const sisa       = prodi.kuota - prodi.kuota_terisi
          const isSelected = selected?.id === prodi.id
          const isFull     = sisa <= 0

          return (
            <button
              key={prodi.id}
              id={`prodi-${prodi.kode_prodi}`}
              type="button"
              disabled={isFull}
              onClick={() => !isFull && setSelected({ id: prodi.id, nama: prodi.nama_prodi })}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50 shadow-brand'
                  : isFull
                  ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                  : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className={`font-semibold text-sm ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>
                    {prodi.nama_prodi}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{prodi.kode_prodi}</p>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-full bg-slate-200 rounded-full h-1.5 w-20">
                    <div
                      className={`h-1.5 rounded-full ${isFull ? 'bg-slate-400' : 'bg-emerald-500'}`}
                      style={{ width: `${(prodi.kuota_terisi / prodi.kuota) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs ${isFull ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>
                    {isFull ? 'Penuh' : `${sisa} slot`}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-600">
                  Rp {prodi.biaya_pendaftaran.toLocaleString('id-ID')}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="divider" />
      <div className="flex justify-between">
        <button id="btn-step2-back" onClick={onBack} className="btn-secondary">
          <ChevronLeft className="w-4 h-4" /> Kembali
        </button>
        <button
          id="btn-step2-next"
          disabled={!selected || saving}
          onClick={() => selected && onSelect(selected.id, selected.nama)}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Lanjutkan <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
