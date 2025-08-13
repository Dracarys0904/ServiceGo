import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Star, Calendar as CalendarIcon, Clock, MapPin, User } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useServices } from "@/hooks/useServices";
import { useBookings } from "@/hooks/useBookings";
import { useNotifications } from "@/hooks/useNotifications";

const BookingForm = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [service, setService] = useState<any | null>(null); // Changed type to any as supabase is removed
  const [serviceLoading, setServiceLoading] = useState(true);

  const { services, loading: servicesLoading, refetch: refetchServices } = useServices();
  const { bookings, loading: bookingsLoading, refetch: refetchBookings, updateBookingStatus } = useBookings();
  const { notifications, loading: notificationsLoading, unreadCount, refetch: refetchNotifications, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    if (serviceId && services.length > 0) {
      const foundService = services.find((s: any) => s.id === serviceId);
      setService(foundService || null);
      setServiceLoading(false);
    } else if (!servicesLoading) {
      setServiceLoading(false);
    }
  }, [serviceId, services, servicesLoading]);

  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00",
    "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !service || !profile) {
      toast({
        title: "Missing Information",
        description: "Please select both date and time for your booking.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Add booking to Firestore directly since createBooking is not available
      const bookingData = {
        customer_id: profile.id,
        service_id: service.id,
        provider_id: service.provider_id,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        booking_time: selectedTime,
        message: message || null,
        total_amount: service.price,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participants: [profile.id, service.provider_id],
      };
      // Use Firebase Firestore directly
      const { addDoc, collection } = await import('firebase/firestore');
      const { db } = await import('@/integrations/firebase/client');
      await addDoc(collection(db, 'bookings'), bookingData);
      toast({
        title: "Booking Request Sent!",
        description: "Your booking request has been sent to the service provider. You'll receive a confirmation soon."
      });
      refetchBookings && refetchBookings();
      navigate("/customer-dashboard");
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const averageRating = service?.reviews && service.reviews.length > 0
    ? service.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / service.reviews.length
    : 0;

  if (serviceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service Not Found</h1>
          <Button asChild>
            <Link to="/customer-dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-display text-2xl font-bold text-primary">
              Service Direct Go
            </Link>
            <Link to="/customer-dashboard" className="text-primary hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Book Your Service</h1>
          <p className="text-muted-foreground">"Excellence just a click away" - Schedule your service appointment</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Service Details */}
          <Card className="h-fit">
            <div className="aspect-video relative">
              <img 
                src={service.images?.[0] || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400"} 
                alt={service.title}
                className="object-cover w-full h-full rounded-t-lg"
              />
              <Badge className="absolute top-3 right-3 bg-green-500">
                Available
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">{service.title}</CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{service.provider?.full_name}</span>
                </div>
                <Badge variant="outline">{service.category?.name}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{averageRating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({service.reviews?.length || 0} reviews)</span>
                </div>
                <span className="font-semibold text-primary text-lg">${service.price}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{service.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Your Appointment</CardTitle>
              <CardDescription>Choose your preferred date and time</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                <div className="space-y-2">
                  <Label>Select Time</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        type="button"
                        variant={selectedTime === time ? "default" : "outline"}
                        className="text-sm"
                        onClick={() => setSelectedTime(time)}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Additional Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Describe your issue or any specific requirements..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Booking Summary */}
                {selectedDate && selectedTime && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Booking Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div>📅 {format(selectedDate, "EEEE, MMMM do, yyyy")}</div>
                        <div>⏰ {selectedTime}</div>
                        <div>💰 ${service.price}</div>
                        <div>👤 {service.provider?.full_name}</div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={loading || !selectedDate || !selectedTime}
                >
                  {loading ? "Sending Request..." : "Book Service"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By booking, you agree to our terms of service. The service provider will contact you to confirm the appointment.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;