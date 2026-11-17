export interface Student {
  id: string;
  created_at?: string;
  user_id?: string | null;
  name: string;
  roll_number: string;
  email: string;
  phone?: string;
  department: string;
  semester: string;
  cgpa: number;
  avatar_url?: string | null;
  campus_city?: string;
  status: 'Active' | 'Graduated' | 'Suspended';
}

export interface CampusWeather {
  city: string;
  temperature: number;
  condition: string;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  updatedAt: string;
}
