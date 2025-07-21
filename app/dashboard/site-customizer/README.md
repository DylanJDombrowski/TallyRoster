# Site Customizer

The Site Customizer provides administrators with comprehensive tools to customize their organization's public website. This includes branding, colors, content management, custom links, and real-time preview capabilities.

## Overview

The site customizer enables organizations to create a unique web presence that reflects their brand and provides essential information to players, families, and fans. It features a live preview system and supports extensive customization options.

**Location**: `/app/dashboard/site-customizer/`

**Access Level**: Admin only

## Core Features

### 🎨 Brand Customization
- **Logo Management**: Upload and manage organization logos
- **Color Schemes**: Primary and secondary color customization
- **Typography**: Font selection and styling options
- **Visual Identity**: Consistent branding across all pages

### 🔗 Navigation & Links
- **Custom Links**: Add links to external resources
- **Menu Management**: Organize navigation structure
- **Social Media**: Integrate social media links
- **Quick Actions**: Customizable call-to-action buttons

### 📄 Content Management
- **About Section**: Organization description and history
- **Contact Information**: Address, phone, email details
- **Announcements**: Featured content and updates
- **Image Galleries**: Team photos and event images

### 👁️ Live Preview
- **Real-Time Updates**: See changes immediately
- **Mobile Preview**: Test mobile responsiveness
- **Desktop Preview**: Full desktop view testing
- **Cross-Device Testing**: Ensure consistent experience

### 🌐 Domain Management
- **Subdomain Configuration**: Custom subdomain setup
- **Custom Domain**: Full domain integration support
- **SSL Management**: Secure site configuration
- **Performance Optimization**: Site speed and SEO

## Technical Architecture

### Main Components

#### `CustomizerForm` (`components/customizer-form.tsx`)
The central customization interface:
- Tabbed interface for different customization areas
- Real-time form updates with preview integration
- Image upload and management
- Color picker integration

#### `MiniPreview` (`components/mini-preview.tsx`)
Live preview component:
- Real-time site preview updates
- Mobile and desktop view toggles
- Interactive preview with navigation
- Changes reflected immediately

#### `LinksManager` (`components/links-manager.tsx`)
Custom links and navigation management:
- Add/edit/delete custom links
- Drag-and-drop link ordering
- Link categorization and organization
- External link validation

#### `DraggableLinks` (`components/draggable-links.tsx`)
Drag-and-drop interface for link management:
- Visual link reordering
- Nested link structures
- Link grouping capabilities
- Touch-friendly mobile interface

#### `LinkForm` (`components/link-form.tsx`)
Individual link creation and editing:
- Link URL and title management
- Icon selection and customization
- Link description and metadata
- Validation and error handling

### Server Actions (`actions.ts`)

#### `updateOrganization(formData: FormData)`
Updates organization branding and settings:
- Validates admin permissions
- Updates organization colors and branding
- Handles logo upload and processing
- Triggers site regeneration

#### `updateCustomLinks(formData: FormData)`
Manages custom navigation links:
- Validates link URLs and structure
- Updates navigation order and hierarchy
- Handles link creation and deletion
- Maintains link integrity

### Data Model

Site customization data is stored in several related tables:

#### `organizations` (extended fields)
```typescript
interface Organization {
  id: string;
  name: string;
  subdomain: string;
  sport?: string;
  organization_type?: string;
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
  banner_image_url?: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  website_url?: string;
  social_links?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  custom_css?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
}
```

#### `custom_links`
```typescript
interface CustomLink {
  id: string;
  organization_id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  order_index: number;
  is_active: boolean;
  parent_id?: string; // For nested links
  target: '_self' | '_blank';
  created_at: string;
  updated_at: string;
}
```

## Security & Access Control

### Administrator Only Access
Strict role verification for all customization operations:
```typescript
if (orgRole.role !== "admin") {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Access Denied</h1>
      <p>You must be an administrator to customize site settings.</p>
    </div>
  );
}
```

