import { TokenColumns } from './TokenTable.enum';

export const TOKENS_HEADER_TABLE = [
  { property: 'name', name: TokenColumns.Name },
  { property: 'claimsMade', name: TokenColumns.ClaimsMade },
  { property: 'claimsRemaining', name: TokenColumns.ClaimsRemaining },
  { property: 'created', name: TokenColumns.Created },
  { property: 'claimExpiration', name: TokenColumns.ClaimExpiration },
];
