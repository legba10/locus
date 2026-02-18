'use client'

import { useCabinetV2 } from '@/config/uiFlags'
import { DashboardV2 } from './DashboardV2'
import { OwnerDashboardV7 } from './OwnerDashboardV7'

export default function PageClient() {
  return useCabinetV2 ? <DashboardV2 /> : <OwnerDashboardV7 />
}