### Organization Scoping
All customization changes are scoped to the user's organization:
```typescript
const organizationData = Array.isArray(orgRole.organizations)
  ? orgRole.organizations[0]
  : orgRole.organizations;
```

### Content Validation
- **URL Validation**: Ensure external links are safe and valid
- **Image Processing**: Validate and optimize uploaded images
- **CSS Sanitization**: Prevent malicious custom CSS
- **Input Sanitization**: Protect against XSS attacks

## Usage Patterns

### Updating Organization Branding
1. Navigate to `/dashboard/site-customizer`
2. Upload new logo or banner image
3. Select primary and secondary colors
4. Update organization description
5. Preview changes in real-time
6. Save and publish updates

### Managing Custom Links
1. Access the "Links" section
2. Add new links with titles and URLs
3. Organize links using drag-and-drop
4. Configure link behavior (open in new tab, etc.)
5. Activate/deactivate links as needed
6. Preview navigation changes

### Content Customization
1. Update organization description and about section
2. Manage contact information and address
3. Configure social media links
4. Add custom announcements or features
5. Optimize for search engines (meta tags)

## Integration Points

### Public Site Rendering
- **Theme Application**: Branding applied to public pages
- **Navigation Generation**: Custom links in site navigation
- **Content Display**: Organization information on public site
- **SEO Optimization**: Meta tags and search optimization

### Image Management
- **Cloudinary Integration**: Image upload and optimization
- **CDN Delivery**: Fast image loading across all pages
- **Responsive Images**: Automatic sizing for different devices
- **Image Processing**: Automatic format optimization

### Analytics Integration
- **Site Performance**: Track customization impact on performance
- **User Engagement**: Monitor how customizations affect user behavior
- **A/B Testing**: Test different branding approaches
- **Conversion Tracking**: Measure effectiveness of custom links

## Performance Considerations

### Optimization Strategies
- **Image Optimization**: Automatic compression and format selection
- **CSS Minification**: Optimized custom CSS delivery
- **Caching**: Aggressive caching of customization assets
- **CDN Integration**: Global content delivery network

### Real-Time Preview
- **Debounced Updates**: Efficient preview generation
- **Incremental Rendering**: Only update changed elements
- **Background Processing**: Non-blocking preview updates
- **Memory Management**: Efficient preview cleanup

## Development Guidelines

### Adding New Customization Options
1. Update organization data model
2. Add form fields to customizer interface
3. Implement preview integration
4. Update public site rendering
5. Add validation and error handling

### Testing Customization Features
- **Cross-Browser Testing**: Ensure compatibility across browsers
- **Mobile Responsiveness**: Test on various mobile devices
- **Performance Testing**: Monitor impact on site speed
- **Accessibility Testing**: Ensure customizations remain accessible

## Future Enhancements

### Planned Features
- **Advanced Theme System**: Multiple theme templates
- **Widget Management**: Customizable page widgets
- **Advanced Analytics**: Built-in site analytics dashboard
- **A/B Testing Tools**: Test different customization approaches
- **Multi-Language Support**: Internationalization options

### Technical Improvements
- **Visual Page Builder**: Drag-and-drop page construction
- **Custom CSS Editor**: Advanced CSS customization with syntax highlighting
- **Template Marketplace**: Pre-built customization templates
- **API Integration**: External service integrations
- **Version Control**: Track and revert customization changes

## Troubleshooting

### Common Issues
- **Preview Not Updating**: Check browser cache and reload
- **Image Upload Failures**: Verify image format and size limits
- **Color Changes Not Applying**: Clear browser cache and hard refresh
- **Link Validation Errors**: Ensure URLs are properly formatted

### Debug Information
- Monitor image upload and processing
- Check CSS compilation and minification
- Validate custom link configurations
- Review preview generation performance

## Related Documentation
- [Dashboard Home](../README.md) - Site customizer quick access
- [Team Management](../admin/teams/README.md) - Team branding integration
- [Communications](../communications/README.md) - Branded communication templates