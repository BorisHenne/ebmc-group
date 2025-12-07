import type { Access, FieldAccess } from 'payload'

// Check if user is admin or super_admin
export const isAdmin: Access = ({ req: { user } }) => {
  if (!user) return false
  return ['admin', 'super_admin'].includes(user.role)
}

// Check if user is admin or accessing their own data
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (['admin', 'super_admin'].includes(user.role)) return true
  return {
    id: { equals: user.id },
  }
}

// Check if user is at least editor
export const isEditorOrAbove: Access = ({ req: { user } }) => {
  if (!user) return false
  return ['editor', 'manager', 'admin', 'super_admin'].includes(user.role)
}

// Check if user is at least manager
export const isManagerOrAbove: Access = ({ req: { user } }) => {
  if (!user) return false
  return ['manager', 'admin', 'super_admin'].includes(user.role)
}

// Check if user is logged in
export const isLoggedIn: Access = ({ req: { user } }) => {
  return Boolean(user)
}

// Public access
export const isPublic: Access = () => true

// Published only for public
export const isPublishedOrAdmin: Access = ({ req: { user } }) => {
  if (user && ['editor', 'manager', 'admin', 'super_admin'].includes(user.role)) {
    return true
  }
  return {
    _status: { equals: 'published' },
  }
}

// Field access: admin only
export const adminFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (!user) return false
  return ['admin', 'super_admin'].includes(user.role)
}

// Field access: manager or above
export const managerFieldAccess: FieldAccess = ({ req: { user } }) => {
  if (!user) return false
  return ['manager', 'admin', 'super_admin'].includes(user.role)
}
