import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { User, Package, Heart, Settings } from 'lucide-react';

export function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">My Account</h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">First Name</label>
                  <Input placeholder="John" />
                </div>
                <div>
                  <label className="block mb-2">Last Name</label>
                  <Input placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block mb-2">Email</label>
                <Input type="email" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block mb-2">Phone</label>
                <Input type="tel" placeholder="(555) 123-4567" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No favorite products yet</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Theme Preference</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your theme preference is saved and can be changed using the theme toggle in the header.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Hydration Goal</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your daily water intake goal in the Water Tracker page.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Newsletter</h3>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Subscribe to our wellness newsletter</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
