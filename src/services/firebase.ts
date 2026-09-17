import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import { RoomData, PlayerData } from '../types/game';

// Standard Firebase Configuration (can be overridden via environment or Settings UI)
const defaultFirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA8_BattleArenaKey_Prod2026',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'rps-battle-arena-prod.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'rps-battle-arena-prod',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'rps-battle-arena-prod.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '839217462019',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:839217462019:web:9f8e7d6c5b4a3210',
};

let db: Firestore | null = null;
let isInitialized = false;

export const initFirebase = (customConfig?: any) => {
  try {
    const config = customConfig || defaultFirebaseConfig;
    const app = !getApps().length ? initializeApp(config) : getApp();
    db = getFirestore(app);
    isInitialized = true;
    return db;
  } catch (error) {
    console.warn('Firebase init warning:', error);
    return null;
  }
};

export const getDb = (): Firestore | null => {
  if (!db && !isInitialized) {
    return initFirebase();
  }
  return db;
};

/**
 * Creates a new room in Firebase Firestore
 */
export const createFirestoreRoom = async (room: RoomData): Promise<boolean> => {
  const firestore = getDb();
  if (!firestore) return false;
  try {
    const roomRef = doc(firestore, 'rooms', room.roomCode);
    await setDoc(roomRef, room);
    return true;
  } catch (error) {
    console.warn('createFirestoreRoom error:', error);
    return false;
  }
};

/**
 * Validates and joins an existing room in Firebase Firestore
 */
export const joinFirestoreRoom = async (
  roomCode: string,
  guestPlayer: PlayerData
): Promise<{ success: boolean; error?: string; room?: RoomData }> => {
  const firestore = getDb();
  if (!firestore) return { success: false, error: 'Database unavailable' };

  try {
    const roomRef = doc(firestore, 'rooms', roomCode);
    const snap = await getDoc(roomRef);

    if (!snap.exists()) {
      return { success: false, error: 'ROOM NOT FOUND' };
    }

    const room = snap.data() as RoomData;

    // Check if room is full
    if (room.guest && room.guest.id !== guestPlayer.id) {
      return { success: false, error: 'ROOM IS FULL' };
    }

    // Join room
    const updated: Partial<RoomData> = {
      guest: guestPlayer,
      status: 'choosing',
      lastUpdated: Date.now(),
    };

    await updateDoc(roomRef, updated);
    return {
      success: true,
      room: { ...room, ...updated } as RoomData,
    };
  } catch (error: any) {
    console.warn('joinFirestoreRoom error:', error);
    return {
      success: false,
      error: error?.message || 'Error joining room',
    };
  }
};

/**
 * Updates partial room data in Firestore
 */
export const updateFirestoreRoom = async (
  roomCode: string,
  updates: Partial<RoomData>
): Promise<boolean> => {
  const firestore = getDb();
  if (!firestore) return false;
  try {
    const roomRef = doc(firestore, 'rooms', roomCode);
    await updateDoc(roomRef, {
      ...updates,
      lastUpdated: Date.now(),
    });
    return true;
  } catch (error) {
    console.warn('updateFirestoreRoom error:', error);
    return false;
  }
};

/**
 * Real-time listener for Firestore room changes
 */
export const listenToFirestoreRoom = (
  roomCode: string,
  onUpdate: (data: RoomData) => void,
  onError?: (err: any) => void
): (() => void) => {
  const firestore = getDb();
  if (!firestore) {
    onError && onError(new Error('Firestore not initialized'));
    return () => {};
  }

  try {
    const roomRef = doc(firestore, 'rooms', roomCode);
    const unsubscribe = onSnapshot(
      roomRef,
      (docSnap) => {
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as RoomData);
        }
      },
      (error) => {
        console.warn('Firestore snapshot error:', error);
        onError && onError(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    onError && onError(err);
    return () => {};
  }
};
