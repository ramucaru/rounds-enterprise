import type { ReactNode } from 'react';

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return <section style={{ border: '1px solid #d6dbe6', borderRadius: 12, padding: 16, background: '#fff' }}><h2>{title}</h2>{children}</section>;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span style={{ background: '#eef4ff', color: '#2156a3', padding: '4px 8px', borderRadius: 999 }}>{children}</span>;
}
