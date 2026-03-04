import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const INTEREST_CATEGORIES = [
  { id: 'hiking', label: 'Hiking & Outdoors', icon: '🏔️' },
  { id: 'concerts', label: 'Music Concerts', icon: '🎸' },
  { id: 'cinema', label: 'Cinema & Film', icon: '🎬' },
  { id: 'dining', label: 'Dining & Foodie', icon: '🍕' },
  { id: 'art', label: 'Art & Museums', icon: '🖼️' },
  { id: 'travel', label: 'Travel', icon: '✈️' },
  { id: 'boardgames', label: 'Board Games', icon: '🎲' },
  { id: 'tech', label: 'Tech Talks', icon: '💻' },
  { id: 'yoga', label: 'Yoga & Fitness', icon: '🧘' },
  { id: 'photography', label: 'Photography', icon: '📸' },
  { id: 'comedy', label: 'Comedy Shows', icon: '😂' },
  { id: 'theatre', label: 'Theatre', icon: '🎭' },
  { id: 'sports', label: 'Sports Events', icon: '⚽' },
  { id: 'nightlife', label: 'Nightlife', icon: '🍸' },
  { id: 'bookclub', label: 'Book Clubs', icon: '📚' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'crafts', label: 'Crafts & DIY', icon: '🎨' },
  { id: 'dancing', label: 'Dancing', icon: '💃' },
  { id: 'volunteering', label: 'Volunteering', icon: '🤝' },
  { id: 'networking', label: 'Networking', icon: '🤝' },
];

export interface User {
  id: string;
  name: string;
  email: string;
  profile_photo_url?: string;
  bio?: string;
  interests?: string[];
  phone_verified: boolean;
  location_city?: string;
  lat?: number;
  lng?: number;
  discovery_radius: number;
  google_id?: string;
  join_date: string;
  account_status: string;
  onboarding_complete?: boolean;
}

export interface Event {
  id: string;
  organizer_id: string;
  organizer_name?: string;
  organizer_photo?: string;
  avg_rating?: number;
  review_count?: number;
  title: string;
  event_type: string;
  cover_photos: string[];
  date_time: string;
  lat: number;
  lng: number;
  general_area: string;
  description?: string;
  max_companions: number;
  approved_count: number;
  status: string;
  created_at: string;
}

export interface JoinRequest {
  id: string;
  event_id: string;
  requester_id: string;
  requester_name?: string;
  requester_photo?: string;
  requester_interests?: string[];
  phone_verified?: boolean;
  avg_rating?: number;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED';
  created_at: string;
  resolved_at?: string;
}

export interface ChatThread {
  id: string;
  request_id: string;
  event_id: string;
  event_title: string;
  organizer_id: string;
  organizer_name: string;
  organizer_photo: string;
  participant_id: string;
  participant_name: string;
  participant_photo: string;
  last_message?: string;
  last_message_at?: string;
  last_message_sender_id?: string;
  seen_at?: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  seen_at?: string;
  read?: boolean;
}
