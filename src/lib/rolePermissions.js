import connectToDatabase from './mongodb.js';
import RolePermission from '../models/RolePermission.js';
import AdminUser from '../models/AdminUser.js';

export const PERMISSION_MODULES = [
  {
    key: 'managePosts',
    label: 'Articles & Content',
    desc: 'Create, edit, draft & publish articles and categories',
  },
  {
    key: 'managePlayers',
    label: 'Squad & Players',
    desc: 'Add team roster, player profiles, stats & legends',
  },
  {
    key: 'manageMatches',
    label: 'Match Center',
    desc: 'Schedule fixtures, update live scores & standings',
  },
  {
    key: 'manageMedia',
    label: 'Media Library',
    desc: 'Upload, delete & organize media files and photos',
  },
  {
    key: 'manageRedirects',
    label: '301/302 Redirects',
    desc: 'Create & manage SEO redirect rules & aliases',
  },
  {
    key: 'manageUsers',
    label: 'User Control',
    desc: 'Manage user accounts, assign roles & reset passwords',
  },
];

export const DEFAULT_ROLE_DEFINITIONS = {
  superadmin: {
    role: 'superadmin',
    label: 'Super Admin',
    badgeColor: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
    description: 'Full unrestricted root access to all modules, backups, settings & user management.',
    isSystem: true,
    permissions: {
      managePosts: true,
      managePlayers: true,
      manageMatches: true,
      manageMedia: true,
      manageRedirects: true,
      manageUsers: true,
    },
  },
  admin: {
    role: 'admin',
    label: 'Admin',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    description: 'Manage all website content, squad, match center, media, and redirects.',
    isSystem: false,
    permissions: {
      managePosts: true,
      managePlayers: true,
      manageMatches: true,
      manageMedia: true,
      manageRedirects: true,
      manageUsers: false,
    },
  },
  editor: {
    role: 'editor',
    label: 'Editor',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    description: 'Create, publish & update articles, players, match center fixtures, and media.',
    isSystem: false,
    permissions: {
      managePosts: true,
      managePlayers: true,
      manageMatches: true,
      manageMedia: true,
      manageRedirects: false,
      manageUsers: false,
    },
  },
  author: {
    role: 'author',
    label: 'Author',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    description: 'Write, draft & manage blog articles and upload media. Listed in author dropdown.',
    isSystem: false,
    permissions: {
      managePosts: true,
      managePlayers: false,
      manageMatches: false,
      manageMedia: true,
      manageRedirects: false,
      manageUsers: false,
    },
  },
  viewer: {
    role: 'viewer',
    label: 'Viewer',
    badgeColor: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    description: 'Read-only analytics and overview monitoring. No edit or publish permissions.',
    isSystem: false,
    permissions: {
      managePosts: false,
      managePlayers: false,
      manageMatches: false,
      manageMedia: false,
      manageRedirects: false,
      manageUsers: false,
    },
  },
};

/**
 * Seed default role permissions into MongoDB if missing
 */
export async function seedDefaultRolePermissions() {
  await connectToDatabase();
  const existingCount = await RolePermission.countDocuments();
  if (existingCount < Object.keys(DEFAULT_ROLE_DEFINITIONS).length) {
    for (const [key, def] of Object.entries(DEFAULT_ROLE_DEFINITIONS)) {
      const exists = await RolePermission.findOne({ role: key });
      if (!exists) {
        await RolePermission.create({
          role: def.role,
          label: def.label,
          badgeColor: def.badgeColor,
          description: def.description,
          permissions: def.permissions,
          isSystem: Boolean(def.isSystem),
          updatedBy: 'system',
        });
      }
    }
  }
}

/**
 * Get all roles with their configured permissions
 */
export async function getAllRolePermissions() {
  try {
    await connectToDatabase();
    await seedDefaultRolePermissions();

    const rolesFromDb = await RolePermission.find({}).lean();
    if (!rolesFromDb || rolesFromDb.length === 0) {
      return Object.values(DEFAULT_ROLE_DEFINITIONS);
    }

    // Preserve standard role ordering: superadmin, admin, editor, author, viewer
    const order = ['superadmin', 'admin', 'editor', 'author', 'viewer'];
    const roleMap = new Map(rolesFromDb.map((r) => [r.role, r]));

    return order.map((key) => {
      const dbRole = roleMap.get(key);
      const defaultDef = DEFAULT_ROLE_DEFINITIONS[key] || {};
      if (!dbRole) return defaultDef;
      return {
        ...defaultDef,
        ...dbRole,
        permissions: {
          ...defaultDef.permissions,
          ...(dbRole.permissions || {}),
        },
      };
    });
  } catch (err) {
    console.error('getAllRolePermissions error, falling back to defaults:', err.message);
    return Object.values(DEFAULT_ROLE_DEFINITIONS);
  }
}

/**
 * Get live permissions object for a specific role
 */
export async function getPermissionsForRole(role) {
  if (role === 'superadmin') {
    return { ...DEFAULT_ROLE_DEFINITIONS.superadmin.permissions };
  }

  const defaultDef = DEFAULT_ROLE_DEFINITIONS[role] || DEFAULT_ROLE_DEFINITIONS.viewer;

  try {
    await connectToDatabase();
    const dbRole = await RolePermission.findOne({ role }).lean();
    if (dbRole && dbRole.permissions) {
      return {
        ...defaultDef.permissions,
        ...dbRole.permissions,
      };
    }
  } catch (err) {
    console.warn(`getPermissionsForRole(${role}) fallback to preset:`, err.message);
  }

  return { ...defaultDef.permissions };
}

/**
 * Update permissions for a specific role and sync all users with that role
 */
export async function updateRolePermissions(roleKey, newPermissions, updatedBy = 'system') {
  if (!DEFAULT_ROLE_DEFINITIONS[roleKey]) {
    throw new Error(`Invalid role key: "${roleKey}"`);
  }

  // Super Admin permissions can never be restricted (root lockout protection)
  if (roleKey === 'superadmin') {
    throw new Error('Super Admin root permissions cannot be revoked.');
  }

  await connectToDatabase();
  await seedDefaultRolePermissions();

  const cleanPermissions = {
    managePosts: Boolean(newPermissions.managePosts),
    managePlayers: Boolean(newPermissions.managePlayers),
    manageMatches: Boolean(newPermissions.manageMatches),
    manageMedia: Boolean(newPermissions.manageMedia),
    manageRedirects: Boolean(newPermissions.manageRedirects),
    manageUsers: Boolean(newPermissions.manageUsers),
  };

  const updated = await RolePermission.findOneAndUpdate(
    { role: roleKey },
    {
      $set: {
        permissions: cleanPermissions,
        updatedBy: String(updatedBy),
      },
    },
    { returnDocument: 'after', upsert: true }
  ).lean();

  // Sync all users having this role in MongoDB so their permissions immediately reflect this role change
  try {
    await AdminUser.updateMany(
      { role: roleKey },
      { $set: { permissions: cleanPermissions } }
    );
  } catch (userSyncErr) {
    console.warn('Failed to sync AdminUser permissions on role update:', userSyncErr.message);
  }

  return updated;
}
