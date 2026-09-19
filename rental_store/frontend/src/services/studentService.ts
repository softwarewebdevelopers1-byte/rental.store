import { http } from "./apiClient";
import type { Student } from "../types/user";

interface StudentResponse {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  active: boolean;
  membershipStatus: Student["membershipStatus"];
  hostelId: string | null;
  hostelName: string | null;
  hostelLocation: string | null;
  roomId: string | null;
  roomNumber: string | null;
  roomPrice: number | null;
  requestedHostelId: string | null;
  requestedHostelName: string | null;
  registrationHostelCode: string | null;
  requestedAt: string | null;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function toStudent(raw: StudentResponse): Student {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    ...(raw.phone ? { phone: raw.phone } : {}),
    ...(raw.avatarUrl ? { avatarUrl: raw.avatarUrl } : {}),
    role: "STUDENT",
    active: raw.active,
    membershipStatus: raw.membershipStatus,
    createdAt: raw.createdAt,
    ...(raw.hostelId ? { hostelId: raw.hostelId } : {}),
    ...(raw.roomId ? { roomId: raw.roomId } : {}),
    ...(raw.requestedHostelId ? { requestedHostelId: raw.requestedHostelId } : {}),
    ...(raw.requestedHostelName
      ? { requestedHostelName: raw.requestedHostelName }
      : {}),
  };
}

export const studentService = {
  async getSelf(): Promise<Student | null> {
    try {
      return toStudent(await http.get<StudentResponse>("/students/me"));
    } catch {
      return null;
    }
  },

  async changeHostel(code: string): Promise<Student> {
    return toStudent(
      await http.post<StudentResponse>("/students/me/change-hostel", {
        newHostelCode: code.trim(),
      }),
    );
  },

  async cancelHostelRequest(): Promise<Student> {
    return toStudent(
      await http.delete<StudentResponse>("/students/me/hostel-request"),
    );
  },
};
