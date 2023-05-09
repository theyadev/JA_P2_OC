import type Participation from './Participation';
export default interface Olympic {
  id: number;
  country: string;
  participations: Participation[];
}
