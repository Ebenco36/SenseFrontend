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
  
  export interface DataStructure {
    country: CountryRecord[];
    journal: JournalRecord[];
    source: SourceRecord[];
  }
  
  export interface ApiResponse {
    data: {
      data: DataStructure;
      status: string;
    };
    message: string;
    status: string;
  }
  