import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { WaterTrackerPage } from './pages/WaterTrackerPage';
import { BlogPage } from './pages/BlogPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { AccountPage } from './pages/AccountPage';
import { Toaster } from './components/ui/sonner';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/water-tracker" element={<WaterTrackerPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/privacy" element={<LegalPage title="Privacy Policy" />} />
              <Route path="/terms" element={<LegalPage title="Terms & Conditions" />} />
              <Route path="/disclaimer" element={<LegalPage title="Disclaimer" />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function LegalPage({ title }: { title: string }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">{title}</h1>
      <div className="prose max-w-none">
        <p className="text-muted-foreground">
          This is a placeholder page for {title}. In a production environment, this would contain
          the full legal documentation.
        </p>
      </div>
    </div>
  );
}
