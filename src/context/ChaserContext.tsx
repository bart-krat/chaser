'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Chaser } from '@/types/chaser';

interface ChaserContextType {
  chasers: Chaser[];
  addChaser: (chaser: Chaser) => void;
  deleteChaser: (id: string) => void;
}

const ChaserContext = createContext<ChaserContextType | undefined>(undefined);

export function ChaserProvider({ children }: { children: ReactNode }) {
  const [chasers, setChasers] = useState<Chaser[]>([]);

  const addChaser = (chaser: Chaser) => {
    setChasers([chaser, ...chasers]);
  };

  const deleteChaser = (id: string) => {
    setChasers(chasers.filter(chaser => chaser.id !== id));
  };

  return (
    <ChaserContext.Provider value={{ chasers, addChaser, deleteChaser }}>
      {children}
    </ChaserContext.Provider>
  );
}

export function useChasers() {
  const context = useContext(ChaserContext);
  if (context === undefined) {
    throw new Error('useChasers must be used within a ChaserProvider');
  }
  return context;
}

