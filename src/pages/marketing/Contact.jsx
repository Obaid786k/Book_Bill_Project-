import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../components/common/Card';
import { TextInput } from '../../components/forms/TextInput';
import { Textarea } from '../../components/forms/Textarea';
import { Button } from '../../components/common/Button';
import { useToast } from '../../components/feedback/Toast';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
});

const Contact = () => {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(contactSchema)
  });

  const onSubmit = async (data) => {
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    console.log('Form data:', data);
    toast("Thank you! Your message has been sent successfully.");
    reset();
  };

  return (
    <div className="py-16 px-6 md:px-12 max-w-lg mx-auto min-h-[70vh]">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-navy tracking-tight mb-4">Contact Us</h1>
        <p className="text-lg text-ink2">
          Have a question or need support? We're here to help.
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <TextInput
            label="Your Name"
            placeholder="John Doe"
            {...register('name')}
            error={errors.name?.message}
          />
          
          <TextInput
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            {...register('email')}
            error={errors.email?.message}
          />
          
          <Textarea
            label="Message"
            placeholder="How can we help you?"
            rows={5}
            {...register('message')}
            error={errors.message?.message}
          />
          
          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isSubmitting}>
            Send Message
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Contact;
