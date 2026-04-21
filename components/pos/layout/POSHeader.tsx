"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Store,
  Monitor,
  User,
  Clock,
  LogOut,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  Wifi,
  WifiOff,
  Bell,
  Printer,
  ScanLine,
  CreditCard,
  Check,
  Trash2,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  usePOSSessionStore,
  type ShiftInfo,
  type StaffMember,
  type PeripheralStatus,
  type NotificationItem,
} from "@/store/pos-session-store";

// ─── Constants ───────────────────────────────────────────

const SHIFT_WARNING_THRESHOLD_MS = 8 * 60 * 60 * 1000; // 8 hours
const SHIFT_CRITICAL_THRESHOLD_MS = 10 * 60 * 60 * 1000; // 10 hours

// ─── Helpers ─────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatDuration(startedAt: Date): string {
  const diff = Date.now() - startedAt.getTime();
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

function formatShortTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function getShiftBadgeVariant(status: ShiftInfo["status"]) {
  switch (status) {
    case "active":
      return "default";
    case "paused":
      return "secondary";
    case "ended":
      return "destructive";
    default:
      return "outline";
  }
}

function getShiftLabel(status: ShiftInfo["status"]) {
  switch (status) {
    case "active":
      return "On Shift";
    case "paused":
      return "Break";
    case "ended":
      return "Shift Ended";
  }
}

function getShiftDurationColor(startedAt: Date): string {
  const diff = Date.now() - startedAt.getTime();
  if (diff >= SHIFT_CRITICAL_THRESHOLD_MS) return "#EF4444";
  if (diff >= SHIFT_WARNING_THRESHOLD_MS) return "#F59E0B";
  return "#64748B";
}

function getPeripheralIcon(type: keyof PeripheralStatus) {
  switch (type) {
    case "printer":
      return Printer;
    case "scanner":
      return ScanLine;
    case "cardReader":
      return CreditCard;
  }
}

function getPeripheralColor(status: PeripheralStatus[keyof PeripheralStatus]): string {
  switch (status) {
    case "connected":
      return "#22C55E";
    case "busy":
      return "#3B82F6";
    case "disconnected":
      return "#EF4444";
    case "error":
      return "#EF4444";
    default:
      return "#64748B";
  }
}

function getNotificationIconColor(type: NotificationItem["type"]): string {
  switch (type) {
    case "low-stock":
      return "#F59E0B";
    case "approval":
      return "#3B82F6";
    case "system":
      return "#64748B";
    case "shift-warning":
      return "#EF4444";
  }
}

function getNotificationBgColor(type: NotificationItem["type"]): string {
  switch (type) {
    case "low-stock":
      return "#FFFBEB";
    case "approval":
      return "#EFF6FF";
    case "system":
      return "#F8FAFC";
    case "shift-warning":
      return "#FEF2F2";
  }
}

// ─── Sub-components ──────────────────────────────────────

function PeripheralIndicator({
  type,
  status,
}: {
  type: keyof PeripheralStatus;
  status: PeripheralStatus[keyof PeripheralStatus];
}) {
  const Icon = getPeripheralIcon(type);
  const color = getPeripheralColor(status);

  return (
    <div
      className="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
      style={{ backgroundColor: status === "connected" ? "#F0FDF4" : "#FEF2F2" }}
      title={`${type}: ${status}`}
    >
      <Icon className="h-3.5 w-3.5" style={{ color }} strokeWidth={2} />
    </div>
  );
}

