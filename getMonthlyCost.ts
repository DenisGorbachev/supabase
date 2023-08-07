import { ensureMapGet } from 'libs/utils/ensure'
import { USD } from '../finance/data/allAssets'
import { bag } from '../finance/models/Bag'

export function getMonthlyCost(plan: string) {
  return ensureMapGet(new Map([
    ['Pro', bag(25, USD)],
  ]), plan)
}
