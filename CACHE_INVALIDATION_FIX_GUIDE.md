# 🔧 Cache Invalidation Fix Guide

## Quick Reference: Where to Add Cache Invalidation

This guide shows EXACTLY where to add cache invalidation in each admin manager.

---

## ✅ ALREADY FIXED

### 1. NewsManager.tsx ✅
### 2. HighlightsManager.tsx ✅ (Fixed in this audit)

---

## ❌ NEEDS FIXING (Copy-Paste Ready)

### 3. BlogManager.tsx

**Step 1**: Add import at the top of the file (around line 14):

```typescript
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { invalidateBlogCache } from '@/utils/cacheInvalidation'; // ADD THIS LINE
```

**Step 2**: Find the `handleDelete` function and add invalidation after the delete operation:

```typescript
const handleDelete = async (id: string) => {
  const confirmed = await confirmDelete({ /* ... */ });
  if (!confirmed) return;

  try {
    if (!id.startsWith('temp-')) {
      await deleteBlogPost(id);
    }
    
    // ADD THIS LINE
    invalidateBlogCache();
    
    await pagination.refresh();
    toast.success('Blog post deleted successfully!');
  } catch (error) {
    console.error('Error deleting blog post:', error);
    toast.error('Failed to delete blog post.');
  }
};
```

**Step 3**: Find the `handleSave` function and add invalidation after save:

```typescript
const handleSave = async () => {
  // ... validation code ...
  
  try {
    const blogData = { /* ... */ };

    if (editingBlogPost.id && !editingBlogPost.id.startsWith('temp-')) {
      await updateBlogPost(editingBlogPost.id, blogData);
      toast.success('Blog post updated!');
    } else {
      await createBlogPost(blogData);
      toast.success('Blog post created!');
    }

    // ADD THIS LINE
    invalidateBlogCache();

    await pagination.refresh();
    setIsModalOpen(false);
    setEditingBlogPost(null);
  } catch (error) {
    // error handling
  }
};
```

---

### 4. PublicationsManager.tsx

**Step 1**: Add import at the top:

```typescript
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { invalidatePublicationsCache } from '@/utils/cacheInvalidation'; // ADD THIS LINE
```

**Step 2**: In `handleDelete`:

```typescript
const handleDelete = async (id: string) => {
  const confirmed = await confirmDelete({ /* ... */ });
  if (!confirmed) return;

  try {
    if (!id.startsWith('temp-')) {
      await deletePublicationFromDb(id);
    }
    
    // ADD THIS LINE
    invalidatePublicationsCache();
    
    await pagination.refresh();
    toast.success('Publication deleted successfully!');
  } catch (error) {
    console.error('Error deleting publication:', error);
    toast.error('Failed to delete publication.');
  }
};
```

**Step 3**: In `handleSave`:

```typescript
const handleSave = async () => {
  // ... validation code ...
  
  try {
    const publicationData = { /* ... */ };

    if (editingPublication.id && !editingPublication.id.startsWith('temp-')) {
      await updatePublicationInDb(editingPublication.id, publicationData);
      toast.success('Publication updated!');
    } else {
      await createPublication(publicationData);
      toast.success('Publication created!');
    }

    // ADD THIS LINE
    invalidatePublicationsCache();

    await pagination.refresh();
    setIsModalOpen(false);
    setEditingPublication(null);
  } catch (error) {
    // error handling
  }
};
```

---

### 5. PartnersManager.tsx

**Step 1**: Add import:

```typescript
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { invalidatePartnersCache } from '@/utils/cacheInvalidation'; // ADD THIS LINE
```

**Step 2**: In `handleDelete`:

```typescript
const handleDelete = async (id: string) => {
  const confirmed = await confirmDelete({ /* ... */ });
  if (!confirmed) return;

  try {
    if (!id.startsWith('temp-')) {
      await deletePartnerFromDb(id);
    }
    
    // ADD THIS LINE
    invalidatePartnersCache();
    
    await pagination.refresh();
    toast.success('Partner deleted successfully!');
  } catch (error) {
    console.error('Error deleting partner:', error);
    toast.error('Failed to delete partner.');
  }
};
```

