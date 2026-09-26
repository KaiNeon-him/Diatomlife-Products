import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const blogPosts = [
  {
    id: 1,
    title: '10 Natural Ways to Boost Your Immune System',
    excerpt: 'Discover science-backed strategies to strengthen your body defenses naturally...',
    category: 'Immune Health',
    date: 'December 20, 2024',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=500&q=80'
  },
  {
    id: 2,
    title: 'The Importance of Hydration for Overall Wellness',
    excerpt: 'Learn why proper hydration is crucial for your health and how to maintain it...',
    category: 'Wellness',
    date: 'December 18, 2024',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&q=80'
  },
  {
    id: 3,
    title: 'Understanding Vitamin C and Its Benefits',
    excerpt: 'Everything you need to know about this essential nutrient and its role in health...',
    category: 'Vitamins',
    date: 'December 15, 2024',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80'
  },
];

export function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Health & Wellness Blog</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our latest articles on natural health, wellness tips, and lifestyle advice
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="text-sm text-muted-foreground">{post.date}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
              <p className="text-sm text-muted-foreground">{post.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
