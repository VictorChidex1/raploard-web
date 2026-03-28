export interface Tour {
  id: number;
  city: string;
  country: string;
  venue: string;
  date: string;
  year: string;
  status: 'ON SALE' | 'SOLD OUT' | 'ANNOUNCED';
  url: string;
  type: string;
  image: string;
}

export const tours: Tour[] = [];
