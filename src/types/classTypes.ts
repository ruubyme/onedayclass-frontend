export interface classData {
  class_id: number;
  location: string;
}

export interface ClassDetailInfoType {
  className: string;
  description: string;
  location: string;
  cost: number;
  targetStudents: string[];
  content: string;
  curriculums: string[];
  latitude: number;
  longitude: number;
}

export interface classDate {
  class_id: number;
  class_date_id: number;
  class_date: Date;
  class_capacity: number;
  user_has_booked: string;
  remaining_seats: number;
}

/**class 등록에 필요한 type */
export interface ClassForm {
  classId: number;
  className: string;
  description: string;
  location: string;
  cost: number;
  latitude?: number;
  longitude?: number;
  targetStudents: string[];
  curriculums: string[];
  content?: string;
}

export interface ClassTimeForm {
  classDateTime: string; //"YYYY-MM-DDTHH:MM"
  capacity: number;
}

export interface LatLong {
  latitude: number;
  longitude: number;
}

export interface mapBoundsType {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

export interface classBookingType {
  id: number;
  class_id: number;
  student_id: number;
  class_date_id: number;
  status: string;
  class_name?: string;
  class_description?: string;
  class_date?: Date;
}

export interface reviewType {
  id: number;
  class_id: number;
  user_id: number;
  rating: number;
  comment: string;
  booking_id: number;
  class_date_id: number;
  instructor_comment: string | null;
  created_at: Date;
  class_date: Date;
  class_name: string;
}
