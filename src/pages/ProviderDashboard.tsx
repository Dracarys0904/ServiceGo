import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Calendar, Users, User, Edit, Check, X, LogOut, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useServices } from "@/hooks/useServices";
import { useBookings } from "@/hooks/useBookings";
import { useNotifications } from "@/hooks/useNotifications";

const ProviderDashboard = () => {
  const { profile, signOut } = useAuth();
  const { services, loading: servicesLoading, createService, updateService } = useServices();
  const { bookings, loading: bookingsLoading, refetch: refetchBookings, updateBookingStatus } = useBookings();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const [newService, setNewService] = useState({
    title: "",
    description: "",
    price: 0,
    location: "",
    category_id: ""
  });
  const [reviews, setReviews] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

 

 

  const handleAddService = async () => {
    if (!newService.title || !newService.description || !newService.price || !newService.category_id) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await createService({
      ...newService,
      provider_id: profile.id,
      is_available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive"
      });
    } else {
      setNewService({
        title: "",
        description: "",
        price: 0,
        location: "",
        category_id: ""
      });
      setIsDialogOpen(false);
      toast({
        title: "Service Added!",
        description: "Your new service has been added successfully."
      });
    }
  };

  const handleBookingResponse = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    const { error } = await updateBookingStatus(bookingId, status);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update booking. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: status === "confirmed" ? "Booking Confirmed!" : "Booking Cancelled",
        description: `You have ${status} the booking request.`
      });
    }
  };

  const toggleServiceAvailability = async (serviceId: string, currentStatus: boolean) => {
    const { error } = await updateService(serviceId, { is_available: !currentStatus });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update service availability.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Service Updated",
        description: `Service is now ${!currentStatus ? 'available' : 'unavailable'}.`
      });
    }
  };

  // Enrich bookings with service and customer info for rendering
  const enrichedProviderBookings = bookings
    .filter(booking => booking.provider_id === profile?.id)
    .map(booking => {
      const service = services.find(s => s.id === booking.service_id);
      // For customer, just show customer_id for now (could fetch more info if needed)
      return {
        ...booking,
        service: service ? { ...service, title: service.title } : { title: 'Unknown Service' },
        customer: booking.customer || { full_name: booking.customer_id || 'Unknown Customer' },
      };
    });
  const pendingBookings = enrichedProviderBookings.filter(booking => booking.status === 'pending');

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // Auto-refetch bookings when dashboard mounts or tab is focused
  useEffect(() => {
    refetchBookings && refetchBookings();
    const onFocus = () => refetchBookings && refetchBookings();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Debug output
  console.log('Provider profile.id:', profile?.id);
  console.log('Fetched bookings:', bookings);
  console.log('Enriched provider bookings:', enrichedProviderBookings);

  if (servicesLoading || bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>
              <Badge className="flex items-center gap-2 bg-primary">
                <User className="h-4 w-4" />
                Service Provider
              </Badge>
              <Avatar>
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback>{profile?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Welcome, {profile?.full_name}!</h1>
          <p className="text-muted-foreground">"Excellence delivered through expertise" - Manage your services and grow your business</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enrichedProviderBookings.length}</div>
              <p className="text-xs text-muted-foreground">All time bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating}</div>
              <p className="text-xs text-muted-foreground">Based on {reviews.length} reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Services</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{services.filter(s => s.provider_id === profile?.id).filter(s => s.is_available).length}</div>
              <p className="text-xs text-muted-foreground">Out of {services.filter(s => s.provider_id === profile?.id).length} total</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <div className="text-primary">!</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingBookings.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting your response</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
            <TabsTrigger value="services">My Services</TabsTrigger>
            <TabsTrigger value="bookings">Booking Requests</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">My Services</h2>
                <p className="text-muted-foreground">"Quality services, delivered with pride"</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Add New Service</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                    <DialogDescription>Create a new service offering for your customers.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="service-name">Service Name</Label>
                      <Input
                        id="service-name"
                        value={newService.title}
                        onChange={(e) => setNewService({...newService, title: e.target.value})}
                        placeholder="e.g., Expert Computer Repair"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-desc">Description</Label>
                      <Textarea
                        id="service-desc"
                        value={newService.description}
                        onChange={(e) => setNewService({...newService, description: e.target.value})}
                        placeholder="Describe your service..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="service-price">Price (₹)</Label>
                        <Input
                          id="service-price"
                          type="number"
                          value={newService.price}
                          onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value) || 0})}
                          placeholder="50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="service-location">Location</Label>
                        <Input
                          id="service-location"
                          value={newService.location}
                          onChange={(e) => setNewService({...newService, location: e.target.value})}
                          placeholder="Enter your location"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="service-category">Category</Label>
                      <Input
                        id="service-category"
                        value={newService.category_id}
                        onChange={(e) => setNewService({ ...newService, category_id: e.target.value })}
                        placeholder="Enter category name"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddService}>Add Service</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {services.filter(service => service.provider_id === profile?.id).map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{service.title}</CardTitle>
                        <CardDescription>{service.description}</CardDescription>
                      </div>
                      <Badge variant={service.is_available ? "default" : "secondary"}>
                        {service.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium">${service.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{service.location}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Category:</span>
                        <span>{service.category?.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleServiceAvailability(service.id, service.is_available)}
                        >
                          {service.is_available ? "Mark Unavailable" : "Mark Available"}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Requests</CardTitle>
                <CardDescription>"New opportunities await your expertise"</CardDescription>
                <Button onClick={refetchBookings} size="sm" variant="outline" className="mt-2">Refresh</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No pending booking requests</p>
                  ) : (
                    pendingBookings.map((booking) => (
                      <div key={booking.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{booking.customer?.full_name || 'Unknown Customer'}</div>
                            <div className="text-sm text-muted-foreground">{booking.service?.title || 'Unknown Service'}</div>
                            <div className="text-sm">📅 {booking.booking_date} at {booking.booking_time}</div>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        </div>
                        {booking.message && (
                          <div className="text-sm bg-muted p-3 rounded">
                            <span className="font-medium">Message: </span>
                            {booking.message}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleBookingResponse(booking.id, "confirmed")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleBookingResponse(booking.id, "cancelled")}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Customer Reviews
                </CardTitle>
                <CardDescription>"See what customers say about your service"</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No reviews yet</p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium">{review.customer.full_name}</div>
                            <div className="text-sm text-muted-foreground">{review.service.title}</div>
                            <div className="text-sm text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && <p className="text-sm">{review.comment}</p>}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProviderDashboard;