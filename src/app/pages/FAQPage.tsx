import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

const faqs = [
  {
    question: 'Are your products safe to use?',
    answer: 'Yes, all Diatomlife Products undergo rigorous testing for safety, purity, and potency. We use only high-quality, natural ingredients and follow strict manufacturing standards. However, we always recommend consulting with your healthcare provider before starting any new supplement regimen.'
  },
  {
    question: 'How should I store my supplements?',
    answer: 'Store supplements in a cool, dry place away from direct sunlight. Keep bottles tightly closed and out of reach of children. Do not use if the safety seal is broken.'
  },
  {
    question: 'What is your shipping policy?',
    answer: 'We offer free shipping on orders over $50 within the continental US. Standard shipping takes 3-5 business days. Express shipping options are available at checkout.'
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 30-day money-back guarantee. If you\'re not completely satisfied with your purchase, contact our customer service team for a full refund or exchange.'
  },
  {
    question: 'How do I use the water tracker?',
    answer: 'Simply visit our Water Tracker page and log your water intake throughout the day. Your progress is automatically saved to your browser, so you can track your hydration habits over time.'
  },
  {
    question: 'Are your products vegan/vegetarian?',
    answer: 'Many of our products are suitable for vegetarians and vegans. Please check the individual product pages for specific ingredient information and certifications.'
  },
  {
    question: 'Can I take multiple supplements together?',
    answer: 'In most cases, our supplements can be taken together safely. However, we recommend consulting with a healthcare professional to ensure the combination is appropriate for your individual needs.'
  },
  {
    question: 'How long does it take to see results?',
    answer: 'Results vary depending on the product and individual factors. Some people notice benefits within a few days, while others may take several weeks. Consistency is key for optimal results.'
  }
];

export function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about our products and services
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-6 bg-accent rounded-lg text-center">
          <h3 className="font-semibold mb-2">Still have questions?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Our customer service team is here to help
          </p>
          <a href="/contact" className="text-primary hover:underline">
            Contact Us →
          </a>
        </div>
      </div>
    </div>
  );
}
