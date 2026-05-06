'use client'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Data Diri',      desc: 'Biodata lengkap' },
  { id: 2, label: 'Program Studi',  desc: 'Pilih spesialisasi' },
  { id: 3, label: 'Unggah Dokumen', desc: 'Berkas persyaratan' },
]

interface StepperProgressProps {
  currentStep: number // 1-3
}

export function StepperProgress({ currentStep }: StepperProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Connector Line Background */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 z-0" />

        {/* Connector Line Progress */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-emerald-500 z-0 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step) => {
          const isCompleted = step.id < currentStep
          const isActive    = step.id === currentStep

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 z-10">
              {/* Circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
                  isCompleted && 'bg-emerald-500 text-white shadow-brand scale-105',
                  isActive    && 'bg-white text-emerald-600 border-2 border-emerald-500 shadow-soft scale-110',
                  !isCompleted && !isActive && 'bg-white text-slate-400 border-2 border-slate-200'
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </div>

              {/* Label */}
              <div className="text-center hidden sm:block">
                <p className={cn(
                  'text-xs font-semibold transition-colors duration-200',
                  isActive    && 'text-emerald-600',
                  isCompleted && 'text-emerald-500',
                  !isCompleted && !isActive && 'text-slate-400'
                )}>
                  {step.label}
                </p>
                <p className="text-[11px] text-slate-400">{step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Mobile current step label */}
      <p className="sm:hidden text-center text-sm font-semibold text-emerald-600 mt-3">
        Langkah {currentStep}: {STEPS[currentStep - 1]?.label}
      </p>
    </div>
  )
}
