export interface MediaParams {
  mediaType: string;
  mediaCategory?: string;
  page?: string;
}

export interface MediaDetailParams {
  mediaType: string;
  mediaId: string;
}

export interface SearchParams {
  mediaType: string;
  query: string;
  page: string;
}

export interface PersonParams {
  personId: string;
}
