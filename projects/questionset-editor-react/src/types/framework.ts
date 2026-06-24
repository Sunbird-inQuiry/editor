export interface ITerm {
  identifier: string;
  code: string;
  name: string;
  description?: string;
  index?: number;
  category?: string;
  status?: string;
}

export interface ICategory {
  identifier: string;
  code: string;
  name: string;
  description?: string;
  terms?: ITerm[];
}

export interface IFramework {
  identifier: string;
  code: string;
  name: string;
  type?: string;
  categories?: ICategory[];
}

export interface IFrameworkDetails {
  orgFramework?: IFramework;
  targetFrameworks?: IFramework[];
  channelFrameworks?: Array<{ identifier: string; name: string; type?: string }>;
}
