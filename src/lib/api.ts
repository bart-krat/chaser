// API client functions for the Chaser Agent

import { CreateChaserRequest, CreateChaserResponse, ChaserBackend } from '@/types/backend';

const API_BASE = '/api';

/**
 * Create a new chaser
 */
export async function createChaser(data: CreateChaserRequest): Promise<CreateChaserResponse> {
  const response = await fetch(`${API_BASE}/chasers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create chaser');
  }

  return response.json();
}

/**
 * Get all chasers
 */
export async function getAllChasers(): Promise<{ chasers: ChaserBackend[], total: number }> {
  const response = await fetch(`${API_BASE}/chasers`);

  if (!response.ok) {
    throw new Error('Failed to fetch chasers');
  }

  return response.json();
}

/**
 * Get a specific chaser by ID
 */
export async function getChaserById(id: string): Promise<ChaserBackend> {
  const response = await fetch(`${API_BASE}/chasers/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch chaser');
  }

  return response.json();
}

/**
 * Update a chaser
 */
export async function updateChaser(id: string, updates: Partial<ChaserBackend>): Promise<void> {
  const response = await fetch(`${API_BASE}/chasers/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update chaser');
  }
}

/**
 * Delete a chaser
 */
export async function deleteChaser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/chasers/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete chaser');
  }
}

/**
 * Record a response from outreach
 */
export async function recordResponse(chaserId: string, messageId: string, type: string): Promise<void> {
  const response = await fetch(`${API_BASE}/webhooks/response`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chaserId, messageId, type }),
  });

  if (!response.ok) {
    throw new Error('Failed to record response');
  }
}

