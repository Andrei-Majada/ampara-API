export interface RequestUserSummaryDto {
  name: string | null;
  city: string | null;
  state: string | null;
  age: number | null;
  totalRequests: number;
}

export interface RequestHelperSummaryDto {
  helperId: string;
  name: string | null;
  city: string | null;
  state: string | null;
  totalHelpOffered: number;
}

export interface RequestViewDto {
  _id: string;
  userId: string;
  user: RequestUserSummaryDto;
  userMessage: string;
  status: string;
  helpers: any[];
  availableSupporters: RequestHelperSummaryDto[];
}
