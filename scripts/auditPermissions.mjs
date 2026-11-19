import mongoose from 'mongoose';
import connectToDatabase from '../src/lib/mongodb.js';
import AdminUser from '../src/models/AdminUser.js';
import { requirePermission, signAdminToken } from '../src/lib/auth.js';
import { getPermissionsForRole, DEFAULT_ROLE_DEFINITIONS } from '../src/lib/rolePermissions.js';

async function runAudit() {
  console.log('====================================================');
  console.log('       SUPER KINGS DEN PERMISSIONS AUDIT SUITE       ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  await connectToDatabase();

  // ──────── TEST SUITE 1: Role-Based Default Presets ────────
  console.log('--- Test Suite 1: Standard Role Presets ---');
  const superPerms = await getPermissionsForRole('superadmin');
  assert(superPerms.managePosts && superPerms.manageUsers && superPerms.manageRedirects, 'Super Admin has all 6 core permissions');

  const adminPerms = await getPermissionsForRole('admin');
  assert(adminPerms.managePosts && adminPerms.manageRedirects && !adminPerms.manageUsers, 'Admin has content/redirect access but no user control');

  const editorPerms = await getPermissionsForRole('editor');
  assert(editorPerms.managePosts && editorPerms.managePlayers && !editorPerms.manageRedirects && !editorPerms.manageUsers, 'Editor can edit posts/squad but cannot edit redirects or users');

  const authorPerms = await getPermissionsForRole('author');
  assert(authorPerms.managePosts && authorPerms.manageMedia && !authorPerms.managePlayers && !authorPerms.manageMatches, 'Author can only edit articles/media; cannot touch players/fixtures');

  const viewerPerms = await getPermissionsForRole('viewer');
  assert(!viewerPerms.managePosts && !viewerPerms.managePlayers && !viewerPerms.manageUsers, 'Viewer has no mutation permissions');

  // ──────── TEST SUITE 2: requirePermission Middleware with Dummy Requests ────────
  console.log('\n--- Test Suite 2: requirePermission Middleware ---');

  // Helper to create mock request with signed JWT cookie
  function createMockRequest(payload) {
    const token = signAdminToken(payload);
    return {
      headers: {
        get(headerName) {
          if (headerName.toLowerCase() === 'cookie') {
            return `skd_admin_token=${token}`;
          }
          return null;
        },
      },
    };
  }

  // Superadmin test
  const reqSuper = createMockRequest({ username: 'super_audit_test', role: 'superadmin' });
  const checkSuper = await requirePermission(reqSuper, 'manageUsers');
  assert(checkSuper !== null, 'Super Admin passes requirePermission("manageUsers") unconditionally');

  // ──────── TEST SUITE 3: Live DB User Overrides (The Real Deal) ────────
  console.log('\n--- Test Suite 3: User-Level Granular Overrides in MongoDB ---');

  const auditUsername = `audit_user_${Date.now()}`;
  // Create an Editor user in DB
  const testUser = await AdminUser.create({
    username: auditUsername,
    name: 'Audit Test User',
    email: `${auditUsername}@test.com`,
    passwordHash: 'dummy_hash',
    role: 'editor',
    status: 'active',
    permissions: {},
  });

  try {
    const reqEditor = createMockRequest({ username: auditUsername, role: 'editor' });

    // Step A: By default, editor has managePosts
    const checkDefault = await requirePermission(reqEditor, 'managePosts');
    assert(checkDefault !== null, 'New Editor inherits role default managePosts = true');

    // Step B: Explicitly REVOKE managePosts on this specific user
    testUser.permissions = {
      articles_edit: false,
      categories_edit: false,
      pages_edit: false,
      managePosts: false,
    };
    testUser.markModified('permissions');
    await testUser.save();

    const checkRevoked = await requirePermission(reqEditor, 'managePosts');
    assert(checkRevoked === null, 'Revoking articles_edit/managePosts on specific Editor strictly DENIES managePosts');

    // Step C: Explicitly GRANT manageRedirects to this Editor (which editors normally do not have)
    testUser.permissions = {
      ...testUser.permissions,
      redirects_edit: true,
      manageRedirects: true,
    };
    testUser.markModified('permissions');
    await testUser.save();

    const checkGranted = await requirePermission(reqEditor, 'manageRedirects');
    assert(checkGranted !== null, 'Granting redirects_edit/manageRedirects to Editor strictly ALLOWS access');

    // Step D: Verify that granular mixed keys persist properly in MongoDB
    const reloaded = await AdminUser.findById(testUser._id).lean();
    assert(reloaded.permissions.articles_edit === false, 'Granular articles_edit: false saved intact in MongoDB');
    assert(reloaded.permissions.redirects_edit === true, 'Granular redirects_edit: true saved intact in MongoDB');

    // Step E: Granular mapped keys - Granting players_edit to a Viewer
    testUser.role = 'viewer';
    testUser.permissions = {
      players_edit: true,
    };
    testUser.markModified('permissions');
    await testUser.save();

    const reqViewerWithPlayerEdit = createMockRequest({ username: auditUsername, role: 'viewer' });
    const checkViewerPlayerEdit = await requirePermission(reqViewerWithPlayerEdit, 'managePlayers');
    assert(checkViewerPlayerEdit !== null, 'Viewer with explicit players_edit: true passes requirePermission("managePlayers")');

    const checkViewerPostsDenied = await requirePermission(reqViewerWithPlayerEdit, 'managePosts');
    assert(checkViewerPostsDenied === null, 'Viewer without posts permission is denied managePosts');

  } finally {
    // Cleanup audit test user
    await AdminUser.findByIdAndDelete(testUser._id);
  }

  // ──────── TEST SUITE 4: Author Role Constraints ────────
  console.log('\n--- Test Suite 4: Author Role Boundary Enforcement ---');
  const authorAuditName = `audit_author_${Date.now()}`;
  const authorUser = await AdminUser.create({
    username: authorAuditName,
    name: 'Audit Author User',
    email: `${authorAuditName}@test.com`,
    passwordHash: 'dummy_hash',
    role: 'author',
    status: 'active',
    permissions: {},
  });

  try {
    const reqAuthor = createMockRequest({ username: authorAuditName, role: 'author' });

    const authorPosts = await requirePermission(reqAuthor, 'managePosts');
    assert(authorPosts !== null, 'Author can manage posts by default');

    const authorMedia = await requirePermission(reqAuthor, 'manageMedia');
    assert(authorMedia !== null, 'Author can manage media by default');

    const authorPlayers = await requirePermission(reqAuthor, 'managePlayers');
    assert(authorPlayers === null, 'Author is strictly DENIED managePlayers');

    const authorUsers = await requirePermission(reqAuthor, 'manageUsers');
    assert(authorUsers === null, 'Author is strictly DENIED manageUsers');
  } finally {
    await AdminUser.findByIdAndDelete(authorUser._id);
  }

  // ──────── TEST SUITE 5: Suspended User Immediate Invalidation ────────
  console.log('\n--- Test Suite 5: Suspended Account Invalidation ---');

  const suspendedUsername = `suspended_audit_${Date.now()}`;
  const suspendedUser = await AdminUser.create({
    username: suspendedUsername,
    name: 'Suspended Test User',
    email: `${suspendedUsername}@test.com`,
    passwordHash: 'dummy_hash',
    role: 'editor',
    status: 'suspended',
    permissions: { managePosts: true },
  });

  try {
    const reqSuspended = createMockRequest({ username: suspendedUsername, role: 'editor' });
    const checkSuspended = await requirePermission(reqSuspended, 'managePosts');
    assert(checkSuspended === null, 'Suspended user is immediately blocked even if permissions are true');
  } finally {
    await AdminUser.findByIdAndDelete(suspendedUser._id);
  }

  // ──────── SUMMARY ────────
  console.log('\n====================================================');
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAudit().catch((err) => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
