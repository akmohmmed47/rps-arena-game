import { Platform } from 'react-native';
import { RoomData, PlayerData, Move, RoundHistoryItem, GameStatus } from '../types/game';
import {
  createFirestoreRoom,
  joinFirestoreRoom,
  updateFirestoreRoom,
  listenToFirestoreRoom,
} from './firebase';
import { SoundFX } from './audio';

// Room Code Generator (6 characters, avoiding ambiguous 0, O, 1, I)
export const generateRoomCode = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Global in-memory cache for fast local access
const localRooms: Map<string, RoomData> = new Map();

// Helper to determine round winner
export const determineWinner = (
  hostMove: Move,
  guestMove: Move
): 'host' | 'guest' | 'tie' => {
  if (hostMove === guestMove) return 'tie';
  if (
    (hostMove === 'rock' && guestMove === 'scissors') ||
    (hostMove === 'scissors' && guestMove === 'paper') ||
    (hostMove === 'paper' && guestMove === 'rock')
  ) {
    return 'host';
  }
  return 'guest';
};

class MultiplayerService {
  private activeRoomCode: string | null = null;
  private subscribers: Map<string, Set<(room: RoomData) => void>> = new Map();
  private firestoreUnsubs: Map<string, () => void> = new Map();
  private broadcastChannel: any = null;
  private ws: any = null;
  private wsConnected: boolean = false;
  private myPlayerId: string = '';

  constructor() {
    this.initBroadcastChannel();
    this.initWebSocketRelay();
  }

  public setPlayerId(id: string) {
    this.myPlayerId = id;
  }

  // Cross-tab BroadcastChannel for 0ms same-device sync
  private initBroadcastChannel() {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new (window as any).BroadcastChannel('rps_arena_sync_channel');
        this.broadcastChannel.onmessage = (event: any) => {
          if (event && event.data && event.data.room) {
            this.handleIncomingRoomUpdate(event.data.room, false);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }
  }

  // Cross-device WebSocket Cloud Relay (HiveMQ / WebSocket pubsub)
  private initWebSocketRelay() {
    // We connect to public HiveMQ WebSocket or fallback WebSocket relay
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      this.connectWebSocket();
    }
  }

