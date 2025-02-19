export interface Record {
  record_count: number;
}

export interface CountryRecord extends Record {
  Country: string;
}

export interface JournalRecord extends Record {
  Journal: string;
}

export interface SourceRecord extends Record {
  Source: string;
}

export interface ChartsRecord extends Record {
  Charts: string;
}

export interface OVIDRecord extends Record {
  OVID: string;
  Database: string;
}

export interface DataStructure {
  country: CountryRecord[];
  journal: JournalRecord[];
  source: SourceRecord[];
  ovid_grouping: OVIDRecord[];
  charts: ChartsRecord[];
}

export interface dataType {
[x: string]: any;
  data: DataStructure;
  status: string;
}

export interface ApiResponse<T = dataType> {
  data: T;
  message: string;
  status: string;
}
