import { ymdToPcc } from '../utils/date';

export function buildSearchUrl(baseUrl: string, startYmd: string, endYmd: string, pageIndex = 1): string {
  const url = new URL(baseUrl);
  const params: Record<string, string> = {
    pageSize: '100',
    pageIndex: String(pageIndex),
    firstSearch: 'true',
    searchType: 'basic',
    isBinding: 'N',
    isLogIn: 'N',
    level_1: 'on',
    orgName: '',
    orgId: '',
    tenderName: '',
    tenderId: '',
    tenderType: 'TENDER_DECLARATION',
    tenderWay: 'TENDER_WAY_ALL_DECLARATION',
    dateType: 'isNow',
    tenderStartDate: ymdToPcc(startYmd),
    tenderEndDate: ymdToPcc(endYmd),
    radProctrgCate: '',
    policyAdvocacy: ''
  };
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return url.toString();
}
