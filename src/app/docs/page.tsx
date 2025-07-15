'use client'
import dynamic from 'next/dynamic';

const SwaggerClient = dynamic(() => import('./swagger-client'), {
  ssr: false, 
});

export default function DocsPage() {
  return <SwaggerClient />;
}
