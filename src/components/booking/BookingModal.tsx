import { useState } from "react";
import { X, Calendar, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingModalProps {
  space: {
    id: string;
    name: string;
    type: string;
    image: string;
    price: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string, time: string, duration: number) => void;
}

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

const durations = [
  { value: 1, label: "1 hour" },
  { value: 2, label: "2 hours" },
  { value: 4, label: "4 hours" },
  { value: 8, label: "Full day" },
];

export const BookingModal = ({ space, isOpen, onClose, onConfirm }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(1);

  if (!isOpen || !space) return null;

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatDate = (date: Date) => {
    return date.getDate();
  };

  const handleConfirm = () => {
    if (selectedTime) {
      onConfirm(
        selectedDate.toISOString().split('T')[0],
        selectedTime,
        selectedDuration
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border-t border-x border-border rounded-t-3xl animate-slide-up max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Book Space</h2>
            <p className="text-sm text-muted-foreground">{space.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary transition-colors tap-highlight"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Date Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Select Date</h3>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
              {dates.map((date) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "flex-shrink-0 flex flex-col items-center p-3 rounded-xl min-w-[60px] transition-all duration-200 tap-highlight",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium",
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {formatDay(date)}
                    </span>
                    <span className="text-lg font-bold mt-1">
                      {formatDate(date)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Time Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Select Time</h3>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {timeSlots.map((time) => {
                const isSelected = time === selectedTime;
                return (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-200 tap-highlight",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                    )}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Duration Selection */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-medium text-foreground">Duration</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {durations.map((duration) => {
                const isSelected = duration.value === selectedDuration;
                return (
                  <button
                    key={duration.value}
                    onClick={() => setSelectedDuration(duration.value)}
                    className={cn(
                      "py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-200 tap-highlight",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                    )}
                  >
                    {duration.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-border safe-bottom">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-bold text-foreground">{space.price}</span>
          </div>
          <button
            onClick={handleConfirm}
            disabled={!selectedTime}
            className={cn(
              "w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 tap-highlight",
              selectedTime
                ? "bg-primary text-primary-foreground glow-primary"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};
