import Dexie, { Table } from 'dexie';

export interface FamilyMember {
  id: string;
  name: string;
  age: string;
  profession: string;
}

export interface FamilyRecord {
  id?: number; // Auto-incremented sequential ID
  office: string;
  joinDate: string;
  nationalId: string;
  fullName: string;
  birthYear: string;
  motherName: string;
  phoneNumber: string;
  educationLevel: string;
  referredBy: string;
  governorate: string;
  district: string;
  subDistrict: string;
  neighborhood: string;
  profession: string;
  deliveryStatus: 'مستلم' | 'غير مستلم';
  notes: string;
  members: FamilyMember[];
  createdAt: number;
}

export class FamilyDatabase extends Dexie {
  families!: Table<FamilyRecord, number>;

  constructor() {
    super('FamilyDatabase');
    this.version(1).stores({
      families: '++id, nationalId, fullName, createdAt'
    });
  }
}

export const db = new FamilyDatabase();
