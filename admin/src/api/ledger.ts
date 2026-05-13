import { get, post } from './request'

export interface LedgerEntry {
  id: number
  shopId: number
  direction: number // 1=credit 2=debit
  category: string
  amount: number
  runningBalance: number
  orderId: number
  refundId: number
  refNo: string
  description: string
  createTime: number
}

export interface ListLedgerResponse {
  entries: LedgerEntry[]
  total: number
}

export interface ListLedgerParams {
  shopId?: number
  category?: string
  startTime?: number
  endTime?: number
  page?: number
  pageSize?: number
}

export interface LedgerSummary {
  totalIncome: number
  totalRefund: number
  totalCommission: number
  totalWithdrawal: number
  netBalance: number
}

export interface LedgerSummaryParams {
  shopId?: number
  startTime?: number
  endTime?: number
}

export interface ShopReconcileResult {
  shopId: number
  ledgerCredit: number
  ledgerDebit: number
  ledgerNet: number
  walletBalance: number
  walletFrozen: number
  walletTotal: number
  diff: number
  passed: boolean
}

export interface ReconcileReport {
  totalChecked: number
  passed: number
  failed: number
  results: ShopReconcileResult[]
}

export function listLedger(params: ListLedgerParams) {
  return get<ListLedgerResponse>('/ledger', { params })
}

export function getLedgerSummary(params: LedgerSummaryParams) {
  return get<LedgerSummary>('/ledger/summary', { params })
}

export function runReconcile(body: { shopId?: number }) {
  return post<ReconcileReport>('/ledger/reconcile', body)
}
