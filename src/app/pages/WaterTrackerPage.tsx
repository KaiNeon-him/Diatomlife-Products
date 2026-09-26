import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Plus, Minus, Droplet, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface WaterData {
  date: string;
  consumed: number;
  goal: number;
}

export function WaterTrackerPage() {
  const [waterConsumed, setWaterConsumed] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000); // ml
  const [history, setHistory] = useState<WaterData[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem('diatomlife-water-data');
    
    if (storedData) {
      const data: WaterData[] = JSON.parse(storedData);
      const todayData = data.find((d) => d.date === today);
      
      if (todayData) {
        setWaterConsumed(todayData.consumed);
        setDailyGoal(todayData.goal);
      }
      
      setHistory(data.slice(-7)); // Last 7 days
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const storedData = localStorage.getItem('diatomlife-water-data');
    let data: WaterData[] = storedData ? JSON.parse(storedData) : [];
    
    // Update or add today's data
    const todayIndex = data.findIndex((d) => d.date === today);
    const todayData: WaterData = {
      date: today,
      consumed: waterConsumed,
      goal: dailyGoal,
    };
    
    if (todayIndex >= 0) {
      data[todayIndex] = todayData;
    } else {
      data.push(todayData);
    }
    
    // Keep only last 30 days
    data = data.slice(-30);
    
    localStorage.setItem('diatomlife-water-data', JSON.stringify(data));
    setHistory(data.slice(-7));
  }, [waterConsumed, dailyGoal]);

  const addWater = (amount: number) => {
    const newAmount = waterConsumed + amount;
    setWaterConsumed(newAmount);
    
    if (newAmount >= dailyGoal && waterConsumed < dailyGoal) {
      toast.success('🎉 Congratulations! You reached your daily hydration goal!');
    }
  };

  const resetDay = () => {
    setWaterConsumed(0);
    toast.info('Water intake reset for today');
  };

  const percentage = Math.min((waterConsumed / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - waterConsumed, 0);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Droplet className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Water Drinking Monitor</h1>
          <p className="text-lg text-muted-foreground">
            Track your daily water intake and build healthy hydration habits
          </p>
        </div>

        {/* Main Tracker */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">Today's Hydration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Circle Visual */}
            <div className="text-center">
              <div className="relative inline-block">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - percentage / 100)}`}
                    className="text-primary transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-4xl font-bold">{waterConsumed}</p>
                  <p className="text-sm text-muted-foreground">ml</p>
                  <p className="text-xs text-muted-foreground mt-1">{Math.round(percentage)}%</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-accent/50 rounded-lg">
                <Target className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{dailyGoal}</p>
                <p className="text-sm text-muted-foreground">Daily Goal (ml)</p>
              </div>
              <div className="p-4 bg-accent/50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{remaining}</p>
                <p className="text-sm text-muted-foreground">Remaining (ml)</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(percentage)}%</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[250, 500, 750, 1000].map((amount) => (
                <Button
                  key={amount}
                  onClick={() => addWater(amount)}
                  variant="outline"
                  className="flex flex-col h-auto py-3"
                >
                  <Plus className="h-4 w-4 mb-1" />
                  <span className="text-xs">{amount}ml</span>
                </Button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => addWater(-250)}
                disabled={waterConsumed === 0}
                className="flex-1"
              >
                <Minus className="h-4 w-4 mr-2" />
                Remove 250ml
              </Button>
              <Button variant="destructive" onClick={resetDay} className="flex-1">
                Reset Today
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((day) => {
                  const dayPercentage = (day.consumed / day.goal) * 100;
                  const date = new Date(day.date);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  
                  return (
                    <div key={day.date} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{dayName}</span>
                        <span className="text-muted-foreground">
                          {day.consumed} / {day.goal} ml
                        </span>
                      </div>
                      <Progress value={Math.min(dayPercentage, 100)} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hydration Tips */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Hydration Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Drink water first thing in the morning to kickstart your metabolism</p>
            <p>• Carry a reusable water bottle to make hydration convenient</p>
            <p>• Drink before, during, and after exercise</p>
            <p>• Eat water-rich foods like fruits and vegetables</p>
            <p>• Set reminders throughout the day to drink water</p>
            <p>• Adjust your goal based on activity level and climate</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