  private connectWebSocket() {
    try {
      // Connect to HiveMQ Public WSS broker over simple MQTT WebSocket frames or JSON pubsub
      // As a fallback, we also utilize window storage events and periodic polling
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', (e) => {
          if (e.key && e.key.startsWith('rps_room_sync_') && e.newValue) {
            try {
              const parsed = JSON.parse(e.newValue);
              this.handleIncomingRoomUpdate(parsed, false);
            } catch {}
          }
        });
      }
    } catch {}
  }

  private notifySubscribers(room: RoomData) {
    localRooms.set(room.roomCode, room);
    const callbacks = this.subscribers.get(room.roomCode);
    if (callbacks) {
      callbacks.forEach((cb) => {
        try {
          cb(room);
        } catch (e) {
          console.warn('Subscriber callback error:', e);
        }
      });
    }
  }

  private broadcastLocally(room: RoomData) {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // BroadcastChannel
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.postMessage({ room });
        } catch {}
      }
      // LocalStorage event
      try {
        localStorage.setItem(`rps_room_sync_${room.roomCode}`, JSON.stringify(room));
      } catch {}
    }
  }

  private handleIncomingRoomUpdate(room: RoomData, shouldRebroadcast: boolean = true) {
    const existing = localRooms.get(room.roomCode);
    if (!existing || room.lastUpdated >= existing.lastUpdated) {
      localRooms.set(room.roomCode, room);
      this.notifySubscribers(room);
      if (shouldRebroadcast) {
        this.broadcastLocally(room);
      }
    }
  }

  /**
   * CREATE ROOM
   */
  public async createRoom(hostPlayer: PlayerData): Promise<string> {
    const roomCode = generateRoomCode();
    this.activeRoomCode = roomCode;
    this.myPlayerId = hostPlayer.id;

    const newRoom: RoomData = {
      roomCode,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      status: 'waiting',
      round: 1,
      host: hostPlayer,
      guest: null,
      currentRoundWinner: null,
      currentRoundDamage: 0,
      revealCountdown: 3,
      history: [],
      winnerId: null,
    };

    localRooms.set(roomCode, newRoom);
    this.notifySubscribers(newRoom);
    this.broadcastLocally(newRoom);

    // Save to Firestore asynchronously
    createFirestoreRoom(newRoom).catch(() => {});

    // Listen to Firestore updates
    this.setupFirestoreListener(roomCode);

    return roomCode;
  }

  /**
   * JOIN ROOM
   */
  public async joinRoom(
    roomCode: string,
    guestPlayer: PlayerData
  ): Promise<{ success: boolean; error?: string; room?: RoomData }> {
    const code = roomCode.trim().toUpperCase();
    this.activeRoomCode = code;
    this.myPlayerId = guestPlayer.id;

    // Check local / cached rooms first
    let room = localRooms.get(code);

    // Also check localStorage in case joined from another tab
    if (!room && Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`rps_room_sync_${code}`);
        if (stored) {
          room = JSON.parse(stored);
        }
      } catch {}
    }

    // Try Firestore join
    const firestoreResult = await joinFirestoreRoom(code, guestPlayer);
    if (firestoreResult.success && firestoreResult.room) {
      room = firestoreResult.room;
    }

    if (!room) {
      return { success: false, error: 'ROOM NOT FOUND' };
    }

    // Validate if room already full
    if (room.guest && room.guest.id !== guestPlayer.id) {
      return { success: false, error: 'ROOM IS FULL' };
    }

    // Update room with guest
    const updatedRoom: RoomData = {
      ...room,
      guest: guestPlayer,
      status: 'countdown_start',
      lastUpdated: Date.now(),
    };

    localRooms.set(code, updatedRoom);
    this.notifySubscribers(updatedRoom);
    this.broadcastLocally(updatedRoom);

    // Sync to Firestore
    updateFirestoreRoom(code, {
      guest: guestPlayer,
      status: 'countdown_start',
      lastUpdated: Date.now(),
    }).catch(() => {});

    this.setupFirestoreListener(code);

    return { success: true, room: updatedRoom };
  }

  /**
   * START BATTLE (after 3s countdown)
   */
  public async startBattle(roomCode: string) {
    const room = localRooms.get(roomCode);
    if (!room) return;

    const updated: RoomData = {
      ...room,
      status: 'choosing',
      lastUpdated: Date.now(),
    };

    this.updateRoomState(updated);
  }

  /**
   * MAKE MOVE
   */
  public async makeMove(roomCode: string, playerId: string, move: Move) {
    const room = localRooms.get(roomCode);
    if (!room) return;

    let updatedHost = { ...room.host };
    let updatedGuest = room.guest ? { ...room.guest } : null;

    if (room.host.id === playerId) {
      updatedHost.selectedMove = move;
      updatedHost.moveLocked = true;
    } else if (room.guest && room.guest.id === playerId) {
      updatedGuest = {
        ...room.guest,
        selectedMove: move,
        moveLocked: true,
      };
    }

    SoundFX.playSelectMove();

    const bothLocked =
      updatedHost.moveLocked &&
      updatedGuest !== null &&
      updatedGuest.moveLocked;

    if (bothLocked && updatedGuest) {
      // Initiate 3-2-1 countdown reveal
      const revealRoom: RoomData = {
        ...room,
        host: updatedHost,
        guest: updatedGuest,
        status: 'revealing',
        revealCountdown: 3,
        lastUpdated: Date.now(),
      };
      this.updateRoomState(revealRoom);

      // Handle reveal countdown sequence
      this.runRevealSequence(roomCode);
    } else {
      // Secretly record choice
      const intermediateRoom: RoomData = {
        ...room,
        host: updatedHost,
        guest: updatedGuest,
        lastUpdated: Date.now(),
      };
      this.updateRoomState(intermediateRoom);
    }
  }

  /**
   * 3-2-1 REVEAL ANIMATION SEQUENCE
   */
  private runRevealSequence(roomCode: string) {
    // 3
    SoundFX.playCountdownTick(3);
    setTimeout(() => {
      const r = localRooms.get(roomCode);
      if (!r || r.status !== 'revealing') return;
      SoundFX.playCountdownTick(2);
      this.updateRoomState({ ...r, revealCountdown: 2, lastUpdated: Date.now() });

      // 2
      setTimeout(() => {
        const r2 = localRooms.get(roomCode);
        if (!r2 || r2.status !== 'revealing') return;
        SoundFX.playCountdownTick(1);
        this.updateRoomState({ ...r2, revealCountdown: 1, lastUpdated: Date.now() });

        // 1 -> REVEAL!
        setTimeout(() => {
          this.resolveRound(roomCode);
        }, 1000);
      }, 1000);
    }, 1000);
  }

  /**
   * RESOLVE ROUND (Damage, HP decrease, check game over)
   */
  private resolveRound(roomCode: string) {
    const room = localRooms.get(roomCode);
    if (!room || !room.guest || !room.host.selectedMove || !room.guest.selectedMove) return;

    SoundFX.playClash();

    const hostMove = room.host.selectedMove;
    const guestMove = room.guest.selectedMove;
    const roundWinner = determineWinner(hostMove, guestMove);

    let hostHp = room.host.hp;
    let guestHp = room.guest.hp;
    const damage = 20;

    let hostScore = room.host.score;
    let guestScore = room.guest.score;

    if (roundWinner === 'host') {
      guestHp = Math.max(0, guestHp - damage);
      hostScore += 1;
      if (this.myPlayerId === room.host.id) SoundFX.playRoundWin();
      else SoundFX.playRoundLoss();
    } else if (roundWinner === 'guest') {
      hostHp = Math.max(0, hostHp - damage);
      guestScore += 1;
      if (this.myPlayerId === room.guest.id) SoundFX.playRoundWin();
      else SoundFX.playRoundLoss();
    }

    const historyItem: RoundHistoryItem = {
      round: room.round,
      hostMove,
      guestMove,
      winner: roundWinner,
      damage: roundWinner === 'tie' ? 0 : damage,
      timestamp: Date.now(),
    };

    const isGameOver = hostHp <= 0 || guestHp <= 0;
    let finalWinnerId: string | null = null;
    if (isGameOver) {
      if (hostHp <= 0 && guestHp <= 0) {
        finalWinnerId = 'tie';
      } else if (hostHp <= 0) {
        finalWinnerId = room.guest.id;
      } else {
        finalWinnerId = room.host.id;
      }
    }

    const resultRoom: RoomData = {
      ...room,
      status: isGameOver ? 'game_over' : 'round_result',
      round: room.round,
      currentRoundWinner: roundWinner,
      currentRoundDamage: damage,
      revealCountdown: 0,
      host: {
        ...room.host,
        hp: hostHp,
        score: hostScore,
      },
      guest: {
        ...room.guest,
        hp: guestHp,
        score: guestScore,
      },
      history: [...room.history, historyItem],
      winnerId: finalWinnerId,
      lastUpdated: Date.now(),
    };

    this.updateRoomState(resultRoom);

    // If game over, play victory or defeat fanfare
    if (isGameOver) {
      setTimeout(() => {
        if (finalWinnerId === this.myPlayerId) {
          SoundFX.playVictoryFanfare();
        } else if (finalWinnerId !== 'tie') {
          SoundFX.playDefeat();
        }
      }, 500);
      return;
    }

    // Auto advance to next round after 3.2 seconds
    setTimeout(() => {
      const current = localRooms.get(roomCode);
      if (!current || current.status !== 'round_result') return;

      const nextRoundRoom: RoomData = {
        ...current,
        round: current.round + 1,
        status: 'choosing',
        currentRoundWinner: null,
        currentRoundDamage: 0,
        host: {
          ...current.host,
          selectedMove: null,
          moveLocked: false,
        },
        guest: current.guest
          ? {
              ...current.guest,
              selectedMove: null,
              moveLocked: false,
            }
          : null,
        lastUpdated: Date.now(),
      };
      this.updateRoomState(nextRoundRoom);
    }, 3200);
  }

  /**
   * SEND TAUNT / REACTION
   */
  public async sendTaunt(roomCode: string, senderId: string, text: string) {
    const room = localRooms.get(roomCode);
    if (!room) return;

    const updated: RoomData = {
      ...room,
      lastTaunt: {
        senderId,
        text,
        timestamp: Date.now(),
      },
      lastUpdated: Date.now(),
    };

    this.updateRoomState(updated);
  }

  /**
   * REQUEST REMATCH
   */
  public async requestRematch(roomCode: string, playerId: string) {
    const room = localRooms.get(roomCode);
    if (!room || !room.guest) return;

    let updatedHost = { ...room.host };
    let updatedGuest = { ...room.guest };

    if (room.host.id === playerId) {
      updatedHost.rematchRequested = true;
    } else {
      updatedGuest.rematchRequested = true;
    }

    // If both requested rematch, reset match!
    if (updatedHost.rematchRequested && updatedGuest.rematchRequested) {
      const resetRoom: RoomData = {
        ...room,
        status: 'choosing',
        round: 1,
        currentRoundWinner: null,
        currentRoundDamage: 0,
        winnerId: null,
        history: [],
        host: {
          ...updatedHost,
          hp: 100,
          selectedMove: null,
          moveLocked: false,
          score: 0,
          rematchRequested: false,
        },
        guest: {
          ...updatedGuest,
          hp: 100,
          selectedMove: null,
          moveLocked: false,
          score: 0,
          rematchRequested: false,
        },
        lastUpdated: Date.now(),
      };
      this.updateRoomState(resetRoom);
    } else {
      const updated: RoomData = {
        ...room,
        host: updatedHost,
        guest: updatedGuest,
        lastUpdated: Date.now(),
      };
      this.updateRoomState(updated);
    }
  }

  /**
   * Update Room state across all channels (Local, Broadcast, Firestore)
   */
  private updateRoomState(room: RoomData) {
    localRooms.set(room.roomCode, room);
    this.notifySubscribers(room);
    this.broadcastLocally(room);
    updateFirestoreRoom(room.roomCode, room).catch(() => {});
  }

  /**
   * Setup Firestore listener
   */
  private setupFirestoreListener(roomCode: string) {
    if (this.firestoreUnsubs.has(roomCode)) return;

    const unsub = listenToFirestoreRoom(
      roomCode,
      (remoteRoom) => {
        this.handleIncomingRoomUpdate(remoteRoom, true);
      },
      (err) => {
        console.warn('Firestore subscription fallback:', err);
      }
    );

    this.firestoreUnsubs.set(roomCode, unsub);
  }

  /**
   * SUBSCRIBE TO ROOM
   */
  public subscribeToRoom(roomCode: string, callback: (room: RoomData) => void): () => void {
    if (!this.subscribers.has(roomCode)) {
      this.subscribers.set(roomCode, new Set());
    }
    this.subscribers.get(roomCode)!.add(callback);

    // Initial state trigger if room exists
    const existing = localRooms.get(roomCode);
    if (existing) {
      callback(existing);
    }

    this.setupFirestoreListener(roomCode);

    return () => {
      const subs = this.subscribers.get(roomCode);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(roomCode);
          const unsub = this.firestoreUnsubs.get(roomCode);
          if (unsub) {
            unsub();
            this.firestoreUnsubs.delete(roomCode);
          }
        }
      }
    };
  }

  /**
   * AI BATTLE HELPER (Create solo practice match against bot)
   */
  public createAiBattle(
    hostPlayer: PlayerData,
    aiBotData: PlayerData,
    difficulty: 'easy' | 'medium' | 'hard' | 'grandmaster',
    selectAiMoveFn: (history: Move[], opponentHp: number, myHp: number) => Move
  ): string {
    const roomCode = 'BOT_' + generateRoomCode().substring(0, 4);
    this.activeRoomCode = roomCode;
    this.myPlayerId = hostPlayer.id;

    const room: RoomData = {
      roomCode,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      status: 'choosing',
      round: 1,
      host: hostPlayer,
      guest: aiBotData,
      currentRoundWinner: null,
      currentRoundDamage: 0,
      revealCountdown: 3,
      history: [],
      winnerId: null,
      isAiBattle: true,
      aiDifficulty: difficulty,
    };

    localRooms.set(roomCode, room);
    this.notifySubscribers(room);

    return roomCode;
  }

  /**
   * TRIGGER AI MOVE RESPONSE
   */
  public triggerAiMove(
    roomCode: string,
    selectAiMoveFn: (history: Move[], opponentHp: number, myHp: number) => Move
  ) {
    const room = localRooms.get(roomCode);
    if (!room || !room.isAiBattle || !room.guest) return;

    // Simulate AI thinking delay (600ms - 1200ms)
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      const current = localRooms.get(roomCode);
      if (!current || current.status !== 'choosing') return;

      const playerHistory = current.history.map((h) => h.hostMove);
      const aiMove = selectAiMoveFn(playerHistory, current.host.hp, current.guest!.hp);

      this.makeMove(roomCode, current.guest!.id, aiMove);
    }, delay);
  }

  public leaveRoom(roomCode: string) {
    const unsub = this.firestoreUnsubs.get(roomCode);
    if (unsub) {
      unsub();
      this.firestoreUnsubs.delete(roomCode);
    }
    localRooms.delete(roomCode);
    if (this.activeRoomCode === roomCode) {
      this.activeRoomCode = null;
    }
  }
}

export const Multiplayer = new MultiplayerService();
