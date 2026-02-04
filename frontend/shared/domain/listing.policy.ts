/**
 * LOCUS Listing Policy
 * 
 * PATCH 5: Listing Business Logic
 * 
 * All listing permissions MUST go through this policy.
 * ❌ No direct checks like: if (user.id === listing.userId)
 * ✅ Use: ListingPolicy.canEdit(user, listing)
 */

import type { Listing } from './listing.model'
import type { User } from './user.model'
import { isOwner as isOwnerRole } from '../auth/role.guard'

/**
 * Listing status type
 */
export type ListingStatus = 'draft' | 'published' | 'archived'

/**
 * Permission result
 */
export interface PermissionResult {
  allowed: boolean
  reason?: string
}

/**
 * Check if user owns this listing
 */
export function isListingOwner(user: User | null, listing: Listing): boolean {
  if (!user) return false
  return listing.userId === user.id || listing.userId === user.supabaseId
}

/**
 * Check if user can view listing
 */
export function canView(user: User | null, listing: Listing): PermissionResult {
  // Published listings are public
  if (listing.status === 'published') {
    return { allowed: true }
  }
  
  // Owner can view their own drafts/archived
  if (isListingOwner(user, listing)) {
    return { allowed: true }
  }
  
  return { 
    allowed: false, 
    reason: 'Это объявление недоступно' 
  }
}

/**
 * Check if user can edit listing
 */
export function canEdit(user: User | null, listing: Listing): PermissionResult {
  if (!user) {
    return { allowed: false, reason: 'Войдите в аккаунт' }
  }
  
  // Only owner can edit
  if (!isListingOwner(user, listing)) {
    return { allowed: false, reason: 'Вы не можете редактировать чужое объявление' }
  }
  
  // Can't edit archived without restoring first
  if (listing.status === 'archived') {
    return { allowed: false, reason: 'Сначала восстановите объявление из архива' }
  }
  
  return { allowed: true }
}

/**
 * Check if user can delete listing
 */
export function canDelete(user: User | null, listing: Listing): PermissionResult {
  if (!user) {
    return { allowed: false, reason: 'Войдите в аккаунт' }
  }
  
  // Only owner can delete
  if (!isListingOwner(user, listing)) {
    return { allowed: false, reason: 'Вы не можете удалить чужое объявление' }
  }
  
  return { allowed: true }
}

/**
 * Check if user can publish listing
 */
export function canPublish(user: User | null, listing: Listing): PermissionResult {
  if (!user) {
    return { allowed: false, reason: 'Войдите в аккаунт' }
  }
  
  // Must be owner
  if (!isListingOwner(user, listing)) {
    return { allowed: false, reason: 'Вы не можете публиковать чужое объявление' }
  }
  
  // Must be draft
  if (listing.status !== 'draft') {
    return { 
      allowed: false, 
      reason: listing.status === 'published' 
        ? 'Объявление уже опубликовано' 
        : 'Сначала восстановите из архива' 
    }
  }
  
  // Validate required fields
  if (!listing.title || listing.title.length < 3) {
    return { allowed: false, reason: 'Добавьте название объявления' }
  }
  
  if (!listing.price || listing.price <= 0) {
    return { allowed: false, reason: 'Укажите цену' }
  }
  
  if (!listing.media || listing.media.length === 0) {
    return { allowed: false, reason: 'Добавьте хотя бы одно фото' }
  }
  
  return { allowed: true }
}

/**
 * Check if user can archive listing
 */
export function canArchive(user: User | null, listing: Listing): PermissionResult {
  if (!user) {
    return { allowed: false, reason: 'Войдите в аккаунт' }
  }
  
  if (!isListingOwner(user, listing)) {
    return { allowed: false, reason: 'Вы не можете архивировать чужое объявление' }
  }
  
  if (listing.status !== 'published') {
    return { allowed: false, reason: 'Можно архивировать только опубликованные' }
  }
  
  return { allowed: true }
}

/**
 * Check if user can restore listing from archive
 */
export function canRestore(user: User | null, listing: Listing): PermissionResult {
  if (!user) {
    return { allowed: false, reason: 'Войдите в аккаунт' }
  }
  
  if (!isListingOwner(user, listing)) {
    return { allowed: false, reason: 'Вы не можете восстановить чужое объявление' }
  }
  
  if (listing.status !== 'archived') {
    return { allowed: false, reason: 'Объявление не в архиве' }
  }
  
  return { allowed: true }
}

/**
 * Check if user can create listings
 */
export function canCreate(user: User | null): PermissionResult {
  if (!user) {
    return { allowed: false, reason: 'Войдите в аккаунт' }
  }
  
  // Must be owner role
  if (!isOwnerRole(user)) {
    return { allowed: false, reason: 'Только арендодатели могут создавать объявления' }
  }
  
  return { allowed: true }
}

/**
 * Check if user can contact listing owner
 */
export function canContact(user: User | null, listing: Listing): PermissionResult {
  // Can't contact your own listing
  if (user && isListingOwner(user, listing)) {
    return { allowed: false, reason: 'Это ваше объявление' }
  }
  
  // Must be published
  if (listing.status !== 'published') {
    return { allowed: false, reason: 'Объявление недоступно' }
  }
  
  return { allowed: true }
}

/**
 * Listing Policy namespace
 */
export const ListingPolicy = {
  isOwner: isListingOwner,
  canView,
  canEdit,
  canDelete,
  canPublish,
  canArchive,
  canRestore,
  canCreate,
  canContact,
}

export default ListingPolicy