**Step 3**: In `handleSave`:

```typescript
const handleSave = async () => {
  // ... validation code ...
  
  try {
    const partnerData = { /* ... */ };

    if (editingPartner.id && !editingPartner.id.startsWith('temp-')) {
      await updatePartnerInDb(editingPartner.id, partnerData);
      toast.success('Partner updated!');
    } else {
      await createPartner(partnerData);
      toast.success('Partner created!');
    }

    // ADD THIS LINE
    invalidatePartnersCache();

    await pagination.refresh();
    setIsModalOpen(false);
    setEditingPartner(null);
  } catch (error) {
    // error handling
  }
};
```

---

### 6. TeamManager.tsx

**Step 1**: Add import:

```typescript
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { invalidateTeamCache } from '@/utils/cacheInvalidation'; // ADD THIS LINE
```

**Step 2**: In `handleDelete`:

```typescript
const handleDelete = async (id: string) => {
  const confirmed = await confirmDelete({ /* ... */ });
  if (!confirmed) return;

  try {
    if (!id.startsWith('temp-')) {
      await deleteTeamFromDb(id);
    }
    
    // ADD THIS LINE
    invalidateTeamCache();
    
    await pagination.refresh();
    toast.success('Team member deleted successfully!');
  } catch (error) {
    console.error('Error deleting team member:', error);
    toast.error('Failed to delete team member.');
  }
};
```

**Step 3**: In `handleSave`:

```typescript
const handleSave = async () => {
  // ... validation code ...
  
  try {
    const teamData = { /* ... */ };

    if (editingTeamMember.id && !editingTeamMember.id.startsWith('temp-')) {
      await updateTeamInDb(editingTeamMember.id, teamData);
      toast.success('Team member updated!');
    } else {
      await createTeamMember(teamData);
      toast.success('Team member created!');
    }

    // ADD THIS LINE
    invalidateTeamCache();

    await pagination.refresh();
    setIsModalOpen(false);
    setEditingTeamMember(null);
  } catch (error) {
    // error handling
  }
};
```

---

### 7. ProjectManager.tsx

**Step 1**: Add import:

```typescript
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { invalidateProjectsCache } from '@/utils/cacheInvalidation'; // ADD THIS LINE
```

**Step 2**: In `handleDelete`:

```typescript
const handleDelete = async (id: string) => {
  const confirmed = await confirmDelete({ /* ... */ });
  if (!confirmed) return;

  try {
    if (!id.startsWith('temp-')) {
      await deleteProjectFromDb(id);
    }
    
    // ADD THIS LINE
    invalidateProjectsCache();
    
    await pagination.refresh();
    toast.success('Project deleted successfully!');
  } catch (error) {
    console.error('Error deleting project:', error);
    toast.error('Failed to delete project.');
  }
};
```

**Step 3**: In `handleSave`:

```typescript
const handleSave = async () => {
  // ... validation code ...
  
  try {
    const projectData = { /* ... */ };

    if (editingProject.id && !editingProject.id.startsWith('temp-')) {
      await updateProjectFromDb(editingProject.id, projectData);
      toast.success('Project updated!');
    } else {
      await createProject(projectData);
      toast.success('Project created!');
    }

    // ADD THIS LINE
    invalidateProjectsCache();

    await pagination.refresh();
    setIsModalOpen(false);
    setEditingProject(null);
  } catch (error) {
    // error handling
  }
};
```

---

### 8. FinancialStatementManager.tsx

**Step 1**: Add import:

```typescript
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { invalidateFinancialCache } from '@/utils/cacheInvalidation'; // ADD THIS LINE
```

**Step 2**: In `handleDelete`:

