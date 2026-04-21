import { create } from "zustand";

export type ShiftStatus = "active" | "paused" | "ended";

export interface ShiftInfo {
    id: string;
    status: ShiftStatus;
    startedAt: Date;
    endedAt?: Date;
}

export interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
    initials: string;
}

export interface PeripheralStatus {
    printer: "connected" | "disconnected" | "error";
    scanner: "connected" | "disconnected";
    cardReader: "connected" | "disconnected" | "busy";
}

export interface NotificationItem {
    id: string;
    type: "low-stock" | "approval" | "system" | "shift-warning";
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    priority?: "high" | "normal" | "low";
}

interface POSSessionState {
    // Staff & Shift
    staff: StaffMember | null;
    shift: ShiftInfo | null;
    setStaff: (staff: StaffMember) => void;
    clearStaff: () => void;
    startShift: (shift: ShiftInfo) => void;
    endShift: () => void;
    pauseShift: () => void;
    resumeShift: () => void;

    // Peripherals
    peripherals: PeripheralStatus;
    setPeripheralStatus: (status: Partial<PeripheralStatus>) => void;

    // Notifications
    notifications: NotificationItem[];
    addNotification: (notification: Omit<NotificationItem, "id" | "timestamp" | "read">) => void;
    markNotificationRead: (id: string) => void;
    markAllRead: () => void;
    unreadCount: () => number;
    removeNotification: (id: string) => void;

    // Session
    isOnline: boolean;
    setOnline: (online: boolean) => void;
}

export const usePOSSessionStore = create<POSSessionState>((set, get) => ({
    staff: null,
    shift: null,
    peripherals: {
        printer: "connected",
        scanner: "connected",
        cardReader: "connected",
    },
    notifications: [],
    isOnline: true,

    setStaff: (staff) => set({ staff }),
    clearStaff: () => set({ staff: null, shift: null }),
    startShift: (shift) => set({ shift }),
    endShift: () => set({ shift: null }),
    pauseShift: () => {
        const { shift } = get();
        if (shift) set({ shift: { ...shift, status: "paused" } });
    },
    resumeShift: () => {
        const { shift } = get();
        if (shift) set({ shift: { ...shift, status: "active" } });
    },

    setPeripheralStatus: (status) =>
        set((state) => ({
            peripherals: { ...state.peripherals, ...status },
        })),

    addNotification: (notification) =>
        set((state) => ({
            notifications: [
                {
                    ...notification,
                    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date(),
                    read: false,
                },
                ...state.notifications,
            ],
        })),

    markNotificationRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
        })),

    markAllRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

    unreadCount: () => get().notifications.filter((n) => !n.read).length,

    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),

    setOnline: (online) => set({ isOnline: online }),
}));