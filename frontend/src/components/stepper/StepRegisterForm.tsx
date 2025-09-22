import { useMemo, useState } from 'react'
import { registerBasic } from '../../services/authService'

export interface RegisterFormData {
  nombres: string
  apellidos: string
  email: string
  dni: string
}

export default function StepRegisterForm({
  initial,
  onNext,
  onGoToLogin,
}: {
  initial?: Partial<RegisterFormData>
  onNext: (data: RegisterFormData) => void
  onGoToLogin: () => void
}) {
  const [form, setForm] = useState<RegisterFormData>({
    nombres: initial?.nombres || '',
    apellidos: initial?.apellidos || '',
    email: initial?.email || '',
    dni: initial?.dni || '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emailValid = useMemo(() => /^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(form.email), [form.email])
  const dniValid = useMemo(() => /^\d{8,12}$/.test(form.dni), [form.dni])
  const valid = Boolean(form.nombres && form.apellidos && emailValid && dniValid)

  return (
    <div className="text-neutral-200">
      <h2 className="text-2xl md:text-3xl font-semibold">Registro tradicional</h2>
      <p className="text-neutral-400 text-sm mt-2">Completa tus datos. Continuarás con el registro facial.</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="h-14 text-base bg-[#0e0e10] border border-white/10 rounded-md px-4 outline-none transition ring-0 hover:border-white/20 focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/30" placeholder="Nombres" value={form.nombres} onChange={e=>setForm(v=>({...v,nombres:e.target.value}))} />
        <input className="h-14 text-base bg-[#0e0e10] border border-white/10 rounded-md px-4 outline-none transition ring-0 hover:border-white/20 focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/30" placeholder="Apellidos" value={form.apellidos} onChange={e=>setForm(v=>({...v,apellidos:e.target.value}))} />
        <div className="md:col-span-2">
          <input className={`w-full h-14 text-base bg-[#0e0e10] border ${form.email ? (emailValid ? 'border-emerald-500/50' : 'border-red-500/50') : 'border-white/10'} rounded-md px-4 outline-none transition ring-0 hover:border-white/20 focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/30`} placeholder="Correo" type="email" value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} />
        </div>
        <div className="md:col-span-2">
          <input className={`w-full h-14 text-base bg-[#0e0e10] border ${form.dni ? (dniValid ? 'border-emerald-500/50' : 'border-red-500/50') : 'border-white/10'} rounded-md px-4 outline-none transition ring-0 hover:border-white/20 focus:border-[#5227FF] focus:ring-2 focus:ring-[#5227FF]/30`} placeholder="DNI (8-12 dígitos)" value={form.dni} onChange={e=>setForm(v=>({...v,dni:e.target.value}))} />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

      <div className="mt-6 flex items-center">
        <span className="text-xs text-neutral-400 hover:text-neutral-200">¿Ya tienes una cuenta?</span>
        <button onClick={onGoToLogin} className="ml-2 text-sm text-[#00D4FF] hover:underline">Iniciar sesión</button>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={async()=>{
            if (!valid || submitting) return
            try {
              setSubmitting(true)
              setError(null)
              await registerBasic(form)
              onNext(form)
            } catch (e: any) {
              setError(e?.message || 'No se pudo guardar tus datos')
            } finally {
              setSubmitting(false)
            }
          }}
          disabled={!valid || submitting}
          className="w-full max-w-xs sm:max-w-sm rounded-full bg-[#5227FF] text-white px-6 py-3 text-sm md:text-base disabled:opacity-50 transition transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(82,39,255,0.35)]"
        >
          {submitting ? 'Guardando…' : 'Registrar y continuar'}
        </button>
      </div>
    </div>
  )
}
