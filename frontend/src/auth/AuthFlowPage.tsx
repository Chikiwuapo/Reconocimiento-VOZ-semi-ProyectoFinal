import { useEffect, useState } from 'react'
import Stepper, { Step } from '../components/stepper/Stepper'
import StepRegisterForm, { type RegisterFormData } from '../components/stepper/StepRegisterForm'
import StepRegisterFace from '../components/stepper/StepRegisterFace'
import StepLoginForm from '../components/stepper/StepLoginForm'
import StepLoginFace from '../components/stepper/StepLoginFace'
import DotGrid from '../components/background/DotGrid'
import VoiceButton from '../components/VoiceButton'

export default function AuthFlowPage() {
  const [step, setStep] = useState(1)
  const [registerData, setRegisterData] = useState<RegisterFormData | null>(null)
  const [loginData, setLoginData] = useState<{ email: string; dni: string } | null>(null)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0d0d0f] text-neutral-200 grid place-items-center p-2 sm:p-4">
      {/* Background only (not the main container) */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <DotGrid dotSize={10} gap={22} baseColor="#1a1a22" activeColor="#5227FF" proximity={140} shockRadius={260} shockStrength={5} resistance={800} returnDuration={1.2} />
      </div>

      <Stepper
        controlledStep={step}
        setControlledStep={setStep}
        nextButtonText="Siguiente"
        backButtonText="Anterior"
      >
        <Step>
          <StepRegisterForm
            initial={registerData || undefined}
            onNext={(data) => { setRegisterData(data); setStep(2) }}
            onGoToLogin={() => setStep(3)}
          />
        </Step>
        <Step>
          {/* Step 2: Facial registration with consent and confirmation modals */}
          {registerData ? (
            <StepRegisterFace
              baseData={registerData}
              onRegistered={() => setStep(3)}
            />
          ) : (
            <div className="text-neutral-300">Completa el paso 1 antes de continuar.</div>
          )}
        </Step>
        <Step>
          <StepLoginForm
            onNext={(data) => { setLoginData(data); setStep(4) }}
          />
        </Step>
        <Step>
          {loginData ? (
            <StepLoginFace email={loginData?.email} />
          ) : (
            <div className="text-neutral-300">Completa el paso 3 antes de continuar.</div>
          )}
        </Step>
      </Stepper>

      {/* Botón de voz fijo junto al chat del agente IA (FAB del chat está a right: 20px, width 56px) */}
      <div
        style={{
          position: 'fixed',
          right: 88, // 20px margen + 56px ancho del chat + 12px de separación aprox
          bottom: 20,
          zIndex: 1001,
        }}
      >
        <VoiceButton />
      </div>
    </div>
  )
}
