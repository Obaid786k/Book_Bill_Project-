import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

const faqs = [
  {
    question: "Is Bill Book really free?",
    answer: "Yes, our Free plan is forever free and includes up to 50 bills per month, which is perfect for most small retail and service businesses."
  },
  {
    question: "Do I need an internet connection to use it?",
    answer: "Yes, Bill Book is a cloud-based application, which means your data is safely backed up and accessible from any device with an internet connection."
  },
  {
    question: "Can I use it on my mobile phone?",
    answer: "Absolutely. Bill Book is fully responsive and designed to work seamlessly on desktops, tablets, and smartphones."
  },
  {
    question: "How is GST calculated?",
    answer: "The system automatically detects whether a transaction is intrastate or interstate based on your business state and the customer's state, and applies CGST/SGST or IGST accordingly."
  },
  {
    question: "Is my data secure?",
    answer: "We use industry-standard encryption to protect your data. Your financial information is never shared with third parties."
  }
];

const FAQItem = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-bb2 last:border-b-0">
      <button
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
        onClick={onClick}
      >
        <span className="text-[15px] font-bold text-navy">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-ink3"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[14px] text-ink2 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="py-16 px-6 md:px-12 max-w-3xl mx-auto min-h-[60vh]">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-navy tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-ink2">
          Everything you need to know about the product and billing.
        </p>
      </div>

      <div className="bg-paper rounded-lg p-6 md:p-8 shadow-sm border border-bb2">
        {faqs.map((faq, idx) => (
          <FAQItem
            key={idx}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === idx}
            onClick={() => setOpenIndex(openIndex === idx ? -1 : idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
