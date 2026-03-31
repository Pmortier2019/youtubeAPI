import { useEffect, useState } from 'react'
import AgreementModal from './AgreementModal'
import { getAgreementStatus, getAgreementCurrent } from '../api'

export default function AgreementGate({ children }) {
  const [state, setState] = useState('loading') // 'loading' | 'required' | 'ok'
  const [agreement, setAgreement] = useState(null)

  useEffect(() => {
    getAgreementStatus()
      .then(status => {
        if (status.required) {
          return getAgreementCurrent().then(data => {
            setAgreement(data)
            setState('required')
          })
        } else {
          setState('ok')
        }
      })
      .catch(() => setState('ok')) // fail-open: don't block creator on API error
  }, [])

  if (state === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#6B7280', fontSize: 14 }}>
        Loading…
      </div>
    )
  }

  if (state === 'required' && agreement) {
    return (
      <>
        {/* Render children blurred behind modal */}
        <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
          {children}
        </div>
        <AgreementModal
          version={agreement.version}
          body={agreement.body}
          onAccepted={() => setState('ok')}
        />
      </>
    )
  }

  return children
}