```typescript
const handleDelete = async (id: string) => {
  const confirmed = await confirmDelete({ /* ... */ });
  if (!confirmed) return;

  try {
    if (!id.startsWith('temp-')) {
      await deleteStatementFromDb(id);
    }
    
    // ADD THIS LINE
    invalidateFinancialCache();
    
    await pagination.refresh();
    toast.success('Financial statement deleted successfully!');
  } catch (error) {
    console.error('Error deleting financial statement:', error);
    toast.error('Failed to delete financial statement.');
  }
};
```

**Step 3**: In `handleSave`:

```typescript
const handleSave = async () => {
  // ... validation code ...
  
  try {
    const statementData = { /* ... */ };

    if (editingStatement.id && !editingStatement.id.startsWith('temp-')) {
      await updateStatementInDb(editingStatement.id, statementData);
      toast.success('Financial statement updated!');
    } else {
      await createStatement(statementData);
      toast.success('Financial statement created!');
    }

    // ADD THIS LINE
    invalidateFinancialCache();

    await pagination.refresh();
    setIsModalOpen(false);
    setEditingStatement(null);
  } catch (error) {
    // error handling
  }
};
```

---

### 9. InternshipTestimonialManager.tsx

**Step 1**: Add import:

```typescript
import { toast } from 'sonner';
import { useDeleteConfirmation } from '@/features/admin/hooks/useDeleteConfirmation';
import { invalidateTestimonialsCache } from '@/utils/cacheInvalidation'; // ADD THIS LINE
```

**Step 2**: In `handleDelete`:

```typescript
const handleDelete = async (id: string) => {
  const confirmed = await confirmDelete({ /* ... */ });
  if (!confirmed) return;

  try {
    if (!id.startsWith('temp-')) {
      await deleteTestimonialFromDb(id);
    }
    
    // ADD THIS LINE
    invalidateTestimonialsCache();
    
    await pagination.refresh();
    toast.success('Testimonial deleted successfully!');
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    toast.error('Failed to delete testimonial.');
  }
};
```

**Step 3**: In `handleSave`:

```typescript
const handleSave = async () => {
  // ... validation code ...
  
  try {
    const testimonialData = { /* ... */ };

    if (editingTestimonial.id && !editingTestimonial.id.startsWith('temp-')) {
      await updateTestimonialInDb(editingTestimonial.id, testimonialData);
      toast.success('Testimonial updated!');
    } else {
      await createTestimonial(testimonialData);
      toast.success('Testimonial created!');
    }

    // ADD THIS LINE
    invalidateTestimonialsCache();

    await pagination.refresh();
    setIsModalOpen(false);
    setEditingTestimonial(null);
  } catch (error) {
    // error handling
  }
};
```

---

## ✅ Testing Cache Invalidation

After adding cache invalidation to all managers:

1. **Open the app** in two browser windows (Admin + Public)
2. **Login to admin** in one window
3. **Open public page** in the other window (e.g., Blog page)
4. **Create/Update/Delete** an item in the admin panel
5. **Refresh the public page** immediately
6. **Verify**: Changes should appear within 1-2 seconds

If changes don't appear:
- Check browser console for `[CacheInvalidation]` logs
- Verify the import statement is correct
- Ensure invalidation is called AFTER the database operation
- Clear browser cache and try again

---

## 📝 Summary

**Total Changes Needed**: 7 files × 3 code additions = 21 lines of code

**Estimated Time**: 15-20 minutes (copy-paste)

**Impact**: Users will see updates immediately instead of waiting 10-30 minutes! 🎉

---

## Common Mistakes to Avoid

❌ **DON'T** add cache invalidation BEFORE the database operation:
```typescript
invalidateBlogCache(); // ❌ TOO EARLY
await createBlogPost(data);
```

✅ **DO** add it AFTER the operation succeeds:
```typescript
await createBlogPost(data);
invalidateBlogCache(); // ✅ CORRECT
```

❌ **DON'T** forget to import the function:
```typescript
// Will cause "invalidateBlogCache is not defined" error
```

✅ **DO** import at the top:
```typescript
import { invalidateBlogCache } from '@/utils/cacheInvalidation';
```

---

**That's it!** Once you add these 21 lines across 7 files, your caching system will be fully functional. 🚀
