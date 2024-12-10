// Represents the pagination information
export interface ApiPagination {
    current_page: number;
    page_size: number;
    total_pages: number;
    total_records: number;
  }
  
  // Represents a single data entry in the response
  export interface StudyData {
    Abstract: string;
    "Author Affiliations": string;
    Authors: string; // JSON string, parsed later
    Classification: string;
    Clinical_trials: string | null;
    Cochrane_comparator: string | null;
    Cochrane_intervention: string | null;
    Cochrane_outcomes: string | null;
    Cochrane_patient_population: string | null;
    Country: string; // JSON string, parsed later
    DOI: string;
    DOI_only: string | null;
    Date: string | null;
    Id: string;
    Intervention__HASH__Vaccine_Options__HASH__Adjuvants: string | null;
    Intervention__HASH__Vaccine_Options__HASH__Live: string | null;
    Intervention__HASH__Vaccine_Options__HASH__Non_Adjuvanted: string | null;
    Intervention__HASH__Vaccine_Options__HASH__Non_Live: string | null;
    Intervention__HASH__Vaccine_Preventable_Disease__HASH__COVID_19: string | null;
    Intervention__HASH__Vaccine_Preventable_Disease__HASH__Dengue: string | null;
    Intervention__HASH__Vaccine_Preventable_Disease__HASH__Influenz: string | null;
    Intervention__HASH__Vaccine_Preventable_Disease__HASH__Rotaviru: string | null;
    Issue: string | null;
    Journal: string;
    "Journal ID": string | null;
    Keywords: string; // JSON string, parsed later
    Language: string | null;
    Links: string; // JSON string, parsed later
    MeSH_Terms: string | null;
    Medline_source: string | null;
    Outcome__HASH__Death__HASH__Death: string | null;
    Outcome__HASH__Hospitalization__HASH__Hospitalization: string | null;
    Outcome__HASH__ICU__HASH__ICU: string | null;
    Outcome__HASH__Infection__HASH__Infection: string | null;
    Pages: string | null;
    Population__HASH__AgeGroup__HASH__Adolescents_10_17: string | null;
    Population__HASH__AgeGroup__HASH__Adults_18_64: string | null;
    Population__HASH__AgeGroup__HASH__Children_2_9: string | null;
    Population__HASH__AgeGroup__HASH__Newborn_0_1: string | null;
    Population__HASH__AgeGroup__HASH__OlderAdults_65_10000: string | null;
    Population__HASH__ImmuneStatus__HASH__Healthy: string | null;
    Population__HASH__ImmuneStatus__HASH__Immunocompromised: string | null;
    Population__HASH__SpecificGroup__HASH__HealthcareWorkers: string | null;
    Population__HASH__SpecificGroup__HASH__ParentsCaregivers: string | null;
    Population__HASH__SpecificGroup__HASH__PregnantWomen: string | null;
    Population__HASH__SpecificGroup__HASH__Travellers: string | null;
    Publication_Type: string | null;
    Publication_type: string | null;
    Publisher: string | null;
    Query: string | null;
    Registry_of_trials: string | null;
    Result_stage: string | null;
    Result_type: string | null;
    Reviews__HASH__Reviews__HASH__review: string | null;
    Source: string;
    Status: string | null;
    Studies__HASH__NoOfStudies__HASH__number_of_studies: string | null;
    Studies__HASH__RCT__HASH__RCT_terms: string | null;
    Study_design: string | null;
    Substances: string | null;
    Title: string;
    Topic__HASH__Acceptance__HASH__Acceptance: string | null;
    Topic__HASH__Administration__HASH__Administration: string | null;
    Topic__HASH__Coverage__HASH__Coverage: string | null;
    Topic__HASH__Economic_Aspects__HASH__Economic_Aspects: string | null;
    Topic__HASH__Efficacy_Effectiveness__HASH__Efficacy_Effectivene: string | null;
    Topic__HASH__Ethical_Issues__HASH__Ethical_Issues: string | null;
    Topic__HASH__Modeling__HASH__Modeling: string | null;
    Topic__HASH__Risk_Factor__HASH__Risk_Factor: string | null;
    Topic__HASH__Safety__HASH__Safety: string | null;
    URL: string | null;
    Volume: string | null;
    Year: string | null;
    broad_synthesis_design: string | null;
    doi: string;
    doi_url: string;
    excluded: string | null;
    highlighted_abstract: string | null;
    highlighted_title: string | null;
    matches_criteria: string | null;
    pdf_url: string | null;
    primary_id: number;
    reason_for_discrepancy: string | null;
    relations_status: string | null;
    screening_info: string | null;
    threads: string; // JSON string, parsed later
  }
  
  // Represents the API response containing data and pagination
  export interface ApiResponse {
    data: {
      data: StudyData[];
      pagination: ApiPagination;
      success: boolean;
    };
    message: string;
    status: string;
  }
  