function ShiftWarningBanner({
  shift,
  onEndShift,
}: {
  shift: ShiftInfo;
  onEndShift?: () => void;
}) {
  const diff = Date.now() - shift.startedAt.getTime();
  const isCritical = diff >= SHIFT_CRITICAL_THRESHOLD_MS;
  const isWarning = diff >= SHIFT_WARNING_THRESHOLD_MS && !isCritical;

  if (!isWarning && !isCritical) return null;

  return (
    <div
      className="flex items-center justify-between px-5 py-2 lg:px-6"
      style={{
        backgroundColor: isCritical ? "#FEF2F2" : "#FFFBEB",
        borderBottom: `1px solid ${isCritical ? "#FECACA" : "#FDE68A"}`,
      }}
    >
      <div className="flex items-center gap-2.5">
        <AlertCircle
          className="h-4 w-4 flex-shrink-0"
          style={{ color: isCritical ? "#EF4444" : "#F59E0B" }}
          strokeWidth={2}
        />
        <span
          className="text-sm font-medium"
          style={{ color: isCritical ? "#EF4444" : "#92400E" }}
        >
          {isCritical
            ? `Shift exceeded 10 hours — please end shift immediately`
            : `Shift approaching 8 hours — consider ending soon`}
        </span>
      </div>
      {onEndShift && (
        <Button
          size="sm"
          className="h-7 gap-1.5 rounded-md px-3 text-xs font-semibold"
          style={{
            backgroundColor: isCritical ? "#EF4444" : "#F59E0B",
            color: "#FFFFFF",
          }}
          onClick={onEndShift}
        >
          <Clock className="h-3 w-3" strokeWidth={2} />
          End Shift
        </Button>
      )}
    </div>
  );
}

