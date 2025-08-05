'use client'

import { Suspense } from 'react'
import PlanSelectionDialog from './PlanSelectionDialog'

export default function DashboardClient() {
  return (
    <Suspense fallback={null}>
      <PlanSelectionDialog />
    </Suspense>
  )
}