function NotificationPanel() {
  const { notifications, unreadCount, markNotificationRead, markAllRead, removeNotification } =
    usePOSSessionStore();

  const unread = unreadCount();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          {unread > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
              style={{ backgroundColor: "#EF4444" }}
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 rounded-xl border p-0"
        style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>
            Notifications
          </span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8]"
              onClick={(e) => {
                e.stopPropagation();
                markAllRead();
              }}
            >
              Mark all read
            </Button>
          )}
        </div>

        <Separator style={{ backgroundColor: "#E2E8F0" }} />

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Bell
              className="h-8 w-8"
              style={{ color: "#CBD5E1" }}
              strokeWidth={1.5}
            />
            <span className="mt-2 text-sm" style={{ color: "#94A3B8" }}>
              No notifications
            </span>
          </div>
        ) : (
          <ScrollArea className="h-72">
            <div className="flex flex-col py-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group relative flex gap-3 px-4 py-3 transition-colors hover:bg-[#F8FAFC]",
                    !notification.read && "bg-[#F8FAFC]"
                  )}
                >
                  {/* Priority indicator */}
                  <div
                    className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
                    style={{
                      backgroundColor: notification.priority === "high" 
                        ? "#EF4444" 
                        : notification.priority === "normal"
                        ? "#3B82F6"
                        : "#94A3B8",
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          !notification.read ? "font-semibold text-[#0F172A]" : "font-medium text-[#334155]"
                        )}
                      >
                        {notification.title}
                      </p>
                      <span className="flex-shrink-0 text-[11px] text-[#94A3B8]">
                        {formatShortTime(notification.timestamp)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-[#64748B]">
                      {notification.message}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md text-[#64748B] hover:bg-[#E2E8F0] hover:text-[#0F172A]"
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationRead(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3" strokeWidth={2} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md text-[#64748B] hover:bg-[#FEF2F2] hover:text-[#EF4444]"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" strokeWidth={2} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Main Component ──────────────────────────────────────

export interface POSHeaderProps {
  storeName: string;
  terminalId: string;
  terminalLabel?: string;
  onLogout: () => void;
  onEndShift?: () => void;
  onSwitchStaff?: () => void;
  onPauseShift?: () => void;
  onResumeShift?: () => void;
  className?: string;
}

export function POSHeader({
  storeName,
  terminalId,
  terminalLabel,
  onLogout,
  onEndShift,
  onSwitchStaff,
  onPauseShift,
  onResumeShift,
  className,
}: POSHeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Zustand store selectors
  const staff = usePOSSessionStore((state) => state.staff);
  const shift = usePOSSessionStore((state) => state.shift);
  const peripherals = usePOSSessionStore((state) => state.peripherals);
  const isOnline = usePOSSessionStore((state) => state.isOnline);
  const pauseShift = usePOSSessionStore((state) => state.pauseShift);
  const resumeShift = usePOSSessionStore((state) => state.resumeShift);

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-generate shift warnings
  useEffect(() => {
    if (!shift) return;
    const diff = Date.now() - shift.startedAt.getTime();
    
    if (diff >= SHIFT_WARNING_THRESHOLD_MS && diff < SHIFT_WARNING_THRESHOLD_MS + 60000) {
      usePOSSessionStore.getState().addNotification({
        type: "shift-warning",
        title: "Shift Duration Warning",
        message: `Your shift has reached 8 hours. Please consider ending your shift soon.`,
        priority: "high",
      });
    }
    
    if (diff >= SHIFT_CRITICAL_THRESHOLD_MS && diff < SHIFT_CRITICAL_THRESHOLD_MS + 60000) {
      usePOSSessionStore.getState().addNotification({
        type: "shift-warning",
        title: "Critical: Shift Exceeded 10 Hours",
        message: `Your shift has exceeded 10 hours. Please end your shift immediately.`,
        priority: "high",
      });
    }
  }, [currentTime, shift]);

  const shiftDuration = shift ? formatDuration(shift.startedAt) : "0h 0m";
  const durationColor = shift ? getShiftDurationColor(shift.startedAt) : "#64748B";

  // Peripheral status summary
  const peripheralIssues = useMemo(() => {
    return Object.entries(peripherals).filter(
      ([, status]) => status === "disconnected" || status === "error"
    );
  }, [peripherals]);

  if (!staff || !shift) {
    return (
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b",
          className
        )}
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0" }}
      >
        <div className="flex h-16 items-center justify-between px-5 lg:px-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: "#2563EB" }}
            >
              <Store className="h-[18px] w-[18px] text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-semibold" style={{ color: "#0F172A" }}>
              {storeName}
            </span>
          </div>
          <span className="text-sm text-[#64748B]">No active session</span>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-surface shadow-sm",
          className
        )}
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0" }}
      >
        <div className="flex h-16 items-center justify-between px-5 lg:px-6">
          {/* ─── Left: Store, Terminal, Peripherals ───────── */}
          <div className="flex items-center gap-4 lg:gap-5">
            {/* Store Identity */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: "#2563EB" }}
              >
                <Store className="h-[18px] w-[18px] text-white" strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-sm font-semibold leading-tight tracking-tight"
                  style={{ color: "#0F172A" }}
                >
                  {storeName}
                </span>
                <div className="flex items-center gap-1.5">
                  <Monitor
                    className="h-3 w-3"
                    style={{ color: "#64748B" }}
                    strokeWidth={2}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: "#64748B" }}
                  >
                    {terminalLabel ?? `Terminal ${terminalId}`}
                  </span>
                </div>
              </div>
            </div>

            <Separator
              orientation="vertical"
              className="hidden h-6 sm:block"
              style={{ backgroundColor: "#E2E8F0" }}
            />

            {/* Connection Status */}
            <div className="hidden items-center gap-1.5 sm:flex">
              {isOnline ? (
                <Wifi
                  className="h-3.5 w-3.5"
                  style={{ color: "#22C55E" }}
                  strokeWidth={2}
                />
              ) : (
                <WifiOff
                  className="h-3.5 w-3.5"
                  style={{ color: "#EF4444" }}
                  strokeWidth={2}
                />
              )}
              <span
                className="text-xs font-medium"
                style={{ color: isOnline ? "#22C55E" : "#EF4444" }}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>

            {/* Peripheral Status Indicators */}
            <div className="hidden items-center gap-1.5 md:flex">
              <Separator
                orientation="vertical"
                className="hidden h-6 md:block"
                style={{ backgroundColor: "#E2E8F0" }}
              />
              <PeripheralIndicator type="printer" status={peripherals.printer} />
              <PeripheralIndicator type="scanner" status={peripherals.scanner} />
              <PeripheralIndicator type="cardReader" status={peripherals.cardReader} />
              {peripheralIssues.length > 0 && (
                <Badge
                  variant="outline"
                  className="ml-1 h-5 gap-1 rounded-md border-[#FECACA] px-1.5 text-[10px] font-medium text-[#EF4444]"
                >
                  <AlertCircle className="h-3 w-3" strokeWidth={2} />
                  {peripheralIssues.length}
                </Badge>
              )}
            </div>
          </div>

          {/* ─── Right: Notifications, Shift, Clock, Staff ── */}
          <div className="flex items-center gap-3 lg:gap-4">
            {/* Notification Bell */}
            <NotificationPanel />

            <Separator
              orientation="vertical"
              className="hidden h-6 sm:block"
              style={{ backgroundColor: "#E2E8F0" }}
            />

            {/* Shift Badge + Duration */}
            <div className="hidden items-center gap-2.5 md:flex">
              <Badge
                variant={getShiftBadgeVariant(shift.status)}
                className="h-6 gap-1 rounded-full px-2.5 text-xs font-medium"
                style={
                  shift.status === "active"
                    ? {
                        backgroundColor: "#10B981",
                        color: "#FFFFFF",
                        borderColor: "#10B981",
                      }
                    : shift.status === "paused"
                    ? {
                        backgroundColor: "#FEF3C7",
                        color: "#92400E",
                        borderColor: "#FDE68A",
                      }
                    : undefined
                }
              >
                <Clock className="h-3 w-3" strokeWidth={2} />
                {getShiftLabel(shift.status)}
              </Badge>
              <span
                className="text-xs font-medium tabular-nums"
                style={{ color: durationColor }}
              >
                {shiftDuration}
              </span>
            </div>

            <Separator
              orientation="vertical"
              className="hidden h-6 md:block"
              style={{ backgroundColor: "#E2E8F0" }}
            />

            {/* Live Clock */}
            <div className="hidden flex-col items-end sm:flex">
              <span
                className="text-sm font-semibold tabular-nums tracking-tight"
                style={{ color: "#0F172A" }}
              >
                {formatTime(currentTime)}
              </span>
              <span
                className="text-[11px] font-medium uppercase tracking-wide"
                style={{ color: "#64748B" }}
              >
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <Separator
              orientation="vertical"
              className="hidden h-6 sm:block"
              style={{ backgroundColor: "#E2E8F0" }}
            />

            {/* Staff Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-10 items-center gap-2.5 rounded-lg px-2.5 hover:bg-[#F1F5F9]"
                >
                  <Avatar className="h-7 w-7 border" style={{ borderColor: "#E2E8F0" }}>
                    <AvatarImage src={staff.avatarUrl} alt={staff.name} />
                    <AvatarFallback
                      className="text-xs font-semibold"
                      style={{
                        backgroundColor: "#EFF6FF",
                        color: "#2563EB",
                      }}
                    >
                      {staff.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden flex-col items-start sm:flex">
                    <span
                      className="text-sm font-semibold leading-none"
                      style={{ color: "#0F172A" }}
                    >
                      {staff.name}
                    </span>
                    <span
                      className="text-[11px] font-medium leading-none"
                      style={{ color: "#64748B" }}
                    >
                      {staff.role}
                    </span>
                  </div>
                  <ChevronDown
                    className="hidden h-3.5 w-3.5 sm:block"
                    style={{ color: "#64748B" }}
                    strokeWidth={2}
                  />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-72 rounded-xl border p-2"
                style={{ borderColor: "#E2E8F0", backgroundColor: "#FFFFFF" }}
              >
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-[#64748B]">
                  Staff Session
                </DropdownMenuLabel>

                <div className="flex items-start gap-3 rounded-lg p-2">
                  <Avatar className="h-10 w-10 border" style={{ borderColor: "#E2E8F0" }}>
                    <AvatarImage src={staff.avatarUrl} alt={staff.name} />
                    <AvatarFallback
                      className="text-sm font-semibold"
                      style={{
                        backgroundColor: "#EFF6FF",
                        color: "#2563EB",
                      }}
                    >
                      {staff.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "#0F172A" }}
                    >
                      {staff.name}
                    </span>
                    <span className="text-xs text-[#64748B]">{staff.email}</span>
                    <div className="mt-1 flex items-center gap-1">
                      <ShieldCheck
                        className="h-3 w-3"
                        style={{ color: "#2563EB" }}
                        strokeWidth={2}
                      />
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: "#2563EB" }}
                      >
                        {staff.role}
                      </span>
                    </div>
                  </div>
                </div>

                <DropdownMenuSeparator style={{ backgroundColor: "#E2E8F0" }} />

                {/* Shift Info */}
                <div className="space-y-1.5 px-2 py-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Shift Started</span>
                    <span className="font-medium text-[#0F172A]">
                      {shift.startedAt.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Duration</span>
                    <span
                      className="font-medium tabular-nums"
                      style={{ color: durationColor }}
                    >
                      {shiftDuration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Status</span>
                    <span
                      className="font-medium"
                      style={{
                        color:
                          shift.status === "active"
                            ? "#10B981"
                            : shift.status === "paused"
                            ? "#F59E0B"
                            : "#EF4444",
                      }}
                    >
                      {getShiftLabel(shift.status)}
                    </span>
                  </div>
                </div>

                <DropdownMenuSeparator style={{ backgroundColor: "#E2E8F0" }} />

                {/* Shift Controls */}
                {shift.status === "active" && onPauseShift && (
                  <DropdownMenuItem
                    onClick={() => {
                      pauseShift();
                      onPauseShift();
                    }}
                    className="cursor-pointer gap-2 rounded-md text-sm font-medium text-[#0F172A] focus:bg-[#F1F5F9]"
                  >
                    <Pause className="h-4 w-4 text-[#64748B]" strokeWidth={2} />
                    Pause Shift
                  </DropdownMenuItem>
                )}

                {shift.status === "paused" && onResumeShift && (
                  <DropdownMenuItem
                    onClick={() => {
                      resumeShift();
                      onResumeShift();
                    }}
                    className="cursor-pointer gap-2 rounded-md text-sm font-medium text-[#0F172A] focus:bg-[#F1F5F9]"
                  >
                    <Play className="h-4 w-4 text-[#10B981]" strokeWidth={2} />
                    Resume Shift
                  </DropdownMenuItem>
                )}

                {onSwitchStaff && (
                  <DropdownMenuItem
                    onClick={onSwitchStaff}
                    className="cursor-pointer gap-2 rounded-md text-sm font-medium text-[#0F172A] focus:bg-[#F1F5F9]"
                  >
                    <User className="h-4 w-4 text-[#64748B]" strokeWidth={2} />
                    Switch Staff
                  </DropdownMenuItem>
                )}

                {onEndShift && (
                  <DropdownMenuItem
                    onClick={onEndShift}
                    className="cursor-pointer gap-2 rounded-md text-sm font-medium text-[#F59E0B] focus:bg-[#FFFBEB] focus:text-[#B45309]"
                  >
                    <Clock className="h-4 w-4" strokeWidth={2} />
                    End Shift
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator style={{ backgroundColor: "#E2E8F0" }} />

                <DropdownMenuItem
                  onClick={onLogout}
                  className="cursor-pointer gap-2 rounded-md text-sm font-medium text-[#EF4444] focus:bg-[#FEF2F2] focus:text-[#EF4444]"
                >
                  <LogOut className="h-4 w-4" strokeWidth={2} />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile quick logout */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#EF4444] sm:hidden"
              onClick={onLogout}
              aria-label="Logout"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </header>

      {/* Shift Warning Banner */}
      <ShiftWarningBanner shift={shift} onEndShift={onEndShift} />
    </>
  );
}